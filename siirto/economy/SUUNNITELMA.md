# Scopes Economy — Suunnitelma ja Mittaukset

Päiväys: 27.10.2026  
Skooppi: `scopes economy`  
Tarkoitus: Tekoäly- ja siirtokulutuksen (erityisesti AGY:n 1500 kutsun vuorokausirajan) säästötoimenpiteiden suunnittelu ja toteutus Scopes-äppiin ja taustapalveluun ilman LLM-käyttökapasiteetin tuhlausta.

---

## 1. Taustamittaukset (27.10.2026)

Analysoitiin kaikki päivän AGY-istunnot (OnePlus 1 400 kutsua + Mac 2 600 kutsua = **4 000 mallikutsua**).

### Kutsujen todellinen jakauma:
* **Passiivinen tiedonhaku ja tilan tutkiminen: 62,1 % (2 481 kutsua)**
  * Tiedostojen etsintä komentorivillä (`find`, `grep`, `ls`, `cat`): **1 011 kutsua (25,3 %)**
  * Tiedostojen luku (`read_file`, `view_file`): **972 kutsua (24,3 %)**
  * Git-tilan toistuva tarkastelu (`git status`, `log`, `diff`): **498 kutsua (12,5 %)**
* **Taustatehtävien odotus ja status-polling (`manage_task`, `schedule`): 9,6 % (385 kutsua)**
* **Tekstivastaukset, purkuraportit ja kuittaukset: 4,9 % (197 kutsua)**
* **Testiajot ja varmistukset (`gate.sh`, `smoke`, `unit`): 3,3 % (133 kutsua)**
* **Pakkauksen rekisterikirjurit ja minikutsut: 2,6 % (105 kutsua)**
* **Itse koodin muokkaus (`edit_file`, `write_file`): VAIN 6,4 % (257 kutsua)**

> [!IMPORTANT]
> **Yli 71 % kaikista mallikutsuista (lähes 2 900 kutsua / vrk)** kuluu tiedonetsintään, toistuvaan git-tilan tarkkailuun ja tehtävien odotteluun. Vain 6,4 % on itse koodin kirjoittamista.

---

## 2. Neljä kehityskohdetta Scopes-äppiin ja taustapalveluun

Näiden kohteiden toteutus tehdään deterministisesti ilman LLM-kutsuja:

### A. Git-tilan ja muutoslistan esisyöttö (Säästö: ~500 kutsua / vrk)
* **Ongelma:** Malli ajaa jokaisessa istunnossa 5–15 kertaa `git status`, `git log -3`, `git diff` hahmottaakseen tilanteen.
* **Toteutus:**
  1. Taustapalvelu (`scopes/palvelu`) seuraa git-tilaa ja tiedostomuutoksia tiedostojärjestelmän tapahtumista (fs events) tai välimuistitetusti.
  2. Scopes-äpin UI (iOS/macOS) näyttää muuttuneet tiedostot ja branch-tilan suoraan.
  3. Istunnon aloituksessa ja purussa git-tila injektoidaan valmiina faktana kehotteeseen, jolloin mallin kielletään ajamasta git-lukukomentoja.

### B. Tiedostokartta ja koodi-indeksi (Säästö: ~1 000 kutsua / vrk)
* **Ongelma:** Yli 1 000 kutsua vuorokaudessa kului siihen, että malli etsii sokkona `find`- ja `grep`-komennoilla tiedostoja ja funktioita.
* **Toteutus:**
  1. Taustapalvelu ylläpitää kevyttä tiedostokarttaa ja symbolihakemistoa skoopeittain.
  2. Kun käyttäjä valitsee tehtävän tai skoopin äpissä, äppi linkittää tehtävään automaattisesti relevantit tiedostopolut.
  3. Mallille annetaan suoraan tiedostopolut ja koodirivit (file://-linkit), jolloin sokkohaut komentoriviltä jäävät pois.

### C. Tehtäväodotuksen ja synkronoinnin determinismi (Säästö: ~350–385 kutsua / vrk)
* **Ongelma:** `manage_task status` -kutsuja tehtiin satoja, kun komennot valuvat asynkronisiksi ja malli alkaa pollaamaan niiden valmistumista.
* **Toteutus:**
  1. Säädetään `WaitMsBeforeAsync` suuremmaksi (oletus 10 000 ms), jolloin normaalit testit ja komennot päättyvät synkronisesti yhdellä vuorolla.
  2. Työkalukutsuissa kielletään eksplisiittisesti status-kyselyt: taustaprosessin valmistuminen herättää mallin automaattisesti (reactive wakeup).

### D. Deterministinen hybridipakkaus (Säästö: ~60–80 kutsua / vrk)
* **Ongelma:** Vanha `pakkaa-vaiheet.mjs` kutsuu mallia erikseen rekisterikirjurina vaiheille A, B, C ja K (kymmeniä pikaistuntoja päivässä).
* **Toteutus:**
  1. Siirtyminen uuteen `pakkaa-hybridi.mjs`:ään ja sen jatkokehitys siten, että rekisterin päivitykset ja historian siirrot hoidetaan deterministisellä jäsennyskoodilla.

---

## 3. Toteutuksen tiekartta

1. **Paketti 1 (ECONOMY-SUUNNITELMA):** Arkkitehtuurin ja rajapintojen tarkennus Scopes-äpille ja taustapalvelulle.
2. **Paketti 2 (ECONOMY-GIT-ESITIEDOT):** Git-tilan injektointi istuntojen avaukseen ja purkuihin (`scopes/palvelu` ja `autovaihto.sh`).
3. **Paketti 3 (ECONOMY-TASK-ODOTUS):** Komentojen odotusviiveiden optimointi ja manage_task pollauksen esto.
4. **Paketti 4 (ECONOMY-TIEDOSTOKARTTA):** Tiedostokartan ja polkulistausten tarjoaminen äpissä.
5. **Paketti 5 (ECONOMY-HYBRIDI) [VALMIS]:** Vanhan vaihepakkauksen korvaaminen hybridillä kaikissa skoopeissa.
6. **Paketti 6 (ECONOMY-KULUTTAJAT) [SEURAAVA]:** Suurimpien kuluttajien (`siirto-git`, `infra expresso`) kutsujen käytännön karsinta ja siirtyminen suoraan uuteen economy-arkkitehtuuriin.
