# KARTOITUS — siirto- ja rekisterityökalujen Claude Code -riippuvuus (15.10.2026)

Paketti UNIVERSALTOOLS-MAARITTELY. Tehty lukevalla kartoituksella. Pistokokeet tarkistettiin käsin: pura-malliton.mjs:7-9, konteksti-nyt.mjs:24, kesken.mjs:111, autovaihto.sh:165 ja sa/SKILL.md:10.
"Polku" tarkoittaa, että työkalu käyttää tilahakemistona `~/.claude/skills/keskustelun-siirto/state`. Sen voi ohjata muualle `SIIRTO_STATE_DIR`-muuttujalla tai `--state-dir`-valitsimella, eikä se vaadi Claude-ajoa.

## Valinta (käyttäjä 15.10.2026, kyselykortti)

| Ryhmä | Työkalu | Riippuvuus | Lähde | Valinta |
|---|---|---|---|---|
| Purku ja pakkaus | pura (taito, aja-siirtaja.sh) | osittain | pura/SKILL.md:31 Agent, :155 AskUserQuestion, :246 Skill(rd); aja-siirtaja.sh:79,89,193-202 | **ei** — tehdään muissa skoopeissa |
| | pakkaa (pakkaa-alku/-loppu/-git, pakkaa-sonnet) | osittain | pakkaa-alku:49,115-119 transkripti; pakkaa-loppu:110; pakkaa-sonnet `context: fork` | **ei** — muut skoopit |
| | autopakkaa | täysi | autopakkaa/SKILL.md:3,29 rd-trigger.sh, :54 Skill | **ei** — muut skoopit |
| | pakkaa-kaikki.mjs | täysi | :39 Claude-kehote | **ei** — muut skoopit |
| Istunnot ja vaihto | autovaihto.sh, autovaihto-lupa.sh, istunto.sh, sulje-ikkuna.sh | täysi | autovaihto:58 ~/.claude/projects, :165-166 tmux + `claude --model --remote-control` | **kyllä** |
| | kesken.mjs, pakkaamatta.mjs | täysi | kesken:111-113 ~/.claude/projects + sessions; pakkaamatta:35,72 | **kyllä** |
| | konteksti-nyt, konteksti-data, kontekstikasvu, mittaa-kesto, komentotiheys | täysi | konteksti-nyt:24, konteksti-data:240, kontekstikasvu:46, mittaa-kesto:24,42, komentotiheys:30,57 | **kyllä** |
| | sa | täysi | sa/SKILL.md:10 CronCreate/CronList/CronDelete | **kyllä** |
| Agentit ja mallit | siirtaja-sonnet | täysi | ~/.claude/agents/siirtaja-sonnet.md `model: sonnet` | **kyllä** |
| | rd-context, toteuttaja-sonnet, toteuttaja-opus | täysi | ~/.claude/agents/*.md `model:` | **kyllä** |
| | vaihesilmukka, pura-vaiheet, pakkaa-vaiheet, erityisluvut | osittain | vaihesilmukka:109-112 `claude -p`, :126-129 agy; pakkaa-vaiheet:61 `--moottori`; erityisluvut:292 ~/.claude/hooks | **kyllä** |
| | keskustelun-siirto (reititin) | täysi (ohje) / osittain (sisältö) | SKILL.md:17-23 Agent, :18 `claude -p`, :270 AskUserQuestion | **kyllä** |
| Jo riippumattomat → yhteinen ydin | rekisterityökalut (vaatimukset, avoimet, arkisto, hukka*, ideat-sulku, roskat, poikkeamat, rikkeet, check-rekisteri, rakennetesti, korjurit, taulukko-/riviapurit, jasennin, liitosavain, lahdetarkistus, turvahaku, katto-ehdokkaat, testiton-korjaus, paatospyynto) | ei / polku | hukka-kirjaa:9 polku; testiton-korjaus:40 .claude/hooks-polku | **kyllä** |
| | git, lukot ja synkka (lukot, jaettu-kirjoitus, git-tila, repot, commit-map, Infra/git/synkka.sh) | ei / polku | lukot:25 polku | **kyllä** |
| | skoopin rakenne (luo-skooppi, siirra-skooppi, vaihda-polut, rakenna-/klonaa-tyotila, luo-repo, skooppi-polusta, skooppirajaus, juuri.sh) | ei / rakenne | siirra-skooppi `.claude/skills`/`.claude/hooks` kohdepolkuina; skooppirajaus:34; juuri.sh:36 vaatii `.claude/` | **kyllä** |
| | vika (vika.sh) | ei | ohje osoittaa polkuun ~/.claude/skills/vika:25 | **kyllä** |

Lisäksi kartoituksessa löytyivät `pilvi-laskeutus.sh` (osittain sidottu, CLAUDE_CODE_REMOTE) ja `pura/TASK.md` (lähes riippumaton). Ne eivät olleet kortilla. TASK.md kuuluu purkuun, eli muille skoopeille.
