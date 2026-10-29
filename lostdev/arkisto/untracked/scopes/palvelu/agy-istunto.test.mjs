// agy-istunto.mjs: protobuf-askeleet, keskustelutiedoston haku ja tmux-ruudut (AGY-PRE-ISTUNTO 16.10.2026).
// Fikstuuri koodaa askeleet agy 1.2.15:ssä todennetulla rakenteella; oikeaa agy:tä tai ~/.gemini-hakemistoa ei kosketa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { agyIstunnot, agyIstunnotSync, agyKyselyAuki, agyPakattu, agyRuudut, agyTokenit, agyViestit, askel, ensimmainenKayttaja, jasennaAgyRuutu, loydaKeskustelu, lueAgyMalliEffort, lueAgyTranskripti, mallitonSlug, pb, ruudunTila } from './agy-istunto.mjs';

const varint = (n) => { const t = []; do { let x = n % 128; n = Math.floor(n / 128); if (n) x |= 0x80; t.push(x); } while (n); return Buffer.from(t); };
const num = (f, v) => Buffer.concat([varint(f * 8), varint(v)]);
const msg = (f, ...osat) => { const b = Buffer.concat(osat); return Buffer.concat([varint(f * 8 + 2), varint(b.length), b]); };
const str = (f, s) => msg(f, Buffer.from(s, 'utf8'));
const SEK = 1792141799;
const aikaKentta = msg(5, msg(1, num(1, SEK), num(2, 1)));
const kayttaja = (t) => Buffer.concat([num(1, 14), aikaKentta, msg(19, str(2, t))]);
const agentti = (t, ajattelu = 'sisäinen ajattelu') => Buffer.concat([num(1, 15), aikaKentta, msg(20, str(1, t), str(3, ajattelu))]);
const tyokalu = Buffer.concat([num(1, 132), aikaKentta, str(7, '{"AbsolutePath":"/x","toolAction":"Reading scopes-agy-test.md"}')]);
const metadataTokenit = (outT, inT) => msg(9, num(1, outT), num(2, inT));

function tiedosto(hak, nimi, askeleet, mtimeS) {
  const polku = join(hak, `${nimi}.db`);
  const db = new DatabaseSync(polku);
  db.exec('CREATE TABLE steps (idx integer, step_type integer NOT NULL DEFAULT 0, step_payload blob, metadata blob, status integer DEFAULT 3, PRIMARY KEY (idx))');
  const ins = db.prepare('INSERT INTO steps (idx, step_type, step_payload, metadata, status) VALUES (?, ?, ?, ?, ?)');
  askeleet.forEach(([tyyppi, payload, metadata = null, status = 3], i) => ins.run(i, tyyppi, payload, metadata, status));
  db.close();
  if (mtimeS) utimesSync(polku, mtimeS, mtimeS);
  return polku;
}

test('pb: varint, pituuskentät ja katkennut loppu', () => {
  const k = pb(Buffer.concat([num(1, 300), str(2, 'äö')]));
  assert.deepEqual([k[0].f, k[0].v, k[1].f, k[1].v.toString('utf8')], [1, 300, 2, 'äö']);
  assert.equal(pb(Buffer.from([0x0a, 0x7f, 0x41])).length, 0);
  assert.equal(num(1, SEK).length > 4, true);
});

test('askel: käyttäjä, agentti (ei ajattelua), työkalu, tyhjä ja tuntematon', () => {
  assert.deepEqual(askel(14, kayttaja('Malliton purku: lue /x/scopes-agy-test.md')), { rooli: 'kayttaja', teksti: 'Malliton purku: lue /x/scopes-agy-test.md', aika: new Date(SEK * 1000).toISOString() });
  assert.equal(askel(15, agentti('Helsinki')).teksti, 'Helsinki');
  assert.equal(askel(15, agentti('')), null);
  assert.deepEqual(askel(132, tyokalu), { rooli: 'tyokalu', teksti: 'Reading scopes-agy-test.md', aika: new Date(SEK * 1000).toISOString() });
  assert.equal(askel(99, kayttaja('x')), null);
  assert.equal(askel(14, null), null);
});

