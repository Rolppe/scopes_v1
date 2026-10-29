import SwiftUI
import ScopesCore

@main
struct ScopesMacApp: App {
    var body: some Scene {
        WindowGroup {
            MacRootView()
        }
        .commands {
            MacCommands()
        }

        Settings {
            MacSettingsView()
        }

        MenuBarExtra("Scopes", systemImage: "sparkles") {
            MacMenuBar()
        }
    }
}
