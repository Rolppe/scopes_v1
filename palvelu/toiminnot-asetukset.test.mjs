// node --test scopes/palvelu/toiminnot-asetukset.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { kasittelija } from './palvelin.mjs';
import { ASETUKSET, luoAsetukset } from './toiminnot-asetukset.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'scopes-as-'));

test('asetukset: puuttuva hakemisto ja tiedosto = false', () => {
  const a = luoAsetukset({ hakemisto: join(tmp(), 'ei-ole') });
  assert.deepEqual(a.lue(), { automaattijatko: false, autopack: false });
});

test('asetukset: roskasisältö ja jokin muu kuin true = false', () => {
  const d = tmp();
  writeFileSync(join(d, ASETUKSET.automaattijatko), '\u0000ÿ roska');
  writeFileSync(join(d, ASETUKSET.autopack), 'TRUE\n1\n');
  assert.deepEqual(luoAsetukset({ hakemisto: d }).lue(), { automaattijatko: false, autopack: false });
  writeFileSync(join(d, ASETUKSET.autopack), 'true');
  assert.equal(luoAsetukset({ hakemisto: d }).lue().autopack, true);
});

test('asetukset: asetus kirjoittaa muodossa true/false + rivinvaihto ja lukee takaisin', () => {
  const d = tmp();
  const a = luoAsetukset({ hakemisto: d });
  assert.deepEqual(a.aseta('autopack', true), { automaattijatko: false, autopack: true });
  assert.equal(readFileSync(join(d, 'autopack.txt'), 'utf8'), 'true\n');
  assert.deepEqual(a.aseta('automaattijatko', true), { automaattijatko: true, autopack: true });
  assert.equal(readFileSync(join(d, 'automaattivalinta.txt'), 'utf8'), 'true\n');
  assert.deepEqual(a.aseta('autopack', false), { automaattijatko: true, autopack: false });
  assert.equal(readFileSync(join(d, 'autopack.txt'), 'utf8'), 'false\n');
  assert.deepEqual(readdirSync(d).sort(), ['autopack.txt', 'automaattivalinta.txt'].sort(), 'tmp-tiedosto jäi jäljelle');
});

test('asetukset: tuntematon nimi ja ei-boolean hylätään, mitään ei kirjoiteta', () => {
  const d = tmp();
  const a = luoAsetukset({ hakemisto: d });
  for (const nimi of ['x', '../autopack', 'autopack.txt', '__proto__', 'toString', '', null, undefined, 5]) {
    assert.throws(() => a.aseta(nimi, true), (e) => e.koodi === 404, String(nimi));
  }
  for (const arvo of ['true', 1, 0, null, undefined, 'paalle']) {
    assert.throws(() => a.aseta('autopack', arvo), (e) => e.koodi === 400, String(arvo));
  }
  assert.deepEqual(readdirSync(d), []);
});

test('asetukset: asetus ja hylkäys kirjataan toimintolokiin', () => {
  const d = tmp();
  const loki = join(d, 'loki/t.loki');
  const a = luoAsetukset({ hakemisto: join(d, 'tila'), loki });
  a.aseta('autopack', true);
  assert.throws(() => a.aseta('rm', true));
  const rivit = readFileSync(loki, 'utf8').trim().split('\n').map((r) => JSON.parse(r));
  assert.equal(rivit.length, 2);
  assert.deepEqual([rivit[0].toiminto, rivit[0].nimi, rivit[0].arvo, rivit[0].tulos], ['asetus', 'autopack', true, 'ok']);
  assert.deepEqual([rivit[1].toiminto, rivit[1].nimi, rivit[1].tulos], ['asetus', 'rm', 'hylätty']);
});

test('palvelin: GET/POST /api/asetukset vaatii avaimen ja kirjoittaa vain kiinteisiin tiedostoihin', async () => {
  const avain = 'k'.repeat(32);
  const d = tmp();
  const tilaDir = join(d, 'tila');
  mkdirSync(tilaDir);
  const toimintoloki = join(d, 'loki/t.loki');
  const srv = createServer(kasittelija({ juuri: d, avain, tilaDir, toimintoloki }, async () => ({}))).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const laheta = (polku, method = 'GET', kayttoavain = avain) => new Promise((ok, ei) => {
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method, headers: { authorization: `Bearer ${kayttoavain}` } }, (res) => {
      let b = ''; res.on('data', (c) => { b += c; }); res.on('end', () => ok([res.statusCode, JSON.parse(b)]));
    });
    req.on('error', ei); req.end();
  });
  try {
    assert.deepEqual(await laheta('/api/asetukset'), [200, { automaattijatko: false, autopack: false }]);
    assert.deepEqual(await laheta('/api/asetukset/autopack/paalle', 'POST'), [200, { automaattijatko: false, autopack: true }]);
    assert.deepEqual(await laheta('/api/asetukset/automaattijatko/paalle', 'POST'), [200, { automaattijatko: true, autopack: true }]);
    assert.deepEqual(await laheta('/api/asetukset/autopack/pois', 'POST'), [200, { automaattijatko: true, autopack: false }]);
    assert.deepEqual(await laheta('/api/asetukset'), [200, { automaattijatko: true, autopack: false }]);
    assert.equal((await laheta('/api/asetukset/muu/paalle', 'POST'))[0], 404);
    assert.equal((await laheta('/api/asetukset/..%2Fautopack/paalle', 'POST'))[0], 404);
    assert.equal((await laheta('/api/asetukset/autopack/ehka', 'POST'))[0], 404);
    assert.equal((await laheta('/api/asetukset/autopack/paalle', 'GET'))[0], 404);
    assert.equal((await laheta('/api/asetukset', 'GET', 'v'.repeat(32)))[0], 401);
    assert.equal((await laheta('/api/asetukset/autopack/paalle', 'POST', 'v'.repeat(32)))[0], 401);
    assert.deepEqual(readdirSync(tilaDir).sort(), ['automaattivalinta.txt', 'autopack.txt']);
    assert.ok(existsSync(toimintoloki));
  } finally { srv.close(); }
});
