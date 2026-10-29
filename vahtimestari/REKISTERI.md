# scopes/vahtimestari/REKISTERI.md

Tilanne: 28.10.2026 (pakkaus 11.10)

SEURAAVA PAKETTI: SCOPES2-VALVONTA-MAC jatkuu — Haiku (--model claude-haiku-5-5): (0) tehty `5a93b96a` (SIIRRÄ-raja 100 k); käynnistä scopes kordinaattori (autovaihto.sh vaihda "scopes kordinaattori" --model claude-sonnet-5-5 --effort high --ei-sulje), jos se ei ole käynnissä, tai herätä se viestillä, jos se on tyhjillään ilman syytä (TEHTAVAT 1); valvo scopes2-tmux-istuntoja Monitorilla (bash scopes/vahtimestari/seuraa-istunnot.sh, uusi 30 min välein); vastaa ruutuihin vain koordinaattorin suosituksella tai suositellulla vaihtoehdolla; /automaattisiirto ≥100 k tehtävän päätyttyä (ei kesken ajon). JUMITILANNE → SendMessage scopes overseerin istunnolle (ListAgents: nimessä "scopes overseer"; jos ei ole, avaa: autovaihto.sh vaihda "scopes overseer" --model claude-opus-5-5 --effort medium --ei-sulje): "JUMI: <istunto> — <oire, lokipolku, mitä yritetty>". Jumi = ruutukysymys ilman koordinaattorin suositusta 10 min, sama portti punainen 2×, koordinaattori kuollut tai hiljaa 15 min, istunto kuollut odottamatta, kaikki vapaana >30 min vaikka jonossa on työtä, RAJA-NOLLAUTUI-tapahtuma, ympäristövika (tmux, avainnippu, kirjautuminen, hook). Älä ratkaise jumia itse. Tehtävät: scopes/vahtimestari/TEHTAVAT.md (lue purun jälkeen). — polut: scopes/vahtimestari/** — aloitus: /pura scopes vahtimestari — automaattinen: kyllä

## Tarkoitus ja raja

Haiku-valvoja (vahtimestari): seuraa Macin scopes2-tmux-istuntoja, vastaa ruutuihin koordinaattorin suosituksella, tekee automaattisiirrot ja pienet seurantatehtävät, lähettää jumitilanteessa toimintakomennon scopes overseerin Opus-istunnolle

## Päätökset

- **28.10.2026:** Ei siirtoa kesken tehtävän; ehto "tehtävä päättynyt" tarkistetaan ruudun tilasta ennen jokaista päätöstä (kordinaattori 101 k ja ios-082420 119 k odottivat). Ruutukysymyksiin ei vastata ilman suositusta; Auto mode -asetusdialogit jätetään koskematta (eivät ole skooppikysymyksiä).

- **28.10.2026 (overseer, käyttäjän päätös patriotin kautta, patriot 307ef0d7: scopes/patriot/REKISTERI.md Päätökset kaksi ylintä riviä, scopes/KEHITYSMALLI.md):** scopes2-kehitys uudelleen; koordinaattori Sonnet high, automaattisiirto 100 k (ei 200 k), SIIRRÄ-raja 100 k. Käyttörajan portaat 95/98/99 % poistettu (käyttäjä 21.10.2026).

- **Käyttäjä 20.10.2026:** Haiku-valvoja (alun perin scopes macos valvoja, sitten scopes overseer valvoja) on oma skooppinsa scopes vahtimestari; edelliset arkistoitu (scopes/macos/valvoja/ ja scopes/overseer/valvoja/REKISTERI.arkistoitu.md). Overseerin asiat kuuluvat scopes overseerin omalle Opus-istunnolle, ei scopes macosille.

- **Käyttäjä 20.10.2026:** Haiku-valvojalla oma skooppi (siirto-operaatiot eivät mene ristiin); siirretty skoopista scopes macos valvoja (arkistoitu, scopes/macos/valvoja/REKISTERI.arkistoitu.md). Ongelmanratkaisu kuuluu scopes overseerille (Opus); valvoja seuraa ja reitittää jumit. Yksi valvoja; toinen vasta, jos kasaantuma toistuu.

- **Käyttäjä 20.10.2026:** skooppi `scopes vahtimestari` luotiin komennolla `/pura uusi scopes vahtimestari`.

- **Käyttäjä 20.10.2026:** skooppi `scopes vahtimestari` luotiin komennolla `/pura uusi scopes vahtimestari`.

- **21.10.2026:** Vastasin ruutuihin vain, kun koordinaattorin suositus tai suositeltu vaihtoehto oli merkitty (tehtävä 3).

- **21.10.2026:** En kirjoittanut scopes/-puuhun omasta aloitteesta; kirjoitusikkunan avaamisen ja sulkemisen ilmoitukset noudatettiin.

- **21.10.2026:** Hylätty: overseerin pyyntö kirjata havaintoaukko ydin-KYSYY-puuttumisesta ennen todentamista. Oma monitor sai molemmat tapahtumat, joten väite ei täsmää. Kirjaus jätettiin käyttäjälle.

- **21.10.2026:** Hylätty: settings.json-sallinta tmux send-keys -komennolle. Asetuksia ei muutettu.

- **Käyttäjä 28.10.2026 (kortti ~10.00):** ei synkkausta jaetussa kloonissa; patriotin kuivaajo ajetaan originin versiolla. Hylätty: git pull -synkkaus.

- **Käyttäjä 28.10.2026 (kortti ~11.00):** overseer-syöttörivi (`! tmux kill-session … toteutussuunnitelma`) jätetään ennalleen; overseer ei siirry automaattisesti. Hylätty: rivin tyhjennys Ctrl-U:lla.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 20.10.2026 | paketti VAHTIMESTARI-MAARITTELY |
| Overseerin T-57-tuotantodatakysymys (vain luku -kopio) | avoin; odottaa käyttäjää | käyttäjän päätös; overseer väitti käyttäjän jo hyväksyneen, mikä ei pidä paikkaansa. |
| T-44-ajo ja ssh-luvat (scopes2 web) | avoin; odottaa käyttäjää | päätös. |
| Overseerin Bash-sallintasääntö settings.json:ssa | avoin; odottaa käyttäjää | päätös; en muuta asetuksia. |
| ARK-16:n ajopaikka (palvelin vs Mac) ja ARK-19/V2-rajaus (architecture) | avoin; odottaa käyttäjää | käyttäjän päätös. |
| Patriot kuoli 06.37 ilman tunnettua syytä | avoin (mahdollinen ympäristövika) | tarkistettava, jos patriot palaa. |
| Monitor `seuraa-istunnot.sh` (SCOPES2-VALVONTA-MAC) | kesken (kirjattu 28.10.2026) | uusi 30 min välein; uusi istunto käynnistää sen. |
| T-72 B -ajoajankohta (nyt / klo 11.30 jälkeen / ei tänään; overseer kysyi 28.10.2026 08.35) | avoin; odottaa käyttäjää | käyttäjän päätös. |
| Toteutussuunnitelma-istunto `siirto-scopes-toteutussuunnitelma-082216` 253 k | avoin; odottaa käyttäjää (kirjattu 28.10.2026 11.08) | käyttäjä tyhjentää syöttörivin tai sanoo tyhjennä; sitten siirto. |
| Overseer `siirto-scopes-overseer-093011` 125 k | avoin; odottaa käyttäjää (kirjattu 28.10.2026 11.08) | käyttäjän päätös: rivi ennalleen, ei automaattisiirtoa. |
| Oma vahtimestari-istunto 125 k | avoin (kirjattu 28.10.2026) | siirto kun monitori on ohi. |
| Adapteri `siirto-scopes2-adapteri-090736` 112 k, syöttörivillä `/pakkaa scopes2 adapteri` | avoin; odottaa käyttäjää (kirjattu 28.10.2026) | käyttäjän päätös. |
| Synkka: rebase-konflikti scopes/siirto/economy/claude/REKISTERI.md (commit cd8c986a) | avoin; odottaa skooppia scopes siirto economy claude (kirjattu 28.10.2026) | omistaja ratkaisee; vahtimestarilla ei omaa muutosta. |
| Patriotin `herata-istunnot.sh`-muutos b0cc8458 ei ole paikallisessa kopiossa | avoin; odottaa käyttäjää (kirjattu 28.10.2026) | synkka kun käyttäjä päättää; sitten `--kuiva` uudella versiolla (origin-versio: exit 0, ei tulostetta). |
| Ios-082420 odottaa Mac-UI-vuoroa (T-59 uusinta) | avoin (kirjattu 28.10.2026); odottaa skooppia scopes2 macos | seuraa. |
| Kordinaattori `siirto-scopes-kordinaattori-084016` 136 k (11.07) | avoin (kirjattu 28.10.2026) | siirto kun tehtävä päättynyt, raja 100 k. |

## Viat

| Vika | Tila |
|---|---|
| Monitori raportoi KUOLLUT-tilan myös normaalille sulkemiselle (ydin 08.08, economy-ruudut); overseer vahvisti ei-vikaa. Seuraava: erota sulkeutuminen kuolemasta `seuraa-istunnot.sh`:ssa | avoin (kirjattu 28.10.2026) |

## Historia

Historia: `scopes/vahtimestari/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
