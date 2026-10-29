# Scopes Economy — Arkkitehtuuri ja Rajapinnat

Päiväys: 27.10.2026  
Skooppi: `scopes siirto economy`  
Tila: Hyväksytty toteutussuunnitelma

---

## 1. Johdanto ja tavoite

Antigravity (AGY) -työskentelyssä vuorokautinen kutsumaksimi on **1 500 mallikutsua** (`PLANNER_RESPONSE`).
Mittaukset (27.10.2026, 4 000 mallikutsua OnePlus + Mac) osoittivat, että:
- **71,7 % kutsuista (2 866 kpl)** kuluu passiiviseen tiedonhakuun (tiedostojen etsintä 1 011 kpl, tiedostojen luku 972 kpl, git-tilan tarkkailu 498 kpl) sekä taustatehtävien odotteluun ja statuksen kyttäämiseen (385 kpl).
- **Vain 6,4 % kutsuista (257 kpl)** kohdistuu varsinaiseen koodin muokkaukseen (`edit_file`, `write_file`).

Siirtotalouden arkkitehtuurin tavoitteena on eliminoida tämä hukkakapasiteetti tarjoamalla Scopes-äpille ja malleille deterministiset tiedot suoraan taustapalvelusta (`scopes/palvelu/economy.mjs`) ilman, että mallin tarvitsee tehdä erillisiä työkalu- ja päättelykierroksia.

---

## 2. Neljä säästökohdetta ja niiden arkkitehtuuri

### Kohde A: Git-tilan ja muutoslistan esisyöttö (Säästöpotentiaali: ~500 kutsua / vrk)
* **Ongelma:** Jokaisessa istunnossa ja purussa malli ajaa 5–15 kertaa `git status`, `git log -3` ja `git diff`, jotta se tietää haaran tilan ja omat/vieraat muutokset.
* **Arkkitehtuuri:**
  1. Taustapalvelu tarjoaa deterministisen rajapinnan `GET /api/economy/git-tila?skooppi=<skooppi>`.
  2. Palvelu lukee ja välimuistittaa git-tilan (branch, HEAD-commit, muuttuneet tiedostot jaoteltuna skoopin omiin ja vieraisiin).
  3. Purkutiedostoihin (`pura-malliton.mjs`) ja istunnon avaukseen (`autovaihto.sh`) injektoidaan valmis git-tilalohko.
  4. Säännöt ja kehotteet kieltävät mallia ajamasta git-lukukomentoja uudelleen, kun tilatieto on annettu kehotteessa.

### Kohde B: Tiedostokartta ja symboli-indeksi (Säästöpotentiaali: ~1 000 kutsua / vrk)
* **Ongelma:** Mallit tekevät toistuvia sokkohakuja komentorivillä (`find .`, `grep -rn`) etsiessään toteutustiedostoja, mikä vie useita vuoroja ja satoja kutsuja per istunto.
* **Arkkitehtuuri:**
  1. Taustapalvelu tarjoaa rajapinnan `GET /api/economy/tiedostokartta?skooppi=<skooppi>`.
  2. Palauttaa skoopin olennaiset lähdetiedostot, tiedostokoot ja muokkausajat.
  3. Scopes-äppi ja purkukehote tarjoavat suorat `file://`-linkit olennaisiin tiedostoihin, jolloin malli voi lukea kohdetiedoston suoraan tai hypätä suoraan muokkaukseen ilman etsintävaihetta.

### Kohde C: Tehtäväodotuksen determinismi ja status-pollauksen esto (Säästöpotentiaali: ~350–385 kutsua / vrk)
* **Ongelma:** `manage_task status` ja toistuvat tarkistuskutsut syntyvät siitä, että komennot ajetaan liian pienellä `WaitMsBeforeAsync`-arvolla ja malli jää pollaamaan taustatehtävää silmukassa.
* **Arkkitehtuuri:**
  1. `run_command` kutsutaan aina riittävällä aikarajalla (`WaitMsBeforeAsync: 10000`), jolloin yksikkötestit ja suurin osa skripteistä valmistuvat yhdellä synkronisella kierroksella.
  2. Säännöissä eksplisiittinen kielto taustatehtävien manuaaliselle pollaamiselle: järjestelmän automaattinen reaktiivinen herätys (`reactive wakeup`) hoitaa herätyksen kun taustatehtävä valmistuu.

