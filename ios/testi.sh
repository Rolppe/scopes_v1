#!/usr/bin/env bash
# Rakentaa äpin ja ajaa UI-testit Macin iOS-simulaattorissa oikeaa palvelua vastaan (DEMO-SCOPES-IOS-LUKU).
# Ajetaan palvelimelta: lähteet tar-putkella Macin $MAC_PROJ/scopes/scopes-ios-hakemistoon, avain stdinissä (ei komentorivillä).
#   bash scopes/ios/testi.sh [--head] [simulaattori]   oletus "iPhone 15 Pro"; --head testaa committoidun HEADin työpuun sijaan (V-338)
# Kirjoittava pura-koe (avaa oikean istunnon) vain erikseen: SCOPES_KOE_PURA="<koeskooppi>" bash …/testi.sh
# Muu palvelu kuin oletus (esim. uuden koodin koeinstanssi): SCOPES_OSOITE="http://192.0.2.11:8788" bash …/testi.sh
set -euo pipefail
tama=$(cd "$(dirname "$0")" && pwd)
LAHDE_HEAD=0; [ "${1:-}" = --head ] && { LAHDE_HEAD=1; shift; }
. "$tama/lahde.sh"
# Macin $MAC_PROJ/scopes/scopes-ios ja simulaattori ovat yhteisiä: rinnakkaiset ajot (eri skoopit) kaatoivat toisensa
# ("Test crashed with signal kill", 13.10.2026), joten testi ja asennus vuorottelevat saman lukon takana.
exec 9>/tmp/scopes-ios-mac.lock
flock -w 900 9 || { echo "Macin scopes-ios varattu yli 15 min (lukko /tmp/scopes-ios-mac.lock)" >&2; exit 3; }
laite=${1:-iPhone 15 Pro}
avain=${SCOPES_AVAIN_TIEDOSTO:-$HOME/.config/scopes/avain}
koe=""
if [ -n "${SCOPES_OSOITE:-}" ]; then
  [[ $SCOPES_OSOITE =~ ^https?://[A-Za-z0-9.:-]+$ ]] || { echo "SCOPES_OSOITE: vain http(s)://isäntä:portti" >&2; exit 2; }
  koe="TEST_RUNNER_SCOPES_OSOITE='$SCOPES_OSOITE' "
fi
if [ -n "${SCOPES_KOE_PURA:-}" ]; then
  [[ $SCOPES_KOE_PURA =~ ^[a-z0-9\ -]+$ ]] || { echo "SCOPES_KOE_PURA: vain [a-z0-9 -]" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_PURA='$SCOPES_KOE_PURA' "
  vain="-only-testing:SkoopitUITests/SkoopitUITests/testPuraAvaaIstunnon"
fi
# Muistikytkimen koe (CHAT-KYTKIN-SIMULAATTORI): SCOPES_KOE_KYTKIN="<skooppi>" [_VIESTI="…"] [_ODOTA=0|1] [_ASETA=0|1]
if [ -n "${SCOPES_KOE_KYTKIN:-}" ]; then
  [[ $SCOPES_KOE_KYTKIN =~ ^[a-z0-9\ -]+$ ]] || { echo "SCOPES_KOE_KYTKIN: vain [a-z0-9 -]" >&2; exit 2; }
  [[ ${SCOPES_KOE_KYTKIN_VIESTI:-} =~ ^[A-Za-z0-9\ .:-]*$ ]] || { echo "SCOPES_KOE_KYTKIN_VIESTI: vain [A-Za-z0-9 .:-]" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_KYTKIN='$SCOPES_KOE_KYTKIN' "
  [ -n "${SCOPES_KOE_KYTKIN_VIESTI:-}" ] && koe+="TEST_RUNNER_SCOPES_KOE_KYTKIN_VIESTI='$SCOPES_KOE_KYTKIN_VIESTI' "
  for m in ODOTA ASETA; do
    v="SCOPES_KOE_KYTKIN_$m"
    [ -z "${!v:-}" ] && continue
    [[ ${!v} =~ ^[01]$ ]] || { echo "$v: 0 tai 1" >&2; exit 2; }
    koe+="TEST_RUNNER_$v='${!v}' "
  done
  vain="-only-testing:SkoopitUITests/SkoopitUITests/testMuistiKytkin"
fi
# Auki oleva skooppi listatestiin (oletus listan ylin eli auki oleva skooppi, V-331): SCOPES_KOE_AUKI="<skooppi>"
if [ -n "${SCOPES_KOE_AUKI:-}" ]; then
  [[ $SCOPES_KOE_AUKI =~ ^[a-z0-9\ -]+$ ]] || { echo "SCOPES_KOE_AUKI: vain [a-z0-9 -]" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_AUKI='$SCOPES_KOE_AUKI' "
fi
# Monivalintakortin skooppi (auki oleva istunto, jonka viesteissä on AskUserQuestion): SCOPES_KOE_KYSYMYS="<skooppi>"
if [ -n "${SCOPES_KOE_KYSYMYS:-}" ]; then
  [[ $SCOPES_KOE_KYSYMYS =~ ^[a-z0-9\ -]+$ ]] || { echo "SCOPES_KOE_KYSYMYS: vain [a-z0-9 -]" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_KYSYMYS='$SCOPES_KOE_KYSYMYS' "
  [[ ${SCOPES_KOE_KORTTI_ODOTA:-5} =~ ^[0-9]+$ ]] || { echo "SCOPES_KOE_KORTTI_ODOTA: sekunteja" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_KORTTI_ODOTA='${SCOPES_KOE_KORTTI_ODOTA:-5}' "
fi
# Mallinapin koe (MALLINAPPI-TODENNUS): SCOPES_KOE_MALLI="<skooppi>" [_VAIHDA="<mallin id>"] [_EFFORT="low|…|max"]; vaihto kirjoittaa oikeaan istuntoon
if [ -n "${SCOPES_KOE_MALLI:-}" ]; then
  [[ $SCOPES_KOE_MALLI =~ ^[a-z0-9\ -]+$ ]] || { echo "SCOPES_KOE_MALLI: vain [a-z0-9 -]" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_MALLI='$SCOPES_KOE_MALLI' "
  for m in VAIHDA EFFORT; do
    v="SCOPES_KOE_MALLI_$m"
    [[ ${!v:-} =~ ^[a-z0-9-]*$ ]] || { echo "$v: vain [a-z0-9-]" >&2; exit 2; }
    [ -n "${!v:-}" ] && koe+="TEST_RUNNER_$v='${!v}' "
  done
fi
# Rekisterisynkan kirjoittava ristiriitakoe (LrUITests) koeinstanssia vastaan: SCOPES_KOE_LR=1
if [ "${SCOPES_KOE_LR:-}" = 1 ]; then koe+="TEST_RUNNER_SCOPES_KOE_LR='1' "; fi
# Rivin lisäys siivoavana (testLrRivinLisays poistaa koerivin lopuksi; sallii tuotannon): SCOPES_KOE_LR_POISTA=1
if [ "${SCOPES_KOE_LR_POISTA:-}" = 1 ]; then koe+="TEST_RUNNER_SCOPES_KOE_LR_POISTA='1' "; fi
# Nimetyn rivin ristiriidan ratkaisu lähteen uusimmalla versiolla (testLrRistiriitaLahdeVoittaa): SCOPES_KOE_LR_ID="<id>"
if [ -n "${SCOPES_KOE_LR_ID:-}" ]; then
  [[ $SCOPES_KOE_LR_ID =~ ^[a-z0-9-]+$ ]] || { echo "SCOPES_KOE_LR_ID: vain [a-z0-9-]" >&2; exit 2; }
  koe+="TEST_RUNNER_SCOPES_KOE_LR_ID='$SCOPES_KOE_LR_ID' "
fi
# palvelimen nappien kirjoittava koe (testLinuxServerKuiva) vain kuivaa koepalvelua vastaan
# (SCOPES_LINUX_KUIVA=1 … kaynnista.sh, SCOPES-LINUX-NAPIT): SCOPES_KOE_LINUX=1
if [ "${SCOPES_KOE_LINUX:-}" = 1 ]; then koe+="TEST_RUNNER_SCOPES_KOE_LINUX='1' "; fi
# Vain nimetyt testit: SCOPES_VAIN="testA testB" bash …/testi.sh; muu luokka muodossa Luokka/testi (StopUITests/testChatStop)
if [ -n "${SCOPES_VAIN:-}" ]; then
  [[ $SCOPES_VAIN =~ ^[A-Za-z0-9/\ ]+$ ]] || { echo "SCOPES_VAIN: vain testien nimiä" >&2; exit 2; }
  vain=""
  for t in $SCOPES_VAIN; do [[ $t == */* ]] || t="SkoopitUITests/$t"; vain+="-only-testing:SkoopitUITests/$t "; done
fi
# Release-käännös (optimoitu, kuten mittausvertailu SCOPES-LISTA-SUMEUS): SCOPES_RELEASE=1 bash …/testi.sh
konf=""
[ "${SCOPES_RELEASE:-}" = 1 ] && konf="-configuration Release"
# Oma tulospaketti: lukko vapautuu ajon lopussa, ja seuraava ajo poisti yhteisen tulos.xcresultin ennen kuin liitteet
# ehdittiin lukea (13.10.2026). SCOPES_TULOS="nimi" → $MAC_PROJ/scopes/scopes-ios/nimi.xcresult
tulos=${SCOPES_TULOS:-tulos}
[[ $tulos =~ ^[a-z0-9-]+$ ]] || { echo "SCOPES_TULOS: vain [a-z0-9-]" >&2; exit 2; }
ssh dev-host 'rm -rf ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Sources ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/UITests ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Resources ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Jaettu ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Widget ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/Keyboard && mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios'
lahde_kerro project.yml Sources Resources Jaettu Widget Keyboard UITests tunneli
lahde_tar . project.yml Sources Resources Jaettu Widget Keyboard UITests | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios -xf -'
# Äpin WireGuard-tunneli (SCOPES-ETAYHTEYS): Go-lähteet Maciin, kehys käännetään vain lähteen muuttuessa.
ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli && find ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli -maxdepth 1 -name "*.go" -delete'
lahde_tar . --exclude=Tunneli.xcframework --exclude=.lahde --exclude=rakenna.log tunneli | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios -xf -'
ssh dev-host '${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli/rakenna.sh > ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli/rakenna.log 2>&1' || { ssh dev-host 'tail -20 ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-ios/tunneli/rakenna.log' >&2; exit 1; }
ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-ios && /opt/homebrew/bin/xcodegen -q && K=\$(cat) && export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer TEST_RUNNER_SCOPES_AVAIN=\$K ${koe:+&& export $koe}&& rm -rf $tulos.xcresult && xcodebuild test -project Skoopit.xcodeproj -scheme Skoopit -destination 'platform=iOS Simulator,name=$laite' -derivedDataPath build $konf -resultBundlePath $tulos.xcresult ${vain:-} -quiet" < "$avain"
