import Foundation
import Combine

/// Etäterminaalin WebSocket-yhteyden hallintaluokka.
/// Tukee RFC 6455 -pohjaista kaksisuuntaista PTY-virtaa, kanavointia ('0' data, '1' ohjaus, '2' heartbeat),
/// automaattista uudelleenyhdistämistä ja elossapitosignaaleja.
public final class TerminalConnection: ObservableObject, @unchecked Sendable {
    // MARK: - Konfiguraatio

    public struct Configuration: Sendable {
        public var baseURL: URL
        public var authToken: String?
        public var defaultCols: Int
        public var defaultRows: Int
        public var autoReconnect: Bool
        public var reconnectDelay: TimeInterval
        public var heartbeatInterval: TimeInterval
        public var heartbeatTimeout: TimeInterval

        public init(
            baseURL: URL,
            authToken: String? = nil,
            defaultCols: Int = 80,
            defaultRows: Int = 24,
            autoReconnect: Bool = true,
            reconnectDelay: TimeInterval = 3.0,
            heartbeatInterval: TimeInterval = 15.0,
            heartbeatTimeout: TimeInterval = 30.0
        ) {
            self.baseURL = baseURL
            self.authToken = authToken
            self.defaultCols = defaultCols
            self.defaultRows = defaultRows
            self.autoReconnect = autoReconnect
            self.reconnectDelay = reconnectDelay
            self.heartbeatInterval = heartbeatInterval
            self.heartbeatTimeout = heartbeatTimeout
        }
    }

    // MARK: - Julkaistut tilamuuttujat (SwiftUI)

    @Published public private(set) var state: TerminalConnectionState = .disconnected
    @Published public private(set) var sessionId: String?
    @Published public private(set) var tmuxSession: String?
    @Published public private(set) var cols: Int
    @Published public private(set) var rows: Int
    @Published public private(set) var isReady: Bool = false

    // MARK: - Tapahtumakäsittelijät (Delegates / Callbacks)

    public var onDataReceived: ((Data) -> Void)?
    public var onControlReceived: ((TerminalControlMessage) -> Void)?
    public var onStateChanged: ((TerminalConnectionState) -> Void)?

    // MARK: - Sisäiset tilat

    public let config: Configuration
    private let urlSession: URLSession
    private var webSocketTask: URLSessionWebSocketTask?

    private var heartbeatTimer: Timer?
    private var reconnectTimer: Timer?
    private var lastHeartbeatTime: Date = Date()
    private var reconnectAttempt: Int = 0
    private var isExplicitDisconnect: Bool = false

    private let lock = NSLock()
    private var currentSessionTarget: String?
    private var currentTmuxTarget: String?

    // MARK: - Alustus

    public init(configuration: Configuration, urlSession: URLSession = .shared) {
        self.config = configuration
        self.urlSession = urlSession
        self.cols = configuration.defaultCols
        self.rows = configuration.defaultRows
    }

    deinit {
        disconnect()
    }

    // MARK: - Yhteyden muodostus ja sulkeminen

    /// Yhdistää etäterminaalin WebSocket-rajapintaan.
    /// - Parameters:
    ///   - sessionId: Valinnainen istunnon id (jos kytkeydytään olemassa olevaan)
    ///   - tmuxSession: Valinnainen tmux-istunnon nimi
    ///   - cols: Terminaalin sarakesuuruus
    ///   - rows: Terminaalin rivisuuruus
    public func connect(
        sessionId: String? = nil,
        tmuxSession: String? = nil,
        cols: Int? = nil,
        rows: Int? = nil
    ) {
        lock.lock()
        self.isExplicitDisconnect = false
        self.currentSessionTarget = sessionId
        self.currentTmuxTarget = tmuxSession
        if let c = cols { self.cols = c }
        if let r = rows { self.rows = r }
        lock.unlock()

        performConnect()
    }

    /// Sulkee yhteyden ja pysäyttää automaattisen uudelleenyhdistämisen.
    public func disconnect() {
        lock.lock()
        isExplicitDisconnect = true
        stopHeartbeat()
        stopReconnectTimer()

        let task = webSocketTask
        webSocketTask = nil
        lock.unlock()

        task?.cancel(with: .normalClosure, reason: nil)

        updateState(.disconnected)
    }

