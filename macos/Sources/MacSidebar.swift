// MacSidebar.swift - macOS navigation sidebar
import SwiftUI
import ScopesCore

public enum SkooppiSuodatus: String, CaseIterable, Identifiable, Sendable {
    case kaikki = "Kaikki"
    case allscope = "Allscope"
    case aktiiviset = "Aktiiviset"
    case odottaa = "Odottaa"
    case pakattu = "Pakatut"

    public var id: String { rawValue }
}

public struct MacSidebar: View {
    @Binding var valittuNakyma: MacPaanakyma
    @Binding var valittuSkooppi: String?
    var skoopit: [SkooppiYhteenveto]
    var onToiminto: (String, String) -> Void
    var onUusiSkooppi: () -> Void

    @State private var suodatus: SkooppiSuodatus = .kaikki
    @State private var haku: String = ""
    @State private var avatutSolmut: Set<String> = []

    public init(
        valittuNakyma: Binding<MacPaanakyma>,
        valittuSkooppi: Binding<String?>,
        skoopit: [SkooppiYhteenveto],
        onToiminto: @escaping (String, String) -> Void = { _, _ in },
        onUusiSkooppi: @escaping () -> Void = {}
    ) {
        self._valittuNakyma = valittuNakyma
        self._valittuSkooppi = valittuSkooppi
        self.skoopit = skoopit
        self.onToiminto = onToiminto
        self.onUusiSkooppi = onUusiSkooppi
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Päänäkymävalitsin
            Picker("Näkymä", selection: $valittuNakyma) {
                ForEach(MacPaanakyma.allCases) { n in
                    Label(n.rawValue, systemImage: n.ikoni).tag(n)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 10)
            .padding(.vertical, 8)

            Divider()

            switch valittuNakyma {
            case .kordinaattori:
                Text("Koordinaattori valittu").foregroundStyle(.secondary).frame(maxWidth: .infinity, maxHeight: .infinity)
            case .skoopit:
                skoopitSisalto
            case .chat:
                chatSisalto
            case .infra:
                infraSisalto
            case .android:
                androidSisalto
            case .localregister:
                lrSisalto
            case .viat:
                viatSisalto
            }
        }
        .navigationSplitViewColumnWidth(min: 220, ideal: 260, max: 340)
    }

