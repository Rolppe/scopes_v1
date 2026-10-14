// Rekisterien kaksoiskappale yksiköinä (LOCALREGISTER-KAKSOIS 14.10.2026, MUOTO.md §2–§4 ja §7).
//
// Tuonti pilkkoo gitin HEAD:n rekisteritiedostot (REKISTERI.md, HISTORIA.md, ARKISTO.md; käyttäjä 14.10.2026:
// kaikki 78) riviyksiköiksi gitin ulkopuoliseen hakemistoon. Pilkonta on häviötön: jokaisen yksikön `sisalto`
// on lähteen raaka teksti perässä olevine tyhjine riveineen, ja `tulosta` liittää ne järjestysavaimen
// mukaan takaisin. `testaa` on edestakaistesti: tulostus verrataan tuonnin lähdecommitin sisältöön.
//
//   node scopes/localregister/lr.mjs tuo [--juuri DIR] [--laite oneplus]   (uudelleen ajettuna: uudelleentuonti)
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
//
// Yksikkö muistaa gitin puolen erikseen: `lahdeSisalto` on viimeksi gitistä tuotu teksti (null = ei gitissä)
// ja `lahdeVersio` versio sillä hetkellä. Kun versio ≠ lahdeVersio, joku muu laite (äppi) on muuttanut
// yksikköä, ja saman rivin git-muutos on silloin ristiriita eikä ylikirjoitus (K4).

const lueJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const kirjoitaJson = (p, o) => writeFileSync(p, JSON.stringify(o, null, 1) + '\n');
const rekisterihakemisto = (juuri, polku) => join(juuri, 'rekisterit', polku);
const jarjestyksessa = (ys) => ys.sort((a, b) => (a.jarjestys < b.jarjestys ? -1 : a.jarjestys > b.jarjestys ? 1 : a.id < b.id ? -1 : 1));
// Asiakkaan antama rekisteripolku: vain rekisteritiedostot, ei '..'-osia eikä absoluuttista polkua.
export const kelpoPolku = (p) => typeof p === 'string' && REKISTERITIEDOSTO.test(p) && !p.startsWith('/') && !p.split('/').some((o) => o === '..' || o === '.' || o === '');
const tarkistaPolku = (p) => { if (!kelpoPolku(p)) throw new Error(`virheellinen rekisteripolku: ${p}`); return p; };
const vektori = (v) => Object.keys(v).sort().map((k) => `${k}=${v[k]}`).join(',');

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

// Versioiden vertailu (MUOTO §3): 'sama' | 'uudempi' (a > b) | 'vanhempi' | 'rinnakkainen'.
export function vertaa(a, b) {
  let suurempi = false, pienempi = false;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k] ?? 0, y = b[k] ?? 0;
    if (x > y) suurempi = true;
    if (x < y) pienempi = true;
  }
  return suurempi && pienempi ? 'rinnakkainen' : suurempi ? 'uudempi' : pienempi ? 'vanhempi' : 'sama';
}

const uusiYksikko = (laite, polku, o, jarjestys, nyt) => {
  const n = laite.seuraava();
  const versio = { [laite.nimi]: n };
  return {
    id: `${laite.nimi}-${String(n).padStart(6, '0')}`, rekisteri: polku, laji: o.laji, osio: o.osio, jarjestys,
    sisalto: o.sisalto, versio, muutettu: nyt, muuttaja: laite.nimi, poistettu: false,
    lahdeSisalto: o.sisalto, lahdeVersio: versio,
  };
};

