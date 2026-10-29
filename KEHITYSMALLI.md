# scopes/KEHITYSMALLI.md — scopes-v2-team

Mallin nimi: **scopes-v2-team** (käyttäjä 20.10.2026). Se on agenttien orkestrointimalli, jossa monta istuntoa kehittää itsenäisesti. Viittaa malliin tällä nimellä rekistereissä ja ohjeissa.

Tilanne: 20.10.2026. Lähde: scopes2-ajo 19.–20.10.2026 (scopes overseer, scopes vahtimestari, scopes kordinaattori, scopes kordinaattori vahti, scopes toteutussuunnitelma, scopes architecture, scopes2 \*). Tämä on pohja, jolla `scopes`-skooppi tai sen alaskooppi pystyttää vastaavan ajon ilman käyttäjän valvontaa (esim. yön yli).

Malli lyhyesti: suunnitelmat päättävät, koordinaattori jakaa vuorot, työskoopit toteuttavat, Haiku vahtii ruutuja ja Opus ratkaisee jumit. Kukaan rooleista ei kysy käyttäjältä mitään. Käyttäjälle jäävät vain suunnitelman ihmisvaiheet ja valtuuksien antaminen.

## 1. Roolit

| Rooli | Skooppi (scopes2-ajossa) | Malli | Tekee | Ei tee | Ilmoittaa |
|---|---|---|---|---|---|
| Arkkitehtuuri | `scopes architecture` | Opus 5.5 high, avataan vain tarvittaessa ja suljetaan joutilaana (käyttäjä 28.10.2026); aiemmin Fable | Arkkitehtuuripäätökset (K-\*), luku- ja sopimustason ratkaisut | Ei toteuta | – |
| Toteutussuunnitelma | `scopes toteutussuunnitelma` | Opus 5.5 high, avataan vain tarvittaessa ja suljetaan joutilaana (käyttäjä 28.10.2026); aiemmin Fable | Tehtävät (T-\*), mallivalinnat, rinnakkaisuus, sopimukset (S-\*), ihmisvaiheet (H-\*) | Ei toteuta; ei kirjoita `scopes/`-puuhun porttivuoron aikana | – |
| Overseer | `scopes overseer` | Opus medium (käyttäjä 28.10.2026) | Pitää vahtimestarin käynnissä, ratkaisee JUMI-viestit käyttäjän valtuudella, aloitustarkistus, käyttörajan portaat, automaattisiirrot | Ei muuta suunnitelmia itse; ei kirjoita `scopes/`-puuhun porttiajon aikana; ei kysy käyttäjältä | – (ylin taso) |
| Koordinaattori | `scopes kordinaattori` | Sonnet high (käyttäjä 28.10.2026); aiemmin Opus | Jakaa porttivuorot, päättää porttiajot, uusinnat ja commitit, valitsee suositellun vaihtoehdon ja kertoo jälkikäteen | Ei rakenna tuotantokohteeseen; ei kysy käyttäjältä | overseer (SendMessage) |
| Vahtimestari | `scopes vahtimestari` | Haiku | Seuraa tmux-ruutuja Monitorilla, herättää koordinaattorin, vastaa ruutuihin vain koordinaattorin suosituksella, antaa `/automaattisiirto`n, pushaa jumittuneen `[ahead N]` | Ei ratkaise jumeja; ei vastaa lupakysymyksiin; ei avaa istuntoja nollauksen jälkeen | overseer: `JUMI: <istunto> — <oire, lokipolku, mitä yritetty>` |
| Työskoopit | `scopes2 ydin`, `… ios`, `… shared` jne. | Valvoja Opus medium (ydin, shared, ios, adapteri, web jatkuessaan; käyttäjä 28.10.2026 klo 8.2x, kulutus; aiemmin Opus high) tai Sonnet high (macos; Opus vaikeaan tehtävään); toteuttajat `toteuttaja-sonnet` valvojan effortilla (frontmatterissa ei effortia, periytyy: Opus medium -valvojan alla Sonnet medium, macosin alla Sonnet high; käyttäjä 28.10.2026 klo 9.5x "Pidä medium"), eskalaatio `toteuttaja-opus` (käyttäjä 28.10.2026) | Briefin Do-lista, oma portti, commit (vain valvoja) | Ei muuta lukittuja sopimuksia; `scopes/` on vieras puu; ei rd-taitoa | koordinaattori |
| Patriot | käyttäjän keskustelu (nyt `scopes macos` Macilla) | Opus | Ottaa vastaan käyttäjän pyynnöt, tekee pyydetyt selvitykset ja dokumentit, vie käyttäjän päätökset tehtäväviesteinä overseerille. Tarkastelee yhdessä käyttäjän kanssa tilanteen, kun overseer on tuonut käyttäjälle ongelman. Väärin osoitettu kysymys → ilmoitus kysyjälle ja oikealle omistajalle | Ei seuraa ruutuja eikä committeja; ei vastaa toisten skooppien kysymyksiin eikä välitä niitä käyttäjälle; ei välitä valtuuksia (kertoo, mihin istuntoon käyttäjä kirjoittaa ne itse) | käyttäjä |
| Käyttäjä | – | – | Antaa valtuudet, tekee ihmisvaiheet (sudo, laite, selain) ja käy ongelmat läpi patriotin kanssa | – | – |

