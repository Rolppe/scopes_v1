// Scopes Economy taustapalvelu (SIIRTO-ECONOMY-SUUNNITELMA 27.10.2026):
// Deterministiset rajapinnat ja apufunktiot AGY-käyttörajojen säästämiseen:
// 1. Git-tilan ja muutoslistan esisyöttö ilman LLM:n git status/log -kutsuja
// 2. Tiedostokartta ja koodi-indeksi skoopeittain ilman LLM:n sokkohakuja (find/grep)
// 3. Kulutuksen analysointi ja tyypittely (USER_INPUT vs. PLANNER_RESPONSE ja työkalut)

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';
import { pacificResetAika } from './agy-kayttoraja.mjs';
import { lueSkoopit } from './lahteet.mjs';
import { ajaKomento } from './toiminnot.mjs';
import {
  muotoileTaskOdotusOhje,
  luokitteleTaskToiminto,
  analysoiTaskOdotus,
  SUOSITUS_WAIT_MS,
  MINIMI_WAIT_MS,
} from '../siirto/economy/task-odotus.mjs';

export {
  muotoileTaskOdotusOhje,
  luokitteleTaskToiminto,
  analysoiTaskOdotus,
  SUOSITUS_WAIT_MS,
  MINIMI_WAIT_MS,
};

const OLETUS_TTL_MS = 5_000;
const OHITETTAVAT_KANSIOT = new Set(['.git', 'node_modules', 'target', '.build', '.gemini', 'dist']);

export function skoopinPolut(skooppi, juuri = process.cwd()) {
  try {
    const kartta = lueSkoopit(juuri);
    if (kartta && kartta[skooppi]) {
      // Rekisteritiedoston hakemisto toimii skoopin perushakemistona
      const rek = kartta[skooppi][0];
      if (rek) {
        const hak = rek.replace(/\/[^/]+$/, '');
        return [hak];
      }
    }
  } catch {}

  // Fallback: korvataan välilyönnit kenoviivoilla scopes/-polussa
  const osat = skooppi.trim().split(/\s+/);
  return [osat.join('/')];
}

