// Android-näkymä (SCOPES-ANDROID-GEMINI 15.10.2026, käyttäjän pyyntö): Android-puolen Gemini-äppiä käytetään iPhonesta
// palvelun /api/android-reiteillä (palvelu/android.mjs). Ruutu päivittyy noin sekunnin välein, kun näkymä on esillä ja äppi
// etualalla; napautus ja veto kuvassa välittyvät laitteelle 0–1-osuuksina kuvan näkyvästä alueesta (letterbox huomioitu).
// Lisäksi nappirivi, tekstikenttä, tiedoston syöttö Geminin liitteeksi sekä vastauksen ja tuotostiedostojen talteenotto.
// Vanha palvelin vastaa 404 "tuntematon polku": näkymä sanoo silloin, ettei palvelin tue ohjausta (kuten Infran linux-osio piiloutuu).
import PhotosUI
import SwiftUI
import UIKit
import UniformTypeIdentifiers

// Ruudun haku: yksi pyyntö kerrallaan. Jos haku on kesken, uusi pyyntö (napautuksen jälkeen) merkitään, ja kesken oleva
// haku tekee uusinnan heti valmistuttuaan; rinnakkaisia pyyntöjä ei synny. Ei hakua, kun näkymä ei ole aktiivinen.
@MainActor final class AndroidRuutu: ObservableObject {
    @Published var kuva: UIImage?
    @Published var virhe: String?
    @Published var tukematon = false
    var aktiivinen = false
    private var kesken = false
    private var uudelleen = false

    func hae(_ asiakas: Asiakas) async {
        guard aktiivinen else { return }
        if kesken { uudelleen = true; return }
        kesken = true
        defer { kesken = false }
        repeat {
            uudelleen = false
            do {
                let data = try await asiakas.androidRuutu()
                if let k = UIImage(data: data) { kuva = k; virhe = nil } else { virhe = "Ruutu ei ole kuva." }
            } catch {
                if Task.isCancelled || (error as? URLError)?.code == .cancelled { return }
                if Self.eiTueta(error) { tukematon = true } else { virhe = Self.lyhyt(error) }
            }
        } while uudelleen && aktiivinen && !tukematon && !Task.isCancelled
    }

    // 404 "tuntematon polku": palvelin on vanha eikä tunne /api/android-reittejä.
    static func eiTueta(_ virhe: Error) -> Bool {
        if case let Asiakas.Virhe.palvelu(koodi, viesti) = virhe { return koodi == 404 && viesti.contains("tuntematon polku") }
        return false
    }

    static func lyhyt(_ virhe: Error) -> String { String(virhe.localizedDescription.prefix(200)) }
}

