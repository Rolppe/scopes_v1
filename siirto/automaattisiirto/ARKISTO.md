# scopes siirto automaattisiirto — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 27.10.2026 — scopes siirto automaattisiirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SIIRTO-AUTOMAATTISIIRTO-KYTKIN — tee skoopin infra-valikkoon toggle-kytkin jolla saa päälle ominaisuuden: kun keskustelu on pysähtynyt ja kontekstiraja täyttynyt, automaattisiirto toteutetaan ilman kyselyitä — polut: scopes/ios/**, scopes/palvelu/**, scopes/siirto/automaattisiirto/** — aloitus: /pura scopes siirto automaattisiirto

### Tarkoitus ja raja — poistettu tai muutettu

Raja: Automaattisiirron käynnistyslogiikka, kytkimet ja automaatio, kun keskustelu on pysähtynyt ja kontekstiraja on täyttynyt (automaattinen siirto ilman kyselyitä).

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| SIIRTO-AUTOMAATTISIIRTO-KYTKIN | ajettava | toteuta skoopin infra-valikkoon toggle-kytkin automaattisiirrolle kontekstirajan täyttyessä |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| SIIRTO-AUTOMAATTISIIRTO-KYTKIN | valmis | — |

## 28.10.2026 — scopes siirto automaattisiirto

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| AUTOMAATTISIIRTO-TOIMITUS-OK: vahti ja äppi kirjaavat `tulos: ok`, kun komento on toimitettu, vaikka siirto ei käynnisty; agy-kiintiö 429 esti pakkauksen 3/29 ajossa (27.10. 05:29Z infra expresso, 27.10. 21:20Z scopes remoteterminal todennettu agy-keskustelukannasta; 18.10. scopes agy siirto päätelty), eikä `laukaistutAutomaattisiirrot` (scopes/palvelu/toiminnot.mjs:249, 258) yritä uudelleen (kirjattu 28.10.2026) | korjattu 28.10.2026 vahdin osalta: lähetys kirjataan `lähetetty`, lopputulos omana rivinään (`pakattu`, `päättyi`, `pysähtyi pakkaamatta`, `aikakatkaisu`), ja pakkaamatta pysähtynyt vapauttaa seuraavan siirron; testit 36/36, uusi testi kaatuu edellisellä koodilla. Ei uusintaa eikä äpin lähettämien siirtojen seurantaa; palvelu käynnistetty uudelleen 28.10.2026 21:19 (pid 1720, terveys 200); odottaa todennusta tuotannossa: seuraavan vahdin siirron `lähetetty`-riviä seuraa lopputulosrivi |
| AUTOMAATTISIIRTO-JONO-KYSELY: äpin /automaattisiirto jonoutui istuntoon 5111cea9 (scopes agents architecture), joka oli odottanut hylättyä kysymystä 22.10. lähtien; komento ei päätynyt transkriptiin ja hylättiin 2 h 14 min jälkeen syyllä "jonossa ollut istunto päättyi" (toiminnot.loki 27.10. 11:29Z ja 13:43Z; scopes/palvelu/toiminnot.mjs:181, 216) (kirjattu 28.10.2026) | avoin 28.10.2026; syy selvitetty: istunto oli 22.10. 11:47Z lähtien Claude Coden oman auto mode -dialogin ("Claude Code reads this project … Also scan shell history … Enter to continue · Esc to cancel", toiminnot.loki 22.10. 11:51:29Z ruutu) varassa, tila `waiting` mutta ei kyselykortti, joten `kysymysAuki` (toiminnot.mjs:152) ja jono (toiminnot.mjs:216-217) eivät tunnistaneet sitä; myös käyttäjän 5 viestiä 22.10. jäivät "ei näkynyt". Korjattu 28.10.2026 (käyttäjä valitsi: tunnista ja kerro, ei näppäilyjä): toiminnot.mjs CLI_DIALOGIT tunnistaa dialogin capture-panella; suora komento hylätään 409 "istunto odottaa Claude Coden dialogia (auto mode -asetus) …", jonorivi kirjaa `odottaa` kerran ja näyttää `dialogi`-kentän äpin jonorivillä (Malli.swift Jonorivi, Nakymat.swift), vahti kirjaa kerran odotusjaksoa kohden; palvelutestit 213/213, uudet 3 kaatuvat vanhalla koodilla. Äpin viestit ("ei näkynyt", viestit.mjs) eivät kuulu tähän skooppiin. Palvelu käynnistetty uudelleen 28.10.2026 21:27 (pid 12568, terveys 200); äpin jonorivi tulee puhelimeen seuraavassa asennuksessa; odottaa todennusta tuotannossa |
| AUTOMAATTISIIRTO-RINNAKKAIN: vahti laukaisee kaikki rajan ylittäneet istunnot samalla kierroksella (27.10. 13:48:26Z kaksi siirtoa 3 ms välein; scopes/palvelu/toiminnot.mjs:248-262), joten pakkaukset ajetaan rinnakkain; samanaikaisissa pakkauksissa `PAKKAUS: epäselvä — last-scope.txt: arvo on <toinen skooppi>` (27.10. viat scene1 ja siirto economy, syy-yhteys päätelty) (kirjattu 28.10.2026) | korjattu 28.10.2026 (vahti laukaisee yhden kerrallaan; seuraava, kun edellinen istunto on pakattu tai päättyi, tai 30 min jälkeen lokiin `aikakatkaisu`; testit 35/35, uudet 2 kaatuvat vanhalla koodilla); palvelu käynnistetty uudelleen 28.10.2026 21:08 (pid 21881, terveys 200); odottaa todennusta tuotannossa: kun kaksi istuntoa ylittää rajan, toimintolokissa vain yksi `automaattisiirto-vahti` kerrallaan |
