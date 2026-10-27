// scopes/siirto/economy/kuluttajat.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tunnistaKulutusSkooppi,
  luokitteleKulutusKutsu,
  analysoiIstunnonKulutus,
  karsiKuluttaja,
  muodostaExpressoTestiAjoKomento,
  tarkistaMolemmatGitTilat,
  muotoileKuluttajaOhje,
  TUNNETUT_SUURKULUTTAJAT,
} from './kuluttajat.mjs';

test('tunnistaKulutusSkooppi: tunnistaa skoopin purkutekstistä ja työkaluista', () => {
  const t1 = `SKOOPPI: scopes siirto git (annettu argumentissa; rekisteri scopes/siirto/git/REKISTERI.md)`;
  assert.equal(tunnistaKulutusSkooppi(t1), 'scopes siirto git');

  const t2 = `Malliton purku: lue ~/.local/state/pura/infra-expresso.md ja noudata sitä.`;
  assert.equal(tunnistaKulutusSkooppi(t2), 'infra expresso');

  const t3 = `{"tool_calls": [{"name": "run_command", "args": {"CommandLine": "cd Infra/iot/expresso && python3 pico_dev.py cmd 'heat?' 6"}}]}`;
  assert.equal(tunnistaKulutusSkooppi(t3), 'infra expresso');

  const t4 = `{"tool_calls": [{"name": "run_command", "args": {"CommandLine": "git -C scopes/siirto/git status"}}]}`;
  assert.equal(tunnistaKulutusSkooppi(t4), 'scopes siirto git');

  const t5 = `Jotain aivan muuta ilman skooppitietoa`;
  assert.equal(tunnistaKulutusSkooppi(t5), 'tuntematon');
});

test('luokitteleKulutusKutsu: erottelee paikallisen ja etä-gitin, haun ja status-pollauksen', () => {
  assert.equal(luokitteleKulutusKutsu({ name: 'read_file', args: { Path: '/polku/t.js' } }), 'tiedostoluku');
  assert.equal(luokitteleKulutusKutsu({ name: 'edit_file', args: { Path: '/polku/t.js' } }), 'koodimuokkaus');
  assert.equal(luokitteleKulutusKutsu({ name: 'manage_task', args: { Action: 'status', TaskId: 'task-1' } }), 'odotus_status');
  assert.equal(luokitteleKulutusKutsu({ name: 'manage_task', args: { Action: 'kill', TaskId: 'task-1' } }), 'odotus');

  // Git paikallinen vs etä
  assert.equal(luokitteleKulutusKutsu({ name: 'run_command', args: { CommandLine: 'git status --porcelain' } }), 'git_local');
  assert.equal(luokitteleKulutusKutsu({ name: 'run_command', args: { CommandLine: 'ssh palvelin "cd ~ && git status"' } }), 'git_remote_ssh');
  assert.equal(luokitteleKulutusKutsu({ name: 'run_command', args: { CommandLine: 'ssh palvelin "systemctl status"' } }), 'remote_ssh');

  // Tiedonhaku ja testit
  assert.equal(luokitteleKulutusKutsu({ name: 'run_command', args: { CommandLine: 'find . -name "*.swift"' } }), 'tiedonhaku');
  assert.equal(luokitteleKulutusKutsu({ name: 'run_command', args: { CommandLine: 'grep -rn "RelayGuard" Infra/iot/expresso' } }), 'tiedonhaku');
  assert.equal(luokitteleKulutusKutsu({ name: 'run_command', args: { CommandLine: 'python3 testit/turva_pika_smoke.py' } }), 'testit');
});

