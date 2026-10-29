import Foundation
import Combine
import SwiftUI

/// Etäpäätenäkymän tilaa ja istuntoja hallinnoiva ViewModel.
/// Kytkee yhteen reaaliaikaisen PTY WebSocket -yhteyden (`TerminalConnection`),
/// REST-istuntohallinnan (`GET/POST/DELETE /api/terminal/sessions`), teemat ja näkymäasetukset.
@MainActor
public final class RemoteTerminalViewModel: ObservableObject {
    // MARK: - Julkaistut tilamuuttujat (UI)

    /// Aktiivinen pääteyhteys
    @Published public var connection: TerminalConnection

    /// Palvelimelta haetut aktiiviset istunnot
    @Published public var sessions: [TerminalSessionInfo] = []

    /// Tällä hetkellä valittu istunto
    @Published public var selectedSession: TerminalSessionInfo?

    /// Valitun istunnon tunniste
    @Published public var selectedSessionId: String?

    /// Istuntojen lataustila
    @Published public var isLoadingSessions: Bool = false

    /// Istuntojen hakemiseen tai luontiin liittyvä virheilmoitus
    @Published public var sessionErrorMessage: String?

    /// Terminaalin nykyinen väriteema
    @Published public var currentTheme: TerminalTheme = .scopesDark

    /// Terminaalifontin pistekoko (clamped 8...32)
    @Published public var fontSize: CGFloat = 13.0

    /// Pikanäppäimistöpalkin (TerminalAccessoryBar) näkyvyys
    @Published public var isAccessoryBarVisible: Bool = true

    /// Pääteikkunan otsikko (SwiftTermin ilmoittama tai istunnon nimi)
    @Published public var terminalTitle: String = "Terminal"

    /// Istuntovalitsimen (TerminalSessionPickerView) esitystila
    @Published public var isShowingSessionPicker: Bool = false

    /// Uuden istunnon luontilomakkeen esitystila
    @Published public var isShowingNewSessionSheet: Bool = false

    // MARK: - Sisäiset riippuvuudet

    public let urlSession: URLSession
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Alustus

    /// Luo ViewModelin suoraan konfiguraatiolla
    public init(
        configuration: TerminalConnection.Configuration,
        initialSessionId: String? = nil,
        initialTmuxSession: String? = nil,
        urlSession: URLSession = .shared
    ) {
        let conn = TerminalConnection(configuration: configuration, urlSession: urlSession)
        self.connection = conn
        self.selectedSessionId = initialSessionId ?? initialTmuxSession
        self.urlSession = urlSession

        setupConnectionBindings()

        if let id = selectedSessionId {
            conn.connect(sessionId: id, tmuxSession: initialTmuxSession)
        }
    }

    /// Luo ViewModelin valmiilla TerminalConnection-oliolla
    public init(
        connection: TerminalConnection,
        initialSessionId: String? = nil,
        urlSession: URLSession = .shared
    ) {
        self.connection = connection
        self.selectedSessionId = initialSessionId
        self.urlSession = urlSession

        setupConnectionBindings()
    }

    private func setupConnectionBindings() {
        // Kuuntele yhteyden tilanmuutoksia
        connection.objectWillChange
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                self?.objectWillChange.send()
            }
            .store(in: &cancellables)

