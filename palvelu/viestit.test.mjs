// node --test scopes/palvelu/viestit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { projektiNimi } from './lahteet.mjs';
import { kasittelija } from './palvelin.mjs';
import { Hylatty } from './toiminnot.mjs';
import { AGY_MALLIT, GEMINI_AGENTTI, geminiKehote, istunnonAsetukset, keskustelu, luoViestit, mallinNayttonimi, MALLIT, paikallisetMallit, transkriptissa, tyokaluRivi } from './viestit.mjs';

const ID = '38c487b9-3c36-4723-b2af-5f07b106c172';
const rivi = (o) => JSON.stringify(o);
const TRANSKRIPTI = [
  rivi({ type: 'user', message: { content: '<command-name>/pura</command-name>\n<command-args>a</command-args>' }, timestamp: 't1' }),
  rivi({ type: 'user', isMeta: true, message: { content: 'meta' } }),
  rivi({ type: 'assistant', message: { content: [{ type: 'text', text: 'Purku valmis.' }, { type: 'tool_use', name: 'Bash' }] }, timestamp: 't2' }),
  rivi({ type: 'user', message: { content: [{ type: 'tool_result', content: 'x' }] } }),
  rivi({ type: 'assistant', isSidechain: true, message: { content: [{ type: 'text', text: 'ali' }] } }),
  rivi({ type: 'user', message: { content: '<system-reminder>r</system-reminder>' } }),
  rivi({ type: 'user', message: { content: 'jatka' }, timestamp: 't3' }),
].join('\n');

// Skooppi a: elävä tmux-istunto (oma prosessi, ruutu %5) ja transkripti. Skooppi b: ei istuntoja.
function ymparisto({ tmux = 'siirto-a-1:@1.%5' } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'scopes-v-'));
  const juuri = join(d, 'juuri');
  mkdirSync(join(juuri, 'claude/siirto/state'), { recursive: true });
  writeFileSync(join(juuri, 'claude/siirto/state/skoopit.json'), JSON.stringify({ a: ['R.md'], b: ['R.md'] }));
  const istunnotDir = join(d, 'istunnot');
  mkdirSync(istunnotDir);
  writeFileSync(join(istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'busy', tmux }));
  const projektitDir = join(d, 'projektit');
  mkdirSync(join(projektitDir, projektiNimi('/x')), { recursive: true });
  writeFileSync(join(projektitDir, projektiNimi('/x'), 's1.jsonl'), TRANSKRIPTI);
  // listPanes: tyhjä tmux-lista, jottei agy-haku kulje testin aja-väärennöksen kautta; agy-testit antavat omansa.
  return { juuri, istunnotDir, projektitDir, chatDir: join(d, 'chat'), listPanes: '', nebiusTiedosto: join(d, 'ei-nebius-avainta') };
}

// claude -p --output-format stream-json: tekstin palat stream_event-riveinä, lopuksi result-rivi.
const delta = (text) => rivi({ type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text } } });
const lohko = (type) => rivi({ type: 'stream_event', event: { type: 'content_block_start', content_block: { type } } });
const VIRTA = [rivi({ type: 'system', subtype: 'init' }), lohko('thinking'),
  rivi({ type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'thinking_delta', thinking: 'mietin' } } }),
  lohko('text'), delta('h'), delta('ei'), 'ei json',
  rivi({ type: 'result', subtype: 'success', result: 'hei', session_id: ID, total_cost_usd: 0.01, is_error: false })].join('\n') + '\n';

// LM Studio palvelimella ssh:n yli: mallilista ja SSE-virta (ajattelu reasoning_content-kentässä).
const LMS_LISTA = JSON.stringify({ data: [{ id: 'qwen/qwen3.6-35b-a3b' }, { id: 'text-embedding-nomic' }, { id: 'paha; rm' }] });
const sse = (delta) => `data: ${JSON.stringify({ choices: [{ delta }] })}`;
const LMS_VIRTA = [sse({ reasoning_content: 'mietin' }), '', sse({ content: 'moi' }), sse({ content: ' sinulle' }), 'data: [DONE]'].join('\n') + '\n';
const PAIKALLINEN = 'palvelin/qwen/qwen3.6-35b-a3b';

function vaarennos(claude = { koodi: 0, stdout: VIRTA, stderr: '' }, lms = { koodi: 0, stdout: LMS_LISTA, stderr: '' }) {
  const kutsut = [];
  const aja = async (komento, argumentit, valinnat = {}) => {
    kutsut.push({ komento, argumentit, ...valinnat });
    if (komento === 'ssh' && argumentit.at(-1).includes('/v1/models')) return lms;
    if (komento === 'ssh' && argumentit.at(-1).includes('lms load')) return { koodi: 0, stdout: '', stderr: '' };
    if (komento === 'ssh') {
      for (const r of LMS_VIRTA.split('\n')) if (r && valinnat.riville) valinnat.riville(r);
      return { koodi: 0, stdout: LMS_VIRTA, stderr: '' };
    }
    if (komento === 'tmux' && argumentit[0] === 'display-message') return { koodi: 0, stdout: `${process.pid}\n`, stderr: '' };
    if (komento === 'tmux') return { koodi: 0, stdout: '', stderr: '' };
    for (const r of claude.stdout.split('\n')) if (r && valinnat.riville) valinnat.riville(r);
    return claude;
  };
  return { aja, kutsut };
}

// Istunto, joka ottaa viestin vastaan: syöttökenttä kerää -l-tekstit, C-u tyhjentää sen, ja Enter kirjoittaa kentän
// transkriptiin käyttäjän viestinä (V-305). kentta = Claude Coden kenttään palauttama perutun vuoron viesti (V-515).
function vastaanottava(polku, { aja, kutsut } = vaarennos(), kentta = '') {
  let teksti = kentta;
  return { kutsut, aja: async (komento, argumentit, valinnat) => {
    if (komento === 'tmux' && argumentit[0] === 'send-keys' && argumentit[3] === 'C-u') teksti = '';
    if (komento === 'tmux' && argumentit[0] === 'send-keys' && argumentit[3] === '-l') teksti += argumentit[4];
    if (komento === 'tmux' && argumentit[0] === 'send-keys' && argumentit[3] === 'Enter' && teksti) { appendFileSync(polku, `\n${rivi({ type: 'user', message: { content: teksti } })}`); teksti = ''; }
    return aja(komento, argumentit, valinnat);
  } };
}
const s1 = (a) => join(a.projektitDir, projektiNimi('/x'), 's1.jsonl');

const hylkaa = async (lupaus, koodi) => assert.rejects(lupaus, (e) => e instanceof Hylatty && e.koodi === koodi);

test('paikallisetMallit: LM Studion lista, upotukset ja kelvottomat pois', () => {
  assert.deepEqual(paikallisetMallit(LMS_LISTA), [{ nimi: PAIKALLINEN, kuvaus: 'Qwen3.6 35B A3B', tyyppi: 'paikallinen' }]);
  assert.deepEqual(paikallisetMallit(JSON.stringify({ data: [{ id: 'qwen/qwen3.5-9b' }, { id: 'qwen/qwen3.5-9b/qwen3.5-9b-q4_k_m.gguf' }] }))
    .map((m) => m.kuvaus), ['Qwen3.5 9B', 'Qwen3.5 9B Q4_K_M']);
  assert.deepEqual(paikallisetMallit(''), []);
  assert.deepEqual(paikallisetMallit('{"data":5}'), []);
});

test('mallinNayttonimi: ilman tiedosto- ja kvantisointipäätettä, koot isolla (V-330)', () => {
  assert.equal(mallinNayttonimi('qwen3.5-9b-q4_k_m.gguf'), 'Qwen3.5 9B');
  assert.equal(mallinNayttonimi('qwen/qwen3.6-35b-a3b'), 'Qwen3.6 35B A3B');
  assert.equal(mallinNayttonimi('llama-3.1-8b-instruct-iq4_xs'), 'Llama 3.1 8B Instruct');
  assert.equal(mallinNayttonimi('lmstudio-community/gemma-3-12b-it-Q8_0'), 'Gemma 3 12B It');
  assert.equal(mallinNayttonimi('mistral-7b-instruct-v0.3'), 'Mistral 7B Instruct v0.3');
});

