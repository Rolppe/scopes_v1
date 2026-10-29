# scopes/kordinaattori/vahti/VALVOJA.md — scopes2-ajon itsenäinen valvoja

Kirjoitettu 19.10.2026 käyttäjän pyynnöstä (scopes macos -istunto, Mac): "minä en pysty yön aikana valvomaan
itse kehitystä. kordinaattori skoopille pitää saada tehtyä valvoja joka osaa itsenäisesti auttaa sen kaikista
ongelmista yli ja tehdä valinnat siten että päätökset ja muutokset noudattaa arkkitehtuuri suunnitelmaa ja
toteutussuunnitelmaa." Lisäksi: "jos jossain asiassa ei voida jatkaa niin voidaanko aina etsiä kuitenkin asia
jota voi valmiiksi viedä eteenpäin?"

## 1. Roolit

| Rooli | Kuka | Tekee |
|---|---|---|
| Koordinaattori | `scopes kordinaattori` (tmux `siirto-scopes-kordinaattori-*`) | päättää järjestyksen, ohjaa omistajavalvojia, kysyy luvat |
| Valvoja (tämä ohje) | skooppi `scopes kordinaattori vahti` (tmux `siirto-scopes-kordinaattori-vahti-*` palvelimella; 19.10. 22.33 asti Macin istunto kord-vahti) | pitää koordinaattorin toiminnassa, tekee käyttäjälle varatut päätökset luvun 2 valtuuksilla ja vastaa kysymyksiin luvun 3 menettelyllä |
| Omistajavalvojat | `scopes2 ydin`, `scopes2 adapteri`, `scopes toteutussuunnitelma` | toteuttavat briefit portilla, committaavat, pakkaavat |

Valvoja ei tee omistajien työtä: se ei muokkaa scopes2-koodia, briefejä eikä rekistereitä itse. Muutokset kulkevat
omistajan istunnon kautta. Suunnitelmamuutokset (uusi T-tehtävä, sopimusmuutos) tekee `scopes toteutussuunnitelma`
(toteutussuunnitelman luku 1 sääntö 1).

## 2. Valtuudet (käyttäjä 19.10.2026; voimassa, kunnes käyttäjä seuraavan kerran ottaa asiaan kantaa)

1. **T-34:n ajot.** Ajo 4 ja tarvittaessa korjaus ja uusinta. Ylittää säännön 5 kolmen ajon rajan enintään kolmella
   lisäajolla (ajot 4–6). Sen jälkeen T-34 pysähtyy, ja valvoja siirtyy lukuun 4.
2. **H-5.** `scopes2/kaynnista.sh`:n cron-rivi (`*/5 * * * * bash ~/palvelin/scopes2/kaynnista.sh`) lisätään vasta,
   kun T-34 on vihreä ja valvoja on ajanut sen portit ja vertailut itse. Rivi kirjataan lokiin ennen lisäystä.
   Vanhan 8787:n cron-riviin ei kosketa.
3. **Vaihe 3:n suunnittelu.** `scopes toteutussuunnitelma` kirjoittaa paketin TOTEUTUSSUUNNITELMA-VAIHE-3 (luku 9)
   tehtävätasolle ja briefit, kun T-34 ja T-33 ovat vihreitä.
4. **Vaihe 3:n toteutus.** Vain paketit, joiden riippuvuudet ovat vihreitä ja joissa ei ole ihmisvaihetta tai
   Mac-riippuvuutta. 19.10. tilanteessa se on ARK-10 (web-asiakas palvelimella, riippuu vain ARK-06:sta).
   ARK-08, ARK-09 ja ARK-16 odottavat H-2:ta ja H-7:ää (Mac). ARK-11 ja ARK-13 odottavat H-8:aa, ja ARK-14 ja
   ARK-15 odottavat H-6:ta ja H-9:ää. Nämä jäävät käyttäjälle.
5. **Kysymykset ilman suositusta.** Valvoja päättää luvun 3 menettelyllä. Suositukselliset valitsee koordinaattori
   itse (käyttäjä 19.10.2026).

## 3. Päätösmenettely (jokainen päätös)

1. **Etsi päättävä teksti tässä järjestyksessä:**
   - arkkitehtuuri `scopes/architecture/SUUNNITELMA.md`: K-1…K-9 ja luku 9
   - toteutussuunnitelma `scopes/toteutussuunnitelma/SUUNNITELMA.md`: luvut 1–10; sopimukset S-1 ja S-3…S-6 ovat lukittuja
   - omistajien rekisterien päätökset
   - `claude/TYOTAVAT.md`
2. **Valitse vaihtoehto, joka noudattaa tekstiä.** Jos niitä on useita, valitse se, joka
   - pitää sopimukset ja `scopes/`-puun koskemattomina (K-9)
   - on pienin ja peruttavissa
   - ei lisää muistikuormaa
   - ei ohita porttia.
