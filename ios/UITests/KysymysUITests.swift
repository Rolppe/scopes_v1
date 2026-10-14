// Moniosainen kysymyskortti (CHAT-QUESTION-YKSI-KERRALLAAN 14.10.2026, kuten Claude iOS -äpissä): yksi kysymys
// kerrallaan, vaihe 1/N, yksivalinta siirtää seuraavaan, monivalinta odottaa Seuraava-nappia, nuolet palaavat ja
// viimeisessä Lähetä kokoaa kaikki vastaukset. Kiinteä kortti SCOPES_KOE_KORTTI=1 (Viestit.swift KysymysKoe), ei palvelua:
// oikean istunnon kysymykseen vastaaminen lähettäisi vastauksen agentille.
import XCTest

final class KysymysUITests: XCTestCase {
    func testKorttiKysymysKerrallaan() throws {
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_KOE_KORTTI"] = "1"
        app.launch()

        let vaihe = app.staticTexts["kysymys-vaihe"]
        let teksti = app.staticTexts["kysymys-teksti"]
        XCTAssertTrue(vaihe.waitForExistence(timeout: 15), "vaihenäyttö puuttuu")
        XCTAssertEqual(vaihe.label, "1/3")
        XCTAssertEqual(teksti.label, "Mikä on skoopin tarkoitus?")
        XCTAssertEqual(app.staticTexts.matching(identifier: "kysymys-teksti").count, 1, "kortissa näkyy useampi kysymys")
        XCTAssertFalse(app.buttons["kysymys-vaihtoehto-1-0"].exists, "toisen kysymyksen vaihtoehto näkyy ensimmäisessä")
        XCTAssertFalse(app.buttons["kysymys-laheta"].exists, "Lähetä näkyy ennen viimeistä kysymystä")
        XCTAssertFalse(app.buttons["kysymys-edellinen"].isEnabled, "ensimmäisessä voi palata taaksepäin")
        XCTAssertTrue(app.buttons["kysymys-sulje"].exists, "X puuttuu")
        kuva("kortti-1")

        // Yksivalinta siirtää seuraavaan.
        app.buttons["kysymys-vaihtoehto-0-0"].tap()
        XCTAssertTrue(app.buttons["kysymys-vaihtoehto-1-0"].waitForExistence(timeout: 3), "yksivalinta ei siirtänyt seuraavaan")
        XCTAssertEqual(vaihe.label, "2/3")
        XCTAssertEqual(teksti.label, "Mitkä alustat?")

        // Monivalinta ei siirrä: kaksi valintaa, sitten Seuraava.
        app.buttons["kysymys-vaihtoehto-1-0"].tap()
        app.buttons["kysymys-vaihtoehto-1-2"].tap()
        sleep(1)
        XCTAssertEqual(vaihe.label, "2/3", "monivalinta siirsi ennen Seuraava-nappia")
        kuva("kortti-2")
        app.buttons["kysymys-seuraava"].tap()
        XCTAssertTrue(app.buttons["kysymys-laheta"].waitForExistence(timeout: 3), "viimeisessä ei ole Lähetä-nappia")
        XCTAssertEqual(vaihe.label, "3/3")
        XCTAssertFalse(app.buttons["kysymys-seuraava"].exists)

        // Nuoli palaa, ja valinnat ovat tallessa.
        app.buttons["kysymys-edellinen"].tap()
        XCTAssertTrue(app.buttons["kysymys-vaihtoehto-1-0"].waitForExistence(timeout: 3))
        XCTAssertEqual(vaihe.label, "2/3")
        app.buttons["kysymys-eteen"].tap()
        XCTAssertTrue(app.buttons["kysymys-vaihtoehto-2-1"].waitForExistence(timeout: 3))

        // Viimeinen yksivalinta ei lähetä itse; Lähetä kokoaa kaikki kolme.
        app.buttons["kysymys-vaihtoehto-2-1"].tap()
        sleep(1)
        XCTAssertFalse(app.staticTexts["koe-vastaus"].exists, "viimeinen valinta lähetti ilman Lähetä-nappia")
        kuva("kortti-3")
        app.buttons["kysymys-laheta"].tap()
        let vastaus = app.staticTexts["koe-vastaus"]
        XCTAssertTrue(vastaus.waitForExistence(timeout: 3), "vastaus ei lähtenyt")
        XCTAssertEqual(vastaus.label, "Tarkoitus: Kysymyskortti — Alustat: iPhone, Mac — Aloitus: Myöhemmin")
    }

