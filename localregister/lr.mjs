// Rekisterien kaksoiskappale yksiköinä (LOCALREGISTER-KAKSOIS 14.10.2026, MUOTO.md §2–§4 ja §7).
//
// Tuonti pilkkoo gitin HEAD:n rekisteritiedostot (REKISTERI.md, HISTORIA.md, ARKISTO.md; käyttäjä 14.10.2026:
// kaikki 78) riviyksiköiksi gitin ulkopuoliseen hakemistoon. Pilkonta on häviötön: jokaisen yksikön `sisalto`
// on lähteen raaka teksti perässä olevine tyhjine riveineen, ja `tulosta` liittää ne järjestysavaimen
// mukaan takaisin. `testaa` on edestakaistesti: tulostus verrataan tuonnin lähdecommitin sisältöön.
//
//   node scopes/localregister/lr.mjs tuo [--juuri DIR] [--laite oneplus]
//   node scopes/localregister/lr.mjs testaa [--juuri DIR]
//   node scopes/localregister/lr.mjs tiiviste [--juuri DIR]
//   node scopes/localregister/lr.mjs tulosta <rekisteripolku> [--juuri DIR]
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const OLETUSJUURI = join(homedir(), '.local/share/localregister');
export const REKISTERITIEDOSTO = /(^|\/)(REKISTERI|HISTORIA|ARKISTO)\.md$/;

const OSIOLAJI = { 'Päätökset': 'paatos', 'Avoimet asiat': 'avoin', 'Viat': 'vika', 'Tarkoitus ja raja': 'tarkoitus' };

// ---- Järjestysavaimet (MUOTO §2): merkkijonot, joiden väliin mahtuu aina uusi -------------------------

const D = '0123456789abcdefghijklmnopqrstuvwxyz';

// Avain a < k < b leksikografisesti; a = '' alku, b = null loppu. Avaimet eivät pääty nollaan.
export function valiin(a = '', b = null) {
  if (b !== null && a >= b) throw new Error(`valiin: ${a} >= ${b}`);
  if (b !== null) {
    let n = 0;
    while ((a[n] || '0') === b[n]) n++;
    if (n > 0) return b.slice(0, n) + valiin(a.slice(n), b.slice(n));
  }
  const da = a ? D.indexOf(a[0]) : 0;
  const db = b !== null ? D.indexOf(b[0]) : D.length;
  if (db - da > 1) return D[Math.round((da + db) / 2)];
  if (b !== null && b.length > 1) return b.slice(0, 1);
  return D[da] + valiin(a.slice(1), null);
}

// n tasavälistä avainta tyhjään rekisteriin; kiinteä leveys, perässä olevat nollat pois (järjestys säilyy).
export function avaimet(n) {
  const lev = Math.max(2, Math.ceil(Math.log(n + 2) / Math.log(36)) + 1);
  const tila = 36 ** lev;
  return Array.from({ length: n }, (_, i) =>
    Math.floor(((i + 1) * tila) / (n + 1)).toString(36).padStart(lev, '0').replace(/0+$/, ''));
}

// ---- Pilkonta (MUOTO §1: yksikkö = rivi) ------------------------------------------------------------

