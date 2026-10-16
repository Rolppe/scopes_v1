// Ulkoasu (DESIGN-ULKOASU, käyttäjä 14.10.2026: "ulkoasu valikko mistä saa valita korostus värit ja apple glass tyyli
// ja muut tarvittavat"): korostusväri, teema ja Liquid Glass. Arvot ovat UserDefaultsissa. Observation kirjaa lukemisen
// jokaisen näkymän bodyssä, joten `Teema.korostus` vaihtuu kaikkialla ilman, että kutsupaikat tuntevat asetusta.
import Observation
import SwiftUI
import UIKit

/// Korostusvärit. Vaalea sävy on tekstinä valkoisella vähintään 4,5:1 ja ryhmätaustalla #F2F2F7 vähintään 4,5:1;
/// tumma sävy on mustalla vähintään 7:1. Oranssi ja punainen puuttuvat, koska ne ovat varoitus ja virhe (ILME.md).
enum Korostus: String, CaseIterable, Identifiable {
    case turkoosi, sininen, indigo, violetti, pinkki, vihrea, grafiitti

    var id: String { rawValue }

    var nimi: String {
        switch self {
        case .turkoosi: "Turkoosi"
        case .sininen: "Sininen"
        case .indigo: "Indigo"
        case .violetti: "Violetti"
        case .pinkki: "Pinkki"
        case .vihrea: "Vihreä"
        case .grafiitti: "Grafiitti"
        }
    }

    /// Vaalean ja tumman tilan sävy heksoina.
    private var savyt: (vaalea: UInt32, tumma: UInt32) {
        switch self {
        case .turkoosi: (0x0F766E, 0x2DD4BF)
        case .sininen: (0x1D4ED8, 0x60A5FA)
        case .indigo: (0x4338CA, 0x818CF8)
        case .violetti: (0x7E22CE, 0xC084FC)
        case .pinkki: (0xBE185D, 0xF472B6)
        case .vihrea: (0x15803D, 0x4ADE80)
        case .grafiitti: (0x374151, 0xD1D5DB)
        }
    }

    var vari: Color { Color(vaalea: savyt.vaalea, tumma: savyt.tumma) }

    /// Kytkimen rata: vaalea sävy molemmissa tiloissa, koska valkoinen nuppi katoaa tumman tilan kirkkaalle sävylle
    /// (KATSELMUS K3: #2DD4BF on valkoisella 1,6:1, #0F766E 5,5:1).
    var kytkin: Color { Color(vaalea: savyt.vaalea, tumma: savyt.vaalea) }

    /// Teksti täytetyn korostuspinnan päällä: valkoinen vaaleassa tilassa, lähes musta tummassa (≥ 6,3:1).
    var paalla: Color {
        self == .turkoosi ? Color(vaalea: 0xFFFFFF, tumma: 0x042F2E) : Color(vaalea: 0xFFFFFF, tumma: 0x111111)
    }
}

enum Teematila: String, CaseIterable, Identifiable {
    case jarjestelma, vaalea, tumma

    var id: String { rawValue }

    var nimi: String {
        switch self {
        case .jarjestelma: "Järjestelmä"
        case .vaalea: "Vaalea"
        case .tumma: "Tumma"
        }
    }

    var tyyli: UIUserInterfaceStyle {
        switch self {
        case .jarjestelma: .unspecified
        case .vaalea: .light
        case .tumma: .dark
        }
    }
}

/// Tekstikoko askelina iPhonen oman tekstikokoasetuksen ympärillä (DESIGN-FONTTI, käyttäjä 14.10.2026: suhteessa
/// iPhoneen), jotta saavutettavuuskoot toimivat yhä. Kattoja (palkit, kuvakenapit) noudatetaan kaikilla tasoilla.
enum Tekstikoko: String, CaseIterable, Identifiable {
    case pieni, normaali, suuri

    var id: String { rawValue }

    var nimi: String {
        switch self {
        case .pieni: "Pieni"
        case .normaali: "Normaali"
        case .suuri: "Suuri"
        }
    }

