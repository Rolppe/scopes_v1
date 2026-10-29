// Automaatiotesti: Scopes-sääntö 15 ja V-008 -mukainen skooppieristys (test3)
//
// Varmistaa, että:
// 1. louhija.mjs jakaa muuttuneet tiedostot tarkasti skoopin omiin (skoopinMuutetut) ja vieraisiin (vieraatMuutetut).
// 2. pakkaa-hybridi.mjs rajaa commit-listan (loppuPolut) vain skoopin omiin tiedostoihin.
// 3. Vieraista tiedostoista tulostetaan säännön 15 ja V-008 mukainen varoitus, ja ne jätetään työtilaan ilman committia.
// 4. Jos skoopin omia tiedostoja ei ole muuttunut, loppuPolut sisältää ainoastaan skoopin oman REKISTERI.md -tiedoston.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  jaaSkoopinMuutokset,
  louhiGit,
  louhiKaikki,
} from '../louhija.mjs';

import {
  maaritaLoppuPolut,
  muodostaVierasVaroitus,
  varoitaVieraistaMuutoksista,
} from '../pakkaa-hybridi.mjs';

/**
 * Luo väliaikaisen eristetyn git-repositorion testejä varten.
 */
function luoTestiRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'git-vieraat-skoopit-test-'));
  execFileSync('git', ['init', '-b', 'main'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Testi Kayttaja'], { cwd: dir });

  // Alustetaan perusrakenne ja alkusitoumus
  writeFileSync(join(dir, 'README.md'), '# Testirepo\n', 'utf8');
  execFileSync('git', ['add', 'README.md'], { cwd: dir });
  execFileSync('git', ['commit', '-m', 'chore: initial commit'], { cwd: dir });

  return dir;
}

// ============================================================================
// Osa 1: louhija.mjs — Tiedostojen jako (jaaSkoopinMuutokset)
// ============================================================================

test('test3: jaaSkoopinMuutokset erottelee skoopin omat ja vieraat tiedostot oikein', () => {
  const muutetut = [
    // Skoopin agy/siirto/pakkausscripti omia tiedostoja
    'scopes/agy/siirto/pakkausscripti/louhija.mjs',
    'scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs',
    'scopes/agy/siirto/pakkausscripti/testit/test3_vieraat_skoopit.test.mjs',
    'scopes/agy/siirto/pakkausscripti/REKISTERI.md',
    // Vieraita tiedostoja muissa skooppeissa
    'scopes/palvelu/lahteet.mjs',
    'scopes/palvelu/toiminnot.mjs',
    'scopes/context/REKISTERI.md',
    'scopes/viat/HISTORIA.md',
    // Vieraita tiedostoja claude- ja infra-poluissa
    'claude/siirto/tools/pakkaa-alku.mjs',
    'claude/siirto/tools/aja-siirtaja.sh',
    'Infra/skills/pakkaa/SKILL.md',
    'README.md',
  ];

  const skooppi = 'scopes agy siirto pakkausscripti';
  const { skoopinMuutetut, vieraatMuutetut } = jaaSkoopinMuutokset(muutetut, skooppi);

  // Skoopin omat tiedostot
  assert.equal(skoopinMuutetut.length, 4, 'Skoopin omia tiedostoja pitäisi olla täsmälleen 4');
  assert.ok(skoopinMuutetut.includes('scopes/agy/siirto/pakkausscripti/louhija.mjs'));
  assert.ok(skoopinMuutetut.includes('scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs'));
  assert.ok(skoopinMuutetut.includes('scopes/agy/siirto/pakkausscripti/testit/test3_vieraat_skoopit.test.mjs'));
  assert.ok(skoopinMuutetut.includes('scopes/agy/siirto/pakkausscripti/REKISTERI.md'));

  // Vieraat tiedostot
  assert.equal(vieraatMuutetut.length, 8, 'Vieraita tiedostoja pitäisi olla täsmälleen 8');
  assert.ok(vieraatMuutetut.includes('scopes/palvelu/lahteet.mjs'));
  assert.ok(vieraatMuutetut.includes('scopes/palvelu/toiminnot.mjs'));
  assert.ok(vieraatMuutetut.includes('scopes/context/REKISTERI.md'));
  assert.ok(vieraatMuutetut.includes('scopes/viat/HISTORIA.md'));
  assert.ok(vieraatMuutetut.includes('claude/siirto/tools/pakkaa-alku.mjs'));
  assert.ok(vieraatMuutetut.includes('claude/siirto/tools/aja-siirtaja.sh'));
  assert.ok(vieraatMuutetut.includes('Infra/skills/pakkaa/SKILL.md'));
  assert.ok(vieraatMuutetut.includes('README.md'));

  // Kumpikaan lista ei saa sisältää toisen listan tiedostoja
  for (const oma of skoopinMuutetut) {
    assert.equal(vieraatMuutetut.includes(oma), false, `Oma tiedosto ${oma} ei saa olla vieraiden listalla`);
  }
  for (const vieras of vieraatMuutetut) {
    assert.equal(skoopinMuutetut.includes(vieras), false, `Vieras tiedosto ${vieras} ei saa olla omien listalla`);
  }
});

test('test3: jaaSkoopinMuutokset käsittelee skoopin nimen variaatiot ja prefiksin reunatapaukset', () => {
  const muutetut = [
    'scopes/palvelu/lahteet.mjs',
    'scopes/palvelu/purkajat.mjs',
    'scopes/palvelu-extra/tiedosto.js', // Eri skooppi samanlaisella alulla
    'scopes/palvelin/kayttoraja.js',     // Eri skooppi
    'claude/siirto/tools/pakkaa-alku.mjs',
  ];

  // 1. Skooppi ilman "scopes "-etuliitettä
  const jako1 = jaaSkoopinMuutokset(muutetut, 'palvelu');
  assert.deepEqual(jako1.skoopinMuutetut, [
    'scopes/palvelu/lahteet.mjs',
    'scopes/palvelu/purkajat.mjs',
  ]);
  assert.ok(jako1.vieraatMuutetut.includes('scopes/palvelu-extra/tiedosto.js'), 'Samanalkuinen skooppinimi ei saa sekoittua');
  assert.ok(jako1.vieraatMuutetut.includes('scopes/palvelin/kayttoraja.js'));
  assert.ok(jako1.vieraatMuutetut.includes('claude/siirto/tools/pakkaa-alku.mjs'));

  // 2. Yksiosainen skooppi "scopes viat"
  const viatMuutetut = [
    'scopes/viat/REKISTERI.md',
    'scopes/viat/HISTORIA.md',
    'scopes/viat-arkisto/vanha.md',
    'scopes/palvelu/lahteet.mjs',
  ];
  const jako2 = jaaSkoopinMuutokset(viatMuutetut, 'scopes viat');
  assert.deepEqual(jako2.skoopinMuutetut, [
    'scopes/viat/REKISTERI.md',
    'scopes/viat/HISTORIA.md',
  ]);
  assert.deepEqual(jako2.vieraatMuutetut, [
    'scopes/viat-arkisto/vanha.md',
    'scopes/palvelu/lahteet.mjs',
  ]);

  // 3. Tyhjä tai puuttuva skooppi: kaikki tiedostot ovat vieraita
  const jako3 = jaaSkoopinMuutokset(muutetut, '');
  assert.deepEqual(jako3.skoopinMuutetut, []);
  assert.equal(jako3.vieraatMuutetut.length, muutetut.length);

  const jako4 = jaaSkoopinMuutokset(muutetut, null);
  assert.deepEqual(jako4.skoopinMuutetut, []);
  assert.equal(jako4.vieraatMuutetut.length, muutetut.length);
});

// ============================================================================
// Osa 2: pakkaa-hybridi.mjs — loppuPolut-rajaus ja varoitukset
// ============================================================================

test('test3: maaritaLoppuPolut rajaa commit-listan vain skoopin omiin tiedostoihin', () => {
  const skooppi = 'scopes agy siirto pakkausscripti';
  const omat = [
    'scopes/agy/siirto/pakkausscripti/louhija.mjs',
    'scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs',
  ];

  const loppuPolut = maaritaLoppuPolut(skooppi, omat);

  // Vain skoopin omat tiedostot menevät commit-listalle
  assert.deepEqual(loppuPolut, omat);
  assert.equal(loppuPolut.length, 2);
  assert.ok(!loppuPolut.includes('scopes/palvelu/lahteet.mjs'));
  assert.ok(!loppuPolut.includes('claude/siirto/tools/pakkaa-alku.mjs'));
});

test('test3: maaritaLoppuPolut sisältää vain kyseisen skoopin REKISTERI.md:n kun omia muutoksia ei ollut', () => {
  // Tapaus 1: scopes agy siirto pakkausscripti
  const loppuPolut1 = maaritaLoppuPolut('scopes agy siirto pakkausscripti', []);
  assert.deepEqual(loppuPolut1, ['scopes/agy/siirto/pakkausscripti/REKISTERI.md']);

  // Tapaus 2: ilman "scopes "-etuliitettä
  const loppuPolut2 = maaritaLoppuPolut('agy siirto pakkausscripti', []);
  assert.deepEqual(loppuPolut2, ['scopes/agy/siirto/pakkausscripti/REKISTERI.md']);

  // Tapaus 3: muu skooppi, esim. scopes palvelu
  const loppuPolut3 = maaritaLoppuPolut('scopes palvelu', []);
  assert.deepEqual(loppuPolut3, ['scopes/palvelu/REKISTERI.md']);

  // Tapaus 4: scopes viat
  const loppuPolut4 = maaritaLoppuPolut('scopes viat', []);
  assert.deepEqual(loppuPolut4, ['scopes/viat/REKISTERI.md']);

  // Tapaus 5: null tai undefined omien muutosten listana
  const loppuPolut5 = maaritaLoppuPolut('scopes context', null);
  assert.deepEqual(loppuPolut5, ['scopes/context/REKISTERI.md']);
});

test('test3: muodostaVierasVaroitus ja varoitaVieraistaMuutoksista noudattavat Sääntöä 15 ja V-008', () => {
  const vieraat = [
    'scopes/palvelu/lahteet.mjs',
    'claude/siirto/tools/pakkaa-alku.mjs',
  ];

  const varoitukset = muodostaVierasVaroitus(vieraat);

  // Varoitusviestin rakenne ja sisältö
  assert.equal(varoitukset.length, 4);
  assert.equal(
    varoitukset[0],
    'Varoitus (Scopes-sääntö 15, V-008): Jätetään commitista pois 2 vierasta tiedostoa:'
  );
  assert.equal(varoitukset[1], '  - scopes/palvelu/lahteet.mjs');
  assert.equal(varoitukset[2], '  - claude/siirto/tools/pakkaa-alku.mjs');
  assert.equal(
    varoitukset[3],
    'Ohje: Kirjaa vieraan skoopin muutokset omistajalle (/vika) tai pakkaa kyseinen skooppi erikseen.'
  );

  // Testataan tulostus loggerilla
  const lokiRivit = [];
  const logger = (viesti) => lokiRivit.push(viesti);
  varoitaVieraistaMuutoksista(vieraat, logger);
  assert.deepEqual(lokiRivit, varoitukset);

  // Jos vieraita ei ole, varoitusta ei tulosteta
  const tyhjaLoki = [];
  varoitaVieraistaMuutoksista([], (msg) => tyhjaLoki.push(msg));
  assert.equal(tyhjaLoki.length, 0);
});

// ============================================================================
// Osa 3: Git-työpuulouhinta ja työtilan eristys (integroitu yksikkötestaus)
// ============================================================================

test('test3: louhiKaikki jakaa todellisen työpuun muutokset omiin ja vieraisiin', async () => {
  const repo = luoTestiRepo();
  try {
    // 1. Luodaan oman skoopin hakemisto ja tiedostoja
    const omaDir = join(repo, 'scopes', 'agy', 'siirto', 'pakkausscripti');
    mkdirSync(omaDir, { recursive: true });
    writeFileSync(join(omaDir, 'louhija.mjs'), '// louhija koodi\n', 'utf8');
    writeFileSync(join(omaDir, 'REKISTERI.md'), '# Rekisteri\n', 'utf8');

    // 2. Luodaan vieraiden skooppien ja työkalujen hakemistot ja tiedostot
    const vierasSkooppiDir = join(repo, 'scopes', 'palvelu');
    const claudeDir = join(repo, 'claude', 'siirto', 'tools');
    mkdirSync(vierasSkooppiDir, { recursive: true });
    mkdirSync(claudeDir, { recursive: true });

    writeFileSync(join(vierasSkooppiDir, 'lahteet.mjs'), '// lahteet\n', 'utf8');
    writeFileSync(join(claudeDir, 'pakkaa-alku.mjs'), '// pakkaa alku\n', 'utf8');

    // Ajetaan louhiKaikki skoopille "scopes agy siirto pakkausscripti"
    const faktat = await louhiKaikki({
      skooppi: 'scopes agy siirto pakkausscripti',
      juuri: repo,
    });

    // Varmistetaan omien tiedostojen eristys
    assert.equal(faktat.git.skoopinMuutetut.length, 2);
    assert.ok(faktat.git.skoopinMuutetut.includes('scopes/agy/siirto/pakkausscripti/louhija.mjs'));
    assert.ok(faktat.git.skoopinMuutetut.includes('scopes/agy/siirto/pakkausscripti/REKISTERI.md'));

    // Varmistetaan vieraiden tiedostojen eristys
    assert.equal(faktat.git.vieraatMuutetut.length, 2);
    assert.ok(faktat.git.vieraatMuutetut.includes('scopes/palvelu/lahteet.mjs'));
    assert.ok(faktat.git.vieraatMuutetut.includes('claude/siirto/tools/pakkaa-alku.mjs'));

    // Varmistetaan, että pakkaa-hybridi rajaa commit-polut oikein näistä faktoista
    const loppuPolut = maaritaLoppuPolut(faktat.skooppi, faktat.git.skoopinMuutetut);
    assert.deepEqual(loppuPolut.sort(), faktat.git.skoopinMuutetut.sort());
    assert.ok(!loppuPolut.includes('scopes/palvelu/lahteet.mjs'));
    assert.ok(!loppuPolut.includes('claude/siirto/tools/pakkaa-alku.mjs'));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test3: vieraat tiedostot jätetään koskemattomina työtilaan ilman committia', () => {
  const repo = luoTestiRepo();
  try {
    // Alustetaan omat tiedostot ja vieraat tiedostot
    const omaDir = join(repo, 'scopes', 'agy', 'siirto', 'pakkausscripti');
    const vierasDir = join(repo, 'scopes', 'palvelu');
    const claudeDir = join(repo, 'claude', 'siirto', 'tools');
    mkdirSync(omaDir, { recursive: true });
    mkdirSync(vierasDir, { recursive: true });
    mkdirSync(claudeDir, { recursive: true });

    // Luodaan REKISTERI.md ja commitoidaan se alkutilaan
    writeFileSync(join(omaDir, 'REKISTERI.md'), '# Rekisteri alku\n', 'utf8');
    execFileSync('git', ['add', '.'], { cwd: repo });
    execFileSync('git', ['commit', '-m', 'chore: baseline'], { cwd: repo });

    // Tehdään muutoksia:
    // 1. Oma muutos: muokataan REKISTERI.md ja luodaan uusi uusi_moduuli.mjs
    writeFileSync(join(omaDir, 'REKISTERI.md'), '# Rekisteri päivitetty\n', 'utf8');
    writeFileSync(join(omaDir, 'uusi_moduuli.mjs'), 'export const uusi = true;\n', 'utf8');

    // 2. Vieras muutos: muokataan vierasta tiedostoa ja luodaan untracked
    writeFileSync(join(vierasDir, 'lahteet.mjs'), '// muokattu vieras tiedosto\n', 'utf8');
    writeFileSync(join(claudeDir, 'pakkaa-alku.mjs'), '// koskematon työkalu\n', 'utf8');

    // Louhitaan git-tila
    const gitTila = louhiGit(repo);
    const { skoopinMuutetut, vieraatMuutetut } = jaaSkoopinMuutokset(
      gitTila.muutetut,
      'scopes agy siirto pakkausscripti'
    );

    // Määritetään loppuPolut
    const loppuPolut = maaritaLoppuPolut('scopes agy siirto pakkausscripti', skoopinMuutetut);

    // Vain skoopin omat tiedostot ovat commit-listalla
    assert.equal(loppuPolut.length, 2);
    assert.ok(loppuPolut.includes('scopes/agy/siirto/pakkausscripti/REKISTERI.md'));
    assert.ok(loppuPolut.includes('scopes/agy/siirto/pakkausscripti/uusi_moduuli.mjs'));
    assert.ok(!loppuPolut.includes('scopes/palvelu/lahteet.mjs'));
    assert.ok(!loppuPolut.includes('claude/siirto/tools/pakkaa-alku.mjs'));

    // Simuloidaan pakkaus: ajetaan git add vain loppuPolut-tiedostoille ja commitoidaan
    execFileSync('git', ['add', ...loppuPolut], { cwd: repo });
    execFileSync('git', ['commit', '-m', 'chore(pakkaus): skooppieristetty pakkaus'], { cwd: repo });

    // Tarkistetaan git status pakkauksen jälkeen:
    // Skoopin omat tiedostot on commitoitu (clean)
    // Vieraat tiedostot ovat YHÄ työtilassa koskemattomina ja commitoimatta!
    const statusJalkeen = louhiGit(repo);
    assert.equal(statusJalkeen.muutetut.length, 2, 'Työtilassa pitää olla jäljellä tasan 2 vierasta tiedostoa');
    assert.ok(statusJalkeen.muutetut.includes('scopes/palvelu/lahteet.mjs'), 'lahteet.mjs on yhä työtilassa');
    assert.ok(statusJalkeen.muutetut.includes('claude/siirto/tools/pakkaa-alku.mjs'), 'pakkaa-alku.mjs on yhä työtilassa');
    assert.ok(
      !statusJalkeen.muutetut.includes('scopes/agy/siirto/pakkausscripti/REKISTERI.md'),
      'REKISTERI.md ei saa enää näkyä muuttuneena'
    );
    assert.ok(
      !statusJalkeen.muutetut.includes('scopes/agy/siirto/pakkausscripti/uusi_moduuli.mjs'),
      'uusi_moduuli.mjs ei saa enää näkyä muuttuneena'
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test3: kun omia tiedostoja ei ollut muuttunut, loppuPolut sisältää vain REKISTERI.md:n ja vieraat säilyvät työtilassa', () => {
  const repo = luoTestiRepo();
  try {
    const omaDir = join(repo, 'scopes', 'agy', 'siirto', 'pakkausscripti');
    const vierasDir = join(repo, 'scopes', 'palvelu');
    mkdirSync(omaDir, { recursive: true });
    mkdirSync(vierasDir, { recursive: true });

    // Luodaan molempiin tiedostot ja commitoidaan ne
    writeFileSync(join(omaDir, 'REKISTERI.md'), '# Rekisteri alkuperäinen\n', 'utf8');
    writeFileSync(join(vierasDir, 'lahteet.mjs'), '# Lahteet alkuperäinen\n', 'utf8');
    execFileSync('git', ['add', '.'], { cwd: repo });
    execFileSync('git', ['commit', '-m', 'chore: baseline'], { cwd: repo });

    // Muokataan VAIN vierasta tiedostoa
    writeFileSync(join(vierasDir, 'lahteet.mjs'), '# Lahteet toisen keskustelun muutos\n', 'utf8');

    // Louhitaan tilanne
    const gitTila = louhiGit(repo);
    assert.deepEqual(gitTila.muutetut, ['scopes/palvelu/lahteet.mjs']);

    const { skoopinMuutetut, vieraatMuutetut } = jaaSkoopinMuutokset(
      gitTila.muutetut,
      'scopes agy siirto pakkausscripti'
    );

    // Omat muutokset ovat tyhjiä
    assert.deepEqual(skoopinMuutetut, []);
    assert.deepEqual(vieraatMuutetut, ['scopes/palvelu/lahteet.mjs']);

    // loppuPolut sisältää ainoastaan oman REKISTERI.md:n
    const loppuPolut = maaritaLoppuPolut('scopes agy siirto pakkausscripti', skoopinMuutetut);
    assert.deepEqual(loppuPolut, ['scopes/agy/siirto/pakkausscripti/REKISTERI.md']);

    // Varoitus vieraasta tiedostosta syntyy oikein
    const varoitukset = muodostaVierasVaroitus(vieraatMuutetut);
    assert.ok(varoitukset[0].includes('1 vierasta tiedostoa'));
    assert.ok(varoitukset[1].includes('scopes/palvelu/lahteet.mjs'));

    // Simuloidaan pakkausvaihetta 3 (aja-siirtaja.sh paketoi), joka päivittää REKISTERI.md:n
    writeFileSync(join(omaDir, 'REKISTERI.md'), '# Rekisteri - paketoitu merkintä\n', 'utf8');

    // Simuloidaan pakkausvaihetta 5: lisätään vain loppuPolut ja commitoidaan
    execFileSync('git', ['add', ...loppuPolut], { cwd: repo });
    execFileSync('git', ['commit', '-m', 'chore(pakkaus): pakkaus vain rekisteripäivityksellä'], { cwd: repo });

    // Vieras tiedosto scopes/palvelu/lahteet.mjs säilyy yhä työtilassa koskemattomana
    const statusJalkeen = louhiGit(repo);
    assert.deepEqual(
      statusJalkeen.muutetut,
      ['scopes/palvelu/lahteet.mjs'],
      'Vieras tiedosto säilyy koskemattomana työtilassa ilman committia'
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
