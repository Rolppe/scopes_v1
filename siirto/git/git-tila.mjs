// scopes/siirto/git/git-tila.mjs
// Git-työpuun ja haarojen tilan normalisoitu lukija Scopes-siirroille.

import { ajaGit } from './git-komento.mjs';

/**
 * Lukee aktiivisen haaran nimen ja tiedon siitä, onko HEAD irrotettu (detached).
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{ haara: string, irrotettu: boolean }>}
 */
export async function lueHaara(cwd, valinnat = {}) {
  const refTulos = await ajaGit(['symbolic-ref', '--short', '-q', 'HEAD'], { cwd, ...valinnat });
  if (refTulos.ok && refTulos.stdout) {
    return { haara: refTulos.stdout.trim(), irrotettu: false };
  }

  // HEAD on irrotettu (detached), haetaan lyhyt commit-hash
  const revTulos = await ajaGit(['rev-parse', '--short', 'HEAD'], { cwd, ...valinnat });
  return {
    haara: revTulos.stdout ? revTulos.stdout.trim() : 'tuntematon',
    irrotettu: true
  };
}

/**
 * Lukee haaran upstream/tracking-etähaaran nimen.
 * @param {string} haara
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<string | null>}
 */
export async function lueTracking(haara, cwd, valinnat = {}) {
  if (!haara || haara === 'tuntematon') return null;
  const tulos = await ajaGit(['rev-parse', '--abbrev-ref', `${haara}@{upstream}`], { cwd, ...valinnat });
  if (tulos.ok && tulos.stdout) {
    return tulos.stdout.trim();
  }
  return null;
}

/**
 * Laskee montako committia paikallinen haara on edellä ja jäljessä tracking-haaraan nähden.
 * @param {string} haara
 * @param {string} trackingHaara
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{ edella: number, jaljessa: number }>}
 */
export async function lueSynkkaEro(haara, trackingHaara, cwd, valinnat = {}) {
  if (!haara || !trackingHaara) return { edella: 0, jaljessa: 0 };
  const tulos = await ajaGit(['rev-list', '--left-right', '--count', `${haara}...${trackingHaara}`], { cwd, ...valinnat });
  if (!tulos.ok || !tulos.stdout) {
    return { edella: 0, jaljessa: 0 };
  }

  const osat = tulos.stdout.trim().split(/\s+/);
  const edella = parseInt(osat[0], 10) || 0;
  const jaljessa = parseInt(osat[1], 10) || 0;
  return { edella, jaljessa };
}

/**
 * Jäsentää `git status --porcelain` -tulosteen tiedostomuutoksiksi.
 * @param {string} porcelainTeksti
 * @returns {Array<{ tila: string, polku: string }>}
 */
export function jasennaPorcelain(porcelainTeksti) {
  if (!porcelainTeksti) return [];
  return porcelainTeksti
    .split('\n')
    .filter((rivi) => rivi.trim().length > 0)
    .map((rivi) => {
      const tila = rivi.slice(0, 2);
      const polku = rivi.slice(3).trim();
      return { tila, polku };
    });
}

/**
 * Lukee työpuun muutokset.
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{ likainen: boolean, tiedostot: Array<{ tila: string, polku: string }> }>}
 */
export async function lueMuutokset(cwd, valinnat = {}) {
  const tulos = await ajaGit(['status', '--porcelain'], { cwd, ...valinnat });
  const tiedostot = jasennaPorcelain(tulos.stdout);
  return {
    likainen: tiedostot.length > 0,
    tiedostot
  };
}

/**
 * Kokoaa täydellisen normaalin tilannekuvan Git-työtilasta.
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   haara: string,
 *   irrotettu: boolean,
 *   tracking: string | null,
 *   edella: number,
 *   jaljessa: number,
 *   likainen: boolean,
 *   tiedostot: Array<{ tila: string, polku: string }>
 * }>}
 */
export async function lueGitTila(cwd, valinnat = {}) {
  const { haara, irrotettu } = await lueHaara(cwd, valinnat);
  const tracking = irrotettu ? null : await lueTracking(haara, cwd, valinnat);
  const { edella, jaljessa } = tracking ? await lueSynkkaEro(haara, tracking, cwd, valinnat) : { edella: 0, jaljessa: 0 };
  const { likainen, tiedostot } = await lueMuutokset(cwd, valinnat);

  return {
    ok: true,
    haara,
    irrotettu,
    tracking,
    edella,
    jaljessa,
    likainen,
    tiedostot
  };
}
