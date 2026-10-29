// Automaatiotesti: Scopes-säännön 8 mukainen vahvistusportti (pakkaa-hybridi.mjs)
// Sääntö 8: Tilaa muuttava vaihe [5/5] (git add + commit + push ja rekisteripäivitys)
// vaatii aina käyttäjän vahvistuksen, ellei autopack ole aktiivisena.
//
// Testit kattavat:
// 1. autopack = false ilman --vahvistettu:
//    - Vaiheet 1–4 suoritetaan, muistio luodaan ja portti hyväksytään
//    - Pysähtyy exit-koodilla 5
//    - Tulostaa protokollarivit: 'KYSY-VAHVISTUS: add + commit + push' ja 'UUSINTA: node ... --vahvistettu'
//    - Vaiheen 5 tilaa muuttavia komentoja (aja-siirtaja.sh, pakkaa-loppu.mjs) EI suoriteta luvatta
// 2. --vahvistettu annettu:
//    - Suoritus etenee vaiheeseen 5
//    - Rekisteripäivitys ja git-vaihe suoritetaan onnistuneesti (exit 0)
// 3. Autopack-tilan tunnistus eri lähteistä:
//    - pakkaa-alku.mjs (AUTOPACK: true)
//    - yhteinen autopack.txt
//    - istuntokohtainen autopack.txt (--session)
// 4. UUSINTA-komennon tarkka rekonstruktio argumentteineen
// 5. Virheiden leviäminen vaiheen 5 suorituksesta
// 6. Kuiva-ajon (--kuiva) ja vahvistusportin suhde

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HYBRIDI_SKRIPTI = resolve(dirname(fileURLToPath(import.meta.url)), '../pakkaa-hybridi.mjs');

/**
 * Luo eristetyn testiympäristön, jossa on minimalistinen git-repo,
 * tilahakemisto sekä valevastaajat (mockit) vaiheen 1, 4 ja 5 työkaluille.
 */
