// Nebius Token Factory -avain äpin syöttökentästä (käyttäjä 18.10.2026: "Tee äppiin syöttökenttä"). Avain tallennetaan
// palvelimen tiedostoon (oletus ~/.config/scopes/nebius-avain, oikeudet 600) eikä sitä palauteta koskaan: tila kertoo vain,
// onko avain annettu ja sen pituuden. Kirjoitus väliaikaistiedoston kautta, jottei puolikas avain jää tiedostoon.
//   GET  /api/nebius-avain             { asetettu, merkkeja }
//   POST /api/nebius-avain {"avain"}   tallentaa → { asetettu: true, merkkeja }; tyhjä tai muotoa rikkova 400

import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { Hylatty } from './toiminnot.mjs';

// Avaimet ovat tulostettavia ASCII-merkkejä ilman välilyöntejä; raja estää tiedoston täyttämisen roskalla.
const MUOTO = /^[\x21-\x7e]{8,512}$/;

export function luoNebiusAvain({ tiedosto }) {
  const tila = () => {
    let avain = '';
    try { avain = readFileSync(tiedosto, 'utf8').trim(); } catch { /* ei avainta */ }
    return { asetettu: avain.length > 0, merkkeja: avain.length };
  };
  const tallenna = (avain) => {
    if (typeof avain !== 'string' || !MUOTO.test(avain.trim())) throw new Hylatty(400, 'avain puuttuu tai sisältää välilyöntejä tai muita kuin ASCII-merkkejä');
    mkdirSync(dirname(tiedosto), { recursive: true, mode: 0o700 });
    const valiaikainen = `${tiedosto}.${process.pid}.uusi`;
    writeFileSync(valiaikainen, avain.trim(), { mode: 0o600 });
    chmodSync(valiaikainen, 0o600);
    renameSync(valiaikainen, tiedosto);
    return tila();
  };
  return { tila, tallenna };
}
