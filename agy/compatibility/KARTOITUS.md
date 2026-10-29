# Scopes-äpin Claude vs. Gemini/AGY -yhteensopivuuskartoitus

Päiväys: 16.10.2026  
Skooppi: `scopes agy compatibility`  
Kohde: Scopes iOS -äppi, taustapalvelu (`scopes/palvelu`), orkestrointityökalut ja ajurit

---

## 1. Johdanto ja tavoite

Scopes-ekosysteemi on alun perin kehitetty Claude Code -istuntojen hallintaan, seurantaan ja ohjaukseen. Tässä kartoituksessa on käyty läpi koko Scopes-äpin arkkitehtuuri (iOS SwiftUI -asiakas, Node.js-taustapalvelu, shell-skriptit ja istuntohallinta) ja kartoitettu kaikki ominaisuudet, jotka tällä hetkellä toimivat vain Claudella ja puuttuvat tai ovat vajavaisia Gemini / Antigravity (AGY) -käytössä.

Tavoitteena on saavuttaa täysi toiminnallinen pariteetti, jotta AGY/Gemini-mallit toimivat Scopes-ympäristössä samoin ja yhtä saumattomasti kuin Claude.

---

## 2. Yhteenveto kartoituksen havainnoista

| Osa-alue | Claude | AGY / Gemini | Tila & Puute |
|---|---|---|---|
| **Istuntojen tunnistus (`lahteet.mjs`)** | Lukee `~/.claude/sessions/*.json` | Ei tunnisteta `istunnot()`-funktiossa | ❌ AGY-istunnot näkymättömiä palvelun istuntolistassa |
| **Sivupalkki (`Sivupalkki.swift`)** | Näyttää tilan, istuntomäärän, aktiivisuuden | Istuntolaskuri 0, tila aina "pakattu" | ❌ Kansioikoni aina harmaa, aktiivisuus ei nosta listan kärkeen |
| **Skoopin toiminnot (`Nakymat.swift`)** | Pakkaa, Automaattisiirto, Muisti hereillä | Kaikki napit lukossa (`disabled`) | ❌ Napit vaativat `avoinIstunto != nil`, joka on aina `nil` |
| **Pyyhkäisyvalikko (Swipe actions)** | Tarjoaa "Pakkaa" auki olevalle | Tarjoaa aina "Pura" (palauttaa 409) | ❌ Käyttäjä ei voi pakata pyyhkäisemällä |
| **Keskeytys (Stop-painike)** | Escape tmux-ruutuun tilassa busy/shell | Palauttaa 409 ("skooppi ei auki") | ❌ `pysaytaSkooppi` katsoo vain Claude-istuntoja |
| **Kysymyskortit (AskUserQuestion)** | Näkyy `KysymysKortti`-näkymänä äpissä | Jää tmux-päätteelle, ei näy äpissä | ❌ `ask_question`-työkalukutsua ei parsita kysymykseksi |
| **Lupakyselyt (Permissions)** | Remote Control / auto-luvat | Ruutua lukeva purkkaskripti (`agy-luvat`) | ⚠️ Vaatii Always allow -kytkimen, ei interaktiivista UI:ta |
| **Mallin vaihto lennosta** | `MalliValikko.swift` & `/model`, `/effort` | Ei tuettu, valikko kovakoodattu Claudelle | ❌ Ei AGY-malleja valikossa, ei vaihtoa kesken istunnon |
| **Skoopin rajaus (Uusi / Pura)** | Kaikki projektit ja skoopin nimet | Vain `scopes `-alkuiset skoopt | ❌ Kovakoodattu esto muille kuin scopes-perheelle |
| **Taitojärjestelmä (Skills)** | 13 taitoa hakemistossa `~/.claude/skills/` | Ei taitoja AGY:lle asennettuna | ❌ `/pakkaa`, `/pura`, `/rd`, `/sa`, jne. puuttuvat AGY:ltä |
| **Projektisäännöt (Rules)** | `CLAUDE.md`, `TYOTAVAT.md`, `TIETOTURVA.md` | Ei `GEMINI.md` / `AGENTS.md` | ❌ AGY ei lue Clauden ohjeita automaattisesti |
| **Kontekstinseuranta (Aivo-ikoni)** | Tokenit, jaottelu osiin, mitattu koko | Ei tietoja AGY-istunnoille | ❌ Kontekstinäkymä tyhjä |
| **Käyttörajarenkaat (Topbar)** | 5 h ja viikon Claude-rajat mittareissa | Ei seurantaa AGY/Gemini-kiintiöille | ⚠️ Renkaat mittaavat vain Anthropic OAuthia |
| **Ilmoitukset puhelimeen** | Laukeavat tilasiirtymistä (odottaa/kysymys) | Eivät koskaan laukea AGY:lle | ❌ Taustahaku ei näe AGY-tiloja |
| **Yleinen Chat-välilehti** | Suoratoistochat Claude-malleilla | Vain Android-Gemini, ei Linux-AGY:tä | ❌ AGY-malleja ei voi käyttää suorassa chatissa |

