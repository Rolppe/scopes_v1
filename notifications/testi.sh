#!/usr/bin/env bash
# ilmoitukset()-logiikan testi Macin swiftc:llä (NOTIFICATIONS-PAIKALLINEN). Ajetaan palvelimelta: bash scopes/notifications/testi.sh
set -euo pipefail
juuri=$(cd "$(dirname "$0")/../.." && pwd)
tar -C "$juuri" -cf - scopes/ios/Sources/Malli.swift scopes/ios/Sources/Ilmoitukset.swift scopes/ios/Jaettu/Tilannekuva.swift scopes/notifications/ilmoitukset-testi.swift |
  timeout 180 ssh dev-host 'set -e; d=$(mktemp -d); trap "rm -rf $d" EXIT; tar -C "$d" -xf -; cd "$d"; mv scopes/notifications/ilmoitukset-testi.swift main.swift
    swiftc -o testi scopes/ios/Sources/Malli.swift scopes/ios/Sources/Ilmoitukset.swift scopes/ios/Jaettu/Tilannekuva.swift main.swift
    ./testi'
