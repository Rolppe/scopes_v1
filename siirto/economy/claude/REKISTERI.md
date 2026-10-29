# scopes/siirto/economy/claude/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ECONOMY-CLAUDE-HAIKU-TESTI — jatka Haiku-hybridin testausta haiku-testi.mjs:llä: laajenna testijoukko 5 → ≥10 pakattua Claude-istuntoa, aja 2 kierrosta, korjaa poikkeamat kehotteeseen tai louhintaan (pakkausscriptin polut käyttäjän pyynnöstä, ilmoitus omistajalle) kunnes kaikki luvut viitteen mukaiset; Haikua ei oteta käyttöön ennen sitä — polut: scopes/siirto/economy/claude/** — aloitus: /pura scopes siirto economy claude — automaattinen: kyllä

## Tila

Mitattu 28.10.2026: `kulutus.mjs --projekti -home-user-palvelin` (2033 istuntoa, prlimit 600 Mt, `--max-old-space-size=300`) → hukka 24157 → 1490 / 58689 kutsua (hukka = task-odotus-rikkomukset, 3a70b6b0); suurin transkripti 128 Mt, huippu-RSS 401 Mt; ilman pientä V8-kekoa ajo kaatui kerran bad_alloc. Pakkausscriptin testit 233/234 (vain test8 = V-670, punainen myös ilman muutoksia). `claude -p --model claude-haiku-5-5 --json-schema` toimii tilauksella: oletuskehotteella 43 k kontekstia, `--system-prompt` + `--setting-sources ''` 1,15 k; `--bare` vaatii API-avaimen (maksullinen). Äppi: puhelimessa V2 (`scopes2/ios/REKISTERI.md:21`), data ytimestä 8797, joka ohjaa reitit vanhaan palveluun 8787 (pid 22215, `scopes/palvelu/kaynnista.sh` cron). Claude-transkripti toistaa `message.usage`-kentän jokaisella saman requestId:n lohkorivillä, joten tokenit lasketaan kerran per requestId. `pura-malliton.mjs` rakentaa `data.pysyva` ennen kohdekohtaista renderöintiä (rivit 777-780, 558-600), joten moottorivalinta kuuluu renderöintiin. Vanhassa Mac-kloonissa 34 committia 9063d87d..d86d2463 (`git rev-list --count`, `git cherry` kaikki +); `git ls-remote origin 'refs/heads/varmuus*'` 28.10.2026: `varmuus-mac-klooni-20261028` 23725785, `varmuus-mac-klooni-likainen-20261028` f990a595, `varmuus/claude_project-head-20261028` d86d2463 (manualpack `/pura uusi`, tehty a1505cb7:n arkistorajan jälkeen). Kloonin työpuussa 77 muutosta ja `DU` claude/idea/IDEAT.md ja V-SARJA.md, rebasea ei käynnissä, koskematta. Arkistoitu sisältö: 33 committia (`git diff --stat 9063d87d^ 23725785`: 64 tiedostoa, +2817/−190), ~20 ARVIO/AJO-lokicommittia, loput sisältötyötä; `Infra/iot/tietoturva/`, `nebius-langsmith-agent/`, `scopemanager/` ja `claude/siirto/tools/pura.sh` puuttuvat origin-puusta (ls 28.10.2026).

## Tarkoitus ja raja

Tarkoitus (käyttäjä 28.10.2026): tutkia `scopes siirto economy` -skoopin kustannussäästötoimet ja tehdä niistä universaaleja, myös Claude-yhteensopivia (Claude Code -istunnot ja Claude-mallit, ei vain AGY/Gemini).

Raja: tämä skooppi tekee economy-toimien moottoririippuvat osat (lokilähde, työkalunimet, budjetin yksikkö, purkuun kirjoitettavat säännöt) moottorineutraaleiksi tai moottorikohtaisiksi. Muutokset `scopes/siirto/economy/*.mjs`:ään ja `claude/siirto/tools/pura-malliton.mjs`:ään tehdään täällä käyttäjän pyynnöstä (TYOTAVAT 15); yläskoopin rekisteriä ja pakkausta ei päivitetä täältä, vaan muutos kirjataan omistajalle `/vika scopes siirto economy …`. Uudet säästötoimet ja AGY-kulutuksen optimointi kuuluvat yläskoopille.

