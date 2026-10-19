// node --test scopes/palvelu/nebius-valitys.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  anthropicVastaus, hinnasto, istuntoTunnus, katonYlitys, kulutus, luoValitys, luoVirranKaantaja, openaiRunko, paivays,
} from './nebius-valitys.mjs';

test('openaiRunko: järjestelmä, työkalut, työkalukutsu ja tulos oikeaan järjestykseen', () => {
  const r = openaiRunko({
    model: 'm', max_tokens: 100, stream: true, system: [{ type: 'text', text: 'ohje' }],
    tools: [{ name: 'Read', description: 'lue', input_schema: { type: 'object', properties: { path: { type: 'string' } } } }],
    tool_choice: { type: 'any' },
    messages: [
      { role: 'user', content: 'lue x' },
      { role: 'assistant', content: [{ type: 'thinking', thinking: 'pois' }, { type: 'text', text: 'luen' }, { type: 'tool_use', id: 't1', name: 'Read', input: { path: 'x' } }] },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', content: [{ type: 'text', text: 'sisältö' }] }, { type: 'text', text: 'jatka' }] },
    ],
  });
  assert.deepEqual(r.messages, [
    { role: 'system', content: 'ohje' },
    { role: 'user', content: 'lue x' },
    { role: 'assistant', content: 'luen', tool_calls: [{ id: 't1', type: 'function', function: { name: 'Read', arguments: '{"path":"x"}' } }] },
    { role: 'tool', tool_call_id: 't1', content: 'sisältö' },
    { role: 'user', content: 'jatka' },
  ]);
  assert.equal(r.tools[0].function.name, 'Read');
  assert.equal(r.tool_choice, 'required');
  assert.deepEqual(r.stream_options, { include_usage: true });
});

test('anthropicVastaus: teksti ja työkalukutsu, stop_reason ja käyttö', () => {
  const v = anthropicVastaus({ id: 'c1', choices: [{ finish_reason: 'tool_calls', message: { content: 'ok', tool_calls: [{ id: 't', function: { name: 'Bash', arguments: '{"command":"ls"}' } }] } }], usage: { prompt_tokens: 5, completion_tokens: 3 } }, 'm');
  assert.deepEqual(v.content, [{ type: 'text', text: 'ok' }, { type: 'tool_use', id: 't', name: 'Bash', input: { command: 'ls' } }]);
  assert.equal(v.stop_reason, 'tool_use');
  assert.deepEqual(v.usage, { input_tokens: 5, output_tokens: 3 });
});

test('luoVirranKaantaja: tekstilohko, työkalulohko paloina, lopetus ja käyttö', () => {
  const t = [];
  const k = luoVirranKaantaja('m', (tapahtuma, data) => t.push([tapahtuma, data]));
  k.pala({ choices: [{ delta: { content: 'Hei' } }] });
  k.pala({ choices: [{ delta: { content: '!' } }] });
  k.pala({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'x1', function: { name: 'Bash', arguments: '{"comm' } }] } }] });
  k.pala({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: 'and":"ls"}' } }] }, finish_reason: 'tool_calls' }] });
  k.pala({ choices: [], usage: { prompt_tokens: 7, completion_tokens: 4 } });
  k.valmis();
  assert.deepEqual(t.map(([e]) => e), ['message_start', 'content_block_start', 'content_block_delta', 'content_block_delta', 'content_block_stop',
    'content_block_start', 'content_block_delta', 'content_block_delta', 'content_block_stop', 'message_delta', 'message_stop']);
  assert.equal(t[5][1].content_block.type, 'tool_use');
  assert.equal(t[5][1].index, 1);
  assert.equal(t[6][1].delta.partial_json + t[7][1].delta.partial_json, '{"command":"ls"}');
  assert.equal(t[9][1].delta.stop_reason, 'tool_use');
  assert.equal(t[9][1].usage.output_tokens, 4);
});

