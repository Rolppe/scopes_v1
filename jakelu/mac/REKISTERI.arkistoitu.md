# scopes/jakelu/mac/REKISTERI.md

Tilanne: 13.10.2026

SEURAAVA PAKETTI: DEMO-SCOPES-UUSINTA-TODENNUS — todenna Skoopit-äpin ensimmäinen ajastettu allekirjoituksen uusinta Macin lokista aikaisintaan 18.10.2026 klo 11.20 (`ssh dev-host 'tail -3 ~/scopes-ios/ajastus.loki ~/scopes-ios/asennus.loki'`); allekirjoitus vanhenee 20.10.2026 klo 11.20 — polut: scopes/ios/mac/** — aloitus: /pura scopes jakelu mac

## Tarkoitus ja raja

Macin allekirjoitus ja 7 päivän uusinta: ios/mac/ (LaunchAgent com.example.skoopit-asennus, skoopit-asennus.sh)

## Päätökset

- **Käyttäjä 13.10.2026:** skooppi `scopes jakelu mac` luotiin jakamalla `scopes` ominaisuuksittain (luo-skooppi.mjs `scopes jakelu mac`.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Allekirjoituksen 7 pv uusinta | korjattu 13.10.2026 (automatisoitu, DEMO-SCOPES-UUSINTA; ensimmäinen ajastettu uusinta todentamatta; allekirjoitus vanhenee noin 20.10.2026); odottaa päivää 18.10.2026 (todenna viim. 20.10.2026 klo 11.20, jolloin allekirjoitus vanhenee) (todenna viim. 27.10.2026) | aikaisintaan 18.10.2026 klo 11.20: `ssh dev-host 'tail -3 ~/scopes-ios/ajastus.loki ~/scopes-ios/asennus.loki'` → `uusinta valmis profiili=<myöhempi kuin 2026-10-20T08:20:55Z>`; jos `lukittu`, Macin näyttö auki; muuten käsin `bash scopes/ios/asenna.sh` lipulla `--uusi` (näyttö auki) ennen 20.10.2026 klo 11.20 **13.10.2026:** todentamatta: varsinainen ajastettu uusinta näyttö auki (laukeaa kun H < 48, noin 18.10.2026 klo 11.20 Suomen aikaa), `laite poissa` -haara ja Macin ilmoitus. |

## Viat

| Vika | Tila |
|---|---|
| V-447 → scopes viat | avoin |

## Historia

Historia: `scopes/jakelu/mac/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
