// Nebius-avaimen syöttökenttä (käyttäjä 18.10.2026: "Tee äppiin syöttökenttä"): Asetukset → Nebius, virheellinen avain
// hylätään ja kelvollinen tallentuu palvelimelle. Testi tallentaa tunnistettavan koeavaimen KOEAVAIN; ajaja poistaa
// palvelimen ~/.config/scopes/nebius-avain-tiedoston ajon jälkeen, jos siinä on yhä koeavain (ei korvaa oikeaa avainta).
import XCTest

final class NebiusUITests: XCTestCase {
    static let koeavain = "skoopit-uitesti-nebius-0000"

    func testNebiusAvain() throws {
        let app = try kaynnista()
        asetuksiin(app)
        app.buttons["asetukset-nebius"].tap()
        XCTAssertTrue(app.navigationBars["Nebius"].waitForExistence(timeout: 5), "Nebius-alavalikko ei auennut")
        let tila = app.staticTexts["nebius-tila"]
        XCTAssertTrue(tila.waitForExistence(timeout: 10), "tilarivi puuttuu")
        XCTAssertTrue(odota { !tila.label.hasPrefix("Haetaan") }, "tila ei latautunut: \(tila.label)")
        let tallenna = app.buttons["nebius-tallenna"]
        XCTAssertFalse(tallenna.isEnabled, "tyhjää avainta ei saa tallentaa")
        kuva("nebius-alku")

        let kentta = app.secureTextFields["nebius-kentta"]
        kentta.tap()
        kentta.typeText("kaksi sanaa")
        tallenna.tap()
        XCTAssertTrue(odota { tila.label.hasPrefix("Avain ei tallentunut") }, "virheellinen avain ei antanut virhettä: \(tila.label)")
        kuva("nebius-virheellinen")

        kentta.tap()
        kentta.typeText(XCUIKeyboardKey.delete.rawValue.repeated(20) + Self.koeavain)
        tallenna.tap()
        XCTAssertTrue(odota { tila.label.hasPrefix("Avain on palvelimella (\(Self.koeavain.count) merkkiä)") }, "tallennus ei näkynyt: \(tila.label)")
        XCTAssertEqual(kentta.value as? String ?? "", kentta.placeholderValue ?? "", "kenttä ei tyhjentynyt")
        kuva("nebius-tallennettu")
    }

    private func kaynnista() throws -> XCUIApplication {
        let ymp = ProcessInfo.processInfo.environment
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        app.launch()
        return app
    }

    // Käynnistys avaa listan (sivupalkin); asetukset ovat sen alapalkissa.
    private func asetuksiin(_ app: XCUIApplication) {
        let kaikki = app.buttons["suodatin-all"]
        XCTAssertTrue(kaikki.waitForExistence(timeout: 15), "lista ei auennut")
        if !kaikki.isHittable { app.buttons["sivupalkki"].firstMatch.tap() }
        let asetukset = app.buttons["asetukset"].firstMatch
        XCTAssertTrue(asetukset.waitForExistence(timeout: 5), "palkissa ei ole asetuksia")
        asetukset.tap()
        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5))
    }

    private func odota(_ ehto: () -> Bool, timeout: TimeInterval = 10) -> Bool {
        let loppu = Date().addingTimeInterval(timeout)
        while Date() < loppu {
            if ehto() { return true }
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
        }
        return ehto()
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}

private extension String {
    func repeated(_ n: Int) -> String { String(repeating: self, count: n) }
}
