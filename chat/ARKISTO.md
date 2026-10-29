# scopes chat — arkisto

Aktiivisesta rekisteristä poistettu tai muutettu tieto sanatarkasti, vanhin ensin (V-082, 28.9.2026).
Tästä ei poisteta mitään. Purku ei lue tätä tiedostoa: se luetaan vain vianselvityksessä, kun
halutaan tietää, mitä rekisterissä on joskus ollut. Kirjoittaja: `claude/siirto/tools/arkisto.mjs`.

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — ainoa avoin rivi (palvelin pois -todennus puhelimessa) odottaa, että palvelin on sammuksissa

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-PAKATTU-TODENNUS — asenna äppi (bash scopes/ios/asenna.sh) ja todenna puhelimessa: pakkaa skooppi äpistä → "Skooppi on pakattu." + Pura → uusi istunto samassa näkymässä; myös automaattisiirto — polut: scopes/palvelu/viestit.mjs, scopes/ios/Sources/Viestit.swift — aloitus: /pura scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Pakattu-näkymä ja Pura samassa näkymässä todentamatta puhelimessa; äppiä (Viestit.swift-teksti) ei asennettu | avoin | CHAT-PAKATTU-TODENNUS (seuraava paketti). |
| Reunatapaus: jos automaattisiirron uusi istunto ei vielä näy skoopin istuntona (ei transkriptia/nimeä) kun vanha on jo pakattu, äppi näyttää hetken Pura-painikkeen ja painallus voisi avata toisen istunnon | avoin | tarkista todennuksessa. |

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — CHAT-PAKATTU-TODENNUS ja kortti-/näppäimistökorjaukset todennettu puhelimessa 13.10.2026; avoimet rivit odottavat tilaisuutta (palvelin sammuksissa, Pura-reunatapaus automaattisiirrossa); käyttäjä valitsi ei seuraavaa

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-NOUSU-TODENNUS — todenna puhelimessa fe509991: keskustelu nousee näppäimistön yläpuolelle syöttökentästä ja vastaus nousee näkyviin kortin lähetyksen jälkeen; simulaattoritesti korttiin (CHAT-KORTTI-SIMU) kirjattu skooppiin scopes testit — polut: scopes/ios/Sources/Viestit.swift — aloitus: /pura scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Syöttökentän nousu ja vastauksen nousu kortin lähetyksen jälkeen (fe509991) | korjattu fe509991 (asennettu, todentamatta); odottaa käyttäjää (todenna viim. 27.10.2026) | todenna puhelimessa. |

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — kysytty 13.10.2026: "Ei seuraavaa pakettia" (kortin jälkeisen vastauksen nousun todennus jää käyttäjää odottavaksi riviksi; syöttökentän nousu valmis f3b1909a)

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — jäljellä vain käyttäjää tai tulevaa tilannetta odottavat rivit (fe509991:n todennus, palvelin pois, automaattisiirron Pura-ikkuna)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| cron-rivi `/srv/work/scopes/palvelu/kaynnista.sh` ei ole olemassa (lokirivi) | valmis 13.10.2026: kertaluonteinen siirtymärivi (scopes-palvelu.loki rivi 14/18, siirto workspace/scopes → scopes); asennettu /etc/cron.d/palvelin:39 ajaa /srv/work/scopes/palvelu/kaynnista.sh, ja sen jälkeiset rivit näyttävät palvelun käynnistyvän | ei toimia. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Skoopin viestinäkymä menee mustaksi (tyhjä) ajoittain skoopin vaihdossa ja uuden viestin jälkeen; käyttäjä havainnut 13.10.2026 kahdesti. | korjattu ae09daa6 (VStack LazyVStackin tilalle; asennettu puhelimeen 22.50); käyttäjä 13.10.2026: "Merkitse korjatuksi. Avaan tapauksen uudelleen jos tulee viellä ongelmia". Simulaattori ei toistanut vikaa (testSkoopinVaihtoEiMustaa läpi vanhalla ja uudella koodilla). |

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-KAYTTORAJA — käyttörajarenkaat skoopin viestinäkymän kolmen pisteen viereen, samankokoinen pyöreä symboli: kaksi sisäkkäistä täyttyvää rengasta, sisempi punainen = Clauden viikkoraja, ulompi keltainen = 5 h raja (käyttäjä 13.10.2026); palvelu tarjoaa rajat (lähde ehkä Infra/hooks/kayttoraja-vahti.py), äppi piirtää — polut: scopes/ios/Sources/Viestit.swift, scopes/palvelu — aloitus: /pura scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Käyttörajarenkaat | avoin (uusi, aloittamatta) | seuraava paketti CHAT-KAYTTORAJA. |

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — kysytty 13.10.2026: ei seuraavaa pakettia (CHAT-KAYTTORAJA tehty 977b5f45 ja asennettu); odottaa käyttäjää: kortin jälkeisen nousun (fe509991) puhelintodennus (renkaat todennettu 13.10.2026)

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Käyttörajarenkaat | korjattu 977b5f45 13.10.2026 (paketti CHAT-KAYTTORAJA toteutettu; asennettu puhelimeen 13.10.2026 23.17); todennettu puhelimessa 13.10.2026 (käyttäjä: renkaat näkyvät oikein; palvelu antoi 5 h 12 %, viikko 55 %); valmis | ei jatkoa. **13.10.2026:** Todettu: käyttörajarenkaiden lähde `/api/oauth/usage` antaa `seven_day` ja `five_hour` (utilization, resets_at mikrosekunnein → palvelu muuntaa ISO-millisekunneiksi, koska iOS ISO8601DateFormatter ei jäsennä 6 desimaalia). Päätepiste vastaa usein 429 (oma koehaku 23.12 ja koeinstanssin ensihaku); Todettu: Infra/hooks/kayttoraja-vahti.py (claude-skooppi) tallentaa välimuistiin (~/.claude/hooks/state/kayttoraja-vahti/kaytto.json) vain five_hour-lukeman; käyttörajarenkaiden viikkoraja haetaan siksi palvelun omalla haulla; Todettu 13.10.2026: toinen istunto (scopes lista) muokkasi samaan aikaan scopes/ios/testi.sh, Juuri.swift ja UITests: testi.sh vaihtui kesken ajon ("rivi 49: odottamaton EOF"), tulos luettiin xcresultista. Asennus käänsi myös sen tallentamattoman Juuri.swiftin (käyttäjä hyväksyi). |

