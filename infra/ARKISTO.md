# scopes infra — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 13.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — skooppi luotu 13.10.2026 tarkoituksineen jakamalla `scopes`; ei avointa työtä

## 13.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-INFRA-KONTEKSTI-PUHELIN — skoopin kontekstinäkymä (dab27956) puhelimeen: käyttäjän luvalla elävän palvelun :8787 uudelleenkäynnistys uudella koodilla ja `bash scopes/ios/asenna.sh`, sitten kokeilu puhelimella (myös skoopin infra ~0,9 Mt vastauksen latausaika) — polut: scopes/palvelu/lahteet.mjs, scopes/ios/Sources/Nakymat.swift — aloitus: /pura scopes infra

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skoopin kontekstinäkymä puhelimeen | kesken (lupa :8787 uudelleenkäynnistykseen; rekisterin scopes 13.10.2026 päätös oli jättää :8787 ennalleen); odottaa käyttäjää | käyttäjän luvalla: :8787 uudelleenkäynnistys uudella koodilla ja `bash scopes/ios/asenna.sh`, sitten kokeilu puhelimella (skoopin infra suuri vastaus ~0,9 Mt — tarkista latausaika). |

## 14.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — SCOPES-INFRA-KONTEKSTI-PUHELIN valmis (99c97d92, todennettu puhelimessa 13.10.2026); skoopissa ei avointa työtä, käyttäjä päätti 13.10.2026 ettei seuraavaa pakettia

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-316 | valmis 14.10.2026 (tiedoksi: scopes design muutti Nakymat.swift 3b013ecd: Pakkaa/Automaattisiirto lukossa ilman istuntoa, varatun nimen tarkistus; kuitattu luetuksi) | ei toimenpidettä |

## 14.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — Avaa chat -nappi valmis (db2ee4dd, todennettu puhelimessa 14.10.2026); skoopissa ei avointa työtä, käyttäjä päätti 14.10.2026 ettei seuraavaa pakettia; V-300 ja V-312 korjataan skoopissa scopes viat

## 14.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-INFRA-JARJESTYS — pääskooppien järjestys Infrassa pitkällä painalluksella ja raahauksella (draggable ei irronnut puhelimessa; tee .onMove- tai oma eletoteutus, aloita patchista ~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio/e41c8fef-infra-jarjestys.patch), todennus simulaattorissa ja puhelimessa — polut: scopes/ios/Sources/Infra.swift — aloitus: /pura scopes infra

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| SCOPES-INFRA-JARJESTYS | kesken 14.10.2026 (draggable-tapa hylätty, ei irtoa) | toteuta toisin: List + yksi ForEach + `.onMove` (pitkä painallus nostaa rivin iOS 16+ ilman edit-tilaa; kortit `.listRowSpacing`illa) tai oma LongPress+DragGesture ScrollView/LazyVStack-korteilla; todenna simulaattorissa (testInfraJarjestys patchista) ja puhelimessa |

## 14.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — SCOPES-INFRA-JARJESTYS valmis ja todennettu puhelimessa 14.10.2026 (261684a4); käyttäjän valitsema puhelintodennus tehtiin samassa sessiossa

## 15.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 14.10.2026

## 15.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-PURA-MALLI-KAYTTOON — purun mallivalinta (8f8c0fe7) käyttöön: tuotantopalvelun :8787 uudelleenkäynnistys käyttäjän luvalla, äpin asennus puhelimeen ja arkin todennus puhelimessa — polut: scopes/palvelu/purkajat.mjs, scopes/ios/Sources/PuraValinta.swift, scopes/ios/Sources/Nakymat.swift — aloitus: /pura scopes infra

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| SCOPES-PURA-MALLI-KAYTTOON | avoin; odottaa käyttäjää | käynnistä tuotantopalvelu :8787 uudelleen (lupa, TYOTAVAT 22), asenna äppi puhelimeen (scopes/ios/asenna.sh), todenna arkki puhelimessa |

## 15.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-LINUX-NAPIT — Infra-sivulle palvelimen käynnistys- (WoL herata-pc.py, Windows → ssh pc linux) ja sammutusnappi (ssh palvelin sudo -n poweroff) vahvistusdialogeineen; palvelun POST /api/palvelin/kaynnista|sammuta omassa moduulissa (palvelin.mjs- ja Asiakas.swift-kytkentä: tiedoksi scopes yhteys), testit, käyttöönotto käyttäjän luvalla — polut: scopes/ios/Sources/Infra.swift, scopes/ios/Sources/Malli.swift — aloitus: /pura scopes infra — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| SCOPES-LINUX-NAPIT | avoin | toteuta palvelun POST /api/palvelin/kaynnista\|sammuta (oma moduuli, sallittu lista, vahvistus) + Infra.swift-osio vahvistusdialogeineen + testit (:8788-koepalvelu); tuotanto :8787 uudelleenkäynnistys ja äpin asennus vaativat taas käyttäjän luvan (TYOTAVAT 22). Sammutusnapin testi env-portin takana. |

