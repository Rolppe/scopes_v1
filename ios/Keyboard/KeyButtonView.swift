import SwiftUI
import UIKit

/// Callout-esikatselukuplan reunakohdistus (IOSKEYBOARD-TYYLI).
public enum CalloutAlignment: Sendable {
    case leading
    case center
    case trailing
}

/// Yksittäinen näppäinpainike natiivilla ulkoasulla, liukuväreillä, varjostuksilla,
/// callout-esikatselukuplalla ja pitkän painalluksen vaihtoehtoisten merkkien popoverilla (IOSKEYBOARD-TYYLI).
public struct KeyButtonView: View {
    public let item: KeyItem
    public let height: CGFloat
    public let onAction: (KeyAction) -> Void

    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.verticalSizeClass) private var verticalSizeClass
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
    private var isLandscape: Bool { verticalSizeClass == .compact }

    private var isShiftActive: Bool {
        item.action == .shift && (item.systemImage == "shift.fill" || item.systemImage == "capslock.fill")
    }

    // MARK: - Natiivit liukuvärit (IOSKEYBOARD-TYYLI)

    private var normalGradient: LinearGradient {
        if isShiftActive {
            // Aktiivinen Shift / CapsLock on natiivisti aina valkoinen mustalla nuolella
            return LinearGradient(
                colors: [Color.white, Color(uiColor: UIColor(white: 0.95, alpha: 1.0))],
                startPoint: .top,
                endPoint: .bottom
            )
        } else if item.isSpecial {
            return isDark
                ? LinearGradient(
                    colors: [Color(uiColor: UIColor(white: 0.30, alpha: 1.0)), Color(uiColor: UIColor(white: 0.24, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
                : LinearGradient(
                    colors: [Color(uiColor: UIColor(red: 0.71, green: 0.73, blue: 0.77, alpha: 1.0)), Color(uiColor: UIColor(red: 0.65, green: 0.67, blue: 0.71, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
        } else {
            return isDark
                ? LinearGradient(
                    colors: [Color(uiColor: UIColor(white: 0.42, alpha: 1.0)), Color(uiColor: UIColor(white: 0.36, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
                : LinearGradient(
                    colors: [Color.white, Color(uiColor: UIColor(red: 0.96, green: 0.96, blue: 0.97, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
        }
    }

    private var pressedGradient: LinearGradient {
        if isShiftActive {
            return LinearGradient(
                colors: [Color(uiColor: UIColor(white: 0.90, alpha: 1.0)), Color(uiColor: UIColor(white: 0.85, alpha: 1.0))],
                startPoint: .top,
                endPoint: .bottom
            )
        } else if item.isSpecial {
            return isDark
                ? LinearGradient(
                    colors: [Color(uiColor: UIColor(white: 0.44, alpha: 1.0)), Color(uiColor: UIColor(white: 0.38, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
                : LinearGradient(
                    colors: [Color.white, Color(uiColor: UIColor(white: 0.94, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
        } else {
            return isDark
                ? LinearGradient(
                    colors: [Color(uiColor: UIColor(white: 0.26, alpha: 1.0)), Color(uiColor: UIColor(white: 0.20, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
                : LinearGradient(
                    colors: [Color(uiColor: UIColor(red: 0.79, green: 0.81, blue: 0.84, alpha: 1.0)), Color(uiColor: UIColor(red: 0.75, green: 0.77, blue: 0.80, alpha: 1.0))],
                    startPoint: .top,
                    endPoint: .bottom
                )
        }
    }

    private var foregroundColor: Color {
        if isShiftActive {
            return Color.black
        }
        return isDark ? Color.white : Color.black
    }

    private var shadowColor: Color {
        if isDark {
            return Color.black.opacity(0.65)
        } else {
            return item.isSpecial
                ? Color(uiColor: UIColor(white: 0.52, alpha: 1.0))
                : Color(uiColor: UIColor(white: 0.55, alpha: 1.0))
        }
    }

    private var alternates: [String] {
        if let custom = item.customAlternates {
            return custom
        }
        return AlternateCharacters.alternates(for: item.label)
    }

    private var calloutAlignment: CalloutAlignment {
        let l = item.label.lowercased()
        if ["q", "a", "1", "-", "["].contains(l) {
            return .leading
        } else if ["å", "ä", "0", "\"", "="].contains(l) {
            return .trailing
        }
        return .center
    }

    public var body: some View {
        GeometryReader { geo in
            let keyWidth = geo.size.width

            ZStack {
                RoundedRectangle(cornerRadius: 5, style: .continuous)
                    .fill(isPressed ? pressedGradient : normalGradient)
                    .shadow(color: shadowColor, radius: 0, x: 0, y: isPressed ? 0 : 1)
                    .offset(y: isPressed ? 0.5 : 0)

                if let systemImage = item.systemImage {
                    Image(systemName: systemImage)
                        .font(.system(size: 16, weight: .regular))
                        .foregroundStyle(foregroundColor)
                } else {
                    Text(item.label)
                        .font(item.label.count == 1 ? .system(size: 22, weight: .regular) : .system(size: 15, weight: .regular))
                        .foregroundStyle(foregroundColor)
                }
            }
            .frame(width: keyWidth, height: height)
            .overlay(alignment: .topLeading) {
                if showPopover && !alternates.isEmpty {
                    KeyPopoverView(items: alternates, selectedIndex: selectedAlternateIndex)
                        .fixedSize()
                        .offset(x: popoverXOffset(keyWidth: keyWidth), y: -(height + 12))
                        .zIndex(200)
                } else if isPressed && !item.isSpecial && item.label.count == 1 && !isLandscape {
                    let headWidth = max(keyWidth + 20, 56)
                    let xOffset: CGFloat = {
                        switch calloutAlignment {
                        case .leading:
                            return 0
                        case .trailing:
                            return -(headWidth - keyWidth)
                        case .center:
                            return -(headWidth - keyWidth) / 2.0
                        }
                    }()
                    let yOffset = -(46.0 + 10.0) // -(headHeight + neckHeight)

                    KeyPreviewCallout(
                        label: item.label,
                        isDark: isDark,
                        keyWidth: keyWidth,
                        keyHeight: height,
                        alignment: calloutAlignment
                    )
                    .offset(x: xOffset, y: yOffset)
                    .allowsHitTesting(false)
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

    private func popoverXOffset(keyWidth: CGFloat) -> CGFloat {
        let count = alternates.count
        guard count > 0 else { return 0 }
        let totalPopoverWidth = CGFloat(count) * 34.0 + 8.0
        switch calloutAlignment {
        case .leading:
            return 0
        case .trailing:
            return keyWidth - totalPopoverWidth
        case .center:
            return (keyWidth - totalPopoverWidth) / 2.0
        }
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
        switch calloutAlignment {
        case .leading:
            startX = 0
        case .trailing:
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

/// Natiivi iOS-näppäinesikatselun callout-kuplan muoto bezier-kaulalla (IOSKEYBOARD-TYYLI).
public struct KeyCalloutShape: Shape {
    public let keyWidth: CGFloat
    public let keyHeight: CGFloat
    public let alignment: CalloutAlignment
    public let headHeight: CGFloat = 46
    public let neckHeight: CGFloat = 10
    public let headRadius: CGFloat = 10
    public let keyRadius: CGFloat = 5

    public var headWidth: CGFloat { max(keyWidth + 20, 56) }
    public var totalHeight: CGFloat { headHeight + neckHeight + keyHeight }

    public init(keyWidth: CGFloat, keyHeight: CGFloat, alignment: CalloutAlignment = .center) {
        self.keyWidth = keyWidth
        self.keyHeight = keyHeight
        self.alignment = alignment
    }

    public func path(in rect: CGRect) -> Path {
        var path = Path()

        let kLeft: CGFloat
        switch alignment {
        case .leading:
            kLeft = 0
        case .trailing:
            kLeft = headWidth - keyWidth
        case .center:
            kLeft = (headWidth - keyWidth) / 2.0
        }
        let kRight = kLeft + keyWidth

        // 1. Aloitus ylävasemmalta kuplan kulmasta
        path.move(to: CGPoint(x: headRadius, y: 0))

        // 2. Yläreuna
        path.addLine(to: CGPoint(x: headWidth - headRadius, y: 0))

        // 3. Yläoikea pyöristys
        path.addArc(
            tangent1End: CGPoint(x: headWidth, y: 0),
            tangent2End: CGPoint(x: headWidth, y: headRadius),
            radius: headRadius
        )

        // 4. Kuplan oikea reuna alas kaulaan
        path.addLine(to: CGPoint(x: headWidth, y: headHeight - 4))

        // 5. Oikean puolen siirtymä kuplasta näppäimeen
        if alignment == .trailing {
            path.addLine(to: CGPoint(x: kRight, y: totalHeight - keyRadius))
        } else {
            let p2 = CGPoint(x: kRight, y: headHeight + neckHeight + 4)
            let c1 = CGPoint(x: headWidth - 1, y: headHeight + (neckHeight * 0.45))
            let c2 = CGPoint(x: kRight + 2, y: headHeight + (neckHeight * 0.75))
            path.addCurve(to: p2, control1: c1, control2: c2)
            path.addLine(to: CGPoint(x: kRight, y: totalHeight - keyRadius))
        }

        // 6. Näppäimen alaoikea pyöristys
        path.addArc(
            tangent1End: CGPoint(x: kRight, y: totalHeight),
            tangent2End: CGPoint(x: kRight - keyRadius, y: totalHeight),
            radius: keyRadius
        )

        // 7. Näppäimen alareuna
        path.addLine(to: CGPoint(x: kLeft + keyRadius, y: totalHeight))

        // 8. Näppäimen alavasen pyöristys
        path.addArc(
            tangent1End: CGPoint(x: kLeft, y: totalHeight),
            tangent2End: CGPoint(x: kLeft, y: totalHeight - keyRadius),
            radius: keyRadius
        )

        // 9. Vasemman puolen siirtymä näppäimestä kuplaan
        if alignment == .leading {
            path.addLine(to: CGPoint(x: 0, y: headRadius))
        } else {
            path.addLine(to: CGPoint(x: kLeft, y: headHeight + neckHeight + 4))
            let p2 = CGPoint(x: 0, y: headHeight - 4)
            let c1 = CGPoint(x: kLeft - 2, y: headHeight + (neckHeight * 0.75))
            let c2 = CGPoint(x: 1, y: headHeight + (neckHeight * 0.45))
            path.addCurve(to: p2, control1: c1, control2: c2)
            path.addLine(to: CGPoint(x: 0, y: headRadius))
        }

        // 10. Kuplan ylävasen pyöristys
        path.addArc(
            tangent1End: CGPoint(x: 0, y: 0),
            tangent2End: CGPoint(x: headRadius, y: 0),
            radius: headRadius
        )

        path.closeSubpath()
        return path
    }
}

/// Natiivi näppäinesikatselu (callout bubble) yksittäiselle kirjaimelle painettaessa (IOSKEYBOARD-TYYLI).
public struct KeyPreviewCallout: View {
    public let label: String
    public let isDark: Bool
    public var keyWidth: CGFloat
    public var keyHeight: CGFloat
    public var alignment: CalloutAlignment

    public init(
        label: String,
        isDark: Bool,
        keyWidth: CGFloat = 32,
        keyHeight: CGFloat = 42,
        alignment: CalloutAlignment = .center
    ) {
        self.label = label
        self.isDark = isDark
        self.keyWidth = keyWidth
        self.keyHeight = keyHeight
        self.alignment = alignment
    }

    private let headHeight: CGFloat = 46
    private let neckHeight: CGFloat = 10
    private var headWidth: CGFloat { max(keyWidth + 20, 56) }
    private var totalHeight: CGFloat { headHeight + neckHeight + keyHeight }

    private var calloutGradient: LinearGradient {
        isDark
            ? LinearGradient(
                colors: [Color(uiColor: UIColor(white: 0.40, alpha: 1.0)), Color(uiColor: UIColor(white: 0.34, alpha: 1.0))],
                startPoint: .top,
                endPoint: .bottom
            )
            : LinearGradient(
                colors: [Color.white, Color(uiColor: UIColor(red: 0.97, green: 0.97, blue: 0.98, alpha: 1.0))],
                startPoint: .top,
                endPoint: .bottom
            )
    }

    private var shadowColor: Color {
        isDark ? Color.black.opacity(0.60) : Color.black.opacity(0.22)
    }

    public var body: some View {
        ZStack(alignment: .top) {
            KeyCalloutShape(
                keyWidth: keyWidth,
                keyHeight: keyHeight,
                alignment: alignment
            )
            .fill(calloutGradient)
            .shadow(color: shadowColor, radius: 6, x: 0, y: 3)

            Text(label)
                .font(.system(size: 32, weight: .regular))
                .foregroundStyle(isDark ? Color.white : Color.black)
                .frame(width: headWidth, height: headHeight)
        }
        .frame(width: headWidth, height: totalHeight)
    }
}
