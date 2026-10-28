// node --test scopes/palvelu/lahteet.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { createServer } from 'node:http';
import { istunnonSkooppi, istunnot, jasennaSeuraava, katonTavut, konteksti, kontekstinOsat, kontekstiTiedostot, hereilla, istunnonLadatut, lista, osiin, pakattu, projektiNimi, pysahdys, rekisterinOsat, rekisterit, seuraavaRivi, skooppiTila, TILA_VAKAUS_MS, taulukko, vakautaTila, tokeneiksi, yksi } from './lahteet.mjs';
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

test('istunnon skooppi: nimestä tai käyttäjän viimeisimmästä purusta', () => {
  const nimet = ['a', 'b c'];
  const kayttaja = (content, lisa = {}) => JSON.stringify({ type: 'user', message: { role: 'user', content }, ...lisa }) + '\n';
  const pura = (x) => kayttaja(`<command-message>pura</command-message>\n<command-name>/pura</command-name>\n<command-args>${x}</command-args>`);
  assert.equal(istunnonSkooppi('a', '', nimet), 'a');
  assert.equal(istunnonSkooppi('kone-1', pura('a') + pura('uusi b c --autojatko'), nimet), 'b c');
  assert.equal(istunnonSkooppi('kone-1', pura('tuntematon'), nimet), null);
  // V-508: mallittoman purun aloitusviesti (äpin Pura, autovaihto.sh) ilman /pura-komentoa; viimeisin purku voittaa.
  const malliton = (slug) => kayttaja(`Malliton purku: lue /h/.local/state/pura/${slug}.md ja noudata sitä.`);
  assert.equal(istunnonSkooppi('kone-1', malliton('b-c'), nimet), 'b c');
  assert.equal(istunnonSkooppi('kone-1', pura('a') + malliton('b-c'), nimet), 'b c');
  assert.equal(istunnonSkooppi('kone-1', malliton('b-c') + pura('a'), nimet), 'a');
  assert.equal(istunnonSkooppi('kone-1', malliton('tuntematon'), nimet), null);
  assert.equal(istunnonSkooppi('kone-1', kayttaja('Malliton purku epäonnistui (b c): pura-malliton: rekisteriä ei löydy'), nimet), 'b c');
  // Työkalutulos, agentin teksti ja sivuketju eivät ole purkuja, vaikka lainaavat purkuviestiä.
  const tulos = kayttaja([{ type: 'tool_result', content: 'Malliton purku: lue /h/.local/state/pura/b-c.md ja noudata sitä.' }]);
  const agentti = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'Malliton purku: lue /h/b-c.md ja noudata sitä.' }] } }) + '\n';
  const sivu = kayttaja('Malliton purku: lue /h/b-c.md ja noudata sitä.', { isSidechain: true });
  assert.equal(istunnonSkooppi('kone-1', pura('a') + tulos + agentti + sivu, nimet), 'a');
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
    JSON.stringify({ type: 'user', message: { content: 'Malliton purku: lue /h/.local/state/pura/a.md ja noudata sitä.' } }) + '\n' +
    JSON.stringify({ message: { usage: { input_tokens: 5, cache_read_input_tokens: 50000 } }, timestamp: 't' }));
  return { juuri, istunnotDir, projektitDir, wgTiedosto: join(d, 'wg.conf') };
}

