# Briefit — scopes toteutussuunnitelma (scopes-V2)

Kirjoitettu 19.10.2026 (Fable), muunnettu scopes-V2-rakenteelle samana päivänä (TOTEUTUSSUUNNITELMA-SCOPES2, K-9). Muoto: `scopes/macos/SUUNNITELMA.md:140-172` + `## Budget`. Valvoja (Opus, omistajaskoopin keskustelu) antaa toteuttajalle vain polun briefiin (H-069) ja ajaa Acceptance-komennon itse (SUUNNITELMA.md luku 2). Rivivälit on tarkistettu 19.10.2026 lähteestä; valvoja tarkistaa `read:`-rivit uudelleen, jos edeltävä tehtävä on muuttanut tiedostoa.

**K-9:** yksikään brief ei muuta `scopes/`-polkuja; jokaisen `must not` alkaa `scopes/**`, ja portit (`scopes2/ydin/gate.sh`, `scopes2/adapteri/gate.sh`) hylkäävät `scopes/`-muutoksen (exit 2). ARK-01…ARK-03:n briefit (T-01-G…T-10, T-12…T-14) on poistettu; ne ovat commitissa 1ad7163d vanhan äpin ylläpitoa varten (vain käyttäjän erillisestä pyynnöstä). T-26 (tuotantokatko) on poistettu eikä numeroa käytetä uudelleen.

