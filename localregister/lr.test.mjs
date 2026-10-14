// node --test scopes/localregister/lr.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { avaimet, hae, lueYksikot, luoLaite, pilko, poistaRekisteri, ristiriidat, tiivisteet, tuoRekisteri, tulosta, uudelleentuo, valiin, vastaanota, vertaa } from './lr.mjs';

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

test('uudelleentuonti: muokattu pitää tunnuksen, poistettu saa hautakiven, uusi asettuu väliin', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'testi');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const ennen = Object.fromEntries(lueYksikot(juuri, P).map((y) => [y.sisalto, y]));
  const uusi = REK.replace('| a | b |', '| a | valmis |').replace('- kaksi\n', '- kolme\n- kaksi\n').replace('| c | d |\n', '');
  const t = uudelleentuo(juuri, laite, P, uusi, { commit: 'b' });
  assert.deepEqual(t, { sama: 10, muuttunut: 1, uusi: 1, poistettu: 1, ristiriita: 0 });
  assert.equal(tulosta(juuri, P), uusi);
  const jalkeen = lueYksikot(juuri, P);
  const muokattu = jalkeen.find((y) => y.sisalto === '| a | valmis |\n\n');
  assert.equal(muokattu.id, ennen['| a | b |\n'].id);
  assert.ok(muokattu.versio.testi > ennen['| a | b |\n'].versio.testi);
  assert.equal(jalkeen.find((y) => y.id === ennen['| c | d |\n\n'].id).poistettu, true);
  assert.equal(jalkeen.find((y) => y.sisalto === '- kaksi\n\n').id, ennen['- kaksi\n\n'].id);
  assert.deepEqual(uudelleentuo(juuri, laite, P, uusi, { commit: 'c' }).sama, -1);
  assert.equal(poistaRekisteri(juuri, laite, P), true);
  assert.equal(poistaRekisteri(juuri, laite, P), false);
  uudelleentuo(juuri, laite, P, REK, { commit: 'd' });
  assert.equal(tulosta(juuri, P), REK);
});

test('vertaa: versiovektorit', () => {
  assert.equal(vertaa({ a: 1 }, { a: 1 }), 'sama');
  assert.equal(vertaa({ a: 2, b: 1 }, { a: 1, b: 1 }), 'uudempi');
  assert.equal(vertaa({ a: 1 }, { a: 1, b: 1 }), 'vanhempi');
  assert.equal(vertaa({ a: 2 }, { a: 1, b: 1 }), 'rinnakkainen');
});

test('äpin muokkaus ja gitin muutos samaan riviin = ristiriita, ei ylikirjoitus', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const rivi = lueYksikot(juuri, P).find((y) => y.sisalto === '| a | b |\n');
  // Äppi muokkaa riviä ja lisää uuden rivin.
  const appi = { ...rivi, sisalto: '| a | äppi |\n', versio: { ...rivi.versio, iphone: 1 }, muuttaja: 'iphone' };
  delete appi.lahdeSisalto; delete appi.lahdeVersio;
  const uusiRivi = { id: 'iphone-000002', rekisteri: P, laji: 'avoin', osio: 'Avoimet asiat', jarjestys: valiin(rivi.jarjestys, null).slice(0, 1) + 'zz', sisalto: '| e | f |\n', versio: { iphone: 2 }, poistettu: false };
  const v = vastaanota(juuri, { yksikot: [appi, uusiRivi] });
  assert.equal(v.otettu, 2);
  // Git muuttaa samaa riviä ja toista riviä.
  const git = REK.replace('| a | b |', '| a | git |').replace('- kaksi', '- KAKSI');
  const t = uudelleentuo(juuri, laite, P, git, { commit: 'b' });
  assert.equal(t.ristiriita, 1);
  assert.equal(t.muuttunut, 2);
  assert.equal(tulosta(juuri, P, { lahde: true }), git);
  const nyt = lueYksikot(juuri, P).find((y) => y.id === rivi.id);
  assert.equal(nyt.sisalto, '| a | äppi |\n');
  assert.equal(nyt.rinnakkaiset[0].sisalto, '| a | git |\n');
  assert.equal(ristiriidat(juuri).length, 1);
  assert.match(tulosta(juuri, P), /- KAKSI/);
  assert.match(tulosta(juuri, P), /\| e \| f \|/);
  // Äppi ratkaisee: versio ≥ molempia → ristiriita poistuu.
  const ratkaisu = { ...nyt, sisalto: '| a | yhdistetty |\n', versio: { oneplus: Math.max(nyt.versio.oneplus, nyt.rinnakkaiset[0].versio.oneplus), iphone: 3 } };
  delete ratkaisu.rinnakkaiset;
  assert.deepEqual(vastaanota(juuri, { yksikot: [ratkaisu] }).ristiriidat, []);
  assert.equal(ristiriidat(juuri).length, 0);
  // Vanha versio ei kumoa uutta, ja sama rinnakkainen ei tallennu kahdesti.
  assert.equal(vastaanota(juuri, { yksikot: [appi] }).ohitettu, 1);
  // Seuraava git-muutos samaan riviin on taas ristiriita, koska äppi on koskenut siihen.
  assert.equal(uudelleentuo(juuri, laite, P, git.replace('| a | git |', '| a | git2 |'), { commit: 'c' }).ristiriita, 1);
});

