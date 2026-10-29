# scopes/macos/REKISTERI.md

Tilanne: 20.10.2026

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 20.10.2026

## Tarkoitus ja raja

Tarkoitus: Natiivi macOS-työpöytäsovellus Scopes-infran ja Claude/AGY-istuntojen hallintaan ja viestintään. Rakenne on monialustainen siten, että jaettu bisneslogiikka (verkkorajapinta, NDJSON-suoratoisto, CRDT-rekisterisynkka ja mallit) eristetään jaettuun ScopesCore-pakettiin, jota käyttävät macOS ja iOS sekä myöhemmin Linux ja Windows.
Raja: Polut `scopes/macos/**` ja `scopes/shared/**`. Ei kata AGY-spesifisiä macos-integraatioita (kuuluvat `scopes agy macos` -skoopille) eikä palvelimen taustakoodia (kuuluvat `scopes yhteys` / `scopes palvelu`).

## Päätökset

- **Käyttäjä 20.10.2026:** scopes2-hallintatyö (19.–20.10. päätökset, avoimet asiat, viat, aikatauluennuste, valvoja) siirtyi skooppiin `scopes overseer`; tänne jää macOS-äppi (scopes/macos/**). Alkuperäiset historia- ja arkistorivit jäävät myös tänne.

- **Käyttäjä 17.10.2026:** Skoopin tarkoitus on tehdä natiivi macOS-äppi. Kehityksessä huomioidaan tuleva laajennus iOS:n lisäksi Linuxille ja Windowsille. Korjausten integrointi, jatkokehitys ja rakenteen muutokset kaikille alustoille keskitetään jaettuun ytimeen ilman pirstaloitumista.
- **Käyttäjä 17.10.2026:** Suunnitelman toteutus optimoidaan Gemini Flash 3.8 Low (Lite) -agenttien ajettavaksi atomisilla tehtävillä ja porttiverifioinnilla.
- **Käyttäjä 17.10.2026:** Paketti MACOS-MAARITTELY valmistui: määritelty tarkoitus, raja ja monialusta-arkkitehtuuri. Seuraava paketti on MACOS-RUNKO-JA-CORE.
- **Käyttäjä 17.10.2026:** Paketti MACOS-RUNKO-JA-CORE valmistui: ScopesCore-ytimeen lisätty viestien ja toimintojen rajapinnat ja testit, MacRootView-päänäkymään kytketty dynaaminen tilanhallinta, viestilista, MacChatInput, MacQuestionCard ja toiminnot. Verifioitu Mac-kohteessa (gate MAC-05 ja CORE-01).
- **Käyttäjä 17.10.2026:** Paketti MACOS-UI-VIIMEISTELY valmistui: kytketty MacCommands-pikanäppäimet NotificationCenteriin, täydennetty MacSidebar uuden skoopin painikkeella, lisätty MacMenuBar-tilanpäivitys ja MacRootView-automaattipollaus, pika-toiminnot ja uusi skooppi -sheet. Verifioitu Mac-kohteessa (gate MAC-05, MAC-06, MAC-16, MAC-18 ja CORE-01).
- **Käyttäjä 17.10.2026:** Paketti MACOS-ASETUKSET-JA-KEYCHAIN valmistui: toteutettu natiivi MacSettingsView-asetusikkuna (Cmd+,), palvelinosoitteen konfigurointi, API-avaimen hallinta ja tallennus macOS Avainnippuun (MacKeychain) sekä yhteyden varmennustesti. Verifioitu Mac-kohteessa (gate MAC-04, MAC-03 ja CORE-06).
- **Käyttäjä 17.10.2026:** Paketti MACOS-NDJSON-SUORATOISTO valmistui: ScopesClientiin lisätty suoratoistaViesti (AsyncThrowingStream) NDJSON-suoratoistolla ja yksikkötesteillä (testSuoratoistaViestiOnnistuu), kytketty MacRootView-näkymän viestien ja kysymysvastausten reaaliaikaiseen vastaanottoon automaattisella REST-varapudotuksella. Verifioitu Mac-kohteessa (gate MAC-05 ja CORE-03).
- **Käyttäjä 17.10.2026:** Paketti MACOS-INSPECTOR-JA-REKISTERI valmistui: toteutettu MacInspectorView, rekisterikatselin ja toimintopainikkeet (Pura/Pakkaa/Siirto), kytketty MacRootView-inspektoriin ja MacCommands-pikanäppäimeen (Cmd+Option+I), lisätty ScopesCore-mallit ja asiakasrajapinnat yksikkötesteineen. Verifioitu paikallisesti porttikriteerein (MAC-13, MAC-14, MAC-15).
- **Käyttäjä 18.10.2026:** Paketti MACOS-CHAT-JA-TYOKALUPALKKI valmistui: alustettu jaettu ScopesUI-paketti (Viestikupla.swift, MalliValikko.swift, KayttorajaRenkaat.swift), kytketty MacRootView- ja MacChatView-näkymiin jaettu Viestikupla sekä tuotu mallivalitsin ja 5h/viikko-käyttörajapalkki työkalupalkkiin. Verifioitu paikallisesti porttikriteerein (MAC-09, MAC-12).
- **Käyttäjä 18.10.2026:** Paketti MACOS-DRAG-AND-DROP valmistui: toteutettu LiitteetMac.swift (Finder-tiedostojen ja leikepöydän käsittely), kytketty MacChatInput-syöttökenttään tiedostojen raahaus ja pudotus (.tiedostojenPudotus) sekä liitetiedostojen pikavalinta (NSOpenPanel). Verifioitu paikallisesti porttikriteerein (MAC-17).

- **17.10.2026:** Käytetään SwiftUI MenuBarExtra -komponenttia tilannekatsauksen esittämiseen valikkopalkissa

- **17.10.2026:** Toteutetaan AskUserQuestion-kyselyt natiiveina macOS-korttinäkyminä kerta- ja monivalintatuella

- **17.10.2026:** Yhdenmukaistetaan pikanäppäimet ja sivupalkkisuodatukset macOS-käyttöliittymäkonventioiden mukaisiksi

- **17.10.2026:** Käytetään jaettua ScopesCore-kirjastoa macOS- ja iOS-toteutuksissa monialusta-arkkitehtuurin mukaisesti

- **17.10.2026:** Toteutetaan macOS-käyttöliittymä natiivina SwiftUI-näkymänä (MacRootView) hyödyntäen ScopesClient-rajapintaa

- **17.10.2026:** Käytetään macOS-ympäristössä järjestelmän natiivia Settings-ikkunaa ja macOS Avainnippua (MacKeychain) API-avaimen turvalliseen säilytykseen

- **17.10.2026:** Suoratoistossa käytetään NDJSON-muotoa (application/x-ndjson) ja URLSession.shared.bytes -suoratoistorajapintaa

- **17.10.2026:** ScopesCore (scopes/shared/ScopesCore) toimii jaettuna monialustaytimenä iOS- ja macOS-toteutuksille

- **17.10.2026:** scopes/shared/ScopesCore sisällytetään pakkaus- ja git-seurantaan osana scopes macos -skoopin piiriä

- **18.10.2026:** Kehitetty ja hiottu skoopin scopes macos toteutusta Scopes-standardien mukaisesti

- **19.10.2026:** MULTI-01..03 odottavat scopes architecturen suunnitelmaa (K-1…K-8), koska jaetun ytimen ja liitereitin rakenne ratkaistaan siellä.

- **19.10.2026:** Käyttäjä 19.10.2026: MAC-17 korjataan heti (ei odoteta ARK-08:aa); sama `lahetaLiite` kelpaa ARK-08:lle.

- **19.10.2026:** Käyttäjä 19.10.2026: ARK-03 kirjataan scopes macos -rekisteriin avoimeksi asiaksi (riippuu ARK-02).

- **19.10.2026:** MULTI-02/03 merkitty korvatuiksi K-4:n perusteella (Linux/Windows = TS-web + Tauri 2).

- **19.10.2026:** Käyttäjä 19.10.2026: Macin 8787-yhteys odottaa ARK-08:aa, ei väliaikaista korjausta.

- **20.10.2026:** Käyttäjä 20.10.2026: MULTI-01, ARK-03, Macin 8787 korvattu scopes-V2:lla (70ca4a81).

- **20.10.2026:** Käyttäjä 20.10.2026: overseerin asiat (palvelinpuun synkka, kayttoraja-koukku, transkriptikopiot ym.) eivät kuulu scopes macosille; ne hoitaa scopes overseerin oma istunto.

- **20.10.2026:** Käyttäjä 20.10.2026: Haiku-valvojan skooppi on scopes vahtimestari.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|
| V-628 (scopes macos): ScopesMac kaatui käynnistyksessä. | korjattu d14a726e; odottaa ajoa |

## Historia

Historia: `scopes/macos/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
