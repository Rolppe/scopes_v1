# Erimielisyydet: Compound AI -arkkitehtuurisuunnitelma

Laatija: `scopes agents architecture` -keskustelu (Opus 5.5), 19.10.2026.
Kohde: ehdotus "Compound AI -arkkitehtuurisuunnitelma: Avoimen lähdekoodin yhdistelmämalli (Opus-taso)" (5 kerrosta: reititin ja orkestroija, RAG-muisti, asiantuntijaparvi, hiekkalaatikko, MoA ja kriitikko, syntetisoija).

Tähän on otettu vain kohdat, joissa tämä keskustelu kokeilisi toista vaihtoehtoa ja joissa perustelu on vahva. Hiekkalaatikko, skeemoitu viestintä ja vaikeuden mukaan skaalautuva laskentabudjetti hyväksytään ehdotuksen mukaisina.

## Lähtötiedot (sitovat)

- **Tietoturva on ehdoton:** järjestelmän on sovelluttava arkaluontoiselle yritysdatalle (käyttäjä 19.10.2026). Kelpaavat reitit ovat vain EU-tarjoajat, joilla on ZDR ja DPA, tai oma ajo EU:ssa.
- **Vain avoimien painojen mallit:** Claude ei ole missään roolissa. Opus 5.5 on pelkkä vertailukohta.
- **Tavoite:** lisäkapasiteetti Clauden rinnalle, ei Opus-tason ylittäminen (käyttäjä 19.10.2026).
- **Mittari:** hinta per hyväksytty tehtävä. Hyväksytty tarkoittaa, että tehtävä läpäisi testit tai skriptitarkistuksen. Tehtäväluokan läpäisyosuuden alaraja on Opus −5 pp (käyttäjä 19.10.2026).
- **Mallit ehdon sisällä** (Artificial Analysis -indeksi v4.3.2, Opus 5.5 max = 58):
  - GLM-5.3, 45 (Mistral EU)
  - DeepSeek V4.1 Flash, 39 (Scaleway)
  - Mistral Large 4, 38 (Mistral EU)
  - Qwen3.8-27B, 34 (oma rauta)
- **Kuorma 25.9.–19.10.2026:** 424 M syötettä päivässä, josta 96,5 % luetaan välimuistista. Tokeneista 70 % on siirtoa ja pakkausta (rakenteista, skriptillä tarkistettavaa), 24 % aliagentteja ja 3,4 % koodausta.

Näyttöluokat: **R** = riippumaton mittaus, **V** = valmistajan tai tekijän oma luku, **A** = anekdootti. Täysi aineisto lähteineen on tiedostossa `scopes/agents/ESITIEDOT.md` (luvut 9, 12–23).

## E-1. MoA eri malleilla ja yhdistäjällä → sama paras malli N kertaa, testit valitsevat

**Ehdotus:** 2–3 eri asiantuntijaa tekee rinnakkain ehdotukset, ja yhdistäjä jalostaa niistä vastauksen.

**Kokeilisin:** Self-MoA tai best-of-N. Paras sallittu malli ajetaan N kertaa (N = 2–4), ja ajetut testit valitsevat tuloksen.

**Perustelut:**
- Self-MoA voitti sekoittavan MoA:n: +6,6 % AlpacaEval 2.0:ssa ja keskimäärin +3,8 % (arXiv 2502.00674, R). Heikompien mallien sekoittaminen laskee keskilaatua.
- Co-failure-katto (arXiv 2606.27288, R; 67 mallia): kun lopputulos on jonkin jäsenen vastaus, tarkkuus on enintään 1 − β. Enemmistöäänestys hävisi omalle parhaalle jäsenelleen 75–93 %:ssa kolmen mallin yhdistelmistä.
- Best-of-N testikarsinnalla antoi SWE-tehtävissä +5…17 p (DeepSWE 42,2 → 59 %, CWM 53,9 → 65,8 %; R).
- Yhdistäjän valinta ratkaisee: hyvä ehdottaja voi olla huono yhdistäjä (arXiv 2601.16596). Yhdistäjän epäonnistumista silloin, kun oikea vastaus on vähemmistössä, ei ole mitattu.
- MoA:n mitattu hyöty (AlpacaEval 65,1 vs. 57,5) koskee avointa generointia, ei tarkistettavia tehtäviä.

