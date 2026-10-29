# scopes kordinaattori — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 18.10.2026 — scopes kordinaattori

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| UI-elementti skooppilistassa | valmis 18.10.2026 | KORDINAATTORI-UI-LISTA |
| Backend-agenttitiimi ja rajapinnat | valmis 18.10.2026 | KORDINAATTORI-BACKEND-AGENTIT |
| Chat-integraatio ja skooppisiirtymät | valmis 18.10.2026 | KORDINAATTORI-CHAT-INTEGRAATIO |

## 20.10.2026 — scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| scopes2-koordinointi (vaihe 2 valmis, vaihe 3 käynnissä) | 20.10. 01.15: vaihe 2 vihreä (T-34 37edddb0/6ea06bfa, H-5 bc47388a); ARK-10 T-38-G…T-43 vihreä (d7c58772), T-44 aamulla; ARK-08 T-45-G, T-46, T-47, T-48 vihreä, T-50 ajo 2 vakaa (5d419d54), T-49 iOS-vaihe vihreä porttikopiolla (f6a2d585), macOS-vaihe odottaa Macin lukituksen avausta; V-582 portti korjattu (8f51a66c) | aamulla käyttäjä: (1) avaa Macin lukitus → scopes2 macos ajaa `bash scopes2/shared/gate.sh T-49` (GATE_MAY lisää claude/siirto/mittaukset/) → T-52 (shared) → T-53; (2) T-44: päätä vanha vai uusi binääri (varmuuskopio ~/.local/share/scopes2-varmuus), sitten T-44:n tarkistukset ja V2 uudelleen `--web`; H-12; (3) H-7 LuLu, H-14/H-15/H-17 laiteallekirjoitus; (4) arkkitehtuuri: ARK-16 kirjaus, H-16 peili iPhonessa; (5) T-49 iOS mittausrivi toteutussuunnitelmalle: ~2 h 30 min, ~75 työkalukutsua, 9 porttiajoa, tokenit mittaamatta; (6) shared: Varaston virran sulku taustalle mennessä (scopes2/ios REKISTERI) |
| T-49 macOS-portti odottaa Macin lukituksen avausta (19.10. 23.52) | macOS UI-testit eivät saa äppiä etualalle lukitulla näytöllä; korjaus 919842fe committoitu; Macin lukitusasetuksiin ei kosketa yöllä | aamulla: avaa Macin lukitus ja pidä näyttö hereillä, sitten scopes2 macos ajaa `bash scopes2/shared/gate.sh T-49` |
| T-34 punainen 3/3 (harjoitus 18795: ytimen OOM 4,24 Gt, `peili::rivit` latasi koko peilin) → toteutussuunnitelma e9f6c2a1 lisäsi T-36 (ydin) ja T-37 (adapteri, RLIMIT_DATA-raja `ulimit -d`; `oom_score_adj` vaatisi rootin) | avoin (käyttäjä 19.10.2026: kirjataan) | järjestys T-36 (`/pura scopes2 ydin`; muistimittaus `ulimit -d 1572864` -rajan alla) ∥ T-37 (`/pura scopes2 adapteri`) → T-34 ajo 4 vasta molempien jälkeen käyttäjän luvalla (uusi ehto ytimen `VmHWM` < 512 MiB) → H-5 → YDIN-REKISTERIT-YTIMESTA; adapteri- ja koordinaattori-istuntoja ei pyydetä jatkamaan T-34:ää ennen T-36:ta |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-KORD-4 (20.10.2026, oma): koordinaattori käynnisti ytimen muistiselvityksen (Opus-istunto, python luki ydin.db 1,4 Gt) samaan aikaan kun T-52:n 8. ajo alkoi; avail oli vain ~1,8 Gt ja kuusi Claude-istuntoa auki → muistipaine, Claude Coden muistisiivous tappoi gate.sh:n 17.44. Korjaus: raskaan työn (Rust-käännös, tietokanta-analyysi, kopiointi) ja Mac-porttiajon ei samaan aikaan; ennen porttiajoa avail > 2,5 Gt ja turhat istunnot kiinni; porttiajo irti Claudesta (setsid nohup) | korjattu 17.5x: ytimen selvitys rajattu kevyisiin /proc-lukuihin T-52:n ajaksi |
| V-KORD-3 (20.10.2026, oma): ikkunamittaus `/tmp/ikkunat.swift` suodatti omistajanimeä kirjainkoon mukaan "Scopes", vaikka äpin omistajanimi on "scopes-V2" → väärä johtopäätös "äppi ei luo ikkunaa", ja scopes2 macos bisektoi turhaan ~30 min. Korjaus: mittaukset kirjainkoosta riippumatta ja ensin kontrolli omalla äpillä (ei vain Calculatorilla) | korjattu 20.10. noin 07.30; todellinen syy Macin sammunut näyttö (`caffeinate -u` herättää) |
| V-KORD-1 (19.10.2026, oma): tmux send-keys -l pitkällä tekstillä jäi syöttöriville "[Pasted text #2]"-tilaan eikä Enter lähettänyt; adapterin korjausohje (a)–(d) odotti ~45 min huomaamatta. Korjaus: lähetys skriptillä, joka tarkistaa Pasted text -tilan ja varmistaa työn alkaneen (`esc to interrupt`) | korjattu istunnossa (scratchpad laheta.sh); pysyvä työkalu puuttuu — tehdään, jos koordinointi jatkuu |