Aiempi muunnelma: `scopes kordinaattori vahti` (Opus) teki sekä ruutuvalvonnan että käyttäjän päätökset (VALVOJA.md). Se jaettiin halvemmaksi pariksi: vahtimestari (Haiku) seuraa ja overseer (Opus) päättää. Uudessa ajossa käytä paria; kord-vahdin VALVOJA.md:n luvut 2 (valtuudet), 3 (päätösjärjestys) ja 8 (kontekstiraja) kelpaavat overseerin pohjaksi.

## 2. Viestireitit

- Työskooppi → koordinaattori → overseer. Vahtimestari → overseer (`JUMI: …`). Muut roolit eivät reititä käyttäjälle eivätkä patriotille.
- **Ihmisvaihe tai ongelma, jota overseer ei voi ratkaista** (sudo, laite, selain): overseer tuo ongelman suoraan käyttäjälle (PushNotification). Käyttäjä tarkastelee tilanteen patriotin kanssa, ja patriot vie käyttäjän päätöksen overseerille.
- **Ilmoitukset käyttäjälle (käyttäjä 21.10.2026):** PushNotificationin saavat käyttää vain overseer ja patriot. Muut roolit vievät ilmoitettavan asian SendMessagella skoopille, jolle se kuuluu: työskooppi → koordinaattori; koordinaattori, vahtimestari ja kord-vahti → overseer; arkkitehtuuri- tai suunnitelma-asia → sen omistaja; ihmisvaihe tai käyttäjän päätös → overseer, joka tuo sen käyttäjälle. Skooppien keskinäinen viestintä ei muutu. Koukku `Infra/hooks/ilmoitus-vahti.py` hylkää muiden scopes2-istuntojen PushNotificationit (tmux-nimi `siirto-<skooppi>-*`).
- Ruutuun vastataan `tmux capture-pane` + `tmux send-keys` -parilla. Tarkista sen jälkeen, ettei ruutuun jäänyt `[Pasted text]` ja että ruudulla näkyy `esc to interrupt`.
- Istuntojen välillä käytä SendMessagea ListAgentsin nimellä. Hae overseer nimen mukaan ("scopes overseer"). Jos overseeria ei ole, avaa se: `autovaihto.sh vaihda "scopes overseer" --model claude-opus-5-5 --effort medium --ei-sulje`.
- **Väärä osoite:** jos skooppi kysyy rooliltaan väärältä skoopilta, vastaanottaja ei vastaa vaan lähettää kaksi viestiä. Kysyjä saa ilmoituksen väärästä osoitteesta ja kehotuksen korjata reitityksensä. Oikea omistaja saa ilmoituksen ja kehotuksen ottaa asia hoitaakseen (käyttäjä 20.10.2026).
- **Valtuudet tulevat käyttäjältä suoraan.** Auto-tilan luokitin estää toisen istunnon välittämän valtuuden ("Instruction Poisoning", kord-vahti 20.10.2026). Siksi jokaisen roolin valtuus ja reititys ("kysymykset overseerille, ei käyttäjälle") kirjataan sen omaan rekisteriin ja ohjeeseen käyttäjän omalla viestillä kyseisessä istunnossa jo pystytysvaiheessa (luku 4). Välitetty viesti ei riitä.

