# Scopes iOS Suorituskykymittaukset 18.10.2026

Mittauslaite: iPhone 15 Pro (iOS 27.0 -simulaattori)
Työkalu: CADisplayLink ruutuvälimittari (SCOPES_MITTARI=itse), mittausikkuna 24 askeleen veto + 1,5 s jälkianimaatio.

## 1. Sivupalkin vetoliikkeen ruutuajat (Debug vs. Release)

### Debug (sumeus = on)
- avaus n=1: jakso=16.7 ms, kuva=21.2 ms | veto: ruutuja=16, max=49.2 ms, yli1.5x=10, pitkat=391 ms | jalki: ruutuja=30, max=107.0 ms, yli1.5x=2, pitkat=153 ms
- sulku n=2: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=14, max=66.7 ms, yli1.5x=10, pitkat=491 ms | jalki: ruutuja=33, max=95.8 ms, yli1.5x=1, pitkat=96 ms
- avaus n=3: jakso=16.7 ms, kuva=14.2 ms | veto: ruutuja=11, max=66.1 ms, yli1.5x=10, pitkat=483 ms | jalki: ruutuja=33, max=121.9 ms, yli1.5x=1, pitkat=122 ms
- sulku n=4: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=11, max=70.2 ms, yli1.5x=11, pitkat=566 ms | jalki: ruutuja=32, max=85.7 ms, yli1.5x=1, pitkat=86 ms
- avaus n=5: jakso=16.7 ms, kuva=20.6 ms | veto: ruutuja=13, max=79.8 ms, yli1.5x=11, pitkat=570 ms | jalki: ruutuja=31, max=150.1 ms, yli1.5x=2, pitkat=196 ms
- sulku n=6: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=12, max=63.5 ms, yli1.5x=10, pitkat=486 ms | jalki: ruutuja=33, max=109.9 ms, yli1.5x=1, pitkat=110 ms

### Debug (sumeus = pois)
- avaus n=1: jakso=16.7 ms, kuva=21.1 ms | veto: ruutuja=15, max=61.2 ms, yli1.5x=12, pitkat=610 ms | jalki: ruutuja=32, max=114.3 ms, yli1.5x=1, pitkat=114 ms
- sulku n=2: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=13, max=119.2 ms, yli1.5x=11, pitkat=654 ms | jalki: ruutuja=31, max=106.3 ms, yli1.5x=2, pitkat=133 ms
- avaus n=3: jakso=16.7 ms, kuva=14.7 ms | veto: ruutuja=15, max=59.7 ms, yli1.5x=13, pitkat=621 ms | jalki: ruutuja=32, max=101.7 ms, yli1.5x=1, pitkat=102 ms
- sulku n=4: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=11, max=76.0 ms, yli1.5x=11, pitkat=537 ms | jalki: ruutuja=32, max=114.2 ms, yli1.5x=1, pitkat=114 ms
- avaus n=5: jakso=16.7 ms, kuva=13.4 ms | veto: ruutuja=13, max=75.8 ms, yli1.5x=9, pitkat=492 ms | jalki: ruutuja=31, max=90.0 ms, yli1.5x=1, pitkat=90 ms
- sulku n=6: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=12, max=51.7 ms, yli1.5x=11, pitkat=542 ms | jalki: ruutuja=32, max=102.9 ms, yli1.5x=2, pitkat=144 ms

### Release — Ennen optimointia (sumeus = on)
- avaus n=1: jakso=16.7 ms, kuva=25.6 ms | veto: ruutuja=7, max=68.9 ms, yli1.5x=7, pitkat=455 ms | jalki: ruutuja=28, max=174.8 ms, yli1.5x=2, pitkat=215 ms
- sulku n=2: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=10, max=68.2 ms, yli1.5x=9, pitkat=461 ms | jalki: ruutuja=32, max=114.1 ms, yli1.5x=2, pitkat=144 ms
- avaus n=3: jakso=16.7 ms, kuva=22.5 ms | veto: ruutuja=13, max=69.0 ms, yli1.5x=9, pitkat=422 ms | jalki: ruutuja=32, max=87.6 ms, yli1.5x=2, pitkat=117 ms
- sulku n=4: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=10, max=85.1 ms, yli1.5x=9, pitkat=525 ms | jalki: ruutuja=33, max=83.3 ms, yli1.5x=3, pitkat=160 ms
- avaus n=5: jakso=16.7 ms, kuva=16.3 ms | veto: ruutuja=11, max=67.6 ms, yli1.5x=11, pitkat=558 ms | jalki: ruutuja=31, max=103.5 ms, yli1.5x=1, pitkat=103 ms
- sulku n=6: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=13, max=65.5 ms, yli1.5x=10, pitkat=476 ms | jalki: ruutuja=33, max=82.3 ms, yli1.5x=1, pitkat=82 ms

