// scopes/siirto/git/git-worktree.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

import {
  normalisoiPolku,
  jasennaWorktreePorcelain,
  listaaWorktreet,
  etsiWorktree,
  luoWorktree,
  poistaWorktree,
  lukitseWorktree,
  avaaWorktree,
  siirraWorktree,
  karsiWorktreet,
  luoEristettyWorktree
} from './git-worktree.mjs';

test('jasennaWorktreePorcelain: jäsentää porcelain-tulosteen oikein', () => {
  const teksti = `
worktree ~/repo
HEAD 1111111111111111111111111111111111111111
branch refs/heads/main

worktree ~/repo-branch
HEAD 2222222222222222222222222222222222222222
branch refs/heads/feature/test

worktree ~/repo-detached
HEAD 3333333333333333333333333333333333333333
detached

worktree ~/repo-locked
HEAD 4444444444444444444444444444444444444444
branch refs/heads/locked-dev
locked tyossa oleva ajo

worktree ~/repo-prunable
HEAD 5555555555555555555555555555555555555555
detached
prunable gitdir file points to non-existent location
`;

  const tulos = jasennaWorktreePorcelain(teksti);
  assert.equal(tulos.length, 5);

  // 1. Päätyötila
  assert.equal(tulos[0].polku, '~/repo');
  assert.equal(tulos[0].head, '1111111111111111111111111111111111111111');
  assert.equal(tulos[0].haara, 'main');
  assert.equal(tulos[0].haaraRef, 'refs/heads/main');
  assert.equal(tulos[0].irrotettu, false);
  assert.equal(tulos[0].lukittu, false);
  assert.equal(tulos[0].paatyotila, true);

  // 2. Haara
  assert.equal(tulos[1].polku, '~/repo-branch');
  assert.equal(tulos[1].haara, 'feature/test');
  assert.equal(tulos[1].paatyotila, false);

  // 3. Detached
  assert.equal(tulos[2].polku, '~/repo-detached');
  assert.equal(tulos[2].irrotettu, true);
  assert.equal(tulos[2].haara, null);

  // 4. Locked
  assert.equal(tulos[3].polku, '~/repo-locked');
  assert.equal(tulos[3].lukittu, true);
  assert.equal(tulos[3].lukitussyy, 'tyossa oleva ajo');

  // 5. Prunable
  assert.equal(tulos[4].polku, '~/repo-prunable');
  assert.equal(tulos[4].karsittava, true);
  assert.equal(tulos[4].karsintasyy, 'gitdir file points to non-existent location');
});

test('jasennaWorktreePorcelain: palauttaa tyhjän taulukon tyhjällä syötteellä', () => {
  assert.deepEqual(jasennaWorktreePorcelain(''), []);
  assert.deepEqual(jasennaWorktreePorcelain(null), []);
});

test('Parametrivalidoinnit puuttuville poluille', async () => {
  const lRes = await luoWorktree('');
  assert.equal(lRes.ok, false);
  assert.equal(lRes.koodi, 1);

  const pRes = await poistaWorktree('');
  assert.equal(pRes.ok, false);
  assert.equal(pRes.koodi, 1);

  const lockRes = await lukitseWorktree('');
  assert.equal(lockRes.ok, false);
  assert.equal(lockRes.koodi, 1);

  const unRes = await avaaWorktree('');
  assert.equal(unRes.ok, false);
  assert.equal(unRes.koodi, 1);

  const mRes = await siirraWorktree('', '');
  assert.equal(mRes.ok, false);
  assert.equal(mRes.koodi, 1);

  const eRes = await etsiWorktree('');
  assert.equal(eRes.ok, false);
  assert.equal(eRes.loytyi, false);
});

test('normalisoiPolku: käsittelee tyhjän ja olemattoman polun turvallisesti', () => {
  assert.equal(normalisoiPolku(''), '');
  assert.equal(normalisoiPolku(null), '');
  assert.ok(normalisoiPolku('/olematon/polku/123').includes('/olematon/polku/123'));
});

test('Virhetilanteet: poisto olemattomalle worktreelle palauttaa deterministisen virheen', async () => {
  const pRes = await poistaWorktree('/olematon/wt/polku/xyz', { cwd: process.cwd() });
  assert.equal(pRes.ok, false);
  assert.notEqual(pRes.koodi, 0);
  assert.ok(pRes.virhe && pRes.virhe.length > 0);
});

test('karsiWorktreet: tukee kuiva- ja vanhenemisvalintoja', async () => {
  const res = await karsiWorktreet(process.cwd(), { kuiva: true, vanhenemisaika: 'now' });
  assert.equal(res.ok, true);
  assert.equal(res.koodi, 0);
});

