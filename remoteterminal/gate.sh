#!/usr/bin/env bash
# scopes/remoteterminal/gate.sh - Deterministinen verifiointiportti etäterminaalille
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
juuri="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
rt_dir="$juuri/scopes/remoteterminal"

echo "=== GATETESTI: scopes remoteterminal ==="

# 1. Tarkista kriittiset dokumentit
test -f "$rt_dir/REKISTERI.md" || { echo "VIRHE: REKISTERI.md puuttuu" >&2; exit 1; }
test -f "$rt_dir/SUUNNITELMA.md" || { echo "VIRHE: SUUNNITELMA.md puuttuu" >&2; exit 1; }
test -f "$rt_dir/RAJAPINTA.md" || { echo "VIRHE: RAJAPINTA.md puuttuu" >&2; exit 1; }

echo " Dokumentit REKISTERI.md, SUUNNITELMA.md ja RAJAPINTA.md olemassa."

# 2. Tarkista Swift-paketti ja lähdetiedostot (REMOTETERMINAL-SWIFTTERM)
test -f "$rt_dir/Package.swift" || { echo "VIRHE: Package.swift puuttuu" >&2; exit 1; }
test -d "$rt_dir/Sources/ScopesRemoteTerminal" || { echo "VIRHE: Sources/ScopesRemoteTerminal puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalModels.swift" || { echo "VIRHE: TerminalModels.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalWireFrame.swift" || { echo "VIRHE: TerminalWireFrame.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalConnection.swift" || { echo "VIRHE: TerminalConnection.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalViewRepresentable.swift" || { echo "VIRHE: TerminalViewRepresentable.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalAccessoryBar.swift" || { echo "VIRHE: TerminalAccessoryBar.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalTheme.swift" || { echo "VIRHE: TerminalTheme.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/RemoteTerminalViewModel.swift" || { echo "VIRHE: RemoteTerminalViewModel.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/TerminalSessionPickerView.swift" || { echo "VIRHE: TerminalSessionPickerView.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Sources/ScopesRemoteTerminal/RemoteTerminalView.swift" || { echo "VIRHE: RemoteTerminalView.swift puuttuu" >&2; exit 1; }
test -f "$rt_dir/Tests/ScopesRemoteTerminalTests/RemoteTerminalViewTests.swift" || { echo "VIRHE: RemoteTerminalViewTests.swift puuttuu" >&2; exit 1; }

echo " Swift-paketti ja lähdekoodit olemassa."

# 3. Tarkista että SUUNNITELMA.md ja RAJAPINTA.md sisältävät vaaditut arkkitehtuuri- ja rajapintaosat
for avainsana in "node-pty" "WebSocket" "SwiftTerm" "ioskeyboard" "tmux"; do
  if ! grep -qi "$avainsana" "$rt_dir/SUUNNITELMA.md"; then
    echo "VIRHE: SUUNNITELMA.md ei sisällä aihetta $avainsana" >&2
    exit 2
  fi
done

for avainsana in "/api/terminal/ws" "/api/terminal/sessions" "tmux new-session -A" "TerminalWireFrame"; do
  if ! grep -qi "$avainsana" "$rt_dir/RAJAPINTA.md"; then
    echo "VIRHE: RAJAPINTA.md ei sisällä aihetta $avainsana" >&2
    exit 2
  fi
done

echo " SUUNNITELMA.md ja RAJAPINTA.md sisältävät vaaditut arkkitehtuuri- ja rajapintaosat."

# 4. Yksikkötestit
if [ -f "$rt_dir/testi.mjs" ]; then
  echo "Ajetaan yksikkötestit (testi.mjs)..."
  node "$rt_dir/testi.mjs"
fi

if [ -f "$juuri/scopes/palvelu/terminal.test.mjs" ]; then
  echo "Ajetaan palvelun terminaalitestit (terminal.test.mjs)..."
  node "$juuri/scopes/palvelu/terminal.test.mjs"
fi

echo "=== GATETESTI HYVÄKSYTTY (exit 0) ==="
exit 0
