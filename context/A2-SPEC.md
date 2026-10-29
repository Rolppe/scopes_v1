# CONTEXT-A2 — pakkausohje skripteiksi: toteutusspeksi

Laadittu 14.10.2026 (scopes context, istunto 9e53c757). Pohja: `SUUNNITELMA-A.md` luku A2, käyttäjän
hyväksyntä "A1 nyt, A2 paketiksi" 14.10.2026. Lähde: `Infra/skills/pakkaa/SKILL.md` (31 161 merkkiä, 407 riviä).
Tavoite: `Infra/skills/pakkaa/SKILL.md` alle 8 000 merkkiä; mekaaniset askeleet kahteen skriptiin; jokainen
poistettu sääntö (tunnus kuten V-096, PAKKAA-SEURAAVA-HEAD) säilyy joko skriptin käytöksenä + testinä tai
lyhyenä rivinä SKILL.md:ssä tai `references/`-tiedostossa. Mikään sääntö ei katoa hiljaa.

## 1. `claude/siirto/tools/pakkaa-alku.mjs "<skooppi>" [--session <id>]` (korvaa SKILL.md r. 14–105 mekaniikan)

Ajetaan projektijuuresta. Tekee järjestyksessä ja tulostaa yhden `AVAIN: arvo` -rivin kustakin:

1. `PILVI:` — jos `CLAUDE_CODE_REMOTE=true`: tulosta `PILVI: kyllä — lue Infra/skills/pakkaa/references/pilvi.md` ja ohita synkka.
2. `SYNKKA:` — `bash Infra/git/synkka.sh ennen --skooppi "<skooppi>"` (tuntematon skooppi → ilman lippua). Välitä sen rivit. "rebase-konflikti"/"origin ei tavoitettavissa" → rivi sanoo sen; pakkaus jatkuu paikallisesti.
3. `SKOOPPITARKISTUS:` — kerää muutetut polut: `git status --short` juuresta, `Automation_plugin`ista, `claude/r&d2`:sta, `claude/r&do`:sta (lainaa `&`-polut) + session aikana committoidut tiedostot (commitit, joiden viestissä on `Claude-Session:`-rivi tai jotka ovat session transkriptin ensimmäisen aikaleiman jälkeen tämän koneen tekijältä — valitse luotettavin ja dokumentoi). Aja `node claude/siirto/tools/skooppi-polusta.mjs <polut>`; tulosta muistiovalmis rivi `<skooppi ← polut ryhmiteltynä> → pakataan: <skoopit>`.
4. `VIERAS:` — jokaiselle muulle tulosteen skoopille `node claude/tools/vieras-skooppi.mjs "<skooppi>"`: exit 0 → `pakataan omalla pakkauksellaan`; exit 1 → valmis `vika.sh`-komentorivi (`bash ~/.claude/skills/vika/vika.sh --lahde "<aloitusskooppi>" --co-author "<attribuutio>" <skooppi> -- "<polut>"`), jonka malli ajaa; exit 3 → `pakataan kuten ennen`. `tuntematon` → `KYSY: tuntematon skooppi — <polut>`. Skoopissa `claude r&do` kaikki `claude/r&d2/tools/…`-kutsut R&DO:n kopiolla + `--state-dir "claude/r&do/.rdo-state"`; kopio puuttuu → exit ≠ 0 ja rivi `PYSÄHDY: …`.
5. `MUISTIO:` — `node "claude/r&d2/tools/pack-memo.mjs" path --session <id>`; epäonnistuu/puuttuu → yhteinen polku `~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio.md` ja rivi `MUISTIO-VAROITUS: yhteinen polku — aja saman skoopin pakkaukset peräkkäin`.
6. `SEURAAVA-HEAD:` — skoopin rekisterin SEURAAVA-rivi synkan jälkeisestä HEADista (`git -C "$(dirname R)" show "HEAD:./$(basename R)"`), jaetussa rekisterissä oma leimattu rivi `SEURAAVA PAKETTI [<skooppi>]`. Rekisterin polku samalla resolverilla kuin `pakkaa-vaiheet.mjs`/`pura-faktat.mjs` käyttävät (älä kirjoita uutta karttaa). Tulosta myös `JAETTU-REKISTERI: kyllä|ei`.
7. `AUTOVALINTA:` ja `AUTOPACK:` — `~/.claude/skills/keskustelun-siirto/state/automaattivalinta.txt` ja `autopack.txt` (puuttuva/lukukelvoton = `false`).
8. Kirjoittaa muistiopohjan polkuun MUISTIO (ei korvaa olemassa olevaa tiedostoa, jossa on muuta kuin pohjaa → `MUISTIO: on jo — <polku>`): otsikko `# Pakkausmuistio — <skooppi> — <p.k.vvvv klo hh.mm>`, Skooppitarkistus-rivi valmiina, kaikki luvut nykyisen SKILL.md r. 66–85 järjestyksessä, `## Muutetut tiedostot` täytettynä git-statuksella, `## Sessio` täytettynä (`id`, `malli`, `koko` = transkriptin tavut, `viimeinen_vuoro`), ja mallin täytettävissä luvuissa yksi `<!-- TÄYTÄ: … -->`-rivi, joka kertoo sisällön lyhyesti. `## Seuraava paketti` -lukuun HEADin rivi pohjaksi.