## 15.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-LINUX-NAPIT-KAYTTOON — käyttäjän luvalla tuotantopalvelun :8787 uudelleenkäynnistys ja äpin asennus (asenna.sh), jotta e1d1ad03:n palvelin-napit näkyvät puhelimessa; todennus Infra-sivulla — polut: scopes/palvelu/palvelin.mjs, scopes/ios/Sources/Infra.swift — aloitus: /pura scopes infra

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| SCOPES-LINUX-NAPIT-KAYTTOON | avoin; odottaa käyttäjää | luvalla (TYOTAVAT 22: tuotanto :8787 uudelleenkäynnistys ja äpin asennus): tuotantopalvelun uudelleenkäynnistys (kill :8787:n node-pid, sitten `bash scopes/palvelu/kaynnista.sh`; cron käynnistäisi myös itse) ja `bash scopes/ios/asenna.sh`; todennus puhelimessa: Infra-sivulla palvelin-osio näyttää "Linux päällä". Oikean käynnistyksen/sammutuksen koe vain käyttäjän erillisellä luvalla (sammuttaa PC:n ja LM Studion). |

## 15.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-KONTEKSTI-LADATUT (V-400) — Infra-/skooppisivun kontekstiluettelo näyttämään oikeasti ladatut osat (järjestelmäkehote, CLAUDE.md+MEMORY.md, listat, purun runko, muistutukset alussa/kertynyt) tiedostojen rinnalla; toteutus ja kuivatesti :8788 ilman ihmistä, tuotanto :8787 ja asenna.sh käyttäjän luvalla — polut: scopes/palvelu/lahteet.mjs, scopes/ios/Sources/Nakymat.swift, scopes/ios/Sources/Malli.swift — aloitus: /pura scopes infra — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-400 (IDEAT, kohde scopes infra) | avoin | kontekstiluetteloon oikeasti ladatut osat (järjestelmäkehote, CLAUDE.md+MEMORY.md, listat, purun runko, muistutukset); palvelu lahteet.mjs skoopinKonteksti + Nakymat.swift:489 kontekstinäkymä; vaatii äpin asennuksen luvalla. |

## 15.10.2026 — scopes infra

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES-KONTEKSTI-LADATUT-KAYTTOON (V-400) — b966c099:n ladatut kontekstiosat tuotantoon: :8787 uudelleen ja asenna.sh vain käyttäjän luvalla (käyttäjä 15.10.2026: "Ei nyt"), sitten todennus puhelimessa (Infra › scopes infra › Konteksti: Järjestelmäkehote, Purun runko ym.) — polut: scopes/palvelu/lahteet.mjs, scopes/ios/Sources/Nakymat.swift, scopes/ios/Sources/Malli.swift — aloitus: /pura scopes infra

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikallinen purkaja oikeaa mallia vastaan | avoin; odottaa konetta palvelin | kun palvelin vastaa: aja-siirtaja.sh pura "scopes infra --ajaja=paikallinen:<id>" ja katso ARVIO |
| V-400 (IDEAT, kohde scopes infra) | kesken (koodi b966c099, kuivatesti ok 15.10.2026); odottaa käyttäjää | kontekstiluetteloon oikeasti ladatut osat (järjestelmäkehote, CLAUDE.md+MEMORY.md, listat, purun runko, muistutukset); palvelu lahteet.mjs skoopinKonteksti + Nakymat.swift:489 kontekstinäkymä; tuotanto :8787 uudelleen ja asenna.sh vain käyttäjän luvalla (käyttäjä 15.10.2026: "Ei nyt"); sen jälkeen todennus puhelimessa. |
| SCOPES-PAIKALLINEN-ISTUNTO | kesken (koodi e8308d51, testit vihreät; oikea ajo kaatui lms-health-ajastimeen); odottaa käyttäjää | päätä, miten palvelimen lms-health.timer sallii muun kuin 9B-mallin (esim. lms-health hyväksyy minkä tahansa ladatun LLM:n ja lataa 9B:n vain, jos mikään ei ole ladattu — vaatii sudo-muutoksen palvelimella, ihminen ajaa) tai pidetäänkö 9B; sen jälkeen käyttöönotto (:8787 uudelleen + asenna.sh luvalla) ja todennus: Pura → Istunnon malli → Qwen3 Coder 30B, ensimmäinen viesti vastaa äpin chatissa. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| lms-health.timer (palvelin, ei koodivika) purkaa minkä tahansa muun kuin 9B-mallin 5 min välein → paikallinen istunto ja chatin muut paikalliset mallit katkeavat kesken (todiste: LM Studio -loki 15.10.2026 13.30.14) | avoin; odottaa käyttäjää |
