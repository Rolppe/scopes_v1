# scopes macos — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 17.10.2026 — scopes macos

### Tarkoitus ja raja — poistettu tai muutettu

Määrittelemättä: skooppi luotiin komennolla `/pura uusi scopes macos` 17.10.2026 ilman tarkoitusta; paketti MACOS-MAARITTELY kirjaa sen.

### Päätökset — poistettu tai muutettu

- **Käyttäjä 17.10.2026:** skooppi `scopes macos` luotiin komennolla `/pura uusi scopes macos`.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 17.10.2026 | paketti MACOS-MAARITTELY |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| MACOS-RUNKO-JA-CORE perustus | valmis aloitettavaksi | toteuta ScopesCore-paketin runko ja gate.sh |

## 17.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MACOS-MAARITTELY — kirjaa käyttäjän kanssa skoopin tarkoitus, raja ja ensimmäinen työ, ja korvaa tämä rivi ensimmäisellä oikealla paketilla — polut: scopes/macos/** — aloitus: /pura scopes macos

## 17.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MACOS-UI-VIIMEISTELY — macOS-näkymän tilanhallinnan ja vuorovaikutusten viimeistely — polut: scopes/macos/** — aloitus: /pura scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| macOS-käyttöliittymän tilanhallinnan ja vuorovaikutusten viimeistely | avoin | Toteuta paketti MACOS-UI-VIIMEISTELY MacRootView- ja MacSidebar-näkymiin |

## 18.10.2026 — scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Jaetut chat-kuplat ja mallivalitsin (MAC-09, MAC-12) | avoin | ScopesUI-viestikuplat ja työkalupalkki |
| macOS-inspektori ja rekisterikatselin (MAC-13, MAC-14, MAC-15) | valmis | Toteutettu MacInspectorView, rekisterikatselin ja toimintopainikkeet (Pura/Pakkaa/Siirto) |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Jaetut chat-kuplat ja mallivalitsin (MAC-09, MAC-12) | valmis | Toteutettu jaettu ScopesUI, Viestikupla, MalliValikko ja KayttorajaRenkaat |

## 19.10.2026 — scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Monialustalaajennukset (MULTI-01..03) | avoin | iOS-linkitys ScopesCoreen, Linux- ja Windows-validointi |

## 19.10.2026 — scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| MULTI-02, MULTI-03 Swift Linuxilla ja Windowsilla | korvattu (K-4, 19.10.2026) | Linux ja Windows saavat TypeScript-web-asiakkaan Tauri 2 -kuoressa (ARK-10, ARK-11, skoopit `scopes web`, `scopes linux`, `scopes windows`); ScopesCoren `swift build` näillä alustoilla ei ole enää tavoite. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| **MAC-17** (19.10.2026): pudotettu tai valittu tiedosto ei päätynyt Claudelle, koska viestiin meni Macin polku `/Users/...`. **Korjattu 19.10.2026:** `ScopesClient.lahetaLiite` + `LiiteVastaus` (ScopesCore) ja `LiitteetMac.lahetaJaMuotoile`; `MacChatInput` pitää liitelistan (sirut, poisto, kansiot pois), `MacRootView` lähettää liitteet ennen viestiä ja liittää `Liitteet: <polku>` kuten iOS. Todiste: CORE-03 10/10, MAC-17-käännös exit 0, päästä päähän Macilta palveluun: sha256 sama molemmissa päissä, polku `~/.local/state/scopes-liitteet/scopes-macos/…`. Chat-näkymässä (`/api/chat`) ei liitteitä, koska reittiä ei ole. | korjattu |

## 19.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MULTI-01 (= ARK-08, iOS ja macOS ytimen päälle) — odottaa ARK-06:ta ja ARK-07:ää (scopes ydin; Rust-työkaluketju puuttuu) — polut: scopes/shared/**, scopes/macos/** — aloitus: /pura scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| MULTI-01 iOS-linkitys ScopesCoreen | odottaa (ARK-06, ARK-07) | Arkkitehtuuri (`scopes/architecture/SUUNNITELMA.md:160`) laajensi MULTI-01:n paketiksi ARK-08: yksi mallikerros, yksi asiakas ja yksi Lr ytimen päälle (E-01, E-03, E-04, E-08). Aloitetaan, kun `scopes ydin` on tehnyt ARK-06:n ja ARK-07:n. |
| Macin 127.0.0.1:8787-yhteys ei vastaa | avoin (todettu 19.10.2026, ei tutkittu) | Tarkista, millä tunnelilla äppi on tarkoitettu yhdistämään. Ei kirjattu viaksi, koska syy on selvittämättä. |

