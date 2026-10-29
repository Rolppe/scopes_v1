#!/bin/bash
# Vahdin seuranta (VALVOJA.md luvut 4 ja 8). Ajetaan Monitorilla: `bash scopes/kordinaattori/vahti/seuranta.sh`,
# timeout 30 min ja uudelleenviritys. Tulostaa rivin, kun
#   - ruudun tila vaihtuu (VAPAA / TYO / KYSYMYS)
#   - istunto katoaa: pakkauksen jälkeinen sulku erotetaan kaatumisesta
#   - koordinaattorin vahti.sh puuttuu yli 3 min
#   - mikään ruutu ei ole muuttunut yli 10 min
#   - tulee uusi commit, oom_kill kasvaa tai muisti loppuu
#   - vahdin oma konteksti on vähintään 200 k (KONTEKSTI-RAJA, 10 min välein, kunnes /clear vaihtaa istunnon).
# Toimii sekä palvelimella (Linux) että Macilla (bash 3.2: ei assosiatiivisia taulukoita, tila tiedostoissa).
# Juuri on repo, jossa skripti on (palvelin ~/palvelin, Mac $MAC_PROJ/claude/sessions-repo; 20.10.2026 siirto Macille).
JUURI=$(cd "$(dirname "$0")/../../.." && pwd)
TILA=$HOME/.local/state/kord-vahti
KAAPPAUS=$TILA/ruudut
RAJA=${VAHTI_KONTEKSTIRAJA:-200000}
cd "$JUURI" || exit 1
mkdir -p "$KAAPPAUS"
# Yksi seuranta kerrallaan: /clear ei välttämättä lopeta edellisen istunnon Monitoria.
vanha=$(cat "$TILA/seuranta.pid" 2>/dev/null)
if [ -n "$vanha" ] && [ "$vanha" != $$ ] && ps -p "$vanha" -o args= 2>/dev/null | grep -q 'vahti/seuranta.sh'; then
  kill "$vanha" 2>/dev/null
fi
echo $$ > "$TILA/seuranta.pid"
# Ruutujen ja porttilokien tila: yksi tiedosto per avain
RTILA=$TILA/seuranta-tila
rm -rf "$RTILA"; mkdir -p "$RTILA/ruutu" "$RTILA/portti"

# Vahdin oma Claude-prosessi: ~/.claude/sessions/<pid>.json, jonka tmux on vahdin ruutu. sessionId vaihtuu /clearissa.
vahdin_istunto() {
  python3 - <<'PY'
import glob, json, os
for f in glob.glob(os.path.expanduser('~/.claude/sessions/*.json')):
    try:
        j = json.load(open(f))
    except Exception:
        continue
    if (j.get('tmux') or '').startswith('siirto-scopes-kordinaattori-vahti-'):
        print(j.get('sessionId', ''))
        break
PY
}
oom_kill() { [ -r /proc/vmstat ] && awk '/^oom_kill /{print $2}' /proc/vmstat; }
# Vapaa muisti: Linux avail MiB (raja 1000), Mac kern.memorystatus_level % (raja 10)
muisti_matala() {
  if [ -r /proc/meminfo ]; then av=$(free -m | awk '/^Mem:/{print $7}'); mt="avail $av MiB"; [ "$av" -lt 1000 ]
  else av=$(sysctl -n kern.memorystatus_level); mt="vapaata $av %"; [ "$av" -lt 10 ]; fi
}
porttirivit() { grep -cE '^PORTTI (VIHREÄ|PUNAINEN)' "$1"; }

