# Skooppien organisointi: Allscope ja uusi listanäkymä (DESIGN-ORGANIZING-KARTOITUS)

Päiväys: 27.10.2026  
Skooppi: `scopes design organizing`  
Lähde ja linjaus: Käyttäjän päätös 27.10.2026:
> *"infra valikon skoopit siirretään yhteen listan kanssa. Tähän pitäisi suunnitella uusi lista näkymä jossa yhdistyy nykyinen skoopit näkymän skoopit ja lista näkymä. Ehdotan että aluksi tehdään lista valikkoon ylös scope ja chat lisäksi oma allscope välilehti"*

---

## 1. Nykytila ja ongelmat

### 1.1 Nykytila
- **Sivupalkki (`scopes/ios/Sources/Sivupalkki.swift`, `scopes/macos/Sources/MacSidebar.swift`):**
  - Yläpalkissa suodatin: `All` | `Scope` | `Chat`.
  - Sisältö: Tasainen lista viimeaikaisista chateista ja aktiivisista skoopeista, järjestettynä tilan (käsittelyssä/kysely → odottaa → pakattu) ja ajan mukaan. Arkistoidut ja pitkään passiiviset skoopit eivät näy tai hukkuvat listaan.
- **Infra-näkymä (`scopes/ios/Sources/Infra.swift`, `scopes/macos/Sources/MacInfraView.swift`):**
  - Sisältää Linux-palvelimen tilan, Localregisterin ja rekisteritiedostot.
  - Sisältää lisäksi koko projektin **skooppipuun** (`skooppiPuu(skoopit)`), jossa pääskoopit (kuten `scopes`, `claude`, `infra`, `models`, `scopes2`) ovat avattavia kortteja ja alaskoopit niiden sisällä sisennetyinä.

### 1.2 Ongelmat nykymallissa
1. **Skooppien jakautuminen kahteen eri paikkaan:** Jos käyttäjä haluaa selata olemassa olevia skooppeja tai avata harvemmin käytetyn skoopin, hänen täytyy navigoida pois listalta Infra-näkymään. Skooppien selailu ja työnteko ovat erillään.
2. **Infran ylikuormitus:** Infran ensisijainen tarkoitus on järjestelmän, palvelimen ja rekisterikattojen seuranta. Kymmenien skooppien puun selaaminen Infrassa tekee näkymästä raskaan ja hämmentää infran roolia.
3. **Kokonaiskuvan puute listalla:** `Scope`-välilehdellä näkyvät vain suoraan aktiiviset tai arkistoimattomat skoopit tasaisena listana ilman ryhmäkontekstia (esim. mitkä skoopit kuuluvat `scopes2`- tai `claude`-perheeseen).

---

## 2. Ratkaisukonsepti: Yhdistetty listanäkymä ja Allscope-välilehti

Käyttäjän linjauksen mukaisesti infran skooppipuu siirretään päälistan yhteyteen. Sivupalkin yläosaan luodaan uusi välilehtijako.

### 2.1 Välilehtirakenne

```
+-----------------------------------------------------------+
|   [  Scope  ]      [  Allscope  ]      [  Chat  ]    (+)  |
+-----------------------------------------------------------+
|  [Hae skooppeja ja keskusteluja...                      ] |
+-----------------------------------------------------------+
```

| Välilehti | Tarkoitus | Sisältö | Lajittelu |
|---|---|---|---|
| **`Scope`** | Työn alla olevat skoopit (Focus / Active) | Aktiiviset skoopit: käsittelyssä olevat, käyttäjää odottavat ja hiljattain muokatut skoopit. | Tilan mukaan: käsittely/kysely (oranssi hehku) → odottaa (keltainen) → pakattu/viimeisin. |
| **`Allscope`** | Kaikki skoopit hierarkiana (Catalog / Tree) | Koko projektin skooppipuu (siirretty Infrasta). Pääskoopit ryhminä, alaskoopit hierarkkisesti niiden alla. | Looginen ryhmittely (pääskooppi aakkosittain tai tallennettu järjestys), alaskoopit puuna. |
| **`Chat`** | Vapaat keskustelut (Conversations) | Claude-, AGY- ja agenttikeskustelut. | Viimeisimmän viestin / pysähdysajan mukaan. |

> [!NOTE]
> **Mitä tapahtuu vanhalle `All`-suodattimelle?**  
> Vanhassa mallissa `All` yhdisti chateja ja skooppeja sekaisin. Kolmen selkeän välilehden malli (`Scope` | `Allscope` | `Chat`) tekee käyttöliittymästä huomattavasti selkeämmän, koska agenttityö (skooppi), koko arkkitehtuuri (allscope) ja vapaa keskustelu (chat) ovat toisistaan erotettuja. Lisäksi 3 pillerin layout mahtuu optimaalisesti iPhonen pystyasennon työkaluriville leikkautumatta.

---

## 3. Allscope-näkymän UI- ja visuaalinen suunnittelu

Allscope-näkymä ottaa Infrassa olleen skooppipuun ja muotoilee sen tyylikkääksi, nopeaksi ja helposti selattavaksi listaksi `scopes/design/ILME.md`:n mukaisesti.

### 3.1 Rakenne ja hierarkia

