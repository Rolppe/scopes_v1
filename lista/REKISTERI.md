# scopes/lista/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — SCOPES-LISTA-MALLIT-OLETUS todennettu (käyttäjä 15.10.2026) ja viive korjattu 1d9cc0a7; skoopissa ei heti ajettavaa riviä (purku 15.10.2026: 0 heti ajettavaa)

## Tarkoitus ja raja

Sivupalkin lista ja navigointi: Sivupalkki.swift ja Juuri.swift (järjestys, suodatin All/Scope/Chat, haku, pyyhkäisy)

## Päätökset

- **Käyttäjä 13.10.2026:** skooppi `scopes lista` luotiin jakamalla `scopes` ominaisuuksittain (luo-skooppi.mjs `scopes lista`.

- **13.10.2026:** Käyttäjä 13.10.2026: asennus puhelimeen ja testikorjaus ("Molemmat").

- **13.10.2026:** Ehto "keskustelu ei kesken" luetaan paikallisesti (chat-näkymä ilman avattua keskustelua); palvelimen /api/chat/kaynnissa ei kysytä, koska äppi ei palauta keskustelua kylmäkäynnistyksessä.

- **13.10.2026:** Käyttäjä 13.10.2026: ei seuraavaa pakettia.

- **13.10.2026:** Näppäimistön palautus vain samaan näkymään ja keskusteluun; ei, jos asetukset- tai uusi skooppi -arkki on auki.

- **13.10.2026:** Käyttäjä 13.10.2026: elävän palvelun :8787 uudelleenkäynnistys hyväksytty tähän muutokseen.

- **13.10.2026:** Oma valinta: idle-istunto (vuoro valmis, ei pakattu) = odottaa (keltainen); automaattisiirron uusi istunto pitää skoopin aktiivisena.

- **13.10.2026:** skooppirivin symbolit (avoimet, viat, konteksti) pidetään; käyttäjä totesi ne tarpeellisiksi selityksen jälkeen.

- **13.10.2026:** seuraavaa pakettia ei nimetä (käyttäjän valinta "Ei seuraavaa"); TILA-ELAVA:n puhelintodennus jää avoimeksi riviksi odottamaan käyttäjää.

- **13.10.2026:** Sivupalkin ollessa esillä päänäkymä on sumea; sumeus seuraa palkin siirtoa (sama tahti avauksessa, sulkemisessa ja vedossa) (käyttäjä 13.10.2026).

- **13.10.2026:** Raskas kuvasumeus jätetään puhelimeen ja koodiin mittausta varten, ei palauteta pelkkää himmennystä (käyttäjä 13.10.2026 "Jätetään mitattavaksi").

- **13.10.2026:** Sumeus näkyy vain liikeradan viimeisellä 30 %:lla (opacity 0 → 1 siirron 70–100 %:lla) (käyttäjä 13.10.2026: "Sumennus kannattaa tehdä vain liikeradan viimeisellä 30% matkalla"); asennettu 23.07, ei vielä todennettu.

- **13.10.2026:** Sumeus (kertakuva, viimeinen 30 %) jää; raskaus ei ollut sumeudessa.

- **13.10.2026:** Käyttäjä 13.10.2026: ei seuraavaa pakettia (jäljellä olevat ~60 ms ja ~30 ms eivät tuntuneet; SCOPES-LISTA-IRROTUS hylätty).

- **13.10.2026:** Käyttäjä 13.10.2026 (vastaus pakkauskysymykseen): "Ei seuraavaa (suositus)" — SEURAAVA pysyy "ei mitään".

- **14.10.2026:** Käyttäjä 14.10.2026: korjaa V-284 tässä (scopes infran tiedosto) eikä scopes infrassa.

- **14.10.2026:** Käyttäjä 14.10.2026 (uusi vaatimus): kansio keltainen vain, kun istunnossa on kyselykortti auki; muut käyttäjää odottavat (vuoro valmis) vihreällä; kesken prosessia oranssi, pakattu harmaa.

- **14.10.2026:** kysely voittaa kasittely-tilan skooppitasolla: kortti on auki vain vastaukseen asti ja vaatii käyttäjää.

- **14.10.2026:** Lupakysely (permission prompt) = vihreä odottaa, käyttäjän sanoin "muut jotka odottavat" vihreällä.

- **14.10.2026:** Chatit pysyvät tasolla 0 (ennallaan aktiivisten joukossa); tuntematon tila → taso 0.

- **14.10.2026:** Käyttäjä valitsi 14.10.2026 "Ei seuraavaa" → pakkaa vain, ei sessionvaihtoa.

- **15.10.2026:** Käyttäjä 15.10.2026: punainen X = Arkistoi (ei piilotus eikä täysi poisto) ja varmistus kysytään; ennen vetoa painetaan paikallaan hetki, muuten sivuttaisveto siirtää listaa. Tavallista .swipeActionsia ei käytetty tästä syystä.

- **15.10.2026:** Arkistointi committoidaan palvelussa (vain työkalun polut), push seuraavassa pakkauksessa/synkassa.

- **15.10.2026:** Käsitestiä (koeskooppi +-valinnoin ja arkistointi vahvistaen) ei tarvita: käyttäjä 15.10.2026 "Ei tarvita" — ele riitti.
- **15.10.2026:** Pidon tunnistus UIKit-delegaatilla (yhtäaikainen tunnistus) + vierityksen pan pois vedon ajaksi; rekisterin muut ehdotukset (LongPressGesture.sequenced, shouldRequireFailureOf) jäivät kokeilematta, koska ensimmäinen toimi.

- **15.10.2026:** Ei vaihdettu mallien lähdettä /api/agentit:iin: lähde on jo yhteinen (palvelin.mjs:133); vika korjattiin äpin latauslogiikassa.

- **15.10.2026:** Korjaus palvelinpäähän välimuistiin (vanha lista heti + taustapäivitys) eikä äppiin: viive syntyi palvelussa, ja sama /api/purkajat palvelee myös purkajavalintaa.

- **15.10.2026:** Ei esihakua luoPurkajat-konstruktorissa: kasittelija luo sen oletusparametrina, ja testit ajaisivat silloin oikean `agy models`in; esihaku tehdään kaynnista.sh:ssa.

- **15.10.2026:** Paikallisten mallien 20 s välimuisti (viestit.mjs haePaikalliset, ssh ConnectTimeout 3 s) jätettiin ennalleen: mitattu syy oli agy; jos palvelin on pois päältä, kylmä haku voi odottaa ~3 s — ei mitattu tässä.

- **15.10.2026:** Korjaus tehtiin tämän skoopin rivin alla, vaikka purkajat.mjs:n omistaa scopes ja kaynnista.sh:n scopes yhteys (sama käytäntö kuin a6a65703:ssa); omistajille tiedoksi V-483/V-484.

- **15.10.2026:** Ei uutta pakettia: käyttäjä ei antanut tehtävää (hylkäsi kysymyksen, pyysi pakkausta 15.10.2026).

- **15.10.2026:** VIERAS-tiedostot (vaihevirheet.jsonl, delegation.jsonl, expresso __pycache__) olivat likaisia jo ennen tätä sessiota (gitStatus session alussa) tai ovat työkalujen mittauslokeja: ei pakattu eikä kirjattu vika.sh:lla omistajille, koska tämä sessio ei tehnyt niitä muutoksia.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Huomio scopes designille (V-344): korostusvaihtoehto Vihreä tekee käsittely-kansiosta saman värisen kuin odottaa (kirjattu 14.10.2026) | avoin; odottaa skooppia scopes design | ilmoitettu scopes designille (V-344); scopes design päättää korostusvärin; tälle skoopille ei tehtävää ennen sitä |
| testInfraJarjestys punainen | avoin (selvittämättä) | tarkista, onko punainen jo ennen 028019cd:tä (ei liity tämän session muutoksiin). |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/lista/HISTORIA.md`, ei lueta purussa.
