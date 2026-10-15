// Sivupalkki (DEMO-SCOPES-SIVUPALKKI, käyttäjä 13.10.2026): chatit ja skoopit yhtenä listana uusin muutos ensin,
// yksi haku molempiin. Chatin napautus avaa keskustelun chatissa, skoopin napautus skoopin viestit. Alareunassa
// infra ja asetukset; yläreunassa suodatin All / Scope / Chat ja uusi skooppi (DEMO-SCOPES-LISTA 13.10.2026: otsikko
// ja "Uusi chat" -rivi pois; uusi chat aloitetaan chatin omasta napista). Aika on palvelun pysähdysaika: keskustelu
// nousee huipulle, kun vuoro valmistuu tai agentti kysyy. Kansioikonin väri on skoopin tila (SCOPES-LISTA-TILAVARIT,
// käyttäjä 13.10.2026): käsittely oranssi ja hehkuu, käyttäjää odottava keltainen, pakattu harmaa ja aktiivisten alle.
import SwiftUI

private enum Kohde: Identifiable {
    case chat(ChatKeskustelu)
    case skooppi(SkooppiYhteenveto)

    var id: String {
        switch self {
        case let .chat(k): return "chat-\(k.id)"
        case let .skooppi(s): return "skooppi-\(s.nimi)"
        }
    }
    var aika: Date {
        switch self {
        case let .chat(k): return isoPaiva(k.aika) ?? .distantPast
        case let .skooppi(s): return isoPaiva(s.aika) ?? .distantPast
        }
    }
    // Järjestystaso (SCOPES-LISTA-JARJESTYS, käyttäjä 14.10.2026): chatit, käsittelyssä olevat ja kyselykortti-skoopit
    // ylimpänä, valmiit (vihreä odottaa) niiden alla ja pakatut alimpana; tason sisällä uusin ensin.
    var taso: Int {
        guard case let .skooppi(s) = self else { return 0 }
        switch s.tilaNyt {
        case "odottaa": return 1
        case "pakattu": return 2
        default: return 0
        }
    }
    func kuuluu(_ s: Suodatin) -> Bool {
        switch (s, self) {
        case (.kaikki, _), (.skoopit, .skooppi), (.chatit, .chat): return true
        default: return false
        }
    }
    func osuu(_ haku: String) -> Bool {
        switch self {
        case let .chat(k): return k.otsikko.localizedCaseInsensitiveContains(haku)
        case let .skooppi(s): return s.nimi.localizedCaseInsensitiveContains(haku)
        }
    }
}

private enum Suodatin: String, CaseIterable {
    case kaikki = "All", skoopit = "Scope", chatit = "Chat"
}

// Equatable: juurinäkymä piirtyy vedon jokaisella ruudulla, mutta palkin sisältö riippuu vain auki-tilasta ja omasta
// tilastaan (SCOPES-LISTA-SUMEUS 13.10.2026: @AppStorage teki jokaisesta uudesta arvosta "muuttuneen", ja koko lista
// laskettiin uudelleen ruuduittain). Oma tila ja ympäristöoliot päivittävät palkin edelleen.
struct Sivupalkki: View, Equatable {
    let auki: Bool

