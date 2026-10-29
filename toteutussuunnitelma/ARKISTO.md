# scopes toteutussuunnitelma — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 19.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: TOTEUTUSSUUNNITELMA-MAARITTELY — kirjaa käyttäjän kanssa skoopin tarkoitus, raja ja ensimmäinen työ, ja korvaa tämä rivi ensimmäisellä oikealla paketilla — polut: scopes/toteutussuunnitelma/** — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 19.10.2026 | paketti TOTEUTUSSUUNNITELMA-MAARITTELY |

## 19.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — suunnittelutyö vaiheelle 2 ja ARK-12:lle on valmis (TOTEUTUSSUUNNITELMA-SCOPES2 19.10.2026); seuraava tämän skoopin paketti TOTEUTUSSUUNNITELMA-VAIHE-3 (ARK-08/09/16 tehtävätasolle) alkaa vasta, kun ARK-06 (T-34) ja ARK-12 (T-33) ovat portissa vihreitä toisissa skoopeissa; sitä ennen toteutuksen esiehdot ovat käyttäjän: H-4 `/pura scopes architecture` (ARCHITECTURE-JAKELU), H-3 skoopit `scopes2`, `scopes2 ydin`, `scopes2 adapteri`, H-10 purkureitti (SUUNNITELMA.md luku 6)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Toteutuksen aloitus vaatii H-4 (ARCHITECTURE-JAKELU: ARK-04…07 ja ARK-12 skoopeille `scopes2 ydin`, `scopes2 adapteri`), H-3 (skoopit `scopes2`, `scopes2 ydin`, `scopes2 adapteri`) ja H-1 (rustup) | odottaa käyttäjää (toiset skoopit) 19.10.2026 | käyttäjä: `/pura scopes architecture`; `/pura uusi scopes2 — scopes-V2 (K-9)` ensin, sitten alaskoopit; H-1 kysyy `scopes2 ydin` -valvoja (SUUNNITELMA luku 6) |
| `scopes2`-skooppien purkureitti: `pura-malliton.mjs onPerhe` tunnistaa vain `scopes/` → mallireitti (H-10) | tiedoksi 19.10.2026 | käyttäjä päättää: hyväksyy mallireitin tai `/vika scopes context purascript …` (TYÖTAVAT 15) |
| ARK-16 (adapteri ottaa toiminnot `viesti`/`liite`/`stop`/`pura`… ennen vanhan alasajoa; P-9-tuonnit kopioidaan) ei ole arkkitehtuurin paketti | ehdotus 19.10.2026 (SUUNNITELMA luku 9) | käyttäjä pyytää kirjauksen `/pura scopes architecture` -keskustelussa |
| Vaiheiden 3–6 tehtävätaso kirjoittamatta | avoin (karkea luku 9) | paketti TOTEUTUSSUUNNITELMA-VAIHE-3, kun T-34 (ARK-06) ja T-33 (ARK-12) ovat vihreitä |
| Rust-työkaluketju puuttuu palvelimelta ja Macilta (E-3, H-1/H-2) | avoin (käyttäjä 19.10.2026: kuuluu toteutukseen, ei tähän skooppiin) | `scopes2 ydin` -valvoja kysyy luvan ARK-04:n alussa (SUUNNITELMA luku 6) |
| Siltavertailun fixturet (T-35, T-31-G) haetaan vanhasta 8787:stä lukevilla curl-kutsuilla; vanhan muutos käyttäjän erillisestä pyynnöstä voi rikkoa vertailun | riski 19.10.2026 (SUUNNITELMA luku 10) | sallittujen erojen lista briefissä; ei vanhan jäädytystä |

## 19.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — kysytty 19.10.2026: "Ei nyt" (H-4/H-3 jakelu ja scopes2-skoopit, H-10 purkureitti ja H-1 rustup jäävät odottamaan käyttäjää rekisteriin; suunnittelutyö vaiheelle 2 ja ARK-12:lle on valmis, TOTEUTUSSUUNNITELMA-VAIHE-3 alkaa, kun T-34 ja T-33 ovat vihreitä)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-36 (ydin, muisti) ja T-37 (adapteri, `oom_score_adj`) kirjattu suunnitelmaan ja briefeihin; T-34 ajo 4 vaatii käyttäjän luvan (luku 1 sääntö 5) | avoin (19.10.2026); odottaa käyttäjää | käyttäjä päättää kirjauksesta omistajien rekistereihin (`scopes2 ydin`, `scopes2 adapteri`, `scopes kordinaattori`; TYÖTAVAT 15); T-36 ajaa `scopes2 ydin` -valvoja, sitten T-37, sitten T-34 ajo 4 luvalla; adapteri- ja koordinaattori-istuntoja ei pyydetä jatkamaan T-34:ää ennen T-36:ta |

## 19.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — TOTEUTUSSUUNNITELMA-VAIHE-3 kirjattu (ARK-10 37a4f465; ARK-08/09 ja luku 11.4 tässä paketissa); toteutus omistajaskoopeissa koordinaattorin ohjauksessa; seuraava suunnittelutyö: tehtävätaso ARK-16:lle, kun käyttäjä on kirjannut sen arkkitehtuuriin, ja ARK-11/13/14, kun niiden ihmisvaiheet (H-6, H-8) ovat tehty — polut: scopes/toteutussuunnitelma/** — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-36 (ydin, muisti) ja T-37 (adapteri, RLIMIT_DATA-raja) kirjattu suunnitelmaan ja briefeihin; T-34 ajo 4 vaatii käyttäjän luvan (luku 1 sääntö 5) **19.10.2026:** OOM-tappo todettu `dmesg -T` 19.10.2026 17:59:15: Killed process 17355 (scopes-solmu) anon-rss 4239248 kB; `oom_score_adj` -950 (`/proc/self/oom_score_adj`). | avoin (19.10.2026); odottaa skooppia `scopes2 ydin` | T-36 ajaa `scopes2 ydin` -valvoja (`/pura scopes2 ydin`, SEURAAVA YDIN-T36-MUISTI c7a8161c), rinnalla T-37 (`scopes2 adapteri`), T-34 ajo 4 vasta molempien jälkeen käyttäjän luvalla; omistajarekistereihin kirjattu 6c077da3; adapteri- ja koordinaattori-istuntoja ei pyydetä jatkamaan T-34:ää ennen T-36:ta **19.10.2026:** T-37: `oom_score_adj`-nosto vaatii rootin (Bash-työkalu ja ssh-kuori) → T-37 käyttää RLIMIT_DATA-rajaa (`/tmp/scopes2-t37-muutos.md`, todennettu). |
| ARK-10:n omistajaskooppi `scopes2 web` (H-11) | tehty 19.10.2026 (koordinaattori, f7aec267; SEURAAVA WEB-T38G-RUNKO) | — |

## 19.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VAIHE3-MAC-RAJOITTEET — koordinaattorin pyyntö 19.10.2026 (yövalvoja, YOLOKI 70a4ec0f ja a69d74c1): Mac-rajoitteet briefeihin T-45-G, T-46, T-47, T-48, T-49, T-52 ja SUUNNITELMA 11.2:n johdantoon ennen toteutusta: (1) ad-hoc-allekirjoitus yöllä, laite H-17; (2) palvelimen puu ainoa kirjoittaja (V-572), Macille vain rsync/git bundle/tar käännöstä varten, Macin kloonista ei pushata; (3) PATH=$HOME/.cargo/bin:$PATH; (4) ssh Maciin toimii (git, simctl: iPhone 15 Pro käynnissä, cargo); (5) H-7 käyttäjälle; ilmoitus commit-tunnuksella koordinaattorille (palvelin-e5) — polut: scopes/toteutussuunnitelma/** — aloitus: /pura scopes toteutussuunnitelma — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| ARK-08:n esiehdot H-13 (skoopit `scopes2 shared`, `scopes2 ios`, `scopes2 macos`), H-14 (Macin ssh-tunneli), H-15 (V2-avain Macin Keychainiin) | avoin (19.10.2026); odottaa koordinaattoria | komennot SUUNNITELMA luku 6; T-46 voi alkaa heti (`scopes2 ydin`) |
| H-17: laiteallekirjoitus ja asennus omalle iPhonelle ja Macille | avoin (19.10.2026, P-16); odottaa käyttäjää | ARK-08:n hyväksynnän (T-51) jälkeen Xcodessa |
| Mac-rajoitteet briefeihin (koordinaattorin pyyntö pakkauksen aikana) | avoin (19.10.2026) | SEURAAVA PAKETTI VAIHE3-MAC-RAJOITTEET |

