# scopes/siirto/git/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ei mitään — laitetarkastus valmis 28.10.2026 kaikilla kolmella koneella; jäljellä vain toisten skooppien rivit (V-704, V-719, V-721, V-722, V-741)

## Tarkoitus ja raja

Git-synkronointi ja -operaatiot Scopes-siirroissa: git push-, pull-, synkka- ja worktree-toimintojen logiikka ja luotettavuus laitteiden välillä.

Raja: skooppi omistaa hakemiston `scopes/siirto/git/**` ja vastaa siirron git-toimintojen toteutuksesta ja apumoduuleista.

## Päätökset

- **Käyttäjä 18.10.2026:** skooppi `scopes siirto git` luotiin komennolla `/pura uusi scopes siirto git`.
- **Käyttäjä 18.10.2026 (SIIRTO-GIT-MAARITTELY):** tarkoitus on "Git-synkronointi ja -operaatiot Scopes-siirroissa (git push/pull/synkka/worktree -toimintojen logiikka ja luotettavuus)". Hylätyt vaihtoehdot: Scopes-äpin sisäinen Git-hallinta, Scopes-koodikannan eriyttäminen omaan Git-repoonsa claude_project-juuresta.
- **Käyttäjä 18.10.2026:** raja on `scopes/siirto/git/**`.
- **Käyttäjä 18.10.2026:** ensimmäinen työ on `SIIRTO-GIT-NYKYTILA` (kartoita siirron nykyiset git-toiminnot ja laadi toteutussuunnitelma scopes/siirto/git/-moduulille).
- **18.10.2026 (SIIRTO-GIT-NYKYTILA & SIIRTO-GIT-KOMENTO & SIIRTO-GIT-TILA):** laadittu `SUUNNITELMA.md`. Toteutettu luotettava matalan tason komentoajuri `git-komento.mjs` (Sääntö 2:n salaisuussuodatus, aikakatkaisut) ja tilanlukija `git-tila.mjs` (haarat, upstream, porcelain) yksikkötestattuina (7/7 testiä läpi). Seuraavaksi laitteiden välisen synkronoinnin moduuli `git-synkka.mjs`.

- **19.10.2026:** Moduulirakenne scopes/siirto/git/: komentoajuri, tilanlukija ja seuraavaksi git-synkka.mjs laitteiden väliseen synkkaan.

- **27.10.2026 (SIIRTO-GIT-SYNKKA):** Toteutettu `git-synkka.mjs` (lukkotörmäysten uusintayritykset R3:n mukaan, etävaraston tarkistus, haaravertailu, turvallinen fast-forward -synkka, safe push ja kattava `tarkistaSynkka`), yksikkö- ja monilaiteintegraatiotestit `git-synkka.test.mjs` sekä automaattinen verifiointiportti `gate.sh`. Testit 13/13 läpi. Seuraavaksi eristettyjen worktree-työtilojen moduuli `git-worktree.mjs`.

- **27.10.2026 (SIIRTO-GIT-WORKTREE):** Toteutettu `git-worktree.mjs` (worktree-listauksen ja porcelain-jäsennyksen rutiinit, normalisoitu polkuvertailu mm. macOS-symlinkkien yli, luonti `--detach` / `-b` / lukitus- ja pohjavalinnoin, siirto, lukitseminen, avaaminen, poisto, karsinta ja `luoEristettyWorktree` automaattisella `siivoa()`-siivouksella), `index.mjs`-päävienti sekä kattavat yksikkö- ja integraatiotestit `git-worktree.test.mjs`. Kaikki testit 21/21 läpi.

- **27.10.2026 (SIIRTO-PULL-SYNKKAKORJAUS):** Työpuun toistuvat roskaantumis- ja rebase-ongelmat korjattu: Infra/git/synkka.sh sallii fast-forward -pullin kun muokatut tiedostot eivät ole ristiriidassa, ja .gitignore estää .build/-hakemiston. Työpuu siivottu (6 committia) ja todennettu gate.sh:lla (21/21 läpi).

