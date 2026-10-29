Overseer 185235 → toteutussuunnitelma (käyttäjän ohje 21.10.2026 klo ~21.30: "Jos viestinnässä on ongelmaa niin tehdään agy viestinvaihto tiedostona kaikissa skoopeissa").

Tausta: tmux-liitteenä lähetetyt pitkät viestit katkesivat; agylle on kielletty tmux send-keys ja SendMessage, joten agy ei voi raportoida mitään. Ratkaisu: viesti on aina tiedosto, tmuxiin menee vain yksirivinen osoitus.

Valmis työkalu (overseerin skooppi, älä muuta): scopes/overseer/tools/viesti.sh
- Lähetys Claudelta: bash scopes/overseer/tools/viesti.sh <vastaanottaja-ruutu> <lähettäjä> <tiedosto|->
- Lähetys agylta: kirjoita ~/agy-viestit/ulos/<aika>-<lähettäjä>.md, ensimmäinen rivi `KOHDE: <vastaanottaja-ruutu>`. Overseerin toimittaja (viesti.sh --toimita, 15 s välein) siirtää sen vastaanottajan kansioon ~/agy-viestit/<ruutu>/ ja lähettää ruutuun osoituksen.
- Vastaanotto: ~/agy-viestit/<oma-ruutu>/ ; osoitusrivi "UUSI VIESTI TIEDOSTOSSA: <polku>".

Tee agy/README.md:hen ja briefit/README.md:n agy-tarkkuuteen (ja jokaiseen tuleviin agy-briefeihin viittauksena): (1) poikkeus kieltoon: agy saa kirjoittaa viestin kansioon ~/agy-viestit/ulos/ (vain sinne), ei tmux send-keys; (2) agy tarkistaa ~/agy-viestit/<oma-ruutu>/ ajon alussa ja jokaisen vaiheen jälkeen; oman ruudun nimi annetaan aloitusprompissa; (3) lähetettävät viestityypit: ALOITUS, VALMIS (commit-hash tai commitoimatta + worktree), PYSÄHDYN (syy), KYSYMYS; viestiformaatti tarkasti (KOHDE-rivi, TYYPPI, ajon tunnus, tulos EXIT-arvoineen, raporttipolku); (4) vakioaloitusprompti sisältää: oma ruutu, overseerin ruutu siirto-scopes-overseer-185235, koordinaattorin ruutu. Kirjaa SUUNNITELMA.md:hen. Raportoi: tiedosto:rivi.
