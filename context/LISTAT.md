# CONTEXT-LAHTO: taito- ja työkalulistat

Lähde: istunnon 763461ad (Opus 5.5, palvelin) pääkontekstissa 14.10.2026 näkyvät listat.
Koot rekisterin mittauksesta 14.10.2026 (merkkejä). Lähtökonteksti tässä istunnossa: 65 k
(`konteksti-nyt.mjs`, ennen pakettityötä).

Poistokeinot ovat dokumenttiväitteitä (claude-code-guide), ei todennettu tällä koneella.
Settings-muutos on käyttäjän (freeze-guard). Todennus: `/context` ennen ja jälkeen.

Sarake "Täällä": **käytössä** = tämän projektin työtavat käyttävät; **ei** = ei toimi tai ei
käytetä tällä koneella (perustelu); **?** = käyttäjän arvio.

## 1. Taitolista (19,0 k merkkiä, 34–35 taitoa)

### 1a. anthropic-skills (claude.ai-synkka, 9,7 k = 51 %)

Poisto: `syncClaudeAiSkills: false` (vain settings.local.json) poistaa kaikki kerralla.

| Taito | Täällä | Huom. |
|---|---|---|
| keskustelun-siirto | ei | **kaksoiskappale** paikallisesta `keskustelun-siirto`-reitittimestä; vanha versio, voi laukaista väärän |
| built-in-browser | ei | työpöytäsovelluksen selainruutu; palvelimella ei ole |
| chrome-browser | ei | Claude in Chrome; palvelimella ei Chromea |
| computer-use | ei | työpöydän ohjaus; ei näyttöä |
| morning | ? | aamukooste |
| import-memory | ei | toisen avustajan muistin tuonti |
| deep-research | ? | monilähdetutkimus ali-agenteilla |
| docs | ? | Claude Docs -dokumentit |
| google-workspace | ? | Google Docs/Sheets/Slides -muokkaus |
| docx | ? | Word |
| pptx | ? | PowerPoint |
| xlsx | ? | taulukot |
| pdf | käytössä? | muisti: kaaviot PDF:ssä PNG:nä |
| skill-creator | ? | taitojen teko; omat taidot tehdään `Infra/skills/`-lähteeseen |

### 1b. Sisäänrakennetut (Claude Code, ~8,8 k)

Poisto yksittäin: `skillOverrides {"<nimi>": "off"}`; kaikki: `disableBundledSkills`.

| Taito | Täällä | Huom. |
|---|---|---|
| schedule | ei | pilvirutiinit; muisti: pilvi kielletty |
| claude-in-chrome | ei | ei Chromea palvelimella |
| keybindings-help | ei | käyttäjällä ei shelliä täällä |
| statusline (agentti, ks. 3) | ei | sama syy |
| run | ? | sovelluksen ajo |
| plugin-authoring | ? | modit, koukut |
| init | ei | CLAUDE.md on jo |
| security-review | ? | |
| code-review | ? | |
| simplify | ? | |
| fewer-permission-prompts | ? | |
| update-config | käytössä | settings/koukut (muutos käyttäjän) |
| loop | ? | |
| claude-api | ? | mallitiedot |
| workflow-authoring | ? | Workflow vain käyttäjän pyynnöstä |
| dataviz | ? | kaaviot |
| artifact-design | ? | Artifact-sivut |
| artifact-diagramming | ? | |
| artifact-capabilities | ? | |

### 1c. Omat (Infra/skills → ~/.claude/skills)

`keskustelun-siirto`, `pakkaa-sonnet`, `rd` — käytössä, eivät poistokohteita.

## 2. Deferred-työkalulistat (12,6 k)

| Ryhmä | Määrä | Täällä | Poisto |
|---|---|---|---|
| claude.ai Gmail | 31 | ? | `disableClaudeAiConnectors: true` (kaikki claude.ai-yhteydet) tai yhteyden irrotus claude.ai:ssa |
| claude.ai Google Drive | 11 | ? | sama |
| claude.ai Claude Docs | 8 (3 ladattu heti) | ? | sama; tuo myös MCP-ohjeet (osa 4) |
| Claude Code -ydin (Cron*, Monitor, PushNotification, SendMessage, WebFetch/Search, Worktree, PlanMode, NotebookEdit, TaskStop, RemoteTrigger, DesignSync, SendUserFile, EndConversation, ArtifactComments/Data, FetchInboxMessage) | 20 | käytössä osin (Cron* `/sa`, PushNotification autojatko, Monitor) | `permissions.deny` yksittäin; RemoteTrigger = pilvi (kielletty) |

## 3. Agenttilista (4,0 k, 10 agenttia)

Poisto: `permissions.deny ["Agent(<nimi>)"]`.

| Agentti | Täällä |
|---|---|
| siirtaja-sonnet, toteuttaja-sonnet, toteuttaja-opus, rd-context | käytössä (omat) |
| Explore | käytössä (CLAUDE.md: lukutyö) |
| general-purpose, claude | ? (päällekkäisiä keskenään) |
| Plan | ? |
| claude-code-guide | käytössä (poistokeinojen haku) |
| statusline-setup | ei |

## 4. MCP-ohjeet (2,1 k)

Claude Docs -palvelimen ohjeteksti järjestelmäviestissä. Lähtee vain, jos Claude Docs -yhteys
poistetaan (osa 2). Ei erillistä poistokeinoa.

## Päätösjärjestys (ehdotus)

1. **1a** anthropic-skills — suurin (9,7 k), yksi asetus, sisältää kaksoiskappaleen.
2. **2** claude.ai-yhteydet — 12,6 k + 2,1 k MCP-ohjeet, yksi asetus, mutta poistaa Gmail/Drive/Docs.
3. **1b** sisäänrakennetut — yksittäin, pienet erät.
4. **3** agentit — pieni (4 k).
