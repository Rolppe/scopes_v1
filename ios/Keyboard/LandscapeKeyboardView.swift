import SwiftUI

public struct LandscapeKeyboardView: View {
    public let shiftState: ShiftState
    public let mode: KeyboardMode
    public let onAction: (KeyAction) -> Void

    private let rowHeight: CGFloat = 36
    private let keySpacing: CGFloat = 5
    private let columnPadding: CGFloat = 8

    public init(shiftState: ShiftState, mode: KeyboardMode, onAction: @escaping (KeyAction) -> Void) {
        self.shiftState = shiftState
        self.mode = mode
        self.onAction = onAction
    }

    private var isShifted: Bool {
        shiftState != .off
    }

    private func formatChar(_ char: String) -> String {
        isShifted ? char.uppercased() : char.lowercased()
    }

    public var body: some View {
        HStack(alignment: .top, spacing: columnPadding) {
            // 1. Vasen peukalolohko
            leftWing
                .frame(maxWidth: .infinity)

            // 2. Keskialue: Kaksi vierekkäistä pystyriviä (käyttäjä 26.10.2026)
            centerColumns
                .frame(width: 90)

            // 3. Oikea peukalolohko
            rightWing
                .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
    }

    // MARK: - Vasen siipi
    private var leftWing: some View {
        VStack(spacing: keySpacing) {
            // Rivi 1
            HStack(spacing: keySpacing) {
                ForEach(["q", "w", "e", "r", "t"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 2
            HStack(spacing: keySpacing) {
                ForEach(["a", "s", "d", "f", "g"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 3
            HStack(spacing: keySpacing) {
                shiftKey
                    .frame(width: 48)
                ForEach(["z", "x", "c", "v"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 4
            HStack(spacing: keySpacing) {
                KeyButtonView(item: KeyItem(label: mode == .letters ? "123" : "ABC", action: .switchMode(mode == .letters ? .numbers : .letters), isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 48)
                KeyButtonView(item: KeyItem(label: "", action: .globe, systemImage: "globe", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 40)
                KeyButtonView(item: KeyItem(label: "välilyönti", action: .space, isSpecial: false), height: rowHeight, onAction: onAction)
            }
        }
    }

    // MARK: - Keskialueen kaksi pystyriviä (käyttäjä 26.10.2026)
    private var centerColumns: some View {
        VStack(spacing: keySpacing) {
            // Rivi 1: / ja `
            HStack(spacing: keySpacing) {
                specialActionKey("/", .character("/"))
                specialActionKey("`", .character("`"))
            }
            // Rivi 2: : ja -
            HStack(spacing: keySpacing) {
                specialActionKey(":", .character(":"))
                specialActionKey("-", .character("-"))
            }
            // Rivi 3: " ja _
            HStack(spacing: keySpacing) {
                specialActionKey("\"", .character("\""))
                specialActionKey("_", .character("_"))
            }
            // Rivi 4: ◀ ja ▶
            HStack(spacing: keySpacing) {
                specialActionKey("◀", .moveCursor(-1), systemImage: "arrow.left")
                specialActionKey("▶", .moveCursor(1), systemImage: "arrow.right")
            }
        }
    }

    // MARK: - Oikea siipi
    private var rightWing: some View {
        VStack(spacing: keySpacing) {
            // Rivi 1
            HStack(spacing: keySpacing) {
                ForEach(["y", "u", "i", "o", "p", "å"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 2
            HStack(spacing: keySpacing) {
                ForEach(["h", "j", "k", "l", "ö", "ä"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 3
            HStack(spacing: keySpacing) {
                ForEach(["b", "n", "m"], id: \.self) { c in
                    letterKey(c)
                }
                KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 52)
            }
            // Rivi 4
            HStack(spacing: keySpacing) {
                KeyButtonView(item: KeyItem(label: "välilyönti", action: .space, isSpecial: false), height: rowHeight, onAction: onAction)
                KeyButtonView(item: KeyItem(label: "syötä", action: .returnKey, isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 64)
            }
        }
    }

    private func letterKey(_ char: String) -> some View {
        let text = formatChar(char)
        return KeyButtonView(item: KeyItem(label: text, action: .character(text), isSpecial: false), height: rowHeight, onAction: onAction)
    }

    private func specialActionKey(_ label: String, _ action: KeyAction, systemImage: String? = nil) -> some View {
        KeyButtonView(item: KeyItem(label: label, action: action, systemImage: systemImage, isSpecial: true), height: rowHeight, onAction: onAction)
    }

    private var shiftKey: some View {
        let img = shiftState == .capsLock ? "capslock.fill" : (shiftState == .shift ? "shift.fill" : "shift")
        return KeyButtonView(item: KeyItem(label: "", action: .shift, systemImage: img, isSpecial: true), height: rowHeight, onAction: onAction)
    }
}
