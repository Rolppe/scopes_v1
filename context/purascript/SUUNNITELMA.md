# PURA-MALLITON (scopes context purascript) — mallivapaa purku scopes-perheelle, agenttiriippumaton

Tila: hyväksytty 15.10.2026 (käyttäjä: "Päivitä ja aloita T1"). Raja: nykyinen /pura pysyy ennallaan; testi
ajetaan äpistä scopes/-perheen skoopeille rinnakkain nykyisen purun kanssa.

## Käyttäjän päätökset

- 14.10.2026: mallivapaa purku: skripti tekee valmiin tiedoston, joka annetaan uudelle keskustelulle alussa
  (ei ali-agenttia, ei claude -p:tä); ensin äpin testitoimintona.
- 15.10.2026: suunnitellaan ja otetaan käyttöön localregister-järjestelmän (scopes/localregister) kanssa.
- 15.10.2026: rajaus koko scopes/-perhe (aiemmin vain scopes infra) — samat skoopit, joiden rekisterit ovat
  localregisterissä live (SCOPES_LR_VIENTI=scopes/, MUOTO.md §11).
- 15.10.2026: rekisterin lähde on localregister (`lr.mjs tulosta`), git-tiedosto vain varareitti.
- 15.10.2026: tiedostoa käyttävät myös muut kuin Claude-agentit: agy ja paikallisten mallien projektit.

## Lähtötilanne (mitattu 14.10.2026)

- `/pura` lataa pääistuntoon taidon rungon 22,7 k merkkiä ja ajaa siirtäjämallin (claude-cli haiku: 62 s,
  ~420 k tokenia; 15.10.2026: 63 s, 398 k). Lähtökonteksti purun jälkeen 68–87 k (15.10.2026: 69 k).
- Skriptit laskevat jo lähes kaiken: pura-vaiheet.mjs (synkka, install, faktat, SEURAAVA; malli vain
  TYÖTAVAT), pura-faktat.mjs (OMISTAJA-hännät, VANHENTUNUT, ROSKAT, NIMI, ISTUNNOT, AUTOPACK), kesken.mjs.
  Puuttuu: vaihtoehdon 1 valinta, kuka ajaa, AVOIMET-varavalinta, autojatko-päätös — nyt mallin päättelyä
  ~/.claude/skills/pura/SKILL.md:n vaiheista 2b–3.

## Rakenne

1. **`claude/siirto/tools/pura-malliton.mjs "<skooppi>" [--kohde claude|neutraali] [--ulos DIR]`** — ei mallia.
   - Rekisteri: `scopes/`-alkuiselle polulle localregisteristä (`tulosta`, scopes/localregister/lr.mjs,
     juuri `~/.local/share/localregister`); jos rekisteriä ei ole siellä, gitin REKISTERI.md ja rivi
     `LÄHDE: git (ei localregisterissä)`. Ero gittiin näkyy rivillä `LÄHDE: localregister (eroaa gitistä …)`.
   - Deterministiset vaiheet kuten pura-vaiheet.mjs (synkka, ajautuma/install, pura-faktat.mjs), kesken.mjs,
     TYÖTAVAT ilman mallia (rekisterin Työtavat-luku + kiinteä TYOTAVAT.md-sääntöjoukko), päätöslogiikka
     SKILL.md:n vaiheista 2b–3 puhtaana funktiona.
   - **Agenttiriippumaton ydin**: `~/.local/state/pura/<skooppi-slug>.json` — raportti, `sano[]` (lauenneet
     yksiriviset), `pysyva[]` (keskustelun säännöt), `kysy` (kysymys + vaihtoehdot dataa) tai `aloita`, ja
     erillinen `claude`-lohko vain Claude-harnessin asioille (sa-ajastukset CronCreate-parametreina, /rename,
     ISTUNNOT, autopack-taito).
   - **Renderöinti kohteelle**: `<slug>.md`. `claude`: AskUserQuestion-ohje ja claude-lohko. `neutraali`
     (agy, paikalliset mallit): sama raportti ja päätös ilman Claude-työkalunimiä; kysymys numeroituna
     listana, johon vastataan numerolla.
