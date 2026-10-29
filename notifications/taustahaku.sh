#!/usr/bin/env bash
# Viimeisin iOS:n herättämä taustahaku (BGAppRefresh) suoraan puhelimesta, ilman käyttäjää (NOTIFICATIONS-TAUSTAHAKU-HAVAINTO
# 15.10.2026: käyttäjä ei lue Asetusten riviä agentin puolesta). Macin devicectl kopioi äpin UserDefaults-plistin, ja
# äppiloki (~/.local/state/scopes-app.loki) kertoo, alkoiko käynnistys taustalla: kaynnistys → active yli 1 s = taustaherätys.
# Ajetaan palvelimelta: bash scopes/notifications/taustahaku.sh
set -euo pipefail
laite=YOUR_DEVICE_UDID
# Äpin oma raportti palvelun äppilokissa: toimii myös lukitulla puhelimella, jolta plistiä ei saa (NOTIFICATIONS-LUKITUS-TODENNUS
# 15.10.2026). Tapahtuma "taustahaku": aika (laitteen kello), ilmoituksia (-1 = haku epäonnistui), muuttuneita (skoopit,
# joiden tilaNyt/seuraava/vikoja muuttui lähtötasoon nähden) ja lahtotasonIka (s) erottavat "ei muutoksia" viasta (16.10.2026).
viim=$(grep -F '"tyyppi":"taustahaku"' ~/.local/state/scopes-app.loki | tail -1 || true)
if [ -n "$viim" ]; then
  node -e 'const t = JSON.parse(process.argv[1]); console.log("LOKI: taustahaku", t.aika, "ilmoituksia", t.ilmoituksia, "muuttuneita", t.muuttuneita ?? "?", "lähtötason ikä", t.lahtotasonIka == null ? "?" : Math.round(t.lahtotasonIka / 60) + " min", "versio", (t.laite || {}).versio); for (const m of t.muutokset || []) console.log("  MUUTOS:", m)' "$viim"
else echo "LOKI: äppi ei ole vielä raportoinut taustahakua"; fi
aika=$(timeout 120 ssh dev-host "export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer; d=\$(mktemp -d); trap 'rm -rf \$d' EXIT
  xcrun devicectl device copy from --device $laite --domain-type appDataContainer --domain-identifier com.example.skoopit \
    --source Library/Preferences/com.example.skoopit.plist --destination \$d/p.plist >/dev/null 2>\$d/virhe || { grep -q 'error 4016' \$d/virhe && exit 4; grep -m1 ERROR \$d/virhe >&2 || tail -3 \$d/virhe >&2; exit 1; }
  plutil -extract taustahakuAika raw \$d/p.plist 2>/dev/null || echo ei; echo; plutil -extract taustahakuIlmoituksia raw \$d/p.plist 2>/dev/null || echo -") || {
  rc=$?; [ $rc -eq 4 ] && echo "TAUSTAHAKU: laite ei luovuta tiedostoa nyt (CoreDevice 4016: lukittu tai yhteys lepää) — yritä myöhemmin"; exit $rc; }
read -r hetki maara <<< "$(echo $aika)"
[ "$hetki" = ei ] && { echo "TAUSTAHAKU: iOS ei ole vielä herättänyt äppiä"; exit 3; }
echo "TAUSTAHAKU: $hetki (laitteen kello), ilmoituksia $maara (-1 = haku epäonnistui)"
# Lähin käynnistys ja sitä seuraava active samasta laitteesta (laitteen kello molemmissa)
node -e '
const [loki, hetki] = process.argv.slice(1); const t = Date.parse(hetki);
const r = require("fs").readFileSync(loki, "utf8").trim().split("\n").map(l => { try { return JSON.parse(l); } catch { return null; } })
  .filter(x => x && (x.tyyppi === "kaynnistys" || (x.tyyppi === "vaihe" && x.vaihe === "active")));
const k = r.filter(x => x.tyyppi === "kaynnistys" && Date.parse(x.aika) <= t + 1000).sort((a, b) => Date.parse(b.aika) - Date.parse(a.aika))[0];
if (!k || t - Date.parse(k.aika) > 60000) { console.log("KÄYNNISTYS: äpin oma loki ei tunne käynnistystä minuutin sisällä (lämmin taustaherätys)"); process.exit(0); }
const a = r.filter(x => x.tyyppi === "vaihe" && Date.parse(x.aika) >= Date.parse(k.aika)).sort((a, b) => Date.parse(a.aika) - Date.parse(b.aika))[0];
const vali = a ? (Date.parse(a.aika) - Date.parse(k.aika)) / 1000 : null;
console.log("KÄYNNISTYS:", k.aika, "→ active", a ? a.aika + " (" + vali.toFixed(1) + " s)" : "ei", "—",
  vali === null || vali > 1 ? "taustaherätys" : "käyttäjän avaus (haku etualalla)");
' ~/.local/state/scopes-app.loki "$hetki"