## 20.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: KORDINAATTORI-VALMIS — Koordinaattorin 3-agentin arkkitehtuuri, UI-sijoitus skooppilistan kärkeen, taustapalvelu ja chat-integraatio skooppisiirtymineen valmiina ja verifioituina — polut: scopes/kordinaattori/**, scopes/palvelu/** — aloitus: /pura scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-52 | avoin (punainen ajot 1–9, scopes2/shared/REKISTERI.md); odottaa käyttäjää | käyttäjän päätös, vaatii vakaan 8787:n |
| Palvelinsidonnaiset työkalut Macille sovitettaviksi | avoin | sovita Macille: tmux-ohjaus (laheta.sh, vahti.sh), SendMessage-nimet, `ssh dev-host`, gate.sh:n tar-putki ja V-572, koeytimet + cargo-flock, Playwright/chromium, /proc- ja free-valvonta, cron ja tuotannon V2 |

## 20.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-KOORDINOINTI-MAC — jatka scopes2-porttivuorojen jakoa Macilla avoimien asioiden mukaan: ilmoita uusi nimi kaikille istunnoille, viritä ruutuvahti, ota vastaan ytimen T-22-tulos, sitten R-3 VmHWM → T-44 → T-55 (P-18) → V-605; T-51 Mac-rinnakkain V-628:n jälkeen; KORDINAATTORI-VALMIS vasta tämän jälkeen — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Aamun lista 21.10.2026 (käyttäjä paikalla) | koottu 20.10. 23.5x | (1) scopes2 web: T-44 tuotannossa (WEB-T44-TUOTANTO, 2245d43b) → H-12 käyttäjä selaimesta; (2) scopes2 shared: V-605 kohta 2 palvelimelta; (3) V-605 kohdat 3–5 worktreissä aamun HEADista: ehto palvelimelle avoin istunto, jossa viestejä (yöllä 0/99, koska istunnot Macilla; e71ebeef) — ehdotus overseerille: (a) avataan aamulla yksi palvelinistunto, (b) siemennetty koeskooppi toteutussuunnitelmalle jatkotyöksi; (4) toteutussuunnitelma: P-14/P-15 ja T-48/T-49 V-605:n jälkeen; (5) scopes2 ios: IOS-H17 |
| T-44 hyväksyntä (tuotanto) | muistiehto täyttyi R-3:ssa; ei aloitettu 20.10. 23.4x: webin luokitin esti tuotantoluvut; scopes overseer päätti: odottaa käyttäjää | aamun ensimmäinen työ käyttäjän ollessa paikalla (scopes2 web), H-12 heti perään; sitten Linux-äppi (ARK-11b) kun palvelin vastaa |
| Palvelimen ~/palvelin-synkka (sharedin --tunnelitesti) | tehty 20.10.2026 22.59 (shared: stash + rebase, TUNNELITESTI 18/18 vihreä); stash@{0} odottaa claude siirtoa, 3 infra expresso -committia omistajan pushia | ei koordinaattorin toimia |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Kord-vahdin rekisterin rivi 38 (osoite scopes macos) | valmis 20.10.2026 (luokitin esti vahdilta; scopes overseer päätti: ei korjata) | ei toimia |