2. **Palvelun toiminto `pura-testi`** (scopes/palvelu/toiminnot.mjs): sallittu vain scopes/-perheelle; ajaa
   pura-malliton.mjs:n ja avaa istunnon kuten `pura` (`avaaIstunto`, autovaihto.sh `--viesti`), ensimmäinen
   viesti lyhyt: `Malliton purku: lue <polku> ja noudata sitä.`
3. **Äppi**: scopes-skooppien näkymään testinappi "Testipurku (malliton)"; muissa skoopeissa ei näy.

ISTUNNOT-sivukorjaus (claude -p -lapsen istunto-id, istunto.sh:122, pura-faktat.mjs:351) ei koske
mallitonta reittiä, koska skripti ajaa kutsujan ympäristössä; nykyisen /puran korjaus erikseen.

## Vaiheet

| # | Työ | Todennus |
|---|---|---|
| T1 | pura-malliton.mjs + testit (ydin-JSON, claude- ja neutraali-renderöinti, LR-lähde) | testit; ajo scopes infralle ja scopes context purascriptille: tiedostot syntyvät, raportin rivit = nykyisen purun rivit samasta tilasta |
| T2 | palvelun pura-testi + testi (muu kuin scopes/ → 400) | toiminnot.test.mjs |
| T3 | äpin testinappi | UI-testi simulaattorissa |
| T4 | koeajo puhelimesta | uusi istunto aloittaa tiedostosta; lähtökonteksti kontekstinOsat-menetelmällä vs. 69–87 k |
| T5 | agy- ja paikallisen mallin käyttöönotto | neutraali-tiedosto agy-keskustelun ja paikallisen mallin alussa; kumpikin esittää raportin ja kysymyksen oikein |

Toteutus: toteuttaja-ali-agentti briefillä, pääistunto tarkistaa ja committaa.

## T6 — scopes-perheen purku kokonaan skriptipohjaiseksi (hyväksytty 15.10.2026: "Hyväksy, aloita T6a")

Käyttäjä 15.10.2026: "Kirjoita uudelleen" — ensimmäinen T6-luonnos (klo 21.34) poikkesi tavoitteesta: Haiku-
varareitti (exit 2/3, `--ajaja=`, katkaisin) ja /pura-taidon runko (22,7 k merkkiä) pääistuntoon tiedoston lisäksi.
Tavoite (päätös 14.10.2026): skripti tekee valmiin tiedoston, joka annetaan uudelle keskustelulle alussa — ei
ali-agenttia, ei claude -p:tä. Raja: skoopit, joiden rekisteri on `scopes/`-alla; muut skoopit ennallaan.

Periaatteet:
- **Ei mallireittiä scopes-perheelle.** Skriptin virhe näytetään sellaisenaan; purkua ei ajeta mallilla.
- **Istunto alkaa tiedostosta** kuten `pura-testi` (toiminnot.mjs:232-250): ensimmäinen viesti
  `Malliton purku: lue <polku> ja noudata sitä.` — ei /pura-taitoa, ei sen runkoa.
- **Yksi perhetunnistus**: `pura-malliton.mjs --perhe "<s>"` (exit 0 = scopes-perhe, 1 = ei), jota kaikki reitit
  kutsuvat; sama ehto kuin pura-testin `startsWith('scopes/')`.

Reitit:
1. **Äpin Pura** (`toiminnot.mjs` `pura`, scopes siirto): scopes-perheelle pura-testin polku (skripti →
   tiedosto → avaaIstunto tiedostoviestillä). Skriptin virhe → HTTP 500 viestillä, istuntoa ei avata.
   Valinnasta säilyy `malli` (uuden istunnon malli); purkajan valinta `ajaja` ei koske perhettä.
   Seuraus käyttäjän päätökseen SCOPES-PURA-MALLI 15.10.2026: purkajavalinta piilotetaan scopes-skoopeilta
   (Swift, scopes chat / scopes infra — muutosilmoitus). Testinappi poistuu tarpeettomana.
2. **Autovaihto** (`autovaihto.sh`, claude siirto autovaihto): perheelle skripti `--autojatko [--rd]` ennen
   istunnon avausta, `VIESTI` = tiedostoviesti. Virhe → istunto avataan viestillä
   `Malliton purku epäonnistui (<skooppi>): <virhe>` — se kysyy käyttäjältä (AskUserQuestion), ei pura mallilla.
