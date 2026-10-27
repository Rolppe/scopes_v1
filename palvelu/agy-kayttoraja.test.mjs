// node --test scopes/palvelu/agy-kayttoraja.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  luoAgyKayttoraja,
  luoMacAgyKayttoraja,
  etsiRyhma,
  poimi5h,
  pacificResetAika,
  laskePyyntomaara,
  muunnaRaja,
} from './agy-kayttoraja.mjs';
import { muotoileAgyTila, tallennaTila } from './agy-statusline-paivittaja.mjs';

const STATUSLINE_DATA = {
  quota: {
    '3p-5h': {
      remaining_fraction: 0.85,
      reset_time: '2026-10-17T09:40:41Z',
    },
    '3p-weekly': {
      remaining_fraction: 0.6794796,
      reset_time: '2026-10-22T11:13:00Z',
    },
    'gemini-5h': {
      remaining_fraction: 0.295,
      reset_time: '2026-10-17T09:24:23Z',
    },
    'gemini-weekly': {
      remaining_fraction: 0.69088244,
      reset_time: '2026-10-24T04:24:23Z',
    },
  },
  model: {
    id: 'Gemini 3.8 Flash (High)',
    effort: 'high',
  },
  plan_tier: 'Google AI Pro',
};

test('muunnaRaja: muuntaa remainingFractionin käyttöprosentiksi', () => {
  assert.deepEqual(muunnaRaja({ remainingFraction: 0.295, resetTime: '2026-10-17T09:24:23Z' }), {
    kaytto: 70.5,
    nollautuu: '2026-10-17T09:24:23.000Z',
  });
  assert.equal(muunnaRaja(null), null);
});

test('pacificResetAika: laskee keskiyön LA-ajan UTC-aikaleimana', () => {
  const { resetAika, seuraavaReset } = pacificResetAika(Date.parse('2026-10-17T10:00:00.000Z'));
  assert.equal(resetAika, Date.parse('2026-10-17T07:00:00.000Z'));
  assert.equal(seuraavaReset, '2026-10-18T07:00:00.000Z');
});

test('laskePyyntomaara: laskee transcript.jsonl-mallipyynnöt annetulta päivältä', () => {
  const d = mkdtempSync(join(tmpdir(), 'agy-brain-t-'));
  const convDir = join(d, 'conv1', '.system_generated', 'logs');
  mkdirSync(convDir, { recursive: true });
  writeFileSync(
    join(convDir, 'transcript.jsonl'),
    [
      JSON.stringify({ created_at: '2026-10-17T06:50:00.000Z', source: 'USER_EXPLICIT', type: 'USER_INPUT' }),
      JSON.stringify({ created_at: '2026-10-17T07:05:00.000Z', source: 'USER_EXPLICIT', type: 'USER_INPUT' }),
      JSON.stringify({ created_at: '2026-10-17T07:10:00.000Z', source: 'USER_EXPLICIT', type: 'USER_INPUT' }),
    ].join('\n')
  );

  const res = laskePyyntomaara({
    nytMs: Date.parse('2026-10-17T10:00:00.000Z'),
    brainDir: d,
    maksimi: 1000,
    valiMs: 0,
  });

  assert.equal(res.maara, 2);
  assert.equal(res.kaytto, 0.2); // 2 / 1000 = 0.2%
  assert.equal(res.teksti, '2 / 1000');
  assert.equal(res.otsikko, 'Sisempi punainen, pyynnöt');
  assert.equal(res.nollautuu, '2026-10-18T07:00:00.000Z');
});

test('muotoileAgyTila ja tallennaTila: jäsentää CLI:n statusline-JSONin ja tallentaa levylle', () => {
  const d = mkdtempSync(join(tmpdir(), 'agy-tila-t-'));
  const tilaTiedosto = join(d, 'scopes-agy-kayttoraja.json');

  const tila = muotoileAgyTila(STATUSLINE_DATA, {
    nytMs: Date.parse('2026-10-17T07:30:00.000Z'),
  });

  assert.equal(tila.gemini.viisiTuntia.kaytto, 70.5); // 1 - 0.295 = 70.5%
  assert.equal(tila.gemini.viisiTuntia.nollautuu, '2026-10-17T09:24:23.000Z');
  assert.equal(tila.kolmasOsapuoli.viisiTuntia.kaytto, 15);
  assert.equal(tila.kolmasOsapuoli.viikko.kaytto, 32.05);

  tallennaTila(tila, tilaTiedosto);

  const raja = luoAgyKayttoraja({
    tilaTiedosto,
    nyt: () => Date.parse('2026-10-17T07:35:00.000Z'),
    laskePyynnot: () => ({ kaytto: 25, teksti: '375 / 1500', otsikko: 'Sisempi punainen, pyynnöt', nollautuu: '2026-10-18T07:00:00.000Z' }),
  });

  return Promise.all([raja({ ryhma: 'gemini' }), raja({ ryhma: '3p' })]).then(([rGemini, r3p]) => {
    assert.equal(rGemini.viisiTuntia.kaytto, 70.5);
    assert.equal(rGemini.viikko.kaytto, 25);
    assert.equal(rGemini.viikko.teksti, '375 / 1500');

    assert.equal(r3p.viisiTuntia.kaytto, 15);
    assert.equal(r3p.viikko.kaytto, 32.05);
  });
});

