// scopes/siirto/git/git-komento.mjs
// Matalan tason luotettava Git-komentoajuri Scopes-siirroille.
// Noudattaa Työtapojen Sääntöä 2: tokenit, bearerit, API-avaimet ja salasanat suodatetaan oletuksena.

import { spawn } from 'node:child_process';

const SALAISUUS_REGEX = /token|bearer|api|key|password|auth/i;

/**
 * Suodattaa tekstiriveiltä mahdolliset salaisuudet (Sääntö 2).
 * Poistaa rivit, jotka täsmäävät kiellettyihin avainsanoihin.
 * @param {string} teksti
 * @returns {string}
 */
export function suodataTuloste(teksti) {
  if (!teksti) return '';
  return teksti
    .split('\n')
    .filter((rivi) => !SALAISUUS_REGEX.test(rivi))
    .join('\n');
}

/**
 * Ajaa Git-komennon annetuilla argumenteilla turvallisesti ja aikakatkaisun kera.
 * @param {string[]} argumentit
 * @param {object} [valinnat]
 * @param {string} [valinnat.cwd] Työhakemisto (oletus: process.cwd())
 * @param {number} [valinnat.aikakatkaisuMs] Aikakatkaisu millisekunteina (oletus: 15000)
 * @param {Record<string, string>} [valinnat.ymparisto] Lisäympäristömuuttujat
 * @param {boolean} [valinnat.suodata] Suodatetaanko salaisuudet tulosteesta (oletus: true)
 * @param {Function} [valinnat.spawnFn] Injektoitava spawn-funktio testejä varten
 * @returns {Promise<{ ok: boolean, koodi: number, stdout: string, stderr: string, kestoMs: number, aikakatkaisu: boolean }>}
 */
export function ajaGit(argumentit, valinnat = {}) {
  const {
    cwd = process.cwd(),
    aikakatkaisuMs = 15000,
    ymparisto = {},
    suodata = true,
    spawnFn = spawn
  } = valinnat;

  const aloitusAika = Date.now();
  const env = {
    ...process.env,
    GIT_OPTIONAL_LOCKS: '0',
    ...ymparisto
  };

  return new Promise((resolve) => {
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let aikakatkaistu = false;
    let kasitelty = false;

    let prosessi;
    try {
      prosessi = spawnFn('git', argumentit, {
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (virhe) {
      return resolve({
        ok: false,
        koodi: 1,
        stdout: '',
        stderr: virhe?.message || String(virhe),
        kestoMs: Date.now() - aloitusAika,
        aikakatkaisu: false
      });
    }

    let ajastin = null;
    if (aikakatkaisuMs > 0) {
      ajastin = setTimeout(() => {
        aikakatkaistu = true;
        try {
          prosessi.kill('SIGTERM');
        } catch {
          // ignore
        }
      }, aikakatkaisuMs);
    }

    if (prosessi.stdout) {
      prosessi.stdout.on('data', (pala) => {
        stdoutBuffer += pala.toString('utf8');
      });
    }

    if (prosessi.stderr) {
      prosessi.stderr.on('data', (pala) => {
        stderrBuffer += pala.toString('utf8');
      });
    }

    const valmis = (koodi, signaali) => {
      if (kasitelty) return;
      kasitelty = true;
      if (ajastin) clearTimeout(ajastin);

      const kestoMs = Date.now() - aloitusAika;
      const lopullinenStdout = suodata ? suodataTuloste(stdoutBuffer) : stdoutBuffer;
      const lopullinenStderr = suodata ? suodataTuloste(stderrBuffer) : stderrBuffer;
      const onnistui = koodi === 0 && !aikakatkaistu;

      resolve({
        ok: onnistui,
        koodi: aikakatkaistu ? 124 : (koodi ?? (signaali ? 128 : 1)),
        stdout: lopullinenStdout.trimEnd(),
        stderr: lopullinenStderr.trimEnd(),
        kestoMs,
        aikakatkaisu: aikakatkaistu
      });
    };

    prosessi.on('close', (koodi, signaali) => valmis(koodi, signaali));
    prosessi.on('error', (virhe) => {
      stderrBuffer += `\n${virhe?.message || virhe}`;
      valmis(1, null);
    });
  });
}
