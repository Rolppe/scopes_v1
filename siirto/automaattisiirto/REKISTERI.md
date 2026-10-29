# scopes/siirto/automaattisiirto/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ei mitään — odottaa ajoa: kolmen korjauksen (1891988c, 8cb2d5e5, d84b7021) todennus seuraavassa vahdin automaattisiirrossa; odottaa käyttäjää: Raja vs. polkutaulu -ristiriita

## Tarkoitus ja raja

Tarkoitus: Automaattisiirto-ominaisuuteen liittyvät asiat (Scopes-äppi ja taustapalvelu).

Raja: Polut `scopes/siirto/automaattisiirto/**`, `scopes/palvelu/toiminnot-asetukset.mjs`, `scopes/palvelu/toiminnot-asetukset.test.mjs`, `scopes/palvelu/toiminnot.mjs`, `scopes/palvelu/toiminnot.test.mjs`, `scopes/palvelu/palvelin.mjs`, `scopes/ios/Sources/Nakymat.swift`, `scopes/ios/Sources/Malli.swift`, `scopes/ios/UITests/SkoopitUITests.swift`, `claude/siirto/tools/asetus-tila.mjs`, `claude/siirto/tools/asetus-tila.test.mjs`. Automaattisiirron käynnistyslogiikka, kytkimet ja automaatio, kun keskustelu on pysähtynyt ja kontekstiraja on täyttynyt (automaattinen siirto ilman kyselyitä).

## Päätökset

- **Käyttäjä 18.10.2026:** skooppi `scopes siirto automaattisiirto` luotiin komennolla `/pura uusi scopes siirto automaattisiirto`.
- **Käyttäjä 18.10.2026 (SIIRTO-AUTOMAATTISIIRTO-MAARITTELY):** tarkoitus kattaa automaattisiirto-ominaisuuteen liittyvät asiat. Ensimmäinen tehtävä: tee skoopin infra-valikkoon toggle-kytkin, jolla saa laitettua päälle ominaisuuden, että kun keskustelu on pysähtynyt ja kontekstiraja täyttynyt, automaattisiirto toteutetaan ilman kyselyitä.
- **19.10.2026:** Käyttäjä 18.10.2026: ensimmäinen tehtävä on skoopin infra-valikon toggle-kytkin, jolla automaattisiirto otetaan käyttöön kun keskustelu on pysähtynyt ja kontekstiraja täyttynyt, ilman kyselyitä.
- **27.10.2026 (SIIRTO-AUTOMAATTISIIRTO-KYTKIN):** toteutettu automaattisiirto-kytkin taustapalveluun (toiminnot-asetukset.mjs, asetus-tila.mjs, automaattisiirto.txt) ja Scopes-äpin skooppinäkymään (Nakymat.swift, Malli.swift). Taustapalveluun lisätty automaattisiirto-vahti (toiminnot.mjs tarkistaAutomaattisiirto), joka laukaisee /automaattisiirto kun kytkin on päällä, kontekstiraja täyttynyt (>= 120 000) ja istunto pysähtynyt.

- **27.10.2026:** Noudatetaan jaetun kloonin V-KORD-5 -sääntöä: commitoitu ja käsitellään ainoastaan skoopille kuuluvat polut

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **Käyttäjä 28.10.2026:** viat kirjataan omaan Viat-tauluun ja muiden skooppien viat vika-ilmoituksina omistajille.

- **Käyttäjä 28.10.2026:** korjausjärjestys: ensin rinnakkaislaukaisu, sitten toimituksen todennus, sitten jonossa hylätty komento.

- **Käyttäjä 28.10.2026:** Claude Coden dialogi tunnistetaan ja kerrotaan äpille; hylätty vaihtoehto: tunnetun dialogin ohitus Escapella (Escape voisi hylätä lupakyselyn).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Kolmen korjauksen todennus tuotannossa (1891988c, 8cb2d5e5, d84b7021) | korjattu; odottaa ajoa (todenna viim. 11.11.2026) | kun vahti seuraavan kerran laukaisee siirron (ei käynnistettävissä käsin): tarkista toimintolokista `lähetetty`-rivin lopputulosrivi ja että laukaisu on yksi kerrallaan |
| Raja vs. polkutaulu -ristiriita: Rajan polut (toiminnot*.mjs, palvelin.mjs, Nakymat.swift, Malli.swift, SkoopitUITests.swift) ovat reitittimen polkutaulussa muiden skooppien (kirjattu 28.10.2026) | avoin; odottaa käyttäjää | käyttäjä päättää: lisätäänkö polkutauluun automaattisiirron rivit vai rajataanko Raja omaan hakemistoon |

## Viat

| Vika | Tila |
|---|---|
| AUTOMAATTISIIRTO-TOIMITUS-OK: vahti ja äppi kirjasivat `tulos: ok` jo toimituksesta, vaikka siirto ei käynnistynyt (agy-kiintiö 429, 3/29 siirrossa) (kirjattu 28.10.2026) | korjattu 8cb2d5e5 28.10.2026; odottaa ajoa (todenna viim. 11.11.2026: `lähetetty`-rivin perään lopputulosrivi; ei uusintaa eikä äpin siirtojen seurantaa) (todenna viim. 11.11.2026) |
| AUTOMAATTISIIRTO-JONO-KYSELY: /automaattisiirto jonoutui scopes agents architecture -skoopin istuntoon, joka odotti Claude Coden auto mode -dialogia, ja hylättiin 2 h 14 min jälkeen (27.10.2026) (kirjattu 28.10.2026) | korjattu d84b7021 28.10.2026; odottaa ajoa (todenna viim. 11.11.2026: dialogi tunnistetaan ja jonorivi näyttää `dialogi`-kentän; äppi asennettu puhelimeen 28.10. 21:29) (todenna viim. 11.11.2026) |
| AUTOMAATTISIIRTO-RINNAKKAIN: vahti laukaisi kaikki rajan ylittäneet istunnot kerralla (27.10.2026 kaksi siirtoa 3 ms välein), ja rinnakkaiset pakkaukset antoivat `PAKKAUS: epäselvä` (kirjattu 28.10.2026) | korjattu 1891988c 28.10.2026; odottaa ajoa (todenna viim. 11.11.2026: toimintolokissa yksi `automaattisiirto-vahti` kerrallaan) (todenna viim. 11.11.2026) |

## Historia

Historia: `scopes/siirto/automaattisiirto/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