    static func == (a: Sivupalkki, b: Sivupalkki) -> Bool { a.auki == b.auki }
    @EnvironmentObject private var asetukset: Asetukset
    @EnvironmentObject private var navigaatio: Navigaatio
    @State private var skoopit: [SkooppiYhteenveto] = []
    @State private var chatit: [ChatKeskustelu] = []
    @State private var agentit: [Agentti] = []
    @State private var virhe: String?
    @State private var haku = ""
    // Arkistointi (SCOPES-LISTA-POISTO 15.10.2026, käyttäjä): skooppiriviä painetaan paikallaan hetki ja vedetään vasemmalle,
    // jolloin alta paljastuu punainen X. Muualle koskettaminen palauttaa rivin; X kysyy varmistuksen ja arkistoi.
    // Ilman pitoa vaakaveto kuuluu sivupalkille (Juuri.swift SivuttaisVeto), joten tavallista swipeActionsia ei käytetä.
    @State private var avattu: String?
    @State private var veto: (id: String, x: CGFloat)?
    @State private var arkistoitava: SkooppiYhteenveto?
    @State private var arkistoidaan: String?
    // Palauttava kosketus ei saa samalla avata riviä: listan ele ja rivin painike laukeavat samasta kosketuksesta.
    @State private var suljettu = Date.distantPast
    @State private var vedetty = Date.distantPast
    @AppStorage("sivupalkinSuodatin") private var suodatin: Suodatin = .kaikki

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    private var kohteet: [Kohde] {
        let kaikki = (chatit.map(Kohde.chat) + skoopit.map(Kohde.skooppi)).filter { $0.kuuluu(suodatin) }
        let h = haku.trimmingCharacters(in: .whitespaces)
        // Aika jäsennetään kerran riviä kohden, ei joka vertailussa (SCOPES-LISTA-SUMEUS 13.10.2026: ISO-jäsennys
        // lajittelun sisällä vei pääsäikeeltä ~170 ms ruutua kohden).
        let osuvat: [Kohde] = h.isEmpty ? kaikki : kaikki.filter { $0.osuu(h) }
        let avaimet: [(kohde: Kohde, taso: Int, aika: Date)] = osuvat.map { ($0, $0.taso, $0.aika) }
        return avaimet.sorted { a, b in a.taso != b.taso ? a.taso < b.taso : a.aika > b.aika }.map(\.kohde)
    }