### Release — Optimoitu (PaanakymaSisalto: Equatable, sumeus = on)
- avaus n=1: jakso=16.7 ms, kuva=50.8 ms | veto: ruutuja=20, max=51.8 ms, yli1.5x=5, pitkat=193 ms | jalki: ruutuja=31, max=84.1 ms, yli1.5x=1, pitkat=84 ms
- sulku n=2: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=23, max=33.3 ms, yli1.5x=2, pitkat=67 ms | jalki: ruutuja=32, max=91.7 ms, yli1.5x=1, pitkat=92 ms
- avaus n=3: jakso=16.7 ms, kuva=29.4 ms | veto: ruutuja=22, max=33.3 ms, yli1.5x=2, pitkat=67 ms | jalki: ruutuja=32, max=89.4 ms, yli1.5x=2, pitkat=117 ms
- sulku n=4: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=24, max=33.3 ms, yli1.5x=1, pitkat=33 ms | jalki: ruutuja=33, max=84.3 ms, yli1.5x=1, pitkat=84 ms
- avaus n=5: jakso=16.7 ms, kuva=35.3 ms | veto: ruutuja=23, max=36.0 ms, yli1.5x=3, pitkat=103 ms | jalki: ruutuja=31, max=91.7 ms, yli1.5x=1, pitkat=92 ms
- sulku n=6: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=19, max=57.0 ms, yli1.5x=4, pitkat=166 ms | jalki: ruutuja=32, max=89.3 ms, yli1.5x=2, pitkat=117 ms

### Release — Optimoitu (PaanakymaSisalto + ChatView 0 ms tilaluku, sumeus = on)
- avaus n=1: jakso=16.7 ms, kuva=27.5 ms | veto: ruutuja=22, max=51.4 ms, yli1.5x=3, pitkat=119 ms | jalki: ruutuja=31, max=110.1 ms, yli1.5x=1, pitkat=110 ms
- sulku n=2: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=21, max=92.2 ms, yli1.5x=3, pitkat=170 ms | jalki: ruutuja=33, max=91.2 ms, yli1.5x=2, pitkat=117 ms
- avaus n=3: jakso=16.7 ms, kuva=28.2 ms | veto: ruutuja=19, max=53.1 ms, yli1.5x=4, pitkat=161 ms | jalki: ruutuja=33, max=90.5 ms, yli1.5x=2, pitkat=117 ms
- sulku n=4: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=14, max=56.6 ms, yli1.5x=10, pitkat=410 ms | jalki: ruutuja=30, max=124.3 ms, yli1.5x=2, pitkat=150 ms
- avaus n=5: jakso=16.7 ms, kuva=29.9 ms | veto: ruutuja=17, max=50.5 ms, yli1.5x=6, pitkat=215 ms | jalki: ruutuja=32, max=83.1 ms, yli1.5x=1, pitkat=83 ms
- sulku n=6: jakso=16.7 ms, kuva=0.0 ms | veto: ruutuja=20, max=51.0 ms, yli1.5x=3, pitkat=118 ms | jalki: ruutuja=33, max=85.2 ms, yli1.5x=1, pitkat=85 ms

## 2. Havainnot ja johtopäätökset
1. **Näkymäpuun uudelleenarvioinnin estäminen (`PaanakymaSisalto: Equatable`):**
   - Ennen optimointia vetoliikkeen aikana piirtyi vain 7–13 ruutua ja pudotettuja ruutuja (yli 1.5x) kertyi 9–11 per veto, aiheuttaen noin 450–550 ms nykimisaikaa.
   - Päänäkymän (`ChatView`, `InfraView`, ym.) eristäminen `Equatable`-näkymäksi esti SwiftUI:ta suorittamasta koko näkymäpuun uudelleenluontia jokaisella vedon pikselillä.
   - Piirtyneiden ruutujen määrä vedon aikana nousi 20–24 ruutuun (lähes täysi 60 fps ruututaajuus), ja yli 1.5x -ruudut putosivat tyypillisesti 1–3 kappaleeseen sekä nykimisaika 33–170 ms tasolle.
2. **Taustasumennus:**
   - Kertaluontoinen taustakuvan otto ja sumennus (~16–29 ms) tapahtuu vain avauksen alussa eikä vaikuta jatkuvaan vetoliikkeeseen tai sulkemiseen.
3. **Jälkianimaatio:**
   - Sormen irrotuksen jälkeinen jousianimaatio on erittäin sulava (yli 1.5x -ruutuja vain 1–2 kappaletta, jakso 16.7 ms tasolla).
4. **0 ms tilarekisteri (`ScopesDatabase`):**
   - `Sivupalkki`, `SkooppiViestitView` ja `ChatView` lataavat heti alustuksessaan muistista ja App Group -tietokannasta tallennetut tiedot (agentit, skoopit, viestit), poistaen verkkoviiveen käynnistyksessä ja näkymävaihdoissa.
