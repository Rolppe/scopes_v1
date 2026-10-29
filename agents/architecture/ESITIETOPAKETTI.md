# scopes agents architecture — esitietopaketti

Luovuttaja: `scopes agents` 19.10.2026. Täysi aineisto lähdelinkkeineen on tiedostossa `scopes/agents/ESITIEDOT.md` (luvut 1–23, noin 1 400 riviä; omistaja `scopes agents`, ei muokata täällä). Tämä paketti tiivistää sen arkkitehtuurisuunnitelmaa varten. Luvut viittaavat ESITIEDOT-tiedoston lukuihin. Näyttöluokat: R = riippumaton mittaus, V = valmistajan tai tekijän oma luku, A = anekdootti.

## 1. Käyttäjän ehdot (sitovat)

1. **Ehdoton:** yhdistelmä on tietoturvallinen ja sopii arkaluontoiselle yritysdatalle (käyttäjä 19.10.2026). Ehto rajaa jokaisen mallin, tarjoajan, reitin ja roolin; laatu, hinta ja nopeus optimoidaan vasta sen sisällä.
2. **Vain avoimien painojen mallit.** Claude ei ole mukana missään roolissa (ei suunnittelija, arvostelija eikä varamalli). Opus 5.5 on vain vertailukohta (käyttäjä 19.10.2026).
3. **Alkuperäinen tavoite:** ylittää Opus 5.5:n älykkyys, nopeampi ja halvempi. Tavoitetta ja mittaria ei ole vielä tarkennettu (luku 20.7); näyttö ei tue yleistä ylittämistä (kohta 4).

## 2. Kelpaavat reitit (luku 22–23)

| Reitti | Tila | Huomio |
|---|---|---|
| Mistral La Plateforme, **EU-aluepäätepiste** | kelpaa ehdoin (ZDR, DPA) | GLM 5.3 isännöity; globaali päätepiste ei kelpaa |
| Scaleway Generative APIs (EU) | kelpaa ehdoin | DeepSeek V4.1 Flash, GLM-5.3; TPM-kiintiö 1–2 M/min on kuorman rajoilla; GLM:n välimuistihinta vahvistamatta |
| IONOS, OVH (EU) | kelpaa ehdoin | vain gpt-oss-, Qwen- ja Llama-luokkaa |
| Nebius dedikoitu EU-päätepiste | kelpaa ehdoin | hinta selvittämättä |
| Bedrock EU, Azure DataZone EU, Vertex EU | kelpaa ehdoin | GLM-5.3 ja Kimi Bedrockissa vain Global/US-profiililla |
| Oma ajo EU:ssa (Hetzner, Scaleway GPU) | kelpaa | rakenteellinen ZDR; Qwen3.8-27B mahtuu 96 GB GPU:lle; kärki-MoE vaatii 8×B300, ~30–45 k$/kk (A) |
| **Ei kelpaa** | | Claude Max -kuluttajatilaus ("Non-commercial use only", tarkistettu), Nebiuksen julkinen päätepiste (nykyinen `scopes/palvelu/nebius-valitys.mjs`-reitti: alue Global, säilytys oletuksena), OpenRouter (ZDR-merkki ei ole lainkäyttöalue), kiinalaisten laboratorioiden omat API:t, US-tarjoajat ilman aluevalintaa (Together, DeepInfra, Baseten, CoreWeave) |

## 3. Mallit ehdon sisällä (AA-indeksi v4.3.2; Opus 5.5 max = 58)

| Malli | AA | Reitti | Rooliehdokas |
|---|---|---|---|
| GLM-5.3 | 45 | Mistral EU | vaikeat tehtävät |
| Mistral Large 4 | (luku 23) | Mistral EU | arvostelija eri malliperheestä |
| DeepSeek V4.1 Flash | 39 | Scaleway | helpot tehtävät, siirto ja pakkaus |
| Qwen3.8-27B | 34 | oma rauta | oma ajo, pieni rooli |
| gpt-oss-120b | 12 | IONOS, OVH, oma | liian heikko pääroolin |

Kimi K3 (44) ja MiMo-V2.6-Pro (46) eivät ole saatavilla ehdon täyttävää reittiä pitkin.

## 4. Mitä näyttö sanoo prosessista (luku 20.4, tarkistettu luvussa 20.1)