## 21.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-KOORDINOINTI-MAC — jatka scopes2-porttivuorojen jakoa Macilla: ilmoita uusi nimi kaikille istunnoille ja scopes overseerille; T-56:n porttiajo ytimelle, kun koodi valmis (kirjoitusikkuna kiinni ennen) → S-9b-korjaustehtävä → T-60 → T-57; aamulla 21.10. aamun lista (T-44 → H-12 → V-605 2–5); kysymykset overseerille, ei käyttäjälle; KORDINAATTORI-VALMIS vasta tämän jälkeen — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-605 gate.sh-rinnakkaistus (scopes2 shared) | koodi valmis 92d8cb81; todennus V-605.md kohdat 1–5 odottaa vuoroa | uusi shared-istunto saa vuoron T-44:n siirryttyä aamuun; palvelinosan luokitinesto → Mac-osa nyt, palvelinosa aamulla T-44:n kanssa; sitten toteutussuunnitelma päivittää P-14/P-15 ja T-48/T-49 |
| Aamun lista 21.10.2026 (käyttäjä paikalla) | avoin 20.10.2026 (koottu 23.5x, rekisterissä fa97f818) | (1) scopes2 web: T-44 tuotannossa (WEB-T44-TUOTANTO, 2245d43b) → H-12 käyttäjä selaimesta; (2) scopes2 shared: V-605 kohta 2 palvelimelta; (3) V-605 kohdat 3–5 worktreissä aamun HEADista: ehto palvelimelle avoin istunto, jossa viestejä (yöllä 0/99, koska istunnot Macilla; e71ebeef) — ehdotus overseerille: (a) avataan aamulla yksi palvelinistunto, (b) siemennetty koeskooppi toteutussuunnitelmalle jatkotyöksi; (4) toteutussuunnitelma: P-14/P-15 ja T-48/T-49 V-605:n jälkeen; (5) scopes2 ios: IOS-H17 |
| Palvelinsidonnaiset työkalut Macille | osittain tehty 20.10.2026 (shared gate.sh, ydin gate.sh, web RSS-vahti, vahti seuranta.sh, koordinaattorin vahti.sh scratchpadissa); macOS 27 hylkää `ulimit -d/-v` → RSS-vahti | adapterin gate.sh ja koordinaattorin vahti.sh repoon tarvittaessa |
| T-56 (ydin, Opus) | VIHREÄ 21.10.2026 ~00.4x: 8c, HEAD e7e22aa8 (koodi db3bbad3), T-56/T-35/T-36/T-30 PORTTI OK (lokit tarkistettu); T-61 VIHREÄ fd5ce19e (T-61/T-55/T-56/T-21 PORTTI OK 00.33–00.35); T-60 VIHREÄ 1188d53d (T-60/T-56/T-30 PORTTI OK 00.40–00.41, lokit tarkistettu; S-9f-tulkinnat toteutussuunnitelmalle); T-57 valvojana 8c:llä 21.10. (SUUNNITELMA.md:454; käyttäjä hyväksyi tuotantokopion ~00.5x, python3 backup koska palvelimella ei sqlite3:a, V-KORD-4; 8c kysyi käyttäjältä itse, kopio Macille 06.21; koordinaattori 06.3x: tarkistukset (2), (4), (7) tulkitaan S-9b korjaus 2:n mukaan max(nyt − 7 vrk, karsintaraja), koska ikkuna = HLC-tuontiaika; SUUNNITELMA.md:454-korjaus toteutussuunnitelmalle 3d4c6300); T-57 AJETTU 06.21–06.53 (fbe58e3c): ARK-17 EI HYVÄKSYTTY — (1)(2)(3)(7)(8) OK, (4) S-9a-riisunta pudottaa työkalu- ja AskUserQuestion-rivit 120 viestin rajalta, (5) osin (S-9d-pohja puuttuu, 0 viestiä), (6) A 1 345 MiB > 512; jälkitarkistus OK; (4)–(6) toteutussuunnitelmalle f1, HLC-ikkuna arkkitehtuurille 73 overseerin 93 kautta; T-58 pidätetty; 21.10. ~09.3x ARK-17-KORJAUS (c3f57f1e): Mac-jono ytimelle T-73 → T-74 → T-75 → T-76 (Opus) → T-78 (tuotantobinääri, ristikäännös) → T-57 uusinta (käyttäjän hyväksyntä uudelleen) → T-58; T-73 VIHREÄ 9a8e2d50 (T-73/54/55/56/60 PORTTI OK 09.59–10.01, lokit tarkistettu; may-laajennus 9f332dec); T-74 VIHREÄ 48dac8a1 (HEAD f5271546; T-74/54/56 PORTTI OK 10.23–10.24, lokit tarkistettu; may-laajennus ja S-9a-muutos 7b72d610); T-75 koodaus 8c:llä; T-57-uusinnassa tarkistus (9) skeemasiirtymä; T-78 ja headless-käynnistys pysyvät jonossa (T-44 ei odota niitä) | porttiajo `bash scopes2/ydin/gate.sh T-56` (+ T-35, T-36, T-30) koordinaattorin vuorolla, kirjoitusikkuna kiinni ennen; sitten S-9b-korjaustehtävä → T-60 → T-57 → T-58 → T-59 (SUUNNITELMA.md:456) |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-KORD-5 (21.10.2026, oma): koordinaattori ajoi jaetussa Mac-kloonissa `git commit --amend` olettaen HEADin omaksi, mutta architecture oli committannut välissä; amend sotki koordinaattorin rivin architecturen pakkauskommittiin (a995d6a9, ei pushattu). | korjattu: `reset --soft ea7e1dc5` (origin) ja erillinen commit 090dc42f; jaetussa kloonissa ei amendia, stashia eikä pull --rebasea |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Istuntonimet | valmis 21.10.2026 (overseer b5, toteutussuunnitelma sessions-repo-dc [98c730] (patriot on dc [d66e91]), architecture uusi istunto (73 pakkasi), vahtimestari 50, ydin 8c, shared 68, web 06, iOS e0) | ei koordinaattorin toimia |

## 21.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-KOORDINOINTI-MAC — jatka rinnakkaisten linjojen vuorojakoa (käyttäjä 21.10.: macOS, iOS ja oneplus headless rinnakkain, ei sitovaa järjestystä): ydin 8c T-75-portti → T-76 → T-78 → T-57 uusinta → T-58 (T-64 → T-84 väliin); shared V-605 3 ja 5 loppuun → T-62, T-71, T-87 worktreistä; adapteri T-89 → T-63-G → T-65 ∥ T-79-G → L/M/N; kirjoitusikkuna ennen jokaista gate-porttia overseerin (b5) kautta; ihmisvaiheet overseerille; KORDINAATTORI-VALMIS vasta tämän jälkeen — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Adapteri (siirto-scopes2-adapteri-101341, Sonnet, 80) | T-65 VIHREÄ 1674dbc7 ja T-79-G VIHREÄ 3f28a0e0 21.10.2026 (palvelimen /tmp-klooni; poikkeamat 1–4 9f:lle, T-80…T-86 odottavat fixturemuodon kuittausta); T-66 VIHREÄ 203aade0 (42/42); T-67 VIHREÄ 6e4b7cae (55/55; testiapurit.mjs koordinaattorin luvalla), kommentit a4a80813; T-80 0d77be4b, T-82 73344d5d, T-69 72ddccc3 VIHREÄT; T-83 4880929e, adb-jatko 6ac8d4a7, T-68 5439182f (Opus, yhteinen lukko) VIHREÄT; 80 pakattu; 02: T-81 648c326d, T-86 15637f10 (vain mock), ymp.paikalliset fb147c56 VIHREÄT; T-85 VIHREÄ 9aa0fd46 (ajaTavut hyväksytty, 502-korjaus 01a27e8c vanhoihin koodeihin); 02 pakkaa ja sulkeutuu + yhteinen 429-lukko aja.mjs:ään (koordinaattori), T-81 sen jälkeen; T-63-G VIHREÄ 21.10.2026 (91c9c0d3; T-63 13/13, T-24 26/26, T-29 7/7, T-25 palvelimen /tmp-kloonissa; poikkeamat fixturemuodossa 9f:lle); T-89 VIHREÄ 21.10.2026 (ee28b578; T-89, T-24 26/26, T-25, T-37 exit 0 palvelimen /tmp-kloonissa); tuotannon adapteri kuollut; käynnistys odottaa ARK-11a:n mukana (käyttäjä 10.5x) | ydin T-84 → T-70 (tuotantoajo, käyttäjän päätös), T-85/T-86 briefien mukaan (9f kuittasi 6cc12c75); T-90 odottaa (ARK-11a) |

