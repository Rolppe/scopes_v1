// node --test scopes/palvelu/lahteet.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { createServer } from 'node:http';
import { istunnonSkooppi, istunnot, jasennaSeuraava, konteksti, lista, projektiNimi, pysahdys, seuraavaRivi, taulukko, yksi } from './lahteet.mjs';
import { avainKelpaa, kasittelija } from './palvelin.mjs';

const REK = `# R

SEURAAVA PAKETTI [b]: B-PAKETTI — b:n työ — polut: b/x — aloitus: /pura b
SEURAAVA PAKETTI: A-PAKETTI — tee asia — toinen osa — polut: a/x, a/y — aloitus: /pura a — automaattinen: kyllä

## Avoimet asiat

| Asia | Tila | Seuraava askel |
|---|---|---|
| Eka | avoin | tee |
| Toka | valmis | - |

## Viat

| Vika | Tila |
|---|---|
| V-1 rikki | avoin |

## Historia
`;

test('SEURAAVA: leimattu rivi omalle skoopille, muuten leimaton', () => {
  assert.equal(seuraavaRivi(REK, 'b').id, 'B-PAKETTI');
  const a = seuraavaRivi(REK, 'a');
  assert.deepEqual([a.id, a.kuvaus, a.polut, a.aloitus], ['A-PAKETTI', 'tee asia — toinen osa', ['a/x', 'a/y'], '/pura a']);
  assert.equal(seuraavaRivi('ei riviä', 'a'), null);
  assert.equal(jasennaSeuraava('ei mitään — odottaa').id, null);
});

test('taulukko: otsikon alla oleva taulukko, myös numeroitu otsikko', () => {
  assert.deepEqual(taulukko(REK, 'Viat'), [{ Vika: 'V-1 rikki', Tila: 'avoin' }]);
  assert.equal(taulukko(REK, 'Avoimet asiat').length, 2);
  assert.equal(taulukko(REK.replace('## Viat', '## 6. Viat'), 'Viat').length, 1);
  assert.deepEqual(taulukko(REK, 'Puuttuu'), []);
});

test('konteksti: viimeinen pääketjun usage, sidechain ohitetaan', () => {
  const t = [
    JSON.stringify({ message: { usage: { input_tokens: 1, cache_read_input_tokens: 100, cache_creation_input_tokens: 10 } }, timestamp: 't1' }),
    JSON.stringify({ isSidechain: true, message: { usage: { input_tokens: 999 } } }),
    'katkennut {',
  ].join('\n');
  assert.deepEqual(konteksti(t), { tokenit: 111, aika: 't1' });
  assert.equal(konteksti(''), null);
});

test('pysahdys: valmis vuoro tai monivalinta, ei työn välivaihetta eikä ali-agenttia', () => {
  const a = (stop, content, ts, muu = {}) => JSON.stringify({ type: 'assistant', timestamp: ts, ...muu, message: { stop_reason: stop, content } });
  const kysy = [{ type: 'tool_use', name: 'AskUserQuestion', input: {} }];
  const bash = [{ type: 'tool_use', name: 'Bash', input: {} }];
  assert.equal(pysahdys([a('end_turn', [], 't1'), a('tool_use', bash, 't2')].join('\n')), 't1');
  assert.equal(pysahdys([a('end_turn', [], 't1'), a('tool_use', kysy, 't2'), a('tool_use', bash, 't3')].join('\n')), 't2');
  assert.equal(pysahdys([a('end_turn', [], 't1'), a('end_turn', [], 't2', { isSidechain: true })].join('\n')), 't1');
  assert.equal(pysahdys(a('tool_use', bash, 't1')), null);
});

test('istunnon skooppi: nimestä tai viimeisimmästä /pura-argumentista', () => {
  const nimet = ['a', 'b c'];
  const pura = (x) => `<command-name>/pura</command-name>\n<command-args>${x}</command-args>`;
  assert.equal(istunnonSkooppi('a', '', nimet), 'a');
  assert.equal(istunnonSkooppi('kone-1', pura('a') + pura('uusi b c --autojatko'), nimet), 'b c');
  assert.equal(istunnonSkooppi('kone-1', pura('tuntematon'), nimet), null);
  // Transkriptin JSON-rivi: rivinvaihto on merkit \n.
  assert.equal(istunnonSkooppi('kone-1', JSON.stringify(pura('b c')), nimet), 'b c');
  assert.equal(projektiNimi('/h/m_x/a.b'), '-h-m-x-a-b');
});

