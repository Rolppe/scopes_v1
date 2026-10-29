# scopes/architecture/REKISTERI.md

Tilanne: 21.10.2026

SEURAAVA PAKETTI: ei mitään — kysytty 21.10.2026: ei nyt (alasajo odottaa käyttäjää; ARK-16, ARK-17 ja ARK-19 etenevät toteutussuunnitelmassa; arkkitehtuuri vastaa sen kysymyksiin)

## Tarkoitus ja raja

Scopes-äpin monialusta-arkkitehtuuri (iOS, macOS, Linux, Windows, Android): tilan omistus, laitteiden välinen täysi synkka, muutosten välitys, LR:n rooli, laitetunnistus, jaettu asiakasydin ja palvelun suorituskyky. Omistaa arkkitehtuuripäätökset; alustaskoopit toteuttavat.

Raja: polut `scopes/architecture/**` (esitiedot, suunnitelma, päätökset). Koodimuutokset tehdään omistajaskoopeissa (`scopes ios`, `scopes macos`, palvelu, `scopes localregister`, tulevat Linux/Windows/Android); tämä skooppi kirjaa niille paketit. Ei kata visuaalista ilmettä eikä UX:ää (`scopes design`).

Esitiedot: `scopes/architecture/ESITIEDOT.md` (tunnisteet E-xx, kysymykset K-x). Suunnitelma: `scopes/architecture/SUUNNITELMA.md` (päätökset K-1…K-8, paketit ARK-01…ARK-15). Ei lueta purussa.

## Päätökset

- **Käyttäjä 19.10.2026:** skooppi `scopes architecture` luotiin `luo-skooppi.mjs`:llä `scopes macos` -keskustelusta. Käyttäjä ehdotti nimeä `scopes design architecture` ja jätti nimen ja polun päätettäväksi; valittiin sisarskooppi, koska `scopes design` rajaa datan, rajapinnan ja yhteyden pois.
- **Käyttäjä 19.10.2026:** työ etenee vaiheittain: tiedonhaku (valmis, ESITIEDOT.md) → suunnittelu (tämä skooppi, Fable) → toteutus.
- **Käyttäjä 19.10.2026:** alustat iOS, macOS, Linux, Windows ja Android; kaikki asennetut alustat täydessä synkassa laitteelta toiselle siirryttäessä.
- **Käyttäjä 19.10.2026 (K-1, K-1b):** solmuverkko: jokainen oma laite on täysi solmu ja palvelin toisilleen, myös puhelimet; kaikki äpin data replikoidaan ja Claude-transkriptit peilataan lisäyksinä; äppi voi olla headless-tilassa ilman UI-tilan synkkaa.
- **Käyttäjä 19.10.2026 (K-3):** äpin tila erilliseen tilavarastoon ytimessä (LWW); LR pysyy rekisterien synkkamoottorina.
- **Käyttäjä 19.10.2026 (K-4, K-4b):** UI Swiftillä Applelle ja yhdellä web-asiakkaalla (Tauri 2) muille; solmuydin Rustilla kaikille alustoille, Node-palvelu jää Claude-koneiden adapteriksi.
- **Käyttäjä 19.10.2026 (K-5, K-7):** laiteavainpari ja paritus, allekirjoitettu pyyntö, yhteinen Bearer-avain poistuu; WireGuard-peer per laite käyttöjärjestelmän asiakkaalla, `wg-asetus`-reitti pois HTTP:ltä.
- **Käyttäjä 19.10.2026 (K-6):** suorituskyky ensin (ARK-01) ennen virtaa ja ydintä.
- **Käyttäjä 19.10.2026 (K-8):** mallimoottori solmuytimessä (llama.cpp Rust-sidoksella), keskustelu synkattavaa dataa, `models` omistaa mallivalinnan.
- **Käyttäjä 19.10.2026 (K-9, välitetty `scopes macos` -keskustelusta):** uusi äppi on **scopes-V2**, erillinen äppi ja erillinen rakenne (`scopes2/**`, oma bundle-id, ydin omassa portissa, ei 8787). Vanha scopes-äppi ja Node-palvelu 8787:ssä pysyvät koskemattomina ja ajossa rinnalla, kunnes V2 on toimiva; vanhan alasajo on käyttäjän erillinen päätös. Vaikutus: ARK-01…ARK-03 (vanhan palvelun ja äppien paikallaan-muutokset) poistuvat V2-polulta; ARK-06 ja ARK-08 muuttuvat (oma portti ja adapteri `scopes2/adapteri`, uudet äpit `scopes2/ios|macos|shared`, lukusilta vanhaan 8787:ään); ARK-12 aikaistuu ennen uusia äppejä. Kirjattu SUUNNITELMA.md:n lukuihin 1, 7, 9 ja 10. Tämä on esiehto `scopes toteutussuunnitelma` -paketille TOTEUTUSSUUNNITELMA-SCOPES2.
- **Suunnittelija 19.10.2026 (K-2, käyttäjän valtuutus):** muutosloki + SSE-virta versiokursorilla sekä UI:lle että solmujen replikointiin; WebSocket ja pitkä pollaus hylätty (SUUNNITELMA.md luku 4).

