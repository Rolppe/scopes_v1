import XCTest
@testable import ScopesCore

final class ScopesDatabaseTests: XCTestCase {
    var valiaikainenHakemisto: URL!

    override func setUp() {
        super.setUp()
        valiaikainenHakemisto = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
    }

    override func tearDown() {
        try? FileManager.default.removeItem(at: valiaikainenHakemisto)
        super.tearDown()
    }

    func testValitonMuistilukuJaTallennus() async {
        let db = ScopesDatabase(hakemisto: valiaikainenHakemisto)
        let alkuSkoopit = await db.lueSkoopit()
        XCTAssertTrue(alkuSkoopit.isEmpty)

        let testiSkooppi = SkooppiYhteenveto(nimi: "scopes performance", seuraava: "PERFORMANCE-TILATIETOKANTA", avoimia: 1, vikoja: 0, istuntoja: 1, aika: "2026-10-17T19:00:00Z", tila: "kasittely")
        await db.tallennaSkoopit([testiSkooppi])

        let luetut = await db.lueSkoopit()
        XCTAssertEqual(luetut.count, 1)
        XCTAssertEqual(luetut.first?.nimi, "scopes performance")
        XCTAssertEqual(luetut.first?.tilaNyt, "kasittely")
    }

    func testLevypersistenssiUudelleenkaynnistyksessa() async {
        // Ensimmäinen instanssi kirjoittaa levylle
        let db1 = ScopesDatabase(hakemisto: valiaikainenHakemisto)
        let viesti1 = Viesti(rooli: "kayttaja", teksti: "Hei maailma", aika: "2026-10-17T19:10:00Z")
        let viesti2 = Viesti(rooli: "agentti", teksti: "Terve!", aika: "2026-10-17T19:10:05Z")
        let skooppiViestit = SkooppiViestit(nimi: "scopes test", auki: true, viestit: [viesti1, viesti2])

        await db1.tallennaSkooppiViestit(skooppi: "scopes test", viestit: skooppiViestit)

        let chatViestit = [viesti1, viesti2]
        await db1.tallennaChatViestit(keskusteluId: "chat-123", viestit: chatViestit)

        // Toinen instanssi (vastaa äpin uudelleenkäynnistystä) lataa heti levyltä muistiin
        let db2 = ScopesDatabase(hakemisto: valiaikainenHakemisto)
        let ladatutSkooppiViestit = await db2.lueSkooppiViestit(skooppi: "scopes test")
        XCTAssertNotNil(ladatutSkooppiViestit)
        XCTAssertEqual(ladatutSkooppiViestit?.viestit.count, 2)
        XCTAssertEqual(ladatutSkooppiViestit?.viestit.first?.teksti, "Hei maailma")

        let ladatutChatViestit = await db2.lueChatViestit(keskusteluId: "chat-123")
        XCTAssertEqual(ladatutChatViestit.count, 2)
        XCTAssertEqual(ladatutChatViestit.last?.teksti, "Terve!")
    }

    func testOptimistinenViestinLisays() async {
        let db = ScopesDatabase(hakemisto: valiaikainenHakemisto)
        let uusiViesti = Viesti(rooli: "kayttaja", teksti: "Testiviesti ilman verkkoodotusta")

        await db.lisaaSkooppiViesti(skooppi: "scopes chat", viesti: uusiViesti)
        let viestit = await db.lueSkooppiViestit(skooppi: "scopes chat")

        XCTAssertNotNil(viestit)
        XCTAssertEqual(viestit?.viestit.count, 1)
        XCTAssertEqual(viestit?.viestit.first?.teksti, "Testiviesti ilman verkkoodotusta")
    }

    func testMuutosStreamLahettaaTapahtuman() async {
        let db = ScopesDatabase(hakemisto: valiaikainenHakemisto)
        let virta = await db.kuuntele()

        let odotus = expectation(description: "Muutos vastaanotettu")
        let task = Task {
            for await muutos in virta {
                if case let .agentitPaivitetty(uudet) = muutos {
                    XCTAssertEqual(uudet.first?.nimi, "gemini-3.8-flash")
                    odotus.fulfill()
                    break
                }
            }
        }

        let agentti = Agentti(nimi: "gemini-3.8-flash", kuvaus: "Gemini 3.8 Flash", tyyppi: "malli")
        await db.tallennaAgentit([agentti])

        await fulfillment(of: [odotus], timeout: 2.0)
        task.cancel()
    }
}