# Irralliset (setsid) porttiajot: lähtötilaksi lokien nykyinen viimeinen PORTTI-rivi (V-VAHTI-2). Macilla istunnot
# ajavat portteja myös scratchpadiin (esim. .../scratchpad/t49-gate-2/gate.log), joten nekin seurataan.
porttilokit() { ls "$HOME"/.local/state/scopes2-*-lokit/*.log /private/tmp/claude-"$(id -u)"/*/*/scratchpad/*/*.log 2>/dev/null; }
avain() { echo "$1" | tr '/' '_'; }
for l in $(porttilokit); do
  [ -f "$l" ] && porttirivit "$l" > "$RTILA/portti/$(avain "$l")"
done
oom0=$(oom_kill)
head0=$(git rev-parse HEAD)
muuttui=$(date +%s); kvahti_nahty=$(date +%s); kvahti_halytetty=; pysahtyi=; matala=; raja_ilmoitettu=0
while true; do
  nyt=$(date +%s); klo=$(date +%H.%M)
  elossa=" "
  for s in $(tmux ls -F '#S' 2>/dev/null | grep -E 'kordinaattori-[0-9]|scopes2-|toteutussuunnitelma'); do
    elossa="$elossa$s "
    tmux capture-pane -p -S -200 -t "$s" > "$KAAPPAUS/$s.txt" 2>/dev/null
    p=$(tail -40 "$KAAPPAUS/$s.txt")
    if echo "$p" | grep -q 'Enter to select'; then t=KYSYMYS
    elif echo "$p" | grep -qE 'esc to interrupt|Waiting for [0-9]+ background|◯ toteuttaja|[0-9]+ shells? still running|· [0-9]+ shells? ·'; then t=TYO
    else t=VAPAA; fi
    ed=$(cat "$RTILA/ruutu/$s.tila" 2>/dev/null)
    if [ "$ed" != "$t" ]; then
      { [ -n "$ed" ] || [ "$t" = KYSYMYS ]; } && echo "$klo $s: ${ed:-alku} -> $t"
      echo "$t" > "$RTILA/ruutu/$s.tila"
    fi
    h=$(echo "$p" | md5sum)
    [ "$(cat "$RTILA/ruutu/$s.md5" 2>/dev/null)" != "$h" ] && { echo "$h" > "$RTILA/ruutu/$s.md5"; muuttui=$nyt; }
  done
  for f in "$RTILA"/ruutu/*.tila; do
    [ -f "$f" ] || continue
    s=$(basename "$f" .tila)
    case "$elossa" in *" $s "*) continue ;; esac
    skooppi=$(echo "$s" | sed -E 's/^siirto-//; s/-[0-9]+$//; s/-/ /g')
    etuliite=$(echo "$s" | sed -E 's/-[0-9]+$//')
    korvaaja=$(echo "$elossa" | tr ' ' '\n' | grep -E "^$etuliite-[0-9]+$" | head -1)
    pakattu=$(git log --since='15 minutes ago' --format=%h --fixed-strings --grep="AJO pakkaa $skooppi " | head -1)
    if [ -n "$pakattu" ] || grep -q 'PAKKAA-GIT: ok' "$KAAPPAUS/$s.txt" 2>/dev/null; then
      echo "$klo SULJETTU $s pakkauksen jälkeen (${pakattu:-merkki ruudussa})${korvaaja:+, jatkaa: $korvaaja}"
    else
      echo "$klo KATOSI $s (EI pakkausmerkkiä: mahdollinen kaatuminen)"
    fi
    rm -f "$RTILA/ruutu/$s.tila" "$RTILA/ruutu/$s.md5"
  done
  # Koordinaattorin oma vahti.sh (minkä tahansa istunnon scratchpadissa)
  if ps -eo args= | awk '$1 ~ /bash$/ && $2 ~ /\/scratchpad\/vahti\.sh$/ {f=1} END{exit !f}'; then
    kvahti_nahty=$nyt; [ -n "$kvahti_halytetty" ] && echo "$klo KVAHTI: vahti.sh taas käynnissä"; kvahti_halytetty=
  elif [ $((nyt - kvahti_nahty)) -gt 180 ] && [ -z "$kvahti_halytetty" ]; then
    echo "$klo KVAHTI: koordinaattorin vahti.sh puuttunut yli 3 min (koordinaattori sokea)"; kvahti_halytetty=1
  fi
  if [ $((nyt - muuttui)) -gt 600 ]; then
    [ -z "$pysahtyi" ] && echo "$klo PYSÄHDYS: mikään ruutu ei ole muuttunut $(( (nyt - muuttui) / 60 )) min"; pysahtyi=1
  else pysahtyi=; fi
  oom=$(oom_kill)
  [ "$oom" != "$oom0" ] && { echo "$klo OOM: oom_kill $oom0 -> $oom"; oom0=$oom; }
  if muisti_matala; then [ -z "$matala" ] && echo "$klo MUISTI: $mt"; matala=1; else matala=; fi
  for l in $(porttilokit); do
    [ -f "$l" ] || continue
    n=$(porttirivit "$l"); b=$(avain "$l")
    [ "$n" != "$(cat "$RTILA/portti/$b" 2>/dev/null || echo 0)" ] && { echo "$klo $(grep -E '^PORTTI (VIHREÄ|PUNAINEN)' "$l" | tail -1) ($l)"; echo "$n" > "$RTILA/portti/$b"; }
  done
  h=$(git rev-parse HEAD)
  [ "$h" != "$head0" ] && { git log --oneline "$head0..$h" | cut -c1-140 | sed "s/^/$klo COMMIT /"; head0=$h; }
  # Vahdin konteksti (luku 8)
  sid=$(vahdin_istunto)
  if [ -n "$sid" ] && [ $((nyt - raja_ilmoitettu)) -ge 600 ]; then
    k=$(node claude/siirto/tools/konteksti-nyt.mjs "$sid" --raja "$RAJA" 2>/dev/null)
    [ $? -eq 3 ] && { echo "$klo KONTEKSTI-RAJA: ${k#KONTEKSTI: } (raja $((RAJA / 1000)) k) — VALVOJA.md luku 8"; raja_ilmoitettu=$nyt; }
  fi
  sleep 60
done
