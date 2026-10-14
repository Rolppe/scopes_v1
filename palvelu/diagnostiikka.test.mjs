// node --test scopes/palvelu/diagnostiikka.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { luoDiagnostiikka } from './diagnostiikka.mjs';
import { kasittelija } from './palvelin.mjs';

const AVAIN = 'a'.repeat(40);
const NYT = () => new Date('2026-10-14T07:00:00.000Z');

function ymparisto() {
  const d = mkdtempSync(join(tmpdir(), 'diag-t-'));
  return { d, pyyntoloki: join(d, 'pyynnot.loki'), appiloki: join(d, 'app.loki') };
}

const rivit = (f) => readFileSync(f, 'utf8').trim().split('\n').map((r) => JSON.parse(r));

async function palvelin(kasittele) {
  const s = createServer(kasittele);
  await new Promise((ok) => s.listen(0, '127.0.0.1', ok));
  return { s, portti: s.address().port };
}

function pyynto(portti, polku, { metodi = 'GET', runko, avain = AVAIN } = {}) {
  return new Promise((ok, ei) => {
    const r = request({ host: '127.0.0.1', port: portti, path: polku, method: metodi, headers: { authorization: `Bearer ${avain}` } }, (res) => {
      let data = '';
      res.on('data', (p) => { data += p; });
      res.on('end', () => ok({ koodi: res.statusCode, data: data ? JSON.parse(data) : null }));
    });
    r.on('error', ei);
    if (runko !== undefined) r.write(typeof runko === 'string' ? runko : JSON.stringify(runko));
    r.end();
  });
}

test('kääre kirjaa polun ilman kyselyä, koodin, keston ja lähdeosoitteen', async () => {
  const y = ymparisto();
  const diag = luoDiagnostiikka(y, { nyt: NYT });
  const { s, portti } = await palvelin(diag.kaari((req, res) => { res.writeHead(418); res.end('{}'); }));
  try {
    await pyynto(portti, '/api/skoopit/scopes%20viat/liite?nimi=salainen.jpg');
    await new Promise((ok) => setTimeout(ok, 20));
    const [r] = rivit(y.pyyntoloki);
    assert.equal(r.aika, '2026-10-14T07:00:00.000Z');
    assert.equal(r.metodi, 'GET');
    assert.equal(r.polku, '/api/skoopit/scopes%20viat/liite');
    assert.equal(r.koodi, 418);
    assert.equal(typeof r.ms, 'number');
    assert.equal(r.osoite, '127.0.0.1');
    assert.equal(r.katkesi, undefined);
  } finally { s.close(); }
});

test('kääre merkitsee katkenneen yhteyden', async () => {
  const y = ymparisto();
  const diag = luoDiagnostiikka(y, { nyt: NYT });
  const { s, portti } = await palvelin(diag.kaari(() => { /* ei vastaa koskaan */ }));
  try {
    await new Promise((ok) => {
      const r = request({ host: '127.0.0.1', port: portti, path: '/api/skoopit' });
      r.on('error', () => ok());
      r.end();
      setTimeout(() => { r.destroy(); ok(); }, 50);
    });
    await new Promise((ok) => setTimeout(ok, 50));
    const [r] = rivit(y.pyyntoloki);
    assert.equal(r.katkesi, true);
  } finally { s.closeAllConnections(); s.close(); }
});

test('loki kiertää rajan ylittyessä nimelle .1', () => {
  const y = ymparisto();
  writeFileSync(y.pyyntoloki, 'x'.repeat(150) + '\n');
  const diag = luoDiagnostiikka(y, { nyt: NYT, raja: 200 });
  // Valepyyntö, jonka vastaus sulkeutuu heti: kääre kirjaa rivin ilman palvelinta.
  const res = { statusCode: 200, writableFinished: true, on: (_, f) => f() };
  diag.kaari(() => {})({ method: 'GET', url: '/api/terveys', socket: {} }, res);
  assert.ok(existsSync(y.pyyntoloki + '.1'));
  assert.equal(rivit(y.pyyntoloki).length, 1);
});

test('POST /api/diagnostiikka kirjaa äpin tapahtumat laitetiedon kanssa', async () => {
  const y = ymparisto();
  const diag = luoDiagnostiikka(y, { nyt: NYT });
  const { s, portti } = await palvelin(kasittelija({ avain: AVAIN, juuri: y.d }, undefined, undefined, undefined, undefined, diag));
  try {
    const v = await pyynto(portti, '/api/diagnostiikka', {
      metodi: 'POST',
      runko: { laite: { versio: '1.0 (7)', ios: '18.6' }, tapahtumat: [{ aika: '2026-10-14T06:59:58Z', tyyppi: 'jumi', ms: 2400 }, { tyyppi: 'pyynto', polku: '/api/skoopit', ms: 9000 }] },
    });
    assert.deepEqual(v, { koodi: 200, data: { kirjattu: 2 } });
    const r = rivit(y.appiloki);
    assert.equal(r.length, 2);
    assert.equal(r[0].vastaanotettu, '2026-10-14T07:00:00.000Z');
    assert.equal(r[0].tyyppi, 'jumi');
    assert.equal(r[0].ms, 2400);
    assert.deepEqual(r[1].laite, { versio: '1.0 (7)', ios: '18.6' });
  } finally { s.close(); }
});

test('POST /api/diagnostiikka hylkää väärän rungon ja vaatii avaimen', async () => {
  const y = ymparisto();
  const diag = luoDiagnostiikka(y, { nyt: NYT });
  const { s, portti } = await palvelin(kasittelija({ avain: AVAIN, juuri: y.d }, undefined, undefined, undefined, undefined, diag));
  try {
    assert.equal((await pyynto(portti, '/api/diagnostiikka', { metodi: 'POST', runko: 'ei jsonia' })).koodi, 400);
    assert.equal((await pyynto(portti, '/api/diagnostiikka', { metodi: 'POST', runko: { tapahtumat: 'x' } })).koodi, 400);
    assert.equal((await pyynto(portti, '/api/diagnostiikka', { metodi: 'POST', runko: { tapahtumat: [1] } })).koodi, 400);
    assert.equal((await pyynto(portti, '/api/diagnostiikka', { metodi: 'POST', runko: { tapahtumat: [] }, avain: 'b'.repeat(40) })).koodi, 401);
    assert.equal(existsSync(y.appiloki), false);
  } finally { s.close(); }
});

test('tukkeutunut tapahtumasilmukka kirjataan', async () => {
  const y = ymparisto();
  const diag = luoDiagnostiikka(y, { nyt: NYT });
  const seis = diag.silmukka();
  try {
    await new Promise((ok) => setTimeout(ok, 300));
    const loppu = Date.now() + 900;
    while (Date.now() < loppu) { /* tukos */ }
    await new Promise((ok) => setTimeout(ok, 300));
    const r = rivit(y.pyyntoloki).filter((x) => x.tyyppi === 'silmukka');
    assert.equal(r.length, 1);
    assert.ok(r[0].viive >= 500, `viive ${r[0].viive}`);
  } finally { seis(); }
});
