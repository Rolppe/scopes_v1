// Automaatiotesti: Git- ja siirtolukitukset sekä exit 3 -käsittely
// Testaa pakkaa-hybridi.mjs:n ja pakkaa-alku.mjs:n lukitustilanteet:
// 1. Aliprosessin palauttama exit 3 ('LUKKO: varattu — <haltija>') välittyy pakkaa-hybridi.mjs:n kautta
//    tulosteineen ja poistumiskoodina exit 3.
// 2. spawnSync välittää stdout/stderr -tulosteet ja exit-koodit ilman poikkeuksia.
// 3. pakkaa-alku.mjs lukitus- ja eristystilanteet (r&do-työkalukopio puuttuu, vieras skooppi exit 3).
// 4. Git- ja siirtolukitusrajapinnan (lukot.mjs) logiikka ja lukkopolkujen eristys.
// 5. Haltijatiedon regex-jäsennys ja LUKKO: varattu -viestien muotoilu.

import { describe, it, test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  repoLukko,
  tiedostoLukko,
  skooppiLukko,
  perusHakemisto,
} from '../../../../../claude/siirto/tools/lukot.mjs';

const TAMA_HAKEMISTO = dirname(fileURLToPath(import.meta.url));
const HYBRIDI_POLKU = resolve(TAMA_HAKEMISTO, '../pakkaa-hybridi.mjs');
const ALKU_POLKU = resolve(TAMA_HAKEMISTO, '../../../../../claude/siirto/tools/pakkaa-alku.mjs');

const valiaikaiset = [];
after(() => {
  for (const h of valiaikaiset) {
    try {
      rmSync(h, { recursive: true, force: true });
    } catch {
      // Hiljennetään mahdolliset siivousvirheet testiajon päätteeksi
    }
  }
});

/**
 * Luo eristetyn tilapäistyötilan testiä varten.
 */
function luoTyotila() {
  const hak = mkdtempSync(join(tmpdir(), 'lukitus-test7-'));
  valiaikaiset.push(hak);
  const juuri = join(hak, 'juuri');
  const tila = join(hak, 'tila');
  const toolsDir = join(juuri, 'claude/siirto/tools');
  mkdirSync(toolsDir, { recursive: true });
  mkdirSync(tila, { recursive: true });

  // Alustetaan minimaalinen git-repo, jotta git status ja rev-parse toimivat
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: juuri });
  execFileSync('git', ['config', 'user.name', 'testi-kayttaja'], { cwd: juuri });
  execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: juuri });

  const readme = join(juuri, 'README.md');
  writeFileSync(readme, '# Testirepo\n', 'utf8');
  execFileSync('git', ['add', 'README.md'], { cwd: juuri });
  execFileSync('git', ['commit', '-q', '-m', 'chore: initial commit'], { cwd: juuri });

  // Luodaan skoopin rekisteritiedosto
  const skooppiRel = 'scopes/testi';
  const skooppiDir = join(juuri, skooppiRel);
  mkdirSync(skooppiDir, { recursive: true });
  const rekisteriPolku = join(skooppiDir, 'REKISTERI.md');
  writeFileSync(
    rekisteriPolku,
    '# Testi-skooppi\n\nTilanne: 17.10.2026\n\nSEURAAVA PAKETTI: TESTI-1 — testikuvaus\n',
    'utf8'
  );
  execFileSync('git', ['add', rekisteriPolku], { cwd: juuri });
  execFileSync('git', ['commit', '-q', '-m', 'chore: lisaa rekisteri'], { cwd: juuri });

  // Luodaan skooppikartta ja repokartta työtilaan
  const siirtoState = join(juuri, 'claude/siirto/state');
  mkdirSync(siirtoState, { recursive: true });
  writeFileSync(
    join(siirtoState, 'skoopit.json'),
    JSON.stringify({
      'scopes testi': ['scopes/testi/REKISTERI.md'],
      'scopes context': ['scopes/context/A.md'],
    }),
    'utf8'
  );
  writeFileSync(
    join(siirtoState, 'repot.json'),
    JSON.stringify({ '.': { haara: 'main' } }),
    'utf8'
  );

  return { hak, juuri, tila, toolsDir, rekisteriPolku };
}