struct AndroidView: View {
    let nakyvissa: Bool
    @EnvironmentObject private var asetukset: Asetukset
    @Environment(\.scenePhase) private var vaihe
    @StateObject private var ruutu = AndroidRuutu()
    @State private var teksti = ""
    @State private var toiminnossa = 0
    @State private var tila: String?
    @State private var virhe: String?
    @State private var tallennettu: AndroidTallennettu?
    @State private var tiedostotAuki = false
    @State private var kuvakirjasto = false
    @State private var kuvat: [PhotosPickerItem] = []
    @State private var tiedostoValinta = false

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }
    // Pollaus vain kun näkymä on esillä ja äppi etualalla: taustalla ja näkymästä poistuttaessa silmukka peruuntuu.
    private var aktiivinen: Bool { nakyvissa && vaihe == .active && asetukset.valmis }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if ruutu.tukematon {
                    Spacer()
                    Text("Palvelin ei tue Android-ohjausta vielä.").foregroundStyle(.secondary).padding()
                        .accessibilityIdentifier("android-tukematon")
                    Spacer()
                } else {
                    ruutuNakyma
                    if let v = virhe ?? ruutu.virhe {
                        Text(v).font(.footnote).foregroundStyle(.red).frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, Teema.Vali.l).accessibilityIdentifier("android-virhe")
                    } else if let tila {
                        Text(tila).font(.footnote).foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, Teema.Vali.l).accessibilityIdentifier("android-tila")
                    }
                    if toiminnossa > 0 {
                        ProgressView("Odotetaan Androidia… (voi kestää 15 s)").font(.footnote).padding(.top, Teema.Vali.xs)
                    }
                    napit
                    syotto
                }
            }
            .navigationTitle("Android")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Sivupalkkipainike()
                ToolbarItem(placement: .topBarTrailing) {
                    Button { tiedostotAuki = true } label: { Image(systemName: "folder") }
                        .disabled(ruutu.tukematon)
                        .accessibilityLabel("Tiedostot").accessibilityIdentifier("android-tiedostot")
                }
                .lasiKapseli()
            }
        }
        .task(id: "\(aktiivinen)" + asetukset.osoite + asetukset.avain) {
            ruutu.aktiivinen = aktiivinen
            guard aktiivinen else { return }
            ruutu.tukematon = false
            while !Task.isCancelled, !ruutu.tukematon {
                await ruutu.hae(asiakas)
                if Task.isCancelled { break }
                try? await Task.sleep(for: .seconds(ruutu.virhe == nil ? 1 : 3))
            }
        }
        .sheet(item: $tallennettu) { t in AndroidTeksti(teksti: t.teksti).tekstikoko() }
        .sheet(isPresented: $tiedostotAuki) { AndroidTiedostot().tekstikoko() }
        .photosPicker(isPresented: $kuvakirjasto, selection: $kuvat, maxSelectionCount: 1, matching: .images)
        .onChange(of: kuvat) { _, valitut in
            guard let k = valitut.first else { return }
            kuvat = []
            Task { await liitaKuva(k) }
        }
        .fileImporter(isPresented: $tiedostoValinta, allowedContentTypes: [.item], allowsMultipleSelection: false) { tulos in
            do {
                guard let url = try tulos.get().first else { return }
                let l = try Liite.tiedosto(url)
                Task { await liita(l) }
            } catch {
                virhe = "Tiedoston luku epäonnistui: \(error.localizedDescription)"
            }
        }
    }

    // Ruutu kuvana; kosketus kerätään UIKit-eleillä (AndroidEle), jotta vaakaveto ei avaa sivupalkkia.
    private var ruutuNakyma: some View {
        GeometryReader { g in
            ZStack {
                Color(.secondarySystemBackground)
                if let k = ruutu.kuva {
                    Image(uiImage: k).resizable().scaledToFit().frame(width: g.size.width, height: g.size.height)
                } else {
                    ProgressView()
                }
                AndroidEle(
                    napautus: { p in
                        guard let k = ruutu.kuva, let o = Self.osuus(p, g.size, k.size), Self.sisalla(o) else { return }
                        Task { _ = await aja { try await $0.android("napauta", AndroidPiste(x: o.x, y: o.y)) } }
                    },
                    veto: { alku, loppu, kesto in
                        guard let k = ruutu.kuva, let a = Self.osuus(alku, g.size, k.size), Self.sisalla(a),
                              let b = Self.osuus(loppu, g.size, k.size) else { return }
                        let ms = min(2000, max(100, Int(kesto * 1000)))
                        let r = AndroidVeto(x1: a.x, y1: a.y, x2: min(1, max(0, b.x)), y2: min(1, max(0, b.y)), kesto: ms)
                        Task { _ = await aja { try await $0.android("pyyhkaise", r) } }
                    })
                .accessibilityIdentifier("android-ruutu")
            }
            .clipped()
        }
    }

    // Kosketuspiste kuvan näkyvän alueen osuutena (0–1); aspectFit jättää reunoihin tyhjää, joka ei kuulu kuvaan.
    static func osuus(_ p: CGPoint, _ alue: CGSize, _ kuva: CGSize) -> (x: Double, y: Double)? {
        guard kuva.width > 0, kuva.height > 0, alue.width > 0, alue.height > 0 else { return nil }
        let s = min(alue.width / kuva.width, alue.height / kuva.height)
        let w = kuva.width * s, h = kuva.height * s
        return (Double((p.x - (alue.width - w) / 2) / w), Double((p.y - (alue.height - h) / 2) / h))
    }

    static func sisalla(_ o: (x: Double, y: Double)) -> Bool { (0...1).contains(o.x) && (0...1).contains(o.y) }

    private var napit: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Teema.Vali.s) {
                nappi("Takaisin", "chevron.backward", "android-takaisin") { _ = await aja { try await $0.android("nappi", AndroidNappi(nimi: "takaisin")) } }
                nappi("Koti", "house", "android-koti") { _ = await aja { try await $0.android("nappi", AndroidNappi(nimi: "koti")) } }
                nappi("Sovellukset", "square.on.square", "android-sovellukset") { _ = await aja { try await $0.android("nappi", AndroidNappi(nimi: "sovellukset")) } }
                nappi("Avaa Gemini", "sparkles", "android-avaa") { _ = await aja { try await $0.android("avaa") } }
                nappi("Uusi chat", "square.and.pencil", "android-uusi") { _ = await aja { try await $0.android("uusi") } }
                nappi("Tallenna vastaus", "square.and.arrow.down", "android-talteen") { await tallennaVastaus() }
                Menu {
                    Button { kuvakirjasto = true } label: { Label("Kuvakirjasto", systemImage: "photo.on.rectangle") }
                        .accessibilityIdentifier("android-liite-kuva")
                    Button { tiedostoValinta = true } label: { Label("Tiedostot", systemImage: "folder") }
                        .accessibilityIdentifier("android-liite-tiedosto")
                } label: { Label("Liitä tiedosto", systemImage: "paperclip") }
                    .buttonStyle(.bordered).disabled(toiminnossa > 0)
                    .accessibilityIdentifier("android-liite")
            }
            .padding(.horizontal, Teema.Vali.l)
        }
        .padding(.vertical, Teema.Vali.s)
    }

    private func nappi(_ otsikko: String, _ kuvake: String, _ tunnus: String, _ tyo: @escaping () async -> Void) -> some View {
        Button { Task { await tyo() } } label: { Label(otsikko, systemImage: kuvake) }
            .buttonStyle(.bordered).disabled(toiminnossa > 0)
            .accessibilityIdentifier(tunnus)
    }

    private var syotto: some View {
        HStack(alignment: .bottom, spacing: Teema.Vali.s) {
            TextField("Viesti Geminille", text: $teksti, axis: .vertical)
                .lineLimit(1...4).textFieldStyle(.roundedBorder)
                .accessibilityIdentifier("android-teksti")
            Button { Task { await laheta() } } label: { Image(systemName: "arrow.up.circle.fill").font(.title) }
                .disabled(teksti.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || toiminnossa > 0)
                .accessibilityLabel("Lähetä").accessibilityIdentifier("android-laheta")
        }
        .padding(.horizontal, Teema.Vali.l)
        .padding(.bottom, Teema.Vali.s)
    }

    // Toiminto palvelimelle; onnistuttua ruutu haetaan heti uudelleen. Palvelin sarjallistaa toiminnot, joten
    // kirjoitus ja liite voivat odottaa muiden perässä. 404 koko reitille = vanha palvelin.
    private func aja(_ tyo: (Asiakas) async throws -> AndroidVastaus) async -> AndroidVastaus? {
        guard asetukset.valmis else { virhe = "Anna palvelimen osoite ja avain asetuksissa."; return nil }
        toiminnossa += 1
        defer { toiminnossa -= 1 }
        do {
            let v = try await tyo(asiakas)
            virhe = nil
            await ruutu.hae(asiakas)
            return v
        } catch {
            if AndroidRuutu.eiTueta(error) { ruutu.tukematon = true } else { virhe = AndroidRuutu.lyhyt(error) }
            return nil
        }
    }

    private func laheta() async {
        let t = teksti.trimmingCharacters(in: .whitespacesAndNewlines)
        tila = nil
        if await aja({ try await $0.android("kirjoita", AndroidKirjoita(teksti: t, laheta: true)) }) != nil { teksti = "" }
    }

    private func tallennaVastaus() async {
        tila = nil
        guard let v = await aja({ try await $0.android("talteen") }) else { return }
        guard let t = v.teksti else { virhe = "Palvelin ei palauttanut vastauksen tekstiä."; return }
        tallennettu = AndroidTallennettu(teksti: t)
    }

    private func liitaKuva(_ k: PhotosPickerItem) async {
        guard let data = try? await k.loadTransferable(type: Data.self), let kuva = UIImage(data: data),
              let l = Liite.kuva(kuva, nimi: "kuva.jpg") else { virhe = "Kuvan lataus kuvakirjastosta epäonnistui."; return }
        await liita(l)
    }

    private func liita(_ l: Liite) async {
        tila = nil
        guard l.data.count <= 25 << 20 else { virhe = "Tiedosto on yli 25 Mt."; return }
        guard let v = await aja({ try await $0.androidLiite(l) }) else { return }
        if v.liitetty == true {
            tila = "Liitetty: \(l.nimi)"
        } else {
            virhe = "Tiedosto on laitteella, mutta liitteeksi asettumista ei voitu varmistaa. Tarkista ruudulta ja valitse tiedosto tarvittaessa käsin."
        }
    }
}

