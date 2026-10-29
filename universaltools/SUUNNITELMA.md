# SUUNNITELMA — agenttiriippumattomat siirto- ja rekisterityökalut (15.10.2026)

Paketti UNIVERSALTOOLS-SUUNNITELMA. Lähtö: `KARTOITUS.md`:n Valinta = kyllä -rivit. Pura, pakkaa, autopakkaa ja
pakkaa-kaikki eivät kuulu tähän skooppiin. Purun mallivapaa ydin (`pura-malliton.mjs --kohde claude|neutraali`,
`scopes context purascript`) käyttää samaa kohdejakoa, joten tämä suunnitelma lainaa sen sanaston: **kohde** = agentti,
jolle ohje tai ajo tehdään.

Tila: **hyväksytty (käyttäjä 15.10.2026)**. Päätökset ovat luvussa Päätökset; U1 on seuraava.

## Periaate

Valitut työkalut koskevat Claude Codea kahdella tavalla, ja kumpikin korjataan eri tavalla:

1. **Skriptipuoli.** Skripti lukee tai käynnistää jotain Claude-kohtaista: `~/.claude/projects`-transkriptit,
   `claude --remote-control`, `claude -p` ja `~/.claude/agents`. Tämä puoli siirretään **sovittimen** taakse
   (`scopes/universaltools/agentti/`). Työkalu kutsuu rajapintaa, ja kohdekohtainen tiedosto toteuttaa sen.
2. **Ohjepuoli.** Taito- tai agenttitiedosto käskee mallia käyttämään Claude-työkalua: AskUserQuestion, CronCreate,
   Agent, Skill tai PushNotification. Skripti ei voi kutsua näitä. Ohje kirjoitetaan siksi kerran neutraalisti
   kohdelohkoin, ja asennus **renderöi** sen kohteelle samaan tapaan kuin pura-malliton tekee
   (`claude` tai `neutraali`).

Kohteen puuttuva kyky ei kaada työkalua. Sovitin julistaa kykynsä (`kyvyt()`), ja työkalu tulostaa kiinteän rivin
`EI TUETTU: <kyky> kohteessa <kohde>`. Esimerkiksi `sa` on tarpeeton agentille, jolla ei ole kehotevälimuistia.

## Sovitinrajapinta (`scopes/universaltools/agentti/rajapinta.mjs`)

| Kyky | Funktiot | Claude (nykyinen käytös) | Neutraali / muut |
|---|---|---|---|
| **istunto** (transkripti) | `istunnot({projekti})`, `transkripti(id)` → normalisoidut tapahtumat `{aika, rooli, teksti, työkalu?, tokenit?}`, `kayttajaviestit(id, {jalkeen})`, `konteksti(id)` → `{syote, ulostulo}` | `~/.claude/projects/<proj>/*.jsonl` ja `sessions/` (kesken:111-113, konteksti-nyt:24, pakkaamatta:35,72) | agy: keskusteluloki, jos CLI tarjoaa sen; muutoin `EI TUETTU`. Paikallinen malli: ajurin oma JSONL samassa normaalimuodossa |
| **käynnistys** | `kaynnista({skooppi, malli, kehote, ikkuna})` → `{id, nakyviin}`, `sulje(id)`, `elossa(id)` | tmux + `claude --model … --remote-control` (autovaihto:165-166), sulje-ikkuna.sh | tmux + kohteen CLI (`agy …`, paikallisen mallin ajuri) |
| **ajastus** | `ajasta(cron, kehote)`, `ajastukset()`, `poista(id)` | ohjepuoli: CronCreate/List/Delete (sa) | skriptipuoli: tmux send-keys tai systemd-käyttäjätimer; `valimuisti`-kyvyttömällä `sa` = `EI TUETTU` |
| **aliagentti** | `aja({rooli, malliluokka, kehote, skeema?})` → `{raportti, kesto_ms, tokenit}` | skriptistä `claude -p` (vaihesilmukka:109-112), istunnossa Agent-työkalu (ohjepuoli) | `agy --conversation` (vaihesilmukka:126-129), paikallinen malli models-skoopin ajurilla |
| **kysymys** | ohjepuoli: `kysy(otsikko, vaihtoehdot)` renderöityy | AskUserQuestion | numeroitu lista, ja vastaus annetaan numerona (sama kuin pura-malliton `neutraali`) |
| **ilmoitus** | `ilmoita(rivi)` | PushNotification (ohjepuoli) | `EI TUETTU` tai konekohtainen komento (ei uutta palvelua tässä skoopissa) |

