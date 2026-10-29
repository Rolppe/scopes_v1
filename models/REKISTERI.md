# scopes/models/REKISTERI.md

Tilanne: 17.10.2026

SEURAAVA PAKETTI: MODELS-KARTOITUS — kartoita, missä Scopes-äpin mallivalinta, mallien käsittely ja validointi nyt tehdään (scopes/palvelu, ios, macos, shared, agy, qwen38), ja kirjaa löydökset (file:line) scopes/models/KARTOITUS.md:hen; vain luku, ei muutoksia muihin skoopeihin — polut: scopes/models/** — aloitus: /pura scopes models

## Tarkoitus ja raja

**Tarkoitus:** kaikki mallien valintaan, käsittelyyn ja validointiin liittyvät asiat Scopes-äppiä koskien (käyttäjä 17.10.2026).

**Raja:**
- Sisällä: mitä malleja Scopes-äppi tarjoaa ja käyttää, miten malli valitaan, miten mallivalinta ja mallin tiedot käsitellään ja miten ne validoidaan.
- Ulkona: yksittäisen mallin ajoympäristö (esim. `scopes qwen38`), äpin käyttöliittymä (`scopes ios`, `scopes macos`) ja palvelun muu logiikka (`scopes palvelu`). Muutos näihin kirjataan omistajalle `/vika <skooppi> …` (TYÖTAVAT sääntö 15).

## Päätökset

- **Käyttäjä 17.10.2026:** skooppi `scopes models` luotiin komennolla `/pura uusi scopes models`.
- **Käyttäjä 17.10.2026:** tarkoitus on kaikki mallien valinta, käsittely ja validointi Scopes-äppiä koskien.
- **Ehdotus 17.10.2026 (käyttäjä ei ole vahvistanut):** ensimmäinen työ on kartoitus MODELS-KARTOITUS ennen toteutusta.
- **Käyttäjä 17.10.2026 (kaksi Google-tiliä):** molemmat Google AI Pro -tilit halutaan Scopes-äppiin niin, että Googlelle menee mahdollisimman vähän laitetietoa; ratkaisu vain palvelimella, vaihto rajan täyttyessä. Mittaus (agy proxyn läpi): telemetria `play.googleapis.com/log` (installation_id, machineId, polut) ja Unleash (`instanceId` = käyttäjä-kone) lähtevät; `settings.json`:ssa ei telemetria-asetusta. Google on estänyt kolmannen osapuolen työkalut, jotka hakevat Antigravity-kiintiöitä (Gemini CLI -tiimi 27.2.2026; toinen rikkomus = pysyvä esto).
- **Käyttäjä 17.10.2026:** nykyinen kiintiöhaku omalla koodilla poistettu käytöstä toistaiseksi: `scopes/palvelu/agy-kayttoraja.mjs` ei kutsu Googlea, ellei `SCOPES_AGY_KIINTIOHAKU=1`; vain paikallinen pyyntömäärä jää. Palvelin käynnistetty uudelleen, testit 16/16. Omistajalle (scopes agy usage) kirjattava `/vika`.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Rajan tarkennus muiden skooppien kanssa | tarkoitus kirjattu 17.10.2026, raja luonnos | vahvista kartoituksen jälkeen |
| Kahden tilin ratkaisu | HOME-eristys ja agy:n oma telemetria-asetus selvittämättä; proxy-lohkolistan riski tuntematon | selvitä agy:n omat asetukset ensin |
| Ensimmäinen työ | ehdotettu: MODELS-KARTOITUS | paketti MODELS-KARTOITUS |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/models/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
