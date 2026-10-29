# claude demo scopes — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 13.10.2026 — claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Lukurajapinta kotipalvelimelle | valmis | `scopes/palvelu/palvelin.mjs` (GET /api/terveys, /api/skoopit, /api/skoopit/<nimi>), testit `node --test scopes/palvelu/lahteet.test.mjs` 7/7; istunnon skooppi nimestä tai viimeisimmästä /pura-argumentista |
| iOS-äppi, versio 1 (vain luku): skooppilista ja skoopin näkymä | avoin | paketti DEMO-SCOPES-IOS-LUKU, kun rajapinta toimii |
| Palvelun pysyvä ajo ja puhelimen yhteys | valmis | cron `*/5` ajaa `kaynnista.sh`:n; todennettu 13.10.2026: tapettu 9.57, palasi 10.00.02; Macista lähiverkon yli terveys 200, ilman avainta 401. Huom: pääohjelmatarkistus vaatii realpathin, koska cron ajaa symlinkin kautta (ensimmäiset ajot 9.50 ja 9.55 poistuivat hiljaa); hakemiston cron.d `touch` tehtiin välissä, mutta sen tarpeellisuutta ei todennettu |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-IOS-LUKU — SwiftUI-äppi, versio 1 vain luku: skooppilista (seuraava paketti, avoimia, vikoja, suurin konteksti) ja skoopin näkymä (rekisteri ja istunnot) rajapinnasta `scopes/palvelu` (portti 8787, Bearer-avain); kehitys ja testaus Macin iOS-simulaattorissa (käyttäjä 13.10.2026), simulaattori tavoittaa palvelun lähiverkosta; avain annetaan äpin asetuksissa, ei koodissa — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| iOS-äppi, versio 1 (vain luku): skooppilista ja skoopin näkymä (kirjattu 13.10.2026) | avoin | paketti DEMO-SCOPES-IOS-LUKU |
| Hallintatoiminnot äppiin (pura, pakkaa, uusi skooppi) (kirjattu 13.10.2026) | avoin | oma paketti version 1 jälkeen |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-HALLINTA — hallintatoiminnot Skoopit-äppiin (pura, pakkaa, uusi skooppi): palveluun kirjoittavat POST-reitit ja äppiin painikkeet; turvamalli (mitä puhelin saa käynnistää, miten kielletty tehdään mahdottomaksi) päätetään käyttäjän kanssa ennen koodia; testaus Macin iOS-simulaattorissa `workspace/scopes/ios/testi.sh` — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Hallintatoiminnot äppiin (pura, pakkaa, uusi skooppi) (kirjattu 13.10.2026) | avoin | paketti DEMO-SCOPES-HALLINTA |
| Asennus omaan iPhoneen (WireGuard-yhteys oikealla laitteella) (kirjattu 13.10.2026) | avoin; odottaa käyttäjää | kun käyttäjä haluaa |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-PUHELIN — Skoopit-äppi käyttäjän iPhoneen (WireGuard-yhteys) ja hallintatoimintojen koeajo oikealla laitteella: pura avaa istunnon, pakkaa pakkaa sen, uusi luo koeskoopin joka poistetaan lopuksi; vaatii käyttäjän läsnäolon — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Asennus omaan iPhoneen (WireGuard-yhteys oikealla laitteella) ja hallintatoimintojen koeajo (pura, pakkaa, uusi koeskooppi joka poistetaan) (kirjattu 13.10.2026) | avoin; odottaa käyttäjää | paketti DEMO-SCOPES-PUHELIN; kun käyttäjä haluaa **13.10.2026:** Todettu: UI-testit `workspace/scopes/ios/testi.sh` (iPhone 15 Pro -simulaattori, oikea palvelu) 4/4 Passed; pakkaa ilman istuntoa → "409: skoopilla ei ole tmux-istuntoa…", uusi "claude demo scopes" → "409: skooppi on jo olemassa"; Todentamatta: pakkaa-onnistuminen ja uusi-onnistuminen (kirjoittavat rekisteriin) → puhelinkoeajoon. |

## 13.10.2026 — claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Pura-onnistuminen oikealla iPhonella | avoin (todennettu vain simulaattorissa); odottaa käyttäjää | käyttäjän ollessa kotona: äpissä skooppi ilman istuntoa → Pura → toimintoloki `~/.local/state/scopes-toiminnot.loki` |
| Välilehtirakenne (chat, skopes, infra, asetukset) | valmis simulaattorissa 13.10.2026 (UI-testit 6/6, chat oikealla Haikulla) | puhelimeen, kun käyttäjä lopettaa simulaattorivaiheen: `bash workspace/scopes/ios/asenna.sh` |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-PARANNUKSET — Skoopit-äppiin käyttäjän 13.10.2026 valitsemat kolme parannusta simulaattorissa: infra-puun avausnuoli ja siirtymä selvästi erilleen, skoopin viesteihin agentin työkalukutsut lyhyinä riveinä (komento, muokattu tiedosto), chatin keskusteluhistoria (aiemmat keskustelut talteen ja listaksi) — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-SUORATOISTO — Skoopit-äpin chatin vastaus näkyy kirjain kerrallaan agentin kirjoittaessa (palvelu: claude -p --output-format stream-json → suoratoisto äppiin; äppi päivittää kuplan vähitellen), simulaattorissa — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Allekirjoituksen 7 pv uusinta | avoin (vanhenee noin 20.10.2026) | käsin `bash workspace/scopes/ios/asenna.sh` ennen 20.10.2026; automaattinen uusinta vaatisi erillisen poikkeuksen (ajastettu LaunchAgent, expresso/remote-malli) |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-ASENNUS — Skoopit-äpin uusi versio (chatin suoratoisto) iPhoneen asenna.sh:lla Macin LaunchAgentin kautta; uusii samalla 7 pv allekirjoituksen (vanhenee noin 20.10.2026) — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Allekirjoituksen 7 pv uusinta | avoin (vanhenee noin 20.10.2026) | DEMO-SCOPES-ASENNUS uusii sen; muuten käsin `bash workspace/scopes/ios/asenna.sh` ennen 20.10.2026; automaattinen uusinta vaatisi erillisen poikkeuksen (ajastettu LaunchAgent, expresso/remote-malli) |

