# scopes patriot — scopes2-ajon aikatauluennuste (omistaja scopes patriot 21.10.2026; aiemmin scopes overseer, scopes macos)

Palautettu 20.10.2026 transkriptista. Alkuperäinen syntyi scopes macos -istunnossa 28f5f18b (palvelin, 19.10.2026).
Istunto suljettiin pakkaamatta: äppiarkistointi 19.10. klo 20.18 ja sen jälkeen ARKISTO-AUTOSULKU. Siksi taulukko ei
päätynyt pakettiin. Lähde: `~/.claude/projects/-home-user-palvelin/28f5f18b-5ca1-41d3-9ebd-680e09cfd7bd.jsonl`.
Osiot 1–3 ovat sanatarkkoja. Osio 1 kysyttiin 19.10. klo 15.44 (AskUserQuestion), ja käyttäjä valitsi "Ei kirjata,
arvio riitti" toteutussuunnitelman rekisteriin. Tähän tiedostoon se palautettiin käyttäjän pyynnöstä 20.10.2026.

## 21.10.2026 klo 17.4x — Clauden kulutusjakauma agy-siirron jälkeen (scopes patriot)

Pyyntö: "Selvitä mikä jää suurimmaksi tokenien syöjäksi agy muutoksen jälkeen?" Kirjaus käyttäjän valinnalla "Aikatauluennusteeseen".

Mittaus: Macin transkriptit `~/.claude/projects/-Users-user-sessions-repo/*.jsonl` ja niiden `subagents/*.jsonl`, skooppi istunnon `/pura`-rivistä, viesti-id:n mukaan kerran. Painot: Opus 1, Sonnet 0,6, Haiku 0,2; input 1, cache_write 1,25, cache_read 0,1, output 5. Yhteensä 154,0 M (19.10. alkaen) ja 95,0 M (21.10.) painotettua. Fable 0 %: toteutussuunnitelma ja architecture ajoivat Macilla jo Opuksella, joten Opus 5.5 -päätös ei siirrä kuormaa kiintiöstä toiseen. agy-skoopit (scopes2 ydin, shared, adapteri, ios) olivat 36,1 % (19.–21.10.) ja 41,1 % (21.10.); scopes2 macos ei näkynyt omana skooppinaan.

| Jää Claudelle | 21.10. osuus kaikesta | Osuus jäljelle jäävästä | 19.–21.10. osuus kaikesta |
|---|---|---|---|
| toteutussuunnitelma | 16,8 % | 29 % | 13,4 % |
| overseer | 13,8 % | 23 % | 10,9 % |
| kordinaattori | 9,5 % | 16 % | 12,4 % |
| patriot | 7,4 % | 13 % | 4,5 % |
| vahtimestari (Haiku) | 4,3 % | 7 % | 3,0 % |
| scopes macos (vanha) | 2,3 % | 4 % | 11,6 % |
| architecture | 1,7 % | 3 % | 1,8 % |
| web (pysäytetty) | 1,2 % | 2 % | 1,8 % |
| kordinaattori vahti | 0 % | 0 % | 2,0 % |

Erittely 21.10. (pyyntö "Mikä ei agy syö eniten?"): kolme suurinta jäljelle jäävää.

| Skooppi | API-kutsuja | Keskikonteksti | cache_read | cache_write | output | Istuntoja |
|---|---|---|---|---|---|---|
| toteutussuunnitelma | 712 | 147 k | 61 % | 20 % | 19 % | 9 |
| overseer | 696 | 150 k | 77 % | 10 % | 13 % | 5 |
| kordinaattori | 443 | 151 k | 73 % | 12 % | 15 % | 4 |

Kulu tulee ~150 k:n kontekstin uudelleenluvusta joka kutsussa (61–77 %), ei vastausten kirjoittamisesta (13–19 %). Toteutussuunnitelman 9 istuntoa kirjoittavat kontekstin välimuistiin alusta (cache_write 20 %). Overseerin ja kordinaattorin kulu tulee monista lyhyistä valvontavuoroista; vipuja ovat aikaisempi pakkaus (pienempi konteksti) ja harvempi valvontaväli.

Arvio: toteutussuunnitelma kasvaa lähiaikoina, koska istunto 86 kirjoittaa yksityiskohtaiset Flash-ohjeet. Overseerin ja kordinaattorin yhteinen osuus (~39 % jäljelle jäävästä) ei pienene agy-siirrolla ja voi kasvaa, koska agy-ruuduissa ei ole hookeja ja Flash tarvitsee enemmän ohjausta.

## 21.10.2026 klo 16.50 — ennuste ominaisuuksittain (scopes patriot)

Käyttäjän pyyntö: "Haluan että ennuste on ominaisuuttain kuten ios ui osa alueittain yms." Kirjattu käyttäjän valinnalla
("Kirjaa ennusteeseen"). Pohja: Explore-kartoitus (HEAD 64fadfe9) suunnitelmista, Swift-näkymistä (`scopes2/shared/ScopesUI2/Sources/ScopesUI2/`,
`scopes2/ios/Sources`, `scopes2/macos/Sources`), adapterin reiteistä (`scopes2/adapteri/toiminnot/`) ja git logista. Patriot todensi itse:
ScopesCore2 kutsuu vain reittejä `/api/skoopit`, `virta`, `tila`, `peili/koko`, `terveys`, `android`, `linux` ja `/api/chat/stop`, ja T-70:n
cron.d on todennettu (64fadfe9). Viikkoraja on 89 % ja 95 % noin klo 19.50 (osio 16.40).

Jaettu UI (iOS ja macOS):

| Osa-alue | Ominaisuus | Tila | Ennuste |
|---|---|---|---|
| Runko | sivupalkki ja 4 välilehteä (Viestit, Chat, Infra, Asetukset) | valmis (T-48, T-49; T-51 hyväksytty 2ac01f84) | — |
| Skooppilista | haku, suodatus, tilaväri, lukemattomat ja synkattu kuittaus | valmis (T-48, T-52, T-53) | — |
| Keskustelu | viestit, työkalurivit, synkattu vierityskohta | valmis | — |
| Kysymykset | kysymyskortti, vastaus viestinä | valmis | — |
| Syöte | viesti, synkattu luonnos, liitteet | valmis | — |
| Transkriptipeili | "haettavissa"-rivi | koodi valmis (T-58 9704e106) | hyväksyntä T-59 21.10. noin 18–19 |
| Chat | agenttivalinta, virta, stop, uusi keskustelu | valmis | — |
| Infra | rekisterit, osat, LR-ristiriidat | valmis | — |
| Infra: palvelin | tila, herätys, sammutus | koodi valmis (T-87 00cce758) | T-88 21.10. ennen 95 %:a, muuten 26.10. |
| Infra: Android-ohjaus | ruutu, eleet, napit, Gemini, liite, tuotokset | koodi valmis (T-87) | T-88 kuten yllä |
| Asetukset | avain, vertainen, yhteys, headless-kytkin | valmis | — |
| Istuntotoiminnot | stop, pura, pakkaa, uusi skooppi, malli, automaattijatko | ei rakennettu, eikä tehtävää ole (adapterin reitit valmiit T-66…T-83) | ei ennustetta; arviolta 1–2 tehtävää, aikaisintaan 26.10. |
| Käyttörajan näyttö | 5 h ja viikko | ydin valmis (T-84), UI:ta eikä tehtävää ei ole | ei ennustetta |
| Ilmoitukset | paikalliset tai push | ei suunniteltu V2:lle | — |
| Tila-avaimet `piilotukset`, `purku-valinta` | | määritelty Coressa (`Tilasynkka.swift:35-47`), UI ei käytä | epäselvä |

Käyttäjä päätti istuntotoimintojen aukosta "Ei nyt": havaintoa ei välitetä suunnitteluun.

iOS:

