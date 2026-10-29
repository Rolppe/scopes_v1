# Skooppien organisointi: Toteutustehtävät ja -lipukkeet (DESIGN-ORGANIZING-TOTEUTUSKOORDINAATIO)

Päiväys: 27.10.2026  
Skooppi: `scopes design organizing`  
Viitedokumentit:
- `scopes/design/organizing/SUUNNITELMA.md` (UX- ja arkkitehtuurisuunnitelma)
- `scopes/design/ILME.md` (visuaalinen ilme ja design tokenit)
- `scopes/ios/Sources/Teema.swift` (Teema-komponentit)

---

## 1. Yhteenveto ja koordinointi

Tämä dokumentti määrittelee omistajasäännön (TYÖTAVAT sääntö 15) mukaiset valmiit toteutuslipukkeet kahdelle toteuttavalle omistajaskoopille:
1. **`scopes lista`** (iOS: `scopes/ios/Sources/Sivupalkki.swift`, `Juuri.swift` jne.)
2. **`scopes macos`** (macOS: `scopes/macos/Sources/MacSidebar.swift`, `MacRootView.swift` jne.)

Molemmat skoopit voivat poimia nämä lipukkeet suoraan omiin paketteihinsa ja ajaa toteutuksen omassa istunnossaan.

---

## 2. Toteutuslipukkeet: `scopes lista` (iOS)

### Lipuke L-ORG-01: Suosikkien (Pin) tilanhallinta ja pysyvyys
- **Tavoite:** Mahdollistaa skooppien kiinnittäminen suosikkeihin ja tilan säilyminen iOS-äpin sulkemisen ja käynnistyksen yli.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - Avain: `@AppStorage("sivupalkkiKiinnitetyt") private var kiinnitetytTeksti = ""`
  - Apumuuttuja:
    ```swift
    private var kiinnitettySet: Set<String> {
        Set(kiinnitetytTeksti.split(separator: "\n").map(String.init))
    }
    ```
  - Apumetodit:
    - `private func onkoKiinnitetty(_ skooppi: String) -> Bool { kiinnitettySet.contains(skooppi) }`
    - `private func toggleKiinnitetty(_ skooppi: String)`:
      - Jos `kiinnitettySet` sisältää skoopin nimen, poistaa sen.
      - Muutoin lisää skoopin nimen settiin.
      - Tallentaa uuden setin rivinvaihdoin eroteltuna `kiinnitetytTeksti`in (`Array(uusiSet).sorted().joined(separator: "\n")`).
- **Hyväksymiskriteeri:**
  - Skoopin kiinnitys ja irrotus päivittävät `@AppStorage`-tilan reaktiivisesti.
  - Tila säilyy puhelimen uudelleenkäynnistyksessä.

---

### Lipuke L-ORG-02: Kiinnitettyjen osio `Scope`-välilehdellä
- **Tavoite:** Nosta suosikit aina listan huipulle ennen aktiivisia istuntoja, jotta tärkeimmät skoopit ovat heti käsillä.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - Kun `suodatin == .skoopit` tai `.kaikki`:
    - Erottele kohteet kahteen listaan: `kiinnitetytKohteet` ja `muutKohteet`.
    - `kiinnitetytKohteet`: ne skoopit, joiden `s.nimi` löytyy `kiinnitettySet`istä.
    - Jos `!kiinnitetytKohteet.isEmpty`:
      - Luodaan oma `Section`:
        ```swift
        Section {
            ForEach(kiinnitetytKohteet) { k in
                if case let .skooppi(s) = k {
                    vedettava(k, s)
                        .listRowBackground(valittu(k) ? Teema.korostusTausta : Teema.korostusTausta.opacity(0.12))
                }
            }
        } header: {
            HStack(spacing: Teema.Vali.pieni) {
                Image(systemName: "pin.fill")
                    .font(.caption2)
                    .foregroundStyle(Teema.korostus)
                Text("KIINNITETYT (\(kiinnitetytKohteet.count))")
                    .font(Teema.Teksti.tunnus)
                    .foregroundStyle(Teema.korostus)
                Spacer()
            }
        }
        ```
    - Rivien visuaalinen tunnus:
      - Nastakuvake `Image(systemName: "pin.fill")` (10×10 pt, `Teema.korostus`) skoopin nimen edessä.
    - Duplikaattien esto: `muutKohteet` ei sisällä kiinnitettyjä skooppeja, jotta samat skoopit eivät toistu listalla kahdesti.
