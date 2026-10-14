// node --test scopes/localregister/lr.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { avaimet, luoLaite, pilko, tiivisteet, tuoRekisteri, tulosta, valiin } from './lr.mjs';

const REK = `# x/REKISTERI.md

Tilanne: 14.10.2026

SEURAAVA PAKETTI: A — tee jotain

## Päätökset

- **Käyttäjä:** yksi
  jatkorivi
- kaksi

## Avoimet asiat

| Asia | Tila |
|---|---|
| a | b |
| c | d |

\`\`\`
- ei lista

## ei otsikko
\`\`\`
vapaa kappale
toinen rivi`;

test('pilkonta on häviötön ja rivitasoinen', () => {
  const osat = pilko(REK);
  assert.equal(osat.map((o) => o.sisalto).join(''), REK);
  const lajit = osat.map((o) => o.laji);
  assert.deepEqual(lajit, ['otsikko', 'tilanne', 'seuraava', 'osio', 'paatos', 'paatos', 'osio', 'taulukko-otsake', 'avoin', 'avoin', 'koodi', 'kappale']);
  assert.equal(osat[4].sisalto, '- **Käyttäjä:** yksi\n  jatkorivi\n');
});

test('alkuun tyhjät rivit ja rivinvaihdoton loppu säilyvät', () => {
  for (const t of ['\n\nteksti', 'a\n\n\n', '', '|x|\n']) assert.equal(pilko(t).map((o) => o.sisalto).join(''), t);
});

test('järjestysavaimet: tasaväli ja väliin lisäys', () => {
  const k = avaimet(1000);
  assert.deepEqual([...k].sort(), k);
  assert.equal(new Set(k).size, 1000);
  for (const a of k) assert.ok(!a.endsWith('0'));
  let lista = ['m'];
  for (let i = 0; i < 300; i++) {
    const j = (i * 7919) % (lista.length + 1);
    const uusi = valiin(j ? lista[j - 1] : '', j < lista.length ? lista[j] : null);
    lista.splice(j, 0, uusi);
  }
  assert.deepEqual([...lista].sort(), lista);
  assert.equal(new Set(lista).size, lista.length);
});

test('tuonti, tulostus ja tiiviste', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'testi');
  tuoRekisteri(juuri, laite, 'x/REKISTERI.md', REK, { commit: 'abc' }, '2026-10-14T00:00:00Z');
  laite.tallenna();
  assert.equal(tulosta(juuri, 'x/REKISTERI.md'), REK);
  assert.throws(() => tuoRekisteri(juuri, laite, 'x/REKISTERI.md', REK, {}), /jo tuotu/);
  const t = tiivisteet(juuri);
  assert.match(t.juuri, /^[0-9a-f]{64}$/);
  assert.deepEqual(Object.keys(t.rekisterit), ['x/REKISTERI.md']);
  assert.equal(tiivisteet(juuri).juuri, t.juuri);
});
