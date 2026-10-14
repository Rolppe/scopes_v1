// Palvelimen osoite (UserDefaults) ja Bearer-avain (Keychain). Avain annetaan äpin asetuksissa, ei koodissa.
// UI-testi antaa molemmat ympäristömuuttujina SCOPES_OSOITE ja SCOPES_AVAIN.
import Foundation
import Security

final class Asetukset: ObservableObject {
    static let oletusOsoite = "http://192.0.2.11:8787"

    @Published var osoite: String { didSet { UserDefaults.standard.set(osoite, forKey: "osoite") } }
    @Published var avain: String { didSet { Avainnippu.tallenna(avain) } }

    init(ymparisto: [String: String] = ProcessInfo.processInfo.environment) {
        osoite = ymparisto["SCOPES_OSOITE"] ?? UserDefaults.standard.string(forKey: "osoite") ?? Self.oletusOsoite
        avain = ymparisto["SCOPES_AVAIN"] ?? Avainnippu.lue() ?? ""
    }

    var valmis: Bool { !avain.isEmpty && URL(string: osoite) != nil }
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
