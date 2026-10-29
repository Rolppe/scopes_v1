# scopes/siirto/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — V-424 kuitattu ja V-440 korjattu 15.10.2026; skoopissa ei heti ajettavaa työtä (avoimet V-265/V-296/V-298 kuuluvat scopes viat -skooppiin)

## Tarkoitus ja raja

Scopes-äpin siirtotoiminnot puhelimesta (käyttäjä 14.10.2026): pura, pakkaa, automaattisiirto, välimuistin herätys (`/sa`, `/sa pois`) ja uusi skooppi. Lisäksi niiden jono ja turvamalli "vain valmiit toiminnot" (`scopes/REKISTERI.md`, 13.10.2026).

Raja: skooppi omistaa tiedostot `scopes/palvelu/toiminnot*.mjs` kokonaan. Swift-näkymät, joissa napit ovat (Nakymat.swift, Malli.swift → scopes infra; Viestit.swift → scopes chat), pysyvät omistajillaan, ja niistä lähtee muutosilmoitus. Skooppi korvaa skoopin `scopes hallinta`, joka yhdistettiin tähän ja suljettiin 14.10.2026.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes siirto` luotiin komennolla `/pura uusi scopes siirto`.
- **Käyttäjä 14.10.2026 (SIIRTO-MAARITTELY):** tarkoitus on "Siirtotoiminnot äpissä". Hylätyt vaihtoehdot: Scopes omaan GitHub-repoon ja palvelun siirto toiselle koneelle.
- **Käyttäjä 14.10.2026:** raja on "Koko toiminnot.mjs tänne". Hylätyt vaihtoehdot: tiedoston jako kahtia (jono on yhteinen) ja pelkkä käsitteellinen omistus, jonka polkuportti hylkäisi (V-268). `scopes hallinta` yhdistettiin tähän: sen rekisteri poistettiin, ja skoopit.json, reitittimen skooppilista ja polkukartta sekä references/scopes.md päivitettiin. Hallinnalla oli vain tarkoitusrivi ja kolme tiedoksi-viiteriviä, ei avointa työtä.
- **Käyttäjä 14.10.2026:** ensimmäinen työ oli "Jono levylle". Hylätyt vaihtoehdot: automaattisiirron puhelintodennuksen siirto chatilta ja Pura-reunatapaus. Toteutus: jono kirjoitetaan jokaisen muutoksen jälkeen tiedostoon `scopes-toiminnot-jono.json` toimintolokin viereen (tmp + rename) ja luetaan käynnistyksessä. Levyltä otetaan vain rivi, jonka komento on jonotettava (`/sa`, `/sa pois`, `/automaattisiirto`). Rikkinäinen tiedosto tarkoittaa tyhjää jonoa. Polku johdetaan toimintolokista, jotta palvelin.mjs:ää (scopes yhteys, likainen toisen keskustelun työstä) ei tarvinnut muuttaa; asetus `toimintojono` ohittaa sen.

- **14.10.2026:** Käyttäjä 14.10.2026 (pakkaus): seuraava paketti SIIRTO-JONO-ASENNUS.

- **14.10.2026:** Käyttäjä 14.10.2026: kytkimiä on kaksi erillistä (ei yksi yhteinen eikä vain toinen). Hylätyt vaihtoehdot: vain autopack, vain automaattivalinta, yksi kytkin molemmille.

- **14.10.2026:** Käyttäjä 14.10.2026: muutokset tehtiin tässä keskustelussa omina osina, ei vain /vika-kirjauksina omistajille.

- **14.10.2026:** Käyttäjä 14.10.2026: palvelu käynnistettiin uudelleen heti.

- **14.10.2026:** Asennus skoopin paketista tehdään HEAD-worktreestä, kun työpuussa on toisen keskustelun keskeneräisiä scopes/ios-muutoksia (asenna.sh vie skriptin oman hakemiston lähteet, joten worktreen asenna.sh asentaa HEADin).

- **14.10.2026:** Käyttäjä valitsi 14.10.2026 seuraavaksi paketiksi SIIRTO-PURA-PAINIKE: scopes chat -rekisterin rivi (scopes/chat/REKISTERI.md:71, Pura-painike automaattisiirron aikana) otetaan tämän skoopin työksi.

- **14.10.2026:** Käyttäjä 14.10.2026: palvelu käynnistetään uudelleen (tarpeeton, jo käynnistynyt korjauksen jälkeen).

- **14.10.2026:** Käyttäjä 14.10.2026: seuraavaksi "Ei seuraavaa pakettia — pakkaa vain"; sessiota ei vaihdeta.

- **15.10.2026:** V-440 korjattiin tässä scopes siirto -keskustelussa käyttäjän suoralla pyynnöllä, vaikka tiedosto kuuluu claude siirrolle; omistajalle tiedoksi V-475.

- **15.10.2026:** Hylätty V-440:n vaihtoehto "skripti tulostaa raportin ja kysymyksen, malli saa vain vastauksen": isompi muutos; kopioitava lohko riittää ensin, T5-uusinta näyttää.

- **15.10.2026:** Autojatko ei aloittanut työtä: SEURAAVA = ei mitään, ei heti ajettavaa AVOIMET-riviä, 0 käyttäjää odottavaa riviä. Pysähdys PushNotification + AskUserQuestion; käyttäjä hylkäsi kysymyksen ja pyysi `/pakkaa`.

- **15.10.2026:** Ei uusia päätöksiä; seuraava paketti pysyy HEADin rivinä.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| PURA-MALLITON T5 qwen3.5:9b-uusinta | odottaa skooppia context purascript (Mac ollama) | ei tämän skoopin |

## Viat

| Vika | Tila |
|---|---|
| V-265 → scopes viat (oli scopes hallinta) | tiedoksi |
| V-296 → scopes viat (oli scopes hallinta) | tiedoksi |
| V-298 → scopes viat (oli scopes hallinta) | tiedoksi |

## Historia

Historia: `scopes/siirto/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
