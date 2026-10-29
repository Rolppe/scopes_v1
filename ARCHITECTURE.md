# Architecture

This document describes the stable shape of Scopes v1: what the pieces are, where they live, and why they are
arranged this way. File names are Finnish; see the glossary in `docs/DEVELOPMENT.md`. For a tour of the working notes
see the same file.

## Bird's-eye view

The author runs many Claude Code sessions in parallel, each in a tmux pane on a home server, each tied to a "scope": a
named work area with a register file (`REKISTERI.md`) that holds its next work packet, decisions, open items and
defects. Two things are hard to see from a phone: which scope is waiting for an answer, and how full each session's
context window is. The system answers both and lets the phone act on the sessions.

Three processes matter.

1. **The app** (`ios/`), SwiftUI, on the iPhone. It polls and streams, posts actions, keeps a local copy of the
   registers, and raises local notifications.
2. **The service** (`palvelu/`, `localregister/`), one Node 22 process on the server. It is the only thing the phone
   talks to. It reads registers and Claude Code transcripts, and it acts on sessions by typing into tmux panes.
3. **The sessions** themselves: Claude Code (and `agy`, the Antigravity CLI) in tmux, started by helper scripts of the
   author's wider tool chain that are not in this repository.

Between the app and the service sits either the home LAN or a WireGuard tunnel that the app runs in its own process.

## Codemap

`ios/Sources/` is the app. `Juuri.swift` is the entry and root view; `Sivupalkki.swift` the scope list;
`Infra.swift`, `Nakymat.swift` and `Malli.swift` the scope and infra views and their models; `Viestit.swift` chat and per-scope
messages; `Asiakas.swift` the HTTP client; `Reitti.swift` route choice (direct or tunnel); `Lr.swift` and
`LrNakymat.swift` register sync and its conflict UI; `Ilmoitukset.swift` notifications and background refresh;
`Diagnostiikka.swift` hang and request reporting; `Asetukset.swift` address (UserDefaults) and key (Keychain);
`Teema.swift` design tokens. `ios/Widget/` and `ios/Jaettu/` hold the widget and the snapshot shared through an App
Group. `ios/Keyboard/` is a Finnish keyboard extension. `ios/UITests/` drives the app against the live service.

`ios/tunneli/` is Go code built into `Tunneli.xcframework` with gomobile: wireguard-go plus gVisor netstack, exposed as
a local TCP forward.

`palvelu/palvelin.mjs` is the HTTP entry: environment, Bearer check, routing, NDJSON streaming. The modules it wires
together, by concern:

- Reading: `lahteet.mjs` (scope list, register parsing, session context size from transcripts, read-only).
- Acting: `toiminnot.mjs` (unpack, compact, new, archive; tmux send-keys), `viestit.mjs` (chat via `claude -p`, per-scope
  messages, model switching), `toiminnot-asetukset.mjs` (switches), `purkajat.mjs` (unpack options), `liitteet.mjs`
  (attachments).
- Other agents and devices: `agy-istunto.mjs`, `agy-kayttoraja.mjs`, `agy-luvat.mjs` (Antigravity CLI), `android.mjs`
  (adb), `linux-server.mjs` (wake and power-off of the server PC), `mac-claude.mjs` (sessions on the Mac).
- Terminal: `terminal.mjs` (WebSocket, session manager, REST under `/api/terminal/sessions`).
- Limits and cost: `kayttoraja.mjs`, `nebius-valitys.mjs` (translation proxy, separate process on loopback),
  `nebius-avain.mjs`, `economy.mjs` (helpers that save agent usage).
- Observability: `diagnostiikka.mjs`.

`localregister/` is the register store: `lr.mjs` (split, order keys, version vectors, import, export), `palvelu.mjs`
(the `/api/lr/...` routes), `MUOTO.md` (the accepted format). `shared/ScopesCore` (models, client, NDJSON, store,
`LrCore`) and `shared/ScopesUI` are Swift packages for the iOS and macOS clients; `macos/` is the macOS client;
`remoteterminal/` is the terminal client package and its protocol contract. `siirto/` and `agy/` contain Node helpers
for session hand-over and tests that arrived with them.

