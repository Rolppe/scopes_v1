# scopes/context/purascript/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — ei avoimia tehtäviä: uuden scopes-skoopin purkajavalinta korjattu 15.10.2026 (d0faad89); PURA-MALLITON valmis kokonaan 15.10.2026 (T6g 2ec02bb7)

## Tarkoitus ja raja

mallivapaa purku: skripti tekee valmiin purkutiedoston uuden keskustelun alkuun; ensin äpin testitoimintona scopes infralle (käyttäjä 14.10.2026). Raja: nykyinen /pura ei muutu; testitoiminto sallitaan vain skoopille scopes infra. Yläskooppi scopes context (lähtökontekstin keventäminen) mittasi lähtötilanteen: scopes/context/REKISTERI.md.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes context purascript` luotiin komennolla `/pura uusi scopes context purascript`.
- **Käyttäjä 14.10.2026:** mallivapaa purku: skripti tekee valmiin tiedoston, joka annetaan uudelle keskustelulle alussa (ei ali-agenttia, ei claude -p:tä).
- **Käyttäjä 14.10.2026:** ensin vain äpin omana testiominaisuutena, rajattuna skooppiin scopes infra.
- **Käyttäjä 14.10.2026:** ominaisuus tehdään omassa skoopissaan scopes context purascript.

- **15.10.2026:** Käyttäjä 15.10.2026: tässä skoopissa tehdään mallittoman pura-skriptin testiversio; suunnitellaan ja otetaan käyttöön localregister-järjestelmän kanssa scopes-skoopeille. Paketin polut muissa skoopeissa ovat tarkoituksellisia (OMISTAJA VÄÄRÄ SKOOPPI ei estä).

- **15.10.2026:** Käyttäjä 15.10.2026: rajaus koko scopes/-perhe (hylätty: vain scopes infra).

- **15.10.2026:** Käyttäjä 15.10.2026: rekisterin lähde localregister (lr.mjs tulosta), git varareittinä (hylätty: gitin REKISTERI.md).

- **15.10.2026:** Käyttäjä 15.10.2026: pura-scripti otetaan käyttöön myös muiden kuin Claude-agenttien keskusteluihin: agy ja paikallisten mallien projektit. → Ydin agenttiriippumaton JSON + kohdekohtainen md (claude/neutraali); uusi vaihe T5.

- **15.10.2026:** Käyttäjä 15.10.2026: "Päivitä ja aloita T1"; palvelun uudelleenkäynnistys "Agentti käynnistää nyt".

- **15.10.2026:** Purkutiedostot gitin ulkopuolelle ~/.local/state/pura/ (claude/siirto/state/pura ei ole gitignoressa; muut agentit samalla koneella löytävät absoluuttisen polun).

- **15.10.2026:** Koeajo ajettiin palvelureitillä eikä odotettu käyttäjän napinpainallusta (TYÖTAVAT 20, tee itse ennen luovutusta): reitti on sama kuin napin (Nakymat.swift:88 → pura-testi), ja nappi itse on testattu simulaattorissa T3:ssa (438b6929). Puhelimen napin painallus jää valinnaiseksi päästä päähän -varmistukseksi käyttäjälle.

- **15.10.2026:** pura-malliton.mjs:n korjaus kuuluu skoopille claude siirto (claude/siirto/tools/): ei korjattu täältä, kirjattu V-428.

- **15.10.2026:** T4B pysyy SEURAAVA-pakettina: V-428 ei korjattu, napin tulos ei korvaa korjattua uusintaa. Ei automaattinen-merkintää (odottaa toista skooppia).

- **15.10.2026:** Muiden keskustelujen likaiset tiedostot (vaihevirheet.jsonl, delegation.jsonl, expresso __pycache__, agy/universaltools/infra oneplus -rekisterit) eivät ole tämän session työtä: ei vika.sh-kirjausta, ei pakata.

- **15.10.2026:** Käyttäjä 15.10.2026: V-428 korjataan ensin (valinta "Korjaa V-428 ensin"); pääistunto korjasi sen tässä keskustelussa omistajan claude siirto tiedostoon ja ilmoitti omistajalle V-431:llä.

- **15.10.2026:** Jäännös (sa päällä -rivi) korjattiin heti, mutta testipurkua ei uusittu: uusinta vaatii uuden testi-istunnon; tarkistus seuraavan testipurun yhteydessä (T5).

- **15.10.2026:** Käyttäjä 15.10.2026 (AskUserQuestion, valinta "Odota korjauksia (suositus)"): T5 odottaa claude siirron V-438- ja V-440-korjauksia, sitten T5 ajetaan uudelleen (agy + qwen3.5:9b); pakataan nyt, T5 osittain (agy-osa ok). Hylätyt: skripti esittää raportin ja kysymyksen itse paikalliselle mallille (uusi T6), isompi paikallinen malli.

- **15.10.2026:** V-438 korjattiin tästä skoopista claude siirron tiedostoon käyttäjän suoran pyynnön perusteella (vrt. V-428-ennakko); omistajalle ilmoitus vika.sh:lla.

- **15.10.2026:** Vanhentuneen LR:n käsittely = väliaikainen kopio + `uudelleentuo` (sama kolmitiesääntö kuin palvelulla, ei kirjoita LR:ään). Hylätyt: palvelun `/api/lr/tiiviste`-kutsu tuonnin laukaisuun (vaatii avaimen ja palvelun, pura-testi kutsuisi palvelua sen omasta lapsesta), pelkkä git-varareitti (hukkaisi äpin viemättömät muokkaukset).

- **15.10.2026:** Äpissä synkka ennen vain testipurkua (`.puraTesti`), ei pura/pakkaa-toimintoihin (rajaus pyyntöön).

- **15.10.2026:** Käyttäjä 15.10.2026: testipurun päästä päähän -todennus ajetaan agentin toimesta simulaattorissa (ei käyttäjän puhelimella).

- **15.10.2026:** Koeskooppi scopes chat question (perusteet yllä); hylätty scopes context (automaattivalinta).

- **15.10.2026:** Siivous palvelun API:n kautta teardownissa (ei UI:n kautta), koska UI-siivous ei aja kaatuessa; hännän palautus toistaa äpin Lr.poista-logiikan, jottei taulukon perän tyhjä rivi katoa.

- **15.10.2026:** Ajon 1 vahinko (tyhjän rivin katoaminen toisen skoopin rekisteristä) korjattiin heti itse, koska se oli tämän session testin aiheuttama.

- **15.10.2026:** Korjaus testiin, ei äppiin: paketin tehtävä oli odotuksen korjaus; äpin käytettävyysvika (tulos näytön alla) kirjattiin omistajalle V-472 (scopes infra), koska Nakymat.swift ei ole tämän skoopin polku skooppitarkistuksessa.

- **15.10.2026:** Käyttäjä 15.10.2026: orvot rivit selvitetään ja suljetaan tai niistä tehdään paketti, sitten pakataan (valinta "Orvot rivit (suositus)"; hylätyt: "Suunnittele T6" eli käyttöönotto testinapin ulkopuolelle, "Pakkaa nyt").

- **15.10.2026:** T1-rajoitukset suljetaan: (1) kenttien lähteet LR/git ovat V-438:n jälkeen yhtenevät, T4B- ja T5-tulosteet oikein; (2) --rd-tuki tarpeeton testinapissa (se ei välitä --rd:tä) — tarve vasta, jos malliton purku otetaan autovaihtoon; (3) TEHTY koko/osa -heuristiikka ei virheillyt T4–T5:ssä — arvioidaan uudelleen vain /pura-käyttöönoton yhteydessä.

- **15.10.2026:** PURASCRIPT-ISTUNNOT tehdään tässä skoopissa (käyttäjä 15.10.2026: paketin polut muissa skoopeissa ovat tarkoituksellisia); ei korjattu heti, koska scopes/palvelu/toiminnot.mjs oli likainen toisen keskustelun muutoksista.

- **15.10.2026:** T5 vahvistettu think false -asetuksella; aiemmat ajot käyttivät oletusajattelua (6,4 k merkkiä ajattelua, tyhjä vastaus oletus-num_ctx:llä).

- **15.10.2026:** palvelua ei käynnistetä uudelleen (jo käynnistynyt 17.09 korjauksen jälkeen).

- **15.10.2026:** käyttäjä: todennus ajetaan agentin toimesta (scopes testit; sitten vahti 60 min). Molemmat tuloksetta → todennus jää seuraavaan pura-testiin (puhelimen testinappi) skoopille, jossa on pakattu auki oleva istunto.

- **15.10.2026:** Toisten keskustelujen likaisia tiedostoja (VIERAS-rivit) ei kirjattu /vika-reitillä: ne ovat samanaikaisten istuntojen keskeneräistä työtä, eivät tämän session muutoksia.

- **15.10.2026:** Kutsujan tunnus viedään ympäristömuuttujalla (SIIRTO_OMA_ISTUNTO) eikä `--oma`-lipulla, koska istunto.sh:ta kutsuu pura-faktat.mjs `claude -p` -lapsen sisältä; muuttuja periytyy lapsen Bash-työkaluun. `:-`-oletus säilyttää uloimman kutsujan sisäkkäisissä ajoissa.

- **15.10.2026:** Käyttäjä 15.10.2026: T6 kirjoitetaan uudelleen kokonaan skriptipohjaiseksi ("Kirjoita uudelleen (suositus)") ja hyväksytään ("Hyväksy, aloita T6a (suositus)"). Hylätty: ensimmäinen T6-luonnos (Haiku-varareitti exit 2/3, --ajaja=, katkaisin; /pura-runko latautuu). Seuraus aiempaan päätökseen SCOPES-PURA-MALLI: purkajavalinta piilotetaan scopes-skoopeilta (T6e), istunnon malli säilyy valittavana.

- **15.10.2026:** T6a tehtiin pääistunnossa eikä toteuttaja-ali-agentilla (SUUNNITELMA.md "Toteutus: toteuttaja-ali-agentti briefillä"): muutos oli ~40 riviä ja tarkistettiin heti; CLAUDE.md: "muokkaus joka tarkistetaan heti" = tee itse.

- **15.10.2026:** "Selvä koko-osuma" tulkittiin: otsikossa paketin tunnus eikä vain kuvauksen V-tunnus.

- **15.10.2026:** T6b ja T6c tehtiin pääistunnossa eikä toteuttaja-ali-agentilla (SUUNNITELMA.md T6 "Toteutus"): muutokset pieniä ja heti testattavia (CLAUDE.md: muokkaus joka tarkistetaan heti).

- **15.10.2026:** `pura-testi`-toiminto ja -reitti jätettiin aliakseksi (`pura`) poistamisen sijaan: äpin testinappi (scopes/ios/Sources/Nakymat.swift:90, Malli.swift:180) kutsuu sitä yhä, ja poisto ilman Swift-muutosta rikkoisi napin. Poisto kuuluu T6e:hen yhdessä napin kanssa.

- **15.10.2026:** Scopes-palvelua ei käynnistetty uudelleen (TYOTAVAT 22: vain erillisellä luvalla), joten T6b ei ole vielä voimassa ajossa olevassa palvelussa. autovaihto.sh on voimassa heti (skripti luetaan joka ajossa) — tämän session oma autovaihto on T6c:n ensimmäinen todellinen ajo.

- **15.10.2026:** Poikkeama suunnitelmasta (T6D): purkutiedosto luetaan `cat`-komennolla eikä Read-työkalulla, koska Read työhakemiston ulkopuolelta (~/.local/state/pura) voi jäädä odottamaan näkymätöntä lupaa (muisti read-outside-workdir-can-hang). Kirjattu 75ad50e0:n viestiin.

- **15.10.2026:** T6E: uuden skoopin näkymän purkajavalinta jätettiin ennalleen (skoopin perhettä ei tiedetä ennen luontia; /pura-jakaja pudottaa `--ajaja=`:n perheeltä joka tapauksessa).

- **15.10.2026:** T6E: LrUITests-testipurkutesti poistettiin korvaamisen sijaan (testasi vain poistettua nappia).

- **15.10.2026:** T6f tehtiin pääistunnossa eikä toteuttaja-ali-agentilla (SUUNNITELMA.md T6 "Toteutus"): ajot ja vertailu vaativat harkintaa, korjaus pieni ja heti testattu (CLAUDE.md: muokkaus joka tarkistetaan heti).

- **15.10.2026:** "ei mitään"-SANO-rivin sanamuotoa ei muutettu skriptissä: se koskisi molempia reittejä (MALLIREITTI omistaa claude siirto pura); huomio V-507:ssä.

- **15.10.2026:** Äpin Pura ajettiin curlilla samaan palvelun endpointiin kuin äppi (ei napautusta puhelimessa): reitti on palvelinpuolella, ja agentti pystyi ajamaan sen itse.

- **15.10.2026:** Käyttäjä valitsi 15.10.2026 ajaa vapaaehtoisen xcode-select-korjauksen (vaihtoehto "jätetään ajamatta" hylättiin).

- **15.10.2026:** uuden skoopin näkymässä perhe tunnistetaan nimestä (ensimmäinen sana `scopes`), koska rekisteriä ei vielä ole; luo-skooppi.mjs vie `scopes <ala>` polkuun scopes/<ala>/. Hylätty: erillinen "Skripti"-purkajavaihtoehto (skripti ei pura muita kuin scopes/-rekistereitä, exit 3).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Suunnitelma PURA-MALLITON | valmis 15.10.2026 (suunnitelma hyväksytty, SUUNNITELMA.md, 7f8bc8d8; T6 hyväksytty 7b1b0f32); T1 d929639b, T2 11573880, T3 438b6929 valmiit; T4 ja T4B valmiit (c0f2ab91). T5 valmis 15.10.2026 (V-440 ebfe3447 jälkeen: agy ja qwen3.5:9b ok). T6a valmis 28f3926d 15.10.2026. T6b valmis 5de23dae 15.10.2026 (scopes/palvelu/toiminnot.mjs `pura` kutsuu `pura-malliton.mjs --perhe <nimi>`; exit 0 → `puraMallitta`; muutosilmoitus V-497 scopes siirrolle). T6c valmis fd33998f 15.10.2026 (claude/siirto/tools/autovaihto.sh purkaa scopes-perheen mallitta; muutosilmoitus V-498 claude siirrolle; V-499 scopes yhteydelle). T6d valmis 75ad50e0 15.10.2026 (/pura-taito jakajaksi + MALLIREITTI.md; tiedoksi V-500). T6e valmis 2237152f 15.10.2026 (äpin purkajavalinta piiloon perheeltä, pura-testi pois; tiedoksi V-503/V-504/V-505). T6g valmis 2ec02bb7 15.10.2026 (koeajo: perhe 55–59 k vs. 76 k, raportit sanatarkasti, mallireitti 73 k toimii). **15.10.2026:** pura-malliton.mjs tuotti tälle skoopille claude-md 6 859 merkkiä ja json 6 183 merkkiä (vs. /pura-taidon runko 22,7 k merkkiä + siirtäjämalli); raportin rivit vastaavat nykyisen purun rivejä, ISTUNNOT oikein. **15.10.2026:** `node --test pura-malliton.test.mjs pura-faktat.test.mjs` → 45/45 molempien commitien jälkeen; paikallinen ajo `pura-malliton.mjs "scopes testit" --ei-synkka --ulos <scratchpad>` → exit 0, IDEAT: V- -rivejä 1 (ennen korjausta 2, rivit 19 ja 29). **15.10.2026:** PURA-MALLITON: kaikilla 20 scopes-perheen skoopilla `pura-malliton.mjs "<s>" --kohde neutraali --ei-synkka` exit 0 ja korjauksen jälkeen `LÄHDE: localregister (sama kuin git)` (palvelu oli välissä tuonut infran, LR commit 0fb704ee); jäljessä-polku todennettu vain yksikkötestillä; PURA-MALLITON: `node --test pura-malliton.test.mjs scopes/palvelu/toiminnot.test.mjs`: pass 58, fail 0. **15.10.2026:** pura-malliton.mjs ISTUNNOT-käsittely: claude/siirto/tools/pura-malliton.mjs:568 (Muut istunnot -käsky), :694 ja :711/:726 (istunnot-kenttä). **15.10.2026:** PURA-MALLITON-T6A: `node --test claude/siirto/tools/pura-malliton.test.mjs` tests 43, pass 43, fail 0 (4 uutta T6a-testiä); PURA-MALLITON-T6A päästä päähän: `pura-malliton.mjs "scopes context purascript" --autojatko --rd --ei-synkka --ulos <scratch>` exit 0; md:ssä RD-TILA-rivi ennen AUTOJATKO-riviä ja rd/SKILL.md-sääntö, json:ssa `"rd": true`. **15.10.2026:** pura-malliton.mjs --perhe "scopes context purascript" exit 0, --perhe "claude siirto" exit 1. **15.10.2026:** `node --test claude/siirto/tools/pura-malliton.test.mjs` → tests 43, pass 43, fail 0 korjauksen jälkeen; sama testi HEAD-koodia (f59ae16a) vastaan → fail 1 (testi kaatuu vanhalla koodilla). (todenna viim. 29.10.2026) **15.10.2026:** PURA-MALLITON: palvelin ja /pura eivät tarvinneet muutosta (/pura uusi luo skoopin luo-skooppi.mjs:llä, vaihe 1 purkaa perheen pura-malliton.mjs:llä, --ajaja jää perheeltä pois); vika oli vain äpin näkymässä, T6e jätti uuden skoopin näkymän ennalleen (HISTORIA 2237152f). | Seuraava: ei mitään. Aiemmin: PURASCRIPT-ISTUNNOT korjattu d8928053 15.10.2026, päästä päähän -todennus todennettu 15.10.2026 (V-438 korjattu 79f2b2fd 15.10.2026; V-440 korjattu ebfe3447) |

## Viat

| Vika | Tila |
|---|---|
| SEURAAVA "ei mitään", vaikka tavoite (T5) on kesken (havaittu 15.10.2026): Avoimet-rivit "pura-testi: NIMI/ISTUNNOT" ja "T1-rajoitukset" viittaavat jo tehtyyn T4:ään ("tarkista T4:ssä") eikä niitä siirretty eteenpäin; T5-rivi sanoo yhä "odottaa V-438", vaikka se korjattiin 79f2b2fd:ssä; V-440:lle ei tarjottu korjausvaihtoehtoa, vaikka V-428 ja V-438 korjattiin täältä käyttäjän luvalla; SUUNNITELMA.md:ssä ei vaihetta T5:n jälkeen | korjattu 15.10.2026 (rivit ratkaistu pakkauksessa; SEURAAVA = PURASCRIPT-ISTUNNOT) |
| pura-testin purkutiedoston ISTUNNOT listaa istunnot, jotka pura-testi sulkee heti tiedoston kirjoittamisen jälkeen, ja käskee uutta istuntoa sanomaan, että skoopissa ajaa toinen istunto (todiste ~/.local/state/pura/scopes-testit.md 15.10.2026 09.00; toiminnot.mjs:242-246) | korjattu d8928053 (PURASCRIPT-ISTUNNOT; todennus päästä päähän avoin, ks. Avoimet); odottaa ajoa (todenna viim. 29.10.2026) |
| PURASCRIPT-ISTUNNOT-OMA: aja-siirtaja.sh-reitin ISTUNNOT-rivi nimesi kutsujan toiseksi istunnoksi (havaittu 15.10.2026 tämän session purussa) | korjattu e5e2c106 15.10.2026 (todennus ks. Avoimet); odottaa ajoa (todenna viim. 29.10.2026) |

## Historia

Historia: `scopes/context/purascript/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
