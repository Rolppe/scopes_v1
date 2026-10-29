// MacChatView.swift - macOS Scopes chat view
import SwiftUI
import ScopesCore
import ScopesUI

public struct MacChatView: View {
    public let client: ScopesClient

    @State private var agentit: [Agentti] = []
    @State private var valittuAgentti: String? = nil
    @State private var keskustelut: [ChatKeskustelu] = []
    @State private var valittuKeskustelu: String? = nil
    @State private var viestit: [Viesti] = []
    @State private var teksti: String = ""
    @State private var onLataamassa: Bool = false
    @State private var onLahettamassa: Bool = false
    @State private var virhe: String? = nil

    public init(client: ScopesClient) {
        self.client = client
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Yläpalkki: Agenttivalitsin ja Uusi keskustelu
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(otsikkoTeksti)
                        .font(.title3)
                        .bold()
                    Text(kuvausTeksti)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Picker("Agentti", selection: $valittuAgentti) {
                    ForEach(agentit) { a in
                        Text(a.otsikko).tag(Optional(a.nimi))
                    }
                }
                .pickerStyle(.menu)
                .frame(width: 200)

                Button {
                    aloitaUusiKeskustelu()
                } label: {
                    Label("Uusi chat", systemImage: "plus")
                }
                .buttonStyle(.bordered)
                .help("Aloita uusi keskustelu (Cmd+N)")

                Button {
                    Task { await lataaKaikki() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .help("Päivitä chat")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color(nsColor: .controlBackgroundColor))

            Divider()

            if let v = virhe {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.yellow)
                    Text(v)
                        .font(.caption)
                    Spacer()
                    Button("Sulje") { virhe = nil }
                        .buttonStyle(.borderless)
                        .font(.caption)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.yellow.opacity(0.1))
            }

            // Viestilista
            if viestit.isEmpty && !onLataamassa {
                VStack(spacing: 8) {
                    Spacer()
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 40))
                        .foregroundColor(.secondary)
                    Text("Kysy mitä tahansa")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Text("Valitse agentti yläpalkista ja kirjoita kysymyksesi alle.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 12) {
                            ForEach(viestit) { v in
                                viestiRivi(v)
                            }
                            if onLahettamassa {
                                HStack {
                                    ProgressView()
                                        .controlSize(.small)
                                    Text("Kirjoittaa vastausta...")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .padding(.horizontal, 12)
                            }
                        }
                        .padding(16)
                    }
                    .onChange(of: viestit.count) { _, _ in
                        if let viim = viestit.last {
                            withAnimation {
                                proxy.scrollTo(viim.id, anchor: .bottom)
                            }
                        }
                    }
                }
            }

            Divider()

            // Syöttörivi
            MacChatInput(teksti: $teksti, voiLahettaa: !onLahettamassa && !teksti.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) {
                lahetaViesti()
            }
        }
        .task {
            await lataaKaikki()
        }
    }

    private var otsikkoTeksti: String {
        if let valittu = valittuAgentti, let a = agentit.first(where: { $0.nimi == valittu }) {
            return a.otsikko
        }
        return "Chat"
    }

    private var kuvausTeksti: String {
        if let kId = valittuKeskustelu, let k = keskustelut.first(where: { $0.id == kId }) {
            return "Keskustelu: \(k.otsikko) • \(k.viesteja) viestiä"
        }
        return "Yleinen keskustelu"
    }

    @ViewBuilder
    private func viestiRivi(_ v: Viesti) -> some View {
        Viestikupla(viesti: v)
    }

    private func lataaKaikki() async {
        onLataamassa = true
        defer { onLataamassa = false }
        do {
            async let haetutAgentit = client.agentit()
            async let haetutKeskustelut = client.chatKeskustelut()
            let (ag, kk) = try await (haetutAgentit, haetutKeskustelut)
            agentit = ag
            keskustelut = kk
            if valittuAgentti == nil, let eka = ag.first {
                valittuAgentti = eka.nimi
            }
            virhe = nil
        } catch {
            virhe = "Chat-tietojen lataus epäonnistui: \(error.localizedDescription)"
        }
    }

    private func aloitaUusiKeskustelu() {
        valittuKeskustelu = nil
        viestit = []
        teksti = ""
    }

    private func lahetaViesti() {
        let trimmed = teksti.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        teksti = ""
        let oma = Viesti(rooli: "kayttaja", teksti: trimmed)
        viestit.append(oma)
        onLahettamassa = true

        Task {
            defer { onLahettamassa = false }
            do {
                let vastaus = try await client.chatLaheta(teksti: trimmed, agentti: valittuAgentti, keskustelu: valittuKeskustelu)
                if let uusiId = vastaus.keskustelu {
                    valittuKeskustelu = uusiId
                }
                if let vTeksti = vastaus.vastaus {
                    let assistentti = Viesti(rooli: "assistentti", teksti: vTeksti)
                    viestit.append(assistentti)
                }
                virhe = nil
            } catch {
                virhe = "Viestin lähetys epäonnistui: \(error.localizedDescription)"
            }
        }
    }
}
