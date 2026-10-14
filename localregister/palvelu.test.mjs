// node --test scopes/localregister/palvelu.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { luoLaite, tuoRekisteri } from './lr.mjs';
import { luoLr } from './palvelu.mjs';

const P = 'x/REKISTERI.md';
const alusta = () => {
  const lrJuuri = mkdtempSync(join(tmpdir(), 'lrp-'));
  const laite = luoLaite(lrJuuri, 'oneplus');
  tuoRekisteri(lrJuuri, laite, P, '# x\n\n- yksi\n- kaksi\n', { commit: 'a' });
  laite.tallenna();
  let head = 'h1', tuonnit = 0;
  const lr = luoLr({ lrJuuri, head: async () => head, tuo: async () => { tuonnit++; await new Promise((r) => setTimeout(r, 20)); } });
  return { lr, lrJuuri, setHead: (h) => { head = h; }, tuonnit: () => tuonnit };
};
const runko = (o) => async () => o;

test('tiiviste tuo vain, kun HEAD muuttuu; samanaikaiset kyselyt jakavat tuonnin', async () => {
  const k = alusta();
  const [a, b] = await Promise.all([k.lr.kasittele('GET', '/api/lr/tiiviste'), k.lr.kasittele('GET', '/api/lr/tiiviste')]);
  assert.equal(k.tuonnit(), 1);
  assert.equal(a.juuri, b.juuri);
  assert.equal(a.valiMin, 10);
  await k.lr.kasittele('GET', '/api/lr/tiiviste');
  assert.equal(k.tuonnit(), 1);
  k.setHead('h2');
  await k.lr.kasittele('GET', '/api/lr/tiiviste');
  assert.equal(k.tuonnit(), 2);
});

test('listat → hae → laheta muuttaa tiivistettä; ristiriita näkyy', async () => {
  const k = alusta();
  const ennen = await k.lr.kasittele('GET', '/api/lr/tiiviste');
  const l = await k.lr.kasittele('POST', '/api/lr/listat', runko({ rekisterit: [P] }));
  const id = l[P].yksikot.map((y) => y.id).sort()[1];
  const [y] = (await k.lr.kasittele('POST', '/api/lr/hae', runko({ rekisteri: P, idt: [id] }))).yksikot;
  const muokattu = { ...y, sisalto: '- yksi (äppi)\n', versio: { ...y.versio, iphone: 1 } };
  assert.equal((await k.lr.kasittele('POST', '/api/lr/laheta', runko({ yksikot: [muokattu] }))).otettu, 1);
  const jalkeen = await k.lr.kasittele('GET', '/api/lr/tiiviste');
  assert.notEqual(jalkeen.juuri, ennen.juuri);
  assert.match((await k.lr.kasittele('GET', `/api/lr/teksti/${encodeURIComponent(P)}`)).teksti, /yksi \(äppi\)/);
  const rinn = { ...y, sisalto: '- yksi (toinen)\n', versio: { ...y.versio, mac: 1 } };
  assert.deepEqual((await k.lr.kasittele('POST', '/api/lr/laheta', runko({ yksikot: [rinn] }))).ristiriidat, [id]);
  assert.equal((await k.lr.kasittele('GET', '/api/lr/ristiriidat')).ristiriidat.length, 1);
});

test('virheet: tuntematon polku 404, vieras rekisteripolku 400/404', async () => {
  const k = alusta();
  await assert.rejects(k.lr.kasittele('GET', '/api/lr/eiole'), (e) => e.koodi === 404);
  await assert.rejects(k.lr.kasittele('GET', '/api/lr/teksti/..%2F..%2Fetc%2Fpasswd'), (e) => e.koodi === 404);
  await assert.rejects(k.lr.kasittele('POST', '/api/lr/hae', runko({ rekisteri: '../REKISTERI.md', idt: [] })), (e) => e.koodi === 400);
  await assert.rejects(k.lr.kasittele('POST', '/api/lr/listat', runko({ rekisterit: ['y/REKISTERI.md'] })), (e) => e.koodi === 404);
});

test('vienti: etuliitteen lähetys käynnistää viennin tuonnin jälkeen; muu polku ja oletus eivät (LOCALREGISTER-VIENTI)', async () => {
  const lrJuuri = mkdtempSync(join(tmpdir(), 'lrp-'));
  const laite = luoLaite(lrJuuri, 'oneplus');
  const S = 'scopes/x/REKISTERI.md';
  for (const p of [S, P]) tuoRekisteri(lrJuuri, laite, p, '# x\n\n- yksi\n- kaksi\n', { commit: 'a' });
  laite.tallenna();
  const jarjestys = [];
  const luo = (vientiEtuliite) => luoLr({
    lrJuuri, vientiEtuliite, head: async () => 'h1',
    tuo: async () => { jarjestys.push('tuo'); await new Promise((r) => setTimeout(r, 20)); },
    vienti: async () => { jarjestys.push('vie'); return { stdout: 'VIENTI: 0 viety, 0 ohitettu\n' }; },
  });
  const laheta = async (lr, polku) => {
    const l = await lr.kasittele('POST', '/api/lr/listat', runko({ rekisterit: [polku] }));
    const [y] = (await lr.kasittele('POST', '/api/lr/hae', runko({ rekisteri: polku, idt: [l[polku].yksikot[1].id] }))).yksikot;
    const v = { ...y, sisalto: `- äppi ${jarjestys.length}\n`, versio: { ...y.versio, iphone: (y.versio.iphone ?? 0) + 1 } };
    return lr.kasittele('POST', '/api/lr/laheta', runko({ yksikot: [v] }));
  };
  const pois = luo(null);
  await laheta(pois, S);
  assert.equal(await pois.vie(), null);
  const lr = luo('scopes/');
  await laheta(lr, P);
  assert.deepEqual(jarjestys, []);
  const t = lr.tuoJosMuuttunut();
  await laheta(lr, S);
  await t;
  const hetki = () => new Promise((r) => setTimeout(r, 50));
  await hetki();
  assert.deepEqual(jarjestys, ['tuo', 'vie']);
  await laheta(lr, S);
  await hetki();
  assert.deepEqual(jarjestys, ['tuo', 'vie', 'vie']);
});
