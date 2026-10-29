# scopes/viat/istunnot/REKISTERI.md

Tilanne: 28.10.2026 (pakkaus; palvelin ajaa ed1249aa:ta)

SEURAAVA PAKETTI: VIAT-ISTUNNOT-TODENNUS — käyttäjä havainnoi äpissä VI-1 (Macin Claude-skoopit näkyvät aktiivisina), VI-2 ja VI-5 (värit ja paikat eivät välky), VI-3 (ei väärää "Istunto odottaa sinua"); palvelin ajaa ed1249aa:ta 28.10.2026. Jatko: Macin istuntojen toiminnot äpistä (sulje, pakkaa, viesti) ja Sivupalkki.swift:6 värikommentti — polut: scopes/viat/istunnot/** — aloitus: /pura scopes viat istunnot

## Tarkoitus ja raja

Scopes-äpin istuntonäkymän viat (käyttäjä 28.10.2026, VIAT-ISTUNNOT-MAARITTELY): äpin istuntolista, istuntojen tila ja värit, istunnoista lähtevät ilmoitukset ja istuntojen sulkeminen äpistä.

Raja (käyttäjä vahvisti 28.10.2026):
- Omistaa: alla olevan Viat-taulukon viat, niiden toiston (simulaattori, palvelimen lokit) ja korjausjonon.
- Koodi on muiden skooppien: sivupalkin lista `scopes/ios/Sources/Sivupalkki.swift` (scopes lista), ilmoitukset `scopes/ios/Sources/Ilmoitukset.swift` (scopes notifications), istuntojen elinkaari `scopes/palvelu/agy-istunto.mjs` (scopes istunnot), macOS-äppi `scopes/macos/**` (scopes macos). Korjaus tehdään niiden tiedostoihin käyttäjän pyynnöstä, ja muutos kirjataan omistajalle (TYOTAVAT 15).
- Ei kuulu: viat, jotka eivät näy istuntonäkymässä (kokoaja scopes viat).

## Päätökset

- **Käyttäjä 28.10.2026:** skooppi `scopes viat istunnot` luotiin komennolla `/pura uusi scopes viat istunnot`; tarkoitus Scopes-äpin istuntonäkymän viat, raja vahvistettu (yllä).
- **Käyttäjä 28.10.2026:** VI-4 toteutetaan tappamalla tmux-ruutu suoraan (ei `/exit`), ilman LLM-mallia.
- **Käyttäjä 28.10.2026:** palvelu käynnistetään uudelleen agentin toimesta korjausten käyttöönotossa.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Käyttäjän havainto VI-1, VI-2, VI-3, VI-5 äpissä | avoin; odottaa käyttäjää (käyttäjä vastasi "Jokin ei toimi" 28.10.2026 eikä kertonut mitä) | kysy, mikä näkyy väärin, ja selvitä lokeista ja rajapinnasta |
| Macin Claude-istuntojen toiminnot äpistä (sulje, pakkaa, viesti) | avoin (`mac-claude.mjs` antaa ruutu null; kirjattu 28.10.2026) | toteuta ssh-reitti `toiminnot.mjs`:iin omistajan (scopes siirto) kanssa |
| `Sivupalkki.swift:6` kommentti: odottaa = keltainen, koodi vihreä (kysely keltainen) | avoin (kirjattu 28.10.2026) | korjaa kommentti tai väri käyttäjän päätöksellä (scopes lista) |

## Viat

| Vika | Tila |
|---|---|
| VI-1 Kaikki macos claude -skoopit eivät näy Scopes-äpissä | korjattu ed1249aa 28.10.2026; odottaa käyttäjää (havainto äpissä). Uusi `scopes/palvelu/mac-claude.mjs` hakee Macin elävät Claude-istunnot (`ssh dev-host python3 -`, välimuisti 15 s), skooppi tmux-nimestä `siirto-<slug>-hhmmss`; asetus macClaude, `SCOPES_MAC_CLAUDE=0` pois. Mitattu: 113 skooppia, Macilla 12–13 elävää, 9 skooppiin, koehaku 748 ms |
| VI-2 Äpin listanäkymän kansioiden värit eivät pidä paikkaansa, tiloissa epäloogisia muutoksia | korjattu bb1e4221 28.10.2026; odottaa käyttäjää (havainto äpissä). Syy: tila yhdestä 5 s tilannekuvasta, käsittely ↔ odottaa välkkyi. Korjaus `vakautaTila` (`lahteet.mjs`, TILA_VAKAUS_MS 20 s). Jäljellä äpin puolella: `Sivupalkki.swift:6` kommentti |
| VI-3 Äppi ilmoittaa "keskustelu odottaa sinua", vaikka istunto ei odota (agy) | korjattu bb1e4221 28.10.2026; odottaa käyttäjää (havainto äpissä). Syy: ilmoitus yhdestä siirtymästä ei-odottaa → odottaa (`Ilmoitukset.swift:79`); lisäksi "1. Yes" mistä tahansa ruudun riviltä luettiin lupakyselyksi. Korjaus: `vakautaTila` + "1. Yes" vain 12 alimmalta riviltä (`agy-istunto.mjs`). Ei toistettu lokista (ilmoitusloki pysähtynyt 15.10.) |
| VI-5 Aktiivisten skooppien paikat vaihtuvat liian usein | korjattu bb1e4221 28.10.2026; odottaa käyttäjää (havainto äpissä). Syy: tason ja ajan mukainen järjestys (`Sivupalkki.swift:102`), tilan välkkyminen ja rekisterin mtime. Korjaus: `vakautaTila` pitää aktiivisen skoopin ajan aktivoitumisen hetkessä |

## Historia

Historia: `scopes/viat/istunnot/HISTORIA.md`, ei lueta purussa.
