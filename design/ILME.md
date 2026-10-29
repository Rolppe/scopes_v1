# Skoopit-äpin ilme (DESIGN-ILME, 14.10.2026)

Lähde: `scopes/ios/Sources/Teema.swift` (omistaja scopes design). Löydökset: `KATSELMUS.md` I1–I8.

## Päätökset

- Korostusväri on turkoosi (käyttäjä 14.10.2026: "Ei käytetä claude väriä. Käytetään turkoosia"). Vaalea tila
  `#0F766E` (5,5:1 valkoisella), tumma tila `#2DD4BF` (9,1:1 mustalla). Puhdas turkoosi `#40E0D0` olisi tekstinä
  valkoisella vain 1,7:1. Clauden oranssi (`Color.claude`) poistuu käytöstä.
- Jokaisella värillä on yksi merkitys: korostus = toiminto/valinta, oranssi = avoimet viat, punainen = virhe.
- Välistys 4 pt:n askelin (4/8/12/16/24), kulmasäteet 8/14/24, pillerit ja pyöreät napit Capsule/Circle.
- Tekstit Dynamic Type -tyyleinä; paketin tunnus nimeä kevyempi (`Teema.Teksti.tunnus`).

## Käyttöönotto omistajaskoopeittain

Rivinumerot: commit db2ee4dd. Ominaisuusskooppi tekee muutoksen omaan tiedostoonsa.

| Omistaja | Tiedosto | Muutos |
|---|---|---|
| scopes lista | `Juuri.swift:14` | `WindowGroup { … }.tint(Teema.korostus)`; tämä yksin vaihtaa kaikki `accentColor`-käytöt ja järjestelmän napit turkoosiksi |
| scopes lista | `Sivupalkki.swift:136` | valittu suodatin `Teema.korostus` + teksti `Teema.korostusPaalla`, muut `Teema.passiivinen` |
| scopes lista | `Sivupalkki.swift:201,203` | kansio `Teema.kansio`, hehku `Teema.korostus` |
| scopes lista | `Sivupalkki.swift:85` | valittu rivi `Teema.korostusTausta` |
| scopes chat | `Viestit.swift:150,279` | `Color.claude` → `Teema.korostus` (lähetysnappi, valittu agentti); `Viestit.swift:300–301` `Color.claude` poistetaan |
| scopes chat | `Viestit.swift:38` | oma viesti `Teema.korostusTausta` |
| scopes infra | `Infra.swift:67` | laajennusnapin tausta `Teema.korostusTausta`, kulma `Teema.Kulma.pieni` |
| kaikki | kovakoodatut paddingit ja kulmat | `Teema.Vali` ja `Teema.Kulma` seuraavan kosketuksen yhteydessä |

## Tila 14.10.2026

Käyttöönotto tehty tässä skoopissa (käyttäjä: "Tee itse tässä"): `Juuri.swift` `.tint`, `Sivupalkki.swift`, `Viestit.swift`
(`Color.claude` poistettu), `Infra.swift`. Simulaattoriajo: samat kaksi testiä punaisena kuin ennen muutosta
(testListaJaSkooppi, testValilehdetJaInfraPuu: palvelulla ei chat-istuntoja), muut vihreitä. Kuva:
`kuvat/katselmus-2026-10-14/ilme-jalkeen.jpg`.

Kontekstimerkki (`Nakymat.swift:17`) on `Teema.toissijainen` (DESIGN-KONTEKSTIVARI; käyttäjä valitsi harmaan
14.10.2026): tieto, ei toiminto, joten se ei käytä korostusta; sama väri kuin skoopin näkymän istuntorivien merkeillä.
Simulaattoriajo 14.10.2026 (iPhone 15 Pro): testKaynnistysAvaaListan, testSkoopinKonteksti ja muut vihreitä; punaiset
eivät koske väriä — testListaJaSkooppi (ennestään), testPakkaaIlmanIstuntoaLukittu (käynnissä oleva palvelu ei vielä
tarjoa 8ff5b35b:n Automaattijatko-kytkintä), testInfraJarjestys (scopes infran commitoimaton testi).

