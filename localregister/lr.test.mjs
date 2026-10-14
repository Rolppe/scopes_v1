// node --test scopes/localregister/lr.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tiedostoLukko } from '../../claude/siirto/tools/lukot.mjs';
import { avaimet, hae, lista, lueSiivotut, lueYksikot, luoLaite, pilko, poistaRekisteri, ristiriidat, siivoa, tiivisteet, tuoRekisteri, tulosta, uudelleentuo, valiin, vastaanota, vertaa } from './lr.mjs';

const LR = join(dirname(fileURLToPath(import.meta.url)), 'lr.mjs');

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
  assert.deepEqual(t, { sama: 10, muuttunut: 1, uusi: 1, poistettu: 1, ristiriita: 0, viety: 0 });
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

// LOCALREGISTER-RIVIN-LISAYS: äppi lisää rivin taulukon viimeisen rivin alle kuten Lr.swift `lisaa`: avain
// `valiin`-portilla, ankkurin tyhjä rivi siirtyy uudelle riville. Taulukko pysyy ehjänä, ja gitin myöhempi
// muutos muualla ei siirrä eikä poista äpin riviä.
test('äpin lisäämä rivi taulukon loppuun säilyttää taulukon ja kestää uudelleentuonnin', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const ys = lueYksikot(juuri, P).sort((a, b) => (a.jarjestys < b.jarjestys ? -1 : 1));
  const k = ys.findIndex((y) => y.sisalto === '| c | d |\n\n');
  const ankkuri = { ...ys[k], sisalto: '| c | d |\n', versio: { ...ys[k].versio, iphone: 1 }, muuttaja: 'iphone' };
  delete ankkuri.lahdeSisalto; delete ankkuri.lahdeVersio;
  const uusi = { id: 'iphone-000002', rekisteri: P, laji: 'avoin', osio: 'Avoimet asiat', jarjestys: valiin(ys[k].jarjestys, ys[k + 1].jarjestys), sisalto: '| e | f |\n\n', versio: { iphone: 2 }, poistettu: false };
  assert.equal(vastaanota(juuri, { yksikot: [ankkuri, uusi] }).otettu, 2);
  const odotettu = REK.replace('| c | d |\n', '| c | d |\n| e | f |\n');
  assert.equal(tulosta(juuri, P), odotettu);
  const git = REK.replace('- kaksi', '- KAKSI');
  const t = uudelleentuo(juuri, laite, P, git, { commit: 'b' });
  assert.deepEqual([t.muuttunut, t.uusi, t.poistettu, t.ristiriita], [1, 0, 0, 0]);
  assert.equal(tulosta(juuri, P), odotettu.replace('- kaksi', '- KAKSI'));
  assert.equal(tulosta(juuri, P, { lahde: true }), git);
});

// Äpin koskema rivi: versio ≠ lahdeVersio. `sisalto` antaa äpin sisällön (oletus = gitin sisältö, kuten lähteen versiolla ratkaistu riita).
const appiKoskee = (juuri, P, rivi, sisalto = rivi.sisalto) => {
  const appi = { ...rivi, sisalto, versio: { ...rivi.versio, iphone: 1 }, muuttaja: 'iphone' };
  delete appi.lahdeSisalto; delete appi.lahdeVersio;
  assert.equal(vastaanota(juuri, { yksikot: [appi] }).otettu, 1);
};

test('paritus: gitin poistama ja eri lisäämä rivi eivät ole saman rivin muokkaus (tuotannon 005655)', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const rivi = lueYksikot(juuri, P).find((y) => y.sisalto === '| c | d |\n\n');
  appiKoskee(juuri, P, rivi);
  const git = REK.replace('| c | d |\n', '| uusi asia | avoin |\n');
  const t = uudelleentuo(juuri, laite, P, git, { commit: 'b' });
  assert.deepEqual([t.muuttunut, t.uusi, t.poistettu, t.ristiriita], [0, 1, 1, 0]);
  assert.equal(ristiriidat(juuri).length, 0);
  assert.equal(tulosta(juuri, P), git);
  const ys = lueYksikot(juuri, P);
  const vanha = ys.find((y) => y.id === rivi.id);
  assert.equal(vanha.poistettu, true);
  assert.equal(vertaa(vanha.versio, { ...rivi.versio, iphone: 1 }), 'uudempi');
  assert.notEqual(ys.find((y) => y.sisalto === '| uusi asia | avoin |\n\n').id, rivi.id);
});

