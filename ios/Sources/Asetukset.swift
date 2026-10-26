// Palvelimen osoite (UserDefaults) ja Bearer-avain (Keychain). Avain annetaan äpin asetuksissa, ei koodissa.
// UI-testi antaa molemmat ympäristömuuttujina SCOPES_OSOITE ja SCOPES_AVAIN.
// Keskitetty mallinhallinta (SCOPES-MALLIVALINNAT): sallitut mallit ja oletusmalli.
import Foundation
import Security

final class Asetukset: ObservableObject {
    static let oletusOsoite = "http://192.0.2.11:8787"

    static let oletusMallit: [IstunnonMalli] = [
        IstunnonMalli(nimi: "claude-opus-5-5", kuvaus: "Opus 5.5", ryhma: "Claude"),
        IstunnonMalli(nimi: "claude-sonnet-5-5", kuvaus: "Sonnet 5.5", ryhma: "Claude"),
        IstunnonMalli(nimi: "claude-fable-5-1", kuvaus: "Fable 5.1", ryhma: "Claude"),
        IstunnonMalli(nimi: "claude-haiku-5-5", kuvaus: "Haiku 5.5", ryhma: "Claude"),
        IstunnonMalli(nimi: "mac-agy/gemini-3.8-flash-high", kuvaus: "Gemini 3.8 Flash (High) · macos", ryhma: "Mac AGY"),
        IstunnonMalli(nimi: "mac-agy/gemini-3.8-flash-medium", kuvaus: "Gemini 3.8 Flash (Medium) · macos", ryhma: "Mac AGY"),
        IstunnonMalli(nimi: "mac-agy/gemini-3.8-flash-low", kuvaus: "Gemini 3.8 Flash (Low) · macos", ryhma: "Mac AGY"),
        IstunnonMalli(nimi: "mac-agy/claude-sonnet-4-6", kuvaus: "Claude Sonnet 4.6 · macos", ryhma: "Mac AGY"),
        IstunnonMalli(nimi: "mac-agy/claude-opus-4-6-thinking", kuvaus: "Claude Opus 4.6 (Thinking) · macos", ryhma: "Mac AGY"),
        IstunnonMalli(nimi: "mac-agy/gpt-oss-120b-medium", kuvaus: "GPT-OSS 120B · macos", ryhma: "Mac AGY"),
        IstunnonMalli(nimi: "agy/gemini-3.8-flash-high", kuvaus: "Gemini 3.8 Flash (High) · oneplus linux", ryhma: "OnePlus Linux AGY"),
        IstunnonMalli(nimi: "agy/gemini-3.8-flash-medium", kuvaus: "Gemini 3.8 Flash (Medium) · oneplus linux", ryhma: "OnePlus Linux AGY"),
        IstunnonMalli(nimi: "agy/gemini-3.8-flash-low", kuvaus: "Gemini 3.8 Flash (Low) · oneplus linux", ryhma: "OnePlus Linux AGY"),
        IstunnonMalli(nimi: "agy/claude-sonnet-4-6", kuvaus: "Claude Sonnet 4.6 · oneplus linux", ryhma: "OnePlus Linux AGY"),
        IstunnonMalli(nimi: "agy/claude-opus-4-6-thinking", kuvaus: "Claude Opus 4.6 (Thinking) · oneplus linux", ryhma: "OnePlus Linux AGY"),
        IstunnonMalli(nimi: "agy/gpt-oss-120b-medium", kuvaus: "GPT-OSS 120B · oneplus linux", ryhma: "OnePlus Linux AGY"),
        IstunnonMalli(nimi: "nebius/deepseek-ai/DeepSeek-V4.1-Flash", kuvaus: "DeepSeek V4.1 Flash · Nebius", ryhma: "Nebius"),
        IstunnonMalli(nimi: "nebius/deepseek-ai/DeepSeek-V4-Flash-0731", kuvaus: "DeepSeek V4 Flash · Nebius", ryhma: "Nebius"),
        IstunnonMalli(nimi: "nebius/MiniMaxAI/MiniMax-M3", kuvaus: "MiniMax M3 · Nebius", ryhma: "Nebius"),
    ]

    @Published var osoite: String { didSet { UserDefaults.standard.set(osoite, forKey: "osoite") } }
    @Published var avain: String { didSet { Avainnippu.tallenna(avain) } }