## 19.10.2026 — scopes macos

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| pakkaa-hybridi.mjs (skooppi `scopes agy siirto pakkausscripti`): louhija/harkinta valitsi väärän istunnon transkriptin (agy Gemini e8f7beb4) ja muistio väitti "Yksikkötestit suoritettu hyväksytysti" ilman ajoa; agy-kiintiön loppuessa vaihe 5 ohitettiin exit 3:lla ilman toimivaa varareittiä. Kirjattava omistajalle `/vika`. | avoin |

## 19.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 19.10.2026

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| pakkaa-hybridi.mjs (skooppi `scopes agy siirto pakkausscripti`): louhija/harkinta valitsi väärän istunnon transkriptin (agy Gemini e8f7beb4) ja muistio väitti "Yksikkötestit suoritettu hyväksytysti" ilman ajoa; agy-kiintiön loppuessa vaihe 5 ohitettiin exit 3:lla ilman toimivaa varareittiä. | avoin (kirjattu omistajalle V-560 19.10.2026); odottaa skooppia scopes agy siirto pakkausscripti |
| pura-malliton.mjs ja pakkaa-alku.mjs (skooppi `claude siirto`): purkutiedoston kolme vikaa (V-565) ja pakkauksen skooppiluokittelu ilman transkriptia (V-566), havaittu scopes macos -purussa ja -pakkauksessa 19.10.2026 | avoin (kirjattu omistajalle V-565, V-566 19.10.2026) |

## 19.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — scopes macosilla ei avoimia töitä; tämän session työ (vikakorjausten ohjaus, scopes2-järjestelyt) on valmis ja koordinointi siirretty scopes kordinaattorille 19.10.2026

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — scopes macosilla ei heti ajettavaa; scopes2-työ etenee koordinaattorin ja vahdin (scopes kordinaattori vahti) kautta

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| MULTI-01 iOS-linkitys ScopesCoreen | valmis (korvattu 20.10.2026, käyttäjä: scopes2:n ARK-08 tekee saman scopes-V2:ssa; vanha äppi vain rinnalla K-9) | Arkkitehtuuri (`scopes/architecture/SUUNNITELMA.md:160`) laajensi MULTI-01:n paketiksi ARK-08: yksi mallikerros, yksi asiakas ja yksi Lr ytimen päälle (E-01, E-03, E-04, E-08). Aloitetaan, kun `scopes ydin` on tehnyt ARK-06:n ja ARK-07:n ja `scopes toteutussuunnitelma` on tehnyt suunnitelman; ei aloiteta ennen suunnitelmaa. |
| ARK-03 virta ScopesClientiin (kirjattu käyttäjän pyynnöstä 19.10.2026) | valmis (korvattu 20.10.2026, käyttäjä: koskee vanhaa äppiä; scopes-V2 korvaa sen, vanha äppi vain rinnalla K-9) | `scopes/architecture/SUUNNITELMA.md:143`: `ScopesClient.virta(since:)` ScopesCoreen (`URLSession.bytes`), `MacRootView`-pollaus pois, listat `since`-erolla, vakaat tunnisteet; iOS-tiedostot kuuluvat skoopeille `scopes ios`, `scopes lista`, `scopes chat`, `scopes notifications`. Hyväksyntä: macOS hakee `/api/kayttoraja` vain 15 min välein. Aloitetaan, kun `scopes yhteys` on tehnyt ARK-02:n (`GET /api/virta?since=`). |
| Macin 127.0.0.1:8787-yhteys ei vastaa | valmis (korvattu 20.10.2026, käyttäjä: vanhan äpin asia; scopes-V2:n Mac-äppi käyttää omaa ydintään ARK-08:ssa) **19.10.2026:** Todettu 19.10.2026: palvelin kuuntelee 0.0.0.0:8787 (ss -ltnp, node pid 14262); Macilta curl http://192.0.2.11:8787/api/skoopit → 401 ja nc TCP ok. Macin äppi-asetus com.example.scopes.mac scopes_osoite = http://127.0.0.1:8787, Macilla ei kuuntelijaa (000). Tunnelia ei tarvita. Macin avainnipusta puuttuu scopes/avain (security find-generic-password ei löytänyt). iOS käyttää http://192.0.2.11:8787 (scopes/ios/Sources/Asetukset.swift:7). | Syy: oletusosoite 127.0.0.1 (tavoitetila ARK-08:n jälkeen), Macilla ei kuuntelijaa, avainnipusta puuttuu API-avain; palvelu tavoitettavissa LANissa 192.0.2.11:8787. Käyttäjä 19.10.2026: ei väliaikaista LAN-korjausta; ARK-08:n jälkeen äppi käyttää oman laitteen ydintä 127.0.0.1:8787:ssä. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-MACOS-1 (20.10.2026): scopes macos -istunto 64f841d7 (Mac) havaitsi 19.10. klo 19.48, että rinnakkaisen istunnon 28f5f18b aika-arvio ja ihmisvaiheiden selvitys olivat kirjaamatta. Se arvioi ne vanhentuneiksi ja jätti kirjaamatta kysymättä käyttäjältä. Lisäksi se palautti kuolleen 28f5f18b:n (18.35), vaikka oli itse skoopin aktiivinen istunto, eikä kertonut kahdennuksesta. | korjattu sisällön osalta (fcd8c7c1, `scopes/macos/AIKATAULUENNUSTE.md`); toimintaohje: havaittu kirjaamaton tulos kysytään käyttäjältä, ei pudoteta omalla arviolla |

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: V-584 (omistaja päätettävä: scopes2/macos vai scopes macos), ARK-16/H-16 arkkitehtuurin kirjaus (/pura scopes architecture); scopes2-työ etenee koordinaattorin ja vahdin (scopes kordinaattori vahti) kautta

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-584 (`claude/idea/IDEAT.md:196`): scopes-V2 macOS-äpin kehitysasetukset, ensin "älä sammuta näyttöä" | avoin; odottaa käyttäjää | Koskee `scopes2/macos`-polkua, `scopes macosin` raja on `scopes/macos/**`; käyttäjä päättää omistajan ennen aloitusta. |
| ARK-16/H-16 arkkitehtuurin kirjaus | avoin; odottaa käyttäjää | Käyttäjä avaa `/pura scopes architecture` (V-586). |

