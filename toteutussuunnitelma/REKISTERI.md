# scopes/toteutussuunnitelma/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: V1-SYNKKA-BRIEFIT — T-110:n raportin (`scopes2/adapteri/vertailu/V1-SYNKKA.md`, abd8a50b; A 16, B 6+1, C 1, kopioiden ulkopuolella 20 B-riviä ilman S-10-vastinetta) mukaan: (1) brief pura/uusi/malli/AGY_MALLIT (12 A-kohtaa, ei sopimusmuutosta); (2) päätös agy-kayttoraja (luoMacAgyKayttoraja, otsikko/ymparisto; kopion `./toiminnot.mjs`-tuonti rikkoo tuontitarkistuksen) — toiminnot-asetukset on T-104; (3) S-10-päätös istunto.mjs:109/:155 automaattisiirto-vahti ja :238 /sulje; (4) päätös agy-lajin `onMac`-kentästä S-5b:ssä (agy-istunto.mjs:233/:647); (5) arkkitehtuurikysymys: terminal (REST+WS), 7 economy-GET:iä, /api/mallit, /api/kayttorajat-kaikki, ipa ja ?avain= — polut: scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/SUUNNITELMA.md — aloitus: /pura scopes toteutussuunnitelma

## Tarkoitus ja raja

Toteutussuunnitelma scopes-arkkitehtuurin (scopes/architecture/SUUNNITELMA.md) paketeille: tehtävätaso, mallivalinta, rinnakkaisuus ja valvonta. Suunnitelman tekee Fable.

## Päätökset

- **Käyttäjä 20.10.2026 (V-611 klo 16.55; tässä istunnossa "Kirjoita ja pyydä tarkastus"):** ARK-17 tehtävätasolle heti: S-9 (luku 4) ja luku 11.5, T-54…T-59, briefit T-54, T-55, T-56, T-58. S-9b:n "ikkunoidut"-kenttä lähetetään `scopes architecture` -skoopin tarkastettavaksi; T-55 odottaa. Ohittaa ARK-17:n osalta luvun 11.4 säännön (edeltäjä vihreä).
- **Käyttäjä 19.10.2026:** skooppi `scopes toteutussuunnitelma` luotiin komennolla `/pura uusi scopes toteutussuunnitelma`.
- **Käyttäjä 19.10.2026:** toteutussuunnitelman tekee Fable. Toteutuksessa valvoja on Opus, päätoteuttajat Opus ja Sonnet, aliagentit Sonnet ja Haiku. Poikkeus projektin `CLAUDE.md`:n sääntöön "Opus tai fable vain korotuksena" tässä skoopissa käyttäjän päätöksellä.
- **Käyttäjä 19.10.2026 (TOTEUTUSSUUNNITELMA-MAARITTELY):** ensimmäinen paketti on TOTEUTUSSUUNNITELMA-ESITIEDOT (E-1…E-6 → `LOYDOKSET.md`), sen jälkeen TOTEUTUSSUUNNITELMA-LUONNOS (`SUUNNITELMA.md`).
- **Käyttäjä 19.10.2026:** suunnitelman laajuus: vaiheet 0–2 (ARK-01…ARK-07) tehtävätasolle; vaiheet 3–6 (ARK-08…ARK-15) karkeasti — riippuvuudet, mallit ja ihmisen vaiheet — koska ne riippuvat aiemmissa paketeissa avoimista päätöksistä.
- **Agentti 19.10.2026 (TOTEUTUSSUUNNITELMA-ESITIEDOT):** E-1…E-6 kerätty `LOYDOKSET.md`:ään (198 riviä): E-1 ja E-5 Explore-sonnet, E-2 sonnet (6/6-osuudet laskettu uudelleen pääistunnossa), E-3 mitattu, E-4 ja E-6 arkkitehtuurisuunnitelmasta. Aliagenttien käyttö 56 k + 66 k + 71 k tokenia.
- **Fable 19.10.2026 (TOTEUTUSSUUNNITELMA-LUONNOS):** `SUUNNITELMA.md` (243 riviä): orkestrointimalli (valvoja Opus omistajaskoopin keskustelussa, toteuttaja-agentit, worktree-eristys rinnakkaisryhmille, gate.sh git-aidalla ennen toteutusta), sopimukset S-1…S-5, 28 tehtävää ARK-01…07 (Opus 5, Sonnet 19, valvoja 4), aallot 1–8, ihmisen vaiheet H-1…H-9, katot tokeneina, Haiku-pilotti P-1, päätökset P-1…P-6 suunnittelijan ehdotuksina. Odottaa katselmusta.
- **Käyttäjä 19.10.2026:** katselmoinnin tekee suunnittelija itse; rustup-asennus kuuluu toteutukseen, ei suunnitteluun — toteutus alkaa toisessa skoopissa. Agentti ei asentanut.
- **Fable 19.10.2026 (TOTEUTUSSUUNNITELMA-KATSELMUS):** korjattu K-1 viestireitti on `/api/skoopit/<nimi>/viestit` (arkkitehtuurin `/viestit`), K-2 `POST …/stream` on käytössä `ScopesClient.swift:47` → ei poistoa T-10:ssä, K-3 T-19 may sisältää `tila.rs`, K-4 luvun 7 luvut (Opus 5, Budget-summa 5,65 M, katto 17 M), K-5 H-1 omistajaskoopin valvojalle, K-6 ydin-haara voi alkaa aallossa 1 (S-1 lukittu) → kriittinen polku 16 → 10 tehtävää, K-7 worktree-haaran löytäminen ja poisto, K-8 päätös P-7 `kursorit`-taulu. Luvut 1, 4, 7, 8 hyväksytty suunnittelijan katselmuksena; käyttäjä ei ole lukenut.
- **Fable 19.10.2026 (TOTEUTUSSUUNNITELMA-BRIEFIT-ARK-01):** briefit `briefit/T-01-G.md`, `T-02.md`, `T-03.md`, `T-04.md`, `T-05.md` (yht. 202 riviä), rivivälit tarkistettu lähteestä. Korjattu suunnitelmaan: E-22:n "statSync 500 .db" on `agy-istunto.mjs:209-213` (loydaKeskustelu) → T-04:ään, ei T-05:een; `lahteet.mjs:185` execFileSync ps → T-02:een; `agy-kayttoraja.mjs:55` on jo välimuistissa → T-05 vain todentaa. Toteutus ei ole alkanut (käyttäjä: alkaa toisessa skoopissa).
- **Käyttäjä 19.10.2026:** briefit ja muu suunnitelman teko jatkuvat tässä skoopissa ARK-02…ARK-07:lle, kunnes tulee kysymys, joka on esitettävä; toteutus (gate-ajot, toteuttajat, asennukset) ei kuulu tähän skooppiin.
- **Fable 19.10.2026 (BRIEFIT-ARK-02…07):** briefit T-07-G…T-28 (19 kpl, yht. 24 briefiä, 899 riviä) hakemistoon `briefit/` + `README.md`-hakemisto; `mittaukset/README.md` ja tyhjä `tehtavat.jsonl`. Rivivälit tarkistettu `palvelin.mjs`, `viestit.mjs`, `agy-istunto.mjs`, iOS/macOS-lähteistä ja `lr.mjs`/`lr.test.mjs`:stä (16 testiä). Suunnittelutyö vaiheille 0–2 on valmis; jäljellä vain toteutuksen aikainen ylläpito ja vaiheet 3–6 ARK-07:n jälkeen.
- **Käyttäjä 19.10.2026:** uusi työ tehdään erillisenä `scopes2/`-rakenteena, ei vanhan `scopes/`-koodin päälle, koska vanha halutaan pitää käytössä. Vaikutus (analyysi 19.10.2026): ARK-01…03 poistuvat scopes2:n polulta, ARK-06 ja ARK-08 muuttuvat (oma portti, omat äpit, silta vanhaan 8787:ään), ARK-04/05/07 säilyvät polkumuutoksella, S-2 poistuu, S-6 lisätään, ARK-12 aikaistuu, kriittinen polku alkaa ydin-haarasta heti rustupin jälkeen. Muunnos paketissa TOTEUTUSSUUNNITELMA-SCOPES2.
- **Käyttäjä 19.10.2026:** toteutus ei käytä rd-taitoa; suunnittelija suunnittelee orkestroinnin itse. Esitiedot: `scopes/toteutussuunnitelma/ESITIEDOT.md` (E-1…E-6, periaatteet).

