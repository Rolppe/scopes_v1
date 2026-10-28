# Skoopit (scopes_v1)

iOS-äppi, joka näyttää Claude Code -skooppien rekisterit ja käynnissä olevien istuntojen kontekstin, sekä sen
kotipalvelimella ajettava Node-rajapinta. Tämä repo on jaettu kehitysrepo ilman kehitysaineistoa; äppi tehdään
SwiftUI:lla ja testataan iOS-simulaattorissa.

## Sisältö

- `ios/` – Skoopit-äppi (SwiftUI), widget, näppäimistölaajennus, UI-testit ja äpin oma WireGuard-tunneli (`tunneli/`, Go).
- `palvelu/` – Node 22 -palvelin (`palvelin.mjs`), käynnistys `kaynnista.sh`, testit `node --test palvelu/`.
- `localregister/`, `siirto/economy/`, `agy/` – palvelimen tuomat moduulit.

## Äpin rakentaminen (Mac, Xcode 26)

1. `cd ios/tunneli && ./rakenna.sh` – kääntää `Tunneli.xcframework`in (Go 1.26, gomobile tulee `go.mod`:n tool-direktiivillä).
2. `cd ios && xcodegen` – generoi `Skoopit.xcodeproj`:n, Info.plistit ja entitlementit `project.yml`:stä.
   Vaihda `project.yml`:n `DEVELOPMENT_TEAM: YOUR_TEAM_ID` omaan Apple-tiimiisi (bundle-etuliite `com.example`).
3. Avaa `Skoopit.xcodeproj` Xcodessa tai aja
   `xcodebuild -project Skoopit.xcodeproj -scheme Skoopit -destination "platform=iOS Simulator,id=<simctl list devices -tulosteen UDID>" CODE_SIGNING_ALLOWED=NO build-for-testing`.

Palvelimen osoite ja Bearer-avain annetaan äpin asetuksissa; UI-testit lukevat ne ympäristömuuttujista
`SCOPES_OSOITE` ja `SCOPES_AVAIN` (`ios/Sources/Asetukset.swift`).

## Palvelin

`palvelu/kaynnista.sh` käynnistää palvelimen porttiin 8787 ja luo avaimen `~/.config/scopes/avain`, jos sitä ei ole.
Ympäristömuuttujat on lueteltu `palvelu/palvelin.mjs`:n alussa. Rajapinta on kuvattu samassa tiedostossa.

Huomaa: palvelin lukee skooppirekisterit monorepon juuresta (`SCOPES_JUURI`, oletus kaksi hakemistoa `palvelu/`:n
yläpuolella) ja tuo sieltä moduuleja (`claude/siirto/tools/*.mjs`, `Infra/skills/...`), jotka eivät ole tässä
repossa. Ilman sitä ympäristöä palvelin ei käynnisty; äppi on silti rakennettavissa ja UI-testattavissa.

## Lisenssi

MIT, ks. `LICENSE`.
