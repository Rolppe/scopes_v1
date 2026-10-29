# scopes/chat/question/REKISTERI.md

Tilanne: 14.10.2026 (CHAT-QUESTION-VAAKA tehty ja todennettu puhelimessa: vaakatilan kysymyskortti; ei avoimia)

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 14.10.2026

## Tarkoitus ja raja

Kysymyskortti: agentin monivalinta (AskUserQuestion) Scopes-äpin chatissa ja skoopin viesteissä.

Raja: kortin näkymä ja vastauksen kokoaminen (`KysymysKortti` tiedostossa `scopes/ios/Sources/Viestit.swift`, `Kysymys`
tiedostossa `Malli.swift`) sekä palvelun kysymysreitti (`scopes/palvelu/viestit.mjs`: `kysymysViesti`, vastatun tunnistus,
`suljeKysymys` ja Escape ennen vastausta `lahetaSkooppiin`issa). Muun tekstichatin (syöttö, renderöinti, claude -p,
tmux-lähetys, stop) omistaa `scopes chat`; liitteet `scopes chat media`.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes chat question` luotiin komennolla `/pura uusi scopes chat question`.
- **Käyttäjä 14.10.2026:** tarkoitus on kysymyskortti (CHAT-QUESTION-MAARITTELY).
- **Käyttäjä 14.10.2026:** ensimmäinen työ: kortissa näkyy yksi kysymys kerrallaan; Claude-tyylinen moniosainen kortti käyttöön.
- **14.10.2026:** moniosainen kortti: yläreunassa ‹ 1/N › ja X; yksivalinta siirtää seuraavaan 0,2 s viiveellä, monivalinta ja
  Muu odottavat Seuraava-nappia; Seuraava ja nuolet ohittavat vastaamatta (ohitettu jää pois vastauksesta); viimeinen
  yksivalinta ei lähetä itse, vaan Lähetä kokoaa kaikki yhdeksi tekstiksi kuten ennen (palvelu ennallaan). Yhden kysymyksen
  kortti ennallaan. Simulaattorikoe ilman palvelua: `SCOPES_KOE_KORTTI=1` (KysymysKoe, Juuri.swift-haara).

- **14.10.2026:** Käyttäjä 14.10.2026: tarkoitus kysymyskortti; ensimmäinen työ yksi kysymys kerrallaan, Claude-tyylinen moniosainen kortti.

- **14.10.2026:** Seuraava ja nuolet ohittavat vastaamatta (ohitettu jää pois vastauksesta); viimeinen yksivalinta ei lähetä itse. Koe kiinteällä kortilla ilman palvelua, koska oikean istunnon kortin napautus lähettäisi vastauksen agentille.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti CHAT-QUESTION-PUHELIN (vahvistettu AskUserQuestionilla).

- **14.10.2026:** Käyttäjä 14.10.2026: moniosainen kysymyskortti todennettu puhelimessa; CHAT-QUESTION-PUHELIN valmis.

- **14.10.2026:** Käyttäjä 14.10.2026 (AskUserQuestion, vastattu puhelimen kortilla): ei seuraavaa pakettia — pakkaa vain.

- **Käyttäjä 14.10.2026:** vaakatilan kysymyskortissa Muu-kenttä alkaa yhdeltä riviltä ja kasvaa vasta kun teksti ei mahdu; lähetysnappi pois vaakatilassa.

- **14.10.2026:** nappi piilotetaan vaakatilassa vain kirjoittaessa (fokus kentässä), koska muuten pelkkiä valintoja ei voi lähettää; rivinvaihto siirtää seuraavaan kysymykseen ja viimeisessä lähettää.

- **Käyttäjä 14.10.2026:** oma näytön näppäimistö tehdään uudessa skoopissa `scopes keyboard` (avataan `/pura uusi scopes keyboard`); vaakanapin lopullinen ratkaisu jää sille.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/chat/question/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
