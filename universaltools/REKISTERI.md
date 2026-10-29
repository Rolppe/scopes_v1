# scopes/universaltools/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: UNIVERSALTOOLS-U1-SOVITIN — tee scopes/universaltools/agentti/: rajapinta.mjs, claude.mjs (istunto-kyky: istunnot, transkripti, kayttajaviestit, konteksti), testi.mjs (fixture-kohde) ja kohteen valinta (--kohde → SIIRTO_KOHDE → CLAUDECODE → neutraali) + node --test ja kultafixturet kesken/pakkaamatta/konteksti-nyt (scopes/universaltools/SUUNNITELMA.md, U1) — polut: scopes/universaltools/** — aloitus: /pura scopes universaltools

## Tarkoitus ja raja

Siirto- ja rekisterityökalut (pura, pakkaa, rekisterin luku ja kirjoitus jne.) tehdään agenttiriippumattomiksi: ne toimivat millä tahansa agentilla (Claude, Codex, Gemini…), ei vain Claude Codella (käyttäjä 15.10.2026). Raja (kyselykortti 15.10.2026, lista `scopes/universaltools/KARTOITUS.md`): kuuluvat istunto- ja vaihtotyökalut (autovaihto-perhe, kesken, pakkaamatta, konteksti-mittarit, sa), agentit ja mallit (siirtaja-sonnet, r&d-agentit, vaiheajurit, keskustelun-siirto-reititin) sekä jo riippumattomista yhteinen ydin (rekisterityökalut, git/lukot/synkka, skoopin rakenne, vika). Eivät kuulu: pura, pakkaa, autopakkaa, pakkaa-kaikki — ne tehdään muissa skoopeissa (purku: `scopes context purascript`, PURA-MALLITON).

## Päätökset

- **Käyttäjä 15.10.2026:** skooppi `scopes universaltools` luotiin komennolla `/pura uusi scopes universaltools`.
- **Käyttäjä 15.10.2026:** tarkoitus = agenttiriippumattomat siirto- ja rekisterityökalut.
- **Käyttäjä 15.10.2026:** raja = kyselykortti, josta käyttäjä valitsee työkalut yksitellen; ensimmäinen työ = kartoitus nykyisistä työkaluista ja niiden Claude Code -riippuvuuksista.
- **Käyttäjä 15.10.2026 (kyselykortti):** valitut työkalut `KARTOITUS.md`:n Valinta-sarakkeen mukaan; pura, pakkaa, autopakkaa ja pakkaa-kaikki "tehdään eri skoopeissa".

- **15.10.2026:** (pääistunto, pakkausportti): sovitin tehdään polkuun scopes/universaltools/agentti/ eikä claude/siirto/tools/agentti/, koska jälkimmäinen kuuluu skooppiin claude siirto; SUUNNITELMA.md päivitetty.

- **15.10.2026:** Käyttäjä 15.10.2026 (kyselykortti): SUUNNITELMA.md hyväksytty sellaisenaan; seuraava paketti U1 SOVITIN.

- **15.10.2026:** Käyttäjä 15.10.2026: toinen kohdeagentti (U8) = Gemini CLI (hylätyt: agy, paikallinen malli, Codex CLI). Gemini CLI ei ole asennettu palvelimella → asennus osa U8:aa.

- **15.10.2026:** Käyttäjä 15.10.2026: tilahakemisto siirretään `~/.local/state/siirto`:on, vanhaan polkuun `~/.claude/skills/keskustelun-siirto/state` symlinkki; tehdään U3:ssa (install.sh ei saa kirjoittaa symlinkin yli). Hylätty: pitää paikallaan + SIIRTO_STATE_DIR.

- **15.10.2026:** Käyttäjä 15.10.2026: "hyväksy ja pakkaa älä automaattijatka" → pakkaus ilman sessionvaihtoa, SEURAAVA-rivi ilman `automaattinen: kyllä`.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skoopin raja claude/siirto/tools-muokkauksiin (U2–U7) | avoin; claude/siirto/tools/** kuuluu skooppiin claude siirto (pakkausportti 15.10.2026) | käyttäjä päättää ennen U2:ta: /vika-reitti claude siirrolle vai skoopin rajan laajennus (SUUNNITELMA.md, Rajat) |
| Toteutus U1–U8 | avoin; U1 SOVITIN seuraavana; U1–U3 edellytyksiä, U4–U7 vapaassa järjestyksessä, U8 (Gemini CLI) viimeisenä | paketti U1 SOVITIN |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/universaltools/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
