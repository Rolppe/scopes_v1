// scopes/siirto/git/git-synkka.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

import {
  onkoLukkovirhe,
  ajaGitUusinnoin,
  tarkistaRemote,
  vertaaHaarat,
  synkkaaFastForward,
  synkkaaPush,
  tarkistaSynkka
} from './git-synkka.mjs';

test('onkoLukkovirhe: tunnistaa gitin tilapäiset lukkovirheet oikein', () => {
  assert.equal(onkoLukkovirhe('fatal: Unable to create .git/index.lock: File exists'), true);
  assert.equal(onkoLukkovirhe("error: cannot lock ref 'refs/heads/main': File exists"), true);
  assert.equal(onkoLukkovirhe('error: could not write index'), true);
  assert.equal(onkoLukkovirhe('error: Your local changes would be overwritten by merge'), true);
  assert.equal(onkoLukkovirhe('fatal: remote origin already exists'), false);
  assert.equal(onkoLukkovirhe(''), false);
  assert.equal(onkoLukkovirhe(null), false);
});

test('ajaGitUusinnoin: yrittää uudelleen lukkovirheen sattuessa ja onnistuu', async () => {
  let yritykset = 0;

  const mockSpawn = () => {
    const prosessi = new EventEmitter();
    prosessi.stdout = new EventEmitter();
    prosessi.stderr = new EventEmitter();

    yritykset += 1;
    setImmediate(() => {
      if (yritykset === 1) {
        prosessi.stderr.emit('data', Buffer.from('fatal: Unable to create .git/index.lock: File exists\n'));
        prosessi.emit('close', 1, null);
      } else {
        prosessi.stdout.emit('data', Buffer.from('git version 2.39.0\n'));
        prosessi.emit('close', 0, null);
      }
    });

    return prosessi;
  };

  const tulos = await ajaGitUusinnoin(['version'], {
    spawnFn: mockSpawn,
    uusinnat: 2,
    viiveMs: 5
  });

  assert.equal(tulos.ok, true);
  assert.equal(tulos.koodi, 0);
  assert.equal(yritykset, 2);
  assert.ok(tulos.stdout.includes('git version'));
});

test('tarkistaRemote: palauttaa ei_remotea kun remotea ei ole', async () => {
  const tulos = await tarkistaRemote('olematon-remote-xyz-123', process.cwd());
  assert.equal(tulos.ok, false);
  assert.equal(tulos.tila, 'ei_remotea');
  assert.ok(tulos.virhe.includes('olematon-remote-xyz-123'));
});

test('vertaaHaarat: palauttaa virheen jos parametrit puuttuvat', async () => {
  const tulos = await vertaaHaarat('', '');
  assert.equal(tulos.ok, false);
  assert.equal(tulos.tila, 'tuntematon');
});

