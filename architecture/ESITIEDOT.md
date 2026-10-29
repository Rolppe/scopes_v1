# scopes architecture — esitiedot

Kerätty 19.10.2026 skoopissa `scopes macos` (tiedonhakuvaihe, käyttäjän pyyntö). Commit-pohja d87b20d3.
Polut suhteessa `scopes/`. Luvut mitattu elävästä palvelusta (127.0.0.1:8787) ja `~/.local/state/scopes-pyynnot.loki`:sta
(noin 18 h). Faktoja, ei suosituksia; päätökset tehdään suunnitteluvaiheessa. Viittaa tunnisteella (E-xx).

## Vaatimus (käyttäjä 19.10.2026)

- V-1 Alustat: iOS, macOS, Linux, Windows, Android.
- V-2 Kaikki asennetut alustat toimivat täydessä synkassa: laitteelta toiselle siirtyessä työ jatkuu samasta kohdasta.
- V-3 Vaiheet: tiedonhaku (valmis) → suunnittelu (tämä skooppi, Fable) → toteutus.
- V-4 Myöhempi vaihe (käyttäjä 19.10.2026): äppi toimii kaikilla alustoilla myös paikallisten tekoälymallien ajajana ilman erillisiä ohjelmistoja (ei LM Studiota tms.). Arkkitehtuurin pitää jättää tälle tila jo nyt.

## A. Koodin jako alustojen kesken

- E-01 iOS ei linkitä ScopesCorea eikä ScopesUI:ta: `ios/project.yml` ilman `packages:`, ei yhtään `import Scopes*` iOS-koodissa. iOS ~7 700 riviä omaa, jaettu ~1 600.
- E-02 macOS linkittää paketit polusta `../scopes-shared/...` (`macos/project.yml:11-14`, `ScopesMac.xcodeproj/project.pbxproj:407,411`); polku on vain Macin tar-kopiossa, repossa oikea olisi `../shared`. Käännös toimii vain `macos/gate.sh`:n tar+ssh-kopion kautta.
- E-03 Kolme mallikerrosta samoilla nimillä: `ios/Sources/Malli.swift` (434 r), `macos/Sources/MacTypes.swift` (314 r), `shared/ScopesCore/.../Models/ScopeModels.swift` (375 r). RekisteriTiedosto, LinuxTila, AndroidVastaus, skooppiPuu vain iOS:ssä ja MacTypesissa.
- E-04 Kaksi API-asiakasta: iOS `Asiakas.swift` (327 r; Reitti, uusinta, diagnostiikka) vs `ScopesClient.swift` (140 r) + macOS-laajennus `MacTypes.swift:189-313`, jonka `haeGeneric` (:298) kopioi `ScopesClient.hae`:n (:130).
- E-05 Endpoint-eriytyminen: ~20 reittiä vain iOS:llä (liite, lr/listat|hae|laheta, asetukset, nebius-avain, uusi, arkistoi, chat/virta, chat/kaynnissa, chat/stop, android/liite|tuotokset, diagnostiikka POST, terveys, wg-asetus); vain macOS:llä: skoopit/X/stream, viat, chat (ei-virta), android GET, diagnostiikka GET.
- E-06 Erot jo syntyneet: mallitunniste ScopesUI `mac-agy/gemini-3.8-flash-high` vs iOS `gemini-3.8-flash-high` (`MalliValikko.swift:13` molemmissa); avainnippu iOS `com.example.skoopit`/`osoite` vs macOS `scopes`/`scopes_osoite`.
- E-07 Kahdennetut UI-komponentit: MalliValikko, Viestikupla, KayttorajaRenkaat (iOS omat `Viestit.swift`:ssä; macOS käyttää ScopesUI:ta).
- E-08 Lr: iOS `Lr.swift` (545 r) oma kopio; ScopesCore `LrCore.swift` (102 r) suppeampi (ei tiiviste/juuri/jarjestyksessa/valiin); macOS vain `lrTiivisteet()`.
- E-09 Käyttämätön jaettu koodi: ScopesStore + ScopesDatabase (~340 r), NDJSONParser (vain testit), `SystemNotifierProtocol` (ei toteuttajaa). `PlatformProtocols.swift` = 11 riviä (KeychainProvider, SystemNotifier).
- E-10 Paketit `.macOS(.v14), .iOS(.v17)`; iOS-äppi 18.0. Ainoa `#if os` jaetussa: `ScopesUI/Chat/Viestikupla.swift:78`.
- E-11 iOS:n puhdas Foundation-logiikka siirtokelpoista: Malli.swift 434 r, Lr.swift:1-141, Ilmoitukset.swift:9-125, Jaettu/Tilannekuva.swift 38 r, PuraValinta-mallit. Asiakas.swift riippuu Reitistä (Tunneli) ja Diagnostiikasta (UIKit).
- E-12 Testit: ScopesCore 21 yksikkötestiä, ScopesUI 3 (vain alustus), iOS vain UI-testit (`SkoopitUITests.swift` 1 174 r); Malli.swiftin logiikalla ei yksikkötestejä.
- E-13 SwiftUI ei toimi Linuxilla, Windowsilla eikä Androidilla. `macos/SUUNNITELMA.md:215-218` MULTI-02/03 kattaa vain ScopesCoren `swift build`:n. Palvelussa ei web-käyttöliittymää. Selvittämättä: `URLSession.bytes` / FoundationNetworking Linuxilla ja Windowsilla.

