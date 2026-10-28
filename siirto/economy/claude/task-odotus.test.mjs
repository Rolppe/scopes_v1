// scopes/siirto/economy/claude/task-odotus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as agy from '../task-odotus.mjs';
import {
  MOOTTORIT,
  moottoriKohteesta,
  muotoileTaskOdotusOhje,
  luokitteleTaskToiminto,
  analysoiTaskOdotus,
  analysoiTranskriptiTiedosto,
} from './task-odotus.mjs';

const SKRIPTI = join(dirname(fileURLToPath(import.meta.url)), 'task-odotus.mjs');

test('moottoriKohteesta: claude → claude, neutraali ja muut → agy', () => {
  assert.deepEqual(MOOTTORIT, ['agy', 'claude']);
  assert.equal(moottoriKohteesta('claude'), 'claude');
  assert.equal(moottoriKohteesta('neutraali'), 'agy');
  assert.equal(moottoriKohteesta(undefined), 'agy');
});

test('muotoileTaskOdotusOhje agy: sama kuin yläskoopin sääntö', () => {
  assert.equal(muotoileTaskOdotusOhje({ moottori: 'agy', lyhyt: true }), agy.muotoileTaskOdotusOhje({ lyhyt: true }));
  assert.equal(muotoileTaskOdotusOhje({ moottori: 'agy' }), agy.muotoileTaskOdotusOhje());
  assert.equal(muotoileTaskOdotusOhje({ lyhyt: true }), agy.muotoileTaskOdotusOhje({ lyhyt: true }));
});

test('muotoileTaskOdotusOhje claude: Claude-työkalut, ei AGY-sanastoa', () => {
  for (const lyhyt of [true, false]) {
    const ohje = muotoileTaskOdotusOhje({ moottori: 'claude', lyhyt });
    assert.ok(ohje.includes('ECONOMY-TASK-ODOTUS'));
    assert.ok(ohje.includes('run_in_background'));
    assert.ok(ohje.includes('Monitor'));
    assert.ok(ohje.includes('sleep'));
    for (const agySana of ['run_command', 'WaitMsBeforeAsync', 'manage_task', 'reactive wakeup']) {
      assert.ok(!ohje.includes(agySana), `${agySana} ei kuulu Claude-sääntöön (lyhyt=${lyhyt})`);
    }
  }
});

test('tuntematon moottori heittää', () => {
  assert.throws(() => muotoileTaskOdotusOhje({ moottori: 'gemini' }), /tuntematon moottori/);
  assert.throws(() => luokitteleTaskToiminto({}, { moottori: 'x' }), /tuntematon moottori/);
});

test('luokitteleTaskToiminto agy: yläskoopin luokitus', () => {
  const k = { name: 'manage_task', args: { Action: 'status', TaskId: '1' } };
  assert.deepEqual(luokitteleTaskToiminto(k, { moottori: 'agy' }), agy.luokitteleTaskToiminto(k));
  assert.equal(luokitteleTaskToiminto(k).tyyppi, 'manage_task_status');
});

test('luokitteleTaskToiminto claude: sleep, silmukat ja tulostepollaus kielletty', () => {
  const l = (name, input) => luokitteleTaskToiminto({ name, input }, { moottori: 'claude' });

  assert.equal(l('Bash', { command: 'sleep 30' }).tyyppi, 'sleep_odotus');
  assert.equal(l('Bash', { command: 'npm run build && sleep 5 && cat out.log' }).tyyppi, 'sleep_odotus');
  assert.equal(l('Bash', { command: 'until test -f valmis; do sleep 5; done' }).tyyppi, 'pollaussilmukka');
  assert.equal(l('Bash', { command: 'while pgrep -f gate; do sleep 10; done', run_in_background: true }).tyyppi, 'pollaussilmukka');
  assert.equal(l('Bash', { command: 'tail -20 /private/tmp/claude-501/x/tasks/b1c2.output' }).tyyppi, 'tuloste_pollaus');
  assert.equal(l('BashOutput', { bash_id: 'b1' }).tyyppi, 'tuloste_pollaus');
  assert.equal(l('TaskOutput', { task_id: 'b1' }).sallittu, false);

  // sallitut
  assert.equal(l('Bash', { command: 'bash gate.sh > /tmp/g.log 2>&1', run_in_background: true }).tyyppi, 'bash_tausta');
  assert.equal(l('Bash', { command: 'sleep 60 && ./paikka.sh', run_in_background: true }).sallittu, true);
  assert.equal(l('Bash', { command: 'node --test x.test.mjs' }).tyyppi, 'bash_ok');
  assert.equal(l('Bash', { command: 'grep -n sleep_ms lib.mjs' }).sallittu, true);
  assert.equal(l('Monitor', { command: 'until test -f valmis; do sleep 5; done' }).tyyppi, 'monitor');
  assert.equal(l('Read', { file_path: '/x' }).tyyppi, 'muu');

  // AGY-sääntö ei koske Claudea: Bash ilman WaitMsBeforeAsyncia on ok
  assert.equal(luokitteleTaskToiminto({ name: 'Bash', input: { command: 'ls' } }, { moottori: 'agy' }).tyyppi, 'puuttuva_wait_ms');
  assert.equal(l('Bash', { command: 'ls' }).sallittu, true);
});

