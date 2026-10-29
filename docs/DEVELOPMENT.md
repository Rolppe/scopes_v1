# Development notes

How Scopes v1 was developed, and how to read the working notes that were left in the repository.

## How development worked

Mikko Paaso wrote the requirements, took the architecture decisions and directed the work. Claude Code agents wrote
the code. Nothing was done in one long conversation. Work was cut into **work packets**, each owned by a **scope**, and
each scope was a separate agent session with its own written state.

1. **Scopes by feature.** On 13.10.2026 the first decision log fixes the split: scopes by feature, not by layer, so the
   same feature in the app and in the service belongs to one scope (`chat`, `lista`, `infra`, `yhteys`, `jakelu`,
   `notifications`, `ioskeyboard`, `remoteterminal` and so on). Later scopes covered cross-cutting topics:
   `viat` (defects), `performance`, `design`, `models`, `usagelimits`.
2. **A register per scope.** `REKISTERI.md` holds purpose and boundary, decisions (dated, with "Käyttäjä" when the
   user decided), open items, defects and one line `SEURAAVA PAKETTI` (next packet) that says what to do, which paths
   it may touch and how to start (`/pura <scope>`). A new session reads only that, so context stays small.
3. **Pack and unpack.** At the end of a session the agent ran `/pakkaa`: it writes a memo, updates the register,
   appends to `HISTORIA.md` and moves removed text to `ARKISTO.md`. The next session ran `/pura` and continued from the
   next-packet line. The phone app drives the same commands (see the README).
4. **Briefs for executors.** For larger work a planner wrote a brief per task and a cheaper model executed it. A brief
   in `toteutussuunnitelma/briefit/` has a fixed shape: task, files (`may` / `must not` / `read`), numbered steps,
   an acceptance command, and a budget. The supervisor hands the executor only the path to the brief and runs the
   acceptance command itself.
5. **Acceptance gates.** A task is done when its gate is green, not when the agent says so: a `gate.sh` script
   (`macos/`, `remoteterminal/`, `siirto/git/`, `siirto/economy/`), `node --test`, XCUITests against the live
   service, and device runs. Gates also enforce boundaries, for example failing when a path outside the scope changed.
   Executor runs were logged in `toteutussuunnitelma/mittaukset/tehtavat.jsonl` (47 rows: 42 green, 4 red, 1 aborted).
6. **Defects are first-class.** Problems found during work get an id (`V-nnn`) and a row in `viat/` or the scope's own
   register, and are fixed in a later packet.
7. **Orchestration model.** For the successor project the roles were formalised: planners decide, a coordinator hands out
   gate slots, work scopes implement, a Haiku-class watcher reads tmux panes, an overseer resolves stuck sessions with
   the user's standing authority. See `KEHITYSMALLI.md` (Finnish, written 20.10.2026).

Evidence in git: 195 commits from 2026-10-13 to 2026-10-29, 168 with a `Co-Authored-By` trailer naming the model.

## A note on the files

Everything below is working notes, written in Finnish by agents for agents and kept as a record of the process. They
are not polished documentation and they contain references to a private monorepo and to the author's machines.

| File | What it is |
|---|---|
| `REKISTERI.md` | The register: current state, next packet, decisions, open items, defects. 81 files. |
| `HISTORIA.md` | Change history of a scope, newest packets with commit ids. 59 files. |
| `ARKISTO.md` | Archive of closed work: text removed from the register, kept verbatim, oldest first. 59 files. |
| `REKISTERI.arkistoitu.md` | A register of a scope that was closed and archived. |
| `SUUNNITELMA.md` | Plan of a scope: options, chosen design, task list. |
| `ESITIEDOT.md` | Background research collected before planning (facts numbered E-nn). |
| `RAJAPINTA.md`, `MUOTO.md` | Contracts: terminal protocol, register sync format. |
| `*-BRIEF.md`, `briefit/T-*.md` | Task briefs for executors. |
| `gate.sh` | Acceptance gate of a scope. |

## Map of the main directories

Code:

| Directory | Contents |
|---|---|
| `ios/` | The app, widget, keyboard, UI tests, `tunneli/` (Go). `REKISTERI.md` here is the app owner's register. |
| `palvelu/` | Node service. |
| `localregister/` | Register sync store and its format. |
| `shared/`, `macos/` | Swift packages and the macOS client. |
| `remoteterminal/` | Terminal client package, protocol contract (`RAJAPINTA.md`), plan. |
| `ioskeyboard/` | Keyboard scope. Its `Sources` equals `ios/Keyboard`. |
| `siirto/`, `agy/`, `universaltools/` | Hand-over helpers and tests (git, economy), Antigravity CLI work, agent-neutral tools. |

