// Nebius Token Factory Claude Code -istunnoille (käyttäjä 18.10.2026: "scopes istunnot test ... apia flash 4.1 mallilla").
// Nebius puhuu vain OpenAI-muotoa (/v1/chat/completions; /v1/messages = 404, todettu 18.10.2026), joten tämä välityspalvelin
// kääntää Claude Coden Anthropic-kutsut: /v1/messages (myös virtana ja työkalukutsuineen) → /v1/chat/completions ja takaisin.
// Kuuntelee vain 127.0.0.1:tä. Avain luetaan joka pyynnöllä tiedostosta (nebius-avain.mjs), joten äpin vaihtama avain
// tulee voimaan heti. OnePlus ei saa yhteyttä Nebiukseen suoraan (18.10.2026: yhteys katkeaa 2 ms:ssa), joten kutsu ajetaan
// `ssh <kone> curl` -komennolla NEBIUS_REITIT-koneilla järjestyksessä (oletus palvelin, sitten Mac; avain stdinissä).
// ssh-tunneli (-L) ei käy: Macin palomuuri päästää curlin mutta ei sshd:n omaa yhteyttä Nebiukseen (19.10.2026).
// NEBIUS_YLAVIRTA (https://…) ohittaa reitit ja kutsuu suoraan; TLS tarkistetaan Nebiuksen nimellä myös 127.0.0.1:n kautta.
//   node nebius-valitys.mjs     NEBIUS_PORTTI (oletus 11240), NEBIUS_REITIT (oletus palvelin,mac), NEBIUS_YLAVIRTA,
//                               NEBIUS_AVAIN_TIEDOSTO, NEBIUS_LOKI (pyyntöjen tokenit, ei sisältöä)

import { spawn } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { request as httpsPyynto } from 'node:https';
import { request as httpPyynto } from 'node:http';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NEBIUS_NIMI = 'api.tokenfactory.nebius.com';

// Anthropic-pyyntö → OpenAI chat/completions -runko.
export function openaiRunko(a) {
  const viestit = [];
  const jarjestelma = Array.isArray(a.system) ? a.system.map((b) => b.text ?? '').join('\n') : a.system;
  if (jarjestelma) viestit.push({ role: 'system', content: jarjestelma });
  for (const v of a.messages ?? []) {
    const osat = typeof v.content === 'string' ? [{ type: 'text', text: v.content }] : v.content ?? [];
    if (v.role === 'assistant') {
      const teksti = osat.filter((o) => o.type === 'text').map((o) => o.text).join('');
      const kutsut = osat.filter((o) => o.type === 'tool_use')
        .map((o) => ({ id: o.id, type: 'function', function: { name: o.name, arguments: JSON.stringify(o.input ?? {}) } }));
      viestit.push({ role: 'assistant', content: teksti || null, ...(kutsut.length ? { tool_calls: kutsut } : {}) });
      continue;
    }
    // Työkalutulokset ensin omina viesteinään (OpenAI vaatii ne heti assistantin tool_callsin perään), sitten muu sisältö.
    for (const o of osat.filter((x) => x.type === 'tool_result')) {
      const sisalto = typeof o.content === 'string' ? o.content
        : (o.content ?? []).map((c) => (c.type === 'text' ? c.text : `[${c.type}]`)).join('\n');
      viestit.push({ role: 'tool', tool_call_id: o.tool_use_id, content: (o.is_error ? 'VIRHE: ' : '') + sisalto });
    }
    const muut = osat.filter((o) => o.type === 'text' || o.type === 'image').map((o) => (o.type === 'text'
      ? { type: 'text', text: o.text }
      : { type: 'image_url', image_url: { url: o.source?.type === 'base64' ? `data:${o.source.media_type};base64,${o.source.data}` : o.source?.url } }));
    if (muut.length) viestit.push({ role: 'user', content: muut.every((m) => m.type === 'text') ? muut.map((m) => m.text).join('\n') : muut });
  }
  const runko = { model: a.model, messages: viestit, max_tokens: a.max_tokens, stream: Boolean(a.stream) };
  if (a.stream) runko.stream_options = { include_usage: true };
  if (a.temperature != null) runko.temperature = a.temperature;
  if (a.top_p != null) runko.top_p = a.top_p;
  if (a.stop_sequences?.length) runko.stop = a.stop_sequences;
  if (a.tools?.length) {
    runko.tools = a.tools.filter((t) => t.input_schema).map((t) => ({ type: 'function', function: { name: t.name, description: t.description ?? '', parameters: t.input_schema } }));
    const tc = a.tool_choice;
    if (tc?.type === 'any') runko.tool_choice = 'required';
    else if (tc?.type === 'tool') runko.tool_choice = { type: 'function', function: { name: tc.name } };
    else if (tc?.type === 'none') runko.tool_choice = 'none';
  }
  return runko;
}

