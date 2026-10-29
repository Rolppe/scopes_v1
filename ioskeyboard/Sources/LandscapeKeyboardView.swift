import SwiftUI

public struct LandscapeKeyboardView: View {
    public let shiftState: ShiftState
    public let mode: KeyboardMode
    public var safeAreaInsets: EdgeInsets
    public let onAction: (KeyAction) -> Void

    private let rowHeight: CGFloat = 34
    private let keySpacing: CGFloat = 5
    private let columnPadding: CGFloat = 8
    private let centerWidth: CGFloat = 84

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
            let leadingPadding = max(safeAreaInsets.leading, geo.safeAreaInsets.leading, 12)
            let trailingPadding = max(safeAreaInsets.trailing, geo.safeAreaInsets.trailing, 12)
            let bottomPadding = max(safeAreaInsets.bottom, geo.safeAreaInsets.bottom, 6)
            let topPadding: CGFloat = 4

            let totalWidth = max(0, geo.size.width - leadingPadding - trailingPadding)
            let availableForWings = max(0, totalWidth - centerWidth - (columnPadding * 2.0))

            // Vasemmassa siivessä 5 näppäintä (4 väliä), oikeassa 6 näppäintä (5 väliä) -> yhteensä 11 näppäintä ja 9 väliä
            let keyWidth = max(24.0, (availableForWings - (9.0 * keySpacing)) / 11.0)
            let leftWidth = (5.0 * keyWidth) + (4.0 * keySpacing)
            let rightWidth = (6.0 * keyWidth) + (5.0 * keySpacing)
            let centerKeyWidth = (centerWidth - keySpacing) / 2.0

