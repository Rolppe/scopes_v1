#!/usr/bin/env node
// scopes/siirto/economy/git-esitiedot.mjs
// ECONOMY-GIT-ESITIEDOT: Deterministinen git-tilan esisyöttö purkuihin ja istuntoihin
// Estää redundantit git status / git log / git diff -kutsut (säästö ~500 kutsua/vrk).

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { haeGitTila, muotoileGitEsitiedot } from '../../palvelu/economy.mjs';

const TAMA = dirname(fileURLToPath(import.meta.url));
const OLETUS_JUURI = resolve(TAMA, '../../../');

/**
 * Hakee ja muotoilee git-esitiedot skoopille.
 */
export async function haeJaMuotoileGitEsitiedot(skooppi, { juuri = OLETUS_JUURI, aja } = {}) {
  const tila = await haeGitTila({ juuri, skooppi, aja });
  const teksti = muotoileGitEsitiedot(tila, skooppi);
  return {
    ...tila,
    teksti,
  };
}

async function main(args) {
  let skooppi = null;
  let jsonMuoto = false;

  for (const a of args) {
    if (a === '--json') jsonMuoto = true;
    else if (!skooppi) skooppi = a;
  }

  if (!skooppi) {
    console.error('Käyttö: node git-esitiedot.mjs "<skooppi>" [--json]');
    process.exit(2);
  }

  const tulos = await haeJaMuotoileGitEsitiedot(skooppi);
  if (jsonMuoto) {
    console.log(JSON.stringify(tulos, null, 2));
  } else {
    console.log(tulos.teksti);
  }
}

const onPaaohjelma = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (onPaaohjelma) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`VIRHE git-esitiedot: ${err.message}`);
    process.exit(1);
  });
}
