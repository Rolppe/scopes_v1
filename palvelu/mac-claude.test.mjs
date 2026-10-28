// node --test scopes/palvelu/mac-claude.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jasennaMacClaude, luoMacClaude, macSkooppi } from './mac-claude.mjs';

const NIMET = ['scopes2 macos', 'scopes overseer', 'scopes siirto economy claude'];
const rivi = (s, t = '') => ({ s: { pid: 1, sessionId: 'id-' + s.tmux, startedAt: 5, ...s }, t });

test('macSkooppi: tmux-istunnon nimestä skooppi, muuten ei skooppia (VI-1)', () => {
  assert.equal(macSkooppi({ tmux: 'siirto-scopes2-macos-084451:@20.%20' }, '', NIMET), 'scopes2 macos');
  assert.equal(macSkooppi({ tmux: 'siirto-scopes-siirto-economy-claude-084122:@18.%18' }, '', NIMET), 'scopes siirto economy claude');
  assert.equal(macSkooppi({ tmux: null, name: 'macOS AI-projektien tiedostojen organisointi' }, '', NIMET), null);
});

test('jasennaMacClaude: tila, kysely ja skooppi; ei paikallista ruutua eikä pidiä (VI-1)', () => {
  const r = jasennaMacClaude(JSON.stringify([
    rivi({ tmux: 'siirto-scopes-overseer-093011:@24.%24', status: 'shell', name: 'sessions-repo-91' }),
    rivi({ tmux: 'siirto-scopes2-macos-084451:@20.%20', status: 'waiting', waitingFor: 'input needed' }),
  ]), NIMET);
  assert.deepEqual(r.map((i) => [i.skooppi, i.tila, i.kysely, i.onMac, i.ruutu, i.pid]),
    [['scopes overseer', 'shell', false, true, null, null], ['scopes2 macos', 'waiting', true, true, null, null]]);
  assert.deepEqual(jasennaMacClaude('ei json', NIMET), []);
});

test('luoMacClaude: välimuisti TTL:n ajan, epäonnistunut ssh ei kaada listaa', async () => {
  let kutsut = 0;
  const aja = async (k, a, o) => { kutsut++; assert.equal(k, 'ssh'); assert.match(o.syote, /sessions/); return { koodi: 0, stdout: JSON.stringify([rivi({ tmux: 'siirto-scopes-overseer-093011:@1.%1', status: 'busy' })]) }; };
  const hae = luoMacClaude({ aja, paalla: true, ttl: 60_000 });
  assert.equal((await hae(NIMET))[0].skooppi, 'scopes overseer');
  await hae(NIMET);
  assert.equal(kutsut, 1);
  const rikki = luoMacClaude({ aja: async () => ({ koodi: 255, stdout: '' }), paalla: true });
  assert.deepEqual(await rikki(NIMET), []);
  assert.deepEqual(await luoMacClaude({ aja, paalla: false })(NIMET), []);
});

// MAC_SKRIPTI löytää transkriptin, kun cwd:ssä on välilyönti (Claude-äpin scratch-workspaces, 28.10.2026).
test('MAC_SKRIPTI: projektihakemiston nimi muuntaa välilyönnin ja pisteen viivaksi', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const { execFileSync } = await import('node:child_process');
  const { MAC_SKRIPTI } = await import('./mac-claude.mjs');
  const koti = mkdtempSync(join(tmpdir(), 'mac-claude-'));
  const cwd = join(koti, 'Application Support', 'scratch.2026-10-28');
  mkdirSync(join(koti, '.claude', 'sessions'), { recursive: true });
  const projekti = cwd.replace(/[^A-Za-z0-9]/g, '-');
  mkdirSync(join(koti, '.claude', 'projects', projekti), { recursive: true });
  writeFileSync(join(koti, '.claude', 'projects', projekti, 's1.jsonl'), '{"type":"user"}\n');
  writeFileSync(join(koti, '.claude', 'sessions', '1.json'), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd, name: 'x' }));
  const ulos = JSON.parse(execFileSync('python3', ['-'], { input: MAC_SKRIPTI, encoding: 'utf8', env: { ...process.env, HOME: koti } }));
  assert.equal(ulos.length, 1);
  assert.equal(ulos[0].t, '{"type":"user"}\n');
});

// Iso transkripti: alun /pura-rivi säilyy, keskiosa jää pois, loppu on kokonaisia rivejä (28.10.2026).
test('MAC_SKRIPTI: yli 464 kt:n transkriptista luetaan alku ja loppu', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const { execFileSync } = await import('node:child_process');
  const { MAC_SKRIPTI } = await import('./mac-claude.mjs');
  const koti = mkdtempSync(join(tmpdir(), 'mac-claude-'));
  const cwd = join(koti, 'p');
  mkdirSync(join(koti, '.claude', 'sessions'), { recursive: true });
  mkdirSync(join(koti, '.claude', 'projects', cwd.replace(/[^A-Za-z0-9]/g, '-')), { recursive: true });
  const eka = '{"type":"user","message":{"role":"user","content":"<command-name>/pura</command-name><command-args>x y</command-args>"}}\n';
  const taytto = ('{"type":"assistant","message":{"content":"' + 'a'.repeat(1000) + '"}}\n').repeat(600);
  const vika = '{"type":"assistant","message":{"usage":{"input_tokens":1}}}\n';
  writeFileSync(join(koti, '.claude', 'projects', cwd.replace(/[^A-Za-z0-9]/g, '-'), 's1.jsonl'), eka + taytto + vika);
  writeFileSync(join(koti, '.claude', 'sessions', '1.json'), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd, name: 'x' }));
  const ulos = JSON.parse(execFileSync('python3', ['-'], { input: MAC_SKRIPTI, encoding: 'utf8', env: { ...process.env, HOME: koti } }));
  const t = ulos[0].t;
  assert.ok(t.startsWith(eka), 'alku säilyy');
  assert.ok(t.endsWith(vika), 'loppu säilyy');
  assert.ok(t.length < 500_000 && t.length > 400_000, 'keskiosa jää pois: ' + t.length);
  for (const rivi of t.split('\n')) if (rivi) JSON.parse(rivi);
});
