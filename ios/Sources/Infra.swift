// Infra-välilehti (DEMO-SCOPES-VALILEHDET 13.10.2026): skoopit puuna (pääskooppi → alaskoopit); napautus avaa
// skoopin tiedot (repo ja rekisterit, seuraava paketti, avoimet asiat, viat, istunnot, toiminnot).
// Avausnuoli on oma painikkeensa rivin vasemmassa reunassa ja siirtymä rivin loppuosa oikean reunan nuolineen
// (DEMO-SCOPES-PARANNUKSET 13.10.2026: OutlineGroupin nuoli ja siirtymä menivät sekaisin).
import SwiftUI

struct InfraView: View {
    @EnvironmentObject private var asetukset: Asetukset
    @State private var skoopit: [SkooppiYhteenveto] = []
    // Kontekstitiedostot katon täyttöasteineen (SCOPES-INFRA-REKISTERIT); nil = vanha palvelu tai lataus epäonnistui.
    @State private var tiedostot: [RekisteriTiedosto]?
    @State private var virhe: String?
    // palvelimen tila (SCOPES-LINUX-NAPIT); nil = vanha palvelu tai lataus epäonnistui, jolloin osio piilotetaan.
    @State private var linux: LinuxTila?
    @State private var auki: Set<String> = []
    @State private var polku = NavigationPath()
    /// Pääskooppien järjestys rivinvaihdoin erotettuna; uudet skoopit tulevat loppuun palvelun järjestyksessä.
    @AppStorage("infraJarjestys") private var jarjestys = ""

    var body: some View {
        NavigationStack(path: $polku) {
            List {
                if let virhe { Section { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("infra-virhe") } }
                if let tiedostot {
                    Section {
                        NavigationLink { RekisteritView(alku: tiedostot) } label: { RekisteritYhteenveto(tiedostot: tiedostot) }
                            .accessibilityIdentifier("infra-rekisterit")
                    }
                }
                Section {
                    NavigationLink { LrView() } label: { LrYhteenveto() }.accessibilityIdentifier("infra-lr")
                }
                if linux != nil { LinuxServerOsio(tila: $linux) }
                // Jokainen pääskooppi on oma korttinsa, ja sen alaskoopit avautuvat saman kortin sisään (käyttäjä 14.10.2026).
                // Kortti on yksi listarivi, jotta pitkä painallus irrottaa sen ja .onMove siirtää sen toiseen kohtaan
                // (SCOPES-INFRA-JARJESTYS 14.10.2026; Sectionia ei voi siirtää). Nosto vaatii, ettei sivuttaisveto
                // pidätä listan pitkää painallusta (Juuri.swift SivuttaisVeto).
                Section {
                    ForEach(jarjestetty(skooppiPuu(skoopit))) { paa in
                        VStack(spacing: 0) {
                            ForEach(Array(nakyvat([paa], taso: 0).enumerated()), id: \.element.solmu.id) { i, rivi in
                                if i > 0 { Divider().padding(.leading, CGFloat(rivi.taso) * 20 + 44) }
                                InfraRivi(solmu: rivi.solmu, taso: rivi.taso, auki: auki.contains(rivi.solmu.id)) {
                                    withAnimation(.snappy) {
                                        if auki.contains(rivi.solmu.id) { auki.remove(rivi.solmu.id) } else { auki.insert(rivi.solmu.id) }
                                    }
                                } avaa: {
                                    polku.append(SkooppiReitti.tiedot(rivi.solmu.id))
                                }
                            }
                        }
                    }
                    .onMove(perform: siirra)
                }
            }
            .listStyle(.insetGrouped)
            .listRowSpacing(Teema.Vali.l)
            .navigationTitle("Infra")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { Sivupalkkipainike() }
            .navigationDestination(for: SkooppiReitti.self) { $0.nakyma }
            .refreshable { await lataa() }
            .task(id: asetukset.osoite + asetukset.avain) { await lataa() }
        }
    }

    private func jarjestetty(_ juuret: [SkooppiSolmu]) -> [SkooppiSolmu] {
        let tallennettu = jarjestys.split(separator: "\n").map(String.init)
        func paikka(_ s: SkooppiSolmu) -> Int { tallennettu.firstIndex(of: s.id) ?? tallennettu.count }
        return juuret.enumerated()
            .sorted { (paikka($0.element), $0.offset) < (paikka($1.element), $1.offset) }
            .map(\.element)
    }

    private func siirra(_ mista: IndexSet, _ mihin: Int) {
        var tunnukset = jarjestetty(skooppiPuu(skoopit)).map(\.id)
        tunnukset.move(fromOffsets: mista, toOffset: mihin)
        jarjestys = tunnukset.joined(separator: "\n")
    }

