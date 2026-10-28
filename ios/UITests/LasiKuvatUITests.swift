// Liquid Glass -pinnat kuvina lasin kanssa ja ilman (DESIGN-LASIPINNAT-LAITE 14.10.2026): lista suodatinnappeineen,
// chat yläpalkkeineen ja infrapuu laajennusnappeineen. Ei lähetä viestejä. Kuvat:
// `xcrun xcresulttool export attachments --path ~/Projects/scopes/scopes-ios/<SCOPES_TULOS>.xcresult --output-path <kansio>`.
import XCTest

final class LasiKuvatUITests: XCTestCase {
    func testLasiPaallaJaPois() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        for lasi in [true, false] {
            let app = XCUIApplication()
            app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
            app.launchEnvironment["SCOPES_AVAIN"] = avain
            // Argumenttialue ohittaa tallennetun ulkoasu.lasi-arvon vain tämän käynnistyksen ajan; plist-muoto, koska "NO" olisi
            // merkkijono eikä Bool.
            app.launchArguments += ["-ulkoasu.lasi", lasi ? "<true/>" : "<false/>"]
            app.launch()
            let tila = lasi ? "lasi" : "tasainen"

            let kaikki = app.buttons["suodatin-all"]
            XCTAssertTrue(kaikki.waitForExistence(timeout: 15), "lista ei auennut käynnistyksessä")
            if !kaikki.isSelected { kaikki.tap() }
            kuva("\(tila)-lista")

            app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
            XCTAssertTrue(app.buttons["chat-uusi"].waitForExistence(timeout: 5), "chat ei näkynyt")
            sleep(1)
            kuva("\(tila)-chat")

            app.buttons["sivupalkki"].firstMatch.tap()
            let infra = app.buttons["sivupalkki-infra"]
            XCTAssertTrue(infra.waitForExistence(timeout: 5))
            infra.tap()
            XCTAssertTrue(app.buttons["infra-rekisterit"].waitForExistence(timeout: 15), "infra ei latautunut")
            kuva("\(tila)-infra")
            app.buttons["sivupalkki"].firstMatch.tap()
            app.buttons["suodatin-allscope"].tap()
            let avaa = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'allscope-avaa-'")).firstMatch
            if avaa.waitForExistence(timeout: 5) {
                kuva("\(tila)-allscope")
                avaa.tap()
                sleep(1)
                kuva("\(tila)-allscope-auki")
            }
            app.terminate()
        }
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
