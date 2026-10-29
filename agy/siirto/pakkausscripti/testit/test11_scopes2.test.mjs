// SIIRTO-SCOPES2 (scopes siirto scopes2 19.10.2026): pakkaus johtaa scopes2-skoopin hakemiston scopes2/-juuresta.
// Ennen tätä `scopes2 ydin` johdettiin muotoon scopes/scopes2/ydin (pakkaa-hybridi, louhija) tai scopes/scopes2/ydin/** (harkinta).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { onPerheenSkooppi, skoopinHakemisto } from '../skooppipolku.mjs';
import { maaritaLoppuPolut, taydennaSkoopinMetadatat } from '../pakkaa-hybridi.mjs';
import { haaSkoopinPolut, louhiSeuraavaHead } from '../louhija.mjs';
import { muodostaKehote, syntetisoiAnalyysi } from '../harkinta.mjs';

describe('skooppipolku', () => {
  it('juurisana on hakemisto: scopes ja scopes2', () => {
    assert.equal(skoopinHakemisto('scopes agy siirto'), 'scopes/agy/siirto');
    assert.equal(skoopinHakemisto('scopes'), 'scopes');
    assert.equal(skoopinHakemisto('scopes2'), 'scopes2');
    assert.equal(skoopinHakemisto('scopes2 ydin'), 'scopes2/ydin');
    assert.equal(skoopinHakemisto(''), '');
  });
  it('perhe: scopes ja scopes2, ei claude eikä scopes3', () => {
    for (const s of ['scopes', 'scopes macos', 'scopes2', 'scopes2 adapteri']) assert.equal(onPerheenSkooppi(s), true, s);
    for (const s of ['claude siirto', 'scopes3', 'scopesx ydin', '']) assert.equal(onPerheenSkooppi(s), false, s);
  });
});

describe('scopes2-skoopin pakkauspolut', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'pakkaus-scopes2-'));
  mkdirSync(join(juuri, 'scopes2', 'ydin'), { recursive: true });
  writeFileSync(join(juuri, 'scopes2', 'ydin', 'REKISTERI.md'),
    '# scopes2/ydin/REKISTERI.md\n\nSEURAAVA PAKETTI: T-16-G — pilotti — polut: scopes2/ydin/** — aloitus: /pura scopes2 ydin\n');
  writeFileSync(join(juuri, 'scopes2', 'ydin', 'HISTORIA.md'), '# historia\n');

  it('pakkaa-hybridi: commit-polut scopes2/ydin/-alla', () => {
    assert.deepEqual(maaritaLoppuPolut('scopes2 ydin'), ['scopes2/ydin/REKISTERI.md']);
    assert.deepEqual(taydennaSkoopinMetadatat('scopes2 ydin', [], juuri), ['scopes2/ydin/REKISTERI.md', 'scopes2/ydin/HISTORIA.md']);
  });
  it('louhija: skoopin polut ja SEURAAVA-rivi scopes2/ydin/REKISTERI.md:stä', () => {
    assert.deepEqual(haaSkoopinPolut('scopes2 ydin', juuri), ['scopes2/ydin']);
    assert.match(louhiSeuraavaHead('scopes2 ydin', juuri) ?? '', /^SEURAAVA PAKETTI: T-16-G/);
  });
  it('harkinta: kehote ja varasynteesi nimeävät scopes2/ydin', () => {
    const faktat = { skooppi: 'scopes2 ydin', git: {} };
    assert.match(muodostaKehote(faktat), /scopes2\/ydin/);
    assert.doesNotMatch(muodostaKehote(faktat), /scopes\/scopes2/);
    assert.doesNotMatch(JSON.stringify(syntetisoiAnalyysi(faktat)), /scopes\/scopes2/);
  });
  it('vanha scopes-perhe ennallaan', () => {
    assert.deepEqual(maaritaLoppuPolut('scopes agy siirto'), ['scopes/agy/siirto/REKISTERI.md']);
    assert.deepEqual(haaSkoopinPolut('scopes macos', juuri), ['scopes/macos', 'scopes/shared']);
  });
});
