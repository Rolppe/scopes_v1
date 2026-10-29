# scopes/agents/ds41flash/REKISTERI.md

Tilanne: 22.10.2026

SEURAAVA PAKETTI: AGENTS-DS41FLASH-TESTIAGENTTI — pystytä paikallinen LangSmith + Nebius Token Factory -testiagentti liitteen vaiheiden 1–7 mukaan (venv, `.env`, `tools.py`, `agent.py` + `langgraph.json`, `smoke_test.py`, käynnistys ja Definition of Done); kysy alussa lupa ja kulukatto Nebius/LangSmith-kutsuille; liite: ~/.local/state/scopes-liitteet/scopes-agents-ds41flash/20261022T115741-e3cb31-Tehtävänanto-paikalliselle-agentille---LangSmith-ja-Nebius--testiagentin-pystytys.md — polut: scopes/agents/ds41flash/** — aloitus: /pura scopes agents ds41flash

## Tarkoitus ja raja

**Tarkoitus:** pystyttää ja verifioida paikallinen testiagentti, joka yhdistää LangSmithin/LangGraphin ja Nebius Token Factoryn (OpenAI-yhteensopiva API), ja mitata kiinteän etuliitteen välimuistin pito (~96,5 % tavoite), kaksivaiheisen suorituksen kontekstinsiivous ja rikastava moniajo (Red Team -suunnitelmatarkistus + Clean-Room Diff Reviewer) kolmella koevariantilla (`baseline`, `compacted_single`, `enriched_multi_agent`). Määrittely on käyttäjän 22.10.2026 antama liite (luku 0); erillistä määrittelyistuntoa ei tarvita.

**Raja:** tämän agentin pystytys, konfigurointi ja verifiointi. Ei muiden skooppien rekistereitä, ei tuotantoa.

## Tila

- **Liite (työn määrittely ja lähde):** kolme kopiota ovat tavuidenttisiä — md5 `95bb9dbac0d958d549494c8a417a9722`, 29 082 tavua, 689 riviä. Uusin polku: `~/.local/state/scopes-liitteet/scopes-agents-ds41flash/20261022T115741-e3cb31-Tehtävänanto-paikalliselle-agentille---LangSmith-ja-Nebius--testiagentin-pystytys.md`. Rakenne: luku 0 ydinvaatimukset (kiinteä etuliite, 2A→siivous→2B, rikastava moniajo, deterministinen portti 3A, älykäs palautuminen, vaiheet 1–7) ja vaiheet 1–7 (venv, `.env`, `tools.py`, `agent.py` + `langgraph.json`, `smoke_test.py`, käynnistys LangSmith Studiossa, Definition of Done).
- **Liitteen lukureitti oli kolmesti estynyt (22.10.2026), ei enää este:** WebFetch 401 yksityiseen dokumenttiin; rclonen remote `drive.file` näkee vain itse luodut tiedostot (V-155); claude.ai-connectoria ei ole tässä istunnossa, koska reititys on `ANTHROPIC_BASE_URL=http://127.0.0.1:11240`. Liite saatiin käyttäjän kautta ja on luettu.
- **Drive API hylkää API-avaimet kategorisesti** (ei tämän skoopin työkalu; reitti lukittu): `about?key=` → HTTP 401 `API keys are not supported by this API`; `files?pageSize=1` → HTTP 403 `API_KEY_SERVICE_BLOCKED` (`consumer: projects/24943051115`); books/youtube sama, customsearch `SERVICE_DISABLED`.
- **Macin pilvitallennus:** `ssh dev-host` → `~/Library/CloudStorage/GoogleDrive-78311409+Rolppe@users.noreply.github.com/My Drive` on Google Drive for Desktop (3,3 G, juuressa 1233 alkiota, 28 `.gdoc`-osoitinta). Drive-dokumentti olisi luettavissa tätä kautta ilman APIa.
- **`Infra/gdrive/` on olemassa** (omistaja **infra**, V-649): `gdrive.mjs`, `gdrive.test.mjs` (36 testiä) ja `OHJE.md`; testit exit 0, turvahaku exit 0, mutta oikeaa Drivea vasten ei ajettu — service account -avain `~/.config/gdrive/service-account.json` puuttuu. `~/.config/gdrive/api-key` (40 t) poistettu 22.10.2026.
- **Git:** haara `claude/charming-brahmagupta-p9hmm7`, 8 paikallista committia, origin 168 edellä; `synkka.sh ennen` ei mennyt läpi (`rebase-konflikti: keskeytetty, ihminen`), repo ei jäänyt rebase-tilaan. Kolme stashia työpuussa (`stash@{0}` tunnelitesti-synkka 20.10.2026, `stash@{1}`, `stash@{2}` autostash), eivät tämän session.

## Päätökset

- **Käyttäjä 22.10.2026:** skooppi `scopes agents ds41flash` luotiin komennolla `/pura uusi scopes agents ds41flash`.
- **Käyttäjä 22.10.2026:** skoopin tarkoitus ja raja ovat liitteen luku 0 (ks. "Tarkoitus ja raja"); liite otetaan työksi seuraavassa istunnossa ja se on samalla skoopin ensimmäinen työ. Erillistä `AGENTS-DS41FLASH-MAARITTELY`-istuntoa ei tarvita.
- **Käyttäjä 22.10.2026:** Driven lukureitiksi service account + jakaminen, sijainti `Infra/` (omistaja **infra**); itse API-avainreitti hylätty käyttäjän sanoin "Jätetään tämä".

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| LangSmith + Nebius -testiagentin pystytys | avoin | liitteen vaiheet 1–7 järjestyksessä (kirjattu 22.10.2026); kysy ensin lupa ja kulukatto maksulliselle API-kulutukselle (`NEBIUS_API_KEY`, `LANGSMITH_API_KEY`) |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agents/ds41flash/HISTORIA.md`, ei lueta purussa.