test('keskustelu: teksti, komennot ja työkalurivit; ei tuloksia, metaa eikä ali-agentteja', () => {
  assert.deepEqual(keskustelu(TRANSKRIPTI), [
    { rooli: 'kayttaja', teksti: '/pura a', aika: 't1' },
    { rooli: 'agentti', teksti: 'Purku valmis.', aika: 't2' },
    { rooli: 'tyokalu', teksti: 'Bash', aika: 't2' },
    { rooli: 'kayttaja', teksti: 'jatka', aika: 't3' },
  ]);
  assert.equal(keskustelu(TRANSKRIPTI, 1).length, 1);
});

test('keskustelu: monivalinta kysymyksenä vaihtoehtoineen, vastaus käyttäjän viestinä', () => {
  const kysy = { type: 'tool_use', id: 'k1', name: 'AskUserQuestion', input: { questions: [
    { question: 'Mitä tehdään?', header: 'Jatko', multiSelect: false, options: [{ label: 'Aloita', description: 'paketti' }, { label: 'Ei mitään' }] }] } };
  const t = [
    rivi({ type: 'assistant', timestamp: 'a1', message: { content: [{ type: 'text', text: 'Valitse:' }, kysy] } }),
    rivi({ type: 'user', timestamp: 'a2', message: { content: [{ type: 'tool_result', tool_use_id: 'k1', content: 'answered' }] },
      toolUseResult: { answers: { 'Mitä tehdään?': 'Aloita' } } }),
    rivi({ type: 'user', timestamp: 'a3', message: { content: [{ type: 'tool_result', tool_use_id: 'muu', content: 'x' }] } }),
  ].join('\n');
  assert.deepEqual(keskustelu(t), [
    { rooli: 'agentti', teksti: 'Valitse:', aika: 'a1' },
    { rooli: 'kysymys', teksti: 'Mitä tehdään?\n1. Aloita\n2. Ei mitään', aika: 'a1', vastattu: true, kysymykset: [
      { kysymys: 'Mitä tehdään?', otsikko: 'Jatko', monivalinta: false, vaihtoehdot: [{ nimi: 'Aloita', kuvaus: 'paketti' }, { nimi: 'Ei mitään', kuvaus: null }] }] },
    { rooli: 'kayttaja', teksti: 'Aloita', aika: 'a2' },
  ]);
  assert.equal(keskustelu(t.split('\n')[0])[1].vastattu, false);
  // Keskeytetty kysymys: perässä muu viesti ilman tool_resultia → ei enää auki.
  const keskeytys = [t.split('\n')[0], rivi({ type: 'user', timestamp: 'a4', message: { content: 'muuta tekstiä' } })].join('\n');
  assert.equal(keskustelu(keskeytys)[1].vastattu, true);
});

test('tyokaluRivi: komento, muokattu tiedosto, lyhennys', () => {
  assert.equal(tyokaluRivi({ name: 'Bash', input: { command: 'git status\ngit log' } }), '$ git status');
  assert.equal(tyokaluRivi({ name: 'Bash', input: { command: 'cd "/a b" && npm test' } }), '$ npm test');
  assert.equal(tyokaluRivi({ name: 'Edit', input: { file_path: '/a/b/c.swift' } }), '✎ /a/b/c.swift');
  assert.equal(tyokaluRivi({ name: 'Write', input: { file_path: '/a/d.md' } }), '✎ /a/d.md');
  assert.equal(tyokaluRivi({ name: 'Read', input: { file_path: '/a/b/c.swift' } }), 'luki c.swift');
  assert.equal(tyokaluRivi({ name: 'Grep', input: { pattern: 'x+' } }), 'haki x+');
  assert.equal(tyokaluRivi({ name: 'Agent', input: { description: 'tutki' } }), 'ali-agentti: tutki');
  assert.equal(tyokaluRivi({ name: 'Bash', input: { command: 'x'.repeat(200) } }).length, 122);
});

test('chat: keskusteluhistoria transkripteista, agentti talteen', async () => {
  const a = ymparisto();
  const dir = join(a.projektitDir, projektiNimi(a.chatDir));
  mkdirSync(dir, { recursive: true });
  const ID2 = '00000000-0000-4000-8000-000000000002';
  writeFileSync(join(dir, `${ID}.jsonl`), [
    rivi({ type: 'user', message: { content: 'eka kysymys' }, timestamp: 't1' }),
    rivi({ type: 'assistant', message: { model: 'claude-haiku-5-5', content: [{ type: 'text', text: 'vastaus' }] }, timestamp: 't2' }),
  ].join('\n'));
  writeFileSync(join(dir, `${ID2}.jsonl`), rivi({ type: 'user', message: { content: 'toinen' } }));
  writeFileSync(join(dir, 'ei-tunnus.jsonl'), rivi({ type: 'user', message: { content: 'x' } }));
  const v = luoViestit(a, { aja: vaarennos().aja });
  const lista = v.keskustelut();
  assert.deepEqual(lista.map((k) => k.id).sort(), [ID2, ID]);
  const eka = lista.find((k) => k.id === ID);
  assert.equal(eka.otsikko, 'eka kysymys');
  assert.equal(eka.agentti, 'claude-haiku-5-5');
  assert.equal(eka.viesteja, 2);
  assert.equal(lista.find((k) => k.id === ID2).agentti, null);
  const k = v.keskustelunViestit(ID);
  assert.equal(k.agentti, 'claude-haiku-5-5');
  assert.deepEqual(k.viestit.map((x) => x.teksti), ['eka kysymys', 'vastaus']);
  // Paikallisen mallin keskustelu talletetaan palvelussa ja näkyy samassa listassa.
  const p = await v.chat({ agentti: PAIKALLINEN, viesti: 'paikallinen kysymys' });
  const pk = v.keskustelut().find((x) => x.id === p.keskustelu);
  assert.equal(pk.agentti, PAIKALLINEN);
  assert.equal(pk.otsikko, 'paikallinen kysymys');
  assert.deepEqual(v.keskustelunViestit(p.keskustelu).viestit.map((x) => x.teksti), ['paikallinen kysymys', 'moi sinulle']);
  assert.throws(() => v.keskustelunViestit('../x'), (e) => e.koodi === 400);
  assert.throws(() => v.keskustelunViestit('00000000-0000-4000-8000-000000000009'), (e) => e.koodi === 404);
  assert.deepEqual(luoViestit(ymparisto(), { aja: vaarennos().aja }).keskustelut(), []);
});

test('chat: malli, agentti ja jatko; viesti stdinissä, ei työkaluja', async () => {
  const a = ymparisto();
  const { aja, kutsut } = vaarennos();
  const v = luoViestit(a, { aja });
  assert.deepEqual(await v.chat({ agentti: 'claude-haiku-5-5', viesti: 'moi; rm -rf /' }),
    { vastaus: 'hei', keskustelu: ID, agentti: 'claude-haiku-5-5', kustannus: 0.01 });
  assert.deepEqual(kutsut[0].argumentit, ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
    '--tools', '', '--model', 'claude-haiku-5-5']);
  assert.equal(kutsut[0].syote, 'moi; rm -rf /');
  assert.equal(kutsut[0].cwd, a.chatDir);
  await v.chat({ agentti: 'claude-opus-5-5', viesti: 'x', keskustelu: ID });
  assert.deepEqual(kutsut[1].argumentit.slice(7), ['--model', 'claude-opus-5-5', '--resume', ID]);
  assert.equal((await v.agentit()).length, MALLIT.length + AGY_MALLIT.length + 1);
  assert.equal((await v.agentit()).length, MALLIT.length + AGY_MALLIT.length + 1);
  assert.equal(kutsut.filter((k) => k.komento === 'ssh').length, 1, 'mallilista välimuistista');
});

