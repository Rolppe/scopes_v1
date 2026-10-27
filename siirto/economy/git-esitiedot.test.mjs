import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { haeJaMuotoileGitEsitiedot } from './git-esitiedot.mjs';

const TAMA = dirname(fileURLToPath(import.meta.url));
const SKRIPTI = resolve(TAMA, 'git-esitiedot.mjs');

test('haeJaMuotoileGitEsitiedot: hakee ja muotoilee git-esitiedot skoopille', async () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-git-esitiedot-'));
  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({
      'scopes siirto economy': ['scopes/siirto/economy/REKISTERI.md'],
    })
  );

  const valevalssi = async (komento, args) => {
    if (args[0] === 'rev-parse') return { koodi: 0, stdout: 'claude/economy-test\n' };
    if (args[0] === 'log') return { koodi: 0, stdout: '12345678\tfeat(economy): testi\n' };
    if (args[0] === 'status') {
      return {
        koodi: 0,
        stdout: [
          ' M scopes/siirto/economy/REKISTERI.md',
          ' M scopes/ios/KeyView.swift',
        ].join('\n'),
      };
    }
    return { koodi: 1, stdout: '' };
  };

  const tulos = await haeJaMuotoileGitEsitiedot('scopes siirto economy', {
    juuri: d,
    aja: valevalssi,
  });

  assert.equal(tulos.branch, 'claude/economy-test');
  assert.equal(tulos.puu, 'likainen');
  assert.equal(tulos.skoopinMuutokset.length, 1);
  assert.equal(tulos.skoopinMuutokset[0].polku, 'scopes/siirto/economy/REKISTERI.md');
  assert.equal(tulos.muutMuutokset.length, 1);
  assert.equal(tulos.muutMuutokset[0].polku, 'scopes/ios/KeyView.swift');

  assert.ok(tulos.teksti.includes('GIT-TILA (deterministinen esisyöttö — älä aja git status / git log / git diff)'));
  assert.ok(tulos.teksti.includes('- Haara: claude/economy-test (HEAD 12345678 feat(economy): testi)'));
  assert.ok(tulos.teksti.includes('- Skoopin puu: likainen (1 muutosta skoopin poluissa)'));
  assert.ok(tulos.teksti.includes('M scopes/siirto/economy/REKISTERI.md'));
  assert.ok(tulos.teksti.includes('- Muutokset toisissa skoopeissa: 1 kpl (jaettu työklooni — Sääntö 15 & V-KORD-5: älä koske, älä committaa)'));
  assert.ok(tulos.teksti.includes('Älä tee git status-, git log- tai git diff -kutsuja'));
});

test('git-esitiedot.mjs CLI: tulostaa tekstin ja tukee --json-valitsinta', () => {
  const node = process.execPath;
  const resTeksti = spawnSync(node, [SKRIPTI, 'scopes siirto economy'], { encoding: 'utf8' });
  assert.equal(resTeksti.status, 0);
  assert.ok(resTeksti.stdout.includes('GIT-TILA (deterministinen esisyöttö — älä aja git status / git log / git diff)'));
  assert.ok(resTeksti.stdout.includes('Skoopin puu:'));

  const resJson = spawnSync(node, [SKRIPTI, 'scopes siirto economy', '--json'], { encoding: 'utf8' });
  assert.equal(resJson.status, 0);
  const data = JSON.parse(resJson.stdout);
  assert.equal(typeof data.branch, 'string');
  assert.equal(typeof data.teksti, 'string');
  assert.ok(Array.isArray(data.skoopinMuutokset));
});
