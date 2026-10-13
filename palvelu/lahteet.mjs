// Skooppien lukulähteet (DEMO-SCOPES-PALVELU 13.10.2026): skooppilista, rekisterin jäsennys ja elävien
// Claude-istuntojen kontekstikoko. Vain luku: mikään funktio ei kirjoita levylle.
//
// Lähteet (kaikki polut tulevat kutsujalta tai ympäristöstä, ei koneen kiinteitä polkuja):
//   juuri/claude/siirto/state/skoopit.json   skooppi → rekisteritiedostot (ensimmäinen on päärekisteri)
//   istunnot/<pid>.json                      Claude Coden elävät istunnot (sessionId, name, cwd, procStart)
//   projektit/<cwd, jossa / _ . → ->/<id>.jsonl   istunnon transkripti (konteksti ja /pura-argumentti)
//   juuri/<rekisterit, HISTORIA, ARKISTO>, juuri/Infra/skills/keskustelun-siirto/references, juuri/claude/TYOTAVAT.md
//                                             skoopin kontekstitiedostot (skoopinKonteksti)

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

// Onko istunto pakattu (käyttäjä 13.10.2026: pakkauksen jälkeen äppi tyhjentää skoopin keskustelun ja tarjoaa
// purun): agentin viimeinen `PAKKAUS: vahvistettu` -rivi on viimeisen käyttäjän viestin jälkeen. Työkalutulokset,
// meta-rivit, komentokääreen tulosteet ja /sa-herätykset eivät ole käyttäjän viestejä.
const EI_KAYTTAJAN = /^(<(local-command|system-reminder|task-notification)|sa-tick:|sa-uusinta:)/;
export function pakattu(transkripti) {
  let tulos = false;
  for (const rivi of transkripti.split('\n')) {
    let j;
    try { j = JSON.parse(rivi); } catch { continue; }
    if (j.isSidechain || j.isMeta) continue;
    const c = j.message?.content;
    const teksti = (typeof c === 'string' ? [c] : Array.isArray(c) ? c.filter((o) => o?.type === 'text').map((o) => o.text) : []).join('\n').trim();
    if (!teksti) continue;
    if (j.type === 'assistant' && /^[\s*`>]*PAKKAUS:[*`\s]*vahvistettu/m.test(teksti)) tulos = true;
    else if (j.type === 'user' && !EI_KAYTTAJAN.test(teksti)) tulos = false;
  }
  return tulos;
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

// Elävät istunnot: [{ id, nimi, tila, skooppi, konteksti, pysahdys, pakattu, alkoi, pid, vanhempi, ruutu, polku }]. polku = transkripti (viestit.mjs); alkoi = startedAt (ms). ruutu = tmux-ruutu (%26) tai null;
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
      pakattu: pakattu(transkripti),
      alkoi: s.startedAt ?? 0,
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

// Skoopin tila listan kansioikonia varten (SCOPES-LISTA-TILAVARIT, käyttäjä 13.10.2026): kasittely, jos jokin
// pakkaamaton istunto on busy; odottaa, jos pakkaamaton istunto odottaa käyttäjää (waiting = kysymys tai lupa,
// idle = vuoro valmis); muuten pakattu, myös ilman istuntoja. Pakatun istunnon /sa-herätys ei tee siitä käsittelyä;
// automaattisiirron uusi istunto on pakkaamaton, joten skooppi pysyy aktiivisena siirron yli.
export function skooppiTila(istunnot) {
  const auki = istunnot.filter((i) => !i.pakattu);
  if (auki.some((i) => i.tila === 'busy')) return 'kasittely';
  return auki.length ? 'odottaa' : 'pakattu';
}

// Skooppilista tiivistettynä: nimi, seuraava paketti, avoimien ja vikojen määrä, istuntojen suurin konteksti, aika, tila.
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
      tila: skooppiTila(s.istunnot),
    };
  });
}

// Skoopin konteksti (SCOPES-INFRA-KONTEKSTI 13.10.2026): kaikki tiedostot, jotka skoopin purku ja työ lataavat,
// otsikoittain osina tokeniarvioineen, sekä elävien istuntojen mitattu konteksti osa-alueittain.
// Tokenit arvioidaan merkkimäärästä, ei tokenisoijalla: 1,8 merkkiä/token on mitattu 13.10.2026 kymmenen
// työkalutuloksen (suomenkielinen markdown, Swift, JSON) usage-kasvusta, vaihteluväli 1,5–2,2.
const MERKKIA_TOKENIIN = 1.8;
export const tokeneiksi = (merkit) => Math.ceil(merkit / MERKKIA_TOKENIIN);

