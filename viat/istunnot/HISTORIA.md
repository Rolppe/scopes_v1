# scopes viat istunnot — toteutushistoria

## Toteutushistoria

### 28.10.2026 (pakkaus 1)
- Skooppi luotiin (`/pura uusi scopes viat istunnot`, 81b9acea). Käyttäjä määritteli tarkoituksen (Scopes-äpin istuntonäkymän viat) ja vahvisti rajan: viat ja korjausjono ovat tämän skoopin, koodi omistajien. Käyttäjä antoi viat VI-1–VI-5 ja pyysi tekemään kaikki vuorotellen.
- VI-4: `scopes/palvelu/toiminnot.mjs` `sulje` ajaa `tmux kill-pane` ja tarkistaa `tmux list-panes -a`:lla ruudun poistumisen (enintään 20 × 250 ms), muuten 502. Commitit 4d45f4aa ja 61b1b45c. Todennettu äpistä klo 9.36: `scopes viat scene1` sulje 200 (399 ms), ruutu poissa (6c241cb8). Syy: vanha `sulje` kirjoitti ruutuun Escape + `/exit` eikä tarkistanut tulosta; 27.10. klo 5.30 ja 10.54 `infra expresso` sulje 200 kahdesti, välissä `pura` 409.
- VI-4 sivulöydös: `tmux display-message -p -t <puuttuva>` palauttaa exit 0 (koeistunto siirto-vi4koe-123456), siksi tarkistus `list-panes -a`. Oma vika 4d45f4aa:ssa (aina 502, `scopes remoteterminal` klo 9.13) korjattu 61b1b45c.
- VI-2, VI-3, VI-5: `scopes/palvelu/lahteet.mjs` `vakautaTila`: käsittelystä odotukseen vasta 20 s (TILA_VAKAUS_MS) ilman käsittelyä; kysely, käsittely ja pakattu heti; aktiivisen skoopin aika pysyy aktivoitumisen hetkessä. `agy-istunto.mjs` jasennaAgyRuutu: "1. Yes" lupakyselyksi vain 12 alimmalta riviltä. Commit bb1e4221.
- VI-3 toistoyritys: ilmoitus syntyy äpissä yhdestä siirtymästä ei-odottaa → odottaa (`Ilmoitukset.swift:79`, "Istunto odottaa sinua"); palvelimen ilmoitusvahdin loki pysähtynyt 15.10., väärää tapausta ei toistettu lokista.
- VI-1: uusi `scopes/palvelu/mac-claude.mjs` (`ssh dev-host python3 -`, välimuisti 15 s), kytketty `palvelin.mjs` /api/skoopit ja /api/skoopit/<nimi>. Commit ed1249aa. Mitattu: 113 skooppia, Macilla 12–13 elävää Claude-istuntoa, 9 skooppiin, koehaku 748 ms.
- Palvelun testit `node --test scopes/palvelu/*.test.mjs`: 208, 207 läpi, 1 ohitettu, 0 punaista. Palvelu käynnistetty uudelleen kolmesti (kaynnista.sh), ajaa ed1249aa:ta; se ajaa repon puuta (`/srv/work` = `~/palvelin`).
- Omistajille tiedoksi: V-671 (scopes siirto, toiminnot.mjs), V-672 (scopes infra, lahteet.mjs), V-673 (scopes yhteys, palvelin.mjs).
