// node --test scopes/palvelu/toiminnot.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { projektiNimi } from './lahteet.mjs';
import { kasittelija } from './palvelin.mjs';
import { slug } from '../../claude/siirto/tools/pura-malliton.mjs';
import { Hylatty, istuntoOsoite, luoToiminnot, mallitonSlug, oletusJonotiedosto, paikallinenTmux, UUSI_NIMI } from './toiminnot.mjs';

const URL_OK = 'OK: https://claude.ai/code/session_abc123';

// Skooppi a: elävä tmux-istunto (oma prosessi, ruutu %5). Skooppi b: ei istuntoja.
function ymparisto({ tila = 'idle', tmux = 'siirto-a-1:@1.%5', skoopit = { a: ['R.md'], b: ['R.md'] } } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'scopes-t-'));
  const juuri = join(d, 'juuri');
  mkdirSync(join(juuri, 'claude/siirto/state'), { recursive: true });
  writeFileSync(join(juuri, 'claude/siirto/state/skoopit.json'), JSON.stringify(skoopit));
  const istunnotDir = join(d, 'istunnot');
  mkdirSync(istunnotDir);
  writeFileSync(join(istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: tila, tmux }));
  const projektitDir = join(d, 'projektit');
  mkdirSync(join(projektitDir, projektiNimi('/x')), { recursive: true });
  // listPanes: tyhjä tmux-lista, jottei agy-haku kulje testin aja-väärennöksen kautta.
  return { juuri, istunnotDir, projektitDir, toimintoloki: join(d, 'loki/t.loki'), listPanes: '' };
}