## B. Palvelun suorituskyky (scopes/palvelu, yksi Node 22 -prosessi, OnePlus, 8 ydintä, kuorma ~3,5)

- E-20 Juurisyy: `istunnot()` (`palvelu/lahteet.mjs:200-236`) lukee jokaisen elävän Claude-istunnon koko transkriptin `readFileSync`illä (:210) ja jäsentää sen 5 kertaa (:217-221), ilman välimuistia. Nyt 6 istuntoa, 38 Mt (yksi 33 Mt).
- E-21 Mitatut vasteet: `/api/skoopit` 1,2 s (p50 874 ms, max 5,9 s), `/api/skoopit/X` 1,0 s (+ `skoopinKonteksti` lukee transkriptit uudelleen, `lahteet.mjs:571`), `/viestit` 1,2–2,4 s (p50 858 ms; lukee kolmannen kerran, `viestit.mjs:716`), `/api/palvelin` 2–3 s (kaksi pingiä, ei välimuistia), `/api/chat/keskustelut` 0,3 s (lukee kaikki 142 transkriptiä, 22 Mt, `viestit.mjs:573-600`).
- E-22 Event loop jumittuu: 490 `silmukka`-merkintää (>500 ms) lokissa, mediaani ~680 ms, max 2,6 s (`diagnostiikka.mjs:66`). Synkronisia: readFileSync, `execFileSync` ps/tmux (`lahteet.mjs:185`, `agy-istunto.mjs:637,643,689,700`), `DatabaseSync`, statSync 500 .db-tiedoston yli (`agy-istunto.mjs:209-213`), `appendFileSync` jokaisella pyynnöllä.
- E-23 Yleisimmät kutsut lokissa: `/viestit` 739, `/api/skoopit` 702, `/api/agentit` 348, `/api/terveys` 281, `/api/chat/keskustelut` 178, `/api/kayttoraja` 174.
- E-24 Viestin lähetys POST `/viesti` p50 3,4 s: toimitusvarmistus lukee koko transkriptin 500 ms välein ≤10 s (`viestit.mjs:249-257`). `POST /api/skoopit/X/stream` ei suoratoista (`palvelin.mjs:252-261`): odottaa ja kirjoittaa yhden `valmis`-rivin.
- E-25 Agy-kuorma: `capture-pane` jokaiselle agy-ruudulle (10) jokaisella `/api/skoopit`-kutsulla; agy-luvat 3 s välein (`agy-luvat.mjs:27,53`); toimintojono 5 s välein sync-`istunnot()` kun jonossa työtä (`toiminnot.mjs:106`).
- E-26 `/api/android/ruutu`: adb screencap + python-muunnos joka kutsu, ei välimuistia; iOS kysyy 1 s, macOS 1,2 s välein.
- E-27 Kunnossa: `/api/kayttoraja` 2 ms (15 min välimuisti), `/api/purkajat` (välimuisti), `/api/viat`, `/api/chat/virta` (aito putki), LR-tiivisteet välimuistissa.

## C. Asiakkaiden suorituskyky

