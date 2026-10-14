// node --test scopes/palvelu/toiminnot.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { projektiNimi } from './lahteet.mjs';
import { kasittelija } from './palvelin.mjs';
import { Hylatty, istuntoOsoite, luoToiminnot, UUSI_NIMI } from './toiminnot.mjs';

const URL_OK = 'OK: https://claude.ai/code/session_abc123';

// Skooppi a: elävä tmux-istunto (oma prosessi, ruutu %5). Skooppi b: ei istuntoja.
function ymparisto({ tila = 'idle', tmux = 'siirto-a-1:@1.%5' } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'scopes-t-'));
  const juuri = join(d, 'juuri');
  mkdirSync(join(juuri, 'claude/siirto/state'), { recursive: true });
  writeFileSync(join(juuri, 'claude/siirto/state/skoopit.json'), JSON.stringify({ a: ['R.md'], b: ['R.md'] }));
  const istunnotDir = join(d, 'istunnot');
  mkdirSync(istunnotDir);
  writeFileSync(join(istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: tila, tmux }));
  const projektitDir = join(d, 'projektit');
  mkdirSync(join(projektitDir, projektiNimi('/x')), { recursive: true });
  return { juuri, istunnotDir, projektitDir, toimintoloki: join(d, 'loki/t.loki') };
}

// Kirjaa kutsut; tmux display-message palauttaa oman pidin, autovaihto OK-rivin.
function vaarennos({ autovaihto = { koodi: 0, stdout: `UUSI: …\n${URL_OK}\n`, stderr: '' }, ruudunPid = process.pid } = {}) {
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    kutsut.push([komento, ...argumentit]);
    if (komento === 'tmux' && argumentit[0] === 'display-message') return { koodi: 0, stdout: `${ruudunPid}\n`, stderr: '' };
    if (komento === 'tmux') return { koodi: 0, stdout: '', stderr: '' };
    return autovaihto;
  };
  return { aja, kutsut };
}

const hylkaa = async (lupaus, koodi) => assert.rejects(lupaus, (e) => e instanceof Hylatty && e.koodi === koodi);

