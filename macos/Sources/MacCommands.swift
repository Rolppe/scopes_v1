import SwiftUI

public extension Notification.Name {
    static let scopesSuoritaToiminto = Notification.Name("scopesSuoritaToiminto")
    static let scopesUusiSkooppi = Notification.Name("scopesUusiSkooppi")
    static let scopesPaivitaKaikki = Notification.Name("scopesPaivitaKaikki")
    static let scopesToggleInspector = Notification.Name("scopesToggleInspector")
}

public struct MacCommands: Commands {
    public init() {}

    public var body: some Commands {
        SidebarCommands()

        CommandGroup(replacing: .newItem) {
            Button("Uusi skooppi...") {
                NotificationCenter.default.post(name: .scopesUusiSkooppi, object: nil)
            }
            .keyboardShortcut("n", modifiers: [.command])
        }

        CommandMenu("Näkymä") {
            Button("Näytä inspektori") {
                NotificationCenter.default.post(name: .scopesToggleInspector, object: nil)
            }
            .keyboardShortcut("i", modifiers: [.command, .option])
        }

        CommandMenu("Toiminnot") {
            Button("Päivitä (Refresh)") {
                NotificationCenter.default.post(name: .scopesPaivitaKaikki, object: nil)
            }
            .keyboardShortcut("r", modifiers: [.command])

            Divider()

            Button("Pura skooppi") {
                NotificationCenter.default.post(
                    name: .scopesSuoritaToiminto,
                    object: nil,
                    userInfo: ["toiminto": "pura"]
                )
            }
            .keyboardShortcut("p", modifiers: [.command, .shift])

            Button("Pakkaa skooppi") {
                NotificationCenter.default.post(
                    name: .scopesSuoritaToiminto,
                    object: nil,
                    userInfo: ["toiminto": "pakkaa"]
                )
            }
            .keyboardShortcut("k", modifiers: [.command, .shift])

            Button("Automaattisiirto") {
                NotificationCenter.default.post(
                    name: .scopesSuoritaToiminto,
                    object: nil,
                    userInfo: ["toiminto": "automaattisiirto"]
                )
            }
            .keyboardShortcut("s", modifiers: [.command, .shift])

            Divider()

            Button("Pysäytä vastaus (Stop)") {
                NotificationCenter.default.post(
                    name: .scopesSuoritaToiminto,
                    object: nil,
                    userInfo: ["toiminto": "stop"]
                )
            }
            .keyboardShortcut(".", modifiers: [.command])
        }
    }
}