- E-30 iOS pollaa `/api/skoopit` kahdesta paikasta: Ilmoittaja 10 s koko äpin eliniän (`ios/Sources/Ilmoitukset.swift:164-168`) + sivupalkki 5 s (`Sivupalkki.swift:198-207`). `/viestit` 5 s (`Viestit.swift:1017-1024`), lähetyksen jälkeen +0,5/1/1,5 s, purun aikana 24 lisähakua. `/api/agentit` 30 s. Ei scenePhase-tarkistusta.
- E-31 macOS pollaa `/viestit` 2 s (kiireinen) / 10 s ja jokaisen perään `/api/kayttoraja` (`MacRootView.swift:432,454-465`).
- E-32 Ei inkrementaalista hakua: ei since/etag/cursor-parametria asiakkaissa eikä palvelussa; koko lista korvataan (`Viestit.swift:1048`, `MacRootView.swift:415,427`). Palvelu rajaa viestit 120:een.
- E-33 iOS-chat: ei-laiska `VStack` 120 viestille, `id: \.offset` (`Viestit.swift:290-291`); vieritys loppuun jokaisella streamin merkillä (:337-339). Markdown jäsennetään bodyssa (`Viestit.swift:37`, `ScopesUI/Chat/Viestikupla.swift:50`).
- E-34 Epävakaat tunnisteet: `Viesti.id` = rooli-aika-teksti.prefix(20) (`ScopeModels.swift:43`) muuttuu streamatessa ja törmää; `PyyntoTapahtuma.id` luo `UUID()`:n joka lukukerralla (`ScopeModels.swift:353`).
- E-35 macOS lukee Keychainin synkronisesti jokaisella `client`-käytöllä (`MacRootView.swift:36-40`, `MacMenuBar.swift:11-14`); `MacAGYRunner` `waitUntilExit()` kutsujan säikeessä (`Platform/MacAGYRunner.swift:57-80`).
- E-36 Body-laskentaa: `skooppiPuu` O(n²) (`Malli.swift:396-411`, `Infra.swift:42`), sivupalkin suodatus kahdesti per body (`Sivupalkki.swift:87-101,110,127`; `MacSidebar.swift:112,140,247`).

## D. Laitekohtainen tila (estää V-2:n)

| Tunniste | Tila | Missä | Palvelimella vastine |
|---|---|---|---|
| E-40 | Viestiluonnos `luonnos.<skooppi>` / `chat.<agentti>`, tallennus joka näppäilyllä | `ios/Sources/Viestit.swift:396-397,586,1006` | ei |
| E-41 | Lähettämättömät liitteet, odottavat viestit (`odottavat`, 90 s), `viimeisinLahetys` | muisti, `Viestit.swift:876-888,1068-1088` | ei |
| E-42 | Valittu skooppi / chat / keskustelu, vierityskohta | muisti, `Juuri.swift:47-65`, `Viestit.swift:504-506`, `MacRootView.swift:8`; ei SceneStoragea | ei |
| E-43 | Purku-ajaja ja malli `pura.purkaja`, `pura.malli` ("per laite") | `PuraValinta.swift:46-47`, `Nakymat.swift:309-310` | vain oletus (`/api/purkajat`) |
| E-44 | Agy-ympäristö ja -malli per toiminto `agy_{purku,siirto,pakkaus}_{ymparisto,malli}` | iOS `Nakymat.swift:568-573`; macOS `MacSettingsView.swift:40-47`, `MacRootView.swift:27-32` | ei |
| E-45 | Arkistoitujen piilotus, sivupalkin suodatin | `Sivupalkki.swift:81-82,336-339,370` | arkistointi on (`/arkistoi`), piilotus ei |
| E-46 | Ilmoitusten lähtötaso, raja (100k), lajit päälle/pois | `Ilmoitukset.swift:22-52,91-96` | ei; kaksi laitetta ilmoittaa saman muutoksen |
| E-47 | "Luettu viestiin N asti" | ei missään | ei |
| E-48 | Käyttörajavälimuisti `KayttorajaMuisti`, istuntotyyppi | `Malli.swift:310-329`, `Viestit.swift:1052` | on (välimuisti vain) |
| E-49 | Luontevasti laitekohtaisia: ulkoasu, järjestykset, palvelimen osoite, Reitti, LR-laite-id | `Ulkoasu.swift:138-148`, `Asetukset.swift:9`, `Reitti.swift:14`, `Lr.swift:179-188` | — |

- E-50 Palvelimella jo: yleiset kytkimet `/api/asetukset`, istuntokohtaiset `/api/skoopit/X/asetukset` (`istunto-asetukset.mjs`), chat-historia, skoopin malli (luetaan transkriptista, `viestit.mjs:57`).
- E-51 Käynnissä olevaan chat-vastaukseen liittyminen: `/api/chat/kaynnissa`, mutta yksi globaali `ajo` (`palvelin.mjs:156`); 429 jos toinen chat (`viestit.mjs:651`); valmis ajo liityttävissä 10 min (`LOPPUTULOS_MS`).
- E-52 Palvelin ei tallenna mitään laitekohtaista: ei client-id:tä, laitenimeä eikä last-seeniä. Ainoat: LR-laitenimi versiovektoreissa ja diagnostiikan `laite`-kenttä.

