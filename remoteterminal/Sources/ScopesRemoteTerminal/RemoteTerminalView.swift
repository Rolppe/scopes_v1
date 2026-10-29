import SwiftUI

#if canImport(UIKit) && !os(watchOS)
import UIKit
public typealias TerminalViewFont = UIFont
public func makeTerminalViewFont(size: CGFloat) -> TerminalViewFont {
    UIFont.monospacedSystemFont(ofSize: size, weight: .regular)
}
#elseif canImport(AppKit)
import AppKit
public typealias TerminalViewFont = NSFont
public func makeTerminalViewFont(size: CGFloat) -> TerminalViewFont {
    NSFont.monospacedSystemFont(ofSize: size, weight: .regular)
}
#endif

/// Scopes Etäterminaalin päänäkymä (RemoteTerminalView).
/// Kokoaa yhteen SwiftTerm-pääteruudun (`TerminalViewRepresentable`),
/// yläpalkin tilatiedot ja istunnonvalitsimen sekä mobiilin pikanäppäinpalkin (`TerminalAccessoryBar`).
public struct RemoteTerminalView: View {
    @ObservedObject public var viewModel: RemoteTerminalViewModel
    @State private var isShowingSessionSheet = false

    public init(viewModel: RemoteTerminalViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Yläpalkki: istunnon otsikko, tila ja pikatoiminnot
            topBarView

            Divider()

            // Pääteikkuna-alue taustavärillä ja tilakerroksilla
            ZStack {
                viewModel.currentTheme.backgroundColor
                    .ignoresSafeArea(.all, edges: .horizontal)

                #if canImport(UIKit) || canImport(AppKit)
                TerminalViewRepresentable(
                    connection: viewModel.connection,
                    font: makeTerminalViewFont(size: viewModel.fontSize),
                    onTitleChanged: { newTitle in
                        if !newTitle.isEmpty {
                            viewModel.terminalTitle = newTitle
                        }
                    }
                )
                #endif

                // Yhteystilakerros tai virhebanneri
                if !viewModel.connection.state.isConnected {
                    connectionOverlayView
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Mobiilin pikanäppäinpalkki (Accessory Toolbar)
            if viewModel.isAccessoryBarVisible {
                Divider()
                TerminalAccessoryBar(connection: viewModel.connection)
                    .background(viewModel.currentTheme.backgroundColor.opacity(0.95))
            }
        }
        .background(viewModel.currentTheme.backgroundColor)
        .sheet(isPresented: $isShowingSessionSheet) {
            TerminalSessionPickerView(viewModel: viewModel)
        }
    }

    // MARK: - Yläpalkki

    private var topBarView: some View {
        HStack(spacing: 12) {
            // Yhteystilan tilaindikaattori (piste + lyhyt teksti)
            statusBadgeView

            Spacer()

            // Istunnon valitsinpainike
            Button(action: {
                isShowingSessionSheet = true
            }) {
                HStack(spacing: 5) {
                    Image(systemName: "terminal")
                        .font(.system(size: 13, weight: .medium))
                    Text(viewModel.selectedSession?.name ?? viewModel.terminalTitle)
                        .font(.system(size: 13, weight: .semibold))
                        .lineLimit(1)
                    Image(systemName: "chevron.down")
                        .font(.system(size: 10, weight: .bold))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Color.secondary.opacity(0.18))
                .foregroundColor(.primary)
                .cornerRadius(6)
            }
            .buttonStyle(.plain)

            Spacer()

            // Pääteasetukset ja toiminnot
            HStack(spacing: 8) {
                // Uudelleenyhdistys jos katkaistu
                if !viewModel.connection.state.isConnected {
                    Button(action: {
                        viewModel.reconnect()
                    }) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .buttonStyle(.plain)
                    .help("Yhdistä uudelleen")
                }

                // Näkymä- ja fonttivalikko
                Menu {
                    Section("Fonttikoko (\(Int(viewModel.fontSize)) pt)") {
                        Button(action: { viewModel.increaseFontSize() }) {
                            Label("Suurenna fonttia", systemImage: "plus.magnifyingglass")
                        }
                        Button(action: { viewModel.decreaseFontSize() }) {
                            Label("Pienennä fonttia", systemImage: "minus.magnifyingglass")
                        }
                    }

                    Section("Väriteema") {
                        ForEach(TerminalTheme.allPresets) { theme in
                            Button(action: {
                                viewModel.setTheme(theme)
                            }) {
                                HStack {
                                    Text(theme.name)
                                    if theme.name == viewModel.currentTheme.name {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    }

                    Section("Näppäimistöpalkki") {
                        Button(action: {
                            viewModel.toggleAccessoryBar()
                        }) {
                            Label(
                                viewModel.isAccessoryBarVisible ? "Piilota pikanäppäimet" : "Näytä pikanäppäimet",
                                systemImage: "keyboard"
                            )
                        }
                    }
                } label: {
                    Image(systemName: "textformat.size")
                        .font(.system(size: 13, weight: .medium))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 5)
                }
                .buttonStyle(.plain)

                // Istuntolistan avaaminen
                Button(action: {
                    isShowingSessionSheet = true
                }) {
                    Image(systemName: "list.bullet.rectangle")
                        .font(.system(size: 13, weight: .medium))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 5)
                }
                .buttonStyle(.plain)
                .help("Avaa istuntolista")
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(UIColorOrNSColorBar))
    }

    // MARK: - Yhteystilan badge

    private var statusBadgeView: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)

            Text(statusShortText)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.secondary)
        }
    }

