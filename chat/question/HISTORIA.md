# scopes chat question — toteutushistoria

## Toteutushistoria

- 14.10.2026 — klo 15.05 CHAT-QUESTION-VAAKA tehty (1e22e6f0).
  - CHAT-QUESTION-VAAKA tehty (1e22e6f0): KysymysKortti (scopes/ios/Sources/Viestit.swift) vaakatilassa (verticalSizeClass compact): Muu-kenttä alkaa yhdeltä riviltä (pystypadding Vali.s) ja kasvaa vasta kun teksti ei mahdu; kirjoittaessa (fokus kentässä) ei Lähetä/Seuraava-nappia; rivinvaihto siirtää seuraavaan kysymykseen, viimeisessä lähettää (submitLabel next/send). Ilman näppäimistöä nappi näkyy. `lisattyRivinvaihto` siirrettiin Syottorivista tiedostotason funktioksi.
  - viat (ratkaistu, ei rekisteriin): rivinvaihdon jälkeen vanha kenttä kirjoitti tekstinsä uuden kysymyksen vastaukseksi ("Tarkoitus: Kokeilu — Alustat: Kokeilu …"); sidos kiinnittää kysymyksen indeksin (`let kq = q`, `kirjoita(kq, …)`). Korjattu ennen committia (1e22e6f0).
  - UI-testi testVaakaRivinvaihtoLahettaa (scopes/ios/UITests/KysymysUITests.swift).
  - Äppi asennettu iPhoneen 14.10.2026 klo 14.59 HEADista 1e22e6f0 (`git archive HEAD scopes/ios` → asenna.sh); profiili voimassa 2026-10-20T08:20:55Z.
  - todettu (ei rekisteriin): KysymysUITests 3/3 vihreä Macin simulaattorissa 14.10.2026 (`SCOPES_VAIN=… bash scopes/ios/testi.sh`, exit 0); ensimmäinen ajo punainen ennen indeksikorjausta (exit 65).
  - todettu (ei rekisteriin): Käyttäjä todensi puhelimessa 14.10.2026: vaakatilassa kenttä yksi rivi, nappi poissa kirjoittaessa, rivinvaihto siirtää/lähettää — "Works".
  - vieraat skoopit (tiedoksi): `scopes/ios/Sources/Viestit.swift` kuuluu `scopes chat` ja `scopes/ios/UITests/KysymysUITests.swift` `scopes testit`; muutos oli skoopin rajassa `KysymysKortti`, kirjattu omistajille V-390 → scopes chat (b66ef35) ja V-391 → scopes testit (44af8fd).
- 14.10.2026 — klo 12.44 /pura scopes chat question --autojatko (autovaihto); aloitettiin CHAT-QUESTION-PUHELIN kysymättä.
  - CHAT-QUESTION-PUHELIN tehty 14.10.2026 klo 12.53: koeistuntona tämä istunto itse (407e9532, tmux siirto-scopes-chat-question-124525; palvelu :8787 näki sen `voiLahettaa: true`). Istunto kysyi AskUserQuestionilla 3 kysymystä (yksivalinta, monivalinta, yksivalinta), käyttäjä vastasi iPhonen Scopes-äpin moniosaisella kortilla (äppi 44cfb0c7).
  - ratkennut (Avoimet asiat): Moniosainen kortti puhelimessa — CHAT-QUESTION-PUHELIN tehty 14.10.2026: oikea istunto kysyi kolme kysymystä ja käyttäjä vastasi iPhonen Scopes-äpin moniosaisella kortilla (äppi 44cfb0c7).
  - viat (ratkaistu, ei rekisteriin): ei uusia vikoja
  - todettu (ei rekisteriin): Käyttäjän havainnot puhelimesta (kortin vastaus sanatarkasti): "Ylärivi: Näkyi, siirtyi — Nuolet: Nuolet toimivat, Valinta säilyi, Seuraava odotti — Lähetä: Ei lähtenyt itse" → ‹ 1/3 › ja X näkyivät; yksivalinta siirsi seuraavaan; nuolet ‹ › toimivat ja valinta säilyi; monivalinta odotti Seuraava-nappia; viimeinen yksivalinta ei lähettänyt itse, Lähetä kokosi vastauksen.
  - todettu (ei rekisteriin): Perillemeno: `~/.local/state/scopes-toiminnot.loki` 2026-10-14T09:53:32.893Z toiminto viesti, istunto 407e9532, 109 merkkiä, kesto 910 ms, tulos ok; vastaus tuli istuntoon yhtenä käyttäjän viestinä (Escape sulki dialogin, teksti perään — lahetaSkooppiin, scopes/palvelu/viestit.mjs).
  - todettu (ei rekisteriin): Toinen kortti (yksi kysymys, pakkauksen paketinvalinta) vastattiin myös puhelimesta: loki 09:54:54.972Z, 22 merkkiä, ok.
- 14.10.2026 — skooppi luotu `/pura uusi scopes chat question` (46de4193, install.sh ajettu).
  - CHAT-QUESTION-MAARITTELY tehty (7280db27): tarkoitus kysymyskortti, raja kirjattu rekisteriin.
  - CHAT-QUESTION-YKSI-KERRALLAAN tehty (44cfb0c7): KysymysKortti (scopes/ios/Sources/Viestit.swift) näyttää yhden kysymyksen kerrallaan; yläreunassa ‹ 1/N › ja X; yksivalinta siirtää seuraavaan 0,2 s viiveellä; monivalinta ja Muu odottavat Seuraava-nappia; viimeisessä Lähetä kokoaa vastaukset yhdeksi tekstiksi kuten ennen. Viestikupla sai `ylos`-takaisinkutsun (kortin yläreuna näkyviin kysymyksen vaihtuessa). KysymysKoe-näkymä + Juuri.swift-haara (SCOPES_KOE_KORTTI=1). Uusi UI-testi scopes/ios/UITests/KysymysUITests.swift.
  - Äppi asennettu iPhoneen 14.10.2026 klo 12.42 HEADista 44cfb0c7 (`git archive HEAD scopes/ios` → asenna.sh, jottei toisen keskustelun likainen Infra.swift/SkoopitUITests.swift mene mukaan); profiili voimassa 2026-10-20T08:20:55Z.
  - viat (ratkaistu, ei rekisteriin): muistiossa ei uusia vikoja eikä muutoksia; taulukossa ei rivejä
  - todettu (ei rekisteriin): Palvelu (scopes/palvelu/viestit.mjs) ennallaan: vastaus menee istuntoon tekstinä Escape + send-keys (lahetaSkooppiin).
  - todettu (ei rekisteriin): xcresulttool vaatii Macilla `export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` (ilman: exit 72).