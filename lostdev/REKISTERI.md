# scopes/lostdev/REKISTERI.md

Tilanne: 19.10.2026

SEURAAVA PAKETTI: ei mitään — skoopin tehtäväkokonaisuus valmis 18.10.2026, uusi paketti vaatii käyttäjän tehtävänannon

## Tarkoitus ja raja

Etsiä kehityksessä hukkunutta kehitystietoa. Scopes-äppi on menettänyt ominaisuuksia, jotka on jo aiemmin tehty; selvitetään ja dokumentoidaan hukkuneet ominaisuudet, commitit ja toteutukset moniajolla palautusta varten.
Raja: Scopes-äpin (macOS, iOS, palvelu, jaettu core) ja sen skooppien kehityshistoria, haarat, stäshit ja rekisterit.

## Päätökset

- **18.10.2026:** Suoritettu paketti LOSTDEV-DOKUMENTOINTI-JA-VALMIS: Koostettu laaja loppuraportti (LOPPURAPORTTI.md), jossa käydään läpi kaikki 4 moniajoagentin löydökset, suoritetut korjaukset (performance-rekisteri, suoratoistoreitti, statusline, mallivalikko, viat- ja diagnostiikkanäkymät) sekä verifiointitulokset (ScopesMac ja Skoopit BUILD SUCCEEDED, 17/17 Swift-testiä, 165/165 Node-testiä, rakennetesti 6/6 ok). Kaikki skoopin avoimet asiat on saatettu valmiiksi.
- **18.10.2026:** Suoritettu paketti LOSTDEV-VIAT-JA-DIAGNOSTIIKKA: Suunniteltu ja toteutettu erilliset Viat- ja Diagnostiikkanäkymät macOS:lle (MacViatView.swift) ja iOS:lle (ViatView.swift). Kytketty navigaatioon (macOS: MacTypes, MacSidebar, MacRootView; iOS: Juuri.swift, Sivupalkki.swift, Malli.swift, Asiakas.swift). Lisätty ScopesCoreen DiagnostiikkaTila ja PyyntoTapahtuma sekä client.diagnostiikka(). Vahvistettu: sekä ScopesMac että Skoopit kääntyvät puhtaasti (BUILD SUCCEEDED), kaikki 17 Swift-testiä ja kaikki 165 Node-backend-testiä menevät läpi.
- **18.10.2026:** Suoritettu paketti LOSTDEV-PALAUTUS-OHJAUS: Toteutettu taustapalvelimelle puuttunut NDJSON-suoratoistoreitti (POST /api/skoopit/:nimi/stream), korjattu statusline.sh dynaamisella polulla, yhdenmukaistettu MalliValikko.swift ja Malli.swift (tyyppi: String? istunnolle, jotta Claude- ja AGY-istunnot näyttävät vain yhteensopivat mallit). Vahvistettu, että sekä macOS-sovellus (ScopesMac) että iOS-sovellus (Skoopit) kääntyvät puhtaasti (BUILD SUCCEEDED), ja kaikki testit menevät läpi.
- **18.10.2026:** Selvitetty moniajolla (4 rinnakkaista agenttia) hukkuneet tiedot ja ominaisuudet. Tallennettu ja varmuuskopioitu dokumentti SELVITYS-HUKKUNEET.md, palautettu scopes/performance/REKISTERI.md commitista a212f4ad, ja tallennettu patch sekä untracked-tiedostot hakemistoon scopes/lostdev/arkisto/.
- **Käyttäjä 18.10.2026:** Skoopin tarkoitus on etsiä kehityksessä hukkunutta kehitystietoa. Ensimmäinen työpaketti on selvittää moniajolla hukkuneet tiedot (äppi on menettänyt jo tehtyjä ominaisuuksia).
- **Käyttäjä 18.10.2026:** skooppi `scopes lostdev` luotiin komennolla `/pura uusi scopes lostdev`.

- **19.10.2026:** Käyttäjä 18.10.2026: skoopin tehtävä on etsiä kehityksessä hukkunutta kehitystietoa; ensimmäinen työ on selvittää hukkuneet tiedot moniajolla.

- **19.10.2026:** Käyttäjä 18.10.2026: jatketaan suosituksella (talteenotto ensin), mutta taustalla ajavat muut kehitykset eivät saa rikkoutua eikä niiden työ saa rikkoa tämän skoopin työtä; siksi ei globaaleja git-resettejä, stasheja eikä haarasiirtoja.

- **19.10.2026:** Koska sääntö 15 estää koskemasta muiden skooppien polkuihin, kriittinen koodi kopioitiin skoopin omaan arkisto-kansioon.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/lostdev/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
