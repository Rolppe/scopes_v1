// Viestikentän luonnos (CHAT-MAININPUT-LUONNOS 16.10.2026): kirjoitettu, lähettämätön teksti säilyy skoopeittain, kun
// skooppia vaihdetaan, ja äpin uudelleenkäynnistyksen yli. Käyttää kahta auki olevaa skooppia (SCOPES_KOE_AUKI,
// SCOPES_KOE_AUKI2; oletus "scopes testit" ja "scopes viat", joilla on istunto auki); ei lähetä mitään ja siivoaa luonnokset lopuksi.
import XCTest

final class LuonnosUITests: XCTestCase {
    private func kaynnista(_ avain: String) -> XCUIApplication {
        let app = XCUIApplication()
        let ymp = ProcessInfo.processInfo.environment
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = avain
        app.launch()
        return app
    }

    private func avaa(_ app: XCUIApplication, _ skooppi: String, ensimmainen: Bool) throws {
        let haku = app.searchFields.firstMatch
        if !haku.waitForExistence(timeout: ensimmainen ? 15 : 1) || !haku.isHittable {
            let nuoli = app.buttons.matching(identifier: "sivupalkki").allElementsBoundByIndex.first { $0.isHittable }
            try XCTUnwrap(nuoli, "näkyvä sivupalkin nuoli puuttuu").tap()
        }
        XCTAssertTrue(haku.waitForExistence(timeout: 5), "sivupalkki ei auennut")
        haku.tap()
        if app.buttons["Clear text"].exists { app.buttons["Clear text"].tap() }
        haku.typeText(skooppi)
        let rivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia \(skooppi)")
        rivi.tap()
        XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15), "\(skooppi) ei ole auki")
    }

    private func kentta(_ app: XCUIApplication) -> XCUIElement {
        let k = app.textFields["viestit-kentta"].exists ? app.textFields["viestit-kentta"] : app.textViews["viestit-kentta"]
        XCTAssertTrue(k.waitForExistence(timeout: 10), "viestikenttä puuttuu")
        return k
    }

    private func arvo(_ app: XCUIApplication) -> String { (kentta(app).value as? String) ?? "" }

    func testLuonnosSailyySkoopeittain() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let a = ymp["SCOPES_KOE_AUKI"] ?? "scopes testit"
        let b = ymp["SCOPES_KOE_AUKI2"] ?? "scopes viat"
        let ta = "luonnos-a-\(Int(Date().timeIntervalSince1970) % 10000)"
        let tb = "luonnos-b-\(Int(Date().timeIntervalSince1970) % 10000)"
        var app = kaynnista(avain)

        try avaa(app, a, ensimmainen: true)
        kentta(app).tap()
        kentta(app).typeText(ta)
        try avaa(app, b, ensimmainen: false)
        kentta(app).tap()
        kentta(app).typeText(tb)

        try avaa(app, a, ensimmainen: false)
        XCTAssertTrue(arvo(app).contains(ta), "\(a): luonnos katosi skoopin vaihdossa (kentässä '\(arvo(app))')")
        XCTAssertFalse(arvo(app).contains(tb), "\(a): kentässä toisen skoopin luonnos")
        try avaa(app, b, ensimmainen: false)
        XCTAssertTrue(arvo(app).contains(tb), "\(b): luonnos katosi skoopin vaihdossa (kentässä '\(arvo(app))')")

        // Äpin uudelleenkäynnistys: luonnos tulee takaisin.
        app.terminate()
        app = kaynnista(avain)
        try avaa(app, a, ensimmainen: true)
        XCTAssertTrue(arvo(app).contains(ta), "\(a): luonnos katosi uudelleenkäynnistyksessä (kentässä '\(arvo(app))')")

        // Siivous: tyhjä kenttä poistaa luonnoksen.
        for (skooppi, teksti) in [(a, ta), (b, tb)] {
            try avaa(app, skooppi, ensimmainen: false)
            let k = kentta(app)
            k.tap()
            k.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: teksti.count))
            XCTAssertFalse(arvo(app).contains(teksti), "\(skooppi): siivous ei tyhjentänyt kenttää")
        }
    }
}
