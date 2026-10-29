# scopes/localregister/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: ei mitään — kysytty 15.10.2026: "Vain kirjaus riitti" (LR 1 Linux-asennus, LR 2 Mac-asennus, LR 3 kaikkien skooppien käyttöönotto jäävät tuleviksi); Reunatapaus odottaa äpin rekisterin luontia, puhelimen äppi päivitetään seuraavan äppimuutoksen yhteydessä

## Tarkoitus ja raja

Rekisterien laitteiden välinen synkronointi ilman pakkaus- ja purkuvälitystä: jokaisella laitteella kaikki rekisterit, versiot vertaillaan ja päivitetään tai yhdistetään, kun laitteet näkevät toisensa. Rakennetaan rinnakkaisena testattavana sivujärjestelmänä Scopes-äppiin ja Linux-palvelimelle; nykyiseen rekisteriin ei kosketa ennen huolellista testausta (käyttäjä 14.10.2026). Raja: ensimmäisessä vaiheessa kaksi laitetta, Scopes-äppi ja palvelin; muut koneet myöhemmin. Nykyiset REKISTERI.md:t ja git pysyvät totuutena, kunnes kaksoiskappale on testattu.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes localregister` luotiin komennolla `/pura uusi scopes localregister`.
- **Käyttäjä 14.10.2026 (sanatarkasti):** tarkoitus: "minulla on semmoinen ajatus että rekisterit olisi hyvä toimia siten että kaikilla laitteilla on kaikki rekisterit rekisterien päivitys ei tapahtuisi pakkaus ja purku välityksellä vaan kun laitteet näkevät toisensa ne tarkastaa toistensa rekisterien versiot ja jos eri versiot niin ne päivitetään tai tarvittaessa yhdistetään. versiomerkinnässä pitäisi olla myös merkki mikä lähde sen version on tehnyt jotta jos sama numero on molemmilla niin ei mene sekaisin. myös pakkaus ja purku operaatio triggeröivät rekisterien synkronoinnin laitteiden välillä. tähän on syytä suunnitella huolella tapa mitenkä rekisterit on mahdollisimman helposti synkronoitavissa. rekisterit kannatta myös pilkkoa aika pieniksi siksi koska jos rekisterit on isoja niin on paljon suurempi todennäköisyys että samaa rekisteriä muutetaan eri laitteilla samaan aikaan. tämä muutos tehdään kaksois kappaleena alkuperäisen rinnalle ja sitä testaillaan huolella ensin ennen kun nykyistä rekisteriä muutetaan. rekisterien määrä saattaa myös muuttua eri laitteilla joten se on syytä ottaa huomioon. aluksi tämä tehdään testattavana sivujärjestelmnä scopes äppiin ja linux serverille".
- **Käyttäjä 14.10.2026 (jäsennyksen vaatimukset V1–V9 esitetty):** K1 synkka käynnistyy millä tahansa yhteydellä, "mutta joku minimi aika uudelleen tarkastukseen on järkevä jos muutoksia ei ole tapahtunut"; K2 palvelinpää on palvelin, "koska se on auki aina"; K3 äppi myös muokkaa rekistereitä, joten yhdistäminen tarvitaan heti; K4 saman kohdan samanaikainen muutos "kysytään käyttäjältä tilanteessa".
- **Käyttäjä 14.10.2026:** synkan palvelinpään ajopaikka "selvitä itse" → Scopes-palvelun sisään (MUOTO §10); uudelleentuonti "molemmat" (ennen synkkaa ja 10 min välein).
- **Käyttäjä 14.10.2026:** `MUOTO.md` hyväksytty pohjaksi (yksikkö = rivi, K5 mitattu); tyhjän tarkistuksen väli 10 min; synkkaan kaikki 78 tiedostoa (myös HISTORIA ja ARKISTO); kaksoiskappale gitin ulkopuolella `~/.local/share/localregister`.

- **14.10.2026:** Käyttäjä 14.10.2026: K1 synkka millä tahansa yhteydellä + vähimmäisväli tyhjälle tarkistukselle; K2 palvelinpää palvelin ("auki aina"); K3 äppi myös muokkaa; K4 ristiriita kysytään käyttäjältä tilanteessa.

- **14.10.2026:** Käyttäjä 14.10.2026: tyhjän tarkistuksen väli 10 min; synkkaan kaikki 78 tiedostoa (myös HISTORIA, ARKISTO); kaksoiskappale `~/.local/share/localregister`; MUOTO.md hyväksytty.

- **14.10.2026:** Ajopaikka (käyttäjä "selvitä itse") → Scopes-palvelun sisään: avain, verkkoreitti ja cron-valvonta valmiina; oma prosessi vaatisi toisen avaimen, portin ja root-cron-rivin. Tuonti lapsiprosessissa, tiivisteet välimuistissa.

- **14.10.2026:** Uudelleentuonti (käyttäjä "molemmat"): ennen tiivistekyselyä, jos HEAD muuttui, ja 10 min välein.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti LOCALREGISTER-APPI uudessa istunnossa (automaattisiirto).

- **14.10.2026:** Käyttäjä 14.10.2026 (pakkauskysymys): seuraava paketti LOCALREGISTER-LAITETESTI.

- **14.10.2026:** Laitenimeen satunnainen pääte: simulaattori ja puhelin ovat eri laitteita, ja tunnus `<laite>-<laskuri>` on yksilöllinen vain yksilöllisellä laitenimellä (MUOTO §2).

- **14.10.2026:** Kirjoittava UI-koe vain koeinstanssia vastaan (SCOPES_KOE_LR=1), ei tuotannon kaksoiskappaletta.

- **14.10.2026:** Äppi ei vielä lisää rivejä eikä luo rekistereitä (rajattu pois; LOCALREGISTER-LISAYS tarjottiin vaihtoehdoksi).

- **14.10.2026:** Käyttäjä 14.10.2026: asennus ja laitetesti hyväksytty ("Asenna ja testaa").

- **14.10.2026:** Käyttäjä 14.10.2026 (pakkauskysymys): seuraava paketti LOCALREGISTER-RIVINVAIHTO.

- **14.10.2026:** Taulukkorivin tunnistus: laji ≠ taulukko-otsake ja ensimmäinen merkki `|` (alkurivinvaihdot ohitetaan, sisennystä ei), sama sääntö äpissä ja palvelussa; syy: lajit avoin/vika/paatos kattavat myös listarivit, joten laji ei yksin kerro taulukkoa.

- **14.10.2026:** Palvelu hylkää koko lähetyksen (400) eikä normalisoi: normalisointi muuttaisi sisältöä samalla versiolla, ja laitteet erkanisivat. Hylkäys ennen kirjoitusta, jottei lähetys jää puoliksi.

- **14.10.2026:** Äppi: Return = välilyönti, ja jo rikkinäinen rivi (005655) siistiytyy, kun sitä muokataan — muuten sen muokkaus jumittaisi synkan palvelun hylkäykseen.

- **14.10.2026:** Käyttäjä 14.10.2026 (LuLu): simulaattoritesteissä LuLu-kehotteeseen valitaan "hyväksy aina", ja testien lopuksi agentti ottaa luvan pois (`ssh dev-host 'sudo -n /usr/local/sbin/lulu-hallinta luettele Skoopit'`, sitten `aja --kuiva` / `aja` op poista). Syy: simulaattoriäppi on ad hoc -allekirjoitettu (`codesign -dv`: Signature=adhoc, TeamIdentifier=not set), joten LuLu sitoo säännön polkuun …/Bundle/Application/<UUID>/, joka vaihtuu joka asennuksessa; vanha sääntö F5F8E273 osoitti poistuneeseen polkuun 39F5C32E, nykyisille A919A705 (Skoopit.app) ja B2AAEDF1 (SkoopitUITests-Runner.app) ei ollut sääntöä → kehotteet ja todennäköisesti UI-kokeen aikakatkaisut. lulu-hallinta ei osaa lisätä sääntöjä (vain poista/salli/esta).

- **14.10.2026:** Käyttäjä 14.10.2026 (pakkauskysymys): seuraava paketti LOCALREGISTER-RIVINVAIHTO-TODENNUS.

- **14.10.2026:** Tuotannon kaksoiskappaleen 005655-riviä ei korjattu tässä (tuotantodata; korjautuu, kun riviä muokataan päivitetyllä äpillä).

- **14.10.2026:** Käyttäjä 14.10.2026: "Agentti laajentaa lulu-hallintaa" — allowSimulatorApps päälle lulu-hallinnan kautta (hylätyt: kehotteiden hyväksyntä joka ajossa; ei nyt).

- **14.10.2026:** Käyttäjä 14.10.2026 valitsi seuraavaksi paketiksi RIVINVAIHTO-TODENNUKSEN loppuosan.

- **14.10.2026:** Käyttäjä 14.10.2026: "Agentti tekee molemmat" (palvelun uudelleenkäynnistys + äpin asennus).

- **14.10.2026:** Käyttäjä 14.10.2026: "Suunnittele nämä testit siten että voit ajaa itsenäisesti" — käyttäjän puhelinmuokkauksen tilalle simulaattorin UI-testi; harjoitus ensin koeinstanssin kopiolla, sitten tuotanto.

- **14.10.2026:** Säilytettävä versio = lähteen uusin (oneplus 5735), koska iphonemcll-versio oli laitetestin jälki toisen rivin päällä. Hylätty: käsiyhdistys ja ratkaisu suoraan API:lla (ei todentaisi äpin polkua).

- **14.10.2026:** Käyttäjä 14.10.2026: "Agentti ajaa uudelleen" tuotantoajon luokitinesteen jälkeen.

- **14.10.2026:** rivin lisäys ankkurin alle; tyhjä rivi siirtyy uudelle riville ja taulukon ankkurin häntä lyhenee (muuten tyhjä rivi jäisi taulukon keskelle). Hylätty: ankkurin koskemattomuus (katkaisisi taulukon) ja lisäys yläpuolelle (ei kata taulukon loppua).

- **14.10.2026:** lisäys rivin pyyhkäisytoiminnosta, ei muokkausnäkymän alapalkista (alapalkki näppäimistön alla).

- **14.10.2026:** Lisäys pitkän painalluksen valikosta (contextMenu), ei pyyhkäisyllä: "sivuttaisveto missä kohtaa tahansa avaa palkin" on käyttäjän päätös 13.10.2026 (Juuri.swift), joten globaalia elettä ei muutettu. Hylätty: trailing-pyyhkäisy + sivupalkin eleen rajaus vasemmalle vedolle (koskisi koko äppiä), näkyvä painike rivin vieressä (vie tilaa jokaiselta riviltä). contextMenu oli yksi rekisterin Rivin lisäys -rivin ehdottamista vaihtoehdoista.

- **14.10.2026:** Paritus vaatii samankaltaisuuden (paketin arviointikysymys: kyllä). Taulukkorivin avain = ensimmäinen solu, koska rivit tunnistetaan siitä; hinta: ensimmäisen solun uudelleennimeäminen = poisto + lisäys. Hylätty: pelkkä järjestys (tuotti riidan), pelkkä Dice tauluriveille (pitkät tilasolut heiluttavat kerrointa).

- **14.10.2026:** Lähteeseen palautettu äppimuutos ei ole riita (kolmitieyhdistys: pohja = lahdeSisalto, äppi = pohja → gitin muutos voittaa).

- **14.10.2026:** Tuotannon olemassa olevaa 005655-riitaa ei ratkaistu tässä (tuotantoon kirjoitus vaatii käyttäjän luvan, TYOTAVAT 8).

- **14.10.2026:** 005655 ratkaistiin lähteen poistolla eikä vanhalla `lahdeSisalto`-sisällöllä, koska lähde (REKISTERI.md HEAD) ei enää sisällä riviä; rekisteripakkaus 1c932004 poisti "Uudelleentuonnin paritus" -rivin, joten 5785:n valinta olisi palauttanut poistetun rivin.

- **14.10.2026:** Puhelimen "palvelin"-muokkaus jätettiin ennalleen: käyttäjän data, ei tämän paketin asia.

- **14.10.2026:** Siivous = tiivistys `_siivotut.json`-merkinnäksi, ei kuittausta laitteilta: tieto poistosta säilyy (tunnus + versio), joten laite, joka ei nähnyt poistoa, saa sen listoista. Hylätty: kuittauspohjainen (kaikki laitteet nähneet) poisto ilman merkintää — palvelin ei näe äpin tilaa, ja simulaattoriasennukset luovat uusia laitenimiä, jotka eivät palaa (siivous jumittuisi), ja pitkään poissa ollut laite herättäisi poistetun rivin.

- **14.10.2026:** Tiivisteet eivät sisällä siivottuja merkintöjä: laite, jolla kiveä ei koskaan ollut, on silti yhtenevä.

- **14.10.2026:** Gitissä yhä olevaa riviä (äpin poistama, `lahdeSisalto` ≠ null) ei siivota: uudelleentuonti loisi sen uudestaan. Riidassa olevaa kiveä ei siivota (K4 odottaa käyttäjää).

- **14.10.2026:** Siivous ajetaan vain käsin, kunnes puhelimessa on uusi äppi: vanha äppi lähettäisi siivotut kivet joka synkassa uudelleen (palvelu ohittaa, mutta tiivisteet eroavat pysyvästi). Käsiajo käynnissä olevaa palvelua vastaan jättää palvelun tiivistevälimuistin vanhaksi seuraavaan HEAD-muutokseen asti, joten tuotantoon siivous kytketään `lr.mjs tuo`:n loppuun (palvelu tyhjentää välimuistin tuonnin jälkeen).

- **14.10.2026:** käyttäjä: "Asenna ja vie tuotantoon" — äpin asennus ja Scopes-palvelun uudelleenkäynnistys agentin tekeminä.

- **14.10.2026:** Siivous ajetaan `lr.mjs tuo`:n lopussa samassa try-lohkossa (ennen `laite.tallenna()`), ei erillisenä ajastuksena: palvelu tyhjentää tiivistevälimuistin tuonnin jälkeen, joten tiivisteet eivät jää vanhoiksi. Hylätty: käsiajo `lr.mjs siivoa` käynnissä olevaa palvelua vastaan (jättää välimuistin vanhaksi).

- **14.10.2026:** käyttäjä: "Jatka itsenäisesti etsien ratkaisut itsenäiseen testaukseen" → odottavat rivit muutetaan agentin itse ajettaviksi: riita 005612 ratkaistaan simulaattorin UI-kokeella testLrRistiriitaLahdeVoittaa (harjoitus koeinstanssissa, sitten tuotanto 8787), ja rivin lisäys todennetaan simulaattorilla tuotantoa vastaan siivoavana (SCOPES_KOE_LR_POISTA=1), ei käyttäjän puhelimella.

- **14.10.2026:** Puhelimen tila luetaan devicectl:llä (vain luku), ei ajeta XCUITestiä käyttäjän oikealla puhelimella (ohjaisi käyttäjän näyttöä).

- **14.10.2026:** Rivin lisäyksen koerivi poistetaan tuotantoajossa äpin kautta, jottei testirivi jää kaksoiskappaleeseen; seuraava tuonti tiivistää kiven. Hylätty: koerivi jätetään (roska kaikilla laitteilla), poisto API:lla (ei todentaisi äpin poistopolkua).

- **14.10.2026:** Tuotannon siivoava lisäysajo pidätettiin, kunnes poiston tyhjän rivin vika oli korjattu ja harjoitus todisti tekstin tavulleen samaksi; muuten tuotannossa "## Viat" olisi liimautunut Avoimet asiat -taulukkoon.

- **14.10.2026:** Poista rivi -korjaus: automaattinen fokus säilytetään (testit 70–75 ja 135–139 nojaavat siihen, kursori rivin loppuun), painike siirretään safeAreaInsetiin. Hylätty: näppäimistön Valmis-työkalurivi (`ToolbarItemGroup(placement: .keyboard)`) — ei näkynyt arkissa (kuvakaappaus lr-lisays-harj2); swipeDown TextEditorissa ei sulje näppäimistöä.

- **14.10.2026:** Poisto siirtää hännän edelliselle näkyvälle riville vain, jos tämä ei ole riidassa ja sen häntä on yksi rivinvaihto (peilikuva lisaa-funktion ankkurisäännölle).

- **14.10.2026:** Käyttäjä 14.10.2026: "Anna kaikki säännöt mitkä tarvitset lulussa toimivan" → vastaus: ei sääntöjä, vain "Allow simulator apps" päälle aktiivisessa profiilissa; käyttäjä teki sen itse ikkunasta.

- **14.10.2026:** Käyttäjä 14.10.2026: lulu-hallinta-muutos "Pidä ja committaa" (78e4941d); asennus Macille jätetty infralle (valinnainen nyt, kun asetus on profiilissa).

- **14.10.2026:** Käyttäjä keskeytti muokatun skriptin testikopion ajon Macilla (scp /tmp + python3): ei ajeta asentamatonta lulu-hallintaa Macilla kysymättä.

- **14.10.2026:** Käyttäjä 14.10.2026: scopes-perhe live-rekisteriksi; vienti "Palvelu heti (suositus)" (hylätty: vain purussa/pakkauksessa, vaatisi claude siirron työkalumuutoksen); push "Seuraava pakkaus pushaa (suositus)" (hylätty: push heti, kilpailisi istuntojen pushien kanssa).

- **14.10.2026:** LR on scopes/-rekistereille totuus ja git-tiedosto sen vienti; muut 37 tiedostoa pysyvät pelkkinä tuonteina.

- **14.10.2026:** Vienti ohittaa (viedään myöhemmin): avoin riita (K4), tiedoston tai skoopin REKISTERI.md:n pakkauslukko, istunnon muokkaama tiedosto, git-toiminto kesken / irrotettu HEAD, epäonnistunut commit. Syy: likaiseen tiedostoon ei yhdistetä (istunnon työ), vaan LR yhdistää pakkauscommitin kolmitiesäännöllä ja vienti seuraa.

- **14.10.2026:** Vienti palvelussa erikseen kytkettävä (SCOPES_LR_VIENTI), koska koeinstanssi käyttää tuotannon repojuurta ja committaisi muuten koedataa.

- **14.10.2026:** Ei --no-verify-lippua commitissa (hookit saavat hylätä).

- **14.10.2026:** kilpatilanne korjataan äpissä (lisäkierros, kun todennus eroaa), ei palvelussa viivästämällä siivousta: ero näkyy jo todennushetkellä, ja sama kilpa koskee kaikkia tuonteja, ei vain vientiä. Hylätty: palvelun vienti ilman siivousta (siirtäisi saman kilvan seuraavaan tuontiin).

- **Käyttäjä 15.10.2026:** tulevat tehtävät järjestyksessä: 1 Linux-asennus, 2 Mac-asennus, 3 kaikkien skooppien käyttöönotto.

- **15.10.2026:** Vika suljetaan korjattuna: korjaus (pysäytyksen todennus ss:llä) on noudatettu kahdessa sessiossa, ja portti on nyt vapaa.

- **15.10.2026:** Käyttäjä 15.10.2026: tulevat tehtävät järjestyksessä: 1 Linux-asennus, 2 Mac-asennus, 3 kaikkien skooppien käyttöönotto (jo rekisterissä, 1cfed8cc).

- **15.10.2026:** Käyttäjä 15.10.2026: "Vain kirjaus riitti" — LR 1–3 jäävät tuleviksi, ei SEURAAVA-pakettia.

- **15.10.2026:** Käyttäjä 15.10.2026: puhelimen synkka todennetaan "Agentti lukee puhelimen" (devicectl, vain luku); hylätyt: "Riittää näin", simulaattorin synkka tuotantoa vastaan.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Reunatapaus | avoin (tiedossa; äppi ei vielä luo rekistereitä (Lr.swift), eikä ominaisuutta ole tilattu) | äpin luoma rekisteri, joka myöhemmin ilmestyy gittiin samalla polulla: uudelleentuonti luo git-yksiköt äpin yksiköiden rinnalle (kaksoiskappaleet). Ratkaistaan vasta, kun äppi osaa luoda rekistereitä. |
| Puhelimen äppi ilman 8eeea31f:tä | avoin (tiedossa, ei kiireellinen) **15.10.2026:** Todettu 15.10.2026: iphonemcll on käyttäjän oikea puhelin (HISTORIA.md rivi 81: "palvelin"-muokkaus; Päätökset: puhelimen palvelin-muokkaus on käyttäjän dataa); Todettu 15.10.2026: palvelun loki (~/.local/state/scopes-palvelu.loki) ei kirjaa laitenimiä, joten puhelimen viimeistä synkkaa ei voi todentaa lokista; Todettu 15.10.2026: devicectl-vertailu (puhelimen LR-kopio vs. palvelimen LR) 0 eroa (91 rekisteriä, 6046 yksikköä), puhelin konvergoi ilman korjausta. **15.10.2026:** Todettu 15.10.2026 (puhelin, laite iphonemcll, laskuri 3): puhelimen rekisterit vs palvelimen ~/.local/share/localregister/rekisterit (versio, sisältö, poistettu, jarjestys): rekisterit 91/91, yksiköt 6046/6046, 0 eroa; puhelimen uusin tiedosto 15.10.2026 13.29 (scopes/agy/android). Haku Macilla `xcrun devicectl device copy from … --domain-identifier com.example.skoopit --source "Library/Application Support/localregister"` (Macin zsh:ssa ei ole `timeout`-komentoa); vertailuskripti scratchpadissa, ei repossa; Todettu 15.10.2026: viive commit → puhelin 2–55 min (2 Infra/iot/oneplus, 6 scopes/agy, 8 context/purascript, 11 localregister, 12 agy/android, 18 notifications, 52 infra, 55 universaltools), mediaani ~9 min; pitkät viiveet todennäköisesti äppi kiinni (loki ei kirjaa laitenimiä, ei todennettavissa). | asennetaan seuraavan äppimuutoksen yhteydessä (`bash scopes/ios/asenna.sh`, puhelin Macin näkyvissä); ennen sitä puhelin konvergoi ajastimella. |
| LR 1: Linux-asennus | tuleva, odottaa käyttäjää (käyttäjä 15.10.2026: "Vain kirjaus riitti"; järjestys 1/3) | localregister-laitteeksi palvelin: oma laitenimi ja kaksoiskappale, synkka palvelimen palvelua vastaan (MUOTO §2, §10). Suunnitellaan ja aloitetaan käyttäjän pyynnöstä. |
| LR 2: Mac-asennus | tuleva, odottaa käyttäjää (käyttäjä 15.10.2026: "Vain kirjaus riitti"; järjestys 2/3) | localregister-laitteeksi Mac samalla tavalla kuin Linux (LR 1 ensin). |
| LR 3: Kaikkien skooppien käyttöönotto | tuleva, odottaa käyttäjää (käyttäjä 15.10.2026: "Vain kirjaus riitti"; järjestys 3/3) | LR totuudeksi ja vienti gittiin kaikille skoopeille, ei vain `scopes/`-perheelle (nyt SCOPES_LR_VIENTI=scopes/; muut 37 tiedostoa pelkkiä tuonteja). Edellyttää LR 1–2:ta. |

## Viat

| Vika | Tila |
|---|---|
| Koeinstanssi jäi päälle | korjattu 15.10.2026 (ss: 0 kuuntelijaa 8799:ssä; säännön mukainen todennus kahdessa sessiossa). Alkuperä 14.10.2026: HISTORIA (RIVINVAIHTO-TODENNUS) sanoo "Koeinstanssi pysäytetty", mutta edellisen session 8799-instanssi (pid 17603, käynnistetty 20.06, HOME=edellisen session scratchpad) kuunteli yhä 20.18; seuraava session uusi instanssi kaatui EADDRINUSE:en ja `curl` vastasi vanhasta. Pysäytetty `kill 17603`. Korjaus: koeinstanssin pysäytys todennetaan `ss -ltn \| grep 8799` -tyhjällä ennen kuin pysäytys kirjataan. Pysäytys todennettu 14.10.2026: 0 kuuntelijaa. Korjausta noudatettu myös seuraavassa sessiossa: pysäytys todennettu ss:llä = 0 kuuntelijaa 14.10.2026. (todenna viim. 29.10.2026) |

## Historia

Historia: `scopes/localregister/HISTORIA.md`, ei lueta purussa.
