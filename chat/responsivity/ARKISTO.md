# scopes chat responsivity — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 16.10.2026 — scopes chat responsivity

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-RESPONSIVITY-TODENNUS — todenna puhelimella (äppi asennettu uudella koodilla) tai simulaattorilla: himmeä viesti heti, stop/play heti, haptinen palaute; kirjaa tulos ja mittaa viive napautuksesta näkymään — polut: scopes/ios/Sources/Viestit.swift, scopes/ios/UITests/ — aloitus: /pura scopes chat responsivity

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skoopin viestinäkymä: lähetetty viesti näkyi vasta palvelun palautteen jälkeen; lähetys/stop/jatka-nappi vaihtui viiveellä; napeissa ei haptiikkaa (käyttäjä 16.10.2026) | korjattu koodissa 16.10.2026, käännös ok (xcodebuild Macilla); todentamatta oikeassa istunnossa ja puhelimen haptiikka | todenna: lähetä viesti → himmeä kupla heti, täyttyy palvelun listasta; stop → play heti; haptiikka puhelimella |

## 16.10.2026 — scopes chat responsivity

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skoopin viestinäkymä: lähetetty viesti näkyi vasta palvelun palautteen jälkeen; lähetys/stop/jatka-nappi vaihtui viiveellä; napeissa ei haptiikkaa (käyttäjä 16.10.2026) | korjattu 2fd38223 16.10.2026 (koodissa, käännös ok (xcodebuild Macilla); todentamatta oikeassa istunnossa ja puhelimen haptiikka; puhelin: haptiikka ja tuntuma, käyttäjä valitsi 16.10.2026 pakkaa vain); odottaa käyttäjää (todenna viim. 30.10.2026) | todenna: lähetä viesti oikeassa istunnossa → himmeä kupla heti, täyttyy palvelun listasta; stop → play heti; haptiikka puhelimella; mittaa viive napautuksesta näkymään (tavoite: välitön); äppi asennettava (asenna.sh, tarvitsee Macin) ja kokeiltava puhelimella; simulaattoriin kirjoittava UI-testi vaatii vapaan istunnon **16.10.2026:** Macilla ajettu `SCOPES_VAIN="MalliUITests/testMallinappiNakyyJaVaihtuu" SCOPES_TULOS=responsivity bash scopes/ios/testi.sh` (xcodebuild, ~15 min taustalla; 590 s aikaraja ei riittänyt ensimmäisellä yrityksellä): käännös ja ajo onnistuivat, koodivirheitä ei. Testi itse epäonnistui (valikossa ei mallia/efforttia, 9 XCTAssertTrue); syy todentamatta — todennäköisesti mallinappi on pois käytöstä, kun istunto on työssä (rekisteri: nappi pois käytöstä työn aikana), mutta testiä ei ajettu uudelleen ilman muutosta vertailuksi. Tulospaketti Macilla ~/scopes-ios/responsivity.xcresult; Himmeän viestin ja nappien vaihdon nopeus sekä haptiikka todentamatta: haptiikka ei toimi simulaattorissa, ja oikeaan istuntoon kirjoittava UI-testi tarvitsee vapaan istunnon. Äppiä ei ole asennettu puhelimeen tämän muutoksen kanssa. |
| Viestit.swift on scopes chat -skoopin tiedosto: omistajalle ilmoitus muutoksesta (sääntö 15) | avoin | ilmoita omistajalle `vika.sh scopes chat` -komennolla |