test('istunnot: vain elävät, skooppi ja konteksti transkriptista', () => {
  const a = ymparisto();
  const i = istunnot({ ...a, skooppiNimet: ['a', 'b'] });
  assert.deepEqual(i, [{ id: 's1', nimi: 'kone-1', tila: 'idle', kysely: false, skooppi: 'a', konteksti: { tokenit: 50005, aika: 't' }, pysahdys: null, pakattu: false, hereilla: false, alkoi: 0,
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

test('lista ja yksi: AGY-istunnot rikastavat skoopin tilan, istuntomäärän ja kontekstin', () => {
  const a = ymparisto();
  utimesSync(join(a.juuri, 'a/R.md'), 1000, 1000);
  const agy = [{
    id: 'siirto-b-120000',
    nimi: 'siirto-b-120000',
    tila: 'busy',
    kysely: false,
    skooppi: 'b',
    konteksti: { tokenit: 12345, aika: '2026-10-16T15:00:00.000Z' },
    pysahdys: '2026-10-16T15:00:00.000Z',
    pakattu: false,
    hereilla: false,
    alkoi: 1792150000000,
    pid: 9999,
    vanhempi: null,
    ruutu: 'siirto-b-120000',
    tyyppi: 'agy',
  }];
  const l = lista(a, agy);
  const b = l.find((x) => x.nimi === 'b');
  assert.equal(b.istuntoja, 1);
  assert.equal(b.tila, 'kasittely');
  assert.equal(b.suurinKonteksti, 12345);
  assert.equal(b.aika, '2026-10-16T15:00:00.000Z');

  const s = yksi('b', a, agy);
  assert.equal(s.istunnot.length, 1);
  assert.equal(s.istunnot[0].id, 'siirto-b-120000');
  assert.equal(s.istunnot[0].tyyppi, 'agy');
});

test('istunnot ja lista: AGY-istunto synkronisesti listaukseen, kyselytila ja deduplikointi', () => {
  const a = ymparisto();
  const listPanes = () => 'siirto-b-140000 agy 1792160000 7777\n';
  const capturePane = () => 'Question 1/1: Valitse toiminto?\n  ↑/↓ Navigate · enter Select · esc Skip\n';

  const res = istunnot({ ...a, skooppiNimet: ['a', 'b'], listPanes, capturePane });
  assert.equal(res.length, 2); // s1 (Claude) ja siirto-b-140000 (AGY)
  const agy = res.find((i) => i.id === 'siirto-b-140000');
  assert.equal(agy.skooppi, 'b');
  assert.equal(agy.tila, 'waiting');
  assert.equal(agy.kysely, true);
  assert.equal(agy.tyyppi, 'agy');

  const l = lista({ ...a, listPanes, capturePane });
  const b = l.find((x) => x.nimi === 'b');
  assert.equal(b.tila, 'kysely');
  assert.equal(b.istuntoja, 1);

  // lisaIstunnot samalla id:llä ei monista istuntoa
  const l2 = lista({ ...a, listPanes, capturePane }, [agy]);
  const b2 = l2.find((x) => x.nimi === 'b');
  assert.equal(b2.istuntoja, 1);
});

test('skooppiTila: busy käsittelyssä, muu pakkaamaton odottaa, pakattu tai ei istuntoja harmaa', () => {
  assert.equal(skooppiTila([]), 'pakattu');
  assert.equal(skooppiTila([{ tila: 'busy', pakattu: true }]), 'pakattu');
  assert.equal(skooppiTila([{ tila: 'idle', pakattu: false }]), 'odottaa');
  assert.equal(skooppiTila([{ tila: 'waiting', pakattu: false }]), 'odottaa');
  assert.equal(skooppiTila([{ tila: 'idle', pakattu: true }, { tila: 'busy', pakattu: false }]), 'kasittely');
  assert.equal(skooppiTila([{ tila: 'waiting', pakattu: false }, { tila: 'busy', pakattu: false }]), 'kasittely');
  // Taustakomento käynnissä (shell) on käsittelyä, ei odotusta.
  assert.equal(skooppiTila([{ tila: 'shell', pakattu: false }]), 'kasittely');
  assert.equal(skooppiTila([{ tila: 'shell', pakattu: true }]), 'pakattu');
});

test('skooppiTila: kyselykortti on kysely, myös käsittelyn rinnalla; pakattu kysely ei', () => {
  assert.equal(skooppiTila([{ tila: 'waiting', kysely: true, pakattu: false }]), 'kysely');
  assert.equal(skooppiTila([{ tila: 'waiting', kysely: true, pakattu: false }, { tila: 'busy', pakattu: false }]), 'kysely');
  assert.equal(skooppiTila([{ tila: 'waiting', kysely: true, pakattu: true }]), 'pakattu');
  // Lupakysely ilman korttia on tavallinen odotus.
  assert.equal(skooppiTila([{ tila: 'waiting', kysely: false, pakattu: false }]), 'odottaa');
});

test('istunnot: kysely vain waiting + input needed', () => {
  const a = ymparisto();
  const tiedosto = join(a.istunnotDir, `${process.pid}.json`);
  const s = JSON.parse(readFileSync(tiedosto, 'utf8'));
  for (const [status, waitingFor, odotettu] of [['waiting', 'input needed', true], ['waiting', 'permission prompt', false], ['idle', undefined, false]]) {
    writeFileSync(tiedosto, JSON.stringify({ ...s, status, waitingFor }));
    assert.equal(istunnot({ ...a, skooppiNimet: ['a'] })[0].kysely, odotettu, `${status} ${waitingFor}`);
  }
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
    assert.deepEqual((await hae('/api/rekisterit'))[1].map((r) => r.polku), ['a/R.md']);
    assert.equal((await hae('/api/rekisterit/a%2FR.md'))[1].osat.length, 4);
    assert.equal((await hae('/api/rekisterit/%2Fetc%2Fpasswd'))[0], 404);
    assert.equal((await hae('/api/skoopit', 'POST'))[0], 404);
    assert.equal((await hae('/api/skoopit', 'DELETE'))[0], 405);
    assert.equal((await hae('/api/skoopit', 'GET', null))[0], 401);
    assert.equal((await hae('/api/skoopit/a', 'GET', 'v'.repeat(32)))[0], 401);
    assert.deepEqual(await hae('/api/terveys', 'GET', null), [200, { ok: true }]);
    assert.equal((await hae('/api/wg-asetus'))[0], 404);
    writeFileSync(a.wgTiedosto, '[Interface]\n');
    assert.deepEqual(await hae('/api/wg-asetus'), [200, { asetus: '[Interface]\n' }]);
    assert.equal((await hae('/api/wg-asetus', 'GET', null))[0], 401);
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

test('hereilla: sa-tick-ajastin ja /sa pois ratkaisevat ilman tekstiriviä (V-294)', () => {
  const r = (o) => JSON.stringify(o);
  const cron = (prompt) => r({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'CronCreate', input: { cron: '7,47 */2 * * *', prompt } }] } });
  const sa = (args) => r({ type: 'user', message: { content: `<command-message>sa</command-message>\n<command-name>/sa</command-name>\n<command-args>${args}</command-args>` } });
  assert.equal(hereilla([cron('sa-tick: välimuistin herätys')].join('\n')), true);
  assert.equal(hereilla([cron('sa-tick: x'), sa('pois')].join('\n')), false);
  assert.equal(hereilla([cron('sa-tick: x'), sa('pois'), sa(''), cron('sa-tick: x')].join('\n')), true);
  // Muu ajastin tai /sa ilman ajastinta ei kytke päälle.
  assert.equal(hereilla([cron('muistutus: deploy'), sa('')].join('\n')), false);
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
  // V-284: PAKATTU-rivi tai epäselvä-koontirivi, jossa commit syntyi, on pakkaus; epäselvä ilman commitia ei.
  assert.equal(pakattu([k('/pakkaa'), a('**PAKATTU:** scopes infra — commit 0249712, push ok. Sinun ei tarvitse ajaa /pakkaa.')].join('\n')), true);
  assert.equal(pakattu([k('/pakkaa'), a('PAKKAUS: epäselvä — salaisuusgrep: vanha osuma. Muut osat ok: rekisterit ok, commit `20047a0`, push ok')].join('\n')), true);
  assert.equal(pakattu([k('/pakkaa'), a('PAKKAUS: epäselvä — commit: KATTO esti commitin, katso rivi KATTO')].join('\n')), false);
  assert.equal(pakattu([k('/pakkaa'), a('Ei vielä: PAKATTU: tulee myöhemmin')].join('\n')), false);
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

test('istunnonLadatut: kehote, ohjeet, listat, purku ja muistutukset alussa/kertynyt tekstinä', () => {
  const r = (o) => JSON.stringify(o);
  const t = [
    r({ type: 'attachment', attachment: { type: 'prompt_snapshot', systemPrompt: ['# Alku\nkehote', '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__', 'toinen'] } }),
    r({ type: 'user', message: { content: '<command-name>/pura</command-name>' } }),
    r({ type: 'user', isMeta: true, message: { content: [{ type: 'text', text: 'Base directory for this skill: /h/.claude/skills/pura\n\nrunko' }] } }),
    r({ type: 'attachment', attachment: { type: 'instructions', files: [{ path: '/p/CLAUDE.md', content: 'ohje' }, { path: '/m/MEMORY.md', content: 'muisti' }] } }),
    r({ type: 'attachment', attachment: { type: 'skill_listing', content: 'taidot' } }),
    r({ type: 'attachment', attachment: { type: 'date', date: '2026-10-15' } }),
    r({ type: 'attachment', attachment: { type: 'credential_org', organizationUuid: 'x' } }),
    r({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 'u1', name: 'Bash', input: { command: 'bash claude/siirto/tools/aja-siirtaja.sh pura "a"' } }, { type: 'tool_use', id: 'u2', name: 'Bash', input: { command: "cat <<'E'\\nbash x/aja-siirtaja.sh pura a\\nE" } }] } }),
    r({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'u1', content: 'SKOOPPI: a' }, { type: 'tool_result', tool_use_id: 'u2', content: 'x' }] } }),
    r({ type: 'attachment', attachment: { type: 'total_tokens_reminder', text: '<total_tokens>1</total_tokens>' } }),
    r({ type: 'attachment', attachment: { type: 'total_tokens_reminder', text: '<total_tokens>2</total_tokens>' } }),
    r({ type: 'assistant', isSidechain: true, message: { content: [{ type: 'tool_use', id: 'u3', name: 'Agent', input: { description: 'pura a' } }] } }),
  ].join('\n');
  const l = istunnonLadatut(t);
  const nakyma = (g) => g.map((x) => [x.laji, x.osat.map((o) => [o.otsikko, o.teksti])]);
  assert.deepEqual(nakyma(l.alku), [
    ['kehote', [['Alku', '# Alku\nkehote'], ['toinen', 'toinen']]],
    ['ohjeet', [['/p/CLAUDE.md', 'ohje'], ['/m/MEMORY.md', 'muisti']]],
    ['listat', [['Taitolista', 'taidot']]],
    ['muistutukset-alku', [['date', JSON.stringify({ type: 'date', date: '2026-10-15' }, null, 1)]]],
    ['purku', [['Komento', '<command-name>/pura</command-name>'], ['Taito pura', 'Base directory for this skill: /h/.claude/skills/pura\n\nrunko'], ['Purun raportti', 'SKOOPPI: a']]],
  ]);
  assert.deepEqual(nakyma(l.kertynyt), [['muistutukset-kertynyt', [['total_tokens_reminder ×2', '<total_tokens>1</total_tokens>\n\n<total_tokens>2</total_tokens>']]]]);
  assert.equal(l.alku[0].tokenit, tokeneiksi(14) + tokeneiksi(6));
  assert.deepEqual(istunnonLadatut(''), { alku: [], kertynyt: [] });
});