## 13.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-TOIMINNOT-TODENNUS — todenna puhelimessa käyttäjän kanssa skoopin tietonäkymän Automaattisiirto-nappi ja Pidä muisti hereillä -kytkin (17f86a44, asennettu 23.37; koodi scopes infra -poluissa, V-291); todennus kirjoittaa vain tämän skoopin rekisteririvin — polut: scopes/chat/REKISTERI.md — aloitus: /pura scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Automaattisiirto-nappi ja muistin herätyskytkin (17f86a44) | korjattu 17f86a44 13.10.2026 (asennettu 23.37, todentamatta puhelimessa); odottaa käyttäjää (todenna viim. 27.10.2026) | käyttäjä avaa auki olevan skoopin tiedot (kolme pistettä): kytkin näyttää tilan, kääntö → /sa tai /sa pois istuntoon; Automaattisiirto → vahvistus → istunto pakkaa ja vaihtuu. |

## 14.10.2026 — scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Reunatapaus: jos automaattisiirron uusi istunto ei vielä näy skoopin istuntona (ei transkriptia/nimeä) kun vanha on jo pakattu, äppi näyttää hetken Pura-painikkeen ja painallus voisi avata toisen istunnon | avoin, odottaa seuraavaa automaattisiirtoa — **13.10.2026:** koodista (toiminnot.mjs pura + autovaihto.sh): autopackissa vanha istunto on varattu koko autovaihdon ajan → Pura palauttaa 409; uuden session ensimmäinen viesti on argv:ssä, joten /pura on transkriptissa ennen kuin vanha vapautuu; ikkuna kapea, empiirisesti testaamatta. | todenna, jos Pura-painike näkyy automaattisiirron aikana. |
| Automaattisiirto-nappi ja muistin herätyskytkin (17f86a44 + 2213413d) | korjattu 2213413d 13.10.2026 (V-294); todennettu simulaattorissa 14.10.2026 (CHAT-KYTKIN-SIMULAATTORI, 262b55f8; koeistunto scopes testit ac843766): kytkin näytti päällä (testMuistiKytkin läpi); päällä 76 min ilman käyttäjää (sa-tick 9.57 ja 10.09) → seuraava vuoro cache_read 69614 / cache_creation 1037 = muisti säilyi; kytkin pois simulaattorista → /sa pois transkriptissa, kytkin kääntyi 0:aan; pois 65 min → cache_read 28004 (yhteinen järjestelmäosa) / cache_creation 43849 = muisti katosi. Valmis (käyttäjä 14.10.2026: kuittaa valmiiksi; avaa vikaselvityksen itse, jos ongelmia ilmenee). **13.10.2026:** Automaattisiirron jono on palvelun muistissa: palvelun uudelleenkäynnistys tyhjentää sen. | valmis, pois seuraavassa pakkauksessa (CHAT-KYTKIN-SIMULAATTORI läpi 14.10.2026). Automaattisiirtoa ei ajettu kokeessa. **14.10.2026:** puhelinyritys 9.08–9.13: palvelu ei kirjannut kytkintoimintoa, käyttäjä siirsi testin agentille. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| V-294 (scopes viat, c130a95): muistikytkin ei toiminut — (1) palvelu hylkäsi /sa:n varatulle istunnolle (waiting), (2) hereilla() luki vain transkriptiin tallentumatonta tekstiä. | korjattu 2213413d; todennettu simulaattorissa 14.10.2026 (CHAT-KYTKIN-SIMULAATTORI) — valmis |

