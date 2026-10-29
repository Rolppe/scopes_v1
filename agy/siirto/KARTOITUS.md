# AGY-integraatio Scopes-äppiin: Purku, pakkaus ja automaattisiirto — Kartoitus

Päiväys: 16.10.2026  
Skooppi: `scopes agy siirto`  
Paketti: `AGY-SIIRTO-KARTOITUS`  
Kohde: Scopes iOS -äppi, taustapalvelu (`scopes/palvelu`), orkestrointityökalut (`claude/siirto/tools/`) ja Antigravity CLI (`agy`)

---

## 1. Johdanto ja tavoite

Skoopin `scopes agy siirto` tarkoitus on keskittyä Antigravity CLI (AGY / Gemini) -integraatioon Scopes-äpissä ja sen taustapalveluissa erityisesti seuraavien kolmen ydintoiminnon osalta:
1. **Purku** (skoopin avaaminen, purkutiedoston muodostus ja istunnon käynnistys)
2. **Pakkaus** (keskustelun yhteenveto muistioon, rekisterien päivitys, git add/commit/push ja tilan merkintä)
3. **Automaattisiirto** (istunnon hallittu sulkeminen, pakkaus ja siirtyminen uuteen istuntoon ilman kontekstin katkeamista)

### Päätavoite ja rajoitteet
- **Täysi toiminnallinen pariteetti:** Käyttäjän ja Scopes-äpin näkökulmasta purku, pakkaus ja automaattisiirto toimivat AGY-istunnoissa yhtä suoraviivaisesti ja luotettavasti kuin Claude Code -istunnoissa.
- **Rikkomattomuus (Zero Regression):** Muutokset eivät saa rikkoa Scopes iOS -äppiä eikä olemassa olevaa Claude Code -toiminnallisuutta tai sen testejä.
- **Säännön 15 noudattaminen:** Skooppi vastaa omista tiedostoistaan polussa `scopes/agy/siirto/**` sekä siirtotyökalujen ja palvelurajapintojen AGY-laajennuksista koordinoidusti omistajien kanssa.

---

## 2. Nykytilan kartoitus: Purku (Unpacking)

### 2.1 Toimintamekanismi nykytilassa
1. **Mallivalinta (`scopes/palvelu/purkajat.mjs`):**
   - Taustapalvelu hakee saatavilla olevat AGY-mallit komennolla `agy models` (`luoPurkajat`) ja tarjoaa ne äpille tunnuksilla `agy:<id>` (purkaja) ja `agy/<id>` (istunnon malli).
   - Purkaja (`ajaja`) määrittää, mikä moottori suorittaa purkuvaiheen.
   - Istunnon malli (`malli`) määrittää, millä mallilla uusi tmux-istunto avataan (`autovaihto.sh --model`).
2. **Purkutoiminto taustapalvelussa (`scopes/palvelu/toiminnot.mjs:pura`):**
   - Jos skooppi kuuluu scopes-perheeseen (`pura-malliton.mjs --perhe` palauttaa 0):
     * Kutsutaan `puraMallitta(nimi, suljettavat, malli)`.
     * Skripti ajaa `node pura-malliton.mjs <nimi> --kohde <neutraali|claude>`.
     * Jos `malli` alkaa `agy/`, kohteeksi valitaan automaattisesti `neutraali`.
     * Skripti luo tiedoston `~/.local/state/pura/<slug>.md`.
     * Istunto avataan viestillä: `"Malliton purku: lue ~/.local/state/pura/<slug>.md ja noudata sitä."`
   - Jos skooppi **ei** kuulu scopes-perheeseen:
     * Jos `malli` alkaa `agy/`, palvelu palauttaa virheen `400: agy-istunto kuuluu vain scopes-perheen skoopeille`.
     * Claude-mallilla purku etenee vanhaan tapaan `/pura <skooppi>` -komennolla.
3. **Deterministinen malliton purku (`claude/siirto/tools/pura-malliton.mjs`):**
   - Tukee jo kohteita `claude` ja `neutraali`.
   - Kohteessa `neutraali` (AGY / paikalliset mallit):
     * Claude-työkalujen nimet (`AskUserQuestion`, `CronCreate`, `Skill`, `/sa`, jne.) suodatetaan pois (`CLAUDE_TYOKALUT`).
     * `konteksti-nyt.mjs` -ajo suodatetaan pois, koska AGY ei kirjoita Claude-muotoista transkriptia.
     * Raportti esitetään koodilohkossa ja päätösvaihtoehdot selkeänä numeroituna tekstinä.

