// Äpin yhteinen ilme (DESIGN-ILME, scopes design 14.10.2026; löydökset scopes/design/KATSELMUS.md I1–I8).
// Yksi korostusväri: turkoosi (käyttäjä 14.10.2026: "Ei käytetä claude väriä. Käytetään turkoosia").
// Vaalea sävy on tummempi kuin puhdas turkoosi #40E0D0, koska se on tekstinä valkoisella vain 1,7:1;
// #0F766E on 5,5:1 valkoisella ja 4,9:1 ryhmätaustalla. Tumma tila käyttää kirkasta #2DD4BF:ää (9,1:1).
import SwiftUI
import UIKit

enum Teema {
    // MARK: Värit — jokaisella värillä yksi merkitys.

    /// Toiminnot, linkit, valinnat ja laajennusnapit; myös `.tint` koko äpille. Käyttäjän valitsema (Asetukset → Ulkoasu,
    /// oletus turkoosi); lukeva näkymä piirtyy uudelleen, kun valinta vaihtuu (Ulkoasu.swift).
    static var korostus: Color { Ulkoasu.jaettu.korostus.vari }
    /// Teksti ja kuvake täytetyn korostuspinnan päällä (valittu suodatin, lähetysnappi).
    static var korostusPaalla: Color { Ulkoasu.jaettu.korostus.paalla }
    /// Kytkimen (Toggle) rata päällä; `.tint` koko äpille ei käy, koska tumman tilan korostus vie nupin näkyvyyden.
    static var kytkin: Color { Ulkoasu.jaettu.korostus.kytkin }
    /// Valitun rivin ja oman viestin tausta.
    static var korostusTausta: Color { korostus.opacity(0.14) }
    /// Avoimet viat (> 0). Ei virhe eikä toiminto.
    static let varoitus = Color.orange
    /// Epäonnistunut toiminto tai palvelun hylkäys.
    static let virhe = Color.red
    /// Toissijainen teksti ja passiiviset kuvakkeet.
    static let toissijainen = Color.secondary
    /// Kortin ja syöttökentän pinta ryhmätaustalla.
    static let pinta = Color(.secondarySystemBackground)
    /// Valitsematon pilleri, estetty nappi.
    static let passiivinen = Color(.systemGray5)
    /// Käsittelyssä olevan skoopin kansio (hehkuu); pakattu on harmaa ääriviiva.
    static var kansio: Color { korostus }
    /// Skoopin istunnossa on kyselykortti auki (SCOPES-LISTA-KYSELYVARI).
    static let kysely = Color.yellow
    /// Skoopin istunto odottaa käyttäjää muuten: vuoro valmis tai lupakysely.
    static let odottaa = Color.green

    // MARK: Välistys — 4 pt:n askel.

    enum Vali {
        static let xs: CGFloat = 4
        static let s: CGFloat = 8
        static let m: CGFloat = 12
        static let l: CGFloat = 16
        static let xl: CGFloat = 24
    }

    // MARK: Kulmasäteet — pillerit ja pyöreät napit ovat Capsule/Circle, eivät säteitä.

    enum Kulma {
        /// Merkki, laajennusnappi, pieni tunniste.
        static let pieni: CGFloat = 8
        /// Kortti, listan ryhmä, kysymyskortti.
        static let kortti: CGFloat = 14
        /// Arkki ja syöttöalue.
        static let arkki: CGFloat = 24
    }

    // MARK: Tekstityylit — Dynamic Typen tyylit, ei kiinteitä kokoja.

    enum Teksti {
        /// Skoopin tai chatin nimi listassa.
        static let nimi = Font.body.weight(.semibold)
        /// Paketin tunnus nimen alla: pienempi ja kevyempi kuin nimi (KATSELMUS I3).
        static let tunnus = Font.footnote.weight(.medium)
        /// Osion otsikko kortin yläpuolella.
        static let osio = Font.subheadline.weight(.medium)
        /// Merkkirivin luvut (asiat, viat, tokenit).
        static let merkki = Font.caption.monospacedDigit()
        /// Polut ja tiedostosisältö.
        static let koodi = Font.footnote.monospaced()
    }
}