test('agyViestit: järjestys idx:n mukaan, viimeiset maara, rikkinäinen tiedosto → []', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-'));
  try {
    const p = tiedosto(hak, 'a', [[14, kayttaja('eka')], [132, tyokalu], [15, agentti('vastaus')], [14, kayttaja('toka')]]);
    assert.deepEqual(agyViestit(p).map((v) => `${v.rooli}:${v.teksti}`), ['kayttaja:eka', 'tyokalu:Reading scopes-agy-test.md', 'agentti:vastaus', 'kayttaja:toka']);
    assert.deepEqual(agyViestit(p, 2).map((v) => v.teksti), ['vastaus', 'toka']);
    assert.deepEqual(agyViestit(join(hak, 'ei-ole.db')), []);
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('loydaKeskustelu: uusin tiedosto, jonka viestissä on <slug>.md; vanhat ja muut hylätään', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-'));
  try {
    const nyt = Date.now() / 1000;
    tiedosto(hak, 'vanha', [[14, kayttaja('Malliton purku: lue /x/scopes-agy-test.md ja noudata sitä.')]], nyt - 3600);
    tiedosto(hak, 'toinen', [[14, kayttaja('Malliton purku: lue /x/scopes-muu.md ja noudata sitä.')]], nyt - 10);
    const oikea = tiedosto(hak, 'oikea', [[14, kayttaja('Malliton purku: lue /x/scopes-agy-test.md ja noudata sitä.')]], nyt - 5);
    assert.equal(loydaKeskustelu('scopes-agy-test', (nyt - 60) * 1000, hak), oikea);
    assert.equal(loydaKeskustelu('scopes-agy-puuttuu', (nyt - 60) * 1000, hak), null);
    assert.equal(loydaKeskustelu('scopes-agy-test', (nyt - 60) * 1000, join(hak, 'ei-ole')), null);
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('loydaKeskustelu: löytyy, vaikka alkuviesti on kaukana lopusta (pitkä keskustelu)', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-'));
  try {
    const nyt = Date.now() / 1000;
    const askeleet = [[14, kayttaja('Malliton purku: lue /x/scopes-agy-pitka.md ja noudata sitä.')]];
    for (let i = 0; i < 12; i++) askeleet.push([15, agentti(`vastaus ${i}`)], [132, tyokalu]);
    const p = tiedosto(hak, 'pitka', askeleet, nyt - 5);
    assert.equal(loydaKeskustelu('scopes-agy-pitka', (nyt - 60) * 1000, hak), p);
    assert.equal(ensimmainenKayttaja(p).startsWith('Malliton purku'), true);
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('agyRuudut: vain skoopin oma agy-ruutu, uusin ensin; claude-ruutu ja toisen skoopin ruutu ohitetaan', async () => {
  const aja = async (komento, argumentit) => {
    assert.deepEqual([komento, argumentit[0]], ['tmux', 'list-panes']);
    return { koodi: 0, stderr: '', stdout: ['siirto-scopes-agy-test-120346 agy 1792141000', 'siirto-scopes-agy-test-120949 agy 1792141400', 'siirto-scopes-agy-test1-120211 agy 1',
      'siirto-scopes-agy-test-111111 claude 5', 'siirto-scopes-agy-pre-105846 claude 7', 'rc bash 9'].join('\n') + '\n' };
  };
  assert.deepEqual(await agyRuudut(aja, 'scopes agy test'), [{ ruutu: 'siirto-scopes-agy-test-120949', alkoi: 1792141400000 }, { ruutu: 'siirto-scopes-agy-test-120346', alkoi: 1792141000000 }]);
  assert.deepEqual(await agyRuudut(async () => ({ koodi: 1, stdout: '', stderr: 'no server' }), 'x'), []);
});

test('ruudunTila: vapaa vain, kun alarivillä on "? for shortcuts"', () => {
  assert.equal(ruudunTila('> \n────\n? for shortcuts      Gemini 3.8 Flash · high\n'), 'idle');
  assert.equal(ruudunTila('Allow access to this file?\n> 1. Yes\nesc to cancel   Gemini 3.8 Flash · high\n'), 'busy');
  assert.equal(ruudunTila(''), 'busy');
});

test('agyTokenit: lukee metadatan kentästä 9 input- ja output-tokenit', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-tok-'));
  try {
    const meta = metadataTokenit(120, 500);
    const p = tiedosto(hak, 'tok', [[14, kayttaja('hei'), null], [15, agentti('moi'), meta]]);
    const db = new DatabaseSync(p, { readOnly: true });
    assert.equal(agyTokenit(db), 620);
    db.close();
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('agyPakattu: PAKKAUSRIVI agentin viestissä tekee pakatuksi, uusi käyttäjäviesti purkaa', () => {
  assert.equal(agyPakattu([{ rooli: 'agentti', teksti: 'Valmista tuli.\nPAKKAUS: vahvistettu' }]), true);
  assert.equal(agyPakattu([
    { rooli: 'agentti', teksti: 'PAKATTU: commit abc1234' },
    { rooli: 'kayttaja', teksti: 'Jatketaanpa vielä' },
  ]), false);
  assert.equal(agyPakattu([{ rooli: 'agentti', teksti: 'Tavallinen vastaus ilman pakkausta.' }]), false);
});

test('agyIstunnot: listaa tmuxista skooppien ruudut ja rikastuttaa tiedot', async () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-ist-'));
  try {
    const nyt = Date.now() / 1000;
    const meta = metadataTokenit(50, 200);
    tiedosto(hak, 'db1', [
      [14, kayttaja('Malliton purku: lue /x/scopes-agy-test.md ja noudata sitä.'), null],
      [15, agentti('vastaus'), meta]
    ], nyt - 2);

    const aja = async (cmd, args) => {
      if (cmd === 'tmux' && args[0] === 'list-panes') {
        return {
          koodi: 0,
          stdout: `siirto-scopes-agy-test-120000 agy ${Math.floor(nyt - 10)} 1234\nsiirto-toinen-120000 agy ${Math.floor(nyt - 10)} 5678\n`,
          stderr: ''
        };
      }
      if (cmd === 'tmux' && args[0] === 'capture-pane') {
        return { koodi: 0, stdout: '> \n? for shortcuts\n', stderr: '' };
      }
      return { koodi: 1, stdout: '', stderr: '' };
    };

    const res = await agyIstunnot({ skooppiNimet: ['scopes agy test'], aja, agyHakemisto: hak });
    assert.equal(res.length, 1);
    assert.equal(res[0].skooppi, 'scopes agy test');
    assert.equal(res[0].ruutu, 'siirto-scopes-agy-test-120000');
    assert.equal(res[0].tila, 'idle');
    assert.equal(res[0].tyyppi, 'agy');
    assert.equal(res[0].pid, 1234);
    assert.equal(res[0].konteksti.tokenit, 250);
    assert.equal(res[0].pakattu, false);
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('jasennaAgyRuutu: tunnistaa tilat (idle, waiting+kysely, waiting+lupa, busy)', () => {
  assert.deepEqual(jasennaAgyRuutu('> \n────\n? for shortcuts      Gemini 3.8 Flash · high\n'), { tila: 'idle', kysely: false });
  assert.deepEqual(jasennaAgyRuutu('Question 1/1: Valitse toiminto?\n> 1. Kyllä\n  2. Ei\n  ↑/↓ Navigate · enter Select · esc Skip\n'), { tila: 'waiting', kysely: true });
  assert.deepEqual(jasennaAgyRuutu('Run this command?\n$ git status\nesc to cancel\n'), { tila: 'waiting', kysely: false });
  assert.deepEqual(jasennaAgyRuutu('Allow access to this file?\n> 1. Yes\n'), { tila: 'waiting', kysely: false });
  assert.deepEqual(jasennaAgyRuutu('Thinking...\nesc to cancel\n'), { tila: 'busy', kysely: false });
});

test('lueAgyTranskripti: lukee tokenit ja aikaleiman transcript.jsonl-tiedostosta', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-brain-'));
  try {
    const convId = 'test-conv-123';
    const logDir = join(hak, convId, '.system_generated/logs');
    mkdirSync(logDir, { recursive: true });
    const logPolku = join(logDir, 'transcript.jsonl');
    const rivit = [
      JSON.stringify({ step_index: 1, type: 'USER_INPUT', content: 'Hei' }),
      JSON.stringify({ step_index: 2, type: 'PLANNER_RESPONSE', status: 'DONE', created_at: '2026-10-16T12:00:00Z', input_tokens: 1500, cache_read_tokens: 25000, output_tokens: 300 }),
    ].join('\n') + '\n';
    writeFileSync(logPolku, rivit);

    const info = lueAgyTranskripti(convId, hak);
    assert.equal(info.tokenit, 26500);
    assert.equal(info.aika, '2026-10-16T12:00:00Z');
    assert.equal(info.pysahdys, '2026-10-16T12:00:00Z');
    assert.equal(info.polku, logPolku);
    assert.equal(lueAgyTranskripti('ei-ole', hak), null);
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('lueAgyMalliEffort: erottelee mallin ja effortin cmdlinesta', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-proc-'));
  try {
    const pidDir = join(hak, '1234');
    mkdirSync(pidDir, { recursive: true });
    writeFileSync(join(pidDir, 'cmdline'), ['/usr/bin/agy', '--model', 'gemini-3.8-flash-high', '-i', 'Moi'].join('\0') + '\0');
    assert.deepEqual(lueAgyMalliEffort(1234, hak), { malli: 'gemini-3.8-flash', effort: 'high' });

    const pidDir2 = join(hak, '5678');
    mkdirSync(pidDir2, { recursive: true });
    writeFileSync(join(pidDir2, 'cmdline'), ['/usr/bin/agy', '-m', 'gemini-3.8-flash', '-i', 'Moi'].join('\0') + '\0');
    assert.deepEqual(lueAgyMalliEffort(5678, hak), { malli: 'gemini-3.8-flash', effort: null });

    assert.deepEqual(lueAgyMalliEffort(9999, hak), { malli: null, effort: null });
  } finally { rmSync(hak, { recursive: true, force: true }); }
});

test('agyIstunnotSync: listaa synkronisesti ja asettaa mallin, effortin ja kyselytilan', () => {
  const hakAgy = mkdtempSync(join(tmpdir(), 'agy-sync-'));
  const hakBrain = mkdtempSync(join(tmpdir(), 'agy-brain-sync-'));
  const hakProc = mkdtempSync(join(tmpdir(), 'agy-proc-sync-'));
  try {
    const nyt = Date.now() / 1000;
    tiedosto(hakAgy, 'conv-uuid-1', [
      [14, kayttaja('Malliton purku: lue /x/scopes-agy-test.md ja noudata sitä.'), null],
      [15, agentti('vastaus'), null]
    ], nyt - 2);

    const logDir = join(hakBrain, 'conv-uuid-1', '.system_generated/logs');
    mkdirSync(logDir, { recursive: true });
    writeFileSync(join(logDir, 'transcript.jsonl'), JSON.stringify({
      step_index: 1, type: 'PLANNER_RESPONSE', status: 'DONE', created_at: '2026-10-16T15:30:00Z', input_tokens: 500, cache_read_tokens: 3500
    }) + '\n');

    const pidDir = join(hakProc, '4321');
    mkdirSync(pidDir, { recursive: true });
    writeFileSync(join(pidDir, 'cmdline'), ['/usr/bin/agy', '--model', 'gemini-3.8-flash-max'].join('\0') + '\0');

    const listPanes = () => `siirto-scopes-agy-test-153000 agy ${Math.floor(nyt - 10)} 4321\n`;
    const capturePane = () => 'Question 1/1: Valitse vaihtoehto?\n  ↑/↓ Navigate · enter Select · esc Skip\n';

    const tulokset = agyIstunnotSync({
      skooppiNimet: ['scopes agy test'],
      proc: hakProc,
      agyHakemisto: hakAgy,
      brainHakemisto: hakBrain,
      listPanes,
      capturePane,
    });

    assert.equal(tulokset.length, 1);
    const i = tulokset[0];
    assert.equal(i.skooppi, 'scopes agy test');
    assert.equal(i.tila, 'waiting');
    assert.equal(i.kysely, true);
    assert.equal(i.malli, 'gemini-3.8-flash');
    assert.equal(i.effort, 'max');
    assert.equal(i.konteksti.tokenit, 4000);
    assert.equal(i.konteksti.aika, '2026-10-16T15:30:00Z');
  } finally {
    rmSync(hakAgy, { recursive: true, force: true });
    rmSync(hakBrain, { recursive: true, force: true });
    rmSync(hakProc, { recursive: true, force: true });
  }
});

test('agyKyselyAuki: tunnistaa avoimen ask_question-askeleen status 9:stä', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-kysely-'));
  try {
    const kyselyAskel = Buffer.concat([num(1, 132), aikaKentta, str(7, '{"questions":[{"question":"Jatketaanko?"}],"toolAction":"ask_question"}')]);
    const komentoAskel = Buffer.concat([num(1, 132), aikaKentta, str(7, '{"CommandLine":"ls","toolAction":"run_command"}')]);

    // Avoin ask_question (status = 9)
    const p1 = tiedosto(hak, 'conv-kysely-avoin', [
      [14, kayttaja('Malliton purku: lue /x/scopes-test.md ja noudata sitä.'), null, 3],
      [15, agentti('Kysyn varmistuksen'), null, 3],
      [132, kyselyAskel, null, 9],
    ]);
    const db1 = new DatabaseSync(p1, { readOnly: true });
    assert.equal(agyKyselyAuki(db1), true);
    db1.close();

    // Vastattu ask_question (status = 3)
    const p2 = tiedosto(hak, 'conv-kysely-vastattu', [
      [14, kayttaja('Malliton purku: lue /x/scopes-test.md ja noudata sitä.'), null, 3],
      [15, agentti('Kysyn varmistuksen'), null, 3],
      [132, kyselyAskel, null, 3],
    ]);
    const db2 = new DatabaseSync(p2, { readOnly: true });
    assert.equal(agyKyselyAuki(db2), false);
    db2.close();

    // Keskeneräinen komento, ei kysely (status = 9)
    const p3 = tiedosto(hak, 'conv-komento-avoin', [
      [14, kayttaja('Malliton purku: lue /x/scopes-test.md ja noudata sitä.'), null, 3],
      [132, komentoAskel, null, 9],
    ]);
    const db3 = new DatabaseSync(p3, { readOnly: true });
    assert.equal(agyKyselyAuki(db3), false);
    db3.close();
  } finally {
    rmSync(hak, { recursive: true, force: true });
  }
});

test('lueAgyTranskripti: tunnistaa avoimen ask_question-kortin ja pysähdysajan', () => {
  const hak = mkdtempSync(join(tmpdir(), 'agy-brain-trans-'));
  try {
    const convId = 'conv-ask-trans';
    const logDir = join(hak, convId, '.system_generated/logs');
    mkdirSync(logDir, { recursive: true });
    const logPolku = join(logDir, 'transcript.jsonl');
    const rivit = [
      JSON.stringify({ step_index: 1, type: 'USER_INPUT', content: 'Jatka' }),
      JSON.stringify({ step_index: 2, type: 'PLANNER_RESPONSE', status: 'DONE', created_at: '2026-10-16T12:00:00Z', content: 'Alustetaan...' }),
      JSON.stringify({ step_index: 3, type: 'PLANNER_RESPONSE', status: 'DONE', created_at: '2026-10-16T12:01:00Z', tool_calls: [{ name: 'run_command', args: { CommandLine: 'git status' } }] }),
      JSON.stringify({ step_index: 4, type: 'GENERIC', status: 'DONE', created_at: '2026-10-16T12:01:05Z', content: 'clean' }),
      JSON.stringify({ step_index: 5, type: 'PLANNER_RESPONSE', status: 'DONE', created_at: '2026-10-16T12:02:00Z', tool_calls: [{ name: 'ask_question', args: { question: 'Vahvistatko?' } }] }),
    ].join('\n') + '\n';
    writeFileSync(logPolku, rivit);

    const info = lueAgyTranskripti(convId, hak);
    assert.equal(info.kysely, true);
    assert.equal(info.aika, '2026-10-16T12:02:00Z');
    assert.equal(info.pysahdys, '2026-10-16T12:02:00Z');
  } finally {
    rmSync(hak, { recursive: true, force: true });
  }
});

test('askel ja agyViestit: ask_question-työkalukutsu jäsentyy monivalintakysymykseksi ja vastatuksi', () => {
  const kyselyArgs = JSON.stringify({
    questions: [{
      question: 'Jatketaanko?',
      header: 'Vahvistus',
      is_multi_select: false,
      options: ['Kyllä', 'Ei']
    }]
  });
  const kyselyToolCall = (argsJson, vastausVal = null) => {
    const f4inner = Buffer.concat([str(2, 'ask_question'), str(3, argsJson)]);
    const f4 = msg(4, f4inner);
    const f5 = msg(5, f4);
    const osat = [num(1, 132), aikaKentta, f5, str(7, argsJson)];
    if (vastausVal != null) {
      const innerObj = Buffer.concat([str(1, 'Jatketaanko?'), str(4, String(vastausVal))]);
      const f22 = msg(22, msg(1, innerObj));
      const f2 = msg(2, f22);
      const f147 = msg(147, f2);
      osat.push(f147);
    }
    return Buffer.concat(osat);
  };

  // Avoin kysymys
  const avoinPayload = kyselyToolCall(kyselyArgs);
  const avoin = askel(132, avoinPayload);
  assert.equal(avoin.rooli, 'kysymys');
  assert.equal(avoin.vastattu, false);
  assert.equal(avoin.kysymykset[0].otsikko, 'Vahvistus');
  assert.equal(avoin.kysymykset[0].vaihtoehdot.length, 2);
  assert.equal(avoin.kysymykset[0].vaihtoehdot[0].nimi, 'Kyllä');

  // Vastattu kysymys (valinta 1 -> "Kyllä")
  const vastattuPayload = kyselyToolCall(kyselyArgs, '1');
  const vastattu = askel(132, vastattuPayload);
  assert.equal(vastattu.rooli, 'kysymys');
  assert.equal(vastattu.vastattu, true);
  assert.equal(vastattu.vastaus, 'Kyllä');

  // agyViestit tuottaa kysymyksen ja vastauksen käyttäjän viestinä
  const hak = mkdtempSync(join(tmpdir(), 'agy-kysely-viestit-'));
  try {
    const polku = tiedosto(hak, 'conv-kysely-db', [
      [14, kayttaja('Malliton purku: lue /x/b.md ja noudata sitä.')],
      [15, agentti('Kysyn')],
      [132, vastattuPayload],
    ]);
    const viestit = agyViestit(polku);
    assert.equal(viestit.length, 4);
    assert.equal(viestit[2].rooli, 'kysymys');
    assert.equal(viestit[2].vastattu, true);
    assert.equal(viestit[2].vastaus, undefined); // vastaus-kenttä siivottu
    assert.equal(viestit[3].rooli, 'kayttaja');
    assert.equal(viestit[3].teksti, 'Kyllä');
  } finally {
    rmSync(hak, { recursive: true, force: true });
  }
});


