# Scopes LostDev — Loppuraportti hukkuneesta kehitystiedosta ja palautetuista ominaisuuksista

Päiväys: 18.10.2026  
Skooppi: `scopes lostdev`  
Tekijä: Claude & Antigravity (moniajo)  

---

## 1. Johdanto ja lähtötilanne

Käyttäjän toimeksianto:
> "Malliton purku: lue ~/.local/state/pura/scopes-lostdev.md ja noudata sitä. Tämän skoopin tehtävä on etsiä kehityksessä hukkunutta kehitystietoa. Ensimmäinen työpaketti on selvittää moniajolla hukkuneet tiedot. Äppi on menettänyt ominaisuuksia mitkä on jo aiemmin tehty."

Kriittinen reunaehto:
> "Taustalla tapahtuu muita kehityksiä jotka eivät ole tässä skoopissa. Nämä ajot eivät saa rikkoutua eikä nämä ajot saa rikkoa tämän skoopin tekemää työtä."

OnePlus-palvelimella ja paikallisesti oli samanaikaisesti käynnissä 7 aktiivista tmux- ja taustasessiota (`scopes macos agy`, `scopes performance ios`, `scopes kordinaattori`, `scopes viat`, `scopes istunnot`, `scopes siirto git`, `scopes kysymys`). Työpuussa oli 26 eri skoopille kuuluvia committoimattomia tiedostoja.

Kaikki tutkimus, arkistointi ja palautustyö suoritettiin eristetyillä työkaluilla ilman globaaleja git-operaatioita (`git checkout .`, `git reset`, `git stash`, `git pull`), jotta rinnakkaiset sessiot säilyivät koskemattomina.

---

## 2. Moniajotutkimuksen tulokset (4 erikoisagenttia)

Käynnistettiin 4 rinnakkaista subagenttia:
1. **Git History Detective**: Selvitti commit- ja revert-historian (7f87c8a0, f6dcebf8, 0ff561e6, ccec7416, 59257069, 95b8cc1c), stäshin `afafd852` ja etähaarojen tilan.
2. **Client UI Feature Auditor**: Kartoitti iOS/macOS-koodit, syöttörivin mallivalikot, puuttuvat näkymät ja kääntövirheet.
3. **Backend Service Auditor**: Tarkasti palvelimen reitit, NDJSON-suoratoiston, statusline-skriptin ja untracked AGY-moduulit.
4. **Scope Register Auditor**: Tarkasti eri skooppien rekisterit (`scopes/*/REKISTERI.md`) ja löysi tuhoutuneet spesifikaatiot.

### Keskeiset löydökset:
- **Scopes Performance -rekisterin katoaminen**: Commit `91bca3fa` (merge conflict resolution) oli ylikirjoittanut `scopes/performance/REKISTERI.md` -tiedoston tyhjällä oletuspohjalla, jolloin valmis työpakettispesifikaatio `PERFORMANCE-TILATIETOKANTA-JA-CHAT` (commit `a212f4ad`) oli kadonnut.
- **Untracked ja uncommitted -koodi työpuussa**: Työpuussa oli 12 kriittistä untracked-tiedostoa (mm. `ScopesDatabase.swift`, `ScopesStore.swift`, `agy-istunto.mjs`, `statusline.sh`, `ScopesDatabaseTests.swift`) sekä 193 kB:n committoimaton koodidiffi.
- **Backendin puuttuva NDJSON-suoratoisto**: Reitti `POST /api/skoopit/:nimi/stream` puuttui palvelimelta, vaikka asiakassovellukset odottivat sen toimivan reaaliaikaiseen vastausvirtaan.
- **Statusline-skriptin kiinteä polku**: `statusline.sh` sisälsi kiinteän polun, joka toimi vain Linux-palvelimella mutta epäonnistui macOS:lla.
- **Syöttörivin MalliValikko**: Claude- ja AGY-istunnot sekoittuivat syöttörivin mallivalikossa, aiheuttaen 400-virheitä, koska `Istunto`-mallista puuttui `tyyppi: String?`.
- **Viat- ja Diagnostiikkanäkymien puute**: Spesifioidut ja palvelimelta löytyneet vikarekisteri (`/api/viat`) ja suorituskykydiagnostiikka (`/api/diagnostiikka`) eivät olleet kytkettyinä asiakaspuolen käyttöliittymiin.

---

## 3. Suoritetut korjaukset ja palautukset

### Vaihe 1: Turvaaminen ja spesifikaation palautus
- Palautettiin `scopes/performance/REKISTERI.md` commitista `a212f4ad` sisältäen koko `PERFORMANCE-TILATIETOKANTA-JA-CHAT` -määrittelyn (0 ms näkymäavaus, paikallinen SQLite-kanta, optimistiset UI-päivitykset).
- Tallennettiin pysyvä varmuuskopio `scopes/lostdev/arkisto/PERFORMANCE-REKISTERI-TALTEEN.md`.
- Varmuuskopioitiin kaikki 12 kriittistä untracked-tiedostoa hakemistoon `scopes/lostdev/arkisto/untracked/`.
- Tallennettiin koko työpuun uncommitted diff tiedostoon `scopes/lostdev/arkisto/uncommitted-tyopuu.patch` (193 kB).
- Koostettiin yksityiskohtainen löydösdokumentti `scopes/lostdev/SELVITYS-HUKKUNEET.md`.

