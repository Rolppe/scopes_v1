# Ulkoinen ehdotus: Gemini "Avoimen lähdekoodin Opus-arkkitehtuuri" (5 kerrosta) ja sen arvio

Lähde: käyttäjän jakama Gemini-keskustelu https://share.gemini.google/9SZ8y84IpDm8 (→ gemini.google.com/share/aceedd659440), malli Gemini Flash-Lite, luotu 19.10.2026. Haettu Macin headless-Chromella 19.10.2026. Arvion teki `scopes agents` -keskustelu esitietoja vasten (`scopes/agents/ESITIEDOT.md`, `scopes/agents/architecture/ESITIETOPAKETTI.md`). Näyttöluokka: ehdotuksessa ei ole lähteitä eikä mittauksia; se on mallin oma yleisesitys.

## Ehdotus tiivistettynä

Hierarkkinen Mixture-of-Agents ja ajonaikainen laskenta, viisi kerrosta (kaaviossa kuudes):
1. Älykäs reititin ja orkestroija: vaikeusarvio, tehtävän pilkkominen DAG-graafiksi.
2. Konteksti ja muisti: hybridi-RAG (vektori, BM25, tietograafi), hierarkkinen muisti.
3. Erikoistuneiden agenttien joukko: arkkitehti, koodari, tutkija, kriitikko, syntetisoija.
4. Suoritusympäristö: hiekkalaatikko, koodi ajetaan oikeasti, virheet ja testit takaisin agentille.
5. Reflektio ja kritiikki: 2–3 asiantuntijaa rinnakkain (MoA), PRM tai LLM-tuomari arvioi ja palauttaa, syntetisoija kokoaa.
Periaatteet: vaikeuden mukainen laskentabudjetti (best-of-N, MCTS, 3–5 iteraatiota), tyypitetty jaettu tilaobjekti agenttien välillä, erillinen tyylikerros.

## Arvio esitietoja vasten

| Ehdotuksen osa | Esitietojen näyttö | Arvio |
|---|---|---|
| Reititin vaikeuden mukaan (1) | reititys tehtävän rajalla, pieni luokitin riittää (R); malli ei vaihdu kesken tehtävän (R) | **tuettu**, reititys vain tehtävän rajalla |
| Tehtävän pilkkominen DAG:ksi ja rinnakkaiset asiantuntijat (1, 3) | rinnakkaiset aliagentit häviävät rajatuissa koodaustehtävissä (−24 pp, tokenit 1,4–3,3×, R); lisäagentit tuottavat tappiota yli ~45 %:n yksittäistuloksella (R); vapaassa valinnassa 0/7 delegoi (A) | **ristiriidassa** koodissa; vain pitkissä suurissa toteutuksissa |
| Hybridi-RAG ja hierarkkinen muisti (2) | ei mitattua näyttöä esitiedoissa; havaintojen maskaus ennen tiivistystä (R, yksi malli) | **avoin**, ei perustetta raskaalle muistikerrokselle |
| Viisi roolia (3) | roolijako itsessään ~+2,5 p, kutistuu mallin vahvistuessa (V); kehys painaa enemmän kuin roolit (V) | **heikosti tuettu**; arvostelija puhtaalla kontekstilla on ainoa johdonmukaisesti hyödyllinen lisärooli (V, A) |
| Hiekkalaatikko ja testipalaute (4) | ajetut testit ovat ainoa vankka tarkistussignaali koodissa (R); testikarsinta +3–6 p (V) | **vahvimmin tuettu** |
| MoA eri malleilla (5) | sama paras malli monta kertaa voittaa sekoituksen (V, R); eri mallien ehdokkaiden sekoitus ei ylittänyt parasta (V); äänestys voittaa parhaan jäsenen vain 10 %:ssa (R) | **ristiriidassa**; käytä saman parhaan mallin rinnakkaisia yrityksiä |
| LLM-tuomari tai PRM porttina (5) | LLM-tarkistaja hyväksyi 22–49 % hylätyistä (R); tuomarit AUROC ≤ 0,65 (R); koulutettu critic +6–16 p (V) | **ristiriidassa** pelkkänä porttina; testit ensin, tuomari neuvoa-antava |
| Iteraatioraja | epäonnistuneet ajot jatkuvat pitkään toivottomina; kova korjausyrityskatto (R) | **tuettu** |
| Tyypitetty jaettu tila | skeemoitu roolien välinen viestintä on myös tietoturvasuositus (R) | **tuettu** |
| Syntetisoija ja tyylikerros | ei näyttöä; lisää viivettä ja kutsuja | **ei perustetta** agenttikoodauksessa |
| Puuttuu | tietoturva (ehdoton ehto), sallitut reitit ja mallit, välimuistin merkitys hinnalle, viive (viisi kerrosta on ristiriidassa nopeustavoitteen kanssa), mittaus | **olennaiset aukot** |

