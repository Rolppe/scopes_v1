import XCTest
@testable import ScopesCore

final class NDJSONStreamTests: XCTestCase {
    func testParsiiChatTapahtumatOnnistuneesti() throws {
        let ndjson = """
        {"tyyppi": "pala", "teksti": "Hei"}
        {"tyyppi": "pala", "teksti": " maailma!"}
        {"tyyppi": "valmis", "vastaus": "Hei maailma!", "keskustelu": "c-123"}
        """.data(using: .utf8)!

        let tapahtumat: [ChatTapahtuma] = try NDJSONParser.parsii(ndjson)
        XCTAssertEqual(tapahtumat.count, 3)
        XCTAssertEqual(tapahtumat[0].tyyppi, "pala")
        XCTAssertEqual(tapahtumat[0].teksti, "Hei")
        XCTAssertEqual(tapahtumat[1].teksti, " maailma!")
        XCTAssertEqual(tapahtumat[2].tyyppi, "valmis")
        XCTAssertEqual(tapahtumat[2].vastaus, "Hei maailma!")
        XCTAssertEqual(tapahtumat[2].keskustelu, "c-123")
    }

    func testParsiiVirheellisenRivinHeittaa() {
        let rikkinainen = """
        {"tyyppi": "pala", "teksti": "OK"}
        {tama ei ole validia jsonia}
        """.data(using: .utf8)!

        XCTAssertThrowsError(try NDJSONParser.parsii(rikkinainen, tyyppi: ChatTapahtuma.self))
    }
}