### Viat — valmis

| Vika | Tila |
|---|---|
| Oma virhe: kellonajat 17.45/17.47 viesteissä olivat väärin (todellinen ~17.41); korjattu käyttäjälle. | korjattu 20.10.2026 (korjattu käyttäjälle) |
| Oma virhe: kloonausskriptin `rm -rf models` poisti juuri kloonatut `models/optimization` ja `models/jev`; kloonattu uudelleen, tarkistettu. | korjattu 20.10.2026 (kloonattu uudelleen ja tarkistettu) |

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: Avaa scopes2-istunnot uudelleen Macilla (Macin klooni sessions-repo): kordinaattori, vahti, scopes2 shared, web, ydin, toteutussuunnitelma, architecture — tarkista ensin niiden pakkaukset originissa ja synkka, asenna tmux Macille (brew); sulje palvelimen vastaavat istunnot vasta kun Mac-istunnot vastaavat — polut: `scopes/macos/**`; aloitus: /pura scopes macos

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| scopes2-istuntojen avaus Macilla | avoin; odottaa käyttäjää | Käyttäjä purkaa scopes macosin Macilla (`cd ~/sessions-repo && claude`, sitten `/pura scopes macos`); tarkista että kaikkien 7 pakkaukset ovat originissa (git log), synkka Macin kloonissa, sitten avaa istunnot (tmux: `brew install tmux`, tai Terminal-ikkunat; ei GUI-ikkunoita macOS-UI-testin aikana). |
| T-52 ajo 10 | avoin (punainen 9 kertaa; ei uusintaa ilman käyttäjää); odottaa käyttäjää | 8787-ratkaisun ja Mac-siirron jälkeen. |
| Palvelimen istunnot sulkematta | kesken (pakkaukset käynnissä 20.10.2026 klo 18.38) | Sulje kun Mac-istunnot ovat ylhäällä. |

## 20.10.2026 — scopes macos

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — scopes2-hallinta siirtyi skooppiin scopes overseer 20.10.2026; vanhan macOS-äpin jatko (MAC-17, MULTI) rekisterin mukaan käyttäjän pyynnöstä — polut: scopes/macos/** — aloitus: /pura scopes macos
