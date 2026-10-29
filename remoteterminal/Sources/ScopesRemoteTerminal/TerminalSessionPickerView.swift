import SwiftUI

/// Istuntovalitsin ja -hallintanäkymä (TerminalSessionPickerView).
/// Mahdollistaa aktiivisten PTY/tmux-istuntojen selaamisen, vaihtamisen,
/// uusien istuntojen luomisen sekä vanhojen sulkemisen.
public struct TerminalSessionPickerView: View {
    @ObservedObject public var viewModel: RemoteTerminalViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var showingNewSessionSheet = false
    @State private var newName = ""
    @State private var newCommand = ""
    @State private var newTmuxSession = ""

    public init(viewModel: RemoteTerminalViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Virheilmoitusbalkki tarvittaessa
                if let error = viewModel.sessionErrorMessage {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.yellow)
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.primary)
                        Spacer()
                        Button("Yritä uudelleen") {
                            Task { await viewModel.fetchSessions() }
                        }
                        .font(.caption.bold())
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.red.opacity(0.15))
                }

                // Istuntolista tai tyhjätila
                if viewModel.isLoadingSessions && viewModel.sessions.isEmpty {
                    Spacer()
                    ProgressView("Ladataan istuntoja...")
                    Spacer()
                } else if viewModel.sessions.isEmpty {
                    emptyStateView
                } else {
                    sessionListView
                }
            }
            .navigationTitle("Pääte-istunnot")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Valmis") {
                        dismiss()
                    }
                }

                ToolbarItemGroup(placement: .primaryAction) {
                    Button(action: {
                        Task { await viewModel.fetchSessions() }
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(viewModel.isLoadingSessions)

                    Button(action: {
                        showingNewSessionSheet = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingNewSessionSheet) {
                newSessionSheet
            }
            .task {
                await viewModel.fetchSessions()
            }
        }
    }

    // MARK: - Istuntolista

    private var sessionListView: some View {
        List {
            Section(header: Text("Aktiiviset istunnot (\(viewModel.sessions.count))")) {
                ForEach(viewModel.sessions) { session in
                    sessionRow(session)
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        let session = viewModel.sessions[index]
                        Task {
                            await viewModel.closeSession(id: session.id, killTmux: false)
                        }
                    }
                }
            }
        }
        #if os(iOS)
        .listStyle(.insetGrouped)
        #endif
    }

    private func sessionRow(_ session: TerminalSessionInfo) -> some View {
        let isSelected = session.id == viewModel.selectedSessionId || (session.tmuxSession != nil && session.tmuxSession == viewModel.selectedSession?.tmuxSession)

        return Button(action: {
            viewModel.selectSession(session)
            dismiss()
        }) {
            HStack(spacing: 12) {
                // Istunnon ikoni ja valintatila
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.accentColor : Color.secondary.opacity(0.15))
                        .frame(width: 36, height: 36)

                    Image(systemName: isSelected ? "terminal.fill" : "terminal")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(isSelected ? .white : .primary)
                }

                // Nimi ja metatiedot
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text(session.name)
                            .font(.headline)
                            .foregroundColor(.primary)

                        if isSelected {
                            Text("Aktiivinen")
                                .font(.caption2.bold())
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.accentColor.opacity(0.15))
                                .foregroundColor(.accentColor)
                                .cornerRadius(4)
                        }
                    }

                    HStack(spacing: 8) {
                        if let tmux = session.tmuxSession {
                            Label(tmux, systemImage: "macwindow")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Text("\(session.cols)×\(session.rows)")
                            .font(.caption.monospaced())
                            .foregroundColor(.secondary)

                        if session.attachedClients > 0 {
                            Label("\(session.attachedClients)", systemImage: "person.2")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.accentColor)
                }
            }
            .contentShape(Rectangle())
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
        .contextMenu {
            Button(role: .destructive, action: {
                Task {
                    await viewModel.closeSession(id: session.id, killTmux: false)
                }
            }) {
                Label("Sulje yhteys (irrota)", systemImage: "xmark.circle")
            }

            Button(role: .destructive, action: {
                Task {
                    await viewModel.closeSession(id: session.id, killTmux: true)
                }
            }) {
                Label("Tapa istunto ja tmux", systemImage: "trash")
            }
        }
    }

    // MARK: - Tyhjätila

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "terminal")
                .font(.system(size: 48))
                .foregroundColor(.secondary)

            Text("Ei aktiivisia istuntoja")
                .font(.title3.bold())

            Text("Luo uusi PTY- tai tmux-istunto aloittaaksesi komentorivikäytön.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Button(action: {
                showingNewSessionSheet = true
            }) {
                Label("Luo uusi istunto", systemImage: "plus")
                    .font(.headline)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .buttonStyle(.plain)
            .padding(.top, 8)

            Spacer()
        }
    }

    // MARK: - Uuden istunnon luontilomake

    private var newSessionSheet: some View {
        NavigationStack {
            Form {
                Section(header: Text("Istunnon asetukset")) {
                    TextField("Istunnon nimi (esim. kehitys, claude)", text: $newName)
                    TextField("Komento (valinnainen, oletus $SHELL)", text: $newCommand)
                    TextField("Tmux-istunnon nimi (valinnainen)", text: $newTmuxSession)
                }

                Section(footer: Text("Istunto pyörii palvelimella tmuxin alaisuudessa. Voit katkaista ja yhdistää takaisin milloin vain ilman prosessin sammumista.")) {
                    Button("Luo ja yhdistä") {
                        let nameVal = newName.trimmingCharacters(in: .whitespacesAndNewlines)
                        let cmdVal = newCommand.trimmingCharacters(in: .whitespacesAndNewlines)
                        let tmuxVal = newTmuxSession.trimmingCharacters(in: .whitespacesAndNewlines)

                        Task {
                            await viewModel.createSession(
                                name: nameVal.isEmpty ? nil : nameVal,
                                command: cmdVal.isEmpty ? nil : cmdVal,
                                tmuxSession: tmuxVal.isEmpty ? nil : tmuxVal,
                                autoConnect: true
                            )
                            showingNewSessionSheet = false
                            dismiss()
                        }
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .center)
                }
            }
            .navigationTitle("Uusi pääte-istunto")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Peruuta") {
                        showingNewSessionSheet = false
                    }
                }
            }
        }
    }
}
