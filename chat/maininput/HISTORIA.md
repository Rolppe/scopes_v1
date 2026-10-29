# scopes chat maininput — toteutushistoria

## Toteutushistoria

- 16.10.2026 — skooppi `scopes chat maininput` luotu (`/pura uusi`, commit 7b2741c7) ja puretaan; tarkoitus kirjattu: scopes-äpin iOS-chatin viestikenttä. Raja: topbar, mallinappi, media ja responsivity ovat omia skooppejaan (8e92ecaa, 35ea94cd).
  - Ensimmäinen työ CHAT-MAININPUT-LUONNOS tehty (318c1b83): käyttäjän vaatimus "kenttään kirjoitettu teksti katoaa, kun vaihdan skooppia tai teen muuta; tekstin pitää pysyä kyseisen skoopin kentässä". `scopes/ios/Sources/Viestit.swift`: `enum Luonnos` (UserDefaults, avain `luonnos.<omistaja>`), `SkooppiViestitView` lukee alkuarvon `init`issä ja tallentaa `onChange(teksti)` avaimella `skooppi.<nimi>`; `ChatView` tallentaa avaimella `chat.<agentti>` ja `onChange(valittu)` tuo kentän agentin oman luonnoksen. Tyhjä teksti poistaa luonnoksen, lähetys tyhjentää kentän.
  - Uusi `scopes/ios/UITests/LuonnosUITests.swift` (`testLuonnosSailyySkoopeittain`).
  - Vikailmoitukset omistajille: V-536 (scopes chat, Viestit.swift), V-537 (scopes testit, LuonnosUITests.swift).
  - todettu (ei rekisteriin): Ensimmäinen ajo kaatui, koska oletusskoopit `scopes lista` ja `scopes chat` eivät olleet auki ("scopes lista ei ole auki"); testin oletukset vaihdettu skoopeiksi `scopes testit` ja `scopes viat`, joilla on istunto auki (`/api/skoopit`: istuntoja>0).
  - todettu (ei rekisteriin): `testi.sh` välittää testille vain `SCOPES_KOE_AUKI`, ei `SCOPES_KOE_AUKI2`:ta (sama puute SkoopitUITests.testSkoopinVaihtoEiMustaa); testi.sh:ta ei muutettu, koska se on toisen keskustelun keskeneräisessä muutoksessa.