## 14.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-STOP — stop-nappi chattiin kuten Claude iOS -äpissä (lähetysnappi → stop vastauksen aikana, keskeytys heti, osittainen vastaus jää; skoopin istunto tmux Escape, chat claude -p -prosessin lopetus) — polut: scopes/ios/Sources/Viestit.swift, scopes/palvelu/viestit.mjs — aloitus: /pura scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| CHAT-STOP: chat tarvitsee stop-napin (käyttäjä 14.10.2026: "katso Claude iOS -äpin toteutus") | avoin, SEURAAVA | Toteuta kuten Claude iOS -äpissä: vastauksen aikana lähetysnappi vaihtuu stop-napiksi (täytetty neliö ympyrässä), napautus keskeyttää heti ilman vahvistusta, osittainen vastaus jää näkyviin ja kenttä vapautuu. Palvelu: skoopin istunto → tmux Escape (kuten kortin X, viestit.mjs:384–391); chat (claude -p) → suoratoistoprosessin lopetus. Polut: scopes/ios/Sources/Viestit.swift, scopes/palvelu/viestit.mjs; simulaattoritesti testi.sh:lla. |

## 14.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: CHAT-MALLINIMET — V-330: mallivalikon paikalliset mallit näyttönimin ilman kvantisointi- ja tiedostopäätettä, osio 'Paikalliset' — polut: scopes/palvelu/viestit.mjs, scopes/ios/Sources/Viestit.swift — aloitus: /pura scopes chat

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| CHAT-MALLINIMET (V-330) | avoin, SEURAAVA | mallivalikon paikalliset mallit näyttönimin ilman kvantisointi- ja tiedostopäätettä (esim. qwen3.5-9b-q4_k_m.gguf → Qwen3.5 9B), osion otsikko 'Paikalliset' (DESIGN-KATVEALUEET K9, scopes/design/KATSELMUS.md). Polut: scopes/palvelu/viestit.mjs (paikallisetMallit kuvaus), scopes/ios/Sources/Viestit.swift (mallinValinta). |

## 14.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — odottaa käyttäjää: äpin asennus ja todennus puhelimessa (CHAT-MALLINIMET, CHAT-STOP-JATKA), kortin nousu ja skoopin stop puhelimessa

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Vastauksen nousu kortin lähetyksen tai X-sulun jälkeen (fe509991) | korjattu fe509991 (asennettu, todentamatta); odottaa käyttäjää (todenna viim. 27.10.2026) | todenna puhelimessa, kun kortti tulee vastaan (kortti auki istunnossa). |
| CHAT-MALLINIMET ja CHAT-STOP-JATKA puhelimeen | korjattu cb5c1682, 77a36efc, a1e62a2b; odottaa käyttäjää (todenna viim. 28.10.2026) | asenna äppi (bash scopes/ios/asenna.sh), kun muiden skooppien Sources-muutokset ovat committattu, ja todenna valikko ja play-nappi puhelimessa. |

