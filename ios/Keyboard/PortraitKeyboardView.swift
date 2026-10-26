import SwiftUI

public struct PortraitKeyboardView: View {
    public let shiftState: ShiftState
    public let mode: KeyboardMode
    public let onAction: (KeyAction) -> Void

    private let rowHeight: CGFloat = 42
    private let keySpacing: CGFloat = 6

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
        VStack(spacing: 8) {
            switch mode {
            case .letters:
                lettersLayout
            case .numbers:
                numbersLayout
            case .symbols:
                symbolsLayout
            }
        }
        .padding(.horizontal, 4)
        .padding(.top, 8)
        .padding(.bottom, 6)
    }

    // MARK: - Kirjaimet (Suomi QWERTY + å, ä, ö)
    private var lettersLayout: some View {
        VStack(spacing: 8) {
            // Rivi 1: q w e r t y u i o p å (11 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 2: a s d f g h j k l ö ä (11 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"], id: \.self) { c in
                    letterKey(c)
                }
            }
            // Rivi 3: Shift, z x c v b n m, Delete
            HStack(spacing: keySpacing) {
                shiftKey
                    .frame(width: 44)
                ForEach(["z", "x", "c", "v", "b", "n", "m"], id: \.self) { c in
                    letterKey(c)
                }
                KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 44)
            }
            // Rivi 4: 123, Globe, Välilyönti, Rivinvaihto
            bottomBar(modeLabel: "123", nextMode: .numbers)
        }
    }

    // MARK: - Numerot
    private var numbersLayout: some View {
        VStack(spacing: 8) {
            // Rivi 1
            HStack(spacing: keySpacing) {
                ForEach(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], id: \.self) { c in
                    numberKey(c)
                }
            }
            // Rivi 2
            HStack(spacing: keySpacing) {
                ForEach(["-", "/", ":", ";", "(", ")", "€", "&", "@", "\""], id: \.self) { c in
                    numberKey(c)
                }
            }
            // Rivi 3
            HStack(spacing: keySpacing) {
                KeyButtonView(item: KeyItem(label: "#+=", action: .switchMode(.symbols), isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 44)
                ForEach([".", ",", "?", "!", "'"], id: \.self) { c in
                    numberKey(c)
                }
                KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 44)
            }
            // Rivi 4
            bottomBar(modeLabel: "ABC", nextMode: .letters)
        }
    }

    // MARK: - Symbolit
    private var symbolsLayout: some View {
        VStack(spacing: 8) {
            // Rivi 1
            HStack(spacing: keySpacing) {
                ForEach(["[", "]", "{", "}", "#", "%", "^", "*", "+", "="], id: \.self) { c in
                    numberKey(c)
                }
            }
            // Rivi 2
            HStack(spacing: keySpacing) {
                ForEach(["_", "\\", "|", "~", "<", ">", "$", "£", "¥", "•"], id: \.self) { c in
                    numberKey(c)
                }
            }
            // Rivi 3
            HStack(spacing: keySpacing) {
                KeyButtonView(item: KeyItem(label: "123", action: .switchMode(.numbers), isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 44)
                ForEach([".", ",", "?", "!", "`"], id: \.self) { c in
                    numberKey(c)
                }
                KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: 44)
            }
            // Rivi 4
            bottomBar(modeLabel: "ABC", nextMode: .letters)
        }
    }

    private func bottomBar(modeLabel: String, nextMode: KeyboardMode) -> some View {
        HStack(spacing: keySpacing) {
            KeyButtonView(item: KeyItem(label: modeLabel, action: .switchMode(nextMode), isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: 44)
            KeyButtonView(item: KeyItem(label: "", action: .globe, systemImage: "globe", isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: 40)
            KeyButtonView(item: KeyItem(label: "välilyönti", action: .space, isSpecial: false), height: rowHeight, onAction: onAction)
            KeyButtonView(item: KeyItem(label: "syötä", action: .returnKey, isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: 74)
        }
    }

    private func letterKey(_ char: String) -> some View {
        let text = formatChar(char)
        return KeyButtonView(item: KeyItem(label: text, action: .character(text), isSpecial: false), height: rowHeight, onAction: onAction)
    }

    private func numberKey(_ char: String) -> some View {
        KeyButtonView(item: KeyItem(label: char, action: .character(char), isSpecial: false), height: rowHeight, onAction: onAction)
    }

    private var shiftKey: some View {
        let img = shiftState == .capsLock ? "capslock.fill" : (shiftState == .shift ? "shift.fill" : "shift")
        return KeyButtonView(item: KeyItem(label: "", action: .shift, systemImage: img, isSpecial: true), height: rowHeight, onAction: onAction)
    }
}