test('analysoiIstunnonKulutus: laskee tarkat kutsumäärät ja hukan osuuden', () => {
  const jsonl = [
    JSON.stringify({ type: 'USER_INPUT', content: 'Malliton purku: lue /tmp/scopes-siirto-git.md' }),
    JSON.stringify({
      type: 'PLANNER_RESPONSE',
      tool_calls: [
        { name: 'run_command', args: { CommandLine: 'git status' } },
        { name: 'run_command', args: { CommandLine: 'find . -name "git-*.mjs"' } },
      ],
    }),
    JSON.stringify({
      type: 'PLANNER_RESPONSE',
      tool_calls: [
        { name: 'manage_task', args: { Action: 'status', TaskId: 't1' } },
        { name: 'edit_file', args: { Path: 'scopes/siirto/git/git-synkka.mjs' } },
      ],
    }),
  ].join('\n');

  const tulos = analysoiIstunnonKulutus(jsonl);
  assert.equal(tulos.skooppi, 'scopes siirto git');
  assert.equal(tulos.userInputs, 1);
  assert.equal(tulos.plannerResponses, 2);
  assert.equal(tulos.tyokalujaYhteensa, 4);
  assert.equal(tulos.statusPollaus, 1);
  assert.equal(tulos.tyokalut.git_local, 1);
  assert.equal(tulos.tyokalut.tiedonhaku, 1);
  assert.equal(tulos.tyokalut.odotus_status, 1);
  assert.equal(tulos.tyokalut.koodimuokkaus, 1);
  assert.equal(tulos.hukkaKutsut, 3); // git_local + tiedonhaku + odotus_status
  assert.equal(tulos.hukkaOsuus, 75.0); // 3 / 4 = 75%
});

test('karsiKuluttaja: palauttaa räätälöidyt karsintatoimet ja säästötavoitteet', () => {
  const gitKarsinta = karsiKuluttaja('scopes siirto git');
  assert.equal(gitKarsinta.tunnistettu, true);
  assert.equal(gitKarsinta.saastoKutsujaVrk, 517);
  assert.ok(gitKarsinta.juurisyyt.length >= 3);
  assert.ok(gitKarsinta.karsintatoimet.length >= 3);

  const expressoKarsinta = karsiKuluttaja('infra expresso');
  assert.equal(expressoKarsinta.tunnistettu, true);
  assert.equal(expressoKarsinta.saastoKutsujaVrk, 490);
  assert.ok(expressoKarsinta.karsintatoimet.some((t) => t.includes('tiedostokarttaa')));
  assert.ok(expressoKarsinta.karsintatoimet.some((t) => t.includes('batch-ajona')));

  const geneerinen = karsiKuluttaja('scopes muu');
  assert.equal(geneerinen.tunnistettu, false);
  assert.equal(geneerinen.saastoKutsujaVrk, 70);
});

test('muodostaExpressoTestiAjoKomento: muodostaa oikeat koontikomennot', () => {
  const cmd1 = muodostaExpressoTestiAjoKomento();
  assert.match(cmd1, /^cd Infra\/iot\/expresso && python3 testit\/turva_pika_smoke\.py && /);

  const cmd2 = muodostaExpressoTestiAjoKomento({ kaikki: true });
  assert.equal(cmd2, 'cd Infra/iot/expresso && python3 -m unittest discover -s testit -p "*smoke*.py"');
});

test('tarkistaMolemmatGitTilat: kutsuu paikallista ja etävarastoa yhdellä kertaa', async () => {
  const kutsut = [];
  const valevalssi = async (cmd, args, opts) => {
    kutsut.push({ cmd, args, opts });
    if (cmd === 'git') return { koodi: 0, stdout: 'M scopes/siirto/git/REKISTERI.md\n' };
    if (cmd === 'ssh') return { koodi: 0, stdout: '' };
    return { koodi: 1 };
  };

  const tulos = await tarkistaMolemmatGitTilat({ aja: valevalssi });
  assert.equal(tulos.synkassa, true);
  assert.equal(tulos.local, 'M scopes/siirto/git/REKISTERI.md');
  assert.equal(kutsut.length, 2);
  assert.equal(kutsut[0].cmd, 'git');
  assert.equal(kutsut[1].cmd, 'ssh');
});

test('muotoileKuluttajaOhje: tuottaa selkeän markdown-ohjeen', () => {
  const ohje = muotoileKuluttajaOhje({ skooppi: 'infra expresso' });
  assert.match(ohje, /# AGY Economy — Suurimpien kuluttajien karsinta/);
  assert.match(ohje, /scopes siirto git/);
  assert.match(ohje, /infra expresso/);
  assert.match(ohje, /\+517 kutsua/);
  assert.match(ohje, /\+490 kutsua/);
  assert.match(ohje, /Kohdistettu ohje skoopille `infra expresso`/);
});
