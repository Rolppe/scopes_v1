# TASK: Ruutuvahti — seuraa skooppi-istuntoja ja kirjaa jumit

Olet vahti. Et tee mitään muuta kuin alla olevat kohdat. Hälytykset lähetät overseerin istuntoon (tmux-ruutu `siirto-scopes-overseer-185235`) ja kirjaat ne myös tiedostoon `$HOME/agy-raportit/vahti/halytykset.log`.

## Hälytyksen lähetys

Kun alla sanotaan "hälytä", tee kaksi komentoa peräkkäin (älä yhdistä):

1. `tmux send-keys -t siirto-scopes-overseer-185235 'VAHTI-HALYTYS: <ruutu> <tila> <kesto>'`
2. `tmux send-keys -t siirto-scopes-overseer-185235 C-m`

Viesti alkaa aina sanalla `VAHTI-HALYTYS:`. Sen jälkeen lisää sama rivi lokitiedostoon.

## Kielletty

- Älä muokkaa repon tiedostoja. Älä commitoi. Älä tapa prosesseja.
- Älä lähetä `tmux send-keys` -viestejä muualle kuin ruutuun `siirto-scopes-overseer-185235`.
- Älä ajaa muita komentoja kuin kohdissa Hälytyksen lähetys ja Toista mainitut.

## Toista (ikuisesti, kunnes käyttäjä keskeyttää)

1. Aja repon juuressa (`~/sessions-repo`): `bash scopes/overseer/tools/ruutuvahti.sh`
2. Jokaiselle riville, jonka tila on KYSYY tai LAHETTAMATTA: katso, oliko sama ruutu samassa tilassa myös edellisellä kierroksella.
   - Jos oli (kaksi kierrosta peräkkäin, eli yli 5 min): hälytä: `<ruutu> <tila> yli 5 min`
   - Jos ei: älä tee mitään, odota seuraavaa kierrosta.
3. Rivi, jonka tila on TYOSSA ja jonka ruudun viimeinen sisältö (`tmux capture-pane -p -t <ruutu> | tail -3`) on täsmälleen sama kolmella peräkkäisellä kierroksella (yli 15 min): hälytä: `<ruutu> TYOSSA-ei-etene yli 15 min`.
4. Älä kirjaa samaa hälytystä uudelleen, ennen kuin ruutu on välillä ollut tilassa VAPAA tai TYOSSA ja jumittuu uudelleen.
5. Odota 5 minuuttia: `sleep 300`. Palaa kohtaan 1.

Jos tiedostoa tai hakemistoa ei ole: `mkdir -p $HOME/agy-raportit/vahti`.

Ensimmäisellä kierroksella kirjoita tiedostoon rivi `VAHTI KAYNNISTETTY <aika>`.
