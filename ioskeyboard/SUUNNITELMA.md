# scopes/ioskeyboard: Suunnitelma (IOSKEYBOARD-SUUNNITTELU)

Tämä asiakirja määrittelee Scopes iOS -sovellukselle toteutettavan mahdollisimman natiivin iOS Custom Keyboard Extensionin arkkitehtuurin, näppäimistöasettelut (erityisesti vaakatilan keskinapit) ja XcodeGen-projektirakenteen.

Päivitetty: 26.10.2026 (käyttäjän määrittelyn pohjalta)

---

## 1. Visio ja tavoitteet

- **Mahdollisimman natiivi iOS-ilme ja -tuntuma:**
  - Näppäinten geometria, fontit (SF Pro), painallusanimaatiot ja varjot vastaavat Applen iOS 17/18 -järjestelmänäppäimistöä.
  - Tuki vaalealle ja tummalle ulkoasulle (Light / Dark mode) sekä järjestelmän teemamuutoksille lennossa.
  - Haptinen palaute (`UIImpactFeedbackGenerator`) ja järjestelmän näppäinäänet (`UIDevice.current.playInputClick`).
  - Natiivi `advanceToNextInputMode()` (maapallo/seuraava näppäimistö -painike) ja `textDocumentProxy`-integraatio.
- **Suomenkielinen perusasettelu (Pystytila / Portrait):**
  - QWERTY + å, ä, ö natiiveilla paikoillaan.
  - Numerotila (`123`), erikoismerkit (`#+=`), shift/caps lock, automaattinen suuraakkonen lauseen alussa.
- **Vaakatila (Landscape) ja keskinapit:**
  - Kun iPhone käännetään vaaka-asentoon, näppäimistö jakautuu luontevasti reunoille kahden peukalon ulottuville (split keyboard).
  - Näppäimistön **keskelle sijoitetaan dedikoitu lisänappialue (Center Control Pad)**:
    - Koodaus- ja komentomerkit (erityisesti Scopes- ja Claude-käytössä tiheät: `/`, `\``, `-`, `_`, `:`, `=`, `"`, `'`, `(`, `)`).
    - Kohdistimen siirto / nuolinäppäimet (`◀`, `▶`).
    - Pikatoiminnot: Tyhjennä (`✕`), Peruuta (`↶`), Liitä (`📋`).

---

## 2. Arkkitehtuuri

### 2.1. Alusta ja teknologia
- **Teknologia:** Swift 5.0+, UIKit (`UIInputViewController`) + SwiftUI (`UIHostingController`).
  - `UIInputViewController` toimii järjestelmän rajapintana (`textDocumentProxy`, näppäimistön korkeus, järjestelmäkutsut).
  - Päänäkymä toteutetaan modernilla SwiftUI:lla (`KeyboardRootView`), jolloin asettelujen tila- ja animaatiolaskenta on deklaratiivista, nopeaa ja muokattavaa.
- **Target-tyyppi:** `app-extension` (iOS Keyboard Extension).
- **Protokollat:** `UIInputViewAudioFeedback` äänipalautetta varten.

### 2.2. Vaaka- ja pystytilan havainnointi
- `UIInputViewController.viewWillTransition(to:with:)` ja SwiftUI:n `@Environment(\.verticalSizeClass)` havaitsevat orientaation muutokset välittömästi.
- Näppäimistön korkeus määritetään dynaamisesti:
  - Pystytila: ~216–260 pt (näytön koosta riippuen).
  - Vaakatila: ~160–180 pt (mahdollistaa tehokkaan kirjoituskorkeuden ja peukaloergonomian).

---

## 3. Näppäimistöasettelut

### 3.1. Pystytila (Suomi QWERTY)
```
Rivi 1:   q   w   e   r   t   y   u   i   o   p   å
Rivi 2:    a   s   d   f   g   h   j   k   l   ö   ä
Rivi 3: [⇧]  z   x   c   v   b   n   m   [ ⌫ ]
Rivi 4: [123] [🌐] [       Välilyönti       ] [Rivinvaihto]
```

### 3.2. Vaakatila (Split + 2 Keskipystyriviä)
Koko leveys jaetaan kolmeen lohkoon:
1. **Vasen peukalolohko (Left Wing)**: QWERTY-vasen osa
2. **Keskialueen lisänapit (Center Column Pad)**: **Kaksi vierekkäistä pystyriviä** näppäimiä (käyttäjä 26.10.2026)
3. **Oikea peukalolohko (Right Wing)**: QWERTY-oikea osa