## Mitä tästä seuraa

- Ehdotuksesta kannattaa ottaa reititin tehtävän rajalla, hiekkalaatikko ja ajetut testit, iteraatioraja ja tyypitetty tila.
- Rinnakkaiset erikoisagentit, eri mallien MoA, LLM-tuomari porttina ja syntetisoija ovat esitietojen näytön vastaisia tai perusteettomia koodaustyössä.
- Ehdotus ei käsittele käyttäjän ehdotonta tietoturvaehtoa eikä kustannusta, joten se ei kelpaa sellaisenaan arkkitehtuurin pohjaksi; se on vertailukohta, jota vasten AGENTS-ARK-01:n valinnat perustellaan.

## Korjausehdotukset valintakohtiin todisteineen (scopes agents 19.10.2026)

Näytön vahvuus: **vahva** = iso riippumaton mittaus tai useampi samansuuntainen; **kohtalainen** = yksi riippumaton tai useampi tekijän oma; **heikko** = yksittäinen kokemus; **ei näyttöä**. "Tarkistettu" = vastakkainen tarkistus luki alkuperäisen ja vahvisti luvut (`scopes/agents/ESITIEDOT.md` luku 20.1). Lähteiden linkit: ESITIEDOT luvut 12–18.

| # | Gemini | Korjausehdotus | Keskeiset todisteet | Vahvuus | Mitattava itse |
|---|---|---|---|---|---|
| 1 | LLM-reititin ja suunnittelija | erillinen kevyt luokitin; päätös vain tehtävän alussa; epävarma → vahva polku | Switchcraft 2605.07112 −84 % kustannus; AgentFloor 2605.00334; mallin vaihto → välimuistiosumat ~8 % (2608.00101, tarkistettu); oma kuorma 96,5 % välimuistista | kohtalainen / vahva (välimuisti) | reitittimen tarkkuus omalla sarjalla |
| 2 | DAG ja rinnakkaiset asiantuntijat | yksi toteuttaja; rinnakkaisuus vain lukevaan hakuun ja suuriin toteutuksiin; ei rinnakkaisia kirjoittajia | 2610.10263 −24,0 pp, tokenit 1,41–3,31× (tarkistettu); 2512.08296 yli 45 % → tappio (tarkistettu); Anthropic laaja haku ~15× tokenit (V) | vahva koodissa | rajatapaus: suuret toteutukset |
| 3 | Hybridi-RAG, GraphRAG, hierarkkinen muisti | havaintojen maskaus, tiivistys vasta pitkissä; koodihaku työkaluna; säännöt tiedostona | 2508.21433 maskaus 0,48× hinta (tarkistettu, yksi malli); OpenHands condenser (V); mini-swe-agent pelkällä bashilla 75,8 % (tarkistettu) | kohtalainen; RAG:sta ei näyttöä | RAG vain jos mittaus näyttää puutteen |
| 4 | Viisi roolia | toteuttaja, deterministinen testiajuri, arvostelija (puhdas konteksti, eri malliperhe, vain luku) | Lingxi 2510.11838 roolijako +2,5 p (V); Kimi K2 kehyksen mukaan 43,8–71,2 % (V); TeamBench 2605.07073 Planner +2,4 p, executor ja verifier painavat enemmän (tarkistettu); RuVerBench 2606.29920 virheistä 20,6 % yhteisiä (R) | kohtalainen | arvostelijan hyöty |
| 5 | Hiekkalaatikko | pidetään; testit eivät toteuttajalta; vähimmät oikeudet; korjauskatto | Trae 2507.23370 +3,4–5,6 p (V); Akita sama malli koodi ja testit (A); Dziemian 2603.15714 avoimet 4,2–5,4 % vs 0,5 % (tarkistettu, vanhat mallit); Prompt Infection 2410.07283 (R) | vahva / kohtalainen | injektioalttius GLM-5.3:lla |
| 6 | MoA eri malleilla | sama vahvin malli 2–4 yritystä vaikeisiin testattaviin; testit karsivat | Self-MoA 2502.00674 +3,8–6,6 % (V); Trae sekoitus 65,7 % < paras 66,4 % (V); 2607.20768 äänestys voittaa 10 % (R, abstrakti); 2607.12227 otanta 72,3 vs 67,4 (tarkistettu) | kohtalainen | β omalla sarjalla |
| 7 | LLM-tuomari tai PRM porttina | portti = ajetut testit ja deterministiset tarkistukset; tuomari neuvoa-antava rubriikilla | TeamBench väärät hyväksynnät 22,3–49,4 % (tarkistettu); False Success 2606.09863 AUROC ≤ 0,65 (R); RuVerBench avoimet 77–84 vs ihminen 90,5 (R); critic +5,8…15,9 p, onnistumis-only −12,3 p (V) | vahva | GLM-5.3:n tuomaritarkkuus |
| 8 | Budjetti, best-of-N tai MCTS, 3–5 iteraatiota | budjetti per tehtävä; varhainen tarkistus; kova katto; MCTS vasta mittauksen jälkeen | 2607.09510 onnistuneet reagoivat virheeseen 92 % vs 37 % (R); Snell ym. 2408.03314 vaikeuden mukainen jako (R, ei luettu tässä haussa); MCTS vs best-of-N koodissa: ei mittausta | kohtalainen | MCTS:n hyöty |
| 9 | Tyypitetty jaettu tila | pidetään; tila ja työkalukutsut eri vaiheisiin; skeemavalidointi; roolin näkyvyys rajattu | Constraint Tax 2606.25605 työkalukutsut 100 → 0 % (tarkistettu); CaMeL 2503.18813 77 % todistetusti turvallisesti (V) | vahva | — |
| 10 | Syntetisoija ja tyylikerros | ei oletuksena; chat-polulla mitataan ensin | ei näyttöä kumpaankaan suuntaan; chat 0,05 % kuormasta (luku 19) | ei näyttöä | kielenlaatu chatissa |

