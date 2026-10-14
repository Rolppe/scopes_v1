# scopes/localregister/MUOTO.md — rekisterien synkronoinnin muoto (luonnos)

Tila: hyväksytty pohjaksi 14.10.2026 (käyttäjä; paketti LOCALREGISTER-MUOTO).
Vaatimukset V1–V9 ja päätökset K1–K4: `REKISTERI.md`, Päätökset.

## 1. Mittaus: kuinka usein samaa kohtaa muutetaan rinnakkain (K5)

Lähde: git-historia 22.8.–14.10.2026, kaikki `REKISTERI.md`-muutokset (859 muutosta, 41 tiedostoa;
495:ssä `Claude-Session`-tunniste, vain niistä voi päätellä istunnon). Skripti:
`python3 scopes/localregister/mittaa-rinnakkaisuus.py 7200` projektijuuresta (argumentti = ikkuna sekunteina).

| Mitattu (ikkuna 2 h) | Määrä |
|---|---|
| Eri istuntojen peräkkäiset muutokset samaan tiedostoon | 223 |
| — joista istunnot olivat käynnissä yhtä aikaa (rinnakkaiset) | 3 |
| — rinnakkaisista sama osio | 2 |
| — rinnakkaisista sama rivi (pois lukien `Tilanne:`) | 1 (tyhjä rivi, ei todellinen) |

Peräkkäisistä (pakkaus → uusi istunto → purku) 159 muutti `SEURAAVA PAKETTI` -riviä ja lähes kaikki
`Tilanne:`-päivämäärää. Johtopäätökset:

- Todellinen rinnakkaisuus on nyt harvinaista, koska pura hakee ja pakkaus pushaa vuorotellen.
  Kun äppi muokkaa (K3) ja synkka ajetaan ilman pakkausta, rinnakkaisuus kasvaa: muoto suunnitellaan sille.
- Kuumat kohdat ovat yksiarvoiset kentät: `Tilanne:` (jokainen muutos) ja `SEURAAVA` (joka pakkaus).
- **K5-ehdotus: yksikkö on rivi.** Jokainen Päätös, Avoimet asiat -rivi, Vika-rivi ja muu luettelon
  alkio on oma yksikkönsä omalla tunnuksellaan. Osiotaso ei riitä: rinnakkaisista 2/3 osui samaan osioon.
- `Tilanne:` ei ole tallennettu kenttä vaan johdetaan uusimmasta muutoksesta: kuumin kohta katoaa.

## 2. Yksikkö

Yksi yksikkö = yksi JSON-tiedosto (`<rekisteri>/<yksikkö-id>.json`):

```json
{
  "id": "oneplus-000412",
  "rekisteri": "scopes/localregister",
  "laji": "paatos | avoin | vika | seuraava | tarkoitus | osio | kappale",
  "osio": "Päätökset",
  "jarjestys": "m",
  "sisalto": "markdown-teksti tai taulukon solut listana",
  "versio": { "oneplus": 12, "iphone": 3 },
  "muutettu": "2026-10-14T15:20:00+03:00",
  "muuttaja": "oneplus",
  "poistettu": false
}
```

- **Tunnus** `<laite>-<laitteen laskuri>`: kaksi laitetta ei voi luoda samaa tunnusta ilman yhteyttä.
- **Järjestys** on murtoindeksi (merkkijono, joka mahtuu kahden väliin): kaksi laitetta voi lisätä
  rivin samaan väliin ilman ristiriitaa.
- **Lajit** tulevat nykyisistä osioista; tuntematon osio tallentuu `osio`- ja `kappale`-yksikköinä,
  joten mikään rekisterin teksti ei katoa (tarkistetaan kaksoiskappaleen edestakaistestillä, §7).

## 3. Versiomerkintä (V3)

`versio` on versiovektori: laite → laskuri. Laite kasvattaa omaa laskuriaan jokaisessa muutoksessa.
Lähde näkyy merkinnässä aina, joten `oneplus:12` ja `iphone:12` eivät sekoitu.

Vertailu kahden laitteen välillä:

| Tilanne | Toimi |
|---|---|
| A ≥ B jokaisella laitteella | A on uudempi → B päivitetään |
| sama vektori | ei mitään |
| kumpikaan ei ≥ toista | rinnakkainen muutos → **ristiriita**, kysytään käyttäjältä (K4) |

Ristiriidassa molemmat versiot säilyvät yksikön `rinnakkaiset`-listassa, kunnes käyttäjä valitsee
toisen tai kirjoittaa yhdistelmän. Ratkaisu saa vektorin, joka on ≥ molempia, joten se leviää ilman
uutta ristiriitaa.

## 4. Poisto ja rekisterien määrä (V8)

- Poistettu yksikkö jää hautakiveksi (`poistettu: true`, uusi versio). Ilman sitä toinen laite
  palauttaisi poistetun rivin.