## 16.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: ei mitään — käyttäjä valitsi pakkaa vain 14.10.2026; odottaa käyttäjää: kortin nousu ja skoopin stop puhelimessa

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Vastauksen nousu kortin lähetyksen tai X-sulun jälkeen (fe509991) | korjattu fe509991 (asennettu 464fbd57:ssä 14.10.2026, todentamatta); odottaa käyttäjää (todenna viim. 27.10.2026) | todenna puhelimessa, kun kortti tulee vastaan (kortti auki istunnossa). |

## 16.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MALLINAPPI — mallinappi ja effort-valinta skoopin viestinäkymän syöttörivillä (Claude/agy/paikalliset mallit istunnon lajin mukaan) — polut: scopes/ios/Sources/Viestit.swift, scopes/palvelu/viestit.mjs — aloitus: lue rekisterin rivi "Mallinappi skoopin viestinäkymän syöttörivillä", kysy agy-istunnon merkitys; Istunto-rakenteen (Malli.swift) ja istunnot()-luvun (lahteet.mjs) laajennus kuuluu skoopille scopes infra: kirjaa sille vika.sh:lla

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Mallinappi skoopin viestinäkymän syöttörivillä (käyttäjä 16.10.2026): + -napin (`LiiteValikko`) viereen valikko; Claude-istunnossa Clauden mallit, agy-istunnossa agy-mallit, paikallisessa paikalliset; effort-taso samaan, jos sellainen on | avoin, kartoitettu 16.10.2026 (aliagentin raportti, väitteet tarkistamatta) **16.10.2026:** Kartoitus (aliagentti, 16.10.2026): `LiiteValikko` kutsutaan `scopes/ios/Sources/Viestit.swift:776-780` (`vasen`-slotti, `nappirivi` piilossa vaakatilassa); chatin oma `mallinValinta` `Viestit.swift:524-540`; Claude-mallit `scopes/palvelu/viestit.mjs:16`, paikalliset `haePaikalliset()` `viestit.mjs:47`, agy `agyMallit()` `scopes/palvelu/purkajat.mjs:21` (`GET /api/purkajat`); effort low\|medium\|high\|xhigh\|max vain `claude/siirto/tools/autovaihto.sh:8`; `Istunto` (`scopes/ios/Sources/Malli.swift:31`) ei kanna lajia/mallia/efforttia; mallin vaihtoa lennossa ei ole; agy-istuntoa ei löydy (agy vain purkaja); paikalliselle ei efforttia. | Aloita Claude-istunnosta: palvelu kertoo istunnon lajin ja nykyisen mallin (transkriptin `message.model`, `perTurnEffort`), vaihtoendpoint (tmux `/model`, `/effort`, ei todennettu); kysy käyttäjältä, mitä agy-istunto tarkoittaa. Kartoitus: kutsupaikka `scopes/ios/Sources/Viestit.swift:776-780` (`vasen`-slotti, `nappirivi` piilossa vaakatilassa); chatin oma `mallinValinta` jo `Viestit.swift:524-540`; luettelot: Claude `MALLIT` `palvelu/viestit.mjs:16`, paikalliset `haePaikalliset()` `viestit.mjs:47`, agy `agyMallit()` `palvelu/purkajat.mjs:21` (`GET /api/purkajat` ryhmät Claude/agy/Paikalliset); effort-arvot low \| medium \| high \| xhigh \| max vain `claude/siirto/tools/autovaihto.sh:8`, ei äpissä eikä palvelussa; `Istunto` (`Malli.swift:31`) ei kanna lajia/mallia/efforttia (`istunnot()` `lahteet.mjs:184`). Puuttuu: istunnon lajin ja nykyisen mallin luku palveluun, vaihtoendpoint (tmux `/model`, `/effort` — ei todennettu), agy-istunto ei löytynyt (agy vain purkaja) — käyttäjältä kysyttävä, mitä agy-istunnolla tarkoitetaan; paikalliselle effort ei löydy. |

### Avoimet asiat — valmis

| Asia | Tila | Seuraava askel |
|---|---|---|
| Muistio settings-pins-are-human-only korjataan (root settings.json on deny-suojattu) | valmis 16.10.2026 (tehty muistiossa pakkauksen jälkeen) | ei jatkotoimia. |

