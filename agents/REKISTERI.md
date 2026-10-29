# scopes/agents/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: AGENTS-ESITIEDOT-YLLAPITO — esitiedot valmiit (`scopes/agents/ESITIEDOT.md` luvut 1–23) ja arkkitehtuurisuunnitelma luovutettu skoopille `scopes agents architecture` 19.10.2026; täydennä esitietoja, kun arkkitehtuuriskooppi pyytää (esim. sopimusehdot, mittaukset) — polut: scopes/agents/** — aloitus: /pura scopes agents — automaattinen: kyllä

## Tarkoitus ja raja

**Tarkoitus:** agenttien ja malliyhdistelmien hallinta Scopes-sovellukseen (käyttäjä 19.10.2026).

**Raja:**
- Sisällä: agenttiputket ja malliyhdistelmät (useampi malli tai vaihe yhdessä prosessissa), niiden suunnittelu, vertailu ja mittaus Scopes-sovellusta varten.
- Ulkona: yksittäisen mallin valinta, käsittely ja validointi äpissä (`scopes models`), jumissa-istunnon mallivalinta (`scopes istunnot mallit`), mallin ajoympäristö ja Nebius-välityspalvelin (`scopes istunnot`), äpin käyttöliittymä (`scopes ios`, `scopes macos`). Muutos näihin kirjataan omistajalle `/vika <skooppi> …` (TYÖTAVAT sääntö 15).

## Päätökset

- **Käyttäjä 19.10.2026:** skooppi `scopes agents` luotiin komennolla `/pura uusi scopes agents`.
- **Käyttäjä 19.10.2026:** tarkoitus on hallinnoida agentteja ja malliyhdistelmiä Scopes-sovellukseen; ensimmäinen tehtävä on esitiedot avoimiin malleihin pohjautuvasta yhdistelmästä, joka ylittää Opus 5.5:n älykkyyden ja on nopeampi ja edullisempi (paketti AGENTS-ESITIEDOT).
- **Käyttäjä 19.10.2026:** selvityksen osa-alueet ovat (1) kattava haku käyttäjien toteutuksista ja keskusteluista, (2) mallit ja palveluntarjoajat, (3) yhdistelmän rakenne ja (4) integraatio ja riskit. Osa-alue "tavoite ja mittari" jätettiin pois.
- **Käyttäjä 19.10.2026: ehdoton ehto.** Yhdistelmän on oltava tietoturvallinen ja sovelluttava arkaluontoiselle yritysdatalle. Ehto rajaa jokaisen mallin, tarjoajan, reitin ja roolin; laatu, hinta ja nopeus optimoidaan vasta sen sisällä.
- **Käyttäjä 19.10.2026:** arkkitehtuurisuunnitelma tehdään omassa skoopissaan `scopes agents architecture`, jolle esitietopaketti välitettiin.
- **Käyttäjä 19.10.2026:** yhdistelmä koostuu vain avoimen lähdekoodin (avoimien painojen) malleista. Claude ei ole osa yhdistelmää missään roolissa (ei suunnittelija, arvostelija eikä varamalli); Opus 5.5 on vain vertailukohta, joka ylitetään.

- **19.10.2026:** Käyttäjä 19.10.2026: ehdoton ehto on tietoturva ja sopivuus arkaluontoiselle yritysdatalle.

- **19.10.2026:** Käyttäjä 19.10.2026: yhdistelmä vain avoimien painojen malleista; Claude ei missään roolissa, Opus 5.5 vain vertailukohta.

- **19.10.2026:** Käyttäjä 19.10.2026: arkkitehtuurisuunnitelma omassa skoopissaan `scopes agents architecture`; `scopes agents` ylläpitää esitietoja pyynnöstä.

- **19.10.2026:** Osa-alue "tavoite ja mittari" jätettiin pois esitiedoista (käyttäjä 19.10.2026); tavoite jää arkkitehtuuriskoopin ensimmäiseksi kysymykseksi.

- **21.10.2026:** Vastaus tallennetaan Driveen uutena dokumenttina (käyttäjä valitsi), ei repoon.

- **21.10.2026:** Arvio synteesistä: tietoturvakohta (maskaus sopimuksen sijaan) rikkoo sitovan ehdon, kunnes ZDR/DPA/EU-sijainti on kirjattu lähteineen; konteksti-väite ja PostgreSQL-checkpointit vaativat mittauksen.

