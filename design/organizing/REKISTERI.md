# scopes/design/organizing/REKISTERI.md

Tilanne: 27.10.2026

SEURAAVA PAKETTI: ei mitään — organisoinnin suunnittelu ja katselmus valmis, toteutus omistajaskoopeilla (scopes lista, scopes macos) — polut: scopes/design/organizing/** — aloitus: /pura scopes design organizing

## Tarkoitus ja raja

**Tarkoitus:** Skoopit-äpin (`scopes`) skooppien ja työtilojen organisoinnin (organizing) UX- ja visuaalinen suunnittelu: skooppien ryhmittely, kansiointi, lajittelu, suodatus, suosikit/kiinnitetyt skoopit, priorisointi ja siirtely.

**Raja:**
- Sisällä: Organisoinnin suunnitteludokumentit, konseptit, wireframet ja UI/UX-spesifikaatiot polussa `scopes/design/organizing/**`. Visuaalinen ilme periytyy ja noudattaa `scopes/design/ILME.md`-määrityksiä.
- Ulkona: Kooditoteutus äppiin ja palvelimelle (kuuluu toteuttaville skoopeille kuten `scopes lista`, `scopes chat`, `scopes`, `scopes2`). Mahdolliset muutostarpeet muihin skoopeihin koordinoidaan TYÖTAVAT säännön 15 mukaisesti (`/vika`-kirjaukset).

## Päätökset

- **Käyttäjä 27.10.2026:** skooppi `scopes design organizing` luotiin komennolla `/pura uusi scopes design organizing`.
- **27.10.2026:** skoopin tarkoitus ja raja määritelty (DESIGN-ORGANIZING-MAARITTELY).
- **Käyttäjä 27.10.2026:** Infran valikon skoopit siirretään yhteen listan kanssa. Uusi listanäkymä yhdistää skoopit-näkymän ja listanäkymän. Listavalikon yläosaan tehdään `Scope`- ja `Chat`-välilehtien rinnalle oma `Allscope`-välilehti.
- **27.10.2026:** Kartoitettu skooppien nykyinen järjestely ja ryhmittely ja laadittu konseptiluonnos ja arkkitehtuuri `scopes/design/organizing/SUUNNITELMA.md` (DESIGN-ORGANIZING-KARTOITUS).
- **Käyttäjä 27.10.2026:** "Toteuta" -> Toteutettu Allscope-välilehti iOS:n `Sivupalkki.swift`:iin (suodatin, allscope-puulista, haun automaattilaajennus ja tasosisennykset) sekä macOS:n `MacSidebar.swift`:iin (hierarkiasuodatin ja puurivit).
- **27.10.2026:** Infran skooppipuu poistettu iOS:stä (`Infra.swift`) ja macOS:stä (`MacInfraView.swift`), jotta Infra keskittyy palvelin- ja järjestelmätilaan sekä kontekstitiedostoihin. Skooppipuu toimii nyt Allscope-välilehdellä, ja simulaattoritestit on päivitetty vastaamaan uutta rakennetta (DESIGN-ORGANIZING-INFRASIIVOUS).
- **27.10.2026:** Suunniteltu suosikkien (pin/kiinnitetyt) hallinta, pikasuodatuspillerit, mukautettu kansiointi ja kosketuseleet sivupalkkiin ja Allscope-näkymään `scopes/design/organizing/SUUNNITELMA.md` (DESIGN-ORGANIZING-SUOSIKIT-JA-SUODATUS).
- **27.10.2026:** Suosikkien kiinnitystoiminnot toteutetaan pyyhkäisyeleellä oikealle, pitkän painalluksen kontekstivalikolla sekä päänäkymän otsikkotyökalurivin nastanapilla.
- **27.10.2026:** Scope-välilehdellä kiinnitetyille korteille luodaan oma osio huipulla ennen aktiivisia istuntoja turkoosilla nastamerkinnällä ja prioriteettilajittelulla.
- **27.10.2026:** Laadittu tarkat toteutustehtävät ja -lipukkeet omistajaskoopeille (`scopes lista`, `scopes macos`) suosikkien ja pikasuodatuksen toteuttamiseksi: L-ORG-01..05 ja M-ORG-01..05 (`scopes/design/organizing/TOTEUTUSTEHTAVAT.md`) (DESIGN-ORGANIZING-TOTEUTUSKOORDINAATIO).
- **27.10.2026:** Mukautetun kansioinnin ja virtuaaliryhmien (Folders & Tags) yksityiskohtainen UX-, vuorovaikutus- ja koodispesifikaatio laadittu (`SUUNNITELMA.md` luku 9). Määritelty Accordion-haitarikortit, tilasynteesi, New Folder Sheet, väri- ja ikonivalitsimet, monikanavainen siirtely (pyyhkäisy, kontekstivalikko, Drag & Drop), tagijärjestelmä ja JSON-tietomalli (`OrganizingConfig`/`SkooppiKansio`) (DESIGN-ORGANIZING-KANSIOT).
- **27.10.2026:** Laadittu tarkat toteutuslipukkeet omistajaskoopeille: L-ORG-06..10 (`scopes lista`) ja M-ORG-06..10 (`scopes macos`) kansioiden, dialogien, Accordion-esityksen, Drag & Dropin ja tagien toteuttamiseksi (`TOTEUTUSTEHTAVAT.md`).
- **27.10.2026:** Katselmoitu ja todennettu organisoinnin kokonaisuus (Allscope, suosikit, pikasuodatus, kansiot ja tagit), varmistettu ILME.md-yhdenmukaisuus ja laadittu omistajasuositukset ja vaiheistus (`scopes/design/organizing/KATSELMUS.md`) (DESIGN-ORGANIZING-KATSELMUS).
- **27.10.2026:** Organisoinnin UX- ja visuaalinen suunnittelu on valmis. Toteutus etenee omistajaskooppien (`scopes lista` ja `scopes macos`) toimesta `TOTEUTUSTEHTAVAT.md`-lipukkeiden L-ORG-01..10 ja M-ORG-01..10 mukaisesti.

- **27.10.2026:** Organisoinnin arkkitehtuurisuunnittelu ja katselmus on valmis; toteutus siirretään omistajaskoopeille (scopes lista, scopes macos)


## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/design/organizing/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