| Brief | Paketti | Omistajaskooppi | Malli | Ryhmä | Riippuu |
|---|---|---|---|---|---|
| T-16-G | ARK-04 | scopes2 ydin | Sonnet (pilotti) | A | H-1, H-3 |
| T-17 | ARK-04 | scopes2 ydin | Opus (pilotti) | C | T-16-G |
| T-18 | ARK-04 | scopes2 ydin | Sonnet | C | T-16-G |
| T-19 | ARK-04 | scopes2 ydin | Sonnet | – | T-17, T-18 |
| T-20 | ARK-04 | scopes2 ydin | Sonnet | – | T-19 |
| T-21 | ARK-05 | scopes2 ydin | Opus | D | T-19 |
| T-22 | ARK-05 | scopes2 ydin | Sonnet | – | T-21 |
| T-24-G | ARK-06 | scopes2 adapteri | Opus | A | — |
| T-29 | ARK-06 | scopes2 adapteri | Sonnet | C | T-24-G |
| T-23 | ARK-06 | scopes2 ydin | Sonnet | D | T-19 |
| T-30 | ARK-06 | scopes2 ydin | Sonnet | D | T-19 |
| T-35 | ARK-06 | scopes2 ydin | Opus | E | T-30, T-23 |
| T-25 | ARK-06 | scopes2 adapteri (+ `scopes2/kaynnista.sh`) | Sonnet | – | T-23, T-24-G, T-29, T-35 |
| T-36 | ARK-06 | scopes2 ydin | Opus | – | T-35, T-21 |
| T-37 | ARK-06 | scopes2 adapteri (`scopes2/kaynnista.sh`, RLIMIT_DATA) | Sonnet | – | T-25 |
| T-34 | ARK-06 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 5); ajo 4 käyttäjän luvalla | — | – | T-25, T-36, T-37, H-5 |
| T-27 | ARK-07 | scopes2 ydin | Sonnet | E | T-22 |
| T-28 | ARK-07 | scopes2 ydin | Sonnet | E | T-27 |
| T-31-G | ARK-12 | scopes2 ydin | Sonnet | F | T-19 |
| T-32 | ARK-12 | scopes2 ydin | Opus | F | T-31-G |
| T-33 | ARK-12 | scopes2 ydin | Sonnet | – | T-32 |
| T-38-G | ARK-10 | scopes2 web (H-11) | Sonnet | G | H-11 |
| T-39 | ARK-10 | scopes2 ydin (`web.rs`, S-7) | Sonnet | G | — |
| T-40 | ARK-10 | scopes2 web | Sonnet | – | T-38-G |
| T-41 | ARK-10 | scopes2 web | Sonnet | H | T-40 |
| T-42 | ARK-10 | scopes2 web | Sonnet | H | T-40 |
| T-43 | ARK-10 | scopes2 web (+ `scopes2/kaynnista.sh`: `--web`) | Sonnet | – | T-39, T-41, T-42 |
| T-44 | ARK-10 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.1); V2:n uudelleenkäynnistys koordinaattorin päätöksellä | — | – | T-43 |
| T-45-G | ARK-08 | scopes2 shared (H-13; portti kaikille Apple-puille, P-15) | Sonnet | I | H-13 |
| T-46 | ARK-08 | scopes2 ydin (`solmu.rs`, `ffi.rs`, S-8a, XCFramework) | Opus | I | T-39 |
| T-50 | ARK-08 | scopes2 ydin (`liite.rs`, S-8b) | Sonnet | J | T-46 |
| T-47 | ARK-08 | scopes2 shared (ScopesCore2) | Sonnet | J | T-45-G, T-46 |
| T-48 | ARK-08 | scopes2 shared (ScopesUI2) | Sonnet | – | T-47, T-50 |
| T-49 | ARK-08 | scopes2 ios + scopes2 macos | Sonnet | – | T-48 |
| T-51 | ARK-08 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.2) | — | – | T-49 |
| T-52 | ARK-09 | scopes2 shared + ios + macos | Sonnet | – | T-51 |
| T-53 | ARK-09 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.3) | — | – | T-52 |
| T-54 | ARK-17 | scopes2 ydin | Sonnet | – | ARK-05 |
| T-55 | ARK-17 | scopes2 ydin | Opus | – | T-54; arkkitehtuurin tarkastus S-9b |
| T-56 | ARK-17 | scopes2 ydin | Opus | – | T-55 |
| T-57 | ARK-17 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.5) | — | – | T-56 |
| T-58 | ARK-17 | scopes2 shared + ios | Sonnet | – | T-56, T-53 |
| T-59 | ARK-17 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.5) | — | – | T-58 |
| T-61 | ARK-17 | scopes2 ydin | Sonnet | – | T-56; ennen T-57:ää (S-9b-poikkeama, c53f27d6) |
| T-62 | ARK-08/ARK-09-jälkityö | scopes2 shared | Sonnet | – | V-605 todennettu (siemennetty koeskooppi, testViestitVastaavatPalvelinta) |
| T-63-G | ARK-16 | scopes2 adapteri (+ `scopes2/kaynnista.sh`: `SCOPES2_TOIMINNOT`) | Sonnet | K | — (palvelin) |
| T-64 | ARK-16 | scopes2 ydin (`silta.rs`, S-10) | Sonnet | K | — (Macin klooni, P-18) |
| T-65 | ARK-16 | scopes2 adapteri (P-9-kopiot) | Sonnet | – | T-63-G |
| T-66 | ARK-16 | scopes2 adapteri (viesti, stream, stop, kysymys-pois) | Sonnet | L | T-65 |
| T-69 | ARK-16 | scopes2 adapteri (chat) | Sonnet | L | T-65 |
| T-67 | ARK-16 | scopes2 adapteri (pakkaa, automaattisiirto, herata, herata-pois) | Sonnet | – | T-66 |
| T-68 | ARK-16 | scopes2 adapteri (pura, purkajat) | Opus | – | T-67 |
| T-79-G | ARK-16 (loput) + ARK-19 | scopes2 adapteri (lisäreittien runko ja fixturet) | Sonnet | – | T-63-G (palvelin) |
| T-80 | ARK-16 (loput) | scopes2 adapteri (malli) | Sonnet | M | T-79-G, T-65 |
| T-82 | ARK-16 (loput) | scopes2 adapteri (agentit) | Sonnet | M | T-79-G, T-65 |
| T-83 | ARK-16 (loput) | scopes2 adapteri (asetukset, lähdetila `asetukset`, agy-luvat) | Sonnet | M | T-79-G, T-65 |
| T-81 | ARK-16 (loput) | scopes2 adapteri (uusi) | Sonnet | – | T-68, T-79-G |
| T-84 | ARK-16 (loput) + ARK-19 | scopes2 ydin (lähdetilareitit) | Sonnet | – | — (Macin klooni, P-18; T-64:n jälkeen) |
| T-85 | ARK-19 | scopes2 adapteri (Android-ohjaus) | Sonnet | N | T-79-G, T-65 |
| T-86 | ARK-19 | scopes2 adapteri (palvelin) | Sonnet | N | T-79-G |
| T-87 | ARK-19 | scopes2 shared + ios + macos (paneelit) | Sonnet | – | T-64, T-79-G; Mac-jonossa ei T-58:n rinnalla; koodi worktreessä, tuodaan HEADin päälle ennen porttia |
| T-88 | ARK-19 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.8) | — | – | T-70, T-85, T-86, T-87 |
| T-89 | ARK-11a | scopes2 adapteri (headless-kestävyys: watch, adapterin uudelleenkäynnistys) | Sonnet | – | — (palvelin; ennen T-63-G:tä) |
| T-90 | ARK-11a | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.9) | — | – | T-78, T-89 |
| T-70 | ARK-16 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.6); V2:n uudelleenkäynnistys koordinaattorin päätöksellä; H-18 | — | – | T-64, T-68, T-69, T-80…T-84 |
| T-71 | ARK-18 | scopes2 macos + scopes2 shared (Kehitys-osio, K-11) | Sonnet | – | T-51; Mac-jonossa ei T-58:n eikä T-62:n rinnalla |
| T-72 | ARK-18 | valvojan ajo, ei briefiä (SUUNNITELMA.md luku 11.7) | — | – | T-71 |
| T-60 | ARK-17 | scopes2 ydin (S-9f raakarivit) | Sonnet | – | T-56 |
| T-73 | ARK-17 (korjaus) | scopes2 ydin (sisältöaika, skeema 2) | Sonnet | – | T-61 |
| T-74 | ARK-17 (korjaus) | scopes2 ydin (S-9a riisunta) | Sonnet | – | T-73 |
| T-75 | ARK-17 (korjaus) | scopes2 ydin (S-9d pohja heti) | Sonnet | – | T-74 |
| T-76 | ARK-17 (korjaus) | scopes2 ydin (huippumuisti < 512 MiB) | Opus | – | T-75 |
| T-91 | ARK-16 | scopes2 ydin (Mac; `/api/agentit` X-Lahde) | Sonnet | – | T-64, T-84 |
| T-92 | ARK-16-JULKAISU | scopes2 adapteri (`scopes2/kaynnista.sh`) | Sonnet | – | T-93 |
| T-94 | ARK-16-JULKAISU | scopes2 adapteri (`kaynnista.sh` skeemasiirtymän odotus) | Sonnet | – | T-92, T-95 |
| T-95 | ARK-16-JULKAISU | scopes2 adapteri (`adapteri.mjs --chat`) | Sonnet | – | T-92 |
| T-96 | – (agy-paketti) | scopes2 ydin (`gate.sh`-siivous) | agy Flash | – | — (Mac) |
| T-97 | ARK-17 (S-9f-asiakas) | scopes2 ios; koodi `scopes2/shared/ScopesCore2` + portti T-97 | agy Flash | – | — (Mac, ei UI-lukkoa) |
| T-98 | ARK-19 (palvelin) | scopes2 adapteri (kuivatilan toimintoloki) | agy Flash | – | — (Mac, `timeout`-linkki) |
| T-101 | ARK-17 (S-9f-asiakas 2a) | scopes2 ydin (`nakymat.rs` istunto.transkripti) + scopes2 adapteri (siltavertailun sallittu ero) | agy Flash | – | T-97 (Mac) |
| T-102 | ARK-17 (S-9f-asiakas 2b) | scopes2 shared (ScopesCore2, ScopesUI2) + ios/macos UI-testit | Sonnet | – | T-97, T-101; Mac-UI-jono T-72:n jälkeen |
| T-100 | ARK-18 (T-72 (4)) | scopes2 macos + shared (vain kommentit) | agy Flash | – | — (Mac, ei käännöstä); T-99 jätetty väliin (ytimen itsetestin tuntematon ID) |
| T-103 | ARK-16-korjaus (KORKEA) | scopes2 adapteri (`scopes2/kaynnista.sh`: orpo adapteri, lukko, --sammuta) | Sonnet | – | — (palvelimen /tmp-klooni) |
| T-104 | ARK-16-korjaus (S-5b) | scopes2 adapteri (asetukset `automaattisiirto`) | Sonnet | – | T-103 |
| T-105 | ARK-16-korjaus | scopes2 adapteri (chat android-olio) | Sonnet | – | T-104 |
| T-106 | ARK-16-korjaus | scopes2 adapteri (asetukset-peilin agy-istunnot) | Sonnet | – | T-104 |
| T-107 | ARK-16-korjaus | scopes2 adapteri (puraJono-kilpatilanne) | Sonnet | – | T-106 |
| T-108 | ARK-16-korjaus | scopes2 ydin (S-5b-laji `jono`, `jonossa`) | Sonnet | – | T-107 (ei rinnakkain adapterin kanssa; Mac P-18) |
| T-109 | ARK-16-korjaus | scopes2 adapteri (`jono`-julkaisu) | Sonnet | – | T-108 |
| T-110 | V1-synkka (kartoitus) | scopes2 adapteri (vain raportti) | Sonnet | – | — (rinnalla) |
| T-111 | ARK-16-korjaus (matalat) | scopes2 adapteri | Sonnet | – | T-109 |

