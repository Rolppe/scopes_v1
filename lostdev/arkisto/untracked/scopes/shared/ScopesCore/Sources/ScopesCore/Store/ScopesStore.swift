import Foundation
import Combine

@MainActor
public final class ScopesStore: ObservableObject {
    public static let jaettu = ScopesStore()

    @Published public private(set) var skoopit: [SkooppiYhteenveto] = []
    @Published public private(set) var chatKeskustelut: [ChatKeskustelu] = []
    @Published public private(set) var agentit: [Agentti] = []
    @Published public private(set) var purkuValinnat: PurkuValinnat?
    @Published public private(set) var skooppiViestit: [String: SkooppiViestit] = [:]
    @Published public private(set) var chatViestit: [String: [Viesti]] = [:]
    @Published public private(set) var skooppiNakymat: [String: SkooppiNakyma] = [:]

    private let tietokanta: ScopesDatabase
    private var kuunteluTask: Task<Void, Never>?

    public init(tietokanta: ScopesDatabase = ScopesDatabase()) {
        self.tietokanta = tietokanta
        Task { [weak self] in
            await self?.alustaTilat()
        }
    }

    private func alustaTilat() async {
        skoopit = await tietokanta.lueSkoopit()
        chatKeskustelut = await tietokanta.lueChatKeskustelut()
        agentit = await tietokanta.lueAgentit()
        purkuValinnat = await tietokanta.luePurkuValinnat()

        kuunteluTask = Task { [weak self] in
            guard let self else { return }
            let virta = await self.tietokanta.kuuntele()
            for await muutos in virta {
                if Task.isCancelled { break }
                self.kasitteleMuutos(muutos)
            }
        }
    }

    private func kasitteleMuutos(_ muutos: ScopesDatabaseMuutos) {
        switch muutos {
        case let .skoopitPaivitetty(uudet):
            skoopit = uudet
        case let .skooppiViestitPaivitetty(skooppi, viestit):
            skooppiViestit[skooppi] = viestit
        case let .chatKeskustelutPaivitetty(uudet):
            chatKeskustelut = uudet
        case let .chatViestitPaivitetty(keskusteluId, viestit):
            chatViestit[keskusteluId] = viestit
        case let .agentitPaivitetty(uudet):
            agentit = uudet
        case let .purkuValinnatPaivitetty(valinnat):
            purkuValinnat = valinnat
        case let .skooppiNakymaPaivitetty(skooppi, nakyma):
            skooppiNakymat[skooppi] = nakyma
        }
    }

    // MARK: - Välittömät lukufunktiot (0 ms)

    public func viestit(skooppi: String) -> SkooppiViestit? {
        skooppiViestit[skooppi]
    }

    public func keskustelunViestit(id: String) -> [Viesti] {
        chatViestit[id] ?? []
    }

    public func nakyma(skooppi: String) -> SkooppiNakyma? {
        skooppiNakymat[skooppi]
    }

    // MARK: - Optimistiset paikalliset päivitykset

    public func lisaaSkooppiViestiOptimistisesti(skooppi: String, viesti: Viesti) {
        let nykyinen = skooppiViestit[skooppi] ?? SkooppiViestit(nimi: skooppi, auki: true, viestit: [])
        var viestit = nykyinen.viestit
        viestit.append(viesti)
        let paivitetty = SkooppiViestit(nimi: skooppi, auki: nykyinen.auki, pakattu: nykyinen.pakattu, voiLahettaa: nykyinen.voiLahettaa, viestit: viestit)
        skooppiViestit[skooppi] = paivitetty
        Task {
            await tietokanta.tallennaSkooppiViestit(skooppi: skooppi, viestit: paivitetty)
        }
    }

    public func lisaaChatViestiOptimistisesti(keskusteluId: String, viesti: Viesti) {
        var nykyiset = chatViestit[keskusteluId] ?? []
        nykyiset.append(viesti)
        chatViestit[keskusteluId] = nykyiset
        Task {
            await tietokanta.tallennaChatViestit(keskusteluId: keskusteluId, viestit: nykyiset)
        }
    }

    public func synkkaaTaustalla(client: ScopesClient) async {
        async let s = try? client.skoopit()
        if let haetut = await s {
            await tietokanta.tallennaSkoopit(haetut)
        }
    }
}