private struct AndroidPiste: Encodable { let x: Double; let y: Double }
private struct AndroidVeto: Encodable { let x1: Double; let y1: Double; let x2: Double; let y2: Double; let kesto: Int }
private struct AndroidNappi: Encodable { let nimi: String }
private struct AndroidKirjoita: Encodable { let teksti: String; let laheta: Bool }

struct AndroidTallennettu: Identifiable {
    let id = UUID()
    let teksti: String
}

// Tallennettu vastaus arkissa: kopiointi ja jako.
struct AndroidTeksti: View {
    let teksti: String
    @Environment(\.dismiss) private var sulje

    var body: some View {
        NavigationStack {
            ScrollView {
                Text(teksti).textSelection(.enabled).frame(maxWidth: .infinity, alignment: .leading).padding()
                    .accessibilityIdentifier("android-vastaus")
            }
            .navigationTitle("Vastaus")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Valmis") { sulje() } }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { UIPasteboard.general.string = teksti } label: { Image(systemName: "doc.on.doc") }
                        .accessibilityLabel("Kopioi").accessibilityIdentifier("android-kopioi")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    ShareLink(item: teksti) { Image(systemName: "square.and.arrow.up") }
                        .accessibilityIdentifier("android-jaa")
                }
            }
        }
    }
}

