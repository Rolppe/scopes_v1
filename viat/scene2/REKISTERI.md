# scopes/viat/scene2/REKISTERI.md

Tilanne: 26.10.2026

SEURAAVA PAKETTI: VIAT-SCENE2-VALMIS — Mac AGY ja OnePlus Linux AGY täysin eriytetty ja todennettu.

## Tarkoitus ja raja

Tarkoitus: selvittää scopes-istuntojen jumiutuminen ja eriyttää Mac AGY ja OnePlus Linux AGY täysin toisistaan kaikilla kerroksilla (tunnukset, kiintiöt, telemetria, taustapalvelu ja iOS-sovellus).

## Päätökset

- **Käyttäjä 26.10.2026:** skooppi `scopes viat scene2` luotiin komennolla `/pura uusi scopes viat scene2`.
- **Käyttäjä 26.10.2026:** macos agy ja oneplus agy toiminnallisuus erotettu toisistaan kunnolla:
  1. **Tunniste- ja kiintiöeristys:**
     - OnePlus Linux AGY käyttää tiliä `78311409+Rolppe@users.noreply.github.com`.
     - Mac AGY käyttää itsenäistä tiliä `78311409+Rolppe@users.noreply.github.com`.
     - Korjattu Macin file-based auth (`~/.gemini/antigravity-cli/antigravity-oauth-token`), jotta myös SSH-yhteyden kautta Macille ajetut `agy`-komennot käyttävät aina business-tunnusta Keychainin tapaan.
  2. **Telemetria ja statusline:**
     - Macin Antigravity CLI:lle kytketty `statusLine`-päivitys (`settings.json`).
     - Mac muodostaa oman tilatiedostonsa `~/.local/state/scopes-agy-kayttoraja.json`, ja palvelu lukee Macin ja palvelinin pyynnöt ja kiintiöt täysin erillisinä.
  3. **Palvelin ja mallireititys (`scopes/palvelu`):**
     - `purkajat.mjs`: `mac-agy/*` ja `agy/*` erotettu selkeästi omiin ryhmiinsä ("Mac AGY" vs "OnePlus Linux AGY").
     - `agy-istunto.mjs` ja `palvelin.mjs`: `onMac`-tunnistus ja kiintiöhaun erillisyys varmistettu; Mac AGY ei koskaan pudota kiintiökyselyä OnePlus Linux AGY:lle.
  4. **iOS/macOS-käyttöliittymä (`scopes/ios` ja `scopes/shared`):**
     - `PuraValinta.swift`: Korjattu virheellinen seliteteksti ("palvelimen Linux-agy ajaa istuntoa"), erotettu Mac AGY ja OnePlus Linux AGY selitteet.
     - `Nakymat.swift`: `ToimintoTulos` erottaa selkeästi Mac AGY-, OnePlus Linux AGY- ja Nebius-istuntojen käynnistykset.
     - `ScopeModels.swift` & `Malli.swift`: Lisätty `malli`-kenttä `ToimintoVastaus`-rakenteeseen.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Mac AGY & OnePlus Linux AGY eriyttäminen | Valmis ja todennettu 26.10.2026 | Seuranta käytössä |

## Viat

| Vika | Tila |
|---|---|
| Mac AGY käytti SSH:n yli oneplus-tilin kiintiötä | Korjattu (token synkronoitu business-tiliin) |
| Macilta puuttui statusline-tilatiedosto | Korjattu (statusLine aktivoitu) |
| UI-selite väitti Mac AGY:ta OnePlus-Linuxiksi | Korjattu |

## Historia

Historia: `scopes/viat/scene2/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