- **Kehys painaa enemmän kuin roolijako:** sama Kimi K2 sai 44–71 % kehyksen mukaan; roolijako itsessään ~+2,5 p (V). Kevyt bash-kehys vei MiniMax M2.5:n SWE-bench Verifiedillä 75,8 %:iin (R).
- **Lisäagentit tuottavat tappiota,** kun yksittäinen agentti on jo yli ~45 % (R). Rinnakkaiset aliagentit häviävät rajatuissa koodaustehtävissä: Claude Code −24 pp, tokenit 1,4–3,3× (R).
- **Hyödyllinen lisärooli:** arvostelija puhtaalla kontekstilla, eri malliperheestä (V, A). Toteuttajan ja tarkistajan malli merkitsee enemmän kuin suunnittelijan (R).
- **Tarkistus:** ajetut testit ovat ainoa vankka signaali koodissa. LLM-tuomari yksin on heikko portti (R). Testit eivät todista, jos sama malli kirjoitti koodin ja testit (A).
- **Budjetti:** 2–4 rinnakkaista yritystä testikarsinnalla vaikeissa tehtävissä; kova korjausyrityskatto ja varhainen tarkistus (R). Harness-evoluutio ja automaattinen MAS-haku häviävät yksinkertaiselle otannalle (R).
- **Konteksti:** havaintojen maskaus ennen tiivistystä (R, yksi malli). Malli ei vaihdu kesken tehtävän, koska välimuisti nollautuu (~8 % osumat vaihdon jälkeen, R).
- **Ei nyt:** väittely, äänestys, agenttiparvi koodissa, automaattinen prosessihaku.

## 5. Avoimien mallien erityisriskit (luvut 15, 18)

- Työkalukutsut: vLLM- tai SGLang-ajossa `response_format`-skeema ja työkalut yhdessä pudottavat kutsut 0 %:iin (R). Korjaus: kaksivaiheinen ajo, skeemavalidointi, katko peräkkäisten virheiden jälkeen.
- Kehoteinjektio: avoimet mallit 4–10× alttiimpia (R, vanhat mallit). Rakenteelliset suojat: vähimmät oikeudet rooleittain, epäluotettava syöte omaan rooliinsa, skeemoitu roolien välinen viestintä, tiedosto- ja verkkoeristys.
- GLM-5.3 on CAISI:n mukaan kyberkyvyiltään vahvin avoin malli: roolin oikeudet rajattava.
- Ylläpito: avoimista malleista uusi versio 2–4 viikon välein; hiljaiset laatumuutokset tarjoajittain. Kiinteä testisarja viikoittain, varjoajo, varamalliketju, uudelleenyritys vain yhdessä kerroksessa.

## 6. Kuorma ja kustannus (luvut 19, 23)

- Kuorma 25.9.–19.10.2026: 424 M syötettä/pv (96,5 % välimuistiluettavaa), 2,2 M tulostetta/pv. Siirto ja pakkaus 70 % tokeneista, aliagentit 24 %, koodaus 3,4 %.
- Välimuistialennus ratkaisee hinnan. Ehdon täyttävät kokoonpanot ~1,5–2,1 k$/kk koko kuormalle, jos välimuistialennus toteutuu; ilman sitä moninkertainen (Scaleway GLM-5.3 jopa 18,9 k$/kk).
- Suurin säästökohde on siirto ja pakkaus: rakenteinen ja skriptillä tarkistettava.

## 7. Integraatiopiste repossa (luku 10)

- `scopes/palvelu/nebius-valitys.mjs` kääntää Claude Coden Anthropic-kutsut OpenAI-muotoon, laskee hinnat ja katon. Reititin ja varamallit kytkeytyisivät sen pyyntökäsittelijään. Tiedosto kuuluu `scopes istunnot` -skoopille.
- Nykyinen reitti (Nebius julkinen) ei täytä ehtoa. Avain näkyy etäkoneen prosessilistassa (`nebius-valitys.mjs:171`, kirjaamatta omistajalle).
- Scopes-palvelu on Node ilman npm-riippuvuuksia; suositus oma ohut ohjain, ei raskasta kehystä (luku 16). MCP ainoa tarvittava protokolla.
- Rajanaapuri: `scopes architecture` omistaa Scopes-äpin monialusta-arkkitehtuurin (`scopes/architecture/SUUNNITELMA.md`, K-1…K-8). Agenttiarkkitehtuurin kytkökset siihen sovitetaan, ei päällekkäisyyttä.

## 8. Avoimet kysymykset suunnitelmalle

1. Tavoite ja mittari: rajatuissa tehtävissä Opuksen taso, lisäkapasiteetti vai nopeus (käyttäjän päätös).
2. Sopimukset: Mistralin ja Scalewayn ZDR, DPA, välimuistihinta ja käyttörajat vahvistettava ennen kokoonpanon lukitsemista.
3. Mittaus: oma tehtäväsarja (vähintään ~110–260 tehtävää 10 pp:n eron erottamiseen, luku 17), Opus 5.5 vertailuna; maksullinen katto käyttäjän hyväksyttäväksi.
4. Siirto- ja pakkaustehtävien kelpoisuus halvalle mallille ja skriptitarkistimelle.
5. Oma ajo vs. API: milloin rakenteellinen ZDR on pakollinen.
