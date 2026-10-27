// Skoopin nimi → hakemisto projektijuuressa (SIIRTO-SCOPES2, scopes siirto scopes2 19.10.2026).
// Perheen juuret ovat `scopes/` ja `scopes2/` (scopes-V2, K-9): ensimmäinen sana on juurihakemisto ja loput alihakemistot,
// joten `scopes agy siirto` → scopes/agy/siirto, `scopes2 ydin` → scopes2/ydin ja `scopes` → scopes. Nimi ilman
// juurisanaa on vanha lyhyt muoto scopes-skoopista (`palvelu` → scopes/palvelu), kuten ennen tätä moduulia.
// Sama raja kuin claude/siirto/tools/pura-malliton.mjs:n onPerhe (rekisteri scopes/- tai scopes2/-alla).
// ECONOMY-HYBRIDI (27.10.2026): Kanoninen rekisterin ja hakemiston ratkaisu kaikille skoopeille (myös claude, infra, jne.).

import { dirname } from 'node:path';
import { pakkausRekisteri } from '../../../../claude/siirto/tools/skooppirajaus.mjs';

export const PERHEJUURET = ['scopes', 'scopes2'];
export const MUUT_JUURET = ['claude', 'infra', 'models', 'plugin'];

const sanat = (skooppi) => String(skooppi ?? '').trim().split(/\s+/).filter(Boolean);

export const onPerheenSkooppi = (skooppi) => PERHEJUURET.includes(sanat(skooppi)[0]);

/**
 * Hakee skoopin rekisteritiedoston suhteellisen polun juuresta (esim. scopes/palvelu/REKISTERI.md tai Infra/paarekisteri.md).
 */
export function skoopinRekisteripolku(skooppi, juuri = process.cwd()) {
  if (!skooppi) return null;
  try {
    const r = pakkausRekisteri(skooppi, juuri);
    if (r) return r;
  } catch {}
  return null;
}

/**
 * Palauttaa skoopin pääasiallisen lähdehakemiston projektijuuresta.
 */
export function skoopinHakemisto(skooppi, juuri = process.cwd()) {
  const s = sanat(skooppi);
  if (s.length === 0) return '';

  const rek = skoopinRekisteripolku(skooppi, juuri);
  if (rek) {
    return dirname(rek);
  }

  if (onPerheenSkooppi(skooppi)) {
    return s.join('/');
  }

  if (MUUT_JUURET.includes(s[0])) {
    return s.join('/');
  }

  return ['scopes', ...s].join('/');
}