- **Käyttäjä 19.10.2026 (välitetty `scopes macos` -keskustelusta):** äpin nimi on scopes-V2; vanha äppi toimii rinnalla, kunnes uusi on toimiva; muutos kierrätetty arkkitehtuurin (K-9, commit e178f35e) ja tämän toteutussuunnitelman kautta. V2-portin valitsee tämä skooppi.
- **Fable 19.10.2026 (TOTEUTUSSUUNNITELMA-SCOPES2):** `SUUNNITELMA.md` muunnettu scopes-V2:lle: ARK-01…ARK-03 ja briefit T-01-G…T-10, T-12…T-14 poistettu V2-polulta (git rm; saatavilla commitissa 1ad7163d), T-26 ja H-5 (tuotantokatko) poistettu, S-2 poistettu, S-5 laajennettu (S-5a peili, S-5b lähdetila `POST /api/lahde/<laji>`), S-6 lisätty (ytimen reittisopimus: omat, johdetut ja sillatut reitit, `since`, `X-Lahde`), Rust-briefit T-16-G…T-22, T-27, T-28 poluille `scopes2/ydin/**` ja porttiin 8797, ARK-06 uusiksi (T-23 silta.rs, T-24-G adapterin runko + peili, T-29 lähdetila, T-30 peili.rs/lahde.rs, T-35 nakymat.rs, T-25 `scopes2/kaynnista.sh` + vertailut, T-34 valvojan hyväksyntäajo ilman katkoa), ARK-12 tehtävätasolle (T-31-G, T-32, T-33; alkaa T-19:n jälkeen, ei odota ARK-05:tä), aallot 1–6 vain palvelimella (Mac vasta ARK-08). Yhteensä 18 briefiä (Opus 5, Sonnet 13), Budget-summa 4,90 M tokenia, katto 14,7 M; kriittinen polku 7 tehtävää. Rakennetesti exit 0.
- **Fable 19.10.2026 (SCOPES2, päätökset P-8…P-11, SUUNNITELMA.md luku 8):** P-8 V2-portti **8797** (vapaa `ss -ltn` 19.10.2026; 8787 vanha, 8090, 11234 varattuja), testiportit 18797/18798 (P-6 päivitetty); P-9 adapteri tuo (`import`) vanhan `lahteet.mjs`/`viestit.mjs` puhtaat jäsennysfunktiot muuttamatta, riippuvuus puretaan ARK-16:ssa ennen vanhan alasajoa; P-10 V2:lla oma Bearer-avain `~/.config/scopes2/avain`, silta käyttää vanhan avainta vain 8787:ään; P-11 bundle-id:t `com.example.scopes-v2` (iOS) ja `com.example.scopes-v2.mac`, näyttönimi scopes-V2. P-1…P-5, P-7 tarkistettu ja säilytetty; P-3 lukutilassa vain `vie --kuiva`.
- **Fable 19.10.2026 (SCOPES2, työkalulöydös):** `luo-skooppi.mjs "scopes2 ydin" --kuiva` → "yläskoopilla scopes2 ei ole omaa rekisteriä: luo se ensin" → H-3 alkaa komennolla `/pura uusi scopes2 — scopes-V2 (K-9)`; `pura-malliton.mjs onPerhe` (`:623`) tunnistaa vain `scopes/`-rekisterit → `scopes2 *` puretaan mallireitillä (H-10, käyttäjän päätös; muutos `scopes context purascript` -skoopissa, TYÖTAVAT 15). ARK-16 (adapteri ottaa toiminnot ennen vanhan alasajoa) on tämän suunnitelman ehdotus `scopes architecture` -skoopille (luku 9), ei kirjattu sinne.
- **19.10.2026:** Suunnittelija 19.10.2026 (SUUNNITELMA.md luku 8): P-1 127.0.0.1-API ennen UniFFI:a, P-2 ei web-kehystä, P-3 LR-CLI ytimeen, P-4 gate per skooppi, P-5 dispatch.mjs ei käytössä, P-6 testiportit 18787/18788, P-7 `kursorit`-taulu. Tarkistettu scopes2-muunnoksessa 19.10.2026: P-6 → 18797/18798, muut säilyvät (luku 8).

- **19.10.2026:** Hylätty: Opus-reviewer katselmukseen (käyttäjä valitsi itse-katselmuksen); briefien kirjoitus omistajaskoopissa (käyttäjä: jatka tässä).

- **19.10.2026:** Fable 19.10.2026 (SUUNNITELMA.md luku 8): P-8 V2-portti 8797 (testit 18797/18798, P-6 päivitetty); P-9 adapteri tuo `import`illa vanhan `lahteet.mjs`/`viestit.mjs` puhtaat jäsennysfunktiot muuttamatta (puretaan ARK-16:ssa); P-10 V2:lla oma Bearer-avain `~/.config/scopes2/avain`, silta käyttää vanhan avainta vain 8787:ään; P-11 bundle-id:t `com.example.scopes-v2` (iOS), `com.example.scopes-v2.mac`, näyttönimi scopes-V2. P-1…P-5, P-7 säilyvät; P-3 lukutilassa vain `vie --kuiva`.

- **19.10.2026:** T-26-numeroa ei käytetä uudelleen; uudet tehtävät T-29…T-35. ARK-12 alkaa T-19:n jälkeen (koodiriippuvuus vain T-17/T-18), poikkeama arkkitehtuurin "riippuu ARK-05" -riviin kirjattu lukuun 5.

- **Käyttäjä 19.10.2026 (välitetty `scopes macos` -istunnosta, `/tmp/scopes2-t36-pyynto.md`):** ytimen muistivika korjataan arkkitehtuuri- ja toteutussuunnitelman puitteissa: T-36 (`scopes2 ydin`, Opus) ennen T-34:ää. Kirjattu (agentti, väitteet tarkistettu lähteestä): `peili.rs:65` → `varasto.listaa("peili")` (`varasto.rs:173`) lataa koko peilin, kutsujat `nakymat.rs:822`/`:888`; `replikointi.rs:128` `listaa_etuliite("")`; `dmesg -T` 17.59 scopes-solmu anon-rss 4 239 248 kB; `oom_score_adj` -950. Lisätty T-36, T-37 (`scopes2 adapteri`, `kaynnista.sh`), T-34:n ehto `VmHWM` < 512 MiB (suunnittelijan raja: perustaso 56–79 Mt + suurin transkripti 35 Mt täyteen lukuun), luvun 10 riski ajonaikaisesta muistista. Pyynnön väite "nostoon ei tarvita rootia" ei todentunut (`echo 1000 > /proc/self/oom_score_adj` → "Lupa evätty", tila 0400). Arkkitehtuuriin ei muutosta.

