// Infra-välilehti (DEMO-SCOPES-VALILEHDET 13.10.2026): skoopit puuna (pääskooppi → alaskoopit); napautus avaa
// skoopin tiedot (repo ja rekisterit, seuraava paketti, avoimet asiat, viat, istunnot, toiminnot).
// Avausnuoli on oma painikkeensa rivin vasemmassa reunassa ja siirtymä rivin loppuosa oikean reunan nuolineen
// (DEMO-SCOPES-PARANNUKSET 13.10.2026: OutlineGroupin nuoli ja siirtymä menivät sekaisin).
import SwiftUI

struct InfraView: View {
    @EnvironmentObject private var asetukset: Asetukset
    @State private var skoopit: [SkooppiYhteenveto] = []
    @State private var virhe: String?
    @State private var auki: Set<String> = []
    @State private var polku = NavigationPath()
    /// Pääskooppien järjestys rivinvaihdoin erotettuna; uudet skoopit tulevat loppuun palvelun järjestyksessä.
    @AppStorage("infraJarjestys") private var jarjestys = ""

    var body: some View {
        NavigationStack(path: $polku) {
            List {
                if let virhe { Section { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("infra-virhe") } }
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
            skoopit = try await Asiakas(osoite: asetukset.osoite, avain: asetukset.avain).skoopit()
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
