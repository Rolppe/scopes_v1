# T2 brief — palvelun toiminto pura-testi (PURA-MALLITON, scopes context purascript)

Suunnitelma: `scopes/context/purascript/SUUNNITELMA.md`, Rakenne kohta 2. T1 valmis: `claude/siirto/tools/pura-malliton.mjs`
(d929639b; käyttö tiedoston alussa, exit 0/4 = tiedostot kirjoitettu, 3 = ei scopes/-perhettä, 2 = käyttövirhe).

## Tee

1. `scopes/palvelu/toiminnot.mjs`: uusi toiminto `'pura-testi'(nimi)` toteutus-olioon, `pura`:n rinnalle (rivi ~200).
   - Samat tarkistukset kuin `pura`: tuntematon skooppi 404, käynnissä oleva tai varattu istunto 409, pakattujen ruutujen `/exit`.
   - Lisäksi: skoopin rekisteripolku (skoopit.json, `lueSkoopit`) ei ala `scopes/` → `Hylatty(400, 'testipurku vain scopes-skoopeille')`.
     Tarkistus ennen kuin mitään suljetaan tai ajetaan.
   - Aja `aja('node', [join(asetukset.juuri, 'claude/siirto/tools/pura-malliton.mjs'), nimi, '--kohde', 'claude'])`
     (argumenttitaulukko, ei kuorta, kuten muut). Exit 0 tai 4 → jatka; muu → `Hylatty(500, <stderrin viimeinen rivi, max 300 merkkiä>)`.
   - Avaa istunto `avaaIstunto(nimi, viesti)`, viesti kiinteä: `Malliton purku: lue <polku> ja noudata sitä.`, polku =
     pura-malliton.mjs:n oletusulostulo (`~/.local/state/pura/<slug>.md` absoluuttisena; slug samalla säännöllä kuin
     pura-malliton.mjs — vie slug-funktio sieltä tai toista sääntö ja testaa yhtäläisyys).
   - Palauta kuten `pura` (`osoite`, `suljettiin`) + `tiedosto` (polku) + `varoitus: true`, jos exit oli 4.
   - Päivitä tiedoston alun toimintolista (yksi rivi `pura-testi`).
2. `scopes/palvelu/palvelin.mjs:182`: lisää `pura-testi` reitin sallittuihin nimiin; päivitä alun reittikommentti.
3. Testit `scopes/palvelu/toiminnot.test.mjs` olemassa olevien `pura`-testien tyyliin (vale-`aja`): onnistuminen
   (pura-malliton ajettu oikein argumentein, viesti oikea), ei-scopes-skooppi 400 ilman yhtään `aja`-kutsua,
   pura-malliton exit 1 → 500 eikä istuntoa avata, exit 4 → ok + varoitus. Palvelimen reittitesti, jos reiteille on sellainen.

## Älä

- Älä muuta `pura`-toimintoa, pura-malliton.mjs:ää tai /pura-taitoa.
- Älä käynnistä tuotantopalvelua uudelleen äläkä aja toimintoa oikeaa tmuxia vastaan. Älä committaa.

## Hyväksyntä (projektijuuresta, ei putkia; loki tiedostoon, lue exit-koodi)

- `timeout 300 node --test scopes/palvelu/ > <scratch>/t2-test.log 2>&1` → exit 0 (koko palvelun testisarja, ei regressiota).
- `timeout 300 node --test claude/siirto/tools/pura-malliton.test.mjs > <scratch>/t2-t1.log 2>&1` → exit 0.

## Raportti (enintään 15 riviä)

Exit-koodit ja testimäärät, muutetut tiedostot `file:line`, poikkeamat briefistä syineen.