| Osa-alue | Ominaisuus | Tila | Ennuste |
|---|---|---|---|
| Kuori | ydin äpin prosessissa | valmis (50838f15) | — |
| Asetukset: transkriptipeili | ikkuna, katto, koko | koodi valmis (T-58) | T-59 21.10. noin 18–19 |
| Laite | V2 iPhonessa | asennettu 15.37 (aac59e11) | — |
| Synkka toiseen laitteeseen | | loopbackissa (T-53); `scopes2/ios/REKISTERI.md` I-3 avoin (epäselvä) | fyysinen iPhone ARK-14:n jälkeen, aikaisintaan 26.10. |

macOS:

| Osa-alue | Ominaisuus | Tila | Ennuste |
|---|---|---|---|
| Kuori | ikkuna, Skooppi-valikko, Settings | valmis (f53ef662) | — |
| Kehitys-osio | näyttö hereillä, diagnostiikka | koodi valmis (T-71 3b199453) | T-72 21.10. noin 19–19.30 |
| Synkka toiseen laitteeseen | | loopbackissa | ARK-14:n jälkeen |

Taustapalvelut (palvelin):

| Osa-alue | Tila | Ennuste |
|---|---|---|
| Ydin: data, replikointi, peili, lähdetila, silta | valmis, tuotannossa 7da86808 | — |
| Adapteri: viestit, istunto, pura, chat, malli, uusi, agentit, asetukset, android, linux | valmis, tuotannossa (T-70 ajettu, cron.d todennettu 64fadfe9) | hyväksynnän kirjaus 21.10. |
| Headless-pysyvyys (ARK-11a, T-90) | odottaa käyttäjän päätöstä | ei ennustetta |

Myöhemmin:

| Ominaisuus | Odottaa | Ennuste |
|---|---|---|
| Paritus, avaimet, WG (ARK-14) | H-6 | aikaisintaan 26.10. (4–6 h) |
| Mallimoottori (ARK-15) | ARK-14 | 26.–28.10. |
| Vanhan alasajo | T-70, T-88, H-9 | 26.–28.10. |
| Web, Linux, Windows, Android | alustapäätös | ei ennustetta |

## 21.10.2026 klo 16.40 — ennuste ruudukkona (scopes patriot)

Käyttäjän pyyntö: "Anna aikatauluennuste ruudukko". Kirjattu käyttäjän valinnalla ("Kirjaa ennusteeseen"). Pohja: git log
(`--all`) 12.26–16.37 ja lukema `api/oauth/usage` 16.40 (5. yritys; 4 × 429 minuutin välein).

Käyttöraja:

| | Nyt | Vauhti | Ennuste |
|---|---|---|---|
| Viikko | 89 % | 1,9 %-yks./h 13.30 jälkeen (83 → 89 % 3,2 h:ssa; 5 h 48 % × 0,127 sama) | 95 % noin klo 19.50, 98 % noin 21.25, 100 % noin 22.30 |
| 5 h | 48 % | 15 %/h | nollautuu 18.30, ei katkoa ennen sitä |
| Seisokki | — | — | noin 22.30 → 26.10. klo 1.00 (noin 3,1 vrk) |

Vaiheet:

| Vaihe | Tila 16.40 | Odottaa | Ennuste valmis |
|---|---|---|---|
| T-57 ARK-17 ydinhyväksyntä | hyväksytty poikkeamapäätöksellä (c246e583) | — | — |
| T-58 iOS-peili | vihreä 16.35 (9704e106) | — | — |
| IOS-H17 V2 iPhonessa | valmis 15.37 (aac59e11); vanha Skoopit pois iPhonesta (3 äpin raja) | — | — |
| T-59 iOS + tuotantotodennus | ei aloitettu | koordinaattorin vuoro, Mac-jono | 21.10. noin 18.00–19.00 |
| T-71 macOS Kehitys-osio | vihreä (3b199453) | — | — |
| T-72 ARK-18 hyväksyntä | ei aloitettu | näytön lukitustarkistus (voi vaatia käyttäjän), Mac-jono T-59:n jälkeen | 21.10. noin 19.00–19.30 |
| ARK-16 tuotantoon | 7da86808 asennettu 15.19, adapteri käynnissä 15.31 (5bf9b5b2) | — | — |
| T-70 loppu | kohdat 1–7 ja H-18 tehty | käyttäjän root-komento (cron.d `SCOPES2_TOIMINNOT=8798`) | minuutteja komennosta |
| T-94, T-95 | commitoitu (7c9bda9d, ad18be7d), portit ajamatta | adapterin vuoro | 21.10. ilta, noin 0,5 h |
| ARK-19: T-85, T-86, T-87 | vihreät (9aa0fd46, 15637f10, 00cce758) | — | — |
| T-88 ARK-19 hyväksyntä | — | ajo-ohje koordinaattorin raportista (2c2a6556) | 21.10. ilta ennen 95 %:a, muuten 26.10. |
| ARK-14 paritus ja synkka | — | H-6 (WG-peer, käyttäjä) | aikaisintaan 26.10. |
| ARK-15 mallimoottori, vanhan alasajo | — | ARK-14, H-9 | 26.–28.10. |
| ARK-11a, web, ARK-11b/c, ARK-13 | odottavat (alustapäätös 21.10.) | käyttäjän päätös | ei ennustetta |

Alustoittain:

| Alusta | Ennuste |
|---|---|
| iOS | V2 on iPhonessa. Transkriptipeili valmistuu 21.10. T-59:n jälkeen. Synkka muihin laitteisiin ARK-14:n jälkeen, aikaisintaan 26.10. |
| macOS | Kehitys-osio on valmis, ja T-72 ajetaan 21.10. illalla. Asennusta Macille ei ole todettu lähteestä. Synkka ARK-14:n jälkeen. |
| oneplus (headless) | Ydin ja adapteri tuotannossa. Pysyvä käynnistys (ARK-11a) odottaa käyttäjän päätöstä. |

Huomio: `scopes2/macos/REKISTERI.md`:n SEURAAVA on vanha ("ei mitään", 20.10.), ja `scopes2/shared/REKISTERI.md` sanoo T-87:n olevan
commitoimatta, vaikka se on 00cce758:ssa. Tila luettiin gitistä.

## 21.10.2026 klo 12.30 — viikkoraja iOS:n ja macOS:n valmistuessa (scopes patriot)

Käyttäjän kysymys: "Arvioi käyttöraja kun macos ja ios on valmis?" Kirjattu käyttäjän valinnalla ("Kirjaa ennusteeseen").

Lukema `api/oauth/usage` 12.26 (ensimmäinen yritys): seven_day 82 % (11.20: 78 %, siis noin 3,6 %-yks./h kaikilla linjoilla), five_hour
91 % (26,5 %/h). 5 h -raja täyttyy noin 12.45, ja käyttö pysähtyy 13.30:een asti. Viikko on silloin noin 83 %. Kerroin 30 %-yks. → 4 %-yks. = 0,133,
sama kuin 0,127.

Jäljellä git login mukaan (`git log --all` 11.15–12.26):

| Linja | Vihreänä 11.20 jälkeen | Jäljellä |
|---|---|---|
| iOS | T-76 (a4eac145), T-78 (32fcb938) | T-57:n uusinta (käyttäjän hyväksyntä) → T-58 → T-59 |
| macOS | — | T-71 (portti odottaa käyttäjän valmiutta, 3645b9d0) → T-72 |

Mac-jono on sarjassa: T-57:n uusinta 0,5–1,5 h (06.21–06.53 ajo 32 min), T-58 ja T-59 kumpikin 1–1,5 h, T-71 ja T-72 noin 1 h.
Yhteensä noin 3,5–5 h 13.30:stä, jos käyttäjä on paikalla. Valmis noin 21.10. klo 17–18.30.

