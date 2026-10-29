import SwiftUI

public struct PortraitKeyboardView: View {
    public let shiftState: ShiftState
    public let mode: KeyboardMode
    public var safeAreaInsets: EdgeInsets
    public let onAction: (KeyAction) -> Void

    private let rowHeight: CGFloat = 42
    private let keySpacing: CGFloat = 6

    public init(
        shiftState: ShiftState,
        mode: KeyboardMode,
        safeAreaInsets: EdgeInsets = EdgeInsets(),
        onAction: @escaping (KeyAction) -> Void
    ) {
        self.shiftState = shiftState
        self.mode = mode
        self.safeAreaInsets = safeAreaInsets
        self.onAction = onAction
    }

    private var isShifted: Bool {
        shiftState != .off
    }

    private func formatChar(_ char: String) -> String {
        isShifted ? char.uppercased() : char.lowercased()
    }

    public var body: some View {
        GeometryReader { geo in
            let leadingPadding = max(safeAreaInsets.leading, geo.safeAreaInsets.leading, 4)
            let trailingPadding = max(safeAreaInsets.trailing, geo.safeAreaInsets.trailing, 4)
            let bottomPadding = max(safeAreaInsets.bottom, geo.safeAreaInsets.bottom, 6)
            let totalWidth = max(0, geo.size.width - leadingPadding - trailingPadding)

            // 11 näppäintä rivillä (q..å, a..ä)
            let standardKeyWidth = max(24, (totalWidth - (10.0 * keySpacing)) / 11.0)
            // 7 kirjainta rivillä 3 (z..m): kukin standardKeyWidth
            let row3LetterTotal = (7.0 * standardKeyWidth) + (6.0 * keySpacing)
            let sideKeyWidth = max(42.0, (totalWidth - row3LetterTotal - (2.0 * keySpacing)) / 2.0)

            // Numerot ja symbolit: 10 näppäintä rivillä 1 ja 2
            let numKeyWidth = max(24, (totalWidth - (9.0 * keySpacing)) / 10.0)
            let numRow3Total = (5.0 * numKeyWidth) + (4.0 * keySpacing)
            let numSideKeyWidth = max(44.0, (totalWidth - numRow3Total - (2.0 * keySpacing)) / 2.0)

            VStack(spacing: 8) {
                switch mode {
                case .letters:
                    lettersLayout(keyWidth: standardKeyWidth, sideKeyWidth: sideKeyWidth)
                case .numbers:
                    numbersLayout(numKeyWidth: numKeyWidth, sideKeyWidth: numSideKeyWidth, bottomSideWidth: sideKeyWidth)
                case .symbols:
                    symbolsLayout(numKeyWidth: numKeyWidth, sideKeyWidth: numSideKeyWidth, bottomSideWidth: sideKeyWidth)
                }
            }
            .frame(width: totalWidth, alignment: .top)
            .padding(.leading, leadingPadding)
            .padding(.trailing, trailingPadding)
            .padding(.top, 8)
            .padding(.bottom, bottomPadding)
        }
    }

