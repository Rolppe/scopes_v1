import SwiftUI

public struct KeyboardRootView: View {
    public weak var controller: KeyboardViewController?

    @State private var shiftState: ShiftState = .off
    @State private var mode: KeyboardMode = .letters
    @Environment(\.verticalSizeClass) private var verticalSizeClass
    @Environment(\.colorScheme) private var colorScheme

    public init(controller: KeyboardViewController? = nil) {
        self.controller = controller
    }

    private var isLandscape: Bool {
        verticalSizeClass == .compact
    }

    private var keyboardBackgroundColor: Color {
        colorScheme == .dark
            ? Color(uiColor: UIColor(white: 0.15, alpha: 1.0))
            : Color(uiColor: UIColor(red: 0.82, green: 0.84, blue: 0.86, alpha: 1.0))
    }

    public var body: some View {
        ZStack {
            keyboardBackgroundColor
                .ignoresSafeArea()

            if isLandscape {
                LandscapeKeyboardView(shiftState: shiftState, mode: mode) { action in
                    handleAction(action)
                }
            } else {
                PortraitKeyboardView(shiftState: shiftState, mode: mode) { action in
                    handleAction(action)
                }
            }
        }
    }

    private func handleAction(_ action: KeyAction) {
        controller?.playClick()
        controller?.playHaptic()

        switch action {
        case .character(let char):
            controller?.insertText(char)
            if shiftState == .shift {
                shiftState = .off
            }
        case .space:
            controller?.insertText(" ")
        case .delete:
            controller?.deleteBackward()
        case .returnKey:
            controller?.insertText("\n")
        case .shift:
            switch shiftState {
            case .off:
                shiftState = .shift
            case .shift:
                shiftState = .capsLock
            case .capsLock:
                shiftState = .off
            }
        case .switchMode(let newMode):
            mode = newMode
        case .globe:
            controller?.advanceToNextInputMode()
        case .moveCursor(let offset):
            controller?.moveCursor(offset: offset)
        }
    }
}
