// Liitteet skoopin viesteihin (CHAT-MEDIA-SKOOPPI 14.10.2026). Lähteet käyttäjän päätöksellä: kuvakirjasto,
// kamera, Tiedostot ja leikepöytä. Äppi lähettää jokaisen liitteen palveluun (POST /api/skoopit/<nimi>/liite),
// saa takaisin palvelimen polun ja lisää polut viestin loppuun; istunto lukee liitteen itse Read-työkalulla.
// Kuvat muunnetaan JPEGiksi (HEIC ei kelpaa Clauden kuvalukuun) ja pienennetään, pitkä sivu enintään 2048 pt.
import PhotosUI
import SwiftUI
import UIKit
import UniformTypeIdentifiers

struct Liite: Identifiable {
    let id = UUID()
    let nimi: String
    let data: Data
    let esikatselu: UIImage?

    static let kuvanSivu: CGFloat = 2048

    static func kuva(_ kuva: UIImage, nimi: String) -> Liite? {
        let pienennetty = kuva.pienennetty(Self.kuvanSivu)
        guard let data = pienennetty.jpegData(compressionQuality: 0.85) else { return nil }
        return Liite(nimi: nimi, data: data, esikatselu: pienennetty)
    }

    static func tiedosto(_ url: URL) throws -> Liite {
        let suojattu = url.startAccessingSecurityScopedResource()
        defer { if suojattu { url.stopAccessingSecurityScopedResource() } }
        let data = try Data(contentsOf: url)
        // Kuvatiedosto (myös HEIC) kulkee kuvan tavoin JPEGinä; muu tiedosto sellaisenaan.
        if UTType(filenameExtension: url.pathExtension)?.conforms(to: .image) == true, let k = UIImage(data: data),
           let l = kuva(k, nimi: url.deletingPathExtension().lastPathComponent + ".jpg") { return l }
        return Liite(nimi: url.lastPathComponent, data: data, esikatselu: nil)
    }

    // Viestin teksti ja palvelimen polut yhdeksi riviksi (tmux-reitti yhdistää rivit joka tapauksessa).
    static func viesti(_ teksti: String, polut: [String]) -> String {
        guard !polut.isEmpty else { return teksti }
        let liitteet = "Liitteet: " + polut.joined(separator: " ")
        return teksti.isEmpty ? liitteet : teksti + "\n\n" + liitteet
    }
}

extension UIImage {
    func pienennetty(_ sivu: CGFloat) -> UIImage {
        let pisin = max(size.width, size.height)
        guard pisin > sivu else { return self }
        let mitat = CGSize(width: size.width * sivu / pisin, height: size.height * sivu / pisin)
        let muoto = UIGraphicsImageRendererFormat()
        muoto.scale = 1
        return UIGraphicsImageRenderer(size: mitat, format: muoto).image { _ in draw(in: CGRect(origin: .zero, size: mitat)) }
    }
}

// Syöttörivin vasen reuna: plus-valikko, josta liite valitaan.
struct LiiteValikko: View {
    @Binding var liitteet: [Liite]
    @Binding var virhe: String?
    @State private var kuvat: [PhotosPickerItem] = []
    @State private var kuvakirjasto = false
    @State private var kamera = false
    @State private var tiedostot = false

