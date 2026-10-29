// agy:n mallilistan seuranta (AGY-MODELS-SEURANTA 15.10.2026; käyttäjä: "Mallilistan ylläpito").
// Vertaa elävää `agy models` -listaa tilannekuvaan mallit.tsv ja valinnaisesti Scopes-palvelun
// GET /api/purkajat -vastauksen agy-ryhmään, jotta uusi tai poistunut malli näkyy rivinä eikä hiljaisena muutoksena.
//
//   node scopes/agy/models/mallit.mjs              vertaa tilannekuvaan
//   node scopes/agy/models/mallit.mjs --palvelu    lisäksi elävä palvelu (avain SCOPES_AVAIN_TIEDOSTO, oletus ~/.config/scopes/avain)
//   node scopes/agy/models/mallit.mjs --paivita    kirjoita elävä lista tilannekuvaksi
//
// Exit: 0 sama, 1 ero (rivit + / - / PALVELU), 2 virhe (agy tai palvelu ei vastannut).

import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { agyMallit } from '../../palvelu/purkajat.mjs';
import { ajaKomento } from '../../palvelu/toiminnot.mjs';

const TILANNEKUVA = fileURLToPath(new URL('./mallit.tsv', import.meta.url));

export const lueTsv = (teksti) => agyMallit(teksti);
export const kirjoitaTsv = (mallit) => mallit.map((m) => `${m.id}\t${m.nimi}\n`).join('');

// Erot rivinä per malli: + uusi, - poistunut, ~ nimi muuttui.
export function vertaa(vanha, uusi) {
  const v = new Map(vanha.map((m) => [m.id, m.nimi]));
  const u = new Map(uusi.map((m) => [m.id, m.nimi]));
  return [
    ...uusi.filter((m) => !v.has(m.id)).map((m) => `+ ${m.id}\t${m.nimi}`),
    ...vanha.filter((m) => !u.has(m.id)).map((m) => `- ${m.id}\t${m.nimi}`),
    ...uusi.filter((m) => v.has(m.id) && v.get(m.id) !== m.nimi).map((m) => `~ ${m.id}\t${v.get(m.id)} → ${m.nimi}`),
  ];
}

// /api/purkajat-vastauksen agy-ryhmä vs elävä lista: palvelun 10 min välimuisti voi olla jäljessä.
export function vertaaPalvelu(purkajat, elava) {
  const p = new Set((purkajat ?? []).filter((x) => x.ryhma === 'agy').map((x) => x.tunnus.replace(/^agy:/, '')));
  const e = new Set(elava.map((m) => m.id));
  return [...[...e].filter((id) => !p.has(id)).map((id) => `PALVELU puuttuu: agy:${id}`),
    ...[...p].filter((id) => !e.has(id)).map((id) => `PALVELU ylimääräinen: agy:${id}`)];
}

async function main(argv) {
  const t = await ajaKomento('agy', ['models'], { aikaraja: 30_000 });
  const elava = t.koodi === 0 ? agyMallit(t.stdout) : [];
  if (!elava.length) { console.log(`MALLIT: virhe — agy models exit ${t.koodi}, ${elava.length} mallia ${t.stderr.trim().slice(0, 200)}`); return 2; }
  if (argv.includes('--paivita')) {
    writeFileSync(TILANNEKUVA, kirjoitaTsv(elava));
    console.log(`MALLIT: tilannekuva päivitetty — ${elava.length} mallia`);
    return 0;
  }
  let vanha = [];
  try { vanha = lueTsv(readFileSync(TILANNEKUVA, 'utf8')); } catch { console.log('MALLIT: tilannekuva puuttuu — aja --paivita'); return 2; }
  const erot = vertaa(vanha, elava);
  if (argv.includes('--palvelu')) {
    const portti = process.env.SCOPES_PORTTI ?? 8787;
    try {
      const avain = readFileSync(process.env.SCOPES_AVAIN_TIEDOSTO ?? join(homedir(), '.config/scopes/avain'), 'utf8').trim();
      const r = await fetch(`http://127.0.0.1:${portti}/api/purkajat`, { headers: { Authorization: `Bearer ${avain}` }, signal: AbortSignal.timeout(40_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      erot.push(...vertaaPalvelu((await r.json()).purkajat, elava));
    } catch (e) { console.log(`MALLIT: virhe — palvelu :${portti} ${e.message}`); return 2; }
  }
  for (const r of erot) console.log(r);
  console.log(erot.length ? `MALLIT: ${erot.length} eroa — tarkista ja aja --paivita` : `MALLIT: ok — ${elava.length} mallia, sama kuin tilannekuva`);
  return erot.length ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
