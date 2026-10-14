// Vaakanäkymä (DESIGN-VAAKATUKI 14.10.2026): lista, chat näppäimistöineen ja skoopin viestit vaakaan käännettynä.
// Ei lähetä viestejä. Kuvat: `xcrun xcresulttool export attachments --path ~/scopes-ios/<SCOPES_TULOS>.xcresult …`.
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
        XCUIDevice.shared.orientation = .landscapeLeft
        let kaikki = app.buttons["suodatin-all"]
        XCTAssertTrue(kaikki.waitForExistence(timeout: 15), "lista ei auennut käynnistyksessä")
        sleep(1)
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
        }

        app.buttons["sivupalkki"].firstMatch.tap()
        let rivi = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).firstMatch
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "listassa ei ole skooppia")
        rivi.tap()
        XCTAssertTrue(app.buttons["tiedot"].waitForExistence(timeout: 15), "skoopin viestit eivät auenneet")
        sleep(2)
        kuva("vaaka-skooppi")
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
