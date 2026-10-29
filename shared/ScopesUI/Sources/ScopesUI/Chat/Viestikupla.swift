import SwiftUI
import ScopesCore

public struct Viestikupla: View {
    public let viesti: Viesti
    public var onVastaaKysymykseen: ((String) -> Void)?
    public var onSuljeKysymys: (() -> Void)?

    public init(
        viesti: Viesti,
        onVastaaKysymykseen: ((String) -> Void)? = nil,
        onSuljeKysymys: (() -> Void)? = nil
    ) {
        self.viesti = viesti
        self.onVastaaKysymykseen = onVastaaKysymykseen
        self.onSuljeKysymys = onSuljeKysymys
    }

    public var body: some View {
        if viesti.tyokalu {
            tyokaluRivi
        } else {
            tekstiKupla
        }
    }

    private var tyokaluRivi: some View {
        HStack(spacing: 6) {
            Image(systemName: "wrench.and.screwdriver")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(verbatim: viesti.teksti)
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .textSelection(.enabled)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 2)
        .accessibilityIdentifier("tyokalu-rivi")
    }

    private var tekstiKupla: some View {
        HStack {
            if viesti.omaViesti {
                Spacer(minLength: 60)
            }

            VStack(alignment: viesti.omaViesti ? .trailing : .leading, spacing: 4) {
                Text(LocalizedStringKey(viesti.teksti))
                    .font(.body)
                    .textSelection(.enabled)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(taustaVari)
                    .foregroundColor(viesti.omaViesti ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                if let aika = viesti.aika, !aika.isEmpty {
                    Text(aika)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 4)
                }
            }

            if !viesti.omaViesti {
                Spacer(minLength: 60)
            }
        }
        .id(viesti.id)
    }

    private var taustaVari: Color {
        if viesti.omaViesti {
            return Color.accentColor
        }
        #if os(macOS)
        return Color(nsColor: .controlBackgroundColor)
        #else
        return Color(uiColor: .secondarySystemBackground)
        #endif
    }
}