## 21.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-KOORDINOINTI-MAC — jatka rinnakkaislinjojen vuorojakoa (käyttäjä 21.10. 10.5x: iOS ja macOS jatkuvat, ARK-16 jatkuu, oneplus server ARK-11a odottaa): klo 13.30 jälkeen ydin 8c T-57 uusinta (kopiolupa käyttäjältä) → T-58, T-64 → T-84 rinnalla; shared 68 T-71-ketjun tulos → T-87 (UI-vuoro koordinaattorilta); adapteri odottaa T-84:ää → T-70 (käyttäjän päätös tuotantoajosta); --asenna 3895346c käyttäjän päätökseksi; portit worktreessä, ihmisvaiheet overseerille (28); KORDINAATTORI-VALMIS vasta tämän jälkeen — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-56 (ydin, Opus) | T-76 VIHREÄ a4eac145 (A 98 MiB, B 309 MiB < 512 MiB; worktree wt-t76), pushattu; T-78 VIHREÄ 32fcb938 (KOE OK 3895346c: ei libssl, terveys 200 koeportissa; tuotanto d302bab0 ennallaan), pushattu; --asenna 3895346c ODOTTAA (kytkeytyy palvelimen tuotantoon, käyttäjä 10.5x) — kysytään käyttäjältä erikseen; T-57 uusinta aloitettu (tuotantokopio käyttäjän luvalla 8c:n ruudussa, flock adapterin porttien kanssa). T-75 VIHREÄ 21.10.2026 ~11.xx: d6b38062 (worktree wt-t75, pohja c13e602d; T-75/T-56/T-55/T-61 PORTTI OK, lokit tarkistettu), pushattu; T-76 (Opus) aloitettu. Aiemmin: VIHREÄ 21.10.2026 ~00.4x: 8c, HEAD e7e22aa8 (koodi db3bbad3), T-56/T-35/T-36/T-30 PORTTI OK (lokit tarkistettu); T-61 VIHREÄ fd5ce19e (T-61/T-55/T-56/T-21 PORTTI OK 00.33–00.35); T-60 VIHREÄ 1188d53d (T-60/T-56/T-30 PORTTI OK 00.40–00.41, lokit tarkistettu; S-9f-tulkinnat toteutussuunnitelmalle); T-57 valvojana 8c:llä 21.10. (SUUNNITELMA.md:454; käyttäjä hyväksyi tuotantokopion ~00.5x, python3 backup koska palvelimella ei sqlite3:a, V-KORD-4; 8c kysyi käyttäjältä itse, kopio Macille 06.21; koordinaattori 06.3x: tarkistukset (2), (4), (7) tulkitaan S-9b korjaus 2:n mukaan max(nyt − 7 vrk, karsintaraja), koska ikkuna = HLC-tuontiaika; SUUNNITELMA.md:454-korjaus toteutussuunnitelmalle 3d4c6300); T-57 AJETTU 06.21–06.53 (fbe58e3c): ARK-17 EI HYVÄKSYTTY — (1)(2)(3)(7)(8) OK, (4) S-9a-riisunta pudottaa työkalu- ja AskUserQuestion-rivit 120 viestin rajalta, (5) osin (S-9d-pohja puuttuu, 0 viestiä), (6) A 1 345 MiB > 512; jälkitarkistus OK; (4)–(6) toteutussuunnitelmalle f1, HLC-ikkuna arkkitehtuurille 73 overseerin 93 kautta; T-58 pidätetty; 21.10. ~09.3x ARK-17-KORJAUS (c3f57f1e): Mac-jono ytimelle T-73 → T-74 → T-75 → T-76 (Opus) → T-78 (tuotantobinääri, ristikäännös) → T-57 uusinta (käyttäjän hyväksyntä uudelleen) → T-58; T-73 VIHREÄ 9a8e2d50 (T-73/54/55/56/60 PORTTI OK 09.59–10.01, lokit tarkistettu; may-laajennus 9f332dec); T-74 VIHREÄ 48dac8a1 (HEAD f5271546; T-74/54/56 PORTTI OK 10.23–10.24, lokit tarkistettu; may-laajennus ja S-9a-muutos 7b72d610); T-75 koodaus 8c:llä; T-57-uusinnassa tarkistus (9) skeemasiirtymä; T-78 ja headless-käynnistys pysyvät jonossa (T-44 ei odota niitä) | portti (T-75, T-56) koordinaattorin vuorolla, kirjoitusikkuna kiinni ennen → T-76 (Opus) → T-78 → T-57 uusinta (käyttäjän hyväksyntä uudelleen 8c:ssä, 9 tarkistusta) → T-58 → T-59 (SUUNNITELMA.md:456); T-64 → T-84 ketjun väliin |
| Adapteri (siirto-scopes2-adapteri-101341, Sonnet, 80) | T-65 VIHREÄ 1674dbc7 ja T-79-G VIHREÄ 3f28a0e0 21.10.2026 (palvelimen /tmp-klooni; poikkeamat 1–4 9f:lle, T-80…T-86 odottavat fixturemuodon kuittausta); T-66 VIHREÄ 203aade0 (42/42); T-67 VIHREÄ 6e4b7cae (55/55; testiapurit.mjs koordinaattorin luvalla), kommentit a4a80813; T-80 0d77be4b, T-82 73344d5d, T-69 72ddccc3 VIHREÄT; T-83 4880929e, adb-jatko 6ac8d4a7, T-68 5439182f (Opus, yhteinen lukko) VIHREÄT; 80 pakattu; 02: T-81 648c326d, T-86 15637f10 (vain mock), ymp.paikalliset fb147c56 VIHREÄT; T-85 VIHREÄ 9aa0fd46 (ajaTavut hyväksytty, 502-korjaus 01a27e8c vanhoihin koodeihin); 02 pakkaa ja sulkeutuu + yhteinen 429-lukko aja.mjs:ään (koordinaattori), T-81 sen jälkeen; T-63-G VIHREÄ 21.10.2026 (91c9c0d3; T-63 13/13, T-24 26/26, T-29 7/7, T-25 palvelimen /tmp-kloonissa; poikkeamat fixturemuodossa 9f:lle); T-89 VIHREÄ 21.10.2026 (ee28b578; T-89, T-24 26/26, T-25, T-37 exit 0 palvelimen /tmp-kloonissa); tuotannon adapteri kuollut; käynnistys odottaa ARK-11a:n mukana (käyttäjä 10.5x) **21.10.2026:** Todettu 21.10.2026: Mac-pääklooni on yhteinen ytimelle, adapterille ja sharedille; gate-aita vertaa lähtötilaan (scopes2/ydin/gate.sh:17–60, adapteri/gate.sh:7–11) → adapterin portit ajetaan worktreessä (V-KORD-3). | ydin T-84 → T-70 (tuotantoajo, käyttäjän päätös), T-85/T-86 briefien mukaan (9f kuittasi 6cc12c75); T-90 odottaa (ARK-11a) |
| iOS e0 (scopes2/ios/REKISTERI.md) | avoin; odottaa käyttäjää (commit odottaa vahvistusta e0:n ruudussa) | commit scopes2/ios/REKISTERI.md käyttäjän vahvistettua e0:n ruudussa |

