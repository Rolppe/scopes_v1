# scopes/patriot/ARKISTO.md

Kopioitu scopes macosista 21.10.2026 (scopes/macos/ARKISTO.md) ja karsittu scopes2-projektiin liittyviin lukuihin (PATRIOT-KARSINTA 21.10.2026); vanhan macOS-äpin luvut ovat scopes/macos/ARKISTO.md:ssä.


Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 19.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — scopes macosilla ei avoimia töitä; tämän session työ (vikakorjausten ohjaus, scopes2-järjestelyt) on valmis ja koordinointi siirretty scopes kordinaattorille 19.10.2026

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — scopes macosilla ei heti ajettavaa; scopes2-työ etenee koordinaattorin ja vahdin (scopes kordinaattori vahti) kautta

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-MACOS-1 (20.10.2026): scopes macos -istunto 64f841d7 (Mac) havaitsi 19.10. klo 19.48, että rinnakkaisen istunnon 28f5f18b aika-arvio ja ihmisvaiheiden selvitys olivat kirjaamatta. Se arvioi ne vanhentuneiksi ja jätti kirjaamatta kysymättä käyttäjältä. Lisäksi se palautti kuolleen 28f5f18b:n (18.35), vaikka oli itse skoopin aktiivinen istunto, eikä kertonut kahdennuksesta. | korjattu sisällön osalta (fcd8c7c1, `scopes/macos/AIKATAULUENNUSTE.md`); toimintaohje: havaittu kirjaamaton tulos kysytään käyttäjältä, ei pudoteta omalla arviolla |

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: V-584 (omistaja päätettävä: scopes2/macos vai scopes macos), ARK-16/H-16 arkkitehtuurin kirjaus (/pura scopes architecture); scopes2-työ etenee koordinaattorin ja vahdin (scopes kordinaattori vahti) kautta

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-584 (`claude/idea/IDEAT.md:196`): scopes-V2 macOS-äpin kehitysasetukset, ensin "älä sammuta näyttöä" | avoin; odottaa käyttäjää | Koskee `scopes2/macos`-polkua, `scopes macosin` raja on `scopes/macos/**`; käyttäjä päättää omistajan ennen aloitusta. |
| ARK-16/H-16 arkkitehtuurin kirjaus | avoin; odottaa käyttäjää | Käyttäjä avaa `/pura scopes architecture` (V-586). |

### Viat — valmis