test('yksi: konteksti ryhmittäin ja istunnoittain', () => {
  const a = ymparisto();
  const k = yksi('a', a).konteksti;
  assert.deepEqual(k.ryhmat.map((r) => [r.laji, r.polku, r.osat.map((o) => o.otsikko)]),
    [['rekisteri', 'a/R.md', ['Alku', 'Avoimet asiat', 'Viat', 'Historia']]]);
  assert.equal(k.tokenit, k.ryhmat[0].tokenit);
  assert.deepEqual(k.istunnot.map((i) => [i.id, i.mitattu, i.osat.at(-1).nimi]), [['s1', 50005, 'Työkalumääritykset ja ajattelu (jäännös)']]);
});

test('katonTavut: pakolliset luvut (myös tarkenteella) eivät laske kattoon', () => {
  const t = '# R\n## Vaiheet (x)\nää\n## Muu\nb\n';
  assert.equal(katonTavut(t), Buffer.byteLength(t));
  assert.equal(katonTavut(t, ['## Vaiheet']), Buffer.byteLength(t) - Buffer.byteLength('## Vaiheet (x)\nää\n'));
});

test('rekisterit: tiedosto kerran skooppeineen, raja 40 000 tai lähtötaso; osat vain kontekstitiedostolle', () => {
  const a = ymparisto();
  writeFileSync(join(a.juuri, 'a/HISTORIA.md'), '# H\n## Luku\nx');
  writeFileSync(join(a.juuri, 'claude/siirto/state/rekisteri-katto.json'), JSON.stringify({ 'a/HISTORIA.md': 99 }));
  const r = rekisterit(a);
  assert.deepEqual(r.map(({ tokenit, ...x }) => x), [
    { polku: 'a/R.md', laji: 'rekisteri', skoopit: ['a', 'b'], tavut: Buffer.byteLength(REK), raja: 40000 },
    { polku: 'a/HISTORIA.md', laji: 'historia', skoopit: ['a', 'b'], tavut: 13, raja: 99 },
  ]);
  writeFileSync(join(a.juuri, 'claude/siirto/state/rekisteri-katto.json'), JSON.stringify({ 'a/R.md': 50000 }));
  assert.deepEqual(rekisterit(a).map((x) => x.raja), [50000, null]);
  // Kontekstiluku ei sisällä HISTORIA.md:tä, vaikka kattosivu sisältää (V-399).
  assert.deepEqual(yksi('a', a).konteksti.ryhmat.map((x) => [x.laji, x.raja]), [['rekisteri', 50000]]);
  assert.deepEqual(rekisterinOsat('a/HISTORIA.md', a).osat.map((o) => o.otsikko), ['Alku', 'Luku']);
  assert.equal(rekisterinOsat('../etc/passwd', a), null);
});