// Kirjaa kutsut; tmux display-message palauttaa oman pidin, autovaihto OK-rivin. perhe = `pura-malliton.mjs --perhe`:n
// vastaus (true → exit 0, false → exit 1, tai valmis tulos).
function vaarennos({ autovaihto = { koodi: 0, stdout: `UUSI: …\n${URL_OK}\n`, stderr: '' }, ruudunPid = process.pid, malliton = { koodi: 0, stdout: 'KIRJOITETTU: x\n', stderr: '' }, perhe = false } = {}) {
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    if (komento !== 'tmux' || argumentit[0] !== 'list-panes') kutsut.push([komento, ...argumentit]);
    if (komento === 'tmux' && argumentit[0] === 'display-message') return { koodi: 0, stdout: `${ruudunPid}\n`, stderr: '' };
    if (komento === 'tmux') return { koodi: 0, stdout: '', stderr: '' };
    if (komento === 'node' && argumentit[1] === '--perhe') return typeof perhe === 'object' ? perhe : { koodi: perhe ? 0 : 1, stdout: `PERHE: ${perhe ? 'kyllä' : 'ei'}\n`, stderr: '' };
    if (komento === 'node') return malliton;
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
  assert.deepEqual(v.kutsut, [['node', join(a.juuri, 'claude/siirto/tools/pura-malliton.mjs'), '--perhe', 'b'],
    ['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'b', '--ei-sulje', '--viesti', '/pura b']]);
  await hylkaa(suorita('pura', 'a'), 409);
  await hylkaa(suorita('pura', 'c; rm -rf /'), 404);
  assert.equal(v.kutsut.length, 2);
});

test('pura: valittu purkaja /pura-lippuna ja istunnon malli autovaihdon --modelina (SCOPES-PURA-MALLI)', async () => {
  const a = ymparisto();
  const v = vaarennos();
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'b', { ajaja: 'paikallinen:qwen/qwen3.6-35b-a3b', malli: 'claude-sonnet-5-5' });
  assert.equal(r.purkaja, 'paikallinen:qwen/qwen3.6-35b-a3b');
  assert.deepEqual(v.kutsut.slice(1), [['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'b', '--ei-sulje', '--model', 'claude-sonnet-5-5',
    '--viesti', '/pura b --ajaja=paikallinen:qwen/qwen3.6-35b-a3b']]);
});

test('pura: pakattu tmux-istunto suljetaan ensin, varattu tai pakkaamaton estää', async () => {
  const pakkaa = (a) => writeFileSync(join(a.projektitDir, projektiNimi('/x'), 's1.jsonl'),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'PAKKAUS: vahvistettu — commit abc' }] } }));
  const a = ymparisto();
  pakkaa(a);
  const v = vaarennos();
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'a');
  assert.deepEqual(r.suljettiin, ['s1']);
  assert.deepEqual(v.kutsut.slice(2), [['tmux', 'send-keys', '-t', '%5', '-l', '/exit'], ['tmux', 'send-keys', '-t', '%5', 'Enter'],
    ['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'a', '--ei-sulje', '--viesti', '/pura a']]);
  const varattu = ymparisto({ tila: 'busy' });
  pakkaa(varattu);
  const v2 = vaarennos();
  await hylkaa(luoToiminnot(varattu, { aja: v2.aja })('pura', 'a'), 409);
  assert.equal(v2.kutsut.length, 0);
  // Ruuduton (puhelimesta avattu) pakattu istunto, joka on yhä autovaihdossa, estää myös.
  const ruuduton = ymparisto({ tila: 'busy', tmux: null });
  pakkaa(ruuduton);
  const v3 = vaarennos();
  await hylkaa(luoToiminnot(ruuduton, { aja: v3.aja })('pura', 'a'), 409);
  assert.equal(v3.kutsut.length, 0);
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

test('sulje: avoin istunto suljetaan Escape ja /exitillä ilman pakkausta', async () => {
  const v = vaarennos();
  const suorita = luoToiminnot(ymparisto(), { aja: v.aja });
  const r = await suorita('sulje', 'a');
  assert.deepEqual(r, { ok: true, toiminto: 'sulje', nimi: 'a', suljettiin: ['s1'], istunto: 's1' });
  assert.deepEqual(v.kutsut.slice(1), [
    ['tmux', 'send-keys', '-t', '%5', 'Escape'],
    ['tmux', 'send-keys', '-t', '%5', '-l', '/exit'],
    ['tmux', 'send-keys', '-t', '%5', 'Enter'],
  ]);
  await hylkaa(suorita('sulje', 'b'), 409);
  await hylkaa(suorita('sulje', 'tuntematon'), 404);
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

test('jono: säilyy palvelun uudelleenkäynnistyksen yli; levyn kelvoton rivi ohitetaan (scopes siirto 14.10.2026)', async () => {
  const a = ymparisto({ tila: 'busy' });
  const tiedosto = oletusJonotiedosto(a);
  assert.equal(tiedosto, join(a.toimintoloki, '../scopes-toiminnot-jono.json'));
  const ensimmainen = luoToiminnot(a, { aja: vaarennos().aja, jonoVali: 0 });
  await ensimmainen('automaattisiirto', 'a');
  await ensimmainen('herata', 'a');
  assert.deepEqual(JSON.parse(readFileSync(tiedosto, 'utf8')).map((j) => j.komento), ['/automaattisiirto', '/sa']);
  // Uusi palvelu samoilla asetuksilla: jono luetaan levyltä ja puretaan, kun istunto vapautuu.
  const v = vaarennos();
  const toinen = luoToiminnot(a, { aja: v.aja, jonoVali: 0 });
  assert.deepEqual(toinen.jono('a').map((j) => j.komento), ['/automaattisiirto', '/sa']);
  writeFileSync(join(a.istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  await toinen.puraJono();
  await toinen.puraJono();
  assert.deepEqual(v.kutsut.filter((k) => k[1] === 'send-keys').map((k) => k.at(-1)), ['/sa', 'Enter', '/automaattisiirto', 'Enter']);
  assert.deepEqual(JSON.parse(readFileSync(tiedosto, 'utf8')), []);
  // Levyltä ei oteta komentoa, jota puhelin ei voisi jonottaa, eikä rikkinäinen tiedosto estä käynnistystä.
  writeFileSync(tiedosto, JSON.stringify([{ nimi: 'a', istunto: 's1', komento: 'rm -rf /', toiminto: 'herata', aika: 1 }, { nimi: 'a', istunto: 's1', komento: '/sa', toiminto: 'herata', aika: 2 }]));
  assert.deepEqual(luoToiminnot(a, { aja: vaarennos().aja, jonoVali: 0 }).jono('a'), [{ komento: '/sa', aika: 2 }]);
  writeFileSync(tiedosto, '{rikki');
  assert.deepEqual(luoToiminnot(a, { aja: vaarennos().aja, jonoVali: 0 }).jono('a'), []);
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

test('uusi: purkaja /pura uusi -lippuna ja istunnon malli --modelina (SCOPES-LISTA-UUSI-VALINNAT)', async () => {
  const a = ymparisto();
  const v = vaarennos();
  const r = await luoToiminnot(a, { aja: v.aja })('uusi', 'koe', { ajaja: 'agy', malli: 'claude-sonnet-5-5' });
  assert.equal(r.purkaja, 'agy');
  assert.deepEqual(v.kutsut, [['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'koe', '--ei-sulje', '--model', 'claude-sonnet-5-5',
    '--viesti', '/pura uusi koe --ajaja=agy']]);
});

test('arkistoi: työkalu, commit vain sen poluista, install.sh; käynnissä oleva istunto estää (SCOPES-LISTA-POISTO)', async () => {
  const a = ymparisto();
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    kutsut.push([komento, ...argumentit]);
    if (komento === 'node') return { koodi: 0, stdout: 'KIRJOITETTU: S.md\nPOISTETTU: V.md\nSIIRRETTY: b/REKISTERI.md → b/REKISTERI.arkistoitu.md\nARKISTOITU: b — …\n', stderr: '' };
    if (komento === 'git' && argumentit[0] === 'rev-parse') return { koodi: 0, stdout: 'abc1234\n', stderr: '' };
    return { koodi: 0, stdout: '', stderr: '' };
  };
  const suorita = luoToiminnot(a, { aja });
  const r = await suorita('arkistoi', 'b');
  assert.equal(r.commit, 'abc1234');
  const polut = ['S.md', 'V.md', 'b/REKISTERI.md', 'b/REKISTERI.arkistoitu.md'];
  assert.deepEqual(r.polut, polut);
  assert.deepEqual(kutsut, [
    ['node', join(a.juuri, 'claude/siirto/tools/arkistoi-skooppi.mjs'), 'b'],
    ['git', 'add', '-A', '--', ...polut],
    ['git', 'commit', '-q', '-m', 'chore(siirto): arkistoi skooppi b (Scopes-äppi)', '--', ...polut],
    ['git', 'rev-parse', '--short', 'HEAD'],
    ['bash', join(a.juuri, 'Infra/skills/install.sh')],
  ]);
  await hylkaa(suorita('arkistoi', 'a'), 409);
  await hylkaa(suorita('arkistoi', 'ei'), 404);
  assert.equal(kutsut.length, 5);
});

test('arkistoi: työkalun hylkäys (alaskooppeja) → 409 eikä committia', async () => {
  const a = ymparisto();
  const kutsut = [];
  const aja = async (komento, argumentit) => { kutsut.push(komento); return { koodi: 1, stdout: '', stderr: 'skoopilla "b" on alaskooppeja (b x): arkistoi ne ensin\n' }; };
  await assert.rejects(luoToiminnot(a, { aja })('arkistoi', 'b'), (e) => e.koodi === 409 && /alaskooppeja/.test(e.message));
  assert.deepEqual(kutsut, ['node']);
});

test('yksi toiminto kerrallaan; jokainen yritys lokiin', async () => {
  const a = ymparisto();
  let vapauta;
  const aja = (_k, argumentit) => _k === 'tmux' ? Promise.resolve({ koodi: 0, stdout: '', stderr: '' })
    : argumentit[1] === '--perhe' ? Promise.resolve({ koodi: 1, stdout: '', stderr: '' })
    : new Promise((ok) => { vapauta = () => ok({ koodi: 0, stdout: URL_OK, stderr: '' }); });
  const suorita = luoToiminnot(a, { aja });
  const eka = suorita('pura', 'b');
  await new Promise((r) => setImmediate(r));
  await hylkaa(suorita('uusi', 'koe'), 429);
  vapauta();
  await eka;
  await hylkaa(suorita('tuntematon', 'b'), 404);
  const rivit = readFileSync(a.toimintoloki, 'utf8').trim().split('\n').map((r) => JSON.parse(r));
  assert.deepEqual(rivit.map((r) => [r.toiminto, r.tulos]), [['uusi', 'hylätty'], ['pura', 'ok']]);
});

const SCOPES = { a: ['scopes/x/REKISTERI.md'], 'b c': ['scopes/y/REKISTERI.md'], e: ['claude/REKISTERI.md'] };
const MALLITON_TIEDOSTO = (nimi) => join(homedir(), '.local/state/pura', `${nimi}.md`);

// Scopes-perhe (PURA-MALLITON T6b): äpin Pura ajaa pura-malliton.mjs:n ja avaa istunnon tiedostoviestillä, ei /pura-taitoa.
test('pura: scopes-perhe → purkutiedosto ja tiedostoviesti, malli säilyy, purkajavalinta ei koske', async () => {
  const a = ymparisto({ skoopit: SCOPES });
  const v = vaarennos({ perhe: true });
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'b c', { ajaja: 'claude-cli:claude-haiku-5-5', malli: 'claude-sonnet-5-5' });
  assert.deepEqual(r, { ok: true, toiminto: 'pura', nimi: 'b c', osoite: 'https://claude.ai/code/session_abc123', suljettiin: [], tiedosto: MALLITON_TIEDOSTO('b-c'), malli: 'claude-sonnet-5-5' });
  const malliton = join(a.juuri, 'claude/siirto/tools/pura-malliton.mjs');
  assert.deepEqual(v.kutsut, [
    ['node', malliton, '--perhe', 'b c'],
    ['node', malliton, 'b c', '--kohde', 'claude'],
    ['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'b c', '--ei-sulje', '--model', 'claude-sonnet-5-5',
      '--viesti', `Malliton purku: lue ${MALLITON_TIEDOSTO('b-c')} ja noudata sitä.`]]);
  assert.ok(!v.kutsut.some((k) => k.at(-1)?.startsWith('/pura')), 'perheelle lähti /pura');
});

test('pura: muu skooppi → /pura ennallaan', async () => {
  const a = ymparisto({ skoopit: SCOPES });
  const v = vaarennos({ perhe: false });
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'e', { ajaja: 'claude-cli:claude-haiku-5-5' });
  assert.equal(r.tiedosto, undefined);
  assert.deepEqual(v.kutsut.map((k) => k.at(-1)), ['e', '/pura e --ajaja=claude-cli:claude-haiku-5-5']);
});

test('pura: slug on sama kuin pura-malliton.mjs:ssä', () => {
  for (const n of ['a', 'b c', 'claude r&d2', 'x  y']) assert.equal(mallitonSlug(n), slug(n));
});

test('pura: perheen käynnissä oleva tai varattu istunto estää ennen ajoa, pakattu suljetaan tiedoston jälkeen', async () => {
  const pakkaa = (a) => writeFileSync(join(a.projektitDir, projektiNimi('/x'), 's1.jsonl'),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'PAKKAUS: vahvistettu — commit abc' }] } }));
  const kaynnissa = ymparisto({ skoopit: SCOPES });
  const v = vaarennos({ perhe: true });
  await hylkaa(luoToiminnot(kaynnissa, { aja: v.aja })('pura', 'a'), 409);
  const varattu = ymparisto({ tila: 'busy', skoopit: SCOPES });
  pakkaa(varattu);
  await hylkaa(luoToiminnot(varattu, { aja: v.aja })('pura', 'a'), 409);
  assert.equal(v.kutsut.length, 0);
  const a = ymparisto({ skoopit: SCOPES });
  pakkaa(a);
  const v2 = vaarennos({ perhe: true });
  assert.deepEqual((await luoToiminnot(a, { aja: v2.aja })('pura', 'a')).suljettiin, ['s1']);
  assert.deepEqual(v2.kutsut.slice(0, 5).map((k) => k[0]), ['node', 'node', 'tmux', 'tmux', 'tmux']);
  assert.deepEqual(v2.kutsut[1].slice(2), ['a', '--kohde', 'claude', '--suljettavat', 's1']);
  assert.deepEqual(v2.kutsut.slice(3, 5), [['tmux', 'send-keys', '-t', '%5', '-l', '/exit'], ['tmux', 'send-keys', '-t', '%5', 'Enter']]);
});

test('pura: perheen pura-malliton exit 1 → 500 eikä istuntoa avata eikä mallireittiä', async () => {
  const v = vaarennos({ perhe: true, malliton: { koodi: 1, stdout: '', stderr: 'alku\npura-malliton: ' + 'x'.repeat(400) + '\n' } });
  await assert.rejects(luoToiminnot(ymparisto({ skoopit: SCOPES }), { aja: v.aja })('pura', 'b c'),
    (e) => e instanceof Hylatty && e.koodi === 500 && e.message.startsWith('pura-malliton: xxx') && e.message.length === 300);
  assert.deepEqual(v.kutsut.map((k) => k[0]), ['node', 'node']);
});

test('pura: --perhe-tarkistuksen virhe → 500 eikä istuntoa', async () => {
  const v = vaarennos({ perhe: { koodi: 2, stdout: '', stderr: 'Käyttö: pura-malliton.mjs --perhe\n' } });
  await assert.rejects(luoToiminnot(ymparisto({ skoopit: SCOPES }), { aja: v.aja })('pura', 'b c'),
    (e) => e instanceof Hylatty && e.koodi === 500 && /Käyttö/.test(e.message));
  assert.deepEqual(v.kutsut.map((k) => k[0]), ['node']);
});

test('pura: perheen pura-malliton exit 4 → ok + varoitus', async () => {
  const v = vaarennos({ perhe: true, malliton: { koodi: 4, stdout: 'VAROITUS: x\n', stderr: '' } });
  const r = await luoToiminnot(ymparisto({ skoopit: SCOPES }), { aja: v.aja })('pura', 'b c');
  assert.equal(r.ok, true);
  assert.equal(r.varoitus, true);
  assert.equal(r.tiedosto, MALLITON_TIEDOSTO('b-c'));
  assert.deepEqual(v.kutsut.map((k) => k[0]), ['node', 'node', 'bash']);
});

test('pura-testi: poistunut toiminto on tuntematon (404) eikä kutsu mitään', async () => {
  const v = vaarennos({ perhe: true });
  await assert.rejects(luoToiminnot(ymparisto({ skoopit: SCOPES }), { aja: v.aja })('pura-testi', 'b c'),
    (e) => e instanceof Hylatty && e.koodi === 404 && e.message === 'tuntematon toiminto');
  assert.deepEqual(v.kutsut, []);
});

test('istuntoOsoite: vain OK-rivin claude.ai-osoite', () => {
  assert.equal(istuntoOsoite(`x\n${URL_OK}\nSULKU`), 'https://claude.ai/code/session_abc123');
  assert.equal(istuntoOsoite('OK: https://example.com/x'), null);
  assert.equal(paikallinenTmux('UUSI: …\nOK: paikallinen tmux siirto-b-120000\n'), 'siirto-b-120000');
  assert.equal(paikallinenTmux('OK: paikallinen tmux x;y'), null);
});

test('pura: paikallisen mallin istunto palauttaa tmux-nimen osoitteen tilalla', async () => {
  const a = ymparisto();
  const v = vaarennos({ autovaihto: { koodi: 0, stdout: 'UUSI: …\nOK: paikallinen tmux siirto-b-120000\n', stderr: '' } });
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'b', { malli: 'palvelin/qwen/qwen3-coder-30b' });
  assert.deepEqual(r, { ok: true, toiminto: 'pura', nimi: 'b', tmux: 'siirto-b-120000', suljettiin: [], malli: 'palvelin/qwen/qwen3-coder-30b' });
  assert.deepEqual(v.kutsut.at(-1), ['bash', join(a.juuri, 'claude/siirto/tools/autovaihto.sh'), 'vaihda', 'b', '--ei-sulje', '--model', 'palvelin/qwen/qwen3-coder-30b', '--viesti', '/pura b']);
});

