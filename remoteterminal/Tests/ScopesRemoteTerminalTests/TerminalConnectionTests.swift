import XCTest
@testable import ScopesRemoteTerminal

final class TerminalConnectionTests: XCTestCase {
    func testConfigurationDefaults() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(
            baseURL: url,
            authToken: "test-token"
        )

        XCTAssertEqual(config.defaultCols, 80)
        XCTAssertEqual(config.defaultRows, 24)
        XCTAssertEqual(config.autoReconnect, true)
        XCTAssertEqual(config.reconnectDelay, 3.0)
        XCTAssertEqual(config.heartbeatInterval, 15.0)
        XCTAssertEqual(config.heartbeatTimeout, 30.0)
    }

    func testInitialConnectionState() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let connection = TerminalConnection(configuration: config)

        XCTAssertEqual(connection.state, .disconnected)
        XCTAssertEqual(connection.isReady, false)
        XCTAssertEqual(connection.cols, 80)
        XCTAssertEqual(connection.rows, 24)
    }

    func testResizeUpdatesProperties() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let connection = TerminalConnection(configuration: config)

        connection.resize(cols: 140, rows: 45)
        XCTAssertEqual(connection.cols, 140)
        XCTAssertEqual(connection.rows, 45)
    }

    func testConnectionStateDescriptions() {
        XCTAssertEqual(TerminalConnectionState.disconnected.description, "Yhteys katkaistu")
        XCTAssertEqual(TerminalConnectionState.connecting.description, "Yhdistetään...")
        XCTAssertEqual(TerminalConnectionState.connected.description, "Yhdistetty")
        XCTAssertEqual(TerminalConnectionState.reconnecting(attempt: 2).description, "Yhdistetään uudelleen (yritys 2)...")
        XCTAssertEqual(TerminalConnectionState.failed("Timeout").description, "Yhteysvirhe: Timeout")
        XCTAssertEqual(TerminalConnectionState.closed(exitCode: 0, signal: nil).description, "Istunto päättynyt koodilla 0")
        XCTAssertEqual(TerminalConnectionState.closed(exitCode: nil, signal: "SIGTERM").description, "Istunto päättynyt signaalilla SIGTERM")
    }
}
