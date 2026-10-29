import XCTest
@testable import ScopesRemoteTerminal

final class TerminalWireFrameTests: XCTestCase {
    func testDataEncodingAndDecoding() throws {
        let text = "echo 'Hello Scopes!'\r\n"
        let encoded = TerminalWireFrame.encodeData(text)
        XCTAssertTrue(encoded.hasPrefix("0"))
        XCTAssertEqual(encoded, "0" + text)

        let decoded = try TerminalWireFrame.decodeFrame(encoded)
        if case .data(let data) = decoded {
            let decodedText = String(decoding: data, as: UTF8.self)
            XCTAssertEqual(decodedText, text)
        } else {
            XCTFail("Odotettiin .data-kehystä, saatiin \(decoded)")
        }
    }

    func testBinaryDataEncodingAndDecoding() throws {
        let rawBytes = Data([0x1B, 0x5B, 0x32, 0x4A]) // ESC[2J
        let encodedData = TerminalWireFrame.encodeData(rawBytes)
        XCTAssertEqual(encodedData.first, 0x30) // '0'

        let decoded = try TerminalWireFrame.decodeFrame(encodedData)
        if case .data(let data) = decoded {
            XCTAssertEqual(data, rawBytes)
        } else {
            XCTFail("Odotettiin .data-kehystä, saatiin \(decoded)")
        }
    }

    func testControlResizeEncodingAndDecoding() throws {
        let msg = TerminalControlMessage.resize(cols: 120, rows: 36)
        let encoded = try TerminalWireFrame.encodeControl(msg)
        XCTAssertTrue(encoded.hasPrefix("1"))

        let decoded = try TerminalWireFrame.decodeFrame(encoded)
        if case .control(let decodedMsg) = decoded {
            XCTAssertEqual(decodedMsg, msg)
        } else {
            XCTFail("Odotettiin .control-kehystä, saatiin \(decoded)")
        }
    }

    func testControlSignalEncodingAndDecoding() throws {
        let msg = TerminalControlMessage.signal("SIGINT")
        let encoded = try TerminalWireFrame.encodeControl(msg)
        XCTAssertTrue(encoded.hasPrefix("1"))

        let decoded = try TerminalWireFrame.decodeFrame(encoded)
        if case .control(let decodedMsg) = decoded {
            XCTAssertEqual(decodedMsg, msg)
        } else {
            XCTFail("Odotettiin .control-kehystä, saatiin \(decoded)")
        }
    }

    func testControlReadyEncodingAndDecoding() throws {
        let msg = TerminalControlMessage.ready(sessionId: "term-123", tmuxSession: "scopes-dev", cols: 100, rows: 40)
        let encoded = try TerminalWireFrame.encodeControl(msg)
        let decoded = try TerminalWireFrame.decodeFrame(encoded)
        if case .control(let decodedMsg) = decoded {
            XCTAssertEqual(decodedMsg, msg)
        } else {
            XCTFail("Odotettiin .control-kehystä")
        }
    }

    func testControlExitEncodingAndDecoding() throws {
        let msg = TerminalControlMessage.exit(exitCode: 0, signal: nil)
        let encoded = try TerminalWireFrame.encodeControl(msg)
        let decoded = try TerminalWireFrame.decodeFrame(encoded)
        if case .control(let decodedMsg) = decoded {
            XCTAssertEqual(decodedMsg, msg)
        } else {
            XCTFail("Odotettiin .control-kehystä")
        }
    }

    func testPingEncodingAndDecoding() throws {
        let ping = TerminalWireFrame.ping()
        XCTAssertEqual(ping, "2")

        let decoded = try TerminalWireFrame.decodeFrame(ping)
        XCTAssertEqual(decoded, .heartbeat)
    }

    func testInvalidFrames() {
        XCTAssertThrowsError(try TerminalWireFrame.decodeFrame(""))
        XCTAssertThrowsError(try TerminalWireFrame.decodeFrame("9unknown"))
        XCTAssertThrowsError(try TerminalWireFrame.decodeFrame("1{invalid-json"))
    }
}
