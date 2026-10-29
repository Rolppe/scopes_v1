import Foundation

// Paikallinen tilarekisteri ja välimuisti (0 ms vasteaika käyttöliittymälle).
// Tallentaa tilat App Group -hakemistoon, jolloin äppi ja widgetit tietävät tilat heti käynnistyessä
// ilman verkkoviiveitä. Muutokset päivittyvät optimisesti paikalliseen kantaan.
final class ScopesDatabase: @unchecked Sendable {
    static let sovellusRyhma = "group.com.example.skoopit"
    static let jaettu = ScopesDatabase()

    static var oletusHakemisto: URL {
        if let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: sovellusRyhma) {
            return container.appendingPathComponent("scopes_state", isDirectory: true)
        }
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        return appSupport.appendingPathComponent("com.example.skoopit/state", isDirectory: true)
    }

    private let hakemisto: URL
    private let tiedostomanageri = FileManager.default
    private let lukko = NSLock()

    // Välimuisti muistissa 0 ms vasteajoille
    private var skoopitMuisti: [SkooppiYhteenveto] = []
    private var skooppiViestitMuisti: [String: SkooppiViestit] = [:]
    private var chatKeskustelutMuisti: [ChatKeskustelu] = []
    private var chatViestitMuisti: [String: [Viesti]] = [:]
    private var agentitMuisti: [Agentti] = []
    private var purkuValinnatMuisti: PurkuValinnat?
    private var skooppiNakymatMuisti: [String: SkooppiNakyma] = [:]

    init(hakemisto: URL = ScopesDatabase.oletusHakemisto) {
        self.hakemisto = hakemisto
        try? tiedostomanageri.createDirectory(at: hakemisto, withIntermediateDirectories: true)
        try? tiedostomanageri.createDirectory(at: hakemisto.appendingPathComponent("viestit", isDirectory: true), withIntermediateDirectories: true)
        try? tiedostomanageri.createDirectory(at: hakemisto.appendingPathComponent("chat_viestit", isDirectory: true), withIntermediateDirectories: true)
        try? tiedostomanageri.createDirectory(at: hakemisto.appendingPathComponent("nakymat", isDirectory: true), withIntermediateDirectories: true)

        // Alustetaan muisti synkronisesti levyltä
        self.skoopitMuisti = Self.lueJSON(hakemisto.appendingPathComponent("skoopit.json")) ?? []
        self.chatKeskustelutMuisti = Self.lueJSON(hakemisto.appendingPathComponent("chat_keskustelut.json")) ?? []
        self.agentitMuisti = Self.lueJSON(hakemisto.appendingPathComponent("agentit.json")) ?? []
        self.purkuValinnatMuisti = Self.lueJSON(hakemisto.appendingPathComponent("purku_valinnat.json"))
    }

    // MARK: - Välittömät luvut muistista (0 ms)

    func lueSkoopit() -> [SkooppiYhteenveto] {
        lukko.lock()
        defer { lukko.unlock() }
        return skoopitMuisti
    }

    func lueSkooppiViestit(skooppi: String) -> SkooppiViestit? {
        lukko.lock()
        defer { lukko.unlock() }
        if let muistissa = skooppiViestitMuisti[skooppi] { return muistissa }
        let tiedosto = hakemisto.appendingPathComponent("viestit/\(sanitoituNimi(skooppi)).json")
        if let ladattu: SkooppiViestit = Self.lueJSON(tiedosto) {
            skooppiViestitMuisti[skooppi] = ladattu
            return ladattu
        }
        return nil
    }

    func lueChatKeskustelut() -> [ChatKeskustelu] {
        lukko.lock()
        defer { lukko.unlock() }
        return chatKeskustelutMuisti
    }

    func lueChatViestit(keskusteluId: String) -> [Viesti] {
        lukko.lock()
        defer { lukko.unlock() }
        if let muistissa = chatViestitMuisti[keskusteluId] { return muistissa }
        let tiedosto = hakemisto.appendingPathComponent("chat_viestit/\(sanitoituNimi(keskusteluId)).json")
        if let ladattu: [Viesti] = Self.lueJSON(tiedosto) {
            chatViestitMuisti[keskusteluId] = ladattu
            return ladattu
        }
        return []
    }

    func lueAgentit() -> [Agentti] {
        lukko.lock()
        defer { lukko.unlock() }
        return agentitMuisti
    }

    func luePurkuValinnat() -> PurkuValinnat? {
        lukko.lock()
        defer { lukko.unlock() }
        return purkuValinnatMuisti
    }

    func lueSkooppiNakyma(nimi: String) -> SkooppiNakyma? {
        lukko.lock()
        defer { lukko.unlock() }
        if let muistissa = skooppiNakymatMuisti[nimi] { return muistissa }
        let tiedosto = hakemisto.appendingPathComponent("nakymat/\(sanitoituNimi(nimi)).json")
        if let ladattu: SkooppiNakyma = Self.lueJSON(tiedosto) {
            skooppiNakymatMuisti[nimi] = ladattu
            return ladattu
        }
        return nil
    }

    // MARK: - Tallennukset

    func tallennaSkoopit(_ uudet: [SkooppiYhteenveto]) {
        lukko.lock()
        skoopitMuisti = uudet
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("skoopit.json"), data: uudet)
    }

    func tallennaSkooppiViestit(skooppi: String, viestit: SkooppiViestit) {
        lukko.lock()
        skooppiViestitMuisti[skooppi] = viestit
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("viestit/\(sanitoituNimi(skooppi)).json"), data: viestit)
    }

    func tallennaChatKeskustelut(_ uudet: [ChatKeskustelu]) {
        lukko.lock()
        chatKeskustelutMuisti = uudet
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("chat_keskustelut.json"), data: uudet)
    }

    func tallennaChatViestit(keskusteluId: String, viestit: [Viesti]) {
        lukko.lock()
        chatViestitMuisti[keskusteluId] = viestit
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("chat_viestit/\(sanitoituNimi(keskusteluId)).json"), data: viestit)
    }

    func tallennaAgentit(_ uudet: [Agentti]) {
        lukko.lock()
        agentitMuisti = uudet
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("agentit.json"), data: uudet)
    }

    func tallennaPurkuValinnat(_ valinnat: PurkuValinnat) {
        lukko.lock()
        purkuValinnatMuisti = valinnat
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("purku_valinnat.json"), data: valinnat)
    }

    func tallennaSkooppiNakyma(nimi: String, nakyma: SkooppiNakyma) {
        lukko.lock()
        skooppiNakymatMuisti[nimi] = nakyma
        lukko.unlock()
        Self.kirjoitaJSON(hakemisto.appendingPathComponent("nakymat/\(sanitoituNimi(nimi)).json"), data: nakyma)
    }

    // MARK: - Tiedostotyökalut

    private func sanitoituNimi(_ syote: String) -> String {
        syote.replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: ":", with: "_")
    }

    private static func lueJSON<T: Decodable>(_ tiedosto: URL) -> T? {
        guard FileManager.default.fileExists(atPath: tiedosto.path) else { return nil }
        guard let data = try? Data(contentsOf: tiedosto) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    private static func kirjoitaJSON<T: Encodable>(_ tiedosto: URL, data: T) {
        Task(priority: .background) {
            guard let enc = try? JSONEncoder().encode(data) else { return }
            let temp = tiedosto.appendingPathExtension("tmp")
            try? enc.write(to: temp, options: .atomic)
            _ = try? FileManager.default.replaceItemAt(tiedosto, withItemAt: temp)
        }
    }
}