test('pura: uusi istunto vain tunnetulle skoopille ilman käynnissä olevaa istuntoa', async () => {
  const a = ymparisto();
  const v = vaarennos();
  const suorita = luoToiminnot(a, { aja: v.aja });
  assert.deepEqual(await suorita('pura', 'b'), { ok: true, toiminto: 'pura', nimi: 'b', osoite: 'https://claude.ai/code/session_abc123', suljettiin: [] });
  assert.deepEqual(v.kutsut, [['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'b', '--ei-sulje', '--viesti', '/pura b']]);
  await hylkaa(suorita('pura', 'a'), 409);
  await hylkaa(suorita('pura', 'c; rm -rf /'), 404);
  assert.equal(v.kutsut.length, 1);
});

test('pura: pakattu tmux-istunto suljetaan ensin, varattu tai pakkaamaton estää', async () => {
  const pakkaa = (a) => writeFileSync(join(a.projektitDir, projektiNimi('/x'), 's1.jsonl'),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'PAKKAUS: vahvistettu — commit abc' }] } }));
  const a = ymparisto();
  pakkaa(a);
  const v = vaarennos();
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'a');
  assert.deepEqual(r.suljettiin, ['s1']);
  assert.deepEqual(v.kutsut.slice(1), [['tmux', 'send-keys', '-t', '%5', '-l', '/exit'], ['tmux', 'send-keys', '-t', '%5', 'Enter'],
    ['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'a', '--ei-sulje', '--viesti', '/pura a']]);
  const varattu = ymparisto({ tila: 'busy' });
  pakkaa(varattu);
  const v2 = vaarennos();
  await hylkaa(luoToiminnot(varattu, { aja: v2.aja })('pura', 'a'), 409);
  assert.equal(v2.kutsut.length, 0);
  // Pakattuun istuntoon ei lähetetä /pakkaa uudelleen.
  await hylkaa(luoToiminnot(a, { aja: vaarennos().aja })('pakkaa', 'a'), 409);
});

test('pura: autovaihdon virhe näkyy 502:na', async () => {
  const v = vaarennos({ autovaihto: { koodi: 2, stdout: '', stderr: 'VIRHE: Remote Control ei aktivoitunut\n' } });
  await assert.rejects(luoToiminnot(ymparisto(), { aja: v.aja })('pura', 'b'), /Remote Control ei aktivoitunut/);
});

test('pakkaa: /pakkaa vain skoopin vapaaseen, täsmäävään tmux-ruutuun', async () => {
  const v = vaarennos();
  const r = await luoToiminnot(ymparisto(), { aja: v.aja })('pakkaa', 'a');
  assert.equal(r.istunto, 's1');
  assert.deepEqual(v.kutsut.slice(1), [['tmux', 'send-keys', '-t', '%5', '-l', '/pakkaa'], ['tmux', 'send-keys', '-t', '%5', 'Enter']]);
  await hylkaa(luoToiminnot(ymparisto(), { aja: v.aja })('pakkaa', 'b'), 409);
  await hylkaa(luoToiminnot(ymparisto({ tila: 'busy' }), { aja: v.aja })('pakkaa', 'a'), 409);
  await hylkaa(luoToiminnot(ymparisto({ tmux: null }), { aja: v.aja })('pakkaa', 'a'), 409);
  const vieras = vaarennos({ ruudunPid: 1 });
  await hylkaa(luoToiminnot(ymparisto(), { aja: vieras.aja })('pakkaa', 'a'), 409);
  assert.equal(vieras.kutsut.filter((k) => k[1] === 'send-keys').length, 0);
});

test('automaattisiirto ja herätys: valmis komento samaan ruutuun kuin /pakkaa', async () => {
  for (const [toiminto, komento] of [['automaattisiirto', '/automaattisiirto'], ['herata', '/sa'], ['herata-pois', '/sa pois']]) {
    const v = vaarennos();
    const r = await luoToiminnot(ymparisto(), { aja: v.aja })(toiminto, 'a');
    assert.deepEqual([r.istunto, r.komento], ['s1', komento]);
    assert.deepEqual(v.kutsut.slice(1), [['tmux', 'send-keys', '-t', '%5', '-l', komento], ['tmux', 'send-keys', '-t', '%5', 'Enter']]);
  }
});

test('jono: varatulle istunnolle herätys ja siirto odottavat vapautumista, /pakkaa hylätään (V-294)', async () => {
  const a = ymparisto({ tila: 'waiting' });
  const tila = (t) => writeFileSync(join(a.istunnotDir, `${process.pid}.json`),
    JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: t, tmux: 'siirto-a-1:@1.%5' }));
  const v = vaarennos();
  const suorita = luoToiminnot(a, { aja: v.aja, jonoVali: 0 });
  await hylkaa(suorita('pakkaa', 'a'), 409);
  assert.deepEqual(await suorita('automaattisiirto', 'a'), { ok: true, toiminto: 'automaattisiirto', nimi: 'a', istunto: 's1', komento: '/automaattisiirto', jonossa: true });
  await suorita('herata', 'a');
  await suorita('herata-pois', 'a');
  assert.equal((await suorita('herata', 'a')).jonossa, true);
  // Kytkimen uusin asento korvaa vanhemman; siirto jää omaan paikkaansa.
  assert.deepEqual(suorita.jono('a').map((j) => j.komento), ['/automaattisiirto', '/sa']);
  assert.deepEqual(suorita.jono('b'), []);
  await suorita.puraJono();
  assert.equal(v.kutsut.length, 0);
  // Vapaa istunto: ensin herätys, siirto vasta seuraavalla kierroksella.
  tila('idle');
  await suorita.puraJono();
  assert.deepEqual(v.kutsut.filter((k) => k[1] === 'send-keys').map((k) => k.at(-1)), ['/sa', 'Enter']);
  assert.deepEqual(suorita.jono('a').map((j) => j.komento), ['/automaattisiirto']);
  await suorita.puraJono();
  assert.deepEqual(v.kutsut.filter((k) => k[1] === 'send-keys').map((k) => k.at(-1)), ['/sa', 'Enter', '/automaattisiirto', 'Enter']);
  assert.deepEqual(suorita.jono('a'), []);
  const rivit = readFileSync(a.toimintoloki, 'utf8').trim().split('\n').map((r) => JSON.parse(r));
  assert.deepEqual(rivit.filter((r) => r.jonosta).map((r) => [r.toiminto, r.tulos]), [['herata', 'ok'], ['automaattisiirto', 'ok']]);
});