    // Puu riveiksi: avatun solmun lapset sen alle yhtä tasoa syvemmälle.
    private func nakyvat(_ solmut: [SkooppiSolmu], taso: Int) -> [(solmu: SkooppiSolmu, taso: Int)] {
        solmut.flatMap { s in [(s, taso)] + (auki.contains(s.id) ? nakyvat(s.lapset ?? [], taso: taso + 1) : []) }
    }

    private func lataa() async {
        guard asetukset.valmis else { virhe = "Anna palvelimen osoite ja avain asetuksissa."; return }
        do {
            let asiakas = Asiakas(osoite: asetukset.osoite, avain: asetukset.avain)
            async let t = try? asiakas.rekisterit()
            async let l = try? asiakas.linuxServer()
            skoopit = try await asiakas.skoopit()
            tiedostot = await t
            linux = await l
            virhe = nil
        } catch {
            virhe = error.localizedDescription
        }
    }
}

struct InfraRivi: View {
    let solmu: SkooppiSolmu
    let taso: Int
    let auki: Bool
    let vaihda: () -> Void
    let avaa: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            if let lapset = solmu.lapset {
                Button(action: vaihda) {
                    // Pelkkä kääntyvä nuoli ilman taustaa kuten DisclosureGroup: lista on sisältökerros, jossa HIG ei
                    // käytä Liquid Glassia (DESIGN-LASIPINNAT-LAITE 14.10.2026), joten nappi on sama lasin kanssa ja ilman.
                    VStack(spacing: 2) {
                        Image(systemName: "chevron.right")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(Teema.korostus)
                            .rotationEffect(.degrees(auki ? 90 : 0))
                        Text("\(lapset.count)").font(.caption2.monospacedDigit()).foregroundStyle(.secondary)
                    }
                    .frame(width: 36, height: 44)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.borderless)
                // Nappi on kiinteän kokoinen (36 × 44), joten sen sisältö ei kasva yli (DESIGN-ISOTEKSTI K7).
                .dynamicTypeSize(...DynamicTypeSize.xLarge)
                .accessibilityShowsLargeContentViewer()
                .accessibilityLabel(auki ? "Sulje alaskoopit" : "Avaa alaskoopit")
                .accessibilityIdentifier("infra-avaa-\(solmu.id)")
            } else {
                Color.clear.frame(width: 36, height: 1)
            }
            // Napautus eikä NavigationLink tai Button: korttirivillä on useita siirtymiä, List avaisi linkin koko riviltä,
            // ja Button avasi skoopin, kun pitkä painallus päättyi (SCOPES-INFRA-JARJESTYS simulaattorissa).
            HStack {
                SkooppiRivi(skooppi: solmu.skooppi)
                Spacer(minLength: Teema.Vali.s)
                Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(.tertiary)
            }
            .contentShape(Rectangle())
            .onTapGesture(perform: avaa)
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isButton)
            .accessibilityAction { avaa() }
            .accessibilityIdentifier("infra-\(solmu.id)")
        }
        .padding(.leading, CGFloat(taso) * 20)
        .padding(.vertical, taso > 0 ? Teema.Vali.s : 0)
    }
}

// Rekisterit-rivin tiivistelmä: montako kontekstitiedostoa on katon yli tai lähellä sitä ja suurin täyttöaste.
struct RekisteritYhteenveto: View {
    let tiedostot: [RekisteriTiedosto]
    var body: some View {
        let asteet = tiedostot.compactMap(\.aste)
        let yli = asteet.filter { $0 > 100 }.count
        let lahella = asteet.filter { (90...100).contains($0) }.count
        VStack(alignment: .leading, spacing: Teema.Vali.xs) {
            Text("Rekisterit").font(Teema.Teksti.nimi)
            Text([yli > 0 ? "\(yli) yli katon" : nil, lahella > 0 ? "\(lahella) yli 90 %" : nil, yli + lahella == 0 ? "kaikki alle 90 % katosta" : nil]
                .compactMap { $0 }.joined(separator: " · "))
                .font(.caption).foregroundStyle(yli > 0 ? Teema.virhe : lahella > 0 ? Teema.varoitus : .secondary)
        }
    }
}

enum RekisteriJarjestys: String, CaseIterable {
    case aste, koko, nimi
    var nimi: String {
        switch self {
        case .aste: "Katon täyttöaste"
        case .koko: "Koko"
        case .nimi: "Nimi"
        }
    }
}