## Kartoitus 28.10.2026 (economy-toimien moottorisidonnaisuus)

Lähde: Explore-kartoitus repossa sessions-repo, pääkohdat tarkistettu koodista. Säästöluvut ovat ennakkoarvioita (27.10. AGY-mittaus), toteutuksen jälkeistä mittausta ei ole.

| Toimi | Toteutus | Moottorisidonnaisuus | Claude-tila |
|---|---|---|---|
| A git-esitiedot | `scopes/siirto/economy/git-esitiedot.mjs`, kytkentä `pura-malliton.mjs:763-776` | ei | toimii jo Claude-purussa |
| B tiedostokartta | `tiedostokartta.mjs`, vain `/api/economy/*` | ei | ei kytketty mihinkään millään moottorilla |
| C task-odotus | `task-odotus.mjs:16-18`, kytkentä `pura-malliton.mjs:777-780` | AGY-työkalut (run_command, manage_task) | **haitallinen**: AGY-sääntö menee Claude-purkuun |
| D hybridipakkaus | `hybridi-pakkaus.mjs`, `scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs` | oletus gemini-3.8-flash-low, claude-cli-vara | vain AGY:n `.agents/skills/pakkaa` |
| E1 siirto-git yhdistetty tila | `kuluttajat.mjs:311` | ei (polut kovakoodattu) | tynkä: ilman `aja`-parametria aina `synkassa:true` (`:331-335`) |
| E2 expresso-koontiajo | `kuluttajat.mjs:291` | ohjeteksti AGY-sanastoa | ei kytketty |
| E3/E4 kulutusanalyysi | `kuluttajat.mjs:87-180`, `scopes/palvelu/economy.mjs:239-261` | `~/.gemini/antigravity-cli/brain`, PLANNER_RESPONSE | ei näe Claude-lokeja |
| F budjetti 1500/vrk | `budjetti.mjs:17-19,57` | AGY-kutsut, Tyynenmeren keskiyö | Claudella yksikkö tokenit / 5 h ja viikkoraja |

## Kartoitus: hybridipakkaus Claudelle (28.10.2026)

Lähde: koodi luettu tässä istunnossa; louhinta ajettu tätä Claude-istuntoa vasten.

- `pakkaa-hybridi.mjs` (scopes/agy/siirto/pakkausscripti) käyttää jo Clauden työkaluja: vaihe 1 `pakkaa-alku.mjs` (:181), vaihe 5 `aja-siirtaja.sh paketoi` (:267, vara `claude-cli:claude-sonnet-5-5` :43) ja `pakkaa-loppu.mjs` (:288). `claude/siirto/ajaja.json` paketoi = agy gemini-3.8-flash-low, joten Clauden `/pakkaa`-vaihe 2 on jo sama.
- Ainoa ero: hybridi korvaa pääistunnon muistion käsintäytön louhinnalla (`louhija.mjs`) ja harkinnalla (`harkinta.mjs:183`, vain `agy`, vara deterministinen `syntetisoiAnalyysi`). Säästö Claudella = pääistunnon (Opus) muistiotokenit, ei mitattu.
- Louhija tukee Claude-transkriptia (`louhija.mjs:209,285`, `CLAUDE_CODE_SESSION_ID`): mitattu 28.10.2026 → 17 viestiä, lähde `claude`, vieraat muutokset 8, skoopin 0.
- Puutteet: `--co-author` ei välity `pakkaa-alku`/`pakkaa-loppu`-kutsuihin (:185, :291); harkinnalla ei Claude-moottoria; pääistunnon vaiheet (sa-pois, katto/tietoturvagrep, LOPPUVIESTI) jäävät taitoon; Kesken- ja Hukka-lukujen laatu ilman pääistuntoa mittaamatta.
- Kytkentäpyyntö: V-652 → claude siirto (dcb9150).

## Mittaus: hybridin muistiolaatu Claudella (ECONOMY-CLAUDE-VERTAILU 28.10.2026)

