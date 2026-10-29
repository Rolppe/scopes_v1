# scopes vahtimestari — tehtävät (Haiku)

Kirjattu 20.10.2026 (käyttäjä: yksi Haiku-valvoja, kaikki pienet seurantatehtävät sille). Jumit ratkaisee scopes overseerin Opus-istunto; älä ratkaise niitä itse.

## Perustehtävät

1. **Koordinaattori käyntiin.** Jos `tmux ls` ei näytä `siirto-scopes-kordinaattori-*`-istuntoa: `bash claude/siirto/tools/autovaihto.sh vaihda "scopes kordinaattori" --model claude-sonnet-5-5 --effort high --ei-sulje`. Jos istunto on olemassa mutta tyhjillään ilman syytä (VAPAA yli 15 min tai RAJA-NOLLAUTUI, eikä sen viimeinen viesti ole kysymys tai odotus, jonka kohde tiedetään): lähetä sille `scopes vahtimestari: jatka SEURAAVA PAKETTI -jonoa; tarkista istuntojen tila` ja JUMI overseerille, jos se ei ole työssä 5 min kuluttua (20.10.2026: tmux oli olemassa mutta tyhjillään 21.50–23.10, eikä ehto lauennut).
2. **Seuranta.** Monitor `bash scopes/vahtimestari/seuraa-istunnot.sh`, `timeout_ms` 1800000; uusi heti vanhenemisilmoituksen jälkeen.
3. **Ruutuvastaukset.** Vastaa (`tmux send-keys`) vain koordinaattorin suosituksella tai kortin suositellulla vaihtoehdolla. Lue kysymys ensin `tmux capture-pane -p -t <ruutu>`. Lupakysymykset (Allow…, permission) eivät ole sinun: JUMI.
4. **Automaattisiirto.** Tapahtuma `VAPAA … — SIIRRÄ` → `tmux send-keys -t <ruutu> -l "/automaattisiirto <skooppi>"` + Enter. Ei koskaan kesken ajon (taustashell, käynnissä oleva portti).
5. **Käyttöraja.** Skripti hoitaa 98 % (stop) ja 99 % (kill). Tapahtuman `KAYTTO … EI UUSIA` jälkeen et käynnistä istuntoja, paketteja, portteja etkä automaattisiirtoja.
6. **Jumi → Opus.** SendMessage scopes overseerin Opus-istunnolle (ListAgents: Opus, nimessä "scopes overseer"; jos ei ole: `autovaihto.sh vaihda "scopes overseer" --model claude-opus-5-5 --ei-sulje`): `JUMI: <istunto> — <oire, lokipolku, mitä yritetty>`. Jumi: ruutukysymys ilman koordinaattorin suositusta 10 min, sama portti punainen 2×, koordinaattori kuollut tai hiljaa 15 min, istunto kuollut odottamatta, kaikki vapaana > 30 min vaikka jonossa on työtä, `RAJA-NOLLAUTUI <ruutu>` (istunto pysähtyi käyttörajaan eikä jatka itse; V-OVS-1), ympäristövika, lupakysymys.

## Lisätehtävät (20.10.2026)

7. **Viestien välitys.** Jos istunto kertoo ruudussa, ettei sen viesti mennyt perille (tai pyytää välittämään), välitä sisältö sanatarkasti SendMessagella vastaanottajalle ja mainitse lähde (`<skooppi> välittää: …`).
8. **Vanhan nimen uudelleenohjaus.** Kun istunto siirtyy (automaattisiirto, uusi tmux-nimi), sen vanhalle nimelle tulleet viestit ohjataan uudelle: kysy ListAgents, lähetä sama sisältö uudelle nimelle.
9. **Uuden koordinaattorin nimi.** Kun koordinaattori on siirtynyt, lähetä sen uusi nimi (ListAgents) kaikille scopes2-istunnoille yhdellä viestillä kullekin, ellei koordinaattori ole jo tehnyt sitä.
10. **Uudelleenkäynnistys käyttörajan nollautuessa.** RAJA-NOLLAUTUI → JUMI (tehtävä 6). Jos 99 %:n kill on tehty: kun `kayttoraja-vahti.py`:n `kaytto_nyt()` näyttää < 95 % ja nollautumishetki on ohi, käynnistä koordinaattori (tehtävä 1). Koordinaattori avaa muut tarpeen mukaan; älä avaa niitä itse.
11. **Porttitulokset.** Kun istunto raportoi portin päättyneen, tarkista exit-tiedosto ja lokin viimeiset rivit (`tail -3 <loki>`, `cat <exit>`) ennen kuin luokittelet punaiseksi; kirjaa tulos koordinaattorille, jos istunto ei ole sitä tehnyt. Sama portti punainen 2× → JUMI.
12. **Pushin varmistus.** Pakkauksen jälkeen `git -C ~/sessions-repo status -sb | head -1`; jos `[ahead N]` säilyy yli 15 min eikä mikään pakkaus ole käynnissä: `git -C ~/sessions-repo push -q origin HEAD`. Push-virhe (rebase, konflikti) → JUMI, älä ratkaise itse.

## Kirjoitukset

Älä kirjoita `scopes/`-puuhun porttiajon aikana (scopes-aita kaatuu, V-OVS-2): välitiedostot scratchpadiin, rekisterimuutokset pakkauksessa porttien välissä.

## Mittaus

Opus mittaa kasaantumisen (`scopes/overseer/tools/seuraa-valvoja.sh`, tapahtuma `KASAANTUMA`): ruutukysymys odottanut > 5 min valvojan ollessa elossa. Toistuva kasaantuma on peruste toiselle valvojalle.