Portit: V2-ydin 8797 (P-8), testit 18797/18798 (P-6; ARK-08:n koeydin käyttää oletuksena 18798:aa vain kun se on vapaa, muuten seuraavaa vapaata, ei 18795/18796/18797/8797, P-14), web-mock 18796 (ARK-10); vanha 8787 koskematon. Vaihe 3 (TOTEUTUSSUUNNITELMA-VAIHE-3, SUUNNITELMA.md luku 11): ARK-10 briefit T-38-G…T-43, sopimus S-7; ARK-08 briefit T-45-G…T-50, ARK-09 T-52, sopimus S-8; Apple-portti `scopes2/shared/gate.sh` (Mac ssh:n yli, P-15). Mittausrivi per ajo: `scopes/toteutussuunnitelma/mittaukset/tehtavat.jsonl` (muoto `mittaukset/README.md`).

ARK-16 ja ARK-18 (21.10.2026, SUUNNITELMA.md luvut 11.6 ja 11.7): briefit T-63-G…T-69 (adapteri `scopes2/adapteri/gate.sh`, ydin T-64 `scopes2/ydin/gate.sh`), sopimus S-10, päätös P-19; adapterin toimintaportti 8798 tuotanto, 18822 koe (P-6); ARK-18 brief T-71 (Apple-portti, K-11).

