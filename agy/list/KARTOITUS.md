# AGY CLI -tuki Scopes list -näkymään — Kartoitus

16.10.2026 — Paketti AGY-LIST-KARTOITUS

## 1. Tavoite ja tausta

Skoopin `scopes agy list` tarkoitus on korjata Scopes-äpin listanäkymä (`scopes list` / sivupalkki ja sen taustapalvelu `GET /api/skoopit`) siten, että se tukee täysipainoisesti myös `agy` CLI -istuntoja.

Tällä hetkellä Scopes-äppi ja sen taustapalvelu tunnistavat vain Claude Code -istunnot (`~/.claude/sessions/<pid>.json`). Kun skooppi puretaan ja sitä ajetaan AGY CLI:llä (tmux-ruutu `siirto-<slug>-<hhmmss>`, komento `agy`), listanäkymä ei tunnista istuntoa.

---

## 2. Nykytilan havainnot ja ongelmat

### 2.1 Taustapalvelu (`scopes/palvelu/lahteet.mjs` & `palvelin.mjs`)
1. **`GET /api/skoopit` kutsuu `lista(asetukset)`**:
   - `lista` kutsuu `istunnot({ ...asetukset, skooppiNimet })`, joka lukee ainoastaan Claude Coden JSON-istuntotiedostot `~/.claude/sessions/`-hakemistosta.
   - Koska AGY ei kirjoita Claude-muotoista JSON-tiedostoa, `istunnot` palauttaa AGY-istunnoille tyhjän listan.
   - Tulos:
     * `istuntoja`: 0
     * `suurinKonteksti`: `null`
     * `tila`: `"pakattu"` (koska avoimia istuntoja on 0)
     * `aika`: vain rekisteritiedoston `mtime`, ei istunnon viimeisintä aktiivisuusaikaa.

2. **`GET /api/skoopit/<nimi>` kutsuu `yksi(nimi, asetukset)`**:
   - Palauttaa skoopin näkymän, jossa `istunnot: []`.
   - iOS-äpin `SkooppiNakymaView` näyttää "ei käynnissä olevia istuntoja" ja asettaa toiminnot (Pakkaa istunto, Automaattisiirto jne.) tilaan `.disabled(avoinIstunto == nil)`.

### 2.2 iOS-äpin sivupalkki (`scopes/ios/Sources/Sivupalkki.swift`)
1. **Kansioikoni ja väritila (`KansioIkoni`)**:
   - Koska palvelu palauttaa `tila: "pakattu"`, ikoni näkyy harmaana eikä oranssina (käsittelyssä / busy) tai keltaisena (odottaa / idle).
2. **Listan järjestys (`Kohde.taso`)**:
   - Taso 0 = aktiiviset / käsittelyssä, Taso 1 = odottaa, Taso 2 = pakatut.
   - AGY-istunto valuu listan alimpaan ryhmään (taso 2) pakattujen joukkoon.
3. **Aikajärjestys**:
   - Koska `aika` on vain vanha `mtime`, skooppi ei nouse listan kärkeen, kun AGY vastaa tai käyttäjä lähettää viestin.
4. **Rivin eleet ja virtanappi**:
   - Oikealle vedettäessä virtanappi on tummanpunainen ja tarjoaa "Pura" ("Pura skooppi ...") sen sijaan, että se olisi kirkkaanpunainen ja tarjoaisi "Pakkaa".

---

## 3. AGY CLI -istuntojen mekaniikka

OnePlus-palvelimella AGY CLI -istunnot toimivat seuraavasti:
1. **Tmux-istunnot**:
   - Nimi: `siirto-<slug>-<hhmmss>`, esim. `siirto-scopes-agy-list-155319`.
   - Ruudun komento: `agy`.
   - Luontiaika: saatavilla tmux-muuttujasta `#{session_created}` (sekuntia).
2. **Keskustelutiedostot**:
   - Sijainti: `~/.gemini/antigravity-cli/conversations/<uuid>.db` (SQLite).
   - Yhdistäminen: `loydaKeskustelu(slug, alkoiMs, hakemisto)` etsii tietokannan, jonka ensimmäisessä käyttäjäviestissä on `<slug>.md`.
   - Viestit ja aikaleimat: `agyViestit(db)` palauttaa `{ rooli, teksti, aika }`.