### Kohde D: Deterministinen hybridipakkaus (Säästöpotentiaali: ~60–105 kutsua / vrk)
* **Ongelma:** Vanha `pakkaa-vaiheet.mjs` kutsui mallia erikseen rekisterikirjurina vaiheille A, B, C ja K, mikä loi kymmeniä minikeskusteluja päivässä.
* **Arkkitehtuuri:**
  1. Siirtyminen uuteen `scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs` -skriptiin kaikissa istunnoissa.
  2. Rekisterin ja historian siirrot tehdään deterministisellä koodilla ja mallia käytetään vain laadulliseen tiivistykseen silloin kun se on välttämätöntä.

### Kohde E: Suurimpien kuluttajien karsinta (`siirto-git`, `infra expresso`) (Säästöpotentiaali: ~1 007 kutsua / vrk)
* **Ongelma:** Kaksi skooppia vei yli 1 180 kutsua vuorokaudessa toistuvien git/ssh-kyselyiden ja hajautettujen testisyklien vuoksi.
* **Arkkitehtuuri:**
  1. Moduuli `scopes/siirto/economy/kuluttajat.mjs` ja rajapinta `GET /api/economy/kuluttajat`.
  2. `scopes siirto git`: Deterministinen paikallis- ja etätilan koontitarkastus (`tarkistaMolemmatGitTilat`) ja toistuvien git-kyselyiden esto.
  3. `infra expresso`: Tiedostokartan käyttö ja smoke-testien koontiajo (`muodostaExpressoTestiAjoKomento`, `WaitMsBeforeAsync: 10000`).

### Kohde F: 1500 kutsun vuorokausibudjetointi ja siirtojen säästöstrategiat (`ECONOMY-BUDJETTI`)
* **Ongelma:** Ilman eksplisiittistä budjetointia ja kulutusnopeuden (burn rate) seurantaa 1 500 vuorokausikutsua kuluu satunnaisesti loppuun kesken päivän.
* **Arkkitehtuuri:**
  1. Moduuli `scopes/siirto/economy/budjetti.mjs` ja yksikkötestit `budjetti.test.mjs`.
  2. Kiintiön, kulutustahdin (`kutsutPerTunti`, `sallittuKutsutPerTunti`) ja ennusteen reaaliaikainen laskenta suhteessa Tyynenmeren aikaan (reset klo 10:00 Suomen aikaa).
  3. Istuntokohtainen tavoitekatto: **~25–30 kutsua / paketti** (maksimi 60 kutsua), mikä mahdollistaa jopa **50 kehityspakettia / vrk**.
  4. Säästötilojen eskalointi (`NORMAALI` → `SAASTOTILA` @ 70% → `KRIITTINEN_SAASTO` @ 90%).
  5. Taustapalvelun rajapinta `GET /api/economy/budjetti` (`scopes/palvelu/economy.mjs` ja `palvelin.mjs`).

---

## 3. Palvelurajapinnat (`scopes/palvelu/economy.mjs`)

Taustapalvelu toteuttaa seuraavat HTTP-päätepisteet:

### `GET /api/economy/git-tila`
* **Parametrit:** `skooppi` (valinnainen)
* **Vastaus (JSON):**
  ```json
  {
    "branch": "claude/charming-brahmagupta-p9hmm7",
    "headSha": "161d58f2...",
    "headViesti": "feat(scopes siirto economy): kartoita 1500 kutsun kulutus ja suunnitelma",
    "puu": "puhdas",
    "muuttuneetYhteensa": 0,
    "skoopinMuutokset": [],
    "muutMuutokset": [],
    "aikaleima": 1729987200000
  }
  ```

### `GET /api/economy/tiedostokartta`
* **Parametrit:** `skooppi` (pakollinen)
* **Vastaus (JSON):**
  ```json
  {
    "skooppi": "scopes siirto economy",
    "tiedostot": [
      {
        "polku": "scopes/siirto/economy/REKISTERI.md",
        "koko": 3510,
        "mtime": 1729987200000
      },
      {
        "polku": "scopes/siirto/economy/SUUNNITELMA.md",
        "koko": 4370,
        "mtime": 1729987200000
      }
    ],
    "yhteensaKoko": 7880,
    "maara": 2
  }
  ```

