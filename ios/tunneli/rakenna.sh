#!/bin/bash
# Kääntää Tunneli.xcframeworkin Macissa (SCOPES-ETAYHTEYS 14.10.2026), vain kun Go-lähde on muuttunut:
# tunneli/.lahde tallentaa edellisen käännöksen lähteiden tiivisteen. Ajetaan ~/Projects/scopes-ios/tunneli-hakemistossa.
set -euo pipefail
export PATH=/opt/homebrew/bin:$HOME/go/bin:/usr/bin:/bin:/usr/sbin:/sbin
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
cd "$(dirname "$0")"
tiiviste=$(cat go.mod go.sum *.go | shasum | cut -d' ' -f1)
[ -d Tunneli.xcframework ] && [ "$(cat .lahde 2>/dev/null)" = "$tiiviste" ] && exit 0
go test ./...
rm -rf Tunneli.xcframework
go tool gomobile bind -target=ios,iossimulator -iosversion=18.0 -o Tunneli.xcframework .
echo "$tiiviste" > .lahde