// Tuo yhden rekisterin tekstistä. Kieltäytyy, jos rekisteri on jo tuotu (silloin uudelleentuo).
export function tuoRekisteri(juuri, laite, polku, teksti, lahde, nyt = new Date().toISOString()) {
  const hak = rekisterihakemisto(juuri, polku);
  if (existsSync(join(hak, '_meta.json'))) throw new Error(`jo tuotu: ${polku}`);
  mkdirSync(hak, { recursive: true });
  const osat = pilko(teksti);
  const jarj = avaimet(osat.length);
  osat.forEach((o, k) => { const y = uusiYksikko(laite, polku, o, jarj[k], nyt); kirjoitaJson(join(hak, `${y.id}.json`), y); });
  kirjoitaJson(join(hak, '_meta.json'), {
    rekisteri: polku, versio: { [laite.nimi]: laite.seuraava() }, poistettu: false,
    lahde: { ...lahde, sha256: createHash('sha256').update(teksti).digest('hex') },
  });
  return osat.length;
}

// Uudelleentuonti (LOCALREGISTER-UUDELLEENTUONTI, MUOTO §7 kohta 3): git-puolen muutos on tämän laitteen
// muutos. Gitin edellinen ja uusi sisältö kohdistetaan pisimmällä yhteisellä osajonolla `lahdeSisalto`-
// kentän mukaan (muiden laitteiden luomat yksiköt eivät ole gitissä eivätkä osallistu): osuma pitää
// tunnuksensa, osumattomien välien vanhat ja uudet paritetaan järjestyksessä (muokattu rivi = sama tunnus),
// ylijääneet vanhat poistuvat ja uudet saavat avaimen naapuriensa väliin. Jos muu laite on muuttanut
// yksikköä, gitin muutos tallentuu rinnakkaiseksi versioksi ja ristiriita kysytään käyttäjältä (K4).
export function uudelleentuo(juuri, laite, polku, teksti, lahde, nyt = new Date().toISOString()) {
  const hak = rekisterihakemisto(juuri, polku);
  const meta = lueJson(join(hak, '_meta.json'));
  const tulos = { sama: 0, muuttunut: 0, uusi: 0, poistettu: 0, ristiriita: 0 };
  const shaUusi = createHash('sha256').update(teksti).digest('hex');
  if (meta.lahde?.sha256 === shaUusi && !meta.poistettu) { tulos.sama = -1; return tulos; }
  const vanhat = jarjestyksessa(lueYksikot(juuri, polku).filter((y) => y.lahdeSisalto != null));
  const uudet = pilko(teksti);
  const tallenna = (y) => kirjoitaJson(join(hak, `${y.id}.json`), y);
  // Gitin muutos yksikköön y: suoraan, jos kukaan muu ei ole koskenut siihen; muuten rinnakkaiseksi.
  const gitMuutos = (y, muutos) => {
    const versio = { ...y.lahdeVersio, [laite.nimi]: laite.seuraava() };
    if (vertaa(y.versio, y.lahdeVersio) === 'sama') {
      Object.assign(y, muutos, { versio, muutettu: nyt, muuttaja: laite.nimi });
    } else {
      const sisar = { sisalto: muutos.sisalto ?? y.sisalto, poistettu: muutos.poistettu ?? false, versio, muutettu: nyt, muuttaja: laite.nimi };
      y.rinnakkaiset = [...(y.rinnakkaiset ?? []), sisar];
      tulos.ristiriita++;
    }
    y.lahdeSisalto = muutos.poistettu ? null : (muutos.sisalto ?? y.lahdeSisalto);
    y.lahdeVersio = versio;
    tallenna(y);
  };
  // LCS gitin edellisen sisällön mukaan; yhteinen alku ja loppu ensin, jotta taulukko pysyy pienenä.
  const n = vanhat.length, m = uudet.length;
  const sama = (i, j) => vanhat[i].lahdeSisalto === uudet[j].sisalto;
  let a = 0;
  while (a < n && a < m && sama(a, a)) a++;
  let b = 0;
  while (b < n - a && b < m - a && sama(n - 1 - b, m - 1 - b)) b++;
  const N = n - a - b, M = m - a - b;
  const L = Array.from({ length: N + 1 }, () => new Int32Array(M + 1));
  for (let i = N - 1; i >= 0; i--) for (let j = M - 1; j >= 0; j--)
    L[i][j] = sama(a + i, a + j) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const parit = []; // [vanha-indeksi | null, uusi-indeksi | null]
  for (let k = 0; k < a; k++) parit.push([k, k]);
  let i = 0, j = 0, ov = [], ou = [];
  const tyhjenna = () => {
    const k = Math.min(ov.length, ou.length);
    for (let t = 0; t < k; t++) parit.push([ov[t], ou[t]]);
    for (const v of ov.slice(k)) parit.push([v, null]);
    for (const u of ou.slice(k)) parit.push([null, u]);
    ov = []; ou = [];
  };
  while (i < N || j < M) {
    if (i < N && j < M && sama(a + i, a + j)) { tyhjenna(); parit.push([a + i, a + j]); i++; j++; }
    else if (j >= M || (i < N && L[i + 1][j] >= L[i][j + 1])) ov.push(a + i++);
    else ou.push(a + j++);
  }
  tyhjenna();
  for (let k = 0; k < b; k++) parit.push([n - b + k, m - b + k]);
  // Avaimet: säilyneiden järjestys on ennallaan; uudet saavat avaimen edellisen ja seuraavan säilyneen väliin.
  let edellinen = '';
  parit.forEach(([v, u], k) => {
    if (v !== null && u === null) { gitMuutos(vanhat[v], { poistettu: true }); tulos.poistettu++; return; }
    if (v !== null) {
      const y = vanhat[v], o = uudet[u];
      if (y.lahdeSisalto !== o.sisalto) { gitMuutos(y, { sisalto: o.sisalto, laji: o.laji, osio: o.osio }); tulos.muuttunut++; }
      else if (y.laji !== o.laji || y.osio !== o.osio) { Object.assign(y, { laji: o.laji, osio: o.osio }); tallenna(y); tulos.sama++; }
      else tulos.sama++;
      edellinen = y.jarjestys;
      return;
    }
    const seur = parit.slice(k + 1).find(([sv, su]) => sv !== null && su !== null);
    const yla = seur ? vanhat[seur[0]].jarjestys : null;
    edellinen = valiin(edellinen, yla !== null && yla <= edellinen ? null : yla);
    const y = uusiYksikko(laite, polku, uudet[u], edellinen, nyt);
    tallenna(y);
    tulos.uusi++;
  });
  if (meta.poistettu) meta.versio = { ...meta.versio, [laite.nimi]: laite.seuraava() };
  meta.poistettu = false;
  meta.lahde = { ...lahde, sha256: shaUusi };
  kirjoitaJson(join(hak, '_meta.json'), meta);
  return tulos;
}

