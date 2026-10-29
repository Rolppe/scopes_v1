# scopes/istunnot/mallit/REKISTERI.md

Tilanne: 18.10.2026

SEURAAVA PAKETTI: ISTUNNOT-MALLIT-TESTIT — UI-testi jumissa-palkille: simuloi busy-tila 45 s ylitys + tarkista viestit-jumissa-palkki näkyy + jumissa-vaihda-malli nappi toimii — polut: scopes/istunnot/mallit/**, scopes/ios/UITests/ — aloitus: /pura scopes istunnot mallit

## Tarkoitus ja raja

Istuntojen mallivalinnat: kun istunto jää jumiin (reagoimaton busy-tila — äppi havaitsee ettei chat vastaa syötteeseen), äppi tarkistaa kaikkien mallien käyttörajat ja tarjoaa chatissa malleja joilla on käyttöä jäljellä. Käyttäjä valitsee mallin → uusi istunto avautuu vanhan chatin jatkoksi.

Raja:
- Omistaa: `JumissaMalliPalkki`-komponentti ja jumissa-havaitsemislogiikka (`SkooppiViestitView`), `scopes/istunnot/mallit/**`.
- Ei omista: `purkajat.mjs` (mallien lista ja tarkistus), `kayttoraja.mjs` (Claude-raja), `agy-kayttoraja.mjs` (AGY-raja), `palvelin.mjs`:n olemassaolevat päätepisteet — näitä käytetään, ei muuteta ilman tarvetta.
- Yhteistyö: `PuraValintaView` (sama mallivalinta- ja purku-UI kuin normaalissa purussa).

## Päätökset

- **Käyttäjä 18.10.2026:** skooppi `scopes istunnot mallit` luotiin komennolla `/pura uusi scopes istunnot mallit`.
- **Käyttäjä 18.10.2026:** skoopin tarkoitus: jumiin jääneen istunnon chat-näkymässä pitää voida valita malli kaikista agy mac, agy oneplus ja claude -malleista, ja tämä avaa uuden istunnon vanhan chatin jatkoksi.
- **Käyttäjä 18.10.2026:** trigger on automaattinen — äppi havaitsee ettei chat reagoi käyttäjän syötteeseen — ei manuaalinen nappi. Äppi tarkistaa käyttörajat ja tarjoaa mallia jolla on käyttöä jäljellä.
- **Käyttäjä 18.10.2026:** iOS ensin.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| UI-testit jumissa-palkille | avoin 18.10.2026 | paketti ISTUNNOT-MALLIT-TESTIT |

## Viat

| Vika | Tila |
|---|---|
| Merge conflict scopes/ios/Sources/PuraValinta.swift rivit 113–124 — korjattu tässä paketissa (molemmat haarat yhdistetty: macAgyMallit + agy-ryhmä) | korjattu 18.10.2026 |

## Historia

Historia: `scopes/istunnot/mallit/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
