// scopes/siirto/economy/hybridi-pakkaus.mjs
// Deterministinen hybridipakkauksen hallinta ja säästöoptimointi (ECONOMY-HYBRIDI 27.10.2026).
// Korvaa vanhan monivaiheisen pakkaa-vaiheet.mjs -pakkauksen kaikissa skoopeissa.
// Säästöpotentiaali: ~60–105 LLM-mallikutsua / vrk AGY:n 1500 kutsun budjetista.

import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  skoopinHakemisto,
  skoopinRekisteripolku,
  onPerheenSkooppi,
} from '../../agy/siirto/pakkausscripti/skooppipolku.mjs';

export const PAKKAUS_SKRIPTI_POLKU = 'scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs';
export const OLETUS_VANHA_KUTSUJA = 4.5; // Keskimäärin 4-5 LLM-kutsua (vaiheet A, B, C, K)
export const OLETUS_HYBRIDI_KUTSUJA = 1.0; // 0-1 LLM-kutsua (Flash 3.8 tai deterministinen)
export const OLETUS_ISTUNTOJA_VRK = 25; // Keskimääräinen aktiivisten istuntojen määrä per vuorokausi

/**
 * Selvittää skoopin pakkausstrategian ja polut.
 * Hybridipakkaus on oletus ja ensisijainen menetelmä kaikille skoopeille.
 */
export function selvitaPakkausStrategia(skooppi, juuri = process.cwd()) {
  const normSkooppi = String(skooppi ?? '').trim();
  const hakemisto = skoopinHakemisto(normSkooppi, juuri);
  const rekisteri = skoopinRekisteripolku(normSkooppi, juuri) || (hakemisto ? join(hakemisto, 'REKISTERI.md') : null);
  const rekisteriOlemassa = Boolean(rekisteri && existsSync(join(juuri, rekisteri)));

  return {
    skooppi: normSkooppi,
    hakemisto,
    rekisteri,
    rekisteriOlemassa,
    strategia: 'hybridi',
    skripti: PAKKAUS_SKRIPTI_POLKU,
    oletusMalli: 'gemini-3.8-flash-low',
    tukeeDeterministista: true,
    komento: muodostaPakkausKomento(normSkooppi, { vahvistettu: true }),
    automaattisiirtoKomento: muodostaPakkausKomento(normSkooppi, { vahvistettu: true, vaihda: true }),
  };
}

/**
 * Muodostaa suoran komennon hybridipakkauksen ajamiseksi.
 */
export function muodostaPakkausKomento(skooppi, {
  vahvistettu = true,
  vaihda = false,
  viesti = null,
  ilmanMallia = false,
  malli = null,
  skripti = PAKKAUS_SKRIPTI_POLKU,
} = {}) {
  const osat = ['node', skripti, `"${skooppi}"`];
  if (vahvistettu) osat.push('--vahvistettu');
  if (vaihda) osat.push('--vaihda');
  if (ilmanMallia) osat.push('--ilman-mallia');
  if (malli) osat.push(`--malli ${malli}`);
  if (viesti) osat.push(`-m "${viesti.replace(/"/g, '\\"')}"`);
  return osat.join(' ');
}

/**
 * Laskee hybridipakkauksen tuoman kutsusäästön vuorokausitasolla suhteessa 1500 kutsun kiintiöön.
 */
export function laskePakkausSaasto({
  istuntojaPerVrk = OLETUS_ISTUNTOJA_VRK,
  vanhaKutsujaPerPakkaus = OLETUS_VANHA_KUTSUJA,
  hybridiKutsujaPerPakkaus = OLETUS_HYBRIDI_KUTSUJA,
  kiintioYhteensa = 1500,
} = {}) {
  const vanhaYhteensa = Math.round(istuntojaPerVrk * vanhaKutsujaPerPakkaus);
  const hybridiYhteensa = Math.round(istuntojaPerVrk * hybridiKutsujaPerPakkaus);
  const saastoYhteensa = Math.max(0, vanhaYhteensa - hybridiYhteensa);
  const saastoPerPakkaus = Math.round((vanhaKutsujaPerPakkaus - hybridiKutsujaPerPakkaus) * 10) / 10;
  const osuusKiintiosta = Math.round((saastoYhteensa / kiintioYhteensa) * 1000) / 10;

  return {
    istuntojaPerVrk,
    vanhaKutsujaPerPakkaus,
    hybridiKutsujaPerPakkaus,
    saastoPerPakkaus,
    vanhaYhteensa,
    hybridiYhteensa,
    saastoYhteensa,
    kiintioYhteensa,
    osuusKiintiosta, // prosentteina esim. 5.8 %
  };
}

/**
 * Muotoilee informatiivisen ohjeistuksen hybridipakkauksen käytöstä.
 */
export function muotoileHybridiOhje(skooppi = null, opt = {}) {
  const strategia = skooppi ? selvitaPakkausStrategia(skooppi) : null;
  const saasto = laskePakkausSaasto();

  const rivit = [
    '## Deterministinen Hybridipakkaus (Economy)',
    '',
    'Hybridipakkaus korvaa vanhan monivaiheisen `pakkaa-vaiheet.mjs`-vaihepakkauksen kaikissa skoopeissa.',
    `- **Säästö:** ~${saasto.saastoPerPakkaus} mallikutsua per pakkaus (~${saasto.saastoYhteensa} kutsua / vrk, n. ${saasto.osuusKiintiosta} % koko 1500 kutsun kiintiöstä).`,
    '- **Nopeus:** Suorittaa louhinnan, muistion, porttitarkistuksen ja git-vaiheen yhdellä synkronisella ajolla.',
    '- **Determinismi:** Rekisterin ja historian siirrot tehdään jäsennyskoodilla ilman satunnaisia LLM-hallusinaatioita.',
  ];

  if (strategia) {
    rivit.push('');
    rivit.push(`### Skoopin "${strategia.skooppi}" pakkauskomennot:`);
    rivit.push(`- **Tavallinen pakkaus:** \`${strategia.komento}\``);
    rivit.push(`- **Automaattisiirto:** \`${strategia.automaattisiirtoKomento}\``);
    if (strategia.rekisteri) {
      rivit.push(`- **Rekisteripolku:** \`${strategia.rekisteri}\`${strategia.rekisteriOlemassa ? ' (olemassa)' : ''}`);
    }
  }

  return rivit.join('\n');
}
