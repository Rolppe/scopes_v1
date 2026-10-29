# CONTEXT-A2 — sääntötaulu: vanhan `Infra/skills/pakkaa/SKILL.md`:n säännöt → uusi paikka

Laadittu 14.10.2026 (scopes context). Vanha SKILL.md: 31 161 merkkiä, 407 riviä (git: `git show a320fe29:Infra/skills/pakkaa/SKILL.md`).
Uusi SKILL.md alle 8 000 merkkiä; mekaniikka `claude/siirto/tools/pakkaa-alku.mjs` (AL) ja `pakkaa-loppu.mjs` (LO), testit
`pakkaa-alku.test.mjs` (A1–A15) ja `pakkaa-loppu.test.mjs` (L1–L21). Testinimet lyhennetty alkuosaan. Selitys- ja mittausproosa
("Miksi"-kappaleet, mittaushistoria) ei ole siirretty rivi riviltä; ne löytyvät vanhasta tiedostosta yllä olevalla komennolla ja
rekisterin ARKISTO.md:stä. Sääntö itse ja sen tunnus on aina jossakin alla.

Testit: A1 muistiopohjan luvut järjestyksessä · A2 yhteinen polku -fallback · A3 SEURAAVA-HEAD luetaan HEADista · A4 jaettu rekisteri,
oma leimattu rivi · A5 olemassa olevaa muistiota ei korvata · A6 `--tarkista` hylkää TÄYTÄ-rivin · A7 `--tarkista` portti ja KATTO ·
A8 PILVI · A9 SYNKKA · A10 VIERAS exit 0/1/tuntematon · A11 vieras exit 3 · A12 session commitit · A13 AUTOVALINTA/AUTOPACK ·
A14 r&do-eristys · A15 käyttövirhe · L1 autopack false → exit 5 · L2 `--vahvistettu`, loppuviestin rivit · L3 autopack true, PAKATTU ·
L4 leima tunnistetaan · L5 push epäonnistuu · L6 PAKKAUS epäselvä (vaihe2, last-scope) · L7 lukko varattu · L8 SEURAAVA-portti hylkää ·
L9 `--vaihda` vaihtaa · L10 `--vaihda` + pakkaa vain · L11 ilman `--vaihda`, `--pakkaa-vain`, exit 2 · L12 `--vaihda` + push epäonnistui ·
L13 hukka kirjataan, uusinta · L14 hukan poikkeusrivit · L15 skoopin siirto · L16 install.sh · L17 r&do ei arkistoa · L18 archived-rivi ·
L19 pakkaa-git exit 2 · L20 pilvi · L21 käyttövirhe.