test('pura: mac-agy mallin istunto palauttaa tmux-nimen osoitteen tilalla', async () => {
  const a = ymparisto({ skoopit: { 'scopes test': ['R.md'] } });
  const v = vaarennos({ perhe: true, autovaihto: { koodi: 0, stdout: 'UUSI: …\nOK: mac-agy tmux siirto-scopes-test-120000\n', stderr: '' } });
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'scopes test', { malli: 'mac-agy/gemini-3.8-flash-high' });
  assert.deepEqual(r, { ok: true, toiminto: 'pura', nimi: 'scopes test', tmux: 'siirto-scopes-test-120000', suljettiin: [], tiedosto: '~/.local/state/pura/scopes-test.md', malli: 'mac-agy/gemini-3.8-flash-high' });
});

test('pura: mac-agy mallin istunto toimii myös infra expresso -skoopille', async () => {
  const a = ymparisto({ skoopit: { 'infra expresso': ['Infra/iot/expresso/REKISTERI.md'] } });
  const v = vaarennos({ perhe: true, autovaihto: { koodi: 0, stdout: 'UUSI: …\nOK: mac-agy tmux siirto-infra-expresso-120000\n', stderr: '' } });
  const r = await luoToiminnot(a, { aja: v.aja })('pura', 'infra expresso', { malli: 'mac-agy/gemini-3.8-flash-high' });
  assert.deepEqual(r, { ok: true, toiminto: 'pura', nimi: 'infra expresso', tmux: 'siirto-infra-expresso-120000', suljettiin: [], tiedosto: '~/.local/state/pura/infra-expresso.md', malli: 'mac-agy/gemini-3.8-flash-high' });
});

