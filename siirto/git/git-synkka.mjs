// scopes/siirto/git/git-synkka.mjs
// Git-synkronointi ja laitteiden välisen tilan varmistus Scopes-siirroille.
// Noudattaa Työtapojen Sääntöä 2 (salaisuussuodatus) ja determinististä tulosmuotoa.

import { ajaGit } from './git-komento.mjs';
import { lueHaara, lueMuutokset, lueGitTila, lueSynkkaEro } from './git-tila.mjs';

const LUKKOVIRHE_REGEX = /index\.lock|\.lock': File exists|cannot lock ref|could not write index|would be overwritten by merge/i;

/**
 * Tarkistaa, johtuuko git-virhe väliaikaisesta lukkotörmäyksestä tai samanaikaisuudesta.
 * @param {string} virheTeksti
 * @returns {boolean}
 */
export function onkoLukkovirhe(virheTeksti) {
  if (!virheTeksti) return false;
  return LUKKOVIRHE_REGEX.test(virheTeksti);
}

/**
 * Apufunktio viiveen odottamiseen.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function odota(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ajaa Git-komennon ja yrittää uudelleen, jos virhe johtuu tilapäisestä lukosta (R3).
 * @param {string[]} argumentit
 * @param {object} [valinnat]
 * @param {number} [valinnat.uusinnat] Uusintayritysten määrä (oletus: 3)
 * @param {number} [valinnat.viiveMs] Viive yritysten välillä (oletus: 500 ms)
 * @returns {Promise<{ ok: boolean, koodi: number, stdout: string, stderr: string, kestoMs: number, aikakatkaisu: boolean }>}
 */
export async function ajaGitUusinnoin(argumentit, valinnat = {}) {
  const { uusinnat = 3, viiveMs = 500, ...gitValinnat } = valinnat;
  let yritykset = 0;

  while (true) {
    const tulos = await ajaGit(argumentit, gitValinnat);
    if (tulos.ok) return tulos;

    yritykset += 1;
    const yhdistettyVirhe = `${tulos.stderr}\n${tulos.stdout}`;
    if (yritykset <= uusinnat && onkoLukkovirhe(yhdistettyVirhe)) {
      if (viiveMs > 0) {
        await odota(viiveMs);
      }
      continue;
    }

    return tulos;
  }
}

/**
 * Tarkistaa etävaraston (remote) olemassaolon ja tavoitettavuuden.
 * @param {string} [remote='origin']
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{ ok: boolean, tila: 'kunnossa' | 'ei_remotea' | 'tavoittamaton', remote: string, url?: string, virhe?: string }>}
 */
export async function tarkistaRemote(remote = 'origin', cwd, valinnat = {}) {
  const urlTulos = await ajaGit(['remote', 'get-url', remote], { cwd, ...valinnat });
  if (!urlTulos.ok) {
    return {
      ok: false,
      tila: 'ei_remotea',
      remote,
      virhe: `Etävarastoa '${remote}' ei ole määritelty.`
    };
  }

  const url = urlTulos.stdout.trim();
  const yhteysTulos = await ajaGit(['ls-remote', '--exit-code', '-h', remote], {
    cwd,
    aikakatkaisuMs: 8000,
    ...valinnat
  });

  if (!yhteysTulos.ok) {
    return {
      ok: false,
      tila: 'tavoittamaton',
      remote,
      url,
      virhe: yhteysTulos.stderr || 'Etävarastoon ei saatu yhteyttä (aikakatkaisu tai verkkovirhe).'
    };
  }

  return {
    ok: true,
    tila: 'kunnossa',
    remote,
    url
  };
}

/**
 * Hakee etähaaran tai etävaraston muutokset turvallisesti (fetch).
 * @param {string} [remote='origin']
 * @param {string | null} [haara=null]
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{ ok: boolean, virhe?: string, koodi: number }>}
 */
