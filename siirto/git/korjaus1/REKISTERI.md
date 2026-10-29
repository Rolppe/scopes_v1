# scopes/siirto/git/korjaus1/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ei mitään — haarautuma korjattu ja haara puskettu (todennettu 28.10.2026); jäljellä vain käyttäjän päätös ScopesCore-stasheista ja varmuushaarasta (Avoimet asiat) — polut: koko repo — aloitus: /pura scopes siirto git korjaus1

## Tarkoitus ja raja

Skooppi korjaa haaran `claude/charming-brahmagupta-p9hmm7` haarautuman: paikallinen haara ja `origin` olivat erkaantuneet yhteisestä kannasta `9a4f6670` ilman yhteistä kärkeä, joten pura ja pakkaa eivät saaneet synkkaa läpi.

Raja: yhdistämispäätös (rebase vai merge) on käyttäjän; skooppi kartoittaa, ehdottaa ja toteuttaa valitun tavan, mutta ei päätä sitä itse. Toisten skooppien rekistereihin ei kirjoiteta muuta kuin konfliktin vaatima ratkaisu.

## Päätökset

- **Käyttäjä 18.10.2026:** skooppi `scopes siirto git korjaus1` luotiin komennolla `/pura uusi scopes siirto git korjaus1`.
- **Käyttäjä 18.10.2026:** skoopin tarkoitus on haaran haarautuman korjaus (kartoitus + yhdistämistavan valinta + toteutus).
- **Käyttäjä 18.10.2026:** yhdistämistapa on `git pull --rebase --autostash origin claude/charming-brahmagupta-p9hmm7`.
- **Käyttäjä 19.10.2026:** työpuun committoimattomat ScopesCore-muutokset: origin-versio voittaa, työpuun versio jää `stash@{0}`:aan talteen.

- **28.10.2026 (tilannetarkistus, scopes siirto git):** SIIRTO-GIT-KORJAUS1-PUSH tehty: `git rev-list --left-right --count origin...HEAD` = HEAD 0 edellä, korjaus1-commit `b2b57a8a` on originin esivanhempi.

## Tehty 18.–19.10.2026

- **Kartoitus 18.10.2026:**
  - Yhteinen kanta: `9a4f6670 docs(scopes istunnot): automaattisiirto ja V-555 kirjaus`.
  - Paikallinen haara 17 committia edellä (siirtoskooppityö), `origin` 9 committia edellä (`scopes macos`, `scopes performance ios`, `scopes kordinaattori` valmis, jaettu `ScopesUI`/`ScopesCore`).
  - Päällekkäisiä tiedostoja 2: `claude/siirto/mittaukset/ajajat.jsonl` (auto-merge ok) ja `scopes/kordinaattori/REKISTERI.md` (add/add-konflikti).
- **Rebase 18.10.2026:** `--autostash`-ajo; varmuuskopio `backup/korjaus1-pre-rebase` (osoittaa `196d12de`, ennen rebasea). Konflikti `scopes/kordinaattori/REKISTERI.md`:ssä ratkaistiin origin-versiolla (valmis KORDINAATTORI-VALMIS-rekisteri voitti paikallisen stubin); rebase eteni 17/17 ja haara on nyt originin päällä (0 jäljessä).
- **Autostash-palautus 18.10.2026:** committoimattomat ScopesCore-muutokset konfliktoivat originin kanssa 4 tiedostossa. Ratkaisu 19.10.2026 (käyttäjän päätös): origin-versio voittaa; työpuu palautettiin `git checkout HEAD --` (ScopesClient.swift, ScopeModels.swift, ScopesClientTests.swift, ScopeModelsTests.swift). Muutokset ovat `stash@{0}`:ssa.

## ScopesCore-analyysi (syyt päätökseen)

Työpuun muutos oli päällekkäinen originin kanssa, ei additiivinen — siksi "yhdistä molemmat" ei ollut toteutettavissa ehjänä:

| Työpuun lisäys | Törmäys originin kanssa |
|---|---|
| `SkooppiTiedot`, `RekisteriTiedosto` (ScopesCore) | macOS-moduuli (`MacTypes.swift:89`, `:233`) määrittelee samat nimet itse ja importtaa ScopesCore → tuplanimi |
| `AvoinAsia` | macOS:lla on jo `AsiaKohta` samaan käyttöön (`MacTypes.swift:32`) |
| `skooppiTiedot()` / `rekisteri()` (ScopesCore) | originissa jo `MacTypes.swift:190` / `:228` (extension) |
| `VikaKohta` + `CodingKeys "Vika"/"Tila"` | **väärä muoto**: `/api/viat` palauttaa `{vika, tila}` pienillä kirjaimilla (`lahteet.mjs:613`), dekoodaus hajoaisi; origin-versiossa ei ole CodingKeysiä ja se on oikein |

Yksikään työpuun lisäys ei ollut uusi toiminnallisuus — origin toimittaa saman macOS-moduulin kautta.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| ScopesCore-stash (työpuun ScopesCore-muutos) | odottaa käyttäjää; 28.10.2026 indeksi siirtynyt: `stash@{2}` (autostash 18.10.2026, 49 tiedostoa) ja sama ScopesCore-muutos myös `stash@{3}` (autostash 17.10.2026, 70 tiedostoa) | käyttäjä päättää, poistetaanko vai sovitetaanko macOS-moduuliin; viittaa stashiin päiväyksellä, ei indeksillä |
| `backup/korjaus1-pre-rebase` (196d12de) | odottaa käyttäjää; 28.10.2026 `git cherry`: 13/17 committia patch-identtisinä originissa, 4 samalla otsikolla konfliktiratkaisun jälkeen (kordinaattori, ARVIO 3/6 ×2, ARVIO 5/6) | käyttäjä päättää haaran poistosta |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/siirto/git/korjaus1/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
