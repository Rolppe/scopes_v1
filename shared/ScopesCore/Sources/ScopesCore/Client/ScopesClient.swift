import Foundation

public struct ScopesClient: Sendable {
    public let osoite: String
    public let avain: String
    public let session: URLSession

    public enum Virhe: LocalizedError, Sendable {
        case osoite
        case palvelu(Int, String)

        public var errorDescription: String? {
            switch self {
            case .osoite: return "Palvelimen osoite ei kelpaa."
            case let .palvelu(koodi, viesti): return "Palveluvirhe (\(koodi)): \(viesti)"
            }
        }
    }

    public init(osoite: String, avain: String, session: URLSession = .shared) {
        self.osoite = osoite
        self.avain = avain
        self.session = session
    }

    public func skoopit() async throws -> [SkooppiYhteenveto] {
        try await hae("/api/skoopit")
    }

    public func viestit(skooppi: String) async throws -> SkooppiViestit {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        return try await hae("/api/skoopit/\(koodattu)/viestit")
    }

    public func laheta(skooppi: String, teksti: String) async throws -> LahetysVastaus {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        let runko = try JSONEncoder().encode(["teksti": teksti])
        return try await hae("/api/skoopit/\(koodattu)/viesti", metodi: "POST", runko: runko)
    }

    public func suoratoistaViesti(skooppi: String, teksti: String) -> AsyncThrowingStream<ChatTapahtuma, Error> {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        return AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    let runko = try JSONEncoder().encode(["teksti": teksti])
                    var req = try pyynto("/api/skoopit/\(koodattu)/stream", metodi: "POST", runko: runko)
                    req.setValue("application/x-ndjson", forHTTPHeaderField: "Accept")

                    let (bytes, response) = try await session.bytes(for: req)
                    let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0
                    guard statusCode == 200 else {
                        throw Virhe.palvelu(statusCode, "Suoratoistovirhe (\(statusCode))")
                    }

                    for try await line in bytes.lines {
                        let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { continue }
                        let tapahtuma = try JSONDecoder().decode(ChatTapahtuma.self, from: Data(trimmed.utf8))
                        continuation.yield(tapahtuma)
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            continuation.onTermination = { _ in
                task.cancel()
            }
        }
    }

    public func toiminto(skooppi: String, toiminto: String, runko: [String: String]? = nil) async throws -> ToimintoVastaus {
        let koodattuSkooppi = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        let koodattuToiminto = toiminto.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? toiminto
        let data = try runko.map { try JSONEncoder().encode($0) }
        return try await hae("/api/skoopit/\(koodattuSkooppi)/\(koodattuToiminto)", metodi: "POST", runko: data)
    }

    public func viat() async throws -> [VikaKohta] {
        struct Vastaus: Decodable { let viat: [VikaKohta] }
        let v: Vastaus = try await hae("/api/viat")
        return v.viat
    }

    public func diagnostiikka() async throws -> DiagnostiikkaTila {
        return try await hae("/api/diagnostiikka")
    }

    public func pysayta(skooppi: String) async throws -> LahetysVastaus {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        return try await hae("/api/skoopit/\(koodattu)/stop", metodi: "POST")
    }

    public func kayttoraja(skooppi: String? = nil, tyyppi: String? = nil, agentti: String? = nil, ryhma: String? = nil, ymparisto: String? = nil) async throws -> Kayttoraja {
        var queryItems: [String] = []
        if let skooppi { queryItems.append("skooppi=\(skooppi.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? skooppi)") }
        if let tyyppi { queryItems.append("tyyppi=\(tyyppi.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? tyyppi)") }
        if let agentti { queryItems.append("agentti=\(agentti.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? agentti)") }
        if let ryhma { queryItems.append("ryhma=\(ryhma.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ryhma)") }
        if let ymparisto { queryItems.append("ymparisto=\(ymparisto.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ymparisto)") }
        let qs = queryItems.isEmpty ? "" : "?\(queryItems.joined(separator: "&"))"
        return try await hae("/api/kayttoraja\(qs)")
    }

    public func kayttorajatKaikki() async throws -> KayttorajatKaikki {
        return try await hae("/api/kayttorajat-kaikki")
    }

    public func vaihdaMalli(skooppi: String, malli: String?, effort: String?) async throws -> LahetysVastaus {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        var runkoDict: [String: String] = [:]
        if let malli { runkoDict["malli"] = malli }
        if let effort { runkoDict["effort"] = effort }
        let runko = try JSONEncoder().encode(runkoDict)
        return try await hae("/api/skoopit/\(koodattu)/malli", metodi: "POST", runko: runko)
    }

    // Liite raakarunkona; palvelu tallentaa sen palvelimelle ja palauttaa polun, jonka istunto voi lukea (MAC-17).
    public func lahetaLiite(skooppi: String, nimi: String, data: Data) async throws -> LiiteVastaus {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        let tiedosto = nimi.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? "liite"
        return try await hae("/api/skoopit/\(koodattu)/liite?nimi=\(tiedosto)", metodi: "POST", runko: data,
                             tyyppi: "application/octet-stream", aikaraja: 120)
    }

    public func suljeKysymys(skooppi: String) async throws -> LahetysVastaus {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        return try await hae("/api/skoopit/\(koodattu)/kysymys-pois", metodi: "POST")
    }

    private func pyynto(_ polku: String, metodi: String = "GET", runko: Data? = nil, tyyppi: String = "application/json") throws -> URLRequest {
        let siistiOsoite = osoite.trimmingCharacters(in: CharacterSet(charactersIn: "/ "))
        guard let url = URL(string: "\(siistiOsoite)\(polku)") else { throw Virhe.osoite }
        var req = URLRequest(url: url)
        req.httpMethod = metodi
        req.httpBody = runko
        if runko != nil { req.setValue(tyyppi, forHTTPHeaderField: "Content-Type") }
        req.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        return req
    }

    private func hae<T: Decodable>(_ polku: String, metodi: String = "GET", runko: Data? = nil,
                                   tyyppi: String = "application/json", aikaraja: TimeInterval? = nil) async throws -> T {
        var req = try pyynto(polku, metodi: metodi, runko: runko, tyyppi: tyyppi)
        if let aikaraja { req.timeoutInterval = aikaraja }
        let (data, response) = try await session.data(for: req)
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard statusCode == 200 else {
            let msg = (try? JSONDecoder().decode([String: String].self, from: data))?["virhe"] ?? "Virhe \(statusCode)"
            throw Virhe.palvelu(statusCode, msg)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
