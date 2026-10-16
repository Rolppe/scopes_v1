// Simulaattoritesti oikeaa palvelua vastaan. Avain tulee ajajalta: `TEST_RUNNER_SCOPES_AVAIN=… xcodebuild test`
// (xcodebuild antaa TEST_RUNNER_-etuliitteiset muuttujat testiajurille ilman etuliitettä); ei koodissa.
import XCTest

final class SkoopitUITests: XCTestCase {
    private func kaynnista(avain: String?, lisa: [String: String] = [:]) -> XCUIApplication {
        let app = XCUIApplication()
        let ymp = ProcessInfo.processInfo.environment
        app.launchEnvironment["SCOPES_OSOITE"] = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
        app.launchEnvironment["SCOPES_AVAIN"] = avain ?? ""
        app.launchEnvironment.merge(lisa) { $1 }
        app.launch()
        return app
    }

    // Sivupalkki vasemman yläkulman nuolesta (DEMO-SCOPES-SIVUPALKKI); kohde = palkin painikkeen tunnus.
    // Käynnistys avaa palkin itse, kun keskustelu ei ole kesken; silloin nuolta ei paineta (se osuisi himmennykseen).
    private func palkki(_ app: XCUIApplication) {
        let nuoli = app.buttons["sivupalkki"].firstMatch
        XCTAssertTrue(nuoli.waitForExistence(timeout: 15), "sivupalkin nuoli puuttuu")
        if !osuttava(app.buttons["suodatin-all"], true, timeout: 1) { nuoli.tap() }
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

    // Chattiin käynnistyksen jälkeen: palkki suljetaan napauttamalla himmennystä sen oikealla puolella.
    private func chattiin(_ app: XCUIApplication) {
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true, timeout: 15), "lista ei auennut käynnistyksessä")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "palkki ei sulkeutunut")
    }

    // Asetusten alavalikosta juureen (paluupainikkeen otsikko on juuren otsikko).
    private func takaisin(_ app: XCUIApplication, _ alavalikko: String) {
        app.navigationBars[alavalikko].buttons["Asetukset"].tap()
        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5), "paluu juureen ei onnistunut")
    }

    // Form luo alemmat rivit vasta vieritettäessä: vieritä, kunnes elementti on olemassa.
    @discardableResult
    private func nakyviin(_ app: XCUIApplication, _ e: XCUIElement) -> Bool {
        for _ in 0..<4 where !e.waitForExistence(timeout: 2) { app.swipeUp() }
        return e.exists
    }

    // Form-rivin Toggle: rivin keskikohdan napautus osuu otsikkoon, joten napautetaan oikeaa reunaa.
    private func kytke(_ e: XCUIElement) {
        e.coordinate(withNormalizedOffset: CGVector(dx: 0.93, dy: 0.5)).tap()
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

    // Lisätietojen latautumisen merkki: seuraava paketti tai sen puuttuminen ("ei mitään"), V-266.
    private func seuraava(_ app: XCUIApplication) -> XCUIElement {
        app.staticTexts.matching(NSPredicate(format: "identifier IN {'seuraava-id', 'seuraava-ei'}")).firstMatch
    }

    // Käynnistys ilman kesken olevaa keskustelua avaa listan (käyttäjä 13.10.2026); palkkia ei avata käsin.
    func testKaynnistysAvaaListan() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true, timeout: 15), "lista ei auennut käynnistyksessä")
        kuva("kaynnistys-lista")
    }

    // Etäyhteys (SCOPES-ETAYHTEYS 14.10.2026): pakotettu tunneli hakee asetuksen kotiverkosta, avaa äpin oman
    // WireGuard-tunnelin ja lataa skooppilistan sen läpi; asetukset näyttävät reitin.
    func testEtatunneli() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain, lisa: ["SCOPES_TUNNELI": "pakota"])
        palkki(app)
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).firstMatch.waitForExistence(timeout: 20), "skoopit eivät latautuneet tunnelin läpi")
        app.buttons["asetukset"].tap()
        app.buttons["asetukset-yhteys"].tap()
        let reitti = app.staticTexts["reitti"]
        XCTAssertTrue(reitti.waitForExistence(timeout: 5), "reittirivi puuttuu")
        XCTAssertEqual(reitti.label, "Etätunneli (WireGuard)")
        kuva("etatunneli-asetukset")
    }

    // Listan avaus piilottaa näppäimistön; paluu samaan keskusteluun palauttaa kursorin kenttään ja näppäimistön,
    // toiseen näkymään vaihto ei (käyttäjä 13.10.2026).
    func testListaPiilottaaNappaimiston() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        chattiin(app)
        let kentta = app.textFields["chat-kentta"].exists ? app.textFields["chat-kentta"] : app.textViews["chat-kentta"]
        XCTAssertTrue(kentta.waitForExistence(timeout: 15))
        kentta.tap()
        kentta.typeText("kesken")
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5), "näppäimistö ei auennut")
        app.buttons["sivupalkki"].firstMatch.tap()
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true), "sivupalkki ei auennut")
        XCTAssertTrue(app.keyboards.firstMatch.waitForNonExistence(timeout: 5), "näppäimistö jäi listan päälle")
        kuva("lista-ilman-nappaimistoa")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "palkki ei sulkeutunut")
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5), "näppäimistö ei palannut")
        XCTAssertTrue(kentta.value(forKey: "hasKeyboardFocus") as? Bool == true, "kursori ei palannut kenttään")
        kentta.typeText(" jatkuu")
        XCTAssertEqual(kentta.value as? String, "kesken jatkuu", "kursori ei palannut samaan kohtaan")
        kuva("nappaimisto-palasi")
        // Toiseen näkymään vaihto ei palauta näppäimistöä.
        nayta(app, "sivupalkki-infra")
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "palkki ei sulkeutunut")
        XCTAssertFalse(app.keyboards.firstMatch.waitForExistence(timeout: 2), "näppäimistö palasi toiseen näkymään")
    }

    // Alapalkki on listan alla eikä päällä (DESIGN-UX-A U2): loppuun vieritettynä alin rivi on kokonaan napin yllä.
    func testAlapalkkiEiPeitaListaa() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        palkki(app)
        let infra = app.buttons["sivupalkki-infra"]
        XCTAssertTrue(infra.waitForExistence(timeout: 15))
        let rivit = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-' OR identifier BEGINSWITH 'chat-'"))
        XCTAssertTrue(rivit.firstMatch.waitForExistence(timeout: 15), "listassa ei rivejä")
        // Vieritetään, kunnes viimeinen ladattu rivi ei enää liiku: vasta lopussa alin rivi ei saa olla palkin takana.
        var edellinen = CGRect.null
        for _ in 0..<40 {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.7))
                .press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.15)))
            sleep(1)
            let nyt = rivit.allElementsBoundByIndex.last?.frame ?? .null
            if nyt == edellinen { break }
            edellinen = nyt
        }
        let alin = try XCTUnwrap(rivit.allElementsBoundByIndex.filter(\.isHittable).max { $0.frame.maxY < $1.frame.maxY })
        XCTAssertLessThanOrEqual(alin.frame.maxY, infra.frame.minY, "alin rivi jää alapalkin alle: \(alin.identifier)")
        kuva("lista-alareuna")
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
        // Pakattu skooppi valuu aktiivisten alle (SCOPES-LISTA-TILAVARIT): ensimmäinen skooppi on auki, koska testiä ajava istunto on.
        XCTAssertFalse(skooppiRivit.firstMatch.label.contains("pakattu"), "pakattu skooppi ylimpänä: \(skooppiRivit.firstMatch.label)")
        // Valmiit (vihreä "odottaa sinua") käsittelyssä olevien ja kyselykorttien alle, pakatut alimmaksi (SCOPES-LISTA-JARJESTYS).
        let tasot = skooppiRivit.allElementsBoundByIndex.map(\.label).map { $0.contains("pakattu") ? 2 : $0.contains("odottaa sinua") ? 1 : 0 }
        XCTAssertEqual(tasot, tasot.sorted(), "skooppien järjestys ei ole käsittely/kysely → valmis → pakattu: \(tasot)")
        app.buttons["suodatin-chat"].tap()
        XCTAssertTrue(skooppiRivit.firstMatch.waitForNonExistence(timeout: 5), "Chat-suodatin näyttää skoopit")
        XCTAssertTrue(chatRivit.firstMatch.exists, "Chat-suodatin piilotti chatit")
        app.buttons["suodatin-all"].tap()
        XCTAssertTrue(chatRivit.firstMatch.waitForExistence(timeout: 5) && skooppiRivit.firstMatch.exists, "All ei palauttanut kaikkia")
        let haku = app.searchFields.firstMatch
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        // Auki oleva skooppi: testiä ajavan istunnon skooppi. Juuriskooppi "scopes" pakattiin, kun työ jaettiin
        // alaskooppeihin (13.10.2026), joten oletus on alaskooppi; muu skooppi: SCOPES_KOE_AUKI="<skooppi>" bash …/testi.sh
        let auki = ProcessInfo.processInfo.environment["SCOPES_KOE_AUKI"] ?? "scopes lista"
        haku.typeText(auki)
        let rivi = app.buttons["skooppi-\(auki)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia \(auki)")
        rivi.tap()
        // Napautus avaa skoopin viestit (DEMO-SCOPES-VALILEHDET).
        XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15),
                      app.staticTexts["pakattu"].exists || app.staticTexts["ei-auki"].exists
                          ? "\(auki) ei ole auki: aja SCOPES_KOE_AUKI=\"<auki oleva skooppi>\"" : "skoopin viestit eivät latautuneet")
        // Syöttökenttä vain tmux-istunnolle; muuten (esim. Remote Control -istunto) vain luku -teksti.
        XCTAssertTrue(app.textFields["viestit-kentta"].exists || app.textViews["viestit-kentta"].exists || app.staticTexts["viestit-vain-luku"].exists, "syöttökenttä puuttuu")
        // Testiä ajava istunto käyttää työkaluja, joten sen viesteissä on työkalurivejä (DEMO-SCOPES-PARANNUKSET).
        XCTAssertTrue(app.staticTexts["tyokalu-rivi"].firstMatch.waitForExistence(timeout: 15), "työkalurivit puuttuvat")
        kuva("viestit")
        app.buttons["tiedot"].tap()
        XCTAssertTrue(seuraava(app).waitForExistence(timeout: 15), "skoopin näkymä ei latautunut")
        kuva("skooppi")
    }

    // Sivupalkki: infra, chat ja asetukset; sivuttaisveto missä tahansa avaa palkin (DEMO-SCOPES-SIVUPALKKI).
    func testValilehdetJaInfraPuu() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        chattiin(app)
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
        XCTAssertFalse(seuraava(app).exists, "nuoli siirtyi lisätietoihin")
        app.buttons["infra-avaa-claude demo"].tap()
        XCTAssertTrue(app.buttons["infra-claude demo linkedin"].waitForExistence(timeout: 5), "toinen taso ei auennut")
        kuva("infra-auki")
        app.buttons["infra-claude demo linkedin"].tap()
        XCTAssertTrue(seuraava(app).waitForExistence(timeout: 15), "infran lisätiedot eivät auenneet")
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

    // Pääskooppien järjestys (käyttäjä 14.10.2026): pitkä painallus irrottaa kortin, raahaus siirtää sen (.onMove).
    // Lopuksi claude palautetaan ensimmäiseksi, jotta muut testit näkevät saman järjestyksen.
    func testInfraJarjestys() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "sivupalkki-infra")
        let claude = app.buttons["infra-claude"], infra = app.buttons["infra-infra"]
        XCTAssertTrue(claude.waitForExistence(timeout: 15), "infrapuu ei latautunut")
        XCTAssertTrue(infra.exists)
        XCTAssertLessThan(claude.frame.minY, infra.frame.minY, "claude ei ole infran yläpuolella lähtötilassa")
        func raahaa(_ mista: XCUIElement, _ mihin: XCUIElement) {
            let alku = mista.coordinate(withNormalizedOffset: CGVector(dx: 0.3, dy: 0.5))
            alku.press(forDuration: 1.5, thenDragTo: mihin.coordinate(withNormalizedOffset: CGVector(dx: 0.3, dy: 0.6)),
                       withVelocity: .slow, thenHoldForDuration: 1.0)
            usleep(800_000)
        }
        raahaa(claude, infra)
        kuva("infra-jarjestys")
        XCTAssertGreaterThan(claude.frame.minY, infra.frame.minY, "claude ei siirtynyt infran alle")
        let ensimmainen = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'infra-' AND NOT identifier BEGINSWITH 'infra-avaa-'"))
            .allElementsBoundByIndex.filter { $0.isHittable }.min { $0.frame.minY < $1.frame.minY }
        raahaa(claude, try XCTUnwrap(ensimmainen))
        XCTAssertLessThan(claude.frame.minY, infra.frame.minY, "claude ei palannut ylös")
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
        XCTAssertTrue(app.buttons["konteksti-jaa"].waitForExistence(timeout: 5), "kontekstinäkymä ei auennut")
        XCTAssertTrue(app.navigationBars["scopes"].exists, "kontekstinäkymän otsikko ei ole skoopin nimi")
        kuva("konteksti")
        let osa = app.buttons["konteksti-osa-0-0"]
        for _ in 0..<6 where !osa.isHittable { app.swipeUp() }
        XCTAssertTrue(osa.isHittable, "ensimmäisen ryhmän (elävän istunnon kehote tai rekisteri, V-400) ensimmäinen osa ei näy")
        osa.tap()
        XCTAssertTrue(app.staticTexts["konteksti-teksti"].waitForExistence(timeout: 5), "osan teksti ei näy")
        kuva("konteksti-teksti")
        // Takaisin kontekstinäkymään: paluunapin nimi on edellisen näkymän otsikko (skoopin nimi).
        app.navigationBars.buttons["scopes"].firstMatch.tap()
        XCTAssertTrue(app.buttons["konteksti-jarjestys"].waitForExistence(timeout: 5), "järjestysvalikko puuttuu")
        app.buttons["konteksti-jarjestys"].tap()
        app.buttons["Koko"].tap()
        app.swipeDown()
        kuva("konteksti-koko")
    }

    // Elävän istunnon ladatut osat kontekstinäkymässä (SCOPES-KONTEKSTI-LADATUT V-400 15.10.2026): ensimmäinen ryhmä on
    // järjestelmäkehote ja sen osa avautuu tekstinä. Vaatii elävän istunnon skoopissa SCOPES_KOE_LADATUT (oletus scopes infra).
    func testKontekstiLadatut() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let nimi = ProcessInfo.processInfo.environment["SCOPES_KOE_LADATUT"] ?? "scopes infra"
        let app = kaynnista(avain: avain)
        nayta(app, "sivupalkki-infra")
        XCTAssertTrue(app.buttons["infra-avaa-claude"].waitForExistence(timeout: 15), "infrapuu ei latautunut")
        // Lista on laiska: alaskooppien vanhempi tulee näkyviin vierittämällä.
        let vanhempi = app.buttons["infra-avaa-\(nimi.split(separator: " ")[0])"]
        for _ in 0..<8 where !(vanhempi.exists && vanhempi.isHittable) { app.swipeUp() }
        vanhempi.tap()
        let skooppi = app.buttons["infra-\(nimi)"]
        for _ in 0..<8 where !(skooppi.exists && skooppi.isHittable) { app.swipeUp() }
        XCTAssertTrue(skooppi.isHittable, "infrapuussa ei ole skooppia \(nimi)")
        skooppi.tap()
        let avaa = app.buttons["konteksti-avaa"]
        XCTAssertTrue(avaa.waitForExistence(timeout: 15), "skoopin näkymässä ei ole kontekstia")
        avaa.tap()
        XCTAssertTrue(app.staticTexts["Järjestelmäkehote"].firstMatch.waitForExistence(timeout: 5), "ladattu kehote puuttuu")
        kuva("ladatut")
        app.swipeUp()
        kuva("ladatut-2")
        let osa = app.buttons["konteksti-osa-0-0"]
        for _ in 0..<12 where !osa.isHittable { app.swipeUp() }
        XCTAssertTrue(osa.isHittable, "kehotteen ensimmäinen osa ei näy")
        osa.tap()
        XCTAssertTrue(app.staticTexts["konteksti-teksti"].waitForExistence(timeout: 5), "kehotteen teksti ei näy")
        kuva("ladattu-kehote")
    }

    // Kaikkien skooppien rekisterit katon täyttöasteen mukaan (SCOPES-INFRA-REKISTERIT 14.10.2026): Infra › Rekisterit,
    // järjestyksen vaihto ja tiedoston osat. Vaatii palvelun, joka tuntee /api/rekisterit (SCOPES_OSOITE koeinstanssiin).
    func testRekisterit() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "sivupalkki-infra")
        let rivi = app.buttons["infra-rekisterit"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "Infrassa ei ole Rekisterit-riviä")
        kuva("infra-rekisterit")
        rivi.tap()
        let ensimmainen = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'rekisteri-'")).firstMatch
        XCTAssertTrue(ensimmainen.waitForExistence(timeout: 10), "rekisterilista on tyhjä")
        kuva("rekisterit-aste")
        app.buttons["rekisterit-jarjestys"].tap()
        app.buttons["Koko"].tap()
        kuva("rekisterit-koko")
        ensimmainen.tap()
        XCTAssertTrue(app.buttons["rekisteri-osat-jarjestys"].waitForExistence(timeout: 5), "osanäkymä ei auennut")
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS '%'")).firstMatch.waitForExistence(timeout: 10), "osat eivät latautuneet")
        kuva("rekisterin-osat")
    }

    // palvelimen osio Infrassa (SCOPES-LINUX-NAPIT): tila näkyy, ja vain tilaan sopiva nappi on käytössä; nappi
    // kysyy vahvistuksen, joka suljetaan ajamatta mitään.
    func testLinuxServerOsio() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "sivupalkki-infra")
        let kaynnista = app.buttons["linux-kaynnista"], sammuta = app.buttons["linux-sammuta"]
        XCTAssertTrue(kaynnista.waitForExistence(timeout: 15), "Infrassa ei ole palvelin-osiota")
        XCTAssertTrue(sammuta.exists)
        XCTAssertNotEqual(kaynnista.isEnabled, sammuta.isEnabled, "täsmälleen yhden napin pitää olla käytössä")
        kuva("linux-osio")
        (kaynnista.isEnabled ? kaynnista : sammuta).tap()
        XCTAssertTrue(app.buttons["linux-vahvista"].waitForExistence(timeout: 5), "vahvistus puuttuu")
        kuva("linux-vahvistus")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.08)).tap()
        XCTAssertTrue(app.buttons["linux-vahvista"].waitForNonExistence(timeout: 5), "vahvistus ei sulkeutunut")
        XCTAssertFalse(app.staticTexts["linux-viesti"].exists, "toiminto ajettiin ilman vahvistusta")
    }

    // Kirjoittava koe vain kuivaa koepalvelua vastaan (SCOPES_KOE_LINUX=1, palvelu SCOPES_LINUX_KUIVA=1): vahvistettu
    // nappi kulkee palveluun asti, joka vastaa ajamatta herätystä tai sammutusta.
    func testLinuxServerKuiva() throws {
        let ymp = ProcessInfo.processInfo.environment
        guard ymp["SCOPES_KOE_LINUX"] == "1" else { throw XCTSkip("SCOPES_KOE_LINUX puuttuu") }
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "sivupalkki-infra")
        let kaynnista = app.buttons["linux-kaynnista"], sammuta = app.buttons["linux-sammuta"]
        XCTAssertTrue(kaynnista.waitForExistence(timeout: 15), "Infrassa ei ole palvelin-osiota")
        (kaynnista.isEnabled ? kaynnista : sammuta).tap()
        XCTAssertTrue(app.buttons["linux-vahvista"].waitForExistence(timeout: 5), "vahvistus puuttuu")
        app.buttons["linux-vahvista"].firstMatch.tap()  // iOS 27 näyttää vahvistusnapin kahdesti sisäkkäin
        let viesti = app.staticTexts["linux-viesti"], virhe = app.staticTexts["linux-virhe"]
        let loppu = Date().addingTimeInterval(30)
        while !viesti.exists && !virhe.exists && Date() < loppu { sleep(1) }
        kuva("linux-kuiva")
        XCTAssertFalse(virhe.exists, virhe.exists ? virhe.label : "")
        XCTAssertTrue(viesti.label.contains("kokeilu, ei ajettu"), "palvelu ei ole kuivassa tilassa: \(viesti.label)")
    }

    // Monivalinta korttina (DEMO-SCOPES-LISTA). Vastattu kortti piilotetaan, joten kortti näkyy vain, kun skoopin
    // istunto odottaa vastausta: kysymys on viimeinen viesti ja lista on vieritetty sen kohdalle. Oikea data:
    // SCOPES_KOE_KYSYMYS nimeää skoopin, jonka istunto kysyy ajon aikana; SCOPES_KOE_KORTTI_ODOTA (s) odottaa sitä.
    // Syöttökentän napautus nostaa keskustelun näppäimistön yläpuolelle (CHAT-NOUSU-TODENNUS 13.10.2026): viimeisen
    // tekstin alareuna on kentän yläreunan tuntumassa eikä jää kentän tai näppäimistön alle tai kauas sen yläpuolelle.
    func testNappaimistoNostaaKeskustelun() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skooppi = ymp["SCOPES_KOE_AUKI"] ?? "scopes lista"
        let app = kaynnista(avain: avain)
        etsi(app, skooppi)
        let rivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia")
        rivi.tap()
        XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15), "\(skooppi) ei ole auki")
        let kentta = app.textFields["viestit-kentta"].exists ? app.textFields["viestit-kentta"] : app.textViews["viestit-kentta"]
        guard kentta.waitForExistence(timeout: 5) else { throw XCTSkip("syöttökenttää ei ole (kortti auki tai vain luku)") }
        // Haun näppäimistö voi jäädä auki: suljetaan napautuksella listaan, jotta kentän napautus avaa sen alusta.
        if app.keyboards.firstMatch.exists {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.3)).tap()
            XCTAssertTrue(app.keyboards.firstMatch.waitForNonExistence(timeout: 5), "näppäimistö ei sulkeutunut")
        }
        sleep(2)
        kuva("nousu-ennen")
        kentta.tap()
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5), "näppäimistö ei auennut")
        sleep(2)
        kuva("nousu-jalkeen")
        let yla = kentta.frame.minY
        let istunto = app.staticTexts["viestit-istunto"].frame.maxY
        // Keskustelun tekstit alkavat kentän yläreunan yläpuolelta; kentän paikkamerkki ja näppäimistön tekstit sen alapuolelta.
        var alin: CGFloat = 0
        var nimi = ""
        for t in app.staticTexts.allElementsBoundByIndex {
            let f: CGRect = t.frame
            if f.minY > istunto, f.minY < yla, f.height > 0, f.maxY > alin { alin = f.maxY; nimi = String(t.label.prefix(40)) }
        }
        XCTAssertLessThanOrEqual(alin, yla + 2, "viimeinen teksti jää kentän alle: \(nimi) \(alin), kenttä \(yla)")
        XCTAssertGreaterThan(alin, yla - 60, "keskustelu ei noussut kentän tuntumaan: \(nimi) \(alin), kenttä \(yla)")
    }

    // Skoopin vaihto ei jätä viestinäkymää mustaksi (CHAT-MUSTA 13.10.2026): jokaisen vaihdon jälkeen istuntorivin ja
    // ruudun alareunan välissä näkyy viestitekstiä. Kaksi auki olevaa skooppia: SCOPES_KOE_AUKI ja SCOPES_KOE_AUKI2.
    func testSkoopinVaihtoEiMustaa() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skoopit = [ymp["SCOPES_KOE_AUKI"] ?? "scopes lista", ymp["SCOPES_KOE_AUKI2"] ?? "scopes chat"]
        let app = kaynnista(avain: avain)
        for kierros in 0..<6 {
            let skooppi = skoopit[kierros % 2]
            // Haku jää aktiiviseksi valinnan jälkeen, jolloin palkissa ei ole suodatinta: palkki avataan näkyvästä
            // nuolesta (piilotetun chatin nuoli on myös hierarkiassa) ja auki-tila luetaan hakukentästä.
            let haku = app.searchFields.firstMatch
            if !osuttava(haku, true, timeout: kierros == 0 ? 15 : 1) {
                let nuoli = app.buttons.matching(identifier: "sivupalkki").allElementsBoundByIndex.first { $0.isHittable }
                try XCTUnwrap(nuoli, "näkyvä sivupalkin nuoli puuttuu").tap()
            }
            XCTAssertTrue(osuttava(haku, true), "sivupalkki ei auennut")
            haku.tap()
            if app.buttons["Clear text"].exists { app.buttons["Clear text"].tap() }
            haku.typeText(skooppi)
            let rivi = app.buttons["skooppi-\(skooppi)"]
            XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia \(skooppi)")
            rivi.tap()
            XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15), "\(skooppi) ei ole auki")
            sleep(2)
            let yla = app.staticTexts["viestit-istunto"].frame.maxY
            let ala = app.windows.firstMatch.frame.maxY
            let nakyvat = app.staticTexts.allElementsBoundByIndex.filter { t in
                let f: CGRect = t.frame
                return f.height > 0 && f.maxY > yla && f.minY < ala && t.identifier != "viestit-istunto"
            }
            if nakyvat.isEmpty { kuva("musta-\(kierros)") }
            XCTAssertFalse(nakyvat.isEmpty, "viestinäkymä tyhjä vaihdon \(kierros) jälkeen (\(skooppi))")
        }
        kuva("vaihto-lopuksi")
    }

    // Sivupalkin vedon ruutuajat (SCOPES-LISTA-SUMEUS 13.10.2026): sama avaus- ja sulkuveto sumeudella ja ilman,
    // kolmesti kumpikin. Tulos on liitteenä "mittaus" (xcresulttool export attachments); testi ei aseta rajaa.
    func testSumeusMittaus() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        var rivit: [String] = []
        for sumeus in ["1", "0"] {
            let app = kaynnista(avain: avain, lisa: ["SCOPES_MITTARI": "1", "SCOPES_SUMEUS": sumeus])
            chattiin(app)
            let mittari = app.otherElements["mittari"]
            XCTAssertTrue(mittari.waitForExistence(timeout: 5), "mittari puuttuu")
            var edellinen = mittari.label
            // Elementin luku ottaa äpistä saavutettavuuskuvan, joka pysäyttää pääsäikeen (~160 ms ruutuja): luetaan vasta,
            // kun mittausikkuna (veto + 0,6 s) on sulkeutunut.
            func lue(_ veto: String) {
                sleep(2)
                let loppu = Date().addingTimeInterval(5)
                while mittari.label == edellinen && Date() < loppu { usleep(100_000) }
                edellinen = mittari.label
                rivit.append("\(veto) \(edellinen)")
            }
            for _ in 0..<3 {
                app.coordinate(withNormalizedOffset: CGVector(dx: 0.1, dy: 0.5))
                    .press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5)),
                           withVelocity: 600, thenHoldForDuration: 0.1)
                lue("avaus")
                XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true), "veto ei avannut palkkia")
                app.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5))
                    .press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.1, dy: 0.5)),
                           withVelocity: 600, thenHoldForDuration: 0.1)
                lue("sulku")
                XCTAssertTrue(osuttava(app.buttons["suodatin-all"], false), "veto ei sulkenut palkkia")
            }
            app.terminate()
        }
        let liite = XCTAttachment(string: rivit.joined(separator: "\n"))
        liite.name = "mittaus"
        liite.lifetime = .keepAlways
        add(liite)
    }

    func testKysymysKortti() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skooppi = ymp["SCOPES_KOE_KYSYMYS"] ?? "claude demo linkedin"
        let odota = TimeInterval(ymp["SCOPES_KOE_KORTTI_ODOTA"] ?? "") ?? 5
        let app = kaynnista(avain: avain)
        etsi(app, skooppi)
        // Hakunappi sulkee haun näppäimistön; auki jäävä näppäimistö vierittää kortin yläkulman ja X:n piiloon.
        app.searchFields.firstMatch.typeText("\n")
        _ = app.keyboards.firstMatch.waitForNonExistence(timeout: 3)
        let rivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia")
        rivi.tap()
        guard app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15) else { throw XCTSkip("skooppi ei ole auki") }
        let kortti = app.descendants(matching: .any)["kysymys-kortti"].firstMatch
        guard kortti.waitForExistence(timeout: odota) else { throw XCTSkip("skoopin istunto ei odota monivalintaa") }
        // Muu-kenttä vain, kun äppi saa lähettää istuntoon (voiLahettaa); vaihtoehdot aina.
        XCTAssertTrue(app.buttons["kysymys-vaihtoehto-0-0"].exists, "kortista puuttuu vaihtoehto")
        // Auki oleva kortti piilottaa syöttökentän (käyttäjä 13.10.2026).
        XCTAssertFalse(app.textViews["viestit-kentta"].exists || app.textFields["viestit-kentta"].exists, "syöttökenttä näkyy kortin rinnalla")
        kuva("kysymys-kortti")
        // X ja Muu-kenttä vain lähetettävässä istunnossa (CHAT-KORTTI-SIMU, V-276). X:ää ei paineta: se hylkäisi
        // oikean istunnon kysymyksen. Muu-kentän valinta nostaa kentän näppäimistön yläpuolelle.
        let muu = app.textFields["kysymys-muu-0"].exists ? app.textFields["kysymys-muu-0"] : app.textViews["kysymys-muu-0"]
        guard muu.exists else { throw XCTSkip("istuntoon ei voi lähettää: X ja Muu puuttuvat") }
        // Ruutua pidempi kortti: X vedetään esiin lyhyellä vedolla (pyyhkäisy vieri kortin ohi). Ei napautusta listaan:
        // yhden kysymyksen vaihtoehdon napautus lähettäisi vastauksen oikeaan istuntoon.
        let x = app.buttons["kysymys-sulje"]
        if x.exists && !x.isHittable {
            let alku = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.4))
            alku.press(forDuration: 0.1, thenDragTo: alku.withOffset(CGVector(dx: 0, dy: 250)))
        }
        XCTAssertTrue(x.isHittable, "kortista puuttuu sulkunappi X")
        kuva("kysymys-sulje")
        muu.tap()
        let nappaimisto = app.keyboards.firstMatch
        XCTAssertTrue(nappaimisto.waitForExistence(timeout: 5), "näppäimistö ei auennut Muu-kentästä")
        sleep(2)
        kuva("kysymys-muu")
        XCTAssertLessThanOrEqual(muu.frame.maxY, nappaimisto.frame.minY + 2,
                                 "Muu-kenttä jää näppäimistön alle: \(muu.frame.maxY), näppäimistö \(nappaimisto.frame.minY)")
    }

    // Chat oikeaa palvelua vastaan halvimmalla mallilla: yksi lyhyt kysymys (noin 1 snt).
    func testChatVastaa() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        chattiin(app)
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
        chattiin(app)
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
        chattiin(app)
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

    // Paikallinen ilmoitus (NOTIFICATIONS-SIMULAATTORI): koeilmoitus näkyy bannerina äpin ollessa auki, ja napautus avaa
    // skoopin viestit. Skooppi: SCOPES_KOE_ILMOITUS (oletus "scopes notifications").
    func testIlmoitusBanneriJaNapautus() throws {
        let ymp = ProcessInfo.processInfo.environment
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let skooppi = ymp["SCOPES_KOE_ILMOITUS"] ?? "scopes notifications"
        let app = kaynnista(avain: avain, lisa: ["SCOPES_ILMOITUKSET": "1", "SCOPES_KOEILMOITUS": skooppi])
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        // Lupa kysytään vain ensimmäisellä kerralla; simulaattori muistaa vastauksen.
        let salli = springboard.alerts.buttons.matching(NSPredicate(format: "label IN {'Allow', 'Salli'}")).firstMatch
        let banneri = springboard.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS 'Koeilmoitus'")).firstMatch
        let loppu = Date().addingTimeInterval(20)
        while Date() < loppu, !banneri.exists {
            if salli.exists { salli.tap() }
            usleep(300_000)
        }
        XCTAssertTrue(banneri.exists, "koeilmoituksen banneri ei näkynyt")
        kuva("ilmoitus-banneri")
        banneri.tap()
        let skoopissa = app.staticTexts.matching(NSPredicate(format: "identifier IN {'viestit-istunto', 'pakattu', 'ei-auki'}")).firstMatch
        XCTAssertTrue(skoopissa.waitForExistence(timeout: 15), "napautus ei avannut skooppia \(skooppi)")
        kuva("ilmoitus-napautus")
    }

    // Kontekstirajan säätö Asetusten Ilmoitukset-alavalikossa (NOTIFICATIONS-SIMULAATTORI, NOTIFICATIONS-ASETUKSET):
    // askel 25 k, Peru ei tallenna.
    func testIlmoitusRajaAsetuksissa() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "asetukset")
        app.buttons["asetukset-ilmoitukset"].tap()
        let raja = app.steppers["ilmoitusraja"]
        XCTAssertTrue(nakyviin(app, raja), "kontekstirajan säädin puuttuu")
        XCTAssertTrue(raja.label.contains("100 k"), raja.label)
        raja.buttons.element(boundBy: 1).tap()
        XCTAssertTrue(raja.label.contains("125 k"), raja.label)
        kuva("ilmoitusraja")
        takaisin(app, "Ilmoitukset")
        app.buttons["Peru"].tap()
        nayta(app, "asetukset")
        app.buttons["asetukset-ilmoitukset"].tap()
        XCTAssertTrue(nakyviin(app, app.steppers["ilmoitusraja"]))
        XCTAssertTrue(app.steppers["ilmoitusraja"].label.contains("100 k"), "Peru tallensi: \(app.steppers["ilmoitusraja"].label)")
    }

    // Asetusten alavalikot (NOTIFICATIONS-ASETUKSET 14.10.2026): Yhteys, Ilmoitukset ja Tietoja aukeavat; lajikytkin
    // tallentuu Tallenna-painikkeella ja Peru hylkää muutoksen; pois kytketty kontekstilaji lukitsee rajan säätimen.
    func testAsetustenAlavalikot() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        nayta(app, "asetukset")
        XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5))
        kuva("asetukset-juuri")
        app.buttons["asetukset-yhteys"].tap()
        XCTAssertTrue(app.staticTexts["reitti"].waitForExistence(timeout: 5), "Yhteys-alavalikko ei auennut")
        XCTAssertTrue(app.secureTextFields["Bearer-avain"].exists, "avainkenttä puuttuu")
        kuva("asetukset-yhteys")
        takaisin(app, "Yhteys")
        app.buttons["asetukset-tietoja"].tap()
        XCTAssertTrue(app.staticTexts["Allekirjoitus voimassa"].waitForExistence(timeout: 5), "Tietoja-alavalikko ei auennut")
        kuva("asetukset-tietoja")
        takaisin(app, "Tietoja")
        app.buttons["asetukset-ilmoitukset"].tap()
        let vika = app.switches["ilmoitus-vika"]
        XCTAssertTrue(app.staticTexts["ilmoituslupa"].waitForExistence(timeout: 5), "luparivi puuttuu")
        XCTAssertTrue(nakyviin(app, vika), "lajikytkimet puuttuvat")
        XCTAssertTrue(app.switches["ilmoitus-kysely"].exists, "kyselyn kytkin puuttuu (NOTIFICATIONS-KYSELY-KYTKIN)")
        XCTAssertEqual(vika.value as? String, "1")
        kytke(vika)
        XCTAssertEqual(vika.value as? String, "0")
        let konteksti = app.switches["ilmoitus-konteksti"]
        kytke(konteksti)
        XCTAssertTrue(nakyviin(app, app.steppers["ilmoitusraja"]), "kontekstirajan säädin puuttuu")
        XCTAssertFalse(app.steppers["ilmoitusraja"].isEnabled, "raja säädettävissä, vaikka kontekstilaji on pois")
        kuva("asetukset-ilmoitukset")
        takaisin(app, "Ilmoitukset")
        app.buttons["Peru"].tap()
        nayta(app, "asetukset")
        app.buttons["asetukset-ilmoitukset"].tap()
        XCTAssertTrue(nakyviin(app, app.switches["ilmoitus-vika"]))
        XCTAssertEqual(app.switches["ilmoitus-vika"].value as? String, "1", "Peru tallensi kytkimen")
        kytke(app.switches["ilmoitus-vika"])
        app.buttons["Tallenna"].tap()
        nayta(app, "asetukset")
        app.buttons["asetukset-ilmoitukset"].tap()
        XCTAssertTrue(nakyviin(app, app.switches["ilmoitus-vika"]))
        XCTAssertEqual(app.switches["ilmoitus-vika"].value as? String, "0", "Tallenna ei tallentanut kytkintä")
        // Palauta oletus, jotta seuraava ajo alkaa samasta tilasta.
        kytke(app.switches["ilmoitus-vika"])
        app.buttons["Tallenna"].tap()
    }

    // Ulkoasu (DESIGN-ULKOASU 14.10.2026): korostusväri, teema ja Liquid Glass näkyvät heti; Peru palauttaa, Tallenna
    // säilyttää. Kuvat: valinnat alavalikossa, lista tallennetulla ulkoasulla lasin kanssa ja ilman.
    func testUlkoasu() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        func ulkoasuun() {
            nayta(app, "asetukset")
            XCTAssertTrue(app.navigationBars["Asetukset"].waitForExistence(timeout: 5))
            app.buttons["asetukset-ulkoasu"].tap()
            XCTAssertTrue(app.navigationBars["Ulkoasu"].waitForExistence(timeout: 5), "Ulkoasu-alavalikko ei auennut")
        }
        let teema = app.segmentedControls["ulkoasu-teema"]
        let lasi = app.switches["ulkoasu-lasi"]
        ulkoasuun()
        XCTAssertTrue(app.buttons["korostus-turkoosi"].isSelected, "oletus ei ole turkoosi")
        kuva("ulkoasu-oletus")
        app.buttons["korostus-violetti"].tap()
        XCTAssertTrue(app.buttons["korostus-violetti"].isSelected, "valinta ei vaihtunut")
        teema.buttons["Tumma"].tap()
        kuva("ulkoasu-violetti-tumma")
        XCTAssertTrue(nakyviin(app, lasi), "lasikytkin puuttuu")
        XCTAssertEqual(lasi.value as? String, "1", "Liquid Glass ei ole oletuksena päällä")
        kytke(lasi)
        XCTAssertEqual(lasi.value as? String, "0")
        kuva("ulkoasu-lasi-pois")
        takaisin(app, "Ulkoasu")
        app.buttons["Peru"].tap()
        ulkoasuun()
        XCTAssertTrue(app.buttons["korostus-turkoosi"].isSelected, "Peru ei palauttanut korostusta")
        XCTAssertTrue(teema.buttons["Järjestelmä"].isSelected, "Peru ei palauttanut teemaa")
        XCTAssertTrue(nakyviin(app, lasi))
        XCTAssertEqual(lasi.value as? String, "1", "Peru ei palauttanut lasia")
        app.swipeDown()
        app.buttons["korostus-violetti"].tap()
        teema.buttons["Tumma"].tap()
        app.buttons["Tallenna"].tap()
        palkki(app)
        kuva("lista-violetti-tumma-lasi")
        ulkoasuun()
        XCTAssertTrue(app.buttons["korostus-violetti"].isSelected, "Tallenna ei säilyttänyt korostusta")
        XCTAssertTrue(nakyviin(app, lasi))
        kytke(lasi)
        app.buttons["Tallenna"].tap()
        palkki(app)
        kuva("lista-violetti-tumma-ilman-lasia")
        // Palauta oletus, jotta seuraava ajo alkaa samasta tilasta.
        ulkoasuun()
        app.buttons["korostus-turkoosi"].tap()
        teema.buttons["Järjestelmä"].tap()
        XCTAssertTrue(nakyviin(app, lasi))
        kytke(lasi)
        XCTAssertEqual(lasi.value as? String, "1")
        app.buttons["Tallenna"].tap()
    }

    func testVaaraAvainNayttaaVirheen() {
        let app = kaynnista(avain: "vaara-avain")
        let virhe = app.staticTexts["chat-virhe"]
        XCTAssertTrue(virhe.waitForExistence(timeout: 15))
        // Selkokieli (DESIGN-UX-A U3): ei HTTP-koodia, vaan mitä tehdä.
        XCTAssertTrue(virhe.label.contains("Avain ei kelpaa"), virhe.label)
        XCTAssertFalse(virhe.label.contains("401"), virhe.label)
        kuva("vaara-avain")
    }

    // Hallintatoiminnot (DEMO-SCOPES-HALLINTA): testit eivät lähetä hyväksyttäviä pyyntöjä, joten simulaattoriajo
    // ei avaa istuntoja, pakkaa eikä luo skooppeja. Onnistunut polku todennetaan palvelimella. Varattu nimi ja
    // puuttuva istunto estetään äpissä ennen lähetystä (DESIGN-UX-A U4).
    func testUusiSkooppiTarkistaaNimen() throws {
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
        XCTAssertTrue(app.staticTexts["uusi-varattu"].waitForExistence(timeout: 15), "varattua nimeä ei tunnistettu")
        XCTAssertFalse(app.buttons["uusi-luo"].isEnabled, "varattu nimi ei saa olla lähetettävissä")
        kuva("uusi-varattu")
        // Scopes-perhe puretaan skriptillä: purkajan tilalla selite, istunnon malli säilyy (PURA-MALLITON T6).
        XCTAssertTrue(app.buttons["pura-malli"].waitForExistence(timeout: 15), "istunnon mallin valinta puuttuu scopes-skoopilta")
        XCTAssertTrue(app.staticTexts["pura-malliton-selite"].exists, "mallittoman purun selite puuttuu uudesta scopes-skoopista")
        XCTAssertFalse(app.buttons["pura-purkaja"].exists, "purkajan valinta näkyy uudessa scopes-skoopissa")
        kuva("uusi-scopes")
        kentta.clearText()
        kentta.typeText("claude koe uusi")
        // Samat valinnat kuin purussa (SCOPES-LISTA-UUSI-VALINNAT): purkaja ja istunnon malli.
        XCTAssertTrue(app.buttons["pura-purkaja"].waitForExistence(timeout: 15), "purkajan valinta puuttuu uudesta skoopista")
        XCTAssertTrue(app.buttons["pura-malli"].exists, "istunnon mallin valinta puuttuu uudesta skoopista")
        XCTAssertFalse(app.staticTexts["pura-malliton-selite"].exists, "mallittoman purun selite näkyy muussa skoopissa")
        app.buttons["pura-purkaja"].tap()
        XCTAssertTrue(app.navigationBars["Purkaja"].waitForExistence(timeout: 5), "purkajalista ei auennut")
        XCTAssertTrue(app.buttons.containing(NSPredicate(format: "label CONTAINS 'siirtaja-sonnet'")).firstMatch.waitForExistence(timeout: 5), "agentti puuttuu uuden skoopin purkajista")
        kuva("uusi-purkajat")
        app.navigationBars.buttons.firstMatch.tap()
        // Istunnon mallit samasta lähteestä kuin purussa: Claude aina (käyttäjä 15.10.2026: "ei ole muuta vaihtoehtoja kun default").
        let malli = app.buttons["pura-malli"]
        XCTAssertTrue(malli.waitForExistence(timeout: 5), "mallin valinta puuttuu paluun jälkeen")
        malli.tap()
        XCTAssertTrue(app.buttons.containing(NSPredicate(format: "label CONTAINS 'Opus 5.5'")).firstMatch.waitForExistence(timeout: 5), "Claude-malli puuttuu uuden skoopin istunnon malleista")
        kuva("uusi-mallit")
    }

    // Valitsin avataan ennen kuin lista on ladattu (käyttäjä 15.10.2026: "mallien valinnoissa ei ole muuta vaihtoehtoja kun
    // default"; palvelun loki 13:38Z: haku katkesi 3,3 s:n kohdalla). Siirtymä peruu .taskin; peruttu haku ei saa jäädä
    // virheeksi, vaan mallit näkyvät viimeistään paluun jälkeen. Toistuu vain, kun palvelun agy-välimuisti on kylmä (10 min).
    func testUusiSkooppiMallitHeti() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        palkki(app)
        XCTAssertTrue(app.buttons["uusi"].waitForExistence(timeout: 15))
        app.buttons["uusi"].tap()
        let malli = app.buttons["pura-malli"]
        XCTAssertTrue(malli.waitForExistence(timeout: 5), "mallin valinta puuttuu uudesta skoopista")
        malli.tap()
        kuva("uusi-mallit-heti")
        if !app.buttons.containing(NSPredicate(format: "label CONTAINS 'Opus 5.5'")).firstMatch.waitForExistence(timeout: 10) {
            app.navigationBars.buttons.firstMatch.tap()
            XCTAssertTrue(malli.waitForExistence(timeout: 5), "mallin valinta puuttuu paluun jälkeen")
            malli.tap()
        }
        XCTAssertTrue(app.buttons.containing(NSPredicate(format: "label CONTAINS 'Opus 5.5'")).firstMatch.waitForExistence(timeout: 10), "mallit eivät latautuneet heti avatun valitsimen jälkeen")
        kuva("uusi-mallit-paluu")
        app.navigationBars.buttons.firstMatch.tap()
        let selite = app.staticTexts["pura-purkaja-selite"]
        XCTAssertTrue(selite.waitForExistence(timeout: 5), "purkajan selite puuttuu")
        XCTAssertFalse(selite.label.hasPrefix("Valintoja ei saatu"), "peruttu haku jäi virheeksi")
    }

    // Skoopin arkistointi listasta (SCOPES-LISTA-POISTO): pito + veto vasemmalle paljastaa X:n, pelkkä veto ei; kosketus
    // muualle palauttaa rivin. Ei vahvista: testi ajaa oikeaa palvelua vastaan, eikä skooppia arkistoida.
    func testListaArkistointiVeto() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        palkki(app)
        app.buttons["suodatin-scope"].tap()
        let rivi = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).element(boundBy: 1)
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "skoopit puuttuvat palkista")
        let nimi = String(rivi.identifier.dropFirst("skooppi-".count))
        let x = app.buttons["arkistoi-\(nimi)"]
        // Pelkkä nopea veto: ei X:ää, ja palkki pysyy auki tai sulkeutuu sivupalkin eleenä.
        rivi.swipeLeft()
        XCTAssertFalse(x.waitForExistence(timeout: 1), "veto ilman pitoa paljasti X:n")
        palkki(app)
        app.buttons["suodatin-scope"].tap()
        XCTAssertTrue(rivi.waitForExistence(timeout: 10))
        let alku = rivi.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.5))
        alku.press(forDuration: 0.8, thenDragTo: alku.withOffset(CGVector(dx: -160, dy: 0)))
        XCTAssertTrue(osuttava(x, true), "pito ja veto eivät paljastaneet X:ää")
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true, timeout: 1), "veto sulki sivupalkin")
        kuva("arkistointi-x")
        // Kosketus toiseen riviin palauttaa rivin eikä avaa kosketettua.
        app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'skooppi-'")).element(boundBy: 2).tap()
        XCTAssertTrue(osuttava(x, false), "kosketus muualle ei palauttanut riviä")
        XCTAssertTrue(osuttava(app.buttons["suodatin-all"], true, timeout: 1), "palauttava kosketus avasi skoopin")
        // X kysyy varmistuksen; peruminen jättää skoopin listaan.
        alku.press(forDuration: 0.8, thenDragTo: alku.withOffset(CGVector(dx: -160, dy: 0)))
        XCTAssertTrue(osuttava(x, true))
        x.tap()
        XCTAssertTrue(app.buttons["vahvista-arkistointi"].waitForExistence(timeout: 5), "arkistointi ei kysynyt varmistusta")
        kuva("arkistointi-varmistus")
        let peru = app.buttons["Peruuta"].exists ? app.buttons["Peruuta"] : app.buttons["Cancel"]
        // iOS 26 näyttää varmistuksen ponnahduksena ilman Peruuta-painiketta: kosketus palkin oikealle puolelle sulkee sen.
        if peru.exists { peru.tap() } else { app.coordinate(withNormalizedOffset: CGVector(dx: 0.93, dy: 0.5)).tap() }
        XCTAssertTrue(app.buttons["vahvista-arkistointi"].waitForNonExistence(timeout: 5))
        XCTAssertTrue(rivi.exists, "peruminen poisti skoopin listasta")
    }

    func testPakkaaIlmanIstuntoaLukittu() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        etsi(app, "demo tyokalut")
        let rivi = app.buttons["skooppi-claude demo tyokalut"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15))
        rivi.tap()
        // Haun näppäimistö ei jää skoopin näkymän päälle (DESIGN-UX-A U1).
        XCTAssertTrue(app.keyboards.firstMatch.waitForNonExistence(timeout: 5), "haun näppäimistö jäi auki")
        // Skooppi ilman istuntoa: viesti ja Pura-painike (painiketta ei paineta: se avaisi istunnon).
        XCTAssertTrue(app.staticTexts["ei-auki"].waitForExistence(timeout: 15), "ei auki -viesti puuttuu")
        XCTAssertTrue(app.buttons["viestit-pura"].exists)
        kuva("ei-auki")
        app.buttons["tiedot"].tap()
        // Tiedot ennen toimintoja (DESIGN-SKOOPPINAKYMA U5): seuraava paketti ylimpänä, toiminnot sen alla.
        let seuraava = app.staticTexts.matching(NSPredicate(format: "identifier IN {'seuraava-id', 'seuraava-ei'}")).firstMatch
        XCTAssertTrue(seuraava.waitForExistence(timeout: 15), "seuraava paketti puuttuu")
        kuva("tiedot-ylla")
        let pakkaa = app.buttons["toiminto-pakkaa"]
        if pakkaa.exists && pakkaa.isHittable { XCTAssertLessThan(seuraava.frame.minY, pakkaa.frame.minY, "toiminnot ennen tietoja") }
        for _ in 0..<4 where !(pakkaa.exists && pakkaa.isHittable) { app.swipeUp() }
        XCTAssertTrue(pakkaa.waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["toiminto-pura"].exists)
        // Automaattisiirto pakkausnapin alla ja herätyskytkin sen alla; ilman istuntoa kytkin on pois ja lukittu.
        let siirto = app.buttons["toiminto-automaattisiirto"], herata = app.switches["toiminto-hereilla"]
        XCTAssertTrue(siirto.exists && herata.exists, "automaattisiirto tai herätyskytkin puuttuu")
        XCTAssertLessThan(app.buttons["toiminto-pakkaa"].frame.minY, siirto.frame.minY)
        XCTAssertLessThan(siirto.frame.minY, herata.frame.minY)
        XCTAssertFalse(herata.isEnabled)
        XCTAssertEqual(herata.value as? String, "0")
        XCTAssertFalse(app.buttons["toiminto-pakkaa"].isEnabled, "pakkaus ilman istuntoa ei saa olla painettavissa")
        XCTAssertFalse(siirto.isEnabled, "siirto ilman istuntoa ei saa olla painettavissa")
        // Automaattijatko ja Autopack ovat globaaleja: herätyskytkimen alla, eivätkä lukitu ilman istuntoa (käyttäjä 14.10.2026).
        // Vaatii palvelun, jolla on /api/asetukset; vanhalla palvelulla kytkimet ovat piilossa. Autopack voi olla ruudun alapuolella.
        let jatko = app.switches["toiminto-automaattijatko"], autopack = app.switches["toiminto-autopack"]
        XCTAssertTrue(jatko.exists, "automaattijatko-kytkin puuttuu")
        XCTAssertLessThan(herata.frame.minY, jatko.frame.minY)
        for _ in 0..<3 where !autopack.exists { app.swipeUp() }
        XCTAssertTrue(autopack.exists, "autopack-kytkin puuttuu")
        XCTAssertLessThan(jatko.frame.minY, autopack.frame.minY)
        // Keskustelukohtainen palvelu (scopes infra setting 16.10.2026) lukitsee kytkimet, kun skoopilla ei ole yhtä avointa
        // istuntoa; vanha palvelu antaa yhteiset kytkimet, jotka eivät lukitu.
        let kytkinSelite = app.staticTexts["toiminto-kytkimet-selite"]
        let yhteiset = kytkinSelite.label.hasPrefix("Koskevat kaikkia")
        XCTAssertEqual(jatko.isEnabled && autopack.isEnabled, yhteiset, "kytkinten lukitus ei vastaa selitettä: \(kytkinSelite.label)")
        // Selite on kytkinten alla, joten se haetaan vasta rullauksen jälkeen.
        XCTAssertTrue(app.staticTexts["toiminto-ei-istuntoa"].exists, "selite puuttuu")
        kuva("toiminnot")
        // Vahvistus kertoo seurauksen, ei komentoa (U6), ja tarjoaa purkajan ja istunnon mallin (SCOPES-PURA-MALLI).
        // Vahvistusta ei paineta: se avaisi istunnon. Peru sulkee arkin.
        let pura = app.buttons["toiminto-pura"]
        if !pura.isHittable { app.swipeDown() }
        pura.tap()
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].waitForExistence(timeout: 5), "purun vahvistus puuttuu")
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].label.hasPrefix("Uusi Claude-istunto käynnistyy"), "seurauslause puuttuu")
        let purkaja = app.buttons["pura-purkaja"], malli = app.buttons["pura-malli"]
        XCTAssertTrue(purkaja.waitForExistence(timeout: 5) && malli.exists, "purkajan tai mallin valinta puuttuu")
        XCTAssertTrue(app.buttons["vahvista"].waitForExistence(timeout: 30), "Pura-painike puuttuu")
        kuva("pura-vahvistus")
        // Purkajalista: Claude-mallit aina; agy ja paikalliset, kun palvelu tavoittaa ne.
        purkaja.tap()
        XCTAssertTrue(app.buttons.containing(NSPredicate(format: "label CONTAINS 'siirtaja-sonnet'")).firstMatch.waitForExistence(timeout: 5), "agentti puuttuu purkajista")
        kuva("pura-purkajat")
        app.navigationBars.buttons.firstMatch.tap()
        // Istunnon mallit: Claude aina, paikalliset (palvelin) ryhmänä, kun palvelu tavoittaa LM Studion (15.10.2026).
        XCTAssertTrue(malli.waitForExistence(timeout: 5), "mallin valinta puuttuu paluun jälkeen")
        malli.tap()
        XCTAssertTrue(app.buttons.containing(NSPredicate(format: "label CONTAINS 'Opus 5.5'")).firstMatch.waitForExistence(timeout: 5), "Claude-malli puuttuu istunnon malleista")
        kuva("pura-mallit")
        app.navigationBars.buttons.firstMatch.tap()
        app.buttons["pura-peru"].tap()
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].waitForNonExistence(timeout: 5), "peru ei sulkenut vahvistusta")
        XCTAssertFalse(app.staticTexts["toiminto-tulos"].exists, "peruutus ei saa avata istuntoa")
    }

    // Skoopin Tiedot-välilehti haun kautta; palauttaa, kun skoopin näkymä on latautunut.
    private func tietoihin(_ app: XCUIApplication, _ skooppi: String) {
        etsi(app, skooppi)
        let rivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia \(skooppi)")
        rivi.tap()
        XCTAssertTrue(app.buttons["tiedot"].waitForExistence(timeout: 15), "tiedot-välilehti puuttuu")
        app.buttons["tiedot"].tap()
        XCTAssertTrue(seuraava(app).waitForExistence(timeout: 15), "skoopin näkymä ei latautunut")
    }

    // PURA-MALLITON T6E: scopes/-perheen skoopin Pura-arkissa ei ole purkajan valintaa (perhe puretaan skriptillä ilman mallia),
    // mutta istunnon malli ja selite ovat. Vahvistusta ei paineta, koska se avaisi oikean istunnon tuotantopalvelussa.
    func testPuraScopesSkoopissaEiPurkajaaMuttaMalli() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        tietoihin(app, "scopes lista")
        let pura = app.buttons["toiminto-pura"]
        for _ in 0..<4 where !(pura.exists && pura.isHittable) { app.swipeUp() }
        XCTAssertTrue(pura.waitForExistence(timeout: 5), "Pura-nappi puuttuu")
        pura.tap()
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].waitForExistence(timeout: 5), "purun arkki puuttuu")
        XCTAssertTrue(app.buttons["pura-malli"].waitForExistence(timeout: 15), "istunnon mallin valinta puuttuu scopes-skoopin arkista")
        XCTAssertTrue(app.staticTexts["pura-malliton-selite"].exists, "mallittoman purun selite puuttuu")
        XCTAssertEqual(app.staticTexts["pura-malliton-selite"].label, "Scopes-skooppi puretaan skriptillä ilman mallia.")
        XCTAssertTrue(app.descendants(matching: .any)["pura-purascript"].exists, "Purascript ei näy purkajana (V-516)")
        XCTAssertFalse(app.buttons["pura-purkaja"].exists, "purkajan valinta näkyy scopes-skoopin arkissa")
        XCTAssertFalse(app.staticTexts["pura-purkaja-selite"].exists, "purkajan selite näkyy scopes-skoopin arkissa")
        XCTAssertTrue(app.buttons["vahvista"].exists)
        kuva("pura-scopes-arkki")
        app.buttons["pura-peru"].tap()
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].waitForNonExistence(timeout: 5), "peru ei sulkenut arkkia")
        XCTAssertFalse(app.staticTexts["toiminto-tulos"].exists, "peruutus ei saa avata istuntoa")
    }

    func testPuraMuussaSkoopissaOnPurkaja() throws {
        let avain = try XCTUnwrap(ProcessInfo.processInfo.environment["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        tietoihin(app, "claude demo tyokalut")
        let pura = app.buttons["toiminto-pura"]
        for _ in 0..<4 where !(pura.exists && pura.isHittable) { app.swipeUp() }
        XCTAssertTrue(pura.waitForExistence(timeout: 5), "Pura-nappi puuttuu")
        pura.tap()
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].waitForExistence(timeout: 5), "purun arkki puuttuu")
        XCTAssertTrue(app.buttons["pura-purkaja"].waitForExistence(timeout: 15), "purkajan valinta puuttuu muun skoopin arkista")
        XCTAssertTrue(app.buttons["pura-malli"].exists, "istunnon mallin valinta puuttuu")
        XCTAssertFalse(app.staticTexts["pura-malliton-selite"].exists, "mallittoman purun selite näkyy muun skoopin arkissa")
        kuva("pura-muu-arkki")
        app.buttons["pura-peru"].tap()
        XCTAssertTrue(app.staticTexts["pura-valinta-seuraus"].waitForNonExistence(timeout: 5), "peru ei sulkenut arkkia")
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
        // Mallivalinta (SCOPES-PURA-MALLI): oletukset, ellei aiempi valinta ole muistissa.
        XCTAssertTrue(app.buttons["vahvista"].waitForExistence(timeout: 30), "purun vahvistus puuttuu")
        app.buttons["vahvista"].tap()
        let auki = app.staticTexts["viestit-istunto"]
        let virhe = app.staticTexts["viestit-virhe"]
        let loppu = Date().addingTimeInterval(240)
        while !auki.exists && !virhe.exists && Date() < loppu { sleep(2) }
        kuva("pura-tulos")
        XCTAssertFalse(virhe.exists, virhe.exists ? virhe.label : "")
        XCTAssertTrue(auki.exists, "pura ei avannut viestejä 240 s:ssa")
    }

    // Kirjoittava koe (CHAT-KYTKIN-SIMULAATTORI): auki olevan koeskoopin viesti, muistikytkimen tila ja käännös.
    // SCOPES_KOE_KYTKIN = skooppi; _VIESTI lähetetään; _ODOTA = kytkimen odotettu arvo 0/1; _ASETA = käännetään tähän.
    // Muistin säilyminen luetaan palvelimella transkriptin cache_read-tokeneista, ei täältä.
    func testMuistiKytkin() throws {
        let ymp = ProcessInfo.processInfo.environment
        guard let koe = ymp["SCOPES_KOE_KYTKIN"], !koe.isEmpty else { throw XCTSkip("SCOPES_KOE_KYTKIN puuttuu") }
        let avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        let app = kaynnista(avain: avain)
        etsi(app, koe)
        let rivi = app.buttons["skooppi-\(koe)"]
        XCTAssertTrue(rivi.waitForExistence(timeout: 15))
        rivi.tap()
        XCTAssertTrue(app.staticTexts["viestit-istunto"].waitForExistence(timeout: 15), "\(koe) ei ole auki")
        if let viesti = ymp["SCOPES_KOE_KYTKIN_VIESTI"], !viesti.isEmpty {
            let kentta = app.textFields["viestit-kentta"].exists ? app.textFields["viestit-kentta"] : app.textViews["viestit-kentta"]
            XCTAssertTrue(kentta.waitForExistence(timeout: 10), "syöttökenttä puuttuu (kortti auki?)")
            kentta.tap()
            kentta.typeText(viesti)
            app.buttons["viestit-laheta"].tap()
            XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", viesti)).firstMatch.waitForExistence(timeout: 30), "viesti ei näkynyt")
            kuva("kytkin-viesti")
        }
        guard ymp["SCOPES_KOE_KYTKIN_ODOTA"] != nil || ymp["SCOPES_KOE_KYTKIN_ASETA"] != nil else { return }
        if app.keyboards.firstMatch.exists { app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.3)).tap() }
        app.buttons["tiedot"].tap()
        let kytkin = app.switches["toiminto-hereilla"]
        XCTAssertTrue(kytkin.waitForExistence(timeout: 15), "herätyskytkin puuttuu")
        XCTAssertTrue(kytkin.isEnabled, "kytkin lukossa: istunto ei ole auki")
        if let odota = ymp["SCOPES_KOE_KYTKIN_ODOTA"] { XCTAssertEqual(kytkin.value as? String, odota, "kytkimen tila") }
        kuva("kytkin-ennen")
        guard let aseta = ymp["SCOPES_KOE_KYTKIN_ASETA"], kytkin.value as? String != aseta else { return }
        if kytkin.switches.firstMatch.exists { kytkin.switches.firstMatch.tap() } else { kytkin.tap() }
        let jonossa = app.staticTexts["toiminto-jonossa"].waitForExistence(timeout: 5)
        kuva(jonossa ? "kytkin-jonossa" : "kytkin-lahetetty")
        XCTAssertFalse(app.staticTexts["toiminto-virhe"].exists, app.staticTexts["toiminto-virhe"].exists ? app.staticTexts["toiminto-virhe"].label : "")
        let loppu = Date().addingTimeInterval(180)
        while kytkin.value as? String != aseta && Date() < loppu { sleep(3) }
        kuva("kytkin-jalkeen")
        XCTAssertEqual(kytkin.value as? String, aseta, "kytkin ei kääntynyt 180 s:ssa")
    }
}

private extension XCUIElement {
    func clearText() {
        guard let teksti = value as? String, !teksti.isEmpty else { return }
        tap()
        typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: teksti.count))
    }
}
