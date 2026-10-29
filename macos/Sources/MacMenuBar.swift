import SwiftUI
import AppKit
import ScopesCore

public struct MacMenuBar: View {
    @State private var skoopit: [SkooppiYhteenveto] = []
    @State private var onLataamassa: Bool = false

    public init() {}

    private var client: ScopesClient {
        let osoite = UserDefaults.standard.string(forKey: "scopes_osoite") ?? "http://127.0.0.1:8787"
        let avain = (try? MacKeychain.jaettu.haeAvain(palvelu: "scopes", tili: "avain")) ?? ""
        return ScopesClient(osoite: osoite, avain: avain)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Scopes — Aktiiviset istunnot")
                    .font(.headline)
                Spacer()
                if onLataamassa {
                    ProgressView()
                        .controlSize(.small)
                }
            }
            .padding(.bottom, 4)

            let aktiiviset = skoopit.filter { $0.istuntoja > 0 || $0.tilaNyt != "pakattu" }
            if aktiiviset.isEmpty {
                Text("Ei aktiivisia istuntoja")
                    .foregroundColor(.secondary)
            } else {
                ForEach(aktiiviset) { skooppi in
                    HStack {
                        Circle()
                            .fill(tilavari(skooppi.tilaNyt))
                            .frame(width: 8, height: 8)
                        Text(skooppi.nimi)
                        Spacer()
                        Text("\(skooppi.istuntoja) istuntoa")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Divider()

            Button("Päivitä tilanne") {
                Task { await paivitaSkoopit() }
            }
            .keyboardShortcut("r", modifiers: [.command])

            Button("Avaa pääikkuna") {
                NSApp.activate(ignoringOtherApps: true)
            }
            .keyboardShortcut("o", modifiers: [.command])

            Button("Asetukset...") {
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            }
            .keyboardShortcut(",", modifiers: [.command])

            Divider()

            Button("Sulje Scopes") {
                NSApplication.shared.terminate(nil)
            }
            .keyboardShortcut("q", modifiers: [.command])
        }
        .padding(8)
        .task {
            await paivitaSkoopit()
        }
    }

    private func paivitaSkoopit() async {
        onLataamassa = true
        defer { onLataamassa = false }
        if let haetut = try? await client.skoopit() {
            skoopit = haetut
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