- Rekisteri itse on `meta`-yksikkö (`<rekisteri>/_meta.json`: nimi, polku, versio, poistettu).
  Synkassa rekisterijoukko on liitto: laitteella puuttuva rekisteri tuodaan, poistettu
  merkitään hautakivellä. Hautakivet säilyvät ensimmäisessä vaiheessa ikuisesti (koko on pieni:
  rekisterit yhteensä 306 kt).
- Siivous (LOCALREGISTER-HAUTAKIVET 14.10.2026): `lr.mjs siivoa` tiivistää kiven omasta tiedostostaan
  (4 kt:n lohko) rekisterin `_siivotut.json`-merkinnäksi `{ id: versio }`; tieto poistosta säilyy.
  Siivotaan vain kivet, joita gitissä ei ole (`lahdeSisalto` null) ja joissa ei ole riitaa. Listat
  (`siivotut`) kertovat merkinnät: äppi poistaa saman tai vanhemman oman kopionsa lähettämättä sitä.
  Vastaanotossa sama tai vanhempi versio ohitetaan, uudempi herättää yksikön, rinnakkainen palauttaa
  kiven riitana (K4). Tiivisteet eivät sisällä merkintöjä. Ajetaan käsin, kunnes puhelimessa on
  siivouksen tunteva äppi: vanha äppi lähettäisi kivet joka synkassa uudelleen.

## 5. Vertailuprotokolla (V2, K1)

Kolme tasoa, jotta muuttumaton tila maksaa yhden kyselyn:

1. **Juuritiiviste**: yksi hajautusarvo kaikista `(id, versio)`-pareista. Sama → valmis.
2. **Rekisterikohtaiset tiivisteet**: eroavat rekisterit tunnistetaan.
3. **Yksikkölistat** eroavista rekistereistä: `(id, versio)`; siirretään yksiköt, joissa toinen on
   uudempi, ja merkitään ristiriidat.

Laukaisijat:

- yhteys syntyy (mikä tahansa yhteys, K1): äppi etualalle tai verkko palaa;
- paikallinen muutos: lähetetään pian (esim. 5 s viiveellä, jotta naputtelusarja menee yhtenä);
- pakkaus ja purku (V4): kutsuvat synkkaa, eivät kuljeta dataa;
- uudelleentarkistus, kun mitään ei ole muuttunut: **vähimmäisväli** (K1; arvo käyttäjän päätös, ehdotus 10 min).

## 6. Kuljetus ensimmäisessä vaiheessa (V9, K2)

Äppi ↔ palvelin HTTP:llä nykyisen Scopes-palvelun rinnalle (`scopes/palvelu`), omilla
`/api/lr/…`-poluilla. Protokolla on symmetrinen: palvelin on ensimmäisessä vaiheessa aina
auki oleva vertainen (K2), ei keskus. Myöhemmin Mac ja muut koneet liittyvät samalla protokollalla.

## 7. Kaksoiskappale (V7, K6-ehdotus)

1. **Tuonti**: palvelin jäsentää nykyiset `REKISTERI.md`:t yksiköiksi erilliseen hakemistoon
   (ei gittiin; sijainti käyttäjän päätös).
2. **Edestakaistesti**: yksiköistä tulostettu markdown verrataan alkuperäiseen; ero = jäsennysvika.
   Hyväksyntä: kaikki tiedostot palautuvat merkki merkiltä (tai erot luetellaan ja hyväksytään).
3. **Testivaihe**: äppi muokkaa vain kaksoiskappaletta. Alkuperäiset rekisterit ja git pysyvät
   totuutena; tuonti ajetaan uudelleen git-muutosten jälkeen, jolloin git-puolen muutos on
   oneplus-laitteen muutos.
4. **Vaihto** nykyisestä uuteen on erillinen käyttäjän päätös testien jälkeen.

## 8. Käyttäjän päätökset 14.10.2026

- Vähimmäisväli uudelleentarkistukselle: 10 min (§5).
- Laajuus: kaikki 78 tiedostoa, myös HISTORIA.md ja ARKISTO.md (V1).
- Kaksoiskappale gitin ulkopuolella palvelimella: `~/.local/share/localregister` (§7).

## 9. Tila: kaksoiskappale (LOCALREGISTER-KAKSOIS 14.10.2026)

`scopes/localregister/lr.mjs` (testit `lr.test.mjs`, 4/4) toi commitin 3d6d569e kaikki 78 tiedostoa:
5481 yksikköä, edestakaistesti 78/78 merkki merkiltä, juuritiiviste `ba99b922…`. Levyllä 23 Mt
(lähde 2,7 Mt): 4 kt:n lohko per yksikkötiedosto. Yksikön koko: mediaani 161 merkkiä, p95 2,6 k,
suurin 33 k (`claude/siirto/HISTORIA.md`, yksi pitkä luettelon alkio).

