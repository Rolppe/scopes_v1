# scopes/agy/android/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: Gemini-chatin käsitesti iPhonella (Chat → Android → Gemini); Generoitujen tiedostojen kansio (kuvakiintiö); V-466:n jälkeen asenna.sh uudelleen (scopes yhteys korjaa ensin)

## Tarkoitus ja raja

agy (Antigravity CLI) ajetaan palvelimen Android-puolella eikä Linux-chrootissa (käyttäjä 15.10.2026, AGY-ANDROID-MAARITTELY).

Raja: skoopin omat ovat agy:n asennus, ajo ja muisti Android-puolella (Termux tai root). Ei kuulu: chrootin agy `~/.local/bin/agy` (scopes agy), V-240-palautus ja ONEPLUS-MUISTI (infra oneplus), r&d2:n `--engine agy` (claude r&d2), Android-agy:n käyttö ajajana.

Lähtötiedot 15.10.2026: chrootin agy on glibc-linkitetty aarch64 ELF (197 Mt, tulkki `/lib/ld-linux-aarch64.so.1`), joten se ei käynnisty bionic-Androidilla sellaisenaan; Android 16, arm64-v8a, root adb:llä (127.0.0.1:5555, uid 0), Termux ja Termux:Boot asennettu, MemAvailable 4,39 Gt.

## Päätökset

- **Käyttäjä 15.10.2026:** skooppi `scopes agy android` luotiin komennolla `/pura uusi scopes agy android`.
- **Käyttäjä 15.10.2026 (AGY-ANDROID-MAARITTELY):** tarkoitus "agy ajaa Androidin puolella" (hylätyt: agy tekee Android-sovelluksia, agy ohjaa puhelinta adb:llä); raja "Vain Android-puolen agy" (hylätty: ajajakäyttö mukaan); ensimmäinen työ "Selvitys ensin, ei asennuksia" (hylätyt: Termux glibc-runner -koe, proot-distro).
- **Agentti 15.10.2026 (AGY-ANDROID-SELVITYS, ei asennuksia):** (1) Android-rootista `HOME=/nonexistent-agy-koe /data/local/debian/lib/ld-linux-aarch64.so.1 --library-path /data/local/debian/lib/aarch64-linux-gnu:/data/local/debian/usr/lib/aarch64-linux-gnu /data/local/debian~/.local/bin/agy --version` → `1.2.15` exit 0, ei kirjoituksia; chroot on `/data/local/debian`. (2) Ydin `CONFIG_ARM64_VA_BITS=39`, SELinux Enforcing, SECCOMP=y: yhteisöraporttien mukaan agy:n TCMalloc olettaa 48-bittisen VA:n, Go:n `faccessat2` estyy seccompissa, ja DNS/TLS vaativat korjauksia — `--version` ei vielä todista promptiajoa. (3) Termux 0.118.3: ei glibc-runneria, protia eikä proot-distroa. (4) agy on Go 1.26 -binääri; kolmannen osapuolen seurain (havoptic.com) väittää 1.2.15:n (2.10.2026) tuoneen Termuxissa ajettavat natiivit Android-binäärit; virallista muutoslokia ei tavoitettu. (5) Yhteisöasentimet: wallentx (paikattu julkaisu + glibc) ja marshallrichards/ClawPhone (virallinen ARM64 + TCMalloc-paikka + glibc-kääre); skriptejä ei luettu.
- **Käyttäjä 15.10.2026:** "Pitää saada androidin virallinen antigravity äppi hallintaan" — tavoite tarkentui CLI:stä viralliseen Android-sovellukseen. Agentin tarkistus: sovellus on `com.google.android.apps.antigravity` (Play, 2026.09.23.988012583), tehty Googlebook OS:lle, ja sen Linux-ympäristö vaatii Terminal VM:n (AVF); puhelimiin sivuladattuna käyttöliittymä aukeaa, mutta VM-asennus kaatuu (Android Authority, Android Headlines). palvelin (HD1911, ydin 4.14): ei `/dev/kvm`ia, `ro.boot.hypervisor.vm.supported` tyhjä, ei virtualization- eikä terminal-pakettia, sovellusta ei asennettu → VM-osa ei toimi tällä laitteella.
- **Käyttäjä 15.10.2026:** "Asennetaan sovellus oneplus androidiin ja äppiä pitää pystyä hallitsemaan siten etänä että se toimii ios scopes äpissä niin kuin nykyinen antigravity cli". Agentin tarkistus samana päivänä: Play Kauppa (`com.android.vending`), `com.google.android.gms` ja `gsf` ovat asennettuina mutta poiskytkettyinä (V-240, infra oneplus); Google-tili 78311409+Rolppe@users.noreply.github.com on laitteella; `market://details?id=com.google.android.apps.antigravity` ei avaudu ("unable to resolve Intent").
- **Käyttäjä 15.10.2026:** "Selvitä paras vaihtoehto jonka pystyt itsenäisesti toteuttamaan ja toteuta se". Agentti: iOS Scopes käyttää agy:tä vain purkajana — `agy models` (scopes/palvelu/purkajat.mjs:28) ja `agy -p … --json-schema` (claude/siirto/tools/vaihesilmukka.mjs:155); sovelluksen pitäisi korvata nämä kaksi kutsua, mikä vaatii agy-moottorin ilman AVF:ää. Nykyinen CLI toimii: `agy models` exit 0. Itsenäinen toteutus estyi: APK:n lataus peilisivuilta hylättiin luokittimessa; Play vaatii V-240-poikkeuksen, joka on käyttäjän päätös.

