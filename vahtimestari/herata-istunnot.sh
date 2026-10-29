#!/bin/bash
# scopes vahtimestari: istuntojen herätys käyttörajan nollauduttua (käyttäjä 21.10.2026: "koodataan scripti macos joka herättää istunnot").
# Ajaa launchd (~/Library/LaunchAgents/com.example.scopes-herata.plist, StartInterval 60) Claude-istuntojen ulkopuolella:
# seuraa-istunnot.sh:n 98 %:n stop pysäyttää myös valvojien Monitorit (21.10.2026 klo 12.42), joten herätys ei voi asua niissä.
# Ehto: $D/kaytto.taso on 98 tai 99 jaksolle J, J:n nollautumisesta on yli 120 s, 5 h käyttö < 95 % ja viikko < 95 %.
# 98 (stop) → herätysviesti jokaiseen siirto-*-ruutuun, jossa claude elää. 99 (kill) → vahtimestari ja koordinaattori
# autovaihdolla (TEHTAVAT.md 1 ja 10; koordinaattori avaa muut). Laukeaa kerran per jakso ($D/heratetty).
# Viikkoa ei saada 10 min nollautumisen jälkeen (429) → herätetään 5 h lukeman perusteella.
# Kysymystä näyttävä ruutu ohitetaan: kirjoitettu viesti sulkisi kysymyksen.
# --kuiva: tulostaa toimet, ei lähetä eikä merkitse. --nyt: herättää heti tyhjillään olevat ruudut tasosta ja
# merkistä riippumatta (käsiherätys; käytön ehto pätee). Muut argumentit rajaavat ruudut: scopes2-ios scopes-overseer.
D=$HOME/.local/state/scopes-vahtimestari-seuraa
REPO="${MAC_PROJ:-$HOME/Projects}/claude/sessions-repo"
VAHTI=$REPO/Infra/hooks
LOKI=$D/herata.loki
KUIVA=; NYT=; RAJAA=
for a in "$@"; do case $a in --kuiva) KUIVA=1 ;; --nyt) NYT=1 ;; *) RAJAA="$RAJAA $a" ;; esac; done
loki() { if [ -n "$KUIVA" ]; then echo "$*"; else echo "$(date '+%d.%m. %H:%M:%S') $*" >> "$LOKI"; fi; }

nyt=$(date +%s)
if [ -n "$NYT" ]; then
  lvl=98; jakso=kasin; nollaus=0
