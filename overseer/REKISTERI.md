# scopes/overseer/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: SCOPES2-VALVONTA-OVERSEER — Opus medium: pidä vahtimestari (Haiku) käynnissä ja ratkaise JUMI-viestit scopes2-uudelleenkäynnistyksessä (valvojat Opus medium 37ae9fe5); seuraa T-72 B:n uusintapäätöstä (macos-diagnostiikka 5e642c15, ehdotus koordinaattorilla); tarkista, että toteutussuunnitelman ruutu suljettiin (käyttäjän `!`-komento). — polut: scopes/overseer/** — aloitus: /pura scopes overseer — automaattinen: kyllä

## Tarkoitus ja raja

scopes2-kehityksen ylivalvoja (Opus 5.5): huolehtii Haiku-valvojasta (scopes vahtimestari), ratkaisee sen JUMI-viestit käyttäjän valtuudella, hoitaa käyttörajan portaat ja automaattisiirrot; vie suunnitelmamuutokset arkkitehtuuri- ja toteutussuunnitelmaskooppien kautta

## Päätökset

- **28.10.2026 (overseer, T-72 B punainen yhteyskatkoon):** ei sokeaa uusintaa; diagnostiikka ensin (macos 5e642c15), sitten enintään yksi uusinta koordinaattorin päätöksellä (KEHITYSMALLI 3.4, pienin peruttava askel). Overseer antoi 10.02 luvan lähettää ehdotus koordinaattorille.
- **28.10.2026 (overseer):** T-101:n tuotantoasennus (julkaise.sh --asenna, ~51 s katko 8797) pysyy pysäytettynä käyttäjän 21.10. "ei nyt" -päätöksellä; ei tuoda käyttäjälle uudelleen. Ydin ja iOS joutilaina, koska jono on tyhjä (koordinaattori).

- **28.10.2026 (overseer):** agy-integraatio-macos vaihe A ei nyt (käyttäjä 28.10. sanatarkasti: "ei agy:tä eikä Flashia scopes2-työhön", kulutus). Adapterin T-90/ARK-11a ja tuotantopuun pull eivät nyt (ARK-11a odottaa, käyttäjä 21.10.). Ydintä ei käynnistetä uudelleen; koordinaattori avaa tarvittaessa. T-72-jumin ratkaisu b3f9ed1f; toteutussuunnitelmalle vastattu: ei KUIVA/agy T-72 -ajoja, agy-vahti.md ruutunimeä ei päivitetä nyt.

- **28.10.2026 klo 8.3x (overseer, T-72-jumi):** T-71 toistetaan ensin diagnoosina, ei suoraan T-72 B:tä: testKehitysOsio punainen 4/4 osan A jälkeen (~/agy-raportit/T-72/RAPORTTI.md, kokeilu 3: solmu ei käynnisty 60 s:ssa, Awake-hypoteesi kumottu; tarkkailu epäonnistui `pgrep -f`-osuman takia). Ajo: scopes2 macos (Sonnet high) koordinaattorin Mac-UI-vuorolla, ei ios-simulaattoriajon rinnalla; tuore worktree HEADista (ei vanhaa t72 8bb9fb03), XCFramework ja koe-solmu rakennetaan uudelleen; `xcodebuild -only-testing:ScopesV2MacUITests/RunkoUITests/testKehitysOsio` näyttö auki; tarkkailu `pgrep -x ScopesV2Mac` + lsof/sample äpin pid:stä. Vihreä → T-71-portti ja sitten T-72 B korjatulla ohjeella (SUUNNITELMA 11.7; vaihe (2) vaatii käyttäjän avaamaan lukituksen = ihmisvaihe, overseer tuo käyttäjälle). Punainen → löydökset toteutussuunnitelmalle (H1–H3), ei kolmatta sokeaa ajoa (enintään 3 ajoa, KEHITYSMALLI 3.4). K-11 idle-sammutus ei nyt. Peruste: pienin peruttava askel, vanhat artefaktit ainoa todettu ero osaan A.

- **28.10.2026 (käyttäjän päätös patriotin kautta, patriot 307ef0d7: scopes/patriot/REKISTERI.md Päätökset kaksi ylintä riviä, scopes/KEHITYSMALLI.md):** scopes2-kehitys käynnistetään uudelleen Opus medium -valvojilla (high korvattu käyttäjän päätöksellä 28.10. klo 8.2x patriotin kautta, 37ae9fe5) paluukohdasta 21.10. klo 17.35; korvaa SEURAAVA-rivin MALLIT-AVATTAVILLE ("ei Opusta"), jota ei ajeta. Overseer Opus medium, koordinaattori Sonnet high (avausrivi --effort medium 37ae9fe5), vahtimestari Haiku, siirto 100 k, enintään 3 Opus-työskooppia.

- **Käyttäjä 21.10.2026 ~18.2x (overseerin keskustelussa, sanatarkasti):** "android etäohjausta voidaan jättää myöhemmäksi ios ja mac äpeissä" — ARK-19:n Android-osa iOS- ja macOS-äpeissä (T-87:n AndroidNakyma ja Ohjaus.swiftin android-kutsut, T-88:n android-hyväksyntä) siirtyy myöhemmäksi; palvelin-osaa päätös ei koske. Viety toteutussuunnitelmalle (172122) ja koordinaattorille (180115) tehtävätasolle.

- **Käyttäjä 21.10.2026 ~17.4x (vastaus overseerin AskUserQuestioniin T-59:n ja T-88:n tuotantoluvuista, sanatarkasti):** "Minun päätös on ollut että sinä päätät kaikki nämä missä et jää jumiin mitkä noudattaa arkkitehtuuria ja toimintasuunnitelmaa. Tämä sääntö unohtuu jatkuvasti. Pistä se näkyviin niin ettö et varmasti unohda enään sitä" — ja T-88:sta: "Sinä päätät". Samana päivänä aiemmin: "Jos olet jumissa perusteita ei ole miksi et voi itse tehdä niin joko lähetät ongelman ratkaistavaksi arkkitehtuuri tai toimintasuunnitelma skooppiin".

- **Käyttäjä 21.10.2026 ~15.20 (overseerin AskUserQuestion, oma vastaus):** "Poista vanha scopes äppi". IOS-H17 kaatui ilmaisen kehittäjäprofiilin 3 äpin rajaan (MIInstallerErrorDomain 13; puhelimessa Controller, Scopes ja eXpresso). Skoopit poistetaan iPhonesta ja V2 asennetaan sen tilalle; Controller ja eXpresso jäävät. Poikkeaa I-1:stä (vanha rinnalle), ja poikkeama on viety toteutussuunnitelmalle (04). Ennen tätä "Sopii nyt" IOS-H17:lle ~15.18.

