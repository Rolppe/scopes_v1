# scopes/sideloader/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: SIDELOADER-VALINTA — käyttäjä valitsee ratkaisun selvityksen pohjalta (toisen Apple ID:n laitetesti, LiveContainer-kokeilu Macin allekirjoittamana tai maksullinen tili ja OTA WireGuardin takana) ja valittu kirjataan ensimmäiseksi toteutuspaketiksi; ei ostoja eikä asennuksia ilman lupaa — polut: scopes/sideloader/** — aloitus: /pura scopes sideloader

## Tarkoitus ja raja

Omien iOS-äppien asennus ja päivitys iPhoneen omalta Maciltä.

- **Tarkoitus:** asentaa ja päivittää omia iOS-äppejä ilman nykyratkaisun kolmen äpin rajaa.
- **Vaatimukset (käyttäjä 28.10.2026):** (1) yli 3 äppiä, sillä nykyratkaisun raja ei riitä; (2) päivitykset onnistuvat VPN:n kautta, eli puhelimen ei tarvitse olla samassa verkossa tai kaapelissa; (3) palvelu on täysin turvallinen; (4) palvelu pyörii käyttäjän omalla Macillä.
- **Raja:** korvaa osan jakelusta. Nykyinen allekirjoitus ja 7 päivän uusinta ovat `scopes jakelu mac` -skoopissa (ios/mac/, LaunchAgent com.example.skoopit-asennus). Sideloader ottaa asennus- ja uusintaketjun. Äpin rakennus (project.yml, asenna.sh) jää `scopes jakelu` -skooppiin. Siirrettävät osat kirjataan omistajalle `/vika`-komennolla, kun ne on päätetty.

## Selvitys 28.10.2026 (SIDELOADER-SELVITYS)

Lähtötila: Mac allekirjoittaa ilmaisella "Apple Development"-identiteetillä (tiimi YOUR_CERT_ID). Viimeisin asennus oli 27.10.2026, ja sen profiili vanhenee 3.11.2026. WireGuard on reitittimellä (wg0, 192.0.2.31/24).

| Vaihtoehto | Yli 3 äppiä | Päivitys VPN:n kautta | Turvallisuus | Oma Mac | Kustannus |
|---|---|---|---|---|---|
| A. Maksullinen Developer Program + ad hoc + OTA (itms-services HTTPS-sivu Macilla, vain WireGuardin takana) | kyllä, rajattomasti; enintään 100 laitetta vuodessa | kyllä: Safari-linkki VPN:n yli, ei kaapelia eikä Bonjouria | hyvä: avain pysyy Macilla, asennus vain rekisteröityyn UDID:hen; HTTPS-varmenne oma CA (profiili iPhoneen) | kyllä | 99 USD vuodessa |
| B. Maksullinen + TestFlight | kyllä | kyllä, VPN:ää ei edes tarvita | hyvä, mutta buildit kulkevat Applen kautta ja vanhenevat 90 päivässä | osin (Apple välissä) | 99 USD vuodessa |
| C. Ilmainen tili + SideStore + LiveContainer | kiertää rajan ajamalla äppejä yhden äpin sisällä | päivitys puhelimessa (LocalDevVPN) | heikko: Apple ID:n kirjautuminen anisette-palvelun kautta, äpit samassa säiliössä, pairing-tiedosto vanhenee | ei (puhelinpohjainen) | 0 |
| D. Ilmainen tili, nykyinen ketju + WireGuard | ei (Applen raja 3 äppiä ja 7 pv) | mahdollinen, mutta devicectl verkon yli vaatii pariliitoksen ja Bonjourin, joka ei kulje WireGuardin yli | hyvä | kyllä | 0 |
| E. Enterprise | kyllä | kyllä | – | – | ei saatavilla yksityishenkilölle (299 USD, organisaatio) |

Johtopäätös: vain A täyttää kaikki neljä vaatimusta. Ostopäätös on käyttäjän.

**Toinen ilmainen Apple ID (selvitys 28.10.2026, käyttäjän kysymys):** asia on ratkaisematta, ja lähteet ovat ristiriitaisia.
- Tilin vaihto toimii: kun toinen ID otetaan käyttöön ja vanha kehitysprofiili poistetaan puhelimesta, asennus jatkuu (Apple Developer Forums 49304, 652164). Tämä vapauttaa paikat mutta ei kasvata niiden määrää.
- Paikkojen kasvattamista (2 ID:tä × 3 äppiä samaan aikaan) väittävät oppaat (gw2k, tenorshare), mutta laitetestit kertovat, että raja on laitekohtainen (iPASide, dev.to samay15jan). Virheilmoituksen "maximum number of apps for free development profiles" antaa iPhone itse.
- Vaikka raja olisi tilikohtainen, 7 päivän uusinta jää ja uusittavaa on kaksinkertainen määrä. Myös VPN-päivitys jää ratkaisematta, koska devicectl ei löydä puhelinta WireGuardin yli.
- Ratkaisu on laitetesti: kolme ilmaisella profiililla asennettua äppiä ja neljäs äppi toisella ID:llä.