```
+-----------------------------------------------------------+
| Allscope (48 skooppia 7 pääryhmässä)             [Tiivistä] |
+-----------------------------------------------------------+
| v SCOPES  (12 alaskooppia)                    ● 2 aktiivista |
|   |-- scopes                              [odottaa]    32k |
|   |-- scopes lista                        [kasittely]  41k |
|   |-- scopes chat                         [pakattu]    28k |
|   |-- scopes design                       [pakattu]    15k |
|       |-- scopes design organizing         ● UUSI      12k |
|       `-- scopes design list              [pakattu]    10k |
|   `-- scopes macos                        [odottaa]    55k |
+-----------------------------------------------------------+
| > SCOPES2 (4 alaskooppia)                     ● 1 aktiivinen |
+-----------------------------------------------------------+
| > CLAUDE  (8 alaskooppia)                                  |
+-----------------------------------------------------------+
| > INFRA   (5 alaskooppia)                                  |
+-----------------------------------------------------------+
| > MODELS  (3 alaskooppia)                                  |
+-----------------------------------------------------------+
```

### 3.2 Visuaaliset elementit ja Teema (`ILME.md`)

1. **Pääryhmäkortti / -otsikko (Taso 0):**
   - Tausta: `Teema.korostusTausta` tai hienovarainen `lasiPinta` korttimuotoilulla (`Teema.Kulma.keskikoko` = 14 pt).
   - Vasen laita: Kääntyvä chevron (`chevron.right` / `chevron.down`) animoituna (`.snappy`).
   - Otsikko: Pääskoopin nimi lihavoituna (`.headline`), aliskooppien lukumäärä (`.caption`, harmaa).
   - Oikea laita: Tilamerkit, jos ryhmän sisällä on aktiivisia istuntoja (esim. `● 2 aktiivista` korostusvärillä tai hehkulla).
2. **Alaskooppirivi (Taso 1 ja 2):**
   - Sisennys: 16 pt per taso + ohut pystylinja/puurakenne tai selkeä porrastus.
   - Tilapiste: 8×8 pt pyöreä indikaattori:
     - Käsittelyssä: Oranssi + hehku (`Teema.korostus`).
     - Odottaa käyttäjää: Keltainen.
     - Pakattu: Harmaa (`Teema.toissijainen`).
   - Tekstit:
     - Skoopin relatiivinen nimi (esim. `organizing` pääryhmässä `scopes design`) tai koko nimi.
     - Seuraavan paketin tunnus (`Teema.Teksti.tunnus`, `.subheadline`, toissijainen väri).
     - Kontekstitokenit (`KontekstiMerkki`, harmaa `Teema.toissijainen`).
3. **Toiminnallisuudet rivillä:**
   - Napautus: Avaa suoraan kyseisen skoopin näkymän (`SkooppiNakymaView` / Mac-päänäkymä).
   - Veto oikealle (Swipe Right): Avaa virtanapin (`Pura` uuteen istuntoon tai `Pakkaa`) sekä `Arkistoi`-napin.
   - Pitkä painallus (iOS) / Oikea klikkaus (macOS): Kontekstivalikko (Pura mallilla, Pakkaa, Avaa rekisteri, Pysäytä).

---

## 4. Haku- ja suodatustoiminnot Allscopessa

Sivupalkin yläreunan hakukenttä toimii Allscope-välilehdellä seuraavasti:

1. **Reaaliaikainen suodatus:**
   - Haku kohdistuu skoopin nimeen, seuraavan paketin tunnukseen ja rekisterin kuvaukseen.
2. **Automaattinen laajennus:**
   - Kun käyttäjä kirjoittaa hakusanan (esim. `organizing`), ryhmät joissa on osumia (`scopes` → `scopes design` → `scopes design organizing`) avautuvat automaattisesti näkyviin.
   - Ei-osuvat ryhmät ja alaskoopit piilotetaan listasta.
   - Hakusanan pyyhkiminen palauttaa käyttäjän aiemman avatut/suljetut-tilan.
3. **Osumien korostus:**
   - Hakusana korostetaan skoopin nimessä korostusvärillä (`Teema.korostus`).

---

## 5. Infran uusi rooli

Kun skooppipuu poistuu Infra-näkymästä, Infrasta tulee selkeä, virtaviivainen ja nopea järjestelmäkeskus:

```
+-----------------------------------------------------------+
|                         Infra                             |
+-----------------------------------------------------------+
| [Palvelin: Linux Server (OnePlus / Mac)]                  |
| - Tila: Yhdistetty (Portti 8797 / V2)                     |
| - Palvelut: scopes-solmu, agy-prosessit                   |
| - [Käynnistä uudelleen]  [Pysäytä]                        |
+-----------------------------------------------------------+
| [Localregister ja Synkka]                                 |
| - Haara: claude/charming-brahmagupta-p9hmm7               |
| - Synkkatila: Ajan tasalla / Likainen puu                 |
| - [Tarkista synkka]                                       |
+-----------------------------------------------------------+
| [Kontekstitiedostot ja Katto (Budjetit)]                  |
| - Yhteensä: 18 tiedostoa, 1.2M tokenia ladattu            |
| - Katon ylitykset: 0 kpl                                  |
| - [Avaa rekisterilista]                                   |
+-----------------------------------------------------------+
```

Hyödyt:
- Infra latautuu heti ilman ison skooppipuun ja kaikkien tilojen laskentaa.
- Käyttäjä tietää tarkalleen: **Listalta** löytyvät kaikki skoopit ja keskustelut; **Infrasta** löytyy järjestelmän ja palvelimen rautatilanne.