Ajo: `louhiKaikki({skooppi, sessio: "b398e8ad-…"})` + `syntetisoiAnalyysi` (ei mallia, ei pakkaa-alkua) pakattua istuntoa b398e8ad (ECONOMY-CLAUDE-HYBRIDI, commit 060a0799) vasten; vertailukohta pääistunnon muistio, rekonstruoitu transkriptin Bash-syötteistä (muistiotiedosto poistettu pakkauksen jälkeen). Louhinta: lähde `claude`, malli claude-opus-5-5, 40 viestiä (käyttäjä 1, agentti 7, työkalu 32), testitodisteita 0, exit 0.

| Luku | Pääistunto | Hybridi (deterministinen) |
|---|---|---|
| Tehty | 4 (kartoitus 6 tiedostoa, V-652 dcb9150, rekisteriluku, kesken todettu tehdyksi afa3df6b) | 1–2 yleistä ("Käsitelty käyttäjän pyyntö: Malliton purku…", "Skoopin poluissa muuttuneita 1 kpl" vain jos puu likainen) → 0/4 sisältöä |
| Todettu | 5 faktaa file:line-viittein | 2 yleistä (git-tila, "ei testitodistetta") → 0/5 |
| Päätökset | 1 + hylätty vaihtoehto | 0 (vakio "Ei kirjattuja päätöksiä") |
| Kesken | "ei" + perustelu | "ei" (vakio) — sama tulos sattumalta |
| Hukka | "ei" + perustelu | "ei" (vakio) — sama tulos sattumalta |
| Seuraava paketti | uusi ECONOMY-CLAUDE-VERTAILU | kopio rekisterin SEURAAVA-rivistä: pakkaushetkellä se oli juuri tehty ECONOMY-CLAUDE-HYBRIDI (afa3df6b:5) → väärä |

- Syy: `syntetisoiAnalyysi` (`harkinta.mjs:136-183`) palauttaa Päätökset/Kesken/Hukka vakioina eikä lue agentin viestejä; Tehty tulee vain git-muutoksista ja ensimmäisestä käyttäjäpyynnöstä. Session aikana committoitu muutos (dcb9150) ei näy git-tilasta. Claude-purussa istunnon ainoa käyttäjäviesti on purkukomento.
- Johtopäätös V-652:lle (vara): deterministinen vara ei korvaa pääistunnon muistiota Claudella; säästö (pääistunnon muistiotokenit) ostettaisiin menettämällä Tehty/Todettu/Päätökset-sisältö ja väärällä SEURAAVA-rivillä.

Mallipolku `ajaHarkinta` (agy gemini-3.8-flash-low), 3 ajoa. Transkripti katkaistu riville 211 (ennen `autopakkaa`-kutsua, rivi 212), koska koko transkriptissa malli näki pakkausvaiheen muistiotekstin (1. kokeilu, hylätty); `claudeProjektit` = scratchpad-kopio, `seuraavaHead` = pakkaushetken rivi (afa3df6b:5). Louhinta 25 viestiä.

| Luku | Pääistunto | Malli (ajot 2–3) |
|---|---|---|
| Ajo | — | ajo 1: 3,5 s, hiljainen vara (= deterministinen tulos, ei merkintää); ajot 2–3: 9,0 s ja 7,8 s mallin vastaus |
| Tehty | 4 | 3/4 (kartoitus, V-652, rekisteri); puuttuu "kesken todettu tehdyksi afa3df6b"; polku väärin `scopes/siirto/economy/hybridi-pakkaus.mjs` (vanhasta SEURAAVA-rivistä, oikea `scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs`) |
| Todettu | 5 file:line | 1/5 (louhija 17 viestiä); ajo 2 lisäsi "commit 060a0799", joka syntyi vasta pakkauksessa (vuoto nykyisestä git-tilasta, mittausvirhe) |
| Päätökset | 1: `--hybridi`-optio, oletus ennallaan; hylätty suoraan oletukseksi | 0/1 oikein: molemmat ajot kirjasivat vastakkaisen ("otetaan käyttöön" / "suositellaan samaa reittiä") |
| Avoimet | V-652 + muut ennallaan | V-652, V-649, V-650 oikein |
| Kesken / Hukka | "ei" + perustelu | "ei" (sama) |
| Seuraava paketti | ECONOMY-CLAUDE-VERTAILU + tarkka kuvaus | nimi oikein, kuvaus yleinen, ei `automaattinen`-kenttää |