Asettelu 4 riville:
```
-------------------------------------------------------------------------
VASEN LOHKO (Peukalo)   │ KESKIRIVIT (2 saraketta) │ OIKEA LOHKO (Peukalo)
------------------------┼──────────────────────────┼---------------------
q   w   e   r   t       │       /       `          │ y   u   i   o   p  å
a   s   d   f   g       │       :       -          │ h   j   k   l   ö  ä
[⇧]   z   x   c   v     │       "       _          │ b   n   m       [ ⌫ ]
[123] [🌐] [Väli ␣]     │       ◀       ▶          │ [Väli ␣] [Rivinvaihto]
-------------------------------------------------------------------------
```

*Keskinäppäimet (2 vierekkäistä pystyriviä):*
- Sarake 1 (vasen):
  - Rivi 1: `/` (Slash-komennot: `/pura`, `/pakkaa`, `/vika`, jne.)
  - Rivi 2: `:` (Kaksoispiste poluissa, koodissa ja viesteissä)
  - Rivi 3: `"` (Lainausmerkki merkkijonoille ja lainauksille)
  - Rivi 4: `◀` (Kohdistimen siirto vasemmalle)
- Sarake 2 (oikea):
  - Rivi 1: `\`` (Backtick koodilohkoille ja markdown-muotoilulle)
  - Rivi 2: `-` (Yhdysmerkki ja luettelomerkit)
  - Rivi 3: `_` (Alaviiva tunnisteille ja muuttujille)
  - Rivi 4: `▶` (Kohdistimen siirto oikealle)
- `📋`: Leikepöydältä liittäminen (vaatii `RequestsOpenAccess = true`).
- Tuplavälilyönti: Sekä vasemmalle että oikealle peukalolle on oma välilyöntipainike split-asettelussa.

---

## 4. Tiedostorakenne ja sijoittelu

```
scopes/ioskeyboard/
├── REKISTERI.md                 # Skoopin tila ja paketit
├── SUUNNITELMA.md               # Tämä arkkitehtuuri- ja asettelusuunnitelma
└── Sources/
    ├── KeyboardViewController.swift  # UIInputViewController & järjestelmäintegraatio
    ├── KeyboardRootView.swift        # Pää-SwiftUI-kontaineri
    ├── Model/
    │   ├── KeyboardState.swift       # Tila (Shift, CapsLock, Tila: kirjaimet/numerot/symbolit)
    │   ├── KeyAction.swift           # Syöte- ja toimintotapahtumat
    │   └── LayoutDefinition.swift    # Asettelurakenteet
    ├── Layouts/
    │   ├── PortraitLayoutView.swift  # Suomi-pystynäkymä
    │   └── LandscapeLayoutView.swift # Split + keskinäppäimistön vaakanäkymä
    ├── Components/
    │   ├── KeyButtonView.swift       # Yksittäinen näppäin natiivityylillä
    │   └── CenterPadView.swift       # Vaakatilan keskinappirivistöt
    └── Theme/
        └── KeyboardStyle.swift       # Natiivit värit, kulmat, varjot ja haptiikka
```

---

## 5. XcodeGen-integraatio (`scopes/ios/project.yml`)

`scopes/ios/project.yml` -tiedostoon lisätään uusi target:
```yaml
  SkoopitKeyboard:
    type: app-extension
    platform: iOS
    deploymentTarget: "18.0"
    sources:
      - path: ../../scopes/ioskeyboard/Sources
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.example.skoopit.keyboard
        INFOPLIST_FILE: ../../scopes/ioskeyboard/Info.plist
    info:
      path: ../../scopes/ioskeyboard/Info.plist
      properties:
        CFBundleDisplayName: Scopes-näppäimistö
        NSExtension:
          NSExtensionPointIdentifier: com.apple.keyboard-service
          NSExtensionPrincipalClass: $(PRODUCT_MODULE_NAME).KeyboardViewController
          RequestsOpenAccess: true
```

---

## 6. Etenemispolku ja seuraavat paketit

1. **`IOSKEYBOARD-RUNKO`**: Luodaan `KeyboardViewController`, `KeyboardRootView`, `Info.plist` ja päivitetään `project.yml` siten, että laajennus kääntyy ja asentuu laitteelle/simulaattoriin. (Valmis 26.10.2026)
2. **`IOSKEYBOARD-PYSTY`**: Toteutetaan täysi suomenkielinen QWERTY-asettelu pystytilaan (å, ä, ö, shift, 123-tila, välilyönti, rivinvaihto, poisto toistolla, SF Pro -ilme ja varjot). (Valmis 26.10.2026)
3. **`IOSKEYBOARD-VAAKA`**: Toteutetaan vaakatilan split-asettelu ja keskialueen lisänappipaneeli (navigointinuolet, koodaus- ja komentomerkit, leikepöytä). (Valmis 26.10.2026)
4. **`IOSKEYBOARD-TODENNUS`**: Todennetaan näppäimistö simulaattorissa ja hienosäädetään asettelut (suhde 5:6). (Valmis 27.10.2026)
5. **`IOSKEYBOARD-TUNTUMA`**: Viimeistellään natiivi tuntuma: haptinen palaute, näppäinäänet, pitkät painallukset (popoverit) ja esikatselu. (Valmis 27.10.2026)
