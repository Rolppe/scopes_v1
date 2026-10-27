import SwiftUI

// Mallinappi (MALLINAPPI 16.10.2026, SCOPES-MALLIVALINNAT 26.10.2026, YKSINKERTAISTETTU-MALLIT 27.10.2026):
// Yksinkertaistettu mallivalikko: jokaiselle mallille vain yksi vaihtoehto päälistassa.
// Valitsemalla mallin avautuu ympäristö-/tarjoajavalinta sekä vain kyseisen mallin tukemat effort levelit.
struct MalliValikko: View {
    @EnvironmentObject private var asetukset: Asetukset

    static let effortit = ["low", "medium", "high", "xhigh", "max"]

    let malli: String?
    let effort: String?
    // Vain vapaassa istunnossa: työn aikana komento jäisi jonoon (palvelu vastaa muuten 409).
    let vapaa: Bool
    var kayttoraja: Kayttoraja? = nil
    var kayttorajat: KayttorajatKaikki? = nil
    let valitse: (_ malli: String?, _ effort: String?) -> Void

    struct TarjoajaKohta: Identifiable, Hashable {
        let nimi: String // "Mac AGY", "OnePlus Linux AGY", "Claude", "Nebius", "Paikalliset"
        let malliId: String
        let sallitutEffortit: [String]
        var id: String { "\(nimi):\(malliId)" }
    }

    struct KanoninenPerusmalli: Identifiable, Hashable {
        let id: String
        let nimi: String
        let tarjoajat: [TarjoajaKohta]
    }

    private var aktiivinenRaja: Kayttoraja? {
        kayttoraja ?? kayttorajat?.raja(mallille: malli)
    }

    private var naytettavaMallinNimi: String {
        guard let id = malli else { return "Malli" }
        let raaka = asetukset.kaikkiMallit.first { $0.nimi == id }?.kuvaus
            ?? Asetukset.oletusMallit.first { $0.nimi == id }?.kuvaus
            ?? id
        return siistiPerusNimi(raaka, malliId: id)
    }

    private var vari: Color {
        guard let r = aktiivinenRaja else { return .secondary }
        if r.onTayna { return .red }
        if r.onVaroitus { return .orange }
        return .secondary
    }

    private var kanonisetMallit: [KanoninenPerusmalli] {
        let lista = asetukset.aktiivisetMallit.isEmpty ? Asetukset.oletusMallit : asetukset.aktiivisetMallit
        var ryhmitelty: [String: [IstunnonMalli]] = [:]
        var jarjestys: [String] = []

        for m in lista {
            let perus = siistiPerusNimi(m.kuvaus, malliId: m.nimi)
            if ryhmitelty[perus] == nil {
                jarjestys.append(perus)
            }
            ryhmitelty[perus, default: []].append(m)
        }

        return jarjestys.compactMap { perusNimi in
            guard let mallit = ryhmitelty[perusNimi], !mallit.isEmpty else { return nil }
            var tarjoajat: [TarjoajaKohta] = []
            var nahdytTarjoajat: Set<String> = []

            for m in mallit {
                let tarjoajaNimi = tunnistaTarjoaja(m)
                if nahdytTarjoajat.contains(tarjoajaNimi) { continue }
                nahdytTarjoajat.insert(tarjoajaNimi)
                let effortit = maaritaSallitutEffortit(malliId: m.nimi, perusNimi: perusNimi, tarjoaja: tarjoajaNimi)
                tarjoajat.append(TarjoajaKohta(
                    nimi: tarjoajaNimi,
                    malliId: m.nimi,
                    sallitutEffortit: effortit
                ))
            }

            return KanoninenPerusmalli(
                id: perusNimi.lowercased().replacingOccurrences(of: " ", with: "-"),
                nimi: perusNimi,
                tarjoajat: tarjoajat
            )
        }
    }

