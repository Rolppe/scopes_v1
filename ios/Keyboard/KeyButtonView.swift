import SwiftUI
import UIKit

public struct KeyButtonView: View {
    public let item: KeyItem
    public let height: CGFloat
    public let onAction: (KeyAction) -> Void

    @Environment(\.colorScheme) private var colorScheme
    @State private var isPressed: Bool = false
    @State private var repeatTimer: Timer?

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

    public var body: some View {
        Button(action: {}) {
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
                        .font(item.isSpecial ? .system(size: 15, weight: .regular) : .system(size: 22, weight: .regular))
                        .foregroundStyle(foregroundColor)
                }
            }
            .frame(height: height)
        }
        .buttonStyle(KeyTapButtonStyle(isPressed: $isPressed, onTrigger: {
            onAction(item.action)
        }, onHold: {
            if case .delete = item.action {
                startRepeat()
            }
        }, onRelease: {
            stopRepeat()
        }))
    }

    private func startRepeat() {
        stopRepeat()
        repeatTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            onAction(item.action)
        }
    }

    private func stopRepeat() {
        repeatTimer?.invalidate()
        repeatTimer = nil
    }
}

struct KeyTapButtonStyle: ButtonStyle {
    @Binding var isPressed: Bool
    let onTrigger: () -> Void
    let onHold: () -> Void
    let onRelease: () -> Void

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .onChange(of: configuration.isPressed) { _, pressed in
                isPressed = pressed
                if pressed {
                    onTrigger()
                    onHold()
                } else {
                    onRelease()
                }
            }
    }
}