else
  taso=$(cat "$D/kaytto.taso" 2>/dev/null) || exit 0
  lvl=${taso%% *}; jakso=${taso#* }
  [ "$lvl" -ge 98 ] 2>/dev/null || exit 0
  [ "$(cat "$D/heratetty" 2>/dev/null)" = "$jakso" ] && exit 0
  nollaus=$(TZ=UTC date -j -f '%Y-%m-%dT%H:%M' "$jakso" +%s 2>/dev/null) || exit 0
  [ $((nyt - nollaus)) -ge 120 ] || exit 0
fi

# 5 h kayttoraja-vahti.py:n välimuistin kautta (sama kuin seuraa-istunnot.sh), viikko suoraan päätepisteestä.
r=$(cd "$VAHTI" && python3 -I - 2>/dev/null <<'PY'
import importlib.util as u, json, urllib.request
s = u.spec_from_file_location("v", "kayttoraja-vahti.py"); m = u.module_from_spec(s); s.loader.exec_module(m)
t = m.kaytto_nyt()
viikko = ""
try:
    req = urllib.request.Request(m.URL, headers={"Authorization": "Bearer " + m.lue_tunnus(),
                                 "anthropic-beta": "oauth-2025-04-20", "User-Agent": "scopes-herata"})
    with urllib.request.urlopen(req, timeout=10) as v:
        viikko = json.load(v)["seven_day"]["utilization"]
except Exception:
    pass
print(f"{t['kaytto'] if t else ''} {viikko}")
PY
)
k=${r%% *}; k=${k%.*}; w=${r#* }; w=${w%.*}
[ -n "$k" ] || { loki "ODOTA: 5 h lukema puuttuu"; exit 0; }
[ "$k" -lt 95 ] || { loki "ODOTA: 5 h $k %"; exit 0; }
if [ -n "$w" ]; then
  [ "$w" -lt 95 ] || { loki "ODOTA: viikko $w %"; exit 0; }
elif [ $((nyt - nollaus)) -lt 720 ]; then
  loki "ODOTA: viikkolukema puuttuu"; exit 0
fi

# V-PAT-1: pelkkä "käynnistä pysäytetyt ajot, muuten vastaa ok" jätti 7/9 istuntoa paikalleen 21.10.2026 13.51,
# koska ne pysähtyivät "Odota käyttäjää" -käskyyn tai koordinaattorin vuoroon. Viesti kumoaa käskyn ja nimeää jonon.
alku="Käyttöraja nollautui (5 h $k %, viikko ${w:-?} %; herata-istunnot.sh, käyttäjän päätös 21.10.2026). Käyttörajan stopin käsky \"Odota käyttäjää\" on peruttu: et odota käyttäjää sen takia."
viesti="$alku Jatka siitä, mihin jäit ennen stopia: käynnistä pysäytetyt ajot ja Monitorit uudelleen ja jatka SEURAAVA PAKETTI -jonoa. Jos odotit koordinaattorin vuoroa, koordinaattori saa oman jatkokäskyn; jos odotit käyttäjän vastausta tiettyyn kysymykseen, se odotus jää voimaan."
viesti_kord="$alku Jatka vuorojakoa SEURAAVA PAKETTI -jonon mukaan: tarkista istuntojen tila (bash scopes/vahtimestari/seuraa-istunnot.sh --kerta) ja anna stopin pysäyttämille linjoille jatkovuoro."
if [ "$lvl" -ge 99 ]; then
  # Malli ja effort KEHITYSMALLI.md:n roolitaulukosta (käyttäjä 28.10.2026): ilman --effort-lippua launchd-ajo saisi highin.
  for s in "scopes vahtimestari|claude-haiku-5-5|medium" "scopes kordinaattori|claude-sonnet-5-5|high"; do
    n=${s%%|*}; m=${s#*|}; e=${m#*|}; m=${m%|*}
    loki "KÄYNNISTÄ $n ($m $e)"
    [ -n "$KUIVA" ] || (cd "$REPO" && bash claude/siirto/tools/autovaihto.sh vaihda "$n" --model "$m" --effort "$e" --ei-sulje >> "$LOKI" 2>&1)
  done
else
  for t in $(tmux ls -F '#S' 2>/dev/null | grep '^siirto-'); do
    if [ -n "$RAJAA" ]; then osui=; for r in $RAJAA; do case $t in siirto-$r-[0-9]*) osui=1 ;; esac; done; [ -n "$osui" ] || continue; fi
    pid=$(tmux display -p -t "$t" '#{pane_pid}' 2>/dev/null) || continue
    tp=$(tmux capture-pane -p -t "$t" 2>/dev/null)
    printf '%s' "$tp" | grep -qE 'Gemini [0-9]' && { s=vapaa; printf '%s' "$tp" | grep -qE 'enter Confirm|Navigate ·' && s=kysyy; printf '%s' "$tp" | grep -qE 'esc to cancel' && s=tyossa; loki "OHITA $t (agy: $s)"; continue; }
    pgrep -P "$pid" claude >/dev/null || ps -o comm= -p "$pid" | grep -q claude || { loki "OHITA $t (ei claudea)"; continue; }
    p=$(tmux capture-pane -p -t "$t" 2>/dev/null)
    printf '%s' "$p" | grep -qE 'Enter to select|Enter to confirm|Esc to cancel' && { loki "OHITA $t (kysyy)"; continue; }
    [ -n "$NYT" ] && printf '%s' "$p" | grep -q 'esc to interrupt' && { loki "OHITA $t (työssä)"; continue; }
    v=$viesti; case $t in siirto-scopes-kordinaattori-*) v=$viesti_kord ;; esac
    loki "HERÄTÄ $t"
    [ -n "$KUIVA" ] || { tmux send-keys -t "$t" -l "$v"; tmux send-keys -t "$t" Enter; }
  done
fi
[ -n "$KUIVA" ] || [ -n "$NYT" ] || echo "$jakso" > "$D/heratetty"
loki "VALMIS taso $lvl jakso $jakso (5 h $k %, viikko ${w:-?} %)"
