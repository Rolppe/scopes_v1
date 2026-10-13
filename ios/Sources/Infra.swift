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
                if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("infra-virhe") }
                ForEach(nakyvat(skooppiPuu(skoopit), taso: 0), id: \.solmu.id) { rivi in
                    InfraRivi(solmu: rivi.solmu, taso: rivi.taso, auki: auki.contains(rivi.solmu.id)) {
                        withAnimation(.snappy) {
                            if auki.contains(rivi.solmu.id) { auki.remove(rivi.solmu.id) } else { auki.insert(rivi.solmu.id) }
                        }
                    }
                }
            }
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
                    VStack(spacing: 2) {
                        Image(systemName: "chevron.right")
                            .font(.body.weight(.semibold))
                            .rotationEffect(.degrees(auki ? 90 : 0))
                        Text("\(lapset.count)").font(.caption2.monospacedDigit())
                    }
                    .frame(width: 36, height: 44)
                    .background(Color.accentColor.opacity(auki ? 0.22 : 0.12), in: RoundedRectangle(cornerRadius: 8))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.borderless)
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