---

## 6. Toteutussuunnitelma ja skooppien vastuut

Muutokset jaetaan omistajasäännön (TYÖTAVAT sääntö 15) mukaisesti:

1. **`scopes design organizing` (tämä skooppi):**
   - UX- ja visuaalinen spesifikaatio (tämä dokumentti).
   - Wireframet ja tilasiirtymät.
2. **`scopes lista` (`scopes/ios/Sources/Sivupalkki.swift`):**
   - Lisää `Suodatin`-enumiin `.allscope`.
   - Siirtää `skooppiPuu`-mallilogiikan ja puurivikomponentit sivupalkkiin Allscope-tilassa näytettäväksi.
   - Toteuttaa ryhmien avaus/sulku-tilat (`@State private var auki: Set<String>`).
3. **`scopes infra` (`scopes/ios/Sources/Infra.swift`):**
   - Poistaa skooppipuu-osion Infrasta, jättäen jäljelle palvelin-, synkka- ja rekisteriosiot.
4. **`scopes macos` (`scopes/macos/Sources/MacSidebar.swift`):**
   - Päivittää macOS-sivupalkin vastaamaan Allscope-rakennetta.


---

## 7. Suosikkien (Pin / Kiinnitetyt skoopit) hallinta ja UX (DESIGN-ORGANIZING-SUOSIKIT-JA-SUODATUS)

### 7.1 Tavoite ja käyttötapaukset
Käyttäjällä on tyypillisesti 3–7 skooppia, joiden parissa hän työskentelee aktiivisesti tai joita hän valvoo jatkuvasti (esim. `scopes lista`, `scopes chat`, `scopes2 ydin`, `infra`). Kun skooppeja on kymmeniä, hiljattain valmistuneet tai passiiviset skoopit putoavat nopeasti alemmas listalla, jos muut skoopit saavat päivityksiä.

Kiinnityksen (Pin) tarkoitus on:
1. Pitää tärkeimmät skoopit aina välittömästi saatavilla sivupalkin huipulla.
2. Erottaa ne selkeästi automaattisesti nousevista tilapäisistä istunnoista.
3. Tarjota nopea tila- ja tilannekatsaus kiinnitettyihin projekteihin yhdellä silmäyksellä.

### 7.2 Kiinnityksen vuorovaikutus ja eleet (Interaction Design)
Kiinnittäminen ja irrottaminen on suunniteltu usean eri vuorovaikutustavan kautta saavutettavuuden ja ergonomian varmistamiseksi:

1. **Pyyhkäisyele (Swipe Action - iOS):**
   - Skooppirivin veto oikealle (Swipe Right):
     - Nykyinen toiminto: Virtanappi (Pura/Pakkaa) ja Arkistoi.
     - Uusi järjestys: `[  Pura / Pakkaa  ]` (turkoosi/oranssi) | `[  Kiinnitä / Irrota  ]` (turkoosi nastakuvake `pin.fill` / `pin.slash.fill`) | `[  Arkistoi  ]` (harmaa arkistolaatikko).
     - Pyyhkäisy on nopea ja intuitiivinen yhden käden toiminto iPhonella.
2. **Kontekstivalikko (Context Menu / Pitkä painallus):**
   - Pitkä painallus iOS:llä tai oikea klikkaus macOS:llä avaa pikavalikon:
     - `Kiinnitä suosikkeihin` (ikoni: `pin`) tai `Irrota suosikeista` (`pin.slash`).
     - Sijoitus valikon toisena heti ensisijaisen toiminnon (`Pura...` / `Avaa`) jälkeen.
3. **Päänäkymän otsikkotyökalurivi (Scope Header):**
   - Kun tietty skooppi on valittuna, näkymän yläpalkissa (navigationBar trailing) näytetään hienovarainen kiinnitysnappi (`pin` / `pin.fill`), josta käyttäjä voi kytkeä suosikkitilan päälle/pois suoraan työskennellessään.

### 7.3 Suosikkien esitystapa `Scope`-välilehdellä
`Scope`-välilehdellä lista jaetaan kahteen selkeään osioon, jos kiinnitettyjä skooppeja on määritelty:

```
+-----------------------------------------------------------+
|   [  Scope  ]      [  Allscope  ]      [  Chat  ]    (+)  |
+-----------------------------------------------------------+
|  [Hae skooppeja ja keskusteluja...                      ] |
+-----------------------------------------------------------+
| KIINNITETYT (3)                                           |
| * scopes lista                 [kasittely]  ●        41k  |
| * scopes chat                  [pakattu]             28k  |
| * scopes2 ydin                 [odottaa]    ●        52k  |
+-----------------------------------------------------------+
| AKTIIVISET JA HILJATTAINEN                                |
|   scopes design organizing     ● UUSI                12k  |
|   scopes macos                 [odottaa]             55k  |
|   claude siirto                [pakattu]             19k  |
+-----------------------------------------------------------+
```

- **Visuaalinen tunnus:**
  - Kiinnitetyn rivin vasemmassa reunassa tai nimen edessä on pieni, tyylikäs turkoosi tai kultainen nastakuvake (`pin.fill`, 10×10 pt).
  - Kiinnitettyjen osio sijoitetaan kevyesti korostettuun korttitaustaan (`Teema.korostusTausta.opacity(0.4)`), mikä erottaa sen alapuolisesta virrasta.
