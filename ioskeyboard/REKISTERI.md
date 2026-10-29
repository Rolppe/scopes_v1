# scopes/ioskeyboard/REKISTERI.md

Tilanne: 27.10.2026

SEURAAVA PAKETTI: IOSKEYBOARD-TOIMINNOT — toteuta natiivitoiminnot (kaksoisvälilyönti pisteeksi, automaattinen suuraakkonen lauseen alussa) — polut: scopes/ioskeyboard/Sources/** — aloitus: /pura scopes ioskeyboard — automaattinen: kyllä

## Tarkoitus ja raja

**Tarkoitus:** Tehdä iOS:lle mahdollisimman natiivi näppäimistö (iOS Custom Keyboard Extension), jota käytetään Scopes-äpissä. Näppäimistössä on suomenkielinen asettelu (å, ä, ö) ja erityisesti vaaka-asennossa (landscape) näppäimistön keskelle sijoitetut lisänapit/toimintonäppäimet (käyttäjä 26.10.2026).

**Raja:**
- Sisällä: iOS Custom Keyboard Extension (UIInputViewController), natiivi suomenkielinen näppäimistöasettelu, vaakatilan asettelu lisänapeilla keskellä (split-layout lisänäppäinalueella), visuaalinen natiivi-ilme (painikkeiden muoto, varjostus, vaalea/tumma teema, haptiikka) ja syötteen välitys (`textDocumentProxy`).
- Ulkona: Scopes-äpin pääviestintä- ja syöttökenttälogiikka (`scopes chat`, `scopes chat maininput`), muut kuin näppäimistölaajennukseen liittyvät Scopes-toiminnot ja palvelinrajapinnat.

## Päätökset

- **Käyttäjä 26.10.2026:** skooppi `scopes ioskeyboard` luotiin komennolla `/pura uusi scopes ioskeyboard`.
- **Käyttäjä 26.10.2026:** Toteutetaan iOS Custom Keyboard Extension. Tarkoitus on tehdä suomenkieliseen näppäimistöön vaaka-asentotilaan lisänappeja näppäimistön keskelle, ja tuntuman/ulkoasun tulee olla mahdollisimman natiivi.
- **26.10.2026 (IOSKEYBOARD-SUUNNITTELU):** Arkkitehtuuri ja asettelut suunniteltu (`scopes/ioskeyboard/SUUNNITELMA.md`). Pystytilaan suomi-QWERTY ja vaakatilaan kahdelle peukalolle optimoitu split-asettelu.
- **Käyttäjä 26.10.2026:** Vaakatilan näppäimistön keskelle tulee kaksi vierekkäistä pystyriviä näppäimiä (toistaiseksi valittu: vasen sarake `/`, `:`, `"`, `◀` ja oikea sarake `\``, `-`, `_`, `▶`).
- **26.10.2026 (IOSKEYBOARD-RUNKO):** Laajennuksen perusrunko toteutettu (`scopes/ios/Keyboard/`, XcodeGen-target `SkoopitKeyboard`, UIInputViewController + SwiftUI KeyboardRootView). Pystytilassa toimiva suomi-QWERTY ja vaakatilassa split-layout kahdella keskipystyrivillä. Käännös todennettu Macilla puhtaasti (exit 0).
- **26.10.2026:** Vaakatilan asettelu jaetaan kolmeen osaan: vasen peukalolohko, oikea peukalolohko ja kaksi keskimmäistä pystyriviä.
- **26.10.2026:** Keskimmäiset pystyrivit varataan komentojen ja koodin erikoismerkeille (/, `, :, -, ", _) sekä kohdistinnuolille (◀, ▶).
- **27.10.2026 (IOSKEYBOARD-TODENNUS):** Näppäimistölaajennuksen toiminta todennettu iOS-simulaattorissa ja yksikkö-/UI-testisarjassa (KeyboardUITests, 5/5 testiä exit 0). Vaakatilan asettelun mittasuhteet hienosäädetty suhteeseen 5:6 siten, että vasemman ja oikean siiven näppäimillä on identtinen leveys. Lisätty numeroiden (123) ja symbolien (#+=) tuki myös vaakatilan split-asetteluun siten, että keskisarakkeiden koodausmerkit pysyvät aina samoilla paikoillaan. Fonttikoot ja safe-area-reuna-asettelut viimeistelty.
- **27.10.2026 (IOSKEYBOARD-TUNTUMA):** Natiivi tuntuma viimeistelty: toteutettu keskitetty `KeyboardFeedback` haptiselle palautteelle (`UIImpactFeedbackGenerator` ja `UISelectionFeedbackGenerator`) ja järjestelmä-äänille (`AudioServicesPlaySystemSound` sound-ID:t 1104, 1155, 1156 sekä `UIDevice.playInputClick`). Toteutettu natiivit pitkän painalluksen vaihtoehtoiset merkit (`AlternateCharacters`), näppäinesikatselu (`KeyPreviewCallout`) ja liukumalla valittava popover (`KeyPopoverView`), joka huomioi reuna-asettelut ja suuraakkostilan. Todennus KeyboardUITests-sarjassa (8/8 testiä exit 0).
- **Käyttäjä 27.10.2026:** Korjataan näppäimistön natiivipuutteet ja rotaatiopugi yksi kerrallaan. Ensimmäisenä rotaatiopuki ja asennon tunnistus (IOSKEYBOARD-ROTAATIO), minkä jälkeen asettelujen tasaleveydet ja safe-areat (IOSKEYBOARD-ASETTELU), visuaalinen tyyli ja calloutit (IOSKEYBOARD-TYYLI) sekä natiivitoiminnot (IOSKEYBOARD-TOIMINNOT).
- **27.10.2026 (IOSKEYBOARD-ROTAATIO):** Korjattu pystytilaan palatessa vaakatilan asettelun ja korkeuden jumiutuminen. Näppäimistön oma leveys on aina sen korkeutta suurempi, joten pelkkä view.bounds.width > view.bounds.height piti vaakatilan päällä. Korjattu asennon tunnistus käyttämään traitCollection.verticalSizeClassia (compact = vaakatila, regular = pystytila), ruudun suhdetta ja transitionCoordinator-korkeusanimaatiota sekä synkronoitu näkymä KeyboardViewState-tilamallilla. Todennus simulaattorissa ja KeyboardUITests-testisarjassa (8/8 testiä exit 0).
- **27.10.2026 (IOSKEYBOARD-ASETTELU):** Korjattu näppäimistön asettelut, tasaleveydet ja safe-areat. Pystytilassa kaikilla kirjainnäppäimillä (q..å, a..ä, z..m) on identtinen leveys ja rivin 3 Shift ja Delete jakavat reunoilla saman tasaleveyden. Numerotilassa ja symbolitilassa välimerkeillä on yhtenäinen tasaleveys ja reunapainikkeet (#+=, Delete) ovat symmetriset. Vaakatilassa molempien siipien kirjainnäppäimillä on identtinen leveys (11 näppäimen grid), oikeaan siipeen lisätty luontevat pilkku ja piste (b, n, m, ,, .) ja Delete tasaleveyksillä. Safe-areat (Dynamic Island, näytön kaarevat reunat ja koti-indikaattori) luetaan UIKitista ja huomioidaan dynaamisesti pehmusteissa taustan säilyessä reunasta reunaan. Todennus KeyboardUITests-testisarjassa (9/9 testiä exit 0).
- **27.10.2026 (IOSKEYBOARD-TYYLI):** Näppäimistön visuaalinen tyyli ja callout-kupla viimeistelty natiiville iOS-tasolle. Toteutettu aidot Apple iOS -liukuvärit näppäimille vaaleassa ja tummassa teemassa, 1 pt:n terävä näppäinvarjostus ja 0.5 pt:n painallusupotus. Toteutettu natiivi Shift/CapsLock-tyyli, jossa aktiivinen tila kytkee näppäimen valkoiseksi mustalla nuolella molemmissa teemoissa. Toteutettu aito bezier-kaulainen puhekuplasiluetti näppäinesikatselulle (KeyCalloutShape ja KeyPreviewCallout), joka huomioi reunakohdistukset (.leading, .trailing, .center) laitojen näppäimillä (q, a, å, ä) ja suodattuu pois vaakatilassa. Viimeistelty myös popover-vaihtoehtovalikon pyöristykset ja sininen valintakorostus. Todennus simulaattorissa ja KeyboardUITests-testisarjassa (9/9 testiä exit 0).

- **27.10.2026:** Aito Apple iOS -siluetti KeyCalloutShape bezier-kaulalla toteutettu ja kohdistus (CalloutAlignment) eri laitojen näppäimille huomioitu.

- **27.10.2026:** Shift- ja CapsLock-toimintojen visuaalinen aktiivisuustila noudattaa natiivia iOS-logiikkaa (valkoinen tausta, musta nuoli molemmissa teemoissa).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rotaatiopuki ja asennon tunnistus | valmis (IOSKEYBOARD-ROTAATIO) (todenna viim. 10.11.2026) | - |
| Näppäimistön asettelujen ja tasaleveyksien korjaus | valmis (IOSKEYBOARD-ASETTELU) (todenna viim. 10.11.2026) | - |
| Visuaalisen tyylin ja callout-kuplan viimeistely | valmis (IOSKEYBOARD-TYYLI) (todenna viim. 10.11.2026) | - |
| Natiivitoimintojen (kaksoisvälilyönti, auto-caps) toteutus | avoin | paketti IOSKEYBOARD-TOIMINNOT |
| Näppäimistön todennus ja asettelusäädöt | valmis (IOSKEYBOARD-TODENNUS) (todenna viim. 10.11.2026) | - |
| Natiivi tuntuma (haptiikka, äänet, popoverit) | valmis (IOSKEYBOARD-TUNTUMA) (todenna viim. 10.11.2026) | - |
| Työkloonin juuripuun haarautuma ja unmerged-ristiriidat | avoin | Ihmisen suoritettava rebase/synkronointi tarvittaessa |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/ioskeyboard/HISTORIA.md` (päivitetty 27.10.2026), ei lueta purussa.