export async function haeRemote(remote = 'origin', haara = null, cwd, valinnat = {}) {
  const args = ['fetch', remote];
  if (haara) {
    args.push(haara);
  }
  const tulos = await ajaGitUusinnoin(args, { cwd, ...valinnat });
  return {
    ok: tulos.ok,
    koodi: tulos.koodi,
    virhe: tulos.ok ? undefined : (tulos.stderr || tulos.stdout)
  };
}

/**
 * Vertailee kahta haaraa / viitettä toisiinsa (edellä, jäljessä, haarautunut, yhteinen kanta).
 * @param {string} paikallinenRef
 * @param {string} etaRef
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   tila: 'ajan_tasalla' | 'edella' | 'jaljessa' | 'haarautunut' | 'tuntematon',
 *   edella: number,
 *   jaljessa: number,
 *   mergeBase: string | null,
 *   uusiHaara?: boolean,
 *   virhe?: string
 * }>}
 */
export async function vertaaHaarat(paikallinenRef, etaRef, cwd, valinnat = {}) {
  if (!paikallinenRef || !etaRef) {
    return {
      ok: false,
      tila: 'tuntematon',
      edella: 0,
      jaljessa: 0,
      mergeBase: null,
      virhe: 'Molempien viitteiden (paikallinen ja etä) on oltava määritelty'
    };
  }

  // Tarkistetaan ensin, onko etaRef olemassa
  const revTulos = await ajaGit(['rev-parse', '--verify', etaRef], { cwd, ...valinnat });
  if (!revTulos.ok) {
    // etaRef puuttuu (esim. uusi paikallinen haara, jota ei ole koskaan puskettu)
    const countTulos = await ajaGit(['rev-list', '--count', paikallinenRef], { cwd, ...valinnat });
    const edella = countTulos.ok ? (parseInt(countTulos.stdout.trim(), 10) || 0) : 0;
    return {
      ok: true,
      tila: 'edella',
      edella,
      jaljessa: 0,
      mergeBase: null,
      uusiHaara: true
    };
  }

  const { edella, jaljessa } = await lueSynkkaEro(paikallinenRef, etaRef, cwd, valinnat);

  let mergeBase = null;
  const baseTulos = await ajaGit(['merge-base', paikallinenRef, etaRef], { cwd, ...valinnat });
  if (baseTulos.ok && baseTulos.stdout) {
    mergeBase = baseTulos.stdout.trim();
  }

  let tila = 'ajan_tasalla';
  if (edella > 0 && jaljessa === 0) {
    tila = 'edella';
  } else if (edella === 0 && jaljessa > 0) {
    tila = 'jaljessa';
  } else if (edella > 0 && jaljessa > 0) {
    tila = 'haarautunut';
  }

  return {
    ok: true,
    tila,
    edella,
    jaljessa,
    mergeBase
  };
}

/**
 * Suorittaa turvallisen fast-forward -synkronoinnin (pull ilman rebasea tai merge-committeja).
 * Jos työpuu on likainen tai haarat ovat haarautuneet, kieltäytyy muuttamasta tilaa.
 * @param {string | null} [haara=null]
 * @param {string} [remote='origin']
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   tila: 'ajan_tasalla' | 'paivitetty' | 'edella' | 'likainen_puu' | 'haarautunut' | 'irrotettu_head' | 'virhe',
 *   muuttui: boolean,
 *   edella?: number,
 *   jaljessa?: number,
 *   tiedostot?: Array<{ tila: string, polku: string }>,
 *   virhe?: string
 * }>}
 */