- **Hyväksymiskriteeri:**
  - Kiinnitetyt skoopit näkyvät selkeästi erottuvassa omassa osiossaan listan kärjessä.
  - Jos yhtään skooppia ei ole kiinnitetty, osiota ei piirretä lainkaan.

---

### Lipuke L-ORG-03: Kiinnityksen eleet ja toiminnot (iOS)
- **Tavoite:** Mahdollistaa skoopin kiinnittäminen/irrottaminen nopeasti pyyhkäisyllä ja kontekstivalikosta.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - **Pyyhkäisyele oikealle (Swipe Right):**
    - Nykyisessä vedettävässä rivissä (`vedettava(k, s)`):
      - Lisää nasta-painike virtanapin ja arkistoinnin rinnalle:
        ```swift
        Button {
            toggleKiinnitetty(s.nimi)
            sulje()
        } label: {
            Image(systemName: onkoKiinnitetty(s.nimi) ? "pin.slash.fill" : "pin.fill")
                .foregroundStyle(Teema.korostusPaalla)
                .frame(width: 44, height: 44)
                .background(Teema.korostus)
                .clipShape(Circle())
        }
        .accessibilityIdentifier("kiinnita-\(s.nimi)")
        ```
  - **Kontekstivalikko (`.contextMenu`):**
    - Lisää skooppirivin valikkoon:
      ```swift
      Button {
          toggleKiinnitetty(s.nimi)
      } label: {
          Label(onkoKiinnitetty(s.nimi) ? "Irrota suosikeista" : "Kiinnitä suosikkeihin",
                systemImage: onkoKiinnitetty(s.nimi) ? "pin.slash" : "pin")
      }
      ```
- **Hyväksymiskriteeri:**
  - Pyyhkäisy oikealle paljastaa nastapainikkeen ja napautus kiinnittää/irrottaa skoopin sulkien rivin sulavasti.
  - Pitkä painallus tarjoaa saman toiminnon tekstiselitteellä ja ikonilla.

---

### Lipuke L-ORG-04: Pikasuodatus (Quick Filter Chips) hakukentän alle
- **Tavoite:** Tarjoa yhden kosketuksen pikasuodatus ilman näppäimistöä (Kaikki, Aktiiviset, Kiinnitetyt, Viat, Pakatut).
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - Määrittele enum:
    ```swift
    private enum Pikasuodatin: String, CaseIterable, Identifiable {
        case kaikki = "Kaikki"
        case aktiiviset = "Aktiiviset"
        case kiinnitetyt = "Kiinnitetyt"
        case viat = "Viat"
        case pakatut = "Pakatut"

        var id: String { rawValue }
        var ikoni: String? {
            switch self {
            case .kaikki: return nil
            case .aktiiviset: return "bolt.fill"
            case .kiinnitetyt: return "pin.fill"
            case .viat: return "exclamationmark.triangle.fill"
            case .pakatut: return "archivebox"
            }
        }
    }
    ```
  - Tila: `@State private var pikasuodatin: Pikasuodatin = .kaikki`
  - Horisontaalinen pilleririvi hakukentän alapuolelle:
    ```swift
    private var pikasuodatinPillerit: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Teema.Vali.pieni) {
                ForEach(Pikasuodatin.allCases) { p in
                    Button {
                        withAnimation(.snappy) { pikasuodatin = p }
                    } label: {
                        HStack(spacing: 4) {
                            if let ikoni = p.ikoni {
                                Image(systemName: ikoni)
                                    .font(.caption2)
                            }
                            Text(p.rawValue)
                                .font(Teema.Teksti.tunnus)
                            if let lkm = suodattimenLkm(p), lkm > 0 {
                                Text("\(lkm)")
                                    .font(.caption2.monospacedDigit())
                                    .padding(.horizontal, 4)
                                    .background(Capsule().fill(Color.secondary.opacity(0.2)))
                            }
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(pikasuodatin == p ? Teema.korostus : Teema.passiivinen)
                        .foregroundStyle(pikasuodatin == p ? Teema.korostusPaalla : Teema.toissijainen)
                        .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("suodatin-\(p.rawValue)")
                }
            }
            .padding(.horizontal, Teema.Vali.l)
            .padding(.vertical, Teema.Vali.pieni)
        }
    }
    ```
  - Suodatuslogiikka:
    - `.kaikki`: kaikki kyseisen välilehden kohteet.
    - `.aktiiviset`: rajaa vain kohteet, joiden `tilaNyt` on `"kasittely"`, `"kysely"` tai `"odottaa"`.
    - `.kiinnitetyt`: rajaa vain kohteet, jotka löytyvät `kiinnitettySet`istä.
    - `.viat`: rajaa vain kohteet, joissa `avoimetViat > 0`.
    - `.pakatut`: rajaa vain kohteet, joiden `tilaNyt` on `"pakattu"`.
