// scopes/siirto/economy/task-odotus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  muotoileTaskOdotusOhje,
  luokitteleTaskToiminto,
  analysoiTaskOdotus,
  analysoiTranskriptiTiedosto,
  MINIMI_WAIT_MS,
  SUOSITUS_WAIT_MS,
} from './task-odotus.mjs';

const TAMA = dirname(fileURLToPath(import.meta.url));

test('muotoileTaskOdotusOhje: tuottaa selkeät ohjeet ja säännöt', () => {
  const ohje = muotoileTaskOdotusOhje();
  assert.ok(ohje.includes('ECONOMY-TASK-ODOTUS'));
  assert.ok(ohje.includes('WaitMsBeforeAsync: 10000'));
  assert.ok(ohje.includes('manage_task status'));
  assert.ok(ohje.includes('reactive wakeup'));
  assert.ok(ohje.includes('schedule'));

  const lyhyt = muotoileTaskOdotusOhje({ lyhyt: true });
  assert.ok(lyhyt.includes('ECONOMY-TASK-ODOTUS'));
  assert.ok(lyhyt.includes('WaitMsBeforeAsync: 10000'));
  assert.ok(lyhyt.includes('manage_task status'));
});

test('luokitteleTaskToiminto: tunnistaa sallitut ja kielletyt kutsut', () => {
  // manage_task status ja list ovat kiellettyjä
  const tStatus = luokitteleTaskToiminto({ name: 'manage_task', args: { Action: 'status', TaskId: '123' } });
  assert.equal(tStatus.sallittu, false);
  assert.equal(tStatus.tyyppi, 'manage_task_status');

  const tList = luokitteleTaskToiminto({ name: 'manage_task', args: { Action: 'list' } });
  assert.equal(tList.sallittu, false);
  assert.equal(tList.tyyppi, 'manage_task_status');

  // manage_task kill ja send_input ovat sallittuja hallintatoimia
  const tKill = luokitteleTaskToiminto({ name: 'manage_task', args: { Action: 'kill', TaskId: '123' } });
  assert.equal(tKill.sallittu, true);
  assert.equal(tKill.tyyppi, 'manage_task_hallinta');

  const tInput = luokitteleTaskToiminto({ name: 'manage_task', args: { Action: 'send_input', TaskId: '123', Input: 'y\n' } });
  assert.equal(tInput.sallittu, true);
  assert.equal(tInput.tyyppi, 'manage_task_hallinta');

  // schedule on kielletty odotuskäyttöön
  const tSched = luokitteleTaskToiminto({ name: 'schedule', args: { DurationSeconds: 10 } });
  assert.equal(tSched.sallittu, false);
  assert.equal(tSched.tyyppi, 'schedule_odotus');

  // run_command ilman riittävää viivettä
  const tRunSmall = luokitteleTaskToiminto({ name: 'run_command', args: { CommandLine: 'npm test', WaitMsBeforeAsync: 500 } });
  assert.equal(tRunSmall.sallittu, false);
  assert.equal(tRunSmall.tyyppi, 'pieni_wait_ms');

  const tRunNoWait = luokitteleTaskToiminto({ name: 'run_command', args: { CommandLine: 'npm test' } });
  assert.equal(tRunNoWait.sallittu, false);
  assert.equal(tRunNoWait.tyyppi, 'puuttuva_wait_ms');

  // run_command suositusviiveellä on sallittu
  const tRunOk = luokitteleTaskToiminto({ name: 'run_command', args: { CommandLine: 'npm test', WaitMsBeforeAsync: 10000 } });
  assert.equal(tRunOk.sallittu, true);
  assert.equal(tRunOk.tyyppi, 'run_command_ok');

  // run_command daemonille sallii pienen viiveen
  const tDaemon = luokitteleTaskToiminto({ name: 'run_command', args: { CommandLine: 'node server.js', IsDaemon: true, WaitMsBeforeAsync: 500 } });
  assert.equal(tDaemon.sallittu, true);
  assert.equal(tDaemon.tyyppi, 'run_command_ok');
});

test('analysoiTaskOdotus: laskee status-pollaukset ja turhat kutsut', () => {
  const kutsut = [
    { name: 'run_command', args: { CommandLine: 'cargo test', WaitMsBeforeAsync: 10000 } },
    { name: 'manage_task', args: { Action: 'status', TaskId: 't1' } },
    { name: 'manage_task', args: { Action: 'status', TaskId: 't1' } },
    { name: 'manage_task', args: { Action: 'kill', TaskId: 't1' } },
    { name: 'schedule', args: { DurationSeconds: 5 } },
    { name: 'run_command', args: { CommandLine: 'git status', WaitMsBeforeAsync: 500 } },
  ];

  const tulos = analysoiTaskOdotus(kutsut);
  assert.equal(tulos.statusPollausKerrat, 2);
  assert.equal(tulos.scheduleOdotukset, 1);
  assert.equal(tulos.lyhyetViiveet, 1);
  assert.equal(tulos.yhteensaHukkakutsut, 4);
  assert.equal(tulos.havainnot.length, 4);
});

test('analysoiTranskriptiTiedosto: lukee jsonl-tiedoston ja tunnistaa rikkomukset', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-test-trans-'));
  const tiedosto = join(d, 'transcript.jsonl');

  const rivit = [
    JSON.stringify({ type: 'USER_INPUT', created_at: '2026-10-27T10:00:00Z' }),
    JSON.stringify({
      type: 'PLANNER_RESPONSE',
      created_at: '2026-10-27T10:01:00Z',
      tool_calls: [
        { name: 'run_command', args: { CommandLine: 'bash gate.sh', WaitMsBeforeAsync: 10000 } },
      ],
    }),
    JSON.stringify({
      type: 'PLANNER_RESPONSE',
      created_at: '2026-10-27T10:02:00Z',
      tool_calls: [
        { name: 'manage_task', args: { Action: 'status', TaskId: 'abc' } },
      ],
    }),
  ];
  writeFileSync(tiedosto, rivit.join('\n'));

  const tulos = analysoiTranskriptiTiedosto(tiedosto);
  assert.equal(tulos.statusPollausKerrat, 1);
  assert.equal(tulos.yhteensaHukkakutsut, 1);
});

test('task-odotus.mjs CLI: tulostaa ohjeen ja tukee --json ja --analysoi', () => {
  const skripti = join(TAMA, 'task-odotus.mjs');

  const txt = execFileSync('node', [skripti, '--ohje'], { encoding: 'utf8' });
  assert.ok(txt.includes('ECONOMY-TASK-ODOTUS'));
  assert.ok(txt.includes('WaitMsBeforeAsync: 10000'));

  const jsonOut = execFileSync('node', [skripti, '--json'], { encoding: 'utf8' });
  const parsed = JSON.parse(jsonOut);
  assert.equal(parsed.suositusWaitMs, 10000);
  assert.equal(parsed.minimiWaitMs, 5000);
  assert.ok(parsed.lyhyt.includes('ECONOMY-TASK-ODOTUS'));
});
