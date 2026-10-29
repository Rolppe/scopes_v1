# agy-ohjeet — scopes toteutussuunnitelma

Kirjoitettu 21.10.2026 (Opus 5.5, käyttäjän pyyntö patriotin kautta: "Agy flash 3.8 on tyhmempi ja tarvitsee yksityiskohtaisemman ohjeistuksen"). Ohjeet ovat agy-mallille (Gemini Flash 3.8) Macilla (`mac-agy/<id>`). Agy ei lataa `CLAUDE.md`:tä eikä Clauden muistia, joten jokainen ohje on itsenäinen: kaikki tarvittava on tässä tiedostossa ja tehtävän omassa tiedostossa.

Lähtötila 21.10.2026: agy-skoopeissa (scopes2 ydin, macos, ios, shared, adapteri) ei ole yhtään tekemätöntä briefattua tehtävää (kaikilla `briefit/`-tehtävillä on `feat(scopes2 …): T-NN` -commit). Jäljellä on vain valvoja-ajoja. Ohjeet tehtiin käyttäjän valinnalla näille:

| Ohje | Tehtävä | Ajopaikka | Voiko ajaa ilman ihmistä |
|---|---|---|---|
| [T-72.md](T-72.md) | ARK-18:n hyväksyntäajo (macOS-äpin näyttö hereillä) | Mac | Osat (1) ja (4) voi. Osat (2) ja (3) vaativat käyttäjän paikalle, koska Macin näyttö lukittuu heti sammuessa. |
| [T-59.md](T-59.md) | ARK-17:n iOS-hyväksyntä, vain simulaattoriosat | Mac | Kyllä, jos lukot ovat vapaat. Fyysinen iPhone ja tuotantoistunnon vertailu eivät kuulu tähän. |
| [KUIVA.md](KUIVA.md) | Kuivaharjoitus: preflight ja tiedostoviestit ilman muutoksia (28.10.2026) | Mac | Kyllä; ajoistunto lähettää yhden kuittausviestin |

Uudet briefit kirjoitetaan agy-tarkkuudella: `briefit/README.md`, luku "agy-tarkkuus".

## Kuka käynnistää

Agy-istunnon avaa koordinaattori tai overseer (`bash claude/siirto/tools/autovaihto.sh vaihda "<skooppi>" --model mac-agy/<id>`), ja ajava skooppi on tehtävän tiedostossa. Agy-istunto ei avaa eikä ohjaa muita istuntoja.

Agy käynnistyy jaetussa kloonissa `~/sessions-repo` (`autovaihto.sh:400`, `-c "$MAC_JUURI"`). Agy ei lataa `CLAUDE.md`:tä eikä muistia: sen konteksti on vain `-i`-viesti ja tiedostot, jotka se lukee. Siksi aloitusviesti on aina alla oleva vakioprompti.

## Vakioaloitusprompti (lisätty 28.10.2026, overseerin tilaus vaihe 2 (4))

Käynnistäjä täyttää kulmasulkeet. Ruutujen nimet ovat tmux-istuntojen nimiä, ja ne vaihtuvat istunnon mukana, joten ne haetaan käynnistyshetkellä (`tmux ls -F '#S'`; overseer `siirto-scopes-overseer-<aika>`, koordinaattori `siirto-scopes-kordinaattori-<aika>`). Älä kopioi vanhaa nimeä tästä tiedostosta.

```
Olet agy-toteuttaja tehtävässä <T-NN>. Oma ruutu: <oma tmux-istunto>. Ajoistunto (raportoi ja commitoi): <ruutu>. Overseer: <siirto-scopes-overseer-…>. Koordinaattori: <siirto-scopes-kordinaattori-…>.
Lue nämä kokonaan tässä järjestyksessä ennen mitään muuta komentoa:
1. ~/sessions-repo/scopes/toteutussuunnitelma/agy/README.md
2. <ohjeen tai briefin absoluuttinen polku>
Tee sitten README:n "Preflight", lähetä ALOITUS-viesti ajoistunnolle, tee ohjeen askeleet järjestyksessä ja lopeta VALMIS- tai PYSÄHDYN-viestiin.
```

