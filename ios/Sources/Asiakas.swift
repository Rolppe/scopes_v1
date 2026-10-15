// Pyynnöt palveluun Bearer-avaimella: luku GET:llä, hallintatoiminnot POST:lla (DEMO-SCOPES-HALLINTA).
// Virheviesti tulee palvelun `virhe`-kentästä, kun se on, käyttäjän kielelle käännettynä.
import Foundation

struct Asiakas {
    let osoite: String
    let avain: String

    enum Virhe: LocalizedError {
        case osoite
        case palvelu(Int, String)
        var errorDescription: String? {
            switch self {
            case .osoite: return "Palvelimen osoite ei kelpaa."
            case let .palvelu(koodi, viesti): return Asiakas.selkokielinen(koodi, viesti)
            }
        }
    }

    // Palvelun hylkäys käyttäjän kielellä (DESIGN-UX-A U3): ei HTTP-koodeja, tmuxia eikä slash-komentoja. Tunnetut
    // viestit (palvelu/toiminnot.mjs, viestit.mjs) käännetään seuraukseksi ja neuvoksi; tuntematon näytetään sellaisenaan.
    private static let tunnetut: [(String, String)] = [
        ("ei ole tmux-istuntoa", "Skooppi ei ole auki. Avaa se ensin: Pura uuteen istuntoon."),
        ("ei ole auki tmuxissa", "Skooppi ei ole auki. Avaa se ensin: Pura uuteen istuntoon."),
        ("useita tmux-istuntoja", "Skoopilla on auki useampi istunto. Sulje ylimääräiset ja yritä uudelleen."),
        ("tmux-ruutu ei täsmää", "Istuntoa ei tavoitettu. Päivitä näkymä ja yritä uudelleen."),
        ("send-keys epäonnistui", "Viesti ei mennyt istuntoon. Yritä uudelleen."),
        ("pakattu istunto on vielä varattu", "Edellinen istunto tekee vielä töitä. Yritä, kun se on valmis."),
        ("istunto on varattu", "Istunto tekee juuri töitä. Yritä, kun vuoro on valmis."),
        ("jo käynnissä oleva istunto", "Skoopilla on jo istunto auki."),
        ("skooppi on jo olemassa", "Tämän niminen skooppi on jo olemassa."),
        ("toinen toiminto on käynnissä", "Toinen toiminto on vielä kesken. Yritä hetken kuluttua."),
        ("tuntematon skooppi", "Skooppia ei löydy palvelimelta."),
        ("chat-vastaus on vielä kesken", "Edellinen vastaus on vielä tulossa."),
    ]

    static func selkokielinen(_ koodi: Int, _ viesti: String) -> String {
        if let (_, selko) = tunnetut.first(where: { viesti.contains($0.0) }) { return selko }
        if koodi == 401 || koodi == 403 { return "Avain ei kelpaa. Tarkista avain asetuksissa." }
        return viesti.prefix(1).uppercased() + viesti.dropFirst()
    }

    func skoopit() async throws -> [SkooppiYhteenveto] { try await hae("/api/skoopit") }

    func skooppi(_ nimi: String) async throws -> SkooppiNakyma { try await hae("/api/skoopit/\(koodattu(nimi))") }

    func rekisterit() async throws -> [RekisteriTiedosto] { try await hae("/api/rekisterit") }

    func rekisterinOsat(_ polku: String) async throws -> RekisterinOsat { try await hae("/api/rekisterit/\(koodattu(polku))") }

