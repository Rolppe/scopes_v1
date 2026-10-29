# CONTEXT-LAHTO suunta A: autopack-pakkaus ilman reitittimen latausta

Kohde: skooppi scopes infra (istunto 35ab8662), mutta muutos koskee jokaista autopack-pakkausta.
Pohja: `MUISTUTUKSET.md` luku 2. Laadittu 14.10.2026. Tila: **odottaa käyttäjän hyväksyntää.**

## Mitä tapahtuu nyt (mitattu)

`/pakkaa`-taidossa on `disable-model-invocation: true`, joten autopack ei voi kutsua sitä. Sen sijaan
pääistunto kutsuu reititintä ja lukee pakkausohjeen sen jälkeen itse (35ab8662, rivit 567–580):

| Askel | Mitä tuli pääistuntoon | Merkit | ≈ k tok |
|---|---|---|---|
| `Skill(keskustelun-siirto, "paketoi scopes infra")` | reitittimen koko runko (isMeta) | 52 836 | 29 |
| `cat ~/.claude/skills/pakkaa/SKILL.md` | pakkausohje (työkalutulos) | 30 803 | 17 |
| **Yhteensä autopack-reitillä** | | **83 600** | **46** |
| Käyttäjän `/pakkaa` (vertailu) | pelkkä pakkausohje | 30 803 | 17 |

`MUISTUTUKSET.md` laski vain reitittimen, koska `cat`-tulos on työkalutulos eikä muistutus.

Reitittimestä autopack tarvitsee vain luvun "Autopack" (rivit 342–475, 10,5 k merkkiä), ja siitäkin
pakkauksen aikana vain kohdan 7b (session vaihto). Loput 42 k merkkiä (skoopin sanat, polusta
skooppiin, synkka, rekisteri/historia-säännöt) ovat jo `pakkaa`-ohjeessa tai skripteissä.

Toistuvuus: viikolla 7.–14.10.2026 tämän projektin transkripteissa oli 33 reititinkutsua
pakkaukseen (`paketoi …`/`pakkaa …`) ja 30 käyttäjän `/pakkaa`-komentoa.

## Ehdotus

### A1 — autopackin oma sisäänkäynti (pieni, nopea)

1. Uusi taito `Infra/skills/autopakkaa/SKILL.md`, mallin kutsuttavissa, runko noin 2 k merkkiä:
   - ensimmäinen askel: `cat ~/.claude/skills/keskustelun-siirto/state/autopack.txt`; jos ei `true`,
     pysähdy ja sano se (estää oma-aloitteisen pakkauksen);
   - autopackin kolme ehtoa ja rajat lyhyesti (ei pushia ilman lupaa, ei pakkausta, jos puussa on
     kuvaamattomia muutoksia, kysy epäselvästä skoopista);
   - sitten `cat ~/.claude/skills/pakkaa/SKILL.md` ja sen noudattaminen argumentilla `<skooppi>`.
2. Reitittimen Autopack-luvun kohta 7b omaksi tiedostokseen
   `Infra/skills/pakkaa/references/autovaihto.md`; `pakkaa`-ohjeen viittaus (rivi 396) lukee sen vain
   silloin, kun sessio vaihdetaan.
3. Muistio `autopack-setting.md` ja reitittimen Autopack-luku osoittavat `autopakkaa`-taitoon, ei
   reitittimeen.
4. `bash Infra/skills/install.sh`; vaikutus näkyy uusissa istunnoissa.

Säästö: noin 50 k merkkiä ≈ **28 k tokenia jokaisessa autopack-pakkauksessa** (46 k → 18 k).
Kustannus: taitolistaan yksi rivi (noin 200 merkkiä jokaisessa istunnossa).

### A2 — pakkausohje skripteiksi (käyttäjä: "nämä pitää toimia laitteilla skripteinä")

Pakkausohjeen 30,8 k merkistä vain muistion sisältö vaatii keskustelun tuntemista. Loput on
mekaanista ja siirtyy skripteihin `pakkaa-vaiheet.mjs`:n tapaan:

| Osa | Nyt merkkejä | Skriptiksi | Pääistuntoon jää |
|---|---|---|---|
| Vaihe 0 + skooppitarkistus + muistion polku + lähtörivi HEADista + automaattivalinta | ~12 k | `pakkaa-alku.mjs <skooppi>`: ajaa synkan, `skooppi-polusta`, `vieras-skooppi`, `pack-memo path`, lukee HEADin ja `automaattivalinta.txt`:n ja tulostaa muistiopohjan, jossa faktat on valmiina | muistion keskustelusta riippuvat luvut ja kysymykset (seuraava paketti, hukka, kesken) |
| Vaihe 3 (SEURAAVA-tarkistus, transkriptiote, hukkarivit, git, PAKATTU-, koonti- ja avausrivi, `/sa` pois) | ~16 k | `pakkaa-loppu.mjs <skooppi>`: tekee tarkistukset ja commitin `pakkaa-git.sh`:lla ja tulostaa loppuviestin rivit valmiina | skriptin tulosteen esittäminen |

Tavoite: `pakkaa/SKILL.md` alle 8 k merkkiä. Säästö noin **12 k tokenia lisää jokaisessa
pakkauksessa**, myös käyttäjän `/pakkaa`ssa. Iso muutos: säännöt ja niiden V-tunnukset on
säilytettävä testeinä, kuten `pakkaa-vaiheet.mjs`:llä.

### Todennus

Seuraavan autopack-pakkauksen transkriptista samalla luokittelulla kuin `MUISTUTUKSET.md`:
reitittimen isMeta-latausta ei ole, ja pakkauksen lisäys pääistuntoon on A1:n jälkeen enintään
20 k tokenia (A2:n jälkeen enintään 8 k).

## Kuka tekee

Lähteet ovat `Infra/skills/` (siirron taidot). Skoopin rajan mukaan scopes context toteuttaa
hyväksytyn muutoksen itse; muutos kirjataan siirron omistajan historiaan. Suositus: **A1 ensin**
(yksi istunto, mitattava heti), A2 omana pakettinaan sen jälkeen.
