# scopes/kordinaattori/vahti/REKISTERI.md

Tilanne: 20.10.2026

SEURAAVA PAKETTI: ei mitään — kysytty 20.10.2026: käyttäjä valitsi pakkaa vain; aamupäätökset (T-44 + H-12), 8787-tukos ja scopes2-ajo Macilla ovat koordinaattorin ja käyttäjän asioita, ei vahdin; ruutuvalvonta ja ruutuvastaukset siirtyivät skoopille scopes vahtimestari, hallinta ja jumit scopes overseerille

## Tarkoitus ja raja

scopes2-ajon itsenäinen valvoja: pitää koordinaattorin toiminnassa ja tekee käyttäjälle varatut päätökset valtuuksin (ohje `scopes/kordinaattori/vahti/VALVOJA.md`, päätösloki `scopes/kordinaattori/vahti/YOLOKI.md`).

Raja: vahti ei muokkaa scopes2-koodia, briefejä eikä muiden skooppien rekistereitä (VALVOJA.md luku 1); muutokset kulkevat omistajien istuntojen kautta. Vahti omistaa ohjeensa, päätöslokinsa ja tämän rekisterin.

## Päätökset

- **Käyttäjä 19.10.2026:** skooppi `scopes kordinaattori vahti` luotiin komennolla `/pura uusi scopes kordinaattori vahti`.
- **Käyttäjä 19.10.2026:** "Kun konteksti on 200k ja päällä ei ole mikään ongelma tilanne niin skoopin pitää tehdä clear komento ja aloittaa automaattisesti uudestaan vahtitoiminto." Toteutus VALVOJA.md luku 8: `seuranta.sh` (KONTEKSTI-RAJA) ja `uudelleenkaynnistys.sh` (/clear + aloituskehote); ei pakkausta eikä istunnon vaihtoa. Korvasi saman päivän ensimmäisen pyynnön (300 k:ssa automaattisiirto), jonka käyttäjä perui.
- **Käyttäjä 19.10.2026 (määrittely):** VALVOJA.md ja YOLOKI.md siirretään `scopes/kordinaattori/`-juuresta tähän kansioon; palvelimen vahti-istunto ottaa valvonnan Macin kord-vahdilta heti (ensimmäinen paketti VAHTI-YOVALVONTA).

- **20.10.2026:** Vahti ei vastaa 8787-uudelleenkäynnistyksiin eikä lupasääntöihin (VALVOJA.md luku 5, K-9); pushit käyttäjälle 16.44, 17.00, 17.13, 17.31, 18.00, 18.30.

- **20.10.2026:** Käyttäjä 20.10.2026: T-44 vaihtoehto 1 (16.52); "Käynnistä V1 uudelleen" (17.09), toteutus estyi luokittimeen.

- **20.10.2026:** Käyttäjä 20.10.2026 klo 18.35 (scopes macos -istunto c68b88a3, välitti palvelin-0e): kaikki scopes2-istunnot pakataan ja avataan uudelleen Macilla (mac:~/sessions-repo, puhdas klooni) palvelimen muistipulan takia.

- **20.10.2026:** Koordinaattori c1 välitti käyttäjän päätöksen 20.10.2026 (scopes overseerin kautta): ruutuvalvonta ja ruutuvastaukset siirtyvät skoopille scopes vahtimestari. Vahti ei viritä seurantaa uudelleen.

- **20.10.2026:** Käyttäjä (AskUserQuestion 23.2x): vahdin lupareittiin ei muutosta. Sääntöä "kysymykset ja luvat scopes overseerille" ei lisätty VALVOJA.md:hen, koska luokitin esti sen (Instruction Poisoning).