- **Käyttäjä 19.10.2026 (välitetty `scopes macos` -istunnosta, `/tmp/scopes2-t37-muutos.md`; agentti todensi):** T-37 käyttää `oom_score_adj`:n sijaan kovaa RLIMIT_DATA-rajaa `kaynnista.sh`:ssa (ydin 1572864 KiB, adapteri 1048576 KiB; `SCOPES2_YDIN_DATARAJA`, `SCOPES2_ADAPTERI_DATARAJA`), koska `oom_score_adj`-nosto vaatii rootin myös ssh-kuoressa. Todennettu: `( ulimit -d 307200; node <600 Mt> )` → exit 134; `( ulimit -d 1572864; exec scopes-solmu --portti 18799 … )` → terveys 200, "Max data size 1610612736", VmRSS 8 Mt. T-36:n muistimittaus asettaa saman `ulimit -d` -rajan itse, joten T-36 ∥ T-37 ja T-34 ajo 4 vasta molempien jälkeen. T-36: `peili::rivit` säilyttää tiedostonimen tarkistuksen välihaun jälkeen (tiedosto "a:b" osuu "a":n väliin), testi "a" ja "a:b". `oom_score_adj` jää infran asiaksi (käynnistysketju rootina; käyttäjän `/vika infra`).

- **19.10.2026:** Hylätty: vanhojen briefien siirto `briefit/vanha/`-hakemistoon (poistettu gitistä, commit-viite riittää); jäsennyskoodin kahdentaminen adapteriin nyt (P-9 vaihtoehto).

- **19.10.2026:** Käyttäjä 19.10.2026: T-36/T-37 kirjataan omistajien rekistereihin (scopes2 ydin, scopes2 adapteri, scopes kordinaattori); scopes2 ydin -skoopin seuraava paketti YDIN-T36-MUISTI.

- **Koordinaattori 19.10.2026 (käyttäjän yövaltuus, VALVOJA.md 2.3, YOLOKI 873cf41c; TOTEUTUSSUUNNITELMA-VAIHE-3):** ARK-10 tehtävätasolle ensin. Agentti todensi esiehdot lähteestä (37edddb0, 6ea06bfa, b3a6ec42, a873ac53), `/usr/bin/chromium` 155, Node 22.23.3 riisuu tyypit ilman lippua, npm-rekisteri vastaa, Playwright ei asennettu. Kirjattu: S-7 (staattinen tarjoilu `/web/*` tunnistamatta, CSP, asiakkaan Bearer fragmentista; S-6 ennallaan), P-12 (virta `fetch`-virtana, koska `EventSource` ei lähetä otsakkeita; vahvistaa P-2:n), P-13 (typescript 5.9.3, esbuild 0.25.12, playwright-core 1.63.0 ≥ 2 vk vanhoja + järjestelmän Chromium), H-11 (`scopes2 web` -skooppi, ei ole olemassa), H-12 (todellinen viestin lähetys käyttäjälle), luku 11.1: T-38-G, T-40…T-43 (`scopes2 web`), T-39 (`scopes2 ydin`, `web.rs`), T-44 valvojan hyväksyntäajo; kaikki Sonnet, Budget-summa 1,30 M. Portti `scopes2/web/gate.sh` rekisteröi kaikki tapaukset T-38-G:ssä, jotta rinnakkaiset T-41 ∥ T-42 eivät muuta yhteisiä tiedostoja.

- **Koordinaattori 19.10.2026 (VAIHE-3 jatko):** ARK-08 ja ARK-09 tehtävätasolle Macille, muut karkeina. Agentti todensi Macilta (ssh, lukeva): Xcode 27.1, macOS 27.0.1, xcodegen 2.46.0 (`/opt/homebrew/bin`), rustup-kohteet aarch64-apple-ios/-ios-sim/-darwin, simulaattorit iPhone 17 Pro ym.; vanha iOS-äppi ei käytä jaettuja paketteja (omat kopiot), vanha kehitys tar-putkella. Kirjattu: S-8 (S-8a äpin sisäinen ydin C-rajapinnalla, portti 0, avain kutsujalta; S-8b liitteet ytimen reitillä, synkroninen työntö vertaiselle), P-14 (Macin ssh-tunneli 18797 → 8797, silta ketjuna äpin ydin → palvelimen ydin → 8787), P-15 (yksi Apple-portti `scopes2/shared/gate.sh`), P-16 (ad-hoc-allekirjoitus yöllä), P-17 (peili iPhonessa arkkitehtuurikysymys H-16: tuotannossa 2,5 Gt vs. oletus 38 Mt), H-13…H-17; luku 11.2: T-45-G, T-46 (Opus), T-50, T-47, T-48, T-49, T-51 valvoja; luku 11.3: T-52, T-53 valvoja; luku 11.4 muut paketit karkeina esteineen. Budget-summa Apple 2,15 M.

- **19.10.2026:** Koordinaattorin valtuudella (S-1…S-6 muutettavissa, K ei): S-7 ja S-8 uusina sopimuksina, S-6 ennallaan.

- **19.10.2026:** P-12 virta selaimessa fetch-virtana (EventSource ei lähetä otsakkeita); hylätty eväste/query-avain (muuttaisi S-6:n tunnistusta, vuotaa lokeihin).

- **19.10.2026:** P-13 typescript 5.9.3, esbuild 0.25.12, playwright-core 1.63.0 + järjestelmän Chromium; hylätty TS 7 ja Playwrightin oma selain.

- **19.10.2026:** T-39 liittää web-reitit main.rs:ssä (`api::router(tila).merge(web::reitit(…))`), jotta `api.rs` ja `Tila` eivät muutu.

- **19.10.2026:** Porttitapaukset rekisteröidään G-tehtävissä valmiiksi (T-38-G, T-45-G), jotta rinnakkaiset tehtävät eivät muuta porttia.

- **19.10.2026:** P-14 Macin ssh-tunneli 18797 → 8797, silta ketjuna äpin ydin → palvelimen ydin → 8787; P-15 yksi Apple-portti `scopes2/shared/gate.sh` (P-4:n poikkeus); P-16 ad-hoc-allekirjoitus yöllä; P-17 peili fyysisessä iPhonessa = arkkitehtuurikysymys (ei päätetä yöllä, VALVOJA 3.3).

- **19.10.2026:** S-8a C-rajapinta ilman UniFFI:a (P-1), portti 0 (macOS-äppi ja simulaattori samalla Macilla).

- **19.10.2026:** H-14/H-15 H-17:n yhteyteen; testit tilapäisellä tunnelilla koeytimeen, ei tuotannon 8797:ään (koordinaattori 19.10.2026 klo 22.05 ja 22.10).

- **19.10.2026:** Macin rakennusvaiheet yhden `lockf`-lukon alla (macOS:ssa ei flock).

- **19.10.2026:** Käyttäjä valitsi: `/vika scopes2 shared` -tekstiä gate.sh-muutoksesta ei kirjoiteta nyt ("Ei nyt").

- **20.10.2026:** Mittausrivien likiarvot (~NN k) → `tokenit: null`, likiarvo huom-kenttään (koordinaattori: "Merkitse puuttuva tieto null-arvoksi, älä arvioi"). Hylätty: likiarvo kokonaislukuna.

- **20.10.2026:** T-51 käyttää portin T-49:n koeydin- ja tunnelivaihetta; portin T-51-tapausta ei lisätty (toisen skoopin `scopes2 shared` tiedosto, TYÖTAVAT 15).