### 2.2 Havaitut puutteet ja ongelmat purussa
1. **Rajaus vain scopes-perheeseen:**
   - AGY-purku on estetty muille kuin `scopes`-repositorion alaskoopeille. Muut projektit eivät voi käyttää AGY:tä purussa, vaikka AGY:llä olisi täydet luku- ja ajotyökalut.
2. **Virheviestien työkalurajat (`autovaihto.sh`):**
   - Jos malliton purku epäonnistuu, `autovaihto.sh:malliton_virhe` muodostaa virheviestin:
     `"Malliton purku epäonnistui (...): ... — kysy käyttäjältä AskUserQuestionilla, miten jatketaan; älä pura mallilla."`
   - AGY ei tunne `AskUserQuestionia` (AGY:n työkalu on `ask_question`). Jos virheviesti päätyy AGY:lle, se hämmentää mallia.
3. **Purkajan valinnan (`ajaja`) ohitus:**
   - Scopes-perheen skoopeille malliton purku ohittaa käyttäjän valitseman purkajan kokonaan, koska skripti tekee työn deterministisesti ilman kielimallia. Tämä on suunniteltu ominaisuus, mutta se on syytä dokumentoida selkeästi.

---

## 3. Nykytilan kartoitus: Pakkaus (Packaging)

### 3.1 Toimintamekanismi nykytilassa
1. **Clauden pakkausputki:**
   - Claudessa pakkaus käynnistyy komennolla `/pakkaa [skooppi]`, joka aktivoi taidon `~/.claude/skills/pakkaa/SKILL.md`.
   - **Vaihe 0–1:** `node claude/siirto/tools/pakkaa-alku.mjs "<skooppi>"`
     * Tarkistaa synkan, skoopin tilan, luo muistiopohjan `~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio.md`.
   - **Muistion täyttö:** Pääistunto täyttää muistion luvut (Mitä tehtiin, Päätökset, Avoimet asiat, Viat, Hukka, Kesken, Seuraava paketti).
   - **Tarkistusportti:** `node claude/siirto/tools/pakkaa-alku.mjs --tarkista "<skooppi>" "<muistio>"` (varmistaa tavukaton, portit ja pakolliset luvut).
   - **Vaihe 2 (Rekisterit):** `bash claude/siirto/tools/aja-siirtaja.sh paketoi "<skooppi>"`
     * Päivittää `REKISTERI.md`:n, `HISTORIA.md`:n ja hukkalokit. Tukee moottorina jo `agy`:tä (`pakkaa-vaiheet.mjs --moottori agy`).
   - **Vaihe 3 (Git & Päätös):** `node claude/siirto/tools/pakkaa-loppu.mjs "<skooppi>" -m "<viesti>" <polut...>`
     * Suorittaa git add, commit, push, ja tulostaa `LOPPUVIESTI:`-lohkon, jonka avainrivi on `PAKKAUS: vahvistettu`.