export async function synkkaaFastForward(haara = null, remote = 'origin', cwd, valinnat = {}) {
  const { haara: aktiivinenHaara, irrotettu } = await lueHaara(cwd, valinnat);
  const nykyinenHaara = haara || aktiivinenHaara;

  if (irrotettu) {
    return {
      ok: false,
      tila: 'irrotettu_head',
      muuttui: false,
      virhe: `HEAD on irrotettu (${nykyinenHaara}), fast-forwardia ei voida suorittaa.`
    };
  }

  const muutokset = await lueMuutokset(cwd, valinnat);
  if (muutokset.likainen) {
    return {
      ok: false,
      tila: 'likainen_puu',
      muuttui: false,
      tiedostot: muutokset.tiedostot,
      virhe: `Työpuussa on ${muutokset.tiedostot.length} committoimatonta muutosta; synkronointia ei suoritettu.`
    };
  }

  const fetchTulos = await haeRemote(remote, nykyinenHaara, cwd, valinnat);
  if (!fetchTulos.ok) {
    return {
      ok: false,
      tila: 'virhe',
      muuttui: false,
      virhe: `Etävaraston haku epäonnistui: ${fetchTulos.virhe}`
    };
  }

  const vertailu = await vertaaHaarat(nykyinenHaara, `${remote}/${nykyinenHaara}`, cwd, valinnat);
  if (!vertailu.ok) {
    return {
      ok: false,
      tila: 'virhe',
      muuttui: false,
      virhe: vertailu.virhe
    };
  }

  if (vertailu.tila === 'ajan_tasalla') {
    return {
      ok: true,
      tila: 'ajan_tasalla',
      muuttui: false,
      edella: 0,
      jaljessa: 0
    };
  }

  if (vertailu.tila === 'edella') {
    return {
      ok: true,
      tila: 'edella',
      muuttui: false,
      edella: vertailu.edella,
      jaljessa: 0
    };
  }

  if (vertailu.tila === 'haarautunut') {
    return {
      ok: false,
      tila: 'haarautunut',
      muuttui: false,
      edella: vertailu.edella,
      jaljessa: vertailu.jaljessa,
      virhe: `Haarat ovat haarautuneet (${vertailu.edella} paikallista / ${vertailu.jaljessa} etäcommitia). Vaatii ihmisen toimenpiteen.`
    };
  }

  // vertailu.tila === 'jaljessa' -> suoritetaan fast-forward merge
  const mergeTulos = await ajaGitUusinnoin(['merge', '-q', '--ff-only', `${remote}/${nykyinenHaara}`], {
    cwd,
    ...valinnat
  });

  if (!mergeTulos.ok) {
    return {
      ok: false,
      tila: 'virhe',
      muuttui: false,
      virhe: mergeTulos.stderr || 'Fast-forward merge epäonnistui.'
    };
  }

  return {
    ok: true,
    tila: 'paivitetty',
    muuttui: true,
    edella: 0,
    jaljessa: vertailu.jaljessa
  };
}

/**
 * Puskaa paikalliset commitit etävarastoon turvallisesti.
 * Varmistaa ensin, ettei etähaara ole edellä.
 * @param {string | null} [haara=null]
 * @param {string} [remote='origin']
 * @param {string} [cwd]
 * @param {object} [valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   tila: 'pushattu' | 'ajan_tasalla' | 'jaljessa' | 'haarautunut' | 'virhe',
 *   pushattu: number,
 *   virhe?: string
 * }>}
 */
export async function synkkaaPush(haara = null, remote = 'origin', cwd, valinnat = {}) {
  const { haara: aktiivinenHaara } = await lueHaara(cwd, valinnat);
  const nykyinenHaara = haara || aktiivinenHaara;
  const vertailu = await vertaaHaarat(nykyinenHaara, `${remote}/${nykyinenHaara}`, cwd, valinnat);

  if (vertailu.ok) {
    if (vertailu.tila === 'ajan_tasalla') {
      return {
        ok: true,
        tila: 'ajan_tasalla',
        pushattu: 0
      };
    }
    if (vertailu.tila === 'jaljessa' || vertailu.tila === 'haarautunut') {
      return {
        ok: false,
        tila: vertailu.tila,
        pushattu: 0,
        virhe: `Ei voida puskea: etähaara on ${vertailu.jaljessa} commitia edellä. Synkronoi ensin.`
      };
    }
  }

  const pushTulos = await ajaGitUusinnoin(['push', remote, nykyinenHaara], { cwd, ...valinnat });
  if (!pushTulos.ok) {
    return {
      ok: false,
      tila: 'virhe',
      pushattu: 0,
      virhe: pushTulos.stderr || 'Push epäonnistui.'
    };
  }

  return {
    ok: true,
    tila: 'pushattu',
    pushattu: vertailu.edella > 0 ? vertailu.edella : 1
  };
}

