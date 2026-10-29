// MacViatView.swift - macOS Scopes Vikarekisteri- ja diagnostiikkanäkymä
import SwiftUI
import AppKit
import ScopesCore

public enum MacViatValinta: String, CaseIterable, Identifiable {
    case viat = "Vikarekisteri"
    case diagnostiikka = "Diagnostiikka & lokit"

    public var id: String { rawValue }
}

public struct MacViatView: View {
    public let client: ScopesClient

    @State private var valinta: MacViatValinta = .viat
    @State private var viat: [VikaKohta] = []
    @State private var diagnostiikka: DiagnostiikkaTila? = nil
    @State private var onLataamassa: Bool = false
    @State private var virheTeksti: String? = nil
    @State private var haku: String = ""
    @State private var tilaSuodatus: String = "kaikki" // kaikki, avoin, korjattu, tiedoksi
    @State private var valittuVika: VikaKohta? = nil

    public init(client: ScopesClient) {
        self.client = client
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Yläpalkki
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 8) {
                        Image(systemName: "ladybug.fill")
                            .foregroundStyle(Color.accentColor)
                        Text("Viat ja Diagnostiikka")
                            .font(.title3)
                            .bold()
                    }
                    Text("Scopes-äpin vikarekisteri ja taustapalvelun pyyntödiagnostiikka")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Picker("", selection: $valinta) {
                    ForEach(MacViatValinta.allCases) { v in
                        Text(v.rawValue).tag(v)
                    }
                }
                .pickerStyle(.segmented)
                .frame(width: 280)

                if onLataamassa {
                    ProgressView()
                        .controlSize(.small)
                }

