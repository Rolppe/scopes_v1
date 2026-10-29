# scopes agy models — toteutushistoria

## Toteutushistoria

- 15.10.2026 — `/pura scopes agy models --autojatko` (autovaihto). Purkuraportti nimesi rekisterivian: rivin 33 väite "HISTORIA.md (syntyy ensimmäisessä pakkauksessa)" oli vanhentunut, koska `scopes/agy/models/HISTORIA.md` on jo olemassa (pakkaus 60e03957).
  - Korjattu `scopes/agy/models/REKISTERI.md:33` → `Historia: \`scopes/agy/models/HISTORIA.md\`, ei lueta purussa.` (sulkeissa ollut väite poistettu). Käyttäjä valitsi "Korjaa HISTORIA-väite ja pakkaa".
  - viat (ratkaistu, ei rekisteriin): rekisterin vanhentunut HISTORIA-väite (REKISTERI.md:33) korjattu tässä pakkauksessa 15.10.2026
  - viat (ratkaistu, ei rekisteriin): ei uusia vikoja; työpuun vieraat muutokset ovat muiden skooppien työtä, ei kirjata vikana
  - todettu (ei rekisteriin): 15.10.2026 klo 16.57: `node scopes/agy/models/mallit.mjs --palvelu` → exit 0, `MALLIT: ok — 6 mallia, sama kuin tilannekuva`. Skoopin avausehto (exit 1 tai 2) ei täyty.
  - todettu (ei rekisteriin): `node claude/siirto/tools/kesken.mjs "scopes agy models"` → exit 0 (`KESKEN: ei`).
- 15.10.2026 — `/pura uusi scopes agy models`: `luo-skooppi.mjs` exit 0 (RAKENNETESTI ok), `install.sh` exit 0; commit 1a6058aa (skooppi + .gitignore-korjaus: rivi 12 `models/` → `/models/`, koska ankkuroimaton sääntö ignoroi `scopes/agy/models/`).
  - AGY-MODELS-MAARITTELY valmis: tarkoitus, raja ja varmistus kirjattu `scopes/agy/models/REKISTERI.md`:hen.
  - AGY-MODELS-SEURANTA valmis: uusi `scopes/agy/models/mallit.mjs` (vertaa `agy models` -listaa tilannekuvaan `mallit.tsv` ja `--palvelu`-lipulla elävän palvelun `/api/purkajat`-agy-ryhmään; exit 0 sama, 1 ero, 2 virhe; `--paivita` kirjoittaa tilannekuvan), testi `scopes/agy/models/mallit.test.mjs`, tilannekuva `scopes/agy/models/mallit.tsv` (6 mallia).
  - todettu (ei rekisteriin): `luoPurkajat().lista()` palauttaa 6 `agy:<id>`-purkajaa sekä täydellä PATHilla että `PATH=/usr/bin:/bin` (ajaKomento lisää `~/.local/bin`:n, scopes/palvelu/toiminnot.mjs:44).