            HStack(alignment: .top, spacing: columnPadding) {
                // 1. Vasen peukalolohko (5 näppäimen sarakerakenne)
                leftWing(keyWidth: keyWidth)
                    .frame(width: leftWidth)

                // 2. Keskialue: Kaksi vierekkäistä pystyriviä koodaus- ja nuolinäppäimille
                centerColumns(keyWidth: centerKeyWidth)
                    .frame(width: centerWidth)

                // 3. Oikea peukalolohko (6 näppäimen sarakerakenne)
                rightWing(keyWidth: keyWidth)
                    .frame(width: rightWidth)
            }
            .frame(width: totalWidth, alignment: .top)
            .padding(.leading, leadingPadding)
            .padding(.trailing, trailingPadding)
            .padding(.top, topPadding)
            .padding(.bottom, bottomPadding)
        }
    }

    // MARK: - Vasen siipi
    private func leftWing(keyWidth: CGFloat) -> some View {
        VStack(spacing: keySpacing) {
            switch mode {
            case .letters:
                // Rivi 1
                HStack(spacing: keySpacing) {
                    ForEach(["q", "w", "e", "r", "t"], id: \.self) { c in
                        letterKey(c, width: keyWidth)
                    }
                }
                // Rivi 2
                HStack(spacing: keySpacing) {
                    ForEach(["a", "s", "d", "f", "g"], id: \.self) { c in
                        letterKey(c, width: keyWidth)
                    }
                }
                // Rivi 3
                HStack(spacing: keySpacing) {
                    shiftKey(width: keyWidth)
                    ForEach(["z", "x", "c", "v"], id: \.self) { c in
                        letterKey(c, width: keyWidth)
                    }
                }
                // Rivi 4
                bottomBarLeft(modeLabel: "123", nextMode: .numbers, keyWidth: keyWidth)

            case .numbers:
                // Rivi 1
                HStack(spacing: keySpacing) {
                    ForEach(["1", "2", "3", "4", "5"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 2
                HStack(spacing: keySpacing) {
                    ForEach([";", "(", ")", "€", "&"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 3
                HStack(spacing: keySpacing) {
                    KeyButtonView(item: KeyItem(label: "#+=", action: .switchMode(.symbols), isSpecial: true), height: rowHeight, onAction: onAction)
                        .frame(width: keyWidth)
                    ForEach([".", ",", "?", "!"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 4
                bottomBarLeft(modeLabel: "ABC", nextMode: .letters, keyWidth: keyWidth)

            case .symbols:
                // Rivi 1
                HStack(spacing: keySpacing) {
                    ForEach(["[", "]", "{", "}", "#"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 2
                HStack(spacing: keySpacing) {
                    ForEach(["\\", "|", "~", "<", ">"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 3
                HStack(spacing: keySpacing) {
                    KeyButtonView(item: KeyItem(label: "123", action: .switchMode(.numbers), isSpecial: true), height: rowHeight, onAction: onAction)
                        .frame(width: keyWidth)
                    ForEach([".", ",", "?", "!"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 4
                bottomBarLeft(modeLabel: "ABC", nextMode: .letters, keyWidth: keyWidth)
            }
        }
    }

    private func bottomBarLeft(modeLabel: String, nextMode: KeyboardMode, keyWidth: CGFloat) -> some View {
        HStack(spacing: keySpacing) {
            KeyButtonView(item: KeyItem(label: modeLabel, action: .switchMode(nextMode), isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: keyWidth)
            KeyButtonView(item: KeyItem(label: "", action: .globe, systemImage: "globe", isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: keyWidth)
            KeyButtonView(item: KeyItem(label: "välilyönti", action: .space, isSpecial: false), height: rowHeight, onAction: onAction)
                .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Keskialueen kaksi pystyriviä (käyttäjä 26.10.2026)
    private func centerColumns(keyWidth: CGFloat) -> some View {
        VStack(spacing: keySpacing) {
            // Rivi 1: / ja `
            HStack(spacing: keySpacing) {
                specialActionKey("/", .character("/"), width: keyWidth)
                specialActionKey("`", .character("`"), width: keyWidth)
            }
            // Rivi 2: : ja -
            HStack(spacing: keySpacing) {
                specialActionKey(":", .character(":"), width: keyWidth)
                specialActionKey("-", .character("-"), width: keyWidth)
            }
            // Rivi 3: " ja _
            HStack(spacing: keySpacing) {
                specialActionKey("\"", .character("\""), width: keyWidth)
                specialActionKey("_", .character("_"), width: keyWidth)
            }
            // Rivi 4: ◀ ja ▶
            HStack(spacing: keySpacing) {
                specialActionKey("◀", .moveCursor(-1), systemImage: "arrow.left", width: keyWidth)
                specialActionKey("▶", .moveCursor(1), systemImage: "arrow.right", width: keyWidth)
            }
        }
    }

    // MARK: - Oikea siipi
    private func rightWing(keyWidth: CGFloat) -> some View {
        VStack(spacing: keySpacing) {
            switch mode {
            case .letters:
                // Rivi 1
                HStack(spacing: keySpacing) {
                    ForEach(["y", "u", "i", "o", "p", "å"], id: \.self) { c in
                        letterKey(c, width: keyWidth)
                    }
                }
                // Rivi 2
                HStack(spacing: keySpacing) {
                    ForEach(["h", "j", "k", "l", "ö", "ä"], id: \.self) { c in
                        letterKey(c, width: keyWidth)
                    }
                }
                // Rivi 3: b, n, m, ,, . ja delete (tasaleveydet)
                HStack(spacing: keySpacing) {
                    ForEach(["b", "n", "m", ",", "."], id: \.self) { c in
                        letterKey(c, width: keyWidth)
                    }
                    KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                        .frame(width: keyWidth)
                }
                // Rivi 4
                bottomBarRight(keyWidth: keyWidth)

            case .numbers:
                // Rivi 1
                HStack(spacing: keySpacing) {
                    ForEach(["6", "7", "8", "9", "0", "å"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 2
                HStack(spacing: keySpacing) {
                    ForEach(["@", "%", "*", "+", "=", "ä"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 3: ', $, ö, -, / ja delete
                HStack(spacing: keySpacing) {
                    ForEach(["'", "$", "ö", "-", "/"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                    KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                        .frame(width: keyWidth)
                }
                // Rivi 4
                bottomBarRight(keyWidth: keyWidth)

            case .symbols:
                // Rivi 1
                HStack(spacing: keySpacing) {
                    ForEach(["%", "^", "*", "+", "=", "•"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 2
                HStack(spacing: keySpacing) {
                    ForEach(["$", "£", "¥", "•", "°", "§"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                }
                // Rivi 3: ≠, ±, ≈, –, — ja delete
                HStack(spacing: keySpacing) {
                    ForEach(["≠", "±", "≈", "–", "—"], id: \.self) { c in
                        symbolKey(c, width: keyWidth)
                    }
                    KeyButtonView(item: KeyItem(label: "", action: .delete, systemImage: "delete.left", isSpecial: true), height: rowHeight, onAction: onAction)
                        .frame(width: keyWidth)
                }
                // Rivi 4
                bottomBarRight(keyWidth: keyWidth)
            }
        }
    }

    private func bottomBarRight(keyWidth: CGFloat) -> some View {
        let returnWidth = (2.0 * keyWidth) + keySpacing
        return HStack(spacing: keySpacing) {
            KeyButtonView(item: KeyItem(label: "välilyönti", action: .space, isSpecial: false), height: rowHeight, onAction: onAction)
                .frame(maxWidth: .infinity)
            KeyButtonView(item: KeyItem(label: "syötä", action: .returnKey, isSpecial: true), height: rowHeight, onAction: onAction)
                .frame(width: returnWidth)
        }
    }

    private func letterKey(_ char: String, width: CGFloat) -> some View {
        let text = formatChar(char)
        return KeyButtonView(item: KeyItem(label: text, action: .character(text), isSpecial: false), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }

    private func symbolKey(_ char: String, width: CGFloat) -> some View {
        KeyButtonView(item: KeyItem(label: char, action: .character(char), isSpecial: false), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }

    private func specialActionKey(_ label: String, _ action: KeyAction, systemImage: String? = nil, width: CGFloat) -> some View {
        KeyButtonView(item: KeyItem(label: label, action: action, systemImage: systemImage, isSpecial: true), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }

    private func shiftKey(width: CGFloat) -> some View {
        let img = shiftState == .capsLock ? "capslock.fill" : (shiftState == .shift ? "shift.fill" : "shift")
        return KeyButtonView(item: KeyItem(label: "", action: .shift, systemImage: img, isSpecial: true), height: rowHeight, onAction: onAction)
            .frame(width: width)
    }
}
