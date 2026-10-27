import SwiftUI

public struct KeyboardRootView: View {
    public weak var controller: KeyboardViewController?
    @ObservedObject public var state: KeyboardViewState

    @State private var shiftState: ShiftState = .off
    @State private var mode: KeyboardMode = .letters
    @Environment(\.verticalSizeClass) private var verticalSizeClass
    @Environment(\.colorScheme) private var colorScheme

    public init(controller: KeyboardViewController? = nil, state: KeyboardViewState? = nil) {
        self.controller = controller
        self.state = state ?? controller?.state ?? KeyboardViewState()
    }

    private var isLandscape: Bool {
        // 1. iPhone-laitteilla pystytilan verticalSizeClass on aina .regular ja vaakatilan .compact
        if verticalSizeClass == .compact {
            return true
        }
        if verticalSizeClass == .regular && UIDevice.current.userInterfaceIdiom != .pad {
            return false
        }
        // 2. iPadilla tai ilman määritettyä kokoluokkaa käytetään ohjaimen/tilan arvoa
        if let controller = controller {
            return controller.isLandscape
        }
        return state.isLandscape
    }

    private var keyboardBackgroundColor: Color {
        colorScheme == .dark
            ? Color(uiColor: UIColor(white: 0.15, alpha: 1.0))
            : Color(uiColor: UIColor(red: 0.82, green: 0.84, blue: 0.86, alpha: 1.0))
    }

    public var body: some View {
        ZStack(alignment: .top) {
            keyboardBackgroundColor
                .ignoresSafeArea()

            if isLandscape {
                LandscapeKeyboardView(shiftState: shiftState, mode: mode, safeAreaInsets: state.safeAreaInsets) { action in
                    handleAction(action)
                }
            } else {
                PortraitKeyboardView(shiftState: shiftState, mode: mode, safeAreaInsets: state.safeAreaInsets) { action in
                    handleAction(action)
                }
            }
        }
    }

    private func handleAction(_ action: KeyAction) {
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
