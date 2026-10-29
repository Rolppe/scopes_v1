# scopes toteutussuunnitelma — esitiedot

Kirjattu 19.10.2026 `scopes macos` -keskustelusta käyttäjän pyynnöstä. Suunnitelman tekee Fable; tämä tiedosto on sen lähtöaineisto, ei suunnitelma.

## Lähtötilanne

`scopes/architecture/SUUNNITELMA.md` ulottuu pakettitasolle (ARK-01…ARK-15: skooppi, polut, sisältö, mitattava hyväksyntä, riippuvuudet). Toteutussuunnitelmaa varten siitä puuttuu:

- tehtävätaso (Task / Files / Contract / Do / Acceptance; macOS-skoopin pohja `scopes/macos/SUUNNITELMA.md:140`)
- sopimusten tarkat muodot: `/api/virta`-tapahtuman ja `/api/tila/*`:n JSON, SQLite-skeema (vain taulujen nimet), `since`-vastaus
- paketeissa auki jätetyt päätökset: ARK-08 UniFFI vai `127.0.0.1`-API (luku 10 suosittaa API:a ensin), ARK-10 kehys, ARK-12 tuonnin rooli
- ajettavat gate-komennot: hyväksyntäehdot ovat mittareita, eivät komentoja
- ARK-04 ei mainitse Apple-kohteita (iOS/macOS-target, XCFramework), vaikka ARK-08 ajaa ytimen äpin sisällä

Tila 19.10.2026: `scopes/ydin/` puuttuu; Rust-työkaluketjua ei ole palvelimella eikä Macilla; paketteja ei ole jaettu omistajille (`scopes/architecture/REKISTERI.md` SEURAAVA = ARCHITECTURE-JAKELU).

## Kerättävät esitiedot

| E | Aihe | Mitä selvitetään | Lähde |
|---|---|---|---|
| E-1 | Aliagenttien keinot | Mallin valinta per ajo, taustalla ajo, rinnakkaiset kutsut, worktree-eristys, raportin palautus ja valvojan seurantakeinot | Agent-työkalu, `.claude/agents/*.md` |
| E-2 | Mallien mitattu suoriutuminen | Onnistumisprosentti, tokenit ja hinta mallin (Sonnet, Haiku, Opus, Fable) ja tehtävätyypin mukaan | `claude/siirto/mittaukset/ajajat.jsonl`, `vaihevirheet.jsonl`, `claude/subagents/SAANTO.md` |
| E-3 | Resurssirajat | palvelimen suoritin ja muisti (Rust-käännös puhelimella), yksi Mac (Xcode, simulaattori), portti 8787; mitä voi ajaa samanaikaisesti | mittaus |
| E-4 | Pakettien riippuvuudet | ARK-01…15:n riippuvuusgraafi, kriittinen polku ja rinnakkain ajettavat haarat | `scopes/architecture/SUUNNITELMA.md` luku 9 |
| E-5 | Gate-komennot | Mitkä ajettavat tarkistukset ovat jo olemassa skoopeittain ja mitkä puuttuvat | skooppien rekisterit ja testiskriptit |
| E-6 | Ihmistä vaativat vaiheet | Rust-työkaluketjun asennus (palvelin, Mac), hubin WG-komennot, Macin oikeudet ja muut käyttäjän komennot | ARK-04, ARK-14, `scopes/architecture/REKISTERI.md` |

## Periaatteet

Käyttäjä 19.10.2026:

- Roolit: valvoja Opus (delegoi, seuraa etenemistä, tarkistaa tulokset); päätoteuttajat Opus ja Sonnet; aliagentit Sonnet ja Haiku.
- Suunnitelma kertoo, mikä osa toteutetaan milläkin mallilla; mallit käytetään taloudellisesti ja tehokkaasti.
- Suunnitelma tunnistaa toisistaan riippumattomat tehtävät ja ajattaa ne samanaikaisesti. Riippumattomia ne ovat, kun ne eivät tarvitse toistensa tuloksia, eivät muokkaa samoja tiedostoja eivätkä varaa samaa resurssia (E-3, E-4).
- Toteutus ei käytä rd-taitoa: suunnittelija suunnittelee orkestroinnin itse.

Ehdotettu (`scopes macos`, 19.10.2026), suunnittelija päättää:

- Sopimukset ensin: API-, JSON- ja SQLite-skeemat lukitaan vahvalla mallilla ennen kuin halvemmat mallit toteuttavat niitä vasten.
- Jokaisella tehtävällä on ajettava hyväksyntäkomento; valvoja ajaa sen itse eikä pidä raporttia todisteena.
- Haiku vain koneellisesti tarkistuviin tehtäviin ja pilottimittauksen jälkeen (Haiku-pura 48 % 6/6, n=29; V-246 tyhjä raportti; `claude/subagents/SAANTO.md:10`).
- Committoi vain pääistunto.
- Kustannuskatto vaiheittain; tokenit ja onnistuminen kirjataan per tehtävä.
- Ihmisen vaiheet kriittiselle polulle ajoissa (E-6).
- Raja: `scopes architecture` päättää, mitä tehdään; tämä skooppi päättää, miten, kuka ja missä järjestyksessä. Omistajien rekistereihin kirjataan vain pyynnöstä (TYOTAVAT 15).