## 20.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: VAIHE3-T51-KOEYDIN — SUUNNITELMA 11.2:n T-51-rivi (hyväksyntäajo) ja rollback koeydin/tilapäinen tunneli -malliin (ei tunneliagenttia eikä `launchctl bootout`; P-14 22.10-tarkennus), tarkista luku 6 aikajana ja H-17 vastaavat — polut: scopes/toteutussuunnitelma/** — aloitus: /pura scopes toteutussuunnitelma — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Toteutuksen aloitus vaatii H-4 (ARCHITECTURE-JAKELU: ARK-04…07 ja ARK-12 skoopeille `scopes2 ydin`, `scopes2 adapteri`), H-3 (skoopit `scopes2`, `scopes2 ydin`, `scopes2 adapteri`) ja H-1 (rustup) | avoin (toiset skoopit, 19.10.2026); odottaa käyttäjää | käyttäjä: `/pura scopes architecture`; `/pura uusi scopes2 — scopes-V2 (K-9)` ensin, sitten alaskoopit; H-1 kysyy `scopes2 ydin` -valvoja (SUUNNITELMA luku 6) **19.10.2026:** Todettu 19.10.2026: `luo-skooppi.mjs "scopes2 ydin" … --kuiva` → yläskoopilla "scopes2" ei ole omaa rekisteriä (state/skoopit.json): luo se ensin (exit 0) → H-3 alkaa `/pura uusi scopes2 — scopes-V2 (K-9)`. |
| `scopes2`-skooppien purkureitti: `pura-malliton.mjs onPerhe` tunnistaa vain `scopes/` → mallireitti (H-10) | avoin (tiedoksi 19.10.2026); odottaa käyttäjää | käyttäjä päättää: hyväksyy mallireitin tai `/vika scopes context purascript …` (TYÖTAVAT 15) **19.10.2026:** Todettu: `claude/siirto/tools/pura-malliton.mjs:623` `onPerhe = rekisteri.startsWith('scopes/')` → `scopes2 *` -skoopit puretaan mallireitillä (H-10). |
| ARK-16 (adapteri ottaa toiminnot `viesti`/`liite`/`stop`/`pura`… ennen vanhan alasajoa; P-9-tuonnit kopioidaan) ei ole arkkitehtuurin paketti | avoin (ehdotus 19.10.2026, SUUNNITELMA luku 9); odottaa käyttäjää | käyttäjä pyytää kirjauksen `/pura scopes architecture` -keskustelussa |
| T-36 (ydin, muisti) ja T-37 (adapteri, RLIMIT_DATA-raja) kirjattu suunnitelmaan ja briefeihin; T-34 ajo 4 vaatii käyttäjän luvan (luku 1 sääntö 5) **19.10.2026:** OOM-tappo todettu `dmesg -T` 19.10.2026 17:59:15: Killed process 17355 (scopes-solmu) anon-rss 4239248 kB; `oom_score_adj` -950 (`/proc/self/oom_score_adj`). | avoin (19.10.2026); odottaa skooppia `scopes2 ydin` **19.10.2026:** esiehdot gitistä 19.10.2026: T-34 37edddb0 ja 6ea06bfa, T-33 b3a6ec42, T-28 a873ac53; T-39 tehty 0426f35c (ydin). | T-36 ajaa `scopes2 ydin` -valvoja (`/pura scopes2 ydin`, SEURAAVA YDIN-T36-MUISTI c7a8161c), rinnalla T-37 (`scopes2 adapteri`), T-34 ajo 4 vasta molempien jälkeen käyttäjän luvalla; omistajarekistereihin kirjattu 6c077da3; adapteri- ja koordinaattori-istuntoja ei pyydetä jatkamaan T-34:ää ennen T-36:ta **19.10.2026:** T-37: `oom_score_adj`-nosto vaatii rootin (Bash-työkalu ja ssh-kuori) → T-37 käyttää RLIMIT_DATA-rajaa (`/tmp/scopes2-t37-muutos.md`, todennettu). |
| ARK-08:n esiehdot H-13 (skoopit `scopes2 shared`, `scopes2 ios`, `scopes2 macos`); H-14 (Macin ssh-tunneli) ja H-15 (V2-avain Macin Keychainiin) yliviivattu ja siirretty H-17:n yhteyteen (koordinaattorin päätös 19.10.2026 klo 22.05, 51902251; T-47 ja T-49 eivät odota niitä) | avoin (19.10.2026); odottaa koordinaattoria | komennot SUUNNITELMA luku 6; T-46 voi alkaa heti (`scopes2 ydin`) |
| H-16: peili fyysisessä iPhonessa (koko 2,5 Gt vai aikaikkuna; K-1 ja arkkitehtuurin luku 8 olettavat 38 Mt) | avoin (19.10.2026, P-17); odottaa käyttäjää | käyttäjä päättää `/pura scopes architecture` -keskustelussa; ei estä ARK-08:aa macOS:llä ja simulaattorissa |
| H-17: laiteallekirjoitus ja asennus omalle iPhonelle ja Macille; pysyvä tunneliagentti (H-14) ja V2-avain Keychainiin (H-15) | avoin (19.10.2026, P-16); odottaa käyttäjää | aamulla ARK-08:n hyväksynnän (T-51) jälkeen Xcodessa |
| Rust-työkaluketju puuttuu palvelimelta ja Macilta (E-3, H-1/H-2) | avoin (käyttäjä 19.10.2026: kuuluu toteutukseen, ei tähän skooppiin; ei tehdä tässä skoopissa); odottaa käyttäjää | `scopes2 ydin` -valvoja kysyy luvan ARK-04:n alussa (SUUNNITELMA luku 6) |
| H-12: todellinen viesti web-asiakkaasta | avoin (19.10.2026); odottaa käyttäjää | T-44:n jälkeen |
| `scopes2/shared/gate.sh`: koeydin, tilapäinen tunneli ja Macin lukko toteuttamatta | valmis (20.10.2026: toteutettu `scopes2 shared` 9f384450, koeydin myös T-48 a2117af6; `gate.sh` `koeydin_alku`, `--tunnelitesti`; T-51-tapausta portissa ei ole, SUUNNITELMA 11.2) | `scopes2 shared` -omistajalle `/vika` (käyttäjä sanoi "Ei nyt"; aiempi ehdotettu /vika-teksti kuvasi tuotannon 8797 -tunnelin ja on vanhentunut, uusi teksti kirjoitettava, kun käyttäjä haluaa) |
| SUUNNITELMA 11.2:n T-51-rivi mainitsee yhä "tunneli ylhäällä" ja rollbackina "tunneliagentin `launchctl bootout`" | valmis (20.10.2026: T-51 koeytimellä ja tilapäisellä tunnelilla, liitteen sha koeytimen datasta ennen `trap`ia, rollback ilman agenttia; luku 6 H-14 ja H-17 tarkennettu) | päivitä koeydin/tilapäinen tunneli -malliin (ei agenttia) |

## 20.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään tässä skoopissa — ARK-17 tehtävätasolla (luku 11.5, T-54…T-59; V-611); ajo koordinaattorin ohjauksessa, T-54 voi alkaa, T-55 odottaa arkkitehtuurin tarkastusta S-9b:stä; ARK-16 ja ARK-18 tehtävätasolle vasta ARK-08:n (T-51) vihreän jälkeen

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| H-17: laiteallekirjoitus ja asennus omalle iPhonelle ja Macille; pysyvä tunneliagentti (H-14) ja V2-avain Keychainiin (H-15) | avoin; käyttäjä päätti 20.10.2026 (851b0343): Xcodessa Macin työpöydällä T-51:n vihreän jälkeen, V2-avain Keychainiin samalla, H-14 päätetään T-51:n tuloksesta; odottaa T-51:tä | T-51 ajetaan T-52:n jälkeen (20.10.2026 T-52 7. ajo käynnissä) |
| H-12: todellinen viesti web-asiakkaasta | avoin; käyttäjä päätti 20.10.2026 (851b0343): heti T-44:n jälkeen käyttäjän ollessa paikalla; odottaa T-44:ää | T-44:n lupakysymys on koordinaattorilla (c6eebbbc) |

