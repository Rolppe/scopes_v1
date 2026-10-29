// Automaatiotesti: Untracked-tiedostot ja uudet hakemistot git-louhinnassa (-uall)
// Varmistaa, että uudet tiedostot listataan yksittäisinä tiedostopolkuina eikä pelkkänä "dir/" -merkintänä.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { louhiGit, louhiKaikki } from '../louhija.mjs';

/**
 * Luo väliaikaisen alustetun git-repositorion testiä varten.
 */
function luoTestiRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'git-untracked-test-'));
  execFileSync('git', ['init', '-b', 'main'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Testi Kayttaja'], { cwd: dir });

  // Luodaan alkusitoumus, jotta HEAD on olemassa rev-parse- ja diffStat-kutsuille
  writeFileSync(join(dir, 'README.md'), '# Testirepo\n', 'utf8');
  execFileSync('git', ['add', 'README.md'], { cwd: dir });
  execFileSync('git', ['commit', '-m', 'chore: initial commit'], { cwd: dir });

  return dir;
}

test('test4: uusi hakemisto ja useita untracked-tiedostoja listautuvat yksittäisinä tiedostoina', () => {
  const repo = luoTestiRepo();
  try {
    // Luodaan uusi hakemisto ja useita tiedostoja sinne
    const uusiHakemisto = join(repo, 'uusi_moduuli');
    mkdirSync(uusiHakemisto, { recursive: true });
    writeFileSync(join(uusiHakemisto, 'eka.ts'), 'export const eka = 1;\n', 'utf8');
    writeFileSync(join(uusiHakemisto, 'toka.json'), '{"arvo": 2}\n', 'utf8');
    writeFileSync(join(uusiHakemisto, 'kolmas.md'), '# Kolmas tiedosto\n', 'utf8');

    const gitTiedot = louhiGit(repo);

    // Varmistetaan, että kaikki kolme tiedostoa ovat mukana
    assert.ok(gitTiedot.muutetut.includes('uusi_moduuli/eka.ts'), 'eka.ts puuttuu muutetut-listasta');
    assert.ok(gitTiedot.muutetut.includes('uusi_moduuli/toka.json'), 'toka.json puuttuu muutetut-listasta');
    assert.ok(gitTiedot.muutetut.includes('uusi_moduuli/kolmas.md'), 'kolmas.md puuttuu muutetut-listasta');

    // Varmistetaan, ettei pelkkä hakemistomerkintä 'uusi_moduuli/' tai 'uusi_moduuli' ole listalla
    assert.equal(gitTiedot.muutetut.includes('uusi_moduuli/'), false, 'Pelkkä dir/ ei saa olla listalla');
    assert.equal(gitTiedot.muutetut.includes('uusi_moduuli'), false, 'Pelkkä hakemiston nimi ei saa olla listalla');

    // Yksikään polku ei saa päättyä kauttaviivaan
    const hakemistomerkinnat = gitTiedot.muutetut.filter((p) => p.endsWith('/'));
    assert.deepEqual(hakemistomerkinnat, [], 'Muutetut-listalla ei saa olla kauttaviivaan päättyviä hakemistoja');

    // Tarkistetaan myös status-teksti: sisältää tiedostot, ei vain hakemistoa
    assert.ok(gitTiedot.status.includes('uusi_moduuli/eka.ts'));
    assert.ok(gitTiedot.status.includes('uusi_moduuli/toka.json'));
    assert.ok(gitTiedot.status.includes('uusi_moduuli/kolmas.md'));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test4: syvä hakemistohierarkia ja sisäkkäiset untracked-hakemistot listataan tarkasti', () => {
  const repo = luoTestiRepo();
  try {
    // Luodaan useita syviä hakemistotasoja
    const syva1 = join(repo, 'src', 'ominaisuus', 'api');
    const syva2 = join(repo, 'src', 'ominaisuus', 'ui');
    const syva3 = join(repo, 'docs', 'arkkitehtuuri');
    mkdirSync(syva1, { recursive: true });
    mkdirSync(syva2, { recursive: true });
    mkdirSync(syva3, { recursive: true });

    writeFileSync(join(syva1, 'reitti.js'), 'export default {};\n', 'utf8');
    writeFileSync(join(syva2, 'Nappi.jsx'), 'export const Nappi = null;\n', 'utf8');
    writeFileSync(join(syva3, 'kaavio.puml'), '@startuml\n@enduml\n', 'utf8');

    const gitTiedot = louhiGit(repo);

    assert.equal(gitTiedot.muutetut.length, 3);
    assert.ok(gitTiedot.muutetut.includes('src/ominaisuus/api/reitti.js'));
    assert.ok(gitTiedot.muutetut.includes('src/ominaisuus/ui/Nappi.jsx'));
    assert.ok(gitTiedot.muutetut.includes('docs/arkkitehtuuri/kaavio.puml'));

    // Varmistetaan ettei välitasojen hakemistoja ole listalla
    const kielletyt = ['src/', 'src', 'src/ominaisuus/', 'docs/', 'docs'];
    for (const k of kielletyt) {
      assert.equal(gitTiedot.muutetut.includes(k), false, `Välitason hakemisto ${k} ei saa olla listalla`);
    }
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test4: sekamuutokset (muokattu, stagattu, juuri-untracked ja uuden hakemiston untracked)', () => {
  const repo = luoTestiRepo();
  try {
    // 1. Muokataan olemassa olevaa seurattua tiedostoa
    writeFileSync(join(repo, 'README.md'), '# Testirepo - Päivitetty\n', 'utf8');

    // 2. Luodaan uusi stagattu tiedosto
    writeFileSync(join(repo, 'stagattu.txt'), 'Stagattu tiedosto\n', 'utf8');
    execFileSync('git', ['add', 'stagattu.txt'], { cwd: repo });

    // 3. Untracked-tiedosto suoraan juuressa
    writeFileSync(join(repo, 'juuri_untracked.txt'), 'Juuri\n', 'utf8');

    // 4. Untracked-tiedostoja uudessa alihakemistossa
    const uusiDir = join(repo, 'uusi_paketti', 'alihakemisto');
    mkdirSync(uusiDir, { recursive: true });
    writeFileSync(join(uusiDir, 'apuri.js'), 'export function apu() {}\n', 'utf8');
    writeFileSync(join(uusiDir, 'tyylit.css'), 'body { margin: 0; }\n', 'utf8');

    const gitTiedot = louhiGit(repo);

    assert.ok(gitTiedot.muutetut.includes('README.md'), 'Muokattu seurattu tiedosto puuttuu');
    assert.ok(gitTiedot.muutetut.includes('stagattu.txt'), 'Stagattu tiedosto puuttuu');
    assert.ok(gitTiedot.muutetut.includes('juuri_untracked.txt'), 'Juuritason untracked-tiedosto puuttuu');
    assert.ok(gitTiedot.muutetut.includes('uusi_paketti/alihakemisto/apuri.js'), 'Uuden hakemiston apuri.js puuttuu');
    assert.ok(gitTiedot.muutetut.includes('uusi_paketti/alihakemisto/tyylit.css'), 'Uuden hakemiston tyylit.css puuttuu');

    // Ei hakemistomerkintöjä
    assert.equal(gitTiedot.muutetut.includes('uusi_paketti/'), false);
    assert.equal(gitTiedot.muutetut.includes('uusi_paketti/alihakemisto/'), false);
    assert.equal(gitTiedot.muutetut.some((p) => p.endsWith('/')), false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test4: erikoismerkit, välilyönnit ja piilotiedostot untracked-hakemistoissa', () => {
  const repo = luoTestiRepo();
  try {
    const hakemistoValilyonilla = join(repo, 'uusi kansio', 'toinen taso');
    mkdirSync(hakemistoValilyonilla, { recursive: true });

    writeFileSync(join(hakemistoValilyonilla, 'tiedosto nimessä välilyönti.txt'), 'data\n', 'utf8');
    writeFileSync(join(hakemistoValilyonilla, '.piilotettu_konfig'), 'secret=1\n', 'utf8');
    writeFileSync(join(hakemistoValilyonilla, 'versio-1.0.0+build.42.json'), '{}\n', 'utf8');

    const gitTiedot = louhiGit(repo);

    assert.ok(gitTiedot.muutetut.includes('uusi kansio/toinen taso/tiedosto nimessä välilyönti.txt'));
    assert.ok(gitTiedot.muutetut.includes('uusi kansio/toinen taso/.piilotettu_konfig'));
    assert.ok(gitTiedot.muutetut.includes('uusi kansio/toinen taso/versio-1.0.0+build.42.json'));
    assert.equal(gitTiedot.muutetut.includes('uusi kansio/'), false);
    assert.equal(gitTiedot.muutetut.some((p) => p.endsWith('/')), false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test4: louhiKaikki jakaa uuden hakemiston untracked-tiedostot skoopin ja vieraiden välillä', async () => {
  const repo = luoTestiRepo();
  try {
    // Luodaan skoopin mukainen polkurakenne ja sinne uusi alihakemisto tiedostoineen
    const skooppiPolku = join(repo, 'scopes', 'testi', 'skooppi', 'komponentit');
    mkdirSync(skooppiPolku, { recursive: true });
    writeFileSync(join(skooppiPolku, 'Koodi.js'), 'export const a = 1;\n', 'utf8');
    writeFileSync(join(skooppiPolku, 'Koodi.test.js'), 'test();\n', 'utf8');

    // Luodaan skoopin ulkopuolinen uusi hakemisto ja tiedosto
    const vierasPolku = join(repo, 'vieraat', 'muutokset');
    mkdirSync(vierasPolku, { recursive: true });
    writeFileSync(join(vierasPolku, 'vieras.txt'), 'ulkopuolinen\n', 'utf8');

    const faktat = await louhiKaikki({
      skooppi: 'scopes testi skooppi',
      juuri: repo,
    });

    // Skoopin omat muutetut tiedostot listattuina yksittäisinä tiedostoina
    assert.ok(faktat.git.skoopinMuutetut.includes('scopes/testi/skooppi/komponentit/Koodi.js'));
    assert.ok(faktat.git.skoopinMuutetut.includes('scopes/testi/skooppi/komponentit/Koodi.test.js'));
    assert.equal(faktat.git.skoopinMuutetut.includes('scopes/testi/skooppi/komponentit/'), false);

    // Skoopin ulkopuoliset muutetut tiedostot listattuina yksittäisinä tiedostoina
    assert.ok(faktat.git.vieraatMuutetut.includes('vieraat/muutokset/vieras.txt'));
    assert.equal(faktat.git.vieraatMuutetut.includes('vieraat/muutokset/'), false);

    // Kumpikaan lista ei sisällä hakemistomerkintöjä
    assert.equal(faktat.git.skoopinMuutetut.some((p) => p.endsWith('/')), false);
    assert.equal(faktat.git.vieraatMuutetut.some((p) => p.endsWith('/')), false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('test4: osoitetaan ero ilman -uall vs -uall louhinnassa', () => {
  const repo = luoTestiRepo();
  try {
    const uusiHakemisto = join(repo, 'vertailu_kansio');
    mkdirSync(uusiHakemisto, { recursive: true });
    writeFileSync(join(uusiHakemisto, 'a.txt'), 'a\n', 'utf8');
    writeFileSync(join(uusiHakemisto, 'b.txt'), 'b\n', 'utf8');

    // Ilman -uall -lippua git status --porcelain palauttaa vain '?? vertailu_kansio/\0'
    const raakaIlmanUall = execFileSync('git', ['status', '--porcelain=v1', '-z'], {
      cwd: repo,
      encoding: 'utf8',
    });
    const osatIlmanUall = raakaIlmanUall.split('\0').filter(Boolean);
    const polutIlmanUall = osatIlmanUall.map((o) => o.slice(3));
    assert.deepEqual(polutIlmanUall, ['vertailu_kansio/'], 'Ilman -uall lippua git palauttaa vain hakemistopolun');

    // louhiGit käyttää -uall -lippua, joten se palauttaa yksittäiset tiedostot
    const gitTiedot = louhiGit(repo);
    assert.deepEqual(
      gitTiedot.muutetut.sort(),
      ['vertailu_kansio/a.txt', 'vertailu_kansio/b.txt'].sort(),
      'louhiGit palauttaa täsmälliset yksittäiset tiedostopolut'
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