test('palvelin: POST-reitit vaativat avaimen ja ohjautuvat toimintoihin', async () => {
  const avain = 'k'.repeat(32);
  const kutsut = [];
  const valinnat = [];
  const suorita = async (toiminto, nimi, valinta) => {
    kutsut.push([toiminto, nimi]);
    if (valinta) valinnat.push(valinta);
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
    assert.deepEqual(await laheta('/api/skoopit/a/pura-testi'), [404, { virhe: 'tuntematon toiminto' }]);
    assert.equal((await laheta('/api/skoopit/a/herata-pois'))[0], 200);
    assert.equal((await laheta('/api/uusi', '{"nimi":"koe"}'))[0], 200);
    assert.deepEqual(await laheta('/api/skoopit/x/pura'), [409, { virhe: 'varattu' }]);
    assert.equal((await laheta('/api/skoopit/a/poista'))[0], 404);
    assert.equal((await laheta('/api/uusi', 'ei json'))[0], 400);
    assert.equal((await laheta('/api/uusi', JSON.stringify({ nimi: 'x'.repeat(2000) })))[0], 413);
    assert.equal((await laheta('/api/skoopit/a/pura', '', 'v'.repeat(32)))[0], 401);
    assert.equal((await laheta('/api/skoopit/a/pura', '', avain, 'DELETE'))[0], 405);
    assert.equal((await laheta('/api/skoopit/a/pura', '{"malli":"claude-sonnet-5-5"}'))[0], 200);
    assert.deepEqual(await laheta('/api/skoopit/a/pura', '{"malli":"gpt-4"}'), [400, { virhe: 'tuntematon istunnon malli gpt-4' }]);
    assert.equal((await laheta('/api/skoopit/a/arkistoi'))[0], 200);
    assert.equal((await laheta('/api/skoopit/a/sulje'))[0], 200);
    assert.equal((await laheta('/api/uusi', '{"nimi":"koe2","malli":"claude-sonnet-5-5"}'))[0], 200);
    // IPA-lataus ilman tiedostoa palauttaa 404
    assert.deepEqual(await laheta('/api/ios/ipa', '', avain, 'GET'), [404, { virhe: 'Skoopit.ipa ei löydy, aja scopes/ios/asenna.sh --ipa' }]);
    // Kyselyparametriavain toimii myös ilman Authorization-otsaketta
    const ilmanOtsaketta = (polku) => new Promise((ok, ei) => {
      const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method: 'GET' }, (res) => {
        let b = ''; res.on('data', (c) => { b += c; }); res.on('end', () => ok([res.statusCode, JSON.parse(b)]));
      });
      req.on('error', ei); req.end();
    });
    assert.deepEqual(await ilmanOtsaketta('/api/ios/ipa'), [401, { virhe: 'avain puuttuu tai väärä' }]);
    assert.deepEqual(await ilmanOtsaketta(`/api/ios/ipa?avain=${avain}`), [404, { virhe: 'Skoopit.ipa ei löydy, aja scopes/ios/asenna.sh --ipa' }]);
    assert.deepEqual(kutsut, [['pura', 'a b'], ['pakkaa', 'a'], ['herata-pois', 'a'], ['uusi', 'koe'], ['pura', 'x'], ['pura', 'a'],
      ['arkistoi', 'a'], ['sulje', 'a'], ['uusi', 'koe2']]);
    assert.deepEqual(valinnat, [{ ajaja: null, malli: null }, { ajaja: null, malli: null }, { ajaja: null, malli: null }, { ajaja: null, malli: 'claude-sonnet-5-5' },
      { ajaja: null, malli: 'claude-sonnet-5-5' }]);
  } finally { srv.close(); }
});

