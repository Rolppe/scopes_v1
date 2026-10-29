# scopes/ios/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ei mitään — V-338, V-331, V-447 ja V-489 suljettu 28.10.2026; seuraava työ valitaan käyttäjän kanssa (V-285 on scopes viatin toistuva seurantatehtävä; jäljellä päällekkäiset omistukset) — polut: scopes/ios/** — aloitus: /pura scopes ios

## Tarkoitus ja raja

**Tarkoitus (käyttäjä 28.10.2026):** Scopes 1 -äpin (iOS, `scopes/ios/`) omistaja: äpin runko, rakennus ja asennus, Macin allekirjoitus ja 7 päivän uusinta sekä simulaattoritestit.

**Raja (käyttäjä 28.10.2026, IOS-MAARITTELY):**
- Sisällä: kaikki `scopes/ios/**`, jota polkukartta (`Infra/skills/keskustelun-siirto/SKILL.md`, Polusta skooppiin) ei anna muulle skoopille. Näitä ovat `project.yml`, `asenna.sh`, `Resources/`, `mac/` (LaunchAgent com.example.skoopit-asennus, skoopit-asennus.sh), `UITests/`, `testi.sh`, `mittaa.sh`, `tunneli/`, `Keyboard/` (äpin kopio), `Widget/`, `Jaettu/` ja Sources-tiedostot ilman omaa riviä (Android, Diagnostiikka, Liitteet, Lr, LrNakymat, MalliValikko, Reitti, Ulkoasu).
- Ulkona: polkukartan ominaisuusskoopeille antamat Sources-tiedostot (Viestit → chat, Sivupalkki ja Juuri → lista, Infra, Nakymat ja Malli → infra, Asetukset ja Asiakas → yhteys, Teema → design, Ilmoitukset → notifications). scopes2-äppi (`scopes2/ios/`). `scopes/shared/` (ScopesCore) ei ole iOS-targetin käytössä (project.yml, ei `import ScopesCore`).

## Päätökset