    // MARK: - Datan ja ohjauksen lähetys

    /// Lähettää raakadataa PTY:lle (Kanava '0')
    public func send(data: Data) {
        guard state.isConnected else { return }
        let wireData = TerminalWireFrame.encodeData(data)
        sendWebSocketMessage(.data(wireData))
    }

    /// Lähettää tekstisyötteen PTY:lle (Kanava '0')
    public func send(text: String) {
        guard state.isConnected else { return }
        let wireString = TerminalWireFrame.encodeData(text)
        sendWebSocketMessage(.string(wireString))
    }

    /// Ilmoittaa ikkunakoon muutoksesta palvelimelle (Kanava '1')
    public func resize(cols: Int, rows: Int) {
        lock.lock()
        self.cols = cols
        self.rows = rows
        lock.unlock()

        DispatchQueue.main.async {
            self.cols = cols
            self.rows = rows
        }

        guard state.isConnected else { return }
        do {
            let msg = TerminalControlMessage.resize(cols: cols, rows: rows)
            let wireString = try TerminalWireFrame.encodeControl(msg)
            sendWebSocketMessage(.string(wireString))
        } catch {
            // Ignoroi koodausvirhe
        }
    }

    /// Lähettää signaalin (esim. SIGINT, SIGTERM)
    public func sendSignal(_ signal: String) {
        guard state.isConnected else { return }
        do {
            let msg = TerminalControlMessage.signal(signal)
            let wireString = try TerminalWireFrame.encodeControl(msg)
            sendWebSocketMessage(.string(wireString))
        } catch {
            // Ignoroi koodausvirhe
        }
    }

    /// Lähettää elossapitopingin (Kanava '2')
    public func sendPing() {
        guard state.isConnected else { return }
        sendWebSocketMessage(.string(TerminalWireFrame.ping()))
    }

    // MARK: - Sisäinen WebSocket-logiikka

    private func performConnect() {
        lock.lock()
        guard !isExplicitDisconnect else {
            lock.unlock()
            return
        }

        stopHeartbeat()
        stopReconnectTimer()

        guard let request = buildRequest() else {
            lock.unlock()
            updateState(.failed("Virheellinen palvelimen osoite"))
            return
        }

        let task = urlSession.webSocketTask(with: request)
        self.webSocketTask = task
        lock.unlock()

        updateState(.connecting)
        task.resume()

        startReceiveLoop()
        startHeartbeat()
    }

