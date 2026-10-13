// node --test scopes/palvelu/lahteet.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { createServer } from 'node:http';
import { istunnonSkooppi, istunnot, jasennaSeuraava, konteksti, kontekstinOsat, kontekstiTiedostot, hereilla, lista, osiin, pakattu, projektiNimi, pysahdys, seuraavaRivi, skooppiTila, taulukko, tokeneiksi, yksi } from './lahteet.mjs';
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
  assert.deepEqual(i, [{ id: 's1', nimi: 'kone-1', tila: 'idle', skooppi: 'a', konteksti: { tokenit: 50005, aika: 't' }, pysahdys: null, pakattu: false, hereilla: false, alkoi: 0,
    pid: process.pid, vanhempi: process.ppid, ruutu: null, polku: join(a.projektitDir, '-x-y', 's1.jsonl') }]);
});

test('lista ja yksi: tiivistelmä ja skoopin näkymä', () => {
  const a = ymparisto();
  const l = lista(a);
  // aika = rekisterin muokkausaika (istunnon aika 't' ei ole päiväys, joten se ei voita).
  for (const r of l) assert.match(r.aika, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(l.map(({ aika, ...r }) => r), [
    { nimi: 'a', seuraava: 'A-PAKETTI', avoimia: 1, vikoja: 1, istuntoja: 1, suurinKonteksti: 50005, tila: 'odottaa' },
    { nimi: 'b', seuraava: 'B-PAKETTI', avoimia: 1, vikoja: 1, istuntoja: 0, suurinKonteksti: null, tila: 'pakattu' },
  ]);
  const s = yksi('a', a);
  assert.equal(s.seuraava.id, 'A-PAKETTI');
  assert.equal(s.istunnot[0].id, 's1');
  assert.equal(yksi('puuttuu', a), null);
});

test('skooppiTila: busy käsittelyssä, muu pakkaamaton odottaa, pakattu tai ei istuntoja harmaa', () => {
  assert.equal(skooppiTila([]), 'pakattu');
  assert.equal(skooppiTila([{ tila: 'busy', pakattu: true }]), 'pakattu');
  assert.equal(skooppiTila([{ tila: 'idle', pakattu: false }]), 'odottaa');
  assert.equal(skooppiTila([{ tila: 'waiting', pakattu: false }]), 'odottaa');
  assert.equal(skooppiTila([{ tila: 'idle', pakattu: true }, { tila: 'busy', pakattu: false }]), 'kasittely');
  assert.equal(skooppiTila([{ tila: 'waiting', pakattu: false }, { tila: 'busy', pakattu: false }]), 'kasittely');
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

test('hereilla: agentin viimeinen sa päällä / sa pois -rivi ratkaisee', () => {
  const r = (o) => JSON.stringify(o);
  const a = (teksti, muut = {}) => r({ type: 'assistant', message: { content: [{ type: 'text', text: teksti }] }, ...muut });
  const k = (teksti) => r({ type: 'user', message: { content: teksti } });
  assert.equal(hereilla(''), false);
  assert.equal(hereilla([k('/sa'), a('sa päällä — herätys 40 min välein, uusinta 20.10.')].join('\n')), true);
  assert.equal(hereilla([a('Raportti.\nsa päällä — herätys'), k('sa-tick: x'), a('ok')].join('\n')), true);
  assert.equal(hereilla([a('sa päällä jo'), a('sa pois — poistettu 3 työtä')].join('\n')), false);
  // Käyttäjän teksti, ali-agentti ja maininta lauseen keskellä eivät muuta tilaa.
  assert.equal(hereilla([k('sa päällä'), a('sa päällä', { isSidechain: true }), a('kytke sa päällä myöhemmin')].join('\n')), false);
});

test('pakattu: PAKKAUS: vahvistettu viimeisen käyttäjän viestin jälkeen', () => {
  const r = (o) => JSON.stringify(o);
  const k = (teksti, muut = {}) => r({ type: 'user', message: { content: teksti }, ...muut });
  const a = (teksti) => r({ type: 'assistant', message: { content: [{ type: 'text', text: teksti }] } });
  const pakkaus = a('Tehty.\n**PAKKAUS: vahvistettu** — rekisterit ok, commit abc, push ok');
  assert.equal(pakattu([k('<command-name>/pakkaa</command-name>'), pakkaus].join('\n')), true);
  // Herätykset, työkalutulokset, meta- ja ali-agenttirivit eivät avaa pakattua istuntoa.
  assert.equal(pakattu([pakkaus, k('sa-tick: herätys'), a('ok'), k('<system-reminder>x</system-reminder>'),
    k('jatka', { isMeta: true }), k('jatka', { isSidechain: true }), r({ type: 'user', message: { content: [{ type: 'tool_result', content: 'x' }] } })].join('\n')), true);
  assert.equal(pakattu([pakkaus, k('jatketaan vielä')].join('\n')), false);
  // Taidon teksti käyttäjän viestissä tai rivin maininta lauseen keskellä ei ole pakkaus.
  assert.equal(pakattu([k('rivi `PAKKAUS: vahvistettu` tulee loppuun'), a('Ei vielä: PAKKAUS: vahvistettu tulee myöhemmin')].join('\n')), false);
  assert.equal(pakattu(''), false);
});

test('osiin: ##-otsikoittain, koodiaita ei pilko, iso luku ###-otsikoittain', () => {
  const o = osiin('# T\nalku\n## A\na\n```\n## ei\n```\n## B\nb');
  assert.deepEqual(o.map((x) => x.otsikko), ['Alku', 'A', 'B']);
  assert.equal(o[1].teksti, '## A\na\n```\n## ei\n```');
  assert.equal(o[2].tokenit, tokeneiksi('## B\nb'.length));
  const iso = 'x'.repeat(6000);
  assert.deepEqual(osiin(`## H\n${iso}\n### a\n${iso}\n### b\nb`).map((x) => x.otsikko), ['H', 'H › a', 'H › b']);
  assert.deepEqual(osiin(''), []);
});

test('kontekstiTiedostot: rekisterit, HISTORIA ja ARKISTO, pisin viite, yhteiset; vain olemassa olevat', () => {
  const a = ymparisto();
  const v = join(a.juuri, 'Infra/skills/keskustelun-siirto/references');
  mkdirSync(v, { recursive: true });
  for (const t of ['a.md', 'yhteiset.md']) writeFileSync(join(v, t), '# v');
  writeFileSync(join(a.juuri, 'a/HISTORIA.md'), '# H');
  assert.deepEqual(kontekstiTiedostot('a x', ['a/R.md', 'a/R.md'], a.juuri), [
    { laji: 'rekisteri', polku: 'a/R.md' },
    { laji: 'historia', polku: 'a/HISTORIA.md' },
    { laji: 'viite', polku: 'Infra/skills/keskustelun-siirto/references/a.md' },
    { laji: 'yhteinen', polku: 'Infra/skills/keskustelun-siirto/references/yhteiset.md' },
  ]);
});

test('kontekstinOsat: osa-alueet tiivistyksestä alkaen, jäännös ja skaalaus mitattuun', () => {
  const r = (o) => JSON.stringify(o);
  const t = [
    r({ type: 'user', message: { content: 'ennen tiivistystä'.repeat(100) } }),
    r({ type: 'attachment', attachment: { type: 'prompt_snapshot', systemPrompt: ['k'.repeat(18)] } }),
    r({ type: 'system', subtype: 'compact_boundary' }),
    r({ type: 'attachment', attachment: { type: 'instructions', files: [{ content: 'o'.repeat(36) }] } }),
    r({ type: 'attachment', attachment: { type: 'skill_listing', content: 'l'.repeat(18) } }),
    r({ type: 'attachment', attachment: { type: 'credential_org', organizationUuid: 'x'.repeat(900) } }),
    r({ type: 'user', message: { content: 'kysymys!!' } }),
    r({ type: 'user', message: { content: '<system-reminder>m</system-reminder>' } }),
    r({ type: 'assistant', message: { content: [{ type: 'text', text: 'v'.repeat(18) }, { type: 'tool_use', name: 'Bash', input: {} }] } }),
    r({ type: 'user', message: { content: [{ type: 'tool_result', content: [{ type: 'text', text: 't'.repeat(180) }] }] } }),
    r({ type: 'assistant', isSidechain: true, message: { content: [{ type: 'text', text: 's'.repeat(9000) }] } }),
  ].join('\n');
  const osat = Object.fromEntries(kontekstinOsat(t, 1000).map((o) => [o.nimi, o.tokenit]));
  assert.equal(osat['Järjestelmäkehote'], 10);
  assert.equal(osat['Ohjeet: CLAUDE.md ja muisti'], 20);
  assert.equal(osat['Taito-, agentti- ja työkalulistat'], 10);
  assert.equal(osat['Käyttäjän viestit'], 5);
  assert.equal(osat['Muistutukset, komennot ja tiivistelmä'], tokeneiksi(36));
  assert.equal(osat['Agentin vastaukset'], 10);
  assert.equal(osat['Työkalukutsut'], tokeneiksi(6));
  assert.equal(osat['Työkalutulokset'], 100);
  assert.equal(Object.values(osat).reduce((s, x) => s + x, 0), 1000);
  // Ilman mittausta ei jäännöstä; arvio yli mitatun skaalataan.
  assert.equal(kontekstinOsat(t, null).length, 8);
  const pieni = kontekstinOsat(t, 50);
  assert.equal(pieni.at(-1).tokenit, 0);
  assert.ok(pieni.reduce((s, o) => s + o.tokenit, 0) <= 52);
});

test('yksi: konteksti ryhmittäin ja istunnoittain', () => {
  const a = ymparisto();
  const k = yksi('a', a).konteksti;
  assert.deepEqual(k.ryhmat.map((r) => [r.laji, r.polku, r.osat.map((o) => o.otsikko)]),
    [['rekisteri', 'a/R.md', ['Alku', 'Avoimet asiat', 'Viat', 'Historia']]]);
  assert.equal(k.tokenit, k.ryhmat[0].tokenit);
  assert.deepEqual(k.istunnot.map((i) => [i.id, i.mitattu, i.osat.at(-1).nimi]), [['s1', 50005, 'Työkalumääritykset ja ajattelu (jäännös)']]);
});