`pakkaa-alku.mjs --tarkista "<skooppi>" <muistio>` (korvaa r. 126–143 mekaniikan): ajaa `skooppi-polusta.mjs --seuraava` muistiolle ja `check-rekisteri.mjs --muistio`, tulostaa `PORTTI: ok` tai `PORTTI: korjaa — lue references/portti.md luku "Vaihe 1"` ja `KATTO-MUISTIO: ok | yli — <kolme pisintä lukua>`; jäljellä olevat `<!-- TÄYTÄ`-rivit → exit ≠ 0. Exit 0 vain kun kaikki ok.

## 2. `claude/siirto/tools/pakkaa-loppu.mjs "<skooppi>" -m "<viesti>" <polut…> [++ -C <repo> -m … <polut…>] [--vahvistettu] [--vaihda] [--pakkaa-vain]` (korvaa r. 234–407 mekaniikan)

1. Rekisterin SEURAAVA-tarkistus: `skooppi-polusta.mjs --seuraava "<s>" <rekisteri> --rekisteri <rekisteri>`; exit ≠ 0 → `PORTTI: korjaa — references/portti.md luku "Vaihe 3"`, ei committia, exit 4.
2. `transcript-archive.mjs --session` (ohita `claude r&do`); `archived`/exit 1 → välitä rivi + `LUE: references/transkriptiarkisto.md`, jatka.
3. Autopack `false` eikä `--vahvistettu` → tulosta `KYSY-VAHVISTUS: add + commit + push (+ skoopin siirto, jos siirrettävissä)` ja valmis uusintakomento; exit 5, ei committia.
4. `pakkaa-git.sh` yhtenä kutsuna (V-096), `--leima` automaattisesti, jos rekisterin tilaotsikossa on leimapaikkamerkki (sama tunnistus kuin nyt). Exit 3 → aja kerran uudelleen; yhä 3 → `LUKKO: varattu — <haltija>`. Välitä `COMMIT`/`SYNKKA`/`TARKISTIN`/`PAKKAA-GIT`/`LUKKO`-rivit.
5. Hukka: jos skoopilla on odottavia hukkarivejä (`hukka-kirjaa.mjs --odottavat`) ja pakkaa-git palautti 0 tai 1 → `hukka-kirjaa.mjs "<s>"` (exit 1 → kerran uudelleen). Välitä `HUKKA:`-rivi.
6. pakkaa-git 0 → `siirra-skooppi.sh "<s>" --co-author "<attribuutio>"`: 6 hiljaa; 0 → `SIIRTO`-rivi + nykyisen r. 316 selitys yhtenä rivinä; 4/5 → rivi; 2/3 → virherivit.
7. Commit sisälsi `Infra/skills/**` tai `Infra/agents/**` → `bash Infra/skills/install.sh` ja rivi `ASENNUS: ajettu — toinen kone asentaa /purassa`.
8. Loppuviestin rivit valmiina, tässä järjestyksessä: `**PAKATTU:** …` (vain autopack `true`, V-003); `PAKKAUS: vahvistettu — rekisterit ok, commit <sha>, push ok, salaisuusgrep puhdas, last-scope.txt=<s>` tai `PAKKAUS: epäselvä — <osa>: …` (V-142; rekisterit/salaisuusgrep-osat skripti ei näe → lippu `--vaihe2 ok|epäselvä:<syy>` jonka malli antaa vaiheen 2 raportista); `SA: poista sa-työt (CronList → CronDelete prompt alkaa sa-)` vain jos commit syntyi; avauskomento omana aidattuna lohkonaan (I-007); viimeisenä `**SEURAAVA PAKETTI:** <rekisterin rivi sanatarkasti>`.
9. `--vaihda` ja push ok eikä rivi ole `ei mitään — käyttäjä valitsi pakkaa vain` → `bash ~/palvelin/claude/siirto/tools/autovaihto.sh vaihda "<s>"` (absoluuttinen polku, sallintasääntö) ja välitä `VAIHDETTU`/`VANHA`/`KESKEN`/`ISTUNNOT`-rivit (pois `ei muita istuntoja`). Muuten `VAIHTO: ei — <syy>`. Exit 2 → `VAIHTO: epäonnistui — vanha jää auki`.

