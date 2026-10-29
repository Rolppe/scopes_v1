# scopes/context/pakkaascripti/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: CONTEXT-PAKKAASCRIPTI-VALIVAIHE-SUUNNITELMA — suunnittele E3-Sonnet-välivaihe SUUNNITELMA.md:hen: sivuistunto tekee koko pakkauksen, pääistunto ei harkitse pakkausta lainkaan, laukaisu L1, ajotapa A2 taustalla; ratkaise, mistä sivuistunto saa loput noin 45 % (M13, M12: harkinta ei ole transkriptissa) — polut: scopes/context/pakkaascripti/** — aloitus: /pura scopes context pakkaascripti

## Tarkoitus ja raja

Mallivapaa pakkaus, purascriptin (`scopes/context/purascript/`) vastinpari: skripti tekee pakkauksen mekaaniset osat (synkka, rekisterin päiväys, HISTORIA, commit, push) ilman Sonnet-aliagenttia, ja malli kirjoittaa vain sisällön eli pakkausmuistion. Raja: koko scopes/-perhe (sama kuin pura-malliton.mjs:llä); muut skoopit pakataan nykyisellä tavalla.

## Päätökset

- **Käyttäjä 15.10.2026:** skooppi `scopes context pakkaascripti` luotiin komennolla `/pura uusi scopes context pakkaascripti`.
- **Käyttäjä 15.10.2026 (CONTEXT-PAKKAASCRIPTI-MAARITTELY):** tarkoitus on mallivapaa pakkaus (hylätty: nykyisen pakkauksen keventäminen). Raja on koko scopes-perhe (hylätty: ensin vain scopes context; kaikki skoopit). Ensimmäinen työ on mittaus ja suunnitelma ilman koodimuutoksia (hylätty: suoraan prototyyppi).

- **15.10.2026:** Käyttäjä 15.10.2026: R:n kustannus arvioitava ensin nykyiseen verrattuna, ja käyttöönotto ratkaistaan vasta R:n hyödyn jälkeen. Tulos: R tasoissa, ei säästöä.

- **15.10.2026:** Käyttäjä 15.10.2026: ehdotti R:n tilalle hybridiä, jossa rekisteri kirjoitetaan ajon aikana skriptillä ja Haikulla. Seuraavaksi valittiin Haiku-toistomittaus (hylätyt: tarkistuspisteiden suunnittelu ensin, pakkaus tähän).

- **16.10.2026:** Käyttäjä 16.10.2026: tarkistuspisteen laukaisu L1 paketti valmis (hylätyt: commit, joka vuoro).

- **16.10.2026:** Käyttäjä 16.10.2026: erän lähde ei vielä päätetty; käyttäjä ehdotti E3:a (rinnakkainen Haiku-istunto, jolle skripti syöttää pääkeskustelun viestit) ja valitsi mittauksen ensin (M8), sitten E3 rekisterillä (M9).

- **16.10.2026:** Käyttäjä 16.10.2026: Haikulle pitää antaa oikea konteksti keskustelun alussa; tutkittava virheiden syy, saako Haiku saman purkutiedon ja tarvitseeko se oman rekisterin (vastaus M10). Valinta: mitataan molemmat kirjanpidot, V4a juokseva muistio ja V4b elävä rekisteri (M11; hylätyt: vain toinen, mietitään).

- **16.10.2026:** Käyttäjä 16.10.2026: ajotapa (etuala vai tausta) päätetään myöhemmin.

- **16.10.2026:** Käyttäjä 16.10.2026 (M11:n jälkeen): erän lähde on E1, eli pääistunto kirjoittaa erän muistion paketin valmistuessa (hylätyt: hybridin hylkäys, E3:n lisämittaus). Peruste: M8–M11, E3 jää 15–19/33:een, koska pääistunnon harkinta puuttuu syötteestä.

- **16.10.2026:** Käyttäjä 16.10.2026: ajotapaa ei valittu. Viesti "A2 taustalla" oli äpin virhe (V-514 → scopes chat), ei käyttäjän valinta.

- **16.10.2026:** Käyttäjä 16.10.2026: uusi hybridiratkaisu tehdään; se on päätetty eikä enää harkinnassa. Sitä ei kyseenalaisteta, ellei löydy keinoa saada se toimimaan täysin skriptipohjaisesti. Pääistunto ei kirjoita mitään ylimääräistä, koska se hidastaa ja nostaa hintaa merkittävästi (E1:n erämuistio putoaa pois). Ensin tehdään välivaihe Sonnetilla. Pelkkä CLI-istunto (Remote Control korvataan omilla ratkaisuilla) on iso kysymys ja suunnitellaan kunnolla; ensimmäinen vaihe on CLI-istunnon esitietojen mittaus (M12).
- **16.10.2026:** Käyttäjä 16.10.2026 (M12:n jälkeen): Sonnet-välivaihe on E3 Sonnetilla, eli rinnakkainen istunto ajetaan Sonnetilla Haikun sijaan samalla transkriptisyötteellä (hylätty: Sonnet pakkaushetkellä). Mitataan M8–M11:n aineistolla (M13).
- **16.10.2026:** Käyttäjä 16.10.2026 (M13:n jälkeen): pääistunto ei harkitse pakkausta lainkaan, vaan koko pakkaus tapahtuu sivuistunnossa (hylätyt: muistio vain puuttuvista, täysi muistio jonka skripti karsii). Ajotapa A2 taustalla (hylätty: A1 etualalla).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Hybridin tarkistuspisteet | kesken (päätetty toteuttaa 16.10.2026 (laukaisu L1; pääistunto ei kirjoita ylimääräistä, joten E1 pois; M8–M11: E3 50–58 %, puute on pääistunnon harkinta; M12: harkintateksti tallentuu vain noin 9 %:iin lohkoista sekä Remote Control- että tavallisessa CLI-istunnossa, joten CLI-vaihto ei tuo harkintaa näkyviin; ajotapa A2); M13 valmis (V5 Sonnet 18/33 vs V3 19/33, 0,045 $/erä, ylituotanto pienempi); käyttäjä 16.10.2026: koko pakkaus sivuistunnossa (Sonnet-välivaihe E3), pääistunto ei harkitse pakkausta, ajotapa A2 taustalla) | suunnittele välivaihe, jossa sivuistunto (Sonnet) tekee koko pakkauksen, ja ratkaise, mistä sivuistunto saa loput noin 45 % (SUUNNITELMA.md M13, linjaus 16.10.2026) |
| claude -p:n kiinteä ~48 k:n kulu per kutsu | avoin (E3-reitillä tulee välimuistista: M8 ~37 k cache_read, ~0,0005 $; Sonnet-reitillä M13: 1. erä kirjoitti 47 k välimuistiin, s1 era1 0,20 $) **16.10.2026:** E3 toimii nykyisellä CLI:llä (claude --help): `claude -p --session-id <uuid>` ja tarkistuspisteessä `--resume <uuid>`; M8 (usage.jsonl, tarkistettu pääistunnossa): V1 22 erää 0,054 $, V2 0,081 $; total_cost_usd on istunnossa kumulatiivinen, summa viimeisistä kutsuista. Kiinteä ~37 k kehote tulee välimuistista jo ensimmäisellä kutsulla. | ratkeaa erän lähteen valinnan mukana; huomioi välivaiheen suunnittelussa |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/context/pakkaascripti/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
