// MacAndroidView.swift - macOS Android remote screen & control view
import SwiftUI
import AppKit
import ScopesCore

public struct MacAndroidView: View {
    public let client: ScopesClient

    @State private var ruutuKuva: NSImage? = nil
    @State private var virhe: String? = nil
    @State private var tila: String? = nil
    @State private var teksti: String = ""
    @State private var onAktiivinen: Bool = false
    @State private var onLahettamassa: Bool = false
    @State private var vetoAlku: CGPoint? = nil

    public init(client: ScopesClient) {
        self.client = client
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Yläpalkki
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Android-etäohjaus")
                        .font(.title3)
                        .bold()
                    Text("Reaaliaikainen ruutukaappaus ja kosketusohjaus")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()

                HStack(spacing: 6) {
                    Circle()
                        .fill(ruutuKuva != nil ? Color.green : Color.secondary)
                        .frame(width: 8, height: 8)
                    Text(ruutuKuva != nil ? "Yhdistetty" : "Ei kuvaa")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Button {
                    Task { await haeRuutu() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .help("Päivitä ruutu")
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
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.yellow.opacity(0.1))
            }

            // Pääalue: Android-näyttö
            GeometryReader { geo in
                ZStack {
                    Color.black.opacity(0.85)

                    if let img = ruutuKuva {
                        Image(nsImage: img)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(maxWidth: geo.size.width, maxHeight: geo.size.height)
                            .gesture(
                                DragGesture(minimumDistance: 0)
                                    .onChanged { val in
                                        if vetoAlku == nil {
                                            vetoAlku = val.startLocation
                                        }
                                    }
                                    .onEnded { val in
                                        kasitteleKosketus(alku: vetoAlku ?? val.startLocation, loppu: val.location, koko: geo.size, kuvaKoko: img.size)
                                        vetoAlku = nil
                                    }
                            )
                    } else {
                        VStack(spacing: 12) {
                            ProgressView()
                            Text("Odotetaan Android-ruutua...")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }

            Divider()

            // Ohjauspainikkeet
            HStack(spacing: 12) {
                Button {
                    lahetaNappi("back")
                } label: {
                    Label("Takaisin", systemImage: "chevron.backward")
                }
                .help("Android Back")

                Button {
                    lahetaNappi("home")
                } label: {
                    Label("Koti", systemImage: "circle")
                }
                .help("Android Home")

                Button {
                    lahetaNappi("app_switch")
                } label: {
                    Label("Viimeisimmät", systemImage: "square.on.square")
                }
                .help("Android Recent Apps")

                Divider().frame(height: 18)

                Button {
                    lahetaNappi("volume_up")
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                }
                .help("Äänenvoimakkuus ylös")

                Button {
                    lahetaNappi("volume_down")
                } label: {
                    Image(systemName: "speaker.wave.1.fill")
                }
                .help("Äänenvoimakkuus alas")

                Button {
                    lahetaNappi("power")
                } label: {
                    Image(systemName: "power")
                }
                .help("Virta (Lukitus/Avaus)")
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(nsColor: .controlBackgroundColor))

            Divider()

            // Tekstisyöttö Androidille
            HStack(spacing: 8) {
                TextField("Kirjoita tekstiä laitteelle...", text: $teksti)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit {
                        lahetaTeksti(lahetaMyos: true)
                    }

                Button("Kirjoita") {
                    lahetaTeksti(lahetaMyos: false)
                }
                .buttonStyle(.bordered)
                .disabled(teksti.isEmpty)

                Button("Lähetä (Enter)") {
                    lahetaTeksti(lahetaMyos: true)
                }
                .buttonStyle(.borderedProminent)
                .disabled(teksti.isEmpty)
            }
            .padding(12)
            .background(Color(nsColor: .windowBackgroundColor))
        }
        .task {
            onAktiivinen = true
            await haeRuutu()
            while onAktiivinen && !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_200_000_000)
                if Task.isCancelled { break }
                await haeRuutu()
            }
        }
        .onDisappear {
            onAktiivinen = false
        }
    }

    private func haeRuutu() async {
        do {
            let data = try await client.androidRuutu(leveys: 720)
            if let image = NSImage(data: data) {
                ruutuKuva = image
                virhe = nil
            }
        } catch {
            // Hiljainen virhe pollingissa
        }
    }

    private func kasitteleKosketus(alku: CGPoint, loppu: CGPoint, koko: CGSize, kuvaKoko: CGSize) {
        guard kuvaKoko.width > 0, kuvaKoko.height > 0 else { return }

        // Lasketaan kuvan todellinen kehys aspect fitissä
        let kuvaAspect = kuvaKoko.width / kuvaKoko.height
        let ruutuAspect = koko.width / koko.height
        let piirtoW: CGFloat
        let piirtoH: CGFloat
        let offsetX: CGFloat
        let offsetY: CGFloat

        if ruutuAspect > kuvaAspect {
            piirtoH = koko.height
            piirtoW = koko.height * kuvaAspect
            offsetX = (koko.width - piirtoW) / 2
            offsetY = 0
        } else {
            piirtoW = koko.width
            piirtoH = koko.width / kuvaAspect
            offsetX = 0
            offsetY = (koko.height - piirtoH) / 2
        }

        let suhteellinenAlkuX = max(0, min(1, (alku.x - offsetX) / piirtoW))
        let suhteellinenAlkuY = max(0, min(1, (alku.y - offsetY) / piirtoH))
        let suhteellinenLoppuX = max(0, min(1, (loppu.x - offsetX) / piirtoW))
        let suhteellinenLoppuY = max(0, min(1, (loppu.y - offsetY) / piirtoH))

        let dx = abs(loppu.x - alku.x)
        let dy = abs(loppu.y - alku.y)

        Task {
            if dx < 10 && dy < 10 {
                // Napautus (Tap)
                _ = try? await client.androidToiminto("napauta", runko: [
                    "x": String(format: "%.4f", suhteellinenAlkuX),
                    "y": String(format: "%.4f", suhteellinenAlkuY)
                ])
            } else {
                // Pyyhkäisy (Swipe)
                _ = try? await client.androidToiminto("pyyhkaise", runko: [
                    "x1": String(format: "%.4f", suhteellinenAlkuX),
                    "y1": String(format: "%.4f", suhteellinenAlkuY),
                    "x2": String(format: "%.4f", suhteellinenLoppuX),
                    "y2": String(format: "%.4f", suhteellinenLoppuY)
                ])
            }
            try? await Task.sleep(nanoseconds: 200_000_000)
            await haeRuutu()
        }
    }

    private func lahetaNappi(_ nimi: String) {
        Task {
            _ = try? await client.androidToiminto("nappi", runko: ["nimi": nimi])
            try? await Task.sleep(nanoseconds: 250_000_000)
            await haeRuutu()
        }
    }

    private func lahetaTeksti(lahetaMyos: Bool) {
        let t = teksti
        teksti = ""
        Task {
            _ = try? await client.androidToiminto("kirjoita", runko: [
                "teksti": t,
                "laheta": lahetaMyos ? "true" : "false"
            ])
            try? await Task.sleep(nanoseconds: 300_000_000)
            await haeRuutu()
        }
    }
}