- **20.10.2026:** Käyttäjä 20.10.2026 pakkauksessa (AskUserQuestion): seuraava paketti V-615 P-riviksi (hylätty "Ei nyt" ja "V-585 kuittaus").

- **20.10.2026:** Käyttäjä 20.10.2026 (AskUserQuestion tässä istunnossa): valmistellaan H-17-ohje odotusaikana; hylätty "Odota T-51:tä".

- **20.10.2026:** Ohje ei ole hyväksyntä: muuttavat vaiheet kysytään ajohetkellä (H-17-OHJE.md alku).

- **20.10.2026:** Käyttäjä 20.10.2026 klo 18.35 (välitetty scopes macos -istunnosta c68b88a3): kaikki scopes2-istunnot pakataan ja avataan uudelleen Macilla `mac:~/sessions-repo` (puhdas klooni, kaikki repot) palvelimen muistipulan takia.

- **20.10.2026:** Raakarivit S-9f omana tehtävänä T-60 (arkkitehtuurin 1985e26d mukaan), ei T-56:een (koordinaattori ehdotti T-56-briefiä; T-56 on jo Opus 400 k).

- **20.10.2026:** P-6 koeportit: ydintestit vapaisiin portteihin, porttien koeytimet 188xx (shared 18800–18819, adapteri 18820/18821); kiinteinä Macin 18797, 18787, 18861/18862, web 18788–18796. gate.sh-muutokset tekevät omistajat (V-624…V-626).

- **20.10.2026:** Käyttäjä pakkauksessa: seuraava V-609 lisäehdolla ARK-11 kahtia — oneplus = headless-solmu + web ilman Tauria; Linux-äppi (scopes2 linux, Tauri-kuori palvelimella) omaksi paketikseen, koska käyttäjä haluaa iOS- ja Linux-äpin kehitykseen vanhan rinnalle; koordinaattori avaa scopes2 linuxin, kun T-44 on hyväksytty ja palvelin vastaa.

- **20.10.2026:** ARK-11 kolmeen osaan (11a oneplus headless + web, 11b Linux-äppi, 11c Windows); Windows erotettiin 11b:stä, koska sen este (H-8) on eri.

- **20.10.2026:** Käyttäjä (pakkauksen kysymys): pakataan nyt, seuraava paketti ei mitään — odottaa T-52:ta ja scopes2 ydintä.

- **20.10.2026:** Käyttäjä (automaattisiirron kysymys): seuraava paketti pysyy HEADin rivinä "ei mitään — odottaa scopes2 ydintä"; hylätty "pakkaa vain".

- **20.10.2026:** Käyttäjä 20.10.2026 (AskUserQuestion): "Päivitä tilarivit ja pakkaa" — ARK-16:n ja ARK-18:n tehtävätaso seuraavaksi paketiksi, ei kirjoiteta tässä keskustelussa. Hylätty: "Kirjoita ARK-16 ja ARK-18" heti (koordinaattori pyysi sitä myöhemmin; käyttäjän valinta voittaa).

- **20.10.2026:** Koordinaattori 20.10.2026: scopes2-istuntojen ajoituksen päättää koordinaattori (käyttäjän linja 20.10.); scopes/-kirjoitukset tauotetaan koordinaattorin porttivuoroilmoituksesta (T-44:n portti tarkistaa scopes-aidan).

- **21.10.2026:** scopes overseer käyttäjän valtuudella 20.10.2026: S-9b-poikkeama korjataan tehtävällä T-61 T-56:n jälkeen ja ennen T-57:ää; sopimusta ei muuteta (V-614).

- **21.10.2026:** Siemennetty koeskooppi, ei mock-V1 (AskUserQuestion istunnossa b160c2fe 20.10.2026; koordinaattorin mukaan vastaaja scopes overseer käyttäjän valtuudella): tehtävä T-62 skoopille scopes2 shared.

- **21.10.2026:** S-9f-tarkennukset T-60:n toteutuksen mukaan (luku 4), asiakkaat noudattavat niitä.

- **21.10.2026:** Fable (ARK-16-ARK-18-TEHTAVATASO): S-10 (adapterin toimintareitit) ja P-19 (ydin välittää adapterin julkaisemat reitit loopback-porttiin 8798; ilman `--adapteri`-lippua käytös ennallaan); luku 11.6 ARK-16: T-63-G, T-64 (ydin, Mac P-18), T-65 (P-9-kopiot), T-66, T-69, T-67, T-68 (Opus), T-70 valvoja + H-18; luku 11.7 ARK-18: T-71, T-72 valvoja. Briefit 8 kpl, Budget-summa 2,20 M (ARK-16 1,95 M, ARK-18 0,25 M). Lähdefaktat kahdella Explore-sonnet-aliagentilla (60 k + 111 k), ratkaisevat kohdat tarkistettu pääistunnossa (`silta.rs`, `shared/gate.sh`, `kaksi-laitetta.sh:23`, `Solmu.swift:64-69`, `ffi.rs:63`, `viestit.mjs:239`, `toiminnot.mjs:88`, 8798 vapaa `ss -ltn`). Liite on jo ytimessä (S-8b, T-50), joten ARK-16:n liiteosa on valmis.

- **21.10.2026:** scopes overseer käyttäjän valtuudella (vastasi tämän istunnon AskUserQuestioniin): P-19/S-10 hyväksytty ("Hyväksy ja committaa"); hylätty "Katselmoin ensin".

- **21.10.2026:** scopes overseer käyttäjän valtuudella: ARK-16:n adapteritehtävät (T-63-G, T-65…T-69) ajetaan palvelimella; hylätty Macin klooni ja "Koordinaattori päättää". Ydin T-64 Macin kloonissa (P-18).

- **21.10.2026:** scopes overseer käyttäjän valtuudella: ARK-16:n listan ulkopuolisista sillatuista reiteistä (`malli`, `arkistoi`, `uusi`, `asetukset*`, `kayttoraja`, `viat`, `diagnostiikka`, `android*`, `palvelin*`, `kordinaattori*`, `GET /api/agentit`) kirjoitetaan vika-teksti `scopes architecture`lle, overseer välittää sen (sessions-repo-73); hylätty "Ei nyt".

- **21.10.2026:** Hylätty (P-19): toiminnot muutoslokin kautta (muuttaisi asiakkaiden synkronisen vastauksen ja S-6:n), adapteri vanhan välittäjänä (vanha avain adapterille, P-10), kiinteä adapterilista `silta.rs`:ssä (ytimen käännös reittiä kohden).

- **21.10.2026:** Poikkeamat arkkitehtuurin polkulistoihin (toteutussuunnitelman "miten"): ARK-16 ytimessä myös `main.rs`, `api.rs`, `solmu.rs`, `ffi.rs` (vain asetus); ARK-18 myös `Solmu.swift` (vain `versio`) ja UI-testien käynnistys, koska Apple-portti ei voi antaa äpille argumentteja (vain `TEST_RUNNER_*`, `shared/gate.sh:338-371`).

- **21.10.2026:** T-57-rivi korjattu koordinaattorin pyynnöstä (scopes overseerin kautta, 3d4c6300): ikkunoinnin aika on HLC eli tuontihetki → tarkistus (2) max(nyt − 7 vrk, karsintaraja), (4) ja (7) karsintarajan alapuolelta; kopio python3:n `Connection.backup`illa, koska palvelimella ei ole `sqlite3`-komentoa.

