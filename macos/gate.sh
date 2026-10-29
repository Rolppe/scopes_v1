#!/usr/bin/env bash
# gate.sh - Deterministinen verifiointiportti Flash 3.8 Low -agenteille
set -euo pipefail

task=${1:-}
if [ -z "$task" ]; then
  echo "Käyttö: bash scopes/macos/gate.sh <TEHTAVA_ID>" >&2
  exit 1
fi

if [[ "$(uname)" == "Darwin" ]]; then
  juuri="$(cd "$(dirname "$0")/../.." && pwd)"
  shared_dir="$juuri/scopes/shared"
  macos_dir="$juuri/scopes/macos"
  is_local=1
else
  juuri="~/palvelin"
  shared_dir="$juuri/scopes/shared"
  macos_dir="$juuri/scopes/macos"
  is_local=0
fi

echo "=== PORTTI: Tehtävä $task ==="

case "$task" in
  CORE-01)
    test -f "$shared_dir/ScopesCore/Package.swift" || { echo "VIRHE: Package.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesCore/Sources/ScopesCore/ScopesCore.swift" || { echo "VIRHE: ScopesCore.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesCore && swift test --filter ScopesCoreTests"
    ;;
  CORE-02)
    test -f "$shared_dir/ScopesCore/Sources/ScopesCore/Models/ScopeModels.swift" || { echo "VIRHE: ScopeModels.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesCore/Tests/ScopesCoreTests/ScopeModelsTests.swift" || { echo "VIRHE: ScopeModelsTests.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesCore && swift test --filter ScopeModelsTests"
    ;;
  CORE-03)
    test -f "$shared_dir/ScopesCore/Sources/ScopesCore/Client/ScopesClient.swift" || { echo "VIRHE: ScopesClient.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesCore/Tests/ScopesCoreTests/ScopesClientTests.swift" || { echo "VIRHE: ScopesClientTests.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesCore && swift test --filter ScopesClientTests"
    ;;
  CORE-04)
    test -f "$shared_dir/ScopesCore/Sources/ScopesCore/Client/NDJSONStream.swift" || { echo "VIRHE: NDJSONStream.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesCore/Tests/ScopesCoreTests/NDJSONStreamTests.swift" || { echo "VIRHE: NDJSONStreamTests.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesCore && swift test --filter NDJSONStreamTests"
    ;;
  CORE-05)
    test -f "$shared_dir/ScopesCore/Sources/ScopesCore/Sync/LrCore.swift" || { echo "VIRHE: LrCore.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesCore/Tests/ScopesCoreTests/LrCoreTests.swift" || { echo "VIRHE: LrCoreTests.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesCore && swift test --filter LrCoreTests"
    ;;
  CORE-06)
    test -f "$shared_dir/ScopesCore/Sources/ScopesCore/Protocols/PlatformProtocols.swift" || { echo "VIRHE: PlatformProtocols.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesCore/Tests/ScopesCoreTests/PlatformProtocolsTests.swift" || { echo "VIRHE: PlatformProtocolsTests.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesCore && swift test --filter PlatformProtocolsTests"
    ;;
  MAC-03)
    test -f "$macos_dir/Sources/Platform/MacKeychain.swift" || { echo "VIRHE: MacKeychain.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-04)
    test -f "$macos_dir/Sources/MacSettingsView.swift" || { echo "VIRHE: MacSettingsView.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-05)
    test -f "$macos_dir/Sources/MacRootView.swift" || { echo "VIRHE: MacRootView.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-06|MAC-08)
    test -f "$macos_dir/Sources/MacSidebar.swift" || { echo "VIRHE: MacSidebar.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-10)
    test -f "$macos_dir/Sources/MacChatInput.swift" || { echo "VIRHE: MacChatInput.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-11)
    test -f "$macos_dir/Sources/MacQuestionCard.swift" || { echo "VIRHE: MacQuestionCard.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-13|MAC-14|MAC-15)
    test -f "$macos_dir/Sources/MacInspectorView.swift" || { echo "VIRHE: MacInspectorView.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-16)
    test -f "$macos_dir/Sources/MacMenuBar.swift" || { echo "VIRHE: MacMenuBar.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-18)
    test -f "$macos_dir/Sources/MacCommands.swift" || { echo "VIRHE: MacCommands.swift puuttuu" >&2; exit 2; }
    ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
    if [ -d "$shared_dir/ScopesCore" ]; then
      tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
    fi
    tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
    ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    ;;
  MAC-09)
    test -f "$shared_dir/ScopesUI/Package.swift" || { echo "VIRHE: ScopesUI/Package.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesUI/Sources/ScopesUI/Chat/Viestikupla.swift" || { echo "VIRHE: Viestikupla.swift puuttuu" >&2; exit 2; }
    if [ "$is_local" -eq 1 ]; then
      swift test --package-path "$shared_dir/ScopesUI" --build-path /tmp/scopes-ui-build
    else
      ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
      tar -C "$shared_dir" -cf - ScopesUI ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
      ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-shared/ScopesUI && swift test"
    fi
    ;;
  MAC-12)
    test -f "$shared_dir/ScopesUI/Sources/ScopesUI/Toolbar/MalliValikko.swift" || { echo "VIRHE: MalliValikko.swift puuttuu" >&2; exit 2; }
    test -f "$shared_dir/ScopesUI/Sources/ScopesUI/Toolbar/KayttorajaRenkaat.swift" || { echo "VIRHE: KayttorajaRenkaat.swift puuttuu" >&2; exit 2; }
    if [ "$is_local" -eq 1 ]; then
      cd "$macos_dir" && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet
    else
      ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
      tar -C "$shared_dir" -cf - ScopesUI ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
      tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
      ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    fi
    ;;
  MAC-17)
    test -f "$macos_dir/Sources/Platform/LiitteetMac.swift" || { echo "VIRHE: LiitteetMac.swift puuttuu" >&2; exit 2; }
    test -f "$macos_dir/Sources/MacChatInput.swift" || { echo "VIRHE: MacChatInput.swift puuttuu" >&2; exit 2; }
    if [ "$is_local" -eq 1 ]; then
      cd "$macos_dir" && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet
    else
      ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
      tar -C "$shared_dir" -cf - ScopesUI ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
      tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
      ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    fi
    ;;
  MAC-*)
    test -f "$macos_dir/project.yml" || { echo "VIRHE: project.yml puuttuu" >&2; exit 2; }
    test -f "$macos_dir/Sources/ScopesMacApp.swift" || { echo "VIRHE: ScopesMacApp.swift puuttuu" >&2; exit 2; }
    if [ "$is_local" -eq 1 ]; then
      cd "$macos_dir" && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet
    else
      ssh dev-host 'mkdir -p ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared'
      if [ -d "$shared_dir/ScopesCore" ]; then
        tar -C "$shared_dir" -cf - ScopesCore | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-shared -xf -'
      fi
      tar -C "$macos_dir" -cf - --exclude=.git . | ssh dev-host 'tar -C ${MAC_PROJ:-$HOME/Projects}/scopes/scopes-macos -xf -'
      ssh dev-host "cd \${MAC_PROJ:-\$HOME/Projects}/scopes/scopes-macos && /opt/homebrew/bin/xcodegen -q && xcodebuild build -project ScopesMac.xcodeproj -scheme ScopesMac -destination 'platform=macOS' CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO -quiet"
    fi
    ;;
  *)
    echo "VIRHE: Tuntematon tehtävätyyppi: $task" >&2
    exit 1
    ;;
esac

echo "=== PORTTI HYVÄKSYTTY: $task (exit 0) ==="
exit 0
