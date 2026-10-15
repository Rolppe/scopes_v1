// Rekisterisynkka (LOCALREGISTER-APPI 14.10.2026). Tyhjästä kopiosta ensimmäinen synkka hakee koko kaksoiskappaleen,
// ja toinen synkka toteaa juuritiivisteen samaksi: äpin tiivisteet lasketaan merkki merkiltä kuten palvelun lr.mjs.
// Ristiriitakoe kirjoittaa kaksoiskappaleeseen, joten se ajetaan vain koeinstanssia vastaan:
//   SCOPES_OSOITE="http://192.0.2.11:8799" SCOPES_KOE_LR=1 bash scopes/ios/testi.sh
import XCTest

final class LrUITests: XCTestCase {
    private var osoite = ""
    private var avain = ""

    override func setUpWithError() throws {
        continueAfterFailure = false
        let ymp = ProcessInfo.processInfo.environment
        avain = try XCTUnwrap(ymp["SCOPES_AVAIN"], "SCOPES_AVAIN puuttuu")
        osoite = ymp["SCOPES_OSOITE"] ?? "http://192.0.2.11:8787"
    }

    func testLrSynkkaYhteneva() throws {
        let app = avaaLr()
        let maara = app.descendants(matching: .any)["lr-maara"]
        XCTAssertTrue(maara.waitForExistence(timeout: 5))
        let rivit = Int(maara.label.components(separatedBy: CharacterSet.decimalDigits.inverted).first { !$0.isEmpty } ?? "") ?? 0
        XCTAssertGreaterThan(rivit, 1000, "kopio jäi vajaaksi: \(maara.label)")
        app.buttons["lr-synkkaa"].tap()
        odota(app, tulos: "ei muutoksia", 60)
        kuva("lr-yhteneva")
    }

