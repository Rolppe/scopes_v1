# scopes/chat/responsivity/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: ei mitään — kysytty 16.10.2026: käyttäjä valitsi "Ei seuraavaa pakettia, pakkaa vain" (avoin asia Todennus odottaa käyttäjää: puhelimella haptiikka ja tuntuma, äppi asennettava ensin)

## Tarkoitus ja raja

Tarkoitus: scopes-chatin reagointinopeus (chatin tuntuma: viiveet, UI:n sulavuus, striimaus). Ei kata responsiivista asettelua eri näyttökokoihin. Raja: chat-koodin muutokset tehdään vain nopeuden syyksi; mallinappi, maininput ja topbar ovat omia skooppejaan.

## Päätökset

- **Käyttäjä 16.10.2026:** skooppi `scopes chat responsivity` luotiin komennolla `/pura uusi scopes chat responsivity`.
- **16.10.2026:** Toteutus `Viestit.swift`: `Viestilista(himmeat:)` + `OdottavaViesti` (avain/pohja-sovitus, 90 s vanhenemisraja), `oletettuTyo` ja `pysaytetty` asetetaan napautuksessa ja palvelun luku korjaa, `Syottorivi.tuntuma` (UIImpactFeedbackGenerator: lähetys/jatka medium, stop rigid). ChatView: pysäytys vaihtaa napin heti. Viestit.swiftin topbar-skoopin hunkit jätettiin committaamatta.
- **Käyttäjä 16.10.2026:** tarkoitus on reagointinopeus (ei asettelu). Ensimmäinen työ: korjataan tunnettu vika (vika nimetään paketin alussa).

- **16.10.2026:** Käyttäjä 16.10.2026: tarkoitus reagointinopeus, ensin tunnettu vika.

- **16.10.2026:** Optimistinen näkymä paikallisena tilana (himmeät viestit + oletettu tila), palvelun luku vahvistaa; ei palvelinmuutosta.

- **16.10.2026:** Hylätty: viestin lisääminen suoraan `tila.viestit`-listaan (poll korvaisi sen; sovitus vaikeampi).

- **16.10.2026:** Tekstin palautuminen 504:ssä säilyy (suunniteltu); palvelinpuolen effort-ikkunan sulku kuuluu skoopille scopes chat (V-526), ei tehdä responsivityssä (raja: chat-koodi vain nopeuden syyksi).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skoopin viestinäkymä: lähetetty viesti näkyi vasta palvelun palautteen jälkeen; lähetys/stop/jatka-nappi vaihtui viiveellä; napeissa ei haptiikkaa (käyttäjä 16.10.2026) | korjattu 2fd38223 16.10.2026 (koodissa, käännös ok (xcodebuild Macilla); äppi asennettu puhelimeen 16.10.2026 klo 09.52, käyttäjä ei ole vielä todentanut; todentamatta oikeassa istunnossa ja puhelimen haptiikka; puhelin: haptiikka ja tuntuma, käyttäjä valitsi 16.10.2026 pakkaa vain); odottaa käyttäjää (todenna viim. 30.10.2026) | todenna: käyttäjä kokeilee puhelimella istunnossa, jossa ei ole effort-ikkunaa auki: lähetä viesti oikeassa istunnossa → himmeä kupla heti, täyttyy palvelun listasta; stop → play heti; haptiikka puhelimella; mittaa viive napautuksesta näkymään (tavoite: välitön); sitten rivi todennetuksi tai viaksi; äppi asennettu (asenna.sh, 16.10.2026 klo 09.52); simulaattoriin kirjoittava UI-testi vaatii vapaan istunnon **16.10.2026:** Macilla ajettu `SCOPES_VAIN="MalliUITests/testMallinappiNakyyJaVaihtuu" SCOPES_TULOS=responsivity bash scopes/ios/testi.sh` (xcodebuild, ~15 min taustalla; 590 s aikaraja ei riittänyt ensimmäisellä yrityksellä): käännös ja ajo onnistuivat, koodivirheitä ei. Testi itse epäonnistui (valikossa ei mallia/efforttia, 9 XCTAssertTrue); syy todentamatta — todennäköisesti mallinappi on pois käytöstä, kun istunto on työssä (rekisteri: nappi pois käytöstä työn aikana), mutta testiä ei ajettu uudelleen ilman muutosta vertailuksi. Tulospaketti Macilla ~/scopes-ios/responsivity.xcresult; Himmeän viestin ja nappien vaihdon nopeus sekä haptiikka todentamatta: haptiikka ei toimi simulaattorissa, ja oikeaan istuntoon kirjoittava UI-testi tarvitsee vapaan istunnon. Äppi on asennettu puhelimeen tämän muutoksen kanssa (16.10.2026 klo 09.52). **16.10.2026:** asenna.sh exit 0 (build 3 s = välimuistissa), äppi puhelimessa 16.10.2026; todenna puhelimella himmeä kupla, stop→play-vaihto ja haptiikka (tekemättä); viestinäkymän rajaus: replikointi ei kuulu responsivityyn, 504 ei johdu tämän skoopin koodista (Viestit.swift catch-haara toimii kuten suunniteltu). |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/chat/responsivity/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
