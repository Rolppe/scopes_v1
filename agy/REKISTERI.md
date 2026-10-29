# scopes/agy/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — skoopin tarkoitus täytetty (agy palautettu ja koeajettu 15.10.2026); skooppi avataan, jos agy:n muisti nousee ongelmaksi tai käyttäjä nostaa uuden agy-työn

## Tarkoitus ja raja

agy:n (Antigravity CLI, `~/.local/bin/agy`) paluu palvelimelle: mitataan, mahtuuko agy muistiin cron-sulun ja zramin jälkeen, ja käyttäjä päättää palautuksesta (käyttäjä 15.10.2026, AGY-MAARITTELY).

Raja: skoopin omat ovat agy:n binäärin tila palvelimella (`agy` / `agy.pois`) ja sen muistimittaukset. Ei kuulu: V-240-pakettien palautus (`pm enable`, `svc nfc`; infra oneplus), palvelimen muu muistityö ONEPLUS-MUISTI (infra oneplus), siirron ajajavalinta `claude/siirto/ajaja.json` (claude siirto; pura ja paketoi ajavat claude-cli:llä, eivät agy:llä), r&d2:n `--engine agy` -reititys (claude r&d2). Infra oneplus -rekisterin "agy pois toistaiseksi" -rivi päivitetään, kun palautus tehdään.

## Päätökset

- **Käyttäjä 15.10.2026:** skooppi `scopes agy` luotiin komennolla `/pura uusi scopes agy`.
- **Käyttäjä 15.10.2026 (AGY-MAARITTELY):** tarkoitus on agy:n paluu palvelimelle (valinta "agyn paluu palvelimelle"; hylätyt: agy-ajajien reititys, agy Macilla tai muualla). Käyttäjä nosti agy:n itse esiin, joten 13.10.2026 "älä ehdota agy-palautusta" -sääntö ei estä tätä skooppia; V-240-palautusta se koskee yhä.
- **Käyttäjä 15.10.2026 (AGY-PALUU):** "Palauta agy nyt" → `mv ~/.local/bin/agy.pois ~/.local/bin/agy` exit 0, `command -v agy` exit 0, `agy --version` 1.2.15 exit 0; MemAvailable 4 830 984 kB ennen, 4 842 516 kB jälkeen. Infra oneplus -rekisterin agy-rivi päivitetty.
- **Käyttäjä 15.10.2026 (AGY-SEURANTA):** "Agentti koeajaa nyt" → `agy -p "Vastaa yhdellä sanalla: mikä on Suomen pääkaupunki?" --model gemini-3.8-flash-medium --output-format json` exit 0, 7 s, vastaus "Helsinki", 12 721 tokenia; 1 s näytteet: agy:n huippu-RSS 418 680 kB (aiempi 117 Mt 12.10. oli alikanta), MemAvailable 4 409 304 kB ennen, min 4 218 964 kB, 4 430 016 kB jälkeen. Muisti riittää: väli 1 Gt:n rajaan ~3,2 Gt. Hylätty: odota r&d2:n agy-ajoa.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| agy:n muisti monikierroksisessa r&d2-ajossa | mittaamatta (yksikierroksinen koeajo: huippu 409 Mt, MemAvailable min 4,12 Gt) | tilatieto, ei ajettava eikä odota ketään: raja-arvo MemAvailable 1 Gt; mittaus otetaan, kun r&d2 ajaa `--engine agy` -ajon |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agy/HISTORIA.md` ei lueta purussa.
