// Stop-nappi (CHAT-STOP 14.10.2026, kuten Claude iOS -äpissä): vastauksen aikana lähetyspallo vaihtuu stopiksi,
// napautus keskeyttää heti, osittainen vastaus jää näkyviin ja kenttä vapautuu. Vaatii palvelun, jossa on
// /api/chat/stop (uuden koodin koeinstanssi: SCOPES_OSOITE=…:8788). Skoopin stop (Escape oikeaan istuntoon) on
// palvelun yksikkötestissä (scopes/palvelu/viestit.test.mjs), ei täällä.
import XCTest

final class StopUITests: XCTestCase {
    func testChatStop() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = avain
        app.launch()

        // Käynnistys avaa sivupalkin; oikean reunan napautus sulkee sen chattiin.
        XCTAssertTrue(app.buttons["suodatin-all"].waitForExistence(timeout: 15), "lista ei auennut käynnistyksessä")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        let agentti = app.buttons["chat-agentti"]
        XCTAssertTrue(agentti.waitForExistence(timeout: 15))
        agentti.tap()
        XCTAssertTrue(app.buttons["Haiku 5.5"].waitForExistence(timeout: 5), "mallivalikko puuttuu")
        app.buttons["Haiku 5.5"].tap()
        let kentta = app.textFields["chat-kentta"].exists ? app.textFields["chat-kentta"] : app.textViews["chat-kentta"]
        kentta.tap()
        kentta.typeText("Kirjoita numerot yhdestä tuhanteen suomeksi sanoina, pilkuilla erotettuina, ei muuta.")
        app.buttons["chat-laheta"].tap()

        let stop = app.buttons["chat-stop"]
        XCTAssertTrue(stop.waitForExistence(timeout: 10), "stop-nappi ei tullut lähetyspallon tilalle")
        XCTAssertFalse(app.buttons["chat-laheta"].exists, "lähetyspallo näkyy vastauksen aikana")
        let kupla = app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH[c] 'yksi'")).firstMatch
        XCTAssertTrue(kupla.waitForExistence(timeout: 60), app.staticTexts["chat-virhe"].exists ? app.staticTexts["chat-virhe"].label : "kupla puuttuu")
        kuva("chat-stop-kesken")

        stop.tap()
        let alku = Date()
        XCTAssertTrue(app.buttons["chat-jatka"].waitForExistence(timeout: 10), "play-nappi ei tullut stopin tilalle")
        let kesto = Date().timeIntervalSince(alku)
        XCTAssertFalse(app.buttons["chat-stop"].exists, "stop-nappi jäi näkyviin")
        XCTAssertFalse(app.staticTexts["chat-virhe"].exists, app.staticTexts["chat-virhe"].exists ? app.staticTexts["chat-virhe"].label : "")
        XCTAssertTrue(kupla.exists, "osittainen vastaus katosi")
        let teksti = kupla.label
        XCTAssertFalse(teksti.lowercased().contains("yhdeksänsataayhdeksänkymmentäyhdeksän"), "vastaus ehti valmiiksi: ei todista keskeytystä")
        // Keskeytys on pysyvä: teksti ei kasva enää.
        Thread.sleep(forTimeInterval: 3)
        XCTAssertEqual(kupla.label, teksti, "vastaus jatkui pysäytyksen jälkeen")
        kuva("chat-stop-pysaytetty")
        // Kirjoitus vaihtaa playn lähetysnapiksi, tyhjennys takaisin playksi (käyttäjä 14.10.2026).
        let syote = app.textViews["chat-kentta"].exists ? app.textViews["chat-kentta"] : app.textFields["chat-kentta"]
        syote.tap()
        syote.typeText("x")
        XCTAssertTrue(app.buttons["chat-laheta"].waitForExistence(timeout: 5), "kirjoitus ei vaihtanut lähetysnapiksi")
        XCTAssertFalse(app.buttons["chat-jatka"].exists, "play näkyy kirjoitetun tekstin kanssa")
        syote.typeText(XCUIKeyboardKey.delete.rawValue)
        XCTAssertTrue(app.buttons["chat-jatka"].waitForExistence(timeout: 5), "tyhjennys ei palauttanut playta")
        // Play lähettää "jatka" ja vaihtuu stopiksi; pysäytys palauttaa playn.
        app.buttons["chat-jatka"].tap()
        XCTAssertTrue(app.buttons["chat-stop"].waitForExistence(timeout: 10), "play ei vaihtunut stopiksi")
        app.buttons["chat-stop"].tap()
        XCTAssertTrue(app.buttons["chat-jatka"].waitForExistence(timeout: 15), "toinen pysäytys ei palauttanut playta")
        print("CHAT-STOP: kenttä vapautui \(String(format: "%.1f", kesto)) s, osittainen vastaus \(teksti.count) merkkiä")
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
