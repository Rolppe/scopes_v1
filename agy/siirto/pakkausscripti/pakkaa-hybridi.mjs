#!/usr/bin/env node
// Hybridi-pakkausscriptin pääorkestroija (Moduuli 4)
// Yhdistää louhijan, Flash 3.8 -harkinnan, muistiogeneraattorin ja siirtotyökalut.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { louhiKaikki } from './louhija.mjs';
import { ajaHarkintaLahteella, poistaLahteettomat, AGY_MALLI, CLAUDE_MALLI } from './harkinta.mjs';
import { skoopinHakemisto, skoopinRekisteripolku } from './skooppipolku.mjs';
import {
  kirjoitaJaTarkista,
  haeTilaHakemisto,
  haeOletusMuistio,
  jasennaPakkaaAlku,
  OLETUS_MUISTIO,
} from './muistio.mjs';

const HAKEMISTO = dirname(fileURLToPath(import.meta.url));
const JUURI = process.env.PAKKAA_JUURI
  ? resolve(process.env.PAKKAA_JUURI)
  : resolve(HAKEMISTO, '../../../../');

function tulostaOhje() {
  console.log(`Käyttö: pakkaa-hybridi.mjs "<skooppi>" [valitsimet]

Valitsimet:
  --vahvistettu      Vahvista tilaa muuttava vaihe 5 (git add + commit + push)
  --vaihda           Suorita istunnonvaihto pakkauksen jälkeen (/automaattisiirto)
  --kuiva            Kuiva-ajo: luo ja tarkistaa muistion, mutta ei tee committia eikä rekisteripäivitystä
  --ilman-mallia     Käytä determinististä synteesiä ilman mallikutsua
  --malli <nimi>     Harkinnan malli (oletus: ${AGY_MALLI}); claude-* ajetaan claude CLI:llä, esim. ${CLAUDE_MALLI} (testissä, V-652)
  --co-author "<r>"  Commit-attribuutiorivi pakkaa-alku.mjs:lle ja pakkaa-loppu.mjs:lle
  --session <id>     Yliaja istuntotunniste (agy- tai Claude Code -istunto)
  --ajaja <m[:malli]>  Vaiheen 5 ajaja (oletus: claude/siirto/ajaja.json); agy:n estyessä varareitti ${VARA_AJAJA}
  -m "<viesti>"      Commit-viestin kuvausosa
  -h, --help         Näytä tämä ohje
`);
}

// V-562: vaihe 5 ei saa vaatia agy:tä. Kun agy on estynyt (kiintiö, puuttuu, kirjautumaton),
// aja-siirtaja.sh paketoi palauttaa exit 3 ja pakkaus ajetaan tällä ajajalla uudelleen.
export const VARA_AJAJA = 'claude-cli:claude-sonnet-5-5';

/**
 * Muodostaa aja-siirtaja.sh paketoi -argumentin. Ilman ajajaa ajaja.json päättää moottorin.
 */
export function muodostaSiirtajaSkooppi(skooppi, ajaja = null) {
  return ajaja ? `${skooppi} --ajaja=${ajaja}` : skooppi;
}

/**
 * Ajetaanko vaihe 5 uudelleen varareitillä: exit 3 ja agy oli moottori (lippu tai AJAJA-rivi).
 */
export function tarvitaankoVarareitti(status, ajaja, tuloste = '') {
  if (status !== 3) return false;
  if (ajaja && ajaja.startsWith('claude-cli')) return false;
  return Boolean(ajaja?.startsWith('agy')) || /^AJAJA:.*\bagy\b/m.test(tuloste);
}

function tunnistaAutopack(alkuTiedot, sessioId) {
  if (typeof alkuTiedot?.autopack === 'boolean') return alkuTiedot.autopack;
  const tilaDir = haeTilaHakemisto();
  if (sessioId) {
    const istuntoAutopack = join(tilaDir, 'istunnot', sessioId, 'autopack.txt');
    if (existsSync(istuntoAutopack)) {
      try {
        return readFileSync(istuntoAutopack, 'utf8').trim() === 'true';
      } catch {}
    }
  }
  const yhteinenAutopack = join(tilaDir, 'autopack.txt');
  if (existsSync(yhteinenAutopack)) {
    try {
      return readFileSync(yhteinenAutopack, 'utf8').trim() === 'true';
    } catch {}
  }
  return false;
}

