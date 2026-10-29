// scopes/siirto/git/git-komento.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { ajaGit, suodataTuloste } from './git-komento.mjs';

test('suodataTuloste: poistaa rivit joissa on salaisuuksia (Sääntö 2)', () => {
  const syote = [
    'On branch main',
    'remote: Authorization: Bearer secret12345',
    'Your branch is up to date with origin/main.',
    'env: API_KEY=xyz-987654321',
    'nothing to commit, working tree clean',
    'fatal: Authentication failed for password prompt'
  ].join('\n');

  const suodatettu = suodataTuloste(syote);
  assert.ok(!suodatettu.includes('secret12345'));
  assert.ok(!suodatettu.includes('API_KEY'));
  assert.ok(!suodatettu.includes('password'));
  assert.ok(suodatettu.includes('On branch main'));
  assert.ok(suodatettu.includes('Your branch is up to date'));
  assert.ok(suodatettu.includes('nothing to commit'));
});

test('ajaGit: ajaa todellisen git --version onnistuneesti', async () => {
  const tulos = await ajaGit(['--version']);
  assert.equal(tulos.ok, true);
  assert.equal(tulos.koodi, 0);
  assert.ok(tulos.stdout.startsWith('git version'));
  assert.equal(tulos.aikakatkaisu, false);
});

test('ajaGit: virheellinen alikomento palauttaa ok: false ja koodin != 0', async () => {
  const tulos = await ajaGit(['olematon-alikomento-123']);
  assert.equal(tulos.ok, false);
  assert.notEqual(tulos.koodi, 0);
  assert.ok(tulos.stderr.length > 0 || tulos.stdout.length > 0);
});

test('ajaGit: käsittelee aikakatkaisun oikein', async () => {
  // Luodaan valetoteutus prosessista, joka ei koskaan sulkeudu itsekseen
  const valeprosessi = new EventEmitter();
  valeprosessi.stdout = new EventEmitter();
  valeprosessi.stderr = new EventEmitter();
  let tapettu = false;
  valeprosessi.kill = (signaali) => {
    tapettu = true;
    valeprosessi.emit('close', null, signaali);
  };

  const valespawn = () => valeprosessi;

  const tulos = await ajaGit(['status'], {
    aikakatkaisuMs: 50,
    spawnFn: valespawn
  });

  assert.equal(tapettu, true);
  assert.equal(tulos.aikakatkaisu, true);
  assert.equal(tulos.ok, false);
  assert.equal(tulos.koodi, 124);
});
