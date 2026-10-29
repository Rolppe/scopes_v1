# scopes viat — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 13.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-V266 — korjaa V-266: anna Nakymat.swift:53:n "ei mitään"-tekstille tunniste `seuraava-ei` ja hyväksy SkoopitUITests.swift:93:ssa `seuraava-id` tai `seuraava-ei` latautumisen merkkinä; todenna `SCOPES_OSOITE=:8788 bash scopes/ios/testi.sh` Macin simulaattorissa — ei aloiteta ennen käyttäjän lupaa (käyttäjä 13.10.2026: ei korjaustyötä vielä) — polut: scopes/ios/Sources/Nakymat.swift, scopes/ios/UITests/SkoopitUITests.swift — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-266:n korjaus | omistaja scopes viat (käyttäjä 13.10.2026); korjaustyötä ei vielä tehdä | käyttäjälle: anna lupa paketille VIAT-V266 |

## 13.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-V266 — korjaa V-266: anna Nakymat.swift:53:n "ei mitään"-tekstille tunniste `seuraava-ei` ja hyväksy SkoopitUITests.swift:93:ssa `seuraava-id` tai `seuraava-ei` latautumisen merkkinä; todenna `SCOPES_OSOITE=:8788 bash scopes/ios/testi.sh` Macin simulaattorissa — ei aloiteta ennen käyttäjän lupaa (käyttäjä 13.10.2026: ei korjaustyötä vielä) (tiedostot scopes infran ja scopes testitin; V-266 kuuluu scopes viat -skoopille käyttäjän päätöksellä 13.10.2026) — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-266:n korjaus **13.10.2026:** Juuri: SkoopitUITests.swift:93 käyttää `seuraava-id`:tä näkymän latautumisen merkkinä; juuriskoopin scopes SEURAAVA on "ei mitään", jolloin Nakymat.swift:53 näyttää tunnisteettoman tekstin; 457d30a1 vaihtoi testin skoopin juureen. | avoin (omistaja scopes viat (käyttäjä 13.10.2026); korjaustyötä ei vielä tehdä); odottaa käyttäjää | käyttäjälle: anna lupa paketille VIAT-V266; ennen aloitusta tarkista, onko scopes infran SCOPES-INFRA-KONTEKSTI-muutos Nakymat.swift- ja SkoopitUITests.swift-tiedostoihin committoitu (`git status --short scopes/ios`), ettei korjaus sekoitu siihen |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-266 (omistaja scopes viat, käyttäjä 13.10.2026; tiedostot scopes testitin ja scopes infran) UI-testi testListaJaSkooppi kaatuu SkoopitUITests.swift:93: testi käyttää `seuraava-id`:tä näkymän latautumisen merkkinä, mutta juuriskoopin scopes SEURAAVA on "ei mitään", joten Nakymat.swift:53 näyttää tunnisteettoman tekstin. Juuri: 457d30a1 vaihtoi testin skoopin juureen. | avoin 13.10.2026; punainen testi kaataa kaikkien scopes-alaskooppien testiportin; ensimmäinen korjattava |

## 13.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-KOONTI — kerää claude/idea/IDEAT.md:stä scopes-skooppeja koskevat avoimet V-rivit scopes/viat/REKISTERI.md:n Viat-tauluun omistajineen ja kirjoita viiterivit `| V-nnn → scopes viat | avoin |` omistajaskooppien rekistereihin (references/scopes.md "Viat kootaan scopes viat -skooppiin") — polut: scopes/viat/**, scopes/*/REKISTERI.md — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-KOONTI | valmis 13.10.2026 | ideakirjassa scopes-kohteisia V-rivejä vain V-264 (scopes infra) ja V-265 (scopes hallinta), molemmat Viat-taulussa; viiterivit: scopes/infra V-264 (oli jo), scopes/hallinta V-265 lisätty tilalla tiedoksi (rivi on muutosilmoitus, ei vika); muut scopes-rekisterit tyhjiä |

## 13.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-SEURANTA — kokoa claude/idea/IDEAT.md:n uudet scopes-skooppeja koskevat V-rivit scopes/viat/REKISTERI.md:n Viat-tauluun omistajineen, kirjoita viiterivit omistajien rekistereihin ja poista korjattujen vikojen viiterivit ja omat rivit (references/scopes.md "Viat kootaan scopes viat -skooppiin") — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin | kokoa ideakirjan uudet scopes-kohteiset V-rivit Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |

## 13.10.2026 — scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-285 jälkeen) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |

## 13.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-V276 — lisää testKysymysKorttiin X (kysymys-sulje) ja Muu-kentän nousu näppäimistön yläpuolelle + kuva kortista (CHAT-KORTTI-SIMU), kun SkoopitUITests.swift on committoitu (toisen keskustelun SCOPES-LISTA-SUMEUS-muutos 13.10.2026 likaisena); aja testi, kun jokin auki oleva istunto odottaa monivalintaa (SCOPES_KOE_KYSYMYS="<skooppi>"), muuten testi ohittuu — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-290 jälkeen) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |
| VIAT-V276 | avoin; kaatuminen selvitetty 13.10.2026 (0/5 HEAD 977b5f45:llä, lukko f3b1909a) | X- ja Muu-tarkistukset testKysymysKorttiin, kun SkoopitUITests.swift on committoitu; ajo vaatii istunnon, joka odottaa monivalintaa (13.10.2026 ei yhtään: claude demo linkedin ei auki, infra oneplus ja scopes infra eivät odota korttia → Skipped) |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-276 (omistaja scopes testit) CHAT-KORTTI-SIMU: testKysymysKortti tarkistamaan X (kysymys-sulje) ja Muu-kentän nousu näppäimistön yläpuolelle + kuva kortista (1d86c672, 83939155, fe509991) | avoin 13.10.2026; käynnistyskaatuminen ei toistunut 13.10.2026 (5/5 ajoa testi käynnistyi, lukko f3b1909a) — jäljellä tarkistukset; testi ohittuu ilman monivalintaa odottavaa istuntoa |

## 14.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-SEURANTA — kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-297 jälkeen; V-291–V-296 koottu 14.10.2026) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-297 jälkeen; V-291–V-296 koottu 14.10.2026) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |

## 14.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-SEURANTA — kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-299 jälkeen) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit (V-294, kun todennettu puhelimessa) — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Pakkaa-korjauksen todennus puhelimessa | avoin | käyttäjä painaa Pakkaa, kun skoopin istunnossa on kysymys auki; odotettu: kysymys sulkeutuu ja /pakkaa käynnistyy (loki: tulos ok) |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-296 (omistaja scopes hallinta) toiminnot.mjs: varatun istunnon /sa, /sa pois ja /automaattisiirto jonoon 409:n sijaan; jono palvelun muistissa (2213413d) | tiedoksi: muutosilmoitus (scopes chat, V-294, käyttäjän päätös) |
| V-298 (omistaja scopes hallinta) toiminnot.mjs: /pakkaa sulkee auki olevan kysymyksen Escapella waiting-tilassa (d57a0771) | tiedoksi: muutosilmoitus (scopes viat); elävä palvelu käynnistetty 14.10.2026 8.22, puhelintodennus kesken |

## 14.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä 14.10.2026: ei seuraavaa pakettia; VIAT-SEURANTA (V-299 jälkeen) jää Avoimiin asioihin toistuvana, V-294 odottaa scopes chatin puhelintodennusta (viim. 27.10.2026)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-299 jälkeen; V-291–V-299 käsitelty 14.10.2026) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit; poista V-294:n rivit, kun scopes chat on todentanut sen puhelimessa (viim. 27.10.2026) |

## 14.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: V-305-TODENNUS — todenna V-305: lue scopes-toiminnot.lokin toiminto viesti -rivit; "ei näkynyt" → analysoi ruutu-kenttä ja korjaa juurisyy; ei rivejä mutta käyttäjä kertoo jumin → reitti oli Remote Control (siirrä pois scopes-vioista); viim. 28.10.2026 — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-305-TODENNUS | avoin | lähetyksen ok-polku todennettu 14.10.2026 9.22–9.24 (3 riviä); seuraa scopes-toiminnot.lokin "tulos":"ei näkynyt" -rivejä; jos jumi toistuu, ruutu-kenttä näyttää syöttökentän tilan → korjaa juurisyy; jos ei toistu ja käyttäjä kertoo jumin, lokissa ei ole riviä → reitti oli Claude iOS / Remote Control (ei scopes-vika). Viim. 28.10.2026. |

## 14.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: JAATYMINEN-KAYTTOON — ota jumilokit käyttöön: kysy lupa ja käynnistä scopes-palvelu uudelleen (vanha pid 8787:ssä, cron/kaynnista.sh nostaa), aja bash scopes/ios/asenna.sh, todenna rivit ~/.local/state/scopes-pyynnot.loki ja scopes-app.loki; jäätymisen jälkeen lue jumi/pyynto/silmukka-rivit ja korjaa juurisyy — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| JAATYMINEN-KAYTTOON | avoin; odottaa käyttäjää | palvelun uudelleenkäynnistys ja asenna.sh vaativat käyttäjän luvan (TYOTAVAT 8); sen jälkeen jäätymisen tapahtuessa lue scopes-app.loki (jumi, jumi-kesken, pyynto, metrickit) ja scopes-pyynnot.loki (ms, katkesi, silmukka) samalta hetkeltä ja korjaa juurisyy. |