/**
 * Luo mock pakkaa-alku.mjs -skriptin, joka läpäisee vaiheen 1 ja vaiheen 4 (--tarkista).
 */
function luoOnnistuvaPakkaaAlku(toolsDir, muistioPolku) {
  const scriptContent = `#!/usr/bin/env node
const args = process.argv.slice(2);
if (args[0] === '--tarkista') {
  console.log('PORTTI: ok');
  console.log('TAYTA: ok');
  console.log('KATTO-MUISTIO: ok');
  console.log('HUKKA-LUKU: ok');
  console.log('KESKEN-LUKU: ok');
  process.exit(0);
}
console.log('SKOOPPITARKISTUS: scopes testi ← (ei muutettuja polkuja) → pakataan: scopes testi');
console.log('MUISTIO: ' + ${JSON.stringify(muistioPolku)});
console.log('SEURAAVA-HEAD: SEURAAVA PAKETTI: TESTI-1 — testikuvaus');
console.log('AUTOPACK: false');
process.exit(0);
`;
  const p = join(toolsDir, 'pakkaa-alku.mjs');
  writeFileSync(p, scriptContent, { mode: 0o755 });
  return p;
}

// ============================================================================
// Ryhmä 1: pakkaa-hybridi.mjs ja aliprosessien exit 3 ('LUKKO: varattu') -käsittely
// ============================================================================
describe('Ryhmä 1: pakkaa-hybridi.mjs ja aliprosessien exit 3 -käsittely', () => {
  test('pakkaa-loppu.mjs exit 3 ("LUKKO: varattu — <haltija>") välittyy hybridi-skriptin exit-koodiksi 3 ja stdout säilyy', () => {
    const { juuri, tila, toolsDir } = luoTyotila();
    const muistioPolku = join(tila, 'pakkaus-muistio.md');
    luoOnnistuvaPakkaaAlku(toolsDir, muistioPolku);

    const loppuLukkoViesti = 'LUKKO: varattu — infra expresso (istunto abc12345, pid 7, alkaen 10:00)';
    const loppuPakkaaGit = 'PAKKAA-GIT: ei committia eikä pushia — toinen pakkaus kesken; muutokset ovat työpuussa';
    const loppuPakkausRivi = 'PAKKAUS: epäselvä — lukko: katso rivi ' + loppuLukkoViesti;

    // Luodaan pakkaa-loppu.mjs, joka simuloi git-lukon varattuna olemista
    const loppuMock = `#!/usr/bin/env node
console.log(${JSON.stringify(loppuLukkoViesti)});
console.log(${JSON.stringify(loppuPakkaaGit)});
console.log(${JSON.stringify(loppuPakkausRivi)});
process.exit(3);
`;
    writeFileSync(join(toolsDir, 'pakkaa-loppu.mjs'), loppuMock, { mode: 0o755 });

    // Ajetaan pakkaa-hybridi.mjs vahvistettuna ja deterministisellä mallilla
    const res = spawnSync(
      'node',
      [HYBRIDI_POLKU, 'scopes testi', '--vahvistettu', '--ilman-mallia'],
      {
        cwd: juuri,
        env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: tila },
        encoding: 'utf8',
      }
    );

    // Varmistetaan, että spawnSync ei heittänyt poikkeusta
    assert.equal(res.error, undefined, 'spawnSync ei saa palauttaa error-oliota');
    // Varmistetaan, että pakkaa-hybridi poistui täsmälleen koodilla 3
    assert.equal(res.status, 3, `Odotettiin exit 3, saatiin: ${res.status}`);
    // Varmistetaan, että stdout sisältää sanatarkasti lukkoviestin ja git-rivin
    assert.ok(
      res.stdout.includes(loppuLukkoViesti),
      `Tulosteesta puuttuu lukkorivi: ${res.stdout}`
    );
    assert.ok(
      res.stdout.includes(loppuPakkaaGit),
      `Tulosteesta puuttuu PAKKAA-GIT-rivi: ${res.stdout}`
    );
  });

  test('pakkaa-loppu.mjs:n stderr välittyy pakkaa-hybridi.mjs:n kautta ehjänä exit 3 -tilanteessa', () => {
    const { juuri, tila, toolsDir } = luoTyotila();
    const muistioPolku = join(tila, 'pakkaus-muistio.md');
    luoOnnistuvaPakkaaAlku(toolsDir, muistioPolku);

    const lukkoViesti = 'LUKKO: varattu — claude siirto (pid 4567)';
    const stderrViesti = 'VIRHE-LOKI: repolukon acquire palautti exit 3';

    const loppuMock = `#!/usr/bin/env node
console.log(${JSON.stringify(lukkoViesti)});
process.stderr.write(${JSON.stringify(stderrViesti + '\n')});
process.exit(3);
`;
    writeFileSync(join(toolsDir, 'pakkaa-loppu.mjs'), loppuMock, { mode: 0o755 });

    const res = spawnSync(
      'node',
      [HYBRIDI_POLKU, 'scopes testi', '--vahvistettu', '--ilman-mallia'],
      {
        cwd: juuri,
        env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: tila },
        encoding: 'utf8',
      }
    );

    assert.equal(res.error, undefined);
    assert.equal(res.status, 3);
    assert.ok(res.stdout.includes(lukkoViesti));
    assert.ok(res.stderr.includes(stderrViesti), `Stderr ei välittynyt: ${res.stderr}`);
  });

  test('aja-siirtaja.sh exit 3 pysäyttää suorituksen koodilla 3 eikä pakkaa-loppu.mjs -vaihetta kutsuta', () => {
    const { juuri, tila, toolsDir } = luoTyotila();
    const muistioPolku = join(tila, 'pakkaus-muistio.md');
    luoOnnistuvaPakkaaAlku(toolsDir, muistioPolku);

    const siirtajaLukkoViesti = 'LUKKO: varattu — toinen-agentti (istunto xyz123, pid 8888)';
    const siirtajaMock = `#!/usr/bin/env bash
echo "${siirtajaLukkoViesti}"
echo "SIIRTO: lukko varattu — paketointi estetty"
exit 3
`;
    writeFileSync(join(toolsDir, 'aja-siirtaja.sh'), siirtajaMock, { mode: 0o755 });

    // Luodaan pakkaa-loppu.mjs, joka jättää merkin tiedostojärjestelmään jos sitä kutsutaan
    const merkkiPolku = join(juuri, 'pakkaa-loppu-ajettiin.txt');
    const loppuMock = `#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
writeFileSync(${JSON.stringify(merkkiPolku)}, 'virhe');
process.exit(0);
`;
    writeFileSync(join(toolsDir, 'pakkaa-loppu.mjs'), loppuMock, { mode: 0o755 });

    const res = spawnSync(
      'node',
      [HYBRIDI_POLKU, 'scopes testi', '--vahvistettu', '--ilman-mallia'],
      {
        cwd: juuri,
        env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: tila },
        encoding: 'utf8',
      }
    );

    assert.equal(res.error, undefined);
    assert.equal(res.status, 3);
    assert.ok(res.stdout.includes(siirtajaLukkoViesti));
    assert.equal(
      existsSync(merkkiPolku),
      false,
      'pakkaa-loppu.mjs:ää ei olisi saanut kutsua aja-siirtaja.sh:n exit 3 jälkeen'
    );
  });

  test('pakkaa-alku.mjs exit 3 pysäyttää pakkaa-hybridi.mjs:n heti vaiheessa 1', () => {
    const { juuri, tila, toolsDir } = luoTyotila();
    const pysahdysViesti = 'PYSÄHDY: claude r&do -työkalukopio puuttuu (claude/r&do/tools/pack-memo.mjs)';

    // pakkaa-alku palauttaa suoraan exit 3
    const alkuMock = `#!/usr/bin/env node
console.log(${JSON.stringify(pysahdysViesti)});
process.exit(3);
`;
    writeFileSync(join(toolsDir, 'pakkaa-alku.mjs'), alkuMock, { mode: 0o755 });

    const res = spawnSync(
      'node',
      [HYBRIDI_POLKU, 'scopes testi', '--vahvistettu', '--ilman-mallia'],
      {
        cwd: juuri,
        env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: tila },
        encoding: 'utf8',
      }
    );

    assert.equal(res.error, undefined);
    assert.equal(res.status, 3);
    assert.ok(res.stdout.includes(pysahdysViesti));
    assert.ok(res.stderr.includes('PYSÄHDY: Pakkauksen alustus vaatii käyttäjän huomiota.'));
    // Vaiheita 2-5 ei saa ajaa
    assert.equal(res.stdout.includes('[2/5] Louhitaan faktat'), false);
    assert.equal(res.stdout.includes('[5/5]'), false);
  });

  test('eri lukonhaltijoiden muodot ("LUKKO: varattu — <haltija>") säilyvät sanatarkasti tulosteessa', () => {
    const testitapaukset = [
      'infra expresso (istunto ce423572, pid 1470, alkaen 09:17)',
      'models jevin (pid 2048)',
      'claude siirto (istunto 11223344, alkaen 08.00)',
      'tuntematon haltija',
    ];

    for (const haltija of testitapaukset) {
      const { juuri, tila, toolsDir } = luoTyotila();
      const muistioPolku = join(tila, 'pakkaus-muistio.md');
      luoOnnistuvaPakkaaAlku(toolsDir, muistioPolku);

      const lukkoRivi = `LUKKO: varattu — ${haltija}`;
      const loppuMock = `#!/usr/bin/env node
console.log(${JSON.stringify(lukkoRivi)});
process.exit(3);
`;
      writeFileSync(join(toolsDir, 'pakkaa-loppu.mjs'), loppuMock, { mode: 0o755 });

      const res = spawnSync(
        'node',
        [HYBRIDI_POLKU, 'scopes testi', '--vahvistettu', '--ilman-mallia'],
        {
          cwd: juuri,
          env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: tila },
          encoding: 'utf8',
        }
      );

      assert.equal(res.status, 3);
      assert.ok(
        res.stdout.includes(lukkoRivi),
        `Haltijamerkkijono ei säilynyt: odotettiin "${lukkoRivi}", saatiin:\n${res.stdout}`
      );
    }
  });
});