Autovaihdossa sama teksti kirjoitetaan purkutiedostoon, jonka `-i`-viesti nimeää ("Malliton purku: lue … ja noudata sitä"), luvuksi `## Agy-aloitus`. Purkutiedoston muut luvut eivät koske agya.

## Preflight jokaisen ajon alussa (lisätty 28.10.2026, vaihe 2 (1))

Aja komennot yksi kerrallaan ja kirjoita tulos tiedostoon `$HOME/agy-raportit/<T-NN>/preflight.txt`. Jos tulos ei ole odotettu, **STOP**.

| # | Komento | Odotettu | Muuten |
|---|---|---|---|
| 1 | `mkdir -p "$HOME/agy-raportit/<T-NN>"; echo EXIT=$?` | `EXIT=0` | STOP |
| 2 | `pwd` | `~/sessions-repo` (jaettu klooni: älä kirjoita tähän) tai ohjeen worktree | kirjaa, jatka |
| 3 | `test -e <ohjeen worktree>; echo EXIT=$?` | `EXIT=1` (ei ole vielä) | STOP, älä poista |
| 4 | `pgrep -fl ScopesV2Mac; echo EXIT=$?` | `EXIT=1`, kun ohje ajaa macOS-UI-testejä | STOP ja kerro prosessi; älä sulje |
| 5 | `lockf -t 0 "$HOME/scopes2-lukot/naytto.lukko" true; echo EXIT=$?` (vain UI-ajot) ja `lockf -t 0 "$HOME/scopes2-rakennus/.lukko" true; echo EXIT=$?` (käännökset) | `EXIT=0` | `75` = varattu: `sleep 600` ja uudelleen enintään 6 kertaa, sitten STOP |
| 6 | `df -g "$HOME" \| awk 'NR==2{print $4}'` | vähintään `20` (Gt vapaana) | STOP |
| 7 | `command -v gtimeout git node; echo EXIT=$?` | kolme polkua ja `EXIT=0` | STOP |
| 8 | `ls -1 "$HOME/agy-viestit/<oma ruutu>/" 2>/dev/null` | tyhjä tai uudet viestit (lue ne, luku "Viestinvaihto") | — |

Rivin 6 putki on vain levytilan lukuun. Porttia ei koskaan ajeta putken kanssa (sääntö 3).

## Ajopaikka: Mac vai Linux, portti kerrallaan (lisätty 28.10.2026, vaihe 2 (2))

Agy ajaa Macilla. Ohje kertoo portin, ja tämä taulukko kertoo, voiko sen ajaa Macilla. Jos portti on "vain Linux", **STOP** ennen sen ajoa: ajoistunto ajaa sen palvelimella.

| Portti | Mac (agy) | Linux (palvelin) | Syy |
|---|---|---|---|
| `scopes2/shared/gate.sh` (Apple: T-45-G…T-49, T-52, T-58, T-62, T-71, T-87, T-97, T-100, T-102) | kyllä | ajaa Macin ssh:n yli, ei agylle | xcodebuild, simulaattorit, `lockf`-lukot `~/scopes2-lukot/` |
| `scopes2/ydin/gate.sh` | kyllä (P-18, `lockf ~/scopes2-rakennus/.lukko`) | kyllä (`flock`) | ydinkäännökset Mac-jonossa P-18:n mukaan |
| `scopes2/adapteri/gate.sh` `node --test` -tapaukset (T-29, T-63, T-65, T-66…T-69, T-79…T-86, T-95) | kyllä, kun `timeout`-linkki on tehty (T-98:n malli: `ln -sf /opt/homebrew/bin/gtimeout "$HOME/agy-raportit/<T-NN>/bin/timeout"` ja `PATH="$HOME/agy-raportit/<T-NN>/bin:$PATH"`) | kyllä | `gate.sh:536` kutsuu `timeout`ia; testien `/proc` on mockattu |
| `scopes2/adapteri/gate.sh T-24` | **ei** (EXIT=1) | kyllä | `kuorma.test.mjs:62` lukee `/proc/<pid>/status` VmHWM:n (Macilla 0; T-101 21.10.2026) |
| `scopes2/adapteri/gate.sh` koeinstanssit T-25, T-37, T-89, T-92, T-94, T-103 | **ei** | kyllä, `/tmp`-kloonissa `flock /tmp/scopes2-koeportti.lock` | `/proc/<pid>/limits`, `cmdline`, `exe` (`gate.sh:219-226`, `:351`) |