test('analysoiTaskOdotus claude: laskee transkriptiriveiltä ja suorista kutsuista', () => {
  const rivit = [
    { type: 'user', message: { content: 'aja testit' } },
    { type: 'assistant', timestamp: '2026-10-28T06:00:00Z', message: { content: [
      { type: 'text', text: 'ajan' },
      { type: 'tool_use', name: 'Bash', input: { command: 'bash gate.sh', run_in_background: true } },
    ] } },
    { type: 'assistant', timestamp: '2026-10-28T06:01:00Z', message: { content: [
      { type: 'tool_use', name: 'Bash', input: { command: 'sleep 20' } },
      { type: 'tool_use', name: 'BashOutput', input: { bash_id: 'b1' } },
    ] } },
    { name: 'Bash', input: { command: 'until grep -q OK log; do sleep 3; done' } },
  ];
  const t = analysoiTaskOdotus(rivit, { moottori: 'claude' });
  assert.equal(t.sleepOdotukset, 1);
  assert.equal(t.tulostePollaukset, 1);
  assert.equal(t.pollaussilmukat, 1);
  assert.equal(t.yhteensaHukkakutsut, 3);
  assert.equal(t.havainnot[0].aikaleima, '2026-10-28T06:01:00Z');
  assert.equal(analysoiTaskOdotus(null, { moottori: 'claude' }).yhteensaHukkakutsut, 0);
});

test('analysoiTaskOdotus agy: yläskoopin tulos', () => {
  const kutsut = [{ name: 'manage_task', args: { Action: 'list' } }];
  assert.deepEqual(analysoiTaskOdotus(kutsut), agy.analysoiTaskOdotus(kutsut));
});

test('analysoiTranskriptiTiedosto claude: lukee jsonl:n', () => {
  const tiedosto = join(mkdtempSync(join(tmpdir(), 'economy-claude-trans-')), 't.jsonl');
  writeFileSync(tiedosto, [
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Bash', input: { command: 'sleep 9' } }] } }),
    'ei json',
    '',
  ].join('\n'));
  assert.equal(analysoiTranskriptiTiedosto(tiedosto, { moottori: 'claude' }).sleepOdotukset, 1);
});

test('CLI: --moottori claude, --lyhyt, --json ja käyttövirhe', () => {
  const lyhyt = execFileSync('node', [SKRIPTI, '--moottori', 'claude', '--lyhyt'], { encoding: 'utf8' });
  assert.equal(lyhyt.trim(), muotoileTaskOdotusOhje({ moottori: 'claude', lyhyt: true }));

  const j = JSON.parse(execFileSync('node', [SKRIPTI, '--json'], { encoding: 'utf8' }));
  assert.equal(j.moottori, 'agy');
  assert.equal(j.lyhyt, agy.muotoileTaskOdotusOhje({ lyhyt: true }));

  assert.equal(spawnSync('node', [SKRIPTI, '--tuntematon']).status, 2);
  assert.equal(spawnSync('node', [SKRIPTI, '--moottori', 'gemini']).status, 1);
});
