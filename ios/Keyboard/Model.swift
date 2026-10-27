import SwiftUI
import UIKit

public enum KeyboardMode: Hashable {
    case letters
    case numbers
    case symbols
}

public enum ShiftState: Hashable {
    case off
    case shift
    case capsLock
}

public enum KeyAction: Hashable {
    case character(String)
    case space
    case delete
    case returnKey
    case shift
    case switchMode(KeyboardMode)
    case globe
    case moveCursor(Int) // -1 vasemmalle, +1 oikealle
}

public struct KeyItem: Identifiable, Hashable {
    public let id: String
    public let label: String
    public let action: KeyAction
    public let systemImage: String?
    public let widthMultiplier: CGFloat
    public let isSpecial: Bool
    public let customAlternates: [String]?

    public init(
        label: String,
        action: KeyAction,
        systemImage: String? = nil,
        widthMultiplier: CGFloat = 1.0,
        isSpecial: Bool = false,
        customAlternates: [String]? = nil
    ) {
        self.id = "\(label)_\(String(describing: action))"
        self.label = label
        self.action = action
        self.systemImage = systemImage
        self.widthMultiplier = widthMultiplier
        self.isSpecial = isSpecial
        self.customAlternates = customAlternates
    }
}

public final class KeyboardViewState: ObservableObject {
    @Published public var isLandscape: Bool
    @Published public var safeAreaInsets: EdgeInsets

    public init(isLandscape: Bool = false, safeAreaInsets: EdgeInsets = EdgeInsets()) {
        self.isLandscape = isLandscape
        self.safeAreaInsets = safeAreaInsets
    }
}