        // Päivitä otsikko yhteyden sessionId:n perusteella jos saatavilla
        if let sId = connection.sessionId {
            self.terminalTitle = sId
        }
    }

    // MARK: - REST-istuntohallinta

    /// Hakee aktiiviset istunnot palvelimelta: GET /api/terminal/sessions
    public func fetchSessions() async {
        isLoadingSessions = true
        sessionErrorMessage = nil

        guard let request = makeRESTRequest(path: "/api/terminal/sessions", method: "GET") else {
            isLoadingSessions = false
            sessionErrorMessage = "Virheellinen palvelinosoite"
            return
        }

        do {
            let (data, response) = try await urlSession.data(for: request)
            guard let http = response as? HTTPURLResponse else {
                throw URLError(.badServerResponse)
            }

            if http.statusCode == 200 {
                let decoded = try JSONDecoder().decode(TerminalSessionListResponse.self, from: data)
                self.sessions = decoded.sessions

                // Synkronoi valittu istunto listan kanssa
                if let selectedId = self.selectedSessionId {
                    self.selectedSession = self.sessions.first { $0.id == selectedId || $0.tmuxSession == selectedId }
                } else if self.selectedSession == nil, let first = self.sessions.first {
                    self.selectedSession = first
                    self.selectedSessionId = first.id
                }
            } else {
                self.sessionErrorMessage = "Palvelinvirhe (\(http.statusCode))"
            }
        } catch {
            self.sessionErrorMessage = "Istuntojen haku epäonnistui: \(error.localizedDescription)"
        }

        isLoadingSessions = false
    }

    /// Luo uuden istunnon: POST /api/terminal/sessions
    @discardableResult
    public func createSession(
        name: String? = nil,
        command: String? = nil,
        args: [String]? = nil,
        cwd: String? = nil,
        tmuxSession: String? = nil,
        autoConnect: Bool = true
    ) async -> TerminalSessionInfo? {
        sessionErrorMessage = nil

        guard var request = makeRESTRequest(path: "/api/terminal/sessions", method: "POST") else {
            sessionErrorMessage = "Virheellinen palvelinosoite"
            return nil
        }

        let body = CreateTerminalSessionRequest(
            name: name,
            command: command,
            args: args,
            cwd: cwd,
            cols: connection.cols,
            rows: connection.rows,
            tmuxSession: tmuxSession
        )

        do {
            request.httpBody = try JSONEncoder().encode(body)
            let (data, response) = try await urlSession.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 || http.statusCode == 201 else {
                throw URLError(.badServerResponse)
            }

            let decoded = try JSONDecoder().decode(CreateTerminalSessionResponse.self, from: data)
            await fetchSessions()

            if let created = decoded.session {
                if autoConnect {
                    selectSession(created)
                }
                return created
            } else if let found = self.sessions.first(where: { $0.name == name || (tmuxSession != nil && $0.tmuxSession == tmuxSession) }) {
                if autoConnect {
                    selectSession(found)
                }
                return found
            }
            return nil
        } catch {
            sessionErrorMessage = "Istunnon luonti epäonnistui: \(error.localizedDescription)"
            return nil
        }
    }

    /// Sulkee istunnon: DELETE /api/terminal/sessions/:id
    @discardableResult
    public func closeSession(id: String, killTmux: Bool = false) async -> Bool {
        sessionErrorMessage = nil
        let query = killTmux ? "?killTmux=true" : "?killTmux=false"
        guard let request = makeRESTRequest(path: "/api/terminal/sessions/\(id)\(query)", method: "DELETE") else {
            sessionErrorMessage = "Virheellinen palvelinosoite"
            return false
        }

        do {
            let (_, response) = try await urlSession.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }

            // Jos suljettu istunto oli valittuna, katkaise yhteys tai vaihda toiseen
            if selectedSessionId == id || selectedSession?.id == id {
                connection.disconnect()
                selectedSession = nil
                selectedSessionId = nil
            }

            await fetchSessions()

            // Jos muita istuntoja on jäljellä, valitse ensimmäinen
            if selectedSession == nil, let first = sessions.first {
                selectSession(first)
            }

            return true
        } catch {
            sessionErrorMessage = "Istunnon sulkeminen epäonnistui: \(error.localizedDescription)"
            return false
        }
    }

    // MARK: - Istuntovalinta ja yhteys

    /// Valitsee annetun istunnon ja kytkeytyy siihen
    public func selectSession(_ session: TerminalSessionInfo) {
        self.selectedSession = session
        self.selectedSessionId = session.id
        self.terminalTitle = session.name

        connection.disconnect()
        connection.connect(
            sessionId: session.id,
            tmuxSession: session.tmuxSession,
            cols: session.cols > 0 ? session.cols : connection.cols,
            rows: session.rows > 0 ? session.rows : connection.rows
        )
    }

    /// Valitsee istunnon tunnisteen perusteella
    public func selectSession(id: String) {
        if let found = sessions.first(where: { $0.id == id || $0.tmuxSession == id }) {
            selectSession(found)
        } else {
            self.selectedSessionId = id
            self.terminalTitle = id
            connection.disconnect()
            connection.connect(sessionId: id)
        }
    }

    /// Yhdistää uudelleen aktiiviseen istuntoon
    public func reconnect() {
        if let s = selectedSession {
            connection.connect(sessionId: s.id, tmuxSession: s.tmuxSession)
        } else if let id = selectedSessionId {
            connection.connect(sessionId: id)
        } else {
            connection.connect()
        }
    }

    /// Katkaisee pääteyhteyden
    public func disconnect() {
        connection.disconnect()
    }

    // MARK: - Asetukset ja ulkoasu

    /// Suurentaa fonttikokoa (maksimi 32)
    public func increaseFontSize(step: CGFloat = 1.0) {
        fontSize = min(32.0, fontSize + step)
    }

    /// Pienentää fonttikokoa (minimi 8)
    public func decreaseFontSize(step: CGFloat = 1.0) {
        fontSize = max(8.0, fontSize - step)
    }

    /// Vaihtaa väriteeman
    public func setTheme(_ theme: TerminalTheme) {
        self.currentTheme = theme
    }

    /// Vaihtaa pikanäppäinpalkin näkyvyyttä
    public func toggleAccessoryBar() {
        isAccessoryBarVisible.toggle()
    }

    // MARK: - REST-apurit

    private func makeRESTRequest(path: String, method: String) -> URLRequest? {
        var base = connection.config.baseURL
        // Poista ws/wss ja korvaa http/https jos tarpeen
        var components = URLComponents(url: base, resolvingAgainstBaseURL: true)
        if components?.scheme == "ws" {
            components?.scheme = "http"
        } else if components?.scheme == "wss" {
            components?.scheme = "https"
        }

        guard var comp = components else { return nil }
        var fullPath = comp.path
        if fullPath.hasSuffix("/") { fullPath.removeLast() }
        fullPath += path
        comp.path = fullPath

        guard let url = comp.url else { return nil }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = connection.config.authToken, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return request
    }
}
