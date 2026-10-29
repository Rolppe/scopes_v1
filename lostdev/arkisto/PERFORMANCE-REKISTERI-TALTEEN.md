# scopes/performance/REKISTERI.md

Tilanne: 17.10.2026

SEURAAVA PAKETTI: PERFORMANCE-TILATIETOKANTA-JA-CHAT — suunnittele ja toteuta Scopes-äpeille paikallinen tilarekisteri ja reagoiva keskustelutietokanta (ScopesCore/Models, ScopesCore/Store/StateDatabase, iOS/macOS välimuistibindaus ja 0 ms chat-avaus) — polut: scopes/shared/ScopesCore/**, scopes/ios/**, scopes/macos/** — aloitus: /pura scopes performance

## Tarkoitus ja raja

Scopes-äppien (iOS, macOS, widgetit) paikallisen suorituskyvyn, reagointinopeuden ja palvelinriippumattomuuden takaaminen:
Pidetään yllä paikallista rekisteriä/tietokantaa tiloista, joita päivitetään äppien välillä tarvittaessa. Muutokset päivittävät tietokantaa välittömästi (optimistinen UI), jolloin äppi tietää tilanteen valmiiksi. Keskusteluille ja skoopin viesteille toteutetaan nopeasti reagoiva paikallinen tietokanta, jotta chat-ikkunan avauksessa vanhat tekstit, syöttökenttä ja toiminnot näkyvät ja toimivat heti ilman palvelimen odottelua (0 ms viive). Palvelinyhteys ajaa deltasynkronointia taustalla.

Kuuluvat:
- `scopes/shared/ScopesCore/**`: Yhteinen tilatietokantarajapinta, tilamallit, viestien paikallinen tallennus ja synkkarajapinnat.
- `scopes/ios/**` ja `scopes/macos/**`: Paikallinen tilarekisteri, välimuistibindaukset näkymiin (Sivupalkki, ChatView, SkooppiViestitView, PuraValintaView) ja 0 ms näkymäavaus.
- `scopes/palvelu/**`: Tarvittaessa taustasynkan ja deltahaun tehostaminen.

## Päätökset

- **Käyttäjä 17.10.2026:** Skooppi `scopes performance` luotiin perehtymään Scopes-äpin suorituskykyyn.
- **Käyttäjä 17.10.2026:** Käytiin iOS-äppi läpi ja kartoitettiin elementit, joiden toiminta ja näyttäminen ovat liikaa sidoksissa palvelimen vastausaikaan.
- **Käyttäjä 17.10.2026:** Pidetään rekisteriä tiloista, joita päivitetään äppien välillä tarvittaessa. Muutokset muuttavat tietokantaa ja äppi tietää valmiiksi tilanteet. Keskusteluihin nopeasti reagoiva tietokanta, jotta chatin avauksessa ei tarvitse odotella vanhoja tekstejä.
- **17.10.2026:** Ensimmäinen työpaketti `PERFORMANCE-TILATIETOKANTA-JA-CHAT`: Paikallinen tilatietokanta ja keskusteluvarasto ScopesCoreen sekä iOS- ja macOS-äppien kytkeminen siihen.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Paikallinen tilarekisteri ja keskustelutietokanta | avoin | paketti PERFORMANCE-TILATIETOKANTA-JA-CHAT |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/performance/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