| Oletus | Vauhti | Viikkoraja iOS:n ja macOS:n valmistuessa |
|---|---|---|
| ARK-16 ja ARK-19 jatkuvat rinnalla | 5 h -ikkuna täyteen, noin 2,6 %-yks./h | 92–96 % |
| Vain Mac-jono (adapteri pysäytetty) | yön tahti, noin 1 %-yks./h | 87–89 % |

- Riski: täydellä vauhdilla 95 %:n porras (ei uusia aloituksia) tulee noin klo 17.30–18.30, joten T-59 tai T-72 voi jäädä aloittamatta.
- Fyysinen iPhone vaatii lisäksi ARK-14:n (H-6). Se ei ole tässä arviossa.

## 21.10.2026 klo 11.20 — viikkoraja ja alustapäätökset (scopes patriot, PATRIOT-VIIKKORAJA)

Lukema `api/oauth/usage` (Mac, avainnipun tunnus), kaksi hakua 11.18 ja 11.20, kumpikin onnistui ensimmäisellä yrityksellä (ei 429):

| Raja | Käyttö | Nollautuu |
|---|---|---|
| seven_day (`weekly_all`, severity warning) | 78 % | 26.10.2026 klo 1.00 |
| five_hour (`session`) | 61 % | 21.10.2026 klo 13.30 |
| `weekly_scoped` Fable | 14 % (7 % koko viikosta, osuus enintään 50 %) | 26.10.2026 klo 1.00 |
| iguana_necktie | 100 % | 5.11.2026 klo 10.59; ei ole Fable-raja (HISTORIA 21.10. arvaus kumoutui), merkitys yhä tuntematon |
| extra_usage | pois | — |

Viikon käytöstä 100 % on Claude Codea. Ikkuna alkoi 19.10. klo 1.00.

Kulutusvauhti:

| Pohja | Viikon %-yks./h | Mistä |
|---|---|---|
| Viikon keskiarvo | 1,34 | 78 % / 58,3 h (19.10. 1.00 – 21.10. 11.18) |
| Nykyinen 5 h -ikkuna | noin 2,8 | five_hour 61 % 2,8 h:ssa (alku 8.30) = 21,7 %/h × 0,127 |
| Viimeiset 30 min | noin 3,8 | five_hour 46 % (10.48) → 61 % (11.18) = 30 %/h × 0,127; suora mittaus 76 → 78 % (pyöristettynä 2–6) |

Kerroin 0,127 (täysi 5 h -ikkuna ≈ 12,7 % viikosta) on HISTORIA 21.10.:n mittaus; 10.48–11.18 antaa saman suuruusluokan (15 %-yks. → 2 %-yks.).

Täyttymisaika (jäljellä 22 %-yks.):

- 5 h -raja rajoittaa ensin. Nykyvauhdilla five_hour on 100 % noin 12.35–13.05, ja käyttö pysähtyy 13.30:een asti. Tähän ikkunaan mahtuu siis enää noin 5 %-yks. viikosta, joten viikko on 13.30 noin 83 %.
- Jos 13.30–18.30 käytetään täysi ikkuna (+12,7), viikko on noin 96 % 18.30. Loput 4 %-yks. menevät seuraavassa ikkunassa noin 1–1,5 h:ssa.
- **Täyttymisaika täydellä vauhdilla:** noin 21.10. klo 19.30–20.00. Valvonnan 95 %:n porras ("ei uusia aloituksia", feedback_kayttoraja_portaat) tulee noin klo 16.40–17.50.
- **Viikon keskivauhdilla:** noin 22.10. klo 3.45.
- **Seisokki täyttymisestä nollautumiseen (26.10. klo 1.00):** noin 4,2 vrk täydellä vauhdilla, 3,9 vrk keskivauhdilla.

10.5x:n arvio (täynnä noin klo 17, 38 %/h purske) ei huomioinut 5 h -katkoa 13.05–13.30. Siksi täyttyminen siirtyy noin 2–3 h myöhemmäksi.

Alustapäätösten mukainen jäljellä oleva työ (käyttäjä 21.10. klo 10.5x; `scopes/toteutussuunnitelma/SUUNNITELMA.md:486-490`):

| Linja | Tila | Jäljellä | Budget-summa |
|---|---|---|---|
| iOS (ARK-17-korjaus) | T-73, T-74, T-75 vihreät; T-76 (Opus) käynnissä | T-76 → T-78 → T-57:n uusinta (käyttäjän hyväksyntä) → T-58 → T-59 | 1,0 M korjaukselle (`:538`); T-58 ja T-59 osa 1,5 M:stä (`:519`) |
| macOS (ARK-18) | T-71 pysäytettiin 10.4x, palautuu 10.5x:n päätöksellä | T-71, T-72 | 0,25 M (`:606`) |
| ARK-16 adapteri | commitoitu T-63-G, T-65, T-79-G, T-66 | T-67 → T-68 (Opus) → T-81 → T-70 sekä T-64 → T-84 | 3,35 M / 13 briefiä (`:590`) |
| ARK-19 | ennallaan | T-85…T-88 | 0,85 M (`:627`) |
| ARK-11a oneplus | odottaa (T-89 vihreä) | T-90, pysyvä käynnistys | 0,15 M (`:643`) |

Ennuste:

- Viikkoa riittää täydellä vauhdilla noin 8 h (klo 19.30–20 asti), ja siitä noin 1 h menee 5 h -katkoon. Mac-jonon tahdilla (noin 40 min portti, T-76 Opus) iOS ehtii todennäköisesti T-78:aan ja T-57:n uusintaan. T-58 ja T-59 jäävät rajan reunalle, ja T-57 tarvitsee käyttäjän hyväksynnän ajoissa. ARK-16:sta ehtii arviolta 2–4 briefiä (kriittinen polku noin 10,5 h malliaikaa). Se ei valmistu ennen nollautumista.
- macOS T-71 (0,25 M, 1 brief) on pienin ja mahtuu, jos Mac-lukko vapautuu iOS-ketjun väliin.
- Tokenien ja viikkoprosentin välillä ei ole mitattua kerrointa, joten budjetit ovat suhteellisia, eivät prosentteja.
- Rajan jälkeen työ jatkuu 26.10. klo 1.00. ARK-16:n loppu ja ARK-19 sijoittuvat noin 26.–27.10.

## 21.10.2026 klo 06.50 — äppiversioittain (scopes patriot)

Sama tilanne kuin 06.45:n taulukossa, mutta äppiversioittain. Paketti = toteutussuunnitelman tehtävä (T-nn) tai ihmisen vaihe (H-nn).
Jaetut paketit (ScopesCore2/ScopesUI2, ydin) lasketaan jokaiselle äpille, jota ne koskevat. Kesken olevien osien määrät ovat arvioita,
koska tehtävätasoa ei ole vielä kirjoitettu (merkintä ~).