test('paritus: äpin muokkaama rivi, jonka git korvaa eri rivillä, on poistoriita eikä vieras rinnakkainen', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const rivi = lueYksikot(juuri, P).find((y) => y.sisalto === '| c | d |\n\n');
  appiKoskee(juuri, P, rivi, '| c | äppi |\n\n');
  const git = REK.replace('| c | d |\n', '| uusi asia | avoin |\n');
  const t = uudelleentuo(juuri, laite, P, git, { commit: 'b' });
  assert.deepEqual([t.uusi, t.poistettu, t.ristiriita], [1, 1, 1]);
  const vanha = lueYksikot(juuri, P).find((y) => y.id === rivi.id);
  assert.equal(vanha.sisalto, '| c | äppi |\n\n');
  assert.equal(vanha.rinnakkaiset[0].poistettu, true);
  assert.equal(tulosta(juuri, P, { lahde: true }), git);
});

test('paritus: samankaltainen muokkaus pitää tunnuksen myös välissä, ja palautettu äppimuutos ei ole riita', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const ennen = lueYksikot(juuri, P);
  const rivi = ennen.find((y) => y.sisalto === '| c | d |\n\n');
  const kaksi = ennen.find((y) => y.sisalto === '- kaksi\n\n');
  appiKoskee(juuri, P, rivi);
  // Molemmat rivit muuttuvat ja väliin tulee uusi: c pitää avaimensa, lista-alkio Dice-samankaltaisena.
  const git = REK.replace('| c | d |\n', '| c | valmis |\n').replace('- kaksi\n', '- kaksi, nyt pidempi\n- aivan muuta\n');
  const t = uudelleentuo(juuri, laite, P, git, { commit: 'b' });
  assert.deepEqual([t.muuttunut, t.uusi, t.poistettu, t.ristiriita], [2, 1, 0, 0]);
  const ys = lueYksikot(juuri, P);
  assert.equal(ys.find((y) => y.id === rivi.id).sisalto, '| c | valmis |\n\n');
  assert.equal(ys.find((y) => y.id === kaksi.id).sisalto, '- kaksi, nyt pidempi\n');
  assert.equal(tulosta(juuri, P), git);
});

