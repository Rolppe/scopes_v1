#!/usr/bin/env node
// scopes/siirto/economy/task-odotus.mjs
// ECONOMY-TASK-ODOTUS: Deterministinen komentoviiveiden optimointi ja manage_task-pollauksen esto
// Estää tarpeettomat status-kyselyt ja asynkronisuusvalumat (säästö ~350–385 kutsua/vrk).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MINIMI_WAIT_MS = 5000;
export const SUOSITUS_WAIT_MS = 10000;

/**
 * Muotoilee säännöt ja ohjeet tehtäväodotukselle ja komentoviiveille.
 */
export function muotoileTaskOdotusOhje({ lyhyt = false } = {}) {
  if (lyhyt) {
    return 'Tehtäväodotus (ECONOMY-TASK-ODOTUS): Käytä run_command-kutsussa aina `WaitMsBeforeAsync: 10000` normaaleille komennoille ja testeille. Älä koskaan pollaa taustatehtäviä (`manage_task status` / `list`), vaan odota reaktiivista herätystä.';
  }

  return [
    '## TEHTÄVÄODOTUS JA KOMENTOVIIVEET (ECONOMY-TASK-ODOTUS)',
    '',
    'Vuorokautisen 1500 kutsun kiintiön säästämiseksi noudata seuraavia deterministisiä sääntöjä:',
    '',
    `1. **Komentoviive (WaitMsBeforeAsync: ${SUOSITUS_WAIT_MS})**:`,
    `   - Aseta \`WaitMsBeforeAsync: ${SUOSITUS_WAIT_MS}\` aina, kun suoritat normaaleja komentoja, hakuja, git-toimintoja tai yksikkö-/gatetestejä.`,
    '   - Tämä takaa, että komento valmistuu synkronisesti samalla vuorolla eikä valu tarpeettomasti taustatehtäväksi.',
    '   - Pientä viivettä (esim. 500 ms) saa käyttää vain pitkäkestoisille demoneille tai taustapalveluille (`IsDaemon: true`).',
    '',
    '2. **Status-pollauksen ehdoton esto (`manage_task status` kielletty)**:',
    '   - ÄLÄ KOSKAAN pollaa taustatehtäviä silmukassa kutsumalla `manage_task` action: "status" tai "list".',
    '   - Älä käytä `schedule`-ajastinta tai `sleep`-komentoja taustatehtävän valmistumisen odotteluun.',
    '   - AGY-ympäristössä on sisäänrakennettu reaktiivinen herätys (**reactive wakeup**): järjestelmä herättää mallin automaattisesti, kun taustaprosessi valmistuu tai kaatuu.',
    '   - Jos komento jää taustatehtäväksi, **lopeta vuoro kutsumatta muita työkaluja** tai jatka toisella riippumattomalla tehtävällä.',
    '',
    '3. **Sallitut tehtävätoiminnot**:',
    '   - `manage_task` action: "kill" on sallittu jumittuneiden tai harhautuneiden prosessien sammuttamiseen.',
    '   - `manage_task` action: "send_input" on sallittu syötteen antamiseen odottavalle prosessille.',
  ].join('\n');
}

/**
 * Luokittelee työkalukutsun tehtäväodotuksen näkökulmasta.
 */
export function luokitteleTaskToiminto(kutsu) {
  const nimi = kutsu?.name ?? kutsu?.type ?? '';
  const args = kutsu?.args ?? kutsu?.input ?? {};

  if (nimi === 'manage_task') {
    const action = args?.Action ?? args?.action ?? '';
    if (action === 'status' || action === 'list') {
      return {
        tyyppi: 'manage_task_status',
        sallittu: false,
        action,
        syy: `Kielletty: taustatehtävää ei saa pollailla manage_task action: "${action}" -kutsulla. Odota reaktiivista herätystä.`,
      };
    }
    if (action === 'kill' || action === 'send_input') {
      return {
        tyyppi: 'manage_task_hallinta',
        sallittu: true,
        action,
        syy: `Sallittu: tehtävän hallinta (${action}).`,
      };
    }
    return {
      tyyppi: 'manage_task_tuntematon',
      sallittu: false,
      action,
      syy: `Tuntematon manage_task-toiminto: ${action}.`,
    };
  }

  if (nimi === 'schedule') {
    return {
      tyyppi: 'schedule_odotus',
      sallittu: false,
      syy: 'Kielletty: schedule-ajastin taustatehtävän odotukseen. Odota järjestelmän reaktiivista herätystä.',
    };
  }

  if (nimi === 'run_command' || nimi === 'Bash') {
    const isDaemon = args?.IsDaemon === true || args?.is_daemon === true;
    const waitMs = args?.WaitMsBeforeAsync ?? args?.wait_ms_before_async;

    if (!isDaemon) {
      if (waitMs === undefined || waitMs === null) {
        return {
          tyyppi: 'puuttuva_wait_ms',
          sallittu: false,
          syy: `Varoitus: WaitMsBeforeAsync puuttuu komennolta. Aseta aina ${SUOSITUS_WAIT_MS} ms.`,
        };
      }
      if (typeof waitMs === 'number' && waitMs < MINIMI_WAIT_MS) {
        return {
          tyyppi: 'pieni_wait_ms',
          sallittu: false,
          waitMs,
          syy: `Kielletty: WaitMsBeforeAsync (${waitMs} ms) on alle minimin (${MINIMI_WAIT_MS} ms). Aseta ${SUOSITUS_WAIT_MS} ms jotta komento ei valu asynkroniseksi.`,
        };
      }
    }

    return {
      tyyppi: 'run_command_ok',
      sallittu: true,
      waitMs,
      isDaemon,
    };
  }

  return {
    tyyppi: 'muu',
    sallittu: true,
  };
}