---

## 3. Yksityiskohtainen analyysi osa-alueittain

### 3.1. Istuntojen elinkaari ja tunnistus (Session Lifecycle)

1. **`lahteet.mjs` – `istunnot()`:**
   - Funktio etsii istuntoja vain polusta `~/.claude/sessions/*.json` ja lukee transkripteja polusta `~/.claude/projects/`.
   - AGY tallentaa istuntonsa SQLite-tiedostoihin polussa `~/.gemini/antigravity-cli/conversations/<id>.db` ja prosessit ajavat tmux-ruuduissa `siirto-<slug>-<hhmmss>`.
   - Koska `istunnot()` ei lue AGY-istuntoja, koko palvelin ja iOS-äppi luulevat, että skoopilla ei ole avointa istuntoa.
2. **Sivupalkin lista ja järjestys (`Sivupalkki.swift` & `lahteet.mjs:lista()`):**
   - Skoopin tila (`skooppiTila`) lasketaan avointen istuntojen tilasta (`kysely`, `kasittely`, `odottaa`, `pakattu`). AGY-istunnoille tila palauttaa aina `pakattu`.
   - Aktiivinen skooppi ei hehku oranssina eikä nouse listan kärkeen työn aikana.
   - `istuntoja`-laskuri näyttää `0`.
3. **Uuden skoopin luonti ja purun käynnistys (`toiminnot.mjs`):**
   - `uusiAgy`: `if (!nimi.startsWith('scopes ')) throw new Hylatty(400, 'agy-istunto kuuluu vain scopes-perheen skoopeille');`
   - `pura`: `if (malli?.startsWith(AGY_MALLI) && p.koodi === 1) throw new Hylatty(400, 'agy-istunto kuuluu vain scopes-perheen skoopeille');`
   - Tämä rajaus estää AGY-istuntojen ajamisen missään muussa kuin `scopes`-repositorion omissa alaskoopeissa.

### 3.2. Äpin toiminnot ja ohjaus (Scope Actions)

1. **Pakkaa, automaattisiirto ja herätys (`Nakymat.swift`):**
   - Napit tarkistavat `disabled(avoinIstunto == nil)`. Koska `avoinIstunto` on aina `nil`, napit ovat pysyvästi harmaina ja lukittuina.
   - Jos komento lähetetään suoraan API:lla (`POST /api/skoopit/:nimi/pakkaa`), taustapalvelun `istuntoon`-funktio etsii `skoopinIstunnot(nimi)` ja heittää virheen: `409: skoopilla ei ole tmux-istuntoa, johon /pakkaa voi lähettää`.
2. **Keskeytys / Stop-painike (`viestit.mjs:pysaytaSkooppi`):**
   - Tarkistaa `avoimet(nimi)`, joka lukee vain Claude-istuntoja.
   - Heittää virheen `409: skooppi ei ole auki tmuxissa`, eikä lähetä Escape-näppäintä AGY:n tmux-ruutuun.