## 13.10.2026 — claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| 9b-mallien hitaus ja huono laatu | valmis 13.10.2026: käyttäjä päätti, ettei piiloteta (kaikki laitteilla käytettävissä olevat mallit listalle) | — (pois seuraavassa pakkauksessa) |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-UUSINTA-TODENNUS — todenna Skoopit-äpin ensimmäinen ajastettu allekirjoituksen uusinta (`ssh dev-host 'tail -3 ~/scopes-ios/ajastus.loki ~/scopes-ios/asennus.loki'` → uusinta valmis, profiili myöhempi kuin 2026-10-20T08:20:55Z); aikaisintaan 18.10.2026 — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Sivupalkin ja näyttölukon kokeilu oikealla puhelimella | avoin; odottaa käyttäjää | käyttäjä kokeilee puhelimessa (asennettu 13.10.2026 16.20). |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-LISTA — sivupalkin lista: valmistunut/kysyvä keskustelu huipulle, "Uusi chat" -rivi pois, "Scopes"-otsikon tilalle All/Scope/Chat-suodatinnapit, monivalintaikkunat (AskUserQuestion) oikein keskustelussa — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| DEMO-SCOPES-LISTA (käyttäjä 13.10.2026): (1) keskustelu, jossa työ valmistui tai tuli kysymys, nousee sivupalkin listan huipulle; (2) listan huipun "Uusi chat" -rivi pois; (3) "Scopes"-otsikko pois, tilalle kolme rinnakkaista nappia All / Scope / Chat, jotka suodattavat listan; (4) Clauden monivalintaikkunat (AskUserQuestion) eivät näy oikein keskustelussa | avoin | toteuta: palvelu `workspace/scopes/palvelu/lahteet.mjs` (aika: viimeisinMuutos rivi ~153–171) ja `viestit.mjs` (`keskustelu`, tool_use → `tyokaluRivi` rivi ~49–78), äppi `ios/Sources/Sivupalkki.swift`, `Viestit.swift`; testit `node --test palvelu/*.test.mjs` + `ios/testi.sh`, asennus `asenna.sh` käyttäjän luvalla |

## 13.10.2026 — claude demo scopes

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: DEMO-SCOPES-LISTA — koodi tehty (suodatin All/Scope/Chat, pysähdysaika, monivalintakortti); korjaa UI-testit testValilehdetJaInfraPuu ja testKysymysKortti, simulaattori vihreäksi, sitten :8787 uudelleenkäynnistys ja asennus puhelimeen käyttäjän luvalla — polut: workspace/scopes/** — aloitus: /pura claude demo scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| DEMO-SCOPES-LISTA (käyttäjä 13.10.2026): (1) keskustelu, jossa työ valmistui tai tuli kysymys, nousee sivupalkin listan huipulle; (2) listan huipun "Uusi chat" -rivi pois; (3) "Scopes"-otsikko pois, tilalle kolme rinnakkaista nappia All / Scope / Chat, jotka suodattavat listan; (4) Clauden monivalintaikkunat (AskUserQuestion) eivät näy oikein keskustelussa | kesken (koodi tehty 13.10.2026, ei committoitu erikseen, mukana pakkauscommitissa; simulaattoritestit testValilehdetJaInfraPuu ja testKysymysKortti punaisia) | korjaa testValilehdetJaInfraPuu (todennäköisesti `osuttava(app.buttons["suodatin-all"], …)` tai palkki() napauttaa principal-toolbar-nappia palkin ollessa vielä kiinni — selvitä, mikä kutsu vierittää) ja testKysymysKortti (kortti ei löydy: tarkista `.accessibilityElement(children: .contain)` / vieritys); aja simulaattori vihreäksi (testit `node --test palvelu/*.test.mjs` + `ios/testi.sh`), sitten elävän palvelun :8787 uudelleenkäynnistys ja äpin asennus puhelimeen `asenna.sh` käyttäjän luvalla, käyttäjän kokeilu |
| iOS-simulaattoriajo: testValilehdetJaInfraPuu punainen (suodatin-all ei vierity näkyviin palkin ollessa kiinni, x = −318); testKysymysKortti ja testPuraAvaaIstunnon ohitettu ("skoopin viesteissä ei ole monivalintaa", laiska lista) | avoin | vierityssilmukka lisätty toiseen ajoon, ei vielä auttanut |

## 13.10.2026 — scopes

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| DEMO-SCOPES-LISTA (käyttäjä 13.10.2026): (1) keskustelu, jossa työ valmistui tai tuli kysymys, nousee sivupalkin listan huipulle; (2) listan huipun "Uusi chat" -rivi pois; (3) "Scopes"-otsikko pois, tilalle kolme rinnakkaista nappia All / Scope / Chat, jotka suodattavat listan; (4) Clauden monivalintaikkunat (AskUserQuestion) eivät näy oikein keskustelussa | valmis 13.10.2026 (5d46e580; käyttäjä kokeili puhelimessa 13.10.2026: "Näyttäisi toimivan") | ei — valmis |
