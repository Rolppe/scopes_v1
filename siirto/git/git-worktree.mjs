// scopes/siirto/git/git-worktree.mjs
// Apurutiinit eristettyjen worktree-työtilojen luontiin, listaukseen ja siivoukseen.
// Noudattaa Työtapojen Sääntöä 2 (salaisuussuodatus) ja determinististä tulosmuotoa.

import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { ajaGit } from './git-komento.mjs';
import { ajaGitUusinnoin } from './git-synkka.mjs';

/**
 * Normalisoi hakemistopolun vertailua varten (ratkaisee mm. macOS:n /var -> /private/var -symlinkit).
 * @param {string} p
 * @returns {string}
 */
export function normalisoiPolku(p) {
  if (!p || typeof p !== 'string') return '';
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

/**
 * Jäsentää `git worktree list --porcelain` -tulosteen tietorakenteeksi.
 * @param {string} porcelainTeksti
 * @returns {Array<{
 *   polku: string,
 *   head: string,
 *   haara: string | null,
 *   haaraRef: string | null,
 *   irrotettu: boolean,
 *   bare: boolean,
 *   lukittu: boolean,
 *   lukitussyy: string | null,
 *   karsittava: boolean,
 *   karsintasyy: string | null,
 *   paatyotila: boolean
 * }>}
 */
export function jasennaWorktreePorcelain(porcelainTeksti) {
  if (!porcelainTeksti || typeof porcelainTeksti !== 'string') {
    return [];
  }

  // Lohkot on erotettu tyhjillä riveillä (\n\n)
  const lohkot = porcelainTeksti
    .split(/\n\s*\n/)
    .map((lohko) => lohko.trim())
    .filter((lohko) => lohko.length > 0);

  const tulokset = [];

  for (let i = 0; i < lohkot.length; i++) {
    const rivit = lohkot[i].split('\n').map((r) => r.trim()).filter((r) => r.length > 0);
    if (rivit.length === 0) continue;

    let polku = '';
    let head = '';
    let haaraRef = null;
    let haara = null;
    let irrotettu = false;
    let bare = false;
    let lukittu = false;
    let lukitussyy = null;
    let karsittava = false;
    let karsintasyy = null;

    for (const rivi of rivit) {
      if (rivi.startsWith('worktree ')) {
        polku = rivi.slice(9).trim();
      } else if (rivi.startsWith('HEAD ')) {
        head = rivi.slice(5).trim();
      } else if (rivi.startsWith('branch ')) {
        haaraRef = rivi.slice(7).trim();
        haara = haaraRef.replace(/^refs\/heads\//, '');
      } else if (rivi === 'detached') {
        irrotettu = true;
      } else if (rivi === 'bare') {
        bare = true;
      } else if (rivi.startsWith('locked')) {
        lukittu = true;
        const syy = rivi.slice(6).trim();
        lukitussyy = syy.length > 0 ? syy : null;
      } else if (rivi.startsWith('prunable')) {
        karsittava = true;
        const syy = rivi.slice(8).trim();
        karsintasyy = syy.length > 0 ? syy : null;
      }
    }

    if (polku) {
      tulokset.push({
        polku,
        head,
        haara,
        haaraRef,
        irrotettu,
        bare,
        lukittu,
        lukitussyy,
        karsittava,
        karsintasyy,
        paatyotila: i === 0
      });
    }
  }

  return tulokset;
}

/**
 * Listaa kaikki aktiiviset ja karsittavat git worktreet.
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   worktreet: Array<object>,
 *   virhe?: string
 * }>}
 */
export async function listaaWorktreet(cwd, valinnat = {}) {
  const tulos = await ajaGitUusinnoin(['worktree', 'list', '--porcelain'], { cwd, ...valinnat });
  if (!tulos.ok) {
    return {
      ok: false,
      koodi: tulos.koodi,
      worktreet: [],
      virhe: tulos.stderr || 'Worktree-listauksen lukeminen epäonnistui'
    };
  }

  const worktreet = jasennaWorktreePorcelain(tulos.stdout);
  return {
    ok: true,
    koodi: 0,
    worktreet
  };
}

/**
 * Etsii tietyn worktreen polun tai haaran nimen perusteella.
 * @param {string} tunniste Polku tai haaran nimi
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   loytyi: boolean,
 *   worktree: object | null,
 *   virhe?: string
 * }>}
 */
export async function etsiWorktree(tunniste, cwd, valinnat = {}) {
  if (!tunniste) {
    return { ok: false, loytyi: false, worktree: null, virhe: 'Tunniste puuttuu' };
  }

  const listaus = await listaaWorktreet(cwd, valinnat);
  if (!listaus.ok) {
    return { ok: false, loytyi: false, worktree: null, virhe: listaus.virhe };
  }

  const juuri = cwd || process.cwd();
  const etsittyAbsPolku = path.resolve(juuri, tunniste);
  const etsittyNorm = normalisoiPolku(etsittyAbsPolku);

  const loydetty = listaus.worktreet.find((wt) => {
    return (
      wt.polku === etsittyAbsPolku ||
      wt.polku === tunniste ||
      normalisoiPolku(wt.polku) === etsittyNorm ||
      wt.haara === tunniste ||
      wt.haaraRef === tunniste
    );
  });

  return {
    ok: true,
    loytyi: Boolean(loydetty),
    worktree: loydetty || null
  };
}

/**
 * Luo uuden Git worktreen annettuun polkuun.
 * @param {string} polku Kohdehakemisto worktreelle
 * @param {object} [valinnat]
 * @param {string} [valinnat.haara] Olemassa oleva haara tai viite
 * @param {string} [valinnat.uusiHaara] Luo uusi haara (-b <nimi>)
 * @param {string} [valinnat.uusiHaaraPakota] Luo/korvaa haara (-B <nimi>)
 * @param {string} [valinnat.pohja] Pohjakommit/viite (esim. HEAD, origin/main)
 * @param {boolean} [valinnat.irrotettu] Luodaan detached HEAD -tilassa (--detach)
 * @param {boolean} [valinnat.pakota] Pakotettu lisäys (--force)
 * @param {boolean | string} [valinnat.lukitus] Lukitse luotu worktree heti (--lock [--reason <syy>])
 * @param {string} [valinnat.cwd] Repon juurihakemisto
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   polku: string,
 *   stdout: string,
 *   stderr: string,
 *   virhe?: string
 * }>}
 */
export async function luoWorktree(polku, valinnat = {}) {
  if (!polku) {
    return {
      ok: false,
      koodi: 1,
      polku: '',
      stdout: '',
      stderr: 'Polku puuttuu',
      virhe: 'Polku puuttuu'
    };
  }

  const juuri = valinnat.cwd || process.cwd();
  const absPolku = path.resolve(juuri, polku);

  const args = ['worktree', 'add'];

  if (valinnat.pakota) {
    args.push('--force');
  }

  const onUusiHaara = Boolean(valinnat.uusiHaara || valinnat.uusiHaaraPakota);
  if (!onUusiHaara && (valinnat.irrotettu || valinnat.detach)) {
    args.push('--detach');
  }

  if (valinnat.lukitus) {
    args.push('--lock');
    if (typeof valinnat.lukitus === 'string' && valinnat.lukitus.trim().length > 0) {
      args.push('--reason', valinnat.lukitus.trim());
    }
  }

  if (valinnat.uusiHaaraPakota) {
    args.push('-B', valinnat.uusiHaaraPakota);
  } else if (valinnat.uusiHaara) {
    args.push('-b', valinnat.uusiHaara);
  }

  args.push(absPolku);

  if (valinnat.haara && !valinnat.uusiHaara && !valinnat.uusiHaaraPakota) {
    args.push(valinnat.haara);
  } else if (valinnat.pohja) {
    args.push(valinnat.pohja);
  }

  const tulos = await ajaGitUusinnoin(args, { cwd: juuri, ...valinnat });

  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    polku: absPolku,
    stdout: tulos.stdout,
    stderr: tulos.stderr,
    virhe: tulos.ok ? undefined : (tulos.stderr || 'Worktreen luonti epäonnistui')
  };
}

/**
 * Poistaa Git worktreen ja valinnaisesti siihen liittyvän paikallisen haaran.
 * @param {string} polku Poistettavan worktreen polku
 * @param {object} [valinnat]
 * @param {boolean} [valinnat.pakota] Pakotettu poisto (--force)
 * @param {boolean} [valinnat.poistaHaara] Poistetaanko työtilaan kytketty haara samalla
 * @param {string} [valinnat.cwd] Repon juurihakemisto
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   polku: string,
 *   poistettuHaara: string | null,
 *   stdout: string,
 *   stderr: string,
 *   virhe?: string
 * }>}
 */
export async function poistaWorktree(polku, valinnat = {}) {
  if (!polku) {
    return {
      ok: false,
      koodi: 1,
      polku: '',
      poistettuHaara: null,
      stdout: '',
      stderr: 'Polku puuttuu',
      virhe: 'Polku puuttuu'
    };
  }

  const juuri = valinnat.cwd || process.cwd();
  const absPolku = path.resolve(juuri, polku);

  let kytkettyHaara = null;
  if (valinnat.poistaHaara) {
    const etsinta = await etsiWorktree(absPolku, juuri, valinnat);
    if (etsinta.ok && etsinta.loytyi && etsinta.worktree && !etsinta.worktree.paatyotila) {
      kytkettyHaara = etsinta.worktree.haara;
    }
  }

  const args = ['worktree', 'remove'];
  if (valinnat.pakota || valinnat.force) {
    args.push('--force');
  }
  args.push(absPolku);

  const tulos = await ajaGitUusinnoin(args, { cwd: juuri, ...valinnat });

  let poistettuHaara = null;
  if (tulos.ok && valinnat.poistaHaara && kytkettyHaara) {
    const haaraPoisto = await ajaGit(['branch', '-D', kytkettyHaara], { cwd: juuri });
    if (haaraPoisto.ok) {
      poistettuHaara = kytkettyHaara;
    }
  }

  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    polku: absPolku,
    poistettuHaara,
    stdout: tulos.stdout,
    stderr: tulos.stderr,
    virhe: tulos.ok ? undefined : (tulos.stderr || 'Worktreen poisto epäonnistui')
  };
}