- **21.10.2026:** Käyttäjä pakkauksessa (AskUserQuestion, kaksi kysymystä): ensin "ARK-16-LOPUT-ARK-19" arkkitehtuurin vastauksen (dfc28af4) jälkeen, sitten T-57:n hylkäyksen jälkeen "ARK-17-KORJAUS ensin"; hylätty "ARK-16-LOPUT-ARK-19 ensin" ja "Molemmat tässä sessiossa". Arkkitehtuuri 5368d699: ikkunan ja karsinnan aikaperusta on peiliyksikön sisältöaika (rivien uusin `timestamp`, puuttuessa HLC), ei HLC-tuontiaika; korvaa 3d4c6300:n T-57-tulkinnan.

- **21.10.2026 (ARK-17-KORJAUS; AskUserQuestion-valinta "Aloita ARK-17-KORJAUS", automaattijatko pois; seuraavan valinnan "Aloita ARK-16-LOPUT-ARK-19" teki scopes overseer b5):** S-9:ään "Sisältöaika" (skeema 2, `/api/listat`-kenttä `sisaltoaika`) ja sen käyttö S-9a/b/c:ssä ja koko-reitissä (T-73). S-9a riisuu näkymän tarpeeseen (T-74): liput, tool_use nimellä ja `tyokalu_rivi`n avaimilla (ensimmäinen rivi enintään 2 000 merkkiä), AskUserQuestionin `questions` kokonaan, tool_result-lohkon `tool_use_id` ja `toolUseResult.answers`. Peruste: T-57 (4) ja `nakymat.rs:916-987`. Tämä laajentaa K-10:n "viestitekstin" näkymän tarpeeseen; työkalutulokset ja ajattelu jäävät pois, ja T-74 mittaa kokosuhteen. Pohja haetaan heti (T-75), ja täyden solmun muistikorjaus tehdään mittaus edellä (T-76, Opus). T-57-rivin (2)(4)(7) sisältöaikaan; (4) ja (5) tarkennettu, ajo 1 merkitty hylätyksi, uusinta T-76:n jälkeen, ja tuotantokopioon kysytään hyväksyntä uudelleen. T-58 riippuu T-57:n uusinnasta. T-55:n riskit arvioitu: ei toteutunut T-57:ssä ((3) 0, (2) id:t samat), ei korjaustehtävää.
- **21.10.2026 (koordinaattori scopes overseerin kautta):** T-44 riippuu T-76:sta (muistiehto) ja uudesta T-78:sta (tuotantobinääri). T-78 = Macin ristikäännös `aarch64-unknown-linux-gnu.2.36` `cargo-zigbuild`illa, `reqwest` ilman TLS:ää (palvelin Debian 13, glibc 2.41; nykyinen binääri linkittää libssl:n); asennus `julkaise.sh --asenna` T-44:ssä. Palvelinkäännökseen ei ehdoteta poikkeusta; jos ristikäännös estyy, käyttäjä päättää overseerin kautta.

- **21.10.2026:** T-74: riisunta laajenee näkymän tarpeeseen (liput, tool_use nimellä ja `tyokalu_rivi`n avaimilla ensimmäisenä rivinä ≤ 2 000 merkkiä, AskUserQuestion `questions`, tool_result `tool_use_id`, `toolUseResult.answers`); peruste T-57 (4) ja `nakymat.rs:916-987`; laajentaa K-10:n "viestitekstin" (työkalutulokset ja ajattelu jäävät pois); T-74 mittaa kokosuhteen. Hylätty: (4):n tarkistuksen löysääminen tekstiviesteihin.

- **21.10.2026:** T-75: pohja haetaan heti (tasaa, virta, käynnistys, karsinta); hylätty: väliaikainen numerointi ilman pohjaa (rikkoisi vakaat tunnisteet).

- **21.10.2026:** T-76 Opus, mittaus ennen korjausta synteettisellä peilillä; tuotantokopio vain T-57:n uusinnassa.

- **21.10.2026:** T-55:n riskit suljettu: karsintarajan nosto ei toteutunut T-57:ssä ((3) 0, (2) id:t samat); `kaksi_solmua_ikkuna` ~67 s hyväksytään.

- **21.10.2026:** T-78: Macin ristikäännös `cargo zigbuild --target aarch64-unknown-linux-gnu.2.36`, reqwest ilman TLS:ää; palvelinkäännökseen ei ehdoteta poikkeusta; jos ristikäännös estyy, käyttäjä päättää overseerin kautta (koordinaattori 21.10.2026).

- **21.10.2026:** Seuraava paketti ARK-16-LOPUT-ARK-19 (AskUserQuestion pakkauksessa 21.10.2026, vaihtoehto "ARK-16-LOPUT-ARK-19 (suositus)"; hylätty "Ei seuraavaa pakettia — pakkaa vain"). Edellisen valinnan "Aloita ARK-16-LOPUT-ARK-19" teki scopes overseer b5 ruudussa.

- **21.10.2026:** Käyttäjä 21.10.2026 (AskUserQuestion): T-73:n may-laajennus ja T-57 (9) — "Hyväksy molemmat"; hylätty "Vain may-lista" ja "Hylkää".

- **21.10.2026:** Käyttäjä 21.10.2026: T-74:n may-laajennus — "Hyväksy"; S-9a lohkoton rivi — "Säilytä model ja effort"; hylätty "Sopimus ennallaan".

- **21.10.2026:** Käyttäjä 21.10.2026 (automaattijatko false, AskUserQuestion): "Aloita ARK-16-LOPUT-ARK-19".

- **21.10.2026:** Toteutussuunnitelma 21.10.2026: lisäreitit saavat oman runkonsa T-79-G T-63-G:n jälkeen (T-63-G pysyy ennallaan); ytimen siltamuutokset T-64:ään (ei aloitettu); agentit-haarautus `valita`ssa; kayttoraja muu ryhmä → 404 (sallittu ero); agy-luvat lipun takana alasajoon asti; ARK-19:n ytimen luku T-84:ssä.

- **21.10.2026:** Alustapäätös (käyttäjä, patriot 44e8d956): kirjattu luvussa 11.4. Arkkitehtuuri (73) vahvisti, että päätös on prioriteetti, ja teki eca4c32e:n (ARK-11 cron palvelimella; ARK-19:n polkuihin lahdetila.rs).

- **21.10.2026:** Overseer b5 21.10.2026 (valtuus käyttäjältä): ARK-11a-headlessin tehtävätaso heti, kysymättä käyttäjältä.

- **21.10.2026:** Käyttäjä 21.10.2026 (KEHITYSMALLI.md luku 2, välitti b5): vain overseer ja patriot käyttävät PushNotificationia; muut käyttävät SendMessagea omistajalle, ja käyttäjän päätökset kulkevat overseerin kautta.

- **21.10.2026:** Käyttäjä 21.10.2026 klo 10.5x (patriot 1269d843): "Tiputetaan sittenkin oneplus server odottamaan ja jatetaan ios ja macos" + "ARK-16 jatkuu" → ARK-11a odottaa (T-90, pysyvä käynnistys); iOS, macOS (myös ARK-18) ja ARK-16 jatkuvat; ARK-19 ennallaan. Klo 10.4x:n macOS-pysäytystä ei toteutettu (luonnos poistettiin ennen committia).

- **21.10.2026:** Toteutussuunnitelma: T-85 tekee laiteolion kytkennän (ei erillistä tehtävää); `ymp.paikalliset` pieneksi jatkoksi ennen T-70:tä; kierroslukko kirjaukseksi (korjataan, jos T-70:n lokissa näkyy päällekkäisiä kierroksia); MAC_AGY_MODUULI ja vakiokopioiden purku vanhan alasajon ehdoiksi.

