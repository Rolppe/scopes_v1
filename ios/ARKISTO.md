# scopes ios — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 28.10.2026 — scopes ios

### Päätökset — poistettu tai muutettu

- **Käyttäjä 28.10.2026:** ensimmäinen paketti oli V-338 (`--head`-lippu). `asenna.sh` ja `testi.sh` ottavat lähteet tiedoston `lahde.sh` kautta: oletuksena työpuu, ja lipulla `--head` committoitu HEAD (`git archive`). Kumpikin tulostaa rivin `lähde:` ja sen, montako committoimatonta muutosta on mukana tai jää pois. Todennettu: paikallinen vertailu (likainen muutos jää pois HEAD-tilassa) ja `SCOPES_VAIN="testKaynnistysAvaaListan" bash scopes/ios/testi.sh --head` → exit 0, xcresult Passed 1/1. `asenna.sh --head` jäi ajamatta, koska se asentaisi puhelimeen. Se käyttää samaa funktiota.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Päällekkäiset omistukset | kartoitettu 28.10.2026 | ilmoitettu omistajille tiedoksi: performance ios (rivi 16 ottaa koko `scopes/ios/**`), siirto agymacos (rivi 11 ottaa `scopes/ios/Sources/**`), ioskeyboard (`scopes/ios/Keyboard/` on käsin synkattu kopio), sideloader (mac-ketju otetaan nyt `scopes ios`:lta, ei jakelu macilta) |

### Viat — valmis

| Vika | Tila |
|---|---|
| V-331 → scopes viat | korjattu 28.10.2026 (oletus listan ylin skooppi) |
| V-338 → scopes viat | korjattu 28.10.2026 (lippu --head, lahde.sh) |
| V-447 → scopes viat | korjattu ja viety Maciin 28.10.2026 (kaikki 3 profiilia voimassa 4.11. asti) |

### Historia — poistettu tai muutettu

Historia: `scopes/ios/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
