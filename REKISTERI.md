# scopes/REKISTERI.md

Tilanne: 13.10.2026

SEURAAVA PAKETTI: ei mitään — kehitys jatkuu alaskoopeissa (`scopes chat`, `scopes lista`, `scopes infra`, `scopes hallinta`, `scopes yhteys`, `scopes jakelu`, `scopes jakelu mac`, `scopes testit`); lähin ajettava on `scopes jakelu mac` -uusinnan todennus aikaisintaan 18.10.2026

## Tarkoitus ja raja

iOS-äppi, jonka ensimmäinen tehtävä on hallita Claude-skooppeja ja näyttää niiden kontekstit. Myöhemmin äppiä laajennetaan hallitsemaan koko tekoälyinfraa; se laajennus ei kuulu vielä tähän skooppiin. Raja (13.10.2026): skoopin konteksti tarkoittaa sekä rekisteriä (seuraava paketti, avoimet asiat, viat) että käynnissä olevan istunnon kontekstikokoa tokeneina. Tiedot tulevat kotipalvelimen pienestä rajapinnasta, ei GitHubista, koska vain palvelin näkee käynnissä olevat istunnot ja sama palvelu kantaa myöhemmän infrahallinnan. Versio 1 on pelkkä luku; toiminnot (pura, pakkaa, uusi skooppi) tulevat omana pakettinaan. Äppi tehdään SwiftUI:lla ja testataan iOS-simulaattorissa.

## Päätökset

- **Käyttäjä 13.10.2026:** skooppi `claude demo scopes` luotiin komennolla `/pura uusi claude demo scopes`.
- **Käyttäjä 13.10.2026:** `claude demo scopes` → juuritason skooppi `scopes` (claude ja infra rinnalle), hakemisto `workspace/scopes/` → `scopes/` (juurirepo; kohdekartan rivi `scopes`, oma repo myöhemmin siirra-skooppi.sh:lla). Alaskoopit sallitaan vähintään 10 sanan syvyyteen (SIIRTO-SYVAT-ALASKOOPIT, 1ede0db9); alaskoopit päätetään erikseen.
- **Käyttäjä 13.10.2026:** alaskoopit ominaisuuksittain, ei kerroksittain (sama ominaisuus äpissä ja palvelussa samaan skooppiin): `scopes chat`, `scopes lista`, `scopes infra`, `scopes hallinta`, `scopes yhteys`, `scopes jakelu`, `scopes jakelu mac`, `scopes testit`. Tiedostojen omistus reitittimen Polusta skooppiin -taulussa tiedostoriveinä; jakamattomat (`.gitignore`, yhteiset) jäävät `scopes`:lle. Avoimet rivit siirretty: allekirjoituksen uusinta → `scopes jakelu mac`, palvelin pois -todennus → `scopes chat`.
- **Käyttäjä 13.10.2026:** tarkoitus on iOS-äppi, joka aluksi hallitsee Claude-skooppeja ja näyttää niiden kontekstit; myöhemmin se laajenee koko tekoälyinfran hallintaan.
- **Käyttäjä 13.10.2026:** konteksti = rekisteri ja istunnon kontekstikoko; tietolähde = rajapinta kotipalvelimella; versio 1 vain luku.
- **Käyttäjä 13.10.2026:** puhelin tavoittaa palvelun kotiverkosta ja WireGuardin läpi; jokainen /api/skoopit-pyyntö vaatii Bearer-avaimen (avain palvelimella `~/.config/scopes/avain`, ei repossa); palomuuriin ei muutoksia.
- **Käyttäjä 13.10.2026:** iOS-äpin kehitys ja testaus tehdään iOS-simulaattorilla. Hyväksytty poikkeus: palvelun cron-rivi (`*/5`, `kaynnista.sh`) infran cron.d-lähteeseen ja asennus rootina.

- **13.10.2026:** Käyttäjä 13.10.2026: skooppi tekee iOS-äpin, joka aluksi hallitsee Claude-skooppeja ja näyttää niiden kontekstit; myöhemmin laajenee koko tekoälyinfran hallintaan.

- **13.10.2026:** Käyttäjä 13.10.2026: konteksti = rekisteri (seuraava, avoimet, viat) + istunnon kontekstikoko; tietolähde = rajapinta kotipalvelimella (ei GitHub); versio 1 vain luku; yhteys kotiverkko + WireGuard + Bearer-avain, palomuuriin ei muutoksia; kehitys ja testaus iOS-simulaattorilla.

- **13.10.2026:** Hyväksytty poikkeus 13.10.2026: cron-rivi infran cron.d-lähteeseen ja asennus rootina.

