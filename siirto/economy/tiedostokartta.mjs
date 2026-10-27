#!/usr/bin/env node
// scopes/siirto/economy/tiedostokartta.mjs
// ECONOMY-TIEDOSTOKARTTA: Tiedostokartta ja koodi-indeksi ilman sokkohakuja
// Estää find / grep -rn / ls -sokkohaut komentoriviltä (säästö ~1 000 kutsua/vrk).

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OHITETTAVAT_KANSIOT = new Set([
  '.git',
  'node_modules',
  'target',
  '.build',
  '.gemini',
  'dist',
  '.build-cache',
  'DerivedData',
]);

const KOODI_PAATTEET = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.swift',
  '.rs',
  '.py',
  '.go',
  '.c',
  '.h',
  '.cpp',
  '.sh',
  '.bash',
  '.zsh',
]);

const DOKUMENTTI_PAATTEET = new Set(['.md', '.txt', '.rst']);
const KONFIGURAATIO_PAATTEET = new Set(['.json', '.yaml', '.yml', '.toml', '.ini', '.xml']);

/**
 * Tunnistaa tiedoston karkean kategorian.
 */
export function luokitteleTiedostotyyppi(polku) {
  const ext = extname(polku).toLowerCase();
  if (KOODI_PAATTEET.has(ext)) return 'koodi';
  if (DOKUMENTTI_PAATTEET.has(ext)) return 'dokumentti';
  if (KONFIGURAATIO_PAATTEET.has(ext)) return 'konfiguraatio';
  return 'muu';
}

/**
 * Selvittää skoopin perushakemistot skoopinnimestä ja skoopit.json-kartasta.
 */
export function selvitaSkoopinPolut(skooppi, juuri = process.cwd()) {
  try {
    const jsonPolku = join(juuri, 'claude/siirto/state/skoopit.json');
    if (existsSync(jsonPolku)) {
      const kartta = JSON.parse(readFileSync(jsonPolku, 'utf8'));
      if (kartta && kartta[skooppi] && kartta[skooppi][0]) {
        const rek = kartta[skooppi][0];
        const hak = rek.replace(/\/[^/]+$/, '');
        return [hak];
      }
    }
  } catch {}

  const osat = skooppi.trim().split(/\s+/);
  return [osat.join('/')];
}

/**
 * Poimii tiedoston ylätason symbolit ja otsikot ilman LLM-kutsuja.
 */