    private func buildRequest() -> URLRequest? {
        var components = URLComponents(url: config.baseURL, resolvingAgainstBaseURL: true)
        let scheme = components?.scheme?.lowercased()
        if scheme == "http" {
            components?.scheme = "ws"
        } else if scheme == "https" {
            components?.scheme = "wss"
        }

        // Päätepiste: /api/terminal/ws
        var path = components?.path ?? ""
        if !path.hasSuffix("/api/terminal/ws") {
            if path.hasSuffix("/") {
                path.removeLast()
            }
            path += "/api/terminal/ws"
        }
        components?.path = path

        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "cols", value: String(cols)),
            URLQueryItem(name: "rows", value: String(rows))
        ]

        if let s = currentSessionTarget, !s.isEmpty {
            queryItems.append(URLQueryItem(name: "istunto", value: s))
        } else if let t = currentTmuxTarget, !t.isEmpty {
            queryItems.append(URLQueryItem(name: "istunto", value: t))
        }

        // Fallback-token URL-parametrina
        if let token = config.authToken, !token.isEmpty {
            queryItems.append(URLQueryItem(name: "token", value: token))
        }

        components?.queryItems = queryItems
        guard let url = components?.url else { return nil }

        var request = URLRequest(url: url)
        request.timeoutInterval = 10.0
        if let token = config.authToken, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return request
    }

    private func startReceiveLoop() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .success(let message):
                self.handleWebSocketMessage(message)
                self.startReceiveLoop()

            case .failure(let error):
                self.handleConnectionFailure(error: error)
            }
        }
    }

    private func handleWebSocketMessage(_ message: URLSessionWebSocketTask.Message) {
        do {
            let frame: TerminalFrame
            switch message {
            case .string(let text):
                frame = try TerminalWireFrame.decodeFrame(text)
            case .data(let data):
                frame = try TerminalWireFrame.decodeFrame(data)
            @unknown default:
                return
            }

            switch frame {
            case .data(let rawBytes):
                DispatchQueue.main.async {
                    self.onDataReceived?(rawBytes)
                }

            case .control(let controlMessage):
                handleControlMessage(controlMessage)

            case .heartbeat:
                lock.lock()
                lastHeartbeatTime = Date()
                lock.unlock()
            }
        } catch {
            // Ignoroi virheelliset kehykset
        }
    }

    private func handleControlMessage(_ message: TerminalControlMessage) {
        DispatchQueue.main.async {
            switch message {
            case .ready(let sessionId, let tmux, let cols, let rows):
                self.sessionId = sessionId
                self.tmuxSession = tmux
                self.cols = cols
                self.rows = rows
                self.isReady = true
                self.reconnectAttempt = 0
                self.updateState(.connected)

            case .exit(let code, let sig):
                self.isReady = false
                self.updateState(.closed(exitCode: code, signal: sig))

            case .error(let msg):
                self.updateState(.failed(msg))

            case .resize(let cols, let rows):
                self.cols = cols
                self.rows = rows

            case .signal:
                break
            }

            self.onControlReceived?(message)
        }
    }

    private func handleConnectionFailure(error: Error) {
        lock.lock()
        let explicit = isExplicitDisconnect
        let canReconnect = config.autoReconnect && !explicit
        lock.unlock()

        stopHeartbeat()

        if explicit {
            updateState(.disconnected)
            return
        }

        if canReconnect {
            reconnectAttempt += 1
            let attempt = reconnectAttempt
            updateState(.reconnecting(attempt: attempt))

            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.stopReconnectTimer()
                self.reconnectTimer = Timer.scheduledTimer(
                    withTimeInterval: self.config.reconnectDelay,
                    repeats: false
                ) { [weak self] _ in
                    self?.performConnect()
                }
            }
        } else {
            updateState(.failed(error.localizedDescription))
        }
    }

    private func sendWebSocketMessage(_ message: URLSessionWebSocketTask.Message) {
        webSocketTask?.send(message) { [weak self] error in
            if let error = error {
                self?.handleConnectionFailure(error: error)
            }
        }
    }

    // MARK: - Heartbeat

    private func startHeartbeat() {
        stopHeartbeat()
        lock.lock()
        lastHeartbeatTime = Date()
        lock.unlock()

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.heartbeatTimer = Timer.scheduledTimer(
                withTimeInterval: self.config.heartbeatInterval,
                repeats: true
            ) { [weak self] _ in
                self?.checkHeartbeat()
            }
        }
    }

    private func stopHeartbeat() {
        heartbeatTimer?.invalidate()
        heartbeatTimer = nil
    }

    private func checkHeartbeat() {
        lock.lock()
        let elapsed = Date().timeIntervalSince(lastHeartbeatTime)
        let timeout = config.heartbeatTimeout
        lock.unlock()

        if elapsed > timeout {
            // Heartbeat aikakatkaistiin -> yhteys katkaistaan ja aloitetaan reconnect
            webSocketTask?.cancel(with: .goingAway, reason: nil)
            handleConnectionFailure(error: NSError(
                domain: "ScopesTerminal",
                code: -1001,
                userInfo: [NSLocalizedDescriptionKey: "Heartbeat aikakatkaistu (\(Int(elapsed))s)"]
            ))
            return
        }

        sendPing()
    }

    private func stopReconnectTimer() {
        reconnectTimer?.invalidate()
        reconnectTimer = nil
    }

    private func updateState(_ newState: TerminalConnectionState) {
        DispatchQueue.main.async {
            self.state = newState
            self.onStateChanged?(newState)
        }
    }
}