- **13.10.2026:** Hylätyt: GitHub-tietolähde (ei näe istuntoja), avaimeton yhteys, toiminnot heti versioon 1.

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti on hallintatoiminnot (suositus valittu). Käyttäjän ensimmäinen vastaus kysymykseen meni väärään skooppiin, ja käyttäjä pyysi unohtamaan sen.

- **13.10.2026:** Avain Keychainiin, osoite UserDefaultsiin; testit ajetaan oikeaa palvelua vastaan, ei mockia.

- **13.10.2026:** Käyttäjä 13.10.2026: turvamalli "vain valmiit toiminnot" — palvelu ajaa vain pura, pakkaa ja uusi; skoopin nimi skoopit.json:sta (uusi: tiukka muoto 1–4 sanaa [a-z0-9-], ei olemassa), ei vapaata tekstiä komentoriviin, execFile ilman kuorta, sama Bearer-avain, yksi toiminto kerrallaan, jokainen yritys lokiin. Hylätyt: erillinen kirjoitusavain + Face ID; uusi skooppi pois puhelimesta.

- **13.10.2026:** pura sallitaan vain skoopille ilman käynnissä olevaa istuntoa; pakkaa vain kun skoopilla on tasan yksi tmux-istunto ja se on idle.

- **13.10.2026:** UI-testit käyttävät vain palvelun hylkäämiä pyyntöjä, jotta simulaattoriajo ei avaa, pakkaa eikä luo mitään.

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti on puhelinasennus ja koeajo.

- **13.10.2026:** Käyttäjä 13.10.2026: poikkeus hyväksytty — Macille LaunchAgent `com.example.skoopit-asennus`, vain kickstartilla (ei kirjautumis- eikä ajastettua käynnistystä); 7 pv automaattista uusintaa ei nyt. Paluu: `launchctl bootout gui/501/com.example.skoopit-asennus` + plistin poisto.

- **13.10.2026:** Käyttäjä 13.10.2026: poista silvia_pico_UI iPhonesta (3 äpin raja).

- **13.10.2026:** Käyttäjä 13.10.2026: avain leikepöydän kautta (sallittu kerran).

- **13.10.2026:** Käyttäjä 13.10.2026: pura-onnistuminen todennetaan simulaattorilla, kun käyttäjä on poissa; kehitys jatkuu simulaattorilla "kunnes toisin sanon".

- **13.10.2026:** Kirjoittava pura-koe vain erikseen `SCOPES_KOE_PURA="<koeskooppi>" bash scopes/ios/testi.sh`; tavallinen ajo edelleen vain hylätyt pyynnöt.

- **13.10.2026:** Käyttäjä 13.10.2026 (seuraava kehitys, sanatarkasti): "Ruvetaan kehittämään äppiä seuraavasti. 1. Äpissä on yläpalkki jossa on välilehdet -chat. Tämä on tila missä voi käyttää mitä tahansa agentteja ilman konteksti hallintaa. Chat näyttö on perus claude chat tilan kaltainen. -skopes. Täällä on kaikki skoopit. Skoopin napauttaminen yhdistää itse skoopin viestittelyyn. -infra. Tänne tulee kaikki skoopit ja niiden rakenne jäsennettynä. Klikkaamalla skooppia aukeaa lisätiedot. -asetukset. Tämä vain ratas ikoni oikeassa reunassa." Tämä laajentaa skoopin rajaa (aiempi raja: infrahallinta ei vielä kuulu; versio 1 vain luku + toiminnot) — käyttäjän päätös. Avoimia määrittelykysymyksiä: chatin agenttivalinta ja tekniikka (palvelin välittää viestit claude-istuntoon vai Remote Control), "yhdistää skoopin viestittelyyn" = skoopin käynnissä oleva istunto vai uusi pura, infra-välilehden "rakenne" (alaskoopit, repot, rekisterit).

- **Käyttäjä 13.10.2026 (DEMO-SCOPES-VALILEHDET määrittely):** chat = palvelin (palvelin) ajaa agentin ja välittää viestit äppiin samalla avaimella; valittavissa Claude-mallit ja omat agentit (`~/.claude/agents`); skopes-välilehdellä skooppi ilman istuntoa näyttää viestin "skooppi ei ole auki" ja sen alla Pura-napin, joka purkaa ja avaa viestinäkymän; infra = skooppipuu (pääskooppi → alaskoopit), lisätiedoissa repo, polut, seuraava paketti, avoimet asiat ja viat. Hylätyt: Remote Control -linkki chatiksi, pelkät mallit, automaattinen pura napautuksesta, koneet ja palvelut infra-välilehdelle.