    func testOhitettuJaaPois() throws {
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_KOE_KORTTI"] = "1"
        app.launch()
        XCTAssertTrue(app.buttons["kysymys-seuraava"].waitForExistence(timeout: 15))
        // Ohitus Seuraava-napilla, oma vastaus toiseen, kolmas ohitetaan nuolella.
        app.buttons["kysymys-seuraava"].tap()
        let muu = app.textFields["kysymys-muu-1"].exists ? app.textFields["kysymys-muu-1"] : app.textViews["kysymys-muu-1"]
        XCTAssertTrue(muu.waitForExistence(timeout: 3), "toisen kysymyksen Muu-kenttä puuttuu")
        muu.tap()
        muu.typeText("Watch")
        app.buttons["kysymys-eteen"].tap()
        XCTAssertTrue(app.buttons["kysymys-laheta"].waitForExistence(timeout: 3))
        app.buttons["kysymys-laheta"].tap()
        let vastaus = app.staticTexts["koe-vastaus"]
        XCTAssertTrue(vastaus.waitForExistence(timeout: 3), "vastaus ei lähtenyt")
        XCTAssertEqual(vastaus.label, "Alustat: Watch")
    }

    // Vaakatila (käyttäjä 14.10.2026): Muu-kenttä alkaa yhdeltä riviltä, kirjoittaessa ei Lähetä/Seuraava-nappia, ja
    // rivinvaihto siirtää seuraavaan tai viimeisessä lähettää.
    func testVaakaRivinvaihtoLahettaa() throws {
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_KOE_KORTTI"] = "1"
        app.launch()
        XCUIDevice.shared.orientation = .landscapeLeft
        addTeardownBlock { XCUIDevice.shared.orientation = .portrait }
        let vaihe = app.staticTexts["kysymys-vaihe"]
        XCTAssertTrue(vaihe.waitForExistence(timeout: 15))

        let muu0 = kentta(app, 0)
        XCTAssertTrue(muu0.waitForExistence(timeout: 3), "Muu-kenttä puuttuu")
        let korkeus = muu0.frame.height
        muu0.tap()
        sleep(1)
        XCTAssertFalse(app.buttons["kysymys-seuraava"].exists, "Seuraava näkyy vaakassa kirjoittaessa")
        XCTAssertLessThan(korkeus, 50, "Muu-kenttä ei ala yhdeltä riviltä")
        kuva("vaaka-kentta")
        muu0.typeText("Kokeilu\n")
        XCTAssertTrue(app.buttons["kysymys-vaihtoehto-1-0"].waitForExistence(timeout: 3), "rivinvaihto ei siirtänyt seuraavaan")
        XCTAssertEqual(vaihe.label, "2/3")

        // Ilman näppäimistöä nappi näkyy, jotta pelkät valinnat voi lähettää.
        XCTAssertTrue(app.buttons["kysymys-seuraava"].waitForExistence(timeout: 3), "Seuraava puuttuu ilman näppäimistöä")
        app.buttons["kysymys-seuraava"].tap()
        let muu2 = kentta(app, 2)
        XCTAssertTrue(muu2.waitForExistence(timeout: 3))
        muu2.tap()
        sleep(1)
        XCTAssertFalse(app.buttons["kysymys-laheta"].exists, "Lähetä näkyy vaakassa kirjoittaessa")
        muu2.typeText("Huomenna\n")
        let vastaus = app.staticTexts["koe-vastaus"]
        XCTAssertTrue(vastaus.waitForExistence(timeout: 3), "rivinvaihto ei lähettänyt")
        XCTAssertEqual(vastaus.label, "Tarkoitus: Kokeilu — Aloitus: Huomenna")
    }

    private func kentta(_ app: XCUIApplication, _ q: Int) -> XCUIElement {
        app.textFields["kysymys-muu-\(q)"].exists ? app.textFields["kysymys-muu-\(q)"] : app.textViews["kysymys-muu-\(q)"]
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }
}
