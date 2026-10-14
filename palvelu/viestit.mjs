// Viestit puhelimesta (DEMO-SCOPES-VALILEHDET 13.10.2026, käyttäjän määrittely samana päivänä).
//   chat   — palvelin ajaa valitun Claude-mallin `claude -p`:llä ilman kontekstinhallintaa ja ilman työkaluja;
//            viesti kulkee stdinissä, ei komentorivillä, ja jatko tunnistetaan claude-istunnon id:llä (--resume).
//            Toinen mallijoukko on palvelimen paikalliset mallit (LM Studio, DEMO-SCOPES-UI 13.10.2026; aiemmat
//            ~/.claude/agents-tyypit poistettiin valitsimesta käyttäjän pyynnöstä).
//   skoopin viestit — skoopin käynnissä olevan istunnon transkriptin teksti ja uusi viesti istunnon
//            tmux-ruutuun samoin tarkistuksin kuin pakkaa (toiminnot.mjs): yksi tmux-istunto, ruudun pid täsmää.
// Agentin nimi tarkistetaan listalta, istunnon id muodosta; vapaa teksti ei päädy komentoriville.

import { randomUUID } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { istunnot, lueSkoopit, projektiNimi, pysahdys } from './lahteet.mjs';
import { ajaKomento, Hylatty } from './toiminnot.mjs';

export const MALLIT = [
  { nimi: 'claude-fable-5-1', kuvaus: 'Fable 5.1', tyyppi: 'malli' },
  { nimi: 'claude-opus-5-5', kuvaus: 'Opus 5.5', tyyppi: 'malli' },
  { nimi: 'claude-sonnet-5-5', kuvaus: 'Sonnet 5.5', tyyppi: 'malli' },
  { nimi: 'claude-haiku-5-5', kuvaus: 'Haiku 5.5', tyyppi: 'malli' },
];
export const VIESTIN_MAKSIMI = 8000;
const ISTUNTO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// palvelimen LM Studio kuuntelee vain 127.0.0.1:1234:ää, joten palvelu käyttää sitä ssh:n yli. Etäkomennot ovat
// vakioita; mallin nimi ja viestit kulkevat JSON-rungossa stdinissä, eivät komentorivillä.
export const PAIKALLINEN = 'palvelin/';
const SSH = ['-o', 'ConnectTimeout=3', '-o', 'BatchMode=yes', 'palvelin'];
const LMS_MALLIT = 'curl -s -m 5 http://127.0.0.1:1234/v1/models';
const LMS_CHAT = "curl -sN -m 300 -H 'Content-Type: application/json' --data-binary @- http://127.0.0.1:1234/v1/chat/completions";
const PAIKALLINEN_ID = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
// Mallin vaihto: LM Studio ei mahdu lataamaan toista isoa mallia ensimmäisen rinnalle (8 GB VRAM, 30 GB RAM;
// "insufficient system resources" 13.10.2026), joten muu ladattu malli puretaan ensin. Tunnus on tarkistettu
// listalta ja PAIKALLINEN_ID-muodosta, joten se ei sisällä lainausmerkkejä eikä kuoren erikoismerkkejä.
export const lmsLataa = (id) => `L=~/.lmstudio/bin/lms; $L ps --json | grep -qF '"identifier":"${id}"' || `
  + `{ $L unload --all >/dev/null && $L load '${id}' -y --identifier '${id}' -c 8192; }`;

// LM Studion /v1/models → [{ nimi: 'palvelin/<id>', kuvaus, tyyppi: 'paikallinen' }]; upotusmallit pois.
export function paikallisetMallit(stdout) {
  let data;
  try { data = JSON.parse(stdout).data; } catch { return []; }
  if (!Array.isArray(data)) return [];
  return data.map((m) => m?.id).filter((id) => typeof id === 'string' && PAIKALLINEN_ID.test(id) && !/embed/i.test(id))
    .map((id) => ({ nimi: PAIKALLINEN + id, kuvaus: id.split('/').pop(), tyyppi: 'paikallinen' }));
}

