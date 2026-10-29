# Skoopit-äpin nykytilan katselmus (DESIGN-KATSELMUS, 14.10.2026)

Lähde: äpin lähteet commitissa db2ee4dd (HEAD 14.10.2026; toisen keskustelun commitoimattomat iOS-muutokset eivät
mukana), iPhone 15 Pro -simulaattori Macilla, oikea palvelu. Kuvat: olemassa olevien UI-testien `kuva()`-liitteet,
9 ei-chat-testiä (chat-testit lähettävät oikeita viestejä, joten ne jätettiin pois). Kuva-arkit:
`kuvat/katselmus-2026-10-14/arkki1–5.jpg` (nimet kuvien yläreunassa).

Uusinta: HEAD-worktree ja
`SCOPES_TULOS=design-katselmus SCOPES_VAIN="<testit>" bash scopes/ios/testi.sh`, sitten Macilla
`xcrun xcresulttool export attachments --path ~/scopes-ios/design-katselmus.xcresult --output-path <kansio>`.

Koodista laskettu hajonta (`scopes/ios/Sources/*.swift`): 26 eri värimäärittelyä (mm. `Color(white: 0.24)`,
`Color(white: … 0.80 : 0.92)`, viisi `systemGray`-sävyä), 15 fonttimuunnelmaa, 15 eri padding-arvoa, kulmasäteet
3, 8, 14, 24 ja 28. Yhteistä teematiedostoa ei ole.

## Löydökset

Vakavuus: **A** estää tai harhauttaa käyttöä, **B** näkyvä epäjohdonmukaisuus, **C** viimeistely.

### Ilme

| # | Vak. | Havainto | Kuva |
|---|---|---|---|
| I1 | B | Kaksi kilpailevaa korostusväriä: Clauden oranssi (suodatinpillerit, lähetysnappi) ja iOS:n sininen (toimintolinkit, Pura-nappi, infran laajennusnapit, token-merkki). Kansiot keltaiset, viat oranssit, virheet punaiset. Väreillä ei ole sovittua merkitystä. | arkki1, arkki3, arkki4 |
| I2 | B | Navigointipalkki vaihtelee: useimmissa keskitetty otsikko, skoopin viestinäkymässä otsikko vasemmalla kapselissa renkaan ja ⋯:n kanssa; Uusi skooppi -arkissa iso otsikko. | arkki2 viestit, arkki3 ei-auki, uusi-hylatty |
| I3 | B | Paketin tunnus (DESIGN-KATSELMUS) isoilla kirjaimilla on yhtä painava kuin skoopin nimi ja rivittyy infrassa kahdelle riville (EXPRESSO-IOS-KYTKIN-UUDELLEENKAYNNISTYS). | arkki1, arkki4 infra |
| I4 | B | Sivupalkin rivit ovat korkeita (~90 pt, kolme riviä): ruudulle mahtuu 7 skooppia. Merkkirivin kolme kuvaketta (lista, ötökkä, aivot) ilman selitettä; aivot sininen, muut harmaita. | arkki1 |
| I5 | C | Oranssi kansio (scopes viat) eroaa muista, mutta merkitystä ei selitetä missään. | arkki1 |
| I6 | B | Kontekstipalkin selitteissä kaksi riviä nimellä "Yhteiset ohjeet" eri väreillä (punainen yhteiset.md, syaani TYOTAVAT.md). | arkki4 konteksti |
| I7 | C | Tiedoston teksti näytetään raakana markdownina tasalevyisellä fontilla (otsikkorivi `# scopes/REKISTERI.md`). | arkki4 konteksti-teksti |
| I8 | C | Kulmasäteet 3/8/14/24/28 ja vapaat paddingit: kortit, pillerit ja arkit eivät noudata yhtä mittakaavaa. | koodi |

### UX

