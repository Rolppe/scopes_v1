import XCTest
@testable import ScopesRemoteTerminal

final class TerminalAccessoryBarTests: XCTestCase {
    func testAccessoryKeySequences() {
        XCTAssertEqual(TerminalAccessoryKey.esc.sequence, "\u{1B}")
        XCTAssertEqual(TerminalAccessoryKey.tab.sequence, "\t")
        XCTAssertEqual(TerminalAccessoryKey.arrowUp.sequence, "\u{1B}[A")
        XCTAssertEqual(TerminalAccessoryKey.arrowDown.sequence, "\u{1B}[B")
        XCTAssertEqual(TerminalAccessoryKey.arrowLeft.sequence, "\u{1B}[D")
        XCTAssertEqual(TerminalAccessoryKey.arrowRight.sequence, "\u{1B}[C")
        XCTAssertEqual(TerminalAccessoryKey.ctrlC.sequence, "\u{03}")
        XCTAssertEqual(TerminalAccessoryKey.ctrlD.sequence, "\u{04}")
        XCTAssertEqual(TerminalAccessoryKey.ctrlL.sequence, "\u{0C}")
        XCTAssertNil(TerminalAccessoryKey.ctrl.sequence)
        XCTAssertNil(TerminalAccessoryKey.alt.sequence)
    }

    func testModifierAttributes() {
        XCTAssertTrue(TerminalAccessoryKey.ctrl.isModifier)
        XCTAssertTrue(TerminalAccessoryKey.alt.isModifier)
        XCTAssertFalse(TerminalAccessoryKey.esc.isModifier)
        XCTAssertFalse(TerminalAccessoryKey.tab.isModifier)
        XCTAssertFalse(TerminalAccessoryKey.arrowUp.isModifier)
    }

    func testProcessInputCharWithModifiers() {
        let url = URL(string: "http://127.0.0.1:8798")!
        let config = TerminalConnection.Configuration(baseURL: url)
        let connection = TerminalConnection(configuration: config)
        let bar = TerminalAccessoryBar(connection: connection)

        // Tavallinen merkki
        XCTAssertEqual(bar.processInputChar("a"), "a")
    }
}
