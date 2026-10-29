// Faktalouhija hybridi-pakkausscriptille (Moduuli 1)
// Poimii istunnon, keskusteluhistorian ja git-tilan Flash 3.8 -harkintaa varten.

import { execFileSync, spawnSync } from 'node:child_process';
import { closeSync, existsSync, openSync, readdirSync, readFileSync, readSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { skoopinHakemisto, skoopinRekisteripolku } from './skooppipolku.mjs';

export const AGY_APP_DATA = process.env.ANTIGRAVITY_APP_DATA_DIR || join(homedir(), '.gemini/antigravity-cli');
export const AGY_KESKUSTELUT = join(AGY_APP_DATA, 'conversations');
export const AGY_BRAIN = join(AGY_APP_DATA, 'brain');

/**
 * Louhii git-tilan ja muutokset työtilassa.
 */
export function louhiGit(juuri = process.cwd()) {
  try {
    let haara = '';
    try {
      haara = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      try {
        haara = execFileSync('git', ['branch', '--show-current'], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      } catch {
        haara = '';
      }
    }

    let status = '';
    try {
      status = execFileSync('git', ['status', '--short', '-uall'], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      status = '';
    }

    let diffStat = '';
    try {
      diffStat = execFileSync('git', ['diff', '--stat', 'HEAD'], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      diffStat = '';
    }

    let log = '';
    try {
      log = execFileSync('git', ['log', '--oneline', '-n', '8'], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      log = '';
    }

    // Poimitaan muutetut ja lisätyt tiedostot porcelain-tulosteesta
    const muutetut = [];
    try {
      const statusRaw = execFileSync('git', ['status', '--porcelain=v1', '-uall', '-z'], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const osat = statusRaw.split('\0').filter(Boolean);
      for (let i = 0; i < osat.length; i++) {
        const o = osat[i];
        if (o.length < 4) continue;
        const xy = o.slice(0, 2);
        const polku = o.slice(3);
        if (/[RC]/.test(xy)) i++; // Seuraava osa on vanha polku
        if (!polku || polku.endsWith('/')) continue;
        muutetut.push(polku);
      }
    } catch {}

    return { haara, status, diffStat, log, muutetut };
  } catch (e) {
    return { haara: '', status: '', diffStat: '', log: '', muutetut: [], virhe: e.message };
  }
}

/**
 * Puhdistaa käyttäjän viestistä XML- ja järjestelmämetatagit.
 */
export function siivoaKayttajanTeksti(raaka) {
  if (!raaka) return '';
  return raaka
    .replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/gi, '$1')
    .replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/gi, '')
    .replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/gi, '')
    .replace(/<SYSTEM_MESSAGE>[\s\S]*?<\/SYSTEM_MESSAGE>/gi, '')
    .trim();
}

/**
 * Lukee tiedoston loppupään puskurina (maxKoko tavua, oletus 2 Mt) O(1)-muistinkulutuksella.
 */
export function lueLoppu(polku, maxKoko = 2 * 1024 * 1024) {
  if (!polku || !existsSync(polku)) return '';
  try {
    const koko = statSync(polku).size;
    if (koko === 0) return '';
    const luettava = Math.min(koko, maxKoko);
    const alku = koko - luettava;
    const fd = openSync(polku, 'r');
    try {
      const puskuri = Buffer.alloc(luettava);
      const luettu = readSync(fd, puskuri, 0, luettava, alku);
      return puskuri.toString('utf8', 0, luettu);
    } finally {
      try { closeSync(fd); } catch {}
    }
  } catch {
    return '';
  }
}

/**
 * Louhii viestit Antigravity-transkriptitiedostosta (transcript.jsonl).
 */
export function louhiTranscriptViestit(transcriptPolku, maxViestit = 60) {
  if (!transcriptPolku || !existsSync(transcriptPolku)) return [];
  try {
    const sisalto = lueLoppu(transcriptPolku, 2 * 1024 * 1024);
    const rivit = sisalto.split('\n').filter((l) => l.trim().length > 0);
    const viestit = [];

    for (const r of rivit) {
      try {
        const item = JSON.parse(r);
        if (item.type === 'USER_INPUT' && item.content) {
          const puhdas = siivoaKayttajanTeksti(item.content);
          if (puhdas) {
            viestit.push({ rooli: 'kayttaja', teksti: puhdas.slice(0, 800) });
          }
        } else if (item.type === 'PLANNER_RESPONSE') {
          if (item.content) {
            viestit.push({ rooli: 'agentti', teksti: item.content.slice(0, 1000) });
          } else if (Array.isArray(item.tool_calls) && item.tool_calls.length > 0) {
            const työkalut = item.tool_calls.map((t) => t.name).join(', ');
            viestit.push({ rooli: 'työkalu', teksti: `Kutsuttiin työkaluja: ${työkalut}` });
          }
        }
      } catch {
        // Ohitetaan korruptoitunut tai katkennut rivi
      }
    }
    return viestit.slice(-maxViestit);
  } catch {
    return [];
  }
}

/**
 * Poimii AGY-keskustelun viestit SQLite-kannasta.
 */
export function louhiAgyViestit(dbPolku, maxViestit = 60) {
  if (!dbPolku || !existsSync(dbPolku)) return [];
  let db;
  try {
    db = new DatabaseSync(dbPolku, { readOnly: true });
    const rivit = db.prepare('SELECT idx, step_type, step_payload FROM steps WHERE step_type IN (14, 15) ORDER BY idx DESC LIMIT ?').all(maxViestit * 2).reverse();
    const viestit = [];
    for (const r of rivit) {
      if (r.step_type === 14) {
        // Käyttäjän viesti
        const raw = Buffer.from(r.step_payload).toString('utf8');
        const m = /[\x00-\x1f]*([^\x00-\x08\x0b-\x1f]+)/.exec(raw);
        if (m) {
          const puhdas = siivoaKayttajanTeksti(m[1]);
          if (puhdas) viestit.push({ rooli: 'kayttaja', teksti: puhdas.slice(0, 800) });
        }
      } else if (r.step_type === 15) {
        // Agentin vastaus
        const raw = Buffer.from(r.step_payload).toString('utf8');
        const m = /[\x00-\x1f]*([^\x00-\x08\x0b-\x1f]+)/.exec(raw);
        if (m) viestit.push({ rooli: 'agentti', teksti: m[1].slice(0, 1000) });
      }
    }
    return viestit.slice(-maxViestit);
  } catch {
    return [];
  } finally {
    try { db?.close(); } catch {}
  }
}

/**
 * Poimii tekstistä testiajon tulosrivit (node --test, pytest, XCTest). Muistion testiväite
 * tarvitsee tällaisen rivin lähteekseen (V-560, V-562).
 */
export const TESTITULOS_RE = /^\s*(?:\d+[:-])?\s*(?:#|ℹ)\s+(?:tests|pass|fail)\s+\d+\s*$|^=+ .*\d+ (?:passed|failed).* =+$|Executed \d+ tests?, with \d+ failures?/;

export function louhiTestitodisteet(teksti) {
  if (!teksti) return [];
  return String(teksti).split('\n').map((r) => r.trim()).filter((r) => TESTITULOS_RE.test(r));
}

/**
 * Puhdistaa Claude Code -käyttäjäviestin: slash-komento muotoon "/komento argumentit", järjestelmätagit pois.
 */
export function siivoaClaudeTeksti(raaka) {
  if (!raaka || /^Base directory for this skill:/.test(raaka)) return '';
  const nimi = /<command-name>([\s\S]*?)<\/command-name>/.exec(raaka);
  if (nimi) {
    const arg = /<command-args>([\s\S]*?)<\/command-args>/.exec(raaka);
    return `${nimi[1].trim()} ${arg ? arg[1].trim() : ''}`.trim();
  }
  return siivoaKayttajanTeksti(raaka
    .replace(/<system-reminder[\s\S]*?<\/system-reminder[^>]*>/gi, '')
    .replace(/<local-command-[a-z]+>[\s\S]*?<\/local-command-[a-z]+>/gi, ''));
}

/**
 * Etsii Claude Code -istunnon transkriptin (~/.claude/projects/<projekti>/<id>.jsonl).
 */
export function etsiClaudeTranscript(sessioId, projektit = join(homedir(), '.claude/projects')) {
  if (!sessioId || !/^[A-Za-z0-9-]+$/.test(sessioId) || !existsSync(projektit)) return null;
  try {
    for (const d of readdirSync(projektit)) {
      const polku = join(projektit, d, `${sessioId}.jsonl`);
      if (existsSync(polku)) return polku;
    }
  } catch {}
  return null;
}

// V-652 (28.10.2026): Claude-istunnon työ ja päätökset ovat usein työkalukutsujen sisällä (rekisterin kirjoitus Bashilla,
// Edit), joten pelkkä työkalun nimi ei kerro mallille mitään. Kutsusta otetaan komento tai tiedosto ja alku, tuloksesta alku.
const KUTSU_MERKIT = { Bash: 1200, Edit: 600, Write: 600, muu: 200 };
const TULOS_MERKIT = 400;
const TEKSTI_MERKIT = 2000;

// Pitkän komennon (heredoc, vika.sh-kuvaus) olennainen osa on usein lopussa: alku ja loppu, väli pois.
function alkuJaLoppu(t, max) {
  return t.length <= max ? t : `${t.slice(0, max / 2)} […] ${t.slice(-max / 2)}`;
}

export function tiivistaClaudeKutsu(o) {
  const nimi = o?.name || '?';
  const i = o?.input || {};
  if (nimi === 'Bash') return `Bash: ${alkuJaLoppu(String(i.command || ''), KUTSU_MERKIT.Bash)}`;
  if (nimi === 'Edit') return `Edit ${i.file_path || '?'}: ${String(i.new_string || '').slice(0, KUTSU_MERKIT.Edit)}`;
  if (nimi === 'Write') return `Write ${i.file_path || '?'}: ${String(i.content || '').slice(0, KUTSU_MERKIT.Write)}`;
  const avain = i.file_path || i.pattern || i.description || i.prompt || i.query || i.questions?.[0]?.question || '';
  return `${nimi}${avain ? `: ${String(avain).slice(0, KUTSU_MERKIT.muu)}` : ''}`;
}

/**
 * Louhii viestit, mallin ja testitodisteet Claude Code -transkriptista.
 */
export function louhiClaudeViestit(transcriptPolku, maxViestit = 200) {
  const tulos = { viestit: [], malli: null, testitodisteet: [] };
  if (!transcriptPolku || !existsSync(transcriptPolku)) return tulos;
  const sisalto = lueLoppu(transcriptPolku, 2 * 1024 * 1024);
  for (const r of sisalto.split('\n')) {
    if (!r.trim()) continue;
    let item;
    try { item = JSON.parse(r); } catch { continue; }
    const viesti = item.message;
    if (!viesti || item.isMeta) continue;
    const osat = typeof viesti.content === 'string' ? [{ type: 'text', text: viesti.content }] : (Array.isArray(viesti.content) ? viesti.content : []);
    if (item.type === 'user') {
      for (const o of osat) {
        if (o.type === 'text' && o.text) {
          const puhdas = siivoaClaudeTeksti(o.text);
          if (puhdas) tulos.viestit.push({ rooli: 'kayttaja', teksti: puhdas.slice(0, 800) });
        } else if (o.type === 'tool_result') {
          const teksti = typeof o.content === 'string' ? o.content : (Array.isArray(o.content) ? o.content.map((c) => c.text || '').join('\n') : '');
          tulos.testitodisteet.push(...louhiTestitodisteet(teksti));
          const lyhyt = teksti.trim().slice(0, TULOS_MERKIT);
          if (lyhyt) tulos.viestit.push({ rooli: 'tulos', teksti: lyhyt });
        }
      }
    } else if (item.type === 'assistant') {
      if (viesti.model && !viesti.model.startsWith('<')) tulos.malli = viesti.model;
      const tekstit = osat.filter((o) => o.type === 'text' && o.text).map((o) => o.text);
      if (tekstit.length) tulos.viestit.push({ rooli: 'agentti', teksti: tekstit.join('\n').slice(0, TEKSTI_MERKIT) });
      for (const o of osat) if (o.type === 'tool_use') tulos.viestit.push({ rooli: 'työkalu', teksti: tiivistaClaudeKutsu(o) });
    }
  }
  tulos.viestit = tulos.viestit.slice(-maxViestit);
  return tulos;
}

function agyIstunto(id, malli) {
  const transcript = join(AGY_BRAIN, id, '.system_generated', 'logs', 'transcript.jsonl');
  const db = join(AGY_KESKUSTELUT, `${id}.db`);
  return {
    istuntoId: id,
    malli,
    lahde: 'agy',
    transcriptPolku: existsSync(transcript) ? transcript : null,
    dbPolku: existsSync(db) ? db : null,
  };
}

/**
 * Etsii aktiivisen istunnon transkriptin tai tietokannan.
 * Järjestys: --session-tunniste, agy:n ympäristö, Claude Coden ympäristö. Claude-istunnossa ei
 * arvata uusinta agy-keskustelua: se on toisen istunnon transkripti (V-560, V-562).
 */
export function etsiAktiivinenIstunto({ sessio = null, env = process.env, claudeProjektit } = {}) {
  if (sessio) {
    const agy = agyIstunto(sessio, 'Gemini 3.8 Flash');
    if (agy.transcriptPolku || agy.dbPolku) return agy;
    const claude = etsiClaudeTranscript(sessio, claudeProjektit);
    if (claude) return { istuntoId: sessio, malli: 'Claude', lahde: 'claude', transcriptPolku: claude, dbPolku: null };
    return { istuntoId: sessio, malli: 'ei-tiedossa', lahde: null, transcriptPolku: null, dbPolku: null };
  }

  const envId = env.ANTIGRAVITY_CONVERSATION_ID || null;
  if (envId) return agyIstunto(envId, 'Gemini 3.8 Flash (High)');

  const claudeId = env.CLAUDE_CODE_SESSION_ID || null;
  if (claudeId || env.CLAUDECODE) {
    const claude = etsiClaudeTranscript(claudeId, claudeProjektit);
    return { istuntoId: claudeId, malli: 'Claude', lahde: claude ? 'claude' : null, transcriptPolku: claude, dbPolku: null };
  }

  // agy ilman ympäristömuuttujaa: uusin brain-hakemisto
  try {
    if (existsSync(AGY_BRAIN)) {
      const dirs = readdirSync(AGY_BRAIN)
        .map((d) => ({ id: d, polku: join(AGY_BRAIN, d), mtime: statSync(join(AGY_BRAIN, d)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      for (const d of dirs) {
        if (existsSync(join(d.polku, '.system_generated', 'logs', 'transcript.jsonl'))) {
          return agyIstunto(d.id, 'Gemini 3.8 Flash');
        }
      }
    }
  } catch {
    // Ei löytynyt brain-hakemistoa
  }

  return { istuntoId: null, malli: 'Gemini 3.8 Flash', lahde: null, transcriptPolku: null, dbPolku: null };
}

/**
 * Lukee skoopin nykyisen SEURAAVA PAKETTI -rivin rekisterin HEADista.
 */
export function louhiSeuraavaHead(skooppi, juuri = process.cwd()) {
  if (!skooppi) return null;
  try {
    const skooppiRel = skoopinRekisteripolku(skooppi, juuri) || join(skoopinHakemisto(skooppi, juuri), 'REKISTERI.md');
    const rekisteri = join(juuri, skooppiRel);
    if (!existsSync(rekisteri)) return null;
    let raw = '';
    try {
      raw = execFileSync('git', ['show', `HEAD:${skooppiRel}`], { cwd: juuri, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    } catch {
      // Jos tiedosto ei ole vielä HEADissa (uusi skooppi tai uusi tiedosto), luetaan suoraan työtilasta
      raw = readFileSync(rekisteri, 'utf8');
    }
    for (const r of raw.split('\n')) {
      if (r.startsWith('SEURAAVA PAKETTI:')) return r.trim();
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Hakee kaikki polut ja polkumallit, jotka kuuluvat skoopille.
 */
export function haaSkoopinPolut(skooppi = '', juuri = process.cwd()) {
  const skooppiOsa = skoopinHakemisto(skooppi);
  const polut = [];
  if (skooppiOsa) {
    polut.push(skooppiOsa);
  }
  if (skooppi === 'scopes agy siirto pakkausscripti') {
    polut.push('.agents/skills/pakkaa/SKILL.md');
  }
  if (skooppi === 'scopes macos') {
    polut.push('scopes/shared');
  }

  // Luetaan lisäksi REKISTERI.md:stä Raja: Polut ... jos tiedosto löytyy
  try {
    const rekisteriRel = skoopinRekisteripolku(skooppi, juuri) || (skooppiOsa ? join(skooppiOsa, 'REKISTERI.md') : null);
    if (rekisteriRel) {
      const rekisteriPolku = join(juuri, rekisteriRel);
      if (existsSync(rekisteriPolku)) {
        const sisalto = readFileSync(rekisteriPolku, 'utf8');
        const mRaja = /Raja:\s*Polut\s+([^\n]+?)(?:\.\s|\n|$)/i.exec(sisalto);
        if (mRaja) {
          const osat = mRaja[1].match(/[`'"]?([a-zA-Z0-9_./*-]+)[`'"]?/g) || [];
          for (const osa of osat) {
            const puhdas = osa.replace(/[`'"]/g, '').replace(/\/\*\*$/, '').replace(/\/\*$/, '').trim();
            if (puhdas && !polut.includes(puhdas)) {
              polut.push(puhdas);
            }
          }
        }
      }
    }
  } catch {}

  return polut;
}

/**
 * Jakaa muutetut tiedostot skoopin omiin ja vieraisiin tiedostoihin (Scopes-sääntö 15 & V-008).
 */
export function jaaSkoopinMuutokset(muutetut = [], skooppi = '', juuri = process.cwd()) {
  const skoopinPolut = haaSkoopinPolut(skooppi, juuri);
  const skoopinMuutetut = [];
  const vieraatMuutetut = [];

  for (const m of (muutetut || [])) {
    const kuuluu = skoopinPolut.some((p) => m === p || m.startsWith(`${p}/`));
    if (kuuluu) {
      skoopinMuutetut.push(m);
    } else {
      vieraatMuutetut.push(m);
    }
  }

  return { skoopinMuutetut, vieraatMuutetut };
}

/**
 * Kokoaa kaikki faktat yhdeksi strukturoiduksi syötteeksi.
 */
export async function louhiKaikki({ skooppi, juuri = process.cwd(), dbPolku = null, transcriptPolku = null, sessio = null, env = process.env, claudeProjektit } = {}) {
  const git = louhiGit(juuri);
  const istunto = etsiAktiivinenIstunto({ sessio, env, claudeProjektit });

  const valittuTranscript = transcriptPolku || istunto.transcriptPolku;
  const valittuDb = dbPolku || istunto.dbPolku;

  let viestit = [];
  let testitodisteet = [];
  if (istunto.lahde === 'claude' && !transcriptPolku) {
    const claude = louhiClaudeViestit(valittuTranscript);
    viestit = claude.viestit;
    testitodisteet = claude.testitodisteet;
    if (claude.malli) istunto.malli = claude.malli;
  } else if (valittuTranscript && existsSync(valittuTranscript)) {
    viestit = louhiTranscriptViestit(valittuTranscript);
    testitodisteet = louhiTestitodisteet(lueLoppu(valittuTranscript).replace(/\\n/g, '\n'));
  } else if (valittuDb && existsSync(valittuDb)) {
    viestit = louhiAgyViestit(valittuDb);
  }

  const kayttajanPyynnot = viestit.filter((v) => v.rooli === 'kayttaja').map((v) => v.teksti);
  const viimeinenPyynto = kayttajanPyynnot.length ? kayttajanPyynnot[kayttajanPyynnot.length - 1] : null;

  // Jaetaan muutetut tiedostot skoopin omiin ja muihin (Scopes-sääntö 15 & V-008)
  const { skoopinMuutetut, vieraatMuutetut } = jaaSkoopinMuutokset(git.muutetut, skooppi, juuri);

  const seuraavaHead = louhiSeuraavaHead(skooppi, juuri);

  return {
    skooppi,
    istuntoId: istunto.istuntoId,
    malli: istunto.malli,
    aika: new Date().toISOString(),
    git: {
      ...git,
      skoopinMuutetut,
      vieraatMuutetut,
    },
    istuntoLahde: istunto.lahde,
    viestit,
    testitodisteet,
    kayttajanPyynnot,
    viimeinenPyynto,
    seuraavaHead,
  };
}