- Johtopäätös V-652:lle (malli): Tehty ja Avoimet lähes käyttökelpoisia; Päätökset käännetty päinvastaiseksi 2/2 ja Todettu 1/5, joten muistio vaatii pääistunnon tarkistuksen ennen pakkaa-sonnetia. Hiljainen vara 1/3 ajosta on kytkennän este: ajaHarkinta ei kerro, kumpi tuotti tuloksen (`harkinta.mjs:230-231`). Tiedoksi omistajalle: V-653 (16c6a95), V-654 (c6e44a0).

## Mittaus: hybridin tokensäästö Claudella (ECONOMY-CLAUDE-SAASTO 28.10.2026)

Lähde: transkriptit b398e8ad ja f1d71d8f, tokenit kerran per requestId (`kulutus.mjs`-laskenta; b398e8ad:n koko istunnon summa täsmää `kulutus.mjs --analysoi`-tulokseen). Muistiovaihe = pyynnöt `pakkaa-alku`-kutsun jälkeen `aja-siirtaja.sh paketoi` -kutsuun asti. Painot (ekv = syötetokeniekvivalentti): syöte 1, välimuistiin kirjoitus 2 (1 h TTL), luku 0,1, ulostulo 5.

| Istunto | Muistiovaihe (pyynnöt) | cw | cr | out | ekv | osuus istunnosta |
|---|---|---|---|---|---|---|
| b398e8ad | 19–23 (5): pohja + kirjoitus 41,0 k; portti + konteksti 40,3 k; korjaus 18,2 k | 10 727 | 519 465 | 5 217 | 99,5 k | 19 % (512 k, 28 pyyntöä) |
| f1d71d8f | 34–35 (2): pohja + kirjoitus | 5 627 | 225 038 | 2 933 | 48,4 k | 7 % (684 k, 41 pyyntöä) |
| Hybridi, pääistunnon osuus | 1 pyyntö hybridiajoon (mitattu f1d71d8f req 24, `ajaHarkinta`) | 1 420 | 93 515 | 729 | 15,8 k | — |

- Hybridi poistaa vain muistion täytön (pohja + kirjoitus): säästö b398e8ad 41,0 → 15,8 k = 25 k (5 %), f1d71d8f 48,4 → 15,8 k = 33 k (5 %). Portti- ja kontekstitarkistus jäävät pääistuntoon.
- Laatumittaus (yllä) vaatii mallimuistion tarkistuksen ja Päätösten korjauksen pääistunnossa: yksi korjauspyyntö maksoi b398e8ad:ssa 18,2 k, jolloin nettosäästö on 7–15 k per pakkaus (1–2 % istunnosta).
- `agy`-ajo (gemini-3.8-flash-low, 7,8–9,0 s) kuluttaa AGY-kiintiötä, ei Claude-tokeneita; sen tokenimäärä ei näy Claude-lokeista.
- Johtopäätös V-652:lle: tokensäästö Claudella on 1–5 % istunnon kustannuksesta per pakkaus, ja laatu heikkenee (Päätökset käännetty 2/2). Ei puolla hybridiä oletukseksi; `--hybridi`-optiona hyöty on pieni. Tiedoksi omistajalle: V-655 (052b567).

## Mittaus: Haiku-hybridin muistiolaatu Claudella (V-652, 28.10.2026)

Ajo: `louhiKaikki` + `ajaHarkintaLahteella({ malli: 'claude-haiku-5-5' })` (claude CLI, tilaus), b398e8ad rivit 1–211 (Macilta `scp`), git-tila worktree 060a0799~1 (edellisen mittauksen git-vuoto poistettu: 060a0799:n viesti nimesi VERTAILUn), 3 ajoa per kierros, 20–43 s/ajo.