const LOPPU = { stop: 'end_turn', length: 'max_tokens', tool_calls: 'tool_use', content_filter: 'end_turn' };
const syote = (j) => { try { return JSON.parse(j || '{}'); } catch { return { raaka: j }; } };

// OpenAI-vastaus (ei virta) → Anthropic-viesti.
export function anthropicVastaus(o, malli) {
  const v = o.choices?.[0]?.message ?? {};
  const sisalto = [];
  if (v.content) sisalto.push({ type: 'text', text: v.content });
  for (const k of v.tool_calls ?? []) sisalto.push({ type: 'tool_use', id: k.id, name: k.function?.name, input: syote(k.function?.arguments) });
  return {
    id: o.id ?? `msg_${Date.now()}`, type: 'message', role: 'assistant', model: malli, content: sisalto,
    stop_reason: (v.tool_calls?.length ? 'tool_use' : LOPPU[o.choices?.[0]?.finish_reason]) ?? 'end_turn', stop_sequence: null,
    usage: { input_tokens: o.usage?.prompt_tokens ?? 0, output_tokens: o.usage?.completion_tokens ?? 0 },
  };
}

// OpenAI-virran palat → Anthropic-virran tapahtumat. kirjoita(tapahtuma, data) saa valmiit tapahtumat järjestyksessä.
export function luoVirranKaantaja(malli, kirjoita) {
  let indeksi = -1, auki = null, loppu = null;
  const kaytto = { input_tokens: 0, output_tokens: 0 };
  const tyokalut = new Map(); // OpenAI:n tool_calls-indeksi → Anthropic-lohkon indeksi
  const sulje = () => { if (auki) { kirjoita('content_block_stop', { type: 'content_block_stop', index: indeksi }); auki = null; } };
  kirjoita('message_start', { type: 'message_start', message: { id: `msg_${Date.now()}`, type: 'message', role: 'assistant', model: malli, content: [], stop_reason: null, stop_sequence: null, usage: kaytto } });
  return {
    pala(o) {
      if (o.usage) { kaytto.input_tokens = o.usage.prompt_tokens ?? 0; kaytto.output_tokens = o.usage.completion_tokens ?? 0; }
      const c = o.choices?.[0];
      if (!c) return;
      const d = c.delta ?? {};
      if (d.content) {
        if (auki !== 'teksti') { sulje(); indeksi++; auki = 'teksti'; kirjoita('content_block_start', { type: 'content_block_start', index: indeksi, content_block: { type: 'text', text: '' } }); }
        kirjoita('content_block_delta', { type: 'content_block_delta', index: indeksi, delta: { type: 'text_delta', text: d.content } });
      }
      for (const k of d.tool_calls ?? []) {
        const i = k.index ?? 0;
        if (!tyokalut.has(i)) {
          sulje(); indeksi++; auki = 'tyokalu'; tyokalut.set(i, indeksi);
          kirjoita('content_block_start', { type: 'content_block_start', index: indeksi, content_block: { type: 'tool_use', id: k.id ?? `toolu_${Date.now()}_${i}`, name: k.function?.name ?? '', input: {} } });
        }
        if (k.function?.arguments) kirjoita('content_block_delta', { type: 'content_block_delta', index: tyokalut.get(i), delta: { type: 'input_json_delta', partial_json: k.function.arguments } });
      }
      if (c.finish_reason) loppu = tyokalut.size ? 'tool_use' : LOPPU[c.finish_reason] ?? 'end_turn';
    },
    valmis() {
      sulje();
      kirjoita('message_delta', { type: 'message_delta', delta: { stop_reason: loppu ?? 'end_turn', stop_sequence: null }, usage: { output_tokens: kaytto.output_tokens, input_tokens: kaytto.input_tokens } });
      kirjoita('message_stop', { type: 'message_stop' });
      return kaytto;
    },
  };
}