## Commit-sääntö (lisätty 28.10.2026, vaihe 2 (3))

Agy ei commitoi eikä pushaa koskaan. Ajoistunto (Claude-istunto, jonka nimi on aloitusviestissä) tekee sen:
1. Agy jättää muutokset omaan worktreehensä ja lähettää VALMIS-viestin, jossa on `COMMIT: commitoimatta, worktree <polku>` ja `git -C <worktree> status --short` -rivit raportissa.
2. Ajoistunto tarkistaa diffin briefin may-listaa vasten ja ajaa Acceptance-portin itse.
3. Ajoistunto commitoi polkuina worktreessä (`git -C <worktree> commit -m "<viesti>" -- <polut>`; ei `-a`, ei `--amend`, ei `stash`), pushaa ja poistaa worktreen `git worktree remove <polku>` ilman `--force`ia. Jos poisto ei onnistu, worktree jää ja asia kirjataan.

Valvoja-ajo (T-72, T-59) ei muuta tiedostoja, joten siinä ei ole commitoitavaa.

## Säännöt jokaiselle agy-ajolle

1. **Tee vain ohjeen askeleet, järjestyksessä.** Älä korjaa koodia, älä paranna testejä äläkä keksi lisätarkistuksia. Valvoja-ajo ei muuta yhtään repon tiedostoa.
2. **Oma worktree.** Älä aja mitään kansiossa `~/sessions-repo`. Se on jaettu klooni, jossa muut istunnot työskentelevät, ja portti kaatuu (exit 2), jos joku kirjoittaa siihen kesken ajon. Jokainen ohje luo oman worktreen ja poistaa sen lopuksi.
3. **Portti lokiin, ei putkeen.** Aja portti aina muodossa `bash <gate.sh> <ID> > <loki> 2>&1; echo "EXIT=$?"`. Älä lisää `| tail`-, `| grep`- tai `| tee`-putkea, koska putki peittää exit-koodin. Lue tulos rivistä `EXIT=` ja lokin viimeisestä rivistä (`PORTTI VIHREÄ: <ID>` tai `PORTTI PUNAINEN: <ID> (exit N)`).
4. **Aikaraja.** Macissa ei ole `timeout`-komentoa. Käytä `gtimeout` (`/opt/homebrew/bin/gtimeout`), kun ohje sanoo. Portilla on omat aikarajansa, joten sitä ei kääritä.
5. **Exit-koodit:** 0 = vihreä. 1 = testi punainen tai tuntematon ID. 2 = aita (puu muuttui ajon aikana). 75 = lukko varattu.
6. **Raportti repon ulkopuolelle.** Kirjoita tulokset kansioon `$HOME/agy-raportit/<tehtävä>/` (ohje antaa polun). Älä kirjoita rekisteriin, `SUUNNITELMA.md`:hen tai mihinkään `scopes/`-alle. Claude-istunto kirjaa tuloksen myöhemmin raportin perusteella.

## Kielletty aina