test('pakkaa: auki oleva kysymys suljetaan Escapella ennen /pakkaa; vastattu kysymys ei auta (käyttäjä 14.10.2026)', async () => {
  const a = { ...ymparisto({ tila: 'waiting' }), escapeTauko: 0 };
  const transkripti = join(a.projektitDir, projektiNimi('/x'), 's1.jsonl');
  const kysymys = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 'k1', name: 'AskUserQuestion', input: { questions: [{ question: 'Mitä?', options: [{ label: 'x' }] }] } }] } });
  writeFileSync(transkripti, kysymys + '\n');
  const v = vaarennos();
  const r = await luoToiminnot(a, { aja: v.aja })('pakkaa', 'a');
  assert.deepEqual(r, { ok: true, toiminto: 'pakkaa', nimi: 'a', istunto: 's1', komento: '/pakkaa', kysymysSuljettiin: true });
  assert.deepEqual(v.kutsut.slice(1), [['tmux', 'send-keys', '-t', '%5', 'Escape'], ['tmux', 'send-keys', '-t', '%5', '-l', '/pakkaa'], ['tmux', 'send-keys', '-t', '%5', 'Enter']]);
  // Vastattu kysymys: waiting ilman auki olevaa kysymystä hylätään kuten ennen.
  writeFileSync(transkripti, kysymys + '\n' + JSON.stringify({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'k1', content: 'x' }] } }) + '\n');
  const v2 = vaarennos();
  await hylkaa(luoToiminnot(a, { aja: v2.aja })('pakkaa', 'a'), 409);
  assert.equal(v2.kutsut.length, 0);
  // Työtä tekevä istunto hylätään, vaikka kysymys näyttäisi auki olevalta.
  writeFileSync(transkripti, kysymys + '\n');
  const busy = { ...ymparisto({ tila: 'busy' }), escapeTauko: 0 };
  mkdirSync(join(busy.projektitDir, projektiNimi('/x')), { recursive: true });
  writeFileSync(join(busy.projektitDir, projektiNimi('/x'), 's1.jsonl'), kysymys + '\n');
  await hylkaa(luoToiminnot(busy, { aja: vaarennos().aja })('pakkaa', 'a'), 409);
});