test('chat: paikallinen malli ssh:n yli — viestit JSON-rungossa, ajattelu pois, jatko samalla mallilla', async () => {
  const a = ymparisto();
  const { aja, kutsut } = vaarennos();
  const v = luoViestit(a, { aja });
  const palat = [];
  const r = await v.chat({ agentti: PAIKALLINEN, viesti: "moi'; rm -rf /" }, { pala: (t) => palat.push(t) });
  assert.equal(r.vastaus, 'moi sinulle');
  assert.deepEqual(palat, ['moi', ' sinulle']);
  // Ennen pyyntöä malli ladataan, ja muu ladattu malli puretaan (mallin vaihto).
  assert.match(kutsut.at(-2).argumentit.at(-1), /grep -qF '"identifier":"qwen\/qwen3\.6-35b-a3b"' \|\| \{ \$L unload --all/);
  const ajo = kutsut.at(-1);
  assert.equal(ajo.komento, 'ssh');
  assert.ok(!ajo.argumentit.some((x) => x.includes('rm -rf')), 'viesti komentorivillä');
  assert.deepEqual(JSON.parse(ajo.syote), { model: 'qwen/qwen3.6-35b-a3b', stream: true, messages: [{ role: 'user', content: "moi'; rm -rf /" }] });
  await v.chat({ agentti: PAIKALLINEN, viesti: 'jatko', keskustelu: r.keskustelu });
  assert.deepEqual(JSON.parse(kutsut.at(-1).syote).messages.map((m) => m.role), ['user', 'assistant', 'user']);
  await hylkaa(v.chat({ agentti: PAIKALLINEN, viesti: 'x', keskustelu: '00000000-0000-4000-8000-000000000009' }), 404);
  await hylkaa(v.chat({ agentti: 'palvelin/ei-ole', viesti: 'x' }), 400);
  // palvelin pois päältä: vain Claude-mallit.
  const pois = luoViestit(a, { aja: vaarennos(undefined, { koodi: 255, stdout: '', stderr: 'timeout' }).aja });
  assert.equal((await pois.agentit()).length, MALLIT.length + AGY_MALLIT.length);
});

test('chat: suoratoisto — palat sitä mukaa, ajattelu pois, tekstilohkot erotettu', async () => {
  const a = ymparisto();
  const palat = [];
  let alkoi = 0;
  const ohjain = new AbortController();
  const { aja, kutsut } = vaarennos();
  const v = luoViestit(a, { aja });
  const tulos = await v.chat({ agentti: 'claude-haiku-5-5', viesti: 'x' }, { pala: (t) => palat.push(t), alku: () => alkoi++, signal: ohjain.signal });
  assert.deepEqual(palat, ['h', 'ei']);
  assert.equal(alkoi, 1);
  assert.equal(tulos.vastaus, 'hei');
  assert.equal(kutsut[0].signal.aborted, false);
  ohjain.abort();
  assert.equal(kutsut[0].signal.aborted, true);
  const kaksi = [lohko('text'), delta('a'), lohko('text'), delta('b'), rivi({ type: 'result', result: 'a\n\nb', session_id: ID })].join('\n');
  const palat2 = [];
  await luoViestit(a, { aja: vaarennos({ koodi: 0, stdout: kaksi, stderr: '' }).aja }).chat({ agentti: 'claude-haiku-5-5', viesti: 'x' }, { pala: (t) => palat2.push(t) });
  assert.equal(palat2.join(''), 'a\n\nb');
  // Hylkäys ennen käynnistystä ei kutsu alkua.
  await hylkaa(v.chat({ agentti: 'paha', viesti: 'x' }, { alku: () => alkoi++ }), 400);
  assert.equal(alkoi, 1);
});

test('chat: hylkäykset', async () => {
  const a = ymparisto();
  const { aja, kutsut } = vaarennos();
  const v = luoViestit(a, { aja });
  await hylkaa(v.chat({ agentti: 'paha; rm', viesti: 'x' }), 400);
  await hylkaa(v.chat({ agentti: 'claude-opus-5-5', viesti: '  ' }), 400);
  await hylkaa(v.chat({ agentti: 'claude-opus-5-5', viesti: 'x', keskustelu: '--help' }), 400);
  await hylkaa(v.chat({ agentti: 'claude-opus-5-5', viesti: 'x'.repeat(8001) }), 413);
  assert.equal(kutsut.length, 0);
  const virhe = luoViestit(a, { aja: vaarennos({ koodi: 1, stdout: '', stderr: 'auth\n' }).aja });
  await hylkaa(virhe.chat({ agentti: 'claude-opus-5-5', viesti: 'x' }), 502);
});

test('skoopinViestit: auki tai ei', async () => {
  const v = luoViestit(ymparisto(), { aja: vaarennos().aja });
  const auki = await v.skoopinViestit('a');
  assert.equal(auki.auki, true);
  assert.equal(auki.voiLahettaa, true);
  assert.equal(auki.istunto.id, 's1');
  assert.equal(auki.viestit.length, 4);
  assert.deepEqual(await v.skoopinViestit('b'), { nimi: 'b', auki: false, pakattu: false, istunto: null, voiLahettaa: false, viestit: [] });
  await assert.rejects(v.skoopinViestit('c'), (e) => e.koodi === 404);
});

// Käyttäjä 13.10.2026: pakkauksen jälkeen skoopin keskustelu tyhjenee ja Pura jatkaa samassa näkymässä;
// automaattisiirron uusi istunto korvaa vanhan.
test('skoopinViestit: pakattu istunto piiloon, uusin pakkaamaton näkyy', async () => {
  const a = ymparisto();
  const kansio = join(a.projektitDir, projektiNimi('/x'));
  const PAKATTU = `${TRANSKRIPTI}\n${rivi({ type: 'assistant', message: { content: [{ type: 'text', text: 'PAKKAUS: vahvistettu — commit abc' }] } })}`;
  writeFileSync(join(kansio, 's1.jsonl'), PAKATTU);
  const v = luoViestit(a, { aja: vaarennos().aja });
  assert.deepEqual(await v.skoopinViestit('a'), { nimi: 'a', auki: false, pakattu: true, istunto: null, voiLahettaa: false, viestit: [] });
  await hylkaa(v.lahetaSkooppiin('a', 'x'), 409);
  // Uusi istunto (automaattisiirto tai Pura) samassa skoopissa: se näkyy, ja viestit menevät sen ruutuun.
  writeFileSync(join(a.istunnotDir, `${process.ppid}.json`), JSON.stringify({ pid: process.ppid, sessionId: 's2', cwd: '/x', name: 'a', status: 'idle', startedAt: 2, tmux: 'siirto-a-2:@2.%6' }));
  writeFileSync(join(kansio, 's2.jsonl'), rivi({ type: 'user', message: { content: '<command-name>/pura</command-name>\n<command-args>a --autojatko</command-args>' } }));
  const uusi = await v.skoopinViestit('a');
  assert.equal(uusi.istunto.id, 's2');
  assert.equal(uusi.voiLahettaa, true);
  assert.deepEqual(uusi.viestit.map((x) => x.teksti), ['/pura a --autojatko']);
  // Vanha istunto ei vielä pakattu (siirron päällekkäisyys): uusin näkyy, mutta lähetys odottaa yhtä ruutua.
  writeFileSync(join(kansio, 's1.jsonl'), TRANSKRIPTI);
  const kaksi = await v.skoopinViestit('a');
  assert.equal(kaksi.istunto.id, 's2');
  assert.equal(kaksi.voiLahettaa, false);
});

test('lahetaSkooppiin: kirjaimellisesti ruutuun, rivinvaihdot välilyönneiksi', async () => {
  const a = ymparisto();
  const { aja, kutsut } = vastaanottava(s1(a));
  const v = luoViestit(a, { aja });
  assert.deepEqual(await v.lahetaSkooppiin('a', 'eka\n toka'), { ok: true, istunto: 's1' });
  assert.deepEqual(kutsut.slice(1).map((k) => k.argumentit), [['send-keys', '-t', '%5', 'C-u'], ['send-keys', '-t', '%5', '-l', 'eka toka'], ['send-keys', '-t', '%5', 'Enter']]);
  await hylkaa(v.lahetaSkooppiin('b', 'x'), 409);
  await hylkaa(v.lahetaSkooppiin('a', ''), 400);
  const sdk = ymparisto();
  writeFileSync(join(sdk.istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', entrypoint: 'sdk-cli', tmux: 'rc:@0.%0' }));
  await hylkaa(luoViestit(sdk, { aja }).lahetaSkooppiin('a', 'x'), 409);
  const eiTmux = luoViestit(ymparisto({ tmux: '' }), { aja });
  await hylkaa(eiTmux.lahetaSkooppiin('a', 'x'), 409);
});

test('lahetaSkooppiin: auki oleva monivalinta suljetaan Escapella ennen tekstiä', async () => {
  const a = ymparisto();
  const polku = join(a.projektitDir, projektiNimi('/x'), 's1.jsonl');
  const kysy = { type: 'tool_use', id: 'k1', name: 'AskUserQuestion', input: { questions: [{ question: 'Q?', options: [{ label: 'A' }] }] } };
  writeFileSync(polku, rivi({ type: 'assistant', timestamp: 't', message: { content: [kysy] } }));
  const { aja, kutsut } = vastaanottava(polku);
  await luoViestit({ ...a, escapeTauko: 0 }, { aja }).lahetaSkooppiin('a', 'oma vastaus');
  assert.deepEqual(kutsut.slice(1).map((k) => k.argumentit),
    [['send-keys', '-t', '%5', 'Escape'], ['send-keys', '-t', '%5', 'C-u'], ['send-keys', '-t', '%5', '-l', 'oma vastaus'], ['send-keys', '-t', '%5', 'Enter']]);
});

// V-515 16.10.2026: perutun vuoron viesti jäi kenttään, ja uusi liimautui perään ('Selvitä virhe/pakkaa').
test('lahetaSkooppiin: syöttökenttään jäänyt teksti tyhjennetään ennen viestiä', async () => {
  const a = ymparisto();
  await luoViestit(a, { aja: vastaanottava(s1(a), vaarennos(), 'Selvitä virhe').aja }).lahetaSkooppiin('a', '/pakkaa');
  const viimeinen = readFileSync(s1(a), 'utf8').trim().split('\n').at(-1);
  assert.equal(JSON.parse(viimeinen).message.content, '/pakkaa');
});

// V-305 14.10.2026: viestit jäivät istunnon syöttökenttään, eikä äppi tiennyt siitä.
test('lahetaSkooppiin: viesti, joka ei näy transkriptissa, on 504 ja kirjataan ruudun kanssa', async () => {
  const a = { ...ymparisto(), perillaRaja: 0, toimintoloki: join(mkdtempSync(join(tmpdir(), 'scopes-l-')), 't.loki') };
  const { aja, kutsut } = vaarennos();
  await hylkaa(luoViestit(a, { aja }).lahetaSkooppiin('a', 'jumiin jäävä'), 504);
  assert.deepEqual(kutsut.at(-1).argumentit, ['capture-pane', '-p', '-t', '%5']);
  const [r] = readFileSync(a.toimintoloki, 'utf8').trim().split('\n').map((x) => JSON.parse(x));
  assert.equal(r.toiminto, 'viesti');
  assert.equal(r.tulos, 'ei näkynyt');
  assert.equal(r.alku, 'jumiin jäävä');
  assert.deepEqual(r.ruutu, []);
  // Perillä: kirjataan ok, ja aiempi sama teksti transkriptissa ei kelpaa todisteeksi.
  const ok = { ...ymparisto(), perillaRaja: 0, toimintoloki: a.toimintoloki };
  await luoViestit(ok, vastaanottava(s1(ok))).lahetaSkooppiin('a', 'jatka');
  assert.equal(JSON.parse(readFileSync(a.toimintoloki, 'utf8').trim().split('\n')[1]).tulos, 'ok');
  await hylkaa(luoViestit({ ...ymparisto(), perillaRaja: 0 }, { aja }).lahetaSkooppiin('a', 'jatka'), 504);
});

test('transkriptissa: käyttäjän viesti, jonoon mennyt komento ja yhdistetyt viestit; ali-agentti ei', () => {
  assert.equal(transkriptissa(rivi({ type: 'user', message: { content: [{ type: 'text', text: 'moi  sinä' }] } }), 'moi sinä'), true);
  assert.equal(transkriptissa(rivi({ type: 'attachment', attachment: { type: 'queued_command', prompt: 'Jatka' } }), 'Jatka'), true);
  assert.equal(transkriptissa(rivi({ type: 'queue-operation', operation: 'enqueue', content: 'Jatka' }), 'Jatka'), true);
  assert.equal(transkriptissa(rivi({ type: 'user', message: { content: 'eka\nJatkaJatka' } }), 'Jatka'), true);
  assert.equal(transkriptissa(rivi({ type: 'user', isSidechain: true, message: { content: 'Jatka' } }), 'Jatka'), false);
  assert.equal(transkriptissa(rivi({ type: 'assistant', message: { content: [{ type: 'text', text: 'Jatka' }] } }), 'Jatka'), false);
});

// Ajo, joka kirjoittaa init-rivin ja ensimmäisen palan ja jää odottamaan, kunnes signal katkaisee sen.
function pysahtyva(alkurivit) {
  const kutsut = [];
  const aja = (komento, argumentit, valinnat = {}) => new Promise((ok) => {
    kutsut.push({ komento, argumentit, ...valinnat });
    if (komento === 'ssh' && argumentit.at(-1).includes('.lmstudio')) return ok({ koodi: 0, stdout: '', stderr: '' });
    for (const r of alkurivit) valinnat.riville?.(r);
    valinnat.signal.addEventListener('abort', () => ok({ koodi: -1, stdout: alkurivit.join('\n'), stderr: '' }));
  });
  return { aja, kutsut };
}

test('pysaytaChat: osittainen vastaus palaa keskeytettynä, jatko samaan keskusteluun; ilman ajoa 409', async () => {
  const a = ymparisto();
  const { aja } = pysahtyva([rivi({ type: 'system', subtype: 'init', session_id: ID }), lohko('text'), delta('puoli')]);
  const v = luoViestit(a, { aja });
  assert.throws(() => v.pysaytaChat(), (e) => e instanceof Hylatty && e.koodi === 409);
  const palat = [];
  const kesken = v.chat({ agentti: 'claude-haiku-5-5', viesti: 'x' }, { pala: (t) => palat.push(t) });
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(v.pysaytaChat(), { ok: true });
  assert.deepEqual(await kesken, { vastaus: 'puoli', keskustelu: ID, agentti: 'claude-haiku-5-5', kustannus: null, keskeytetty: true });
  assert.deepEqual(palat, ['puoli']);
  assert.equal(JSON.parse(readFileSync(join(a.chatDir, 'agentit.json'), 'utf8'))[ID], 'claude-haiku-5-5');
  assert.throws(() => v.pysaytaChat(), (e) => e instanceof Hylatty && e.koodi === 409);
  // Paikallinen malli: käyttäjän viesti ja osittainen vastaus historiaan.
  const lms = pysahtyva([sse({ content: 'puo' })]);
  const p = luoViestit(a, { aja: async (k, ar, va) => (ar.at(-1).includes('/v1/models') ? { koodi: 0, stdout: LMS_LISTA, stderr: '' } : lms.aja(k, ar, va)) });
  const pk = p.chat({ agentti: PAIKALLINEN, viesti: 'kysy' });
  while (!lms.kutsut.some((k) => k.argumentit.at(-1).includes('chat/completions'))) await new Promise((r) => setImmediate(r));
  p.pysaytaChat();
  const pt = await pk;
  assert.equal(pt.vastaus, 'puo');
  assert.equal(pt.keskeytetty, true);
  assert.deepEqual(p.keskustelunViestit(pt.keskustelu).viestit.map((x) => x.teksti), ['kysy', 'puo']);
});

test('pysaytaSkooppi: työskentelevä istunto saa Escapen; vapaa 409', async () => {
  const a = ymparisto();
  const { aja, kutsut } = vaarennos();
  assert.deepEqual(await luoViestit(a, { aja }).pysaytaSkooppi('a'), { ok: true, istunto: 's1' });
  assert.deepEqual(kutsut.slice(1).map((k) => k.argumentit), [['send-keys', '-t', '%5', 'Escape']]);
  writeFileSync(join(a.istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  await hylkaa(luoViestit(a, { aja: vaarennos().aja }).pysaytaSkooppi('a'), 409);
});

test('suljeKysymys: auki oleva monivalinta suljetaan pelkällä Escapella; muuten 409', async () => {
  const a = ymparisto();
  const polku = join(a.projektitDir, projektiNimi('/x'), 's1.jsonl');
  const kysy = { type: 'tool_use', id: 'k1', name: 'AskUserQuestion', input: { questions: [{ question: 'Q?', options: [{ label: 'A' }] }] } };
  writeFileSync(polku, rivi({ type: 'assistant', timestamp: 't', message: { content: [kysy] } }));
  const { aja, kutsut } = vaarennos();
  await luoViestit(a, { aja }).suljeKysymys('a');
  assert.deepEqual(kutsut.slice(1).map((k) => k.argumentit), [['send-keys', '-t', '%5', 'Escape']]);
  writeFileSync(polku, rivi({ type: 'assistant', timestamp: 't', message: { content: [{ type: 'text', text: 'moi' }] } }));
  await hylkaa(luoViestit(a, { aja: vaarennos().aja }).suljeKysymys('a'), 409);
});

test('palvelin: chat- ja viestipolut avaimella, iso runko sallittu', async () => {
  const a = ymparisto();
  const avain = 'k'.repeat(32);
  const { aja } = vastaanottava(s1(a));
  const srv = createServer(kasittelija({ ...a, avain }, undefined, luoViestit(a, { aja }))).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const hae = (polku, method = 'GET', runko = null, k = avain, ndjson = false) => new Promise((ok, ei) => {
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method, headers: { authorization: `Bearer ${k}` } }, (res) => {
      let d = '';
      res.on('data', (p) => { d += p; });
      res.on('end', () => ok({ koodi: res.statusCode, tyyppi: res.headers['content-type'],
        data: ndjson ? d.trim().split('\n').map((r) => JSON.parse(r)) : JSON.parse(d) }));
    });
    req.on('error', ei);
    req.end(runko ? JSON.stringify(runko) : undefined);
  });
  try {
    assert.equal((await hae('/api/agentit')).data.length, MALLIT.length + AGY_MALLIT.length + 1);
    assert.equal((await hae('/api/agentit', 'GET', null, 'vaara')).koodi, 401);
    const c = await hae('/api/chat', 'POST', { agentti: 'claude-haiku-5-5', viesti: 'x'.repeat(5000) });
    assert.equal(c.koodi, 200);
    assert.equal(c.data.vastaus, 'hei');
    assert.equal((await hae('/api/skoopit/a/viestit')).data.auki, true);
    // Suoratoisto: NDJSON-rivit, palat ja lopuksi valmis; hylkäys ennen käynnistystä tavallisena virhekoodina.
    const virta = await hae('/api/chat/virta', 'POST', { agentti: 'claude-haiku-5-5', viesti: 'x' }, avain, true);
    assert.equal(virta.koodi, 200);
    assert.match(virta.tyyppi, /^application\/x-ndjson/);
    assert.deepEqual(virta.data.map((r) => r.tyyppi), ['pala', 'pala', 'valmis']);
    assert.equal(virta.data.filter((r) => r.tyyppi === 'pala').map((r) => r.teksti).join(''), 'hei');
    assert.equal(virta.data.at(-1).keskustelu, ID);
    const hylatty = await hae('/api/chat/virta', 'POST', { agentti: 'paha', viesti: 'x' });
    assert.equal(hylatty.koodi, 400);
    assert.equal(hylatty.data.virhe, 'tuntematon agentti');
    assert.equal((await hae('/api/chat/virta', 'POST', { agentti: 'claude-haiku-5-5', viesti: 'x' }, 'vaara')).koodi, 401);
    assert.equal((await hae('/api/chat/keskustelut')).koodi, 200);
    assert.equal((await hae('/api/chat/keskustelut/x')).koodi, 400);
    assert.equal((await hae('/api/skoopit/b/viestit')).data.auki, false);
    assert.equal((await hae('/api/skoopit/a/viesti', 'POST', { teksti: 'moi' })).koodi, 200);
    assert.equal((await hae('/api/skoopit/b/viesti', 'POST', { teksti: 'moi' })).koodi, 409);
  } finally {
    srv.close();
  }
});

test('palvelin: katkennut virta ei pysäytä agenttia, ja kaynnissa liittyy siihen uudelleen', async () => {
  const a = ymparisto();
  const avain = 'k'.repeat(32);
  let jatka;
  const odota = new Promise((r) => { jatka = r; });
  let ensimmainen;
  const saatu = new Promise((r) => { ensimmainen = r; });
  const aja = async (komento, argumentit, valinnat = {}) => {
    const [alku, loppu] = [VIRTA.split('\n').slice(0, 5), VIRTA.split('\n').slice(5)];
    for (const r of alku) if (r) valinnat.riville(r);
    await odota;
    for (const r of loppu) if (r) valinnat.riville(r);
    return { koodi: 0, stdout: VIRTA, stderr: '' };
  };
  const srv = createServer(kasittelija({ ...a, avain }, undefined, luoViestit(a, { aja }))).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const ndjson = (polku, method, runko, kesken) => new Promise((ok, ei) => {
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method, headers: { authorization: `Bearer ${avain}` } }, (res) => {
      let d = '';
      res.on('data', (p) => { d += p; kesken?.(d, req); });
      res.on('end', () => ok({ koodi: res.statusCode, rivit: d.trim().split('\n').filter(Boolean).map((r) => JSON.parse(r)) }));
    });
    req.on('error', ei);
    req.end(runko ? JSON.stringify(runko) : undefined);
  });
  try {
    assert.equal((await ndjson('/api/chat/kaynnissa', 'GET')).koodi, 404);
    // Puhelin katkaisee yhteyden ensimmäisen palan jälkeen (näyttölukko).
    ndjson('/api/chat/virta', 'POST', { agentti: 'claude-haiku-5-5', viesti: 'x' }, (d, req) => { if (d.includes('"h"')) { req.destroy(); ensimmainen(); } })
      .catch(() => {});
    await saatu;
    const uudelleen = ndjson('/api/chat/kaynnissa', 'GET');
    await new Promise((r) => setTimeout(r, 50));
    jatka();
    const { koodi, rivit } = await uudelleen;
    assert.equal(koodi, 200);
    assert.deepEqual(rivit.map((r) => r.tyyppi), ['pala', 'pala', 'valmis']);
    assert.equal(rivit[0].teksti, 'h');
    assert.equal(rivit.at(-1).keskustelu, ID);
    // Valmis ajo on yhä liityttävissä: koko teksti yhtenä palana ja lopputulos.
    const myohemmin = await ndjson('/api/chat/kaynnissa', 'GET');
    assert.deepEqual(myohemmin.rivit, [{ tyyppi: 'pala', teksti: 'hei' }, rivit.at(-1)]);
  } finally {
    srv.close();
  }
});

test('geminiKehote: ensimmäinen viesti sellaisenaan, jatko historian kanssa, vanhimmat pois rajalla', () => {
  assert.equal(geminiKehote([], 'moi'), 'moi');
  const h = [{ rooli: 'kayttaja', teksti: 'eka' }, { rooli: 'agentti', teksti: 'vastaus' }];
  assert.equal(geminiKehote(h, 'toka'), 'Jatka alla olevaa keskustelua ja vastaa vain viimeiseen viestiin.\n\n[Aiempi keskustelu]\nMinä: eka\nGemini: vastaus\n\n[Uusi viesti]\ntoka');
  const pitka = geminiKehote([{ rooli: 'kayttaja', teksti: 'A'.repeat(5000) }, { rooli: 'agentti', teksti: 'B'.repeat(5000) }], 'uusi', 8000);
  // Uusin viesti kokonaan, vanhemmasta loppuosa.
  assert.ok(pitka.length <= 8000 && pitka.includes(`Gemini: ${'B'.repeat(5000)}\n`) && pitka.includes('\n…AAA') && pitka.endsWith('uusi'));
});

test('chat: Gemini (Android) — vain android-olion kanssa, historia talteen, jatko kehotteessa', async () => {
  const a = ymparisto();
  const saadut = [];
  const android = () => ({ async kysyGeminilta({ teksti, pala }) { saadut.push(teksti); pala?.('Vas'); return { vastaus: `Vastaus ${saadut.length}` }; } });
  const v = luoViestit(a, { aja: vaarennos().aja, android });
  assert.ok((await v.agentit()).some((x) => x.nimi === GEMINI_AGENTTI.nimi && x.tyyppi === 'gemini'));
  const palat = [];
  const r = await v.chat({ agentti: 'android/gemini', viesti: 'eka' }, { pala: (t) => palat.push(t) });
  assert.deepEqual([r.vastaus, r.agentti, palat], ['Vastaus 1', 'android/gemini', ['Vas']]);
  await v.chat({ agentti: 'android/gemini', viesti: 'toka', keskustelu: r.keskustelu });
  assert.equal(saadut[0], 'eka');
  assert.match(saadut[1], /Minä: eka\nGemini: Vastaus 1\n\n\[Uusi viesti\]\ntoka$/);
  assert.deepEqual(v.keskustelunViestit(r.keskustelu).viestit.map((x) => x.teksti), ['eka', 'Vastaus 1', 'toka', 'Vastaus 2']);
  assert.ok(v.keskustelut().some((k) => k.id === r.keskustelu && k.agentti === 'android/gemini'));
  const ilman = luoViestit(a, { aja: vaarennos().aja });
  assert.ok(!(await ilman.agentit()).some((x) => x.tyyppi === 'gemini'));
  await hylkaa(ilman.chat({ agentti: 'android/gemini', viesti: 'x' }), 400);
});

const ASETUKSET_RIVI = (malli, effort, lisa = {}) => rivi({ type: 'assistant', perTurnEffort: effort, message: { model: malli, content: [{ type: 'text', text: 'x' }] }, ...lisa });

test('istunnonAsetukset: viimeisen pääketjun assistant-rivin malli ja effort (MALLINAPPI)', async () => {
  const t = [ASETUKSET_RIVI('claude-opus-5-5', 'high'), ASETUKSET_RIVI('claude-sonnet-5-5', 'max'), ASETUKSET_RIVI('claude-haiku-5-5', 'low', { isSidechain: true })].join('\n');
  assert.deepEqual(istunnonAsetukset(t), { malli: 'claude-sonnet-5-5', effort: 'max' });
  assert.deepEqual(istunnonAsetukset(ASETUKSET_RIVI('claude-opus-5-5', undefined)), { malli: 'claude-opus-5-5', effort: null });
  assert.deepEqual(istunnonAsetukset(TRANSKRIPTI), { malli: null, effort: null });
  assert.deepEqual(istunnonAsetukset(''), { malli: null, effort: null });
  const a = ymparisto();
  appendFileSync(s1(a), `\n${ASETUKSET_RIVI('claude-opus-5-5', 'xhigh')}`);
  const i = (await luoViestit(a, { aja: vaarennos().aja }).skoopinViestit('a')).istunto;
  assert.equal(i.malli, 'claude-opus-5-5');
  assert.equal(i.effort, 'xhigh');
});

test('vaihdaMalli: /model ja /effort ruutuun vain vapaassa istunnossa, arvot listoilta', async () => {
  const a = ymparisto();
  const vapaa = () => writeFileSync(join(a.istunnotDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 's1', cwd: '/x', name: 'a', status: 'idle', tmux: 'siirto-a-1:@1.%5' }));
  const { aja, kutsut } = vaarennos();
  const v = luoViestit({ ...a, malliTauko: 0 }, { aja });
  await hylkaa(v.vaihdaMalli('a', { malli: 'claude-opus-5-5' }), 409); // busy
  vapaa();
  await hylkaa(v.vaihdaMalli('a', {}), 400);
  await hylkaa(v.vaihdaMalli('a', { malli: 'rm -rf; claude-opus-5-5' }), 400);
  await hylkaa(v.vaihdaMalli('a', { effort: 'ultra' }), 400);
  await hylkaa(v.vaihdaMalli('b', { effort: 'high' }), 409);
  // Valitsin: kohdistin rivillä 4 (Sonnet 5.5), Opus 5.5 on rivillä 2; "Default"-rivin Sonnet 5.5 ei saa osua.
  const MALLIVALITSIN = ['   Select model', '     1.  Default (recommended)  Sonnet 5.5', '     2.  Opus 5.5   For complex work', '     3.  Fable 5.1', '   ❯ 4.  Sonnet 5.5 ✔', '     5.  Haiku 5.5', '     7.  Sonnet 5'].join('\n');
  let ruutu = '';
  const ohjattu = async (komento, argumentit, valinnat) => {
    if (komento === 'tmux' && argumentit[0] === 'capture-pane') return { koodi: 0, stdout: ruutu, stderr: '' };
    if (komento === 'tmux' && argumentit.at(-1) === '-l') return aja(komento, argumentit, valinnat);
    if (komento === 'tmux' && argumentit[3] === '-l' && argumentit[4] === '/model') ruutu = MALLIVALITSIN;
    if (komento === 'tmux' && argumentit[3] === '-l' && argumentit[4] === '/effort') ruutu = 'Effort';
    if (komento === 'tmux' && argumentit[3] === '-l' && argumentit[4] === 's') ruutu = ruutu === 'Effort' ? 'Set effort level to max (this session only)' : 'Set model to Opus 5.5 for this session only';
    return aja(komento, argumentit, valinnat);
  };
  const w = luoViestit({ ...a, malliTauko: 0 }, { aja: ohjattu });
  const ennen = kutsut.length;
  assert.deepEqual(await w.vaihdaMalli('a', { malli: 'claude-opus-5-5', effort: 'max' }), { ok: true, istunto: 's1' });
  const tmux = kutsut.slice(ennen).filter((k) => k.komento === 'tmux' && k.argumentit[0] === 'send-keys').map((k) => k.argumentit.slice(3));
  assert.deepEqual(tmux, [
    ['C-u'], ['-l', '/model'], ['Enter'], ['Up', 'Up'], ['-l', 's'],
    ['C-u'], ['-l', '/effort'], ['Enter'], ['Left', 'Left', 'Left', 'Left'], ['Right', 'Right', 'Right', 'Right'], ['-l', 's']]);
  assert.ok(!tmux.some((k) => k[1]?.startsWith('/model ') || k[1]?.startsWith('/effort ')), 'suora komento tallentaisi globaalin oletuksen');
  // Mallia ei löydy valitsimesta → Escape ja 502, ei vaihtoa.
  ruutu = '';
  const tyhja = luoViestit({ ...a, malliTauko: 0 }, { aja: async (k, ar, v) => (k === 'tmux' && ar[0] === 'capture-pane' ? { koodi: 0, stdout: 'ei valitsinta', stderr: '' } : aja(k, ar, v)) });
  await hylkaa(tyhja.vaihdaMalli('a', { malli: 'claude-opus-5-5' }), 502);
  // V-525: "Change effort level?" -vahvistusta ei hyväksytä; Escape sulkee sen, 409 eikä Enteriä.
  const IKKUNA = '   Change effort level?\n   ❯ 1. Yes, switch to medium\n     2. No, go back';
  for (const sulkeutuu of [true, false]) {
    let nakyy = false;
    const lahetetyt = [];
    const ikkunallinen = luoViestit({ ...a, malliTauko: 0 }, { aja: async (k, ar, v) => {
      if (k === 'tmux' && ar[0] === 'capture-pane') return { koodi: 0, stdout: nakyy ? IKKUNA : 'Effort', stderr: '' };
      if (k === 'tmux' && ar[0] === 'send-keys') {
        lahetetyt.push(ar.slice(3));
        if (ar[3] === '-l' && ar[4] === 's') nakyy = true;
        if (ar[3] === 'Escape' && sulkeutuu) nakyy = false;
        if (ar[3] === '-l' && ar[4] === '2' && sulkeutuu) nakyy = false;
      }
      return aja(k, ar, v);
    } });
    await hylkaa(ikkunallinen.vaihdaMalli('a', { effort: 'medium' }), 409);
    assert.ok(lahetetyt.some((k) => k[0] === 'Escape'), 'ikkuna suljetaan Escapella');
    assert.ok(!lahetetyt.some((k) => k[0] === 'Enter' && lahetetyt.indexOf(k) > lahetetyt.findIndex((x) => x[1] === 's')), 'vahvistusta ei hyväksytä Enterillä');
  }
});