// Kaikkien skooppien kontekstitiedostot yhtenä listana (SCOPES-INFRA-REKISTERIT 14.10.2026, käyttäjä: ylikasvaneet
// rekisterit löytyvät nopeammin). Oletus on katon täyttöaste suurimmasta alkaen; tiedosto ilman kattoa tulee
// kattollisten jälkeen koon mukaan. Napautus avaa tiedoston osat otsikoittain.
struct RekisteritView: View {
    @EnvironmentObject private var asetukset: Asetukset
    let alku: [RekisteriTiedosto]
    @State private var tiedostot: [RekisteriTiedosto]?
    @State private var virhe: String?
    @AppStorage("rekisteriJarjestys") private var jarjestys = RekisteriJarjestys.aste.rawValue

    private var jarjestetyt: [RekisteriTiedosto] {
        let t = tiedostot ?? alku
        switch RekisteriJarjestys(rawValue: jarjestys) ?? .aste {
        case .aste: return t.sorted { ($0.aste ?? -1, $0.tokenit) > ($1.aste ?? -1, $1.tokenit) }
        case .koko: return t.sorted { $0.tokenit > $1.tokenit }
        case .nimi: return t.sorted { $0.polku.localizedStandardCompare($1.polku) == .orderedAscending }
        }
    }

    var body: some View {
        List {
            if let virhe { Text(virhe).foregroundStyle(.red) }
            Section {
                ForEach(jarjestetyt) { t in
                    NavigationLink { RekisterinOsatView(tiedosto: t) } label: { RekisteriRivi(tiedosto: t) }
                        .accessibilityIdentifier("rekisteri-\(t.polku)")
                }
            } footer: {
                Text("Katon prosentti on sama mitta kuin pakkauksen rekisteritarkistuksessa (tavut ilman pakollisia lukuja; raja 40 k tai kirjattu lähtötaso). ≈ = tokenit arvioitu merkkimäärästä.")
            }
        }
        .navigationTitle("Rekisterit")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            JarjestysValikko(valinta: $jarjestys, vaihtoehdot: RekisteriJarjestys.allCases.map { ($0.rawValue, $0.nimi) })
                .accessibilityIdentifier("rekisterit-jarjestys")
        }
        .refreshable { await lataa() }
    }

    private func lataa() async {
        do {
            tiedostot = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).rekisterit()
            virhe = nil
        } catch { virhe = error.localizedDescription }
    }
}

