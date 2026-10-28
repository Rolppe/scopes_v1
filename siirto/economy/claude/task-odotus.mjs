#!/usr/bin/env node
// scopes/siirto/economy/claude/task-odotus.mjs
// ECONOMY-CLAUDE-TASKODOTUS: moottorikohtainen tehtäväodotussääntö (ECONOMY-TASK-ODOTUS yleistettynä).
// AGY saa yläskoopin säännön sellaisenaan (scopes/siirto/economy/task-odotus.mjs: run_command `WaitMsBeforeAsync: 10000`,
// ei manage_task status/list -pollausta). Claude Code saa oman: pitkät komennot Bashin run_in_backgroundilla, odotus
// ilmoituksella tai Monitorilla, ei sleep- eikä pollaussilmukoita.
// Kytkentä purkuun (pura-malliton.mjs, moottori purun kohteesta) kuuluu skoopille claude siirto (TYOTAVAT 15).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as agy from '../task-odotus.mjs';

export const MOOTTORIT = ['agy', 'claude'];

/**
 * Purun kohde (pura-malliton.mjs KOHTEET) → moottori. `neutraali` on agy ja paikalliset mallit: ne saavat AGY-säännön
 * kuten ennenkin.
 */
export function moottoriKohteesta(kohde) {
  return kohde === 'claude' ? 'claude' : 'agy';
}

function tarkistaMoottori(moottori) {
  if (!MOOTTORIT.includes(moottori)) throw new Error(`tuntematon moottori: ${moottori} (sallitut: ${MOOTTORIT.join(', ')})`);
}

const CLAUDE_LYHYT = 'Tehtäväodotus (ECONOMY-TASK-ODOTUS): Aja pitkät komennot (testiajot, koonnit, yli ~2 min) Bashin `run_in_background`illa ja odota valmistumisilmoitusta tai seuraa tilaa Monitorilla. Älä aja `sleep`-komentoja äläkä sleep- tai pollaussilmukoita, äläkä lue taustatehtävän tulostetta toistuvasti ennen ilmoitusta.';

function claudeOhje() {
  return [
    '## TEHTÄVÄODOTUS JA TAUSTAKOMENNOT (ECONOMY-TASK-ODOTUS, Claude Code)',
    '',
    'Kutsujen ja kontekstin säästämiseksi noudata seuraavia sääntöjä:',
    '',
    '1. **Pitkät komennot taustalle (`run_in_background: true`)**:',
    '   - Aja testiajot, koonnit ja muut yli ~2 min kestävät komennot Bashin `run_in_background`illa.',
    '   - Lyhyet komennot ajetaan etualalla tavallisesti; taustalle siirto ei ole niille tarpeen.',
    '',
    '2. **Odotus ilmoituksella tai Monitorilla**:',
    '   - Harness herättää istunnon, kun taustakomento päättyy: jatka muuta työtä tai lopeta vuoro.',
    '   - Jos täytyy odottaa ehtoa (tiedosto, loki, prosessin tila), käytä Monitor-työkalua until-ehdolla.',
    '',
    '3. **Ei sleep- eikä pollaussilmukoita**:',
    '   - ÄLÄ aja `sleep`-komentoja etualalla äläkä `while`/`until`-silmukoita, joissa on `sleep`.',
    '   - Älä lue taustatehtävän tulostetiedostoa toistuvasti ennen valmistumisilmoitusta.',
    '   - Älä ajasta lyhyitä herätyksiä (ScheduleWakeup, CronCreate) taustatyön tilan kyselyyn.',
  ].join('\n');
}

/**
 * Muotoilee moottorin tehtäväodotussäännön; agy = yläskoopin sääntö sellaisenaan.
 */
export function muotoileTaskOdotusOhje({ moottori = 'agy', lyhyt = false } = {}) {
  tarkistaMoottori(moottori);
  if (moottori === 'agy') return agy.muotoileTaskOdotusOhje({ lyhyt });
  return lyhyt ? CLAUDE_LYHYT : claudeOhje();
}

// `sleep N` komentona (rivin alussa tai ;, &&, || tai do -sanan jälkeen), ei esim. sleep_ms-nimissä.
const SLEEP = /(^|[;&|]\s*|\bdo\s+|\bthen\s+)sleep\s+\d/m;
const SILMUKKA = /\b(while|until)\b[\s\S]*\bdo\b[\s\S]*\bsleep\s+\d/;
const TULOSTE_LUKU = /^\s*(cat|tail|head|less)\b[^|;&]*\/tasks\/[^\s]+\.output\b/;

/**
 * Luokittelee Claude Code -työkalukutsun ({ name, input }) tehtäväodotuksen näkökulmasta.
 */