## Invariants

- **No command text from the phone reaches a shell.** The phone sends scope names, small enums and bounded text bodies.
  Names are checked against `skoopit.json` keys or a strict pattern; commands are `execFile` argument arrays. Message
  text goes to tmux as arguments or stdin, never into a command string.
- **A closed action list.** Unpack, compact, create, archive, hand-over, wake, power-off and the switches are the only
  mutations. One runs at a time; a second gets 429. Every attempt, accepted or rejected, is appended to the action log.
- **Preconditions are checked on the server.** Unpack only for a scope with no running session; compact only when the
  scope has exactly one tmux session and it is idle. The app disabling a button is a convenience, not the check.
- **The read side never writes.** `lahteet.mjs` has no write path.
- **Secrets are not in the repository and are never returned.** The Bearer key is a file on the server and a Keychain item
  on the phone; the provider API key can be set but `GET` returns only whether it exists and its length.
- **Nothing calls a paid API without an explicit cap.** The proxy treats a missing, zero or unreadable cap as "no call".
- **No third-party Node packages.** Every import in the server is a `node:` built-in or a relative path.
- **The registers in git stay the source of truth.** The line-level store lives outside git; the only path from it back to
  git is the explicit export (`lr.mjs vie`).
- **The device is touched gently.** Android control wakes the screen only for an action and puts back to sleep only a
  screen it woke itself; a "dry" mode reads state but runs no mutating command.

## Boundaries

**Phone to service.** HTTP/1.1 with JSON bodies, NDJSON for streamed chat, and a WebSocket upgrade for the terminal.
Every route except `/api/terveys` needs the Bearer key. Request bodies have size caps (1 KiB default, 32 KiB messages,
16 MiB register sync, 25 MB attachments). The phone is trusted only as far as the key goes; the service re-validates
everything.

**App to tunnel.** The tunnel is a library in the app process. The app asks `Reitti` for a base URL; at home it gets the
server address, elsewhere `http://127.0.0.1:<port>` which the tunnel forwards through WireGuard to the server.

**Service to the author's tool chain.** Unpack, archive and create call scripts under `claude/siirto/tools` and
`Infra/` of a monorepo through `execFile`; three modules are imported directly. This is the boundary that stops the
repository from running alone.

**Service to sessions.** Only tmux (`send-keys`, `capture-pane`, `list-panes`) and files: transcripts under
`~/.claude/projects` for Claude Code, SQLite for `agy`, opened read-only.

**App, widget, keyboard.** They share data only through the App Group snapshot (`Jaettu/Tilannekuva.swift`).

## Cross-cutting concerns

**Errors.** The service throws `Hylatty(status, message)` for anything the caller caused; the router turns it into a JSON
error with that status. Upstream failures become 502 or 504 with a short reason. Unknown protobuf structure or an
unreadable log degrades to less data, not an exception.

**Testing.** Node modules take their effects as parameters (`aja` for commands, clocks, paths), so tests inject fakes and
assert the exact `execFile` arguments. Server tests use `node:test`. The app is tested with XCUITest against the real
service, by decision, with a rule that simulator runs may send only requests the service rejects so no real session is
opened or created. A "dry" mode on the test instance (`SCOPES_LINUX_KUIVA`, `SCOPES_ANDROID_KUIVA`) reads real state but
does not run mutating commands.

**Observability.** Three JSON-line logs: actions, requests (with duration and a flag for connections closed before the
reply), and app-reported events. The service samples the event loop every 250 ms and records stalls over 500 ms. Logs
rotate at 5 MiB. The app reports main-thread hangs and MetricKit diagnostics.

**Security.** Bearer key compared with `timingSafeEqual`; the service refuses to start with a key under 32 characters;
the key file is created with mode 600; the service binds to loopback by default, and the cron starter
`palvelu/kaynnista.sh` sets all interfaces, so the key is the only gate on the LAN. There is no TLS: the model
relies on the LAN and WireGuard.