// Gitistä poistunut rekisteri saa hautakiven (MUOTO §4); yksiköt jäävät ennalleen.
export function poistaRekisteri(juuri, laite, polku) {
  const p = join(rekisterihakemisto(juuri, polku), '_meta.json');
  const meta = lueJson(p);
  if (meta.poistettu) return false;
  meta.poistettu = true;
  meta.versio = { ...meta.versio, [laite.nimi]: laite.seuraava() };
  kirjoitaJson(p, meta);
  return true;
}

export function lueYksikot(juuri, polku) {
  const hak = rekisterihakemisto(juuri, polku);
  return readdirSync(hak).filter((f) => f.endsWith('.json') && f !== '_meta.json').map((f) => lueJson(join(hak, f)));
}

export const lueMeta = (juuri, polku) => lueJson(join(rekisterihakemisto(juuri, polku), '_meta.json'));

// Rekisteri tekstinä. `lahde: true` tulostaa gitin puolen (edestakaistesti), muuten yhteisen nykytilan.
export function tulosta(juuri, polku, { lahde = false } = {}) {
  const ys = jarjestyksessa(lueYksikot(juuri, polku));
  return lahde
    ? ys.filter((y) => y.lahdeSisalto != null).map((y) => y.lahdeSisalto).join('')
    : ys.filter((y) => !y.poistettu).map((y) => y.sisalto).join('');
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

// ---- Synkka (MUOTO §3–§5) --------------------------------------------------------------------------

const sha = (s) => createHash('sha256').update(s).digest('hex');
const tiivisteRivi = (y) => `${y.id}:${vektori(y.versio)}${(y.rinnakkaiset ?? []).map((r) => `|${vektori(r.versio)}`).join('')}`;

export function rekisterinTiiviste(juuri, polku) {
  const rivit = lueYksikot(juuri, polku).map(tiivisteRivi).sort();
  return sha([`_meta:${vektori(lueMeta(juuri, polku).versio)}`, ...rivit].join('\n'));
}

// `valimuisti` (polku → tiiviste) säästää levyluvut muuttumattomilta rekistereiltä; kutsuja tyhjentää muuttuneet.
export function tiivisteet(juuri, valimuisti = new Map()) {
  const rek = {};
  for (const polku of rekisterit(juuri)) {
    if (!valimuisti.has(polku)) valimuisti.set(polku, rekisterinTiiviste(juuri, polku));
    rek[polku] = valimuisti.get(polku);
  }
  return { juuri: sha(Object.keys(rek).sort().map((p) => `${p}:${rek[p]}`).join('\n')), rekisterit: rek };
}

// Vertailun toinen taso: rekisterin meta ja yksiköiden (id, versio) -lista.
export function lista(juuri, polku) {
  tarkistaPolku(polku);
  return {
    meta: lueMeta(juuri, polku),
    yksikot: lueYksikot(juuri, polku).map((y) => ({ id: y.id, versio: y.versio, rinnakkaiset: (y.rinnakkaiset ?? []).map((r) => r.versio) })),
  };
}

// Toisen laitteen lähettämät yksiköt (MUOTO §3): uudempi korvaa, vanhempi ohitetaan, rinnakkainen tallentuu
// `rinnakkaiset`-listaan ristiriidaksi. Lähetetty yksikkö, joka on uudempi kuin paikallinen ja kaikki sen
// rinnakkaiset, on ratkaisu: ristiriita poistuu. Gitin puolen kentät (`lahde*`) pysyvät paikallisina.
export function vastaanota(juuri, { metat = [], yksikot = [] }) {
  const tulos = { otettu: 0, ohitettu: 0, ristiriidat: [], muuttuneet: new Set() };
  for (const m of metat) {
    const hak = rekisterihakemisto(juuri, tarkistaPolku(m.rekisteri));
    const p = join(hak, '_meta.json');
    if (!existsSync(p)) { mkdirSync(hak, { recursive: true }); kirjoitaJson(p, { ...m, lahde: null }); tulos.muuttuneet.add(m.rekisteri); continue; }
    const oma = lueJson(p);
    if (vertaa(m.versio, oma.versio) === 'uudempi') { kirjoitaJson(p, { ...oma, versio: m.versio, poistettu: m.poistettu }); tulos.muuttuneet.add(m.rekisteri); }
  }
  for (const tullut of yksikot) {
    const hak = rekisterihakemisto(juuri, tarkistaPolku(tullut.rekisteri));
    if (!existsSync(join(hak, '_meta.json'))) throw new Error(`tuntematon rekisteri: ${tullut.rekisteri}`);
    if (!/^[a-z0-9]+-\d+$/.test(tullut.id)) throw new Error(`virheellinen tunnus: ${tullut.id}`);
    const p = join(hak, `${tullut.id}.json`);
    const { lahdeSisalto, lahdeVersio, ...siirto } = tullut;
    if (!existsSync(p)) {
      kirjoitaJson(p, { ...siirto, lahdeSisalto: null, lahdeVersio: null });
      tulos.otettu++; tulos.muuttuneet.add(tullut.rekisteri); continue;
    }
    const oma = lueJson(p);
    const suhde = vertaa(siirto.versio, oma.versio);
    if (suhde === 'uudempi') {
      const jaljella = (oma.rinnakkaiset ?? []).filter((r) => vertaa(siirto.versio, r.versio) !== 'uudempi');
      const uusi = { ...oma, ...siirto, lahdeSisalto: oma.lahdeSisalto, lahdeVersio: oma.lahdeVersio };
      if (jaljella.length) uusi.rinnakkaiset = jaljella; else delete uusi.rinnakkaiset;
      kirjoitaJson(p, uusi);
      tulos.otettu++; tulos.muuttuneet.add(tullut.rekisteri);
      if (jaljella.length) tulos.ristiriidat.push(tullut.id);
    } else if (suhde === 'rinnakkainen' && !(oma.rinnakkaiset ?? []).some((r) => vertaa(r.versio, siirto.versio) !== 'vanhempi')) {
      const sisar = { sisalto: siirto.sisalto, poistettu: siirto.poistettu, versio: siirto.versio, muutettu: siirto.muutettu, muuttaja: siirto.muuttaja };
      kirjoitaJson(p, { ...oma, rinnakkaiset: [...(oma.rinnakkaiset ?? []), sisar] });
      tulos.ristiriidat.push(tullut.id); tulos.muuttuneet.add(tullut.rekisteri);
    } else tulos.ohitettu++;
  }
  return tulos;
}

export function ristiriidat(juuri) {
  return rekisterit(juuri).flatMap((p) => lueYksikot(juuri, p).filter((y) => y.rinnakkaiset?.length));
}

export function hae(juuri, polku, idt) {
  const hak = rekisterihakemisto(juuri, tarkistaPolku(polku));
  return idt.filter((id) => /^[a-z0-9]+-\d+$/.test(id) && existsSync(join(hak, `${id}.json`))).map((id) => lueJson(join(hak, `${id}.json`)));
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
    const olemassa = new Set(rekisterit(juuri));
    const s = { uusiaRek: 0, yksikoita: 0, sama: 0, muuttunut: 0, uusi: 0, poistettu: 0, ristiriita: 0, muuttumattomia: 0, poistettujaRek: 0 };
    try {
      for (const p of polut) {
        const teksti = git('show', `${commit}:${p}`);
        if (!olemassa.has(p)) { s.yksikoita += tuoRekisteri(juuri, laite, p, teksti, { commit }); s.uusiaRek++; continue; }
        const t = uudelleentuo(juuri, laite, p, teksti, { commit });
        if (t.sama === -1) { s.muuttumattomia++; continue; }
        for (const k of ['sama', 'muuttunut', 'uusi', 'poistettu', 'ristiriita']) s[k] += t[k];
      }
      const gitissa = new Set(polut);
      for (const p of olemassa) if (!gitissa.has(p) && poistaRekisteri(juuri, laite, p)) s.poistettujaRek++;
    } finally { laite.tallenna(); }
    console.log(`TUOTU: commit ${commit.slice(0, 8)} → ${juuri}: uusia rekistereitä ${s.uusiaRek} (${s.yksikoita} yksikköä), `
      + `muuttumattomia ${s.muuttumattomia}, muuttuneissa yksiköitä sama ${s.sama} / muuttunut ${s.muuttunut} / uusi ${s.uusi} / `
      + `poistettu ${s.poistettu} / ristiriita ${s.ristiriita}; poistettuja rekistereitä ${s.poistettujaRek}`);
    return 0;
  }
  if (komento === 'testaa') {
    const polut = rekisterit(juuri).filter((p) => { const m = lueMeta(juuri, p); return !m.poistettu && m.lahde; });
    const erot = [];
    let muuttunut = 0;
    for (const p of polut) {
      const meta = lueMeta(juuri, p);
      if (tulosta(juuri, p, { lahde: true }) !== git('show', `${meta.lahde.commit}:${p}`)) erot.push(p);
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