**Mielipiteeni muuttaisi:** mittaus omalla tehtäväsarjalla, jossa sekoittava MoA voittaa Self-MoA:n samalla budjetilla hinta per hyväksytty -mittarilla.

## E-2. LLM-reititin arvioi vaikeuden → sääntöreititys kutsujan tehtäväluokan mukaan

**Ehdotus:** kevyt luokittelija arvioi syötteen monimutkaisuuden ja valitsee polun.

**Kokeilisin:** sääntöpohjaista reititystä. Tehtäväluokka (siirto, pakkaus, haku, koodaus) tiedetään kutsujasta, ja malli pysyy samana koko tehtävän ajan.

**Perustelut:**
- Luokka on jo tiedossa, joten arvioitavaa ei ole. Luokitin lisäisi kutsun ja virhelähteen ilman uutta tietoa.
- RouteLLM oli uudenlaisilla tehtävillä (MMLU) lähes satunnainen (R). Kehittäjäkokemus: "tehtävän vaikeutta ei voi ennustaa" (A). Planning-as-Routing: LLM ei valitse suunnittelutapaa luotettavasti.
- Mittari on hinta per hyväksytty tehtävä, ja hinta nojaa 96,5 %:n välimuistiosuuteen. Mallinvaihdon jälkeen osumat putoavat noin 8 %:iin (R). Väärä tai kesken tehtävän muuttuva reitityspäätös maksaa siksi enemmän kuin säästää.
- Kaskadista on hyvä muistaa, että heikko ensisijainen malli ei tiedä, milloin pitäisi eskaloida (Cognition, V/A). Jos eskalointia käytetään, siitä päättää tarkistimen tulos, ei malli.

**Mielipiteeni muuttaisi:** tehtäväluokka, jonka sisällä vaikeus vaihtelee niin paljon, että ennustettava eskalointi ennen tehtävän alkua säästää mitatusti.

## E-3. Orkestroija pilkkoo DAG:ksi asiantuntijoille → yksi toteuttaja tekee koko tehtävän

**Ehdotus:** orkestroija pilkkoo tehtävän osatavoitteiksi ja jakaa ne roolitetuille (myös hienosäädetyille) asiantuntijoille: arkkitehti, koodari, tutkija ja niin edelleen.

**Kokeilisin:** yksi toteuttaja koko tehtävälle ja kirjoitukset yksisäikeisinä. Rinnakkaistusta (rajattu orkestroija ja 2–4 työntekijää, tulokset tiedostoihin) käytetään vain laajaan hakuun.

**Perustelut:**
- Claude Coden rinnakkaiset aliagentit rajatuissa koodaustehtävissä: tulos heikkeni 24 pp ja tokeneita kului 1,41–3,31-kertaisesti (arXiv 2610.10263, R).
- Lisäagentit tuottavat tappiota, kun yksittäinen agentti on jo yli ~45 %:n tasolla (arXiv 2512.08296, R varauksin).
- Pakotettu delegointi (Akita, R): −2…−7 pistettä ja +1…+35 min. Vapaassa valinnassa 0/7 mallia delegoi.
- Suunnittelijan spesifikaatiosta vain ~21 % päätyy toteuttajalle. Cognition: liian määräävä manageri kostautuu, ja kirjoitusten on oltava yksisäikeisiä. Cursor poisti jäykän suunnittelijan.
- Suunnitelma nosti toteuttajan tasoa vain, kun suunnittelija oli selvästi vahvempi (GLM 5.1: 46 → 93 Opuksen suunnitelmalla). Nosto on kääntäen verrannollinen toteuttajan omaan tasoon. Meillä vahvin sallittu malli on GLM-5.3 (45) ja toteuttaja DeepSeek V4.1 Flash (39), joten nostolle ei ole tilaa.
- Roolijako itsessään toi noin +2,5 p. Kehys painaa enemmän: sama Kimi K2 sai 44–71 % kehyksen mukaan.
- Hienosäädetyt asiantuntijat vanhenevat, koska avoimista malleista tulee uusi versio 2–4 viikon välein.
- Parven mitatut hyödyt koskevat laajaa hakua (BrowseComp +17,8 pp, V) ja hyvin suuria hajotettavia tehtäviä, joissa mittari on automaattinen. Koodissa ainoa rinnakkaisuusmittaus on negatiivinen.

