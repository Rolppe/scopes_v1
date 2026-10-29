# scopes architecture — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 19.10.2026 — scopes architecture

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ARCHITECTURE-JAKELU — käyttäjän pyynnöstä kirjaa SUUNNITELMA.md:n vaiheen 0–1 paketit (ARK-01 `scopes performance`, ARK-02 `scopes yhteys`, ARK-03 `scopes ios`/`scopes macos`) omistajaskooppien rekistereihin ja luo skooppi `scopes ydin` (`/pura uusi scopes ydin — solmuydin Rustilla`); esiehto ARK-04:lle: Rust-työkaluketju palvelimelle ja Macille (käyttäjän komento) — polut: scopes/architecture/**, omistajien REKISTERI.md — aloitus: /pura scopes architecture

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Arkkitehtuurisuunnitelma (K-1…K-8) | valmis 19.10.2026 (SUUNNITELMA.md) | paketit jaetaan omistajille (ARCHITECTURE-JAKELU) |
| Rust-työkaluketju puuttuu palvelimelta (Debian 13 aarch64) ja Macilta (macOS 27) | odottaa käyttäjää | asennus ennen ARK-04 (rustup, ei rootia) |
| MAC-17 liitereitti (E-90) | kirjattava omistajalle `scopes macos` | korjataan ARK-08:ssa (`POST /api/skoopit/<nimi>/liite`) |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Arkkitehtuurisuunnitelma (K-1…K-8) | valmis 9943a170 19.10.2026 (SUUNNITELMA.md) | paketit jaetaan omistajille (ARCHITECTURE-JAKELU) |

## 19.10.2026 — scopes architecture

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ARCHITECTURE-JAKELU — käyttäjän pyynnöstä kirjaa SUUNNITELMA.md:n vaiheen 0–1 paketit (ARK-01 `scopes performance`, ARK-02 `scopes yhteys`, ARK-03 `scopes ios`/`scopes macos`) omistajaskooppien rekistereihin ja luo skooppi `scopes ydin` (`/pura uusi scopes ydin — solmuydin Rustilla`); esiehto ARK-04:lle: Rust-työkaluketju palvelimelle ja Macille (käyttäjän komento) (omistajien rekisterit vain käyttäjän pyynnöstä, TYÖTAVAT 15) — polut: scopes/architecture/** — aloitus: /pura scopes architecture

### Päätökset — poistettu tai muutettu

- **19.10.2026:** Uudet skoopit suunnitelmassa, ei vielä luotu: `scopes ydin` (scopes/ydin/**), `scopes web`, `scopes linux`, `scopes windows`, `scopes android`.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| MAC-17 liitereitti (E-90) | avoin (kirjattava omistajalle `scopes macos`; käyttäjälle ehdotettu komento `/vika scopes macos …`) | korjataan ARK-08:ssa (`POST /api/skoopit/<nimi>/liite`) |

## 20.10.2026 — scopes architecture

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — V-586 ja V-583 päätetty 20.10.2026 (K-10, K-11, ARK-16…ARK-18); tehtävätaso ja jakelu kuuluvat skoopille `scopes toteutussuunnitelma` koordinaattorin ohjauksessa — polut: scopes/architecture/** — aloitus: /pura scopes architecture

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Vanhan scopes-äpin ja 8787-palvelun alasajo (K-9: rinnalla, kunnes V2 toimii; esiehdot ARK-09 ja ARK-16) | avoin; odottaa käyttäjää | käyttäjä päättää, kun scopes-V2 täyttää ARK-09:n hyväksynnän ja ARK-16 on valmis; siihen asti vanhaa ei muuteta V2:n takia |
| ARK-16, ARK-17 ja ARK-18 tehtävätasolle ja omistajille (`scopes2 adapteri`; `scopes2 ydin` + `scopes2 ios`; `scopes2 macos` + `scopes2 shared`) | avoin (20.10.2026); odottaa skooppia `scopes toteutussuunnitelma` | scopes2-työ kulkee toteutussuunnitelman T-tehtävinä ja koordinaattorin ohjauksessa, ei suoraan omistajarekistereihin tästä skoopista; ilmoitettu V-587, V-588 ja ARK-18:n tiedoksi |

## 20.10.2026 — scopes architecture

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään (V-614 valmis 20.10.2026; S-9b-korjaukset ja raakarivihaku odottavat skooppia `scopes toteutussuunnitelma`)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rust-työkaluketju palvelimelle ja Macille (H-1, H-2) | valmis 20.10.2026: `rustc 1.99.1` ja `cargo` `~/.cargo/bin`:ssä molemmilla (tarkistettu ssh:lla) | pois seuraavassa pakkauksessa |
| Tauri 2 Androidilla + etualapalvelu | avoin (tarkistetaan ARK-13:n alussa) | vaihtoehto Kotlin-kuori + UniFFI |
| `scopes toteutussuunnitelma`: paketti TOTEUTUSSUUNNITELMA-SCOPES2 | valmis 19.10.2026 (toteutussuunnitelman HISTORIA.md:47) | pois seuraavassa pakkauksessa |
| V-583: scopes-V2 macOS-äpin kehitysasetukset | valmis 20.10.2026 (K-11, ARK-18) | IDEAT.md-rivi pois seuraavassa pakkauksessa |
| Istuntojen siirto Macille (mac:~/sessions-repo) | kesken (käyttäjän linjaus 20.10.2026 klo 18.35); odottaa konetta mac | seuraava avaus Macilla: /pura scopes architecture |
| V-614: arkkitehtuurin tarkastus S-9b:stä (commit 0a295851); T-55 odottaa sitä | valmis 20.10.2026: hyväksytty kahdella korjauksella (Päätökset, SUUNNITELMA luku 8) | `scopes toteutussuunnitelma` päivittää S-9b:n ja T-55-briefin ennen T-55:tä; ilmoitus omistajalle; pois seuraavassa pakkauksessa |
| S-9 ja luku 8: raakarivit pyynnöstä | päätetty 20.10.2026 (käyttäjä, AskUserQuestion "Lisää haku S-9:ään"): luku 8 pysyy, S-9:ään lisätään raakarivien pyynnöstä haku; odottaa skooppia `scopes toteutussuunnitelma` | Toteutussuunnitelma lisää S-9:ään reitin, joka hakee täydeltä solmulta raakarivit ohi riisunnan ja jättää ne pysyvästi tallentamatta, ja ARK-17:ään yhden tehtävän; ilmoitus omistajalle yhdessä V-614:n kanssa |

## 21.10.2026 — scopes architecture

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — kysytty 20.10.2026: ei nyt (alasajo odottaa käyttäjää; V-613 koordinaattori päätti 20.10.2026; V-614 valmis, S-9b-korjaukset ja raakarivihaku odottavat skooppia `scopes toteutussuunnitelma`)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| 8787 jumittuu (V-613); koordinaattorin ehdotus V2:n sillan päivitysväli 15→120 s | valmis 20.10.2026: koordinaattori päätti klo 19.29 (YOLOKI ede8f11f), ei uudelleenkäynnistystä eikä siltavälin muutosta nyt; 15→120 s T-tehtäväksi toteutussuunnitelman kautta vain, jos 8787 jumittuu uudelleen | pois seuraavassa pakkauksessa; ei arkkitehtuurin toimenpidettä |
| S-9 ja luku 8: raakarivit pyynnöstä | valmis 21.10.2026: toteutussuunnitelma lisäsi S-9f:n (`/api/peili/<tiedosto>/raaka`, ohi riisunnan, ikkunoitu solmu välittää tallentamatta) ja tehtävän T-60 (`scopes/toteutussuunnitelma/SUUNNITELMA.md:215`, `:452`); iOS-näkymä raakariveille ei kuulu ARK-17:ään, se on avoin asia omistajalla (`:221`) | pois seuraavassa pakkauksessa |
| S-9b-korjaukset ja raakarivien haku S-9:ään (V-614:n jatko) | valmis 21.10.2026: S-9b sisältää korjaukset 1 ja 2 (`scopes/toteutussuunnitelma/SUUNNITELMA.md:188-203`); T-55 toteutettu (c53f27d6) ja T-56-portti vihreä (koordinaattori 21.10.2026); virran sisäisten polkujen poikkeama korjataan T-61:ssä (f2127931) | pois seuraavassa pakkauksessa; ei arkkitehtuurin toimenpidettä |

### Roskat — pois: MAC-17 korjattu 19.10.2026 (scopes/macos/ARKISTO.md:82) (claude siirto, ROSKAT 28.10.2026)

| Asia | Tila | Seuraava askel |
|---|---|---|
| MAC-17 liitereitti (E-90) | avoin (kirjattava omistajalle `scopes macos`; käyttäjälle ehdotettu komento `/vika scopes macos …`) | K-9:n jälkeen V2 ei peri vikaa; vanhan korjaus vain käyttäjän pyynnöstä `scopes macos`-skoopissa |
