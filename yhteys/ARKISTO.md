# scopes yhteys — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 14.10.2026 — scopes yhteys

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — skooppi luotu 13.10.2026 tarkoituksineen jakamalla `scopes`; ei avointa työtä

## 15.10.2026 — scopes yhteys

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — etäyhteys valmis ja todennettu iPhonella 14.10.2026 (4f064c2b); käyttäjä valitsi ei seuraavaa

## 15.10.2026 — scopes yhteys

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: V-487-TODENNUS — tarkista ~/.local/state/scopes-app.loki kodin ulkopuolisen käytön jälkeen: ei -1004:ää taustalta palatessa, reitti- ja uusinta-kentät näkyvät — polut: scopes/ios/tunneli/tunneli.go, scopes/ios/Sources/Asiakas.swift — aloitus: /pura scopes yhteys

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-487 (uusi 15.10.2026, scopes yhteys): -1004 tunnelin varassa taustalta palatessa; korjaus d4671e92 + 152a7068, asennettu; todennus kodin ulkopuolella kesken | korjattu d4671e92 + 152a7068 15.10.2026 (todennus kodin ulkopuolella kesken) (todenna viim. 29.10.2026) |

## 15.10.2026 — scopes yhteys

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: V-487-DIAG — Diagnostiikka.swift:109 kirjaa uusinta-pyynnöt aina (nyt nopea onnistunut uusinta ei näy lokissa), asennus iPhoneen asenna.sh:lla Wi-Fi päällä — polut: scopes/ios/Sources/Diagnostiikka.swift — aloitus: /pura scopes yhteys — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Etäyhteys kodin ulkopuolelta äpin omalla WireGuard-tunnelilla | todennettu 14.10.2026 (valmis ja todennettu iPhonella) | ei avoimia |
| V-487-DIAG (Diagnostiikka.swift, uusinta-pyyntöjen kirjaus) | avoin | Diagnostiikka.swift kirjaa uusinta-pyynnöt aina (myös nopean onnistuneen), jotta todennus näkyy lokista; asennus iPhoneen vaatii Wi-Fin. |

## 16.10.2026 — scopes yhteys

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Reitti.heraa() jo UIApplication.willEnterForegroundNotification-kohdassa (valinnainen) | hylätty 15.10.2026 (käyttäjä: "Jätä paikalleen") | ei avoimia: uusinta + portin avaus (f4524217) peittää ensimmäisen -1004:n; data scopes-app.loki 15.10. 19.38.59Z eka -1004 → uusinta 200. |
| V-487-DIAG-TODENNUS (Diagnostiikka.swift, uusinta-pyyntöjen kirjaus) | avoin; odottaa käyttäjää | kodin ulkopuolella mobiiliverkossa: avaa äppi taustalta palatessa; tarkista ~/.local/state/scopes-app.loki: rivi `tyyppi: pyynto, uusinta: true, koodi 200` ba06cfea:n asennuksen (19.41Z) jälkeen. 15.10. 19.41–19.50Z ei yhtään -1004:ää (2 paluuta taustalta tunnelissa ilman virhettä). |