## Samaa mieltä Geminin kanssa (kohta kohdalta)

| # | Geminin kohta | Samaa mieltä | Eroa |
|---|---|---|---|
| — | Älykkyys rakennetaan työkaluilla, reitityksellä ja iteratiivisella tarkistuksella (Compound AI) | **kyllä**: työkalut ja tarkistus ovat näytön vahvimmat osat | Opus-tason saavuttaminen ei ole näytetty |
| 1 | Kevyt ja nopea reititin, helppo suoraan nopealle mallille, vaikea eskaloidaan | **kyllä** | reititin luokitin eikä LLM-suunnittelija; päätös vain tehtävän alussa |
| 2 | Pilkkominen ja rinnakkaisuus vaativissa tehtävissä | **osittain**: laajassa tiedonhaussa ja suurissa toteutuksissa | ei rajatussa koodaustehtävässä eikä rinnakkaisia kirjoittajia |
| 3 | Avoimissa malleissa kontekstin hallinta on rakennettava eksplisiittisesti; työmuisti ja projektin pysyvät säännöt | **kyllä** | keinoksi maskaus ja tiivistys ensin; RAG ja GraphRAG vasta mittauksen jälkeen |
| 4 | Roolikohtaiset järjestelmäkehotteet ja työkalut; kriitikko, joka ei tuota sisältöä vaan etsii virheitä ja tietoturva-aukkoja | **kyllä** kriitikko-roolista ja roolikohtaisista työkaluista | kolme roolia viiden sijaan; kriitikko eri malliperheestä, puhtaalla kontekstilla, vain lukuoikeus |
| 5 | Koodi ajetaan oikeasti eristetyssä hiekkalaatikossa; virheet ja testit takaisin agentille ennen käyttäjää | **kyllä, täysin** | lisäksi testit eivät toteuttajalta ja vähimmät oikeudet |
| 6 | Useita vaihtoehtoja vaikeisiin ongelmiin (best-of-N) | **kyllä** | sama vahvin malli monta kertaa, ei eri mallien sekoitus; MoA:n hyöty luovassa kirjoittamisessa ja analyysissa voi pitää paikkansa |
| 7 | Tuotos palautetaan korjattavaksi, jos se ei läpäise laatukriteerejä | **kyllä** | portti on ajetut testit ja ohjelmalliset tarkistukset, LLM-tuomari neuvoa-antava |
| 8 | Laskentabudjetti tehtävän vaikeuden mukaan; Plan-Execute-Critique voi jäädä ikuiseen silmukkaan ilman toistorajaa | **kyllä** | lisäksi tarkistus heti alussa; MCTS vasta mittauksen jälkeen |
| 9 | Agentit päivittävät tyypitettyä jaettua tilaa vapaan tekstin sijaan | **kyllä, täysin** | tila ja työkalukutsut eri vaiheisiin (avoimien mallien työkalukutsut kaatuvat muuten) |
| 9b | Kolmen suoritusmallin vertailutaulukko (MoA kallis ja hidas, Plan-Execute-Critique koodiin, reititys nopea) | **kyllä** kuvaus hyödyistä ja haitoista | — |
| 10 | Erillinen tyylikerros | **ei kantaa**: ei näyttöä kumpaankaan suuntaan | ei oletuksena ennen mittausta |