test('synkkaaFastForward: kieltäytyy synkkauksesta jos työpuu on likainen', async () => {
  // Luodaan tilapäinen git-repo likaisella tiedostolla
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-synkka-test-dirty-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: tmpDir });
    execFileSync('git', ['config', 'user.name', 'Testi'], { cwd: tmpDir });
    execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: tmpDir });
    fs.writeFileSync(path.join(tmpDir, 'tiedosto.txt'), 'alkuperainen\n');
    execFileSync('git', ['add', 'tiedosto.txt'], { cwd: tmpDir });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: tmpDir });

    // Tehdään muutos ilman committia
    fs.writeFileSync(path.join(tmpDir, 'tiedosto.txt'), 'muokattu\n');

    const tulos = await synkkaaFastForward(null, 'origin', tmpDir);
    assert.equal(tulos.ok, false);
    assert.equal(tulos.tila, 'likainen_puu');
    assert.ok(tulos.tiedostot.length > 0);
    assert.equal(tulos.muuttui, false);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Integraatiotesti: monilaiteympäristön synkronointi (bare origin, 2 kloonia)', async () => {
  const rootTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'git-multi-device-'));
  const bareDir = path.join(rootTmp, 'remote.git');
  const kone1Dir = path.join(rootTmp, 'kone1');
  const kone2Dir = path.join(rootTmp, 'kone2');

  try {
    // 1. Luodaan bare-keskusrepo
    execFileSync('git', ['init', '--bare', '-q', bareDir]);

    // 2. Alustetaan kone1 ja luodaan ensimmäinen commit
    execFileSync('git', ['clone', '-q', bareDir, kone1Dir]);
    execFileSync('git', ['config', 'user.name', 'Kone 1'], { cwd: kone1Dir });
    execFileSync('git', ['config', 'user.email', 'kone1@example.com'], { cwd: kone1Dir });
    fs.writeFileSync(path.join(kone1Dir, 'README.md'), '# Projekti\n');
    execFileSync('git', ['add', 'README.md'], { cwd: kone1Dir });
    execFileSync('git', ['commit', '-m', 'feat: initial commit'], { cwd: kone1Dir });
    execFileSync('git', ['push', '-q', 'origin', 'HEAD'], { cwd: kone1Dir });

    // 3. Kloonataan kone2
    execFileSync('git', ['clone', '-q', bareDir, kone2Dir]);
    execFileSync('git', ['config', 'user.name', 'Kone 2'], { cwd: kone2Dir });
    execFileSync('git', ['config', 'user.email', 'kone2@example.com'], { cwd: kone2Dir });

    // Kone 2 tarkistaa tilanteen: aluksi ajan tasalla
    const tilaAlussa = await tarkistaSynkka({ cwd: kone2Dir, remote: 'origin' });
    assert.equal(tilaAlussa.ok, true);
    assert.equal(tilaAlussa.tila, 'ajan_tasalla');
    assert.equal(tilaAlussa.raportti, 'ajan tasalla');

    // 4. Kone 1 tekee uuden commitin ja puskee sen
    fs.writeFileSync(path.join(kone1Dir, 'uusi.txt'), 'kone1 uusi tiedosto\n');
    execFileSync('git', ['add', 'uusi.txt'], { cwd: kone1Dir });
    execFileSync('git', ['commit', '-m', 'feat: kone1 lisäys'], { cwd: kone1Dir });
    execFileSync('git', ['push', '-q', 'origin', 'HEAD'], { cwd: kone1Dir });

    // 5. Kone 2 hakee etätilan (hae: true) ja havaitsee olevansa jäljessä
    const tilaJaljessa = await tarkistaSynkka({ cwd: kone2Dir, remote: 'origin', hae: true });
    assert.equal(tilaJaljessa.ok, true);
    assert.equal(tilaJaljessa.tila, 'jaljessa');
    assert.equal(tilaJaljessa.jaljessa, 1);
    assert.equal(tilaJaljessa.edella, 0);
    assert.ok(tilaJaljessa.raportti.includes('jäljessä 1 — pull tarvitaan'));
    assert.equal(tilaJaljessa.toimenpide, 'pull');

    // 6. Kone 2 suorittaa turvallisen fast-forward synkkauksen
    const ffTulos = await synkkaaFastForward(null, 'origin', kone2Dir);
    assert.equal(ffTulos.ok, true);
    assert.equal(ffTulos.tila, 'paivitetty');
    assert.equal(ffTulos.muuttui, true);
    assert.equal(fs.existsSync(path.join(kone2Dir, 'uusi.txt')), true);

    // Kone 2 on nyt ajan tasalla
    const tilaSyncJalkeen = await tarkistaSynkka({ cwd: kone2Dir, remote: 'origin' });
    assert.equal(tilaSyncJalkeen.tila, 'ajan_tasalla');

    // 7. Kone 2 tekee oman commitin ja tarkistaa tilan (edellä 1)
    fs.writeFileSync(path.join(kone2Dir, 'kone2.txt'), 'kone2 dataa\n');
    execFileSync('git', ['add', 'kone2.txt'], { cwd: kone2Dir });
    execFileSync('git', ['commit', '-m', 'feat: kone2 muutos'], { cwd: kone2Dir });

    const tilaEdella = await tarkistaSynkka({ cwd: kone2Dir, remote: 'origin' });
    assert.equal(tilaEdella.tila, 'edella');
    assert.equal(tilaEdella.edella, 1);
    assert.ok(tilaEdella.raportti.includes('edellä 1 — push tarvitaan'));
    assert.equal(tilaEdella.toimenpide, 'push');

    // 8. Kone 2 puskee commitin käyttäen synkkaaPushia
    const pushTulos = await synkkaaPush(null, 'origin', kone2Dir);
    assert.equal(pushTulos.ok, true);
    assert.equal(pushTulos.tila, 'pushattu');
    assert.equal(pushTulos.pushattu, 1);

    // Kone 2 on puskun jälkeen jälleen ajan tasalla
    const tilaPushinJalkeen = await tarkistaSynkka({ cwd: kone2Dir, remote: 'origin' });
    assert.equal(tilaPushinJalkeen.tila, 'ajan_tasalla');
  } finally {
    fs.rmSync(rootTmp, { recursive: true, force: true });
  }
});
