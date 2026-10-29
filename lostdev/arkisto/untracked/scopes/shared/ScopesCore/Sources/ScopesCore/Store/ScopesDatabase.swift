import Foundation

public enum ScopesDatabaseMuutos: Sendable {
    case skoopitPaivitetty([SkooppiYhteenveto])
    case skooppiViestitPaivitetty(skooppi: String, viestit: SkooppiViestit)
    case chatKeskustelutPaivitetty([ChatKeskustelu])
    case chatViestitPaivitetty(keskusteluId: String, viestit: [Viesti])
    case agentitPaivitetty([Agentti])
    case purkuValinnatPaivitetty(PurkuValinnat)
    case skooppiNakymaPaivitetty(skooppi: String, nakyma: SkooppiNakyma)
}

public actor ScopesDatabase {
    public static let sovellusRyhma = "group.com.example.skoopit"

    public static var oletusHakemisto: URL {
        if let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: sovellusRyhma) {
            return container.appendingPathComponent("scopes_state", isDirectory: true)
        }
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        return appSupport.appendingPathComponent("com.example.skoopit/state", isDirectory: true)
    }

    private let hakemisto: URL
    private let tiedostomanageri = FileManager.default

    // Välimuisti muistissa 0 ms vasteajoille
    private var skoopitMuisti: [SkooppiYhteenveto] = []
    private var skooppiViestitMuisti: [String: SkooppiViestit] = [:]
    private var chatKeskustelutMuisti: [ChatKeskustelu] = []
    private var chatViestitMuisti: [String: [Viesti]] = [:]
    private var agentitMuisti: [Agentti] = []
    private var purkuValinnatMuisti: PurkuValinnat?
    private var skooppiNakymatMuisti: [String: SkooppiNakyma] = [:]

    private var kuuntelijat: [UUID: AsyncStream<ScopesDatabaseMuutos>.Continuation] = [:]

    public init(hakemisto: URL = ScopesDatabase.oletusHakemisto) {
        self.hakemisto = hakemisto
        try? tiedostomanageri.createDirectory(at: hakemisto, withIntermediateDirectories: true)
        try? tiedostomanageri.createDirectory(at: hakemisto.appendingPathComponent("viestit", isDirectory: true), withIntermediateDirectories: true)
        try? tiedostomanageri.createDirectory(at: hakemisto.appendingPathComponent("chat_viestit", isDirectory: true), withIntermediateDirectories: true)
        try? tiedostomanageri.createDirectory(at: hakemisto.appendingPathComponent("nakymat", isDirectory: true), withIntermediateDirectories: true)
        
        // Alusta suoraan synkronisesti tiedostoista
        let (skoopit, chatit, agentit, purku, skViestit, chViestit, nakymat) = Self.lueAlkuTiedot(hakemisto: hakemisto)
        self.skoopitMuisti = skoopit
        self.chatKeskustelutMuisti = chatit
        self.agentitMuisti = agentit
        self.purkuValinnatMuisti = purku
        self.skooppiViestitMuisti = skViestit
        self.chatViestitMuisti = chViestit
        self.skooppiNakymatMuisti = nakymat
    }

    // MARK: - Muutosten kuuntelu

    public func kuuntele() -> AsyncStream<ScopesDatabaseMuutos> {
        let id = UUID()
        return AsyncStream { continuation in
            self.kuuntelijat[id] = continuation
            continuation.onTermination = { [weak self] _ in
                Task { [weak self] in
                    await self?.poistaKuuntelija(id)
                }
            }
        }
    }

    private func poistaKuuntelija(_ id: UUID) {
        kuuntelijat.removeValue(forKey: id)
    }

    private func ilmoita(_ muutos: ScopesDatabaseMuutos) {
        for continuation in kuuntelijat.values {
            continuation.yield(muutos)
        }
    }

    // MARK: - Välittömät luvut muistista (0 ms)

    public func lueSkoopit() -> [SkooppiYhteenveto] {
        skoopitMuisti
    }

    public func lueSkooppiViestit(skooppi: String) -> SkooppiViestit? {
        skooppiViestitMuisti[skooppi]
    }

    public func lueChatKeskustelut() -> [ChatKeskustelu] {
        chatKeskustelutMuisti
    }

    public func lueChatViestit(keskusteluId: String) -> [Viesti] {
        chatViestitMuisti[keskusteluId] ?? []
    }

    public func lueAgentit() -> [Agentti] {
        agentitMuisti
    }

    public func luePurkuValinnat() -> PurkuValinnat? {
        purkuValinnatMuisti
    }

    public func lueSkooppiNakyma(skooppi: String) -> SkooppiNakyma? {
        skooppiNakymatMuisti[skooppi]
    }

    // MARK: - Päivitykset ja optimistiset tallennukset

    public func tallennaSkoopit(_ uudet: [SkooppiYhteenveto]) {
        skoopitMuisti = uudet
        kirjoitaLevylle(uudet, tiedosto: "skoopit.json")
        ilmoita(.skoopitPaivitetty(uudet))
    }

    public func tallennaSkooppiViestit(skooppi: String, viestit: SkooppiViestit) {
        skooppiViestitMuisti[skooppi] = viestit
        let polku = "viestit/\(tiedostonimi(skooppi)).json"
        kirjoitaLevylle(viestit, tiedosto: polku)
        ilmoita(.skooppiViestitPaivitetty(skooppi: skooppi, viestit: viestit))
    }

    public func lisaaSkooppiViesti(skooppi: String, viesti: Viesti) {
        let nykyinen = skooppiViestitMuisti[skooppi] ?? SkooppiViestit(nimi: skooppi, auki: true, viestit: [])
        var viestilista = nykyinen.viestit
        viestilista.append(viesti)
        let paivitetty = SkooppiViestit(nimi: skooppi, auki: nykyinen.auki, pakattu: nykyinen.pakattu, voiLahettaa: nykyinen.voiLahettaa, viestit: viestilista)
        tallennaSkooppiViestit(skooppi: skooppi, viestit: paivitetty)
    }

    public func tallennaChatKeskustelut(_ uudet: [ChatKeskustelu]) {
        chatKeskustelutMuisti = uudet
        kirjoitaLevylle(uudet, tiedosto: "chat_keskustelut.json")
        ilmoita(.chatKeskustelutPaivitetty(uudet))
    }

    public func tallennaChatViestit(keskusteluId: String, viestit: [Viesti]) {
        chatViestitMuisti[keskusteluId] = viestit
        let polku = "chat_viestit/\(tiedostonimi(keskusteluId)).json"
        kirjoitaLevylle(viestit, tiedosto: polku)
        ilmoita(.chatViestitPaivitetty(keskusteluId: keskusteluId, viestit: viestit))
    }

    public func lisaaChatViesti(keskusteluId: String, viesti: Viesti) {
        var nykyiset = chatViestitMuisti[keskusteluId] ?? []
        nykyiset.append(viesti)
        tallennaChatViestit(keskusteluId: keskusteluId, viestit: nykyiset)
    }

    public func tallennaAgentit(_ uudet: [Agentti]) {
        agentitMuisti = uudet
        kirjoitaLevylle(uudet, tiedosto: "agentit.json")
        ilmoita(.agentitPaivitetty(uudet))
    }

    public func tallennaPurkuValinnat(_ valinnat: PurkuValinnat) {
        purkuValinnatMuisti = valinnat
        kirjoitaLevylle(valinnat, tiedosto: "purku_valinnat.json")
        ilmoita(.purkuValinnatPaivitetty(valinnat))
    }

    public func tallennaSkooppiNakyma(skooppi: String, nakyma: SkooppiNakyma) {
        skooppiNakymatMuisti[skooppi] = nakyma
        let polku = "nakymat/\(tiedostonimi(skooppi)).json"
        kirjoitaLevylle(nakyma, tiedosto: polku)
        ilmoita(.skooppiNakymaPaivitetty(skooppi: skooppi, nakyma: nakyma))
    }

    // MARK: - Levylukeminen ja kirjoitus

    private static func lueAlkuTiedot(hakemisto: URL) -> (
        [SkooppiYhteenveto],
        [ChatKeskustelu],
        [Agentti],
        PurkuValinnat?,
        [String: SkooppiViestit],
        [String: [Viesti]],
        [String: SkooppiNakyma]
    ) {
        let skoopit: [SkooppiYhteenveto] = lueTiedostosta(hakemisto.appendingPathComponent("skoopit.json")) ?? []
        let chatit: [ChatKeskustelu] = lueTiedostosta(hakemisto.appendingPathComponent("chat_keskustelut.json")) ?? []
        let agentit: [Agentti] = lueTiedostosta(hakemisto.appendingPathComponent("agentit.json")) ?? []
        let purku: PurkuValinnat? = lueTiedostosta(hakemisto.appendingPathComponent("purku_valinnat.json"))

        var skViestit: [String: SkooppiViestit] = [:]
        let viestitDir = hakemisto.appendingPathComponent("viestit")
        if let nimet = try? FileManager.default.contentsOfDirectory(atPath: viestitDir.path) {
            for nimi in nimet where nimi.hasSuffix(".json") {
                if let v: SkooppiViestit = lueTiedostosta(viestitDir.appendingPathComponent(nimi)) {
                    skViestit[v.nimi] = v
                }
            }
        }

        var chViestit: [String: [Viesti]] = [:]
        let chatViestitDir = hakemisto.appendingPathComponent("chat_viestit")
        if let nimet = try? FileManager.default.contentsOfDirectory(atPath: chatViestitDir.path) {
            for nimi in nimet where nimi.hasSuffix(".json") {
                let id = String(nimi.dropLast(5))
                if let v: [Viesti] = lueTiedostosta(chatViestitDir.appendingPathComponent(nimi)) {
                    chViestit[id] = v
                }
            }
        }

        var nakymat: [String: SkooppiNakyma] = [:]
        let nakymatDir = hakemisto.appendingPathComponent("nakymat")
        if let nimet = try? FileManager.default.contentsOfDirectory(atPath: nakymatDir.path) {
            for nimi in nimet where nimi.hasSuffix(".json") {
                if let n: SkooppiNakyma = lueTiedostosta(nakymatDir.appendingPathComponent(nimi)) {
                    nakymat[n.nimi] = n
                }
            }
        }

        return (skoopit, chatit, agentit, purku, skViestit, chViestit, nakymat)
    }

    private static func lueTiedostosta<T: Decodable>(_ url: URL) -> T? {
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    private func kirjoitaLevylle<T: Encodable>(_ kohde: T, tiedosto: String) {
        let url = hakemisto.appendingPathComponent(tiedosto)
        guard let data = try? JSONEncoder().encode(kohde) else { return }
        try? data.write(to: url, options: .atomic)
    }

    private func tiedostonimi(_ tunniste: String) -> String {
        tunniste.replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: ":", with: "_")
            .replacingOccurrences(of: " ", with: "_")
    }
}