## Viimeistely (DESIGN-ILME-VIIMEISTELY, 14.10.2026)

- Välit ja kulmat `Teema.Vali`/`Teema.Kulma`-arvoina `Viestit.swift`, `Sivupalkki.swift`, `Nakymat.swift`, `Liitteet.swift`
  ja `MerkkiRivi`. Ruudukon ulkopuoliset arvot pyöristettiin lähimpään askeleeseen: kysymyskortin kulma 28 → 24 ja rivit
  18 → 16, kirjoituskentän reunus 14 → 16, suodatinpillerin vaakareunus 20 → 16, kupla 10 → 12. Alle 4 pt:n hiusvälit
  (2, 1) jäivät. Osuuspalkki on Capsule kuten linjapalkki. `Infra.swift` jäi: scopes infra muokkasi sitä samaan aikaan.
- K3: kytkimet (`Toggle`) käyttävät `Teema.kytkin`ia — korostuksen vaalea sävy molemmissa tiloissa, koska valkoinen nuppi
  katoaa tumman tilan kirkkaalle sävylle (#2DD4BF valkoisella 1,6:1, #0F766E 5,5:1). Kontekstimerkki harmaaksi
  DESIGN-KONTEKSTIVARIssa (Tila yllä).
- K8: palvelinosoite rivittyy (enintään 3 riviä, rivinvaihto suodatetaan); kontekstirajan selite on lyhyt `≥ 100 k`
  (otsikko kertoo lajin), saavutettavuusnimi pysyy `Konteksti ≥ …`.
- K11: Avain-osion alateksti kertoo, onko avain annettu ja sen pituuden (ei sisältöä).
- K12: ei muutosta. Asetukset on muokkausarkki, jonka Peru palauttaa myös Ulkoasu-alavalikon heti näkyvät muutokset
  (DESIGN-ULKOASU); navigointipinossa Perulle ei olisi paikkaa.

## Ulkoasu-asetus (DESIGN-ULKOASU, 14.10.2026)

Käyttäjä 14.10.2026: "ulkoasu valikko mistä saa valita korostus värit ja apple glass tyyli ja muut tarvittavat".
Lähde `scopes/ios/Sources/Ulkoasu.swift`; Asetukset → Ulkoasu.

- Korostusväri valittavissa: turkoosi (oletus), sininen, indigo, violetti, pinkki, vihreä, grafiitti. Jokainen vaalea
  sävy ≥ 4,5:1 valkoisella ja ryhmätaustalla, tumma ≥ 7:1 mustalla. Oranssi ja punainen eivät ole valittavissa
  (varoitus ja virhe). `Teema.korostus` lukee valinnan; Observation piirtää lukevat näkymät uudelleen.
- Teema: järjestelmä / vaalea / tumma, ikkunan `overrideUserInterfaceStyle`:nä (kattaa arkit; `preferredColorScheme(nil)`
  ei palaa järjestelmään kesken ajon).
- Liquid Glass (oletus päällä, iOS 26+): suodatinnapit, lähetysnappi, kirjoituskenttä ja infrapuun laajennusnapit
  `View.lasiPinta`-muokkaimella; pois = tasaiset värit. Järjestelmän palkit ovat lasia iOS 26 -SDK:lla joka tapauksessa.
- Muutos näkyy heti; Tallenna säilyttää, Peru ja arkin alasveto palauttavat avaushetken tilan.

Todennus: Macin iPhone 15 Pro (iOS 27) -simulaattori, `testUlkoasu` + `testAsetustenAlavalikot` exit 0, regressio
(testKaynnistysAvaaListan, testAlapalkkiEiPeitaListaa, testChatVastaa, testSkoopinKonteksti, testUusiSkooppiTarkistaaNimen)
exit 0. Kuva-arkki `kuvat/ulkoasu-2026-10-14/arkki.jpg`.

## Tekstikoko ja kirjasin (DESIGN-FONTTI, 14.10.2026)

Käyttäjä 14.10.2026: "fontti pitää pystyä säätämään kolmessa eri asteessa … selvitä parhaat fontit ja mieti mitkä kohdat
on ne missä fontti kuuluu vaihtua ja missä ei". Valinnat: tasot suhteessa iPhonen tekstikokoon; kirjasimen valinta viesteille.
Lähde `scopes/ios/Sources/Ulkoasu.swift` (`Tekstikoko`, `Viestifontti`); Asetukset → Ulkoasu → Teksti.

- Koko: Pieni / Normaali / Suuri = iPhonen koko −1 / ±0 / +1 Dynamic Type -askelta (oletuskoossa leipäteksti 16 / 17 / 19 pt;
  +2 = 21 pt oli puhelimessa liian suuri, käyttäjä 14.10.2026),
  juuressa `.tekstikoko()` (`Juuri.swift`). Saavutettavuuskoot toimivat, koska taso siirtää käyttäjän omaa kokoa.
  Toimii, koska äpissä ei ole kiinteitä pistekokoja: kaikki tekstit ovat Dynamic Type -tyylejä.
- Kirjasin: SF Pro (oletus) / SF Rounded / New York, vain viestikuplassa ja kysymyskortissa (`.viestifontti()`). Järjestelmän
  omia muotoja: ei pakattuja fontteja eikä lisenssejä, optiset koot säilyvät. Inter ja JetBrains Mono hylättiin: pakattava,
  kytkettävä Dynamic Typeen käsin, hyöty pieni SF Prohon nähden.
- Kirjasin ei vaihdu: valikot, palkit, listat, lomakkeet (järjestelmän SF Pro), koodi ja polut (SF Mono, `.monospaced`),
  työkalurivit chatissa (mono), luvut (`.monospacedDigit`, pitää sarakkeet linjassa).
- Koko kasvaa: viestit, kirjoituskenttä, kysymyskortti, listarivit, skoopin näkymä, rekisteri, konteksti, asetukset.
- Koko kasvaa kattoon asti: yläpalkin suodatinpillerit (`large`, palkin korkeus kiinteä), alapalkki (`xxxLarge`),
  infrapuun laajennusnappi (`xLarge`), Ulkoasun esikatselu (`xxLarge`).
- Koko ei kasva yli `xxLarge`: kuvakkeet kiinteissä kehyksissä — lähetä, pysäytä, toista, liite (32×32), kysymyskortin
  nuolet (36×36) ja X (44×44); muuten kuvake leikkautuisi kehykseen.
- Jäljellä: `Teema.Teksti`-tokenit (`tunnus`, `osio`, `merkki`) ovat käyttämättä ja `Nakymat.swift` käyttää `.headline`a
  nimelle; yhtenäistys seuraavan kosketuksen yhteydessä (Nakymat/Infra olivat toisen istunnon muokattavana 14.10.2026).
- Arkit (Asetukset, Uusi skooppi) eivät peri juuren kokoa, joten ne saavat oman `.tekstikoko()`n; muokkain lukee iPhonen koon
  UIKitistä (`preferredContentSizeCategory`), jotta kahdesti käytetty muokkain ei siirrä kokoa kahdesti.
- Todennus 14.10.2026, Macin iPhone 15 Pro (iOS 27) -simulaattori: `FonttiUITests` (testFonttiAsetusJaPeru, testFonttiKuvat),
  `testUlkoasu` ja `testKaynnistysAvaaListan` exit 0. Teksti-osio on Ulkoasun viimeinen, koska ylempänä se työnsi korostusvärit
  pois testUlkoasun ulottuvilta. Kuvat `kuvat/fontti-2026-10-14/` (Pieni/Suuri × SF Pro/New York/SF Rounded: lista, skooppi,
  kysymyskortti, Ulkoasu). Puhelimessa ei vielä todennettu.
