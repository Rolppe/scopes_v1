# CONTEXT-LAHTO: muistutukset (scopes infra, istunto 35ab8662)

Mitattu 14.10.2026 transkriptista `35ab8662-4b79-40fe-9f23-6ef6390f2492.jsonl` samalla luokittelulla kuin
äpin `kontekstinOsat` (`scopes/palvelu/lahteet.mjs:318–370`): "muistutukset" = Claude Coden liitteet,
jotka eivät ole ohjeita tai listoja, sekä käyttäjävuoron järjestelmätekstit (isMeta, system-reminder,
komennot, sa-tick). Tokenit = merkit / 1,8 (`lahteet.mjs:268`). Mittausskripti oli scratchpadissa.

Kaksi ajankohtaa:
- **ennen pakkausta** (rivi 556, klo 16.40, konteksti 194,6 k): muistutukset 48,4 k merkkiä = **26,9 k tokenia**
- **pakkauksen jälkeen** (rivi 698, klo 16.46, konteksti 254,9 k): 104,8 k merkkiä = **58,2 k tokenia**

## 1. Ennen pakkausta: 26,9 k tokenia

| Laji | Kpl | Merkit | ≈ k tok | Milloin | Mitä |
|---|---|---|---|---|---|
| `/pura`-taidon runko (isMeta) | 1 | 21 605 | 12,0 | alussa | SKILL.md:n koko teksti; siirretty skooppiin scopes context purascript |
| `output_style` | 59 | 8 968 | 5,0 | joka vuoro | "Be concise: lead with the result…" jokaiseen vuoroon |
| `edited_text_file` MEMORY.md | 1 | 6 295 | 3,5 | kesken | Claude Code liitti MEMORY.md:n katkelman, kun tiedosto muuttui istunnon aikana (MEMORY.md-tiivistys toisessa istunnossa) |
| `total_tokens_reminder` | 58 | 5 278 | 2,9 | joka vuoro | `<total_tokens>… tokens left</total_tokens>` |
| `session_context` | 1 | 1 445 | 0,8 | alussa | sähköposti- ja käyttöehto |
| `output_style_instructions` | 1 | 1 444 | 0,8 | alussa | Concise-tyylin ohje |
| `environment` | 3 | 1 324 | 0,7 | alussa + cwd-vaihdot | työhakemisto, alusta |
| `remote_session_change` | 2 | 676 | 0,4 | alussa + RC | commit-attribuutio |
| `silent_turn_reminder` | 3 | 411 | 0,2 | kesken | "The user hasn't heard from you…" |
| `model`, `date`, `/pura`-komento, `sa-tick`, kuvaselitteet | 8 | ~1 000 | 0,5 | | |

**Alussa yhteensä** (ennen ensimmäistä agentin riviä): 25,7 k merkkiä ≈ 14 k tokenia, josta `/pura`-runko 12 k.
**Työn aikana kertynyt**: ≈ 13 k tokenia, josta vuorokohtaiset muistutukset (output_style + total_tokens)
8 k ja MEMORY.md-liite 3,5 k.

## 2. Pakkaus lisäsi 31 k tokenia

| Laji | Merkit | ≈ k tok | Mitä |
|---|---|---|---|
| `keskustelun-siirto`-reitittimen runko (isMeta, klo 16.40) | 51 946 | 28,9 | `/pakkaa` latasi koko reitittimen SKILL.md:n **pääistuntoon** |
| output_style + total_tokens (18 vuoroa lisää) | ~4 300 | 2,4 | |

## Havainnot

1. **Rekisterin "kiinteä alku: muistutukset 23 k" ei ole kiinteä.** Alussa on noin 14 k (lähes kaikki
   `/pura`-runkoa); loput kasvaa vuorojen ja tapahtumien mukana.
2. **Vuorokohtaiset muistutukset**: noin 150 merkkiä sisältöä per vuoro (output_style 100 + total_tokens 50; JSON-muodossa 240).
   59 vuorolla 8 k tokenia. Asetuksista riippuvia: Concise-tyyli (output_style) ja total_tokens.
3. **`edited_text_file`**: kun toinen istunto muokkaa tiedostoa, jonka tämä istunto on lukenut (tai joka on
   automaattisesti ladattu, kuten MEMORY.md), Claude Code liittää muutoksen katkelman. Rinnakkaiset
   istunnot kasvattavat toistensa kontekstia.
4. **Pakkauksen reititin 52 k merkkiä pääistunnossa** on istunnon suurin yksittäinen muistutus. `/pakkaa`
   lukee reitittimen pääistunnossa (ensimmäinen vaihe), vaikka `/pura` luetaan ali-agentissa.
5. Äpin mittaus (`JSON.stringify`) yliarvioi liitteitä noin 6 % JSON-avainten takia (48,4 k vs. sisältö 45,4 k merkkiä).

## Mahdolliset suunnat (käyttäjän päätös)

| # | Kohde | Säästö | Kuka |
|---|---|---|---|
| A | `/pakkaa`-ensimmäinen vaihe ilman reitittimen koko runkoa pääistunnossa | ~29 k / pakkaus | scopes context (raja: hyväksytyt muutokset muihin skooppeihin) |
| B | `/pura`-runko pois pääistunnosta | ~12 k / purku | jo työn alla: scopes context purascript |
| C | Output style Concise → oletus (poistaa vuoromuistutuksen) | ~2,8 k / 50 vuoroa | käyttäjä (`/config`) |
| D | MEMORY.md-muutosten liite: rinnakkaisten istuntojen muistimuokkaukset | ~3,5 k / muokkaus | selvitettävä |
| E | Äpin muistutusluku: erottele "alussa" ja "kertynyt" | mittaus oikeaksi | scopes infra (/vika) |