| Äppiversio | Paketteja valmiina | Kesken / jäljellä | Ihmisen vaiheet | Ennuste käytössä |
|---|---|---|---|---|
| Scopes V2 macOS | 9 (Apple-runko, ydin äpissä, liitteet, Core2, UI2, kuoret, ARK-08- ja ARK-09-hyväksyntä, tila-avaimet) | ~2 Kehitys-osio, ~3 paritus ja avaimet | 1 laiteasennus | yhden koneen äppinä 21.10. (asennuksen jälkeen); synkka muihin laitteisiin 22.10. |
| Scopes V2 iOS | 9 jaettua + 5 transkriptipeilin ydinosaa | 1 ydinhyväksyntä (käynnissä, noin 08.00), 2 iOS-peili (noin 10–13), ~3 paritus | 1 laiteasennus | simulaattorissa nyt; omalla iPhonella aikaisintaan 22.10. |
| Scopes V2 oneplus (headless Linux, aarch64) | 1 ydin ajossa 127.0.0.1:8797 (todettu 21.10. 06.5x) | 1 adapteri käyntiin (ei prosessia; peili ilman uusia yksiköitä 20.10. 14.35Z jälkeen), 1 pysyvä käynnistys (ei crontab-riviä, ei systemd:tä → kaynnista.sh, H-5:n tapa), 1 palvelinpuun synkka (ahead 4, behind 66) | synkan päätös (overseer) | pysyvänä ja ajantasaisella datalla aikaisintaan 22.10. |
| Web-asiakas (selaimessa, oneplus-solmua vasten) | 6 + hyväksyntätesti 6/6 | 1 tuotantoon vienti | 1 tuotantotesti (noin 1 h) | noin 1 h aloituksestasi, kun adapteri syöttää dataa |
| Yhteinen: adapteri ottaa toiminnot | 0 | 6 (tehtävätaso osin kirjattu) | — | 21.10. ilta (3–5 h) |
| Yhteinen: vanhan äpin alasajo | 0 | 1 | 1 päätös | aikaisintaan 22.10. |
| Yhteinen: mallimoottori | 0 | ~2 | mallipäätös | aikaisintaan 22.–23.10. |
| Scopes V2 Linux (Tauri) | 0 | ~3 (tehtävätaso puuttuu) | 1 root-asennus (webkit2gtk) | ei ennustetta |
| Scopes V2 Windows (Tauri) | 0 | ~2 | 1 Windows-VM | ei ennustetta |
| Scopes V2 Android | 0 | ~2 | 1 laite | ei ennustetta |
| Vanha Scopes (macOS + iOS) | käytössä | korjaus valmis (käynnistyskaatuminen) | — | toimii rinnalla, kunnes alasajo |

Yhteensä: valmiina 21 eri pakettia (9 jaettua Apple-pakettia, 5 peilin ydinosaa, 6 web-asiakasta, 1 muistimittaus). Jäljellä noin
25 pakettia ja 6 ihmisen vaihetta. Mac-jono on sarjassa, joten macOS ja iOS valmistuvat peräkkäin. Web ja Linux eivät käytä Macia.

## 21.10.2026 klo 06.45 — päivitetty ennuste (scopes overseer)

Pohja: git log 20.10. 13.00 – 21.10. 06.26 ja `scopes/toteutussuunnitelma/SUUNNITELMA.md:449-510` (luvut 11.5 ja 11.6). Käyttäjä
(scopes macosin kautta): T-49, T-52, T-22 ja T-51 8/9 tehty 20.10., V-628 korjattu. Ytimen yövauhti oli noin 25 min tehtävää
kohden koodista vihreään porttiin: T-56 00.06 → 00.29, T-61 00.32 → 00.35, T-60 00.39 → 00.42. 13.40:n ennusteeseen verrattuna Mac-jono
valmistui illalla noin 4–6 h myöhässä (T-52 ajo 11). ARK-17:n ydinosa kulki yöllä ilman Mac-lukkoa, joten se on etuajassa.

| Vaihe | Tila 21.10. 06.45 | Odottaa | Ennuste valmis |
|---|---|---|---|
| T-49 äppikuoret | valmis 20.10. 20.49 (ajo 4) | — | — |
| T-52 tila-avaimet (ARK-09) | valmis 20.10. 21.13 (ajo 11) | — | — |
| T-53 ARK-09 hyväksyntäajo | valmis 20.10. 21.23 | — | — |
| T-22 kahden solmun testi | valmis 20.10. 21.35 | — | — |
| T-51 ARK-08 hyväksyntäajo | 8/9 20.10. 21.31; Mac-rinnakkain vihreä 23.15 aitalinjauksella (V-628 korjattu d14a726e), ARK-08 kiinni (2ac01f84) | — | — |
| R-3 muistimittaus | valmis 20.10. 23.24 (VmHWM 124/237 MiB < 512 MiB) | — | — |
| V-605 gate.sh-rinnakkaistus | koodi valmis (92d8cb81) | Mac-todennus, kohdat 2–5 T-44:n ja H-12:n jälkeen | 21.10. iltapäivä |
| ARK-17 ydin: T-54, T-55, T-56, T-61, T-60 | valmis 20.10. 23.47 – 21.10. 00.42 (c53f27d6, db3bbad3, fd5ce19e, 1188d53d) | — | — |
| T-57 ARK-17 ydinhyväksyntä | käynnissä 06.25 (käyttäjä hyväksyi tuotannon kopion) | 1,5 h kello | 21.10. noin 08.00 |
| T-58 + T-59 ARK-17 iOS | ei aloitettu | T-57; Mac-jono | 21.10. noin 10–13 (2 × 1–1,5 h) |
| T-44 web tuotantoon + H-12 | hyväksyntätesti valmis (6/6) | käyttäjä aamulla (luokitin esti tuotannon luvut), noin 1 h | 21.10. aamupäivä käyttäjän aloituksesta |
| T-62 siemennetty koeskooppi | brief valmis (20b20fe8) | V-605:n todennus | 21.10. iltapäivä |
| H-17 laiteasennus | Mac valmisteltu (`scopes2 ios`: IOS-H17) | käyttäjä Xcodessa (noin 30 min) | 21.10. käyttäjän ollessa paikalla |
| ARK-16 adapteri ottaa toiminnot | tehtävätaso osin kirjattu (T-64…T-69), loput tekeillä (`scopes toteutussuunnitelma`) | tehtävätaso, sitten `scopes2 adapteri` | 21.10. ilta (3–5 h) |
| ARK-18 macOS-äpin Kehitys-osio | tehtävätaso tekeillä (`scopes toteutussuunnitelma`, 06.2x alkaen) | `scopes2 macos` + `scopes2 shared`, Mac-jono | 21.10. ilta – 22.10. (1–2 h) |
| Vanhan alasajo | — | ARK-16, H-9 käyttäjän päätös | aikaisintaan 22.10. |
| ARK-14 paritus ja avaimet | — | H-6 käyttäjä (WG-peer) | 22.10. (4–6 h H-6:n jälkeen) |
| ARK-15 mallimoottori | — | ARK-14, models-päätös | aikaisintaan 22.–23.10. |
| ARK-11 Linux ja Windows, ARK-13 Android | estynyt | H-8; Linux-osaan Rust ja webkit2gtk (root) | ei ennustetta |

Riskit:

- Tuotannon ytimen peili ei ole saanut uusia yksiköitä 20.10. 14.35Z jälkeen. Palvelimella ei ollut 21.10. 06.3x adapteriprosessia eikä
  crontab-riviä (yksi pikatarkistus, omistaja `scopes2 adapteri`). Jos adapteri ei käynnisty, T-44:n ja H-12:n tuotantotesti näkee
  vanhentuneen datan.
- Mac-jono on taas sarjassa: T-58 → T-59 → V-605 2–5 → T-62. Jokainen punainen portti siirtää loppua noin 40 min.
- Aamun T-44, H-12 ja H-17 tarvitsevat käyttäjän. Niiden aloitusaika määrää iltapäivän jonon.

Alustoittain (16.30:n taulukon päivitys):

| Järjestys | Alusta | Ennuste |
|---|---|---|
| 1 | macOS | Yhden koneen äppinä ARK-08:n ja ARK-09:n osalta valmis 20.10. illalla. Puuttuu H-17 (käyttäjä) ja ARK-18:n Kehitys-osio 21.10. ilta – 22.10. Synkka muihin laitteisiin ARK-14:n jälkeen, aikaisintaan 22.10. |
| 2 | iOS | Simulaattori valmis (T-51, T-53). ARK-17:n iOS-osa 21.10. päivällä. Fyysinen iPhone H-17:n ja ARK-14:n jälkeen, aikaisintaan 22.10. |
| 3 | oneplus (headless + web) | Web noin 1 h T-44:n aloituksesta 21.10. aamulla. Adapterin käynnistys on tarkistettava (riski yllä). |
| myöhemmin | Linux (Tauri), Windows, Android | Ei ennustetta (H-8). |

## 20.10.2026 klo 13.40 — päivitetty ennuste (scopes macos -istunto c68b88a3)