- **Käyttäjä 21.10.2026 ~15.16 (overseerin AskUserQuestion, käyttäjän oma vastaus; vahtimestari ja patriot eivät vastanneet):** "Asenna nyt" — ydin 7da86808 tuotantoon: ensin ydin.db:n varmuuskopio ja `--asenna` (ydin 8c), sitten V2:n uudelleenkäynnistys adapterin kautta, SCOPES2_TOIMINNOT=8798 (adapteri e3), ja heti perään T-70:n tuotantoajo. Tämä on tuotannon adapterin käynnistyslupa (Avoimet: "käynnistys käyttäjän luvalla"). Pysyvä cron.d-rivi tehdään T-70:n jälkeen, ja sen tekee käyttäjä (root). Overseer valitsi vaihtoehdon 1 koordinaattorin ruudussa.

- **Käyttäjä 21.10.2026 ~15.0x (IOS-H17:n jälkeen, sanatarkasti):** "Skoopin joka haluaa tehdä asennuksen ilmoittaa sunulle vasta kun on valmis asentamaan. Sinä kysyt silloin minulta että sopiiko nyt" — laiteasennukset (iPhone, Mac): asentava skooppi ilmoittaa overseerille vasta, kun on valmis asentamaan; overseer kysyy silloin käyttäjältä AskUserQuestionilla "sopiiko nyt". Ei etukäteisiä aikataulukysymyksiä käyttäjälle.

- **Käyttäjä 21.10.2026 klo 10.4x–10.5x (patriotin kautta, lähde scopes/patriot/REKISTERI.md 1269d843):** ensin "Tiputetaan macos kehitys odottamaan ja priorisoidaan ios ja oneplus server" (viikkoraja 76 %), sitten korvaavasti "Tiputetaan sittenkin oneplus server odottamaan ja jatetaan ios ja macos" + "ARK-16 jatkuu" — odottaa vain ARK-11a (T-90, headless-käyttöönotto, tuotannon adapterin käynnistys); T-89 vihreä ee28b578. Joutilaat istunnot suljettu viikkorajan säästämiseksi (web 06, kord-vahti 7b, architecture 7a; fe:n suostumus).

- **Käyttäjä 21.10.2026 (~10.0x, patriotin kautta):** "Haluan että oneplus server ei kehitetä käyttöliittymää viellä. Ensiksi kehitetään se toimimaan vaan serverinä. Priorisoidaan nyt valmiiksi ensiksi macos, ios ja oneplus linux server versio. Sitten kun nämä on täydessä toiminnassa mietitään muiden aloitusta" — web-asiakas (T-44-vienti, H-12, H-11), ARK-11b, ARK-11c ja ARK-13 pysäytetty; T-78 ja headless-käynnistys jäävät; välitetty koordinaattorille (91) ja toteutussuunnitelmalle suunnitelmaan. Tarkennus: "Jos macos, ios ja oneplus server voidaan kehittää rinnakkain niin kehitetään" — oneplus headless voi kulkea Mac-jonon rinnalla, ja toteutustavan päättää koordinaattori. Toinen tarkennus: "Näiden kolmen välillä ei valmistumisjärjestyksellä ole väliä. Tärkeintä on että kehitys tapahtuu mahdollisimman tehokkaasti ja tulos hyvää" — järjestys macOS → iOS → oneplus ei enää sido.

- **Käyttäjä 21.10.2026 (~00.58, V-OVS-4):** scopes2-istuntojen lupapyynnöt, myös automaattitilan luokittimen estämät (esim. tuotannon vain luku -kopio), ratkaisee overseer suositellulla vaihtoehdolla; käyttäjältä ei kysytä.

- **Käyttäjä 20.10.2026:** scopes2-hallintatyö (valvonta, jumien ratkaisu, istuntojen ohjaus Macilla) siirtyi scopes macosista tähän skooppiin; scopes macos jää vanhan macOS-äpin skoopiksi. Siirrossa mukana päätökset, avoimet asiat, viat, historia, arkisto, aikatauluennuste ja viestihistorian hakemisto (LAHTEET.md).

- **19.10.2026:** Käyttäjä 19.10.2026: työ etenee vaiheittain: tiedonhaku → suunnittelu → toteutus.

- **19.10.2026:** Käyttäjä 19.10.2026: alustat iOS, macOS, Linux, Windows ja Android; täysi synkka laitteiden välillä. Myöhemmin paikallinen mallinajo äpissä ilman erillisiä ohjelmistoja (V-4).

- **19.10.2026:** Käyttäjä 19.10.2026: suunnittelu omaan skooppiinsa Fablella. Käyttäjä ehdotti nimeä `scopes design architecture` ja jätti nimen ja polun minulle. Valitsin `scopes architecture`, koska `scopes design` rajaa datan, rajapinnan ja yhteyden pois.

- **19.10.2026:** Käyttäjä 19.10.2026: tiedonhaussa vain arkkitehtuurin ratkaisevat aiheet (tila, välitys, LR), alustapohja myöhemmin.

- **19.10.2026:** Käyttäjä 19.10.2026: toteutusta ei aloiteta ennen toteutussuunnitelmaa; suunnitelma tehdään skoopissa `scopes toteutussuunnitelma` (Fable), ei rd-taidolla. MULTI-01 odottaa myös sitä.

- **19.10.2026:** Käyttäjä 19.10.2026: toteutuksessa valvoja Opus, päätoteuttajat Opus ja Sonnet, aliagentit Sonnet ja Haiku (kirjattu `scopes/toteutussuunnitelma/REKISTERI.md`).

- **19.10.2026:** Käyttäjä 19.10.2026: suunnittelukeskustelu on kaksisuuntaista; agentti ei jatka omatoimisesti seuraavaan vaiheeseen.

- **19.10.2026:** Käyttäjä 19.10.2026: äpin nimi scopes-V2; vanha äppi toimii rinnalla, kunnes uusi on toimiva; kierrätetään arkkitehtuurin ja toteutussuunnitelman kautta (tehty, K-9).

- **19.10.2026:** Käyttäjä 19.10.2026: toteutussuunnitelman pakkauksessa SEURAAVA "Ei nyt" (H-4/H-3, H-10, H-1 odottavat käyttäjää).

- **19.10.2026:** Käyttäjä 19.10.2026: uusi skooppi `scopes siirto scopes2` ottaa uuden purku- ja pakkausskriptin käyttöön scopes2-skoopeissa ja testaa ne.

- **19.10.2026:** Käyttäjä 19.10.2026: purku- ja pakkausskriptien korjaukset kuuluvat omistajaskoopeille (claude siirto, scopes agy siirto pakkausscripti); scopes macos ei korjaa niitä itse, vaan kirjaa /vika-reitillä.

