# scopes/context/pakkaascripti/SUUNNITELMA.md

Tilanne: 15.10.2026 (paketti CONTEXT-PAKKAASCRIPTI-MITTAUS). Malli: purascriptin T6 (`scopes/context/purascript/SUUNNITELMA.md` luku T6).

## M1 Nykyinen pakkaus (mitattu 15.10.2026)

| # | Vaihe | Tekijä | Luokka | Lähde |
|---|---|---|---|---|
| 0 | Skoopin päättely | pääistunto | sisältö (pieni) | Infra/skills/pakkaa/SKILL.md:11 |
| 1 | Synkka, skoopintarkistus, SEURAAVA-HEAD, muistiopohja (8 TÄYTÄ-lukua) | pakkaa-alku.mjs | mekaaninen | pakkaa-alku.mjs:184-310 |
| 2 | Muistion täyttö (Tehty, Todettu, Päätökset, Avoimet, Viat, Hukka, Kesken) | pääistunto | sisältö | pakkaa-alku.mjs:290-300 |
| 3 | SEURAAVA PAKETTI -rivi (autovalinta tai kysymys) | pääistunto | sisältö tai käyttäjä | SKILL.md:21-23 |
| 4 | Portit `--tarkista` (TAYTA, PORTTI, KATTO-MUISTIO, HUKKA, KESKEN) | pakkaa-alku.mjs | mekaaninen | pakkaa-alku.mjs:82-110 |
| 5a | Lukko, Tilanne-päivä, HISTORIA, hukka, kesken, arkisto, tietoturvagrep, tila | pakkaa-vaiheet.mjs | mekaaninen | pakkaa-vaiheet.mjs:1-30, :636-671 |
| 5b | **A** avoimet asiat, **B** viat, **C** todettu ja päätökset rekisteririveiksi, **K** katto | claude-cli + claude-sonnet-5-5 (JSON-operaatiot, tarkistin hylkää) | sisältö | pakkaa-vaiheet.mjs:297, :305, :376, :607; ajaja.json:6-8 |
| 6 | Raportti, lähdetarkistus lisätyille viittauksille | pääistunto | sisältö (tarkistus) | SKILL.md:32 |
| 7 | SEURAAVA-portti, transkripti, pakkaa-git.sh (commit, push), hukka R1, siirra-skooppi, install, autovaihto | pakkaa-loppu.mjs | mekaaninen | pakkaa-loppu.mjs:88-210 |
| 8 | sa pois, /pura-lohko | pääistunto | mekaaninen | SKILL.md:36-40 |

Johtopäätös: ainoa erillinen mallikutsu on vaihe 5b. Kaikki muu on jo skriptissä tai pääistunnossa.

## M2 Kulutus

- Vaihe 5b, `claude/siirto/mittaukset/ajajat.jsonl` (`"toiminto":"pakkaa"`, claude-sonnet-5-5, n=215, 12.–15.10.2026): kesto mediaani 43 s, p90 69 s; tokenit (sis. välimuistilukemat) mediaani 152 k, p90 235 k. Scopes-skoopit n=163/215 (76 %): mediaani 42 s, 152 k.
- Virheet, `vaihevirheet.jsonl` Sonnet-rivit (n=352): C hylätty 175, korjattu 117; A hylätty 30; B hylätty 9. C on virhealtein.
- Pääistunnon lataus: autopakkaa + pakkaa/SKILL.md ≈ 22 k tokenia (scopes/context/REKISTERI.md:76).
- Ei mitattu: muistion kirjoitus (vaihe 2) pääistunnossa sekä pakkaa-alun ja -lopun kesto. Ne mitataan P1:ssä.
- Vanhentunut: SKILL.md:30 väittää vaiheen 2 kestävän 4–7 min (aliagenttiaika); claude-cli-mediaani on 43 s.

## M3 Ehdotettu malliton pakkaus (scopes-perhe)

Periaate T6:sta: scopes-perheellä ei ole mallireittiä, ja virhe näytetään sellaisenaan. Mallin työ siirtyy pääistunnolle, jolla sisältö jo on.

- **P1 `pakkaa-malliton.mjs`** yhdistää vaiheet 1, 4, 5a ja 7 yhdeksi skriptiksi, kuten pura-malliton.mjs. Se korvaa 5b:n pääistunnon kirjoittamilla rivioperaatioilla.
- **Muistion muoto (vaihtoehto R, suositus):** pääistunto kirjoittaa A-, B- ja C-luvut valmiina rekisterin taulukkoriveinä (`LISÄÄ` / `KORVAA <avain>` / `POISTA <avain>`). Skripti ajaa samat tarkistimet (`tarkistaTaulu`, liitosavain, rivieheys) ilman mallia. Hylkäys tulostetaan sellaisenaan, ja pääistunto korjaa muistion ja ajaa uudelleen.
- **Vaihtoehto S:** muistio pysyy proosana, ja A/B/C tehdään säännöillä. Hylätään alustavasti: C vaatii harkintaa (292 C-virhettä).
- **Uudelleenkäyttö:** `tarkistaTaulu` (pakkaa-vaiheet.mjs:191) ja vaihesilmukan tarkistimet eivät ole vielä exportattuja, joten ne siirretään yhteiseen moduuliin. Nykyinen /pakkaa ei muutu muille skoopeille.
- **Odotettu hyöty:** noin 150 k tokenia ja 43 s vähemmän pakkausta kohden scopes-skoopeissa. Pääistunnon lisäkulu on rivimuotoinen muistio, joka mitataan P1:ssä.

