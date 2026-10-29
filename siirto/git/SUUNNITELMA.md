# SUUNNITELMA — Git-synkronointi ja -operaatiot Scopes-siirroissa (18.10.2026)

Paketti: **SIIRTO-GIT-NYKYTILA**  
Skooppi: `scopes siirto git`  
Tila: **Suunnitelma valmis, etenemässä toteutukseen**

---

## 1. Nykytilan kartoitus

Scopes-siirtomekanismeissa (pura, pakkaa, autovaihto, taustapalvelu) Git-operaatioita käytetään keskeisesti istuntojen tilanteen jakamiseen laitteiden (Mac, OnePlus, GitHub origin) välillä. Tällä hetkellä logiikka on kuitenkin hajautunut useisiin eri skripteihin ja moduuleihin:

1. **`Infra/git/synkka.sh`**:
   - Vastaa komentoriviltä ja siirtoajoista tehtävästä reposynkasta.
   - Tarkistaa haaran tilan (`ahead`, `behind`), likaisen puun (`dirty`) ja etähaaran olemassaolon.
   - Tukee rajattua hakua (`--skooppi`), jotta purku hakee vain tarvitsemansa repot.

2. **`claude/siirto/tools/pura-synkka.mjs`**:
   - Kapseloi `synkka.sh pura --skooppi <skooppi>` -kutsun Node.js-puolelle.
   - Tunnistaa tuntemattoman skoopin tilanteen ja tekee tarvittaessa fallbackin liputtomaan hakuun.

3. **`scopes/palvelu/toiminnot.mjs`**:
   - Scopes-palvelun tausta-ajuri (`git checkout`, `git pull`, `git push`, `git status`).
   - Käyttää omaa sisäistä `aja('git', ...)` -apuohjelmaa.

4. **`claude/siirto/tools/autovaihto.sh` ja `aja-siirtaja.sh`**:
   - Delegointi Macin ja OnePlus-palvelimen välillä SSH:lla (V-555).
   - Käyttää suoria `git -C` -kutsuja ja `GIT_OPTIONAL_LOCKS=0`-ympäristömuuttujaa indeksilukkojen välttämiseksi.

5. **`claude/siirto/tools/klonaa-tyotila.sh` ja `luo-repo.sh`**:
   - Repojen alustus, kloonaus, tracking-haaran asetus ja push.

### Nykytilan ongelmakohdat ja haasteet
- **Virheenkäsittelyn epäyhtenäisyys**: Git-komentojen virheet ja stdout/stderr-tulosteet jäsennellään eri tavoin eri työkaluissa.
- **Monilaiteympäristön eriaikaisuus**: Mac ja OnePlus voivat commitoita itsenäisesti (kuten commit `4f5f4214` OnePlus-remotessa vs. Macin paikallinen HEAD), jolloin toisen koneen muutokset jäävät huomaamatta ilman ennakoivaa remote-tarkistusta.
- **Likainen työpuu**: Työpuussa olevat keskeneräiset tiedostot estävät suoran `pull`- tai `checkout`-toiminnon.
- **Turvallisuus ja salaisuuksien suodatus**: Kaikkien git-komentojen tulosteissa on varmistettava Työtapojen Sääntö 2 (tokenien, avaimien ja salasanojen suodatus oletuksena).

---

## 2. Tavoitearkkitehtuuri (`scopes/siirto/git/`)

Luodaan selkeä, testattu ja modulaarinen kokonaisuus `scopes/siirto/git/`-hakemistoon:

```
scopes/siirto/git/
├── REKISTERI.md            # Skoopin tila ja työpaketit
├── SUUNNITELMA.md          # Tämä suunnitelmatiedosto
├── git-komento.mjs         # Matalan tason luotettava git-ajuri (aikakatkaisu, suodatus, spawn)
├── git-komento.test.mjs    # Testit git-komennon ajurille
├── git-tila.mjs            # Tilan ja haarojen normalisoitu lukija (ahead/behind, dirty, detached)
├── git-tila.test.mjs       # Testit tilanlukijalle
├── git-synkka.mjs          # Synkronointirutiinit ja ristiriitojen havaitseminen
├── git-synkka.test.mjs     # Testit synkkarutiineille
└── git-worktree.mjs        # Apurutiinit eristettyjen worktree-työtilojen hallintaan
```

### Keskeiset periaatteet
1. **Sääntö 2: Suodatus oletuksena**: Tulosteista suodatetaan aina `token`, `bearer`, `api`, `key`, `password` ja `auth` -tiedot ennen palautusta tai lokitusta.
2. **Deterministinen tulos**: Jokainen funktio palauttaa tyypitetyn / selkeärakenteisen olion `{ ok, koodi, tulos, virhe }`, eikä heitä hallitsemattomia poikkeuksia normaaleista git-virhekoodeista.
3. **Indeksilukkojen välttäminen**: Lukevissa operaatioissa asetetaan oletuksena `GIT_OPTIONAL_LOCKS=0`.
4. **Aikakatkaisut**: Komento ei voi jäädä ikuisesti jumiin roikkuvaan verkko- tai SSH-kutsuun (oletusaikakatkaisu esim. 15–30 s).

5. **Lukkotörmäysten hallinta (R3)**: Tilapäinen lukkotörmäys (`index.lock`, `cannot lock ref`, jne.) tunnistetaan ja komento yritetään automaattisesti uudelleen viiveen kera.

---

## 3. Työpaketit

| Työpaketti | Kuvaus | Tila |
|---|---|---|
| **SIIRTO-GIT-NYKYTILA** | Nykytilan kartoitus ja arkkitehtuurisuunnitelma (tämä tiedosto) | **Valmis** |
| **SIIRTO-GIT-KOMENTO** | `git-komento.mjs` ja kattavat yksikkötestit (`git-komento.test.mjs`) | **Valmis** |
| **SIIRTO-GIT-TILA** | `git-tila.mjs` ja testit (haarat, ahead/behind, likaisuus) | **Valmis** |
| **SIIRTO-GIT-SYNKKA** | `git-synkka.mjs` ja testit (synkkatarkistus ja etävarastojen vertailu) | **Valmis** |
| **SIIRTO-GIT-WORKTREE** | `git-worktree.mjs` ja testit (puhtaat rinnakkaistyötilat) | **Valmis** |