export function kuuluukoSkoopille(polku, skooppi, juuri = process.cwd()) {
  const norm = polku.trim().replace(/^\.\//, '');
  const polut = skoopinPolut(skooppi, juuri);
  return polut.some((p) => norm.startsWith(p));
}

let gitCache = null;

export async function haeGitTila({
  juuri = process.cwd(),
  skooppi = null,
  aja = ajaKomento,
  ttlMs = OLETUS_TTL_MS,
  nytMs = Date.now(),
} = {}) {
  if (gitCache && (nytMs - gitCache.aika < ttlMs) && gitCache.juuri === juuri) {
    return suodataSkooppi(gitCache.data, skooppi, juuri);
  }

  const [branchRes, headRes, statusRes] = await Promise.all([
    aja('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: juuri }),
    aja('git', ['log', '-1', '--format=%H%x09%s'], { cwd: juuri }),
    aja('git', ['status', '--porcelain'], { cwd: juuri }),
  ]);

  const branch = branchRes?.koodi === 0 ? branchRes.stdout.trim() : 'tuntematon';
  let headSha = '';
  let headViesti = '';
  if (headRes?.koodi === 0 && headRes.stdout) {
    const [sha, ...rest] = headRes.stdout.trim().split('\t');
    headSha = sha ?? '';
    headViesti = rest.join('\t');
  }

  const muuttuneet = [];
  if (statusRes?.koodi === 0 && statusRes.stdout) {
    const rivit = statusRes.stdout.split('\n');
    for (const r of rivit) {
      if (!r || r.length < 4) continue;
      const tila = r.slice(0, 2).trim();
      const p = r.slice(3).trim().replace(/^"|"$/g, '');
      muuttuneet.push({ tila, polku: p });
    }
  }

  const data = {
    branch,
    headSha,
    headViesti,
    muuttuneet,
    aikaleima: nytMs,
  };

  gitCache = { aika: nytMs, juuri, data };
  return suodataSkooppi(data, skooppi, juuri);
}

function suodataSkooppi(data, skooppi, juuri) {
  if (!skooppi) {
    return {
      branch: data.branch,
      headSha: data.headSha,
      headViesti: data.headViesti,
      puu: data.muuttuneet.length === 0 ? 'puhdas' : 'likainen',
      muuttuneetYhteensa: data.muuttuneet.length,
      muuttuneet: data.muuttuneet,
      aikaleima: data.aikaleima,
    };
  }

  const omat = [];
  const muut = [];
  for (const m of data.muuttuneet) {
    if (kuuluukoSkoopille(m.polku, skooppi, juuri)) {
      omat.push(m);
    } else {
      muut.push(m);
    }
  }

  return {
    branch: data.branch,
    headSha: data.headSha,
    headViesti: data.headViesti,
    puu: omat.length === 0 ? 'puhdas' : 'likainen',
    muuttuneetYhteensa: data.muuttuneet.length,
    skoopinMuutokset: omat,
    muutMuutokset: muut,
    aikaleima: data.aikaleima,
  };
}

export function muotoileGitEsitiedot(tila, skooppi = null) {
  if (!tila) return '';
  const omat = tila.skoopinMuutokset ?? (tila.muuttuneet ?? []);
  const muut = tila.muutMuutokset ?? [];
  const puuTila = omat.length === 0 ? 'puhdas (0 muutosta skoopin poluissa)' : `likainen (${omat.length} muutosta skoopin poluissa)`;

  const rivit = [
    '## Git-esitiedot',
    '',
    'GIT-TILA (deterministinen esisyöttö — älä aja git status / git log / git diff):',
    `- Haara: ${tila.branch || 'tuntematon'}${tila.headSha ? ` (HEAD ${tila.headSha.slice(0, 8)} ${tila.headViesti || ''})` : ''}`,
    `- Skoopin puu: ${puuTila}`,
  ];

  if (omat.length > 0) {
    rivit.push('- Skoopin muuttuneet tiedostot:');
    for (const m of omat) {
      rivit.push(`  ${m.tila} ${m.polku}`);
    }
  }

  if (muut.length > 0) {
    rivit.push(`- Muutokset toisissa skoopeissa: ${muut.length} kpl (jaettu työklooni — Sääntö 15 & V-KORD-5: älä koske, älä committaa)`);
  }

  rivit.push('- Pysyvä ohje: Git-tila on annettu valmiina yllä. Älä tee git status-, git log- tai git diff -kutsuja vain tilanteen tarkistamiseksi.');
  return rivit.join('\n');
}

export function haeTiedostokartta({
  juuri = process.cwd(),
  skooppi,
  maxSyvyys = 6,
  maxTiedostot = 500,
} = {}) {
  if (!skooppi) return { virhe: 'skooppi puuttuu' };

  const peruspolut = skoopinPolut(skooppi, juuri);
  const tiedostot = [];
  let yhteensaKoko = 0;

  function skannaa(hakemisto, syvyys) {
    if (syvyys > maxSyvyys || tiedostot.length >= maxTiedostot) return;
    let lapset;
    try {
      lapset = readdirSync(hakemisto, { withFileTypes: true });
    } catch {
      return;
    }

    for (const lapsi of lapset) {
      if (lapsi.name.startsWith('.') && lapsi.name !== '.agents') continue;
      if (OHITETTAVAT_KANSIOT.has(lapsi.name)) continue;

      const kokoPolku = join(hakemisto, lapsi.name);
      const relPolku = relative(juuri, kokoPolku);

      if (lapsi.isDirectory()) {
        skannaa(kokoPolku, syvyys + 1);
      } else if (lapsi.isFile()) {
        try {
          const st = statSync(kokoPolku);
          tiedostot.push({
            polku: relPolku,
            koko: st.size,
            mtime: st.mtimeMs,
          });
          yhteensaKoko += st.size;
        } catch {}
      }
    }
  }

  for (const p of peruspolut) {
    const koko = join(juuri, p);
    if (existsSync(koko)) {
      try {
        const st = statSync(koko);
        if (st.isDirectory()) {
          skannaa(koko, 1);
        } else if (st.isFile()) {
          tiedostot.push({
            polku: p,
            koko: st.size,
            mtime: st.mtimeMs,
          });
          yhteensaKoko += st.size;
        }
      } catch {}
    }
  }

  // Järjestetään polun mukaan aakkosjärjestykseen
  tiedostot.sort((a, b) => a.polku.localeCompare(b.polku));

  return {
    skooppi,
    peruspolut,
    tiedostot,
    yhteensaKoko,
    maara: tiedostot.length,
  };
}

let tilastoCache = null;

export function luokitteleTyokalu(kutsu) {
  const nimi = kutsu?.name ?? kutsu?.type ?? '';
  const cmd = kutsu?.args?.CommandLine ?? kutsu?.input?.command ?? '';

  if (nimi === 'read_file' || nimi === 'view_file' || /cat\s+/.test(cmd)) {
    return 'tiedostoluku';
  }
  if (nimi === 'write_file' || nimi === 'edit_file') {
    return 'koodimuokkaus';
  }
  if (nimi === 'manage_task' || nimi === 'schedule' || /sleep\s+/.test(cmd)) {
    return 'odotus';
  }
  if (nimi === 'run_command' || nimi === 'Bash') {
    if (/git\s+/.test(cmd)) return 'git';
    if (/find\s+|grep\s+|ls\s+|locate\s+/.test(cmd)) return 'tiedonhaku';
    if (/test|gate|smoke|cargo test|npm test|node --test/.test(cmd)) return 'testit';
    return 'muu_komento';
  }
  return 'muu';
}

export function laskeKulutusJakauma({
  brainDir = join(homedir(), '.gemini/antigravity-cli/brain'),
  nytMs = Date.now(),
  valiMs = 30_000,
} = {}) {
  if (tilastoCache && (nytMs - tilastoCache.aika < valiMs) && tilastoCache.brainDir === brainDir) {
    return tilastoCache.tulos;
  }

  const { resetAika, seuraavaReset } = pacificResetAika(nytMs);
  let userInputs = 0;
  let plannerResponses = 0;
  let statusPollaus = 0;
  const tyokalut = {
    tiedonhaku: 0,
    tiedostoluku: 0,
    git: 0,
    odotus: 0,
    koodimuokkaus: 0,
    testit: 0,
    muut: 0,
  };

  try {
    const kansiot = readdirSync(brainDir);
    for (const cid of kansiot) {
      const p = join(brainDir, cid, '.system_generated/logs/transcript.jsonl');
      let stat;
      try { stat = statSync(p); } catch { continue; }
      if (stat.mtimeMs < resetAika) continue;

      const sisalto = readFileSync(p, 'utf8');
      const rivit = sisalto.split('\n');
      for (let i = rivit.length - 1; i >= 0; i--) {
        const rivi = rivit[i];
        if (!rivi) continue;
        try {
          const step = JSON.parse(rivi);
          if (!step.created_at) continue;
          const t = new Date(step.created_at).getTime();
          if (t < resetAika) break;

          if (step.type === 'USER_INPUT') {
            userInputs++;
          } else if (step.type === 'PLANNER_RESPONSE') {
            plannerResponses++;
            if (Array.isArray(step.tool_calls)) {
              for (const tk of step.tool_calls) {
                const luokka = luokitteleTyokalu(tk);
                if (luokka in tyokalut) tyokalut[luokka]++;
                else tyokalut.muut++;
                const taskLuokka = luokitteleTaskToiminto(tk);
                if (taskLuokka.tyyppi === 'manage_task_status') {
                  statusPollaus++;
                }
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  const yhteensaTyokalut = Object.values(tyokalut).reduce((a, b) => a + b, 0);
  const osuudet = {};
  for (const [avain, arvo] of Object.entries(tyokalut)) {
    osuudet[avain] = {
      maara: arvo,
      osuus: yhteensaTyokalut > 0 ? Math.round((arvo / yhteensaTyokalut) * 1000) / 10 : 0,
    };
  }

  const tulos = {
    userInputs,
    plannerResponses,
    tyokalutYhteensa: yhteensaTyokalut,
    statusPollausKerrat: statusPollaus,
    kutsut: osuudet,
    nollautuu: seuraavaReset,
    aikaleima: nytMs,
  };

  tilastoCache = { aika: nytMs, brainDir, tulos };
  return tulos;
}

export function luoEconomyPalvelu({
  juuri = process.cwd(),
  brainDir = join(homedir(), '.gemini/antigravity-cli/brain'),
  aja = ajaKomento,
} = {}) {
  return {
    async gitTila(skooppi = null, muoto = null) {
      const t = await haeGitTila({ juuri, skooppi, aja });
      if (muoto === 'teksti') {
        return { ...t, teksti: muotoileGitEsitiedot(t, skooppi) };
      }
      return t;
    },
    muotoileGit(tila, skooppi = null) {
      return muotoileGitEsitiedot(tila, skooppi);
    },
    tiedostokartta(skooppi) {
      return haeTiedostokartta({ juuri, skooppi });
    },
    tilasto() {
      return laskeKulutusJakauma({ brainDir });
    },
    taskOdotus(muoto = null) {
      if (muoto === 'teksti') return { teksti: muotoileTaskOdotusOhje() };
      if (muoto === 'lyhyt') return { teksti: muotoileTaskOdotusOhje({ lyhyt: true }) };
      return {
        suositusWaitMs: SUOSITUS_WAIT_MS,
        minimiWaitMs: MINIMI_WAIT_MS,
        ohje: muotoileTaskOdotusOhje(),
        lyhyt: muotoileTaskOdotusOhje({ lyhyt: true }),
      };
    },
  };
}