- **Hyväksymiskriteeri:**
  - Pilleririvi rullaa pehmeästi, aktiivinen pilleri loistaa turkoosina (`Teema.korostus`).
  - Suodatus reagoi välittömästi ilman viivettä.

---

### Lipuke L-ORG-05: Allscope-integraatio ja puusuodatus
- **Tavoite:** Allscope-puunäkymässä kiinnitetyt skoopit saavat nastaikonin ja pikasuodatin rajaa puurakennetta fiksusti.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - Puurivillä (`allscopeRivi`): jos `onkoKiinnitetty(skooppi.nimi)`, näytetään nimen edessä `Image(systemName: "pin.fill").font(.caption2).foregroundStyle(Teema.korostus)`.
  - Pääryhmän otsikossa (Taso 0): laske mukaan ryhmän kiinnitetyt (esim. `★ \(kiinnitettyjenLkm)`).
  - Pikasuodattimen ollessa `.kiinnitetyt` tai `.aktiiviset`: puu suodattaa pois haarat, joissa ei ole ehtoa täyttäviä skooppeja, ja asettaa `allscopeAuki`-settiin automaattisesti ne haarat, joissa on osumia.
- **Hyväksymiskriteeri:**
  - Allscope tukee kiinnityksen indikointia ja suodatusta yhtenevästi listanäkymän kanssa.

---

### Lipuke L-ORG-06: Kansioiden ja tagien tietomalli sekä säilyvyys
- **Tavoite:** Luoda `OrganizingConfig`- ja `SkooppiKansio`-tietomallit sekä reaktiivinen säilyvyys ja migraatiokerros.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/OrganizingStore.swift` (tai `Sivupalkki.swift`)
- **Toteutusmääritys:**
  - Määrittele `SkooppiKansio: Codable, Identifiable, Sendable, Hashable`:
    ```swift
    public struct SkooppiKansio: Codable, Identifiable, Sendable, Hashable {
        public let id: String
        public var nimi: String
        public var ikoni: String
        public var vari: String          // Enum Korostus rawValue
        public var skoopit: [String]
        public var luotuAika: Date
        public var jarjestys: Int
    }
    ```
  - Määrittele `OrganizingConfig: Codable, Sendable`:
    ```swift
    public struct OrganizingConfig: Codable, Sendable {
        public var versio: Int
        public var kiinnitetyt: [String]
        public var kansiot: [SkooppiKansio]
        public var tagit: [String: [String]] // [skooppi: ["#ui", "#swift"]]
    }
    ```
  - Luo `@Observable final class OrganizingStore`:
    - Avain: `scopesOrganizingConfig`.
    - Automaattinen migraatio: jos avain puuttuu, lue `sivupalkkiKiinnitetyt` vanhasta tilasta.
    - Metodit:
      - `func lisaaKansio(nimi: String, ikoni: String, vari: String, skoopit: [String])`
      - `func paivitaKansio(_ kansio: SkooppiKansio)`
      - `func poistaKansio(id: String)`
      - `func toggleSkooppiKansioon(skooppi: String, kansioId: String)`
      - `func asetaTagit(skooppi: String, tagit: [String])`
      - `func lisaaTagi(skooppi: String, tagi: String)`
      - `func poistaTagi(skooppi: String, tagi: String)`
- **Hyväksymiskriteeri:**
  - Konfiguraatio sarjallistuu virheettömästi JSONiksi ja palautuu laitteen uudelleenkäynnistyksen jälkeen.
  - Vioittunut JSON ei kaada sovellusta vaan palauttaa turvallisen oletuksen.

---

### Lipuke L-ORG-07: Kansioiden luonti-, muokkaus- ja poistodialogit
- **Tavoite:** Käyttäjäystävällinen SwiftUI Sheet kansion luomiseen, tietojen muokkaamiseen ja poistamiseen.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/KansioMuokkausSheet.swift`
- **Toteutusmääritys:**
  - Lomakekentät:
    - Nimi: `TextField("Kansion nimi", text: $nimi)`.
    - Värin valinta: vaakasuuntainen valintalista `Korostus.allCases` värillisillä ympyröillä ja valintakehyksellä.
    - Ikonin valinta: 4x3 ruudukko SF Symboleita (`folder.fill`, `paintpalette.fill`, `bolt.fill`, `cpu.fill`, `hammer.fill`, `sparkles`, `tray.full.fill`, `globe`, `star.fill`, `tag.fill`, `terminal.fill`, `wrench.and.screwdriver.fill`).
    - Skooppien liittäminen: haettava lista nykyisistä skoopeista, joista käyttäjä voi valita kansioon kuuluvat kohteet.
    - Alareunassa "Poista kansio" -nappi punaisella varoituksella, jos kyseessä on muokkaustila.