// Laitteen tuotostiedostot (Download, Pictures, …, 14 vrk): rivin valinta hakee tiedoston väliaikaistiedostoon ja avaa
// jakoarkin, josta sen tallentaa Tiedostoihin tai Kuviin.
struct AndroidTiedostot: View {
    @EnvironmentObject private var asetukset: Asetukset
    @Environment(\.dismiss) private var sulje
    @State private var tiedostot: [AndroidTuotos]?
    @State private var virhe: String?
    @State private var haetaan: String?
    @State private var jaettava: AndroidJaettava?

    private var asiakas: Asiakas { Asiakas(osoite: asetukset.osoite, avain: asetukset.avain) }

    var body: some View {
        NavigationStack {
            List {
                if let virhe { Text(virhe).foregroundStyle(.red).accessibilityIdentifier("android-tiedostot-virhe") }
                if let tiedostot {
                    if tiedostot.isEmpty { Text("Ei tiedostoja viimeiseltä 14 vuorokaudelta.").foregroundStyle(.secondary) }
                    ForEach(tiedostot) { t in
                        Button { Task { await avaa(t) } } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: Teema.Vali.xs) {
                                    Text(verbatim: t.nimi).lineLimit(2)
                                    Text("\(ByteCountFormatter.string(fromByteCount: Int64(t.koko), countStyle: .file)) · \(Self.aika(t.aika))")
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                if haetaan == t.polku { ProgressView() }
                            }
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain).disabled(haetaan != nil)
                        .accessibilityIdentifier("android-tuotos")
                    }
                } else if virhe == nil {
                    ProgressView()
                }
            }
            .navigationTitle("Tiedostot")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Valmis") { sulje() } } }
            .refreshable { await lataa() }
        }
        .task { await lataa() }
        .sheet(item: $jaettava) { j in AndroidJakoarkki(url: j.url).ignoresSafeArea() }
    }

    private static func aika(_ iso: String) -> String {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let d = f.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) else { return iso }
        return d.formatted(date: .abbreviated, time: .shortened)
    }

    private func lataa() async {
        do {
            tiedostot = try await asiakas.androidTuotokset()
            virhe = nil
        } catch {
            virhe = AndroidRuutu.eiTueta(error) ? "Palvelin ei tue Android-ohjausta vielä." : AndroidRuutu.lyhyt(error)
        }
    }

    private func avaa(_ t: AndroidTuotos) async {
        haetaan = t.polku
        defer { haetaan = nil }
        do {
            let data = try await asiakas.androidTuotos(t.polku)
            let nimi = URL(fileURLWithPath: t.nimi).lastPathComponent
            let kansio = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
            try FileManager.default.createDirectory(at: kansio, withIntermediateDirectories: true)
            let url = kansio.appendingPathComponent(nimi.isEmpty ? "tuotos" : nimi)
            try data.write(to: url)
            virhe = nil
            jaettava = AndroidJaettava(url: url)
        } catch {
            virhe = AndroidRuutu.lyhyt(error)
        }
    }
}