function ymparisto() {
  const d = mkdtempSync(join(tmpdir(), 'scopes-'));
  const juuri = join(d, 'juuri');
  mkdirSync(join(juuri, 'claude/siirto/state'), { recursive: true });
  writeFileSync(join(juuri, 'claude/siirto/state/skoopit.json'), JSON.stringify({ a: ['a/R.md'], b: ['a/R.md'] }));
  mkdirSync(join(juuri, 'a'));
  writeFileSync(join(juuri, 'a/R.md'), REK);
  // Elävä istunto: oma prosessi, procStart luetaan /proc:sta.
  const istunnotDir = join(d, 'istunnot');
  mkdirSync(istunnotDir);
  const cwd = '/x/y';
  writeFileSync(join(istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd, name: 'kone-1', status: 'idle' }));
  writeFileSync(join(istunnotDir, '1.json'), JSON.stringify({ pid: 999999999, sessionId: 'kuollut', cwd }));
  const projektitDir = join(d, 'projektit');
  mkdirSync(join(projektitDir, projektiNimi(cwd)), { recursive: true });
  writeFileSync(join(projektitDir, projektiNimi(cwd), 's1.jsonl'),
    '<command-name>/pura</command-name>\n<command-args>a</command-args>\n' +
    JSON.stringify({ message: { usage: { input_tokens: 5, cache_read_input_tokens: 50000 } }, timestamp: 't' }));
  return { juuri, istunnotDir, projektitDir };
}

test('istunnot: vain elävät, skooppi ja konteksti transkriptista', () => {
  const a = ymparisto();
  const i = istunnot({ ...a, skooppiNimet: ['a', 'b'] });
  assert.deepEqual(i, [{ id: 's1', nimi: 'kone-1', tila: 'idle', skooppi: 'a', konteksti: { tokenit: 50005, aika: 't' }, pysahdys: null,
    pid: process.pid, vanhempi: process.ppid, ruutu: null, polku: join(a.projektitDir, '-x-y', 's1.jsonl') }]);
});

test('lista ja yksi: tiivistelmä ja skoopin näkymä', () => {
  const a = ymparisto();
  const l = lista(a);
  // aika = rekisterin muokkausaika (istunnon aika 't' ei ole päiväys, joten se ei voita).
  for (const r of l) assert.match(r.aika, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(l.map(({ aika, ...r }) => r), [
    { nimi: 'a', seuraava: 'A-PAKETTI', avoimia: 1, vikoja: 1, istuntoja: 1, suurinKonteksti: 50005 },
    { nimi: 'b', seuraava: 'B-PAKETTI', avoimia: 1, vikoja: 1, istuntoja: 0, suurinKonteksti: null },
  ]);
  const s = yksi('a', a);
  assert.equal(s.seuraava.id, 'A-PAKETTI');
  assert.equal(s.istunnot[0].id, 's1');
  assert.equal(yksi('puuttuu', a), null);
});

test('palvelin: polut ja virhekoodit', async () => {
  const a = ymparisto();
  const avain = 'k'.repeat(32);
  const srv = createServer(kasittelija({ ...a, avain })).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const hae = (polku, method = 'GET', kayttoavain = avain) => new Promise((ok, ei) => {
    const headers = kayttoavain ? { authorization: `Bearer ${kayttoavain}` } : {};
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method, headers }, (res) => {
      let b = ''; res.on('data', (c) => { b += c; }); res.on('end', () => ok([res.statusCode, JSON.parse(b)]));
    });
    req.on('error', ei); req.end();
  });
  try {
    assert.deepEqual(await hae('/api/terveys'), [200, { ok: true }]);
    assert.equal((await hae('/api/skoopit'))[1].length, 2);
    assert.equal((await hae('/api/skoopit/a'))[1].nimi, 'a');
    assert.equal((await hae('/api/skoopit/puuttuu'))[0], 404);
    assert.equal((await hae('/api/skoopit', 'POST'))[0], 404);
    assert.equal((await hae('/api/skoopit', 'DELETE'))[0], 405);
    assert.equal((await hae('/api/skoopit', 'GET', null))[0], 401);
    assert.equal((await hae('/api/skoopit/a', 'GET', 'v'.repeat(32)))[0], 401);
    assert.deepEqual(await hae('/api/terveys', 'GET', null), [200, { ok: true }]);
  } finally { srv.close(); }
});

test('avain: vain täsmälleen oikea Bearer kelpaa', () => {
  assert.equal(avainKelpaa('Bearer abc', 'abc'), true);
  assert.equal(avainKelpaa('Bearer abcd', 'abc'), false);
  assert.equal(avainKelpaa('abc', 'abc'), false);
  assert.equal(avainKelpaa(undefined, 'abc'), false);
});
