# scopes notifications — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 14.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-PAIKALLINEN — Skoopit-äppi näyttää paikalliset ilmoitukset (UNUserNotificationCenter) neljästä tapahtumasta: istunto odottaa käyttäjää, paketti valmis, konteksti lähellä rajaa, uusi avoin vika; vertailu äpin omista /api/skoopit-hauista (edellinen tila vs. uusi), ilmoitus myös äpin ollessa auki (banneri kuten Claude iOS -äpissä), napautus avaa skoopin; testi iOS-simulaattorissa — polut: scopes/ios/Sources/Ilmoitukset.swift, scopes/notifications/** (muutokset muiden alaskooppien tiedostoihin muutosilmoituksena scopes viatiin) — aloitus: /pura scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikalliset ilmoitukset äppiin | määritelty 14.10.2026 | paketti NOTIFICATIONS-PAIKALLINEN; kontekstirajan oletus päätetään paketissa mitatusta istuntojen kontekstikoosta (Asetuksissa säädettävä) |

## 14.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-SIMULAATTORI — UI-testi näyttää ilmoitusbannerin ja napautuksen simulaattorissa koeilmoituksella (SCOPES_ILMOITUKSET=1), ja kontekstiraja (UserDefaults ilmoitusRaja, oletus 100 k) säädettäväksi Asetuksiin — polut: scopes/ios/Sources/Ilmoitukset.swift, scopes/notifications/** (UITests ja Asetukset muutosilmoituksena omistajille) — aloitus: /pura scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikalliset ilmoitukset äppiin | kesken 4d64b1e3 14.10.2026 (määritelty 14.10.2026; toteutettu, banneri ja napautus näkemättä) **14.10.2026:** UI-testit eivät kysy ilmoituslupaa (SCOPES_AVAIN annettu), ellei SCOPES_ILMOITUKSET=1; V-300 (scopes viat): idle on oma tilansa; odottaa() laskee kaiken muun kuin kasittely/pakattu odottavaksi, joten ilmoitus ("Vuoro valmis") toimii korjauksen jälkeenkin. | paketti NOTIFICATIONS-SIMULAATTORI (banneri ja napautus simulaattorissa) |
| Kontekstirajan säätö Asetuksiin | avoin (ei UI:ta, UserDefaults "ilmoitusRaja") | NOTIFICATIONS-SIMULAATTORI |
| Todennus puhelimessa | avoin (ei tehty) | NOTIFICATIONS-PUHELIN simulaattorin jälkeen: `bash scopes/ios/asenna.sh`, käyttäjä hyväksyy ilmoitusluvan |

## 14.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-PUHELIN — äpin asennus iPhoneen (bash scopes/ios/asenna.sh) ja ilmoitusten todennus puhelimessa: käyttäjä hyväksyy ilmoitusluvan, näkee bannerin ja napautus avaa skoopin — polut: scopes/ios/Sources/Ilmoitukset.swift, scopes/notifications/** — aloitus: /pura scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikalliset ilmoitukset äppiin | kesken 4d64b1e3 60b1e03f 14.10.2026 (määritelty 14.10.2026; toteutettu, banneri ja napautus todennettu simulaattorissa 14.10.2026) **14.10.2026:** UI-testit eivät kysy ilmoituslupaa (SCOPES_AVAIN annettu), ellei SCOPES_ILMOITUKSET=1; V-300 (scopes viat): idle on oma tilansa; odottaa() laskee kaiken muun kuin kasittely/pakattu odottavaksi, joten ilmoitus ("Vuoro valmis") toimii korjauksen jälkeenkin. **14.10.2026:** simulaattori (scopes/ios/testi.sh, SCOPES_TULOS=ilmoitukset) exit 0: testIlmoitusBanneriJaNapautus Passed 13 s, testIlmoitusRajaAsetuksissa Passed 17 s (14.10.2026 09.05, Mac ~/scopes-ios/ilmoitukset.xcresult); kuvat ilmoitus-banneri, ilmoitus-napautus, ilmoitusraja (Konteksti ≥ 125 k) tarkistettu silmin; ilmoitukset-testi: simulaattori muistaa ilmoitusluvan ajojen välillä; testi hyväksyy luvan vain, jos kysely näkyy. | puhelintodennus NOTIFICATIONS-PUHELIN |
| Todennus puhelimessa | avoin (ei tehty) | NOTIFICATIONS-PUHELIN: agentti ajaa `bash scopes/ios/asenna.sh`, käyttäjä hyväksyy ilmoitusluvan ja näkee ilmoituksen |

