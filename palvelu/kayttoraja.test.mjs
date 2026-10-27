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

test('palvelin: /api/kayttoraja reitittää agy-kiintiöön kun tyyppi=agy tai agentti=android/gemini', async () => {
  const { createServer } = await import('node:http');
  const { kasittelija } = await import('./palvelin.mjs');
  const claudeRaja = async () => ({ viisiTuntia: { kaytto: 10, nollautuu: null }, viikko: { kaytto: 20, nollautuu: null } });
  const agyRaja = async () => ({ viisiTuntia: { kaytto: 30, nollautuu: null }, viikko: { kaytto: 40, nollautuu: null }, otsikko: 'OnePlus Linux AGY' });
  const macAgyRaja = async () => ({ viisiTuntia: { kaytto: 50, nollautuu: null }, viikko: { kaytto: 60, nollautuu: null }, otsikko: 'Mac AGY' });

  const srv = createServer(
    kasittelija(
      { avain: 'salaisuus', juuri: '/nonexistent', toimintoloki: null },
      async () => ({}),
      {
        skoopinViestit: (nimi) => (nimi === 'mac-skooppi'
          ? { istunto: { malli: 'mac-agy/gemini-3.8-flash-high', onMac: true, tyyppi: 'agy' } }
          : { istunto: null }),
        onkoMacAgy: (nimi) => nimi === 'mac-skooppi',
        onkoAgy: (nimi) => nimi === 'mac-skooppi',
      },
      claudeRaja,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      agyRaja,
      undefined,
      macAgyRaja
    )
  ).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));

  try {
    const portti = srv.address().port;
    const hae = async (path) => {
      const res = await fetch(`http://127.0.0.1:${portti}${path}`, {
        headers: { authorization: 'Bearer salaisuus' },
      });
      return await res.json();
    };

    // Oletus: claude
    const oletus = await hae('/api/kayttoraja');
    assert.equal(oletus.viisiTuntia.kaytto, 10);
    assert.equal(oletus.otsikko, 'Claude');

    // tyyppi=agy: oneplus agy
    const agy = await hae('/api/kayttoraja?tyyppi=agy');
    assert.equal(agy.viisiTuntia.kaytto, 30);
    assert.equal(agy.otsikko, 'OnePlus Linux AGY');

    // agentti=android/gemini: agy
    const gemini = await hae('/api/kayttoraja?agentti=android/gemini');
    assert.equal(gemini.viisiTuntia.kaytto, 30);

    // agentti=mac-agy/gemini-3.8-flash-high: mac agy
    const macAgy = await hae('/api/kayttoraja?agentti=mac-agy/gemini-3.8-flash-high');
    assert.equal(macAgy.viisiTuntia.kaytto, 50);
    assert.equal(macAgy.otsikko, 'Mac AGY');

    // skooppi=mac-skooppi: mac agy
    const macSkooppi = await hae('/api/kayttoraja?skooppi=mac-skooppi');
    assert.equal(macSkooppi.viisiTuntia.kaytto, 50);
    assert.equal(macSkooppi.otsikko, 'Mac AGY');

    // /api/kayttorajat-kaikki
    const kaikki = await hae('/api/kayttorajat-kaikki');
    assert.equal(kaikki.claude.viisiTuntia.kaytto, 10);
    assert.equal(kaikki.oneplusAgy.gemini.viisiTuntia.kaytto, 30);
    assert.equal(kaikki.macAgy.gemini.viisiTuntia.kaytto, 50);
  } finally {
    srv.close();
  }
});

