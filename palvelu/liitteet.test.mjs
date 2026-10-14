// node --test scopes/palvelu/liitteet.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { luoLiitteet, siistiNimi } from './liitteet.mjs';
import { kasittelija } from './palvelin.mjs';

function ymparisto() {
  const d = mkdtempSync(join(tmpdir(), 'liitteet-t-'));
  const juuri = join(d, 'juuri');
  mkdirSync(join(juuri, 'claude/siirto/state'), { recursive: true });
  writeFileSync(join(juuri, 'claude/siirto/state/skoopit.json'), JSON.stringify({ 'scopes chat media': ['R.md'] }));
  return { juuri, liitteetDir: join(d, 'liitteet'), istunnotDir: join(d, 'ist'), projektitDir: join(d, 'proj'), chatDir: join(d, 'chat') };
}

const NYT = () => new Date('2026-10-14T06:30:05.123Z');

test('siistiNimi: polkuerottimet ja alkupisteet pois, ääkköset säilyvät', () => {
  assert.equal(siistiNimi('../../etc/passwd', 'x'), 'etc-passwd');
  assert.equal(siistiNimi('Kuva äiti 1.JPG', 'x'), 'Kuva-äiti-1.JPG');
  assert.equal(siistiNimi('scopes chat media', 'x'), 'scopes-chat-media');
  assert.equal(siistiNimi('', 'liite'), 'liite');
  assert.equal(siistiNimi(null, 'liite'), 'liite');
  assert.equal(siistiNimi('/', 'liite'), 'liite');
});

test('tallenna: tiedosto skoopin hakemistoon, aikaleima ja nimi polussa', async () => {
  const a = ymparisto();
  const tallenna = luoLiitteet(a, { nyt: NYT });
  const data = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01]);
  const { polku, koko } = await tallenna('scopes chat media', 'IMG_0001.jpg', Readable.from([data]));
  assert.equal(koko, 5);
  assert.equal(dirname(polku), join(a.liitteetDir, 'scopes-chat-media'));
  assert.match(polku, /\/20261014T063005-[0-9a-f]{6}-IMG_0001\.jpg$/);
  assert.deepEqual(readFileSync(polku), data);
});

test('tallenna: tyhjä 400, liian suuri 413', async () => {
  const a = ymparisto();
  const tallenna = luoLiitteet(a, { raja: 4 });
  await assert.rejects(tallenna('s', 'a', Readable.from([])), { koodi: 400 });
  await assert.rejects(tallenna('s', 'a', Readable.from([Buffer.alloc(3), Buffer.alloc(3)])), { koodi: 413 });
});

test('palvelin: liitereitti vaatii avaimen ja tunnetun skoopin, palauttaa polun', async () => {
  const a = ymparisto();
  const avain = 'k'.repeat(32);
  const srv = createServer(kasittelija({ ...a, avain }, async () => ({}), {}, async () => ({}), luoLiitteet(a))).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const laheta = (polku, runko, k = avain) => new Promise((ok, ei) => {
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method: 'POST',
      headers: { authorization: `Bearer ${k}`, 'content-type': 'application/octet-stream' } }, (res) => {
      let d = '';
      res.on('data', (p) => { d += p; });
      res.on('end', () => ok({ koodi: res.statusCode, data: JSON.parse(d) }));
    });
    req.on('error', ei);
    req.end(runko);
  });
  try {
    const nimi = encodeURIComponent('scopes chat media');
    assert.equal((await laheta(`/api/skoopit/${nimi}/liite?nimi=a.png`, 'x', 'vaara')).koodi, 401);
    assert.equal((await laheta(`/api/skoopit/tuntematon/liite?nimi=a.png`, 'x')).koodi, 404);
    const v = await laheta(`/api/skoopit/${nimi}/liite?nimi=${encodeURIComponent('kuva 1.png')}`, Buffer.from('PNGDATA'));
    assert.equal(v.koodi, 200);
    assert.equal(v.data.koko, 7);
    assert.match(v.data.polku, /-kuva-1\.png$/);
    assert.equal(readFileSync(v.data.polku, 'utf8'), 'PNGDATA');
  } finally {
    srv.close();
  }
});