**EU-kaupat ja LiveContainer (selvitys 28.10.2026, käyttäjän kysymys):**
- EU-kaupat (DMA) eivät auta: Apple vaatii notarisoinnin jokaiselle äpille kanavasta riippumatta, ja notarisointi vaatii maksullisen jäsenyyden. Oma kauppa vaatii 1 M€ takauksen tai 2 vuoden jäsenyyden ja yli miljoona asennusta EU:ssa.
- Valmiiksi rakentaminen ei auta: raja laskee asennetut ilmaisella profiililla allekirjoitetut äpit.
- Maksuton keino on LiveContainer: se vie yhden paikan ja ajaa omia äppejä sisällään. Mac allekirjoittaa sen nykyisellä ketjulla, joten SideStorea ja anisettea ei tarvita. Päivitys hoituu Macin IPA-sivulta WireGuardin yli. Rajoitukset: push-ilmoitukset, laajennukset ja App Groups toimivat huonosti tai eivät lainkaan, ja äpit jakavat isännän oikeudet. Avainnipun ja varmenteen eristys on varmistamatta. Ilmoituksia tarvitsevat äpit (Skoopit) pidetään omilla paikoillaan.

**Toinen Apple ID, syvempi selvitys 28.10.2026:**
- SideStoren virallinen FAQ (docs.sidestore.io/docs/faq): ilmaisella tilillä enintään 3 äppiä kerrallaan, SideStore mukaan lukien, ja 10 eri äppiä viikossa. FAQ ei ota kantaa siihen, voiko tilejä olla useita.
- MultiStore (SideStoren haara, github.com/lungustefan/MultiStore) on tehty juuri usealle ilmaiselle tilille. Se sanoo rajan olevan 3 äppiä tiliä kohden ja lupaa "more total app slots", mutta testitulosta ei ole julkaistu.
- Applen ilmaisten tiimien estot heinäkuusta 2026 alkaen (iloader #583, #611 ja #653): asennus kaatuu virheeseen 0xe8008024 "provisioning profile is banned", myös Xcodella. Esto on tiimikohtainen ja tallentuu laitteelle (mis.db). Samassa laitteessa toinen tili toimi, kun ensimmäinen oli estetty. Tämä viittaa siihen, että iPhone pitää kirjaa tiimeittäin. Laukaisijaa ei tunneta, ja uusi tili voi joutua estoon pian.
- Johtopäätös: todennäköisyys, että toinen ID antaa 3 lisäpaikkaa, on kohtalainen, mutta varmaa tietoa ei ole. Riskit: tilien esto (myös nykyisen Skoopit-tiimin), kaksinkertainen 7 päivän uusinta ja 10 äppiä viikossa tiliä kohden. Varmuuden saa vain laitetestillä.

## Päätökset

- **Käyttäjä 28.10.2026:** skooppi `scopes sideloader` luotiin komennolla `/pura uusi scopes sideloader`.
- **Käyttäjä 28.10.2026:** tarkoitus on omien iOS-äppien asennus. Rajat: yli 3 äppiä, päivitykset VPN:n kautta, täysin turvallinen, pyörii omalla Macillä. Skooppi korvaa osan jakelusta.
- **Käyttäjä 28.10.2026:** ensimmäinen työ on vaihtoehtojen selvitys ennen ostoja; maksullinen Developer Program päätetään myöhemmin.
- **Käyttäjä 28.10.2026:** kaikkia äppejä ei tarvitse pystyä etärakentamaan samanaikaisesti.
- **Selvityksen johtopäätös 28.10.2026:** vain maksullinen tili ja OTA-asennussivu Macilla WireGuardin takana täyttää kaikki vaatimukset. Maksuton vaihtoehto on LiveContainer, jonka Mac allekirjoittaa. Toisesta Apple ID:stä ei ole varmaa tietoa (mahdollisuus kohtalainen). EU-kaupat ja Enterprise hylätty: vaativat maksullisen jäsenyyden tai organisaation.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Ratkaisun valinta | avoin; odottaa käyttäjää | käyttäjä valitsee: toisen Apple ID:n laitetesti (hän luo ID:n ja lisää sen Macin Xcodeen), LiveContainer-kokeilu tai maksullinen tili ja OTA (todenna viim. 11.11.2026) |
| Siirtyvät osat scopes jakelu mac -skoopilta | avoin (kirjattu 28.10.2026); odottaa käyttäjää (ratkaisun valinta) | kirjataan omistajalle /vika-komennolla, kun ne on päätetty |
| Riski: Applen ilmaisten tiimien esto (iloader #583) voi koskea myös Skoopit-tiimiä YOUR_CERT_ID | avoin; asennus 27.10.2026 toimi | seuraa scopes jakelu mac -skoopin asennuslokia (`~/scopes-ios/asennus.loki`) |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/sideloader/HISTORIA.md`, ei lueta purussa.