- **19.10.2026:** Käyttäjä 19.10.2026: viat korjataan omistajien omissa istunnoissa (ei tässä keskustelussa).

- **19.10.2026:** Käyttäjä 19.10.2026: scopes2 ja scopes pysyvät juurirepossa (siirtokielto-kenttä).

- **19.10.2026:** Käyttäjä 19.10.2026: H-1 agentti asentaa rustupin; scopes-aita = lähtötilan vertailu sekä ytimessä että adapterissa.

- **19.10.2026:** Käyttäjä 19.10.2026: Rust-domainit reitittimen sallilistalle pysyvästi.

- **19.10.2026:** Käyttäjä 19.10.2026: scopes2-ajon koordinointi kuuluu skoopille scopes kordinaattori, ei scopes macosille.

- **19.10.2026:** Käyttäjä: scopes2-korjaukset tehdään arkkitehtuuri- ja toteutussuunnitelman kautta. Koordinaattori koordinoi, ja vahti varmistaa, että se toimii. Ei Flash 3.8 -istuntoja.

- **19.10.2026:** Automaattisiirtoa ei ajettu Macilta V-572:n takia, vaan tämä pakkaus tehtiin palvelimella.

- **20.10.2026:** Käyttäjä 20.10.2026: scopes2-ajon aikatauluennuste pidetään tiedostossa `scopes/patriot/AIKATAULUENNUSTE.md`. Se palautettiin istunnon 28f5f18b transkriptista, koska istunto suljettiin 19.10. pakkaamatta (äppiarkistointi ja sen jälkeen ARKISTO-AUTOSULKU). "Päivitä aikatauluennuste" päivittää tämän tiedoston.

- **20.10.2026:** Käyttäjä 20.10.2026: scopes2-työ kulkee koordinaattorin normaalin ajon kautta; suositukset 1–6 hyväksytty (koordinaattori 851b0343, V-586).

- **20.10.2026:** Käyttäjä 20.10.2026: aikatauluennuste tiedostossa scopes/patriot/AIKATAULUENNUSTE.md (fcd8c7c1). Käyttäjä 21.10.2026: ennuste kuuluu skoopille scopes patriot; overseer ei päivitä sitä (overseerin 8dcdf214 jäi patriotille).

- **20.10.2026:** Käyttäjä 20.10.2026: SEURAAVA-riville ei lisätä scopes kordinaattoria.

- **20.10.2026:** Käyttäjä 20.10.2026: korjaukset rikkomatta muiden työtä → claude siirron stagettuja tiedostoja ei muokattu (V-591).

- **20.10.2026:** käyttäjä: likaisen puun staged-joukko committoidaan skoopeittain testien jälkeen; palvelun vanhentuneet testit korjataan; iOS käännetään Macilla ennen committia; claude/REKISTERI.md:n rivipoisto hylätään; seurannan ulkopuoliset agy-tiedostot committoidaan agy-skoopeille.

- **20.10.2026:** Käyttäjä: alustajärjestys macOS → iOS → oneplus; oneplus = headless-solmu + web, ei ikkunaa (16.40).

- **20.10.2026:** Käyttäjä: rinnakkain ARK-17 tehtävätaso ja oneplus-polku (16.55); T-52 ajo 8 T-44:n jälkeen; ajo 9 irrallaan, rinnakkaistyö jatkuu (17.46).

- **20.10.2026:** Käyttäjä: Rust-käännökset Macille T-53:n jälkeen (18.15).

- **20.10.2026:** Käyttäjä 18.30: uudet skooppi-istunnot ensisijaisesti Macille; uudet deploy-avaimet Macille; pilotti scopes2 macos.

- **20.10.2026:** Käyttäjä 18.35: kaikki scopes2-istunnot pakataan; käyttäjä purkaa scopes macosin Macilla Claudella (GUI-pääte, keychain toimii), ja Macin istunto avaa muut uudelleen.

- **20.10.2026:** Hylätty: Tauri-ikkuna palvelimelle, palvelimen avainten kopiointi Macille, vanhan Mac-kopion korjaus ennen uutta kloonia.

- **20.10.2026:** Käyttäjä 20.10.: scopes macos päättää scopes2-istuntojen kysymykset itse; ongelmat arkkitehtuuri-/toteutussuunnitelmaskoopin kautta. (Siirtynyt scopes overseerille.)

- **Käyttäjä 20.10.2026 23.3x–23.4x (tässä istunnossa, sanatarkasti):** "Älä kysy minulta. Tämä on sinun tehtäväsi." (T-44-ajankohtakysymys) — "sinun tehtäväsi on huolehtia että ajot jatkuvat projektin loppuun asti" — "sinä noudatat arkkitehtuuri suunnitelmaa ja toteutussuunnitelmaa. Jos niistä on tarve poiketa niin ne päätökset teetetään niissä skoopeissa".

- **20.10.2026:** Käyttäjä 20.10.: automaattisiirto, kun konteksti >200 k ja tehtävä on päättynyt, ei kesken ajon; myös oma siirto.


- **20.10.2026:** Päätin: architecture raakarivit S-9:ään (vaihtoehto 2); V-609 jaolla ARK-11 kahtia (oneplus headless+web, Linux-äppi omaksi paketiksi).

- **20.10.2026:** Hylätty: vanhan Mac-kopion korjaus, rebase vanhassa kopiossa.

- **Käyttäjä 20.10.2026 (scopes macosin kautta, vahvistettu tässä istunnossa 23.3x):** "Kordinaattori vahdin ei kuulu kysyä minulta mitään vaan overseer hoitaa sen asiat." Kord-vahti ohjattu kirjaamaan sääntö omaan rekisteriinsä ja VALVOJA.md:hen (kysymykset overseerille SendMessagella).

- **Käyttäjä 20.10.2026 (scopes macosin kautta):** korjaa, miksi ajot jäivät käynnistämättä käyttörajan nollauduttua: SEURAAVAan aloitus- ja seurantatarkistus, vahtimestarin ehto "ei käynnissä tai tyhjillään ilman syytä", V-OVS-1 (RAJA-NOLLAUTUI → JUMI).

- **Käyttäjä 20.10.2026:** R-3:n mittaus tuotannon ydin.db:n kopiolla koeytimellä hyväksytty (luokitin esti ytimen luvut; lupa overseerin kysymyksellä 23.13).

- **Käyttäjä 20.10.2026:** skooppi `scopes overseer` luotiin komennolla `/pura uusi scopes overseer`.