## 21.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-KOORDINOINTI-MAC — jatka vuorojakoa (käyttäjä 21.10. 16.4x): T-70 hyväksyntä ja T-59 toteutussuunnitelma 1b:n päätöksellä (UI-vuoro koordinaattorilta, Mac vapaa), T-88; IOS-H17 asennus d5 → overseer; infran cron.d-scopes2-repotiedosto infralle; tarkista ytimen "T-52-uusinta"-maininta; tuotannossa 7da86808 + adapteri --chat/--toiminnot 8798, cron.d todennettu; KORDINAATTORI-VALMIS vasta tämän jälkeen — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-70 hyväksyntä | kesken 21.10.2026 (kaikki kohdat tehty; viesti toteutussuunnitelma 1b:lle 16.41); odottaa skooppia toteutussuunnitelma | toteutussuunnitelma 1b päättää hyväksynnän |
| T-59 (ARK-17 iOS-hyväksyntä) | avoin (ei aloitettu); odottaa skooppia toteutussuunnitelma | 1b nimeää toteuttajan ja ajoituksen → UI-vuoro koordinaattorilta |
| IOS-H17 asennus iPhoneen | kesken 21.10.2026 (build valmis 15.17); odottaa käyttäjää | d5 → overseer → käyttäjä "sopiiko nyt" |
| T-88 | avoin (odottaa 1b:n tarkennusta T-70:n tuloksella); odottaa skooppia toteutussuunnitelma | 1b |
| Ytimen 98 maininta "T-52:n uusinta koordinaattorilla" | avoin (tarkistamatta) | seuraava sessio katsoo ytimen rekisteristä |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-70 hyväksyntä | valmis 21.10.2026: hyväksytty (käyttäjä, ee80aa31) | ei toimia |
| IOS-H17 asennus iPhoneen | valmis 21.10.2026 (ffd2ada0) | ei toimia |
| Ytimen 98 maininta "T-52:n uusinta koordinaattorilla" | suljettu 21.10.2026: mainintaa ei löydy ytimen rekisteristä eikä arkistosta; T-52 vihreä (5/5 T-62:ssa) | ei toimia |

