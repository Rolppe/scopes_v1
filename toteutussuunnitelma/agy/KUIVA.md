# agy-ohje KUIVA — kuivaharjoitus ennen seuraavaa oikeaa agy-ajoa (vain luku)

Kirjoitettu 28.10.2026 (toteutussuunnitelma, overseerin tilaus agy-ohjeistus vaihe 4). Lue ensin [README.md](README.md). Tämä ajo ei luo worktreetä, ei aja porttia, ei käännä eikä muuta yhtään tiedostoa repossa. Se todentaa, että vakioaloitusprompti, preflight ja tiedostoviestit toimivat ennen T-72 osa B:tä tai seuraavaa agy-briefiä.

- Ajopaikka: Mac. Kesto noin 5 min.
- `<T-NN>` = `KUIVA`. Raporttikansio `$HOME/agy-raportit/KUIVA/`.
- Käynnistäjä: koordinaattori tai overseer, vakioaloitusprompti (README), ohjeen polku `~/sessions-repo/scopes/toteutussuunnitelma/agy/KUIVA.md`.

## Askeleet

1. Tee README:n Preflight rivit 1, 2, 4, 6, 7 ja 8. Ohita rivit 3 ja 5 (ei worktreetä, ei lukkoa). Kirjoita tulokset tiedostoon `$HOME/agy-raportit/KUIVA/preflight.txt`.
   Tarkistus: `wc -l < "$HOME/agy-raportit/KUIVA/preflight.txt"` on vähintään `6`.
2. Lähetä ALOITUS-viesti ajoistunnolle README:n muodossa (`TULOS: -`, `COMMIT: ei muutoksia`).
   Tarkistus: `ls "$HOME/agy-viestit/ulos/"` näyttää tiedoston heti. Odota 60 s (`sleep 60`), ja aja uudelleen: tiedosto on poissa (toimittaja siirsi sen). Jos se on yhä siellä, kirjaa `TOIMITUS: ei siirtynyt 60 s:ssa` ja jatka.
3. Tarkista oma viestikansio: `ls -1 "$HOME/agy-viestit/<oma ruutu>/" 2>/dev/null`. Ajoistunto lähettää kuivaharjoituksessa yhden viestin, jossa lukee `KUIVA: kuittaus`. Odota enintään 5 min (60 × `sleep 5`). Kun viesti tulee, lue se ja kirjaa nimi raporttiin. Jos sitä ei tule, kirjaa `VASTAANOTTO: ei viestiä 5 min:ssa`.
4. Kirjoita `$HOME/agy-raportit/KUIVA/RAPORTTI.md`: preflight-rivit, ALOITUS-tiedoston nimi, toimituksen tulos, vastaanotetun viestin nimi ja `git -C ~/sessions-repo status --short | wc -l` ennen ja jälkeen (luku saa muuttua muiden istuntojen vuoksi; kirjaa vain).
5. Lähetä VALMIS-viesti (`TULOS: EXIT=0`, jos askeleet 1–3 onnistuivat, muuten `EXIT=1` ja syy).

## Hyväksyntä (ajoistunto)
KUIVA on läpi, kun preflight.txt on olemassa, ALOITUS ja VALMIS tulivat ajoistunnon kansioon `~/agy-viestit/<ajoistunnon ruutu>/`, agy kuittasi `KUIVA: kuittaus` -viestin ja agy ei ajanut yhtään kiellettyä komentoa (ruudun historia: ei `git commit`, ei `tmux send-keys`).
