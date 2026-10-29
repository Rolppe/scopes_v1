# scopes/chat/maininput/REKISTERI.md

Tilanne: 16.10.2026

SEURAAVA PAKETTI: CHAT-MAININPUT-SEURAAVA — kirjaa käyttäjän kanssa viestikentän seuraava työ (luonnos valmis 16.10.2026) — polut: scopes/chat/maininput/**, scopes/ios/** — aloitus: /pura scopes chat maininput

## Tarkoitus ja raja

Tarkoitus: scopes-äpin iOS-chatin viestikenttä (maininput). Raja: topbar, mallinappi, media ja responsivity ovat omia skooppejaan (`scopes/chat/*`); chatin nopeus kuuluu responsivityyn. Ensimmäinen työ: luonnoksen säilyminen (ks. Päätökset).

## Päätökset

- **Käyttäjä 16.10.2026:** skooppi `scopes chat maininput` luotiin komennolla `/pura uusi scopes chat maininput`.

- **Käyttäjä 16.10.2026:** tarkoitus on "chatin viestikenttä iOS:ssä".
- **Käyttäjä 16.10.2026:** ensimmäinen työ: jos kenttään kirjoittaa tekstiä ja vaihtaa skooppia tai tekee muuta, teksti katoaa; kirjoitetun tekstin pitää pysyä kyseisen skoopin tekstikentässä.

- **16.10.2026:** Luonnos tallennetaan UserDefaultsiin (säilyy skoopin vaihdon ja äpin uudelleenkäynnistyksen yli), omistajan mukaan: skooppi nimellä, chat agentilla. Hylätty: pelkkä `@State`-säilytys (näkymä luodaan uudelleen `.id("\(nimi)#\(skooppiAvaus)")`, Juuri.swift:111) ja yhteinen yksi luonnos kaikille.

- **16.10.2026:** Käyttäjä 16.10.2026: tarkoitus "chatin viestikenttä iOS:ssä"; seuraava paketti CHAT-MAININPUT-SEURAAVA (valittu pakkauskysymyksessä).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Luonnos säilyy skoopeittain (skoopin vaihto, äpin uudelleenkäynnistys) | valmis 16.10.2026: `Luonnos` (UserDefaults) Viestit.swift, simulaattoritesti LuonnosUITests läpi (testi.sh, scopes testit + scopes viat); chatin agenttikohtaista luonnosta ei testattu **16.10.2026:** Luonnos-testi todennettu 16.10.2026: `SCOPES_VAIN="LuonnosUITests/testLuonnosSailyySkoopeittain" SCOPES_TULOS=luonnos bash scopes/ios/testi.sh` → exit 0, Passed (118,9 s, Macin simulaattori, oikea palvelin 192.0.2.11:8787); testi kirjoittaa eri tekstin kahteen auki olevaan skooppiin, vaihtaa edestakaisin, käynnistää äpin uudelleen, tarkistaa tekstit ja siivoaa lopuksi; Luonnos säilyy skoopeittain: ei todennettu testin kaatuminen ilman korjausta, chatin agenttikohtainen luonnos (agentin vaihto) eikä toiminta oikealla puhelimella. (todenna viim. 30.10.2026) | puhelimessa todennus käyttäjältä |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/chat/maininput/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
