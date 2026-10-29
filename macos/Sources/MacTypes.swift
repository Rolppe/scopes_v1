// MacTypes.swift - macOS Scopes types & client extensions
import Foundation
import SwiftUI
import ScopesCore

public enum MacPaanakyma: String, CaseIterable, Identifiable, Sendable {
    case kordinaattori = "Koordinaattori"
    case skoopit = "Skoopit"
    case chat = "Chat"
    case infra = "Infra"
    case android = "Android"
    case localregister = "Localregister"
    case viat = "Viat"

    public var id: String { rawValue }

    public var ikoni: String {
        switch self {
        case .kordinaattori: return "person.3.sequence"
        case .skoopit: return "folder"
        case .chat: return "bubble.left.and.bubble.right"
        case .infra: return "point.3.connected.trianglepath.dotted"
        case .android: return "iphone"
        case .localregister: return "arrow.triangle.2.circlepath"
        case .viat: return "ladybug"
        }
    }
}

// VikaKohta tuodaan ScopesCore-moduulista

public struct AsiaKohta: Identifiable, Hashable, Sendable, Codable {
    public let asia: String
    public let tila: String
    public let seuraavaAskel: String?
    public var id: String { asia }

    public init(asia: String, tila: String = "avoin", seuraavaAskel: String? = nil) {
        self.asia = asia
        self.tila = tila
        self.seuraavaAskel = seuraavaAskel
    }
}

public struct KontekstiOsa: Identifiable, Hashable, Sendable, Codable {
    public let otsikko: String
    public let teksti: String
    public var id: String { otsikko }

    public init(otsikko: String, teksti: String) {
        self.otsikko = otsikko
        self.teksti = teksti
    }
}

public struct RekisterinOsat: Hashable, Sendable, Codable {
    public let polku: String
    public let osat: [KontekstiOsa]

    public init(polku: String, osat: [KontekstiOsa]) {
        self.polku = polku
        self.osat = osat
    }
}

public struct RekisteriTiedosto: Identifiable, Hashable, Sendable, Codable {
    public let polku: String
    public let laji: String?
    public let skoopit: [String]?
    public let tavut: Int
    public let raja: Int?
    public let tokenit: Int
    public var id: String { polku }
    public var aste: Int? {
        guard let raja, raja > 0 else { return nil }
        return Int((Double(tavut) * 100 / Double(raja)).rounded())
    }

    public init(polku: String, laji: String? = nil, skoopit: [String]? = nil, tavut: Int, raja: Int? = nil, tokenit: Int = 0) {
        self.polku = polku
        self.laji = laji
        self.skoopit = skoopit
        self.tavut = tavut
        self.raja = raja
        self.tokenit = tokenit
    }
}

public struct SkooppiTiedot: Hashable, Sendable, Codable {
    public let nimi: String
    public let rekisterit: [String]?
    public let seuraava: String?
    public let avoimet: [AsiaKohta]?
    public let viat: [VikaKohta]?
    public let istunnot: [Istunto]?
    public let konteksti: Konteksti?

    public init(nimi: String, rekisterit: [String]? = nil, seuraava: String? = nil, avoimet: [AsiaKohta]? = nil, viat: [VikaKohta]? = nil, istunnot: [Istunto]? = nil, konteksti: Konteksti? = nil) {
        self.nimi = nimi
        self.rekisterit = rekisterit
        self.seuraava = seuraava
        self.avoimet = avoimet
        self.viat = viat
        self.istunnot = istunnot
        self.konteksti = konteksti
    }
}

public struct LinuxTila: Hashable, Sendable, Codable {
    public let tila: String
    public let osoite: String?
    public let lmStudio: String?
    public let lmStudioMalli: String?

    public init(tila: String, osoite: String? = nil, lmStudio: String? = nil, lmStudioMalli: String? = nil) {
        self.tila = tila
        self.osoite = osoite
        self.lmStudio = lmStudio
        self.lmStudioMalli = lmStudioMalli
    }
}

public struct AndroidTila: Hashable, Sendable, Codable {
    public let hereilla: Bool?
    public let heratimme: Bool?
    public let koko: [Int]?
    public let kuiva: Bool?

    public init(hereilla: Bool? = nil, heratimme: Bool? = nil, koko: [Int]? = nil, kuiva: Bool? = nil) {
        self.hereilla = hereilla
        self.heratimme = heratimme
        self.koko = koko
        self.kuiva = kuiva
    }
}

public struct AndroidVastaus: Hashable, Sendable, Codable {
    public let ok: Bool?
    public let tila: String?
    public let virhe: String?

    public init(ok: Bool? = nil, tila: String? = nil, virhe: String? = nil) {
        self.ok = ok
        self.tila = tila
        self.virhe = virhe
    }
}

public struct ChatKeskusteluVastaus: Hashable, Sendable, Codable {
    public let vastaus: String?
    public let keskustelu: String?

    public init(vastaus: String? = nil, keskustelu: String? = nil) {
        self.vastaus = vastaus
        self.keskustelu = keskustelu
    }
}

public struct SkooppiSolmu: Identifiable, Hashable, Sendable {
    public let skooppi: SkooppiYhteenveto
    public var lapset: [SkooppiSolmu]?
    public var id: String { skooppi.nimi }

    public init(skooppi: SkooppiYhteenveto, lapset: [SkooppiSolmu]? = nil) {
        self.skooppi = skooppi
        self.lapset = lapset
    }
}

