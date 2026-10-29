# scopes/remoteterminal/REKISTERI.md

Tilanne: 27.10.2026

SEURAAVA PAKETTI: REMOTETERMINAL-TODENNUS — E2E-integraatiotestit, yhteyskatkotestit ja kokonaistodennus — polut: scopes/remoteterminal/** — aloitus: /pura scopes remoteterminal — automaattinen: kyllä

## Tarkoitus ja raja

**Tarkoitus:** Etäpääte- ja komentotilaintegraatio Scopes-sovellukseen (iOS ja macOS) ja palveluun (`scopes/palvelu`). Mahdollistaa vuorovaikutteisen terminaaliyhteyden (PTY / tmux / SSH / shell-istunnot) etäpalvelimille (OnePlus-palvelin, Mac, palvelin) suoraan Scopes-käyttöliittymästä hyödyntäen `scopes ioskeyboard` -näppäimistöä mobiilissa. Mahdollistaa komentojen ajon, istuntojen valvonnan ja reaaliaikaisen PTY/terminaalinäkymän.

**Raja:**
- Sisällä: Etäterminaalin (Remote Terminal) arkkitehtuuri, määritykset, käyttöliittymäkomponentit ja protokollaintegraatio (PTY/WebSocket/virta palvelun ja sovelluksen välillä) polussa `scopes/remoteterminal/**`. Päätenäkymän (TerminalView) toteutus ja sovittaminen Scopes-sovellukseen (iOS / macOS / shared). Taustapalvelun terminaalituki (`scopes/palvelu`) PTY/istuntojen hallintaan yhteistyössä palvelun rajapintojen kanssa.
- Ulkona: Erillisen itsenäisen näppäimistön toteutus ja symbolilogiikka (kuuluu `scopes ioskeyboard` -skoopille). Yleinen chat- ja agenttikeskustelu (kuuluu `scopes chat` -skoopille). Muiden skooppien rekisterimuutokset ja hallinta (kuuluu omistajaskoopeille TYÖTAVAT säännön 15 mukaisesti).

## Päätökset

- **Käyttäjä 27.10.2026:** skooppi `scopes remoteterminal` luotiin komennolla `/pura uusi scopes remoteterminal`.
- **27.10.2026:** skoopin tarkoitus ja raja määritelty (REMOTETERMINAL-MAARITTELY).
- **27.10.2026 (REMOTETERMINAL-KARTOITUS):** Kartoitettu etäterminaalin arkkitehtuurivaihtoehdot (`scopes/remoteterminal/SUUNNITELMA.md`). Valittu palvelimeen `node-pty` tmux-kytkennällä (`tmux new-session -A`), protokollaksi täysi kaksisuuntainen WebSocket (URLSessionWebSocketTask / Node ws/http upgrade) ja asiakaspuolen emulaattoriksi Miguel de Icazan `SwiftTerm` (SPM) kiedottuna SwiftUI-komponentiksi iOS:lle ja macOS:lle. Mobiilissa hyödynnetään `scopes ioskeyboard` -näppäimistön vaakatilan keskinappeja ja terminaalin dedikoitua apupalkkia (Ctrl, Alt, Esc, Tab, nuolet). Luotu gate-testi `scopes/remoteterminal/gate.sh`.
- **27.10.2026 (REMOTETERMINAL-SUUNNITTELU):** Laadittu ja hyväksytty terminaalin rajapintasopimus ja protokollamääritys (`scopes/remoteterminal/RAJAPINTA.md`). Valittu vikasietoinen ja suorituskykyinen 1-tavuinen kanavointikehys ('0' raaka I/O-data ilman JSON-overheadia, '1' JSON-ohjausviestit kuten resize/signal/ready/exit, '2' heartbeat ping/pong). Määritelty REST-hallintapäätepisteet (`/api/terminal/sessions`), tmux `new-session -A` -kytkentämalli, Swift Codable -mallit sekä SwiftTerm/SwiftUI-integraatio. Luotu yksikkötestit `scopes/remoteterminal/testi.mjs` ja päivitetty `gate.sh`.
- **27.10.2026 (REMOTETERMINAL-PALVELU):** Toteutettu palvelinpään PTY-, WebSocket- ja tmux-istuntohallinta moduulissa `scopes/palvelu/terminal.mjs` ja kytketty `scopes/palvelu/palvelin.mjs`:ään. Palvelin tukee RFC 6455 -mukaista WebSocket-kättelyä ja -kehystystä ilman ulkoisia riippuvuuksia, Bearer- ja URL-token-autentikointia, 1-tavuista kehysprotokollaa ('0' I/O-data, '1' JSON-ohjaus, '2' heartbeat), koonmuutosta (resize/SIGWINCH), signaaleja ja REST-hallintareittejä (`GET/POST/DELETE /api/terminal/sessions`). Luotu kattavat yksikkö- ja integraatiotestit `scopes/palvelu/terminal.test.mjs` ja päivitetty `gate.sh`.
- **27.10.2026 (REMOTETERMINAL-SWIFTTERM):** Toteutettu Swift-asiakaspaketti (`Package.swift`, `ScopesRemoteTerminal`) ja SwiftTerm-kytkentä. Määritelty Swift Codable -mallit (`TerminalSessionInfo`, `CreateTerminalSessionRequest`, `TerminalControlMessage`, `TerminalConnectionState`) ja `TerminalWireFrame` 1-tavuiselle kehysprotokollalle. Toteutettu täysi WebSocket-yhteysluokka `TerminalConnection` (`URLSessionWebSocketTask`, kättely, 3s automaattinen uudelleenyhdistys, 15s elossapito-heartbeat ja tilanhallinta). Toteutettu jaettu SwiftUI `TerminalViewRepresentable` UIKit- ja AppKit-alustoille SwiftTermin `TerminalView`'n ja `TerminalViewDelegate`n kiedonnalla (saapuvan PTY-datan feed, syötteen lähetys ja resize). Toteutettu mobiilin `TerminalAccessoryBar` pikanäppäimillä (`ESC`, `TAB`, nuolinäppäimet, `Ctrl-C`, `Ctrl-D`, `Ctrl-L`) ja sticky `CTRL`/`ALT` -modifioijilla sekä `TerminalTheme`-väripaletit. Luotu kattavat Swift- ja Node-yksikkötestit ja todennettu `gate.sh` puhtaasti (exit 0).
- **27.10.2026 (REMOTETERMINAL-UI):** Toteutettu RemoteTerminalView-päänäkymä, istuntovalitsin TerminalSessionPickerView sekä integroitu TerminalAccessoryBar ja TerminalTheme. Toteutettu RemoteTerminalViewModel yhdistämään PTY WebSocket -yhteyden, REST-istuntohallinnan (haku, luonti, sulkeminen, tmux-liitos), fonttikoon dynaamisen säädön ja teemanvalinnan. Toteutettu kattavat yksikkötestit RemoteTerminalViewTests ja päivitetty gate.sh (exit 0).

- **27.10.2026:** Käytetään SwiftTerm-kirjastoa terminaaliemulaation ytimenä

- **27.10.2026:** Kapseloidaan terminaaliemulaattori ja yhteyslogiikka TerminalConnection-luokan ja jaetun TerminalViewRepresentable-näkymän taakse

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| SwiftTerm- ja SwiftUI-komponentti (iOS/macOS) | valmis (REMOTETERMINAL-SWIFTTERM) (todenna viim. 10.11.2026) | - |
| RemoteTerminalView-päänäkymä ja istuntovalitsin | valmis (REMOTETERMINAL-UI) (todenna viim. 10.11.2026) | - |
| E2E-integraatiot ja verkkokatkotestit | Avoin (kirjattu 27.10.2026) | paketti REMOTETERMINAL-TODENNUS |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/remoteterminal/HISTORIA.md` (päivitetty 27.10.2026), ei lueta purussa.
