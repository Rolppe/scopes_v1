// V-652: harkinnan Claude-moottori (Haiku claude CLI:llä) ja varan lähdemerkintä
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { moottoriMallista, lueCliAnalyysi, ajaHarkintaLahteella, ajaHarkinta, CLAUDE_MALLI, AGY_MALLI } from '../harkinta.mjs';

const analyysi = {
  tehty: ['Valmis'],
  todettu: ['Mitattu'],
  paatokset: ['Oletus ennallaan'],
  avoimet: [],
  viat: [],
  hukka: 'ei — ei havaittu hukkatietoja',
  kesken: 'ei — kaikki pyydetty käsitelty',
  seuraavaPaketti: 'SEURAAVA PAKETTI: ei mitään — valmis',
};

// Väärennetty CLI PATHin alussa: kirjaa argumentit ja stdinin, tulostaa annetun stdoutin.
function vaarennettyCli(nimi, stdout, koodi = 0) {
  const dir = mkdtempSync(join(tmpdir(), 'harkinta-cli-'));
  writeFileSync(join(dir, 'stdout.json'), stdout);
  writeFileSync(join(dir, nimi), `#!/bin/sh\nprintf '%s\\n' "$@" > "${dir}/args"\ncat > "${dir}/stdin"\ncat "${dir}/stdout.json"\nexit ${koodi}\n`);
  chmodSync(join(dir, nimi), 0o755);
  return dir;
}

async function polulla(dir, f) {
  const vanha = process.env.PATH;
  process.env.PATH = `${dir}:${vanha}`;
  try {
    return await f();
  } finally {
    process.env.PATH = vanha;
  }
}

test('moottoriMallista: claude-* ja aliakset claudelle, muut agy:lle', () => {
  assert.equal(moottoriMallista(CLAUDE_MALLI), 'claude');
  assert.equal(moottoriMallista('haiku'), 'claude');
  assert.equal(moottoriMallista(AGY_MALLI), 'agy');
  assert.equal(moottoriMallista(undefined), 'agy');
});

test('lueCliAnalyysi: structured_output, result-merkkijono, is_error ja roska', () => {
  assert.deepEqual(lueCliAnalyysi(JSON.stringify({ structured_output: analyysi })), analyysi);
  assert.deepEqual(lueCliAnalyysi(JSON.stringify({ result: JSON.stringify(analyysi) })), analyysi);
  assert.deepEqual(lueCliAnalyysi(JSON.stringify({ response: JSON.stringify(analyysi) })), analyysi);
  assert.equal(lueCliAnalyysi(JSON.stringify({ is_error: true, structured_output: analyysi })), null);
  assert.equal(lueCliAnalyysi(JSON.stringify({ structured_output: { tehty: [] } })), null);
  assert.equal(lueCliAnalyysi('ei json'), null);
});

test('ajaHarkintaLahteella: Haiku claude CLI:llä, kehote stdinissä, ei työkaluja eikä asetuksia', async () => {
  const dir = vaarennettyCli('claude', JSON.stringify({ type: 'result', is_error: false, structured_output: analyysi }));
  const t = await polulla(dir, () => ajaHarkintaLahteella({ skooppi: 'test' }, { malli: CLAUDE_MALLI }));
  assert.equal(t.lahde, 'malli');
  assert.equal(t.moottori, 'claude');
  assert.deepEqual(t.analyysi, analyysi);
  const args = readFileSync(join(dir, 'args'), 'utf8').split('\n');
  assert.equal(args[args.indexOf('--model') + 1], CLAUDE_MALLI);
  assert.equal(args[args.indexOf('--tools') + 1], '');
  assert.equal(args[args.indexOf('--setting-sources') + 1], '');
  assert.ok(args.includes('--no-session-persistence'));
  assert.match(readFileSync(join(dir, 'stdin'), 'utf8'), /SKOOPPI: test/);
});

