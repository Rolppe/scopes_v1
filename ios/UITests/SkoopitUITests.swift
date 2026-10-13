// Simulaattoritesti oikeaa palvelua vastaan. Avain tulee ajajalta: `TEST_RUNNER_SCOPES_AVAIN=… xcodebuild test`
// (xcodebuild antaa TEST_RUNNER_-etuliitteiset muuttujat testiajurille ilman etuliitettä); ei koodissa.
import XCTest

final class SkoopitUITests: XCTestCase {
    private func kaynnista(avain: String?) -> XCUIApplication {
        let app = XCUIApplication()
        let ymp = ProcessInfo.processInfo.environment
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = avain ?? ""
        app.launch()
        return app
    }

    // Sivupalkki vasemman yläkulman nuolesta (DEMO-SCOPES-SIVUPALKKI); kohde = palkin painikkeen tunnus.
    private func palkki(_ app: XCUIApplication) {
        let nuoli = app.buttons["sivupalkki"].firstMatch
        XCTAssertTrue(nuoli.waitForExistence(timeout: 15), "sivupalkin nuoli puuttuu")
        nuoli.tap()
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true), "sivupalkki ei auennut")
        // Suodatin muistetaan käynnistysten yli; testit alkavat kaikista.
        if !app.buttons["suodatin-all"].isSelected { app.buttons["suodatin-all"].tap() }
    }

    // Palkki on aina hierarkiassa ruudun ulkopuolella, joten auki/kiinni luetaan osuttavuudesta, ei olemassaolosta.
    private func osuttava(_ e: XCUIElement, _ arvo: Bool, timeout: TimeInterval = 5) -> Bool {
        let loppu = Date().addingTimeInterval(timeout)
        while Date() < loppu {
            if e.exists && e.isHittable == arvo { return true }
            if !e.exists && !arvo { return true }
            usleep(200_000)
        }
        return false
    }

    private func nayta(_ app: XCUIApplication, _ kohde: String) {
        palkki(app)
        XCTAssertTrue(app.buttons[kohde].firstMatch.waitForExistence(timeout: 5), "palkissa ei ole: \(kohde)")
        app.buttons[kohde].firstMatch.tap()
    }

    private func etsi(_ app: XCUIApplication, _ teksti: String) {
        palkki(app)
        let haku = app.searchFields.firstMatch
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText(teksti)
    }

    private func kuva(_ nimi: String) {
        let liite = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        liite.name = nimi
        liite.lifetime = .keepAlways
        add(liite)
    }

    func testListaJaSkooppi() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        palkki(app)
        // Chatit ja skoopit samassa listassa.
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).firstMatch.waitForExistence(timeout: 15), "skoopit puuttuvat palkista")
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "identifier MATCHES 'chat-[0-9a-f]{8}-.*'")).firstMatch.exists, "chatit puuttuvat palkista")
        kuva("sivupalkki")
        // Suodatin All / Scope / Chat otsikon paikalla (DEMO-SCOPES-LISTA); Uusi chat -rivi ja Scopes-otsikko pois.
        XCTAssertFalse(app.navigationBars["Scopes"].exists, "Scopes-otsikko näkyy yhä")
        let skooppiRivit = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'"))
        let chatRivit = app.buttons.matching(NSPredicate(format: "identifier MATCHES 'chat-[0-9a-f]{8}-.*'"))
        app.buttons["suodatin-scope"].tap()
        XCTAssertTrue(chatRivit.firstMatch.waitForNonExistence(timeout: 5), "Scope-suodatin näyttää chatit")
        XCTAssertTrue(skooppiRivit.firstMatch.exists, "Scope-suodatin piilotti skoopit")
        kuva("suodatin-scope")
        app.buttons["suodatin-chat"].tap()
        XCTAssertTrue(skooppiRivit.firstMatch.waitForNonExistence(timeout: 5), "Chat-suodatin näyttää skoopit")
        XCTAssertTrue(chatRivit.firstMatch.exists, "Chat-suodatin piilotti chatit")
        app.buttons["suodatin-all"].tap()
        XCTAssertTrue(chatRivit.firstMatch.waitForExistence(timeout: 5) && skooppiRivit.firstMatch.exists, "All ei palauttanut kaikkia")
        let haku = app.searchFields.firstMatch
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText("scopes")
        let rivi = app.buttons["skooppi-scopes"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia")
        rivi.tap()
        // Napautus avaa skoopin viestit (DEMO-SCOPES-VALILEHDET); tämä skooppi on auki testin ajan.
        XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15), "skoopin viestit eivät latautuneet")
        // Syöttökenttä vain tmux-istunnolle; muuten (esim. Remote Control -istunto) vain luku -teksti.
        XCTAssertTrue(app.textFields["viestit-kentta"].exists || app.textViews["viestit-kentta"].exists || app.staticTexts["viestit-vain-luku"].exists, "syöttökenttä puuttuu")
        // Testiä ajava istunto käyttää työkaluja, joten sen viesteissä on työkalurivejä (DEMO-SCOPES-PARANNUKSET).
        XCTAssertTrue(app.staticTexts["tyokalu-rivi"].firstMatch.waitForExistence(timeout: 15), "työkalurivit puuttuvat")
        kuva("viestit")
        app.buttons["tiedot"].tap()
        XCTAssertTrue(app.staticTexts["seuraava-id"].waitForExistence(timeout: 15), "skoopin näkymä ei latautunut")
        kuva("skooppi")
    }

    // Sivupalkki: infra, chat ja asetukset; sivuttaisveto missä tahansa avaa palkin (DEMO-SCOPES-SIVUPALKKI).
    func testValilehdetJaInfraPuu() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        // Painallus keskelle ei avaa palkkia; veto keskeltä oikealle avaa; napautus himmennykseen sulkee.
        let keski = app.coordinate(withNormalizedOffset: CGVector(dx: 0.3, dy: 0.5))
        keski.tap()
        usleep(800_000)
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "painallus avasi palkin")
        keski.press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.52)))
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true), "sivuttaisveto ei avannut palkkia")
        kuva("sivuttaisveto")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "palkki ei sulkeutunut")
        // Reunaveto toimii yhä.
        let alku = app.coordinate(withNormalizedOffset: CGVector(dx: 0.01, dy: 0.5))
        alku.press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.8, dy: 0.5)))
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true), "reunaveto ei avannut palkkia")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "palkki ei sulkeutunut")
        nayta(app, "sivupalkki-infra")
        // Avausnuoli ja siirtymä ovat erilliset painikkeet (DEMO-SCOPES-PARANNUKSET): nuoli avaa alaskoopit
        // siirtymättä, rivi avaa lisätiedot.
        let avaa = app.buttons["infra-avaa-claude"]
        XCTAssertTrue(avaa.waitForExistence(timeout: 15), "infrapuu ei latautunut")
        XCTAssertFalse(app.buttons["infra-claude demo"].exists, "alaskoopit näkyvät ennen avausta")
        kuva("infra")
        avaa.tap()
        XCTAssertTrue(app.buttons["infra-avaa-claude demo"].waitForExistence(timeout: 5), "nuoli ei avannut alaskooppeja")
        XCTAssertFalse(app.staticTexts["seuraava-id"].exists, "nuoli siirtyi lisätietoihin")
        app.buttons["infra-avaa-claude demo"].tap()
        XCTAssertTrue(app.buttons["infra-claude demo linkedin"].waitForExistence(timeout: 5), "toinen taso ei auennut")
        kuva("infra-auki")
        app.buttons["infra-claude demo linkedin"].tap()
        XCTAssertTrue(app.staticTexts["seuraava-id"].waitForExistence(timeout: 15), "infran lisätiedot eivät auenneet")
        // Nuoli on näkymän juuressa; lisätiedoista palataan ensin takaisin. Kiinni olevan palkin suodatinnapit ovat
        // myös navigointipalkeissa (ruudun ulkopuolella), joten paluu = vasemmanpuoleisin osuttava nappi.
        let paluu = app.navigationBars.buttons.allElementsBoundByIndex.filter { $0.isHittable }.min { $0.frame.minX < $1.frame.minX }
        try XCTUnwrap(paluu, "paluunappi puuttuu").tap()
        // Uusi chat -riviä ei ole (DEMO-SCOPES-LISTA): chattiin palataan listan chatista.
        palkki(app)
        let chat = app.buttons.matching(NSPredicate(format: "identifier MATCHES 'chat-[0-9a-f]{8}-.*'")).firstMatch
        XCTAssertTrue(chat.waitForExistence(timeout: 15), "palkissa ei chatteja")
        chat.tap()
        XCTAssertTrue(app.buttons["chat-agentti"].waitForExistence(timeout: 15))
        XCTAssertFalse(app.buttons["chat-historia"].exists, "kello kuuluu pois chatista")
        kuva("chat-syotto")
        nayta(app, "asetukset")
        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5))
    }

    // Skoopin konteksti (SCOPES-INFRA-KONTEKSTI): infran skoopin lisätiedoista kontekstinäkymään, siitä tiedoston osan
    // tekstiin. Juuriskooppi "scopes" on aina olemassa ja sillä on rekisteri.
    func testSkoopinKonteksti() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "sivupalkki-infra")
        XCTAssertTrue(app.buttons["infra-avaa-claude"].waitForExistence(timeout: 15), "infrapuu ei latautunut")
        // Puu on aakkosjärjestyksessä ja lista laiska: "scopes" tulee näkyviin vierittämällä.
        let skooppi = app.buttons["infra-scopes"]
        for _ in 0..<8 where !(skooppi.exists && skooppi.isHittable) { app.swipeUp() }
        XCTAssertTrue(skooppi.isHittable, "infrapuussa ei ole skooppia scopes")
        skooppi.tap()
        let avaa = app.buttons["konteksti-avaa"]
        XCTAssertTrue(avaa.waitForExistence(timeout: 15), "skoopin näkymässä ei ole kontekstia")
        kuva("skooppi-konteksti")
        avaa.tap()
        XCTAssertTrue(app.navigationBars["Konteksti"].waitForExistence(timeout: 5), "kontekstinäkymä ei auennut")
        XCTAssertTrue(app.buttons["konteksti-jaa"].exists, "jakopainike puuttuu")
        kuva("konteksti")
        let osa = app.buttons["konteksti-osa-0-0"]
        for _ in 0..<6 where !osa.isHittable { app.swipeUp() }
        XCTAssertTrue(osa.isHittable, "rekisterin ensimmäinen osa ei näy")
        osa.tap()
        XCTAssertTrue(app.staticTexts["konteksti-teksti"].waitForExistence(timeout: 5), "osan teksti ei näy")
        kuva("konteksti-teksti")
    }

    // Monivalinta korttina (DEMO-SCOPES-LISTA). Vastattu kortti piilotetaan, joten kortti näkyy vain, kun skoopin
    // istunto odottaa vastausta: kysymys on viimeinen viesti ja lista on vieritetty sen kohdalle. Oikea data:
    // SCOPES_KOE_KYSYMYS nimeää skoopin, jonka istunto kysyy ajon aikana; SCOPES_KOE_KORTTI_ODOTA (s) odottaa sitä.
    func testKysymysKortti() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skooppi = ymp["SCOPES_KOE_KYSYMYS"] ?? "claude demo linkedin"
        let odota = TimeInterval(ymp["SCOPES_KOE_KORTTI_ODOTA"] ?? "") ?? 5
        let app = kaynnista(avain: avain)
        etsi(app, skooppi)
        let rivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia")
        rivi.tap()
        guard app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15) else { throw XCTSkip("skooppi ei ole auki") }
        let kortti = app.descendants(matching: .any)["kysymys-kortti"].firstMatch
        guard kortti.waitForExistence(timeout: odota) else { throw XCTSkip("skoopin istunto ei odota monivalintaa") }
        // Muu-kenttä vain, kun äppi saa lähettää istuntoon (voiLahettaa); vaihtoehdot aina.
        XCTAssertTrue(app.buttons["kysymys-vaihtoehto-0-0"].exists, "kortista puuttuu vaihtoehto")
        kuva("kysymys-kortti")
    }

    // Chat oikeaa palvelua vastaan halvimmalla mallilla: yksi lyhyt kysymys (noin 1 snt).
    func testChatVastaa() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        let agentti = app.buttons["chat-agentti"]
        XCTAssertTrue(agentti.waitForExistence(timeout: 15))
        agentti.tap()
        XCTAssertTrue(app.buttons["Haiku 5.5"].waitForExistence(timeout: 5), "mallivalikko puuttuu")
        XCTAssertFalse(app.buttons["toteuttaja-sonnet"].exists, "agentit eivät kuulu mallivalikkoon")
        kuva("chat-valikko")
        app.buttons["Haiku 5.5"].tap()
        let kentta = app.textFields["chat-kentta"].exists ? app.textFields["chat-kentta"] : app.textViews["chat-kentta"]
        kentta.tap()
        kentta.typeText("Vastaa pelkällä sanalla: kurpitsa")
        app.buttons["chat-laheta"].tap()
        let vastaus = app.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'kurpitsa' AND NOT label BEGINSWITH 'Vastaa'")).firstMatch
        XCTAssertTrue(vastaus.waitForExistence(timeout: 120), app.staticTexts["chat-virhe"].exists ? app.staticTexts["chat-virhe"].label : "vastaus puuttuu")
        // Suoratoistossa kupla näkyy jo kirjoituksen aikana; uusi keskustelu on estetty, kunnes vastaus on valmis.
        XCTAssertTrue(app.staticTexts["chat-kirjoittaa"].waitForNonExistence(timeout: 120), "vastaus ei valmistunut")
        kuva("chat-vastaus")
        // Keskusteluhistoria (DEMO-SCOPES-PARANNUKSET): uusi keskustelu tyhjentää, historiasta uusin palauttaa sen.
        app.buttons["chat-uusi"].tap()
        XCTAssertFalse(vastaus.exists, "uusi keskustelu ei tyhjentänyt")
        palkki(app)
        // Uusin muutos ensin: juuri käyty chat on palkin ensimmäinen chat.
        let uusin = app.buttons.matching(NSPredicate(format: "identifier MATCHES 'chat-[0-9a-f]{8}-.*'")).firstMatch
        XCTAssertTrue(uusin.waitForExistence(timeout: 15), app.staticTexts["sivupalkki-virhe"].exists ? app.staticTexts["sivupalkki-virhe"].label : "palkissa ei chatteja")
        XCTAssertTrue(uusin.label.contains("kurpitsa"), uusin.label)
        kuva("chat-historia")
        uusin.tap()
        XCTAssertTrue(vastaus.waitForExistence(timeout: 15), "historian keskustelu ei avautunut")
        XCTAssertTrue(app.navigationBars["Haiku 5.5"].waitForExistence(timeout: 5), "keskustelun malli ei palautunut")
        kuva("chat-palautettu")
    }

    // Suoratoisto (DEMO-SCOPES-SUORATOISTO): agentin kupla näkyy jo kirjoituksen aikana ja kasvaa valmiiksi.
    func testChatSuoratoisto() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        let agentti = app.buttons["chat-agentti"]
        XCTAssertTrue(agentti.waitForExistence(timeout: 15))
        agentti.tap()
        XCTAssertTrue(app.buttons["Haiku 5.5"].waitForExistence(timeout: 5), "mallivalikko puuttuu")
        app.buttons["Haiku 5.5"].tap()
        let kentta = app.textFields["chat-kentta"].exists ? app.textFields["chat-kentta"] : app.textViews["chat-kentta"]
        kentta.tap()
        kentta.typeText("Kirjoita numerot yhdestä neljäänkymmeneen suomeksi sanoina, pilkuilla erotettuina, ei muuta.")
        app.buttons["chat-laheta"].tap()
        let kirjoittaa = app.staticTexts["chat-kirjoittaa"]
        XCTAssertTrue(kirjoittaa.waitForExistence(timeout: 120), app.staticTexts["chat-virhe"].exists ? app.staticTexts["chat-virhe"].label : "suoratoisto ei näkynyt")
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH[c] 'yksi'")).firstMatch.waitForExistence(timeout: 30), "kupla puuttuu")
        kuva("chat-suoratoisto-kesken")
        XCTAssertTrue(kirjoittaa.waitForNonExistence(timeout: 120), "vastaus ei valmistunut")
        let valmis = app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH[c] 'yksi'")).firstMatch.label
        XCTAssertTrue(valmis.lowercased().contains("neljäkymmentä"), valmis)
        // Vastaus valmistuu usein sekunnissa, jolloin välitilaa ei ehdi lukea: palojen määrä todentaa vähittäisen päivityksen.
        let arvo = app.descendants(matching: .any)["chat-viestit"].value as? String ?? ""
        XCTAssertGreaterThan(Int(arvo.split(separator: " ").first ?? "") ?? 0, 1, "kupla päivittyi kerralla: \(arvo)")
        XCTAssertFalse(app.staticTexts["chat-virhe"].exists)
        kuva("chat-suoratoisto-valmis")
    }

    // Näyttölukko tai äpin vaihto kesken vastauksen (DEMO-SCOPES-YHTEYS): palvelin jatkaa ajoa, ja äppi liittyy siihen
    // palatessaan, joten vastaus valmistuu ilman virhettä. Taustalla yli taustatehtävän ajan (30 s), jotta yhteys katkeaa.
    func testChatKestaaTaustan() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        let agentti = app.buttons["chat-agentti"]
        XCTAssertTrue(agentti.waitForExistence(timeout: 15))
        agentti.tap()
        XCTAssertTrue(app.buttons["Haiku 5.5"].waitForExistence(timeout: 5), "mallivalikko puuttuu")
        app.buttons["Haiku 5.5"].tap()
        let kentta = app.textFields["chat-kentta"].exists ? app.textFields["chat-kentta"] : app.textViews["chat-kentta"]
        kentta.tap()
        kentta.typeText("Kirjoita numerot yhdestä kuuteenkymmeneen suomeksi sanoina, pilkuilla erotettuina, ei muuta.")
        app.buttons["chat-laheta"].tap()
        XCTAssertTrue(app.staticTexts["chat-kirjoittaa"].waitForExistence(timeout: 120) || app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH[c] 'yksi'")).firstMatch.exists, "vastaus ei alkanut")
        XCUIDevice.shared.press(.home)
        sleep(45)
        app.activate()
        let valmis = app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH[c] 'yksi'")).firstMatch
        XCTAssertTrue(valmis.waitForExistence(timeout: 60), "kupla puuttuu paluun jälkeen")
        XCTAssertTrue(app.staticTexts["chat-kirjoittaa"].waitForNonExistence(timeout: 120), "vastaus ei valmistunut")
        kuva("chat-tausta")
        XCTAssertTrue(valmis.label.lowercased().contains("kuusikymmentä"), valmis.label)
        XCTAssertFalse(app.staticTexts["chat-virhe"].exists, app.staticTexts["chat-virhe"].exists ? app.staticTexts["chat-virhe"].label : "")
        XCTAssertFalse(app.buttons["chat-yhdista"].exists, "uudelleenyhdistys jäi näkyviin")
    }

    func testVaaraAvainNayttaaVirheen() {
        let app = kaynnista(avain: "vaara-avain")
        let virhe = app.staticTexts["chat-virhe"]
        XCTAssertTrue(virhe.waitForExistence(timeout: 15))
        XCTAssertTrue(virhe.label.contains("401"), virhe.label)
    }

    // Hallintatoiminnot (DEMO-SCOPES-HALLINTA): testit käyttävät vain palvelun hylkäämiä pyyntöjä, joten
    // simulaattoriajo ei avaa istuntoja, pakkaa eikä luo skooppeja. Onnistunut polku todennetaan palvelimella.
    func testUusiSkooppiTarkistaaNimenJaPalvelunHylkays() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        palkki(app)
        XCTAssertTrue(app.buttons["uusi"].waitForExistence(timeout: 15))
        app.buttons["uusi"].tap()
        let kentta = app.textFields["uusi-nimi"]
        XCTAssertTrue(kentta.waitForExistence(timeout: 5))
        kentta.tap()
        kentta.typeText("Iso; rm")
        XCTAssertFalse(app.buttons["uusi-luo"].isEnabled, "kelvoton nimi ei saa olla lähetettävissä")
        kentta.clearText()
        kentta.typeText("scopes")
        XCTAssertTrue(app.buttons["uusi-luo"].isEnabled)
        app.buttons["uusi-luo"].tap()
        XCTAssertTrue(app.buttons["Luo"].firstMatch.waitForExistence(timeout: 5), "vahvistus puuttuu")
        app.buttons["Luo"].firstMatch.tap()
        let virhe = app.staticTexts["uusi-virhe"]
        XCTAssertTrue(virhe.waitForExistence(timeout: 20))
        XCTAssertTrue(virhe.label.contains("409"), virhe.label)
        kuva("uusi-hylatty")
    }

    func testPakkaaIlmanIstuntoaHylataan() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        etsi(app, "demo tyokalut")
        let rivi = app.buttons["skooppi-claude demo tyokalut"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15))
        rivi.tap()
        // Skooppi ilman istuntoa: viesti ja Pura-painike (painiketta ei paineta: se avaisi istunnon).
        XCTAssertTrue(app.staticTexts["ei-auki"].waitForExistence(timeout: 15), "ei auki -viesti puuttuu")
        XCTAssertTrue(app.buttons["viestit-pura"].exists)
        kuva("ei-auki")
        app.buttons["tiedot"].tap()
        XCTAssertTrue(app.buttons["toiminto-pakkaa"].waitForExistence(timeout: 15))
        XCTAssertTrue(app.buttons["toiminto-pura"].exists)
        app.buttons["toiminto-pakkaa"].tap()
        XCTAssertTrue(app.buttons["Pakkaa"].firstMatch.waitForExistence(timeout: 5), "vahvistus puuttuu")
        kuva("pakkaa-vahvistus")
        app.buttons["Pakkaa"].firstMatch.tap()
        let virhe = app.staticTexts["toiminto-virhe"]
        XCTAssertTrue(virhe.waitForExistence(timeout: 20))
        XCTAssertTrue(virhe.label.contains("409"), virhe.label)
        kuva("pakkaa-hylatty")
    }

    // Kirjoittava koe (DEMO-SCOPES-PUHELIN): avaa oikean istunnon. Ajetaan vain, kun SCOPES_KOE_PURA nimeää koeskoopin.
    func testPuraAvaaIstunnon() throws {
        let ymp = ProcessInfo.processInfo.environment
        guard let koe = ymp["SCOPES_KOE_PURA"], !koe.isEmpty else { throw XCTSkip("SCOPES_KOE_PURA puuttuu") }
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        etsi(app, koe)
        let rivi = app.buttons["skooppi-\(koe)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15))
        rivi.tap()
        // Viestinäkymän Pura purkaa ja avaa viestit (DEMO-SCOPES-VALILEHDET).
        XCTAssertTrue(app.buttons["viestit-pura"].waitForExistence(timeout: 15))
        app.buttons["viestit-pura"].tap()
        let auki = app.staticTexts["viestit-istunto"]
        let virhe = app.staticTexts["viestit-virhe"]
        let loppu = Date().addingTimeInterval(240)
        while !auki.exists && !virhe.exists && Date() < loppu { sleep(2) }
        kuva("pura-tulos")
        XCTAssertFalse(virhe.exists, virhe.exists ? virhe.label : "")
        XCTAssertTrue(auki.exists, "pura ei avannut viestejä 240 s:ssa")
    }
}

private extension XCUIElement {
    func clearText() {
        guard let teksti = value as? String, !teksti.isEmpty else { return }
        tap()
        typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: teksti.count))
    }
}