## 16.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MALLINAPPI — mallinappi ja effort-valinta skoopin viestinäkymän syöttörivillä (Claude/agy/paikalliset mallit istunnon lajin mukaan) — polut: scopes/ios/Sources/Viestit.swift, scopes/palvelu/viestit.mjs — aloitus: palvelupuoli valmis (viestit.mjs `vaihdaMalli`, `istunto.malli`/`effort`, reitti /api/skoopit/<nimi>/malli); tee iOS-valikko `LiiteValikko`n viereen Viestit.swift:776-780; Asiakas.swift:n vaihtoendpoint-kutsu kuuluu skoopille scopes yhteys: kirjaa sille vika.sh:lla; älä lähetä `/model`-komentoa ennen istuntokohtaista tapaa (settings.json-kirjoitus, katso rekisterin Viat); kysy agy-istunnon merkitys

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| `/model`-vaihdon istuntokohtainen tapa | avoin | tutki `/model`-valitsin (effortissa `s` = vain tälle istunnolle); testi vaatii luvan, koska luokitin esti sen ja se voi kirjoittaa settings.json:iin. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Claude Coden `/model <id>` tallentaa mallin globaaliksi oletukseksi (~/.claude/settings.json `model`), eikä mikään hook näe kirjoitusta; mallinapin `vaihdaMalli` ei saa lähettää `/model`-komentoa, ennen kuin istuntokohtainen tapa on löytynyt tai käyttäjä hyväksyy kirjoituksen. Todiste: settings.json muokattu 16.10.2026 klo 07.54. | avoin |

## 16.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MALLINAPPI-TODENNUS — palvelun uudelleenkäynnistys, äpin asennus ja mallin ja effortin vaihdon koe (simulaattori koeinstanssia vastaan, sitten oikea istunto) — polut: scopes/palvelu/viestit.mjs, scopes/ios/Sources/MalliValikko.swift, scopes/ios/Sources/Viestit.swift — aloitus: koodi committoitu 3c9b19c7; vaihto kulkee valitsimen s-näppäimellä (ei suoraa /model- tai /effort-komentoa); agy-osuus vasta kun käyttäjä on kertonut agy-istunnon merkityksen

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Mallinappi skoopin viestinäkymän syöttörivillä (käyttäjä 16.10.2026): + -napin (`LiiteValikko`) viereen valikko; Claude-istunnossa Clauden mallit, agy-istunnossa agy-mallit, paikallisessa paikalliset; effort-taso samaan, jos sellainen on | kesken, kartoitettu 16.10.2026 (aliagentin raportti, väitteet tarkistamatta); palvelupuoli tehty 16.10.2026 (iOS-valikko tekemättä) **16.10.2026:** Kartoitus (aliagentti, 16.10.2026): `LiiteValikko` kutsutaan `scopes/ios/Sources/Viestit.swift:776-780` (`vasen`-slotti, `nappirivi` piilossa vaakatilassa); chatin oma `mallinValinta` `Viestit.swift:524-540`; Claude-mallit `scopes/palvelu/viestit.mjs:16`, paikalliset `haePaikalliset()` `viestit.mjs:47`, agy `agyMallit()` `scopes/palvelu/purkajat.mjs:21` (`GET /api/purkajat`); effort low\|medium\|high\|xhigh\|max vain `claude/siirto/tools/autovaihto.sh:8`; `Istunto` (`scopes/ios/Sources/Malli.swift:31`) ei kanna lajia/mallia/efforttia; mallin vaihtoa lennossa ei ole; agy-istuntoa ei löydy (agy vain purkaja); paikalliselle ei efforttia. Palvelupuoli: `scopes/palvelu/viestit.mjs` `EFFORTIT`, `istunnonAsetukset(transkripti)` (viimeisen pääketjun assistant-rivin `message.model` ja `perTurnEffort`, sama lähde kuin autovaihto.sh R7), `skoopinViestit` palauttaa `istunto.malli` ja `istunto.effort`, `vaihdaMalli(nimi, {malli, effort})` lähettää tmux-ruutuun `/model` ja `/effort`; `scopes/palvelu/palvelin.mjs` reitti `POST /api/skoopit/<nimi>/malli {malli?, effort?}`; kaksi uutta testiä `viestit.test.mjs`. **16.10.2026 todennus:** koeinstanssi :8788 uudella koodilla (istunto.malli ja effort sekä `POST …/malli` vastaavat; vanha :8787 antoi 404) ja simulaattorikoe `MalliUITests` (uusi, `SCOPES_KOE_MALLI`-läpiviennit `testi.sh`:ssa) todensi lepotilan: nappi näkyy tekstillä "Sonnet 5.5 · high" ja on pois käytöstä työn aikana (kuva tarkistettu). Tuotanto :8787 käynnistetty uudelleen käyttäjän luvalla 08.50 (pid 6444 → 7568), `/malli` 400 tyhjällä rungolla; asenna.sh exit 0 08.51 (profiili 22.10.2026 asti). **Todentamatta:** tmux-vaihto oikeassa istunnossa (`/model`, `/effort` + `s`): tarvitsee vapaan istunnon; taustaskripti (odota idle, effort medium → high tälle istunnolle) estettiin luokittelijalla 16.10.2026, joten vaihto kokeillaan äpin napilla, kun istunto on vapaa. | Aloita Claude-istunnosta: iOS-valikko `LiiteValikko`-kutsun (`Viestit.swift:776-780`) viereen; Claude-mallit ja effort `SkooppiViestit.istunto`-kentistä (`malli`/`effort`; Malli.swift on scopes infran: katso, riittääkö SkooppiViestit-puolen oma rakenne, `Istunto`-rakenteen ja `istunnot()`-luvun (`lahteet.mjs`) laajennusta ei tarvita); vaihtoendpoint-kutsu Asiakas.swift:iin (scopes yhteys omistaa: kirjaa vika.sh:lla); näytettävä arvo päivittyy vasta istunnon seuraavan vastauksen jälkeen (transkripti). Kysy käyttäjältä, mitä agy-istunto tarkoittaa (agy on vain purkaja), ennen agy-osuutta. Kartoitus: kutsupaikka `scopes/ios/Sources/Viestit.swift:776-780` (`vasen`-slotti, `nappirivi` piilossa vaakatilassa); chatin oma `mallinValinta` jo `Viestit.swift:524-540`; luettelot: Claude `MALLIT` `palvelu/viestit.mjs:16`, paikalliset `haePaikalliset()` `viestit.mjs:47`, agy `agyMallit()` `palvelu/purkajat.mjs:21` (`GET /api/purkajat` ryhmät Claude/agy/Paikalliset); effort-arvot low \| medium \| high \| xhigh \| max vain `claude/siirto/tools/autovaihto.sh:8`; paikalliselle effort ei löydy. |

