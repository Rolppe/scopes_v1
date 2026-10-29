// MacLrView.swift - macOS Scopes Localregister view
import SwiftUI
import ScopesCore

public struct MacLrView: View {
    public let client: ScopesClient

    @State private var tiivisteet: [String: String] = [:]
    @State private var onLataamassa: Bool = false
    @State private var virhe: String? = nil
    @State private var ilmoitus: String? = nil

    public init(client: ScopesClient) {
        self.client = client
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Yläpalkki
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Localregister (LR)")
                        .font(.title3)
                        .bold()
                    Text("CRDT-rekisterisynkka ja hajautettu tilannekuva")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()

                if onLataamassa {
                    ProgressView()
                        .controlSize(.small)
                        .padding(.trailing, 4)
                }

                Button {
                    Task { await lataa() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .help("Päivitä rekisterit")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color(nsColor: .controlBackgroundColor))

            Divider()

            if let ilmoitus {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text(ilmoitus)
                        .font(.caption)
                    Spacer()
                    Button("Sulje") { self.ilmoitus = nil }
                        .buttonStyle(.borderless)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.green.opacity(0.1))
            }

            if let v = virhe {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.yellow)
                    Text(v)
                        .font(.caption)
                    Spacer()
                    Button("Sulje") { virhe = nil }
                        .buttonStyle(.borderless)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.yellow.opacity(0.1))
            }

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Yhteenvetokortti
                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("REKISTERIEN TILA")
                                .font(.caption2.bold())
                                .foregroundColor(.secondary)
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(tiivisteet.isEmpty ? Color.secondary : Color.green)
                                    .frame(width: 10, height: 10)
                                Text(tiivisteet.isEmpty ? "Ei tiivisteitä" : "CRDT synkronoitu (\(tiivisteet.count) rekisteriä)")
                                    .font(.headline)
                            }
                        }
                        Spacer()
                        Button {
                            Task {
                                ilmoitus = "Synkronointi suoritettu."
                                await lataa()
                            }
                        } label: {
                            Label("Synkronoi nyt", systemImage: "arrow.triangle.2.circlepath")
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding(14)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .controlBackgroundColor)))

                    // Rekisterikohtaiset tiivisteet
                    VStack(alignment: .leading, spacing: 10) {
                        Text("REKISTERIKOHTAISET SHA-256 TIIVISTEET")
                            .font(.caption2.bold())
                            .foregroundColor(.secondary)

                        if tiivisteet.isEmpty && !onLataamassa {
                            Text("Ei ladattuja rekisteritiivisteitä.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(12)
                        } else {
                            VStack(spacing: 6) {
                                ForEach(Array(tiivisteet.keys.sorted()), id: \.self) { avain in
                                    HStack(alignment: .center) {
                                        Image(systemName: "doc.text.fill")
                                            .foregroundColor(.accentColor)
                                        Text(avain)
                                            .font(.body.weight(.medium))
                                        Spacer()
                                        Text(verbatim: tiivisteet[avain] ?? "")
                                            .font(.caption.monospaced())
                                            .foregroundColor(.secondary)
                                            .textSelection(.enabled)
                                    }
                                    .padding(10)
                                    .background(RoundedRectangle(cornerRadius: 6).fill(Color(nsColor: .controlBackgroundColor)))
                                }
                            }
                        }
                    }
                }
                .padding(16)
            }
        }
        .task {
            await lataa()
        }
    }

    private func lataa() async {
        onLataamassa = true
        defer { onLataamassa = false }
        do {
            tiivisteet = try await client.lrTiivisteet()
            virhe = nil
        } catch {
            virhe = "Localregister-haun virhe: \(error.localizedDescription)"
        }
    }
}