                Button {
                    Task { await lataaKaikki() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .help("Päivitä tiedot (Cmd+R)")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color(NSColor.controlBackgroundColor))

            Divider()

            if let virhe = virheTeksti {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.yellow)
                    Text(virhe)
                        .font(.caption)
                    Spacer()
                    Button("Sulje") { virheTeksti = nil }
                        .buttonStyle(.borderless)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.yellow.opacity(0.1))
            }

            switch valinta {
            case .viat:
                vikarekisteriSisalto
            case .diagnostiikka:
                diagnostiikkaSisalto
            }
        }
        .task {
            await lataaKaikki()
        }
    }

    private var vikarekisteriSisalto: some View {
        HSplitView {
            // Vasen sarake: lista
            VStack(spacing: 0) {
                HStack(spacing: 8) {
                    Picker("Tila", selection: $tilaSuodatus) {
                        Text("Kaikki (\(viat.count))").tag("kaikki")
                        Text("Avoimet (\(avoimetCount))").tag("avoin")
                        Text("Korjatut (\(korjatutCount))").tag("korjattu")
                        Text("Tiedoksi (\(tiedoksiCount))").tag("tiedoksi")
                    }
                    .pickerStyle(.segmented)
                    .controlSize(.small)
                }
                .padding(8)

                List(selection: $valittuVika) {
                    ForEach(suodatetutViat) { v in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(tilaVari(v.tila))
                                .frame(width: 8, height: 8)
                                .padding(.top, 4)

                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    if !v.tunnus.isEmpty {
                                        Text(v.tunnus)
                                            .font(.headline)
                                            .foregroundStyle(Color.primary)
                                    }
                                    Spacer()
                                    Text(v.tila)
                                        .font(.caption2)
                                        .bold()
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 1)
                                        .background(Capsule().fill(tilaVari(v.tila).opacity(0.15)))
                                        .foregroundStyle(tilaVari(v.tila))
                                }

                                Text(v.selite)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(2)
                            }
                        }
                        .tag(v)
                        .padding(.vertical, 2)
                    }
                }
                .searchable(text: $haku, prompt: "Etsi vikaa tai tunnusta...")
            }
            .frame(minWidth: 280, idealWidth: 360, maxWidth: 500)

            // Oikea sarake: valitun vian tiedot
            if let v = valittuVika {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                if !v.tunnus.isEmpty {
                                    Text(v.tunnus)
                                        .font(.title2)
                                        .bold()
                                }
                                Text("Tila: \(v.tila)")
                                    .font(.subheadline)
                                    .foregroundStyle(tilaVari(v.tila))
                            }
                            Spacer()
                            Button("Kopioi tunnus") {
                                NSPasteboard.general.clearContents()
                                NSPasteboard.general.setString(v.tunnus.isEmpty ? v.id : v.tunnus, forType: .string)
                            }
                            Button("Kopioi koko kuvaus") {
                                NSPasteboard.general.clearContents()
                                NSPasteboard.general.setString(v.vika, forType: .string)
                            }
                        }

                        Divider()

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Kuvaus ja havainnot")
                                .font(.headline)
                            Text(v.vika)
                                .font(.body)
                                .textSelection(.enabled)
                                .padding(12)
                                .background(Color(NSColor.textBackgroundColor))
                                .cornerRadius(8)
                        }

                        Spacer()
                    }
                    .padding(16)
                }
                .frame(minWidth: 300)
            } else {
                ContentUnavailableView(
                    "Ei valittua vikaa",
                    systemImage: "ladybug",
                    description: Text("Valitse vika vasemmalta tarkastellaksesi sen tietoja.")
                )
                .frame(minWidth: 300)
            }
        }
    }

    private var diagnostiikkaSisalto: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Tilannekortit
                HStack(spacing: 12) {
                    mittariKortti(
                        otsikko: "Pyynnöt yhteensä",
                        arvo: "\(diagnostiikka?.pyyntoja ?? 0)",
                        kuvaus: "Käsitellyt HTTP-kutsut",
                        ikoni: "network",
                        vari: .blue
                    )
                    mittariKortti(
                        otsikko: "Virhekoodit",
                        arvo: "\(diagnostiikka?.virheita ?? 0)",
                        kuvaus: "HTTP 4xx / 5xx vastaukset",
                        ikoni: "exclamationmark.triangle.fill",
                        vari: (diagnostiikka?.virheita ?? 0) > 0 ? .orange : .green
                    )
                    mittariKortti(
                        otsikko: "Silmukan jumit",
                        arvo: "\(diagnostiikka?.silmukoita ?? 0)",
                        kuvaus: "Viive yli 500 ms",
                        ikoni: "hourglass",
                        vari: (diagnostiikka?.silmukoita ?? 0) > 0 ? .red : .green
                    )
                }

                Divider()

                // Pyyntöloki
                VStack(alignment: .leading, spacing: 8) {
                    Text("Viimeisimmät pyynnöt")
                        .font(.headline)

                    if let tapahtumat = diagnostiikka?.viimeisimmat, !tapahtumat.isEmpty {
                        Table(tapahtumat) {
                            TableColumn("Aika") { t in
                                Text(muotoileAika(t.aika))
                                    .font(.caption.monospaced())
                            }
                            .width(min: 80, ideal: 100)

                            TableColumn("Metodi") { t in
                                Text(t.metodi ?? t.tyyppi ?? "-")
                                    .font(.caption.bold())
                                    .foregroundStyle(metodiVari(t.metodi ?? t.tyyppi ?? ""))
                            }
                            .width(min: 60, ideal: 70)

                            TableColumn("Polku") { t in
                                Text(t.polku ?? (t.viive != nil ? "silmukkaviive \(t.viive!)ms" : "-"))
                                    .font(.caption.monospaced())
                                    .lineLimit(1)
                            }
                            .width(min: 160, ideal: 240)

                            TableColumn("Koodi") { t in
                                if let k = t.koodi {
                                    Text("\(k)")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 4)
                                        .padding(.vertical, 1)
                                        .background(Capsule().fill(koodiVari(k).opacity(0.2)))
                                        .foregroundStyle(koodiVari(k))
                                } else {
                                    Text("-")
                                }
                            }
                            .width(min: 50, ideal: 60)

                            TableColumn("Kesto") { t in
                                if let ms = t.ms {
                                    Text("\(ms) ms")
                                        .font(.caption.monospaced())
                                } else {
                                    Text("-")
                                }
                            }
                            .width(min: 60, ideal: 70)

                            TableColumn("Osoite") { t in
                                Text(t.osoite ?? "-")
                                    .font(.caption.monospaced())
                            }
                            .width(min: 100, ideal: 120)
                        }
                        .frame(minHeight: 320)
                    } else {
                        Text("Ei kirjattuja pyyntöjä vielä.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .padding(.vertical, 12)
                    }
                }
            }
            .padding(16)
        }
    }

    private func mittariKortti(otsikko: String, arvo: String, kuvaus: String, ikoni: String, vari: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: ikoni)
                    .foregroundStyle(vari)
                Text(otsikko)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Text(arvo)
                .font(.title)
                .bold()
                .foregroundStyle(vari)
            Text(kuvaus)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(8)
    }

    private var avoimetCount: Int {
        viat.filter { $0.tila.localizedCaseInsensitiveContains("avoin") }.count
    }

    private var korjatutCount: Int {
        viat.filter { $0.tila.localizedCaseInsensitiveContains("korjattu") || $0.tila.localizedCaseInsensitiveContains("valmis") }.count
    }

    private var tiedoksiCount: Int {
        viat.filter { $0.tila.localizedCaseInsensitiveContains("tiedoksi") }.count
    }

    private var suodatetutViat: [VikaKohta] {
        viat.filter { v in
            let matchHaku = haku.isEmpty || v.vika.localizedCaseInsensitiveContains(haku)
            guard matchHaku else { return false }
            switch tilaSuodatus {
            case "avoin": return v.tila.localizedCaseInsensitiveContains("avoin")
            case "korjattu": return v.tila.localizedCaseInsensitiveContains("korjattu") || v.tila.localizedCaseInsensitiveContains("valmis")
            case "tiedoksi": return v.tila.localizedCaseInsensitiveContains("tiedoksi")
            default: return true
            }
        }
    }

    private func tilaVari(_ tila: String) -> Color {
        let t = tila.lowercased()
        if t.contains("avoin") { return .orange }
        if t.contains("korjattu") || t.contains("valmis") { return .green }
        if t.contains("tiedoksi") { return .blue }
        return .secondary
    }

    private func metodiVari(_ m: String) -> Color {
        switch m.uppercased() {
        case "GET": return .blue
        case "POST": return .green
        case "DELETE": return .red
        default: return .secondary
        }
    }

    private func koodiVari(_ koodi: Int) -> Color {
        if koodi < 300 { return .green }
        if koodi < 400 { return .blue }
        if koodi < 500 { return .orange }
        return .red
    }

    private func muotoileAika(_ iso: String?) -> String {
        guard let iso else { return "-" }
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let d = f.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) else { return iso }
        let out = DateFormatter()
        out.dateFormat = "HH:mm:ss"
        return out.string(from: d)
    }

    private func lataaKaikki() async {
        onLataamassa = true
        defer { onLataamassa = false }
        do {
            async let v = client.viat()
            async let d = client.diagnostiikka()
            let (haetutViat, haettuDiag) = try await (v, d)
            viat = haetutViat
            diagnostiikka = haettuDiag
            virheTeksti = nil
            if valittuVika == nil, let eka = haetutViat.first {
                valittuVika = eka
            }
        } catch {
            virheTeksti = "Lataus epäonnistui: \(error.localizedDescription)"
        }
    }
}
