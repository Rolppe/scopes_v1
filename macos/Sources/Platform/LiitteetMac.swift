// LiitteetMac.swift - macOS Drag & Drop ja leikepöytätuki Finder-tiedostoille (MAC-17)
// Tiedosto lähetetään palveluun (POST /api/skoopit/<nimi>/liite); viestiin menee palvelimen polku,
// koska siellä ajava istunto ei lue Macin polkua /Users/... (MAC-17-vika 19.10.2026).
import SwiftUI
import AppKit
import UniformTypeIdentifiers
import ScopesCore

public struct LiitteetMac {
    public enum Virhe: LocalizedError {
        case liianSuuri(String, Int)

        public var errorDescription: String? {
            switch self {
            case let .liianSuuri(nimi, koko): return "\(nimi) on \(koko / 1_048_576) Mt; raja on \(LiiteVastaus.maksimi / 1_048_576) Mt."
            }
        }
    }

    /// Hakee Finder-tiedostojen polut leikepöydältä
    public static func tiedostotLeikepoydalta() -> [URL] {
        let pasteboard = NSPasteboard.general
        guard let items = pasteboard.pasteboardItems else { return [] }
        var tulokset: [URL] = []
        for item in items {
            if let string = item.string(forType: .fileURL), let url = URL(string: string) {
                tulokset.append(url)
            }
        }
        return tulokset
    }

    /// Lisää tiedostot liitelistaan; kansiot ja kaksoiskappaleet jätetään pois (palvelu ottaa vain tiedoston tavut).
    public static func lisaa(_ uudet: [URL], olemassaOlevat: [URL]) -> [URL] {
        var tulos = olemassaOlevat
        for url in uudet where url.isFileURL && !onKansio(url) && !tulos.contains(url) {
            tulos.append(url)
        }
        return tulos
    }

    /// Lähettää liitteet palveluun ja palauttaa viestin, jossa on palvelimen polut.
    public static func lahetaJaMuotoile(_ teksti: String, liitteet: [URL], skooppi: String, client: ScopesClient) async throws -> String {
        var polut: [String] = []
        for url in liitteet {
            let data = try lue(url)
            polut.append(try await client.lahetaLiite(skooppi: skooppi, nimi: url.lastPathComponent, data: data).polku)
        }
        return LiiteVastaus.viesti(teksti, polut: polut)
    }

    static func lue(_ url: URL) throws -> Data {
        let koko = (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0
        guard koko <= LiiteVastaus.maksimi else { throw Virhe.liianSuuri(url.lastPathComponent, koko) }
        return try Data(contentsOf: url)
    }

    private static func onKansio(_ url: URL) -> Bool {
        (try? url.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) == true
    }
}

public struct TiedostoPudotusModifier: ViewModifier {
    @Binding var liitteet: [URL]
    let kaytossa: Bool
    @State private var onKohdistettu: Bool = false

    public init(liitteet: Binding<[URL]>, kaytossa: Bool = true) {
        self._liitteet = liitteet
        self.kaytossa = kaytossa
    }

    public func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.accentColor, lineWidth: onKohdistettu ? 2 : 0)
                    .animation(.easeInOut(duration: 0.15), value: onKohdistettu)
            )
            .dropDestination(for: URL.self) { items, _ in
                guard kaytossa else { return false }
                let uudet = LiitteetMac.lisaa(items, olemassaOlevat: liitteet)
                guard uudet.count > liitteet.count else { return false }
                liitteet = uudet
                return true
            } isTargeted: { targeted in
                onKohdistettu = kaytossa && targeted
            }
    }
}

public extension View {
    func tiedostojenPudotus(liitteet: Binding<[URL]>, kaytossa: Bool = true) -> some View {
        self.modifier(TiedostoPudotusModifier(liitteet: liitteet, kaytossa: kaytossa))
    }
}