## M4 R:n kustannus nykyiseen verrattuna (arvio 15.10.2026, käyttäjän pyyntö)

Hinnat (claude-api-taito, välimuisti 2026-10-06), $/MTok: Sonnet 5.5 syöte 2, tulos 10, välimuistiluku 0,20; Opus 5.5 syöte 4, tulos 20, välimuistiluku 0,20. Välimuistikirjoitus on oletettu 1,25 × syöte (1 h TTL: 2 ×).

**Nykyinen vaihe 5b (Sonnet, mitattu):** 618 claude -p -kirjurisessiota 12.–15.10. (`~/.claude/projects/-home-user-palvelin/*.jsonl`, ensimmäinen viesti "rekisterikirjuri"). Tokenijakauma: välimuistiluku 77 %, välimuistikirjoitus 20 %, tulos 2,5 %. Mediaanipakkaus 152 k ≈ luku 117 k + kirjoitus 31 k + tulos 3,8 k ≈ **0,14 $** (1 h TTL: 0,19 $), ja kesto on 43 s. Dollareista yli puolet on välimuistikirjoitusta (noin 17 k per claude -p -sessio, eli järjestelmäkehote ja projektin ohjeet joka vaiheessa).

**R pääistunnossa (Opus 5.5, arvio):** pääistunnon konteksti pakkaa-alun hetkellä on mediaanina 123 k, p90 172 k (98 pakkausta, samat transkriptit). Jokainen ylimääräinen työkalukutsu maksaa siis noin 0,025 $.
- Rekisterin A/B/C-osien luku: mediaani 5,9 k merkkiä ≈ 2 k tokenia, 1 kutsu ≈ 0,04 $.
- Rivit tekstinä proosan sijaan sekä harkinta: +2–4 k tulostokenia ≈ 0,04–0,08 $.
- Hylkäykset: Sonnetilla noin 1 per pakkaus (214 hylkäystä / 215 ajoa). Jokainen hylkäys on 2 kutsua ja noin 1 k tulostokenia ≈ 0,07 $; Opuksella oletettu 0,5–1 hylkäystä ≈ 0,035–0,07 $.
- Yhteensä noin **0,11–0,19 $** pakkausta kohden. Aika: noin 3 k Opus-tulostokenia ja 2–4 kutsua, eli noin 40–60 s.

**Johtopäätös:** R ei säästä rahaa eikä aikaa, vaan on nykyisen kanssa tasoissa. Se siirtää kulun Sonnetilta Opukselle ja kasvattaa pääistunnon kontekstia juuri pakkauksen hetkellä. R:n hyöty olisi vain rakenteellinen: claude -p -riippuvuus poistuu ja sisältö pysyy mallilla, jolla on keskustelun konteksti. Vertailukohta: vaiheen 5b välimuistikirjoituksen karsiminen (claude -p:n järjestelmäkehote ja ohjeet pois vaiheista) puolittaisi nykyisen kulun arviolta arkkitehtuuria muuttamatta. Tämä on hypoteesi, jota ei ole mitattu.

Mittaamatta: Opuksen todellinen hylkäysmäärä R-muodossa ja claude -p:n välimuistikirjoituksen sisältö.

## M5 Käyttäjän ehdotus: rekisteri kirjoitetaan ajon aikana, skripti + Haiku -hybridi (15.10.2026)

Ajatus: rekisteriä ei päivitetä kerralla pakkauksessa. Se päivitetään keskustelun aikana tarkistuspisteissä, esimerkiksi commitin, paketin valmistumisen tai vuoron lopun jälkeen. Skripti tekee mekaanisen osan, ja Haiku tekee vain A/B/C-rivit pienestä muutoserästä nykyisillä tarkistimilla. Pakkaukseen jää viimeinen erä ja pakkaa-loppu.

Lähtötieto Haikusta (claude-haiku-5-5, n=4 pakkausta 12.10., ajajat.jsonl):
- Ajoaika mediaani 139 s ja tokenit 360 k (Sonnet 43 s, 152 k).
- C-hylkäyksiä 18/4 ajoa (vaihevirheet.jsonl), eli noin 4,5 per ajo; Sonnetilla noin 0,8 per ajo.
- Hinta on noin 1/20 Sonnetista ($0,10/$0,50), joten kokonainen pakkaus maksaisi Haikulla noin 0,01–0,02 $.
- CLAUDE.md: Haiku vain mitatusti riittävään (V-246).

Arvio:
- Hyöty: pakkauksen lopussa ei ole enää 43 s:n odotusta, ja kulu on noin kymmenesosa. Virhe näkyy heti kirjoitushetkellä eikä vasta pakkauksessa. Muistion täyttö pääistunnossa (vaihe 2) voi kevetä, jos erä otetaan transkriptista (käyttäjän viestit, AskUserQuestion-vastaukset, commit-viestit) eikä mallin kirjoittamasta muistiosta.
- Riski: Haikun C-laatu, jossa koko pakkauksen kokoisella syötteellä hylkäyksiä tuli 5,6 kertaa Sonnetin määrä. Hypoteesi on, että pieni erä (1–3 kohtaa) on Haikulle helpompi, mutta sitä ei ole mitattu.
- Halpa mittaus ilman muutoksia: 87 pakattua muistiota (`~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio/*.packed-*`) ajetaan uudelleen `pakkaa-vaiheet.mjs --kuiva --malli claude-haiku-5-5` -komennolla. Ajetaan sekä koko muistiona että pilkottuna pieniksi eriksi, ja hylkäyksiä ja rivejä verrataan Sonnetin todelliseen tulokseen gitissä.