3. **Pyyhkäisyn virtanappi (`Sivupalkki.swift`):**
   - Tilan ollessa `pakattu` virtanappi tarjoaa "Pura". Kun sitä painetaan avoimelle AGY-skoopille, palvelu vastaa `409: skoopissa on jo käynnissä oleva agy-istunto`. Käyttäjä ei pääse pakkaamaan skooppia pyyhkäisemällä.
4. **Mallin ja effortin vaihto kesken istunnon (`MalliValikko.swift` & `viestit.mjs:vaihdaMalli`):**
   - Valikko sisältää kovakoodattuna vain Claude-mallit (Fable, Opus, Sonnet, Haiku).
   - `vaihdaMalli` ohjaa Claude Coden terminaalivalikkoa (`/model`, `/effort`). AGY CLI ei tue näitä interaktiivisia komentoja tmux-syötteenä.

### 3.3. Viestintä ja interaktio (Chat & Questions)

1. **Kyselykortit (`ask_question` vs. `AskUserQuestion`):**
   - Claudella `AskUserQuestion` tuottaa transkriptiin tapahtuman, jonka `viestit.mjs` kääntää viestiksi `{ rooli: 'kysymys', kysymykset: [...] }`. Äppi näyttää tämän interaktiivisena `KysymysKortti`-näkymänä.
   - AGY:llä `ask_question` tallentuu SQLiteen työkalukutsuna (`step_type 132`), josta `agy-istunto.mjs` poimii vain `toolAction`-tekstin. Kysymys ei välity äpille, vaan odottaa käyttäjän vastausta tmux-päätteellä.
   - Kysymyksen sulkeminen (X) kutsuu `suljeKysymys`, joka kaatuu AGY:llä virheeseen 409.
2. **Lupakyselyt (Permissions):**
   - AGY CLI kysyy lupaa tiedostojen lukuun ja komentojen ajoon työtilan ulkopuolella ("Run this command?", "Allow access to this file?").
   - Nykytoteutuksessa `agy-luvat.mjs` lukee tmux-ruudun tekstisisältöä 3 sekunnin välein ja painaa automaattisesti numeronäppäintä "always allow in this conversation", jos asetus on päällä.
   - Jos kytkin ei ole päällä, istunto jumiutuu, koska äpissä ei ole mekanismia lupien hyväksymiseen.
3. **Viestin lähetyksen vahvistus (`viestit.mjs:lahetaAgyyn`):**
   - Lähettää `C-u`, tekstin ja `Enter`, ja tarkistaa SQLitestä uuden viestin ilmestymisen.
   - Jos AGY odottaa numerovalintaa (lupakysely tai monivalinta), pitkän merkkijonon lähettäminen ei vastaa kysymykseen ja johtaa 504-aikakatkaisuun.

### 3.4. Taidot, säännöt ja pakkausputki (Skills & Packaging)

1. **Taidot (Customizations / Skills):**
   - Projektin taitokirjasto sijaitsee polussa `~/.claude/skills/`.
   - AGY ei lataa Claude-taitoja. AGY:n omat taitopaikat (`.agents/skills/`, `~/.gemini/config/skills/`) ovat tyhjiä.
   - Tärkeimmät puuttuvat taidot:
     - `/pakkaa`: git commit, testien ajo, rekisterin päivitys, push.
     - `/pura`: kontekstin ja rekisterin purku istunnon alussa.
     - `/rd`: r&d-kehityssilmukan tila ja ohjaus.
     - `/sa`: istunnon keepalive-herätys.
     - `/vika`: vian kirjaus toisen skoopin rekisteriin.
2. **Ohjeet ja säännöt (Rules):**
   - Työtilan juuressa on `CLAUDE.md`, mutta ei `GEMINI.md`- tai `AGENTS.md`-tiedostoa.
   - AGY ei saa automaattisesti käyttöönsä työtapoja (`claude/TYOTAVAT.md`), git-sääntöjä eikä tietoturvaohjeita.