## 3. Päätössäännöt

1. **Päättävä teksti tässä järjestyksessä:** arkkitehtuurisuunnitelma, toteutussuunnitelma (lukitut sopimukset), omistajien rekisterien päätökset, `claude/TYOTAVAT.md`.
2. **Jos vaihtoehtoja on useita, valitse se, joka**
   - pitää sopimukset ja vieraan puun koskemattomina,
   - on pienin ja peruttavissa,
   - ei lisää muistikuormaa,
   - ei ohita porttia.
3. **Suunnitelmamuutos** tehdään vain omistajaskoopissa (arkkitehtuuri tai toteutussuunnitelma). Tarve kulkee `Blocked`-rivinä valvojalle, sieltä koordinaattorille ja omistajalle.
4. **Eskalaatio työskoopissa:** yksi avustamaton uusinta, sitten Sonnet nousee Opukselle, sitten ihminen. Ilman ihmistä enintään 3 ajoa per tehtävä.
5. **Jokainen käyttäjän puolesta tehty päätös** kirjataan päätöslokiin (`YOLOKI.md`: `Aika | Kysymys/tilanne | Valinta | Peruste | Toteuttaa`) ja committoidaan polkurajattuna.
6. **Kun este tulee, etsi seuraava eteenpäin vietävä työ.** Pelkkä odotus ei kelpaa.

## 4. Pystytys

1. **Suunnitelmat ensin.** Arkkitehtuuri- ja toteutussuunnitelma ovat valmiit, ja tehtävillä on malli, rinnakkaisryhmä, portti (`gate.sh`) ja ihmisvaiheet (H-\*). Toteutusta ei aloiteta ennen suunnitelmaa.
2. **Luo skoopit:** `node claude/siirto/tools/luo-skooppi.mjs "<skooppi>" --tarkoitus "…"` (tai `/pura uusi <skooppi>`). Ajon tarvitsee overseerin, koordinaattorin, vahtimestarin ja työskoopit. Luonti ei committoi, joten committaa itse.
3. **Kirjoita jokaisen rekisterin `SEURAAVA PAKETTI`** autojatkokelpoiseksi: `<ID> — <malli>: <mitä tehdään, millä työkalulla, kenelle ilmoitetaan> — polut: … — aloitus: /pura <skooppi>`. Kirjaa Päätöksiin käyttäjän valtuus ("päätä itse", käyttörajan portaat, kontekstiraja) käyttäjän sanoin ja päivättynä.
4. **Rooliohjeet:**
   - vahtimestarille `TEHTAVAT.md`: numeroidut tehtävät, JUMI-ehdot ja kiellot;
   - overseerille aloitustarkistus SEURAAVA-riville ja `LAHTEET.md` (transkriptihakemisto);
   - Monitor-skriptit `tools/`-kansioon.
5. **Tarkista ympäristö ennen yötä:**
   - kaikki tarvittavat luvat (settings-sallinnat ihmiseltä, LuLu, codesign, simulaattori ssh:n yli);
   - akut, laturi ja `caffeinate`;
   - levytila;
   - käyttöaste (`kaytto_nyt()`);
   - tmux avainnipun kanssa (V-621: tmux ilman avainnippua tappaa istunnot heti; korjaus `tmux kill-server` ja `/login`).