test('vastaanota hylkää vieraat polut ja tunnukset', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  assert.throws(() => vastaanota(juuri, { metat: [{ rekisteri: '../../etc/REKISTERI.md', versio: { a: 1 } }] }), /virheellinen rekisteripolku/);
  assert.throws(() => vastaanota(juuri, { metat: [{ rekisteri: 'x/muu.md', versio: { a: 1 } }] }), /virheellinen rekisteripolku/);
  vastaanota(juuri, { metat: [{ rekisteri: 'y/REKISTERI.md', versio: { iphone: 1 }, poistettu: false }] });
  assert.throws(() => vastaanota(juuri, { yksikot: [{ id: '../x', rekisteri: 'y/REKISTERI.md', versio: {} }] }), /virheellinen tunnus/);
  assert.throws(() => hae(juuri, '/etc/REKISTERI.md', ['a-1']), /virheellinen rekisteripolku/);
});

test('vastaanota hylkää rivinvaihdon taulukkorivissä kirjoittamatta mitään', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const rivi = lueYksikot(juuri, P).find((y) => y.sisalto === '| a | b |\n');
  const ok = { ...rivi, sisalto: '| a | ok |\n', versio: { ...rivi.versio, iphone: 1 } };
  const rikki = { ...rivi, sisalto: '| a | b |\nKoe1\n', versio: { ...rivi.versio, iphone: 2 } };
  for (const y of [ok, rikki]) { delete y.lahdeSisalto; delete y.lahdeVersio; }
  assert.throws(() => vastaanota(juuri, { yksikot: [ok, rikki] }), /rivinvaihto taulukkorivissä/);
  assert.equal(tulosta(juuri, P), REK);
  assert.throws(() => vastaanota(juuri, { yksikot: [{ ...ok, sisalto: '\n| a | b |\nKoe1\n' }] }), /rivinvaihto taulukkorivissä/);
  // Sisennetty jatkorivi listassa ei ole taulukkorivi.
  const alkio = lueYksikot(juuri, P).find((y) => y.laji === 'paatos');
  assert.equal(vastaanota(juuri, { yksikot: [{ ...alkio, sisalto: '- yksi\n  | sisennetty |\n', versio: { ...alkio.versio, iphone: 4 } }] }).otettu, 1);
  // Perässä olevat tyhjät rivit ja otsakkeen kaksi riviä kuuluvat yksikköön.
  assert.equal(vastaanota(juuri, { yksikot: [{ ...ok, sisalto: '| a | ok |\n\n' }] }).otettu, 1);
  const otsake = lueYksikot(juuri, P).find((y) => y.laji === 'taulukko-otsake');
  assert.equal(vastaanota(juuri, { yksikot: [{ ...otsake, sisalto: otsake.sisalto.replace('|', '| X'), versio: { ...otsake.versio, iphone: 3 } }] }).otettu, 1);
});
