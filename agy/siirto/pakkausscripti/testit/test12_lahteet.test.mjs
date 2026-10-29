// V-560 ja V-562 (scopes macos ja scopes siirto scopes2 19.10.2026): Claude-istunnosta ajettu pakkaus
// (1) louhi uusimman agy-keskustelun transkriptin eli toisen istunnon, (2) synteesi väitti testit
// ajetuiksi ilman lähdettä ja (3) vaihe 5 vaati agy-ajajan, jonka kiintiö oli lopussa.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { etsiAktiivinenIstunto, louhiClaudeViestit, louhiKaikki, louhiTestitodisteet, siivoaClaudeTeksti } from '../louhija.mjs';
import { EI_TESTITODISTETTA, poistaLahteettomat, syntetisoiAnalyysi } from '../harkinta.mjs';
import { muodostaSiirtajaSkooppi, tarvitaankoVarareitti, VARA_AJAJA } from '../pakkaa-hybridi.mjs';

const HAKEMISTO = dirname(fileURLToPath(import.meta.url));
const HYBRIDI = join(HAKEMISTO, '..', 'pakkaa-hybridi.mjs');
const SID = '11111111-2222-3333-4444-555555555555';

function claudeTranscript(projektit, rivit) {
  const d = join(projektit, '-koe-projekti');
  mkdirSync(d, { recursive: true });
  const polku = join(d, `${SID}.jsonl`);
  writeFileSync(polku, rivit.map((r) => JSON.stringify(r)).join('\n') + '\n');
  return polku;
}

