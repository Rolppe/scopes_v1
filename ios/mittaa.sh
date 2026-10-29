#!/usr/bin/env bash
# Sivupalkin vedon ruutuajat simulaattorissa ilman XCUITestiä (SCOPES-LISTA-SUMEUS 13.10.2026): äppi käynnistyy
# SCOPES_MITTARI=itse -tilassa, vetää palkin itse auki ja kiinni kolmesti ja kirjoittaa Documents/mittaus.txt:n.
# Ajo Debug- ja Release-käännöksellä, kummassakin sumeus päällä ja pois. Tulos stdoutiin.
#   bash scopes/ios/mittaa.sh [simulaattori]   oletus "iPhone 15 Pro"
set -euo pipefail
tama=$(cd "$(dirname "$0")" && pwd)
# Sama lukko kuin testi.sh:lla ja asenna.sh:lla: $MAC_PROJ/scopes/scopes-ios ja simulaattori ovat yhteisiä.
exec 9>/tmp/scopes-ios-mac.lock
flock -w 900 9 || { echo "Macin scopes-ios varattu yli 15 min (lukko /tmp/scopes-ios-mac.lock)" >&2; exit 3; }
laite=${1:-iPhone 15 Pro}
avain=${SCOPES_AVAIN_TIEDOSTO:-$HOME/.config/scopes/avain}
ssh dev-host 'rm -rf ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Sources ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/UITests ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Resources ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Jaettu ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Widget && mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios'
tar -C "$tama" -cf - project.yml Sources Resources Jaettu Widget UITests | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios -xf -'
ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-ios && export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer && K=\$(cat) && /opt/homebrew/bin/xcodegen -q && xcrun simctl boot '$laite' 2>/dev/null || true
for konf in Debug Release; do
  xcodebuild build -project Skoopit.xcodeproj -scheme Skoopit -configuration \$konf -destination 'platform=iOS Simulator,name=$laite' -derivedDataPath build-mittaus -quiet >/dev/null 2>build-mittaus.loki || { tail -20 build-mittaus.loki; exit 1; }
  xcrun simctl install '$laite' build-mittaus/Build/Products/\$konf-iphonesimulator/Skoopit.app
  for sumeus in 1 0; do
    data=\$(xcrun simctl get_app_container '$laite' com.example.skoopit data)
    rm -f \"\$data/Documents/mittaus.txt\"
    xcrun simctl terminate '$laite' com.example.skoopit 2>/dev/null || true
    SIMCTL_CHILD_SCOPES_MITTARI=itse SIMCTL_CHILD_SCOPES_SUMEUS=\$sumeus SIMCTL_CHILD_SCOPES_AVAIN=\$K xcrun simctl launch '$laite' com.example.skoopit >/dev/null
    for i in \$(seq 60); do [ -s \"\$data/Documents/mittaus.txt\" ] && break; sleep 1; done
    echo \"== \$konf sumeus=\$sumeus\"
    cat \"\$data/Documents/mittaus.txt\" 2>/dev/null || echo 'ei tulosta 60 s:ssa'
    xcrun simctl terminate '$laite' com.example.skoopit 2>/dev/null || true
  done
done" < "$avain"