- **21.10.2026:** Koordinaattorin päätökset kirjattu: testiapurit.mjs, yhteinen toimintolukko, t65:n osakopiotuki, T-79-G:n ja T-85:n poikkeamat.

- **21.10.2026 (SUUNNITELMA-SEURANTA; automaattijatko false, AskUserQuestion "Aloita SUUNNITELMA-SEURANTA"):** koordinaattorin (fe) raportit kirjattu lähteestä tarkistettuina. Luku 11.6: T-81 648c326d, `ymp.paikalliset` fb147c56 ja 502-korjaus 01a27e8c tehty; ytimen jono T-64 → T-84 (fb8ab71f). Luku 11.7: T-71 3b199453. Luku 11.8: T-86 15637f10 (vain mock); T-87 worktreessä, odottaa T-64:ää ja tuontia HEADin päälle. P-6 toteutettu kaikissa omistajissa (shared a59644e2: 18800–18819 ja Darwinin cargo `~/scopes2-rakennus/.lukko`; adapteri e887db67; ydintestit 840a6d75), joten 18798-kysymys on ratkaistu; P-14:n `shared/gate.sh`-rivitunnukset päivitetty. Briefit: T-84 (adapterin rungot `lahde.mjs:184-209`), T-87 (tuonti HEADin päälle, T-71/T-62-rajoite pois). T-81:n ja T-86:n briefit on toteutettu, joten niitä ei muutettu. Valmiit avoimet rivit (`ymp.paikalliset`, 502, koeportti 18798, P-6 gate.sh) poistettu.
- **21.10.2026:** Automaattitilan luokitin esti kaksi toisen istunnon pyytämää muutosta (commit "Instruction Poisoning", palautus ja kirjoitus "Modify Shared Resources"); käyttäjän AskUserQuestion-hyväksynnät avasivat ne.

- **21.10.2026:** (agentti, SUUNNITELMA-SEURANTA): P-6:n koeporttikysymys (18798 vai 18800) on ratkaistu, koska shared toteutti P-6:n (a59644e2). P-6:ta ja P-14:ää ei muutettu sisällöltään; vain tila ja rivitunnukset päivitettiin.

- **21.10.2026:** T-81:n ja T-86:n briefejä ei tarkennettu, koska tehtävät on jo toteutettu.

- **21.10.2026:** Luvun 11.7 lähtötilan rivitunnukset (`gate.sh:338-349`) jätettiin ennalleen, koska ne ovat kirjoitushetken tilannekuva.

- **21.10.2026:** Käyttäjä valitsi pakkauksessa (AskUserQuestion) seuraavaksi paketiksi SUUNNITELMA-SEURANTA-2. Hylätyt vaihtoehdot: "Ei mitään, odottaa ydintä" ja "pakkaa vain".

- **21.10.2026:** (toteutussuunnitelma briefin omistajana; pyyntö 8c → fe → tämä istunto): T-64:n poikkeamat hyväksytty. - Yksi `Tila.adapteri`-kenttä. - may laajeni 17 testitiedostoon vain `Default`-rivillä (E0063, ennakkotapaus T-55). - Reittihaku 5 s välein, kunnes lista tunnetaan (S-10 tarkennettu). - Haarautus `valita`ssa. - `tests/silta.rs` ennallaan; uusi asetuspolku testataan `silta_adapteri.rs` (i):ssä. - Käyttäjältä ei kysytty, koska koordinaattori osoitti päätöksen tälle skoopille ja T-64 oli kiireellinen.

- **21.10.2026:** T-57 hyväksytty (overseer 28 ruutuvastauksena käyttäjän valtuudella; hylätty "Todenna nyt synteettisesti", "Odota").

- **21.10.2026:** T-70 A: adapteri vanhaan scopes-chatiin (T-95), ei kopiota (Mac Skoopit kirjoittaa 8787:n kautta); kumoaa T-69:n sallitun eron; T-95 ennen T-94:ää. Hylätty: historian kopiointi.

- **21.10.2026:** T-70 B: (7):n kayttoraja-kohdat 8797:n vastauksella (Contract-muoto); vanhan kayttoraja.mjs:n jumi = scopes palvelun oire, koordinaattori kirjaa (/vika).

- **21.10.2026:** T-70 hyväksytään, kun (7):n loput, (6) H-18 ja T-95:n jälkeinen chat-vertailu OK.

- **21.10.2026:** Käyttäjän päätökset koordinaattorin kautta: T-58 toteuttaja iOS (e0 → d5), alkaa IOS-H17:n ja T-87:n jälkeen; asennus ja T-70-tuotantoajo kysytään erikseen.

- **21.10.2026:** I-1/P-11: käyttäjä "Poista vanha scopes äppi" (~15.20, välitti overseer 58); iPhonessa vain V2, Mac pitää Skoopitin.

- **21.10.2026:** T-70 hyväksytty 21.10.2026 klo ~17.3x: koordinaattori 20 käyttäjän delegoinnilla (V-OVS-4). Vastaus "Hyväksy" oli ruutuvastaus, ei käyttäjän oma valinta. ARK-16 on valmis.

- **21.10.2026:** T-59 ajetaan iOS d5:llä heti; koordinaattori 20 antoi Mac-UI-vuoron (ruutuvastaus tämän istunnon dialogiin). Simulaattoriosat ajetaan nyt; fyysisen iPhonen K-10 ja T-57:n (4)–(5) tehdään esiehtojen täyttyessä.

- **21.10.2026:** T-88: valvoja adapteri 34. Kohta (5) koeadapterilla 18822 alkaa heti. Kohdat (1)–(4), (7) ja rautakutsut odottavat käyttäjän omaa hyväksyntää overseerin kautta. Kohta (6) ajetaan Macilla T-59:n jälkeen. T-88:n hyväksynnän (ARK-19:n sulku) ratkaisee koordinaattori 20 delegoinnilla.

- **21.10.2026:** Agy Flash -ohjeet: overseer 05 peruutti pyynnön; työ on istunnolla sessions-repo-86.

- **21.10.2026:** agy-ohjeet T-72:lle ja T-59:n (a), (d):lle käyttäjän valinnalla, tarkennukset tiedostoissa `agy/T-72.md` ja `agy/T-59.md` (037cf6c4); ARK-19:n Android-äppiosa myöhemmäksi, T-87-UUSINTA ja T-88 (6) jatkuvat (SUUNNITELMA 11.8, b47b4a48).

- **21.10.2026 (SUUNNITELMA-SEURANTA-4, 79095bd7; agy-briefit 51131ebf):** ARK-17 hyväksytty, T-59 (4)(5) jälkitodennukseksi (SUUNNITELMA 11.5 "T-59:n tulos"); ARK-19:n palvelin-osa hyväksytty ilman omaa ajoa ja Android-rajaus (11.8); S-9f-asiakas jaettu, osa 1 = T-97 (11.5 "S-9f-asiakas"). Seuraava paketti AGY-TULOKSET AskUserQuestion-vastauksella 19.4x.

- **21.10.2026:** Muut `VIERAS`-skoopit pakkauksen skooppitarkistuksessa (scopes2 ydin/adapteri/shared, patriot, overseer, kordinaattori, macos) ovat toisten istuntojen muutoksia: ei vika.sh-kirjauksia tästä sessiosta.