    func testLrRistiriitaRatkaisu() throws {
        guard ProcessInfo.processInfo.environment["SCOPES_KOE_LR"] == "1" else {
            throw XCTSkip("kirjoittava koe vain koeinstanssia vastaan (SCOPES_KOE_LR=1)")
        }
        let app = avaaLr()
        let polku = "scopes/localregister/REKISTERI.md"

        // Kilpaileva muutos palveluun äpin synkan jälkeen: sama rivi, eri laite ("testi").
        let lista = try XCTUnwrap(try pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any])
        let idt = (lista["yksikot"] as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }
        let yksikot = try XCTUnwrap(try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": idt])["yksikot"] as? [[String: Any]])
        var y = try XCTUnwrap(yksikot.first {
            $0["laji"] as? String == "paatos" && $0["poistettu"] as? Bool == false && ($0["rinnakkaiset"] as? [Any] ?? []).isEmpty
        }, "ei muokattavaa päätösriviä")
        let id = try XCTUnwrap(y["id"] as? String)
        let leima = Int(Date().timeIntervalSince1970)
        var versio = try XCTUnwrap(y["versio"] as? [String: Int])
        versio["testi"] = leima
        let alku = try XCTUnwrap(y["sisalto"] as? String)
        let ydin = alku.replacingOccurrences(of: "\\n+$", with: "", options: .regularExpression)
        let testiTeksti = ydin + " [testi \(leima)]" + alku.dropFirst(ydin.count)
        y["sisalto"] = testiTeksti
        y["versio"] = versio
        y["muuttaja"] = "testi"
        y["muutettu"] = ISO8601DateFormatter().string(from: Date())
        y.removeValue(forKey: "lahdeSisalto")
        y.removeValue(forKey: "lahdeVersio")
        let otettu = try pyynto("/api/lr/laheta", ["metat": [], "yksikot": [y]])["otettu"] as? Int
        XCTAssertEqual(otettu, 1, "palvelu ei ottanut kilpailevaa muutosta")

        // Äppi muokkaa samaa riviä vanhasta versiosta → rinnakkainen muutos.
        let haku = app.searchFields["Hae rekistereistä"]
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText("localregister/REKISTERI")
        let rekisteri = app.buttons["lr-rekisteri-\(polku)"]
        XCTAssertTrue(rekisteri.waitForExistence(timeout: 5), "rekisteriä ei löydy listasta")
        rekisteri.tap()
        let rivi = app.buttons["lr-yksikko-\(id)"]
        for _ in 0..<15 where !(rivi.exists && rivi.isHittable) { app.swipeUp() }
        XCTAssertTrue(rivi.isHittable, "riviä \(id) ei löydy")
        rivi.tap()
        let teksti = app.textViews["lr-teksti"]
        XCTAssertTrue(teksti.waitForExistence(timeout: 5))
        // Editori ottaa fokuksen itse; napautus siirtäisi kursorin keskelle riviä.
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5), "editori ei ottanut fokusta")
        teksti.typeText(" app")
        app.buttons["lr-tallenna"].tap()

        // 5 s viive + synkka: palvelu tallentaa rinnakkaisen, äppi hakee sen ja näyttää ristiriidan.
        // Piilossa olevan sivupalkin navigointipalkki on hierarkiassa ensin: paluu nimetyn näkymän palkista.
        app.navigationBars["REKISTERI.md"].buttons.element(boundBy: 0).tap()
        let riita = app.buttons["lr-ristiriita-\(id)"]
        XCTAssertTrue(riita.waitForExistence(timeout: 60), "ristiriita ei näy")
        kuva("lr-ristiriita")
        riita.tap()
        let valinta = app.buttons["lr-valitse-testi"]
        XCTAssertTrue(valinta.waitForExistence(timeout: 5), "testin versiota ei näy")
        kuva("lr-versiot")
        valinta.tap()
        XCTAssertTrue(app.descendants(matching: .any)["lr-ratkaistu"].waitForExistence(timeout: 5))

        // Ratkaisu leviää palveluun: riita poistuu ja rivi on testin versio.
        var ratkaistu = false
        for _ in 0..<30 {
            Thread.sleep(forTimeInterval: 2)
            let riidat = try pyynto("/api/lr/ristiriidat", nil)["ristiriidat"] as? [[String: Any]] ?? []
            if !riidat.contains(where: { $0["id"] as? String == id }) { ratkaistu = true; break }
        }
        XCTAssertTrue(ratkaistu, "palvelulla on yhä ristiriita \(id)")
        let lopuksi = try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": [id]])["yksikot"] as? [[String: Any]]
        XCTAssertEqual(lopuksi?.first?["sisalto"] as? String, testiTeksti)
        app.navigationBars["Ristiriita"].buttons.element(boundBy: 0).tap()
        app.buttons["lr-synkkaa"].tap()
        odota(app, tulos: "ei muutoksia", 60)
    }

    // LOCALREGISTER-RIVINVAIHTO: Return taulukkorivin muokkauksessa ei vie rivinvaihtoa riviin, ja palvelun
    // tulostama taulukko pysyy ehjänä.
    func testLrTaulukkoriviRivinvaihto() throws {
        guard ProcessInfo.processInfo.environment["SCOPES_KOE_LR"] == "1" else {
            throw XCTSkip("kirjoittava koe vain koeinstanssia vastaan (SCOPES_KOE_LR=1)")
        }
        let app = avaaLr()
        let polku = "scopes/localregister/REKISTERI.md"
        let lista = try XCTUnwrap(try pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any])
        let idt = (lista["yksikot"] as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }
        let yksikot = try XCTUnwrap(try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": idt])["yksikot"] as? [[String: Any]])
        let y = try XCTUnwrap(yksikot.first {
            let s = $0["sisalto"] as? String ?? ""
            return $0["laji"] as? String == "avoin" && s.hasPrefix("|") && !s.contains("Koe")
                && !s.replacingOccurrences(of: "\\n+$", with: "", options: .regularExpression).contains("\n")
                && $0["poistettu"] as? Bool == false && ($0["rinnakkaiset"] as? [Any] ?? []).isEmpty
        }, "ei muokattavaa taulukkoriviä")
        let id = try XCTUnwrap(y["id"] as? String)

        let haku = app.searchFields["Hae rekistereistä"]
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText("localregister/REKISTERI")
        let rekisteri = app.buttons["lr-rekisteri-\(polku)"]
        XCTAssertTrue(rekisteri.waitForExistence(timeout: 5), "rekisteriä ei löydy listasta")
        rekisteri.tap()
        let rivi = app.buttons["lr-yksikko-\(id)"]
        for _ in 0..<15 where !(rivi.exists && rivi.isHittable) { app.swipeUp() }
        XCTAssertTrue(rivi.isHittable, "riviä \(id) ei löydy")
        rivi.tap()
        let teksti = app.textViews["lr-teksti"]
        XCTAssertTrue(teksti.waitForExistence(timeout: 5))
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5), "editori ei ottanut fokusta")
        teksti.typeText("\nKoe")
        XCTAssertFalse((teksti.value as? String ?? "").contains("\n"), "editoriin jäi rivinvaihto")
        kuva("lr-taulukkorivi")
        app.buttons["lr-tallenna"].tap()

        var tallennettu = ""
        var ydin = ""
        for _ in 0..<30 {
            Thread.sleep(forTimeInterval: 2)
            let nyt = try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": [id]])["yksikot"] as? [[String: Any]]
            tallennettu = nyt?.first?["sisalto"] as? String ?? ""
            ydin = tallennettu.replacingOccurrences(of: "\\n+$", with: "", options: .regularExpression)
            if ydin.hasSuffix("Koe") { break }
        }
        XCTAssertTrue(ydin.hasSuffix(" Koe"), "palvelulle ei tallentunut: \(tallennettu)")
        XCTAssertFalse(ydin.contains("\n"), "taulukkoriviin tallentui rivinvaihto")
        let tuloste = try XCTUnwrap(try pyynto("/api/lr/teksti/" + polku, nil)["teksti"] as? String)
        XCTAssertFalse(tuloste.split(separator: "\n").contains("Koe"), "Koe omalla rivillään tulosteessa")
    }

    // LOCALREGISTER-RIVINVAIHTO-TODENNUS: laitetestin jättämä rikkinäinen versio (rivinvaihto taulukkorivissä) on
    // riidassa lähteen version kanssa; äppi ratkaisee riidan lähteen uusimmalla versiolla, ja palvelun tuloste pysyy
    // ehjänä. Jos lähde on poistanut rivin (lahdeSisalto puuttuu), voittaa lähteen uusin poisto. Rivi nimetään: SCOPES_KOE_LR_ID="oneplus-005655" (harjoitus koeinstanssin kopiolla ennen tuotantoa).
    func testLrRistiriitaLahdeVoittaa() throws {
        guard let id = ProcessInfo.processInfo.environment["SCOPES_KOE_LR_ID"] else {
            throw XCTSkip("nimetyn rivin ratkaisu vain pyydettäessä (SCOPES_KOE_LR_ID)")
        }
        let polku = "scopes/localregister/REKISTERI.md"
        let ennen = try XCTUnwrap((try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": [id]])["yksikot"] as? [[String: Any]])?.first)
        let sisaret = try XCTUnwrap(ennen["rinnakkaiset"] as? [[String: Any]], "rivillä \(id) ei ole ristiriitaa")
        let lahde = ennen["lahdeSisalto"] as? String
        // Valittava versio: uusin lähteen (oneplus) versio, jonka sisältö on lähteen sisältö, tai lähteen poisto.
        let oneplus = ([ennen] + sisaret).filter { $0["muuttaja"] as? String == "oneplus" }
        let kohde = try XCTUnwrap(oneplus.lastIndex {
            if let lahde { return $0["sisalto"] as? String == lahde && $0["poistettu"] as? Bool != true }
            return $0["poistettu"] as? Bool == true
        }, "lähteen versiota ei ole riidassa")

        // Riidat ovat päänäkymän Ristiriidat-osiossa, Synkka-osion alla.
        let app = avaaLr()
        let riita = app.buttons["lr-ristiriita-\(id)"]
        for _ in 0..<5 where !(riita.exists && riita.isHittable) { app.swipeUp() }
        XCTAssertTrue(riita.isHittable, "ristiriitaa \(id) ei näy")
        riita.tap()
        // Lista on laiska: vain ruudulla olevat versiot ovat hierarkiassa. Kohde on viimeinen versio, joten
        // vieritetään loppuun ("Yhdistä käsin…" näkyy) ja valitaan alin lähteen versio.
        XCTAssertEqual(kohde, oneplus.count - 1, "lähteen versio ei ole viimeinen; valinta indeksillä ei onnistu laiskassa listassa")
        // Pitkä pääversio voi täyttää ruudun, jolloin yksikään lähteen nappi ei ole vielä hierarkiassa: vieritä ensin.
        XCTAssertTrue(app.buttons["lr-valitse-\(ennen["muuttaja"] as? String ?? "?")"].firstMatch.waitForExistence(timeout: 5), "ristiriitanäkymä ei auennut")
        kuva("lr-riita-ennen")
        let yhdista = app.buttons["lr-yhdista"]
        for _ in 0..<15 where !(yhdista.exists && yhdista.isHittable) { app.swipeUp() }
        XCTAssertTrue(yhdista.isHittable, "versiolistan loppu ei tullut näkyviin")
        let valinnat = app.buttons.matching(identifier: "lr-valitse-oneplus")
        XCTAssertTrue(valinnat.firstMatch.waitForExistence(timeout: 5), "lähteen versiota ei näy")
        let nappi = valinnat.element(boundBy: valinnat.count - 1)
        XCTAssertTrue(nappi.isHittable)
        nappi.tap()
        XCTAssertTrue(app.descendants(matching: .any)["lr-ratkaistu"].waitForExistence(timeout: 5))

        var ratkaistu = false
        for _ in 0..<30 {
            Thread.sleep(forTimeInterval: 2)
            let riidat = try pyynto("/api/lr/ristiriidat", nil)["ristiriidat"] as? [[String: Any]] ?? []
            if !riidat.contains(where: { $0["id"] as? String == id }) { ratkaistu = true; break }
        }
        XCTAssertTrue(ratkaistu, "palvelulla on yhä ristiriita \(id)")
        let lopuksi = try XCTUnwrap((try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": [id]])["yksikot"] as? [[String: Any]])?.first)
        let ydin = (lopuksi["sisalto"] as? String ?? "").replacingOccurrences(of: "\\n+$", with: "", options: .regularExpression)
        let tuloste = try XCTUnwrap(try pyynto("/api/lr/teksti/" + polku, nil)["teksti"] as? String)
        if let lahde {
            XCTAssertEqual(lopuksi["sisalto"] as? String, lahde)
            XCTAssertFalse(ydin.contains("\n"), "taulukkoriviin jäi rivinvaihto")
        } else {
            XCTAssertEqual(lopuksi["poistettu"] as? Bool, true, "lähteen poisto ei voittanut")
            let alku = String(ydin.split(separator: "\n").first ?? "")
            XCTAssertFalse(!alku.isEmpty && tuloste.contains(alku), "poistettu rivi on yhä tulosteessa")
        }
        XCTAssertFalse(tuloste.split(separator: "\n").contains { $0.hasPrefix("Koe") }, "Koe-jälki omalla rivillään tulosteessa")
        kuva("lr-riita-ratkaistu")
    }

    // LOCALREGISTER-RIVIN-LISAYS: uusi rivi taulukon viimeisen rivin alle rivin pitkän painalluksen Lisää alle -valinnalla.
    // Return on välilyönti, rivi tulee heti ankkurin alle, taulukon perässä oleva tyhjä rivi jää uuden rivin perään, ja
    // synkan jälkeen juuritiiviste on sama molemmilla.
    // Tuotantoa vastaan vain siivoavana (SCOPES_KOE_LR_POISTA=1): koerivi poistetaan lopuksi äpin Poista rivi -painikkeella.
    func testLrRivinLisays() throws {
        let ymp = ProcessInfo.processInfo.environment
        let poistaLopuksi = ymp["SCOPES_KOE_LR_POISTA"] == "1"
        guard ymp["SCOPES_KOE_LR"] == "1" || poistaLopuksi else {
            throw XCTSkip("kirjoittava koe vain koeinstanssia vastaan (SCOPES_KOE_LR=1) tai siivoavana (SCOPES_KOE_LR_POISTA=1)")
        }
        let app = avaaLr()
        let polku = "scopes/localregister/REKISTERI.md"
        let lista = try XCTUnwrap(try pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any])
        let idt = (lista["yksikot"] as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }
        let yksikot = try XCTUnwrap(try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": idt])["yksikot"] as? [[String: Any]])
        // Ankkuri on taulukon viimeinen rivi (perässä tyhjä rivi): Avoimet asiat -rivi tai, jos se on riidassa, tyhjän
        // Viat-taulukon otsake. Kummassakin ankkurin tyhjä rivi siirtyy uuden rivin perään.
        let ehdokkaat = yksikot.filter {
            ($0["sisalto"] as? String ?? "").hasSuffix("|\n\n") && $0["poistettu"] as? Bool == false
                && ($0["rinnakkaiset"] as? [Any] ?? []).isEmpty
        }
        let ankkuri = try XCTUnwrap(ehdokkaat.first { $0["laji"] as? String == "avoin" }
            ?? ehdokkaat.first { $0["laji"] as? String == "taulukko-otsake" && $0["osio"] as? String == "Viat" },
            "taulukon viimeistä riviä ei löydy")
        let odotettuLaji = ankkuri["laji"] as? String == "avoin" ? "avoin" : "vika"
        let id = try XCTUnwrap(ankkuri["id"] as? String)
        let ankkuririvi = (ankkuri["sisalto"] as? String ?? "").replacingOccurrences(of: "\\n+$", with: "", options: .regularExpression)
            .components(separatedBy: "\n").last ?? ""
        let leima = Int(Date().timeIntervalSince1970)
        let uusiRivi = "| Koe lisays \(leima) | testi |"

        let haku = app.searchFields["Hae rekistereistä"]
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText("localregister/REKISTERI")
        let rekisteri = app.buttons["lr-rekisteri-\(polku)"]
        XCTAssertTrue(rekisteri.waitForExistence(timeout: 5), "rekisteriä ei löydy listasta")
        rekisteri.tap()
        let rivi = app.buttons["lr-yksikko-\(id)"]
        for _ in 0..<15 where !(rivi.exists && rivi.isHittable) { app.swipeUp() }
        XCTAssertTrue(rivi.isHittable, "riviä \(id) ei löydy")
        // Pitkä painallus avaa rivin valikon. Pyyhkäisy ei käy: sivuttaisveto avaa sivupalkin (kuva lr-pyyhkaisy 14.10.2026).
        rivi.press(forDuration: 1.2)
        let tunnus = app.buttons["lr-lisaa-\(id)"]
        let lisaa = tunnus.waitForExistence(timeout: 5) ? tunnus : app.buttons["Lisää alle"]
        if !lisaa.waitForExistence(timeout: 2) { kuva("lr-valikko") }
        XCTAssertTrue(lisaa.exists, "Lisää alle -valinta puuttuu rivin valikosta")
        lisaa.tap()
        XCTAssertTrue(app.navigationBars["Uusi rivi"].waitForExistence(timeout: 5))
        let teksti = app.textViews["lr-teksti"]
        XCTAssertEqual(teksti.value as? String ?? "", "", "uusi rivi ei alkanut tyhjänä")
        teksti.typeText("| Koe lisays \(leima) |\ntesti |")
        XCTAssertFalse((teksti.value as? String ?? "").contains("\n"), "editoriin jäi rivinvaihto")
        kuva("lr-lisays")
        app.buttons["lr-tallenna"].tap()

        // Palvelun tuloste: ankkuri, heti perään uusi rivi, sitten taulukon loppu (tyhjä rivi).
        var rivit: [String] = []
        for _ in 0..<30 {
            Thread.sleep(forTimeInterval: 2)
            let tuloste = try XCTUnwrap(try pyynto("/api/lr/teksti/" + polku, nil)["teksti"] as? String)
            rivit = tuloste.components(separatedBy: "\n")
            if rivit.contains(uusiRivi) { break }
        }
        let k = try XCTUnwrap(rivit.firstIndex(of: ankkuririvi), "ankkuririvi puuttuu tulosteesta")
        XCTAssertEqual((k + 1 < rivit.count ? rivit[k + 1] : nil), uusiRivi, "uusi rivi ei ole ankkurin alla")
        XCTAssertEqual((k + 2 < rivit.count ? rivit[k + 2] : nil), "", "taulukon loppu muuttui")
        let lopuksi = try XCTUnwrap(try pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any])
        let uudet = (lopuksi["yksikot"] as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }.filter { !idt.contains($0) }
        XCTAssertEqual(uudet.count, 1, "uusia yksiköitä \(uudet)")
        let uusi = try XCTUnwrap((try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": uudet])["yksikot"] as? [[String: Any]])?.first)
        XCTAssertEqual(uusi["laji"] as? String, odotettuLaji)
        XCTAssertFalse((uusi["id"] as? String ?? "").hasPrefix("oneplus-"), "tunnus ei ole äpin laitteen")

        // Koerivi pois, jottei se jää kaksoiskappaleeseen; seuraava tuonti tiivistää kiven (lr.mjs siivoa).
        if poistaLopuksi {
            let uusiId = try XCTUnwrap(uusi["id"] as? String)
            let uusiNappi = app.buttons["lr-yksikko-\(uusiId)"]
            for _ in 0..<15 where !(uusiNappi.exists && uusiNappi.isHittable) { app.swipeUp() }
            XCTAssertTrue(uusiNappi.isHittable, "uutta riviä \(uusiId) ei näy")
            uusiNappi.tap()
            XCTAssertTrue(app.navigationBars["Muokkaa riviä"].waitForExistence(timeout: 5))
            let poista = app.buttons["lr-poista"]
            // Poista rivi on editorin alla näppäimistön yläpuolella (safeAreaInset), ei näppäimistön peittämässä alapalkissa.
            if !(poista.exists && poista.isHittable) { kuva("lr-poista") }
            XCTAssertTrue(poista.isHittable, "Poista rivi -painike ei ole painettavissa")
            poista.tap()
            var poistettu = false
            for _ in 0..<30 {
                Thread.sleep(forTimeInterval: 2)
                let y = (try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": [uusiId]])["yksikot"] as? [[String: Any]])?.first
                if y == nil || y?["poistettu"] as? Bool == true { poistettu = true; break }
            }
            XCTAssertTrue(poistettu, "koerivin poisto ei tullut palvelulle")
            let tuloste = try XCTUnwrap(try pyynto("/api/lr/teksti/" + polku, nil)["teksti"] as? String)
            let jalkeen = tuloste.components(separatedBy: "\n")
            XCTAssertFalse(jalkeen.contains(uusiRivi), "poistettu koerivi on yhä tulosteessa")
            // Koerivin tyhjä häntä palaa ankkurille: taulukon perässä on yhä tyhjä rivi.
            let a = try XCTUnwrap(jalkeen.firstIndex(of: ankkuririvi), "ankkuririvi puuttuu poiston jälkeen")
            XCTAssertEqual((a + 1 < jalkeen.count ? jalkeen[a + 1] : nil), "", "taulukon perän tyhjä rivi katosi poistossa")
        }

        app.navigationBars["REKISTERI.md"].buttons.element(boundBy: 0).tap()
        app.buttons["lr-synkkaa"].tap()
        // Tuotannossa vienti gittiin siivoaa koerivin hautakiven kesken kierroksen; äpin lisäkierros päättyy
        // "yhtenevä" eikä "ei muutoksia" (LOCALREGISTER-VIENTI-TODENNUS 14.10.2026). Kumpikin = sama tila.
        odota(app, tulos: "ei muutoksia|yhtenevä", 60)
    }

    // PURASCRIPT-LR-TODENNUS: äpissä lisätty rivi päätyy testipurun tiedostoon, kun Testipurku painetaan heti tallennuksen
    // jälkeen (Lr.synkkaaEnnen). Avaa oikean istunnon, joten vain nimetylle skoopille, jossa ei ole automaattivalintaa:
    //   SCOPES_KOE_TESTIPURKU="scopes chat question" bash scopes/ios/testi.sh
    // Purkutiedosto (~/.local/state/pura/<slug>.md) luetaan palvelimella testin jälkeen; koerivi poistetaan lopuksi.
    func testLrTestipurkuNakeeMuokkauksen() throws {
        guard let skooppi = ProcessInfo.processInfo.environment["SCOPES_KOE_TESTIPURKU"], !skooppi.isEmpty else {
            throw XCTSkip("avaa istunnon: vain SCOPES_KOE_TESTIPURKU-skoopille")
        }
        let app = avaaLr()
        let polku = skooppi.replacingOccurrences(of: " ", with: "/") + "/REKISTERI.md"
        let lista = try XCTUnwrap(try pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any])
        let idt = (lista["yksikot"] as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }
        let yksikot = try XCTUnwrap(try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": idt])["yksikot"] as? [[String: Any]])
        let ehdokkaat = yksikot.filter {
            ($0["sisalto"] as? String ?? "").hasSuffix("|\n\n") && $0["poistettu"] as? Bool == false
                && ($0["rinnakkaiset"] as? [Any] ?? []).isEmpty
        }
        let ankkuri = try XCTUnwrap(ehdokkaat.first { $0["laji"] as? String == "avoin" }
            ?? ehdokkaat.first { $0["laji"] as? String == "taulukko-otsake" && $0["osio"] as? String == "Avoimet asiat" },
            "Avoimet asiat -taulukon viimeistä riviä ei löydy")
        let id = try XCTUnwrap(ankkuri["id"] as? String)
        let asia = "Koe testipurku \(Int(Date().timeIntervalSince1970))"
        let uusiRivi = "| \(asia) | avoin | testi |"

        let haku = app.searchFields["Hae rekistereistä"]
        XCTAssertTrue(haku.waitForExistence(timeout: 5))
        haku.tap()
        haku.typeText(polku.replacingOccurrences(of: "scopes/", with: ""))
        let rekisteri = app.buttons["lr-rekisteri-\(polku)"]
        XCTAssertTrue(rekisteri.waitForExistence(timeout: 5), "rekisteriä ei löydy listasta")
        rekisteri.tap()
        let rivi = app.buttons["lr-yksikko-\(id)"]
        for _ in 0..<15 where !(rivi.exists && rivi.isHittable) { app.swipeUp() }
        XCTAssertTrue(rivi.isHittable, "riviä \(id) ei löydy")
        rivi.press(forDuration: 1.2)
        let tunnus = app.buttons["lr-lisaa-\(id)"]
        let lisaa = tunnus.waitForExistence(timeout: 5) ? tunnus : app.buttons["Lisää alle"]
        XCTAssertTrue(lisaa.waitForExistence(timeout: 2), "Lisää alle -valinta puuttuu rivin valikosta")
        lisaa.tap()
        let teksti = app.textViews["lr-teksti"]
        XCTAssertTrue(teksti.waitForExistence(timeout: 5))
        teksti.typeText(uusiRivi)
        app.buttons["lr-tallenna"].tap()
        let tallennettu = Date()
        // Koerivi pois myös kaatuessa: äppi suljetaan (ei enää lähetyksiä) ja palvelun rivi haudataan suoraan. Kuten
        // äpin poistossa (Lr.poista), koerivin tyhjä häntä palaa ankkurille, muuten taulukon perän tyhjä rivi katoaa.
        addTeardownBlock { [self] in
            app.terminate()
            let lista = try? pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any]
            let uudet = (lista?["yksikot"] as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }.filter { !idt.contains($0) }
            guard !uudet.isEmpty,
                  let ys = try? pyynto("/api/lr/hae", ["rekisteri": polku, "idt": uudet + [id]])["yksikot"] as? [[String: Any]] else { return }
            let nyt = ISO8601DateFormatter().string(from: Date())
            func uusi(_ y: [String: Any], _ muutos: [String: Any]) -> [String: Any] {
                var y = y, v = y["versio"] as? [String: Int] ?? [:]
                v["uitesti", default: 0] += 1
                y["versio"] = v; y["muuttaja"] = "uitesti"; y["muutettu"] = nyt
                return y.merging(muutos) { $1 }
            }
            func ydin(_ s: String) -> String { var t = s; while t.hasSuffix("\n") { t.removeLast() }; return t }
            func hanta(_ s: String) -> String { String(s.dropFirst(ydin(s).count)) }
            let koe = ys.filter { $0["id"] as? String != id && ($0["sisalto"] as? String ?? "").contains(asia) && $0["poistettu"] as? Bool != true }
            guard !koe.isEmpty else { return }
            var lahetys = koe.map { uusi($0, ["poistettu": true]) }
            let koeHanta = koe.map { hanta($0["sisalto"] as? String ?? "") }.max { $0.count < $1.count } ?? ""
            if koeHanta.count > 1, let a = ys.first(where: { $0["id"] as? String == id }), let s = a["sisalto"] as? String, hanta(s) == "\n" {
                lahetys.append(uusi(a, ["sisalto": ydin(s) + koeHanta]))
            }
            _ = try? pyynto("/api/lr/laheta", ["metat": [], "yksikot": lahetys])
            print("TESTIPURKU: siivous haudattu \(koe.count) koeriviä, ankkurin häntä \(lahetys.count > koe.count ? "palautettu" : "ennallaan")")
        }

        // Heti skoopin Tiedot-näkymään ja Testipurku; palvelun tilaa ei odoteta väliin. Nuoli on vain Infra-juuren
        // työkalupalkissa: REKISTERI.md ja Paikallinen rekisteri ovat sen päällä, ja Paikallisen rekisterin auki
        // oleva alahaku piilottaa navigointipalkin, kunnes haku suljetaan close-napista (iOS 27, 15.10.2026).
        let nuoli = app.buttons["sivupalkki"].firstMatch
        for _ in 0..<5 where !(nuoli.exists && nuoli.isHittable) {
            if let palkki = ["REKISTERI.md", "Paikallinen rekisteri"].map({ app.navigationBars[$0] }).first(where: { $0.exists }) {
                palkki.buttons.element(boundBy: 0).tap()
            } else if app.buttons["close"].exists {
                app.buttons["close"].tap()
            } else { break }
            _ = nuoli.waitForExistence(timeout: 2)
        }
        XCTAssertTrue(nuoli.waitForExistence(timeout: 10), "sivupalkin nuoli puuttuu")
        nuoli.tap()
        let skoopit = app.searchFields["Hae chateista ja skoopeista"]
        XCTAssertTrue(skoopit.waitForExistence(timeout: 5), "sivupalkin haku puuttuu")
        if app.buttons["suodatin-all"].exists && !app.buttons["suodatin-all"].isSelected { app.buttons["suodatin-all"].tap() }
        skoopit.tap()
        skoopit.typeText(skooppi)
        let skooppiRivi = app.buttons["skooppi-\(skooppi)"]
        XCTAssertTrue(skooppiRivi.waitForExistence(timeout: 15), "haku ei löytänyt skooppia \(skooppi)")
        skooppiRivi.tap()
        XCTAssertTrue(app.buttons["tiedot"].waitForExistence(timeout: 15), "tiedot-välilehti puuttuu")
        app.buttons["tiedot"].tap()
        let testi = app.buttons["toiminto-pura-testi"]
        XCTAssertTrue(testi.waitForExistence(timeout: 15), "testipurku-nappi puuttuu")
        for _ in 0..<4 where !testi.isHittable { app.swipeUp() }
        testi.tap()
        // Vahvistusnappi näkyy kahdesti (Button Buttonin sisällä, iOS 27): firstMatch.
        let vahvista = app.buttons["vahvista"].firstMatch
        XCTAssertTrue(vahvista.waitForExistence(timeout: 5), "testipurun vahvistus puuttuu")
        vahvista.tap()
        print("TESTIPURKU: vahvistettu \(String(format: "%.1f", Date().timeIntervalSince(tallennettu))) s tallennuksesta")
        let tulos = app.staticTexts["toiminto-tulos"]
        let virhe = app.staticTexts["toiminto-virhe"]
        let loppu = Date().addingTimeInterval(240)
        while !tulos.exists && !virhe.exists && Date() < loppu { sleep(2) }
        kuva("testipurku-tulos")
        XCTAssertFalse(virhe.exists, virhe.exists ? virhe.label : "")
        XCTAssertTrue(tulos.exists, "testipurku ei avannut istuntoa 240 s:ssa")
        print("TESTIPURKU: koerivi \(uusiRivi)")
        let tuloste = try XCTUnwrap(try pyynto("/api/lr/teksti/" + polku, nil)["teksti"] as? String)
        XCTAssertTrue(tuloste.components(separatedBy: "\n").contains(uusiRivi), "koerivi ei ole palvelun LR:ssä")

        // Koerivi pois: Infra → paikallinen rekisteri → rivi → Poista rivi.
        nuoli.tap()
        let infra = app.buttons["sivupalkki-infra"]
        XCTAssertTrue(infra.waitForExistence(timeout: 5))
        infra.tap()
        XCTAssertTrue(app.buttons["infra-lr"].waitForExistence(timeout: 15))
        app.buttons["infra-lr"].tap()
        if !app.navigationBars["REKISTERI.md"].exists {
            XCTAssertTrue(haku.waitForExistence(timeout: 5))
            haku.tap()
            haku.typeText(polku.replacingOccurrences(of: "scopes/", with: ""))
            XCTAssertTrue(rekisteri.waitForExistence(timeout: 5))
            rekisteri.tap()
        }
        let uudet = (try XCTUnwrap(try pyynto("/api/lr/listat", ["rekisterit": [polku]])[polku] as? [String: Any])["yksikot"]
            as? [[String: Any]] ?? []).compactMap { $0["id"] as? String }.filter { !idt.contains($0) }
        XCTAssertEqual(uudet.count, 1, "uusia yksiköitä \(uudet)")
        let uusiNappi = app.buttons["lr-yksikko-\(uudet[0])"]
        for _ in 0..<15 where !(uusiNappi.exists && uusiNappi.isHittable) { app.swipeUp() }
        XCTAssertTrue(uusiNappi.isHittable, "koeriviä \(uudet[0]) ei näy")
        uusiNappi.tap()
        XCTAssertTrue(app.buttons["lr-poista"].waitForExistence(timeout: 5))
        app.buttons["lr-poista"].tap()
        var poistettu = false
        for _ in 0..<30 {
            Thread.sleep(forTimeInterval: 2)
            let y = (try pyynto("/api/lr/hae", ["rekisteri": polku, "idt": [uudet[0]]])["yksikot"] as? [[String: Any]])?.first
            if y == nil || y?["poistettu"] as? Bool == true { poistettu = true; break }
        }
        XCTAssertTrue(poistettu, "koerivin poisto ei tullut palvelulle")
    }

    private func avaaLr() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchEnvironment["SCOPES_OSOITE"] = osoite
        app.launchEnvironment["SCOPES_AVAIN"] = avain
        app.launchEnvironment["SCOPES_LR_NOLLAA"] = "1"
        app.launch()
        let infra = app.buttons["sivupalkki-infra"]
        if !infra.waitForExistence(timeout: 10) || !infra.isHittable {
            let nuoli = app.buttons["sivupalkki"].firstMatch
            XCTAssertTrue(nuoli.waitForExistence(timeout: 15), "sivupalkin nuoli puuttuu")
            nuoli.tap()
        }
        XCTAssertTrue(infra.waitForExistence(timeout: 5))
        infra.tap()
        let lr = app.buttons["infra-lr"]
        XCTAssertTrue(lr.waitForExistence(timeout: 15), "Infrassa ei ole paikallista rekisteriä")
        lr.tap()
        // Ensimmäinen synkka käynnistyy äpin avautuessa ja hakee koko kopion; jos toinen laukaisija ehti perään,
        // tulos on jo "ei muutoksia" (sama juuritiiviste). Kopion koko tarkistetaan testissä erikseen.
        odota(app, tulos: "yhtenevä|ei muutoksia", 180)
        return app
    }

    private func odota(_ app: XCUIApplication, tulos: String, _ aika: TimeInterval) {
        let ehto = NSPredicate(format: "label MATCHES %@", ".*(\(tulos))$")
        let e = app.descendants(matching: .any).matching(identifier: "lr-tulos").matching(ehto).firstMatch
        if !e.waitForExistence(timeout: aika) {
            let nyt = app.descendants(matching: .any)["lr-tulos"]
            let virhe = app.descendants(matching: .any)["lr-virhe"]
            XCTFail("odotettiin '\(tulos)', tila: \(nyt.exists ? nyt.label : "-"), virhe: \(virhe.exists ? virhe.label : "-")")
        }
    }

    private func pyynto(_ polku: String, _ runko: [String: Any]?) throws -> [String: Any] {
        var p = URLRequest(url: URL(string: osoite + polku)!, timeoutInterval: 30)
        p.setValue("Bearer \(avain)", forHTTPHeaderField: "Authorization")
        if let runko {
            p.httpMethod = "POST"
            p.httpBody = try JSONSerialization.data(withJSONObject: runko)
            p.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        var tulos: Result<Data, Error> = .failure(URLError(.timedOut))
        let valmis = DispatchSemaphore(value: 0)
        URLSession.shared.dataTask(with: p) { data, vastaus, virhe in
            let koodi = (vastaus as? HTTPURLResponse)?.statusCode ?? 0
            if let virhe { tulos = .failure(virhe) } else if koodi != 200 {
                tulos = .failure(NSError(domain: "lr", code: koodi, userInfo: [NSLocalizedDescriptionKey: String(decoding: data ?? Data(), as: UTF8.self)]))
            } else { tulos = .success(data ?? Data()) }
            valmis.signal()
        }.resume()
        valmis.wait()
        return try XCTUnwrap(try JSONSerialization.jsonObject(with: tulos.get()) as? [String: Any])
    }

    private func kuva(_ nimi: String) {
        let k = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        k.name = nimi
        k.lifetime = .keepAlways
        add(k)
    }
}