// ============================================================================
// Ryhmä 2: spawnSync-invarianssit ja poikkeuksettomuus aliprosessien exit 3 -tilanteissa
// ============================================================================
describe('Ryhmä 2: spawnSync-invarianssit ja poikkeuksettomuus', () => {
  test('spawnSync suorittaa exit 3 -koodilla poistuvan prosessin ilman poikkeusta (error on undefined)', () => {
    const res = spawnSync(
      'node',
      ['-e', 'console.log("LUKKO: varattu — test-haltija"); process.exit(3);'],
      { encoding: 'utf8' }
    );

    assert.equal(res.error, undefined, 'spawnSync ei saa asettaa error-kenttää exit-koodin ollessa 3');
    assert.equal(res.status, 3, 'status-kentän tulee olla 3');
    assert.equal(res.signal, null, 'signal-kentän tulee olla null (normaali poistuminen)');
    assert.match(res.stdout, /^LUKKO: varattu — test-haltija/m);
  });

  test('spawnSync välittää samanaikaiset stdout- ja stderr-tulosteet erillisinä ilman leikkaantumista', () => {
    const res = spawnSync(
      'node',
      [
        '-e',
        'process.stdout.write("LUKKO: varattu — testi\\n"); process.stderr.write("DIAGNOSTIIKKA: lukkojonossa 3 yritystä\\n"); process.exit(3);',
      ],
      { encoding: 'utf8' }
    );

    assert.equal(res.status, 3);
    assert.equal(res.error, undefined);
    assert.equal(res.stdout, 'LUKKO: varattu — testi\n');
    assert.equal(res.stderr, 'DIAGNOSTIIKKA: lukkojonossa 3 yritystä\n');
  });

  test('spawnSync puskuroi pitkät lukkolokit (odota-silmukat) täysimittaisina ilman tiedonmenetystä', () => {
    // Simuloidaan 24 yrityksen odotussilmukkaa, kuten pakkaa-git.sh tekee
    const rivit = [];
    for (let i = 1; i <= 24; i++) {
      rivit.push(`LUKKO: varattu, haltija agentti-1 — repo ., odotan enintään 480 s (yritys ${i}/24)`);
    }
    rivit.push('LUKKO: varattu 24 yrityksen jälkeen (480 s), repo ., haltija agentti-1');
    rivit.push('PAKKAA-GIT: ei committia eikä pushia — toinen pakkaus kesken; muutokset ovat työpuussa');

    const koodi = `
for (const r of ${JSON.stringify(rivit)}) {
  console.log(r);
}
process.exit(3);
`;
    const res = spawnSync('node', ['-e', koodi], { encoding: 'utf8' });

    assert.equal(res.status, 3);
    assert.equal(res.error, undefined);
    for (const r of rivit) {
      assert.ok(res.stdout.includes(r), `Puuttuva rivi tulosteessa: ${r}`);
    }
  });

  test('spawnSync erottaa toisistaan sovellustason exit 3 -koodin ja käynnistysvirheen (ENOENT)', () => {
    // 1. Olemassa oleva komento exit-koodilla 3
    const sovellusVirhe = spawnSync('node', ['-e', 'process.exit(3);'], { encoding: 'utf8' });
    assert.equal(sovellusVirhe.status, 3);
    assert.equal(sovellusVirhe.error, undefined);

    // 2. Puuttuva binääri
    const enoentVirhe = spawnSync('olematon-binääri-xyz-12345', [], { encoding: 'utf8' });
    assert.notEqual(enoentVirhe.error, undefined);
    assert.equal(enoentVirhe.error.code, 'ENOENT');
  });
});