// AGY-PRE-ISTUNTO (16.10.2026): skoopilla ei ole Claude-istuntoa mutta tmuxissa on agy-ruutu → viestit agy:n keskustelutiedostosta,
// lähetys ruutuun ja perillä vasta, kun tiedostossa on uusi käyttäjän viesti.
test('agy-istunto: viestit, tila ja lähetys (palvelin ei sano "skooppi ei ole auki")', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const varint = (n) => { const t = []; do { let x = n % 128; n = Math.floor(n / 128); if (n) x |= 0x80; t.push(x); } while (n); return Buffer.from(t); };
  const num = (f, x) => Buffer.concat([varint(f * 8), varint(x)]);
  const msg = (f, ...o) => { const b = Buffer.concat(o); return Buffer.concat([varint(f * 8 + 2), varint(b.length), b]); };
  const str = (f, s) => msg(f, Buffer.from(s, 'utf8'));
  const aika = msg(5, msg(1, num(1, 1792141799)));
  const kayttaja = (t) => Buffer.concat([num(1, 14), aika, msg(19, str(2, t))]);
  const agentti = (t) => Buffer.concat([num(1, 15), aika, msg(20, str(1, t))]);
  const a = ymparisto();
  a.agyHakemisto = join(a.juuri, '../agy');
  mkdirSync(a.agyHakemisto);
  const polku = join(a.agyHakemisto, 'k1.db');
  const db = new DatabaseSync(polku);
  db.exec('CREATE TABLE steps (idx integer, step_type integer NOT NULL DEFAULT 0, step_payload blob, PRIMARY KEY (idx))');
  const lisaa = (i, t, p) => db.prepare('INSERT INTO steps VALUES (?, ?, ?)').run(i, t, p);
  lisaa(0, 14, kayttaja('Malliton purku: lue /x/b.md ja noudata sitä.'));
  lisaa(1, 15, agentti('Raportti. Vastaa numerolla.'));
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    kutsut.push([komento, ...argumentit]);
    if (argumentit[0] === 'list-panes') return { koodi: 0, stdout: `siirto-b-120000 agy ${Math.floor(Date.now() / 1000)}\n`, stderr: '' };
    if (argumentit[0] === 'capture-pane') return { koodi: 0, stdout: '>\n? for shortcuts   Gemini 3.8 Flash · high\n', stderr: '' };
    if (argumentit.includes('Enter')) lisaa(2, 14, kayttaja('1'));
    return { koodi: 0, stdout: '', stderr: '' };
  };
  const v = luoViestit(a, { aja, perillaVali: 5, perillaRaja: 500 });
  const k = await v.agyViestit('b');
  assert.equal(k.auki, true);
  assert.equal(k.voiLahettaa, true);
  assert.deepEqual([k.istunto.id, k.istunto.tila, k.istunto.malli], ['siirto-b-120000', 'idle', null]);
  assert.deepEqual(k.viestit.map((x) => `${x.rooli}:${x.teksti}`), ['kayttaja:Malliton purku: lue /x/b.md ja noudata sitä.', 'agentti:Raportti. Vastaa numerolla.']);
  assert.equal(await v.agyViestit('a'), null, 'skoopilla a on Claude-istunto, agy ei korvaa sitä');
  assert.deepEqual(await v.lahetaSkooppiin('b', '1'), { ok: true, istunto: 'siirto-b-120000' });
  assert.deepEqual(kutsut.filter((c) => c[1] === 'send-keys').map((c) => c.slice(4)), [['C-u'], ['-l', '1'], ['Enter']]);
  db.close();
});