- **22.10.2026:** Käyttäjä: vastaukset kirjoitetaan Driveen; Vastaus 3:n kustannusarvio kirjataan rekisteriin (alla Avoimet asiat). Vastaus 2:n päätökset (tiedostopohjainen tila, kehitys- ja tuotantovaihe) ja Vastaus 4:n roolijakoehdotus kuuluvat arkkitehtuuriskoopin rekisteriin, ei tänne (TYÖTAVAT 15).

## Tila (mitattu, 22.10.2026)

- Kustannusarvio (Vastaus 3): tehtäväkoko aliagentti med 1,4 M, p90 4,8 M (`ESITIEDOT.md:996`); 30 tehtävää × 3 kokoonpanoa × 1,3 uusinta ≈ 82 tehtäväyksikköä per malli. GLM-5.3 170–570 $, GLM-5.3-Flash 19–61 $, DeepSeek V4.1 Flash 39–120 $, Kimi-K3 390–1 230 $; suositeltu kolmikko ~230–750 $; esikoe 5 × 3 Flashilla ≤ 15 $.
- Nebiuksen alueet (`ESITIEDOT.md` 20.2): GLM-5.3, GLM-5.3-Flash ja DeepSeek V4.1 Flash us-north1; Qwen3.8-27B us-central1; EU:ssa vain Kimi-K3 (eu-west2) ja gpt-oss-120b (eu-north1). Ristiriita: Kimi K3 eu-west2 (:167, :1078) vs. "ei EU-reittiä" (:1370). GPU-tuntihinta ei ole julkinen (:1298).
- Oma kuorma: siirto ja pakkaus ~70 %, aliagentit 24,6 % (tuloste 2,4 %), koodaus 3,4 % (`ESITIEDOT.md:997`, :1004–1006); jos ~95 % luku- ja siirtotyöstä menee Flashille, syötteen keskihinta ~0,22 $/M vs. 1,40 $/M (yläraja −84 %).
- Kimi K3: AA 44, 3/15 $/M, pääsilmukkana ~1 305 $/pv (`ESITIEDOT.md:1091`); tarkistajana ~0,23 $/tarkistus (50 k syöte + 5 k tuloste); K2.6 tuomarina 84,3 BAcc (:675); ansatehtävät K3 ~36 % vs. Opus 4.8 ~8 % (:97); injektio K2 Thinking 4,8 % vs. Opus 4.5 0,5 % (:910).
- Nebius-välityspalvelin 22.10.2026 (tmux `siirto-scopes-agents-ds41flash-100818`): "API Error: 400 kustannuskatto ylittyisi … (päivän katto 0.0000 $ …)"; katto-tiedostoa ei ole. Skooppi `scopes agents ds41flash` luotiin käsin `luo-skooppi.mjs`:llä (commit 0c4d483d); palvelin lukee `skoopit.json`:n joka pyynnöllä (`scopes/palvelu/palvelin.mjs:267`, `lahteet.mjs:65`).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Esitiedot avoimen mallin yhdistelmästä | valmis 19.10.2026: `ESITIEDOT.md` luvut 1–23. Ehdon täyttävä paras: GLM-5.3 Mistral EU (AA 45 vs. Opus 58); helpoille DeepSeek V4.1 Flash Scaleway (AA 39); kokoonpanot ~1,5–2,1 k$/kk (luku 23); Scalewayn GLM-välimuistihinta ja TPM-kiintiö vahvistamatta **19.10.2026:** Esitiedot 20.2: Nebius ei anna välimuistialennusta millekään mallille; virallinen `tokenfactory.nebius.com/api/public/models_info` (28 mallia, 19.10.2026) ei sisällä välimuistihintaa; Esitiedot 22: Claude Max -kuluttajaehdot (anthropic.com/legal/consumer-terms, haettu 19.10.2026) sisältävät ehdon "Non-commercial use only …" ja koulutuksen vaikka opt-out → Max 5x ei kelpaa arkaluontoiselle yritysdatalle; Esitiedot 21: tilaus on Max 5x (`~/.claude.json` rateLimitTier default_claude_max_5x); käyttö osuu rajoihin; Esitiedot 19: oma kuorma 25.9.–19.10.2026 on 424 M syötettä/pv (96,5 % välimuistista) ja 2,2 M tulostetta/pv; siirto ja pakkaus 70 % tokeneista; Esitiedot 23: paras ehdon täyttävä avoin malli on GLM-5.3 Mistralin EU-aluepäätepisteessä, AA 45 vs Opus 5.5 max 58 (Mistralin sivu tarkistettu); Esitiedot 20.1: vastakkainen tarkistus — 12 väitteestä vain Nebiuksen välimuistialennus oli epätosi. | luovutettu `scopes agents architecture` -skoopille 19.10.2026 (`scopes/agents/architecture/ESITIETOPAKETTI.md`); arkkitehtuuri jatkaa paketista AGENTS-ARK-01; täydennä pyynnöstä (sopimusehdot Mistral ja Scaleway: ZDR, DPA, välimuistihinta, käyttörajat; mittaukset) |
| Nebiuksen ZDR/DPA/sijainti lähteineen | ratkaistu esitiedoista 22.10.2026 (`ESITIEDOT.md` rivi 1272, haettu 19.10.2026): julkinen päätepiste ei täytä ehtoa (Region Global, säilytys oletuksena, US-alihankkijat); dedikoitu EU-päätepiste kelpaa ehdoin (alue sopimuksessa DPA 6.1, ZDR organisaatiotasolla, DPA+SCC julkinen); Nebius ei anna välimuistialennusta, joten 96,5 % säästää vain dedikoidussa (GPU-tunti) — vastaus Driveen 22.10.2026 (id 1QsJiqKdiOIdOM8Nki8MZOY59YGnkIjWuF6daXX3EtKQ) | avoin vain: dedikoidun EU-päätepisteen GPU-tuntihinta ja onko etuliitevälimuisti päällä; arkkitehtuuriskooppi |
| Koesuunnitelman kustannusarvio (Vastaus 2 -dokumentin koe: 30 tehtävää × 3 kokoonpanoa) | arvioitu 22.10.2026 esitietojen hinnoista (`ESITIEDOT.md` 20.2) ja tehtäväkoosta (aliagentti med 1,4 M, p90 4,8 M): GLM-5.3 + GLM-5.3-Flash + DeepSeek V4.1 Flash ~230–750 $; esikoe 5 × 3 Flashilla ≤ 15 $; lisäksi puuttuva Opus-vertailuajo ja kustannus per hyväksytty — vastaus Driveen (id 1icaF3-vXN8hoig1TJlwFfZRm74Q4-ZSBDJDZbSHWtAc) | odottaa käyttäjää: kustannuskatto ennen ensimmäistä maksullista kutsua; testisarjan lähde |
| Roolijako vahvuuksien mukaan, Kimi K3, kevyiden mallien työnjako | vastattu 22.10.2026 (Drive id 1oKNamB_ZvhKpQjvg_IoDJUX_obsvV6Vp8hP7air19LQ): GLM-5.3 pääagentti; Flash-mallit haku ja siirto; rekisterit skriptillä; Kimi K3 eri malliperheen tarkistaja/Red Team/eskalointi (~0,23 $/tarkistus), ei pääsilmukka (~1 305 $/pv); lisäkokeet hakutyöntekijä ja tarkistaja | avoin: Kimi K3:n Nebius-alue eu-west2 (`ESITIEDOT.md` :167) vs. "ei EU-reittiä" (:1370) — ristiriita tarkistettava |
| Läpäisyosuus kontekstikoon mukaan omalla tehtäväsarjalla | avoin | arkkitehtuuriskooppi |
| Tiedostopohjainen tila vs. tietokanta, mittaus yhdellä tehtäväluokalla | avoin | arkkitehtuuriskooppi |
| Nebius-kustannuskatto 0 $ (`~/.config/scopes/nebius-katto.json` puuttuu, koodin oletus fail-closed) | avoin; odottaa käyttäjää (kirjattu 22.10.2026; ds41flash-istunto, DeepSeek V4.1 Flash, ei pääse työskentelemään) | käyttäjä antaa kovan katon (summa), sitten kirjoitetaan katto-tiedosto; katto-asetusta ei aseteta itse; chat-tila `scopes agents ds41flash` testaamatta (tarvitsee avaimen) |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agents/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
