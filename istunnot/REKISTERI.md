# scopes/istunnot/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ei mitään — näkyvyyskorjaus tuotannossa (palvelin db4506e2+, todennettu /api/skoopit 28.10.2026); jäljellä katon summa (odottaa käyttäjää) ja automaattisiirron ruuduton reitti (omistaja scopes siirto automaattisiirto)

## Tarkoitus ja raja

Scopes-äpin kehitysistuntojen elinkaari, hallinta, tarkistus ja luotettavuus (käyttäjä 17.10.2026: "Tässä skoopissa keskitytään scopes äpin kehitysistuntoihin").

Raja:
- Omistaa: kehitysistuntojen havaitseminen, tilan seuranta, ruutujen hallinta ja suorituskyky (`scopes/palvelu/agy-istunto.mjs`, istuntojen tarkistus ja elinkaarilogiikka).
- Yhteistyö: toiminnot.mjs ja autovaihto.sh omistajien kanssa istuntojen avaamis- ja sulkemislogiikassa (duplikaattien esto, V-554).

## Päätökset

- **Käyttäjä 17.10.2026:** skooppi `scopes istunnot` luotiin komennolla `/pura uusi scopes istunnot`.
- **Käyttäjä 17.10.2026:** skoopin tarkoitus on Scopes-äpin kehitysistuntojen hallinta ja tarkistus.
- **Käyttäjä 17.10.2026:** suljettiin orpo duplikaatti-istunto `siirto-scopes-agy-siirto-162536` ja kirjattiin virheraportti V-554 skoopin `scopes viat` jonoon duplikaatti-istuntojen estämiseksi.
- **Käyttäjä 17.10.2026:** suljettiin kaikki pakatut (2 kpl) ja vanhat passiiviset (16 kpl) istunnot OnePlus-palvelimelta ja Macilta. Avoimeksi jätettiin vain aktiivinen kehitysistunto `scopes istunnot`. `/api/skoopit` vastausaika palautui normaaliksi (~130 ms).

- **17.10.2026:** Kehitetty ja hiottu skoopin scopes istunnot toteutusta Scopes-standardien mukaisesti

- **18.10.2026:** Kehitetty ja hiottu skoopin scopes istunnot toteutusta Scopes-standardien mukaisesti

- **19.10.2026:** Käyttäjä 18.10.2026: Nebius-avain äpin syöttökentästä; ensin avaimen tallennus ja mittaus, sitten istunnot ("scopes istunnot test ... flash 4.1 mallilla ... Laita toimimaan").

- **19.10.2026:** Käyttäjä 18.10.2026: Gemini-kiintiön täytyttyä odotetaan nollautumista (ei skooppien siirtoa muihin malleihin).

- **19.10.2026:** Käyttäjä 19.10.2026: "Sinulla ei ole annettu lupaa käyttää varallisuuttani vapaasti opensource agentteihin" → maksullisiin kutsuihin aina lupa ja katto ensin (muisti paid-api-spend-needs-approval).

- **19.10.2026:** Käyttäjä 19.10.2026: scopes macos jatkuu Claudella; Nebius-muutokset committiin vain omat, äppi asennetaan.

- **19.10.2026:** Nebius-reitti: ssh+curl palvelin → Mac (tunneli hylätty, OnePlus suora yhteys ei toimi).

- **19.10.2026:** Käyttäjä 19.10.2026: "Kaikkeen käyttöön kysytään lupa. Jos aloitetaan tekemään tehtävää missa tullaan tarvitsemaan käyttöä niin tämä kysytään heti tehtävän alussa." → katon oletus 0 $ (fail-closed); kattotiedoston kirjoittaa vain käyttäjän hyväksymä summa. Hylätty: oletus 0,50 $ istunto / 2 $ päivä (kysymys hylättiin).

- **19.10.2026:** Käyttäjä 19.10.2026: välityspalvelin käynnistetään uudelleen katolla 0 $.

- **19.10.2026:** Pahin arvio ennen kutsua (ei kesken virran katkaisua): arvio rajoittaa ylityksen kutsukohtaisesti.

- **19.10.2026:** Käyttäjä 19.10.2026: flash-istunnot pakataan manuaalisesti ("Pakkaan itse Clauden muistioilla").

