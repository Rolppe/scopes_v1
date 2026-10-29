// node --test scopes/agy/models/mallit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kirjoitaTsv, lueTsv, vertaa, vertaaPalvelu } from './mallit.mjs';

const A = { id: 'gemini-3.8-flash-medium', nimi: 'Gemini 3.8 Flash (Medium)' };
const B = { id: 'gpt-oss-120b-medium', nimi: 'GPT-OSS 120B (Medium)' };

test('tsv: kirjoitus ja luku ovat käänteiset', () => {
  assert.deepEqual(lueTsv(kirjoitaTsv([A, B])), [A, B]);
});

test('vertaa: sama lista ei anna eroja', () => {
  assert.deepEqual(vertaa([A, B], [B, A]), []);
});

test('vertaa: uusi, poistunut ja uudelleennimetty malli näkyvät riveinä', () => {
  const C = { id: 'claude-sonnet-4-6', nimi: 'Claude Sonnet 4.6' };
  assert.deepEqual(vertaa([A, B], [{ ...A, nimi: 'Gemini 3.8 Flash' }, C]), [
    `+ ${C.id}\t${C.nimi}`, `- ${B.id}\t${B.nimi}`, `~ ${A.id}\tGemini 3.8 Flash (Medium) → Gemini 3.8 Flash`]);
});

test('vertaaPalvelu: vain agy-ryhmä verrataan, puuttuva ja ylimääräinen nimetään', () => {
  const purkajat = [{ tunnus: '', ryhma: 'oletus' }, { tunnus: 'claude-cli:claude-opus-5-5', ryhma: 'Claude' },
    { tunnus: `agy:${A.id}`, ryhma: 'agy' }, { tunnus: 'agy:vanha-malli', ryhma: 'agy' }];
  assert.deepEqual(vertaaPalvelu(purkajat, [A, B]), [`PALVELU puuttuu: agy:${B.id}`, 'PALVELU ylimääräinen: agy:vanha-malli']);
  assert.deepEqual(vertaaPalvelu(purkajat.slice(0, 3), [A]), []);
});