test('hinnasto ja kulutus: hinnat $/token, päivä ja istunto, vanhat rivit mallin hinnalla', () => {
  const h = hinnasto({ data: [{ id: 'm', pricing: { prompt: '0.000001', completion: '0.000002' } }, { id: 'x', pricing: {} }] });
  assert.deepEqual([...h.keys()], ['m']);
  const nyt = '2026-10-19T08:00:00.000Z';
  const loki = [
    { aika: nyt, malli: 'm', input_tokens: 1000, output_tokens: 500 }, // vanha rivi: 0.001 + 0.001
    { aika: nyt, malli: 'm', istunto: 's1', kustannus: 0.5 },
    { aika: '2026-10-10T08:00:00.000Z', malli: 'm', istunto: 's1', kustannus: 9 },
  ].map((r) => JSON.stringify(r)).join('\n') + '\nrikki\n';
  const k = kulutus(loki, { paiva: paivays(nyt), istunto: 's1', hinnat: h });
  assert.ok(Math.abs(k.paiva - 0.502) < 1e-9);
  assert.equal(k.istunto, 9.5);
});

test('istuntoTunnus ja katonYlitys', () => {
  assert.equal(istuntoTunnus({ 'x-claude-code-session-id': 'abc' }, {}), 'abc');
  assert.equal(istuntoTunnus({}, { metadata: { user_id: 'user_1_account_2_session_9f-aa' } }), '9f-aa');
  assert.equal(istuntoTunnus({}, {}), null);
  const katto = { istunto: 1, paiva: 2 };
  assert.equal(katonYlitys({ katto, kulunut: { paiva: 0.5, istunto: 0.5 }, arvio: 0.4, istunto: 's' }), null);
  assert.match(katonYlitys({ katto, kulunut: { paiva: 0.5, istunto: 0.7 }, arvio: 0.4, istunto: 's' }), /istunnon katto/);
  assert.match(katonYlitys({ katto, kulunut: { paiva: 1.7, istunto: 0 }, arvio: 0.4, istunto: null }), /päivän katto/);
  assert.match(katonYlitys({ katto: null, kulunut: { paiva: 0, istunto: 0 }, arvio: 0, istunto: null }), /puuttuu/);
});

test('luoValitys: katto katkaisee ennen Nebiusta, alle katon kutsu menee ja kirjaa kustannuksen', async () => {
  const kansio = mkdtempSync(join(tmpdir(), 'nebius-katto-'));
  const avain = join(kansio, 'avain'), loki = join(kansio, 'loki'), kattoTiedosto = join(kansio, 'katto.json');
  writeFileSync(avain, 'k\n');
  const kutsut = [];
  const yla = createServer((req, res) => {
    kutsut.push(req.url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.url.startsWith('/v1/models')) return res.end(JSON.stringify({ data: [{ id: 'm', pricing: { prompt: '0.000001', completion: '0.000002' } }] }));
    req.resume();
    req.on('end', () => res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: 'ok' } }], usage: { prompt_tokens: 100, completion_tokens: 10 } })));
  });
  await new Promise((ok) => yla.listen(0, '127.0.0.1', ok));
  const valitys = createServer(luoValitys({ ylavirta: `http://127.0.0.1:${yla.address().port}`, avainTiedosto: avain, loki, kattoTiedosto }));
  await new Promise((ok) => valitys.listen(0, '127.0.0.1', ok));
  const laheta = (runko) => fetch(`http://127.0.0.1:${valitys.address().port}/v1/messages`, {
    method: 'POST', headers: { 'x-claude-code-session-id': 's1' }, body: JSON.stringify({ model: 'm', max_tokens: 100, messages: [{ role: 'user', content: 'hei' }], ...runko }),
  });
  try {
    writeFileSync(kattoTiedosto, JSON.stringify({ istunto: 1, paiva: 1 }));
    const ok = await laheta();
    assert.equal(ok.status, 200);
    const rivi = JSON.parse(readFileSync(loki, 'utf8').trim().split('\n').pop());
    assert.equal(rivi.istunto, 's1');
    assert.equal(rivi.kustannus, 0.00012);

    writeFileSync(kattoTiedosto, JSON.stringify({ istunto: 0.0002, paiva: 1 })); // kulunut 0.00012 + arvio > 0.0002
    const ennen = kutsut.length;
    const ei = await laheta();
    assert.equal(ei.status, 400);
    assert.match((await ei.json()).error.message, /istunnon katto/);
    assert.equal(kutsut.length, ennen, 'Nebiusta ei kutsuttu');

    const tuntematon = await laheta({ model: 'tuntematon' });
    assert.equal(tuntematon.status, 400);
    assert.match((await tuntematon.json()).error.message, /ei ole hintaa/);

    writeFileSync(kattoTiedosto, 'rikki');
    assert.equal((await laheta()).status, 400);
  } finally {
    valitys.close(); yla.close(); rmSync(kansio, { recursive: true, force: true });
  }
});