6. **Käynnistysjärjestys:** käyttäjä purkaa overseerin (`/pura scopes overseer`). Overseer käynnistää vahtimestarin, vahtimestari käynnistää koordinaattorin, ja koordinaattori jakaa vuorot työskoopeille. Kaikki avataan komennolla `autovaihto.sh vaihda "<skooppi>" --model <malli> --effort <roolitaulukon effort> --ei-sulje`. Autojatko ajaa SEURAAVA-paketin, joten tarkista rivi ennen avausta.
7. **Yksi aktiivinen istunto per skooppi.** Tarkista ennen avausta (`istunto.sh --skooppi`, `tmux ls`), ettei skoopilla ole elävää istuntoa toisella koneella. Rinnakkaiset istunnot hukkasivat työtä 19.10.2026.

## 5. Valvonta

- **Monitor** (`timeout_ms` 1800000) uusitaan 30 minuutin välein. Skriptit:
  - **vahtimestarin `seuraa-istunnot.sh`.** Tapahtumat:
    - UUSI;
    - VAPAA (tyhjillään yli 90 s);
    - KYSYY;
    - KUOLLUT;
    - KAYTTO;
    - RAJA-NOLLAUTUI;
    - SIIRRÄ (≥200 k, ei taustakomentoa; käyttäjä 28.10.2026: raja 100 k, `seuraa-istunnot.sh` päivitettävä).
  - **overseerin `seuraa-valvoja.sh`.** Tapahtumat:
    - KYSYY;
    - KUOLLUT;
    - EI-MONITORIA;
    - KASAANTUMA (ruutu kysyy yli 5 min);
    - OK.
- **Aloitustarkistus (aef65e69):** overseer ajaa aloituksessa ja jokaisen Monitor-uusinnan yhteydessä `seuraa-istunnot.sh --kerta` ja toimii jokaisen istunnon tilan mukaan:
  - istunto on jäänyt käyttörajaan tai tyhjilleen, vaikka jonossa on työtä → koordinaattorille jatkokäsky;
  - odotukselta toiselle skoopille puuttuu omistaja → overseer ottaa asian itse tai ohjaa omistajalle;
  - alirooli (esim. kord-vahti) on jättänyt kysymyksen auki → overseer hoitaa sen.
- **"Käynnissä" ei tarkoita "töissä".** Herätysehto on "ei käynnissä tai tyhjillään ilman syytä". Pelkkä tmux-istunnon olemassaolo ei riitä (V-OVS-1: ajot seisoivat 21.50–23.10).
- **JUMI-ehdot:**
  - ruutukysymys ilman koordinaattorin suositusta 10 min;
  - sama portti punainen 2×;
  - koordinaattori kuollut tai hiljaa 15 min;
  - istunto kuollut odottamatta;
  - kaikki tyhjillään yli 30 min, vaikka jonossa on työtä;
  - RAJA-NOLLAUTUI;
  - ympäristövika;
  - lupakysymys.

## 6. Turva-aidat

- **Vieras puu ja kirjoitusikkunat:** portti kaatuu (exit 2), jos `scopes/`-puussa on muutos. Tämä koskee myös rekistereitä, ohjeita ja tämän tiedoston kaltaisia dokumentteja. Kirjoitukset `scopes/`-puuhun tehdään vain koordinaattorin ilmoittamassa porttien välissä (V-OVS-2). Jos aita kaatuu pelkästään vieraiden polkujen takia, ne kirjataan mittausriville ja committiviestiin, eikä perustilaa muuteta.
- **Rinnakkaisuus:**
  - Mac-UI-portit yksi kerrallaan rakennuslukolla (`/tmp/scopes2-apple-mac.lock`);
  - enintään 3 toteuttajaa ja 1 Rust-käännös kerrallaan;
  - enintään 3 Opus-työskooppia kerrallaan, toteuttajat Sonnetilla (käyttäjä 28.10.2026); joutilaat istunnot suljetaan;
  - kulutus mitataan ensimmäiset 2–3 h avauksen jälkeen (viikkoraja %/h; vertailu 21.10. Opus-tiimi ~2 %/h) (käyttäjä 28.10.2026).
