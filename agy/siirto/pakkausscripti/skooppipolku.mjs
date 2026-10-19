// Skoopin nimi → hakemisto projektijuuressa (SIIRTO-SCOPES2, scopes siirto scopes2 19.10.2026).
// Perheen juuret ovat `scopes/` ja `scopes2/` (scopes-V2, K-9): ensimmäinen sana on juurihakemisto ja loput alihakemistot,
// joten `scopes agy siirto` → scopes/agy/siirto, `scopes2 ydin` → scopes2/ydin ja `scopes` → scopes. Nimi ilman
// juurisanaa on vanha lyhyt muoto scopes-skoopista (`palvelu` → scopes/palvelu), kuten ennen tätä moduulia.
// Sama raja kuin claude/siirto/tools/pura-malliton.mjs:n onPerhe (rekisteri scopes/- tai scopes2/-alla).

export const PERHEJUURET = ['scopes', 'scopes2'];

const sanat = (skooppi) => String(skooppi ?? '').trim().split(/\s+/).filter(Boolean);

export const onPerheenSkooppi = (skooppi) => PERHEJUURET.includes(sanat(skooppi)[0]);

export function skoopinHakemisto(skooppi) {
  const s = sanat(skooppi);
  if (s.length === 0) return '';
  return (onPerheenSkooppi(skooppi) ? s : ['scopes', ...s]).join('/');
}
