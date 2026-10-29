# scopes/siirto/agymacos/REKISTERI.md

Tilanne: 27.10.2026

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää

## Tarkoitus ja raja

Selvittää ja korjata ongelmia sekä kehittää ominaisuuksia vanhassa Scopes-äpissä (iOS-sovellus `scopes/` ja taustapalvelu `scopes/palvelu/`) macOS agy -istuntojen osalta.

Raja: Polut `scopes/siirto/agymacos/**`, `scopes/palvelu/**`, `scopes/ios/Sources/**`, `scopes/shared/**`, `claude/siirto/tools/**`, `claude/siirto/state/**`.

## Päätökset

- **Käyttäjä 26.10.2026:** skooppi `scopes siirto agymacos` luotiin komennolla `/pura uusi scopes siirto agymacos`.
- **Käyttäjä 26.10.2026:** Skoopin tarkoitus määritelty: vanhan Scopes-äpin ja taustajärjestelmän ongelmien selvitys, korjaus ja ominaisuuksien kehitys macOS agy -istuntojen osalta. Ensimmäinen tehtävä on selvitystyö virheestä "Agy-istunto kuuluu vain scopes-perheen skoopeille" avattaessa `infra expresso` -skooppia.
- **26.10.2026 (SIIRTO-AGYMACOS-EXPRESSO-KORJAUS):** Käyttäjän pyynnöstä malliton purku ja vanha taustapalvelu laajennettu kattamaan `infra`-perhe (`Infra/`, `infra/`). Muutokset: `claude/siirto/tools/pura-malliton.mjs` (`PERHEJUURET`), `claude/siirto/tools/pura-malliton.test.mjs`, `scopes/palvelu/toiminnot.mjs` ja `scopes/palvelu/toiminnot.test.mjs`. Kaikki testit vihreitä (46/46 ja 29/29).
- **26.10.2026 (SIIRTO-AGYMACOS-SULJE-ILMAN-PAKKAUSTA):** Käyttäjän pyyntö: skoopin aivokuvasta avautuvaan valikkoon/näkymään lisätty istunnon sulkeminen ilman pakkausta. Taustapalveluun (:8787) lisätty toiminto ja reitti `POST /api/skoopit/:nimi/sulje`, joka lähettää ruutuun Escapen ja `/exit` ilman pakkausta ja poistaa skoopin jonotetut komennot. iOS-äppiin lisätty `Button("Sulje istunto ilman pakkausta", role: .destructive)` vahvistusdialogilla `SkooppiNakymaView`-toimintoihin sekä pikavalikko (.contextMenu) chatin yläpalkin aivokuvakkeeseen. Kaikki testit vihreitä (30/30 ja 22/22).
- **26.10.2026 (SIIRTO-AGYMACOS-ETA-BUILD-IPA):** Käyttäjän pyyntö: äpin etäasennus ja etäbuild ilman samaa lähiverkkoa. Selvitetty iOS 17 CoreDevice- ja VPN-rajoitukset sekä SideStore-vaihtoehdon tietoturva (raportti scopes-ios-eta-asennus-selvitys.md). Toteutettu: 1) skoopit-asennus.sh päivitetty käyttämään -destination "generic/platform=iOS" laite-id:n sijaan ja paketoimaan Skoopit.ipa automaattisesti buildin yhteydessä; 2) lisätty lippu --ipa, joka rakentaa ja paketoi IPAn ohittaen devicectl-asennusvaiheen; 3) scopes/palvelu/palvelin.mjs:ään lisätty reitit GET /api/ios/ipa ja GET /api/skoopit.ipa (tukee Bearer-otsaketta ja ?avain=... -kyselyparametria); 4) scopes/ios/asenna.sh tukee --ipa-lippua ja kopioi valmiin IPAn palvelimelle. Kaikki testit vihreitä (30/30).
- **26.10.2026 (SIIRTO-AGYMACOS-KESKITETTY-MALLIVALINTA):** Käyttäjän pyyntö: keskitetty ja dynaaminen mallinhallinta äppiin. Mallit valitaan äpin asetuksissa (`AsetuksetView -> Mallit / MalliAsetuksetView`), ja oletuksena kaikki valitut sekä uudet mallit ovat heti valittavissa kaikissa skoopeissa ja keskusteluissa. Toteutettu:
  1) `scopes/ios/Sources/Asetukset.swift`: lisätty `kaikkiMallit`, `sallitutMallit: Set<String>`, `otaUudetMallitAutomaattisesti: Bool` (oletus `true`), `oletusMalli: String` (UserDefaults-persistenssi), `paivitaMallit()` ja `aktiivisetMallitRyhmittain`.
  2) `scopes/ios/Sources/Nakymat.swift`: lisätty `MalliAsetuksetView`, jossa automaatiokytkin ("Ota uudet mallit käyttöön automaattisesti"), oletusmallin valinta, ryhmitellyt kytkimet jokaiselle mallille sekä painikkeet kaikkien valintaan ja oletusten palautukseen.
  3) `scopes/ios/Sources/MalliValikko.swift`: korvattu kovakoodatut listat dynaamisella `asetukset.aktiivisetMallitRyhmittain` -listauksella.
  4) `scopes/ios/Sources/PuraValinta.swift`: siivottu duplikaattistruktit, suodatettu mallit `asetukset.sallitutMallit` mukaan ja päivitetty mallilista taustapalvelusta.
  5) `scopes/ios/Sources/Viestit.swift`: `ChatView.mallinValinta` suodattaa valittavat mallit `asetukset.sallitutMallit` mukaan ja tukee AGY-malleja.
  6) `scopes/shared/`: `ScopeModels.swift` ja `ScopesUI/MalliValikko.swift` päivitetty tukemaan `Identifiable`, dynaamisia ryhmiä ja OnePlus Linux AGY -malleja.
  7) `scopes/palvelu/palvelin.mjs`: lisätty `GET /api/mallit` (kutsuu `purkajat.lista()`). `viestit.mjs`: lisätty OnePlus Linux AGY -mallit (`agy/*`).
  8) Käännetty ja testattu: ScopesCore (22/22), ScopesUI (3/3), palvelu (30/30), xcodebuild onnistui ja uusi `Skoopit.ipa` generoitu.