const LISTA = /^ {0,3}([-*+]|\d+[.)])\s/;
const OTSIKKO = /^#{1,6}\s/;
const AITA = /^ {0,3}(```|~~~)/;
const TYHJA = /^\s*$/;

// Palauttaa [{ laji, osio, sisalto }]; sisalto-kenttien liitos on täsmälleen teksti.
export function pilko(teksti) {
  const rivit = teksti.match(/[^\n]*\n|[^\n]+$/g) || [];
  const osat = [];
  let osio = '';
  let i = 0;
  const lisaa = (laji, alku, loppu) => {
    while (loppu < rivit.length && TYHJA.test(rivit[loppu])) loppu++;
    osat.push({ laji, osio, sisalto: rivit.slice(alku, loppu).join('') });
    return loppu;
  };
  const alkaaLohkon = (r) => OTSIKKO.test(r) || AITA.test(r) || r.startsWith('|') || LISTA.test(r) || TYHJA.test(r);
  while (i < rivit.length) {
    const r = rivit[i];
    if (TYHJA.test(r)) { i = lisaa('tyhja', i, i + 1); continue; }
    if (AITA.test(r)) {
      const merkki = r.trim().slice(0, 3);
      let j = i + 1;
      while (j < rivit.length && !rivit[j].trim().startsWith(merkki)) j++;
      i = lisaa('koodi', i, Math.min(j + 1, rivit.length));
      continue;
    }
    if (OTSIKKO.test(r)) {
      if (/^#{2,6}\s/.test(r)) osio = r.replace(/^#+\s+/, '').trim();
      i = lisaa(r.startsWith('# ') ? 'otsikko' : 'osio', i, i + 1);
      continue;
    }
    if (r.startsWith('SEURAAVA PAKETTI')) { i = lisaa('seuraava', i, i + 1); continue; }
    if (r.startsWith('Tilanne:')) { i = lisaa('tilanne', i, i + 1); continue; }
    if (r.startsWith('|')) {
      if (i + 1 < rivit.length && /^\|\s*:?-{2,}/.test(rivit[i + 1])) { i = lisaa('taulukko-otsake', i, i + 2); continue; }
      i = lisaa(OSIOLAJI[osio] || 'taulukkorivi', i, i + 1);
      continue;
    }
    if (LISTA.test(r)) {
      let j = i + 1;
      while (j < rivit.length && !TYHJA.test(rivit[j]) && (/^\s/.test(rivit[j]) || !alkaaLohkon(rivit[j]))) j++;
      i = lisaa(OSIOLAJI[osio] || 'alkio', i, j);
      continue;
    }
    let j = i + 1;
    while (j < rivit.length && !alkaaLohkon(rivit[j]) && !rivit[j].startsWith('SEURAAVA PAKETTI')) j++;
    i = lisaa(osio === 'Tarkoitus ja raja' ? 'tarkoitus' : 'kappale', i, j);
  }
  return osat;
}

// ---- Varasto ---------------------------------------------------------------------------------------

const lueJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const kirjoitaJson = (p, o) => writeFileSync(p, JSON.stringify(o, null, 1) + '\n');
const rekisterihakemisto = (juuri, polku) => join(juuri, 'rekisterit', polku);

export function luoLaite(juuri, nimi) {
  mkdirSync(juuri, { recursive: true });
  const p = join(juuri, 'laite.json');
  if (!existsSync(p)) kirjoitaJson(p, { laite: nimi, laskuri: 0 });
  const laite = lueJson(p);
  return {
    nimi: laite.laite,
    seuraava() { laite.laskuri += 1; return laite.laskuri; },
    tallenna() { kirjoitaJson(p, laite); },
  };
}

// Tuo yhden rekisterin tekstistä. Kieltäytyy, jos rekisteri on jo tuotu (uudelleentuonti on oma vaiheensa).
export function tuoRekisteri(juuri, laite, polku, teksti, lahde, nyt = new Date().toISOString()) {
  const hak = rekisterihakemisto(juuri, polku);
  if (existsSync(join(hak, '_meta.json'))) throw new Error(`jo tuotu: ${polku}`);
  mkdirSync(hak, { recursive: true });
  const osat = pilko(teksti);
  const jarj = avaimet(osat.length);
  osat.forEach((o, k) => {
    const n = laite.seuraava();
    const id = `${laite.nimi}-${String(n).padStart(6, '0')}`;
    kirjoitaJson(join(hak, `${id}.json`), {
      id, rekisteri: polku, laji: o.laji, osio: o.osio, jarjestys: jarj[k], sisalto: o.sisalto,
      versio: { [laite.nimi]: n }, muutettu: nyt, muuttaja: laite.nimi, poistettu: false,
    });
  });
  kirjoitaJson(join(hak, '_meta.json'), {
    rekisteri: polku, versio: { [laite.nimi]: laite.seuraava() }, poistettu: false,
    lahde: { ...lahde, sha256: createHash('sha256').update(teksti).digest('hex') },
  });
  return osat.length;
}

export function lueYksikot(juuri, polku) {
  const hak = rekisterihakemisto(juuri, polku);
  return readdirSync(hak).filter((f) => f.endsWith('.json') && f !== '_meta.json').map((f) => lueJson(join(hak, f)));
}

export function tulosta(juuri, polku) {
  return lueYksikot(juuri, polku).filter((y) => !y.poistettu)
    .sort((a, b) => (a.jarjestys < b.jarjestys ? -1 : a.jarjestys > b.jarjestys ? 1 : 0))
    .map((y) => y.sisalto).join('');
}

export function rekisterit(juuri) {
  const ulos = [];
  const kay = (hak, suht) => {
    if (!existsSync(hak)) return;
    if (existsSync(join(hak, '_meta.json'))) { ulos.push(suht); return; }
    for (const f of readdirSync(hak, { withFileTypes: true })) if (f.isDirectory()) kay(join(hak, f.name), suht ? `${suht}/${f.name}` : f.name);
  };
  kay(join(juuri, 'rekisterit'), '');
  return ulos.sort();
}

// ---- Tiivisteet (MUOTO §5) -------------------------------------------------------------------------

const vektori = (v) => Object.keys(v).sort().map((k) => `${k}=${v[k]}`).join(',');
const sha = (s) => createHash('sha256').update(s).digest('hex');

export function tiivisteet(juuri) {
  const rek = {};
  for (const polku of rekisterit(juuri)) {
    const meta = lueJson(join(rekisterihakemisto(juuri, polku), '_meta.json'));
    const rivit = lueYksikot(juuri, polku).map((y) => `${y.id}:${vektori(y.versio)}`).sort();
    rek[polku] = sha([`_meta:${vektori(meta.versio)}`, ...rivit].join('\n'));
  }
  return { juuri: sha(Object.keys(rek).sort().map((p) => `${p}:${rek[p]}`).join('\n')), rekisterit: rek };
}

// ---- Komentorivi -----------------------------------------------------------------------------------

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 << 20 });

function main(argv) {
  const [komento, ...loput] = argv;
  const lippu = (n, oletus) => { const k = loput.indexOf(n); return k >= 0 ? loput[k + 1] : oletus; };
  const juuri = lippu('--juuri', OLETUSJUURI);
  if (komento === 'tuo') {
    const laite = luoLaite(juuri, lippu('--laite', 'oneplus'));
    const commit = git('rev-parse', 'HEAD').trim();
    const polut = git('ls-tree', '-r', '--name-only', commit).split('\n').filter((p) => REKISTERITIEDOSTO.test(p));
    let yks = 0;
    try {
      for (const p of polut) yks += tuoRekisteri(juuri, laite, p, git('show', `${commit}:${p}`), { commit });
    } finally { laite.tallenna(); }
    console.log(`TUOTU: ${polut.length} rekisteriä, ${yks} yksikköä, commit ${commit.slice(0, 8)} → ${juuri}`);
    return 0;
  }
  if (komento === 'testaa') {
    const polut = rekisterit(juuri);
    const erot = [];
    let muuttunut = 0;
    for (const p of polut) {
      const meta = lueJson(join(rekisterihakemisto(juuri, p), '_meta.json'));
      if (tulosta(juuri, p) !== git('show', `${meta.lahde.commit}:${p}`)) erot.push(p);
      let nyt = null;
      try { nyt = git('show', `HEAD:${p}`); } catch { /* poistettu gitistä */ }
      if (nyt === null || sha(nyt) !== meta.lahde.sha256) muuttunut++;
    }
    console.log(`EDESTAKAISIN: ${polut.length - erot.length}/${polut.length} merkki merkiltä; lähde muuttunut HEADissa ${muuttunut}`);
    for (const p of erot) console.log(`EROAA: ${p}`);
    return erot.length ? 1 : 0;
  }
  if (komento === 'tiiviste') {
    const t = tiivisteet(juuri);
    console.log(`JUURI: ${t.juuri} (${Object.keys(t.rekisterit).length} rekisteriä)`);
    return 0;
  }
  if (komento === 'tulosta') { process.stdout.write(tulosta(juuri, loput[0])); return 0; }
  console.error('käyttö: lr.mjs tuo|testaa|tiiviste|tulosta <polku> [--juuri DIR] [--laite NIMI]');
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
