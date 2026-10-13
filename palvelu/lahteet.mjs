// Skooppien lukulähteet (DEMO-SCOPES-PALVELU 13.10.2026): skooppilista, rekisterin jäsennys ja elävien
// Claude-istuntojen kontekstikoko. Vain luku: mikään funktio ei kirjoita levylle.
//
// Lähteet (kaikki polut tulevat kutsujalta tai ympäristöstä, ei koneen kiinteitä polkuja):
//   juuri/claude/siirto/state/skoopit.json   skooppi → rekisteritiedostot (ensimmäinen on päärekisteri)
//   istunnot/<pid>.json                      Claude Coden elävät istunnot (sessionId, name, cwd, procStart)
//   projektit/<cwd, jossa / _ . → ->/<id>.jsonl   istunnon transkripti (konteksti ja /pura-argumentti)

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// "SEURAAVA PAKETTI[ [tunniste]]: ID — kuvaus — polut: … — aloitus: …" → { id, kuvaus, polut, aloitus, teksti }.
export function jasennaSeuraava(teksti) {
  const osat = teksti.split(' — ');
  const tulos = { id: osat[0].trim(), kuvaus: '', polut: [], aloitus: null, teksti };
  const kuvaus = [];
  for (const osa of osat.slice(1)) {
    if (osa.startsWith('polut:')) tulos.polut = osa.slice(6).split(',').map((p) => p.trim()).filter(Boolean);
    else if (osa.startsWith('aloitus:')) tulos.aloitus = osa.slice(8).trim();
    else if (!/^automaattinen:/.test(osa)) kuvaus.push(osa);
  }
  tulos.kuvaus = kuvaus.join(' — ');
  if (/^ei mitään$/i.test(tulos.id)) tulos.id = null;
  return tulos;
}

// Rekisterin SEURAAVA PAKETTI -rivi skoopille: jaetussa rekisterissä rivit on leimattu [skooppi], muuten leimaton.
export function seuraavaRivi(rekisteri, skooppi) {
  let leimaton = null;
  for (const rivi of rekisteri.split('\n')) {
    const m = rivi.match(/^\**SEURAAVA PAKETTI(?: \[([^\]]+)\])?:\**\s*(.+)$/);
    if (!m) continue;
    if (m[1] === skooppi) return jasennaSeuraava(m[2]);
    if (!m[1] && !leimaton) leimaton = jasennaSeuraava(m[2]);
  }
  return leimaton;
}

const solut = (rivi) => rivi.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((s) => s.trim());

// Otsikon (esim. "Avoimet asiat", myös numeroitu "## 6. Avoimet asiat") alla oleva ensimmäinen markdown-taulukko
// riveinä { <otsikkosolu>: arvo }. Puuttuva luku tai taulukko → [].
export function taulukko(rekisteri, otsikko) {
  const rivit = rekisteri.split('\n');
  const alku = rivit.findIndex((r) => new RegExp(`^##\\s+(\\d+\\.\\s*)?${otsikko}\\s*$`, 'i').test(r));
  if (alku < 0) return [];
  const tulos = [];
  let avaimet = null;
  for (const rivi of rivit.slice(alku + 1)) {
    if (/^##\s/.test(rivi)) break;
    if (!rivi.trim().startsWith('|')) { if (avaimet) break; continue; }
    const s = solut(rivi);
    if (!avaimet) { avaimet = s; continue; }
    if (s.every((x) => /^:?-+:?$/.test(x))) continue;
    tulos.push(Object.fromEntries(avaimet.map((a, i) => [a, s[i] ?? ''])));
  }
  return tulos;
}

export const lueSkoopit = (juuri) =>
  JSON.parse(readFileSync(join(juuri, 'claude/siirto/state/skoopit.json'), 'utf8'));

// Claude Coden projektihakemiston nimi: cwd, jossa / _ . ovat -.
export const projektiNimi = (cwd) => cwd.replace(/[/_.]/g, '-');

// Transkriptin viimeinen pääketjun usage-rivi → { tokenit, aika } tai null (ali-agenttien sidechain-rivit ohitetaan).
export function konteksti(transkripti) {
  const rivit = transkripti.split('\n');
  for (let i = rivit.length - 1; i >= 0; i--) {
    let j;
    try { j = JSON.parse(rivit[i]); } catch { continue; }
    const u = j?.message?.usage;
    if (!u || j.isSidechain) continue;
    return {
      tokenit: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0),
      aika: j.timestamp ?? null,
    };
  }
  return null;
}

