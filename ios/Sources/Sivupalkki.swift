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
    case kaikki = "All", skoopit = "Scope", allscope = "Allscope", chatit = "Chat"
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
    // Rivin toiminnot (SCOPES-LISTA-POISTO 15.10.2026; SCOPES-LISTA-VIRTANAPPI 16.10.2026, käyttäjä): skooppirivin veto oikealle
    // paljastaa alta virtanapin (pura tai pakkaa) ja arkistointinapin; pitoa ei tarvita. Oikea veto on vapaa, koska sivupalkki
    // on jo auki; vasen veto kuuluu sivupalkille (Juuri.swift SivuttaisVeto), joten tavallista swipeActionsia ei käytetä.
    // Muualle koskettaminen palauttaa rivin; arkistointi ja pakkaus kysyvät varmistuksen, pura avaa mallivalinnan.
    @State private var avattu: String?
    @State private var veto: (id: String, x: CGFloat)?
    @State private var arkistoitava: SkooppiYhteenveto?
    @State private var arkistoidaan: String?
    @State private var pakattava: SkooppiYhteenveto?
    @State private var purettava: SkooppiYhteenveto?
    @State private var toimitaan: String?
    // Palauttava kosketus ei saa samalla avata riviä: listan ele ja rivin painike laukeavat samasta kosketuksesta.
    @State private var suljettu = Date.distantPast
    @State private var vedetty = Date.distantPast
    @State private var allscopeAuki: Set<String> = []
    @AppStorage("sivupalkinSuodatin") private var suodatin: Suodatin = .kaikki
    @AppStorage("sivupalkkiArkistoidut") private var arkistoidut = ""

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    private var arkistoituSet: Set<String> {
        Set(arkistoidut.split(separator: "\n").map(String.init))
    }

    private var kohteet: [Kohde] {
        let nakyvatSkoopit = skoopit.filter { s in
            if s.tilaNyt == "kasittely" || s.tilaNyt == "kysely" { return true }
            return !arkistoituSet.contains(s.nimi)
        }
        let kaikki = (chatit.map(Kohde.chat) + nakyvatSkoopit.map(Kohde.skooppi)).filter { $0.kuuluu(suodatin) }
        let h = haku.trimmingCharacters(in: .whitespaces)
        // Aika jäsennetään kerran riviä kohden, ei joka vertailussa (SCOPES-LISTA-SUMEUS 13.10.2026: ISO-jäsennys
        // lajittelun sisällä vei pääsäikeeltä ~170 ms ruutua kohden).
        let osuvat: [Kohde] = h.isEmpty ? kaikki : kaikki.filter { $0.osuu(h) }
        let avaimet: [(kohde: Kohde, taso: Int, aika: Date)] = osuvat.map { ($0, $0.taso, $0.aika) }
        return avaimet.sorted { a, b in a.taso != b.taso ? a.taso < b.taso : a.aika > b.aika }.map(\.kohde)
    }

    var body: some View {
        NavigationStack {
            ScrollViewReader { vieritin in
            List {
                if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("sivupalkki-virhe") }
                if suodatin == .allscope {
                    allscopeOsio
                } else {
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
            }
            .listStyle(.plain)
            // Palkin sulkeutuessa lista palaa alas vedettyyn asentoon (haku näkyvissä, ylin rivi ylhäällä), jotta se on
            // avattaessa valmiina (SCOPES-LISTA-ALKU 16.10.2026, käyttäjä). Sulkeutunut palkki on näkymättömissä.
            .onChange(of: auki) { _, nyt in
                if !nyt, let eka = kohteet.first { vieritin.scrollTo(eka.id, anchor: .top) }
            }
            // Kosketus muualle palauttaa avatun rivin (myös haku, suodatin ja tyhjä alue).
            .simultaneousGesture(TapGesture().onEnded { if avattu != nil && !juuriVedetty { sulje() } }, including: avattu == nil ? .subviews : .all)
            .confirmationDialog("Arkistoidaanko skooppi \(arkistoitava?.nimi ?? "") listasta?", isPresented: Binding(
                get: { arkistoitava != nil }, set: { if !$0 { arkistoitava = nil; sulje() } }), titleVisibility: .visible) {
                Button("Arkistoi", role: .destructive) {
                    if let s = arkistoitava { arkistoidaan = s.nimi; Task { await arkistoi(s.nimi) } }
                }
                .accessibilityIdentifier("vahvista-arkistointi")
            } message: {
                Text("Skooppi poistuu tästä listasta ja sen CLI-keskustelu suljetaan. Skooppi säilyy aina Infra-sivulla, josta sen voi avata uudelleen.")
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
            .confirmationDialog("Pakataanko skoopin \(pakattava?.nimi ?? "") istunto?", isPresented: Binding(
                get: { pakattava != nil }, set: { if !$0 { pakattava = nil; sulje() } }), titleVisibility: .visible) {
                Button("Pakkaa") {
                    if let s = pakattava { Task { await pakkaa(s.nimi) } }
                }
                .accessibilityIdentifier("vahvista-pakkaus")
            } message: {
                Text("Istunto kirjaa tehdyn työn ja seuraavan paketin skoopin rekisteriin ja jää auki.")
            }
            // Purku avaa mallivalinnan kuten skoopin omalla sivulla (SCOPES-PURA-MALLI, PuraValinta.swift).
            .sheet(item: $purettava, onDismiss: { sulje() }) { s in
                PuraValintaView(skooppi: s.nimi, perhe: s.nimi.split(separator: " ").first == "scopes") { v in Task { await pura(s.nimi, v) } }
                    .environmentObject(asetukset)
            }
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
                    Text(s.rawValue).font(.body.weight(.semibold)).padding(.horizontal, Teema.Vali.m).padding(.vertical, Teema.Vali.s)
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

    // Kaksi nappia rivin alla: virtanappi (pura tai pakkaa) ja arkistointi; rivi liukuu oikealle niiden leveyden verran.
    private static let nappiLeveys: CGFloat = 72
    private static let xLeveys: CGFloat = nappiLeveys * 2

    private func siirtyma(_ id: String) -> CGFloat {
        if toimitaan == id || arkistoidaan == id { return Self.xLeveys }
        if let veto, veto.id == id { return veto.x }
        return avattu == id ? Self.xLeveys : 0
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

    // Allscope (DESIGN-ORGANIZING-KARTOITUS 27.10.2026, käyttäjä): Infran skooppipuu sivupalkin omaan välilehteen.
    // Puu suodattuu haulla (osumat ja niiden vanhemmat auki), ja rivit käyttävät samaa vedettävää pohjaa kuin suora lista.
    private func suodataAllscopePuu(_ solmut: [SkooppiSolmu], haku: String) -> [SkooppiSolmu] {
        let h = haku.trimmingCharacters(in: .whitespaces)
        if h.isEmpty { return solmut }
        return solmut.compactMap { s in
            let lapset = s.lapset.map { suodataAllscopePuu($0, haku: h) } ?? []
            let osuu = s.id.localizedCaseInsensitiveContains(h)
            if osuu || !lapset.isEmpty {
                return SkooppiSolmu(skooppi: s.skooppi, lapset: lapset.isEmpty ? nil : lapset)
            }
            return nil
        }
    }

    private func nakyvatAllscope(_ solmut: [SkooppiSolmu], taso: Int) -> [(solmu: SkooppiSolmu, taso: Int)] {
        let onHaku = !haku.trimmingCharacters(in: .whitespaces).isEmpty
        return solmut.flatMap { s in
            let hasLapset = s.lapset != nil && !s.lapset!.isEmpty
            let aukiNyt = onHaku ? hasLapset : allscopeAuki.contains(s.id)
            return [(s, taso)] + (aukiNyt ? nakyvatAllscope(s.lapset ?? [], taso: taso + 1) : [])
        }
    }

    private var allscopeOsio: some View {
        Section {
            let juuret = skooppiPuu(skoopit)
            let suodatetut = suodataAllscopePuu(juuret, haku: haku)
            let rivit = nakyvatAllscope(suodatetut, taso: 0)
            if rivit.isEmpty {
                Text("Ei hakutuloksia skoopeista")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .padding(.vertical, Teema.Vali.m)
            } else {
                ForEach(rivit, id: \.solmu.id) { rivi in
                    allscopeRivi(solmu: rivi.solmu, taso: rivi.taso)
                        .listRowBackground(valittu(.skooppi(rivi.solmu.skooppi)) ? Teema.korostusTausta : nil)
                }
            }
        }
    }

    @ViewBuilder
    private func allscopeRivi(solmu: SkooppiSolmu, taso: Int) -> some View {
        let s = solmu.skooppi
        let k = Kohde.skooppi(s)
        let hasLapset = solmu.lapset != nil && !solmu.lapset!.isEmpty
        let onHaku = !haku.trimmingCharacters(in: .whitespaces).isEmpty
        let aukiNyt = onHaku ? hasLapset : allscopeAuki.contains(solmu.id)

        HStack(alignment: .top, spacing: Teema.Vali.xs) {
            if hasLapset {
                Button {
                    withAnimation(.snappy) {
                        if allscopeAuki.contains(solmu.id) {
                            allscopeAuki.remove(solmu.id)
                        } else {
                            allscopeAuki.insert(solmu.id)
                        }
                    }
                } label: {
                    VStack(spacing: 2) {
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Teema.korostus)
                            .rotationEffect(.degrees(aukiNyt ? 90 : 0))
                        Text("\(solmu.lapset!.count)")
                            .font(.caption2.monospacedDigit())
                            .foregroundStyle(.secondary)
                    }
                    .frame(width: 28, height: 38)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("allscope-avaa-\(solmu.id)")
            } else {
                Color.clear.frame(width: 28, height: 1)
            }

            vedettava(k, s)
        }
        .padding(.leading, CGFloat(taso) * 16)
    }

    // Skooppirivi, jonka alta veto oikealle paljastaa napit. Tausta on läpinäkymätön vain liikkeessä, ettei valinnan korostus peity.
    // Virtanappi: pakattu skooppi tarjoaa purun (tumma punainen, painettaessa punainen), avoin istunto pakkauksen (punainen,
    // painettaessa tumma punainen). Arkistointi poistaa skoopin listasta.
    @ViewBuilder private func vedettava(_ k: Kohde, _ s: SkooppiYhteenveto) -> some View {
        let dx = siirtyma(k.id)
        let pakattu = s.tilaNyt == "pakattu"
        let kesken = toimitaan != nil || arkistoidaan != nil
        ZStack(alignment: .leading) {
            if dx > 0 {
                HStack(spacing: 0) {
                    Button { if pakattu { purettava = s } else { pakattava = s } } label: {
                        Group {
                            if toimitaan == s.nimi { ProgressView().tint(.white) } else { Image(systemName: "power").font(.title3.weight(.bold)) }
                        }
                        .foregroundStyle(.white)
                        .frame(width: 48, height: 48)
                    }
                    .buttonStyle(VirtaNappi(kirkas: !pakattu))
                    .frame(width: Self.nappiLeveys)
                    .disabled(kesken)
                    .accessibilityLabel(pakattu ? "Pura skooppi \(s.nimi)" : "Pakkaa skoopin \(s.nimi) istunto")
                    .accessibilityIdentifier(pakattu ? "pura-\(s.nimi)" : "pakkaa-\(s.nimi)")
                    Button { arkistoitava = s } label: {
                        Group {
                            if arkistoidaan == s.nimi { ProgressView().tint(.white) } else { Image(systemName: "archivebox").font(.title3.weight(.semibold)) }
                        }
                        .foregroundStyle(.white)
                        .frame(width: 48, height: 48)
                        .background(Color(.systemGray), in: Circle())
                    }
                    .buttonStyle(.plain)
                    .frame(width: Self.nappiLeveys)
                    .disabled(kesken)
                    .accessibilityLabel("Arkistoi skooppi \(s.nimi)")
                    .accessibilityIdentifier("arkistoi-\(s.nimi)")
                }
                .frame(maxHeight: .infinity)
            }
            // Rivi täyttää leveyden, jotta napit paljastuvat listan vasemmasta reunasta eikä rivin tekstin edestä.
            Button { if !palautus() { valitse(k) } } label: { rivi(k).frame(maxWidth: .infinity, alignment: .leading).contentShape(Rectangle()) }
                .buttonStyle(.plain)
                .background {
                    if dx > 0 { ZStack { Color(.systemBackground); if valittu(k) { Teema.korostusTausta } } }
                }
                .offset(x: dx)
                .accessibilityIdentifier(k.id)
                .accessibilityAction(named: pakattu ? "Pura" : "Pakkaa") { if pakattu { purettava = s } else { pakattava = s } }
                .accessibilityAction(named: "Arkistoi") { arkistoitava = s }
                .gesture(RiviVeto(
                    auki: avattu == k.id,
                    alkoi: { if avattu != k.id { withAnimation(.snappy) { avattu = nil } } },
                    muuttui: { x in
                        let alku: CGFloat = avattu == k.id ? Self.xLeveys : 0
                        veto = (k.id, max(0, min(Self.xLeveys * 1.3, alku + x)))
                    },
                    loppui: { x in
                        let alku: CGFloat = avattu == k.id ? Self.xLeveys : 0
                        // Irrotus laukaisee rivin painikkeen ja listan kosketuksen, jotka muuten sulkisivat juuri avatun rivin.
                        vedetty = Date()
                        withAnimation(.snappy) { avattu = alku + x > Self.xLeveys / 2 ? k.id : nil; veto = nil }
                    }))
        }
    }

    private func arkistoi(_ nimi: String) async {
        arkistoidaan = nimi
        defer { arkistoidaan = nil }
        var lista = arkistoidut.split(separator: "\n").map(String.init)
        if !lista.contains(nimi) {
            lista.append(nimi)
            arkistoidut = lista.joined(separator: "\n")
        }
        withAnimation(.snappy) {
            skoopit.removeAll { $0.nimi == nimi }
            avattu = nil
        }
        if navigaatio.nakyma == .skooppi(nimi) { navigaatio.avaa(.infra) }
        sulje()
        // Pakataan mahdollinen CLI-istunto taustalla
        _ = try? await asiakas.toiminto(.pakkaa, nimi)
        await lataa()
    }

    // Pakkaus lähtee skoopin auki olevaan istuntoon; palvelu jonottaa komennon, jos istunto on varattu.
    private func pakkaa(_ nimi: String) async {
        toimitaan = nimi
        defer { toimitaan = nil }
        do {
            _ = try await asiakas.toiminto(.pakkaa, nimi)
            Lr.jaettu.laukaise(.toiminto)
            sulje()
            await lataa()
        } catch {
            virhe = error.localizedDescription
            sulje()
        }
    }

    private func pura(_ nimi: String, _ valinta: PuraValinta) async {
        toimitaan = nimi
        defer { toimitaan = nil }
        var lista = arkistoidut.split(separator: "\n").map(String.init)
        if lista.contains(nimi) {
            lista.removeAll { $0 == nimi }
            arkistoidut = lista.joined(separator: "\n")
        }
        do {
            _ = try await asiakas.toiminto(.pura, nimi, valinta: valinta)
            Lr.jaettu.laukaise(.toiminto)
            sulje()
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

// Virtanapin väri (SCOPES-LISTA-VIRTANAPPI 16.10.2026, käyttäjä): kirkas punainen tarjoaa pakkauksen, tumma punainen purun;
// painallus vaihtaa sävyn toiseksi.
private struct VirtaNappi: ButtonStyle {
    let kirkas: Bool
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background((kirkas != configuration.isPressed ? Color.red : Color(red: 0.42, green: 0.03, blue: 0.03)), in: Circle())
    }
}

// Rivin veto oikealle (SCOPES-LISTA-VIRTANAPPI): UIKitin pan-ele alkaa vasta, kun liike on selvästi vaakasuora ja oikealle
// (tai rivi on jo auki), joten pystyveto jää listan vierityksestä eikä pitoa tarvita. Sivupalkin vaakaveto (Juuri.swift
// SivuttaisVeto) odottaa tämän eleen ratkaisua ja ei ala, kun tämä on käynnissä.
struct RiviVeto: UIGestureRecognizerRepresentable {
    let auki: Bool
    let alkoi: () -> Void
    let muuttui: (CGFloat) -> Void
    let loppui: (CGFloat) -> Void

    // Sivupalkin vaakaveto ei ala, kun rivin veto on käynnissä.
    @MainActor static var kaynnissa = false

    // Pan-ele, jonka SivuttaisVeto tunnistaa luokasta ja jonka ratkaisua se odottaa.
    final class Tunnistin: UIPanGestureRecognizer {}

    final class Alku: NSObject, UIGestureRecognizerDelegate {
        var x: CGFloat = 0
        var auki = false
        weak var vieritys: UIScrollView?
        func gestureRecognizerShouldBegin(_ g: UIGestureRecognizer) -> Bool {
            guard let p = g as? UIPanGestureRecognizer else { return false }
            let v = p.velocity(in: nil)
            return abs(v.x) > 2 * abs(v.y) && (v.x > 0 || auki)
        }
        func gestureRecognizer(_ g: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith toinen: UIGestureRecognizer) -> Bool { true }
    }
    func makeCoordinator(converter: CoordinateSpaceConverter) -> Alku { Alku() }

    func makeUIGestureRecognizer(context: Context) -> Tunnistin {
        let g = Tunnistin()
        g.delegate = context.coordinator
        return g
    }

    func updateUIGestureRecognizer(_ g: Tunnistin, context: Context) { context.coordinator.auki = auki }

    func handleUIGestureRecognizerAction(_ g: Tunnistin, context: Context) {
        let x = g.translation(in: nil).x
        let k = context.coordinator
        switch g.state {
        case .began:
            Self.kaynnissa = true
            var n = g.view
            while let v = n, !(v is UIScrollView) { n = v.superview }
            k.vieritys = n as? UIScrollView
            k.vieritys?.panGestureRecognizer.isEnabled = false
            alkoi()
            muuttui(x)
        case .changed: muuttui(x)
        case .ended, .cancelled, .failed:
            Self.kaynnissa = false
            k.vieritys?.panGestureRecognizer.isEnabled = true
            k.vieritys = nil
            let loppu = x
            // Rivi jää auki vain, jos veto riittää tai nopea heitto jatkaa oikealle.
            loppui(g.state == .ended && g.velocity(in: nil).x > 600 ? max(loppu, 1000) : loppu)
            if g.state == .ended { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
        default: break
        }
    }
}