// ISTUNNOT-SUORITUSKYKY: istuntohaku on asynkroninen, joten päällekkäiset jonokierrokset eivät saa lähettää samaa komentoa kahdesti.
test('jono: kaksi samanaikaista kierrosta lähettää jonossa olevan komennon kerran', async () => {
  const a = ymparisto({ tila: 'busy' });
  const v = vaarennos();
  const suorita = luoToiminnot(a, { aja: v.aja, jonoVali: 0 });
  assert.equal((await suorita('herata', 'a')).jonossa, true);
  writeFileSync(join(a.istunnotDir, `${process.pid}.json`),
    JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  await Promise.all([suorita.puraJono(), suorita.puraJono()]);
  assert.deepEqual(v.kutsut.filter((k) => k[1] === 'send-keys').map((k) => k.at(-1)), ['/sa', 'Enter']);
  assert.deepEqual(suorita.jono('a'), []);
});

test('automaattisiirto-vahti: laukeaa kun kytkin on päällä, kontekstiraja täyttynyt ja istunto pysähtynyt', async () => {
  const a = ymparisto({ tila: 'idle' });
  const transkriptiPolku = join(a.projektitDir, projektiNimi('/x'), 's1.jsonl');
  writeFileSync(transkriptiPolku, JSON.stringify({ type: 'assistant', message: { usage: { input_tokens: 125_000 } } }) + '\n');
  const v = vaarennos();
  const kytkimetPois = { lue: () => ({ automaattisiirto: false }), lueIstunto: () => ({ automaattisiirto: false }) };
  const kytkimetPaalla = { lue: () => ({ automaattisiirto: true }), lueIstunto: () => ({ automaattisiirto: true }) };

  const suorita = luoToiminnot(a, { aja: v.aja, jonoVali: 0, kytkimet: kytkimetPois });
  // 1. Kytkin pois: ei laukea
  assert.deepEqual(await suorita.tarkistaAutomaattisiirto(), []);
  assert.equal(v.kutsut.length, 0);

  // 2. Kytkin päälle, mutta konteksti alle rajan (esim. 50k): ei laukea
  writeFileSync(transkriptiPolku, JSON.stringify({ type: 'assistant', message: { usage: { input_tokens: 50_000 } } }) + '\n');
  suorita.asetaKytkimet(kytkimetPaalla);
  assert.deepEqual(await suorita.tarkistaAutomaattisiirto(), []);
  assert.equal(v.kutsut.length, 0);

  // 3. Konteksti yli rajan (125k), mutta istunto busy: ei laukea
  writeFileSync(transkriptiPolku, JSON.stringify({ type: 'assistant', message: { usage: { input_tokens: 125_000 } } }) + '\n');
  writeFileSync(join(a.istunnotDir, `${process.pid}.json`),
    JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'busy', tmux: 'siirto-a-1:@1.%5' }));
  assert.deepEqual(await suorita.tarkistaAutomaattisiirto(), []);
  assert.equal(v.kutsut.length, 0);

  // 4. Istunto muuttuu idleksi: laukeaa!
  writeFileSync(join(a.istunnotDir, `${process.pid}.json`),
    JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  const tulokset = await suorita.tarkistaAutomaattisiirto();
  assert.equal(tulokset.length, 1);
  assert.equal(tulokset[0].skooppi, 'a');
  assert.equal(tulokset[0].komento, '/automaattisiirto');
  assert.deepEqual(v.kutsut.filter((k) => k[1] === 'send-keys').map((k) => k.at(-1)), ['/automaattisiirto', 'Enter']);

  // 5. Seuraava tarkistuskierros: ei laukaise uudelleen samalle istunnolle
  v.kutsut.length = 0;
  assert.deepEqual(await suorita.tarkistaAutomaattisiirto(), []);
  assert.equal(v.kutsut.length, 0);
});