    var body: some View {
        Menu {
            Button { kuvakirjasto = true } label: { Label("Kuvakirjasto", systemImage: "photo.on.rectangle") }
                .accessibilityIdentifier("liite-kuvakirjasto")
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                Button { kamera = true } label: { Label("Kamera", systemImage: "camera") }
                    .accessibilityIdentifier("liite-kamera")
            }
            Button { tiedostot = true } label: { Label("Tiedostot", systemImage: "folder") }
                .accessibilityIdentifier("liite-tiedostot")
            Button { liitaLeikepoydalta() } label: { Label("Liitä leikepöydältä", systemImage: "doc.on.clipboard") }
                .accessibilityIdentifier("liite-leikepoyta")
        } label: {
            Image(systemName: "plus")
                .font(.body.weight(.semibold)).dynamicTypeSize(...DynamicTypeSize.xxLarge)
                .foregroundStyle(.primary)
                .frame(width: 32, height: 32)
                .background(Circle().fill(Color(.systemGray5)))
        }
        .accessibilityLabel("Lisää liite")
        .accessibilityIdentifier("viestit-liite")
        .photosPicker(isPresented: $kuvakirjasto, selection: $kuvat, maxSelectionCount: 10, matching: .images)
        .onChange(of: kuvat) { _, valitut in
            guard !valitut.isEmpty else { return }
            kuvat = []
            Task { await lataaKuvat(valitut) }
        }
        .fullScreenCover(isPresented: $kamera) {
            Kamera { kuva in
                if let l = Liite.kuva(kuva, nimi: "kamera-\(liitteet.count + 1).jpg") { liitteet.append(l) }
            }
            .ignoresSafeArea()
        }
        .fileImporter(isPresented: $tiedostot, allowedContentTypes: [.item], allowsMultipleSelection: true) { tulos in
            do {
                for url in try tulos.get() { liitteet.append(try Liite.tiedosto(url)) }
            } catch {
                virhe = "Tiedoston luku epäonnistui: \(error.localizedDescription)"
            }
        }
    }

    private func lataaKuvat(_ valitut: [PhotosPickerItem]) async {
        for (i, k) in valitut.enumerated() {
            guard let data = try? await k.loadTransferable(type: Data.self), let kuva = UIImage(data: data),
                  let l = Liite.kuva(kuva, nimi: "kuva-\(liitteet.count + i + 1).jpg") else {
                virhe = "Kuvan lataus kuvakirjastosta epäonnistui"
                continue
            }
            liitteet.append(l)
        }
    }

    private func liitaLeikepoydalta() {
        let p = UIPasteboard.general
        if let kuva = p.image, let l = Liite.kuva(kuva, nimi: "leikepoyta-\(liitteet.count + 1).jpg") {
            liitteet.append(l)
        } else if let url = p.url, url.isFileURL, let l = try? Liite.tiedosto(url) {
            liitteet.append(l)
        } else {
            virhe = "Leikepöydällä ei ole kuvaa tai tiedostoa"
        }
    }
}

// Valitut liitteet syöttörivin yläpuolella; X poistaa liitteen ennen lähetystä.
struct LiiteRivi: View {
    @Binding var liitteet: [Liite]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Teema.Vali.s) {
                ForEach(liitteet) { l in
                    ZStack(alignment: .topTrailing) {
                        Group {
                            if let k = l.esikatselu {
                                Image(uiImage: k).resizable().scaledToFill()
                            } else {
                                VStack(spacing: Teema.Vali.xs) {
                                    Image(systemName: "doc")
                                    Text(verbatim: l.nimi).font(.caption2).lineLimit(2).multilineTextAlignment(.center)
                                }
                                .padding(Teema.Vali.xs)
                            }
                        }
                        .frame(width: 64, height: 64)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: Teema.Kulma.pieni, style: .continuous))
                        Button { liitteet.removeAll { $0.id == l.id } } label: {
                            Image(systemName: "xmark.circle.fill").symbolRenderingMode(.palette)
                                .foregroundStyle(.white, Color.black.opacity(0.6))
                        }
                        .padding(2)
                        .accessibilityLabel("Poista liite \(l.nimi)")
                        .accessibilityIdentifier("liite-poista")
                    }
                    .accessibilityElement(children: .contain)
                    .accessibilityIdentifier("liite")
                }
            }
            .padding(.horizontal, Teema.Vali.l)
        }
        .padding(.bottom, Teema.Vali.xs)
    }
}

// Kamera UIKitin kuvanvalitsimella: SwiftUI:ssa ei ole omaa kameranäkymää.
struct Kamera: UIViewControllerRepresentable {
    let otettu: (UIImage) -> Void
    @Environment(\.dismiss) private var sulje

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let c = UIImagePickerController()
        c.sourceType = .camera
        c.delegate = context.coordinator
        return c
    }

    func updateUIViewController(_ c: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Koordinaattori { Koordinaattori(self) }

    final class Koordinaattori: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let isa: Kamera
        init(_ isa: Kamera) { self.isa = isa }
        func imagePickerController(_ c: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let k = info[.originalImage] as? UIImage { isa.otettu(k) }
            isa.sulje()
        }
        func imagePickerControllerDidCancel(_ c: UIImagePickerController) { isa.sulje() }
    }
}