extension Color {
    /// Vaalean ja tumman tilan väri heksoina.
    init(vaalea: UInt32, tumma: UInt32) {
        self.init(UIColor { $0.userInterfaceStyle == .dark ? UIColor(heksa: tumma) : UIColor(heksa: vaalea) })
    }
}

private extension UIColor {
    convenience init(heksa: UInt32) {
        self.init(red: CGFloat((heksa >> 16) & 0xFF) / 255, green: CGFloat((heksa >> 8) & 0xFF) / 255,
                  blue: CGFloat(heksa & 0xFF) / 255, alpha: 1)
    }
}

// MARK: Iso tekstikoko (DESIGN-ISOTEKSTI, KATSELMUS K4–K7)

/// Pakettitunnus, joka rivittyy vain väliviivan tai välilyönnin kohdalta (K7: `UUDELLEENKA`/`YNNISTYS`).
/// Jokainen osa on yksi rivi; rivin leveyttä pidempi osa pienenee eikä katkea kesken sanan.
struct Tunnus: View {
    let teksti: String

    var body: some View {
        OsaVirta {
            ForEach(Array(osat.enumerated()), id: \.offset) { _, osa in
                Text(verbatim: osa).lineLimit(1).minimumScaleFactor(0.5)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(teksti)
        .accessibilityAddTraits(.isStaticText)
    }

    /// "EXPRESSO-IOS-KYTKIN" → ["EXPRESSO-", "IOS-", "KYTKIN"]; välilyönti jää edellisen osan perään.
    private var osat: [String] {
        var tulos: [String] = []
        var nyt = ""
        for m in teksti {
            nyt.append(m)
            if m == "-" || m == " " { tulos.append(nyt); nyt = "" }
        }
        if !nyt.isEmpty { tulos.append(nyt) }
        return tulos
    }
}

/// Asettelee osat riveille vasemmalta oikealle ja aloittaa uuden rivin, kun seuraava osa ei mahdu.
private struct OsaVirta: Layout {
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rivit = asettele(leveys: proposal.width ?? .infinity, subviews)
        return CGSize(width: rivit.map(\.leveys).max() ?? 0, height: rivit.reduce(0) { $0 + $1.korkeus })
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for rivi in asettele(leveys: bounds.width, subviews) {
            var x = bounds.minX
            for (i, koko) in rivi.osat {
                subviews[i].place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(koko))
                x += koko.width
            }
            y += rivi.korkeus
        }
    }

    private struct Rivi {
        var osat: [(Int, CGSize)] = []
        var leveys: CGFloat = 0
        var korkeus: CGFloat = 0
    }

    private func asettele(leveys: CGFloat, _ subviews: Subviews) -> [Rivi] {
        var rivit: [Rivi] = []
        var nyt = Rivi()
        for (i, osa) in subviews.enumerated() {
            var koko = osa.sizeThatFits(.unspecified)
            if koko.width > leveys { koko = osa.sizeThatFits(ProposedViewSize(width: leveys, height: nil)) }
            if !nyt.osat.isEmpty && nyt.leveys + koko.width > leveys { rivit.append(nyt); nyt = Rivi() }
            nyt.osat.append((i, koko))
            nyt.leveys += koko.width
            nyt.korkeus = max(nyt.korkeus, koko.height)
        }
        if !nyt.osat.isEmpty { rivit.append(nyt) }
        return rivit
    }
}

/// Merkkirivi (asiat, viat, konteksti) vaakarivinä, kun se mahtuu, muuten pinona (K6: "1 / 76 k" katkesi
/// kahdelle riville). Luku ei koskaan rivity: jokainen merkki on yksi rivi.
struct MerkkiRivi<Sisalto: View>: View {
    var vali: CGFloat = Teema.Vali.m
    @ViewBuilder let sisalto: () -> Sisalto

    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: vali) { sisalto() }
            VStack(alignment: .leading, spacing: Teema.Vali.xs) { sisalto() }
        }
        .lineLimit(1)
    }
}
