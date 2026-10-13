// node --test scopes/palvelu/kayttoraja.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { luoKayttoraja } from './kayttoraja.mjs';

const ALKU = Date.parse('2026-10-13T20:00:00Z');
const VASTAUS = {
  five_hour: { utilization: 12, resets_at: '2026-10-13T22:00:00Z' },
  seven_day: { utilization: 40, resets_at: '2026-10-17T08:00:00Z' },
};

function ymparisto({ vahti, vastaukset = [{ ok: true, json: VASTAUS }] } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'kayttoraja-t-'));
  const tunnusTiedosto = join(d, 'tunnus.json');
  writeFileSync(tunnusTiedosto, JSON.stringify({ claudeAiOauth: { accessToken: 'tok' } }));
  const vahtiTiedosto = join(d, 'kaytto.json');
  if (vahti) writeFileSync(vahtiTiedosto, JSON.stringify(vahti));
  const kello = { t: ALKU };
  const kutsut = [];
  const hae = async (url, opt) => {
    kutsut.push(opt.headers.authorization);
    const v = vastaukset[Math.min(kutsut.length - 1, vastaukset.length - 1)];
    return { ok: v.ok, status: v.ok ? 200 : 429, headers: new Map(), json: async () => v.json };
  };
  return { kayttoraja: luoKayttoraja({ tunnusTiedosto, vahtiTiedosto, hae, nyt: () => kello.t }), kello, kutsut, vahtiTiedosto };
}

test('hakee molemmat rajat ja välimuistittaa 15 min', async () => {
  const { kayttoraja, kello, kutsut } = ymparisto();
  const r = await kayttoraja();
  assert.deepEqual(r.viikko, { kaytto: 40, nollautuu: '2026-10-17T08:00:00.000Z' });
  assert.deepEqual(r.viisiTuntia, { kaytto: 12, nollautuu: '2026-10-13T22:00:00.000Z' });
  assert.deepEqual(kutsut, ['Bearer tok']);
  kello.t += 14 * 60_000;
  await kayttoraja();
  assert.equal(kutsut.length, 1);
  kello.t += 2 * 60_000;
  await kayttoraja();
  assert.equal(kutsut.length, 2);
});

test('tuoreempi vahdin lukema voittaa 5 h rajan', async () => {
  const { kayttoraja, kello, vahtiTiedosto } = ymparisto();
  await kayttoraja();
  writeFileSync(vahtiTiedosto, JSON.stringify({ haettu: (ALKU + 60_000) / 1000, kaytto: 30, nollautuu: '2026-10-13T22:00:00.807215+00:00' }));
  kello.t += 2 * 60_000;
  const r = await kayttoraja();
  assert.deepEqual(r.viisiTuntia, { kaytto: 30, nollautuu: '2026-10-13T22:00:00.807Z' });
  assert.equal(r.viikko.kaytto, 40);
});

test('429: ei uutta hakua 5 min aikana, vahdin 5 h lukema silti näkyy', async () => {
  const { kayttoraja, kello, kutsut } = ymparisto({
    vahti: { haettu: ALKU / 1000, kaytto: 55, nollautuu: '2026-10-13T22:00:00Z' },
    vastaukset: [{ ok: false }, { ok: true, json: VASTAUS }],
  });
  const r = await kayttoraja();
  assert.deepEqual(r.viikko, null);
  assert.equal(r.viisiTuntia.kaytto, 55);
  kello.t += 4 * 60_000;
  await kayttoraja();
  assert.equal(kutsut.length, 1);
  kello.t += 2 * 60_000;
  assert.equal((await kayttoraja()).viikko.kaytto, 40);
});

test('nollautumishetken ohittanut lukema on 0 %', async () => {
  const { kayttoraja, kello } = ymparisto({ vastaukset: [{ ok: true, json: VASTAUS }, { ok: false }] });
  await kayttoraja();
  kello.t = Date.parse('2026-10-13T22:01:00Z');
  const r = await kayttoraja();
  assert.deepEqual(r.viisiTuntia, { kaytto: 0, nollautuu: null });
  assert.equal(r.viikko.kaytto, 40);
});

test('vanha vahdin lukema (yli 10 min) ei kelpaa', async () => {
  const { kayttoraja } = ymparisto({
    vahti: { haettu: (ALKU - 11 * 60_000) / 1000, kaytto: 90, nollautuu: '2026-10-13T22:00:00Z' },
    vastaukset: [{ ok: false }],
  });
  assert.equal((await kayttoraja()).viisiTuntia, null);
});
