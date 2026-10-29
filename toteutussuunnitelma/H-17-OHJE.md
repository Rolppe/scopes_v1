# H-17: laiteallekirjoitus ja asennus (iPhone ja Mac), pysyvä tunneli (H-14) ja V2-avain Keychainiin (H-15)

Valmisteltu 20.10.2026 (scopes toteutussuunnitelma, käyttäjän pyyntö). Ajetaan käyttäjän päätöksen mukaan (851b0343)
Macin työpöydällä Xcodessa **T-51:n vihreän jälkeen**. H-14 päätetään T-51:n tuloksesta. Ohje ei ole hyväksyntä:
jokainen muuttava vaihe kysytään ajohetkellä.

## Todennettu lähteestä 20.10.2026 (lukevasti)

| Asia | Tila | Lähde |
|---|---|---|
| Allekirjoitusvarmenne | `Apple Development: 78311409+Rolppe@users.noreply.github.com`, 1 voimassa | `ssh dev-host security find-identity -v -p codesigning` |
| Tiimi | YOUR_TEAM_ID, `CODE_SIGN_STYLE: Automatic` (sama kuin vanhoissa äpeissä) | `scopes2/{ios,macos}/project.yml:7-8` |
| Bundle-id:t | iOS `com.example.scopes-v2`, macOS `com.example.scopes-v2.mac` (P-11; vanhat jäävät rinnalle) | `project.yml:26` |
| iPhone | iPhone 15 Pro, UDID `YOUR_DEVICE_UDID`, `available (paired)` | `ssh dev-host xcrun devicectl list devices` |
| XCFramework | laiteviipale mukana (`aarch64-apple-ios`, `-ios-sim`, `-darwin`) | `scopes2/ydin/apple/rakenna-xcframework.sh:18` |
| Avain äpissä | Keychain: palvelu `com.example.scopes-v2`, tili `avain`, `AfterFirstUnlock`; ympäristö `SCOPES2_AVAIN` ohittaa (testit) | `ScopesCore2/Avain.swift` |
| Avaimen syöttö | asetusnäkymän SecureField → `Avain.tallenna` | `ScopesUI2/AsetuksetNakyma.swift:91-93` |
| Vertainen | oletus `http://127.0.0.1:18797`; `UserDefaults scopes2.vertainen` ohittaa | `ScopesCore2/Solmu.swift:103-105` |
| Tuotannon V2 | `scopes-solmu` kuuntelee `127.0.0.1:8797` (ei verkkoon); avain `~/.config/scopes2/avain` (64 t, 0600) | `ss -ltnp`, `scopes2/kaynnista.sh:54` |
| Mac → palvelin | `ssh palvelin` toimii BatchModessa (192.0.2.11) | `ssh dev-host ssh -o BatchMode=yes palvelin true` |
| Tunnelimalli | `~/Library/LaunchAgents/com.example.lmstudio-linux-tunneli.plist` (ssh -N -L, KeepAlive, ThrottleInterval 60) | `plutil -p` |
| Tunneli nyt | ei 18797-kuuntelijaa Macilla, ei scopes2-agenttia | `lsof`, `launchctl list` |

## Rajoite: iPhone-äppi ei saa yhteyttä ennen ARK-14:ää

iPhonen äpin vertainen `127.0.0.1:18797` ei ole puhelimessa olemassa, ja tuotannon 8797 kuuntelee vain loopbackia.
ARK-14 tuo WG:n ja laiteparituksen (V2-portti `0.0.0.0`/WG). K-5:n mukaan yhteinen Bearer-avain poistuu silloin,
joten V2-avaimen syöttö iPhoneen nyt olisi kertakäyttöinen. **iPhone-osa todentaa siis vain allekirjoituksen,
asennuksen ja käynnistyksen.** Asetusnäkymä avautuu, koska avain puuttuu (`ScopesV2App.swift:53`). Käyttäjä
päättää ajohetkellä, tehdäänkö iPhone-osa nyt vai ARK-14:n yhteydessä.

## Vaiheet

**0. Esiehdot (agentti, lukeva).** T-51:n vihreä on rekisterissä ja gitissä. `gate.sh` ei ole käynnissä
(Macin `~/scopes2-rakennus/.lukko` vapaa, `pgrep -f "gate.sh"` palvelimella tyhjä). Työpuussa ei ole
T-52:n commitoimattomia muutoksia.

**1. Rakennuspuu Macille (agentti).** HEAD-puu viedään `mac:~/scopes2-rakennus/`, XCFramework rakennetaan ja
`xcodegen` ajetaan portin tavoin (`gate.sh`:n `siirto`, `xcframework_varmista`, `xcodegen_molemmat`). Mitään ei
allekirjoiteta, koska ssh:n yli codesign kaatuu `errSecInternalComponent` (P-16). Macin kopiosta ei committoida (V-572).

