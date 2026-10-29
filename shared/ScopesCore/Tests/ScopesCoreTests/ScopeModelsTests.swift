import XCTest
@testable import ScopesCore

final class ScopeModelsTests: XCTestCase {
    func testSkooppiYhteenvetoDekoodaus() throws {
        let json = """
        {
            "nimi": "scopes macos",
            "seuraava": "MACOS-RUNKO",
            "avoimia": 1,
            "vikoja": 0,
            "istuntoja": 0,
            "suurinKonteksti": 12000,
            "aika": "2026-10-17T09:00:00Z",
            "tila": "pakattu"
        }
        """.data(using: .utf8)!

        let skooppi = try JSONDecoder().decode(SkooppiYhteenveto.self, from: json)
        XCTAssertEqual(skooppi.nimi, "scopes macos")
        XCTAssertEqual(skooppi.tilaNyt, "pakattu")
        XCTAssertEqual(skooppi.avoimia, 1)
    }

    func testViestiDekoodaus() throws {
        let json = """
        {
            "rooli": "kayttaja",
            "teksti": "Moi!"
        }
        """.data(using: .utf8)!

        let viesti = try JSONDecoder().decode(Viesti.self, from: json)
        XCTAssertEqual(viesti.rooli, "kayttaja")
        XCTAssertTrue(viesti.omaViesti)
        XCTAssertFalse(viesti.tyokalu)
    }
}