## 14.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — paikalliset ilmoitukset ja asetusten alavalikot valmiit ja todennettu puhelimessa 14.10.2026; käyttäjä valitsi "Ei seuraavaa"

## 15.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — paikalliset ilmoitukset ja asetusten alavalikot valmiit ja todennettu puhelimessa 14.10.2026; käyttäjä valitsi "Ei seuraavaa" uudelleen 14.10.2026

## 15.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-HA-PUSH-PUHELIN — asenna 2fe5d2e8:n iOS-versio puhelimeen (kotiverkko tai kaapeli) ja todenna: HA-ilmoitus lukitulle näytölle, napautus avaa skoopin Scopes-äpissä, Asetukset → Ilmoitukset tallentuu palvelimelle; vahvista koeilmoitus — polut: scopes/notifications/vahti.mjs, scopes/ios/Sources/Ilmoitukset.swift (asennus scopes/ios/asenna.sh) — aloitus: /pura scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Koeilmoituksen perillemeno | avoin; odottaa käyttäjää | käyttäjä vahvistaa, tuliko 15.10.2026 08.57 lähetetty "Koeilmoitus palvelimelta" HA-äppiin lukitulle näytölle; uusi koe: `node scopes/notifications/vahti.mjs --koe "scopes notifications"`. |
| Uusi iOS-versio puhelimeen | avoin (puhelin WireGuardissa näkyy Macille unavailable, HISTORIA 14.10.2026: tarvitaan kotiverkko tai kaapeli); odottaa käyttäjää | `bash scopes/ios/asenna.sh`; sen jälkeen todennus: HA-ilmoituksen napautus avaa Skoopit-äpin skoopin (skoopit://), Asetukset → Ilmoitukset tallentuu palvelimelle. HA-äppi saattaa kysyä luvan avata Scopes-äpin ensimmäisellä kerralla. |
| Vahdin cron-rivi | avoin (root-asennus vaatii käyttäjän luvan); odottaa käyttäjää | lähde Infra/linux/palvelin/cron.d-palvelin (2fe5d2e8) → /etc/cron.d/palvelin rootina (infra oneplus V-437); siihen asti vahti ei palaa bootin/kaatumisen jälkeen. |

## 15.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-TAUSTA-TESTIT — aja simulaattorin UI-testit df0400df:n jälkeen (`bash scopes/ios/testi.sh`), korjaa punaiset omissa tiedostoissa; lisää testi taustahaun ilmoitukselle, jos BGTaskin simulointi onnistuu — polut: scopes/ios/Sources/Ilmoitukset.swift, scopes/notifications/ilmoitukset-testi.swift — aloitus: /pura scopes notifications — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Simulaattorin UI-testit df0400df:n jälkeen (UITests palautettu 2fe5d2e8^-versioon) | avoin; odottaa ajoa | `bash scopes/ios/testi.sh` (Mac simulaattori); heti ajettava |

## 15.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä (käyttäjä kertoo, tuleeko ilmoitus lukitulle näytölle, kun skoopin tila muuttuu äpin ollessa kiinni); NOTIFICATIONS-TAUSTA-TESTIT tehty 1a63b0d7

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikalliset ilmoitukset äppiin | valmis b20bfdaa 14.10.2026 (todennettu puhelimessa; määritelty 14.10.2026; toteutettu, banneri ja napautus todennettu simulaattorissa 14.10.2026) **14.10.2026:** UI-testit eivät kysy ilmoituslupaa (SCOPES_AVAIN annettu), ellei SCOPES_ILMOITUKSET=1; V-300 (scopes viat): idle on oma tilansa; odottaa() laskee kaiken muun kuin kasittely/pakattu odottavaksi, joten ilmoitus ("Vuoro valmis") toimii korjauksen jälkeenkin. **14.10.2026:** simulaattori (scopes/ios/testi.sh, SCOPES_TULOS=ilmoitukset) exit 0: testIlmoitusBanneriJaNapautus Passed 13 s, testIlmoitusRajaAsetuksissa Passed 17 s (14.10.2026 09.05, Mac ~/scopes-ios/ilmoitukset.xcresult); kuvat ilmoitus-banneri, ilmoitus-napautus, ilmoitusraja (Konteksti ≥ 125 k) tarkistettu silmin; ilmoitukset-testi: simulaattori muistaa ilmoitusluvan ajojen välillä; testi hyväksyy luvan vain, jos kysely näkyy. **14.10.2026:** Paikalliset ilmoitukset syntyvät vain, kun äppi pollaa (auki tai ~30 s taustalla); puhelin on WireGuard-tunnelissa 192.0.2.30, jolloin Mac näkee sen devicectl:ssä "unavailable" ja asennus vaatii kotiverkon tai kaapelin; Paikalliset ilmoitukset: klo 8.50 asennettu versio ei sisältänyt ilmoituskoodia (binäärissä ei Ilmoittaja/Koeilmoitus-merkkijonoja), siksi ensimmäiset bannerikokeet epäonnistuivat; Paikallisten ilmoitusten lajikytkimet: UserDefaults "ilmoitus-<laji>", oletus päällä; Ilmoittaja.hae suodattaa ilmoitusPaalla(laji):lla. | — |
| Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä | avoin; odottaa käyttäjää | käyttäjä kertoo, tuleeko ilmoitus lukitulle näytölle, kun skoopin tila muuttuu äpin ollessa kiinni (iOS ajoittaa; voi viivästyä tunteja; virransäästötila estää) |
| Simulaattorin UI-testit df0400df:n jälkeen (UITests palautettu 2fe5d2e8^-versioon) | valmis 15.10.2026 (1a63b0d7): ajettu; jäljellä olevat punaiset eivät ole tämän skoopin tiedostoissa (V-427, scopes testit) | **15.10.2026:** Koko UITests-suite (ilman SCOPES_KOE_AUKI) 15.10.2026: exit 65, 1272 s; kaatuivat testListaJaSkooppi, testNappaimistoNostaaKeskustelun, testSkoopinVaihtoEiMustaa, LiitteetUITests.testLeikepoydanKuvaLiitteeksiJaPois ja testInfraJarjestys — sama joukko kuin V-427:ssä (omistaja scopes testit); UITests-uusinta SCOPES_KOE_AUKI="scopes notifications" (5 testiä, uusi Ilmoitukset.swift): testListaJaSkooppi läpi; yhä punaiset testNappaimistoNostaaKeskustelun (5 px), LiitteetUITests (viestit-laheta puuttuu), testSkoopinVaihtoEiMustaa (SCOPES_KOE_AUKI2-ympäristö) ja testInfraJarjestys (706 vs 600); mikään ei koske ilmoitustiedostoja. |

## 15.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-TAUSTA-ASENNUS — asenna 1a211f4a puhelimeen (bash scopes/ios/asenna.sh; Macin lukko voi olla varattu) ja ohjeista käyttäjä uusintatestiin: äppi taustalle sulkematta, tarkista Asetukset → Ilmoitukset "Taustahaku"-rivi ja palvelimen pyyntöloki — polut: scopes/ios/Sources/Ilmoitukset.swift, scopes/notifications/ilmoitukset-testi.swift — aloitus: /pura scopes notifications — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikalliset ilmoitukset äppiin | valmis b20bfdaa 14.10.2026 (todennettu puhelimessa; määritelty 14.10.2026; toteutettu, banneri ja napautus todennettu simulaattorissa 14.10.2026) **14.10.2026:** UI-testit eivät kysy ilmoituslupaa (SCOPES_AVAIN annettu), ellei SCOPES_ILMOITUKSET=1; V-300 (scopes viat): idle on oma tilansa; odottaa() laskee kaiken muun kuin kasittely/pakattu odottavaksi, joten ilmoitus ("Vuoro valmis") toimii korjauksen jälkeenkin. **14.10.2026:** simulaattori (scopes/ios/testi.sh, SCOPES_TULOS=ilmoitukset) exit 0: testIlmoitusBanneriJaNapautus Passed 13 s, testIlmoitusRajaAsetuksissa Passed 17 s (14.10.2026 09.05, Mac ~/scopes-ios/ilmoitukset.xcresult); kuvat ilmoitus-banneri, ilmoitus-napautus, ilmoitusraja (Konteksti ≥ 125 k) tarkistettu silmin; ilmoitukset-testi: simulaattori muistaa ilmoitusluvan ajojen välillä; testi hyväksyy luvan vain, jos kysely näkyy. **14.10.2026:** Paikalliset ilmoitukset syntyvät vain, kun äppi pollaa (auki tai ~30 s taustalla); puhelin on WireGuard-tunnelissa 192.0.2.30, jolloin Mac näkee sen devicectl:ssä "unavailable" ja asennus vaatii kotiverkon tai kaapelin; Paikalliset ilmoitukset: klo 8.50 asennettu versio ei sisältänyt ilmoituskoodia (binäärissä ei Ilmoittaja/Koeilmoitus-merkkijonoja), siksi ensimmäiset bannerikokeet epäonnistuivat; Paikallisten ilmoitusten lajikytkimet: UserDefaults "ilmoitus-<laji>", oletus päällä; Ilmoittaja.hae suodattaa ilmoitusPaalla(laji):lla. **15.10.2026:** x. | — |
| Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä | avoin (15.10.2026: ilmoitus ei tullut lukitulle näytölle; korjaus 1a211f4a, ei vielä puhelimessa); odottaa ajoa | todennus käyttäjältä asennuksen jälkeen: käyttäjä kertoo, tuleeko ilmoitus lukitulle näytölle, kun skoopin tila muuttuu äpin ollessa kiinni (iOS ajoittaa; voi viivästyä tunteja; virransäästötila estää); jos taustahaku-rivi näyttää herätyksiä mutta ilmoituksia ei tule → vika ilmoitukset()-logiikassa tai luvassa; jos herätyksiä ei tule tunteihin → iOS ei ajoita (harkitse muuta mekanismia käyttäjän kanssa) |
| NOTIFICATIONS-TAUSTA-ASENNUS | avoin | aja `bash scopes/ios/asenna.sh` (Bash timeout 600000, run_in_background; lukko voi olla toisen istunnon testillä — odota flock), tarkista exit 0; sitten käyttäjälle: avaa äppi kerran, siirrä taustalle (ÄLÄ sulje sovellusvaihtimesta), jätä muutamaksi tunniksi; tarkista Asetukset → Ilmoitukset "Taustahaku"-rivi ja palvelimen pyyntöloki (/api/skoopit puhelimen osoitteesta ilman vaihe active -tapahtumaa). |

## 15.10.2026 — scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| NOTIFICATIONS-TAUSTAHAKU-HAVAINTO (BGAppRefresh-taustaherätyksen todennus) | avoin; odottaa käyttäjää | Asetukset → Ilmoitukset "Taustahaku"-rivi tarkistetaan, kun käyttäjä avaa Asetukset muutenkin; ei aktiivista testiä. |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| NOTIFICATIONS-KYSELY-KYTKIN (kyselyilmoitukselle oma kytkin Asetuksiin) | valmis cc571440 15.10.2026 (asennettu 15.10.2026 16.44) | — |

## 15.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-TAUSTAHAKU-HAVAINTO — kysy käyttäjältä Asetukset → Ilmoitukset "Taustahaku"-rivin aikaleima (iOS:n BGAppRefresh-herätys; 1 min lukitustesti ei kata sitä, tuntien testiä käyttäjä ei voi ajaa) ja tarkista palvelimen pyyntöloki; aikaleima avaamisen jälkeen = todennettu — polut: scopes/ios/Sources/Ilmoitukset.swift — aloitus: /pura scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä | avoin (15.10.2026: ilmoitus ei tullut lukitulle näytölle; korjaus 1a211f4a, ei vielä puhelimessa); odottaa ajoa **15.10.2026:** lukitusnäytön ilmoitus toimii ~30 s taustaikkunassa, 3/3 testiä (14.34, 15.30, 15.46). | todennus käyttäjältä asennuksen jälkeen: käyttäjä kertoo, tuleeko ilmoitus lukitulle näytölle, kun skoopin tila muuttuu äpin ollessa kiinni (iOS ajoittaa; voi viivästyä tunteja; virransäästötila estää); jos taustahaku-rivi näyttää herätyksiä mutta ilmoituksia ei tule → vika ilmoitukset()-logiikassa tai luvassa; jos herätyksiä ei tule tunteihin → iOS ei ajoita (harkitse muuta mekanismia käyttäjän kanssa) |
| NOTIFICATIONS-TAUSTAHAKU-HAVAINTO (BGAppRefresh-taustaherätyksen todennus) | avoin (15.10.2026 klo 15.55: ei vielä herätystä, aikaisin mahdollinen 16.02); odottaa käyttäjää | Asetukset → Ilmoitukset "Taustahaku"-rivi tarkistetaan, kun käyttäjä avaa Asetukset muutenkin; ei aktiivista testiä; jos aikaa ei ole vuorokauden päästä → iOS ei ajoita, harkitse muuta mekanismia käyttäjän kanssa. |

## 16.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-LUKITUS-TODENNUS — aja `bash scopes/notifications/taustahaku.sh`; kun taustaherätyksen ilmoituksia > 0, lukitusnäytön ilmoitus todennettu ilman käyttäjää (odottaa iOS:n ajoitusta ja skoopin tilan muutosta äpin ollessa kiinni) — polut: scopes/notifications/taustahaku.sh, scopes/ios/Sources/Ilmoitukset.swift — aloitus: /pura scopes notifications

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä | avoin (15.10.2026: ilmoitus ei tullut lukitulle näytölle; korjaus 1a211f4a, nyt puhelimessa: asennus 15.10.2026 16.44, cc571440 sisältää sen); odottaa ajoa **15.10.2026:** lukitusnäytön ilmoitus toimii ~30 s taustaikkunassa, 3/3 testiä (14.34, 15.30, 15.46). **15.10.2026:** taustapäivityksen havainto: pyyntöloki 15.10.2026 klo 15.40–16.49: puhelimelta (192.0.2.15/.151) 6 etualapursketta, ei eristettyä pelkkää /api/skoopit-pursketta; muista osoitteista vain 127.0.0.1-testit; pyyntöloki yksin ei erota kylmää taustakäynnistystä etualasta, äppiloki + plisti erottavat. | agentti ajaa `bash scopes/notifications/taustahaku.sh` aika ajoin; kun taustaherätyksen `ilmoituksia` > 0, ilmoitus lähti lukitulle näytölle → todennettu ilman käyttäjää; ei kysytä käyttäjältä; odottaa iOS:n ajoitusta (ei heti ajettava; iOS ajoittaa, voi viivästyä tunteja; virransäästötila estää); jos taustahaku-rivi näyttää herätyksiä mutta ilmoituksia ei tule → vika ilmoitukset()-logiikassa tai luvassa; jos herätyksiä ei tule tunteihin → iOS ei ajoita (harkitse muuta mekanismia käyttäjän kanssa) |

## 16.10.2026 — scopes notifications

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: NOTIFICATIONS-LUKITUS-TODENNUS — aja `bash scopes/notifications/taustahaku.sh` (LOKI-rivi äppilokista, toimii lukitulla puhelimella, c02005b3); ilmoituksia > 0 → lukitusnäytön ilmoitus todennettu ilman käyttäjää; jos herätykset jatkuvat ilmoituksia 0, lisää raporttiin muuttuneiden skooppien määrä ja lähtötason ikä (erottaa "ei muutoksia" ilmoitukset()-viasta) — polut: scopes/notifications/taustahaku.sh, scopes/ios/Sources/Ilmoitukset.swift — aloitus: /pura scopes notifications — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä | avoin (15.10.2026: ilmoitus ei tullut lukitulle näytölle; korjaus 1a211f4a, nyt puhelimessa: asennus 15.10.2026 16.44, cc571440 sisältää sen; taustaherätykset raportoituvat palvelimelle (c02005b3), 2/2 herätystä ilmoituksia 0; raportissa muuttuneita + lahtotasonIka d3ae95a8, asennettu puhelimeen 16.10.2026 00.48, simulaattori ilmoitustestit 2/2 Passed; 16.10.2026: 3/3 uutta herätystä (03:10, 03:38, 05:07Z) ilmoituksia 0, muuttuneita 1, lähtötason ikä 5 h / 23 min / 15 min → muutos on, mutta ei ilmoitettu; raporttiin skoopin nimi ja kentän siirtymä (muutokset), ei vielä puhelimessa); odottaa ajoa **15.10.2026:** lukitusnäytön ilmoitus toimii ~30 s taustaikkunassa, 3/3 testiä (14.34, 15.30, 15.46). **15.10.2026:** taustapäivityksen havainto: pyyntöloki 15.10.2026 klo 15.40–16.49: puhelimelta (192.0.2.15/.151) 6 etualapursketta, ei eristettyä pelkkää /api/skoopit-pursketta; muista osoitteista vain 127.0.0.1-testit; pyyntöloki yksin ei erota kylmää taustakäynnistystä etualasta, äppiloki + plisti erottavat. **16.10.2026:** Todettu 15.10.2026: lukitulle puhelimelle `xcrun devicectl device copy from` epäonnistuu (CoreDeviceError 4016, 5/5 yritystä 17.52–19.12) ja `xcodebuild -destination id=<laite>` ei löydä kohdetta, joten asennus vaatii avatun puhelimen; Äppilokin taustahaku-raportit (uusi reitti toimii): 2026-10-15T17:26:01Z ja 18:22:21Z ilmoituksia 0; 4 h seurannassa (20.37–00.37) vain nämä 2 herätystä, ~1 h välein, viimeinen 21.22, sen jälkeen ei herätyksiä; ilmoitukset() (Ilmoitukset.swift:65) ilmoittaa vain siirtymistä edellisen haun lähtötasoon nähden (vikoja kasvoi, pakattiin / seuraava muuttui, kysely, odottaa-siirtymä, kontekstiraja); 0 ilmoitusta voi olla "ei muutoksia" tai vika, raportti ei vielä erota näitä. | agentti ajaa `bash scopes/notifications/taustahaku.sh` aika ajoin (LOKI-rivi); kun taustaherätyksen `ilmoituksia` > 0, ilmoitus lähti lukitulle näytölle → todennettu ilman käyttäjää; ei kysytä käyttäjältä; odottaa iOS:n ajoitusta (ei heti ajettava; iOS ajoittaa, voi viivästyä tunteja; virransäästötila estää); LOKI-rivin muuttuneita/lähtötason ikä (d3ae95a8): ilmoituksia 0 ja muuttuneita 0 = ei muutoksia; ilmoituksia 0 ja muuttuneita > 0 = ei-ilmoitettava muutos tai ilmoitukset()-vika; jos taustahaku-rivi näyttää herätyksiä mutta ilmoituksia ei tule → vika ilmoitukset()-logiikassa tai luvassa; jos herätyksiä ei tule tunteihin → iOS ei ajoita (harkitse muuta mekanismia käyttäjän kanssa) |