- **20.10.2026:** Käyttäjä 20.10.2026 23.3x–23.4x (sanatarkasti, rekisterissä 8bdcd20b): "Älä kysy minulta. Tämä on sinun tehtäväsi." — "sinun tehtäväsi on huolehtia että ajot jatkuvat projektin loppuun asti" — "sinä noudatat arkkitehtuuri suunnitelmaa ja toteutussuunnitelmaa. Jos niistä on tarve poiketa niin ne päätökset teetetään niissä skoopeissa".

- **20.10.2026:** Käyttäjä 20.10.2026 (vahvistettu tässä istunnossa): "Kordinaattori vahdin ei kuulu kysyä minulta mitään vaan overseer hoitaa sen asiat."

- **20.10.2026:** Käyttäjä 20.10.2026 (scopes macosin kautta): korjaa käynnistyspuute a–c (tehty aef65e69).

- **20.10.2026:** Overseer: T-44 ja H-12 aamuun käyttäjän läsnä ollessa (luokittimen esto = ihmisen hyväksyntä, ei anneta toisen istunnon puolesta); V-605 2–5 aamuun; testin irrotus siemennetyllä koeskoopilla (toteutussuunnitelma); S-9b-poikkeama (virta.rs:118) korjaustehtäväksi ytimelle T-56:n jälkeen ennen T-57:ää, sopimusta ei muuteta (V-614); kord-vahdin estettyä rivikorjausta ei tehdä sen puolesta.


- **21.10.2026:** Käyttäjä 21.10.2026 ~00.58 (V-OVS-4): scopes2-istuntojen lupapyynnöt, myös luokittimen estämät (tuotannon vain luku -kopio), ratkaisee overseer suosituksella; ei kysytä käyttäjältä ("Tämä kysymyksesi rikkoi prosessin, kirjaa ylös virhe. Valitse suositus.") — kirjattu REKISTERI Päätökset (b6f2ace5).

- **21.10.2026:** Käyttäjä 21.10.2026: aikatauluennuste kuuluu scopes patriotille (scopes/patriot/AIKATAULUENNUSTE.md); overseer ei päivitä sitä; 8dcdf214 jää patriotille (käyttäjä valitsi "Jätä patriotille").

- **21.10.2026:** Overseer 21.10.: ARK-16 adapteritehtävät palvelimella (T-64 Macilla P-18), P-19/S-10 hyväksytty, 11 reittiä arkkitehtuurille (käyttäjän 20.10. valtuus).

- **21.10.2026:** Käyttäjä 21.10. (patriotin kautta, sanatarkasti REKISTERI Päätökset): macOS, iOS ja oneplus headless ensin, rinnakkain, järjestys ei sido; web, ARK-11b/11c ja ARK-13 pysäytetty.

- **21.10.2026:** Käyttäjä 21.10.: PushNotificationia käyttävät vain overseer ja patriot (KEHITYSMALLI luku 2, c9349392); muut SendMessagella omistajalle, käyttäjän asiat overseerin kautta.

- **21.10.2026:** Käyttäjä 21.10. klo 10.4x: "Tiputetaan macos kehitys odottamaan ja priorisoidaan ios ja oneplus server" (viikkoraja 76 %, täyttyy ~22.10. klo 5); välitetty fe:lle ja 9f:lle.

- **21.10.2026:** Koordinaattori fe (V-KORD-3): portit omissa worktreeissä, scopes/-ikkuna pysyy auki, ellei sulkua ilmoiteta.

- **21.10.2026:** Headless-omistaja scopes2 adapteri (SUUNNITELMA:479).

- **21.10.2026:** Käyttäjä 21.10.2026 ~15.0x sanatarkasti: "Skoopin joka haluaa tehdä asennuksen ilmoittaa sunulle vasta kun on valmis asentamaan. Sinä kysyt silloin minulta että sopiiko nyt" (kirjattu dece905f; koordinaattori 800b96a2).

- **21.10.2026:** Käyttäjä 21.10.2026: V2 asennetaan samalla tavalla kuin vanha Skoopit; uusinta-LaunchAgent V2:lle sallittu ("Kyllä, sama kuin Skoopitilla"); agentin komennot käyttäjälle vasta ensiasennuksen jälkeen (RunAtLoad).

- **21.10.2026:** Käyttäjä 21.10.2026: hyväksyi 9f:n briefimuutokset T-66…T-69.

- **21.10.2026:** Overseer: raskasta tuotantodata-ajoa ei aloiteta ≥ 90 % 5 h käytöllä lähellä nollausta (T-57 siirretty nollauksen jälkeen).

- **21.10.2026:** Overseer: suunnitelman hyväksyntäehdon poikkeama (ARK-17 (4)(5)) viedään toteutussuunnitelmalle, ei ratkaista koordinaattorin ruudussa.


- **21.10.2026:** Käyttäjä 21.10. ~15.16 "Asenna nyt" (7da86808 + V2 adapterin kautta) — 0dceb548.

- **21.10.2026:** Käyttäjä 21.10. ~15.20 "Poista vanha scopes äppi" — a0899a4f. Hylätyt vaihtoehdot: eXpresson tai Controllerin poisto ja maksullinen jäsenyys.

- **21.10.2026:** Käyttäjä 21.10.: overseer kommunikoi istuntojen kanssa ja vastaa niiden ruutuihin käyttäjän puolesta; käyttäjää ei ohjata ruutuihin (muisti).

- **21.10.2026:** Overseer: H-18 siirrettiin, koska /api/uusi olisi luonut tuotantopuuhun skoopin ja commitin. Toteutussuunnitelma päätti tavan.

- **21.10.2026:** Käyttäjä 21.10.2026 ~17.4x, sanatarkasti (REKISTERI 5f1d29eb): "Minun päätös on ollut että sinä päätät kaikki nämä missä et jää jumiin mitkä noudattaa arkkitehtuuria ja toimintasuunnitelmaa. Tämä sääntö unohtuu jatkuvasti. Pistä se näkyviin niin ettö et varmasti unohda enään sitä" ja "Sinä päätät". Aiemmin: "Joka kysymyksessä mitä esität minulle pitää olla perustelu miksi et voi päättää itse" ja "Jos olet jumissa perusteita ei ole miksi et voi itse tehdä niin joko lähetät ongelman ratkaistavaksi arkkitehtuuri tai toimintasuunnitelma skooppiin".


- **21.10.2026:** Overseer: T-59 (4)(5) ja T-88 (1)–(4),(7) vain luku -tilassa sallittu; 7903:n uudelleenkäynnistys sallittu (estetty, odottaa käyttäjän `!`-komentoa); T-59 d5:lle.