Pohja: git log 20.10. 09.00–13.35, `scopes/kordinaattori/vahti/YOLOKI.md` (rivit 09.16–13.03), `scopes2/shared/REKISTERI.md:24-32`,
`scopes/architecture/REKISTERI.md:44-60`. Muutos 09.35:n ennusteeseen: T-52 ajettiin ennen T-51:tä (sama Mac-lukko), ja
se on vienyt noin 3,5 h ennustetun 1 h:n sijaan. Portti oli punainen klo 13.03 T-49:n testin takia
(`testViestitVastaavatPalvelinta` 143 vs 120: elävä istunto kasvaa, kaatuu myös HEADilla). Siksi Mac-jonon vaiheet siirtyvät
noin 3 h myöhemmäksi. Macin portti kestää noin 40 min ajolta (T-49 2420 s).

| Vaihe | Tila 20.10. 13.40 | Odottaa | Ennuste valmis |
|---|---|---|---|
| T-49 äppikuoret | valmis 09.15 (0c664ebd) | — | — |
| T-52 tila-avaimet (ARK-09) | kesken: portti punainen 13.03, T-49-testin vakautus käynnissä (scopes2 shared) | vakautus ja portin uusinta (noin 40 min) | 20.10. noin 14.30–15.30 |
| T-51 ARK-08 hyväksyntäajo | ei aloitettu | Mac-lukko T-52:n jälkeen | 20.10. noin 15.30–17.00 |
| T-53 ARK-09 hyväksyntäajo | — | T-52 ja Mac-lukko T-51:n jälkeen | 20.10. noin 17–18 |
| H-17 laiteasennus | Mac valmisteltu | käyttäjä Xcodessa T-51:n jälkeen (noin 30 min) | aikaisintaan 20.10. noin 17 |
| T-44 web tuotantoon + H-12 | hyväksyntätesti valmis (44862dff, 6/6) | käyttäjä (`/pura scopes2 web`, noin 1 h) | noin 1 h aloituksesta; ei Mac-jonossa |
| ARK-16 adapteri ottaa toiminnot | arkkitehtuurin kirjaus tehty (174ae82f, d4ba8036) | tehtävätaso `scopes toteutussuunnitelma` (noin 1 h), sitten `scopes2 adapteri` | 21.10. (3–5 h) |
| ARK-17 puhelimen transkriptipeili (K-10, 7 vrk, 38 Mt) | päätetty 20.10. (4315c37b) | tehtävätaso; `scopes2 ydin` + `scopes2 ios` | 21.–22.10. (karkea 2–4 h, oma arvio) |
| ARK-18 macOS-äpin Kehitys-osio (K-11, V-584) | päätetty 20.10. (5502f265) | tehtävätaso; `scopes2 macos` + `scopes2 shared`, Mac-jono | 21.10. (karkea 1–2 h, oma arvio) |
| Vanhan alasajo | — | T-53, ARK-16, H-9 käyttäjän päätös | aikaisintaan 21.10. ilta tai 22.10. |
| ARK-14 paritus ja avaimet | — | T-53, H-6 käyttäjä (WG-peer) | 21.–22.10. (4–6 h) |
| ARK-15 mallimoottori | — | ARK-14, models-päätös | aikaisintaan 22.10. |
| ARK-11 Linux ja Windows | estynyt | H-8 (Windows-VM), palvelin ei vastaa | ei ennustetta |
| ARK-13 Android | estynyt | H-8 (laite) | ei ennustetta |

Riski: Mac-jono on sarjassa (T-52 → T-51 → T-53). Jokainen punainen portti siirtää loppua noin 40 min, joten tämän päivän
vaiheet voivat valua 21.10. aamuun.

Rinnakkaistus (V-605, V-606): koordinaattori päätti 20.10.2026, ettei sitä tehdä ennen T-53:a. T-51:ssä ja T-53:ssa on
macOS-UI-testejä, joten säästö jäisi iOS-simulaattorivaiheeseen. Lisäksi gate.sh:n muutos toisi riskin hyväksyntäajojen alle
ja mitätöisi T-52:n porttitodisteen. V-605 tehdään T-53:n jälkeen ARK-11:tä ja ARK-13:a varten, joten ennuste pysyy sarjassa.

## 20.10.2026 klo 16.30 — valmistuminen alustoittain (scopes macos -istunto c68b88a3)

Käyttäjän pyynnöstä: 13.40:n taulukko oli vaihejärjestyksessä, eikä siinä näkynyt, milloin kukin äppi on käytössä.
"Valmis" tarkoittaa tässä, että äppi on asennettu omalle laitteelle ja synkassa muiden laitteiden kanssa.

Pohja:

- YOLOKI 16.09: T-52:n ajo 7 käynnissä 16.08, kesto noin 2 h. Mac-jono siirtyy siksi noin 2,5 h myöhemmäksi kuin klo 13.40:n
  arviossa.
- `scopes/toteutussuunnitelma/SUUNNITELMA.md:376-378`: ARK-11, ARK-13, ARK-14.
- P-14: fyysinen iPhone odottaa ARK-14:ää.
- ARK-10:n toteutuneet ajat: 6 tehtävää, 1,3 h.
- palvelin todettu klo 16.27: vastaa (x86_64, 12 ydintä, 30 Gt). Rustia (cargo) ei ole, eikä webkit2gtk-4.1:tä löydy.
  Tauri vaatii molemmat. webkit2gtk asennetaan rootina, joten asennus on käyttäjän komento.

ARK-11:n ja ARK-17:n ajat ovat karkeita omia arvioita. Suunnitelmassa niille ei vielä ole tehtävätasoa.

| Alusta | Mitä puuttuu | Odottaa | Ennuste |
|---|---|---|---|
| macOS | T-52 (ajo 7), T-51 ja T-53 Mac-jonossa; H-17 asennus; ARK-18 Kehitys-osio; ARK-14 synkka muihin laitteisiin | Mac-lukko sarjassa; käyttäjä Xcodessa (H-17); H-6 (ARK-14) | Käytössä yhden koneen äppinä aikaisintaan 20.10. noin 21–22 (T-53 + H-17). ARK-18 21.10. Täysi synkka ARK-14:n jälkeen 21.–22.10. |
| iOS | Simulaattori kulkee macOS:n kanssa (T-51, T-53). Fyysinen iPhone: H-17 allekirjoitus, ARK-14 paritus (P-14), ARK-17 transkriptipeili (K-10) | ARK-14 ja ARK-17 (`scopes2 ydin` + `scopes2 ios`, tehtävätaso puuttuu) | Simulaattorissa 20.10. illalla. Omalla iPhonella käytössä aikaisintaan 22.10. |
| Web (väliaikainen asiakas Linuxille ja Windowsille selaimella) | T-44 tuotantoon + H-12 | käyttäjä (`/pura scopes2 web`, noin 1 h) | Noin 1 h käyttäjän aloituksesta. Ei Mac-jonossa. |
| Linux (ARK-11, Tauri 2) | Tehtävätaso (`scopes toteutussuunnitelma`, noin 1 h); skooppi `scopes2 linux`; rustup palvelimelle (ei roottia); webkit2gtk-4.1 + Taurin käännösriippuvuudet (root → käyttäjä, `ssh palvelin-root`); G-tehtävä: Tauri-kuori + ydin samassa prosessissa + web `dist/` + systemd-yksikkö | T-44 (ARK-10 hyväksyntä); käyttäjän root-asennus | Ei Mac-jonossa, voi edetä rinnan Apple-töiden kanssa. Karkea 4–6 h malliaikaa, valmis aikaisintaan 21.10. ilta tai 22.10. |
| Windows (ARK-11, Tauri 2) | Sama kuori kuin Linuxilla; Windows-käännös ja testi | H-8 Windows-VM (ei ole; käyttäjä päättää paikan, esim. palvelin 30 Gt) | Ei päivämäärää ennen H-8:aa. Linuxin jälkeen karkea 2–4 h, kun VM on olemassa. |
| Android (ARK-13) | Tauri 2 mobile -tarkistus tai Kotlin + UniFFI | H-8 laite | Ei ennustetta. |

