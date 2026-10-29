# scopes/palvelin/REKISTERI.md

Tilanne: 17.10.2026

SEURAAVA PAKETTI: palvelin-MALLIYHTEYS — korjaa palvelimen yhteys paikallisille malleille: ssh-tunneli (11235) ja lm-valitys (11234) luotettavaksi ja automaattisesti palautuvaksi palvelimen sammutuksen/uudelleenkäynnistyksen jälkeen — polut: scopes/palvelin/**, claude/siirto/tools/lm-valitys.mjs — aloitus: /pura scopes palvelin

## Tarkoitus ja raja

**Tarkoitus:** Scopes-äpin pääskooppi palvelimeen liittyvissä asioissa (käyttäjä 17.10.2026).

**Raja:**
- Sisällä: palvelimen tila ja hallinta Scopes-äpissä (yhteys, SSH-tunnelit, LM Studio -mallipalvelin ja sen paikallisten mallien välitys, virranhallinta / WoL / sammutus, palvelimen tilatieto).
- Ulkona: Scopes-äpin käyttöliittymä (`scopes ios`, `scopes macos`), yleinen mallikäsittely (`scopes models`) ja palvelun muu sovelluslogiikka (`scopes palvelu`). Muutokset näihin kirjataan omistajalle `/vika <skooppi> …` (TYÖTAVAT sääntö 15).

## Päätökset

- **Käyttäjä 17.10.2026:** skooppi `scopes palvelin` luotiin komennolla `/pura uusi scopes palvelin`.
- **Käyttäjä 17.10.2026:** skoopin rooli on olla Scopes-äpin pääskooppi palvelimeen liittyvissä asioissa.
- **Käyttäjä 17.10.2026:** ensimmäinen tehtävä on korjata palvelin-yhteys paikallisille malleille, jotka eivät toimi nyt (paketti palvelin-MALLIYHTEYS).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikallisten mallien yhteys katkennut (11235 ECONNREFUSED) | todennettu laitteelta | paketti palvelin-MALLIYHTEYS |

## Viat

| Vika | Tila |
|---|---|
| SSH-tunneli 11235 kaatunut palvelimen sammutuksen jälkeen → lm-valitys 11234 palauttaa 502 | avoin (juurisyy todennettu) |

## Historia

Historia: `scopes/palvelin/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
