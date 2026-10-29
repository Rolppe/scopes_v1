# scopes/context/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: CONTEXT-A3 — A2:n todennus session 9e53c757 pakkauksesta (ohjeiden lisäys ≤ 8 k tokenia, pakkaa-alku/-loppu toimivat) + autopakkaa/SKILL.md 9,3 k → ≤ 3 k merkkiä + pakkaa-alku.mjs:n session-committitunnistus (ei toisten istuntojen committeja); toteutus Infra/skills- ja claude/siirto/tools-tiedostoihin skoopin rajan mukaan — polut: scopes/context/** — aloitus: /pura scopes context — automaattinen: kyllä

## Tarkoitus ja raja

Skooppi etsii ratkaisuja Claude-skooppien kontekstikoon kasvaneiden pakettien hallintaan käyttäjän johdolla (käyttäjä 14.10.2026). Raja: skooppi ehdottaa, ja käyttäjän hyväksymän muutoksen se toteuttaa itse myös muiden skooppien rekistereihin ja siirtotyökaluihin (käyttäjä 14.10.2026).

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes context` luotiin komennolla `/pura uusi scopes context`.
- **Käyttäjä 14.10.2026 (sanatarkasti):** tarkoitus: "etsit ratkaisuja skooppien kontekstikoon kasvaneiden pakettien hallintaan minun johdollani".
- **Käyttäjä 14.10.2026:** raja: hyväksytyt muutokset toteutetaan itse myös muiden skooppien tiedostoihin ja työkaluihin.
- **Käyttäjä 14.10.2026:** ensimmäinen työ = scopes infra -tutkimus: äppi näyttää tiedostot 19k ja istunto 191k.
- **Käyttäjä 14.10.2026:** ensisijainen kohde = siirron jälkeinen lähtökonteksti; kontekstin muodostuminen työn aikana käsitellään sen jälkeen.
- **Käyttäjä 14.10.2026:** lähtökonteksti käydään läpi osa kerrallaan; ensimmäinen on /pura-taidon runko.
- **Käyttäjä 14.10.2026:** /pura-taidon keventäminen suunnitellaan mahdollisimman pitkälle skriptipohjaiseksi.
- **Käyttäjä 14.10.2026:** tavoite mallivapaa purku: skripti tekee valmiin tiedoston, joka annetaan uudelle keskustelulle alussa; ensin vain äpin omana testiominaisuutena, rajattuna skooppiin scopes infra.
- **Käyttäjä 14.10.2026:** mallivapaa purku tehdään omassa skoopissaan scopes context purascript.

- **14.10.2026:** Käyttäjä 14.10.2026: raja — hyväksytyt muutokset toteutetaan itse myös muiden skooppien tiedostoihin ja työkaluihin.

- **14.10.2026:** Käyttäjä 14.10.2026: ensisijainen kohde siirron jälkeinen lähtökonteksti, osa kerrallaan; kontekstin muodostuminen työn aikana sen jälkeen.

- **14.10.2026:** Käyttäjä 14.10.2026: /pura-keventäminen mallivapaaksi skriptiksi, ensin äpin testitoimintona vain scopes infralle, omassa skoopissaan scopes context purascript.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti CONTEXT-LAHTO.

- **14.10.2026:** Käyttäjä 14.10.2026: CONTEXT-LAHTO käydään yksi osa-alue kerrallaan; pääistunto antaa ensin osa-alueen tiedoston, sitten mietitään yhdessä. Taito- ja työkalulistoille ei tehty vielä mitään.

- **14.10.2026:** Käyttäjä 14.10.2026: purkuraportin kehitys kuuluu skooppiin scopes context purascript ("purku scripti on tekeillä").

- **14.10.2026:** Käyttäjä 14.10.2026: muistin yleissäännöt yksi kerrallaan; pääistunto suosittelee ja ohittaa kysymättä ne, joita se suosittelee ohitettaviksi.

- **14.10.2026:** Peruste (pääistunto, hyväksytty käytössä): yhdistetään vain saman säännön eri tapauksia; fakta tai oma laukaisusana jää omalle rivilleen.
- **14.10.2026:** Käyttäjä 14.10.2026 (sanatarkasti, muistutusten suunnista MUISTUTUKSET.md): "nämä pitää toimia laitteilla skripteinä".

- **14.10.2026:** Käyttäjä 14.10.2026: CONTEXT-LAHDON kohde on skooppi scopes infra (ei scopes context); käsitelty HISTORIA.md, sitten muistutukset.

- **14.10.2026:** Käyttäjä 14.10.2026 (sanatarkasti): "kaikki mitä skoopissa ladataan muistiin pitää näkyä konteksti välilehdellä" (V-400 scopes infralle; ei-ladattu pois, V-399).

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti CONTEXT-LAHTO: muistutukset skripteinä, ensin suunta A.

- **14.10.2026:** Käyttäjä 14.10.2026: "A1 nyt, A2 paketiksi" (suunnitelman suositus).

- **14.10.2026:** Pääistunto: 7b ei omaksi references-tiedostokseen (suunnitelman kohta 2) vaan pakkaa-ohjeen Sessionvaihto-lukuun, koska /automaattisiirto lukee samaa lukua; yksi lähde.

- **14.10.2026:** Pääistunto: myös rd-trigger.sh:n AUTOPACK NOTE muutettiin (suunnitelma ei nimennyt), koska se ohjasi reitittimeen.

- **14.10.2026:** Käyttäjä 14.10.2026: "Palauta autopack=true ja pakkaa (suositus)".

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti CONTEXT-A3 (suositus).

- **14.10.2026:** Käyttäjä 14.10.2026 (sanatarkasti): "älä avaa automaattisesti uuttta keskustelua vaan pakkaa vain" — ei sessionvaihtoa tässä pakkauksessa.

- **14.10.2026:** Pääistunto: A2 toteutettiin ali-agentilla speksin pohjalta (laaja: 2 skriptiä, testit, ohjeen uudelleenkirjoitus).

- **15.10.2026:** Käyttäjä 15.10.2026: vain tilanne, ei töitä nyt.

- **15.10.2026:** Pääistunto ei ajanut pakkaa-alun 19 vika.sh-komentoa: muutokset eivät ole tämän session, joten niiden kirjaaminen omistajille olisi väärä vika (V-008:n tarkoitus ei täyty).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Lähtökonteksti siirron jälkeen | mitattu 14.10.2026: eaceeb10 68 k, 35ab8662 87 k ennen ensimmäistä työtä. Merkkeinä: /pura-taidon runko 21,6 k; taitolista 20,4 k; deferred-työkalulistat 12,6 k (claude.ai Gmail/Drive/Docs); MEMORY.md 7,1 k; agenttilista 4,0 k; MCP-ohjeet 2,1 k; purkutulokset 6–30 k; jäännös (työkalumääritykset, ajattelu) ~22 k tokenia **14.10.2026:** konteksti: lähtö 68 k, pakkaushetkellä 183 k (raja opus-5-5 125 k, rd-trigger.sh:41). **14.10.2026:** Lähtökonteksti, tämä istunto: lähtö 65 k (konteksti-nyt.mjs), pakkaushetkellä 187 k (raja opus-5-5 125 k). **14.10.2026:** A2-pakkaussessio 14.10.2026: lähtökonteksti 65 k (konteksti-nyt.mjs), pakkaushetkellä 159 k (raja opus-5-5 125 k). | CONTEXT-LAHTO |
| /pura-taidon runko 22,7 k merkkiä | mitattu 14.10.2026: 21 lukua, suurimmat Vaihe 3 4,0 k, Vaihe 1 2,3 k, 2f 1,6 k, r&d-tila 1,6 k. Haarojen laukeaminen 14 pv (494 kutsua, 338 raporttia, haarat.py scratchpadissa): harvinaiset (≤17) uusi, rd, VÄÄRÄ SKOOPPI 2, ODOTTAA 8, TEHTY 3, OSITTAIN 0, VANHENTUNUT 1, tuntematon 1, Cowork 0, synkka-haarautuma 8, install 14, KESKEN 6 6, ROSKAT 14; yleiset: NIMI /rename 300, ISTUNNOT 247, autojatko 197, VAATIMUKSET 136, AUTOMAATTINEN 90, KESKEN 5 51, KÄYTTÄJÄLLE 49 **14.10.2026:** purkuraportti mitattu 14.10.2026: mediaani 5,0 k merkkiä, p90 13,3 k, max 16,7 k; osuudet AVOIMET VIAT 21 %, AVOIMET ASIAT 21 %, VAATIMUKSET 10 % (55 raportissa >1 k, max 3,5 k), TYÖTAVAT 9 % (med 530, vakioteksti), TARKISTETTU LÄHTEESTÄ 6 %; RISTIRIIDAT toistuu AVOIMET VIAT -listassa 69 raportissa; /pura Vaihe 2 toistaa raportin pääistunnon ulostulona (714 esitystä, mediaani 5,1 k merkkiä) → raportti kontekstissa kahdesti. **15.10.2026:** mitattu 15.10.2026 (19809159, konteksti-nyt.mjs 04:07Z): ensimmäinen kutsu 55 k (järjestelmä+työkalut+CLAUDE.md+muisti+/pura-taidon teksti), purun raportti 61 k, raportti+sa+kysymys 65 k, 74 k mittaushetkellä; purun oma lisäys ~10 k, kiinteä pohja ~55 k on suurin erä. | siirretty skooppiin scopes context purascript (käyttäjä 14.10.2026), suunnitelma scopes/context/purascript/SUUNNITELMA.md |
| Taito- ja työkalulistat: poistokeinot | mitattu 14.10.2026: taitolista 19,0 k merkkiä/34 taitoa, anthropic-skills 9,7 k (51 %), artifact* 1,1 k, muut 7,7 k. Dokumenttien mukaan (claude-code-guide, ei todennettu täällä): claude.ai-yhteydet `disableClaudeAiConnectors: true`; laajennustaidot `enabledPlugins {"<nimi>@<marketplace>": false}` tai `syncClaudeAiSkills/syncClaudeAiPlugins: false` (vain settings.local.json); sisäänrakennetut taidot `skillOverrides {"dataviz": "off"}` tai `disableBundledSkills`; työkalut `permissions.deny ["Workflow"]` tai `enableArtifact: false`; agentit `Agent(<nimi>)`-deny. Asetus vaihdetaan istunnon alussa (välimuisti) **14.10.2026:** Poistokeinojen asetusavaimet todennettu Claude Code 2.1.299 -binääristä: syncClaudeAiSkills, skillOverrides, disableBundledSkills, disableClaudeAiConnectors ovat olemassa; syncClaudeAiSkills vain arvolla false; mitään ei ole asetettu; settings-muutos on käyttäjän (freeze-guard). LISTAT.md (d70e4236) kuvaa väärää istuntoa (tämän keskustelun oma konteksti, ei scopes infra 35ab8662); ks. Viat. | käyttäjä valitsee poistettavat; LISTAT.md korjattava 35ab8662:n mukaan ennen osa-alueen päätöksiä; settings-muutos on käyttäjän (freeze-guard); todennus `/context` ennen/jälkeen |
| ISTUNNOT-rivi nimeää kutsuvan istunnon itsensä | havaittu 14.10.2026 eaceeb10: ainoa listattu istunto oli tämä; 247/338 raporttia laukaisi vaiheen 2c2 **15.10.2026:** uusi esiintymä 15.10.2026: purun ISTUNNOT-rivi nimesi istunnon itsensä (19809159, pid 26618). | syy todennettu: claude -p -lapsen CLAUDE_CODE_SESSION_ID (istunto.sh:122, pura-faktat.mjs:351 ilman --oma); korjaus kuuluu skooppiin claude siirto pura (/vika-reitti, kun käyttäjä hyväksyy); nykyisen /puran muutos ei kuulu purascriptin rajaan |
| scopes infra -istunto 35ab8662: 191 k | mitattu 14.10.2026 (lahteet.mjs yksi + transkripti): tiedostot 19 k eivät ole pääistunnossa (purku ali-agentissa); kiinteä alku ~47 k (listat 15 k, muistutukset alussa ≈ 14 k, kertynyt ≈ 13 k (MUISTUTUKSET.md), ohjeet 4 k, kehote 4 k) + jäännös 30 k; työkalutulokset 85 k = 47 Bash-tulosta 140 k merkkiä, 8 suurinta (sed/cat-koodiluku, 8–14 k merkkiä kukin) ~78 k merkkiä; 40 min, 1 commit, 1 käyttäjän viesti **14.10.2026:** scopes infra -istunto 35ab8662: mittausmenetelmä scopes/palvelu/lahteet.mjs `yksi`/`kontekstinOsat` (MERKKIA_TOKENIIN 1.8, lahteet.mjs:268); haarat.py oli scratchpadissa, ei säilytetä. **14.10.2026:** 35ab8662 ennen pakkausta (rivi 556, konteksti 194,6 k): muistutukset 26,9 k tokenia; alussa ≈ 14 k (/pura-runko 21,6 k merkkiä = 12 k), työn aikana ≈ 13 k (output_style 59× + total_tokens 58× ≈ 8 k; edited_text_file MEMORY.md ≈ 3,5 k); Pakkaus lisäsi 31 k: autopack kutsui Skill(keskustelun-siirto, "paketoi scopes infra") (35ab8662 rivi 566), jolloin reitittimen runko 51 946 merkkiä (≈ 29 k) latautui pääistuntoon; syy: /pakkaa on disable-model-invocation: true, joten autopack-setting-muisti ohjaa kutsumaan reititintä suoraan; Skooppia "scopes infra context" ei ole (haku rekistereistä, taidoista ja tilasta). **15.10.2026:** 92 scopes-purua 14.–15.10.2026: minimi 64–67 k jokaisessa skoopissa (puhdas purku), mediaani 81 k; maksimit (context 228 k, design 182 k, localregister 210 k) sisältävät paketin työtä AskUserQuestion-vastauksen jälkeen, eivät ole purun kokoa. | käyttäjä valitsi suunnan A (14.10.2026); A1 toteutettu d2555969 + 3fae776, todennus uusi rivi (A1:n todennus) |
| MEMORY.md on hakemistokohtainen: ladataan jokaiseen ~/palvelin-istuntoon (kaikki skoopit), ei r&d2:ssa (oma tyhjä muistihakemisto) eikä muualla käynnistetyissä; vain indeksi ladataan | 14.10.2026: 54 → 43 muistia, MEMORY.md 7 191 → 6 049 merkkiä (Y1, Y3, Y6 + duplikaatit); muistitiedosto avattiin 68/1045 istunnossa 14 pv, Y1:n kuutta ei kertaakaan → muisti toimii indeksirivin varassa | ali-agenttien osalta todentamatta |
| Muistutukset (scopes infra 35ab8662) | kesken (eritelty 14.10.2026, scopes/context/MUISTUTUKSET.md, 2b1e619e; A1 toteutettu d2555969 14.10.2026) **14.10.2026:** autopack-reitti ennen A1:tä (transkripti 35ab8662 r. 567–580): Skill(keskustelun-siirto) isMeta 52 836 + `cat pakkaa/SKILL.md` 30 803 merkkiä = 83,6 k ≈ 46 k tokenia; MUISTUTUKSET.md laski vain reitittimen (cat on työkalutulos). | suunnat skripteinä: A autopack-pakkaus ilman reititintä pääistunnossa (~29 k/pakkaus; A1 toteutettu d2555969 14.10.2026, A2 seuraava), D MEMORY.md-muutosliite (~3,5 k), C Concise-tyyli (~2,8 k/50 vuoroa, asetus); suositus A |
| Äpin kontekstivälilehti = kaikki ladattu, ei muuta | avoin (V-399 ja V-400 → scopes infra 14.10.2026); odottaa skooppia scopes infra | V-399 ja V-400 käsitellään skoopissa scopes infra |
| A1:n todennus | kesken (14.10.2026: osittain — reititin pois, 22 k > 20 k) **14.10.2026:** A1 mitattu 14.10.2026 (310a8610 r. 391–546): kiinteä lataus autopakkaa isMeta 9 038 merkkiä ≈ 5 k + `cat pakkaa/SKILL.md` 30 789 ≈ 17 k = 22 k tokenia (tavoite ≤ 20 k; autopakkaa 9,4 k merkkiä, suunnitelma arvioi 2 k); konteksti 141,6 k → 184,6 k (+43 k; vanha reitti 35ab8662 +60 k). | mitattu session 310a8610 transkriptista MUISTUTUKSET.md:n luokittelulla: ei reitittimen isMeta-latausta pakkauksessa (täyttyi), pakkauksen lisäys ≤ 20 k tokenia (ei täyttynyt: 22 k); autopakkaa-kevennys CONTEXT-A3:ssa |
| A2 pakkausohje skripteiksi (pakkaa-alku.mjs, pakkaa-loppu.mjs; pakkaa/SKILL.md < 8 k merkkiä) | valmis 566e44fe 14.10.2026 **14.10.2026:** A2-testit 14.10.2026: `node --test` pakkaa-alku/-loppu/-git/-vaiheet-lukot 82/82 pass, skooppirajaus+pura-faktat 18/18 (tarkistettu pääistunnossa); pakkaa/SKILL.md `wc -m` 7 858. (todenna viim. 28.10.2026) | todennus CONTEXT-A3 |
| CONTEXT-A3: A2:n todennus + kevennys | avoin **15.10.2026:** suora todiste osalle "pakkaa-alku.mjs:n session-committitunnistus" 15.10.2026 klo 13.57: VIERAS 19 skoopille ja Muutetut tiedostot -pohjassa 88 riviä ("committoitu session aikana" + työpuun M-rivit), vaikka sessio ei muuttanut yhtään tiedostoa — kaikki muiden istuntojen committeja/muutoksia session aikavälillä. | mittaa 9e53c757:n pakkaus (ohjeiden lisäys ≤ 8 k, skriptit toimivat), autopakkaa/SKILL.md 9,3 k → ≤ 3 k, pakkaa-alku.mjs:n session-committitunnistus (ei toisten istuntojen committeja); lisää todisteeksi 15.10.2026 pakkaus (19809159: 0 omaa muutosta → 19 VIERAS-riviä); session-committitunnistuksen testitapaus: istunto ilman omia muutoksia → ei VIERAS-rivejä |
| A1/pohja | avoin (tieto) | purun jälkeinen konteksti 64–67 k, josta pohja ~55 k: kevennys kannattaa kohdistaa pohjaan (taito-/työkalulistat, muisti), ei purun raporttiin |

## Viat

| Vika | Tila |
|---|---|
| Väärä kohdeskooppi CONTEXT-LAHDOSSA 14.10.2026 (istunto 763461ad): pääistunto aloitti paketin pelkän SEURAAVA-rivin perusteella lukematta Tarkoitus/Päätökset-lukua (kohde = scopes infra), tulkitsi käyttäjän "history"-vastauksen tämän skoopin HISTORIA.md:ksi, kirjoitti sen tarkennuskysymyksen vaihtoehtoon ja näytti sen tiedoston; myös LISTAT.md (d70e4236) kuvaa pääistunnon omaa kontekstia, ei scopes infran istuntoa. Käyttäjä huomasi. Lisähavainto: vastaus "miksi MUISTUTUKSET.md ei näy" käsitteli tiedoston sijaintia (scopes/context) eikä scopes infran työmuistia; käyttäjä korjasi uudelleen. Korjaus: paketin alussa luetaan rekisterin Tarkoitus- ja Päätökset-luku ja nimetään kohdeskooppi, ennen kuin "skooppi"-sana tulkitaan | avoin |

## Historia

Historia: `scopes/context/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
