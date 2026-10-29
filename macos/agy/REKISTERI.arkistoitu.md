# scopes/macos/agy/REKISTERI.md

Tilanne: 18.10.2026

SEURAAVA PAKETTI: MACOS-AGY-VALMIS — skoopin perusmäärittely, asetusvalinnat, macOS AGY -ajaja ja päänäkymän kytkentä valmiit ja verifioitu — polut: scopes/macos/agy/** — aloitus: /pura scopes macos agy

## Tarkoitus ja raja

Tarkoitus: Integroida macOS:ssä pyörivä Antigravity (AGY) Scopes-äppiin. Mahdollistaa valinta ja ohjaus purku-, siirto- ja pakkaustoimintojen AGY-agenteille sen suhteen, käytetäänkö paikallista macOS AGY:tä vai OnePlus Linux AGY -malleja.
Raja: Polut `scopes/macos/agy/**` sekä macOS-sovelluksen AGY-integraatiot ja -asetukset (`scopes/macos/**`).

## Päätökset

- **Käyttäjä 17.10.2026:** skooppi `scopes macos agy` luotiin komennolla `/pura uusi scopes macos agy`.
- **Käyttäjä 17.10.2026:** Skoopin tehtävä on integroida macOS:ssä pyörivä AGY Scopes-äppiin. Ensimmäinen tehtävä on tehdä valinnat purku-, siirto- ja pakkaustoiminnassa mahdollisesti tarvittaville AGY-agenteille: käytetäänkö macOS AGY vai OnePlus Linux AGY -malleja. Ensimmäisenä toteutetaan asetukset-näkymään (Settings) tarvittavat valintavaihtoehdot.
- **Käyttäjä 17.10.2026:** Paketti MACOS-AGY-ASETUKSET valmistui: toteutettu MacSettingsView-asetuksiin toimintokohtaiset AGY-valinnat (purku, siirto ja pakkaus) ympäristölle (macOS AGY vs. OnePlus Linux AGY) ja mallille (Gemini Flash High/Med/Low, Claude Sonnet/Opus, GPT-OSS). Asetukset tallentuvat @AppStorage-avaimiin.
- **Käyttäjä 17.10.2026:** Paketti MACOS-AGY-KYTKENTA valmistui: ScopesClientiin lisätty runko-tuki toimintokutsuille, ja MacRootView-päänäkymän toiminnot (purku, automaattisiirto, pakkaus) kytketty lukemaan asetuksista valittu AGY-ympäristö ja malli ja välittämään ne toimintopyyntöihin. Verifioitu testein ja macOS-käännöksellä.
- **Käyttäjä 17.10.2026:** Paketti MACOS-AGY-TESTAUS valmistui: toteutettu MacAGYRunner-ajaja, joka havaitsee Macilla asennetun Antigravity CLI:n (~/.local/bin/agy) ja hakee/parsii mallit dynaamisesti (agy models). Kytketty MacSettingsView näyttämään paikallisen AGY:n asennustila ja lataamaan saatavilla olevat mallit. Verifioitu CLI-mallihaku ja ScopesMac-käännös.
- **Käyttäjä 17.10.2026:** Paketti MACOS-AGY-AUTOMAATIO valmistui: MacAGYRunneriin toteutettu luoPurkutiedosto ja suoritaStream paikallisen neutraalin mallittoman purun generointiin ja AGY-ajoon, ja kytketty MacRootView-näkymään purku-, siirto- ja pakkaustoiminnoille valitun ympäristön mukaisesti. Verifioitu ScopesMac-käännöksellä.
- **Käyttäjä 17.10.2026:** Käyttäjän pyynnöstä AGY-agentti- ja mallivalinnat (Purku, Siirto, Pakkaus: macOS AGY vs. OnePlus Linux AGY) tuotu myös iOS-sovellukseen (scopes/ios/Sources/Nakymat.swift: AsetuksetView -> AGYAsetukset). Käännetty ja asennettu onnistuneesti iPhoneen (skoopit-asennus.sh).
- **Käyttäjä 17.10.2026:** Käyttäjän pyynnöstä Macilla pyörivät AGY-mallit tuotu iOS Scopes -äpin mallivalintoihin (scopes/ios/Sources/MalliValikko.swift syöttörivin mallivalikkoon ja scopes/ios/Sources/PuraValinta.swift purkaja- ja istuntomallivalitsimiin). Käännetty ja asennettu iPhoneen.
- **Käyttäjä 18.10.2026:** macOS-äppiin toteutettu samat päänäkymät kuin iOS-äpissä työpöytäkonventioihin sovitettuina: Chat (MacChatView), Skoopit (MacRootView), Infra (MacInfraView skooppipuineen ja Linux-ohjauksineen), Android (MacAndroidView ruutukaappauksella ja kosketusohjauksella), Localregister (MacLrView), Pura-valinta (MacPuraValintaSheet) ja inspektori (MacInspectorView). Käännös verifioitu virheettömäksi.

- **17.10.2026:** Ryhmitellään Mac AGY -mallit paikalliseksi vaihtoehdoksi palvelimella pyörivien Linux AGY -mallien rinnalle iOS-asiakasohjelmassa

- **17.10.2026:** Mahdollistetaan mallikohtainen ja toimintokohtainen ohjaus purku-, siirto- ja pakkaustoiminnoille

- **17.10.2026:** Erotetaan ja tuetaan etäistuntojen (Mac) AGY-polkuja ja transkriptioita suoran paikallisen haun rinnalla Scopes-taustapalvelussa

- **17.10.2026:** AGYYmparisto-valinta paikallisen macOS AGY:n ja OnePlus Linux AGY -palvelimen välillä toimintokohtaisesti (purku, siirto, pakkaus)

- **17.10.2026:** MacAGYRunner toteutettu ja kytketty osaksi macOS-applikaatiota

- **17.10.2026:** AGYYmparisto-valinta paikallisen macOS AGY:n ja OnePlus Linux AGY -palvelimen välillä toimintokohtaisesti (purku, siirto, pakkaus)

- **17.10.2026:** MacAGYRunner toteutettu ja kytketty osaksi macOS-applikaatiota

- **17.10.2026:** Yhdistetty etähaaran muutokset ja synkronoitu scopes macos agy -skoopin tilat HISTORIA.md- ja REKISTERI.md-tiedostoihin

- **17.10.2026:** Pidetään scopes macos agy -skoopin polkurajaus tiukasti scopes/macos/agy/** -hakemistossa

- **17.10.2026:** Skoopin 'scopes macos agy' perusmäärittelyt, asetusvalinnat ja päänäkymän kytkennät pidetään valmiina ja verifioituina

- **17.10.2026:** Seuraava jatko etenee vahvistetun paketin mukaisesti

- **18.10.2026:** Kehitetty ja hiottu skoopin scopes macos agy toteutusta Scopes-standardien mukaisesti

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikallisen macOS AGY -ajon taustasuoritus ja seuranta | valmis 17.10.2026 | MACOS-AGY-AUTOMAATIO |

## Viat

| Vika | Tila |
|---|---|
| V-553 → scopes viat | avoin |
| V-555 → scopes viat: Mac AGY /automaattisiirto jättää keskustelun vanhaan istuntoon | avoin 18.10.2026 |

## Historia

Historia: `scopes/macos/agy/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
