# scopes localregister — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-APPI — Scopes-äppiin paikallinen kopio yksiköistä, synkka /api/lr/-polkuja vasten (laukaisijat MUOTO §5) ja ristiriitojen ratkaisunäkymä (K4); edellyttää Scopes-palvelun uudelleenkäynnistystä, jotta /api/lr/ on käytössä (MUOTO §10) — polut: scopes/localregister/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Kaksoiskappale ja palvelinpää (MUOTO §7–§10) | protokolla valmis 14.10.2026, palvelu käynnistämättä uudelleen | käyttäjän lupa palvelun uudelleenkäynnistykseen, sitten LOCALREGISTER-APPI |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-APPI — Scopes-äppiin paikallinen kopio yksiköistä, synkka /api/lr/-polkuja vasten (laukaisijat MUOTO §5) ja ristiriitojen ratkaisunäkymä (K4); palvelinpää käytössä portissa 8787 (MUOTO §10) — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Äppi | avoin (ei aloitettu) | LOCALREGISTER-APPI: paikallinen kopio, synkka /api/lr/ vastaan (laukaisijat MUOTO §5), ristiriitojen ratkaisunäkymä (ratkaisu = yksikkö, jonka versio ≥ kaikkia rinnakkaisia, lähetetään /api/lr/laheta). |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-LAITETESTI — äppi puhelimeen (scopes/ios/asenna.sh) ja rekisterisynkka tuotantoa (8787) vastaan oikealla laitteella; käyttäjä kokeilee rivin muokkausta ja ristiriitaa — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Laitetesti | avoin (ei aloitettu) | LOCALREGISTER-LAITETESTI: asennus puhelimeen ja koe tuotantoa vastaan. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-RIVINVAIHTO — taulukkorivin muokkaus äpissä ei saa viedä rivinvaihtoa riviin (laitetestin löydös 14.10.2026: "Koe1" katkaisi taulukon `teksti/`-tulosteessa); korjaus äppiin (Muokkaa riviä) ja palvelimen vastaanottoon, testit — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rivinvaihto taulukkorivissä | avoin | LOCALREGISTER-RIVINVAIHTO: taulukkorivin (laji avoin/vika tms. taulukko) muokkaus ei saa viedä rivinvaihtoa riviin — äppi (LrMuokkausView / LrTeksti.talteen) ja palvelimen vastaanoton tarkistus, testit. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-RIVINVAIHTO-TODENNUS — rivinvaihtokorjauksen (9d0e7a75) todennus: UI-koe testLrTaulukkoriviRivinvaihto vihreäksi koeinstanssia 8799 vastaan (LuLu: käyttäjä valitsee "hyväksy aina", agentti poistaa säännöt testien lopuksi), sitten tuotannon palvelun uudelleenkäynnistys ja äpin asennus puhelimeen (kysy käyttäjältä) — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rivinvaihto taulukkorivissä | korjattu 9d0e7a75 14.10.2026 (koodi ja yksikkötestit valmiit; UI-koe ja käyttöönotto tekemättä); odottaa käyttäjää **14.10.2026:** tuotannon kaksoiskappaleessa (80 rekisteriä) yksi rikkinäinen taulukkorivi: scopes/localregister/REKISTERI.md oneplus-005655 (muuttaja iphonemcll, laitetestin jälki `\| Rivin lisäys äpissä \| … \|\nKoe1`); claude/siirto/HISTORIA.md oneplus-003353 alkaa sisennyksellä `    \|` (git-tuotu listan jatko), ei taulukkorivi — siksi sääntö ei poista alkuvälilyöntejä. (todenna viim. 28.10.2026) | LOCALREGISTER-RIVINVAIHTO-TODENNUS: LuLu-kehotteisiin käyttäjä valitsee "hyväksy aina"; aja `SCOPES_OSOITE=http://192.0.2.11:8799 SCOPES_KOE_LR=1 SCOPES_VAIN=LrUITests/testLrTaulukkoriviRivinvaihto bash scopes/ios/testi.sh` vihreäksi; sitten tuotannon palvelun uudelleenkäynnistys ja äpin asennus puhelimeen (kysy käyttäjältä), 005655-rivin siistiys muokkaamalla; testien lopuksi agentti poistaa ajon aikana syntyneet Skoopit/SkoopitUITests-Runner-LuLu-säännöt lulu-hallinnalla. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-RIVINVAIHTO-TODENNUS — loppuosa: UI-koe vihreä 14.10.2026 (1417a7af); tuotannon palvelun uudelleenkäynnistys ja äpin asennus puhelimeen (kysy käyttäjältä), sitten oneplus-005655-rivin siistiys muokkaamalla — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rivinvaihto taulukkorivissä | korjattu 9d0e7a75 14.10.2026 (koodi ja yksikkötestit valmiit; UI-koe vihreä 14.10.2026 1417a7af, käyttöönotto tekemättä); odottaa käyttäjää **14.10.2026:** tuotannon kaksoiskappaleessa (80 rekisteriä) yksi rikkinäinen taulukkorivi: scopes/localregister/REKISTERI.md oneplus-005655 (muuttaja iphonemcll, laitetestin jälki `\| Rivin lisäys äpissä \| … \|\nKoe1`); claude/siirto/HISTORIA.md oneplus-003353 alkaa sisennyksellä `    \|` (git-tuotu listan jatko), ei taulukkorivi — siksi sääntö ei poista alkuvälilyöntejä. (todenna viim. 28.10.2026) | LOCALREGISTER-RIVINVAIHTO-TODENNUS: tuotannon palvelun uudelleenkäynnistys ja äpin asennus puhelimeen (kysy käyttäjältä), sitten 005655-rivin siistiys muokkaamalla. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-RIVIN-LISAYS — Rivin lisäys äpissä: järjestysavain lr.mjs `valiin`-portilla; liittyy Reunatapaus-riviin (RIVINVAIHTO-TODENNUS tehty 14.10.2026, e3306e10) — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rivin lisäys äpissä | avoin (ei aloitettu) | järjestysavain lr.mjs `valiin`-portilla; liittyy Reunatapaus-riviin. |
| Puhelimen kopion yhtenevyys 005655:n osalta | avoin (todentamatta; ei estä muuta työtä) | kun puhelin seuraavan kerran synkkaa, `devicectl device copy from` äpin kopiosta tai käyttäjän näkymästä. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Koeinstanssi jäi päälle | avoin 14.10.2026: HISTORIA (RIVINVAIHTO-TODENNUS) sanoo "Koeinstanssi pysäytetty", mutta edellisen session 8799-instanssi (pid 17603, käynnistetty 20.06, HOME=edellisen session scratchpad) kuunteli yhä 20.18; seuraava session uusi instanssi kaatui EADDRINUSE:en ja `curl` vastasi vanhasta. Pysäytetty `kill 17603`. Korjaus: koeinstanssin pysäytys todennetaan `ss -ltn \| grep 8799` -tyhjällä ennen kuin pysäytys kirjataan. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-RIVIN-LISAYS — Rivin lisäys äpissä jatkuu: koodi 1442efe7 (valiin Swiftiin 408/408, Lr.lisaa, lr-testit 10/10); UI-koe testLrRivinLisays punainen, koska rivin Lisää alle -pyyhkäisytoiminto ei avaudu — katso kuva lr-pyyhkaisy (Macin ~/scopes-ios/lr-lisays.xcresult), korjaa avaus ja aja koe vihreäksi koeinstanssia 8799 vastaan — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rivin lisäys äpissä | kesken 1442efe7 14.10.2026 (koodi, valiin 408/408, lr-testit 10/10; UI-koe punainen) | järjestysavain lr.mjs `valiin`-portilla; liittyy Reunatapaus-riviin. Seuraavaksi: katso kuva lr-pyyhkaisy xcresultista; korjaa pyyhkäisyn avaus (esim. contextMenu/pitkä painallus tai näkyvä painike rivin vieressä tai editorin yläpalkki) ja aja `SCOPES_OSOITE=http://192.0.2.11:8799 SCOPES_KOE_LR=1 SCOPES_VAIN=LrUITests/testLrRivinLisays SCOPES_TULOS=lr-lisays bash scopes/ios/testi.sh` vihreäksi koeinstanssia vastaan; pysäytys todennetaan ss:llä. |
| Puhelimen kopion yhtenevyys 005655:n osalta | avoin (todentamatta; ei estä muuta työtä) **14.10.2026:** UI-koe testLrRivinLisays (koeinstanssi 8799) ei löytänyt taulukon viimeistä riviä, koska 005655 on riidassa palvelimen kaksoiskappaleessa (tuotanto 8787 ja sen kopio koeinstanssissa; ei puhelimen kopio) (ajo 1, EXIT=65); ajot 2–4 kaatuivat muihin syihin (Lisää rivi alle -painike näppäimistön alla; pyyhkäisytoimintoa `lr-lisaa-<id>` / "Lisää alle" ei löydy, LrUITests.swift:253). | kun puhelin seuraavan kerran synkkaa, `devicectl device copy from` äpin kopiosta tai käyttäjän näkymästä. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Koeinstanssi jäi päälle | avoin 14.10.2026: HISTORIA (RIVINVAIHTO-TODENNUS) sanoo "Koeinstanssi pysäytetty", mutta edellisen session 8799-instanssi (pid 17603, käynnistetty 20.06, HOME=edellisen session scratchpad) kuunteli yhä 20.18; seuraava session uusi instanssi kaatui EADDRINUSE:en ja `curl` vastasi vanhasta. Pysäytetty `kill 17603`. Korjaus: koeinstanssin pysäytys todennetaan `ss -ltn \| grep 8799` -tyhjällä ennen kuin pysäytys kirjataan. Pysäytys todennettu 14.10.2026: 0 kuuntelijaa. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-PARITUS-RIITA — Uudelleentuonnin paritus synnyttää riidan: tuotannon 005655 riita syntyi, kun osumattoman välin paritus antoi äpin koskeman rivin git-muutoksen rinnakkaiseksi; arvioi, pitääkö parituksen vaatia sisällöllistä samankaltaisuutta, korjaa lr.mjs:ään testeineen (lr.test.mjs) ja kokeile koeinstanssissa 8799 — polut: scopes/localregister/** — aloitus: /pura scopes localregister — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Puhelimen kopion yhtenevyys 005655:n osalta | avoin (todentamatta; ei estä muuta työtä) **14.10.2026:** UI-koe testLrRivinLisays (koeinstanssi 8799) ei löytänyt taulukon viimeistä riviä, koska 005655 on riidassa palvelimen kaksoiskappaleessa (tuotanto 8787 ja sen kopio koeinstanssissa; ei puhelimen kopio) (ajo 1, EXIT=65); ajot 2–4 kaatuivat muihin syihin (Lisää rivi alle -painike näppäimistön alla; pyyhkäisytoimintoa `lr-lisaa-<id>` / "Lisää alle" ei löydy, LrUITests.swift:253). **14.10.2026:** UI-kokeen pyyhkäisyn epäonnistumisen syy (puhelimen kopio): `SivuttaisVeto` (scopes/ios/Sources/Juuri.swift, UIPanGestureRecognizer koko näkymän päällä, alkaa kun \|vx\| > 2\|vy\|) ottaa jokaisen vaakavedon ja avaa sivupalkin, joten leading-pyyhkäisytoiminto oli tavoittamaton myös puhelimessa, ei vain kokeessa (lr-pyyhkaisy-kuvat). Ei NavigationStackin reunaele. | kun puhelin seuraavan kerran synkkaa, `devicectl device copy from` äpin kopiosta tai käyttäjän näkymästä. |
| Uudelleentuonnin paritus synnyttää riidan | avoin 14.10.2026 | tuotannossa 005655 riidassa (ks. Todettu); arvioi, pitäisikö osumattomien välien parituksen vaatia sisällöllistä samankaltaisuutta ennen kuin äpin koskema rivi saa git-muutoksen rinnakkaiseksi; riita ratkaistaan äpistä. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-005655-RATKAISU — tuotannon 005655-riita (3 rinnakkaista, ennen a6c391ea:n paritus-korjausta syntynyt) ratkaistaan lähteen versiolla: harjoitus koeinstanssissa 8799 (UI-testi testLrRistiriitaLahdeVoittaa, SCOPES_KOE_LR_ID=oneplus-005655), tuotantoajo 8787 käyttäjän luvalla — polut: scopes/localregister/**, scopes/ios/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Hautakivien siivous | avoin (ei tarvita vaiheessa 1) | MUOTO §4. |
| Puhelimen kopion yhtenevyys 005655:n osalta | avoin (todentamatta; ei estä muuta työtä) **14.10.2026:** UI-koe testLrRivinLisays (koeinstanssi 8799) ei löytänyt taulukon viimeistä riviä, koska 005655 on riidassa palvelimen kaksoiskappaleessa (tuotanto 8787 ja sen kopio koeinstanssissa; ei puhelimen kopio) (ajo 1, EXIT=65); ajot 2–4 kaatuivat muihin syihin (Lisää rivi alle -painike näppäimistön alla; pyyhkäisytoimintoa `lr-lisaa-<id>` / "Lisää alle" ei löydy, LrUITests.swift:253). **14.10.2026:** UI-kokeen pyyhkäisyn epäonnistumisen syy (puhelimen kopio): `SivuttaisVeto` (scopes/ios/Sources/Juuri.swift, UIPanGestureRecognizer koko näkymän päällä, alkaa kun \|vx\| > 2\|vy\|) ottaa jokaisen vaakavedon ja avaa sivupalkin, joten leading-pyyhkäisytoiminto oli tavoittamaton myös puhelimessa, ei vain kokeessa (lr-pyyhkaisy-kuvat). Ei NavigationStackin reunaele. **14.10.2026:** tuotantodatan kopiolla (ei kirjoitettu tuotantoon) `lr.mjs tuo` HEAD c71d82ea: 80 muuttumatonta, ristiriita 0, `testaa` edestakaisin 80/80; koeinstanssia 8799 ei käynnistetty (sama `lr.mjs tuo` -polku). | kun puhelin seuraavan kerran synkkaa, `devicectl device copy from` äpin kopiosta tai käyttäjän näkymästä. |
| Tuotannon 005655-riita (3 rinnakkaista) | avoin 14.10.2026 (tuotantoon kirjoitus); odottaa käyttäjää | harjoitus koeinstanssissa 8799 kopiolla: `SCOPES_KOE_LR_ID=oneplus-005655` + UI-testi testLrRistiriitaLahdeVoittaa (scopes/ios/testi.sh, e3306e10), sitten tuotantoajo 8787 käyttäjän luvalla. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-HAUTAKIVET — Hautakivien siivous (MUOTO §4: poisto ja rekisterien määrä); tuotannossa rivin perässä puhelimen muokkaus "palvelin", jota ei kirjoiteta lähteeseen ilman käyttäjää — polut: scopes/localregister/** — aloitus: /pura scopes localregister — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Hautakivien siivous | avoin (ei tarvita vaiheessa 1; heti ajettava) | MUOTO §4. Huom: tuotannossa rivin perään puhelimen muokkaus "palvelin" (iphonemcll 14.10.2026 18.04) — käyttäjän tarkoitus selvittämättä; ei kirjoiteta takaisin lähteeseen ilman käyttäjää. |
| Äpin asennus puhelimeen (rivin lisäys pitkällä painalluksella) | avoin; odottaa käyttäjää | `bash scopes/ios/asenna.sh` käyttäjän luvalla; sen jälkeen käyttäjä voi lisätä rivin puhelimessa. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-SIIVOUS-TUOTANTO — odottaa käyttäjää: äpin asennus puhelimeen (`bash scopes/ios/asenna.sh` käyttäjän luvalla; tuo myös siivouksen tuen c098f9ee), sitten `siivoa` `lr.mjs tuo`:n loppuun ja tuotantoon palvelun uudelleenkäynnistyksellä käyttäjän luvalla — polut: scopes/localregister/** — aloitus: /pura scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Äpin asennus puhelimeen (rivin lisäys pitkällä painalluksella) | avoin; odottaa käyttäjää | `bash scopes/ios/asenna.sh` käyttäjän luvalla; sen jälkeen käyttäjä voi lisätä rivin puhelimessa. Asennus tuo myös hautakivien siivouksen tuen (c098f9ee). |
| Siivous tuotantoon | avoin; odottaa käyttäjää | kun käyttäjä on hyväksynyt `bash scopes/ios/asenna.sh` (rivi "Äpin asennus puhelimeen" — asennus tuo nyt myös siivouksen tuen): lisää `siivoa` `lr.mjs tuo`:n loppuun (kaikille rekistereille), testit, ja tuotantoon tulo Scopes-palvelun uudelleenkäynnistyksellä käyttäjän luvalla (TYOTAVAT 22) tai seuraavalla HEAD-muutoksella, joka ajaa tuonnin. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: Rivin lisäys puhelimessa (lisää rivi pitkällä painalluksella uudessa äpissä, agentti tarkistaa palvelimelta), Riita oneplus-005612 (ratkaise äpin ristiriitanäkymässä); LOCALREGISTER-SIIVOUS-TUOTANTO valmis 14.10.2026 (57b82ae2)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Puhelimen kopion yhtenevyys 005655:n osalta | avoin (todentamatta; ei estä muuta työtä) **14.10.2026:** UI-koe testLrRivinLisays (koeinstanssi 8799) ei löytänyt taulukon viimeistä riviä, koska 005655 on riidassa palvelimen kaksoiskappaleessa (tuotanto 8787 ja sen kopio koeinstanssissa; ei puhelimen kopio) (ajo 1, EXIT=65); ajot 2–4 kaatuivat muihin syihin (Lisää rivi alle -painike näppäimistön alla; pyyhkäisytoimintoa `lr-lisaa-<id>` / "Lisää alle" ei löydy, LrUITests.swift:253). **14.10.2026:** UI-kokeen pyyhkäisyn epäonnistumisen syy (puhelimen kopio): `SivuttaisVeto` (scopes/ios/Sources/Juuri.swift, UIPanGestureRecognizer koko näkymän päällä, alkaa kun \|vx\| > 2\|vy\|) ottaa jokaisen vaakavedon ja avaa sivupalkin, joten leading-pyyhkäisytoiminto oli tavoittamaton myös puhelimessa, ei vain kokeessa (lr-pyyhkaisy-kuvat). Ei NavigationStackin reunaele. **14.10.2026:** tuotantodatan kopiolla (ei kirjoitettu tuotantoon) `lr.mjs tuo` HEAD c71d82ea: 80 muuttumatonta, ristiriita 0, `testaa` edestakaisin 80/80; koeinstanssia 8799 ei käynnistetty (sama `lr.mjs tuo` -polku). **14.10.2026:** klo 20.55 tuotannon riidan tila ennen ratkaisua: pääversio iphone46a2 + 3 oneplus-rinnakkaista (5749, 5766 "Puhelimen kopion yhtenevyys…" kahdesti, 5785), kaikki vanhan parituksen tuotoksia (viimeinen tuonti 20.45, a6c391ea committoitu 20.49); Korjatun koodin tuonti nykyisestä lähteestä tekee 005655:stä oneplus-poiston (5802): lähde poisti rivin, joten lähteen versio on poisto, ei sisältö; simuloitu kopiolla ennen tuotantoa: riita 1 (vain 005655), lahdeSisalto null. | puhelimen seuraava synkka tuo poiston; tarkista `devicectl device copy from` äpin kopiosta tai käyttäjän näkymästä. |
| Rivin lisäys puhelimessa | avoin; odottaa käyttäjää | käyttäjä lisää rivin pitkällä painalluksella uudessa äpissä; agentti tarkistaa palvelimelta (`GET /api/lr/teksti/<polku>`), että rivi tuli. |
| Riita oneplus-005612 (testirivi "Hautakivien siivous", scopes/localregister/REKISTERI.md) | avoin; odottaa käyttäjää | käyttäjä ratkaisee äpin ristiriitanäkymässä; sen jälkeen seuraava tuonti siivoaa kiven, jos poisto voittaa. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-SIMU-YHTEYS — selvitä ja korjaa simulaattorin UI-testiajajan aikakatkaisu palveluun (NSURLError -1001, 192.0.2.11:8799), aja sitten riidan oneplus-005612 ratkaisu (harjoitus 8799 → tuotanto 8787, testLrRistiriitaLahdeVoittaa) ja rivin lisäys siivoavana (SCOPES_KOE_LR_POISTA=1, harjoitus → tuotanto), lopuksi puhelimen devicectl-vertailu (testit: scopes/ios/UITests/LrUITests.swift) — polut: scopes/localregister/ — aloitus: /pura scopes localregister — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rivin lisäys puhelimessa | avoin (agentti ajaa, ei enää käyttäjää); odottaa ajoa | kun simulaattoriyhteys toimii: harjoitus `SCOPES_OSOITE=http://192.0.2.11:8799 SCOPES_KOE_LR_POISTA=1 SCOPES_VAIN=LrUITests/testLrRivinLisays bash scopes/ios/testi.sh`, sitten sama 8787:ää vastaan; lopuksi devicectl-kopio puhelimesta ja vertailu (koerivi ei näy tai on poistettu) puhelimen seuraavan synkan jälkeen. |
| Riita oneplus-005612 (testirivi "Hautakivien siivous", scopes/localregister/REKISTERI.md) | avoin (agentti ajaa, ei enää käyttäjää); odottaa ajoa **14.10.2026:** Todettu 14.10.2026 tuotannon 005612 luvulla (/api/lr/hae): pääversio iphonemcll {iphonemcll:3, oneplus:5653, laitetesti:1} "palvelin"-muokkaus; rinnakkaiset oneplus 5818 (gitin muutos) ja 5836 (poistettu); lahdeSisalto null, lahdeVersio {oneplus:5836} eli lähde poisti rivin, joten testLrRistiriitaLahdeVoittaa valitsee lähteen poiston (sama kuin 005655). | kun simulaattoriyhteys toimii: harjoitus koeinstanssissa 8799 (komento kohdassa Tehty), sitten tuotanto `SCOPES_OSOITE=http://192.0.2.11:8787 SCOPES_KOE_LR_ID=oneplus-005612 SCOPES_VAIN=LrUITests/testLrRistiriitaLahdeVoittaa SCOPES_TULOS=lr-005612-tuotanto bash scopes/ios/testi.sh`; sen jälkeen seuraava tuonti siivoaa kiven. |
| Simulaattorin yhteys palveluun | avoin; odottaa ajoa | selvitä, miksi UI-testiajaja aikakatkaisee (NSURLError -1001) osoitteeseen 192.0.2.11:8799, vaikka Mac tavoittaa sen: LuLu-loki/kehote (`ssh dev-host /usr/local/sbin/lulu-hallinta luettele`), testi 8787:ää vastaan lukevalla testLrSynkkaYhteneva, simulaattorin oma curl (`xcrun simctl spawn booted curl …`, DEVELOPER_DIR asetettuna); korjaa, sitten harjoitukset. |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: LuLu-profiilin allowSimulatorApps (korjaus infralla V-418, asennus Macille käyttäjän sudolla); puhelimen devicectl-vertailu odottaa puhelimen seuraavaa synkkaa

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| LuLu-profiilin allowSimulatorApps | avoin (kirjattu infralle V-418, commit 21714e6); odottaa skooppia infra | lulu-hallinnan `asetus` kirjoittaa myös aktiivisen profiilin preferences.plistiin (currentProfile), lähde Infra/apple/lulu-hallinta/lulu-hallinta; asennus Macille vaatii käyttäjän sudon (`Infra/apple/LULU-SAANNOT.md`: /usr/local/sbin/lulu-hallinta root:wheel 755). Ohitus siihen asti: asetus false → true ennen simulaattoriajoja, jos UI-testi aikakatkeaa (-1001) ja /usr/bin/log näyttää LuLu AlertWindow.nib. |
| Puhelimen synkka lisäyskokeen jälkeen | avoin; odottaa puhelinta (seuraava synkka puhelimessa) | puhelimen seuraavan synkan jälkeen devicectl-kopio ja vertailu: odotus 0 eroa (oneplus-005872 iphonej6fo:3, iphonej6fo-000002 poistettu tai siivottu). |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| UI-kokeiden aikakatkaisun korjaus (LuLun `allowSimulatorApps`, 1417a7af) ei ollut pysyvä: asetus putosi laajennukselta | avoin 14.10.2026 (ohitettu uudelleenkäynnistyksellä 14.10.2026 22.14; pysyvä korjaus avoimissa) |

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — skoopin avoimet rivit valmiita 14.10.2026 (LuLu-profiilin asetus todennettu UI-testillä, puhelimen kopio 0 eroa); lulu-hallinnan 78e4941d-asennus kuuluu infralle (V-418/V-419)

## 14.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: LOCALREGISTER-VIENTI-TODENNUS — todenna LR → git -vienti tuotannossa oikealla äpin muokkauksella: simulaattorin LrUITests siivoavana tuotantoa 8787 vastaan (tarkista ensin, mitä rekisteriä koe muokkaa; scopes/-rekisteri tuottaa viennin), sitten vienticommit juurirepossa, palvelun lokin VIETY-rivi, ristiriidat 0 ja `lr.mjs testaa` 80/80 — polut: scopes/localregister/** — aloitus: /pura scopes localregister — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Reunatapaus | avoin (tiedossa) | äpin luoma rekisteri, joka myöhemmin ilmestyy gittiin samalla polulla: uudelleentuonti luo git-yksiköt äpin yksiköiden rinnalle (kaksoiskappaleet). Ratkaistaan, kun äppi osaa luoda rekistereitä. |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Vientitodennus (LOCALREGISTER-VIENTI-TODENNUS) | todennettu 14.10.2026 (tuotannossa lr-vienti-tuotanto4 EXIT=0, vienticommitit 164ffba0/17216b47, VIETY-rivit, ristiriidat 0, testaa 80/80; äppikorjaus 8eeea31f) | ei jatkoa |

## 15.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — LOCALREGISTER-VIENTI-TODENNUS tehty 14.10.2026 (lr-vienti-tuotanto4 EXIT=0, äppikorjaus 8eeea31f); jäljellä vain Reunatapaus, joka odottaa äpin rekisterin luontia, ja puhelimen äpin päivitys seuraavan äppimuutoksen yhteydessä

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Koeinstanssi jäi päälle | avoin 14.10.2026: HISTORIA (RIVINVAIHTO-TODENNUS) sanoo "Koeinstanssi pysäytetty", mutta edellisen session 8799-instanssi (pid 17603, käynnistetty 20.06, HOME=edellisen session scratchpad) kuunteli yhä 20.18; seuraava session uusi instanssi kaatui EADDRINUSE:en ja `curl` vastasi vanhasta. Pysäytetty `kill 17603`. Korjaus: koeinstanssin pysäytys todennetaan `ss -ltn \| grep 8799` -tyhjällä ennen kuin pysäytys kirjataan. Pysäytys todennettu 14.10.2026: 0 kuuntelijaa. Korjausta noudatettu myös seuraavassa sessiossa: pysäytys todennettu ss:llä = 0 kuuntelijaa 14.10.2026. |

## 15.10.2026 — scopes localregister

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — LOCALREGISTER-VIENTI-TODENNUS tehty 14.10.2026 (lr-vienti-tuotanto4 EXIT=0, äppikorjaus 8eeea31f); Koeinstanssi-vika suljettu 15.10.2026; jäljellä vain Reunatapaus, joka odottaa äpin rekisterin luontia, ja puhelimen äpin päivitys seuraavan äppimuutoksen yhteydessä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Puhelimen äppi ilman 8eeea31f:tä | avoin (tiedossa, ei kiireellinen) | asennetaan seuraavan äppimuutoksen yhteydessä (`bash scopes/ios/asenna.sh`, puhelin Macin näkyvissä); ennen sitä puhelin konvergoi ajastimella. |
| LR 1: Linux-asennus | tuleva (käyttäjä 15.10.2026, järjestys 1/3) | localregister-laitteeksi palvelin: oma laitenimi ja kaksoiskappale, synkka palvelimen palvelua vastaan (MUOTO §2, §10). Suunnitellaan ja aloitetaan käyttäjän pyynnöstä. |
| LR 2: Mac-asennus | tuleva (käyttäjä 15.10.2026, järjestys 2/3) | localregister-laitteeksi Mac samalla tavalla kuin Linux (LR 1 ensin). |
| LR 3: Kaikkien skooppien käyttöönotto | tuleva (käyttäjä 15.10.2026, järjestys 3/3) | LR totuudeksi ja vienti gittiin kaikille skoopeille, ei vain `scopes/`-perheelle (nyt SCOPES_LR_VIENTI=scopes/; muut 37 tiedostoa pelkkiä tuonteja). Edellyttää LR 1–2:ta. |

## 15.10.2026 — scopes localregister

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Puhelimen äppi ilman 8eeea31f:tä | avoin (tiedossa, ei kiireellinen) **15.10.2026:** Todettu 15.10.2026: iphonemcll on käyttäjän oikea puhelin (HISTORIA.md rivi 81: "palvelin"-muokkaus; Päätökset: puhelimen palvelin-muokkaus on käyttäjän dataa); Todettu 15.10.2026: palvelun loki (~/.local/state/scopes-palvelu.loki) ei kirjaa laitenimiä, joten puhelimen viimeistä synkkaa ei voi todentaa lokista. | asennetaan seuraavan äppimuutoksen yhteydessä (`bash scopes/ios/asenna.sh`, puhelin Macin näkyvissä); ennen sitä puhelin konvergoi ajastimella. |