## M6 Haiku-toistomittaus (15.10.2026, ali-agentti, --kuiva erillisissä worktreissä)

Aineisto: 10 scopes-muistiota (12.–15.10.), joille ajettiin 10 Haiku-ajoa kokonaisena, 15 Haiku-erää (5 muistiota × 3) ja 10 Sonnet-vertailuajoa. Jokainen ajo päättyi exit 0, kaikki vaiheet ok. Lokit: `/tmp/claude-1000/-home-user-palvelin/8454b963-c995-4378-8820-1c7c8f3fcabd/scratchpad/haiku-toisto/` (häviää istunnon mukana).

| Muunnos | Ajoja | C-hylkäyksiä/ajo | Mediaani s | Mediaani tok | Arvio $/ajo |
|---|---|---|---|---|---|
| Haiku kokonainen | 10 | 2,0 | 84,5 | 255 k | ~0,01 |
| Haiku erä (1–3 kohtaa) | 15 (12 mallikutsua) | 0,67 | 17 | 48 k | ~0,002 |
| Sonnet kokonainen | 10 | 1,0 | 40 | 183 k | ~0,17 |

- A- ja B-vaihe: ei yhtään hylkäystä millään mallilla. Hylkäykset ovat vain C:ssä (Todettu). Päätökset- ja Tehty-erät eivät tarvitse mallia lainkaan (1 s, 0 tokenia).
- Laatu verrattuna Sonnetin todelliseen commitiin: Haiku kokonaisena teki 2 omaa virhettä 10:stä. Muistiossa 4 se kirjoitti tilaksi "kesken", kun oikea tila oli "korjattu". Muistiossa 7 se vaihtoi vieraan V-312-rivin omistajan. Molemmat virheet ovat Haikun omia, koska Sonnet samalla skriptillä ei tehnyt niitä. Muut erot (Historia-rivin korjaus puuttui, sanamuoto) olivat samat myös Sonnetilla.
- Erissä ei ollut vääriä eikä ylimääräisiä rivimuutoksia.
- Jokaisella mallikutsulla on noin 48 k:n kiinteä kulu (claude -p:n kehote). Erät eivät siksi säästä tokeneita kokonaisuutena, mutta yksi erä kestää noin 17 s, ja ajon aikana se on pois pakkauksen odotuksesta.

Johtopäätös: hybridi on toteuttamiskelpoinen. Haiku pienillä erillä ajon aikana maksaa noin 1/15–1/80 Sonnetin hinnasta, ei tehnyt mittauksessa rivivirheitä, ja virheet näkyvät erän kohdalla. Avoinna ovat tarkistuspisteiden laukaisu ja erän lähde (transkripti vai muistio). Kiinteän ~48 k:n kulun karsiminen on erillinen vipu.

Mittaussivuhavainto: `vieras-skooppi.mjs` lukee kutsujan istunnon CLAUDE_CODE_SESSION_ID:n, joten ali-agentin toisto vaatii `env -u CLAUDE_CODE_SESSION_ID`.

## Vaiheet

| Vaihe | Sisältö | Polut |
|---|---|---|
| P0 | Käyttäjän valinta: muistion muoto R/S ja käyttöönotto (testinappi vai /pakkaa-reitti) | tämä tiedosto |
| P1 | Tarkistimet yhteiseen moduuliin + pakkaa-malliton.mjs --kuiva, testit | claude/siirto/tools/ |
| P2 | Koeajo yhdellä scopes-skoopilla (tämä skooppi), vertailu Sonnet-reittiin | mittaukset |
| P3 | Käyttöönotto scopes-perheelle pakkaa-taidossa | Infra/skills/pakkaa/ |

## M7 Hybridin tarkistuspisteet (suunnitelma 15.10.2026, paketti CONTEXT-PAKKAASCRIPTI-TARKISTUSPISTEET)

Lähtökohta M6: Haiku-erä (1–3 kohtaa) maksaa noin 0,002 $ ja kestää noin 17 s, mutta jokaisella kutsulla on noin 48 k:n kiinteä kulu. Kutsujen määrä ratkaisee siis kulun, ja laukaisun pitää osua kohtaan, jossa erässä on sisältöä.

**Laukaisu**

| Vaihtoehto | Mekanismi | Hyöty | Haitta |
|---|---|---|---|
| L1 paketti valmis (suositus) | pääistunto ajaa paketin lopuksi `kirjaa-era.mjs <skooppi>` samassa kohdassa kuin commitin | luonteva yksikkö, 1–3 kohtaa = M6:n mitattu eräkoko; ei uutta hookia | pääistunnon on muistettava ajaa (portti: pakkaus ajaa jäljelle jääneet erät, joten mitään ei katoa) |
| L2 commit | PostToolUse-hook `git commit` -komennolle tai repon post-commit-hook | automaattinen | välicommitit tuottavat puolikkaita eriä; settings.json-hook vaatii käyttäjän muokkauksen (freeze-guard) |
| L3 vuoro | Stop-hook joka vuoron lopussa | ei unohdu | useimmat vuorot ilman sisältöä → 48 k per tyhjä kutsu, ellei esisuodatin karsi; settings.json-hook |