    private var skoopitSisalto: some View {
        VStack(spacing: 0) {
            Picker("Suodatus", selection: $suodatus) {
                ForEach(SkooppiSuodatus.allCases) { s in
                    Text(s.rawValue).tag(s)
                }
            }
            .pickerStyle(.segmented)
            .controlSize(.small)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)

            List(selection: $valittuSkooppi) {
                Section {
                    Button {
                        valittuNakyma = .kordinaattori
                    } label: {
                        HStack(spacing: 8) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.accentColor.opacity(0.15))
                                    .frame(width: 24, height: 24)
                                Image(systemName: "person.3.sequence.fill")
                                    .font(.caption)
                                    .foregroundStyle(Color.accentColor)
                            }
                            VStack(alignment: .leading, spacing: 1) {
                                Text("Koordinaattori")
                                    .font(.headline)
                                Text("3 agenttia jatkuvasti")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 2)
                    }
                    .buttonStyle(.plain)
                }
                Section {
                    if suodatus == .allscope {
                        let rivit = nakyvatMacSolmut(suodataMacPuu(skooppiPuu(skoopit), haku: haku), syvyys: 0)
                        if rivit.isEmpty {
                            Text("Ei hakutuloksia")
                                .foregroundStyle(.secondary)
                                .font(.caption)
                        } else {
                            ForEach(rivit, id: \.solmu.id) { r in
                                macSolmuRivi(r.solmu, syvyys: r.syvyys)
                            }
                        }
                    } else {
                        ForEach(suodatetutSkoopit) { skooppi in
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(tilavari(skooppi.tilaNyt))
                                    .frame(width: 8, height: 8)
                                Text(skooppi.nimi)
                                    .font(.body)
                                    .lineLimit(1)
                                Spacer()
                                if skooppi.istuntoja > 0 {
                                    Text("\(skooppi.istuntoja)")
                                        .font(.caption2)
                                        .bold()
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Capsule().fill(Color.secondary.opacity(0.2)))
                                }
                            }
                            .tag(skooppi.nimi)
                            .contextMenu {
                                Button("Pura uuteen istuntoon") { onToiminto("pura", skooppi.nimi) }
                                Button("Pakkaa istunto") { onToiminto("pakkaa", skooppi.nimi) }
                                Divider()
                                Button("Pysäytä (Stop)", role: .destructive) { onToiminto("stop", skooppi.nimi) }
                            }
                        }
                    }
                } header: {
                    HStack {
                        Text(suodatus == .allscope ? "Hierarkia (Allscope)" : "Skoopit (\(suodatetutSkoopit.count))")
                        Spacer()
                        Button {
                            onUusiSkooppi()
                        } label: {
                            Image(systemName: "plus")
                        }
                        .buttonStyle(.borderless)
                        .help("Uusi skooppi (Cmd+N)")
                    }
                }
            }
            .searchable(text: $haku, prompt: "Etsi skooppia...")
        }
    }

    private var chatSisalto: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Chat-keskustelut")
                    .font(.headline)
                Spacer()
                Button {
                    // Chat päänäkymä hoitaa uuden keskustelun
                } label: {
                    Image(systemName: "plus")
                }
                .buttonStyle(.borderless)
                .help("Uusi chat (Cmd+N)")
            }
            .padding(.horizontal, 12)
            .padding(.top, 12)

            Text("Keskustele vapaasti Claude-, macOS AGY- ja OnePlus Linux AGY -agenttien kanssa.")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)

            Spacer()
        }
    }

    private var infraSisalto: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Infrastruktuuri")
                .font(.headline)
                .padding(.horizontal, 12)
                .padding(.top, 12)

            Text("Skoopit hierarkiapuuna, rekisterit ja kontekstitiedostot sekä Linux-palvelimen ohjaus.")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)

            Spacer()
        }
    }

    private var androidSisalto: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Android-etäohjaus")
                .font(.headline)
                .padding(.horizontal, 12)
                .padding(.top, 12)

            Text("Suora ruutukaappaus ja kosketusohjaus yhdistetylle Android-laitteelle.")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)

            Spacer()
        }
    }

    private var lrSisalto: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Localregister")
                .font(.headline)
                .padding(.horizontal, 12)
                .padding(.top, 12)

            Text("Hajautettu CRDT-rekisterisynkronointi ja tiivisteet.")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)

            Spacer()
        }
    }

    
    private var viatSisalto: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Viat ja Diagnostiikka")
                .font(.headline)
                .padding(.horizontal, 12)
                .padding(.top, 12)

            Text("Vikarekisteri, scopes-alaskooppien havainnot ja taustapalvelimen suorituskykyloki.")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)

            Spacer()
        }
    }

    private func suodataMacPuu(_ solmut: [SkooppiSolmu], haku: String) -> [SkooppiSolmu] {
        let h = haku.trimmingCharacters(in: .whitespaces)
        if h.isEmpty { return solmut }
        return solmut.compactMap { s in
            let lapset = s.lapset.map { suodataMacPuu($0, haku: h) } ?? []
            let osuu = s.id.localizedCaseInsensitiveContains(h)
            if osuu || !lapset.isEmpty {
                return SkooppiSolmu(skooppi: s.skooppi, lapset: lapset.isEmpty ? nil : lapset)
            }
            return nil
        }
    }

    private func nakyvatMacSolmut(_ solmut: [SkooppiSolmu], syvyys: Int) -> [(solmu: SkooppiSolmu, syvyys: Int)] {
        let onHaku = !haku.trimmingCharacters(in: .whitespaces).isEmpty
        return solmut.flatMap { s in
            let hasLapset = s.lapset != nil && !s.lapset!.isEmpty
            let aukiNyt = onHaku ? hasLapset : avatutSolmut.contains(s.id)
            return [(s, syvyys)] + ((hasLapset && aukiNyt) ? nakyvatMacSolmut(s.lapset!, syvyys: syvyys + 1) : [])
        }
    }

    @ViewBuilder
    private func macSolmuRivi(_ solmu: SkooppiSolmu, syvyys: Int) -> some View {
        let onLapset = solmu.lapset != nil && !(solmu.lapset!.isEmpty)
        let onHaku = !haku.trimmingCharacters(in: .whitespaces).isEmpty
        let onAvattu = onHaku ? onLapset : avatutSolmut.contains(solmu.id)

        HStack(spacing: 6) {
            if onLapset {
                Button {
                    if avatutSolmut.contains(solmu.id) { avatutSolmut.remove(solmu.id) }
                    else { avatutSolmut.insert(solmu.id) }
                } label: {
                    Image(systemName: onAvattu ? "chevron.down" : "chevron.right")
                        .font(.caption2)
                        .frame(width: 14, height: 14)
                }
                .buttonStyle(.borderless)
            } else {
                Spacer().frame(width: 14)
            }

            Circle()
                .fill(tilavari(solmu.skooppi.tilaNyt))
                .frame(width: 8, height: 8)

            Text(solmu.skooppi.nimi)
                .font(.body)
                .lineLimit(1)

            Spacer()

            if solmu.skooppi.istuntoja > 0 {
                Text("\(solmu.skooppi.istuntoja)")
                    .font(.caption2.bold())
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.secondary.opacity(0.2)))
            }
        }
        .padding(.leading, CGFloat(syvyys * 14))
        .tag(solmu.skooppi.nimi)
        .contextMenu {
            Button("Pura uuteen istuntoon") { onToiminto("pura", solmu.skooppi.nimi) }
            Button("Pakkaa istunto") { onToiminto("pakkaa", solmu.skooppi.nimi) }
            Divider()
            Button("Pysäytä (Stop)", role: .destructive) { onToiminto("stop", solmu.skooppi.nimi) }
        }
    }

    private var suodatetutSkoopit: [SkooppiYhteenveto] {
        skoopit.filter { skooppi in
            let matchHaku = haku.isEmpty || skooppi.nimi.localizedCaseInsensitiveContains(haku)
            guard matchHaku else { return false }
            switch suodatus {
            case .kaikki, .allscope: return true
            case .aktiiviset: return skooppi.istuntoja > 0 || skooppi.tilaNyt != "pakattu"
            case .odottaa: return skooppi.tilaNyt == "odottaa" || skooppi.tilaNyt == "kysely"
            case .pakattu: return skooppi.tilaNyt == "pakattu"
            }
        }
    }

    private func tilavari(_ tila: String) -> Color {
        switch tila {
        case "kasittely": return .green
        case "kysely": return .yellow
        case "odottaa": return .orange
        default: return .secondary
        }
    }
}
