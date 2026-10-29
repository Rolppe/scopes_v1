# KARTOITUS — Käyttörajojen esille tuonti ajossa olevalla mallilla ja mallin valintakohdissa

Päiväys: 26.10.2026  
Skooppi: `scopes usagelimits`  
Paketti: `USAGELIMITS-KARTOITUS`  
Kohde: Scopes-äppi (iOS / macOS / jaettu ScopesUI), taustapalvelu (`scopes/palvelu`)

---

## 1. Johdanto ja tavoite

Skoopin `scopes usagelimits` tarkoituksena on tuoda tekoälymallien käyttörajat (usage limits, rate limits, kiintiöt, pyyntömäärät ja nollautumisajat) selkeästi ja reaaliaikaisesti näkyville:
1. **Skoopin ajossa olevalla mallilla:** istunnon aikana syöttörivillä, tilapalkissa ja viestinäkymässä.
2. **Mallin valintakohdissa:** purun mallivalitsimissa, istunnon aikaisessa mallivalikossa ja yleisessä chatissa.

Tämä kartoitus dokumentoi nykytilanteen (tiedostot ja rivit), havaitut puutteet sekä ehdotetut toteutusvaihtoehdot.

---

## 2. Nykytilan kartoitus (tiedostot ja rivit)

### 2.1. Skoopin ajossa olevan mallin näytöt

| Komponentti / Tiedosto | Rivi(t) | Nykyinen toiminta | Puute |
|---|---|---|---|
| `KayttorajaRenkaat` (`scopes/ios/Sources/Viestit.swift`) | 793–852 | Yläpalkissa 32x32 renkaat (keltainen 5 h, punainen viikko/pyynnöt). Napauttamalla avautuu valikko prosentteineen ja nollautumisaikoineen. | Sijaitsee kaukana syöttökentästä; ei kerro suoraan, mihin malliin rajat kuuluvat; ei varoita aktiivisesti rajojen lähestyessä. |
| `SkooppiViestitView` (`scopes/ios/Sources/Viestit.swift`) | 945–947, 981 | Toolbarissa `KayttorajaRenkaat(raja: kayttoraja)`. Syöttörivillä `MalliValikko`. | Syöttörivin `MalliValikko` näyttää vain mallin nimen ja effortin, ei käyttöastetta. |
| `KayttorajaRenkaat` (`scopes/shared/ScopesUI/.../KayttorajaRenkaat.swift`) | 4–52 | macOS- ja jaetun UI:n vastaava rengaskomponentti. | Vain staattinen 5 h + viikkorajanäyttö, ei mallikohtaista erottelua. |
| `MacRootView` (`scopes/macos/Sources/MacRootView.swift`) | 198–209 | Toolbarissa renkaat ja syöttöpalkissa `MalliValikko`. | Sama kuin iOS:lla: malli ja renkaat ovat erillisiä. |

### 2.2. Mallin valintakohdat

| Valintanäkymä / Tiedosto | Rivi(t) | Malliryhmät | Nykyinen esitystapa | Puute |
|---|---|---|---|---|
| **Istunnon mallivalikko** (`scopes/ios/Sources/MalliValikko.swift`) | 7–65 | Claude, Mac AGY, Effort | Pudotusvalikko syöttörivillä (`Menu`), vaihtoehdoissa vain `m.nimi` + valintamerkki. | Ei mitään tietoa kiintiöstä, käyttöasteesta tai jäljellä olevista pyynnöistä valintahetkellä. |
| **Purun vahvistusarkki** (`scopes/ios/Sources/PuraValinta.swift`) | 79–173 | Claude, Mac AGY, OnePlus Linux AGY, agy, Paikalliset, Nebius | `Picker` navigationLink-tyylillä. Listaa mallien kuvaukset ryhmittäin. | Ei tietoa kiintiöstä; käyttäjä voi vahvistaa purun mallilla, jonka viikkoraja on 100 % täynnä. |
| **macOS purkuarkki** (`scopes/macos/Sources/MacPuraValintaSheet.swift`) | 65–80 | Gemini, Claude, Muut | macOS-valitsin (`Picker` menu-tyylillä). | Täysin staattiset nimirivit ilman käyttörajatietoja. |
| **Chatin mallivalitsin** (`scopes/ios/Sources/Viestit.swift`) | 609–638 | Claude, Android, Paikalliset, Nebius | Syöttökentän alapuolinen `Menu`. | Ei käyttöasteita tai rajoitustietoja. |