- **26.10.2026 (SIIRTO-AGYMACOS-SIMULAATTORITESTAUS):** Käyttäjän pyynnöstä todennettu toiminnot simulaattorissa (iPhone 15 Pro) ja automatisoitu testit:
  1) `scopes/ios/UITests/MalliUITests.swift`: lisätty automatisoitu UI-testi `testMalliAsetukset`, joka testaa `MalliAsetuksetView`-näkymän (automaatiokytkin, malliryhmät Claude, Mac AGY, OnePlus Linux AGY, Nebius, mallien kytkimet ja toimintopainikkeet) ja tallentaa kuvakaappaukset. Ajettu simulaattorissa ja todettu vihreäksi (1/1).
  2) `scopes/ios/UITests/SkoopitUITests.swift`: lisätty tarkistus `toiminto-sulje`-painikkeelle ("Sulje istunto ilman pakkausta") toiminnot-listassa.
  3) `infra expresso`: ajettu `pura-malliton.mjs "infra expresso"` puhtaasti (exit 0). Yksikkötestit `pura-malliton.test.mjs` (46/46) ja `toiminnot.test.mjs` (30/30) todettu vihreiksi.
  4) ScopesCore (22/22) ja ScopesUI (3/3) vihreitä.

- **26.10.2026 (SIIRTO-AGYMACOS-ASENNUS-PUHELIMEEN):** Käyttäjän pyynnöstä Skoopit-äppi käännetty ja asennettu suoraan käyttäjän iPhoneen (`iPhone 15 Pro`, UDID `YOUR_DEVICE_UDID`) komennolla `~/scopes-ios/skoopit-asennus.sh`. Käännös (17 s), IPA-paketointi ja devicectl-asennus suoritettu onnistuneesti (exit 0, profiilin voimassaolo: 29.10.2026 klo 06:40:59 UTC asti).

- **26.10.2026 (SIIRTO-AGYMACOS-EFFORT-VAIHTO):** Käyttäjän pyynnöstä reasoning effort levelin vaihto toteutettu toimimaan kesken keskustelujen sekä Claude- että AGY-istunnoissa:
  1) `scopes/palvelu/viestit.mjs` (`vaihdaMalli`): Claude Code -istunnoissa lämpimän välimuistin vahvistusikkuna ("Change effort level? 1. Yes, switch to ... / 2. No, go back") vahvistetaan (valinta 1), jolloin effort-taso vaihtuu pyydetyksi eikä heitä 409-virhettä. Mahdollinen globaaliin `~/.claude/settings.json`:iin tallentunut asetus palautetaan alkuperäiseksi.
  2) AGY-istunnoissa (OnePlus Linux & Mac AGY) `vaihdaMalli` avaa `/effort`-valitsimen, navigoi liukusäätimen (Left/Right) haluttuun tasoon (low/medium/high) ja vahvistaa Enterillä.
  3) `scopes/palvelu/agy-istunto.mjs`: `poimiAgyRuudunAsetukset` poimii ruudun tilapalkista aktiivisen mallin ja effort-tason (esim. `· Gemini 3.8 Flash · medium`), jolloin uusi effort välittyy heti `skoopinViestit`-kutsussa äpille.
  4) Testit: `viestit.test.mjs` (33/33) ja `agy-istunto.test.mjs` (22/22) vihreitä. Äppi käännetty, paketoitu ja asennettu puhelimeen (`~/scopes-ios/skoopit-asennus.sh`, exit 0).

