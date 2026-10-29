# scopes/infra/REKISTERI.md

Tilanne: 15.10.2026

SEURAAVA PAKETTI: SCOPES-KONTEKSTI-LADATUT-KAYTTOON (V-400) — tuotannossa 15.10.2026 (:8787 uudelleen, äppi asennettu 14.13); jäljellä todennus puhelimessa käyttäjän kanssa (Infra › scopes infra › Konteksti: Järjestelmäkehote, Purun runko ym.); samalla paikallisen istunnon uusi testi (Pura → Istunnon malli → Qwen3 Coder 30B) — polut: scopes/palvelu/lahteet.mjs, scopes/ios/Sources/Nakymat.swift, scopes/ios/Sources/Malli.swift — aloitus: /pura scopes infra

## Tarkoitus ja raja

Infra-välilehti ja skooppidata: Infra.swift, Nakymat.swift, Malli.swift ja palvelun lahteet.mjs (skooppipuu, rekisterin jäsennys, istuntojen konteksti)

## Päätökset

- **Käyttäjä 15.10.2026:** palvelimen root-komennot annetaan käyttäjälle muodossa `ssh palvelin-root '<komento>'` (root-avain, ei sudoa; polut absoluuttisina, `~` = `/root`), ei `ssh -t palvelin "sudo …"` (pääreskisteri Sudo-rivi).

- **Käyttäjä 15.10.2026:** lms-health hyväksyy minkä tahansa ladatun LLM:n ja lataa 9B:n vain, kun mitään ei ole ladattu (lähde `Infra/linux/lms-health.sh`).