### 2.3. Taustapalvelun käyttörajatiedot ja rajapinnat

| Tiedosto | Rivi(t) | Rajapinta / Lähde | Palautettava data |
|---|---|---|---|
| `scopes/palvelu/palvelin.mjs` | 306–317 | `GET /api/kayttoraja` | Reitittää: jos `onAgy` (tyyppi/skooppi/agentti viittaa agyyn/geminiin), kutsuu `agyKayttoraja`; muuten `kayttoraja` (Claude). |
| `scopes/palvelu/kayttoraja.mjs` | 26–80 | Anthropic OAuth `/api/oauth/usage` ja `kaytto.json` | `{ viisiTuntia: { kaytto, nollautuu }, viikko: { kaytto, nollautuu }, haettu }`. |
| `scopes/palvelu/agy-kayttoraja.mjs` | 13–97, 129–176 | `~/.local/state/scopes-agy-kayttoraja.json` + `brain/` transkriptit | `{ viisiTuntia: { kaytto, nollautuu }, viikko: { kaytto, nollautuu, teksti, otsikko, maara, maksimi }, haettu }` (max 1500 pyyntöä/vrk). |
| `scopes/palvelu/purkajat.mjs` | 65–82 | `GET /api/purkajat`, `GET /api/mallit` | `{ purkajat, mallit, oletusMalli }`. Mallit ovat vain `{ nimi, kuvaus, ryhma }` — **ei sisällä käyttöastetta!** |

---

## 3. Keskeiset havainnot ja ongelmakohdat

1. **Käyttörajatiedon pirstaleisuus ja erillisyys mallista:**
   - Käyttörajarenkaat näyttävät tällä hetkellä joko Clauden (5h / viikko) tai AGY:n (5h / 1500 pyyntöä) luvut sen mukaan, mikä skooppi tai agentti on valittuna.
   - Koska renkaat ovat erillään mallivalitsimesta, käyttäjä ei hahmota helposti, että renkaat koskevat nimenomaan kyseistä ajossa olevaa malliperhettä.
2. **Sokea mallivalinta:**
   - Kaikissa mallin valintakohdissa (`MalliValikko`, `PuraValintaView`, `MacPuraValintaSheet`, `Chat`) mallit esitetään pelkkinä niminä.
   - Käyttäjällä ei ole mitään näkyvyyttä siihen, onko jokin malli (esim. Claude Opus tai Sonnet) käyttökiintiön ylärajalla tai 100 % täynnä, ennen kuin istunto käynnistetään ja se kaatuu virheeseen / odottaa nollautumista.
3. **Rajapintatuki mallikohtaiselle käyttöasteelle puuttuu:**
   - `GET /api/purkajat` palauttaa listan malleista, mutta ei niiden tämänhetkistä käyttöastetta.
   - Asiakkaan (iOS/macOS) olisi tehtävä useita erillisiä `/api/kayttoraja?tyyppi=...` -kutsuja saadakseen jokaisen ryhmän käyttöasteen, ellei rajapintaa laajenneta palauttamaan koontitietoa.
4. **Varoitusten puute istunnon aikana:**
   - Jos ajossa olevan mallin käyttöaste lähestyy 100 %:a (esim. > 90 %), viestinäkymässä ei ole proaktiivista varoitusta tai suositusta vaihtaa mallia ennen katkeamista.

---

## 4. Ehdotetut ratkaisut

### 4.1. Skoopin ajossa olevan mallin näytön parannukset