/**
 * Sääntö 15 & V-008: Laskee commit-listalle menevät tiedostopolut.
 * Jos skoopilla on omia muuttuneita tiedostoja, rajataan vain niihin.
 * Jos omia muutoksia ei ole, palautetaan vain skoopin oma REKISTERI.md.
 */
export function maaritaLoppuPolut(skooppi, skoopinMuutetut = [], juuri = process.cwd()) {
  if (!skooppi) return [];
  const skooppiRel = skoopinHakemisto(skooppi, juuri);
  const rek = skoopinRekisteripolku(skooppi, juuri) || join(skooppiRel, 'REKISTERI.md');
  return (skoopinMuutetut && skoopinMuutetut.length > 0)
    ? [...skoopinMuutetut]
    : [rek];
}

/**
 * Varmistaa, että skoopin omat metadatatiedostot (REKISTERI.md, HISTORIA.md, ARKISTO.md)
 * sekä skoopin hallitsemat taidot sisältyvät commit-listaan, jos ne ovat olemassa levyllä.
 */
export function taydennaSkoopinMetadatat(skooppi, loppuPolut = [], juuri = process.cwd()) {
  if (!skooppi) return loppuPolut;
  const skooppiRel = skoopinHakemisto(skooppi, juuri);
  const rek = skoopinRekisteripolku(skooppi, juuri);
  const taatut = [
    rek || join(skooppiRel, 'REKISTERI.md'),
    join(skooppiRel, 'HISTORIA.md'),
    join(skooppiRel, 'ARKISTO.md'),
  ];
  if (skooppi === 'scopes agy siirto pakkausscripti') {
    taatut.push('.agents/skills/pakkaa/SKILL.md');
  }
  const tulos = [...loppuPolut];
  for (const t of taatut) {
    if (existsSync(join(juuri, t)) && !tulos.includes(t)) {
      tulos.push(t);
    }
  }
  return tulos;
}

/**
 * Sääntö 15 & V-008: Muodostaa varoitustekstit vieraista tiedostoista, joita ei oteta committiin.
 */
export function muodostaVierasVaroitus(vieraatMuutetut = []) {
  if (!vieraatMuutetut || vieraatMuutetut.length === 0) return [];
  return [
    `Varoitus (Scopes-sääntö 15, V-008): Jätetään commitista pois ${vieraatMuutetut.length} vierasta tiedostoa:`,
    ...vieraatMuutetut.map((v) => `  - ${v}`),
    'Ohje: Kirjaa vieraan skoopin muutokset omistajalle (/vika) tai pakkaa kyseinen skooppi erikseen.',
  ];
}

/**
 * Sääntö 15 & V-008: Tulostaa varoituksen vieraista tiedostoista konsoliin.
 */
export function varoitaVieraistaMuutoksista(vieraatMuutetut = [], logger = console.warn) {
  const rivit = muodostaVierasVaroitus(vieraatMuutetut);
  for (const r of rivit) {
    logger(r);
  }
  return rivit;
}