Exit-koodit dokumentoidaan skriptin otsakkeessa.

## 3. Uusi `Infra/skills/pakkaa/SKILL.md` (< 8 000 merkkiä)

Säilyy mallille (harkinta): `kaikki`-viittaus KAIKKI.md:hen; pilvi-viittaus; skoopin valinta (aloitusskooppi, pwd-varasääntö, `tuntematon` = yksi kysymys, rd-prosessityö → `claude r&d`); muistion täyttö (luvut, absoluuttiset päivät, viat vain Viat-lukuun); SEURAAVA-rivin muoto ja leimaus jaetussa rekisterissä, `ei mitään — <miksi>`, HEAD-rivin etusija (PAKKAA-SEURAAVA-HEAD); automaattivalinnan säännöt (false → AskUserQuestion kolmella vaihtoehdolla, "pakkaa vain"; true → valinta + `— automaattinen: kyllä` ja poissulut); Hukka- ja Kesken-kysymykset (r. 144–183, tiivistettynä); muistion katto 10 000 ja pudotettujen faktojen ilmoitus; Vaihe 2 (aja-siirtaja.sh, exit 0/10/3/2/5, Sonnet-reitin kestorivi, levytarkistus-viittaus); Vaihe 3: raportti sellaisenaan, tietoturvagrep ensin, KATTO/ARKISTO/RIKE-käsittely ja lähdetarkistus → siirrä uuteen `references/katto.md`:hen ja jätä yksi viittausrivi; sitten `pakkaa-loppu.mjs`, sen tulosteen esitys, sa-pois ja käyttäjän pakkauskomento ei vaihda sessiota (`--vaihda` vain `/automaattisiirto` tai autopackin oma laukaisu).
Viittaa autopakkaa-taitoon kuten nyt. Tarkista, että `Infra/skills/autopakkaa/SKILL.md` ja `Infra/skills/automaattisiirto/` (jos lukee pakkaa-ohjeen lukuja nimeltä, esim. "Sessionvaihto") eivät hajoa: luku- ja otsikkonimet, joihin muut tiedostot viittaavat (`grep -rn "pakkaa/SKILL.md\|luku \"" Infra/skills claude/siirto`), säilyvät tai viittaukset päivitetään.

## 4. Testit ja hyväksyntä

- `claude/siirto/tools/pakkaa-alku.test.mjs` ja `pakkaa-loppu.test.mjs` samalla tavalla kuin `pakkaa-git.test.mjs` (väliaikaiset git-repot, ei oikeaa pushia/synkkaa: ympäristömuuttujalla tai valitsimella vaihdettavat komentopolut). Vähintään: muistiopohjan luvut ja järjestys; yhteinen polku -fallback; HEAD-rivi `&`-polussa ja leimattu rivi jaetussa rekisterissä; olemassa olevaa muistiota ei korvata; `--tarkista` hylkää TÄYTÄ-rivin; autopack false ilman `--vahvistettu` ei committaa (exit 5); leima tunnistetaan; PAKKAUS-rivi `epäselvä`, kun push epäonnistuu; `--vaihda` ei vaihda pakkaa vain -rivillä; r&do-eristys.
- Aja `node --test claude/siirto/tools/pakkaa-alku.test.mjs claude/siirto/tools/pakkaa-loppu.test.mjs claude/siirto/tools/pakkaa-git.test.mjs claude/siirto/tools/pakkaa-vaiheet-lukot.test.mjs` aikarajalla (`timeout 600`) ja loki tiedostoon; ei putkea.
- `wc -m Infra/skills/pakkaa/SKILL.md` < 8000.
- Sääntötaulu `scopes/context/A2-SAANNOT.md`: jokainen vanhan SKILL.md:n lihavoitu sääntö/tunnus → minne se meni (skripti:rivi + testin nimi, SKILL.md, references/…).
- Älä aja `install.sh`:ta, älä committaa, älä aja oikeaa pakkausta.