Uudelleentuonti (LOCALREGISTER-UUDELLEENTUONTI 14.10.2026): `lr.mjs tuo` uudelleen ajettuna kohdistaa
yksiköt sisällön pisimmällä yhteisellä osajonolla; muuttumaton pitää tunnuksensa, muokattu saa uuden version
samalla tunnuksella, poistunut hautakiven, uusi avaimen naapuriensa väliin; gitistä poistunut rekisteri saa
hautakiven. Testit 5/5. Oikea ajo 3d6d569e → 58cc59b2: 77 muuttumatonta, 1 muuttunut rekisteri
(13 sama / 3 muuttunut / 1 uusi / 1 poistettu), edestakaisin 78/78, toinen ajo muuttumaton.

Paritus (LOCALREGISTER-PARITUS-RIITA 14.10.2026): osumattoman välin vanha ja uusi yksikkö ovat sama yksikkö
vain samankaltaisina — taulukkorivillä sama ensimmäinen solu, otsikolla, tilanteella ja SEURAAVA-rivillä sama
laji, muilla jatkettu teksti tai merkkiparien Dice ≥ 0,5; muuten vanha poistuu ja uusi saa oman tunnuksen.
Git-muutos ei ole riita, kun muun laitteen versio on palauttanut gitin edellisen sisällön (ei poistoa, ei
avointa riitaa): versio on molempien yhdiste + tämä laite. Tuotannon 005655-riita (89b20028) syntyi, kun
poistettu "Rivinvaihto taulukkorivissä" ja uusi "Puhelimen kopion yhtenevyys" paritettiin järjestyksessä.

## 10. Tila: protokolla palvelimella (LOCALREGISTER-PROTOKOLLA 14.10.2026)

Palvelinpää `scopes/localregister/palvelu.mjs` Scopes-palvelun `/api/lr/`-poluilla (ajopaikan perustelu
tiedoston alussa; käyttäjä "selvitä itse"). Uudelleentuonti ennen tiivistekyselyä, kun HEAD muuttui, ja
10 min välein (käyttäjä: "molemmat"), lapsiprosessissa. Yksikkö muistaa gitin puolen (`lahdeSisalto`,
`lahdeVersio`): jos äppi on muuttanut riviä, saman rivin git-muutos tallentuu rinnakkaiseksi ristiriidaksi
eikä kumoa äpin muutosta. Testit: lr 8/8 + palvelu 3/3, Scopes-palvelu 76/76. Päästä päähän testiportissa:
ensimmäinen tiiviste 2,0 s (tuonti), välimuistista 74 ms; ilman avainta 401.

Käyttöön tulo vaatii Scopes-palvelun uudelleenkäynnistyksen. Seuraavaksi äppi: paikallinen kopio,
synkka laukaisijoineen (§5) ja ristiriitojen ratkaisunäkymä.

## 11. Vienti LR → git: scopes-perhe live-rekisteriksi (LOCALREGISTER-VIENTI 14.10.2026)

Käyttäjä 14.10.2026: `scopes`-skoopin ja alaskooppien rekisterit live-rekisteriksi; vienti "Palvelu heti",
push "Seuraava pakkaus pushaa". LR on näille totuus ja git-tiedosto sen vienti; muut 37 tiedostoa jäävät
pelkiksi tuonneiksi.

- `lr.mjs vie --etuliite scopes/`: tuonti ensin (gitin muutokset yhdistyvät LR:ssä kolmitiesäännöllä), sitten
  jokainen etuliitteen rekisteri, jonka `tulosta`-teksti eroaa HEADista, kirjoitetaan ja committataan yksinään
  (`chore(lr): vienti <polku> äpistä`), juurirepon pakkauslukon (`<state>/lock`) alla.
- Ohitus (viedään myöhemmin): avoin riita (K4, ratkaistaan äpissä), tiedoston tai skoopin REKISTERI.md:n
  pakkauslukko, istunnon muokkaama tiedosto, git-toiminto kesken tai irrotettu HEAD, epäonnistunut commit
  (tiedosto palautetaan HEADiin).
- Paluu: uudelleentuonti tunnistaa viennin. Git-muutos, joka on jo yksikön sisältö, päivittää vain gitin
  puolen, eikä versio kasva; äpin luoma rivi tunnistetaan sisällöstä eikä kahdennu.
- Palvelu (`SCOPES_LR_VIENTI`, kaynnista.sh oletus `scopes/`; tyhjä = pois): etuliitteeseen osuva lähetys ja
  10 min ajastin ajavat viennin lapsiprosessissa samassa jonossa tuonnin kanssa. Koeinstanssi ilman
  muuttujaa ei vie, koska sen repojuuri on tuotannon.
- Testit: lr 16/16 + palvelu 4/4 (`node --test scopes/localregister/lr.test.mjs scopes/localregister/palvelu.test.mjs`),
  Scopes-palvelu 76/76. Harjoitus 14.10.2026 tuotannon LR:n kopiolla ja repon kloonilla koeinstanssissa 8799:
  kaksi peräkkäistä vientiä, istunnon likainen tiedosto ohitettiin ja vietiin pakkauksen jälkeen yhdistettynä,
  riitoja 0, edestakaisin 80/80.