3. **Käsin kirjoitettu `/pura <s>`** (Infra/skills/pura, claude siirto pura): SKILL.md lyhenee jakajaksi
   (vaihe 0 `uusi` + yksi komento). Perheelle: skripti → `Read` tiedosto → noudata. Muille: nykyinen runko
   siirretään tiedostoon `MALLIREITTI.md`, jonka taito lukee vain silloin — muiden skooppien purku ennallaan
   (+1 Read). Näin perheen pääistuntoon ei lataudu 22,7 k:n runkoa.
4. **Skriptin puutteet** (`pura-malliton.mjs`): `--rd` (RD-TILA-rivi + pysyvä sääntö lukea rd/SKILL.md);
   TEHTY ilman selvää koko-osumaa → `Jatka <id> (suositus)` + "tarkista ensin, mitä commit jätti";
   ei ARVIO-riviä (ei mallia arvioitavaksi).

Vaiheet:

| # | Työ | Todennus |
|---|---|---|
| T6a | pura-malliton.mjs: `--perhe`, `--rd`, TEHTY-epävarma → Jatka | `node --test pura-malliton.test.mjs` |
| T6b | toiminnot.mjs `pura`: perhe → tiedostoreitti, virhe → 500; testinappi pois | toiminnot.test.mjs: perhe → tiedostoviesti, ei /pura; muu skooppi → /pura ennallaan; virhe → ei istuntoa |
| T6c | autovaihto.sh perhehaara + virheviesti | autovaihto-testi: perhe → tiedostoviesti, `--rd` siirtyy; muu → `/pura … --autojatko` |
| T6d | /pura SKILL.md jakajaksi + MALLIREITTI.md; install.sh | `ajautuma.sh` tyhjä; `/pura claude siirto` (muu skooppi) toimii kuten ennen |
| T6e | Äpin purkajavalinta piiloon perheeltä (muutosilmoitus omistajille) | UI-testi simulaattorissa |
| T6f | Kaikki 20 scopes-skooppia: skripti exit 0/4 ja tiedosto syntyy; vaihtoehto 1 verrataan nykyiseen purkuun, erot luokitellaan (kumpi oikein) | eroluettelo tähän lukuun |
| T6g | Koeajo: äpin Pura, yksi autovaihto `--rd`:llä, käsin `/pura` | lähtökonteksti vs. 76 k (15.10.2026 Haiku-reitti); raportti ja kysymys oikein |

Omistajat: /pura-taito → claude siirto pura; autovaihto.sh → claude siirto autovaihto; toiminnot.mjs → scopes
siirto; Swift → scopes chat / scopes infra. Muutokset tehdään tästä skoopista käyttäjän T6-hyväksynnällä, ja
omistajille lähtee muutosilmoitus (TYOTAVAT 15: niiden rekistereitä ei päivitetä täältä).

Toteutus: toteuttaja-ali-agentti briefillä, pääistunto tarkistaa ja committaa.

### T6f — eroluettelo (15.10.2026)

Ajo: `pura-malliton.mjs "<s>" --ulos <scratch> --ei-synkka` kaikille rekisterikartan scopes-perheen skoopeille.
Kartassa on 19 skooppia, ei 20 (`scopes/qwen38` on tyhjä hakemisto ilman rekisteriä). Kaikki 19: exit 0,
`.md` ja `.json` syntyivät, `varoitukset` tyhjä. Vertailukohta "nykyinen purku" = MALLIREITTI.md:n vaiheiden
2f–3 säännöt samoista faktoista (pura-faktat.mjs, kesken.mjs ovat yhteisiä molemmille reiteille).

