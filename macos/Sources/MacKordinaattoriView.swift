// MacKordinaattoriView.swift - macOS Scopes Koordinaattorinäkymä (3 agenttia) & skooppisiirtymät
import SwiftUI
import ScopesCore

public struct MacKordinaattoriView: View {
    let client: ScopesClient
    @State private var viestit: [Viesti] = []
    @State private var teksti: String = ""
    @State private var lahettaa: Bool = false
    @State private var keskusteluId: String? = nil

    public init(client: ScopesClient) {
        self.client = client
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Tiimikortti
            HStack(spacing: 16) {
                agenttiKortti(
                    rooli: "Keskusteluagentti",
                    malli: "Gemini 3.8 Flash (Low)",
                    tehtava: "Viestinvaihto ihmisen ja tiimin kanssa"
                )
                agenttiKortti(
                    rooli: "Selvitysagentti",
                    malli: "Gemini 3.8 Flash (Medium)",
                    tehtava: "Rekisterit, skooppipolut ja työkalut"
                )
                agenttiKortti(
                    rooli: "Ongelmanratkaisija",
                    malli: "Gemini 3.8 Flash (High)",
                    tehtava: "Syvällinen harkinta ja arkkitehtuuri"
                )
            }
            .padding(12)
            .background(Color(NSColor.controlBackgroundColor))

            Divider()

            // Keskustelulista
            if viestit.isEmpty {
                VStack(spacing: 12) {
                    Spacer()
                    Image(systemName: "person.3.sequence.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(Color.accentColor)
                    Text("Koordinaattoritiimi")
                        .font(.title2)
                        .bold()
                    Text("3 agenttia jatkuvasti valmiina. Keskustele tehtävistä tai kysymyksistä — tiimi selvittää ja reitittää työn oikeaan skooppiin.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 440)
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 10) {
                            ForEach(Array(viestit.enumerated()), id: \.offset) { idx, v in
                                HStack(alignment: .top) {
                                    if v.omaViesti {
                                        Spacer()
                                        Text(v.teksti)
                                            .padding(10)
                                            .background(Color.accentColor.opacity(0.15))
                                            .cornerRadius(8)
                                    } else {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Label("Koordinaattori", systemImage: "person.3.sequence")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                            Text(v.teksti)
                                                .textSelection(.enabled)
                                                .padding(10)
                                                .background(Color(NSColor.textBackgroundColor))
                                                .cornerRadius(8)

                                            if let ehdotus = poimiSkooppiEhdotus(v.teksti) {
                                                HStack {
                                                    Image(systemName: "arrow.right.circle.fill")
                                                        .foregroundStyle(Color.accentColor)
                                                    Text("Ehdotus: \(ehdotus)")
                                                        .font(.caption.bold())
                                                        .foregroundStyle(Color.accentColor)
                                                }
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 4)
                                                .background(Color.accentColor.opacity(0.1), in: Capsule())
                                            }
                                        }
                                        Spacer()
                                    }
                                }
                                .id(idx)
                            }
                        }
                        .padding(16)
                    }
                    .onChange(of: viestit.count) { _, _ in
                        if !viestit.isEmpty {
                            withAnimation { proxy.scrollTo(viestit.count - 1, anchor: .bottom) }
                        }
                    }
                }
            }

            Divider()

            // Syöttörivi
            HStack(spacing: 8) {
                TextField("Kysy koordinaattorilta mitä vain...", text: $teksti)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { laheta() }
                    .disabled(lahettaa)

                Button("Lähetä") { laheta() }
                    .disabled(teksti.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || lahettaa)
            }
            .padding(12)
            .background(Color(NSColor.windowBackgroundColor))
        }
        .navigationTitle("Koordinaattori")
    }

    private func agenttiKortti(rooli: String, malli: String, tehtava: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Circle().fill(Color.green).frame(width: 8, height: 8)
                Text(rooli).font(.headline).lineLimit(1)
            }
            Text(malli).font(.caption).bold().foregroundStyle(Color.accentColor)
            Text(tehtava).font(.caption2).foregroundStyle(.secondary).lineLimit(2)
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(NSColor.textBackgroundColor), in: RoundedRectangle(cornerRadius: 6))
    }

    private func poimiSkooppiEhdotus(_ teksti: String) -> String? {
        let pattern = #"/pura\s+([a-zA-Z0-9_\- ]+)"#
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return nil }
        let ns = teksti as NSString
        if let match = regex.firstMatch(in: teksti, range: NSRange(location: 0, length: ns.length)) {
            let skooppi = ns.substring(with: match.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
            return skooppi.isEmpty ? nil : skooppi
        }
        return nil
    }

    private func laheta() {
        let t = teksti.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return }
        teksti = ""
        viestit.append(Viesti(rooli: "kayttaja", teksti: t))
        lahettaa = true

        Task {
            defer { lahettaa = false }
            do {
                let vastaus = try await client.chatLaheta(teksti: t, agentti: "mac-agy/gemini-3.8-flash-low", keskustelu: keskusteluId)
                if let uusiId = vastaus.keskustelu {
                    keskusteluId = uusiId
                }
                if let vTeksti = vastaus.vastaus {
                    let assistentti = Viesti(rooli: "agentti", teksti: vTeksti)
                    viestit.append(assistentti)
                }
            } catch {
                viestit.append(Viesti(rooli: "agentti", teksti: "Yhteys koordinaattoritiimiin epäonnistui: \(error.localizedDescription)"))
            }
        }
    }
}