- **Käyttäjä 28.10.2026:** skooppi `scopes ios` luotiin komennolla `/pura uusi scopes ios`.
- **Käyttäjä 28.10.2026:** tarkoitus on Scopes 1 -äpin omistaja. Ensimmäinen työ oli nykytilan kartoitus.
- **Käyttäjä 28.10.2026:** raja "loput sekä jakelu ja testit". Skoopit `scopes testit`, `scopes jakelu` ja `scopes jakelu mac` arkistoitiin (`arkistoi-skooppi.mjs`, rekisterit `REKISTERI.arkistoitu.md`), ja niiden polut siirtyivät tälle skoopille. Arkistointityökalu jätti polkukarttaan rivit ilman `/**`-loppua, ja ne korjattiin käsin (V-706 → claude siirto).
- **Käyttäjä 28.10.2026:** ensimmäinen paketti oli V-338 (`--head`-lippu). `asenna.sh` ja `testi.sh` ottavat lähteet tiedoston `lahde.sh` kautta: oletuksena työpuu, ja lipulla `--head` committoitu HEAD (`git archive`). Kumpikin tulostaa rivin `lähde:` ja sen, montako committoimatonta muutosta on mukana tai jää pois. Todennettu: paikallinen vertailu (likainen muutos jää pois HEAD-tilassa) ja `SCOPES_VAIN="testKaynnistysAvaaListan" bash scopes/ios/testi.sh --head` → exit 0, xcresult Passed 1/1. `asenna.sh --head` jäi ajamatta, koska se asentaisi puhelimeen. Se käyttää samaa funktiota. `Keyboard/Info.plist` on gitignoressa (`scopes/ios/.gitignore:2`) ja XcodeGen generoi sen, joten se puuttuu `--head`-tarrista oikein.
- **28.10.2026, V-331-LISTATESTI:** testListaJaSkooppi kaatui, koska sen auki olevan skoopin oletus oli kiinteä "scopes lista", joka oli pakattu (V-427). Oletus on nyt listan ylin skooppi, jonka testi jo väittää auki olevaksi; `SCOPES_KOE_AUKI` ohittaa sen yhä. Todennettu: `SCOPES_VAIN="testListaJaSkooppi" bash scopes/ios/testi.sh` ilman `SCOPES_KOE_AUKI`:a → exit 0, xcresult Passed 1/1, 0 ohitettua.
- **28.10.2026, V-447:** `skoopit-asennus.sh` uusi vain äpin oman profiilin: `omapro()` tunnisti vain bundle-tunnuksen `com.example.skoopit`, ja H laskettiin pelkästä äpin profiilista. Macilla Widgetin profiili vanhenee 29.10.2026 klo 06.41 UTC ja Keyboardin 2.11., vaikka äpin profiili on voimassa 3.11. asti. Nyt `omapro()` tunnistaa myös laajennukset (.widget, .keyboard), ja H, VANHA ja EXP lasketaan aikaisimmasta profiilista (`lahin()`). Todennettu Macilla väliaikaisella kopiolla: `--check` antaa H=16 (vanha 136), ja omia profiileja löytyy 3. Vietiin Maciin käyttäjän luvalla komennolla `bash scopes/ios/asenna.sh --head --uusi` (exit 0, `uusinta valmis profiili=2026-11-04T14:22:23Z`). Upotettujen profiilien vanhenemisajat: Skoopit.app 4.11. 14.22.23Z, SkoopitKeyboard.appex 14.22.25Z ja SkoopitWidget.appex 14.22.27Z. `--check` antaa H=167, ja äppi on asennettu puhelimeen (devicectl).
- **28.10.2026, V-489:** vika ei enää toistu. testInfraJarjestys kirjoitettiin 27.10.2026 uudelleen Allscope-puun testiksi (37019605), eikä se enää oleta claude- ja infra-kortteja vierekkäin. `SCOPES_VAIN="testInfraJarjestys" bash scopes/ios/testi.sh --head` → exit 0, xcresult Passed 1/1.
- **28.10.2026 (todennettu Macin lokista):** jakelu macin avoin asia "Allekirjoituksen 7 pv uusinta" on valmis. Ajastettu uusinta ajettiin 20.10. ja 27.10. (`ajastus.loki`: `uusinta H=47`), ja `asennus.loki` 27.10.: `uusinta valmis profiili=2026-11-03T07:06:36Z`. Lokit ovat nyt polussa `~/Projects/scopes/scopes-ios/` (PARAMETRISOINTI-1). Todentamatta jäivät `laite poissa` -haara ja Macin ilmoitus.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Päällekkäiset omistukset | kesken; odottaa skooppia performance ios (ilmoitettu V-707–V-710 28.10.2026) | omistajat ratkaisevat rajan; ilmoitettu tiedoksi: performance ios (rivi 16 ottaa koko `scopes/ios/**`), siirto agymacos (rivi 11 ottaa `scopes/ios/Sources/**`), ioskeyboard (`scopes/ios/Keyboard/` on käsin synkattu kopio), sideloader (mac-ketju otetaan nyt `scopes ios`:lta, ei jakelu macilta) |
| Seuraava profiilien uusinta | avoin; odottaa ajoa (todenna viim. 4.11.2026) | LaunchAgent uusii, kun H < 48 (noin 2.11.2026). Todenna, että kaikki kolme profiilia uusiutuvat: Macin `ajastus.loki` ja PP-profiilit (`~/Projects/scopes/scopes-ios/`) |
| Jakelu macilta perityt todentamatta: `laite poissa` -haara ja Macin ilmoitus | avoin; odottaa ajoa (kirjattu 28.10.2026) | todenna, kun laite on seuraavan kerran poissa uusinnan hetkellä |

## Viat

| Vika | Tila |
|---|---|
| V-273 → scopes viat | tiedoksi (testit) |
| V-274 → scopes viat | tiedoksi (testit) |
| V-278 → scopes viat | tiedoksi (testit) |
| V-280 → scopes viat | tiedoksi (testit) |
| V-281 → scopes viat | tiedoksi (jakelu) |
| V-283 → scopes viat | tiedoksi (testit) |
| V-285 → scopes viat | avoin (testit) |
| V-292 → scopes viat | tiedoksi (testit) |
| V-297 → scopes viat | tiedoksi (testit) |
| V-489 → scopes viat | korjautunut 28.10.2026 (testi uudistettu 37019605; Passed HEADilla) |
| V-706 → claude siirto | korjattu käsin 28.10.2026 (arkistoi-skooppi.mjs jätti polkukarttarivit ilman `/**`-loppua ja nimen luetteloon; työkalun korjaus omistajalla) |

## Historia

Historia: `scopes/ios/HISTORIA.md`, ei lueta purussa.
