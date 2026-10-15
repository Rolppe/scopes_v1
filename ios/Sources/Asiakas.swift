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
    // Purun valinta (SCOPES-PURA-MALLI) kulkee runkona; ilman sitä palvelu käyttää oletuksia.
    func toiminto(_ toiminto: Toiminto, _ nimi: String, valinta: PuraValinta? = nil) async throws -> ToimintoVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/\(toiminto.rawValue)", metodi: "POST",
                      runko: try valinta.map { try JSONEncoder().encode($0) }, aikaraja: 150)
    }

    // agy models ja palvelimen LM Studio voivat viedä sekunteja (agy välimuistissa 10 min).
    func purkuValinnat() async throws -> PurkuValinnat { try await hae("/api/purkajat", aikaraja: 30) }

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

    // palvelin (SCOPES-LINUX-NAPIT): vanha palvelu vastaa 404, jolloin Infra-sivu piilottaa osion. Herätys odottaa,
    // kunnes PC vastaa (palvelussa enintään 90 s + kertaboot), siksi pitkä aikaraja.
    func linuxServer() async throws -> LinuxTila { try await hae("/api/palvelin") }

    func linuxServer(_ toiminto: LinuxToiminto) async throws -> LinuxVastaus {
        try await hae("/api/palvelin/\(toiminto.rawValue)", metodi: "POST", aikaraja: 150)
    }

    // Android-puolen Gemini (SCOPES-ANDROID-GEMINI, Android.swift; palvelinpää palvelu/android.mjs). Vanha palvelu vastaa
    // 404 "tuntematon polku", jolloin näkymä sanoo, ettei palvelin tue ohjausta. Palvelin sarjallistaa toiminnot ja
    // kirjoitus ja liite voivat viedä 10–15 s, joten toiminnoilla on pitkä aikaraja; ruutu 10 s.
    func androidRuutu(leveys: Int = 720) async throws -> Data { try await tavut("/api/android/ruutu?leveys=\(leveys)", aikaraja: 10) }

    func android(_ toiminto: String, _ runko: some Encodable) async throws -> AndroidVastaus {
        try await hae("/api/android/\(toiminto)", metodi: "POST", runko: try JSONEncoder().encode(runko), aikaraja: 150)
    }

    func android(_ toiminto: String) async throws -> AndroidVastaus {
        try await hae("/api/android/\(toiminto)", metodi: "POST", aikaraja: 150)
    }

    func androidLiite(_ liite: Liite) async throws -> AndroidVastaus {
        let tiedosto = liite.nimi.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? "liite"
        return try await hae("/api/android/liite?nimi=\(tiedosto)", metodi: "POST", runko: liite.data,
                             tyyppi: "application/octet-stream", aikaraja: 150)
    }

    func androidTuotokset() async throws -> [AndroidTuotos] {
        let v: AndroidTuotokset = try await hae("/api/android/tuotokset", aikaraja: 30)
        return v.tiedostot
    }

    func androidTuotos(_ polku: String) async throws -> Data {
        let p = polku.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? polku
        return try await tavut("/api/android/tuotos?polku=\(p)", aikaraja: 150)
    }

    // Uusi skooppi saa purun valinnat (SCOPES-LISTA-UUSI-VALINNAT); tyhjä kenttä jää pois, jolloin palvelu käyttää oletusta.
    func uusi(_ nimi: String, valinta: PuraValinta? = nil) async throws -> ToimintoVastaus {
        struct Runko: Encodable { let nimi: String; let purkaja: String?; let malli: String? }
        return try await hae("/api/uusi", metodi: "POST", runko: try JSONEncoder().encode(Runko(nimi: nimi, purkaja: valinta?.purkaja, malli: valinta?.malli)),
                             aikaraja: 150)
    }

    // Arkistointi (SCOPES-LISTA-POISTO): palvelu committoi ja asentaa reitittimen, joten aikaraja on toimintojen luokkaa.
    func arkistoi(_ nimi: String) async throws -> ArkistointiVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/arkistoi", metodi: "POST", runko: nil, aikaraja: 150)
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
        let id = Diagnostiikka.jaettu.alkoi(pyynto.url?.path ?? "", url: pyynto.url)
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
        // Palvelu odottaa istunnon kuittausta; 15.10.2026 se kesti yli 10 s, ja äppi näytti virheen perille menneestä viestistä.
        try await hae("/api/skoopit/\(koodattu(nimi))/viesti", metodi: "POST", runko: try JSONEncoder().encode(["teksti": teksti]),
                      aikaraja: 30)
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
            if Self.yhteysKatkesi(error) { await Reitti.jaettu.unohda(error) }
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

    // Binäärivastaus (JPEG, tuotostiedosto): sama reitti, avain ja diagnostiikka kuin hae(), mutta tavut sellaisenaan.
    private func tavut(_ polku: String, aikaraja: TimeInterval) async throws -> Data {
        let p = try await pyynto(polku, metodi: "GET", runko: nil, aikaraja: aikaraja)
        let id = Diagnostiikka.jaettu.alkoi(polku, url: p.url)
        let data: Data, vastaus: URLResponse
        do { (data, vastaus) = try await reititetty { try await URLSession.shared.data(for: p) } } catch {
            Diagnostiikka.jaettu.paattyi(id, virhe: error)
            throw error
        }
        let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
        Diagnostiikka.jaettu.paattyi(id, koodi: koodi)
        guard koodi == 200 else { throw virhe(koodi, data) }
        return data
    }

    // GET yritetään katkoksen jälkeen kerran uudelleen uudella reitillä (V-487: hetkellinen Wi-Fi-katko näkyi virheenä,
    // vaikka yhteys palasi itsestään). POSTia ei toisteta: viesti voisi mennä perille kahdesti.
    private func hae<T: Decodable>(_ polku: String, metodi: String = "GET", runko: Data? = nil, tyyppi: String = "application/json",
                                   aikaraja: TimeInterval = 10, uusinta: Bool = false) async throws -> T {
        let p = try await pyynto(polku, metodi: metodi, runko: runko, tyyppi: tyyppi, aikaraja: aikaraja)
        let id = Diagnostiikka.jaettu.alkoi(polku, url: p.url, uusinta: uusinta)
        let data: Data, vastaus: URLResponse
        do { (data, vastaus) = try await reititetty { try await URLSession.shared.data(for: p) } } catch {
            Diagnostiikka.jaettu.paattyi(id, virhe: error)
            if metodi == "GET" && !uusinta && Self.yhteysKatkesi(error) && !Task.isCancelled {
                return try await hae(polku, metodi: metodi, runko: runko, tyyppi: tyyppi, aikaraja: aikaraja, uusinta: true)
            }
            throw error
        }
        let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
        Diagnostiikka.jaettu.paattyi(id, koodi: koodi)
        guard koodi == 200 else { throw virhe(koodi, data) }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