**2. macOS-äppi (käyttäjä, Macin työpöytä).**
1. Avaa `~/scopes2-rakennus/macos/ScopesV2Mac.xcodeproj` ja valitse kohde ScopesV2Mac.
2. Tarkista Signing & Capabilities: Team YOUR_TEAM_ID ja Automatically manage signing.
3. Valitse ajokohteeksi My Mac ja paina ⌘R. Äppi avaa asetusnäkymän, koska avain puuttuu.

**3. Pysyvä tunneli H-14 (käyttäjä; vain jos käyttäjä hyväksyy T-51:n jälkeen).** Luokitin estää agenttia luomasta
pysyvää agenttia (Unauthorized Persistence, 51902251), joten käyttäjä ajaa Macin päätteessä:

```
cat > ~/Library/LaunchAgents/com.example.scopes2-tunneli.plist <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.example.scopes2-tunneli</string>
  <key>ProgramArguments</key><array>
    <string>/usr/bin/ssh</string><string>-N</string>
    <string>-o</string><string>ExitOnForwardFailure=yes</string>
    <string>-o</string><string>ServerAliveInterval=30</string>
    <string>-o</string><string>ServerAliveCountMax=3</string>
    <string>-o</string><string>BatchMode=yes</string>
    <string>-o</string><string>ConnectTimeout=10</string>
    <string>-o</string><string>ControlMaster=no</string>
    <string>-o</string><string>ControlPath=none</string>
    <string>-L</string><string>18797:127.0.0.1:8797</string>
    <string>palvelin</string>
  </array>
  <key>KeepAlive</key><true/>
  <key>RunAtLoad</key><true/>
  <key>ThrottleInterval</key><integer>60</integer>
  <key>StandardErrorPath</key><string>/tmp/scopes2-tunneli.log</string>
</dict></plist>
EOF
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.example.scopes2-tunneli.plist
```

Huom.: tunneli vie tuotannon 8797:ään (ei koeytimeen). Gaten testit käyttävät samaa porttia 18797 tilapäisellä
tunnelilla (P-14), joten pysyvä agentti ja `gate.sh`-ajot törmäävät porttiin. Ennen bootstrapia on päätettävä,
siirtyykö portin tilapäinen tunneli toiseen porttiin (`scopes2 shared`, TYÖTAVAT 15) vai pysäytetäänkö agentti
ajon ajaksi (`launchctl bootout gui/$(id -u)/com.example.scopes2-tunneli`).

**4. V2-avain Keychainiin H-15 (käyttäjä, Macin pääte ja äppi).** Avain ei näy päätteessä eikä lokissa:

```
ssh palvelin 'cat ~/.config/scopes2/avain' | pbcopy
```

Liitä avain äpin asetusnäkymän avainkenttään ja paina Tallenna. Tyhjennä sitten leikepöytä: `pbcopy < /dev/null`.

**5. iOS-äppi (käyttäjä; jos iPhone-osa tehdään nyt).**
1. Avaa `~/scopes2-rakennus/ios/ScopesV2.xcodeproj`, kohde ScopesV2, Team YOUR_TEAM_ID, automaattinen allekirjoitus.
2. Valitse ajokohteeksi iPhone (iPhone 15 Pro) ja paina ⌘R. Puhelimen on oltava auki.
3. Avainta ei syötetä (ks. rajoite).

**6. Todennus (agentti, lukeva).**
- `ssh dev-host 'curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18797/api/terveys'` palauttaa 200.
- `ssh dev-host 'launchctl print gui/$(id -u)/com.example.scopes2-tunneli | grep -E "state|pid"'` näyttää `running`.
- Palvelimen ydin näkee laitteen `mac-Mac-Pro-7` vertaisena (ytimen loki tai API).
- macOS-äpin sivupalkissa on samat skoopit kuin `/api/skoopit` (agentti tarkistaa XCUITestillä tai näkymäpuusta).
- `ssh dev-host 'xcrun devicectl device info apps --device YOUR_DEVICE_UDID' | grep scopes-v2` löytää äpin, ja
  `xcrun devicectl device process launch --device YOUR_DEVICE_UDID com.example.scopes-v2` käynnistää sen.
  Agentti tarkistaa tuloksen devicectl:llä eikä pyydä käyttäjää lukemaan näyttöä.

**7. Palautus.**
- Tunneli: `launchctl bootout gui/$(id -u)/com.example.scopes2-tunneli` ja plist-tiedoston poisto.
- Avain: asetusnäkymän Poista (`Avain.poista`).
- Äpit: poista scopes-V2 Macilta ja iPhonesta. Vanhat äpit (`com.example.skoopit`, `com.example.scopes.mac`)
  eivät muutu.

## Avoimet päätökset ajohetkellä (käyttäjä)

1. Tehdäänkö iPhone-osa nyt (vain allekirjoitus ja asennus) vai ARK-14:n yhteydessä.
2. H-14: hyväksytäänkö pysyvä agentti T-51:n tuloksen perusteella.
3. H-14:n porttitörmäys 18797 gaten tilapäisen tunnelin kanssa: kumpi siirtyy (päätös `scopes2 shared` -skoopin kanssa).