struct AndroidJaettava: Identifiable {
    let id = UUID()
    let url: URL
}

// Järjestelmän jakoarkki tiedostolle (Tallenna tiedostoihin, Tallenna kuva, …).
struct AndroidJakoarkki: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: [url], applicationActivities: nil)
    }

    func updateUIViewController(_ c: UIActivityViewController, context: Context) {}
}

// Ruudun kosketus UIKit-eleinä: napautus ja yhden sormen veto. Oma näkymä, jotta Juuri.swiftin sivuttaisveto ei vie
// vaakavetoa (Valvoja ohittaa tämän näkymän kosketukset); SwiftUI:n DragGesture ei myöskään kerro vedon alkuhetkeä.
struct AndroidEle: UIViewRepresentable {
    let napautus: (CGPoint) -> Void
    let veto: (CGPoint, CGPoint, TimeInterval) -> Void

    func makeUIView(context: Context) -> AndroidEleNakyma { AndroidEleNakyma() }

    func updateUIView(_ v: AndroidEleNakyma, context: Context) {
        v.napautus = napautus
        v.veto = veto
    }
}

final class AndroidEleNakyma: UIView {
    var napautus: (CGPoint) -> Void = { _ in }
    var veto: (CGPoint, CGPoint, TimeInterval) -> Void = { _, _, _ in }
    private var alku: CGPoint = .zero
    private var alkuAika = Date()

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
        let t = UITapGestureRecognizer(target: self, action: #selector(napautettu(_:)))
        let p = UIPanGestureRecognizer(target: self, action: #selector(vedetty(_:)))
        p.maximumNumberOfTouches = 1
        addGestureRecognizer(t)
        addGestureRecognizer(p)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) ei käytössä") }

    @objc private func napautettu(_ t: UITapGestureRecognizer) {
        if t.state == .ended { napautus(t.location(in: self)) }
    }

    @objc private func vedetty(_ p: UIPanGestureRecognizer) {
        switch p.state {
        case .began:
            let l = p.location(in: self), s = p.translation(in: self)
            alku = CGPoint(x: l.x - s.x, y: l.y - s.y)
            alkuAika = Date()
        case .ended:
            veto(alku, p.location(in: self), Date().timeIntervalSince(alkuAika))
        default: break
        }
    }
}