- **28.10.2026 (SCOPES2-PALUU-JATKO, koordinaattori e0; käsitelty ennen AGY-OHJEISTUSta, koska esti scopes2:n paluuta):** S-5b laajennetaan `automaattisiirto`lla, adapteri ei suodata (V1 palauttaa avaimen; suodatus erottaisi V2:n 8787:stä, T-70 (7)); hylätty adapterin suodatus.

- **28.10.2026:** Jonon omistaa adapteri: S-5b-laji `jono` `{"<skooppi>":[{komento,aika}]}`, ydin ottaa `jonossa`-kentän siitä, silta varapolkuna (T-108 ydin ennen T-109 adapteria); hylätty: ydin omistaa.

- **28.10.2026:** V1-synkka kahdessa vaiheessa: T-110 kartoitus (A käytös → synkka, B uusi reitti/kenttä → sopimus, arkkitehtuurille jos ei mahdu S-5b/S-10:een, C ei käytössä); synkkabriefit raportin jälkeen.

- **28.10.2026 (overseer sessions-repo-15; käyttäjä 28.10.: "ei agy:tä eikä Flashia scopes2-työhön"; kulutus, 5 h raja ~9.30):** AGY-INTEGRAATIO-MACOS vaihe A ei käynnisty (ei kuulu 17.35-paluun listaan). KUIVA.md ja agy/T-72.md eivät aja: T-72 tekee scopes2 macos (Sonnet high), T-71-diagnoosiajo ensin (b3f9ed1f). `scopes/overseer/agy-vahti.md`:n ruutunimeä (overseerin tiedosto; ruutu nyt `siirto-scopes-overseer-074943`) ei päivitetä nyt.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| ARK-16-korjaukset T-103…T-111 (koordinaattorin SCOPES2-PALUU-JATKO 28.10.2026) | kesken 28.10.2026 (**T-110 valmis abd8a50b** (e6, raportti `scopes2/adapteri/vertailu/V1-SYNKKA.md`); **T-103 valmis f221b910** (portit /tmp-kloonissa GATE_SOLMU 7da86808: T-103 3 ok, T-25, T-89, T-92, T-94 EXIT=0; poikkeama hyväksytty: gate.sh:n t94 (c) odottaa nyt riviä "LUKKO: toinen kaynnista.sh käynnissä", koska briefin lukko muutti tulosteen, tarkoitus ennallaan; ei tuotantoon); briefattu 038c6589: SUUNNITELMA 11.6 "ARK-16-korjaukset 28.10.2026", S-5b-rivit :94-99, briefit/T-103…T-111.md; lähetetty adapteri-istunnolle e6 ja koordinaattorille e0); odottaa skooppia scopes2 adapteri | T-110:n raportin (`scopes2/adapteri/vertailu/V1-SYNKKA.md`) jälkeen A-luokan synkkabriefit ja B-luokan sopimuspäätökset; T-103…T-111 tulokset lukuun 11.6 |
| Vaiheiden 4–6 tehtävätaso kirjoittamatta | avoin (vaihe 3: ARK-10, ARK-08, ARK-09 luvuissa 11.1–11.3; ARK-17 luvussa 11.5; ARK-16 ja ARK-18 luvuissa 11.6–11.7 21.10.2026; muut karkeina luvussa 11.4) | ARK-11, ARK-13, ARK-14 ihmisvaiheiden jälkeen; ARK-16:n loput reitit arkkitehtuurin vastauksen jälkeen |
| H-17: laiteallekirjoitus ja asennus omalle iPhonelle ja Macille; pysyvä tunneliagentti (H-14) ja V2-avain Keychainiin (H-15) | avoin (käyttäjä päätti 20.10.2026, 851b0343: Xcodessa Macin työpöydällä T-51:n vihreän jälkeen, V2-avain Keychainiin samalla, H-14 päätetään T-51:n tuloksesta; ohje valmis `H-17-OHJE.md`, 5b1470d5; T-51 odottaa T-52:ta); odottaa ajoa **20.10.2026:** porttitörmäys todettu 20.10.2026: `scopes2/shared/gate.sh:189-194` avaa tilapäisen tunnelin Macin porttiin 18797; pysyvä H-14-agentti samaan porttiin törmäisi. | T-51 ajetaan T-52:n jälkeen (20.10.2026 T-52 9. ajo käynnissä klo ~18.10); T-51:n vihreän jälkeen käyttäjä Macin työpöydällä Xcodessa, agentti vaiheet 0–1 ja 6; ajohetken päätökset: (1) iPhone-osa nyt (vain allekirjoitus+asennus) vai ARK-14:n yhteydessä, (2) H-14 pysyvä agentti T-51:n tuloksesta, (3) 18797-törmäys gate.sh:n tilapäisen tunnelin kanssa (kumpi siirtyy; `scopes2 shared` -omistajan päätös). Macille siirtyessä palvelinsidonnaista H-17-OHJEessa: vaihe 0 `pgrep -f gate.sh` palvelimella ja `ss -ltnp`; vaihe 1 olettaa gate.sh:n tar-putken palvelimelta `mac:~/scopes2-rakennus/` (Macin kloonissa gate on paikallinen, `gate.sh:77` RAK=klooni/scopes2, `:223` Darwinilla ei siirtoa → Xcode-projektit `<klooni>/scopes2/{ios,macos}/` eikä `~/scopes2-rakennus/`); V-572 (palvelimen puu ainoa kirjoittaja) muuttuu kloonissa — päätös ei tämän skoopin; tuotannon V2 (8797) ja avain jäävät palvelimelle, tunneli ja `ssh palvelin` toimivat Macilta sellaisenaan |
| Opuksesta, Fablesta ja koodityöstä ei ole mittausrivejä (E-2) | avoin (todettu 19.10.2026) | pilotit T-16-G (Sonnet), T-17 (Opus), P-1 (Haiku); mittausrivi per tehtävä (`mittaukset/tehtavat.jsonl`) **19.10.2026:** E-1…E-6 lähteineen `scopes/toteutussuunnitelma/LOYDOKSET.md`; E-2 pura 6/6 %: flash 91 % (n=331), siirtaja-sonnet 63 % (n=349), haiku 54 % (n=236), opus/fable 0 riviä, koodityöstä ei mittauksia; E-3 resurssit mitattu 19.10.2026 klo 10:44. |
| Siltavertailun fixturet (T-35, T-31-G) haetaan vanhasta 8787:stä lukevilla curl-kutsuilla; vanhan muutos käyttäjän erillisestä pyynnöstä voi rikkoa vertailun | avoin (riski 19.10.2026, SUUNNITELMA luku 10; `scopes2 ydin`: T-31-G, T-35); odottaa skooppia scopes2 ydin | sallittujen erojen lista on briefeissä T-31-G ja T-35; tarkistetaan, kun ne ajetaan; ei vanhan jäädytystä |
| H-12: todellinen viesti web-asiakkaasta | avoin (pysäytetty 21.10.2026, alustapäätös; käyttäjä päätti 20.10.2026 (851b0343): heti T-44:n jälkeen käyttäjän ollessa paikalla) | ei ajeta ennen uutta päätöstä; T-44:n lupakysymys on koordinaattorilla (c6eebbbc) |
| T-44: V2-uudelleenkäynnistys `--web`-lipulla | avoin (19.10.2026; 21.10.2026 riippuu T-43:sta, T-76:sta ja T-78:sta, koordinaattori; pysäytetty 21.10.2026, alustapäätös) | ei ajeta ennen uutta päätöstä; koordinaattorin päätös ennen T-44:ää, kun T-43, T-76 ja T-78 ovat vihreitä |
| T-49:n lopullinen mittausrivi | avoin (20.10.2026); odottaa skooppia scopes kordinaattori | koordinaattori lähettää portin ajon luvut, tämä skooppi kirjoittaa lopullisen rivin tehtavat.jsonl:iin |
| 8787 jumittuu (V-613); koordinaattorin ehdotus V2:n sillan päivitysväli 15→120 s | avoin (20.10.2026); odottaa skooppia scopes kordinaattori | ei tämän skoopin päätös; tiedoksi |
| RunkoUITests.testViestitVastaavatPalvelinta riippuu ympäristöstä (T-49/T-52; V-605 kohdat 3 ja 5) | avoin 20.10.2026 (siemennetty koeskooppi, ei mock-V1: scopes overseer käyttäjän valtuudella, AskUserQuestion istunnossa b160c2fe; brief `briefit/T-62.md`, skooppi "test" koska /api/skoopit listaa vain sillan skoopit `nakymat.rs:1552`); odottaa skooppia scopes2 shared **21.10.2026:** Shared-portit T-47/T-48/T-49/T-52/T-58/T-71 käyttävät 8787-siltaa (`koeydin_alku`), joten ne on hylätty agylle (scopes2/shared/REKISTERI.md:96); ScopesCore2:n SolmuTests ohittaa itsensä ilman avainta (SolmuTests.swift:118). | T-62 skoopille scopes2 shared V-605:n todennuksen jälkeen |
| Raakarivien asiakasnäkymä (S-9f) | kesken 21.10.2026: osa 1 T-97 vihreä ja commitoitu daf6171b; osa 2 briefattu: T-101 (ydin `istunto.transkripti` + siltavertailu, agy Flash) ja T-102 (näkymä, Sonnet), SUUNNITELMA 11.5 "S-9f-asiakas osa 2" | T-101 agylle tai ajoistunnolle; T-102 Mac-UI-jonossa T-72:n jälkeen, kun T-97 ja T-101 on commitoitu |
| ARK-11a (oneplus headless-solmu + web ilman Tauria) | kesken (tehtävätaso luvussa 11.9: T-89 vihreä, T-90; T-90:n riskit luvussa 11.9); odottaa käyttäjää **21.10.2026:** todettu palvelimella 21.10.2026 (ssh, lukeva): `/etc/cron.d/scopes2` (root, 19.10.2026 21.25) ajaa `*/5` `kaynnista.sh`, H-5 tehty; ydin pid 12647 kuuntelee 127.0.0.1:8797 (`--vanha 8787`), binääri käännetty 19.10.2026 23.51; adapteri (pidit 12649) ei aja: `~/.local/state/scopes2-palvelu.loki:22110` ENOSPC (inotify `max_user_watches` 8192, `~/.claude/projects` 1 652 hakemistoa, `adapteri.mjs:126` rekursiivinen watch ilman error-käsittelijää); `kaynnista.sh:95-98` poistuu, kun ydin vastaa. | ei ajeta ennen käyttäjän uutta päätöstä (klo 10.5x); T-90 T-78:n jälkeen (H-5 SUUNNITELMA 11.4) |
| ARK-11b (Linux-äppi, `scopes2 linux`) | avoin (pysäytetty 21.10.2026, alustapäätös) | aloitusta mietitään, kun macOS, iOS ja palvelin toimivat; Rust ja webkit2gtk-4.1 palvelimelle ihmisen root-komennoilla |
| ARK-18 toteutus (T-71, T-72) | kesken 28.10.2026 (T-70 hyväksytty; T-71 vihreä 3b199453; T-72 21.10.2026: (1) ja (4) OK, (2)(3) ei kelpaa lukitun näytön vuoksi, ohje korjattu, SUUNNITELMA 11.7 "T-72:n tulos"; ARK-16-rivin historia ARKISTO.md); odottaa skooppia scopes2 macos (T-72 tekee scopes2 macos Sonnet high, T-71-diagnoosiajo ensin b3f9ed1f; overseer 28.10.2026) | T-72 osa B korjatulla `agy/T-72.md`:llä Mac-UI-jonossa T-71-diagnoosin jälkeen |
| ARK-16:n loput ja ARK-19:n toteutus (T-79-G…T-88) | kesken 21.10.2026 (T-79-G, T-80, T-81 648c326d, T-82, T-83, T-85, T-86 15637f10 vihreät; T-64 9a9fb3bc, T-84 b9544ef8 ja T-87 00cce758 vihreät; SUUNNITELMA 11.6 ja 11.8 21.10.2026); odottaa konetta mac **21.10.2026:** luvun 11.6/11.8 taulukoiden mukaan ARK-16 = T-63-G…T-84 ja T-70, ARK-19 = T-85…T-88 (patriotin "ARK-16 (T-79…T-88)" oli virheellinen). | Mac: T-70 (T-64:n, T-84:n ja T-87:n tulokset kirjattu lukuihin 11.6 ja 11.8) |
| ffi.rs adapteri-kenttätesti | avoin (kirjaus, ei tehtävää) | seuraavassa ffi.rs-briefissä |
| agy-ohjeiden ajo (T-72, T-59) ja `agy/KUIVA.md` | avoin 28.10.2026: ei ajeta (käyttäjä: ei agy:tä scopes2-työhön; overseer); `agy/T-59.md` "EI AJETA nyt" (T-59-uusinta punainen 28.10., ios-diagnoosi); odottaa skooppia scopes2 ios | kun ios-diagnoosi on valmis ja agya taas käytetään: päivitä `agy/T-59.md`; vaiheen 1 aukkolista (a)–(e) on korjattu `agy/README.md`:ssä ja `agy/T-72.md`:ssä (e0868e86) |
| ARK-19 Android-äppiosa | avoin (myöhemmäksi 21.10.2026, ei päivää; rajaus SUUNNITELMA 11.8 "Android-rajaus": T-87:n Android-paneeli ja 4 UI-testiä, T-88 (6), T-87-UUSINTA, laitekäyttö); odottaa käyttäjää | käyttäjän uusi päätös |
| ARK-17:n jälkitodennukset | avoin (ARK-17 hyväksytty 21.10.2026; jälkitodennus, ei ehto); odottaa ajoa | `t59-tuotanto.sh` ensimmäisestä skoopillisesta tuotantoistunnosta; K-10 fyysisellä iPhonella (SUUNNITELMA 11.5 "T-59:n tulos") |
| ARK-18 T-71/T-72 ja ARK-11a T-90: tulosten kirjaus | avoin (21.10.2026); odottaa skooppia scopes2 macos (T-71/T-72) ja käyttäjää (T-90) | kun scopes2 macos raportoi T-71/T-72:n: kirjaa luvut 11.7 ja 11.9 |
| Agy-integraatio macOS-äppiin (A näkymä, B kirjoitus, C chat-synkka) | avoin; pysäytetty overseerin päätöksellä 28.10.2026 (käyttäjä: ei agy:tä scopes2-työhön); vaatimus yhä `scopes/overseer/viestit/agy-integraatio-macos.md`:ssä, ei kirjattu SUUNNITELMA.md:hen; odottaa käyttäjää | ei ajeta ennen käyttäjän tai overseerin uutta päätöstä. A: tarkista S-5b agy, T-29 ja /api/skoopit agy-kenttä; kirjaa vaatimus SUUNNITELMA.md:hen. B ja C: arkkitehtuurikysymys scopes architecturelle overseerin kautta (tmux send-keys vs agy-SQLite vs agy CLI, E-25, Android-vapaus 5736f24e) |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/toteutussuunnitelma/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