**Erän lähde**

| Vaihtoehto | Mitä | Mitattu | Haitta |
|---|---|---|---|
| E1 muistioerä (suositus) | pääistunto kirjoittaa pienen muistion (samat luvut kuin pakkausmuistiossa, vain uudet kohdat) | kyllä (M6: 0,67 C-hylkäystä, ei rivivirheitä) | pääistunnolle 1 kirjoitus per erä (Opus-tulos, noin 0,03–0,05 $) |
| E2 transkripti | skripti poimii käyttäjän viestit, AskUserQuestion-vastaukset ja commit-viestit edellisestä pisteestä | ei | Haiku joutuu luokittelemaan Tehty/Todettu/Päätökset itse, eli juuri C:n kaltainen harkinta, joka oli virhealttein |

**Ajotapa:** A1 etualalla (17 s odotus, hylkäys näkyy heti samassa vuorossa ja korjataan) tai A2 taustalla (detach + status, hylkäys luetaan seuraavassa vuorossa).

**Yhteiset osat, valinnoista riippumatta:**
- Kirjanpito: `state/pakkaus-erat/<istunto>.json` listaa ajetut erät; pakkaus ajaa vain loppuerän ja ohittaa jo kirjatut kohdat.
- Lukko: erä ottaa saman rekisterilukon kuin pakkaa-vaiheet.mjs (packLock), joten erä ja pakkaus eivät kirjoita yhtä aikaa.
- Commit: erä ei committoi, vaan rekisterimuutos menee paketin omaan commitiin (CLAUDE.md: pääistunto committoi).
- Raja: vain scopes-perhe; muut skoopit pakataan nykyisellä tavalla.

**Käyttäjän valinnat 16.10.2026:** laukaisu L1 paketti valmis. Erän lähde on vielä harkinnassa, ja käyttäjä toi lisävaihtoehdon E3. Ajotapa ratkaistaan vasta lähteen jälkeen.

**E3 rinnakkainen Haiku-keskustelu (käyttäjän ehdotus 16.10.2026):** pysyvä Haiku-istunto kulkee pääkeskustelun rinnalla, ja skripti syöttää sille pääkeskustelun viestejä transkriptista. Haiku kirjoittaa erän rivit tarkistuspisteessä omasta kertyneestä kontekstistaan.
- Mekanismi on olemassa (`claude --help`): joko `claude -p --session-id <uuid>` ja tarkistuspisteessä `--resume <uuid>`, tai pitkäikäinen prosessi, jolla on `--input-format stream-json`.
- Kulu: 48 k:n kiinteä kehote kirjoitetaan välimuistiin kerran ja luetaan sen jälkeen välimuistista. Haikulla luku 48 k ≈ 0,0005 $ per kutsu, joten M6:n "erillinen vipu" poistuu tällä reitillä. Jos välimuisti vanhenee (5 min TTL), uudelleenkirjoitus maksaa ≈ 0,006 $.
- Pääistunto ei kirjoita muistiota, joten E1:n 0,03–0,05 $ per erä jää pois. Haiku näkee aiemmat erät eikä kirjaa samaa kahdesti.
- Riski: kyse on E2:n luokitteluongelmasta (raakakeskustelu → Tehty/Todettu/Päätökset), jota ei ole mitattu. Konteksti on suurempi kuin E2:ssa, mutta Haikun C-laatu ei ole tiedossa raakakeskustelusta.
- Syöte: käyttäjän viestit, AskUserQuestion-vastaukset, pääistunnon teksti ja commit-viestit. Työkalujen tulosteet jätetään pois, mikä on rajaus, joka on mitattava (Todettu-kohdat nojaavat usein tulosteisiin).
- Halpa mittaus ilman koodimuutoksia (M6:n tapaan): valmiiden scopes-istuntojen transkriptit toistetaan Haiku-istuntoon pakettien rajoista, ja rivejä verrataan Sonnetin todelliseen commitiin.

## M8 E3-toistomittaus (16.10.2026, ali-agentti, --kuiva erillisissä worktreissä)

Aineisto: 5 scopes-istuntoa (purascript ×2, notifications, lista, pakkaascripti) ja niiden 22 pakettirajaa. Muunnos V1 = keskustelu ilman työkalutulosteita, V2 = sama plus tulosteet katkaistuna 1500 merkkiin. Kumpikin ajettiin pysyvänä Haiku-istuntona (`--session-id`, `--resume`), ja erät yhdistettiin muistioksi, joka ajettiin `pakkaa-vaiheet.mjs --kuiva --malli claude-haiku-5-5`. Lokit: `/tmp/claude-1000/-home-user-palvelin/54724e77-b17f-4054-8016-4b29b826aad3/scratchpad/m8/` (häviää istunnon mukana).

| | V1 | V2 |
|---|---|---|
| Haiku-erät, virheet | 22, 0 | 22, 0 |
| Per erä: välimuistikirjoitus, -luku, tulos | 5,5 k, 46 k, 1,7 k | 9,7 k, 63 k, 2,2 k |
| Kesto per erä | 9,5 s | 12 s |
| Kulu yhteensä (22 erää), per erä | 0,054 $, 0,0024 $ | 0,081 $, 0,0037 $ |
| pakkaa-vaiheet ok | 5/5 | 4/5 (C ei korjaantunut 4 kierroksella) |
| C-hylkäyksiä per ajo | 2,8 | 1,25 (ilman epäonnistunutta) |
| Sonnet-commitin rekisterikohdat tavoitettu | 19/33 = 58 % | 14/33 = 42 % |
| Päätökset ja Todettu pääistunnon muistiosta | 10/15 ja 13/24 | 10/15 ja 18/24 |