## E. Muutosten välitys

- E-60 Ei push-kanavaa: ei SSE:tä, WebSocketia eikä `upgrade`-käsittelijää palvelussa. Ainoa SSE-malli `palvelu/nebius-valitys.mjs:200` (toisen keskustelun keskeneräinen tiedosto).
- E-61 Ei tiedostojen seurantaa: ei `fs.watch`/`watchFile`/inotify palvelussa eikä localregisterissä. Lähteet luetaan pyynnöstä: `~/.claude/projects/*.jsonl`, `~/.claude/sessions/*.json`, REKISTERI.md:t, agy tmux + SQLite, asetustiedostot `~/.claude/skills/keskustelun-siirto/state`.
- E-62 Ei versiotietoa: ei ETag/Last-Modified/If-None-Match/since. Käytettävissä: `/api/skoopit` skooppikohtainen `aika` (`lahteet.mjs:256-260,303`), viestien `aika`, LR-tiivisteet, `/api/lr/listat` yksikön `versio`.
- E-63 Puhelinilmoitukset: APNs ei käytössä (ilmainen Apple ID), HA-push poistettu 15.10 (`notifications/HISTORIA.md:54`, `notifications/REKISTERI.md:9,16,35`). iOS laskee ilmoitukset itse pollaamalla + BGAppRefreshTask 15 min (`Ilmoitukset.swift:196-233`).
- E-64 Node 22.23.3: sisäänrakennettu WebSocket vain asiakas; palvelulla ei package.jsonia eikä npm-riippuvuuksia (vain `node:`-moduulit).

## F. LR (localregister) synkkamoottorina

- E-70 Malli: yksikkö = rekisterin rivi tai lohko, JSON `~/.local/share/localregister/rekisterit/<polku>/<id>.json` (`localregister/lr.mjs:115,145-153`, `MUOTO.md:29-46`). id `<laite>-<laskuri>`; järjestys murtolukuavain (`lr.mjs:26-46`).
- E-71 Versiovektori {laite: laskuri}; `vertaa` = sama/uudempi/vanhempi/rinnakkainen (`lr.mjs:135-143`). Rinnakkaiset säilytetään `rinnakkaiset`-sisarina käyttäjän ratkaistaviksi (`lr.mjs:411-469`). Poistot tombstoneina, `siivoa` → `_siivotut.json` (`lr.mjs:343-355`).
- E-72 Kattavuus lukittu: `REKISTERITIEDOSTO = /(^|\/)(REKISTERI|HISTORIA|ARKISTO)\.md$/` (`lr.mjs:22`), `kelpoPolku` (:118), id-regex `^[a-z0-9]+-\d+$` (:429), `_meta` vaaditaan (:428), `sisalto` String. Tuonti/vienti gitin markdownista (`pilko`/`tulosta`). Mielivaltainen äpin tila vaatisi uuden polku-/yksikkölajin.
- E-73 Laajuus: 78 tiedostoa, 7 817 JSON-tiedostoa, 35 Mt; mediaaniyksikkö 161 merkkiä, suurin 33k. `scopes/`-polulla LR on totuus ja git sen vienti; muut 37 vain tuonti (`MUOTO.md:158-178`).
- E-74 Protokolla (`localregister/palvelu.mjs:12-17`): GET tiiviste → POST listat → POST hae (erä 400) / POST laheta (erä 300) → tarkistus; ≤2 lisäkierrosta (`ios/Sources/Lr.swift:270-306`). SHA-256, Swiftin pitää vastata UTF-16-järjestystä (`Lr.swift:5-7`). Runkoraja 16 Mt.
- E-75 Ajastus: palvelin 10 min (`git rev-parse` + `lr.mjs tuo`/`vie` lapsiprosessina, `palvelu.mjs:121`); iOS: yhteys/etuala, 5 s debounce muokkauksesta, 10 min.
- E-76 Asiakas vain Swiftillä (iOS). JS-moottori `lr.mjs` = puhtaita funktioita (palvelinpuoli), ei JS-asiakassilmukkaa. Testit: `lr.test.mjs` 16, `palvelu.test.mjs` 4, `LrCoreTests` 2, `LrUITests` 5.
- E-77 Avoimet LR:ssä (`localregister/REKISTERI.md`): äppi ei voi luoda rekistereitä; LR 1 Linux-asennus ja LR 2 Mac-asennus odottavat käyttäjää; LR 3 kaikki skoopit LR:n totuudeksi vaatii 1–2.

