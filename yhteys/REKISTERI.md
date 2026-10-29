# scopes/yhteys/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: V-487-DIAG-TODENNUS — kodin ulkopuolella diagnostiikkalokiin tulee `uusinta: true` -rivi myös onnistuneelle uusinnalle (ba06cfea asennettu iPhoneen 15.10.2026); heraa()-siirto hylätty 15.10.2026 — polut: scopes/ios/Sources/Diagnostiikka.swift — aloitus: /pura scopes yhteys

## Tarkoitus ja raja

Yhteys äpistä palveluun: Asetukset.swift, Asiakas.swift ja palvelin.mjs (Bearer-avain, osoite, HTTP-reitit, käynnistys :8787)

## Päätökset

- **Käyttäjä 13.10.2026:** skooppi `scopes yhteys` luotiin jakamalla `scopes` ominaisuuksittain (luo-skooppi.mjs `scopes yhteys`.

- **14.10.2026:** Käyttäjä 14.10.2026: vaihtoehto A (tunneli äpissä, ilmainen tili). Hylätty B (NEPacketTunnelProvider, maksullinen tili 99 $/v) ja porttiohjaus/pilvitunneli (periaate Infra/paarekisteri.md:96).

- **14.10.2026:** Scopes-peerin oikeudet rajattu vain palvelimen porttiin 8787.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraavaa pakettia ei ole ("Ei seuraavaa (suositus)").

- **15.10.2026:** Käyttäjä 15.10.2026: "Reitti lokiin + uusinta (suositus)". Hylätty: vain diagnostiikka; ei muutoksia.

- **15.10.2026:** POST ei uusita automaattisesti (kaksoisviestin riski).

- **15.10.2026:** Käyttäjä 15.10.2026: "Korjaa uusinta (suositus)" — portin uudelleenavaus uusinnan polulla; hylätty "Hyväksy nykyinen".

- **15.10.2026:** V-487 katsotaan todennetuksi kodin ulkopuolella (2. testi 22.38.50): uusinta onnistuu aina; ensimmäisen yrityksen -1004 lokissa hyväksytään.

- **15.10.2026:** Seuraava askel on todennus kodin ulkopuolella (vaatii käyttäjän liikkumisen), ei heti ajettavaa työtä; Reitti.heraa()-siirto mitataan vasta todennuksen jälkeen (rekisterin rivi pysyy ennallaan).

- **15.10.2026:** Käyttäjä 15.10.2026: "Jätä paikalleen (Suositus)" — Reitti.heraa() pysyy active-vaiheessa (Juuri.swift:40); ensimmäinen -1004 lähtee ennen active-vaihetta (ajastetut haut), ja uusinta portin avauksella saa 200:n; hylätty "Siirrä willEnterForegroundiin" ja "Odota lisää dataa".

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Etäyhteys kodin ulkopuolelta äpin omalla WireGuard-tunnelilla | todennettu 14.10.2026 (valmis ja todennettu iPhonella) | ei avoimia **15.10.2026:** Macin LuLu kysyy tunnelin uudelleenkäännöksellä `tunneli.test` → 192.0.2.1 (rakenna.sh:n ajama Go-testi, tunneli_test.go:49, :57, TEST-NET-1 täyteosoitteena); vastaus Block, testi ei tarvitse yhteyttä; kysely voi toistua jokaisella käännöksellä (testibinäärin polku vaihtuu). |
| V-314 (IDEAT.md, scopes design 14.10.2026) | avoin (tiedoksi, ei ajettavaa työtä) | kun palveluun lisätään uusi Hylatty-viesti, lisää sille rivi Asiakas.selkokielinen-taulukkoon (scopes/ios/Sources/Asiakas.swift, 3b013ecd) |
| Reitti.heraa() jo UIApplication.willEnterForegroundNotification-kohdassa (valinnainen) | hylätty 15.10.2026 (käyttäjä: "Jätä paikalleen") | ei avoimia: uusinta + portin avaus (f4524217) peittää ensimmäisen -1004:n; data scopes-app.loki 15.10. 19.38.59Z eka -1004 → uusinta 200. **16.10.2026:** Reitti.heraa(): ensimmäinen -1004 lähtee aina ennen active-vaihetta (ajastetut haut ennen heraa()-kutsua, Juuri.swift:40). |
| V-487-DIAG-TODENNUS (Diagnostiikka.swift, uusinta-pyyntöjen kirjaus) | avoin (kodin ulkopuolella liikkuminen); odottaa käyttäjää | kodin ulkopuolella mobiiliverkossa: avaa äppi taustalta palatessa muutaman kerran; tarkista ~/.local/state/scopes-app.loki: rivi `tyyppi: pyynto, uusinta: true, koodi 200` ba06cfea:n asennuksen (19.41Z 15.10.2026) jälkeen. 15.10. 19.41–19.50Z ei yhtään -1004:ää (2 paluuta taustalta tunnelissa ilman virhettä). |

## Viat

| Vika | Tila |
|---|---|
| V-275 → scopes viat | tiedoksi |
| V-290 → scopes viat | tiedoksi |
| V-303 → scopes viat | tiedoksi |
| V-337 → scopes viat | avoin |
| V-466 → scopes viat | avoin |
| V-502 (oma vika, kirjattu scopes viat -skoopille, commit 087fac9): iPhonen odotussilmukka ajoi `ssh dev-host 'xcrun devicectl …'` ilman DEVELOPER_DIR:ää, 2>/dev/null piilotti virheen, odotus 10 min turhaan | avoin |

## Historia

Historia: `scopes/yhteys/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