Muutos 13.40:een:

- ARK-11 ei enää ole estynyt palvelimen takia, koska palvelin vastaa. Linux-osaa estävät nyt Rustin ja webkit2gtk:n
  asennus sekä puuttuva tehtävätaso. Windows-osaa estää H-8.
- Linux ei käytä Macia, joten V-605:n rinnakkaistus ei koske sitä.

**Käyttäjän päätös 20.10.2026 klo 16.40 — alustajärjestys:** macOS → iOS → oneplus (Linux palvelimella). palvelimelle ei tule
ikkunaa. Sille tulee headless-solmu (ARK-11:n systemd-osa), ja käyttöliittymä on web-asiakas selaimessa (T-44, H-12).

Todettu klo 16.40, ilman muutoksia:

- palvelin: aarch64, Debian 13, 8 ydintä ja 7,4 Gt muistia. Näyttöpalvelinta ei ole.
- systemd ei ole käytössä (`systemctl --user`: offline), eikä PID 1 näy. Systemd-yksikkö ei siis sovi sellaisenaan, joten pysyvä
  käynnistys tehdään H-5:n tavalla (`scopes2/kaynnista.sh`).
- Crontabissa ei ole scopes2-riviä, mutta `scopes-solmu` kuuntelee osoitteessa 127.0.0.1:8797.
- oneplus-askel ei tarvitse Tauria eikä webkit2gtk:ta.

| Järjestys | Alusta | Ennuste |
|---|---|---|
| 1 | macOS | Aikaisintaan 20.10. noin 21–22 (T-53 + H-17). Synkka 21.–22.10. (ARK-14). |
| 2 | iOS | Fyysinen iPhone aikaisintaan 22.10. (H-17 + ARK-14 + ARK-17). |
| 3 | oneplus (headless + web) | Web noin 1 h T-44:n aloituksesta. Pysyvä käynnistys (H-5) on tarkistettava. Karkeasti valmis 22.10., kun iOS on valmis. Työ ei vie Macia, joten sen voi tehdä aiemminkin, jos järjestys sallii. |
| myöhemmin | Linux (palvelin, Tauri-ikkuna), Windows (H-8), Android (H-8) | Ei ennustetta. |

## 20.10.2026 klo 09.35 — päivitetty ennuste (scopes macos -istunto 59cd1975)

Pohja: git-committien ajat (vaihe 2 noin 20 tehtävää noin 7 h; ARK-10 6 tehtävää 1,3 h; ARK-08 7 tehtävää noin 5 h
aktiivista, lisäksi 6 h odotusta Macin lukitun näytön takia; Macin portti noin 40 min ajolta, T-49 2420 s, 3 ajoa)
ja suunnitelman arviot (`scopes/toteutussuunnitelma/SUUNNITELMA.md:340`, luvut 11.2–11.3).

| Vaihe | Tila 20.10. 09.35 | Odottaa | Ennuste valmis |
|---|---|---|---|
| T-49 äppikuoret | valmis 09.15 (0c664ebd) | — | — |
| T-44 web tuotantoon + H-12 | hyväksyntätesti valmis (44862dff, 6/6) | käyttäjä (1 h kello) | tänään noin 1 h aloituksesta |
| T-51 ARK-08 hyväksyntäajo | voi alkaa | Mac-lukko | 20.10. noin 10.30–11.30 |
| T-52 tila-avaimet | seuraava sharedille | Mac-lukko T-51:n jälkeen | 20.10. noin 13–14 |
| T-53 ARK-09 hyväksyntäajo | — | T-52 | 20.10. noin 14–15 |
| H-17 laiteasennus | Mac valmisteltu | käyttäjä Xcodessa T-51:n jälkeen (noin 30 min) | aikaisintaan noin 11.30 |
| ARK-16 adapteri ottaa toiminnot | päätös tehty (V-586) | `/pura scopes architecture`, tehtävätaso noin 1 h | 21.10. (3–5 h) |
| Vanhan alasajo | — | T-53, ARK-16, H-9 käyttäjän päätös | aikaisintaan 21.10. ilta tai 22.10. |
| ARK-14 paritus ja avaimet | — | T-53, H-6 käyttäjä (WG-peer) | 21.–22.10. (4–6 h) |
| ARK-15 mallimoottori | — | ARK-14, models-päätös | aikaisintaan 22.10. |
| ARK-11 Linux ja Windows | estynyt | H-8 (Windows-VM), palvelin ei vastaa | ei ennustetta |
| ARK-13 Android | estynyt | H-8 (laite) | ei ennustetta |

## 19.10.2026 klo 15.44 — 1. arvio (sanatarkka)

Arvio: vaiheen 2 ja ARK-12:n loppuosa vie noin 4–6 tuntia aktiivista työtä, eli se valmistuu tänään tai huomenna, jos hyväksynnät tulevat ajallaan. Vaiheet 3–6 vievät karkeasti 2–4 työpäivää, ja kalenteriaikaa kuluu 1–3 viikkoa. Jälkimmäinen arvio on epävarma, koska niiden tehtäviä ei ole vielä pilkottu.

**Mitattu tähän mennessä** (`mittaukset/tehtavat.jsonl`, git log 19.10.):

| T | Toteuttajan aika | Suunnitelman Aika | Tokenit / Budget | Seinäkelloaika valvojineen |
|---|---|---|---|---|
| T-24-G | 6,1 min | 90 min | 73 k / 300 k | ~14 min |
| T-16-G | 4,4 min | 60 min | 32 k / 200 k | ~24 min (sisältää rustupin) |
| T-29 | 3,8 min | 60 min | 101 k / 250 k | ~25 min (sisältää korjauksen) |
| T-17 | 13,1 min | 90 min | 151 k / 300 k | T-17 ja T-18 yhteensä ~30 min |
| T-18 | 2,2 min | 60 min | 68 k / 250 k | (sama) |

- Toteuttajat käyttävät noin 5–15 % suunnitellusta ajasta ja 15–50 % tokenibudjetista.
- Pullonkaula on valvoja. Briefin päivitys, portti, worktree, committi ja mittausrivi vievät noin 10 min tehtävää kohden, joten yksi tehtävä vie käytännössä 15–25 min.
- Suunnitelman kriittisen polun arvio "noin 9 h malliaikaa" on siis selvästi yläkanttiin.

**Vaiheen 2 ja ARK-12:n loppuosa** (14 tehtävää jäljellä):
- **Ydin:** 12 tehtävää (T-19…T-23, T-27, T-28, T-30, T-31-G…T-33, T-35). Sarjassa tämä vie 3–5 h. Ryhmät D, E ja F worktreeillä säästävät ehkä tunnin, mutta Rust-käännökset ajetaan `flock`illa yksi kerrallaan.
- **Adapteri:** odottaa T-25:een asti (noin 20 min), sitten T-34 (noin 30–60 min) ja käyttäjän hyväksyntä H-5.
- **Riskit:** uusintoja on todennäköisimmin tehtävissä T-35 (näkymät fixtureja vasten), T-32 (LR-vertaisuus) ja T-22 (konvergenssi ≤ 10 s puhelimen raudalla). Siksi olen lisännyt noin 30 % puskuria: arvio on 4–6 h, huonoimmillaan 8 h.
- **Tokenit:** noin 1,2 M jäljellä olevasta 3,6 M:n budjetista.