## G. Yhteys ja tunnistus

- E-80 Palvelu sitoutuu 0.0.0.0:8787 (`kaynnista.sh:24`), pelkkä HTTP. Yksi yhteinen Bearer-avain `~/.config/scopes/avain` kaikille laitteille (`palvelin.mjs:124-128,358-361`); ei laitekohtaista avainta.
- E-81 `/api/wg-asetus` (`palvelin.mjs:318-319`) palauttaa `~/.config/scopes/wg.conf`:n yksityisine avaimineen HTTP:n yli. Yksi Interface (192.0.2.30/32), yksi Peer (`wg.brainpower-now.com:51820`, AllowedIPs 192.0.2.11/32).
- E-82 iOS: wireguard-go + netstack äpin omassa prosessissa (`ios/tunneli/tunneli.go:1-4`), toimii vain äpin ollessa auki; Reitti kokeilee ensin kotiverkkoa (`Reitti.swift:2-5,41-48`). macOS ei käytä tunnelia.

## G2. Paikalliset mallit nyt (V-4:n lähtötaso)

- E-85 Paikalliset mallit ajetaan nyt erillisellä ohjelmistolla: LM Studio palvelimella, lista ssh:n yli 20 s välimuistilla (`palvelu/viestit.mjs:424-432`); palvelin on usein pois päältä, jolloin lista on tyhjä.
- E-86 Paikallisen mallin keskusteluhistoria talletetaan palveluun itse (`chatDir/paikalliset/<uuid>.json`, `viestit.mjs:436-439`), koska LM Studio ei pidä historiaa. Mallit kootaan yhteen listaan `kaikkiMallit` (Claude, agy, Gemini/Android, paikalliset, Nebius; `viestit.mjs:435`).
- E-87 Kaikki mallikutsut kulkevat nyt palvelun kautta (palvelin); äpit eivät aja mitään mallia itse. Ainoa äpin paikallinen ajo: macOS `MacAGYRunner` (`Process()`, `macos/Sources/Platform/MacAGYRunner.swift:57`).
- E-88 Mallien valinta, rajat ja mittaaminen kuuluvat yläskoopille `models` (`models/REKISTERI.md`, raja: Claude, Gemini, paikalliset mallit).

## H. Löydetyt viat (eivät tämän skoopin)

- E-90 MAC-17 (`scopes macos`, commit d87b20d3) liittää viestiin Macin paikallisen polun (`macos/Sources/Platform/LiitteetMac.swift:21-31`); skoopin istunto ajaa palvelimella eikä näe tiedostoa. Toimiva reitti: `POST /api/skoopit/<nimi>/liite` (`palvelu/liitteet.mjs:1-8`), jota iOS käyttää (`ios/Sources/Asiakas.swift:227`). Portti MAC-17 tarkistaa vain käännöksen. `LiitteetMac.tiedostotLeikepoydalta()` kuollutta koodia.

## Avoimet kysymykset suunnittelulle

- K-1 Mikä tila on palvelimen (synkattava) ja mikä laitekohtainen? Pohja: taulukko D.
- K-2 Push-kanava: SSE, WebSocket vai pitkä pollaus + versiotieto? Mistä muutostapahtumat syntyvät (tiedostoseuranta vs. kirjoituspolut)?
- K-3 Laajennetaanko LR kattamaan äpin tila (uusi yksikkölaji/polku) vai erillinen tilavarasto?
- K-4 Asiakasytimen tekniikka viidelle alustalle: Swift-ydin + natiivi UI per alusta, yhteinen ydin muulla kielellä, vai web/PWA-asiakas osalle alustoista?
- K-5 Laitetunnistus ja avaimet: laitekohtainen avain, laiterekisteri, ilmoitusten kuittaus yhdelle laitteelle (E-46).
- K-6 Palvelun suorituskyvyn korjausjärjestys suhteessa synkkaan (E-20…E-26): välimuisti/inkrementaalinen transkriptin luku on edellytys sekä nopeudelle että push-kanavalle.
- K-8 V-4: missä kerroksessa paikallinen mallinajo elää (asiakasydin vs. alustakohtainen moottori), miten sama keskustelu jatkuu laitteelta toiselle kun malli ajaa yhdellä laitteella, ja miten palvelu, äppi ja `models`-skooppi jakavat vastuun.
- K-7 Yhteys Linux-, Windows- ja Android-laitteilta (E-81, E-82): tunneli per laite vai muu reitti.