## 15.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: JAATYMINEN-JUURISYY — odottaa käyttäjän havaintoa: kun Skoopit-äppi jäätyy, käyttäjä kertoo ajan; lue ~/.local/state/scopes-app.loki (jumi, jumi-kesken, MetricKit) ja scopes-pyynnot.loki (hitaat, katkenneet, silmukka) palvelimen vastaanottoajan mukaan ja korjaa juurisyy — polut: scopes/viat/** — aloitus: /pura scopes viat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-299 jälkeen: V-300, V-303, V-305, V-318 ym.; V-291–V-299 käsitelty 14.10.2026) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit; poista V-294:n rivit, kun scopes chat on todentanut sen puhelimessa (viim. 27.10.2026) |
| JAATYMINEN-JUURISYY | tehty 15.10.2026 — käyttäjä: ei jäätynyt 14.41 jälkeen (15.10.2026: lokin 13 MetricKit-kaatumista 14.10. 9.41–15.10. 11.34Z oli sama SIGABRT, async-didReceive → UIKitin completion yhteistyösäikeeltä → NSAssertionHandler; korjattu e18b968c 15.10. 14.41, ei kaatumisia sen jälkeen; jumeja vain 1 (3,6 s 14.10.); MetricKit-rivit kirjaavat nyt poikkeus-, ios-, laitemalli- ja build-kentät) | kun Skoopit-äppi jäätyy, käyttäjä kertoo ajan; lue scopes-app.loki (jumi, jumi-kesken, MetricKit) ja scopes-pyynnot.loki (hitaat/katkenneet pyynnöt, silmukka-tukokset) ajan ympäriltä ja korjaa juurisyy. |

## 15.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-SEURANTA — kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-300, V-303, V-312, V-467, V-488 ym.) Viat-tauluun ja viiterivit omistajille; poista korjattujen vikojen rivit ja tehty JAATYMINEN-JUURISYY avoimista — polut: scopes/viat/** — aloitus: /pura scopes viat — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-488 jälkeen; V-300–V-488 käsitelty 15.10.2026) Viat-tauluun ja avoimille viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |

## 15.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: V-312-KORJAUS — Infra-näkymän skooppipuu ei näe istunnon aikana luotua skooppia: scopes/ios/Sources/Infra.swift:63 lataa vain .task(id:)-kohdassa; lataa uudelleen, kun navigaatio vaihtuu Infra-näkymään, ja todenna simulaattorissa (testi.sh); käyttöönotto kysytään — polut: scopes/viat/** — aloitus: /pura scopes viat — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-488 jälkeen; V-300–V-488 käsitelty 15.10.2026, commit 742dbb86) Viat-tauluun ja avoimille viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |
| Diagnostiikan uudet kentät | kesken; odottaa ajoa (odottaa asennusta) | seuraavan asenna.sh-ajon jälkeen MetricKit-rivillä pitää näkyä ios/laitemalli/build (todennus, kun raportti tulee). |
| V-312-KORJAUS | koodi tehty 15.10.2026; odottaa käyttöönottoa (kysytään käyttäjältä) | InfraView(nakyvissa:) lataa listan aina, kun Infra tulee esiin (Infra.swift .task(id: nakyvissa+osoite+avain), Juuri.swift:103); simulaattori: testValilehdetJaInfraPuu läpi, testInfraJarjestys punainen myös pohjalla (V-489, scopes testit); käyttöönotto `bash scopes/ios/asenna.sh` kysytään; todennus laitteella: luo skooppi istunnon aikana → näkyy Infrassa ilman vetopäivitystä |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-312 (omistaja scopes viat; korjauskoodi scopes infran Infra.swift) Infra-näkymän skooppipuu ei näe istunnon aikana luotua skooppia: InfraView lataa listan vain .task(id: osoite+avain) -kohdassa (Infra.swift:63) | korjattu (koodi) 15.10.2026, odottaa käyttöönottoa ja laitetodennusta (V-312-KORJAUS) |

## 15.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VIAT-SEURANTA — kokoa ideakirjan uudet scopes-kohteiset V-rivit V-488 jälkeen (V-489 scopes testit, V-490 tarkista, V-491 ja V-492 tiedoksi) Viat-tauluun ja avoimille viiterivit omistajille — polut: scopes/viat/** — aloitus: /pura scopes viat — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan uudet scopes-kohteiset V-rivit (V-488 jälkeen; V-300–V-488 käsitelty 15.10.2026, commit 742dbb86; V-489 (scopes testit), V-491 ja V-492 (tiedoksi) kirjattu 15.10.2026, V-490 tarkistettava) Viat-tauluun ja avoimille viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Tiedoksi-muutosilmoitukset (ei vikoja; kuvaus ideakirjassa): scopes testit V-273, V-274, V-278, V-280, V-283, V-292, V-297, V-317, V-336, V-358, V-387, V-391, V-409, V-414, V-427, V-459; scopes yhteys V-275, V-290, V-303, V-398, V-420, V-425; scopes infra V-282, V-291, V-295; scopes siirto (ent. hallinta) V-265, V-296, V-298; scopes chat V-318, V-386, V-390; scopes jakelu V-281; scopes V-323, V-408, V-413, V-488 | tiedoksi |

