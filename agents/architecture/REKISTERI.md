# scopes/agents/architecture/REKISTERI.md

Tilanne: 19.10.2026

SEURAAVA PAKETTI: AGENTS-ARK-01 — selvitä arkkitehtuuriset valinnat yksi kerrallaan (ei suunnitelmaa; käyttäjä 19.10.2026): tavoite lisäkapasiteetti ja mittari hinta per hyväksytty (alaraja Opus −5 pp) päätetty; ensin rakenne käyttäjän tuoman väittelytuloksen pohjalta (`scopes/agents/architecture/ERIMIELISYYDET-COMPOUND-AI.md`, `ULKOINEN-GEMINI-5KERROS.md`), sitten valintalistan korjaus käyttäjän kanssa — polut: scopes/agents/architecture/** — aloitus: /pura scopes agents architecture

## Tarkoitus ja raja

**Tarkoitus:** arkkitehtuurisuunnitelma avoimiin malleihin pohjautuvalle agenttiyhdistelmälle ja prosessille Scopes-sovellukseen (käyttäjä 19.10.2026).

**Raja:**
- Sisällä: agenttiyhdistelmän ja prosessin arkkitehtuuripäätökset (roolit, mallit, reitit, tietoturva, tarkistus, mittaus, integraatio, ylläpito) ja niiden toteutuspaketit. Polut `scopes/agents/architecture/**`.
- Ulkona: esitietojen ylläpito (`scopes agents`, `scopes/agents/ESITIEDOT.md`), Scopes-äpin monialusta-arkkitehtuuri (`scopes architecture`), välityspalvelin `scopes/palvelu/nebius-valitys.mjs` (`scopes istunnot`), mallivalinta äpissä (`scopes models`). Koodimuutokset tehdään omistajaskoopeissa; tämä skooppi kirjaa niille paketit.

**Esitiedot:** `scopes/agents/architecture/ESITIETOPAKETTI.md` (tiivistelmä, luettava ensin) ja `scopes/agents/ESITIEDOT.md` luvut 1–23 (täysi aineisto lähteineen).

## Päätökset

- **Käyttäjä 19.10.2026:** skooppi `scopes agents architecture` luotiin `scopes agents` -keskustelusta käyttäjän pyynnöstä, ja sille välitettiin esitietopaketti.
- **Käyttäjä 19.10.2026 (peritty `scopes agents`):** ehdoton ehto on tietoturva ja sopivuus arkaluontoiselle yritysdatalle.
- **Käyttäjä 19.10.2026 (peritty `scopes agents`):** yhdistelmä koostuu vain avoimien painojen malleista; Claude ei ole mukana missään roolissa, Opus 5.5 on vain vertailukohta.

- **19.10.2026:** Käyttäjä 19.10.2026: tavoite = **lisäkapasiteetti** Clauden rinnalle (ei Opus-tason ylitys, ei kaiken korvaaminen, ei nopeus).

- **19.10.2026:** Käyttäjä 19.10.2026: mittari = **hinta per hyväksytty tehtävä** (hyväksytty = testit tai skriptitarkistus läpi), tehtäväluokan läpäisyosuuden alaraja Opus −5 pp.

- **19.10.2026:** Käyttäjä 19.10.2026: skoopissa **ei kirjoiteta suunnitelmaa**, vaan selvitetään arkkitehtuuriset valinnat yksi kerrallaan. AGENTS-ARK-01:n SUUNNITELMA.md-tuotos hylätty.

- **19.10.2026:** Käyttäjä 19.10.2026: valinnoista väitellään toisen keskustelun kanssa; tämä keskustelu tuotti erimielisyystiedoston.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Arkkitehtuuriset valinnat (ei suunnitelmaa, käyttäjä 19.10.2026) | tavoite ja mittari päätetty 19.10.2026; valintalista V-1…V-11 käyttäjän mukaan väärä, korjaamatta; rakenne käsittelyssä, erimielisyydet `ERIMIELISYYDET-COMPOUND-AI.md` | käyttäjä tuo väittelyn tuloksen; paketti AGENTS-ARK-01 |
| Tarkoitus-rivi puhuu suunnitelmasta | ristiriidassa käyttäjän 19.10.2026 linjauksen kanssa | muotoile käyttäjän kanssa: arkkitehtuuristen valintojen selvitys |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agents/architecture/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