// Markdown `##`-otsikoittain: [{ otsikko, teksti, tokenit }]. Ensimmäistä otsikkoa edeltävä osa on "Alku";
// koodiaidan sisällä oleva otsikko ei aloita osaa. Yli ISO_OSA tokenin luku pilkotaan vielä `###`-otsikoittain
// ("Luku › Alaluku"), jotta esim. HISTORIA.md:n yksi pitkä luku ei näy yhtenä möhkäleenä.
const ISO_OSA = 3000;
function otsikoittain(teksti, taso, alkuOtsikko) {
  const osat = [];
  let nykyinen = { otsikko: alkuOtsikko, rivit: [] };
  let aidattu = false;
  const kuvio = new RegExp(`^#{${taso}}\\s+(.+?)\\s*#*\\s*$`);
  for (const rivi of teksti.split('\n')) {
    if (/^\s*(```|~~~)/.test(rivi)) aidattu = !aidattu;
    const m = !aidattu && rivi.match(kuvio);
    if (m) { osat.push(nykyinen); nykyinen = { otsikko: m[1], rivit: [rivi] }; } else nykyinen.rivit.push(rivi);
  }
  osat.push(nykyinen);
  return osat
    .map(({ otsikko, rivit }) => ({ otsikko, teksti: rivit.join('\n').trim() }))
    .filter((o) => o.teksti)
    .map((o) => ({ ...o, tokenit: tokeneiksi(o.teksti.length) }));
}

export function osiin(teksti) {
  return otsikoittain(teksti, 2, 'Alku').flatMap((o) => {
    if (o.tokenit <= ISO_OSA) return [o];
    const ala = otsikoittain(o.teksti, 3, o.otsikko);
    return ala.length > 1 ? ala.map((a, i) => (i === 0 ? a : { ...a, otsikko: `${o.otsikko} › ${a.otsikko}` })) : [o];
  });
}

// Skoopin kontekstitiedostot järjestyksessä: rekisterit (skoopit.json), päärekisterin viereiset HISTORIA.md ja
// ARKISTO.md, viitetiedosto (pisin sanaetuliite: "infra iot" → infra-iot.md, muuten infra.md) ja kaikille yhteiset.
// Vain olemassa olevat, kukin kerran.
const VIITTEET = 'Infra/skills/keskustelun-siirto/references';
export function kontekstiTiedostot(nimi, rekisterit, juuri) {
  const tulos = rekisterit.map((polku) => ({ laji: 'rekisteri', polku }));
  const hakemisto = dirname(rekisterit[0] ?? '');
  tulos.push({ laji: 'historia', polku: join(hakemisto, 'HISTORIA.md') }, { laji: 'arkisto', polku: join(hakemisto, 'ARKISTO.md') });
  const sanat = nimi.split(' ');
  for (let n = sanat.length; n > 0; n--) {
    const polku = `${VIITTEET}/${sanat.slice(0, n).join('-')}.md`;
    if (existsSync(join(juuri, polku))) { tulos.push({ laji: 'viite', polku }); break; }
  }
  tulos.push({ laji: 'yhteinen', polku: `${VIITTEET}/yhteiset.md` }, { laji: 'yhteinen', polku: 'claude/TYOTAVAT.md' });
  const nahty = new Set();
  return tulos.filter((t) => !nahty.has(t.polku) && nahty.add(t.polku) && existsSync(join(juuri, t.polku)));
}

// Istunnon konteksti osa-alueittain viimeisimmästä tiivistyksestä (compact_boundary) alkaen. Osat arvioidaan
// transkriptin tekstistä: viestit, työkalukutsut ja -tulokset, Claude Coden liitteet (CLAUDE.md ja muisti, taito- ja
// työkalulistat, muistutukset) ja viimeisin järjestelmäkehote (prompt_snapshot). Mitatusta kokonaismäärästä
// (viimeisin usage) jäävä osa on jäännös: työkalumääritykset ja agentin ajattelu, joita transkripti ei sisällä
// tekstinä. Jos arvio ylittää mitatun, osat skaalataan mitattuun.
const JARJESTELMAN = /^\s*(<(system-reminder|local-command|task-notification|command-)|sa-tick:|sa-uusinta:)/;
const KUVA_MERKKEINA = 1500 * MERKKIA_TOKENIIN;
const ISTUNNON_OSAT = [
  ['kehote', 'Järjestelmäkehote'],
  ['ohjeet', 'Ohjeet: CLAUDE.md ja muisti'],
  ['listat', 'Taito-, agentti- ja työkalulistat'],
  ['muistutukset', 'Muistutukset, komennot ja tiivistelmä'],
  ['kayttaja', 'Käyttäjän viestit'],
  ['agentti', 'Agentin vastaukset'],
  ['kutsut', 'Työkalukutsut'],
  ['tulokset', 'Työkalutulokset'],
];
// Liitteet, joilla ei ole mallille näkyvää tekstiä (tila- ja kirjanpitorivejä), ohitetaan.
const EI_MALLILLE = new Set(['prompt_snapshot', 'deferred_tools_record', 'credential_org', 'command_permissions', 'auto_mode', 'queued_command']);
const LISTAT = {
  skill_listing: (a) => a.content,
  agent_listing_delta: (a) => a.addedLines,
  deferred_tools_delta: (a) => a.addedLines,
  mcp_instructions_delta: (a) => a.addedBlocks,
};
const pituus = (x) => (typeof x === 'string' ? x.length : Array.isArray(x) ? x.reduce((s, y) => s + pituus(y), 0) : 0);
const sisaltoMerkit = (c) => (typeof c === 'string' ? c.length
  : Array.isArray(c) ? c.reduce((s, o) => s + (o?.type === 'text' ? o.text.length : o?.type === 'image' ? KUVA_MERKKEINA : 0), 0) : 0);

export function kontekstinOsat(transkripti, mitattu) {
  const merkit = Object.fromEntries(ISTUNNON_OSAT.map(([k]) => [k, 0]));
  const rivit = transkripti.split('\n');
  const alku = rivit.findLastIndex((r) => r.includes('"compact_boundary"')) + 1;
  rivit.forEach((rivi, n) => {
    let j;
    try { j = JSON.parse(rivi); } catch { return; }
    if (j.isSidechain) return;
    // Järjestelmäkehote on istunnon nykyinen, joten viimeisin tilannekuva kelpaa myös ennen tiivistystä.
    if (j.attachment?.type === 'prompt_snapshot') { merkit.kehote = pituus(j.attachment.systemPrompt); return; }
    if (n < alku) return;
    const c = j.message?.content;
    if (j.type === 'attachment') {
      const a = j.attachment ?? {};
      if (a.type === 'instructions') merkit.ohjeet += (a.files ?? []).reduce((s, f) => s + pituus(f.content), 0);
      else if (LISTAT[a.type]) merkit.listat += pituus(LISTAT[a.type](a));
      else if (!EI_MALLILLE.has(a.type)) merkit.muistutukset += JSON.stringify(a).length;
    } else if (j.type === 'user') {
      for (const o of typeof c === 'string' ? [{ type: 'text', text: c }] : Array.isArray(c) ? c : []) {
        if (o?.type === 'tool_result') merkit.tulokset += sisaltoMerkit(o.content);
        else if (o?.type === 'text') merkit[j.isMeta || j.isCompactSummary || JARJESTELMAN.test(o.text) ? 'muistutukset' : 'kayttaja'] += o.text.length;
        else if (o?.type === 'image') merkit.kayttaja += KUVA_MERKKEINA;
      }
    } else if (j.type === 'assistant' && Array.isArray(c)) {
      for (const o of c) {
        if (o?.type === 'text') merkit.agentti += o.text.length;
        else if (o?.type === 'tool_use') merkit.kutsut += (o.name ?? '').length + JSON.stringify(o.input ?? {}).length;
      }
    }
  });
  let osat = ISTUNNON_OSAT.map(([k, nimi]) => ({ nimi, tokenit: tokeneiksi(merkit[k]) }));
  if (mitattu == null) return osat;
  const summa = osat.reduce((s, o) => s + o.tokenit, 0);
  if (summa > mitattu) osat = osat.map((o) => ({ ...o, tokenit: Math.round((o.tokenit * mitattu) / summa) }));
  return [...osat, { nimi: 'Työkalumääritykset ja ajattelu (jäännös)', tokenit: Math.max(0, mitattu - summa) }];
}

export function skoopinKonteksti(nimi, { juuri, rekisterit, istunnot: skoopinIstunnot }) {
  const ryhmat = kontekstiTiedostot(nimi, rekisterit, juuri).map(({ laji, polku }) => {
    let teksti = '';
    try { teksti = readFileSync(join(juuri, polku), 'utf8'); } catch { /* poistui kesken */ }
    const osat = osiin(teksti);
    return { laji, polku, tokenit: osat.reduce((s, o) => s + o.tokenit, 0), osat };
  });
  return {
    tokenit: ryhmat.reduce((s, r) => s + r.tokenit, 0),
    ryhmat,
    istunnot: skoopinIstunnot.map((i) => {
      let transkripti = '';
      try { transkripti = readFileSync(i.polku, 'utf8'); } catch { /* uusi istunto ilman transkriptia */ }
      const mitattu = i.konteksti?.tokenit ?? null;
      return { id: i.id, nimi: i.nimi, mitattu, osat: kontekstinOsat(transkripti, mitattu) };
    }),
  };
}

export function yksi(nimi, asetukset) {
  const skoopit = lueSkoopit(asetukset.juuri);
  const kaikkiIstunnot = istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) });
  const s = skooppi(nimi, { juuri: asetukset.juuri, skoopit, kaikkiIstunnot });
  return s && { ...s, konteksti: skoopinKonteksti(nimi, { juuri: asetukset.juuri, rekisterit: s.rekisterit, istunnot: s.istunnot }) };
}