| # | Vak. | Havainto | Kuva |
|---|---|---|---|
| U1 | A | Haun näppäimistö jää auki, kun skooppi avataan hakutuloksesta: puolet skoopin näkymästä peittyy (Toiminnot, Seuraava paketti, viestit, Pakkaa-vahvistus). | arkki2, arkki3 |
| U2 | A | Sivupalkin kelluvat napit (infra ja asetukset) peittävät listan alimman rivin merkit eikä niiden alla ole taustaa. | arkki1 (scopes lista) |
| U3 | A | Virheet näytetään raakoina: "Palvelu vastasi 409: skoopilla ei ole tmux-istuntoa, johon /pakkaa voi lähettää". HTTP-koodi, tmux ja slash-komento ovat toteutuksen kieltä. | arkki3 pakkaa-hylatty, uusi-hylatty |
| U4 | A | Pakkaa istunto on painettavissa, vaikka äppi tietää, ettei istuntoa ole ("Skooppi ei ole auki"); virhe tulee vasta palvelulta. Samoin Uusi skooppi -nimen varaus tarkistetaan vasta palvelussa, vaikka lista on äpissä. | arkki3 |
| U5 | B | Skoopin näkymä alkaa Toiminnoilla (Pura, Pakkaa, Automaattisiirto, muistikytkin) ennen tietoja (Seuraava paketti, Konteksti, Istunnot, Avoimet asiat): tilaa muuttava napin painallus on ensimmäinen asia. | arkki2 skooppi, arkki4 skooppi-konteksti |
| U6 | B | Vahvistusteksti "Lähetetäänkö skoopin istuntoon /pakkaa?" puhuu komennoista, ei seurauksesta (istunto pakataan ja suljetaan?). | arkki3 pakkaa-vahvistus |
| U7 | B | Infran puussa kaksi kosketuskohtaa per rivi: laajennusnappi vasemmalla ja chevron oikealla; chevron näkyy myös riveillä, joilla ei ole lapsia, eikä sen kohde näy. | arkki4 infra, arkki5 |
| U8 | B | Viestinäkymän otsikon alla pieni tila "waiting · 99 k", ja kysymyskortin yläreuna leikkautuu otsikkopalkin alle. Otsikon oranssi rengas ei selitä itseään. | arkki2 viestit |
| U9 | C | Kontekstimäärä esitetään kolmella tavalla (aivo + "89 k", "≈ 41 k", "92 k tokenia") ilman yhtä sanastoa (tiedostot vs. istunto). | arkki1, arkki4 |

## Katvealueet

Ei katselmoitu: chat-välilehti (testit lähettävät oikeita viestejä), asetukset, tumma tila, Dynamic Type,
vaakanäkymä. Ajossa testListaJaSkooppi ja testValilehdetJaInfraPuu kaatuivat ("chatit puuttuvat palkista",
"palkissa ei chatteja"): palvelulla ei ollut chat-istuntoja; ei design-löydös.

## Ehdotetut jatkopaketit

1. **DESIGN-ILME** — `Teema.swift`: yksi korostusväri ja värien merkitykset (I1, I5), välistys- ja kulmasädeasteikko
   (I8), otsikkotyylit (I2, I3). Ominaisuusskoopit ottavat sen käyttöön omissa näkymissään.
2. **DESIGN-UX-A** — A-löydökset U1–U4 omistajaskoopeille (`/vika`) tai designin toteutettaviksi käyttäjän päätöksellä.
3. **DESIGN-SKOOPPINAKYMA** — skoopin näkymän järjestys ja kieli (U5, U6, U8, U9) suunnitelmana.

## Toteutus: DESIGN-SKOOPPINAKYMA (14.10.2026)

- **U5** `Nakymat.swift`: järjestys Seuraava paketti → Konteksti → Istunnot → Toiminnot → Avoimet asiat → Viat → Rekisteri.
  Pitkät rivilistat jäävät toimintojen alle, jotta napit eivät valu ruudun ulkopuolelle.
- **U6** vahvistus kertoo seurauksen: "Avataanko skoopille uusi istunto?", "Pakataanko istunto?" (kirjaa työn ja
  seuraavan paketin rekisteriin, jää auki), "Siirretäänkö työ uuteen istuntoon?" (pakataan ja suljetaan). Napit
  samoilla verbeillä kuin rivit (Pura, Pakkaa, Siirrä).
- **U8** `Viestit.swift`: otsikon alla tila suomeksi (`istunnonTila`: busy → Työskentelee, waiting → Odottaa
  vastaustasi, idle → Vapaa; tuntematon sellaisenaan) ja konteksti aivomerkillä; käyttörajavalikko nimeää renkaat
  (ulompi keltainen 5 h, sisempi punainen viikko); auki oleva kysymyskortti vieritetään yläreunastaan näkyviin.
- **U9** yksi sanasto: istunnon mitattu konteksti = aivokuvake + "N k" (`KontekstiMerkki`), tiedostojen arvio =
  "Tiedostot ≈ N k"; sana "tokenia" vain Konteksti-näkymän selitteessä.
- **U7** (infran puu) ei kuulu tähän pakettiin: omistaja scopes infra.

Todennus (HEAD-worktree, simulaattori): testPakkaaIlmanIstuntoaLukittu (U5-järjestys, U6-teksti), testSkoopinKonteksti
ja testSkoopinVaihtoEiMustaa vihreitä. testKysymysKortti ohitettiin (ei auki olevaa korttia): kortin vieritys
todentamatta. Kuvat: `kuvat/skooppinakyma-2026-10-14/`.

## Katvealueet (DESIGN-KATVEALUEET, 14.10.2026)

