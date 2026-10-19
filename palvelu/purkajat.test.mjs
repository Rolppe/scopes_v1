// node --test scopes/palvelu/purkajat.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { agyMallit, luoPurkajat } from './purkajat.mjs';
import { Hylatty } from './toiminnot.mjs';

const AGY = 'Fetching available models...\ngemini-3.8-flash-medium\tGemini 3.8 Flash (Medium)\ngpt-oss-120b-medium\tGPT-OSS 120B (Medium)\n';

function purkajat({ agy = { koodi: 0, stdout: AGY, stderr: '' }, lms = [{ nimi: 'palvelin/qwen/qwen3.6-35b-a3b', kuvaus: 'Qwen3.6 35B A3B', tyyppi: 'paikallinen' }], aja: ajaKorvaava, nyt, nebius = false } = {}) {
  const juuri = mkdtempSync(join(tmpdir(), 'purkajat-'));
  mkdirSync(join(juuri, 'claude/siirto'), { recursive: true });
  writeFileSync(join(juuri, 'claude/siirto/ajaja.json'), JSON.stringify({ pura: { moottori: 'claude-cli', malli: 'claude-haiku-5-5' } }));
  const kutsut = [];
  const aja = async (k, a) => { kutsut.push([k, ...a]); return ajaKorvaava ? ajaKorvaava() : agy; };
  const paikalliset = async () => [{ nimi: 'claude-opus-5-5', kuvaus: 'Opus 5.5', tyyppi: 'malli' }, ...lms];
  const nebiusTiedosto = join(juuri, 'nebius-avain');
  if (nebius) writeFileSync(nebiusTiedosto, 'koeavain-123456');
  return { p: luoPurkajat({ juuri, paikalliset, aja, nebiusTiedosto, ...(nyt && { nyt }) }), kutsut };
}

test('agyMallit: otsikkorivi pois, tunnus ja nimi talteen', () => {
  assert.deepEqual(agyMallit(AGY), [{ id: 'gemini-3.8-flash-medium', nimi: 'Gemini 3.8 Flash (Medium)' }, { id: 'gpt-oss-120b-medium', nimi: 'GPT-OSS 120B (Medium)' }]);
  assert.deepEqual(agyMallit('virhe; rm -rf /\tx\n'), []);
});

test('lista: oletus, Claude, agentti, agy ja paikalliset; agy välimuistissa', async () => {
  const { p, kutsut } = purkajat();
  const l = await p.lista();
  assert.deepEqual(l.purkajat.map((x) => x.tunnus), ['', 'claude-cli:claude-fable-5-1', 'claude-cli:claude-opus-5-5', 'claude-cli:claude-sonnet-5-5',
    'claude-cli:claude-haiku-5-5', 'claude-agent:siirtaja-sonnet', 'agy:gemini-3.8-flash-medium', 'agy:gpt-oss-120b-medium', 'paikallinen:qwen/qwen3.6-35b-a3b']);
  assert.equal(l.purkajat[0].kuvaus, 'Oletus (claude-cli claude-haiku-5-5)');
  assert.equal(l.oletusMalli, 'claude-opus-5-5');
  // Paikalliset mallit myös istunnon malleiksi (15.10.2026: "Paikalliset mallit pitää saada myös keskustelun ajoon").
  assert.deepEqual(l.mallit.map((m) => `${m.ryhma}:${m.nimi}`), ['Claude:claude-fable-5-1', 'Claude:claude-opus-5-5', 'Claude:claude-sonnet-5-5',
    'Claude:claude-haiku-5-5', 'Paikalliset:palvelin/qwen/qwen3.6-35b-a3b']);
  await p.lista();
  assert.equal(kutsut.length, 1);
});

// Kylmä välimuisti ei saa odotuttaa listaa (käyttäjä 15.10.2026: "Näkyy mutta tuli viiveellä"; 14:05Z 6 538 ms).
test('lista: vanhentunut agy-lista heti, päivitys taustalla yhtenä hakuna', async () => {
  let aika = 0;
  let vapauta;
  let hidas = false;
  const { p, kutsut } = purkajat({ nyt: () => aika,
    aja: () => (hidas ? new Promise((r) => { vapauta = () => r({ koodi: 0, stdout: 'uusi-malli\tUusi\n', stderr: '' }); }) : { koodi: 0, stdout: AGY, stderr: '' }) });
  assert.equal((await p.lista()).purkajat.filter((x) => x.ryhma === 'agy').length, 2);
  aika = 11 * 60_000;
  hidas = true;
  const ennen = await p.lista();
  await p.lista();
  assert.equal(kutsut.length, 2);
  assert.deepEqual(ennen.purkajat.filter((x) => x.ryhma === 'agy').map((x) => x.tunnus), ['agy:gemini-3.8-flash-medium', 'agy:gpt-oss-120b-medium']);
  vapauta();
  await new Promise((r) => setImmediate(r));
  assert.deepEqual((await p.lista()).purkajat.filter((x) => x.ryhma === 'agy').map((x) => x.tunnus), ['agy:uusi-malli']);
  assert.equal(kutsut.length, 2);
});

test('lista: agy ja palvelin pois → vain Claude', async () => {
  const { p } = purkajat({ agy: { koodi: 1, stdout: '', stderr: 'x' }, lms: [] });
  assert.deepEqual([...new Set((await p.lista()).purkajat.map((x) => x.ryhma))], ['oletus', 'Claude']);
});

test('tarkista: vain listan jäsenet, tyhjä = oletus', async () => {
  const { p } = purkajat();
  assert.deepEqual(await p.tarkista({}), { ajaja: null, malli: null });
  assert.deepEqual(await p.tarkista({ purkaja: 'agy:gemini-3.8-flash-medium', malli: 'claude-sonnet-5-5' }), { ajaja: 'agy:gemini-3.8-flash-medium', malli: 'claude-sonnet-5-5' });
  const hylkaa = (r) => assert.rejects(p.tarkista(r), (e) => e instanceof Hylatty && e.koodi === 400);
  await hylkaa({ purkaja: 'agy:gemini --rm' });
  await hylkaa({ purkaja: 'paikallinen:muu' });
  assert.deepEqual(await p.tarkista({ malli: 'palvelin/qwen/qwen3.6-35b-a3b' }), { ajaja: null, malli: 'palvelin/qwen/qwen3.6-35b-a3b' });
  await hylkaa({ malli: 'palvelin/muu' });
  await hylkaa({ malli: 'gpt-4' });
  await hylkaa({ malli: 5 });
});

// Nebius-mallit (käyttäjä 18.10.2026): näkyvät vain avaimen kanssa, ja tarkistus hyväksyy ne istunnon malliksi.
test('lista: Nebius-ryhmä vain, kun avain on annettu', async () => {
  const ilman = await purkajat().p.lista();
  assert.equal(ilman.mallit.some((m) => m.ryhma === 'Nebius'), false);
  const { p } = purkajat({ nebius: true });
  const l = await p.lista();
  assert.ok(l.mallit.some((m) => m.ryhma === 'Nebius' && m.nimi === 'nebius/deepseek-ai/DeepSeek-V4.1-Flash'));
  assert.deepEqual(await p.tarkista({ malli: 'nebius/deepseek-ai/DeepSeek-V4.1-Flash' }), { ajaja: null, malli: 'nebius/deepseek-ai/DeepSeek-V4.1-Flash' });
});
