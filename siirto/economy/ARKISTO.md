# scopes siirto economy — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-ECONOMY-MAARITTELY — kirjaa käyttäjän kanssa skoopin tarkoitus, raja ja ensimmäinen työ, ja korvaa tämä rivi ensimmäisellä oikealla paketilla — polut: scopes/siirto/economy/** — aloitus: /pura scopes siirto economy

### Tarkoitus ja raja — poistettu tai muutettu

Määrittelemättä: skooppi luotiin komennolla `/pura uusi scopes siirto economy` 27.10.2026 ilman tarkoitusta; paketti SIIRTO-ECONOMY-MAARITTELY kirjaa sen.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 27.10.2026 | paketti SIIRTO-ECONOMY-MAARITTELY |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-ECONOMY-SUUNNITELMA — neljän säästökohteen (git-tila, tiedostokartta, tehtäväodotus, pakkaus) suunnittelu ja toteutuksen aloitus — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Tarkoitus ja raja — poistettu tai muutettu

**Raja:** Polut `scopes/siirto/economy/**`.
- **Sisällä:** Siirron ja purun kutsumäärien ja token-kustannusten mittaus ja analyysi, 1500 kutsun vuorokausirajan säästötoimenpiteet, siirtoketjujen (autovaihto, purku, pakkaus) optimointi vähäisimmille kutsukerroille.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Neljän säästökohteen arkkitehtuurisuunnitelma ja rajapinnat | avoin | paketti SIIRTO-ECONOMY-SUUNNITELMA |
| Äpin natiivien apujen kehityskohteet (luku-, haku- ja tilakutsujen säästö) | avoin | suunnitella git-tilan ja tiedostokartan esisyöttö äpistä ilman LLM-kutsuja |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ECONOMY-GIT-ESITIEDOT — Git-tilan injektointi purkuihin ja avaukseen ilman toistuvia git-lukukomentoja — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Tarkoitus ja raja — poistettu tai muutettu

**Raja:** Polut `scopes/siirto/economy/**`, `scopes/palvelu/**`.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Git-tilan esisyöttö purkuun ja avaukseen | avoin | paketti ECONOMY-GIT-ESITIEDOT |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Git-tilan esisyöttö purkuun ja avaukseen | valmis | paketti ECONOMY-GIT-ESITIEDOT valmis |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ECONOMY-TASK-ODOTUS — Agy-ajurin komentoviiveen (WaitMsBeforeAsync: 10000) oletusarvon säätö ja manage_task status -pollauksen esto — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Tehtäväodotuksen determinismi ja status-pollauksen esto | suunniteltu | paketti ECONOMY-TASK-ODOTUS |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ECONOMY-TIEDOSTOKARTTA — Tiedostokartta ja koodi-indeksi äpissä ilman sokkohakuja — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Tiedostokartta ja koodi-indeksi äpissä | suunniteltu | paketti ECONOMY-TIEDOSTOKARTTA |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ECONOMY-HYBRIDI — Deterministinen hybridipakkaus kaikkiin skooppeihin vanhan vaihepakkauksen korvaamiseksi — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Tarkoitus ja raja — poistettu tai muutettu

Raja: Polut `scopes/siirto/economy/**`, `scopes/palvelu/**`.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Deterministinen hybridipakkaus kaikkiin skooppeihin | suunniteltu | paketti ECONOMY-HYBRIDI |
| Suurimpien kuluttajien (`siirto-git`, `infra expresso`) kutsujen karsinta | avoin | lyhentää työkalu- ja purkusyklejä sekä siirtyä hybridipakkaukseen |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ECONOMY-KULUTTAJAT — Suurimpien kuluttajien (siirto-git, infra expresso) kutsujen karsinta — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Suurimpien kuluttajien (`siirto-git`, `infra expresso`) kutsujen karsinta | suunniteltu | paketti ECONOMY-KULUTTAJAT |
| 1500 kutsun budjetointi ja säästö siirroissa | avoin | analysoida siirron ja purun kutsuketju ja karsia turhat kutsut |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Suurimpien kuluttajien (`siirto-git`, `infra expresso`) kutsujen karsinta | valmis | karsintatoimet ja moduuli `kuluttajat.mjs` toteutettu |

## 27.10.2026 — scopes siirto economy

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ECONOMY-BUDJETTI — 1500 kutsun budjetointi ja säästö siirroissa — polut: scopes/siirto/economy/**, scopes/palvelu/** — aloitus: /pura scopes siirto economy — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| 1500 kutsun budjetointi ja säästö siirroissa | suunniteltu | paketti ECONOMY-BUDJETTI |
