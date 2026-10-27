import SwiftUI
import UIKit

/// Yksittäinen näppäinpainike natiivilla ulkoasulla, esikatselukuplalla ja
/// pitkän painalluksen vaihtoehtoisten merkkien popoverilla (IOSKEYBOARD-TUNTUMA).
public struct KeyButtonView: View {
    public let item: KeyItem
    public let height: CGFloat
    public let onAction: (KeyAction) -> Void

    @Environment(\.colorScheme) private var colorScheme
    @State private var isPressed: Bool = false
    @State private var showPopover: Bool = false
    @State private var selectedAlternateIndex: Int? = nil
    @State private var repeatTimer: Timer? = nil
    @State private var longPressTimer: Timer? = nil

    public init(item: KeyItem, height: CGFloat, onAction: @escaping (KeyAction) -> Void) {
        self.item = item
        self.height = height
        self.onAction = onAction
    }

    private var isDark: Bool { colorScheme == .dark }

    private var normalBackgroundColor: Color {
        if item.isSpecial {
            return isDark ? Color(uiColor: UIColor(white: 0.28, alpha: 1.0)) : Color(uiColor: UIColor(white: 0.68, alpha: 1.0))
        } else {
            return isDark ? Color(uiColor: UIColor(white: 0.42, alpha: 1.0)) : Color.white
        }
    }

    private var pressedBackgroundColor: Color {
        if item.isSpecial {
            return isDark ? Color(uiColor: UIColor(white: 0.42, alpha: 1.0)) : Color.white
        } else {
            return isDark ? Color(uiColor: UIColor(white: 0.28, alpha: 1.0)) : Color(uiColor: UIColor(white: 0.78, alpha: 1.0))
        }
    }

    private var foregroundColor: Color {
        isDark ? Color.white : Color.black
    }

    private var shadowColor: Color {
        isDark ? Color.black.opacity(0.5) : Color(uiColor: UIColor(white: 0.55, alpha: 1.0))
    }

    private var alternates: [String] {
        if let custom = item.customAlternates {
            return custom
        }
        return AlternateCharacters.alternates(for: item.label)
    }

    private var popoverAlignment: Alignment {
        let l = item.label.lowercased()
        if ["q", "a", "z", "1", "["].contains(l) {
            return .topLeading
        } else if ["å", "ä", "p", "0", "="].contains(l) {
            return .topTrailing
        }
        return .top
    }

