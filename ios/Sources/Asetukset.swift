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

enum Avainnippu {
    private static let haku: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: "com.example.skoopit",
        kSecAttrAccount as String: "avain",
    ]

    static func lue() -> String? {
        var kysely = haku
        kysely[kSecReturnData as String] = true
        var tulos: AnyObject?
        guard SecItemCopyMatching(kysely as CFDictionary, &tulos) == errSecSuccess, let data = tulos as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func tallenna(_ avain: String) {
        SecItemDelete(haku as CFDictionary)
        guard !avain.isEmpty else { return }
        var lisays = haku
        lisays[kSecValueData as String] = Data(avain.utf8)
        lisays[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(lisays as CFDictionary, nil)
    }
}
