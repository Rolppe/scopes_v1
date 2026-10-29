# scopes/usagelimits/REKISTERI.md

Tilanne: 28.10.2026

SEURAAVA PAKETTI: ei mitään — suunnitellut paketit (USAGELIMITS-PALVELU, USAGELIMITS-MALLIVALIKKO, USAGELIMITS-PURKAVALINTA) valmiit ja todennettu — polut: scopes/usagelimits/** — aloitus: /pura scopes usagelimits

## Tarkoitus ja raja

**Tarkoitus:** Käyttörajojen (usage limits, rate limits, kiintiöt ja varoitukset) esille tuonti skoopin ajossa olevalla mallilla sekä mallin valintakohdissa Scopes-äpissä (käyttäjä 26.10.2026).

Raja: Polut `scopes/usagelimits/**`, `scopes/ios/Sources/PuraValinta.swift`, `scopes/macos/Sources/MacPuraValintaSheet.swift`, `scopes/macos/Sources/MacRootView.swift`, `scopes/shared/ScopesCore/Sources/ScopesCore/Models/ScopeModels.swift`, `scopes/shared/ScopesUI/Tests/ScopesUITests/ScopesUITests.swift`.
- Sisällä: Käyttörajatiedon esitystapa, tilailmaisimet ja indikaattorit skoopin ajossa olevalle mallille sekä käyttörajojen visualisointi mallin valintakohdissa.
- Ulkona: Yleinen mallien valinta- ja validointilogiikka (`scopes models`), palvelinpuolen kiintiöiden haku ja laskentalogiikka (`scopes palvelu`, `scopes agy usage`), sekä laajempi käyttöliittymämuutos ilman käyttörajakytkentää. Mahdolliset muutokset toisiin skoopeihin koordinoidaan TYÖTAVAT säännön 15 mukaisesti.

## Päätökset

- **Käyttäjä 26.10.2026:** skooppi `scopes usagelimits` luotiin komennolla `/pura uusi scopes usagelimits`.
- **Käyttäjä 26.10.2026:** skoopissa keskitytään käyttörajojen esille tuontiin skoopin ajossa olevalla mallilla sekä mallin valintakohdissa.
- **Kartoitus 26.10.2026 (USAGELIMITS-KARTOITUS):** kartoitus valmis (`scopes/usagelimits/KARTOITUS.md`). Nykyiset valitsimet (`MalliValikko`, `PuraValinta`, `MacPuraValintaSheet`, `Chat`) ovat sokeita käyttöajoille; syöttörivin aktiiviselta mallilta puuttuu käyttöaste. Suunniteltu koottu `/api/kayttoraja`-tuki ja mallikohtaiset indikaattorit.
- **Käyttäjä 26.10.2026:** tehdään ensin jako että macos agy ja oneplus agy käyttöraja haetaan erikseen.
- **Toteutus 26.10.2026 (USAGELIMITS-PALVELU):** taustapalveluun toteutettu `luoMacAgyKayttoraja` ja `luoAgyKayttoraja` (OnePlus), `/api/kayttoraja?ymparisto=macos` ja koottu `/api/kayttorajat-kaikki` (sekä `?kaikki=1`). Testattu palvelun testit 181/181 ja live-kyselyllä: OnePlus AGY 1464/1500 ja Mac AGY 1156/1500 haetaan erikseen omista lähteistään.

- **26.10.2026:** macOS ja OnePlus Linux AGY kiintiöt eriytetään itsenäisiksi mittauksiksi ja tiloiksi

- **26.10.2026:** Macin AGY-tilannetta haetaan SSH-yhteydellä tai lokaalisti 30 sekunnin välimuistilla
- **Toteutus 27.10.2026 (USAGELIMITS-MALLIVALIKKO):** Tuotu käyttöasteet ja kiintiötiedot (Claude, OnePlus AGY ja Mac AGY) näkyviin istunnon aikaisessa `MalliValikko.swift`:ssa (iOS ja jaettu ScopesUI), viestinäkymän syöttörivin aktiivisella mallilla sekä yleisessä chatissa (`ChatView`). Lisätty aktiivisen mallin käyttöasteprosentti ja tilaindikaattoripiste syöttörivin nappiin (värikoodit: <85% harmaa, >=85% oranssi, 100% punainen) sekä varoitusbanneri viestikentän yläpuolelle käyttöasteen ylittäessä 90 %. Mallivalikon osioissa ja riveillä näytetään kootut kiintiötiedot (`KayttorajatKaikki`). Testattu Swift-testit (ScopesCore 22/22, ScopesUI 4/4) ja asennettu suoraan iPhoneen (`skoopit-asennus.sh`, exit 0).
- **Korjaus 27.10.2026:** Korjattu AGY-käyttörajan virheellinen laskenta ja esitystapa. `laskePyyntomaara` laski aiemmin jokaisen sisäisen työkalukutsun `PLANNER_RESPONSE`-askeleen, jolloin 65 todellista pyyntöä kasvoi yli 2600:aan ja aiheutti virheellisen 100 % täyttymisen ja varoitukset (2490/1500). Korjattu laskemaan todelliset `USER_INPUT`-pyynnöt. Korjattu myös `palvelin.mjs`:n Mac-ympäristön tunnistus `agentti`-parametrilla sekä `KayttorajatKaikki.raja` tunnistamaan mallinimet ilman `mac-agy/`-etuliitettä (esim. `gemini-3.8-flash-high`). Testattu palvelun ja UI:n testit sekä asennettu korjattu versio puhelimeen (`skoopit-asennus.sh`).
- **Toteutus 27.10.2026 (USAGELIMITS-PURKAVALINTA):** Tuotu käyttörajatiedot ja kiintiövaroitukset purkunäkymiin:
  - `PuraValinta.swift`: PurkuValitsimet hakee `kayttorajatKaikki()`-tiedot rinnakkain mallivalintojen kanssa. Purkaja- ja mallivalintojen riveillä ja ryhmäotsikoissa näytetään tiiviit kiintiötiedot (`tiivisTeksti`), valitun mallin ja purkajan kiintiötila esitetään selitekentissä, ja jos valittu malli tai purkaja on täynnä (100 %) tai lähes täynnä (>= 85 %), näkymään ilmestyy selkeä varoitusosio (`pura-kayttoraja-varoitus`), joka suosittelee vapaamman mallin tai purkajan valintaa. Toimii automaattisesti sekä skoopin purkuarkissa että uuden skoopin luontiarkissa.
  - `MacPuraValintaSheet.swift`: Hakee käyttörajatiedot, rikastuttaa purkuympäristö- ja purkajamallivaihtoehdot käyttöastelukemilla, ja renderöi varoituslaatikon (`mac-pura-kayttoraja-varoitus`), mikäli valitun ympäristön tai mallin kiintiö on täynnä tai kriittinen.
  - Todennus: Testattu Node.js-testit (47/47 pass), ScopesCore-testit (22/22 pass), ScopesUI-testit (4/4 pass), ScopesMac käännetty xcodebuildilla puhtaasti (exit 0), ja iOS-äppi käännetty ja asennettu iPhoneen (`skoopit-asennus.sh`, exit 0).

- **Toteutus 27.10.2026 (USAGELIMITS-RENKAAT-SELITYS):** Käyttörajarenkaiden napautuksesta aukeavan selityksen muotoilu ja tarkennus skoopin ajomallin mukaan:
  - Otsikoksi tulee aktiivisen mallin mukainen käyttörajan nimi (esim. `Mac AGY`, `OnePlus Linux AGY`, `Claude`).
  - 5 tunnin rivi: `5h - <prosentti>% (yellow) Reset in <aika>` (esim. `5h - 29% (yellow) Reset in 4h 52min`).
  - Viikon rivi: `Vk - <lukema> (red) Reset <aika>` (esim. `Vk - 19 / 1500 (red) Reset 5d 16h 5min`).
  - Ajan countdown-laskenta ISO-aikaleimasta päivinä, tunteina ja minuutteina.
  - Taustapalvelussa (`agy-kayttoraja.mjs`) viikon `nollautuu`-aikaleima säilytetään todellisesta viikkokiintiöstä (`kiintioViikko`), jolloin viikkorajan nollautumisaika näyttää oikean viikkosyklin päivämäärän (5d ...) pelkän vuorokautisen pyyntöresetoitumisen sijaan.
  - Todennus: ScopesUI-testit (6/6 pass, ml. muotoilu- ja fallback-testit), palvelun testit (184/184 pass), iOS-käännös (exit 0) ja asennus iPhoneen (`skoopit-asennus.sh`, exit 0).

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **27.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia

- **27.10.2026:** Noudatettu V-KORD-5 ja TYÖTAVAT 10 & 15 sääntöjä: toisten skooppien selvittämättömiin git-ristiriitoihin ei koskettu eikä pakotettuja rebase/reset-toimintoja suoritettu ilman ihmistä

- **28.10.2026:** Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia


## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/usagelimits/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
