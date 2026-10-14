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

    var body: some View {
        NavigationStack {
            List {
                if let virhe { Section { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("infra-virhe") } }
                // Jokainen pääskooppi on oma korttinsa, ja sen alaskoopit avautuvat saman kortin sisään (käyttäjä 14.10.2026).
                ForEach(skooppiPuu(skoopit)) { paa in
                    Section {
                        ForEach(nakyvat([paa], taso: 0), id: \.solmu.id) { rivi in
                            InfraRivi(solmu: rivi.solmu, taso: rivi.taso, auki: auki.contains(rivi.solmu.id)) {
                                withAnimation(.snappy) {
                                    if auki.contains(rivi.solmu.id) { auki.remove(rivi.solmu.id) } else { auki.insert(rivi.solmu.id) }
                                }
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .listSectionSpacing(.compact)
            .navigationTitle("Infra")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { Sivupalkkipainike() }
            .navigationDestination(for: SkooppiReitti.self) { $0.nakyma }
            .refreshable { await lataa() }
            .task(id: asetukset.osoite + asetukset.avain) { await lataa() }
        }
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
            NavigationLink(value: SkooppiReitti.tiedot(solmu.id)) {
                SkooppiRivi(skooppi: solmu.skooppi)
            }
            .accessibilityIdentifier("infra-\(solmu.id)")
        }
        .padding(.leading, CGFloat(taso) * 20)
    }
}