3. **Pakkausprosessin Claude-riippuvuudet (`pakkaa-alku.mjs`, `pakkaa-loppu.mjs`):**
   - Pakkaus vaatii ympäristömuuttujan `CLAUDE_CODE_SESSION_ID`.
   - Pakkaus lukee transkriptin polusta `~/.claude/projects/` ja tarkistaa commit-aikaleimat sekä mallin transkriptista.
   - AGY-istunto ei luo Claude-transkriptia, joten pakkausputki ei pysty todentamaan istuntoa ilman mukautuksia.

### 3.5. Lisäominaisuudet (Notifications, Metrics & General Chat)

1. **Paikalliset ilmoitukset ja widgetit (`Ilmoitukset.swift`):**
   - iOS-äpin taustapäivitys hakee tilat `GET /api/skoopit` -kutsulla ja ilmoittaa tilamuutoksista (esim. käsittelystä odottavaksi). Koska AGY-istunnot eivät näy tiloissa, ilmoituksia ei koskaan tule.
2. **Käyttörajojen seuranta (`KayttorajaRenkaat`):**
   - Yläpalkin mittarirenkaat hakevat tietoa Anthropicin OAuth usage API:sta. AGY:lle ei ole vastaavaa kiintiönäyttöä.
3. **Yleinen Chat-välilehti (`/api/chat`):**
   - Ei tarjoa Linux-AGY:n Gemini-mallia valittavaksi suoraan keskusteluun.

---

## 4. Kehityssuunnitelma ja työpaketit

Pariteetin saavuttamiseksi suositellaan seuraavia työpaketteja:

1. **Paketti 1: AGY-ISTUNTO-NAKYVYYS (`lahteet.mjs`, `Sivupalkki.swift`, `Nakymat.swift`)**
   - Yhdistetään `agyRuudut` ja SQLite-tiedot `lahteet.mjs:istunnot()`-tulosteeseen.
   - Mahdollistetaan AGY-istunnoille oikea tila (`kasittely`, `odottaa`), aktiivisuusaika, kontekstitiedot ja istuntolaskuri.
   - Avataan äpin toimintopainikkeet (Pakkaa, Siirto, Stop) myös AGY-istunnoille.
2. **Paketti 2: AGY-OHJAUS-JA-STOP (`toiminnot.mjs`, `viestit.mjs`)**
   - Korjataan `pysaytaSkooppi`, `pakkaa` ja `automaattisiirto` tukemaan AGY-tmux-ruutuja.
   - Korjataan pyyhkäisyvalikon virtanappi tunnistamaan auki oleva AGY-istunto.
3. **Paketti 3: AGY-KYSELYT-JA-LUVAT (`agy-istunto.mjs`, `viestit.mjs`, `Viestit.swift`)**
   - Parsitaan AGY:n `ask_question`-työkalukutsu viestiksi `{ rooli: 'kysymys' }`.
   - Välitetään äpin monivalintavastaukset oikeassa muodossa AGY:n tmux-syötteeseen.
   - Lisätään tuki kysymyksen sulkemiselle (Escape).
4. **Paketti 4: AGY-SAANNOT-JA-TAIDOT (`GEMINI.md`, `.agents/skills/`)**
   - Luodaan työtilan juureen `GEMINI.md`, joka tuo projektin säännöt ja työtavat AGY-malleille.
   - Siirretään/peilataan tärkeimmät taidot (`/pakkaa`, `/pura`, `/vika`) AGY-yhteensopiviksi.
5. **Paketti 5: AGY-PAKKAUKSEN-YHTEENSOPIVUUS (`pakkaa-alku.mjs`, `pakkaa-vaiheet.mjs`)**
   - Mukautetaan pakkausputki hyväksymään AGY-istunnot ja lukemaan tietoja AGY:n keskustelukannasta Claude-transkriptin rinnalla.
6. **Paketti 6: AGY-MALLIT-JA-CHAT (`purkajat.mjs`, `MalliValikko.swift`, `/api/chat`)**
   - Sallitaan AGY-malleille purku ja luonti kaikissa skoopeissa (poistetaan keinotekoinen `scopes `-rajaus).
   - Lisätään AGY-malleja Chat-välilehden valitsimeen ja viestinäkymän mallivalikkoon.
