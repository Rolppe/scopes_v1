// Automaatiotesti: Git-louhinnan rajatapaukset (louhiGit ja louhiKaikki)
// Testaa puhtaan työtilan, Detached HEAD -tilan, tyhjän repositorion (0 committia)
// sekä sisäkkäiset hakemistopolut ja useat untracked-tiedostot.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { louhiGit, louhiKaikki } from '../louhija.mjs';

/**
 * Luo väliaikaisen alustetun git-repositorion testiä varten.
 * @param {boolean} luoAlkuCommit - Tehdäänkö heti alkusitoumus (HEAD olemassa)
 */
function luoTestiRepo(luoAlkuCommit = true) {
  const dir = mkdtempSync(join(tmpdir(), 'git-rajatapaus-test-'));
  execFileSync('git', ['init', '-b', 'main'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Testi Kayttaja'], { cwd: dir });

  if (luoAlkuCommit) {
    writeFileSync(join(dir, 'README.md'), '# Alkuperainen testirepo\n', 'utf8');
    execFileSync('git', ['add', 'README.md'], { cwd: dir });
    execFileSync('git', ['commit', '-m', 'chore: initial commit'], { cwd: dir });
  }

  return dir;
}

/**
 * Siivoaa väliaikaisen testirepositorion levyltä turvallisesti.
 */
function siivoaRepo(dir) {
  if (dir) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Hiljennetään mahdolliset siivousvirheet
    }
  }
}

