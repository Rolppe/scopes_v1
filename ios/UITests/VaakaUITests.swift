// Vaakanäkymä (DESIGN-VAAKATUKI 14.10.2026): lista, chat näppäimistöineen ja skoopin viestit vaakaan käännettynä.
// Ei lähetä viestejä. Kuvat: `xcrun xcresulttool export attachments --path $MAC_PROJ/scopes/scopes-ios/<SCOPES_TULOS>.xcresult …`.
import XCTest

final class VaakaUITests: XCTestCase {
    override func tearDown() {
        XCUIDevice.shared.orientation = .portrait
        super.tearDown()
    }

    func testVaakaListaChatJaSkooppi() throws {
        let ymp = ProcessInfo.processInfo.environment
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        app.launch()
        // Lista avataan pystyssä ja käännetään auki ollessaan (käyttäjä 14.10.2026: sumea tausta venyi vääristyneeksi).
        let kaikki = app.buttons["suodatin-all"]
        XCTAssertTrue(kaikki.waitForExistence(timeout: 15), "lista ei auennut käynnistyksessä")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        XCTAssertTrue(app.buttons["chat-uusi"].waitForExistence(timeout: 5), "chat ei näkynyt")
        sleep(1)
        app.buttons["sivupalkki"].firstMatch.tap()
        sleep(1)
        kuva("pysty-lista")
        XCUIDevice.shared.orientation = .landscapeLeft
        sleep(2)
        XCTAssertGreaterThan(app.windows.firstMatch.frame.width, app.windows.firstMatch.frame.height, "äppi ei kääntynyt vaakaan")
        kuva("vaaka-lista")

        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        let kentta = app.textViews["chat-kentta"].exists ? app.textViews["chat-kentta"] : app.textFields["chat-kentta"]
        XCTAssertTrue(app.buttons["chat-uusi"].waitForExistence(timeout: 5), "chat ei näkynyt")
        sleep(1)
        kuva("vaaka-chat")
        if kentta.waitForExistence(timeout: 3) {
            kentta.tap()
            sleep(1)
            kuva("vaaka-chat-nappaimisto")
            XCTAssertTrue(app.buttons["chat-uusi"].isHittable, "yläpalkki peittyi näppäimistön kanssa")
            // Vaakassa kenttä on yksirivinen eikä nappiriviä ole (käyttäjä 14.10.2026).
            XCTAssertFalse(app.buttons["chat-laheta"].exists, "vaakassa lähetysnappi näkyy")
            XCTAssertLessThan(kentta.frame.height, 44, "vaakassa kenttä ei ole yksirivinen")
        }

        app.buttons["sivupalkki"].firstMatch.tap()
        let rivi = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).firstMatch
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "listassa ei ole skooppia")
        rivi.tap()
        XCTAssertTrue(app.buttons["tiedot"].waitForExistence(timeout: 15), "skoopin viestit eivät auenneet")
        sleep(2)
        kuva("vaaka-skooppi")
        XCTAssertFalse(app.buttons["viestit-liite"].exists, "vaakassa liitenappi näkyy")
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
