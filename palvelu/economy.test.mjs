import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  haeGitTila,
  haeTiedostokartta,
  kuuluukoSkoopille,
  laskeKulutusJakauma,
  luoEconomyPalvelu,
  luokitteleTyokalu,
  muotoileGitEsitiedot,
  skoopinPolut,
} from './economy.mjs';

test('skoopinPolut ja kuuluukoSkoopille', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-skooppi-'));
  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({
      'scopes siirto economy': ['scopes/siirto/economy/REKISTERI.md'],
      'scopes test': ['scopes/test/REKISTERI.md'],
    })
  );

  const polut = skoopinPolut('scopes siirto economy', d);
  assert.deepEqual(polut, ['scopes/siirto/economy']);

  assert.equal(kuuluukoSkoopille('scopes/siirto/economy/REKISTERI.md', 'scopes siirto economy', d), true);
  assert.equal(kuuluukoSkoopille('scopes/siirto/economy/SUUNNITELMA.md', 'scopes siirto economy', d), true);
  assert.equal(kuuluukoSkoopille('scopes/test/tiedosto.js', 'scopes siirto economy', d), false);
  assert.equal(kuuluukoSkoopille('scopes/palvelu/economy.mjs', 'scopes siirto economy', d), false);
});

test('haeGitTila: hakee branchin, headin ja erittelee skoopin omat muutokset', async () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-git-'));
  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({
      'scopes siirto economy': ['scopes/siirto/economy/REKISTERI.md'],
    })
  );

  let kutsut = 0;
  const valevalssi = async (komento, args) => {
    kutsut++;
    if (args[0] === 'rev-parse') return { koodi: 0, stdout: 'claude/test-branch\n' };
    if (args[0] === 'log') return { koodi: 0, stdout: 'abc1234\tfeat(koe): testipäivitys\n' };
    if (args[0] === 'status') {
      return {
        koodi: 0,
        stdout: [
          ' M scopes/siirto/economy/SUUNNITELMA.md',
          '?? scopes/siirto/economy/UUSI.md',
          ' M scopes/ios/KeyButtonView.swift',
        ].join('\n'),
      };
    }
    return { koodi: 1, stdout: '', stderr: 'tuntematon' };
  };

  const tila = await haeGitTila({
    juuri: d,
    skooppi: 'scopes siirto economy',
    aja: valevalssi,
    ttlMs: 5000,
    nytMs: 1000,
  });

  assert.equal(tila.branch, 'claude/test-branch');
  assert.equal(tila.headSha, 'abc1234');
  assert.equal(tila.headViesti, 'feat(koe): testipäivitys');
  assert.equal(tila.puu, 'likainen');
  assert.equal(tila.muuttuneetYhteensa, 3);
  assert.equal(tila.skoopinMuutokset.length, 2);
  assert.equal(tila.skoopinMuutokset[0].polku, 'scopes/siirto/economy/SUUNNITELMA.md');
  assert.equal(tila.skoopinMuutokset[1].polku, 'scopes/siirto/economy/UUSI.md');
  assert.equal(tila.muutMuutokset.length, 1);
  assert.equal(tila.muutMuutokset[0].polku, 'scopes/ios/KeyButtonView.swift');

  // Välimuisti: toinen haku samalla aikaleimalla ei tee uusia git-kutsuja
  const kutsutEnnen = kutsut;
  const tila2 = await haeGitTila({
    juuri: d,
    skooppi: 'scopes siirto economy',
    aja: valevalssi,
    ttlMs: 5000,
    nytMs: 2000,
  });
  assert.equal(kutsut, kutsutEnnen);
  assert.equal(tila2.branch, 'claude/test-branch');
});