## 20.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: V-615-P-RIVI — kirjaa SUUNNITELMAan P-rivi (V-615, käyttäjä valitsi 20.10.2026 pakkauksessa): ARK-17:n (T-54…T-56) ja myöhemmät scopes2 ydin -käännökset ja -testit ajetaan Macilla T-53:n jälkeen (syy: palvelimen 7,4 Gt muisti, T-52 ajo 8 kuoli muistipaineeseen 17.44; Mac 16 Gt); päivitä luvun 11.5 T-54…T-57 ajopaikka (ajetaan Macin kloonissa mac:~/sessions-repo) — polut: scopes/toteutussuunnitelma/** — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| S-9b:n "ikkunoidut"-kenttä (ARK-17): lähettävä solmu tietää, että vertaisen peili on ikkunoitu (ei ikkunaa) | avoin (20.10.2026); odottaa skooppia scopes architecture | tarkastuspyyntö lähetetty käyttäjän päätöksellä 20.10.2026; T-55 odottaa vastausta |
| V-585 | avoin (kysytty 20.10.2026, pakkauksen kysymys: sisältö jo rekisterissä H-17- ja H-12-riveillä, 851b0343) | kuittaa IDEAT-rivi V-615-P-RIVI-paketin yhteydessä |
| V-609 | avoin (käyttäjä 18.35: ei uutta työtä ennen Mac-siirtoa); odottaa konetta mac | kirjaa alustajärjestys macOS → iOS → oneplus (headless + web, ei Tauria) SUUNNITELMA lukuun 11.4 / ARK-11 |
| V-615 | avoin (kysytty 20.10.2026: käyttäjä valitsi seuraavaksi paketiksi V-615-P-RIVI); odottaa konetta mac | kirjaa P-rivi SUUNNITELMAan Macin kloonissa |

## 20.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: V-609-ALUSTAT — kirjaa SUUNNITELMA lukuun 11.4 alustajärjestys macOS → iOS → oneplus ja ARK-11 kahtia (käyttäjä 20.10.2026 pakkauksessa): oneplus = headless-solmu + web ilman Tauria; Linux-äppi (scopes2 linux, Tauri-kuori palvelimella) omaksi paketikseen iOS:n rinnalle kehitykseen, koordinaattori avaa scopes2 linuxin, kun T-44 on hyväksytty ja palvelin vastaa — polut: scopes/toteutussuunnitelma/** — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| ARK-16 (adapteri ottaa toiminnot `viesti`/`liite`/`stop`/`pura`… ennen vanhan alasajoa; P-9-tuonnit kopioidaan) arkkitehtuurin paketiksi | valmis 20.10.2026: käyttäjä hyväksyi (851b0343), `scopes architecture` kirjasi luvun 9 riviksi, omistaja `scopes2 adapteri` (174ae82f) | pois seuraavassa pakkauksessa |
| H-16: peili fyysisessä iPhonessa (koko 2,5 Gt vai aikaikkuna; K-1 ja arkkitehtuurin luku 8 olettavat 38 Mt) | valmis 20.10.2026: käyttäjä valitsi aikaikkunan (851b0343), `scopes architecture` kirjasi K-10:ksi (174ae82f) | pois seuraavassa pakkauksessa; P-17 päivitetään K-10:n mukaan ARK-08:n fyysisen iPhonen vaiheessa |
| V-609 | avoin (Mac-siirto tehty 20.10.2026, ehto täyttyi) | kirjaa alustajärjestys macOS → iOS → oneplus (headless + web, ei Tauria) ja ARK-11:n jako SUUNNITELMA lukuun 11.4 / ARK-11 (seuraava paketti) |
| Raakarivien asiakasnäkymä (iOS) | avoin (S-9f; ei T-58/T-59:ssä) | päätetään ARK-17:n iOS-osan jälkeen |

## 20.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-594 | valmis 20.10.2026 (havainnot SUUNNITELMA 11.3 T-53-rivillä ja briefit/T-52.md; T-52 ja T-53 vihreä, koordinaattori 21.13 ja 21.23) | pois |

## 20.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa skooppia scopes2 ydin: V-623 (gate.sh lockf) ja V-626 (testiportit) ennen T-55:tä Macilla; T-53 vihreä 20.10.2026, V-594 tehty

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Vaiheiden 4–6 tehtävätaso kirjoittamatta | avoin (vaihe 3: ARK-10, ARK-08, ARK-09 luvuissa 11.1–11.3; ARK-17 luvussa 11.5 20.10.2026; muut karkeina luvussa 11.4) | ARK-16 ja ARK-18 tehtävätasolle ARK-08:n (T-51) vihreän jälkeen; ARK-11, ARK-13, ARK-14 ihmisvaiheiden jälkeen |
| T-55 Macilla | avoin (T-53 vihreä 20.10.2026, P-18:n ehto täyttyi; V-623 lockf, V-626 portit); odottaa skooppia scopes2 ydin | T-55…T-57 ja T-60 Macilla, kun ydin on tehnyt V-623:n ja V-626:n |
| T-51 Mac-ajo (ARK-08:n hyväksyntä) | avoin (koordinaattori 20.10.2026: seuraava Mac-ajo); odottaa skooppia scopes2 ios | tiedoksi, ei tämän skoopin ajo; V-605 tehdään T-51:n jälkeen |

## 21.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-55, T-56, T-61 ja T-60 Macilla | valmis (T-55 c53f27d6 20.10.2026: gate.sh T-55, T-21, T-22, T-28, T-54 exit 0; T-56 db3bbad3 21.10.2026: T-56, T-35, T-36, T-30 exit 0; T-61 fd5ce19e 21.10.2026: T-61, T-55, T-56, T-21 exit 0; T-60 1188d53d 21.10.2026: T-60, T-56, T-30 exit 0, S-9f-tarkennukset SUUNNITELMA.md luku 4; koordinaattorin ilmoitukset) | T-57 ytimellä (SUUNNITELMA.md luku 11.5) |

