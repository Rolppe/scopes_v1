# scopes agy android — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 15.10.2026 — scopes agy android

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: AGY-ANDROID-MAARITTELY — kirjaa käyttäjän kanssa skoopin tarkoitus, raja ja ensimmäinen työ, ja korvaa tämä rivi ensimmäisellä oikealla paketilla — polut: scopes/agy/android/** — aloitus: /pura scopes agy android

### Tarkoitus ja raja — poistettu tai muutettu

Määrittelemättä: skooppi luotiin komennolla `/pura uusi scopes agy android` 15.10.2026 ilman tarkoitusta; paketti AGY-ANDROID-MAARITTELY kirjaa sen.

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 15.10.2026 | paketti AGY-ANDROID-MAARITTELY |

## 15.10.2026 — scopes agy android

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: AGY-ANDROID-APK — hae virallisen Antigravity-sovelluksen (com.google.android.apps.antigravity) APK muista lähteistä Macin kautta (`ssh dev-host` + curl, käyttäjän lupa 15.10.2026; APKMirror, APKPure ja apkcombo eivät tuottaneet), tarkista allekirjoitus ja sisältö (Androidilla ajettava agy-moottori?) ja asenna adb:llä — polut: scopes/agy/android/** — aloitus: /pura scopes agy android — automaattinen: kyllä

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Virallisen sovelluksen APK | ei löytynyt peileistä 15.10.2026: APKMirror ei listaa (`/apk/google-inc/google-antigravity/` 404, haut tyhjät), APKPure 403, apkcombo.com ei ratkea Macilla; palvelimen hiekkalaatikko estää ulkoverkon, joten haku tehdään `ssh dev-host` -yhteydellä (käyttäjän lupa 15.10.2026) **15.10.2026:** virallinen sovellus `com.google.android.apps.antigravity` (Play, 2026.09.23.988012583) on Googlebook OS:lle; puhelimissa UI aukeaa mutta Terminal VM -asennus kaatuu (Android Authority, Android Headlines, 9to5Google); Macilta 15.10.2026: APKMirror ei listaa sovellusta (`/apk/google-inc/google-antigravity/` 404, haut tyhjiä; sivulla on syöte `/apk/google-inc/google-antigravity/feed/`), APKPure 403, apkcombo.com ei ratkea (DNS). | paketti AGY-ANDROID-APK: muut lähteet Macin kautta (Android Authorityn jutun linkki, APKMirrorin syöte `/apk/google-inc/google-antigravity/feed/`) tai Play V-240-poikkeuksella, joka on käyttäjän päätös; löydyttyä: tarkista Googlen allekirjoitus, tutki sisältö (onko Androidilla ajettava agy-moottori, joka korvaisi `agy models` ja `agy -p`), asenna adb:llä |

## 15.10.2026 — scopes agy android

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: Virallisen sovelluksen APK (jatkoreitin valinta: natiivi agy-CLI -koe / Googlebook-profiili apkeepillä / jäihin), Play Kauppa päällä (pidetäänkö) — AGY-ANDROID-APK tehty 15.10.2026: Play "Your device isn't compatible with this version", ei AVF:ää

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Virallisen sovelluksen APK | odottaa käyttäjää — ei saatavilla tälle laitteelle 15.10.2026: Play "Your device isn't compatible with this version" (adb `am start market://…` + uiautomator dump), peileissä ei APK:ta (APKMirror-syöte tyhjä ja haku "No results found", appsapk ohjaa Playhin, uptodown 404, APKPure 403, apkcombo ei vastaa), ja sovellus vaatisi AVF/Terminal VM:n (Pixelilläkin `MANAGE_TERMINAL`-lupavirhe, Gadget Hacks / Android Authority), jota laitteella ei ole | käyttäjän päätös: (a) natiivi agy-CLI -koe Android-rootista chrootin glibc-lataajalla (`agy -p`, `agy models`; huom. infra oneplus 13.10.2026 "Agy kuuluu myös nyt sammuttaa oneplus" → `agy.pois`), (b) APK Googlebook-laiteprofiililla apkeepillä (token: käyttäjän oauth_token tai Auroran anonyymi), (c) skoopin tavoite jäihin |
| Play Kauppa päällä | odottaa käyttäjää — `com.android.vending` enabled 15.10.2026 käyttäjän pyynnöstä (53.3.22-34; gms ja gsf jo päällä); Google-domainit `oneplus_allow`-sallilistassa (`Infra/verkko/kotiverkon-rekisteri.md` rivi `oneplus_wan_allow`) | käyttäjän päätös: pidetäänkö päällä (muistikuorma, ONEPLUS-MUISTI infra oneplus) vai `pm disable-user com.android.vending` ja domainien palautus reitittimen varmuuskopiosta `/etc/config/dhcp.bak-agy-android-20261015` |

## 15.10.2026 — scopes agy android

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — skoopin tavoite täyttyi 15.10.2026: Gemini (com.google.android.apps.bard 1.0.971139365) asennettu Play Kaupasta ja kirjauduttu; Play Kauppa pidetään päällä

## 15.10.2026 — scopes agy android

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: Käyttöönotto (:8787 + asenna.sh, V-466 ensin skoopissa scopes yhteys); Generoitujen tiedostojen kansio (kuvakiintiö); Pitkät vastaukset (tarvitaanko)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| iOS-liite + teksti | siirretty skooppiin scopes yhteys (V-466; polut sen omistamia) | kun scopes yhteys on ajanut V-466 — ei toimenpiteitä tässä skoopissa. |
| Käyttöönotto | avoin (lupa ja V-466 puuttuvat); odottaa käyttäjää | tuotannon :8787-uudelleenkäynnistys ja `bash scopes/ios/asenna.sh`, sitten käsitesti iPhonella (napautus/veto-koordinaatit). |

## 15.10.2026 — scopes agy android

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: Generoitujen tiedostojen kansio (kuvakiintiö); Pitkät vastaukset (tarvitaanko); V-466:n jälkeen asenna.sh uudelleen (scopes yhteys korjaa ensin)
