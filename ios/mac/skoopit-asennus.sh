#!/bin/bash
# Skoopit: käännä, allekirjoita ja asenna iPhoneen GUI-istunnon LaunchAgentissa (DEMO-SCOPES-PUHELIN).
# ssh-istunto ei pääse login-avainnippuun (codesign errSecInternalComponent), joten käännös ajetaan agentissa.
# Allekirjoituksen 7 pv uusinta (DEMO-SCOPES-UUSINTA, expresso-ios:n malli): agentti herää 30 min välein;
# alle 48 h jäljellä → profiili sivuun, käännös ja asennus, uuden profiilin pitää vanheta myöhemmin.
# Käyttö: skoopit-asennus.sh            käynnistä agentti, odota ≤ 540 s, tulosta loki, exit = agentin exit
#         skoopit-asennus.sh --uusi     sama, mutta pakota profiilin uusinta (exit 7 = ei uusiutunut, 8 = näyttö lukossa)
#         skoopit-asennus.sh --ipa      käännä ja paketoi $MAC_PROJ/scopes/scopes-ios/Skoopit.ipa (ohita devicectl-asennus)
#         skoopit-asennus.sh --ajastus [H]  aja ajastettu päätös heti (H = testitunnit)
#         skoopit-asennus.sh --check    preflight-rivi ja H
#         skoopit-asennus.sh --agentti  (LaunchAgent) ajastettu päätös tai tilattu xcodegen + xcodebuild + devicectl install
set -u
export PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
T=${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios
LAITE=YOUR_DEVICE_UDID
LABEL=com.example.skoopit-asennus
APP=$T/build-laite/Build/Products/Debug-iphoneos/Skoopit.app
LOKI=$T/asennus.loki
TILA="${1:-}"
loki() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOKI"; }
aloki() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$T/ajastus.loki"; }
valmis() { echo "valmis exit=$1" > "$T/tila"; exit "$1"; }
profexp() { security cms -D -i "$1" 2>/dev/null | plutil -extract ExpirationDate raw - 2>/dev/null; }
# Oma profiili: äppi ja sen laajennukset (.widget, .keyboard); laajennusten profiilit jäivät ennen uusimatta (V-447)
omapro() { security cms -D -i "$1" 2>/dev/null | plutil -extract Entitlements.application-identifier raw - 2>/dev/null \
  | grep -qE '\.com\.example\.skoopit(\.[a-z]+)?$'; }
# Annettujen profiilien aikaisin vanhenemisaika: äppi vanhenee, kun mikä tahansa sen profiileista vanhenee (V-447)
lahin() { local p e m=""; for p in "$@"; do e=$(profexp "$p"); [ -n "$e" ] && { [ -z "$m" ] || [[ "$e" < "$m" ]]; } && m=$e; done; echo "$m"; }
laitetila() { xcrun devicectl list devices 2>/dev/null | grep "$LAITE" | sed "s/.*$LAITE (UDID) *//; s/  .*//"; }
kaynnissa() { launchctl print "gui/$(id -u)/$LABEL" 2>/dev/null | grep -q 'state = running'; }
# Asennetun profiilin jäljellä olevat tunnit (H) ja vanhenemisaika epochina (VANH)
PROF=$T/asennettu.mobileprovision; [ -f "$PROF" ] || PROF=$APP/embedded.mobileprovision
NYT=$(date +%s); VANH=""; E=$(lahin "$PROF" "$APP"/PlugIns/*.appex/embedded.mobileprovision)
[ -n "$E" ] && VANH=$(date -j -u -f '%Y-%m-%dT%H:%M:%SZ' "$E" +%s 2>/dev/null)
if [ -n "$VANH" ]; then H=$(( (VANH - NYT) / 3600 )); else H=0; VANH=$NYT; fi
TESTI=0
ilmoita() {
  [ "$H" -lt 36 ] && [ "$TESTI" = 0 ] || return 0
  [ -f "$T/ilmoitus.stamp" ] && [ -n "$(find "$T/ilmoitus.stamp" -mmin -360 2>/dev/null)" ] && return 0
  osascript -e "display notification \"Skoopit vanhenee $(date -r "$VANH" '+%d.%m. %H.%M') — ${1:-Mac hereille, iPhone samaan verkkoon}\" with title \"Skoopit\"" >/dev/null 2>&1
  touch "$T/ilmoitus.stamp"
}

if [ "$TILA" = "--check" ]; then
  XC=ei; [ -x "$DEVELOPER_DIR/usr/bin/xcodebuild" ] && XC=on
  XG=ei; command -v xcodegen >/dev/null 2>&1 && XG=on
  AG=ei; launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1 && AG=on
  LT=$(laitetila); [ -n "$LT" ] || LT=ei
  echo "preflight: xcode=$XC xcodegen=$XG agentti=$AG laite=$LT H=$H"
  [ "$XC" = on ] && [ "$XG" = on ] && [ "$AG" = on ]
  exit $?
fi

if [ "$TILA" = "--agentti" ]; then
  LUKKO=$T/lukko
  [ -d "$LUKKO" ] && [ -n "$(find "$LUKKO" -maxdepth 0 -mmin +120 2>/dev/null)" ] && rmdir "$LUKKO"
  mkdir "$LUKKO" 2>/dev/null || { loki "ohitus: lukko varattu"; exit 0; }
  trap 'rmdir "$LUKKO" 2>/dev/null' EXIT
  LUKITTU=0
  ioreg -n Root -d1 -a 2>/dev/null | grep -A1 CGSSessionScreenIsLocked | grep -q '<true/>' && LUKITTU=1
  [ -f "$T/testi-lukko" ] && { LUKITTU=$(cat "$T/testi-lukko"); rm -f "$T/testi-lukko"; }
  TILATTU=0; [ -e "$T/tilaus" ] && { rm -f "$T/tilaus"; TILATTU=1; }
  IPAVAIN=0; [ -e "$T/ipa-vain" ] && { rm -f "$T/ipa-vain"; IPAVAIN=1; }
  vi() { [ "$TILATTU" = 0 ] && ilmoita; return 0; }
  if [ "$TILATTU" = 0 ]; then
    [ -f "$T/testi-tunnit" ] && { TESTI=1; H=$(cat "$T/testi-tunnit"); rm -f "$T/testi-tunnit"; }
    [ "$H" -ge 48 ] && { aloki "ok H=$H"; valmis 0; }
    [ "$LUKITTU" = 1 ] && { ilmoita "avaa Macin näyttö"; aloki "lukittu H=$H"; valmis 0; }
    LT=$(laitetila)
    if [ "$LT" != connected ] && [ "$LT" != "available (paired)" ]; then
      ilmoita; aloki "laite poissa H=$H"; valmis 0
    fi
    aloki "uusinta H=$H"
  fi
  echo kaynnissa > "$T/tila"
  loki aloitus
  if [ "$TILATTU" = 1 ] && [ "$LUKITTU" = 1 ] && [ -e "$T/uusi" ]; then
    rm -f "$T/uusi"; loki "virhe: Macin näyttö lukossa"; valmis 8
  fi
  cd "$T" || valmis 3
  A=$(date +%s)
  PP="$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"; SIVU=$T/vanhat-profiilit
  UUSINTA=0; VANHA=""; SIIRRA=0
  if [ -e "$T/uusi" ]; then
    rm -f "$T/uusi"; SIIRRA=1
    VANHA=$(lahin "$APP/embedded.mobileprovision" "$APP"/PlugIns/*.appex/embedded.mobileprovision)
  elif [ "$TILATTU" = 0 ]; then
    # Aiempi uusinta jäi asentamatta, jos PP:n jokainen Skoopit-profiili on asennettua uudempi: ei siirretä sivuun
    VANHA=$(lahin "$PROF" "$APP"/PlugIns/*.appex/embedded.mobileprovision); SIIRRA=1
    OMAT=(); for p in "$PP"/*.mobileprovision; do omapro "$p" && OMAT+=("$p"); done
    [ "${#OMAT[@]}" -gt 0 ] && E=$(lahin "${OMAT[@]}") && [ -n "$E" ] && [[ "$E" > "$VANHA" ]] && SIIRRA=0
  fi
  if [ "$SIIRRA" = 1 ]; then
    UUSINTA=1
    rm -rf "$SIVU"; mkdir -p "$SIVU"
    for p in "$PP"/*.mobileprovision; do omapro "$p" && mv "$p" "$SIVU/"; done
  fi
  palauta() { [ "$UUSINTA" = 1 ] && mv -n "$SIVU"/*.mobileprovision "$PP"/ 2>/dev/null; return 0; }
  xcodegen -q > "$T/build.log" 2>&1 || { palauta; vi; loki "virhe: xcodegen"; valmis 1; }
  if ! xcodebuild build -project Skoopit.xcodeproj -scheme Skoopit -destination "generic/platform=iOS" \
      -derivedDataPath build-laite -allowProvisioningUpdates -quiet >> "$T/build.log" 2>&1; then
    palauta; vi; loki "virhe: build"; valmis 1
  fi
  loki "build ok $(( $(date +%s) - A )) s"
  rm -rf "$T/Payload" "$T/Skoopit.ipa"
  mkdir -p "$T/Payload"
  cp -r "$APP" "$T/Payload/"
  (cd "$T" && zip -qr Skoopit.ipa Payload)
  rm -rf "$T/Payload"
  loki "ipa ok: $T/Skoopit.ipa"
  if [ "$IPAVAIN" = 1 ]; then
    cp "$APP/embedded.mobileprovision" "$T/asennettu.mobileprovision" 2>/dev/null || true
    loki "ipa valmis"
    valmis 0
  fi
  OK=0
  for n in 1 2 3; do
    if xcrun devicectl device install app --device "$LAITE" "$APP" >> "$T/build.log" 2>&1; then
      OK=1; break
    fi
    loki "install yritys $n epäonnistui"
    [ "$n" -lt 3 ] && sleep 15
  done
  [ "$OK" = 1 ] || { vi; loki "virhe: install"; valmis 2; }
  cp "$APP/embedded.mobileprovision" "$T/asennettu.mobileprovision"; rm -f "$T/ilmoitus.stamp"
  EXP=$(lahin "$APP/embedded.mobileprovision" "$APP"/PlugIns/*.appex/embedded.mobileprovision)
  if [ "$UUSINTA" = 1 ]; then
    if [ -z "$EXP" ] || [ -z "$VANHA" ] || ! [[ "$EXP" > "$VANHA" ]]; then
      vi; loki "virhe: profiili ei uusiutunut ($EXP)"; valmis 7
    fi
    loki "uusinta valmis profiili=$EXP"
  else
    loki "asennus valmis profiili=$EXP"
  fi
  valmis 0
fi

# Asiakas (ssh): odota, ettei ajastettu ajo ole käynnissä — kickstart ei käynnistä jo ajossa olevaa
i=0
while kaynnissa && [ $i -lt 100 ]; do sleep 3; i=$((i + 1)); done
rm -f "$T/tila"
if [ "$TILA" = "--ajastus" ]; then
  [ -n "${2:-}" ] && echo "$2" > "$T/testi-tunnit"
else
  [ "$TILA" = "--uusi" ] && touch "$T/uusi"
  [ "$TILA" = "--ipa" ] && touch "$T/ipa-vain"
  touch "$T/tilaus"
fi
launchctl kickstart "gui/$(id -u)/$LABEL" || { echo "virhe: kickstart"; exit 3; }
i=0
while [ $i -lt 180 ]; do
  [ -f "$T/tila" ] && grep -q '^valmis' "$T/tila" && break
  sleep 3; i=$((i + 1))
done
if [ -f "$T/tila" ] && grep -q '^valmis' "$T/tila"; then
  if [ "$TILA" = "--ajastus" ]; then tail -1 "$T/ajastus.loki"
  else awk '/ aloitus$/ {b=""} {b = b $0 "\n"} END {printf "%s", b}' "$LOKI" 2>/dev/null; fi
  exit "$(sed 's/.*exit=//' "$T/tila")"
fi
echo kesken; exit 4