// Työkalukutsu yhdeksi lyhyeksi riviksi (DEMO-SCOPES-PARANNUKSET 13.10.2026): komento tai muokattu tiedosto.
const lyhenna = (t, n = 120) => { const r = String(t ?? '').split('\n')[0].trim(); return r.length > n ? `${r.slice(0, n - 1)}…` : r; };
export function tyokaluRivi(o) {
  const s = o.input ?? {};
  const tiedosto = s.file_path ?? s.notebook_path ?? s.path;
  // Alun `cd <hakemisto> &&` on pelkkää hälyä: rivillä näkyy itse komento.
  if (o.name === 'Bash' && s.command) return `$ ${lyhenna(s.command.replace(/^\s*cd\s+("[^"]*"|'[^']*'|\S+)\s*&&\s*/, ''))}`;
  if (['Edit', 'MultiEdit', 'Write', 'NotebookEdit'].includes(o.name) && tiedosto) return `✎ ${lyhenna(tiedosto)}`;
  if (o.name === 'Read' && tiedosto) return `luki ${lyhenna(basename(tiedosto))}`;
  if (['Grep', 'Glob'].includes(o.name) && s.pattern) return `haki ${lyhenna(s.pattern)}`;
  const kuvaus = s.description ?? s.subagent_type;
  if (['Agent', 'Task'].includes(o.name) && kuvaus) return `ali-agentti: ${lyhenna(kuvaus)}`;
  return lyhenna(o.name ?? 'työkalu');
}

// Monivalinta (AskUserQuestion, DEMO-SCOPES-LISTA 13.10.2026): kysymykset vaihtoehtoineen äpin korttia varten ja
// sama tekstinä vanhalle äpille. Vastaus tulee myöhemmin työkalutuloksena (vastaukset).
export function kysymysViesti(o, aika) {
  const kysymykset = (Array.isArray(o.input?.questions) ? o.input.questions : []).map((q) => ({
    kysymys: String(q?.question ?? ''),
    otsikko: q?.header ? String(q.header) : null,
    monivalinta: q?.multiSelect === true,
    vaihtoehdot: (Array.isArray(q?.options) ? q.options : []).map((v) => ({ nimi: String(v?.label ?? ''), kuvaus: v?.description ? String(v.description) : null })),
  }));
  const teksti = kysymykset.map((q) => [q.kysymys, ...q.vaihtoehdot.map((v, i) => `${i + 1}. ${v.nimi}`)].join('\n')).join('\n\n');
  return { rooli: 'kysymys', teksti, aika, kysymykset, vastattu: false };
}

// Transkriptin keskustelu: [{ rooli: 'kayttaja'|'agentti'|'tyokalu'|'kysymys', teksti, aika }], viimeiset `maara`.
// Agentin työkalukutsut lyhyinä riveinä (tyokaluRivi), monivalinnat kysymyksinä ja niiden vastaukset käyttäjän
// viesteinä; muut työkalutulokset, meta-rivit ja ali-agenttien rivit ohitetaan; komentokääre näytetään komentona.
export function keskustelu(transkripti, maara = 120) {
  const tulos = [];
  const kysymykset = new Map();
  for (const rivi of transkripti.split('\n')) {
    let j;
    try { j = JSON.parse(rivi); } catch { continue; }
    if (j.isSidechain || j.isMeta || (j.type !== 'user' && j.type !== 'assistant')) continue;
    const c = j.message?.content;
    const aika = j.timestamp ?? null;
    if (j.type === 'assistant' && Array.isArray(c)) {
      let teksti = [];
      const tyhjenna = () => { const t = teksti.join('\n').trim(); if (t) tulos.push({ rooli: 'agentti', teksti: t, aika }); teksti = []; };
      for (const o of c) {
        if (o?.type === 'text') teksti.push(o.text);
        else if (o?.type === 'tool_use' && o.name === 'AskUserQuestion') {
          tyhjenna();
          const k = kysymysViesti(o, aika);
          kysymykset.set(o.id, k);
          tulos.push(k);
        } else if (o?.type === 'tool_use') { tyhjenna(); tulos.push({ rooli: 'tyokalu', teksti: tyokaluRivi(o), aika }); }
      }
      tyhjenna();
      continue;
    }
    if (j.type === 'user' && Array.isArray(c)) {
      for (const o of c) {
        const k = o?.type === 'tool_result' && kysymykset.get(o.tool_use_id);
        if (!k) continue;
        k.vastattu = true;
        const vastaukset = j.toolUseResult?.answers;
        const teksti = vastaukset && typeof vastaukset === 'object' ? Object.values(vastaukset).map(String).join('\n') : '';
        if (teksti.trim()) tulos.push({ rooli: 'kayttaja', teksti: teksti.trim(), aika });
      }
    }
    const osat = typeof c === 'string' ? [c] : Array.isArray(c) ? c.filter((o) => o?.type === 'text').map((o) => o.text) : [];
    let teksti = osat.join('\n').trim();
    if (!teksti) continue;
    if (j.type === 'user') {
      const komento = /<command-name>([^<]*)<\/command-name>[\s\S]*?<command-args>([^<]*)<\/command-args>/.exec(teksti);
      if (komento) teksti = `${komento[1]} ${komento[2]}`.trim();
      else if (/^<(local-command|command-message|system-reminder|task-notification)/.test(teksti)) continue;
    }
    tulos.push({ rooli: j.type === 'user' ? 'kayttaja' : 'agentti', teksti, aika });
  }
  // Kysymys, jonka perässä on mitä tahansa, ei ole enää auki (keskeytys tai vastaus toiselta laitteelta).
  tulos.forEach((v, i) => { if (v.rooli === 'kysymys' && i < tulos.length - 1) v.vastattu = true; });
  return tulos.slice(-maara);
}

