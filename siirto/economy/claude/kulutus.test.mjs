// scopes/siirto/economy/claude/kulutus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { luokitteleClaudeKutsu, analysoiClaudeIstunto, kokoaClaudeKuluttajat, tunnistaClaudeSkooppi } from './kulutus.mjs';

const usage = (i, o) => ({ input_tokens: i, cache_creation_input_tokens: 100, cache_read_input_tokens: 1000, output_tokens: o });
const tool = (name, input) => ({ type: 'tool_use', name, input });

function transkripti() {
  return [
    { type: 'user', message: { content: 'Malliton purku: lue /x/scopes-siirto-git.md ja noudata sitä.' } },
    { type: 'user', isMeta: true, message: { content: 'meta' } },
    // sama requestId kahdella rivillä: tokenit kerran
    { type: 'assistant', requestId: 'r1', message: { model: 'claude-opus-5-5', usage: usage(2, 50), content: [{ type: 'text', text: 'luen' }] } },
    { type: 'assistant', requestId: 'r1', message: { model: 'claude-opus-5-5', usage: usage(2, 50), content: [tool('Read', { file_path: '/a' })] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'x', content: 'ok' }] } },
    { type: 'assistant', requestId: 'r2', message: { model: 'claude-sonnet-5-5', usage: usage(3, 20), content: [
      tool('Bash', { command: 'git status' }),
      tool('Bash', { command: 'sleep 30' }),
      tool('Bash', { command: 'until test -f v; do sleep 2; done' }),
      tool('Grep', { pattern: 'x' }),
      tool('Edit', { file_path: '/a' }),
      tool('Bash', { command: 'node --test a.test.mjs' }),
      tool('TaskOutput', { task_id: 't' }),
      tool('Agent', { prompt: 'p' }),
    ] } },
    { type: 'user', message: { content: [{ type: 'text', text: 'jatka' }] } },
  ].map((r) => JSON.stringify(r)).join('\n') + '\nrikki\n';
}

test('luokitteleClaudeKutsu: Claude-työkalut yläskoopin luokkiin', () => {
  assert.equal(luokitteleClaudeKutsu({ name: 'Read' }), 'tiedostoluku');
  assert.equal(luokitteleClaudeKutsu({ name: 'Write' }), 'koodimuokkaus');
  assert.equal(luokitteleClaudeKutsu({ name: 'Glob' }), 'tiedonhaku');
  assert.equal(luokitteleClaudeKutsu({ name: 'Monitor' }), 'odotus');
  assert.equal(luokitteleClaudeKutsu({ name: 'BashOutput' }), 'odotus_status');
  assert.equal(luokitteleClaudeKutsu({ name: 'Bash', input: { command: 'sleep 5' } }), 'odotus');
  assert.equal(luokitteleClaudeKutsu({ name: 'Bash', input: { command: 'while true; do sleep 1; done' } }), 'odotus_status');
  assert.equal(luokitteleClaudeKutsu({ name: 'Bash', input: { command: 'git log -1' } }), 'git_local');
  assert.equal(luokitteleClaudeKutsu({ name: 'Bash', input: { command: 'ssh palvelin uptime' } }), 'remote_ssh');
  assert.equal(luokitteleClaudeKutsu({ name: 'Agent' }), 'muu');
});

test('analysoiClaudeIstunto: syötteet, pyynnöt, tokenit kerran per requestId ja työkalut', () => {
  const d = analysoiClaudeIstunto(transkripti());
  assert.equal(d.moottori, 'claude');
  assert.equal(d.skooppi, 'scopes siirto git');
  assert.equal(d.userInputs, 2);
  assert.equal(d.apiPyynnot, 2);
  assert.deepEqual(d.mallit, { 'claude-opus-5-5': 1, 'claude-sonnet-5-5': 1 });
  assert.deepEqual(d.tokenit, { syote: 5, valimuistiKirjoitus: 200, valimuistiLuku: 2000, ulostulo: 70 });
  assert.equal(d.tyokalujaYhteensa, 9);
  assert.equal(d.tyokalut.tiedostoluku, 1);
  assert.equal(d.tyokalut.git_local, 1);
  assert.equal(d.tyokalut.odotus, 1);
  assert.equal(d.tyokalut.odotus_status, 2);
  assert.equal(d.tyokalut.tiedonhaku, 1);
  assert.equal(d.tyokalut.koodimuokkaus, 1);
  assert.equal(d.tyokalut.testit, 1);
  assert.equal(d.tyokalut.muu, 1);
  assert.equal(d.statusPollaus, 2);
  // hukka = tehtäväodotussäännön rikkomukset (sleep, until-silmukka, TaskOutput); git status ja Grep eivät ole hukkaa
  assert.equal(d.hukkaKutsut, 3);
  assert.equal(d.hukkaOsuus, 33.3);
});