/**
 * Analysoi askeleet tai työkalukutsut ja laskee status-pollaukset ja viivevirheet.
 */
export function analysoiTaskOdotus(kutsutTaiAskeleet) {
  if (!Array.isArray(kutsutTaiAskeleet)) {
    return {
      statusPollausKerrat: 0,
      lyhyetViiveet: 0,
      scheduleOdotukset: 0,
      yhteensaHukkakutsut: 0,
      havainnot: [],
    };
  }

  let statusPollausKerrat = 0;
  let lyhyetViiveet = 0;
  let scheduleOdotukset = 0;
  const havainnot = [];

  for (const alkio of kutsutTaiAskeleet) {
    // Tue suoraa työkalukutsua tai kokonaista step-objektia
    const toolCalls = Array.isArray(alkio?.tool_calls)
      ? alkio.tool_calls
      : [alkio];

    for (const tk of toolCalls) {
      if (!tk || typeof tk !== 'object') continue;
      const luokitus = luokitteleTaskToiminto(tk);
      if (!luokitus.sallittu) {
        if (luokitus.tyyppi === 'manage_task_status') {
          statusPollausKerrat++;
        } else if (luokitus.tyyppi === 'pieni_wait_ms' || luokitus.tyyppi === 'puuttuva_wait_ms') {
          lyhyetViiveet++;
        } else if (luokitus.tyyppi === 'schedule_odotus') {
          scheduleOdotukset++;
        }

        havainnot.push({
          nimi: tk.name ?? tk.type,
          tyyppi: luokitus.tyyppi,
          syy: luokitus.syy,
          aikaleima: alkio?.created_at ?? null,
        });
      }
    }
  }

  const yhteensaHukkakutsut = statusPollausKerrat + lyhyetViiveet + scheduleOdotukset;

  return {
    statusPollausKerrat,
    lyhyetViiveet,
    scheduleOdotukset,
    yhteensaHukkakutsut,
    havainnot,
  };
}

/**
 * Lukee transkriptin tiedostosta ja ajaa analyysin.
 */
export function analysoiTranskriptiTiedosto(polku) {
  const sisalto = readFileSync(polku, 'utf8');
  const rivit = sisalto.split('\n');
  const askeleet = [];

  for (const r of rivit) {
    if (!r.trim()) continue;
    try {
      const step = JSON.parse(r);
      askeleet.push(step);
    } catch {}
  }

  return analysoiTaskOdotus(askeleet);
}

async function main(args) {
  let jsonMuoto = false;
  let ohje = false;
  let transkriptiPolku = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') jsonMuoto = true;
    else if (a === '--ohje') ohje = true;
    else if (a === '--analysoi' && args[i + 1]) {
      transkriptiPolku = args[++i];
    }
  }

  if (transkriptiPolku) {
    const analyysi = analysoiTranskriptiTiedosto(resolve(transkriptiPolku));
    if (jsonMuoto) {
      console.log(JSON.stringify(analyysi, null, 2));
    } else {
      console.log(`Analyysi: ${transkriptiPolku}`);
      console.log(`- Status-pollauskerrat: ${analyysi.statusPollausKerrat}`);
      console.log(`- Liian lyhyet WaitMs-arvot: ${analyysi.lyhyetViiveet}`);
      console.log(`- Schedule-odotukset: ${analyysi.scheduleOdotukset}`);
      console.log(`- Yhteensä hukkakutsuja: ${analyysi.yhteensaHukkakutsut}`);
      if (analyysi.havainnot.length > 0) {
        console.log('\nHavainnot:');
        for (const h of analyysi.havainnot) {
          console.log(`  * [${h.tyyppi}] ${h.syy}`);
        }
      }
    }
    return;
  }

  if (ohje || args.length === 0 || (jsonMuoto && !transkriptiPolku)) {
    if (jsonMuoto) {
      console.log(JSON.stringify({
        ohje: muotoileTaskOdotusOhje(),
        lyhyt: muotoileTaskOdotusOhje({ lyhyt: true }),
        suositusWaitMs: SUOSITUS_WAIT_MS,
        minimiWaitMs: MINIMI_WAIT_MS,
      }, null, 2));
    } else {
      console.log(muotoileTaskOdotusOhje());
    }
    return;
  }

  console.error('Käyttö: node task-odotus.mjs [--ohje] [--json] [--analysoi <transcript.jsonl>]');
  process.exit(2);
}

const onPaaohjelma = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (onPaaohjelma) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`VIRHE task-odotus: ${err.message}`);
    process.exit(1);
  });
}
