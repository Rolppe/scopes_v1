#!/usr/bin/env bash
# scopes/siirto/economy/gate.sh - Deterministinen verifiointiportti Scopes Economy -kokonaisuudelle
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
juuri="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
economy_dir="$juuri/scopes/siirto/economy"
palvelu_dir="$juuri/scopes/palvelu"

echo "=== GATETESTI: scopes siirto economy ==="

# 1. Tarkista kriittiset dokumentit ja toteutukset
for td in "REKISTERI.md" "SUUNNITELMA.md" "HISTORIA.md" "ARKISTO.md" "ARKKITEHTUURI.md" \
          "git-esitiedot.mjs" "git-esitiedot.test.mjs" \
          "task-odotus.mjs" "task-odotus.test.mjs" \
          "tiedostokartta.mjs" "tiedostokartta.test.mjs" \
          "hybridi-pakkaus.mjs" "hybridi-pakkaus.test.mjs" \
          "kuluttajat.mjs" "kuluttajat.test.mjs" \
          "budjetti.mjs" "budjetti.test.mjs"; do
  test -f "$economy_dir/$td" || { echo "VIRHE: $td puuttuu hakemistosta $economy_dir" >&2; exit 1; }
done

for td in "economy.mjs" "economy.test.mjs"; do
  test -f "$palvelu_dir/$td" || { echo "VIRHE: $td puuttuu hakemistosta $palvelu_dir" >&2; exit 1; }
done

echo " Dokumentit ja lähdetiedostot olemassa."

# 2. Tarkista keskeiset termit ja käsitteet
for avainsana in "ECONOMY-GIT-ESITIEDOT" "ECONOMY-TASK-ODOTUS" "ECONOMY-TIEDOSTOKARTTA" "ECONOMY-HYBRIDI" "ECONOMY-KULUTTAJAT" "ECONOMY-BUDJETTI" \
                 "git-esitiedot.mjs" "task-odotus.mjs" "tiedostokartta.mjs" "hybridi-pakkaus.mjs" "kuluttajat.mjs" "budjetti.mjs" "economy.mjs" "1500"; do
  if ! grep -qi "$avainsana" "$economy_dir/ARKKITEHTUURI.md" && ! grep -qi "$avainsana" "$economy_dir/REKISTERI.md"; then
    echo "VIRHE: avainsana '$avainsana' puuttuu ARKKITEHTUURI/REKISTERI-tiedostoista" >&2
    exit 2
  fi
done

echo " ARKKITEHTUURI.md ja REKISTERI.md sisältävät vaaditut käsitteet."

# 3. Yksikkö- ja integraatiotestit
echo "Ajetaan yksikkötestit (node --test)..."
node --test "$economy_dir"/*.test.mjs
node --test "$palvelu_dir"/economy.test.mjs

echo "=== GATETESTI HYVÄKSYTTY (exit 0) ==="
exit 0
