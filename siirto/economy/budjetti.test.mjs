// scopes/siirto/economy/budjetti.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  HALYTYSTASOT,
  MAKSIMI_PAKETTI_KUTSUJA,
  OLETUS_SKOOPPI_ALLOKAATIO,
  SAASTOTILAT,
  TAVOITE_PAKETTI_KUTSUJA,
  VUOROKAUSIBUDJETTI_KUTSUJA,
  arvioiIstunnonBudjetti,
  laskeBudjettitilanne,
  muotoileBudjettiRaportti,
} from './budjetti.mjs';

test('laskeBudjettitilanne: laskee perussuureet ja hälytystasot oikein', () => {
  const nyt = Date.parse('2026-10-27T14:00:00.000Z');

  // 1. Normaali tila (< 70 % käytetty, esim. 450 kutsua)
  const tila1 = laskeBudjettitilanne({
    nytMs: nyt,
    kiintio: 1500,
    manuaalinenKaytto: { plannerResponses: 450, userInputs: 35 },
  });
  assert.equal(tila1.kiintio, 1500);
  assert.equal(tila1.kaytettyKutsuja, 450);
  assert.equal(tila1.jaljellaKutsuja, 1050);
  assert.equal(tila1.kayttoProsentti, 30.0);
  assert.equal(tila1.taso, HALYTYSTASOT.NORMAALI);
  assert.equal(tila1.saastotila, SAASTOTILAT.NORMAALI);
  assert.equal(tila1.pakettejaJaljella, 35); // 1050 / 30 = 35

  // 2. Varoitustila (70-90 % käytetty, esim. 1100 kutsua)
  const tila2 = laskeBudjettitilanne({
    nytMs: nyt,
    kiintio: 1500,
    manuaalinenKaytto: { plannerResponses: 1100, userInputs: 80 },
  });
  assert.equal(tila2.kaytettyKutsuja, 1100);
  assert.equal(tila2.jaljellaKutsuja, 400);
  assert.equal(tila2.kayttoProsentti, 73.3);
  assert.equal(tila2.taso, HALYTYSTASOT.VAROITUS);
  assert.equal(tila2.saastotila, SAASTOTILAT.SAASTOTILA);
  assert.equal(tila2.pakettejaJaljella, 13); // 400 / 30 = 13

  // 3. Kriittinen tila (> 90 % käytetty, esim. 1400 kutsua)
  const tila3 = laskeBudjettitilanne({
    nytMs: nyt,
    kiintio: 1500,
    manuaalinenKaytto: { plannerResponses: 1400, userInputs: 100 },
  });
  assert.equal(tila3.kaytettyKutsuja, 1400);
  assert.equal(tila3.jaljellaKutsuja, 100);
  assert.equal(tila3.kayttoProsentti, 93.3);
  assert.equal(tila3.taso, HALYTYSTASOT.KRIITTINEN);
  assert.equal(tila3.saastotila, SAASTOTILAT.KRIITTINEN_SAASTO);
  assert.equal(tila3.pakettejaJaljella, 3);

  // 4. Ylitetty tila (>= 1500 kutsua)
  const tila4 = laskeBudjettitilanne({
    nytMs: nyt,
    kiintio: 1500,
    manuaalinenKaytto: { plannerResponses: 1550, userInputs: 110 },
  });
  assert.equal(tila4.kaytettyKutsuja, 1550);
  assert.equal(tila4.jaljellaKutsuja, 0);
  assert.equal(tila4.taso, HALYTYSTASOT.YLITETTY);
  assert.equal(tila4.saastotila, SAASTOTILAT.KRIITTINEN_SAASTO);
  assert.equal(tila4.pakettejaJaljella, 0);
});

test('laskeBudjettitilanne: laskee kulutustahdin ja ennusteen loogisesti', () => {
  const nyt = Date.parse('2026-10-27T14:00:00.000Z');
  const tila = laskeBudjettitilanne({
    nytMs: nyt,
    kiintio: 1500,
    manuaalinenKaytto: 600,
  });

  assert.ok(tila.kutsutPerTunti > 0);
  assert.ok(tila.sallittuKutsutPerTunti > 0);
  assert.ok(tila.ennusteLopputulos > 0);
  assert.equal(typeof tila.riittaakoBudjetti, 'boolean');
});

test('laskeBudjettitilanne: skannaa todelliset transkriptitiedostot hakemistosta', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-brain-test-'));
  const conv1 = join(d, 'c1', '.system_generated', 'logs');
  const conv2 = join(d, 'c2', '.system_generated', 'logs');
  mkdirSync(conv1, { recursive: true });
  mkdirSync(conv2, { recursive: true });

  const nyt = Date.parse('2026-10-27T14:00:00.000Z');

  // Istunto 1: scopes siirto git
  writeFileSync(
    join(conv1, 'transcript.jsonl'),
    [
      JSON.stringify({ created_at: '2026-10-27T10:00:00.000Z', type: 'USER_INPUT', content: 'SKOOPPI: scopes siirto git\n/pura' }),
      JSON.stringify({ created_at: '2026-10-27T10:01:00.000Z', type: 'PLANNER_RESPONSE' }),
      JSON.stringify({ created_at: '2026-10-27T10:02:00.000Z', type: 'PLANNER_RESPONSE' }),
    ].join('\n')
  );

  // Istunto 2: infra expresso
  writeFileSync(
    join(conv2, 'transcript.jsonl'),
    [
      JSON.stringify({ created_at: '2026-10-27T11:00:00.000Z', type: 'USER_INPUT', content: 'SKOOPPI: infra expresso\n/pura' }),
      JSON.stringify({ created_at: '2026-10-27T11:01:00.000Z', type: 'PLANNER_RESPONSE' }),
      JSON.stringify({ created_at: '2026-10-27T11:02:00.000Z', type: 'PLANNER_RESPONSE' }),
      JSON.stringify({ created_at: '2026-10-27T11:03:00.000Z', type: 'PLANNER_RESPONSE' }),
    ].join('\n')
  );

  const tila = laskeBudjettitilanne({ brainDir: d, nytMs: nyt, kiintio: 1500 });
  assert.equal(tila.userInputs, 2);
  assert.equal(tila.plannerResponses, 5);
  assert.equal(tila.skooppiKulutus['scopes siirto git'], 2);
  assert.equal(tila.skooppiKulutus['infra expresso'], 3);
});