- Kulu (tarkistettu usage.jsonl:stä; `total_cost_usd` on istunnossa kumulatiivinen, joten summa on otettu viimeisistä kutsuista): kiinteä kehote noin 37 k tulee välimuistista jo ensimmäisellä kutsulla. E3 on siis halpa, kuten M7 arvioi.
- Laatu ei riitä. Haiku kirjasi 2–3 kertaa Sonnetin määrän päätöksiä ja rivejä, esimerkiksi oireettomat V-423–V-427 sekä "Pakkaus | kesken" -rivin, joka on vuotanut pakkausprosessista. Lisäksi se poisti rivejä ilman korvaajaa tai palautti suljettuja rivejä avoimiksi.
- Juurisyy: Haiku ei näe rekisteriä, joten rivin identiteetti katoaa. Poistot osuivat oikein, mutta lisäykset ja korvaukset menivät vikaan.
- Tulosteet (V2) toivat Todettu-kohtia mutta eivät rivitason osumia, ja lisärivit ja hylkäykset lisääntyivät. Pääistunnon sisäiset päätökset puuttuvat kummastakin muunnoksesta, koska ne eivät näy keskustelussa.
- Commit-tunnisteita ei keksitty: kaikki muistioiden hashit löytyvät transkriptista.
- Mittaamatta: erä kerrallaan ajettu pakkaa-vaiheet, HISTORIA-vertailu, välimuistin vanheneminen sekä se, korjaako rekisterin antaminen Haikulle identiteettivirheet.

Johtopäätös: E3 sellaisenaan ei kelpaa, vaikka kulu on mitätön. E1 (M6: ei rivivirheitä) on ainoa mitatusti riittävä lähde. E3:n halvin korjausyritys on antaa Haikulle rekisterin A/B/C-osat jokaisessa tarkistuspisteessä.

## M9 E3 rekisterillä (16.10.2026, ali-agentti, samat 5 istuntoa ja 22 pakettirajaa)

V3 = M8:n V1, johon on lisätty jokaiseen tarkistuspisteeseen rekisterin Päätökset-, Avoimet asiat- ja Viat-luvut sellaisina kuin ne olivat istunnon alussa (`git show <pakkauscommit>^:<rekisteri>`). Ohjeeseen lisättiin kehotus viitata riviin sen ensimmäisellä sarakkeella.

| | V1 | V3 |
|---|---|---|
| Kulu yhteensä, per erä | 0,054 $, 0,0024 $ | 0,058 $, 0,0026 $ |
| pakkaa-vaiheet ok, C-hylkäyksiä per ajo | 5/5, 2,8 | 5/5, 1,6 |
| Sonnet-commitin rekisterikohdat | 19/33 (58 %) | 18/33 (55 %) |
| Ylimääräisiä päätöksiä ja rivejä (Sonnet 15 ja 15) | 42 ja 33 | 45 ja 31 |
| Poisto ilman korvaajaa, väärä korvaus tai tila | 2, 5 | 0, 6 |

- Rekisteri korjasi rivin identiteetin: rivit muokattiin paikallaan, eikä yhtään riviä poistettu ilman korvaajaa. Se ei korjannut tilaa: ratkenneet asiat jäivät auki (s1, s2, s5), ja yksi rivi keksittiin (s4).
- Sisältöpuute ja ylituotanto pysyivät: pääistunnon sisäiset päätökset eivät näy syötteessä, ja kopiobulletteja tuli edelleen kolminkertaisesti.
- C-hylkäykset vähenivät 43 % ja pakkaa-vaiheet nopeutui noin 20 %.
- Rajoitus: yksi ajo per muunnos ja käsin koodattu 33 kohdan rubriikki, joten 19 vs 18 on kohinaa.

Johtopäätös: E3 ei kelpaa rekisterilläkään. Kattavuus jää noin 55 %:iin, koska Haiku ei näe pääistunnon harkintaa, ja ylituotanto kolminkertaistaa rivit. E1 (M6) on ainoa mitatusti riittävä erän lähde.

## M10 Haikun virheiden juurisyy (analyysi 16.10.2026, M8/M9-lokeista)

Käyttäjän kysymykset: saako Haiku saman purkutiedon kuin pääkeskustelu, ja tarvitseeko Haiku oman rekisterin?

**Mitä Haiku sai ja mitä ei (V3):** se sai purkuraportin pääistunnon ensimmäisenä viestinä (s1/delta1.v1.txt), rekisterin Päätökset-, Avoimet- ja Viat-luvut istunnon alun tilassa sekä 2,5 k:n ohjeen (ohje3.txt). Siltä puuttuivat purkutiedoston ohjeet, rekisterin Tarkoitus ja raja -luku ja SEURAAVA-rivi, TYOTAVAT.md, pääistunnon lukemat tiedostot (esim. SUUNNITELMA.md; V1 jättää työkalutulosteet pois) sekä pääistunnon sisäiset päätökset, jotka eivät näy tekstinä.

