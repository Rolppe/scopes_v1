// Lukitusnäytön ja kotinäytön widget (NOTIFICATIONS-TAUSTA, käyttäjä 15.10.2026): käyttäjää odottavat skoopit äpin
// viimeisimmästä hausta (Jaettu/Tilannekuva.swift). Äppi lataa aikajanan uudelleen, kun sisältö muuttuu tai hakuaika
// vanhenee (WidgetCenter.reloadAllTimelines), joten widget ei herää itse eikä käytä verkkoa. Hakuajan ikä näkyy
// suhteellisena, jotta vanha tieto erottuu tuoreesta. Napautus avaa ensimmäisen odottavan skoopin (skoopit://skooppi/<nimi>).
import SwiftUI
import WidgetKit

struct Merkinta: TimelineEntry {
    let date: Date
    let kuva: Tilannekuva?
}

struct Tarjoaja: TimelineProvider {
    private static let esimerkki = Tilannekuva(aika: Date(), odottavat: [.init(nimi: "scopes", tila: "kysely")])

    func placeholder(in context: Context) -> Merkinta { Merkinta(date: Date(), kuva: Self.esimerkki) }

    func getSnapshot(in context: Context, completion: @escaping (Merkinta) -> Void) {
        completion(Merkinta(date: Date(), kuva: context.isPreview ? Self.esimerkki : Tilannekuva.lue()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Merkinta>) -> Void) {
        completion(Timeline(entries: [Merkinta(date: Date(), kuva: Tilannekuva.lue())], policy: .never))
    }
}

struct SkoopitNakyma: View {
    let merkinta: Merkinta
    @Environment(\.widgetFamily) private var perhe

    private var odottavat: [Tilannekuva.Rivi] { merkinta.kuva?.odottavat ?? [] }
    private var kysely: Bool { odottavat.contains { $0.tila == "kysely" } }

    var body: some View {
        Group {
            switch perhe {
            case .accessoryInline:
                Text(merkinta.kuva == nil ? "Scopes: avaa äppi" : odottavat.isEmpty ? "Scopes: ei odottavia" : "Scopes: \(odottavat.count) odottaa")
            case .accessoryCircular:
                ZStack {
                    AccessoryWidgetBackground()
                    VStack(spacing: 0) {
                        Image(systemName: kysely ? "questionmark.bubble" : "bubble.left")
                        Text("\(odottavat.count)").font(.headline).monospacedDigit()
                    }
                }
            default:
                lista
            }
        }
        .widgetURL(URL(string: odottavat.first.map { "skoopit://skooppi/\($0.nimi)" } ?? "skoopit://"))
        .containerBackground(for: .widget) { Color.clear }
    }

    private var lista: some View {
        let rivit = perhe == .accessoryRectangular ? 2 : 4
        return VStack(alignment: .leading, spacing: 1) {
            Text(odottavat.isEmpty ? "Scopes" : "Scopes · \(odottavat.count) odottaa").font(.headline).lineLimit(1)
            if merkinta.kuva == nil {
                Text("Avaa äppi kerran").font(.caption)
            } else if odottavat.isEmpty {
                Text("Ei odottavia").font(.caption)
            } else {
                ForEach(odottavat.prefix(rivit), id: \.nimi) { r in
                    Label(r.nimi, systemImage: r.tila == "kysely" ? "questionmark.bubble" : "bubble.left")
                        .font(.caption).lineLimit(1)
                }
            }
            if let aika = merkinta.kuva?.aika {
                Text(aika, style: .relative).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

@main
struct SkoopitWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "SkoopitWidget", provider: Tarjoaja()) { SkoopitNakyma(merkinta: $0) }
            .configurationDisplayName("Scopes")
            .description("Käyttäjää odottavat skoopit.")
            .supportedFamilies([.accessoryRectangular, .accessoryInline, .accessoryCircular, .systemSmall])
    }
}