ARK-16:n loput ja ARK-19 (21.10.2026, arkkitehtuuri dfc28af4, SUUNNITELMA.md luvut 11.6 ja 11.8): briefit T-79-G…T-87 (adapteri `scopes2/adapteri/gate.sh`, ydin T-84 `scopes2/ydin/gate.sh`, Apple T-87 `scopes2/shared/gate.sh`); S-5b-laji `asetukset`, S-6:n lähdetilareitit ja asetuspolku, S-10:n agentit-poikkeus; T-64 laajeni; valvojan T-88.

ARK-16-korjaukset (28.10.2026, SUUNNITELMA.md luku 11.6, kappale "ARK-16-korjaukset 28.10.2026"): briefit T-103…T-111; S-5b laajeni (`automaattisiirto`, laji `jono`).

ARK-11a oneplus-headless (21.10.2026, alustapäätös, SUUNNITELMA.md luku 11.9): brief T-89 (adapteri `scopes2/adapteri/gate.sh`, palvelin, ennen T-63-G:tä); valvojan T-90 T-78:n jälkeen.

## agy-tarkkuus (21.10.2026, Opus 5.5; käyttäjän pyyntö)

Käyttäjä 21.10.2026 (patriotin kautta): "Agy flash 3.8 on tyhmempi ja tarvitsee yksityiskohtaisemman ohjeistuksen." Skoopit scopes2 ydin, macos, ios, shared ja adapteri voivat siirtyä agy-ajoon (Mac `mac-agy/<id>`; patriotin päätös 69bd92c0, f00662dd). Flash-high:n first_try on 50,4 %, Sonnetin 65,9 %. Agy ei lataa `CLAUDE.md`:tä, joten uusi brief näille skoopeille täyttää nämä ehdot, olipa ajaja kuka tahansa:

