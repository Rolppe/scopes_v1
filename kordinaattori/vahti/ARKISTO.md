# scopes kordinaattori vahti — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 20.10.2026 — scopes kordinaattori vahti

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Yövalvonta 19.–20.10. | tehty: aamuraportti YOLOKI e84001e4 (20.10. 06.58) | — |
| T-44 (web, 8797) ja V1 :8787 tukossa 20.10. 16.29– | V-613 scopes-skoopille (63effee); web korjaa hyvaksynta.ts:n aikarajat ja odottaa 8787:ää; 8787:n uudelleenkäynnistys vain käyttäjän luvalla | 8787 vastaa → web ajaa hyväksynnän, vahti todentaa tulosteesta → H-12 käyttäjälle |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-VAHTI-1 (19.10.2026, oma): uudelleenkaynnistys.sh odotti statusta `idle`, mutta Monitorin kanssa vapaan istunnon status on `shell`; /clear jäi tekemättä 23.53–23.59 (koe Haikulla ilman taustatyötä ei paljastanut) | korjattu: vapaa = idle tai shell eikä `esc to interrupt` ruudussa |
| V-VAHTI-2 (20.10.2026, oma): seuranta.sh seuraa ruutuja, commiteja ja muistia, mutta ei irrallisten (setsid) porttiajojen lokeja; T-52:n 9. ajo päättyi punaisena 18.14, vahti huomasi sen vasta 18.29 sharedin herätessä | korjattu: seuranta.sh raportoi uudet `PORTTI VIHREÄ/PUNAINEN`-rivit lokeista ~/.local/state/scopes2-*-lokit/*.log (koe scratchpadissa: vanha rivi ohitetaan, uusi kerran) |

## 20.10.2026 — scopes kordinaattori vahti

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VAHTI-YOVALVONTA — valvo scopes2-ajoa VALVOJA.md:n mukaan (luvun 4 kierros, päätökset YOLOKI.md:hen) ja kirjoita aamuraportti klo 7.00 (luku 7); seuranta `bash scopes/kordinaattori/vahti/seuranta.sh` Monitorilla; 200 k:n kontekstissa /clear ja uudelleenaloitus (luku 8) — polut: scopes/kordinaattori/vahti/** — aloitus: /pura scopes kordinaattori vahti

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Käyttäjän aamupäätökset 20.10. (koordinaattori 851b0343) | V-582: uusi binääri jää; T-44 + H-12 tänään käyttäjän läsnä ollessa; H-17 T-51:n jälkeen; H-7: kaksi ylimääräistä ScopesV2Mac-sääntöä pois macOS-portin jälkeen; ARK-16/H-16 scopes architecturelle | T-49 vihreä 09.15 (0c664ebd). T-52: Automation Mode ilman todennusta voimassa (käyttäjä 15.5x); ajo 7 käyttäjän luvalla käynnissä 16.08 (~2 h, scopes2-shared-143719, punaisella ei uusintaa). Vahti seuraa: vihreä → todenna gate-tulosteesta, shared committoi kolmessa osassa, koordinaattori → T-51 (ARK-08), T-53; punainen → käyttäjälle. T-44 + H-12 odottavat käyttäjän läsnäoloa |
| T-44 (web, 8797) ja V1 :8787 tukossa 20.10. 16.29– | V-613 scopes-skoopille (63effee); web korjaa hyvaksynta.ts:n aikarajat ja odottaa 8787:ää; 8787:n uudelleenkäynnistys vain käyttäjän luvalla **20.10.2026:** T-44 (web): hyväksyntä 6/6, muistiehto punainen: V2-ytimen VmHWM 824 Mt > 512 MiB (444cda5f); ydin: ei vuoto vaan toistuva piikki. | 8787 vastaa → web ajaa hyväksynnän, vahti todentaa tulosteesta → H-12 käyttäjälle |
| Vahdin siirto Macille (käyttäjä 20.10.2026 klo 18.35) | tehty 20.10. 19.30: käyttäjä valitsi "Yövalvonta Macilla" (19.2x); seuranta.sh ja uudelleenkaynnistys.sh toimivat Macilla (bash 3.2, kern.memorystatus_level, perl setsid, mkdir-lukko), VALVOJA.md luku 6 ja 8 päivitetty | /clear-polku todennettu Macilla 20.10. 21.34 (uudelleenkaynnistys.loki: /clear 21.34.30, uusi sessionId a0d008ef 21.34.42); ei jatkotoimia |
| scopes2-ajo Macilla 20.10. illalla (koordinaattori jakaa porttivuorot, scopes macos vastaa ruutuihin käyttäjän valtuudella) | T-49 vihreä 20.49 (ajo 4), T-52 vihreä 21.13 (ajo 11), T-53-hyväksyntä vihreä 21.23, T-51 8/9 (Mac-rinnakkain avoin, V-628); ydin T-22-vuorossa (V-623 gate.sh Macille 393a688d/b4b3badf/7cbcb930); shared TUNNELITESTI; palvelinpuun synkka (reset + 23 vaihevirheriviä talteen) odottaa käyttäjää (2384e6d2) | vahti seuraa: porttitulokset todennetaan lokeista (seuranta.sh raportoi myös scratchpad-lokit), päätökset YOLOKI.md:hen; aamuraportti 7.00 |
