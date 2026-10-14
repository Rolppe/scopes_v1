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
