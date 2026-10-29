# scopes toteutussuunnitelma — löydökset E-1…E-6

Kerätty 19.10.2026 paketissa TOTEUTUSSUUNNITELMA-ESITIEDOT. Kysymykset: `ESITIEDOT.md`. Tämä on suunnitelman (`SUUNNITELMA.md`) lähtöaineisto; päätökset tehdään suunnitelmassa.

## E-1 Aliagenttien keinot

Lähteet: Agent-työkalun määritys (istunnon työkalulista), `Infra/agents/siirtaja-sonnet.md` (`.claude/agents/` on symlinkki), `~/.claude/agents/{toteuttaja-sonnet,toteuttaja-opus,rd-context}.md`, `claude/subagents/SAANTO.md`, `claude/subagents/KARTOITUS.md`, `claude/r&d2/tools/{agent-state,dispatch,dispatch-pid}.mjs`, `~/.claude/skills/rd/SKILL.md`. Kartoitti Explore-sonnet; ratkaisevat väitteet tarkistettu (tiedostojen olemassaolo, agent-state.mjs:n tilakoodit).

**Agent-työkalu (tämän istunnon keinot, harness):**

| Keino | Miten | Huomio |
|---|---|---|
| Malli per ajo | `model: sonnet \| opus \| haiku \| fable` tai agenttimäärityksen frontmatter | fork perii aina pääistunnon mallin |
| Tausta-ajo | aliagentti ajaa aina taustalla; valmistuminen tulee task-notificationina `<usage>`-lohkoineen (tokenit, kesto, työkalukutsut) | kesken ajon ei näy tokeneita eikä hintaa (SUBAGENTS-HINTA auki, `claude/subagents/REKISTERI.md:5`) |
| Rinnakkaisuus | useita Agent-kutsuja samassa vastauksessa; Workflow-työkalu (`pipeline`/`parallel`, oletusraja 10 agenttia) vain käyttäjän nimenomaisella pyynnöllä | ei lukkoja: rinnakkaiset aliagentit kirjoittavat samaan pääpuuhun |
| Eristys | `isolation: "worktree"` (oma git-worktree, siivotaan jos muuttumaton); ei käytössä missään nykyisessä taidossa tai agentissa | ratkaisu E-4:n tiedostopäällekkäisyyksiin |
| Jatkaminen | `SendMessage` samalle agentille säilyttää sen kontekstin; uusi Agent-kutsu alkaa tyhjästä | |
| Raportti | hand-back-viesti on pääistunnon ainoa näkymä; muoto määrätään promptissa (toteuttajilla kiinteä 6-rivinen `## Report`, rd-contextilla pohja + tarkistin) | raportti ei ole todiste: valvoja ajaa hyväksynnän itse (SAANTO.md:14-16, TYÖTAVAT 5) |
| Seuranta | `node "claude/r&d2/tools/agent-state.mjs" status\|wait <agentId>` lukee aliagentin transkriptia: done 0, none 1, interrupted/stalled 3, timeout 4 (oletus 3 h), ask 5 | vain tarkkailee, ei pysäytä; `--stale` 1800 s |
| Pysäytys | TaskStop-työkalu; käyttöraja-vahti estää uudet Agent-ajot 98 %:ssa ja kaikki työkalukutsut 99 %:ssa (`Infra/hooks/kayttoraja-vahti.py:16-35`) | ei aikarajaa Agent-aliagentille |
| Committi | aliagentti ei committoi; pääistunto committoi (CLAUDE.md:15) | |

**Agenttimääritykset (asennetaan `bash Infra/skills/install.sh`, kopiota ei muokata):**

- `siirtaja-sonnet` — sonnet; Read/Edit/Write/Bash/Grep/Glob; ei git add/commit/push (`Infra/agents/siirtaja-sonnet.md:4-25`).
- `toteuttaja-sonnet` / `toteuttaja-opus` — malli kiinteä; syöte tasan yksi brief-tiedosto; 6-rivinen `## Report`; kielletty `|| true`, `git add -A`, freeze-guard-tiedostot (`~/.claude/agents/toteuttaja-*.md:4-27`). Ne on tehty rd-taidon briefeille, mutta brief-muoto (Task/Files/Contract/Do/Acceptance) on käytettävissä ilman rd-taitoa.
- `rd-context` — sonnet; kiinteä raporttipohja ≤ 150 riviä, tarkistin `check-context.mjs` (`~/.claude/agents/rd-context.md:4-50`).
- `Explore` (harness) — lukutyö, ei Edit/Write.

