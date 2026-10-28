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