## 28.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-PALUU-1735 — Sonnet high: käynnistä scopes2-kehitys uudelleen paluukohdasta 21.10.2026 klo 17.35 (patriot 307ef0d7: scopes/patriot/REKISTERI.md Päätökset kaksi ylintä riviä, scopes/KEHITYSMALLI.md roolitaulukko, Rinnakkaisuus, siirtoraja). Jaa Opus high -valvojille tarkistus ja tarvittaessa uudelleentoteutus: T-59 (b70dd25c, ios), T-88 (6) ja ruutukorjaus 3198b79e (adapteri), T-96 (ydin), T-97 (shared), T-98 (adapteri), T-100 (macos), T-101 (ydin + adapteri), T-72 (macos), SHARED-SIIVOUS; ARK-16:n adapteriosan katselmointi Opuksella (T-63-G, T-65–T-70, T-79-G–T-83, T-85, T-86, T-88, T-89, T-92, T-94, T-95; katselmointi, ei uudelleentoteutus). Commit-trailerit eivät kerro mallia luotettavasti (agy T-98 = "Sonnet"). Avaus: autovaihto.sh vaihda "scopes2 <skooppi>" --model claude-opus-5-5 --effort medium --ei-sulje (ydin, shared, ios, adapteri; käyttäjä 28.10. klo 8.2x: medium, ei high); macos --model claude-sonnet-5-5 --effort high (Opus vaikeaan); toteuttajat toteuttaja-sonnet high, eskalaatio toteuttaja-opus; toteutussuunnitelma ja arkkitehtuuri Opus high vain tarvittaessa, suljetaan joutilaana. Enintään 3 Opus-työskooppia kerrallaan, joutilaat suljetaan; ei agy:tä eikä Flashia. Raportit overseerille SendMessagella. — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori

## 28.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-PALUU-JATKO — Sonnet high: jatka scopes2-kehityksen paluuta 21.10. klo 17.35 -tilaan. Ensin ilmoita uusi sessionimi (ListAgents) skoopeille sessions-repo-a0 (adapteri), -ab (ios), -85 (macos); odota ios T-59- ja macos T-100/T-72-raportit ja sulje joutilaat (tmux /exit + Enter). Adapterin PUNAISET portit T-29/T-83 ja ARK-16-löydökset (korkea: kaynnista.sh orpo adapteri; keskitasoa 4; matalaa 8) viedään toteutussuunnitelmalle (Opus high, avaa tarvittaessa autovaihto.sh vaihda "scopes toteutussuunnitelma" --model claude-opus-5-5 --effort high --ei-sulje; S-5b: laajennetaanko vai suodattaako adapteri), sitten korjaus-T-tehtävät niille työskoopeille. Kulutusmittaus klo 10–11 (viikkoraja %/h). Valvojat (ydin, shared, ios, adapteri) avataan Opus medium, ei high (käyttäjä 28.10. klo 8.2x, 37ae9fe5, KEHITYSMALLI.md). Enintään 3 Opus-työskooppia kerrallaan, joutilaat suljetaan; ei agy:tä eikä Flashia; raportit overseerille SendMessagella. — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori — automaattinen: kyllä

### Tila — poistettu tai muutettu

- scopes2-kehitys käynnissä uudelleen 28.10.2026: klo 7.55 avattu adapteri (a0), ydin (bc), shared (6d), macos (85, Sonnet high); klo 8.03 ios (ab). Shared (f6ec34d2) ja ydin (dc067ac6) valmiit ja suljettu; adapteri PUNAINEN (4eab1ff5); ios ja macos kesken.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| scopes2 ios: T-59-tarkistus (sessions-repo-ab, Opus high) | PUNAINEN 28.10.2026 klo 8.21 (ajo 8, exit 1; todenna viim. 4.11.2026): (a) Asetuksissa koko "–" alussa ja replikoinnin jälkeen; (b) tunneli kiinni, S2:n VANHA (23 vrk) näkyy eikä haettavissa-riviä tule; (c) OK. Ikkuna ei näytä menevän solmulle. Epäillyt daf6171b (T-97) ja 2aaf1bee (T-101) b70dd25c:n jälkeen. Siemenen ajat korjattu suhteellisiksi (siemen.mjs, t59.sh; ei commitoitu ab:n puussa). Lokit: scratchpad t59-ajo8.log ja t59-ulos/. ab pakkasi (2ceecf5b) | DIAGNOOSI d1 28.10.: syy vanhentunut XCFramework (20.10. 19.38, ennen T-60/T-73…T-76), ei lähdemuutos; bisect tarpeeton; korjaus b9d7c220 (t59.sh ajaa xcframework_varmista ja tulostaa XCFRAMEWORK-rivin). Odottaa Mac-UI-vuoroa (macos T-71 diagnoosiajo 85 ensin) → t59.sh-uusinta (d1) |
| scopes2 macos: T-100- ja T-72-tarkistus (sessions-repo-85, Sonnet high) | kesken 28.10.2026 (todenna viim. 4.11.2026): raportti puuttuu | odota raporttia; Mac-UI-portit rakennuslukolla /tmp/scopes2-apple-mac.lock |
| Adapterin punaiset portit T-29 (1) ja T-83 (4) | avoin 28.10.2026 (todenna viim. 4.11.2026): S-5b asetukset-lajin sisältö muuttui (asetus-tila.mjs 47b8ccaf) | toteutussuunnitelma tai arkkitehtuuri ratkaisee: laajennetaanko S-5b vai suodattaako adapteri; avaa `scopes toteutussuunnitelma` (Opus high, vain tarvittaessa) |
| Adapterin V1-synkka (agy-kayttoraja, toiminnot-asetukset, viestit) | avoin 28.10.2026 (todenna viim. 4.11.2026) | erillinen sopimusmuutostehtävä; toteutussuunnitelman päätettäväksi |
| Raporttiosoite: työskoopit raportoivat nimelle sessions-repo-21, joka lakkaa sessionvaihdossa | avoin 28.10.2026 | uusi koordinaattori ilmoittaa nimensä (ListAgents) skoopeille a0, ab ja 85 SendMessagella heti puruun |