- **Lajittelu kiinnitettyjen sisällä:**
  - Oletus: Tilaprioriteetti (käsittelyssä → odottaa → pakattu) ja aika.
  - Tulevaisuudessa: Käyttäjän vapaa manuaalinen järjestely (drag-and-drop).

### 7.4 Suosikkien esitystapa `Allscope`-välilehdellä
- Allscope-hierarkiassa kiinnitetyt skoopit säilyttävät luonnollisen paikkansa puurakenteessa, mutta:
  - Rivin nimen vieressä näkyy kiinnityskuvake (`pin.fill`).
  - Ryhmän otsikkorivillä (Taso 0) kiinnitettyjen lukumäärä lasketaan mukaan ryhmäindikaattoriin (esim. `★ 2 kiinnitettyä`).
  - Pikasuodattimella `Kiinnitetyt` Allscope voidaan rajata näyttämään vain kiinnitetyt skoopit ja niiden vanhemmat.

---

## 8. Pikasuodatus ja suodatinpillerit (Quick Filters)

### 8.1 Pikasuodatuksen rakenne ja sijoittelu
Tekstihaun rinnalle hakupalkin alapuolelle lisätään vaakasuuntainen, sulavasti vierittyvä pilleririvi (Filter Chips). Se tarjoaa välittömän tavan rajata listaa ilman näppäimistön avaamista.

```
+-----------------------------------------------------------+
|  [Hae skooppeja ja keskusteluja...                      ] |
|  ( Kaikki ) [ Aktiiviset ] [ Kiinnitetyt ] [ Viat (1) ]   |
+-----------------------------------------------------------+
```

### 8.2 Suodatinvaihtoehdot ja logiikka

| Suodatin | Tunnus / Ikoni | Logiikka ja sisältö |
|---|---|---|
| **Kaikki** | (oletus) | Näyttää kaikki välilehden kohteet (Scope: kaikki aktiiviset; Allscope: koko puu; Chat: kaikki chatit). |
| **Aktiiviset** | `bolt.fill` | Rajaa näkymään vain skoopit, joiden tila on `kasittely`, `kysely` tai `odottaa`. Piilottaa passiiviset ja pakatut skoopit. Allscopessa laajentaa automaattisesti haarat, joissa on aktiivisia istuntoja. |
| **Kiinnitetyt** | `pin.fill` | Näyttää vain käyttäjän kiinnittämät suosikkiskoopit. |
| **Viat / Virheet** | `exclamationmark.triangle.fill` | Näyttää vain ne skoopit, joissa on avoimia vikoja (`AVOIMET VIAT > 0`), rekisteriristiriitoja tai epäonnistuneita ajoja. Erottuu oranssilla tai punaisella varoitusvärillä. |
| **Pakatut** | `archivebox` | Näyttää valmiit, pakatut skoopit historia- ja viitekäyttöä varten. |

### 8.3 Visuaalinen muotoilu (`ILME.md`-mukainen)
- **Muoto:** Capsule-pillerit, korkeus 28 pt, vaakavälistys 8 pt (`Teema.Vali.pieni`).
- **Valittu tila:** Tausta `Teema.korostus` (turkoosi), teksti `Teema.korostusPaalla` (valkoinen), hieno varjo tai Liquid Glass -kiilto.
- **Passiivinen tila:** Tausta `Teema.passiivinen` tai `lasiPinta`, teksti `Teema.toissijainen`.
- **Badge-lukumäärät:** Jos suodattimella on merkittävä määrä (esim. `Viat (1)` tai `Aktiiviset (3)`), lukumäärä esitetään pillerin sisällä korostusvärisenä pisteenä tai mono-numerona (`.monospacedDigit`).

---

## 9. Kansiointi ja mukautettu ryhmittely (Folders & Tags) (DESIGN-ORGANIZING-KANSIOT)

### 9.1 Automaattinen vs. mukautettu kansiointi (Virtual Folders)
Skoopit jakautuvat tiedostopolkujensa mukaisesti hierarkkisiin pääperheisiin (`scopes/`, `scopes2/`, `claude/`, `infra/`, `models/`). Tämä arkkitehtoninen hierarkia toimii erinomaisesti Allscope-näkymän oletusrunkona.

Käyttäjällä on kuitenkin toistuva tarve luoda **horisontaalisia teemaryhmiä ja projektikansioita**, jotka ylittävät repohierarkian rajat:
1. **Teemakansiot (Virtual Folders):**
   - Esim. kansio `🚀 UI-Uudistus`: yhdistää skoopit `scopes design organizing`, `scopes lista`, `scopes macos`, `scopes design`.
   - Esim. kansio `⚡ Suorituskyky`: yhdistää `models optimization`, `scopes palvelu`, `scopes2 ydin`.
   - Esim. kansio `🛡️ Audit & Turva`: yhdistää `infra security`, `scopes auth`, `scopes2 audit`.
