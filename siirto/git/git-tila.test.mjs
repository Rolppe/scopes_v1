// scopes/siirto/git/git-tila.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { jasennaPorcelain, lueHaara, lueGitTila } from './git-tila.mjs';

test('jasennaPorcelain: jäsentää porcelain-tulosteen oikein', () => {
  const teksti = [
    ' M scopes/siirto/REKISTERI.md',
    '?? scopes/siirto/git/git-komento.mjs',
    'D  vanha-tiedosto.txt'
  ].join('\n');

  const tulos = jasennaPorcelain(teksti);
  assert.equal(tulos.length, 3);
  assert.deepEqual(tulos[0], { tila: ' M', polku: 'scopes/siirto/REKISTERI.md' });
  assert.deepEqual(tulos[1], { tila: '??', polku: 'scopes/siirto/git/git-komento.mjs' });
  assert.deepEqual(tulos[2], { tila: 'D ', polku: 'vanha-tiedosto.txt' });
});

test('lueHaara: tunnistaa aktiivisen haaran', async () => {
  const { haara, irrotettu } = await lueHaara(process.cwd());
  assert.ok(typeof haara === 'string' && haara.length > 0);
  assert.equal(typeof irrotettu, 'boolean');
});

test('lueGitTila: palauttaa yhtenäisen tilannekuvan repon tilasta', async () => {
  const tila = await lueGitTila(process.cwd());
  assert.equal(tila.ok, true);
  assert.ok(typeof tila.haara === 'string');
  assert.equal(typeof tila.likainen, 'boolean');
  assert.ok(Array.isArray(tila.tiedostot));
  assert.equal(typeof tila.edella, 'number');
  assert.equal(typeof tila.jaljessa, 'number');
});