- **19.10.2026:** Hylätyt vaihtoehdot (eivät suunnitelmassa): K-1b "työpöydät solmuja, puhelimet replikoita" ja "vain palvelin solmu"; K-3 LR:n uusi yksikkölaji; K-4 Kotlin Multiplatform, Swift kaikille, web kaikille; K-4b kolme toteutusta (Node/Swift/Kotlin), nodejs-mobile; K-5 yhteinen avain + laite-id; K-6 rinnakkain, synkka ensin; K-7 Tailscale, HTTPS julkiseen; K-8 vain täydet solmut ajavat, täysin laitekohtainen; K-2 WebSocket ja pitkä pollaus (perustelu SUUNNITELMA luku 4).

- **19.10.2026:** Uudet skoopit suunnitelmassa, ei vielä luotu (K-9:n jälkeen `scopes2`-etuliitteellä): `scopes2 ydin` (scopes2/ydin/**), `scopes2 adapteri`, `scopes2 shared`, `scopes2 ios`, `scopes2 macos`, `scopes2 web`, `scopes2 linux`, `scopes2 windows`, `scopes2 android`.

- **19.10.2026:** Paketit kirjataan omistajaskooppien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) → seuraava paketti ARCHITECTURE-JAKELU.


- **19.10.2026:** Suunnittelija 19.10.2026 (K-9:n seuraus): ARK-01…ARK-03 (vanhan palvelun ja äppien paikallaan-muutokset) eivät ole V2-polulla; ne jäävät vanhan ylläpidon paketeiksi vain käyttäjän erillisestä pyynnöstä. Suorituskyky (K-6) ja virta (K-2) toteutetaan ytimessä (ARK-04) ja uudessa adapterissa (ARK-06). ARK-12 aikaistetaan ennen ARK-08:aa, jotta V2 näkee samat rekisterit. V2-portin valinta jätetään `scopes toteutussuunnitelma`-skoopille.

- **Käyttäjä 19.10.2026 (ARCHITECTURE-JAKELU = toteutussuunnitelman H-4, välitetty `scopes macos` -keskustelusta: "Tee järjestelyt ajon aloittamiseksi"):** skoopit `scopes2 ydin` ja `scopes2 adapteri` olivat jo luotu (f8cff4d2, H-3), joten niitä ei luotu uudelleen. Kirjattu omistajille: `scopes2 ydin` ARK-04, ARK-05, ARK-06:n ytimen osa (T-23, T-30, T-35), ARK-07, ARK-12, SEURAAVA YDIN-ARK04-T16G (H-1 rustup kysytään luvalla alussa); `scopes2 adapteri` ARK-06:n adapterin osa (T-24-G, T-29, T-25, T-34), SEURAAVA ADAPTERI-ARK06-T24G. ARK-01…ARK-03 eivät kuuluneet jakeluun.

- **19.10.2026:** ARK-numerot säilytetty (ei uudelleennumerointia), muuttuneet rivit merkitty "(K-9: …)".

- **19.10.2026:** Hylätty: vanhan palvelun muuttaminen proxyksi tai siirto 8788:aan (alkuperäinen ARK-06), MULTI-01-laajennus vanhoihin äppeihin (alkuperäinen ARK-08).

- **Käyttäjä 20.10.2026 (V-586, välitetty `scopes macos` -istunnosta, AskUserQuestion "Hyväksyn kaikki"):** (1) ARK-16 (adapteri ottaa toiminnot `viesti`/`liite`/`stop`/`pura`… ennen vanhan alasajoa, P-9-tuonnit kopioiksi) on arkkitehtuurin paketti → SUUNNITELMA.md luku 9 (vaihe 3, ARK-16-rivi), omistaja `scopes2 adapteri`, riippuu ARK-08:sta (T-51). (2) H-16: fyysiseen iPhoneen replikoidaan transkriptipeilistä aikaikkuna, ei koko 2,5 Gt:n peiliä → K-10 (luku 1) ja luku 8. Käyttäjä jätti ikkunan koon arkkitehtuurin ehdotettavaksi (tämä keskustelu 20.10.2026).
- **Suunnittelija 20.10.2026 (K-10:n mitoitus, ehdotus):** 7 vrk viestitekstiä + johdetut näkymät kaikista istunnoista, katto 38 Mt, raakarivit ja vanhemmat haetaan pyynnöstä täydeltä solmulta; laitekohtainen asetus. Perustelu mittauksesta palvelimella 20.10.2026: raakarivejä 1–340 Mt/vrk (koko peili 2,6 Gt, `ydin.db` 2,8 Gt), viestitekstiä 0,1–7,3 Mt/vrk ja liukuva 7 vrk enintään 20,7 Mt. E-20:n 38 Mt oli vain elävien istuntojen koko. Hylätty: koko peili (2,6 Gt kasvaa satoja Mt/vrk), raakarivien aikaikkuna (yksi vilkas vuorokausi 340 Mt ylittää katon).
- **Käyttäjä 20.10.2026 (tämä keskustelu, "hyväksyn"):** K-10:n mitoitus hyväksytty sellaisenaan (7 vrk viestitekstiä + johdetut näkymät, katto 38 Mt, laitekohtainen asetus) → toteutuspaketti ARK-17 (`scopes2 ydin` + `scopes2 ios`, SUUNNITELMA luku 9, riippuu ARK-08:sta ja ARK-05:stä).
- **Käyttäjä 20.10.2026 (V-583, tämä keskustelu, "Hyväksyn"):** K-11 macOS-äpin Kehitys-osio: näyttö hereillä -kytkin (herätys `IOPMAssertionDeclareUserActivity` + `PreventUserIdleDisplaySleep`) ja vain luettava diagnostiikka; tunneli, kertakäyttöavain ja `SCOPES2_DATA` jäävät gatelle; gate käyttää käynnistysargumenttia `-scopes2.naytto-hereilla YES`, `caffeinate` pois. Toteutus ARK-18 (`scopes2 macos` + `scopes2 shared`), V-584:n sisältö. Hylätty: koeytimen osoite ja data-hakemisto muokattaviksi asetuksiksi (tilapäistä gaten tilaa, P-14).

- **20.10.2026:** Ei uusia päätöksiä. Alasajo ei ole ajettavissa nyt (esiehdot täyttymättä); rivi pysyy "odottaa käyttäjää".
- **Suunnittelija 20.10.2026 (V-614, S-9b-tarkastus):** S-9b (0a295851) hyväksytään kahdella korjauksella, jotka on kirjattu SUUNNITELMA.md:n luvun 8 sääntöinä: (1) ikkunoitu solmu ei ole peilin lähde: sen `/api/listat` ja `/api/hae` eivät palauta ikkunoitua polkua, ja täysi solmu ohittaa ikkunoidut polut myös virran soveltamisessa (`sovella`). Muuten riisuttu yksikkö jää täyteen solmuun alkuperäisellä versiolla eikä korjaudu, koska tiiviste on sisältösokea (`varasto.rs:290-303`). (2) Vetohaun alaraja = max(ikkunan raja, katon karsintaraja), ja karsintaraja säilyy sisäisessä polussa. Muuten katon takia karsitut yksiköt haetaan joka kierroksella, ja T-55:n kahden prosessin testi (katto 1 Mt, "hakee 0") ei voi mennä läpi. `ikkunoidut`-kenttä itsessään sopii lukuun 8: se kertoo, että polku on ikkunoitu, mutta ei ikkunaa. Toteutussuunnitelman S-9:n ja T-55-briefin päivitys kuuluu sen omistajalle (TYÖTAVAT 15).
- **Suunnittelija 21.10.2026 (sillan muut reitit, toteutussuunnitelman kysymys 31e16080 luku 11.6 scopes overseerin kautta):** kaikilla S-6:n siltalistan reiteillä on päätös (SUUNNITELMA.md luku 9). ARK-16:een kuuluvat `malli`, `uusi`, `agentit` (chatin mukana) ja asetusten muuttaminen (lukeminen ytimestä adapterin peilinä). Ytimeen kuuluu `kayttoraja`. Uusi ARK-19 sisältää `android*`:n (luku ytimestä, ohjaus adapterissa) ja `palvelin*`:n. Pois V2:sta jäävät `arkistoi`, `viat`, `diagnostiikka` ja `kordinaattori*`, koska niillä ei ole kutsujaa tai ne kuuluvat vain vanhan äpin kehityspaneeliin. Peruste: kartoitus `scopes/palvelu/palvelin.mjs`:stä 21.10.2026. ARK-19 tuli alasajon esiehdoksi, koska ilman sitä Android-etäohjaus ja palvelimen ohjaus katoaisivat alasajossa. Käyttäjä vahvisti ARK-19:n 21.10.2026 (AskUserQuestion "Pidä ARK-19"). Hylätyt vaihtoehdot: "Pudota ARK-19" ja "Vain Android".
- **Suunnittelija 21.10.2026 (K-10:n aikaperusta, T-57 fbe58e3c, koordinaattorin kysymys scopes overseerin kautta):** ikkuna ja katon vuorokausikarsinta lasketaan peiliyksikön sisältöajasta eli rivien uusimmasta `timestamp`-kentästä, ei HLC-tuontiajasta (SUUNNITELMA.md luku 8). Peruste: K-10:n mitoitus mitattiin rivien `timestamp`-kentästä. T-57:ssä kaikki 14 230 yksikköä saivat HLC-ajan 19.–20.10.2026, joten 7 vrk:n ikkuna ei rajannut mitään. Sisältöajan on oltava `/api/listat`-otsakkeessa. Korjaustehtävät tekee toteutussuunnitelma.
- **Suunnittelija 21.10.2026 (toteutussuunnitelman tiedote, käyttäjän alustapäätös 44e8d956 ja cef048d3):** käyttäjän alustapäätös on prioriteetti, ei arkkitehtuurimuutos. ARK-10:n, ARK-11:n ja ARK-13:n sisältö pysyy, vain aloitus siirtyy. ARK-10:n hyväksyntä (selain palvelinta vasten) odottaa ilman muutosta. ARK-11-riviin tehtiin kaksi tarkennusta. Headless-solmu toimii alustan palvelunhallinnassa, palvelimella cronilla H-5:n tavoin. ARK-19:n polkuihin lisättiin `scopes2/ydin/src/lahdetila.rs`, koska `GET /api/android` luetaan lähdetilasta (toteutussuunnitelman luku 11.8, 3d7251d3).

- **20.10.2026:** Suunnittelija 20.10.2026 (V-614): S-9b hyväksytään kahdella korjauksella. (1) Ikkunoitu solmu ei ole peilin lähde: sen `/api/listat` ja `/api/hae` eivät palauta ikkunoitua polkua, ja täysi solmu ohittaa vertaisen ikkunoidut polut myös `sovella`ssa. (2) Vetohaun alaraja = max(ikkunan raja, katon karsintaraja), ja karsintaraja säilyy sisäisessä polussa uudelleenkäynnistyksen yli. `ikkunoidut`-kenttä sopii lukuun 8, koska se kertoo vain, että polku on ikkunoitu, ei ikkunaa. Kirjattu SUUNNITELMA.md:n lukuun 8 ja rekisterin Päätöksiin (d70f196a).

- **20.10.2026:** Käyttäjä 20.10.2026 (AskUserQuestion "Lisää haku S-9:ään"): luku 8 pysyy. S-9:ään lisätään raakarivien pyynnöstä haku, joka ohittaa riisunnan eikä tallenna rivejä pysyvästi, ja ARK-17:ään yksi tehtävä. Hylätyt vaihtoehdot: "Rajaa luku 8" ja "Päätän myöhemmin".

- **20.10.2026:** Käyttäjä 20.10.2026 (pakkauksen AskUserQuestion): SEURAAVA PAKETTI on "ei mitään".

- **21.10.2026:** Suunnittelija 21.10.2026: sillan muut reitit (rekisterin Päätökset, dfc28af4). Hylätyt vaihtoehdot: pois jätettävien reittien siirto adapteriin ilman kutsujaa.

- **21.10.2026:** Käyttäjä 21.10.2026 (AskUserQuestion "Pidä ARK-19"): Android-etäohjaus ja palvelimen ohjaus pysyvät V2:ssa, ja ARK-19 on alasajon esiehto. Hylätyt vaihtoehdot: "Pudota ARK-19" ja "Vain Android".

- **21.10.2026:** Suunnittelija 21.10.2026: K-10:n aikaperusta (5368d699) sekä ARK-11:n ja ARK-19:n tarkennukset (eca4c32e). Alustapäätös on prioriteetti, ei arkkitehtuurimuutos.

- **21.10.2026:** Käyttäjä 21.10.2026 (automaattisiirron AskUserQuestion): SEURAAVA PAKETTI on "ei mitään".

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Hubin (`wg.brainpower-now.com`) WG-peerien hallinta parituksessa | avoin (selvitetään ARK-14:ssä) | muuttava komento → käyttäjä |
| Tauri 2 Androidilla + etualapalvelu | odottaa ARK-13:a (tarkistetaan ARK-13:n alussa; ARK-13 alkaa, kun ARK-10 ja ARK-05 ovat valmiit; tekijä `scopes2 android`, H-8 laite; ei heti ajettava tässä skoopissa) | vaihtoehto Kotlin-kuori + UniFFI |
| Vanhan scopes-äpin ja 8787-palvelun alasajo (K-9: rinnalla, kunnes V2 toimii; esiehdot ARK-09, ARK-16 ja ARK-19) | avoin (esiehdot ARK-09, ARK-16 ja ARK-19 täyttymättä 21.10.2026; ARK-19 lisätty 21.10.2026); odottaa käyttäjää | käyttäjä päättää, kun scopes-V2 täyttää ARK-09:n hyväksynnän ja ARK-16 ja ARK-19 ovat valmiit; siihen asti vanhaa ei muuteta V2:n takia; kysy käyttäjältä uudelleen vasta kun ARK-09 on hyväksytty ja ARK-16 valmis; käyttäjä voi myös muuttaa esiehtoja (kysymys hylättiin 20.10.2026, ei vastausta) |
| ARK-16, ARK-17 ja ARK-18 tehtävätasolle ja omistajille (`scopes2 adapteri`; `scopes2 ydin` + `scopes2 ios`; `scopes2 macos` + `scopes2 shared`) | avoin (20.10.2026); odottaa skooppia `scopes toteutussuunnitelma` | scopes2-työ kulkee toteutussuunnitelman T-tehtävinä ja koordinaattorin ohjauksessa, ei suoraan omistajarekistereihin tästä skoopista; ilmoitettu V-587, V-588 ja ARK-18:n tiedoksi **20.10.2026:** toteutussuunnitelman rekisterin mukaan (`scopes/toteutussuunnitelma/REKISTERI.md:80–81`) ARK-16 on vain paketiksi hyväksytty (851b0343, 174ae82f); ARK-16 tehtävätasolle vasta ARK-08:n (T-51) vihreän jälkeen; ARK-09 on tehtävätasolla luvussa 11.3, ei hyväksytty. |
| Istuntojen siirto Macille (mac:~/sessions-repo) | valmis 20.10.2026 (käyttäjän linjaus 20.10.2026 klo 18.35; tämä istunto ajettiin Macilla) | seuraava avaus Macilla: /pura scopes architecture |
| K-10:n katto T-74:n jälkeen | avoin (T-57:n uusinta); odottaa skooppia `scopes toteutussuunnitelma` | mitataan T-57:n uusinnassa, mahtuuko 7 vrk T-74:n riisunnalla 38 Mt:iin; jos ei mahdu, arkkitehtuuri päättää katon nostamisesta tai riisunnan kiristämisestä |
| ARK-19 tehtävätasolla | avoin (luku 11.8, 3d7251d3); odottaa skooppia `scopes toteutussuunnitelma` | ei arkkitehtuurin toimenpidettä |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/architecture/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