**Vaiheet 3–6:** ARK-08…ARK-16 ja vanhan alasajo ovat noin 8 pakettia, eli arviolta 40–60 tehtävää.
- Mac- ja iOS-työ on hitaampaa kuin palvelimella: xcodebuild, simulaattori, XCFramework.
- Kalenteriaika riippuu ihmisen vaiheista: H-2 (rustup Macille), H-6 (hubin WG-peer), H-8 (Android-laite ja Windows-VM) ja vanhan alasajon päätös.
- Tarkka arvio syntyy vasta TOTEUTUSSUUNNITELMA-VAIHE-3:ssa, kun T-33 ja T-34 ovat vihreitä.


## 19.10.2026 klo 16.09 — 2. taulukko tunteina (sanatarkka; pyyntö "Anna taulukko jossa kaikki on ilmoitettu tunteina")

Jäljellä on noin 4,4–7,4 h vaiheessa 2 ja ARK-12:ssa, jos tehtävät ajetaan sarjassa (noin 3,5–6,5 h rinnakkaisryhmillä D, E ja F). Vaiheet 3–6 vievät noin 21–39 h aktiivista työtä. Arviot ovat seinäkelloaikaa valvojan työ mukaan lukien.

| Tehtävä tai paketti | Malli | Tila | Tunnit |
|---|---|---|---|
| T-24-G adapterin runko | Opus | tehty | 0,23 (toteutunut) |
| T-16-G Cargo-runko ja rustup | Sonnet | tehty | 0,40 (toteutunut) |
| T-29 adapterin lähdetila | Sonnet ja korjaus | tehty | 0,40 (toteutunut) |
| T-17 ja T-18 yhdistäjät ja varasto | Opus ja Sonnet | tehty | 0,50 (toteutunut) |
| **Tehty yhteensä** | | | **1,53** |
| T-19 API, virta, tila | Sonnet | jäljellä | 0,3–0,5 |
| T-20 LR-pariteetti | Sonnet | jäljellä | 0,25–0,4 |
| T-21 replikointi | Opus | jäljellä | 0,4–0,6 |
| T-22 kahden solmun testi | Sonnet | jäljellä | 0,3–0,5 |
| T-23 silta | Sonnet | jäljellä | 0,25–0,4 |
| T-30 peili ja lähde | Sonnet | jäljellä | 0,25–0,4 |
| T-35 näkymät | Opus | jäljellä | 0,4–0,7 |
| T-27 tila LWW | Sonnet | jäljellä | 0,25–0,4 |
| T-28 tilatesti | Sonnet | jäljellä | 0,25–0,4 |
| T-31-G LR-sopimustestit | Sonnet | jäljellä | 0,25–0,4 |
| T-32 LR-lukutila | Opus | jäljellä | 0,4–0,7 |
| T-33 LR-pariteetti tuotannossa | Sonnet | jäljellä | 0,25–0,5 |
| T-25 kaynnista.sh ja vertailut | Sonnet | jäljellä | 0,3–0,5 |
| T-34 hyväksyntäajo | valvoja | jäljellä | 0,5–1,0 |
| **Vaihe 2 ja ARK-12 jäljellä, sarjassa** | | | **4,4–7,4** |
| ARK-08 Apple-äpit | Opus ja Sonnet | karkea | 6–10 |
| ARK-09 UI tila-avaimilla | Sonnet | karkea | 2–4 |
| ARK-16 adapteri ottaa toiminnot | Opus | karkea | 2–4 |
| ARK-10 web-asiakas | Sonnet | karkea | 2–3 |
| ARK-11 Tauri Linuxille ja Windowsille | Sonnet | karkea | 2–4 |
| ARK-13 Android | Sonnet | karkea | 2–4 |
| ARK-14 paritus ja avaimet | Opus | karkea | 2–4 |
| ARK-15 mallimoottori | Opus ja Sonnet | karkea | 2–4 |
| Vanhan alasajo | – | karkea | 1–2 |
| **Vaiheet 3–6** | | | **21–39** |
| **Koko suunnitelma jäljellä, aktiivinen työ** | | | **25–46** |
| Kalenteriaika ihmisen vaiheineen (H-2, H-5…H-9) | | | 170–500 |

Tämä laskelma tarkentaa aiempaa arviotani 2–4 työpäivää vaiheille 3–6. Pakettikohtaisesti laskettuna summa on hieman suurempi, 21–39 h. Vaiheiden 3–6 rivit ovat karkeita, koska niiden tehtäviä ei ole vielä pilkottu.

## 19.10.2026 klo 16.11 — 3. ihmisen vaiheet (sanatarkka; pyyntö "Mitä nämä ihmisen vaiheet ovat?")

Ihmisen vaiheet ovat toteutussuunnitelman luvussa 6 (`scopes/toteutussuunnitelma/SUUNNITELMA.md:177-190`). Niissä tarvitaan käyttäjän päätös, lupa tai fyysinen toimi. Neljä on jo tehty, ja kuusi on edessä.

| H | Mitä | Milloin | Kuka tekee | Tila |
|---|---|---|---|---|
| H-4 | Arkkitehtuurin paketit ARK-04…07 ja ARK-12 jaettiin omistajaskooppien rekistereihin | ennen T-16-G:tä | käyttäjä pyytää, `scopes architecture` tekee | tehty (commit 40cb96b9) |
| H-3 | Skoopit `scopes2`, `scopes2 ydin` ja `scopes2 adapteri` luotiin | ennen T-16-G:tä | käyttäjä | tehty (7522ac47, f8cff4d2) |
| H-1 | rustup asennettiin palvelimelle ilman roottia | ennen T-16-G:tä | valvoja käyttäjän luvalla | tehty (`~/.cargo/bin/cargo` löytyy) |
| H-10 | Valmis purkutiedosto toimii nyt myös `scopes2`-skoopeille (`onPerhe`) | tiedoksi | purascript-skooppi | tehty työpuussa (`pura-malliton.mjs:626`, ei vielä committoitu) |
| H-5 | V2-ytimen ja adapterin pysyvä käynnistys cron-rivillä `*/5 * * * * bash ~/palvelin/scopes2/kaynnista.sh` | T-34 | käyttäjä hyväksyy, agentti ajaa | edessä (crontabissa ei vielä riviä) |
| H-2 | rustup Macille ja iOS-targetit (`aarch64-apple-ios`, `-ios-sim`, `-darwin`) | ennen ARK-08:aa | agentti käyttäjän luvalla (`ssh dev-host`) | edessä |
| H-7 | LuLu-palomuurisääntö `scopes-solmu`- ja Tauri-binääreille Macilla | ARK-08, ARK-11 | agentti (`ssh dev-host sudo -n lulu-hallinta`) | edessä |
| H-6 | WireGuard-peer hubiin, jotta V2-portti avautuu WG-verkkoon | ARK-14 | käyttäjä (`ssh palvelin-root`) | edessä, komento selvitetään ARK-14:ssä |
| H-8 | Android-laite ja Windows-VM testejä varten | vaihe 4 (ARK-11, ARK-13) | käyttäjä | edessä |
| H-9 | V2:n Bearer-avaimen poisto ja vanhan scopes-palvelun (8787) alasajo | ARK-14:n lopussa tai käyttäjän päätöksellä | käyttäjä päättää | edessä |

Aiempaan taulukkoon arvioimani kalenteriaika (170–500 h) tulee lähinnä vaiheista H-6, H-8 ja H-9. Ne vaativat fyysisiä laitteita, toisen koneen root-oikeudet tai päätöksen. H-2, H-5 ja H-7 ovat yhden hyväksynnän asioita: agentti ajaa ne itse luvan saatuaan.

## 21.10.2026 klo 19.07 — PATRIOT-AGY-SEURANTA, kiintiölukema t2 (scopes patriot)

Lähde: vahdin välimuisti `~/.claude/hooks/state/kayttoraja-vahti/kaytto.json` (vain 5 h raja; viikkorajaa ei välimuistissa, eikä `/api/oauth/usage`-hakua tehty). Clauden 5 h raja 7 % (nollautuu 21.10. klo 23.29), kun t1 klo 18.14 oli 82 %: raja ehti nollautua välissä. Viikkoraja: viimeisin lukema t1 94 % (täyttyy arviolta klo 19.50, nollautuu 26.10. klo 1.00), uutta ei luettu. agy-tili: ei uutta lukemaa; agy ei liiku ennen kuin ydin, ios ja adapteri saavat tehtäviä.