test('arvioiIstunnonBudjetti: seuraa paketin kutsukattoa ja antaa suosituksen', () => {
  // 1. Normaali tila, vähän kutsuja -> VIHREA
  const a1 = arvioiIstunnonBudjetti({ kaytetytKutsut: 12 });
  assert.equal(a1.status, 'VIHREA');
  assert.equal(a1.tavoite, TAVOITE_PAKETTI_KUTSUJA);
  assert.ok(a1.suositus.includes('normaalia'));

  // 2. Normaali tila, tavoite saavutettu -> KELTAINEN
  const a2 = arvioiIstunnonBudjetti({ kaytetytKutsut: 32 });
  assert.equal(a2.status, 'KELTAINEN');
  assert.ok(a2.suositus.includes('Tavoitebudjetti saavutettu'));

  // 3. Normaali tila, maksimi ylitetty -> YLITETTY
  const a3 = arvioiIstunnonBudjetti({ kaytetytKutsut: 65 });
  assert.equal(a3.status, 'YLITETTY');
  assert.ok(a3.suositus.includes('Budjettikatto ylittynyt'));

  // 4. Säästötilassa paketille on matalampi tavoite (25) ja maksimi (40)
  const a4 = arvioiIstunnonBudjetti({ kaytetytKutsut: 26, saastotila: SAASTOTILAT.SAASTOTILA });
  assert.equal(a4.tavoite, 25);
  assert.equal(a4.status, 'KELTAINEN');

  // 5. Kriittisessä säästötilassa katto on erittäin matala (10/15)
  const a5 = arvioiIstunnonBudjetti({ kaytetytKutsut: 11, saastotila: SAASTOTILAT.KRIITTINEN_SAASTO });
  assert.equal(a5.tavoite, 10);
  assert.equal(a5.status, 'KELTAINEN');
});

test('muotoileBudjettiRaportti: muodostaa oikean sisällön ja lyhyt-muodon', () => {
  const nyt = Date.parse('2026-10-27T14:00:00.000Z');
  const tila = laskeBudjettitilanne({
    nytMs: nyt,
    kiintio: 1500,
    manuaalinenKaytto: {
      plannerResponses: 620,
      userInputs: 45,
      skooppiKulutus: {
        'scopes2 ydin': 250,
        'scopes siirto git': 80,
      },
    },
  });

  // Pitkä raportti
  const raportti = muotoileBudjettiRaportti(tila);
  assert.ok(raportti.includes('# Scopes Economy — 1500 Kutsun Vuorokausibudjetti'));
  assert.ok(raportti.includes('Kokonaiskiintiö'));
  assert.ok(raportti.includes('1500 kutsua / vrk'));
  assert.ok(raportti.includes('620 kutsua'));
  assert.ok(raportti.includes('880 kutsua'));
  assert.ok(raportti.includes('Vaihe- ja istuntobudjetit'));
  assert.ok(raportti.includes('scopes2 ydin'));

  // Skooppikohtainen raportti
  const skRaportti = muotoileBudjettiRaportti(tila, { skooppi: 'scopes2 ydin' });
  assert.ok(skRaportti.includes("Skoopin 'scopes2 ydin' kulutus"));
  assert.ok(skRaportti.includes('Käytetty tänään: 250 kutsua'));

  // Lyhyt muoto
  const lyhyt = muotoileBudjettiRaportti(tila, { lyhyt: true });
  assert.ok(lyhyt.startsWith('🟢 AGY 1500 Budjetti:'));
  assert.ok(lyhyt.includes('620/1500'));
  assert.ok(lyhyt.includes('Jäljellä: 880'));
});

test('budjetti.mjs CLI: toimii komentoriviltä ja tukee --json ja --lyhyt -valitsimia', () => {
  const cliPolku = join(process.cwd(), 'scopes/siirto/economy/budjetti.mjs');

  // 1. Oletustuloste (markdown)
  const out1 = execFileSync('node', [cliPolku], { encoding: 'utf8' });
  assert.ok(out1.includes('# Scopes Economy — 1500 Kutsun Vuorokausibudjetti'));

  // 2. JSON-tuloste
  const out2 = execFileSync('node', [cliPolku, '--json'], { encoding: 'utf8' });
  const parsed = JSON.parse(out2);
  assert.equal(parsed.kiintio, 1500);
  assert.ok('kaytettyKutsuja' in parsed);
  assert.ok('jaljellaKutsuja' in parsed);

  // 3. Lyhyt-tuloste
  const out3 = execFileSync('node', [cliPolku, '--lyhyt'], { encoding: 'utf8' });
  assert.ok(out3.includes('AGY 1500 Budjetti:'));
});