| Luku | Pääistunto | K1: vanha louhinta (vain työkalunimet) | K4: kutsut + tulokset (f39c0e08) |
|---|---|---|---|
| Tehty | 4 | ~3/4 + aiempien istuntojen committeja | 3–4/4, ei vieraita |
| Todettu | 5 polku:rivi | 0/5 (purkuraportin rivit) | 5–9 polku:rivi (kartoituksen faktat) |
| Päätökset | 1: `--hybridi`, oletus ennallaan | 0/3, kääntöjä 0/3, tyhjä 1/3 | 0/3 pääpäätös, kääntöjä 0/3 (reitityspäätökset oikein) |
| Hukka | ei | 2/3 oikein | 3/3 oikein |
| Seuraava | ECONOMY-CLAUDE-VERTAILU | 0/3 (kopio tehdystä HEADista) | 'ei mitään — omistajilla' 3/3 |

- Juurisyy K1:ssä: `louhiClaudeViestit` antoi mallille vain työkalun nimen; pääpäätös oli `vika.sh`-komennon lopussa. Korjattu (alku + loppu).
- VERTAILU ei ollut transkriptissa ennen pakkausta (`grep -c VERTAILU` 0): pääistunto päätti sen pakatessa, joten hybridi ei voi tuottaa sitä.
- Johtopäätös K4: Haiku kelpaa Tehty/Todettu/Kesken/Hukka-lukuihin; Päätösten pääpäätös ja SEURAAVA tarvitsevat pääistunnon syötteen.

Kierrokset k3+k4 (4560730d: Claude-kehotteen SEURAAVA- ja Päätökset-säännöt, vain `istuntoLahde === 'claude'`), `haiku-testi.mjs`, 5 pakattua istuntoa (b398e8ad/060a0799, ec5b35b3/0c746a01, 1fe0e726/41d8f8df, 9bb41d80/48de715b, 3ea72e61/a1505cb7; worktree pakkauscommitin vanhemmassa, viite pakkauscommitista):

- SEURAAVA 9/10 viitteen mukainen; k4 b398e8ad 'ei mitään' väärin (viite ECONOMY-CLAUDE-VERTAILU). Päätökset: viitteen linjaukset kaikissa, ei kääntöjä. Tehty 3–6 riviä viitteen mukaan.
- Aiempi agy-mittauksen 'nimi oikein' oli git-vuoto (060a0799:n viesti). agy-kehote todennettu merkki merkiltä samaksi kuin 6c241cb8.
- Testijoukko 5 < tavoite 10 ja kierroksia 2: täyttä testausta ei ole, joten Haikua ei oteta käyttöön.

## Päätökset

