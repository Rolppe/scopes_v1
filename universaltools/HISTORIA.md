# scopes universaltools — toteutushistoria

## Toteutushistoria

- 15.10.2026 — /pura scopes universaltools --autojatko (Haiku-sovitin, ARVIO 6/6); paketti UNIVERSALTOOLS-SUUNNITELMA aloitettiin automaattisesti.
  - Kirjoitettiin scopes/universaltools/SUUNNITELMA.md (commit 51816774): periaate (skriptipuoli → sovitin `scopes/universaltools/agentti/` (alun perin claude/siirto/tools/agentti/, siirretty pakkausportin VÄÄRÄ SKOOPPI -hylkäyksen vuoksi), ohjepuoli → kohdelohkot ja renderöinti claude|neutraali kuten pura-malliton), sovitinrajapinnan kyvyt (istunto, käynnistys, ajastus, aliagentti, kysymys, ilmoitus; `EI TUETTU`-rivi puuttuvalle kyvylle), malliluokat pieni/keski/iso, kohteen valinta (--kohde → SIIRTO_KOHDE → CLAUDECODE → neutraali), työkaluryhmien muutokset, paketit U1–U8 ja testit (kultatesti Claudelle, testikohde agentti/testi.mjs, grep-portit).
  - Käyttäjä hyväksyi suunnitelman kyselykortilla; päätökset kirjattiin SUUNNITELMA.md:n lukuun Päätökset (commit aa9c5835).
  - ratkennut (Avoimet asiat): Suunnitelma valituille työkaluille — Suunnitelma kirjoitettiin (SUUNNITELMA.md, 51816774) ja käyttäjä hyväksyi sen 15.10.2026 (aa9c5835).
  - todettu (ei rekisteriin): `CLAUDECODE=1` on asetettu Claude Code -istunnossa (echo 15.10.2026) → käyttökelpoinen kohteen tunnistukseen.
  - todettu (ei rekisteriin): juuri.sh: claude/siirto/tools/juuri.sh:36 vaatii `$d/.claude`-hakemiston juuren tunnistukseen.
  - todettu (ei rekisteriin): palvelimella on vain `claude` (~/.local/bin/claude); codex, gemini, agy, opencode, aider puuttuvat (command -v 15.10.2026).
  - todettu (ei rekisteriin): vaihesilmukka.mjs:83 `moottori = 'agy'` oletus; :107-125 claude-cli; :129 agy spawn.
  - todettu (ei rekisteriin): pura-malliton.mjs (scopes context purascript) tukee jo `--kohde claude|neutraali`.
- 15.10.2026 — skooppi `scopes universaltools` luotiin komennolla `/pura uusi scopes universaltools` (luo-skooppi.mjs exit 0, rakennetesti ok; commit d1e835c2) ja purettiin.
  - Paketti UNIVERSALTOOLS-MAARITTELY tehty: tarkoitus ja raja kirjattu `scopes/universaltools/REKISTERI.md`:hen; kartoitus (Explore-ali-agentti, pistokokeet käsin) ja käyttäjän kyselykorttivalinta kirjattu uuteen tiedostoon `scopes/universaltools/KARTOITUS.md`.
  - REKISTERI.md päivitettiin jo session aikana: Tarkoitus ja raja, Päätökset (4 riviä), Avoimet asiat (rivi "Suunnitelma valituille työkaluille"), SEURAAVA PAKETTI → UNIVERSALTOOLS-SUUNNITELMA. Ali-agentin ei tarvitse kirjoittaa niitä uudelleen; tarkista vain, että rivit ovat paikallaan, ja lisää HISTORIA.md.
  - todettu (ei rekisteriin): Purun ARVIO: claude-cli claude-haiku-5-5 4/6 (VIKA rivit: kohdassa 10 odotettiin 'IDEAT:', löytyi 'VAATIMUKSET:'; VIKA faktat), commit 3a186fd0.