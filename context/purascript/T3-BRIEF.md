# T3 brief — äpin testinappi "Testipurku (malliton)" (PURA-MALLITON, scopes context purascript)

Suunnitelma: `scopes/context/purascript/SUUNNITELMA.md`, Rakenne kohta 3. T2 valmis (11573880): palvelun reitti
`POST /api/skoopit/<nimi>/pura-testi` (scopes/palvelu/palvelin.mjs:183, toiminnot.mjs:223) palauttaa kuten `pura`
(`osoite`, `suljettiin`) + `tiedosto`, `varoitus?`; muu kuin scopes/-skooppi → 400.

## Tee

1. `scopes/ios/Sources/Nakymat.swift`: "Pura uuteen istuntoon" -painikkeen (rivi 84) alle painike
   "Testipurku (malliton)", `accessibilityIdentifier("toiminto-pura-testi")`, näkyy vain skoopeille, joiden nimi alkaa
   `scopes ` tai on `scopes` (sama perhe kuin palvelun scopes/-raja; jos malli tuntee rekisteripolun, käytä sitä).
   Vahvistusdialogi kuten `.pura` (rivit ~149, ~181): uusi tapaus, teksti "Uusi Claude-istunto käynnistyy valmiista
   purkutiedostosta ilman siirtäjämallia (testi)." ja toiminnoksi `pura-testi`. Onnistumisen käsittely kuten Pura.
2. Asiakas/malli: kutsu reittiä samalla tavalla kuin pura; 400-virheen teksti näytetään käyttäjälle.
3. UI-testi `scopes/ios/UITests/` olemassa olevien tyyliin: nappi näkyy scopes-skoopissa ja puuttuu muussa
   skoopissa; vahvistusdialogi aukeaa ja peruutus sulkee sen. Älä paina vahvistusta tuotantopalvelua (8787) vastaan:
   se avaisi oikean istunnon. Jos testit käyttävät koeinstanssia (SCOPES_KOE_*), vahvistuksen saa testata vain siinä.
4. Aja UI-testit Macin simulaattorissa projektin omalla tavalla (`scopes/ios/testi.sh`, lue se ensin). LuLu: simulaattoriäpit
   sallittu allowSimulatorApps-asetuksella.

## Älä

- Älä muuta Pura-painiketta tai sen käytöstä. Älä asenna äppiä käyttäjän puhelimeen. Älä käynnistä tuotantopalvelua
  uudelleen. Älä committaa.

## Hyväksyntä

- Äpin build onnistuu ja uudet UI-testit + vähintään SkoopitUITests menevät läpi simulaattorissa (exit-koodit, testimäärät).
  Komennot aikarajalla (`timeout`), loki tiedostoon, ei putkia exit-koodin edessä.

## Raportti (enintään 15 riviä)

Exit-koodit ja testimäärät, muutetut tiedostot `file:line`, poikkeamat briefistä syineen.