test('haeTiedostokartta: luetteloi skoopin tiedostot rekursiivisesti', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-kartta-'));
  const kohde = join(d, 'scopes', 'siirto', 'economy');
  mkdirSync(join(kohde, 'alalohko'), { recursive: true });
  mkdirSync(join(kohde, '.git'), { recursive: true });
  writeFileSync(join(kohde, 'REKISTERI.md'), 'rekisteri sisältöä');
  writeFileSync(join(kohde, 'SUUNNITELMA.md'), 'suunnitelma');
  writeFileSync(join(kohde, 'alalohko', 'apurit.mjs'), 'console.log(1);');
  writeFileSync(join(kohde, '.git', 'HEAD'), 'ref: refs/heads/main');

  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({
      'scopes siirto economy': ['scopes/siirto/economy/REKISTERI.md'],
    })
  );

  const kartta = haeTiedostokartta({ juuri: d, skooppi: 'scopes siirto economy' });
  assert.equal(kartta.maara, 3);
  const polut = kartta.tiedostot.map((t) => t.polku);
  assert.ok(polut.includes('scopes/siirto/economy/REKISTERI.md'));
  assert.ok(polut.includes('scopes/siirto/economy/SUUNNITELMA.md'));
  assert.ok(polut.includes('scopes/siirto/economy/alalohko/apurit.mjs'));
  assert.ok(kartta.yhteensaKoko > 0);
  // .git ei saa tulla mukaan
  assert.ok(!kartta.tiedostot.some((t) => t.polku.includes('.git')));
});

test('luokitteleTyokalu: erottelee tiedonhausta, koodimuokkauksesta ja odotuksesta', () => {
  assert.equal(luokitteleTyokalu({ name: 'read_file' }), 'tiedostoluku');
  assert.equal(luokitteleTyokalu({ name: 'edit_file' }), 'koodimuokkaus');
  assert.equal(luokitteleTyokalu({ name: 'write_file' }), 'koodimuokkaus');
  assert.equal(luokitteleTyokalu({ name: 'manage_task' }), 'odotus');
  assert.equal(luokitteleTyokalu({ name: 'schedule' }), 'odotus');
  assert.equal(luokitteleTyokalu({ name: 'run_command', args: { CommandLine: 'git status' } }), 'git');
  assert.equal(luokitteleTyokalu({ name: 'run_command', args: { CommandLine: 'find . -name "*.mjs"' } }), 'tiedonhaku');
  assert.equal(luokitteleTyokalu({ name: 'run_command', args: { CommandLine: 'grep -rn "foo"' } }), 'tiedonhaku');
  assert.equal(luokitteleTyokalu({ name: 'run_command', args: { CommandLine: 'node --test scopes/palvelu/economy.test.mjs' } }), 'testit');
  assert.equal(luokitteleTyokalu({ name: 'run_command', args: { CommandLine: 'cat /etc/hosts' } }), 'tiedostoluku');
});

test('laskeKulutusJakauma: laskee transkripteista pyynnöt ja työkalujakauman', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-brain-'));
  const conv1 = join(d, 'c1', '.system_generated', 'logs');
  mkdirSync(conv1, { recursive: true });

  const nyt = Date.parse('2026-10-27T14:00:00.000Z');
  writeFileSync(
    join(conv1, 'transcript.jsonl'),
    [
      JSON.stringify({ created_at: '2026-10-27T11:00:00.000Z', type: 'USER_INPUT' }),
      JSON.stringify({
        created_at: '2026-10-27T11:01:00.000Z',
        type: 'PLANNER_RESPONSE',
        tool_calls: [
          { name: 'run_command', args: { CommandLine: 'git status' } },
          { name: 'read_file', args: { Path: '/tmp/koe' } },
        ],
      }),
      JSON.stringify({ created_at: '2026-10-27T11:02:00.000Z', type: 'USER_INPUT' }),
      JSON.stringify({
        created_at: '2026-10-27T11:03:00.000Z',
        type: 'PLANNER_RESPONSE',
        tool_calls: [
          { name: 'edit_file', args: { Path: '/tmp/koe' } },
          { name: 'run_command', args: { CommandLine: 'cargo test' } },
        ],
      }),
    ].join('\n')
  );

  const res = laskeKulutusJakauma({ brainDir: d, nytMs: nyt, valiMs: 0 });
  assert.equal(res.userInputs, 2);
  assert.equal(res.plannerResponses, 2);
  assert.equal(res.tyokalutYhteensa, 4);
  assert.equal(res.kutsut.git.maara, 1);
  assert.equal(res.kutsut.tiedostoluku.maara, 1);
  assert.equal(res.kutsut.koodimuokkaus.maara, 1);
  assert.equal(res.kutsut.testit.maara, 1);
});

