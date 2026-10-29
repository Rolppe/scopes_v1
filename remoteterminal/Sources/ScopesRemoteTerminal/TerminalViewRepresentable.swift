import SwiftUI
import Foundation

#if canImport(SwiftTerm)
import SwiftTerm
#endif

// MARK: - iOS (UIKit) Implementaatio

#if canImport(UIKit) && !os(watchOS)
import UIKit

public struct TerminalViewRepresentable: UIViewRepresentable {
    @ObservedObject public var connection: TerminalConnection
    public var font: UIFont
    public var onTitleChanged: ((String) -> Void)?

    public init(
        connection: TerminalConnection,
        font: UIFont = .monospacedSystemFont(ofSize: 13, weight: .regular),
        onTitleChanged: ((String) -> Void)? = nil
    ) {
        self.connection = connection
        self.font = font
        self.onTitleChanged = onTitleChanged
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator(connection: connection, onTitleChanged: onTitleChanged)
    }

    public func makeUIView(context: Context) -> UIView {
        #if canImport(SwiftTerm)
        let terminalView = TerminalView(frame: .zero)
        terminalView.font = font
        terminalView.terminalDelegate = context.coordinator
        context.coordinator.terminalView = terminalView

        // Kytke saapuvan PTY-datan syöttö SwiftTermille
        connection.onDataReceived = { [weak terminalView] data in
            terminalView?.feed(byteArray: [UInt8](data))
        }

        return terminalView
        #else
        // Fallback-näkymä jos SwiftTerm ei ole linkitettynä
        let label = UILabel()
        label.text = "SwiftTerm ei ole saatavilla tässä koosteessa"
        label.textAlignment = .center
        label.textColor = .secondaryLabel
        return label
        #endif
    }

    public func updateUIView(_ uiView: UIView, context: Context) {
        #if canImport(SwiftTerm)
        if let terminalView = uiView as? TerminalView {
            terminalView.font = font
        }
        #endif
    }

    public final class Coordinator: NSObject
    #if canImport(SwiftTerm)
    , TerminalViewDelegate
    #endif
    {
        public let connection: TerminalConnection
        public var onTitleChanged: ((String) -> Void)?
        #if canImport(SwiftTerm)
        public weak var terminalView: TerminalView?
        #endif

        public init(connection: TerminalConnection, onTitleChanged: ((String) -> Void)?) {
            self.connection = connection
            self.onTitleChanged = onTitleChanged
        }

        #if canImport(SwiftTerm)
        public func send(source: TerminalView, data: ArraySlice<UInt8>) {
            connection.send(data: Data(data))
        }

        public func sizeChanged(source: TerminalView, newCols: Int, newRows: Int) {
            connection.resize(cols: newCols, rows: newRows)
        }

        public func setTerminalTitle(source: TerminalView, title: String) {
            DispatchQueue.main.async {
                self.onTitleChanged?(title)
            }
        }

        public func hostCurrentDirectoryUpdate(source: TerminalView, directory: String?) {}

        public func scrolled(source: TerminalView, position: Double) {}

        public func requestOpenLink(source: TerminalView, link: String, params: [String: String]) {
            if let url = URL(string: link) {
                UIApplication.shared.open(url)
            }
        }

        public func bell(source: TerminalView) {
            let feedback = UIImpactFeedbackGenerator(style: .light)
            feedback.impactOccurred()
        }

        public func clipboardCopy(source: TerminalView, content: Data) {
            if let string = String(data: content, encoding: .utf8) {
                UIPasteboard.general.string = string
            }
        }

        public func rangeChanged(source: TerminalView, startY: Int, endY: Int) {}
        #endif
    }
}

// MARK: - macOS (AppKit) Implementaatio

#elseif canImport(AppKit)
import AppKit

public struct TerminalViewRepresentable: NSViewRepresentable {
    @ObservedObject public var connection: TerminalConnection
    public var font: NSFont
    public var onTitleChanged: ((String) -> Void)?

    public init(
        connection: TerminalConnection,
        font: NSFont = .monospacedSystemFont(ofSize: 13, weight: .regular),
        onTitleChanged: ((String) -> Void)? = nil
    ) {
        self.connection = connection
        self.font = font
        self.onTitleChanged = onTitleChanged
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator(connection: connection, onTitleChanged: onTitleChanged)
    }

    public func makeNSView(context: Context) -> NSView {
        #if canImport(SwiftTerm)
        let terminalView = TerminalView(frame: .zero)
        terminalView.font = font
        terminalView.terminalDelegate = context.coordinator
        context.coordinator.terminalView = terminalView

        // Kytke saapuvan PTY-datan syöttö SwiftTermille
        connection.onDataReceived = { [weak terminalView] data in
            terminalView?.feed(byteArray: [UInt8](data))
        }

        return terminalView
        #else
        let textField = NSTextField(labelWithString: "SwiftTerm ei ole saatavilla tässä koosteessa")
        textField.alignment = .center
        return textField
        #endif
    }

    public func updateNSView(_ nsView: NSView, context: Context) {
        #if canImport(SwiftTerm)
        if let terminalView = nsView as? TerminalView {
            terminalView.font = font
        }
        #endif
    }

    public final class Coordinator: NSObject
    #if canImport(SwiftTerm)
    , TerminalViewDelegate
    #endif
    {
        public let connection: TerminalConnection
        public var onTitleChanged: ((String) -> Void)?
        #if canImport(SwiftTerm)
        public weak var terminalView: TerminalView?
        #endif

        public init(connection: TerminalConnection, onTitleChanged: ((String) -> Void)?) {
            self.connection = connection
            self.onTitleChanged = onTitleChanged
        }

        #if canImport(SwiftTerm)
        public func send(source: TerminalView, data: ArraySlice<UInt8>) {
            connection.send(data: Data(data))
        }

        public func sizeChanged(source: TerminalView, newCols: Int, newRows: Int) {
            connection.resize(cols: newCols, rows: newRows)
        }

        public func setTerminalTitle(source: TerminalView, title: String) {
            DispatchQueue.main.async {
                self.onTitleChanged?(title)
            }
        }

        public func hostCurrentDirectoryUpdate(source: TerminalView, directory: String?) {}

        public func scrolled(source: TerminalView, position: Double) {}

        public func requestOpenLink(source: TerminalView, link: String, params: [String: String]) {
            if let url = URL(string: link) {
                NSWorkspace.shared.open(url)
            }
        }

        public func bell(source: TerminalView) {
            NSSound.beep()
        }

        public func clipboardCopy(source: TerminalView, content: Data) {
            if let string = String(data: content, encoding: .utf8) {
                let pasteboard = NSPasteboard.general
                pasteboard.clearContents()
                pasteboard.setString(string, forType: .string)
            }
        }

        public func rangeChanged(source: TerminalView, startY: Int, endY: Int) {}
        #endif
    }
}
#endif
