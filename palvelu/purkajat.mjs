// Purun mallivalinta (SCOPES-PURA-MALLI 15.10.2026; käyttäjä: "varmistusviestin yhteydessä pitää olla malli valinta.
// Tässä pitää olla myös agy ja paikalliset mallit saatavilla claude agenttien lisäksi"). Kaksi valintaa:
//   purkaja — kuka ajaa purkuvaiheen: /pura-argumentin `--ajaja=<moottori>[:<malli>]` (aja-siirtaja.sh) — Claude-mallit
//             claude -p:llä, siirtaja-sonnet-agentti, agy:n mallit (`agy models`) ja palvelimen LM Studio -mallit
//             (vaihesilmukka.mjs:n paikallinen-sovitin); tyhjä = claude/siirto/ajaja.json
//   malli   — uuden Claude Code -istunnon malli (autovaihto.sh --model): Claude-mallit tai palvelimen LM Studio -mallit
//             (palvelin/<id>; käyttäjä 15.10.2026: "Paikalliset mallit pitää saada myös keskustelun ajoon"). Paikallinen
//             istunto ei saa Remote Controlia, joten se näkyy vain äpin skoopin viesteissä.
// Turvamalli (toiminnot.mjs): puhelin lähettää vain tunnuksen, jonka on oltava tämän listan jäsen; muu on 400.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ajaKomento, Hylatty } from './toiminnot.mjs';
import { MALLIT, PAIKALLINEN } from './viestit.mjs';

export const AGENTTI = 'siirtaja-sonnet';
const AGY_TUNNUS = /^[a-z0-9][a-z0-9.-]*$/;
const AGY_VALIMUISTI_MS = 10 * 60_000;

// `agy models` → [{ id, nimi }]; otsikkorivi ("Fetching available models...") ja muut muodot pois.
export function agyMallit(stdout) {
  return String(stdout ?? '').split('\n').map((r) => r.split('\t')).filter(([id, nimi]) => AGY_TUNNUS.test(id ?? '') && nimi?.trim())
    .map(([id, nimi]) => ({ id, nimi: nimi.trim() }));
}

export function luoPurkajat({ juuri, paikalliset = async () => [], aja = ajaKomento } = {}) {
  let agy = { aika: 0, mallit: [] };
  async function haeAgy() {
    if (Date.now() - agy.aika < AGY_VALIMUISTI_MS) return agy.mallit;
    const t = await aja('agy', ['models'], { aikaraja: 20_000 });
    agy = { aika: Date.now(), mallit: t.koodi === 0 ? agyMallit(t.stdout) : [] };
    return agy.mallit;
  }

  function oletus() {
    try {
      const p = JSON.parse(readFileSync(join(juuri, 'claude/siirto/ajaja.json'), 'utf8')).pura ?? {};
      return [p.moottori, p.agentti ?? p.malli].filter(Boolean).join(' ');
    } catch { return 'ajaja.json'; }
  }

  async function lista() {
    const [agyt, kaikki] = await Promise.all([haeAgy(), paikalliset().catch(() => [])]);
    const lms = kaikki.filter((m) => m.tyyppi === 'paikallinen' && m.nimi.startsWith(PAIKALLINEN));
    const purkajat = [
      { tunnus: '', kuvaus: `Oletus (${oletus()})`, ryhma: 'oletus' },
      ...MALLIT.map((m) => ({ tunnus: `claude-cli:${m.nimi}`, kuvaus: m.kuvaus, ryhma: 'Claude' })),
      { tunnus: `claude-agent:${AGENTTI}`, kuvaus: `${AGENTTI}-agentti`, ryhma: 'Claude' },
      ...agyt.map((m) => ({ tunnus: `agy:${m.id}`, kuvaus: m.nimi, ryhma: 'agy' })),
      ...lms.map((m) => ({ tunnus: `paikallinen:${m.nimi.slice(PAIKALLINEN.length)}`, kuvaus: m.kuvaus, ryhma: 'Paikalliset' })),
    ];
    const mallit = [...MALLIT.map(({ nimi, kuvaus }) => ({ nimi, kuvaus, ryhma: 'Claude' })),
      ...lms.map(({ nimi, kuvaus }) => ({ nimi, kuvaus, ryhma: 'Paikalliset' }))];
    return { purkajat, mallit, oletusMalli: 'claude-opus-5-5' };
  }

  // Runko {purkaja?, malli?} → { ajaja, malli }; tyhjä tai puuttuva = oletus (null).
  async function tarkista(runko = {}) {
    const purkaja = runko.purkaja ?? '';
    const malli = runko.malli ?? '';
    if (typeof purkaja !== 'string' || typeof malli !== 'string') throw new Hylatty(400, 'purkaja ja malli ovat merkkijonoja');
    const l = (purkaja || malli) ? await lista() : null;
    if (malli && !l.mallit.some((m) => m.nimi === malli)) throw new Hylatty(400, `tuntematon istunnon malli ${malli.slice(0, 80)}`);
    if (purkaja && !l.purkajat.some((p) => p.tunnus === purkaja)) {
      throw new Hylatty(400, `purkaja ei ole saatavilla: ${purkaja.slice(0, 120)}`);
    }
    return { ajaja: purkaja || null, malli: malli || null };
  }

  return { lista, tarkista };
}