// ============================================================================
// Ryhmä 3: pakkaa-alku.mjs lukitus- ja eristystilanteet
// ============================================================================
describe('Ryhmä 3: pakkaa-alku.mjs lukitus- ja eristystilanteet', () => {
  test('pakkaa-alku.mjs poistuu exit 3 -koodilla kun r&do-työkalukopio puuttuu (PYSÄHDY-eristysinvariantti)', () => {
    const { juuri, tila } = luoTyotila();
    // Luodaan skooppirajausta varten skoopit.json ja repot.json
    const siirtoState = join(juuri, 'claude/siirto/state');
    mkdirSync(siirtoState, { recursive: true });
    writeFileSync(
      join(siirtoState, 'skoopit.json'),
      JSON.stringify({ 'claude r&do': ['claude/r&do/docs/design/RDO-STATUS.md'] }),
      'utf8'
    );
    writeFileSync(
      join(siirtoState, 'repot.json'),
      JSON.stringify({ '.': { haara: 'main' } }),
      'utf8'
    );

    const env = {
      ...process.env,
      PAKKAA_JUURI: juuri,
      SIIRTO_STATE_DIR: tila,
    };
    delete env.PAKKAA_PACKMEMO;

    const res = spawnSync('node', [ALKU_POLKU, 'claude r&do'], {
      cwd: juuri,
      env,
      encoding: 'utf8',
    });

    assert.equal(res.status, 3, `Odotettiin exit 3 r&do-puuttumiselle, saatiin: ${res.status}`);
    assert.match(res.stdout, /^PYSÄHDY: claude r&do -työkalukopio puuttuu/m);
  });

  test('pakkaa-alku.mjs käsittelee aliprosessin (vieras-skooppi.mjs) exit 3 -koodin kaatumatta', () => {
    const { juuri, tila } = luoTyotila();
    const siirtoState = join(juuri, 'claude/siirto/state');
    mkdirSync(siirtoState, { recursive: true });
    writeFileSync(
      join(siirtoState, 'skoopit.json'),
      JSON.stringify({
        'scopes context': ['scopes/context/A.md'],
        'vieras skooppi': ['scopes/vieras/B.md'],
      }),
      'utf8'
    );
    writeFileSync(
      join(siirtoState, 'repot.json'),
      JSON.stringify({ '.': { haara: 'main' } }),
      'utf8'
    );

    // Luodaan muutettu tiedosto vieraan skoopin alle
    const vierasTiedosto = join(juuri, 'scopes/vieras/B.md');
    mkdirSync(dirname(vierasTiedosto), { recursive: true });
    writeFileSync(vierasTiedosto, 'muutos\n', 'utf8');

    // Asetetaan PAKKAA_VIERAS -tynkä palauttamaan exit 3
    const env = {
      ...process.env,
      PAKKAA_JUURI: juuri,
      SIIRTO_STATE_DIR: tila,
      PAKKAA_SYNKKA: 'echo "SYNKKA: ok"',
      PAKKAA_SKOOPPI_POLUSTA: 'echo "vieras skooppi\tscopes/vieras/B.md"',
      PAKKAA_VIERAS: 'exit 3 #',
      PAKKAA_PACKMEMO: 'echo "state/pakkaus-muistio.md"',
    };

    const res = spawnSync('node', [ALKU_POLKU, 'scopes context'], {
      cwd: juuri,
      env,
      encoding: 'utf8',
    });

    assert.equal(res.status, 0, 'pakkaa-alku.mjs ei saa kaatua kun vieras-skooppi palauttaa exit 3');
    assert.match(
      res.stdout,
      /^VIERAS: vieras skooppi — ei tarkistettavissa \(ei transkriptia tai \/pura-komentoa\); pakataan kuten ennen$/m
    );
    assert.match(res.stdout, /^SKOOPPITARKISTUS: .*→ pakataan: scopes context, vieras skooppi$/m);
  });

  test('pakkaa-alku.mjs välittää synkka-vaiheen huomiot (rebase-konflikti, origin ei tavoitettavissa) ilman poikkeuksia', () => {
    const { juuri, tila } = luoTyotila();
    const env = {
      ...process.env,
      PAKKAA_JUURI: juuri,
      SIIRTO_STATE_DIR: tila,
      PAKKAA_SYNKKA: 'echo "rebase-konflikti havaittu"; echo "origin ei tavoitettavissa"; exit 1',
      PAKKAA_PACKMEMO: 'echo "state/pakkaus-muistio.md"',
    };

    const res = spawnSync('node', [ALKU_POLKU, 'scopes testi'], {
      cwd: juuri,
      env,
      encoding: 'utf8',
    });

    assert.equal(res.status, 0);
    assert.match(res.stdout, /^SYNKKA: huomio — rebase-konflikti.*origin ei tavoitettavissa/m);
  });

  test('pakkaa-alku.mjs --tarkista palauttaa exit 4 kun muistiossa on täyttämättömiä TÄYTÄ-rivejä', () => {
    const { juuri, tila } = luoTyotila();
    const muistioPolku = join(tila, 'pakkaus-muistio.md');
    writeFileSync(
      muistioPolku,
      '# Pakkausmuistio — scopes testi\n<!-- TÄYTÄ: täytä tämä -->\n## Hukka\nei\n## Kesken keskustelussa\nei\n',
      'utf8'
    );

    const res = spawnSync('node', [ALKU_POLKU, '--tarkista', 'scopes testi', muistioPolku], {
      cwd: juuri,
      env: { ...process.env, PAKKAA_JUURI: juuri, SIIRTO_STATE_DIR: tila },
      encoding: 'utf8',
    });

    assert.equal(res.status, 4, `Odotettiin exit 4 täyttämättömälle muistiolle, saatiin ${res.status}`);
    assert.match(res.stdout, /^TAYTA: 1 jäljellä/m);
  });
});