test('ajaHarkintaLahteella: epäonnistunut malli → vara syineen, ei hiljaa', async () => {
  const dir = vaarennettyCli('claude', '{"is_error":true}', 1);
  const t = await polulla(dir, () => ajaHarkintaLahteella({ skooppi: 'test' }, { malli: CLAUDE_MALLI }));
  assert.equal(t.lahde, 'vara');
  assert.equal(t.syy, 'claude exit 1');

  const huono = vaarennettyCli('claude', JSON.stringify({ structured_output: { tehty: [] } }));
  const t2 = await polulla(huono, () => ajaHarkintaLahteella({ skooppi: 'test' }, { malli: CLAUDE_MALLI }));
  assert.equal(t2.lahde, 'vara');
  assert.equal(t2.syy, 'claude: vastaus ei vastaa skeemaa');

  const t3 = await ajaHarkintaLahteella({ skooppi: 'test' }, { kaytaMallia: false });
  assert.equal(t3.lahde, 'vara');
  assert.match(t3.syy, /ilman-mallia/);
});

test('ajaHarkinta: palauttaa pelkän analyysin kuten ennen', async () => {
  const t = await ajaHarkinta({ skooppi: 'test' }, { aja: async () => JSON.stringify(analyysi) });
  assert.deepEqual(t, analyysi);
});

test('tiivistaClaudeKutsu: komento, tiedosto ja pitkän komennon loppu mukana', async () => {
  const { tiivistaClaudeKutsu } = await import('../louhija.mjs');
  assert.equal(tiivistaClaudeKutsu({ name: 'Bash', input: { command: 'git status' } }), 'Bash: git status');
  assert.equal(tiivistaClaudeKutsu({ name: 'Edit', input: { file_path: '/a.md', new_string: 'uusi' } }), 'Edit /a.md: uusi');
  assert.equal(tiivistaClaudeKutsu({ name: 'Read', input: { file_path: '/b' } }), 'Read: /b');
  assert.equal(tiivistaClaudeKutsu({ name: 'ToolSearch', input: {} }), 'ToolSearch');
  const pitka = tiivistaClaudeKutsu({ name: 'Bash', input: { command: `vika.sh -- "${'x'.repeat(3000)} oletus ennallaan"` } });
  assert.ok(pitka.length < 1300);
  assert.match(pitka, /oletus ennallaan"$/);
});

test('louhiClaudeViestit ja valitseViestit: kutsut ja tulokset viesteinä, Claude-viestit merkkibudjetilla', async () => {
  const { louhiClaudeViestit } = await import('../louhija.mjs');
  const { valitseViestit, CLAUDE_VIESTIBUDJETTI } = await import('../harkinta.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'louhija-claude-'));
  const polku = join(dir, 's.jsonl');
  const rivit = [
    { type: 'user', message: { content: 'tee se' } },
    { type: 'assistant', message: { model: 'claude-opus-5-5', content: [{ type: 'text', text: 'teen' }, { type: 'tool_use', id: 't1', name: 'Bash', input: { command: 'node --test a.mjs' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: '# pass 3\n# fail 0' }] } },
  ];
  writeFileSync(polku, rivit.map((r) => JSON.stringify(r)).join('\n'));
  const t = louhiClaudeViestit(polku);
  assert.deepEqual(t.viestit.map((v) => v.rooli), ['kayttaja', 'agentti', 'työkalu', 'tulos']);
  assert.equal(t.viestit[2].teksti, 'Bash: node --test a.mjs');
  assert.match(t.viestit[3].teksti, /# pass 3/);

  const iso = Array.from({ length: 100 }, (_, i) => ({ rooli: 'tulos', teksti: `${i} ${'y'.repeat(1000)}` }));
  const valitut = valitseViestit({ istuntoLahde: 'claude', viestit: iso });
  assert.ok(valitut.length < 100 && valitut.length > 30);
  assert.equal(valitut.at(-1), iso.at(-1));
  assert.ok(valitut.reduce((s, v) => s + v.teksti.length, 0) <= CLAUDE_VIESTIBUDJETTI);
  assert.equal(valitseViestit({ istuntoLahde: 'agy', viestit: iso }).length, 30);
});
