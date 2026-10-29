import SwiftUI
import AppKit
import ScopesCore

public enum AGYYmparisto: String, CaseIterable, Identifiable {
    case macos = "macos"
    case oneplusLinux = "oneplus_linux"

    public var id: String { rawValue }
    public var kuvaus: String {
        switch self {
        case .macos: return "macOS AGY (paikallinen)"
        case .oneplusLinux: return "OnePlus Linux AGY (palvelin)"
        }
    }
}

public struct AGYMalliVaihtoehto: Identifiable, Hashable {
    public let id: String
    public let nimi: String

    public static let vakiot: [AGYMalliVaihtoehto] = [
        AGYMalliVaihtoehto(id: "gemini-3.8-flash-high", nimi: "Gemini 3.8 Flash (High)"),
        AGYMalliVaihtoehto(id: "gemini-3.8-flash-medium", nimi: "Gemini 3.8 Flash (Medium)"),
        AGYMalliVaihtoehto(id: "gemini-3.8-flash-low", nimi: "Gemini 3.8 Flash (Low)"),
        AGYMalliVaihtoehto(id: "claude-sonnet-4-6", nimi: "Claude Sonnet 4.6 (Thinking)"),
        AGYMalliVaihtoehto(id: "claude-opus-4-6-thinking", nimi: "Claude Opus 4.6 (Thinking)"),
        AGYMalliVaihtoehto(id: "gpt-oss-120b-medium", nimi: "GPT-OSS 120B (Medium)")
    ]
}

public struct MacSettingsView: View {
    @AppStorage("scopes_osoite") private var palvelinOsoite: String = "http://127.0.0.1:8787"
    @State private var apiAvain: String = ""
    @State private var avainTallennettu: Bool = false
    @State private var testaaTila: TestiTila = .idle
    @State private var virheTeksti: String? = nil

    // AGY-agentti- ja mallivalinnat (macOS AGY vs. OnePlus Linux AGY)
    @AppStorage("agy_purku_ymparisto") private var purkuYmparisto: String = AGYYmparisto.macos.rawValue
    @AppStorage("agy_purku_malli") private var purkuMalli: String = "gemini-3.8-flash-high"

    @AppStorage("agy_siirto_ymparisto") private var siirtoYmparisto: String = AGYYmparisto.oneplusLinux.rawValue
    @AppStorage("agy_siirto_malli") private var siirtoMalli: String = "gemini-3.8-flash-high"

    @AppStorage("agy_pakkaus_ymparisto") private var pakkausYmparisto: String = AGYYmparisto.oneplusLinux.rawValue
    @AppStorage("agy_pakkaus_malli") private var pakkausMalli: String = "gemini-3.8-flash-high"
    @State private var saatavillaOlevatMallit: [AGYMalliVaihtoehto] = AGYMalliVaihtoehto.vakiot

    private enum TestiTila: Equatable {
        case idle
        case testaamassa
        case onnistui(Int)
        case epaonnistui(String)
    }

    public init() {}

    public var body: some View {
        TabView {
            palvelinAsetukset
                .tabItem {
                    Label("Palvelin", systemImage: "server.rack")
                }
                .tag("palvelin")

            agyAsetukset
                .tabItem {
                    Label("AGY-agentit", systemImage: "sparkles")
                }
                .tag("agy")
        }
        .padding(20)
        .frame(width: 520)
        .task {
            lataaAvain()
            if MacAGYRunner.jaettu.onSaatavilla {
                if let haetut = try? await MacAGYRunner.jaettu.haeMallit(), !haetut.isEmpty {
                    saatavillaOlevatMallit = haetut
                }
            }
        }
    }

