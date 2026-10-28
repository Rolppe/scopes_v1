#!/usr/bin/env node
// scopes/siirto/economy/claude/kulutus.mjs
// ECONOMY-CLAUDE-KULUTUS: kulutusanalyysi Claude Code -istunnoille (yläskoopin kuluttajat.mjs lukee vain AGY:n brain-lokeja).
// Lähde: ~/.claude/projects/<projekti>/<sessio>.jsonl. Työkalunimet kartoitetaan yläskoopin luokkiin (luokitteleKulutusKutsu);
// yksikkö on Clauden: API-pyynnöt ja tokenit (syöte, välimuistiin kirjoitus ja luku, ulostulo), ei AGY-kutsukiintiö.
// Kytkentä palveluun (scopes/palvelu/economy.mjs) ja budjetin raja kuuluvat yläskoopille.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { luokitteleKulutusKutsu, tunnistaKulutusSkooppi } from '../kuluttajat.mjs';
import { luokitteleTaskToiminto } from './task-odotus.mjs';

const TYOKALUKARTTA = {
  Read: 'tiedostoluku',
  NotebookRead: 'tiedostoluku',
  Edit: 'koodimuokkaus',
  Write: 'koodimuokkaus',
  NotebookEdit: 'koodimuokkaus',
  Grep: 'tiedonhaku',
  Glob: 'tiedonhaku',
  Monitor: 'odotus',
  ScheduleWakeup: 'odotus',
  BashOutput: 'odotus_status',
  TaskOutput: 'odotus_status',
};

/**
 * Claude-työkalukutsu ({ name, input }) → yläskoopin kulutusluokka.
 */
export function luokitteleClaudeKutsu(kutsu) {
  const nimi = kutsu?.name ?? '';
  if (nimi in TYOKALUKARTTA) return TYOKALUKARTTA[nimi];
  if (nimi === 'Bash') {
    const t = luokitteleTaskToiminto(kutsu, { moottori: 'claude' });
    if (t.tyyppi === 'pollaussilmukka' || t.tyyppi === 'tuloste_pollaus') return 'odotus_status';
    if (t.tyyppi === 'sleep_odotus') return 'odotus';
    return luokitteleKulutusKutsu(kutsu);
  }
  return 'muu';
}

function onKayttajanSyote(rivi) {
  if (rivi?.type !== 'user' || rivi.isMeta || rivi.isSidechain) return false;
  const c = rivi.message?.content;
  if (typeof c === 'string') return true;
  return Array.isArray(c) && c.some((o) => o?.type === 'text') && !c.some((o) => o?.type === 'tool_result');
}

/**
 * Analysoi yhden Claude-istunnon transkriptin. Transkripti kirjoittaa yhden API-vastauksen sisältölohkot omille riveilleen
 * samalla usage-kentällä, joten tokenit lasketaan kerran per requestId (tai message.id).
 */