## 16.10.2026 — scopes chat

### (alku) — poistettu tai muutettu

SEURAAVA PAKETTI: MALLINAPPI-TODENNUS — vaihdon koe oikeassa istunnossa puhelimen napista (käyttäjä napauttaa: effort medium → high skoopissa scopes chat) ja tuloksen kirjaus — polut: scopes/palvelu/viestit.mjs, scopes/ios/Sources/MalliValikko.swift, scopes/ios/Sources/Viestit.swift — aloitus: koodi 3c9b19c7, tuotanto :8787 uusi koodi (pid 7568) ja äppi asennettu 16.10.2026 08.51; vaihto kulkee valitsimen s-näppäimellä; agy-osuus vasta kun käyttäjä on kertonut agy-istunnon merkityksen

### Avoimet asiat — poistettu tai muutettu

| Asia | Tila | Seuraava askel |
|---|---|---|
| Mallinappi skoopin viestinäkymän syöttörivillä (käyttäjä 16.10.2026): + -napin (`LiiteValikko`) viereen valikko; Claude-istunnossa Clauden mallit, agy-istunnossa agy-mallit, paikallisessa paikalliset; effort-taso samaan, jos sellainen on | korjattu 705e7abf 16.10.2026 (kartoitettu 16.10.2026 aliagentin raportilla, väitteet tarkistamatta; palvelupuoli ja iOS-valikko tehty 16.10.2026; tmux-vaihto oikeassa istunnossa todentamatta); odottaa käyttäjää **16.10.2026:** Kartoitus (aliagentti, 16.10.2026): `LiiteValikko` kutsutaan `scopes/ios/Sources/Viestit.swift:776-780` (`vasen`-slotti, `nappirivi` piilossa vaakatilassa); chatin oma `mallinValinta` `Viestit.swift:524-540`; Claude-mallit `scopes/palvelu/viestit.mjs:16`, paikalliset `haePaikalliset()` `viestit.mjs:47`, agy `agyMallit()` `scopes/palvelu/purkajat.mjs:21` (`GET /api/purkajat`); effort low\|medium\|high\|xhigh\|max vain `claude/siirto/tools/autovaihto.sh:8`; `Istunto` (`scopes/ios/Sources/Malli.swift:31`) ei kanna lajia/mallia/efforttia; mallin vaihtoa lennossa ei ole; agy-istuntoa ei löydy (agy vain purkaja); paikalliselle ei efforttia. Palvelupuoli: `scopes/palvelu/viestit.mjs` `EFFORTIT`, `istunnonAsetukset(transkripti)` (viimeisen pääketjun assistant-rivin `message.model` ja `perTurnEffort`, sama lähde kuin autovaihto.sh R7), `skoopinViestit` palauttaa `istunto.malli` ja `istunto.effort`, `vaihdaMalli(nimi, {malli, effort})` lähettää tmux-ruutuun `/model` ja `/effort`; `scopes/palvelu/palvelin.mjs` reitti `POST /api/skoopit/<nimi>/malli {malli?, effort?}`; kaksi uutta testiä `viestit.test.mjs`. **16.10.2026 todennus:** koeinstanssi :8788 uudella koodilla (istunto.malli ja effort sekä `POST …/malli` vastaavat; tyhjä runko 400; vanha :8787 antoi 404) ja simulaattorikoe `MalliUITests` (uusi, `SCOPES_KOE_MALLI`-läpiviennit `testi.sh`:ssa, commit 705e7abf) todensi lepotilan: nappi näkyy tekstillä "Sonnet 5.5 · high" ja on pois käytöstä työn aikana (kuva tarkistettu; tulos Skipped 1, odotettu). Koeinstanssi :8788 pysäytetty (pid 3583). Tuotanto :8787 käynnistetty uudelleen käyttäjän luvalla 08.50 (pid 6444 → 7568), `/malli` 400 tyhjällä rungolla; asenna.sh exit 0 08.51 (profiili 22.10.2026 asti). **Todentamatta:** tmux-vaihto oikeassa istunnossa (`/model`, `/effort` + `s`): tarvitsee vapaan istunnon; taustaskripti (odota idle, effort medium → high tälle istunnolle) estettiin luokittelijalla 16.10.2026, joten vaihto kokeillaan äpin napilla, kun istunto on vapaa. (todenna viim. 30.10.2026) | Puhelimessa skoopin scopes chat nappi "Sonnet 5.5 · high" → effort medium, odota yksi vastaus, palauta high; tarkista, että settings.json-oletus ei muutu; kirjaa tulos. Kysy käyttäjältä, mitä agy-istunto tarkoittaa (agy on vain purkaja), ennen agy-osuutta. Kartoitus: kutsupaikka `scopes/ios/Sources/Viestit.swift:776-780` (`vasen`-slotti, `nappirivi` piilossa vaakatilassa); chatin oma `mallinValinta` jo `Viestit.swift:524-540`; luettelot: Claude `MALLIT` `palvelu/viestit.mjs:16`, paikalliset `haePaikalliset()` `viestit.mjs:47`, agy `agyMallit()` `palvelu/purkajat.mjs:21` (`GET /api/purkajat` ryhmät Claude/agy/Paikalliset); effort-arvot low \| medium \| high \| xhigh \| max vain `claude/siirto/tools/autovaihto.sh:8`; paikalliselle effort ei löydy. |

### Viat — poistettu tai muutettu

| Vika | Tila |
|---|---|
| Claude Coden `/model <id>` tallentaa mallin globaaliksi oletukseksi (~/.claude/settings.json `model`), eikä mikään hook näe kirjoitusta; mallinapin `vaihdaMalli` ei saa lähettää `/model`-komentoa, ennen kuin istuntokohtainen tapa on löytynyt tai käyttäjä hyväksyy kirjoituksen. Korjaus 16.10.2026 (3c9b19c7): `vaihdaMalli` käyttää valitsimen `s`-näppäintä eikä lähetä suoraa komentoa. Todiste: settings.json muokattu 16.10.2026 klo 07.54. | korjattu 3c9b19c7 16.10.2026 (todennus oikeassa istunnossa puuttuu, palvelua ei ole käynnistetty uudelleen); odottaa ajoa (todenna viim. 30.10.2026) |
