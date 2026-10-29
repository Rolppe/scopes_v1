# scopes siirto — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 14.10.2026 — scopes siirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-JONO-ASENNUS — käynnistä scopes-palvelu uudelleen, jotta levylle tallentuva jono on käytössä (`pkill -f scopes/palvelu/palvelin.mjs`, sitten `bash scopes/palvelu/kaynnista.sh`). Tarkista ensin, että `git status --short scopes/palvelu` on puhdas: 14.10.2026 palvelin.mjs ja liitteet*.mjs olivat toisen keskustelun keskeneräistä työtä, eikä uudelleenkäynnistys saa ladata niitä. Todenna lopuksi, että `~/.local/state/scopes-toiminnot-jono.json` syntyy ensimmäisestä jonotetusta komennosta — polut: scopes/palvelu/toiminnot*.mjs, scopes/siirto/** — aloitus: /pura scopes siirto

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Jono levylle (toiminnot.mjs) | toteutettu ja testattu 14.10.2026 (13/13); elävä palvelu ajaa vielä vanhaa koodia | paketti SIIRTO-JONO-ASENNUS |

## 14.10.2026 — scopes siirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-JONO-ASENNUS — käynnistä scopes-palvelu uudelleen, jotta levylle tallentuva jono on käytössä (`pkill -f scopes/palvelu/palvelin.mjs`, sitten `bash scopes/palvelu/kaynnista.sh`). Tarkista ensin, että `git status --short scopes/palvelu` on puhdas: toisen keskustelun keskeneräistä työtä ei saa ladata. Pakkaushetkellä 14.10.2026 puu oli puhdas. Todenna, että `~/.local/state/scopes-toiminnot-jono.json` syntyy ensimmäisestä jonotetusta komennosta — polut: scopes/palvelu/toiminnot*.mjs, scopes/siirto/** — aloitus: /pura scopes siirto

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Jono levylle (toiminnot.mjs) | toteutettu ja testattu 14.10.2026 (13/13) 466f40c5; elävä palvelu ajaa vielä vanhaa koodia **14.10.2026:** pakkaushetken `node --test` (toiminnot, luo-skooppi, skooppi-polusta) 59/59 vihreä; toiminnot.test.mjs 13/13. | paketti SIIRTO-JONO-ASENNUS |

## 14.10.2026 — scopes siirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-KYTKIMET-PUHELIN — asenna Skoopit-äppi puhelimeen (`bash scopes/ios/asenna.sh`; tarkista ensin `git status --short scopes/ios`: asennus vie työpuun lähteet, myös toisen keskustelun keskeneräiset) ja todenna puhelimessa, että skoopin valikossa näkyvät Automaattijatko- ja Autopack-kytkimet ja että kytkentä muuttaa `~/.claude/skills/keskustelun-siirto/state/{automaattivalinta,autopack}.txt`:n (palauta arvot lopuksi) — polut: scopes/palvelu/toiminnot*.mjs, scopes/siirto/** — aloitus: /pura scopes siirto

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Pura-painike voi näkyä automaattisiirron aikana (reunatapaus, scopes chat -rekisterin rivi) | avoin, testaamatta | Käyttäjä 14.10.2026 valitsi ensin jonon. Sen jälkeen päätetään, siirtyykö rivi tänne. |
| Automaattijatko- ja Autopack-kytkimet | korjattu 8ff5b35b 14.10.2026 (palvelu ja äppi valmiita, palvelu käynnissä; puhelimessa todentamatta); odottaa ajoa (todenna viim. 28.10.2026) | paketti SIIRTO-KYTKIMET-PUHELIN |

## 14.10.2026 — scopes siirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-PURA-PAINIKE — siirrä scopes chat -rekisterin Pura-painike-reunatapaus (scopes/chat/REKISTERI.md:71) tähän skooppiin vika.sh-reitillä, todenna automaattisiirron aikana näkyykö Pura-painike puhelimessa (toiminnot.mjs pura palauttaa 409 vanhan istunnon ollessa varattu) ja korjaa tarvittaessa — polut: scopes/palvelu/toiminnot*.mjs, scopes/siirto/** — aloitus: /pura scopes siirto

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Pura-painike voi näkyä automaattisiirron aikana (reunatapaus, scopes chat -rekisterin rivi) | avoin (testaamatta; käyttäjä valitsi 14.10.2026 paketiksi SIIRTO-PURA-PAINIKE) | Käyttäjä 14.10.2026 valitsi ensin jonon. Paketti SIIRTO-PURA-PAINIKE. Huom: tämän pakkauksen autovaihto 14.10.2026 on itse automaattisiirto — havainto puhelimesta sen aikana kelpaa todisteeksi. |

## 15.10.2026 — scopes siirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 14.10.2026

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-424 (IDEAT.md) | valmis 15.10.2026 (kuitattu: 11573880, testit 118/118) | ei jatkoa |