async function main() {
  const args = process.argv.slice(2);
  let skooppi = null;
  let vahvistettu = false;
  let vaihda = false;
  let kuiva = false;
  let ilmanMallia = false;
  let malli = null;
  let coAuthor = null;
  let sessio = null;
  let ajaja = null;
  let viesti = 'chore(pakkaus): automaattinen hybridi-pakkaus';

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--vahvistettu') vahvistettu = true;
    else if (a === '--vaihda') vaihda = true;
    else if (a === '--kuiva') kuiva = true;
    else if (a === '--ilman-mallia') ilmanMallia = true;
    else if (a === '--malli' && args[i + 1]) malli = args[++i];
    else if (a === '--co-author' && args[i + 1]) coAuthor = args[++i];
    else if (a === '--session' && args[i + 1]) sessio = args[++i];
    else if (a === '--ajaja' && args[i + 1]) ajaja = args[++i];
    else if (a.startsWith('--ajaja=')) ajaja = a.slice(8);
    else if (a === '-m' && args[i + 1]) viesti = args[++i];
    else if (a === '-h' || a === '--help') {
      tulostaOhje();
      process.exit(0);
    } else if (!a.startsWith('--') && !skooppi) {
      skooppi = a;
    }
  }

  if (!skooppi) {
    console.error('VIRHE: Skooppi puuttuu argumenteista.');
    tulostaOhje();
    process.exit(2);
  }

  console.log(`[1/5] Alustetaan pakkaus skoopille "${skooppi}"...`);
  const pakkaaAlkuTyokalu = join(JUURI, 'claude/siirto/tools/pakkaa-alku.mjs');
  let alkuTiedot = { muistio: null, skooppitarkistus: null, seuraavaHead: null, autopack: null };
  if (existsSync(pakkaaAlkuTyokalu)) {
    const alkuArgs = [skooppi];
    if (sessio) alkuArgs.push('--session', sessio);
    if (coAuthor) alkuArgs.push('--co-author', coAuthor);
    const alkuRes = spawnSync('node', [pakkaaAlkuTyokalu, ...alkuArgs], {
      cwd: JUURI,
      encoding: 'utf8',
    });
    if (alkuRes.stdout) process.stdout.write(alkuRes.stdout);
    if (alkuRes.stderr) process.stderr.write(alkuRes.stderr);
    if (alkuRes.status === 3) {
      console.error('PYSÄHDY: Pakkauksen alustus vaatii käyttäjän huomiota.');
      process.exit(3);
    }
    if (alkuRes.status !== 0 && alkuRes.status !== null) {
      console.error(`VIRHE: pakkaa-alku epäonnistui (exit ${alkuRes.status}).`);
      process.exit(alkuRes.status);
    }
    alkuTiedot = jasennaPakkaaAlku(alkuRes.stdout || '');
  }

  console.log(`[2/5] Louhitaan faktat ja tilatiedot...`);
  const faktat = await louhiKaikki({ skooppi, juuri: JUURI, sessio });
  if (alkuTiedot.skooppitarkistus) faktat.skooppitarkistus = alkuTiedot.skooppitarkistus;
  if (alkuTiedot.seuraavaHead) faktat.seuraavaHead = alkuTiedot.seuraavaHead;
  const rekisteriPolku = join(JUURI, skoopinRekisteripolku(skooppi, JUURI) || join(skoopinHakemisto(skooppi, JUURI), 'REKISTERI.md'));
  if (existsSync(rekisteriPolku)) {
    try {
      const lines = readFileSync(rekisteriPolku, 'utf8').split('\n');
      for (const l of lines) {
        if (l.startsWith('SEURAAVA PAKETTI:')) {
          faktat.seuraavaHead = l.trim();
          break;
        }
      }
    } catch {}
  }
  faktat.alkuTiedot = alkuTiedot;
  if (typeof alkuTiedot.autovalinta === 'boolean') faktat.autovalinta = alkuTiedot.autovalinta;
  console.log(`Faktat: haara=${faktat.git?.haara || 'HEAD'}, muuttuneita=${faktat.git?.muutetut?.length || 0}, viestejä=${faktat.viestit?.length || 0}`);
  console.log(`Istunto: ${faktat.istuntoId || 'ei-tiedossa'} (${faktat.istuntoLahde || 'ei transkriptia'}), testitodisteita=${faktat.testitodisteet?.length || 0}`);

  // V-652 (käyttäjä 28.10.2026): Haikua ei oteta oletukseksi ennen kuin se on testattu täysin toimivaksi; vain --malli.
  if (!malli) malli = AGY_MALLI;
  console.log(`[3/5] Suoritetaan nopea harkinta (malli: ${ilmanMallia ? 'deterministinen' : malli})...`);
  const harkinta = await ajaHarkintaLahteella(faktat, { kaytaMallia: !ilmanMallia, malli });
  console.log(harkinta.lahde === 'vara'
    ? `HARKINTA: VARA (deterministinen synteesi) — ${harkinta.syy}`
    : `HARKINTA: malli ${harkinta.malli} (${harkinta.moottori})`);
  const { analyysi, poistetut } = poistaLahteettomat(harkinta.analyysi, faktat);
  for (const p of poistetut) console.warn(`LÄHTEETÖN: poistettu testiväite ilman testiajon tulosriviä: ${p}`);

  console.log(`[4/5] Kirjoitetaan muistio ja ajetaan porttitarkistus...`);
  const muistioPolku = alkuTiedot.muistio || haeOletusMuistio();
  const tarkistus = kirjoitaJaTarkista(faktat, analyysi, muistioPolku, JUURI);
  if (!tarkistus.ok) {
    console.error(`VIRHE: Porttitarkistus epäonnistui (exit ${tarkistus.koodi}):\n${tarkistus.virhe || tarkistus.tuloste}`);
    process.exit(4);
  }
  console.log(`PORTTI: ok (kaikki tarkistukset hyväksytty)`);

  if (kuiva) {
    console.log(`KUIVA: Muistio luotu ja validoitu onnistuneesti osoitteessa ${tarkistus.polku}.`);
    console.log(`Ei tehdä git-committia eikä rekisteripäivitystä.`);
    process.exit(0);
  }

  // Sääntö 15 & V-008: Erotellaan skoopin omat ja vieraat muuttuneet tiedostot
  const skoopinMuutetut = faktat.git?.skoopinMuutetut || [];
  const vieraatMuutetut = faktat.git?.vieraatMuutetut || [];
  varoitaVieraistaMuutoksista(vieraatMuutetut);

  const loppuPolut = maaritaLoppuPolut(skooppi, skoopinMuutetut);

  // Sääntö 8: Tilaa muuttava vaihe [5/5] kysyttävä ensin, ellei autopack ole päällä tai --vahvistettu annettu
  const onAutopack = tunnistaAutopack(alkuTiedot, sessio || faktat.istuntoId);
  if (!onAutopack && !vahvistettu) {
    const sh = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
    const skripti = process.argv[1]?.startsWith('/')
      ? relative(JUURI, process.argv[1])
      : (process.argv[1] || 'scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs');

    console.log('KYSY-VAHVISTUS: add + commit + push (+ skoopin siirto, jos siirrettävissä)');
    console.log(`UUSINTA: node ${skripti} ${args.map(sh).join(' ')} --vahvistettu`);
    process.exit(5);
  }

  console.log(`[5/5] Päivitetään rekisterit ja ajetaan git-vaihe...`);
  const ajaSiirtaja = join(JUURI, 'claude/siirto/tools/aja-siirtaja.sh');
  if (existsSync(ajaSiirtaja)) {
    const ajaPaketoi = (a) => {
      const res = spawnSync('bash', [ajaSiirtaja, 'paketoi', muodostaSiirtajaSkooppi(skooppi, a)], {
        cwd: JUURI,
        encoding: 'utf8',
      });
      if (res.stdout) process.stdout.write(res.stdout);
      if (res.stderr) process.stderr.write(res.stderr);
      return res;
    };
    let res2 = ajaPaketoi(ajaja);
    if (tarvitaankoVarareitti(res2.status, ajaja, res2.stdout || '')) {
      console.log(`VARAREITTI: agy ei käytettävissä — vaihe 5 ajajalla ${VARA_AJAJA}`);
      res2 = ajaPaketoi(VARA_AJAJA);
    }
    if (res2.status !== 0) {
      process.exit(res2.status || 1);
    }
  }

  const pakkaaLoppu = join(JUURI, 'claude/siirto/tools/pakkaa-loppu.mjs');
  if (existsSync(pakkaaLoppu)) {
    const lopullisetPolut = taydennaSkoopinMetadatat(skooppi, loppuPolut, JUURI);
    const loppuArgs = [
      skooppi,
      '-m', viesti,
      ...lopullisetPolut,
      '--vaihe2', 'ok',
    ];
    if (vahvistettu || onAutopack) loppuArgs.push('--vahvistettu');
    if (vaihda) loppuArgs.push('--vaihda');
    if (coAuthor) loppuArgs.push('--co-author', coAuthor);

    const res3 = spawnSync('node', [pakkaaLoppu, ...loppuArgs], {
      cwd: JUURI,
      encoding: 'utf8',
    });
    if (res3.stdout) process.stdout.write(res3.stdout);
    if (res3.stderr) process.stderr.write(res3.stderr);
    if (res3.status !== 0) {
      process.exit(res3.status || 1);
    }
  }

  console.log('Pakkaus valmis onnistuneesti.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`Pakkauksen odottamaton virhe: ${e.message}`);
    process.exit(1);
  });
}