| Vika | Tila |
|---|---|
| Oma virhe: kellonajat 17.45/17.47 viesteissä olivat väärin (todellinen ~17.41); korjattu käyttäjälle. | korjattu 20.10.2026 (korjattu käyttäjälle) |
| Oma virhe: kloonausskriptin `rm -rf models` poisti juuri kloonatut `models/optimization` ja `models/jev`; kloonattu uudelleen, tarkistettu. | korjattu 20.10.2026 (kloonattu uudelleen ja tarkistettu) |

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: Avaa scopes2-istunnot uudelleen Macilla (Macin klooni sessions-repo): kordinaattori, vahti, scopes2 shared, web, ydin, toteutussuunnitelma, architecture — tarkista ensin niiden pakkaukset originissa ja synkka, asenna tmux Macille (brew); sulje palvelimen vastaavat istunnot vasta kun Mac-istunnot vastaavat — polut: `scopes/macos/**`; aloitus: /pura scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| scopes2-istuntojen avaus Macilla | avoin; odottaa käyttäjää | Käyttäjä purkaa scopes macosin Macilla (`cd ~/sessions-repo && claude`, sitten `/pura scopes macos`); tarkista että kaikkien 7 pakkaukset ovat originissa (git log), synkka Macin kloonissa, sitten avaa istunnot (tmux: `brew install tmux`, tai Terminal-ikkunat; ei GUI-ikkunoita macOS-UI-testin aikana). |
| T-52 ajo 10 | avoin (punainen 9 kertaa; ei uusintaa ilman käyttäjää); odottaa käyttäjää | 8787-ratkaisun ja Mac-siirron jälkeen. |
| Palvelimen istunnot sulkematta | kesken (pakkaukset käynnissä 20.10.2026 klo 18.38) | Sulje kun Mac-istunnot ovat ylhäällä. |

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — scopes2-hallinta siirtyi skooppiin scopes overseer 20.10.2026; vanhan macOS-äpin jatko (MAC-17, MULTI) rekisterin mukaan käyttäjän pyynnöstä — polut: scopes/macos/** — aloitus: /pura scopes macos

## 21.10.2026 — scopes patriot

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-620 (claude siirto): KESKEN-varoitus ei näe toisella koneella tehtyä pakkausta | avoin, omistaja claude siirto |

## 21.10.2026 — scopes patriot

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — PATRIOT-KARSINTA valmis 21.10.2026; patriot odottaa käyttäjän pyyntöjä (scopes-v2-team, `scopes/KEHITYSMALLI.md`)

## 21.10.2026 — scopes patriot

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: PATRIOT-VIIKKORAJA — ota viikkorajasta uusi lukema (api/oauth/usage, 429 → uusinta 60 s välein), laske kulutusvauhti ja rajan täyttymisaika, päivitä scopes/patriot/AIKATAULUENNUSTE.md alustapäätösten mukaan (iOS, macOS ja ARK-16 jatkuvat; ARK-11a odottaa; käyttäjän valinta 21.10.2026) — polut: scopes/patriot/** — aloitus: /pura scopes patriot

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-PAT-1 (oma, 21.10.2026): herata-istunnot.sh:n herätysviesti (cc9f3298) pyysi vain "käynnistä TaskStopilla pysäytetyt ajot ja Monitorit" ja tarjosi "vastaa ok". 13.51 viesti meni 9 istunnolle, mutta 7 vastasi "ok" ilman työkaluja: stopin hetkellä niillä ei ollut ajoja, ja todellinen pysäytys oli "Odota käyttäjää" sekä koordinaattorin vuoro, eikä viesti purkanut niitä. Vain overseer ja vahtimestari käynnistivät Monitorin. Korjaus: viesti purkaa "Odota käyttäjää" -käskyn, käskee jatkamaan SEURAAVA PAKETTI -jonoa ennallaan ja antaa koordinaattorille oman jatkokäskyn; "vastaa ok" pois | korjattu a72abcde (käyttäjä: "Korjaa ja herätä nyt"); 14.32 herätys ios, adapteri ja overseer: ios ja overseer jatkoivat työkaluilla, adapterin jono tyhjä (odottaa T-84:ää) |
| V-620 (claude siirto): KESKEN-varoitus ei näe toisella koneella tehtyä pakkausta; toistui 21.10.2026 puruaika alussa | avoin, omistaja claude siirto |

## 21.10.2026 — scopes patriot

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: PATRIOT-AGY-SUUNNITTELU — suunnittele käyttäjän kanssa, mitkä skoopit voidaan siirtää agy-ajoon (Antigravity CLI): kriteerit (työkalut Monitor/SendMessage/tmux-send/Agent, hookit, laatuvaatimus, Mac-portit), ehdokkaat kulutusjakauman mukaan (scopes/patriot/HISTORIA.md 21.10.2026), agy:n kiintiö ja pariteettiaukot; kaksisuuntainen suunnittelu, ei kirjoituksia kysymättä — polut: scopes/patriot/** — aloitus: /pura scopes patriot

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| PATRIOT-AGY-SUUNNITTELU | suunniteltu ja käyttäjän hyväksymä 21.10.2026 (Päätökset); välitetty overseerille | Seuraa overseerin kuittausta; pariteettiaukot omistajille ennen 24.10. klo 7.24 |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-PAT-2 (oma, 21.10.2026): kirjasin shared-istunnon 180004 suljetuksi tarkistamatta; `tmux send-keys /exit` ei sulkenut sitä | korjattu: sulkeminen todennetaan tmux list-sessions -komennolla; overseer sulki istunnon 18.02 |

### Viat — valmis

| Vika | Tila |
|---|---|
| V-PAT-2 (oma, 21.10.2026): kirjasin shared-istunnon 180004 suljetuksi tarkistamatta; `tmux send-keys /exit` ei sulkenut sitä | korjattu f03b793f (sulkeminen todennetaan tmux list-sessions -komennolla; overseer sulki istunnon 18.02) |

## 21.10.2026 — scopes patriot

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Kiintiövertailu agy vs Claude | avoin (t0 17.40 ja t1 18.14 kirjattu; agy ei liiku ennen kuin agy-skoopeilla on tehtäviä) | Seuraava paketti PATRIOT-AGY-SEURANTA: uusi lukema, shared-pilotin tulos, ydin/ios/adapteri agy:hin tehtävän tullen |
| T-72 osa B | avoin; odottaa skooppia overseer (käyttäjä sanoi sopii; overseer pyytää GO:n) | Odota overseerin ilmoitus |

## 28.10.2026 — scopes patriot

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: PATRIOT-AGY-SEURANTA — seuraa agy-siirtoa: uusi kiintiölukema (Claude viikko ja agy, vertaa t0 17.40 ja t1 18.14), shared-pilotin (181855) tulos, ydin/ios/adapteri agy:hin kun skoopilla on tehtävä, päivitä scopes/patriot/AIKATAULUENNUSTE.md — polut: scopes/patriot/** — aloitus: /pura scopes patriot

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Kiintiövertailu agy vs Claude | avoin (t0 17.40 ja t1 18.14 kirjattu; agy ei liiku ennen kuin agy-skoopeilla on tehtäviä) **21.10.2026:** Claude-puolen lukema vahdin välimuistista (~/.claude/hooks/state/kayttoraja-vahti/kaytto.json): 5 h raja 7 %, nollautuu 2026-10-21T20:29:59Z; viikkorajaa ei välimuistissa, /api/oauth/usage-hakua ei tehty (krooninen 429). | Seuraava paketti PATRIOT-AGY-SEURANTA: uusi lukema, shared-pilotin tulos, ydin/ios/adapteri agy:hin tehtävän tullen |
| Mac agy-statusline (`scopes/palvelu/agy-statusline-paivittaja.mjs`) | avoin; odottaa käyttäjää (ehdotettu, ei asetettu; muuttaa Macia, käyttäjän päätös) | Kysy käyttäjältä, jos vertailua jatketaan |

### Viat — valmis

| Vika | Tila |
|---|---|
| V-632 (scopes): scopes/KEHITYSMALLI.md lisätty, skoopin polkuihin ja rekisteriin viittaus omistajan päätöksellä | korjattu 9ae8047 |

## 28.10.2026 — scopes patriot

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: PATRIOT-KULUTUSMITTAUS — mittaa scopes-v2-teamin (avattu 28.10.2026 klo 7.50; overseer Opus medium, kordinaattori Sonnet high, valvojat Opus high) kulutus: viikko- ja 5 h raja, %/h verrattuna 21.10. ~2 %/h:iin, riittääkö kiintiö 2.11. klo 0.00 asti; kirjaa scopes/patriot/AIKATAULUENNUSTE.md — polut: scopes/patriot/** — aloitus: /pura scopes patriot

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| launchd-agentti `com.example.scopes-herata` (herata-istunnot.sh:n ajastus) | avoin; odottaa käyttäjää (auto moden luokitin esti asennuksen kahdesti, Unauthorized Persistence, myös "Käynnistä itse" -luvalla; asennuskomento annettu käyttäjälle 21.10.2026) | Käyttäjä ajaa asennuskomennon `!`-etuliitteellä tai Shift+Tab ja "Käynnistä itse" |
| Kulutusmittaus scopes-v2-team | valmis 28.10.2026: t4 8.14 ja t5 9.03 (viikko ~3,7 %/h, koko tilin lukema; AIKATAULUENNUSTE.md 6a5bd530); käyttäjä: jatketaan entiseen tapaan | - |
| Mac laturiin (kirjattu 28.10.2026) | avoin; odottaa käyttäjää (akulla 72 % klo 7.37) | Muistuta käyttäjää |
| Patriotin oma effort medium | avoin; odottaa käyttäjää (vain käyttäjä voi, `/effort`) | - |

## 28.10.2026 — scopes patriot

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — kysytty 28.10.2026: "Mac laturissa" (kuitattu valmiiksi); launchd-agentti com.example.scopes-herata asennettu ja ajaa (28.10.2026)

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| launchd-agentti `com.example.scopes-herata` (herata-istunnot.sh:n ajastus) | valmis 28.10.2026: käyttäjä ajoi Macilla `bash ~/asenna-herata.sh`; tarkistettu ssh:lla: plist ~/Library/LaunchAgents, launchctl run interval 60 s, runs = 1, last exit code = 0 | ei mitään |