## 16.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: V-312-KORJAUS (laitetodennus: luo skooppi istunnon aikana → näkyy Infrassa ilman vetopäivitystä); VIAT-SEURANTA ajettu 15.10.2026 (V-300–V-492 käsitelty), jää Avoimiin asioihin toistuvana

## 16.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 16.10.2026 (odottaa käyttäjää: V-312 ja V-516 laitetodennus, V-515 todennus seuraavasta äppiviestistä)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-312-KORJAUS | korjattu 16f1daa9; odottaa käyttäjää (asennettu puhelimeen 15.10.2026 21.29, asenna.sh exit 0; laitetodennus) (todenna viim. 29.10.2026) | InfraView(nakyvissa:) lataa listan aina, kun Infra tulee esiin (Infra.swift .task(id: nakyvissa+osoite+avain), Juuri.swift:103); simulaattori: testValilehdetJaInfraPuu läpi, testInfraJarjestys punainen myös pohjalla (V-489, scopes testit); todennus laitteella: luo skooppi istunnon aikana → näkyy Infrassa ilman vetopäivitystä; sitten V-312 korjatuksi ja viiterivit pois |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-312 (omistaja scopes viat; korjauskoodi scopes infran Infra.swift) Infra-näkymän skooppipuu ei näe istunnon aikana luotua skooppia: InfraView lataa listan vain .task(id: osoite+avain) -kohdassa (Infra.swift:63) | korjattu 16f1daa9, asennettu 15.10.2026 21.29; odottaa laitetodennusta (V-312-KORJAUS) (todenna viim. 29.10.2026) |

## 17.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 16.10.2026 (odottaa käyttäjää: V-516 laitetodennus, V-515 todennus seuraavasta äppiviestistä)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan (IDEAT.md ja TIEDOKSI.md, V-SARJA.md luettelee omistajat) uudet scopes-kohteiset V-rivit (V-492 jälkeen; V-300–V-492 käsitelty 15.10.2026; V-490 claude siirto, ei scopes) Viat-tauluun ja avoimille viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit |

## 17.10.2026 — scopes viat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 17.10.2026 (odottaa käyttäjää: V-516 laitetodennus, V-515 todennus seuraavasta äppiviestistä)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-515 | korjattu 979272fb 16.10.2026 (palvelu uudelleenkäynnistetty); odottaa ajoa (todenna viim. 30.10.2026) | seuraava perutun vuoron jälkeinen äppiviesti: transkriptissa vain uusi teksti, scopes-toiminnot.loki "tulos":"ok"; pitkä rivittyvä kenttä todentamatta |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-515 (omistaja scopes viat; korjauskoodi scopes chatin viestit.mjs) uusi viesti liimautui istunnon syöttökenttään palautetun perutun viestin perään | korjattu 979272fb; odottaa ajoa (todennus kesken) (todenna viim. 30.10.2026) |
| V-516 (omistaja scopes viat; korjauskoodi scopes-äpin Viestit.swift ja PuraValinta.swift) skoopin viestinäkymän Pura-arkki näytti scopes-perheelle purkajalistan ilman Purascriptiä | korjattu 092ffd53, asennettu 16.10.2026; odottaa ajoa (laitetodennus tekemättä) (todenna viim. 30.10.2026) |

### Roskat — siirretty claude/siirto/REKISTERI.md:n Viat-lukuun (claude siirto, ROSKAT 28.10.2026)

| Vika | Tila |
|---|---|
| Havainto (ei kirjattu vielä V-riviksi): sa-tick-ajastus hylkäsi 40 min auki olleen AskUserQuestionin 825969ab:ssä 05:24:08Z (hylkäys 127 ms ennen scheduled_task_fire-riviä). Omistaja claude siirto (/sa-taito) | avoin 14.10.2026; ei todennettu kausaaliseksi; seuraava sessio kirjaa `vika.sh … "claude siirto"`, jos toistuu tai käyttäjä haluaa |

### Roskat — siirretty claude/siirto/REKISTERI.md:n Viat-lukuun (claude siirto, ROSKAT 28.10.2026)

| Vika | Tila |
|---|---|
| V-549 (omistaja claude siirto) istunnon teho poikkeuksellisen heikentynyt: malli pudotti sanan yksinkertaisesta argumentista | avoin 17.10.2026 |