test('Integraatiotesti: worktree-elinkaari (luo, listaa, etsi, lukitse, avaa, siirrä, poista, karsi)', async () => {
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'git-wt-test-repo-'));
  const tmpWt1 = fs.mkdtempSync(path.join(os.tmpdir(), 'git-wt-test-wt1-'));
  const tmpWt2 = path.join(os.tmpdir(), `git-wt-test-wt2-${Date.now()}`);

  try {
    // Alustetaan päärepo ja tehdään vähintään yksi commit
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: tmpRepo });
    execFileSync('git', ['config', 'user.name', 'Worktree Testi'], { cwd: tmpRepo });
    execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: tmpRepo });
    fs.writeFileSync(path.join(tmpRepo, 'tiedosto.txt'), 'alku\n');
    execFileSync('git', ['add', 'tiedosto.txt'], { cwd: tmpRepo });
    execFileSync('git', ['commit', '-m', 'Initial commit'], { cwd: tmpRepo });

    // 1. Listaa alussa (vain päätyötila)
    const alkuListaus = await listaaWorktreet(tmpRepo);
    assert.equal(alkuListaus.ok, true);
    assert.equal(alkuListaus.worktreet.length, 1);
    assert.equal(alkuListaus.worktreet[0].paatyotila, true);

    // 2. Luo toinen worktree
    // Poistetaan ensin tyhjä kansio jotta git worktree add luo sen tai antaa sen olla
    fs.rmSync(tmpWt1, { recursive: true, force: true });
    const luonti = await luoWorktree(tmpWt1, {
      irrotettu: true,
      pohja: 'HEAD',
      cwd: tmpRepo
    });
    assert.equal(luonti.ok, true);
    assert.equal(fs.existsSync(path.join(tmpWt1, 'tiedosto.txt')), true);

    // 3. Listaus sisältää nyt 2 työtilaa
    const tokaListaus = await listaaWorktreet(tmpRepo);
    assert.equal(tokaListaus.ok, true);
    assert.equal(tokaListaus.worktreet.length, 2);

    // 4. Etsitään työtila
    const etsinta = await etsiWorktree(tmpWt1, tmpRepo);
    assert.equal(etsinta.ok, true);
    assert.equal(etsinta.loytyi, true);
    assert.equal(etsinta.worktree.irrotettu, true);

    // 5. Lukitseminen
    const lukitus = await lukitseWorktree(tmpWt1, 'testilukko', { cwd: tmpRepo });
    assert.equal(lukitus.ok, true);

    const lukittuEtsinta = await etsiWorktree(tmpWt1, tmpRepo);
    assert.equal(lukittuEtsinta.ok, true);
    assert.equal(lukittuEtsinta.loytyi, true);
    assert.equal(lukittuEtsinta.worktree.lukittu, true);
    assert.equal(lukittuEtsinta.worktree.lukitussyy, 'testilukko');

    // 6. Avaaminen
    const avaus = await avaaWorktree(tmpWt1, { cwd: tmpRepo });
    assert.equal(avaus.ok, true);

    // 7. Siirtäminen
    const siirto = await siirraWorktree(tmpWt1, tmpWt2, { cwd: tmpRepo });
    assert.equal(siirto.ok, true);
    assert.equal(fs.existsSync(path.join(tmpWt2, 'tiedosto.txt')), true);

    // 8. Poistaminen
    const poisto = await poistaWorktree(tmpWt2, { cwd: tmpRepo });
    assert.equal(poisto.ok, true);

    // 9. Varmistetaan että työtiloja on taas vain 1
    const loppuListaus = await listaaWorktreet(tmpRepo);
    assert.equal(loppuListaus.ok, true);
    assert.equal(loppuListaus.worktreet.length, 1);

    // 10. Karsinta
    const karsinta = await karsiWorktreet(tmpRepo);
    assert.equal(karsinta.ok, true);
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
    try {
      if (fs.existsSync(tmpWt1)) fs.rmSync(tmpWt1, { recursive: true, force: true });
    } catch {
      // ignore
    }
    try {
      if (fs.existsSync(tmpWt2)) fs.rmSync(tmpWt2, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
});

test('Integraatiotesti: luoEristettyWorktree ja automaattinen siivous', async () => {
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'git-wt-eristetty-repo-'));

  try {
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: tmpRepo });
    execFileSync('git', ['config', 'user.name', 'Eristetty Testi'], { cwd: tmpRepo });
    execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: tmpRepo });
    fs.writeFileSync(path.join(tmpRepo, 'tiedosto.txt'), 'juuri\n');
    execFileSync('git', ['add', 'tiedosto.txt'], { cwd: tmpRepo });
    execFileSync('git', ['commit', '-m', 'Initial commit'], { cwd: tmpRepo });

    // Luodaan eristetty worktree uuden haaran kera
    const res = await luoEristettyWorktree({
      cwd: tmpRepo,
      uusiHaara: 'ominaisuus-eristetty',
      pohja: 'HEAD'
    });

    assert.equal(res.ok, true);
    assert.ok(typeof res.polku === 'string' && res.polku.length > 0);
    assert.equal(fs.existsSync(path.join(res.polku, 'tiedosto.txt')), true);

    // Tarkistetaan että worktree näkyy listauksessa
    const listaus = await listaaWorktreet(tmpRepo);
    assert.equal(listaus.worktreet.length, 2);

    // Suoritetaan siivous
    const siivousTulos = await res.siivoa();
    assert.equal(siivousTulos.ok, true);

    // Varmistetaan että työtila ja polku poistuivat
    assert.equal(fs.existsSync(res.polku), false);
    const loppuListaus = await listaaWorktreet(tmpRepo);
    assert.equal(loppuListaus.worktreet.length, 1);
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
});