## 28.10.2026 klo 6.51 — PATRIOT-AGY-SEURANTA, kiintiölukema t3 (scopes patriot)

Claude (palvelin, `scopes/palvelu/kayttoraja.mjs` yksi `/api/oauth/usage`-haku): viikkoraja 0 % (nollautuu 2.11. klo 0.00), 5 h raja 1 % (nollautuu 28.10. klo 11.30). Edelliset: t0 21.10. klo 17.40 viikko 92 %, t1 klo 18.14 94 %; raja nollautui 26.10. klo 1.00; nollautuminen on edelleen sunnuntaina klo 22.00 UTC, Suomen aikaa nyt klo 0.00 kesäajan päätyttyä.

agy, Mac (`~/.local/state/scopes-agy-kayttoraja.json`, päivitetty 27.10. klo 23.34): Gemini-viikkokiintiö 99,51 % (nollautuu 31.10. klo 14.22), Gemini 5 h 1,78 %, pyynnöt 139/1500 (nollautuu 28.10. klo 9.00), 3p-kiintiöt 0 %. agy, palvelin (sama tiedosto, 28.10. klo 6.51): pyynnöt 130/1500, viikkokiintiötä ei raportoitu.

Mac agy-statusline on nyt käytössä: `~/.gemini/antigravity-cli/settings.json` `statusLine.command` = `scopes/palvelu/statusline.sh`, enabled. Asettaja ei tiedossa (ei patriotin muutos).

Agy-skooppien (scopes2 ydin, ios, shared, adapteri, macos) agy-työ: shared-pilotti 181855 teki SHARED-SIIVOUKSEN (a9dcb6ef 21.10. klo 18.32). Agy-raportit `~/agy-raportit/` Macilla: T-72, T-96 (ydin), T-97 (shared), T-98 (adapteri), T-100 (macos), T-101 (ydin ja adapteri), kaikki 21.10.; pakkaus c6d31ad7 klo 22.01. Sen jälkeen agy-skoopeilla ei ole tehtävää: ydin, ios, adapteri ja macos `SEURAAVA PAKETTI: ei mitään`, shared odottaa koordinaattoria. iOS ei saanut agy-tehtävää.

Macin agy-kiintiön kulutti 22.–27.10. muu kuin agy-skoopit: Macin agy-keskusteluja 23.10. 32, 25.10. 18, 26.10. 13 ja 27.10. 116; 27.10. gitissä on kymmeniä `AJO pakkaa … (agy gemini-3.8-flash-low)` -committeja (siirto-pakkaukset, mm. scopes siirto economy, scopes istunnot, infra expresso).

Ennuste: Clauden viikkoraja on nyt tyhjä, joten agy-skoopeille ei ole kiintiösyytä olla agyllä ennen 2.11. Jos agy-skoopit saavat tehtävän ennen 31.10. klo 14.22, Macin agy-Gemini on käytännössä loppu (99,51 %); agy-ajo tarvitsee silloin palvelimen agy-tilin tai Clauden. Vertailu agy vs Claude ei edennyt: agy-skoopeilla ei ollut työtä 22.–28.10.

## 28.10.2026 klo 8.14 — PATRIOT-KULUTUSMITTAUS, välilukema t4 (scopes patriot)

Lähde: `scopes/palvelu/kayttoraja.mjs` (`luoKayttoraja()()`, yksi `/api/oauth/usage`-haku klo 8.14) ja vahdin välimuisti `kaytto.json` (historia 8.10.36–8.13.41). scopes-v2-team avattu klo 7.50 (overseer Opus medium, koordinaattori Sonnet high, valvojat Opus high); mittausikkuna vain ~24 min, joten luku sisältää käynnistyspiikin (kontekstin luku).

| Raja | t3 6.51 | t4 8.14 | Muutos | Vauhti | Nollautuu |
|---|---|---|---|---|---|
| Viikko | 0 % | 4 % | +4 %-yks. | ~10 %-yks./h (tiimin 24 min) | 2.11. klo 0.00 |
| 5 h | 1 % | 24 % | +23 %-yks. | ~58 %-yks./h (vahdin historia 20→23 % 185 s:ssa) | 28.10. klo 11.30 |

Vertailu: 21.10. ~2 %/h (viikko). Nyt ~5× suurempi.

Ennuste: 5 h raja täyttyy klo ~9.30, minkä jälkeen tiimi seisoo klo 11.30 asti. Yksi täysi 5 h ikkuna ≈ 17 %-yks. viikosta (23/4 ≈ 5,8 suhde). Viikkokiintiötä jää 96 %, aikaa 2.11. klo 0.00 asti ~88 h; kestävä vauhti ≤ 1,1 %-yks./h. Nykyvauhdilla viikko täynnä ~10 h:ssa (klo ~18 tänään); jos 5 h raja rajoittaa, ~5 ikkunaa vuorokaudessa ≈ 85 %-yks./vrk → viikko täynnä ~29.10. iltapäivällä. Kiintiö ei riitä 2.11. asti nykyisillä malleilla, ellei vauhti laske käynnistyksen jälkeen alle ~1/5:een. Varsinainen lukema t5 klo ~10 erottaa käynnistyspiikin tasaisesta vauhdista (huom.: jos 5 h raja täyttyy ~9.30, t5 näyttää seisokin).

## 28.10.2026 klo 9.03 — PATRIOT-KULUTUSMITTAUS, lukema t5 (scopes patriot)

Lähde: `scopes/palvelu/kayttoraja.mjs` (yksi haku klo 9.03) ja vahdin `kaytto.json` (49 % klo 9.03.06). Välissä valvojat Opus high → medium klo 8.2x (overseer 37ae9fe5; adapteri vasta vuoron jälkeen, toteutussuunnitelma Opus high).

| Raja | t4 8.14 | t5 9.03 | Muutos (0,82 h) | Vauhti t4→t5 | Vauhti 7.50→8.14 | Nollautuu |
|---|---|---|---|---|---|---|
| Viikko | 4 % | 7 % | +3 %-yks. | ~3,7 %-yks./h | ~10 | 2.11. klo 0.00 |
| 5 h | 24 % | 49 % | +25 %-yks. | ~31 %-yks./h | ~58 | 28.10. klo 11.30 |

Vauhti laski noin puoleen (käynnistyspiikki ohi ja effort medium; osuuksia ei voi erottaa). Silti ~1,8× 21.10. vauhti (~2 %/h).

Ennuste: 5 h raja täyttyy klo ~10.40, seisokki ~50 min klo 11.30 asti. Yksi täysi 5 h ikkuna ≈ 12 %-yks. viikosta (25/3). Viikkoa jäljellä 93 %, aikaa ~87 h → kestävä ≤ 1,07 %-yks./h. Nykyvauhti ylittää 5 h rajan tahdin, joten raja tahdittaa: ~5 ikkunaa/vrk ≈ 60 %-yks./vrk → viikko täynnä ~29.10. klo ~22. Kiintiö ei riitä 2.11. asti; vaatii vauhdin ~3,5× pienemmäksi (esim. ~1/3 tiimistä käynnissä kerrallaan tai ajot vain osassa 5 h ikkunoista).

Käyttäjä 28.10.2026 klo 9.1x: "Tässä on ollut monta scopesiin liittymätöntä kehitystä rinnakkain mikä lisää hetkellisesti kulutusta. Jatka entiseen tapaan." Siis t4- ja t5-lukemat ovat koko tilin kulutusta, eivät pelkän scopes-v2-teamin; teamin osuus on pienempi, eikä sitä erotettu. Ei muutoksia tiimiin.
