# Mittaukset — tehtävät

`tehtavat.jsonl`: yksi rivi per toteuttaja-ajo (SUUNNITELMA.md luku 7). Valvoja kirjoittaa rivin task-notificationin `<usage>`-lohkosta heti Acceptance-ajon jälkeen.

```json
{"pvm":"2026-10-20T10:00:00Z","T":"T-16-G","paketti":"ARK-04","skooppi":"scopes2 ydin","malli":"sonnet","ajo":1,"tokenit":123456,"kesto_ms":1800000,"tyokalukutsut":42,"tulos":"vihreä","portti":"bash scopes2/ydin/gate.sh --itsetesti","exit":0,"worktree":false,"huom":""}
```

- `tulos` ∈ vihreä | punainen | eskaloitu | keskeytetty; `ajo` 1–3 (sääntö 5).
- `usd` lisätään, kun `claude subagents` -skoopin SUBAGENTS-HINTA on valmis.
- Pilotit T-16-G (Sonnet), T-17 (Opus) ja P-1 (Haiku) saavat `huom: "pilotti"` (scopes-V2, K-9 19.10.2026).