test('analysoiClaudeIstunto: Monitor ja taustakomento eivät ole hukkaa', () => {
  const rivi = { type: 'assistant', requestId: 'r', message: { usage: usage(1, 1), content: [
    tool('Monitor', { command: 'x' }),
    tool('Bash', { command: 'npm test', run_in_background: true }),
    tool('Glob', { pattern: '*' }),
    tool('BashOutput', { bash_id: 'b' }),
  ] } };
  const d = analysoiClaudeIstunto(JSON.stringify(rivi));
  assert.equal(d.tyokalujaYhteensa, 4);
  assert.equal(d.hukkaKutsut, 1);
});

test('tunnistaClaudeSkooppi: koko nimi SKOOPPI-riviltä tai purkutiedostosta, ei niputusta yläskooppiin', () => {
  const raportti = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: '```\nSKOOPPI: scopes siirto economy claude (annettu argumentissa)\nLÄHDE: x' }] } });
  assert.equal(tunnistaClaudeSkooppi(raportti), 'scopes siirto economy claude');
  assert.equal(tunnistaClaudeSkooppi(JSON.stringify({ text: 'SKOOPPI: claude r&d2\nLÄHDE' })), 'claude r&d2');
  assert.equal(tunnistaClaudeSkooppi('SKOOPPI:`-rivi sanoo x; SKOOPPI: ${skooppi}; SKOOPPI: tuntematon` — ei; SKOOPPI: claude siirto — annettu argumentti'), 'claude siirto');
  assert.equal(tunnistaClaudeSkooppi('Malliton purku: lue /home/m/.local/state/pura/scopes-siirto-economy-claude.md ja noudata sitä.'), 'scopes siirto economy claude');
  assert.equal(tunnistaClaudeSkooppi('polku scopes/siirto/economy/x.mjs'), 'scopes siirto economy');
  assert.equal(tunnistaClaudeSkooppi(''), 'tuntematon');
});

test('analysoiClaudeIstunto: tyhjä transkripti', () => {
  const d = analysoiClaudeIstunto('');
  assert.equal(d.apiPyynnot, 0);
  assert.equal(d.hukkaOsuus, 0);
});

test('kokoaClaudeKuluttajat: kokoaa projektikansiot skooppeittain, ohittaa tyhjät', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'economy-claude-kulutus-'));
  mkdirSync(join(juuri, 'p1'));
  mkdirSync(join(juuri, 'p2'));
  writeFileSync(join(juuri, 'p1', 'a.jsonl'), transkripti());
  writeFileSync(join(juuri, 'p2', 'b.jsonl'), transkripti());
  writeFileSync(join(juuri, 'p2', 'tyhja.jsonl'), '');
  writeFileSync(join(juuri, 'p2', 'muu.txt'), 'x');

  const kaikki = kokoaClaudeKuluttajat({ projektitDir: juuri });
  assert.equal(kaikki.length, 1);
  assert.equal(kaikki[0].skooppi, 'scopes siirto git');
  assert.equal(kaikki[0].istunnot, 2);
  assert.equal(kaikki[0].apiPyynnot, 4);
  assert.equal(kaikki[0].tokenit.ulostulo, 140);

  assert.equal(kokoaClaudeKuluttajat({ projektitDir: juuri, projekti: 'p1' })[0].istunnot, 1);
  assert.deepEqual(kokoaClaudeKuluttajat({ projektitDir: join(juuri, 'ei') }), []);
});
