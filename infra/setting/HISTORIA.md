# scopes infra setting — toteutushistoria

## Toteutushistoria

- 16.10.2026 — `claude/siirto/tools/asetus-tila.mjs` (+ testi): lue/aseta/peri/jata/nouda/siivoa, avain `state/istunnot/<tunnus>/<nimi>.txt`, yhteinen `state/<nimi>.txt` oletuksena, siirto pakkauksen yli `state/siirrot/<skooppi>.json` (6 h); komentorivi `lue|aseta`. Commitit 35a66346, cc6b70dd, 76760840, c22d11fb; rekisteri 93803735, 806e49d4, 7f6ebae2.
  - Lukijat: `pakkaa-alku.mjs`, `pakkaa-loppu.mjs` (jata + siivoa), `pura-faktat.mjs` (nouda), `Infra/hooks/pysahdys-vahti.py`, `claude/r&d2/.claude/hooks/rd-trigger.sh` (r&d2-repo 6da78ad; hook asennettu myös `~/.claude/hooks/`).
  - Palvelu: `scopes/palvelu/istunto-asetukset.mjs`, `palvelin.mjs`, `toiminnot-asetukset.mjs`: GET/POST `/api/skoopit/<nimi>/asetukset[/<kytkin>/<paalle|pois>][?istunto=]`, 409 ellei yhtä avointa istuntoa. iOS: `Malli.swift`, `Asiakas.swift`, `Nakymat.swift`; UI-testi `SkoopitUITests.swift` mukautettu. Taito-ohjeet `Infra/skills/autopakkaa/SKILL.md`, `keskustelun-siirto/SKILL.md`.
  - Palvelu käynnistetty uudelleen uudella koodilla (käyttäjä valitsi "käynnistä nyt").
  - todettu (ei rekisteriin): Testit: `asetus-tila.test.mjs` 8/8; pakkaa-alku/loppu/pura-faktat/autovaihto 63/63; `scopes/palvelu/*.test.mjs` 125/125; `pysahdys-vahti.test.py` läpi; r&d2 `rd-trigger*.test.ts` 49/49; simulaattori `testPakkaaIlmanIstuntoaLukittu` läpi sekä vanhaa (paluu yhteisiin kytkimiin) että uutta palvelua vasten.
  - todettu (ei rekisteriin): Oikea palvelu: `curl /api/skoopit/scopes%20infra%20setting/asetukset` → istunto 19f8f7dc…, istuntoja 1, kytkimet false (10.4x).
  - todettu (ei rekisteriin): Ensimmäinen simulaattoriajo kaatui (`Test crashed with signal kill`, tunnettu); `simctl shutdown all` ja uusinta onnistui.