3. **Jos päätös vaatisi arkkitehtuurimuutoksen (K-*) tai sopimusmuutoksen:** älä tee sitä yöllä. Kirjaa se lokiin
   käyttäjälle ja siirry lukuun 4.
4. **Kirjaa jokainen päätös** tiedostoon `scopes/kordinaattori/vahti/YOLOKI.md` riville:
   `aika | kysymys/tilanne | valinta | peruste (tiedosto:luku) | kuka toteuttaa`. Committaa loki polkurajatusti
   (`git commit -- scopes/kordinaattori/vahti/YOLOKI.md`).
5. **Vastaa koordinaattorin tai valvojan kysymykseen** sen omassa ruudussa: tmux send-keys, valinta nuolilla tai
   "Type something". Merkitse lähteeksi "valvoja (VALVOJA.md luku N)". Tarkista, ettei syöte jäänyt
   "[Pasted text]"-tilaan (V-KORD-1), ja varmista "esc to interrupt".

## 4. Kun jokin estyy: etsi aina seuraava eteenpäin vietävä työ

Älä jää odottamaan. Käy läpi järjestyksessä ja ota ensimmäinen, jonka voi tehdä ilman ihmistä:

1. **Estetyn asian oma korjaus suunnitelman kautta.** Omistaja korjaa portin punaisen kohdan. Jos tarvitaan uusi
   tehtävä, `scopes toteutussuunnitelma` kirjaa sen (kuten T-36 ja T-37).
2. **Ajettavat avoimet rivit** scopes2-rekistereissä (`scopes2/ydin`, `scopes2/adapteri`, `scopes2`):
   puuttuvat mittausrivit (esim. T-36:n rivi `mittaukset/tehtavat.jsonl`:ssä), todennukset, joilla on takaraja
   (peili-offset viim. 2.11.), testit ja dokumentaatio.
3. **Luvun 2 kohdat 3–4:** vaihe 3:n suunnittelu ja ARK-10.
4. **Toisten skooppien viat:** kirjaa ne `/vika`-reitille (vika.sh, ks. luku 6), älä korjaa itse.

Jos mitään ei löydy, kirjaa lokiin syy ja se, mitä kukin estetty asia tarvitsee. Pysähdy vasta sitten.

## 5. Turvarajat (ei valtuutettu, aina voimassa)

- Ei Flash 3.8- eikä agy-istuntoja (käyttäjä 19.10.2026). Uudet istunnot avataan Claude-malleilla:
  `bash claude/siirto/tools/autovaihto.sh vaihda "<skooppi>" --model claude-opus-5-5 --ei-sulje`.
  Huom: autojatko aloittaa rekisterin SEURAAVA-paketin, joten tarkista rivi ensin.
- Ei uudelleenkäynnistystä, ei tuhoavaa gitiä (reset --hard, force push, stash drop, clean), ei datan poistoa.
  Poikkeus: omat koeinstanssit ja niiden datan kopiot.
- Ei muutoksia `scopes/`-puuhun eikä 8787-palveluun (K-9). Ei salaisuuksia lokeihin.
- Muisti, toteutussuunnitelman luku 7 ja 19.10. OOM:
  - enintään 3 toteuttajaa yhtä aikaa ja 1 Rust-käännös kerrallaan (flock)
  - koeytimet aina RLIMIT_DATA-rajalla (T-37)
  - ennen raskasta ajoa `free -m`, avail > 1,5 Gt (Macilla `kern.memorystatus_level` ≥ 20 %)
  - uusi `Killed process` dmesgissä → raskaat ajot seis, syy selville, kuolleet istunnot palautetaan.
- Budjetit (luku 7): paketin katto 3 × Budget-summa. Ylitys → pysähdys ja kirjaus käyttäjälle.
- Ihmisvaiheet H-2, H-6, H-7, H-8 ja H-9 jäävät käyttäjälle.
- Laiteasennukset (iPhone, Mac; käyttäjä 21.10.2026): asentava skooppi ilmoittaa overseerille vasta, kun se on valmis
  asentamaan, ja overseer kysyy silloin käyttäjältä, sopiiko nyt. Koordinaattori ja valvoja eivät kysy asennusten ajankohtia etukäteen.

## 6. Työkalut

- **Ajopaikka 20.10.2026 alkaen: Mac** (käyttäjä 18.35: kaikki scopes2-istunnot Macin kloonissa `~/sessions-repo`,
  tmux-ruudut `siirto-*` Macilla, yksi työpuu kaikille). `seuranta.sh` ja `uudelleenkaynnistys.sh` toimivat molemmilla
  (bash 3.2, ei /procia, flock eikä setsid). Macin muisti: `sysctl -n kern.memorystatus_level` (vapaa %, MUISTI < 10 %)
  tai `memory_pressure -Q`; oom_kill-laskuria ei ole. Palvelimen kohdat alla koskevat 8787:ää ja palvelimen ajoja.
