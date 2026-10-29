import SwiftUI

#if canImport(UIKit)
import UIKit
#endif

/// Mobiilipikanäppäimistöpalkin näppäinkomennot ja koodaukset
public enum TerminalAccessoryKey: String, CaseIterable, Identifiable, Sendable {
    case esc = "ESC"
    case tab = "TAB"
    case ctrl = "CTRL"
    case alt = "ALT"
    case arrowUp = "▲"
    case arrowDown = "▼"
    case arrowLeft = "◀"
    case arrowRight = "▶"
    case ctrlC = "Ctrl-C"
    case ctrlD = "Ctrl-D"
    case ctrlL = "Ctrl-L"

    public var id: String { rawValue }

    /// Näppäimen tuottama ANSI-pakomerkkijono tai ohjaustavu
    public var sequence: String? {
        switch self {
        case .esc: return "\u{1B}"
        case .tab: return "\t"
        case .arrowUp: return "\u{1B}[A"
        case .arrowDown: return "\u{1B}[B"
        case .arrowLeft: return "\u{1B}[D"
        case .arrowRight: return "\u{1B}[C"
        case .ctrlC: return "\u{03}"
        case .ctrlD: return "\u{04}"
        case .ctrlL: return "\u{0C}"
        case .ctrl, .alt: return nil // Modifioijat, ei suoraa sekvenssiä
        }
    }

    public var isModifier: Bool {
        return self == .ctrl || self == .alt
    }
}

/// Mobiilin terminaalilisäpalkki (Accessory Toolbar).
/// Sijoitetaan näppäimistön yläreunaan mobiilissa. Tukee sticky CTRL- ja ALT-modifioijia
/// sekä suoria päätenäppäimiä (ESC, TAB, nuolinäppäimet, Ctrl-C, Ctrl-D, Ctrl-L).
public struct TerminalAccessoryBar: View {
    @ObservedObject public var connection: TerminalConnection
    @State private var isCtrlActive: Bool = false
    @State private var isAltActive: Bool = false

    public var onPasteRequested: (() -> Void)?

    public init(connection: TerminalConnection, onPasteRequested: (() -> Void)? = nil) {
        self.connection = connection
        self.onPasteRequested = onPasteRequested
    }

    public var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                // Modifioijat ja erikoisnäppäimet
                ForEach(TerminalAccessoryKey.allCases) { key in
                    Button(action: {
                        handleKeyTap(key)
                    }) {
                        Text(key.rawValue)
                            .font(.system(size: 13, weight: .semibold, design: .monospaced))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 7)
                            .background(buttonBackground(for: key))
                            .foregroundColor(buttonForeground(for: key))
                            .cornerRadius(6)
                    }
                    .buttonStyle(.plain)
                }

                // Liitä leikepöydältä -painike
                Button(action: {
                    handlePaste()
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "doc.on.clipboard")
                            .font(.system(size: 11))
                        Text("Liitä")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(Color.secondary.opacity(0.18))
                    .foregroundColor(.primary)
                    .cornerRadius(6)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
        }
        .background(Color(UIColorOrNSColorBackground))
    }

    // MARK: - Painallusten käsittely

    private func handleKeyTap(_ key: TerminalAccessoryKey) {
        triggerHaptic()

        switch key {
        case .ctrl:
            isCtrlActive.toggle()
        case .alt:
            isAltActive.toggle()
        default:
            if let seq = key.sequence {
                var finalSeq = seq
                if isAltActive && key != .alt {
                    finalSeq = "\u{1B}" + finalSeq
                    isAltActive = false
                }
                connection.send(text: finalSeq)
                if isCtrlActive {
                    isCtrlActive = false
                }
            }
        }
    }

    private func handlePaste() {
        triggerHaptic()
        if let onPasteRequested = onPasteRequested {
            onPasteRequested()
            return
        }

        #if canImport(UIKit) && !os(watchOS)
        if let text = UIPasteboard.general.string, !text.isEmpty {
            connection.send(text: text)
        }
        #elseif canImport(AppKit)
        if let text = NSPasteboard.general.string(forType: .string), !text.isEmpty {
            connection.send(text: text)
        }
        #endif
    }

    /// Käsittelee tavallisen näppäimistösyötteen huomioiden aktiiviset CTRL- ja ALT-modifioijat
    public func processInputChar(_ char: Character) -> String {
        var str = String(char)

        if isCtrlActive {
            isCtrlActive = false
            if let scalar = char.unicodeScalars.first, scalar.isASCII {
                let val = scalar.value
                if val >= 65 && val <= 90 { // A-Z
                    str = String(UnicodeScalar(val - 64)!)
                } else if val >= 97 && val <= 122 { // a-z
                    str = String(UnicodeScalar(val - 96)!)
                }
            }
        }

        if isAltActive {
            isAltActive = false
            str = "\u{1B}" + str
        }

        return str
    }

    // MARK: - Värit ja tyylit

    private func buttonBackground(for key: TerminalAccessoryKey) -> Color {
        if key == .ctrl && isCtrlActive {
            return Color.accentColor
        }
        if key == .alt && isAltActive {
            return Color.accentColor
        }
        return Color.secondary.opacity(0.18)
    }

    private func buttonForeground(for key: TerminalAccessoryKey) -> Color {
        if (key == .ctrl && isCtrlActive) || (key == .alt && isAltActive) {
            return Color.white
        }
        return Color.primary
    }

    private var UIColorOrNSColorBackground: Color {
        #if canImport(UIKit) && !os(watchOS)
        return Color(UIColor.tertiarySystemBackground)
        #elseif canImport(AppKit)
        return Color(NSColor.windowBackgroundColor)
        #else
        return Color.gray.opacity(0.2)
        #endif
    }

    private func triggerHaptic() {
        #if canImport(UIKit) && !os(watchOS)
        let feedback = UIImpactFeedbackGenerator(style: .light)
        feedback.impactOccurred()
        #endif
    }
}

/// Vaihtoehtoinen tyyppinimi apupalkille (SUUNNITELMA.md)
public typealias TerminalToolbarView = TerminalAccessoryBar
