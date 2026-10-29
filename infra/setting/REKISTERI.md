# scopes/infra/setting/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: ei mitään — INFRA-SETTING-KESKUSTELUKOHTAISET valmis ja käytössä 16.10.2026; uusi paketti kirjataan, kun käyttäjä antaa seuraavan työn

## Tarkoitus ja raja

Tarkoitus: infran asetukset Scopes-äpissä.

Raja: asetusnäkymä äpissä ja sen rajapinta (palvelimen puoli, jolla asetukset luetaan ja kirjoitetaan).

## Päätökset

- **Käyttäjä 16.10.2026:** skooppi `scopes infra setting` luotiin komennolla `/pura uusi scopes infra setting`.
- **Käyttäjä 16.10.2026:** tarkoitus on infran asetukset Scopes-äpissä; raja on näkymä ja sen rajapinta.
- **Käyttäjä 16.10.2026:** ensimmäinen työ — skooppikohtaiset asetukset (automaattijatko, autopack, pidä muisti hereillä) vaikuttavat globaalisti, vaikka niiden pitäisi olla keskustelukohtaisia.
- **Käyttäjä 16.10.2026:** keskustelukohtaiset asetukset tallennetaan istunnon tunnuksella (`state/istunnot/<tunnus>`); uusi keskustelu perii nykyisen yhteisen tiedoston oletukseksi, yhteiset tiedostot jäävät oletukseksi.
- **Kartoitus 16.10.2026:** `automaattijatko` (`state/automaattivalinta.txt`) ja `autopack` (`state/autopack.txt`) ovat yhteisiä tiedostoja; kirjoittaja `scopes/palvelu/toiminnot-asetukset.mjs`, lukijat `claude/siirto/tools/{pakkaa-alku,pakkaa-loppu,pura-faktat}.mjs`, `Infra/hooks/pysahdys-vahti.py`, `~/.claude/hooks/rd-trigger.sh`. Herätys (`/sa`) lähtee äpistä istunnolle nimellä (`toiminnot.mjs:249`); sen globaali vaikutus tarkistamatta.

- **Tehty 16.10.2026:** `claude/siirto/tools/asetus-tila.mjs` (+ testi, 6/6): lue/aseta/peri/siivoa, avain `state/istunnot/<tunnus>/<nimi>.txt`, yhteinen tiedosto oletuksena. Kytketty: `pakkaa-alku.mjs`, `pakkaa-loppu.mjs`, `Infra/hooks/pysahdys-vahti.py` (+ testi). `/sa` on jo istuntokohtainen (cron istunnon muistissa; tila luetaan transkriptista `lahteet.mjs:126`).

- **Tehty 16.10.2026 (2):** `rd-trigger.sh` (r&d2-repo 6da78ad, hook asennettu), `pura-faktat`/`pakkaa-loppu` jata+nouda+siivoa, palvelun reitit (GET/POST `/api/skoopit/<nimi>/asetukset`, `?istunto=`, 409 jos ei yhtä avointa), iOS-kytkimet (Malli/Asiakas/Nakymat) ja taito-ohjeet; `asetus-tila.mjs` komentorivi (`lue|aseta`). Testit: asetus-tila 8/8, pakkaus/purku 63/63, palvelu 125/125, rd-trigger 49/49, simulaattori `testPakkaaIlmanIstuntoaLukittu` läpi vanhaa palvelua vastaan (paluu yhteisiin kytkimiin). Uutta palvelua vasten todentamatta.

- **Käyttöönotto 16.10.2026:** palvelu käynnistetty uudelleen uudella koodilla (käyttäjä valitsi "käynnistä nyt"); `/api/skoopit/<nimi>/asetukset` vastaa oikealla palvelulla (yksi avoin istunto valittu itsestään); simulaattoritesti `testPakkaaIlmanIstuntoaLukittu` läpi uutta palvelua vasten. Käyttäjän äpissä 16.10.2026 09:48 tekemä autopack-pois oli vielä yhteinen kytkin (palvelun loki).

- **16.10.2026:** Käyttäjä 16.10.2026: tarkoitus infran asetukset Scopes-äpissä; raja näkymä ja sen rajapinta.

- **16.10.2026:** Käyttäjä 16.10.2026: keskustelukohtaiset asetukset avaimena istunnon tunnus; uusi keskustelu perii yhteisen oletuksen. Päätös täydennettiin: pakkaus jättää arvot skoopin nimellä seuraavalle `/pura`-istunnolle (jata/nouda), koska pakkaus vaihtaa istunnon tunnuksen. Hylätty: pelkkä skoopin nimi avaimena.

- **16.10.2026:** Käyttäjä 16.10.2026: palvelun uudelleenkäynnistys heti.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Automaattijatko ja autopack keskustelukohtaisiksi | valmis ja käytössä 16.10.2026 **16.10.2026:** yhteiset kytkimet: käyttäjä kytki autopackin pois äpistä 16.10.2026 klo 09.48 (`~/.local/state/scopes-toiminnot.loki`). (todenna viim. 30.10.2026) | todennus käytännössä: autopack-pakkaus ja `/pura` siirtävät arvon (jata/nouda) ensimmäisellä oikealla pakkauksella |
| Herätys (`/sa`) | jo keskustelukohtainen (cron istunnon muistissa, tila transkriptista) **16.10.2026:** todettu: `/sa` oli jo keskustelukohtainen; cron istunnon muistissa, tila luetaan transkriptista (`scopes/palvelu/lahteet.mjs:126`), äpin `/sa` lähtee istunnolle nimellä (`toiminnot.mjs:249`). | ei toimenpiteitä; todennus oikealla äpillä jää |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/infra/setting/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