export function poimiKoodiIndeksi(sisalto, tiedostopaate = '', maxSymbolit = 30) {
  if (!sisalto || typeof sisalto !== 'string') return [];
  const symbolit = [];
  const rivit = sisalto.split('\n');
  const ext = (tiedostopaate.startsWith('.') ? tiedostopaate : `.${tiedostopaate}`).toLowerCase();

  for (let i = 0; i < rivit.length && symbolit.length < maxSymbolit; i++) {
    const rivi = rivit[i].trim();
    if (!rivi || rivi.startsWith('//') || rivi.startsWith('/*') || rivi.startsWith('*')) continue;

    // JavaScript / TypeScript
    if (/\.(mjs|js|cjs|ts|tsx|jsx)$/.test(ext)) {
      let m = rivi.match(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'funktio', rivi: i + 1, exportoitu: true }); continue; }
      m = rivi.match(/^export\s+class\s+([A-Za-z0-9_$]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'luokka', rivi: i + 1, exportoitu: true }); continue; }
      m = rivi.match(/^export\s+const\s+([A-Za-z0-9_$]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'vakio', rivi: i + 1, exportoitu: true }); continue; }
      m = rivi.match(/^(?:async\s+)?function\s+([A-Za-z0-9_$]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'funktio', rivi: i + 1, exportoitu: false }); continue; }
      m = rivi.match(/^class\s+([A-Za-z0-9_$]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'luokka', rivi: i + 1, exportoitu: false }); continue; }
    }

    // Swift
    if (ext === '.swift') {
      let m = rivi.match(/^(?:(?:public|internal|private|fileprivate|open|final)\s+)*(?:struct|class|enum|actor|protocol)\s+([A-Za-z0-9_]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'tyyppi', rivi: i + 1 }); continue; }
      m = rivi.match(/^(?:(?:public|internal|private|fileprivate|static|override)\s+)*func\s+([A-Za-z0-9_]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'funktio', rivi: i + 1 }); continue; }
    }

    // Rust
    if (ext === '.rs') {
      let m = rivi.match(/^(?:pub\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'funktio', rivi: i + 1 }); continue; }
      m = rivi.match(/^(?:pub\s+)?(?:struct|enum|trait|type)\s+([A-Za-z0-9_]+)/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'tyyppi', rivi: i + 1 }); continue; }
    }

    // Markdown-otsikot
    if (ext === '.md') {
      let m = rivi.match(/^(#{1,3})\s+(.+)$/);
      if (m) {
        symbolit.push({ nimi: m[2].trim(), tyyppi: 'otsikko', taso: m[1].length, rivi: i + 1 });
        continue;
      }
    }

    // Shell-skriptit
    if (ext === '.sh') {
      let m = rivi.match(/^([A-Za-z0-9_-]+)\s*\(\)\s*\{/);
      if (m) { symbolit.push({ nimi: m[1], tyyppi: 'funktio', rivi: i + 1 }); continue; }
    }
  }

  return symbolit;
}

/**
 * Hakee ja luetteloi skoopin tiedostokartan ja valinnaisen koodi-indeksin.
 */
export function haeTiedostokartta({
  juuri = process.cwd(),
  skooppi,
  maxSyvyys = 6,
  maxTiedostot = 500,
  sisallytaIndeksi = false,
  lueRajaPolut = false,
} = {}) {
  if (!skooppi) return { virhe: 'skooppi puuttuu' };

  let peruspolut = selvitaSkoopinPolut(skooppi, juuri);

  // Valinnainen: lue rekisterin Raja-määrittely lisäpoluille
  if (lueRajaPolut) {
    for (const p of [...peruspolut]) {
      const rekPolku = join(juuri, p, 'REKISTERI.md');
      if (existsSync(rekPolku)) {
        try {
          const rekSisalto = readFileSync(rekPolku, 'utf8');
          const rajaMatch = rekSisalto.match(/Raja:\s*Polut\s+([^\n]+)/);
          if (rajaMatch) {
            const matches = rajaMatch[1].matchAll(/`([^`]+)`/g);
            for (const m of matches) {
              const polku = m[1].replace(/\/\*\*$/, '').replace(/\/\*$/, '');
              if (polku && !peruspolut.includes(polku)) {
                peruspolut.push(polku);
              }
            }
          }
        } catch {}
      }
    }
  }

  const tiedostot = [];
  let yhteensaKoko = 0;
  const tyyppiLaskuri = { koodi: 0, dokumentti: 0, konfiguraatio: 0, muu: 0 };

  function skannaa(hakemisto, syvyys) {
    if (syvyys > maxSyvyys || tiedostot.length >= maxTiedostot) return;
    let lapset;
    try {
      lapset = readdirSync(hakemisto, { withFileTypes: true });
    } catch {
      return;
    }

    for (const lapsi of lapset) {
      if (lapsi.name.startsWith('.') && lapsi.name !== '.agents') continue;
      if (OHITETTAVAT_KANSIOT.has(lapsi.name)) continue;

      const kokoPolku = join(hakemisto, lapsi.name);
      const relPolku = relative(juuri, kokoPolku);

      if (lapsi.isDirectory()) {
        skannaa(kokoPolku, syvyys + 1);
      } else if (lapsi.isFile()) {
        try {
          const st = statSync(kokoPolku);
          const ttyyppi = luokitteleTiedostotyyppi(relPolku);
          tyyppiLaskuri[ttyyppi] = (tyyppiLaskuri[ttyyppi] || 0) + 1;

          let symbolit = undefined;
          if (sisallytaIndeksi && st.size < 500_000) {
            try {
              const sisalto = readFileSync(kokoPolku, 'utf8');
              symbolit = poimiKoodiIndeksi(sisalto, extname(relPolku));
            } catch {}
          }

          tiedostot.push({
            polku: relPolku,
            koko: st.size,
            mtime: st.mtimeMs,
            tyyppi: ttyyppi,
            fileUri: `file://${resolve(juuri, relPolku)}`,
            ...(symbolit ? { symbolit } : {}),
          });
          yhteensaKoko += st.size;
        } catch {}
      }
    }
  }

  for (const p of peruspolut) {
    const koko = join(juuri, p);
    if (existsSync(koko)) {
      try {
        const st = statSync(koko);
        if (st.isDirectory()) {
          skannaa(koko, 1);
        } else if (st.isFile()) {
          const ttyyppi = luokitteleTiedostotyyppi(p);
          tyyppiLaskuri[ttyyppi] = (tyyppiLaskuri[ttyyppi] || 0) + 1;

          let symbolit = undefined;
          if (sisallytaIndeksi && st.size < 500_000) {
            try {
              const sisalto = readFileSync(koko, 'utf8');
              symbolit = poimiKoodiIndeksi(sisalto, extname(p));
            } catch {}
          }

          tiedostot.push({
            polku: p,
            koko: st.size,
            mtime: st.mtimeMs,
            tyyppi: ttyyppi,
            fileUri: `file://${resolve(juuri, p)}`,
            ...(symbolit ? { symbolit } : {}),
          });
          yhteensaKoko += st.size;
        }
      } catch {}
    }
  }

  // Aakkosjärjestys polun mukaan
  tiedostot.sort((a, b) => a.polku.localeCompare(b.polku));

  return {
    skooppi,
    peruspolut,
    tiedostot,
    yhteensaKoko,
    maara: tiedostot.length,
    tyypit: tyyppiLaskuri,
  };
}

