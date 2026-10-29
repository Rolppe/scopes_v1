# scopes/siirto/economy/REKISTERI.md

Tilanne: 27.10.2026

SEURAAVA PAKETTI: ei mitään — kaikki suunnitellut säästöpaketit valmiina

## Tarkoitus ja raja

**Tarkoitus:** Siirto-operaatioista (purku, pakkaus, vaihto, mallivalinnat) aiheutuvien kustannusten ja käyttörajojen hallinta ja optimointi, erityisesti AGY:n 1500 kutsun vuorokausirajan säästäminen ja budjetointi.

Raja: Polut `scopes/siirto/economy/**`, `scopes/palvelu/**`, `scopes/agy/siirto/pakkausscripti/**`, `.agents/skills/**`, `AGENTS.md`.
- **Sisällä:** Siirron ja purun kutsumäärien ja token-kustannusten mittaus ja analyysi, 1500 kutsun vuorokausirajan säästötoimenpiteet, siirtoketjujen (autovaihto, purku, pakkaus) optimointi vähäisimmille kutsukerroille, taustapalvelun deterministiset economy-rajapinnat.
- **Ulkona:** Itse siirtotyökalujen perusmekaniikka (`claude/siirto/**`), käyttörajojen UI-näytöt (`scopes/usagelimits/**`).

## Päätökset