test('luoEconomyPalvelu: tarjoaa kootut rajapinnat', async () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-srv-'));
  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({ 'koe': ['scopes/koe/REKISTERI.md'] })
  );

  const aja = async () => ({ koodi: 0, stdout: 'main\n' });
  const p = luoEconomyPalvelu({ juuri: d, brainDir: d, aja });

  const git = await p.gitTila('koe');
  assert.equal(git.branch, 'main');

  const kartta = p.tiedostokartta('koe');
  assert.equal(kartta.skooppi, 'koe');

  const karttaTeksti = p.tiedostokartta('koe', 'teksti');
  assert.equal(karttaTeksti.skooppi, 'koe');
  assert.ok(karttaTeksti.teksti.includes('## Skoopin tiedostokartta'));

  const karttaHaku = p.tiedostokartta('koe', { haku: 'rekisteri' });
  assert.equal(karttaHaku.skooppi, 'koe');
  assert.ok(Array.isArray(karttaHaku.osumat));

  const tilasto = p.tilasto();
  assert.ok('plannerResponses' in tilasto);

  const taskOd = p.taskOdotus();
  assert.equal(taskOd.suositusWaitMs, 10000);
  assert.ok(taskOd.ohje.includes('ECONOMY-TASK-ODOTUS'));
});

test('muotoileGitEsitiedot: tuottaa selkeän markdown-lohkon ja ohjeen', () => {
  const puhdas = {
    branch: 'claude/feature',
    headSha: '1234567890abcdef',
    headViesti: 'feat: valmis',
    skoopinMuutokset: [],
    muutMuutokset: [{ tila: 'M', polku: 'scopes/muu/tiedosto.txt' }],
  };
  const tekstiPuhdas = muotoileGitEsitiedot(puhdas, 'scopes siirto economy');
  assert.ok(tekstiPuhdas.includes('GIT-TILA (deterministinen esisyöttö — älä aja git status / git log / git diff)'));
  assert.ok(tekstiPuhdas.includes('- Haara: claude/feature (HEAD 12345678 feat: valmis)'));
  assert.ok(tekstiPuhdas.includes('- Skoopin puu: puhdas (0 muutosta skoopin poluissa)'));
  assert.ok(tekstiPuhdas.includes('- Muutokset toisissa skoopeissa: 1 kpl (jaettu työklooni — Sääntö 15 & V-KORD-5: älä koske, älä committaa)'));
  assert.ok(tekstiPuhdas.includes('Älä tee git status-, git log- tai git diff -kutsuja'));

  const likainen = {
    branch: 'main',
    headSha: 'abcdef1234567890',
    headViesti: 'fix: korjaus',
    skoopinMuutokset: [{ tila: 'M', polku: 'scopes/siirto/economy/REKISTERI.md' }],
    muutMuutokset: [],
  };
  const tekstiLikainen = muotoileGitEsitiedot(likainen, 'scopes siirto economy');
  assert.ok(tekstiLikainen.includes('- Skoopin puu: likainen (1 muutosta skoopin poluissa)'));
  assert.ok(tekstiLikainen.includes('M scopes/siirto/economy/REKISTERI.md'));
});