    @Published var kaikkiMallit: [IstunnonMalli]
    @Published var sallitutMallit: Set<String> {
        didSet { UserDefaults.standard.set(Array(sallitutMallit), forKey: "sallitutMallit") }
    }
    @Published var otaUudetMallitAutomaattisesti: Bool {
        didSet { UserDefaults.standard.set(otaUudetMallitAutomaattisesti, forKey: "otaUudetMallitAutomaattisesti") }
    }
    @Published var oletusMalli: String {
        didSet { UserDefaults.standard.set(oletusMalli, forKey: "oletusMalli") }
    }

    init(ymparisto: [String: String] = ProcessInfo.processInfo.environment) {
        osoite = ymparisto["SCOPES_OSOITE"] ?? UserDefaults.standard.string(forKey: "osoite") ?? Self.oletusOsoite
        avain = ymparisto["SCOPES_AVAIN"] ?? Avainnippu.lue() ?? ""

        kaikkiMallit = Self.oletusMallit
        otaUudetMallitAutomaattisesti = UserDefaults.standard.object(forKey: "otaUudetMallitAutomaattisesti") as? Bool ?? true
        oletusMalli = UserDefaults.standard.string(forKey: "oletusMalli") ?? "claude-opus-5-5"

        let tallennetut = UserDefaults.standard.stringArray(forKey: "sallitutMallit")
        if let t = tallennetut {
            sallitutMallit = Set(t)
        } else {
            sallitutMallit = Set(Self.oletusMallit.map(\.nimi))
        }
    }

    var valmis: Bool { !avain.isEmpty && URL(string: osoite) != nil }

    func paivitaMallit(_ uudet: [IstunnonMalli]) {
        guard !uudet.isEmpty else { return }
        kaikkiMallit = uudet
        if otaUudetMallitAutomaattisesti {
            let vanhatTunnetut = Set(UserDefaults.standard.stringArray(forKey: "kaikkiTunnetutMallit") ?? Self.oletusMallit.map(\.nimi))
            var paivitetty = sallitutMallit
            for m in uudet where !vanhatTunnetut.contains(m.nimi) {
                paivitetty.insert(m.nimi)
            }
            sallitutMallit = paivitetty
            UserDefaults.standard.set(uudet.map(\.nimi), forKey: "kaikkiTunnetutMallit")
        }
    }

    var aktiivisetMallit: [IstunnonMalli] {
        let lista = kaikkiMallit.isEmpty ? Self.oletusMallit : kaikkiMallit
        let suodatetut = lista.filter { sallitutMallit.contains($0.nimi) }
        return suodatetut.isEmpty ? lista : suodatetut
    }

    var aktiivisetMallitRyhmittain: [(String, [IstunnonMalli])] {
        let jarjestys = ["Claude", "Mac AGY", "OnePlus Linux AGY", "Nebius", "Paikalliset"]
        var sanakirja: [String: [IstunnonMalli]] = [:]
        for m in aktiivisetMallit {
            let r = m.ryhma ?? "Muut"
            sanakirja[r, default: []].append(m)
        }
        var tulos: [(String, [IstunnonMalli])] = []
        for r in jarjestys {
            if let lista = sanakirja[r], !lista.isEmpty {
                tulos.append((r, lista))
            }
        }
        for (r, lista) in sanakirja where !jarjestys.contains(r) && !lista.isEmpty {
            tulos.append((r, lista))
        }
        return tulos
    }
}

// Tilit: "avain" (Bearer) ja "wg" (äpin WireGuard-tunnelin asetus, Reitti.swift).
enum Avainnippu {
    private static func haku(_ tili: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: "com.example.skoopit", kSecAttrAccount as String: tili]
    }

    static func lue(_ tili: String = "avain") -> String? {
        var kysely = haku(tili)
        kysely[kSecReturnData as String] = true
        var tulos: AnyObject?
        guard SecItemCopyMatching(kysely as CFDictionary, &tulos) == errSecSuccess, let data = tulos as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func tallenna(_ arvo: String, tili: String = "avain") {
        SecItemDelete(haku(tili) as CFDictionary)
        guard !arvo.isEmpty else { return }
        var lisays = haku(tili)
        lisays[kSecValueData as String] = Data(arvo.utf8)
        lisays[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(lisays as CFDictionary, nil)
    }
}