- **21.10.2026:** Käyttäjä: käyttörajan portaat pois (19.0x); macOS- ja iOS-kehitys käyntiin malleilla Sonnet/Haiku/agy Flash (19.1x, 19.2x); agy-integraatio macOS-äppiin (A näkymä → B kirjoitus → C chat-synkka; 21.25); agy-viestinvaihto tiedostona (21.30); agyn ohjeistus tarkaksi ja sessioiden konteksti kuntoon (21.20).

- **21.10.2026:** Overseer: T-72 uusintaa lukituksella ei toisteta (XCUI vaatii lukitsemattoman istunnon); K-11 idle-sammutus vaihtoehtona kirjattu RAPORTTI.md:hen, päätös myöhemmin; Android-ajoja ei aloiteta (5736f24e); ytimen/adapterin tuotantoonvienti ei (oneplus server odottamaan, patriot 1269d843); T-97 kuuluu scopes2 sharedille (koordinaattori); T-24-poikkeus T-101:ssä hyväksytty.

- **21.10.2026:** Hylätty: Flash-vahdin käynnistys overseerin omalla Bash-kutsulla (luokitin esti, Create Unsafe Agents); käyttäjä ajoi komennon itse / epäselvä onnistuiko.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-72 B (macos 38d318d1, worktree ~/sessions-repo-t71d) | kesken (todenna viim. 11.11.2026); odottaa skooppia kordinaattori (macOS UI punainen 28.10. 9.31: RunkoUITests/testViestitVastaavatPalvelinta, yhteyskatko; (2) caffeinate OK LOCKED=0 9/9; (3) iOS ei ajettu; diagnostiikka 5e642c15) | Seuraa koordinaattorin päätöstä uusinnasta (enintään yksi); vihreä → ARK-18-hyväksyntä toteutussuunnitelmalle. |
| Kulutus (28.10.2026: 5 h käyttö 54 % 9.30, 58 % 10.02, 68 % 10.32, 75 % ~11.0x; koordinaattori 9 % 7.54 → 60 % 10.06, ikkuna nollautuu 11.30; /api/oauth/usage 429; nousu jatkui scopes2-joutilaanakin, joten osa kulutuksesta muualta) | avoin; odottaa skooppia scopes patriot | Jos 5 h raja täyttyy, vahtimestari/koordinaattori raportoi. |
| Toteutussuunnitelman ruutu siirto-scopes-toteutussuunnitelma-082216 auki (pakattu a6146354) | kesken (todenna viim. 11.11.2026); odottaa käyttäjää (luokitin esti tmux kill-session, "Interfere With Workloads") | Käyttäjä ajaa `! tmux kill-session -t siirto-scopes-toteutussuunnitelma-082216`; tarkista, että suljettu. |
| Palvelinsidonnaiset työkalut Macilla (V-572: palvelimen puu ainoa kirjoittaja Apple-käännöksille; `shared/gate.sh` tar-putki palvelimelta, web Playwright, ydin cargo flock, vahdin prosessivalvonta) | avoin | Jokainen skooppi sovittaa omat työkalunsa; koordinaattori päättää järjestyksen. |
| Valvonta | kesken (jatkuu) | Haiku: Monitor `bash scopes/vahtimestari/seuraa-istunnot.sh` (siirto-scopes-vahtimestari-230536, uusittu 23.18 aef65e69:llä); overseer: Monitor `scopes/overseer/tools/seuraa-valvoja.sh` + `seuraa-istunnot.sh --kerta` (30 min). |
| kayttoraja-vahti-koukku Macin settings.jsoniin | avoin; odottaa käyttäjää **21.10.2026:** kayttoraja-vahti kaytto_nyt 21.10.2026: 5 h käyttö 45 % 10.48 → 61 % 11.20 → 76 % 12.09 → 91 % 12.2x → 96 % 12.38 (EI UUSIA) → nollaus 13.30 (resets_at 10:29:59Z) → 1 % 13.51 → 21 % 14.51; viikko 83 % 13.51 (nollautuu 26.10. 0.00). | `bash Infra/hooks/kayttoraja-vahti-kytke.sh`. |
| T-44 tuotannossa (web, V2 8797 --web) + H-12 | avoin (pysäytetty käyttäjän alustapäätöksellä 21.10.2026; aamulla 21.10.2026: web-istunnon luokitin esti tuotannon luvut ("Production Reads") 20.10. 23.4x, mitään ei muutettu); odottaa käyttäjää **21.10.2026:** H-12: web ei toistanut vikaa Playwrightilla (V-WEB-2 ee641cc1); vika johtui Safarissa auki olleesta lupadialogista; web pysäytettiin. | Käyttäjä hyväksyy web-ruudussa (siirto-scopes2-web-191618: tuotannon luvut, build, V2 uudelleen --web, hyvaksynta.ts), sitten H-12 selaimesta → V-605 kohta 2 → kohdat 3–5 (palvelinistunto, jossa viestejä, tai siemennetty koeskooppi) → P-14/P-15 → IOS-H17; koordinaattori kirjannut aamun ensimmäiseksi; overseer valvoo. |
| Yön jono 20.–21.10. | kesken **20.10.2026:** Yön jono: T-22 vihreä 20.10.2026 klo 21.35 (gate-T22-3.log: "=== PORTTI OK: T-22 ===", EXIT 0); overseer väitti ensin virheellisesti keskeytyneeksi, koordinaattori korjasi; Yön jono: R-3 (A) vihreä ytimen raportin mukaan: VmHWM 124 MiB (ennen 277), B-polku 237 MiB, raja 512 MiB (a8dc4b1d); lokia palvelin:/tmp/r3/r3.log ei todennettu (luokitin esti); Yön jono: T-51 Mac-rinnakkain vihreä, ARK-08 kiinni (koordinaattori); iOS pakattu dad6ee0e; Yön jono 20.–21.10.: V-605 kohta 1 vihreä Macilla (29 ok, exit 0); kohdat 2–5 aamuun; Yön jono 20.–21.10.: 8787: ei vikaa — palvelimella ei avoimia istuntoja (infra expresso auki: False; shared e71ebeef), koska scopes2-istunnot ajetaan Macilla; Yön jono: T-55 vihreä 5/5 (T-55, T-21, T-22, T-28, T-54; HEAD c53f27d6; koordinaattori todensi lokeista). T-56 koodauksessa (Opus, ~150 min); Yön jono 20.–21.10.: käyttö 22 % klo 23.4x (kayttoraja-vahti.py kaytto_nyt(); nollautuu 21.10.2026 klo 03.30); Yön jono: luokitin (auto mode) esti: palvelimen luvut overseeriltä ja tuotannon lukujen ohjaamisen toiselle istunnolle ("Production Reads"); valtuuden laajentamisen omin sanoin rekisteriin ("Instruction Poisoning"; sanatarkka käyttäjälainaus meni läpi); T-44-valinnan ensimmäisellä kerralla ("Production Deploy"); vertaisen välittämän käyttäjäpäätöksen kirjoittamisen kord-vahdin ruutuun ennen käyttäjän vahvistusta. | T-55 vihreä (5/5: T-55, T-21, T-22, T-28, T-54; c53f27d6); ydin T-56 (Opus, ~150 min, koodaus; portti koordinaattorin vuorolla, kirjoituskielto scopes/-puuhun portin ajan) → S-9b-korjaus → T-57. V-605: kohta 1 vihreä; 2–5 aamuun (kohdat 3–5 vaativat palvelinistunnon, jossa viestejä: 8787 ok, palvelimella ei avoimia istuntoja). Testin irrotus siemennetyllä koeskoopilla → toteutussuunnitelma (overseer valitsi suosituksen). Overseer valvoo, vastaa kysymyksiin. |
| scopes/kordinaattori/vahti/REKISTERI.md:33/38 ohjaa yhä scopes macosille | jätetty (vahdin oma luokitin esti korjauksen 1f92e309:ssä; vahti ei käytössä) | Käyttäjän tiedoksi; korjaus vain käyttäjän pyynnöstä vahdin omassa istunnossa. |
| scopes2 web ja shared yöllä (shared: siirto-scopes2-shared-233343) | kesken | Web: ei jonoa yöllä, pakkaa. Shared (uusi 68) odottaa aamua. |
| T-57 (ydin 8c) | ajettu 21.10.2026 06.21–06.53 (fbe58e3c): ARK-17 EI HYVÄKSYTTY — (1)(2)(3)(7)(8) OK, (4) ja (6) eivät täyty, (5) osin; jälkitarkistus OK; T-58 pidätetty | (4), (5) ja (6) välitetty toteutussuunnitelmalle (f1) korjaustehtäviksi ja HLC-ikkunakysymys arkkitehtuurille (73) 21.10. ~06.55; seuraa korjaustehtävien tehtävätasoa ja koordinaattorin jonoa. |
| ARK-16:n 11 sillattua reittiä | avoin (kysymys scopes architecturella (73) 21.10.2026 klo 6.4x); odottaa skooppia architecture | Vastaus f1:lle tai overseerille → toteutussuunnitelma tehtävätasolle. |
| Tuotannon adapteri (oli kaatunut, peili 16 h vanha) | kesken (T-89, adapteri 80, korjaa; adapteri käynnissä pid 7903, --toiminnot 8798 --chat, cron.d päivitetty 21.10.2026; käynnistys käyttäjän luvalla overseerin kautta); odottaa ajoa **21.10.2026:** Todettu 21.10.2026 (toteutussuunnitelman löydös): adapteri kaatui, syy ENOSPC fs.watchissa (inotify 8192); kaynnista.sh ei palauta adapteria käyntiin; Uudet sessiot 21.10.2026: koordinaattori fe (103800), toteutussuunnitelma 9f (103849), adapteri 80 (101341), architecture 7a (102210), vahtimestari 50 (074642, Haiku). | Tuo lupa käyttäjälle T-89:n jälkeen (käyttäjälle /vika-teksti scopes2 adapterille); riski T-44:lle ja H-12:lle; tarkista onko kirjattu. Merkitse valmiiksi, kun H-18 on OK. |
| Aamun jono 21.10.2026 | kesken (koordinaattori 91) | T-58 → T-59 (Mac), T-44 → H-12 → V-605 kohdat 2–5 → T-62 (käyttäjä paikalla), H-17 käyttäjä. |
| Sharedin T-62 tarvitsee Macin UI-vuoron | avoin (tulossa); odottaa käyttäjää | Pyydä käyttäjältä Mac-tauko (fyysinen ihmisvaihe). |
| Viikkokäyttö 88 % (nollautuu 26.10.2026) | avoin **21.10.2026:** viikko 92 % klo 17.40 (patriot), täynnä noin klo 22.30, nollautuu 26.10.2026 klo 1.00; 5 h käyttö 46 % (16.36), 54 % (17.06), 65 % (17.37). **21.10.2026:** Claude-viikkoraja 95 % (nollautuu 26.10. klo 0.00). Agy: `agy --dangerously-skip-permissions --model gemini-3.8-flash-high`; ei lataa CLAUDE.md/muistia. | Seuraa portaita; tuo käyttäjälle ennen uusia raskaita käynnistyksiä. |
| palvelimen Claude-kirjautuminen vanhenee ~23.10.2026 | avoin; odottaa käyttäjää | Pyydä käyttäjää ajamaan /login palvelimella ennen sitä. |
| scopes2 macos Sonnetilla (käyttäjä 18.4x patriotin kautta, 8b4d3707: "jatka projektin ajoa macos kehityksen osalta mutta kaikki sonnet tai haiku malleilla"; tarkennus "myös flash mallit voi olla käytössä", ei Opusta) | avattu 18.47: tmux siirto-scopes2-macos-184714 (Sonnet, medium) ajaa T-72:n osaa A (agy/T-72.md). Käyttäjä vastasi "sopii" osalle B patriotin kautta ~18.5x **21.10.2026:** lukitsematta (LOCKED=0 17/17) T-49 silti punainen: 'lista ei latautunut 60 s:ssa (solmu ei käynnistynyt)'; osassa A testKehitysOsio 14,6 s vihreä. Koeydin käynnistyy (portti 18900), koodi/binäärit samat (HEAD 8bb9fb03). Syy auki (H1 sqlite/SCOPES2_DATA, H2 bind, H3 sandbox/TCC); kokeilu testKehitysOsio yksin annettu ~21.55. Lukitussa istunnossa XCUI ei aktivoi äppiä (LOCKED=1 22/23, 'Running Background'). | Kun macos ilmoittaa olevansa valmis osaan B: kerro käyttäjälle ennen lukitusta, anna macosille GO ja kerro patriotille, kun osa B on valmis ja näyttö auki. Seisokissa macos siirtyy agy Flashille (ei Opusta). |
| ARK-17 ja ARK-19 (toteutussuunnitelma 79095bd7, 21.10.2026 klo 18.5x) | ARK-17 hyväksytty: T-59 (4)(5) on jälkitodennus, ei ehto. ARK-19:n palvelin-osa hyväksytty. ARK-19:n Android-äppiosa (T-87-UUSINTA, T-88 (6), Android-paneeli) on lykätty käyttäjän päätökseen | Android-ajoja ei aloiteta ennen käyttäjän uutta päätöstä. t59-tuotanto.sh ajetaan, kun tuotannossa on skoopillinen istunto. |
| Aukko b (vahtimestari 50) | kesken (620810d1 kysyy-tila tehty; työssä- ja vapaa-tila sekä herata-istunnot.sh kesken) | Raportti viimeistään klo 21.30. |
| Mallit avattaville skoopeille | avoin (ydin, shared ja iOS Sonnet 5.5; architecture ja toteutussuunnitelma Opus 5.5) | Avataan näillä malleilla (patriot 0e4168e5, 62b5b8e3). |
| Infra/linux/palvelin/cron.d-scopes2 eroaa tuotannosta | avoin (/vika-teksti annettu käyttäjälle) | Infra-skoopille. |
| scopes/palvelu/agy-istunto.mjs:445 ja scopes2/adapteri/vanhasta/agy-istunto.mjs:446 osoittavat vanhaan ~/Documents/claude_project-klooniin (6f) | avoin | Omistajille myöhemmin. |
| Jaettu klooni ~/sessions-repo erkaantunut (kirjattu 28.10.2026; 11.0x: ahead 4, behind 31) | avoin; muiden istuntojen likaiset tiedostot estävät merge:n ja synkan | Pakkaukset pushaavat originin päälle worktree/commit-tree-reitillä; synkka vasta, kun muiden likaiset tiedostot on commitoitu. |
| Adapteri odottaa V1-synkan briefejä (toteutussuunnitelma, SEURAAVA V1-SYNKKA-BRIEFIT; kirjattu 28.10.2026) | avoin; odottaa skooppia kordinaattori | Koordinaattori avaa. |

