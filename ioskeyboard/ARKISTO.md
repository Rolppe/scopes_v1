# scopes ioskeyboard — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 26.10.2026 — scopes ioskeyboard

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: IOSKEYBOARD-TODENNUS — todenna näppäimistölaajennuksen toiminta iOS-simulaattorissa tai laitteella ja hienosäädä näppäimistön mitat ja reuna-asettelut — polut: scopes/ioskeyboard/**, scopes/ios/** — aloitus: /pura scopes ioskeyboard

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Näppäimistölaajennuksen arkkitehtuuri ja asettelut | Valmis 26.10.2026 (`SUUNNITELMA.md`) | paketti IOSKEYBOARD-RUNKO |
| Laajennuksen perusrunko ja XcodeGen-target | Valmis 26.10.2026 (`scopes/ios/Keyboard/`, project.yml) | paketti IOSKEYBOARD-TODENNUS |
| Näppäimistön todennus ja asettelusäädöt | Avoin | paketti IOSKEYBOARD-TODENNUS |

## 27.10.2026 — scopes ioskeyboard

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Natiivi tuntuma (haptiikka, äänet, popoverit) | Avoin | paketti IOSKEYBOARD-TUNTUMA |

### Historia — poistettu tai muutettu

Historia: `scopes/ioskeyboard/HISTORIA.md` (päivitetty 26.10.2026), ei lueta purussa.

## 27.10.2026 — scopes ioskeyboard

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: IOSKEYBOARD-TUNTUMA — viimeistele haptiikka, järjestelmä-äänet ja pitkien painallusten popoverit — polut: scopes/ioskeyboard/** — aloitus: /pura scopes ioskeyboard

## 27.10.2026 — scopes ioskeyboard

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — toteutus ja natiivi tuntuma valmis 27.10.2026 (IOSKEYBOARD-TUNTUMA)

### Päätökset — poistettu tai muutettu

- **27.10.2026:** Pidetään iOS-näppäimistön tuntumaviilaukset omana pakettinaan IOSKEYBOARD-TUNTUMA.

## 27.10.2026 — scopes ioskeyboard

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: IOSKEYBOARD-ROTAATIO — korjaa pystytilaan palatessa vaakatilan asettelun ja korkeuden jumiutuminen (KeyboardRootView, KeyboardViewController) ja todenna — polut: scopes/ioskeyboard/Sources/** — aloitus: /pura scopes ioskeyboard — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rotaatiopuki ja asennon tunnistus | avoin | paketti IOSKEYBOARD-ROTAATIO |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Pystytilaan palatessa jää päälle vaakatilan asettelu ja korkeus | avoin |

### Viat — valmis

| Vika | Tila |
|---|---|
| Pystytilaan palatessa jää päälle vaakatilan asettelu ja korkeus | korjattu (IOSKEYBOARD-ROTAATIO) |

## 27.10.2026 — scopes ioskeyboard

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: IOSKEYBOARD-ASETTELU — korjaa näppäimistön asettelut, tasaleveydet ja safe-areat (PortraitKeyboardView, LandscapeKeyboardView) ja todenna — polut: scopes/ioskeyboard/Sources/** — aloitus: /pura scopes ioskeyboard — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Näppäimistön asettelujen ja tasaleveyksien korjaus | avoin | paketti IOSKEYBOARD-ASETTELU |

## 27.10.2026 — scopes ioskeyboard

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: IOSKEYBOARD-TYYLI — viimeistele näppäimistön visuaalinen tyyli, näppäinten varjostukset, liukuvärit ja callout-esikatselukupla — polut: scopes/ioskeyboard/Sources/** — aloitus: /pura scopes ioskeyboard — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Visuaalisen tyylin ja callout-kuplan viimeistely | avoin | paketti IOSKEYBOARD-TYYLI |

## 27.10.2026 — scopes ioskeyboard

### Päätökset — poistettu tai muutettu

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia
- **27.10.2026:** Jaetun työkloonin ristiriitojen selvitys jätetään ihmiselle jaetun kloonin sääntöjen mukaisesti
- **27.10.2026:** Säilytetään aiempi suunniteltu seuraava paketti koskemattomana