- **19.10.2026:** Käyttäjä 19.10.2026: "Saat itse päättää kunhan se ei sotke siirto toimintoja tai scopes2 kehitystä" → ratkaisu: ei kosketa Macin työpuun muihin tiedostoihin eikä siirto- tai scopes2-polkuihin, committeihin vain skoopin omat polut.

- **Käyttäjä 27.10.2026:** "Sulje oneplus pyörivät skoopit. Pakkaa ne jos on pakattavaa" → Pakattiin valmiiksi ja todennettiin `scopes remoteterminal` (commit `2fb4da72`) ja `scopes ioskeyboard` (commit `3ca92191`, äppisynkka `e5f96a56`), tallennettiin `scopes agents ds41flash` arkisto/historia (`1f8cc13b`). Todettiin `scopes design organizing`, `scopes viat scene1` ja `scopes siirto git jatka` aiemmin pakatuiksi. Suljettiin kaikki 13 OnePlus-palvelimella suoraan pyörinyttä istuntoa (7 agy- ja 6 vanhaa/passiivista claude-istuntoa). Jätettiin vain aktiiviset Mac-istunnot ja rc.

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **Käyttäjä 28.10.2026:** "claude äpissä näkyvät skooppi istunnot eivät näy scopes äpissä. tämä on virhe. korjaa se." → Syyt: (1) `projektiNimi` (lahteet.mjs) ja MAC_SKRIPTI (mac-claude.mjs) muuttivat vain `/ _ .` viivaksi, mutta Claude Code muuttaa kaikki muut kuin kirjaimet ja numerot; Claude-äpin cwd `~/Library/Application Support/Claude/scratch-workspaces/…` sisältää välilyönnin, joten transkriptia ei löytynyt ja skooppi jäi null. (2) MAC_SKRIPTI luki vain viimeiset 400 kt, jolloin ensimmäisen rivin `/pura`-komento putosi pois yli 400 kt:n transkripteista (Claude-äpin istunnot 1–1,8 Mt). Korjaus: `[^A-Za-z0-9]` → `-` molemmissa; MAC_SKRIPTI lukee alusta 64 kt kokonaisina riveinä ja lopusta 400 kt. Todennettu Macilla: 4/4 elävää istuntoa skooppiin (ennen 0/4). Tiedostojen omistajat `scopes infra` (lahteet.mjs) ja `scopes` (mac-claude.mjs): muutos käyttäjän pyynnöstä, rekisterit koskematta (sääntö 15).
- **Käyttäjä 28.10.2026:** "ota käyttöön automaattisiirto ja automaattijatko" → kytketty tälle istunnolle (`asetus-tila.mjs aseta … true`, state/istunnot/89e3e5e8…); jaetut oletukset olivat jo true. Rajoite: automaattisiirron vahti (toiminnot.mjs) ohittaa istunnot, joilla ei ole tmux-ruutua, eikä katso Macin istuntoja, joten Claude-äpin istunnoille se ei laukea — kirjattava omistajalle `scopes siirto automaattisiirto`.

- **Käyttäjä 28.10.2026:** "Kyllä, vie palvelimelle" → Mac: rebase --autostash + push (db4506e2). palvelin (~/palvelin): rebase --autostash (oma pushaamaton commit a0a1a424 mukaan) + push, palvelu käynnistetty uudelleen (kaynnista.sh). Todennettu `/api/skoopit`: scopes istunnot, scopes siirto ja git näyttävät kukin 1 Claude-äpin istunnon (ennen 0).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Macin repossa MAC-17-muutokset yhä committaamattomina (sama sisältö kuin d87b20d3) | avoin 19.10.2026 | Macin synkka pushin jälkeen (muutokset pois työpuusta, sitten pull) |
| Nebius-käytön katon summa (~/.config/scopes/nebius-katto.json) | avoin 19.10.2026; odottaa käyttäjää | käyttäjä antaa summan tehtävän alussa, kun Nebiusta tarvitaan |
| Automaattisiirto ei laukea Claude-äpin (ruuduttomille) eikä Macin istunnoille | avoin 28.10.2026 | `/vika scopes siirto automaattisiirto`: vahti tarvitsee reitin ilman tmux-ruutua |

## Viat

| Vika | Tila |
|---|---|
| V-554 → scopes viat | avoin |
| V-556 → scopes kordinaattori | avoin |
| V-558 → scopes chat | avoin |

## Historia

Historia: `scopes/istunnot/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