public func skooppiPuu(_ skoopit: [SkooppiYhteenveto]) -> [SkooppiSolmu] {
    let nimet = Set(skoopit.map(\.nimi))
    func vanhempi(_ nimi: String) -> String? {
        var sanat = nimi.split(separator: " ")
        while sanat.count > 1 {
            sanat.removeLast()
            let ehdokas = sanat.joined(separator: " ")
            if nimet.contains(ehdokas) { return ehdokas }
        }
        return nil
    }
    func solmu(_ s: SkooppiYhteenveto) -> SkooppiSolmu {
        let lapset = skoopit.filter { vanhempi($0.nimi) == s.nimi }.sorted { $0.nimi < $1.nimi }.map(solmu)
        return SkooppiSolmu(skooppi: s, lapset: lapset.isEmpty ? nil : lapset)
    }
    return skoopit.filter { vanhempi($0.nimi) == nil }.sorted { $0.nimi < $1.nimi }.map(solmu)
}

// ScopesClient laajennukset
extension ScopesClient {
    public func skooppiTiedot(skooppi: String) async throws -> SkooppiTiedot {
        let koodattu = skooppi.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? skooppi
        struct RaakaSkooppi: Decodable {
            let nimi: String
            let rekisterit: [String]?
            let seuraava: RaakaSeuraava?
            let avoimet: [RaakaRivi]?
            let viat: [RaakaRivi]?
            let istunnot: [Istunto]?
            let konteksti: Konteksti?
        }
        struct RaakaSeuraava: Decodable {
            let id: String?
            let kuvaus: String?
        }
        struct RaakaRivi: Decodable {
            let solut: [String: String]?
            var asia: String { solut?["Asia"] ?? solut?["Vika"] ?? "" }
            var tila: String { solut?["Tila"] ?? "" }
            var seuraavaAskel: String? { solut?["Seuraava askel"] }
        }

        let raaka: RaakaSkooppi = try await haeGeneric("/api/skoopit/\(koodattu)")
        let sTeksti = raaka.seuraava?.kuvaus ?? raaka.seuraava?.id
        let avoimet = raaka.avoimet?.map { AsiaKohta(asia: $0.asia, tila: $0.tila, seuraavaAskel: $0.seuraavaAskel) }
        let viat = raaka.viat?.map { VikaKohta(vika: $0.asia, tila: $0.tila) }

        return SkooppiTiedot(
            nimi: raaka.nimi,
            rekisterit: raaka.rekisterit,
            seuraava: sTeksti,
            avoimet: avoimet,
            viat: viat,
            istunnot: raaka.istunnot,
            konteksti: raaka.konteksti
        )
    }

    public func rekisteri(polku: String) async throws -> RekisterinOsat {
        let koodattu = polku.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? polku
        return try await haeGeneric("/api/rekisterit/\(koodattu)")
    }

    public func rekisterit() async throws -> [RekisteriTiedosto] {
        return try await haeGeneric("/api/rekisterit")
    }

    public func purkuValinnat() async throws -> PurkuValinnat {
        return try await haeGeneric("/api/purkajat")
    }

    public func chatKeskustelut() async throws -> [ChatKeskustelu] {
        return try await haeGeneric("/api/chat/keskustelut")
    }

    public func chatViestit(id: String) async throws -> ChatKeskustelunViestit {
        let koodattu = id.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? id
        return try await haeGeneric("/api/chat/keskustelut/\(koodattu)")
    }

    public func agentit() async throws -> [Agentti] {
        return try await haeGeneric("/api/agentit")
    }

    public func chatLaheta(teksti: String, agentti: String? = nil, keskustelu: String? = nil) async throws -> ChatKeskusteluVastaus {
        var runko: [String: String] = ["viesti": teksti]
        if let agentti { runko["agentti"] = agentti }
        if let keskustelu { runko["keskustelu"] = keskustelu }
        let data = try JSONEncoder().encode(runko)
        return try await haeGeneric("/api/chat", metodi: "POST", runko: data)
    }

    public func linuxServer() async throws -> LinuxTila {
        return try await haeGeneric("/api/palvelin")
    }

    public func linuxToiminto(_ toiminto: String) async throws -> ToimintoVastaus {
        return try await haeGeneric("/api/palvelin/\(toiminto)", metodi: "POST")
    }

    public func androidTila() async throws -> AndroidTila {
        return try await haeGeneric("/api/android")
    }

    public func androidRuutu(leveys: Int = 720) async throws -> Data {
        let siisti = osoite.trimmingCharacters(in: CharacterSet(charactersIn: "/ "))
        guard let url = URL(string: "\(siisti)/api/android/ruutu?leveys=\(leveys)") else {
            throw ScopesClient.Virhe.osoite
        }
        var req = URLRequest(url: url)
        req.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        let (data, response) = try await session.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else {
            throw ScopesClient.Virhe.palvelu(status, "Ruudun haku epäonnistui (\(status))")
        }
        return data
    }

    public func androidToiminto(_ toiminto: String, runko: [String: String]? = nil) async throws -> AndroidVastaus {
        let data = try runko.map { try JSONEncoder().encode($0) }
        return try await haeGeneric("/api/android/\(toiminto)", metodi: "POST", runko: data)
    }

    public func lrTiivisteet() async throws -> [String: String] {
        return try await haeGeneric("/api/lr/tiiviste")
    }

    private func haeGeneric<T: Decodable>(_ polku: String, metodi: String = "GET", runko: Data? = nil) async throws -> T {
        let siisti = osoite.trimmingCharacters(in: CharacterSet(charactersIn: "/ "))
        guard let url = URL(string: "\(siisti)\(polku)") else { throw ScopesClient.Virhe.osoite }
        var req = URLRequest(url: url)
        req.httpMethod = metodi
        req.httpBody = runko
        if runko != nil { req.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        req.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        let (data, response) = try await session.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else {
            let msg = (try? JSONDecoder().decode([String: String].self, from: data))?["virhe"] ?? "Virhe \(status)"
            throw ScopesClient.Virhe.palvelu(status, msg)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
