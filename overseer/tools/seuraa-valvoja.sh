#!/bin/bash
# scopes overseer: Opus-istunnon seuranta Haiku-valvojalle (käyttäjä 20.10.2026: Opus huolehtii Haiku-skoopista).
# Käyttö: Monitor { command: "bash scopes/overseer/tools/seuraa-valvoja.sh", timeout_ms: 1800000 }, uusi joka 30 min.
# Tapahtumat: KYSYY (lupa- tai valintakysymys), KUOLLUT (ei tmux-istuntoa tai claude-prosessia),
# EI-MONITORIA (Haiku vapaana yli 5 min ilman monitoria, eli valvonta ei pyöri). Kukin kerran per tila.
D=$HOME/.local/state/scopes-overseer-seuraa-valvoja; mkdir -p "$D"
haiku() { tmux ls -F '#S' 2>/dev/null | grep -E '^siirto-scopes-vahtimestari-[0-9]+$' | tail -1; }
ilmoita() { [ "$(cat "$D/viimeisin" 2>/dev/null)" = "$1" ] && return; echo "$(date +%H:%M) $1"; echo "$1" > "$D/viimeisin"; }
while true; do
  t=$(haiku)
  if [ -z "$t" ]; then ilmoita "KUOLLUT: ei siirto-scopes-vahtimestari-tmux-istuntoa"; sleep 30; continue; fi
  pid=$(tmux display -p -t "$t" '#{pane_pid}')
  if ! ps -o comm= -p "$pid" | grep -q claude && ! pgrep -P "$pid" claude >/dev/null; then ilmoita "KUOLLUT: $t (ei claude-prosessia)"; sleep 30; continue; fi
  p=$(tmux capture-pane -p -t "$t")
  l=$(printf '%s' "$p" | grep -v '^[[:space:]]*$' | tail -1)
  if printf '%s' "$p" | grep -qE 'Enter to select|Enter to confirm|Esc to cancel'; then
    ilmoita "KYSYY: $t"; : > "$D/vapaa"
  elif printf '%s' "$p" | grep -q 'esc to interrupt' || printf '%s' "$l" | grep -qE '[0-9]+ monitors?'; then
    ilmoita "OK: $t"; : > "$D/vapaa"
  else
    [ -s "$D/vapaa" ] || date +%s > "$D/vapaa"
    [ $(( $(date +%s) - $(cat "$D/vapaa") )) -ge 300 ] && ilmoita "EI-MONITORIA: $t vapaana yli 5 min ilman monitoria"
  fi
  # Kasaantuma: muu ruutu kysyy yli 5 min, vaikka valvoja on elossa (peruste toiselle valvojalle).
  for r in $(tmux ls -F '#S' 2>/dev/null | grep -v "^$t$"); do
    if tmux capture-pane -p -t "$r" 2>/dev/null | grep -qE 'Enter to select|Enter to confirm'; then
      [ -s "$D/k.$r" ] || date +%s > "$D/k.$r"
      [ $(( $(date +%s) - $(cat "$D/k.$r") )) -ge 300 ] && [ ! -e "$D/k.$r.ilm" ] && { echo "$(date +%H:%M) KASAANTUMA: $r kysynyt yli 5 min"; touch "$D/k.$r.ilm"; }
    else rm -f "$D/k.$r" "$D/k.$r.ilm"; fi
  done
  sleep 30
done
