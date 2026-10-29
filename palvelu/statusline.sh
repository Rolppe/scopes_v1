#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
exec node "$DIR/agy-statusline-paivittaja.mjs"
