import Foundation
import Security
import ScopesCore

public final class MacKeychain: KeychainProvider, @unchecked Sendable {
    public static let jaettu = MacKeychain()

    public init() {}

    private func haku(palvelu: String, tili: String) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: palvelu,
            kSecAttrAccount as String: tili
        ]
    }

    public func haeAvain(palvelu: String, tili: String) throws -> String? {
        var kysely = haku(palvelu: palvelu, tili: tili)
        kysely[kSecReturnData as String] = true
        var tulos: AnyObject?
        let tila = SecItemCopyMatching(kysely as CFDictionary, &tulos)
        guard tila == errSecSuccess, let data = tulos as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    public func tallennaAvain(palvelu: String, tili: String, avain: String) throws {
        SecItemDelete(haku(palvelu: palvelu, tili: tili) as CFDictionary)
        guard !avain.isEmpty else { return }
        var lisays = haku(palvelu: palvelu, tili: tili)
        lisays[kSecValueData as String] = Data(avain.utf8)
        lisays[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(lisays as CFDictionary, nil)
    }

    public func poistaAvain(palvelu: String, tili: String) throws {
        SecItemDelete(haku(palvelu: palvelu, tili: tili) as CFDictionary)
    }
}
