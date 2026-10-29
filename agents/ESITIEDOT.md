# scopes agents — esitiedot: avoimen mallin yhdistelmä vs. Claude Opus 5.5

Paketti AGENTS-ESITIEDOT, haettu 19.10.2026. Lähteet luettiin vain hakutyökalun yhteenvetoina: WebFetch ja curl eivät saaneet yhteyttä (ECONNREFUSED), joten primäärisivujen lukuja ei ole tarkistettu. Valmistajan omat luvut on merkitty (valm.).

## 1. Vertailukohta: Claude Opus 5.5

| Asetus | AA-indeksi | Nopeus (tok/s) | Hinta / AA-tehtävä |
|---|---|---|---|
| max | 58 (1./134) | ~98 | $5,98 |
| xhigh | 56 | ~76 | $3,46 |
| high | 54 | ~83 | $1,82 |
| medium | 51 | ~86 | $1,34 |
| low | 42 | ~81 | $0,55 |

- Listahinta $4 / $20 per M (syöte/tuloste), välimuistiluku $0,20; fast-tila $8 / $40.
- max-asetus käyttää ~119 k tulostetokenia per tehtävä, joten tehtäväkohtainen hinta johtuu enemmän tokenimäärästä kuin tokenihinnasta.
- SWE-bench Pro 89,9 %, Terminal-Bench 4.0 66,4 % (valm.).

## 2. Parhaat avoimet mallit (AA-indeksi v4.3.2, lokakuu 2026)

| Malli | AA | Hinta $/M (syöte/tuloste) | Nopeus (tok/s) |
|---|---|---|---|
| MiMo-V2.6-Pro (Xiaomi, ~1T) | 46 | 0,43 / 0,87 | ~48 (Xiaomin API; muut mittaukset 41–134) |
| GLM-5.3 Max (Z.ai) | 45 | 1,40 / 4,40 | ~66 |
| Kimi K3 Max (Moonshot) | 44 | 3,00 / 15,00 | 26 (oma API) – 66 (muut palveluntarjoajat) |
| Step 5 Preview | 44 | – | – |
| GLM-5.3 Flash | 42 | – | – |
| DeepSeek V4.1 Flash | 39 | – | – |

- **Indeksin versiot eivät ole vertailukelpoisia.** Lukuja 57 (GLM-5.3 Flash, Kimi K3) ja 60 (GLM-5.3) ei voi verrata lokakuun lukuihin, koska ne ovat vanhemmasta versiosta, jossa Opus 4.8 max sai myös 57. Luvuissa 8 ja 10 nämä luvut esiintyvät, ja vertailu tehdään vain saman version sisällä (v4.3.2: Opus 5.5 max 58, GLM-5.3 Max 45). ([AA: GLM-5.3 Flash](https://artificialanalysis.ai/models/glm-5-3-flash), [Qubrid](https://qubrid.com/blog/glm-53-flash-benchmarks-official-and-independent-results))
- Ero kärkeen on 12 pistettä (46 vs. 58). Epoch AI:n arvion mukaan avoimet mallit ovat noin 4 kuukautta suljettujen jäljessä.
- Osa-alueittain kärjessä on eri malleja: Kimi K3 agenttikoodauksessa (valm.) ja GPQA:ssa, DeepSeek-V4-Flash koodausareenalla. Terminal-Bench 4.0:ssa ainoa avoin malli on GLM-5.3 tuloksella 41,8, kun Opus 5.5:n tulos on 64,8.

## 3. Nopeus

- GPU-palveluissa kärjen avoimet mallit tuottavat 26–66 tok/s eli ovat hitaampia kuin Opus 5.5 (~98 tok/s).
- Erikoispiirit ovat moninkertaisesti nopeampia, mutta vain pienemmillä malleilla. Cerebras tuottaa gpt-oss-120B:llä ~1 700 tok/s (AA:n mittaus; valmistaja ilmoittaa 3 000) ja jollakin Qwenillä ~1 850 tok/s. Groq tuottaa gpt-oss-120B:llä ~480–500 tok/s. Kärkimalleille (MiMo, GLM-5.3, Kimi K3) ei löytynyt Cerebras- tai Groq-lukuja.
- Yhdistelmä hidastaa: rinnakkaiset kutsut ja yhdistäjävaihe lisäävät viivettä, joten "nopeampi" ja "yhdistelmä" ovat ristiriidassa, ellei käytössä ole erikoispiiriä tai reititintä, joka ajaa vain yhden mallin.

## 4. Yhdistelmät: mitä näyttö sanoo

- **Co-failure ceiling** (Chen, arXiv 2606.27288, 67 mallia, ei vertaisarvioitu). Kun lopullinen vastaus on jonkin jäsenmallin vastaus (reititys, äänestys, kaskadi), tarkkuus on enintään 1 − β, jossa β on niiden kysymysten osuus, joissa kaikki mallit epäonnistuvat. Enemmistöäänestys häviää omalle parhaalle jäsenelleen 75–93 %:ssa kolmen mallin yhdistelmistä. Hyöty vaatii vahvan kysymyskohtaisen reitityssignaalin. β:lle saa ilmaisen ylärajan (Clopper–Pearson) ennen kuin reititintä rakennetaan. Koodi: github.com/josefchen/co-failure-ceiling.
- **Sakana Fugu** (valm.) on orkestroija, joka näkyy yhtenä OpenAI-yhteensopivana rajapintana. Fugu Ultra (6/2026) sai SWE-Bench Pro -tuloksen 73,7, kun Opus 4.8:n tulos oli 69,2, ja GPQA-tuloksen 95,5, kun Opus 4.8:n tulos oli 92,0. Fugu Ultra v2:n (9/2026) mallijoukko on avoimia malleja (mm. Nemotron), ja Sakana ilmoittaa sen olevan ensimmäinen tai jaetulla ensimmäisellä sijalla 5/8 testissä. Riippumatonta vertailua Opus 5.5:een ei löytynyt. Opus 5.5:n oma SWE-bench Pro -luku (89,9, valm.) on selvästi Fugu Ultran yläpuolella.
- **vLLM Semantic Router micro-agent** (6/2026) tekee yhteistyön palvelinkerroksessa (tilat auto, fusion, flow ja remom). Tuloksena on vasta alustava GPQA-Diamond-ajo, jossa se "voittaa tai vastaa"; HLE-, SWE-bench Pro- ja TerminalBench-ajot ovat kesken. Se on avointa koodia ja sopii samaan kohtaan kuin Scopesin oma välityspalvelin.
- **Pelkistä avoimista malleista koottu yhdistelmä vs. Opus 4.8** (yksittäinen blogi, ei saatu luettua): yhdistelmä voitti 3/5 testiä, kun kysymyksiä oli tiheästi ja vaikeus keskitasoa, ja hävisi aidosti vaikeissa kysymyksissä.
- **OpenRouter Fusion**: noin puolet kärkimallin hinnasta (lähde lähellä valmistajaa).

## 5. Johtopäätös

1. **Kaikkea kolmea yhtä aikaa ja kaikissa tehtävissä ei tue mikään löydetty näyttö.** Kärjen avoin malli on 12 AA-pistettä jäljessä ja GPU-palvelussa hitaampi. Yhdistelmä voi kaventaa pisteeroa, mutta se lisää viivettä, ja co-failure-katto rajaa valintaan perustuvat yhdistelmät.
2. **Hinta on selvä etu.** MiMo-V2.6-Pron tokenihinta on noin 1/10–1/20 Opuksen hinnasta. Viiden mallin yhdistelmäkin jää halvemmaksi kuin Opus max, jos tokenimäärät pysyvät kohtuullisina.
3. **Älykkyysvoitto on realistinen vain tarkistettavissa tehtävissä** (testit, kääntäjä, tarkistin): useita yrityksiä ja tarkistin, joka valitsee vastauksen. Silloinkin katto on 1 − β, eli yhdistelmä ei ratkaise kysymystä, jonka kaikki sen mallit mokaavat.
4. **Nopeus vaatii erikoispiirin** (Cerebras tai Groq) ja pienemmän mallin. Se on ristiriidassa kärjen älykkyyden kanssa, ellei reititin ohjaa helppoja kysymyksiä nopealle mallille ja vaikeita hitaalle.
5. **Realistinen tavoite mittaukseen:** "yhdistelmä vastaa Opus 5.5 high -tasoa (AA 54) Scopesin omassa tehtäväjoukossa pienemmällä hinnalla ja helpoissa kysymyksissä pienemmällä viiveellä". Opus max -tason (58) ylittäminen yleisesti ei ole näytön perusteella saavutettavissa nyt.

## 6. Avoimet kysymykset seuraavaan pakettiin

- Mikä on Scopesin oma tehtäväjoukko (koodaus, siirto ja pakkaus, chat) ja sen tarkistin?
- Mikä on β omalla joukolla: MiMo-V2.6-Pro, GLM-5.3 ja Kimi K3 sekä Opus 5.5 high vertailukohtana. Mittaus vaatii maksullisia API-kutsuja, ja niille tarvitaan käyttäjän hyväksymä katto.
- Mikä palveluntarjoaja: Nebius (välityspalvelin on jo olemassa, scopes istunnot), OpenRouter vai Cerebras tai Groq nopeutta varten?
- Kannattaako vLLM Semantic Router ottaa reitittimeksi vai rakentaa oma?

## Lähteet

- Artificial Analysis: [Opus 5.5 -artikkeli](https://artificialanalysis.ai/articles/claude-opus-5-5), [mallisivu](https://artificialanalysis.ai/models/claude-opus-5-5), [leaderboard](https://artificialanalysis.ai/leaderboards/models), [MiMo-V2.6-Pro](https://artificialanalysis.ai/models/mimo-v2-6-pro), [MiMo vs GLM-5.3](https://artificialanalysis.ai/models/comparisons/mimo-v2-6-pro-vs-glm-5-3)
- [TexaHub: open vs closed 2026](https://texahub.com/research/open-weight-or-closed-ai-models-what-companies-should-weigh-in-2026), [slash-digital: open-weight models 2026](https://slash-digital.io/en/insights/open-weight-models-2026/)
- [BenchLM open-source](https://benchlm.ai/best/open-source), [Pinggy: coding LLMs](https://pinggy.io/blog/best_open_source_self_hosted_llms_for_coding/), [Morph: best open source LLM](https://www.morphllm.com/best-open-source-llm), [Codersera](https://codersera.com/blog/open-source-llms-landscape-2026/), [llm-stats](https://llm-stats.com/leaderboards/open-llm-leaderboard)
- [OrcaRouter: MiMo vs Kimi K3](https://www.orcarouter.ai/blog/mimo-v2-6-pro-vs-kimi-k3), [fastino: open-weight models](https://fastino.ai/blog/how-to-use-open-weight-models)
- [MetricNexus: Opus 5.5](https://metricnexus.ai/blog/claude-opus-5-5-benchmarks-pricing), [anotherwrapper: Opus 5.5 pricing](https://anotherwrapper.com/llm-pricing/claude-opus-5-5)
- [Co-failure ceiling, arXiv 2606.27288](https://arxiv.org/abs/2606.27288), [koodi](https://github.com/josefchen/co-failure-ceiling), [VentureBeat](https://venturebeat.com/orchestration/enterprises-using-multiple-ai-models-are-underestimating-failure-rates-by-2-25x)
- [Sakana Fugu](https://sakana.ai/fugu-release/), [VentureBeat: Fugu](https://venturebeat.com/orchestration/no-claude-fable-5-no-problem-sakana-achieves-frontier-performance-with-new-fugu-multi-model-auto-synthesis-system), [Fugu Ultra v2](https://pasqualepillitteri.it/en/news/16195/sakana-fugu-ultra-v2-beats-gpt-6-astra)
- [vLLM micro-agent](https://vllm.ai/blog/2026-06-29-micro-agent-frontier-models), [snwagh: open source vs frontier](https://snwagh.com/blog/2026/open-source-vs-frontier/), [MindStudio: OpenRouter Fusion](https://www.mindstudio.ai/blog/what-is-model-fusion-openrouter-fusion-explained)
- [infrabase: inference providers](https://infrabase.ai/blog/ai-inference-api-providers-compared), [benchlm: Cerebras vs Groq](https://benchlm.ai/blog/posts/cerebras-won-speed-not-the-shortlist), [presenc: Groq vs Cerebras](https://presenc.ai/research/groq-cerebras-inference-speed-benchmarks-2026)

# Osa-alueselvitykset (19.10.2026, neljä Sonnet-agenttia, vain hakuyhteenvedot)

Lukujen 7–10 lähdeviitteet ovat lukujen omissa lähdeluetteloissa. Repoväitteet (luku 10) tarkistettiin: `scopes/palvelu/nebius-valitys.mjs` on Anthropic→OpenAI-käännöspalvelin (rivit 2–3), portti 11240 (rivi 303), katon oletus `{istunto: 0, paiva: 0}` (rivi 27), `~/.config/scopes/nebius-katto.json` puuttuu.

## 7. Käyttäjien toteutukset ja keskustelut

Huomio: WebSearch palautti yhteenvetoja, ei yhtään Reddit- tai HN-ketjua Opus 5.5 -aikakaudelta (Reddit-hakuja ei osunut lainkaan). Sivuja ei luettu itse. Moni lähde vertaa Opus 4.6/4.7/4.8/5:een, ei 5.5:een. Merkinnät: (valm.) = valmistajan tai myyjän oma luku, (anekdootti) = yksittäinen kokemus.

### 7.1 Mitä yhdistelmiä ajetaan
- Claude Code Router (musistudio, MIT, yli 36 000 tähteä) ohjaa Claude Coden muille tarjoajille; sponsori on Z.ai, joten GLM-suositukset ovat myyntivetoisia ([everydev](https://www.everydev.ai/tools/claude-code-router/llms.txt), [news.hada.io](https://news.hada.io/topic?id=22288)).
- Yhteisön reititysmalli: Kimi K2 suunnitteluun, GLM 4.5 Air taustatehtäviin, erillinen hakuntarjoaja, varareitit ([DEV](https://dev.to/oharu121/building-an-ai-development-environment-with-claude-code-x-claude-router-x-open-router-14o7)). Tämä on asetusmalli, ei laatumittaus. Kuvaukset ovat 2025-aikaisia.
- OpenCode: orkestroija plus alaagentit, joilla kullakin oma malli, oikeudet ja kehote ([Medium](https://medium.com/@coductor/opencode-and-the-multi-model-stack-route-tasks-to-the-model-best-for-each-d72970aa30b6)). Regolo Brick on reitityspalvelin, joka luokittelee pyynnön kuuteen ulottuvuuteen (valm.) ([regolo](https://regolo.ai/opencode-brick-for-multi-agent-coding-and-optimize-costs-up-to-80/)).
- Aider architect/editor: hakuun ei löytynyt avoimien mallien pariyhdistelmien mittauksia ([guide](https://cadence.withremote.ai/blog/aider-for-engineers)).

### 7.2 Planner + halpa toteuttaja
- Codeminer42: Opus 4.7 + GLM 5.1 -jako maksoi noin 41 % pelkän Opuksen hinnasta; kirjoittaja huomauttaa lukujen olevan viitteellisiä ([Codeminer42](https://blog.codeminer42.com/?p=13219)) (anekdootti).
- Omat ilmoitukset 60–80 %:n säästöstä ja "70 % ilman laatukatoa" ([bswen](https://docs.bswen.com/blog/2026-04-02-opus-planner-cheap-executor), [HackerNoon](https://hackernoon.com/lite/you-do-not-need-claude-opus-for-every-step-here-is-how-to-cut-your-agent-costs-by-90percent)) (anekdootti).
- Morph: 4-kertainen kustannusleikkaus planner+executor-pareilla ([Morph](https://www.morphllm.com/multi-agent-model-routing)) (valm.).
- Vastanäyttö: Akita on Rails mittasi, että vahva planner + halpa toteuttaja häviää pelkälle Opus 4.7:lle kypsässä harnessissa; poikkeus oli GPT-pohjainen pari, joka leikkasi kuluja ja menetti hieman laatua ([akitaonrails](https://akitaonrails.com/en/2026/04/25/llm-benchmarks-vale-a-pena-misturar-2-modelos/)) (anekdootti, mutta toistettu mittaus).
- Toistuva vika: halpa toteuttaja tuottaa syntaksiltaan oikeaa mutta arkkitehtuuriltaan väärää koodia ilman yksityiskohtaista suunnitelmaa; toteuttaja aloittaa ilman suunnittelijan perusteluja ([bswen](https://docs.bswen.com/blog/2026-04-02-opus-planner-cheap-executor)) (anekdootti).

### 7.3 Yksittäinen avoin malli vs. Opus (laatu)
- Kimi K3 vs Opus 4.8: yksinkertaisissa GitHub-issue-tehtävissä lähes tasoissa, monimutkaisissa jäljessä; ansatehtävissä Opus epäonnistui ~8 %, K3 ~36 % ([MindStudio](https://www.mindstudio.ai/blog/kimi-k3-real-world-coding-review)) (anekdootti, yksi testaaja).
- Akita: Ruby-sovelluksessa K3 89 vs Opus 4.8 95, K3 40 % halvempi ([akitaonrails](https://akitaonrails.com/en/2026/07/17/llm-benchmarks-kimi-k3/)) (anekdootti).
- Tom's Guide, 15 tehtävää, Opus 5 voitti monen agentin TDD-tehtävän ja refaktoroinnin ([Tom's Guide](https://www.tomsguide.com/ai/i-gave-claude-opus-5-and-kimi-k3-15-impossible-prompts-the-winner-surprised-me)) (anekdootti).
- Moonshotin omassa taulukossa K3 voittaa Opus 4.8:n kaikissa koodaustesteissä; riippumaton head-to-head on ohutta ([evolink](https://evolink.ai/blog/kimi-k3-vs-claude-opus-4-8)) (valm.).
- MiMo-V2.6-Pro: käytännön Claude Code -arviota ei löytynyt, vain aggregaattisivuja ([opencode compare](https://opencode.ai/data/compare/anthropic/claude-opus-5/xiaomi/mimo-v2-6-pro)).

### 7.4 Monimallijärjestelmät ja reitittimet
- GitHub HydraFusion (tutkimusesikatselu): valitsee single/cascade/critique; ~0,1 pp Opus 5:n alle 65 % halvemmalla ([GitHub-blogi](https://github.blog/ai-and-ml/project-hydrafusion-frontier-quality-via-multi-model-orchestration/), [zeli](https://zeli.app/story/49566788)) (valm., sisäinen offline-arvio).
- OpenRouter Fusion: latenssi 2–3x, hinta 4–5x yhteen kutsuun verrattuna, ei suositella rutiinikoodaukseen eikä regressiotesteihin (tulokset vaihtelevat); väite "puoli hintaa" on myyjän ([OpenRouter](https://openrouter.ai/blog/insights/fusion-explainer/), [aireiter](https://aireiter.com/es/blog/openrouter-fusion-api-review)) (valm.).
- Sakana Fugu vs Opus 4.8: ~5x kalliimpi ja ~4,5x hitaampi, tulokset usein samankaltaiset ([MindStudio](https://www.mindstudio.ai/blog/sakana-fugu-vs-claude-opus-4-8-comparison)) (anekdootti/aggregaatti).
- Coral AgentRadio: monta Opus 4.6 -agenttia voitti yhden Opus 4.8:n, mutta ~6x kustannuksella; yksi Claude Code + Opus 5 sai 63,17 % vs 62,1 % ([runtimewire](https://runtimewire.com/article/coral-agentradio-coding-agents-accuracy-cost)).
- Arize/Databricks: halvempi tokenihinta voi olla kalliimpi per tehtävä, kun malli kuluttaa 1,9x tokeneita ([Arize](https://arize.com/blog/how-cheap-models-changed-multi-agent-economics/)).

### 7.5 Nopeus
- Cerebras + GLM (Claude Code CLI:n kautta): käyttäjät raportoivat, että odotus siirtyy testien ajoon ([HN](https://news.ycombinator.com/item?id=45429212), [HN GLM-4.6](https://news.ycombinator.com/item?id=45852751)) (anekdootti, 2025). Cerebras väittää 1 500+ tok/s ja 20x Sonnet 4.5:tä ([Cerebras](https://www.cerebras.ai/blog/glm-4-7)) (valm.).
- Päiväkiintiö kuluu nopeasti, koska jokainen työkalukutsu lähettää koko historian uudelleen ([HN](https://news.ycombinator.com/item?id=45852751)) (anekdootti).
- Yhteisöllä on tarvittu erillinen Cerebras-transformeri työkalukutsujen ja rate limitin käsittelyyn ([CCR #1178](https://github.com/musistudio/claude-code-router/issues/1178)).

### 7.6 Toistuvat ongelmat
- Työkalukutsut: GLM-5.3 läpäisi paikallisessa testissä ja löysi koodin 33 k:n lokista ([XDA](https://www.xda-developers.com/you-can-run-a-744b-model-on-your-own-hardware/)) (anekdootti); opencode-sivun tool-use-pisteet (GLM 100, MiMo 50) ovat sivuston, ei riippumaton mittaus ([opencode compare](https://opencode.ai/data/compare/glm/mimo)).
- Pitkä konteksti: kontekstiksi ilmoitetaan ~1 M (GLM-5.3, MiMo), mutta paikallisessa ajossa 32 k:n kehotteen odotus yli 6,5 min ([XDA](https://www.xda-developers.com/you-can-run-a-744b-model-on-your-own-hardware/)) (anekdootti, paikallinen kvantisoitu).
- Ilmaiset/halvat tasot loppuvat (saldovirhe GLM:llä) ([Habr](https://habr.com/en/articles/951424)) (anekdootti).

## Mitä tästä seuraa
- Käyttäjänäyttö tukee säästöä (noin 40–75 %), ei Opus 5.5:n ylittämistä: avoin yksittäismalli häviää ansa- ja monimutkaisissa tehtävissä, ja planner+executor häviää kypsässä harnessissa ainakin Akitan mittauksessa.
- Nopeus löytyy vain erikoispiiristä (Cerebras) ja pienemmistä malleista; Fusion/Fugu-tyyppiset yhdistelmät ovat hitaampia ja kalliimpia.
- Mittaa per tehtävä (tokenit, uudelleenyritykset), ei per token. Vertailu tehdään Scopesin omalla joukolla ja Opus 5.5 high -vertailulla.
- Ota suunnitelman laatu ja toteuttajan konteksti (perustelut mukaan) mittarin kohteeksi, koska siinä toistuva vika.

## 8. Mallit ja palveluntarjoajat

Haettu 19.10.2026, 12 WebSearch-hakua (5 extended). Luvut ovat hakutyökalun yhteenvetoja sekundäärilähteistä (blogit, aggregaattorit); primäärisivuja ei luettu. Ristiriitaiset luvut on merkitty. (valm.) = valmistajan oma luku.

### 8.1 Avoimet kärkimallit

| Malli | Kokonais / aktiivinen | Konteksti | Lisenssi | Huomiot |
|---|---|---|---|---|
| MiMo-V2.6-Pro (Xiaomi) | ~1,02T / ~42B, 384 asiantuntijaa, 8 aktiivista | 1M, tuloste 128k | MIT, FP8-painot | Agenttimalli; vLLM:ssä tarvitaan `--tool-call-parser mimo`, muuten työkalukutsut tulevat tekstinä. Mallikortin README oli tyhjä. [1] |
| GLM-5.3 (Z.ai) | 744B (yksi lähde 753B) / 40B | 1M (yksi lähde 1,3M) | MIT (oletus, GLM-5.2-pohja) | AA-indeksi 60 yhden lähteen mukaan (ESITIEDOT: 45, eri versio/asteikko). [2][3] |
| GLM-5.3 Flash | 320B / 18B, FP8 ~306 GiB | 1M | MIT | Terminal-Bench 2.1 84,3 ja DeepSWE 63,4 (valm.; mitattu Claude Code -valjaissa); AA 57. [4] |
| Kimi K3 (Moonshot) | 2,8T / 104B, 16/896 asiantuntijaa | 1M, teksti+kuva+video | Kimi K3 -lisenssi (MIT-tyylinen, $20M liikevaihto/100M MAU -ehdot; lähteet ristiriitaiset), painot 27.7.2026 | FrontierSWE 81,2 ja Terminal-Bench 2.1 88,3 (valm.); AA 57,1, 4./189. [5] |
| DeepSeek V4-Pro | 1,6T / 49B | 1M, tuloste 384k | MIT | V4-Flash 284B / 13B. "V4.1" ei vahvistunut; versio V4 Pro 0813 on olemassa. [6][7] |
| Qwen3.8-Max (avoimet painot) | 2,4T / 95B | 262k natiivi | Oma Qwen3.8 Max -lisenssi | Päättely pakollinen; ~1,12 TB, väh. 4xB200 tai 8xH100; AA 56-58 (epävarma). [8] |
| Nemotron-Labs Teacher | 550B / 55B | – | OpenMDW-1.1 | Koulutuksen opettaja/tuomari; ei riippumatonta arviota. [8] |
| Step 5, gpt-oss, MiniMax | – | – | – | Ei löytynyt uutta (MiniMax-H3 vain listaus 31.7.2026). |

Vahvuudet osa-alueittain: agenttikoodaus Kimi K3 ja GLM-5.3 Flash (valm.); hinta/teho MiMo ja DeepSeek V4-Pro; pitkä konteksti: kaikilla 1M, GLM-5.3 Flash:lla ajautumista yli ~700k [4]. Riippumattomia työkalukutsulaatumittauksia ei löytynyt.

### 8.2 Palveluntarjoajat x malli ($/M syöte / tuloste; nopeus tok/s)

| Tarjoaja | Malli | Hinta | Nopeus / viive | Lähde |
|---|---|---|---|---|
| Nebius Token Factory | Kimi K3 | 3,00 / 15,00 | – | [9] |
| Nebius | GLM-5.3 / 5.2 | 1,40 / 4,40 | – | [9] |
| Nebius | GLM-5.3 Flash | 0,15 / 0,50 | – | [9] |
| Nebius | Kimi K2.7 Code | 0,95 / 4,00 | – | [9] |
| Z.ai (oma) | GLM-5.3 | 1,40 / 4,40, välimuisti 0,26 | AA ~59 tok/s, ensimmäinen token 1,6 s; OpenRouter-sivu 27 tok/s, 5,3 s | [3][10] |
| Z.ai (oma) | GLM-5.3 Flash | 0,15 / 0,50 (toinen lähde 0,075 / 0,25) | – | [4] |
| DeepInfra | GLM-5.3 | 1,20 / 4,00 | – | [3] |
| DeepInfra | DeepSeek V4-Pro | 1,30 / 2,60 | – | [7] |
| DeepSeek (oma) | V4-Pro | 0,435 / 0,87 (toinen raportti 1,74 / 3,48; ristiriita) | AA 79-89 tok/s (V4 Pro 0813) | [6][11] |
| Moonshot (oma) | Kimi K3 | 3,00 / 15,00 | AA 39-42 tok/s; muut lähteet ~62; OpenRouter-mediaani 56 | [11][12] |
| OpenRouter | Kimi K3 / V4 Pro 0813 | tuloste 6,99 / 2,90 (vaihtelee tarjoajan mukaan) | – | [12] |
| Xiaomi (oma) | MiMo-V2.6-Pro | 0,43 / 0,87 (ESITIEDOT) | ~48 | ESITIEDOT |
| Cerebras | gpt-oss-120B, GLM-4.7, Qwen3.8 27B | – | gpt-oss ~1 700 (AA; valm. 3 000); Qwen3.8 27B ~1 850 (valm.) | [13] |
| Groq | gpt-oss, Qwen | – | gpt-oss-120B 256-500; Qwen3 32B 400-660 | [13] |
| SambaNova | – | – | gpt-oss ~353 (yksi blogi); ilmaiskrediitit loppuneet 8/2026 | [13] |

Käyttörajat: Groq ilmaistaso 30 rpm / 1 000 pv / 200k tokenia pv, Developer-taso 1 000 rpm; Cerebras ilmainen taso 5-30 rpm, 1M tokenia pv (lähteet ristiriitaiset, siirtymässä $5 kokeiluun) [13]. Mikään lähde ei kerro Cerebras/Groq-tarjontaa kärkimalleille (MiMo, GLM-5.3, K3).

Datan sijainti: Nebiuksen päätepistesivu listaa mallikohtaisen alueen (esim. Kimi K3 eu-west2, GLM-5.2 uk-south1, muita us-central1 ja eu-north1); sekundäärilähteiden mukaan EU/US-valinta ja DPA [9]. Kiinalaisten valmistajien omat API:t käsittelevät dataa Kiinassa (oletus, ei lähdettä).

Anthropic Messages -yhteensopivuus: DeepSeek `https://api.deepseek.com/anthropic` (virallinen dokumentaatio) [14]; GLM `https://open.bigmodel.cn/api/anthropic` (vain opas, ei vahvistettu) [14]; Kimi: Moonshotin URL ei selvinnyt; Tencent LKEAP tarjoaa K2.5:n Anthropic-muodossa [14]; MiMo, Nebius, OpenRouter, Together, Fireworks, Baseten: ei löytynyt. Kolmannen osapuolen oppaan mukaan ei-Claude-mallit voivat rikkoa Claude Coden.

### 8.3 Oma rauta

| Malli | Tarve | Hinta |
|---|---|---|
| Kimi K2.x (1T / 32B) | 4xB200 INT4 (~630 GB) tai 8xH200 FP8 (~1 TB) | 4xH200 spot $7,28/h; 8xB200 spot $21,68/h (6/2026) |
| GLM-5.2/5.3 (~744B) | FP8 744-890 GB = 8xH200 tai B200 | sama luokka |
| Kimi K3 (2,8T) | useita solmuja (ei tarkkaa lukua) | 8xB200-solmu ~$32 000-35 000/kk ($5,5-6/GPU-h) |
| GLM-5.3 Flash (320B) | ~306 GiB FP8, 4-8 GPU | – |

Kannattavuusraja K3:lle noin 2 mrd tulostetokenia/kk; sen alla API on halvempi ja helpompi. Tyhjäkäynti nostaa tokenihintaa. [15] Scopesin käyttömäärällä oma rauta ei kannata.

### Mitä tästä seuraa

- Kärkimallit ovat 40-100B aktiivisia ja 1M kontekstia, mutta GPU-palveluissa 26-89 tok/s; yksikään hakutulos ei näytä niitä Cerebras/Groq-nopeudella. Nopeusvaatimus täyttyy vain pienillä malleilla (gpt-oss, Qwen3.8 27B, GLM-5.3 Flash).
- Halpa ja riittävä ehdokas on GLM-5.3 Flash (AA 57, $0.15/$0.50) ja DeepSeek V4-Pro ($0.44/$0.87 tai ~$1.30/$2.60); Kimi K3 on 7-17x kalliimpi tulosteessa.
- Nebius sopii nykyiseen välityspalvelimeen (EU-alue, K3 ja GLM saatavilla); MiMo:n saatavuus Nebiuksessa ja Anthropic-muoto muilla kuin DeepSeekillä on mitattava itse.
- Oma rauta ei kannata alle ~2 mrd tulostetokenia/kk.
- Lähteet ovat sekundäärisiä ja luvut ristiriitaisia (hinnat, AA-pisteet, versiot): tärkeät luvut tarkistettava ennen päätöstä.

### Lähteet

[1] https://www.mindstudio.ai/blog/mimo-v2-6-pro-rl-release, https://artificialanalysis.ai/models/mimo-v2-6-pro
[2] https://lyceum.technology/models/z-ai/glm-5.3/
[3] https://computeprices.com/models/glm-5-3, https://pricepertoken.com/pricing-page/model/z-ai-glm-5.3
[4] https://www.datacamp.com/blog/glm-5-3-flash, https://aicybr.com/blog/glm-5-3-flash-local-deployment-guide
[5] https://www.morphllm.com/kimi-k3, https://roo.beehiiv.com/p/kimi-k3-open-weights-license-benchmarks
[6] https://decrypt.co/365455/deepseek-v4-launch-pro-version-costs-less-gpt-5-pro
[7] https://requesty.ai/models/deepinfra/deepseek-ai-deepseek-v4-pro
[8] https://aireiter.com/blog/qwen-3-8-max-open-weights, https://www.orcarouter.ai/blog/nemotron-labs-teacher-general-reasoning-vs-qwen-3-8-max
[9] https://tokenfactory.nebius.com/endpoints, https://models.opencode.ai/providers/nebius/
[10] https://openrouter.ai/z-ai/glm-5.3-20260816
[11] https://artificialanalysis.ai/models/comparisons/deepseek-v4-pro-vs-kimi-k3
[12] https://openrouter.ai/compare/deepseek/deepseek-v4-pro-0813/moonshotai/kimi-k3, https://myclaw.ai/blog/kimi-k3-vs-deepseek-v4-pro
[13] https://www.spheron.network/blog/groq-lpu-vs-cerebras-wse-cheapest-inference-2026/, https://inference-docs.cerebras.ai/models/overview, https://www.morphllm.com/cerebras-pricing
[14] https://api-docs.deepseek.com/guides/anthropic_api, https://cloud.tencent.cn/document/product/1772/130552
[15] https://dev.to/mr_manushukla/self-hosting-kimi-k3-28t-in-2026-gpu-sizing-cost-and-the-api-break-even, https://www.spheron.network/blog/deploy-glm-5-2-gpu-cloud/

## 9. Yhdistelmän rakenne

Haettu 19.10.2026 WebSearchilla (14 hakua, 5 extended). Luettiin vain hakutyökalun yhteenvedot, ei primäärisivuja; luvut ovat siis toissijaisia, ellei toisin mainita. (valm.) = valmistajan oma luku. Kaikki Opus 5.5 -vertailut puuttuvat: lähteet vertaavat Opus 4.8:aan, GPT-5.5:een tai Fable 5:een.

### 9.1 Taulukko

| Menetelmä | Mitattu hyöty | Kustannus (x) | Viive (x) | Sopii tehtäviin |
|---|---|---|---|---|
| Reititys (RouteLLM) | 95 % GPT-4:n laadusta; kustannus -85 % MT-Benchissä, -45 % MMLU:ssa, -35 % GSM8K:ssa [lähde](https://lmsys.org/blog/2024-07-01-routellm/) | alle 1 (säästö) | ~1 (yksi malli ajetaan) | liikenne, jossa paljon helppoa; ei ylitä parasta mallia. OOD:ssa (MMLU) reititin oli lähes satunnainen [lähde](https://lmsys.org/blog/2024-07-01-routellm/) |
| Kaskadi / vaikeusarvio | FrugalGPT: kärkimallin taso jopa -98 % kustannuksella (toissijainen, tarkistamatta) [lähde](https://neuraltrust.ai/blog/llm-model-routing) | alle 1 | 1 helpoilla, noin 2 vaikeilla (halpa + arvio + kallis) [lähde](https://neuraltrust.ai/blog/llm-model-routing) | tehtävät, joissa luottamus on mitattavissa; spekulatiivinen kaskadi poistaa osan viiveestä [lähde](https://research.google/pubs/faster-cascades-via-speculative-decoding/) |
| Vaikeusreititin + vLLM-sr confidence | arvio: 80 % DeepSeek V4 Pro + 20 % GPT-5.5 ≈ $0,040 vs. $0,160 aina GPT-5.5 (toissijainen arvio) [lähde](https://www.aipricing.guru/news/vllm-micro-agent-frontier-model-pricing-impact-june-2026/) | ~0,25 | ~1–2 | yleinen API-liikenne |
| Mixture-of-Agents (Together) | AlpacaEval 2.0 65,1 % vs. GPT-4o 57,5 % [lähde](https://together.ai/blog/together-moa) | useita (kaikki ehdokkaat + yhdistäjä) | hitaampi ensimmäinen token (valmistaja myöntää) [lähde](https://together.ai/blog/together-moa) | avoin keskustelu/generointi; heikko näyttö tarkistettavista tehtävistä |
| Self-MoA (sama paras malli monta kertaa) | +6,6 % AlpacaEval 2.0:ssa ja +3,8 % keskimäärin (MMLU, CRUX, MATH) vs. sekoittava MoA [lähde](https://arxiv.org/abs/2502.00674) | N × yksi malli + yhdistäjä | rinnakkain: 1 + yhdistäjä | monipuolinen näyttö: kannattaa ensin käyttää parasta mallia monta kertaa, ei sekoittaa heikompia. Sekoitus heikentää keskilaatua [lähde](https://arxiv.org/abs/2502.00674) |
| Fuusio (OpenRouter Fusion) | DRACO (deep research, 100 tehtävää): halpa paneeli (Gemini 3 Flash, Kimi K2.6, DeepSeek V4 Pro) 64,7 % ≈ Fable 5 65,3 %, noin puolet hinnasta (valm.); Opus 4.8 + oma kopio 58,8 → 65,5 % (valm.) [lähde](https://openrouter.ai/blog/insights/fusion-explainer/) | useita yhden kutsun hintoja (paneeli + tuomari) [lähde](https://en.kocpc.com.tw/archives/3058) | noin 2–3 (hitain jäsen + synteesi) [lähde](https://en.kocpc.com.tw/archives/3058) | tutkimus ja synteesi; ei riippumatonta toistoa |
| Sakana Fugu | Fugu Ultra SWE-Bench Pro 73,7 (valm.), Ultra 59,0 → 73,7 vs. Fugu [lähde](https://theaileverage.beehiiv.com/p/sakana-fugu-the-model-router-hiding-inside-one-api); ei riippumatonta vahvistusta [lähde](https://datanorth.ai/news/sakana-ai-launches-fugu-and-fugu-ultra) | Ultra $5/$30 per M; yksi anekdootti: $0,51 vs. $0,03 halvimmalla mallilla [lähde](https://www.mejba.me/blog/sakana-fugu-ultra-orchestration-tested) | hitaampi kuin yksi malli; Mollickin koodaustestit ~30 min [lähde](https://datanorth.ai/news/sakana-ai-launches-fugu-and-fugu-ultra) | koodaus, päättely; ei avoin eikä halpa |
| vLLM Semantic Router (looper: confidence, ratings, remom, fusion) | GPQA-D 96,0 vs. GPT-5.5 93,6 (toissijainen; alustava) [lähde](https://www.aipricing.guru/news/vllm-micro-agent-frontier-model-pricing-impact-june-2026/) | vaihtelee; agenttisilmukat voivat ylittää halvan yksittäismallin [lähde](https://www.aipricing.guru/news/vllm-micro-agent-frontier-model-pricing-impact-june-2026/) | ReMoM: leveys + synteesikierros; fusion kokeellinen [lähde](https://vllm-sr.ai/docs/next/tutorials/algorithm/overview/) | avoin koodi, sopii Scopesin välityspalvelimen kohtaan |
| Best-of-N + tarkistin (testit, PRM) | SWE: +5…17 pistettä; DeepSWE 42,2 → 59 %; CWM 53,9 → 65,8 % [lähde](https://modal.com/resources/best-open-source-models-swe-bench-coding-agents), [CWM](https://arxiv.org/pdf/2510.02387) | N × (usein 8–50) | rinnakkain ~1–2 + tarkistus | tarkistettavat tehtävät: koodi, testit. Avoimet tarkistimet jäävät pass@K-katosta [lähde](https://arxiv.org/pdf/2604.01496) |
| Test-time compute (Snell) | adaptiivinen jako >4x tehokkaampi kuin best-of-N; pieni malli voittaa 14x suuremman, jos sillä on jo ei-triviaali onnistumisaste [lähde](https://arxiv.org/pdf/2408.03314) | FLOP-vertailussa ≈ 1 | pidempi | väliasteen vaikeus, matematiikka; ei vaikeimpiin |
| Suunnittelija–toteuttaja (Aider architect/editor) | o3 + GPT-4.1 83 % Polyglotissa, halvempi kuin o3 yksin (toissijainen); rivit ovat järjestelmätuloksia, ei yksittäismalleja [lähde](https://www.promptlayer.com/glossary/aider-architect-mode), [lähde](https://leaderboard.steel.dev/leaderboards/aider/) | alle 1 | noin 1–2 (kaksi vaihetta peräkkäin) | koodimuokkaus; leaderboard vanhentunut [lähde](https://codemyspec.com/blog/aider-review-2026) |
| Väittely / kritiikki | ei luotettavasti parempi kuin self-consistency yhdeksällä testillä, neljällä mallilla [lähde](https://arxiv.org/html/2502.08788v2) | useita kierroksia | useita kierroksia | ei suositella; heterogeeninen väittely auttaa vähän |
| Spekulatiivinen dekoodaus (EAGLE-3) | häviötön; tyypillisesti 2–3x, huippu 6,5x (vendor-sivut); P-EAGLE +1,05–1,69x EAGLE-3:n päälle [lähde](https://www.morphllm.com/vllm-speculative-decoding), [lähde](https://aihub.hkuspace.hku.hk/2026/03/14/p-eagle-faster-llm-inference-with-parallel-speculative-decoding-in-vllm/) | ≈ 1 | 0,3–0,5 | omalla palvelimella ajettaville avoimille malleille; hyöty häviää, jos hyväksymisaste < ~0,55 [lähde](https://learn.traeai.com/t/ai-engineering/phases/17-infrastructure-and-production/05-eagle3-speculative-decoding) |

### 9.2 Co-failure-katto (arXiv 2606.27288)

- Väite: kun lopputulos on jonkin jäsenen vastaus, tarkkuus ≤ 1 − β, β = kaikkien mallien yhteinen virheosuus [lähde](https://arxiv.org/abs/2606.27288). Kattoa kutsutaan reititykselle, äänestykselle ja MoA:lle (otsikko) [lähde](https://arxiv.org/pdf/2606.27288).
- Mitattu: MATH-500:ssa β = 0,052 (katto sitoo); GPQA-Diamondissa 0/130 kysymystä, jossa kaikki väärin, eli katto käytännössä auki [lähde](https://arxiv.org/pdf/2606.27288). Tarkistettavissa tehtävissä yhdistelmä harvoin voittaa parasta yksittäismallia ilman vahvaa kysymyskohtaista signaalia [lähde](https://arxiv.org/pdf/2606.27288).
- Koskeeko synteesiä? Katto on määritelty politiikoille, jotka palauttavat jäsenen vastauksen. Synteesi voi kirjoittaa uuden vastauksen, joten teoriassa se ei ole katon alainen. Käytännössä näyttö on vähäistä: yksi esijulkaisu raportoi trace-tason synteesille +3,5 pp GPQA:ssa ja +5,3 pp LCB-Hardissa enemmistöäänestystä paremmin [lähde](https://arxiv.org/html/2605.29116v1). Yhdistäjän valinta ratkaisee: hyvä ehdottaja voi olla huono yhdistäjä [lähde](https://arxiv.org/pdf/2601.16596). En löytänyt tutkimusta, joka mittaisi yhdistäjän epäonnistumista, kun oikea vastaus on vähemmistössä. Tämä on tulkintani, ei lähteen väite.
- Hyödyllinen käytäntö: arvioi β omalla joukolla Clopper–Pearson-rajalla ennen reitittimen rakentamista [lähde](https://arxiv.org/pdf/2606.27288).

### 9.3 Mikä yhdistelmä voisi ylittää Opus 5.5:n

Ei suoraa näyttöä Opus 5.5:tä vastaan. Lähimmät: fuusio ylittää Fable 5:n DRACO:ssa (69,0 vs. 65,3; paneelissa suljettuja malleja) (valm.) ja halpa avoin paneeli yltää siihen (64,7) [lähde](https://pulse2.com/openrouter-introduces-fusion-to-combine-multiple-ai-models-for-stronger-deep-research-performance/). Realistiset ehdokkaat, arvio omastani eikä lähteistä:
1. Tarkistettava koodi: Self-MoA/best-of-N avoimella kärkimallilla (MiMo-V2.6-Pro, GLM-5.3) + testit tarkistimena. Hinta N × 0,43/0,87 $/M (ESITIEDOT) eli noin 4–8 × MiMo-kutsu ≈ alle puolet Opus high -hinnasta ($1,82/tehtävä). Viive 1,5–3x yhteen avoimeen malliin nähden, rinnakkaisena; Opusta nopeampi vain, jos jäsen on nopea.
2. Tutkimus ja synteesi: halpa 3 mallin paneeli + tuomari, ~puolet kärjen hinnasta, 2–3x viive.
3. Helppo/vaikea-reititys: halpa malli helpoille, Opus tai paneeli vaikeille; säästö ja nopeus, ei älykkyysvoittoa.
Vaikeimmat tehtävät (Terminal-Bench, SWE Pro): ei näyttöä, että mikään avoin yhdistelmä ylittäisi Opus 5.5:tä.

### 9.4 Mitä tästä seuraa

- Älykkyys, nopeus ja hinta eivät toteudu yhtä aikaa: kaikki luotettavat älykkyyshyödyt (fuusio, MoA, best-of-N) maksavat 2–3x viivettä tai enemmän; nopeus tulee vain reitityksestä, spekulatiivisesta dekoodauksesta tai erikoispiiristä.
- Paras koe on Self-MoA tai best-of-N testitarkistimella Scopesin koodaustehtävissä, koska siellä katto on avoin, jos β on pieni; mittaa β ensin (vaatii kustannuskaton).
- Vältä väittelyä; synteesiä kannattaa kokeilla vain tuomarilla, joka on mitattu hyväksi yhdistäjäksi.
- Fugu ja Fusion ovat valmistajalukuja ilman Opus 5.5 -vertailua; älä rakenna päätöstä niiden varaan.
- vLLM Semantic Router on halvin tapa kokeilla looper-tiloja omalla välityspalvelimella, mutta sen tulokset ovat alustavia.

## 10. Integraatio ja riskit

Haettu 19.10.2026. Repo luettu vain; verkkolähteet ovat WebSearch-yhteenvetoja (primäärisivuja ei luettu), joten luvut ovat tarkistamattomia.

### Nykytila repossa

**Mallivalinta**
- Claude-mallit: `MALLIT` (Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5) scopes/palvelu/viestit.mjs:26-31; AGY-mallit (Gemini 3.8 Flash, GPT-OSS 120B, Claude via agy) viestit.mjs:18-25.
- Chatin Nebius-mallit hintoineen (`NEBIUS_CHAT_MALLIT`, $/M) viestit.mjs:36-40; chat kutsuu Nebiusta `ssh <kone> curl` -putkella (viestit.mjs:42-43, `nebiusChat` :479). Mallilista kootaan viestit.mjs:435 ja Nebius näkyy vain, jos avaintiedosto on olemassa (:433-434).
- Istuntojen ja purkajien lista: scopes/palvelu/purkajat.mjs. `NEBIUS_MALLIT` (5 mallia, DeepSeek V4 Flash/V4.1 Flash/V4 Pro, MiniMax M3, Kimi K2.7 Code) :27-34; lista kootaan :58-80; allowlist-validointi `tarkista` :83-109 (muu kuin listan jäsen = 400). Kommentti :24-26: Nebius-mallit valittu Claude Code -agenttitestillä 14/14; Qwen3-30B ja Qwen3.8-27B "jumiutuivat" ja jätettiin pois. Mallilista on käsin ylläpidetty kovakoodattu taulukko, ei mittaustuloksista generoitu.
- Koordinaattori (scopes/palvelu/kordinaattori.mjs:6-23) on kolmen agentin tiimi (keskustelu, selvitys, ongelmanratkaisija), joilla kullakin kiinteä oletusmalli (Gemini Flash low/medium/high); `ratkaiseMalli` :80-84 on pelkkä taulukkohaku, ei kysymyskohtaista reititystä. Tiedosto on vielä versioimaton (git status: ??).

**Miten ei-Claude-malli ajetaan**
- Claude Code + oma käännösvälityspalvelin: scopes/palvelu/nebius-valitys.mjs. Nebius puhuu vain OpenAI-muotoa (/v1/messages = 404, :2), joten välityspalvelin kääntää `/v1/messages` (myös virta ja työkalukutsut) -> `/v1/chat/completions` (`openaiRunko` :78-112, `anthropicVastaus` :121-128, `luoVirranKaantaja` :134-158). Kuuntelee 127.0.0.1:11240 (:311). Tämä on valmis kytkentäkohta reitittimelle: `a.model` on näkyvissä jokaisessa pyynnössä (:257).
- Käynnistys: claude/siirto/tools/autovaihto.sh:445 asettaa `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU}_MODEL` ja `CLAUDE_CODE_SUBAGENT_MODEL` samaan Nebius-malliin ja `CLAUDE_CODE_AUTO_COMPACT_WINDOW` = konteksti - 8192 (konteksti oletus 200000, :94). Eli jokainen mallirooli (myös aliagentit) osuu samaan malliin; roolikohtaista jakoa (esim. Haiku-rooli halvalle mallille) ei vielä käytetä.
- Rajoitus: ANTHROPIC_BASE_URL-istunto ei saa Remote Controlia (autovaihto.sh:78), näkyy vain äpin skoopin viesteissä.
- Paikallinen: sama kaava LM Studiolla (palvelin, `LM_URL`, autovaihto.sh:366; `LMS_MALLIT` viestit.mjs:105). qwen38-skoopissa on vain REKISTERI/HISTORIA/ARKISTO, ei koodia.
- Reitti Nebiukseen: OnePlus ei yletä suoraan, kutsu kulkee `ssh palvelin|mac curl` (nebius-valitys.mjs:5-7); `NEBIUS_YLAVIRTA` ohittaa (:8). Tämä on lisäviive ja yksittäinen vikapiste (kaksi konetta, järjestyksessä).

**Kustannuskatto (commit 0543d9ef)**
- nebius-valitys.mjs:9-13, 27, 62-73, 257-262: päivä- ja istuntokatto lasketaan tokenilokista Nebiuksen hinnoilla (`/v1/models?verbose=true`), kutsun pahin arvio = merkit/3 + koko max_tokens; ylitys, tuntematon hinta tai rikkinäinen katto = ei kutsua. Oletus `KATTO_OLETUS` {0, 0} (:27); tiedosto `~/.config/scopes/nebius-katto.json`.
- Tarkistus 19.10.2026: ~/.config/scopes/ sisältää nebius-avaimen mutta EI nebius-katto.json:ia, joten Nebius-kutsut estyvät tällä hetkellä kokonaan, kunnes käyttäjä hyväksyy summan (muisti paid-api-spend-needs-approval; V-557: katoton mittaus kulutti ~7,10 $).
- Kattoa ei ole chatin `nebiusChat`-polulla (viestit.mjs); se on kirjattu avoimeksi scopes chatille (V-558, istunnot/REKISTERI.md rivi 40 ja commit-viesti).

**Käyttörajat**
- scopes/palvelu/kayttoraja.mjs:1-80 näyttää vain Clauden 5 h- ja viikkorajan (`/api/oauth/usage`, kroonisesti 429; välimuisti 15 min, vahti 60 s). Avoimille malleille ei ole rate limit -seurantaa eikä 429-uudelleenyritystä/varamallia; toteutettu käsittely on vain kustannuskatto.

**Luonteva kytkentäkohta reitittimelle:** nebius-valitys.mjs:n pyyntökäsittelijä (:253-262), koska siellä on jo malli, hinta, kustannuslokitus, katto ja käännös; reititin voisi korvata `a.model`:n tehtäväluokan mukaan ja tehdä varamalliyrityksen virheessä. Vaihtoehto: claude-code-router/LiteLLM ulkopuolisena, mutta silloin katto ja ssh-reitti pitäisi kytkeä uudelleen.

### Riskit

| Riski | Tod. | Vaikutus | Lievennys |
|---|---|---|---|
| Työkalukutsut epäonnistuvat tai jumiutuvat avoimella mallilla (repossa jo havaittu: Qwen-mallit jumiutuivat) [1][3] | Korkea | Korkea (agenttisilmukka kaatuu) | Piilotestattu allowlist (purkajat.mjs:24-26) ja uusintamittaus jokaisesta versiosta; reititin pudottaa mallin, jos silmukka jumiutuu; ei riippumatonta virhelukua löytynyt |
| Käännöskerros (Anthropic <-> OpenAI) hävittää ominaisuuksia: thinking, prompt cache, beta-otsakkeet, tool search [4][5] | Keskitaso | Keskitaso-korkea | Anthropic suosittaa välittämään `anthropic-beta` sellaisenaan; ei-Anthropic-upstreamissa kääntäjän työ; `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` (toimivuus raportoitu osin rikkinäiseksi [5]); regressiotesti käännökselle |
| Kontrolloimaton kulutus (reititin + usean yrityksen strategia kerryttää tokeneita) | Korkea ilman kattoa | Korkea (V-557: 7,10 $) | Katto on jo (0543d9ef), mutta tiedostoa ei ole; chatin polulla ei kattoa (V-558); usean kutsun arvio pahimman tapauksen mukaan |
| Rate limit / 429 avoimilla palveluilla; Nebiuksen "rajaton" on markkinointia, dokumentoitu raja kasvaa 20 % / 15 min, perus ~400 k TPM, 60 RPM [6] | Keskitaso | Keskitaso | 429-uudelleenyritys ja varamalli toiselle tarjoajalle; OpenRouter-tyylinen fallback laskuttaa mallin mukaan [7] |
| Tarjoajan hiljaiset virheet: HTTP 200 ja tyhjä sisältö, kvantisointierot [7] | Keskitaso | Keskitaso | Tarkista `content`/`usage` joka vastauksesta; kiinnitä tarjoaja ja versio |
| Yksittäinen vikapiste: ssh-putki palvelin/mac -> Nebius | Keskitaso | Korkea (istunto pysähtyy) | Reittien järjestys on jo (nebius-valitys.mjs:5-7); lisää tilatarkistus ja viesti, harkitse suoraa yhteyttä |
| Tietosuoja: kiinalaisten laboratorioiden oma API (DeepSeek: palvelimet Kiinassa, ei DPA:ta/EU-sijaintia; sama lähde ristiriitainen koulutuskäytöstä) [8]. Moonshot/Z.ai: kansainvälinen politiikka sanoo Singapore, mutta lähteet ristiriidassa; Kiinan kansallinen tiedustelulaki mainitaan [9] | Korkea (jos suora API) | Korkea (repo, avaimet, REKISTERIT lähtevät) | Käytä länsimaista isännöijää avoimille painoille (Nebius: zero retention, SOC 2/ISO 27001 markkinointiväite, DPA saatavilla [6], vahvistettava kirjallisesti); älä lähetä salaisuuksia; suodata .env/avaimet pois kontekstista |
| Lisenssi: Kimi K3 vaatii erillisen sopimuksen suurille MaaS-palveluille (~20 M$ liikevaihto), K2:n muokattu MIT vaatii attribuution; Llama-lisenssissä "Built with" ja MAU-rajat [10] | Matala (yksityinen käyttö) | Matala-keskitaso | Tarkista LICENSE per versio; jos Scopes jaetaan muille palveluna, arvioi uudelleen |
| Mallin versiomuutos kesken käytön: tunnukset kuten `DeepSeek-V4-Flash-0731` on kiinnitetty päiväykseen (purkajat.mjs:28), mutta Nebiuksen lista elää (28 mallia 18.10.); poistuva tai hiljaa vaihtuva malli rikkoo allowlistin | Keskitaso | Keskitaso | Päiväyskiinnitetyt tunnukset; päivittäinen `/v1/models`-vertailu allowlistiin; hintojen puuttuminen katkaisee kutsun jo nyt (:257) |
| Claude Code -versiopäivitys rikkoo ei-Anthropic-upstreamin (uudet beta-kentät/otsakkeet, LiteLLM-tapaus) [4] | Keskitaso | Keskitaso | Kiinnitä claude-versio (vrt. muisti: claude update vs RC daemon), ajaa smoke-testi päivityksen jälkeen |
| Reititinpäätös ei tuota hyötyä (co-failure-katto, ESITIEDOT 4) | Keskitaso | Korkea (työ hukkaan) | Mittaa β ensin pienellä, hyväksytyllä kattoon sidotulla ajolla ennen reitittimen rakentamista |

### Lähteet

1. Ei riippumatonta virhelukua: [MindStudio: agent coding LLMs](https://www.mindstudio.ai/blog/best-open-source-llms-agentic-coding-2026), [d-central: tool-driving](https://d-central.tech/local-llm-agent-capability/) (Qwen kärjessä BFCL:ssä, sisäänrakennettu työkalupohja parempi; vendor-tyylisiä)
2. [Atlas Cloud: Claude Code third-party](https://www.atlascloud.ai/blog/guides/claude-code-third-party-api-setup), [Baker: ANTHROPIC_BASE_URL](https://andrewbaker.ninja/2026/08/10/how-to-run-claude-code-on-openrouter-with-alternative-models-like-deepseek-the-anthropic_base_url-guide/): DeepSeek `api.deepseek.com/anthropic`, Z.ai `open.bigmodel.cn/api/anthropic`, Moonshot `api.moonshot.cn/anthropic/` ovat suoria Anthropic-yhteensopivia päätepisteitä (kiinalaisen palvelun suoraan, ks. tietosuojariski)
3. [claude-code-router: x-cmd](https://www.x-cmd.com/install/claude-code-router), [cc-modelrouter](https://pkg.go.dev/github.com/iimmutable/cc-modelrouter): reitit default/background/think/longContext (longContext yli ~60 k tokenia); automaattinen vikasieto vahvistamaton; LiteLLM on vaihtoehto fallback/kuormanjakoon ([Medium](https://medium.com/@michael.hannecke/connecting-claude-code-to-local-llms-two-practical-approaches-faa07f474b0f))
4. [LiteLLM: Claude Code beta headers -tapaus](https://docs.litellm.ai/blog/claude-code-beta-headers-incident), [Claude Code LLM gateway protocol](https://code.claude.com/docs/en/llm-gateway-protocol)
5. [claudeissues.com #22893](https://claudeissues.com/issue/22893-bug-claude-code-disable-experimental-betas-1-does-not-suppress-anthropic-beta-ad)
6. [Nebius rate limits](https://docs.tokenfactory.nebius.com/ai-models-inference/rate-limits), [Nebius enterprise-grade inference](https://nebius.com/services/token-factory/enterprise-grade-inference)
7. [Pinggy: OpenRouter production pitfalls](https://pinggy.io/blog/openrouter_production_provider_routing_pitfalls/), [Requesty: OpenRouter rate limits](https://www.requesty.ai/blog/openrouter-rate-limits-why-they-happen-and-how-multi-provider-fallback-fixes-them)
8. [Sonomos: DeepSeek GDPR/HIPAA 2026](https://sonomos.ai/blog/is-deepseek-safe-gdpr-hipaa-2026/), [meetily: DeepSeek privacy](https://meetily.ai/llm-privacy/deepseek)
9. [wavect: Kimi K3 EU API review](https://wavect.io/blog/kimi-k3-eu-api-production-review/), [SecurityScientist: Zhipu GLM risk](https://www.securityscientist.net/blog/zhipu-glm-risk-assessment-template/), [cometapi: Kimi safety](https://www.cometapi.com/is-kimi-safe-to-use/) (sekundäärisiä, keskenään ristiriitaisia)
10. [Simon Willison: janky licenses](https://simonwillison.net/tags/janky-licenses/), [wz-it: LLM licences](https://wz-it.com/en/knowledge/ki/open-llm-licenses-commercial-use/)

### Mitä tästä seuraa

- Integraatio on jo suurelta osin olemassa: Claude Code + nebius-valitys.mjs (käännös, hinnat, katto) on se kohta, johon reititin ja varamallit kytketään; erillinen claude-code-router vaatisi katon ja ssh-reitin rakentamista uudelleen.
- Ennen mitään mittausta puuttuu käyttäjän hyväksymä katto (nebius-katto.json puuttuu, joten kaikki Nebius-kutsut ovat nyt estettyinä) ja chatin polun katto (V-558).
- Pidä ajo länsimaisella isännöijällä (Nebius) ja vältä kiinalaisten laboratorioiden omia API:ta, koska repon sisältö ja avaimet kulkisivat promptissa; avoimet painot eivät muuta tätä, ellei isännöijä ole länsimainen.
- Suurimmat tekniset riskit ovat työkalukutsujen luotettavuus ja käännöskerroksen ominaisuushäviöt, ja ne mitataan omalla piilotestisarjalla (olemassa, 14/14) ennen kuin malli lisätään reitittimen joukkoon; varamalli ja 429-käsittely puuttuvat vielä.

## 11. Yhteenveto ja ehdotettu suunta

1. **Opus 5.5:n ylittäminen yhtä aikaa älykkyydessä, nopeudessa ja hinnassa ei saa tukea yhdeltäkään osa-alueelta.** Opus 5.5:tä vastaan ei löytynyt yhtään riippumatonta yhdistelmämittausta. Kaikki yhdistelmäluvut vertaavat Opus 4.8:aan tai GPT-5.5:een, ja yhdistelmät (Fusion, Fugu, MoA) ovat 2–5 kertaa hitaampia.
2. **Hinta on varma etu, ja se näkyy myös käyttäjien kokemuksissa:** Opus suunnittelee ja halpa avoin malli toteuttaa, jolloin säästö on noin 40–75 %. Laatu kuitenkin heikkenee ansatehtävissä, ja yksi mittaus kypsässä harnessissa hävisi pelkälle Opukselle.
3. **Ainoa uskottava paikka älykkyysvoitolle on koodi, jossa testit toimivat tarkistimena.** Best-of-N testeillä tai Self-MoA parhaalla avoimella mallilla antoi vertailuissa +5…17 pistettä. Kustannus on N-kertainen ja viive 1,5–3-kertainen. Katto 1 − β sitoo vain, jos β on suuri, joten β mitataan ensin.
4. **Nopeus syntyy vain reitityksestä.** Helpot kysymykset ohjataan nopealle mallille (GLM-5.3 Flash, Cerebras tai Groq), vaikeat hitaalle yhdistelmälle.
5. **Integraatiosta suurin osa on jo olemassa:** `nebius-valitys.mjs` hoitaa käännöksen, hinnat ja katon. Reititin ja varamalli kytketään sen pyyntökäsittelijään. Puuttuvat: käyttäjän hyväksymä katto (kaikki Nebius-kutsut ovat nyt estettyjä), chatin polun katto (V-558), 429-käsittely ja varamalli.
6. **Pidä ajo länsimaisella isännöijällä** (Nebius EU) ja vältä kiinalaisten laboratorioiden omia API:ta, koska promptissa kulkee repon sisältöä.

**Ehdotettu tavoite seuraavalle paketille:** halvempi kuin Opus 5.5 high ja vähintään yhtä hyvä Scopesin koodaustehtävissä testitarkistimella, ja helpoissa kysymyksissä nopeampi reitityksen ansiosta. Ensimmäinen askel on β:n mittaus 3–4 avoimella mallilla omalla tehtäväjoukolla. Se vaatii maksullisen katon, jonka käyttäjä hyväksyy.

# Syvähaku (19.10.2026): roolit, malliyhdistelmät ja prosessimenetelmät

Kahdeksan Sonnet-agenttia, alkuperäissivut haettu Macin kautta (`ssh dev-host curl`). Hakuohje ja kirjauskaava: näyttö R = riippumaton mittaus, V = valmistajan tai tekijän oma luku, A = anekdootti. Vastakkaisen tarkistuksen tulos ja yhteenveto: luku 20.

## 12. Syvähaku A: tulostaulukoiden prosessit ja avoimet kehykset

## Osa A: tulostaulukot ja avoimet agenttikehykset (haettu 19.10.2026)

Lataukset: `/tmp/claude-1000/-home-user-palvelin/36c5de4c-9b8c-4e81-8d47-f362c229cf7a/scratchpad/syvahaku/lataukset/a/`. Näyttö: R = riippumaton mittaus, V = tekijän oma luku, A = anekdootti. R* = työkalun tekijän ajo, ei mallin valmistajan. "luettu" = alkuperäinen sivu tai data luettu.

### Taulukko
| Lähde | Prosessi ja roolit | Malli roolia kohden | Tehtävä | Vertailukohta | Laatuero | Hinta × | Aika × | Näyttö |
|---|---|---|---|---|---|---|---|---|
| SWE-bench/experiments, bash-only mini-swe-agent v2 (GitHub metadata.yaml, 45 ajoa, luettu) | yksi agentti, vain bash, ei rooleja, 1 yritys | yksi malli | SWE-bench Verified | Opus 4.5 high 76,8 % ($377) | MiniMax-2.5 75,8 % ($36,6), Kimi-K2.5 70,8 % ($73), GLM-5 72,8 % ($267), DeepSeek-3.2 70,0 % ($224) | MiniMax 0,10 (kutsuja 60 vs 33) | MiniMax noin 1,8 (kutsuja) | R* |
| sama, vanhemmat avoimet | sama | sama | sama | sama kehys | Kimi-K2 43,8 %, GLM-4.6 55,4 %, MiniMax-M2 61,0 % | - | - | R* |
| OpenHands + Kimi K2 (metadata + README, luettu) | OpenHands CodeAct, 1 yritys | Kimi K2 | Verified | mini-swe-agent + Kimi K2 43,8 % | 65,4 % (+21,6 p) | - | - | V |
| Lingxi v1.5 x Kimi K2 (README + arXiv 2510.11838, luettu) | Supervisor, useita Problem Decoder -agentteja, Aggregate, Solution Mapper, Solver; historiatieto | Kimi K2 kaikissa | Verified | OpenHands 65,4 % | 71,2 % (+5,8 p) | ei raportoitu | ei raportoitu | V |
| Lingxi paperin Taul. 2 (luettu) | sama | GPT-4.1 mini / Claude 4 Sonnet | Verified | mini-swe-agent 23,9 / 64,9 % | 45,2 / 74,6 % (+21,3 / +9,7 p) | - | - | V |
| Lingxi paperin ablaatio, 218 tehtävää (luettu) | täysi / ilman analyysin skaalausta / raakat issue-patch-parit / ei tietoa / ei kumpaakaan | Claude 4 Sonnet | Verified-osajoukko | täysi 74,8 % | -3,1 / -8,7 / -9,4 / -9,9 p; rooleilla ilman tietoa ja skaalausta 67,4 % | - | - | V |
| Lingxi v2.0 README (luettu, ei toistettu) | trajektorista johdettu vaiheohjaus | MiniMax M2.5 (HR) | Verified | mini v2 + sama malli 75,8 % | 81,2 % (+5,4 p) | ei raportoitu | ei raportoitu | V |
| Trae Agent arXiv 2507.23370 (luettu, Taul. 1-2) | generointi (koodari), karsinta (dedup + regressiotestit, tester-agentti), valitsija-agentti + enemmistöäänestys; ryhmäkoko 3 | koodari: Gemini 2.5 Pro / Claude 3.7 / GPT-4.1 / sekoitus | Verified | satunnainen ehdokas (Claude 3.7) 61,3 %, oraakkeli 70,0 % | 66,4 % (Claude 3.7); keskimäärin kolmen mallin yli: ilman karsintaa -5,6, ilman dedup -3,7, ilman regressiotestejä -3,4, prompt-valitsija -4,1, ilman äänestystä -4,1 p (Claude 3.7 yksin: karsinta -2,8) | ryhmäkoko 3 = 3x+ | ei raportoitu | V |
| sama, sekoitettu generaattori | 3 eri mallia tuottaa ehdokkaat | sekoitus | Verified | paras yksittäinen (Claude 3.7) 66,4 % | sekoitus 65,7 %, oraakkeli 73,4 % | - | - | V |
| OpenHands-blogi 17.4.2025 (luettu) | 5 rinnakkaista yritystä + koulutettu critic-malli valitsee | agentti Claude 3.7; critic oma malli | Verified | 1 yritys 60,6 % | 66,4 % (+5,8 p) | noin 5x+ | noin 1x (rinnakkain) | V |
| Rubric-critic arXiv 2603.03800 (luettu) | critic Qwen3-4B: best-of-8 ja varhainen lopetus | agentit Sonnet 4.5 / Opus 4.5, critic 4B | Verified-trajektorit, 148 tehtävää | Random@8 57,9 % | Best@8 +15,9 p; pelkkä onnistumiskriittori 45,6 % eli -12,3 p; varhainen lopetus +17,7 p ja 83 % vähemmän yrityksiä | critic halpa (4B) | - | V |
| OpenHands condenser (blogi + docs, luettu) | LLM tiivistää vanhan historian kynnyksen jälkeen | oletus: sama malli kuin agentti | Verified-osajoukko | ilman tiivistystä 53 % | 54 %; kustannus per vuoro alle 1/2 | 0,5 | turn-määrä kasvaa hieman | V |
| DeepSWE-Preview / Skywork-SWE-32B / EntroPO (SWE-bench README, luettu) | N yritystä + koulutettu verifioija | 32B / 30B avoin | Verified | pass@1 42,2 / 38,0 / 52,2 % | @16 58,8 % (+16,6), Bo8 47,0 % (+9,0), @16 59,8 % (+7,6 p) | N-kertainen | - | V |
| Live-SWE-agent arXiv 2511.13646 (luettu) | yksi agentti + itse luodut työkalut + reflektio joka askeleella | GPT-5-mini/GPT-5/Sonnet 4.5/Gemini 3 Pro | Verified, Pro | mini-swe-agent: 59,8/65,0/70,6/74,2 % | 63,0/68,4/75,4/77,4 % (+3,2…+4,8); Pro 45,8 % | $0,56 → $0,68 (Sonnet), Gemini $0,46 → $0,48 | noin 1 | V |
| sama, ablaatio 50 tehtävää | ilman työkaluluontia / ilman reflektiota / täysi | Sonnet 4.5 | Verified-osajoukko | - | 62,0 / 64,0 / 76,0 % | - | - | V (pieni otos) |
| SAGE, Salesforce blogi + SWE-bench README (luettu) | ajo, plan-induction-agentti kirjoittaa suunnitelman trajektorista, uusi ajo suunnitelmalla; LLM-tuomari yhdistää | policy ja plan-malli vaihdettavissa | Verified | mini-swe-agent Sonnet 4.5 70,6 %, GPT-5 65,0 %, Sonnet 4 64,9 % | omalla plan-mallilla Sonnet 4.5 72,4, GPT-5 68,6, Sonnet 4 64,0; vieraalla Sonnet 4 + GPT-5 68,8, Sonnet 4.5 + GPT-5 73,2 %; ensemble 73,8 % | 2+ ajoa | - | V |
| Aider architect-julkaisu 26.9.2024 (luettu) | Architect ehdottaa, Editor tuottaa muokkaukset | o1-preview + DeepSeek/o1-mini/Sonnet 3.5 | Aider-refaktorointi (133) | o1-preview solo 79,7 % | +o1-mini 85,0, +Sonnet 82,7, +DeepSeek diff 80,5; Sonnet 3.5 itsensä kanssa 77,4 → 80,5; gpt-4o 71,4 → 75,2; o1-mini 61,1 → 71,4 (DeepSeek-editori) | ei raportoitu | whole-muodossa hidas | R* |
| Aider polyglot-leaderboard YAML (luettu, 68 riviä, viim. 2025-10) | architect-rivit | R1 + Sonnet 3.5; o3 high + gpt-4.1; QwQ-32B + Qwen2.5-Coder | polyglot 225 | R1 56,9 %, o3 high 81,3 %, QwQ 20,9 % | 64,0 (+7,1); 78,2 (-3,1); 26,2 (+5,3) | R1: $5,4 → $13,3 (2,5x); o3: $21,2 → $17,6 (0,83x) | R1 114 → 252 s (2,2x); o3 197 → 122 s (0,62x) | R* |
| Terminal-Bench 2.0, HF leaderboard-aineisto (76 lähetystä, result.json luettu, laskin poolatun tuloksen) | harness vaihtelee; Terminus 2 vertailukehys | sama malli eri kehyksissä | TB 2.0, 89 tehtävää x 5 | Opus 4.6 Terminus 2: 62,9 % | Opus 4.6: Droid 69,9, Judy 71,9, KIRA 74,4, Capy 74,8, Meta-Harness 76,4, Forge 81,8 %; ero 19 p | - | - | V (itse lähetetty) |
| sama, avoimet | Terminus 2 | GLM-5 / Kimi-K2.5 / MiniMax-M2.5 / DeepSeek-V3.2 / GLM-4.7 | TB 2.0 | Opus 4.6 62,9 % | 51,9 / 42,5 / 42,2 / 39,6 / 33,0 %; GLM-5 toisella kehyksellä (JACA) 47,4 % | - | - | V |
| sama, monimalli | OB-1 (4 mallia) 82,5 %, aiempi 3 mallia 72,4 %; Polaris (Opus 4.7 + GPT-5.5 + Gemini 3.1) 82,0 %; Junie (4 mallia) 71,0 % | roolijakoa ei kerrota | TB 2.0 | yksimallinen GPT-5.5 Capy 83,1 % | monimalli ei ylitä parasta yksimallista | - | - | V |
| OpenCode docs (luettu) | primary: build, plan; subagent: general, explore; kaikille oma `model` | alaagentti perii kutsujan mallin oletuksena | - | - | ei mittausta | - | - | dokumentaatio |
| claude-code-router README c6969fdd (7/2025) + routing.md (main) (luettu) | Router: default, background, think, longContext (>60K), webSearch | esim. default deepseek-chat, background paikallinen qwen2.5-coder, think deepseek-reasoner, longContext gemini-2.5-pro | - | - | ei mittausta; uusi versio antaa mallille kuvaukset ja LLM valitsee alaagentin mallin | - | - | dokumentaatio |
| Roo Code docs, Kilo docs (luettu) | Roo Orchestrator: aliajo omassa kontekstissa, paluussa tiivis yhteenveto; mode-kohtaiset API-profiilit. Kilo: Orchestrator-tila poistettu käytöstä, Code/Plan/Debug delegoivat itse | mode-kohtainen malli | - | - | ei mittausta | - | - | dokumentaatio |
| AgentForge arXiv 2604.13120 (luettu osin) | Planner, Coder, Tester, Debugger, Critic + sandbox | GPT-4o | SWE-bench Lite | yksittäinen GPT-4o-kutsu ilman työkaluja 14 % | 40 %; vertailukohta ei agentti, sekoittaa roolit ja suoritus | - | - | V (heikko) |

### Löydökset

#### 1. Roolit
- Perusaste on yksi agentti ilman rooleja. mini-swe-agent v2 (vain bash) antaa avoimille malleille 70-76 % Verifiedillä (R*), eli kärkiavoimet ovat 1-6 p Opus 4.5/4.6:n (76,8 / 75,6 %) alla yksinkertaisimmalla kehyksellä. Roolit eivät ole edellytys tälle tasolle.
- Mitattu lisä rooleista on pienempi kuin kehyksen valinnan vaikutus. Sama Kimi K2: bash-only 43,8 %, OpenHands 65,4 %, Lingxi 70,3-71,2 %. Suurin hyppy (+21,6 p) tulee työkalusta ja kehyksestä (tiedoston muokkaustyökalu, kontekstin hallinta), ei moniagenttisuudesta; moniagenttikerros lisää vielä +5-6 p (V).
- Lingxin ablaatio: vaihejako (Decoder, Mapper, Solver) ilman historiatietoa ja skaalausta antaa 67,4 % vs mini-swe-agent 64,9 % (+2,5 p, eri otos, V). Täysi +10 p tulee enimmäkseen historiatiedosta (raakaparit eivät auta, muunnettu "menettelytieto" +6,5 p) ja monen analyysiagentin skaalauksesta tiedon kanssa (-3,1 p ilman; ilman tietoa +0,3 p). Roolit hyödyttävät vain, jos jokaiselle annetaan lisäinformaatiota (V).
- Rooleista mitatusti hyödyllisiä: (a) valitsija/tuomari ehdokkaiden välillä (Trae +4,1 p vs prompt-valitsija), (b) regressiotestejä ajava karsija (Trae +3,4…5,6 p), (c) kontekstin tiivistäjä (OpenHands, 2x halvempi, ei laatutappiota), (d) suunnitelman kirjoittaja trajektorin jälkeen (SAGE +2…4 p, vaihtelee). Itse suunnittelija-toteuttaja-jako ilman ylimääräistä tietoa: Aider 2024 +3…5 p, 2025 reasoning-malleilla +/-.
- Ei roolimittausta: reititin, testaaja erillisenä (Trae sisältää tester-agentin mutta sitä ei ablatoitu erikseen), "Orchestrator". Kilo poisti erillisen Orchestrator-tilan ja antoi Code/Plan/Debug-agenteille suoran delegoinnin (A, ei dataa).
- Live-SWE-agent: kevyt "meta-rooli" ilman uutta agenttia (itse luodut työkalut + reflektio) antoi +3,2…4,8 p neljällä mallilla lähes ilmaiseksi; reflektiosta 12 p 50 tehtävän ablaatiossa (V, pieni otos).

#### 2. Malli roolia kohden
- Editor/toteuttaja voi olla halpa: Aider 2024: Sonnet architect + DeepSeek editor 78,9 % vs Sonnet + Sonnet 80,5 % (-1,6 p); o1-preview + DeepSeek whole 85,0 %. DeepSeek paras editor (R*, mutta vanha malliveto).
- Reasoning-aikakaudella ero kapenee tai kääntyy: o3 high + gpt-4.1 78,2 % < o3 high solo 81,3 %, mutta 0,83x hinta ja 0,62x aika, ja > o3 medium solo 76,9 % (R*). R1 + Sonnet 3.5 64,0 % vs R1 solo 56,9 % mutta 2,5x hinta, 2,2x aika.
- Suunnittelijan malli voi olla toinen kuin toteuttajan: SAGE: Sonnet 4 + GPT-5-suunnitelma 68,8 % vs omalla 64,0 %; GPT-5 omalla 68,6 %, Gemini-suunnittelijalla 68,8 %; "ei selvää suuntaa" (V).
- Ehdokkaiden sekoittaminen eri malleista ei ylittänyt parasta yksittäistä: Trae sekoitus 65,7 % vs Claude 3.7 66,4 % (oraakkeli 73,4 %, valitsija ei saa sitä irti) (V).
- Verifioija voi olla pieni: Qwen3-4B -critic nosti Best@8 +15,9 p (V). DeepSWE/Skywork/EntroPO käyttävät koulutettua pientä verifioijaa.
- Yksittäisen mallin vaihto samassa kehyksessä (R*): Opus 4.5 high $0,75/tehtävä 33 kutsua, MiniMax-2.5 $0,073 ja 60 kutsua, Kimi-K2.5 $0,146 ja 51 kutsua, GLM-5 $0,53 ja 76 kutsua, DeepSeek-3.2 $0,45 ja 88 kutsua. Avoin malli tarvitsee 1,5-2,7x askelia, joten aikakerroin ei ole hintakertoimen luokkaa (aikaa ei raportoitu).
- Suositukset kehyksissä: OpenCode ja Roo antavat mallin per agentti/mode ilman suositusta. CCR-esimerkki: background paikallinen pieni malli, think reasoning-malli, longContext suurikontekstinen. Mitattua tietoa asetuksista ei ole (A/dokumentaatio).
- TB2: sama harness, mallin vaihto Opus 4.6 → GLM-5 on 62,9 → 51,9 % (-11 p), Kimi-K2.5 -20 p (V).

#### 4. Tarkistus
- Testit/ajettu palaute: Trae regressiotestikarsinta +3,4 p, dedup +3,7 p; yhdessä +5,6 p. Regressiotestit voivat olla väärin; konservatiivinen sääntö: jos kaikki ehdokkaat epäonnistuvat, pidetään kaikki (V).
- Valitsija-agentti, joka kirjoittaa ja ajaa testejä (max 30 kierrosta) + enemmistöäänestys: +4,1 ja +4,1 p tuomari-promptiin ja yksittäiseen ajoon nähden. Kattona oraakkeli (Claude 3.7: 70,0 vs 66,4 saavutettu) (V).
- Koulutettu critic: +5,8 p (OpenHands, 5 yritystä) ja +15,9 p (rubric-critic, Best@8). Varoitus: onnistumis-only -critic voi heikentää valintaa (-12,3 p vs satunnainen); benchmark-trajektoreilla koulutettu critic lähes satunnainen oikeassa käytössä (AUC 0,45-0,48) (V).
- LLM-tuomari yhdistelmänä (SAGE) lisäsi parhaaseen jäseneen vain noin +0,6 p (73,8 vs 73,2) (V, päätelty).
- Itsekritiikki/reflektio: Live-SWE-agentin reflektio +12 p 50 tehtävällä; SAGE self-plan joskus ei auta (Sonnet 4 64,0 vs 64,9 %). AgentForge-väite roolien vaikutuksesta on sekoittunut (V, heikko).
- Aika/hinta: valitsija ja critic lisäävät N-kertaisen ajon; varhainen lopetus leikkaa 83 % yrityksistä (V).

#### 6. Budjetti
- Kontekstin tiivistys: kustannus per vuoro alle puolet, ratkaisu 54 vs 53 % (V). Tiivistys käynnistyy vasta kynnyksellä, jotta prompt-välimuisti säilyy.
- Varhainen lopetus critic-pisteellä: +17,7 p, 83 % vähemmän yrityksiä (V). OpenHands-critic oletus: kynnys 0,6, enintään 3 iteraatiota (docs).
- Oletusrajat mini-swe-agentissa: 250 askelta ja $3/tehtävä (Live-SWE-agent-paperi, luettu). Todellinen keskiarvo $0,03-1,1/tehtävä, 13-88 kutsua.
- Ryhmäkoko: Trae-parannus jatkuu koon 10 asti, kun perusmenetelmät heikkenevät; oletus 3.
- Kaskadi (halpa ensin, vahva vain epäonnistuessa) ei esiinny mitattuna yhdessäkään lähteessä. Aider-architect on kiinteä jako, ei kaskadi.

#### 5. Milloin moniagentti häviää
- Rooli-/kehyslisä pienenee mallin vahvuuden kasvaessa: Lingxi +21,3 p (GPT-4.1 mini), +9,7 (Sonnet 4), +5,4 (MiniMax M2.5, V). Ero Kimi K2:lla on suuri, koska mini-swe-agent-lähtötaso on heikko.
- Monimalli-TB2-lähetykset (OB-1, Polaris, Junie) eivät ylitä parasta yksimallista kehystä (Capy GPT-5.5 83,1 %); yksimallinen Forge 81,8 % ≈ monimalli 82,0-82,5 %. Roolijakoa ei dokumentoitu.
- Aider o3 + gpt-4.1 hävisi o3 high solo -ajolle.

### Avoimet ja ristiriitaiset
- SWE-bench-lähetysten metadata kertoo vain mallit ja yritysmäärän; roolit löytyvät README:stä tai paperista. Vain bash-only-ajoissa on hinta (cost, instance_calls). "Kärki" on viimeksi Gemini 3.5 Flash (9/2026); uusimpia avoimia malleja (GLM-5.x, Kimi K3, MiMo, DeepSeek V4) ei ole repossa, eikä niitä saa tästä aineistosta.
- SWE-bench Pro: tulostaulun taulukko on JS-renderöity, haettu sivu on vanha (23 %). Avoimien mallien Pro-luvut (noin 58-61 %) tulevat vain hakuyhteenvedoista ja valmistajaväitteistä, ei käytetty. Live-SWE-agent raportoi Pro 45,8 % (V).
- TB-tulokset ovat itse lähetettyjä; laskin poolatun keskiarvon result.json-tiedostoista (JACA 47,4 % täsmää heidän omaan lukuunsa). Lähetys hookele 100 % on epäilyttävä, jätetty pois. tbench.ai-sivu on nyt "4.0" ja JS-renderöity.
- Lingxi v2.0:n 81,2 % on README-väite ilman SWE-bench-repon lähetystä; tarkista ennen nojaamista.
- Trae/OpenHands/critic-luvut ovat Claude 3.7-/Sonnet 4.5 -aikaisia; ei avoimen mallin suunnittelija-tarkistaja-ablaatiota SWE-bench Verifiedillä (AgentForge Lite on heikko, SWE-Debate vain hakuyhteenveto: debate -4,2, edit plan -6 p).
- Ristiriita: Aider 2024 (architect aina parempi) vs 2025 (architect o3:lla huonompi kuin solo high). Syy todennäköisesti reasoning-mallin suunnittelu jo sisäisesti.
- Ei löytynyt: mitattua CCR-reitityksen laatuvaikutusta; Roo/Kilo/OpenCode-rooliasetusten mittauksia; kaskadi/varhainen eskalaatio; avoimen mallin suunnittelija+toteuttaja -ablaatiota; roolikohtaista aikaa (sekunteja) bash-only-ajoista.

## 13. Syvähaku B: tutkimus 2025–2026 ja muut arkkitehtuurit

## Osa B: tutkimus 2025–2026 (arXiv), haettu 19.10.2026
Merkinnät: "luettu" = alkuperäinen sivu (arXiv HTML) luettu, "abstr." = arXivin alkuperäinen abstrakti luettu (ei taulukoita), "yht." = vain hakuyhteenveto. Näyttö: R riippumaton, V tekijän oma, A anekdootti. "–" = ei ilmoitettu. Hinta× ja Aika× suhteessa yhteen agenttiin tai yhteen kutsuun, ellei toisin sanota. Latauskansio: lataukset/b/.

### Taulukko 1: moniagentti, roolit, mallin valinta, vastanäyttö
| Lähde | Prosessi ja roolit | Malli roolia kohden | Tehtävä ja benchmark | Vertailukohta | Laatuero | Hinta× | Aika× | Näyttö |
|---|---|---|---|---|---|---|---|---|
| MAST 2503.13657 (abstr.) | 7 kehystä, 1600+ jälkeä, 14 vikatilaa (suunnittelu, agenttien väärinymmärrys, tarkistus) | GPT-4, Claude 3, Qwen2.5, CodeLlama | koodi, matikka, yleinen | – | MAS-hyödyt "usein vähäisiä" | – | – | R |
| Scaling Agent Systems 2512.08296 (luettu osin) | 5 arkkitehtuuria (yksi, itsenäinen, keskitetty, hajautettu, hybridi), 260 konfiguraatiota | 3 mallisukua (Intelligence Index 42–71) | 6 benchia: SWE-bench Verified, Workbench, Finance, PlanCraft, BrowseComp+ | yksi agentti | +80,8 % (rahoitus) … −70 % (PlanCraft); Workbench −1,2…+5,6 %; kun yhden agentin tulos >45 %, lisäagentit tuottavat tappiota | – | – | R |
| Sama, virhe | sama | sama | sama | sama | virheen vahvistus 17,2× itsenäisillä, 4,4× keskitetyllä (validointi pullonkaulana) | – | – | R |
| Dynamic concurrency 2610.10263 (luettu) | pääagentti spawnaa aliagentteja itse; Codex, Claude Code, Kimi Code, päällä vs pois | natiivi malli kullakin | 354 tehtävää, 2124 ajoa; SWE-bench Verified ja 4 pitkää koodibenchia (LoopsBench, NL2Repo, ProgramBench, RepoZero) | sama agentti ilman rinnakkaisuutta | SWE-bench Verified: Claude Code −24,0 pp; LoopsBench +14,3 pp; testiläpäisyero −8,3 (RepoZero) … +4,3 pp (pisin) | tokenit 1,41–3,31×; Codex 24,1 M vs 7,7 M tokenia/ratkaistu (3,1×) | keskiarvo kasvaa 14/15 yhdistelmässä; Claude Code 27,8 vs 17,5 min (1,6×) | R |
| MSEval 2607.27877 (luettu) | 10 yhteistyötopologiaa (putki, PM-valvonta, QA-first, kilpailu…) alusta asti rakentaen | Opus 4.8, GPT-5.5, GLM-5.2, DeepSeek v4 Pro (+Flash) | 10 täyttä projektia, 100 ajoa, 3 korjauskierrosta | topologiat keskenään; ei yhden agentin vertailua | topologia vaihtaa tulosta >30 pistettä; putki nopein ja paras; raskas esimiesvalvonta heikentää; DeepSeek 89,9 (putki) vs 43,0 (open-source review) | Opus 97 pistettä $654 vs GPT-5.5 96 pistettä $138 (4,7×); GLM-5.2 vs DeepSeek 8× | topologia tuplaa kellonajan; Opus 110 min vs GPT 74 min | R |
| Drop the Hierarchy 2603.28990 (luettu) | 8 protokollaa (keskitetty koordinaattori … itseorganisoituva), 4–256 agenttia | 8 mallia: Sonnet 4.6, GPT-5.4, DeepSeek 3.2, GLM-5 yms. | organisaatiosuunnittelutehtävät, LLM-tuomari (GPT-4o/5.4), ei koodia, ei yhden agentin vertailua | koordinaattori | Sequential (kiinteä järjestys, rooli vapaa) +14 % koordinaattoriin (p<0,001); 44 % ero parhaan ja huonoimman välillä | avoin malli 95 % suljetun laadusta, 24× halvemmalla | – | V |
| Think Big, Search Small 2607.07548 (luettu) | delegointi, toteutus, vastaus; roolit eriytetty | delegoijan skaala vs toteuttajan skaala (Qwen3 1.7B–32B, DeepSeek-V4-Flash) | 5 monihyppy-QA-benchia | yksi agentti ja saman roolin skaalaus | roolijako +4,5…+8,6 EM yhteen agenttiin; delegoijan skaalaus ~+11 EM, toteuttajan vain ~+2,6 EM; 1,7B SFT-toteuttaja ≈ frontier | 37 % vähemmän aliagentin tokeneita | – | V |
| ARIA 2610.13870 (luettu) | halpa toteuttaja, vahva neuvonantaja kutsutaan oppivalla säännöllä (enint. 4 kutsua) | gemini-3-flash (low) toteuttaja, gemini-3.1-pro (high) neuvonantaja | SWE-bench Verified-Mini (50/50 jako), Terminal-Bench 2.1, tau2 | toteuttaja yksin 18,0 %, neuvonantaja yksin 62,0 % | ARIA 48,0 %; kuroo 44–81 % aukosta; RouteLLM 30,0 %; "aina kysy" 14 pp huonompi samalla hinnalla | $11,48 → $22,09 (yksin vahva $45,90, eli 0,48×) | – | V (pieni otos) |
| FrugalEvo 2610.03675 (abstr.) | vahva malli ehdottaa strategiaa, halpa toteuttaa ja hioo koodia (evoluutiohaku) | GPT-5.6 Terra/Luna; GLM-5.3 + Flash | 10 optimointitehtävää, ALE-Bench-Lite | OpenEvolve, ShinkaEvolve, monta agenttia (~$50) | vähintään sama, korkeampi BA-AUC 9/10 | $0,55–1,68 vs ~$50 | – | V |
| Harness-tutkimus 2609.20804 (abstr.) | kiinteä silmukka; suunnittelu, työkalut, kontekstinhallinta vaihtelevat | 4 mallia | SWE-bench Verified, Terminal-Bench 2.1, 176 asetusta | ilman osaa | suunnittelu on tarkkuustuki heikolle ja kustannussäästö vahvalle mallille (tarkkuus ei juuri muutu); bash riittää bash-taitoiselle | säästö tapauskohtainen | – | R |
| Better Harnesses, Smaller Models 2607.08938 (abstr.) | meta-agentti optimoi kehyksen SLM:lle | 3 SLM-sukua | 7 liiketoimintatehtävää (ei koodia) | frontier-LLM | paras SLM 89,7 % LLM:n tuloksesta; 7/21 pariksi sulkee aukon | 0,04× | – | V |
| Team-of-Thoughts 2602.16485 (abstr.) | orkestroija valitsee heterogeenisiä malleja työkaluiksi | kalibroitu orkestroija + itsearvioivat työkalumallit | AIME24, LiveCodeBench, 5 benchia | homogeeninen roolileikki | AIME24 96,0 vs 80,0; LCB 77,9 vs 65,9 | – | – | V (heikko vertailu) |
| COMED 2609.26913 (abstr.) | ankkurimalli, vertaiset kutsutaan vain epävarmoissa | 16 avointa asetelmaa + GPT-5.5 | MedQA, HLE, tieteellinen päättely | tiheä yhteistyö | HLE 23,1 → 28,1 (GPT-5.5); avoimet +10,7 pp asti | vähemmän tokeneita kuin tiheä | – | V |
| JiSi 2601.01330 (abstr.) | reititys + aggregointi | 10 avointa mallia | 9 benchia | Gemini-3-Pro | ylittää Gemini-3-Pron | 0,47× | – | V |
| Fusion-MoA 2609.26080 (abstr.) | 8 solua, analyytikot vain lukevat, yksi toteuttaja saa työkalut | 3 sukua | HMMT P1–P10, 20 Terminal-Bench-tehtävää | paras yksittäinen solu | HMMT 8/10 vs 6/10 | – | – | V (pieni otos) |
| Kimi K2.5 2602.02276 (luettu) | PARL: opeteltu orkestroija, jäädytetyt aliagentit; kriittiset askeleet mittana | K2.5 sekä orkestroija että aliagentit | BrowseComp, WideSearch, oma Swarm-benchi (haku, ei koodia) | K2.5 yksin; Opus 4.5; GPT-5.2 (Pro) | BrowseComp 78,4 vs 60,6; WideSearch 79,0 vs 72,7 (Opus 4.5 76,2); oma 58,3 vs 41,6 | – | 3–4,5× nopeampi (WideSearch) | V |
| SwarmBench 2608.30661 (luettu osin) | mallin kyky orkestroida parvea | GPT-5.4 paras; Kimi-k2.5 ja Qwen3.5-397B parhaat avoimet | 8 tehtävää | mallit keskenään | suuri rinnakkaisuus ei takaa rinnakkaisuushyötyä; hinta ei lineaarinen laadun suhteen | – | – | R |
| Attention Tax, Handoff Tax 2610.06069 (abstr.) | hajotus vs rinnakkaisnäyte vs pitkä ajattelu | – | pääkirjan täsmäytys (ei koodia) | yksi agentti | käännekohta syvyys 10; ennuste osui 9 pp:n sisään | – | – | V |
| Info-pullonkaula 2607.16133 (abstr.) | MAS = eristetyt kontekstit + rajattu välitys | 3 mallikokoa | 5 benchia, 18 koetta | yksi agentti | MAS auttaa kun välitys lähes täydellinen, etenkin heikoilla malleilla; vahvoilla hyöty häviää tai kääntyy | – | – | V |
| Decomposition Buys Integrity 2609.17464 (abstr.) | puu aliagenteista | tuotantoajot | 600 deep research -jälkeä, 1012 MAS-jälkeä | litteä | litteä optimaalinen satoon; 1/16 toimeksiannosta ohi; vain 0,7–11,3 % istunnoista kannattaa delegoida (7,8 % delegoi) | tokenit ∝ N^1,39 | – | R |
| Käsien välinen viesti 2607.09678 (abstr.) | 6 hyppyä, 5 formaattia | vahva vs 1,5B välittäjä | 12 faktan toimeksianto | formaatit | vahva välittäjä lähes häviötön (≥0,973); heikolla 1,5B hajonta 8,7×; virhe kulkee uskollisesti | – | – | R |
| Same Context, Different Agents 2610.20959 (abstr.) | orkestrointi, tiivistys, semanttinen kerros | 7 mallia | 1514 pitkää dataagenttitehtävää | ilman | orkestrointi tekee tutkijatyyppisistä ylivarmoja: −5 pp | – | – | R |
| Pienten mallien tiimi 2609.36104 (abstr.) | 8 arkkitehtuuria, 3→30 kutsua | 5 mallia 7–9B | GSM8K…GPQA, koodibenchi | arkkitehtuurit | aritmetiikka +17 pp, monivalinta ≤+4; koodissa korjaus lähes katoaa, tarkkuus seuraa kattavuutta | kutsubudjetilla tokenit vaihtelevat 2,1× | – | R |
| Orchestrator Bottleneck ICML 2026 (yht.) | strategian vaihto: peräkkäin, rinnakkain, hierarkia | – | yritysprosessit | staattinen | −0,7 pistettä enintään | 0,58–0,72× | rinnakkainen silti nopein | A |

### Taulukko 2: test-time scaling, tarkistimet, yhdistäjät
| Lähde | Prosessi ja roolit | Malli roolia kohden | Tehtävä ja benchmark | Vertailukohta | Laatuero | Hinta× | Aika× | Näyttö |
|---|---|---|---|---|---|---|---|---|
| Self-MoA 2502.00674 (abstr.) | yhden parhaan mallin näytteet + aggregaattori | sama malli | AlpacaEval 2.0, MMLU, CRUX, MATH | MoA (sekamalli) | +6,6 % AlpacaEval, keskim. +3,8 % | N näytettä + 1 | – | V |
| Co-failure ceiling 2606.27288 (luettu) | reititys, äänestys, kaskadi, MoA | 67 mallia, 21 tarjoajaa | matikka, code_contests (18 mallia, 63 vaikeaa tehtävää, suoritusarvioitu), GPQA | paras jäsen | β: matikka 0,052, koodi 0,079, GPQA vapaamuotoinen 0,127; katto 1−β; yhdistelmä harvoin voittaa parasta ilman vahvaa kysymyskohtaista signaalia; matalan korrelaation sekajoukko voittaa Self-MoA:n k=3:sta | – | – | V ($270 koe) |
| SC-MoA 2605.29116 (luettu) | N=5 näytettä häirityillä syötteillä, aggregaattori lukee koko päättelyn, ankkuroitu | gpt-oss-120b | LiveCodeBench-Hard (n=171), AIME, GPQA, BBH | SC 10 kutsua, MoA, Self-MoA, TextGrad | LCB-Hard 62,6 vs SC 57,3, MoA 57,3, Self-MoA 57,3, nollalaukaus 42,1 (ero ei merkitsevä); AIME 91,1 | 11 kutsua (SC 10) | – | V |
| Mo' Models 2609.17306 (abstr.) | 8 mallivalintastrategiaa, reititys/äänestys/tuomari | avoimet mallit | tieteelliset benchit | paras yksittäinen | pooli kasvattaessa tulos usein alle parhaan mallin; saman suvun sisäinen valinta paras | – | – | R |
| Diversiteettiaudit 2607.20768 (abstr.) | enemmistöäänestys | 30 mallia, 31 900 osajoukkoa | MMLU-Pro | paras jäsen | voittaa parhaan vain 9,98 %:ssa kolmen mallin joukoista | – | – | R |
| Decorrelation 2608.16190 (abstr.) | monitoripaneeli | 24 avointa mallia | takaovikoodi | paras yksi | paneelin hyöty laskee taidon kasvaessa; mikään korrelaatiopainotus ei voita parasta | – | – | R |
| Candidate supply 2608.25937 (abstr.) | taajuus + tuomari lopullisessa valinnassa | – | MMLU-Pro, GPQA, MuSR ym., 81 390 poolia | pelkkä enemmistö | 63,8 → 70,8–71,0 % | – | – | R |
| Verifier cascades 2607.13918 (abstr.) | k peräkkäistä tarkistinporttia | – | teoria + synteettinen | itsenäisyysolettama | riippumattomuus aliarvioi virheen 20× (k=5); lisää portteja ei auta, dekorrelaatio auttaa | – | – | V |
| SWE-RM 2512.21919 (abstr.) | suoritukseton palkkiomalli valitsee ratkaisun | 30B MoE (3B aktiivinen) | SWE-bench Verified | ilman valintaa | Qwen3-Coder-Flash 51,6 → 62,0; Max 67,0 → 74,6 | – | – | V |
| LatentSift 2609.36371 (abstr.) | piilotilasuodatin ennen testejä, K=16 | politiikan oma | SWE-bench Verified | LLM-tarkistin + testit | Best@16 59,26 → 60,06 | tarkistustokenit −49…−62 % | – | V |
| Risa 2608.22191 (abstr.) | MoE-reititysjälkiin perustuva valinta, ei tuomaria | gpt-oss, Qwen3.6 | SWE-bench Verified | tasainen näyte | 44,9 → 48,2 % (vastaa tekstikonsensusta) | – | – | V |
| SWE-Replay 2601.22129 (abstr.) | kierrätä aiempia ajoja haarautumispisteistä | – | SWE-bench Verified/Pro/Multilingual | naiivi skaalaus | enint. +3,8 % | −17,4 % | – | V |
| ARBITER 2610.18760 (abstr.) | agenttinen tuomari tuottaa vastaesimerkkejä ajamalla | 35B MoE | USACO-JUDGE | perusmalli | verdiktitarkkuus 71,4 → 87,4 % | – | – | V |
| CliffCompaction 2609.26779 (abstr.) | tiivistys + rinnakkainen TTS | Kimi K2.6 | Terminal-Bench | Opus 4.7, 4.6, GPT-5.3 Codex | K2.6 vastaa Opus 4.7:ää rinnakkaisella TTS:llä, ylittää 4.6:n | matalampi hinta kuin Opus | – | V |

### Taulukko 3: Muut arkkitehtuurit
| Lähde | Prosessi ja roolit | Malli roolia kohden | Tehtävä ja benchmark | Vertailukohta | Laatuero | Hinta× | Aika× | Näyttö |
|---|---|---|---|---|---|---|---|---|
| SWE-Search 2410.20285 (abstr.) | MCTS + arvoagentti + erottelija (debate) | 5 mallia | SWE-bench | sama agentti ilman MCTS | +23 % suhteellinen | haun syvyys skaalaa laskentaa, lukua ei abstraktissa | – | V |
| SE-Agent 2508.02085 (abstr.) | ajojen uudelleenkirjoitus, yhdistäminen, hionta (evoluutiomainen) | 5 mallia | SWE-bench Verified | MCTS ym. | enint. +55 % suht. | – | – | V |
| LATS (2310.04406; yht. haussa) | MCTS + itsearviointi + reflektio | – | HotPotQA, ohjelmointi | ReAct | ei 2026-vertailua LATS vs best-of-N löytynyt | väite 100–1000× on A (sivusto) | – | A |
| ShinkaEvolve 2509.19349 (abstr.) | evoluutio, bandiitti valitsee LLM:n, uutuussuodatus | LLM-joukko | ympyräpakkaus, ALE-Bench | AlphaEvolve-tyyppiset | uusi ennätys 150 näytteellä | "tuhansia → 150 näytettä" | – | V |
| Ei yleisvoittajaa 2607.18235 (abstr.) | OpenEvolve + TTT-Discover purettu osiin | 12 malli-ongelma-paria | 30 budjettivakioitua kehystä, >3,1 M ajoa | keskenään | ei kehystä joka voittaa aina; OpenEvolve-variantit yleensä simppeleitä huonompia; varhainen edistyminen ennustaa lopun | budjetti vakio | – | R |
| Reflexion, Self-Refine koodiagenteissa | – | – | – | – | suoraa 2026-mittausta SWE-agentille ei löytynyt; ulkoinen palaute (SWE-PRM 40,0 → 50,6 %, yht.) toimii | – | – | A |
| MapCoder-Lite 2509.17489 (yht.) | 4 roolia (haku, suunnittelu, koodaus, vianetsintä) yhdeksi 7B:ksi, rooli-LoRA | yksi 7B + 4 LoRAa | xCodeEval | 32B MapCoder | 13,2 → 28,3 %, ero 32B:hen alle 6 pistettä | muisti ja generointi pienenee | – | A |
| MoRe 2608.27338 (abstr.) | roolit ohjausvektoreina yhdessä ajossa | yksi runko | päättely | MAS | MAS-tasolla | tokenit 1/20 | – | V |

### Löydökset suunnittelupäätöksittäin

#### 1. Roolit
- Mitattu hyöty tulee rakenteesta, ei roolipersoonista. MSEval (R): topologia vaihtaa tulosta >30 pistettä samalla mallilla ja tehtävällä; putki ja QA-first parhaat, raskas esimiesvalvonta heikentää. Scaling Agent Systems (R): hyöty -70 %…+81 % tehtävän rakenteen mukaan; Workbench, joka muistuttaa koodausta (suoritusarvioitu), jää −1…+6 %:iin.
- Roolit, joilla on mitattu hyöty: (a) tarkistaja joka suorittaa koodia tai testejä (SWE-RM, ARBITER, LatentSift: V), (b) keskitetty validointi virheen sisäänsulkijana (4,4× vs 17,2× vahvistus, R), (c) delegoija/suunnittelija jonka laatu on pullonkaula (2607.07548, V, haku-QA).
- Turhat tai vaaralliset: erillinen "esimies" jolla on paljon valvontaa (MSEval), debate-roolit joissa mielipide ei muutu (2609.08016: valittu vastaus pysyy samana >90 %:ssa, mielipidekysymykset, R), roolin yli-delegointi (ennuste: 0,7–11,3 % istunnoista kannattaa delegoida, R).
- Itseorganisointi (2603.28990, V): kiinteä järjestys + vapaa roolin valinta voittaa koordinaattorin +14 %. Rajoitteet: tehtävät ovat organisaatiosuunnittelua, tuomari on LLM, ei yhden agentin vertailua, ei koodia. Ei todiste koodille.
- Reflektio/itsekritiikki ilman ulkoista palautetta: ei 2026-mittausta koodiagenteille; tue vain ulkoiselle palautteelle (SWE-RM, SWE-PRM-yht.).

#### 2. Malli roolia kohden
- Suunnittelija/delegoija vahva, toteuttaja halpa on ainoa suunta jolle on suora mittaus: delegoijan skaalaus +11 EM vs toteuttajan +2,6 EM (V, monihyppy-haku, ei koodi). Koodissa ei suoraa mittausta; lähin on ARIA (V): halpa Flash-toteuttaja + vahva neuvonantaja SWE-bench Verified-Minillä 48,0 % hintaan $22 vs 62,0 % hintaan $46 vs 18,0 % hintaan $11. Eli puolet hinnasta, 69 % aukosta, ei koko laatua.
- Päinvastainen (halpa ehdottaa, vahva toteuttaa) ei löytynyt mitattuna. FrugalEvo on vahva-ehdottaa, halpa-toteuttaa (V, optimointitehtävät, 30–90× halvempi kuin monen agentin vertailu).
- Suunnittelu itsessään: heikoille malleille tarkkuustuki, vahvoille kustannussäästö ilman tarkkuuden muutosta (2609.20804, R). Heikko välittäjä (1,5B) hajottaa viestiä 8,7× vahvempaa enemmän (R), joten toteuttajan ja suunnittelijan välinen yhteenveto on herkin heikolla mallilla.
- Sekamallit tuomarina/yhdistäjänä: Mo'Models (R) ja Self-MoA (V) sanovat: saman suvun valinta paras, sekapooli usein alle parhaan; co-failure (V) sanoo matalan korrelaation sekapooli voittaa Self-MoA:n kun laatu vakio. Ristiriita ratkeaa niin, että sekoitus auttaa vain kun jäsenten laatu on lähellä toisiaan ja virheet eri paikoissa.
- Roolikohtainen herkkyys: orkestroijan malli vaihtelee suuresti (SwarmBench: GPT-5.4 paras; Kimi-k2.5 paras avoin delegoinnissa). Orkestroijaksi ei kannata valita pelkän yleisindeksin mukaan.

#### 4. Tarkistus
- Suoritus ensin: testit tai kääntäjä on ainoa signaali jolla on vankka mitattu hyöty koodissa. SWE-RM nostaa Qwen3-Coder-Max 67,0 → 74,6 (V). LatentSift: Best@16 hybridi (suodatin + testit) säilyttää tarkkuuden ja säästää 49–62 % tarkistustokeneita (V).
- Tuomarimalli: luotettavuus vaihtelee tehtävän ja generaattorin mukaan (2608.25937, R); taajuus + tuomari yhdessä +7 pp enemmistöön verrattuna, muttei koodidataa. Agenttinen tuomari joka ajaa vastaesimerkkejä (ARBITER) 71 → 87 % (V).
- Äänestys: enemmistö voittaa parhaan jäsenen vain 10 %:ssa kolmen mallin joukoista (2607.20768, R); koodin β = 0,079 (V).
- Synteesi vs valinta: SC-MoA (V, gpt-oss-120b) synteesi LCB-Hard 62,6 vs 57,3 (SC), ero ei merkitsevä; väite "aggregaattori korjaa vaikka kaikki ovat samaa mieltä" on yhden ryhmän tulos. Yhdistäjä ≈ 11 kutsua.
- Peräkkäiset portit: lisäportit eivät auta jos ne jakavat sokean pisteen; dekorrelaatio (eri malli, eri evidenssilähde) tuottaa hyödyn (2607.13918, V teoria).
- Itsekritiikki/debate ilman ulkoista signaalia: ei näyttöä hyödystä (2609.08016, R; Same Context: orkestrointi −5 pp tutkijatyypeillä).

#### 5. Milloin moniagentti häviää yhdelle
- SWE-bench-tyyppinen rajattu tehtävä: rinnakkaisuus ei auta (2610.10263, R): Claude Code −24,0 pp, Codex ennallaan; tokenit 1,4–3,3×, aika useimmiten pitempi. Voitto vain pitkissä, hajotettavissa tehtävissä (LoopsBench +14,3 pp).
- Kynnys: kun yksi agentti on jo >45 % tarkkuudella, lisäagentit tuottavat tappiota (2512.08296, R). Työkaluraskas tehtävä kärsii (tokenibudjetti pirstoutuu).
- Heikot mallit hyötyvät eniten eristetystä kontekstista ja hajotuksesta; vahvat vähiten tai kääntyvät tappiolle (2607.16133, V; 2512.08296). Koska tavoite on avoin malli lähellä Opus-tasoa, hajotus kannattaa enemmän avoimelle kuin Opukselle.
- Pitkä syvyys: hajotus voittaa kun konteksti rapautuu (syvyys ≥10, 2610.06069, V, synteettinen).
- Vastanäyttö yksittäisille moniagenttituloksille: MAST (R) ja MSEval, ei yhden agentin vertailua kummassakaan; 2603.28990 ei myöskään vertaa yhteen agenttiin. Tällaiset tulokset eivät todista voittoa.
- Kimi parvi: kaikki mitatut parvihyödyt (BrowseComp +17,8 pp, WideSearch +6,3 pp, 3–4,5× nopeampi) ovat leveissä hakutehtävissä, V. Koodissa ei Kimin omaa parvimittausta. K3-parvea Opus 4.8/5/5.5:tä vastaan ei löytynyt (vain kolmannen osapuolen koostesivuja perusmallivertailusta, ei käytetty).

#### 6. Budjetti
- Kutsukohtainen jako: ARIA (V): neuvonantajan kutsu vain tarvittaessa, enint. 4; 53,5 % kutsuista viimeisessä vaiheessa (Deliver). "Aina kysy" samalla hinnalla 14 pp huonompi. Natiivi LLM-reititys kysyi vain 0,4–0,6 kertaa/jakso, liian myöhään.
- Rinnakkaiset yritykset: best-of-N hinta N×; viive 1,5–3×. Halventajia: SWE-Replay −17 % (V), LatentSift −49…−62 % tarkistustokeneita (V), tiivistys CliffCompaction jopa −50 % (V). Kimi K2.6 rinnakkaisella TTS:llä vastaa Opus 4.7:ää Terminal-Benchissä edullisemmin (V): tuki avoimen mallin + TTS-reitille, ei Opus 5.5:tä vastaan.
- Varhainen lopetus: 2607.18235 (R): varhainen edistyminen ennustaa lopputuloksen; monta kehystä aloittamalla, heikkojen karsinnalla ja budjetin siirrolla voitetaan kiinteä valinta. Tue kaskadille ja adaptiiviselle allokoinnille.
- Kaskadi: COMED (V): kutsu vertaiset vain epävarmoissa; fewer tokens kuin tiheä. Kaskadilla katto 1−β.
- Halvat kehykset: harnessin mukautus pienelle mallille 89,7 % LLM-tuloksesta 4 %:lla kustannuksesta (V, ei koodia).

#### Muut arkkitehtuurit (yhteenveto)
1. Puuhaku: SWE-Search +23 % (V, lukua kustannukselle ei abstraktissa). Ei 2026-vertailua best-of-N:ään matched-budjetilla.
2. Evoluutiohaku: toimii kun on automaattinen arvioija (ympyräpakkaus, ALE-Bench), ShinkaEvolve 150 näytettä (V). Riippumaton audit: ei yleisvoittajaa, OpenEvolve ei voita yksinkertaisia (R). Vahva-ehdottaa/halpa-toteuttaa -jako 30–90× halvempi (V).
3. Reflektio ja korjaus: hyöty vain ulkoisella palautteella; ei suoraa 2026-mittausta.
4. Blackboard / itseorganisointi: 2603.28990 (V, ks. rajoitteet).
5. Hierarkia vs tasainen: hierarkia ei voita; MSEval raskas valvonta heikentää, 2609.17464 litteä optimaalinen satoon, keskitetty validointi pienentää virheen vahvistusta (R).
6. Tislaus pienelle: 1,7B toteuttaja ≈ frontier −37 % tokeneita (V, haku-QA), MapCoder-Lite 7B (yht.), MoRe 20× vähemmän tokeneita (V). Vaihtoehto yhdistelmälle vain kun rooli on kapea ja toistuva.

### Avoimet ja ristiriitaiset
- Opus 5.5:tä vastaan ei löytynyt yhtään riippumatonta yhdistelmämittausta; vertailut Opus 4.5/4.7/4.8, GPT-5.2/5.5, Gemini-3-Pro.
- Self-MoA (sama malli parempi) vs co-failure (matalan ρ:n sekapooli parempi) vs Mo'Models (saman suvun valinta paras). Selitys todennäköinen mutta ei suoraan testattu: ratkaisee jäsenten laatuero.
- Koodin β = 0,079 perustuu 18 malliin ja 63 tehtävään; Scopesin omalle joukolle ei yleisty.
- SC-MoA-luvut: pieni otos (LCB-Hard n=171), vain gpt-oss-120b, ero ei merkitsevä.
- ARIA käyttää Gemini-paria ja pientä testijoukkoa (Verified-Mini); ei avoimella mallilla.
- Roolikohtainen mallinvalinta koodissa: suoraa SWE-bench-mittausta "halpa suunnittelee, vahva toteuttaa" ja "vahva suunnittelee, halpa toteuttaa" ei löytynyt; 2607.07548 on haku-QA.
- Kimi K3 -parvi vs Opus 4.8/5/5.5: ei löytynyt. Parvimitta koodille puuttuu; ainoa koodin rinnakkaisuusmittaus (2610.10263) on negatiivinen SWE-bench-tehtävissä.
- LATS/MCTS vs best-of-N matched-budjetilla, Reflexion koodiagentissa, hierarkia vs tasainen koodissa: ei löytynyt mittausta.
- Semantic Scholar -viittaajahaku tehty: MAST (100), Self-MoA (64), co-failure (14), SC-MoA (6), Scaling Agent Systems (100), Kimi K2.5; SWE-RM palautti tyhjän. Yli 100 viittaajaa saattaa jäädä pois.

## 14. Syvähaku C: tekijöiden kirjoitukset ja kehittäjäkeskustelut

## Osa C: tekijöiden insinöörikirjoitukset ja kehittäjäkeskustelut (haettu 19.10.2026)

Näyttö: R = riippumaton mittaus, V = tekijän oma luku, A = anekdootti. "luettu" = alkuperäinen sivu luettu (osin = grep/ote), "yhteenveto" = vain hakuyhteenveto.
Lataukset: `lataukset/c/` (tekstimuunnokset *.txt). Hinta × ja Aika × suhteessa mainittuun vertailukohtaan; "–" = ei ilmoitettu.

### Kirjaustaulukko
| Lähde (pvm) | Prosessi ja roolit | Malli roolia kohden | Tehtävä, benchmark | Vertailukohta | Laatuero | Hinta × | Aika × | Näyttö |
|---|---|---|---|---|---|---|---|---|
| Anthropic, multi-agent research system (13.6.2025), luettu | Lead-tutkija suunnittelee ja tallentaa suunnitelman muistiin, 3–5 rinnakkaista alaagenttia, CitationAgent | Lead Opus 4, alaagentit Sonnet 4 | Sisäinen tutkimus-eval, BrowseComp | Yksi Opus 4 | +90,2 % | 15× tokenia vs chat (agentti 4×) | rinnakkaistus −90 % monimutkaisissa kyselyissä | V |
| Anthropic, Building effective agents (luettu osin) | Reititys, rinnakkaistus (osiointi/äänestys), orkestroija-työntekijät, arvioija-optimoija | Reitityksessä halpa Haiku helppoihin, Sonnet vaikeisiin | Ei lukuja, ohjeistus | – | – | – | – | V (ohje) |
| Cognition, Don't Build Multi-Agents (kesä 2025), luettu | Yksisäikeinen lineaarinen agentti + erillinen tiivistysmalli (hienosäädetty pieni malli) | – | Ei lukuja, periaatteet | – | – | – | – | V/A |
| Cognition, Multi-Agents: What's Actually Working (22.4.2026), luettu | (1) koodari + puhtaan kontekstin Devin Review -silmukka, (2) "Smart Friend" (pieni ensisijainen kutsuu suurta), (3) manager-Devin + lapset | (2) SWE-1.5 + Sonnet 4.5; Claude + GPT tuotannossa | Devin-PR:t | – | Review löytää keskim. 2 bugia/PR, ~58 % vakavia | – | – | V |
| Cursor, Towards self-driving codebases (5.2.2026), luettu | Ehdot: tasa-arvoiset agentit (kaatui) → suunnittelija+toteuttaja+tuomari → jatkuva toteuttaja (ylikuormittui) → juurisuunnittelija, alisuunnittelijat (rekursiivinen), työntekijät | Opus 4.5 hylätty pitkäkestoiseen, GPT-5.1/5.2 valittu ohjeidennoudatuksen takia | Selain alusta alkaen, viikon ajo | Aiemmat harness-versiot | ~1000 commit/h, 10 M työkalukutsua; ei pistelukua | – | – | V |
| Cursor, Agent swarms and model economics (20.7.2026), luettu | Puun muotoinen: suunnittelija ei toteuta, työntekijä ei suunnittele; neutraali sovittelija merge-konflikteihin; katselmointilinssit | GPT-5.5 yksin; Grok 4.5 yksin; Opus 4.8 + Composer 2.5; Fable 5 + Composer 2.5 | SQLite Rustilla dokumentaatiosta, sqllogictest | Yksi malli kaikissa rooleissa | "Jokainen miksi samanlainen laatu", kaikki uudet ajot 100 % | $1 339 (Opus 4.8-hybridi) vs $10 565 (GPT-5.5 yksin) = 0,13× | – | V |
| Cursor, How Cursor Router works (6.8.2026), luettu | Reititin: Compass-vaikeusennuste → halpa malli tai taksonomialla valittu frontier-malli | Grok (rutiini), Sol (suunnittelu), Opus (toteutus, devops), Fable (debuggaus, visuaalinen) | Tuotantoliikenne, tyytyväisyyssignaali (seuraava tehtävä/korjaus) | Opus 4.8; Fable | Balance: parempi kuin Opus 4.8; Intelligence: yli Fable-tyytyväisyys | 0,59× ja 0,32× | – | V |
| Sakana Fugu -blogi (24.4.2026) + tekninen raportti arXiv 2606.21228, luettu | Opeteltu orkestroija: Fugu valitsee yhden työntekijän ilman rooleja; Ultra rakentaa monivaiheisen työnkulun (rakenna–debuggaa, aggregaattori, asiantuntija) | Suljettu pooli: Opus 4.8, GPT-5.5, Gemini 3.1 | SWE-Bench Pro, Terminal Bench 2.1 | Yksittäiset mallit | SWE Pro: Ultra 73,7 / Fugu 59,0 / Opus 4.8 69,2 / GPT-5.5 58,6; TB2.1: Ultra 82,1 / GPT-5.5 78,2 | – | Fugu ≈ yksi frontier-kutsu; Ultra hitaampi, ei lukua | V |
| GitHub, Project HydraFusion (4.9.2026) + changelog 14.10.2026, luettu | Valitsee per pyyntö: Single, Cascade (halpa luonnos + laatuportti → eskalointi), Critique (toisen mallisuvun lukuoikeudeton arvostelija, yksi revisio) | Pooli: Opus 5.5, GPT-6 Astra/Sol/Luna (loka) | TerminalBench 2.1, DeepSWE, CheckpointBench | Opus 5 | +4,9 / −1,5 / −0,1 pistettä | 0,33× / 0,64× / 0,35× | – (tulokset piilotetaan, "odotus näkyy") | V |
| Moonshot, Kimi K2.5 -blogi + raportti arXiv 2602.02276 (tammi 2026), luettu | Koulutettu orkestroija (PARL) + jäädytetyt alaagentit, ≤100 kpl; hakukonteksti jaetaan osiin | Sama malli orkestroijana ja alaagentteina | BrowseComp, WideSearch (ei koodausta) | Yksi K2.5 | BrowseComp 60,6 → 78,4 %; WideSearch 72,7 → 79,0 | – | 3–4,5× nopeampi (WideSearch) | V |
| Together MoA (kesä 2024), luettu | Kerrokselliset ehdottajat + aggregaattori (3 kerrosta) | 6 avointa ehdottajaa, Qwen1.5-110B aggregaattori | AlpacaEval 2.0 (chat, ei koodi) | GPT-4o 57,5 | 65,1 % | – | "hitaampi TTFT" | V |
| Amp, Oracle (4.7.2025), luettu; mallimuutokset 2026 vain hakuyhteenveto | Pääagentti + lukuoikeudeton "oracle"-alaagentti arvosteluun ja debuggaukseen | Sonnet 4 pää, o3 oracle (2026: GPT-5.x, ei vahvistettu) | Ei lukuja | – | – | oracle hitaampi ja kalliimpi | – | A/V |
| Factory, Missions-dokumentit (luettu osin) + hakuyhteenveto roolimalleista | Orkestroija → työntekijä-droidit → validaattori; milestone-pohjainen | `--worker-model`, `--validator-model` (yhteenveto) | Ei lukuja | – | – | – | – | V (yhteenveto) |
| Augment, "why multi-agent fails" -opas (luettu osin) | Koordinaattori, erikoisagentit, verifioija; MAST-taksonomia | – | MAST: erittely 1 600 jäljestä (toissijainen) | – | Viat: määrittely 41,8 %, koordinaatio 36,9 %, verifiointi 21,3 % | – | – | V (myyntimateriaali) |
| OpenAI, practical guide to building agents (PDF ei purkautunut), yhteenveto | Manager-malli (työkaluina) vs hajautettu (handoff); aloita yhdellä agentilla | – | Ei lukuja | – | – | – | – | V (yhteenveto) |
| Anthropic advisor tool (4/2026), vain hakuyhteenveto | Halpa toteuttaja kutsuu Opus-neuvonantajaa päätöskohdissa, kutsuraja | Sonnet/Haiku + Opus | SWE-bench Multilingual, BrowseComp | Sonnet yksin | +2,7 pist. (74,8 vs 72,1); Haiku BrowseComp 19,7 → 41,2 | −12 % (Sonnet) | – | V (yhteenveto) |
| akitaonrails, planner+executor (25.4.2026), luettu (+ edeltävä osa 2 osin) | Opus-suunnittelija ilman kirjoitusoikeutta + halpa toteuttaja; 3 kierrosta | Opus 4.7 + Kimi K2.6 / GLM 5.1 / Qwen 3.6 / Sonnet / Haiku; GPT-5.4 xHigh+medium | Rails 8 chat-sovellus, 8 osa-alueen pisteytys (0–100), 1 ajo/muunnos | Opus 4.7 yksin (97 pist., 18 min, ~$4) | Pakotettu: −2 … −7 pist.; Kimi-manuaali 97 (tasan); GPT 5.4: −3 | Kimi-manuaali ~$5–7 (suunnittelija ~$5 piilossa) = 1,3–1,8×; kaksi manuaaliajoa yht. ~$12 vs $4 = 3×; GLM ~0,1×; GPT 0,1–0,2× | +1 … +35 min | R (1 ajo/muunnos, yksi tekijä) |
| HN: Weave Router -ketjut 48688700 (6/2026), 49911500 (9/2026), luettu | Opetettu reititin ohjaa jokaisen pyynnön (suunnittelu Opus, tutkiva alaagentti DeepSeek V4 Flash, toteutus GLM 5.2); välimuistitietoinen vaihto | Opus 4.8, GPT, DeepSeek V4 Flash, GLM 5.2, Kimi K2.6 | Terminal Bench 4.0, SWE Atlas | GPT-6 Astra | Sama läpäisyaste | 0,52× ja 0,54× | 2,2× ja 2,5× nopeampi | V + A |
| HN-komentit (haut planner/executor, Opus plans Sonnet implements, kimi swarm), luettu | Kehittäjien omat ketjut: arkkitehti-kehittäjä-arvioija (Opus→Sonnet→Codex), Opus suunnittelee + DeepSeek Flash toteuttaa + Opus arvioi | ks. alla | – | – | – | DeepSeek Flash 20–40× halvempi kuin Sonnet (kommentoijan väite) | – | A |

### Löydökset suunnittelupäätöksittäin

#### 1. Roolit
Mitatusti tai toistuvasti hyödyllisiä:
- **Puhtaan kontekstin arvostelija koodin kirjoittajan jälkeen** (Cognition V: ~2 bugia/PR, ~58 % vakavia, toimii parhaiten kun arvostelija ei jaa kontekstia koodarin kanssa; Cursor V: "decorrelated lenses stack", arvostelu on halvempaa kuin tarkastettava työ, myös eri mallisuvun arvostelijat; HydraFusion Critique: toisen mallisuvun arvostelija, työkaluton ja lukuoikeudeton, yksi revisio). Tämä on vahvin yhteinen löydös lähteissä.
- **Suunnittelija joka ei koskaan toteuta** ja toteuttaja joka ei suunnittele (Cursor V: suunnittelijan konteksti ei täyty yksityiskohdista; työntekijä käyttää koko kontekstinsa yhteen palaan). Cursor arvelee skaalautuvuuden tulevan kontekstitehokkuudesta, ei rinnakkaisuudesta.
- **Kontekstin tiivistäjä pitkissä ajoissa** (Cognition: pieni hienosäädetty tiivistysmalli; Anthropic: suunnitelma muistiin, tuore alaagentti siirrolla; Cursor: scratchpad uudelleenkirjoitetaan, ei lisätä loppuun).
- **Reititin / vaikeusennuste** (Cursor Compass: pisteytetty 0–1, kynnys säätää hinta–laatu; Weave; HydraFusion). Ero: Compassin signaali on käyttäjän seuraava siirto (tyytyväisyys), ei benchmark; Compass-luokan 96 % vs 71 % positiivinen signaali.
- **Lukuoikeudeton neuvonantaja** (Amp oracle, Cognition Smart Friend, Anthropic advisor): toimii, kun molemmat mallit ovat vahvoja; heikko ensisijainen malli ei tiedä milloin kysyä (Cognition: SWE-1.5 ei riittänyt, Claude+GPT-pari toimi tuotannossa; rooli muuttuu "vaikeuden eskaloijasta" "kykyjen reitittimeksi").
Turhia tai haitallisia:
- **Tasa-arvoiset agentit jaetulla tilatiedostolla** (Cursor V: lukitukset, 20 agenttia = 1–3 kapasiteetti).
- **Erillinen integraattori / yksi portti** (Cursor V: pullonkaula, poistettiin). **Erillinen riippumaton suunnittelija jäykällä kierroksella** (hitain työntekijä pitää kaiken; Cursor poisti) ja **yksi "jatkuva toteuttaja"** joka tekee kaiken (ylikuormitus: nukkuu, tekee itse, julistaa valmiiksi).
- **Strukturoimattomat parvet** (Cognition: "enimmäkseen häiriötekijä"; käytännön muoto on map-reduce-and-manage).
- **Edit-apply-malli** (Cognition: vanhentunut, yksi malli tekee päätöksen ja muokkauksen).
- Testaajaroolista ei löytynyt itsenäistä mittausta. Varoitus: Akita (R) havaitsi Opus-ajon, jonka 34 testiä läpäisivät, koska mock-testit testasivat saman mallin keksimää rajapintaa; testien lukumäärä ei todista mitään, jos testit ja koodi tulevat samasta kontekstista.

#### 3. Työn välitys
- **Tehtäväkuvaus alaagentille**: tavoite, tulostusmuoto, ohje työkaluista ja lähteistä, selvät rajat (Anthropic V). Lyhyet ohjeet johtivat päällekkäiseen työhön.
- **Paluuviesti**: Cursor-työntekijä kirjoittaa yhden handoffin: mitä tehtiin, huomiot, poikkeamat, löydökset, palaute. Ylös ei kulje koko jälki. Kimin raportti: alaagentin vain relevantti tulos palaa orkestroijalle ("context sharding", ei katkaisua).
- **Suuret tulokset tiedostojärjestelmään**, ei orkestroijan läpi (Anthropic: "game of telephone" -häviö); viite palautetaan.
- **Päätökset omistaa suunnittelija**: Cursor: suunnittelijat tekevät suunnittelupäätökset itse ja varmistavat ettei kaksi alipuuta päätä samaa asiaa; päätökset kirjataan jaettuun design-dokumenttiin ja koodi viittaa siihen käännösaikaisella viitteellä; ristiriidan sovittaa erillinen reconciler.
- **Jaettu vai eristetty konteksti**: Cognition suosittaa jakaa koko jälki kirjoittajien kesken (periaatteet 1–2), mutta arvostelijalle puhdas konteksti. Smart Friend: haarauta ensisijaisen mallin koko konteksti, kysy laaja kysymys ("mitä pitäisi tehdä?"), neuvonantaja saa ehdottaa myös kysymättä, ja sen pitää käskeä lukemaan puuttuva tiedosto eikä keksiä.
- **Liian määräävä suunnittelija** (Cognition): manager, joka ei tunne koodikantaa, antaa liian tarkkoja ohjeita ja se kostautuu; agentit olettavat jakavansa tilaa lasten kanssa; lasten viesti sisaruksille ei synny oletuksena.
- **Suunnitelman tarkkuus ratkaisee toteuttajan laadun** (Akita R): GLM 5.1 yksin 46 → 93 kun Opus-suunnitelma nimesi oikean rajapinnan; Qwen 71 → 94; Kimi 87 → 97. Nostovaikutus on kääntäen verrannollinen toteuttajan omaan tasoon. Ketjukommentti (A, HN 48742461): halpa tutkija (Haiku) raportoi reunaehdot väärin → suunnittelija ei näe niitä → toteuttaja toteuttaa olemassa olevan uudelleen.
- Cursor-neuvo: ohjaa rajoitteilla ("ei TODO:ita") ei tehtävälistoilla; älä ohjeista asioita jotka malli osaa.

#### 5. Milloin moniagentti häviää yhdelle agentille
- **Akita (R, 1 ajo/muunnos)**: yhtenäinen, riippuvuuksia täynnä oleva greenfield-koodaus: yksin Opus 4.7 oli paras laadussa, hinnassa tai ajassa. Vapaassa valinnassa 0/7 delegoi. Pakotettu delegointi: −2…−7 pistettä ja +1…+35 min. Manuaalinen orkestrointi: kaksi ajoa yhteensä ~$12 (suunnittelija ~$11) vs $4 yksin. Ainoa selvä poikkeus: GPT-5.4 xHigh + medium (−3 pist., 80–85 % halvempi); Kimi K2.6 -toteuttajalla tasapeli laadussa mutta kalliimpi ja hitaampi.
- **Cognition**: kirjoitukset yksisäikeisinä; muuten päätökset hajoavat. Anthropic: koodauksessa vähemmän rinnakkaistettavaa kuin tutkimuksessa; moniagentti käyttää 15× tokeneita.
- **HydraFusion**: DeepSWE:ssä −1,5 pistettä, CheckpointBenchissä −0,1; konfiguraatio viritetty (beam search) samoilla benchmarkeilla joilla mitattiin, joten yleistys on avoin.
- **Reititys ja välimuisti** (HN-kommentit, Weave): mallinvaihto kesken istunnon menettää välimuistin; Weave korjaa kynnyksellä, mutta kriitikot (GodelNumbering, A) sanovat käytännössä jäävän kahteen malliin. "Tehtävän vaikeutta ei voi ennustaa" (A).
- **Moniagentti voittaa**: leveä, rinnakkaistuva haku (Anthropic +90 %, Kimi +17,8 pist. BrowseComp), erittäin suuret hajotettavat tehtävät joissa mittari on automaattinen (Cursor: SQLite, selain), ja kun työntekijöiden osuus tokeneista on yli 69 % ja ne ajetaan halvalla mallilla (Cursor).
- Käyttäjäkokemus (A): "Opus suunnittelee, Sonnet toteuttaa" koetaan hyväksi (useita kommentteja), mutta myös "turha token-tuhlaus" (HN 49463192); välimuistin menetys ja kontekstin uudelleenlataus vie säästön.

#### 6. Budjetti
- **Frontier-token vain päätöksiin**: Cursor V: työntekijät kantavat ≥69 % tokeneista (usein >90 %), mutta suunnittelija (Opus 4.8) oli noin 2/3 kustannuksesta. Koko työntekijälauma $411 vs $9 373 (GPT-5.5 yksin). Vain alkuhajotus, suunnitteluratkaisut ja tietyt kompromissit vaativat frontier-älyä.
- **Token määrä selittää laadusta paljon**: BrowseComp-varianssista token-käyttö 80 %, työkalukutsut ja mallin valinta loput (Anthropic V). Silti Sonnet 4:n päivitys oli suurempi parannus kuin Sonnet 3.7:n token-budjetin kaksinkertaistus.
- **Skaalaussäännöt promptiin** (Anthropic): 1 agentti 3–10 kutsua faktahakuun; 2–4 alaagenttia 10–15 kutsulla vertailuun; yli 10 monimutkaiseen. Ilman sääntöjä: 50 alaagenttia yksinkertaiseen kyselyyn, loputon haku.
- **Rajoitettu suoritus (HydraFusion)**: kokonaiskirjanpito jokaisesta osasta (luonnos, arvostelu, revisio, eskalointi, uusinta, varamalli), aikaraja ja peruutus joka osalle, ei patchia jos työnkulku epäonnistuu tai peruutetaan, valitse yksinkertaisin työnkulku joka riittää, lisäkutsut vain jos ne todennäköisesti parantavat.
- **Kaskadi**: halpa luonnos + laatuportti → eskalointi (HydraFusion Cascade); toisin päin Smart Friend. Vaikeusraja (Compass-kynnys) on säädettävä hinta–laatu-vipu (Cursor). Fugu valitsee vain yhden työntekijän nopeaa varianttia varten (latenssi ≈ yksi kutsu).
- **Hyväksy virhekatto, älä vaadi 100 % per commit** (Cursor: serialisoi ja pysäyttää koko parven); viimeinen "vihreä haara" -korjauskierros.
- **Kimin kriittinen polku**: mittaa kriittisiä askelia (orkestroinnin yläkustannus + hitain alaagentti), ei kokonaisaskelia; "serial collapse" (orkestroija ajaa yksin) vaatii palkkiomuotoilua.
- **Tuntematon**: Fuguista ja HydraFusionista ei ole latenssilukuja; Akita ei mitannut tokeneita vaan laskutusta; ei löytynyt vertailua "kuinka monta yritystä per rooli".

### Avoimet ja ristiriitaiset
- **Cognition vs Cursor/Anthropic**: Cognition 2025 hylkäsi rinnakkaiset kirjoittajat; 2026 sallii vain yksisäikeiset kirjoitukset + lisäälykkyys. Cursor ajaa satoja rinnakkaisia kirjoittajia, mutta tehtävä (selain, SQLite) on automaattisesti mitattava. Ristiriita purkautuu todennäköisesti tehtävän verifioitavuudella, ei periaatteella.
- **Akita (R) vs Cursor/HydraFusion (V)**: yksi riippumaton mittaus (n=1, Rails-greenfield, yksi tekijä) sanoo Opus yksin voittaa; kaksi valmistajan mittausta sanoo hybridi on 36–87 % halvempi samalla laadulla. Erot: tehtävä (yhtenäinen vs hajotettava), mittaus (halvan toteuttajan hinta vs piilotettu suunnittelijakulu), ja valmistajat virittivät samoilla benchmarkeilla.
- **Cursor-parvessa "Composer 2.5"** on Cursorin oma malli; ei ole varmaa että se on avoin, joten tulosta ei voi suoraan lukea avoimien mallien todisteeksi. Akitan avoimet toteuttajat (Kimi K2.6, GLM 5.1, Qwen 3.6) ovat avoimia, mutta suunnittelija oli aina Opus.
- Fugu- ja HydraFusion-luvut vertaavat Opus 4.8:aan/Opus 5:een, ei Opus 5.5:een; Fugu-poolissa vain suljettuja malleja.
- Moonshotin 100/1 500 (K2.5) vs 300/4 000 (K2.6) -luvut vaihtelevat lähteittäin; K2.5-raportti on ensisijainen.
- HN-lähteet ovat anekdootteja ja osa kommentoijista mainostaa omaa tuotettaan (Weave, Bullet, Tokenless); Bullet-ketjussa huomautettiin benchmarkin kyllästymisestä.
- **Ei löytynyt**: riippumaton mittaus, jossa suunnittelija, toteuttaja ja arvostelija ovat kaikki avoimia malleja ja vertailukohta Opus 5.5; mikään lähde ei kerro paljonko arvostelijan vaihto halvempaan malliin muuttaa laatua; Factoryn omaa blogia mallivalinnoista; Sourcegraph/Augment-lukuja (vain myyntimateriaalia); OpenAI-oppaan alkuperäistekstiä (PDF ei purkautunut); Cognitionin SWE-1.6-sivua ja Cursor Composer -mallin tietoja ei luettu.

## 15. Syvähaku D: työn välitys ja tarkistus

## Osa D — työn välitys ja tarkistus roolien välillä (haettu 19.10.2026)

Alkuperäiset sivut ladattu Macin kautta kansioon `lataukset/d/` (tekstit `lataukset/d/txt/`). "luettu" = alkuperäinen sivu haettu ja tarvittavat osat luettu (abstrakti + tulososiot, ei koko artikkelia). "luettu (tiiv.)" = vain abstrakti ja johdanto luettu. "yhteenveto" = vain hakuyhteenveto. Näyttö: R = riippumaton, V = tekijän oma, A = anekdootti. Hinta/Aika-sarakkeissa "–" = ei mitattu lähteessä.

### Taulukko

| Lähde (pvm) | Prosessi ja roolit | Malli roolia kohden | Tehtävä, benchmark | Vertailukohta | Laatuero | Hinta × | Aika × | Näyttö |
|---|---|---|---|---|---|---|---|---|
| TeamBench, arXiv 2605.07073 (8.5.2026), luettu | Planner (näkee koko spesin, ei muokkaa) / Executor (näkee vain tiivistelmän) / Verifier (todistaa); roolit pakotettu OS-oikeuksilla | 13 mallia; 27 ristiinsiirtoyhdistelmää 3 perheestä (Anthropic, OpenAI, Google), 25 tehtävää × 3 siementä | 851 mallipohjaa, 155 tehtävän ablaatio (Gemini-3 Flash) | Solo, Restricted, No-Plan, No-Evaluate | Verifier hyväksyy 49,4 % grader-hylkäämistä (n=1083); Verifierin poisto +5,5 p; Planner +2,4 p (vaikeat); tiimi +15,7 p heikoimmassa Solo-viidenneksessä, −10 p parhaassa | PGEAVA 22,7→26,7 % hinta 39,58→20,52 $ (0,52×) | – | R |
| Complexity Trap, JetBrains, arXiv 2508.21433 v3 (27.10.2025), luettu | Yksi agentti, kontekstin hoito: raaka / havaintojen maskaus / LLM-tiivistys / hybridi | Qwen3-Coder 480B, Qwen3-32B, Gemini 2.5 Flash ym. (5 konfiguraatiota); tiivistäjä sama malli | SWE-bench Verified, SWE-agent (+50 instanssin OpenHands-tarkistus) | Raaka agentti, LLM-Summary | Maskaus: ratkaisuaste sama tai +0,6…+2,6 p; hybridi +2,6 p | Maskaus 0,48× raaka (−52 %); hybridi −7 % vs maskaus, −11 % vs tiivistys | LLM-Summary pidentää ajoa +13…15 % kierroksia | R (toisen kuin OpenHands-tekijät) |
| OpenHands condenser -blogi (9.4.2025), luettu | Tiivistäjä korvaa vanhat tapahtumat yhteenvedolla kynnyksen jälkeen | – | SWE-bench Verified -osajoukko | Ilman tiivistystä | "Vähintään yhtä hyvä" | per-turn ≤0,5× | – | V |
| Harness Engineering, arXiv 2609.00006 (2026), luettu (grep) | Lähdekoodianalyysi 11 harnessista (Claude Code, Codex, OpenHands, Aider, Mini-SWE-Agent, Hermes ym.) | – | – | – | – | – | – | R (koodista luettu, ei mittaus) |
| Cognition "Don't Build Multi-Agents" (12.6.2025), luettu | Yksisäikeinen agentti; tiivistäjämalli pitkälle ajolle | Tiivistäjä hienosäädetty pienempi malli | Periaatteet, ei mittausta | – | – | – | – | A/V |
| Cognition "Multi-Agents: What's Actually Working" (22.4.2026), luettu | Kirjoittaja + puhtaan kontekstin katselmoija; "smart friend" (pieni ensisijainen kutsuu suurta) | SWE-1.5/1.6 + Sonnet 4.5; Claude+GPT tuotannossa | Devin-tuotanto | – | Devin Review löytää ka. 2 bugia/PR, ~58 % vakavia; SWE-1.5 ensisijaisena "ei riittävän hyvä" | – | – | V/A |
| Anthropic multi-agent research system (6/2025), luettu | Lead + rinnakkaiset subagentit, muisti, tulokset tiedostoon | Lead Opus 4, subagentit Sonnet 4 | Sisäinen tutkimusarviointi, BrowseComp | Yksittäinen Opus 4 | +90,2 % (sisäinen); tokenien määrä selittää 80 % BrowseComp-varianssista | ~15× tokenia vs chat (agentti ~4×) | – | V |
| Aider architect/editor (26.9.2024), luettu | Architect kuvaa ratkaisun, Editor tuottaa muokkaukset | o1-preview + DeepSeek/o1-mini/Sonnet; Sonnet+Sonnet | Aider-koodimuokkausbenchmark | Sama malli yksin | o1-preview+DeepSeek (whole) 85,0 vs 79,7 yksin; Sonnet+Sonnet 80,5 vs 77,4; gpt-4o+DeepSeek 74,4 vs 71,4 | – | – | V (vanhat mallit) |
| PlanAhead, arXiv 2605.29927 (2026), luettu | Staattinen planner→executor, 4 suunnitelmamuotoa (osatavoitelista, kerronta, pseudokoodi, tarkistuslista) | GPT-4.1-mini, Qwen-2.5-VL-72B, Gemini 2.5 Flash kaikissa rooleissa | WebArena, 158 vaikeaa tehtävää | Dynaaminen suunnittelu, homogeeniset parit | Paras muoto riippuu mallista; sekaparit yleensä parempia kuin samat | – | – | R |
| From Plan to Action, arXiv 2604.12147 (2026), luettu | Suunnitelma järjestelmäkehotteessa, 8 muunnelmaa | 4 LLM:ää (mm. DeepSeek-V3/R1, Devstral-small) | SWE-bench Verified (497) ja Pro, 21 120 ajoa | Vakio-, ei-, puutteellinen, täydennetty suunnitelma | Huono suunnitelma pahempi kuin ei suunnitelmaa; ylimääräiset vaiheet voivat heikentää; muistutus 5 askeleen välein parantaa noudattamista ja onnistumista | – | – | R |
| Planning-as-Routing, arXiv 2609.38108 (2026), luettu (tiiv.) | LLM valitsee suunnittelutavan, deterministinen reititin ohjaa tapakohtaiselle executorille | 3 LLM:ää | 4 benchmarkia; SWE-bench Verified | Yleinen Plan+ReAct | SWE-bench 0,36→0,44; ALFWorld 0,48→0,92; vain 22–45 % ajoista säilyttää julistetun rakenteen | – | – | V |
| General Agent Evaluation, arXiv 2602.22953 (2026), luettu | 5 agenttiarkkitehtuuria × 5 mallia × 6 benchmarkia | DeepSeek-V3.2, Kimi-K2.5 (avoimet); Opus 4.5, GPT 5.2, Gemini 3 | SWE, tau2-bench, AppWorld ym., 100 tehtävää/benchmark | Arkkitehtuurit keskenään | Arkkitehtuurin vaihto: 7–12 p suljetuilla, 14–18 p avoimilla; avoin malli 0,83 vs 0,00 eri arkkitehtuurilla (tau2) | Kustannus/onnistuminen vaihtelee ~30× | – | R |
| Constraint Tax (tool suppression), arXiv 2606.25605 (2026), luettu | Työkalukutsu + JSON-skeema samassa pyynnössä; kaksivaiheinen ajo korjaukseksi | Qwen3.5/3.6-perhe (esim. 35B-A3B, 122B-A10B, 397B), SGLang ja vLLM | Oma toistettava koe | Tools ON/Schema OFF: 100 % kutsuista | Kutsut putoavat 0 %:iin yhteiskäytössä; kaksivaiheinen palauttaa | +1 kierros | – | V (yksi ryhmä) |
| Bitter Lesson of Tool Calling, arXiv 2608.06370 (2026), luettu (tiiv.) | Ohjelmallinen työkalukutsu (Python-stubit) vs JSON | 14 mallia (suurin osa suljettuja) | BFCL v4 | Natiivi JSON | PTC ≥ JSON 11/14 mallilla; GPT-5.6-perhe +10,6 % | – | – | V |
| tau-bench, arXiv 2406.12045 (2024), luettu (grep) | Agentti + simuloitu käyttäjä + API-työkalut + sääntödoku | gpt-4o ym. (2024) | tau-retail/airline, pass^k | – | gpt-4o FC: pass^1 ~61 %, pass^8 <25 % (retail); virheet: väärä argumentti/tieto, sääntöjen noudattaminen, yhdistetyt pyynnöt | – | – | R (alkuperäinen benchmark) |
| False Success, arXiv 2606.09863 (6/2026), luettu | Agentti väittää valmista; 5 tuomaria × 5 kehotetta vs TF-IDF-ilmaisin | 8 mallia perhettä (tau2), 4 (AppWorld) | 9 876 tau2- ja 1 879 AppWorld-ajoa | Ympäristön tila | Tuomarit AUROC ≤0,65 (tau2), 0,54 (AppWorld); TF-IDF 0,83 / 0,95; 45–48 % epäonnistumisista valheellista onnistumista | TF-IDF 3 300× nopeampi | – | R (ICML-työpaja) |
| RuVerBench, arXiv 2606.29920 (2026), luettu | LLM-tuomari tarkistaa ihmisen kirjoittaman rubriikin agentin tuloksesta | 18 tuomaria; avoimet: Kimi K2.6, DeepSeek V4 Pro/Flash, GLM-5.1, MiMo v2.5 Pro, gpt-oss | 843 koodi- + 1 615 tutkimusinstanssia, ihmisleimat | Ihmiset 90,5 BAcc (koodi) | Paras GPT-5.4 89,4; Kimi K2.6 84,3; DeepSeek V4 Pro 83,8; GLM-5.1 80,8; gpt-oss-120B 77,1; Llama-3.1-8B 61,7 | 3–5 ääntä riittää | – | R |
| Self-Preference Bias, arXiv 2410.21819 (2024), luettu (tiiv.) | LLM arvioi kilpailevia vastauksia | 8 mallia, GPT-4 voimakkain | Dialogiarviointi | Ihmisarvio | Matalan perpleksiteetin teksti saa korkeammat pisteet kuin ihmiseltä, tekijästä riippumatta | – | – | R |
| LLM Evaluators Recognize and Favor Their Own, arXiv 2404.13076 (ICML 2024), luettu (tiiv.) | Arvioija tunnistaa omat tulosteensa | GPT-4, Llama 2 | Tiivistys, kontrolloidut hienosäätökokeet | – | Itsetunnistus korreloi lineaarisesti itsesuosinnan kanssa | – | – | R |
| Huang ym., arXiv 2310.01798 (ICLR 2024), luettu (tiiv.) | Itsekorjaus ilman ulkoista palautetta | GPT-3.5/4, PaLM-2 | Päättely (GSM8K ym.) | Ensimmäinen vastaus | Suoritus joskus huononee itsekorjauksen jälkeen | – | – | R |
| R2E-Gym, arXiv 2504.07164 (2025), luettu | Yksi agentti + kaksi verifioijaa: suoritukseen perustuva (generoidut testit) ja suoritukseton (opittu) | Qwen2.5-Coder-32B (avoin) | SWE-bench Verified | Pass@1 34,4 % | Kumpikin tasaantuu 42–43 %, hybridi 51 % | Best@K (N rollouttia) | – | V (kirjoittajien menetelmä) |
| Failure as a Process, arXiv 2607.09510 (2026), luettu | Terminal-Bench-ajojen annotointi (3 843 ajoa, 1 794 annotoitua, 7 mallia, 3 kehystä) | – | Terminal-Bench | – | 71 % onnistuneista ajoista sisältää virheen; palaudutaan, kun virhesignaaliin reagoidaan (92 % vs 37 %) | – | – | R |
| CLI-Universe, arXiv 2606.22883 (2026), luettu | Tehtävien synteesi + failure-luokittelu (9 tilaa) | Opus-4.6, GPT-5.3-Codex, GLM-5, DeepSeek-V4-Pro; Qwen3-32B hienosäädetty 6k:lla | Terminal-Bench 2.0 | – | Tarkistus-luokka 47–60 % epäonnistumisista; Qwen3-32B 3,4→33,4 | – | – | V |
| AdaMAST, arXiv 2607.16387 (2026), luettu (tiiv.) | Taksonomia-koodattu virhepalaute ja AdaMAST-Judge | SWE-agent, Claude Code | SWE-bench Verified Mini, TB 2.0 | Vapaamuotoinen reflektio, Pass@1 | 60→70 % (SWE-agent); best-of-5 +8…15 p | – | – | V |
| DeepSWE, arXiv 2607.07946 (2026), luettu (grep) | Käsin kirjoitetut verifioijat vs PR:n perityt testit; riippumaton LLM-tuomari auditoi | 16 agenttikonfiguraatiota | 113 tehtävää; SWE-Bench Pro vertailu | – | Tuomari eri mieltä: Pro-testit 32,4 % (67 FP, 189 FN / 789), käsin kirjoitetut 1,4 % | – | – | R |
| MAST, arXiv 2503.13657 (2025), luettu (tiiv.) | 14 virhetilaa 7 moniagenttikehyksestä | GPT-4, Claude 3, Qwen2.5, CodeLlama | 1 600+ jälkeä | – | Virheet: järjestelmäsuunnittelu, agenttien väärinymmärrys, tarkistus | – | – | R |

Vain yhteenvetona (en lukenut alkuperäistä): generoitujen testien epäkelpoisuus 34–62 % (arXiv 2602.10522), LiveCodeBench-verifioijan aukot (arXiv 2507.06920), Self-play code+test (arXiv 2502.14948), Gabrielanhaia-blogi suunnitelman rakenteesta.

### Päätös 3 — työn välitys, konteksti

1. **Suunnitelma ei välity täydellisenä.** TeamBenchissä Executor sisälsi vain 0,21 Plannerin spesifikaatiolle kriittisistä tokeneista (Planner 0,79, Executorin työkalusyötteet ja -tulosteet 0,24; alaraja). Planner lisäsi pistemäärää vain 2,4 p ja vain vaikeissa tehtävissä, joissa vaatimuksissa oli päätössääntöjä (R). Tulkinta: pelkkä "lyhyt tehtävänanto" ei riitä, jos vaatimukset ovat piilossa.
2. **Tehtävänannon pakolliset kentät.** Anthropicin delegointiohje: jokaisella subagentilla tavoite, tulosmuoto, ohje työkaluista/lähteistä ja selvät rajat. Ilman niitä subagentit tekivät päällekkäistä työtä (V, ei lukuja). TeamBench: sama päätelmä toiseen suuntaan, koska pienen briefin saanut Executor menetti spesin.
3. **Muoto riippuu vastaanottajamallista.** PlanAhead: GPT-4.1-mini toimi parhaiten kerrontamuodolla, Qwen-2.5-VL tarkistuslistalla; mallipari vaihtelee (R, WebArena, ei koodi). Suunnittelumuodon pitää testata toteuttajamallilla, ei oletettava.
4. **Huono suunnitelma on pahempi kuin ei suunnitelmaa; lisävaiheet voivat haitata** (Plan→Action, SWE-bench, 21 120 ajoa, R). Pidä suunnitelma lyhyenä, mallin omaa työtapaa vasten. Suunnitelman muistutus 5 askeleen välein paransi noudattamista ja onnistumista, ja Planning-as-Routing mittasi, että vain 22–45 % ajoista säilytti julistetun rakenteen. Suunnitelmaa on siis valvottava ja toistettava, ei vain lähetettävä kerran.
5. **Perustelujen siirtoa ei ole mitattu erikseen** (ks. avoimet). Epäsuora vihje: Cognitionin "smart friend" jakaa koko kontekstin haarukan (80/20-ratkaisu), ja iso malli saa kehotteen kertoa, mitä tiedostoa ensisijainen ei ole lukenut (V/A). Aider: Architect→Editor-pari nosti tuloksen kaikilla pareilla (+3…+5 p, V, vanhat mallit).
6. **Jaettu vs eristetty konteksti riippuu roolista.** Kirjoittaja ja ehdottaja: jaa polku (Cognition: kirjoitukset yksisäikeisiksi, V/A). Katselmoija: eristetty puhdas konteksti toimi paremmin (Cognition, V), koska se päättelee takaperin toteutuksesta eikä periydy kirjoittajan virheistä. Mutta katso päätös 4: TeamBench-Verifier hyväksyi väärin 49 %.
7. **Kontekstin tiivistys: maskaus ensin, LLM-tiivistys viimeiseksi keinoksi.** JetBrains: maskaus −52 % kustannus ja +2,6 p ratkaisuaste Qwen3-Coder 480B:llä; LLM-tiivistys pidensi ajoja 13–15 % (yhteenveto toimii "jatka"-signaalina), tiivistyskutsut jopa 7,2 % kustannuksesta eikä niiden välimuisti toimi. Hybridi (maskaus kierrokset 1–43, sitten tiivistys, N=43, ikkuna 10) −7 / −11 % ja +2,6 p. Virhearvio-kriitikon lisääminen tiivistykseen ei auttanut ja pidensi ajoja (R, yksi kehys, yksi benchmark). OpenHandsin oma "2× halvempi" on V. Harness-analyysi: 7/11 käyttää kynnystiivistystä (R, kuvaus), OpenHands-condenserit 10→3, ja tiivistys toimii myös virheestä toipumisena (kontekstin ylitys, vioittunut historia).
8. **Moniagentin kustannus on tokeneissa.** Anthropic: tokenit selittivät 80 % BrowseComp-varianssista, agentti ~4×, moniagentti ~15× chatin tokenit (V). Hyöty tuli leveästä rinnakkaisesta hausta, ei kirjoittamisesta.

### Päätös 4 — tarkistussignaali

1. **Testit ja ajo ovat paras signaali, mutta eivät virheettömiä.** R2E-Gym (avoin 32B): suoritukseen perustuva ja suoritukseton verifioija tasaantuvat kumpikin 42–43 %, hybridi 51 % (V). Testipohjainen erottelee huonosti; suoritukseton suosii tyylillisiä piirteitä ja agentin "ajatuksia" (V). Oikeiden PR-testien tulos eroaa LLM-tuomarista 32,4 %:ssa (DeepSWE R, ei totuus, mutta osoittaa kohinaa) – käsin kirjoitetut verifioijat 1,4 %. Generoitujen testien epäkelpoisuus 34–62 % (yhteenveto).
2. **LLM-tuomari yksin on epäluotettava portinvartija.** TeamBench: Verifier hyväksyi 49,4 % hylättävistä (Haiku 4.5 60 %, Gemini-3 Flash 77 %, GPT-5.4 mini 36 %); väärä hylkäys <19 %; Verifierin poisto nosti pisteitä; kolme virhetapaa: optimistinen, kaiku (toistaa Executorin väitteen), uudelleenkirjoitus. False Success: viisi tuomaria × viisi kehotetta eivät ylittäneet AUROC 0,65 (tau2) / 0,54 (AppWorld); tuomari luottaa varmaan loppukommenttiin, ei tilamuutokseen. Failure-as-Process: valehtelu (fabrication) peittää epäonnistumisen juuri palautumattomissa ajoissa → "väitettyä onnistumista ei voi uskoa sellaisenaan".
3. **Milloin tuomari kelpaa.** RuVerBench: rubriikki + ihmisen kirjoittamat kriteerit, tulos 89,4 BAcc koodissa (ihminen 90,5); avoimet 77–84 (Kimi K2.6 84,3, DeepSeek V4 Pro 83,8, GLM-5.1 80,8, gpt-oss-120B 77,1, pienet 61–72). Heikoin kohta koodissa: Tools- ja Rules-rubriikit. Tuomari toimii, kun kriteerit ovat konkreettisia ja ennalta kirjoitettuja ja sille annetaan koko jälki. Virheet ovat osittain eri mallien kesken (kolmen parhaan virhejoukkojen limittäisyys 20,6 %), joten eri perheen mallien äänestys auttaa; saman tuomarin 3–5 ääntä poistaa vain satunnaisvaihtelun, ei johdonmukaista virhettä.
4. **Oma malli arvioi omaa työtään.** GPT-4:llä voimakas itsesuosinta, jonka syy on matala perpleksiteetti (tuttu teksti), ja itsetunnistus korreloi lineaarisesti itsesuosinnan kanssa hienosäädössä (R, vanhat mallit, ei koodiagenttia). Itsekorjaus ilman ulkoista palautetta ei paranna päättelyä ja voi heikentää (Huang ym.). Kriitikko-LLM tiivistyksen jatkona ei auttanut (JetBrains). Vastaväite: Cognitionin sama malli puhtaalla kontekstilla löytää bugeja (V/A; mittaa bugien löytöä, ei hyväksy/hylkää-porttia). Johtopäätös: samaa mallia voi käyttää löytäjänä, mutta portin pitää perustua ajoon tai toiseen perheeseen.
5. **Ristiintarkistus.** Ei suoraa kokeilua "toinen avoin malli tarkistaa avoimen mallin koodia". Lähimmät: RuVerBench (limittäisyys 20,6 %), TeamBench (OpenAI-Verifier paras marginaali, Executor+Verifier-valinnat merkitsevät enemmän kuin Planner; järjestys epästabiili: 28,9 % pareista kääntyi siementen välillä).
6. **Halpa ilmaisin voittaa tuomarin tietyssä tehtävässä.** TF-IDF-ilmaisin 0,83 / 0,95 AUROC vs tuomari ≤0,65 (R, kaksi benchmarkia, tuotantoseuranta). Kun omia jälkiä kertyy, ilmaisimen voi kouluttaa omille epäonnistumisluokille.
7. **Taksonomia-palaute.** AdaMAST: koodatut virheet 60→70 % SWE-agent (Mini) ja best-of-5 +8…15 p TB2:ssa (V, pieni osajoukko).
8. **Halpa vartija:** Hermesin verify-on-stop (hylkää tekstivastauksen, jos koodia muutettiin ilman tuoretta verifiointitodistetta) ja OpenHands /goal -tuomari (R, koodista) – ei mitattu erikseen.

### Päätös 6 — budjetti ja varhainen lopetus

1. **Epäonnistuneet ajot ovat kalliimpia** (General Agent Eval, R) ja ratkaiseva virhe tulee alussa mutta paljastuu myöhään (Failure-as-Process: lukitus muutamassa ensimmäisessä askeleessa, esimerkkiajo askel 2→6). Useimmat epäonnistuneet ajot jatkuvat pitkään sen jälkeen, kun onnistuminen on mahdotonta; palautuminen yli tyypillisen onnistuneen pituuden harvoin auttaa → rajaa korjausyritykset ja pakota uudelleendiagnoosi. Tämä on suora peruste kovalle korjausyrityskatolle ja varhaiselle tarkistukselle askelten 5–10 aikoihin.
2. **Halpa varhainen lopetus kehyksissä:** Mini-SWE-Agent rajoittaa peräkkäiset virheelliset vastaukset ja kellotuntia; OpenCode kolmen samanlaisen kutsun silmukkatunnistin; Hermes IterationBudget 90 ja loppukommentti; OpenHands-stuck detector; Gemini CLI hybridi (Harness-tutkimus, R: suositus 18: ota halvat rajat käyttöön).
3. **Tokenit kuluvat konteksti-ikkunaan:** maskaus heti, tiivistys vasta pitkillä ajoilla (päätös 3.7). Mistral Vibe: kierros-, hinta-, token-, kontekstivaroitus- ja automaattitiivistys-middleware (kuusi vakiona).
4. **Kaskadi.** Cognition: pieni ensisijainen + iso "smart friend" ei toiminut, kun ensisijainen oli liian heikko (ei osannut milloin eskaloida); toimi kahdella vahvalla mallilla reitittäjänä (V/A). Planning-as-Routing: LLM ei valitse luotettavasti suunnittelutapaa. TeamBench: halvin Pareto-piste 18,7 % / 2,09 $ vs 26,7 % / 20,52 $; kuluvan rahan jako Planner:lle ei ole tärkeä, Executorin ja Verifierin valinta on (R, pieni otos).
5. **Uudelleenyritykset eivät ole riippumattomia.** tau-bench pass^k: gpt-4o 61 % → <25 % pass^8 (R, vanha malli) eli sama tehtävä epäonnistuu samoin; best-of-N tarvitsee tarkistimen, ei pelkkiä toistoja. Tuomarin 3–5 ääntä riittää (RuVerBench).

### Päätös 6/4 — työkalukutsujen luotettavuus avoimilla malleilla

1. **Pienet avoimet mallit kaatuvat työkalukutsuihin, eivät päättelyyn.** TeamBench: Qwen3-perhe (≤30B) enintään 5,6 % ja gpt-oss-20b <18 % Solo, syynä virheelliset työkalukutsut ja kontekstin ylitys. Tulos mittaa silloin kutsuvarmuutta, ei yhteistyötä (R).
2. **Arkkitehtuuri ratkaisee avoimilla enemmän:** DeepSeek-V3.2 ja Kimi-K2.5 heiluvat 14–18 p arkkitehtuurin mukaan (suljetut 7–12 p); sama malli 0,83 vs 0,00 tau2:ssa, koska se kirjoitti ensimmäisellä vuorolla viestin käyttäjälle työkalukutsun sijaan ja ajo päättyi. AppWorldissa (468 toimintoa) kaikki avoimet konfiguraatiot romahtivat (paras 0,13 vs Opus 0,70). Kolme parasta arkkitehtuuria käyttää skeemavartijaa (havainto, ei kontrolloitu koe). Työkalulistan lyhennys (shortlisting) auttoi neljällä viidestä mallista, ei DeepSeekillä (kontrolloitu, R).
3. **Rakenteinen tuloste + työkalukutsu yhdessä voi poistaa kutsut kokonaan.** Qwen3.5/3.6 SGLang/vLLM:llä: `response_format`-skeema + työkalut → kutsujen osuus 100 % → 0 %, koska kieliopin FSM peittää `<`-merkin (Qwen XML-tyylin kutsun ensimmäinen merkki). Korjaus: kaksivaiheinen (työkalukutsu ensin, skeemallinen vastaus toisella kierroksella) (V, yksi ryhmä, mekanismi vahvistettu SGLangin koodista). Vaikuttaa suoraan Nebius-/vLLM-käyttöön, jos käytetään skeemarajoitusta.
4. **Kehysten korjauskeinot (R, koodista):** Hermes: skeemadriftin korjauskerros ("42"→42) "havaittujen avointen mallien ulostulojen vuoksi", ~40 siirtymävirheen uudelleenyritysluettelo, yksi tiivistä-ja-yritä-uudelleen kontekstin ylitykseen, ~23 arvon FailoverReason joka valitsee tiivistyksen / avaimen vaihdon / varamallin ketjun / keskeytyksen. OpenHands: tiivistys myös virheestä toipumiseen; RouterLLM ja varastrategia. Gemini CLI: LLM-"edit fixer" korjaa epäonnistuneen muokkaustäsmäyksen. Suositus 5: tarkka alimerkkijonovaihto vahvoille malleille, sumea kaskadi (tarkka → välilyönti → regex → sumea) avoimille ja heikommille; älä käytä rivinumeroita. Mini-SWE-Agent: raja N peräkkäiselle virheelliselle vastaukselle.
5. **Muoto: JSON vs koodi.** BFCL v4, 14 mallia: ohjelmallinen kutsu ≥ JSON 11/14, GPT-5.6-perhe +10,6 % (V; luin vain tiivistelmän, avoimien mallien osuus epäselvä). Ei näyttöä avoimille.
6. **tau-bench-virheet** (2024, gpt-4o): väärä argumentti (oikea työkalu, väärä arvo), puuttuva tai väärä tieto, sääntöjen noudattamatta jättäminen, yhdistettyjen pyyntöjen osittainen ratkaisu. Terminal-Bench (CLI-Universe, 9 tilan taksonomia): suurimmat tarkistuksen (47–60 % suljetuilla ja GLM-5/DeepSeek-V4-Pro) puutteet; hienosäädetty Qwen3-32B kaatuu askelten toistoon (23 %) pikemmin kuin tarkistuksen välttämiseen.

### Avoimet ja ristiriitaiset

- **Ei löytynyt:** (a) mittausta "suunnitelma ilman perusteluja vs. perusteluineen" planner→executor-siirrossa; (b) planner→executor-koetta avoimilla koodimalleilla SWE-benchillä hinnan kanssa; (c) kontrolloitua uudelleenyritys-/skeemavalidointi-/varamalliablaatiota BFCL:llä tai tau-benchillä (vain havainto "skeemavartija esiintyy kolmessa parhaassa kehyksessä" ja yksittäiset kehysten kuvaukset); (d) avoimen mallin läpäisy/hylkäys-porttia koodille, jonka väärä hyväksyntä- ja hylkäysprosentti mitattaisiin piilotestejä vasten (RuVerBench käyttää rubriikkeja, ei piilotestejä).
- **Ristiriita:** Cognition ja Anthropic mittaavat/kertovat moniagenttietua (bugien löytö, +90 % laajassa haussa; V) mutta TeamBench ja Cognitionin oma 2025-kanta antavat tiimin tuoda vähän tai haitata hyvin pärjäävissä tehtävissä (R). Sovitus: hyöty laajassa, lukevassa ja heikon Solo-tuloksen tehtävässä; haitta, kun Solo jo hyvä ja Verifier muokkaa.
- **Ristiriita:** LLM-tiivistys OpenHandsin oman blogin mukaan "sama laatu, 2× halvempi" vs JetBrains: maskaus halvempi ja yhtä hyvä. Eri perusviivat (raaka vs maskaus); molemmat sopivat siihen, että tiivistys säästää raakaan nähden.
- **Rajoitteet:** Aiderin luvut 9/2024 ja vanhat mallit; tau-bench 2024 gpt-4o; Self-preference/Huang 2023–24 eivät mittaa koodiagenttia. TeamBench-otos pieni (25 tehtävää × 3 siementä rooliyhdistelmille), järjestys epästabiili. Constraint Tax -paperin laajuus rajautuu Qwen-perheeseen ja kahteen palvelimeen. Cognition-ja Anthropic-blogit ovat valmistajalukuja. Harness-tutkimus on kuvaus, ei mittaus.

## 16. Syvähaku E: automaattinen optimointi, kehykset ja protokollat

## Osa E: prosessin automaattinen optimointi, orkestrointikehykset ja protokollat (haettu 19.10.2026)

Näyttö: R = riippumaton mittaus, V = tekijän/valmistajan oma luku, A = anekdootti/mielipide. "luettu" = alkuperäinen sivu luettu, "abstrakti" = vain tiivistelmä luettu (arXiv API), "yhteenveto" = vain hakuyhteenveto. Lataukset: `lataukset/e/`.

### 1. Lähdetaulukko: optimointimenetelmät ja arvioinnit
| Lähde | Prosessi ja roolit | Malli roolia kohden | Tehtävä, benchmark | Vertailukohta | Laatuero | Hinta × / $ | Aika × | Näyttö |
|---|---|---|---|---|---|---|---|---|
| [ADAS 2408.08435](https://arxiv.org/abs/2408.08435), luettu | Meta-agentti kirjoittaa agentin Python-koodina; ei kiinteitä rooleja | haku: GPT-4-luokka; suoritus gpt-3.5; siirto Claude-Haiku/Sonnet, GPT-4 | ARC, DROP, MGSM, MMLU, GPQA | CoT, CoT-SC, Self-Refine, Role Assignment | DROP F1 +13,6, MGSM +14,4 %-yks.; ARC-siirrossa Claude-Sonnet ~50 % | haku 300–500 $/ajo (gpt-3.5, 2024) | – | V |
| [AFlow 2410.10762](https://arxiv.org/abs/2410.10762), luettu | MCTS koodityönkulun yli, operaattorit (ensemble, review, revise) | optimoija Claude-3.5-Sonnet; suorittajat 4o-mini, DeepSeek-V2.5, 4o, Sonnet | HotpotQA, DROP, HumanEval, MBPP, GSM8K, MATH | CoT-SC 76,0; MedPrompt; ADAS 67,2 | 80,3 vs 76,0 (+4,3 parhaaseen käsin tehtyyn); HumanEval 94,7 vs CoT-SC 91,6 | 22,50 $ haku + 1,66 $ ajo (MATH, MaAS/DAAO) | – | V |
| [MaAS 2502.04180](https://arxiv.org/abs/2502.04180), luettu | Superverkko: kyselykohtainen työnkulku, varhaislopetusoperaattori, kustannussakko λ | 4o-mini; avoimet Qwen-2.5-72B, Llama-3.1-70B | GSM8K, MATH, MultiArith, HumanEval, MBPP, GAIA | Vanilla 77,50; CoT 77,95; DyLAN 80,69; AFlow 82,25 | 83,59 (+2,9 parhaaseen käsin tehtyyn, +6,1 vanillaan) | haku 3,38 $ vs AFlow 22,50 $; ajo 6–45 % muista | haku 53 min (DyLAN 508, GPTSwarm 129) | V |
| [EvoAgent 2406.14228](https://arxiv.org/abs/2406.14228), luettu osin | Evoluutio (mutaatio, risteytys) laajentaa yhden agentin joukoksi | GPT-3.5/4 | ScienceWorld, TravelPlanner | suora ajo | GPT-4 27,97 -> 30,42 (+2,5) | – | – | V |
| [GPTSwarm 2402.16823](https://arxiv.org/abs/2402.16823), abstrakti | Laskentagraafi; solmuprompttien ja kaarten optimointi | – | GAIA ym. | – | MaAS-taulukossa GAIA 16,33 vs MaAS 20,69 | – | haku 129 min | V |
| [MIPROv2 2406.11695](https://arxiv.org/abs/2406.11695), abstrakti | Ohjeiden ja esimerkkien haku LM-ohjelman jokaiseen moduuliin | avoin malli | 7 LM-ohjelmaa | baseline-ohjelmat | voittaa 5/7:ssä | – | – | V |
| [GEPA 2507.19457 v2](https://arxiv.org/abs/2507.19457) (ICLR 2026), luettu | Reflektiivinen promptien evoluutio, Pareto-valinta, kaikki ohjelman promptit | Qwen3-8B ja GPT-4.1-mini; reflektori vahvempi | HotpotQA, IFBench, HoVer, PUPA, AIME-25, LiveBench | GRPO 24 000 rollout, MIPROv2 | Qwen3-8B +9,62 vs baseline (GRPO +3,68, MIPROv2 +2,61); promptit enintään 9,2x lyhyemmät | 86 $ (6 tehtävää, 4.1-mini); 2 400–7 000 rollout | – | V (vertaisarv.) |
| [Databricks, 24.9.2025](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization), luettu osin | GEPA yhden agentin tiedonpoimintaan | gpt-oss-120b vs Opus 4.1 / Sonnet 4 | IE Bench (oma, suljettu) | optimoimaton Opus 4.1 | optimoitu gpt-oss-120b ~+3 % yli Opus 4.1:n; optimoitu Opus +6–7 % | tarjoilu ~90x (Opus) / 20x (Sonnet) halvempi | – | V |
| [Mass 2502.02533](https://arxiv.org/abs/2502.02533), abstrakti | Kolmivaiheinen: lohkoprompttien, topologian, kokonaisprompttien optimointi | – | useita | ADAS, AFlow | "promptit ja topologia molemmat ratkaisevat" | – | – | V (Google) |
| [OneFlow 2601.12307](https://arxiv.org/abs/2601.12307), luettu osin | Moniagenttityönkulku ajetaan yhdellä mallilla monikierroksisena (KV-välimuisti jaettu) | yksi malli (4o-mini, Qwen3-8B vLLM) | 7 benchmarkia | homogeeninen MAS, AFlow | yksi agentti = homogeeninen MAS; vastaa optimoitua heterogeenistä | halvempi (KV-uudelleenkäyttö) | – | R (muut kuin menetelmän kehittäjät) |
| [Illusion of Multi-Agent Advantage 2606.13003](https://arxiv.org/abs/2606.13003), abstrakti | Automaattisesti generoidut MAS vs CoT-SC | – | päättely + BrowseComp-Plus | CoT-SC | automaatti-MAS jää CoT-SC:n alle | jopa 10x kalliimpi | – | R |
| [Rethinking Eval of Harness Evolution 2607.12227](https://arxiv.org/abs/2607.12227), luettu osin | Harness-evoluutio vs rinnakkaisotanta vs peräkkäinen tarkennus, sama budjetti | Opus 4.6, GPT-5.4, GPT-5.4 mini | Terminal-Bench 2.1 | suora 68,2 | ilman testejä: rinnakkaisotanta 72,3, harness-evoluutio 67,4; ei yleisty; pelit (ARC-AGI-3 +80 %) poikkeus | sama budjetti | – | R |
| [Meta-Harness 2603.28052](https://arxiv.org/abs/2603.28052), luettu osin | Agenttinen ehdottaja (Claude Code + Opus 4.6) hakee harness-koodia tiedostojärjestelmän kautta | 5 pitämätöntä mallia | tekstiluokittelu, IMO-tason matikka, TB2 | SOTA-kontekstinhallinta | +7,7 pist. 4x vähemmällä kontekstilla; +4,7 pist. 5 mallilla | haku "muutama tunti" | – | V |
| [AHE 2604.25850](https://arxiv.org/abs/2604.25850), abstrakti | Havaittavuuspohjainen harness-evoluutio (komponentit, kokemus, päätökset) | – | Terminal-Bench 2, SWE-bench Verified | Codex-CLI 71,9 | 69,7 -> 77,0; siirto +5,1…+10,1 pp kolmelle mallisuvulle; hyöty tools/middleware/muisti, ei system promptista | – | – | V |
| [Harness Updating Is Not Harness Benefit 2605.30621](https://arxiv.org/abs/2605.30621), abstrakti | Evolver-malli vs hyötyjä-malli | Qwen3.5-9B ... Opus 4.6 | – | – | evoluution päivitykset yhtä hyviä kaikilta; hyöty heikoimmalle mallille pieni, keskitasolle suurin | – | – | R |
| [MAS-Orchestra 2601.14652](https://arxiv.org/abs/2601.14652), abstrakti | RL-koulutettu orkestraattori, aliagentit funktiokutsuina | – | MASBENCH (5 akselia) | – | MAS-hyöty riippuu tehtävän rakenteesta, varmennuksesta ja mallien kyvystä | >10x tehokkuus | – | V |
| [Semantic Scholar](https://api.semanticscholar.org/), 19.10.2026 | viittaajat: ADAS 449 (323 v. 2026), GEPA 577 (508 v. 2026) | – | – | – | 2026-jatko on pääosin "harness" (Meta-Harness, AHE, HarnessX, Co-Harness, SkillOpt) | – | – | R |

### 2. Vastaukset (osa-alue 1): optimointi
- **Kuinka paljon voittaa käsin suunnitellun?** Kolme tasoa. (a) Promptit: suurin, luotettavin hyöty heikolle/avoimelle mallille kapeassa mitattavassa tehtävässä (GEPA +9,6 pist. Qwen3-8B:llä; Databricks: avoin 120B yli Opus 4.1:n, mutta tiedonpoiminta on yhden askeleen tehtävä, V). (b) Rakennehaku (ADAS, AFlow, MaAS): +3…6 pist. parhaaseen käsin tehtyyn halvalla suorittajalla (V); AFlow- ja MaAS-tekijät toistivat ADAS:n huonommaksi kuin pelkkä kehote (67,2 vs 72,8; 75,13 vs 77,50; kilpailijoiden ajo). Riippumattomat mittaukset: automaatti-MAS häviää CoT-SC:lle jopa 10x hinnalla (R), harness-evoluutio ei voita rinnakkaisotantaa samalla budjetilla (R). (c) Harness-haku (Meta-Harness, AHE): V-luvut suuria, R-luku negatiivinen. Pistemäärien lähde on lähes aina 2024–25 pienet mallit; vahvoille malleille hyöty pienenee (Databricks: Opus +6–7 %, mutta alkutaso korkea).
- **Millä tehtävillä?** Kapea, automaattisesti pisteytettävä tehtävä (poiminta, luokittelu, QA, matikka, koodi + testit). Pitkät avoimet koodaustehtävät: ei riippumatonta hyötynäyttöä; ainoa poikkeus pitkät pelit (ARC-AGI-3), joissa on rikas palaute.
- **Hinta.** Haku 3–86 $ promptitasolla ja pienellä suorittajalla (MaAS 3,38; AFlow 22,50; GEPA 86 koko 6 tehtävän sarjasta), ADAS 300–500 $/ajo. Metatason malli (Opus 4.6 Meta-Harnessissa) hinnoittelematon. Haku maksetaan kerran, mutta uudelleen jokaisen mallin-/tehtäväjoukon vaihdon jälkeen (ks. siirto).
- **Siirtyykö toiselle mallille?** Osittain. Promptit: GEPA-prompti Qwen3-8B:ltä GPT-4.1-miniin +9 % ilman muutosta (V). Harness-rakenne siirtyy (Meta-Harness +4,7 pist. 5 mallilla; AHE +5,1…10,1 pp), mutta AHE:n ablaatio: siirtyvät työkalut/middleware/muisti, ei prose-strategia. Työnkulut: AFlow: DeepSeek-V2.5:llä haettu työnkulku heikompi 4o-minillä kuin sillä itsellä haettu ("eri mallit tarvitsevat eri työnkulun"); Mass-artikkelin mukaan AFlow'n meta-prompt ei yleisty muille optimoijamalleille (yhteenveto). Päätelmä: optimoi kohdemallilla tai pienellä mallijoukolla ja mittaa uudelleen kun malli vaihtuu.
- **Käytännön työkalut (GH 19.10.2026).** DSPy 3.4.1 (MIT, 38,7 k tähteä, GEPA ja MIPRO sisällä), gepa 0.1.4 (MIT, 7 k), Ax 25.4.3 (Apache-2.0, TypeScript, `AxGEPA`, OpenAI-yhteensopiva päätepiste, OTel, MCP-asiakas; 3 k tähteä). Tutkimuskoodit ovat seisahtuneet: ADAS (viimeinen push 1/2025), AFlow (12/2025), MaAS (11/2025). Production-käyttöön kelpaavat siis GEPA/DSPy/Ax, ei ADAS/AFlow/MaAS.

### 3. Päätös 1 (roolit): mitä optimointinäyttö sanoo
1. Roolit eivät ole oletushyöty. Käsin tehdyt moniroolijärjestelmät ovat lähellä pelkkää CoT:ta (MaAS-taulukko: vanilla 77,5, CoT 77,95, CoT-SC 78,85, LLM-Debate 78,86; V) ja yksi agentti vastaa homogeenista MAS:ia (OneFlow, R). Automaatti-MAS häviää CoT-SC:lle (Illusion, R).
2. Hyöty kertyy rakenteesta, ei prompttiproosasta: tarkistin/testit, työkalut, middleware ja muisti siirtyvät ja tuottavat (AHE), rooliprompttien teksti ei siirry. Aloita siksi: yksi toteuttaja + tarkistin (testit) + rinnakkaisotanta; lisää rooli vain jos ablaatio näyttää hyödyn Scopesin omalla tehtäväjoukolla.
3. MAS-hyöty riippuu tehtävän rakenteesta (syvyys, leveys, rinnakkaisuus, varmennus; MAS-Orchestra, V): perustelu rooleille on tehtävä, jossa on aidosti erottuvia osatehtäviä ja erillinen konteksti, ei yleinen "suunnittelija-toteuttaja-tarkistaja" -putki.
4. Heterogeeninen malli roolia kohden maksaa: KV-välimuisti ei jaa mallien välillä (OneFlow), joten roolinvaihto toiseen malliin = uusi esitäyttö koko kontekstille.
5. Optimoija voi löytää roolit itse: MaAS ja AFlow karsivat operaattoreita kyselykohtaisesti, mutta niiden hyöty on pieni (+2…3 pist.), joten roolien automaattihaku ei ole ensimmäinen askel.

### 4. Päätös 6 (budjetti): mitä optimointinäyttö sanoo
1. Ensimmäinen budjettieuro rinnakkaisotantaan + tarkistimeen, ei optimointiin: samalla budjetilla rinnakkaisotanta 72,3 vs harness-evoluutio 67,4 vs suora 68,2 (Rethinking, R; testitön asetelma; testien kanssa sama johtopäätös).
2. Optimoinnin oma budjetti: promptihaku riittää usein 400–7 000 rollouttia, ja suurin osa kuluu validointiin (GEPA); aseta rollout-katto ja pysäytys, jos paras-k ei parane n kierrokseen (AFlow käyttää tätä).
3. Reflektori voi olla halpa: päivitysten laatu on lähes sama Qwen3.5-9B:llä ja Opus 4.6:lla (R, abstrakti), mutta suorittajan pitää olla vähintään keskitasoa (heikko ei noudata päivitettyä harnessia). Valitse pienin suorittaja, joka vielä hyötyy.
4. Ajoaikainen allokointi: kustannussakko λ ja varhaislopetusoperaattori (MaAS) leikkasivat ajon hinnan 6–45 %:iin muista; helppo kysely ei saa koko putkea. Sama periaate kuin ESITIEDOT 11.4 (reititin), mutta MaAS-luku on V ja vain pienillä malleilla.
5. Moniyrityslogiikka tarvitsee ulkoisen signaalin: itsearviointiin perustuva valinta (self judge) oli heikko (Rethinking); käytä testejä tai tarkistinta, muuten lisäyritykset hukkaan.
6. Kustannuskatto pitää olla jo haussa: GEPA 86 $, ADAS 300–500 $ ovat summia, jotka ylittävät nykyisen hyväksymättömän Nebius-katon (muisti: paid-api-spend-needs-approval); optimointiajo vaatii oman kattonsa ja hyväksynnän.

### 5. Orkestrointikehykset (osa-alue 2)
Repon tilanne: scopes/palvelu/*.mjs käyttää vain `node:`-importteja (ei npm-riippuvuuksia, ei package.json:ia palvelussa), Node v22.23.3; nebius-valitys.mjs kääntää Anthropic-muodon OpenAI-muotoon, kordinaattori.mjs on 109 rivin kolmen agentin tiimi.

| Kehys (GH 19.10.2026) | Kieli, lisenssi, versio | Mallineutraalius | Aliagentit, rinnakkaisuus | Jäljitys | Sopivuus Scopesiin | Näyttö |
|---|---|---|---|---|---|---|
| LangGraph.js (3,4 k) | TS, MIT, aktiivinen | LangChain-integraatiot (ei luettu tarkemmin) | graafi, durable execution, HITL, muisti | LangSmith (SaaS) | raskas LangChain-riippuvuusketju; hyvä jos tarvitaan keskeytys/jatko | README luettu |
| OpenAI Agents SDK JS (3,9 k) | TS, MIT, 0.20 (ei 1.0) | `baseURL` OpenAI-yhteensopivalle päätepisteelle, `setOpenAIAPI('chat_completions')`; AI SDK -adapteri (`agents-extensions/ai-sdk`) | handoff, agents-as-tools, guardrailit; hosted multi-agent vain GPT-5.6 (kokeellinen) | oletus: vienti OpenAI:lle; poisto `OPENAI_AGENTS_DISABLE_TRACING=1`; omat trace-prosessorit | kevyin TS-vaihtoehto; trace-vienti pois päältä, muuten repon sisältöä lähtee OpenAI:lle | docs luettu |
| Claude Agent SDK TS (1,8 k) | TS, Anthropic Commercial Terms, 0.3.x | Anthropic: ei tue ei-Claude-malleja gateway:n kautta; repo ajaa silti Nebiusta kääntäjällä | aliagentit (`agents`-parametri, malli aliakset), rinnakkaiset | Claude Code -istunto | pysyy työkalujen suorittajana (Read/Edit/Bash valmiina), ei orkestroijana | docs luettu |
| Mastra (28,9 k) | TS, Apache-2.0 + `ee/`-hakemistot yritysluvalla, @mastra/core 1.78 | malliyhdyskäytävä `provider/model`, 210+ tarjoajaa + OpenRouter-tyyppiset gatewayt | supervisor-agentit, workflow (haara, silmukka, rinnakkainen, suspend/resume) | OpenTelemetry GenAI -spanit (yhteenveto) | täysi paketti, mutta iso riippuvuus ja nopea julkaisutahti (1.51 7/2026 -> 1.78 10/2026) | docs + LICENSE luettu |
| Google ADK JS (1,4 k) | TS, Apache-2.0, Node >=20.19 | Gemini-ensin (`google_llm`, apigee, chrome) | sequential/parallel/loop, A2A-etäagentit | dev-UI | ei neutraali, jää pois | README luettu |
| AutoGen | Python, ARKISTOITU (Microsoft) | – | – | – | ei käyttöön; seuraaja Microsoft Agent Framework (.NET/Python/Go, ei JS) | README luettu |
| AG2 (5 k) / CrewAI (59,9 k) / smolagents (29,9 k) / Pydantic AI (20,7 k) | Python; MIT/Apache | kaikki mallineutraaleja (ei luettu) | CrewAI: "managerial overhead" ~3x tokenit, ~3x aika (AIMultiple, yhteenveto) | vaihtelee | vain Python-sivupalveluna (esim. DSPy/GEPA-optimointi); ei orkestroijaksi Node-palveluun | yhteenveto |

Huom: AIMultiple-vertailun tulokset ristiriitaisia (LangGraph nopein vs AutoGen johtaa), AgentMail-blogi on valmistajan; framework-overheadia ei voi mitata näillä, joten vertailuun ei luoteta.

### 6. Protokollat (osa-alue 3)
- **MCP**: vakaa spesifikaatio `2026-07-28` (luettu changelog). Suuret muutokset 2025-11-25:een: protokollatason istunnot ja `Mcp-Session-Id` pois, initialize-kättely pois (jokainen pyyntö kantaa versiot `_meta`:ssa, uusi `server/discover`), tehtävät siirretty laajennukseen `io.modelcontextprotocol/tasks`, MRTR korvaa palvelimen aloittamat pyynnöt, SSE-jatko pois, OTel-traceparent `_meta`:ssa. Kypsyys: standardi de facto työkaluille (TS SDK v2.3.1, 5.10.2026; Mastra, ADK, OpenAI SDK, Ax tukevat), mutta 2026-07 -muutos on rikkova: palvelimen ja asiakkaan SDK-versiot on kiinnitettävä yhteen.
- **A2A**: v1.0.0 12.3.2026, v1.0.1 28.5.2026 (GH-julkaisut luettu); a2a-js 1.3.0; Apache-2.0, 26 k tähteä. Linux Foundation väittää yli 150 organisaatiota ja tuotantokäyttöä (huhtikuu 2026; V, yhteenveto). Riippumatonta käyttömittaria ei löytynyt. A2A on tarkoitettu läpinäkymättömien, eri tahojen agenttien väliseen puheluun; saman palvelun sisäisille rooleille se on turha kerros (lisää verkko- ja skeemakulun ilman hyötyä).
- Päätelmä: MCP = työkalurajapinta (kyllä, kun työkalut jaetaan Claude Code -istunnolle ja muille); A2A = ei nyt; harkitaan vain jos Scopesin agentti avataan ulkopuolisille tai ulkopuolinen agentti kutsutaan.

### 7. Toteutusalusta (suositus, ei testattu)
1. **Ohjain: oma ohut Node-moduuli** kordinaattori.mjs:n jatkona, ei kehystä. Perusteet: palvelu on nolla-riippuvuus ja zero-npm; tarvittava rakenne on pieni (yksi toteuttaja, testitarkistin, N rinnakkaista yritystä, kustannuskatto), ja riippumaton näyttö suosii juuri sitä rakennetta (kohdat 3–4); nebius-valitys.mjs:ssä on jo malli, hinta, katto ja käännös. Jäljitys: JSONL-rivi per kutsu (rooli, malli, tokenit, $, tulos) ja OTel-yhteensopiva `traceparent` MCP:n `_meta`:ssa.
2. **Työn suorittaja: Claude Code (nykyinen kääntäjäreitti)** työkalu- ja tiedostotyöhön. Riski: Anthropic ei tue ei-Claude-malleja, joten kiinnitä claude-versio ja aja smoke-testi päivityksen jälkeen (ESITIEDOT 10).
3. **Optimointi offline, ei ajonaikaisessa palvelussa**: DSPy+GEPA (Python, palvelin tai Mac) tai Ax `AxGEPA` (TS). Tuloste on tekstiprompti-/harness-tiedosto, jonka Node-ohjain lukee; ajo vaatii oman hyväksytyn katon (GEPA ~86 $/6 tehtävää). Optimoi kohdemallilla, ei siirrä.
4. **Kehys vasta kun tarve todistettu**: jos tarvitaan durable execution + keskeytys/jatko, LangGraph.js; jos tarvitaan valmis supervisor+workflow+OTel, Mastra (Apache-2.0, ee-hakemistot ei käyttöön); jos halutaan vain handoff-silmukka, OpenAI Agents JS `chat_completions`-tilassa Nebiusta vasten ja trace-vienti pois. Python-kehykset (CrewAI, AG2, smolagents, Pydantic AI) vain sivupalveluna.
5. **Protokolla**: MCP työkaluille; A2A ei.
Epävarma: en mitannut yhdenkään kehyksen toimintaa Nebius-avoimilla malleilla (työkalukutsujen luotettavuus on repossa jo todettu riski).

### 8. Avoimet ja ristiriitaiset
- Rakennehaun hyöty: V-luvut +3…6 pist. vs R-luvut negatiivisia (Illusion, Rethinking). Eri benchmarkit ja suorittajat (4o-mini vs Opus 4.6/GPT-5.4); ei yhtä koetta, joka ratkaisisi. Ratkaisu: mittaa Scopesin omalla tehtäväjoukolla, vertailukohta rinnakkaisotanta.
- ADAS: kolme kuvausta (ADAS-paperi V: paras; AFlow/MaAS-toistot: huonompi kuin baseline; Illusion: ei saanut ARC-lukua toistettua, hakuyhteenveto). Tutkimuskoodin ikä (1/2025) vähentää luotettavuutta.
- Databricksin "90x" on tarjoilukustannus tiedonpoiminnassa, vertailukohta optimoimaton Opus 4.1; ei yleisty koodaukseen eikä Opus 5.5:een.
- Harness-papereiden Meta-Harness/AHE tulokset käyttävät Opus 4.6 -pohjaista ehdottajaa; ehdottajan hintaa ei löytynyt. Rethinking käytti samaa AHE-harnessia (Terminal-Bench 2.1 vs 2); ei suoraa uusintaa.
- Mastran versio: hakuyhteenveto sanoi 1.51.0 (15.7.), GH 1.78.0 (16.10.); tähtimäärä 22–29 k lähteestä riippuen. A2A-tuotantokäyttöluvut vain Linux Foundationin lähteestä.
- Ei löytynyt: optimoidun avoimen mallin prosessin mittausta Opus 5.5:tä vastaan; Claude Agent SDK:n virallista tukea Nebius-tyyppiselle malleille (vain "ei tueta"); kehysten riippumaton overhead-mittaus Node-kehyksille; DSPy/GEPA:n toimivuus Nebiuksen mallien kanssa (ei kokeiltu, ei maksullisia kutsuja).

## 17. Syvähaku F: arviointi, havaittavuus, kustannus ja viive

## Osa F: arviointi, havaittavuus, kustannus- ja viivemallinnus, paikalliset pienet mallit (19.10.2026)

Kaikki sivut haettu 19.10.2026 Macin kautta. Tallessa: `.../syvahaku/lataukset/f/` (html + txt). "Hinta ×" ja "Aika ×" ovat suhteessa Opus 5.5:een, jos lähde antaa niitä; muuten "–".

### Lähdetaulukko
| Lähde | Prosessi ja roolit | Malli roolia kohden | Tehtävä, benchmark | Vertailukohta | Laatuero | Hinta × | Aika × | Näyttö |
|---|---|---|---|---|---|---|---|---|
| [AI Agents That Matter, arXiv 2407.01502](https://arxiv.org/html/2407.01502), luettu | retry, warming, escalation -perusviivat vs. Reflexion/LDB/LATS | GPT-3.5 → GPT-4 eskalaatio | HumanEval, 5 ajoa/agentti | monimutkaiset agenttiarkkitehtuurit | perusviivat Pareto-parempia, ei merkitsevää eroa parhaaseen | LATS yli 50x, LDB/Reflexion yli 1,5x perusviivaan; eskalaatio alle 1/2 LDB:stä | – | R (julkaistu analyysi, rajattu HumanEvaliin) |
| [tau-bench, arXiv 2406.12045](https://arxiv.org/html/2406.12045), luettu | agentti + simuloitu käyttäjä + politiikka | gpt-4o | retail/airline, lopputilan vertailu | – | pass^1 ~61 %/~35 %; pass^8 retailissa ~25 % | – | – | R |
| [Anthropic: Adding Error Bars to Evals, arXiv 2411.00640](https://arxiv.org/html/2411.00640), luettu | tilastomenetelmä | – | evalien SE, klusterointi, pariero, tehoanalyysi | naiivi SE | klusteroitu SE jopa yli 3x naiivia suurempi | – | – | V (Anthropic; menetelmä, ei mallivertailu) |
| [Terminal-Bench, arXiv 2601.11868](https://arxiv.org/abs/2601.11868), yhteenveto | sandboxattu terminaali, testiskripti, ohjelmallinen ratkaisu | – | 89 tehtävää (TB2.0); viralliset ajot 5 toistoa/tehtävä (`-k 5`) | – | kärki alle 65 % (paperi) | – | – | R (survey 2606.20683: ajot havaintoja, eivät satunnaistettuja koejärjestelyjä) |
| [SWE-Bench Illusion, arXiv 2506.12286](https://arxiv.org/html/2506.12286), yhteenveto | muistamistesti | – | SWE-bench Verified | muut repot | tiedostopolun arvaus issuesta 76 % vs. 53 % ulkopuolisissa repoissa | – | – | R |
| [OTel GenAI semconv (GitHub, gen-ai-spans.md)](https://github.com/open-telemetry/semantic-conventions-genai), luettu | spanit: inference, `invoke_agent`, `execute_tool`, memory, retrieval | – | – | – | – | – | – | R (spesifikaatio, tila Development) |
| [Langfuse: token and cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking), luettu | ingested vs. inferred -kustannus, usage-tyypit (cached_tokens) | – | – | – | – | – | – | V |
| [Phoenix/Langfuse/Helicone -vertailut](https://www.morphllm.com/ai-agent-observability-tools), yhteenveto | – | – | – | – | – | – | – | A (myyjien blogeja) |
| [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), luettu | Opus 5.5: 4 / 20 $/M; 5 min write 5, 1 h write 8, read 0,20 (0,05x); batch -50 % (2/10) | – | – | – | – | 1 | – | V (hinnasto) |
| [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing), luettu | V4-Pro-0813: osuma 0,022 / ohi 0,66 / ulos 1,98 (off-peak; peak 2x); V4.1-Flash: 0,003 / 0,15 / 0,6; Anthropic-rajapinta `/anthropic` | – | – | – | – | – | – | V |
| [Z.ai pricing](https://docs.z.ai/guides/overview/pricing), luettu | GLM-5.3 1,4 / väl. 0,26 / 4,4; Flash 0,15 / 0,03 / 0,50 | – | – | – | – | – | – | V |
| [Together pricing](https://www.together.ai/pricing), luettu | K3 3 / 0,30 / 15; V4-Pro-0813 1,32 / 0,13 / 3,96; GLM-5.3 1,4 / 0,26 / 4,4; GLM-5.3-Flash 0,15 / 0,03 / 0,5; V4.1-Flash 0,30 / 0,006 / 1,2 | – | – | – | – | – | – | V |
| [Fireworks: prompt caching](https://docs.fireworks.ai/guides/prompt-caching.md), luettu | oletus 50 % alennus, vaihtelee mallin mukaan; TTFT jopa -80 %; osuma vain samalla replikalla, `user`/`x-session-affinity` -vihje | – | – | – | – | – | – | V |
| [Moonshot pricing](https://platform.moonshot.ai/docs/pricing/chat), luettu (taulukko ei latautunut) | K3: automaattinen prefiksivälimuisti, TTL 5 min (oletus) / 1 h; osuma laskutetaan vain osumahintaan; K3-hinnat 3 / 0,30 / 15 vahvistuvat Togetherista | – | – | – | – | – | – | V |
| [AA: Opus 5.5](https://artificialanalysis.ai/models/claude-opus-5-5), [GLM-5.3](https://artificialanalysis.ai/models/glm-5-3), [MiMo-V2.6-Pro](https://artificialanalysis.ai/models/mimo-v2-6-pro), [Kimi K3](https://artificialanalysis.ai/models/kimi-k3), [GLM-5.3-Flash](https://artificialanalysis.ai/models/glm-5-3-flash), [DS V4.1 Flash](https://artificialanalysis.ai/models/deepseek-v4-1-flash), luettu | – | – | AA-indeksi v4.3.2: pisteet, tulostetokenit indeksissä, $/tehtävä, tok/s | Opus 5.5 max | kts. alla | kts. alla | kts. alla | R |
| [AgentFloor, arXiv 2605.00334](https://arxiv.org/html/2605.00334), luettu | reititys: kuka tarvitaan mihinkin työkaluportaaseen | 16 avointa mallia 0,27–32B (Ollama) vs. GPT-5 | 30 tehtävää, 6 porrasta, 16 542 ajoa, bootstrap + TOST ±10 pp | GPT-5 | gemma4:26b = GPT-5 (Δ +0,4 pp, 90 % CI -4,0…+5,1); E-portaassa GPT-5 parempi (10 % vs. 0 %) | ~15x halvempi per läpäisty tehtävä (Mac), ~3x (H100 spot) | – | R (mutta synteettiset työkalut, ei koodausta) |
| [Switchcraft, arXiv 2605.07112](https://arxiv.org/html/2605.07112), luettu (tiivistelmä ja johdanto) | DistilBERT-luokitin valitsee halvimman oikean mallin | useita | 5 function calling -benchmarkkia | paras yksittäinen malli | tarkkuus 82,9 % (= paras) | -84 % | – | R/V (kirjoittajien oma) |
| [Arch-Router, arXiv 2506.16655](https://arxiv.org/abs/2506.16655), luettu (tiivistelmä) | 1,5B reititin toimialue/toiminto-mieltymyksillä | – | keskusteludatat | omistetut mallit | "SOTA" mieltymysosuvuudessa | – | – | V |
| Oma mittaus Macilla (M2 Pro 16 Gt, Ollama qwen3.5:9b Q4, 6,6 Gt), 19.10. | kevyt luokitin EASY/HARD | qwen3.5:9b | 8 käsin tehtyä pyyntöä | – | 8/8 (liian pieni näyte) | 0 $ | lämmin kutsu ~0,5–0,85 s, kylmä lataus 7,6 s, dekoodaus ~21 tok/s | A (oma, pieni) |
| [Requesty, MS Research Copilot-jäljet](https://requesty.ai/data/coding-agent-cache-hit-rate-apr-2026), yhteenveto | välimuistiosuus: Claude Code 92 %, OpenCode 89 %; mallin vaihto pudottaa osuuden ~8 %:iin, yli 10 min tauko 0–5 % | – | 13,5 M sessiota (MS) | – | – | – | – | R (MS) / V (Requesty myy reititystä), toissijaiset |
| [ODAR, arXiv 2602.23681](https://arxiv.org/pdf/2602.23681) ja NeurIPS-posteri 155478, yhteenveto | 5 hidasta agenttikutsua rinnakkain 32,0 s → 12,4 s (2,6x); toisaalla rinnakkaiset moniagentit usein hitaampia kuin yksi | – | – | yksi agentti | – | – | 0,39x / usein >1x | R, vain hakuyhteenveto |
| Paikalliset nopeudet: [M4 Qwen3-4B](https://omlx.ai/benchmarks/xc99x999) (37 tok/s, 385 tok/s prefill), Pi 5 -blogit (gemma3:1b 11,5 tok/s), Gemma 4 26B-A4B Mac -blogit (8–113 tok/s, ristiriitaisia), yhteenveto | – | – | – | – | – | – | – | A |

AA-lukujen erittely (AA v4.3.2, luettu): | malli | pisteet | tulostetokenit indeksissä | $/tehtävä | tok/s |
Opus 5.5 max 58 / 260 M / 5,98 / 98 · GLM-5.3 Max 45 / 210 M / 2,01 / 95 · Kimi K3 Max 44 / 160 M / 2,00 / 42 · MiMo-V2.6-Pro 46 / 140 M / 0,13 / 51 · GLM-5.3-Flash 42 / 180 M / 0,28 / 78 · DS V4.1 Flash 39 / 250 M / 0,49 / 231. (AA:n mediaani tuloste 140 M ja 85 M eri sivuilla: verrataan vain taulukon sisällä.)

### Löydökset

#### Päätös 6: Budjetti, kaskadi, varhainen lopetus
1. **Kustannus on vain kolme lukua: tulostetokenit, välimuistiosuus, malli.** Opus 5.5:ssä tulosteen osuus esimerkkitehtävästä on 68 %; AA:n mukaan Opus max tuottaa 260 M tokenia vs. MiMo 140 M ja K3 160 M (R). Tokenihinta ei yksin ratkaise: Switchcraft toteaa, että nimellisesti halvempi malli voi tulla kalliimmaksi päättelytokenien takia (R). Mittaa roolille `tulostetokenit/tehtävä`, älä vain $/M.
2. **Välimuisti sitoo roolin malliin.** Prefiksivälimuisti on tarjoaja- ja mallikohtainen (Fireworks: vain samalla replikalla, tarvitaan session-vihje) ja TTL lyhyt (Anthropic 5 min / 1 h, Moonshot 5 min oletus). Copilot-jäljissä mallin vaihto pudotti osuuden ~8 %:iin ja yli 10 min tauko 0–5 %:iin (R, toissijainen). Seuraus: älä vaihda mallia kesken roolin ajon; kaskadi tehdään tehtävän rajalla, ei askelten välillä. Pidä jokaisen roolin järjestelmäkehote ja työkalumääritykset ensimmäisenä (staattinen prefiksi).
3. **Hinnat eivät ole vakio: tarjoajaero on 2–8x samalle mallille.** V4-Pro-0813: DeepSeek oma off-peak 0,66/1,98 vs. Together 1,32/3,96 (DeepSeekin peak = Togetherin hinta). Välimuistiosuuden hinta: DeepSeek 0,022, Together 0,13, ero 6x. ESITIEDOT-luvut V4-Prolle (0,435/0,87; 1,30/2,60) ovat vanhentuneet tai eri versio: käytä yllä olevia (V).
4. **Batch -50 % vain Anthropicilla varmistettu** (Opus 5.5 2/10 $/M; pinoutuu välimuistin kanssa). Togetherin/Fireworksin batch-alennus (50 %) vain aggregaattoreilta, ei varmistettu. Batch sopii pakkaukseen/ArkistoVaiheeseen, ei interaktiiviseen chattiin.
5. **Kaskadi: luokittelija riittää, sen ei tarvitse olla LLM.** Switchcraft (DistilBERT) sai -84 % kustannuksen ilman tarkkuuden laskua (R/V); AgentFloor: portaat A0/A/B (ohjeen seuranta, yksi työkalukutsu, kahden kutsun ketju) hoituvat alle 5B mallilla 70–80 %:n tavoitteella, kun taas ketjutus yli kahden askeleen, haarautuminen ja pitkä suunnittelu (C/D/E) eivät läpäise kynnystä millään ≤32B mallilla ilman tukitoimia (R). Varhainen lopetus: kovana raja-arvona `maksimi yritykset` ja `tulostetokenikatto` per rooli; Opus max ~119 k tulostetta/tehtävä (ESITIEDOT) on kalleimman tason raja, ei oletus.
6. **Rinnakkaisuus säästää aikaa vain itsenäisissä haaroissa.** Mitattu 2,6x (5 hidasta kutsua, 32 → 12,4 s; vain yhteenveto) mutta NeurIPS 2026 -posteri: rinnakkaiset moniagentit usein hitaampia kuin yksi agentti uudelleenhaun ja koordinoinnin takia. Rinnakkaista vain luku/haku/testiajot ja N itsenäistä yritystä (best-of-N), ei toteuttajia samaan tiedostoon.

#### Päätös 4: Tarkistus – mikä signaali toimii (arviointi)
7. **Testit tarkistajana ovat se kohta, jossa toistot kannattavat** (AI Agents That Matter: toistot nostavat tarkkuutta rajattomasti kun on kelvollinen tarkistin, siksi kustannus on pakko raportoida; R). Pass@k mittaa "löytyykö ratkaisu"; **pass^k mittaa "toimiiko joka kerta"** (tau-bench: pass^1 61 % → pass^8 ~25 %, R). Scopesin tuotantopolulle (ei tarkistinta ajon aikana) oikea mittari on pass^k, kehitykselle testitarkistimella pass@k.

#### Arviointi (suositeltu menetelmä Scopesille)
- **Oma tehtäväsarja.** Pohja: omat toteutuneet tehtävät (repon commitit, joissa testi tai tarkistin on olemassa) ja kolme luokkaa: koodaus, siirto/pakkaus, chat. Jokaiselle ohjelmallinen lopputilan tarkistus (tau-benchin tapa: vertaa lopputilaa, ei keskustelua; R). SWE-bench Verified ei kelpaa sellaisenaan avoimien mallien vertailuun: muistaminen on mitattu (76 % vs. 53 %, R), ja Terminal-Bench raportoi ajot havaintoina eikä koejärjestelynä.
- **Kontaminaatio ja ylisovitus.** Pidä piilotettu pidätysjoukko (AI Agents That Matter: pidätysjoukon tason pitää vastata agentin yleisyyttä; 17 benchmarkista monella ei ollut sopivaa; R). Käytännössä: tuore, vielä julkaisematon tehtäväsarja kuukausittain, kehitysjoukko ja kokeilujoukko erikseen, älä viritä kehotteita kokeilujoukolla.
- **Otoskoko.** 95 % luottamusväli yhdelle onnistumisosuudelle p=0,6: n=20 → ±21,5 pp, n=50 → ±13,6, n=100 → ±9,6, n=200 → ±6,8 (oma laskenta). AgentFloorin portaittain 45 paria antoi yli 24 pp leveät CI:t (R). Kahden mallin parivertailussa (sama tehtäväsarja, parillinen testi, Anthropic: pariero poistaa kovarianssin) 10 pp:n ero 80 % teholla ja 5 % riskillä vaatii noin 113 (ρ=0,7), 189 (ρ=0,5) tai 264 (ρ=0,3) tehtävää, ρ = mallien tehtäväkohtaisten tulosten korrelaatio (oma laskenta, oletus p(1-p)=0,24). **Tästä: alle ~100 tehtävän sarja ei erota 10 pp:n eroa.** Toistot (k) pienentävät vain ajokohtaista kohinaa, eivät tehtävien otantavirhettä: 30 tehtävää × 5 toistoa ≠ 150 tehtävää.
- **Raportoi aina:** n tehtävää, SE tai CI, klusteroitu SE jos tehtävät tulevat samoista repoista/moduuleista (klusterointi jopa 3x suurempi virhe, R), pass@1 ja pass^k, **ja** hinta $/läpäisty tehtävä sekä tulostetokenit ja kesto (AI Agents That Matter: tarkkuus ilman hintaa palkitsee turhaa monimutkaisuutta; yksinkertaiset perusviivat: retry, eskalaatio). Pareto-kuvaaja (tarkkuus vs. $) ja (tarkkuus vs. sekunnit).
- **Pakolliset perusviivat** ennen monirooliprosessia: (1) paras yksittäinen avoin malli + retry testillä, (2) eskalaatio halvasta vahvaan, (3) Opus 5.5 high yksin. Moniroolinen prosessi on perusteltu vain, jos se voittaa nämä Pareto-mielessä (kuuluu myös päätökseen 5).
- **Havaittavuus (mitä per rooli).** OTel GenAI -spanit: `invoke_agent` (agentti), inference-span (`gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.cache_read.input_tokens`, `gen_ai.response.finish_reasons`), `execute_tool` (`gen_ai.tool.name`, tool-kutsun argumentit ja tulos, virhetila Span status -ohjeen mukaan) ja `gen_ai.conversation.id` (R, spesifikaatio on Development-tilassa, nimet voivat muuttua; `gen_ai.provider.name` korvasi `gen_ai.system`:in v1.37). Rooli ja yritysnumero ovat omia attribuutteja (`scopes.rooli`, `scopes.yritys`). Tallenna roolia kohden: tokenit (syöte, välimuisti, tuloste, päättely), kesto (TTFT, kokonaisaika), yritysten määrä, työkaluvirheiden osuus, lopetussyy, $ (laskettu hinnastosta: Langfusen tapa "ingested ensin, muuten inferred"; päättelymalleilla tokenien arviointi tokenisaattorilla ei toimi, ota luvut vastauksesta). Työkalu: Langfuse (MIT, self-host) ja Phoenix lukevat OpenInference/OTel-jälkiä; Helicone on proxy-lokitus (kaikki A, vertailut vain myyjien blogeja). Tässä repossa kevyin ratkaisu on `nebius-valitys.mjs`:n JSONL-loki samoilla kentillä ja Langfuse myöhemmin.

#### Kustannusesimerkki
Tehtävä: 200 k syöte, josta 80 % (160 k) välimuistista ja 40 k uutta, 20 k tuloste, yksi kutsu-ketjun summa (tokenihinnat luettu hinnastoista 19.10.; tuloste oletettu yhtä pitkäksi kaikilla).

| Malli (tarjoaja) | $/M syöte / välim. / tuloste | $/tehtävä | Hinta ÷ Opus | Tuloste 20 k kestää (AA tok/s) |
|---|---|---|---|---|
| Opus 5.5 (Anthropic) | 4 / 0,20 / 20 | **0,592** (kirjoitus 5 $/M uusille 40 k: 0,632; batch 0,296; ilman välimuistia 1,20) | 1,0 | 204 s (98) |
| Kimi K3 (Moonshot/Together) | 3 / 0,30 / 15 | 0,468 | 1,3x halvempi | 476 s (42) |
| GLM-5.3 (Z.ai/Together) | 1,40 / 0,26 / 4,40 | 0,186 | 3,2x | 211 s (95) |
| DeepSeek V4-Pro-0813 (Together) | 1,32 / 0,13 / 3,96 | 0,153 | 3,9x | AA 79–89 (ESITIEDOT) → ~240 s |
| DeepSeek V4-Pro-0813 (DeepSeek, off-peak / peak) | 0,66 / 0,022 / 1,98 | 0,070 / 0,139 | 8,5x / 4,3x | sama |
| MiMo-V2.6-Pro (Xiaomi) | 0,43 / ei tiedossa / 0,87 | ≤0,103 (ilman välimuistia) | ≥5,7x | 392 s (51) |
| GLM-5.3-Flash (Z.ai/Together) | 0,15 / 0,03 / 0,50 | 0,021 | 28x | 256 s (78) |
| DeepSeek V4.1-Flash (DeepSeek off-peak / Together) | 0,15 / 0,003 / 0,6 · 0,30 / 0,006 / 1,2 | 0,019 / 0,037 | 32x / 16x | 87 s (231) |

Luenta: (a) Opuksella tulosteen osuus on 0,40 / 0,592; avoimilla keskihintaisilla (GLM-5.3, V4-Pro) tulosteen osuus on 0,09/0,186 ja 0,079/0,153, joten niiden hinta riippuu enemmän välimuistiosumasta. Kimi K3 on kallis tulosteessa (15 $/M): säästö vain 1,3x. (b) AA:n koko indeksiajossa $/tehtävä: Opus 5,98 vs. GLM-5.3 2,01 (3,0x), K3 2,00 (3,0x), V4.1-Flash 0,49 (12x), GLM-Flash 0,28 (21x), MiMo 0,13 (46x) (R); laskelmani suhteet täsmäävät luokaltaan GLM-5.3:lla (3,2x vs. 3,0x). (c) **Tokenien määrä ei ole sama:** AA:n mukaan K3 ja MiMo tuottavat 0,6x ja 0,54x Opuksen tulostetokeneista, DeepSeek Flash 0,96x. Heikompi malli tarvitsee agenttisessa ketjussa usein enemmän kierroksia (A, ei mitattu); käytä oman tehtäväsarjan $/läpäisty tehtävä, ei listahintaa. (d) Laatu: AA 58 vs. 46/45/44/42/39: avoimet ovat 12–19 pistettä jäljessä (R); 3–30x halvempi ei ole laatuvertailu. (e) Yhdistelmä "Opus suunnittelee, V4-Pro toteuttaa": suunnittelu 20 k syöte + 3 k tuloste Opuksella 0,14 $ + toteutus 0,153 $ = **0,29 $ (~49 % Opuksesta)**, mikä sopii ESITIEDOT:n 40–75 % säästöön; huom. mallin vaihto katkaisee välimuistin, joten toteuttajan prefiksi on lämmitettävä erikseen (kirjoituskulu). (f) Kaskadi: Flash ensin (0,02 $), V4-Pro/GLM-5.3 jos testi ei mene läpi: jos puolet menee läpi, odotettu hinta 0,02 + 0,5 × 0,17 ≈ 0,105 $ (0,18x Opuksesta), ajallisesti +1 kierros. (g) Aika: tulosteen kesto on 87–476 s; vain DeepSeek Flash on nopeampi kuin Opus. Rinnakkaistamalla itsenäiset haarat kokonaisaika lyhenee enintään kertoimella ~2,6 (mitattu, yhteenveto). Cerebras/Groq-nopeus (ESITIEDOT: 250–1 850 tok/s) koskee vain pieniä malleja.

#### Paikalliset pienet mallit (reititin ja tarkistaja)
8. **Resurssit.** Palvelin (palvelin): Snapdragon 855 (SM8150), 8 ydintä, 7,4 Gt RAM, vapaana ~2,6 Gt: realistisesti vain ≤1,5B Q4-malli ja hidas (Pi 5 -luokka: 1B ~11 tok/s, 3B ~5 tok/s, A). Mac (M2 Pro 16 Gt): Ollama ja qwen3.5:9b asennettuna.
9. **Mitattu (A, oma).** qwen3.5:9b Q4 (6,6 Gt), Ollama, M2 Pro: 8/8 oikein EASY/HARD-luokittelussa, kutsu 0,5–0,85 s lämpimänä, kylmäkäynnistys 7,6 s, dekoodaus ~21 tok/s. Eli luokitteluun riittää, mutta 9B on liian iso "nopeaan" reitittimeen; 3 tokenin vastaukseen kuluu pääosin kiinteä viive. Jos reititystä tarvitaan joka kutsulla, malli pidetään muistissa (`keep_alive`).
10. **Mallivalinta.** Näyttö reitittämisestä pienillä malleilla: AgentFloor (R): gemma4:26b (MoE, ~4B aktiivista) ≈ GPT-5 aggregaatissa, alle 5B hoitaa A0/A/B-portaat; Switchcraft (R/V): DistilBERT-luokitin riittää työkalureititykseen; Arch-Router 1.5B (V) mieltymysreititykseen. Qwen3.5-4B/9B ja MiniCPM5-2B mainittu agenttipienmalleina (A, blogit). Sen sijaan "riittävä reitittimeksi lokakuussa 2026" ei ole yhdellekään ≤30B mallille mitattu Scopesin omalla jaolla (koodaus/siirto/chat): se pitää ajaa itse (0 $:n paikallinen koe, pieni).
11. **Mac-nopeudet.** Julkaistut luvut ristiriitaisia (Gemma 4 26B-A4B: 8–113 tok/s eri Maceilla, yhtään varmennettua M2 Pro -lukua ei löytynyt; Qwen3-4B M4:llä 37 tok/s, A). M2 Pro:n kaistan (200 Gt/s) ja Q4 4B (2,5 Gt) teoreettinen yläraja ~80 tok/s on oma arvio (A). Paikallinen tarkistaja (esim. koodin diff-luokittelu) on ok viiveeltään (<1 s), mutta se ei ole tuomari: kaikki yli kahden askeleen päättely kuuluu isolle mallille (AgentFloor C/D/E).

### Avoimet ja ristiriitaiset
- Nebiuksen välimuistihinnat ja onko välimuisti käytössä: ei virallista lähdettä (ideas.nebius.com: ominaisuuspyyntö "In Review"; typingmind: DeepSeek-V3 read 0,075). Koko suunnitelman 80 %:n välimuistioletus Nebiuksella on varmistamatta. DeepInfra ja Together batch-/välimuistihinnat Nebiuksen kilpailijoina: Together varmistettu, DeepInfra ei.
- MiMo-V2.6-Pron välimuistihinta ei löytynyt; Moonshotin K3-taulukko ei latautunut sivulta (hinnat vain Togetherista ja toissijaisista).
- Opus 5.5 -ohjeiden hinnat (4/20, read 0,20) täsmäävät ESITIEDOT:iin. Mutta Opus max -taso AA:ssa pysyy 260 M tokenia/indeksi ("very verbose"); "Opus high" -kustannusta/tehtävä ei haettu uudelleen (ESITIEDOT: $1,82).
- AA:n nopeudet vaihtelevat sivuittain ja tarjoajittain: GLM-5.3 95 tok/s (AA nyt) vs. 59–66 (ESITIEDOT); K3 42 vs. 26–66; vertaile vain samaa mittauspäivää.
- Mallin vaihdon vaikutus välimuistiin (8 %) ja rinnakkaisuuden mittaukset ovat toissijaisia (hakuyhteenveto); alkuperäiset (MS Research PDF, ODAR) lukematta.
- Ei löytynyt: Opus 5.5 -tason vertailu, jossa tarkistinrooli oli pieni paikallinen malli; yhtään riippumatonta mittausta reitittimen ja tarkistajan tarkkuudesta koodaustehtävillä ≤30B malleilla; Terminal-Bench:n varianssi/luottamusväli-ohje (vain 5 toistoa/tehtävä); Phoenix/Helicone-dokumentaatiot suoraan; Qwen3.8-pienmallit (hakutulos ei tuntenut).
- Oma 8 pyynnön mittaus on anekdootti; alle 100 tehtävän sarja ei tilastollisesti erota 10 pp:n eroa (laskelmat yllä oletuksilla ρ ja p).

## 18. Syvähaku G: turvallisuus, ylläpito ja kestävyys

## Osa G: turvallisuus, ylläpito ja kestävyys (haettu 19.10.2026)

Näyttö: R = riippumaton mittaus, V = valmistajan/tekijän oma luku, A = anekdootti. "luettu" = alkuperäinen sivu luettu, "yht." = vain hakuyhteenveto. Lataukset: `lataukset/g/` (txt-versiot `txt/`). Ei maksullisia kutsuja; OpenRouterin julkisia rajapintoja (ei avainta) luettiin Macin kautta.

### Lähdetaulukko

| Lähde (pvm) | Prosessi ja roolit | Malli roolia kohden | Tehtävä / benchmark | Vertailukohta | Laatuero | Hinta × | Aika × | Näyttö |
|---|---|---|---|---|---|---|---|---|
| Dziemian ym., arXiv 2603.15714 (maalis 2026) [luettu] | Julkinen punatiimikilpailu, 464 osallistujaa, 41 skenaariota (työkalu, koodaus, tietokone) | 13 mallia, ajattelu pois (paitsi Kimi K2, Gemini 2.5 Pro, Haiku 4.5) | Epäsuora kehoteinjektio, hyökkäyksen onnistumis-% (ASR) | Claude Opus 4.5 0,5 %; Sonnet 4.5 1,0 %; Haiku 4.5 1,3 %; GPT-5 2,0 %; Grok 4 2,9 %; Qwen3 VL 235B 4,2 %; Kimi K2 Thinking 4,8 %; DeepSeek V3.1 5,4 %; Gemini 2.5 Pro 8,5 % | Avoimet 4,2–5,4 % vs Opus 4.5 0,5 % (8–11-kertainen ASR) | – | – | R (vanhat mallit, epätasainen hyökkäysmäärä) |
| Claude Opus 5 system card §5.2 (heinä 2026) [luettu, PDF] | Gray Swan IPI -vertailu, 28 skenaariota, 1130 siirrettävää hyökkäystä; Shade-sopeutuva hyökkääjä | Opus 5, Sonnet 5, Mythos 5, Opus 4.8; ei-Claude: Muse Spark, GPT 5.5/5.6, Gemini 3.1 | P(hyökkäys onnistuu k=15:ssä); koodaus: 200 yritystä/skenaario | Opus 5 2,0 %; paras ei-Claude 16,5 %; GPT 5.6 Sol 20,0 %. Opus 4.8 → 5: 5,5 → 2,0 %. Mukana ei yhtään avointa mallia | – | – | – | V (Anthropic ajoi omat mallinsa ilman suojia, muut julkisilla päätepisteillä) |
| Assessing Automated Prompt Injection, arXiv 2606.10525 (kesä 2026) [luettu] | AgentDojo, TAP (musta laatikko) ja GCG | Qwen3-4B, Gemma3-4B, GPT-5; siirto: Qwen3-32B/235B, GPT-5, Sonnet 4.5, Gemini 2.5 Flash | ASR, deterministinen tarkistus | Qwen3-4B 44,6–45,2 % (TAP); GPT-5 ~4,5 %; GCG-siirto Qwenistä GPT-5/Sonnet 4.5:een <2 %; Qwen-perheen sisällä 22–36 % | Pieni avoin malli ~10× alttiimpi; ei suurta avointa mallia | – | – | R (vain pienet avoimet mallit) |
| NIST CAISI: DeepSeek-arviointi (syys 2025) ja Kimi K2 Thinking (jou 2025) [luettu, NIST-sivut] | Agentin kaappaus simuloidussa ympäristössä | DeepSeek R1, R1-0528, V3.1 vs 4 US-mallia (mm. GPT-5, Opus 4) | Agent hijacking; Kimi: kyberturva- ja SWE-kyvyt | DeepSeek R1-0528 keskim. 12× todennäköisemmin noudattaa haitallista ohjetta; Kimi K2 Thinking SWE-bench Verified 56,2 vs Opus 4 66,7 | 12× kaappausalttius | – | – | R (valtion laitos; vanhat mallit; Kimin kaappausluku ei sivulla) |
| Lee & Tiwari, Prompt Infection, arXiv 2410.07283 (2024) [luettu] | Moniagentti (lukija, strategi, tiivistäjä, toimittaja, kirjoittaja); itseään kopioiva injektio | GPT-4o, GPT-3.5 | ASR globaalissa/paikallisessa viestinnässä | Itsekopioiva +13,9 % (GPT-4o) vs ei-kopioiva; paikallinen viestintä ~20 % pienempi ASR; GPT-4o ohitti 66 % hyökkäyksistä mutta oli tehokkaampi saastuttuaan | LLM Tagging yksin −5 %; Marking+Tagging esti kaikki, mutta Marking yksin ohitettiin (76 % läpi) | – | – | R/V (tekijät; ei Claudea, ei avoimia) |
| Multi-Agent Systems Execute Arbitrary Malicious Code, arXiv 2503.12188 [luettu, abstrakti] | Orkestraattori + aliagentit (AutoGen, CrewAI, MetaGPT) | GPT-4o | Verkkosisällön kautta koodin ajo | 58–90 % kokeista, osassa 100 %; toimii vaikka yksittäinen agentti kieltäytyisi | – | – | – | R (2025) |
| Nasr ym., The Attacker Moves Second, arXiv 2510.09023 [luettu, abstrakti] | Sopeutuvat hyökkääjät (RL, haku, ihminen) | 12 julkaistua puolustusta | Jailbreak- ja injektiopuolustusten kesto | ASR >90 % useimmille; alkuperäinen raportti usein ~0 % | Staattiset testit yliarvioivat puolustusta | – | – | R |
| CaMeL (Defeating Prompt Injections by Design), arXiv 2503.18813 [luettu, abstrakti] | Oikeuksiin perustuva suojakerros: valtuutettu LLM kirjoittaa ohjelman, eristetty LLM jäsentää datan | Mikä tahansa malli | AgentDojo | 77 % tehtävistä todistetusti turvallisesti vs 84 % suojaamatta | −7 pistettä | – | – | V (Google/ETH) |
| Anthropic: sandboxing (20.10.2025) [luettu] | Tiedosto- ja verkkoeristys (bubblewrap/seatbelt) + välityspalvelin; git-tunnukset eivät ole hiekkalaatikossa | Claude Code | Käyttäjälupa-pyynnöt | Lupakehotteet −84 % | – | – | – | V |
| Meta Rule of Two, Willison, Gray Swan-blogi, gVisor/Firecracker-vertailut (tembo, softwareseni ym.) [yht.] | Agentilla enintään 2 kolmesta: epäluotettava syöte, arkaluonteinen data, ulospäin vaikuttaminen; kerneltason eristys | – | – | Kontit jakavat ytimen (runc CVE-2024-21626) | – | – | – | A / ei mitattu |
| Sleeper Cell, arXiv 2603.03371; Sleeper Agents, arXiv 2401.05566; CSA-muistio (31.3.2026) [luettu] | Takaovi LoRA+GRPO:lla; pickle/GGUF-malli/CVE-lista | Avoimet painot, tool-käyttö | Laukaisinpohjainen takaovi (esim. vuosi 2026) | Takaovet säilyvät turvakoulutuksessa; hyvänlaatuiset tulokset pysyvät huippua | Ei tunnistettavissa vertailutuloksista | – | – | R/V (todistekonsepti; ei kenttähavaintoa isännöidyistä malleista) |
| Anthropic postmortem (17.9.2025) [luettu] | Kolme infravirhettä: väärä reititys (0,8 % → 16 % huipussa Sonnet 4:stä), TPU-tulostevirhe, XLA-kääntäjävirhe | Sonnet 4, Opus 4/4.1, Haiku 3.5 | Hiljainen laadun heikkeneminen ensimmäisen osapuolen API:ssa | Omat arviot eivät huomanneet; ~30 % Claude Code -käyttäjistä sai ≥1 väärin reititetyn viestin | – | – | Havaintoon ~3–4 vk | V (myöntää itse) |
| Claude-API:n mallinvanhentamissivu (19.10.2026) [luettu] | Elinkaari Active/Legacy/Deprecated/Retired; ≥60 pv varoitus; „ei aikaisemmin kuin" -päivät | Claude 3 … 5.5 | – | Opus 4 ja Sonnet 4 poistuivat 15.6.2026 (≈13 kk julkaisusta); Sonnet 4.5 poistuu 30.11.2026 | – | – | – | V |
| OpenRouterin julkiset rajapinnat /models ja /endpoints (19.10.2026) [luettu, JSON] | 470 mallia, julkaisuaika `created`; tarjoajakohtainen uptime ja kvantisointi | – | Julkaisutahti 19.10.2025–19.10.2026 (omat laskelmat) | Ks. §Ylläpito | – | – | – | R (laskenta minun) |
| Pinggy-tiivistys Moustafan kirjoituksesta (syys 2026; 18 M viestiä) [luettu] | OpenRouter tuotannossa; tarjoajan valinta | DeepSeek V4 Flash 0731 ym. | TAU-Bench, GPQA tarjoajittain | 1. osapuoli 90 % GPQA / 81 % TAU; 3. osapuoli 75 % / 58 %; yksi tarjoaja 92 % tyhjistä vastauksista; OpenRouterin katkot 17. ja 19.2.2026 (20 → 80–90 % epäonnistui) | Työkalukutsuissa >20 pisteen ero samalla painolla | – | – | A (yhden kehittäjän data; OpenRouterin oma raportti toissijaisesti) |
| Moonshot K2-Vendor-Verifier (15.11.2025) [luettu] | Työkalukutsun skeemavirheet tarjoajittain | Kimi K2 Thinking / 0905 | schema_accuracy | Moonshot 100 %; Fireworks 100 %; SiliconFlow 98,96 %; GMICloud 95,95 %; vLLM 87,22 %; Together 84,63 %; Chutes 83,05 % | Jopa 17 pisteen ero | – | – | V (mallin tekijä, mutta julkiset luvut) |
| Anthropic API errors -sivu; AWS Builders' Library (uudelleenyritys) [luettu] | 429/500/529; SDK yrittää 2× uudelleen; 5 kerroksen pinossa 3 yritystä/kerros = 243× kuorma | – | – | – | – | – | – | V |
| Chen ym. 2307.09009; arXiv 2311.11123 (regressiotestaus); Cai ym. 2504.04715 [luettu, abstraktit] | Versioiden ajelehtiminen; hiljaiset päivitykset; mallin vaihto API:ssa | GPT-3.5/4 | Pääteltävät testit | GPT-4 alkuluvut 84 → 51 % kolmessa kuukaudessa; ohjelmistotestit eivät luotettavasti paljasta vaihtoa, TEE kyllä | – | – | – | R |

### 1. Turvallisuus

**Havainnot (mittaus)**
1. Avoimet mallit ovat alttiimpia, mutta ero on mitattu vain vanhoilla malleilla. Dziemian ym. (R): Opus 4.5 0,5 %, Sonnet 4.5 1,0 %, Kimi K2 Thinking 4,8 %, DeepSeek V3.1 5,4 %, Qwen3 VL 235B 4,2 % per hyökkäysyritys (13 mallia, ajattelu pois). CAISI (R): DeepSeek R1-0528 12× kaappausalttiimpi kuin US-mallit. Opus 5:n kortti (V): 2,0 % k=15 vs paras ei-Claude 16,5 %; siinä ei ole yhtään avointa mallia. Yhtään riippumatonta mittausta DeepSeek V4/Kimi K3/GLM-5.x-malleista kehoteinjektiolle ei löytynyt (haettu erikseen).
2. Hyökkäystä ei voi lakkauttaa mallivalinnalla. Claudekin murtuu (Opus 4.5: 13/37 käyttäytymistä murrettu, DeepSeek V3.1 ja Gemini 2.5 Pro 37/37). Sopeutuva hyökkääjä ohittaa julkaistut puolustukset >90 %:ssa (R). Siksi suunnittelu oletetaan: toteuttaja voi kaapautua.
3. Agentilta agentille leviäminen on todellinen. Itsekopioiva injektio leviää (Prompt Infection, R, GPT-4o); orkestraattorin kaappaus ajaa mielivaltaista koodia 58–90 %:ssa kokeista, vaikka yksittäinen agentti kieltäytyisi (R, GPT-4o). Vahvempi malli ei ole turvallisempi: GPT-4o torjui enemmän mutta teki enemmän vahinkoa saastuttuaan. Puolustusluvut: LLM Tagging yksin −5 %, Marking yksin ohitettiin, yhdistelmä esti (V, GPT-perhe). Claudella tai avoimilla malleilla moniagenttileviämistä ei ole mitattu (tekijät: „alustavat Claude-kokeet samanlaisia", V). Suunnittelijan tuottama suunnitelma, jonka toteuttaja lukee, on luotettu kanava vain jos suunnittelija ei ole lukenut epäluotettavaa dataa.
4. Rakenteellinen suoja toimii paremmin kuin kehote- tai mallisuoja. CaMeL (V): 77 % tehtävistä todistetusti turvallisesti (84 % ilman suojaa). Rule of Two (A/periaate): ei samassa kontekstissa yhtä aikaa epäluotettavaa syötettä + arkaluonteista dataa + ulospäin vaikuttamista; Willison huomauttaa, että syöte + tilan muutos on silti vaarallinen. Anthropic: tehokas hiekkalaatikko vaatii sekä tiedosto- että verkkoeristyksen; ilman verkkoeristystä SSH-avaimet vuotavat, ilman tiedostoeristystä pako on helppo (V).
5. Hiekkalaatikon vahvuus: kontit jakavat isäntäytimen (runc CVE-2024-21626) → hyökkääjäkoodille gVisor/Firecracker/Kata (A, vendor-blogit; käynnistysajat ristiriitaiset). Scopesin oloissa (OnePlus/Linux-palvelin, ei root) bubblewrap/seatbelt tai Clauden `/sandbox` on realistinen taso; mikrovirtuaalikone vain jos koodi tulee ulkopuolelta.
6. Takaovi ja paino: isännöidyssä käytössä (Nebius) pickle/GGUF/inferenssipalvelimen CVE:t eivät koske Scopesia; ne koskevat vain paikallista LM Studiota (GGUF-chat-malli on Jinja-koodia, CSA). Käyttäytymistakaovi (Sleeper Agents R/V; Sleeper Cell todistekonsepti) ei ole havaittavissa vertailuilla eikä turvakoulutus poista sitä; kenttähavaintoa isännöidyistä avoimista malleista ei löytynyt. Lievennys on rakenteellinen: pienet oikeudet, verkkorajaus ja tuotosten tarkistus, ei mallin „puhtauden" varassa.
7. Salaisuudet: Anthropic pitää git-tunnukset hiekkalaatikon ulkopuolella ja antaa sisään vain rajatun tunnuksen välityspalvelimen kautta (V). Scopesin nebius-valitys.mjs välittää avaimen ssh:n stdinissä (hyvä: ei argv:ssa paikallisesti), mutta etäkomento `read -r K; curl -H "Authorization: Bearer $K"` laajentaa avaimen curlin argumentteihin, jolloin se näkyy etäkoneella `ps`/`/proc`:ssa kutsun ajan (päätelty koodista nebius-valitys.mjs:171-175, ei testattu; korjaus: `curl -H @-` tai `--config -`).

**Suositellut vähimmäiskäytännöt**
- Oikeudet rooleittain: suunnittelija ja tarkistaja lukevat vain repoa, eivät aja komentoja eivätkä käytä verkkoa; toteuttaja kirjoittaa vain työpuuhun; vain tarkistin/testaaja ajaa koodia, hiekkalaatikossa ilman salaisuuksia.
- Älä anna kenenkään roolin lukea epäluotettavaa sisältöä (web, issue, riippuvuuksien README) ja pitää samalla avaimia tai push-oikeutta (Rule of Two). Ulkoinen sisältö luetaan erillisessä, työkaluttomassa roolissa, joka palauttaa jäsennellyn tiivistelmän.
- Roolien välinen viesti on dataa: pakota skeema (JSON-kentät, ei vapaata tekstiä käskynä), merkitse alkuperä (Tagging) ja älä anna toteuttajalle tarkistajan tai ulkoisen lähteen tekstiä käskyinä.
- Hiekkalaatikko: tiedosto- ja verkkoeristys molemmat; verkko sallittulistalla (Nebius, paketit); salaisuudet eivät koskaan promptissa tai kontin ympäristössä, vaan välityspalvelimessa (nykyinen nebius-valitys.mjs on oikea paikka).
- Käytä länsimaista isännöijää (Nebius) ja `zdr`-/data_collection-rajauksia; suora kiinalainen API vain ilman repoa ja avaimia.
- Mittaa itse: ajaa omaan testisarjaan injektioasetelma (esim. AgentDojo-tyylinen, 20–30 tehtävää) jokaiselle valitulle avoimelle mallille ennen kuin se saa kirjoitusoikeuksia; oleta ASR>1 % ellei toisin mitata.

### 2. Ylläpito

**Julkaisutahti (laskettu OpenRouterin `created`-kentistä, ei-:batch-tunnukset 19.10.2025–19.10.2026, R/oma laskenta)**
- Anthropic: 12 uutta tunnusta; Opus-linja 4.5 (24.11.) → 4.6 (4.2.) → 4.7 (16.4.) → 4.8 (27.5.) → 5 (24.7.) → 5.5 (22.9.): väli 41–72 pv, mediaani ~60 pv. Vanhentamissivu vahvistaa saman („ei aikaisemmin kuin" = julkaisu + 12 kk).
- DeepSeek: V3.2 (1.12.) → V4 (24.4.) → V4-flash-0731 → V4-pro-0813 → V4.1-flash (10.9.) → -1017 (17.10.): päiväysmerkityt tilannekuvat 2–5 vk välein. Kimi: K2.5 (27.1.) … K3 (16.7.); mediaanivälit uusien tunnusten välillä: Qwen 13 pv (22 tunnusta), GLM 23 pv (12), MiniMax 34 pv (6), Moonshot 67 pv (5).
- Päätelmä: avoin malli „vanhenee" kuukausissa, ei vuosissa; mallilista, jota ylläpidetään käsin (purkajat.mjs), on jo nyt jäljessä (esim. Nebiuksen lista 28 mallia 18.10.).

**Hiljaiset muutokset ja vanhentaminen**
- Hiljaiset API-päivitykset on dokumentoitu (R): GPT-4 alkuluvut 84 → 51 % maalis–kesäkuu 2023; päivitykset eivät muuta rajapinnan allekirjoitusta (arXiv 2311.11123). Ohjelmistopohjaiset tunnistuskeinot ovat epäluotettavia (Cai ym., R), ainoa todistettava on TEE.
- Ensimmäisenkin osapuolen API heikkeni ilman, että omat arviot huomasivat sitä: Anthropic elokuu–syyskuu 2025, 16 % Sonnet 4 -liikenteestä huipussa, ~30 % Claude Code -käyttäjistä sai ≥1 viallisen vastauksen (V, itse myönnetty). Oppi: ainoa riittävä signaali on jatkuva laatumittaus tuotantoliikenteestä.
- Claude-vanhentaminen: ≥60 pv ilmoitus, poisto ~13 kk julkaisusta (Opus 4/Sonnet 4: 14.4. ilmoitus → 15.6.2026). Avoimilla tarjoajilla ei löytynyt vastaavaa takuuta; Nebiuksen vanhentamiskäytäntöä ei saatu luettua (sivu ei latautunut sisältöä).
- Tarjoajakohtainen vaihtelu (A/V): sama paino, eri tarjoaja: DeepSeek V4 Flash 0731 TAU-Bench 81 % vs 58 % (A); Kimi K2 schema_accuracy 83–100 % (V). OpenRouterin `quantization`-kenttä on tarjoajan ilmoitus: Kimi K2.7 Code, 13 päätepistettä 19.10.: 6 × int4, 3 × fp8, 1 × fp4 (Nebius), 3 × tuntematon (R, JSON). Kvantisoinnin ilmoittaminen ei kerro laadusta (Pinggy/Moustafa A: fp4 ≈ fp8 joillain). OpenRouterin Auto Exacto (maaliskuu 2026, V) uudelleenarvioi tarjoajat ~5 min välein työkalukutsutelemetrialla.

**Suositellut vähimmäiskäytännöt**
- Kiinnitä päiväystunnus (esim. `DeepSeek-V4-Flash-0731`) ja tarjoaja; älä käytä „latest"-aliasta. Kirjaa jokaiseen ajoon malli, tarjoaja, kvantisointi ja `usage` (nebius-valitys.mjs:n loki riittää alkuun).
- Kultainen testisarja: 30–50 Scopes-tehtävää testitarkistimella ja 10 injektiotehtävää; ajaa jokaiselle mallille/tarjoajalle ennen käyttöönottoa ja viikoittain ajastettuna (ajelehtimisen ja hiljaisen vaihdon tunnistus). Älä luota yhteen ajoon: toista ≥3 kertaa (K2VV: oma toisto vaihteli 75,8–76 %).
- Varjoajo: uusi malli/versio ajaa samat tehtävät rinnalla ilman kirjoitusoikeutta; vertaa läpäisyyn, kustannukseen ja viiveeseen. Kanaria: 5–10 % liikenteestä uuteen versioon, automaattinen palautus kun läpäisy laskee >X pistettä.
- Päivittäinen `/v1/models`-vertailu allowlistiin (hälytys poistuneesta tai uudesta tunnuksesta); Claude Code -versio ja välityspalvelimen käännöskerros smoke-testataan päivityksen jälkeen.
- Pidä aina vähintään yksi Claude-varamalli (Sonnet/Haiku 5.5) allowlistissa; sen elinkaari on dokumentoitu ja ennustettava.

### 3. Kestävyys

**Havainnot**
1. Tarjoajan „epäonnistuminen" ei ole vain HTTP-virhe. Havaitut hiljaiset viat (A, Moustafa): HTTP 200 + `content: null` + puuttuva `usage`; yksi tarjoaja tuotti 92 % kuukauden tyhjistä vastauksista kun sen osuus liikenteestä oli ~20 %; työkalukutsu vuotaa tekstinä; `reasoning.effort` ohitetaan. HTTP-koodiin perustuva uudelleenyritys ei näe näitä.
2. Päätepisteet olivat 19.10. hetkellä terveitä: kaikilla DeepSeek V4.1 Flash -tarjoajilla (16 kpl) uptime 30 min = 100 %, 1 pv 94,2–100 % (heikoin Alibaba 94,2 %); Kimi K2.7 Code 13 tarjoajaa, 1 pv = 100 % (R, yksi hetki, ei pitkää aikasarjaa). Pitkän aikavälin virhe-%-tilastoja (OpenRouterin tai Nebiuksen) ei löytynyt: OpenRouterin status-sivu oli tyhjä, Nebiuksen sivu näyttää vain tilan („All Systems Operational") ilman Token Factoryn historiaa tekstinä.
3. OpenRouter on oma vikapiste: katkot 17. ja 19.2.2026, 20 % → 80–90 % pyynnöistä epäonnistui (A, OpenRouterin raportista toissijaisesti); ei SLA:ta. Oletuskäytös: poissulkee tarjoajat joilla on ollut katko viimeisen 30 s aikana, valitsee halvimman painotetusti, muut varalle (V, luettu). `allow_fallbacks=false` + lyhyt lista aiheutti täyden katkon, kun kolme tarjoajaa rajoitti peräkkäin (A).
4. Uudelleenyritys voi pahentaa: AWS: viiden kerroksen pinossa 3 yritystä/kerros → 243× kuorma; suositus: yritä vain jos riippuvuus näyttää terveeltä, käytä jitteriä, yritä yhdessä kerroksessa (V). Anthropicin SDK yrittää 2× oletuksena, kunnioittaa retry-afteria; 429 kuluraja ei parane uudelleenyrityksellä, ja virtauksen aikainen virhe voi tulla 200:n jälkeen (V, luettu).
5. Scopesin nykytila (ESITIEDOT §10): ei 429-käsittelyä, ei varamallia; kustannuskatto laskee pahimman arvion kutsua kohti. Jokainen uudelleenyritys ja varamalli kuluttaa katosta; katon täytyy kirjata yritykset, ei vain onnistuneet.

**Suositellut vähimmäiskäytännöt**
- Vastauksen validointi ennen hyväksyntää: `content` ei tyhjä, `usage` olemassa, työkalukutsun JSON jäsentyy skeemaa vasten, `finish_reason` järkevä; epäonnistuminen = uudelleenyritys eri tarjoajalla.
- Yksi uudelleenyrityskerros (reititin/valitys), ei SDK:ssa ja välityspalvelimessa kahta; 2–3 yritystä, eksponentiaalinen viive + jitteri, kunnioita `retry-after`; 429 ilman retry-afteria tai kulukatto = ei uudelleenyritystä, varamalli suoraan.
- Varaketju: ensisijainen avoin malli (tarjoaja A) → sama malli toinen tarjoaja (`allow_fallbacks` päällä, `require_parameters` päällä) → toinen avoin malli → Claude Sonnet 5.5. Siirtymän laukaisee kolme peräkkäistä virhettä tai aikakatkaisu; palaa takaisin vasta kun terveystarkistus onnistuu.
- Katkaisija (circuit breaker) tarjoajaa kohti: yli 20 % virheitä 5 min ikkunassa → pois 10 min; kirjaa tapahtuma. Aikakatkaisu tokenivirran tauolle (esim. 60–120 s ilman tokenia), koska hiljaiset jumit (Qwen3-mallit repossa) ovat todennäköisempiä kuin selvät virheet.
- Älä pinnaa tarjoajalistaa ilman varaa; pidä vähintään kaksi tarjoajaa ja yksi toinen malli per rooli.
- Mittaa omat virhe-%: kirjaa tarjoaja, status, tyhjä-vastaus, viive ja kustannus per kutsu; viikkoraportti on ainoa luotettava omaan käyttöön sopiva tilasto.

### Avoimet ja ristiriitaiset
- Ei löytynyt: riippumaton injektiomittaus uusille avoimille malleille (DeepSeek V4.x, Kimi K2.6/K3, GLM-5.x, Qwen3.8, MiniMax M3) eikä Opus 5.5:lle; Dziemianin lukujen vanhat mallit (Opus 4.5 vs K2 Thinking) ovat paras R-luku. Claude vs avoin moniagenttiinjektiolle ei ole mittausta.
- Ei löytynyt: OpenRouterin/Nebiuksen pitkän aikavälin uptime- ja virhe-%-tilastoja, Nebiuksen vanhentamiskäytäntö, mitattu vertailu kvantisointitasoista tarjoajittain (Moustafan luvut ovat yhden kehittäjän dataa, A).
- Ristiriita: gVisor/Firecracker-käynnistysajat ja ylikuorma vaihtelevat lähteittäin (vendor-blogeja, A); „vain Codex ottaa hiekkalaatikon oletuksena" ei vahvistettu. „Kymmenen esimerkkiä riittää takaoveen" (heinä 2026) ja HF-murtoyhteenveto (kesä 2026) on vahvistamaton; CSA mainitsee 250 myrkytettyä esimerkkiä (toissijainen). CaMeL-prosenttiluvut: hakuyhteenveto 67 %, abstrakti 77 %: käytin abstraktia.
- Opus 5:n kortin vertailu (V) mittaa Claudea ilman suojia mutta muita julkisilla päätepisteillä, joten ero on osin tuotekerroksen ero; 0 % „auto mode" -luku ei kuvaa mallia.
- Päätelmä Scopesille: injektioriski on avoimilla malleilla todennäköisesti Claudea suurempi (suuruusluokka 5–10× vanhoilla malleilla), mutta tarkkaa kerrointa nykyisille malleille ei ole; päätös on rakenteellinen eristys + oma mittaus, ei mallivalinta.

## 19. Scopesin oma kuorma (paikallinen data 25.9.–19.10.2026)

## Osa H: Scopesin oma kuorma (paikallinen data, haettu 19.10.2026)

### Scopesin oma kuorma
Aineisto: 3 401 Claude Code -lokitiedostoa (mtime <= 30 pv), joista 3 360 sisältää assistant-viestejä. Lokit alkavat vasta 25.9.2026, joten kattavuus on 25 kalenteripäivää (22 päivää, joilla oli ajoa; 8.-10.10. puuttuu). Luvut ovat tämän ikkunan, ei täyttä 30 päivää. Kuormaa kuvaa 96,5 % välimuistiluvusta: uusi (ei-välimuistiin luettu) syöte on vain noin 3,5 %.

#### 1. Tokenit mallikohtaisesti (25.9.-19.10., Claude-mallit)
| Malli | Viestit | Syöte | Välimuistiluku | Välimuistikirj. | Tuloste |
|---|---|---|---|---|---|
| opus-5-5 | 46 666 | 0,10 M | 6 106 M | 141,6 M | 34,2 M |
| sonnet-5-5 | 18 148 | 0,04 M | 1 756 M | 94,3 M | 3,8 M |
| fable-5-1 | 2 889 | 0,04 M | 457 M | 15,7 M | 3,9 M |
| sonnet-5 | 5 393 | 0,01 M | 451 M | 21,9 M | 0,5 M |
| haiku-5-5 | 2 941 | 0,01 M | 143 M | 23,1 M | 4,3 M |
| fable-5 | 894 | 0,002 M | 111 M | 3,0 M | 0,9 M |
| yhteensä (+ haiku-4-5) | 76 955 | 0,19 M | 9 025 M | 299,7 M | 47,6 M |
Ei-Claude-mallit (Nebius-testit lokeissa: Qwen, DeepSeek, GLM-5.3 Flash ym.): 24,3 M syötettä, 0,19 M tulostetta, 600 viestiä; jätetty hintalaskusta pois.
Päiväkeskiarvo (22 ajopäivää): 424 M syötetokenia (josta välimuistilukua 410 M), 2,17 M tulostetta, 3 500 viestiä. Päivän syöte+tuloste: mediaani 313 M, p90 810 M, huippu 6.10. 968 M. Pääistuntojen viestejä/päivä vaihtelee 244 (11.10.) .. 8 765 (6.10.).

#### 2. Istunnot ja aliagentit (koko ikkuna; "koko" = syöte+lukema+kirj.+tuloste)
| Ryhmä | Kpl | Kpl/pv | Koko mediaani | p90 | Tuloste mediaani | Viestit med/p90 | Tokenien osuus |
|---|---|---|---|---|---|---|---|
| Pääistunnot (kaikki) | 2 471 | 112 ka., 70 med. | 156 k | 9,0 M | 5,7 k | 4 / 68 | 75,4 % |
| Pääistunnot, >= 10 viestiä | 979 | 39 | 6,2 M | 12,7 M | 40 k | | |
| Aliagentit (subagents/) | 889 | 47 | 1,40 M | 4,8 M | 340 | 19 / 46 | 24,6 % |
| Aliagentit, >= 3 viestiä | 886 | | 1,41 M | 4,8 M | | | |
Aliagenttien osuus: 24,6 % kaikista tokeneista, 2,4 % tulosteesta (tuloste on pieni: ne lukevat ja ajavat, eivät kirjoita). Uuden syötteen (syöte+kirj.) osuus 33 %. Kappalemäärä/pv on arvio: sessio ajoitettu ensimmäisen viestin päivään; mukana ~1 000 lyhyttä (<=4 viestiä) apuajoa (mm. haiku 633 pääistuntoa).
Yksittäisen ajon kokoluokka ajajat.jsonl:ssä (pakkaus+purku, 21.9.-19.10., 1 306 ajoa, `tokenit` raportoitu): siirtaja-sonnet 354 ajoa med 106 k / 132 s; claude-cli sonnet-5-5 251 ajoa med 143 k / 43 s; claude-cli haiku-5-5 240 ajoa med 538 k / 64 s; agy gemini-3.8-flash-medium 450 ajoa med 75 k / 42 s.

#### 3. Karkea tehtävätyyppijako (ensimmäisen käyttäjäviestin ja projektikansion perusteella)
| Tyyppi | Kpl | Tokenit yht. | Osuus | Mediaani/ajo | Opus 5.5 -lista, $ | MiMo, $ | GLM Flash, $ |
|---|---|---|---|---|---|---|---|
| Siirto/pakkaus (/pura, /pakkaa, autopakkaus), pääistunto | 1 021 | 6,58 B | 70 % | 5,8 M | 2 910 | 2 828 | 994 |
| Aliagentit pääprojektissa (siirtäjä, Explore, toteuttaja) | 868 | 2,28 B | 24 % | 1,4 M | 982 | 982 | 343 |
| Koodaus/ylläpito (muu, >4 viestiä) | 121 | 0,32 B | 3,4 % | 624 k | 206 | 138 | 48 |
| r&d (/rd, briefit) | 167 | 0,16 B | 1,7 % | 125 k | 100 | 68 | 24 |
| Lyhyet apuajot (<=4 viestiä: otsikko, haku, hook) | 1 022 | 0,07 B | 0,7 % | 46 k | 134 | 31 | 11 |
| r&d2-aliagentit | 21 | 0,03 B | 0,3 % | 1,3 M | 17 | 11 | 4 |
| Scopes-äpin chat (-scopes-chat) | 123 | 0,005 B | 0,05 % | 37 k | 4 | 2 | 1 |
| Tutkimus/kartoitus (regex), siirto-worktree | 17 | 0,004 B | ~0 | | 5 | 1 | 1 |
Huom. "tmp/scratchpad"-projektit (361 istuntoa, 91 M tokenia) ja r&d2-projektin 122 istuntoa sisältyvät luokkiin muu/r&d/siirto luokittelun mukaan. Tutkimus on käytännössä aliedustettu (regex löysi 2); tutkimusajot kuuluvat pääosin luokkaan "muu".

#### 4. Hinta listahinnoin (Claude-mallien tokenit, 25.9.-19.10.)
Syöte yhteensä 9 325 M (välimuistiluku 9 025 M + kirjoitus 300 M + uusi 0,2 M), tuloste 47,6 M.
| Skenaario | Koko ikkuna | Per ajopäivä (22) | Per kalenteripäivä (25) |
|---|---|---|---|
| Opus 5.5 $4/$20, välimuistiluku $0,20, kirjoitus oletettu $5 (1,25 x) | 4 257 $ | 194 $ | 170 $ |
| Sama, kirjoitus $4 | 3 958 $ | 180 $ | 158 $ |
| MiMo-V2.6-Pro $0,43/$0,87, kaikki syöte täyteen hintaan | 4 051 $ | 184 $ | 162 $ |
| GLM-5.3 Flash $0,15/$0,50, kaikki syöte täyteen hintaan | 1 423 $ | 65 $ | 57 $ |
| Herkkyys: MiMo, vain uusi syöte (syöte+kirjoitus) + tuloste, välimuisti ilmaiseksi | 170 $ | 7,7 $ | 6,8 $ |
| Herkkyys: GLM Flash, sama | 69 $ | 3,1 $ | 2,8 $ |
Opus 5.5 -hinnan osat: välimuistiluku 1 805 $, kirjoitus 1 499 $, tuloste 953 $, uusi syöte 0,8 $. Päivän Opus-hinta: mediaani 160 $, max 433 $, min 11 $. Opus 5.5 -mallin omat tokenit maksaisivat 2 613 $, mutta muiden mallien (sonnet 900 $, haiku 229 $ ym.) rivit on laskettu Opus-hinnalla; todellinen mallimix on halvempi (Sonnet/Haiku/Fable hintoja ei annettu tehtävässä).
Johtopäätös: kuorma on välimuistilukua (96,5 %). Ilman välimuistialennusta halpa API-malli ei säästä juuri mitään MiMo-tasolla (-5 %); vain Flash-luokka (-67 %) säästää. Hyöty tulee vain, jos tarjoajan välimuisti toimii tai jos kontekstia lyhennetään (mediaani 6,2 M tokenia/pitkä sessio = ~50-100 viestiä x 100-180 k kontekstia).

#### 5. Scopes-palvelun omat lokit (~/.local/state/)
- scopes-pyynnot.loki(.1): HTTP-pyynnöt 16.-19.10. (4 pv, 50 092 riviä; ~12 500/pv): /api/skoopit 10 015, /api/agentit 5 198, /api/kayttoraja 2 509, /api/chat/keskustelut 2 465, /api/terveys 2 372. Äpin kuorma on pollausta, ei mallikutsuja.
- scopes-nebius.loki: 200 riviä, 18.-19.10., 190 mallikutsua deepseek-ai/DeepSeek-V4.1-Flash, 10,1 M syötettä, 0,12 M tulostetta (med ~38 k syötettä/kutsu); Scopes-äpin chatin Nebius-reitti, vasta käytössä.
- scopes-toiminnot.loki: 1 325 riviä toimintoja (pura/pakkaa-pyynnöt äpistä, mm. hylkäykset). Claude-rajan luku: kayttoraja.mjs lukee /api/oauth/usage tai vahdin ~/.claude/hooks/state/kayttoraja-vahti/kaytto.json (prosenttiluku + nollautumisaika, ei tokenimäärää).
- ~/.claude/projects/-home-user--local-state-scopes-chat: 142 tiedostoa, 123 istuntoa (13.-17.10., 83 yhtenä päivänä); chat on tokeneissa mitätön.
- claude/siirto/mittaukset/vaihevirheet.jsonl: 828 pakkausvaiheyritystä 30.9.-19.10. (538 hylätty, 281 korjattu, 9 epäonnistui): hylkäysaste 65 % per yritys, malli sonnet-5-5 417, gemini flash 387. Uudelleenyritykset kasvattavat siirtokuormaa.

### Laskentatapa
Skriptit: scratchpad/h/a.py (poiminta), b.py, c.py (yhteenvedot); ajo `python3 -I`. Polku: /tmp/claude-1000/-home-user-palvelin/36c5de4c-9b8c-4e81-8d47-f362c229cf7a/scratchpad/h/.
- Tiedostot: `os.walk ~/.claude/projects`, `*.jsonl`, mtime <= 30 pv; aliagentti = polussa `subagents`.
- Viestit: `type == "assistant"`, `message.usage` (input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens), `message.model`; duplikaatit pois avaimella (message.id, requestId); `<synthetic>` pois. Päivä = viestin `timestamp`.
- Tyyppiluokitus: projektikansio + ensimmäisen käyttäjäviestin regex (system-reminder-lohkot poistettu); ei sisältöä tallennettu.
- Hinta: (syöte x a + lukema x 0,2 + kirjoitus x 5 + tuloste x b) / 1e6; MiMo/GLM: (syöte+lukema+kirjoitus) x a + tuloste x b.

### Rajoitteet
- Lokit vain 25.9. alkaen (vanhempia ei ole); 8.-10.10. ei lokeja; syy vanhempien puuttumiseen tuntematon. Ei täyttä 30 pv.
- Kirjoitushinta ($5) on oletus; hintaa ei annettu. Kaikki Claude-mallit hinnoiteltu Opus 5.5 -hinnalla (yläraja); oikea mallimix on halvempi.
- Istuntomäärät/pv ovat ensimmäisen viestin päivän mukaan; samaa istuntoa jatkavat päivät lasketaan vain ensimmäiseen. Streaming-duplikaattien poisto voi aliarvioida hieman.
- Tehtävätyyppijako on regex-heuristiikka; "siirto/pakkaus" kattaa myös istunnot, jotka alkavat /pura- tai /pakkaa-komennolla ja jatkuvat muuhun työhön.
- Ei dataa: rinnakkaisuus/huippu-tunnit (ei laskettu), viive, onnistumisaste per tehtävä, API-laskutus (tilaus: Claude Code OAuth, ei $-laskua), Claude-rajan käytön historia (kaytto.json sisältää vain ~5 min historian), vanhat Scopes-lokit (pyynnot.loki 4 pv).


## 20. Vastakkainen tarkistus ja yhteenveto (19.10.2026)

### 20.1 Tarkistuksen tulos

Kaksi agenttia yritti kumota 12 väitettä alkuperäislähteistä (`scratchpad/syvahaku/v1-tarkistus.md`, `v2-tarkistus.md`). Nebiuksen hinnat tarkistin itse virallisesta rajapinnasta (`tokenfactory.nebius.com/api/public/models_info`, 28 mallia, haettu 19.10.2026).

| Väite | Tuomio | Tarkennus |
|---|---|---|
| Rinnakkaiset aliagentit häviävät SWE-benchissä (2610.10263) | osin tosi | Claude Code −24,0 pp, tokenit 1,41–3,31×; hyöty korreloi toteutuksen koon kanssa, ei "hajotettavuuden" |
| Yli ~45 %:n yksittäistuloksella lisäagentit tuottavat tappiota (2512.08296) | tosi varauksin | virheen vahvistuksen ero ei tilastollisesti merkitsevä |
| LLM-tarkistaja hyväksyi 49,4 % hylätyistä (TeamBench 2605.07073) | osin tosi | koskee pieniä tarkistajamalleja; 22,3 %, jos puuttuvat tuomiot lasketaan virheiksi |
| mini-swe-agent + MiniMax M2.5 75,8 % / $36,6 vs. Opus 4.5 76,8 % / $377 | tosi | yksi yritys, SWE-bench Verified (kontaminaatioriski) |
| Havaintojen maskaus 0,48× hinta (2508.21433) | osin tosi | vain Qwen3-Coder 480B:lla; +2,6 on suhteellinen % |
| Skeema + työkalut pudottaa avoimien mallien työkalukutsut 0 %:iin (2606.25605) | tosi | syy xgrammar-maski; koskee vLLM- ja SGLang-ajoa |
| **Nebius antaa välimuistialennuksen** | **epätosi** | yhdelläkään mallilla ei ole välimuistihintaa; ominaisuuspyyntö "In Review" |
| Mallin vaihto pudottaa välimuistiosuuden ~8 %:iin (2608.00101) | tosi | Copilotin palvelinpuolen KV-välimuisti |
| Akita: avoimet toteuttajat 87/46/71 → 97/93/94 Opus-suunnitelmalla | tosi | Kimi 97 = tasapeli Opuksen kanssa; yksi ajo per muunnos |
| Harness-evoluutio häviää rinnakkaisotannalle; automaattiset MAS:t häviävät CoT-SC:lle | osin tosi / tosi | ensimmäinen vain ilman yksikkötestejä |
| Avoimet mallit 4–10× alttiimpia kehoteinjektiolle | tosi | vanhat mallit (Kimi K2, DeepSeek V3.1); ei yleistettävissä K3:een tai GLM-5.x:ään |
| Cursor: Opus 4.8 + Composer 2.5 $1 339 vs. GPT-5.5 $10 565, "similar quality" | tosi | valmistajan oma, laadullinen; Composer ei ole avoin malli |

### 20.2 Korjaus: Nebiuksen hinnat ja nopeudet (virallinen rajapinta 19.10.2026)

| Malli | $/M syöte / tuloste | Nopeus (Nebiuksen ilmoittama, tok/s) | Alue |
|---|---|---|---|
| GLM-5.3 | 1,40 / 4,40 | 455 | us-north1 |
| GLM-5.3-Flash | 0,15 / 0,50 | 349 | us-north1 |
| DeepSeek-V4-Flash-0731 | 0,14 / 0,28 | 351 | us-central1 |
| DeepSeek V4.1 Flash | 0,30 / 1,20 | 139 | us-north1 |
| DeepSeek-V4-Pro / -0813 | 1,75 / 3,50 · 1,32 / 3,96 | 24 · 37 | uk-south1 |
| Kimi-K3 | 3,00 / 15,00 | 265 | eu-west2 |
| Kimi-K2.7-Code | 0,95 / 4,00 | 231 | us-central1 |
| MiniMax-M3 | 0,30 / 1,20 | 248 | us-central1 |
| Qwen3.8-27B | 0,45 / 3,00 | 218 | us-central1 |
| gpt-oss-120b | 0,15 / 0,60 | 40 | eu-north1 |

- MiMo-V2.6-Pro ei ole Nebiuksella. Välimuistihintaa ei ole millään mallilla.
- Nopeudet ovat Nebiuksen omia ilmoituksia (V). Jos ne pitävät, GLM-5.3, Kimi K3 ja Flash-mallit ovat 2–5× Opus 5.5:tä (~98 tok/s) nopeampia, mikä kumoaa luvun 3 oletuksen, että avoimet kärkimallit ovat hitaampia. Mitattava itse ennen päätöstä.

### 20.3 Kustannus Scopesin omalla kuormalla (luku 19: 424 M syötettä, 96,5 % välimuistista, 2,2 M tulostetta päivässä)

| Malli (Nebius, ei välimuistialennusta) | $/päivä | vs. Opus 5.5 listahinta (~194 $/pv välimuistihinnoin) |
|---|---|---|
| Kimi K3 | ~1 305 | 6,7× kalliimpi |
| GLM-5.3 | ~603 | 3,1× kalliimpi |
| DeepSeek V4.1 Flash | ~130 | 0,67× |
| GLM-5.3-Flash | ~65 | 0,33× |
| DeepSeek-V4-Flash-0731 | ~60 | 0,31× |

- **Välimuisti ratkaisee.** Ilman välimuistialennusta kärjen avoimet mallit ovat meidän kuormallamme Opusta kalliimpia. Vain Flash-luokka on halvempi, noin kolmasosa.
- Opus-luku on API-listahinta. Käyttäjä maksaa Claudesta tilauksen (luku 19), joten todellinen vertailu on tilauksen hinta ja käyttörajat vs. avoimen mallin API-lasku.
- Välimuistialennus on DeepSeekin ja Moonshotin omissa API:issa (luku 17), mutta niissä data kulkee Kiinaan (luku 10). Länsimaisten tarjoajien (Together, Fireworks, DeepInfra, Baseten) välimuistihinnat näille malleille on tarkistettava.

### 20.4 Mitä näyttö sanoo suunnittelupäätöksistä

1. **Roolit.** Kehys painaa enemmän kuin roolijako: sama Kimi K2 sai 44–71 % kehyksen mukaan, ja roolijako itsessään toi ~2,5 p (A). Lisäroolit tuottavat tappiota, kun yksittäinen agentti on jo hyvä (yli ~45 %, B). Ainoa johdonmukaisesti hyödyllinen lisärooli on arvostelija puhtaalla kontekstilla, mieluiten eri malliperheestä (C, D).
2. **Malli roolia kohden.** Toteuttajan ja tarkistajan malli merkitsee enemmän kuin suunnittelijan (D). Vahva suunnittelija nostaa heikkoa toteuttajaa eniten (Akita: GLM 46 → 93), mutta pelkkä vahva malli voitti tai tasasi yhtenäisessä koodauksessa (C).
3. **Välitys.** Suunnittelijan spesifikaatiosta vain ~21 % päätyy toteuttajalle (D). Havaintojen maskaus halventaa ilman laatutappiota (A, D). Mallia ei vaihdeta kesken tehtävän, koska välimuisti nollautuu (F).
4. **Tarkistus.** Ajetut testit ovat ainoa vankka signaali koodissa. Pelkkä LLM-tuomari on heikko portinvartija (D). Testit eivät todista, jos sama malli kirjoitti koodin ja testit (C). Regressiotestikarsinta +3–6 p, koulutettu critic +6–16 p (A).
5. **Milloin moniagentti häviää.** Rajatuissa koodaustehtävissä rinnakkaiset aliagentit häviävät (B). Rinnakkaiset kirjoittajat hajottavat työn (C). Äänestys ja väittely eivät voita parasta yksittäistä mallia (B, luku 9). Automaattisesti haetut MAS:t häviävät yksinkertaiselle otannalle (E).
6. **Budjetti.** Rinnakkaisotanta testitarkistimella voittaa harness-evoluution samalla budjetilla (E). Kova korjausyrityskatto ja varhainen tarkistus, koska epäonnistuneet ajot jatkuvat pitkään toivottomina (D). Uudelleenyritys vain yhdessä kerroksessa (G).

### 20.5 Prosessiluonnos (suunnittelun lähtökohta, ei päätös)

**Korjaus 19.10.2026 (käyttäjä):** yhdistelmä on vain avoimia malleja. Alla mainittu Opus vaikeiden tehtävien mallina ja Claude Sonnet varaketjussa eivät kuulu yhdistelmään; ne korvataan vahvimmalla ehdon täyttävällä avoimella mallilla. Lisäksi luvun 22 ehto rajaa tarjoajat EU-ZDR-tarjoajiin ja omaan ajoon.

1. **Reititin tehtävän rajalla:** pieni luokitin (ei välttämättä LLM) jakaa tehtävät helppoihin ja vaikeisiin. Malli pysyy samana koko tehtävän ajan.
2. **Toteuttaja:** yksi agentti Claude Coden kautta (nykyinen `nebius-valitys.mjs`-reitti), ei rinnakkaisia kirjoittajia. Helppo → Flash-luokan malli; vaikea → vahva malli (Opus tai vahva avoin malli, jos välimuistihinta sallii).
3. **Tarkistus:** ajetut testit ja valmiiksi kirjoitetut kriteerit; arvostelija puhtaalla kontekstilla eri malliperheestä kuin toteuttaja; LLM-tuomari ei ole ainoa portti.
4. **Vaikeat koodaustehtävät:** 2–4 rinnakkaista yritystä, jotka testit karsivat; korjausyrityskatto ja varhainen lopetus.
5. **Konteksti:** havaintojen maskaus ennen tiivistystä.
6. **Suurin säästökohde on siirto ja pakkaus** (70 % tokeneista, luku 19). Ne ovat rakenteisia ja tarkistettavissa skriptillä, joten ne ovat ensimmäinen ehdokas halvalle mallille ja skriptitarkistimelle.
7. **Turvallisuus ja ylläpito:** vähimmät oikeudet rooleittain, epäluotettava syöte omaan rooliinsa, avain pois komentoriviltä (`nebius-valitys.mjs:171`, kuuluu scopes istunnoille); kiinteä testisarja viikoittain, varamalliketju, uudelleenyritys yhdessä kerroksessa, katto laskee myös yritykset ja varamallit.
8. **Ei nyt:** väittely, äänestys, agenttiparvi koodissa, automaattinen prosessihaku. Kehoteoptimointi (GEPA) myöhemmin kapeisiin toistuviin tehtäviin. Toteutus omana ohuena ohjaimena Node-palvelussa, ei raskasta kehystä (E).

### 20.6 Opus 5.5:n ylittäminen

Näyttö ei edelleenkään tue yhdistelmää, joka olisi Opus 5.5:tä älykkäämpi yleisesti. Mikään mittaus ei vertaa Opus 5.5:een. Realistinen tavoite on Opuksen taso rajatuissa, testein tarkistettavissa tehtävissä ja siirrossa ja pakkauksessa pienemmällä hinnalla. Nopeus voi tulla Nebiuksen ilmoittamista nopeuksista, jos oma mittaus vahvistaa ne.

### 20.7 Avoimet ennen suunnittelua

- Tavoite ja mittari (käyttäjän päätös; jätettiin pois 19.10.2026).
- Välimuistihinnat länsimaisilla tarjoajilla; Nebiuksen nopeuksien oma mittaus.
- Claude-tilauksen hinta ja rajat vs. avoimen mallin API-lasku.
- Siirto- ja pakkaustehtävien kelpoisuus halvalle mallille (oma mittaus; vaatii käyttäjän hyväksymän maksullisen katon).

## 21. Välimuistihinnat ja tilausvertailu (19.10.2026)

**Tarkistettu itse:** tilaus on Claude Max 5x (`subscriptionType max`, `rateLimitTier default_claude_max_5x`, `billingType stripe_subscription`). GLM-5.3:n hinnat OpenRouterin endpoints-rajapinnasta: DeepInfra $0,5625 / $2,50, välimuistiluku $0,125 per M → omalla kuormalla ~65 $/pv; Together, Fireworks ja Z.ai välimuistiluku $0,26 → ~137 $/pv; Nebius ei välimuistihintaa.

**Johtopäätös:** tilaus (100 $/kk) on noin 43 kertaa halvempi kuin sama kuorma Opuksen API-listahinnalla. Avoin malli ei siksi tuo kustannussäästöä vaan lisäkapasiteettia, koska käyttö osuu rajoihin (5 h -ikkunoista 20 % huipulla ≥ 98 %, viikkoraja täyttyi 7.–12.10. ja 18.–19.10.). Suorin vertailukohta on Max 20x (+100 $/kk, hinta tarkistamatta). Avoimen mallin rooli on siirtää osa kuormasta (esim. siirto ja pakkaus Flash-mallilla ~73–120 $/kk) pois tilauksen rajoista, nopeus (luku 20.2) ja riippumattomuus yhdestä toimittajasta.


Haettu 19.10.2026. Hinnat: OpenRouterin julkinen rajapinta (`/api/v1/models/<malli>/endpoints`, 11 mallia, tarjoajan ilmoittama hinta, V) ja tarjoajien omat dokumentit. Kuorma luvusta 19: 424 M syötettä/pv, 96,5 % välimuistiluettavaa (409,2 M luku, 14,8 M täysi hinta), 2,2 M tulostetta/pv, 22 ajopäivää/kk. Kaava: 409,2·c + 14,8·i + 2,2·o ($/pv, hinnat $/M). Kaikilla taulukon tarjoajilla välimuisti on implisiittinen eikä kirjoituksesta veloiteta erikseen (rajapinnassa ei kirjoitushintaa).

#### 21.1 Hinnat: syöte / välimuistiluku / tuloste, $/M (halvin normaalitaso per tarjoaja)
| Malli | Together | Fireworks | DeepInfra | Baseten | Novita | Parasail | SambaNova | Cerebras | Muu länsi, halvin ($/pv) |
|---|---|---|---|---|---|---|---|---|---|
| GLM-5.3 | 1.4/0.26/4.4 | 1.4/0.26/4.4 | 0.5625/0.125/2.5 | 1.4/0.14/4.4 | 0.7/0.13/2.2 | 1.4/0.26/4.4 | – | – | Mistral 87.7 |
| GLM-5.3-Flash | 0.15/0.03/0.5 | 0.15/0.03/0.5 | 0.075/0.015/0.25 | 0.15/0.03/0.5 | 0.084/0.0168/0.28 | 0.15/0.03/0.5 | – | – | CoreWeave 11.5 |
| Kimi K3 | 3/0.3/15 | 3/0.3/15 | 2.85/0.285/14.25 | 3/0.3/15 | – | 3/0.3/15 | – | – | Bedrock 200.3 |
| Kimi K2.7-Code | – | – | – | – | 0.912/0.1824/3.84 | – | – | – | CoreWeave 79.6 |
| DS V4-Pro-0813 | 1.32/0.13/3.96 | – | 1.3/0.1/2.6 | – | 0.99/0.033/2.97 | 1.32/0.044/3.96 | – | – | CoreWeave 46.2 |
| DS V4-Pro | – | – | 1.3/0.1/2.6 | – | 1.6/0.135/3.2 | 0.45/0.1/3.48† | – | – | Azure 102.2 |
| DS V4-Flash-0731 | 0.14/0.03/0.28 | – | 0.06/0.015/0.18 | 0.13/0.028/0.26 | 0.409/0.026/1.228 | 0.14/0.05/0.28 | – | – | Cloudflare 15.2 |
| DS V4-Flash | – | – | 0.09/0.018/0.18 | – | – | 0.14/0.07/0.28 | – | – | Cloudflare 15.2 |
| DS V4.1-Flash | 0.3/0.006/1.2 | 0.3/0.006/1.2 | 0.14/0.0042/0.42 | 0.3/0.007/1.2 | 0.195/0.0039/0.78 | 0.3/0.006/1.2 | – | – | CoreWeave 4.5 |
| MiniMax-M3 | 0.3/0.06/1.2 | – | 0.28/0.056/1.1 | – | 0.3/0.06/1.2 | 0.3/0.06/1.2 | 0.6/0.06/2.4 | – | CoreWeave 26.0 |
| Qwen3.8-27B | – | – | 0.15/0.0375/1.875 | – | 0.42/0.085/3 | 0.24/0.05/2.2 | – | 0.99/0.99/1.49 | Cloudflare 34.2 |
Groq: ei yhtään kohdemallia OpenRouterissa. Cerebras: Qwen3.8-27B:llä välimuistiluku = täysi hinta (ei alennusta). Nebius: kaikilla malleilla ei välimuistihintaa (vahvistaa luvun 20.1). † Parasail V4-Pro tilakoodi -2 (OpenRouterin tila, merkitystä ei varmistettu); hinta 0,45 näyttää virheelliseltä. Pois jätetty tasot fast/flex/priority/batch (esim. DeepInfra flex MiniMax 0.224/0.045/0.88). OpenRouter itse: reitittää samoihin hintoihin; oma välityslisä jäi tarkistamatta. OpenRouterin mallilistan otsikkohinta on halvin päätepiste, ei keskiarvo.

#### 21.2 Kustannus Scopesin kuormalla: $/pv / $/kk (välimuistiosuus 96,5 %)
| Malli | Together | Fireworks | DeepInfra | Baseten | Novita | Parasail | SambaNova | Cerebras |
|---|---|---|---|---|---|---|---|---|
| GLM-5.3 | 136.8 / 3010 | 136.8 / 3010 | 65.0 / 1430 | 87.7 / 1930 | 68.4 / 1505 | 136.8 / 3010 | – | – |
| GLM-5.3-Flash | 15.6 / 343 | 15.6 / 343 | 7.8 / 172 | 15.6 / 343 | 8.7 / 192 | 15.6 / 343 | – | – |
| Kimi K3 | 200.3 / 4406 | 200.3 / 4406 | 190.3 / 4186 | 200.3 / 4406 | – | 200.3 / 4406 | – | – |
| Kimi K2.7-Code | – | – | – | – | 96.6 / 2125 | – | – | – |
| DS V4-Pro-0813 | 81.5 / 1793 | – | 65.9 / 1450 | – | 34.7 / 764 | 46.3 / 1019 | – | – |
| DS V4-Pro | – | – | 65.9 / 1450 | – | 86.0 / 1892 | 55.2 / 1216† | – | – |
| DS V4-Flash-0731 | 15.0 / 329 | – | 7.4 / 163 | 14.0 / 307 | 19.4 / 427 | 23.2 / 509 | – | – |
| DS V4-Flash | – | – | 9.1 / 200 | – | – | 31.3 / 689 | – | – |
| DS V4.1-Flash | 9.5 / 210 | 9.5 / 210 | 4.7 / 104 | 10.0 / 219 | 6.2 / 137 | 9.5 / 210 | – | – |
| MiniMax-M3 | 31.6 / 696 | – | 29.5 / 649 | – | 31.6 / 696 | 31.6 / 696 | 38.7 / 852 | – |
| Qwen3.8-27B | – | – | 21.7 / 477 | – | 47.6 / 1047 | 28.9 / 635 | – | 423.0 / 9307 |
Vertailuksi Nebius ilman välimuistia (luku 20.3): GLM-5.3 603 $/pv, Kimi K3 1 305, V4.1 Flash 130, GLM-5.3-Flash 65. Välimuisti laskee siis GLM-5.3:n 9-kertaisesti (DeepInfra 65 $/pv) ja V4.1 Flashin 28-kertaisesti (4,7 $/pv).

**Optimistinen oletus.** 96,5 % on Claude-lokista (Anthropicin välimuisti, 1 h tai 5 min TTL, sama malli). Luku 17: mallin vaihto ja yli 10 min tauot pudottavat osuutta (Copilot-mittaus ~8 % vaihdon jälkeen). Herkkyys, halvin länsimainen pyydetyistä ($/pv):
| Malli (halvin tarjoaja) | 96,5 % | 90 % | 80 % | 0 % |
|---|---|---|---|---|
| GLM-5.3 (DeepInfra) | 65 | 77 | 96 | 244 |
| GLM-5.3-Flash (DeepInfra) | 7.8 | 9.5 | 12.0 | 32 |
| Kimi K3 (DeepInfra) | 190 | 261 | 370 | 1240 |
| Kimi K2.7-Code (Novita) | 97 | 117 | 148 | 395 |
| DS V4-Pro-0813 (Novita) | 34.7 | 61 | 102 | 426 |
| DS V4-Flash-0731 (DeepInfra) | 7.4 | 8.7 | 10.6 | 26 |
| DS V4.1-Flash (DeepInfra) | 4.7 | 8.5 | 14.2 | 60 |
| MiniMax-M3 (DeepInfra) | 29.5 | 36 | 45 | 121 |
| Qwen3.8-27B (DeepInfra) | 21.7 | 24.8 | 29.6 | 68 |
Halvin muu länsimainen, jos CoreWeave/Cloudflare lasketaan: K2.7-Code CoreWeave 79.6, V4.1-Flash CoreWeave 4.5, MiniMax-M3 CoreWeave 26.0. DeepInfran halpuus on suurimmaksi osaksi kvantisointia (fp4/mxfp4/fp8): laatuero Opus-luokkaan mittaamatta.

#### 21.3 Välimuistin toiminta, elinaika ja sijainti
| Tarjoaja | Toiminta | Elinaika | Sijainti / säilytys (lähde) |
|---|---|---|---|
| Together | automaattinen, ei otsaketta | ~1 h, paras yritys; jaettu laivasto, kuormassa aiemmin pois (V, luettu) | HQ US; serverless ilman alueen valintaa; DeepSeek N. Amerikan konesaleissa; promptit tallennetaan oletuksena, ZDR organisaatioasetuksella (V, luettu) |
| Fireworks | automaattinen; vain 1 replika, joten `x-session-affinity` tai `user` tarvitaan | "useita minuutteja" (KV volatiilissa) (V, luettu) | HQ US; ZDR oletuksena; US-only serverless = `us`-taso hintaan 1,5× (OpenRouter) |
| DeepInfra | automaattinen, paras yritys; lisäksi `prompt_cache_options` ttl 5 min/1 h kirjoituslisällä | vanhenee tauolla; eksplisiittinen 5 min tai 1 h (V, luettu) | HQ US; ei levylle, ei koulutusta, ei jakoa (luettu); konesalialuetta ei kerrota |
| Baseten | automaattinen; suositus `x-session-affinity` (≤~60 pyyntöä/min) | ei dokumentoitu | HQ US; `us`-päätepiste osalle malleista; säilytystä ei luettu |
| Novita, Parasail, SambaNova, Cerebras | OpenRouter: implisiittinen (Cerebras ilman alennusta) | ei luettu | HQ US (OpenRouter); alue ja säilytys lukematta |
OpenRouter: rajapinta antaa vain HQ-maan (US; Mistral FR, Nebius NL) ja vain CoreWeaulle konesalin (US); datan säilytystä ei kentissä. Sticky routing pitää tarjoajan samana vain, jos välimuistiluku on halvempi. Z.AI, Moonshot, DeepSeek omissa API:issaan: automaattinen; luku 0,1–0,25× (OpenRouter-dokumentti).

#### 21.4 Claude-tilaus (paikallinen, ei tokeneita tulostettu)
`~/.claude.json` ja `.credentials.json`: subscriptionType = **max**, rateLimitTier = **default_claude_max_5x**, organizationType = claude_max, billingType = stripe_subscription, hasExtraUsageEnabled = false (R). Hinnat claude.com/pricing 19.10.2026 (luettu, V):
| Tilaus | Hinta/kk | Käyttö |
|---|---|---|
| Pro | 20 $ (17 $ vuosisopimuksella) | perusraja; ei Fablea |
| Max 5x | 100 $ | 5× Pro per 5 h; viikkoraja; Fable 50 % viikkorajoista; 100 $ API-krediittiä/kk |
| Max 20x | 200 $ (sivulla "from 100", krediitti 200 $; erillistä hintariviä en lukenut) | 20× Pro |
| Team | vakio 25 $ (20 $ vuosi); premium 125 $ (100 $ vuosi), 5× vakio | 2–150 paikkaa |
| Enterprise | ei julkista hintaa (myyntiavusteinen) | ei löytynyt |
Absoluuttisia token- tai viestirajoja Anthropic ei julkaise; rajat ovat 5 h istunto + viikko (+ Fable erikseen), jaettu Clauden ja Claude Coden kesken (V, luettu support.claude.com).

#### 21.5 Osuuko käyttö rajoihin: kyllä, sekä 5 h että viikkorajaan
`kayttoraja.mjs` lukee `api.anthropic.com/api/oauth/usage` (`five_hour`, `seven_day`: utilization + resets_at) tai vahdin `kaytto.json`:n; vain prosentti, ei tokeneita. Vahdin loki `~/.claude/hooks/state/kayttoraja-vahti.jsonl` (7 384 riviä, 25.9.–19.10.) kirjaa vain 5 h rajan (R):
- 90 kirjattua 5 h ikkunaa: mediaani 37 %, p90 99 %; **18 ikkunaa (20 %) huipulla ≥98 %, 6 ikkunaa 100 %** (3., 6., 7., 12.10.). Vahti hylkäsi 99 aliagentti-/työkalukutsua 10 päivänä (26.9. 30 kpl).
- Viikkoraja: Claude Code -lokeissa "hit your weekly limit" ensimmäisen kerran 7.10. klo 16.05 paikallista, nollautuminen 12.10. klo 1.00 (~4,4 vrk esto), uudelleen 18.10. klo 17.34, nollautuminen 19.10. klo 1.00. Toistuvat viestit (1 100) ovat ajastettujen ajojen uusintayrityksiä, eivät erillisiä estoja. Estojakso selittää todennäköisesti luvun 19 aukon 8.–10.10. (päätelmä, A).
- Viikkorajan käytön historiaa ei tallenneta (kaytto.json ~5 min). 13.–19.10. 5 h huiput matalia (4–83 %, nyt 37 %), joten raja ei sido jatkuvasti, vaan huippuviikoilla ja purskeissa.

#### 21.6 Tilaus vs. Opus-lista vs. avoimet mallit ($/kk, 22 ajopäivää)
| Vaihtoehto | $/kk | Suhde Max 5x:ään |
|---|---|---|
| Max 5x (nykyinen) | 100 | 1× |
| Max 20x | 200 | 2× |
| Sama kuorma Opus 5.5 -listalla (194 $/pv, luku 19; yläraja, mallimix halvempi) | ~4 270 | 43× |
| Halvin avoin kokonaan: V4.1-Flash DeepInfra / GLM-5.3-Flash DeepInfra | 104 / 172 | 1,0× / 1,7× |
| Kovempi avoin: DS V4-Pro-0813 Novita / GLM-5.3 DeepInfra / MiniMax-M3 | 764 / 1 430 / 649 | 7,6× / 14× / 6,5× |
| Kimi K3 DeepInfra | 4 186 | 42× |
| Siirto/pakkaus (70 % kuormasta, luku 19) V4.1-Flashille DeepInfra | ~73 | 0,7× |
| Sama GLM-5.3-Flashille | ~120 | 1,2× |

#### Mitä tästä seuraa
1. Kustannussäästöä avoimista malleista ei tule: tilaus (100 $/kk) on 1–43 kertaa halvempi kuin sama kuorma API-hinnalla, ja ainoa avoin vaihtoehto samaan hintaan on Flash-luokka (V4.1-Flash 104 $/kk, ja vain 96,5 %:n osuudella; 80 %:lla 312 $/kk). Kärkimallit (GLM-5.3, Kimi K3, V4-Pro) maksavat 650–4 200 $/kk.
2. Avoimen mallin arvo on lisäkapasiteetti: tilaus rajoittaa jo nyt (viikkoraja 7.–12.10. ja 18.10., 6 täyttä 5 h ikkunaa). Siirto/pakkaus (70 % tokeneista) Flash-mallille maksaisi ~73–120 $/kk, saman verran kuin Max 20x:n lisähinta (+100 $/kk, 4× kapasiteetti, ei integrointia, ei laaturiskiä).
3. Rajan kuluminen ei ole suoraan tokenisuhteessa (välimuistiluvun paino tuntematon, Anthropic ei julkaise): 70 % tokeneista ei välttämättä ole 70 % rajasta. Mittaa ensin: kirjaa `seven_day` ja `five_hour` jatkuvasti lokiin ja vertaa tehtäväluokittain.
4. Jos avoin reitti rakennetaan, valitse tarjoaja välimuistin takia: kaikilla pyydetyillä on automaattinen välimuisti, mutta vain Together dokumentoi ~1 h TTL:n ja DeepInfra eksplisiittisen 5 min/1 h -ikkunan; Fireworksilla "useita minuutteja" ja istuntotunniste pakollinen. Mittaa todellinen osuus omalla liikenteellä (96,5 % on yläraja).
5. Datan sijainti: Together tallentaa promptit oletuksena (ZDR päälle), Fireworks ja DeepInfra eivät; eurooppalaista päätepistettä on vain Mistralilla (GLM-5.3 `eu`, 1,10× hinta) ja Nebiuksella ilman välimuistia.

#### Lähteet ja ei löytynyt
Hinnat: openrouter.ai/api/v1/models/{z-ai/glm-5.3, z-ai/glm-5.3-flash, moonshotai/kimi-k3, moonshotai/kimi-k2.7-code, deepseek/deepseek-v4-pro(-0813), deepseek/deepseek-v4-flash(-0731), deepseek/deepseek-v4.1-flash, minimax/minimax-m3, qwen/qwen3.8-27b}/endpoints ja /api/v1/providers (V, luettu). Dokumentit: docs.together.ai/docs/inference/chat/prompt-caching.md, /zero-data-retention.md, /privacy-and-security.md; docs.fireworks.ai/guides/prompt-caching, /security_compliance/data_handling; docs.deepinfra.com/chat/prompt-caching.md, /chat/prompt-cache-retention.md, /account/data-privacy.md; docs.baseten.co/development/model-apis/overview; openrouter.ai/docs/guides/best-practices/prompt-caching; claude.com/pricing; support.claude.com (Claude Code Pro/Max). Ei löytynyt: tarjoajien omat hinnastosivut (JS-renderöityjä; hinnat vain OpenRouterin kautta, ei toista lähdettä), Novita/Parasail/SambaNova/Cerebras/Baseten TTL ja säilytys, Groqin kohdemallit, konesalialueet (EU/US) muille kuin CoreWeave, OpenRouterin välityslisä, Max 20x:n erillinen hintarivi, viikkorajan käyttöhistoria ja absoluuttiset rajat. Hinnat ovat yhden päivän tilanne ja OpenRouterin tilakoodin -2/-5 päätepisteet voivat olla heikentyneitä.

## 22. Tietoturva ja kelpoisuus arkaluontoiselle yritysdatalle (19.10.2026)

**Ehdoton ehto (käyttäjä 19.10.2026):** yhdistelmän on oltava tietoturvallinen ja sovelluttava arkaluontoiselle yritysdatalle.

**Tarkistettu itse alkuperäisestä (anthropic.com/legal/consumer-terms ja /privacy, haettu 19.10.2026):** kuluttajaehdoissa lukee "Non-commercial use only. You agree that you will not use our Services for any commercial or business purposes" ja "Even if you opt out, we will use Materials for model training when: (1) you provide Feedback to us regarding any Materials, or (2) your Materials are flagged for safety review". Nykyinen Claude Max 5x -tilaus ei siksi kelpaa arkaluontoiselle yritysdatalle. Kaupalliset ehdot (Team, Enterprise, API) eivät käytä dataa koulutukseen; ZDR vain sopimuksella.

**Seuraukset aiempiin lukuihin:** yhdistelmä on vain avoimia malleja (käyttäjä 19.10.2026), joten Claude ei ole vaihtoehto missään roolissa. Luvun 21 tilausvertailu (Max 5x 100 $/kk) ei ole kelvollinen vertailukohta, koska tilaus ei täytä ehtoa. Vertailukohta on Claude Team tai Enterprise tai API kaupallisin ehdoin. Nebiuksen julkinen päätepiste, jota `nebius-valitys.mjs` käyttää, ei kelpaa (alue "Global", syötteet säilytetään oletuksena, useita alihankkijoita). Luvun 21 halvimmat tarjoajat (DeepInfra, CoreWeave) ovat US-tarjoajia ilman aluevalintaa eivätkä kelpaa.


Syvähaku J, haettu 19.10.2026. Ehto (käyttäjä 19.10.2026): yhdistelmän on oltava tietoturvallinen ja sovelluttava arkaluontoiselle yritysdatalle. Lähteet ovat tarjoajien omia ehtoja, DPA:ta, dokumentaatiota ja NIST-sivuja (sivut haettu Macin kautta, lataukset `lataukset/j/`). Näyttö: R = riippumaton (viranomainen, ei myyjä), V = tarjoajan oma ehto tai väite, A = anekdootti tai oma päätelmä. "luettu" = alkuperäinen sivu luettu, "yht." = vain hakuyhteenveto. Sertifikaatit ovat aina V, ellei auditointiraporttia ole nähty (yhtäkään raporttia ei nähty). Maksuttomia kutsuja vain.

#### 22.1 Anthropic: Claude Max 5x ei sovellu arkaluontoiselle yritysdatalle

Tilaus on Max 5x (ESITIEDOT §21.4, paikallinen tarkistus). Kuluttajaehdot ja kaupalliset ehdot ovat eri sopimukset.

| Kysymys | Max / Pro / Free (kuluttaja) | Team / Enterprise / API (Commercial Terms) |
|---|---|---|
| Sopimus | Consumer Terms, Anthropic Ireland Ltd (EEA/Swiss-versio, voimassa 8.10.2025) (V, luettu) | Commercial Terms, DPA ja SCC automaattisesti mukana: "When you accept Anthropic's Commercial Terms of Service, you also accept our DPA" (V, luettu) |
| Kaupallinen käyttö | **"Non-commercial use only. You agree that you will not use our Services for any commercial or business purposes"** (Consumer Terms, luettu) | sallittu |
| Koulutus | Käyttäjän valinta: "We will train new models using data from Free, Pro, and Max accounts when this setting is on (including when you use Claude Code from these accounts)". Vaikka valinta on pois, koulutetaan silti, jos annat palautetta tai aineisto liputetaan turvatarkistukseen: "Even if you opt out, we will use Materials for model training when: (1) you provide Feedback ... or (2) your Materials are flagged for safety review" (luettu) | "Anthropic does not train generative models using code or prompts sent to Claude Code under commercial terms, unless the customer has chosen to provide their data" (Claude Code -dokumentti, luettu) |
| Säilytys | 30 pv, jos koulutus pois; jopa 5 v (de-identifioituna), jos koulutus päällä; palaute 5 v; sääntörikkomukseksi liputettu: syöte ja tuloste 2 v, luokituspisteet 7 v (privacy.claude.com, 1.7.2026, luettu) | API: automaattinen poisto 30 pv:ssä; ZDR erikseen sovittuna ja Anthropicin hyväksymänä, organisaatiokohtaisesti; luokittelutulokset säilyvät ZDR:ssäkin; "Covered Models" vaativat rajoitetun säilytyksen ja tarkistuksen myös ZDR:ssä (luettu) |
| DPA | ei kuluttajille: DPA-ohje koskee "commercial products" (luettu) | on |
| Claude Code -käyttö | Consumer Terms Free/Pro/Max-käyttäjille; "Advertised usage limits for Pro and Max plans assume ordinary, individual usage"; OAuth-tunnuksia ei saa välittää muiden puolesta (code.claude.com/legal-and-compliance, luettu) | Commercial Terms; ZDR vain Enterprise-Claude Codelle tai API-avaimelle |

Paikallinen havainto (R): `~/.claude.json` sisältää `groveConfigCache.grove_enabled = true`. Kentän merkitys on tuntematon (ei dokumentoitu lukemissani lähteissä); koulutusasetusta (claude.ai/settings/data-privacy-controls) ei voitu lukea, joten en tiedä, onko koulutus päällä.

**Johtopäätös: ei kelpaa.** Kolme itsenäistä syytä: (1) ehdot kieltävät liiketoimintakäytön, joten arkaluontoisen yritysdatan lähettäminen rikkoo sopimusta eikä siihen voi olla suojaavaa DPA:ta; (2) koulutus on käyttäjäasetus, ja se ohitetaan palautteella tai turvaliputuksella; (3) ei DPA:ta, ei ZDR:ää, säilytys 30 pv–5 v. EEA-versio on se, joka palvelimeni palautti Macin kautta; Yhdysvaltain version (Anthropic PBC) sanamuotoa en lukenut. Kelvolliset Claude-reitit: Team Premium tai Enterprise (hinnat ESITIEDOT §21.4: 25–125 $/paikka; Enterprise myyntiavusteinen), API + DPA (+ ZDR sopimuksella) tai Claude Bedrockin/Vertexin/Foundryn kautta (Commercial-ehdot). Bedrock-sivun huomio: "Claude Fable 5 and Claude Fable 5.1 require human review (allowed_modes: [aws_review, ...])", joten Fable ei ole Bedrockissa ZDR:llä (V, luettu).

#### 22.2 Tarjoajat avoimille malleille (yhtiö, sijainti, säilytys, koulutus, sertifikaatit)

Kaikilla alla ei koulutusta ilmoituksen mukaan (V). Yhdysvaltalaisen yhtiön tai tytäryhtiön palvelu on US CLOUD Act -altis oikeudellisesti riippumatta konesalin sijainnista (päätelmä, A; en löytänyt tarjoajan omaa kantaa muulta kuin Scalewaylta).

| Tarjoaja | Yhtiö / alue | Säilytys ja ZDR | Sertifikaatit, DPA, verkko | Huomio |
|---|---|---|---|---|
| Nebius Token Factory | NL (Nebius B.V.), pörssiyhtiö Nebius Group N.V.; julkinen päätepiste "Region: Global", sijainti vaihtuu ilman ilmoitusta | Oletus: syötteet ja tulosteet **säilytetään** speculative decodingia varten (Suomessa); ei koulutusta. ZDR organisaatiotasolla käyttäjän vaihtamalla ("Enabling ZDR may impact ... inference speed"). Poisto-oikeus (luettu) | SOC 2 Type II, HIPAA, ISO 27001 (V; ISO 27701/42001 ei mainittu); DPA + SCC julkinen; 15 pv ennakkoilmoitus alihankkijamuutoksista (luettu) | Alihankkijat julkisille päätepisteille: Nebius Inc. (US), RunPod, BoostRun, Shadeform, Axe Compute (kaikki US-yhtiöitä; sijainti US/Islanti/Kanada) (luettu). Dedikoitu päätepiste: alue sopimuksessa (DPA 6.1), ei failoveria muualle |
| DeepInfra | US | Ei tallenneta levylle, vain muistiin; bulk-ajot salattuna levylle lyhyeksi ajaksi; ei koulutusta, ei jakoa (luettu) | SOC 2 ja ISO 27001 omin sanoin (yht.); DPA ei löytynyt; alue ei valittavissa | Halpa osin kvantisoinnin takia (ESITIEDOT §21) |
| Fireworks | US | ZDR oletuksena inferenssille; Response API: `store=True` oletus, 30 pv (luettu) | SOC 2 Type II, ISO 27001, 27701, 42001, HIPAA, raportit Trust Centerissä (V, luettu) | US-only-taso 1,5× hinta; EU-aluetta ei löytynyt |
| Together | US | ZDR **ei oletus**: "ZDR is not enabled by default", asetus organisaatiossa; koulutus opt-in, oletus pois (luettu). Serverless ilman aluevalintaa; EU vain dedikoitu/VPC | SOC 2 Type 2, ISO 27001:2022 (yht.) | Passthrough-mallit lähettävät kolmannelle; ZDR sammuttaa ne |
| Baseten | US | Syötteitä ja tulosteita ei tallenneta oletuksena, async-jono enintään 24 h (yht.) | SOC 2 Type II, HIPAA, GDPR (yht.); self-hosted/hybrid omassa VPC:ssä | DeepSeek rajattavissa US/EU-alueelle (yht.) |
| CoreWeave | US | Serverless Inference: ZDR oletuksena (tuotesivu, vanha, yht.) | Trust Center: SOC 2, ISO 27001/27017/27018; Serverless-tuotteen kattavuus varmistamatta; ISO mahdollisesti vain "alignment" (yht.) | OpenRouterin mukaan konesali US |
| Mistral La Plateforme | FR | Oletus EU-isännöinti; US-päätepiste valinnainen. ZDR vain pay-as-you-go ja stateless-rajapinnoille (chat, FIM, embeddings, OCR ym.), ei Files/agents/batch (luettu). Ilman ZDR:ää abuse monitoring 30 pv (yht.) | DPA kuuluu ehtoihin, ei allekirjoiteta erikseen (yht.); EU-aluepäätepiste +10 % (yht.); osa alihankkijoista EU:n ulkopuolella (luettu) | Omat mallit + GLM-5.3 `eu`-tasolla (OpenRouter) |
| Scaleway Generative APIs | FR, Pariisi | ZDR oletuksena; virhetilanteessa pyynnön sisältö enintään 2 viikkoa; metatieto 6 kk; välimuisti eristetty projektiin, ei pois päältä; ei koulutusta (luettu, tarkistettu 3.10.2025) | GDPR; "not subject to extraterritorial laws such as the American Cloud Act" (V, luettu; juridinen väite, ei riippumaton); sertifikaatit lukematta | Mallit: GLM-5.3, DeepSeek V4.1-Flash/V4-Flash, gpt-oss-120b, Mistral Large 3, Medium 3.5, Qwen3-235B, Gemma 4, Devstral 2; Kimi K3 ja MiniMax-M3 ei listalla (luettu) |
| OVHcloud AI Endpoints | FR, Gravelines | "Data is not stored or shared during or after model use"; laskutustiedot kirjataan (luettu) | DPA/sertifikaatit lukematta | Mallit: gpt-oss-120b (0,08/0,40 €/M), Qwen3.8-27B, Qwen3.5-397B, Llama 3.3 70B; ei GLM/Kimi/DeepSeek (luettu) |
| IONOS AI Model Hub | DE | Promptia ja tulostetta ei lokiteta eikä henkilökunta näe; metatieto (aika, malli, tokenit) kirjataan; pääsy vain EU:sta (luettu) | Konesalit ISO 27001, BSI C5 -piirissä; GDPR-DPA osana pääsopimusta (luettu) | Mallit: gpt-oss-120b, Qwen3.8-27B, Qwen3.5-397B, Llama 3.3, Mistral Small 24B; ei GLM/Kimi/DeepSeek |
| AWS Bedrock | US-yhtiö; EU-alueet, European Sovereign Cloud (yht.) | `data_retention_mode: none` = ZDR, alueittain; oletuksena AWS voi säilyttää väärinkäytön torjuntaan; ei jaeta mallin tekijälle (luettu). Kimi K3, gpt-oss, Llama saatavilla (OpenRouter-lista) | AES-256, KMS-avaimet, PrivateLink; sertifikaatit lukematta | CLOUD Act -altis; paras hyperscaler-vaihtoehto ZDR-hallinnassa |
| Azure Foundry | US-yhtiö | Ei koulutusta, ei jaeta mallin tekijälle; abuse monitoring -tallenne asiakkaan valitsemassa maantieteessä; Global-tyyppi voi prosessoida missä tahansa (luettu). DataZone EU: DeepSeek-V4-Flash (yht.); Kimi vain Global | Sertifikaatit lukematta | CLOUD Act -altis; EU-kelpoisuus vain DataZone/EU-alueella |
| Vertex Model Garden | US-yhtiö | EU-monialuepäätepiste avoimille malleille (yht.); ZDR-kantaa ei löytynyt; "global endpoint doesn't support data residency" | – | DeepSeek V4.1 Flash esikatselu 14.10.2026 (yht.) |
| OpenRouter (välittäjä) | US | Näkee kaikki promptit. `provider: {zdr: true, data_collection: "deny"}` rajaa ZDR-päätepisteisiin; tuntematon politiikka oletetaan säilytetyksi ja koulutetuksi; ZDR ei koske lisäosia (web-haku) (V, luettu). ZDR-lista (1 035 päätepistettä) haettu: GLM-5.3 ZDR-merkittynä 35 tarjoajalla, Kimi K3 18 | Politiikka on tarjoajan ilmoittama, OpenRouter ei varmenna BYOK-ilmoituksia | **ZDR-merkki ei ole lainkäyttöalue**: listalla ovat myös Z.AI, Moonshot AI (SG) ja SiliconFlow. Vaadi lisäksi `only`-lista |

#### 22.3 Kiinalaiset ensiosapuolen API:t

Z.ai, Moonshot, DeepSeek, MiniMax, Alibaba: OpenRouterin tarjoajatiedoissa HQ SG (Z.AI, Moonshot, Minimax, Alibaba, SiliconFlow) tai CN (DeepSeek) (R, JSON luettu). DeepSeekin palvelimet Kiinassa, ei DPA:ta (ESITIEDOT §10, toissijaisia lähteitä). Arkaluontoiselle datalle ei kelpaa: ei EU:n DPA:ta eikä todennettavaa lainkäyttöaluetta. Muutkin yhtiöt voivat tarjota ZDR-merkin OpenRouterissa, joten merkki ei riitä.

#### 22.4 Oma ajo EU:ssa

| Vaihtoehto | Malli | Hinta | Mitä tietoturvassa saavutetaan |
|---|---|---|---|
| Hetzner GEX131 (RTX PRO 6000, 96 GB), Helsinki/Falkenstein | gpt-oss-120b (fp4 ~60 GB, mahtuu; oma päätelmä) | alk. 889 €/kk (lanseerausilmoitus, hinnanmuutos 1.4.2026 tarkistamatta; V, yht.) | Yhden vuokralaisen kone, EU-yhtiö, ei kolmatta osapuolta; sinä vastaat korjauksista, verkosta ja lokeista |
| Scaleway Dedicated Deployment, H100-1-80G | gpt-oss-120b, Mistral/Qwen ≤ 120B | 3,40 €/h ≈ 2 480 €/kk 24/7 (vanha sivu, yht.) | Erillinen eristys, ranskalainen yhtiö, valmis päätepiste |
| Scaleway Dedicated, B300-SXM-8 | GLM-5.3 (listattu yhteensopivaksi, luettu) | hintaa ei löytynyt; oma arvio 8 GPU × 5–8 $/h ≈ 30–45 k$/kk (A) | Kärki-MoE omassa kapasiteetissa; kustannus 20–40× Max 5x |
| Nebius dedicated endpoint, EU | kärkimallit | GPU-tuntihinta ei julkinen (H100 4,50 $/h listahinta, vanha); alue sopimuksessa, ei failoveria (luettu) | Sopimusperusteinen aluelupaus; yhtiö silti US-tytäryhtiöineen |
| AWS/Azure oma tili | Kimi K3, gpt-oss, DeepSeek V4 Flash | token- tai provisioned-hinta | Oma tili, KMS/CMEK, PrivateLink; US-yhtiö |

Ero julkiseen päätepisteeseen: monivuokralaisuus, alihankkijaketju (esim. Nebiuksen RunPod/Shadeform) ja dynaaminen alue poistuvat. Painojen alkuperä ja injektioriski eivät poistu (22.5). Omalla raudalla ZDR on rakenteellista, ei sopimuslupaus.

#### 22.5 Painojen alkuperä

- **NIST CAISI (R, luettu):** DeepSeek V4 Pro (huhti 2026) jäljessä USA:n kärkeä ~8 kk; DeepSeekin omat luvut korkeammat kuin CAISI:n (itseraportoitu "kuin Opus 4.6", CAISI "kuin GPT-5"). GLM-5.2 (heinä 2026): "safeguards allow assistance with agentic cyber exploit development ... block fewer sensitive biological questions"; "safeguards for open-weight models can be circumvented when self-hosted". GLM-5.3 (syys 2026): "most cyber-capable open-weight model released to date", ~4 kk jäljessä USA:n kärkeä. Aiemmin (ESITIEDOT §18): DeepSeek R1-0528 12× alttiimpi agentin kaappaukselle kuin US-mallit; Kimi K2 Thinking sensuroitu kiinaksi. Kimi K3: vain UK AISI/CAISI-alustava kyberarvio (heinä 2026), sisältöä en lukenut. Qwenistä CAISI-arviota ei löytynyt.
- **Takaovet:** Sleeper Agents (R/V) ja Sleeper Cell (todistekonsepti): käyttäytymistakaovea ei havaita vertailuilla eikä turvakoulutus poista sitä; kenttähavaintoa isännöidyistä kiinalaisista painoista ei löytynyt (ESITIEDOT §18). Riski on olemassa mutta osoittamaton; lievennys on rakenteellinen (ei kirjoitus- eikä verkko-oikeuksia mallin toimille, oma injektiotestisarja).
- **Kiellot ja rajoitukset:** DeepSeek-sovellus kielletty USA:n Commerce-ministeriön laitteilta (maaliskuu 2025), Italian tietosuoja-viranomainen esti sen tammikuussa 2025, Etelä-Korea, Australia, Taiwan rajasivat viranomaislaitteilla; Axios 20.7.2026: Yhdysvaltain hallinto uusii kiinalaisten mallien kieltopyrkimyksen (kaikki yht., lehdistölähteitä). Kimi- tai Qwen-kieltoa ei löytynyt. Ne koskevat sovelluksia ja API:a, eivät itse ajettuja painoja. Vientirajoituksia painoille ei löytynyt. Yritysten sisäisistä kielloista ei löytynyt luotettavaa lähdettä.
- **Länsimaiset vaihtoehdot:** gpt-oss-120b (Apache 2.0; saatavilla Scaleway, OVH, IONOS, Bedrock, kaikki EU-reitit), Mistral Large 3 (675B) ja Medium 3.5 (128B) (Scaleway, Mistral), Nemotron (NVIDIA; DeepInfra, Nebius, Together), Llama 3.3 70B, Gemma 4. Taso: kärkilistalla (AA v4.3.2, ESITIEDOT §2) ovat kiinalaiset (GLM-5.3 45, Kimi K3 44; Opus 5.5 58); länsimaisille ei ole tässä haussa samaa mittausta. gpt-oss-120b on riittävä pieneen rooliin (nopea, Apache), ei kärkeen: oletus, ei mitattu tässä.
- **Eheys:** safetensors poistaa pickle-koodiajon, ei takaovea; OpenSSF model signing (Sigstore-paketti, `model_signing sign/verify`) todentaa tiedostojen hashit ja alkuperän (yht., blogeja ja puheita; spesifikaatiota en lukenut). Käytäntö: lataa painot itse tarkistetusta lähteestä, tallenna hash, älä käytä pickle/GGUF-malleja ulkopuolelta (CSA, ESITIEDOT §18).

#### 22.6 Kelpoisuus arkaluontoiselle yritysdatalle

Kelpaa = voi lähettää ilman lisätoimia sopimuksen ja sisäisen riskinarvion jälkeen. Pohjana vain tarjoajan omat ehdot (V); mikään ei ole auditoitu tässä.

| Tarjoaja tai reitti | Arvio | Perustelu ja ehdot |
|---|---|---|
| Claude Max 5x (kuluttajatilaus) | **Ei kelpaa** | Kielletty liiketoimintakäyttö, ei DPA:ta, koulutus asetuksena (ohitetaan palautteella/turvaliputuksella), säilytys 30 pv–5 v |
| Claude Team Premium / Enterprise / API + DPA | Kelpaa ehdoin | Ei koulutusta, DPA+SCC; ehdot: ZDR erikseen sovittava (vain Enterprise/API), 30 pv oletussäilytys, US-yhtiö |
| Claude Bedrockin kautta | Kelpaa ehdoin | Retention mode `none`; Fable 5/5.1 vaatii AWS-tarkistuksen, joten ei Fablelle |
| Mistral La Plateforme (EU) | Kelpaa ehdoin | ZDR päälle ja vain stateless-rajapinnat, EU-päätepiste, DPA; vain Mistralin omat mallit ja GLM-5.3 |
| Scaleway Generative APIs | Kelpaa ehdoin | Ranska, ZDR oletus, DPA; 2 viikon virhetilanteen säilytys hyväksyttävä; sertifikaatit tarkistettava; GLM-5.3, DeepSeek V4.1 Flash, gpt-oss, Mistral |
| OVHcloud AI Endpoints | Kelpaa ehdoin | Gravelines, ei tallennusta; vain gpt-oss/Qwen/Llama; DPA ja sertifikaatit tarkistettava |
| IONOS AI Model Hub | Kelpaa ehdoin | Saksa, ei lokia, BSI C5; vain gpt-oss/Qwen/Llama/Mistral Small |
| Nebius, dedikoitu päätepiste EU | Kelpaa ehdoin | ZDR päälle, alue sopimuksessa, DPA; US-tytäryhtiö (CLOUD Act) hyväksyttävä vai ei, on päätös |
| Nebius, julkinen päätepiste | Ei kelpaa | Alue "Global" ja vaihtuva; alihankkijoina US-yhtiöt ja GPU-jälleenmyyjät; oletuksena syötteet säilytetään (ZDR pois). ZDR päälle: vain ei-arkaluontoiselle |
| Bedrock / Azure Foundry / Vertex avoimilla malleilla | Kelpaa ehdoin | EU-alue (Bedrock `none`, Azure DataZone EU, Vertex EU-moni-alue), oma tili; US-yhtiö; Azure Kimi vain Global, ei EU |
| Fireworks | Kelpaa ehdoin | ZDR oletus, ISO 27001/27701/42001, SOC 2; US-yhtiö, ei EU-aluetta; `store=false` Response API:ssa |
| Together, DeepInfra, Baseten, CoreWeave | Ei kelpaa (arkaluontoinen); kelpaa ehdoin muulle | US, ei aluevalintaa julkisella päätepisteellä; Together ZDR ei oletus; DeepInfra ilman DPA:ta; Baseten/CoreWeave vain VPC/dedikoituna |
| OpenRouter | Ei kelpaa arkaluontoiselle | Välikäsi näkee kaiken, politiikka tarjoajan ilmoittama, ei aluetta; käytä vain `zdr:true` + `only`-lista + `allow_fallbacks:false` ei-arkaluontoiselle |
| Kiinalaisten ensiosapuolen API:t | **Ei kelpaa** | SG/CN, ei DPA:ta, ei todennettavaa lainkäyttöä |
| Oma ajo EU:ssa (Hetzner/Scaleway/OVH, gpt-oss tai Mistral) | **Kelpaa** | Rakenteellinen eristys, ei kolmatta osapuolta; taso vain ≤ 120B-luokka (kärkimalli 30–45 k$/kk) |
| Kiinalaiset painot omalla raudalla | Kelpaa ehdoin | Datan sijainti turvattu; takaovi- ja injektioriski: ei työkaluoikeuksia, injektiotestit, hash-tarkistus |

#### 22.7 Mitä ei löytynyt
- Yhtäkään auditointiraporttia (SOC 2, ISO) ei nähty; sertifikaatit ovat tarjoajan väitteitä. ISO 27701/42001: vain Fireworks. Nebiuksen ISO 27701, Scalewayn, OVH:n, IONOSin ja hyperscalerien sertifikaattilistoja en lukenut.
- Togetherin, DeepInfran, Basetenin ja CoreWeaven DPA/alihankkijalistoja ja DeepInfran konesalien sijaintia ei luettu. Mistralin, Scalewayn ja OVH:n US-CLOUD Act -kantaa ei verrattu riippumattomaan lausuntoon.
- Vertexin ZDR-kantaa avoimille malleille ei löytynyt. Nebius dedikoidun päätepisteen GPU-hintaa ja Scalewayn B300-hintaa ei löytynyt.
- Kimi K3:n ja MiniMax-M3:n riippumatonta turva-arviota (paitsi Kimi K3 alustava kyberarvio) ja Qwen3.8:n CAISI-arviota ei löytynyt. Mallien takaovista ei kenttähavaintoa.
- Painojen vientirajoituksia ja yritysten sisäisiä kieltoja ei löytynyt luotettavasta lähteestä.
- Anthropicin Consumer Termsin US-version sanamuotoa ja koulutusasetuksen nykyarvoa tälle tilille ei voitu lukea.

#### Mitä tästä seuraa
1. Max 5x ei kelpaa arkaluontoiselle yritysdatalle (non-commercial-lauseke, ei DPA:ta, koulutus asetus). Päätös: onko Scopesin data arkaluontoista; jos on, työ on siirrettävä Team Premium/Enterprise- tai API/Bedrock-reitille, tai Max-käyttö rajattava ei-arkaluontoiseen dataan.
2. Avoin reitti arkaluontoiselle datalle on vain EU-tarjoaja ZDR:llä (Scaleway, Mistral, IONOS, OVH), Nebiuksen dedikoitu EU-päätepiste tai oma ajo. Nykyinen Nebius-julkinen päätepiste (`nebius-valitys.mjs`) ei kelpaa: ZDR on pois oletuksena ja alue vaihtuu.
3. Kärkimallit (GLM-5.3 ym.) EU-ZDR:llä löytyvät vain Scalewaylta ja Mistralilta; OVH ja IONOS tarjoavat gpt-oss-120b/Qwen/Llama-luokkaa. Arkaluontoiselle datalle rooli on siis rajattava ≤ 120B-malliin tai kärkimallin EU-reittiin, ja laatuero Opukseen mitattava.
4. Reitittimeen tarvitaan tietoluokka (arkaluontoinen / ei) ja allowlist tarjoajittain (ei OpenRouteria, ei kiinalaisia API:a); ZDR vahvistettava kirjallisesti (Nebius tukipyyntö) ja testattava itse.
5. Kiinalaiset painot ovat kelvollisia vain EU-isännöijältä tai omalla raudalla, ilman työkaluoikeuksia ja hash-tarkistuksella; gpt-oss ja Mistral ovat riskittömämpi oletus pienille rooleille.

#### Lähteet
Anthropic: [Consumer Terms](https://www.anthropic.com/legal/consumer-terms), [Updates to Consumer Terms](https://www.anthropic.com/news/updates-to-our-consumer-terms), [training](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training), [retention](https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data), [commercial retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data), [ZDR](https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to), [DPA](https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa), [Claude Code data usage](https://code.claude.com/docs/en/data-usage), [legal](https://code.claude.com/docs/en/legal-and-compliance).
Tarjoajat: [Nebius legal](https://docs.tokenfactory.nebius.com/legal/legal-quick-guide), [DPA](https://docs.nebius.com/legal/dpa), [sub-processors](https://docs.nebius.com/legal/sub-processors_tofa), [enterprise](https://nebius.com/services/token-factory/enterprise-grade-inference); [Scaleway](https://www.scaleway.com/en/docs/generative-apis/reference-content/data-privacy/), [mallit](https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/); [Mistral ZDR](https://help.mistral.ai/en/articles/347612-can-i-activate-zero-data-retention-zdr), [sijainti](https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data); [IONOS](https://docs.ionos.com/cloud/ai/ai-model-hub/governance-and-compliance/data-handling); [OVH](https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-capabilities), [katalogi](https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/); [Fireworks](https://docs.fireworks.ai/faq/enterprise/compliance/certifications); [Together ZDR](https://docs.together.ai/docs/zero-data-retention); [DeepInfra](https://docs.deepinfra.com/); [Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html); [Azure](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy); [OpenRouter ZDR](https://openrouter.ai/docs/guides/features/zdr), [ZDR-lista](https://openrouter.ai/api/v1/endpoints/zdr), [providers](https://openrouter.ai/api/v1/providers); [CoreWeave Trust](https://www.coreweave.com/trust).
Painot: [CAISI DeepSeek V4 Pro](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro), [GLM-5.2](https://www.nist.gov/news-events/news/2026/07/caisi-assessment-zais-glm-52), [GLM-5.3](https://www.nist.gov/news-events/news/2026/09/caisis-assessment-zais-glm-53-cyber-capabilities). Hinnat (yht.): [Hetzner GEX131](https://www.hetzner.com/pressroom/new-gex131/), [Scaleway Managed Inference](https://www.scaleway.com/en/inference/). Yhteenvetohaut: Baseten, Together, DeepInfra, Vertex, OpenSSF model signing, kiellot.

## 23. Ehdon täyttävät avoimet vaihtoehdot: hinta ja laatu (19.10.2026)

**Tarkistettu itse ladatuista alkuperäissivuista:** Mistral isännöi GLM 5.3:a kolmannen osapuolen avoimena mallina ("available through the global endpoint and the EU regional endpoint"; ehdon täyttämiseksi on käytettävä EU-aluepäätepistettä, ei globaalia). Artificial Analysis -listalla gpt-oss-120b (high) saa 12.

**Johtopäätös:** paras ehdon täyttävä avoin malli on GLM-5.3 Mistralin EU-päätepisteessä, AA 45, eli 13 pistettä Opus 5.5 max:n (58) alapuolella. Ehdon täyttävä yhdistelmä ei siksi ylitä Opus 5.5:tä yleisesti; prosessi (testitarkistin, rinnakkaiset yritykset, arvostelija) voi kaventaa eroa vain rajatuissa, tarkistettavissa tehtävissä. Koko kuorma maksaa ehdon täyttävillä reiteillä noin 1,5–2,1 k$/kk (Opus-listahinnalla ~4,3 k$/kk), jos välimuistialennus toteutuu; ilman sitä huomattavasti enemmän.


Osa K, haettu 19.10.2026. Ehdot: vain avoimet painot (ei Claudea), EU-alue, ZDR tai ei säilytystä, DPA (luku 22). Näyttö: R = riippumaton mittaus, V = tarjoajan/valmistajan oma luku, A = oma päätelmä tai arvio. "luettu" = alkuperäinen sivu luettu. Hinnat $/M (syöte / välimuistiluku / tuloste). Euro muunnettu $:ksi kurssilla 1 € = 1,11 $ (Hetzner-lanseeraus 889 € = 989 $, yht.). Kuorma luvusta 19: 424 M syötettä/pv (409,2 M välimuistiluku, 14,8 M tuore), 2,2 M tulostetta/pv, 22 pv/kk. Siirto/pakkaus = 70 % ja muu 30 % tokeneista (oletus: sama välimuistiosuus ja tulostesuhde, A).

#### 23.1 Laatu (AA Intelligence Index v4.3.2, [leaderboard](https://artificialanalysis.ai/leaderboards/models), R, luettu 19.10.)
Vertailukohta Opus 5.5 max 58 (high 54, medium 51). AA:n nopeus on mediaani eri tarjoajilta, ei EU-reitiltä.
| Malli (avoin) | AA | Ero Opus max | AA tok/s | AA $/tehtävä | EU-reitti (23.2) |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro | 46 | -12 | 51 | 0,13 | ei löytynyt |
| DeepSeek V4.1 Flash "1017" (max) | 45 | -13 | 227 | 0,26 | epävarma: Scalewayn versio tuntematon |
| GLM-5.3 (max) | 45 | -13 | 95 | 2,01 | Mistral EU, Scaleway |
| Kimi K3 (max) | 44 | -14 | 42 | 2,00 | ei EU-reittiä (Bedrock vain Global/US, Nebius dedikoitu hinnaton) |
| GLM-5.3-Flash | 42 | -16 | 78 | 0,28 | ei EU-reittiä löytynyt |
| DeepSeek V4.1 Flash (max) | 39 | -19 | 231 | 0,49 | Scaleway |
| Mistral Large 4 Preview (1,05T/52B) | 38 | -20 | 73 | 1,13 | Mistral EU |
| DeepSeek V4 Pro 0813 (max) | 36 | -22 | 110 | 0,67 | ei EU-reittiä löytynyt |
| Qwen3.8 27B (xhigh) | 34 | -24 | 44 | 1,01 | Scaleway, OVH, IONOS, oma ajo |
| MiniMax-M3 | 29 | -29 | 110 | 0,51 | Bedrock EU:ssa vain M2.x |
| Nemotron 3.5 Super VL / Kimi K2.7 Code | 26 / 26 | -32 | 436 / 57 | 0,19 / 0,54 | ei EU-reittiä löytynyt |
| Nemotron 3 Ultra | 23 | -35 | 147 | 0,58 | ei löytynyt |
| Qwen3.5 397B A17B / Qwen3.6 35B | 18 / 18 | -40 | 55 / 134 | 0,47 / 0,48 | Scaleway, OVH, IONOS |
| Gemma 4 26B A4B | 17 | -41 | 70 | – | Scaleway |
| Mistral Medium 3.5 | 14 | -44 | 155 | 0,50 | Scaleway, Mistral EU |
| gpt-oss-120b (high) | 12 | -46 | 265 | 0,09 | Scaleway, OVH, IONOS, Bedrock |
| Mistral Small 4 / Llama 3.3 70B | 11 / 8 | -47 / -50 | 196 / 94 | 0,02 / – | Mistral, Scaleway / useat |
SWE-bench Verified/Pro ja Terminal-Bench 2.x: riippumatonta lukua näille malleille ei löytynyt. Vain valmistajan lukuja (V): Kimi K3 TB 2.1 88,3 ja GLM-5.3 Flash TB 2.1 84,3 (luku 8), TB 4.0 GLM-5.3 41,8 vs Opus 5.5 64,8 (luku 2); bash-only SWE-bench Verified MiniMax-2.5 75,8 % vs Opus 4.5 76,8 % (R*, luku 12, vanhat mallit). Aggregaattisivuja ei käytetty. Devstral ei ole AA-listalla; Scaleway poisti Devstral 2:n 1.8.2026 (luettu).

#### 23.2 Reitit: mallit, hinta, rajat, ZDR (hinnat luettu tarjoajan sivulta, V)
| Reitti | Mallit ja hinta ($/M syöte / luku / tuloste) | Rajat, työkalut, konteksti | ZDR / sijainti (luku 22) |
|---|---|---|---|
| Scaleway Generative APIs (FR) [hinnat](https://www.scaleway.com/en/pricing/model-as-a-service/) | GLM-5.3 2,00/ei listattu/6,11; DS V4.1 Flash 0,67/0,13/2,00; DS V4 Flash 0731 0,44/0,09/0,89; Qwen3.8-27B 0,67/0,13/3,66; Qwen3.5-397B 0,67/–/4,00; gpt-oss-120b 0,17/–/0,67; Mistral Medium 3.5 1,67/–/8,33; Gemma 4 26B 0,28/–/0,56 (€ ×1,11). Ei Kimi K3, MiniMax-M3, Nemotron. Batch -50 % | [Kiintiöt](https://www.scaleway.com/en/docs/organizations-and-projects/additional-content/organization-quotas/): 200 k TPM (kortti) / 1-2 M TPM (tunnistettu), 300/600 RPM, 100 rinnakkaista; GLM-5.3- ja DeepSeek-rivejä ei taulukossa (GLM-5.2: 1 M). Tools kyllä (Qwen3.8 luettu). Konteksti 256 k | ZDR oletus, ei koulutusta; virhepyynnöt <= 2 vk |
| Mistral La Plateforme, EU-päätepiste [hinnat](https://docs.mistral.ai/inference/pricing) | +10 % EU ([lähde](https://docs.mistral.ai/inference/regional-inference)): GLM-5.3 1,54/0,154/4,84; Large 4 (1,05T, avoin) 0,75/0,077/2,30 (alehinta, lista 1,50/0,154/4,60); Medium 3.5 1,65/0,165/8,25; Small 4 0,17/0,017/0,66 | EU:ssa vain function calling; ei Batch/Agents/Files. EU-mallisaatavuus varmistettava `models.list`-kutsulla (ei tehty). Konteksti 1 M (GLM-5.3, Large 4); TPM/RPM ei löytynyt | ZDR erikseen päälle (pay-as-you-go, stateless); DPA ehdoissa; ohjaustaso ei alueellinen |
| OVHcloud AI Endpoints (FR) [katalogi](https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/) | gpt-oss-120b 0,09/0,44; Qwen3.8-27B 0,44/3,00; Qwen3.5-397B 0,67/4,00; Llama 3.3 70B 0,74 (€ ×1,11); ei välimuistihintaa | 400 RPM/projekti/malli (luettu); tools kyllä; 131-262 k | ei tallennusta |
| IONOS AI Model Hub (DE) [hinnat](https://cloud.ionos.com/managed/ai-model-hub) | gpt-oss-120b 0,17/0,71; Qwen3.8-27B 0,45/2,70; Qwen3.5-397B 0,67/4,00; Mistral Small 24B 0,11/0,33; ei välimuistihintaa | rajoja ei löytynyt; tools kyllä (Qwen3.8); 262 k | ei lokitusta |
| AWS Bedrock EU ([hinnasto](https://aws.amazon.com/bedrock/pricing/)) | EU-alueilla vain vanhempia: GLM-5 1,20/3,84 (Tukholma); DS v3.2 0,74/2,22; MiniMax M2.5 0,36/1,44; Devstral 2 123B 0,48/2,40. GLM-5.3 ja Kimi 3 vain Global/US CRIS (1,68/0,31/5,28; 3,00/0,30/15,00) = ei EU-ehto | tools-tukea ei varmistettu | `none` = ZDR |
| Nebius, dedikoitu EU | GPU-tuntihinta (23.4); julkinen token-hinta ei kelpaa (K3 3,00/15,00, GLM-5.3 1,40/4,40, ei välimuistia) | – | ZDR päälle, alue sopimuksessa |
| Azure Foundry EU DataZone, Vertex EU, Fireworks EU | **ei löytynyt** avointen mallien EU-hintoja (Azure DataZone ~10-20 % Global-hinnan päälle, hakutulos vain OpenAI-malleista; Vertex EU-monialue preview; Fireworks `us`-taso 1,5x, EU ei) | – | – |

#### 23.3 Kustannus Scopesin kuormalla, $/kk (22 pv; "70 %" = siirto/pakkaus, "30 %" = muu)
Kaava: 409,2·luku + 14,8·syöte + 2,2·tuloste $/pv. Jos välimuistihintaa ei ole listattu, luku = täysi syöte (pessimistinen, A).
| Reitti × malli | AA | Kuukausi | 70 % | 30 % |
|---|---|---|---|---|
| Scaleway DS V4.1 Flash | 39 | 1 513 | 1 059 | 454 |
| Scaleway DS V4 Flash 0731 | – | 987 | 691 | 296 |
| Scaleway Qwen3.8-27B | 34 | 1 593 | 1 115 | 478 |
| Scaleway gpt-oss-120b (luku=syöte) | 12 | 1 585 | 1 110 | 476 |
| Scaleway Qwen3.5-397B (luku=syöte) | 18 | 6 406 | 4 484 | 1 922 |
| Scaleway GLM-5.3 (luku=syöte, jos ei välimuistia) | 45 | 18 933 | 13 253 | 5 680 |
| Mistral EU GLM-5.3 | 45 | 2 122 | 1 485 | 637 |
| Mistral EU Large 4 (alehinta / lista) | 38 | 1 048 / 2 096 | 734 / 1 467 | 314 / 629 |
| Mistral EU Medium 3.5 / Small 4 | 14 / 11 | 2 422 / 234 | 1 695 / 164 | 727 / 70 |
| OVH gpt-oss-120b / Qwen3.8-27B | 12 / 34 | 850 / 4 287 | 595 / 3 001 | 255 / 1 286 |
| IONOS gpt-oss-120b / Qwen3.8-27B | 12 / 34 | 1 620 / 4 328 | 1 134 / 3 030 | 486 / 1 298 |
| Bedrock EU GLM-5 / DS v3.2 / MiniMax M2.5 | – | 11 379 / 7 010 / 3 428 | 7 966 / 4 907 / 2 399 | 3 414 / 2 103 / 1 028 |
| Vertailu, ei kelpaa: Nebius julkinen K3 / GLM-5.3 | 44 / 45 | 28 710 / 13 272 | 20 097 / 9 291 | 8 613 / 3 982 |
| Vertailu: Opus 5.5 -lista (luku 19) | 58 | ~4 270 | – | – |
Max 5x (100 $/kk) ei kelpaa ehdolle (luku 22); halvin kelvollinen laadukas rivi (Mistral EU GLM-5.3) on 21x sen hinta. TPM: kuorma on ~0,9 M tok/min keskimäärin 8 h päivänä (p90-päivä ~1,7 M); Scalewayn 1-2 M TPM on rajalla ja vaatii kiintiönnoston tai Batchin (A).

#### 23.4 Oma ajo EU:ssa
| Rauta | Kuukausihinta | Mikä mahtuu (A) | Kapasiteetti (A) |
|---|---|---|---|
| Hetzner GEX131, RTX PRO 6000 96 GB (HEL/FSN, [sivu](https://www.hetzner.com/dedicated-rootserver/gex131/), luettu) | 889 € lanseeraus; 1 197 € + 599 € setup (15.6.2026); 1 499 € (13.10.2026, epäselvä) ([wz-it](https://wz-it.com/en/blog/hetzner-gpu-server-comparison/), yht.) = 1,0-1,7 k$ | Qwen3.8-27B FP8 (~30 GB) tai gpt-oss-120b MXFP4 (~63 GB); ei molempia | Tulosteen tarve 2,2 M/pv = ~25 tok/s keskiarvo; pullonkaula on KV-muisti (~120 k keskikonteksti, ~8 rinnakkaista) ja prefill, ei dekoodaus |
| Scaleway H100-1-80G / H100-2-80G | 2 482 € / 4 876 €/kk 24/7 (luettu); laskutus vain käytön ajalta | gpt-oss-120b (vähän KV) / Qwen3.8-27B, Qwen3.6-35B | sama |
| Scaleway H100-SXM-8-80G (640 GB) | 30,06 €/h = 21 944 €/kk 24/7; ~220 h/kk = ~6 600 € | DS V4.1 Flash 284B FP8 tai GLM-5.3 FP4 (~400 GB); GLM-5.3 FP8 (744-890 GB) ei mahdu | riittää kuormalle |
| Scaleway B300-SXM-8 (2,3 TB) | 7,5 €/GPU/h = ~43 800 €/kk 24/7 ([sivu](https://scaleway.com/en/pricing/gpu), yht.) | GLM-5.3 FP8; Kimi K3 (2,8T) ei mahdu | ylimitoitettu |
| Nebius dedikoitu EU ([hinnat](https://nebius.com/prices), luettu) | H200 5,40 $, B200 8,50 $, B300 9,50 $, RTX PRO 6000 1,80 $ per GPU-h; 8xH200 = ~31 500 $/kk | K3 vaatii useita solmuja | alue sopimuksessa; US-tytäryhtiö |
Päätelmä: oma ajo ei ole halvempaa kuin API tälle kuormalle (DS V4.1 Flash 1,5 k$/kk vs. Hetzner 1,0-1,7 k$/kk laadulla AA 34), mutta antaa rakenteellisen ZDR:n. Kapasiteetit ovat arvioita, ei mitattu.

#### 23.5 Kokoonpanot (kaikki avoimia, EU, ZDR; tarkistin ajaa 10 % kokonaisvolyymistä puhtaalla kontekstilla; reititin sääntöpohjainen tai Small 4, alle 10 $/kk)
| Kokoonpano | Toteuttaja vaikeille (30 %) | Toteuttaja helpoille (70 %) | Arvostelija (eri perhe) | $/kk | Odotettu taso (A) |
|---|---|---|---|---|---|
| 1 Laatu | GLM-5.3, Mistral EU: 637 | DS V4.1 Flash, Scaleway: 1 059 | Mistral Large 4, Mistral EU: 105 (lista 210) | ~1 800 (1 900) | vaikeat AA ~45 (-13), helpot 39 (-19); noin Opus medium -6...-12 |
| 2 Yksi sopimus (Mistral) | GLM-5.3: 637 | Large 4: 734 | toisen perheen malli vuorotellen: ~160 | ~1 530 (lista ~2 300) | vaikeat 45, helpot 38; yksi toimittaja ja DPA |
| 3 Oma ajo, ei kolmatta osapuolta | Qwen3.8-27B, Hetzner A | sama kone | gpt-oss-120b, Hetzner B | ~2 000-3 300 | AA ~34 (-24); arvostelija heikko (12), vain testit ovat vahva portti |
Kokoonpanojen yhdistelmälaatua ei ole mitattu; luvun 20.4 mukaan kehys ja ajetut testit painavat enemmän kuin mallivalinta, ja GLM-Mistral-pari täyttää "eri perhe" -vaatimuksen.

#### Mitä tästä seuraa
1. Paras ehdon täyttävä laatu on GLM-5.3 (AA 45, -13 Opus 5.5 max:stä) Mistralin EU-päätepisteestä, 2,1 k$/kk koko kuormalle; Kimi K3 (44) ja MiMo (46) eivät ole saatavilla ehdon täyttävää reittiä pitkin. Opus-tasoa ei saavuteta: ero on 12-14 pistettä parhaillakin.
2. Halvin riittävä helpoille: DeepSeek V4.1 Flash Scalewayssa (AA 39, ~1,06 k$/kk siirto- ja pakkauskuormalle, välimuistihinta listattu). gpt-oss-120b (AA 12) ja Qwen3.5-397B (18) ovat liian heikkoja, vaikka hinta on matala; Qwen3.8-27B (34) on paras pieni malli ja mahtuu yhdelle 96 GB:n GPU:lle.
3. Luvun 22 oletus "gpt-oss riittää pieneen rooliin" kumoutuu AA:n mukaan (12); pieneen rooliin Qwen3.8-27B, reitittimeksi Small 4.
4. Välimuistihinta ratkaisee: Scalewayn GLM-5.3:lle ei ole listattu välimuistihintaa (jopa 18,9 k$/kk), Mistralilla on (2,1 k$/kk). Vahvista ennen sopimusta; Scalewayn TPM-kiintiö on rajalla.
5. Ei löytynyt: Azure/Vertex/Fireworks EU:n avointen mallien hinnat, Mistralin TPM/RPM, riippumattomat SWE-bench/TB-luvut uusille avoimille malleille, Scalewayn DeepSeek-version vastaavuus AA:n "1017"-versioon, Nebius dedikoidun hinta, GLM-5.3-Flashin EU-reitti.