## 28.10.2026 — scopes kordinaattori

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SCOPES2-PALUU-KORJAUKSET — Sonnet high: ilmoita uusi sessionimi (ListAgents) skoopeille sessions-repo-e6 (adapteri), -d1 (ios), -85 (macos) ja toteutussuunnitelmalle -74. Seuraa ios t59.sh-uusintaa (Mac-UI-vuoro d1:llä; vihreä → T-59 valmis, vapauta Mac macosille/overseerin T-72 B -vuoroa varten) ja adapterin T-103…T-111 -korjauksia (e6; T-104 avaa T-29/T-83; T-110 valmis abd8a50b → avaa toteutussuunnitelma V1-SYNKKA-BRIEFIT). Ydin-T-108 avataan Opus medium -valvojalla (--model claude-opus-5-5 --effort medium) vasta adapterikorjausten jälkeen; enintään yksi Opus-valvoja tässä ketjussa. Kulutusmittaus klo 10–11 (viikkoraja %/h; kirjaa KEHITYSMALLI.md-päätökseen tai overseerille). Joutilaat (ab, 85, toteutussuunnitelma 74) auki: tmux /exit esti luokittelija, pyydä käyttäjältä lupa tai sulkeminen. Ei agy:tä eikä Flashia; raportit overseerille SendMessagella. — polut: scopes/kordinaattori/** — aloitus: /pura scopes kordinaattori — automaattinen: kyllä

### Tila — poistettu tai muutettu

- scopes2-kehitys käynnissä uudelleen 28.10.2026. Valmiit ja suljetut: shared (f6ec34d2), ydin (dc067ac6). Käynnissä: adapteri e6 (ent. a0; T-103…T-111, valvoja Opus medium), ios d1 (ent. ab; t59.sh-uusinta Mac-UI-vuorolla), macos 85 (T-71-diagnoosiajo vihreä, vuoro annettu ios d1:lle; T-72 B odottaa ihmisvaihetta overseerilla), toteutussuunnitelma 74 (Opus high; 038c6589 valmis, joutilas). Koordinaattorin uusi sessionimi sessions-repo-e0 ilmoitettu e6:lle, d1:lle ja 85:lle (28.10.2026).

### Päätökset — poistettu tai muutettu

- **20.10.2026:** T-51 osittain hyväksytty; ARK-08 ei sulkeudu ennen Mac-rinnakkain-tarkistusta.
- **21.10.2026 ~10.4x:** Käyttäjä (patriot → overseer b5; sanat eivät vielä repossa, pyydetty commitoimaan): "Tiputetaan macos kehitys odottamaan ja priorisoidaan ios ja oneplus server" (viikkoraja 76 %). Koordinaattori: jatkuvat ydin 8c (T-75 → T-76 → T-78 → T-57 → T-58), adapteri 80 (T-89 → T-63-G → T-65 ∥ T-79-G → T-90), shared 68 (T-62, sitten T-87 vain iOS ja yhteiset osat vahvistuksella); T-71 (ARK-18, macOS) pysäytetty; T-64 → T-84 odottavat toteutussuunnitelman tarkennusta; suljettavaksi 06 web, 7b kord-vahti, 7a architecture jos joutilas.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| scopes2 ios: T-59-tarkistus (sessions-repo-d1, ent. ab, Opus high) | kesken 28.10.2026 (todenna viim. 4.11.2026): ajo 8 PUNAINEN (exit 1); syy (d1): vanhentunut ScopesSolmu.xcframework (20.10. 19.38), ei lähdemuutos; korjaus b9d7c220 (t59.sh ajaa xcframework_varmista); odottaa konetta mac | t59.sh-uusinta d1:llä Mac-UI-vuorolla (annettu 28.10., macos 85:n T-71-diagnoosiajo vihreä); vihreä → T-59 valmis ja Mac vapaaksi macosille/overseerin T-72 B -vuorolle |
| scopes2 macos: T-100- ja T-72-tarkistus (sessions-repo-85, Sonnet high) | kesken 28.10.2026 (todenna viim. 4.11.2026): T-71-diagnoosiajo (testKehitysOsio yksin, tuoreella worktreellä) vihreä, vuoro päättyi ja annettu ios d1:lle; T-100/T-72-raportti puuttuu; T-72 B odottaa ihmisvaihetta overseerilla (sessions-repo-15, b3f9ed1f) | odota raporttia; Mac-UI-portit rakennuslukolla /tmp/scopes2-apple-mac.lock; T-72 B ei koordinaattorin toimi |
| Adapterin punaiset portit T-29 (1) ja T-83 (4) | kesken 28.10.2026 (todenna viim. 4.11.2026): S-5b asetukset-lajin sisältö muuttui (asetus-tila.mjs 47b8ccaf); ratkaisu 038c6589: S-5b laajennetaan automaattisiirrolla, adapteri ei suodata | T-104 (e6) avaa T-29/T-83; ydin-T-108 (S-5b-laji jono) vasta adapterikorjausten jälkeen |
| Adapterin ARK-16-löydökset (1 korkea, 4 keskitasoa, 8 matalaa) | avoin 28.10.2026 (todenna viim. 4.11.2026): lista scopes2/adapteri/REKISTERI.md Avoimet; toteutussuunnitelma päätti 28.10. (038c6589): S-5b laajennetaan automaattisiirrolla (adapteri ei suodata), jonon omistaa adapteri (uusi S-5b-laji jono), V1-synkka kahdessa vaiheessa (T-110 kartoitus ensin). Briefit scopes/toteutussuunnitelma/briefit/T-103…T-111.md; SUUNNITELMA 11.6. Adapteri (e6, Sonnet, valvoja Opus medium): T-103 KORKEA orpo adapteri, T-104 S-5b (avaa T-29/T-83), T-105, T-106, T-107, T-109 (T-108:n jälkeen), T-111, T-110 rinnalla. Ydin: T-108 S-5b-laji jono (Mac P-18) | adapteri-T-tehtävät e6:lla; ydin-T-108 avataan vasta adapterikorjausten jälkeen (enintään yksi Opus-valvoja tässä ketjussa, ei samaa puuta rinnakkain); toteutussuunnitelma suljetaan joutilaana |
| Adapterin V1-synkka (agy-kayttoraja, toiminnot-asetukset, viestit) | kesken 28.10.2026 (todenna viim. 4.11.2026): kahdessa vaiheessa (038c6589), T-110 kartoitus (e6, vain raportti) ensin | T-110-raportti → synkkabriefit toteutussuunnitelmalta (sopimusmuutostehtävä) |
| Kulutusmittaus (avaus 28.10. klo 7.55 ja 8.03) | avoin; odottaa päivää 28.10.2026 (klo 10–11) | mittaa viikkoraja %/h (vertailu 21.10. Opus-tiimi ~2 %/h); kirjaa KEHITYSMALLI.md-päätökseen tai overseerille |
| Joutilaat ab, 85 ja toteutussuunnitelma 74 auki | avoin 28.10.2026 (todenna viim. 4.11.2026): luokittelija esti tmux-/exit-sulkemisen kahdesti (macos 85); joutilaita ei suljettu | pyydä käyttäjältä lupa tai sulkeminen |
| Raporttiosoite: työskoopit raportoivat koordinaattorin sessionimelle, joka lakkaa sessionvaihdossa | avoin 28.10.2026: nimi sessions-repo-e0 ilmoitettu a0:lle, ab:lle ja 85:lle; uudet nimet e6, d1, 85, 74 | uusi koordinaattori ilmoittaa nimensä e6:lle, d1:lle, 85:lle ja 74:lle SendMessagella heti puruun |

## 28.10.2026 — scopes kordinaattori

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| scopes2 ios: T-59-tarkistus (sessions-repo-18, ent. d1) | valmis 28.10.2026: t59.sh-uusinta vihreä (b9d7c220, ajo 9); ajon 8 punaisen juurisyy vanhentunut ScopesSolmu.xcframework, ei lähdemuutos; Mac vapautettu macosille | ei mitään (rivi arkistoon seuraavassa pakkauksessa) |
| scopes2 macos: T-100- ja T-72-tarkistus (sessions-repo-cd, ent. 85) | valmis 28.10.2026: T-72 hyväksytty (portti T-49 vihreä ajossa 2; testViestitVastaavatPalvelinta ajoittainen, syy todistamatta; macos kirjasi rekisteriinsä); diagnostiikka 541db0ca (4 lokiriviä RunkoUITests.swift laske()-AUKKO-haarassa); worktree t71d poistettu, Mac-lukko vapaa | ei mitään (rivi arkistoon seuraavassa pakkauksessa) |
| Adapterin punaiset portit T-29 (1) ja T-83 (4) | valmis 28.10.2026: T-104 (8b847c97) portit T-29/T-83/T-65/T-25 vihreät (adapteri 16:n raportti, palvelimen /tmp-klooni; koordinaattori ei ajanut) | ei mitään (rivi arkistoon seuraavassa pakkauksessa) |
| Adapterin ARK-16-löydökset (1 korkea, 4 keskitasoa, 8 matalaa) ja ketju T-103…T-111 | valmis 28.10.2026: adapteri 16: T-103 f221b910, T-104 8b847c97, T-105 e6cb4a6e, T-106 4e10954e, T-107 e3992fcd, T-111 91a7227f, T-109 d5d90d60 (+rekisteri 1231ecc1), T-110 abd8a50b; ydin 3d: T-108 ff8fa832 (ec1ef159 haarassa ydin/t108-jono, rekisteri 48c90116); koordinaattori tarkisti commitit git cat-file -t ja haaran sisältävyyden | ei mitään (rivi arkistoon seuraavassa pakkauksessa) |
| Kulutusmittaus (avaus 28.10. klo 7.55 ja 8.03) | valmis 28.10.2026: patriotin mittaus t5 klo 9.03 (baf24865): viikko ~3,7 %/h, 5 h ~31 %/h, viikko täynnä ~29.10.; patriot kirjasi (c21971a6), käyttäjän mukaan muu kehitys nosti lukemaa, jatketaan entiseen tapaan; patriot omistaa mittauksen. Oma lukuyritys klo 10.07: viikkoa ei saatu (/api/oauth/usage 429), 5 h 9 % (7.54) → 60 % (10.06) | ei mitään (rivi arkistoon seuraavassa pakkauksessa) |