// Transkriptin kohdasta `koko` eteenpäin kirjoitetut rivit sisältävät tekstin `teksti`: käyttäjän viestinä, jonoon
// menneenä komentona (queued_command) tai jono-operaationa. Haku alun 60 merkin perusteella, koska Claude voi
// yhdistää jonossa olleet viestit.
export function transkriptissa(transkripti, teksti) {
  const haku = teksti.replace(/\s+/g, ' ').slice(0, 60);
  for (const r of transkripti.split('\n')) {
    let j;
    try { j = JSON.parse(r); } catch { continue; }
    if (j.isSidechain) continue;
    const c = j.message?.content;
    const osat = j.type === 'user' ? (typeof c === 'string' ? [c] : Array.isArray(c) ? c.filter((o) => o?.type === 'text').map((o) => o.text) : [])
      : j.type === 'attachment' ? [j.attachment?.prompt] : j.type === 'queue-operation' ? [j.content] : [];
    if (osat.some((o) => typeof o === 'string' && o.replace(/\s+/g, ' ').includes(haku))) return true;
  }
  return false;
}

export function luoViestit(asetukset, { aja = ajaKomento, loki = asetukset.toimintoloki } = {}) {
  let chatKaynnissa = false;
  const kirjaa = (rivi) => {
    if (!loki) return;
    try { mkdirSync(dirname(loki), { recursive: true }); appendFileSync(loki, JSON.stringify({ aika: new Date().toISOString(), ...rivi }) + '\n'); } catch { /* loki ei estä lähetystä */ }
  };
  // Odottaa, että lähetetty teksti ilmestyy transkriptiin (V-305); raja ja väli asetuksista testejä varten.
  async function odotaTranskriptiin(polku, koko, teksti) {
    const raja = Date.now() + (asetukset.perillaRaja ?? 10_000);
    for (;;) {
      let uusi = '';
      try { uusi = readFileSync(polku).subarray(koko).toString('utf8'); } catch { /* transkripti ei vielä syntynyt */ }
      if (transkriptissa(uusi, teksti)) return true;
      if (Date.now() >= raja) return false;
      await new Promise((r) => setTimeout(r, asetukset.perillaVali ?? 500));
    }
  }

  // Skoopin pakkaamattomat istunnot uusin ensin: pakattu istunto ei ole enää skoopin keskustelu (käyttäjä 13.10.2026),
  // ja automaattisiirron jälkeen uusi istunto korvaa vanhan samassa näkymässä.
  const skoopinIstunnot = (nimi) => {
    const skoopit = lueSkoopit(asetukset.juuri);
    if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
    return istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) }).filter((i) => i.skooppi === nimi);
  };
  const avoimet = (nimi) => skoopinIstunnot(nimi).filter((i) => !i.pakattu).sort((a, b) => b.alkoi - a.alkoi);

  // Ainoa tmux-istunto, jonka ruudun prosessi on istunnon claude tai sen vanhempi (sama sääntö kuin pakkaa).
  async function tmuxIstunto(nimi) {
    const omat = avoimet(nimi).filter((i) => i.ruutu);
    if (omat.length !== 1) throw new Hylatty(409, omat.length ? 'skoopissa on useita tmux-istuntoja' : 'skooppi ei ole auki tmuxissa');
    const [i] = omat;
    const r = await aja('tmux', ['display-message', '-p', '-t', i.ruutu, '#{pane_pid}']);
    const ruudunPid = Number(r.stdout.trim());
    if (r.koodi !== 0 || !(ruudunPid === i.pid || ruudunPid === i.vanhempi)) throw new Hylatty(409, 'istunnon tmux-ruutu ei täsmää');
    return i;
  }

  // Chatin keskusteluhistoria (DEMO-SCOPES-PARANNUKSET): claude kirjoittaa jokaisen chatin transkriptiksi chatin
  // työhakemiston projektikansioon, ja --resume jatkaa samaa tiedostoa, joten lista luetaan sieltä. Agentin nimi
  // talletetaan erikseen (agentit.json), koska --agent-ajon transkripti ei kerro sitä; jatko vaatii saman agentin.
  const chatProjekti = () => join(asetukset.projektitDir, projektiNimi(asetukset.chatDir));
  const agenttiTiedosto = () => join(asetukset.chatDir, 'agentit.json');
  const lueAgentit = () => { try { return JSON.parse(readFileSync(agenttiTiedosto(), 'utf8')); } catch { return {}; } };
  // Paikallisten mallien lista välimuistissa 20 s; palvelin on usein pois päältä, jolloin lista on tyhjä eikä
  // äppi tarjoa paikallisia malleja.
  let paikalliset = { aika: 0, mallit: [] };
  async function haePaikalliset() {
    if (Date.now() - paikalliset.aika < 20_000) return paikalliset.mallit;
    const t = await aja('ssh', [...SSH, LMS_MALLIT], { aikaraja: 10_000 });
    paikalliset = { aika: Date.now(), mallit: t.koodi === 0 ? paikallisetMallit(t.stdout) : [] };
    return paikalliset.mallit;
  }
  const kaikkiMallit = async () => [...MALLIT, ...await haePaikalliset()];

  // Paikallisen mallin keskustelu talletetaan itse (LM Studio ei pidä historiaa): chatDir/paikalliset/<uuid>.json.
  const paikallisetDir = () => join(asetukset.chatDir, 'paikalliset');
  const luePaikallinen = (id) => { try { return JSON.parse(readFileSync(join(paikallisetDir(), `${id}.json`), 'utf8')); } catch { return null; } };

  async function paikallinenChat(valittu, viesti, jatko, { pala, alku, signal }) {
    const k = jatko ? luePaikallinen(jatko) : { agentti: valittu.nimi, viestit: [] };
    if (!k) throw new Hylatty(404, 'tuntematon keskustelu');
    if (k.agentti !== valittu.nimi) throw new Hylatty(409, 'keskustelu kuuluu toiselle mallille');
    k.viestit.push({ rooli: 'kayttaja', teksti: viesti, aika: new Date().toISOString() });
    const runko = JSON.stringify({ model: valittu.nimi.slice(PAIKALLINEN.length), stream: true,
      messages: k.viestit.map((v) => ({ role: v.rooli === 'kayttaja' ? 'user' : 'assistant', content: v.teksti })) });
    alku?.();
    const lataus = await aja('ssh', [...SSH, lmsLataa(valittu.nimi.slice(PAIKALLINEN.length))], { aikaraja: 240_000, signal });
    if (lataus.koodi !== 0) {
      paikalliset.aika = 0;
      const rivi = (lataus.stderr + lataus.stdout).trim().split('\n').filter(Boolean).pop() ?? `ssh exit ${lataus.koodi}`;
      throw new Hylatty(502, `mallin lataus epäonnistui: ${rivi.slice(0, 300)}`);
    }
    let vastaus = '';
    let syy = null;
    // SSE-rivit "data: {…}"; vain content-palat näytetään, reasoning_content (ajattelu) jää pois.
    const riville = (r) => {
      let e;
      try { e = JSON.parse(r.replace(/^data: /, '')); } catch { return; }
      if (e.error) syy = e.error.message ?? String(e.error);
      const d = e.choices?.[0]?.delta?.content;
      if (d) { vastaus += d; pala?.(d); }
    };
    const t = await aja('ssh', [...SSH, LMS_CHAT], { syote: runko, aikaraja: 300_000, riville, signal, puskuri: 32 << 20 });
    if (t.koodi !== 0 || !vastaus) {
      throw new Hylatty(502, `malli ei vastannut: ${(syy ?? t.stderr.trim().split('\n').filter(Boolean).pop() ?? `ssh exit ${t.koodi}`).slice(0, 300)}`);
    }
    vastaus = vastaus.trim();
    k.viestit.push({ rooli: 'agentti', teksti: vastaus, aika: new Date().toISOString() });
    const id = jatko ?? randomUUID();
    mkdirSync(paikallisetDir(), { recursive: true });
    writeFileSync(join(paikallisetDir(), `${id}.json`), JSON.stringify(k));
    return { vastaus, keskustelu: id, agentti: valittu.nimi, kustannus: 0 };
  }

  const malliTranskriptista = (rivit) => {
    for (const r of rivit) { try { const m = JSON.parse(r).message?.model; if (MALLIT.some((x) => x.nimi === m)) return m; } catch { /* ohita */ } }
    return null;
  };

  return {
    agentit: kaikkiMallit,

    keskustelut() {
      const dir = chatProjekti();
      if (!existsSync(dir)) return [];
      const nimet = lueAgentit();
      const tulos = [];
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl'))) {
        const id = f.slice(0, -6);
        if (!ISTUNTO_ID.test(id)) continue;
        const polku = join(dir, f);
        const teksti = readFileSync(polku, 'utf8');
        const viestit = keskustelu(teksti, Infinity);
        const eka = viestit.find((v) => v.rooli === 'kayttaja');
        if (!eka) continue;
        tulos.push({ id, otsikko: lyhenna(eka.teksti, 80), agentti: nimet[id] ?? malliTranskriptista(teksti.split('\n')),
          viesteja: viestit.length, aika: pysahdys(teksti) ?? statSync(polku).mtime.toISOString() });
      }
      if (existsSync(paikallisetDir())) {
        for (const f of readdirSync(paikallisetDir()).filter((x) => x.endsWith('.json'))) {
          const id = f.slice(0, -5);
          const k = ISTUNTO_ID.test(id) && luePaikallinen(id);
          const eka = k?.viestit?.find((v) => v.rooli === 'kayttaja');
          if (!eka) continue;
          tulos.push({ id, otsikko: lyhenna(eka.teksti, 80), agentti: k.agentti, viesteja: k.viestit.length,
            aika: statSync(join(paikallisetDir(), f)).mtime.toISOString() });
        }
      }
      return tulos.sort((a, b) => b.aika.localeCompare(a.aika));
    },

    keskustelunViestit(id) {
      if (!ISTUNTO_ID.test(id ?? '')) throw new Hylatty(400, 'keskustelun tunnus ei kelpaa');
      const p = luePaikallinen(id);
      if (p) return { id, agentti: p.agentti, viestit: p.viestit.slice(-200) };
      const polku = join(chatProjekti(), `${id}.jsonl`);
      if (!existsSync(polku)) throw new Hylatty(404, 'tuntematon keskustelu');
      const teksti = readFileSync(polku, 'utf8');
      return { id, agentti: lueAgentit()[id] ?? malliTranskriptista(teksti.split('\n')), viestit: keskustelu(teksti, 200) };
    },

    // Vastaus suoratoistona (DEMO-SCOPES-SUORATOISTO 13.10.2026): claude kirjoittaa stream-json-tapahtumia, joista
    // tekstin palat menevät `pala`-kutsulle sitä mukaa kuin agentti kirjoittaa; lopullinen vastaus tulee result-rivistä.
    // `alku` kutsutaan, kun pyyntö on hyväksytty ja agentti käynnistyy (palvelin avaa vasta silloin virran);
    // `signal` katkaisee ajon, kun puhelin sulkee yhteyden.
    async chat({ agentti, viesti, keskustelu: jatko } = {}, { pala, alku, signal } = {}) {
      const valittu = MALLIT.find((a) => a.nimi === agentti)
        ?? (typeof agentti === 'string' && agentti.startsWith(PAIKALLINEN) ? (await haePaikalliset()).find((a) => a.nimi === agentti) : undefined);
      if (!valittu) throw new Hylatty(400, 'tuntematon agentti');
      if (typeof viesti !== 'string' || !viesti.trim()) throw new Hylatty(400, 'viesti puuttuu');
      if (viesti.length > VIESTIN_MAKSIMI) throw new Hylatty(413, `viesti yli ${VIESTIN_MAKSIMI} merkkiä`);
      if (jatko != null && !(typeof jatko === 'string' && ISTUNTO_ID.test(jatko))) throw new Hylatty(400, 'keskustelun tunnus ei kelpaa');
      if (chatKaynnissa) throw new Hylatty(429, 'edellinen chat-vastaus on vielä kesken');
      chatKaynnissa = true;
      try {
        if (valittu.tyyppi === 'paikallinen') return await paikallinenChat(valittu, viesti, jatko, { pala, alku, signal });
        mkdirSync(asetukset.chatDir, { recursive: true });
        const argumentit = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--tools', '',
          '--model', valittu.nimi,
          ...(jatko ? ['--resume', jatko] : [])];
        alku?.();
        let lohkoja = 0;
        const riville = (r) => {
          let e;
          try { e = JSON.parse(r); } catch { return; }
          if (e.type !== 'stream_event' || !pala) return;
          // Uusi tekstilohko saman vastauksen sisällä erotetaan tyhjällä rivillä, kuten result-kenttä.
          if (e.event?.type === 'content_block_start' && e.event.content_block?.type === 'text' && lohkoja++) pala('\n\n');
          if (e.event?.type === 'content_block_delta' && e.event.delta?.type === 'text_delta' && e.event.delta.text) pala(e.event.delta.text);
        };
        const t = await aja('claude', argumentit, { syote: viesti, cwd: asetukset.chatDir, aikaraja: 300_000, riville, signal, puskuri: 32 << 20 });
        let j = null;
        for (const r of t.stdout.split('\n')) { try { const e = JSON.parse(r); if (e.type === 'result') j = e; } catch { /* ohita */ } }
        if (t.koodi !== 0 || !j || j.is_error) {
          const syy = (j?.result ?? t.stderr.trim().split('\n').filter(Boolean).pop() ?? `claude exit ${t.koodi}`).slice(0, 300);
          throw new Hylatty(502, `agentti ei vastannut: ${syy}`);
        }
        if (ISTUNTO_ID.test(j.session_id ?? '')) {
          const nimet = lueAgentit();
          if (nimet[j.session_id] !== valittu.nimi) writeFileSync(agenttiTiedosto(), JSON.stringify({ ...nimet, [j.session_id]: valittu.nimi }));
        }
        return { vastaus: j.result ?? '', keskustelu: j.session_id, agentti: valittu.nimi, kustannus: j.total_cost_usd ?? null };
      } finally {
        chatKaynnissa = false;
      }
    },

    // Skoopin istunnon viestit, uusin pakkaamaton istunto. Ei sellaista → { auki: false }, jolloin äppi tarjoaa purun;
    // pakattu: true, kun skoopissa on vain pakattuja istuntoja (keskustelu tyhjennetään, Pura sulkee ne ensin).
    skoopinViestit(nimi) {
      const omat = avoimet(nimi);
      if (!omat.length) return { nimi, auki: false, pakattu: skoopinIstunnot(nimi).length > 0, istunto: null, voiLahettaa: false, viestit: [] };
      const [i] = omat;
      let transkripti = '';
      try { transkripti = readFileSync(i.polku, 'utf8'); } catch { /* uusi istunto ilman transkriptia */ }
      return {
        nimi, auki: true,
        istunto: { id: i.id, nimi: i.nimi, tila: i.tila, konteksti: i.konteksti },
        voiLahettaa: Boolean(i.ruutu) && omat.filter((x) => x.ruutu).length === 1,
        viestit: keskustelu(transkripti),
      };
    },

    // Viesti skoopin istuntoon: kirjoitetaan ruutuun kirjaimellisesti, rivinvaihdot välilyönneiksi (Enter lähettäisi).
    async lahetaSkooppiin(nimi, teksti) {
      if (typeof teksti !== 'string' || !teksti.trim()) throw new Hylatty(400, 'viesti puuttuu');
      if (teksti.length > VIESTIN_MAKSIMI) throw new Hylatty(413, `viesti yli ${VIESTIN_MAKSIMI} merkkiä`);
      const i = await tmuxIstunto(nimi);
      // Auki oleva monivalinta valitsisi Enterillä korostetun vaihtoehdon (käyttäjä 13.10.2026): Escape sulkee sen
      // ensin, jolloin teksti menee istuntoon vastauksena. Tauko, ettei Escape + kirjain tulkitu Alt-näppäimeksi.
      let transkripti = '';
      try { transkripti = readFileSync(i.polku, 'utf8'); } catch { /* ei transkriptia */ }
      const viimeinen = keskustelu(transkripti, 1)[0];
      if (viimeinen?.rooli === 'kysymys' && !viimeinen.vastattu) {
        const t = await aja('tmux', ['send-keys', '-t', i.ruutu, 'Escape']);
        if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
        await new Promise((r) => setTimeout(r, asetukset.escapeTauko ?? 800));
      }
      const rivi = teksti.replace(/\s*\n\s*/g, ' ').trim();
      const alku = Date.now();
      let koko = 0;
      try { koko = statSync(i.polku).size; } catch { /* uusi istunto ilman transkriptia */ }
      for (const a of [['-l', rivi], ['Enter']]) {
        const t = await aja('tmux', ['send-keys', '-t', i.ruutu, ...a]);
        if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      }
      // V-305 (14.10.2026): kolme viestiä jäi istunnon syöttökenttään ja lähti myöhemmin yhtenä, eikä äppi tiennyt
      // siitä. Lähetys on perillä vasta, kun teksti näkyy transkriptissa (käyttäjän viesti tai jonoon mennyt komento).
      const perilla = await odotaTranskriptiin(i.polku, koko, rivi);
      const kirjaus = { toiminto: 'viesti', nimi, istunto: i.id, merkkeja: rivi.length, alku: rivi.slice(0, 40), kesto: Date.now() - alku };
      if (!perilla) {
        const ruutu = await aja('tmux', ['capture-pane', '-p', '-t', i.ruutu]);
        kirjaa({ ...kirjaus, tulos: 'ei näkynyt', ruutu: ruutu.stdout.split('\n').filter((r) => r.trim()).slice(-8) });
        throw new Hylatty(504, 'viesti ei näkynyt istunnossa — se voi odottaa istunnon syöttökentässä; tarkista ennen uudelleenlähetystä');
      }
      kirjaa({ ...kirjaus, tulos: 'ok' });
      return { ok: true, istunto: i.id };
    },

    // Kortin X (käyttäjä 13.10.2026, kuten Claude-äpissä): Escape sulkee auki olevan monivalinnan vastaamatta.
    async suljeKysymys(nimi) {
      const i = await tmuxIstunto(nimi);
      let transkripti = '';
      try { transkripti = readFileSync(i.polku, 'utf8'); } catch { /* ei transkriptia */ }
      const viimeinen = keskustelu(transkripti, 1)[0];
      if (viimeinen?.rooli !== 'kysymys' || viimeinen.vastattu) throw new Hylatty(409, 'ei auki olevaa kysymystä');
      const t = await aja('tmux', ['send-keys', '-t', i.ruutu, 'Escape']);
      if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      return { ok: true, istunto: i.id };
    },
  };
}

