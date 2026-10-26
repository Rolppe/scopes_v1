import SwiftUI

// Mallinappi (MALLINAPPI 16.10.2026, SCOPES-MALLIVALINNAT 26.10.2026): skoopin viestinäkymän syöttörivin valikko,
// jolla vaihdetaan istunnon malli ja effort. Mallit tulevat keskitetysti äpin asetuksista (Asetukset.aktiivisetMallitRyhmittain).
struct MalliValikko: View {
    @EnvironmentObject private var asetukset: Asetukset

    static let effortit = ["low", "medium", "high", "xhigh", "max"]

    let malli: String?
    let effort: String?
    // Vain vapaassa istunnossa: työn aikana komento jäisi jonoon (palvelu vastaa muuten 409).
    let vapaa: Bool
    let valitse: (_ malli: String?, _ effort: String?) -> Void

    private var mallinNimi: String? {
        guard let id = malli else { return nil }
        return asetukset.kaikkiMallit.first { $0.nimi == id }?.kuvaus
            ?? Asetukset.oletusMallit.first { $0.nimi == id }?.kuvaus
            ?? id
    }

    var body: some View {
        Menu {
            let ryhmat = asetukset.aktiivisetMallitRyhmittain
            ForEach(ryhmat, id: \.0) { ryhma, mallit in
                Section(ryhma) {
                    ForEach(mallit, id: \.nimi) { m in
                        Button {
                            valitse(m.nimi, nil)
                        } label: {
                            Text(m.kuvaus + (m.nimi == malli ? " ✓" : ""))
                        }
                        .accessibilityIdentifier("malli-\(m.nimi)")
                    }
                }
            }

            Section("Effort") {
                ForEach(Self.effortit, id: \.self) { e in
                    Button { valitse(nil, e) } label: { Text(e + (e == effort ? " ✓" : "")) }
                        .accessibilityIdentifier("effort-\(e)")
                }
            }
        } label: {
            HStack(spacing: Teema.Vali.xs) {
                Text([mallinNimi, effort].compactMap { $0 }.joined(separator: " · ").nonEmpty ?? "Malli")
                    .font(.caption.weight(.medium)).lineLimit(1)
                Image(systemName: "chevron.down").font(.caption2.weight(.semibold))
            }
            .foregroundStyle(.secondary)
            .frame(height: 32)
        }
        .disabled(!vapaa)
        .accessibilityLabel("Istunnon malli ja effort")
        .accessibilityIdentifier("viestit-malli")
    }
}

private extension String {
    var nonEmpty: String? { isEmpty ? nil : self }
}