describe('Test 9: Git-louhinnan rajatapaukset', () => {

  // =========================================================================
  // 1. Puhdas git-työpuu ilman muutoksia
  // =========================================================================
  describe('1. Puhdas git-työpuu ilman muutoksia (muutetut tyhjä)', () => {
    it('louhiGit palauttaa puhtaassa tilassa haaran ja login, mutta muutetut tyhjänä', () => {
      const repo = luoTestiRepo(true);
      try {
        const tulos = louhiGit(repo);

        assert.equal(tulos.haara, 'main', 'Haaran nimen tulisi olla main');
        assert.equal(tulos.status, '', 'Puhtaassa työtilassa git status --short on tyhjä');
        assert.equal(tulos.diffStat, '', 'Puhtaassa työtilassa git diff HEAD on tyhjä');
        assert.ok(tulos.log.includes('chore: initial commit'), 'Git-login tulisi sisältää alkusitoumus');
        assert.deepEqual(tulos.muutetut, [], 'Muutetut-listan tulee olla tyhjä');
        assert.equal(tulos.virhe, undefined, 'Virhettä ei saa olla asetettu');
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiKaikki palauttaa puhtaassa tilassa tyhjät skoopinMuutetut ja vieraatMuutetut -listat', async () => {
      const repo = luoTestiRepo(true);
      try {
        const faktat = await louhiKaikki({
          skooppi: 'scopes oma projekti',
          juuri: repo,
        });

        assert.equal(typeof faktat, 'object', 'louhiKaikki palauttaa olion');
        assert.equal(faktat.git.haara, 'main', 'Haara säilyy main-haarana');
        assert.equal(faktat.git.status, '', 'Status on tyhjä');
        assert.equal(faktat.git.diffStat, '', 'DiffStat on tyhjä');
        assert.deepEqual(faktat.git.muutetut, [], 'Git muutetut on tyhjä');
        assert.deepEqual(faktat.git.skoopinMuutetut, [], 'skoopinMuutetut on tyhjä puhtaassa työtilassa');
        assert.deepEqual(faktat.git.vieraatMuutetut, [], 'vieraatMuutetut on tyhjä puhtaassa työtilassa');
      } finally {
        siivoaRepo(repo);
      }
    });
  });

  // =========================================================================
  // 2. Detached HEAD -tila
  // =========================================================================
  describe('2. Detached HEAD -tila', () => {
    it('louhiGit puhtaassa Detached HEAD -tilassa tunnistaa HEAD-tunnisteen eikä kaadu', () => {
      const repo = luoTestiRepo(true);
      try {
        // Siirrytään detached HEAD -tilaan
        execFileSync('git', ['checkout', '--detach', 'HEAD'], { cwd: repo });

        const tulos = louhiGit(repo);

        // rev-parse --abbrev-ref HEAD antaa 'HEAD' detached tilassa
        assert.equal(tulos.haara, 'HEAD', 'Detached HEAD -tilassa haaran tulee olla HEAD');
        assert.equal(tulos.status, '', 'Status on tyhjä puhtaassa detached HEAD -tilassa');
        assert.equal(tulos.diffStat, '', 'DiffStat on tyhjä ilman työpuun muutoksia');
        assert.ok(tulos.log.includes('chore: initial commit'), 'Logi toimii myös detached HEAD -tilassa');
        assert.deepEqual(tulos.muutetut, [], 'Muutetut on tyhjä puhtaassa detached HEAD -tilassa');
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiGit Detached HEAD -tilassa poimii muokatut, stagatut ja untracked-tiedostot oikein', () => {
      const repo = luoTestiRepo(true);
      try {
        execFileSync('git', ['checkout', '--detach', 'HEAD'], { cwd: repo });

        // 1. Muokataan olemassa olevaa seurattua tiedostoa
        writeFileSync(join(repo, 'README.md'), '# Päivitetty Detached HEAD -tilassa\n', 'utf8');

        // 2. Uusi stagattu tiedosto
        writeFileSync(join(repo, 'stagattu.txt'), 'Detached stagattu\n', 'utf8');
        execFileSync('git', ['add', 'stagattu.txt'], { cwd: repo });

        // 3. Uusi untracked tiedosto
        writeFileSync(join(repo, 'untracked.txt'), 'Detached untracked\n', 'utf8');

        const tulos = louhiGit(repo);

        assert.equal(tulos.haara, 'HEAD', 'Detached HEAD -tila säilyy tunnistettuna');
        assert.ok(tulos.status.includes('README.md'), 'Status sisältää muokatun tiedoston');
        assert.ok(tulos.status.includes('stagattu.txt'), 'Status sisältää stagatun tiedoston');
        assert.ok(tulos.status.includes('untracked.txt'), 'Status sisältää untracked-tiedoston');
        assert.ok(tulos.diffStat.length > 0, 'diffStat ei ole tyhjä kun HEADia vasten on muutoksia');

        assert.ok(tulos.muutetut.includes('README.md'), 'README.md löytyy muutetut-listalta');
        assert.ok(tulos.muutetut.includes('stagattu.txt'), 'stagattu.txt löytyy muutetut-listalta');
        assert.ok(tulos.muutetut.includes('untracked.txt'), 'untracked.txt löytyy muutetut-listalta');
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiKaikki Detached HEAD -tilassa luokittelee muutokset skoopin ja vieraiden välillä kaatumatta', async () => {
      const repo = luoTestiRepo(true);
      try {
        execFileSync('git', ['checkout', '--detach', 'HEAD'], { cwd: repo });

        // Luodaan skooppitiedosto ja vieras tiedosto
        const skooppiHakemisto = join(repo, 'scopes', 'testi', 'skooppi');
        mkdirSync(skooppiHakemisto, { recursive: true });
        writeFileSync(join(skooppiHakemisto, 'tiedosto.ts'), 'export const a = 1;\n', 'utf8');

        const vierasHakemisto = join(repo, 'muualla');
        mkdirSync(vierasHakemisto, { recursive: true });
        writeFileSync(join(vierasHakemisto, 'ulkoinen.json'), '{"ok": true}\n', 'utf8');

        const faktat = await louhiKaikki({
          skooppi: 'scopes testi skooppi',
          juuri: repo,
        });

        assert.equal(faktat.git.haara, 'HEAD', 'Detached HEAD pysyy HEAD-arvona louhiKaikki-tuloksessa');
        assert.deepEqual(faktat.git.skoopinMuutetut, ['scopes/testi/skooppi/tiedosto.ts']);
        assert.deepEqual(faktat.git.vieraatMuutetut, ['muualla/ulkoinen.json']);
        assert.equal(faktat.git.muutetut.length, 2);
      } finally {
        siivoaRepo(repo);
      }
    });
  });

  // =========================================================================
  // 3. Tyhjä repositorio ilman aiempia committeja
  // =========================================================================
  describe('3. Tyhjä repositorio ilman aiempia committeja (0 committia)', () => {
    it('louhiGit täysin tyhjässä repositoriossa ei kaadu ja palauttaa tyhjän login ja diffStatin', () => {
      const repo = luoTestiRepo(false); // Ei alkusitoumusta!
      try {
        const tulos = louhiGit(repo);

        // Tyhjässä repositoriossa rev-parse heittää poikkeuksen, mutta branch --show-current palauttaa haaran
        assert.equal(tulos.haara, 'main', 'Tyhjän repositorion oletushaaran tulee olla main');
        assert.equal(tulos.log, '', 'Tyhjän repositorion git-log tulee olla tyhjä merkkijono ilman kaatumista');
        assert.equal(tulos.diffStat, '', 'Tyhjän repositorion diffStat tulee olla tyhjä merkkijono ilman kaatumista');
        assert.equal(tulos.status, '', 'Tyhjässä työtilassa status on tyhjä');
        assert.deepEqual(tulos.muutetut, [], 'Muutetut on tyhjä');
        assert.equal(tulos.virhe, undefined, 'Virhettä ei aseteta');
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiGit tyhjässä repositoriossa untracked- ja stagattujen tiedostojen kanssa', () => {
      const repo = luoTestiRepo(false); // Ei vielä committeja
      try {
        // Luodaan tiedosto ja stagataan se
        writeFileSync(join(repo, 'stagattu_eka.txt'), 'Ensimmäinen staged\n', 'utf8');
        execFileSync('git', ['add', 'stagattu_eka.txt'], { cwd: repo });

        // Luodaan toinen tiedosto untracked-tilaan
        writeFileSync(join(repo, 'untracked_eka.txt'), 'Ensimmäinen untracked\n', 'utf8');

        const tulos = louhiGit(repo);

        assert.equal(tulos.haara, 'main', 'Haara on edelleen main');
        assert.equal(tulos.log, '', 'Logi on edelleen tyhjä koska committeja ei ole tehty');
        assert.equal(tulos.diffStat, '', 'diffStat on tyhjä ilman HEAD-viittausta');
        assert.ok(tulos.status.includes('stagattu_eka.txt'), 'Status listaa stagatun tiedoston');
        assert.ok(tulos.status.includes('untracked_eka.txt'), 'Status listaa untracked-tiedoston');

        assert.ok(tulos.muutetut.includes('stagattu_eka.txt'), 'stagattu_eka.txt löytyy muutetut-listalta');
        assert.ok(tulos.muutetut.includes('untracked_eka.txt'), 'untracked_eka.txt löytyy muutetut-listalta');
        assert.equal(tulos.muutetut.length, 2, 'Tasan kaksi tiedostoa muutetut-listalla');
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiKaikki tyhjässä repositoriossa selviää ilman poikkeuksia ja käsittelee skoopin tiedostot', async () => {
      const repo = luoTestiRepo(false); // 0 committia
      try {
        // Luodaan skoopin untracked-tiedosto ja ulkopuolinen untracked-tiedosto
        const skooppiHakemisto = join(repo, 'scopes', 'nolla', 'repo');
        mkdirSync(skooppiHakemisto, { recursive: true });
        writeFileSync(join(skooppiHakemisto, 'uusi_alku.txt'), 'alku\n', 'utf8');

        writeFileSync(join(repo, 'juuritiedosto.md'), '# Juuri\n', 'utf8');

        const faktat = await louhiKaikki({
          skooppi: 'scopes nolla repo',
          juuri: repo,
        });

        assert.equal(faktat.git.haara, 'main');
        assert.equal(faktat.git.log, '', 'Logi tyhjä');
        assert.equal(faktat.git.diffStat, '', 'DiffStat tyhjä');
        assert.equal(faktat.seuraavaHead, null, 'seuraavaHead on null koska HEADia ei ole');
        assert.deepEqual(faktat.git.skoopinMuutetut, ['scopes/nolla/repo/uusi_alku.txt']);
        assert.deepEqual(faktat.git.vieraatMuutetut, ['juuritiedosto.md']);
      } finally {
        siivoaRepo(repo);
      }
    });
  });

  // =========================================================================
  // 4. Sisäkkäiset hakemistopolut ja useat samanaikaiset untracked-tiedostot
  // =========================================================================
  describe('4. Sisäkkäiset hakemistopolut ja useat samanaikaiset untracked-tiedostot', () => {
    it('louhiGit poimii syvälle sisäkkäiset untracked-tiedostot yksittäisinä tiedostopolkuina ilman kansiomerkintöjä', () => {
      const repo = luoTestiRepo(true);
      try {
        // Luodaan useita syviä sisäkkäisiä polkuja samanaikaisesti
        const polut = [
          join(repo, 'src', 'core', 'engine', 'pipeline', 'worker.ts'),
          join(repo, 'src', 'core', 'engine', 'pipeline', 'types.d.ts'),
          join(repo, 'packages', 'frontend', 'components', 'button', 'index.tsx'),
          join(repo, 'packages', 'frontend', 'components', 'button', 'button.module.css'),
          join(repo, 'docs', 'deep', 'nested', 'sub', 'folder', 'spec.md'),
          join(repo, 'scripts', 'ci', 'helpers', 'lint.sh'),
          join(repo, 'tiedosto_juuressa.txt'),
        ];

        for (const p of polut) {
          mkdirSync(join(p, '..'), { recursive: true });
          writeFileSync(p, `// Sisaltoa tiedostolle ${p}\n`, 'utf8');
        }

        const tulos = louhiGit(repo);

        // Odotetut suhteelliset polut
        const odotetut = [
          'src/core/engine/pipeline/worker.ts',
          'src/core/engine/pipeline/types.d.ts',
          'packages/frontend/components/button/index.tsx',
          'packages/frontend/components/button/button.module.css',
          'docs/deep/nested/sub/folder/spec.md',
          'scripts/ci/helpers/lint.sh',
          'tiedosto_juuressa.txt',
        ];

        assert.equal(tulos.muutetut.length, odotetut.length, 'Kaikki tiedostot löydetty muutetut-listalta');

        for (const o of odotetut) {
          assert.ok(tulos.muutetut.includes(o), `Odotettu tiedosto puuttuu: ${o}`);
        }

        // Varmistetaan että ei yhtäkään pelkkää hakemistomerkintää
        const kielletytHakemistot = [
          'src', 'src/', 'src/core', 'src/core/', 'packages', 'packages/',
          'docs', 'docs/', 'scripts', 'scripts/',
        ];
        for (const kh of kielletytHakemistot) {
          assert.equal(tulos.muutetut.includes(kh), false, `Hakemistomerkintä ei saa olla listalla: ${kh}`);
        }

        // Yksikään polku ei saa päättyä kauttaviivaan
        assert.equal(tulos.muutetut.some((p) => p.endsWith('/')), false, 'Polut eivät saa päättyä kauttaviivaan');
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiGit käsittelee sisäkkäiset polut erikoismerkeillä, välilyönneillä ja pisteillä', () => {
      const repo = luoTestiRepo(true);
      try {
        const erikoispolut = [
          join(repo, 'kansio valilla', 'ali hakemisto', 'tiedosto nimessa valit.txt'),
          join(repo, 'src', '.piilotettu_kansio', '.konfig.json'),
          join(repo, 'moduuli.nimi', 'v1.2.3+rev4', 'bundle.min.js'),
        ];

        for (const p of erikoispolut) {
          mkdirSync(join(p, '..'), { recursive: true });
          writeFileSync(p, 'sisalto\n', 'utf8');
        }

        const tulos = louhiGit(repo);

        assert.ok(tulos.muutetut.includes('kansio valilla/ali hakemisto/tiedosto nimessa valit.txt'));
        assert.ok(tulos.muutetut.includes('src/.piilotettu_kansio/.konfig.json'));
        assert.ok(tulos.muutetut.includes('moduuli.nimi/v1.2.3+rev4/bundle.min.js'));
        assert.equal(tulos.muutetut.some((p) => p.endsWith('/')), false);
      } finally {
        siivoaRepo(repo);
      }
    });

    it('louhiKaikki jakaa monimutkaiset sisäkkäiset polut tarkasti skoopin ja vieraiden välillä', async () => {
      const repo = luoTestiRepo(true);
      try {
        const skooppiTiedostot = [
          join(repo, 'scopes', 'syva', 'rakenne', 'src', 'index.ts'),
          join(repo, 'scopes', 'syva', 'rakenne', 'src', 'utils', 'helper.ts'),
          join(repo, 'scopes', 'syva', 'rakenne', 'docs', 'guide.md'),
        ];

        const vierasTiedostot = [
          join(repo, 'scopes', 'toinen', 'rakenne', 'a.txt'),
          join(repo, 'packages', 'core', 'lib.js'),
          join(repo, 'juuri.md'),
        ];

        for (const p of [...skooppiTiedostot, ...vierasTiedostot]) {
          mkdirSync(join(p, '..'), { recursive: true });
          writeFileSync(p, 'data\n', 'utf8');
        }

        const faktat = await louhiKaikki({
          skooppi: 'scopes syva rakenne',
          juuri: repo,
        });

        assert.equal(faktat.git.skoopinMuutetut.length, 3);
        assert.ok(faktat.git.skoopinMuutetut.includes('scopes/syva/rakenne/src/index.ts'));
        assert.ok(faktat.git.skoopinMuutetut.includes('scopes/syva/rakenne/src/utils/helper.ts'));
        assert.ok(faktat.git.skoopinMuutetut.includes('scopes/syva/rakenne/docs/guide.md'));

        assert.equal(faktat.git.vieraatMuutetut.length, 3);
        assert.ok(faktat.git.vieraatMuutetut.includes('scopes/toinen/rakenne/a.txt'));
        assert.ok(faktat.git.vieraatMuutetut.includes('packages/core/lib.js'));
        assert.ok(faktat.git.vieraatMuutetut.includes('juuri.md'));

        // Yksikään listan merkintä ei saa olla hakemisto
        assert.equal(faktat.git.skoopinMuutetut.some((p) => p.endsWith('/')), false);
        assert.equal(faktat.git.vieraatMuutetut.some((p) => p.endsWith('/')), false);
      } finally {
        siivoaRepo(repo);
      }
    });
  });

  // =========================================================================
  // 5. Ei-git-hakemisto ja virheenkäsittely
  // =========================================================================
  describe('5. Ei-git-hakemisto ja virhesietoisuus', () => {
    it('louhiGit ei heitä poikkeusta tavallisessa hakemistossa ilman git-repositoriota', () => {
      const tavallinenHakemisto = mkdtempSync(join(tmpdir(), 'ei-git-hakemisto-'));
      try {
        const tulos = louhiGit(tavallinenHakemisto);

        assert.equal(tulos.haara, '', 'Ei-git-hakemistossa haara on tyhjä merkkijono');
        assert.equal(tulos.status, '', 'Ei-git-hakemistossa status on tyhjä');
        assert.equal(tulos.diffStat, '', 'Ei-git-hakemistossa diffStat on tyhjä');
        assert.equal(tulos.log, '', 'Ei-git-hakemistossa log on tyhjä');
        assert.deepEqual(tulos.muutetut, [], 'Ei-git-hakemistossa muutetut on tyhjä taulukko');
      } finally {
        siivoaRepo(tavallinenHakemisto);
      }
    });

    it('louhiKaikki toimii ei-git-hakemistossa kaatumatta', async () => {
      const tavallinenHakemisto = mkdtempSync(join(tmpdir(), 'ei-git-kaikki-'));
      try {
        const faktat = await louhiKaikki({
          skooppi: 'scopes olematon',
          juuri: tavallinenHakemisto,
        });

        assert.equal(typeof faktat, 'object');
        assert.equal(faktat.git.haara, '');
        assert.deepEqual(faktat.git.muutetut, []);
        assert.deepEqual(faktat.git.skoopinMuutetut, []);
        assert.deepEqual(faktat.git.vieraatMuutetut, []);
      } finally {
        siivoaRepo(tavallinenHakemisto);
      }
    });
  });

});
