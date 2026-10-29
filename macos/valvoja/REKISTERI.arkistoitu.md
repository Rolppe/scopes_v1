# scopes/macos/valvoja/REKISTERI.md

Tilanne: 20.10.2026

SEURAAVA PAKETTI: SCOPES2-VALVONTA-MAC — Haiku (--model claude-haiku-5-5): käynnistä scopes kordinaattori (autovaihto), jos se ei ole käynnissä; valvo scopes2-tmux-istuntoja Monitorilla (bash scopes/macos/valvoja/seuraa-istunnot.sh, uusi 30 min välein); vastaa ruutuihin vain koordinaattorin suosituksella tai suositellulla vaihtoehdolla; automaattisiirto ≥200 k tehtävän päätyttyä (ei kesken ajon); käyttörajan portaat 95/98/99 % hoitaa skripti (95 % ei uusia käynnistyksiä). JUMITILANNE → SendMessage scopes macosin Opus-istunnolle (ListAgents: Opus, nimessä "scopes macos" mutta ei "valvoja"; jos ei ole, avaa: autovaihto.sh vaihda "scopes macos" --model claude-opus-5-5 --ei-sulje): "JUMI: <istunto> — <oire, lokipolku, mitä yritetty>". Jumi = ruutukysymys ilman koordinaattorin suositusta 10 min, sama portti punainen 2×, koordinaattori kuollut tai hiljaa 15 min, istunto kuollut odottamatta, kaikki vapaana >30 min vaikka jonossa on työtä, ympäristövika (tmux, avainnippu, kirjautuminen, hook). Älä ratkaise jumia itse. Tehtävät 1–12: scopes/macos/valvoja/TEHTAVAT.md (lue purun jälkeen). — polut: scopes/macos/valvoja/** — aloitus: /pura scopes macos valvoja

## Tarkoitus ja raja

Haiku-valvoja: seuraa Macin scopes2-tmux-istuntoja, vastaa ruutuihin vain koordinaattorin suosituksella, tekee automaattisiirrot ≥200 k tehtävän päätyttyä ja lähettää jumitilanteessa toimintakomennon scopes macosin Opus-istunnolle

## Päätökset

- **Käyttäjä 20.10.2026:** Haiku-valvojalla on oma skooppi (ei scopes macos), jotta sen ja scopes macosin siirto-operaatiot eivät mene ristiin. Ongelmanratkaisuohjeet pysyvät scopes macosissa (Opus); valvoja vain seuraa ja reitittää jumit.

- **Käyttäjä 20.10.2026:** skooppi `scopes macos valvoja` luotiin komennolla `/pura uusi scopes macos valvoja`.

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Skooppi on vasta luotu | luotu 20.10.2026 | paketti MACOS-VALVOJA-MAARITTELY |

## Viat

| Vika | Tila |
|---|---|

## Historia

Historia: `scopes/macos/valvoja/HISTORIA.md` (syntyy ensimmäisessä pakkauksessa), ei lueta purussa.