- `git commit`, `git push`, `git stash`, `git reset`, `git checkout`, `git pull`, `git rebase` ja `git worktree remove --force`.
- Kirjoittaminen polkuihin `scopes/**`, `scopes2/**`, `claude/**`, `Infra/**` ja `/etc/**`. Poikkeus on vain build-kansiot, jotka portti itse luo.
- `sudo` ja `ssh palvelin-root`.
- Tuotannon prosessit ja portit palvelimella: 8787, 8797 ja 8798. Älä käynnistä, pysäytä tai lähetä niille mitään. Portti käynnistää itse koeytimen palvelimelle ja sulkee sen.
- Käyttäjän äppien sulkeminen tai asetusten muuttaminen: esimerkiksi Awake, järjestelmäasetukset, näytön lukitus ja `pmset`-asetukset (`pmset displaysleepnow` on sallittu vain, kun ohje sanoo).
- Lukkotiedostojen poistaminen kansiosta `~/scopes2-lukot/` tai `~/scopes2-rakennus/.lukko`.
- `tmux send-keys`, SendMessage ja viestit muihin istuntoihin. Ainoa poikkeus on tiedostoviesti kansioon `~/agy-viestit/ulos/` (luku "Viestinvaihto"). Ruutuvahti (`scopes/overseer/agy-vahti.md`) on overseerin oma poikkeus: vain se saa käyttää `tmux send-keys`iä, ja vain sen nimeämään overseerin ruutuun.

## Milloin pysähdyt

Pysähdy, kirjoita ruutuun rivi `PYSÄHDYN: <syy>`, lähetä PYSÄHDYN-viesti ajoistunnolle (luku "Viestinvaihto") ja odota, kun:
- ohje sanoo **STOP**
- `EXIT=` on eri kuin ohjeen odotettu arvo
- ohjeen komento antaa virheen, jota ohje ei mainitse (esimerkiksi tiedosto puuttuu, komento ei löydy tai ssh ei vastaa)
- jokin askel vaatisi tiedoston muuttamista tai kielletyn komennon.

Älä yritä samaa komentoa uudelleen, ellei ohje sano niin. Kirjoita pysähdys myös raporttiin.

## Viestinvaihto tiedostona (lisätty 28.10.2026; overseerin tilaus `agy-viestinvaihto-tiedostona.md`, käyttäjä 21.10.2026)

Työkalu on overseerin `scopes/overseer/tools/viesti.sh` (älä muuta sitä). Viesti on aina tiedosto, ja tmuxiin menee vain yksirivinen osoitus, jonka overseerin toimittaja (`viesti.sh --toimita`, 15 s välein) lähettää.

**Lähetys.** Kirjoita yksi tiedosto kansioon `~/agy-viestit/ulos/`, nimi `<VVVVKKPP-HHMMSS>-<oma ruutu>.md`. Kirjoita vain tähän kansioon. Ensimmäinen rivi on aina `KOHDE:`:
```
mkdir -p "$HOME/agy-viestit/ulos"; cat > "$HOME/agy-viestit/ulos/$(date +%Y%m%d-%H%M%S)-<oma ruutu>.md" <<'VIESTI'
KOHDE: <ajoistunnon ruutu>
TYYPPI: ALOITUS | VALMIS | PYSÄHDYN | KYSYMYS
AJO: <T-NN> <VVVV-KK-PP HH:MM>
LÄHETTÄJÄ: <oma ruutu>
TULOS: <portti EXIT=n, tai "-" ALOITUS-viestissä>
COMMIT: commitoimatta, worktree <polku> | ei muutoksia
RAPORTTI: $HOME/agy-raportit/<T-NN>/RAPORTTI.md
TEKSTI: <yksi kappale: mitä tehtiin, syy (PYSÄHDYN) tai kysymys (KYSYMYS)>
VIESTI
echo EXIT=$?
```
Lähetä ALOITUS preflightin jälkeen, VALMIS kun ohje on tehty, PYSÄHDYN jokaisessa STOP-kohdassa ja KYSYMYS, kun ohje ei kerro, mitä tehdä (pysähdy sen jälkeen). Kopio overseerille vain, kun ohje sanoo.

**Vastaanotto.** Tarkista `ls -1 "$HOME/agy-viestit/<oma ruutu>/" 2>/dev/null` ajon alussa (preflight 8) ja jokaisen ohjeen askeleen jälkeen. Lue uusi tiedosto kokonaan. Vastaus KYSYMYKSEEN tai ohjeen muutos tulee näin, ei ruutuun kirjoitettuna. Älä siirrä äläkä poista vastaanotettuja tiedostoja; kirjaa luetut nimet raporttiin.