- **Hyväksymiskriteeri:**
  - Arkin sulkeminen tallentaa kansion ja päivittää listanäkymän välittömästi.
  - Peruuta hylkää muutokset.

---

### Lipuke L-ORG-08: Kansioiden esittäminen `Scope`-listalla (Accordion / Collapsible)
- **Tavoite:** Esittää kansiot sulavasti laajennettavina haitarikortteina `Scope`-näkymässä kiinnitettyjen osion alapuolella.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - Tila: `@State private var avoimetKansiot: Set<String> = []`.
  - Osio `KANSIOT` Scope-näkymässä:
    - Näytetään, jos `!organizingStore.config.kansiot.isEmpty`.
    - Jokainen kansio piirretään `KansioOtsakeRivi`-komponenttina:
      - Kääntökuvake `Image(systemName: "chevron.right").rotationEffect(.degrees(onAuki ? 90 : 0))`.
      - Räätälöity ikoni pyöristetyssä neliössä kansion omalla värillä (`vari.vari`).
      - Kansion nimi ja lukumäärä `(lkm)`.
      - Tilasynteesi oikealla: aggregoitu tila (`käsittelyssä` oranssi hehku / `odottaa` keltainen / `viat` oranssi kolmio).
    - Jos kansio on auki (`avoimetKansiot.contains(kansio.id)`):
      - Piirretään kansion sisältämät skoopit 20 pt sisennetyllä listalla.
- **Hyväksymiskriteeri:**
  - Napautus avaa/sulkee kansion pehmeällä animaatiolla.
  - Aggregoitu tilaindikaattori vastaa kansion sisällä olevien skooppien todellista tilaa.

---

### Lipuke L-ORG-09: Skooppien siirtäminen kansioihin (Kontekstivalikko, Pyyhkäisy ja Drag & Drop)
- **Tavoite:** Helppo ja ergonominen tapa siirtää skooppeja kansioihin eri vuorovaikutustavoilla.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - **Kontekstivalikko:**
    - Lisää skooppirivin `.contextMenu`-valikkoon `Menu("Siirrä kansioon...")`:
      - Listaa kaikki olemassa olevat kansiot valintamerkillä niille, joihin skooppi kuuluu.
      - Valinta kytkee skoopin kuulumisen kansioon (`toggleSkooppiKansioon`).
      - Viimeisenä painike `+ Uusi kansio...`, joka avaa `KansioMuokkausSheet`:in.
  - **Pyyhkäisyele:**
    - Oikealle suuntautuva veto: lisätään kolmas toimintonappi `Image(systemName: "folder.badge.plus")`, joka avaa kansion pikavalitsimen.
  - **Drag and Drop:**
    - Lisää skooppiriville `.onDrag { NSItemProvider(object: s.nimi as NSString) }`.
    - Lisää kansion otsakeriville `.onDrop(of: [.text], isTargeted: $isDropTarget) { providers in ... }`.
    - Kun `isDropTarget == true`, kansio hehkuu korostusvärillä (`Teema.korostus`).
- **Hyväksymiskriteeri:**
  - Kaikki kolme tapaa lisäävät skoopin onnistuneesti kansioon ilman viivettä tai UI-nykimistä.

---