// Viimeisin kohta, jossa agentti pysähtyi käyttäjän varaan (DEMO-SCOPES-LISTA 13.10.2026): vuoro päättyi tai agentti
// kysyi monivalinnalla (AskUserQuestion). Työn aikaiset välivaiheet eivät nosta keskustelua listan huipulle.
const LOPPU = new Set(['end_turn', 'stop_sequence', 'max_tokens']);
export function pysahdys(transkripti) {
  const rivit = transkripti.split('\n');
  for (let i = rivit.length - 1; i >= 0; i--) {
    let j;
    try { j = JSON.parse(rivit[i]); } catch { continue; }
    if (j.type !== 'assistant' || j.isSidechain || !j.timestamp) continue;
    const kysyy = Array.isArray(j.message?.content) && j.message.content.some((o) => o?.type === 'tool_use' && o.name === 'AskUserQuestion');
    if (kysyy || LOPPU.has(j.message?.stop_reason)) return j.timestamp;
  }
  return null;
}

// Istunnon skooppi: nimi, joka on skooppi, tai transkriptin viimeisin /pura-argumentti ("uusi" ja --liput pois).
// Transkriptin JSON-rivillä rivinvaihto on kirjoitettu merkeillä \n, joten väli hyväksyy molemmat.
export function istunnonSkooppi(nimi, transkripti, skooppiNimet) {
  if (skooppiNimet.includes(nimi)) return nimi;
  let viimeisin = null;
  for (const m of transkripti.matchAll(/<command-name>\/pura<\/command-name>(?:\s|\\n)*<command-args>([^<]*)<\/command-args>/g)) viimeisin = m[1];
  if (viimeisin === null) return null;
  const arg = viimeisin.replace(/\s--\S+/g, '').replace(/^\s*uusi\s+/, '').split(' — ')[0].trim();
  return skooppiNimet.includes(arg) ? arg : null;
}

// Elääkö pid samana prosessina: /proc/<pid>/stat kenttä 22 = procStart (kierrätetty pid ei kelpaa).
// Elossa → vanhemman pid (kenttä 4), muuten null.
function elossa(pid, procStart, proc) {
  try {
    const stat = readFileSync(join(proc, String(pid), 'stat'), 'utf8');
    const kentat = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
    return procStart == null || kentat[19] === String(procStart) ? Number(kentat[1]) : null;
  } catch { return null; }
}