| # | Vanha sääntö / tunnus | Uusi paikka |
|---|---|---|
| 1 | SIIRTO-PAKKAA-KAIKKI 26.9.2026: `kaikki` ≠ skooppi; KAIKKI.md luvut "Koordinaattori", "Pakkauspyyntö toiselta istunnolta" | SKILL.md `**\`kaikki\`.**` |
| 2 | Vaihe 0 synkka (`synkka.sh ennen --skooppi`, R1; tuntematon skooppi → ilman lippua) | AL step 2 SYNKKA; A9 |
| 3 | "rebase-konflikti" / "origin ei tavoitettavissa" sanotaan käyttäjälle, pakkaus jatkuu paikallisesti | AL `SYNKKA: huomio`; A9; SKILL.md rivi `SYNKKA: huomio` |
| 4 | SIIRTO-PILVI 25.9.2026: pilvessä pilvi.md korvaa synkan ja pushin | AL step 1 `PILVI`, A8; LO `PILVI`, L20; SKILL.md; `references/pilvi.md` ennallaan |
| 5 | Skooppi: `$ARGUMENTS` tai aloitusskooppi; pwd-varasääntö | SKILL.md `**Skooppi.**` (harkinta) |
| 6 | SKOOPPI-AJAUTUMA 15.9.2026 / RDO-SCOPE 12.9.2026 "polku ratkaisee": muutetut polut → `skooppi-polusta.mjs` (git status juuresta/repoista + session commitit) | AL step 3 `SKOOPPITARKISTUS`; A1, A10, A12; SKILL.md `Skooppi` |
| 7 | V-008 / TYOTAVAT 15: vieras skooppi vain pyynnöstä, exit 0 pakataan, exit 1 vika.sh, exit 3 kuten ennen; ei tarjouskysymystä | AL step 4 `VIERAS`; A10, A11; SKILL.md `Skooppi` ja `VIERAS`-rivi |
| 8 | `tuntematon` skooppi = yksi kysymys | AL `KYSY:`; A10; SKILL.md |
| 9 | rd-taidon sääntö 1f: rd-prosessityö → `claude r&d` | SKILL.md `Skooppi` |
| 10 | `claude r&do`: r&do-kopio + `--state-dir claude/r&do/.rdo-state`, ei r&d2:n kopiota eikä yhteistä polkua (eristysinvariantti) | AL `PYSÄHDY` + pack-memo-valinta, A14; LO ei transkriptiarkistoa, L17; SKILL.md `PYSÄHDY` |
| 11 | Muistio omaan istuntokohtaiseen tiedostoonsa (`pack-memo.mjs path --session`) | AL step 5; A1 |
| 12 | Varapolku `state/pakkaus-muistio.md` + maininta raportissa: saman skoopin pakkaukset peräkkäin | AL `MUISTIO-VAROITUS`; A2; SKILL.md |
| 13 | Muistion rakenne (otsikko, Skooppitarkistus, 10 lukua, järjestys) | AL step 8 pohja; A1 |
| 14 | `## Sessio`: id, malli, koko, viimeinen_vuoro transkriptista (P3, ei arvausta) | AL `sessioTiedot`; A1 |
| 15 | `## Muutetut tiedostot` = git status; `Infra/skills/**`, `Infra/agents/*.md` samaan committiin | AL pohja; A1, A12; SKILL.md `Muistio` |
| 16 | Absoluuttiset päivät; faktat lähteineen; salaisuuden sijainti, ei arvo; viat vain lukuun Viat; ali-agentti näkee vain muistion | SKILL.md `Muistio` (harkinta) |
| 17 | `SEURAAVA PAKETTI:` pakollinen, reitittimen muoto, `ei mitään — <miksi>` | SKILL.md `Seuraavan paketin valinta`; portti A6/A7 (`PORTTI`) |
| 18 | SIIRTO-ALASKOOPPIRIVI 19.9.2026: leimattu `SEURAAVA PAKETTI [<skooppi>]` jaetussa rekisterissä | AL `JAETTU-REKISTERI` + leimattu pohjarivi; A4; SKILL.md |
| 19 | PAKKAA-SEURAAVA-HEAD 22.9.2026: lähtörivi HEADista, ei muistista; HEADin paketti pysyy, ellei sessio tehnyt sitä; ero purussa nähtyyn sanotaan | AL `SEURAAVA-HEAD` (`git show HEAD:./<tiedosto>`, resolveri `pakkausRekisteri`), A3; SKILL.md |
| 20 | SIIRTO-AUTOVALINTA 27.9.2026: `false` → AskUserQuestion kolmella vaihtoehdolla, `true` → valinta + `— automaattinen: kyllä` + poissulut | AL `AUTOVALINTA` (arvo), A13; SKILL.md `Seuraavan paketin valinta` (harkinta) |
| 21 | Pakkaa vain 14.10.2026: rivi `ei mitään — käyttäjä valitsi pakkaa vain`, ei sessionvaihtoa | SKILL.md; LO `vainPakkaa`, L10, L11 (`--pakkaa-vain`) |
| 22 | Vaiheen 1 portti: `skooppi-polusta.mjs --seuraava … ` exit 0 ilman ODOTTAA; muuten `references/portti.md` "Vaihe 1" | AL `--tarkista` `PORTTI`; A7; SKILL.md `Portit`; portti.md ennallaan |
| 23 | SIIRTO-MUISTIOKATTO 16.9.2026: 10 000 merkkiä, ei nosteta, ei jaeta kahdeksi | AL `--tarkista` `KATTO-MUISTIO` (check-rekisteri.mjs --muistio), A7; SKILL.md `Portit` |
| 24 | SIIRTO-OMIN-PAIN-TIIVISTETTY 19.9.2026: pudotetut faktat luetellaan käyttäjälle ja kirjataan `## Hukka`-lukuun | SKILL.md `Portit` (harkinta) |
| 25 | SIIRTO-HUKKAKIRJAUS 21.9.2026: `## Hukka` pakollinen, 8 saraketta, tarkistus `hukka.mjs --muistio` | SKILL.md `Hukka ja Kesken`; AL `--tarkista` `HUKKA-LUKU`, A6 |
| 26 | SIIRTO-VAIHTO-KESKEN 29.9.2026: `## Kesken keskustelussa` pakollinen, `kesken.mjs --muistio` | SKILL.md `Hukka ja Kesken`; AL `--tarkista` `KESKEN-LUKU`, A6 |
| 27 | SIIRTO-VAIHEKORJAAJA-PAKKAUS 21.9.2026: `aja-siirtaja.sh paketoi`, exit 0/10/3/2/5 | SKILL.md `Vaihe 2` |
| 28 | V-011 / sääntö 15: exit 5 `AJAJA: VIERAS` → ei jatketa, ei kysytä, vika.sh | SKILL.md `Vaihe 2` |
| 29 | Sonnet-reitin kestorivi (SIIRTO-EDISTYMINEN 16.9.2026: 4–7 min, 9/10 alle 9 min, max 21 min; päivitä mittarilla) | SKILL.md `Vaihe 2` |
| 30 | SIIRTO-LEVYTARKISTUS 16.9.2026: ei raporttia → levytarkistus, ei päättelyä hylkäysviestistä, ei uusinta-ajoa | SKILL.md `Vaihe 2` → `references/levytarkistus.md` ennallaan |
| 31 | Vaihe 3: raportti sellaisenaan; tietoturvagrep ensin; KATTO ei committia; `katto-ehdokkaat.mjs` + `arkisto.mjs`; ARKISTO.md mukaan; `odottaa Ominaisuudet-riviä` (V-095); RIKE (V-109); avointa riviä ei siirretä (SIIRTO-KATTO-SIIRTO-HILJAA); IDEAT.md/HISTORIA.md PÄIVITETTY (J1); HUKATUT-TIEDOT.md ei committiin; keksityn viittauksen lähdetarkistus | `references/katto.md` (uusi, sisältö ennallaan) + yksi viittausrivi SKILL.md `Vaihe 3`; HUKATUT-TIEDOT-ohitus myös pakkaa-git.sh (ennallaan) |
| 32 | SIIRTO-ALOITUSSKOOPPI-LEVITYS 19.9.2026: SEURAAVA-tarkistus valmiille rekisterille ennen committia, `portti.md` "Vaihe 3" | LO step 1 `PORTTI` (exit 4, ei committia); L8; SKILL.md `Vaihe 3` |
| 33 | METRICS-TRANSCRIPT-ARCHIVE 16.9.2026: transcript-archive ennen gitiä; `archived`/exit 1 → transkriptiarkisto.md; r&do ohita | LO step 2; L17, L18; SKILL.md ei erillistä riviä (`LUE:`-rivi ohjaa); `references/transkriptiarkisto.md` ennallaan |
| 34 | V-096 28.9.2026: git-vaihe yhtenä `pakkaa-git.sh`-kutsuna, ei `;`-ketjua, ei `git -c` | LO step 4 (yksi kutsu, uusinta vain exit 3); L2; SKILL.md `Vaihe 3`; pakkaa-git.sh ennallaan |
| 35 | V-100 / PAKKAA-GIT-LOCK / V-100 osa 2: repolukot, 8 min odotus, haltija, exit 3 = mitään ei committattu → yksi uusinta, yhä 3 → haltija | pakkaa-git.sh ennallaan; LO `LUKKO: varattu — <haltija>`; L7; SKILL.md exit 3 |
| 36 | `LUKKO: pack-lock.mjs puuttuu` mainitaan | LO välittää `LUKKO`-rivit; SKILL.md |
| 37 | B2 5.10.2026 (V-175/V-178): `rekisteritarkistin hylkäsi` → ei committia missään repossa | pakkaa-git.sh ennallaan; LO välittää `TARKISTIN`/`PAKKAA-GIT`; L19; SKILL.md exit 2 |
| 38 | Autopack `false` → kysy vahvistus yhtenä kysymyksenä; `true` → aja itse (lupa A2 4.9.2026; pakkaa-sonnet ei aja gitiä) | LO step 3 `KYSY-VAHVISTUS`/`UUSINTA`, exit 5, L1; `--vahvistettu` L2; SKILL.md `Vaihe 3` |
| 39 | `--leima TIEDOSTO:MERKKI` (leimapaikka omana committinaan, ei amendina) | LO step 4: merkki `LEIMA` rekisterin `Tilanne:`-rivillä; L4; pakkaa-git.sh ennallaan |
| 40 | P6 5.10.2026 / SIIRTO-RINNAKKAIS R1: hukkarivit kirjataan `hukka-kirjaa.mjs`:llä pakkaa-gitin jälkeen (exit 0/1), exit 1 → uusinta; `JAETTU … push lykätty`/`SYNKKA: haarautunut` eivät muuta PAKKAUS-riviä | LO step 5; L13, L14; SKILL.md `Vaihe 3` |
| 41 | SIIRTO-SKOOPPIREPOT-2-KYTKENTA 6.10.2026 / SKOOPPIREPOT-3: `siirra-skooppi.sh` exit 6 hiljaa, 0 SIIRTO + selitys, 4/5 yksi rivi, 2/3 virherivit; ei pakkauksen onnistumiseen | LO step 6 (`SIIRTO-SELITYS`); L15; SKILL.md `Skoopin siirto omaan repoon` |
| 42 | `install.sh` heti pushin jälkeen, kun commit sisälsi `Infra/skills/**`/`Infra/agents/**`; toinen kone asentaa /purassa (PURA-DRIFT-INSTALL) | LO step 7 `ASENNUS`; L16 |
| 43 | V-003 18.9.2026: `**PAKATTU:**` loppuviestin ensimmäinen rivi vain autopack `true` | LO step 8; L3 (ei riviä false-haarassa L2) |
| 44 | V-142 1.10.2026: `PAKKAUS: vahvistettu — …` / `epäselvä — <osa>` viidestä osasta | LO `pakkausRivi`; L2, L5, L6, L7 (rekisterit/salaisuusgrep: `--vaihe2`) |
| 45 | I-007 18.9.2026: avauskomento omana aidattuna lohkonaan ennen viimeistä SEURAAVA-riviä | LO step 8; L2; SKILL.md `Avauskomento omana lohkonaan` |
| 46 | Viimeinen rivi `**SEURAAVA PAKETTI:** <rekisterin rivi>` | LO step 8 (rivin teksti kaksoispisteen jälkeen); L2 |
| 47 | SIIRTO-SA-POIS 23.9.2026: sa-työt pois, kun commit syntyi | LO `SA:`-rivi vain jos commit; L2, L5; SKILL.md `Hereillä pito pois` |
| 48 | SIIRTO-AUTOMAATTISIIRTO 5.10.2026: käyttäjän pakkauskomento ei vaihda sessiota; `/automaattisiirto` tai autopackin oma laukaisu vaihtaa; absoluuttinen `autovaihto.sh`-polku (sallintasääntö) | LO step 9 (`--vaihda`, `join(juuri, S, 'tools/autovaihto.sh')`); L9, L11, L12; SKILL.md `Sessionvaihto vain automaattisiirrossa` |
| 49 | V-090: `ISTUNNOT: ei muita istuntoja` pois; VAIHDETTU/VANHA/KESKEN mukaan; exit 2 → `VAIHTO: epäonnistui — vanha jää auki` | LO step 9; L9, L11 |
| 50 | SIIRTO-VAIHTO-UNOHTUI 28.9.2026: pakkaa-git.sh:n viimeinen `SEURAAVA ASKEL`-rivi | pakkaa-git.sh ennallaan (viittaa SKILL.md:n lukuun "Sessionvaihto vain automaattisiirrossa", joka säilyi) |
| 51 | Käyttäjän sääntö 26.9.2026: pilveä ei käytetä | SKILL.md `Sessionvaihto…`; autovaihto.sh ennallaan |
| 52 | Viittaus autopakkaa-taitoon | SKILL.md ensimmäinen kappale |