### Lipuke L-ORG-10: Virtuaaliryhmät ja Tagit (Tag-pillerit, Tag-haku ja Tag-pikasuodatus)
- **Tavoite:** Mahdollistaa skooppikohtaisten tagien liittäminen, esittäminen ja suodattaminen.
- **Omistaja:** `scopes lista`
- **Kohdetiedosto:** `scopes/ios/Sources/Sivupalkki.swift`
- **Toteutusmääritys:**
  - Tagien esitys:
    - Skooppirivin metatietojen rinnalla näytetään skoopin tagit vaakavirtana (`Capsule`-pillereinä, korkeus 18 pt, toissijainen väri).
  - Tagien muokkaus:
    - Skooppirivin kontekstivalikossa `Muokkaa tageja...` avaa pienen syöttödialogin.
  - Tag-suodatus:
    - Tagin napauttaminen asettaa hakukenttään `#taginNimi` ja suodattaa listan.
    - Hakukentän suodatuslogiikka tunnistaa `#`-alkuiset haut ja suodattaa `organizingStore.config.tagit`-tietojen perusteella.
- **Hyväksymiskriteeri:**
  - Tagit näkyvät selkeinä ja siisteinä osana skooppiriviä.
  - Tagihaku suodattaa välittömästi vain kyseisen tagin omaavat skoopit.

---

## 3. Toteutuslipukkeet: `scopes macos` (macOS)


### Lipuke M-ORG-01: Suosikkien tilanhallinta ja pysyvyys macOS:llä
- **Tavoite:** Suosikkien kiinnitystilan tallentaminen ja hallinta macOS-versiossa.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - `@AppStorage("sivupalkkiKiinnitetyt") private var kiinnitetytTeksti = ""`
  - `private var kiinnitettySet: Set<String> { Set(kiinnitetytTeksti.split(separator: "\n").map(String.init)) }`
  - Helperit:
    - `private func onkoKiinnitetty(_ nimi: String) -> Bool { kiinnitettySet.contains(nimi) }`
    - `private func toggleKiinnitetty(_ nimi: String)` (kuten iOS:llä).
- **Hyväksymiskriteeri:**
  - Tila käyttää samaa UserDefaults-avainta ja rakennetta kuin iOS, jotta synkronointi toimii saumattomasti.

---

### Lipuke M-ORG-02: Kiinnitettyjen osio MacSidebarissa
- **Tavoite:** Erillinen "Kiinnitetyt"-osio macOS-sivupalkin yläosaan.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - `skoopitSisalto`-listaan oma `Section`:
    ```swift
    let kiinnitetyt = suodatetutSkoopit.filter { kiinnitettySet.contains($0.nimi) }
    if !kiinnitetyt.isEmpty && suodatus != .allscope {
        Section("Kiinnitetyt (\(kiinnitetyt.count))") {
            ForEach(kiinnitetyt) { skooppi in
                skooppiRivi(skooppi, onKiinnitetty: true)
            }
        }
    }
    ```
  - Muut skoopit -osiosta (`Section("Skoopit")`) jätetään kiinnitetyt pois duplikaattien välttämiseksi.
- **Hyväksymiskriteeri:**
  - Kiinnitetyt skoopit ryhmittyvät selkeästi macOS-natiivin List Section -otsikon alle.

---