// ============================================================================
// Ryhmä 4: Git- ja siirtolukitusrajapinnan (lukot.mjs) logiikka ja eristys
// ============================================================================
describe('Ryhmä 4: lukot.mjs - Git- ja siirtolukitusten eristys ja polkujen generointi', () => {
  test('repoLukko osoittaa juurirepolle (".") suoraan perushakemistoon ja alirepoille erilliseen lukkohakemistoon', () => {
    const valatila = '/tmp/valatila-test7';

    // Juurirepo '.' on itse perushakemisto (state/lock yhteensopivuus)
    const juuriLukko = repoLukko('.', valatila);
    assert.equal(juuriLukko, valatila);

    // Alirepoille luodaan sanitize-muotoiltu alihakemisto: <tila>/lukot/repo-<nimi>
    const rd2Lukko = repoLukko('claude/r&d2', valatila);
    assert.equal(rd2Lukko, join(valatila, 'lukot', 'repo-claude-r-d2'));

    const pluginLukko = repoLukko('Automation_plugin', valatila);
    assert.equal(pluginLukko, join(valatila, 'lukot', 'repo-Automation_plugin'));
  });

  test('tiedostoLukko sanitointi ja polkumääritys', () => {
    const valatila = '/tmp/valatila-test7';

    const f1 = tiedostoLukko('scopes/agy/REKISTERI.md', valatila);
    assert.equal(f1, join(valatila, 'lukot', 'tiedosto-scopes-agy-REKISTERI.md'));

    const f2 = tiedostoLukko('claude/r&do/docs/design/RDO-STATUS.md', valatila);
    assert.equal(f2, join(valatila, 'lukot', 'tiedosto-claude-r-do-docs-design-RDO-STATUS.md'));
  });

  test('skooppiLukko ohjaa rekisterillisen skoopin tiedostolukkoon', async () => {
    const valatila = '/tmp/valatila-test7';

    // skoopinRekisteri löytää scopes agy:n rekisterin
    const sl = await skooppiLukko('scopes agy', valatila);
    assert.equal(sl, join(valatila, 'lukot', 'tiedosto-scopes-agy-REKISTERI.md'));
  });

  test('Lukkojen riippumattomuus: eri repojen ja rekisterien lukkopolut eivät törmää keskenään', () => {
    const valatila = '/tmp/valatila-test7';
    const repot = ['.', 'claude-siirto', 'claude-idea', 'claude-filter', 'claude-demo', 'claude-rd2'];
    const lukkoPolut = repot.map((r) => repoLukko(r, valatila));

    const uniikit = new Set(lukkoPolut);
    assert.equal(uniikit.size, repot.length, 'Kaikkien alirepojen lukkopolkujen on oltava toisistaan erillisiä');
  });

  test('perusHakemisto ottaa huomioon argumentin, SIIRTO_STATE_DIR:n ja oletuksen oikeassa etuoikeusjärjestyksessä', () => {
    assert.equal(perusHakemisto('/annettu/polku'), '/annettu/polku');

    const vanhaEnv = process.env.SIIRTO_STATE_DIR;
    try {
      process.env.SIIRTO_STATE_DIR = '/env/polku';
      assert.equal(perusHakemisto(), '/env/polku');
    } finally {
      if (vanhaEnv !== undefined) {
        process.env.SIIRTO_STATE_DIR = vanhaEnv;
      } else {
        delete process.env.SIIRTO_STATE_DIR;
      }
    }
  });
});