Notes by feature or concern (each has `REKISTERI.md`, often `HISTORIA.md` and `ARKISTO.md`):

| Directory | Topic |
|---|---|
| `chat/`, `lista/`, `infra/`, `yhteys/` | Chat and messages, scope list, infra view, connection to the service |
| `notifications/`, `usagelimits/`, `models/`, `agents/` | Notifications, usage limits, model choice, agent and model combinations |
| `design/`, `performance/` | Look and feel (`ILME.md`, `KATSELMUS.md`, screenshots in `kuvat/`), measurements |
| `viat/` | Defect tracker for the app and service |
| `context/`, `istunnot/`, `kysymys/` | Context-size management, session lifecycle, a scope for general questions |
| `sideloader/`, `jakelu/` | Installing own apps on the phone, distribution (`jakelu` is archived) |
| `architecture/`, `toteutussuunnitelma/` | Architecture decisions K-n and the implementation plan with briefs (T-nn) |
| `overseer/`, `vahtimestari/`, `kordinaattori/`, `patriot/` | Orchestration roles of the agent team |
| `lostdev/` | Investigation into development data that had gone missing, with recovered copies |
| `scopes2agy-plan/`, `qwen38/`, `knowledge/`, `jako/`, `local/`, `test/`, `test1/`, `testit/`, `palvelin/` | Small scopes, mostly archived or created without a stated purpose |

Top-level `REKISTERI.md`, `HISTORIA.md` and `ARKISTO.md` are the root scope's own. `toteutussuunnitelma/briefit/`
(82 briefs) belongs to the successor's work, which is why the briefs name `scopes2/` paths that are not in this repository.

## Glossary

| Finnish | English | Seen in |
|---|---|---|
| skooppi (scope) | named work area with its own register and sessions | everywhere; `lahteet.mjs`, `skoopit.json` |
| rekisteri | register (state file of a scope) | `REKISTERI.md`, `/api/rekisterit` |
| paketti, SEURAAVA PAKETTI | work packet, "next packet" line | `REKISTERI.md`, `jasennaSeuraava` |
| pura | unpack: start a session from a scope's saved state | `toiminnot.mjs`, `/pura`, `purkajat.mjs` |
| pakkaa | pack: save session state into the register | `/pakkaa`, `/api/skoopit/<n>/pakkaa` |
| siirto, automaattisiirto | hand-over of a session, automatic hand-over | `siirto/`, `/automaattisiirto` |
| autojatko | auto-continue with the next packet | settings switch `automaattijatko` |
| äppi | the app | `ios/` |
| palvelu, palvelin | service, server | `palvelu/`, `palvelin.mjs` |
| tunneli, reitti | tunnel, route | `ios/tunneli/`, `Reitti.swift` |
| avain | key (Bearer key) | `avainKelpaa`, `SCOPES_AVAIN_TIEDOSTO` |
| toiminnot, hylätty | actions, rejected | `toiminnot.mjs`, `Hylatty` |
| kuiva | dry run (reads, does not mutate) | `SCOPES_LINUX_KUIVA`, `SCOPES_ANDROID_KUIVA` |
| käyttöraja | usage limit | `kayttoraja.mjs`, `/api/kayttoraja` |
| viat, vika | defects, defect (`V-nnn`) | `viat/`, REKISTERI defect rows |
| kysymys, kysymyskortti | question, question card (multiple choice) | `kysymys/`, `KysymysUITests.swift` |
| ilme, katselmus | look and feel, design review | `design/ILME.md`, `KATSELMUS.md` |
| yksikkö, murtoindeksi, ristiriita | unit, fractional index, conflict | `localregister/MUOTO.md`, `lr.mjs` |
| versio, hautakivi | version (vector), tombstone | `lr.mjs`, `Lr.swift` |
| vertaa, valiin | compare, "between" (order key between two) | `lr.mjs` |
| käsittelijä (`kasittelija`) | request handler | `palvelin.mjs` |
| virta, suoratoisto | stream, streaming | `/api/chat/virta` |
| liite | attachment | `liitteet.mjs` |
| jäätyminen, diagnostiikka | freezing, diagnostics | `diagnostiikka.mjs`, `Diagnostiikka.swift` |
| portti | gate (acceptance script) | `gate.sh` |
| valvoja, toteuttaja | supervisor, executor | `KEHITYSMALLI.md`, `toteuttaja-sonnet` |
| koordinaattori (`kordinaattori`), vahtimestari | coordinator, watcher ("usher") | `kordinaattori/`, `vahtimestari/` |
| jumi | jam: a session stuck on something | `KEHITYSMALLI.md` (JUMI messages) |
| päätös | decision | REKISTERI "Päätökset" section |
| kehitysmalli | development model | `KEHITYSMALLI.md` |