1. **Mallin ja käyttöasteen yhdistäminen syöttörivillä:**
   - Päivitetään syöttörivin `MalliValikko` siten, että siinä näkyy mallin nimen yhteydessä kompakti tilailmaisin (esim. minirengas tai prosenttilukema: `Sonnet 5.5 · 45 %`).
   - Kun käyttöaste ylittää varoitusrajan (esim. 85 %), teksti/kuvake korostuu oranssilla; 100 % tilassa punaisella.
2. **Käyttöraja-banneri / heräte viestinäkymään:**
   - Jos ajossa olevan mallin kiintiö on täynnä tai nollautumiseen on vähän aikaa ja käyttöaste korkea, viestikentän yläpuolella näytetään tiivis ilmoitus:
     `⚠️ Claude-viikkoraja 98 % — vaihda malliksi Gemini 3.8 Flash tai Mac AGY`.
3. **Selkeämpi otsikointi käyttörajavalikossa:**
   - Yläpalkin `KayttorajaRenkaat`-valikkoon lisätään otsikkoriville selkeä tieto: `Malli: <ajossa oleva malli> (<malliperhe>)`.

### 4.2. Mallin valintakohtien parannukset

1. **Mallilistan rikastaminen käyttöasteilla:**
   - `MalliValikko.swift`:
     - Claude-osio: jokaisen mallin kohdalle 5h ja viikkorajat (esim. `Sonnet 5.5 (5h: 12 %, 7pv: 82 %)`).
     - Mac AGY -osio: 5h ja 24h pyyntömäärät (esim. `Gemini 3.8 Flash (High) (45/1500 pyyntöä)`).
   - `PuraValinta.swift`:
     - Pickerin riveillä tai erillisessä infolaatikossa näytetään valitun mallin kiintiötilanne ennen "Pura"-painikkeen painamista.
     - Jos valitun mallin kiintiö on 100 % täynnä, "Pura"-nappi varoittaa ja suosittelee vapaata mallia.
   - `MacPuraValintaSheet.swift`:
     - Vastaavat prosentti-/pyyntötiedot mallivalikon rivien perään.

### 4.3. Taustapalvelun laajennus (`scopes/palvelu`)

1. **Koottu käyttörajakysely:**
   - Laajennetaan `GET /api/kayttoraja` tai lisätään `GET /api/kayttorajat-kaikki`, joka palauttaa yhdellä kutsulla kaikkien tuettujen moottoreiden tilan:
     ```json
     {
       "claude": { "viisiTuntia": { "kaytto": 12, "nollautuu": "..." }, "viikko": { "kaytto": 82, "nollautuu": "..." } },
       "agy": { "gemini": { "viisiTuntia": { "kaytto": 5 }, "pyynnot": { "maara": 45, "maksimi": 1500, "kaytto": 3 } }, "3p": { ... } },
       "nebius": { "kaytto": 0.45, "katto": 5.0 }
     }
     ```
   - Tämä mahdollistaa kevyen ja nopean renderöinnin sekä iOS- että macOS-äpissä ilman ylimääräistä verkkoliikennettä.

---

## 5. Seuraavat askeleet ja jatkopaketit

1. **Paketti 1 (Palvelin):** `USAGELIMITS-PALVELU` — toteutetaan koottu kaikkien mallien käyttörajatiedot tarjoava rajapinta (`/api/kayttorajat-kaikki` tai laajennettu `/api/kayttoraja?kaikki=1`).
2. **Paketti 2 (Mallivalikko):** `USAGELIMITS-MALLIVALIKKO` — tuodaan käyttöasteet näkyviin `MalliValikko.swift`:n ja viestinäkymän syöttörivin aktiiviselle mallille.
3. **Paketti 3 (Purku ja valintanäkymät):** `USAGELIMITS-PURKAVALINTA` — tuodaan käyttörajatiedot ja kiintiövaroitukset `PuraValinta.swift`- ja macOS `MacPuraValintaSheet.swift` -valitsimiin.
