#!/usr/bin/env bash
# Käynnistää skooppien lukurajapinnan, jos se ei jo vastaa (DEMO-SCOPES-IOS-LUKU 13.10.2026).
# Cron ajaa tämän muutaman minuutin välein, joten palvelu palaa käynnistyksen ja kaatumisen jälkeen.
# Kuuntelee kaikissa osoitteissa: puhelin tulee kotiverkosta tai WireGuardin läpi, ja jokainen
# skooppipyyntö vaatii avaimen (palvelin.mjs). Avain luodaan, jos sitä ei ole.
set -u
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
SCOPES_OSOITE=${SCOPES_OSOITE:-0.0.0.0} SCOPES_PORTTI=$portti SCOPES_AVAIN_TIEDOSTO=$avain \
  nohup "${NODE:-node}" "$tama/palvelin.mjs" >>"$loki" 2>&1 &