/**
 * Lukitsee worktreen tahattoman karsinnan tai poiston estämiseksi.
 * @param {string} polku
 * @param {string} [syy]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   polku: string,
 *   syy: string | null,
 *   virhe?: string
 * }>}
 */
export async function lukitseWorktree(polku, syy = '', valinnat = {}) {
  if (!polku) {
    return { ok: false, koodi: 1, polku: '', syy: null, virhe: 'Polku puuttuu' };
  }

  const juuri = valinnat.cwd || process.cwd();
  const absPolku = path.resolve(juuri, polku);

  const args = ['worktree', 'lock'];
  if (syy && typeof syy === 'string' && syy.trim().length > 0) {
    args.push('--reason', syy.trim());
  }
  args.push(absPolku);

  const tulos = await ajaGitUusinnoin(args, { cwd: juuri, ...valinnat });

  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    polku: absPolku,
    syy: syy ? syy.trim() : null,
    virhe: tulos.ok ? undefined : (tulos.stderr || 'Worktreen lukitus epäonnistui')
  };
}

/**
 * Avaa lukitun worktreen.
 * @param {string} polku
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   polku: string,
 *   virhe?: string
 * }>}
 */
export async function avaaWorktree(polku, valinnat = {}) {
  if (!polku) {
    return { ok: false, koodi: 1, polku: '', virhe: 'Polku puuttuu' };
  }

  const juuri = valinnat.cwd || process.cwd();
  const absPolku = path.resolve(juuri, polku);

  const tulos = await ajaGitUusinnoin(['worktree', 'unlock', absPolku], { cwd: juuri, ...valinnat });

  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    polku: absPolku,
    virhe: tulos.ok ? undefined : (tulos.stderr || 'Worktreen lukituksen avaus epäonnistui')
  };
}