    private var statusColor: Color {
        switch viewModel.connection.state {
        case .connected:
            return .green
        case .connecting, .reconnecting:
            return .orange
        case .disconnected:
            return .gray
        case .failed, .closed:
            return .red
        }
    }

    private var statusShortText: String {
        switch viewModel.connection.state {
        case .connected:
            return "\(viewModel.connection.cols)×\(viewModel.connection.rows)"
        case .connecting:
            return "Yhdistetään..."
        case .reconnecting(let attempt):
            return "Uudelleen (\(attempt))..."
        case .disconnected:
            return "Katkaistu"
        case .failed:
            return "Virhe"
        case .closed:
            return "Päättynyt"
        }
    }

    // MARK: - Yhteystilakerros (Overlay)

    @ViewBuilder
    private var connectionOverlayView: some View {
        VStack(spacing: 12) {
            switch viewModel.connection.state {
            case .connecting:
                ProgressView()
                    .progressViewStyle(.circular)
                Text("Muodostetaan terminaaliyhteyttä...")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

            case .reconnecting(let attempt):
                ProgressView()
                    .progressViewStyle(.circular)
                Text("Yhteys katkennut. Yhdistetään uudelleen (yritys \(attempt))...")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

            case .disconnected:
                Image(systemName: "network.slash")
                    .font(.system(size: 32))
                    .foregroundColor(.secondary)
                Text("Etäpääte ei ole yhteydessä")
                    .font(.headline)
                Button("Yhdistä") {
                    viewModel.reconnect()
                }
                .buttonStyle(.borderedProminent)

            case .failed(let message):
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(.yellow)
                Text("Yhteysvirhe")
                    .font(.headline)
                Text(message)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
                Button("Yritä uudelleen") {
                    viewModel.reconnect()
                }
                .buttonStyle(.borderedProminent)

            case .closed(let code, let sig):
                Image(systemName: "terminal")
                    .font(.system(size: 32))
                    .foregroundColor(.secondary)
                Text("Pääteistunto on päättynyt")
                    .font(.headline)
                if let sig = sig {
                    Text("Päättyi signaaliin \(sig)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                } else if let code = code {
                    Text("Lopetuskoodi: \(code)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Button("Käynnistä uudelleen") {
                    viewModel.reconnect()
                }
                .buttonStyle(.borderedProminent)

            case .connected:
                EmptyView()
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(UIColorOrNSColorBackground).opacity(0.92))
                .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
        )
        .padding(24)
    }

    private var UIColorOrNSColorBar: Color {
        #if canImport(UIKit) && !os(watchOS)
        Color(UIColor.secondarySystemBackground)
        #elseif canImport(AppKit)
        Color(NSColor.windowBackgroundColor)
        #else
        Color.gray.opacity(0.15)
        #endif
    }

    private var UIColorOrNSColorBackground: Color {
        #if canImport(UIKit) && !os(watchOS)
        Color(UIColor.systemBackground)
        #elseif canImport(AppKit)
        Color(NSColor.underPageBackgroundColor)
        #else
        Color.black
        #endif
    }
}