    private var palvelinAsetukset: some View {
        Form {
            Section {
                TextField("Palvelimen osoite:", text: $palvelinOsoite)
                    .textFieldStyle(.roundedBorder)
                    .help("Scopes-palvelimen HTTP-osoite (oletus: http://127.0.0.1:8787)")

                SecureField("API-avain (Keychain):", text: $apiAvain)
                    .textFieldStyle(.roundedBorder)
                    .help("Scopes-palvelimen Bearer-avain. Tallennetaan salattuna macOS Avainnippuun.")

                HStack {
                    Button("Tallenna avain avainnippuun") {
                        tallennaAvain()
                    }
                    .disabled(apiAvain.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                    if avainTallennettu {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Avain tallennettu")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    if avainTallennettu {
                        Button("Tyhjennä avain") {
                            poistaAvain()
                        }
                        .buttonStyle(.borderless)
                        .foregroundColor(.red)
                    }
                }
            } header: {
                Text("Palvelinyhteys ja todennus")
            }

            Section {
                HStack(spacing: 12) {
                    Button("Testaa yhteys") {
                        Task { await testaaYhteys() }
                    }
                    .disabled(testaaTila == .testaamassa)

                    switch testaaTila {
                    case .idle:
                        EmptyView()
                    case .testaamassa:
                        ProgressView()
                            .controlSize(.small)
                        Text("Yhdistetään palvelimeen...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    case .onnistui(let skooppeja):
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Yhteys toimii! Löydettiin \(skooppeja) skooppia.")
                            .font(.caption)
                            .foregroundColor(.green)
                    case .epaonnistui(let virhe):
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.red)
                        Text(virhe)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
            } header: {
                Text("Yhteyden varmennus")
            }

            if let virhe = virheTeksti {
                Text(virhe)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }

    private var agyAsetukset: some View {
        Form {
            Section {
                HStack {
                    Text("Paikallinen macOS AGY:")
                    Spacer()
                    if MacAGYRunner.jaettu.onSaatavilla {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text(MacAGYRunner.jaettu.agyPolku)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text("Ei löydy polusta \(MacAGYRunner.jaettu.agyPolku)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Text("Valitse mitä AGY-moottoria ja mallia käytetään Scopes-toiminnoissa (paikallinen macOS AGY vs. OnePlus Linux AGY -palvelin).")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } header: {
                Text("Antigravity (AGY) -agenttiohjaus")
            }

            Section {
                Picker("Ympäristö:", selection: $purkuYmparisto) {
                    ForEach(AGYYmparisto.allCases) { kohde in
                        Text(kohde.kuvaus).tag(kohde.rawValue)
                    }
                }

                Picker("Malli:", selection: $purkuMalli) {
                    ForEach(saatavillaOlevatMallit) { malli in
                        Text(malli.nimi).tag(malli.id)
                    }
                }
            } header: {
                HStack {
                    Image(systemName: "arrow.down.doc")
                    Text("Purkutoiminto (Purku)")
                }
            }

            Section {
                Picker("Ympäristö:", selection: $siirtoYmparisto) {
                    ForEach(AGYYmparisto.allCases) { kohde in
                        Text(kohde.kuvaus).tag(kohde.rawValue)
                    }
                }

                Picker("Malli:", selection: $siirtoMalli) {
                    ForEach(saatavillaOlevatMallit) { malli in
                        Text(malli.nimi).tag(malli.id)
                    }
                }
            } header: {
                HStack {
                    Image(systemName: "arrow.left.arrow.right")
                    Text("Siirtotoiminto (Siirto ja autovaihto)")
                }
            }

            Section {
                Picker("Ympäristö:", selection: $pakkausYmparisto) {
                    ForEach(AGYYmparisto.allCases) { kohde in
                        Text(kohde.kuvaus).tag(kohde.rawValue)
                    }
                }

                Picker("Malli:", selection: $pakkausMalli) {
                    ForEach(saatavillaOlevatMallit) { malli in
                        Text(malli.nimi).tag(malli.id)
                    }
                }
            } header: {
                HStack {
                    Image(systemName: "archivebox")
                    Text("Pakkaustoiminto (Pakkaus)")
                }
            }
        }
    }

    private func lataaAvain() {
        if let haettu = try? MacKeychain.jaettu.haeAvain(palvelu: "scopes", tili: "avain"), !haettu.isEmpty {
            apiAvain = haettu
            avainTallennettu = true
        }
    }

    private func tallennaAvain() {
        let siisti = apiAvain.trimmingCharacters(in: .whitespacesAndNewlines)
        do {
            try MacKeychain.jaettu.tallennaAvain(palvelu: "scopes", tili: "avain", avain: siisti)
            avainTallennettu = true
            virheTeksti = nil
            NotificationCenter.default.post(name: .scopesPaivitaKaikki, object: nil)
        } catch {
            virheTeksti = "Avaimen tallennus epäonnistui: \(error.localizedDescription)"
        }
    }

    private func poistaAvain() {
        do {
            try MacKeychain.jaettu.poistaAvain(palvelu: "scopes", tili: "avain")
            apiAvain = ""
            avainTallennettu = false
            virheTeksti = nil
            NotificationCenter.default.post(name: .scopesPaivitaKaikki, object: nil)
        } catch {
            virheTeksti = "Avaimen poisto epäonnistui: \(error.localizedDescription)"
        }
    }

    private func testaaYhteys() async {
        testaaTila = .testaamassa
        let siistiOsoite = palvelinOsoite.trimmingCharacters(in: .whitespacesAndNewlines)
        let siistiAvain = apiAvain.trimmingCharacters(in: .whitespacesAndNewlines)
        let client = ScopesClient(osoite: siistiOsoite, avain: siistiAvain)
        do {
            let skoopit = try await client.skoopit()
            testaaTila = .onnistui(skoopit.count)
            virheTeksti = nil
        } catch {
            testaaTila = .epaonnistui(error.localizedDescription)
        }
    }
}