**Malliluokka** korvaa mallinimet rooleissa: `pieni`, `keski` tai `iso`. Kohteen kartta (`agentti/<kohde>.json`) kertoo
nimet. Esimerkiksi Claudella `pieni`=haiku, `keski`=sonnet ja `iso`=opus/fable, ja agyllä kohteen omat mallit.
Nykyinen `--moottori claude-cli|agy` (vaihesilmukka:83, pakkaa-vaiheet:61) muuttuu kohteen nimeksi, ja vanha valitsin
säilyy aliaksena.

Kohde valitaan järjestyksessä `--kohde` → `SIIRTO_KOHDE` → tunnistus (`CLAUDECODE`-muuttuja → `claude`) → `neutraali`.

## Työkaluryhmät

| Ryhmä (KARTOITUS) | Muutos | Mitä ei muuteta |
|---|---|---|
| Istunnot ja vaihto: kesken, pakkaamatta, konteksti-nyt/-data, kontekstikasvu, mittaa-kesto, komentotiheys | lukevat `istunto`-kyvyn kautta; JSONL-jäsennys siirtyy `agentti/claude.mjs`:ään | tulosterivit (`KESKEN:`, `KONTEKSTI:` …) ja exit-koodit |
| autovaihto-perhe (autovaihto, -lupa, istunto, sulje-ikkuna) | `kaynnistys`-kyky; lupa- ja `--rd`-logiikka pysyy skriptissä | tmux-istuntonimet ja RC-linkki Claudella |
| sa | ohje renderöidään; `valimuisti`-kyky julistetaan | TICK- ja UUSINTA-tekstit |
| Agentit: siirtaja-sonnet, rd-context, toteuttaja-sonnet/-opus | yksi neutraali roolimäärittely `claude/siirto/roolit/<rooli>.md` (frontmatter: rooli, malliluokka, työkaluluokat); `install.sh` generoi `~/.claude/agents/*.md` ja muiden kohteiden vastineet | agenttien nimet Claudella (siirtaja-sonnet jne.) |
| vaihesilmukka, pura-vaiheet, pakkaa-vaiheet, erityisluvut | `aliagentti`-kyky; erityisluvut:292 hooks-polku sovittimen `polku('hooks')`:sta | JSON-skeema- ja korjauskierrosrakenne |
| keskustelun-siirto (reititin) | Claude-työkalurivit (SKILL.md:17-23, :18, :270) kohdelohkoihin; renderöinti asennuksessa | reitityssäännöt ja viitetiedostot |
| Yhteinen ydin: rekisterityökalut, git/lukot/synkka, skoopin rakenne, vika | oletustila `SIIRTO_STATE_DIR` → sovittimen `polku('tila')`; juuri.sh:36 hyväksyy `.claude/`-merkin lisäksi neutraalin merkin; testiton-korjaus:40 ja siirra-skooppi hooks/skills-polut sovittimesta; vika-ohjeen polku renderöidään | tilatiedostojen sisältö ja sijainti Claudella (ei siirtoa ilman päätöstä, ks. Päätettävää) |

## Järjestys ja testit

Jokainen paketti on oma committinsa. Claudella käytös ei muutu, ja sen todistaa **kultatesti**: sama syöte (tallennettu
transkripti- ja rekisterifixture) tuottaa saman tulosteen ennen muutosta ja sen jälkeen. Lisäksi **testikohde**
(`agentti/testi.mjs`, fixtureihin perustuva väärennös) todistaa, ettei työkalu oleta Claudea.

