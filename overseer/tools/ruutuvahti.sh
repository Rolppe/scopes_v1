#!/bin/bash
# Ruutuvahti: tulostaa yhden rivin per siirto-scopes*-tmux-ruutu ja merkitsee jumit.
# Vain luku. Käyttö: bash scopes/overseer/tools/ruutuvahti.sh
# Rivi: AIKA RUUTU TILA (VIESTI)
# Tilat: KYSYY (valintakortti odottaa), LAHETTAMATTA (viesti syöttökentässä), TYOSSA, VAPAA, HALYTYS-RC (Remote Control katkesi)
nyt=$(date +%H:%M)
for s in $(tmux ls 2>/dev/null | cut -d: -f1 | grep '^siirto-scopes'); do
  p=$(tmux capture-pane -p -t "$s" 2>/dev/null | grep -v '^$' | grep -v '^─')
  loppu=$(echo "$p" | tail -6)
  tila=VAPAA
  if echo "$loppu" | grep -q 'Enter to select'; then
    tila=KYSYY
  elif echo "$loppu" | grep -qE 'esc to interrupt|esc to cancel|Running|Thinking|Cogitat|Working|Brewing'; then
    tila=TYOSSA
  elif echo "$loppu" | grep -qE '^(❯|>) .{20,}'; then
    tila=LAHETTAMATTA
  fi
  echo "$nyt $s $tila"
done
