// MacPuraValintaSheet.swift - macOS purkajan ja mallin valinta
import SwiftUI
import ScopesCore

public struct MacPuraValintaSheet: View {
    public let skooppi: String
    public let client: ScopesClient
    public let onPura: (String, String) -> Void
    public let onPeru: () -> Void

    @AppStorage("agy_purku_ymparisto") private var purkuYmparisto: String = "macos"
    @AppStorage("agy_purku_malli") private var purkuMalli: String = "gemini-3.8-flash-high"
    @State private var purkuValinnat: PurkuValinnat? = nil
    @State private var kayttorajat: KayttorajatKaikki? = nil
    @State private var onLataamassa: Bool = false
    @State private var virhe: String? = nil

    public init(
        skooppi: String,
        client: ScopesClient,
        onPura: @escaping (String, String) -> Void,
        onPeru: @escaping () -> Void
    ) {
        self.skooppi = skooppi
        self.client = client
        self.onPura = onPura
        self.onPeru = onPeru
    }

    private var valittuRaja: Kayttoraja? {
        if purkuYmparisto == "macos" {
            let on3p = purkuMalli.contains("claude") || purkuMalli.contains("gpt") || purkuMalli.contains("oss")
            return on3p ? (kayttorajat?.macAgy?.kolmasOsapuoli ?? kayttorajat?.macAgy?.gemini) : (kayttorajat?.macAgy?.gemini ?? kayttorajat?.macAgy?.kolmasOsapuoli)
        } else if purkuYmparisto == "oneplus_linux" {
            let on3p = purkuMalli.contains("claude") || purkuMalli.contains("gpt") || purkuMalli.contains("oss")
            return on3p ? (kayttorajat?.oneplusAgy?.kolmasOsapuoli ?? kayttorajat?.oneplusAgy?.gemini) : (kayttorajat?.oneplusAgy?.gemini ?? kayttorajat?.oneplusAgy?.kolmasOsapuoli)
        } else {
            return kayttorajat?.claude
        }
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Pura uuteen istuntoon")
                        .font(.headline)
                    Text("Skooppi: \(skooppi)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Image(systemName: "arrow.counterclockwise.circle.fill")
                    .font(.title)
                    .foregroundColor(.accentColor)
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("PURKUYMPÄRISTÖ")
                    .font(.caption2.bold())
                    .foregroundColor(.secondary)

                Picker("Ympäristö", selection: $purkuYmparisto) {
                    let macRaja = kayttorajat?.macAgy?.gemini?.tiivisTeksti.map { " (\($0))" } ?? ""
                    let opRaja = kayttorajat?.oneplusAgy?.gemini?.tiivisTeksti.map { " (\($0))" } ?? ""
                    let claudeRaja = kayttorajat?.claude?.tiivisTeksti.map { " (\($0))" } ?? ""

                    Text("Paikallinen macOS AGY\(macRaja)").tag("macos")
                    Text("OnePlus Linux AGY (Palvelin)\(opRaja)").tag("oneplus_linux")
                    Text("Claude CLI (Palvelin)\(claudeRaja)").tag("claude")
                }
                .pickerStyle(.radioGroup)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("PURKAJAMALLI")
                    .font(.caption2.bold())
                    .foregroundColor(.secondary)

                Picker("Malli", selection: $purkuMalli) {
                    let gRaja = (purkuYmparisto == "macos" ? kayttorajat?.macAgy?.gemini : kayttorajat?.oneplusAgy?.gemini)?.tiivisTeksti.map { " · \($0)" } ?? ""
                    let cRaja = kayttorajat?.claude?.tiivisTeksti.map { " · \($0)" } ?? ""
                    let mRaja = (purkuYmparisto == "macos" ? kayttorajat?.macAgy?.kolmasOsapuoli : kayttorajat?.oneplusAgy?.kolmasOsapuoli)?.tiivisTeksti.map { " · \($0)" } ?? ""

                    Section("Gemini" + (purkuYmparisto == "macos" ? (kayttorajat?.macAgy?.gemini?.tiivisTeksti.map { " (\($0))" } ?? "") : (kayttorajat?.oneplusAgy?.gemini?.tiivisTeksti.map { " (\($0))" } ?? ""))) {
                        Text("Gemini 3.8 Flash (High)\(gRaja)").tag("gemini-3.8-flash-high")
                        Text("Gemini 3.8 Flash (Medium)\(gRaja)").tag("gemini-3.8-flash-medium")
                        Text("Gemini 3.8 Flash (Low)\(gRaja)").tag("gemini-3.8-flash-low")
                    }
                    Section("Claude" + (kayttorajat?.claude?.tiivisTeksti.map { " (\($0))" } ?? "")) {
                        Text("Claude Sonnet 4.6 (Thinking)\(cRaja)").tag("claude-sonnet-4-6")
                        Text("Claude Opus 4.6 (Thinking)\(cRaja)").tag("claude-opus-4-6-thinking")
                    }
                    Section("Muut") {
                        Text("GPT-OSS 120B (Medium)\(mRaja)").tag("gpt-oss-120b-medium")
                    }
                }
                .pickerStyle(.menu)
            }

            if let r = valittuRaja, r.suurinKaytto >= 85 {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(r.onTayna ? .red : .orange)
                        .font(.body)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(r.onTayna ? "Kiintiö täynnä: \(r.otsikko ?? "valittu malli")" : "Kiintiö lähes täynnä (\(r.prosenttiTeksti))")
                            .font(.caption.bold())
                            .foregroundColor(r.onTayna ? .red : .orange)
                        Text(r.onTayna
                             ? "Valitun mallin käyttöraja on 100 % täynnä. Suositus: valitse toinen ympäristö tai malli."
                             : "Käyttöaste lähestyy maksimia (\(r.tiivisTeksti ?? r.prosenttiTeksti)).")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }
                .padding(10)
                .background((r.onTayna ? Color.red : Color.orange).opacity(0.12))
                .cornerRadius(8)
                .accessibilityIdentifier("mac-pura-kayttoraja-varoitus")
            } else if let r = valittuRaja, let tiivis = r.tiivisTeksti {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                    Text("Kiintiö saatavilla: \(tiivis)")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .padding(.horizontal, 4)
            }

            if let v = virhe {
                Text(v)
                    .font(.caption)
                    .foregroundColor(.red)
            }

            Text("Uusi istunto alustaa skoopin tilanteen rekisteristä valitulla purkajalla.")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.top, 4)

            HStack {
                Spacer()
                Button("Peruuta") {
                    onPeru()
                }
                .keyboardShortcut(.cancelAction)

                Button("Pura istunto") {
                    onPura(purkuYmparisto, purkuMalli)
                }
                .buttonStyle(.borderedProminent)
                .keyboardShortcut(.defaultAction)
            }
            .padding(.top, 8)
        }
        .padding(20)
        .frame(width: 440)
        .task {
            onLataamassa = true
            defer { onLataamassa = false }
            async let vReq = client.purkuValinnat()
            async let rReq = client.kayttorajatKaikki()
            do {
                purkuValinnat = try await vReq
            } catch {
                // Taustahaun epäonnistuminen ei estä oletusvalintoja
            }
            do {
                kayttorajat = try await rReq
            } catch {
                // Taustahaun epäonnistuminen ei estä käyttöä
            }
        }
    }
}