    // MARK: - Kirjaimet (Suomi QWERTY + å, ä, ö)
    private func lettersLayout(keyWidth: CGFloat, sideKeyWidth: CGFloat) -> some View {
        VStack(spacing: 8) {
            // Rivi 1: q w e r t y u i o p å (11 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å"], id: \.self) { c in
                    letterKey(c, width: keyWidth)
                }
            }
            // Rivi 2: a s d f g h j k l ö ä (11 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"], id: \.self) { c in
                    letterKey(c, width: keyWidth)
                }
            }
            // Rivi 3: Shift, z x c v b n m, Delete
            HStack(spacing: keySpacing) {
                shiftKey(width: sideKeyWidth)
                ForEach(["z", "x", "c", "v", "b", "n", "m"], id: \.self) { c in
                    letterKey(c, width: keyWidth)
                }
                KeyButtonView(
                    item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true),
                    height: rowHeight,
                    onAction: onAction
                )
                .frame(width: sideKeyWidth)
            }
            // Rivi 4: 123, Globe, Välilyönti, Syötä
            bottomBar(modeLabel: "123", nextMode: .numbers, sideWidth: sideKeyWidth)
        }
    }

    // MARK: - Numerot
    private func numbersLayout(numKeyWidth: CGFloat, sideKeyWidth: CGFloat, bottomSideWidth: CGFloat) -> some View {
        VStack(spacing: 8) {
            // Rivi 1: 1 2 3 4 5 6 7 8 9 0 (10 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], id: \.self) { c in
                    numberKey(c, width: numKeyWidth)
                }
            }
            // Rivi 2: - / : ; ( ) € & @ " (10 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["-", "/", ":", ";", "(", ")", "€", "&", "@", "\""], id: \.self) { c in
                    numberKey(c, width: numKeyWidth)
                }
            }
            // Rivi 3: #+=, . , ? ! ', Delete
            HStack(spacing: keySpacing) {
                KeyButtonView(item: KeyItem(label: "#+=", action: .switchMode(.symbols), isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: sideKeyWidth)
                ForEach([".", ",", "?", "!", "'"], id: \.self) { c in
                    numberKey(c, width: numKeyWidth)
                }
                KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: sideKeyWidth)
            }
            // Rivi 4
            bottomBar(modeLabel: "ABC", nextMode: .letters, sideWidth: bottomSideWidth)
        }
    }

    // MARK: - Symbolit
    private func symbolsLayout(numKeyWidth: CGFloat, sideKeyWidth: CGFloat, bottomSideWidth: CGFloat) -> some View {
        VStack(spacing: 8) {
            // Rivi 1: [ ] { } # % ^ * + = (10 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["[", "]", "{", "}", "#", "%", "^", "*", "+", "="], id: \.self) { c in
                    numberKey(c, width: numKeyWidth)
                }
            }
            // Rivi 2: _ \ | ~ < > $ £ ¥ • (10 näppäintä)
            HStack(spacing: keySpacing) {
                ForEach(["_", "\\", "|", "~", "<", ">", "$", "£", "¥", "•"], id: \.self) { c in
                    numberKey(c, width: numKeyWidth)
                }
            }
            // Rivi 3: 123, . , ? ! `, Delete
            HStack(spacing: keySpacing) {
                KeyButtonView(item: KeyItem(label: "123", action: .switchMode(.numbers), isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: sideKeyWidth)
                ForEach([".", ",", "?", "!", "`"], id: \.self) { c in
                    numberKey(c, width: numKeyWidth)
                }
                KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                    .frame(width: sideKeyWidth)
            }
            // Rivi 4
            bottomBar(modeLabel: "ABC", nextMode: .letters, sideWidth: bottomSideWidth)
        }
    }

    private func bottomBar(modeLabel: String, nextMode: KeyboardMode, sideWidth: CGFloat) -> some View {
        HStack(spacing: keySpacing) {
            KeyButtonView(item: KeyItem(label: modeLabel, action: .switchMode(nextMode), isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: max(44, sideWidth))
            KeyButtonView(item: KeyItem(label: "", action: .globe, systemImage: "globe", isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: 40)
            KeyButtonView(item: KeyItem(label: "välilyönti", action: .space, isSpecial: false), height: rowHeight, onAction: onAction)
                .frame(maxWidth: .infinity)
            KeyButtonView(item: KeyItem(label: "syötä", action: .returnKey, isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: max(74, sideWidth))
        }
    }

    private func letterKey(_ char: String, width: CGFloat) -> some View {
        let text = formatChar(char)
        return KeyButtonView(item: KeyItem(label: text, action: .character(text), isSpecial: false), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }

    private func numberKey(_ char: String, width: CGFloat) -> some View {
        KeyButtonView(item: KeyItem(label: char, action: .character(char), isSpecial: false), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }

    private func shiftKey(width: CGFloat) -> some View {
        let img = shiftState == .capsLock ? "capslock.fill" : (shiftState == .shift ? "shift.fill" : "shift")
        return KeyButtonView(item: KeyItem(label: "", action: .shift, systemImage: img, isSpecial: true), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }
}
