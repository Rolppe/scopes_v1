#!/bin/bash
# Tiedostopohjainen viestinvaihto istuntojen välillä (agy ja Claude, kaikki skoopit).
# Viesti on aina tiedosto: $MAC_PROJ/agy/agy-viestit/<vastaanottaja-ruutu>/<aika>-<lähettäjä>.md
# Vastaanottajalle lähetetään tmuxiin vain lyhyt yksirivinen osoitus tiedostoon.
#
# Lähetys (Claude-istunto tai ihminen):
#   bash scopes/overseer/tools/viesti.sh <vastaanottaja-ruutu> <lähettäjä> <tiedosto>
#   echo "teksti" | bash scopes/overseer/tools/viesti.sh <vastaanottaja-ruutu> <lähettäjä> -
# Lähetys (agy, jolle tmux send-keys on kielletty): kirjoita viesti tiedostoon
#   $MAC_PROJ/agy/agy-viestit/ulos/<aika>-<lähettäjä>.md, jonka ensimmäinen rivi on `KOHDE: <vastaanottaja-ruutu>`.
#   `viesti.sh --toimita` siirtää ulos-kansion viestit vastaanottajille.
set -u
KOTI="${MAC_PROJ:-$HOME/Projects}/agy/agy-viestit"
mkdir -p "$KOTI/ulos" "$KOTI/luettu"

osoita() { # <ruutu> <polku>
  local ruutu="$1" polku="$2"
  tmux has-session -t "$ruutu" 2>/dev/null || { echo "EI RUUTUA: $ruutu" >&2; return 1; }
  tmux send-keys -t "$ruutu" "UUSI VIESTI TIEDOSTOSSA: $polku (lue se ja toimi sen mukaan)"
  sleep 1
  tmux send-keys -t "$ruutu" C-m
  echo "TOIMITETTU $ruutu $polku"
}

if [ "${1:-}" = "--toimita" ]; then
  for f in "$KOTI"/ulos/*.md; do
    [ -e "$f" ] || continue
    kohde=$(head -1 "$f" | sed -n 's/^KOHDE: *//p')
    [ -n "$kohde" ] || { echo "EI KOHDETTA: $f" >&2; mv "$f" "$KOTI/luettu/EI-KOHDETTA-$(basename "$f")"; continue; }
    mkdir -p "$KOTI/$kohde"
    uusi="$KOTI/$kohde/$(basename "$f")"
    mv "$f" "$uusi"
    osoita "$kohde" "$uusi"
  done
  exit 0
fi

[ $# -eq 3 ] || { echo "käyttö: viesti.sh <vastaanottaja-ruutu> <lähettäjä> <tiedosto|->" >&2; exit 2; }
ruutu="$1"; lahettaja="$2"; lahde="$3"
mkdir -p "$KOTI/$ruutu"
polku="$KOTI/$ruutu/$(date +%Y%m%d-%H%M%S)-$lahettaja.md"
if [ "$lahde" = "-" ]; then cat > "$polku"; else cp "$lahde" "$polku"; fi
osoita "$ruutu" "$polku"