### `GET /api/economy/tilasto`
* **Parametrit:** `valiMs` (valinnainen välimuistin ohitus)
* **Vastaus (JSON):**
  ```json
  {
    "userInputs": 92,
    "plannerResponses": 1393,
    "kutsut": {
      "tiedonhaku": { "maara": 1011, "osuus": 25.3 },
      "tiedostoluku": { "maara": 972, "osuus": 24.3 },
      "git": { "maara": 498, "osuus": 12.5 },
      "odotus": { "maara": 385, "osuus": 9.6 },
      "koodimuokkaus": { "maara": 257, "osuus": 6.4 }
    },
    "nollautuu": "2026-10-28T07:00:00.000Z"
  }
  ```

### `GET /api/economy/budjetti`
* **Parametrit:** `skooppi` (valinnainen), `muoto` (valinnainen `teksti`), `lyhyt` (valinnainen `1`), `kiintio` (valinnainen)
* **Vastaus (JSON):**
  ```json
  {
    "kiintio": 1500,
    "kaytettyKutsuja": 450,
    "jaljellaKutsuja": 1050,
    "kayttoProsentti": 30.0,
    "taso": "NORMAALI",
    "saastotila": "NORMAALI",
    "pakettejaJaljella": 35,
    "kutsutPerTunti": 45.0,
    "sallittuKutsutPerTunti": 75.0,
    "ennusteLopputulos": 990,
    "riittaakoBudjetti": true,
    "seuraavaReset": "2026-10-28T07:00:00.000Z"
  }
  ```

---

## 4. Tiekartta ja toteutusvaiheet

1. **Paketti 1 (SIIRTO-ECONOMY-SUUNNITELMA) [VALMIS]:**
   - Arkkitehtuuri- ja rajapintaspesifikaatio (`ARKKITEHTUURI.md`).
   - Taustapalvelun ydinmoduuli `scopes/palvelu/economy.mjs` ja testit `scopes/palvelu/economy.test.mjs`.
   - Palvelimen reititys `palvelin.mjs`:ään.
2. **Paketti 2 (ECONOMY-GIT-ESITIEDOT) [VALMIS]:**
   - Deterministinen git-esitietojen hakija ja muotoilija `scopes/siirto/economy/git-esitiedot.mjs` ja testit `git-esitiedot.test.mjs`.
   - `git-tila` -tiedon injektointi suoraan purkutiedostoihin (`pura-malliton.mjs`).
   - Sääntöpäivitys ja pysyvä ohje git-lukukomentojen toiston kieltämiseksi.
   - Verifiointigate `gate.sh`.
3. **Paketti 3 (ECONOMY-TASK-ODOTUS) [VALMIS]:**
   - Deterministinen komentoviiveiden optimointi ja manage_task-pollauksen esto (`task-odotus.mjs` ja `task-odotus.test.mjs`).
   - Agy-ajurin säännöt päivitetty (`AGENTS.md`) vaatimaan `WaitMsBeforeAsync: 10000` ja kieltämään `manage_task status`/`list`-pollaus (reaktiivinen herätys).
   - Injektointi purkutiedostoihin (`pura-malliton.mjs`).
   - Taustapalvelun rajapinta `GET /api/economy/task-odotus` ja kulutustilaston status-polling-seuranta.
4. **Paketti 4 (ECONOMY-TIEDOSTOKARTTA) [VALMIS]:**
   - Deterministinen tiedostokartan ja koodi-indeksin hakija, symbolipoiminta ja haku (`tiedostokartta.mjs` ja `tiedostokartta.test.mjs`).
   - Taustapalvelu `scopes/palvelu/economy.mjs` ja palvelimen reititys `palvelin.mjs` (`GET /api/economy/tiedostokartta` parametri- ja tekstimuotoiluineen).
   - Clickable `file://`-linkit ja symbolitiedot ilman LLM:n sokkohakuja (`find`, `grep -rn`, `ls`).
   - Verifiointigate `gate.sh` päivitetty.
