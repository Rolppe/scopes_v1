# scopes/chat/topbar/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: CHAT-TOPBAR-TODENNUS — käännös ja nykyiset UI-testit menivät läpi; ota simulaattorikuva ja tarkista: hampurilaisnappi, aivo-nappi, renkaat ilman kapselia ja uusi koko (Liquid Glass päällä ja pois) — polut: scopes/chat/topbar/**, scopes/ios/Sources/Viestit.swift — aloitus: /pura scopes chat topbar

## Tarkoitus ja raja

Tarkoitus: iOS-äpin (Scopes) chat-näkymän yläpalkin nappien valinta ja niiden toiminnallisuus sekä yläpalkin asettelu. Raja: scopes/ios/Sources/Viestit.swift (chat- ja viestinäkymän `.toolbar`), Juuri.swift `Sivupalkkipainike`, Ulkoasu.swift `lasiKapseli`. Sisarskoopit scopes chat maininput, media ja question omistavat syöttörivin, median ja kysymykset; sivupalkki ja asetukset kuuluvat scopes ios -skoopille.

Nykytila 16.10.2026 (luettu koodista): chat-näkymässä (Viestit.swift:510) otsikko on valitun agentin nimi, vasemmalla sivupalkin nuoli, oikealla uusi-chat-painike (square.and.pencil). Skoopin viestinäkymässä (Viestit.swift:846) otsikko on skoopin nimi, oikealla käyttörajan renkaat ja kolme pistettä (skoopin tiedot). Napit saavat lasikapselin vain, kun Liquid Glass on päällä.

## Päätökset

- **Käyttäjä 16.10.2026:** skooppi `scopes chat topbar` luotiin komennolla `/pura uusi scopes chat topbar`.
- **Käyttäjä 16.10.2026, napit:** (1) vasen nuoli → kolmen vaakaviivan nappi (`line.3.horizontal`, Juuri.swift `Sivupalkkipainike`); (2) oikean puolen kolme pistettä → aivo-kuvake (`brain`, skoopin tiedot); (3) käyttörajarenkaat irti aivo-napista, ilman kapselia (`kapseliPois`, Ulkoasu.swift), renkaat kapselin kokoluokkaan (36 pt, ulompi 32, sisempi 19). Koodattu; testi.sh (käännös + UI-testit Macin simulaattorissa) exit 0 16.10.2026. Ulkoasua ei vielä katsottu kuvasta.
- **Käyttäjä 16.10.2026, konteksti:** yläpalkin alla oleva tekstin kontekstinäyttö ja sen aivokuvake poistettiin (jäljelle jää istunnon tila). Aivonapin väri kertoo kontekstin täyttymisen yhdeksässä portaassa: sininen (minimaalinen) → syaani → vihreä → keltainen → oranssi → punaoranssi → punainen (raja täynnä, osuus 1,0–1,25) → magenta → violetti (≥ 1,5 × raja, pahasti yli). Raja on ilmoitusraja (oletus 100 k, Asetukset → Ilmoitukset); `kontekstiVari` Ulkoasu.swift. Asennettu puhelimeen 16.10.2026, väriä ei vielä katsottu.
- **Käyttäjä 16.10.2026, koko ja tila:** sivupalkkinappi (kolme viivaa) ja aivonappi ovat pyöreitä ja saman kokoisia kuin käyttörajarenkaiden ulompi keltainen rengas (32 pt, `ylapalkkiNapinKoko`). Aivonapin harmaa pyöreä tausta on istunnon tilan ilmaisin (`YlapalkkiPallo`, `IstunnonHehku` Ulkoasu.swift): vapaa (idle) = vihreä paikallaan, työskentelee (busy, shell) = hitaasti hengittävä sininen (2,4 s), odottaa käyttäjää (waiting) = keltainen. Aivon väri pysyy kontekstin mukaisena. Sivupalkkinapin harmaa tausta vain Liquid Glass -tilassa. Asennettu 16.10.2026, ulkoasua ei vielä katsottu.
- **Käyttäjä 16.10.2026, viilaus:** (1) hehku hengittää kaikissa tiloissa (vihreä, sininen, keltainen); (2) hehku himmenee napin reunaa kohti (säteittäinen, reuna läpinäkyvä, ei ulkovarjoa); (3) tilateksti otsikon alta pois, yläpalkin alta vapautuu rivi — `viestit-istunto` jäi näkymättömäksi nollakorkeaksi UI-testiankkuriksi; (4) yläpalkki osittain läpinäkyvä (`lapinakyvaYlapalkki`, ultraThinMaterial) chatissa ja skoopin viesteissä; (5) napit 38 pt (olivat 32 ja näyttivät renkaita pienemmiltä, koska rengasviiva ja kehys 36 pt) ja kuvake 18 pt. Asennettu; testListaJaSkooppi läpi (SCOPES_KOE_AUKI="scopes chat topbar"). Ulkoasua ei vielä katsottu.
- **Käyttäjä 16.10.2026:** tarkoitus on valita yläpalkin napit ja niiden toiminnallisuus sekä päättää yläpalkin asettelu (korjaus aiempaan kirjaukseen "yläpalkin uudistus").

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Nappien valinta, toiminnallisuus ja asettelu päättämättä | tarkoitus kirjattu 16.10.2026 | paketti CHAT-TOPBAR-NAPIT |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/chat/topbar/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