/**
 * Kokoaa kattavan synkkatilanteen (tilanlukija + etävertailu + tekstiraportti).
 * @param {object} [parametrit]
 * @param {string} [parametrit.cwd]
 * @param {string} [parametrit.remote='origin']
 * @param {boolean} [parametrit.hae=false] Haetaanko etämuutokset ensin (fetch)
 * @param {object} [parametrit.valinnat]
 * @returns {Promise<{
 *   ok: boolean,
 *   tila: 'ajan_tasalla' | 'edella' | 'jaljessa' | 'haarautunut' | 'ei_remotea' | 'tavoittamaton' | 'irrotettu',
 *   haara: string,
 *   tracking: string | null,
 *   edella: number,
 *   jaljessa: number,
 *   likainen: boolean,
 *   muutoksetLkm: number,
 *   raportti: string,
 *   vaatiiToimenpiteita: boolean,
 *   toimenpide?: 'push' | 'pull' | 'rebase' | 'ihminen' | 'commit'
 * }>}
 */
export async function tarkistaSynkka(parametrit = {}) {
  const { cwd = process.cwd(), remote = 'origin', hae = false, valinnat = {} } = parametrit;

  if (hae) {
    await haeRemote(remote, null, cwd, valinnat);
  }

  const tila = await lueGitTila(cwd, valinnat);
  const { haara, irrotettu, tracking, likainen, tiedostot } = tila;

  if (irrotettu) {
    return {
      ok: true,
      tila: 'irrotettu',
      haara,
      tracking: null,
      edella: 0,
      jaljessa: 0,
      likainen,
      muutoksetLkm: tiedostot.length,
      raportti: `irrotettu HEAD (${haara})${likainen ? `; likainen puu (${tiedostot.length} muutosta)` : ''}`,
      vaatiiToimenpiteita: false
    };
  }

  const trackingHaara = tracking || `${remote}/${haara}`;
  const vertailu = await vertaaHaarat(haara, trackingHaara, cwd, valinnat);
  const edella = vertailu.edella;
  const jaljessa = vertailu.jaljessa;

  let synkkaTila = vertailu.tila;
  let tilaTeksti = '';
  let vaatiiToimenpiteita = false;
  let toimenpide;

  if (synkkaTila === 'ajan_tasalla') {
    tilaTeksti = 'ajan tasalla';
  } else if (synkkaTila === 'edella') {
    tilaTeksti = `edellä ${edella} — push tarvitaan`;
    vaatiiToimenpiteita = true;
    toimenpide = 'push';
  } else if (synkkaTila === 'jaljessa') {
    tilaTeksti = `jäljessä ${jaljessa} — pull tarvitaan`;
    vaatiiToimenpiteita = true;
    toimenpide = 'pull';
  } else if (synkkaTila === 'haarautunut') {
    tilaTeksti = `haarautunut ${edella}/${jaljessa} — ihminen`;
    vaatiiToimenpiteita = true;
    toimenpide = 'ihminen';
  }

  if (likainen) {
    tilaTeksti += `; likainen puu (${tiedostot.length} muutosta)`;
    if (!toimenpide) toimenpide = 'commit';
  }

  return {
    ok: true,
    tila: synkkaTila,
    haara,
    tracking: trackingHaara,
    edella,
    jaljessa,
    likainen,
    muutoksetLkm: tiedostot.length,
    raportti: tilaTeksti,
    vaatiiToimenpiteita,
    toimenpide
  };
}