### Lipuke M-ORG-03: Kontekstivalikko, työkalupalkki ja pikanäppäin
- **Tavoite:** Nopea kiinnityksen vaihto hiirellä ja pikanäppäimellä Macilla.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`, `scopes/macos/Sources/MacRootView.swift`
- **Toteutusmääritys:**
  - Skooppirivin `.contextMenu`-valikkoon:
    ```swift
    Button {
        toggleKiinnitetty(skooppi.nimi)
    } label: {
        Label(onkoKiinnitetty(skooppi.nimi) ? "Irrota suosikeista" : "Kiinnitä suosikkeihin",
              systemImage: onkoKiinnitetty(skooppi.nimi) ? "pin.slash" : "pin")
    }
    ```
  - Työkalupalkkiin (MacRootView toolbar):
    - `Button { ... } label: { Image(systemName: onkoKiinnitetty ? "pin.fill" : "pin") }`
    - Pikanäppäin: `.keyboardShortcut("p", modifiers: [.command, .shift])`.
- **Hyväksymiskriteeri:**
  - Oikea klikkaus ja pikanäppäin Cmd+Shift+P kytkevät kiinnityksen päälle/pois.

---

### Lipuke M-ORG-04: Pikasuodatuksen laajennus MacSidebarissa
- **Tavoite:** Laajenna `SkooppiSuodatus`-valintaa kattamaan Kiinnitetyt ja Viat.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - Laajenna `SkooppiSuodatus`:
    ```swift
    public enum SkooppiSuodatus: String, CaseIterable, Identifiable, Sendable {
        case kaikki = "Kaikki"
        case allscope = "Allscope"
        case aktiiviset = "Aktiiviset"
        case kiinnitetyt = "Kiinnitetyt"
        case viat = "Viat"
        case odottaa = "Odottaa"
        case pakattu = "Pakatut"
    }
    ```
  - Suodatuslogiikka:
    - `.kiinnitetyt`: palauttaa vain `kiinnitettySet.contains(s.nimi)`.
    - `.viat`: palauttaa vain `s.avoimetViat > 0`.
- **Hyväksymiskriteeri:**
  - Valitsin päivittyy ja rajaa listan vastaavasti.

---

### Lipuke M-ORG-05: Allscope-hierarkiasuodatus ja kiinnitysmerkit macOS-puussa
- **Tavoite:** Mac-puunäkymässä kiinnitetyt skoopit saavat nastaikonin ja suodatus pitää rakenteen luettavana.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - `macSolmuRivi`: jos lehtisolmu on kiinnitetty, nimen eteen `Image(systemName: "pin.fill").font(.caption2).foregroundStyle(Color.accentColor)`.
- **Hyväksymiskriteeri:**
  - Puunäkymässä suosikit erottuvat välittömästi.

---

### Lipuke M-ORG-06: Mac-kansiorakenteen tietomallin tuki ja säilyvyys
- **Tavoite:** Kansioiden ja tagien JSON-konfiguraation tuki ja pysyvyys macOS-asiakasohjelmassa.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - Yhdistä tai jaa `OrganizingConfig`- ja `SkooppiKansio`-tietomallit.
  - Tallennus ja luku UserDefaultsista avaimella `scopesOrganizingConfig`.
  - Tarjoa nopea pääsy kansion sisältöön ja tilasynteesiin macOS:llä.
- **Hyväksymiskriteeri:**
  - Sama JSON-konfiguraatio toimii yhteensopivasti iOS- ja macOS-asiakkaiden välillä.

---

### Lipuke M-ORG-07: Kansioiden luonti ja hallinta macOS:llä
- **Tavoite:** Mac-käyttöliittymään sopiva kansion luonti-, muokkaus- ja poistomekanismi.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`, `scopes/macos/Sources/MacRootView.swift`
- **Toteutusmääritys:**
  - Työkalupalkin `+`-valikkoon lisätään valinta `Uusi kansio...` (pikanäppäin Cmd+Option+N).
  - Popover- tai arkkinäkymä:
    - Kansion nimi (`TextField`).
    - Ikonin valinta järjestelmän SF Symboleista.
    - Kansion korostusväri (macOS-värivalitsin tai 7 pääteemaväriä).
  - Kansion oikean klikkauksen kontekstivalikko:
    - `Muokkaa kansiota...`
    - `Poista kansio` (punainen, vahvistuskyselyllä).
- **Hyväksymiskriteeri:**
  - Kansioiden luonti ja poisto onnistuvat sujuvasti hiirellä ja pikanäppäimillä.

---

### Lipuke M-ORG-08: Kansio-osiot ja ryhmittely MacSidebarissa (`DisclosureGroup`)
- **Tavoite:** Esittää mukautetut kansiot selkeinä, avattavina `DisclosureGroup`-ryhminä macOS-sivupalkissa.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - Korvaa tasainen listaus tai lisää oma `Section("Kansiot")`:
    ```swift
    DisclosureGroup(isExpanded: $kansioAvattu) {
        ForEach(kansio.skoopit, id: \.self) { skooppiNimi in
            if let s = skoopit.first(where: { $0.nimi == skooppiNimi }) {
                macSkooppiRivi(s)
                    .padding(.leading, 12)
            }
        }
    } label: {
        HStack(spacing: 6) {
            Image(systemName: kansio.ikoni)
                .foregroundStyle(Color(kansio.vari))
            Text(kansio.nimi)
                .font(.headline)
            Text("(\(kansio.skoopit.count))")
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            if let tilaMerkki = kansioTilaMerkki(kansio) {
                tilaMerkki
            }
        }
    }
    ```
  - Aggregoitu tilaindikaattori (`kansioTilaMerkki`): näyttää käsittelyssä/odottaa/viat -tilat kansion otsikossa.