**r&d2:n dispatch-ketju (`claude/r&d2/tools/dispatch.mjs`)** ajaa briefin `claude -p` / `agy -p` -prosessina eristetyssä worktreessä, `--land` harvestaa `may:`-listan tiedostot pääpuuhun, `--timeout` (vain agy), `--budget-usd`, eskalaatio hard = opus `--effort high` enintään 2 kierrosta, `dispatch-pid.mjs wait` valvoo pidfileä (done 0 / lost 3 / timeout 4). Käyttäjän päätös 19.10.2026: toteutus ei käytä rd-taitoa; dispatch.mjs on rd-taidon työkalu (`claude/r&d2/`), joten sen käyttö tässä skoopissa on suunnittelijan päätös, ei oletus.

**Mittaussäännöt:** CLAUDE.md:5-14 (delegoi vain mekaaninen ja laaja; Explore lukutyöhön, muu sonnet, haiku vain mitatusti; viittaa tiedostoon, älä kopioi, H-069 ~3,7 k tokenia/ajo); jokaisesta ajosta mittausrivi (`ajajat.jsonl`, `delegation.jsonl`).

**Puutteet (suunnitelman ratkaistava):**

1. Ei tokeni- tai hintanäkymää kesken ajon; Agent-ajojen hinta on kirjanpidossa null. → Kustannuskatto vaiheittain toteutetaan jälkikäteen `<usage>`-lohkosta per tehtävä.
2. Ei aikarajaa eikä automaattista pysäytystä Agent-aliagentille. → Valvoja ajaa `agent-state.mjs wait --timeout` taustalla ja TaskStop ylityksessä.
3. Ei worktree-eristystä nykyisissä taidoissa; rinnakkaiset aliagentit kirjoittavat samaan puuhun (V-189/V-200-jäänteitä). → `isolation: "worktree"` tai dispatch.mjs rinnakkaisille koodipaketeille.
4. Ei yhtä valvontatyökalua: agent-state (Agent) ja dispatch-pid (dispatch) ovat erilliset.
5. Delegointisäännöillä ei ole takaisinkytkentää (ei hookia, joka tarkistaa mallin Agent-kutsussa; SAANTO.md:18).

## E-2 Mallien mitattu suoriutuminen

Lähteet: `claude/siirto/mittaukset/ajajat.jsonl` (1 306 riviä; kentät pvm, skooppi, moottori, malli, sekunnit, tokenit; pura-riveillä `pisteet` 0–6 ja `viat`, pakkausriveillä `toiminto: "pakkaa"`; skeema `claude/siirto/tools/ajajat-loki.mjs:14-15`), `vaihevirheet.jsonl` (828 riviä, vain pakkaus: vaihe A/B/C, tulos hylätty/korjattu/epäonnistui), `claude/subagents/SAANTO.md`. Laski sonnet-aliagentti (skripti scratchpadissa); pääistunto laski 6/6-osuudet uudelleen: täsmäävät.

**Taulu 1 — pura (keskustelun purku, raportin täydellisyys 6/6), ilman 5 `virheellinen`-riviä:**

| Malli (moottori) | n | 6/6 % | pisteet ka | tokenit med | tokenit p90 | s med | s p90 |
|---|---|---|---|---|---|---|---|
| gemini-3.8-flash-medium (agy) | 331 | 91 | 5,89 | 21 013 | 250 909 | 25 | 88 |
| siirtaja-sonnet (Agent-työkalu) | 349 | 63 | 5,38 | 105 723 | 158 228 | 133 | 328 |
| claude-haiku-5-5 (claude -p) | 236 | 54 | 5,20 | 539 194 | 792 571 | 64 | 92 |
| sonnet (claude -p) | 1 | 0 | 3,00 | — | — | — | — |