| Skooppi | Tapaus | Skriptin vaihtoehto 1 | Mallireitti | Tulos |
|---|---|---|---|---|
| scopes context, scopes context purascript | AUTOMAATTINEN | AUTOJATKO CONTEXT-A3 / PURA-MALLITON-T6F | sama | sama |
| scopes yhteys | AUTOMAATTINEN | AUTOJATKO V-487-DIAG | sama | sama (1. ajossa V-487-TODENNUS: kilpa, 21336c5a pakattiin ajon aikana 22.40; uusinta oikein) |
| scopes chat media, universaltools, notifications | paketti ok | `Aloita <id> (suositus)`, Aloitus+Ajaja+Skooppi | sama | sama |
| scopes infra | KESKEN exit 5 | `Jatka keskeneräistä (suositus)`, sen jälkeen paketti | sama | sama (ks. huomio 3) |
| scopes jakelu mac | ODOTTAA 18.10.2026, ei heti-riviä | `Aloita DEMO-SCOPES-UUSINTA-TODENNUS` ilman suositusta | sama + kuvaukseen Aloitus ja Ajaja | **ero, skripti väärin** → korjattu (ero 1) |
| scopes agy android, chat, localregister, viat | KÄYTTÄJÄLLE, ei pakettia | `<rivi> — päätä tai aja` (≤3) + Jokin muu | sama | sama |
| scopes, agy, design, jakelu, lista, siirto, testit | ei mitään | tehtäväkysymys (Jokin muu, Vain tilanne) | sama | sama (ks. huomio 2) |

Erot:
1. ODOTTAA- ja TEHTY (koko) -haarat ilman heti ajettavaa riviä: vaihtoehdon 1 kuvauksesta puuttuivat `Aloitus:`
   ja `Ajaja:` (MALLIREITTI vaihe 3: kuvaukseen aloituskomento ja ajaja). Mallireitti oikein. Korjattu
   pura-malliton.mjs:ssä (`paketinKuvaus`), testi pura-malliton.test.mjs (kaatui vanhalla koodilla, 43/43 uudella).

Huomiot (sama molemmissa reiteissä, ei T6f-ero):
2. `SEURAAVA PAKETTI: ei mitään — <syy>` saa SANO-rivin "puuttuva rivi on vika" (7 skooppia), vaikka "ei mitään"
   on perusteltu. Teksti on MALLIREITTI.md:n säännön mukainen; vika olisi vain puuttuva rivi. Muutos koskisi
   molempia reittejä (MALLIREITTI omistaa claude siirto pura) — ei muutettu.
3. scopes infra: kesken.mjs (exit 5) osoittaa muistioon 13.37, jonka "Jäljellä"-kohta (lms-health) näyttää
   osin tehdyltä 25d57351:ssä (13.51) ennen pakkausta. Sama tulos molemmille reiteille; jatkava istunto tarkistaa.

### T6g — koeajo (15.10.2026)

Käyttäjä 15.10.2026: "Agentti ajaa koko ketjun" (palvelun uudelleenkäynnistys, äpin asennus, neljä koeistuntoa, sulkeminen).
- Palvelu :8787 oli jo uudelleenkäynnistetty 22.48.31 (pid 11283, toinen istunto) uusimman commitin ac4c4376
  (22.47.31) jälkeen → ei uutta uudelleenkäynnistystä. `bash scopes/ios/asenna.sh` → `asennus valmis
  profiili=2026-10-22T06:26:59Z`, exit 0. Purkajavalinnan piiloa puhelimen näytöltä ei havaittu (T6e: simulaattori).
- Lähtökonteksti = `konteksti-nyt.mjs <istunto>` istunnon ensimmäisen vuoron lopussa (raportti + /sa + kysymys):

| Reitti | Skooppi | Konteksti | Raportti | Kysymys |
|---|---|---|---|---|
| Äpin Pura (`POST /api/skoopit/<s>/pura`, sama kuin äppi) | scopes lista | 55 k | 17/17 kenttää sanatarkasti | tehtäväkysymys, oikein (ei pakettia) |
| Autovaihto `--rd` | scopes siirto | 56 k | 17/17; RD-TILA-rivi mukana | tehtäväkysymys, oikein |
| Käsin `/pura` (taito → tiedosto) | scopes agy | 56 k | 17/17 | tehtäväkysymys, oikein |
| Autovaihto ilman `--rd` (tämä istunto) | scopes context purascript | 59 k | kaikki kentät | AUTOJATKO, oikein |
| Käsin `/pura` mallireitti (MALLIREITTI.md) | claude siirto | 73 k | — | "Palauta pakkaamaton työ (suositus)", KESKEN 120795e9 kuten autovaihdon KESKEN-rivi |

Vertailu: 76 k (15.10.2026 Haiku-reitti) → perhe 55–59 k (−17…−21 k). Muun skoopin mallireitti toimii jakajan
kautta (73 k). Koeistunnot (tmux siirto-*-2250xx) suljettu. T6 valmis.
