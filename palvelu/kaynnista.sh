#!/usr/bin/env bash
# Käynnistää skooppien lukurajapinnan, jos se ei jo vastaa (DEMO-SCOPES-IOS-LUKU 13.10.2026).
# Cron ajaa tämän muutaman minuutin välein, joten palvelu palaa käynnistyksen ja kaatumisen jälkeen.
# Kuuntelee kaikissa osoitteissa: puhelin tulee kotiverkosta tai WireGuardin läpi, ja jokainen
# skooppipyyntö vaatii avaimen (palvelin.mjs). Avain luodaan, jos sitä ei ole.
set -u
[ -x "$HOME/.local/opt/node-v22.23.3-linux-arm64/bin/node" ] && NODE=${NODE:-$HOME/.local/opt/node-v22.23.3-linux-arm64/bin/node}
export PATH="$HOME/.local/bin:${NODE:+$(dirname "$NODE"):}$PATH"
tama=$(cd "$(dirname "$0")" && pwd)
portti=${SCOPES_PORTTI:-8787}
avain=${SCOPES_AVAIN_TIEDOSTO:-$HOME/.config/scopes/avain}
loki=${SCOPES_LOKI:-$HOME/.local/state/scopes-palvelu.loki}

if curl -fsS -m 3 "http://127.0.0.1:$portti/api/terveys" >/dev/null 2>&1; then exit 0; fi

if [ ! -s "$avain" ]; then
  mkdir -p "$(dirname "$avain")" && chmod 700 "$(dirname "$avain")"
  (umask 077 && head -c 48 /dev/urandom | base64 | tr -d '=+/\n' > "$avain")
fi
mkdir -p "$(dirname "$loki")"
# Localregisterin vienti LR → git scopes-perheelle (LOCALREGISTER-VIENTI, käyttäjä 14.10.2026: live-rekisteri);
# tyhjä SCOPES_LR_VIENTI= kytkee pois (koeinstanssi, jonka repojuuri on tuotannon).
SCOPES_LR_VIENTI=${SCOPES_LR_VIENTI-scopes/} SCOPES_OSOITE=${SCOPES_OSOITE:-0.0.0.0} SCOPES_PORTTI=$portti SCOPES_AVAIN_TIEDOSTO=$avain \
  nohup "${NODE:-node}" "$tama/palvelin.mjs" >>"$loki" 2>&1 &
# Purun mallilistan esihaku: ensimmäinen /api/purkajat odottaa `agy models` -ajoa (7,7 s 15.10.2026), myöhemmät saavat
# välimuistin heti (purkajat.mjs). Tehdään tässä, ettei puhelin osu siihen uudelleenkäynnistyksen jälkeen.
(for _ in $(seq 1 30); do
  curl -fsS -m 2 "http://127.0.0.1:$portti/api/terveys" >/dev/null 2>&1 && break; sleep 1
done
curl -fsS -m 40 -o /dev/null -H "Authorization: Bearer $(cat "$avain")" "http://127.0.0.1:$portti/api/purkajat") >/dev/null 2>&1 &