- **Käyttäjä 28.10.2026:** skooppi `scopes siirto economy claude` luotiin komennolla `/pura uusi scopes siirto economy claude`; luonti tehtiin kloonissa `~/sessions-repo` (ec2ecf7a), koska `~/Documents/claude_project` on 20.10. jäädytetty vanha Mac-klooni (V-619).
- **Pääistunto 28.10.2026 (pakkausportti OMISTAJA):** ECONOMY-CLAUDE-TASKODOTUS toteutetaan tämän skoopin poluissa (`scopes/siirto/economy/claude/**`); kytkentä `claude/siirto/tools/pura-malliton.mjs:777-780`:een pyydetään omistajalta `/vika claude siirto` (TYOTAVAT 15).
- **Käyttäjä 28.10.2026:** ensimmäinen paketti on task-odotus moottorikohtaiseksi (ECONOMY-CLAUDE-TASKODOTUS), koska se korjaa nykyisen haitan Claude-purussa.
- **Pääistunto 28.10.2026:** `neutraali`-kohde (agy, paikalliset mallit) saa AGY-säännön kuten ennenkin; vain `claude` saa Claude-säännön.
- **Pääistunto 28.10.2026:** Claude-kulutuksen yksikkö analyysissä on API-pyynnöt + tokenit; budjettiraja (tokenit / 5 h, viikkoraja) jätetään yläskoopille (V-650).
- **Pääistunto 28.10.2026:** hybridipakkaus ehdotetaan `--hybridi`-optiona /pakkaa-taitoon, oletus ennallaan kunnes vertailupakkaus (Kesken/Hukka-laatu) on ajettu; päätös kuuluu omistajalle claude siirto (V-652, TYOTAVAT 15).
- **Pääistunto 28.10.2026 (ECONOMY-CLAUDE-VERTAILU):** vertailukohdaksi valittiin b398e8ad, koska se on tämän skoopin viimeisin pakattu Claude-istunto ja sen muistio on rekonstruoitavissa transkriptista; tulos välitetään V-652:n omistajalle tiedoksi (`vika.sh --tiedoksi`), ei päätöksenä (TYOTAVAT 15).
- **Pääistunto 28.10.2026 (ECONOMY-CLAUDE-SAASTO):** hybridiajon pääistuntokustannukseksi otettiin mitattu f1d71d8f req 24 (todellinen `ajaHarkinta`-ajo), ei arviota; portti- ja kontekstitarkistus jätettiin säästön ulkopuolelle, koska hybridi korvaa vain muistion täytön. Tulos välitetään V-652:n omistajalle tiedoksi (V-655), ei päätöksenä (TYOTAVAT 15); johtopäätös: ei puolla hybridiä oletukseksi.
- **Käyttäjä 28.10.2026:** vanhan Mac-kloonin commitit pushataan arkistohaaroiksi originiin (`varmuus-mac-klooni-20261028` 23725785, `varmuus-mac-klooni-likainen-20261028` f990a595; `git ls-remote` todennettu); lisäksi vanhaan klooniin tehty d86d2463 (28.10. klo 8.05, `scopes siirto manualpack` /pura uusi) on originissa haarana `varmuus/claude_project-head-20261028` (`git ls-remote` todennettu 28.10.2026), ei poimintaa nykyhaaraan eikä hylkäystä; kukin omistajaskooppi poimii omansa (TYOTAVAT 15). Omistajille tiedoksi V-656 → infra, V-657 → claude siirto, V-658 → scopes macos.
- **Käyttäjä 28.10.2026 (päätä itse):** vanhan Mac-kloonin commitit vain arkistohaaroihin, ei poimintaa jaettuun haaraan eikä hylkäystä (upstream 1125 committia edellä, sisältö muiden skooppien, TYOTAVAT 15); kloonin työpuuhun ei kosketa.
- **Pääistunto 28.10.2026:** avoimia V-649/V-652 ei tehty ongelmitta: ne omistaa claude siirto ja kohdetiedostot (`pura-malliton.mjs`, `Infra/skills/keskustelun-siirto/*`) olivat toisen istunnon committaamattomia muutoksia; V-650 ja skooppitunnistus kuuluvat skoopille scopes siirto economy, budjetin yksikkö on sen päätös. Käyttäjälle tarjottu: V-649/V-652 claude siirron committien jälkeen, jos hän ohittaa omistajuuden.
- **Pääistunto 28.10.2026:** muiden skooppien työpuun muutokset eivät ole tämän session tekemiä, joten niistä ei kirjattu vikoja.
- **Käyttäjä 28.10.2026:** avoimet V-649, V-650 ja V-652 hoidetaan tässä skoopissa, jos siitä ei tule lisäongelmia; omistajille tiedoksi V-664, V-665, V-666.
- **Käyttäjä 28.10.2026:** V-650:n palvelukytkennän sijaan malliton kulutusanalyysi V2-äppiin (ketju A); V-652: Claudella hybridin harkinta Haikulla (ketju B). Järjestys B ensin, sitten A.
- **Pääistunto 28.10.2026:** Claude-hukka = task-odotus-säännön rikkomukset, ei Grep/Glob/git (TYOTAVAT 9); skooppi koko nimellä tämän skoopin `kulutus.mjs`:ssä, yläskoopin `tunnistaKulutusSkooppi` ennallaan (AGY).
- **Käyttäjä 28.10.2026:** Haiku tekee koko muistion (ei pääistunnon rivejä), ja se saadaan toimimaan täydellisesti; Haikua ei oteta käyttöön (ei oletukseksi, ei taitoihin) ennen kuin se on testattu täysin toimivaksi. Oletus `pakkaa-hybridi.mjs`:ssä gemini-3.8-flash-low, Haiku vain `--malli claude-haiku-5-5`; agy-kehote ennallaan.
- **Pääistunto 28.10.2026:** Claude-kehotteen lisäsäännöt (SEURAAVA, Päätökset) vain `istuntoLahde === 'claude'`; AGY:n tuotantopakkaus ei muutu ennen kuin Haiku on testattu.
- **Pääistunto 28.10.2026:** Haiku ajetaan `claude -p --setting-sources '' --system-prompt` cwd tmpdir, ei `--bare` (vaatii API-avaimen = maksullinen).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Task-odotussääntö on AGY-kohtainen myös Claude-purussa | valmis 28.10.2026: ei kytkettävää — `pura-malliton.mjs` ei ole koskaan tuonut AGY-sääntöä (`git log --all -S muotoileTaskOdotusOhje`); sääntö on `AGENTS.md`:ssä, jota Claude Code ei lue; V-664 tiedoksi omistajalle | ei seuraavaa askelta |
| Kulutusanalyysi ja budjetti eivät näe Claude-istuntoja | kesken; odottaa ajoa (käyttäjä 28.10.2026: malliton analyysi V2-äppiin, ketju A hyväksytty, B:n jälkeen) | ketju A: `kulutus.mjs` valmis tiedosto cronilla (inkrementaalinen, muistikatto), reitti vanhaan palveluun + uudelleenkäynnistys, näkymä `scopes2/shared/ScopesUI2`, asennus iPhoneen |
| Yläskoopin `tunnistaKulutusSkooppi` (`kuluttajat.mjs:54-82`) niputtaa alaskoopin yläskooppiin; hukkaKutsut yliarvioi Claudella (484/592) (kirjattu 28.10.2026) | valmis 3a70b6b0 28.10.2026 (`tunnistaClaudeSkooppi`, hukka = task-odotus-rikkomukset; 2033 istuntoa: hukka 24157 → 1490); V-665 tiedoksi | ei seuraavaa askelta |
| Hybridipakkaus ei ole Clauden pakkausreitissä (kirjattu 28.10.2026) | kesken 4560730d; odottaa ajoa (Haiku testissä, ei käytössä; moottori 461931d6, louhinta f39c0e08, laatu luku "Mittaus: Haiku-hybridin muistiolaatu") | ECONOMY-CLAUDE-HAIKU-TESTI: testijoukko ≥10 istuntoa, korjaa kunnes kaikki luvut viitteen mukaiset 2 kierroksella; vasta sitten `--hybridi` taitoihin |
| Economy-toimien vaikutusta ei ole mitattu (kirjattu 28.10.2026) | valmis 28.10.2026 (laatu: luku "Mittaus: hybridin muistiolaatu Claudella"; tokenit: luku "Mittaus: hybridin tokensäästö Claudella", nettosäästö 1–5 % istunnosta per pakkaus; V-655 tiedoksi V-652:n omistajalle) | ei seuraavaa askelta |
| manualpack-skoopin d86d2463 (vanha klooni, 28.10.2026 klo 8.05) on vain arkistohaarassa `varmuus/claude_project-head-20261028` | avoin; odottaa skooppia scopes siirto manualpack (poimii omansa, ei tämän skoopin) | omistaja poimii REKISTERI.md:n ja muut tiedostot haarasta |
| V-663: Macin klooni `~/sessions-repo` ahead 7 / behind 48; sen cd8c986a (vanhan kloonin 34 committia) kirjoittaa REKISTERI.md:tä ja rebase kaatuu konfliktiin (ilmoittaja scopes2 macos) | korjattu 28.10.2026: koordinaattori synkkasi kloonin originiin (0 edellä / 0 jäljessä), cd8c986a ja sen revert 98fe1cd5 pudotettiin, sisältö originissa a1505cb7 + 76e247b9 | ei seuraavaa askelta |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/siirto/economy/claude/HISTORIA.md`, ei lueta purussa.
