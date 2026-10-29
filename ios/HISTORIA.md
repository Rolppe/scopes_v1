# scopes ios — toteutushistoria

## Toteutushistoria

- 28.10.2026: malliton purku (`~/.local/state/pura/scopes-ios.md`) ja /sa päälle (cron 688467ed, c7d3bf64, uusinta 777404aa 4.11.2026 klo 14.32). Ei koodi- eikä rekisterimuutoksia; rekisteri vastasi HEADia 43a5e21e.
- 28.10.2026: skooppi `scopes ios` luotiin (`/pura uusi scopes ios`, ff30f9f0) ja purettiin.
- IOS-MAARITTELY: kirjattiin tarkoitus ja raja. Nykytila kartoitettiin Explore-ali-agentilla, ja väitteet tarkistettiin lähteestä (SKILL.md:205-226 polkukartta, performance/ios:16, siirto/agymacos:11, project.yml ilman ScopesCorea).
- Skoopit `scopes testit`, `scopes jakelu` ja `scopes jakelu mac` arkistoitiin (`arkistoi-skooppi.mjs`) käyttäjän päätöksellä (2de649cb). Polut siirtyivät yleisrivillä `scopes/ios/** → scopes ios`. Työkalun jättämät polkukarttarivit (testi.sh, mittaa.sh, project.yml, asenna.sh) ja Skoopista viitetiedostoon -luettelon nimet poistettiin käsin. Rekisterien sisältö säilyi arkistoituna (`REKISTERI.arkistoitu.md`), ja niiden Viat-rivit sekä avoin asia siirrettiin scopes iosin rekisteriin.
- V-338 (aafe65d1): uusi `scopes/ios/lahde.sh` (`lahde_tar`, `lahde_kerro`). `asenna.sh [--head] [--uusi|--ipa]` ja `testi.sh [--head] [simulaattori]` ottavat lähteet työpuusta tai `--head`-lipulla `git archive HEAD`:sta ja tulostavat rivin `lähde:`.
- V-331 (a2ed48aa): `UITests/SkoopitUITests.swift` testListaJaSkooppi käyttää oletuksena listan ylintä skooppia (`ylin`) kiinteän "scopes listan" sijaan. testi.sh:n kommentti rivillä 41 päivitettiin.
- V-447 (c2943e4d): `mac/skoopit-asennus.sh`: `omapro()` tunnistaa myös `.widget`- ja `.keyboard`-profiilit, ja uusi `lahin()` antaa aikaisimman vanhenemisajan, josta H, VANHA ja EXP lasketaan. SIIRRA=0 vain, jos PP:n kaikki omat profiilit ovat asennettua uudempia. Korjaus vietiin Maciin käyttäjän luvalla komennolla `bash scopes/ios/asenna.sh --head --uusi`.
- V-489 todettiin korjautuneeksi (rekisteri).
- Tiedoksi-ilmoitukset vika.sh:lla: V-706 (claude siirto, arkistointityökalun vika), V-707 performance ios, V-708 siirto agymacos, V-709 ioskeyboard, V-710 sideloader, V-711/V-712/V-714/V-715 scopes viat (V-338, V-331, V-447 ja V-489 korjattu).
- Session sa-herätykset luotiin (cron 1501c53f, 20b56861, uusinta f504078a 4.11.).

### Mittaukset 28.10.2026

- Allekirjoituksen uusinta toimi ennen korjausta vain äpille: `~/Projects/scopes/scopes-ios/ajastus.loki` `uusinta H=47` 20.10. ja 27.10.; `asennus.loki` 27.10. `uusinta valmis profiili=2026-11-03T07:06:36Z`. Lokien polku muuttui (PARAMETRISOINTI-1): `~/scopes-ios/` → `~/Projects/scopes/scopes-ios/`.
- Ennen V-447:n korjausta PP:n profiilit olivat: widget 2026-10-29T06:41:01Z, keyboard 2026-11-02T20:16:26Z, app 2026-11-03T07:06:36Z. Vanha `--check` antoi H=136, uusi H=16.
- `asenna.sh --head --uusi`: exit 0, `uusinta valmis profiili=2026-11-04T14:22:23Z`. Upotetut profiilit: Skoopit.app 14:22:23Z, SkoopitKeyboard.appex 14:22:25Z ja SkoopitWidget.appex 14:22:27Z. `--check` H=167 laite=connected; devicectl: com.example.skoopit asennettu.
- Simulaattori (xcresult): testKaynnistysAvaaListan --head Passed 1/1; testListaJaSkooppi SCOPES_KOE_AUKI="scopes ios" --head exit 0 ja korjauksen jälkeen ilman SCOPES_KOE_AUKIa Passed 1/1; testInfraJarjestys --head Passed 1/1.
- Lopussa asennettu versio oli HEADin uusin: äpin lähteisiin ei tullut committeja c2943e4d:n jälkeen tähän haaraan eikä mainiin, eikä työpuu ollut likainen.