/**
 * Siirtää worktreen uuteen hakemistopolkuun.
 * @param {string} vanhaPolku
 * @param {string} uusiPolku
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   vanhaPolku: string,
 *   uusiPolku: string,
 *   virhe?: string
 * }>}
 */
export async function siirraWorktree(vanhaPolku, uusiPolku, valinnat = {}) {
  if (!vanhaPolku || !uusiPolku) {
    return { ok: false, koodi: 1, vanhaPolku, uusiPolku, virhe: 'Polku puuttuu' };
  }

  const juuri = valinnat.cwd || process.cwd();
  const absVanha = path.resolve(juuri, vanhaPolku);
  const absUusi = path.resolve(juuri, uusiPolku);

  const tulos = await ajaGitUusinnoin(['worktree', 'move', absVanha, absUusi], { cwd: juuri, ...valinnat });

  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    vanhaPolku: absVanha,
    uusiPolku: absUusi,
    virhe: tulos.ok ? undefined : (tulos.stderr || 'Worktreen siirto epäonnistui')
  };
}

/**
 * Karsii vanhentuneet tai poistuneet worktree-merkinnät Gitin sisäisestä metadatasta.
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @param {boolean} [valinnat.kuiva] Aja kuivana (--dry-run)
 * @param {string} [valinnat.vanhenemisaika] Vanhenemisaika (--expire <aika>)
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi: number,
 *   stdout: string,
 *   stderr: string,
 *   virhe?: string
 * }>}
 */