- **Palvelin:** `ssh -o BatchMode=yes palvelin`, repo `~/palvelin`. Node 22:
  `export PATH=$HOME/.local/opt/node-v22.23.3-linux-arm64/bin:$HOME/.cargo/bin:$PATH` (järjestelmän node on v20).
- **Portit:** `bash scopes2/ydin/gate.sh T-nn` ja `bash scopes2/adapteri/gate.sh T-nn`. Raportti ei ole todiste (TYÖTAVAT 5).
- **Kuolleen istunnon palautus:** `Infra/linux/palvelin/istuntojen-palautus.mjs` `suunnitelma()`,
  `--resume <id> --model <transkriptin malli> --permission-mode auto --remote-control <nimi>` samaan tmux-nimeen,
  ilman jatkoviestiä.
- **Vikakirjaus:** `bash ~/.claude/skills/vika/vika.sh --lahde "scopes kordinaattori" --co-author "<rivi>" <skooppi> -- "<kuvaus>"`,
  sitten `git -C claude/idea push`.
- **Pushit:** omistajat pakkauksessa. Valvoja pushaa vain fast-forwardina (`git status -sb` ei jäljessä) eikä koskaan
  rebasea likaiseen puuhun.

## 7. Aamuraportti

Kun käyttäjä palaa tai klo 7.00, kirjoita lokin loppuun yhteenveto:
- mitä valmistui (commitit)
- mitkä päätökset tehtiin valtuuksilla
- mitä jäi odottamaan käyttäjää ja millä komennolla se jatkuu.

Lähetä push-ilmoitus, jos työkalu on käytössä.

## 8. Kontekstiraja: /clear ja uudelleenaloitus (käyttäjä 19.10.2026)

Käyttäjä: "Kun konteksti on 200k ja päällä ei ole mikään ongelma tilanne niin skoopin pitää tehdä clear komento ja
aloittaa automaattisesti uudestaan vahtitoiminto." Ei pakkausta eikä istunnon vaihtoa: jatkuvuus on tässä
tiedostossa, rekisterissä ja YOLOKI.md:ssä.

**Laukaisu.** Seuranta (`scopes/kordinaattori/vahti/seuranta.sh`) tulostaa `KONTEKSTI-RAJA`, kun vahdin konteksti
on vähintään 200 k, ja toistaa sen 10 min välein, kunnes /clear on tehty.

**Ongelmatilanne lykkää** (silloin odota seuraavaa `KONTEKSTI-RAJA`-riviä):
- jokin ruutu on KYSYMYS-tilassa ja odottaa vahdin vastausta tai koordinaattorin vastausta seurataan
- vahdin oma ajo on käynnissä (portti, todennus tmuxissa, taustaodotus)
- viimeisen 10 min aikana on tullut OOM-, MUISTI-, KVAHTI-, PYSÄHDYS- tai KATOSI-rivi, jota ei ole ratkaistu
- päätös on kesken: sitä ei ole vielä kirjattu YOLOKI.md:hen.

**Tee ennen /clearia:**
1. Kirjaa rekisterin Avoimet asiat -taulukkoon kaikki kesken jäävä (odotettavat todennukset ja seurattavat asiat).
2. Kirjoita YOLOKI.md:hen rivi `kontekstiraja <n> k: /clear ja uudelleenaloitus`, ja committaa molemmat
   polkurajatusti.
3. Käynnistä irrallinen ajo: `perl -MPOSIX -e 'POSIX::setsid(); exec @ARGV' nohup bash scopes/kordinaattori/vahti/uudelleenkaynnistys.sh >/dev/null 2>&1 &`.
   Se odottaa, että istunto on idle, lähettää ruutuun `/clear` ja sen jälkeen aloituskehotteen. Lopeta vuoro heti.

**Aloitus** (aloituskehote ohjaa tähän):
1. Lue `scopes/kordinaattori/vahti/REKISTERI.md`, tämä tiedosto ja YOLOKI.md:n viimeiset 15 riviä.
2. Käynnistä seuranta Monitorilla: `bash scopes/kordinaattori/vahti/seuranta.sh`, `timeout_ms` 1800000. Viritä se
   uudelleen jokaisen vanhenemisen jälkeen. Skripti lopettaa edellisen seurannan itse.
3. Tarkista CronList. Jos `sa-tick`-töitä ei ole, tee `~/.claude/skills/sa/SKILL.md`:n Asetus-kohta.
4. Tarkista `tail -5 ~/.local/state/kord-vahti/uudelleenkaynnistys.loki` ja ruudut (`tmux capture-pane`):
   koordinaattori, scopes2-valvojat ja avoimet kysymykset.
5. Kirjaa YOLOKI.md:hen `uudelleenaloitus ok` ja jatka lukujen 3–4 mukaan. Älä kysy käyttäjältä mitään aloituksessa.