**Mielipiteeni muuttaisi:** oma mittaus, jossa pilkkova orkestrointi voittaa yksittäisen toteuttajan samalla mallijoukolla ja mittarilla.

## E-4. LLM-kriitikko tai PRM on portti → portti on ajetut testit ja skriptitarkistin

**Ehdotus:** kriitikkomalli arvioi ehdotukset askel askeleelta ja hyväksyy tai palauttaa ne.

**Kokeilisin:** porttina ajettuja testejä ja deterministisiä skriptitarkistimia. Eri malliperheen arvostelija puhtaalla kontekstilla tulee vasta testien jälkeen lisäporttina, ei ainoana porttina.

**Perustelut:**
- LLM-tuomari yksin on heikko portti (R). Itsekritiikistä tai väittelystä ilman ulkoista signaalia ei ole näyttöä hyödystä (arXiv 2609.08016, R; arXiv 2502.08788).
- Avoimet tarkistimet jäävät pass@K-katosta (arXiv 2604.01496).
- 70 % kuormasta on siirtoa ja pakkausta, jotka ovat skriptillä tarkistettavia. Siellä deterministinen tarkistin on halvempi ja varmempi kuin malli.
- Ainoa johdonmukaisesti hyödyllinen lisärooli on arvostelija puhtaalla kontekstilla ja eri malliperheestä (V, A). Siksi se säilytetään, mutta testien jälkeen.
- Testit eivät todista mitään, jos sama malli kirjoitti koodin ja testit (Akita: 34 mock-testiä läpäisi keksityn rajapinnan, A).

**Mielipiteeni muuttaisi:** omalla sarjalla mitattu LLM-portti, jonka väärien hyväksyntöjen osuus on testiportin tasolla.

## E-5. Syntetisoija kriitikon jälkeen → tarkistus on viimeinen vaihe

**Ehdotus:** kun kriitikko on hyväksynyt sisällön, syntetisoija kokoaa ja muotoilee lopullisen vastauksen. Kaaviossa myös helppo polku kulkee syntetisoijan kautta.

**Kokeilisin:** tarkistus on viimeinen vaihe. Hyväksyttyä tulosta ei kirjoiteta uudelleen. Tyyli ohjataan järjestelmäkehotteella.

**Perustelut:**
- Rakenteellinen virhe: syntetisoija kirjoittaa tarkistetun sisällön uudelleen, joten käyttäjälle menevä tulos on aina tarkistamaton. Tähän ei tarvita mittausta.
- Tuloksemme ovat rekistereitä, pakkauksia ja koodia, eli niissä ei ole muotoiltavaa proosaa. Koodin uudelleenkirjoitus toisella mallilla on Cognitionin vanhentuneeksi toteama edit-apply-malli.
- Kun helppokin polku kulkee syntetisoijan kautta, jokainen helppo tehtävä maksaa kaksi kutsua. Se heikentää suoraan hinta per hyväksytty -mittaria.

**Mielipiteeni muuttaisi:** tehtäväluokka, jonka tulos on vapaata tekstiä käyttäjälle ja jossa syntetisoijan jälkeen ajetaan uusi tarkistus.

## E-6. Korjaussilmukka 3–5 iteraatiota → kova korjausyrityskatto, varhainen tarkistus ja uusi puhdas yritys

**Ehdotus:** jos tulos ei läpäise, se palautetaan asiantuntijalle korjattavaksi, ja vaikealle ongelmalle sallitaan 3–5 iteraatiota.