    var body: some View {
        Menu {
            ForEach(kanonisetMallit) { pm in
                let onAktiivinen = onkoMalliAktiivinen(pm)
                Menu {
                    ForEach(pm.tarjoajat) { t in
                        let ryhmanRaja = kayttorajat?.raja(ryhmalle: t.nimi)
                        let mallinRaja = kayttorajat?.raja(ryhmalle: t.nimi, malli: t.malliId) ?? ryhmanRaja
                        let rajaTeksti = mallinRaja?.tiivisTeksti.map { " (\($0))" } ?? ""
                        Section("\(t.nimi)\(rajaTeksti)") {
                            if t.sallitutEffortit.isEmpty {
                                let akt = onkoTarjoajaAktiivinen(t, eff: nil)
                                Button {
                                    valitse(t.malliId, nil)
                                } label: {
                                    Text("\(t.nimi)\(akt ? " ✓" : "")")
                                }
                                .accessibilityIdentifier("malli-\(t.malliId)")
                            } else {
                                ForEach(t.sallitutEffortit, id: \.self) { eff in
                                    let akt = onkoTarjoajaAktiivinen(t, eff: eff)
                                    let kohdeMalli = muodostaMalliId(t.malliId, effort: eff)
                                    Button {
                                        valitse(kohdeMalli, eff)
                                    } label: {
                                        Text("\(eff.capitalized)\(akt ? " ✓" : "")")
                                    }
                                    .accessibilityIdentifier("effort-\(eff)")
                                }
                            }
                        }
                    }
                } label: {
                    HStack {
                        Text(pm.nimi + (onAktiivinen ? " ✓" : ""))
                    }
                }
                .accessibilityIdentifier("perusmalli-\(pm.id)")
            }
        } label: {
            HStack(spacing: Teema.Vali.xs) {
                if let _ = aktiivinenRaja {
                    Circle()
                        .fill(vari)
                        .frame(width: 6, height: 6)
                }
                let naytettavaKaytto = aktiivinenRaja.map { " \($0.prosenttiTeksti)" } ?? ""
                let perusTeksti = naytettavaMallinNimi + naytettavaKaytto
                let teksti = [perusTeksti, effort].compactMap { $0 }.joined(separator: " · ").nonEmpty ?? "Malli"
                Text(teksti)
                    .font(.caption.weight(.medium))
                    .lineLimit(1)
                    .foregroundStyle(vari)
                Image(systemName: "chevron.down").font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            .frame(height: 32)
        }
        .disabled(!vapaa)
        .accessibilityLabel("Istunnon malli ja effort")
        .accessibilityIdentifier("viestit-malli")
    }

    private func siistiPerusNimi(_ kuvaus: String, malliId: String) -> String {
        var n = kuvaus
            .replacingOccurrences(of: #"\s*\((High|Medium|Low|Thinking)\)"#, with: "", options: .regularExpression)
            .replacingOccurrences(of: #"\s*·.*$"#, with: "", options: .regularExpression)
            .replacingOccurrences(of: #"\s*\(edullisin\)|\s*\(vaativa\)"#, with: "", options: .regularExpression)
            .trimmingCharacters(in: .whitespaces)
        if n.isEmpty { n = malliId }
        return n
    }

    private func tunnistaTarjoaja(_ m: IstunnonMalli) -> String {
        if let r = m.ryhma, !r.isEmpty { return r }
        if m.nimi.hasPrefix("mac-agy/") { return "Mac AGY" }
        if m.nimi.hasPrefix("agy/") { return "OnePlus Linux AGY" }
        if m.nimi.hasPrefix("claude-") { return "Claude" }
        if m.nimi.hasPrefix("nebius/") { return "Nebius" }
        if m.nimi.hasPrefix("palvelin/") { return "Paikalliset" }
        return "Muu"
    }

    private func maaritaSallitutEffortit(malliId: String, perusNimi: String, tarjoaja: String) -> [String] {
        let id = malliId.lowercased()
        let n = perusNimi.lowercased()
        if id.contains("gemini") || n.contains("gemini") {
            return ["low", "medium", "high"]
        }
        if id.contains("haiku") || id.contains("fable") || n.contains("haiku") || n.contains("fable") {
            return []
        }
        if id.contains("sonnet") || id.contains("opus") || n.contains("sonnet") || n.contains("opus") {
            if tarjoaja.contains("AGY") || id.hasPrefix("mac-agy/") || id.hasPrefix("agy/") {
                return ["high"] // Thinking
            }
            return ["low", "medium", "high", "xhigh", "max"]
        }
        if id.contains("gpt-oss-120b") || n.contains("gpt-oss") {
            return ["medium"]
        }
        return []
    }

    private func muodostaMalliId(_ malliId: String, effort: String) -> String {
        if malliId.contains("gemini-3.8-flash") {
            if malliId.hasPrefix("mac-agy/") {
                return "mac-agy/gemini-3.8-flash-\(effort)"
            } else if malliId.hasPrefix("agy/") {
                return "agy/gemini-3.8-flash-\(effort)"
            }
        }
        return malliId
    }

    private func onkoMalliAktiivinen(_ pm: KanoninenPerusmalli) -> Bool {
        guard let aktiivinen = malli else { return false }
        let siivottu = siistiPerusNimi(aktiivinen, malliId: aktiivinen).lowercased()
        if pm.nimi.lowercased().contains(siivottu) || siivottu.contains(pm.nimi.lowercased()) {
            return true
        }
        return pm.tarjoajat.contains(where: { t in
            aktiivinen.contains(t.malliId) || t.malliId.contains(aktiivinen)
        })
    }

    private func onkoTarjoajaAktiivinen(_ t: TarjoajaKohta, eff: String?) -> Bool {
        guard let aktMalli = malli else { return false }
        let tarjoajaOsuu = aktMalli.hasPrefix(t.nimi.contains("Mac") ? "mac-agy/" : (t.nimi.contains("Linux") ? "agy/" : (t.nimi.contains("Claude") ? "claude-" : "")))
            || aktMalli == t.malliId
            || (aktMalli.contains("gemini") && t.malliId.contains("gemini") && aktMalli.hasPrefix("mac-") == t.malliId.hasPrefix("mac-"))
        if !tarjoajaOsuu { return false }
        if let e = eff {
            return (effort?.lowercased() == e.lowercased())
                || (aktMalli.contains("-\(e)") && effort == nil)
        }
        return true
    }
}

private extension String {
    var nonEmpty: String? { isEmpty ? nil : self }
}