    var body: some View {
        NavigationStack {
            List {
                if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("sivupalkki-virhe") }
                Section {
                    ForEach(kohteet) { k in
                        if case let .skooppi(s) = k {
                            vedettava(k, s)
                                .listRowBackground(valittu(k) ? Teema.korostusTausta : nil)
                        } else {
                            Button { if !palautus() { valitse(k) } } label: { rivi(k).contentShape(Rectangle()) }
                                .buttonStyle(.plain)
                                .listRowBackground(valittu(k) ? Teema.korostusTausta : nil)
                                .accessibilityIdentifier(k.id)
                        }
                    }
                }
            }
            .listStyle(.plain)
            // Kosketus muualle palauttaa avatun rivin (myös haku, suodatin ja tyhjä alue).
            .simultaneousGesture(TapGesture().onEnded { if avattu != nil && !juuriVedetty { sulje() } }, including: avattu == nil ? .subviews : .all)
            .confirmationDialog("Arkistoidaanko skooppi \(arkistoitava?.nimi ?? "")?", isPresented: Binding(
                get: { arkistoitava != nil }, set: { if !$0 { arkistoitava = nil; sulje() } }), titleVisibility: .visible) {
                Button("Arkistoi", role: .destructive) {
                    if let s = arkistoitava { arkistoidaan = s.nimi; Task { await arkistoi(s.nimi) } }
                }
                .accessibilityIdentifier("vahvista-arkistointi")
            } message: {
                Text("Skooppi poistuu listasta ja /pura-reitittimestä. Rekisteri jää arkistoon, ja muutos committoidaan, joten sen voi palauttaa gitistä.")
            }
            // Ohut reunaviiva erottaa palkin chatista (käyttäjä 13.10.2026, kuten Claude-äpissä). Alkaa haun alta
            // listan yläreunasta: yläreunan turva-alue on navigointipalkki ja haku.
            .overlay(alignment: .trailing) {
                Rectangle().fill(Color(.systemGray3)).frame(width: 1).ignoresSafeArea(edges: .bottom)
            }
            .searchable(text: $haku, placement: .navigationBarDrawer(displayMode: .always), prompt: "Hae chateista ja skoopeista")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) { suodatinNapit }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { navigaatio.uusiSkooppiAuki = true } label: { Image(systemName: "plus") }
                        .accessibilityIdentifier("uusi")
                }
                .lasiKapseli()
            }
            // Alapalkki listan alla eikä päällä (DESIGN-UX-A U2): työkalurivin kelluvat napit peittivät alimman rivin
            // merkit ilman taustaa. Turva-alueen lisäys lyhentää listaa, joten viimeinen rivi vierii palkin yläpuolelle.
            // Palkki kasvaa tekstikoon mukana vain xxxLargeen asti ja yhdellä rivillä (DESIGN-ISOTEKSTI K4: isolla koolla
            // "Ase-tuk-set" kolmella rivillä peitti listan); suuremmat koot näkyvät pitkällä painalluksella kuten
            // järjestelmän välilehtipalkissa.
            .safeAreaInset(edge: .bottom, spacing: 0) {
                HStack {
                    Button { navigaatio.avaa(.infra) } label: { Label("Infra", systemImage: "point.3.connected.trianglepath.dotted") }
                        .accessibilityIdentifier("sivupalkki-infra").accessibilityShowsLargeContentViewer()
                    Spacer()
                    Button { navigaatio.avaa(.android) } label: { Label("Android", systemImage: "iphone") }
                        .accessibilityIdentifier("sivupalkki-android").accessibilityShowsLargeContentViewer()
                    Spacer()
                    Button { navigaatio.asetuksetAuki = true } label: { Label("Asetukset", systemImage: "gearshape") }
                        .accessibilityIdentifier("asetukset").accessibilityShowsLargeContentViewer()
                }
                .labelStyle(.titleAndIcon)
                .lineLimit(1)
                .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
                .padding(.horizontal, Teema.Vali.l)
                .padding(.vertical, Teema.Vali.m)
                .background(.bar)
                .overlay(alignment: .top) { Divider() }
            }
            .refreshable { await lataa() }
        }
        // Auki ollessaan palkki hakee tilat 5 s välein (SCOPES-LISTA-TILA-ELAVA, käyttäjä 13.10.2026: hehku puuttui,
        // kunnes palkki avattiin uudelleen). Sulkeminen vaihtaa id:n ja peruu silmukan.
        .task(id: "\(auki)" + asetukset.osoite + asetukset.avain) {
            guard auki || chatit.isEmpty && skoopit.isEmpty else { return }
            await lataa()
            while auki, !Task.isCancelled {
                try? await Task.sleep(for: .seconds(5))
                if Task.isCancelled { break }
                await lataa()
            }
        }
    }

    // Kolme rinnakkaista nappia otsikon paikalla; valittu korostettu. Navigointipalkin tapaan koko pysyy oletuksessa
    // (DESIGN-ISOTEKSTI K5: isolla koolla "Sco…", "C…"); suurempi koko näkyy pitkällä painalluksella.
    private var suodatinNapit: some View {
        HStack(spacing: Teema.Vali.s) {
            ForEach(Suodatin.allCases, id: \.self) { s in
                Button { suodatin = s } label: {
                    Text(s.rawValue).font(.body.weight(.semibold)).padding(.horizontal, Teema.Vali.l).padding(.vertical, Teema.Vali.s)
                        .foregroundStyle(suodatin == s ? Teema.korostusPaalla : Color.primary)
                        .lasiPinta(suodatin == s ? Teema.korostus : Teema.passiivinen,
                                   savy: suodatin == s ? Teema.korostus : nil, in: Capsule(), kosketus: true)
                        .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("suodatin-\(s.rawValue.lowercased())")
                .accessibilityAddTraits(suodatin == s ? .isSelected : [])
                .accessibilityShowsLargeContentViewer()
            }
        }
        .lineLimit(1)
        .dynamicTypeSize(...DynamicTypeSize.large)
    }

    private func valittu(_ k: Kohde) -> Bool {
        switch k {
        case let .chat(c): return navigaatio.nakyma == .chat && navigaatio.nykyinenChat == c.id
        case let .skooppi(s): return navigaatio.nakyma == .skooppi(s.nimi)
        }
    }

    private func valitse(_ k: Kohde) {
        switch k {
        case let .chat(c): navigaatio.avaaChat(c.id)
        case let .skooppi(s): navigaatio.avaa(.skooppi(s.nimi))
        }
    }

    private static let xLeveys: CGFloat = 72

    private func siirtyma(_ id: String) -> CGFloat {
        if arkistoidaan == id { return -Self.xLeveys }
        if let veto, veto.id == id { return veto.x }
        return avattu == id ? -Self.xLeveys : 0
    }

    private func sulje() {
        if avattu != nil { suljettu = Date() }
        withAnimation(.snappy) { avattu = nil; veto = nil }
    }

    private var juuriVedetty: Bool { Date().timeIntervalSince(vedetty) < 0.4 }

    // true = kosketus palautti avatun rivin (nyt tai juuri listan eleessä), eikä riviä avata.
    private func palautus() -> Bool {
        if juuriVedetty { return true }
        if avattu != nil { sulje(); return true }
        return Date().timeIntervalSince(suljettu) < 0.4
    }

    // Skooppirivi, jonka alta veto paljastaa punaisen X:n. Tausta on läpinäkymätön vain liikkeessä, ettei valinnan korostus peity.
    @ViewBuilder private func vedettava(_ k: Kohde, _ s: SkooppiYhteenveto) -> some View {
        let dx = siirtyma(k.id)
        ZStack(alignment: .trailing) {
            if dx < 0 {
                Button { arkistoitava = s } label: {
                    Group {
                        if arkistoidaan == s.nimi { ProgressView().tint(.white) } else { Image(systemName: "xmark").font(.title3.weight(.bold)) }
                    }
                    .foregroundStyle(.white)
                    .frame(width: Self.xLeveys)
                    .frame(maxHeight: .infinity)
                    .background(Teema.virhe, in: RoundedRectangle(cornerRadius: Teema.Vali.m))
                }
                .buttonStyle(.plain)
                .disabled(arkistoidaan != nil)
                .accessibilityLabel("Arkistoi skooppi \(s.nimi)")
                .accessibilityIdentifier("arkistoi-\(s.nimi)")
            }
            Button { if !palautus() { valitse(k) } } label: { rivi(k).contentShape(Rectangle()) }
                .buttonStyle(.plain)
                .background {
                    if dx < 0 { ZStack { Color(.systemBackground); if valittu(k) { Teema.korostusTausta } } }
                }
                .offset(x: dx)
                .accessibilityIdentifier(k.id)
                .accessibilityAction(named: "Arkistoi") { arkistoitava = s }
                .gesture(PitoVeto(
                    alkoi: { if avattu != k.id { withAnimation(.snappy) { avattu = nil } } },
                    muuttui: { x in
                        let alku: CGFloat = avattu == k.id ? -Self.xLeveys : 0
                        veto = (k.id, min(0, max(-Self.xLeveys * 1.6, alku + x)))
                    },
                    loppui: { x in
                        let alku: CGFloat = avattu == k.id ? -Self.xLeveys : 0
                        // Irrotus laukaisee rivin painikkeen ja listan kosketuksen, jotka muuten sulkisivat juuri avatun rivin.
                        vedetty = Date()
                        withAnimation(.snappy) { avattu = alku + x < -Self.xLeveys / 2 ? k.id : nil; veto = nil }
                    }))
        }
    }

    private func arkistoi(_ nimi: String) async {
        arkistoidaan = nimi
        defer { arkistoidaan = nil }
        do {
            _ = try await asiakas.arkistoi(nimi)
            withAnimation(.snappy) { skoopit.removeAll { $0.nimi == nimi }; avattu = nil }
            if navigaatio.nakyma == .skooppi(nimi) { navigaatio.avaa(.infra) }
            await lataa()
        } catch {
            virhe = error.localizedDescription
            sulje()
        }
    }

    @ViewBuilder private func rivi(_ k: Kohde) -> some View {
        switch k {
        case let .chat(c):
            HStack(alignment: .top, spacing: Teema.Vali.m) {
                Image(systemName: "bubble.left").foregroundStyle(.secondary).frame(width: 22)
                VStack(alignment: .leading, spacing: Teema.Vali.xs) {
                    Text(c.otsikko).font(.body).lineLimit(2)
                    Text([agentit.first { $0.nimi == c.agentti }?.otsikko ?? c.agentti, paiva(c.aika)].compactMap { $0 }.joined(separator: " · "))
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
        case let .skooppi(s):
            HStack(alignment: .top, spacing: Teema.Vali.m) {
                KansioIkoni(tila: s.tilaNyt).frame(width: 22)
                SkooppiRivi(skooppi: s)
            }
        }
    }

    private func paiva(_ iso: String) -> String? { isoPaiva(iso)?.formatted(date: .abbreviated, time: .shortened) }

    // Skoopit ja chatit haetaan rinnakkain; kumpikin näkyy, vaikka toinen epäonnistuu.
    private func lataa() async {
        guard asetukset.valmis else { virhe = "Anna palvelimen osoite ja avain asetuksissa."; return }
        async let s = asiakas.skoopit()
        async let c = asiakas.keskustelut()
        async let a = asiakas.agentit()
        var virheet: [String] = []
        do { skoopit = try await s } catch { virheet.append(error.localizedDescription) }
        do { chatit = try await c } catch { virheet.append(error.localizedDescription) }
        agentit = (try? await a) ?? agentit
        virhe = virheet.isEmpty ? nil : Array(Set(virheet)).joined(separator: "\n")
    }
}

// Skoopin kansioikoni tilan mukaan; käsittelyssä oranssi hehku sykkii.
private struct KansioIkoni: View {
    let tila: String
    var body: some View {
        switch tila {
        case "kasittely":
            Image(systemName: "folder.fill").foregroundStyle(Teema.kansio)
                .phaseAnimator([false, true]) { ikoni, hehku in
                    ikoni.shadow(color: Teema.kansio.opacity(hehku ? 0.95 : 0.25), radius: hehku ? 7 : 2)
                } animation: { _ in .easeInOut(duration: 0.9) }
                .accessibilityLabel("käsittelyssä")
        case "kysely":
            Image(systemName: "folder.fill").foregroundStyle(Teema.kysely).accessibilityLabel("kysely odottaa vastausta")
        case "odottaa":
            Image(systemName: "folder.fill").foregroundStyle(Teema.odottaa).accessibilityLabel("odottaa sinua")
        default:
            Image(systemName: "folder").foregroundStyle(Color(.systemGray)).accessibilityLabel("pakattu")
        }
    }
}

// Pito ja veto (SCOPES-LISTA-POISTO): UIKitin pitkä painallus tunnistuu vasta, kun sormi on ollut paikallaan hetken, ja
// tunnistuttuaan se seuraa sormea. Tunnistus estää sivupalkin vaakaveton ja listan vierityksen samalta kosketukselta, joten
// tavallinen sivuttaisveto siirtää yhä listaa (käyttäjä 15.10.2026). Värähdys kertoo, että rivin voi nyt vetää.
struct PitoVeto: UIGestureRecognizerRepresentable {
    let alkoi: () -> Void
    let muuttui: (CGFloat) -> Void
    let loppui: (CGFloat) -> Void

    // Sivupalkin vaakaveto (Juuri.swift SivuttaisVeto) ei ala, kun pito on tunnistettu: SwiftUI-käärityt tunnistimet
    // tunnistuvat yhtä aikaa, joten UIKitin oletusetusija ei riittänyt (simulaattori 15.10.2026: veto sulki palkin).
    @MainActor static var kaynnissa = false

    // Rivin Button-painallus esti pidon tunnistuksen (simulaattori 15.10.2026: X ei paljastunut), joten pito tunnistuu
    // yhtä aikaa muiden kanssa. Tunnistuttuaan se pysäyttää listan vierityksen vedon ajaksi.
    final class Alku: NSObject, UIGestureRecognizerDelegate {
        var x: CGFloat = 0
        weak var vieritys: UIScrollView?
        func gestureRecognizer(_ g: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith toinen: UIGestureRecognizer) -> Bool { true }
    }
    func makeCoordinator(converter: CoordinateSpaceConverter) -> Alku { Alku() }

    func makeUIGestureRecognizer(context: Context) -> UILongPressGestureRecognizer {
        let g = UILongPressGestureRecognizer()
        g.minimumPressDuration = 0.35
        g.delegate = context.coordinator
        return g
    }

    func handleUIGestureRecognizerAction(_ g: UILongPressGestureRecognizer, context: Context) {
        let x = g.location(in: nil).x
        let k = context.coordinator
        switch g.state {
        case .began:
            k.x = x
            Self.kaynnissa = true
            var n = g.view
            while let v = n, !(v is UIScrollView) { n = v.superview }
            k.vieritys = n as? UIScrollView
            k.vieritys?.panGestureRecognizer.isEnabled = false
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            alkoi()
        case .changed: muuttui(x - k.x)
        case .ended, .cancelled, .failed:
            Self.kaynnissa = false
            k.vieritys?.panGestureRecognizer.isEnabled = true
            k.vieritys = nil
            loppui(x - k.x)
        default: break
        }
    }
}
