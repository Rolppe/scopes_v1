import XCTest
@testable import ScopesCore

final class MockURLProtocol: URLProtocol, @unchecked Sendable {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = Self.requestHandler else {
            client?.urlProtocol(self, didFailWithError: URLError(.unknown))
            return
        }
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

final class ScopesClientTests: XCTestCase {
    var session: URLSession!

    override func setUp() {
        super.setUp()
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        session = URLSession(configuration: config)
    }

    func testHaeSkoopitOnnistuu() async throws {
        let mockJSON = """
        [
            {"nimi": "scopes macos", "avoimia": 1, "vikoja": 0, "istuntoja": 0}
        ]
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.value(forHTTPHeaderField: "Authorization"), "Bearer testiavain")
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let skoopit = try await client.skoopit()
        XCTAssertEqual(skoopit.count, 1)
        XCTAssertEqual(skoopit.first?.nimi, "scopes macos")
    }

    func testHaeSkoopitVirhe() async throws {
        MockURLProtocol.requestHandler = { req in
            let res = HTTPURLResponse(url: req.url!, statusCode: 401, httpVersion: nil, headerFields: nil)!
            let errJSON = "{\"virhe\": \"avain puuttuu\"}".data(using: .utf8)!
            return (res, errJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "vaara-avain", session: session)
        do {
            _ = try await client.skoopit()
            XCTFail("Piti heittää virhe")
        } catch let ScopesClient.Virhe.palvelu(koodi, viesti) {
            XCTAssertEqual(koodi, 401)
            XCTAssertEqual(viesti, "avain puuttuu")
        }
    }

    func testHaeViestitOnnistuu() async throws {
        let mockJSON = """
        {
            "nimi": "scopes macos",
            "auki": true,
            "voiLahettaa": true,
            "viestit": [
                {"rooli": "agentti", "teksti": "Hei!"}
            ]
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertTrue(req.url!.path.contains("/api/skoopit/scopes macos/viestit"))
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let v = try await client.viestit(skooppi: "scopes macos")
        XCTAssertEqual(v.nimi, "scopes macos")
        XCTAssertTrue(v.auki)
        XCTAssertEqual(v.viestit.count, 1)
        XCTAssertEqual(v.viestit.first?.teksti, "Hei!")
    }

    func testLahetaViestiOnnistuu() async throws {
        let mockJSON = "{\"istunto\": \"sessio-123\"}".data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.httpMethod, "POST")
            XCTAssertTrue(req.url!.path.contains("/api/skoopit/scopes macos/viesti"))
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let v = try await client.laheta(skooppi: "scopes macos", teksti: "Tervehdys")
        XCTAssertEqual(v.istunto, "sessio-123")
    }

    func testSuoratoistaViestiOnnistuu() async throws {
        let mockNDJSON = """
        {"tyyppi": "pala", "teksti": "Alku"}
        {"tyyppi": "pala", "teksti": " ja loppu."}
        {"tyyppi": "valmis", "vastaus": "Alku ja loppu.", "keskustelu": "c-999"}
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.httpMethod, "POST")
            XCTAssertTrue(req.url!.path.contains("/api/skoopit/scopes macos/stream"))
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockNDJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        var keratyt: [ChatTapahtuma] = []
        for try await tapahtuma in client.suoratoistaViesti(skooppi: "scopes macos", teksti: "Jatko") {
            keratyt.append(tapahtuma)
        }

        XCTAssertEqual(keratyt.count, 3)
        XCTAssertEqual(keratyt[0].teksti, "Alku")
        XCTAssertEqual(keratyt[1].teksti, " ja loppu.")
        XCTAssertEqual(keratyt[2].tyyppi, "valmis")
    }

    func testKayttorajaOnnistuu() async throws {
        let mockJSON = """
        {
            "viisiTuntia": {"kaytto": 42.5, "nollautuu": "2026-10-18T18:00:00Z"},
            "viikko": {"kaytto": 12.0, "nollautuu": null}
        }
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.httpMethod, "GET")
            XCTAssertTrue(req.url!.path.contains("/api/kayttoraja"))
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let k = try await client.kayttoraja(skooppi: "scopes macos")
        XCTAssertEqual(k.viisiTuntia?.kaytto, 42.5)
        XCTAssertEqual(k.viisiTuntia?.nollautuu, "2026-10-18T18:00:00Z")
        XCTAssertEqual(k.viikko?.kaytto, 12.0)
    }

    func testVaihdaMalliOnnistuu() async throws {
        let mockJSON = """
        {"istunto": "s-100"}
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.httpMethod, "POST")
            XCTAssertTrue(req.url!.path.contains("/api/skoopit/scopes macos/malli"))
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let res = try await client.vaihdaMalli(skooppi: "scopes macos", malli: "claude-sonnet-5-5", effort: "high")
        XCTAssertEqual(res.istunto, "s-100")
    }

    func testSuljeKysymysOnnistuu() async throws {
        let mockJSON = """
        {"istunto": "s-100"}
        """.data(using: .utf8)!

        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.httpMethod, "POST")
            XCTAssertTrue(req.url!.path.contains("/api/skoopit/scopes macos/kysymys-pois"))
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, mockJSON)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let res = try await client.suljeKysymys(skooppi: "scopes macos")
        XCTAssertEqual(res.istunto, "s-100")
    }

    func testLahetaLiiteOnnistuu() async throws {
        MockURLProtocol.requestHandler = { req in
            XCTAssertEqual(req.httpMethod, "POST")
            XCTAssertEqual(req.url?.path, "/api/skoopit/scopes macos/liite")
            XCTAssertEqual(req.url?.query, "nimi=kuva%20%C3%A4%2Epng")
            XCTAssertEqual(req.value(forHTTPHeaderField: "Content-Type"), "application/octet-stream")
            XCTAssertEqual(req.timeoutInterval, 120)
            let res = HTTPURLResponse(url: req.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (res, "{\"polku\": \"~/liitteet/kuva.png\", \"koko\": 3}".data(using: .utf8)!)
        }

        let client = ScopesClient(osoite: "http://127.0.0.1:8787", avain: "testiavain", session: session)
        let v = try await client.lahetaLiite(skooppi: "scopes macos", nimi: "kuva ä.png", data: Data([1, 2, 3]))
        XCTAssertEqual(v.polku, "~/liitteet/kuva.png")
        XCTAssertEqual(v.koko, 3)
    }

    func testLiiteViesti() {
        XCTAssertEqual(LiiteVastaus.viesti("hei", polut: []), "hei")
        XCTAssertEqual(LiiteVastaus.viesti("", polut: ["/a", "/b"]), "Liitteet: /a /b")
        XCTAssertEqual(LiiteVastaus.viesti("katso", polut: ["/a"]), "katso\n\nLiitteet: /a")
    }
}