2. **Kansioiden ominaisuudet ja periaatteet:**
   - **Kevyt virtuaalisuus:** Kansio ei siirrä eikä nimeä tiedostoja levyltä eikä riko git-kloonia; se on puhtaasti käyttöliittymän esitys- ja fokusointikerros.
   - **Monikansioisuus:** Skooppi voi kuulua yhteen tai useampaan kansioon ilman tiedostoduplikaatiota.
   - **Täysi muokattavuus:** Käyttäjä voi nimetä kansion, valita sille SF Symbol -ikonin sekä korostusvärin järjestelmän `Korostus`-paletista.

---

### 9.2 Kansioiden visuaalinen esitystapa ja vuorovaikutus (Accordion UI)

`Scope`-välilehdellä kansiot esitetään tyylikkäinä ja reaktiivisina haitarikortteina (Accordion Cards):

```
+-----------------------------------------------------------+
| KANSIOT (2)                                      [+ Uusi] |
+-----------------------------------------------------------+
| v [paintpalette] 🚀 UI-Uudistus (3)          ● 1 AKTIIVINEN|
|   |-- scopes design organizing       ● UUSI           12k |
|   |-- scopes lista                   ● KÄSITTELY      41k |
|   `-- scopes macos                   [odottaa]        55k |
+-----------------------------------------------------------+
| > [bolt.fill] ⚡ Suorituskyky (2)            [pakattu]    |
+-----------------------------------------------------------+
```

#### 9.2.1 Kansion otsakerakenne (Folder Header)
- **Vasemman laita:**
  - Kääntökuvake: `chevron.right` (suljettu) kääntyy sulavasti 90 astetta alaspäin `chevron.down` (avattu), animoituna `.snappy`-siirtymällä.
  - Kansion räätälöity ikoni: 24×24 pt pyöristetyssä taustassa (`Teema.Kulma.pieni` = 8 pt), väritettynä kansion omalla teemavärillä (`kansionVari.opacity(0.18)` taustalla, `kansionVari` kuvakkeessa).
  - Kansion nimi: `Teema.Teksti.osio` / `.headline` lihavoituna.
  - Skooppien lukumääräbadge: `(3)` `.caption`-koolla toissijaisella värillä (`Teema.toissijainen`).
- **Oikea laita (Aggregoitu tilasynteesi):**
  - Jos kansion sisällä yksikin skooppi on tilassa `kasittely` tai `kysely`:
    - Näytetään oranssi hehkuva tilapiste + teksti `● KÄSITTELYSSÄ` (`Teema.korostus` / varoitus).
  - Jos yksikään ei ole käsittelyssä, mutta jokin odottaa käyttäjää:
    - Keltainen/vihreä piste + `● ODOTTAA` (`Teema.odottaa`).
  - Jos kansiossa on avoimia vikoja:
    - Varoituskolmio `exclamationmark.triangle.fill` oranssilla.
  - Jos kaikki skoopit ovat pakattuja:
    - Harmaa hiljainen indikaattori `[pakattu]`.
  - **Hyöty:** Käyttäjä näkee yhdellä silmäyksellä kansion tilanteen avaamatta sitä!

#### 9.2.2 Kansion sisällön esitys (Expanded Content)
- Kun kansio avataan, sen sisältämät skoopit listataan sisennettyinä (sisennys 20 pt).
- Riveinä käytetään samoja korkealaatuisia `SkooppiRivi`-komponentteja kuin päänäkymässä (nimet, tilat, kontekstitunnisteet, swipe-eleet).
- Kansion sisältä löytyy myös painike `+ Lisää skooppeja tähän kansioon...`, jos kansio on tyhjä tai käyttäjä haluaa täydentää sitä.

---

### 9.3 Virtuaaliryhmät ja Tagit (Tagging System)

Kansioiden rinnalla toimii joustava avainsanajärjestelmä (Tags), joka mahdollistaa kevyen moniluokittelun:

#### 9.3.1 Tagien konsepti ja syntaksi
- Tagit ovat lyhyitä, ytimekkäitä tunnisteita, kuten `#swift`, `#ui`, `#backend`, `#bugi`, `#v2`, `#kriittinen`.
- Skooppiin voi liittää vapaasti useita tageja.
- Tagit tallennetaan avaimen `scopesOrganizingConfig` tagikarttaan: `[skooppiNimi: [tagi1, tagi2]]`.

#### 9.3.2 Tagien visuaalinen esitystapa
- **Skooppirivillä:**
  - Tagit näytetään skoopin nimen alapuolella tai pakettitunnuksen perässä kompakteina pillereinä:
    - Korkeus 18 pt, padding vaakasuunnassa 6 pt, kulmasäde Capsule.
    - Tausta: `Teema.passiivinen` tai `Teema.korostusTausta.opacity(0.08)`.
    - Teksti: `Teema.Teksti.tunnus`, `.caption2`, toissijainen teksti.
    - Esimerkki: `[#ui]` `[#swift]`
- **Napautettavuus:**
  - Tagipillerin napauttaminen aktivoi suoraan hakusuodatuksen tälle tagille, jolloin lista rajaa näkyviin kaikki samalla tagilla varustetut skoopit.

#### 9.3.3 Tag-suodatus ja hakukenttäintegraatio
- Hakukenttään kirjoitettu `#ui` tai `tag:ui` suodattaa näkymän reaaliaikaisesti tageihin perustuen.
- Pikasuodatinriville (Filter Chips) voidaan dynaamisesti tuoda suosituimmat tagit, jos käyttäjä käyttää aktiivisesti tageja.

---

### 9.4 Kansioiden ja tagien luonti ja hallinta (Modals & Sheets)

