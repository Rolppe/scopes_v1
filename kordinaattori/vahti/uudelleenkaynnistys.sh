#!/bin/bash
# Vahdin /clear ja uudelleenaloitus (VALVOJA.md luku 8; käyttäjä 19.10.2026). Vahti käynnistää tämän irrallisena:
#   perl -MPOSIX -e 'POSIX::setsid(); exec @ARGV' nohup bash scopes/kordinaattori/vahti/uudelleenkaynnistys.sh >/dev/null 2>&1 &
# (perl setsid toimii myös Macilla, jossa ei ole setsid- eikä flock-komentoa; 20.10.2026 siirto Macille.)
# Skripti odottaa, että vahdin Claude-istunto on idle (enintään 15 min), lähettää ruutuun /clear, odottaa uuden
# sessionId:n (enintään 2 min) ja lähettää aloituskehotteen. Loki: ~/.local/state/kord-vahti/uudelleenkaynnistys.loki.
TILA=$HOME/.local/state/kord-vahti
LOKI=$TILA/uudelleenkaynnistys.loki
mkdir -p "$TILA"
# Lukko hakemistona (mkdir on atominen myös Macilla)
mkdir "$TILA/uudelleenkaynnistys.lock" 2>/dev/null || { echo "$(date '+%F %T') ohi: toinen uudelleenkäynnistys käynnissä" >> "$LOKI"; exit 1; }
trap 'rmdir "$TILA/uudelleenkaynnistys.lock"' EXIT
loki() { echo "$(date '+%F %T') $*" >> "$LOKI"; }
KEHOTE=${VAHTI_KEHOTE:-'Vahdin uudelleenaloitus /clearin jälkeen (kontekstiraja, käyttäjä 19.10.2026): lue scopes/kordinaattori/vahti/VALVOJA.md luku 8 kohta "Aloitus" ja noudata sitä.'}
ETULIITE=${VAHTI_RUUTU_ETULIITE:-siirto-scopes-kordinaattori-vahti-}  # testit: oma ruutu

# → "<pid> <sessionId> <status> <ruutu>" vahdin istunnosta
istunto() {
  ETULIITE="$ETULIITE" python3 - <<'PY'
import glob, json, os
for f in glob.glob(os.path.expanduser('~/.claude/sessions/*.json')):
    try:
        j = json.load(open(f))
    except Exception:
        continue
    t = j.get('tmux') or ''
    if t.startswith(os.environ['ETULIITE']):
        print(j.get('pid'), j.get('sessionId'), j.get('status'), t.split(':')[0])
        break
PY
}

read -r pid sid status ruutu <<< "$(istunto)"
[ -n "$ruutu" ] || { loki "VIRHE: vahdin istuntoa ei löytynyt"; exit 2; }
loki "alku: pid $pid, sessionId $sid, ruutu $ruutu"
# Vapaa = status idle tai shell (taustalla Monitor tai shell: vuoro on silti päättynyt) eikä ruudussa näy
# "esc to interrupt". Pelkkä idle ei riitä: vahdin Monitor pitää statuksen shell-tilassa.
vapaa() { case "$status" in idle|shell) ! tmux capture-pane -p -t "$ruutu" | grep -q 'esc to interrupt' ;; *) return 1 ;; esac; }
for i in $(seq 1 180); do
  read -r _ _ status _ <<< "$(istunto)"
  vapaa && break
  sleep 5
done
vapaa || { loki "VIRHE: istunto ei vapautunut 15 minuutissa (status $status)"; exit 3; }
sleep 3
tmux send-keys -t "$ruutu" -l '/clear'; sleep 1; tmux send-keys -t "$ruutu" Enter
loki "/clear lähetetty"
uusi=$sid
for i in $(seq 1 60); do
  sleep 2
  read -r _ uusi _ _ <<< "$(istunto)"
  [ -n "$uusi" ] && [ "$uusi" != "$sid" ] && break
done
if [ "$uusi" = "$sid" ]; then
  # sessionId ei aina vaihdu heti tiedostossa; tyhjä ruutu riittää todisteeksi
  tmux capture-pane -p -t "$ruutu" | grep -qE '/clear|Claude Code' || { loki "VIRHE: /clear ei näy ruudussa"; exit 4; }
  loki "sessionId ennallaan, ruutu tyhjennetty"
fi
sleep 3
tmux send-keys -t "$ruutu" -l "$KEHOTE"; sleep 1; tmux send-keys -t "$ruutu" Enter
sleep 5
if tmux capture-pane -p -t "$ruutu" | grep -q '\[Pasted text'; then tmux send-keys -t "$ruutu" Enter; loki "Pasted text -> Enter"; fi
# Onnistui, kun istunto kävi busy-tilassa tai vastaus näkyy jo kehotteen perässä (nopea vuoro).
alku=$(printf '%s' "$KEHOTE" | cut -c1-30)
for i in $(seq 1 60); do
  sleep 1
  read -r _ _ status _ <<< "$(istunto)"
  [ "$status" = busy ] && { loki "ok: uusi sessionId $uusi, aloitus käynnissä"; exit 0; }
  tmux capture-pane -p -t "$ruutu" | grep -A3 -F "$alku" | grep -q '^●' && { loki "ok: uusi sessionId $uusi, aloitus vastattu"; exit 0; }
done
loki "VAROITUS: aloituskehote lähetetty, mutta istunto ei aloittanut minuutissa"
exit 5
