// Pyynnöt palveluun Bearer-avaimella: luku GET:llä, hallintatoiminnot POST:lla (DEMO-SCOPES-HALLINTA).
// Virheviesti tulee palvelun `virhe`-kentästä, kun se on.
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
            case let .palvelu(koodi, viesti): return "Palvelu vastasi \(koodi): \(viesti)"
            }
        }
    }

    func skoopit() async throws -> [SkooppiYhteenveto] { try await hae("/api/skoopit") }

    func skooppi(_ nimi: String) async throws -> SkooppiNakyma { try await hae("/api/skoopit/\(koodattu(nimi))") }

    // Istunnon avaus odottaa Remote Controlia jopa 90 s, joten toiminnoilla on pidempi aikaraja.
    func toiminto(_ toiminto: Toiminto, _ nimi: String) async throws -> ToimintoVastaus {
        try await hae("/api/skoopit/\(koodattu(nimi))/\(toiminto.rawValue)", metodi: "POST", aikaraja: 150)
    }

    func uusi(_ nimi: String) async throws -> ToimintoVastaus {
        try await hae("/api/uusi", metodi: "POST", runko: try JSONEncoder().encode(["nimi": nimi]), aikaraja: 150)
    }

    // Chat (DEMO-SCOPES-VALILEHDET): agentin vastaus voi kestää minuutteja.
    func agentit() async throws -> [Agentti] { try await hae("/api/agentit") }

    // Vastaus kirjain kerrallaan (DEMO-SCOPES-SUORATOISTO): palvelu kirjoittaa NDJSON-rivejä sitä mukaa kuin agentti
    // kirjoittaa. Hylkäys ennen agentin käynnistystä tulee tavallisena virhekoodina.
    func chatVirta(agentti: String, viesti: String, keskustelu: String?) async throws -> AsyncThrowingStream<ChatTapahtuma, Error> {
        var runko = ["agentti": agentti, "viesti": viesti]
        if let keskustelu { runko["keskustelu"] = keskustelu }
        return try await virta(try pyynto("/api/chat/virta", metodi: "POST", runko: try JSONEncoder().encode(runko), aikaraja: 300))
    }

    // Uudelleenliittyminen katkenneeseen vastaukseen: ensin tähän asti kirjoitettu teksti yhtenä palana, sitten loput.
    // 404, kun palvelulla ei ole käynnissä olevaa tai juuri valmistunutta vastausta.
    func kaynnissa() async throws -> AsyncThrowingStream<ChatTapahtuma, Error> {
        try await virta(try pyynto("/api/chat/kaynnissa", metodi: "GET", runko: nil, aikaraja: 300))
    }

    private func virta(_ pyynto: URLRequest) async throws -> AsyncThrowingStream<ChatTapahtuma, Error> {
        let (tavut, vastaus) = try await URLSession.shared.bytes(for: pyynto)
        let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
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

    private func pyynto(_ polku: String, metodi: String, runko: Data?, aikaraja: TimeInterval) throws -> URLRequest {
        guard let url = URL(string: osoite.trimmingCharacters(in: CharacterSet(charactersIn: "/ ")) + polku) else { throw Virhe.osoite }
        var pyynto = URLRequest(url: url, timeoutInterval: aikaraja)
        pyynto.httpMethod = metodi
        pyynto.httpBody = runko
        if runko != nil { pyynto.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        pyynto.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        return pyynto
    }

    private func virhe(_ koodi: Int, _ data: Data) -> Virhe {
        .palvelu(koodi, (try? JSONDecoder().decode([String: String].self, from: data))?["virhe"] ?? "tuntematon virhe")
    }

    private func hae<T: Decodable>(_ polku: String, metodi: String = "GET", runko: Data? = nil, aikaraja: TimeInterval = 10) async throws -> T {
        let (data, vastaus) = try await URLSession.shared.data(for: try pyynto(polku, metodi: metodi, runko: runko, aikaraja: aikaraja))
        let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
        guard koodi == 200 else { throw virhe(koodi, data) }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