## 21.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-51-tapaus puuttuu portista `scopes2/shared/gate.sh` | avoin (tiedoksi 20.10.2026); odottaa skooppia scopes2 shared | T-51 ajetaan T-49:n koeydin- ja tunnelivaiheella; tapaus lisätään vain `scopes2 shared` -omistajan päätöksellä |
| T-55:n riskit (ARK-17) | avoin 20.10.2026 (koordinaattori, c53f27d6: karsintarajan nosto kesken tasaa-kierroksen voi hakea karsitut kerran uudelleen; tests/kaksi_solmua_ikkuna kestää ~67 s) | arvioi T-57:n hyväksyntäajossa |
| ARK-16: listan ulkopuoliset sillatut reitit (`malli`, `arkistoi`, `uusi`, `asetukset*`, `GET /api/skoopit/<nimi>/asetukset`, `kayttoraja`, `viat`, `diagnostiikka`, `android*`, `palvelin*`, `kordinaattori*`, `GET /api/agentit`) — adapteriin, ytimeen vai pois V2:sta | avoin 21.10.2026 (SUUNNITELMA 11.6 rajaus); odottaa skooppia scopes architecture | vika-teksti lähetetty scopes overseerille välitettäväksi `scopes architecture`lle (21.10.2026); vastauksen jälkeen tehtävätaso tähän skooppiin (luku 11.6) |
| ARK-16 ja ARK-18 toteutus (T-63-G…T-70, T-71, T-72) | avoin 21.10.2026; odottaa skooppia scopes kordinaattori | koordinaattori jakaa vuorot: T-64 ja T-71 Mac-jonoon (T-71 ei T-58:n eikä T-62:n rinnalla), adapterin tehtävät palvelimelle; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ARK-16-LOPUT-ARK-19 — arkkitehtuurin vastauksen (dfc28af4) tehtävätaso: luvun 11.6 lisätehtävät ARK-16:een (`POST …/malli`, `POST /api/uusi`, `GET /api/agentit` chatin mukana, asetusten muutos), ytimeen `GET /api/kayttoraja`, ARK-19 lukuna 11.8 briefeineen (`/api/android*`, `/api/palvelin*`; riippuu S-10-portista T-63-G); pois V2:sta `arkistoi`, `viat`, `diagnostiikka`, `kordinaattori*` — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/*, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Päätökset — poistettu tai muutettu

- **21.10.2026 (ARK-17-KORJAUS, käyttäjä valitsi "Aloita ARK-17-KORJAUS", automaattijatko pois):** S-9:ään "Sisältöaika" (skeema 2, `/api/listat`-kenttä `sisaltoaika`) ja sen käyttö S-9a/b/c:ssä ja koko-reitissä (T-73). S-9a riisuu näkymän tarpeeseen (T-74): liput, tool_use nimellä ja `tyokalu_rivi`n avaimilla (ensimmäinen rivi enintään 2 000 merkkiä), AskUserQuestionin `questions` kokonaan, tool_result-lohkon `tool_use_id` ja `toolUseResult.answers`. Peruste: T-57 (4) ja `nakymat.rs:916-987`. Tämä laajentaa K-10:n "viestitekstin" näkymän tarpeeseen; työkalutulokset ja ajattelu jäävät pois, ja T-74 mittaa kokosuhteen. Pohja haetaan heti (T-75), ja täyden solmun muistikorjaus tehdään mittaus edellä (T-76, Opus). T-57-rivin (2)(4)(7) sisältöaikaan; (4) ja (5) tarkennettu, ajo 1 merkitty hylätyksi, uusinta T-76:n jälkeen, ja tuotantokopioon kysytään hyväksyntä uudelleen. T-58 riippuu T-57:n uusinnasta. T-55:n riskit arvioitu: ei toteutunut T-57:ssä ((3) 0, (2) id:t samat), ei korjaustehtävää.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-44: V2-uudelleenkäynnistys `--web`-lipulla | avoin (19.10.2026; 21.10.2026 riippuu T-76:sta ja T-78:sta, koordinaattori); odottaa skooppia scopes kordinaattori | koordinaattorin päätös ennen T-44:ää, kun T-76 ja T-78 ovat vihreitä |
| ARK-16-LOPUT-ARK-19: arkkitehtuurin vastauksen (dfc28af4) tehtävätaso — ARK-16:een `POST …/malli`, `POST /api/uusi`, `GET /api/agentit` (chatin mukana), asetusten muutos (luku ytimestä adapterin peilinä tilatiedostoista, `toiminnot-asetukset.mjs:13-19`); ytimeen `GET /api/kayttoraja`; uusi ARK-19 (alasajon esiehto, käyttäjä vahvisti 21.10.2026; riippuu S-10-portista T-63-G): `/api/android*` ja `/api/palvelin*`; pois V2:sta (siltalistalla alasajoon asti, V2-UI ei kutsu): `arkistoi`, `viat`, `diagnostiikka`, `kordinaattori*` | avoin 21.10.2026 (scopes architecture vastasi, dfc28af4; käyttäjän valinta pakkauksessa: ARK-17-KORJAUS ensin) | ARK-17-KORJAUKSEN jälkeen: luvun 11.6 lisätehtävät ja ARK-19 lukuna 11.8 briefeineen, aloitus `/pura scopes toteutussuunnitelma` |
| T-57 (ARK-17:n ydinhyväksyntä) hylätty | avoin 21.10.2026 (koordinaattori fbe58e3c); korjaustehtävät T-73…T-76 kirjoitettu (SUUNNITELMA 11.5 "ARK-17-KORJAUS", briefit T-73…T-76); odottaa skooppia scopes kordinaattori | koordinaattori jakaa Mac-jonon: T-73 → T-74 → T-75 → T-76 → T-57:n uusinta (tuotantokopioon käyttäjän hyväksyntä) → T-58; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) |
| T-78 tuotantobinääri Macilla (T-44:n esiehto) | avoin 21.10.2026 (SUUNNITELMA 11.1, brief T-78); odottaa skooppia scopes kordinaattori | Mac-jonoon milloin tahansa; jos ristikäännös estyy → palvelinkäännöksen poikkeus käyttäjälle overseerin kautta |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ARK-16-LOPUT-ARK-19 — arkkitehtuurin vastauksen (dfc28af4) tehtävätaso: luvun 11.6 lisätehtävät ARK-16:een (`POST …/malli`, `POST /api/uusi`, `GET /api/agentit` chatin mukana, asetusten muutos), ytimeen `GET /api/kayttoraja`, ARK-19 lukuna 11.8 briefeineen (`/api/android*`, `/api/palvelin*`; riippuu S-10-portista T-63-G); pois V2:sta `arkistoi`, `viat`, `diagnostiikka`, `kordinaattori*`; kartoitus valmiina `scopes/toteutussuunnitelma/kartoitukset/ARK-16-LOPUT-ARK-19.md` (tarkista lähteestä; aukot luvun lopussa) — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/*, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| H-12: todellinen viesti web-asiakkaasta | avoin; käyttäjä päätti 20.10.2026 (851b0343): heti T-44:n jälkeen käyttäjän ollessa paikalla; odottaa T-44:ää | T-44:n lupakysymys on koordinaattorilla (c6eebbbc); ei ajettavissa tässä skoopissa ennen T-44:ää |
| T-44: V2-uudelleenkäynnistys `--web`-lipulla | avoin (19.10.2026; 21.10.2026 riippuu T-43:sta, T-76:sta ja T-78:sta, koordinaattori); odottaa skooppia scopes kordinaattori | koordinaattorin päätös ennen T-44:ää, kun T-43, T-76 ja T-78 ovat vihreitä |
| ARK-11a (oneplus headless-solmu + web ilman Tauria) | avoin; odottaa skooppia scopes kordinaattori (T-44) | tehtävätaso, kun T-44 on hyväksytty ja iOS (T-53, H-17) valmis (H-5 SUUNNITELMA 11.4) |
| ARK-11b (Linux-äppi, `scopes2 linux`) | avoin; odottaa skooppia scopes kordinaattori | skoopin avaus T-44:n jälkeen, palvelin vastaa; Rust ja webkit2gtk-4.1 palvelimelle ihmisen root-komennoilla |
| ARK-16-LOPUT-ARK-19: arkkitehtuurin vastauksen (dfc28af4) tehtävätaso — ARK-16:een `POST …/malli`, `POST /api/uusi`, `GET /api/agentit` (chatin mukana), asetusten muutos (luku ytimestä adapterin peilinä tilatiedostoista, `toiminnot-asetukset.mjs:13-19`); ytimeen `GET /api/kayttoraja`; uusi ARK-19 (alasajon esiehto, käyttäjä vahvisti 21.10.2026; riippuu S-10-portista T-63-G): `/api/android*` ja `/api/palvelin*`; pois V2:sta (siltalistalla alasajoon asti, V2-UI ei kutsu): `arkistoi`, `viat`, `diagnostiikka`, `kordinaattori*` | kesken 21.10.2026 (scopes architecture vastasi, dfc28af4; käyttäjän valinta pakkauksessa: ARK-17-KORJAUS ensin, valmis c3f57f1e; reittikartoitus `scopes/toteutussuunnitelma/kartoitukset/ARK-16-LOPUT-ARK-19.md` tarkistamaton, tehtävätasoa ei kirjoitettu) | SEURAAVA PAKETTI: luvun 11.6 lisätehtävät ja ARK-19 lukuna 11.8 briefeineen, aloitus `/pura scopes toteutussuunnitelma`; kartoituksen aukot: `POST …/asetukset/…/paalle\|pois` ei sillassa, `kayttoraja`-kyselyparametrit vs. ytimen peili (vain gemini-agy), agentit riippuu androidista, agy-luvat-taustasilmukka; T-63-G ei ole tehty (`scopes2/adapteri/toiminnot/` puuttuu) |
| ARK-16 ja ARK-18 toteutus (T-63-G…T-70, T-71, T-72) | avoin 21.10.2026; odottaa skooppia scopes kordinaattori | koordinaattori jakaa vuorot: T-64 ja T-71 Mac-jonoon (T-71 ei T-58:n eikä T-62:n rinnalla), adapterin tehtävät palvelimelle; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) **21.10.2026:** Mittaus: aliagentit Explore-sonnet ARK-16 111 k tokenia, ARK-18 60 k. |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: P-14-P-15-AJOKOHTAISET — P-14, P-15 ja briefit T-48 ja T-49 V-605:n (92d8cb81) ajokohtaisiin Mac-lukkoihin ja -portteihin (18900–18919, `~/scopes2-rakennus-<ajo>`); lähde `scopes2/shared/V-605.md` luku "Muiden skooppien dokumentit" (8d2b29b0; shared 68 21.10.2026: porttipaikka, lukot, `SCOPES2_VERTAINEN`, mittaus T-48 ∥ T-47 603 s), tarkista `scopes2/shared/gate.sh`:sta (käyttäjä valitsi 21.10.2026) — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/T-48.md, scopes/toteutussuunnitelma/briefit/T-49.md, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| P-14, P-15 ja briefit T-48/T-49: V-605:n ajokohtaiset lukot ja portit | avoin 20.10.2026 (koordinaattori: V-605 92d8cb81 tekee Mac-portista 18900–18919 ja hakemistosta `~/scopes2-rakennus-<ajo>` ajokohtaiset; suunnitelma ja briefit kuvaavat vielä yhtä lukkoa ja porttia 18797); odottaa skooppia scopes2 shared | päivitä P-14, P-15, T-48 ja T-49, kun V-605 on todennettu |
| ARK-11a (oneplus headless-solmu + web ilman Tauria) | kesken (tehtävätaso luvussa 11.9: T-89, T-90); odottaa skooppia scopes kordinaattori **21.10.2026:** todettu palvelimella 21.10.2026 (ssh, lukeva): `/etc/cron.d/scopes2` (root, 19.10.2026 21.25) ajaa `*/5` `kaynnista.sh`, H-5 tehty; ydin pid 12647 kuuntelee 127.0.0.1:8797 (`--vanha 8787`), binääri käännetty 19.10.2026 23.51; adapteri (pidit 12649) ei aja: `~/.local/state/scopes2-palvelu.loki:22110` ENOSPC (inotify `max_user_watches` 8192, `~/.claude/projects` 1 652 hakemistoa, `adapteri.mjs:126` rekursiivinen watch ilman error-käsittelijää); `kaynnista.sh:95-98` poistuu, kun ydin vastaa. | koordinaattori jakaa T-89:n palvelimelle ennen T-63-G:tä; T-90 T-78:n jälkeen (H-5 SUUNNITELMA 11.4) |
| T-51 Mac-ajo (ARK-08:n hyväksyntä) | avoin (koordinaattori 20.10.2026: seuraava Mac-ajo); odottaa skooppia scopes2 ios **20.10.2026:** T-51 hyväksytty, ARK-08 kiinni: 2ac01f84 (scopes2 ios). R-3 B-polku mitattu 7b393c1e (VmHWM 237 MiB < 512 MiB). | tiedoksi, ei tämän skoopin ajo; V-605 tehdään T-51:n jälkeen |
| ARK-16 ja ARK-18 toteutus (T-63-G…T-70, T-71, T-72) | avoin 21.10.2026; odottaa skooppia scopes kordinaattori **21.10.2026:** T-63-G ja T-64 eivät olleet alkaneet 21.10.2026 (ei tests/silta_adapteri.rs:ää eikä toiminnot/-hakemistoa). | koordinaattori jakaa vuorot: T-64 ja T-71 Mac-jonoon (T-71 ei T-58:n eikä T-62:n rinnalla), adapterin tehtävät palvelimelle; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) **21.10.2026:** Mittaus: aliagentit Explore-sonnet ARK-16 111 k tokenia, ARK-18 60 k. |
| ARK-16:n loput ja ARK-19:n toteutus (T-79-G…T-88) | avoin 21.10.2026; odottaa skooppia scopes kordinaattori | koordinaattori jakaa: palvelin T-79-G, M (T-80 ∥ T-82 ∥ T-83), T-81, N (T-85 ∥ T-86); Mac T-84, T-87 |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-TS-1 (oma, 21.10.2026): 41ff93c0 kirjoitti T-85:n Contractiin `luoAndroid({ …, aja: oletusAja })` ja testin "tila() ja ohjaus saman sarjaan-lukon läpi" lukematta `oletusAja`n paluuarvoa (merkkijono, ei syötettä → PNG- ja tuotostavut rikki) eikä vanhan `tila()`:n lukitusta. Syy: kytkentä kirjoitettiin `adapteri.mjs`:n muuttujanimistä, funktioita ei avattu. Sääntö: briefin kytkentäehdotuksessa avataan jokaisen nimetyn funktion paluuarvo ja allekirjoitus lähteestä | korjattu 21.10.2026: toteuttaja käytti `ajaTavut`ia (9aa0fd46, koordinaattori hyväksyi), briefi ja luku 11.6 korjattu |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SUUNNITELMA-SEURANTA — kirjaa koordinaattorin (fe) raportit suunnitelmaan ja tarkenna briefit: T-81, T-86, T-84, T-87, `ymp.paikalliset`-jatko ja 502-korjaus ennen T-70:tä; P-6/P-14 koeportti 18798 vs 18800, kun scopes2 shared vastaa — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

## 21.10.2026 — scopes toteutussuunnitelma

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-TS-2 (oma, 21.10.2026): T-64:n briefi lisäsi `Tila`an kentän tarkistamatta struct-literaaleja testeissä (17 tiedostoa, E0063) ja käski lukulistassa lisätä polun `tests/silta.rs`:ään, joka ei ollut may-listalla. Sääntö: kun briefi lisää kentän julkiseen structiin, grepataan literaalit (`Tila {`) ja may-lista kattaa ne | korjattu 21.10.2026 (briefi T-64 ja S-10 tarkennettu, may-laajennus hyväksytty) |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SUUNNITELMA-SEURANTA-2 — kirjaa T-64:n, T-84:n, T-87:n ja T-57-uusinnan tulokset lukuihin 11.5, 11.6 ja 11.8 ja tarkenna T-70:n ja T-88:n ajo-ohjeet, kun koordinaattori raportoi — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| ARK-16 ja ARK-18 toteutus (T-63-G…T-70, T-71, T-72) | kesken 21.10.2026 (T-63-G, T-65…T-69 vihreät; ARK-16:n adapteriosa valmis T-70:tä lukuun ottamatta, fe); odottaa käyttäjää **21.10.2026:** T-63-G ja T-64 eivät olleet alkaneet 21.10.2026 (ei tests/silta_adapteri.rs:ää eikä toiminnot/-hakemistoa). **21.10.2026:** koordinaattori fe 21.10.2026, vihreät: T-63-G 91c9c0d3, T-65 1674dbc7, T-79-G 3f28a0e0, T-66 203aade0, T-67 6e4b7cae, T-80 0d77be4b, T-82 73344d5d, T-69 72ddccc3, T-83 4880929e, T-68 5439182f (Opus 69/69), T-85 9aa0fd46; T-89 ee28b578. T-76: A 1 584 → 102 MiB, B 287 MiB (14 497 yksikköä, 2,61 Gt). | **21.10.2026 (ARK-16-JULKAISU, käyttäjän pyyntö fe:n kautta):** T-70-koe e0f0b9ca: 1–5 ja 7 OK, poikkeama `/api/agentit` X-Lahde: silta → briefit T-91 (ydin, Mac) ja T-92 (kaynnista.sh --adapteri, V-637; palvelin) sekä T-93 (julkaisu, valvoja ydin) SUUNNITELMA 11.6; järjestys T-91 → T-93 → T-92 → käyttäjältä asennus (`--asenna`, korvaa 3895346c:n) ja T-70:n tuotantoajo; cron.d `SCOPES2_TOIMINNOT=8798` pysyvään käyttöön (root, käyttäjä). T-70 odottaa näitä ja käyttäjän päätöstä tuotantoajosta; koordinaattori jakaa vuorot: T-64 ja T-71 Mac-jonoon (T-71 ei T-58:n eikä T-62:n rinnalla), adapterin tehtävät palvelimelle; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) **21.10.2026:** Mittaus: aliagentit Explore-sonnet ARK-16 111 k tokenia, ARK-18 60 k. |
| T-57 (ARK-17:n ydinhyväksyntä) hylätty | avoin 21.10.2026 (koordinaattori fbe58e3c); korjaustehtävät T-73…T-76 kirjoitettu (SUUNNITELMA 11.5 "ARK-17-KORJAUS", briefit T-73…T-76); odottaa skooppia scopes kordinaattori (jono jaettu, T-73 käynnissä) **21.10.2026:** T-57 fbe58e3c: (4) B 77 / A 120 viestiä, yhteisiä 36, puuttuvista 82 tyokalu + 1 kysymys + 1 vastaus; (5) kordinaattori 0 viestiä ilman pohjaa; (6) A huippu-RSS 1 410 449 408 t; ajettiin kloonin HEADilla (R-3 mukana). | koordinaattori jakaa Mac-jonon: T-73 → T-74 → T-75 → T-76 → T-78 → T-57:n uusinta T-76:n jälkeen (tuotantokopioon käyttäjän hyväksyntä) → T-58; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) |
| ARK-16:n loput ja ARK-19:n toteutus (T-79-G…T-88) | kesken 21.10.2026 (T-79-G, T-80, T-81 648c326d, T-82, T-83, T-85, T-86 15637f10 vihreät; T-87 koodi worktreessä `sessions-repo-t87`, odottaa T-64:ää ja tuontia HEADin päälle; T-84 ytimen jonossa T-64:n jälkeen, fb8ab71f; SUUNNITELMA 11.6 ja 11.8 21.10.2026); odottaa konetta mac **21.10.2026:** luvun 11.6/11.8 taulukoiden mukaan ARK-16 = T-63-G…T-84 ja T-70, ARK-19 = T-85…T-88 (patriotin "ARK-16 (T-79…T-88)" oli virheellinen). | Mac: T-64 → T-84 → (T-87, T-70); kirjaa T-84:n ja T-87:n tulokset, kun ne valmistuvat |
| T-57 uusinta | ajettu 21.10.2026 (2c73044a): (1)–(3) ja (6)–(9) OK, (4) ja (5) ei todennettu (tuotannossa ei skoopillista istuntoa); kirjattu SUUNNITELMA 11.5; HYVÄKSYTTY poikkeamapäätöksellä 21.10.2026 (overseer 28 ruutuvastauksena käyttäjän valtuudella, toteutussuunnitelman suositus: "Hyväksy, todenna myöhemmin"; hylätty "Todenna nyt synteettisesti" ja "Odota"); odottaa ajoa (todenna viim. 4.11.2026) | (4) ja (5) todennetaan T-59:ssä ja ensimmäisellä skoopillisella tuotantoistunnolla T-58:n jälkeen; T-58 voi alkaa |
| T-87:n tuonti HEADin päälle | valmis 21.10.2026: T-87 vihreä 00cce758 (gate T-87 ja T-49 exit 0), kirjattu SUUNNITELMA 11.8; T-58 alkoi iOS d5:llä (korvasi e0:n) | T-64:n jälkeen worktree tuodaan HEADin päälle, ja `gate.sh`:n T-87-tapaus yhdistetään T-71:n versioon käsin. |
| T-64:n portti | valmis 21.10.2026: T-64 vihreä 9a9fb3bc ja T-84 vihreä b9544ef8, kirjattu SUUNNITELMA 11.6 ja 11.8 notteineen; T-70 (7) tarkennettu | — |
| ARK-16-JULKAISU ja T-94 | kesken 21.10.2026: T-91 9c0220f1, T-93 julkaisu 7da86808, T-92 41de9f3f + 15375aa4 vihreät; tuotantoasennus käyttäjän luvalla (0dceb548), katko 51,5 s, siirtymä 51,4 s ≈ 1,9 × kopio; briefi T-94 (kaynnista.sh terveysodotus ja toisen ytimen esto) kirjoitettu. T-70 tuotantoajo (e3): (1)–(5) OK, (7) OK paitsi kayttoraja ilman parametreja, (6) H-18 tekemättä; päätökset A (chat vanhaan scopes-chatiin, briefi T-95, ennen T-94:ää) ja B (kayttoraja 8797:n vastauksella, vanhan jumi oireena scopes palvelulle) SUUNNITELMA 11.6; odottaa skooppia scopes kordinaattori | koordinaattori jakaa T-95:n ja T-94:n adapterille; T-70:n hyväksyntä, kun (7):n loput, H-18 ja T-95:n jälkeinen chat-vertailu OK; sitten tarkenna T-88 |

## 21.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-78 tuotantobinääri Macilla (T-44:n esiehto) | avoin 21.10.2026 (SUUNNITELMA 11.1, brief T-78); odottaa skooppia scopes kordinaattori (jonossa T-76:n jälkeen) | Mac-jonossa T-76:n jälkeen; jos ristikäännös estyy → palvelinkäännöksen poikkeus käyttäjälle overseerin kautta |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-78 tuotantobinääri Macilla (T-44:n esiehto) | valmis 21.10.2026 (T-78 32fcb938; julkaisu 3895346c korvattu T-93:n 7da86808:lla, asennettu tuotantoon 0dceb548; käyttäjän hyväksymä merkintä pakkauksessa) | — |
| T-57 uusinta | valmis 21.10.2026 (2c73044a; hyväksytty poikkeamapäätöksellä c246e583/e9cbb303; (4) ja (5) siirretty T-59:ään, SUUNNITELMA 11.5; käyttäjän hyväksymä merkintä pakkauksessa) | — |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SUUNNITELMA-SEURANTA-3 — kirjaa T-95:n, T-94:n ja T-70:n hyväksynnän (7:n loput, H-18, chat-vertailu) tulokset lukuun 11.6 ja tarkenna T-88:n ajo-ohje, kun koordinaattori raportoi — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| ARK-16 ja ARK-18 toteutus (T-63-G…T-70, T-71, T-72) | kesken 21.10.2026 (T-63-G, T-65…T-69 vihreät; ARK-16:n adapteriosa valmis T-70:tä lukuun ottamatta, fe); odottaa käyttäjää **21.10.2026:** T-63-G ja T-64 eivät olleet alkaneet 21.10.2026 (ei tests/silta_adapteri.rs:ää eikä toiminnot/-hakemistoa). **21.10.2026:** koordinaattori fe 21.10.2026, vihreät: T-63-G 91c9c0d3, T-65 1674dbc7, T-79-G 3f28a0e0, T-66 203aade0, T-67 6e4b7cae, T-80 0d77be4b, T-82 73344d5d, T-69 72ddccc3, T-83 4880929e, T-68 5439182f (Opus 69/69), T-85 9aa0fd46; T-89 ee28b578. T-76: A 1 584 → 102 MiB, B 287 MiB (14 497 yksikköä, 2,61 Gt). **21.10.2026:** T-70 tuotantoajo (e3): (1)–(5) OK; (7) OK paitsi kayttoraja ilman parametreja (8787 > 100 s, 8797 2 ms); (6) H-18 tekemättä. e3 käynnisti adapterin uudelleen 15.41 (pid 14553) ja toi tuotantopuuhun 7 tiedostoa (vain scopes2/adapteri/** ja kaynnista.sh) overseerin V-OVS-4-valtuudella, ei käyttäjän (korjaus overseer 58); käyttäjä hyväksyi itse asennuksen 7da86808 ja V2:n uudelleenkäynnistyksen (0dceb548). H-18 alkoi e3:lla 21.10.2026 klo 15.55. | **21.10.2026 (ARK-16-JULKAISU, käyttäjän pyyntö fe:n kautta):** T-70-koe e0f0b9ca: 1–5 ja 7 OK, poikkeama `/api/agentit` X-Lahde: silta → briefit T-91 (ydin, Mac) ja T-92 (kaynnista.sh --adapteri, V-637; palvelin) sekä T-93 (julkaisu, valvoja ydin) SUUNNITELMA 11.6; järjestys T-91 → T-93 → T-92 → käyttäjältä asennus (`--asenna`, korvaa 3895346c:n) ja T-70:n tuotantoajo; cron.d `SCOPES2_TOIMINNOT=8798` pysyvään käyttöön (root, käyttäjä). T-70 odottaa näitä ja käyttäjän päätöstä tuotantoajosta; koordinaattori jakaa vuorot: T-64 ja T-71 Mac-jonoon (T-71 ei T-58:n eikä T-62:n rinnalla), adapterin tehtävät palvelimelle; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) **21.10.2026:** Mittaus: aliagentit Explore-sonnet ARK-16 111 k tokenia, ARK-18 60 k. |
| ARK-16-JULKAISU ja T-94 | kesken 21.10.2026 (T-91, T-93 7da86808, T-92 vihreät ja asennettu; T-70 (1)–(5) OK; päätökset A/T-95, B ja H-18:n tapa SUUNNITELMA 11.6); odottaa skooppia scopes kordinaattori | T-95 → T-94 adapterille; H-18 overseerin sopimana aikana; T-70:n tulos 11.6:een; sitten T-88 |
| T-95 (adapteri, palvelin) | avoin (briefi kirjoitettu 21b272a6, 21.10.2026); odottaa skooppia scopes kordinaattori | koordinaattori jakaa; tuotantoon vienti käyttäjältä; sitten T-70 (2) chat-vertailu uudelleen |
| cron.d-rivi `SCOPES2_TOIMINNOT=8798` | avoin (root, käyttäjä); odottaa käyttäjää | T-70:n hyväksynnän jälkeen |
| T-58 (iOS d5) | kesken 21.10.2026 (käynnissä; iOS d5 korvasi e0:n) | T-59 tarkistaa T-57:n siirretyt (4)–(5) (todenna viim. 4.11.2026) |

## 21.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-95 (adapteri, palvelin) | valmis 21.10.2026 (ad18be7d; portit vihreät, adapteri HISTORIA.md:8-9; tuotannossa 7c9bda9d, chat 159 = 159) | koordinaattori jakaa; tuotantoon vienti käyttäjältä; sitten T-70 (2) chat-vertailu uudelleen |

## 21.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-58 (iOS d5) | valmis 21.10.2026 (9704e106; T-58, T-47 ja T-49 exit 0; jatko T-59) | — (jatko rivillä T-59) |

## 21.10.2026 — scopes toteutussuunnitelma

### Avoimet asiat — poistettu (tavukatto, käyttäjän valinta 21.10.2026: vanhimmat tiedoksi- ja valmiit rivit)

| Asia | Tila | Seuraava askel |
|---|---|---|
| T-51-tapaus puuttuu portista `scopes2/shared/gate.sh` | avoin (tiedoksi 20.10.2026); odottaa skooppia scopes2 shared | T-51 ajetaan T-49:n koeydin- ja tunnelivaiheella; tapaus lisätään vain `scopes2 shared` -omistajan päätöksellä |
| S-9b-poikkeama: "peili-karsinta ei virtaan" ei täyty (ARK-17) | korjattu fd5ce19e 21.10.2026 (T-61: `virta.rs:119` suodattaa `replikointi::on_sisainen`-joukon, myös T-56:n peili-pohja; portti vihreä koordinaattorin mukaan); odottaa ajoa (todenna viim. 4.11.2026) | todenna T-57:n hyväksyntäajossa |
| T-51 Mac-ajo (ARK-08:n hyväksyntä) | avoin (koordinaattori 20.10.2026: seuraava Mac-ajo); odottaa skooppia scopes2 ios **20.10.2026:** T-51 hyväksytty, ARK-08 kiinni: 2ac01f84 (scopes2 ios). R-3 B-polku mitattu 7b393c1e (VmHWM 237 MiB < 512 MiB). **21.10.2026:** T-51 valmis 20.10.2026, ARK-08 kiinni (`scopes/kordinaattori/REKISTERI.md:105`, 2ac01f84). | tiedoksi, ei tämän skoopin ajo; V-605 tehdään T-51:n jälkeen |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: SUUNNITELMA-SEURANTA-5 — kirjaa koordinaattorin 180115 seuraavat raportit (ARK-18 T-71/T-72, ARK-11a T-90) lukuihin 11.7 ja 11.9; SUUNNITELMA-SEURANTA-4 tehty 21.10.2026 (ARK-17 ja ARK-19:n palvelin-osa hyväksytty) — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| RunkoUITests.testViestitVastaavatPalvelinta riippuu ympäristöstä (T-49/T-52; V-605 kohdat 3 ja 5) | avoin 20.10.2026 (siemennetty koeskooppi, ei mock-V1: scopes overseer käyttäjän valtuudella, AskUserQuestion istunnossa b160c2fe; brief `briefit/T-62.md`, skooppi "test" koska /api/skoopit listaa vain sillan skoopit `nakymat.rs:1552`); odottaa skooppia scopes2 shared | T-62 skoopille scopes2 shared V-605:n todennuksen jälkeen |
| agy-paketit T-96 (ydin), T-97 (ios), T-98 (adapteri), T-100 (macos) | briefit valmiit 21.10.2026 (overseer 185235); T-99 väliin (ytimen itsetestin tuntematon ID) | kirjaa tulokset, kun agy- tai Claude-ajo raportoi (`$HOME/agy-raportit/T-NN/`); committi ajoistunnossa |
| T-59 ja ARK-17 | valmis 21.10.2026: T-59 (a)(b)(c) + T-49 vihreä (b70dd25c), ARK-17 HYVÄKSYTTY; (4)(5) tuotannossa ja K-10 laitteella jälkitodennuksia, ei ehtoja (SUUNNITELMA 11.5 "T-59:n tulos") | pois seuraavassa pakkauksessa |
| T-88 ja ARK-19 palvelin-osa | valmis 21.10.2026: (1)–(5), (7) vihreä (7ab36c0c, b4c0ccd0); (6) ja T-87-UUSINTA lykätty (72ffe0b3, a9dcb6ef, V-OVS-13); palvelin-osa HYVÄKSYTTY ilman omaa ajoa (SUUNNITELMA 11.8) | pois seuraavassa pakkauksessa |
| briefit/README.md:n indeksitaulukosta puuttuvat T-60, T-73…T-76, T-91, T-92, T-94 ja T-95 | valmis 21.10.2026 (lisätty agy-pakettien yhteydessä) | pois seuraavassa pakkauksessa |

<!-- Siirretty REKISTERI.md:stä 21.10.2026 (pakkaus, tavukatto; ARK-16-osa valmis): -->
| ARK-16 ja ARK-18 toteutus (T-63-G…T-70, T-71, T-72) | kesken 21.10.2026 (T-63-G, T-65…T-69 vihreät; ARK-16-osa valmis 21.10.2026, T-70 hyväksytty; ARK-18 (T-71, T-72) ennallaan, fe); odottaa käyttäjää **21.10.2026:** T-63-G ja T-64 eivät olleet alkaneet 21.10.2026 (ei tests/silta_adapteri.rs:ää eikä toiminnot/-hakemistoa). **21.10.2026:** koordinaattori fe 21.10.2026, vihreät: T-63-G 91c9c0d3, T-65 1674dbc7, T-79-G 3f28a0e0, T-66 203aade0, T-67 6e4b7cae, T-80 0d77be4b, T-82 73344d5d, T-69 72ddccc3, T-83 4880929e, T-68 5439182f (Opus 69/69), T-85 9aa0fd46; T-89 ee28b578. T-76: A 1 584 → 102 MiB, B 287 MiB (14 497 yksikköä, 2,61 Gt). **21.10.2026:** T-70 tuotantoajo (e3): (1)–(5) OK; (7) OK paitsi kayttoraja ilman parametreja (8787 > 100 s, 8797 2 ms); (6) H-18 tekemättä. e3 käynnisti adapterin uudelleen 15.41 (pid 14553) ja toi tuotantopuuhun 7 tiedostoa (vain scopes2/adapteri/** ja kaynnista.sh) overseerin V-OVS-4-valtuudella, ei käyttäjän (korjaus overseer 58); käyttäjä hyväksyi itse asennuksen 7da86808 ja V2:n uudelleenkäynnistyksen (0dceb548). H-18 alkoi e3:lla 21.10.2026 klo 15.55. | **21.10.2026 (ARK-16-JULKAISU, käyttäjän pyyntö fe:n kautta):** T-70-koe e0f0b9ca: 1–5 ja 7 OK, poikkeama `/api/agentit` X-Lahde: silta → briefit T-91 (ydin, Mac) ja T-92 (kaynnista.sh --adapteri, V-637; palvelin) sekä T-93 (julkaisu, valvoja ydin) SUUNNITELMA 11.6; järjestys T-91 → T-93 → T-92 → käyttäjältä asennus (`--asenna`, korvaa 3895346c:n) ja T-70:n tuotantoajo; cron.d `SCOPES2_TOIMINNOT=8798` pysyvään käyttöön (root, käyttäjä). T-70 odottaa näitä ja käyttäjän päätöstä tuotantoajosta; koordinaattori jakaa vuorot: T-64 ja T-71 Mac-jonoon (T-71 ei T-58:n eikä T-62:n rinnalla), adapterin tehtävät palvelimelle; tehtävät omistajien rekistereihin vain käyttäjän pyynnöstä (TYÖTAVAT 15) **21.10.2026:** Mittaus: aliagentit Explore-sonnet ARK-16 111 k tokenia, ARK-18 60 k. |

## 21.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: AGY-TULOKSET — kirjaa agy-pakettien tulokset (T-100 valmis 1cfce137; T-96, T-97, T-98 raporteista `$HOME/agy-raportit/T-NN/` tai commiteista) SUUNNITELMAan ja REKISTERIin, sitten briefaa S-9f-näkymä (osa 2, Sonnet, SUUNNITELMA 11.5 "S-9f-asiakas") T-97:n vihreän jälkeen; sen jälkeen koordinaattorin 180115 ARK-18 (T-71/T-72) ja ARK-11a (T-90) -raportit lukuihin 11.7 ja 11.9 — polut: scopes/toteutussuunnitelma/SUUNNITELMA.md, scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/REKISTERI.md — aloitus: /pura scopes toteutussuunnitelma

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Raakarivien asiakasnäkymä (S-9f) | kesken 21.10.2026: osa 1 T-97 vihreä (commitoimatta); osa 2 briefattu: T-101 (ydin `istunto.transkripti` + siltavertailu, agy Flash) ja T-102 (näkymä, Sonnet), SUUNNITELMA 11.5 "S-9f-asiakas osa 2" | T-101 agylle tai ajoistunnolle; T-102 Mac-UI-jonossa T-72:n jälkeen, kun T-97 ja T-101 on commitoitu |
| agy-paketit T-96 (ydin), T-97 (ios), T-98 (adapteri), T-100 (macos) | kesken 21.10.2026 (briefit 51131ebf, overseer 185235; T-99 väliin; kirjattu SUUNNITELMA 11.5 "AGY-TULOKSET" klo 19.5x: T-100 vihreä 1cfce137; T-96 vihreä ja commitoitu 7e7402b1, T-97 vihreä 19.53 (T-97, ScopesCore2Tests 108/0) ja T-98 vihreä (T-86 52/52, T-65 22/22), T-97 ja T-98 commitoimatta worktreeissä `$HOME/agy-wt/T-NN`, diffit tarkistettu) | T-97:n ja T-98:n commit ja worktreen poisto ajoistunnossa (overseer), ei tässä skoopissa |
| agy-ohjeiden ajo (T-72, T-59 varalla) | avoin (ohjeet valmiit 21.10.2026, 037cf6c4; T-72 ajettu kerran ja kirjattu 11.7:ään, osa B uusitaan korjatulla ohjeella); odottaa skooppia scopes kordinaattori | koordinaattori tai overseer päättää ajosta; raportit `$HOME/agy-raportit/T-72` ja `$HOME/agy-raportit/T-59` kirjataan lukuihin 11.7 ja 11.5 |

## 28.10.2026 — scopes toteutussuunnitelma

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: AGY-INTEGRAATIO-MACOS vaihe A — overseerin tilaus `scopes/overseer/viestit/agy-integraatio-macos.md` (käyttäjä 21.10.2026): macOS-äppi näyttää agy-istunnot ja niiden tilan; tarkista ensin mitä ydin/adapteri tarjoaa (S-5b agy, T-29, /api/skoopit agy-kenttä), briefaa ydin/adapteri-osa ja macOS-UI-osa (Mac-UI-jonossa T-102:n edelle), vie vaiheiden B ja C kysymys arkkitehtuurille (tmux send-keys vs agy-SQLite vs agy CLI, E-25, Android-vapaus 5736f24e), kirjaa vaatimus SUUNNITELMA.md:hen — polut: scopes/toteutussuunnitelma/briefit/, scopes/toteutussuunnitelma/SUUNNITELMA.md — aloitus: /pura scopes toteutussuunnitelma

### Päätökset — poistettu tai muutettu

- **21.10.2026:** Overseerin tilaukset noudatetaan järjestyksessä: ohjeistuksen vaiheet 1–4 (+ viestinvaihto vaiheessa 2), sitten agy-integraatio A. Ei agy-ajoja. Raportti overseerille vaihe kerrallaan muodossa tiedosto:rivi.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| ARK-16-korjaukset T-103…T-111 (koordinaattorin SCOPES2-PALUU-JATKO 28.10.2026) | briefattu 28.10.2026 (SUUNNITELMA 11.6 "ARK-16-korjaukset 28.10.2026"; päätökset: S-5b laajennetaan `automaattisiirto`lla, jonon omistaa adapteri (laji `jono`), V1-synkka kartoitus T-110 ensin); lähetetty adapteri-istunnolle e6 ja koordinaattorille | odottaa raportteja: T-110:n raportin jälkeen synkkabriefit (A-luokka) ja B-luokan sopimuspäätökset; T-103…T-111 tulokset lukuun 11.6 |
| ARK-18 toteutus (T-71, T-72) | kesken 21.10.2026 (ARK-16-osa valmis, T-70 hyväksytty; T-71 vihreä 3b199453; T-72 ajettu 21.10.2026: (1) ja (4) OK, (2)(3) ei kelpaa, koska portti ajettiin lukitulla näytöllä ohjeen virheen vuoksi; ohje korjattu (avaus ennen porttia, `pgrep ScopesV2Mac` tyhjä, LOCKED-näytteet), SUUNNITELMA 11.7 "T-72:n tulos"; ARK-16-rivin koko historia ARKISTO.md:ssä 21.10.2026); odottaa käyttäjää | T-72 osa B uudelleen korjatulla `agy/T-72.md`:llä käyttäjän ollessa Macin ääressä (Mac-UI-jono) |
| agy-ohjeiden ajo (T-72, T-59 varalla) | avoin (ohjeet valmiit 21.10.2026, 037cf6c4; T-72 ajettu kerran ja kirjattu 11.7:ään, osa B uusitaan korjatulla ohjeella); odottaa skooppia scopes kordinaattori **21.10.2026:** vaihe 1:n aukkolista 21.10.2026: (a) T-72 B -ohjeessa ei vieraan ScopesV2Mac-tarkistusta (T-72/RAPORTTI.md, pid 37691; T-71 `testKehitysOsio` 14,6 → 72,8 s, syy ei todistettu); (b) T-101: gate T-24 EXIT=1 Macilla, koska `scopes2/adapteri/kuorma.test.mjs:62,77,92` lukee `/proc/<pid>/status` VmHWM (Macilla 0), vain T-24 ajaa kuorma-testin (`adapteri/gate.sh:101`), T-35 ja T-56 EXIT=0 (`$HOME/agy-raportit/T-101/`); (c) `agy/README.md` "Kielletty aina" kieltää git commitin eikä brief nimennyt commitoijaa; (d) `agy/README.md` kieltää `tmux send-keys`/SendMessage, mutta `scopes/overseer/agy-vahti.md` lähettää hälytyksiä tmuxilla ruutuun siirto-scopes-overseer-185235; (e) agy käynnistyy `mac agy --dangerously-skip-permissions --model … -i "$VIESTI"` jaetussa kloonissa `$MAC_JUURI` (`claude/siirto/tools/autovaihto.sh:362,400`), joten konteksti on vain -i-viesti ja luetut tiedostot. | koordinaattori tai overseer päättää ajosta; raportit `$HOME/agy-raportit/T-72` ja `$HOME/agy-raportit/T-59` kirjataan lukuihin 11.7 ja 11.5 |
| ARK-18 T-71/T-72 ja ARK-11a T-90: tulosten kirjaus | avoin (21.10.2026); odottaa skooppia scopes kordinaattori (raportti 180115) | kirjaa tulokset lukuihin 11.7 ja 11.9 (entinen SUUNNITELMA-SEURANTA-5) |
| Agy-ohjeistus vaiheet 1–4 (overseerin 185235 tilaus) | tehty 28.10.2026 (SUUNNITELMA "AGY-OHJEISTUS (28.10.2026"; agy/README.md, agy/T-72.md, agy/T-59.md, agy/KUIVA.md, briefit/README.md kohdat 8–11); raportti overseerille sessions-repo-15 28.10.2026 | overseer tai koordinaattori päättää KUIVA-ajosta ennen T-72 B:tä |
| Agy-integraatio macOS-äppiin (A näkymä, B kirjoitus, C chat-synkka) | avoin (21.10.2026, ei aloitettu; overseerin 185235 tilaus `agy-integraatio-macos.md`) | A näkymä: tarkista S-5b agy, T-29 ja /api/skoopit agy-kenttä; briefit ydin/adapteri agy Flash ja macOS-UI Sonnet; Mac-UI-jonossa ennen T-102:ta; kirjaa vaatimus SUUNNITELMA.md:hen. B kirjoitus ja C chat-synkka: arkkitehtuurikysymys scopes architecturelle overseerin kautta (tmux send-keys vs agy-SQLite vs agy CLI -komennot, E-25, Android-vapaus 5736f24e) |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Agy-ohjeistus vaiheet 1–4 (overseerin 185235 tilaus) | valmis 28.10.2026 (e0868e86: SUUNNITELMA "AGY-OHJEISTUS (28.10.2026", agy/README.md, agy/T-72.md, agy/T-59.md, agy/KUIVA.md, briefit/README.md kohdat 8–11); raportti overseerille sessions-repo-15 | ei ajettavaa: KUIVA ja agy/T-72 eivät aja (overseer 28.10.2026) |
