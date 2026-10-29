import XCTest
@testable import ScopesCore

final class MuistiKeychain: KeychainProvider, @unchecked Sendable {
    private var varasto: [String: String] = [:]

    func haeAvain(palvelu: String, tili: String) throws -> String? {
        varasto["\(palvelu):\(tili)"]
    }

    func tallennaAvain(palvelu: String, tili: String, avain: String) throws {
        varasto["\(palvelu):\(tili)"] = avain
    }

    func poistaAvain(palvelu: String, tili: String) throws {
        varasto.removeValue(forKey: "\(palvelu):\(tili)")
    }
}

final class PlatformProtocolsTests: XCTestCase {
    func testMuistiKeychainToimii() throws {
        let kc = MuistiKeychain()
        try kc.tallennaAvain(palvelu: "scopes", tili: "oletus", avain: "sala123")
        XCTAssertEqual(try kc.haeAvain(palvelu: "scopes", tili: "oletus"), "sala123")
        try kc.poistaAvain(palvelu: "scopes", tili: "oletus")
        XCTAssertNil(try kc.haeAvain(palvelu: "scopes", tili: "oletus"))
    }
}
