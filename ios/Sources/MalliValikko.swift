import SwiftUI

// Mallinappi (MALLINAPPI 16.10.2026): skoopin viestinäkymän syöttörivin valikko, jolla vaihdetaan Claude-istunnon
// malli ja effort. Palvelu käyttää Clauden omia valitsimia (`s` = vain tälle istunnolle), joten vaihto ei muuta
// settings.json-oletusta. Arvo päivittyy transkriptista vasta istunnon seuraavan vastauksen jälkeen: siihen asti
// näytetään juuri valittu arvo (`malliValittu`, `effortValittu` skoopin näkymässä).
struct MalliValikko: View {
    static let mallit: [(id: String, nimi: String)] = [
        ("claude-fable-5-1", "Fable 5.1"), ("claude-opus-5-5", "Opus 5.5"),
        ("claude-sonnet-5-5", "Sonnet 5.5"), ("claude-haiku-5-5", "Haiku 5.5"),
    ]
    static let effortit = ["low", "medium", "high", "xhigh", "max"]

    let malli: String?
    let effort: String?
    // Vain vapaassa istunnossa: työn aikana komento jäisi jonoon (palvelu vastaa muuten 409).
    let vapaa: Bool
    let valitse: (_ malli: String?, _ effort: String?) -> Void

    private var mallinNimi: String? { malli.map { id in Self.mallit.first { $0.id == id }?.nimi ?? id } }

    var body: some View {
        Menu {
            Section("Malli") {
                ForEach(Self.mallit, id: \.id) { m in
                    Button { valitse(m.id, nil) } label: { Text(m.nimi + (m.id == malli ? " ✓" : "")) }
                        .accessibilityIdentifier("malli-\(m.id)")
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
