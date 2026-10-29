#!/usr/bin/env bash
# scopes/siirto/git/gate.sh - Deterministinen verifiointiportti git-synkronointimoduulille
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
juuri="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
git_dir="$juuri/scopes/siirto/git"

echo "=== GATETESTI: scopes siirto git ==="

# 1. Tarkista kriittiset dokumentit ja tiedostot
for td in "REKISTERI.md" "SUUNNITELMA.md" "HISTORIA.md" "index.mjs" \
          "git-komento.mjs" "git-komento.test.mjs" \
          "git-tila.mjs" "git-tila.test.mjs" \
          "git-synkka.mjs" "git-synkka.test.mjs" \
          "git-worktree.mjs" "git-worktree.test.mjs"; do
  test -f "$git_dir/$td" || { echo "VIRHE: $td puuttuu hakemistosta $git_dir" >&2; exit 1; }
done

echo " Dokumentit ja moduulit olemassa."

# 2. Tarkista että SUUNNITELMA.md ja REKISTERI.md sisältävät vaaditut aiheet
for avainsana in "SIIRTO-GIT-SYNKKA" "SIIRTO-GIT-WORKTREE" "git-synkka.mjs" "git-worktree.mjs" "Sääntö 2" "lukkotörmäys"; do
  if ! grep -qi "$avainsana" "$git_dir/SUUNNITELMA.md" && ! grep -qi "$avainsana" "$git_dir/REKISTERI.md"; then
    echo "VIRHE: aiheen '$avainsana' maininta puuttuu SUUNNITELMA/REKISTERI-tiedostoista" >&2
    exit 2
  fi
done

echo " SUUNNITELMA.md ja REKISTERI.md sisältävät vaaditut käsitteet."

# 3. Yksikkö- ja integraatiotestit
echo "Ajetaan yksikkö- ja integraatiotestit (node --test)..."
node --test "$git_dir"/*.test.mjs

echo "=== GATETESTI HYVÄKSYTTY (exit 0) ==="
exit 0
