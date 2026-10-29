# scopes/agy/models/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — skoopin tarkoitus täytetty (mallilistan tilannekuva ja tarkistus valmiit 15.10.2026; `mallit.mjs --palvelu` exit 0 vielä 15.10.2026 klo 16.57); skooppi avataan, kun `node scopes/agy/models/mallit.mjs --palvelu` antaa exit 1 tai 2 tai käyttäjä nostaa uuden mallityön

## Tarkoitus ja raja

Mallilistan ylläpito: `agy models` -listan muutokset (uudet ja poistuneet mallit) näkyvät oikein Scopes-äpin malli- ja purkajavalinnoissa (käyttäjä 15.10.2026, AGY-MODELS-MAARITTELY).

Raja: skoopin omat ovat agy-mallien lista ja `scopes/palvelu/purkajat.mjs` (agy-osa ja sen testi `purkajat.test.mjs`). Ei kuulu: agy-binääri palvelimella (scopes agy), Android-agy (scopes agy android), äpin näkymät `scopes/ios/**` (scopes ios), siirron oletusajaja `claude/siirto/ajaja.json` (claude siirto), r&d2:n `--engine agy` (claude r&d2).

## Päätökset

- **Käyttäjä 15.10.2026:** skooppi `scopes agy models` luotiin komennolla `/pura uusi scopes agy models`.
- **Käyttäjä 15.10.2026 (AGY-MODELS-MAARITTELY):** tarkoitus "Mallilistan ylläpito" (hylätyt: agy-mallit purkajina/ajajina, mallien vertailumittaus); raja "Mallit + purkajat.mjs" (hylätty: vain mallitaso); 1. työ: "käynnistetään oneplus agy ja varmistetaan että mallivaihtoehdot löytyvät skoopin luonnin yhteydessä olevista malli valinnoista". Käyttäjän lause "Purkua ei tehdä tulevaisuudessa mallissa mutta pakkaus tehdään" tarkennettiin: "Ei muutosta nyt" (hylätyt: valinta ohjaa pakkausta, purkajavalinta pois).
- **Agentti 15.10.2026 (AGY-MODELS-MAARITTELY, varmistus):** `agy models` exit 0, 6 mallia: gemini-3.8-flash-high/-medium/-low, claude-sonnet-4-6, claude-opus-4-6-thinking, gpt-oss-120b-medium. `luoPurkajat().lista()` palauttaa kaikki 6 `agy:<id>`-purkajaa sekä täydellä PATHilla että cronin `PATH=/usr/bin:/bin`. Elävä palvelu (pid 24930, :8787) `GET /api/purkajat` → 200, ryhmä `agy` sisältää samat 6. Äpin Uusi skooppi -näkymä käyttää samaa listaa (`PurkuValitsimet`, scopes/ios/Sources/Nakymat.swift:319 → Asiakas.swift:59). Istunnon malli -listassa ei ole agy-malleja suunnitellusti (purkajat.mjs:5–6: istunnon malli on Claude- tai LM Studio -malli). Puhelimen näkymää ei katsottu silmin.
- **Agentti 15.10.2026 (AGY-MODELS-SEURANTA):** `scopes/agy/models/mallit.mjs` vertaa `agy models` -listaa tilannekuvaan `scopes/agy/models/mallit.tsv` (6 mallia) ja `--palvelu`-lipulla elävän palvelun `/api/purkajat`-agy-ryhmään; exit 0 sama, 1 ero (`+`/`-`/`~`/`PALVELU`-rivit), 2 virhe; `--paivita` kirjoittaa tilannekuvan. `node --test scopes/agy/models/mallit.test.mjs scopes/palvelu/purkajat.test.mjs` 8/8 exit 0; elävä `mallit.mjs --palvelu` exit 0 ("MALLIT: ok — 6 mallia"). Ajastusta ei tehty: tarkistus ajetaan käsin.

- **15.10.2026:** Skooppi pysyy levossa: ei uutta pakettia, koska mallilista vastaa tilannekuvaa ja käyttäjä ei nostanut uutta mallityötä.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Mallilistan muutosten seuranta | avoin (tilannekuva ja tarkistus valmiit 15.10.2026; ei ajastettu, levossa); odottaa ajoa | avaa skooppi, kun `node scopes/agy/models/mallit.mjs --palvelu` antaa exit 1 tai 2 tai käyttäjä nostaa uuden mallityön: `--paivita` ja tarkista äpin valinnat |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agy/models/HISTORIA.md`, ei lueta purussa.
