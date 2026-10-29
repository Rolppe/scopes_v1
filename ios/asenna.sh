#!/usr/bin/env bash
# Asentaa Skoopit-äpin käyttäjän iPhoneen Macin kautta (DEMO-SCOPES-PUHELIN). Ajetaan palvelimelta:
# lähteet tar-putkella Macin $MAC_PROJ/scopes/scopes-ios:iin, käännös ja asennus LaunchAgentissa com.example.skoopit-asennus
# (GUI-istunto; ssh ei pääse avainnippuun). Agentti herää myös itse 30 min välein ja uusii allekirjoituksen,
# kun voimassaoloa on alle 48 h (DEMO-SCOPES-UUSINTA). --uusi pakottaa uusinnan heti. --head paketoi committoidun HEADin
# työpuun sijaan (V-338), ja sen voi yhdistää muihin lippuihin.
#   bash scopes/ios/asenna.sh [--head] [--uusi|--ipa]
set -euo pipefail
tama=$(cd "$(dirname "$0")" && pwd)
LAHDE_HEAD=0; tila=""
for a in "$@"; do case $a in --head) LAHDE_HEAD=1 ;; *) tila=$a ;; esac; done
. "$tama/lahde.sh"
# Macin $MAC_PROJ/scopes/scopes-ios ja simulaattori ovat yhteisiä: rinnakkaiset ajot (eri skoopit) kaatoivat toisensa
# ("Test crashed with signal kill", 13.10.2026), joten testi ja asennus vuorottelevat saman lukon takana.
exec 9>/tmp/scopes-ios-mac.lock
flock -w 900 9 || { echo "Macin scopes-ios varattu yli 15 min (lukko /tmp/scopes-ios-mac.lock)" >&2; exit 3; }
plist=com.example.skoopit-asennus.plist
ssh dev-host 'rm -rf ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Sources ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/UITests ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Resources ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Jaettu ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Widget ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Keyboard && mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios'
lahde_kerro project.yml Sources Resources Jaettu Widget Keyboard UITests tunneli mac
lahde_tar . project.yml Sources Resources Jaettu Widget Keyboard UITests | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios -xf -'
# Äpin WireGuard-tunneli (SCOPES-ETAYHTEYS): Go-lähteet Maciin, kehys käännetään vain lähteen muuttuessa.
ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli && find ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli -maxdepth 1 -name "*.go" -delete'
lahde_tar . --exclude=Tunneli.xcframework --exclude=.lahde --exclude=rakenna.log tunneli | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios -xf -'
ssh dev-host '${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli/rakenna.sh > ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli/rakenna.log 2>&1' || { ssh dev-host 'tail -20 ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli/rakenna.log' >&2; exit 1; }
lahde_tar mac skoopit-asennus.sh "$plist" | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios -xf -'
# Pohja (@MAC_PROJ@) generoidaan Macilla sen omalla MAC_PROJ-juurella; verrataan ja asennetaan generoitu tiedosto (PARAMETRISOINTI-2).
ssh dev-host "chmod 755 \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-ios/skoopit-asennus.sh && g=\$(mktemp) && trap 'rm -f \$g' EXIT && sed \"s|@MAC_PROJ@|\${MAC_PROJ:-\$HOME/Projects}|g\" \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-ios/$plist > \$g && if ! cmp -s \$g ~/Library/LaunchAgents/$plist; then launchctl bootout gui/\$(id -u)/${plist%.plist} 2>/dev/null; cp \$g ~/Library/LaunchAgents/$plist && launchctl bootstrap gui/\$(id -u) ~/Library/LaunchAgents/$plist; fi"
ssh dev-host "\${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-ios/skoopit-asennus.sh $tila"
if [ "$tila" = "--ipa" ]; then
  ssh dev-host 'cat "${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Skoopit.ipa"' > "$tama/Skoopit.ipa"
  echo "IPA haettu palvelimelle: $tama/Skoopit.ipa"
fi
