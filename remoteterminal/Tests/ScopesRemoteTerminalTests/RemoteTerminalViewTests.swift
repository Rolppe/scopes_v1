import XCTest
import SwiftUI
@testable import ScopesRemoteTerminal

final class RemoteTerminalViewTests: XCTestCase {
    @MainActor
    func testViewModelInitializationAndDefaults() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url, authToken: "test-token")
        let viewModel = RemoteTerminalViewModel(configuration: config)

        XCTAssertEqual(viewModel.fontSize, 13.0)
        XCTAssertEqual(viewModel.currentTheme.name, TerminalTheme.scopesDark.name)
        XCTAssertTrue(viewModel.isAccessoryBarVisible)
        XCTAssertTrue(viewModel.sessions.isEmpty)
        XCTAssertNil(viewModel.selectedSession)
        XCTAssertEqual(viewModel.connection.state, .disconnected)
    }

    @MainActor
    func testFontSizeAdjustmentsAndClamping() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let viewModel = RemoteTerminalViewModel(configuration: config)

        viewModel.increaseFontSize(step: 2.0)
        XCTAssertEqual(viewModel.fontSize, 15.0)

        viewModel.decreaseFontSize(step: 5.0)
        XCTAssertEqual(viewModel.fontSize, 10.0)

        // Clamping alaosaan (min 8)
        viewModel.decreaseFontSize(step: 10.0)
        XCTAssertEqual(viewModel.fontSize, 8.0)

        // Clamping yläosaan (max 32)
        viewModel.increaseFontSize(step: 50.0)
        XCTAssertEqual(viewModel.fontSize, 32.0)
    }

    @MainActor
    func testThemeSwitching() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let viewModel = RemoteTerminalViewModel(configuration: config)

        viewModel.setTheme(.classicBlack)
        XCTAssertEqual(viewModel.currentTheme.name, "Classic Black")

        viewModel.setTheme(.scopesLight)
        XCTAssertEqual(viewModel.currentTheme.name, "Scopes Light")
    }

    @MainActor
    func testAccessoryBarToggle() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let viewModel = RemoteTerminalViewModel(configuration: config)

        XCTAssertTrue(viewModel.isAccessoryBarVisible)
        viewModel.toggleAccessoryBar()
        XCTAssertFalse(viewModel.isAccessoryBarVisible)
        viewModel.toggleAccessoryBar()
        XCTAssertTrue(viewModel.isAccessoryBarVisible)
    }

    @MainActor
    func testSessionSelection() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let viewModel = RemoteTerminalViewModel(configuration: config)

        let session = TerminalSessionInfo(
            id: "term-123",
            name: "test-shell",
            type: "tmux",
            tmuxSession: "scopes-test",
            command: "/bin/zsh",
            cols: 100,
            rows: 30,
            attachedClients: 1,
            createdAt: "2026-10-27T10:00:00Z"
        )

        viewModel.selectSession(session)
        XCTAssertEqual(viewModel.selectedSession?.id, "term-123")
        XCTAssertEqual(viewModel.selectedSessionId, "term-123")
        XCTAssertEqual(viewModel.terminalTitle, "test-shell")
    }

    func testTerminalThemeColorHelpers() {
        let dark = TerminalTheme.scopesDark
        XCTAssertEqual(dark.name, "Scopes Dark")
        XCTAssertEqual(dark.backgroundHex, "#121316")

        let presets = TerminalTheme.allPresets
        XCTAssertEqual(presets.count, 3)
        XCTAssertTrue(presets.contains(where: { $0.name == "Classic Black" }))

        // Color(terminalHex:)
        XCTAssertNotNil(Color(terminalHex: "#FFFFFF"))
        XCTAssertNotNil(Color(terminalHex: "000000"))
        XCTAssertNotNil(Color(terminalHex: "#12345678"))
        XCTAssertNil(Color(terminalHex: "invalid"))
    }

    @MainActor
    func testViewInstantiations() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let viewModel = RemoteTerminalViewModel(configuration: config)

        let remoteView = RemoteTerminalView(viewModel: viewModel)
        XCTAssertNotNil(remoteView)

        let picker = TerminalSessionPickerView(viewModel: viewModel)
        XCTAssertNotNil(picker)
    }
}