test('agy-istunto: viesti, joka ei näy keskustelutiedostossa → 504', async () => {
  const a = ymparisto();
  a.agyHakemisto = join(a.juuri, '../agy-tyhja');
  mkdirSync(a.agyHakemisto);
  const aja = async (komento, argumentit) => argumentit[0] === 'list-panes'
    ? { koodi: 0, stdout: `siirto-b-120000 agy ${Math.floor(Date.now() / 1000)}\n`, stderr: '' } : { koodi: 0, stdout: '', stderr: '' };
  const v = luoViestit(a, { aja, perillaVali: 5, perillaRaja: 60 });
  await assert.rejects(v.lahetaSkooppiin('b', 'moi'), (e) => e instanceof Hylatty && e.koodi === 504);
});

test('skoopinViestit: AGY-istunto palautuu skoopinViestit-kutsusta suoraan ilman agyViestit-varareittiä', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const varint = (n) => { const t = []; do { let x = n % 128; n = Math.floor(n / 128); if (n) x |= 0x80; t.push(x); } while (n); return Buffer.from(t); };
  const num = (f, x) => Buffer.concat([varint(f * 8), varint(x)]);
  const msg = (f, ...o) => { const b = Buffer.concat(o); return Buffer.concat([varint(f * 8 + 2), varint(b.length), b]); };
  const str = (f, s) => msg(f, Buffer.from(s, 'utf8'));
  const aika = msg(5, msg(1, num(1, 1792141799)));
  const kayttaja = (t) => Buffer.concat([num(1, 14), aika, msg(19, str(2, t))]);
  const agentti = (t) => Buffer.concat([num(1, 15), aika, msg(20, str(1, t))]);

  const a = ymparisto();
  a.agyHakemisto = join(a.juuri, '../agy-suora');
  mkdirSync(a.agyHakemisto);
  const polku = join(a.agyHakemisto, 'k2.db');
  const db = new DatabaseSync(polku);
  db.exec('CREATE TABLE steps (idx integer, step_type integer NOT NULL DEFAULT 0, step_payload blob, PRIMARY KEY (idx))');
  const lisaa = (i, t, p) => db.prepare('INSERT INTO steps VALUES (?, ?, ?)').run(i, t, p);
  lisaa(0, 14, kayttaja('Malliton purku: lue /x/b.md ja noudata sitä.'));
  lisaa(1, 15, agentti('Valmis'));

  a.listPanes = () => `siirto-b-120000 agy ${Math.floor(Date.now() / 1000)} 9999\n`;
  a.capturePane = () => '> \n? for shortcuts   Gemini 3.8 Flash · high\n';

  const v = luoViestit(a);
  const res = await v.skoopinViestit('b');
  assert.equal(res.auki, true);
  assert.equal(res.voiLahettaa, true);
  assert.equal(res.istunto.id, 'siirto-b-120000');
  assert.equal(res.istunto.tila, 'idle');
  assert.equal(res.viestit.length, 2);
  assert.equal(res.viestit[0].teksti, 'Malliton purku: lue /x/b.md ja noudata sitä.');
  assert.equal(res.viestit[1].teksti, 'Valmis');
  db.close();
});