const RIVIT = [
  { type: 'user', message: { role: 'user', content: 'Korjaa V-560' } },
  { type: 'assistant', message: { role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'tool_use', name: 'Bash', input: {} }] } },
  { type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'ℹ tests 12\nℹ pass 12\nℹ fail 0\n' }] } },
  { type: 'assistant', message: { role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Korjattu.' }] } },
  { type: 'user', isMeta: true, message: { role: 'user', content: 'meta' } },
];

describe('louhija: istunnon valinta (V-560, V-562)', () => {
  it('Claude-istunto lukee oman transkriptinsa, ei uusinta agy-keskustelua', () => {
    const projektit = mkdtempSync(join(tmpdir(), 'pakkaus-claude-'));
    try {
      const polku = claudeTranscript(projektit, RIVIT);
      const i = etsiAktiivinenIstunto({ env: { CLAUDECODE: '1', CLAUDE_CODE_SESSION_ID: SID }, claudeProjektit: projektit });
      assert.equal(i.lahde, 'claude');
      assert.equal(i.istuntoId, SID);
      assert.equal(i.transcriptPolku, polku);
    } finally {
      rmSync(projektit, { recursive: true, force: true });
    }
  });

  it('Claude-istunto ilman transkriptia ei arvaa: ei lähdettä', () => {
    const projektit = mkdtempSync(join(tmpdir(), 'pakkaus-claude-'));
    try {
      const i = etsiAktiivinenIstunto({ env: { CLAUDECODE: '1', CLAUDE_CODE_SESSION_ID: SID }, claudeProjektit: projektit });
      assert.equal(i.lahde, null);
      assert.equal(i.transcriptPolku, null);
      assert.equal(i.dbPolku, null);
    } finally {
      rmSync(projektit, { recursive: true, force: true });
    }
  });

  it('--session löytää Claude-transkriptin', () => {
    const projektit = mkdtempSync(join(tmpdir(), 'pakkaus-claude-'));
    try {
      claudeTranscript(projektit, RIVIT);
      const i = etsiAktiivinenIstunto({ sessio: SID, env: {}, claudeProjektit: projektit });
      assert.equal(i.lahde, 'claude');
    } finally {
      rmSync(projektit, { recursive: true, force: true });
    }
  });

  it('louhiClaudeViestit: viestit, malli ja testitodisteet työkalutuloksista', () => {
    const projektit = mkdtempSync(join(tmpdir(), 'pakkaus-claude-'));
    try {
      const c = louhiClaudeViestit(claudeTranscript(projektit, RIVIT));
      assert.equal(c.malli, 'claude-opus-5-5');
      // V-652: työkalukutsun tulos on oma viestinsä (louhiClaudeViestit)
      assert.deepEqual(c.viestit.map((v) => v.rooli), ['kayttaja', 'työkalu', 'tulos', 'agentti']);
      assert.deepEqual(c.testitodisteet, ['ℹ tests 12', 'ℹ pass 12', 'ℹ fail 0']);
    } finally {
      rmSync(projektit, { recursive: true, force: true });
    }
  });

  it('louhiKaikki käyttää Claude-transkriptia ja palauttaa testitodisteet', async () => {
    const projektit = mkdtempSync(join(tmpdir(), 'pakkaus-claude-'));
    try {
      claudeTranscript(projektit, RIVIT);
      const f = await louhiKaikki({ skooppi: 'scopes agy siirto pakkausscripti', env: { CLAUDECODE: '1', CLAUDE_CODE_SESSION_ID: SID }, claudeProjektit: projektit });
      assert.equal(f.istuntoLahde, 'claude');
      assert.equal(f.malli, 'claude-opus-5-5');
      assert.equal(f.viimeinenPyynto, 'Korjaa V-560');
      assert.equal(f.testitodisteet.length, 3);
    } finally {
      rmSync(projektit, { recursive: true, force: true });
    }
  });

  it('louhiTestitodisteet: vain testiajon tulosrivit', () => {
    assert.deepEqual(louhiTestitodisteet('# pass 5\nkaikki läpi\n1557:# pass 213\n# pass ilman lukua\n==== 3 passed in 0.1s ===='), ['# pass 5', '1557:# pass 213', '==== 3 passed in 0.1s ====']);
  });

  it('siivoaClaudeTeksti: slash-komento ja taitoteksti', () => {
    assert.equal(siivoaClaudeTeksti('<command-message>pura</command-message>\n<command-name>/pura</command-name>\n<command-args>scopes2</command-args>'), '/pura scopes2');
    assert.equal(siivoaClaudeTeksti('Base directory for this skill: /x\n\nohje'), '');
    assert.equal(siivoaClaudeTeksti('Korjaa <system-reminder>muistutus</system-reminder> V-560'), 'Korjaa  V-560');
  });
});

describe('harkinta: ei lähteettömiä väitteitä (V-560, V-562)', () => {
  const faktat = { skooppi: 'scopes2', git: { haara: 'main', muutetut: [], skoopinMuutetut: [] }, kayttajanPyynnot: [] };

  it('synteesi ilman testitodistetta ei väitä testejä eikä kehitystä', () => {
    const s = JSON.stringify(syntetisoiAnalyysi(faktat));
    assert.doesNotMatch(s, /suoritettu hyväksytysti/);
    assert.doesNotMatch(s, /Kehitetty ja hiottu/);
    assert.ok(syntetisoiAnalyysi(faktat).todettu.includes(EI_TESTITODISTETTA));
  });

  it('synteesi testitodisteen kanssa nimeää tulosrivin', () => {
    const a = syntetisoiAnalyysi({ ...faktat, testitodisteet: ['ℹ pass 12'] });
    assert.ok(a.todettu.some((t) => t.includes('ℹ pass 12')));
  });

  it('poistaLahteettomat poistaa mallin testiväitteen ilman todistetta', () => {
    const malli = {
      tehty: ['Korjattu louhija'],
      todettu: ['Yksikkötestit ja rajapintavalidoinnit suoritettu hyväksytysti'],
      paatokset: ['Kaikki testit läpäisty, joten julkaistaan'],
    };
    const { analyysi, poistetut } = poistaLahteettomat(malli, faktat);
    assert.equal(poistetut.length, 2);
    assert.deepEqual(analyysi.todettu, [EI_TESTITODISTETTA]);
    assert.equal(analyysi.paatokset.length, 1);
    assert.deepEqual(analyysi.tehty, ['Korjattu louhija']);
  });

  it('poistaLahteettomat säilyttää väitteen, kun todiste on', () => {
    const malli = { tehty: [], todettu: ['Testit läpäisty (12/12)'], paatokset: [] };
    const { analyysi, poistetut } = poistaLahteettomat(malli, { testitodisteet: ['ℹ pass 12'] });
    assert.equal(poistetut.length, 0);
    assert.equal(analyysi, malli);
  });
});

describe('pakkaa-hybridi: vaihe 5 ilman agy-pakkoa (V-562)', () => {
  it('oletuksena ei --ajaja-lippua: ajaja.json päättää', () => {
    assert.equal(muodostaSiirtajaSkooppi('scopes2'), 'scopes2');
    assert.equal(muodostaSiirtajaSkooppi('scopes2', 'agy:gemini-3.8-flash-low'), 'scopes2 --ajaja=agy:gemini-3.8-flash-low');
  });

  it('varareitti vain exit 3:lla, kun agy oli moottori', () => {
    assert.equal(tarvitaankoVarareitti(3, 'agy:x', ''), true);
    assert.equal(tarvitaankoVarareitti(3, null, 'AJAJA: agy-kiintiö lopussa 24.10. klo 10.00 asti — x'), true);
    assert.equal(tarvitaankoVarareitti(3, null, 'AJAJA: epäonnistui — pakkausajuri exit 1'), false);
    assert.equal(tarvitaankoVarareitti(3, VARA_AJAJA, 'AJAJA: agy'), false);
    assert.equal(tarvitaankoVarareitti(0, 'agy:x', 'AJAJA: agy'), false);
  });

  it('integraatio: agy-kiintiö lopussa → vaihe 5 ajetaan claude-cli:llä ja pakkaa-loppu ajetaan', () => {
    const juuri = mkdtempSync(join(tmpdir(), 'pakkaus-v562-'));
    try {
      const tools = join(juuri, 'claude/siirto/tools');
      mkdirSync(tools, { recursive: true });
      mkdirSync(join(juuri, 'scopes2'), { recursive: true });
      writeFileSync(join(juuri, 'scopes2/REKISTERI.md'), '# scopes2\n');
      const loki = join(juuri, 'kutsut.log');
      writeFileSync(join(tools, 'aja-siirtaja.sh'), `#!/bin/bash
echo "$1|$2" >> "${loki}"
case "$2" in
  *--ajaja=agy*) echo "AJAJA: agy-kiintiö lopussa 24.10. klo 10.00 asti — oletusajaja siihen asti Claude-ali-agentti, agy:tä ei kutsuttu"; exit 3 ;;
esac
echo "AJAJA: claude-cli claude-sonnet-5-5"
exit 0
`);
      chmodSync(join(tools, 'aja-siirtaja.sh'), 0o755);
      writeFileSync(join(tools, 'pakkaa-loppu.mjs'), `import { appendFileSync } from 'node:fs';
appendFileSync(${JSON.stringify(loki)}, 'loppu|' + process.argv.slice(2).join(' ') + '\\n');
`);
      execFileSync('git', ['init', '-q'], { cwd: juuri });
      execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'alku'], { cwd: juuri });

      const res = spawnSync('node', [HYBRIDI, 'scopes2', '--vahvistettu', '--ilman-mallia', '--ajaja', 'agy:gemini-3.8-flash-low'], {
        cwd: juuri,
        encoding: 'utf8',
        timeout: 60000,
        env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: join(juuri, 'state'), HOME: juuri, CLAUDECODE: '1', CLAUDE_CODE_SESSION_ID: SID },
      });
      assert.equal(res.status, 0, res.stdout + res.stderr);
      assert.match(res.stdout, /VARAREITTI: agy ei käytettävissä — vaihe 5 ajajalla claude-cli:claude-sonnet-5-5/);
      const kutsut = readFileSync(loki, 'utf8').trim().split('\n');
      assert.deepEqual(kutsut.slice(0, 2), [
        'paketoi|scopes2 --ajaja=agy:gemini-3.8-flash-low',
        'paketoi|scopes2 --ajaja=claude-cli:claude-sonnet-5-5',
      ]);
      assert.match(kutsut[2], /^loppu\|scopes2 /);
      const muistio = readFileSync(join(juuri, 'state/pakkaus-muistio.md'), 'utf8');
      assert.doesNotMatch(muistio, /suoritettu hyväksytysti/);
      assert.ok(existsSync(join(juuri, 'state/pakkaus-muistio.md')));
    } finally {
      rmSync(juuri, { recursive: true, force: true });
    }
  });
});