// Elävät istunnot: [{ id, nimi, tila, skooppi, konteksti, pysahdys, pid, vanhempi, ruutu, polku }]. polku = transkripti (viestit.mjs). ruutu = tmux-ruutu (%26) tai null;
// pid, vanhempi ja ruutu ovat hallintatoimintoja varten (toiminnot.mjs: /pakkaa oikeaan ruutuun).
export function istunnot({ istunnotDir, projektitDir, skooppiNimet, proc = '/proc' }) {
  if (!existsSync(istunnotDir)) return [];
  const tulos = [];
  for (const tiedosto of readdirSync(istunnotDir).filter((f) => /^\d+\.json$/.test(f))) {
    let s;
    try { s = JSON.parse(readFileSync(join(istunnotDir, tiedosto), 'utf8')); } catch { continue; }
    const vanhempi = s.sessionId ? elossa(s.pid, s.procStart, proc) : null;
    if (vanhempi == null) continue;
    const polku = join(projektitDir, projektiNimi(s.cwd ?? ''), `${s.sessionId}.jsonl`);
    let transkripti = '';
    try { transkripti = readFileSync(polku, 'utf8'); } catch { /* uusi istunto ilman transkriptia */ }
    tulos.push({
      id: s.sessionId,
      nimi: s.name ?? null,
      tila: s.status ?? null,
      skooppi: istunnonSkooppi(s.name ?? '', transkripti, skooppiNimet),
      konteksti: konteksti(transkripti),
      pysahdys: pysahdys(transkripti),
      pid: s.pid,
      vanhempi,
      // Remote Controlin SDK-ajo (entrypoint sdk-cli) perii daemonin tmux-ruudun, joten ruutu vain CLI-istunnoille.
      ruutu: (s.entrypoint ?? 'cli') === 'cli' ? /\.(%\d+)$/.exec(s.tmux ?? '')?.[1] ?? null : null,
      polku,
    });
  }
  return tulos;
}

// Yhden skoopin näkymä: rekisteri jäsennettynä ja skoopin istunnot.
export function skooppi(nimi, { juuri, skoopit, kaikkiIstunnot }) {
  const rekisterit = skoopit[nimi];
  if (!rekisterit) return null;
  let teksti = '';
  try { teksti = readFileSync(join(juuri, rekisterit[0]), 'utf8'); } catch { /* puuttuva rekisteri näkyy tyhjänä */ }
  return {
    nimi,
    rekisterit,
    seuraava: seuraavaRivi(teksti, nimi),
    avoimet: taulukko(teksti, 'Avoimet asiat'),
    viat: taulukko(teksti, 'Viat'),
    istunnot: kaikkiIstunnot.filter((i) => i.skooppi === nimi),
  };
}

// Skoopin viimeisin muutos (ISO): rekisterin muokkaus tai istunnon viimeisin pysähdys (valmis vuoro tai kysymys),
// kumpi uudempi. Äpin sivupalkki järjestää skoopit ja chatit tällä yhdeksi listaksi.
function viimeisinMuutos(juuri, rekisteri, istunnot) {
  let ms = 0;
  try { ms = statSync(join(juuri, rekisteri)).mtimeMs; } catch { /* puuttuva rekisteri */ }
  for (const i of istunnot) ms = Math.max(ms, Date.parse(i.pysahdys ?? '') || 0);
  return ms ? new Date(ms).toISOString() : null;
}

// Skooppilista tiivistettynä: nimi, seuraava paketti, avoimien ja vikojen määrä, istuntojen suurin konteksti, aika.
export function lista(asetukset) {
  const skoopit = lueSkoopit(asetukset.juuri);
  const kaikkiIstunnot = istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) });
  return Object.keys(skoopit).map((nimi) => {
    const s = skooppi(nimi, { juuri: asetukset.juuri, skoopit, kaikkiIstunnot });
    const tokenit = s.istunnot.map((i) => i.konteksti?.tokenit ?? 0);
    return {
      nimi,
      seuraava: s.seuraava?.id ?? null,
      avoimia: s.avoimet.filter((r) => !/^(valmis|todennettu|korjattu)$/i.test(r.Tila ?? '')).length,
      vikoja: s.viat.filter((r) => !/^(valmis|todennettu|korjattu)$/i.test(r.Tila ?? '')).length,
      istuntoja: s.istunnot.length,
      suurinKonteksti: tokenit.length ? Math.max(...tokenit) : null,
      aika: viimeisinMuutos(asetukset.juuri, skoopit[nimi][0], s.istunnot),
    };
  });
}

export function yksi(nimi, asetukset) {
  const skoopit = lueSkoopit(asetukset.juuri);
  const kaikkiIstunnot = istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) });
  return skooppi(nimi, { juuri: asetukset.juuri, skoopit, kaikkiIstunnot });
}