test('agy-istunto: ask_question vastaaminen valinnalla ja write-inillä sekä suljeKysymys', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const varint = (n) => { const t = []; do { let x = n % 128; n = Math.floor(n / 128); if (n) x |= 0x80; t.push(x); } while (n); return Buffer.from(t); };
  const num = (f, x) => Buffer.concat([varint(f * 8), varint(x)]);
  const msg = (f, ...o) => { const b = Buffer.concat(o); return Buffer.concat([varint(f * 8 + 2), varint(b.length), b]); };
  const str = (f, s) => msg(f, Buffer.from(s, 'utf8'));
  const aika = msg(5, msg(1, num(1, 1792141799)));
  const kayttaja = (t) => Buffer.concat([num(1, 14), aika, msg(19, str(2, t))]);
  const agentti = (t) => Buffer.concat([num(1, 15), aika, msg(20, str(1, t))]);

  const kyselyArgs = JSON.stringify({
    questions: [{
      question: 'Vahvistatko?',
      options: ['Kyllä', 'Ei']
    }]
  });
  const kyselyToolCall = (argsJson, vastausVal = null) => {
    const f4inner = Buffer.concat([str(2, 'ask_question'), str(3, argsJson)]);
    const f4 = msg(4, f4inner);
    const f5 = msg(5, f4);
    const osat = [num(1, 132), aika, f5, str(7, argsJson)];
    if (vastausVal != null) {
      const innerObj = Buffer.concat([str(1, 'Vahvistatko?'), str(4, String(vastausVal))]);
      const f22 = msg(22, msg(1, innerObj));
      const f2 = msg(2, f22);
      const f147 = msg(147, f2);
      osat.push(f147);
    }
    return Buffer.concat(osat);
  };

  const a = ymparisto();
  a.agyHakemisto = join(a.juuri, '../agy-kysely');
  mkdirSync(a.agyHakemisto);
  const polku = join(a.agyHakemisto, 'k-kysely.db');
  const db = new DatabaseSync(polku);
  db.exec('CREATE TABLE steps (idx integer, step_type integer NOT NULL DEFAULT 0, step_payload blob, PRIMARY KEY (idx))');
  const lisaa = (i, t, p) => db.prepare('INSERT INTO steps VALUES (?, ?, ?)').run(i, t, p);
  lisaa(0, 14, kayttaja('Malliton purku: lue /x/b.md ja noudata sitä.'));
  lisaa(1, 15, agentti('Kysyn varmistuksen'));
  lisaa(2, 132, kyselyToolCall(kyselyArgs));

  let ruutuTeksti = 'Question 1/1: Vahvistatko?\n> 1. Kyllä\n  2. Ei\n  ↑/↓ Navigate · enter Select · esc Skip\n';
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    kutsut.push([komento, ...argumentit]);
    if (argumentit[0] === 'list-panes') return { koodi: 0, stdout: `siirto-b-120000 agy ${Math.floor(Date.now() / 1000)}\n`, stderr: '' };
    if (argumentit[0] === 'capture-pane') return { koodi: 0, stdout: ruutuTeksti, stderr: '' };
    if (argumentit[0] === 'display-message') return { koodi: 0, stdout: '12345\n', stderr: '' };
    if (argumentit.includes('Enter') || argumentit.includes('Escape')) {
      ruutuTeksti = '>\n? for shortcuts   Gemini 3.8 Flash · high\n';
    }
    return { koodi: 0, stdout: '', stderr: '' };
  };

  const v = luoViestit(a, { aja, perillaVali: 5, perillaRaja: 500, kirjoitaTauko: 0 });

  // 1. Vastaaminen valitsemalla toinen vaihtoehto ("Ei"): painaa Down ja Enter
  assert.deepEqual(await v.lahetaSkooppiin('b', 'Ei'), { ok: true, istunto: 'siirto-b-120000' });
  const sendKeys1 = kutsut.filter((c) => c[1] === 'send-keys').map((c) => c.slice(4));
  assert.deepEqual(sendKeys1, [['Down'], ['Enter']]);

  // 2. Vastaaminen custom write-in -tekstillä ("Oma teksti")
  kutsut.length = 0;
  ruutuTeksti = 'Question 1/1: Vahvistatko?\n> 1. Kyllä\n  2. Ei\n  ↑/↓ Navigate · enter Select · esc Skip\n';
  assert.deepEqual(await v.lahetaSkooppiin('b', 'Oma teksti'), { ok: true, istunto: 'siirto-b-120000' });
  const sendKeys2 = kutsut.filter((c) => c[1] === 'send-keys').map((c) => c.slice(4));
  assert.deepEqual(sendKeys2, [['Down'], ['Down'], ['Enter'], ['C-u'], ['-l', 'Oma teksti'], ['Enter']]);

  // 3. suljeKysymys: Escape sulkee kyselykortin
  kutsut.length = 0;
  ruutuTeksti = 'Question 1/1: Vahvistatko?\n> 1. Kyllä\n  2. Ei\n  ↑/↓ Navigate · enter Select · esc Skip\n';
  assert.deepEqual(await v.suljeKysymys('b'), { ok: true, istunto: 'siirto-b-120000' });
  const sendKeys3 = kutsut.filter((c) => c[1] === 'send-keys').map((c) => c.slice(4));
  assert.deepEqual(sendKeys3, [['Escape']]);

  // 4. suljeKysymys hylkää 409, jos kysymys ei ole auki
  ruutuTeksti = '>\n? for shortcuts   Gemini 3.8 Flash · high\n';
  await hylkaa(v.suljeKysymys('b'), 409);

  db.close();
});