- **26.10.2026 (SIIRTO-AGYMACOS-EFFORT-KORJAUS):** Käyttäjän ilmoittama virhe selvitetty ja korjattu:
  1) Juurisyy virheelle "tuntematon malli" ja effortin vaihtumattomuudelle:
     a) Kun käyttäjä valitsi äpistä `Gemini 3.8 Flash (Medium)`, äppi lähetti mallinimen `mac-agy/gemini-3.8-flash-medium`. Taustapalvelimen elävä prosessi PID 11133 on käynnistetty 22.10. vanhasta koodista, jossa `MALLIT` sisälsi vain Claude-mallit (jolloin AGY-malli antoi 400 "tuntematon malli") ja `vaihdaMalli` osasi käsitellä vain paikallisia Claude tmux -istuntoja.
     b) `scopes/palvelu/viestit.mjs` (`vaihdaMalli`): yhdistelmä-AGY-malleista (kuten `mac-agy/gemini-3.8-flash-medium`) poimitaan automaattisesti haluttu effort-taso (`medium`), jos `effort` ei ollut erikseen määritelty pyynnössä.
     c) Jos skoopin aktiivinen perusmalli on jo `Gemini 3.8 Flash`, redundantti `/model`-valitsin ohitetaan ja siirrytään suoraan `/effort`-liukusäätimeen.
     d) `kaikkiMallit`-haun sijaan `MALLIT` ja `AGY_MALLIT` tarkistetaan nopealla muistilistalla ilman etähakuviivettä.
  2) Yksikkötestit: `viestit.test.mjs` laajennettu testaamaan yhdistelmämallin effort-poiminta ja redundantin `/model`-ikkunan ohitus; kaikki 33/33 ja `agy-istunto.test.mjs` (22/22) vihreitä.
  3) Taustapalvelin: Uusi koodi vaatii taustapalvelimen (PID 11133) uudelleenkäynnistyksen `palvelin`illä, jotta uusi toteutus latautuu palveluprosessiin.

- **27.10.2026 (SIIRTO-AGYMACOS-MALLIVALIKKO-YKSINKERTAISTUS):** Käyttäjän pyynnöstä mallivalikko ja istunnonhallinta uudistettu:
  1) `scopes/ios/Sources/MalliValikko.swift`: Yksinkertaistettu valikkorakenne. Päävalikossa on kullekin mallille vain yksi siisti rivi (esim. `Gemini 3.8 Flash`, `Claude 3.5 Sonnet`, `Claude 3.5 Haiku`, `GPT-OSS 120B`).
  2) Mallin kohdalta avautuu alivalikko, joka erittelee ympäristöt/tarjoajat (esim. `Mac AGY`, `OnePlus Linux AGY`, `Claude Code`) ja niiden alla **vain ne effort-tasot**, joita kyseinen malli ja ympäristö todella tukevat (Geminille vain low/medium/high; Claudelle low…max; Haikulle/Fablelle ei effort-tasoja).
  3) Valikosta poistettu erillinen globaali `Section("Effort")` virheellisine tasoineen.
  4) Syöttörivin tilapainike tiivistää nimen puhtaasti muotoon `<malli> · <effort>` (esim. `Gemini 3.8 Flash · medium`).
  5) `scopes/shared/ScopesUI/Sources/ScopesUI/Toolbar/MalliValikko.swift`: Vastaava kanoninen ryhmittely toteutettu; ScopesUI- ja ScopesCore-testit (4/4 ja 22/22) vihreitä.
  6) `scopes/palvelu/toiminnot.mjs`: `sulje`-toiminto ja `puraMallitta` korjattu sulkemaan AGY-istunnot oikein (`C-c`, `C-d`, `kill-window`), jotta AGY ei tulkitse `/exit`-komentoa tekstisyötteeksi ja jää auki taustalle estämään uudelleenpurkuja.
  7) Skoopit-äppi käännetty ja asennettu suoraan iPhoneen (`~/scopes-ios/skoopit-asennus.sh`, exit 0). Taustapalvelin :8787 päivitetty ja toiminnassa.

- **27.10.2026 (SIIRTO-AGYMACOS-TODENNUS):** Todettu ja todennettu `infra expresso` -purku vanhassa Scopes-äpissä Mac AGY -mallilla (`siirto-infra-expresso-062037` ajoi tehtävät puhtaasti loppuun ja paketoi). Lisäksi puhelimesta todennettu `scopes usagelimits` -purku onnistuneesti taustapalvelimen kautta. Mallivalikon yksinkertaistus, effort-tason vaihto ja AGY-istunnon puhdas sulku vahvistettu toimiviksi sekä taustapalvelussa (:8787) että puhelimen Skoopit-äpissä. Kaikki yksikkö- ja UI-testit vihreitä.

- **27.10.2026 (SIIRTO-AGYMACOS-TODENNUS-VARMISTUS):** Todettu ja varmistettu testikattavuus macOS:llä: pura-malliton.test.mjs (46/46), scopes/palvelu (184/184), ScopesUI (6/6), ScopesCore (22/22). pura-malliton.test.mjs päivitetty käyttämään process.execPathia erillisen 'node'-komennon sijaan, jotta testit ajautuvat luotettavasti Mac-ympäristössä ilman globaalia node-polkua.

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/siirto/agymacos/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