**Taulu 2 — pakkaus (ei pisteitä; vain tokenit ja kesto):** claude-sonnet-5-5 (claude -p) n=251, tokenit med 143 237, s med 43; flash-medium (agy) n=119, tokenit med 202 069, s med 271; haiku n=4; flash-low n=10 (ei johtopäätöksiä).

**Taulu 3 — pakkauksen vaihevirheet per malli** (rivi = vaiheen yritys; vain hylkäykset ja korjaukset tallennetaan, joten onnistumis-%:a ei ole):

| Malli | rivejä | hylätty | korjattu | epäonnistui | korjattu/hylätty | hylätty A/B/C |
|---|---|---|---|---|---|---|
| gemini-3.8-flash-medium | 372 | 250 | 116 | 6 | 46 % | 102 / 43 / 105 |
| claude-sonnet-5-5 | 417 | 257 | 158 | 2 | 61 % | 30 / 9 / 218 |
| claude-haiku-5-5 | 24 | 18 | 6 | 0 | 33 % | 0 / 0 / 18 |

Yleisimmät viat purussa: haiku `faktat` 36 % pisteytetyistä, siirtaja-sonnet 26 %, flash 5 %. Pakkauksessa sonnetin virheet ovat lähes kaikki C-vaiheen rekisteririvin sijoitusvirheitä ("rivi ei ole kohdan aihe" 202, "avain osuu N riviin" 98); flashin suurin virhe on tyhjä vastaus (101) ja agy-yhteysvirhe (48).

**Mitä datasta ei voi päätellä (suunnitelman rajoitteet):**

1. **Opuksesta ja Fablesta ei ole yhtään mittausriviä.** Roolipäätös (valvoja Opus, päätoteuttajat Opus ja Sonnet) ei nojaa tämän repon mittauksiin vaan käyttäjän päätökseen. Ensimmäiset Opus-tehtävät mitataan.
2. **Koodin kirjoittamisesta ei ole mittauksia millään mallilla.** Kaikki data on purku- ja pakkaustyötä (rekisterien luku ja kirjoitus). Ainoa koodimittaus on r&d2:n `delegation.jsonl` (ei tässä laskettu; rd-taito ei ole käytössä). Mallin valinta koodipaketteihin on siis arvio, ja pilottitehtävä per malli on tarpeen ennen laajaa delegointia.
3. **Hintaa ei ole datassa.** `tokenit` on yksi luku, jonka määritelmä eroaa moottoreittain (agy 21 k, Agent 106 k, haiku-cli 539 k samasta tehtävästä), joten mallien tokenivertailu on epäluotettava. SAANTO.md:n Agent-purun hinta-arvio 0,38–0,58 $ (V-159) on ainoa dollariluku.
4. **Malli ja reitti sekoittuvat:** haiku ja claude-sonnet-5-5 vain `claude -p`-reitillä (12.–19.10.), siirtaja-sonnet vain Agent-reitillä (21.9.–14.10.), flash vain agy:llä. Jaksot eivät mene päällekkäin.
5. Haiku: 54 % 6/6 (n=236) — SAANTO.md:n 48 % (n=29) oli varhainen näyte; suunta sama. Haikun `faktat`-vikaosuus 36 % tukee sääntöä "vain koneellisesti tarkistuviin tehtäviin".
6. Pisteet mittaavat purkuraportin täydellisyyttä (arvioi-purku.mjs), eivät tehtävän lopputulosta; arvioijassa on ollut omia vikoja (J0-TODENNUS-2026-10-02.md).

## E-3 Resurssirajat

Mitattu 19.10.2026 klo 10:44 (`nproc`, `/proc/cpuinfo`, `free -m`, `df -h`, `ps`, `ssh dev-host`).

| Resurssi | palvelin | Mac | palvelin |
|---|---|---|---|
| Suoritin | Qualcomm SM8150, 8 ydintä (4 × A76-luokka 0x804, 4 × A55-luokka 0x805), aarch64 | Apple M2 Pro, 10 ydintä | ei tavoitettu (`No route to host` 192.0.2.99) |
| Muisti | 7 460 MB, josta vapaana 2 943 MB; swap 3 071 MB, käytössä 743 MB | 16 GiB | — |
| Levy | 166 G vapaana / 209 G | 160 Gi vapaana / 926 Gi (83 % käytössä) | — |
| Kuorma | load 3,0 (6 pv päällä); 9 `claude`-prosessia yhteensä 2 821 MB RSS; 19 tmux-istuntoa | — | — |
| Käyttöjärjestelmä | Debian 13 trixie | macOS 27.0.1 (26A434) | — |
| Työkalut | Node v22.23.3; **ei** rustc/cargo/rustup | Xcode 27.1 (27A9275); simulaattori iPhone 15 Pro iOS 27.0 käynnissä; **ei** rustc/cargo/rustup | — |
| Portit | 8787 varattu: `node` pid 14262 (palvelin.mjs); 8788 vapaa | — | — |

