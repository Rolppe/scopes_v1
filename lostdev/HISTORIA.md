# scopes lostdev — toteutushistoria

## Toteutushistoria

- 19.10.2026 — 18.10.2026 skoopin scopes lostdev tarkoitus ja raja määritelty käyttäjän kanssa (hukkuneen kehitystiedon selvitys) ja kirjattu scopes/lostdev/REKISTERI.md:hen.
  - LOSTDEV-HUKKUNEET: neljä rinnakkaista tutkimusagenttia (git-historia, asiakas-UI, taustapalvelu, skooppirekisterit) kartoitti hukkuneet ominaisuudet; koonti scopes/lostdev/SELVITYS-HUKKUNEET.md.
  - Palautettu scopes/performance/REKISTERI.md commitista a212f4ad (commit 91bca3fa oli ylikirjoittanut sen tyhjällä pohjalla); varmuuskopio scopes/lostdev/arkisto/PERFORMANCE-REKISTERI-TALTEEN.md.
  - Työpuun committoimaton tila talteen: scopes/lostdev/arkisto/uncommitted-tyopuu.patch ja 12 untracked-tiedostoa kansioon arkisto/untracked/ (ScopesDatabase.swift, ScopesStore.swift, agy-*.mjs, statusline.sh).
  - LOSTDEV-PALAUTUS-OHJAUS: lisätty POST /api/skoopit/:nimi/stream (NDJSON) palvelin.mjs:ään testeineen, statusline.sh:n kiinteä polku korvattu dynaamisella, MalliValikko.swift ja Malli.swift näyttävät istuntotyypin mukaan vain Claude- tai AGY-mallit (estää 400 tuntematon malli).
  - LOSTDEV-VIAT-JA-DIAGNOSTIIKKA: Viat- ja Diagnostiikkanäkymät macOS:lle (MacViatView.swift) ja iOS:lle (ViatView.swift), palvelin GET /api/viat ja /api/diagnostiikka, ScopesCoreen DiagnostiikkaTila ja PyyntoTapahtuma.
  - LOSTDEV-DOKUMENTOINTI-JA-VALMIS: loppuraportti scopes/lostdev/LOPPURAPORTTI.md. Koodimuutokset (scopes/palvelu, scopes/ios, scopes/macos, scopes/shared) tehtiin yhteiseen työpuuhun; ne eivät kuulu tämän skoopin poluille eikä niitä committoida tässä pakkauksessa.
  - todettu (ei rekisteriin): Istunto Gemini 3.8 Flash (High) Macilla; istunnon /pakkaa kaatui Gemini-kiintiöön (palautuu noin 113 h), joten pakkaus tehtiin käsin Claudella.
  - todettu (ei rekisteriin): Istunnon omien raporttien mukaan: ScopesMac ja Skoopit (iOS) BUILD SUCCEEDED, ScopesCore 17/17 Swift-testiä, Node-testit 165/165, rakennetesti scopes lostdev 6/6 ok.
  - todettu (ei rekisteriin): Löydös: ScopesMac-käännös oli rikki (MacInspectorView viittasi puuttuviin tyyppeihin), ScopesDatabase.swift oli kahtena kopiona eikä gitissä, POST /api/skoopit/:nimi/stream palautti 404, V-555 (Mac AGY /automaattisiirto jää vanhaan paneeliin TMUX_PANE-puutteen takia).