- **Käyttäjä 13.10.2026:** skooppi `scopes infra` luotiin jakamalla `scopes` ominaisuuksittain (luo-skooppi.mjs `scopes infra`.

- **13.10.2026:** Käyttäjä 13.10.2026: seuraava paketti = puhelinkäyttöönotto (SCOPES-INFRA-KONTEKSTI-PUHELIN).

- **13.10.2026:** Konteksti olemassa olevaan skooppivastaukseen, ei uutta reittiä (ei muutoksia scopes yhteys -tiedostoihin). Hylätty: erillinen /konteksti-reitti (koskisi palvelin.mjs ja Asiakas.swift).

- **13.10.2026:** Viitetiedosto luetaan repon lähteestä `Infra/skills/...`, ei asennetusta `~/.claude/skills`.

- **13.10.2026:** Käyttäjä 13.10.2026: :8787 uudelleenkäynnistys ja asennus nyt (lupa annettu juuri ennen ajoa, TYOTAVAT 22).

- **13.10.2026:** Käyttäjä 13.10.2026: kontekstinäkymän otsikko = skoopin nimi.

- **13.10.2026:** Käyttäjä 13.10.2026: ei seuraavaa pakettia (infran 952 kt vastauksen pienennys hylättiin, lataus nopea).

- **13.10.2026:** Käyttäjä 13.10.2026: pakkaus käsin ilman vaihetta 2 (aja-siirtaja.sh paketoi), koska ideat-sulku.mjs --pyyhi sulkisi avoimen V-264:n Viat-taulun viiterivin perusteella (V-277). Kunnes V-277 on korjattu, tämän skoopin pakkaus kirjataan käsin tai sulku perutaan heti.

- **14.10.2026:** Käyttäjä 14.10.2026: asennus committatusta koodista ilman tunnelityötä.

- **14.10.2026:** Käyttäjä 14.10.2026: ei seuraavaa pakettia (valinta "Ei seuraavaa (suositus)"); V-300 ja V-312 korjataan scopes viat -skoopissa.

- **14.10.2026:** Käyttäjä 14.10.2026: pääskoopit omina kortteinaan (cdaa4cc8).

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti = SCOPES-INFRA-JARJESTYS (valinta "Infran järjestys (suositus)").

- **14.10.2026:** Järjestys tallennetaan paikallisesti (@AppStorage), ei palvelimelle — patchin ratkaisu, käyttäjä ei ole linjannut erikseen.

- **14.10.2026:** Kortti = yksi listarivi + .onMove (rekisterin ehdottama vaihtoehto 1); hylätty .draggable/.dropDestination (patch) ja oma LongPress+DragGesture ScrollView'ssa.

- **14.10.2026:** Juuri.swift (scopes lista) muutettiin, koska paketti ei toimi ilman sitä; omistajalle tiedoksi V-383.

- **14.10.2026:** Käyttäjä 14.10.2026: toteutetaan sekä Infra › Rekisterit (katon täyttöaste) että koon mukainen järjestys skoopin Konteksti-näkymään; 90 %:n kattoilmoitus jätettiin pois.

- **14.10.2026:** Katon mitta toistetaan palvelussa (check-rekisteri.mjs on skripti, ei kirjasto), jotta äpin prosentti ja pakkauksen portti täsmäävät.

- **15.10.2026:** Käyttäjä 15.10.2026: valinta koskee molempia (purkaja + istunnon malli). Istunto on aina Claude Code (autovaihto.sh claude --remote-control), joten agy ja paikalliset ovat vain purkajia; hylätty: agy/opencode-istunto tmuxiin (iso työ).

- **15.10.2026:** Turvamalli säilyy: puhelin lähettää vain tunnuksen, joka on palvelun oman listan jäsen.

- **15.10.2026:** Käyttäjä 15.10.2026: Infra-sivulle nappi, joka käynnistää palvelimen, ja nappi, joka sammuttaa sen (uusi paketti SCOPES-LINUX-NAPIT).

- **15.10.2026:** Käyttäjä 15.10.2026: kyselykorttiin aina tarvittavat ohjeet ja komennot itse kysymystekstiin (puhelin piilottaa proosan); kirjattu muistiin every-wait-has-a-return-path.

- **15.10.2026:** Tila pingin TTL:stä eikä ssh:sta (host key -sudenkuoppa, osa-4-laitteet.md Sudenkuopat).

- **15.10.2026:** Sammutusnappi koskee vain palvelinta: Windowsia ei sammuteta tästä (409).

- **15.10.2026:** Kuiva tila palvelun env-lippuna, jotta UI-koe voi painaa oikeaa nappia ilman PC:n sammutusta.

- **15.10.2026:** Toiminnon jälkeen äppi näyttää vastauksen tilan (sammuu/vaihtaa), ei lue tilaa heti uudelleen (ping vastaa vielä hetken sammutuksen jälkeen); vetäminen alas päivittää.

- **15.10.2026:** V-399: valittiin IDEAT-rivin vaihtoehto "pois kontekstiluvusta" (ei erillistä "ei ladata" -ryhmää), jotta muutos on vain palvelussa eikä vaadi äpin asennusta; kattosivu näyttää HISTORIA/ARKISTO edelleen.

- **15.10.2026:** Käyttäjä 15.10.2026 (sanatarkasti): "Ei nyt" — tuotannon :8787-uudelleenkäynnistys ja asenna.sh lykätty; V-400 jää kuivatestin tasolle.

- **15.10.2026:** Ladatut osat näytetään vain uusimmasta elävästä istunnosta (ei vanhoja transkripteja: kaikkien skannaus kallis); ryhmät ovat samassa `ryhmat`-taulukossa kuin tiedostot, joten vanha äppi dekoodaa ne (näyttää lajin raakana).

- **15.10.2026:** Käyttäjä 15.10.2026 (AskUserQuestion): "Tee molemmat" = testaa coder-30b, korjaa Qwen3.5-pohja vain jos coder kaatuu samaan → coder ei kaatunut, pohjaa ei muutettu.

- **15.10.2026:** Paikallinen istunto ilman Remote Controlia, näkyy vain Scopes-äpin skoopin viesteissä (tmux + transkripti); ANTHROPIC_AUTH_TOKEN=lmstudio, jotta claude.ai-OAuth-tokenia ei lähetetä LM Studioon.

- **15.10.2026:** Käyttäjä 15.10.2026: lms-health hyväksyy minkä tahansa ladatun LLM:n, 9B vain kun mitään ei ole ladattu (kirjattu rekisterin Päätöksiin commitissa 25d57351).

- **15.10.2026:** Käyttäjä 15.10.2026 (sanatarkasti): "minulle annettavat linux ssh komennot tehdään ssh palvelin-root muodossa. korjaa tieto rekisteriin mistä sait komennon" — kirjattu paarekisterin Sudo-riville, LM Link ufw -rivin komento samaan muotoon, skoopin Päätöksiin ja muistiin (25d57351).

- **15.10.2026:** Käyttäjä 15.10.2026: "Kyllä, molemmat nyt" — :8787 uudelleen ja asenna.sh sekä e8308d51:lle että b966c099:lle.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| V-284 | korjattu 935e2eeb (scopes viat -rekisteri: "V-284 korjattu 935e2eeb, rivit poistettu"; IDEAT-tila päivittämättä) | ei ajettavaa tässä skoopissa |
| V-335 | tiedoksi kuitattu 14.10.2026: AsetuksetView-jako (b20bfdaa) ei vaadi Infra-muutosta; IDEAT-tila päivittämättä | ei ajettavaa tässä skoopissa |
| V-339 | tiedoksi kuitattu 14.10.2026: V-284 korjattu 935e2eeb (lahteet.mjs pakattu()); IDEAT-tila päivittämättä | ei ajettavaa tässä skoopissa |
| V-342 | tiedoksi kuitattu 14.10.2026: shell-tila = kasittely (57894fa2); IDEAT-tila päivittämättä | ei ajettavaa tässä skoopissa |
| V-357 | tiedoksi kuitattu 14.10.2026: KontekstiMerkki-väri (fca71a49), ei käytösmuutosta; IDEAT-tila päivittämättä | ei ajettavaa tässä skoopissa |
| Paikallinen purkaja oikeaa mallia vastaan | avoin; odottaa konetta palvelin **15.10.2026:** LM Studio -loki: coder-30b latautui 14.23 (98304 kontekstia, parallel 4, 18.63 GB) kahden CUDA-muistikaatuneen latausyrityksen jälkeen; mallin vuoro kesti 3–5 min ~49 k tokenin syötteellä. | kun palvelin vastaa: aja-siirtaja.sh pura "scopes infra --ajaja=paikallinen:<id>" ja katso ARVIO |
| V-400 (IDEAT, kohde scopes infra) | kesken (koodi b966c099, kuivatesti ok 15.10.2026; tuotannossa 15.10.2026: :8787 pid 17299, äppi asennettu 14.13); odottaa käyttäjää | kontekstiluetteloon oikeasti ladatut osat (järjestelmäkehote, CLAUDE.md+MEMORY.md, listat, purun runko, muistutukset); palvelu lahteet.mjs skoopinKonteksti + Nakymat.swift:489 kontekstinäkymä; tuotanto :8787 uudelleen ja asenna.sh tehty käyttäjän luvalla 15.10.2026; todennus puhelimessa: Infra › scopes infra › Konteksti näyttää Järjestelmäkehotteen, Purun rungon ym. |
| V-426 | kesken (asennettu 15.10.2026); odottaa käyttäjää | Testipurku-painikkeen todennus puhelimessa käyttäjän kanssa (V-426:n omistaa ilmoittaja scopes context; tämä skooppi vain asensi). |
| Oikea palvelimen käynnistys/sammutus -koe | avoin; odottaa käyttäjää | vain käyttäjän erillisellä luvalla (sammuttaa PC:n ja LM Studion). |
| SCOPES-PAIKALLINEN-ISTUNTO | kesken (koodi e8308d51, testit vihreät; tuotannossa 15.10.2026; lms-health korjattu 25d57351; käyttäjän testi pysähtyi kertailmoitukseen (V-467), kuitattu); odottaa käyttäjää | lms-health-päätös tehty: lms-health hyväksyy minkä tahansa ladatun LLM:n ja lataa 9B:n vain, jos mikään ei ole ladattu (25d57351); (1) suojaus autovaihto.sh:n paikalliseen reittiin kuuluu claude siirto -skoopille (autovaihto.sh), kirjattu sille vika.sh:lla 15.10.2026; (2) käyttäjän uusi testi puhelimesta: Pura → Istunnon malli → Qwen3 Coder 30B, ensimmäinen viesti vastaa äpin chatissa. |

## Viat

| Vika | Tila |
|---|---|
| V-264 → scopes viat | avoin |
| V-282 → scopes viat | tiedoksi |
| V-291 → scopes viat | tiedoksi |
| V-295 → scopes viat | tiedoksi |
| V-312 → scopes viat | avoin (Infra.swift InfraView lataa vain .taskissa, ei päivity näkymävaihdossa; scopes chat media 09:06 ei näkynyt) |
| V-472 → scopes viat | avoin |
| V-439 → claude siirto | avoin (kesken.mjs ilmoittaa jo palautetun session pakkaamattomaksi, kun käsipakkaus ei kirjoita muistiota (72 h ikkuna); /pura 15.10.2026 exit 6 sessiosta fe6dad04, palautettu 024974ac) |
| V-400 → IDEAT (kohde scopes infra) | kesken; odottaa käyttäjää (korjattu koodissa b966c099, ei vielä käytössä: tuotanto ja asennus odottavat lupaa) |
| V-467 → scopes viat | avoin (paikallinen istunto jää näkymättömästi Claude Coden kertailmoitukseen (Enter to continue) tmuxissa) |

## Historia

Historia: `scopes/infra/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