/**
 * Hakee symbolia tai tiedostonimeä tiedostokartasta.
 */
export function etsiSymboli(kartta, hakusana) {
  if (!kartta || !Array.isArray(kartta.tiedostot) || !hakusana) return [];
  const q = String(hakusana).toLowerCase().trim();
  const osumat = [];

  for (const t of kartta.tiedostot) {
    const polkuMatch = t.polku.toLowerCase().includes(q);
    const symboliMatches = Array.isArray(t.symbolit)
      ? t.symbolit.filter((s) => s.nimi.toLowerCase().includes(q))
      : [];

    if (polkuMatch || symboliMatches.length > 0) {
      osumat.push({
        polku: t.polku,
        koko: t.koko,
        fileUri: t.fileUri,
        osumaPolussa: polkuMatch,
        symbolit: symboliMatches,
      });
    }
  }

  return osumat;
}

/**
 * Muotoilee tiedostokartan deterministiseksi Markdown-lohkoksi file://-linkkeineen.
 */
export function muotoileTiedostokartta(kartta, {
  juuri = process.cwd(),
  maxRivit = 35,
  naytaSymbolit = false,
  lyhyt = false,
} = {}) {
  if (!kartta || !Array.isArray(kartta.tiedostot)) {
    return '## Skoopin tiedostokartta: ei tiedostoja';
  }

  const { skooppi, tiedostot, yhteensaKoko, maara } = kartta;
  const kokoKt = (yhteensaKoko / 1024).toFixed(1);

  if (lyhyt) {
    const listatut = tiedostot.slice(0, 5).map((t) => t.polku).join(', ');
    return `Tiedostokartta (${maara} kpl, ${kokoKt} KB): ${listatut}${maara > 5 ? ` + ${maara - 5} muuta` : ''}. Käytä suoria file://-polkuja ilman sokkohakuja.`;
  }

  const rivit = [
    '## Skoopin tiedostokartta (ECONOMY-TIEDOSTOKARTTA)',
    '',
    `Tiedostot (${maara} kpl, ${kokoKt} KB) — deterministiset file://-linkit (älä tee find/grep-sokkohakuja):`,
  ];

  const naytettavat = tiedostot.slice(0, maxRivit);
  for (const t of naytettavat) {
    const kokoStr = t.koko >= 1024 ? `${(t.koko / 1024).toFixed(1)} KB` : `${t.koko} B`;
    const uri = t.fileUri || `file://${resolve(juuri, t.polku)}`;

    let symboliTeksti = '';
    if (naytaSymbolit && Array.isArray(t.symbolit) && t.symbolit.length > 0) {
      const nimet = t.symbolit.slice(0, 4).map((s) => s.nimi).join(', ');
      symboliTeksti = ` — symbolit: ${nimet}${t.symbolit.length > 4 ? ` (+${t.symbolit.length - 4})` : ''}`;
    }

    rivit.push(`- [${t.polku}](${uri}) (${kokoStr})${symboliTeksti}`);
  }

  if (tiedostot.length > maxRivit) {
    rivit.push(`- ... ja ${tiedostot.length - maxRivit} muuta tiedostoa`);
  }

  rivit.push('');
  rivit.push('- Pysyvä ohje: Skoopin olennaiset tiedostot on listattu yllä suorin linkein. Älä käytä find-, grep- tai ls-komentoja tiedostojen etsimiseen.');

  return rivit.join('\n');
}