- **15.10.2026:** Käyttäjä 15.10.2026: tarkoitus "agy ajaa Androidin puolella"; raja "Vain Android-puolen agy"; 1. työ "Selvitys ensin, ei asennuksia" (hylätyt rekisterissä).

- **15.10.2026:** Käyttäjä 15.10.2026: "Pitää saada androidin virallinen antigravity äppi hallintaan" ja "Asennetaan sovellus oneplus androidiin ja äppiä pitää pystyä hallitsemaan siten etänä että se toimii ios scopes äpissä niin kuin nykyinen antigravity cli" → tavoite on virallinen sovellus purkajana iOS Scopesissa.

- **15.10.2026:** Käyttäjä 15.10.2026: "Selvitä paras vaihtoehto jonka pystyt itsenäisesti toteuttamaan ja toteuta se"; valinnat "Lataa APK peilistä" ja "Agentti hakee Macin kautta" (lupa käyttää Macin verkkoa APK:n hakuun). V-240-palautusta (vending/gms/gsf) ei tehty: käyttäjän päätös, ei ehdoteta ilman käyttäjää.

- **15.10.2026:** Käyttäjä 15.10.2026: valitsi "Playsta Google-tilillä" (hylätyt: natiivi agy-CLI -koe, sovellusreitti jäihin); sitten "Auroran anonyymi token (suositus)", jonka hän keskeytti viestillä "asennan gemini itse android. varmista android vekkoyhteys" ja "asenna play store oneplus".

- **15.10.2026:** Käyttäjä 15.10.2026: "Agentti lisää domainit" (hylätyt: kapea Play-domainlista, ei poikkeusta) → sallilistapoikkeus Play Kaupalle.

- **15.10.2026:** Käyttäjä 15.10.2026: "Selvitä itse. En ole nyt käytettävissä tunnin ajan" → agentti tarkisti Play-sivun itse adb:llä: ei yhteensopiva.

- **15.10.2026:** Agentti: TLS-varmenteen ohitusta (-k) ei käytetty; luokittimen estoja ei kierretty.

- **15.10.2026:** käyttäjä: oikea Android-sovellus on Gemini (ei agy). Rivin "Virallisen sovelluksen APK" jatkoreitit (a) natiivi agy-CLI -koe, (b) Googlebook + apkeep, (c) jäihin hylätään tarpeettomina.

- **15.10.2026:** käyttäjä: Play Kauppa pidetään päällä (rivi "Play Kauppa päällä" ratkaistu: pidetään; reitittimen domainit jäävät `oneplus_allow`-sallilistaan, varmuuskopio /etc/config/dhcp.bak-agy-android-20261015 säilyy).