## Viat

| Vika | Tila |
|---|---|
| Claude Coden muistisiivous tappaa taustashellit (`gate.sh`) palvelimella; ratkaisu `setsid nohup` (shared käytti ajossa 9). Koordinaattori kirjasi oman vikansa V-KORD-4. | avoin |
| V-620 (claude siirto): kesken.mjs ei näe toisella koneella tehtyä pakkausta. | avoin |
| V-621 (claude siirto): autovaihto.sh Macilla, tmux ilman avainnippua → istunnot kuolevat heti. | avoin |
| V-622 (claude r&d2): Stop-hookin lainaamaton &-polku; settings korjattu käsin. | avoin |
| V-631 (claude): kayttoraja-vahti 401 Macilla; testit ajamatta. | korjattu 4fa91aa3; odottaa ajoa |
| V-OVS-1 (20.10.2026, kohde scopes vahtimestari): `scopes/vahtimestari/seuraa-istunnot.sh` ei tunnista käyttörajaan pysähtynyttä istuntoa ("You've hit your session limit", ei osumaa skriptissä); ydin, web ja ios olivat tyhjillään 21.50–23.10, vaikka raja nollautui 22.30 ja jonossa oli R-3 (T-22 vihreä jo 21.35), ja Haiku raportoi "ei kysymyksiä, en tee mitään". Korjaus: `seuraa-istunnot.sh` merkitsee ruudun, jossa näkyy session limit käytön ollessa ≥ 95 % (tai ruutu nähdään ensi kertaa), ja tulostaa RAJA-NOLLAUTUI, kun käyttö on alle 95 %; valvojalle JUMI; `--kerta` = overseerin tilakuva. Omistajalle V-633 (508134e). | korjattu aef65e69 20.10.2026 (käyttäjä scopes macosin kautta); testattu yksikkönä ja oikeita ruutuja vasten (löysi web, toteutussuunnitelma, kordinaattori vahti) |
| V-OVS-2 (20.10.2026, oma): muokkasin `scopes/vahtimestari/seuraa-istunnot.sh`:ia 23.15 kesken T-51:n Mac-porttiajon → scopes-aita punainen (koordinaattori hyväksyi T-51:n aitalinjauksella vieraana polkuna). Korjaus: kirjoitukset scopes/-puuhun vain koordinaattorin ilmoittamassa ikkunassa (SEURAAVA-rivi). | korjattu (toimintaohje) |
| V-OVS-3 (20.10.2026, oma): overseer kysyi käyttäjältä koordinaattorin T-44-ajankohtakysymyksen; syy: valtuus kirjattu siirrossa scopes macosille (REKISTERI Päätökset 20.10.) ja SEURAAVA rajasi sen JUMI-viesteihin. Korjaus: käyttäjän sanatarkka määritys rekisterissä (8bdcd20b). | korjattu (toimintaohje) |
| V-OVS-5 (21.10.2026, kohde scopes vahtimestari): `scopes/vahtimestari/seuraa-istunnot.sh` ei tuottanut KYSYY-tapahtumaa ytimen pakkauskysymyksestä noin 00.07–00.17 (vahtimestarin lokissa 23:54 KYSYY ja seuraava vasta 00:21). Todennäköinen syy: `.ilm` jäi arvoon kysyy, koska istuntoa ei havaittu tilassa tyossa (rivit 86–90). Overseer vastasi ruutuun 00.17 (seuraa-valvoja.sh:n KASAANTUMA). Ilmoitettu vahtimestarille SendMessagella 00.3x. | avoin (vahtimestari) |
| V-OVS-7 (21.10.2026, oma): overseer kysyi käyttäjältä AskUserQuestionilla webin T-44-tuotantohyväksynnän ("Hyväksyn itse / Overseer saa vastata / Ei vielä"), kun auto moden luokitin esti tmux-vastauksen ("Create Unsafe Agents"). Tämä rikkoi V-OVS-4:n, sillä päätös avattiin uudelleen, vaikka se oli jo tehty. Käyttäjä 21.10.: "Onko tämä kysymys sinun sääntöjen vastainen virhe?" Toimintaohje: kun luokitin estää työkalun, overseer ei kysy päätöstä, vaan kertoo olevansa jumissa ja antaa käyttäjälle valmiin `!`-komennon tai Shift+Tab-ohjeen (näin tehtiin, ja käyttäjä ajoi komennon). | korjattu 0ac93643 (toimintaohje) |
| V-OVS-9 (21.10.2026, oma): käyttörajan nollauduttua (herata-istunnot.sh 13.51) overseer otti yhden `seuraa-istunnot.sh --kerta` -tilakuvan heti herätyksen hetkellä, ei nähnyt kysymyksiä ja raportoi "kukaan ei kysy". Herätetyt istunnot (koordinaattori, toteutussuunnitelma, shared) kysyivät vasta 13.52–13.55, ja vahtimestari kirjasi kysymykset ruutuunsa mutta ei vastannut niihin eikä lähettänyt niistä JUMI-viestiä overseerille. Kysymykset odottivat, kunnes käyttäjä huomautti asiasta ("herätyksen jälkeen et ole ottanut työtä käsittelyysi"). Toimintaohje: herätyksen tai uusinnan jälkeen overseer käy 2–5 minuutin kuluttua kaikkien `siirto-scopes*`-ruutujen hännät läpi (`tmux capture-pane`) eikä luota pelkkään tilakuvaan tai Monitoriin. | korjattu 0fe08cb8 (toimintaohje) |
| Uusi havainto (21.10.2026, kohde scopes vahtimestari / claude siirto): vahtimestarin automaattisiirto ajettiin skooppinimellä "vahtimestari" (oikea "scopes vahtimestari") → pakkaa-alku "skoopilla ei rekisteriä" ja ~250 vierasta tiedostoa; overseer keskeytti 12.2x. Kirjataan omistajalle. | avoin |
| V-OVS-10 (21.10.2026, kohde scopes2 ydin / scopes vahtimestari): ytimen taustashell bj1zy0oy4 (zsh 33964) pyöri 06.26–15.10 (8 h 42 min) ja esti automaattisiirron (487 k, työ valmis; vahtimestari: "ajaa taustashellia, ei siirtoa"). Shell odotti T-57:n B-seurantaa (bbsxq21lh), ja sen ehto ei voinut täyttyä kolmesta syystä: (1) seuranta päättyi 1200 s:n aikakattoon ilman VAKAA- tai KUOLI-riviä, koska haettu-rivejä pysyi arvossa 1 ja vaati ≥ 2; (2) `pgrep -f 't57-b-seuranta'` osui odottajan omaan komentoriviin; (3) loki oli 60 riviä (1200 s / 20 s), kun ehto vaati > 60. Ydin luki tuloksen käsin 06.46 eikä pysäyttänyt odottajaa. Overseer pysäytti sen käyttäjän luvalla 15.10, koska luokitin esti ensin sekä kill-komennon että ruutuviestin. Ydin kirjasi vian (354fe283); kirjattu 98f047e7. Korjaus omistajille: ydin ei käytä `pgrep -f`:ää odotussilmukassa ja pysäyttää odottajat, kun lukee tuloksen käsin; vahtimestari kysyy taustashellin iän, jos istunto on yli 200 k ja vapaana yli 30 min. | avoin (vahtimestarin osalta: taustashellin ikä) |
| V-OVS-11 (21.10.2026, kohde scopes2 ydin / claude siirto): jaetun kloonin ~/sessions-repo haara rebasettiin klo 15.39.17 origin/00cce758:n päälle (reflog: rebase start, pick, finish), ja heti perään tuli ytimen pakkauscommit 5bf9b5b2. Tämä rikkoo V-KORD-5:tä, joka kieltää jaetussa kloonissa amendin, stashin ja pull --rebasen. Seuraus: iOS d5:n commit ecb57cec muuttui aac59e11:ksi, d5:n push hylättiin ja d5 kysyi merge-lupaa turhaan. Overseer kertoi d5:lle, että commit on jo originissa. Tekijä on siirtotyökalu: `claude/siirto/tools/pakkaa-git.sh:233–234` ajaa vaiheessa 2 `synkka ennen` -komennon, joka rebasettaa toisen koneen committien päälle ennen omaa committia. Tämä on suunniteltua käytöstä, mutta se on ristiriidassa V-KORD-5:n kanssa. Ydin 98 tarkisti asian (354fe283), ja overseer luki rivit. Kirjattu a80c79bc. Omistaja on claude siirto; käyttäjälle annettiin /vika-teksti. | avoin |
| `seuraa-valvoja.sh` antaa väärän KYSYY-hälytyksen, kun ruudussa näkyy diff, jossa on merkkijono "Enter to confirm" tai "Esc to cancel" (17.38, vahtimestarin oma diff). | avoin (vähäinen) |
| V-OVS-14 (21.10.2026, oma): overseer avasi scopes2 macosin komennolla `autovaihto.sh vaihda "scopes2 macos" --model claude-sonnet-5-5` ilman `--ei-sulje`-lippua, ja skripti ajasti overseerin oman ruudun (%54) sulun 20 s päähän (`sulje-ikkuna.sh %54 --viive 20`). Overseer huomasi tulosteesta ja tappoi sulun (pid 22058) ajoissa. Sääntö: kun avaat toisen skoopin istunnon, käytä aina `--ei-sulje`. | korjattu |
| V-OVS-13 (21.10.2026, oma): käyttäjän päätöksen "android etäohjausta voidaan jättää myöhemmäksi" (5736f24e) jälkeen overseer jätti käynnissä olevat Android-ajot (T-88 (6) adapterissa, shared-agy-pilotin T-87-UUSINTA) jatkumaan "kunnes suunnitelma rajaa" ja käyttäjä huomautti: "android etäohjausta kehitetään edelleen vaikka ei pitänyt". Korjaus 18.2x: molemmat pysäytetty, koordinaattori antaa pilotille ei-Android-paketin. Sääntö: lykkäyspäätös pysäyttää käynnissä olevan työn heti; suunnitelma tarkentaa jälkikäteen. | korjattu |
| Uusi havainto (21.10.2026, oma): pitkä tmux paste-buffer -viesti katkeaa vastaanottajalla (vain loppu saapuu). Korjaus: tiedostoviestit + lyhyt osoitus. | kesken (korjattu käytännössä `viesti.sh`:lla; vienti agy-ohjeisiin kesken) |
| Uusi havainto (21.10.2026, kohde claude siirto / scopes vahtimestari): `seuraa-valvoja.sh` / `seuraa-istunnot.sh` ei näe agy (Gemini) -ruutujen jumeja eikä syöttökenttään jäänyttä viestiä; adapteri-agy pysähtyi T-98:ssa ilman hälytystä. `ruutuvahti.sh` korjaa osittain (KYSYY/LAHETTAMATTA). | avoin (ruutuvahti.sh korjaa osittain) |
| Toteutussuunnitelman pakkauskysymys (AUTOVALINTA false) piti istunnon ~30 min odottamassa ennen kuin overseer valitsi: jumi, jota valvoja ei havainnut yli 5 min vaiheessa. | avoin |
| Uusi havainto (28.10.2026, kohde claude siirto): purkuraportti (pura-malliton.mjs) näytti "AUTOPACK: true", mutta `asetus-tila.mjs lue autopack` antoi tässä keskustelussa false → overseer ilmoitti vahtimestarille ensin pakkaavansa itse ja joutui perumaan. Omistajalle. | avoin |
| Uusi havainto (28.10.2026, oma): auto moden luokitin estää overseeria sulkemasta joutilasta, pakattua scopes-ruutua (tmux kill-session, "Interfere With Workloads"). | avoin; odottaa käyttäjää (`!`-komento, ks. Avoimet) |

## Historia

Historia: `scopes/overseer/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
