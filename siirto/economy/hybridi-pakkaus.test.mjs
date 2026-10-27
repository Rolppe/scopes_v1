// scopes/siirto/economy/hybridi-pakkaus.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import {
  selvitaPakkausStrategia,
  muodostaPakkausKomento,
  laskePakkausSaasto,
  muotoileHybridiOhje,
  PAKKAUS_SKRIPTI_POLKU,
} from './hybridi-pakkaus.mjs';
import { luoEconomyPalvelu } from '../../palvelu/economy.mjs';

test('selvitaPakkausStrategia: ratkaisee strategian ja polut eri skooppiperheille', () => {
  // Scopes 1 perhe
  const s1 = selvitaPakkausStrategia('scopes siirto economy');
  assert.equal(s1.strategia, 'hybridi');
  assert.equal(s1.hakemisto, 'scopes/siirto/economy');
  assert.equal(s1.rekisteri, 'scopes/siirto/economy/REKISTERI.md');
  assert.equal(s1.rekisteriOlemassa, true);
  assert.match(s1.komento, /pakkaa-hybridi\.mjs "scopes siirto economy" --vahvistettu/);

  // Scopes2 perhe
  const s2 = selvitaPakkausStrategia('scopes2 ydin');
  assert.equal(s2.strategia, 'hybridi');
  assert.equal(s2.hakemisto, 'scopes2/ydin');
  assert.equal(s2.rekisteri, 'scopes2/ydin/REKISTERI.md');
  assert.equal(s2.rekisteriOlemassa, true);

  // Claude perhe
  const c1 = selvitaPakkausStrategia('claude siirto pakkaa');
  assert.equal(c1.strategia, 'hybridi');
  assert.equal(c1.hakemisto, 'claude/siirto/pakkaa');
  assert.equal(c1.rekisteri, 'claude/siirto/pakkaa/REKISTERI.md');
  assert.equal(c1.rekisteriOlemassa, true);

  // Infra perhe (alaskooppi omalla rekisterillä)
  const i1 = selvitaPakkausStrategia('infra expresso');
  assert.equal(i1.strategia, 'hybridi');
  assert.equal(i1.hakemisto, 'Infra/iot/expresso');
  assert.equal(i1.rekisteri, 'Infra/iot/expresso/REKISTERI.md');
  assert.equal(i1.rekisteriOlemassa, true);

  // Infra perhe (jaettu paarekisteri)
  const i2 = selvitaPakkausStrategia('infra linux');
  assert.equal(i2.strategia, 'hybridi');
  assert.equal(i2.hakemisto, 'Infra');
  assert.equal(i2.rekisteri, 'Infra/paarekisteri.md');
  assert.equal(i2.rekisteriOlemassa, true);
});

test('muodostaPakkausKomento: muodostaa oikeat liput ja komentorivin', () => {
  const k1 = muodostaPakkausKomento('scopes siirto economy');
  assert.equal(k1, 'node scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs "scopes siirto economy" --vahvistettu');

  const k2 = muodostaPakkausKomento('infra expresso', { vaihda: true, viesti: 'feat: valmis paketti' });
  assert.equal(k2, 'node scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs "infra expresso" --vahvistettu --vaihda -m "feat: valmis paketti"');

  const k3 = muodostaPakkausKomento('claude siirto', { ilmanMallia: true, vahvistettu: false });
  assert.equal(k3, 'node scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs "claude siirto" --ilman-mallia');

  const k4 = muodostaPakkausKomento('scopes context', { malli: 'gemini-3.8-flash' });
  assert.equal(k4, 'node scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs "scopes context" --vahvistettu --malli gemini-3.8-flash');
});

test('laskePakkausSaasto: tuottaa loogiset ja oikeat säästölaskelmat', () => {
  const s = laskePakkausSaasto({
    istuntojaPerVrk: 20,
    vanhaKutsujaPerPakkaus: 5,
    hybridiKutsujaPerPakkaus: 1,
    kiintioYhteensa: 1500,
  });

  assert.equal(s.istuntojaPerVrk, 20);
  assert.equal(s.vanhaYhteensa, 100);
  assert.equal(s.hybridiYhteensa, 20);
  assert.equal(s.saastoYhteensa, 80);
  assert.equal(s.saastoPerPakkaus, 4.0);
  assert.equal(s.osuusKiintiosta, 5.3); // 80 / 1500 = 5.333%
});

test('muotoileHybridiOhje: tuottaa selkeän markdown-ohjeen', () => {
  const ohje = muotoileHybridiOhje('scopes siirto economy');
  assert.match(ohje, /## Deterministinen Hybridipakkaus/);
  assert.match(ohje, /scopes\/agy\/siirto\/pakkausscripti\/pakkaa-hybridi\.mjs "scopes siirto economy" --vahvistettu/);
  assert.match(ohje, /--vaihda/);
  assert.match(ohje, /Säästö:/);
  assert.match(ohje, /1500 kutsun kiintiöstä/);
});

test('economy palvelu: hybridiPakkaus integroitu taustapalveluun', () => {
  const economy = luoEconomyPalvelu();
  const res = economy.hybridiPakkaus('scopes siirto economy');
  assert.ok(res);
  assert.equal(res.skooppi, 'scopes siirto economy');
  assert.equal(res.strategia.strategia, 'hybridi');
  assert.ok(res.saasto.saastoYhteensa > 0);
  assert.match(res.ohje, /Deterministinen Hybridipakkaus/);

  const resTeksti = economy.hybridiPakkaus('scopes siirto economy', { muoto: 'teksti' });
  assert.equal(typeof resTeksti.teksti, 'string');
  assert.match(resTeksti.teksti, /pakkaa-hybridi\.mjs/);
});