export async function karsiWorktreet(cwd, valinnat = {}) {
  const args = ['worktree', 'prune'];
  if (valinnat.kuiva || valinnat.dryRun) {
    args.push('--dry-run');
  }
  if (valinnat.vanhenemisaika) {
    args.push('--expire', valinnat.vanhenemisaika);
  }

  const tulos = await ajaGitUusinnoin(args, { cwd, ...valinnat });

  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    stdout: tulos.stdout,
    stderr: tulos.stderr,
    virhe: tulos.ok ? undefined : (tulos.stderr || 'Worktree-karsinta epäonnistui')
  };
}

/**
 * Luo puhtaan ja eristetyn worktree-työtilan (esim. rinnakkaisajoon, testeille tai agenteille).
 * Palauttaa automaattisen `siivoa()`-funktion, jolla työtila vapautetaan siististi.
 * @param {object} [valinnat]
 * @param {string} [valinnat.etuliite] Hakemiston etuliite (oletus: 'scopes-wt-')
 * @param {string} [valinnat.kantaHakemisto] Pääkansio (oletus: os.tmpdir())
 * @param {string} [valinnat.pohja] Pohjakommit (oletus: 'HEAD')
 * @param {boolean} [valinnat.irrotettu] Luodaan detached HEAD -tilassa (oletus: true)
 * @param {string} [valinnat.uusiHaara] Luodaan uusi nimetty haara
 * @param {boolean | string} [valinnat.lukitus] Lukitaanko työtila heti
 * @param {string} [valinnat.cwd] Repon juuri
 * @returns {Promise<{
 *   ok: boolean,
 *   koodi?: number,
 *   polku: string,
 *   haara: string | null,
 *   siivoa: () => Promise<{ ok: boolean, virhe?: string }>,
 *   virhe?: string
 * }>}
 */
export async function luoEristettyWorktree(valinnat = {}) {
  const {
    etuliite = 'scopes-wt-',
    kantaHakemisto = os.tmpdir(),
    pohja = 'HEAD',
    uusiHaara,
    irrotettu = !uusiHaara,
    lukitus = false,
    cwd = process.cwd()
  } = valinnat;

  let kohdeHakemisto;
  try {
    kohdeHakemisto = fs.mkdtempSync(path.join(kantaHakemisto, etuliite));
  } catch (virhe) {
    return {
      ok: false,
      koodi: 1,
      polku: '',
      haara: null,
      siivoa: async () => ({ ok: true }),
      virhe: `Tilapäishakemiston luonti epäonnistui: ${virhe.message}`
    };
  }

  // Git worktree add vaatii että kohdehakemistoa ei ole tai se on täysin tyhjä.
  // mkdtempSync loi tyhjän hakemiston.
  const luontiTulos = await luoWorktree(kohdeHakemisto, {
    pohja,
    irrotettu,
    uusiHaara,
    lukitus,
    cwd
  });

  if (!luontiTulos.ok) {
    try {
      if (fs.existsSync(kohdeHakemisto)) {
        fs.rmSync(kohdeHakemisto, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
    return {
      ok: false,
      koodi: luontiTulos.koodi,
      polku: kohdeHakemisto,
      haara: null,
      siivoa: async () => ({ ok: true }),
      virhe: luontiTulos.virhe
    };
  }

  const siivoa = async () => {
    if (lukitus) {
      await avaaWorktree(kohdeHakemisto, { cwd });
    }
    const poisto = await poistaWorktree(kohdeHakemisto, {
      pakota: true,
      poistaHaara: Boolean(uusiHaara),
      cwd
    });

    try {
      if (fs.existsSync(kohdeHakemisto)) {
        fs.rmSync(kohdeHakemisto, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }

    return {
      ok: poisto.ok,
      virhe: poisto.virhe
    };
  };

  return {
    ok: true,
    koodi: 0,
    polku: kohdeHakemisto,
    haara: uusiHaara || null,
    siivoa
  };
}