- **28.10.2026 (rekisterien tilannetarkistus):** käyttäjän tehtävä "git rekistereiden tilanne selvitys ja korjaus". gate.sh 21/21 läpi. Aliskooppien rekisterit (`korjaus1`, `jatka`) tarkistettu gitistä; korjaus1:n push-paketti todettu tehdyksi ja stash-viite päivitetty; Historia-rivit korjattu (HISTORIA.md on olemassa).
- **Käyttäjä 28.10.2026 (SIIRTO-GIT-LAITETARKASTUS):** tehtävä on "kaikkien laitteiden repotilat pitää huolella tarkastaa; niissä on virheitä ja väliaikaisia ratkaisuja, jotka pitää korjata". Juuren haaroille valittu tapa: merge `origin/claude_local` → aktiivinen `claude/charming-brahmagupta-p9hmm7`. Jsonl-tiedostot yhdistetään aikaleiman mukaan ja rekistereistä säilytetään molempien sisältö. Sen jälkeen `repot.json`:n juurihaara vaihdetaan aktiiviseen, ja Macin vanha klooni sekä palvelin siirretään samaan haaraan. Hylätyt vaihtoehdot: uusi pysyvä haaranimi, claude_local päähaaraksi. Pikakorjauksiksi hyväksytty: puhtaiden jäljessä olevien alirepojen fast-forward, kuolleiden worktreiden karsinta ja `__pycache__` expresson .gitignoreen.
- **Käyttäjä 28.10.2026 (karsintaehto):** tiedostorakenne on muuttunut, joten "kuollut" worktree, klooni tai osoitin voi olla yhä elossa uudessa paikassa, jolloin osoitin vain osoittaa väärään paikkaan. Ennen jokaista karsintaa tarkistetaan, ettei kohde ole siirtynyt ja ettei sen HEAD tai sen muutokset jää haarojen ulkopuolelle.
- **Käyttäjä 28.10.2026 (SIIRTO-GIT-LAITETARKASTUS-SIIVOUS):** (1) sisällöttömistä haaroista ensin selvitys, mistä tyhjyys johtuu (hukkunut vai siirretty), ennen poistopäätöstä; (2) `origin/claude_local`: "anna tieto korjaustarpeesta oikealle skoopille ja käynnistä skooppi" → V-700 claude siirrolle ja sen istunto käynnistetty; (3) palvelimen 8 alirepoa kloonataan, ja deploy-avaimet tehdään vanhalla reitillä (`luo-repo.sh --kone palvelin --etana palvelin`, käyttäjä salli luokittimen estämän ajon); (4) käyttäjän päätös Macin vanhasta kloonista ks. 28.10.2026 (vanha klooni).
- **Käyttäjä 28.10.2026 (SIIRTO-GIT-LAITETARKASTUS-SIIVOUS, SIIRTO-GIT-SYNKKA-EXIT):** sisällöttömille haaroille ensin selvitys, sitten "Agentti poistaa kaikki 16"; korvautuneet 8 (stashit ja haara) poistetaan, tunnelitesti-stashin 26 riviä yhdistetään ja stash poistetaan, AP:n uniikit kirjataan pluginille eikä niihin kosketa (V-704); linuxin alirepot kloonataan vanhalla luo-repo-reitillä; `origin/claude_local` poistetaan vasta V-700:n jälkeen; `synkka.sh`:n haararistiriita = oma exit 4 ja varoitus (hylätty: exit 1 ja ei muutosta); `remote`-kloonien vanhaan historiaan ei kosketa (V-721 skoopille git).
- **Käyttäjä 28.10.2026 (SIIRTO-GIT-LAITETARKASTUS-JUURIHAARA):** Macin juuren economy-työ varmistetaan (patch, rivit, tgz) ja stashataan, juuri pullataan (hylätty: odotetaan omistajaa, hylätään muutokset). V-700 korjataan tässä skoopissa (hylätty: jätetään claude siirrolle). GitHubin oletushaara vaihdetaan aktiiviseen haaraan ja `claude_local` poistetaan (hylätty: jätetään oletushaaraksi).
- **Käyttäjä 28.10.2026 (vanha klooni, linux):** Macin vanha klooni arkistoidaan (`bundle --all`) ja poistetaan (hylätty: push estoon ja vain rivi talteen). Linuxin `claude/r&do`-kartta → master; `BP` bundlataan oneplussaan ja sen kuollut worktree karsitaan.
- **Käyttäjä 28.10.2026 (pakkauksessa):** "etsitään lisää vikoja" → seuraava paketti on SIIRTO-GIT-VIKAHAKU-2.
- **Käyttäjä 28.10.2026 (SIIRTO-GIT-VIKAHAKU-2):** GitHubin 10 sisällötöntä haaraa poistetaan ja PR #5 suljetaan (hylätty: vain haarat, jätetään ennalleen); bundle-vika (a) korjataan tässä skoopissa itse ja Macin expresso (b) kirjataan gitille (hylätty: kaikki vika.sh:lla, käyttäjä kirjaa itse); Macin `-t72` patch talteen ja poistetaan (hylätty: ei kosketa); kolme jäljellä ollutta löydöstä kirjataan omistajille tiedoksi-riveinä V-737–V-739 (hylätty: vain rekisteriin).
- **Käyttäjä 28.10.2026 (avoimet läpi):** "käy nämä kaikki läpi. selvitä itse taustat riittävän hyvin että voit tehdä päätökset itsenäisesti" → agentti päätti: PURA-KOODI-3-2 omistajalle (V-741), korvautuneet Macin ark16 ja t108 poistetaan varmuuskopion jälkeen, linuxin juuri ja idea ff, toisten skooppien jäämät (V-704, V-719, V-721, V-722) jätetään omistajille.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| SIIRTO-GIT-LAITETARKASTUS-JUURIHAARA | valmis 28.10.2026 (af7f71ad merge, 2e1b636f Mac, 1a4202e3 V-700); todennettu | Juuri on aktiivisessa haarassa kaikilla kolmella koneella. Mac 28.10.2026: juuren economy-työ stashiin (V-722), ff 148, kartta-rivi poistunut. V-700 korjattu tästä skoopista käyttäjän pyynnöstä (1a4202e3: oletukset repot.json:n juurihaarasta, rakenna-tyotila.test.mjs 12/12; V-723 claude siirrolle tiedoksi). GitHubin oletushaara vaihdettu claude/charming-brahmagupta-p9hmm7:ään, PR:t #5 ja #2 kohdistettu siihen ja `origin/claude_local` poistettu (kärki 91dd9ae7 HEADissa, 0 uniikkia; palautus `git push origin 91dd9ae7:refs/heads/claude_local`). Seurantaviitteet karsittu oneplussalla, Macilla ja linuxilla, origin/HEAD → aktiivinen. Oneplussan `synkka.sh tila` exit 0. Ei jatkotoimia |
| SIIRTO-GIT-PURA-KOODI-3-2 | valmis 28.10.2026 (V-741, 7a0b5c6) | Päätös kuuluu omistajalle, joten asia kirjattiin claude siirto puralle V-741:nä suosituksella "älä ota käyttöön" (Agent-varareitti on käytössä, agy hylätty 28.10.). Nykyinen `MALLIREITTI.md:25` ja `aja-siirtaja.sh:374` ennallaan. Sisältö: `git show 75adfab6 -- Infra/skills/pura/SKILL.md claude/siirto/tools/aja-siirtaja.sh`. Ei jatkotoimia tässä skoopissa |
| SIIRTO-GIT-LAITETARKASTUS-MAC | valmis 28.10.2026 | Tarkistettu 28.10.2026 klo 23: `sessions-repo-ark16` (haara `adapteri/ark16-korjaukset`, a4c734eb) on kokonaan korvautunut: sen 3 cherry-uniikkia committia (2c93aa48, 37f806d1, dd9291fb) ovat patch-id:ltään samat kuin HEADin 4e10954e, e3992fcd ja 91a7227f, 5 likaista tiedostoa (muokattu 10.16) ovat tavu tavulta originin versioita, eikä mikään prosessi pidä sitä auki. `ydin/t108-jono` (ec1ef159, myös GitHubissa, ei PR:ää) on 2 committia, molemmat patch-vastineina HEADissa. Talteen `~/Projects/claude/git-varmuuskopio-20261028/`: `ark16-ja-t108.bundle` (verify ok), `ark16-tyopuu.patch` (178 riviä), `ark16-status.txt`, `ark16-HEAD.txt`. Poistettu käyttäjän luvalla 28.10.2026 (luokitin esti ensin [Git Destructive]): worktree remove exit 0, `branch -D` ×2 exit 0, GitHubin `ydin/t108-jono` deleted (ls-remote 0); palautus `git fetch <bundle> adapteri/ark16-korjaukset:adapteri/ark16-korjaukset` (ja `ydin/t108-jono` ec1ef159). Ei tämän skoopin: aktiivisen puun 11 likaista tiedostoa ja pushaamaton ARVIO 22a1ebf1 (käynnissä olevat istunnot, muokattu 22.51–22.54), juuren stash@{0} economy-työ (V-722), `remote` 79/34 (V-721) |
| SIIRTO-GIT-LAITETARKASTUS-LINUX | valmis 28.10.2026 | Tarkistettu klo 23: `/srv/work` juuri ff 88 ja `claude/idea` ff 43 (`pull --ff-only` exit 0), muut 9 alirepoa synkassa (`remote` 79/34 = V-721). `/srv/work`:ssa ei stasheja eikä muita haaroja; `Automation_plugin-local-docs-staging` on /srv/workin `.git/info/exclude`:lla ohitettu kansio ilman omaa gitiä, joten aiempi "1 stash ja 2 haaraa" oli /srv/workin (poistettu SIIVOUKSESSA). Jäljellä vain toisten skooppien omat: Automation_pluginin autostash (13.10., `planner_cost_usd`) ja uniikit haarat wp-10-a, wp-10-c, varmuus-ajo2-20260822 (V-704 plugin); `Infra/linux/grub-windows-oletus.sh` jäljittämätön (V-719 infra linux). Ei jatkotoimia tässä skoopissa |
| SIIRTO-GIT-LAITETARKASTUS-ONEPLUS | valmis 28.10.2026 | Tarkistettu klo 23: juuressa ja alirepoissa (Automation_plugin, models, remote, remote_private, workspace) 0 stashia, vain päähaarat, kaikki synkassa; rivin "Jäljellä"-stashit ja -haarat poistettiin jo SIIVOUKSESSA (e23f8183). r&d2:n /tmp-dispatch-kansiot V-737 (claude r&d2). Ei jatkotoimia |

## Viat

| Vika | Tila |
|---|---|
| SIIRTO-GIT-SYNKKA-EXIT: `synkka.sh` raportoi repokartan ja haaran ristiriidan (`haara X, kartassa Y`) vain tekstinä eikä muuta exit-koodia (`Infra/git/synkka.sh:29`), joten juuren haarahajaannus 8.–28.10.2026 jäi huomaamatta; omistaja scopes siirto git | korjattu 474df698 28.10.2026 (käyttäjän päätös: oma exit-koodi 4 ja varoitus, työ ei pysähdy; kutsujat pakkaa-git, pura-malliton, pura-vaiheet, pakkaa-alku; synkka.test.mjs 50/50; V-720 claude siirrolle; `pura-vaiheet.test.mjs:197` (Cowork, 2 testiä) punainen jo ennen muutosta, koska `juuri.sh`:n Mac-polku vaihtui 030448a7:ssa); todenna viim. 11.11.2026 (todenna viim. 11.11.2026) |

## Historia

Historia: `scopes/siirto/git/HISTORIA.md`, ei lueta purussa.
