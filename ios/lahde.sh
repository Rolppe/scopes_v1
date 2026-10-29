# shellcheck shell=bash
# Lähdepuun valinta asenna.sh:lle ja testi.sh:lle (V-338). Oletus on työpuu sellaisenaan; lippu --head (LAHDE_HEAD=1)
# paketoi committoidun HEADin, jolloin rinnakkaisen keskustelun committoimaton työ ei päädy puhelimeen tai testiin.
# Lähteytetään kutsujasta, jossa $tama on scopes/ios-hakemisto.
lahde_repo=$(git -C "$tama" rev-parse --show-toplevel)
lahde_ali=$(git -C "$tama" rev-parse --show-prefix)
lahde_ali=${lahde_ali%/}

# lahde_tar <alihakemisto tai .> [--exclude=…] <polut…> → tar-virta stdoutiin
lahde_tar() {
  local ali=$1; shift
  if [ "${LAHDE_HEAD:-0}" = 1 ]; then
    local polut=() p puu=$lahde_ali
    [ "$ali" = . ] || puu+="/$ali"
    for p in "$@"; do [[ $p == --exclude=* ]] || polut+=("$p"); done
    git -C "$lahde_repo" archive --format=tar "HEAD:$puu" -- "${polut[@]}"
  else
    tar -C "$tama/$ali" -cf - "$@"
  fi
}

# lahde_kerro <polut…> → yksi rivi stderriin: mistä lähteet otetaan ja montako committoimatonta muutosta jää pois tai on mukana
lahde_kerro() {
  local n
  n=$(git -C "$tama" status --porcelain -- "$@" | wc -l)
  if [ "${LAHDE_HEAD:-0}" = 1 ]; then
    echo "lähde: HEAD $(git -C "$tama" rev-parse --short HEAD) (työpuun $n committoimatonta muutosta ei mukana)" >&2
  else
    echo "lähde: työpuu ($n committoimatonta muutosta mukana; --head rakentaa HEADista)" >&2
  fi
}