Johtopäätökset rinnakkaisuudelle (suunnittelija päättää):

- **Muisti on pullonkaula palvelimella**: Claude-istunnot vievät jo ~2,8 GB ja vapaana on ~2,9 GB. Rust-käännös (axum + rusqlite, debug) tarvitsee tyypillisesti 1–3 GB ja `rustc` rinnakkaiskäännös kuluttaa yhden prosessin per koodegen-yksikkö. Käännös ajetaan rajattuna (`cargo build -j2` tai `CARGO_BUILD_JOBS=2`), ei samaan aikaan toisen käännöksen kanssa, eikä samaan aikaan monen uuden Claude-istunnon kanssa. Mittaus ensimmäisellä käännöksellä (`/usr/bin/time -v cargo build`) ennen rinnakkaisuuspäätöstä.
- **Yksi Mac, yksi simulaattori**: iOS/macOS-gatet (UI-testit) eivät aja rinnakkain keskenään; ne varaavat Macin. Rust-käännös Macilla (ARK-08 XCFramework) kilpailee Xcoden kanssa mutta mahtuu 16 GiB:iin.
- **Portti 8787** on tuotannossa Node-palvelulla; ARK-04:n `scopes-solmu` testataan toisella portilla (esim. 18787) kunnes ARK-06 siirtää Noden 8788:aan. Kahden solmun testi (ARK-05) tarvitsee kaksi vapaata porttia.
- **palvelin ei ole käytettävissä** (19.10.2026): ARK-11:n Linux-kuoren testaus vaatii sen tai muun koneen; ei kriittisellä polulla.
- Rinnakkaisia Claude-ajoja: nykyinen 9 prosessia / 2,8 GB → noin 300 MB per istunto. Uusia toteuttajia mahtuu muistin puolesta ~3–5 samanaikaista ilman Rust-käännöstä; käännöksen aikana vähemmän.

## E-4 Pakettien riippuvuudet

Lähde: `scopes/architecture/SUUNNITELMA.md` luku 9 (rivit 128–185), sarake "Riippuu".

```
ARK-01 → ARK-02 → ARK-03
                ↘ ARK-04 (sopimus) → ARK-05 → ARK-12
                                   → ARK-06 (+ARK-02) → ARK-08 (+ARK-07) → ARK-09 (+ARK-07)
                                   → ARK-07              → ARK-10 → ARK-11 (+ARK-05)
                                                                   → ARK-13 (+ARK-05)
ARK-05 + ARK-09 → ARK-14 → ARK-15 (+ARK-07)
Ihminen: rustup (palvelin, Mac) → ennen ARK-04; hubin WG-komento → ARK-14
```

| Paketti | Riippuu | Vapauttaa |
|---|---|---|
| ARK-01 | — | ARK-02 |
| ARK-02 | ARK-01 | ARK-03, ARK-04, ARK-06 |
| ARK-03 | ARK-02 | — |
| ARK-04 | ARK-02 (sopimus), rustup | ARK-05, ARK-06, ARK-07 |
| ARK-05 | ARK-04 | ARK-11, ARK-12, ARK-13, ARK-14 |
| ARK-06 | ARK-04, ARK-02 | ARK-08, ARK-10 |
| ARK-07 | ARK-04 | ARK-08, ARK-09, ARK-15 |
| ARK-08 | ARK-06, ARK-07 | ARK-09 |
| ARK-09 | ARK-07, ARK-08 | ARK-14 |
| ARK-10 | ARK-06 | ARK-11, ARK-13 |
| ARK-11 | ARK-10, ARK-05 | — |
| ARK-12 | ARK-05 | — |
| ARK-13 | ARK-10, ARK-05 | — |
| ARK-14 | ARK-05, ARK-09 | ARK-15 |
| ARK-15 | ARK-07, ARK-14 | — |

