import SwiftUI
import AppKit
import ScopesCore

public struct MacQuestionCard: View {
    public let kysymys: Kysymys
    public var onVastaus: (String) -> Void
    @State private var valitut: Set<String> = []

    public init(kysymys: Kysymys, onVastaus: @escaping (String) -> Void) {
        self.kysymys = kysymys
        self.onVastaus = onVastaus
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let otsikko = kysymys.otsikko, !otsikko.isEmpty {
                Text(otsikko)
                    .font(.caption)
                    .bold()
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
            }

            Text(kysymys.kysymys)
                .font(.headline)
                .foregroundColor(.primary)

            VStack(spacing: 8) {
                ForEach(kysymys.vaihtoehdot) { vaihtoehto in
                    Button {
                        if kysymys.monivalinta {
                            if valitut.contains(vaihtoehto.nimi) {
                                valitut.remove(vaihtoehto.nimi)
                            } else {
                                valitut.insert(vaihtoehto.nimi)
                            }
                        } else {
                            onVastaus(vaihtoehto.nimi)
                        }
                    } label: {
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: kysymys.monivalinta ? (valitut.contains(vaihtoehto.nimi) ? "checkmark.square.fill" : "square") : "circle")
                                .foregroundColor(valitut.contains(vaihtoehto.nimi) ? .accentColor : .secondary)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(vaihtoehto.nimi)
                                    .font(.body)
                                    .bold()
                                if let kuvaus = vaihtoehto.kuvaus, !kuvaus.isEmpty {
                                    Text(kuvaus)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            Spacer()
                        }
                        .padding(10)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .controlBackgroundColor)))
                    }
                    .buttonStyle(.plain)
                }
            }

            if kysymys.monivalinta && !valitut.isEmpty {
                Button("Vahvista valinnat (\(valitut.count))") {
                    onVastaus(Array(valitut).joined(separator: ", "))
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color(nsColor: .windowBackgroundColor)))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.secondary.opacity(0.2), lineWidth: 1))
    }
}
