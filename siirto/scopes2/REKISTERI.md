# scopes/siirto/scopes2/REKISTERI.md

Tilanne: 19.10.2026

SEURAAVA PAKETTI: SIIRTO-SCOPES2-SULKU — tarkoitus täytetty (laajennus d543a3ed, oikea kierros 9ea2c44d); käyttäjä päättää, suljetaanko skooppi vai annetaanko uusi työ — polut: scopes/siirto/scopes2/** — aloitus: /pura scopes siirto scopes2

## Tarkoitus ja raja

Tarkoitus (käyttäjä 19.10.2026, välitetty skoopista scopes macos): muut kuin scopes-skoopit toimivat vanhalla purku- ja
pakkausmenetelmällä, eikä scopes2-toteutussuunnitelma ottanut uusia käyttöön (`scopes/toteutussuunnitelma/SUUNNITELMA.md`
H-10). Tämä skooppi (1) laajentaa uuden purun (`claude/siirto/tools/pura-malliton.mjs`, `onPerhe`) ja uuden pakkauksen
(`scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs` ja muut scopes-perheen tunnistavat kohdat) kattamaan `scopes2/`-rekisterit
ja (2) testaa toimivuuden: yksikkötestit ja oikea pura- ja pakkauskierros scopes2-skoopilla.

Raja: oma rekisteri `scopes/siirto/scopes2/**`. Muutokset vieraiden skooppien tiedostoihin (`claude/siirto/tools/pura-malliton*`,
`scopes/agy/siirto/pakkausscripti/**`, `.agents/skills/pakkaa/SKILL.md`, `Infra/skills/pura/SKILL.md`) tehdään käyttäjän
pyynnöstä ja kirjataan omistajille `/vika` (TYÖTAVAT 15). scopes2-skooppien oma työ kuuluu skoopeille `scopes2 *`.

## Päätökset

- **Käyttäjä 19.10.2026:** skooppi `scopes siirto scopes2` luotiin komennolla `/pura uusi scopes siirto scopes2`.
- **19.10.2026 (SIIRTO-SCOPES2-MAARITTELY):** perhe = rekisteri `scopes/`- tai `scopes2/`-alla; purussa `PERHEJUURET`
  (`pura-malliton.mjs`), pakkauksessa `skooppipolku.mjs` (`scopes2 ydin` → `scopes2/ydin`). Commit d543a3ed.
- **Käyttäjä 19.10.2026:** yläskooppi `scopes2` luotiin testikierrosta varten (toteutussuunnitelman H-3:n ensimmäinen osa; commit 7522ac47).

- **19.10.2026:** Perhe = rekisteri `scopes/`- tai `scopes2/`-alla; ensimmäinen sana on juurihakemisto. Hylätty: skoopit.json-haku pakkausscriptissä (moduuli pysyy puhtaana funktiona kuten ennen).

- **19.10.2026:** Huono muistio ei mene scopes2:n rekisteriin; oikea pakkauskierros jatkuu, kun V-562 on korjattu tai agy-kiintiö palaa.

- **19.10.2026 (SIIRTO-SCOPES2-KIERROS):** oikea kierros `pakkaa-hybridi.mjs scopes2 --vahvistettu` meni läpi: vaiheet 1–4 ok, vaihe 5 claude-cli claude-sonnet-5-5 (11 s), commit 9ea2c44d (vain scopes2/HISTORIA.md, scopes2/REKISTERI.md), push ok, exit 0. Ensimmäinen ajo pysähtyi exit 5:een vieras-skooppi-porttiin (V-011), koska aloitusskooppi on scopes siirto scopes2; käyttäjän "Pakkaa scopes2" avasi portin. Testikierros vieraaseen skooppiin vaatii aina tämän pyynnön.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/siirto/scopes2/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
