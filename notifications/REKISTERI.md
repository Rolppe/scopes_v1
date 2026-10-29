# scopes/notifications/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: NOTIFICATIONS-LUKITUS-TODENNUS — asenna 0c5bb1ad puhelimeen (`bash scopes/ios/asenna.sh`, avattu puhelin kotiverkossa, kysy lupa), sitten aja `bash scopes/notifications/taustahaku.sh`: MUUTOS-rivit kertovat, mikä siirtymä jäi ilmoittamatta (3/3 herätystä 16.10.2026 muuttuneita 1, ilmoituksia 0); ilmoitettava siirtymä → ilmoitukset()-vika; ilmoituksia > 0 → lukitusnäytön ilmoitus todennettu — polut: scopes/ios/Sources/Ilmoitukset.swift, scopes/notifications/taustahaku.sh — aloitus: /pura scopes notifications

## Tarkoitus ja raja

Skoopit-äppi (`scopes`) tekee itse ilmoitukset puhelimeen, kuten Claude iOS -äppi. Raja (käyttäjä 14.10.2026, päivitetty 15.10.2026): vain äpin omat paikalliset ilmoitukset ja lukitusnäytön widget, ei palvelinpuolen lähetystä (HA-push hylätty 15.10.2026, ntfy) eikä maksullista Apple Developer -tiliä (APNs). Ilmainen Apple ID -allekirjoitus (7 pv uusinta, `scopes jakelu mac`). Äpin ollessa auki haku 10 s välein; kiinni tai lukittuna iOS:n ajoittama vähävirtainen taustapäivitys (BGAppRefreshTask, tiheys iOS:n päättämä, ei taattu), joka lähettää paikalliset ilmoitukset ja päivittää widgetin (df0400df). Omat tiedostot: `scopes/notifications/**`, `scopes/ios/Sources/Ilmoitukset.swift`, `scopes/ios/Widget/**`, `scopes/ios/Jaettu/**`.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes notifications` luotiin komennolla `/pura uusi scopes notifications`.
- **Käyttäjä 14.10.2026:** ilmoitettavat tapahtumat: istunto odottaa käyttäjää (kysymyskortti tai vuoro päättyi odottamaan), paketti valmis (paketti valmistui tai skooppi pakattiin), konteksti lähellä rajaa, virhe tai uusi avoin vika.
- **Käyttäjä 14.10.2026:** "Tällä hetkellä haluan vain että puhelimen äppi tekee puhelimeen ilmoitukset kuten claude ios äppi" — palvelinpuolen kanava (ntfy, valittu ensin) jää pois; kotiHA:ta (`Infra/iot/ha/ha.sh palvelu notify.mobile_app_iphone`) ei tarjottu ensimmäisessä kysymyksessä, vaikka se oli kirjattu (`claude/HISTORIA.md` 24.9.2026).
- **Käyttäjä 14.10.2026:** vain paikalliset ilmoitukset; maksullista Apple Developer -tiliä (APNs) ei oteta.
- **Käyttäjä 14.10.2026:** seuraava paketti NOTIFICATIONS-SIMULAATTORI.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti NOTIFICATIONS-PUHELIN (valinta "NOTIFICATIONS-PUHELIN (suositus)").

- **14.10.2026:** Kontekstiraja tallennetaan Tallenna-painikkeella kuten muut asetukset (ei heti @AppStorage), jotta Peru toimii.

- **14.10.2026:** Käyttäjä 14.10.2026: Asetuksiin Ilmoitukset-alavalikko ja muut tarvittavat alavalikot (Yhteys, Tietoja).

- **14.10.2026:** Käyttäjä 14.10.2026: ei seuraavaa pakettia (valinta "Ei seuraavaa (suositus)").

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti "Ei seuraavaa" — rivi pysyy ennallaan.

- **15.10.2026:** Käyttäjä 15.10.2026: ilmoitukset palvelimelta Home Assistantin mobile_app-pushina (notify.mobile_app_iphone). Tämä laajentaa 14.10. rajausta "vain paikalliset ilmoitukset" (REKISTERI.md:9, :15–16): kiinni olevan / lukitun äpin ilmoitukset kuuluvat nyt skooppiin. Hylätyt: maksullinen Apple Developer -tili (APNs), ennallaan pitäminen.

- **15.10.2026:** Äpin omat paikalliset ilmoitukset poistettiin kokonaan, ettei samasta tule kahta ilmoitusta.

- **15.10.2026:** Ilmoitusasetukset (lajit, raja) asuvat palvelimella ~/.config/scopes/ilmoitukset.json; äpin UserDefaults on välimuisti.

- **15.10.2026:** Käyttäjä 15.10.2026: HA-push hylätään kokonaan ("En halua scopes äppiin homeassistant ilmoituksia"); valinta "Pysäytä ja poista". Tämä kumoaa REKISTERIN 15.10. päätöksen HA-pushista.

- **15.10.2026:** Käyttäjä 15.10.2026: vähävirtainen taustatila; lukitusnäytölle "Widget + ilmoitus" (paikallinen ilmoitus muutoksesta + lukitusnäytön widget). Hylätyt: vain widget, vain taustadata, vahdin jättäminen käyntiin.

- **15.10.2026:** Skooppiraja päivittyy: kiinni olevan/lukitun äpin päivitys kuuluu skooppiin iOS:n BGAppRefreshTaskin kautta (tiheys iOS:n päättämä, ei taattu); APNs/maksullinen tili edelleen pois.

- **15.10.2026:** Widget ei hae verkkoa itse (palvelu näkyy kodin ulkopuolella vain äpin oman tunnelin kautta); äppi kirjoittaa tilannekuvan App Groupiin.

- **15.10.2026:** Kaatuneita UI-testejä ei korjattu: ne ovat scopes testit / scopes chat / scopes infra -skooppien tiedostoissa (TYOTAVAT 10/15). Uusi tieto (kaksi aitoa punaista auki olevalla skoopilla) jätettiin /vika-ilmoitukseksi käyttäjälle, koska /vika on vain käyttäjän komento ja autojatkossa ketään ei ollut paikalla.

- **15.10.2026:** Ei vaihdettu ilmoitusmekanismia (HA-push poistettiin käyttäjän päätöksellä 15.10.2026; APNs ei ilmaisella allekirjoituksella): ensin todennetaan, herättääkö iOS äpin lainkaan — siksi taustahaun aikaleima näkyviin Asetuksiin.

- **15.10.2026:** Toisten istuntojen likaiset tiedostot ja VIERAS-rivit eivät ole tämän session muutoksia (toisten keskustelujen keskeneräistä työtä samassa työpuussa) → vika.sh-kirjauksia ei tehty.

- **15.10.2026:** Ilmoitustestit puhelimessa ajetaan käyttäjän 1 min lukitusprotokollalla (käyttäjä 15.10.2026), ei tuntien taustatestinä. Kirjattu muistiin notification-test-lock-one-minute.

- **15.10.2026:** Asennus puhtaasta HEAD-viennistä + omat tiedostot, kun työpuussa on vieraita iOS-muutoksia.

- **15.10.2026:** Kysely on oma ilmoituslajinsa ja -kytkimensä (käyttäjä 15.10.2026); "Istunto odottaa sinua" kattaa yhä idle/odottaa-tilat. Oletus päällä kuten muilla lajeilla.

- **15.10.2026:** Käyttäjä 15.10.2026: "Sinun pitää itse pystyä tekemään tämän kaltainen diagnostiikka. Turhaa työllistää minua näillä hommilla." → tämän skoopin havainnot (taustahaku, ilmoitusten laukeaminen) luetaan puhelimesta ja lokeista itse (taustahaku.sh), ei kysytä käyttäjältä Asetusten rivejä.

- **16.10.2026:** Käyttäjä 15.10.2026 klo 19.16: todennus äpin palvelinraportilla (vaihtoehdot olivat odottaa puhelimen avausta / lopettaa päivältä). Plistiluku jää varareitiksi.

- **16.10.2026:** Käyttäjä 16.10.2026: "Agentti asentaa nyt" (d3ae95a8).

- **16.10.2026:** Käyttäjä 16.10.2026: seuraava paketti NOTIFICATIONS-LUKITUS-TODENNUS (suositus).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikalliset ilmoitukset äppiin | valmis b20bfdaa 14.10.2026 (todennettu puhelimessa; määritelty 14.10.2026; toteutettu, banneri ja napautus todennettu simulaattorissa 14.10.2026) **14.10.2026:** UI-testit eivät kysy ilmoituslupaa (SCOPES_AVAIN annettu), ellei SCOPES_ILMOITUKSET=1; V-300 (scopes viat): idle on oma tilansa; odottaa() laskee kaiken muun kuin kasittely/pakattu odottavaksi, joten ilmoitus ("Vuoro valmis") toimii korjauksen jälkeenkin. **14.10.2026:** simulaattori (scopes/ios/testi.sh, SCOPES_TULOS=ilmoitukset) exit 0: testIlmoitusBanneriJaNapautus Passed 13 s, testIlmoitusRajaAsetuksissa Passed 17 s (14.10.2026 09.05, Mac ~/scopes-ios/ilmoitukset.xcresult); kuvat ilmoitus-banneri, ilmoitus-napautus, ilmoitusraja (Konteksti ≥ 125 k) tarkistettu silmin; ilmoitukset-testi: simulaattori muistaa ilmoitusluvan ajojen välillä; testi hyväksyy luvan vain, jos kysely näkyy. **14.10.2026:** Paikalliset ilmoitukset syntyvät vain, kun äppi pollaa (auki tai ~30 s taustalla); puhelin on WireGuard-tunnelissa 192.0.2.30, jolloin Mac näkee sen devicectl:ssä "unavailable" ja asennus vaatii kotiverkon tai kaapelin; Paikalliset ilmoitukset: klo 8.50 asennettu versio ei sisältänyt ilmoituskoodia (binäärissä ei Ilmoittaja/Koeilmoitus-merkkijonoja), siksi ensimmäiset bannerikokeet epäonnistuivat; Paikallisten ilmoitusten lajikytkimet: UserDefaults "ilmoitus-<laji>", oletus päällä; Ilmoittaja.hae suodattaa ilmoitusPaalla(laji):lla. | — |
| Taustapäivityksen paikallinen ilmoitus lukitulla näytöllä | avoin (15.10.2026: ilmoitus ei tullut lukitulle näytölle; korjaus 1a211f4a, nyt puhelimessa: asennus 15.10.2026 16.44, cc571440 sisältää sen; taustaherätykset raportoituvat palvelimelle (c02005b3), 2/2 herätystä ilmoituksia 0; raportissa muuttuneita + lahtotasonIka d3ae95a8, asennettu puhelimeen 16.10.2026 00.48, simulaattori ilmoitustestit 2/2 Passed; 16.10.2026: 3/3 uutta herätystä (03:10, 03:38, 05:07Z) ilmoituksia 0, muuttuneita 1, lähtötason ikä 5 h / 23 min / 15 min → muutos on, mutta ei ilmoitettu; raporttiin skoopin nimi ja kentän siirtymä (muutokset), ei vielä puhelimessa); odottaa ajoa **15.10.2026:** lukitusnäytön ilmoitus toimii ~30 s taustaikkunassa, 3/3 testiä (14.34, 15.30, 15.46). **15.10.2026:** taustapäivityksen havainto: pyyntöloki 15.10.2026 klo 15.40–16.49: puhelimelta (192.0.2.15/.151) 6 etualapursketta, ei eristettyä pelkkää /api/skoopit-pursketta; muista osoitteista vain 127.0.0.1-testit; pyyntöloki yksin ei erota kylmää taustakäynnistystä etualasta, äppiloki + plisti erottavat. **16.10.2026:** Todettu 15.10.2026: lukitulle puhelimelle `xcrun devicectl device copy from` epäonnistuu (CoreDeviceError 4016, 5/5 yritystä 17.52–19.12) ja `xcodebuild -destination id=<laite>` ei löydä kohdetta, joten asennus vaatii avatun puhelimen; Äppilokin taustahaku-raportit (uusi reitti toimii): 2026-10-15T17:26:01Z ja 18:22:21Z ilmoituksia 0; 4 h seurannassa (20.37–00.37) vain nämä 2 herätystä, ~1 h välein, viimeinen 21.22, sen jälkeen ei herätyksiä; ilmoitukset() (Ilmoitukset.swift:65) ilmoittaa vain siirtymistä edellisen haun lähtötasoon nähden (vikoja kasvoi, pakattiin / seuraava muuttui, kysely, odottaa-siirtymä, kontekstiraja); 0 ilmoitusta voi olla "ei muutoksia" tai vika, raportti ei vielä erota näitä. **16.10.2026:** äppiloki ~/.local/state/scopes-app.loki, taustahaku-tapahtumat d3ae95a8:n jälkeen (laitteen kello): 03:10:20Z ilmoituksia 0, muuttuneita 1, lahtotasonIka 18924 s; 03:38:23Z 0 / 1 / 1401 s; 05:07:17Z 0 / 1 / 871 s → 3/3 herätystä: muutos havaittiin, taustapäivityksen ilmoitusta ei lähtenyt. | asenna 0c5bb1ad (avattu puhelin kotiverkossa, kysy lupa), sitten taustahaku.sh: MUUTOS-rivin siirtymä ilmoitettava (pakattiin, seuraava muuttui ei-nil:stä, →kysely, ei-odottava→odottava, vikoja kasvoi, kontekstiraja) → ilmoitukset()- tai lupa-/laheta-vika; ei-ilmoitettava → odota ilmoitettavaa muutosta; agentti ajaa `bash scopes/notifications/taustahaku.sh` aika ajoin (LOKI-rivi); kun taustaherätyksen `ilmoituksia` > 0, ilmoitus lähti lukitulle näytölle → todennettu ilman käyttäjää; ei kysytä käyttäjältä; odottaa iOS:n ajoitusta (ei heti ajettava; iOS ajoittaa, voi viivästyä tunteja; virransäästötila estää); LOKI-rivin muuttuneita/lähtötason ikä (d3ae95a8): ilmoituksia 0 ja muuttuneita 0 = ei muutoksia; ilmoituksia 0 ja muuttuneita > 0 = ei-ilmoitettava muutos tai ilmoitukset()-vika; jos taustahaku-rivi näyttää herätyksiä mutta ilmoituksia ei tule → vika ilmoitukset()-logiikassa tai luvassa; jos herätyksiä ei tule tunteihin → iOS ei ajoita (harkitse muuta mekanismia käyttäjän kanssa) **16.10.2026:** Taustapäivityksen ilmoitus: ei-ilmoitettavia siirtymiä ilmoitukset()-logiikassa (Ilmoitukset.swift): → kasittely, idle↔odottaa (odottaa() laskee molemmat odottaviksi), kysely→odottaa, vikoja laski, seuraava nil→X (vaatii v.seuraava != nil). Havaittu muutos voi siis olla ei-ilmoitettava; MUUTOS-rivit (0c5bb1ad) ratkaisevat. |

## Viat

| Vika | Tila |
|---|---|
| V-447 (kirjattu toiselle skoopille, scopes jakelu mac): `omapro()` scopes/ios/mac/skoopit-asennus.sh:24 ei tunnista widget-profiilia → widgetin profiili voi jäädä uusimatta (vanhenee 22.10.2026); vaikuttaa tähän skooppiin, seurattava | avoin; odottaa skooppia jakelu mac |

## Historia

Historia: `scopes/notifications/HISTORIA.md`, ei lueta purussa.