    public var body: some View {
        GeometryReader { geo in
            let keyWidth = geo.size.width

            ZStack {
                RoundedRectangle(cornerRadius: 5, style: .continuous)
                    .fill(isPressed ? pressedBackgroundColor : normalBackgroundColor)
                    .shadow(color: shadowColor, radius: 0, x: 0, y: isPressed ? 0 : 1)

                if let systemImage = item.systemImage {
                    Image(systemName: systemImage)
                        .font(.system(size: 16, weight: .regular))
                        .foregroundStyle(foregroundColor)
                } else {
                    Text(item.label)
                        .font(item.label.count == 1 ? .system(size: 20, weight: .regular) : .system(size: 15, weight: .regular))
                        .foregroundStyle(foregroundColor)
                }
            }
            .frame(width: keyWidth, height: height)
            .overlay(alignment: popoverAlignment) {
                if showPopover && !alternates.isEmpty {
                    KeyPopoverView(items: alternates, selectedIndex: selectedAlternateIndex)
                        .fixedSize()
                        .offset(y: -(height + 12))
                        .zIndex(200)
                } else if isPressed && !item.isSpecial && item.label.count == 1 {
                    KeyPreviewCallout(label: item.label, isDark: isDark)
                        .fixedSize()
                        .offset(y: -(height + 10))
                        .zIndex(150)
                }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        handleTouchDown(at: value.location, keyWidth: keyWidth)
                    }
                    .onEnded { value in
                        handleTouchUp(at: value.location, keyWidth: keyWidth)
                    }
            )
        }
        .frame(height: height)
        .zIndex(showPopover ? 200 : (isPressed ? 100 : 1))
        .accessibilityElement(children: .combine)
        .accessibilityLabel(item.label.isEmpty ? (item.systemImage ?? "key") : item.label)
        .accessibilityIdentifier(item.systemImage ?? "key-\(item.label)")
        .accessibilityAddTraits(.isButton)
    }

    // MARK: - Kosketuslogiikka

    private func handleTouchDown(at location: CGPoint, keyWidth: CGFloat) {
        if !isPressed {
            isPressed = true

            switch item.action {
            case .delete:
                KeyboardFeedback.shared.trigger(.delete)
                onAction(.delete)
                startRepeat()
            case .shift, .switchMode, .globe:
                KeyboardFeedback.shared.trigger(.modifier)
                onAction(item.action)
            case .moveCursor:
                KeyboardFeedback.shared.trigger(.cursor)
                onAction(item.action)
            case .space:
                KeyboardFeedback.shared.trigger(.space)
            case .returnKey:
                KeyboardFeedback.shared.trigger(.returnKey)
            case .character:
                KeyboardFeedback.shared.trigger(.standard)
                if !alternates.isEmpty {
                    startLongPress()
                }
            }
        }

        if showPopover && !alternates.isEmpty {
            updateSelectedAlternate(at: location, keyWidth: keyWidth)
        }
    }

    private func handleTouchUp(at location: CGPoint, keyWidth: CGFloat) {
        stopLongPress()
        stopRepeat()

        if showPopover && !alternates.isEmpty {
            if let idx = selectedAlternateIndex, idx >= 0 && idx < alternates.count {
                let chosen = alternates[idx]
                onAction(.character(chosen))
                KeyboardFeedback.shared.trigger(.standard)
            } else {
                onAction(item.action)
            }
            showPopover = false
            selectedAlternateIndex = nil
        } else if isPressed {
            // Tavallisen painalluksen toiminto nostettaessa
            switch item.action {
            case .character, .space, .returnKey:
                onAction(item.action)
            default:
                break // Erikoistoiminnot laukaistiin jo painettaessa
            }
        }

        isPressed = false
    }

    // MARK: - Vaihtoehtojen valinta liukumalla

    private func updateSelectedAlternate(at location: CGPoint, keyWidth: CGFloat) {
        let count = alternates.count
        guard count > 0 else { return }

        let itemWidth: CGFloat = 34.0
        let totalPopoverWidth = CGFloat(count) * itemWidth + 8.0

        let startX: CGFloat
        switch popoverAlignment {
        case .topLeading:
            startX = 0
        case .topTrailing:
            startX = keyWidth - totalPopoverWidth
        default:
            startX = (keyWidth - totalPopoverWidth) / 2.0
        }

        let relX = location.x - startX - 4.0
        let idx = Int(floor(relX / itemWidth))

        if idx >= 0 && idx < count {
            if selectedAlternateIndex != idx {
                selectedAlternateIndex = idx
                KeyboardFeedback.shared.trigger(.popoverSelection)
            }
        } else {
            selectedAlternateIndex = nil
        }
    }

    // MARK: - Ajastimet

    private func startLongPress() {
        stopLongPress()
        longPressTimer = Timer.scheduledTimer(withTimeInterval: 0.35, repeats: false) { _ in
            showPopover = true
            selectedAlternateIndex = nil
            KeyboardFeedback.shared.trigger(.popoverTrigger)
        }
    }

    private func stopLongPress() {
        longPressTimer?.invalidate()
        longPressTimer = nil
    }

    private func startRepeat() {
        stopRepeat()
        repeatTimer = Timer.scheduledTimer(withTimeInterval: 0.4, repeats: false) { _ in
            KeyboardFeedback.shared.trigger(.delete)
            onAction(item.action)
            repeatTimer = Timer.scheduledTimer(withTimeInterval: 0.08, repeats: true) { _ in
                KeyboardFeedback.shared.trigger(.delete)
                onAction(item.action)
            }
        }
    }

    private func stopRepeat() {
        repeatTimer?.invalidate()
        repeatTimer = nil
    }
}

/// Natiivi näppäinesikatselu (callout bubble) yksittäiselle kirjaimelle painettaessa.
public struct KeyPreviewCallout: View {
    public let label: String
    public let isDark: Bool

    public var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(isDark ? Color(uiColor: UIColor(white: 0.24, alpha: 1.0)) : Color.white)
                .shadow(color: isDark ? Color.black.opacity(0.6) : Color.black.opacity(0.22), radius: 6, x: 0, y: 3)

            Text(label)
                .font(.system(size: 26, weight: .regular))
                .foregroundStyle(isDark ? Color.white : Color.black)
        }
        .frame(width: 46, height: 48)
    }
}