function luokitteleClaude(kutsu) {
  const nimi = kutsu?.name ?? '';
  const input = kutsu?.input ?? kutsu?.args ?? {};

  if (nimi === 'Bash') {
    const komento = String(input?.command ?? '');
    const tausta = input?.run_in_background === true;
    if (SILMUKKA.test(komento)) {
      return { tyyppi: 'pollaussilmukka', sallittu: false, tausta, syy: 'Kielletty: sleep- tai pollaussilmukka. Käytä run_in_backgroundia ja odota ilmoitusta, tai Monitoria until-ehdolla.' };
    }
    if (!tausta && SLEEP.test(komento)) {
      return { tyyppi: 'sleep_odotus', sallittu: false, tausta, syy: 'Kielletty: sleep-odotus etualalla. Odota taustakomennon ilmoitusta tai käytä Monitoria.' };
    }
    if (TULOSTE_LUKU.test(komento)) {
      return { tyyppi: 'tuloste_pollaus', sallittu: false, tausta, syy: 'Kielletty: taustatehtävän tulosteen luku ennen ilmoitusta. Odota valmistumisilmoitusta.' };
    }
    return { tyyppi: tausta ? 'bash_tausta' : 'bash_ok', sallittu: true, tausta };
  }

  if (nimi === 'BashOutput' || nimi === 'TaskOutput') {
    return { tyyppi: 'tuloste_pollaus', sallittu: false, syy: `Kielletty: ${nimi}-pollaus. Odota taustakomennon valmistumisilmoitusta.` };
  }

  if (nimi === 'Monitor') return { tyyppi: 'monitor', sallittu: true };

  return { tyyppi: 'muu', sallittu: true };
}

/**
 * Luokittelee työkalukutsun moottorin säännöllä.
 */
export function luokitteleTaskToiminto(kutsu, { moottori = 'agy' } = {}) {
  tarkistaMoottori(moottori);
  return moottori === 'agy' ? agy.luokitteleTaskToiminto(kutsu) : luokitteleClaude(kutsu);
}

// Claude Code -transkriptin rivi (~/.claude/projects/*.jsonl): { type: 'assistant', message: { content: [{ type: 'tool_use', name, input }] } }.
function claudeKutsut(alkio) {
  const sisalto = alkio?.message?.content;
  if (Array.isArray(sisalto)) return sisalto.filter((o) => o?.type === 'tool_use');
  return alkio && typeof alkio === 'object' && 'name' in alkio ? [alkio] : [];
}

/**
 * Analysoi askeleet tai työkalukutsut ja laskee moottorin sääntöjen rikkomukset.
 * agy palauttaa yläskoopin rakenteen; claude { sleepOdotukset, pollaussilmukat, tulostePollaukset, yhteensaHukkakutsut, havainnot }.
 */
export function analysoiTaskOdotus(kutsutTaiAskeleet, { moottori = 'agy' } = {}) {
  tarkistaMoottori(moottori);
  if (moottori === 'agy') return agy.analysoiTaskOdotus(kutsutTaiAskeleet);

  const tulos = { sleepOdotukset: 0, pollaussilmukat: 0, tulostePollaukset: 0, yhteensaHukkakutsut: 0, havainnot: [] };
  if (!Array.isArray(kutsutTaiAskeleet)) return tulos;
  const laskuri = { sleep_odotus: 'sleepOdotukset', pollaussilmukka: 'pollaussilmukat', tuloste_pollaus: 'tulostePollaukset' };

  for (const alkio of kutsutTaiAskeleet) {
    for (const tk of claudeKutsut(alkio)) {
      const luokitus = luokitteleClaude(tk);
      if (luokitus.sallittu) continue;
      tulos[laskuri[luokitus.tyyppi]]++;
      tulos.havainnot.push({ nimi: tk.name, tyyppi: luokitus.tyyppi, syy: luokitus.syy, aikaleima: alkio?.timestamp ?? null });
    }
  }
  tulos.yhteensaHukkakutsut = tulos.sleepOdotukset + tulos.pollaussilmukat + tulos.tulostePollaukset;
  return tulos;
}

/**
 * Lukee transkriptin (jsonl) ja ajaa moottorin analyysin.
 */
export function analysoiTranskriptiTiedosto(polku, { moottori = 'agy' } = {}) {
  const askeleet = [];
  for (const r of readFileSync(polku, 'utf8').split('\n')) {
    if (!r.trim()) continue;
    try {
      askeleet.push(JSON.parse(r));
    } catch {}
  }
  return analysoiTaskOdotus(askeleet, { moottori });
}

async function main(args) {
  let jsonMuoto = false;
  let lyhyt = false;
  let moottori = 'agy';
  let transkriptiPolku = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') jsonMuoto = true;
    else if (a === '--lyhyt') lyhyt = true;
    else if (a === '--ohje') {}
    else if (a === '--moottori' && args[i + 1]) moottori = args[++i];
    else if (a === '--analysoi' && args[i + 1]) transkriptiPolku = args[++i];
    else {
      console.error('Käyttö: node task-odotus.mjs [--moottori agy|claude] [--ohje] [--lyhyt] [--json] [--analysoi <transcript.jsonl>]');
      process.exit(2);
    }
  }
  tarkistaMoottori(moottori);

  if (transkriptiPolku) {
    console.log(JSON.stringify(analysoiTranskriptiTiedosto(resolve(transkriptiPolku), { moottori }), null, 2));
    return;
  }
  if (jsonMuoto) {
    console.log(JSON.stringify({ moottori, ohje: muotoileTaskOdotusOhje({ moottori }), lyhyt: muotoileTaskOdotusOhje({ moottori, lyhyt: true }) }, null, 2));
    return;
  }
  console.log(muotoileTaskOdotusOhje({ moottori, lyhyt }));
}

const onPaaohjelma = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (onPaaohjelma) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`VIRHE task-odotus (claude): ${err.message}`);
    process.exit(1);
  });
}