1. **Itsenäinen.** Brief ei viittaa sääntöön, joka on vain `CLAUDE.md`:ssä, muistissa tai keskustelussa. Yhteiset agy-säännöt ovat tiedostossa `../agy/README.md`, ja brief viittaa siihen.
2. **Tiedostot ja rivit.** `read:` ja `may:` nimeävät tiedoston ja rivivälin (`polku:a-b`), ja Do-askel kertoo, mihin funktioon tai riville muutos tulee.
3. **Askel kerrallaan.** Do-lista on numeroitu, ja yksi askel tarkoittaa yhtä muutosta. Jokaisen askeleen perässä on tarkistus: komento ja odotettu tulos.
4. **Gate ja odotettu tulos.** Acceptance on täsmällinen komento muodossa `bash <gate.sh> <ID> > <loki> 2>&1; echo "EXIT=$?"`, ilman putkea. Lisäksi brief kertoo odotetun `EXIT=`-arvon ja lokin rivit, joista vihreä tunnistetaan.
5. **Mitä ei saa koskea.** `must not` luettelee polut ja kielletyt komennot (git commit/push/stash/reset ja `--force`, tuotannon portit ja prosessit sekä `sudo`).
6. **Milloin pysähdytään.** Brief nimeää STOP-kohdat: punainen portti toisella yrityksellä, muutos may-listan ulkopuolelle, puuttuva tiedosto tai komento ja kaikki, mikä vaatii käyttäjän luvan. Kun brief ei kerro, mitä tehdä, toteuttaja pysähtyy eikä arvaa.
7. **Ajopaikka ja worktree.** Brief kertoo koneen ja oman worktreen polun. Toteuttaja ei aja jaetussa kloonissa `~/sessions-repo`.
8. **Preflight.** Brief viittaa `../agy/README.md`:n Preflight-taulukkoon ja nimeää, mitkä rivit koskevat sitä (UI-lukko, rakennuslukko, worktree-polku). (28.10.2026)
9. **Mac vai Linux.** Jokainen Acceptance-portti tarkistetaan `../agy/README.md`:n taulukkoa "Ajopaikka: Mac vai Linux" vasten. "Vain Linux" -portti (adapterin T-24 ja koeinstanssit) ei kuulu agylle: brief jättää sen ajoistunnolle ja sanoo sen. Adapterin `node --test` -portit vaativat `timeout`-linkin (T-98:n malli). (28.10.2026)
10. **Commit-sääntö.** Brief sanoo: "agy ei commitoi; ajoistunto <nimi> commitoi polkuina, pushaa ja poistaa worktreen ilman `--force`ia" (`../agy/README.md`, Commit-sääntö). T-98:ssa puuttui commitoija, ja agy tulosti commit-komennot ajamatta. (28.10.2026)
11. **Viestinvaihto ja aloitus.** Brief viittaa vakioaloitusprompiin ja lukuun "Viestinvaihto" ja nimeää viestien kohteen (ajoistunto). Agy kirjoittaa vain `~/agy-viestit/ulos/`-kansioon, ei `tmux send-keys`iä. (28.10.2026)

Valvoja-ajojen (ei briefiä) agy-ohjeet ovat kansiossa `../agy/` (T-72, T-59:n simulaattoriosat).
