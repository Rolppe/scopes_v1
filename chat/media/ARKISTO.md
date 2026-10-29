# scopes chat media — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 14.10.2026 — scopes chat media

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-MEDIA-SKOOPPI — liitteet skoopin viesteihin: iOS-syöttörivin liitenappi (kuvakirjasto, kamera, Tiedostot, leikepöytä) vain SkooppiViestitView:ssä; palveluun oma latausreitti (JSON-runko on rajattu 32 768 merkkiin, palvelin.mjs:137-140), joka tallentaa tiedoston palvelimelle ja lisää polun viestiin, jonka lahetaSkooppiin kirjoittaa istuntoon; istunto lukee liitteen Read-työkalulla; yksikkötesti palveluun ja simulaattoritesti äppiin — polut: scopes/ios/Sources/**, scopes/palvelu/** (palvelin.mjs, viestit.mjs, uusi liitemoduuli) — aloitus: /pura scopes chat media

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Liitteet skoopin viesteihin | määritelty 14.10.2026 | paketti CHAT-MEDIA-SKOOPPI |
| Liitteet mallichattiin (ChatView, claude -p) | odottaa CHAT-MEDIA-SKOOPPIa | oma paketti: kuva syötteen sisällä, syötemuodon vaihto |
| Liitteiden näkyminen historiassa | keskustelu() poimii vain text-lohkot (viestit.mjs:112) | ratkaistaan CHAT-MEDIA-SKOOPPIssa tai sen jälkeen |

## 14.10.2026 — scopes chat media

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-MEDIA-PUHELIN — asenna äppi (6338a63f) puhelimeen ja todenna käyttäjän kanssa liite skoopin viestiin kuvakirjastosta, kamerasta, Tiedostoista ja leikepöydältä; asennus `bash scopes/ios/asenna.sh` tai, jos työpuu ei käänny, `git archive HEAD scopes/ios` -puusta; vaatii iPhonen auki kotiverkossa — polut: scopes/chat/media/REKISTERI.md, scopes/ios/** — aloitus: /pura scopes chat media

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Liitteet mallichattiin (ChatView, claude -p) | avoin **14.10.2026:** Liitteet mallichattiin: simulaattorissa (iPhone 15 Pro, SCOPES_KOE_AUKI="scopes chat media") LiitteetUITests Passed; kuvakaappaus näytti liitteen syöttörivin yllä; Kartoitus: mallichat (ChatView) ajaa `claude -p --tools ''` (viestit.mjs:302), syöte stdinissä tekstinä; keskustelu() poimii käyttäjän viesteistä vain text-lohkot (viestit.mjs:112). | oma paketti (CHAT-MEDIA-MALLICHAT): kuva syötteen sisällä, syötemuodon vaihto |
| Äpin asennus ja puhelintodennus | avoin (iPhone unavailable 14.10.2026) | CHAT-MEDIA-PUHELIN: puhelin auki kotiverkossa, asennus HEAD-puusta (git archive HEAD scopes/ios, jos työpuu ei käänny), sitten käyttäjä kokeilee neljä lähdettä |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Liitteen avaus jumitti istunnon 3 h 23 min (14.10.2026): liitteet tallentuvat `~/.local/state/scopes-liitteet/`, joka ei ole istunnon työhakemistoissa, joten agentin Read-kutsu kuvaan (transkripti 0f6933ba, 07:34:03Z) jäi odottamaan, todennäköisesti lupakyselyä, jota äppi ei näytä. Kutsu vapautui vasta 10:56:58Z, samalla hetkellä kun äpin viesti "Jäit jumiin" kirjoitettiin tmuxiin (toimintoloki: kesto 10484 ms, "ei näkynyt"). Bash `ls`/`od` samaan hakemistoon ei jumittanut. | avoin. Korjaus: liitepolku sallitulle alueelle (työhakemiston alle tai lisähakemistoksi/Read-sallintaan; settings.json-pinnit vain ihmiselle). Äpin näkymättömästä kyselystä vika skoopille scopes chat. |