test('nollautumishetken ohittanut lukema nollautuu 0 %:iin', async () => {
  const d = mkdtempSync(join(tmpdir(), 'agy-tila-t-'));
  const tilaTiedosto = join(d, 'scopes-agy-kayttoraja.json');
  const tila = muotoileAgyTila(STATUSLINE_DATA, { nytMs: Date.parse('2026-10-17T07:00:00.000Z') });
  tallennaTila(tila, tilaTiedosto);

  // Kello 5h nollautumisen (09:24:23) yli
  const raja = luoAgyKayttoraja({
    tilaTiedosto,
    nyt: () => Date.parse('2026-10-17T10:00:00.000Z'),
    laskePyynnot: () => ({ kaytto: 10, teksti: '150 / 1500', otsikko: 'Sisempi punainen, pyynnöt', nollautuu: '2026-10-18T07:00:00.000Z' }),
  });

  const r = await raja({ ryhma: 'gemini' });
  assert.equal(r.viisiTuntia.kaytto, 0);
  assert.equal(r.viisiTuntia.nollautuu, null);
  assert.equal(r.viikko.kaytto, 10);
});

test('ei tee verkkokutsuja jos tila luetaan levyltä', async () => {
  const d = mkdtempSync(join(tmpdir(), 'agy-tila-t-'));
  const tilaTiedosto = join(d, 'scopes-agy-kayttoraja.json');
  tallennaTila(muotoileAgyTila(STATUSLINE_DATA), tilaTiedosto);

  const raja = luoAgyKayttoraja({
    tilaTiedosto,
    laskePyynnot: () => null,
  });

  const r = await raja({ ryhma: 'gemini' });
  assert.equal(r.lahde, 'cli-statusline');
  assert.equal(r.ymparisto, 'oneplus');
  assert.ok(r.viisiTuntia);
  assert.equal(r.otsikko, 'OnePlus Linux AGY');
});

test('luoMacAgyKayttoraja: paikallinen haku asettaa otsikoksi Mac AGY', { skip: process.platform !== 'darwin' }, async () => {
  const d = mkdtempSync(join(tmpdir(), 'mac-agy-tila-'));
  const tilaTiedosto = join(d, 'scopes-agy-kayttoraja.json');
  tallennaTila(muotoileAgyTila(STATUSLINE_DATA), tilaTiedosto);

  const raja = luoMacAgyKayttoraja({
    tilaTiedosto,
    brainDir: d,
  });

  const r = await raja({ ryhma: 'gemini' });
  assert.equal(r.otsikko, 'Mac AGY');
  assert.equal(r.ymparisto, 'macos');
  assert.ok(r.viisiTuntia);
});

test('luoMacAgyKayttoraja: hakee Macilta ssh:lla ja palauttaa erilliset käyttörajat', async () => {
  const kutsut = [];
  const mockAja = async (komento, args) => {
    kutsut.push([komento, args]);
    return {
      koodi: 0,
      stdout: JSON.stringify({
        tila: {
          gemini: { viisiTuntia: { kaytto: 45, nollautuu: null } },
          kolmasOsapuoli: { viisiTuntia: { kaytto: 10, nollautuu: null }, viikko: { kaytto: 20, nollautuu: null } },
        },
        pyynnot: { kaytto: 75.5, nollautuu: '2026-10-27T07:00:00.000Z', teksti: '1132 / 1500', otsikko: 'Sisempi punainen, pyynnöt', maara: 1132, maksimi: 1500 },
      }),
    };
  };

  const macRaja = luoMacAgyKayttoraja({ aja: mockAja, nyt: () => Date.parse('2026-10-27T06:00:00.000Z') });
  const gemini = await macRaja({ ryhma: 'gemini' });
  assert.equal(gemini.ymparisto, 'macos');
  assert.equal(gemini.lahde, 'mac-ssh');
  assert.equal(gemini.otsikko, 'Mac AGY');
  assert.equal(gemini.viisiTuntia.kaytto, 45);
  assert.equal(gemini.viikko.kaytto, 75.5);
  assert.equal(gemini.viikko.teksti, '1132 / 1500');

  const kolmas = await macRaja({ ryhma: '3p' });
  assert.equal(kolmas.viisiTuntia.kaytto, 10);
  assert.equal(kolmas.viikko.kaytto, 20);
  assert.equal(kutsut.length, 1, 'välimuisti estää toisen ssh-kutsun heti perään');
});