test('hautakivien siivous: kivi tiivistyy merkinnäksi, vanha versio ei herätä sitä, uudempi herättää, rinnakkainen on riita', () => {
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const laite = luoLaite(juuri, 'oneplus');
  const P = 'x/REKISTERI.md';
  tuoRekisteri(juuri, laite, P, REK, { commit: 'a' });
  const ennen = Object.fromEntries(lueYksikot(juuri, P).map((y) => [y.sisalto, y]));
  // Git poistaa kaksi riviä; äppi poistaa gitissä yhä olevan rivin (sen kiveä ei siivota, uudelleentuonti herättäisi sen).
  const gitissa = ennen['| a | b |\n'];
  vastaanota(juuri, { yksikot: [{ ...gitissa, poistettu: true, versio: { ...gitissa.versio, iphone: 1 } }] });
  const git = REK.replace('| c | d |\n', '').replace('- kaksi\n', '');
  uudelleentuo(juuri, laite, P, git, { commit: 'b' });
  const tiivisteEnnen = tiivisteet(juuri).juuri;
  const tekstiEnnen = tulosta(juuri, P);
  const kivi = lueYksikot(juuri, P).find((y) => y.id === ennen['| c | d |\n\n'].id);
  assert.equal(siivoa(juuri, P), 2);
  assert.equal(siivoa(juuri, P), 0);
  const siivotut = lueSiivotut(juuri, P);
  assert.deepEqual(Object.keys(siivotut).sort(), [ennen['| c | d |\n\n'].id, ennen['- kaksi\n\n'].id].sort());
  assert.equal(lueYksikot(juuri, P).find((y) => y.id === gitissa.id).poistettu, true);
  assert.equal(tulosta(juuri, P), tekstiEnnen);
  assert.equal(tulosta(juuri, P, { lahde: true }), git);
  assert.notEqual(tiivisteet(juuri).juuri, tiivisteEnnen);
  assert.deepEqual(lista(juuri, P).siivotut, siivotut);
  assert.equal(uudelleentuo(juuri, laite, P, git + '\n', { commit: 'c' }).ristiriita, 0);
  // Laite, joka ei ole nähnyt poistoa, lähettää vanhan elävän version tai saman kiven: ei herää.
  const elava = { ...ennen['| c | d |\n\n'] };
  delete elava.lahdeSisalto; delete elava.lahdeVersio;
  assert.equal(vastaanota(juuri, { yksikot: [elava, { ...elava, poistettu: true, versio: kivi.versio }] }).ohitettu, 2);
  assert.equal(lueYksikot(juuri, P).some((y) => y.id === elava.id), false);
  // Rinnakkainen muokkaus (offline-laite muokkasi riviä, jonka toinen poisti): kivi palaa ja riita kysytään.
  const rinn = { ...elava, sisalto: '| c | offline |\n', versio: { ...elava.versio, iphone: 5 } };
  assert.deepEqual(vastaanota(juuri, { yksikot: [rinn] }).ristiriidat, [elava.id]);
  const riita = lueYksikot(juuri, P).find((y) => y.id === elava.id);
  assert.equal(riita.poistettu, true);
  assert.deepEqual(riita.versio, kivi.versio);
  assert.equal(riita.rinnakkaiset[0].sisalto, '| c | offline |\n');
  assert.equal(lueSiivotut(juuri, P)[elava.id], undefined);
  assert.equal(siivoa(juuri, P), 0);
  // Uudempi versio (kiven nähnyt laite herätti rivin) herättää suoraan.
  const toinen = ennen['- kaksi\n\n'];
  const herata = { ...toinen, sisalto: '- kaksi takaisin\n', poistettu: false, versio: { ...siivotut[toinen.id], iphone: 9 } };
  delete herata.lahdeSisalto; delete herata.lahdeVersio;
  assert.deepEqual(vastaanota(juuri, { yksikot: [herata] }), { otettu: 1, ohitettu: 0, ristiriidat: [], muuttuneet: new Set([P]) });
  assert.match(tulosta(juuri, P), /- kaksi takaisin/);
  assert.deepEqual(lueSiivotut(juuri, P), {});
});

test('tuo-komento siivoaa lopuksi hautakivet (LOCALREGISTER-SIIVOUS-TUOTANTO)', () => {
  const repo = mkdtempSync(join(tmpdir(), 'lr-repo-'));
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const git = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const tuo = () => execFileSync(process.execPath, [LR, 'tuo', '--juuri', juuri], { cwd: repo, encoding: 'utf8' });
  git('init', '-q');
  mkdirSync(join(repo, 'x'));
  writeFileSync(join(repo, 'x/REKISTERI.md'), REK);
  git('add', '.'); git('commit', '-qm', 'a');
  assert.match(tuo(), /siivottuja hautakiviä 0$/m);
  writeFileSync(join(repo, 'x/REKISTERI.md'), REK.replace('| c | d |\n', ''));
  git('commit', '-qam', 'b');
  assert.match(tuo(), /poistettu 1 .*siivottuja hautakiviä 1$/m);
  assert.equal(Object.keys(lueSiivotut(juuri, 'x/REKISTERI.md')).length, 1);
  assert.equal(lueYksikot(juuri, 'x/REKISTERI.md').some((y) => y.poistettu), false);
});