- **15.10.2026:** Ruutu (käyttäjä 15.10.2026): herää ensimmäisestä toiminnosta, sammuu 1 min käyttämättömyyden jälkeen; vain itse herätetty ruutu nukutetaan (HDMI-tila oneplus-ha.py:ssä pitää ruudun hereillä TV:lle).

- **15.10.2026:** Sijainti (käyttäjä 15.10.2026): oma sivupalkkinäkymä "Android", ei Infra-osio.

- **15.10.2026:** Hylätty: tiedostojen jako intentillä (URI-luvat), `input text` (ei ääkkösiä).

- **15.10.2026:** Käyttäjä 15.10.2026: käyttöönotto nyt, ei odoteta V-466:ta ("Käyttöön nyt (suositus)"). Hylätyt: "Ensin V-466", "Vain palvelin".

- **15.10.2026:** Käyttäjä 15.10.2026: ajopaikka "Tässä keskustelussa (suositus)" (hylätty: scopes chat -skoopissa) — muutokset scopes chat-, scopes yhteys- ja scopes-tiedostoihin tehtiin täällä, omistajille tiedoksi V-468–V-470.

- **15.10.2026:** Käyttäjä: jatkuvuus "Tämä pitää olla malli valintana normaalissa chat luonnissa" → Gemini on chatin mallivalitsimessa (osio Android).

- **15.10.2026:** Käyttäjä: pituus "Vieritys mukaan (suositus)" (hylätty: vain näkyvä osa ensin).

- **15.10.2026:** Agentti (laitehavainnon perusteella): jokainen Scopes-viesti on oma Gemini-chattinsa ja jatkon historia kulkee kehotteessa (geminiKehote, raja 8000 merkkiä, uusin kokonaan, vanhempi lopusta). Hylätyt: jatko avoimeen chattiin (jakointentti avaa uuden; `input text` ei ääkkösiä), ADBKeyBoard-IME (APK-asennus ja IME-vaihto = käyttäjän päätös), service call clipboard (hauras parcel). Seuraus: Geminin oma historia saa chatin per kysymys.

- **15.10.2026:** Käyttäjä: käyttöönotto "Käyttöön nyt (suositus)" (hylätyt: Vain palvelin, Ei vielä).

- **15.10.2026:** Käyttäjä ohitti kolme odottavaa riviä (Gemini-chatin käsitesti, generoitujen kansio, jatko/suoratoisto) 15.10.2026; ne jäävät odottamaan ennallaan.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Macin jäänteet | apkeep 1.1.0 (brew) ja `/tmp/agy-apk.elyJ` Macilla 15.10.2026 | poistetaan, kun APK-reitti suljetaan: `brew uninstall apkeep`, `rm -r /tmp/agy-apk.elyJ` |
| iOS-liite + teksti | siirretty skooppiin scopes yhteys (V-466; polut sen omistamia) | kun scopes yhteys on korjannut V-466:n, aja `bash scopes/ios/asenna.sh` uudelleen (palvelin android.mjs tukee jo ?teksti=, ei tarvita palvelun uudelleenkäynnistystä, ellei V-466:n korjaus muuta palvelinta). |
| Generoitujen tiedostojen kansio | avoin (kuluttaa Geminin kuvakiintiötä; käyttäjä valitsi 15.10.2026 laitetestin ilman generointia); odottaa käyttäjää | pyydä Geminiltä kuva ja lataa; tarkista, näkyykö /api/android/tuotokset-listalla (kansiot Download/Pictures/Movies/Documents/DCIM, piilokansiot pois). |
| Gemini-chatin käsitesti | käytössä 15.10.2026 (CHAT-GEMINI, e83f1152; palvelu pid 7517, asenna.sh exit 0); odottaa käyttäjää | iPhonella Chat → mallivalitsin → Android → Gemini; lähetä kysymys ja jatkokysymys (vastaus muutamana palana, ~30–80 s). |
| Gemini-chatin jatko ja suoratoisto | ei pyydetty: jatkon historia kulkee kehotteessa (jokainen viesti = uusi Gemini-chat), palat harvoin (dump ~10 s generoinnin aikana) | vain käyttäjän pyynnöstä: aito jatko vaatisi IME:n (ADBKeyBoard) tai leikepöytäreitin — käyttäjän päätös. |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/agy/android/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