**Kriittinen polku** (pisin ketju): ARK-01 → 02 → 04 → 06 → 08 → 09 → 14 → 15 (8 pakettia). Rustup-asennus on ARK-04:n esiehto, joten se kuuluu kriittiselle polulle jo ARK-01:n aikana.

**Rinnakkain ajettavat haarat** (riippumattomia tuloksiltaan; tiedosto- ja resurssipäällekkäisyydet merkitty):

- ARK-02:n jälkeen: ARK-03 ∥ ARK-04. Eri tiedostot (Swift vs. Rust), eri resurssi (Mac vs. palvelin).
- ARK-04:n jälkeen: ARK-05 ∥ ARK-06 ∥ ARK-07. Kaikki `scopes/ydin/src/` — eri tiedostot, mutta sama crate: yhteinen `Cargo.toml`, `lib.rs`/`main.rs`-moduulirekisteröinti ja yksi käännös kerrallaan muistin takia (E-3). Ratkaisu: worktree per paketti ja sarjallinen yhdistäminen, tai yksi toteuttaja ytimelle.
- ARK-06:n jälkeen: ARK-08 ∥ ARK-10. ARK-08 varaa Macin; ARK-10 on TypeScript palvelimella.
- ARK-05:n jälkeen: ARK-12 rinnan muiden kanssa (`scopes/localregister/**`, `lr.rs`).
- ARK-10:n jälkeen: ARK-11 ∥ ARK-13 (eri alustat; ARK-11 tarvitsee palvelimen tai VM:n, ARK-13 Android-laitteen).

**Tiedostopäällekkäisyydet, jotka estävät rinnakkaisuuden**: `scopes/palvelu/palvelin.mjs` (ARK-02, ARK-06, ARK-14); `lahteet.mjs`, `viestit.mjs` (ARK-01, ARK-02); `scopes/shared/ScopesCore/**` (ARK-03, ARK-08); `kaynnista.sh` (ARK-06). ARK-03 ja ARK-08 eivät voi olla yhtä aikaa auki Macilla.

## E-5 Gate-komennot

Lähteet: skooppien rekisterit, `scopes/macos/gate.sh`, `scopes/ios/testi.sh`, `scopes/palvelu/*.test.mjs`, `scopes/localregister/*.test.mjs`, `claude/siirto/tools/rakennetesti.mjs`, `scopes/macos/SUUNNITELMA.md:140-172`. Kartoitti Explore-sonnet; tarkistettu: tiedostot ovat olemassa, `gate.sh`:ssa ei ole `may:`-tarkistusta, `package.json` puuttuu, `scopes/ydin/` puuttuu, `/api/virta`-reittiä ei ole (`palvelin.mjs` tarjoaa vain `/api/chat/virta` ja `/api/kordinaattori/virta` NDJSON:na).

**Olemassa olevat ajettavat tarkistukset:**