function luoTestiYmparisto() {
  const juuriTmp = mkdtempSync(join(tmpdir(), 'vahvistus-portti-test-'));
  const juuriDir = join(juuriTmp, 'repo');
  const stateDir = join(juuriTmp, 'state');
  mkdirSync(juuriDir, { recursive: true });
  mkdirSync(stateDir, { recursive: true });

  // Alustetaan minimalistinen git-repo faktalouhintaa varten
  execFileSync('git', ['init', '-b', 'main'], { cwd: juuriDir });
  execFileSync('git', ['config', 'user.email', 'testi@example.com'], { cwd: juuriDir });
  execFileSync('git', ['config', 'user.name', 'Testi Kayttaja'], { cwd: juuriDir });

  writeFileSync(join(juuriDir, 'README.md'), '# Testirepo\n', 'utf8');
  execFileSync('git', ['add', 'README.md'], { cwd: juuriDir });
  execFileSync('git', ['commit', '-m', 'chore: alkusitoumus'], { cwd: juuriDir });

  // Työkalujen mock-hakemisto
  const toolsDir = join(juuriDir, 'claude', 'siirto', 'tools');
  mkdirSync(toolsDir, { recursive: true });

  const logPolku = join(juuriTmp, 'vaihe5-komennot.log');
  writeFileSync(logPolku, '', 'utf8');

  // Mock: pakkaa-alku.mjs
  // Tukee sekä vaiheen 1 alustustulostetta että vaiheen 4 --tarkista -kutsua
  const pakkaaAlkuKoodi = `#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
const logFile = process.env.TESTI_LOG;
if (logFile) {
  appendFileSync(logFile, 'pakkaa-alku: ' + args.join(' ') + '\\n');
}
if (args[0] === '--tarkista') {
  console.log('TAYTA: ok');
  console.log('PORTTI: ok');
  console.log('KATTO-MUISTIO: ok');
  console.log('HUKKA-LUKU: ok');
  console.log('KESKEN-LUKU: ok');
  process.exit(0);
}
const muistio = process.env.TESTI_MUISTIO_POLKU || 'pakkaus-muistio.md';
const autopackEnv = process.env.TESTI_PAKKAALKU_AUTOPACK;
console.log('MUISTIO: ' + muistio);
console.log('SKOOPPITARKISTUS: ' + (args[0] || 'testi'));
if (autopackEnv !== 'omit') {
  console.log('AUTOPACK: ' + (autopackEnv ?? 'false'));
}
console.log('SEURAAVA-HEAD: SEURAAVA PAKETTI: TESTI — aloitus: /pura test');
process.exit(0);
`;
  writeFileSync(join(toolsDir, 'pakkaa-alku.mjs'), pakkaaAlkuKoodi, { encoding: 'utf8', mode: 0o755 });

  // Mock: aja-siirtaja.sh
  const ajaSiirtajaKoodi = `#!/bin/bash
if [ -n "$TESTI_LOG" ]; then
  echo "aja-siirtaja: $*" >> "$TESTI_LOG"
fi
if [ -n "$TESTI_SIIRTAJA_EXIT" ]; then
  exit "$TESTI_SIIRTAJA_EXIT"
fi
echo "SIIRTAJA: ok"
exit 0
`;
  writeFileSync(join(toolsDir, 'aja-siirtaja.sh'), ajaSiirtajaKoodi, { encoding: 'utf8', mode: 0o755 });

  // Mock: pakkaa-loppu.mjs
  const pakkaaLoppuKoodi = `#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
const logFile = process.env.TESTI_LOG;
if (logFile) {
  appendFileSync(logFile, 'pakkaa-loppu: ' + args.join(' ') + '\\n');
}
if (process.env.TESTI_LOPPU_EXIT) {
  process.exit(parseInt(process.env.TESTI_LOPPU_EXIT, 10));
}
console.log('PAKKALOPPU: ok');
process.exit(0);
`;
  writeFileSync(join(toolsDir, 'pakkaa-loppu.mjs'), pakkaaLoppuKoodi, { encoding: 'utf8', mode: 0o755 });

  const muistioPolku = join(stateDir, 'pakkaus-muistio.md');

  return {
    juuriTmp,
    juuriDir,
    stateDir,
    toolsDir,
    logPolku,
    muistioPolku,
    lueLog: () => readFileSync(logPolku, 'utf8'),
    siivoa: () => rmSync(juuriTmp, { recursive: true, force: true }),
  };
}

/**
 * Ajaa pakkaa-hybridi.mjs aliprosessina määritetyllä testiympäristöllä.
 */
function ajaHybridi(ymparisto, args = [], lisaEnv = {}) {
  const env = {
    ...process.env,
    PAKKAA_JUURI: ymparisto.juuriDir,
    SIIRTO_STATE_DIR: ymparisto.stateDir,
    TESTI_LOG: ymparisto.logPolku,
    TESTI_MUISTIO_POLKU: ymparisto.muistioPolku,
    ...lisaEnv,
  };

  return spawnSync('node', [HYBRIDI_SKRIPTI, ...args], {
    cwd: ymparisto.juuriDir,
    env,
    encoding: 'utf8',
  });
}