- **Hyväksymiskriteeri:**
  - Kansiot sulkeutuvat ja avautuvat sulavasti, ja niiden tilaindikaattorit heijastavat sisältöä oikein.

---

### Lipuke M-ORG-09: Raahaus ja pudotus (Drag & Drop) MacSidebarissa
- **Tavoite:** Raahaa skooppi hiirellä kansion päälle lisätäksesi sen kansion jäseneksi.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - Lisää `macSkooppiRivi`-komponenttiin:
    - `.onDrag { NSItemProvider(object: s.nimi as NSString) }`
  - Lisää kansion `DisclosureGroup`-otsakkeelle:
    - `.onDrop(of: [.text], isTargeted: $isDropTarget) { providers in ... }`
  - Visuaalinen vaste: kansion taustaväri muuttuu ja korostuu vaalean siniseksi/turkoosiksi raahauksen ollessa kansion päällä.
- **Hyväksymiskriteeri:**
  - Raahaus toimii sulavasti ilman viivettä tai ikkunan vilkkumista.

---

### Lipuke M-ORG-10: Tagien esitys ja suodatus macOS:llä
- **Tavoite:** Tagien tuki Macin sivupalkissa ja suodatusjärjestelmässä.
- **Omistaja:** `scopes macos`
- **Kohdetiedosto:** `scopes/macos/Sources/MacSidebar.swift`
- **Toteutusmääritys:**
  - Riveillä näytetään skooppiin liitetyt tagit kompakteina teksteinä.
  - MacSidebarin hakukenttä tukee tagihakua (esim. `#backend`).
  - Oikea klikkaus skooppirivillä tarjoaa valinnan `Muokkaa tageja...`.
- **Hyväksymiskriteeri:**
  - Tagit suodattavat hakutuloksia tarkasti ja visuaalinen ilme vastaa macOS-standardeja.

---

## 4. Rajapinnat, tietomallit ja avaimet

| Kohde | Tyyppi / Avain | Kuvaus / Formaatti |
|---|---|---|
| Kiinnitetyt skoopit (AppStorage) | `sivupalkkiKiinnitetyt` | Rivinvaihdoin eroteltu merkkijono (`\n`), esim. `"scopes lista\nscopes macos\nscopes2 ydin"` (migroidaan automaattisesti `scopesOrganizingConfig`:iin) |
| Mukautetut kansiot ja tagit | `scopesOrganizingConfig` | JSON-merkkijono: `{ "versio": 1, "kiinnitetyt": [...], "kansiot": [{ "id": "...", "nimi": "...", "ikoni": "...", "vari": "...", "skoopit": [...], "luotuAika": "...", "jarjestys": 0 }], "tagit": { "skooppi": ["#tag1", "#tag2"] } }` |
| SF Symbolit | `pin.fill`, `pin.slash.fill`, `folder.fill`, `folder.badge.plus`, `tag.fill`, `chevron.right`, `chevron.down` | Kiinnitys-, kansio- ja tag-toiminnot |
| Teema-värit | `Teema.korostus` (turkoosi), `Teema.korostusTausta`, `Teema.passiivinen`, `Korostus.allCases` | `scopes/design/ILME.md`- ja `Ulkoasu.swift`-mukaiset värit |

---

## 5. Hyväksymiskriteerit ja laadunvarmistus

1. **Riippumattomuus ja virheensieto:**
   - JSON-tallennus ei kaadu, vaikka UserDefaultsissa olisi viallista dataa (turvallinen fallback).
   - Ominaisuudet eivät riko olemassa olevia simulaattoritestejä eikä portin 8797 taustapalvelua.
2. **Suorituskyky ja responsiivisuus:**
   - Suodattimet, kiinnitykset ja kansioiden jäsenyystarkistukset käyttävät O(1) `Set`- ja sanakirjahakuja (`Dictionary<String, Set<String>>`).
   - SwiftUI:n näkymäpuu renderöityy 60/120 fps nopeudella myös laajoissa kansiorakenteissa.
3. **Visuaalinen laatu ja käytettävyys:**
   - Turkoosi korostusväri (`#0F766E` / `#2DD4BF`) sekä iOS 26+ Liquid Glass -yhteensopivuus.
   - Kosketusalueet vähintään 44×44 pt iPhonella (Apple Human Interface Guidelines).
   - Dynamic Type -tuki ja tekstin koon mukautuminen ilman elementtien leikkautumista.

