# scopes/agy/pre/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: ei mitään — kysytty 16.10.2026: Ei nyt (odottaa käyttäjää: kokeilu puhelimella, kyselykorttipaketti, agy-effortin oletus)

## Tarkoitus ja raja

Tarkoitus (käyttäjä 16.10.2026): skoopin keskustelu eli istunto ajetaan agy-mallilla Gemini 3.8 Flash, ja purku tehdään purascriptillä (`claude/siirto/tools/pura-malliton.mjs`, ei purkajamallia). Skooppi on esityö: se selvittää, mitä agy-istunnon käynnistys uudelle ja olemassa olevalle skoopille vaatii.

Raja: skoopin omat ovat selvitys ja suunnitelma `scopes/agy/pre/`-alla. Käytettävä agy on chrootin Linux-agy `~/.local/bin/agy` (käyttäjä 16.10.2026: "ei Android-agy-integrointia vaan Linux-agy, joka on jo asennettu"). Ei kuulu: Android-agy (scopes agy android), agy:n binääri ja mallilista (scopes agy, scopes agy models), Scopes-palvelun ja äpin muutokset (scopes palvelu, scopes ios), purascriptin ydin (scopes context purascript). Muutos näihin kirjataan omistajalle `/vika`.

Lähtötiedot (todennettu 16.10.2026): `agy models` listaa 6 mallia, mukana `gemini-3.8-flash-high/-medium/-low`; äppi tarjoaa agy-mallit vain purkajan valinnassa (`scopes/ios/Sources/PuraValinta.swift`), ei istunnon mallin valinnassa (vain Claude ja Paikalliset); scopes-perheen skoopeilta purkajan valinta on piilotettu ja perheen purku on malliton; Remote Control -istunto (`avaaIstunto`, `scopes/palvelu/toiminnot.mjs`) käynnistää Claude Coden.

## Päätökset

- **Käyttäjä 16.10.2026:** skooppi `scopes agy pre` luotiin komennolla `/pura uusi scopes agy pre`; tarkoitus oli kokeilla uuden skoopin luontia purascriptillä ja istunnon mallina agy flash 3.8, mutta agy-malleja ei vielä ollut valittavissa äpissä.
- **Käyttäjä 16.10.2026 (AGY-PRE-MAARITTELY):** "Istunto agy flash 3.8. Purku purascript" → istunnon malli on agy Gemini 3.8 Flash, purku purascript. Valittu määrittely tässä (Claude) -istunnossa; hylätty: agy-purun valmistelu ennen määrittelyä.

- **16.10.2026:** Käyttäjä: istunto agy flash 3.8, purku purascript; linux-agy (ei Android); reitti autovaihto.sh:n agy-haara; Always allow -kytkin: "palvelin vastaa agy-kyselyihin" (ei skip-permissions, ei Claude-istuntoihin); valinta 2 "tämä keskustelu", ei pysyvää; "Hyväksy, mutta älä salli datan keräystä"; "Luota kansioon"; seuraava: pakkaa vain.

- **16.10.2026:** Hylätty: onboarding.json:n muokkaus käsin; agy-ehtojen hyväksyntä agentin puolesta; tmux-ruudun näyttö äpissä; pelkkä tmux-käyttö.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Agy-istunto Scopes-äpistä: autovaihto.sh:n agy-haara, agy-mallit istunnon malleiksi (`· oneplus linux`), uusi skooppi ja Pura agy-mallilla, istunnon viestit agy:n keskustelutiedostosta, Always allow -kytkin (Asetukset → Luvat) | toteutettu ja asennettu puhelimeen 16.10.2026; testit palvelu 152/152, autovaihto 11/11, pura-malliton 44/44; koodi on muiden skooppien poluissa committaamatta, omistajille tiedoksi V-538…V-544 | odottaa käyttäjää: kokeilu puhelimella (uusi scopes-skooppi agy-mallilla, viestit, Always allow päälle) |
| Agy:n kysymykset (numeroidut vaihtoehdot) eivät näy kortteina äpissä, eikä lupakyselyihin voi vastata ilman Always allow -kytkintä | auki; kysely on vain tmux-ruudulla | odottaa käyttäjää: päätös, tehdäänkö oma paketti kyselykorteille |
| Agy-effort (`low`/`medium`/`high`) oletus | käyttäjän päätös | odottaa käyttäjää |
| Koko UI-sarja (24 min) punainen 16.10.2026 muissa testeissä (Liitteet, Luonnos, Malli, Skoopit-luokka) | odottaa toista skooppia (scopes testit, tiedoksi V-543): syytä ei selvitetty, ajossa mukana muiden keskeneräiset Swift-muutokset **16.10.2026:** Muut testit 16.10.2026 vihreät: palvelu 152/152 (agy-luvat, agy-istunto, viestit 28+, toiminnot, asetukset), autovaihto 11/11, pura-malliton 44/44; iOS testAsetustenAlavalikot ja uuden skoopin valitsintestit exit 0. Koko UI-sarja (24 min) punainen muissa testeissä (Liitteet, Luonnos, Malli, Skoopit-luokka), syytä ei selvitetty. | ei tämän skoopin työtä |

## Viat

| Vika | Tila |
|---|---|
| agy:n lupakyselyihin ei voi vastata äpistä ilman Always allow -kytkintä (kysely on vain ruudulla) | avoin |

## Historia

Historia: `scopes/agy/pre/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
