# scopes/design/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 14.10.2026

## Tarkoitus ja raja

Skoopit-äpin (`scopes`) design (käyttäjä 14.10.2026: "Molemmat"): (1) visuaalinen ilme — värit, typografia, ikonit, välistykset ja yhteiset SwiftUI-komponentit kaikille välilehdille; (2) UX-suunnittelu — välilehtien rakenne, navigointi ja käyttövirrat (chat, skoopit, infra, asetukset) ennen toteutusta. Raja: ominaisuuksien toiminta (data, rajapinta, yhteys) kuuluu ominaisuuden alaskoopille (`scopes chat`, `scopes lista`, `scopes infra`, `scopes hallinta`, …); design omistaa yhteisen ilmeen ja suunnitelmat, ja ominaisuusskooppi toteuttaa näkymänsä niiden mukaan.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes design` luotiin komennolla `/pura uusi scopes design`.
- **Käyttäjä 14.10.2026:** tarkoitus = visuaalinen ilme ja UX-suunnittelu ("Molemmat").
- **Käyttäjä 14.10.2026:** ensimmäinen työ = nykytilan katselmus (DESIGN-KATSELMUS); vaihtoehdot ilmejärjestelmä ja UX-suunnitelma jäivät myöhemmiksi.
- **Käyttäjä 14.10.2026:** katselmuksen jälkeen seuraava paketti = DESIGN-ILME (ohitettiin DESIGN-UX-A ja DESIGN-SKOOPPINAKYMA).
- **Käyttäjä 14.10.2026:** korostusväri turkoosi, ei Clauden oranssia ("Ei käytetä claude väriä. Käytetään turkoosia"); sävyt ja perustelu `ILME.md`.
- **Käyttäjä 14.10.2026:** teeman käyttöönotto tehdään scopes designissa ("Tee itse tässä"), myös lista-, chat- ja infraskooppien tiedostoissa.

- **14.10.2026:** Käyttäjä 14.10.2026: tarkoitus = visuaalinen ilme ja UX-suunnittelu ("Molemmat").

- **14.10.2026:** Käyttäjä 14.10.2026: ensimmäinen työ nykytilan katselmus; sen jälkeen DESIGN-ILME.

- **14.10.2026:** Käyttäjä 14.10.2026: "Ei käytetä claude väriä. Käytetään turkoosia" → korostus #0F766E vaalea / #2DD4BF tumma.

- **14.10.2026:** Käyttäjä 14.10.2026: teeman käyttöönotto tehdään scopes designissa ("Tee itse tässä (suositus)"), myös lista-, chat- ja infraskooppien tiedostoissa; vaihtoehto /vika-rivit omistajille hylättiin.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti DESIGN-UX-A (ohitettiin DESIGN-ILME-VIIMEISTELY ja DESIGN-SKOOPPINAKYMA).

- **14.10.2026:** Chat-testit jätettiin katselmuksesta pois, koska ne lähettävät oikeita viestejä agenteille.

- **14.10.2026:** Käyttäjä valitsi 14.10.2026 seuraavaksi paketiksi DESIGN-SKOOPPINAKYMA (ohitettiin DESIGN-ILME-VIIMEISTELY ja katvealueiden katselmus).

- **14.10.2026:** DESIGN-UX-A tehtiin designissa myös lista-, infra-, yhteys- ja testiskooppien tiedostoissa, koska rekisterin paketti nimesi polut scopes/ios/Sources/** ja käyttäjä valitsi sen; omistajat saivat tiedoksi /vika-rivit.

- **14.10.2026:** Toiminnot Istunnot-osion jälkeen, ei aivan loppuun: pitkät rivilistat työntäisivät napit ruudun ulkopuolelle.

- **14.10.2026:** U7 (infran puu) ei kuulu pakettiin: omistaja scopes infra; jää KATSELMUS.md:hen.

- **14.10.2026:** Seuraava paketti DESIGN-KATVEALUEET: käyttäjän valinta 14.10.2026 (vastaus AskUserQuestioniin).

- **14.10.2026:** Käyttäjä 14.10.2026 (AskUserQuestion-vastaus): seuraava paketti DESIGN-ISOTEKSTI (ohitettiin DESIGN-ILME-VIIMEISTELY ja "ei seuraavaa").

- **14.10.2026:** Vaakatuki (K1) on käyttäjän päätös, ei löydös; ei kysytty vielä.

- **14.10.2026:** Palkkien (alapalkki, suodatinpillerit) koko rajataan järjestelmäpalkkien tapaan + large content viewer, ei ikonimoodia.

- **14.10.2026:** Käyttäjä hylkäsi seuraavan paketin valintakysymyksen ja antoi tilalle tehtävän (alla); se on seuraava paketti DESIGN-ULKOASU.

- **14.10.2026:** Oranssi ja punainen eivät ole valittavissa (varoitus ja virhe, ILME.md).

- **14.10.2026:** Teema ikkunan tyylinä, ei preferredColorScheme (nil ei palaa järjestelmään kesken ajon).

- **14.10.2026:** Ulkoasu näkyy heti; Tallenna säilyttää, Peru palauttaa (yhtenäinen asetusten Peru/Tallenna-mallin kanssa).

- **14.10.2026:** Seuraava paketti DESIGN-ILME-VIIMEISTELY: käyttäjän valinta 14.10.2026 (AskUserQuestion).

- **14.10.2026:** Käyttäjä 14.10.2026 (AskUserQuestion-vastaus): kontekstimerkki harmaaksi (`Teema.toissijainen`), seuraava paketti DESIGN-KONTEKSTIVARI.

- **14.10.2026:** K12 pidetään arkkina (Peru palauttaa Ulkoasun heti näkyvät muutokset).

- **14.10.2026:** Ruudukon ulkopuoliset arvot lähimpään 4 pt -askeleeseen.

- **14.10.2026:** Käyttäjä 14.10.2026 klo 12.19: vaakatuki (K1) — "Vaaka tuki chat näkymässä ja lista näkymässä". K1 ei enää odota käyttäjää: siitä tulee paketti DESIGN-VAAKATUKI (UISupportedInterfaceOrientations `scopes/ios/project.yml:31` + chat- ja listanäkymän asettelu vaakassa, simulaattoriajo). Muut näkymät (esim. asetukset, infra) eivät kuuluneet pyyntöön.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti = "Lasipinnat laitteella".

- **14.10.2026:** Käyttäjä 14.10.2026: valittu suodatin saa olla täysin sävytettyä lasia ("jos kuuluu olla niin annetaan olla").

- **14.10.2026:** Käyttäjä 14.10.2026: infranappi Applen tavalla (pelkkä nuoli, ei taustaa) — tehty 60a3e7ef.

- **14.10.2026:** Käyttäjä valitsi seuraavaksi: lasipinnat jatkuu.

- **14.10.2026:** Kynää ei lisätä skoopin viestinäkymään (käyttäjä 14.10.2026).

- **14.10.2026:** Tasaisessa tilassa yläpalkin napeista pois lasiefekti (käyttäjä: "Poista kapselista glass efekti"); toteutus: kapseli piilotetaan kokonaan (ei tasaista kapselia tilalle).

- **14.10.2026:** Vaaka sallittu koko äppiin; Infra ja Asetukset kääntyvät myös — lukitus pystyyn on käyttäjän päätös (kysytään tarkistuksessa).

- **14.10.2026:** Kääntö palkki auki: ei uutta sumeaa kuvaa (sisältäisi palkin) → pelkkä himmennys kääntöön asti.

- **14.10.2026:** käyttäjä: Infra ja Asetukset saavat kääntyä vaakaan (ei pystylukitusta).

- **14.10.2026:** käyttäjä: vaakassa syöttökenttä alkaa yhdeltä riviltä eikä siinä ole play-, pause-, lähetys- eikä +-nappia; lähetys näppäimistön lähetysnäppäimellä. Elävä sumennus vain käännön jälkeiseen tilaan (kuvapohjainen sumeus pysyy muuten, raskaus vain yhden sulkuliukuman ajan).

- **14.10.2026:** Käyttäjä 14.10.2026: tasot suhteessa iPhoneen (ei kiinteitä 16/17/21 pt); kirjasimen valinta viesteille (ei koko äpille, ei pelkkä SF Pro).

- **14.10.2026:** Kirjasin ei vaihdu: valikot, palkit, listat, lomakkeet (SF Pro), koodi/polut/työkalurivit (SF Mono), luvut (monospacedDigit). Inter/JetBrains Mono hylätty (pakattava, Dynamic Type käsin).

- **14.10.2026:** Koon katot säilyvät: suodatinpillerit large, alapalkki xxxLarge, infran laajennusnappi xLarge, esikatselu xxLarge.

- **14.10.2026:** Tekstikoon asteikko 16 / 17 / 19 pt (käyttäjä 14.10.2026). Hylätty 16 / 17 / 18: 18 pt ei osu Dynamic Type -asteikolle (body 17 → 19), vaatisi oman skaalauksen (`Font.system(size:relativeTo:)`, ~52 fonttikutsua).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| UX-löydökset U5–U9 | kesken b26680a9 14.10.2026 (U5, U6, U8, U9 tehty; U7 avoin; kirjattu `KATSELMUS.md`:hen); odottaa skooppia scopes infra | U7 omistaja scopes infra; kortin vieritys (U8) todennetaan, kun jossain skoopissa on auki oleva kysymyskortti (testKysymysKortti) |
| Skoopin näkymän kysymyskortin vieritys (testKysymysKortti) | avoin | kortin vieritys todentamatta (testKysymysKortti ohitettu, ei auki olevaa korttia; testSkoopinKonteksti ja testSkoopinVaihtoEiMustaa vihreitä, testPakkaaIlmanIstuntoaLukittu korjattu ja uusinta vihreä 14.10.2026) |
| Teema.Teksti-tokenien yhtenäistys | avoin; odottaa skooppia scopes infra | Nakymat/Sivupalkki-rivien nimet ja tunnukset tokeneiksi, kun scopes infran commitoimattomat Nakymat.swift/Infra.swift-muutokset on commitoitu |

## Viat

| Vika | Tila |
|---|---|
| V-374 → claude siirto: pura-sovitinreitti exit 0 tyhjällä raportilla | avoin |

## Historia

Historia: `scopes/design/HISTORIA.md`, ei lueta purussa.
