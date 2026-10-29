import Foundation

/// Wire-kehysprotokollan virheet
public enum TerminalWireFrameError: LocalizedError, Equatable {
    case emptyFrame
    case unknownChannel(Character)
    case invalidUtf8
    case invalidJson(String)

    public var errorDescription: String? {
        switch self {
        case .emptyFrame:
            return "Tyhjä kehys"
        case .unknownChannel(let ch):
            return "Tuntematon kanavatunnus: \(ch)"
        case .invalidUtf8:
            return "Virheellinen UTF-8-merkkijono"
        case .invalidJson(let msg):
            return "Virheellinen JSON ohjauskehyksessä: \(msg)"
        }
    }
}

/// Jäsennelty kehys
public enum TerminalFrame: Equatable, Sendable {
    case data(Data)
    case control(TerminalControlMessage)
    case heartbeat
}

/// 1-tavuinen kanavointikehys Scopes Etäterminaalille:
/// - '0' (0x30): Raaka PTY I/O -data (teksti tai binääri)
/// - '1' (0x31): JSON-ohjausviesti (resize, signal, ready, exit, error)
/// - '2' (0x32): Heartbeat Ping / Pong
public struct TerminalWireFrame: Sendable {
    public static let channelDataChar: Character = "0"
    public static let channelControlChar: Character = "1"
    public static let channelHeartbeatChar: Character = "2"

    public static let channelDataByte: UInt8 = 0x30
    public static let channelControlByte: UInt8 = 0x31
    public static let channelHeartbeatByte: UInt8 = 0x32

    /// Koodaa tekstimuotoinen PTY-syöte kanavalla '0'
    public static func encodeData(_ text: String) -> String {
        return "0" + text
    }

    /// Koodaa binäärimuotoinen PTY-syöte kanavalla '0'
    public static func encodeData(_ bytes: Data) -> Data {
        var d = Data([channelDataByte])
        d.append(bytes)
        return d
    }

    /// Koodaa ohjausviesti JSON-muotoon kanavalla '1'
    public static func encodeControl(_ message: TerminalControlMessage) throws -> String {
        let json = try JSONEncoder().encode(message)
        guard let str = String(data: json, encoding: .utf8) else {
            throw TerminalWireFrameError.invalidUtf8
        }
        return "1" + str
    }

    /// Palauttaa elossapitoviestin '2'
    public static func ping() -> String {
        return "2"
    }

    /// Purkaa tekstimuotoinen kehys
    public static func decodeFrame(_ text: String) throws -> TerminalFrame {
        guard let first = text.first else {
            throw TerminalWireFrameError.emptyFrame
        }
        let payload = String(text.dropFirst())

        switch first {
        case channelDataChar:
            let data = Data(payload.utf8)
            return .data(data)
        case channelControlChar:
            guard let jsonData = payload.data(using: .utf8) else {
                throw TerminalWireFrameError.invalidUtf8
            }
            do {
                let msg = try JSONDecoder().decode(TerminalControlMessage.self, from: jsonData)
                return .control(msg)
            } catch {
                throw TerminalWireFrameError.invalidJson(error.localizedDescription)
            }
        case channelHeartbeatChar:
            return .heartbeat
        default:
            throw TerminalWireFrameError.unknownChannel(first)
        }
    }

    /// Purkaa binäärimuotoinen kehys
    public static func decodeFrame(_ data: Data) throws -> TerminalFrame {
        guard let firstByte = data.first else {
            throw TerminalWireFrameError.emptyFrame
        }
        let payload = data.dropFirst()

        switch firstByte {
        case channelDataByte:
            return .data(Data(payload))
        case channelControlByte:
            do {
                let msg = try JSONDecoder().decode(TerminalControlMessage.self, from: Data(payload))
                return .control(msg)
            } catch {
                throw TerminalWireFrameError.invalidJson(error.localizedDescription)
            }
        case channelHeartbeatByte:
            return .heartbeat
        default:
            let ch = Character(UnicodeScalar(firstByte))
            throw TerminalWireFrameError.unknownChannel(ch)
        }
    }
}