    /// Askeleet Dynamic Typen asteikolla: oletuskoossa leipäteksti 16 / 17 / 19 pt (Suuri +2 = 21 pt oli puhelimessa liian
    /// suuri, käyttäjä 14.10.2026).
    private var askel: Int {
        switch self {
        case .pieni: -1
        case .normaali: 0
        case .suuri: 1
        }
    }

    func koko(_ jarjestelma: DynamicTypeSize) -> DynamicTypeSize {
        let kaikki = DynamicTypeSize.allCases
        let i = (kaikki.firstIndex(of: jarjestelma) ?? kaikki.firstIndex(of: .large) ?? 0) + askel
        return kaikki[min(max(i, 0), kaikki.count - 1)]
    }
}

/// Viestikuplan ja kysymyskortin kirjasin (DESIGN-FONTTI). Järjestelmän omia muotoiluja: ei pakattuja fontteja, ja
/// Dynamic Typen optiset koot säilyvät. Valikot, palkit ja koodi pysyvät SF Prona ja SF Monona.
enum Viestifontti: String, CaseIterable, Identifiable {
    case sfPro, pyorea, serif

    var id: String { rawValue }

    var nimi: String {
        switch self {
        case .sfPro: "SF Pro"
        case .pyorea: "SF Rounded"
        case .serif: "New York"
        }
    }

    var muoto: Font.Design {
        switch self {
        case .sfPro: .default
        case .pyorea: .rounded
        case .serif: .serif
        }
    }
}

@Observable final class Ulkoasu {
    static let jaettu = Ulkoasu()

    /// Liquid Glass on iOS 26:n materiaali; vanhemmassa järjestelmässä kytkin on lukittu ja pinnat tasaisia.
    static var lasiTuettu: Bool {
        if #available(iOS 26, *) { true } else { false }
    }

    var korostus: Korostus { didSet { UserDefaults.standard.set(korostus.rawValue, forKey: "ulkoasu.korostus") } }
    var teema: Teematila {
        didSet {
            UserDefaults.standard.set(teema.rawValue, forKey: "ulkoasu.teema")
            kayta()
        }
    }
    var lasi: Bool { didSet { UserDefaults.standard.set(lasi, forKey: "ulkoasu.lasi") } }
    var tekstikoko: Tekstikoko { didSet { UserDefaults.standard.set(tekstikoko.rawValue, forKey: "ulkoasu.tekstikoko") } }
    var viestifontti: Viestifontti {
        didSet { UserDefaults.standard.set(viestifontti.rawValue, forKey: "ulkoasu.viestifontti") }
    }

    var lasiKaytossa: Bool { lasi && Self.lasiTuettu }

    /// Peru palauttaa asetukset tähän: Ulkoasu-alavalikon muutokset näkyvät heti, mutta tallentuvat vasta Tallenna-painikkeella.
    struct Tila: Equatable {
        var korostus: Korostus
        var teema: Teematila
        var lasi: Bool
        var tekstikoko: Tekstikoko
        var viestifontti: Viestifontti
    }

    var tila: Tila {
        get { Tila(korostus: korostus, teema: teema, lasi: lasi, tekstikoko: tekstikoko, viestifontti: viestifontti) }
        set {
            if korostus != newValue.korostus { korostus = newValue.korostus }
            if teema != newValue.teema { teema = newValue.teema }
            if lasi != newValue.lasi { lasi = newValue.lasi }
            if tekstikoko != newValue.tekstikoko { tekstikoko = newValue.tekstikoko }
            if viestifontti != newValue.viestifontti { viestifontti = newValue.viestifontti }
        }
    }

    private init(oletukset: UserDefaults = .standard) {
        korostus = oletukset.string(forKey: "ulkoasu.korostus").flatMap(Korostus.init) ?? .turkoosi
        teema = oletukset.string(forKey: "ulkoasu.teema").flatMap(Teematila.init) ?? .jarjestelma
        lasi = oletukset.object(forKey: "ulkoasu.lasi") as? Bool ?? true
        tekstikoko = oletukset.string(forKey: "ulkoasu.tekstikoko").flatMap(Tekstikoko.init) ?? .normaali
        viestifontti = oletukset.string(forKey: "ulkoasu.viestifontti").flatMap(Viestifontti.init) ?? .sfPro
    }

