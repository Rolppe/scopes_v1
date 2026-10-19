// node --test scopes/palvelu/nebius-valitys.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anthropicVastaus, luoVirranKaantaja, openaiRunko } from './nebius-valitys.mjs';

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