- **13.10.2026 (DEMO-SCOPES-VALILEHDET, toteutus):** turvamallin laajennus käyttäjän määrittelyn mukaan: chat ajaa `claude -p --tools ""` (ei työkaluja) erillisessä työhakemistossa `~/.local/state/scopes-chat`, viesti stdinissä, agentin nimi listalta ja jatkon tunnus UUID-muodosta; skoopin viesti kirjoitetaan `tmux send-keys -l` -argumenttina skoopin ainoaan CLI-tmux-istuntoon (Remote Controlin sdk-cli-ajot eivät saa ruutua). Hylätty: chat-agentille työkalut (vaatisi erillisen päätöksen).

- **Käyttäjä 13.10.2026:** DEMO-SCOPES-VALILEHDET valmis simulaattorissa; kehitys jatkuu simulaattorilla. Seuraavaksi valitut: infra-puun nuolet, työkalut skoopin viesteihin, chatin keskusteluhistoria. Ei valittu nyt: chatin vastaus kirjain kerrallaan.

- **13.10.2026:** Hylätyt: käyttäjän Terminal-ajo asennukseen (käyttäjä: "Selvitä mitenkä tämä on tehty expresso ios äpin kanssa ja remote ios äpin kanssa").

- **13.10.2026:** Käyttäjä 13.10.2026 (määrittely): chat = palvelin ajaa agentin; valittavissa Claude-mallit + omat agentit (~/.claude/agents); skooppi ilman istuntoa → viesti "skooppi ei ole auki" + Pura-nappi, joka purkaa ja avaa viestinäkymän; infra = skooppipuu + rekisteritiedot. Hylätyt: Remote Control -linkki chatiksi, pelkät mallit, automaattinen pura napautuksesta, koneet ja palvelut infraan.

- **13.10.2026:** Toteutus: chat ilman työkaluja (`--tools ""`), työhakemisto ~/.local/state/scopes-chat, viesti stdinissä; skoopin viesti `tmux send-keys -l`, rivinvaihdot välilyönneiksi. Hylätty: chat-agentille työkalut (vaatisi erillisen päätöksen).

- **13.10.2026:** Käyttäjä 13.10.2026: kehitys jatkuu simulaattorilla; seuraavaksi infra-puun nuolet, työkalut skoopin viesteihin, chatin keskusteluhistoria. Ei valittu: chatin vastaus kirjain kerrallaan.

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti on chatin vastaus kirjain kerrallaan (suoratoisto), simulaattorissa.

- **13.10.2026:** Käyttäjä 13.10.2026: elävän palvelun uudelleenkäynnistys hyväksytty poikkeuksena (luokitin esti ilman lupaa).

- **13.10.2026:** Chatin historia luetaan claude-transkripteista (ei omaa keskustelutietokantaa); vain agentin nimi tallennetaan erikseen, koska --agent-ajon transkripti ei kerro sitä.

- **13.10.2026:** Suoratoisto omana polkunaan /api/chat/virta (NDJSON), vanha /api/chat säilyy, koska puhelimessa on vanha äppiversio. Hylätty: SSE (NDJSON riittää URLSession.bytes.lines:lle).

- **13.10.2026:** Valmis-rivin koko vastaus korvaa palojen summan, jotta kupla vastaa historiaa.

- **13.10.2026:** Käyttäjä 13.10.2026: elävän palvelun uudelleenkäynnistys hyväksytty tähän muutokseen.

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti DEMO-SCOPES-ASENNUS (uusi versio iPhoneen, uusii samalla allekirjoituksen).

- **13.10.2026:** Käyttäjä 13.10.2026: poikkeus hyväksytty — Skoopit-äpin allekirjoituksen automaattinen 7 pv uusinta ajastetulla LaunchAgentilla (expresso-malli). Korvaa rivin "7 pv automaattista uusintaa ei nyt".

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti DEMO-SCOPES-UUSINTA-TODENNUS (aikaisintaan 18.10.2026).

- **13.10.2026:** Käyttäjä 13.10.2026: ikoni D (solmut), neljä valkoista solmua.

- **13.10.2026:** Käyttäjä 13.10.2026: äpin nimi Scopes; kolmen pisteen valikko korvaa yläpalkin; Claude iOS -tyylinen alapalkki; mallivalitsimessa vain Claude-mallit + palvelimen paikalliset mallit; paikalliset eivät valittavissa, kun palvelin ei ole käytettävissä.

- **13.10.2026:** Mallin vaihto purkaa muut ladatut mallit (muut LM Studion käyttäjät menettävät mallinsa vaihdossa).

