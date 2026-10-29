import SwiftUI
import ScopesCore

public struct MalliValikko: View {
    public static let claudeMallit: [(id: String, nimi: String)] = [
        ("claude-fable-5-1", "Fable 5.1"),
        ("claude-opus-5-5", "Opus 5.5"),
        ("claude-sonnet-5-5", "Sonnet 5.5"),
        ("claude-haiku-5-5", "Haiku 5.5")
    ]

    public static let macAgyMallit: [(id: String, nimi: String)] = [
        ("mac-agy/gemini-3.8-flash-high", "Gemini 3.8 Flash (High)"),
        ("mac-agy/gemini-3.8-flash-medium", "Gemini 3.8 Flash (Medium)"),
        ("mac-agy/gemini-3.8-flash-low", "Gemini 3.8 Flash (Low)"),
        ("mac-agy/claude-sonnet-4-6", "Claude Sonnet 4.6 (Thinking)"),
        ("mac-agy/claude-opus-4-6-thinking", "Claude Opus 4.6 (Thinking)"),
        ("mac-agy/gpt-oss-120b-medium", "GPT-OSS 120B (Medium)")
    ]

    public static let oneplusAgyMallit: [(id: String, nimi: String)] = [
        ("agy/gemini-3.8-flash-high", "Gemini 3.8 Flash (High) · Linux"),
        ("agy/gemini-3.8-flash-medium", "Gemini 3.8 Flash (Medium) · Linux"),
        ("agy/gemini-3.8-flash-low", "Gemini 3.8 Flash (Low) · Linux"),
        ("agy/claude-sonnet-4-6", "Claude Sonnet 4.6 · Linux"),
        ("agy/claude-opus-4-6-thinking", "Claude Opus 4.6 (Thinking) · Linux"),
        ("agy/gpt-oss-120b-medium", "GPT-OSS 120B (Medium) · Linux")
    ]

    public static var mallit: [(id: String, nimi: String)] {
        claudeMallit + macAgyMallit + oneplusAgyMallit
    }

    public static let effortit = ["low", "medium", "high", "xhigh", "max"]

    public let malli: String?
    public let effort: String?
    public let tyyppi: String?
    public let vapaa: Bool
    public let dynaamisetMallit: [IstunnonMalli]?
    public let kayttoraja: Kayttoraja?
    public let kayttorajat: KayttorajatKaikki?
    public let onValitse: (_ malli: String?, _ effort: String?) -> Void

    public struct TarjoajaKohta: Identifiable, Hashable {
        public let nimi: String
        public let malliId: String
        public let sallitutEffortit: [String]
        public var id: String { "\(nimi):\(malliId)" }
    }

    public struct KanoninenPerusmalli: Identifiable, Hashable {
        public let id: String
        public let nimi: String
        public let tarjoajat: [TarjoajaKohta]
    }

    public init(
        malli: String?,
        effort: String?,
        tyyppi: String? = nil,
        vapaa: Bool = true,
        dynaamisetMallit: [IstunnonMalli]? = nil,
        kayttoraja: Kayttoraja? = nil,
        kayttorajat: KayttorajatKaikki? = nil,
        onValitse: @escaping (_ malli: String?, _ effort: String?) -> Void
    ) {
        self.malli = malli
        self.effort = effort
        self.tyyppi = tyyppi
        self.vapaa = vapaa
        self.dynaamisetMallit = dynaamisetMallit
        self.kayttoraja = kayttoraja
        self.kayttorajat = kayttorajat
        self.onValitse = onValitse
    }

    private var aktiivinenRaja: Kayttoraja? {
        kayttoraja ?? kayttorajat?.raja(mallille: malli)
    }

    private var vari: Color {
        guard let r = aktiivinenRaja else { return .secondary }
        if r.onTayna { return .red }
        if r.onVaroitus { return .orange }
        return .secondary
    }

    private var mallinNimi: String? {
        guard let id = malli else { return nil }
        if let d = dynaamisetMallit?.first(where: { $0.nimi == id }) { return siistiPerusNimi(d.kuvaus, malliId: id) }
        if let m = Self.mallit.first(where: { $0.id == id }) { return siistiPerusNimi(m.nimi, malliId: id) }
        return siistiPerusNimi(id, malliId: id)
    }

    private var kanonisetMallit: [KanoninenPerusmalli] {
        let lista: [IstunnonMalli] = dynaamisetMallit ?? Self.mallit.map { IstunnonMalli(nimi: $0.id, kuvaus: $0.nimi) }
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

    public var body: some View {
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
                                    onValitse(t.malliId, nil)
                                } label: {
                                    Text("\(t.nimi)\(akt ? " ✓" : "")")
                                }
                                .accessibilityIdentifier("malli-\(t.malliId)")
                            } else {
                                ForEach(t.sallitutEffortit, id: \.self) { eff in
                                    let akt = onkoTarjoajaAktiivinen(t, eff: eff)
                                    let kohdeMalli = muodostaMalliId(t.malliId, effort: eff)
                                    Button {
                                        onValitse(kohdeMalli, eff)
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
            HStack(spacing: 4) {
                if let _ = aktiivinenRaja {
                    Circle()
                        .fill(vari)
                        .frame(width: 6, height: 6)
                }
                Text(valintaTeksti)
                    .font(.caption.weight(.medium))
                    .lineLimit(1)
                    .foregroundStyle(vari)
                Image(systemName: "chevron.down")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(vari.opacity(0.3), lineWidth: 1)
            )
        }
        .disabled(!vapaa)
        .accessibilityLabel("Istunnon malli ja effort")
        .accessibilityIdentifier("viestit-malli")
    }

    private var valintaTeksti: String {
        let naytettavaKaytto = aktiivinenRaja.map { " \($0.prosenttiTeksti)" } ?? ""
        let perusNimi = mallinNimi.map { $0 + naytettavaKaytto }
        let osat = [perusNimi, effort].compactMap { $0 }.filter { !$0.isEmpty }
        return osat.isEmpty ? "Malli" : osat.joined(separator: " · ")
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