test('vienti LR → git: äpin muutokset commitiksi, paluu ei ole riita eikä kahdenna, muut etuliitteet ennallaan (LOCALREGISTER-VIENTI)', () => {
  const repo = mkdtempSync(join(tmpdir(), 'lr-repo-'));
  const juuri = mkdtempSync(join(tmpdir(), 'lr-'));
  const tila = mkdtempSync(join(tmpdir(), 'lr-tila-'));
  const git = (...a) => execFileSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const env = { ...process.env, SIIRTO_STATE_DIR: tila, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
  const aja = (...a) => execFileSync(process.execPath, [LR, ...a, '--juuri', juuri], { cwd: repo, encoding: 'utf8', env });
  const S = 'scopes/x/REKISTERI.md', M = 'muu/REKISTERI.md';
  git('init', '-q');
  for (const p of [S, M]) { mkdirSync(join(repo, dirname(p)), { recursive: true }); writeFileSync(join(repo, p), REK); }
  git('add', '.'); git('commit', '-qm', 'a');
  aja('tuo');
  const rivi = (P, s) => lueYksikot(juuri, P).find((y) => y.sisalto === s);
  // Äppi: muokkaa, lisää ja poistaa scopes-rekisterissä; muokkaa muu-rekisteriä.
  appiKoskee(juuri, S, rivi(S, '- kaksi\n\n'), '- kaksi äpistä\n\n');
  const ys = lueYksikot(juuri, S).sort((a, b) => (a.jarjestys < b.jarjestys ? -1 : 1));
  const k = ys.findIndex((y) => y.sisalto === '| a | b |\n');
  const uusi = { id: 'iphone-000009', rekisteri: S, laji: 'avoin', osio: 'Avoimet asiat', jarjestys: valiin(ys[k].jarjestys, ys[k + 1].jarjestys), sisalto: '| u | v |\n', versio: { iphone: 9 }, poistettu: false };
  const pois = { ...rivi(S, 'vapaa kappale\ntoinen rivi'), poistettu: true, versio: { ...rivi(S, 'vapaa kappale\ntoinen rivi').versio, iphone: 10 }, muuttaja: 'iphone' };
  delete pois.lahdeSisalto; delete pois.lahdeVersio;
  assert.equal(vastaanota(juuri, { yksikot: [uusi, pois] }).otettu, 2);
  appiKoskee(juuri, M, rivi(M, '- kaksi\n\n'), '- muu äpistä\n\n');
  const odotettu = REK.replace('- kaksi', '- kaksi äpistä').replace('| a | b |\n', '| a | b |\n| u | v |\n').replace('vapaa kappale\ntoinen rivi', '');
  assert.equal(tulosta(juuri, S), odotettu);
  const elavat = () => lueYksikot(juuri, S).filter((y) => !y.poistettu).length;
  const maara = elavat();

  assert.match(aja('vie', '--etuliite', 'scopes/'), /^VIETY: scopes\/x\/REKISTERI\.md .*\nVIENTI: 1 viety, 0 ohitettu$/m);
  assert.equal(readFileSync(join(repo, S), 'utf8'), odotettu);
  assert.equal(git('show', `HEAD:${S}`), odotettu);
  assert.equal(git('show', `HEAD:${M}`), REK);
  assert.equal(git('status', '--porcelain'), '');
  assert.match(git('log', '-1', '--format=%s'), /^chore\(lr\): vienti scopes\/x\/REKISTERI\.md äpistä/);
  // Paluu: ei riitaa, ei uusia yksiköitä, gitin puoli = HEAD, ja uusi vienti on tyhjä.
  assert.equal(elavat(), maara);
  assert.equal(Object.keys(lueSiivotut(juuri, S)).length, 1);
  assert.deepEqual(ristiriidat(juuri), []);
  assert.equal(tulosta(juuri, S, { lahde: true }), odotettu);
  assert.equal(lueYksikot(juuri, S).filter((y) => !y.poistettu).every((y) => y.lahdeSisalto === y.sisalto), true);
  assert.match(aja('vie', '--etuliite', 'scopes/'), /^VIENTI: 0 viety, 0 ohitettu$/m);

  // Pakkaus muuttaa gittiä ja äppi eri riviä: LR yhdistää, vienti tuo molemmat.
  writeFileSync(join(repo, S), odotettu.replace('- **Käyttäjä:** yksi', '- **Käyttäjä:** yksi gitistä'));
  git('commit', '-qam', 'pakkaus');
  aja('tuo');
  appiKoskee(juuri, S, rivi(S, '| c | d |\n\n'), '| c | e |\n\n');
  assert.match(aja('vie', '--etuliite', 'scopes/'), /VIENTI: 1 viety/);
  assert.equal(git('show', `HEAD:${S}`), odotettu.replace('- **Käyttäjä:** yksi', '- **Käyttäjä:** yksi gitistä').replace('| c | d |', '| c | e |'));
  assert.deepEqual(ristiriidat(juuri), []);

  // Esteet: istunnon muokkaama tiedosto, tiedoston pakkauslukko, juurirepon lukko, avoin riita.
  const taas = { ...rivi(S, '- kaksi äpistä\n\n'), sisalto: '- kaksi taas\n\n', muuttaja: 'iphone' };
  taas.versio = { ...taas.versio, iphone: 11 };
  delete taas.lahdeSisalto; delete taas.lahdeVersio;
  assert.equal(vastaanota(juuri, { yksikot: [taas] }).otettu, 1);
  writeFileSync(join(repo, S), readFileSync(join(repo, S), 'utf8') + 'istunto\n');
  assert.match(aja('vie', '--etuliite', 'scopes/'), /OHITETTU: scopes\/x\/REKISTERI\.md — tiedostoa muokattu työpuussa/);
  git('checkout', '--', S);
  mkdirSync(join(tiedostoLukko(S, tila), 'lock'), { recursive: true });
  assert.match(aja('vie', '--etuliite', 'scopes/'), /OHITETTU: scopes\/x\/REKISTERI\.md — pakkauslukko/);
  rmSync(tiedostoLukko(S, tila), { recursive: true });
  mkdirSync(join(tila, 'lock'));
  assert.match(aja('vie', '--etuliite', 'scopes/'), /^VIENTI: 0 viety, 0 ohitettu — juurirepon pakkauslukko$/m);
  rmSync(join(tila, 'lock'), { recursive: true });
  writeFileSync(join(repo, S), readFileSync(join(repo, S), 'utf8').replace('- kaksi äpistä', '- kaksi gitistä'));
  git('commit', '-qam', 'riita');
  assert.match(aja('vie', '--etuliite', 'scopes/'), /OHITETTU: scopes\/x\/REKISTERI\.md — avoin riita \(K4\)/);
  assert.equal(git('show', `HEAD:${S}`).includes('- kaksi gitistä'), true);

  // Epäonnistunut commit (pre-commit-hook hylkää): tiedosto palautuu, eikä työpuu jää likaiseksi.
  const R = 'scopes/y/REKISTERI.md';
  mkdirSync(join(repo, 'scopes/y')); writeFileSync(join(repo, R), REK); git('add', R); git('commit', '-qm', 'y');
  aja('tuo');
  appiKoskee(juuri, R, rivi(R, '- kaksi\n\n'), '- kaksi y\n\n');
  writeFileSync(join(repo, '.git/hooks/pre-commit'), '#!/bin/sh\necho hylätty >&2\nexit 1\n', { mode: 0o755 });
  assert.match(aja('vie', '--etuliite', 'scopes/y/'), /OHITETTU: scopes\/y\/REKISTERI\.md — commit epäonnistui: hylätty/);
  assert.equal(git('status', '--porcelain'), '');
});
