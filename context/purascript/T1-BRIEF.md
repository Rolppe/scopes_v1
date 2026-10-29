# T1 brief — pura-malliton.mjs (PURA-MALLITON, scopes context purascript)

Suunnitelma: `scopes/context/purascript/SUUNNITELMA.md` (lue ensin, luku Rakenne kohta 1).

## Tavoite

Uusi skripti `claude/siirto/tools/pura-malliton.mjs` tuottaa purkutiedoston ilman mallia. Tiedosto korvaa
siirtäjämallin raportin ja pääistunnon vaiheiden 2b–3 päättelyn. Sitä käyttävät Claude, agy ja paikalliset mallit.

## Lähteet (lue itse, älä kopioi)

- `claude/siirto/tools/pura-vaiheet.mjs`: deterministiset vaiheet ja raportin rivijärjestys (rivit 230–255).
  Toista sama kokoaminen; vaihe C (malli) korvataan kiinteällä TYÖTAVAT-valinnalla.
- `claude/siirto/tools/pura-faktat.mjs` (ajetaan lapsiprosessina kuten pura-vaiheet.mjs:152), `kesken.mjs`,
  `pura-synkka.mjs`, `avoimet.mjs`, `erityisluvut.mjs`, `skooppirajaus.mjs`.
- `~/.claude/skills/pura/SKILL.md` vaiheet 2b–4: päätössäännöt (ODOTTAA, TEHTY, OSITTAIN?, VÄÄRÄ SKOOPPI,
  VANHENTUNUT, ROSKAT, KÄYTTÄJÄLLE, AUTOMAATTINEN, --autojatko, kuka ajaa `aloitus:`-kentästä, puuttuva
  SEURAAVA, kesken.mjs exit 5/6, NIMI, ISTUNNOT, AUTOPACK, VAATIMUKSET).
- `scopes/localregister/lr.mjs`: `tulosta(juuri, polku)` (rivi 360), juuri `~/.local/share/localregister`.
- `~/.claude/skills/sa/SKILL.md`: kohta Asetus (kolme CronCreate-parametrijoukkoa; uusinta = nyt + 6 vrk 22 h).

## Tee

1. `pura-malliton.mjs "<skooppi>" [--kohde claude|neutraali] [--ulos DIR] [--autojatko] [--ei-synkka]
   [--lr-juuri DIR]`. Exit 0 = tiedostot kirjoitettu; 3 = skoopin rekisteri ei ole `scopes/`-alla (testiraja);
   2 = käyttövirhe; 4 = kirjoitettu, mutta jokin vaihe epäonnistui (`varoitukset[]`).
2. Rekisteriteksti: `scopes/`-polulle `tulosta` localregisteristä, varareittinä git-tiedosto. Rivi `LÄHDE:`
   kertoo kumpi, ja jos LR-teksti eroaa git-tiedostosta, erotus muodossa `eroaa gitistä N riviä`.
   SEURAAVA, AVOIMET-lohkot (avoimet.mjs), Työtavat ja VAATIMUKSET luetaan tästä tekstistä; pura-faktat.mjs:n
   rivit sellaisinaan.
3. TYÖTAVAT ilman mallia: rekisterin `## Työtavat` -luvun rivit + TYOTAVAT.md:n säännöt 2, 5, 8, 9, 10, 15
   (kunkin numeroidun säännön ensimmäinen virke). Joukko vakiona tiedoston alussa.
4. Päätöslogiikka puhtaana, vietynä funktiona `paata(faktat, { autojatko })` → `{ sano[], pysyva[], kysy | aloita,
   ajaja }`. `kysy` = `{ kysymys, vaihtoehdot: [{ nimi, kuvaus }] }` täsmälleen SKILL.md:n vaiheen 3 mukaan
   (vaihtoehto 1 sääntöjen mukaan, 2 `Jokin muu tehtävä`, 3 `Vain tilanne, ei töitä nyt`; KÄYTTÄJÄLLE-tapaus
   oma muotonsa). `aloita` = autojatko- tai automaattivalinnan tapaus.
5. Ydin: `<ulos>/<slug>.json` (oletus `~/.local/state/pura/`, slug = skooppi välilyönnit `-`:ksi). Kentät:
   `skooppi, aika, lahde, raportti (rivit taulukkona), sano, pysyva, kysy|aloita, ajaja, varoitukset,
   claude: { sa: [3 × {cron, recurring, prompt}], nimi, istunnot, autopack }`.
6. Renderöinti `<ulos>/<slug>.md` `--kohde`n mukaan (oletus claude). Molemmissa ensin lyhyt ohje
   ("esitä raportti sellaisenaan, sano SANO-rivit, kysy"), sitten raportti koodilohkossa. `claude`:
   AskUserQuestion-ohje ja claude-lohko (sa-parametrit, /rename). `neutraali`: ei yhtään Claude-työkalun nimeä
   (AskUserQuestion, CronCreate, Skill, Agent, /rename); kysymys numeroituna listana, vastaus numerolla;
   claude-lohko pois.
7. Testit `claude/siirto/tools/pura-malliton.test.mjs` (node --test): `paata` jokaiselle kohdan 4 säännölle
   kiinteillä fakta-riveillä (vähintään ODOTTAA, TEHTY koko/osa, OSITTAIN?, VÄÄRÄ SKOOPPI, VANHENTUNUT,
   KÄYTTÄJÄLLE, AUTOMAATTINEN, --autojatko, SEURAAVA puuttuu, kesken 5); LR-lähde ja varareitti väliaikaisella
   `--lr-juuri`llä; neutraali-renderöinnissä ei Claude-työkalunimiä. Ei verkkoa eikä synkkaa testeissä.

## Älä

- Älä muuta pura-vaiheet.mjs:ää, pura-faktat.mjs:ää, aja-siirtaja.sh:ta tai /pura-taitoa (nykyinen /pura ennallaan).
- Älä kirjoita localregisteriin äläkä tuotannon `~/.local/state/pura/`-hakemistoon testeissä (käytä `--ulos`).
- Älä committaa.

## Hyväksyntä (aja projektijuuresta, ei putkia; loki tiedostoon, lue exit-koodi)

- `timeout 300 node --test claude/siirto/tools/pura-malliton.test.mjs > <scratch>/t1-test.log 2>&1` → exit 0.
- `timeout 300 node claude/siirto/tools/pura-malliton.mjs "scopes infra" --ei-synkka --ulos <scratch>/ulos > <scratch>/t1-infra.log 2>&1` → exit 0 tai 4; json ja md syntyvät.
- Sama `"scopes context purascript"` sekä `--kohde neutraali`.
- `timeout 300 node claude/siirto/tools/pura-malliton.mjs "infra" --ei-synkka --ulos <scratch>/ulos` → exit 3.

## Raportti (enintään 25 riviä)

Kuuden rivin muoto + hyväksyntäkomentojen exit-koodit, luotujen tiedostojen polut (`file:line` keskeisille
funktioille), ja jokainen SKILL.md-sääntö, jota ei toteutettu, syineen.
