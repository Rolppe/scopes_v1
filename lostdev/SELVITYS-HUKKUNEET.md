# Selvitys hukkuneesta kehitystiedosta ja ominaisuuksista

Päivitetty: 18.10.2026 (scopes lostdev)

Tämä dokumentti kokoaa Scopes-äpin menettämät tiedot, git-historian reversioiden ja mergejen vaikutukset sekä työpuuhun ja stäshiin afafd852 jääneet ominaisuudet.

---

## 1. Palautettu määrittely

### `scopes/performance/REKISTERI.md` (Commit a212f4ad)
- **Ongelma:** Commit 91bca3fa (ristiriitojen ratkonta) ylikirjoitti rekisterin tyhjällä oletuspohjalla.
- **Palautettu tila:** Palautettu commitin a212f4ad aito määrittely ja työpaketti `PERFORMANCE-TILATIETOKANTA-JA-CHAT`.
- **Sisältö:** 0 ms näkymäavaus, paikallinen tilarekisteri ja keskusteluvarasto ScopesCoreen, optimistinen UI-päivitys.
- **Varmuuskopio:** `scopes/lostdev/arkisto/PERFORMANCE-REKISTERI-TALTEEN.md`.

---

## 2. Työpuuhun ja stäshiin afafd852 tallennetut ominaisuudet

Kaikki kriittiset uncommitted- ja untracked-tiedostot on varmuuskopioitu hakemistoon `scopes/lostdev/arkisto/untracked/` ja työpuun tilasta on tallennettu patch `scopes/lostdev/arkisto/uncommitted-tyopuu.patch` (188 kB).

### A. Paikallinen tilatietokanta ja välimuisti (0 ms avaus)
1. **ScopeModels.swift (+156 riviä)**: Monialustamallit (`ChatKeskustelu`, `Agentti`, `PurkuValinnat`, `SkooppiNakyma`, jne.).
2. **ScopesDatabase.swift** (`ScopesCore/Store/` ja `scopes/ios/Sources/`): Levypersistoitu tilatietokanta.
3. **ScopesStore.swift**: @MainActor-tietovarasto, muutosvirta (`AsyncStream`) ja optimistiset viestilisäykset.
4. **Sivupalkki.swift & Viestit.swift**: Lukevat skoopit ja viestit suoraan paikallisesta tietokannasta heti ilman verkkolatausta.

### B. Mac AGY -tuki ja Antigravity CLI -istunnot taustapalvelussa
1. **viestit.mjs (+250 riviä) & viestit.test.mjs (+169 riviä)**: AGY-istuntojen luku SQLite-kannoista, viestien lähetys tmuxiin, stop-nappi ja kysymyksen sulku.
2. **palvelin.mjs**: AGY-käyttöraja, agy-istuntolistaus, viestien agy-fallback, `luoAgyLuvat`-taustasilmukka.
3. **toiminnot.mjs & purkajat.mjs**: `uusiAgy`, /pakkaa ja /automaattisiirto agy-ruutuun.
4. **Untracked AGY-moduulit**: `agy-istunto.mjs`, `agy-kayttoraja.mjs`, `agy-luvat.mjs`, `agy-statusline-paivittaja.mjs`, `statusline.sh`.

---

## 3. Tiedossa olevat viat ja korjattavat kohdat

1. **ScopesMac-käännös**: `MacInspectorView.swift` tarvitsee joko `SkooppiTiedot`- ja `RekisteriTiedosto`-tyypit tai kytkennän olemassa olevaan `SkooppiNakyma`-malliin.
2. **MalliValikko.swift**: Poistettava `macAgyMallit` syöttörivin Claude-istuntovalikosta tai tuettava sitä palvelimella.
3. **toiminnot.mjs**: Vastaanotettava `runko` myös pakkaus- ja siirtokutsuissa.
4. **Puuttuva suoratoistoreitti**: Toteutettava `POST /api/skoopit/:nimi/stream` (NDJSON).
5. **Vika V-555**: TMUX_PANE-välitys Mac-SSH-ajossa.
6. **OnePlus commit 1ae5204f**: Eräajo Mac-SSH-hauille.