5. **Paketti 5 (ECONOMY-HYBRIDI) [VALMIS]:**
   - Deterministisen hybridipakkauksen hallinta `scopes/siirto/economy/hybridi-pakkaus.mjs` ja testit `hybridi-pakkaus.test.mjs`.
   - Kanoninen skooppien hakemisto- ja rekisteriratkaisu `scopes/agy/siirto/pakkausscripti/skooppipolku.mjs` kaikille skoopeille (`scopes`, `scopes2`, `claude`, `infra`, `plugin`).
   - `pakkaa-hybridi.mjs` ja `louhija.mjs` päivitetty käyttämään suoraa rekisteripolkua (myös `paarekisteri.md`).
   - Agy-pakkaustaidot `.agents/skills/pakkaa/SKILL.md` ja `.agents/skills/automaattisiirto/SKILL.md` päivitetty asettamaan hybridipakkaus universaaliksi oletukseksi kaikille skoopeille.
   - Taustapalvelun rajapinta `GET /api/economy/hybridi-pakkaus` (`scopes/palvelu/economy.mjs` ja `palvelin.mjs`).
   - Verifiointigate `gate.sh` päivitetty.
6. **Paketti 6 (ECONOMY-KULUTTAJAT) [VALMIS]:**
   - Suurimpien kuluttajien (`scopes siirto git`, `infra expresso`) kutsujen analysointi ja karsinta (`scopes/siirto/economy/kuluttajat.mjs` ja `kuluttajat.test.mjs`).
   - `scopes siirto git`: Yhdistetty paikallisen ja etätilan tarkastus, toistuvien git-lukukomentojen esto purkuehdoilla ja git-synkan automatisointi (säästö +517 kutsua/vrk).
   - `infra expresso`: Kanonisen tiedostokartan käyttö rinnakkaisrepon sokkohakujen sijaan, smoke-testien koontiajo (batch smoke) ja WaitMsBeforeAsync: 10000 -pakotus (säästö +490 kutsua/vrk).
   - Taustapalvelun rajapinta `GET /api/economy/kuluttajat` (`scopes/palvelu/economy.mjs` ja `palvelin.mjs`).
   - Verifiointigate `gate.sh` päivitetty.
7. **Paketti 7 (ECONOMY-BUDJETTI) [VALMIS]:**
   - 1 500 kutsun vuorokausibudjetointi ja siirtojen säästöstrategiat (`scopes/siirto/economy/budjetti.mjs` ja `budjetti.test.mjs`).
   - Kiintiön ja kulutusnopeuden (burn rate) reaaliaikainen seuranta ja ennusteen laskenta Tyynenmeren nollausaikaan.
   - Istuntokohtainen tavoitekatto (~25–30 kutsua / paketti, max 60) mahdollistaa jopa 50 kehityspakettia / vrk.
   - Säästötilojen eskalointi (`NORMAALI`, `SAASTOTILA`, `KRIITTINEN_SAASTO`).
   - Taustapalvelun rajapinta `GET /api/economy/budjetti` (`scopes/palvelu/economy.mjs` ja `palvelin.mjs`).
   - Verifiointigate `gate.sh` päivitetty.

---

## 5. Saavutetut säästöt ja kokonaisvaikutus

Kuuden säästökohteen ja budjetoinnin yhteisvaikutus AGY:n 1 500 kutsun vuorokausibudjettiin:
- **Kohde A (Git-esitiedot):** Säästö ~500 kutsua/vrk poistamalla toistuvat git status/log/diff -kutsut.
- **Kohde B (Tiedostokartta & symboli-indeksi):** Säästö ~1 000 kutsua/vrk poistamalla sokkohaut (`find`, `grep`, `ls`).
- **Kohde C (Tehtäväodotus & status-pollauksen esto):** Säästö ~350–385 kutsua/vrk vaatimalla `WaitMsBeforeAsync: 10000` ja luottamalla järjestelmän reaktiiviseen herätykseen (`reactive wakeup`).
- **Kohde D (Deterministinen hybridipakkaus):** Säästö ~60–105 kutsua/vrk korvaamalla vanha vaihepakkaus yhdellä synkronisella hybridi-ajolla kaikissa skoopeissa.
- **Kohde E (Suurkuluttajien karsinta — siirto-git ja infra expresso):** Säästö **+1 007 kutsua/vrk** (+517 siirto-git, +490 expresso) karsimalla toistuvat SSH/git-kyselyt ja hajautetut testisyklit.
- **Kohde F (1500 kutsun budjetointi & säästöstrategiat):** Hallitsee vuorokausikiintiön allokaatiota, estää kiintiön yllättävän loppumisen ja takaa kapasiteetin jopa 50 paketille/vrk.

**Yhteensä:** Hukkakutsujen eliminointi vapauttaa 1 500 kutsun kiintiön käytännössä kokonaan tuottavaan koodin muokkaukseen ja testaukseen.
