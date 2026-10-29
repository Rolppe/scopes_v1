# scopes/performance/ios/REKISTERI.md

Tilanne: 18.10.2026

SEURAAVA PAKETTI: PERFORMANCE-IOS-SQL-TILA — selvitä ja tarkista SQL-toteutuksen (SQLite) tila ja persistenssi ScopesDatabasessa ja iOS-äpissä — polut: scopes/ios/**, scopes/shared/ScopesCore/** — aloitus: /pura scopes performance ios

## Tarkoitus ja raja

Kaikki Scopes iOS -äpin suorituskyky-, reagointinopeus- ja optimointikehitys:
1. Paikallisen suorituskyvyn ja 0 ms vasteaikojen takaaminen: tilarekisteri ja välimuistitietokanta (ScopesDatabase), optimistinen UI ja näkymien (sivupalkki, chat, skooppinäkymä, pura-valinta) välitön avaus ilman palvelimen odottelua.
2. Käyttöliittymän reagointinopeus ja tuntuma: viestien optimistinen renderöinti, stop/play-painikkeiden välitön reagointi ja haptinen palaute (siirretty skoopista scopes chat responsivity).
3. Ruudunpäivitysnopeus ja sulavuus: 60/120 Hz ProMotion, animaatiot, sivupalkin veto, listojen vieritys ja pudotettujen ruutujen eliminointi (siirretty skoopista scopes lista).
4. Suorituskyvyn mittaustyökalut, automaatiot ja diagnostiikka: mittausskriptit (scopes/ios/mittaa.sh), MetricKit ja pääsäikeen jumitusten valvonta.

Kuuluvat:
- scopes/ios/** (ml. Sources/ScopesDatabase.swift, Juuri.swift, Sivupalkki.swift, Viestit.swift, Nakymat.swift, PuraValinta.swift, mittaa.sh).
- scopes/shared/ScopesCore/** (tilamallit ja tietokantarakenteet iOS:ää palvelevilta osin).
- scopes/performance/ios/** (dokumentaatio, profiilit, mittaustulokset).

Ei kuulu:
- Ominaisuuksien puhtaasti toiminnallinen tai visuaalinen kehitys (kuuluu omistajaskoopeille: chat-toiminnallisuus scopes chat, topbar-napit scopes chat topbar, ulkoasu scopes design, navigointi scopes lista).

## Päätökset

- **Käyttäjä 17.10.2026:** skooppi scopes performance ios luotiin komennolla /pura uusi scopes performance ios.
- **Käyttäjä 18.10.2026:** Tämän skoopin tehtävä on keskittyä scopes ios äpin suorituskykyyn.
- **Käyttäjä 18.10.2026:** Siirretään tähän skooppiin kaikki performance-kehitys (yleinen suorituskyky, 0 ms tilatietokanta, chatin reagointinopeus, sivupalkin sulavuus ja mittaukset).
- **18.10.2026:** Skoopit scopes performance ja scopes chat responsivity arkistoitu tarpeettomina; vastuu ja koodit siirretty tähän skooppiin.
- **18.10.2026:** Ajettu kattavat suorituskykymittaukset iPhone 15 Pro -simulaattorissa (Debug vs. Release, sumeus päällä vs. pois) ja kirjattu tulokset tiedostoon scopes/performance/ios/MITTAUKSET-2026-10-18.md.
- **18.10.2026:** Korjattu Swift 6 Release-käännöksen tyyppitarkastuksen aikarajavirhe tiedostossa Viestit.swift (istunto-ankkuri purettu selkeämmäksi).
- **18.10.2026:** Sivupalkin veto optimoitu eristämällä päänäkymät PaanakymaSisalto: View, Equatable -komponentiksi (Juuri.swift). Vetoliikkeen ruutumäärä tuplaantui (10 -> 22) ja nykyaika putosi 480 ms:sta 33–170 ms tasolle (MITTAUKSET-2026-10-18.md).
- **18.10.2026:** ChatView kytketty ScopesDatabase-tietokantaan: agentit ja oletusmalli alustetaan 0 ms suoraan muistista/levyltä, ja keskustelut avautuvat välittömästi välimuistista ennen verkkovastauksen saapumista.
- **18.10.2026:** 120 Hz ProMotion avattu koko sovellukselle (project.yml: CADisableMinimumFrameDurationOnPhone = true) ja CADisplayLinkille asetettu preferredFrameRateRange (60...120 Hz) Juuri.swiftissä.
- **18.10.2026:** Optimoitu versio 120 Hz ProMotion -tuella käännetty, allekirjoitettu ja asennettu suoraan fyysiseen iPhone 15 Prohon (skoopit-asennus.sh, devicectl launch).
- **16.10.2026 (siirretty responsivitystä):** Toteutus Viestit.swift: Viestilista(himmeat:) + OdottavaViesti (avain/pohja-sovitus, 90 s vanhenemisraja), oletettuTyo ja pysaytetty asetetaan heti napautuksessa, Syottorivi.tuntuma (UIImpactFeedbackGenerator).
- **13.10.2026 (siirretty listasta):** Sivupalkki Equatable, .visualEffect piirtoefekti, ISO-aikojen jäsennysoptimointi, mittari Juuri.swiftissä ja scopes/ios/mittaa.sh.

- **18.10.2026:** Kehitetty ja hiottu skoopin scopes performance ios toteutusta Scopes-standardien mukaisesti

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikallinen tilarekisteri ja 0 ms välimuisti | asennettu puhelimelle (ScopesDatabase.swift, Sivupalkki, SkooppiViestitView, ChatView; ScopesCore testit 17/17 ok) | todenna toiminta ja 0 ms avaus oikeassa istunnossa puhelimella |
| Chatin optimistinen UI ja haptiikka | asennettu puhelimelle | todenna viestin lähetys, himmeä kupla heti, stop/play ja haptiikka puhelimella |
| Sivupalkin vetoliikkeen optimointi ja 120 Hz ProMotion | asennettu puhelimelle (CADisableMinimumFrameDurationOnPhone: true, PaanakymaSisalto: Equatable) | todenna ProMotion 120 Hz fyysisellä laitteella |
| SQL-toteutuksen tila (SQLite) | kartoitettavana | selvitä missä tilassa SQL/SQLite-toteutus on ScopesDatabasessa ja iOS-äpissä |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: scopes/performance/ios/HISTORIA.md (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
