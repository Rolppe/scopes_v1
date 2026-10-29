# scopes/chat/media/REKISTERI.md

Tilanne: 14.10.2026 (CHAT-MEDIA-PUHELIN tehty: äppi 697475dd puhelimessa, neljä liitelähdettä todennettu; liitepolun vika avoin)

SEURAAVA PAKETTI: CHAT-MEDIA-LIITEPOLKU — siirrä liitteiden tallennus (nyt ~/.local/state/scopes-liitteet; vakio palvelimen palvelin.mjs:ssä, omistaja scopes yhteys: muutos sinne vika.sh:lla tai liitteet.mjs:n oma oletus) polkuun, jonka agentti lukee ilman lupakyselyä (työhakemiston alle, esim. projektin gitignoroitu kansio), ja todenna, että Read liitteeseen ei kysy lupaa; korjaa Viat-rivi 14.10.2026 — polut: scopes/palvelu/liitteet.mjs, scopes/chat/media/REKISTERI.md — aloitus: /pura scopes chat media

## Tarkoitus ja raja

Tiedostojen ja kuvien lisäys chattiin iOS-äpin kautta.

Raja: liitteen valinta äpissä, siirto palveluun, tallennus palvelimelle ja välitys Claudelle. Tekstichatin
(Viestit.swift:n syöttö ja renderöinti, viestit.mjs:n claude -p ja tmux-lähetys) omistaa `scopes chat`; tämä
skooppi lisää niihin vain liitekohdat. Mallichat (ChatView, `claude -p --tools ''`) ja paikalliset mallit
ovat myöhempiä paketteja: kuva on vietävä syötteen sisällä, mikä vaatii syötemuodon vaihdon.

## Päätökset

- **Käyttäjä 14.10.2026:** skooppi `scopes chat media` luotiin komennolla `/pura uusi scopes chat media`.
- **Käyttäjä 14.10.2026:** liitteiden lähteet: kuvakirjasto, kamera, Tiedostot ja leikepöytä.
- **Käyttäjä 14.10.2026:** skoopin viestit ensin (palvelu tallentaa tiedoston ja antaa polun istunnolle);
  mallichat myöhemmäksi paketiksi.

- **14.10.2026:** Liitteet välitetään polkuna viestissä (istunto lukee Read-työkalulla), ei tmux-reitin muutosta; kuvat JPEGiksi, koska HEIC ei kelpaa kuvalukuun.

- **14.10.2026:** Käyttäjä 14.10.2026: palvelu ja asennus heti; asennuksen epäonnistuttua "Myöhemmin, pakkaa".

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti CHAT-MEDIA-PUHELIN.

- **14.10.2026:** Käyttäjä 14.10.2026: seuraava paketti CHAT-MEDIA-LIITEPOLKU (suositus), ei CHAT-MEDIA-MALLICHAT.

- **14.10.2026:** Asennus tehtiin HEAD-puusta, ei työpuusta (rekisterin ohjeen mukaisesti).

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Liitteet mallichattiin (ChatView, claude -p) | avoin **14.10.2026:** Liitteet mallichattiin: simulaattorissa (iPhone 15 Pro, SCOPES_KOE_AUKI="scopes chat media") LiitteetUITests Passed; kuvakaappaus näytti liitteen syöttörivin yllä; Kartoitus: mallichat (ChatView) ajaa `claude -p --tools ''` (viestit.mjs:302), syöte stdinissä tekstinä; keskustelu() poimii käyttäjän viesteistä vain text-lohkot (viestit.mjs:112). | oma paketti (CHAT-MEDIA-MALLICHAT liitepolun korjauksen jälkeen): kuva syötteen sisällä, syötemuodon vaihto |
| Liitteiden näkyminen historiassa | avoin (viesti näyttää rivin "Liitteet: <polku>"; keskustelu() poimii vain text-lohkot (viestit.mjs:112)) | myöhemmin |
| Liitteiden siivous (vanhat tiedostot ~/.local/state/scopes-liitteet) | avoin (ei toteutettu) | myöhemmin |
| Polkukartta: liitteet.mjs ja Liitteet.swift luokittuvat skooppiin scopes | avoin; odottaa skooppia scopes | kirjattu scopes-skoopille vika.sh:lla |

## Viat

| Vika | Tila |
|---|---|
| Liitteen avaus jumitti istunnon 3 h 23 min (14.10.2026): liitteet tallentuvat `~/.local/state/scopes-liitteet/`, joka ei ole istunnon työhakemistoissa, joten agentin Read-kutsu kuvaan (transkripti 0f6933ba, 07:34:03Z) jäi odottamaan, todennäköisesti lupakyselyä, jota äppi ei näytä. Kutsu vapautui vasta 10:56:58Z, samalla hetkellä kun äpin viesti "Jäit jumiin" kirjoitettiin tmuxiin (toimintoloki: kesto 10484 ms, "ei näkynyt"). Bash `ls`/`od` samaan hakemistoon ei jumittanut. | avoin. Korjaus: paketti CHAT-MEDIA-LIITEPOLKU — liitepolku sallitulle alueelle (työhakemiston alle tai lisähakemistoksi/Read-sallintaan; settings.json-pinnit vain ihmiselle). Äpin näkymättömästä kyselystä vika skoopille scopes chat (V-382). |

## Historia

Historia: `scopes/chat/media/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