struct RekisteriRivi: View {
    let tiedosto: RekisteriTiedosto
    var body: some View {
        let t = tiedosto
        let vari = (t.aste ?? 0) > 100 ? Teema.virhe : (t.aste ?? 0) >= 90 ? Teema.varoitus : Teema.korostus
        VStack(alignment: .leading, spacing: Teema.Vali.xs) {
            HStack(alignment: .firstTextBaseline, spacing: Teema.Vali.s) {
                Text(t.polku).font(Teema.Teksti.koodi).lineLimit(2)
                Spacer(minLength: Teema.Vali.s)
                if let aste = t.aste {
                    Text("\(aste) %").monospacedDigit().foregroundStyle(aste >= 90 ? vari : .secondary)
                } else {
                    Text("≈ \(tokenit(t.tokenit))").monospacedDigit().foregroundStyle(.secondary)
                }
            }
            Text(([kontekstiLaji(t.laji)] + (t.raja.map { ["\(t.tavut / 1000) k / \($0 / 1000) k t"] } ?? [])
                  + ["≈ \(tokenit(t.tokenit))", t.skoopit.count > 3 ? "\(t.skoopit.count) skooppia" : t.skoopit.joined(separator: ", ")])
                .joined(separator: " · "))
                .font(.caption).foregroundStyle(.secondary).lineLimit(2)
            if let aste = t.aste {
                GeometryReader { g in
                    Capsule().fill(vari.opacity(0.2))
                        .overlay(alignment: .leading) { Capsule().fill(vari).frame(width: g.size.width * CGFloat(min(aste, 100)) / 100) }
                }
                .frame(height: 4)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

// Yhden kontekstitiedoston osat otsikoittain; järjestys sama valinta kuin skoopin kontekstinäkymässä.
struct RekisterinOsatView: View {
    @EnvironmentObject private var asetukset: Asetukset
    let tiedosto: RekisteriTiedosto
    @State private var osat: [KontekstiOsa]?
    @State private var virhe: String?
    @AppStorage("kontekstiKoonMukaan") private var koonMukaan = false

    var body: some View {
        List {
            if let virhe { Text(virhe).foregroundStyle(.red) }
            if let osat {
                let rivit = koonMukaan ? osat.sorted { $0.tokenit > $1.tokenit } : osat
                Section {
                    OsuusPalkki(osat: rivit.map(\.tokenit))
                    ForEach(Array(rivit.enumerated()), id: \.offset) { n, o in
                        NavigationLink { KontekstiTeksti(otsikko: o.otsikko, teksti: o.teksti) } label: {
                            OsuusRivi(nimi: o.otsikko, maara: o.tokenit, kaikki: tiedosto.tokenit, vari: osuusVari(n))
                        }
                    }
                } header: {
                    Text(kattoRivi(tiedosto.polku, tiedosto.tavut, tiedosto.raja))
                }
            } else if virhe == nil {
                ProgressView()
            }
        }
        .navigationTitle((tiedosto.polku as NSString).lastPathComponent)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            JarjestysValikko(valinta: $koonMukaan, vaihtoehdot: [(false, "Tiedoston järjestys"), (true, "Koko")])
                .accessibilityIdentifier("rekisteri-osat-jarjestys")
        }
        .task {
            do {
                osat = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).rekisterinOsat(tiedosto.polku).osat
                virhe = nil
            } catch { virhe = error.localizedDescription }
        }
    }
}

// palvelimen käynnistys ja sammutus (SCOPES-LINUX-NAPIT 15.10.2026). Käynnistys herättää PC:n (WoL) ja vaihtaa Windowsin
// Linuxiin; sammutus vain, kun Linux on päällä. Molemmat vahvistetaan, ja vahvistus kertoo, mitä PC:lle tapahtuu.
// Toiminnon jälkeen tila tulee vastauksesta (ping vastaa vielä hetken sammutuksen jälkeen); vetäminen alas lukee sen uudelleen.
struct LinuxServerOsio: View {
    @EnvironmentObject private var asetukset: Asetukset
    @Binding var tila: LinuxTila?
    @State private var vahvista: LinuxToiminto?
    @State private var kaynnissa: LinuxToiminto?
    @State private var viesti: String?
    @State private var virhe: String?

    private var paalla: Bool { tila?.tila == "linux" }

    var body: some View {
        Section("palvelin") {
            LabeledContent("Tila", value: nimi(tila?.tila))
                .accessibilityIdentifier("linux-tila")
            Button { vahvista = .kaynnista } label: { Label("Käynnistä", systemImage: "power") }
                .disabled(kaynnissa != nil || paalla)
                .accessibilityIdentifier("linux-kaynnista")
            Button(role: .destructive) { vahvista = .sammuta } label: { Label("Sammuta", systemImage: "poweroff") }
                .disabled(kaynnissa != nil || !paalla)
                .accessibilityIdentifier("linux-sammuta")
            if let k = kaynnissa { ProgressView(k == .kaynnista ? "Käynnistetään… (enintään 2 min)" : "Sammutetaan…") }
            if let viesti { Text(viesti).font(.footnote).foregroundStyle(.secondary).accessibilityIdentifier("linux-viesti") }
            if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("linux-virhe") }
        }
        .confirmationDialog(vahvista.map { vahvistus($0).kysymys } ?? "",
                            isPresented: Binding(get: { vahvista != nil }, set: { if !$0 { vahvista = nil } }),
                            titleVisibility: .visible, presenting: vahvista) { t in
            Button(vahvistus(t).nappi, role: t == .sammuta ? .destructive : nil) { Task { await aja(t) } }
                .accessibilityIdentifier("linux-vahvista")
        } message: { t in
            Text(vahvistus(t).seuraus)
        }
    }

    private func nimi(_ tila: String?) -> String {
        switch tila {
        case "linux": "Linux päällä"
        case "windows": "Windows päällä"
        case "sammuksissa": "Sammuksissa"
        case "vaihtaa": "Vaihtaa Linuxiin…"
        case "heratetty": "Herätetty"
        case "sammuu": "Sammuu…"
        default: "Ei tiedossa"
        }
    }

    private func vahvistus(_ t: LinuxToiminto) -> (kysymys: String, seuraus: String, nappi: String) {
        switch t {
        case .kaynnista: ("Käynnistetäänkö palvelin?",
                          tila?.tila == "windows" ? "PC:ssä on Windows päällä: se käynnistyy uudelleen Linuxiin (noin 45 s)."
                                                  : "PC herätetään verkon yli. Jos se nousee Windowsiin, se vaihdetaan Linuxiin.",
                          "Käynnistä")
        case .sammuta: ("Sammutetaanko palvelin?",
                        "PC sammuu. LM Studion paikalliset mallit ja muut palvelimen palvelut ovat poissa, kunnes se käynnistetään.",
                        "Sammuta")
        }
    }

    private func aja(_ t: LinuxToiminto) async {
        kaynnissa = t
        viesti = nil
        virhe = nil
        do {
            let v = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).linuxServer(t)
            tila = LinuxTila(tila: v.tila, osoite: tila?.osoite)
            viesti = v.kuiva.map { "\(v.viesti) (kokeilu, ei ajettu: \($0))" } ?? v.viesti
        } catch {
            virhe = error.localizedDescription
        }
        kaynnissa = nil
    }
}
