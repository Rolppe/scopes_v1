import SwiftUI

#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

/// Terminaalinäkymän visuaaliset teemat ja väriasetukset
public struct TerminalTheme: Sendable, Equatable, Hashable, Identifiable {
    public var id: String { name }
    public var name: String
    public var backgroundHex: String
    public var foregroundHex: String
    public var cursorHex: String
    public var selectionHex: String

    public init(
        name: String,
        backgroundHex: String,
        foregroundHex: String,
        cursorHex: String,
        selectionHex: String
    ) {
        self.name = name
        self.backgroundHex = backgroundHex
        self.foregroundHex = foregroundHex
        self.cursorHex = cursorHex
        self.selectionHex = selectionHex
    }

    /// Scopes-oletustumma teema (hiilenharmaa tausta, selkeä kontrasti)
    public static let scopesDark = TerminalTheme(
        name: "Scopes Dark",
        backgroundHex: "#121316",
        foregroundHex: "#EDEDED",
        cursorHex: "#0A84FF",
        selectionHex: "#264F78"
    )

    /// Perinteinen xterm-musta
    public static let classicBlack = TerminalTheme(
        name: "Classic Black",
        backgroundHex: "#000000",
        foregroundHex: "#FFFFFF",
        cursorHex: "#00FF00",
        selectionHex: "#444444"
    )

    /// Vaalea teema päiväkäyttöön
    public static let scopesLight = TerminalTheme(
        name: "Scopes Light",
        backgroundHex: "#F8F9FA",
        foregroundHex: "#1C1C1E",
        cursorHex: "#007AFF",
        selectionHex: "#B3D7FF"
    )

    /// Kaikki valmiit teemapresets
    public static let allPresets: [TerminalTheme] = [
        .scopesDark,
        .classicBlack,
        .scopesLight
    ]

    public var backgroundColor: Color {
        Color(terminalHex: backgroundHex) ?? .black
    }

    public var foregroundColor: Color {
        Color(terminalHex: foregroundHex) ?? .white
    }

    public var cursorColor: Color {
        Color(terminalHex: cursorHex) ?? .blue
    }

    public var selectionColor: Color {
        Color(terminalHex: selectionHex) ?? .gray
    }
}

extension Color {
    public init?(terminalHex: String) {
        var cleanHex = terminalHex.trimmingCharacters(in: .whitespacesAndNewlines)
        if cleanHex.hasPrefix("#") {
            cleanHex.removeFirst()
        }
        guard cleanHex.count == 6 || cleanHex.count == 8 else { return nil }
        var rgbValue: UInt64 = 0
        guard Scanner(string: cleanHex).scanHexInt64(&rgbValue) else { return nil }

        if cleanHex.count == 6 {
            let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
            let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
            let b = Double(rgbValue & 0x0000FF) / 255.0
            self.init(red: r, green: g, blue: b)
        } else {
            let r = Double((rgbValue & 0xFF000000) >> 24) / 255.0
            let g = Double((rgbValue & 0x00FF0000) >> 16) / 255.0
            let b = Double((rgbValue & 0x0000FF00) >> 8) / 255.0
            let a = Double(rgbValue & 0x000000FF) / 255.0
            self.init(red: r, green: g, blue: b, opacity: a)
        }
    }
}
