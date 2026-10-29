import Foundation

/// Palvelimen etäterminaali-istunnon metatiedot
public struct TerminalSessionInfo: Codable, Identifiable, Sendable, Equatable {
    public let id: String
    public let name: String
    public let type: String
    public let tmuxSession: String?
    public let command: String?
    public let cwd: String?
    public let cols: Int
    public let rows: Int
    public let attachedClients: Int
    public let createdAt: String?
    public let lastActiveAt: String?

    public init(
        id: String,
        name: String,
        type: String = "tmux",
        tmuxSession: String? = nil,
        command: String? = nil,
        cwd: String? = nil,
        cols: Int = 80,
        rows: Int = 24,
        attachedClients: Int = 0,
        createdAt: String? = nil,
        lastActiveAt: String? = nil
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.tmuxSession = tmuxSession
        self.command = command
        self.cwd = cwd
        self.cols = cols
        self.rows = rows
        self.attachedClients = attachedClients
        self.createdAt = createdAt
        self.lastActiveAt = lastActiveAt
    }
}

/// Vastausmalli istuntojen listaukselle GET /api/terminal/sessions
public struct TerminalSessionListResponse: Codable, Sendable, Equatable {
    public let ok: Bool
    public let sessions: [TerminalSessionInfo]
    public let virhe: String?

    public init(ok: Bool, sessions: [TerminalSessionInfo], virhe: String? = nil) {
        self.ok = ok
        self.sessions = sessions
        self.virhe = virhe
    }
}

/// Vastausmalli istunnon luonnille POST /api/terminal/sessions
public struct CreateTerminalSessionResponse: Codable, Sendable, Equatable {
    public let ok: Bool
    public let session: TerminalSessionInfo?
    public let virhe: String?

    public init(ok: Bool, session: TerminalSessionInfo? = nil, virhe: String? = nil) {
        self.ok = ok
        self.session = session
        self.virhe = virhe
    }
}

/// Vastausmalli istunnon sulkemiselle DELETE /api/terminal/sessions/:id
public struct DeleteTerminalSessionResponse: Codable, Sendable, Equatable {
    public let ok: Bool
    public let closed: String?
    public let tmuxKilled: Bool?
    public let virhe: String?

    public init(ok: Bool, closed: String? = nil, tmuxKilled: Bool? = nil, virhe: String? = nil) {
        self.ok = ok
        self.closed = closed
        self.tmuxKilled = tmuxKilled
        self.virhe = virhe
    }
}

/// Pyyntömalli uuden istunnon luontiin tai olemassa olevaan tmux-istuntoon liittymiseen
public struct CreateTerminalSessionRequest: Codable, Sendable, Equatable {
    public let name: String?
    public let command: String?
    public let args: [String]?
    public let cwd: String?
    public let cols: Int?
    public let rows: Int?
    public let tmuxSession: String?
    public let env: [String: String]?

    public init(
        name: String? = nil,
        command: String? = nil,
        args: [String]? = nil,
        cwd: String? = nil,
        cols: Int? = 80,
        rows: Int? = 24,
        tmuxSession: String? = nil,
        env: [String: String]? = nil
    ) {
        self.name = name
        self.command = command
        self.args = args
        self.cwd = cwd
        self.cols = cols
        self.rows = rows
        self.tmuxSession = tmuxSession
        self.env = env
    }
}

/// Pääteyhteyden JSON-ohjausviestit (Kanava '1')
public enum TerminalControlMessage: Codable, Sendable, Equatable {
    case resize(cols: Int, rows: Int)
    case signal(String)
    case ready(sessionId: String, tmuxSession: String?, cols: Int, rows: Int)
    case exit(exitCode: Int?, signal: String?)
    case error(message: String)

    private enum CodingKeys: String, CodingKey {
        case type, cols, rows, signal, sessionId, tmuxSession, exitCode, message
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "resize":
            let cols = try container.decode(Int.self, forKey: .cols)
            let rows = try container.decode(Int.self, forKey: .rows)
            self = .resize(cols: cols, rows: rows)
        case "signal":
            let sig = try container.decode(String.self, forKey: .signal)
            self = .signal(sig)
        case "ready":
            let sId = try container.decode(String.self, forKey: .sessionId)
            let tmux = try container.decodeIfPresent(String.self, forKey: .tmuxSession)
            let cols = try container.decode(Int.self, forKey: .cols)
            let rows = try container.decode(Int.self, forKey: .rows)
            self = .ready(sessionId: sId, tmuxSession: tmux, cols: cols, rows: rows)
        case "exit":
            let code = try container.decodeIfPresent(Int.self, forKey: .exitCode)
            let sig = try container.decodeIfPresent(String.self, forKey: .signal)
            self = .exit(exitCode: code, signal: sig)
        case "error":
            let msg = try container.decode(String.self, forKey: .message)
            self = .error(message: msg)
        default:
            throw DecodingError.dataCorruptedError(forKey: .type, in: container, debugDescription: "Tuntematon viestityyppi: \(type)")
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .resize(let cols, let rows):
            try container.encode("resize", forKey: .type)
            try container.encode(cols, forKey: .cols)
            try container.encode(rows, forKey: .rows)
        case .signal(let sig):
            try container.encode("signal", forKey: .type)
            try container.encode(sig, forKey: .signal)
        case .ready(let sId, let tmux, let cols, let rows):
            try container.encode("ready", forKey: .type)
            try container.encode(sId, forKey: .sessionId)
            try container.encodeIfPresent(tmux, forKey: .tmuxSession)
            try container.encode(cols, forKey: .cols)
            try container.encode(rows, forKey: .rows)
        case .exit(let code, let sig):
            try container.encode("exit", forKey: .type)
            try container.encodeIfPresent(code, forKey: .exitCode)
            try container.encodeIfPresent(sig, forKey: .signal)
        case .error(let msg):
            try container.encode("error", forKey: .type)
            try container.encode(msg, forKey: .message)
        }
    }
}

/// Terminaaliyhteyden tilat
public enum TerminalConnectionState: Equatable, Sendable, CustomStringConvertible {
    case disconnected
    case connecting
    case connected
    case reconnecting(attempt: Int)
    case failed(String)
    case closed(exitCode: Int?, signal: String?)

    public var isConnected: Bool {
        if case .connected = self { return true }
        return false
    }

    public var isConnectingOrReconnecting: Bool {
        switch self {
        case .connecting, .reconnecting: return true
        default: return false
        }
    }

    public var description: String {
        switch self {
        case .disconnected: return "Yhteys katkaistu"
        case .connecting: return "Yhdistetään..."
        case .connected: return "Yhdistetty"
        case .reconnecting(let attempt): return "Yhdistetään uudelleen (yritys \(attempt))..."
        case .failed(let msg): return "Yhteysvirhe: \(msg)"
        case .closed(let code, let sig):
            if let sig = sig {
                return "Istunto päättynyt signaalilla \(sig)"
            } else if let code = code {
                return "Istunto päättynyt koodilla \(code)"
            } else {
                return "Istunto päättynyt"
            }
        }
    }
}