2. **Taustapalvelun tuki (`toiminnot.mjs` & `agy-istunto.mjs`):**
   - Äpin "Pakkaa istunto" -painike kutsuu `POST /api/skoopit/:nimi/toiminnot` toiminnolla `pakkaa`.
   - Jos skoopilla on AGY-istunto, `toiminnot.mjs:istuntoon` lähettää `tmux send-keys` -komennolla `/pakkaa Enter` AGY:n ruutuun.
   - `agy-istunto.mjs` sisältää funktion `agyPakattu(viestit)`, joka tunnistaa pakatun istunnon säännöllisellä lausekkeella:
     `PAKKAUSRIVI = /^[\s*`>]*(PAKKAUS:[*`\s]*vahvistettu|PAKATTU:|PAKKAUS:[*`\s]*epäselvä.*\bcommit(it)?[\s`]+[0-9a-f]{7,})/m`

### 3.2 KRIITTINEN PUUTE: AGY ei tunne `/pakkaa`-komentoa
- Kun äppi tai käyttäjä lähettää `/pakkaa` AGY:n tmux-ruutuun:
  * AGY CLI vastaanottaa tekstin `/pakkaa`.
  * Koska AGY:lle ei ole määritelty `pakkaa`-taitoa eikä vastaavaa slash-komentoa, AGY ei tiedä mitä tehdä.
  * AGY vastaa tavallisena keskusteluviestinä (esim. ihmettelee komentoa tai yrittää arvailla).
  * Pakkausputkea (`pakkaa-alku.mjs` -> muistio -> `pakkaa-vaiheet.mjs` -> `pakkaa-loppu.mjs`) **ei suoriteta**.
  * `PAKKAUS: vahvistettu` -riviä ei tulosteta, jolloin istunto ei koskaan muutu tilaan `pakattu`.
- **Yhteensopivuus pakkausskripteissä:**
  * Testasimme `node claude/siirto/tools/pakkaa-alku.mjs "scopes agy siirto"` AGY-ympäristössä: se toimi onnistuneesti (exit 0) ja loi muistiopohjan.
  * `pakkaa-loppu.mjs` ohittaa transkriptiarkistoinnin siististi, kun `CLAUDE_CODE_SESSION_ID` puuttuu.
  * Itse taustamekaniikka ja skriptit ovat valmiina toimimaan AGY:n kanssa, mutta **ohjaava taito (Skill) puuttuu kokonaan**.

---

## 4. Nykytilan kartoitus: Automaattisiirto (Autovaihto)

### 4.1 Toimintamekanismi nykytilassa
1. **`autovaihto.sh`:**
   - Tunnistaa AGY-mallin etuliitteestä `agy/` (`AGY_ID="${MALLI#agy/}"`).
   - Avaa uuden istunnon tmuxiin:
     `tmux new-session -d -s "$NIMI" -c "$JUURI" "$AGY_BIN" --dangerously-skip-permissions --model "$AGY_ID" --add-dir "$HOME/.claude" --add-dir "$HOME/.local/state/pura" -i "$VIESTI"`
   - Tarkistaa käynnistymisen ruutukaappauksesta (`gemini|flash|antigravity`) ja tulostaa `OK: agy tmux $NIMI`.
   - Osaa periä AGY-mallin automaattisesti jatkoistunnolle (`MALLI_LAHDE="kutsuva sessio (agy)"`).
2. **Taustapalvelun tuki (`toiminnot.mjs`):**
   - Äpin "Automaattisiirto"-toiminto kutsuu `POST /api/skoopit/:nimi/toiminnot` toiminnolla `automaattisiirto`.
   - Lähettää komennon `/automaattisiirto Enter` ruutuun ja jonottaa sen tarvittaessa (`JONO_RYHMA['/automaattisiirto'] = 'siirto'`).
3. **Vanhan istunnon sulkeminen (`sulje-ikkuna.sh`):**
   - Autovaihto käynnistää taustalle `sulje-ikkuna.sh "$VANHA" --viive "$VIIVE"`.
   - Skripti odottaa vuoron loppumista, lähettää `Escape`, odottaa, ja lähettää `/exit Enter`.
   - Todentaa ruudun sulkeutumisen `tmux display-message` -kutsulla.

### 4.2 Havaitut puutteet ja ongelmat automaattisiirrossa
1. **Komento `/automaattisiirto` ei toimi AGY:ssä:**
   - Kuten `/pakkaa`, AGY ei tunne komentoa `/automaattisiirto`.
   - Automaattisiirto vaatii saman pakkausputken kuin `/pakkaa`, mutta `pakkaa-loppu.mjs`:lle on annettava lippu `--vaihda`.
2. **Vuoron päättymisen tunnistus (`sulje-ikkuna.sh`):**
   - `sulje-ikkuna.sh` tarkistaa ruudulta `esc to interrupt` tietääkseen, onko vuoro käynnissä.
   - AGY CLI ei käytä tätä merkkijonoa; AGY:n vapaan tilan indikaattori alarivillä on `? for shortcuts`.
   - Jos ruudun tilaa ei tunnisteta oikein, `/exit` saatetaan lähettää kesken AGY:n työkalukutsun tai ajattelun.
3. **Jonotetut komennot (`/sa` ja `/sa pois`):**
   - Äpin "Muisti hereillä" -kytkin lähettää `/sa` tai `/sa pois`. Nämä ovat Claude-spesifisiä herätysajastuksia. AGY-istunnolle ne ovat tarpeettomia ja aiheuttavat vain virheilmoituksia ruudulle.

---

## 5. Ratkaisuarkkitehtuuri ja toteutussuunnitelma

Kartoituksen perusteella toteutetaan seuraavat toimenpiteet vaiheittain:

```mermaid
flowchart TD
    App["Scopes iOS -äppi tai CLI"] -->|"/pakkaa" tai "/automaattisiirto"| Tmux["AGY Tmux -istunto"]
    Tmux --> Skill["AGY pakkaa-skill (.agents/skills/pakkaa/SKILL.md)"]
    Skill --> V0["1. pakkaa-alku.mjs"]
    V0 --> Memo["2. Muistion täyttö (LLM-harkinta)"]
    Memo --> V1["3. pakkaa-alku.mjs --tarkista"]
    V1 --> V2["4. aja-siirtaja.sh paketoi (rekisterit)"]
    V2 --> V3["5. pakkaa-loppu.mjs [--vaihda] (git commit + push)"]
    V3 --> Output["6. Tuloste: PAKKAUS: vahvistettu"]
    Output --> Detect["agy-istunto.mjs tunnistaa: agyPakattu = true"]
    Detect --> Done["Scopes-äppi päivittää: tila = pakattu"]
```

### Vaihe 1: AGY:n `pakkaa`-taidon toteutus
- **Sijainti:** Luodaan `.agents/skills/pakkaa/SKILL.md` (ja globaalina linkkinä `~/.gemini/config/skills/pakkaa/SKILL.md`).
- **Kuvaus ja aktivointi:**
  - Aktivoituu, kun käyttäjä tai äppi lähettää `/pakkaa`, `/paketoi` tai `/automaattisiirto`.
- **Ohjeet agentille:**
  1. Aja `node claude/siirto/tools/pakkaa-alku.mjs "<skooppi>"`.
  2. Lue luotu muistiopohja ja täytä sen luvut (`Mitä tehtiin`, `Päätökset`, `Avoimet asiat`, `Viat`, `Hukka`, `Kesken`, `Seuraava paketti`) keskusteluhistorian perusteella.
  3. Aja `node claude/siirto/tools/pakkaa-alku.mjs --tarkista "<skooppi>" "<muistion_polku>"`.
  4. Aja `bash claude/siirto/tools/aja-siirtaja.sh paketoi "<skooppi>"`.
  5. Aja `node claude/siirto/tools/pakkaa-loppu.mjs "<skooppi>" -m "<commit-viesti>" <polut...> [--vahvistettu] [--vaihda]`.
     *(Jos kyseessä oli `/automaattisiirto`, lisätään aina `--vaihda`)*.
  6. Esitä skriptin tulostamat `LOPPUVIESTI:`-rivit sellaisinaan vastauksessa.

### Vaihe 2: `sulje-ikkuna.sh` AGY-yhteensopivuus
- Päivitetään `sulje-ikkuna.sh` tunnistamaan myös AGY:n ruuduntila:
  * Ruutu katsotaan varatuksi, jos alariviltä puuttuu `? for shortcuts` ja ruudulla ei ole kyselyä.
  * Tämä estää `/exit`-komennon ennenaikaisen lähetyksen.

### Vaihe 3: `pura-malliton.mjs` ja `autovaihto.sh` virheilmoitusten siistiminen
- Varmistetaan, että neutraalissa tilassa virheilmoitukset eivät ohjeista käyttämään Clauden `AskUserQuestion`-työkalua.

### Vaihe 4: Testaus ja todennus
- Ajetaan kaikki regressiotestit:
  * `scopes/palvelu/toiminnot.test.mjs`
  * `claude/siirto/tools/autovaihto.test.mjs`
  * `claude/siirto/tools/pura-malliton.test.mjs`
  * `claude/siirto/tools/pakkaa-*.test.mjs`
- Lisätään uudet testit AGY:n pakkaus- ja siirtotyönkululle.
- Varmistetaan todennetusti, että Claude Code -istunnot ja iOS-äppi jatkavat toimintaansa täysin ennallaan.

---

## 6. Yhteenveto

Kartoitus osoittaa, että taustapalveluiden ja siirtotyökalujen matalan tason mekaniikka (`pakkaa-alku.mjs`, `pakkaa-vaiheet.mjs`, `pakkaa-loppu.mjs`, `autovaihto.sh`) tukee jo lähes suoraan AGY:tä. Suurin puuttuva lenkki on **AGY-istunnon oma pakkaustaito (`pakkaa/SKILL.md`)**, jotta AGY osaa orkestroida nämä skriptit vastaanottaessaan `/pakkaa`- tai `/automaattisiirto`-komennon.