- **Käyttäjä 13.10.2026:** 9b-malleja ei piiloteta: kaikki laitteilla käytettävissä olevat mallit kuuluvat mallivalitsimeen. Valitun mallin merkki nimen oikealle puolelle (vasemmalla se siirsi nimeä).

- **13.10.2026:** Käyttäjä 13.10.2026: 9b-malleja ei piiloteta; kaikki laitteilla käytettävissä olevat mallit kuuluvat valitsimeen.

- **13.10.2026:** Käyttäjä 13.10.2026: näyttölukko tai äpin vaihto ei saa heti katkaista yhteyttä; katkenneena näkyy napautettava uudelleenyhdistys. Toteutus: palvelin jatkaa ajoa ja äppi liittyy siihen (hylätty: vain virheteksti ja uusi kysymys).

- **13.10.2026:** Käyttäjä 13.10.2026: skooppi- ja chat-lista yhdeksi sivupalkiksi, nuoli vasemmassa yläkulmassa ja reunaveto; kello pois chatista. Oma valinta: järjestys uusin muutos ensin (skoopille lisätty aika palveluun).

- **13.10.2026:** Käyttäjä 13.10.2026: elävän palvelun uudelleenkäynnistys hyväksytty tähän muutokseen.

- **13.10.2026:** Sivupalkin vedon hienosäätö jatkuu vain käyttäjän aloitteesta: älä ehdota sitä, älä nosta SEURAAVA-riville; avoimena rivinä vain tilana.

- **13.10.2026:** Huipulle nousu = pysähdysaika (vuoro valmis tai kysymys), ei jokainen viesti: työn välivaiheet eivät nosta.

- **13.10.2026:** Monivalinta näytetään korttina, ei vastata puhelimesta (tmux-näppäily voisi sulkea dialogin, muisti askuserquestion-dismiss).

- **13.10.2026:** Käyttäjä 13.10.2026: lupa :8787 uudelleenkäynnistykseen ja asennukseen puhelimeen ("Kyllä, molemmat").

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti = käyttäjän kokeilu puhelimessa (DEMO-SCOPES-LISTA-KOKEILU).

- **13.10.2026:** Testi ei luo omaa kysymysdataa: avoimen kortin todennus vaatii istunnon, joka odottaa kysymykseen vastausta ajon aikana.

- **13.10.2026:** Käyttäjä 13.10.2026: scopes juuritasolle claude ja infra rinnalle; alaskoopit vähintään 10 sanan syvyyteen; jako ominaisuuksittain (ei kerroksittain). Kirjattu scopes/REKISTERI.md Päätöksiin.

- **13.10.2026:** Käyttäjä 13.10.2026: cron kopioitiin rootina; elävää palvelua ei käynnistetä uudelleen ("Leave it").

- **13.10.2026:** käyttäjä: SEURAAVA PAKETTI pysyy "ei mitään" (valinta pakkauksessa).

- **28.10.2026 (SIIRTO-GIT-LAITETARKASTUS, juurihaarojen merge):** haarassa `claude_local` oli 18.10.2026 luotu rinnakkainen tynkärekisteri (`/pura uusi scopes`), jonka tarkoitusrivi oli "saada ios äppiin mahdollisimman nopea integrointi nebius token factory api key:lle". Mergessä säilytettiin aktiivisen haaran rekisteri; tynkä on luettavissa komennolla `git show 91dd9ae7:scopes/REKISTERI.md`.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| [scopes yhteys] Elävä palvelu :8787 ajaa vanhasta polusta (PID 5860) | avoin (käyttäjä päätti 13.10.2026 jättää ennalleen: ei uudelleenkäynnistystä) | ei toimenpidettä — cron käynnistää uudesta polusta kaatumisen tai bootin jälkeen, ja uusi koodi (12 sanan nimiraja) tulee silloin voimaan (kirjattu 13.10.2026). |
| [scopes testit] iOS-äpin uusi versio (12 sanan nimiraja, UI-testien uudet nimet) | avoin; odottaa konetta mac | UI-testit simulaattorissa (`bash scopes/ios/testi.sh`) ja asennus `bash scopes/ios/asenna.sh` Macilla; leima `[scopes testit]` (kirjattu 13.10.2026). |
| scopes-juurella on kohdekartan rivi mutta ei omaa GitHub-repoa (kirjattu 13.10.2026) | avoin; odottaa skooppia claude siirto | siirra-skooppi.sh pakkauksessa (claude siirron asia, V-262). |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/HISTORIA.md`, ei lueta purussa.