- **20.10.2026:** Käyttäjä (pakkauksen AskUserQuestion): ei seuraavaa pakettia, koska ruutuvalvonta siirtyi vahtimestarille.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Käyttäjän aamupäätökset 20.10. (koordinaattori 851b0343) | V-582: uusi binääri jää; T-44 + H-12 tänään käyttäjän läsnä ollessa; H-17 T-51:n jälkeen; H-7: kaksi ylimääräistä ScopesV2Mac-sääntöä pois macOS-portin jälkeen; ARK-16/H-16 scopes architecturelle | T-49 vihreä 09.15 (0c664ebd). T-52: Automation Mode ilman todennusta voimassa (käyttäjä 15.5x); ajo 7 käyttäjän luvalla käynnissä 16.08 (~2 h, scopes2-shared-143719, punaisella ei uusintaa). T-52 ja T-53 vihreitä (YOLOKI 21.14 ja 21.24). Vahti ei seuraa. T-44 + H-12 odottavat käyttäjää; koordinaattori jatkaa T-44:n porttivuorolla |
| Koordinaattorin rekisterin viittaus `scopes/kordinaattori/VALVOJA.md` (rivi 21) vanhentui siirrossa | V-575 omistajalle | scopes kordinaattori päivittää |
| T-44 (web, 8797) ja V1 :8787 tukossa 20.10. 16.29– | V-613 scopes-skoopille (63effee); web korjaa hyvaksynta.ts:n aikarajat ja odottaa 8787:ää; 8787:n uudelleenkäynnistys vain käyttäjän luvalla **20.10.2026:** T-44 (web): hyväksyntä 6/6, muistiehto punainen: V2-ytimen VmHWM 824 Mt > 512 MiB (444cda5f); ydin: ei vuoto vaan toistuva piikki. | 8787 vastaa → web ajaa hyväksynnän, koordinaattori todentaa tulosteesta → H-12 käyttäjälle |
| scopes2-ajo Macilla 20.10. illalla (koordinaattori jakaa porttivuorot, scopes macos vastaa ruutuihin käyttäjän valtuudella) | T-49 vihreä 20.49 (ajo 4), T-52 vihreä 21.13 (ajo 11), T-53-hyväksyntä vihreä 21.23, T-22 vihreä 21.35, T-51 vihreä 23.15 (ARK-08 kiinni; Mac-rinnakkain avoin, V-628); R-3 käynnissä; V-605 koodina; (V-623 gate.sh Macille 393a688d/b4b3badf/7cbcb930); palvelinpuun synkka (reset + 23 vaihevirheriviä talteen) odottaa käyttäjää (2384e6d2); ruutuvalvonta vahtimestarilla, vahti ei enää seuraa **20.10.2026:** scopes2-ajo Macilla, tilanne 23.21 (koordinaattori c1): T-22 vihreä 21.35; T-51 Mac-rinnakkain vihreä aitalinjauksella 23.15, joten ARK-08 on kiinni; R-3 käynnissä käyttäjän luvalla 23.13; V-605 koodina sharedilla; scopes2-ajo Macilla: ruutuvalvonta ja ruutuvastaukset kuuluvat skoopille scopes vahtimestari (tmux siirto-scopes-vahtimestari-230536), hallinta ja jumit scopes overseerille. Koordinaattorin vahti.sh on pois tarkoituksella, joten KVAHTI-hälytys ei ole vika. | ei vahdin toimia (koordinaattori ja vahtimestari) |

## Viat

| Vika | Tila |
|---|---|
| V-VAHTI-2 (20.10.2026, oma): seuranta.sh seuraa ruutuja, commiteja ja muistia, mutta ei irrallisten (setsid) porttiajojen lokeja; T-52:n 9. ajo päättyi punaisena 18.14, vahti huomasi sen vasta 18.29 sharedin herätessä | korjattu e9ab216f: seuranta.sh raportoi uudet `PORTTI VIHREÄ/PUNAINEN`-rivit lokeista ~/.local/state/scopes2-*-lokit/*.log (koe scratchpadissa: vanha rivi ohitetaan, uusi kerran) |
| V-613 (scopes): 8787 tukossa | avoin (kirjattu 63effee) |
| V-VAHTI-3 (20.10.2026, oma): Macin /pura 19.16 aloitti VAHTI-YOVALVONNAN purkutiedoston "Aloita kysymättä" -ohjeella tarkistamatta `asetus-tila.mjs lue automaattijatko` (false, V-559); ehti sovittaa seuranta.sh:n Macille (bash 3.2, ei /procia; ei committia) ja käynnistää Monitorin | korjattu 20.10. 19.2x: pysähtyi ja kysyi; käyttäjä valitsi "Yövalvonta Macilla", joten tehty työ jäi voimaan; jatkossa automaattijatko tarkistetaan ennen ensimmäistä työtoimea |

## Historia

Historia: `scopes/kordinaattori/vahti/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
