# scopes/overseer/valvoja/REKISTERI.md

Tilanne: 20.10.2026

SEURAAVA PAKETTI: SCOPES2-VALVONTA-MAC — Haiku (--model claude-haiku-5-5): käynnistä scopes kordinaattori (autovaihto), jos se ei ole käynnissä; valvo scopes2-tmux-istuntoja Monitorilla (bash scopes/overseer/valvoja/seuraa-istunnot.sh, uusi 30 min välein); vastaa ruutuihin vain koordinaattorin suosituksella tai suositellulla vaihtoehdolla; automaattisiirto ≥200 k tehtävän päätyttyä (ei kesken ajon); käyttörajan portaat 95/98/99 % hoitaa skripti (95 % ei uusia käynnistyksiä). JUMITILANNE → SendMessage scopes overseerin Opus-istunnolle (ListAgents: Opus, nimessä "scopes overseer" mutta ei "valvoja"; jos ei ole, avaa: autovaihto.sh vaihda "scopes overseer" --model claude-opus-5-5 --ei-sulje): "JUMI: <istunto> — <oire, lokipolku, mitä yritetty>". Jumi = ruutukysymys ilman koordinaattorin suositusta 10 min, sama portti punainen 2×, koordinaattori kuollut tai hiljaa 15 min, istunto kuollut odottamatta, kaikki vapaana >30 min vaikka jonossa on työtä, ympäristövika (tmux, avainnippu, kirjautuminen, hook). Älä ratkaise jumia itse. Tehtävät 1–12: scopes/overseer/valvoja/TEHTAVAT.md (lue purun jälkeen). — polut: scopes/overseer/valvoja/** — aloitus: /pura scopes overseer valvoja

## Tarkoitus ja raja

Haiku-valvoja: seuraa Macin scopes2-tmux-istuntoja, vastaa ruutuihin koordinaattorin suosituksella, tekee automaattisiirrot ja pienet seurantatehtävät, lähettää jumitilanteessa toimintakomennon scopes overseerin Opus-istunnolle

## Päätökset

- **Käyttäjä 20.10.2026:** Haiku-valvojalla oma skooppi (siirto-operaatiot eivät mene ristiin); siirretty skoopista scopes macos valvoja (arkistoitu, scopes/macos/valvoja/REKISTERI.arkistoitu.md). Ongelmanratkaisu kuuluu scopes overseerille (Opus); valvoja seuraa ja reitittää jumit. Yksi valvoja; toinen vasta, jos kasaantuma toistuu.

- **Käyttäjä 20.10.2026:** skooppi `scopes overseer valvoja` luotiin komennolla `/pura uusi scopes overseer valvoja`.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 20.10.2026 | paketti OVERSEER-VALVOJA-MAARITTELY |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/overseer/valvoja/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