test('palvelin: GET /api/economy -reitit palauttavat tiedot', async () => {
  const { createServer } = await import('node:http');
  const { kasittelija } = await import('./palvelin.mjs');

  const d = mkdtempSync(join(tmpdir(), 'economy-http-'));
  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({ 'koe': ['scopes/koe/REKISTERI.md'] })
  );
  mkdirSync(join(d, 'scopes', 'koe'), { recursive: true });
  writeFileSync(join(d, 'scopes', 'koe', 'REKISTERI.md'), 'koe rekisteri');

  const mockEconomy = {
    async gitTila(skooppi, muoto) {
      const perus = { branch: 'main', skooppi, puu: 'puhdas' };
      if (muoto === 'teksti') return { ...perus, teksti: 'GIT-TILA: puhdas' };
      return perus;
    },
    tiedostokartta(skooppi, opt = {}) {
      const { muoto, haku } = opt;
      if (haku) return { skooppi, haku, osumat: [{ polku: 'scopes/koe/REKISTERI.md' }] };
      const perus = { skooppi, maara: 1, tiedostot: [{ polku: 'scopes/koe/REKISTERI.md' }] };
      if (muoto === 'teksti') return { ...perus, teksti: 'KARTTA: scopes/koe/REKISTERI.md' };
      return perus;
    },
    tilasto() {
      return { userInputs: 10, plannerResponses: 50 };
    },
    taskOdotus(muoto) {
      if (muoto === 'teksti') return { teksti: 'TASK-ODOTUS: ohje' };
      return { suositusWaitMs: 10000, minimiWaitMs: 5000 };
    },
  };

  const srv = createServer(
    kasittelija(
      { avain: 'salaisuus', juuri: d, toimintoloki: null },
      async () => ({}),
      {},
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      mockEconomy
    )
  );

  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const port = srv.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const auth = { headers: { Authorization: 'Bearer salaisuus' } };

  try {
    const resGit = await fetch(`${baseUrl}/api/economy/git-tila?skooppi=koe`, auth);
    assert.equal(resGit.status, 200);
    const dataGit = await resGit.json();
    assert.equal(dataGit.branch, 'main');
    assert.equal(dataGit.skooppi, 'koe');

    const resGitTeksti = await fetch(`${baseUrl}/api/economy/git-tila?skooppi=koe&muoto=teksti`, auth);
    assert.equal(resGitTeksti.status, 200);
    const dataGitTeksti = await resGitTeksti.json();
    assert.equal(dataGitTeksti.teksti, 'GIT-TILA: puhdas');

    const resKartta = await fetch(`${baseUrl}/api/economy/tiedostokartta?skooppi=koe`, auth);
    assert.equal(resKartta.status, 200);
    const dataKartta = await resKartta.json();
    assert.equal(dataKartta.skooppi, 'koe');
    assert.equal(dataKartta.maara, 1);

    const resKarttaTeksti = await fetch(`${baseUrl}/api/economy/tiedostokartta?skooppi=koe&muoto=teksti`, auth);
    assert.equal(resKarttaTeksti.status, 200);
    const dataKarttaTeksti = await resKarttaTeksti.json();
    assert.equal(dataKarttaTeksti.teksti, 'KARTTA: scopes/koe/REKISTERI.md');

    const resKarttaHaku = await fetch(`${baseUrl}/api/economy/tiedostokartta?skooppi=koe&haku=rekisteri`, auth);
    assert.equal(resKarttaHaku.status, 200);
    const dataKarttaHaku = await resKarttaHaku.json();
    assert.equal(dataKarttaHaku.osumat.length, 1);

    const resTilasto = await fetch(`${baseUrl}/api/economy/tilasto`, auth);
    assert.equal(resTilasto.status, 200);
    const dataTilasto = await resTilasto.json();
    assert.equal(dataTilasto.userInputs, 10);
    assert.equal(dataTilasto.plannerResponses, 50);

    const resTask = await fetch(`${baseUrl}/api/economy/task-odotus`, auth);
    assert.equal(resTask.status, 200);
    const dataTask = await resTask.json();
    assert.equal(dataTask.suositusWaitMs, 10000);

    const resTaskTeksti = await fetch(`${baseUrl}/api/economy/task-odotus?muoto=teksti`, auth);
    assert.equal(resTaskTeksti.status, 200);
    const dataTaskTeksti = await resTaskTeksti.json();
    assert.equal(dataTaskTeksti.teksti, 'TASK-ODOTUS: ohje');
  } finally {
    srv.close();
  }
});
