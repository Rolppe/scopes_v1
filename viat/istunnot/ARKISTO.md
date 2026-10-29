# scopes viat istunnot — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 28.10.2026 — scopes viat istunnot

### Päätökset — poistettu tai muutettu

- **Käyttäjä 28.10.2026:** skooppi `scopes viat istunnot` luotiin komennolla `/pura uusi scopes viat istunnot`.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Raja ja ensimmäinen paketti | käyttäjä antoi viat VI-1–VI-5 ja vahvisti rajan 28.10.2026; VI-4 todennettu, VI-1/2/3/5 korjattu palvelimella (bb1e4221, ed1249aa) | käyttäjän havainto äpissä; korjauskoodi `scopes/palvelu/toiminnot.mjs` kirjataan omistajalle (`/vika`, käyttäjän komento) |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| VI-1 Kaikki macos claude -skoopit eivät näy Scopes-äpissä | avoin 28.10.2026 (käyttäjä). Kartoitus: palvelu palauttaa kaikki 113 skooppia; Macilla ajettavia Claude-istuntoja ei etsitä lainkaan (vain agy `ssh`-ruudut, `agy-istunto.mjs:224`; Claude-istunnot vain paikallisesta `~/.claude/sessions`, `lahteet.mjs:200`), joten Macin Claude-skoopit näkyvät harmaina pakattuina ilman istuntoja |
| VI-2 Äpin listanäkymän kansioiden värit eivät pidä paikkaansa, ja niiden tiloissa on epäloogisia muutoksia | korjattu palvelimella 28.10.2026, odottaa käyttäjän havaintoa. Syy (kartoitus): skoopin tila lasketaan yhdestä 5 s välein haetusta tilannekuvasta (`scopes/palvelu/lahteet.mjs` skooppiTila, agy-ruudun jäsennys `agy-istunto.mjs` jasennaAgyRuutu), joten käsittely ↔ odottaa välkkyi. Korjaus: `vakautaTila` (lahteet.mjs), käsittelystä odotukseen vasta 20 s ilman käsittelyä. Jäljellä äpin puolella: `Sivupalkki.swift:6` kommentti sanoo odottaa = keltainen, koodi vihreä |
| VI-3 Äppi lähettää ilmoituksen "keskustelu odottaa sinua", vaikka istunto ei odota (ainakin agy-istunnoissa) | korjattu palvelimella 28.10.2026, odottaa käyttäjän havaintoa. Syy: äppi ilmoittaa yhdestä siirtymästä ei-odottaa → odottaa (`scopes/ios/Sources/Ilmoitukset.swift:79`), ja agy-ruudun työkalukutsujen väli näytti vapaalta; lisäksi mikä tahansa ruudun "1. Yes" -rivi luettiin lupakyselyksi. Korjaus: sama `vakautaTila` + "1. Yes" vain 12 alimmalla rivillä. Ei toistettu lokista (ilmoitusloki ei kirjaudu palvelimelle) |
| VI-4 Istunnon sulkeminen pakkaamatta ei toimi oikein; käyttäjän vaatimus: toteutetaan kokonaan äpissä, ilman LLM-mallia | avoin 28.10.2026 (käyttäjä); toistettu lokeista: `infra expresso` 27.10. klo 5.30 ja 10.54 `sulje` 200 kahdesti, välissä `pura` 409 (istunto jäi henkiin; scopes-pyynnot.loki, scopes-app.loki). Syy: `scopes/palvelu/toiminnot.mjs:380` `sulje` kirjoittaa ruutuun Escape + `/exit` (toimii vain, jos ruudun ohjelma on vapaana ja tuntee `/exit`in; agy:n osalta tarkistamatta) eikä tarkista, päättyikö prosessi. Korjattu (käyttäjä valitsi 28.10.2026: tapa tmux-ruutu suoraan): `sulje` ajaa `tmux kill-pane` ja tarkistaa, että ruutu on poissa, muuten 502; testit 32/32. Oma vika 4d45f4aa:ssa: tarkistus `tmux display-message -t` palauttaa 0:n myös puuttuvalle kohteelle, joten jokainen sulkeminen sai 502:n, vaikka ruutu katosi (`scopes remoteterminal` 28.10. klo 9.13, 502). Korjattu: tarkistus `tmux list-panes -a`, enintään 20 × 250 ms; testit 33/33, koeajo oikeaa tmuxia vasten ok 116 ms. **Todennettu äpistä 28.10.2026 klo 9.36:** `scopes viat scene1` sulje 200 (399 ms), ruutu siirto-scopes-viat-scene1-232156 poissa tmuxista |
| VI-5 Listanäkymän aktiivisten skooppien paikat vaihtuvat liian usein; liikettä on hidastettava, koska turha paikanvaihto sekoittaa käyttäjän muistin siitä, mitä hän oli tekemässä | korjattu palvelimella 28.10.2026, odottaa käyttäjän havaintoa. Syy: äppi järjestää tason (käsittely/kysely, odottaa, pakattu) ja ajan mukaan (`Sivupalkki.swift:102`); tilan välkkyminen vaihtoi tasoa ja rekisterin mtime nosti aikaa työn aikana. Korjaus: `vakautaTila` pitää aktiivisen skoopin ajan aktivoitumisen hetkessä |

### Historia — poistettu tai muutettu

Historia: `scopes/viat/istunnot/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.

### Viat — valmis

| Vika | Tila |
|---|---|
| VI-4 Istunnon sulkeminen pakkaamatta ei toimi oikein; toteutus ilman LLM-mallia | todennettu 28.10.2026 (61b1b45c; äpistä klo 9.36 `scopes viat scene1` sulje 200, 399 ms, ruutu poissa). `sulje` ajaa `tmux kill-pane` ja tarkistaa `tmux list-panes -a`:lla (20 × 250 ms), muuten 502. Oma vika 4d45f4aa:ssa (`display-message` exit 0 puuttuvalle ruudulle → 502) korjattu 61b1b45c |