// Yksi kutsu `ssh <kone> curl`:lla. Tila luetaan curlin -D-otsakkeista stderristä; runko (myös SSE-virta) on stdout.
// ssh:n koodi 255 ennen tilaa = kone ei vastannut, jolloin kokeillaan seuraavaa reittiä.
function sshKutsu(reitit, polku, metodi, avain, data) {
  const komento = `read -r K; curl -sN -m 600 -D /dev/stderr -X ${metodi} -H "Authorization: Bearer $K" -H 'Content-Type: application/json'${data ? ' --data-binary @-' : ''} https://${NEBIUS_NIMI}${polku}`;
  const yritys = (i) => new Promise((ok, ei) => {
    if (i >= reitit.length) return ei(new Error(`Nebius ei tavoitettavissa reiteillä ${reitit.join(', ')}`));
    const lapsi = spawn('ssh', ['-o', 'ConnectTimeout=3', '-o', 'BatchMode=yes', reitit[i], komento], { stdio: ['pipe', 'pipe', 'pipe'] });
    let virhe = '';
    let valmis = false;
    lapsi.stderr.setEncoding('utf8');
    lapsi.stderr.on('data', (pala) => {
      virhe += pala;
      const m = !valmis && /HTTP\/[\d.]+ (\d{3})/.exec(virhe);
      if (m) { valmis = true; lapsi.stdout.statusCode = Number(m[1]); ok(lapsi.stdout); }
    });
    lapsi.on('error', (e) => { if (!valmis) { valmis = true; ei(e); } });
    lapsi.on('close', (koodi) => {
      if (valmis) return;
      valmis = true;
      if (koodi === 255) yritys(i + 1).then(ok, ei);
      else ei(new Error(`curl ${reitit[i]}: koodi ${koodi} ${virhe.trim().split('\n').pop() ?? ''}`.slice(0, 300)));
    });
    lapsi.stdin.on('error', () => {});
    lapsi.stdin.end(`${avain}\n${data ?? ''}`);
  });
  return yritys(0);
}