### Vaihe 2: Taustapalvelimen ja malliohjauksen korjaus (LOSTDEV-PALAUTUS-OHJAUS)
- Lisättiin `scopes/palvelu/palvelin.mjs` -tiedostoon reitti `POST /api/skoopit/:nimi/stream` (NDJSON-suoratoisto tapahtumilla `pala`, `valmis`, `virhe`).
- Korjattiin `scopes/palvelu/statusline.sh` dynaamisella hakemistotunnistuksella (`DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"`), jolloin skripti toimii yhtäläisesti macOS- ja Linux-ympäristöissä.
- Lisättiin `tyyppi: String?` tietorakenteeseen `Istunto` sekä iOS-mallissa (`scopes/ios/Sources/Malli.swift`) että core-mallissa (`ScopeModels.swift`).
- Korjattiin `MalliValikko.swift` tarkistamaan istunnon tyyppi: Claude-istunnoille näytetään vain Claude-mallit ja AGY-istunnoille AGY-mallit, estäen 400-hylkäykset.

### Vaihe 3: Viat- ja Diagnostiikkanäkymät (LOSTDEV-VIAT-JA-DIAGNOSTIIKKA)
- **Taustapalvelu**: Lisättiin `GET /api/viat` (lukee `scopes/viat/REKISTERI.md`) ja `GET /api/diagnostiikka` (lukee pyyntö- ja silmukkaviivelokit).
- **ScopesCore**: Lisättiin mallit `DiagnostiikkaTila` ja `PyyntoTapahtuma`, laajennettiin `VikaKohta`-tyyppiä apukentillä (`tunnus`, `selite`) ja lisättiin `client.diagnostiikka()` ja `client.viat()`.
- **macOS (`MacViatView.swift`)**:
  - Segmentoitu valitsin: *Vikarekisteri* ja *Diagnostiikka & lokit*.
  - Vikarekisteri: Suodattimet (Kaikki, Avoimet, Korjatut, Tiedoksi), haku, tilakohtaiset pillerit, yksityiskohtainen vikakuvaus ja kopiointinapit.
  - Diagnostiikka: Yhteenvetokortit (pyynnöt, virheet, silmukkatukokset) ja viimeisimpien pyyntöjen reaaliaikainen taulukkoloki.
  - Kytketty tiedostoihin `MacTypes.swift` (`case viat = "Viat"`), `MacSidebar.swift` ja `MacRootView.swift`, sekä rekisteröity projektiin `ScopesMac.xcodeproj`.
- **iOS (`ViatView.swift`)**:
  - Segmentoitu valitsin: *Viat* ja *Diagnostiikka*.
  - Viat: Tilasuodattimet, hakukenttä, korttien laajennus ja supistus.
  - Diagnostiikka: Palvelimen tilakortit ja pyyntötapahtumalista.
  - Kytketty navigaatioon tiedostoissa `Juuri.swift` (`Paanakyma.viat`, `PaanakymaSisalto`), `Sivupalkki.swift` (alapalkin Viat-ikoni), `Malli.swift` ja `Asiakas.swift`, sekä rekisteröity projektiin `Skoopit.xcodeproj`.

---

## 4. Todentaminen ja laatu

| Komponentti | Testaus / Käännös | Tulos |
|---|---|---|
| macOS-sovellus (`ScopesMac`) | `xcodebuild -project scopes/macos/ScopesMac.xcodeproj ...` | **BUILD SUCCEEDED** |
| iOS-sovellus (`Skoopit`) | `xcodebuild -project scopes/ios/Skoopit.xcodeproj ...` | **BUILD SUCCEEDED** |
| ScopesCore Swift -testit | `swift test --package-path scopes/shared/ScopesCore` | **17 / 17 PASS** (0 virhettä) |
| Palvelimen Node-testit | `node --test scopes/palvelu/*.test.mjs` | **165 / 165 PASS** (0 virhettä) |
| Skoopin rakennetesti | `node claude/siirto/tools/rakennetesti.mjs --skooppi "scopes lostdev"` | **6 / 6 OK** |

Kaikki rinnakkaiset tausta-ajot säilyivät häiriöttöminä ja niiden tiedostot koskemattomina.

---

## 5. Ohjeet tuleville kehityssessioille

1. **Rinnakkaisten ajojen suojaus**: Älä koskaan aja työpuussa globaaleja komentoja (`git checkout .`, `git reset --hard`, `git stash`, `git pull`). Muutokset on aina rajattava vain oman skoopin tiedostoihin.
2. **Arkistoidut tiedostot**: Hakemistossa `scopes/lostdev/arkisto/` on tallessa `uncommitted-tyopuu.patch` ja untracked-tiedostot. Jos jokin rinnakkainen ajo tai merge vahingossa kadottaa tiedostoja, ne voidaan palauttaa suoraan tästä arkistosta.
3. **Rekisterien eheys**: Ennen kuin skooppia pakataan tai mergetään, varmista `node claude/siirto/tools/rakennetesti.mjs` -ajolla, että rekisterin rakenne on puhdas.