#### 9.4.1 Uusi kansio -lomakearkki (New / Edit Folder Sheet)
Kansion luominen (`+` -napista) ja muokkaaminen avaa modaalisen arkin (`KansioMuokkausSheet`):

```
+-----------------------------------------------------------+
| [Peruuta]              Uusi kansio             [Tallenna] |
+-----------------------------------------------------------+
| KANSION TIEDOT                                            |
| Nimi:   [ UI-Uudistus                                  ]  |
+-----------------------------------------------------------+
| VÄRI                                                      |
| (Turkoosi) (Sininen) (Violetti) (Pinkki) (Vihreä) (Grafiitti)
+-----------------------------------------------------------+
| IKONI                                                     |
| [folder.fill]  [paintpalette]  [bolt.fill]  [cpu]         |
| [hammer.fill]  [sparkles]      [tray.full]  [globe]       |
+-----------------------------------------------------------+
| SKOOPIT KANSIOSSA (Valitse skoopit)                       |
| [x] scopes design organizing                              |
| [x] scopes lista                                          |
| [x] scopes macos                                          |
| [ ] scopes chat                                           |
| [ ] scopes infra                                          |
+-----------------------------------------------------------+
| [   Poista kansio   ]  (vain muokkaustilassa, punainen)   |
+-----------------------------------------------------------+
```

- **Kentät ja valinnat:**
  1. **Nimi:** Tekstikenttä selkeällä placeholderilla ja tyhjennysnapilla.
  2. **Väripaletti:** Valittavissa `Ulkoasu.swift`:n turvalliset sävyt:
     - `turkoosi` (`#0F766E` / `#2DD4BF`)
     - `sininen` (`#1D4ED8` / `#60A5FA`)
     - `indigo` (`#4338CA` / `#818CF8`)
     - `violetti` (`#7E22CE` / `#C084FC`)
     - `pinkki` (`#BE185D` / `#F472B6`)
     - `vihrea` (`#15803D` / `#4ADE80`)
     - `grafiitti` (`#374151` / `#D1D5DB`)
  3. **SF Symbol -ikonivalitsin:**
     - 12 tyylikästä järjestelmäikonia: `folder.fill`, `paintpalette.fill`, `bolt.fill`, `cpu.fill`, `hammer.fill`, `sparkles`, `tray.full.fill`, `globe`, `star.fill`, `tag.fill`, `terminal.fill`, `wrench.and.screwdriver.fill`.
  4. **Skooppien valintalista:**
     - Selattava ja haettava lista olemassa olevista skoopeista valintamerkein (`checkmark.circle.fill`).
  5. **Poisto:**
     - Jos muokataan olemassa olevaa kansiota, alareunassa on punainen "Poista kansio" -painike. Poistaminen avaa varmistuksen: *"Haluatko varmasti poistaa kansion 'UI-Uudistus'? Skooppeja tai tiedostoja ei poisteta."*

---

### 9.5 Vuorovaikutusmallit: Skooppien liittäminen kansioon

Skooppien liittäminen kansioon on suunniteltu monikanavaiseksi:

1. **Kontekstivalikko (Context Menu / Pitkä painallus):**
   - Riviä pitkään painamalla avautuu valikko:
     - `Siirrä kansioon...` ->
       - `🚀 UI-Uudistus` (jos jo kansiossa: näkyy checkmark ja valinta poistaa kansion)
       - `⚡ Suorituskyky`
       - `+ Uusi kansio...`
2. **Pyyhkäisyele (Swipe Right - iOS):**
   - Pyyhkäisy oikealle paljastaa: `[ Pura/Pakkaa ]` | `[ Kiinnitä ]` | `[ Kansio ]`.
   - `Kansio`-napin painallus avaa pienen nopean ActionSheetin tai Sheetin kansiovalinnoista.
3. **Raahaus ja pudotus (Drag and Drop):**
   - **iOS (iPad & iPhone) sekä macOS:**
     - Skooppikorttia pitkään painamalla se irtoaa raahattavaksi.
     - Kansion päälle vietäessä kansio korostuu hehkuvalla reunuksella (`Teema.korostus`, kulmasäde 14 pt).
     - Pudotettaessa skooppi lisätään kansioon välittömällä haptisella palautteella (`UIImpactFeedbackGenerator(.medium)`).

---

### 9.6 Koodiarkkitehtuuri ja tietomalli (Swift / JSON)

#### 9.6.1 Swift-tietomallit
Kansioiden ja tagien rakenne toteutetaan puhtaina, `Codable`, `Identifiable`, `Sendable` -yhteensopivina Swift-rakenteina:

