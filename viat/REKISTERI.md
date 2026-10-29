# scopes/viat/REKISTERI.md

Tilanne: 17.10.2026 (VIAT-SEURANTA: V-300–V-492 käsitelty; V-489 viiterivi scopes testit, V-491/V-492 tiedoksi, V-490 claude siirto; avoimet viat omille riveilleen, tiedoksi-ilmoitukset yhdelle riville; korjatut V-294, V-300, V-399, V-487 pois; V-467 → claude siirto; V-447 määräpäivä 22.10.2026)

SEURAAVA PAKETTI: VIAT-01 — Vikarekisterin ja todennusvikojen seuranta ja korjaus — polut: scopes/viat/** — aloitus: /pura scopes viat

## Tarkoitus ja raja

Scopes-äpin vikojen kokoaja: yksi paikka äpin ja sen palvelun (scopes/ios, scopes/palvelu) avoimille vioille ja niiden korjausjonolle.

Raja:
- Omistaa: viat, jotka koskevat useampaa scopes-alaskooppia, ja viat, joiden omistaja ei ole selvä (oire näkyy äpissä, syy tuntematon); niiden selvitys ja korjaus tehdään täällä tai siirretään omistajalle, kun syy löytyy.
- Seuraa: kaikkien scopes-alaskooppien avoimet viat yhtenä listana (omistaja-sarake), jotta äpin vikatilanne näkyy yhdestä rekisteristä.
- Ei omista: vikaa, joka on selvästi yhden alaskoopin tiedostoissa — se kirjataan `/vika scopes <alaskooppi> …` ja korjataan siellä. Siirto-, infra- ja muiden juurten viat kuuluvat omille skoopeilleen.

## Päätökset

- **Käyttäjä 13.10.2026:** skooppi `scopes viat` luotiin komennolla `/pura uusi scopes viat`.
- **Käyttäjä 13.10.2026 (VIAT-MAARITTELY):** tarkoitus on "äpin vikojen kokoaja" — Scopes-äpin poikkileikkaavat viat ja korjausjono yhdessä paikassa, kun vika ei kuulu yhdelle osaskoopille.
- **Käyttäjä 13.10.2026 (VIAT-KOONTI):** V-266 kuuluu scopes viat -skoopille (korjaus koskee scopes testitin testiä ja scopes infran näkymää), mutta korjaustyötä ei tehdä vielä.

- **13.10.2026:** Käyttäjä 13.10.2026 (pakkaus): seuraava paketti pysyy VIAT-V266.

- **13.10.2026:** Käyttäjä 13.10.2026 (pakkaus): portti (skooppi-polusta.mjs --seuraava) hylkäsi rivin VÄÄRÄ SKOOPPI, koska Nakymat.swift → scopes infra ja SkoopitUITests.swift → scopes testit; portissa ei ole poikkeusta poikkileikkaavalle skoopille. Valinta: polut-kenttä scopes/viat/**, korjattavat tiedostot kuvauksessa; portin puute kirjattu V-268 → claude siirto (claude/idea 14a3933).

- **13.10.2026:** Käyttäjä 13.10.2026: "Kaikkien scopes skooppien pitää automaattisesti tallentaa viat tälle skoopille ja jättää minimaalinen tieto skoopille vian olemassa olosta. Tämä skooppi poistaa sen merkinnän siltä skoopilta kun vika on korjattu." Toteutus: scopes-skooppi kirjaa vian `vika.sh … scopes viat -- "<skooppi>: …"`; oma Viat-taulu saa vain viiterivin `| V-nnn → scopes viat | avoin |`; scopes viat poistaa viiterivin korjauksen jälkeen samassa pakkauksessa (poikkeus TYOTAVAT 10:een). vika.sh:ta ei muutettu.

- **13.10.2026:** Käyttäjä 13.10.2026 (pakkaus): seuraava paketti VIAT-KOONTI uudelleen.

- **13.10.2026:** V-265:n viiterivin tila on `tiedoksi` eikä `avoin`, koska rivi on muutosilmoitus, ei vika (sama tila kuin scopes viatin Viat-taulussa).

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti VIAT-SEURANTA (valinta "VIAT-SEURANTA" vaihtoehdoista Ei seuraavaa / VIAT-SEURANTA / V-264 ensin).

- **13.10.2026:** Käyttäjä 13.10.2026 (pakkaus): seuraava paketti VIAT-SEURANTA (toistuva koonti).

- **13.10.2026:** Käyttäjä 13.10.2026 (pakkaus): seuraava paketti V-276 ensin (valinta "V-276 ensin" vaihtoehdoista VIAT-SEURANTA / Ei seuraavaa / V-276 ensin); VIAT-SEURANTA jää Avoimiin asioihin.

- **13.10.2026:** V-285:n tila "avoin": uusi testi on muutosilmoitus, mutta testListaJaSkooppi kaatuu ('syöttökenttä puuttuu'), kun SCOPES_KOE_AUKI-skoopin istunnolla on kysymyskortti auki — testi riippuu koeskoopin istunnon tilasta.
- **13.10.2026:** VIAT-V276: testKysymysKortti ajettiin puhtaasta HEAD-kopiosta (git archive 977b5f45), koska scopes/ios:ssa oli toisen keskustelun committoimattomia muutoksia; testi.sh siirtää työpuun Macille sellaisenaan.

- **13.10.2026:** V-276:n X- ja Muu-tarkistuksia ei lisätty nyt: SkoopitUITests.swift on toisen keskustelun likaisena (sekoittuisi sen committiin), eikä testiä voi todentaa ilman monivalintaa odottavaa istuntoa.

- **13.10.2026:** V-290 omistajaksi scopes yhteys (reitti palvelin.mjs:ssä), tila tiedoksi (muutosilmoitus).

- **13.10.2026:** Käyttäjä 13.10.2026: "Tee V-276 nyt" (vaihtoehdoista Odota committia / Tee V-276 nyt / Jokin muu), sitten "Commit ja pakkaus" (ehto: vihreä), sitten "Tehdään huomenna eteenpäin. Pakkaa nyt".

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti VIAT-SEURANTA (valinta "VIAT-SEURANTA (suositus)" vaihtoehdoista VIAT-SEURANTA / V-285 / Ei seuraavaa pakettia).
- **14.10.2026:** Käyttäjä 14.10.2026: V-293:n omistaja on scopes testit (valinta "scopes testit (suositus)" vaihtoehdoista scopes testit / scopes lista / jätetään scopes-juurelle) — mittaa.sh ajaa simulaattoria samalla Mac-lukolla kuin testi.sh. Polkukarttaan rivi `scopes/ios/mittaa.sh → scopes testit` (Infra/skills/keskustelun-siirto/SKILL.md); V-293 korjattu, oma rivi ja scopes-juuren viiterivi poistettu.

- **14.10.2026:** Käyttäjä 14.10.2026: V-293:n omistaja scopes testit (valinta "scopes testit (suositus)" vaihtoehdoista scopes testit / scopes lista / jätetään scopes-juurelle).

- **14.10.2026:** Käyttäjä 14.10.2026: Pakkaa-napin 409 korjataan tässä skoopissa nyt (valinta "Korjaa tässä nyt (suositus)" vaihtoehdoista korjaa / kirjaa scopes hallinnalle / selvitä ensin purun 409).

- **14.10.2026:** Escape-sulku vain /pakkaa-komennolle: /sa ei saa hylätä kysymystä (keskustelu muuttuisi), /automaattisiirto jää jonoon (V-296:n päätös).

- **14.10.2026:** Käyttäjä 14.10.2026: palvelu käynnistetään uudelleen nyt, vaikka toisen keskustelun palvelin.mjs-muutos tulee mukaan (valinta "Käynnistä nyt (suositus)").

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti VIAT-SEURANTA (valinta "VIAT-SEURANTA (suositus)" vaihtoehdoista VIAT-SEURANTA / Ei seuraavaa pakettia).

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti "Ei seuraavaa pakettia" (vaihtoehdoista VIAT-SEURANTA / Ei seuraavaa pakettia); VIAT-SEURANTA jää Avoimiin asioihin toistuvana.

- **14.10.2026:** Käyttäjä 14.10.2026: "Jokin muu tehtävä" purun kysymykseen; tehtävä V-305.

- **14.10.2026:** Käyttäjä 14.10.2026: V-305 "Korjaa nyt (suositus)" (vaihtoehdoista Korjaa nyt / Vain kirjaus).

- **14.10.2026:** Tauko ennen Enteriä jätettiin pois: toisto osoitti, ettei sitä tarvita (osa alkuperäisestä ehdotuksesta).

- **14.10.2026:** Käyttäjä 14.10.2026: palvelu käynnistetään uudelleen nyt, vaikka toisen keskustelun toiminnot.mjs-muutos tulee mukaan ("Käynnistä nyt (suositus)").

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti V-305-TODENNUS (vaihtoehdoista V-305-TODENNUS / VIAT-SEURANTA / Ei seuraavaa pakettia).

- **14.10.2026:** Käyttäjä 14.10.2026: V-305 "Ei jumia (suositus)" (vaihtoehdoista Ei jumia / Jumi toistui / Aja VIAT-SEURANTA).

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti "Käyttöönotto (suositus)" (vaihtoehdoista Käyttöönotto / V-305-TODENNUS / Ei seuraavaa pakettia).

- **14.10.2026:** Lokit palvelimen tiedostoihin, ei puhelimeen: käyttäjällä ei ole shelliä, ja agentti lukee ne suoraan.

- **14.10.2026:** Käyttäjä 14.10.2026 klo 10.22: "Odotetaan, pakkaa" — jäätymistä ei ole vielä tapahtunut; juurisyyn haku odottaa käyttäjän havaintoa (jäätyminen ja kellonaika). Tämä vastaus on myös seuraavan paketin vahvistus (automaattivalinta false).

- **15.10.2026:** JAATYMINEN-JUURISYY suljettiin käyttäjän havainnolla (ei jäätymistä e18b968c:n jälkeen); havaittu "jäätyminen" oli ilmoituksen napautuksen kaatuminen.

- **15.10.2026:** Diagnostiikkaan lisättiin exceptionReason, jotta seuraava kaatuminen tunnistetaan suoraan lokista (hylätty: kaatuneen buildin uudelleenrakennus symbolointia varten — työpuusta tehty build ei toistu commitista).

- **15.10.2026:** VIAT-SEURANTA: tiedoksi-muutosilmoitukset kootaan yhdelle Viat-riville eikä niille lisätä viiterivejä (ideakirjan rivi kohdistuu jo omistajaan); oman rivin ja viiterivin saavat vain avoimet viat. Syy: rekisterin koko. V-467 (autovaihto.sh, paikallinen reitti) ei ole scopes-vika → kohde claude siirto (ennakko V-266:n kohdevaihto 9bc0a19).

- **15.10.2026:** V-467 → claude siirto (ennakko: V-266:n kohdevaihto 9bc0a19).

- **15.10.2026:** Korjaus näkyvyysparametrina kuten AndroidView(nakyvissa:) eikä onChange-kuuntelijana: sama malli kuin naapurinäkymässä, ja piilossa oleva Infra ei lataa turhaan.

- **15.10.2026:** Varsinaista V-312-toistoa (skoopin luonti kesken istunnon) ei ajettu simulaattorissa, koska se luo oikean skoopin palveluun; todennus jätetään laitteelle.

- **16.10.2026:** V-312 todennettu laitteella palvelimen pyyntölokista (scopes-pyynnot.loki 6.41–6.42 UTC): puhelin (192.0.2.15) haki Infra-latauksen kolmikon /api/rekisterit + /api/skoopit + /api/palvelin kahdesti 4 s välein (Infra → toinen välilehti → Infra), eli lista latautuu joka esiintulossa. Vika ja V-312-KORJAUS-rivi poistettu; infran rekisterin viiterivi (scopes/infra/REKISTERI.md:106) jää omistajalle.

- **15.10.2026:** VIAT-SEURANTA lukee jatkossa IDEAT.md:n lisäksi TIEDOKSI.md:n (tiedoksi-rivit siirtyvät sinne) ja tarkistaa V-SARJA.md:n viimeisen tunnuksen. Syy: V-490–V-492 eivät olleet IDEAT.md:ssä.

- **15.10.2026:** Käyttäjä 15.10.2026: "Kirjaan ja korjaan tässä" (vaihtoehdot: vain kirjaus omistajalle / vain selvitys) — toisen skoopin tiedosto korjattiin tässä, muutos kirjattu omistajalle V-508:lla (TYOTAVAT 15).

- **15.10.2026:** Käyttäjä 15.10.2026: "Agentti käynnistää nyt" — elävän palvelun :8787 uudelleenkäynnistys.

- **15.10.2026:** Hylätty vaihtoehto: avaaIstunto nimeäisi istunnon skoopin mukaan (ei kata autovaihto.sh:ta eikä jo käynnissä olevia istuntoja).

- **16.10.2026:** Käyttäjä 16.10.2026: palvelu käynnistetään uudelleen heti ("Agentti käynnistää nyt (Recommended)").

- **16.10.2026:** Käyttäjä 16.10.2026: korjattu äppi asennetaan heti ("Agentti asentaa nyt (Recommended)").

- **16.10.2026:** V-515: perutun vuoron teksti tyhjennetään eikä lähetetä uudelleen (näkyy äpissä aiempana viestinä); hylätty vaihtoehto 409-hylkäys täydellä kentällä (estäisi lähetyksen).

- **16.10.2026:** V-515 ja V-516 korjattiin tässä skoopissa kuten V-305 (korjauskoodi scopes chatin ja scopes-äpin tiedostoissa); omistajille tiedoksi V-517.

- **16.10.2026:** V-312 suljetaan lokitodistuksella; vaihtoehto "luo oikea skooppi ja katso Infra" hylätty (luo oikean skoopin palveluun, lataus todistaa saman mekanismin).

- **16.10.2026:** Infran rekisterin viiterivi scopes/infra/REKISTERI.md:106 ("V-312 → scopes viat, avoin") on vanhentunut mutta omistajan (scopes infra); ei päivitetty tässä (TYOTAVAT 15).

- **16.10.2026:** Käyttäjä 16.10.2026: odotetaan kiintiötä (ei testiajoa eikä rekisterikirjausta pakkausscriptin skoopissa ennen sitä). Hylätty: testit juuresta heti, rekisterin päivitys heti.

- **16.10.2026:** Pakataan vain `scopes viat`: skripti listasi 17 skooppia, koska työpuu on likainen, mutta tämä sessio ei muuttanut niiden tiedostoja (muutokset muiden keskustelujen: V-008, sääntö 15).

- **17.10.2026:** Pakkaus rajataan session omiin tiedostoihin; muiden skooppien keskeneräiset muutokset (26 skooppia työpuussa) eivät kuulu tähän (sääntö 15).

- **17.10.2026:** Paikallisen mallin reitti pidetään välityksellä (lm-valitys), ei LM Studion asetusmuutoksella: Claude Code lisää role=system-viestin aina.

- **17.10.2026:** Palautettiin arkistoidut skoopit aktiivisiksi ja varmistettiin API-yhteensopivuus ilman rikkovia muutoksia

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| VIAT-SEURANTA | avoin (toistuva) | kokoa ideakirjan (IDEAT.md ja TIEDOKSI.md, V-SARJA.md luettelee omistajat) uudet scopes-kohteiset V-rivit (V-492 jälkeen; V-300–V-492 käsitelty 15.10.2026; V-490 claude siirto, ei scopes) Viat-tauluun ja avoimille viiterivit omistajille; poista korjattujen vikojen viiterivit ja omat Viat-rivit; vie V-547–V-552 Viat-tauluun omistajille seuraavassa ajossa |
| V-305-TODENNUS | avoin | lähetyksen ok-polku todennettu 14.10.2026 9.07–9.29 (6 riviä, kaikki "tulos":"ok"), käyttäjä ei havainnut jumia; seuraa scopes-toiminnot.lokin "tulos":"ei näkynyt" -rivejä; jos jumi toistuu, ruutu-kenttä näyttää syöttökentän tilan → korjaa juurisyy; jos ei toistu ja käyttäjä kertoo jumin, lokissa ei ole riviä → reitti oli Claude iOS / Remote Control (ei scopes-vika). Viim. 28.10.2026. |
| Diagnostiikan uudet kentät | kesken; asennettu 15.10.2026 21.29, odottaa MetricKit-raporttia | seuraavan asenna.sh-ajon jälkeen MetricKit-rivillä pitää näkyä ios/laitemalli/build (todennus, kun raportti tulee). |
| V-502 | avoin | tuotannossa IDEAT.md:ssä (kohde scopes viat, ilmoittaja scopes yhteys, 15.10.2026; oma vika: iPhonen odotussilmukka ajoi xcrun devicectl ilman DEVELOPER_DIR:ää, 2>/dev/null piilotti virheen, odotus 10 min); käsittelemättä; seuraava VIAT-SEURANTA-ajo vie sen Viat-tauluun omistajalle scopes yhteys (ei heti ajettavaa koodityötä tässä skoopissa). |
| V-508 | korjattu ac4c4376 15.10.2026 (palvelu käynnistetty uudelleen); odottaa skooppia scopes infra | omistaja scopes infra päättää kirjauksesta omaan rekisteriinsä; ei toimea tässä skoopissa. |
| V-515 | korjattu 979272fb 16.10.2026 (palvelu uudelleenkäynnistetty); odottaa käyttäjää (todenna viim. 30.10.2026) | seuraava perutun vuoron jälkeinen äppiviesti: transkriptissa vain uusi teksti, scopes-toiminnot.loki "tulos":"ok"; pitkä rivittyvä kenttä todentamatta; käyttäjä todentaa äppiviestistä tai laitetasolta |
| V-516 | korjattu 092ffd53 16.10.2026 (asennettu puhelimeen 7.30, laitetodennus); odottaa käyttäjää (todenna viim. 30.10.2026) | käyttäjä avaa scopes chatin viestinäkymästä Pura: rivi "Purkaja: Purascript (oletus)" |
| V-548 | avoin (IDEAT.md:ssä, ei vielä rekisterissä; korjaus kuuluu skoopeille claude siirto ja scopes siirto: scriptipohjainen /pura uusi -luonti; käyttäjä valitsi pakkaa vain 17.10.2026); odottaa skooppia scopes siirto | ei koodityötä scopes viat -skoopissa; omistaja korjaa, VIAT-SEURANTA vie rivin Viat-tauluun. |
| autovaihto.sh/viestit.mjs mkdir -p -rivit ja välitysketju | avoin (työpuussa, ei committoitu); odottaa skooppia scopes infra | omistaja (scopes infra / claude siirto) committaa omassa pakkauksessaan; tiedostot sisältävät myös muiden keskustelujen (agy) keskeneräisiä muutoksia. |
| LM Studion temp-kansion katoamisen pysyvä korjaus (lms-daemon ExecStartPost, root) | avoin; odottaa käyttäjää | ks. V-552. |

## Viat

| Vika | Tila |
|---|---|
| V-264 (omistaja scopes infra) lahteet.mjs lista() laskee istuntoihin myös pakatut (bf75a5b2) — harkitse suodatusta | avoin 13.10.2026; parannus, ei rikkinäinen toiminto |
| V-285 (omistaja scopes testit) testListaJaSkooppi kaatuu 'syöttökenttä puuttuu', kun SCOPES_KOE_AUKI-skoopin istunnolla on kysymyskortti auki (ae09daa6) | avoin 13.10.2026 (scopes chat); testi riippuu koeskoopin istunnon tilasta — ajo SCOPES_KOE_AUKI="scopes chat" läpi |
| V-305 (omistaja scopes viat; korjauskoodi scopes chatin tiedostossa) Skoopin istuntoon lähetetyt viestit jäivät syöttökenttään ja lähtivät myöhemmin yhtenä (825969ab, 14.10.2026 8.49) | korjattu 07437933; odottaa ajoa (osittain: lähetys tarkistetaan transkriptista ja kirjataan, äppi saa 504:n; juurisyy toistamatta; ok-polku todennettu lokista 9.24; todenna jumitapaus V-305-TODENNUS viim. 28.10.2026) (todenna viim. 28.10.2026) |
| V-489 (omistaja scopes testit) testInfraJarjestys kaatuu puhtaalla HEADilla: olettaa claude- ja infra-kortit vierekkäin listan alkuun (SkoopitUITests.swift:274) | avoin 15.10.2026 (ilmoittaja scopes viat) |
| V-331 (omistaja scopes testit) testListaJaSkooppi punainen HEADilla; V-427: kaatuu myös ympäristöstä (scopes lista pakattu) | avoin 14.10.2026 |
| V-337 (omistaja scopes yhteys) testEtatunneli kaatuu puhtaalla HEADilla: 'skoopit eivät latautuneet tunnelin läpi' (SCOPES_TUNNELI=pakota), kahdesti 14.10.2026 | avoin 14.10.2026 (ilmoittaja scopes notifications); ajamatta V-487:n korjauksen d4671e92 jälkeen |
| V-338 (omistaja scopes jakelu) asenna.sh ja testi.sh paketoivat työpuun sellaisenaan: rinnakkaisen keskustelun committoimaton työ päätyy puhelimeen tai testiin | avoin 14.10.2026 (ilmoittaja scopes notifications); ehdotus --head-lippu tai varoitus likaisesta puusta |
| V-382 (omistaja scopes chat) Äppi ei näytä istunnon odottavaa lupakyselyä (tila vain varattu); äpin viesti syöttää näppäimiä avoimeen kyselyyn sokkona — jumi 3 h 23 min 14.10.2026 | avoin 14.10.2026 (ilmoittaja scopes chat media) |
| V-447 (omistaja scopes jakelu mac) skoopit-asennus.sh:24 omapro() ei tunnista widget-laajennuksen profiilia ...com.example.skoopit.widget → 7 pv uusinta ei uusi sitä | avoin 15.10.2026 (ilmoittaja scopes notifications); määräpäivä 22.10.2026 06.26 UTC (nykyinen widget-profiili vanhenee) |
| V-466 (omistaja scopes yhteys) iOS Android-näkymän liite lähtee ilman tekstiä, erillinen kirjoita-kutsu 409; korjaus: teksti liite-kutsuun ?teksti= (palvelin tukee jo, 3bad0532) | avoin 15.10.2026 (ilmoittaja scopes agy android); korjauksen jälkeen asenna.sh |
| V-472 (omistaja scopes infra) Tiedot-näkymän Toiminnot-osion tulos/virhe ja ProgressView kytkinten alla näytön ohi (Nakymat.swift:119-122) | avoin 15.10.2026 (ilmoittaja scopes context purascript) |
| Tiedoksi-muutosilmoitukset (ei vikoja; kuvaus ideakirjassa): scopes testit V-273, V-274, V-278, V-280, V-283, V-292, V-297, V-317, V-336, V-358, V-387, V-391, V-409, V-414, V-427, V-459; scopes yhteys V-275, V-290, V-303, V-398, V-420, V-425; scopes infra V-282, V-291, V-295, V-491; scopes siirto (ent. hallinta) V-265, V-296, V-298; scopes chat V-318, V-386, V-390; scopes jakelu V-281; scopes lista V-492; scopes V-323, V-408, V-413, V-488 | tiedoksi |
| V-508 (omistaja scopes infra) mallittoman purun istunto puuttui äpistä: skooppi näkyi pakattuna, vaikka istunto eli | korjattu ac4c4376; odottaa ajoa (elävä palvelu käynnistetty uudelleen 15.10.2026 22.48, pid 11283; palvelun /api/skoopit todennettu, laitetodennus äpissä tekemättä) (ilmoittaja scopes viat) (todenna viim. 29.10.2026) |
| V-515 (omistaja scopes viat; korjauskoodi scopes chatin viestit.mjs) uusi viesti liimautui istunnon syöttökenttään palautetun perutun viestin perään | korjattu 979272fb; odottaa käyttäjää (todennus kesken) (todenna viim. 30.10.2026) |
| V-516 (omistaja scopes viat; korjauskoodi scopes-äpin Viestit.swift ja PuraValinta.swift) skoopin viestinäkymän Pura-arkki näytti scopes-perheelle purkajalistan ilman Purascriptiä | korjattu 092ffd53, asennettu 16.10.2026; odottaa käyttäjää (laitetodennus tekemättä) (todenna viim. 30.10.2026) |
| V-548 (omistaja scopes viat) uuden scopes-skoopin luonti epäonnistui hiljaa: sana scopes putosi argumentista, äppi jatkoi puruun, 404; luonnin pitää olla täysin scriptipohjainen | avoin 17.10.2026 |
| V-550 (omistaja scopes chat) kyselykortin vaihtoehdot harmaina | avoin 17.10.2026 (ei toistettu) |
| V-551 (omistaja scopes agy siirto) "?"-viesti avaa agy:n pikanäppäinpaneelin | avoin 17.10.2026 |
| V-552 (omistaja scopes infra) LM Studion temp-kansio katoaa | avoin 17.10.2026 |
| V-553 (omistaja scopes lista) listasta arkistointi oli poistanut skoopit Infran scopes-valikosta ja repositoriosta; korjattu: arkistoidut 15 skooppia palautettu, listasta arkistointi piilottaa vain sivupalkin listasta ja pakkaa CLI-istunnon, skooppi säilyy aina Infrassa | avoin 17.10.2026 |

## Historia

Historia: `scopes/viat/HISTORIA.md`, ei lueta purussa.