test('jono: komento putoaa, kun istunto päättyy; vapaa istunto ohittaa jonon', async () => {
  const a = ymparisto({ tila: 'busy' });
  const v = vaarennos();
  const suorita = luoToiminnot(a, { aja: v.aja, jonoVali: 0 });
  await suorita('herata', 'a');
  writeFileSync(join(a.istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's2', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  await suorita.puraJono();
  assert.deepEqual(suorita.jono('a'), []);
  assert.equal(v.kutsut.length, 0);
  // Vapaaseen istuntoon lähetetty komento poistaa saman ryhmän jonorivin.
  const b = ymparisto({ tila: 'busy' });
  const v2 = vaarennos();
  const s2 = luoToiminnot(b, { aja: v2.aja, jonoVali: 0 });
  await s2('herata', 'a');
  writeFileSync(join(b.istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  assert.equal((await s2('herata-pois', 'a')).jonossa, undefined);
  assert.deepEqual(s2.jono('a'), []);
});

test('uusi: tiukka nimi, ei olemassa olevaa', async () => {
  const a = ymparisto();
  const v = vaarennos();
  const suorita = luoToiminnot(a, { aja: v.aja });
  assert.equal((await suorita('uusi', 'claude koe')).osoite, 'https://claude.ai/code/session_abc123');
  assert.equal(v.kutsut[0].at(-1), '/pura uusi claude koe');
  for (const huono of ['', 'Iso', 'a  b', 'a\nb', 'a --rd', 'a — b', '../x', 'a;b', 'a b c d e f g h i j k l m', 'x'.repeat(25), 42, undefined])
    await hylkaa(suorita('uusi', huono), 400);
  await hylkaa(suorita('uusi', 'a'), 409);
  assert.equal(v.kutsut.length, 1);
  assert.ok(UUSI_NIMI.test('scopes'));
  assert.ok(UUSI_NIMI.test('scopes ios mac a b c d e f g h i'));
});

test('yksi toiminto kerrallaan; jokainen yritys lokiin', async () => {
  const a = ymparisto();
  let vapauta;
  const aja = () => new Promise((ok) => { vapauta = () => ok({ koodi: 0, stdout: URL_OK, stderr: '' }); });
  const suorita = luoToiminnot(a, { aja });
  const eka = suorita('pura', 'b');
  await hylkaa(suorita('uusi', 'koe'), 429);
  vapauta();
  await eka;
  await hylkaa(suorita('tuntematon', 'b'), 404);
  const rivit = readFileSync(a.toimintoloki, 'utf8').trim().split('\n').map((r) => JSON.parse(r));
  assert.deepEqual(rivit.map((r) => [r.toiminto, r.tulos]), [['uusi', 'hylätty'], ['pura', 'ok']]);
});

test('istuntoOsoite: vain OK-rivin claude.ai-osoite', () => {
  assert.equal(istuntoOsoite(`x\n${URL_OK}\nSULKU`), 'https://claude.ai/code/session_abc123');
  assert.equal(istuntoOsoite('OK: https://example.com/x'), null);
});

test('palvelin: POST-reitit vaativat avaimen ja ohjautuvat toimintoihin', async () => {
  const avain = 'k'.repeat(32);
  const kutsut = [];
  const suorita = async (toiminto, nimi) => {
    kutsut.push([toiminto, nimi]);
    if (nimi === 'x') throw new Hylatty(409, 'varattu');
    return { ok: true };
  };
  const srv = createServer(kasittelija({ ...ymparisto(), avain }, suorita)).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const laheta = (polku, runko, kayttoavain = avain, method = 'POST') => new Promise((ok, ei) => {
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method, headers: { authorization: `Bearer ${kayttoavain}` } }, (res) => {
      let b = ''; res.on('data', (c) => { b += c; }); res.on('end', () => ok([res.statusCode, JSON.parse(b)]));
    });
    req.on('error', ei); req.end(runko);
  });
  try {
    assert.equal((await laheta('/api/skoopit/a%20b/pura'))[0], 200);
    assert.equal((await laheta('/api/skoopit/a/pakkaa'))[0], 200);
    assert.equal((await laheta('/api/skoopit/a/herata-pois'))[0], 200);
    assert.equal((await laheta('/api/uusi', '{"nimi":"koe"}'))[0], 200);
    assert.deepEqual(await laheta('/api/skoopit/x/pura'), [409, { virhe: 'varattu' }]);
    assert.equal((await laheta('/api/skoopit/a/poista'))[0], 404);
    assert.equal((await laheta('/api/uusi', 'ei json'))[0], 400);
    assert.equal((await laheta('/api/uusi', JSON.stringify({ nimi: 'x'.repeat(2000) })))[0], 413);
    assert.equal((await laheta('/api/skoopit/a/pura', '', 'v'.repeat(32)))[0], 401);
    assert.equal((await laheta('/api/skoopit/a/pura', '', avain, 'DELETE'))[0], 405);
    assert.deepEqual(kutsut, [['pura', 'a b'], ['pakkaa', 'a'], ['herata-pois', 'a'], ['uusi', 'koe'], ['pura', 'x']]);
  } finally { srv.close(); }
});