test('vakautaTila: käsittelyn välähdys ei tee odottaa-tilaa ennen vakausaikaa; kysely ja pakattu heti (VI-2, VI-3)', () => {
  const m = new Map();
  assert.equal(vakautaTila('a', 'kasittely', 'A1', 0, m).tila, 'kasittely');
  assert.equal(vakautaTila('a', 'odottaa', 'A2', 5_000, m).tila, 'kasittely');
  assert.equal(vakautaTila('a', 'kasittely', 'A3', 10_000, m).tila, 'kasittely');
  assert.equal(vakautaTila('a', 'odottaa', 'A4', 10_000 + TILA_VAKAUS_MS - 1, m).tila, 'kasittely');
  assert.deepEqual(vakautaTila('a', 'odottaa', 'A5', 10_000 + TILA_VAKAUS_MS, m), { tila: 'odottaa', aika: 'A5' });
  assert.equal(vakautaTila('b', 'odottaa', 'B1', 0, m).tila, 'odottaa', 'ilman käsittelyä odotus näkyy heti');
  vakautaTila('c', 'kasittely', 'C1', 0, m);
  assert.equal(vakautaTila('c', 'kysely', 'C2', 1_000, m).tila, 'kysely');
  vakautaTila('d', 'kasittely', 'D1', 0, m);
  assert.equal(vakautaTila('d', 'pakattu', 'D2', 1_000, m).tila, 'pakattu');
});

test('vakautaTila: aktiivisen skoopin aika pysyy aktivoitumisen hetkessä (VI-5)', () => {
  const m = new Map();
  assert.equal(vakautaTila('a', 'odottaa', 'T0', 0, m).aika, 'T0');
  assert.equal(vakautaTila('a', 'kasittely', 'T1', 1_000, m).aika, 'T1');
  assert.equal(vakautaTila('a', 'kasittely', 'T2', 2_000, m).aika, 'T1', 'rekisterin kirjoitus työn aikana ei nosta');
  assert.equal(vakautaTila('a', 'kysely', 'T3', 3_000, m).aika, 'T1');
  assert.equal(vakautaTila('a', 'odottaa', 'T4', 3_000 + TILA_VAKAUS_MS, m).aika, 'T4');
});