| Skooppi | Komento | Tarkistaa | Lähde |
|---|---|---|---|
| palvelu | `node --test scopes/palvelu/<x>.test.mjs` (15 tiedostoa; ei package.json-skriptiä, ei yhtä komentoa) | reitit `kasittelija`-kutsuilla; ei latenssia, ei välimuistia | `scopes/palvelu/viestit.test.mjs:1` |
| palvelu | `node --test scopes/palvelu/diagnostiikka.test.mjs` | `silmukka`-merkintä pyyntölokiin > 500 ms tukoksesta — ARK-01-mittarin tuottaja, ei tunnin laskuria | `diagnostiikka.mjs:64-71` |
| palvelu | `bash scopes/palvelu/kaynnista.sh` | `/api/terveys`-curl, käynnistys, `/api/purkajat`-esihaku; ainoa savutesti | `kaynnista.sh:10-30` |
| palvelu | ei testiä: `palvelin.mjs`, `kordinaattori.mjs` (rekisteri viittaa `kordinaattori.test.mjs`:ään, jota ei ole) | — | `scopes/kordinaattori/REKISTERI.md:22` |
| localregister | `node --test scopes/localregister/lr.test.mjs` (16) ja `palvelu.test.mjs` | LR-semantiikka; ARK-04 siirtää 16 tapausta Rustiin | `lr.test.mjs:1` |
| macos + ScopesCore | `bash scopes/macos/gate.sh <ID>` — CORE-01…06 `swift test --filter …` Macilla; MAC-09 ScopesUI `swift test`; muut MAC-nn vain `xcodebuild build` | yksikkötestit ja käännös; **ei git-fenceä** vaikka SUUNNITELMA.md:131-135 lupaa; ScopesDatabaseTests ei ole CORE-tapauksissa | `gate.sh:26-44,149,184` |
| ios | `bash scopes/ios/testi.sh [simulaattori]` | xcodebuild test simulaattorissa oikeaa palvelua vastaan (11 UITests-tiedostoa, Skoopit 33 testiä); kytkimet SCOPES_VAIN, SCOPES_OSOITE; lukko `/tmp/scopes-ios-mac.lock` | `testi.sh:1-5,92` |
| ios | `bash scopes/ios/mittaa.sh` | sivupalkin ruutuajat; mittari, ei portti | `mittaa.sh:1-5` |
| notifications | `bash scopes/notifications/testi.sh` | `ilmoitukset()`-logiikka swiftc:llä Macilla | `testi.sh:1-2` |
| siirto | `node claude/siirto/tools/rakennetesti.mjs [--skooppi]`, `check-rekisteri.mjs`, `roskat.mjs`, `hukka.mjs`, ~60 `*.test.mjs` | rekisterirakenne, ei koodi | `rakennetesti.mjs:1-24` |
| performance, test | rekisterit tyhjiä (MAARITTELY-paketti) | — | |

**Puuttuvat gate-komennot ARK-01…ARK-07:lle** (hyväksyntäehdot ovat mittareita, eivät komentoja):

| Paketti | Hyväksyntäehto | Puuttuva komento |
|---|---|---|
| ARK-01 | `/api/skoopit` p50 < 100 ms, `/viestit` p50 < 50 ms 6 istunnolla | latenssimittari + 6 istunnon fixture (esim. `node scopes/palvelu/mittaa-latenssi.mjs --istunnot 6`); uudet yksikkötestit: inkrementaalinen luku, `istunnot()` kerran, async exec, statSync-välimuisti, ruutu 1 s |
| ARK-01 | `silmukka` > 500 ms: 0 tunnissa | tunnin ajo + laskuri pyyntölokista |
| ARK-02 | viesti näkyy toisella asiakkaalla < 1 s | kahden SSE-tilaajan viivetesti (`scopes/palvelu/virta.test.mjs`; `virta.mjs` ja `/api/virta` puuttuvat) |
| ARK-02 | `/api/skoopit`-kutsuja < 20 tunnissa kahdella äpillä | kutsulaskuri pyyntölokista per asiakas |
| ARK-02 | katkosta toipuminen `Last-Event-ID` | yksikkötesti virta.test.mjs:ssä |
| ARK-03 | iOS < 5 listapyyntöä/min, taustalla 0 | pyyntölaskuri palvelimella `testi.sh`:n ajon aikana; UITest scenePhase |
| ARK-03 | macOS `/api/kayttoraja` 15 min välein | `gate.sh`:ssa ei Mac-testikohdetta; ScopesClient.virta-yksikkötesti (CORE-03) |
| ARK-04 | `cargo test`, LR-pariteetti, `scopes-solmu` vastaa | kaikki: Cargo-projekti, pariteettiajo Rust vs. `lr.mjs` samalla korpuksella, curl-savutesti headless-binäärille |
| ARK-05 | 2 solmua konvergoivat 1 000 yksikköä 10 s:ssa; katko → sama tila | `cargo test --test replikointi` eri porteilla + aikaraja-assertio |
| ARK-06 | äpit toimivat muuttamatta; peili = transkripti; `kaynnista.sh` käynnistää molemmat | tiivistevertailuskripti, kaynnista.sh-savutesti (8787 + 8788), regressio `testi.sh` + `gate.sh` |
| ARK-07 | luonnos A → B < 1 s; headless ei kirjoita UI-avaimia | kahden solmun tilaviivetesti + headless-lipputesti |

