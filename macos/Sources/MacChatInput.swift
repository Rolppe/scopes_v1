import SwiftUI
import AppKit

public struct MacChatInput: View {
    @Binding var teksti: String
    @Binding var liitteet: [URL]
    // Ilman liitesidosta (chat-näkymä, jolla ei ole liitereittiä) paperiliitin ja pudotus jäävät pois.
    let liitteetKaytossa: Bool
    var voiLahettaa: Bool
    var laheta: () -> Void

    public init(teksti: Binding<String>, liitteet: Binding<[URL]>? = nil, voiLahettaa: Bool = true, laheta: @escaping () -> Void) {
        self._teksti = teksti
        self._liitteet = liitteet ?? .constant([])
        self.liitteetKaytossa = liitteet != nil
        self.voiLahettaa = voiLahettaa
        self.laheta = laheta
    }

    // Liite yksinään riittää lähetykseen, kuten iOS:llä.
    private var onSisaltoa: Bool {
        !teksti.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !liitteet.isEmpty
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !liitteet.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(liitteet, id: \.self) { url in
                            HStack(spacing: 4) {
                                Image(systemName: "doc")
                                Text(url.lastPathComponent).lineLimit(1)
                                Button {
                                    liitteet.removeAll { $0 == url }
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                }
                                .buttonStyle(.plain)
                                .help("Poista liite")
                            }
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Capsule().fill(Color.secondary.opacity(0.15)))
                        }
                    }
                }
            }
            syottorivi
        }
        .padding(12)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var syottorivi: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if liitteetKaytossa {
                Button(action: valitseTiedostot) {
                    Image(systemName: "paperclip")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 18, height: 18)
                        .foregroundColor(.secondary)
                        .padding(6)
                }
                .buttonStyle(.plain)
                .help("Liitä tiedosto Finderista (tai raahaa tähän)")
            }

            TextField("Kirjoita viesti... (Enter lähettää, Shift+Enter rivinvaihto)", text: $teksti, axis: .vertical)
                .textFieldStyle(.plain)
                .lineLimit(1...8)
                .padding(8)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .textBackgroundColor)))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.secondary.opacity(0.3), lineWidth: 1))
                .tiedostojenPudotus(liitteet: $liitteet, kaytossa: liitteetKaytossa)
                .onKeyPress(.return) {
                    if NSEvent.modifierFlags.contains(.shift) {
                        return .ignored
                    }
                    if onSisaltoa && voiLahettaa {
                        laheta()
                        return .handled
                    }
                    return .handled
                }

            Button(action: laheta) {
                Image(systemName: "arrow.up.circle.fill")
                    .resizable()
                    .frame(width: 28, height: 28)
                    .foregroundColor(voiLahettaa && onSisaltoa ? .accentColor : .secondary)
            }
            .buttonStyle(.plain)
            .disabled(!voiLahettaa || !onSisaltoa)
        }
    }

    private func valitseTiedostot() {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = true
        panel.canChooseDirectories = false
        panel.canChooseFiles = true
        if panel.runModal() == .OK {
            liitteet = LiitteetMac.lisaa(panel.urls, olemassaOlevat: liitteet)
        }
    }
}