- **Testit eivät koske tuotantoon:** koeydin aina RLIMIT_DATA-rajalla; Mac-testit tilapäisellä tunnelilla koeytimeen; ei tuotannon käännöskohdetta (`target/release`) eikä tuotantoporttia (V-KORD-2).
- **Muisti:** koeydin kasvoi 4,24 Gt:hen, ja OOM vei 8 istuntoa. Raskaat luvut tehdään rajalla (`prlimit --data=600000000`), eikä niitä ajeta toisen ajon aikana.
- **Taustakomennot:** Claude Coden muistisiivous tappaa taustashellit. Pitkät ajot irrotetaan `setsid nohup` -komennolla, ja niiden lokia seurataan.

## 7. Käyttöraja

| Taso | Toimenpide (seuraa-istunnot.sh) |
|---|---|
| ≥95 % | `KAYTTO … EI UUSIA`: ei uusia istuntoja, paketteja, portteja eikä siirtoja |
| ≥98 % | Esc ja pysäytyskäsky kaikkiin ruutuihin (TaskStop, odota) |
| ≥99 % | claude-prosessien kill kaikista tmux-ruuduista |

Lukema tulee `Infra/hooks/kayttoraja-vahti.py`:n `kaytto_nyt()`-funktiosta (5 h raja, välimuisti 60 s). Nollauksen jälkeen RAJA-NOLLAUTUI laukeaa, kun ruudulla näkyy "hit your session limit" ja käyttö on alle 95 %. Vahtimestari lähettää siitä JUMIn, ja overseer käskee koordinaattoria jatkamaan. Kill-tason jälkeen vahtimestari avaa vain koordinaattorin, ja koordinaattori pyytää muut.

## 8. Konteksti

- **Työskoopit, koordinaattori ja overseer:** `/automaattisiirto <skooppi>`, kun konteksti on vähintään 100 k ja tehtävä on päättynyt (käyttäjä 28.10.2026); aiemmin 200 k. Ei koskaan kesken ajon (taustaportti, käynnissä oleva vuoro). Mittaa komennolla `node claude/siirto/tools/konteksti-nyt.mjs [<id>] --raja 100000` (exit 3 = raja ylitetty).
- **Valvova rooli ilman pakkausta (kord-vahdin malli, VALVOJA.md luku 8):** ennen `/clear`ia avoimet asiat kirjataan rekisteriin, YOLOKI-rivi kirjoitetaan ja tehdään commit. Sen jälkeen irrotettu `uudelleenkaynnistys.sh` odottaa, että istunto on tyhjillään, ja lähettää `/clear`in ja aloituskehotteen. Siirtoa lykätään, jos kysymys, oma ajo tai kirjaamaton päätös on auki.

## 9. Siirrot, pakkaus ja arkistointi

- **Pakkaa ennen siirtoa ja arkistointia.** Arkistointi ja automaattinen sulkeminen ilman pakkausta hukkasivat aikatauluennusteen 19.10.2026.
- **Kun hallinta siirtyy skoopilta toiselle:**
  - etsi rekistereistä rivit, jotka reitittävät vanhalle omistajalle (`grep -rn "<vanha skooppi>" scopes*/…/REKISTERI.md`), ja korjauta ne omistajien kautta;
  - sulje vanhan omistajan avoimet odotukset (20.10.2026 koordinaattori jäi odottamaan vastausta skoopilta, jolta hallinta oli juuri siirtynyt);
  - ilmoita sekä kysyjälle että uudelle omistajalle (luku 2).