**Juurisyyt:**
1. **Mittaustapa yhdisti erät, ja erät kantoivat välitiloja.** Haiku toisti jokaisessa erässä kaikki avoimet rivit, vaikka ohje kielsi sen: s5:n `Nykyisen pakkauksen mittaus` esiintyy erissä 2–7. Haiku myös loi ohimeneviä rivejä, kuten `Ali-agentin kartoitus | käynnissä` (erä 3) ja `R-muodon kustannusvertailu | käynnissä` (erä 4), joita mikään myöhempi erä ei sulkenut. merge.mjs säilytti rivin, ellei sama avain toistunut, ja Päätökset-luvussa se poisti vain sanatarkat kaksoiskappaleet. Siksi välitilat jäivät auki ja uudelleen muotoillut päätökset kolminkertaistuivat. Pääistunnon muistio on sen sijaan pakkaushetken tilannekuva, joka ei kanna välitiloja.
2. **Tila oli istunnon alun tilannekuva.** V3:n rekisteri ei päivittynyt erien välillä, joten Haiku ei nähnyt omia aiempia muutoksiaan rekisterissä. Tämä selittää, miksi identiteetti korjaantui mutta tila ei.
3. **Syötteestä puuttui tietoa.** Pääistunnon sisäiset päätökset ja tiedostoista luetut faktat eivät näy V1:ssä (M8: s3, s4). Konteksti ei korjaa tätä kokonaan.

**Vastaus:** Haiku ei saa samaa purkutietoa kuin pääkeskustelu, ja oma kirjanpito tarvitaan. Mittaamatta on vielä, kumpi kirjanpito toimii:
- (a) **juokseva muistio:** Haiku kirjoittaa joka pisteessä koko muistion tilannekuvana uudelleen, ja vain viimeinen käytetään.
- (b) **elävä rekisteri:** erä ajetaan rekisteriin heti, ja seuraava piste saa päivitetyn rekisterin.

**Käyttäjä 16.10.2026:** mitataan molemmat (paketti CONTEXT-PAKKAASCRIPTI-M11).

### M11 mittaussuunnitelma (ajettu 16.10.2026, tulos alla)

- Aineisto ja työkalut: M8:n kopio `~/.local/state/pakkaascripti/m8/`, jossa ovat brief.md, s1..s5 (istunnot, pakkauscommitit ja pakettirajat), run-haiku*.mjs, merge.mjs, rows.mjs, cost.mjs ja usage.jsonl. Samat 5 istuntoa, 22 pakettirajaa ja 33 kohdan rubriikki.
- Yhteinen alkukonteksti molemmille muunnoksille: ensimmäiseen kutsuun purkutiedosto (tai purkuraportti), koko REKISTERI.md pakkauscommitin vanhemmasta, claude/TYOTAVAT.md, muistiopohja ohjeineen (pakkaa-alku.mjs:282-296, Infra/skills/pakkaa/SKILL.md:19) ja skoopin SUUNNITELMA.md, jos se on olemassa. Syöte V1 (ilman työkalutulosteita).
- **V4a juokseva muistio:** jokaisessa pisteessä Haiku kirjoittaa koko muistion tilannekuvana uudelleen. Vain viimeinen ajetaan `pakkaa-vaiheet --kuiva` -komennolla, eikä merge.mjs:ää käytetä.
- **V4b elävä rekisteri:** jokaisessa pisteessä Haiku kirjoittaa erän, ja erä ajetaan heti `pakkaa-vaiheet` ilman `--kuiva`-lippua erillisessä worktreessä, joka on tehty pakkauscommitin vanhemmasta. Seuraava piste saa worktreen päivitetyn REKISTERI.md:n, ja lopputilaa verrataan Sonnet-commitiin.
- Mitattavat kuten M9:ssä (kulu viimeisen kutsun `total_cost_usd`:sta, ok-ajot, C-hylkäykset, kohdat x/33, ylimääräiset rivit, väärät tilat) sekä V4b:lle kesto per piste. `env -u CLAUDE_CODE_SESSION_ID`, timeout ja worktreen status tallennetaan ennen poistoa.

## M11 tulos: V4a juokseva muistio ja V4b elävä rekisteri (16.10.2026, ali-agentti)

Aineisto oli sama kuin M8/M9:ssä: 5 istuntoa (s1 purascript f1041a10, s2 notifications 91b9ecce, s3 purascript 928a30db, s4 lista c4af9425, s5 pakkaascripti 0d093cfc) ja 22 pakettirajaa. Alkukontekstina olivat koko REKISTERI.md, TYOTAVAT.md, muistiopohja ja SUUNNITELMA.md, ja syötteenä V1. Rubriikki laadittiin uudelleen Sonnet-commitien REKISTERI.md-diffeistä: 33 kohtaa, ja V1 ja V3 pisteytettiin samalla rubriikilla. **Poikkeama suunnitelmasta:** V4b ajoi pakkaa-vaiheet `--kuiva`-tilassa ja sovelsi DIFF-osan worktreen rekisteriin `git apply`:lla. Ilman `--kuiva`-lippua ideat-sulku committaisi ja pushaisi jaetun ideakirjan ja kirjoittaisi oikeaan siirtotilaan (pakkaa-vaiheet.mjs:755-815). Lokit: `/tmp/claude-1000/-home-user-palvelin/312c2d24-643d-4ca0-b9fa-edd9e9d9a604/scratchpad/m11/` (häviää istunnon mukana).