describe('Scopes Sääntö 8: Vahvistusportti (pakkaa-hybridi.mjs)', () => {
  it('pysähtyy exit-koodilla 5, kun autopack on false eikä --vahvistettu -lippua ole annettu', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia']);

      assert.equal(res.status, 5, `Odotettiin exit-koodia 5, saatiin ${res.status}`);

      // Vaiheet 1–4 suoritettu
      assert.ok(res.stdout.includes('[1/5] Alustetaan pakkaus'), 'Vaiheen 1 tulee näkyä');
      assert.ok(res.stdout.includes('[2/5] Louhitaan faktat'), 'Vaiheen 2 tulee näkyä');
      assert.ok(res.stdout.includes('[3/5] Suoritetaan nopea harkinta'), 'Vaiheen 3 tulee näkyä');
      assert.ok(res.stdout.includes('[4/5] Kirjoitetaan muistio ja ajetaan porttitarkistus'), 'Vaiheen 4 tulee näkyä');
      assert.ok(res.stdout.includes('PORTTI: ok'), 'Porttitarkistuksen tulee olla hyväksytty');

      // Muistio luotu levylle
      assert.equal(existsSync(env.muistioPolku), true, 'Muistio on luotu levylle');
      const muistioTeksti = readFileSync(env.muistioPolku, 'utf8');
      assert.ok(muistioTeksti.length > 50, 'Muistiossa tulee olla sisältöä');
      assert.ok(muistioTeksti.includes('## Tehty tässä keskustelussa'), 'Muistion tulee sisältää vaaditut luvut');
    } finally {
      env.siivoa();
    }
  });

  it('tulostaa vaaditut protokollarivit: KYSY-VAHVISTUS ja UUSINTA --vahvistettu', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia']);

      assert.equal(res.status, 5);

      // Protokollarivien tarkistus
      assert.ok(
        res.stdout.includes('KYSY-VAHVISTUS: add + commit + push'),
        'Tulosteessa tulee olla KYSY-VAHVISTUS: add + commit + push'
      );
      assert.match(
        res.stdout,
        /^KYSY-VAHVISTUS:\s+add \+ commit \+ push/m,
        'KYSY-VAHVISTUS -rivin tulee alkaa rivin alusta'
      );

      assert.match(
        res.stdout,
        /^UUSINTA:\s+node\s+.*--vahvistettu/m,
        'UUSINTA-rivin tulee sisältää node, skripti ja --vahvistettu'
      );
    } finally {
      env.siivoa();
    }
  });

  it('EI suorita vaiheen 5 tilaa muuttavia komentoja (aja-siirtaja.sh, pakkaa-loppu.mjs) ilman lupaa', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia']);

      assert.equal(res.status, 5);

      // Tulosteessa ei saa näkyä vaiheen 5 aloitus- tai valmistumisriviä
      assert.equal(
        res.stdout.includes('[5/5] Päivitetään rekisterit'),
        false,
        'Vaiheen 5 työvaihetta ei saa aloittaa'
      );
      assert.equal(
        res.stdout.includes('Pakkaus valmis onnistuneesti'),
        false,
        'Valmistumisviestiä ei saa tulostaa'
      );

      // Työkalujen kutsulogi vahvistaa, että tilaa muuttavia komentoja ei kutsuttu
      const logi = env.lueLog();
      assert.equal(
        logi.includes('aja-siirtaja:'),
        false,
        'aja-siirtaja.sh -komentoa ei saa ajaa ilman vahvistusta'
      );
      assert.equal(
        logi.includes('pakkaa-loppu:'),
        false,
        'pakkaa-loppu.mjs -komentoa ei saa ajaa ilman vahvistusta'
      );
    } finally {
      env.siivoa();
    }
  });

  it('etenee vaiheeseen 5 ja suorittaa tilaa muuttavat komennot, kun --vahvistettu on annettu', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia', '--vahvistettu']);

      assert.equal(res.status, 0, `Odotettiin exit-koodia 0, saatiin ${res.status}`);

      // Kaikki vaiheet 1–5 suoritettu
      assert.ok(res.stdout.includes('[1/5] Alustetaan pakkaus'));
      assert.ok(res.stdout.includes('[2/5] Louhitaan faktat'));
      assert.ok(res.stdout.includes('[3/5] Suoritetaan nopea harkinta'));
      assert.ok(res.stdout.includes('[4/5] Kirjoitetaan muistio'));
      assert.ok(res.stdout.includes('PORTTI: ok'));
      assert.ok(
        res.stdout.includes('[5/5] Päivitetään rekisterit ja ajetaan git-vaihe...'),
        'Vaiheen 5 tulee käynnistyä'
      );
      assert.ok(
        res.stdout.includes('Pakkaus valmis onnistuneesti.'),
        'Pakkaus tulee ilmoittaa valmistuneeksi'
      );

      // KYSY-VAHVISTUS -protokollariviä ei tulosteta, kun lupa on jo annettu
      assert.equal(res.stdout.includes('KYSY-VAHVISTUS:'), false);

      // Varmistetaan, että vaiheen 5 työkalut suoritettiin oikein parametrein
      const logi = env.lueLog();
      assert.ok(
        logi.includes('aja-siirtaja: paketoi scopes testi'),
        'aja-siirtaja.sh tulee suorittaa "paketoi scopes testi" -parametreilla'
      );
      assert.ok(
        logi.includes('pakkaa-loppu: scopes testi'),
        'pakkaa-loppu.mjs tulee suorittaa skoopille'
      );
      assert.ok(
        logi.includes('--vahvistettu'),
        'pakkaa-loppu.mjs:lle tulee välittää --vahvistettu'
      );
    } finally {
      env.siivoa();
    }
  });

  it('etenee vaiheeseen 5 suoraan ilman --vahvistettu -lippua, jos autopack on true pakkaa-alku -tulosteessa', () => {
    const env = luoTestiYmparisto();
    try {
      // pakkaa-alku.mjs ilmoittaa AUTOPACK: true
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia'], {
        TESTI_PAKKAALKU_AUTOPACK: 'true',
      });

      assert.equal(res.status, 0, `Odotettiin exit-koodia 0 autopack-tilassa, saatiin ${res.status}`);
      assert.ok(res.stdout.includes('[5/5] Päivitetään rekisterit ja ajetaan git-vaihe...'));
      assert.ok(res.stdout.includes('Pakkaus valmis onnistuneesti.'));
      assert.equal(res.stdout.includes('KYSY-VAHVISTUS:'), false);

      const logi = env.lueLog();
      assert.ok(logi.includes('aja-siirtaja: paketoi scopes testi'));
      assert.ok(logi.includes('pakkaa-loppu:'));
      assert.ok(
        logi.includes('--vahvistettu'),
        'pakkaa-loppu.mjs saa --vahvistettu autopack-tilassa (onAutopack)'
      );
    } finally {
      env.siivoa();
    }
  });

  it('etenee vaiheeseen 5, kun autopack.txt sisältää "true" (kun pakkaa-alku ei määritä arvoa)', () => {
    const env = luoTestiYmparisto();
    try {
      // Asetetaan yhteinen autopack.txt: true
      writeFileSync(join(env.stateDir, 'autopack.txt'), 'true\n', 'utf8');

      // pakkaa-alku.mjs ei tulosta AUTOPACK-riviä
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia'], {
        TESTI_PAKKAALKU_AUTOPACK: 'omit',
      });

      assert.equal(res.status, 0, `Odotettiin exit-koodia 0, saatiin ${res.status}`);
      assert.ok(res.stdout.includes('[5/5] Päivitetään rekisterit ja ajetaan git-vaihe...'));
      assert.ok(res.stdout.includes('Pakkaus valmis onnistuneesti.'));
    } finally {
      env.siivoa();
    }
  });

  it('pysähtyy exit-koodilla 5, kun yhteinen autopack.txt sisältää "false"', () => {
    const env = luoTestiYmparisto();
    try {
      writeFileSync(join(env.stateDir, 'autopack.txt'), 'false\n', 'utf8');

      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia'], {
        TESTI_PAKKAALKU_AUTOPACK: 'omit',
      });

      assert.equal(res.status, 5);
      assert.match(res.stdout, /^KYSY-VAHVISTUS:\s+add \+ commit \+ push/m);
      assert.equal(env.lueLog().includes('aja-siirtaja:'), false);
    } finally {
      env.siivoa();
    }
  });

  it('tunnistaa istuntokohtaisen autopack.txt:n oikein (--session <id>)', () => {
    const env = luoTestiYmparisto();
    try {
      // Yhteinen autopack on false, mutta istuntokohtainen on true
      writeFileSync(join(env.stateDir, 'autopack.txt'), 'false\n', 'utf8');

      const istuntoDir = join(env.stateDir, 'istunnot', 'sessio-123');
      mkdirSync(istuntoDir, { recursive: true });
      writeFileSync(join(istuntoDir, 'autopack.txt'), 'true\n', 'utf8');

      const res = ajaHybridi(env, [
        'scopes testi',
        '--session', 'sessio-123',
        '--ilman-mallia',
      ], {
        TESTI_PAKKAALKU_AUTOPACK: 'omit',
      });

      assert.equal(res.status, 0, `Istuntokohtaisen autopackin tulisi sallia vaihe 5`);
      assert.ok(res.stdout.includes('[5/5] Päivitetään rekisterit ja ajetaan git-vaihe...'));
    } finally {
      env.siivoa();
    }
  });

  it('rekonstruoi UUSINTA-komennon tarkasti säilyttäen annetut argumentit (-m, --vaihda, --session)', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, [
        'scopes testi',
        '-m', 'tarkka viesti muutoksista',
        '--vaihda',
        '--session', 'istunto-xyz',
        '--ilman-mallia',
      ]);

      assert.equal(res.status, 5);

      const uusintaRivi = res.stdout
        .split('\n')
        .find((r) => r.startsWith('UUSINTA:'));

      assert.ok(uusintaRivi, 'UUSINTA-rivi löytyy tulosteesta');
      assert.ok(uusintaRivi.includes("'scopes testi'"), 'Skooppi säilyy parametrina');
      assert.ok(uusintaRivi.includes("'-m' 'tarkka viesti muutoksista'"), '-m -parametri säilyy lainattuna');
      assert.ok(uusintaRivi.includes("'--vaihda'"), '--vaihda -parametri säilyy');
      assert.ok(uusintaRivi.includes("'--session' 'istunto-xyz'"), '--session -parametri säilyy');
      assert.ok(uusintaRivi.endsWith('--vahvistettu'), 'UUSINTA-komento päättyy --vahvistettu -lippuun');
    } finally {
      env.siivoa();
    }
  });

  it('keskeyttää ja välittää virhekoodin, jos aja-siirtaja.sh epäonnistuu vaiheessa 5', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia', '--vahvistettu'], {
        TESTI_SIIRTAJA_EXIT: '12',
      });

      assert.equal(res.status, 12, 'Exit-koodin tulee olla siirtäjän palauttama 12');
      const logi = env.lueLog();
      assert.ok(logi.includes('aja-siirtaja:'), 'aja-siirtaja kutsuttiin');
      assert.equal(
        logi.includes('pakkaa-loppu:'),
        false,
        'pakkaa-loppu.mjs ei saa suorittaa siirtäjän epäonnistuttua'
      );
    } finally {
      env.siivoa();
    }
  });

  it('keskeyttää ja välittää virhekoodin, jos pakkaa-loppu.mjs epäonnistuu vaiheessa 5', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia', '--vahvistettu'], {
        TESTI_LOPPU_EXIT: '14',
      });

      assert.equal(res.status, 14, 'Exit-koodin tulee olla pakkaa-lopun palauttama 14');
      const logi = env.lueLog();
      assert.ok(logi.includes('aja-siirtaja:'), 'aja-siirtaja kutsuttiin');
      assert.ok(logi.includes('pakkaa-loppu:'), 'pakkaa-loppu kutsuttiin');
    } finally {
      env.siivoa();
    }
  });

  it('--kuiva -lippu ohittaa vaiheen 5 ja exit 5 -kyselyn ilman git-committia', () => {
    const env = luoTestiYmparisto();
    try {
      const res = ajaHybridi(env, ['scopes testi', '--ilman-mallia', '--kuiva']);

      assert.equal(res.status, 0, 'Kuiva-ajo palauttaa onnistuneen exit 0 -koodin');
      assert.ok(res.stdout.includes('KUIVA: Muistio luotu ja validoitu onnistuneesti'));
      assert.ok(res.stdout.includes('Ei tehdä git-committia eikä rekisteripäivitystä.'));
      assert.equal(res.stdout.includes('KYSY-VAHVISTUS:'), false);
      assert.equal(res.stdout.includes('[5/5]'), false);

      const logi = env.lueLog();
      assert.equal(logi.includes('aja-siirtaja:'), false);
      assert.equal(logi.includes('pakkaa-loppu:'), false);
    } finally {
      env.siivoa();
    }
  });
});