    // Istunnon avaus odottaa Remote Controlia jopa 90 s, joten toiminnoilla on pidempi aikaraja.
    func toiminto(_ toiminto: Toiminto, _ nimi: String) async throws -> ToimintoVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/\(toiminto.rawValue)", metodi: "POST", aikaraja: 150)
    }

    // Rekisterisynkka (LOCALREGISTER-APPI, Lr.swift; palvelinpää scopes/localregister/palvelu.mjs). Ensimmäinen haku
    // tuo koko kaksoiskappaleen (~5 500 yksikköä), ja tiivistekysely voi odottaa palvelun uudelleentuontia: pidempi raja.
    func lrTiivisteet() async throws -> LrTiivisteet { try await hae("/api/lr/tiiviste", aikaraja: 30) }

    func lrListat(_ rekisterit: [String]) async throws -> [String: LrLista] {
        try await hae("/api/lr/listat", metodi: "POST", runko: try JSONEncoder().encode(["rekisterit": rekisterit]), aikaraja: 60)
    }

    func lrHae(_ rekisteri: String, _ idt: [String]) async throws -> [LrYksikko] {
        struct Runko: Encodable { let rekisteri: String; let idt: [String] }
        let v: LrHaku = try await hae("/api/lr/hae", metodi: "POST", runko: try JSONEncoder().encode(Runko(rekisteri: rekisteri, idt: idt)), aikaraja: 60)
        return v.yksikot
    }

    func lrLaheta(_ yksikot: [LrYksikko]) async throws -> LrLahetys {
        struct Runko: Encodable { let metat: [LrMeta]; let yksikot: [LrYksikko] }
        return try await hae("/api/lr/laheta", metodi: "POST", runko: try JSONEncoder().encode(Runko(metat: [], yksikot: yksikot)), aikaraja: 60)
    }

    // Pakkauskytkimet (käyttäjä 14.10.2026): vanha palvelu ilman reittiä vastaa 404, jolloin näkymä piilottaa kytkimet.
    func pakkausKytkimet() async throws -> PakkausKytkimet { try await hae("/api/asetukset") }

    func aseta(_ kytkin: PakkausKytkin, paalle: Bool) async throws -> PakkausKytkimet {
        try await hae("/api/asetukset/\(kytkin.rawValue)/\(paalle ? "paalle" : "pois")", metodi: "POST")
    }

    // Ilmoitusvahdin asetukset ja koe (NOTIFICATIONS-HA-PUSH 15.10.2026): ilmoitukset lähettää palvelin HA:n kautta.
    func ilmoitusAsetukset() async throws -> IlmoitusArvot { try await hae("/api/ilmoitukset") }

    func asetaIlmoitukset(_ a: IlmoitusArvot) async throws -> IlmoitusArvot {
        try await hae("/api/ilmoitukset", metodi: "POST", runko: try JSONEncoder().encode(a))
    }

    func koeIlmoitus() async throws -> KoeVastaus { try await hae("/api/ilmoitukset/koe", metodi: "POST", aikaraja: 15) }

    func uusi(_ nimi: String) async throws -> ToimintoVastaus {
        try await hae("/api/uusi", metodi: "POST", runko: try JSONEncoder().encode(["nimi": nimi]), aikaraja: 150)
    }

    // Chat (DEMO-SCOPES-VALILEHDET): agentin vastaus voi kestää minuutteja.
    func agentit() async throws -> [Agentti] { try await hae("/api/agentit") }

    func kayttoraja() async throws -> Kayttoraja { try await hae("/api/kayttoraja") }

    // Vastaus kirjain kerrallaan (DEMO-SCOPES-SUORATOISTO): palvelu kirjoittaa NDJSON-rivejä sitä mukaa kuin agentti
    // kirjoittaa. Hylkäys ennen agentin käynnistystä tulee tavallisena virhekoodina.
    func chatVirta(agentti: String, viesti: String, keskustelu: String?) async throws -> AsyncThrowingStream<ChatTapahtuma, Error> {
        var runko = ["agentti": agentti, "viesti": viesti]
        if let keskustelu { runko["keskustelu"] = keskustelu }
        return try await virta(try await pyynto("/api/chat/virta", metodi: "POST", runko: try JSONEncoder().encode(runko), aikaraja: 300))
    }

    // Uudelleenliittyminen katkenneeseen vastaukseen: ensin tähän asti kirjoitettu teksti yhtenä palana, sitten loput.
    // 404, kun palvelulla ei ole käynnissä olevaa tai juuri valmistunutta vastausta.
    func kaynnissa() async throws -> AsyncThrowingStream<ChatTapahtuma, Error> {
        try await virta(try await pyynto("/api/chat/kaynnissa", metodi: "GET", runko: nil, aikaraja: 300))
    }

    private func virta(_ pyynto: URLRequest) async throws -> AsyncThrowingStream<ChatTapahtuma, Error> {
        let id = Diagnostiikka.jaettu.alkoi(pyynto.url?.path ?? "")
        let tavut: URLSession.AsyncBytes, vastaus: URLResponse
        do { (tavut, vastaus) = try await reititetty { try await URLSession.shared.bytes(for: pyynto) } } catch {
            Diagnostiikka.jaettu.paattyi(id, virhe: error)
            throw error
        }
        let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
        Diagnostiikka.jaettu.paattyi(id, koodi: koodi)
        guard koodi == 200 else {
            var data = Data()
            for try await tavu in tavut { data.append(tavu) }
            throw virhe(koodi, data)
        }
        return AsyncThrowingStream { jatko in
            let tehtava = Task {
                do {
                    for try await rivi in tavut.lines where !rivi.isEmpty {
                        jatko.yield(try JSONDecoder().decode(ChatTapahtuma.self, from: Data(rivi.utf8)))
                    }
                    jatko.finish()
                } catch {
                    jatko.finish(throwing: error)
                }
            }
            jatko.onTermination = { _ in tehtava.cancel() }
        }
    }

    func keskustelut() async throws -> [ChatKeskustelu] { try await hae("/api/chat/keskustelut") }

    func keskustelu(_ id: String) async throws -> ChatKeskustelunViestit { try await hae("/api/chat/keskustelut/\(koodattu(id))") }

    func viestit(_ nimi: String) async throws -> SkooppiViestit { try await hae("/api/skoopit/\(koodattu(nimi))/viestit") }

    func laheta(_ nimi: String, _ teksti: String) async throws -> LahetysVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/viesti", metodi: "POST", runko: try JSONEncoder().encode(["teksti": teksti]))
    }

    // Liite raakarunkona; palvelu tallentaa sen ja palauttaa polun (liitteet.mjs). Iso kuva hitaalla yhteydellä: 120 s.
    func lahetaLiite(_ nimi: String, _ liite: Liite) async throws -> LiiteVastaus {
        let tiedosto = liite.nimi.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? "liite"
        return try await hae("/api/skoopit/\(koodattu(nimi))/liite?nimi=\(tiedosto)", metodi: "POST", runko: liite.data,
                             tyyppi: "application/octet-stream", aikaraja: 120)
    }

    // Jumi- ja pyyntötapahtumat palvelun äppilokiin (Diagnostiikka.swift).
    func diagnostiikka(_ runko: Data) async throws -> DiagnostiikkaVastaus {
        try await hae(Diagnostiikka.polku, metodi: "POST", runko: runko, aikaraja: 20)
    }

    // Stop-nappi (CHAT-STOP): palvelu katkaisee chatin vastauksen, jolloin virta päättyy osittaiseen vastaukseen.
    func pysaytaChat() async throws -> PysaytysVastaus { try await hae("/api/chat/stop", metodi: "POST", runko: nil) }

    // Skoopin stop-nappi: palvelu keskeyttää työskentelevän istunnon Escapella.
    func pysayta(_ nimi: String) async throws -> LahetysVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/stop", metodi: "POST", runko: nil)
    }

    // Kortin X: palvelu sulkee auki olevan monivalinnan Escapella.
    func suljeKysymys(_ nimi: String) async throws -> LahetysVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/kysymys-pois", metodi: "POST", runko: nil)
    }

    // Verkon katkos (näyttölukko, äpin vaihto, WireGuard poissa) eikä palvelun vastaus: äppi tarjoaa uudelleenyhdistämisen.
    static func yhteysKatkesi(_ virhe: Error) -> Bool {
        guard let u = virhe as? URLError else { return false }
        return [.networkConnectionLost, .notConnectedToInternet, .timedOut, .cannotConnectToHost, .cannotFindHost,
                .dnsLookupFailed, .dataNotAllowed, .internationalRoamingOff, .callIsActive, .backgroundSessionWasDisconnected].contains(u.code)
    }

    private func koodattu(_ nimi: String) -> String {
        nimi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed.subtracting(CharacterSet(charactersIn: "/&"))) ?? nimi
    }

    // Katkos unohtaa reitin: seuraava pyyntö kokeilee kotiverkkoa ja tunnelia uudelleen (Reitti.swift).
    private func reititetty<T>(_ tee: () async throws -> T) async throws -> T {
        do { return try await tee() } catch {
            if Self.yhteysKatkesi(error) { await Reitti.jaettu.unohda() }
            throw error
        }
    }

    private func pyynto(_ polku: String, metodi: String, runko: Data?, tyyppi: String = "application/json", aikaraja: TimeInterval) async throws -> URLRequest {
        let osoite = await Reitti.jaettu.osoite(self.osoite, avain: avain)
        guard let url = URL(string: osoite.trimmingCharacters(in: CharacterSet(charactersIn: "/ ")) + polku) else { throw Virhe.osoite }
        var pyynto = URLRequest(url: url, timeoutInterval: aikaraja)
        pyynto.httpMethod = metodi
        pyynto.httpBody = runko
        if runko != nil { pyynto.setValue(tyyppi, forHTTPHeaderField: "Content-Type") }
        pyynto.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        return pyynto
    }

    private func virhe(_ koodi: Int, _ data: Data) -> Virhe {
        .palvelu(koodi, (try? JSONDecoder().decode([String: String].self, from: data))?["virhe"] ?? "tuntematon virhe")
    }

    private func hae<T: Decodable>(_ polku: String, metodi: String = "GET", runko: Data? = nil, tyyppi: String = "application/json",
                                   aikaraja: TimeInterval = 10) async throws -> T {
        let p = try await pyynto(polku, metodi: metodi, runko: runko, tyyppi: tyyppi, aikaraja: aikaraja)
        let id = Diagnostiikka.jaettu.alkoi(polku)
        let data: Data, vastaus: URLResponse
        do { (data, vastaus) = try await reititetty { try await URLSession.shared.data(for: p) } } catch {
            Diagnostiikka.jaettu.paattyi(id, virhe: error)
            throw error
        }
        let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
        Diagnostiikka.jaettu.paattyi(id, koodi: koodi)
        guard koodi == 200 else { throw virhe(koodi, data) }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
