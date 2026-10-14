// Liitteiden valinta skoopin viesteissä (CHAT-MEDIA-SKOOPPI 14.10.2026). Testi ei lähetä viestiä: liite tulisi
// oikeaan istuntoon. Lataus palveluun on palvelun yksikkötestissä (scopes/palvelu/liitteet.test.mjs).
// Auki oleva skooppi tmuxissa: SCOPES_KOE_AUKI="<skooppi>" (oletus "scopes lista").
import UIKit
import XCTest

final class LiitteetUITests: XCTestCase {
    func testLeikepoydanKuvaLiitteeksiJaPois() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skooppi = ymp["SCOPES_KOE_AUKI"] ?? "scopes lista"
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
        let plus = app.buttons["viestit-liite"]
        guard plus.waitForExistence(timeout: 5) else { throw XCTSkip("syöttöriviä ei ole (kortti auki tai vain luku)") }

        // Simulaattorin leikepöytä on yhteinen: testiajuri asettaa kuvan, äppi lukee sen.
        let koko = CGSize(width: 40, height: 30)
        UIPasteboard.general.image = UIGraphicsImageRenderer(size: koko).image { c in
            UIColor.systemOrange.setFill()
            c.fill(CGRect(origin: .zero, size: koko))
        }
        let laheta = app.buttons["viestit-laheta"]
        XCTAssertFalse(laheta.isEnabled, "lähetys sallittu ilman tekstiä ja liitettä")

        plus.tap()
        let leikepoyta = app.buttons["liite-leikepoyta"]
        XCTAssertTrue(leikepoyta.waitForExistence(timeout: 5), "valikossa ei ole leikepöytää")
        XCTAssertTrue(app.buttons["liite-kuvakirjasto"].exists, "valikossa ei ole kuvakirjastoa")
        XCTAssertTrue(app.buttons["liite-tiedostot"].exists, "valikossa ei ole Tiedostoja")
        leikepoyta.tap()
        // iOS kysyy luvan liittää toisen äpin leikepöydältä.
        let lupa = XCUIApplication(bundleIdentifier: "com.apple.springboard").buttons["Allow Paste"]
        if lupa.waitForExistence(timeout: 3) { lupa.tap() }

        let liite = app.otherElements["liite"].firstMatch
        XCTAssertTrue(liite.waitForExistence(timeout: 5), "liite ei näy syöttörivin yläpuolella")
        XCTAssertTrue(laheta.isEnabled, "liite ei salli lähetystä tyhjällä tekstillä")
        let kuva = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        kuva.name = "liite-valittu"
        kuva.lifetime = .keepAlways
        add(kuva)

        app.buttons["liite-poista"].firstMatch.tap()
        XCTAssertTrue(liite.waitForNonExistence(timeout: 5), "X ei poistanut liitettä")
        XCTAssertFalse(laheta.isEnabled, "lähetys sallittu liitteen poiston jälkeen")
    }
}