**Performance.** Synchronous reads block every request at once, which the app shows as a freeze; the stall detector
exists for that reason. On the phone, view identity is controlled with an `Equatable` content view; the measurement
is in `performance/ios/MITTAUKSET-2026-10-18.md`.

## Key design decisions

### 1. The tunnel runs inside the app

- **Context.** The phone must reach the home server from outside. A free Apple account has no Network Extension, so a
  normal VPN profile is not available to the app, and a separate VPN app is another thing to keep alive.
- **Decision.** Embed wireguard-go with gVisor's userspace network stack and forward a local port to the server.
  Fetch the tunnel config from the server while at home and keep it in the Keychain.
- **Consequences.** No extra app and no router change. The tunnel exists only while the app runs, and a frozen app can
  lose its listener, which `Reitti.unohda` repairs. The WireGuard endpoint is a DDNS name that is re-resolved when the app returns to the foreground.

### 2. "Only ready-made actions" instead of a remote shell

- **Context.** The phone can start work on a machine that holds many repositories and credentials. The first design
  question (13.10.2026) was how much of that to expose.
- **Decision.** The service runs only fixed actions. The phone supplies a scope name and an enum, never a command.
  A separate write key with Face ID was considered and rejected; the same key and a closed action list were chosen.
- **Consequences.** Adding a capability means writing a new action, with tests for its exact arguments. Anything
  unusual needs a terminal, which became a separate feature behind the same key.

### 3. Register sync at line level, outside git, with version vectors

- **Context.** Registers are Markdown files that many sessions edit and that the phone should also edit. Whole-file
  merges conflict constantly. A measurement of 859 register edits showed that concurrent edits are rare (3 of 223 cross-session pairs in a
  2-hour window), and that 2 of those 3 hit the same section, so section granularity looked too coarse.
- **Decision.** One unit per line or list item with a stable id, a fractional order key, and a version vector per
  device. Compare a root hash, then per-register hashes, then unit lists. Deletes are tombstones; conflicts are kept and
  shown to the user. The server is the always-on peer. Git remains the archive and receives an explicit export.
- **Consequences.** Two implementations (JS and Swift) must agree, so the Swift side was ported function by function
  and tested. Tombstones accumulate until a manual clean-up compacts them.

### 4. Local notifications and background refresh instead of push

- **Context.** APNs needs a paid developer account; the project signs with a free one. A server-side push through a home
  automation system was decided and then removed on 15.10.2026.
- **Decision.** Poll every 10 s in the foreground; in the background use `BGAppRefreshTask` to compare against a stored
  baseline, post local notifications, and refresh the widget.
- **Consequences.** Delivery timing is up to iOS and cannot be guaranteed. The register records a decision to show the last
  background refresh in settings so the behaviour can be checked rather than assumed.

### 5. UI tests against the real service

- **Context.** Mocks of a service whose behaviour is mostly "what tmux and the transcripts look like" would test the
  mock. The service was cheap to run beside the simulator.
- **Decision.** XCUITests talk to a live service (address and key from the environment) and use only requests that the
  service rejects whenever a test could otherwise mutate state; the write paths are covered by server tests with fakes.
- **Consequences.** UI tests cannot run in a clean checkout, and the Mac simulator is a shared resource guarded by a
  lock. In return a failing UI test usually means a real contract break.

### 6. Hand-written WebSocket and zero dependencies

- **Context.** A terminal needs a WebSocket server, and the service has no package manifest. The plan named `node-pty`
  and a `ws`-style library; the recorded reason for not using them is only "without external dependencies".
- **Decision.** Implement RFC 6455 framing directly with a 1-byte channel frame on top (data, control, heartbeat),
  and keep the rest of the service on built-ins.
- **Consequences.** More code to own and test (`terminal.test.mjs`, 381 lines), but nothing to install or update on the
  server. The server side uses plain child-process pipes with tmux providing the terminal semantics.

## What came next

The successor (scopes_v2) replaces the single service with a node on every device, so phones, Macs and servers
replicate directly, and replaces the shared Bearer key with per-device keys. The reasoning is in
`architecture/SUUNNITELMA.md` (decisions K-1 to K-11).
