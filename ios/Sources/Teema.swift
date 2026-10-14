// Äpin yhteinen ilme (DESIGN-ILME, scopes design 14.10.2026; löydökset scopes/design/KATSELMUS.md I1–I8).
// Yksi korostusväri: turkoosi (käyttäjä 14.10.2026: "Ei käytetä claude väriä. Käytetään turkoosia").
// Vaalea sävy on tummempi kuin puhdas turkoosi #40E0D0, koska se on tekstinä valkoisella vain 1,7:1;
// #0F766E on 5,5:1 valkoisella ja 4,9:1 ryhmätaustalla. Tumma tila käyttää kirkasta #2DD4BF:ää (9,1:1).
import SwiftUI
import UIKit

enum Teema {
    // MARK: Värit — jokaisella värillä yksi merkitys.

    /// Toiminnot, linkit, valinnat ja laajennusnapit; myös `.tint` koko äpille.
    static let korostus = Color(vaalea: 0x0F766E, tumma: 0x2DD4BF)
    /// Teksti ja kuvake täytetyn korostuspinnan päällä (valittu suodatin, lähetysnappi).
    static let korostusPaalla = Color(vaalea: 0xFFFFFF, tumma: 0x042F2E)
    /// Valitun rivin ja oman viestin tausta.
    static let korostusTausta = korostus.opacity(0.14)
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
    static let kansio = korostus
    /// Skoopin istunto odottaa käyttäjän vastausta.
    static let odottaa = Color.yellow

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
