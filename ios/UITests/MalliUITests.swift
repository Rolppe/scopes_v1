// Mallinappi skoopin viestinäkymässä (MALLINAPPI-TODENNUS 16.10.2026). Oletustesti on lukeva: napin teksti tulee
// istunnon transkriptista ja nappi on pois käytöstä, kun istunto työskentelee. Vaihto kirjoittaa oikeaan istuntoon
// (`/model`, `/effort` tmuxin kautta, vain tälle istunnolle), joten se ajetaan vain pyydettäessä:
//   SCOPES_KOE_MALLI="<skooppi>" [SCOPES_KOE_MALLI_VAIHDA="claude-haiku-5-5"] [SCOPES_KOE_MALLI_EFFORT="low"]
// Vaatii palvelun, jossa on POST /api/skoopit/<nimi>/malli (uuden koodin koeinstanssi: SCOPES_OSOITE=…:8788).
import XCTest

final class MalliUITests: XCTestCase {
    func testMallinappiNakyyJaVaihtuu() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skooppi = ymp["SCOPES_KOE_MALLI"] ?? "scopes chat"
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = avain
        app.launch()

        let nuoli = app.buttons["sivupalkki"].firstMatch
        XCTAssertTrue(nuoli.waitForExistence(timeout: 15), "sivupalkin nuoli puuttuu")
        let kaikki = app.buttons["suodatin-all"]
        if !(kaikki.exists && kaikki.isHittable) { nuoli.tap() }
        XCTAssertTrue(kaikki.waitForExistence(timeout: 5))
        if !kaikki.isSelected { kaikki.tap() }
        let haku = app.searchFields.firstMatch
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText(skooppi)
        let rivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia")
        rivi.tap()
        XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15), "\(skooppi) ei ole auki")

        let nappi = app.buttons["viestit-malli"]
        XCTAssertTrue(nappi.waitForExistence(timeout: 10), "mallinappi puuttuu syöttörivistä")
        // Teksti on "<malli> · <effort>" transkriptista (Sonnet 5.5 · high); ennen ensimmäistä vastausta "Malli".
        let teksti = nappi.label.isEmpty ? nappi.value as? String ?? "" : nappi.label
        print("MALLINAPPI: teksti \"\(teksti)\", käytössä \(nappi.isEnabled)")
        kuva("mallinappi-lepotila")

        guard nappi.isEnabled else { throw XCTSkip("istunto työskentelee: nappi on pois käytöstä (odotettu)") }
        nappi.tap()
        for id in ["claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "mac-agy/gemini-3.8-flash-high"] {
            XCTAssertTrue(app.buttons["malli-\(id)"].waitForExistence(timeout: 5), "valikossa ei ole mallia \(id)")
        }
        for e in ["low", "medium", "high", "xhigh", "max"] {
            XCTAssertTrue(app.buttons["effort-\(e)"].exists, "valikossa ei ole effortia \(e)")
        }
        kuva("mallinappi-valikko")

        guard let malli = ymp["SCOPES_KOE_MALLI_VAIHDA"] else {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.1)).tap()  // sulje valikko vaihtamatta
            return
        }
        app.buttons["malli-\(malli)"].tap()
        XCTAssertFalse(app.staticTexts["viestit-virhe"].waitForExistence(timeout: 20),
                       app.staticTexts["viestit-virhe"].exists ? app.staticTexts["viestit-virhe"].label : "")
        kuva("mallinappi-vaihdettu-malli")
        if let effort = ymp["SCOPES_KOE_MALLI_EFFORT"] {
            XCTAssertTrue(nappi.waitForExistence(timeout: 10))
            nappi.tap()
            app.buttons["effort-\(effort)"].tap()
            XCTAssertFalse(app.staticTexts["viestit-virhe"].waitForExistence(timeout: 20),
                           app.staticTexts["viestit-virhe"].exists ? app.staticTexts["viestit-virhe"].label : "")
            kuva("mallinappi-vaihdettu-effort")
        }
    }

    func testMalliAsetukset() throws {
        let ymp = ProcessInfo.processInfo.environment
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = ymp["SCOPES_AVAIN"] ?? "koeavain"
        app.launch()

        let kaikki = app.buttons["suodatin-all"]
        XCTAssertTrue(kaikki.waitForExistence(timeout: 15), "lista ei auennut")
        let nuoli = app.buttons["sivupalkki"].firstMatch
        if !kaikki.isHittable && nuoli.exists { nuoli.tap() }

        let asetukset = app.buttons["asetukset"].firstMatch
        XCTAssertTrue(asetukset.waitForExistence(timeout: 5), "asetukset-painike puuttuu")
        asetukset.tap()

        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5), "Asetukset-näkymä ei auennut")
        let mallitLinkki = app.buttons["asetukset-mallit"]
        XCTAssertTrue(mallitLinkki.waitForExistence(timeout: 5), "Mallit-linkki puuttuu asetuksista")
        kuva("asetukset-valikko")

        mallitLinkki.tap()
        XCTAssertTrue(app.navigationBars["Mallit"].waitForExistence(timeout: 5), "Mallit-näkymä ei auennut")
        kuva("malli-asetukset-nakyma")

        // Automaatiokytkin
        let autoToggle = app.switches["ota-uudet-mallit"]
        XCTAssertTrue(autoToggle.waitForExistence(timeout: 5), "Automaatiokytkin puuttuu")
        XCTAssertEqual(autoToggle.value as? String, "1", "Automaatiokytkin ei ole oletuksena päällä")

        // Oletusmalli ja ryhmät ylhäällä
        XCTAssertTrue(app.staticTexts["Claude"].exists, "Claude-ryhmä puuttuu")
        XCTAssertTrue(app.staticTexts["Opus 5.5"].exists, "Opus 5.5 puuttuu")
        XCTAssertTrue(app.staticTexts["Mac AGY"].exists, "Mac AGY -ryhmä puuttuu")
        XCTAssertTrue(app.staticTexts["Gemini 3.8 Flash (High) · macos"].exists, "Gemini macos puuttuu")

        // Vieritä alas
        app.swipeUp()
        kuva("malli-asetukset-keskella")

        XCTAssertTrue(app.staticTexts["OnePlus Linux AGY"].waitForExistence(timeout: 5), "OnePlus Linux AGY -ryhmä puuttuu")
        XCTAssertTrue(app.staticTexts["Gemini 3.8 Flash (High) · oneplus linux"].exists, "Gemini oneplus puuttuu")

        app.swipeUp()
        kuva("malli-asetukset-alhaalla")

        XCTAssertTrue(app.staticTexts["Nebius"].waitForExistence(timeout: 5), "Nebius-ryhmä puuttuu")

        // Toimintopainikkeet
        XCTAssertTrue(app.buttons["Ota kaikki mallit käyttöön"].waitForExistence(timeout: 5), "Ota kaikki -painike puuttuu")
        XCTAssertTrue(app.buttons["Palauta oletusvalinnat"].waitForExistence(timeout: 5), "Palauta oletusvalinnat -painike puuttuu")
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