// ============================================================================
// Ryhmä 5: Lukitusviestien ja haltijoiden regex-jäsennys
// ============================================================================
describe('Ryhmä 5: Lukitusviestien jäsennys ja regex-yhteensopivuus', () => {
  test('pakkaa-loppu.mjs:n haltijaregex /haltija (.+?)(?: — |$)/ poimii haltijan eri pakkaa-git.sh -formaateista', () => {
    const regex = /haltija (.+?)(?: — |$)/;

    // Muoto 1: Yhteenvetorivi 24 yrityksen jälkeen
    const r1 = 'LUKKO: varattu 24 yrityksen jälkeen (480 s), repo ., haltija infra expresso (istunto abc12345, pid 7, alkaen 10:00)';
    const m1 = regex.exec(r1);
    assert.ok(m1);
    assert.equal(m1[1], 'infra expresso (istunto abc12345, pid 7, alkaen 10:00)');

    // Muoto 2: Väliaikarivi odotusjonossa
    const r2 = 'LUKKO: varattu, haltija claude siirto — repo claude-siirto, odotan enintään 480 s (yritys 1/24)';
    const m2 = regex.exec(r2);
    assert.ok(m2);
    assert.equal(m2[1], 'claude siirto');

    // Muoto 3: Lyhyt rivi ilman lisäselitteitä
    const r3 = 'LUKKO: varattu, haltija models jevin';
    const m3 = regex.exec(r3);
    assert.ok(m3);
    assert.equal(m3[1], 'models jevin');
  });

  test('LUKKO: varattu -rivien tunnistus ja suodatus lokitulosteesta', () => {
    const loki = [
      'COMMIT juuri: 1234567',
      'SYNKKA .: ok',
      'LUKKO: otettu (minä; repo .)',
      'LUKKO: varattu — toinen istunto',
      'PAKKAA-GIT: ei committia',
    ];

    const varattuRivi = loki.find((r) => /^LUKKO: varattu/.test(r));
    assert.equal(varattuRivi, 'LUKKO: varattu — toinen istunto');

    const filteroidut = loki.filter((r) => /^(COMMIT|SYNKKA|TARKISTIN|PAKKAA-GIT|LUKKO)/.test(r));
    assert.equal(filteroidut.length, 5);
  });
});