| | V1 | V3 | V4a | V4b |
|---|---|---|---|---|
| Haiku-kulu yhteensä (22 erää) | 0,054 $ | 0,058 $ | 0,092 $ | 0,060 $ |
| Per erä: kirjoitus, luku, tulos | 5,5 k, 46 k, 1,7 k | 6,6 k, 51 k, 1,6 k | 9,6 k, 67 k, 3,2 k | 5,2 k, 69 k, 2,0 k |
| pakkaa-vaiheet ok | 5/5 | 5/5 | 5/5 | 22/22 |
| C-hylkäykset | 2,8 per ajo | 1,6 per ajo | 3,2 per ajo | 1,7 per vaihe-ajo (7,6 per istunto) |
| Kohdat x/33 (uusi rubriikki) | 17 | 19 | 15 | 16 |
| Ylimääräisiä päätöksiä ja rivejä (Sonnet 15 ja 15) | 42 ja 33 | 45 ja 31 | 33 ja 29 | 49 ja 27 |
| Ratkennut jäi auki (5:stä, proxy) | 3 | 2 | 3 | 1 |
| pakkaa-vaiheiden Haiku-tokenit | 1,74 M | 1,18 M | 1,91 M | 5,27 M |
| Kesto per piste | – | – | – | Haiku 12,6 s ja pakkaa-vaiheet 83 s (22–161 s) |

- Kumpikaan kirjanpito ei ohita V3:a (15 ja 16 vs 19/33). Ajoja oli yksi per muunnos, joten ±2 kohtaa on kohinaa.
- Sisältöpuute ei korjaannu kontekstilla: s3:n kohdat 21 ja 23–26 sekä s2:n kohdat 14–17 puuttuvat kaikilta muunnoksilta. Pääistunnon sisäinen harkinta ei näy syötteessä (M10:n juurisyy 3).
- V4a vähentää ylituotantoa (33 päätöstä, 0 kaksoiskappaletta), mutta kulu nousee 58 % ja C-hylkäykset kaksinkertaistuvat. Tila menee silti väärin: s2:n ja s4:n kesken-rivit jäivät auki.
- V4b maksaa saman kuin V3, ja ratkenneita jäi auki vähiten (1/5). Päätöksiä tulee kuitenkin eniten (49), koska Päätökset-luku kertyy erä erältä. pakkaa-vaiheet ajetaan 22 kertaa 5:n sijaan (5,3 M tokenia ja noin 83 s per piste).
- Mittaamatta jäivät toistot, pakkaa-vaiheiden kulu dollareina, välimuistin vanheneminen ja HISTORIA-vertailu.

Johtopäätös: täysi alkukonteksti ja oma kirjanpito eivät nosta E3:n kattavuutta yli noin 50–58 %:n. Puuttuva osa on pääistunnon harkintaa, jota syötteessä ei ole. E1 (M6: pääistunto kirjoittaa erän muistion) on edelleen ainoa mitatusti riittävä erän lähde.


## Käyttäjän linjaus 16.10.2026 (M11:n jälkeen)

Hybridi tehdään, eikä sitä enää kyseenalaisteta, ellei löydy keinoa saada se toimimaan täysin skriptipohjaisesti. Pääistunto ei kirjoita mitään ylimääräistä (hidastaa ja nostaa hintaa), joten E1:n erämuistio putoaa pois. Ensin tehdään välivaihe Sonnetilla. Pelkkä CLI-istunto, jossa Remote Control korvataan omilla ratkaisuilla, suunnitellaan kunnolla, ja ensimmäinen vaihe on sen esitietojen mittaus (M12).

## M12 CLI-istunnon esitiedot, vaihe 1 (16.10.2026, pääistunto, vain luku)

Kysymys: tallentuuko pääistunnon harkinta transkriptiin, josta skripti voisi syöttää sen Haikulle tai Sonnetille?

Aineisto: kaikki `~/.claude/projects/*/*.jsonl` viimeisen 7 päivän ajalta, ja harkintalohkoksi, jossa on tekstiä, laskettiin lohko, jossa on yli 40 merkkiä.

| entrypoint, malli | tiedostoja | harkintalohkoja | joissa tekstiä |
|---|---|---|---|
| cli, Opus 5.5 | 238 | 7901 | 710 (9 %) |
| cli, Sonnet 5.5 | 15 | 552 | 34 (6 %) |
| cli, Fable 5.1 | 6 | 220 | 16 (7 %) |
| sdk-cli (claude -p), Haiku 5.5 | 617 | 2402 | 0 |
| sdk-cli, Sonnet 5.5 | 681 | 857 | 14 |
| sdk-cli, Opus 5.5 | 14 | 473 | 49 |

- Kaikki viikon cli-istunnot, joissa on vähintään 10 harkintalohkoa, ovat Remote Control -istuntoja (`bridgeSessionId` jokaisella rivillä). Ilman bridgeä on vain 3 cli-tiedostoa (9 lohkoa, 0 tekstiä), joten vertailupohjaa ei ole.
- Remote Control ei siis estä tallennusta: osa lohkoista tallentuu tekstinä, valtaosassa on vain allekirjoitus. Tämän istunnon (1411071e) tekstilohkot olivat 112–457 merkkiä, ja sama teksti on myös `api-request-blob`-riveillä.
- Allekirjoituksen pituus ei erottele (Opus cli, 3 pv): tekstilohkojen mediaani 1236 merkkiä (p10–p90 1092–2212), tyhjien 1324 merkkiä (952–2856). Harkinnan pituus ei siis yksin selitä tallentumista.
- Auki: mikä ratkaisee, tallentuuko lohko tekstinä (pituus, vuoron tyyppi vai asetus), ja tallentaako tavallinen CLI-istunto enemmän.