    /// Teema ikkunoiden tyylinä eikä `.preferredColorScheme`:nä: SwiftUI ei palaa järjestelmän tyyliin, kun
    /// `preferredColorScheme` vaihtuu takaisin nil:ksi kesken ajon, ja ikkunan tyyli kattaa myös arkit.
    func kayta() {
        for ikkuna in UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).flatMap(\.windows) {
            ikkuna.overrideUserInterfaceStyle = teema.tyyli
        }
    }
}

extension View {
    /// Pinta Liquid Glassina, kun Ulkoasu-asetus on päällä (iOS 26+), muuten tasainen `tausta`. `savy` sävyttää lasin
    /// (korostettu pinta), nil on kirkas lasi; `kosketus` lisää lasin painallusvasteen napeille.
    @ViewBuilder
    func lasiPinta<S: Shape>(_ tausta: some ShapeStyle, savy: Color? = nil, in muoto: S, kosketus: Bool = false) -> some View {
        if #available(iOS 26, *), Ulkoasu.jaettu.lasiKaytossa {
            glassEffect(Glass.regular.tint(savy).interactive(kosketus), in: muoto)
        } else {
            background(tausta, in: muoto)
        }
    }
}

/// Asettaa iPhonen tekstikoon Tekstikoko-askelin siirrettynä; alemmat `...`-katot rajaavat yhä. iPhonen koko luetaan
/// UIKitistä eikä perityn ympäristön kautta, jotta arkin oma `.tekstikoko()` ei siirrä kokoa kahdesti: arkki ei perinyt
/// juuren kokoa (simulaattori 14.10.2026). Ympäristön luku piirtää uudelleen, kun iPhonen asetus vaihtuu.
private struct TekstikokoMuokkain: ViewModifier {
    @Environment(\.dynamicTypeSize) private var peritty

    func body(content: Content) -> some View {
        let jarjestelma = DynamicTypeSize(UIApplication.shared.preferredContentSizeCategory) ?? peritty
        return content.dynamicTypeSize(Ulkoasu.jaettu.tekstikoko.koko(jarjestelma))
    }
}

extension View {
    /// Ulkoasu-asetuksen tekstikoko koko näkymäpuulle (juuri, Juuri.swift).
    func tekstikoko() -> some View { modifier(TekstikokoMuokkain()) }

    /// Viestitekstin kirjasin Ulkoasu-asetuksesta (viestikupla ja kysymyskortti).
    func viestifontti() -> some View { fontDesign(Ulkoasu.jaettu.viestifontti.muoto) }
}

extension ToolbarContent {
    /// Yläpalkin napin järjestelmän lasikapseli vain, kun Liquid Glass on päällä: tasaisessa tilassa nappi on pelkkä
    /// kuvake (käyttäjä 14.10.2026).
    @ToolbarContentBuilder
    func lasiKapseli() -> some ToolbarContent {
        if #available(iOS 26, *) {
            sharedBackgroundVisibility(Ulkoasu.jaettu.lasiKaytossa ? .automatic : .hidden)
        } else {
            self
        }
    }
}

extension ToolbarContent {
    /// Yläpalkin kohta ilman järjestelmän kapselia Liquid Glass -tilassakin.
    @ToolbarContentBuilder
    func kapseliPois() -> some ToolbarContent {
        if #available(iOS 26, *) {
            sharedBackgroundVisibility(.hidden)
        } else {
            self
        }
    }
}

// Asetukset → Ulkoasu: teema, korostusväri ja Liquid Glass. Valinta näkyy heti koko äpissä (myös tämän arkin takana);
// AsetuksetView tallentaa tai palauttaa sen.
struct UlkoasuAsetukset: View {
    @Bindable private var ulkoasu = Ulkoasu.jaettu