- **Arkistointi:** `node claude/siirto/tools/arkistoi-skooppi.mjs "<skooppi>"` nimeää rekisterin `REKISTERI.arkistoitu.md`:ksi ja poistaa skoopin reitittimestä. Komento ei committoi.
- **KESKEN-varoitus voi olla väärä**, jos pakkaus tehtiin toisella koneella (V-620). Tarkista ensin omistajan HISTORIA ja `git log --since`.

## 10. Tunnetut virheet

| Vika | Oire | Ehkäisy |
|---|---|---|
| V-OVS-1 | Käyttörajaan pysähtynyt istunto näytti tyhjältä, eikä jumia tullut | RAJA-NOLLAUTUI, `--kerta`-aloitustarkistus, herätysehto "tyhjillään ilman syytä" |
| V-OVS-2 | Overseerin kirjoitus `scopes/`-puuhun kaatoi porttiajon aidan | Kirjoitukset vain porttien välissä |
| Aloitusaukko | Overseerin paketti odotti pelkkiä JUMI-viestejä, joten ajoja ei käynnistetty | Aloitus- ja uusintatarkistus SEURAAVA-riville |
| Valtuuden välitys | Luokitin esti vertaisen välittämän reitityssäännön | Valtuudet ja reititys käyttäjältä suoraan, pystytysvaiheessa |
| Väärä osoite | Alaroolit kysyivät skoopilta, jolta hallinta oli siirretty | Siirron reititysgrep, ilmoitus molemmille osapuolille |
| Rinnakkaiset istunnot | Kaksi saman skoopin istuntoa, joista toinen kuoli OOM:iin ja työ hukkui | Yksi aktiivinen istunto per skooppi, tarkistus ennen avausta |
| V-621 | Macin tmux ilman avainnippua, istunnot kuolevat heti | `tmux kill-server` ja `/login` ennen ajoa |
| OOM | Koeytimen muisti kasvoi | RLIMIT_DATA, prlimit, ei rinnakkaisia raskaita lukuja |
| V-620 | KESKEN-varoitus toisella koneella pakatusta istunnosta | Tarkista HISTORIA ennen palautusta |

## 11. Tiedostopohjat

- **`REKISTERI.md`** (jokaisella skoopilla):
  - `Tilanne:` ja `SEURAAVA PAKETTI:` -rivit;
  - luvut Tarkoitus ja raja / Päätökset / Avoimet asiat (`Asia | Tila | Seuraava askel`) / Viat / Historia.
- **`HISTORIA.md` ja `ARKISTO.md`** syntyvät ensimmäisessä pakkauksessa, eikä purku lue niitä.
- **Roolikohtaiset:**
  - `TEHTAVAT.md` (vahtimestari);
  - `VALVOJA.md` (valtuudet, päätösjärjestys, turvarajat, kontekstiraja);
  - `YOLOKI.md` (päätösloki);
  - `LAHTEET.md` (transkriptit ja viestihistoria);
  - `AIKATAULUENNUSTE.md` (aikaleimatut ennusteet);
  - `tools/` (Monitor-skriptit).
- **Nimet:**
  - tmux `siirto-<skooppi-väliviivoin>-<HHMMSS>`;
  - tila `~/.local/state/<nimi>/`.

## Lähteet

`scopes/overseer/REKISTERI.md`, `scopes/vahtimestari/{REKISTERI,TEHTAVAT}.md` ja `seuraa-istunnot.sh`, `scopes/kordinaattori/REKISTERI.md`, `scopes/kordinaattori/vahti/{VALVOJA,REKISTERI,YOLOKI}.md`, `scopes/toteutussuunnitelma/SUUNNITELMA.md` luku 1, `scopes/macos/HISTORIA.md`, commitit aef65e69 ja d382c134.