Yleinen puute: yksikään ARK-hyväksyntä ei ole yhden komennon portti. Ehdotus: `bash scopes/<skooppi>/gate.sh ARK-nn` samalla mallilla kuin `scopes/macos/gate.sh`, lisättynä git-fencellä (`may:`-listan ulkopuoliset muutokset → exit ≠ 0). Gate-komennot ovat osa sopimusvaihetta: ne kirjoitetaan ennen toteutusta.

**Tehtäväpohja** (`scopes/macos/SUUNNITELMA.md:140-172`, "Flash 3.8 Low -tehtäväsapluuna"): `# TASK: [TUNNUS] — [kuvaus ≤ 60 merkkiä]`; `## Task` yksi imperatiivinen lause; `## Files` rivit `may:` / `must not:` / `read:` (polku ja riviväli); `## Contract` täsmällinen signatuuri tai skeema, jota noudatetaan kirjaimellisesti; `## Do` numeroidut askeleet; `## Acceptance` komento (`bash scopes/macos/gate.sh [TUNNUS]`) ja kriteeri: exit 0, testit läpi, git-puussa vain sallitut muutokset. Toteuttaja-agentit (E-1) odottavat tätä muotoa.

## E-6 Ihmistä vaativat vaiheet

Lähteet: `scopes/architecture/SUUNNITELMA.md:147,151` (ARK-04 esiehto), luku 10; `scopes/architecture/REKISTERI.md:5,33`; ARK-14 (luku 9, vaihe 5); muistisäännöt (sudo on komentolista; LuLu agentin hallinnassa).

| # | Vaihe | Milloin | Kuka voi tehdä | Komento tai toimi |
|---|---|---|---|---|
| H-1 | Rust-työkaluketju palvelimelle (ei rootia, `~/.cargo`) | ennen ARK-04, viimeistään ARK-02:n aikana | agentti käyttäjän luvalla (muuttava asennus, TYÖTAVAT 8) | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh -s -- -y --profile minimal` palvelimella; tarkistus `~/.cargo/bin/cargo --version` |
| H-2 | Rust-työkaluketju Macille | ennen ARK-08 (XCFramework) — ei ennen ARK-04 | agentti käyttäjän luvalla (`ssh dev-host`) | sama rustup-komento Macilla + `rustup target add aarch64-apple-ios aarch64-apple-ios-sim aarch64-apple-darwin` |
| H-3 | `scopes ydin` -skoopin luonti | ennen ARK-04 | käyttäjä (`/pura uusi scopes ydin — solmuydin Rustilla`), kirjattu ARCHITECTURE-JAKELUun | — |
| H-4 | Pakettien jakelu omistajien rekistereihin (ARCHITECTURE-JAKELU) | ennen ARK-01 | käyttäjä pyytää; `scopes architecture` tekee | `/pura scopes architecture` |
| H-5 | `kaynnista.sh`:n muutos tuotantoon (ydin 8787, Node 8788) — palvelun uudelleenkäynnistys | ARK-06 | agentti; käyttäjä hyväksyy katkon | palvelun uudelleenkäynnistys palvelimella |
| H-6 | Hubin WireGuard-peerin lisäys (K-7) | ARK-14 | käyttäjä: muuttava root-komento hubissa (`ssh palvelin-root`) | selvitetään ARK-14:ssä (luku 10) |
| H-7 | Macin oikeudet: LuLu-palomuurisääntö uudelle `scopes-solmu`-binäärille tai Tauri-äpille, Keychain | ARK-08, ARK-11 | agentti (`ssh dev-host sudo -n lulu-hallinta`) | — |
| H-8 | Android-laite ja Keystore (ARK-13), Windows-VM (ARK-11) | vaihe 4 | käyttäjä hankkii/kytkee | — |
| H-9 | Bearer-avaimen poisto, kun kaikki laitteet paritettu | ARK-14 loppu | käyttäjä päättää | — |

Kriittiselle polulle vaikuttavat H-1, H-3, H-4 (kaikki ennen ARK-04) ja H-6 (ARK-14). H-1 on sama tunti kuin ARK-01:n aloitus, jotta ARK-04 voi alkaa heti ARK-02:n sopimuksen jälkeen.