| Paketti | Sisältö | Hyväksytty kun |
|---|---|---|
| U1 SOVITIN | `rajapinta.mjs`, `claude.mjs` (istunto-kyky), `testi.mjs`, kohteen valinta; kultafixturet kesken/pakkaamatta/konteksti-nyt | `node --test` vihreä; kultatesti identtinen |
| U2 ISTUNTOTYÖKALUT | kesken, pakkaamatta, konteksti-*, kontekstikasvu, mittaa-kesto, komentotiheys sovittimelle | kultatesti identtinen; testikohteella samat rivit fixturesta; **portti**: `grep -n '\.claude/projects'` valituissa työkaluissa tyhjä sovittimen ulkopuolella (lisätään rakennetestiin) |
| U3 YDIN | tilapolku, juuri.sh-merkki, hooks/skills-polut, vika-ohje | rakennetesti + nykyiset rekisteritestit vihreät; ajo `SIIRTO_KOHDE=testi`:llä ilman `~/.claude`a (tyhjä HOME) ei kaadu |
| U4 ROOLIT | neutraalit roolimäärittelyt + generaattori; install.sh | generoidut `~/.claude/agents/*.md` = nykyiset (diff tyhjä, pois lukien generointiotsake); `/pura`-kanariaajo siirtaja-sonnetilla 6/6 |
| U5 ALIAGENTTI | vaihesilmukka, pura-/pakkaa-vaiheet, erityisluvut `aliagentti`-kyvyllä | vaihesilmukan testit; `--moottori`-alias toimii; yksi paketoi-koe claude-cli:llä |
| U6 OHJEET | reititin + sa kohdelohkoihin; renderöijä (jaettu pura-malliton-renderöijän kanssa, jos purascript on valmis) | claude-renderöinti = nykyinen taito (diff tyhjä); neutraali-renderöinnissä ei Claude-työkalunimiä (grep-portti) |
| U7 KÄYNNISTYS | autovaihto-perhe `kaynnistys`-kyvyllä | autovaihto-koeajo tmuxissa Claudella; testikohteella käynnistyskomento oikein (kuivaharjoitus) |
| U8 TOINEN KOHDE | ensimmäinen ei-Claude-sovitin oikealla agentilla (valinta alla) | kesken + konteksti-nyt + yksi aliagenttikutsu + neutraali kysymys toimivat sillä agentilla |

U1–U3 ovat edellytyksiä. U4–U7 voi ajaa missä järjestyksessä tahansa, ja U8 tulee viimeisenä. Arvioitu koko: U1–U3
ovat keskikokoisia ja muut pieniä tai keskikokoisia. Delegointi tehdään CLAUDE.md:n Aliagentit-säännön mukaan
(mekaaninen siirto → sonnet).

## Rajat muihin skooppeihin

- **Sovittimen sijainti (pakkausportti 15.10.2026):** `claude/siirto/tools/**` kuuluu skoopille `claude siirto`. Sovitin on uutta koodia, joten se tehdään tämän skoopin polkuun `scopes/universaltools/agentti/`. U2–U7 muokkaavat `claude siirto`n työkaluja. Ennen U2:ta käyttäjä päättää, kumpi reitti otetaan: (a) muutokset viedään `claude siirto`lle `/vika`-reitillä, vai (b) skoopin raja laajennetaan valittuihin `claude/siirto/tools`-tiedostoihin.
- `scopes context purascript` omistaa pura-malliton.mjs:n. Jos U6:n renderöijä halutaan yhteiseksi, se ehdotetaan
  sille `/vika`-reitillä, eikä tiedostoa muokata täältä.
- Pakkaus- ja purkutaidot käyttävät sovitinta vasta omissa skoopeissaan. Tämä skooppi tarjoaa rajapinnan, eikä muuta
  niitä.
- `~/.claude/`-kopioita ei muokata. Lähde muutetaan ja ajetaan `bash Infra/skills/install.sh`.

## Päätökset (käyttäjä 15.10.2026, kyselykortti)

1. Suunnitelma hyväksyttiin sellaisenaan. Seuraava paketti on U1 SOVITIN; pakkaus tehtiin ilman automaattijatkoa.
2. Toinen kohdeagentti (U8) on **Gemini CLI**. Sitä ei ole asennettu palvelimella, joten asennus kuuluu U8:aan.
3. Tilahakemisto **siirretään** polkuun `~/.local/state/siirto`, ja vanhaan polkuun
   `~/.claude/skills/keskustelun-siirto/state` jää symlinkki. Siirto tehdään U3:ssa. Sen kultatesti ajetaan siirron
   jälkeen, ja `install.sh` ei saa kirjoittaa symlinkin yli.