3. **Aktiivisuus ja tila**:
   - Tmux-ruudun sieppaus (`tmux capture-pane`): jos ruudun alarivillä on `? for shortcuts`, AGY odottaa käyttäjää (`idle` -> äpissä `odottaa`). Jos rivi puuttuu, AGY generoi vastausta tai ajaa työkalua (`busy` -> äpissä `kasittely`).
   - Pakkaus: tarkistetaan keskustelun viesteistä `PAKKAUSRIVI` (`PAKKAUS: vahvistettu`, `PAKATTU:`, jne.). Jos agentin viesti sisältää pakkausrivin eikä sen jälkeen ole tullut uutta käyttäjän viestiä, istunto on pakattu (`pakattu`).
4. **Tokenit / konteksti**:
   - `steps`-taulun `step_type = 15` (agentin vastaus) protobuf-metadatassa kenttä 9 sisältää tokenimäärät (`f: 1` output, `f: 2` input).

---

## 4. Ratkaisumalli

### 4.1 Tehokas havainnointi (ei hidasta listaa)
62 skoopin läpikäynti ei saa tehdä 62 erillistä tmux-kutsua.
- **Yksi yhteinen tmux-kutsu**:
  `tmux list-panes -a -F '#{session_name} #{pane_current_command} #{session_created} #{pane_pid}'`
  listaa koko koneen ruudut kerralla (< 10 ms).
- Suodatetaan ruudut, jotka täsmäävät `^siirto-(.+)-\d{6}$` ja komento on `agy`.
- Liitetään kukin agy-ruutu vastaavaan skooppiin vertaamalla slugia (`mallitonSlug(skooppiNimi)`).
- Vain niille harvoille skoopeille, joilla on aktiivinen AGY-ruutu, tarkistetaan tilakriteerit (SQLite-kanta ja ruudun tila).

### 4.2 Yhdistäminen `lista()`- ja `yksi()`-tuloksiin
- Funktio `agyIstunnot(kaikkiSkoopit)` tuottaa istunto-oliot:
  ```javascript
  {
    id: ruutu,
    nimi: ruutu,
    skooppi: loydettySkooppi,
    tila: onkoIdle ? 'idle' : 'busy',
    kysely: false, // tai true jos ask_question
    konteksti: { tokenit: mitattuTokenit, aika: viimeisinAika },
    pysahdys: viimeisinAika,
    pakattu: onkoPakattu,
    hereilla: false,
    alkoi: alkoiMs,
    pid: panePid,
    ruutu: ruutu,
    tyyppi: 'agy'
  }
  ```
- Kun nämä yhdistetään `istunnot()`-tulokseen:
  * `s.istunnot` sisältää sekä Claude- että AGY-istunnot.
  * `skooppiTila(s.istunnot)` laskee tilaksi automaattisesti `kasittely` / `odottaa` / `pakattu`.
  * `viimeisinMuutos` ottaa huomioon AGY:n viimeisimmän viestin ajan -> listan aikajärjestys toimii!
  * `suurinKonteksti` saa AGY:n tokenimäärän.
  * `GET /api/skoopit/<nimi>` saa AGY-istunnon tiedot, jolloin SkooppiNakymaView näyttää istunnon ja mahdollistaa toiminnot.

---

## 5. Rajapinnat ja skoopin vastuut

- **`scopes agy list`**:
  * Vastaa AGY CLI:n listauslogiikasta ja sen toteutuksesta (`scopes/palvelu/agy-istunto.mjs` / apufunktiot).
  * Vastaa testauksesta (`scopes/palvelu/agy-istunto.test.mjs`, `lahteet.test.mjs`).
- **`scopes infra` (`scopes/palvelu/lahteet.mjs`)**:
  * Päävastuu `lahteet.mjs`:stä; muutokset koordinoidaan tai ilmoitetaan omistajalle.
- **`scopes lista` (`scopes/ios/Sources/Sivupalkki.swift`)**:
  * Koska iOS-äppi käyttää jo yleisiä `SkooppiYhteenveto`-kenttiä, äppimuutoksia ei välttämättä tarvita lainkaan perustoimintaan! Palvelimen rikastettu vastaus riittää korjaamaan listanäkymän suoraan.
