#!/bin/bash
# scopes vahtimestari: Macin scopes2-tmux-istuntojen seuranta Monitorille (SCOPES2-VALVONTA-MAC, 20.10.2026).
# Käyttö: Monitor { command: "bash scopes/vahtimestari/seuraa-istunnot.sh", timeout_ms: 1800000 }, uusi joka 30 min.
# Seuraa Macin tmux-istuntoja: tulostaa rivin, kun istunnon tila muuttuu kysyy/vapaa/kuollut.
# vapaa ilmoitetaan vasta, kun se on kestänyt 90 s (vuorojen välit eivät ole tapahtumia).
# Tila tiedostoina (macOS:n bash 3.2: ei assosiatiivisia taulukoita).
# --kerta: yksi kierros omalla väliaikaisella tilalla (scopes overseerin aloitus- ja seurantatarkistus): jokaisen
# ruudun tila UUSI-rivinä ja käyttörajaan jääneet RAJA-NOLLAUTUI-rivinä; ei koske Monitorin tilaan.
D=$HOME/.local/state/scopes-vahtimestari-seuraa; [ "$1" = --kerta ] && D=$(mktemp -d); mkdir -p "$D"
# Istunnon konteksti tuhansina tokeneina: tmux-ruudun claude-prosessi → ~/.claude/sessions/<pid>.json → konteksti-nyt.mjs.
konteksti() {
  local pid cpid sid
  pid=$(tmux display -p -t "$1" '#{pane_pid}' 2>/dev/null) || return
  cpid=$(pgrep -P "$pid" claude | head -1); [ -z "$cpid" ] && cpid=$pid
  sid=$(jq -r .sessionId ~/.claude/sessions/$cpid.json 2>/dev/null) || return
  (cd "${MAC_PROJ:-$HOME/Projects}/claude/sessions-repo" && node claude/siirto/tools/konteksti-nyt.mjs "$sid" 2>/dev/null) | grep -oE 'KONTEKSTI: [0-9]+' | grep -oE '[0-9]+$'
}
# Käyttöraja (käyttäjä 20.10.2026): ≥95 % ei uusia käynnistyksiä (tapahtuma valvojalle), ≥98 % stop-komento
# kaikkiin ruutuihin, ≥99 % claude-prosessien kill. Lukema 5 h rajasta kayttoraja-vahti.py:n välimuistin kautta
# (hakee enintään 60 s välein). Kukin taso laukeaa kerran per nollautumisjakso (tiedosto $D/kaytto.taso).
VAHTI="${MAC_PROJ:-$HOME/Projects}/claude/sessions-repo/Infra/hooks"
kaytto() {
  (cd "$VAHTI" && python3 -I - 2>/dev/null <<'PY'
import importlib.util as u
s = u.spec_from_file_location("v", "kayttoraja-vahti.py"); m = u.module_from_spec(s); s.loader.exec_module(m)
t = m.kaytto_nyt()
print(f"{t['kaytto']} {t.get('nollautuu', '')[:16]}" if t else "")
PY
)
}
kayttoraja() {
  local r k jakso taso
  r=$(kaytto); [ -z "$r" ] && return
  k=${r%% *}; k=${k%.*}; jakso=${r#* }
  taso=$(cat "$D/kaytto.taso" 2>/dev/null); [ "${taso#* }" != "$jakso" ] && taso="0 $jakso"
  # Portaat pois (käyttäjä 21.10.2026 "poista käyttöraja pysäytys"); takaisin: KAYTTORAJA_PORTAAT=1 ennen skriptin käynnistystä.
  if [ -z "${KAYTTORAJA_PORTAAT:-}" ]; then :
  elif [ "$k" -ge 99 ] && [ "${taso%% *}" -lt 99 ]; then
    for t in $(tmux ls -F '#S' 2>/dev/null); do pid=$(tmux display -p -t "$t" '#{pane_pid}'); pkill -TERM -P "$pid" claude 2>/dev/null; ps -o comm= -p "$pid" | grep -q claude && kill -TERM "$pid" 2>/dev/null; done
    echo "$(date +%H:%M) KAYTTO $k % — KILL: claude-prosessit tapettu kaikista tmux-ruuduista"; echo "99 $jakso" > "$D/kaytto.taso"
  elif [ "$k" -ge 98 ] && [ "${taso%% *}" -lt 98 ]; then
    for t in $(tmux ls -F '#S' 2>/dev/null); do
      tmux send-keys -t "$t" Escape; sleep 1
      tmux send-keys -t "$t" -l "Käyttöraja $k %: pysäytä kaikki ajot ja taustatyöt TaskStopilla, älä aja mitään, älä viestitä. Odota käyttäjää."; tmux send-keys -t "$t" Enter
    done
    echo "$(date +%H:%M) KAYTTO $k % — STOP lähetetty kaikkiin ruutuihin"; echo "98 $jakso" > "$D/kaytto.taso"
  elif [ "$k" -ge 95 ] && [ "${taso%% *}" -lt 95 ]; then
    echo "$(date +%H:%M) KAYTTO $k % — EI UUSIA: älä käynnistä istuntoja, paketteja, portteja äläkä automaattisiirtoa"; echo "95 $jakso" > "$D/kaytto.taso"
  fi
  KNYT=$k
}
# V-OVS-1: ruutu pysähtyi käyttörajaan ("hit your session limit") käytön ollessa ≥95 % → merkki $D/<ruutu>.raja;
# kun käyttö on taas alle 95 %, RAJA-NOLLAUTUI kerran (istunto ei jatka itse, sa-tick ei ole työtä).
# $3 = uusi: ruutu nähdään ensi kertaa (valvoja käynnistyi rajan jälkeen) → rajateksti merkitsee käytöstä riippumatta.
raja() {
  [ -z "$KNYT" ] && return
  if printf '%s' "$2" | grep -q 'hit your session limit' && { [ "$KNYT" -ge 95 ] || [ "$3" = uusi ]; }; then : > "$D/$1.raja"
  fi
  if [ -e "$D/$1.raja" ] && [ "$KNYT" -lt 95 ]; then
    echo "$(date +%H:%M) RAJA-NOLLAUTUI $1 (käyttö $KNYT %) — JUMI overseerille: istunto pysähtyi käyttörajaan eikä jatka itse"; rm -f "$D/$1.raja"
  fi
}
while true; do
  nyt=$(date +%s); KNYT=
  kayttoraja
  nimet=$(tmux ls -F '#S' 2>/dev/null)
  for f in "$D"/*.tila; do
    [ -e "$f" ] || continue
    t=$(basename "$f" .tila)
    printf '%s\n' "$nimet" | grep -qx "$t" || { echo "$(date +%H:%M) KUOLLUT $t"; rm -f "$D/$t".*; }
  done
  for t in $nimet; do
    p=$(tmux capture-pane -p -t "$t" 2>/dev/null) || continue
    case " $NAHDYT " in *" $t "*) raja "$t" "$p" ;; *) raja "$t" "$p" uusi; NAHDYT="$NAHDYT $t" ;; esac
    if printf '%s' "$p" | grep -qE 'esc to interrupt|esc to cancel'; then s=tyossa
    elif printf '%s' "$p" | grep -qE 'Enter to select|Enter to confirm|Esc to cancel|enter Confirm|Navigate ·'; then s=kysyy
    else s=vapaa; fi
    ed=$(cat "$D/$t.tila" 2>/dev/null); il=$(cat "$D/$t.ilm" 2>/dev/null)
    [ -z "$ed" ] && echo "$(date +%H:%M) UUSI $t ($s)"
    if [ "$s" = vapaa ]; then
      [ "$ed" != vapaa ] && echo "$nyt" > "$D/$t.alku"
      alku=$(cat "$D/$t.alku" 2>/dev/null || echo "$nyt")
      if [ $((nyt - alku)) -ge 90 ] && [ "$il" != vapaa ]; then
        k=$(konteksti "$t")
        tausta=$(printf '%s' "$p" | grep -v '^[[:space:]]*$' | tail -1 | grep -oE '[0-9]+ shells?' | head -1)
        merkki=""; [ "${k:-0}" -ge 100 ] && [ -z "$tausta" ] && merkki=" — SIIRRÄ (≥100 k, ei taustaajoa)"
        echo "$(date +%H:%M) VAPAA $t ${k:-?} k${tausta:+ ($tausta)}$merkki"; echo vapaa > "$D/$t.ilm"
      fi
    elif [ "$s" = kysyy ] && [ "$il" != kysyy ]; then
      echo "$(date +%H:%M) KYSYY $t"; echo kysyy > "$D/$t.ilm"
    elif [ "$s" = tyossa ]; then
      : > "$D/$t.ilm"
    fi
    echo "$s" > "$D/$t.tila"
  done
  [ "$1" = --kerta ] && { echo "KAYTTO ${KNYT:-?} %"; rm -rf "$D"; exit 0; }
  sleep 20
done
