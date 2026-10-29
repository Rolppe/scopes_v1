# scopes/agy/siirto/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: ei mitään — toteutus ja automaattitestit valmiit, odottaa käyttäjän kokeilua Scopes-äpistä (pakkaa / automaattisiirto) — polut: scopes/agy/siirto/** — aloitus: /pura scopes agy siirto

## Tarkoitus ja raja

Tarkoitus (käyttäjä 16.10.2026): Keskittyä AGY (Antigravity CLI / Gemini) -integraatioon Scopes-äpissä ja sen taustapalveluissa erityisesti purku-, pakkaus- ja automaattisiirto- (autovaihto) toimintojen osalta, jotta työnkulku toimii saumattomasti AGY-istunnoissa samalla tavalla kuin Claude-istunnoissa.

Raja: Skoopin omat tiedostot polussa `scopes/agy/siirto/**`. Skooppi vastaa purku-, pakkaus- ja autovaihtotyökalujen sekä taustapalvelurajapintojen AGY-integraatiosta (`claude/siirto/tools/`, `scopes/palvelu/purkajat.mjs`, `toiminnot.mjs` jne.). Muiden skooppien omiin tiedostoihin kohdistuvat muutokset koordinoidaan tai ilmoitetaan omistajille säännön 15 mukaan (`/vika`).

## Päätökset

- **Käyttäjä 16.10.2026:** skooppi `scopes agy siirto` luotiin komennolla `/pura uusi scopes agy siirto`.
- **Käyttäjä 16.10.2026 (AGY-SIIRTO-MAARITTELY):** Skoopin tarkoitus on keskittyä AGY-integraatioon Scopes-äpissä purku-, pakkaus- ja automaattisiirto-toimintojen osalta. Ensimmäiseksi työksi valittu purun, pakkauksen ja automaattisiirron nykytilan kartoitus (AGY-SIIRTO-KARTOITUS).
- **16.10.2026 (AGY-SIIRTO-KARTOITUS):** Kartoitettu purun, pakkauksen ja automaattisiirron nykytila ja AGY-puutteet (`scopes/agy/siirto/KARTOITUS.md`). Keskeisin ratkaistava puute on AGY:n oma pakkaustaito (`pakkaa/SKILL.md`), joka orkestroi olemassa olevat `pakkaa-alku`, `pakkaa-vaiheet` ja `pakkaa-loppu` -skriptit vastaanottaessaan `/pakkaa`- tai `/automaattisiirto`-komennon. Seuraavaksi työksi valittu toteutus (AGY-SIIRTO-TOTEUTUS).
- **16.10.2026 (AGY-SIIRTO-TOTEUTUS):** Toteutettu AGY:n pakkaus- ja automaattisiirtotaito (`.agents/skills/pakkaa/SKILL.md` ja `~/.gemini/config/skills/pakkaa/SKILL.md`). Päivitetty `sulje-ikkuna.sh` odottamaan AGY:n ruudun vapautumista (`? for shortcuts`) ennen sulkemista ja `autovaihto.sh` tuottamaan neutraali virheviesti ilman `AskUserQuestion`-mainintaa AGY-istunnoille. Lisätty testit `toiminnot.test.mjs` (automaattisiirto AGY tmux-ruutuun) ja `autovaihto.test.mjs` (neutraali virheviesti). Kaikki testit vihreät (246/246 palvelu ja siirto, 11/11 pakkaa-vaiheet).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| AGY-pakkaus- ja siirtotaidon sekä työkalujen toteutus ja todennus | valmis 16.10.2026 | testattu automatisoidusti, odottaa käyttäjän kokeilua Scopes-äpistä |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agy/siirto/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
