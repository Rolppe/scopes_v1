# scopes/infra/aidin/REKISTERI.md

Tilanne: 26.10.2026

SEURAAVA PAKETTI: INFRA-AIDIN-ILPPI-OHJAIN — Bosch Climate 6100i -ilmalämpöpumpun mikrokontrollerin ja kytkennän (ESP8266/D1 mini, tasonmuunnin, suotokondensaattori, JST PAP-08V-S) valinta ja ESPHome-konfiguraatio — polut: scopes/infra/aidin/**, Infra/iot/bosch-6100i/** — aloitus: /pura scopes infra aidin

## Tarkoitus ja raja

Tarkoitus: Äidin kodin ja verkon infrastruktuuri, laitteet (mm. Bosch Climate 6100i -ilmalämpöpumpun ohjaus, Home Assistant Pi 3B, ZTE MF286A, Zigbee2MQTT, etäyhteydet) ja niiden ylläpito.

Raja: Äidin laitteiden konfiguraatiot, mikrokontrollerit ja ESPHome-ohjaimet, ylläpitoskriptit ja etäyhteydet. Ei koske omaa koti-infraa eikä yleistä Scopes-sovelluskoodia.

## Päätökset

- **Käyttäjä 26.10.2026:** skooppi `scopes infra aidin` luotiin komennolla `/pura uusi scopes infra aidin`.
- **Käyttäjä 26.10.2026:** ensimmäinen tehtävä on selvittää mikä mikrokontrolleri oli paras vaihtoehto äidin ilmalämpöpumpun ohjauksessa.
- **Päätös 16.9.2026 (Infra):** ESP32 hylätty kaikkine variantteineen ("ei ole riittävän vähävirtainen" pumpun omalle 5 V -linjalle). Ohjaus ei IR:llä, vaan UART-väylästä (`sven819/SharpClimateUART-ESPHome`, 9600 baud, EVEN, 5 V logiikka → tasonmuunnin pakollinen; liitin JST PAP-08V-S).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| [infra aidin] Bosch Climate 6100i mikrokontrollerin ja kytkennän valinta (kirjattu 26.10.2026) | Selvitetty: ESP8266 (D1 mini) paras ESPHome-vaihtoehto virrankulutukseltaan (~80 mA avg, ~170 mA TX); vaatii tasonmuuntimen, 470–1000 µF kondensaattorin ja matalan TX-tehon | paketti INFRA-AIDIN-ILPPI-OHJAIN |
| [infra aidin] Bosch 6100i WLAN-moduulipaikka (kirjattu 26.10.2026) | Odottaa käyttäjää | Kysy käyttääkö äiti HomeCom Easy -sovellusta ja onko PAP-08V-S vapaana (kuva kannen alta) |
| [infra aidin] Bosch 6100i protokollariski (kirjattu 26.10.2026) | Avoin (upstream issue #10, issue #2 jännitteen putoaminen) | Asenna ensin vain kuuntelevana (laitteen TX → ESP RX) |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/infra/aidin/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