**Kokeilisin:** 1–2 korjausyritystä samassa kontekstissa ja varhainen tarkistus askelten 5–10 kohdalla. Sen jälkeen aloitetaan uusi puhdas yritys (best-of-N) tai tehtävä hylätään. Uudelleenyritys tehdään vain yhdessä kerroksessa.

**Perustelut:**
- Ratkaiseva virhe syntyy ensimmäisissä askelissa, mutta paljastuu myöhään. Useimmat epäonnistuneet ajot jatkuvat pitkään sen jälkeen, kun onnistuminen on jo mahdotonta, ja epäonnistuneet ajot ovat kalliimpia (Failure-as-Process, General Agent Eval; R).
- Uusinnat eivät ole riippumattomia: gpt-4o:n onnistuminen putosi 61 %:sta alle 25 %:iin, kun vaadittiin 8 peräkkäistä onnistumista (tau-bench pass^8, R). Saman kontekstin korjauskierrokset toistavat saman virheen.
- Rinnakkaisotanta testitarkistimella voitti harness-evoluution samalla budjetilla (R).

**Mielipiteeni muuttaisi:** oma mittaus, jossa kolmas ja sitä myöhemmät korjauskierrokset nostavat hyväksymisosuutta enemmän kuin uusi puhdas yritys samalla hinnalla.

## E-7. Hybrid RAG ja GraphRAG → agentti hakee tiedostoista itse, ja havainnot maskataan

**Ehdotus:** vektorihaku, BM25 ja tietograafi korvaavat avoimien mallien heikon kontekstinhallinnan.

**Kokeilisin:** agentti hakee itse (grep, read), havainnot maskataan ennen tiivistystä, ja olemassa oleva muistirakenne (REKISTERI, HISTORIA, ARKISTO, CLAUDE.md) säilyy.

**Perustelut:**
- Tietoturvaehto on ehdoton. Vektori- ja graafikanta olisivat uusi kopio arkaluontoisesta datasta, joka pitäisi suojata, rajata oikeuksin, pitää ajan tasalla ja poistaa. Jos upotukset lasketaan tarjoajalla, tarvitaan lisäksi uusi reitti, jonka on täytettävä ZDR- ja DPA-ehto.
- Oletus pienestä kontekstista ei pidä: GLM-5.3:lla ja Mistral Large 4:llä on 1 M kontekstia, DeepSeek V4.1 Flashilla 256 k.
- Havaintojen maskaus halvensi ilman laatutappiota (R, yksi malli). RAG:n hyödystä koodiagentille esitiedoissa ei ole näyttöä.

**Mielipiteeni muuttaisi:** tehtäväluokka, jossa tarvittava aineisto ei mahdu kontekstiin eikä löydy tiedostohaulla, ja indeksi, joka voidaan pitää ehdon täyttävällä reitillä.

## Yhteenveto

| # | Ehdotus | Vaihtoehto | Ratkaisutapa |
|---|---|---|---|
| E-1 | MoA eri malleilla ja yhdistäjällä | Self-MoA tai best-of-N, testit valitsevat | mittaus |
| E-2 | LLM-reititin arvioi vaikeuden | sääntöreititys tehtäväluokan mukaan | mittaus |
| E-3 | DAG-pilkkominen asiantuntijoille | yksi toteuttaja, rinnakkaisuus vain hakuun | mittaus |
| E-4 | LLM-kriitikko tai PRM porttina | testit ja skriptitarkistin porttina, arvostelija lisänä | mittaus |
| E-5 | syntetisoija tarkistuksen jälkeen | tarkistus viimeisenä | rakenteellinen |
| E-6 | 3–5 korjausiteraatiota | korjausyrityskatto ja uusi puhdas yritys | mittaus |
| E-7 | Hybrid RAG ja GraphRAG | agentin oma haku ja maskaus | rakenteellinen (tietoturva) |

Kohdat, jotka ratkaistaan mittauksella, voi ajaa samalla omalla tehtäväsarjalla ja samalla mittarilla (hinta per hyväksytty, alaraja Opus −5 pp). Maksullisten ajojen katto hyväksytetään käyttäjällä ennen ajoa.