    var body: some View {
        Form {
            Section("Teema") {
                Picker("Teema", selection: $ulkoasu.teema) {
                    ForEach(Teematila.allCases) { Text($0.nimi).tag($0) }
                }
                .pickerStyle(.segmented)
                .accessibilityIdentifier("ulkoasu-teema")
            }
            Section {
                ForEach(Korostus.allCases) { k in
                    Button { ulkoasu.korostus = k } label: {
                        HStack(spacing: Teema.Vali.m) {
                            Circle().fill(k.vari).frame(width: 24, height: 24)
                            Text(k.nimi).foregroundStyle(Color.primary)
                            Spacer()
                            if ulkoasu.korostus == k { Image(systemName: "checkmark").font(.body.weight(.semibold)) }
                        }
                        .contentShape(Rectangle())
                    }
                    .accessibilityIdentifier("korostus-\(k.rawValue)")
                    .accessibilityAddTraits(ulkoasu.korostus == k ? .isSelected : [])
                }
            } header: { Text("Korostusväri") } footer: {
                Text("Napit, valinnat ja oma viesti. Oranssi ja punainen on varattu avoimille vioille ja virheille.")
            }
            Section {
                Toggle("Liquid Glass", isOn: $ulkoasu.lasi)
                    .tint(Teema.kytkin)
                    .disabled(!Ulkoasu.lasiTuettu)
                    .accessibilityIdentifier("ulkoasu-lasi")
                esikatselu
            } header: { Text("Pinnat") } footer: {
                Text(Ulkoasu.lasiTuettu
                     ? "Suodatinnapit, lähetysnappi ja kirjoituskenttä lasina. Pois: tasaiset värit."
                     : "Liquid Glass vaatii iOS 26:n; pinnat ovat tasaisia.")
            }
            Section {
                Picker("Tekstikoko", selection: $ulkoasu.tekstikoko) {
                    ForEach(Tekstikoko.allCases) { Text($0.nimi).tag($0) }
                }
                .pickerStyle(.segmented)
                .accessibilityIdentifier("ulkoasu-tekstikoko")
                ForEach(Viestifontti.allCases) { f in
                    Button { ulkoasu.viestifontti = f } label: {
                        HStack {
                            Text(f.nimi).fontDesign(f.muoto).foregroundStyle(Color.primary)
                            Spacer()
                            if ulkoasu.viestifontti == f { Image(systemName: "checkmark").font(.body.weight(.semibold)) }
                        }
                        .contentShape(Rectangle())
                    }
                    .accessibilityIdentifier("viestifontti-\(f.rawValue)")
                    .accessibilityAddTraits(ulkoasu.viestifontti == f ? .isSelected : [])
                }
                Text("Hei! Tältä näyttää viesti valitulla kirjasimella ja koolla.")
                    .viestifontti()
                    .padding(Teema.Vali.m)
                    .background(Teema.pinta, in: RoundedRectangle(cornerRadius: Teema.Kulma.kortti))
                    .accessibilityIdentifier("ulkoasu-tekstinayte")
            } header: { Text("Teksti") } footer: {
                Text("Koko on suhteessa iPhonen tekstikokoon ja koskee koko äppiä. Kirjasin koskee viestejä ja kysymyskorttia; valikot, palkit ja koodi pysyvät ennallaan.")
            }
        }
        .navigationTitle("Ulkoasu")
    }

    // Samat pinnat kuin äpissä: valittu ja valitsematon suodatin sekä lähetysnappi.
    private var esikatselu: some View {
        HStack(spacing: Teema.Vali.s) {
            ForEach([true, false], id: \.self) { valittu in
                Text(valittu ? "Valittu" : "Muu").font(.body.weight(.semibold))
                    .padding(.horizontal, Teema.Vali.l).padding(.vertical, Teema.Vali.s)
                    .foregroundStyle(valittu ? Teema.korostusPaalla : Color.primary)
                    .lasiPinta(valittu ? Teema.korostus : Teema.passiivinen, savy: valittu ? Teema.korostus : nil, in: Capsule())
            }
            Spacer()
            Image(systemName: "arrow.up").font(.body.weight(.semibold))
                .foregroundStyle(Teema.korostusPaalla)
                .frame(width: 32, height: 32)
                .lasiPinta(Teema.korostus, savy: Teema.korostus, in: Circle())
        }
        .lineLimit(1)
        .dynamicTypeSize(...DynamicTypeSize.xxLarge)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Esikatselu")
        .accessibilityIdentifier("ulkoasu-esikatselu")
    }
}