```swift
import Foundation
import SwiftUI

/// Yksittäinen mukautettu kansio
public struct SkooppiKansio: Codable, Identifiable, Sendable, Hashable {
    public let id: String
    public var nimi: String
    public var ikoni: String
    public var vari: String          // Raw value enumista Korostus (esim. "turkoosi")
    public var skoopit: [String]     // Skooppien nimet (esim. ["scopes lista", "scopes macos"])
    public var luotuAika: Date
    public var jarjestys: Int

    public init(
        id: String = UUID().uuidString,
        nimi: String,
        ikoni: String = "folder.fill",
        vari: String = "turkoosi",
        skoopit: [String] = [],
        luotuAika: Date = Date(),
        jarjestys: Int = 0
    ) {
        self.id = id
        self.nimi = nimi
        self.ikoni = ikoni
        self.vari = vari
        self.skoopit = skoopit
        self.luotuAika = luotuAika
        self.jarjestys = jarjestys
    }
}

/// Koko organisoinnin konfiguraatiomalli (tallennetaan JSONina)
public struct OrganizingConfig: Codable, Sendable {
    public var versio: Int
    public var kiinnitetyt: [String]
    public var kansiot: [SkooppiKansio]
    public var tagit: [String: [String]] // [skooppiNimi: ["#ui", "#swift"]]

    public init(
        versio: Int = 1,
        kiinnitetyt: [String] = [],
        kansiot: [SkooppiKansio] = [],
        tagit: [String: [String]] = [:]
    ) {
        self.versio = versio
        self.kiinnitetyt = kiinnitetyt
        self.kansiot = kansiot
        self.tagit = tagit
    }
}
```

#### 9.6.2 Tallennus ja @AppStorage -integraatio
Koko organisointitila tallennetaan käyttäjän laitekohtaiseen UserDefaults-tilaan JSON-merkkijonona:

```swift
@Observable
public final class OrganizingStore {
    public static let jaettu = OrganizingStore()

    private let storageKey = "scopesOrganizingConfig"
    public var config: OrganizingConfig {
        didSet { tallenna() }
    }

    public init() {
        if let jsonStr = UserDefaults.standard.string(forKey: storageKey),
           let data = jsonStr.data(using: .utf8),
           let ladattu = try? JSONDecoder().decode(OrganizingConfig.self, from: data) {
            self.config = ladattu
        } else {
            // Migraatio vanhasta sivupalkkiKiinnitetyt -avaimesta
            let vanhatKiinnitetyt = (UserDefaults.standard.string(forKey: "sivupalkkiKiinnitetyt") ?? "")
                .split(separator: "\n").map(String.init)
            self.config = OrganizingConfig(kiinnitetyt: vanhatKiinnitetyt)
        }
    }

    private func tallenna() {
        if let data = try? JSONEncoder().encode(config),
           let str = String(data: data, encoding: .utf8) {
            UserDefaults.standard.set(str, forKey: storageKey)
        }
    }
}
```

- **Robustisuus:** Jos JSON-dekoodaus kohtaa virheen, se palauttaa ehjän oletuskonfiguraation kaatumatta.
- **Yhteensopivuus ja migraatio:** Aiemmin `L-ORG-01`:ssä määritelty `sivupalkkiKiinnitetyt` synkronoidaan ja luetaan saumattomasti osaksi `config.kiinnitetyt`-listaa.


---

## 10. Kosketuseleet ja vuorovaikutusmallit (Gestures & Ergonomics)

### 10.1 Pyyhkäisyeleet (Swipe Actions)
- **Veto oikealle (Swipe Right):**
  - Sivupalkin sisällä oikealle suuntautuva veto on luonteva, koska sivupalkki peittää vasemman reunan.
  - Paljastuvat toiminnot:
    1. `Pura / Pakkaa` (toimintanappi tilanteen mukaan).
    2. `Kiinnitä / Irrota` (`pin.fill` turkoosilla taustalla).
    3. `Kansio...` (avaa pikavalitsimen kansiolle).
- **Veto vasemmalle (Swipe Left):**
  - `Arkistoi` (piilottaa skoopin aktiivisesta listasta).

### 10.2 Raahaus ja järjestely (Drag & Drop)
- iPadilla ja macOS:llä sekä iPhonen muokkaustilassa:
  - Skooppirivin pitkä painallus ja raahaus mahdollistaa:
    - Skoopin siirtämisen kiinnitettyjen listalle tai kansion sisään.
    - Kiinnitettyjen skooppien keskinäisen järjestyksen vaihtamisen.

---

## 11. Wireframet ja visuaaliset tilasiirtymät

### 11.1 iPhone: Scope-näkymä suosikeilla ja pikasuodattimilla
```
+-----------------------------------------------------------+
| [  Scope  ]      [  Allscope  ]      [  Chat  ]       (+) |
+-----------------------------------------------------------+
|  [Q Etsi skooppeja tai viestejä...                      ] |
|  ( Kaikki )  [● Aktiiviset (3)]  [★ Kiinnitetyt]  [Viat]  |
+-----------------------------------------------------------+
| KIINNITETYT                                               |
| +-------------------------------------------------------+ |
| | [pin] scopes lista                      ● KÄSITTELY   | |
| |       Suodattimet ja Allscope-integraatio        41k  | |
| +-------------------------------------------------------+ |
| | [pin] scopes chat                       ● ODOTTAA     | |
| |       Kupla-asettelut ja viestisyöte             28k  | |
| +-------------------------------------------------------+ |
| | [pin] scopes2 ydin                      [pakattu]     | |
| |       T-101 Gate-testit ja suorituskyky          52k  | |
| +-------------------------------------------------------+ |
|                                                           |
| KANSIOT                                                   |
| > [folder] 🚀 UI-Uudistus (3 skooppia)    ● 1 aktiivinen  |
|                                                           |
| MUUT AKTIIVISET SKOOPIT                                   |
|   scopes design organizing                ● UUSI   12k    |
|   scopes macos                            [odottaa]55k    |
|   claude siirto                           [pakattu]19k    |
+-----------------------------------------------------------+
| [Osoite: 192.0.2.99:8797]              [Asetukset (⚙)] |
+-----------------------------------------------------------+
```