export function luoValitys({ ylavirta = null, reitit = ['palvelin', 'mac'], avainTiedosto, loki = null } = {}) {
  const yla = new URL(ylavirta ?? `https://${NEBIUS_NIMI}`);
  const avain = () => readFileSync(avainTiedosto, 'utf8').trim();
  const kirjaa = (rivi) => { if (loki) try { appendFileSync(loki, JSON.stringify({ aika: new Date().toISOString(), ...rivi }) + '\n'); } catch { /* loki ei estä */ } };

  // Pyyntö Nebiukselle; tunnelin kautta host on 127.0.0.1, mutta TLS-nimi ja Host-otsake ovat Nebiuksen.
  function nebius(polku, metodi, runko) {
    if (!ylavirta) return sshKutsu(reitit, polku, metodi, avain(), runko ? JSON.stringify(runko) : null);
    const https = yla.protocol === 'https:';
    const nimi = yla.hostname === '127.0.0.1' ? NEBIUS_NIMI : yla.hostname;
    const data = runko ? Buffer.from(JSON.stringify(runko)) : null;
    return new Promise((ok, ei) => {
      const p = (https ? httpsPyynto : httpPyynto)({
        host: yla.hostname, port: yla.port || (https ? 443 : 80), path: polku, method: metodi, servername: nimi,
        headers: { Host: nimi, Authorization: `Bearer ${avain()}`, 'Content-Type': 'application/json', ...(data ? { 'Content-Length': data.length } : {}) },
        timeout: 600_000,
      }, ok);
      p.on('timeout', () => p.destroy(new Error('Nebius ei vastannut 600 s:ssa')));
      p.on('error', ei);
      p.end(data);
    });
  }
  const lueKaikki = (v) => new Promise((ok) => { const p = []; v.on('data', (c) => p.push(c)); v.on('end', () => ok(Buffer.concat(p).toString('utf8'))); });
  const virhe = (res, koodi, viesti) => {
    res.writeHead(koodi, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ type: 'error', error: { type: koodi === 401 ? 'authentication_error' : 'api_error', message: viesti } }));
  };

  return async function kasittele(req, res) {
    try {
      const polku = new URL(req.url, 'http://x').pathname;
      if (req.method === 'GET' && polku === '/v1/models') {
        const v = await nebius('/v1/models', 'GET');
        res.writeHead(v.statusCode, { 'Content-Type': 'application/json' });
        return res.end(await lueKaikki(v));
      }
      if (req.method === 'POST' && polku === '/v1/messages/count_tokens') {
        const a = JSON.parse(await lueKaikki(req));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ input_tokens: Math.ceil(JSON.stringify(a.messages ?? []).length / 4) }));
      }
      if (req.method !== 'POST' || polku !== '/v1/messages') return virhe(res, 404, `tuntematon polku ${polku}`);
      const a = JSON.parse(await lueKaikki(req));
      const alku = Date.now();
      const v = await nebius('/v1/chat/completions', 'POST', openaiRunko(a));
      if (v.statusCode !== 200) {
        const teksti = await lueKaikki(v);
        kirjaa({ malli: a.model, koodi: v.statusCode, virhe: teksti.slice(0, 300) });
        return virhe(res, v.statusCode, `Nebius ${v.statusCode}: ${teksti.slice(0, 500)}`);
      }
      if (!a.stream) {
        const o = JSON.parse(await lueKaikki(v));
        const vastaus = anthropicVastaus(o, a.model);
        kirjaa({ malli: a.model, ...vastaus.usage, kesto: Date.now() - alku });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(vastaus));
      }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      const k = luoVirranKaantaja(a.model, (tapahtuma, data) => res.write(`event: ${tapahtuma}\ndata: ${JSON.stringify(data)}\n\n`));
      let kesken = '';
      v.setEncoding('utf8');
      v.on('data', (pala) => {
        const rivit = (kesken + pala).split('\n');
        kesken = rivit.pop();
        for (const r of rivit) {
          const t = r.startsWith('data:') ? r.slice(5).trim() : '';
          if (!t || t === '[DONE]') continue;
          try { k.pala(JSON.parse(t)); } catch { /* rikkinäinen pala ohitetaan */ }
        }
      });
      v.on('end', () => { const kaytto = k.valmis(); kirjaa({ malli: a.model, ...kaytto, kesto: Date.now() - alku, virta: true }); res.end(); });
      v.on('error', (e) => { kirjaa({ malli: a.model, virhe: e.message }); res.end(); });
    } catch (e) {
      if (!res.headersSent) virhe(res, 502, `välityspalvelin: ${e.message}`);
      else res.end();
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const env = process.env;
  const portti = Number(env.NEBIUS_PORTTI ?? 11240);
  const kasittele = luoValitys({
    ylavirta: env.NEBIUS_YLAVIRTA || null,
    reitit: (env.NEBIUS_REITIT ?? 'palvelin,mac').split(',').filter(Boolean),
    avainTiedosto: env.NEBIUS_AVAIN_TIEDOSTO ?? join(homedir(), '.config/scopes/nebius-avain'),
    loki: env.NEBIUS_LOKI ?? join(homedir(), '.local/state/scopes-nebius.loki'),
  });
  createServer(kasittele).listen(portti, '127.0.0.1', () => console.log(`nebius-valitys: http://127.0.0.1:${portti}`));
}
