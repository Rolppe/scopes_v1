import XCTest
@testable import ScopesUI
import ScopesCore

final class ScopesUITests: XCTestCase {
    func testViestikuplaAlustus() {
        let viesti = Viesti(rooli: "kayttaja", teksti: "Hei maailma")
        let kupla = Viestikupla(viesti: viesti)
        XCTAssertEqual(kupla.viesti.teksti, "Hei maailma")
        XCTAssertTrue(kupla.viesti.omaViesti)
    }

    func testMalliValikkoMallit() {
        XCTAssertFalse(MalliValikko.claudeMallit.isEmpty)
        XCTAssertFalse(MalliValikko.macAgyMallit.isEmpty)
        XCTAssertEqual(MalliValikko.effortit.count, 5)
    }

    func testKayttorajaRenkaatAlustus() {
        let r5 = Kayttoraja.Raja(kaytto: 50.0, nollautuu: nil)
        let rw = Kayttoraja.Raja(kaytto: 20.0, nollautuu: nil)
        let k = Kayttoraja(viisiTuntia: r5, viikko: rw)
        let renkaat = KayttorajaRenkaat(raja: k)
        XCTAssertNotNil(renkaat.raja)
    }

    func testKayttorajaRenkaatMuotoilu() {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime]
        let nyt = iso.date(from: "2026-10-27T10:00:00Z")!

        // 4h 52min nollautumiseen -> 14:52:00Z
        let r5 = Kayttoraja.Raja(kaytto: 29.0, nollautuu: "2026-10-27T14:52:00Z")
        // 5d 16h 5min nollautumiseen -> 5 * 86400 + 16 * 3600 + 5 * 60 = 432000 + 57600 + 300 = 489900s
        let rw = Kayttoraja.Raja(kaytto: 1.27, nollautuu: "2026-11-02T02:05:00Z", teksti: "19 / 1500")
        let k = Kayttoraja(viisiTuntia: r5, viikko: rw, otsikko: "Mac AGY")
        let renkaat = KayttorajaRenkaat(raja: k)

        XCTAssertEqual(renkaat.otsikkoTeksti, "Mac AGY")
        XCTAssertEqual(renkaat.rivi5h(nyt: nyt), "5h - 29% (yellow) Reset in 4h 52min")
        XCTAssertEqual(renkaat.riviVk(nyt: nyt), "Vk - 19 / 1500 (red) Reset 5d 16h 5min")
    }

    func testKayttorajaRenkaatMalliFallback() {
        let k = Kayttoraja(viisiTuntia: nil, viikko: nil)
        let renkaatMac = KayttorajaRenkaat(raja: k, malli: "mac-agy/gemini-3.8-flash-high")
        XCTAssertEqual(renkaatMac.otsikkoTeksti, "Mac AGY")

        let renkaatAgy = KayttorajaRenkaat(raja: k, malli: "agy:gemini-3.8-flash-high")
        XCTAssertEqual(renkaatAgy.otsikkoTeksti, "OnePlus Linux AGY")

        let renkaatClaude = KayttorajaRenkaat(raja: k, malli: "claude-sonnet-5-5")
        XCTAssertEqual(renkaatClaude.otsikkoTeksti, "Claude")
    }

    func testMalliValikkoKayttorajat() {
        let macGemini = Kayttoraja(
            viisiTuntia: nil,
            viikko: Kayttoraja.Raja(kaytto: 100.0, nollautuu: nil, teksti: "1591 / 1500", otsikko: "pyynnöt"),
            otsikko: "Mac AGY"
        )
        let opGemini = Kayttoraja(
            viisiTuntia: Kayttoraja.Raja(kaytto: 96.0, nollautuu: nil),
            viikko: Kayttoraja.Raja(kaytto: 100.0, nollautuu: nil, teksti: "1682 / 1500", otsikko: "pyynnöt"),
            otsikko: "OnePlus Linux AGY"
        )
        let claude = Kayttoraja(
            viisiTuntia: Kayttoraja.Raja(kaytto: 15.0, nollautuu: nil),
            viikko: Kayttoraja.Raja(kaytto: 45.0, nollautuu: nil),
            otsikko: "Claude"
        )

        let kaikki = KayttorajatKaikki(
            claude: claude,
            oneplusAgy: KayttorajatKaikki.AgyRyhmat(gemini: opGemini, kolmasOsapuoli: nil),
            macAgy: KayttorajatKaikki.AgyRyhmat(gemini: macGemini, kolmasOsapuoli: nil)
        )

        XCTAssertEqual(kaikki.raja(mallille: "mac-agy/gemini-3.8-flash-high")?.otsikko, "Mac AGY")
        XCTAssertEqual(kaikki.raja(mallille: "gemini-3.8-flash-high")?.otsikko, "Mac AGY")
        XCTAssertEqual(kaikki.raja(mallille: "agy/gemini-3.8-flash-high")?.otsikko, "OnePlus Linux AGY")
        XCTAssertEqual(kaikki.raja(mallille: "agy:gemini-3.8-flash-high")?.otsikko, "OnePlus Linux AGY")
        XCTAssertEqual(kaikki.raja(mallille: "claude-sonnet-5-5")?.otsikko, "Claude")

        XCTAssertTrue(macGemini.onTayna)
        XCTAssertEqual(macGemini.tiivisTeksti, "1591/1500")

        let valikko = MalliValikko(
            malli: "mac-agy/gemini-3.8-flash-high",
            effort: "high",
            kayttoraja: macGemini,
            kayttorajat: kaikki,
            onValitse: { _, _ in }
        )
        XCTAssertNotNil(valikko.kayttoraja)
    }
}