### 11.2 iPhone: Allscope-näkymä suodattimella "Kiinnitetyt"
```
+-----------------------------------------------------------+
| [  Scope  ]      [  Allscope  ]      [  Chat  ]       (+) |
+-----------------------------------------------------------+
|  [Q Etsi skooppipuusta...                               ] |
|  [ Kaikki ]  [ Aktiiviset ]  (★ Kiinnitetyt)  [Viat]      |
+-----------------------------------------------------------+
| Allscope - Rajattu: Kiinnitetyt (3 kpl)                   |
|                                                           |
| v SCOPES                                                  |
|   |-- [pin] scopes lista                  ● KÄSITTELY 41k |
|   `-- [pin] scopes chat                   ● ODOTTAA   28k |
|                                                           |
| v SCOPES2                                                 |
|   `-- [pin] scopes2 ydin                  [pakattu]   52k |
+-----------------------------------------------------------+
```

---

## 12. Toteutussuunnitelma ja skooppien vastuut

Tarkat toteutuslipukkeet ja koodimääritykset on dokumentoitu erillisessä tiedostossa:
👉 `scopes/design/organizing/TOTEUTUSTEHTAVAT.md`

Omistajasäännön (TYÖTAVAT sääntö 15) mukaiset toteutustehtävät ja -lipukkeet:

1. **`scopes design organizing` (tämä skooppi):**
   - Suosikkien, pikasuodatuksen ja kansioinnin UX-konseptit ja wireframet (`SUUNNITELMA.md`).
   - Visuaalisen ilmeen ja Teema-tokenien soveltamisohjeet (`ILME.md`).
   - Toteutuslipukkeet ja hyväksymiskriteerit omistajaskoopeille (`TOTEUTUSTEHTAVAT.md`).
2. **`scopes lista` (`scopes/ios/Sources/Sivupalkki.swift`, `KansioMuokkausSheet.swift`):**
   - **Lipuke L-ORG-01:** Suosikkien (Pin) tilanhallinta ja pysyvyys (`@AppStorage("sivupalkkiKiinnitetyt")`, `kiinnitettySet`).
   - **Lipuke L-ORG-02:** Kiinnitettyjen osio `Scope`-välilehdellä (`Section("KIINNITETYT")`, nastaikoni, duplikaattien esto).
   - **Lipuke L-ORG-03:** Kiinnityksen eleet ja toiminnot (Pyyhkäisyele oikealle nastanapilla, kontekstivalikko).
   - **Lipuke L-ORG-04:** Pikasuodatus (Quick Filter Chips) hakukentän alle (`Pikasuodatin`-enum, Capsule-pillerit, laskurit).
   - **Lipuke L-ORG-05:** Allscope-integraatio ja puusuodatus (nastaikonit puuriveillä, osumahaarojen avaus).
   - **Lipuke L-ORG-06:** Kansioiden ja tagien tietomalli sekä säilyvyys (`OrganizingStore` / `@AppStorage("scopesOrganizingConfig")`).
   - **Lipuke L-ORG-07:** Kansioiden luonti-, muokkaus- ja poistodialogit (`KansioMuokkausSheet`).
   - **Lipuke L-ORG-08:** Kansioiden esittäminen `Scope`-listalla (Accordion / Collapsible Section ja tilasynteesi).
   - **Lipuke L-ORG-09:** Skooppien siirtäminen kansioihin (Kontekstivalikko, Pyyhkäisy ja Drag & Drop).
   - **Lipuke L-ORG-10:** Virtuaaliryhmät ja Tagit (Tag-pillerit, Tag-haku ja Tag-pikasuodatus).
3. **`scopes macos` (`scopes/macos/Sources/MacSidebar.swift`, `MacRootView.swift`):**
   - **Lipuke M-ORG-01:** Suosikkien tilanhallinta ja pysyvyys macOS:llä (`@AppStorage("sivupalkkiKiinnitetyt")`).
   - **Lipuke M-ORG-02:** Kiinnitettyjen osio MacSidebarissa (`Section("Kiinnitetyt")`).
   - **Lipuke M-ORG-03:** Kontekstivalikko, työkalupalkki ja pikanäppäin (Cmd+Shift+P).
   - **Lipuke M-ORG-04:** Pikasuodatuksen laajennus MacSidebarissa (`SkooppiSuodatus`: Kiinnitetyt, Viat).
   - **Lipuke M-ORG-05:** Allscope-hierarkiasuodatus ja kiinnitysmerkit macOS-puussa.
   - **Lipuke M-ORG-06:** Mac-kansiorakenteen tietomallin tuki ja säilyvyys (`OrganizingStore` / `@AppStorage`).
   - **Lipuke M-ORG-07:** Kansioiden luonti ja hallinta macOS:llä (Työkalupalkki, dialogit ja kontekstivalikot).
   - **Lipuke M-ORG-08:** Kansio-osiot ja ryhmittely MacSidebarissa (`DisclosureGroup`).
   - **Lipuke M-ORG-09:** Raahaus ja pudotus (Drag & Drop) MacSidebarissa.
   - **Lipuke M-ORG-10:** Tagien esitys ja suodatus macOS:llä.