// ISTUNNOT-SUORITUSKYKY: viestinäkymän istuntohaku kulkee asynkronisen ajajan kautta (ei execFileSync-tmuxia).
test('skoopinViestit: agy-ruudut haetaan aja-ajajalla', async () => {
  const a = ymparisto();
  delete a.listPanes;
  a.agyHakemisto = join(a.juuri, '../agy-aja');
  mkdirSync(a.agyHakemisto);
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    kutsut.push([komento, argumentit[0]]);
    if (argumentit[0] === 'list-panes') return { koodi: 0, stdout: `siirto-b-120000 agy ${Math.floor(Date.now() / 1000)} 4242\n`, stderr: '' };
    if (argumentit[0] === 'capture-pane') return { koodi: 0, stdout: '> \n? for shortcuts\n', stderr: '' };
    return { koodi: 0, stdout: '', stderr: '' };
  };
  const res = await luoViestit(a, { aja }).skoopinViestit('b');
  assert.deepEqual([res.auki, res.istunto.id, res.istunto.tyyppi, res.istunto.tila], [true, 'siirto-b-120000', 'agy', 'idle']);
  assert.deepEqual(kutsut, [['tmux', 'list-panes'], ['tmux', 'capture-pane']]);
});

// Nebius-chat (käyttäjä 18.10.2026): avain stdinin ensimmäisellä rivillä palvelimen kautta, SSE-palat ja kustannus käytöstä.
test('chat: Nebius-malli palvelimen kautta, avain stdinissä, kustannus käytöstä', async () => {
  const a = ymparisto();
  a.nebiusTiedosto = join(a.juuri, 'nebius-avain');
  writeFileSync(a.nebiusTiedosto, 'koeavain-nebius-1\n');
  const kutsut = [];
  const aja = async (komento, argumentit, valinnat = {}) => {
    if (valinnat.syote == null) return { koodi: 0, stdout: '{"data":[]}', stderr: '' }; // LM Studion mallilista
    kutsut.push({ komento, argumentit, syote: valinnat.syote });
    for (const r of ['data: {"choices":[{"delta":{"content":"Hei"}}]}', 'data: {"choices":[{"delta":{"content":"!"}}]}',
      'data: {"choices":[],"usage":{"prompt_tokens":1000000,"completion_tokens":1000000}}', 'data: [DONE]']) valinnat.riville?.(r);
    return { koodi: 0, stdout: '', stderr: '' };
  };
  const v = luoViestit(a, { aja });
  assert.ok((await v.agentit()).some((m) => m.nimi === 'nebius/deepseek-ai/DeepSeek-V4-Flash-0731' && m.tyyppi === 'nebius'));
  const r = await v.chat({ agentti: 'nebius/deepseek-ai/DeepSeek-V4-Flash-0731', viesti: 'moi' });
  assert.equal(r.vastaus, 'Hei!');
  assert.ok(Math.abs(r.kustannus - 0.42) < 1e-9, `kustannus ${r.kustannus}`);
  const [k] = kutsut;
  assert.equal(k.komento, 'ssh');
  assert.ok(!k.argumentit.join(' ').includes('koeavain-nebius-1'), 'avain ei saa näkyä komentorivillä');
  const [avain, runko] = k.syote.split('\n');
  assert.equal(avain, 'koeavain-nebius-1');
  assert.equal(JSON.parse(runko).model, 'deepseek-ai/DeepSeek-V4-Flash-0731');
  const jatko = await v.chat({ agentti: 'nebius/deepseek-ai/DeepSeek-V4-Flash-0731', viesti: 'entä nyt', keskustelu: r.keskustelu });
  assert.deepEqual(JSON.parse(kutsut[1].syote.split('\n')[1]).messages.map((m) => m.role), ['user', 'assistant', 'user']);
  assert.equal(jatko.keskustelu, r.keskustelu);
});
