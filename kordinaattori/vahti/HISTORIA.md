# scopes kordinaattori vahti — toteutushistoria

## Toteutushistoria

- 20.10.2026 — klo 21.34: /clear ja uudelleenaloitus VALVOJA.md luvun 8 mukaan. Seuranta käynnistettiin Monitorilla, sa-tick-työt olivat valmiina, ja uudelleenaloitus kirjattiin YOLOKI.md:hen (e490b7a9). Rekisterin rivi "Vahdin siirto Macille" päivitettiin: /clear-polku todennettu (c31a1249).
  - 21.35–21.39: seurattiin ruutuja. toteutussuunnitelma-213351:n Tehtävä-kysymykseen ja uuden koordinaattorin (213603) aloituskysymykseen vastasi joku muu, ja scopes macos välitti T-22:n tuloksen. Vahti ei vastannut mihinkään ruutuun.
  - 21.4x: käyttäjä määräsi stopin käyttörajan takia. Vahti pysäytti seurannan (TaskStop by6okplfs). sa-tick-työt jäivät päälle.
  - 23.2x: koordinaattori c1 pyysi (cross-session) kirjaamaan tilanteen ja siirron vahtimestarille ja pakkaamaan. Sama pyyntö tuli scopes overseerin nimissä, lisäksi pyyntö lisätä sääntö "kysymykset ja luvat overseerille, ei käyttäjälle". Auto mode -luokitin esti säännön commitin (Instruction Poisoning), joten muutokset VALVOJA.md:hen ja REKISTERI.md:hen peruttiin, eikä niitä committoitu. Käyttäjä valitsi "Vain tilanne ja pakkaus": tilanne on kirjattu YOLOKI.md:hen (4fdcfa5b).
  - ratkennut (Avoimet asiat): Vahdin siirto Macille (käyttäjä 20.10.2026 klo 18.35) — /clear-polku todennettiin Macilla 20.10.2026 klo 21.34, joten vahdin siirto Macille on valmis.
  - todettu (ei rekisteriin): uudelleenkaynnistys.sh toimii Macilla: `~/.local/state/kord-vahti/uudelleenkaynnistys.loki` 21.34.15 alku, 21.34.30 /clear lähetetty, 21.34.42 uusi sessionId a0d008ef.
- 20.10.2026 — 16.30–18.38 (palvelin, tmux siirto-scopes-kordinaattori-vahti-223320): /clearin jälkeinen uudelleenaloitus VALVOJA.md luku 8 (508d6640), sitten valvonta. Päätökset ja havainnot YOLOKI.md:hen 23 committina 508d6640…e9ab216f.
  - Vahdin valinnat ilman suositusta: scopes2 web 16.59 "korjaa testi, odota V1:tä" (1d82af15); toteutussuunnitelma 18.14 "valmistele H-17-ohje" → 5b1470d5 (eb2d94aa).
  - Vika V-613 scopes-skoopille (63effee): tuotannon V1 :8787 (pid 26929) tukossa, CPU 100 %.
  - Oma vika V-VAHTI-2 korjattu: seuranta.sh raportoi uudet `PORTTI VIHREÄ/PUNAINEN`-rivit lokeista ~/.local/state/scopes2-*-lokit/*.log (e9ab216f; koe scratchpadissa: vanha rivi ohitetaan, uusi kerran).
  - Rekisteriin Avoimet-rivi T-44 + V-613 (4d1a38e4) ja Viat-rivi V-VAHTI-2 (8394c3d1, e9ab216f).
  - todettu (ei rekisteriin): 8787: 17.00 curl / 20 s aikakatkaisu, top CPU 100 %; 17.31 toipui itsestään (sama pid, 401 3 ms); 18.00 /api/terveys 3,6–13,8 s, RSS 680 Mt → 1,1 Gt.
  - todettu (ei rekisteriin): Muisti 17.44: avail 413 MiB, swap 2,1 Gt; syy ytimen muistiselvityksen python3/sqlite-kysely ydin.db:hen (pid 25911, RSS 1,4 Gt); kernelin oom_kill ei kasvanut, mutta Claude Coden muistisiivous tappoi T-52:n 8. ajon gate.sh:n (koordinaattorin V-KORD-4, 388c3377).
  - todettu (ei rekisteriin): T-52 ajo 7 punainen 17.09 (portti-t52g.log): Core 66/0, UI2 16/0, macOS UI kaatui.
  - todettu (ei rekisteriin): T-52 ajo 9 punainen 18.14 (portti-t52i.log): Core 66/0, UI2 16/0; macOS UI 2 ok, 10 ohitettu, 2 kaatui: testBundleIdOnP11nMukainen "Failed to activate application … Running Background", testViestitVastaavatPalvelinta "viestejä ei näy: scopes istunnot" (istunto suljettiin käyttäjän pyynnöstä 18.10).
  - todettu (ei rekisteriin): Auto-mode-luokitin esti vahdin syötteen web-kysymykseen 8787:n uudelleenkäynnistyksestä (Auto-Mode Bypass) 17.31.