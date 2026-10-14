// Tekstikoko ja viestien kirjasin (DESIGN-FONTTI 14.10.2026): Ulkoasu-valinta ja Peru, sekä kuvat listasta, chatista,
// skoopin viesteistä ja kysymyskortista Pieni- ja Suuri-koossa. Ei lähetä viestejä eikä tallenna asetusta: kuvien koko ja
// kirjasin tulevat käynnistysargumenteista (UserDefaultsin argumenttialue), joten simulaattorin asetus ei muutu.
// Kuvat: `xcrun xcresulttool export attachments --path ~/scopes-ios/<SCOPES_TULOS>.xcresult …`.
import XCTest

final class FonttiUITests: XCTestCase {
    func testFonttiAsetusJaPeru() throws {
        // Lähtötila argumenteista: kaatunut ajo jättää valinnan UserDefaultsiin (Ulkoasu kirjoittaa heti, Peru palauttaa).
        // Peru kirjoittaa oletukset takaisin, joten tämä testi myös siivoaa simulaattorin.
        let app = try kaynnista(["-ulkoasu.tekstikoko", "normaali", "-ulkoasu.viestifontti", "sfPro"])
        ulkoasuun(app)
        // Teksti-osio on Ulkoasun viimeinen; Form luo alemmat rivit vasta vieritettäessä.
        let koko = app.segmentedControls["ulkoasu-tekstikoko"]
        for _ in 0..<4 where !app.buttons["viestifontti-serif"].waitForExistence(timeout: 2) { app.swipeUp() }
        XCTAssertTrue(koko.exists, "tekstikoon valinta puuttuu")
        XCTAssertTrue(koko.buttons["Normaali"].isSelected, "oletus ei ole Normaali")
        XCTAssertTrue(app.buttons["viestifontti-sfPro"].isSelected, "oletuskirjasin ei ole SF Pro")
        kuva("ulkoasu-teksti-oletus")
        // Kirjasin ensin: Suuri kasvattaa arkin heti, ja New York -rivi valuu ruudun alle.
        app.buttons["viestifontti-serif"].tap()
        XCTAssertTrue(app.buttons["viestifontti-serif"].isSelected, "kirjasin ei vaihtunut")
        koko.buttons["Suuri"].tap()
        XCTAssertTrue(koko.buttons["Suuri"].isSelected, "koko ei vaihtunut")
        kuva("ulkoasu-teksti-suuri-serif")
        app.navigationBars["Ulkoasu"].buttons["Asetukset"].tap()
        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5))
        app.buttons["Peru"].tap()
        ulkoasuun(app)
        for _ in 0..<4 where !app.buttons["viestifontti-serif"].waitForExistence(timeout: 2) { app.swipeUp() }
        XCTAssertTrue(app.segmentedControls["ulkoasu-tekstikoko"].buttons["Normaali"].isSelected, "Peru ei palauttanut kokoa")
        XCTAssertTrue(app.buttons["viestifontti-sfPro"].isSelected, "Peru ei palauttanut kirjasinta")
    }

    func testFonttiKuvat() throws {
        for (koko, fontti) in [("pieni", "sfPro"), ("suuri", "serif"), ("suuri", "pyorea")] {
            let app = try kaynnista(["-ulkoasu.tekstikoko", koko, "-ulkoasu.viestifontti", fontti])
            XCTAssertTrue(app.buttons["suodatin-all"].waitForExistence(timeout: 15), "lista ei auennut (\(koko))")
            sleep(2)
            kuva("\(koko)-\(fontti)-lista")
            let rivi = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).firstMatch
            XCTAssertTrue(rivi.waitForExistence(timeout: 15), "listassa ei ole skooppia")
            rivi.tap()
            XCTAssertTrue(app.buttons["tiedot"].waitForExistence(timeout: 15), "skoopin viestit eivät auenneet")
            sleep(3)
            kuva("\(koko)-\(fontti)-skooppi")
            app.terminate()
        }
        // Kysymyskortti ilman palvelua (KysymysKoe).
        for koko in ["pieni", "suuri"] {
            let app = XCUIApplication()
            app.launchEnvironment["SCOPES_KOE_KORTTI"] = "1"
            app.launchArguments = ["-ulkoasu.tekstikoko", koko, "-ulkoasu.viestifontti", "serif"]
            app.launch()
            sleep(2)
            kuva("\(koko)-serif-kysymyskortti")
            app.terminate()
        }
    }

    private func kaynnista(_ argumentit: [String] = []) throws -> XCUIApplication {
        let ymp = ProcessInfo.processInfo.environment
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        app.launchArguments = argumentit
        app.launch()
        return app
    }

    // Käynnistys avaa listan (sivupalkin); asetukset ovat sen alapalkissa.
    private func ulkoasuun(_ app: XCUIApplication) {
        let kaikki = app.buttons["suodatin-all"]
        XCTAssertTrue(kaikki.waitForExistence(timeout: 15), "lista ei auennut")
        if !kaikki.isHittable { app.buttons["sivupalkki"].firstMatch.tap() }
        let asetukset = app.buttons["asetukset"].firstMatch
        XCTAssertTrue(asetukset.waitForExistence(timeout: 5), "palkissa ei ole asetuksia")
        asetukset.tap()
        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5))
        app.buttons["asetukset-ulkoasu"].tap()
        XCTAssertTrue(app.navigationBars["Ulkoasu"].waitForExistence(timeout: 5), "Ulkoasu-alavalikko ei auennut")
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