## M12 vaihe 2: tavallinen CLI-istunto ilman Remote Controlia (16.10.2026, pääistunto)

Ajo: `claude --model claude-opus-5-5 --permission-mode acceptEdits` tmuxissa scratchpad-hakemistossa (ei bridgeä: `bridgeSessionId` puuttuu, entrypoint cli). Tehtävänä oli kuusi peräkkäistä tiedostokirjoitusta, joista jokainen perusteltiin edellisen tuloksen pohjalta (41 s). Transkripti: `~/.claude/projects/-tmp-claude-1000--home-user-palvelin-1411071e-…-scratchpad-m12cli/ac6d2d36-….jsonl`.

Tulos: harkintalohkoja oli 5, ja niistä yhdessä oli tekstiä (61 merkkiä). Muissa oli vain allekirjoitus, eli kuvio on sama kuin Remote Control -istunnoissa.

Johtopäätös: Remote Control ei ole syy siihen, että harkinta puuttuu transkriptista, eikä pelkkä CLI-istunto tuo sitä näkyviin. Otos on pieni (5 lohkoa), mutta mekanismi on sama: teksti jää pois ja allekirjoitus säilyy. Siirtyminen tavalliseen CLI-istuntoon ei siis ratkaise E3:n sisältöpuutetta. Jos siirtymälle on muita perusteita, ne suunnitellaan erikseen.

Alkuperäinen suunnitelma (tehty yllä): kontrolloitu vertailu, jossa sama lyhyt tehtävä ajetaan tavallisessa tmux-CLI-istunnossa ja Remote Control -istunnossa samalla mallilla ja verrataan tekstilohkojen osuutta. Lisäksi selvitetään asetukset, jotka vaikuttavat harkinnan näyttämiseen.

## M13 E3 Sonnetilla (käyttäjän valinta 16.10.2026, ajossa)

Sonnet-välivaihe = E3, jossa rinnakkainen istunto ajetaan Sonnetilla (hylätty: Sonnet pakkaushetkellä). Mittaus V5 on V3 (Haiku 19/33), mutta istunto ja pakkaa-vaiheet ajetaan mallilla claude-sonnet-5-5. Aineisto ja rubriikki ovat M11:n (kopioitu pysyvästi `~/.local/state/pakkaascripti/m11/`), brief `brief-m13.md`, kulukatto 6 $.

### M13 tulos (16.10.2026, Sonnet-ali-agentti; pisteet ja kulu tarkistettu pääistunnossa)

| | V3 Haiku | V5 Sonnet |
|---|---|---|
| Rinnakkaisen istunnon kulu (22 erää) | 0,058 $ (0,0026 $/erä) | 0,987 $ (0,045 $/erä), 17-kertainen |
| Per erä: kirjoitus, luku, tulos | 6,6 k, 51 k, 1,6 k | 7,9 k, 48 k, 0,8 k |
| Kesto per erä | 11,0 s | 9,9 s |
| pakkaa-vaiheet ok, kesto | 5/5, 63–190 s | 5/5, 47–63 s |
| C-hylkäykset per ajo | 1,6 | 1,4 (kaikki korjautuivat ensimmäisellä uusinnalla) |
| Kohdat x/33 | 19 | 18 |
| Ylimääräisiä päätöksiä ja rivejä (Sonnet-commit 15 ja 15) | 45 ja 31 | 31 ja 21 |
| Ratkennut jäi auki (5:stä) | 2 | 1 |
| pakkaa-vaiheiden tokenit | 1,18 M | 0,99 M |

- Kattavuus ei nouse: M11:ssä kaikilta puuttuneista kohdista V5 tavoitti vain s2 #17. s3:n T6d–T6g jäivät maininnaksi (m13/s3/v5.muistio.md:28). Ero ±1 on kohinaa (1 ajo per muunnos).
- Sonnet vähentää ylituotantoa (päätökset 45 → 31, rivit 31 → 21) ja nopeuttaa pakkaa-vaiheita.
- Kaikissa ajoissa, myös V3:ssa: `KESKEN: VIRHE — rivi 'Viimeinen viesti' puuttuu` (m13/s3/v5.vaiheet.out:77). Tämä on mittausjärjestelyn puute, ei V5:n.
- Mittaamatta: pakkaa-vaiheiden dollarikulu ja toistot. Lokit ovat hakemistossa `~/.local/state/pakkaascripti/m11/m13/`.

Johtopäätös välivaiheelle: Sonnet-erät kattavat noin 55 % rekisterikohdista ja vähentävät ylituotantoa. Loput noin 45 % on pääistunnon harkintaa, joka on saatava rekisteriin pakkaushetkellä ilman ylimääräistä kirjoitusta.

## Käyttäjän linjaus 16.10.2026 (M13:n jälkeen)

Pääistunto ei harkitse pakkausta lainkaan, vaan koko pakkaus tapahtuu sivuistunnossa. Ajotapa on A2 taustalla. Välivaiheen suunnittelussa ratkaistava ongelma on, mistä sivuistunto saa sen noin 45 %, joka M8–M13:ssa puuttui, kun harkinta ei tallennu transkriptiin (M12).