export function analysoiClaudeIstunto(transcriptTeksti) {
  let userInputs = 0;
  const pyynnot = new Map();
  const mallit = {};
  const tyokalut = {
    tiedonhaku: 0, tiedostoluku: 0, git_local: 0, git_remote_ssh: 0, remote_ssh: 0, odotus: 0,
    odotus_status: 0, koodimuokkaus: 0, testit: 0, muu_komento: 0, muu: 0,
  };

  for (const r of transcriptTeksti.split('\n')) {
    if (!r) continue;
    let rivi;
    try {
      rivi = JSON.parse(r);
    } catch {
      continue;
    }
    if (onKayttajanSyote(rivi)) userInputs++;
    if (rivi.type !== 'assistant') continue;

    const m = rivi.message ?? {};
    const avain = rivi.requestId ?? m.id ?? rivi.uuid;
    if (avain && !pyynnot.has(avain)) {
      pyynnot.set(avain, m.usage ?? {});
      if (m.model) mallit[m.model] = (mallit[m.model] ?? 0) + 1;
    }
    for (const o of Array.isArray(m.content) ? m.content : []) {
      if (o?.type !== 'tool_use') continue;
      const lk = luokitteleClaudeKutsu(o);
      tyokalut[lk in tyokalut ? lk : 'muu']++;
    }
  }

  const tokenit = { syote: 0, valimuistiKirjoitus: 0, valimuistiLuku: 0, ulostulo: 0 };
  for (const u of pyynnot.values()) {
    tokenit.syote += u.input_tokens ?? 0;
    tokenit.valimuistiKirjoitus += u.cache_creation_input_tokens ?? 0;
    tokenit.valimuistiLuku += u.cache_read_input_tokens ?? 0;
    tokenit.ulostulo += u.output_tokens ?? 0;
  }

  const tyokalujaYhteensa = Object.values(tyokalut).reduce((a, b) => a + b, 0);
  const hukkaKutsut = tyokalut.tiedonhaku + tyokalut.git_local + tyokalut.odotus + tyokalut.odotus_status;

  return {
    moottori: 'claude',
    skooppi: tunnistaKulutusSkooppi(transcriptTeksti),
    userInputs,
    apiPyynnot: pyynnot.size,
    mallit,
    tokenit,
    tyokalujaYhteensa,
    statusPollaus: tyokalut.odotus_status,
    tyokalut,
    hukkaKutsut,
    hukkaOsuus: tyokalujaYhteensa > 0 ? Math.round((hukkaKutsut / tyokalujaYhteensa) * 1000) / 10 : 0,
  };
}

/**
 * Kokoaa projektikansion (oletus kaikki ~/.claude/projects/*) istuntojen kulutuksen skooppeittain.
 */
export function kokoaClaudeKuluttajat({ projektitDir = join(homedir(), '.claude/projects'), projekti = null } = {}) {
  const skooppiKartta = new Map();
  if (!existsSync(projektitDir)) return [];
  const kansiot = projekti ? [projekti] : readdirSync(projektitDir);

  for (const k of kansiot) {
    const dir = join(projektitDir, k);
    let tiedostot;
    try {
      tiedostot = readdirSync(dir).filter((t) => t.endsWith('.jsonl'));
    } catch {
      continue;
    }
    for (const t of tiedostot) {
      let teksti;
      try {
        teksti = readFileSync(join(dir, t), 'utf8');
      } catch {
        continue;
      }
      const d = analysoiClaudeIstunto(teksti);
      if (d.apiPyynnot < 1) continue;
      const s = skooppiKartta.get(d.skooppi) ?? { skooppi: d.skooppi, istunnot: 0, apiPyynnot: 0, tyokalujaYhteensa: 0, hukkaKutsut: 0, tokenit: { syote: 0, valimuistiKirjoitus: 0, valimuistiLuku: 0, ulostulo: 0 } };
      s.istunnot++;
      s.apiPyynnot += d.apiPyynnot;
      s.tyokalujaYhteensa += d.tyokalujaYhteensa;
      s.hukkaKutsut += d.hukkaKutsut;
      for (const a of Object.keys(s.tokenit)) s.tokenit[a] += d.tokenit[a];
      skooppiKartta.set(d.skooppi, s);
    }
  }
  return [...skooppiKartta.values()].sort((a, b) => b.apiPyynnot - a.apiPyynnot);
}

async function main(args) {
  const i = args.indexOf('--analysoi');
  if (i >= 0 && args[i + 1]) {
    console.log(JSON.stringify(analysoiClaudeIstunto(readFileSync(resolve(args[i + 1]), 'utf8')), null, 2));
    return;
  }
  const p = args.indexOf('--projekti');
  console.log(JSON.stringify(kokoaClaudeKuluttajat(p >= 0 ? { projekti: args[p + 1] } : {}), null, 2));
}

const onPaaohjelma = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (onPaaohjelma) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`VIRHE kulutus (claude): ${err.message}`);
    process.exit(1);
  });
}
