// MacInfraView.swift - macOS Scopes infra view
import SwiftUI
import ScopesCore

public struct MacInfraView: View {
    public let client: ScopesClient
    public let onValitseSkooppi: (String) -> Void

    @State private var rekisterit: [RekisteriTiedosto] = []
    @State private var linuxTila: LinuxTila? = nil
    @State private var onLataamassa: Bool = false
    @State private var virhe: String? = nil
    @State private var ilmoitus: String? = nil

    @State private var valittuRekisteri: RekisteriTiedosto? = nil
    @State private var rekisteriOsat: RekisterinOsat? = nil

    public init(client: ScopesClient, onValitseSkooppi: @escaping (String) -> Void = { _ in }) {
        self.client = client
        self.onValitseSkooppi = onValitseSkooppi
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Yläpalkki
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Infrastruktuuri")
                        .font(.title3)
                        .bold()
                    Text("Kontekstitiedostot ja palvelintilat")
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
                    Task { await lataaKaikki() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .help("Päivitä infran tiedot")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color(nsColor: .controlBackgroundColor))

            Divider()

            if let ilmoitus {
                HStack {
                    Image(systemName: "info.circle.fill")
                        .foregroundColor(.accentColor)
                    Text(ilmoitus)
                        .font(.caption)
                    Spacer()
                    Button("Sulje") { self.ilmoitus = nil }
                        .buttonStyle(.borderless)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.accentColor.opacity(0.1))
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
                VStack(alignment: .leading, spacing: 20) {
                    // 1. Linux-palvelin osio
                    linuxServerOsio

                    // 2. Rekisteritiedostot ja kontekstit
                    rekisteritOsio
                }
                .padding(16)
            }
        }
        .task {
            await lataaKaikki()
        }
        .sheet(item: $valittuRekisteri) { tiedosto in
            rekisteriNakymaSheet(tiedosto: tiedosto)
        }
    }

    private var linuxServerOsio: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Linux-palvelin", systemImage: "server.rack")
                .font(.headline)

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(linuxTila?.tila == "linux" ? Color.green : Color.orange)
                            .frame(width: 10, height: 10)
                        Text(linuxTilaSelite(linuxTila?.tila))
                            .font(.body.bold())
                    }
                    if let osoite = linuxTila?.osoite {
                        Text("Osoite: \(osoite)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    if let lm = linuxTila?.lmStudio {
                        Text("LM Studio: \(lm)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                HStack(spacing: 8) {
                    Button {
                        suoritaLinuxToiminto("kaynnista")
                    } label: {
                        Label("Käynnistä", systemImage: "power")
                    }
                    .buttonStyle(.bordered)
                    .disabled(linuxTila?.tila == "linux")

                    Button(role: .destructive) {
                        suoritaLinuxToiminto("sammuta")
                    } label: {
                        Label("Sammuta", systemImage: "poweroff")
                    }
                    .buttonStyle(.bordered)
                    .disabled(linuxTila?.tila != "linux")
                }
            }
            .padding(12)
            .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .controlBackgroundColor)))
        }
    }

    private var rekisteritOsio: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("Kontekstitiedostot ja rekisterit", systemImage: "doc.text")
                    .font(.headline)
                Spacer()
                Text("\(rekisterit.count) tiedostoa")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            VStack(spacing: 8) {
                ForEach(rekisterit) { r in
                    Button {
                        avaaRekisteri(r)
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: r.laji == "muistio" ? "note.text" : "doc.plaintext")
                                .font(.title3)
                                .foregroundColor(.secondary)

                            VStack(alignment: .leading, spacing: 3) {
                                Text(r.polku)
                                    .font(.body.weight(.medium))
                                    .foregroundColor(.primary)
                                HStack(spacing: 8) {
                                    Text("\(r.tavut) tavua")
                                    Text("≈ \(r.tokenit) tokenia")
                                    if let aste = r.aste {
                                        Text("Täyttö: \(aste)%")
                                            .foregroundColor(aste > 85 ? .orange : .secondary)
                                    }
                                }
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            }

                            Spacer()

                            if let aste = r.aste {
                                ProgressView(value: Double(aste), total: 100)
                                    .frame(width: 80)
                                    .tint(aste > 90 ? .red : (aste > 75 ? .orange : .accentColor))
                            }

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(10)
                        .background(RoundedRectangle(cornerRadius: 6).fill(Color(nsColor: .controlBackgroundColor)))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    @ViewBuilder
    private func rekisteriNakymaSheet(tiedosto: RekisteriTiedosto) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(tiedosto.polku)
                        .font(.headline)
                    Text("\(tiedosto.tavut) tavua • \(tiedosto.tokenit) tokenia")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Button("Sulje") {
                    valittuRekisteri = nil
                    rekisteriOsat = nil
                }
                .buttonStyle(.bordered)
            }

            Divider()

            if let osat = rekisteriOsat?.osat, !osat.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        ForEach(osat) { osa in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(osa.otsikko)
                                    .font(.subheadline.bold())
                                    .foregroundColor(.accentColor)
                                Text(osa.teksti)
                                    .font(.caption.monospaced())
                                    .textSelection(.enabled)
                                    .padding(8)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(RoundedRectangle(cornerRadius: 4).fill(Color(nsColor: .controlBackgroundColor)))
                            }
                        }
                    }
                }
            } else {
                Spacer()
                ProgressView("Ladataan tiedoston osia...")
                    .frame(maxWidth: .infinity)
                Spacer()
            }
        }
        .padding(20)
        .frame(minWidth: 500, minHeight: 400)
        .task {
            do {
                rekisteriOsat = try await client.rekisteri(polku: tiedosto.polku)
            } catch {
                virhe = "Tiedoston luku epäonnistui: \(error.localizedDescription)"
            }
        }
    }

    private func avaaRekisteri(_ r: RekisteriTiedosto) {
        valittuRekisteri = r
        rekisteriOsat = nil
    }

    private func lataaKaikki() async {
        onLataamassa = true
        defer { onLataamassa = false }
        do {
            async let rHaku = client.rekisterit()
            async let lHaku = client.linuxServer()
            let (r, l) = try await (rHaku, lHaku)
            rekisterit = r
            linuxTila = l
            virhe = nil
        } catch {
            virhe = "Infran lataus epäonnistui: \(error.localizedDescription)"
        }
    }

    private func suoritaLinuxToiminto(_ toiminto: String) {
        ilmoitus = "Suoritetaan komento: \(toiminto)..."
        Task {
            do {
                let v = try await client.linuxToiminto(toiminto)
                ilmoitus = "Palvelin: \(v.toiminto) käynnistetty."
                linuxTila = try await client.linuxServer()
            } catch {
                virhe = "Palvelinkomento epäonnistui: \(error.localizedDescription)"
            }
        }
    }

    private func linuxTilaSelite(_ tila: String?) -> String {
        switch tila {
        case "linux": return "Linux päällä"
        case "windows": return "Windows päällä"
        case "sammuksissa": return "Sammuksissa"
        default: return "Tila ei tiedossa"
        }
    }
}
