import SwiftUI
import ScopesCore

public struct MacInspectorView: View {
    public let skooppi: String
    public let yhteenveto: SkooppiYhteenveto?
    public let client: ScopesClient
    public let onToiminto: (String, String) -> Void

    @State private var tiedot: SkooppiTiedot? = nil
    @State private var rekisteri: RekisterinOsat? = nil
    @State private var valittuOsa: String = "Alku"
    @State private var onLataamassa: Bool = false
    @State private var virhe: String? = nil

    public init(
        skooppi: String,
        yhteenveto: SkooppiYhteenveto? = nil,
        client: ScopesClient,
        onToiminto: @escaping (String, String) -> Void = { _, _ in }
    ) {
        self.skooppi = skooppi
        self.yhteenveto = yhteenveto
        self.client = client
        self.onToiminto = onToiminto
    }

    public var body: some View {
        VStack(spacing: 0) {
            toimintopalkki
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color(nsColor: .controlBackgroundColor))

            Divider()

            if onLataamassa && tiedot == nil {
                Spacer()
                ProgressView("Ladataan tietoja...")
                Spacer()
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        if let v = virhe {
                            Text(v)
                                .font(.caption)
                                .foregroundColor(.red)
                        }

                        seuraavaLohko

                        avoimetLohko

                        if let viat = tiedot?.viat, !viat.isEmpty {
                            viatLohko(viat)
                        }

                        rekisteriKatselinLohko
                    }
                    .padding(12)
                }
            }
        }
        .task(id: skooppi) {
            await lataaKaikki()
        }
    }

    private var toimintopalkki: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Inspektori")
                    .font(.headline)
                Spacer()
                Button {
                    Task { await lataaKaikki() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .buttonStyle(.borderless)
                .help("Päivitä inspektori")
            }

            HStack(spacing: 6) {
                Button {
                    onToiminto("pura", skooppi)
                } label: {
                    Label("Pura", systemImage: "arrow.counterclockwise")
                }
                .help("Pura uuteen istuntoon (Cmd+Shift+P)")

                Button {
                    onToiminto("pakkaa", skooppi)
                } label: {
                    Label("Pakkaa", systemImage: "archivebox")
                }
                .help("Pakkaa istunto (Cmd+Shift+K)")

                Button {
                    onToiminto("automaattisiirto", skooppi)
                } label: {
                    Label("Siirto", systemImage: "arrow.right.circle")
                }
                .help("Automaattisiirto")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
    }

    private var seuraavaLohko: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("SEURAAVA PAKETTI")
                .font(.caption2.bold())
                .foregroundColor(.secondary)

            let teksti = tiedot?.seuraava ?? yhteenveto?.seuraava ?? "Ei määritelty"
            Text(teksti)
                .font(.callout)
                .textSelection(.enabled)
                .padding(8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 6).fill(Color(nsColor: .controlBackgroundColor)))
        }
    }

    private var avoimetLohko: some View {
        VStack(alignment: .leading, spacing: 6) {
            let maara = tiedot?.avoimet?.count ?? yhteenveto?.avoimia ?? 0
            Text("AVOIMET ASIAT (\(maara))")
                .font(.caption2.bold())
                .foregroundColor(.secondary)

            if let avoimet = tiedot?.avoimet, !avoimet.isEmpty {
                ForEach(avoimet) { asia in
                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text(asia.asia)
                                .font(.caption.bold())
                            Spacer()
                            Text(asia.tila)
                                .font(.caption2)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Capsule().fill(Color.orange.opacity(0.2)))
                                .foregroundColor(.orange)
                        }
                        if let s = asia.seuraavaAskel, !s.isEmpty {
                            Text(s)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(6)
                    .background(RoundedRectangle(cornerRadius: 4).fill(Color(nsColor: .controlBackgroundColor)))
                }
            } else {
                Text("Ei avoimia asioita")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    private func viatLohko(_ viat: [VikaKohta]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("VIAT (\(viat.count))")
                .font(.caption2.bold())
                .foregroundColor(.secondary)

            ForEach(viat) { vika in
                HStack {
                    Text(vika.vika)
                        .font(.caption)
                    Spacer()
                    Text(vika.tila)
                        .font(.caption2)
                        .foregroundColor(.red)
                }
                .padding(6)
                .background(RoundedRectangle(cornerRadius: 4).fill(Color(nsColor: .controlBackgroundColor)))
            }
        }
    }

    private var rekisteriKatselinLohko: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("REKISTERI.MD")
                .font(.caption2.bold())
                .foregroundColor(.secondary)

            if let osat = rekisteri?.osat, !osat.isEmpty {
                Picker("Osio", selection: $valittuOsa) {
                    ForEach(osat) { osa in
                        Text(osa.otsikko).tag(osa.otsikko)
                    }
                }
                .pickerStyle(.menu)

                if let osa = osat.first(where: { $0.otsikko == valittuOsa }) ?? osat.first {
                    ScrollView {
                        Text(osa.teksti)
                            .font(.caption.monospaced())
                            .textSelection(.enabled)
                            .padding(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxHeight: 220)
                    .background(RoundedRectangle(cornerRadius: 6).fill(Color(nsColor: .controlBackgroundColor)))
                }
            } else {
                Text("Rekisteritiedostoa ei ladattu.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    private func lataaKaikki() async {
        onLataamassa = true
        defer { onLataamassa = false }
        virhe = nil
        do {
            let t = try await client.skooppiTiedot(skooppi: skooppi)
            tiedot = t
            if let rekisteriPolku = t.rekisterit?.first {
                rekisteri = try? await client.rekisteri(polku: rekisteriPolku)
                if let eka = rekisteri?.osat.first?.otsikko {
                    valittuOsa = eka
                }
            }
        } catch {
            virhe = "Inspektorin haku epäonnistui: \(error.localizedDescription)"
        }
    }
}