/**
 * Hakee ja muotoilee tiedostokartan yhdellä kutsulla.
 */
export function haeJaMuotoileTiedostokartta(skooppi, {
  juuri = process.cwd(),
  maxSyvyys = 6,
  maxTiedostot = 500,
  maxRivit = 35,
  sisallytaIndeksi = false,
  naytaSymbolit = false,
  lyhyt = false,
} = {}) {
  const kartta = haeTiedostokartta({
    juuri,
    skooppi,
    maxSyvyys,
    maxTiedostot,
    sisallytaIndeksi: sisallytaIndeksi || naytaSymbolit,
  });

  const teksti = muotoileTiedostokartta(kartta, {
    juuri,
    maxRivit,
    naytaSymbolit,
    lyhyt,
  });

  return {
    ...kartta,
    teksti,
  };
}

async function main(args) {
  let skooppi = null;
  let jsonMuoto = false;
  let indeksi = false;
  let lyhyt = false;
  let haku = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') jsonMuoto = true;
    else if (a === '--indeksi') indeksi = true;
    else if (a === '--lyhyt') lyhyt = true;
    else if (a === '--haku') haku = args[++i];
    else if (!skooppi && !a.startsWith('--')) skooppi = a;
  }

  if (!skooppi) {
    console.error('Käyttö: node tiedostokartta.mjs "<skooppi>" [--json] [--indeksi] [--lyhyt] [--haku <symboli>]');
    process.exit(2);
  }

  const kartta = haeTiedostokartta({
    skooppi,
    sisallytaIndeksi: indeksi || Boolean(haku),
  });

  if (haku) {
    const osumat = etsiSymboli(kartta, haku);
    if (jsonMuoto) {
      console.log(JSON.stringify(osumat, null, 2));
    } else {
      console.log(`Hakusanalla "${haku}" löytyi ${osumat.length} osumaa skoopista "${skooppi}":`);
      for (const o of osumat) {
        console.log(`- ${o.polku} (${o.fileUri})`);
        if (o.symbolit?.length) {
          console.log(`  symbolit: ${o.symbolit.map((s) => s.nimi).join(', ')}`);
        }
      }
    }
    return;
  }

  if (jsonMuoto) {
    console.log(JSON.stringify(kartta, null, 2));
  } else {
    console.log(muotoileTiedostokartta(kartta, { naytaSymbolit: indeksi, lyhyt }));
  }
}

const onPaaohjelma = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (onPaaohjelma) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`VIRHE tiedostokartta: ${err.message}`);
    process.exit(1);
  });
}