Lähde: HEAD d091979a (iOS-lähteet puhtaat), iPhone 15 Pro -simulaattori Macilla, oikea palvelu. Kuvat otti
kertakäyttöinen lukeva kierrostesti (`testKatvePysty`/`testKatveVaaka`, vain scratch-kopiossa, ei repossa): lista,
tyhjä chat, agenttivalikko, skoopin viestit ja tiedot, infra, asetukset. Tumma tila ja tekstikoko vaihdettiin
`xcrun simctl ui <laite> appearance dark` ja `content_size accessibility-extra-large`; molemmat palautettiin
(light, large). Kuva-arkit: `kuvat/katvealueet-2026-10-14/` (vaalea-1–2, tumma-1–2, isoteksti-1–2, vaaka-lukittu).
Kolme ajoa, kaikki vihreitä.

Kattamatta: olemassa olevan chatin historia, koska palvelulla ei ollut chat-istuntoja (kierros ohitti kohdan).

| # | Alue | Vak. | Havainto | Kuva |
|---|---|---|---|---|
| K1 | vaaka | — | Vaakanäkymää ei ole: äppi on lukittu pystyyn (`scopes/ios/project.yml:31` `UISupportedInterfaceOrientations: [Portrait]`, 457d30a1). Vaaka-ajon kuvat ovat pystykuvia. Vaakatuki on käyttäjän päätös, ei löydös. | vaaka-lukittu |
| K2 | tumma | — | Tumma tila toimii: ei kovakoodattuja vaaleita pintoja, turkoosi #2DD4BF erottuu, infran laajennusnappi ja asetusarkki luettavia. | tumma-1–2 |
| K3 | tumma | C | Kontekstimerkki (aivo + "163 k") on yhä iOS:n sininen turkoosin korostuksen vieressä; sama avoin `.blue`-valinta kuin Ilmejärjestelmä-rivillä. Herätyskytkimen valkoinen nuppi kirkkaalla turkoosilla radalla erottuu heikosti. | tumma-1, tumma-2 |
| K4 | iso teksti | A | Sivupalkin alapalkki ("Infra", "Ase-tuk-set" kolmella rivillä) kasvaa ja peittää listan alimman skoopin merkkirivin; ruudulle mahtuu kaksi skooppia. U2:n korjaus pätee vain oletuskoossa. | isoteksti-1 |
| K5 | iso teksti | B | Suodatinpillerit katkeavat ("Sco…", "C…"), eikä valintaa voi lukea. | isoteksti-1 |
| K6 | iso teksti | B | Numerot rivittyvät kesken: merkkirivin "2 / 2" ja "1 / 76 k", kontekstirivin "13 / 1 k" (131 k). Luku hajoaa kahdelle riville, eikä se enää lue lukuna. | isoteksti-1, isoteksti-2 |
| K7 | iso teksti | B | Pakettitunnukset tavutetaan kesken sanan (`UUDELLEENKA`/`YNNISTYS`, `DESIGN-`/`KATVEALUEET`); I3 pahenee. Infran laajennusnappi kapenee rivin vieressä kapeaksi sarakkeeksi. | isoteksti-1, isoteksti-2 |
| K8 | iso teksti | C | Asetusten palvelinosoite katkeaa ("http://192.0.2.…."); kontekstirajan säädin pysyy pienenä ja selite rivittyy ("Konteksti ≥ / 100 k"). | isoteksti-2 |
| K9 | chat | B | Agenttivalikossa paikalliset mallit näkyvät tiedostoniminä (`qwen3.5-9b-q4_k_m.gguf`) Clauden mallinimien rinnalla, ja osion otsikko on konenimi `palvelin`. | vaalea-1 |
| K10 | skooppi | B | Istunnon tila "shell" näkyy raakana otsikon alla ja Istunnot-rivillä: `istunnonTila` (`scopes/ios/Sources/Nakymat.swift:550`) tuntee vain busy/waiting/idle, mutta Claude Code kirjoittaa myös `shell` (istunto ajaa taustakomentoa; `~/.claude/sessions/*.json` 14.10.2026: busy 5, idle 11, waiting 3, shell 1). | vaalea-1, isoteksti-1 |
| K11 | asetukset | C | Avain-kenttä näkyy tyhjänä ilman pisteitä tai paikkamerkkiä, vaikka yhteys toimii: käyttäjä ei näe, onko avain tallennettu. | vaalea-2, isoteksti-2 |
| K12 | asetukset | C | Asetukset avautuvat arkkina, jossa on Peru/Tallenna ja iso otsikko; muut näkymät ovat navigointipinossa (I2:n jatke). | vaalea-2 |

Ehdotus: K4–K7 (iso teksti) yhdeksi paketiksi DESIGN-ISOTEKSTI: alapalkki `ViewThatFits`/ikonit isolla koolla,
pillerit ja merkkirivi `dynamicTypeSize(...accessibility2)`-rajalla tai pystyyn pinottuna, numerot `fixedSize()`/
`lineLimit(1)`. K10 on yhden rivin korjaus designin omaan `istunnonTila`an ("shell" → "Ajaa komentoa"). K9 kuuluu
skoopille scopes chat (`/vika`). K1 on käyttäjän päätös (tuetaanko vaakaa).