- **Käyttäjä 27.10.2026:** skooppi `scopes siirto economy` luotiin komennolla `/pura uusi scopes siirto economy`.
- **Käyttäjä 27.10.2026:** Skoopin tehtävä on huolehtia siirto-operaatioista aiheutuvien kustannusten hallinnasta. Ensimmäinen tehtävä on selvittää paljonko infra expresso -skoopin purku vei käyttörajasta.
- **Käyttäjä 27.10.2026:** Kulutuksessa merkittävin tekijä on 1500 kutsun raja käytettäessä AGY:tä. Siirtotalouden optimoinnin pääpaino on tämän 1500 kutsun budjetin säästämisessä.
- **Selvitys 27.10.2026 (SIIRTO-ECONOMY-KULUTTAJAT):** Kartoitettu OnePlusin ja Macin AGY-kulutus. OnePlusilla tänään 92 käyttäjäpyyntöä ja 1 393 mallikutsua (PLANNER_RESPONSE). Macilla 93 käyttäjäpyyntöä ja 2 543 mallikutsua. Suurimmat kuluttajat: `scopes-siirto-git` (597 kutsua) ja `infra expresso` (585 kutsua neljässä rinnakkaisessa istunnossa). Lisäksi pakkauksen rekisterikirjuri tekee kymmeniä erilliskutsuja.
- **Erottelu 27.10.2026 (SIIRTO-ECONOMY-TYYPITYS):** Eroteltu 4 000 mallikutsun tyypit (Mac + OnePlus): 62 % passiivista tiedonhakua (find/grep 1011 kpl, read_file 972 kpl, git luku 498 kpl), 10 % taustatehtävien kytystä/odottelua (385 kpl), ja vain 6,4 % varsinaista koodin muokkausta (257 kpl). Yli 70 % kutsuista voidaan korvata äpin natiiveilla työkaluilla, esikäsittelyllä ja deterministisellä odotuksella.
- **Käyttäjä 27.10.2026:** Säästötoimenpiteiden (1500 kutsun kiintiön säästö) suunnittelu ja toteutus tehdään tässä skoopissa (`scopes siirto economy`). Tehdään automaattisiirto seuraavaan pakettiin.
- **Päätös 27.10.2026 (SIIRTO-ECONOMY-SUUNNITELMA):** Määritelty neljän säästökohteen arkkitehtuuri ja rajapinnat tiedostoon `scopes/siirto/economy/ARKKITEHTUURI.md`. Toteutettu taustapalvelun economy-moduuli `scopes/palvelu/economy.mjs` (git-tila, tiedostokartta, kulutuksen tyypittely) ja palvelimen rajapinnat `/api/economy/*`. Kaikki 200 palvelutestiä läpäisevät puhtaasti.
- **Päätös 27.10.2026 (ECONOMY-GIT-ESITIEDOT):** Toteutettu git-esitietojen deterministinen esisyöttö purkutiedostoihin ja istuntoihin. Moduuli `scopes/siirto/economy/git-esitiedot.mjs` hakee ja muotoilee haaran, HEAD-commitin, skoopin omat muutokset ja vieraat muutokset sekä kieltää toistuvat git status/log/diff -kutsut. Kytketty mallittomaan purkuun `claude/siirto/tools/pura-malliton.mjs` ja taustapalveluun `scopes/palvelu/economy.mjs` (`GET /api/economy/git-tila?muoto=teksti`). Luotu verifiointiportti `gate.sh`. Kaikki testit läpäisevät puhtaasti.
- **Päätös 27.10.2026 (ECONOMY-TASK-ODOTUS):** Toteutettu komentoviiveiden optimointi ja manage_task-pollauksen esto (säästö ~350–385 kutsua/vrk). Moduuli `scopes/siirto/economy/task-odotus.mjs` määrittää ohjeistuksen ja analysointityökalut (WaitMsBeforeAsync: 10000 suositus, manage_task status/list -esto ja reactive wakeup). AGY-säännöt päivitetty (`AGENTS.md`) ja kytketty mallittomaan purkuun (`pura-malliton.mjs`). Taustapalveluun lisätty `GET /api/economy/task-odotus` ja kulutustilastoon status-pollingin seuranta. Verifiointiportti `gate.sh` päivitetty. Kaikki testit läpäisevät puhtaasti.
- **Päätös 27.10.2026 (ECONOMY-TIEDOSTOKARTTA):** Toteutettu tiedostokartta ja deterministinen koodi-indeksi (säästö ~1 000 kutsua/vrk ilman find/grep-sokkohakuja). Moduuli `scopes/siirto/economy/tiedostokartta.mjs` luetteloi tiedostot, poimii funktiot/luokat/otsikot regexillä ja muodostaa suorat `file://`-linkit. Taustapalveluun kytketty laajennettu `GET /api/economy/tiedostokartta` (`muoto=teksti`, `indeksi=1`, `haku=<termi>`) ja reititetty `palvelin.mjs`:ään. Verifiointigate `gate.sh` päivitetty ja kaikki 22 economy-testiä läpäisevät puhtaasti.
- **Päätös 27.10.2026 (ECONOMY-HYBRIDI):** Toteutettu deterministinen hybridipakkaus kaikkiin skooppeihin vanhan vaihepakkauksen korvaamiseksi (säästö ~60–105 kutsua/vrk). Luotu moduuli `scopes/siirto/economy/hybridi-pakkaus.mjs` ja testit `hybridi-pakkaus.test.mjs`. Kanonisoitu skooppien rekisteri- ja hakemistoratkaisu `scopes/agy/siirto/pakkausscripti/skooppipolku.mjs`:ään (myös claude, infra, plugin). Agy-pakkaustaidot (`.agents/skills/pakkaa/SKILL.md` ja automaattisiirto) päivitetty käyttämään `pakkaa-hybridi.mjs`:ää oletuksena kaikille skoopeille. Taustapalveluun lisätty `GET /api/economy/hybridi-pakkaus`. Verifiointigate `gate.sh` päivitetty. Kaikki 27 economy-testiä läpäisevät puhtaasti.
- **Päätös 27.10.2026 (ECONOMY-KULUTTAJAT):** Toteutettu suurimpien kuluttajien (`scopes siirto git`, `infra expresso`) kutsujen analysointi ja karsinta (säästö ~1 007 kutsua/vrk). Luotu moduuli `scopes/siirto/economy/kuluttajat.mjs` ja yksikkötestit `kuluttajat.test.mjs`. Määritetty siirto-gitin (git-tilan esisyöttö, yhdistetty etä/paikallistarkastus `tarkistaMolemmatGitTilat`, säästö +517 kutsua) ja infra expresson (tiedostokartan hyödyntäminen, smoke-testien koontiajo `muodostaExpressoTestiAjoKomento`, `WaitMsBeforeAsync: 10000`, säästö +490 kutsua) karsintatoimet. Taustapalveluun lisätty `GET /api/economy/kuluttajat` ja kytketty `palvelin.mjs`:ään. Verifiointigate `gate.sh` päivitetty. Kaikki 34 testiä läpäisevät puhtaasti.
- **Päätös 27.10.2026 (ECONOMY-BUDJETTI):** Toteutettu 1 500 kutsun vuorokausibudjetointi ja siirtojen säästöstrategiat. Luotu moduuli `scopes/siirto/economy/budjetti.mjs` ja yksikkötestit `budjetti.test.mjs`. Määritetty kiintiön, kulutusnopeuden (burn rate) ja loppuennusteen seuranta suhteessa Tyynenmeren nollausaikaan. Asetettu istuntokohtainen tavoitekatto (~25–30 kutsua / paketti, max 60), jolla 1 500 kutsun kiintiö riittää jopa 50 kehityspakettiin vuorokaudessa. Lisätty säästötilat (NORMAALI, SAASTOTILA, KRIITTINEN_SAASTO). Taustapalveluun lisätty `GET /api/economy/budjetti` (`scopes/palvelu/economy.mjs` ja `palvelin.mjs`). Verifiointigate `gate.sh` päivitetty. Kaikki 40 testiä läpäisevät puhtaasti.

- **Korjaus 27.10.2026 (MAC-AGY-PURA):** Korjattu puuttuva `existsSync`-tuonti tiedostossa `scopes/palvelu/toiminnot.mjs`. Korjaus poistaa `ReferenceError: existsSync is not defined` -virheen purettaessa ja synkronoitaessa mac-agy-istuntoja.

- **27.10.2026:** Varmistetaan mac-agy-istuntojen tilatiedostojen synkronointiin tarvittavat node:fs-funktiot suoraan toiminnot.mjs-moduulin tuonnoissa

- **27.10.2026:** Käytetään determinististä hybridipakkausta oletuksena kaikille skooppiperheille

- **27.10.2026:** Pidä säästösäännöt (ECONOMY-TASK-ODOTUS, status-pollauksen esto, reaktiivinen herätys) globaaleina AGENTS.md-sääntöinä

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/siirto/economy/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
