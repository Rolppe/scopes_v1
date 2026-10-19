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
import { homedir } from 'node:os';
import { agyRuudut, agyViestit, haeMacAgyKeskustelu, jasennaAgyRuutu, loydaKeskustelu, ruudunTila, tyhjennaMacAgyValimuisti } from './agy-istunto.mjs';
import { istunnotAsync, lueSkoopit, projektiNimi, pysahdys } from './lahteet.mjs';
import { ajaKomento, Hylatty, mallitonSlug } from './toiminnot.mjs';

export const MALLIT = [
  { nimi: 'claude-fable-5-1', kuvaus: 'Fable 5.1', tyyppi: 'malli' },
  { nimi: 'claude-opus-5-5', kuvaus: 'Opus 5.5', tyyppi: 'malli' },
  { nimi: 'claude-sonnet-5-5', kuvaus: 'Sonnet 5.5', tyyppi: 'malli' },
  { nimi: 'claude-haiku-5-5', kuvaus: 'Haiku 5.5', tyyppi: 'malli' },
];
// Nebius Token Factory -chat (käyttäjä 18.10.2026: "parhaat mallit ... eri tehtäviin ... asenna ne äppiin"). Kutsu kulkee
// palvelimen kautta (OnePlus ei saa yhteyttä Nebiukseen), avain stdinissä eikä komentorivillä. Ei Claude Codea välissä,
// joten viesti maksaa vain omat tokeninsa. Valinta ja hinnat ($/M syöte, tuloste) mittauksesta 18.10.2026 (NEBIUS-MALLIT).
export const NEBIUS = 'nebius/';
export const NEBIUS_CHAT_MALLIT = [
  { nimi: 'nebius/deepseek-ai/DeepSeek-V4-Flash-0731', kuvaus: 'DeepSeek V4 Flash · Nebius', tyyppi: 'nebius', hinta: [0.14, 0.28] },
  { nimi: 'nebius/Qwen/Qwen3-30B-A3B-Instruct-2507', kuvaus: 'Qwen3 30B (nopea) · Nebius', tyyppi: 'nebius', hinta: [0.10, 0.30] },
  { nimi: 'nebius/deepseek-ai/DeepSeek-V4.1-Flash', kuvaus: 'DeepSeek V4.1 Flash · Nebius', tyyppi: 'nebius', hinta: [0.30, 1.20] },
];
// Reitti Nebiukseen: palvelin, sen ollessa pois Mac (kumpikin pääsee Nebiukseen, OnePlus ei; 19.10.2026).
const NEBIUS_REITIT = ['palvelin', 'mac'];
const NEBIUS_CHAT = 'read -r K; curl -sN -m 300 -H "Authorization: Bearer $K" -H \'Content-Type: application/json\' --data-binary @- https://api.tokenfactory.nebius.com/v1/chat/completions';
export const VIESTIN_MAKSIMI = 8000;
// Istunnon effort-tasot (/effort); sama joukko kuin claude/siirto/tools/autovaihto.sh:ssa.
export const EFFORTIT = ['low', 'medium', 'high', 'xhigh', 'max'];

// Istunnon malli ja effort transkriptin viimeiseltä pääketjun assistant-riviltä (sama lähde kuin autovaihto.sh, R7).
// Arvo päivittyy vasta istunnon seuraavan vastauksen jälkeen; ei vielä vastausta → null.
export function istunnonAsetukset(transkripti) {
  const rivit = String(transkripti ?? '').split('\n');
  for (let k = rivit.length - 1; k >= 0; k--) {
    if (!rivit[k].includes('"assistant"')) continue;
    let o;
    try { o = JSON.parse(rivit[k]); } catch { continue; }
    if (o.type !== 'assistant' || o.isSidechain || !o.message?.model) continue;
    return { malli: o.message.model, effort: o.perTurnEffort ?? o.effort ?? null };
  }
  return { malli: null, effort: null };
}
// Puhelimen Gemini-äppi chat-mallina (CHAT-GEMINI 15.10.2026): android.mjs ajaa sen adb:llä samalla laitteella.
export const GEMINI_AGENTTI = Object.freeze({ nimi: 'android/gemini', kuvaus: 'Gemini', tyyppi: 'gemini' });
const GEMINI_MAKSIMI = 8000; // android.mjs TEKSTIN_MAKSIMI: jakointentin tekstikenttä

// Jatkoviesti Geminille: jokainen kysymys on oma Gemini-chattinsa (android.mjs kysyGeminilta), joten aiempi keskustelu
// kulkee tekstin alussa kuten paikallisten mallien messages-listassa. Vanhimmat viestit jäävät pois, kun raja tulee vastaan.
export function geminiKehote(aiemmat, viesti, maksimi = GEMINI_MAKSIMI) {
  if (!aiemmat.length) return viesti;
  const alku = 'Jatka alla olevaa keskustelua ja vastaa vain viimeiseen viestiin.\n\n[Aiempi keskustelu]\n';
  const loppu = `\n[Uusi viesti]\n${viesti}`;
  const rivit = aiemmat.map((v) => `${v.rooli === 'kayttaja' ? 'Minä' : 'Gemini'}: ${v.teksti}\n`);
  let tila = maksimi - alku.length - loppu.length;
  const mukaan = [];
  for (let i = rivit.length - 1; i >= 0 && tila > 40; i--) {
    const r = rivit[i].length <= tila ? rivit[i] : `…${rivit[i].slice(-(tila - 2))}\n`;
    mukaan.unshift(r);
    tila -= r.length;
  }
  return mukaan.length ? alku + mukaan.join('') + loppu : viesti;
}
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
export const lmsLataa = (id) => `mkdir -p ~/.lmstudio/.internal/temp; L=~/.lmstudio/bin/lms; $L ps --json | grep -qF '"identifier":"${id}"' || `
  + `{ $L unload --all >/dev/null && $L load '${id}' -y --identifier '${id}' -c 8192; }`;

// Paikallisen mallin näyttönimi (CHAT-MALLINIMET, V-330): tunnuksen viimeinen osa ilman tiedosto- ja kvantisointipäätettä,
// kokomerkinnät isolla (qwen3.5-9b-q4_k_m.gguf → Qwen3.5 9B, qwen/qwen3.6-35b-a3b → Qwen3.6 35B A3B).
const KVANTISOINTI = /^(i?q\d.*|f16|f32|bf16|fp16|fp8|\d+bit|mlx|gguf)$/i;
export function mallinNayttonimi(id) {
  const osat = id.split('/').pop().replace(/@.*$/, '').replace(/\.gguf$/i, '').split(/[-_](?=[^-_])/);
  while (osat.length > 1 && KVANTISOINTI.test(osat.at(-1))) osat.pop();
  // q4_k_m jakautuu alaviivoista: pudota kvantisoinnin alku ja sen perään jääneet k/m/s/l-osat.
  const q = osat.findIndex((o, i) => i > 0 && /^i?q\d$/i.test(o));
  if (q > 0) osat.length = q;
  return osat.map((o) => (/^a?\d+(\.\d+)?[bkm]$/i.test(o) ? o.toUpperCase() : /^v\d/.test(o) ? o : o[0].toUpperCase() + o.slice(1))).join(' ');
}

// LM Studion /v1/models → [{ nimi: 'palvelin/<id>', kuvaus: näyttönimi, tyyppi: 'paikallinen' }]; upotusmallit pois.
export function paikallisetMallit(stdout) {
  let data;
  try { data = JSON.parse(stdout).data; } catch { return []; }
  if (!Array.isArray(data)) return [];
  const mallit = data.map((m) => m?.id).filter((id) => typeof id === 'string' && PAIKALLINEN_ID.test(id) && !/embed/i.test(id))
    .map((id) => ({ nimi: PAIKALLINEN + id, kuvaus: mallinNayttonimi(id), tyyppi: 'paikallinen' }));
  // Sama malli voi olla listalla sekä kansiona että kvantisoituna tiedostona (qwen/qwen3.5-9b ja
  // …/qwen3.5-9b-q4_k_m.gguf, 14.10.2026): törmäävä nimi saa kvantisointimerkinnän perään.
  return mallit.map((m) => {
    const q = m.nimi.split('/').pop().replace(/\.gguf$/i, '').match(/[-_@](i?q\d[a-z0-9_]*|bf16|fp16|f16)$/i);
    return q && mallit.filter((x) => x.kuvaus === m.kuvaus).length > 1 ? { ...m, kuvaus: `${m.kuvaus} ${q[1].toUpperCase()}` } : m;
  });
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

// android: () => luoAndroid-olio (palvelin.mjs); ilman sitä Gemini ei ole valittavissa.
export function luoViestit(asetukset, { aja = ajaKomento, loki = asetukset.toimintoloki, android = null } = {}) {
  let chatKaynnissa = false;
  // Käynnissä olevan chat-vastauksen pysäytin (CHAT-STOP 14.10.2026): stop-nappi katkaisee ajon, ja osittainen
  // vastaus palaa valmiina, keskeytetty: true.
  let chatPysaytin = null;
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

  // Viesti agy-ruutuun:
  // - Jos ruudussa on monivalinta (kysely: true): valitaan haluttu vaihtoehto Down-näppäimillä + Enter (tai Write-in)
  // - Tavallinen syöte: C-u tyhjentää kentän, teksti kirjaimellisesti, Enter.
  // Perillä vasta, kun kysely poistuu ruudulta tai agy:n keskustelutiedostossa on uusi käyttäjän viesti.
  async function lahetaAgyyn(nimi, r, teksti) {
    const rivi = teksti.replace(/\s*\n\s*/g, ' ').trim();
    const alku = Date.now();
    const slug = mallitonSlug(nimi);
    const onMac = r.onMac || (r.ruutu && (await aja('tmux', ['display-message', '-p', '-t', r.ruutu, '#{pane_current_command}'])).stdout.trim() === 'ssh');
    let db = null;
    let ennen = 0;
    if (onMac) {
      tyhjennaMacAgyValimuisti(slug);
      const mt = await haeMacAgyKeskustelu({ slug, alkoi: r.alkoi, aja });
      if (mt?.loytyi) {
        db = mt.dbPolku;
        ennen = (mt.viestit ?? []).filter((v) => v.rooli === 'kayttaja').length;
      }
    } else {
      db = loydaKeskustelu(slug, r.alkoi, asetukset.agyHakemisto);
      ennen = db ? agyViestit(db, Infinity).filter((v) => v.rooli === 'kayttaja').length : 0;
    }

    let onkoKysely = false;
    const capt = await aja('tmux', ['capture-pane', '-p', '-t', r.ruutu]);
    if (capt.koodi === 0) {
      onkoKysely = jasennaAgyRuutu(capt.stdout).kysely;
    } else if (r.kysely != null) {
      onkoKysely = r.kysely === true;
    }

    if (onkoKysely) {
      let vaihtoehdot = [];
      if (db) {
        let viestit = [];
        if (onMac) {
          const mt = await haeMacAgyKeskustelu({ slug, alkoi: r.alkoi, aja });
          viestit = mt?.viestit ?? [];
        } else {
          viestit = agyViestit(db, 10);
        }
        const viimKysymys = [...viestit].reverse().find((v) => v.rooli === 'kysymys');
        vaihtoehdot = viimKysymys?.kysymykset?.[0]?.vaihtoehdot ?? [];
      }
      let valittuIdx = -1;
      const siivottu = rivi.toLowerCase().trim();
      const numMatch = /^(\d+)[\.\)]?$/.exec(siivottu);
      if (numMatch) {
        const n = Number(numMatch[1]) - 1;
        if (n >= 0 && n < vaihtoehdot.length) valittuIdx = n;
      }
      if (valittuIdx < 0 && vaihtoehdot.length) {
        const ilmanNumeroa = siivottu.replace(/^\d+[\.\)]\s*/, '');
        valittuIdx = vaihtoehdot.findIndex((v) => {
          const vn = v.nimi.toLowerCase().trim();
          const vnIlman = vn.replace(/^\d+[\.\)]\s*/, '');
          return vn === siivottu || vn === ilmanNumeroa || vnIlman === siivottu || vnIlman === ilmanNumeroa;
        });
      }
      if (valittuIdx >= 0) {
        const painallukset = [];
        for (let i = 0; i < valittuIdx; i++) painallukset.push('Down');
        painallukset.push('Enter');
        for (const p of painallukset) {
          const t = await aja('tmux', ['send-keys', '-t', r.ruutu, p]);
          if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
        }
      } else {
        // Custom write-in: mennään Write-in... -kohtaan (vaihtoehdot.length), painetaan Enter, kirjoitetaan teksti
        const painallukset = [];
        for (let i = 0; i < (vaihtoehdot.length || 1); i++) painallukset.push('Down');
        painallukset.push('Enter');
        for (const p of painallukset) {
          const t = await aja('tmux', ['send-keys', '-t', r.ruutu, p]);
          if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
        }
        await new Promise((ok) => setTimeout(ok, asetukset.kirjoitaTauko ?? 300));
        for (const a of [['C-u'], ['-l', rivi], ['Enter']]) {
          const t = await aja('tmux', ['send-keys', '-t', r.ruutu, ...a]);
          if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
        }
      }
    } else {
      for (const a of [['C-u'], ['-l', rivi], ['Enter']]) {
        const t = await aja('tmux', ['send-keys', '-t', r.ruutu, ...a]);
        if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      }
    }

    const raja = Date.now() + (asetukset.perillaRaja ?? 10_000);
    let perilla = false;
    while (!perilla) {
      if (onkoKysely) {
        const capt = await aja('tmux', ['capture-pane', '-p', '-t', r.ruutu]);
        if (capt.koodi === 0 && !jasennaAgyRuutu(capt.stdout).kysely) {
          perilla = true;
          break;
        }
      }
      if (onMac) {
        tyhjennaMacAgyValimuisti(slug);
        const mt = await haeMacAgyKeskustelu({ slug, alkoi: r.alkoi, aja });
        const nytMaara = (mt?.viestit ?? []).filter((v) => v.rooli === 'kayttaja').length;
        if (nytMaara > ennen) {
          perilla = true;
          break;
        }
      } else {
        const d = db ?? loydaKeskustelu(slug, r.alkoi, asetukset.agyHakemisto);
        const maara = (x) => (x ? agyViestit(x, Infinity).filter((v) => v.rooli === 'kayttaja').length : 0);
        if (maara(d) > ennen) {
          perilla = true;
          break;
        }
      }
      const capt = await aja('tmux', ['capture-pane', '-p', '-t', r.ruutu]);
      if (capt.koodi === 0) {
        const j = jasennaAgyRuutu(capt.stdout);
        if (capt.stdout.includes(`> ${rivi}`) && (j.tila === 'busy' || !capt.stdout.trim().endsWith(`> ${rivi}`))) {
          perilla = true;
          break;
        }
      }
      if (Date.now() >= raja) break;
      await new Promise((ok) => setTimeout(ok, asetukset.perillaVali ?? 500));
    }
    const kirjaus = { toiminto: 'viesti', nimi, istunto: r.ruutu, merkkeja: rivi.length, alku: rivi.slice(0, 40), kesto: Date.now() - alku, agy: true };
    if (!perilla) {
      const ruutu = await aja('tmux', ['capture-pane', '-p', '-t', r.ruutu]);
      kirjaa({ ...kirjaus, tulos: 'ei näkynyt', ruutu: ruutu.stdout.split('\n').filter((x) => x.trim()).slice(-8) });
      throw new Hylatty(504, 'viesti ei näkynyt agy-istunnossa — se voi odottaa istunnon syöttökentässä tai kysymyksen takana; tarkista ennen uudelleenlähetystä');
    }
    kirjaa({ ...kirjaus, tulos: 'ok' });
    return { ok: true, istunto: r.ruutu };
  }

  // Skoopin pakkaamattomat istunnot uusin ensin: pakattu istunto ei ole enää skoopin keskustelu (käyttäjä 13.10.2026),
  // ja automaattisiirron jälkeen uusi istunto korvaa vanhan samassa näkymässä.
  // Asynkroninen (ISTUNNOT-SUORITUSKYKY): äppi kyselee viestejä jatkuvasti, eikä tmux-haku saa pysäyttää palvelua.
  const skoopinIstunnot = async (nimi) => {
    const skoopit = lueSkoopit(asetukset.juuri);
    if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
    return (await istunnotAsync({ ...asetukset, aja, skooppiNimet: Object.keys(skoopit) })).filter((i) => i.skooppi === nimi);
  };
  const avoinna = (lista) => lista.filter((i) => !i.pakattu).sort((a, b) => b.alkoi - a.alkoi);
  const avoimet = async (nimi) => avoinna(await skoopinIstunnot(nimi));

  // Ainoa tmux-istunto, jonka ruudun prosessi on istunnon claude tai sen vanhempi (sama sääntö kuin pakkaa).
  async function tmuxIstunto(nimi) {
    const omat = (await avoimet(nimi)).filter((i) => i.ruutu);
    if (omat.length !== 1) throw new Hylatty(409, omat.length ? 'skoopissa on useita tmux-istuntoja' : 'skooppi ei ole auki tmuxissa');
    const [i] = omat;
    const r = await aja('tmux', ['display-message', '-p', '-t', i.ruutu, '#{pane_pid}']);
    const ruudunPid = Number(r.stdout.trim());
    if (r.koodi !== 0 || !(ruudunPid === i.pid || ruudunPid === i.vanhempi || (i.tyyppi === 'agy' && i.pid == null))) throw new Hylatty(409, 'istunnon tmux-ruutu ei täsmää');
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
  const nebiusAvain = () => asetukset.nebiusTiedosto ?? join(homedir(), '.config/scopes/nebius-avain');
  const nebiusMallit = () => (existsSync(nebiusAvain()) ? NEBIUS_CHAT_MALLIT : []);
  const kaikkiMallit = async () => [...MALLIT, ...(android ? [GEMINI_AGENTTI] : []), ...await haePaikalliset(), ...nebiusMallit()];

  // Paikallisen mallin keskustelu talletetaan itse (LM Studio ei pidä historiaa): chatDir/paikalliset/<uuid>.json.
  // Samaan kansioon menevät Gemini-keskustelut, koska Geminin oma historia on joka kysymykselle eri chat.
  const paikallisetDir = () => join(asetukset.chatDir, 'paikalliset');
  const luePaikallinen = (id) => { try { return JSON.parse(readFileSync(join(paikallisetDir(), `${id}.json`), 'utf8')); } catch { return null; } };

  async function paikallinenChat(valittu, viesti, jatko, { pala, alku, signal, pysaytetty }) {
    const k = jatko ? luePaikallinen(jatko) : { agentti: valittu.nimi, viestit: [] };
    if (!k) throw new Hylatty(404, 'tuntematon keskustelu');
    if (k.agentti !== valittu.nimi) throw new Hylatty(409, 'keskustelu kuuluu toiselle mallille');
    k.viestit.push({ rooli: 'kayttaja', teksti: viesti, aika: new Date().toISOString() });
    const runko = JSON.stringify({ model: valittu.nimi.slice(PAIKALLINEN.length), stream: true,
      messages: k.viestit.map((v) => ({ role: v.rooli === 'kayttaja' ? 'user' : 'assistant', content: v.teksti })) });
    alku?.();
    const lataus = await aja('ssh', [...SSH, lmsLataa(valittu.nimi.slice(PAIKALLINEN.length))], { aikaraja: 240_000, signal });
    if (lataus.koodi !== 0 && !pysaytetty()) {
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
    const t = pysaytetty() ? null : await aja('ssh', [...SSH, LMS_CHAT], { syote: runko, aikaraja: 300_000, riville, signal, puskuri: 32 << 20 });
    // Pysäytetty: käyttäjän viesti ja osittainen vastaus jäävät historiaan, kuten claude-transkriptiin.
    if (!pysaytetty() && (t.koodi !== 0 || !vastaus)) {
      throw new Hylatty(502, `malli ei vastannut: ${(syy ?? t.stderr.trim().split('\n').filter(Boolean).pop() ?? `ssh exit ${t.koodi}`).slice(0, 300)}`);
    }
    vastaus = vastaus.trim();
    if (vastaus) k.viestit.push({ rooli: 'agentti', teksti: vastaus, aika: new Date().toISOString() });
    const id = jatko ?? randomUUID();
    mkdirSync(paikallisetDir(), { recursive: true });
    writeFileSync(join(paikallisetDir(), `${id}.json`), JSON.stringify(k));
    return { vastaus, keskustelu: id, agentti: valittu.nimi, kustannus: 0, ...(pysaytetty() ? { keskeytetty: true } : {}) };
  }

  async function nebiusChat(valittu, viesti, jatko, { pala, alku, signal, pysaytetty }) {
    const k = jatko ? luePaikallinen(jatko) : { agentti: valittu.nimi, viestit: [] };
    if (!k) throw new Hylatty(404, 'tuntematon keskustelu');
    if (k.agentti !== valittu.nimi) throw new Hylatty(409, 'keskustelu kuuluu toiselle mallille');
    let avain;
    try { avain = readFileSync(nebiusAvain(), 'utf8').trim(); } catch { throw new Hylatty(409, 'Nebius-avain puuttuu (Asetukset → Nebius)'); }
    k.viestit.push({ rooli: 'kayttaja', teksti: viesti, aika: new Date().toISOString() });
    const runko = JSON.stringify({ model: valittu.nimi.slice(NEBIUS.length), stream: true, stream_options: { include_usage: true }, max_tokens: 8192,
      messages: k.viestit.map((v) => ({ role: v.rooli === 'kayttaja' ? 'user' : 'assistant', content: v.teksti })) });
    alku?.();
    let vastaus = '';
    let syy = null;
    let kaytto = null;
    // SSE-rivit kuten paikallisella mallilla; ajattelu (reasoning_content) jää pois, käyttö kustannusta varten.
    const riville = (r) => {
      let e;
      try { e = JSON.parse(r.replace(/^data: /, '')); } catch { return; }
      if (e.detail || e.error) syy = e.error?.message ?? String(e.detail ?? e.error);
      if (e.usage) kaytto = e.usage;
      const d = e.choices?.[0]?.delta?.content;
      if (d) { vastaus += d; pala?.(d); }
    };
    // ssh:n koodi 255 = yhteys ei auennut, jolloin kokeillaan seuraavaa reittiä; muu virhe on Nebiuksen vastaus.
    let t = null;
    for (const kone of NEBIUS_REITIT) {
      if (pysaytetty()) break;
      t = await aja('ssh', ['-o', 'ConnectTimeout=3', '-o', 'BatchMode=yes', kone, NEBIUS_CHAT], { syote: `${avain}\n${runko}`, aikaraja: 300_000, riville, signal, puskuri: 32 << 20 });
      if (t.koodi !== 255) break;
    }
    if (!pysaytetty() && (t.koodi !== 0 || !vastaus)) {
      throw new Hylatty(502, `Nebius ei vastannut: ${(syy ?? t.stderr.trim().split('\n').filter(Boolean).pop() ?? `ssh exit ${t.koodi}`).slice(0, 300)}`);
    }
    vastaus = vastaus.trim();
    if (vastaus) k.viestit.push({ rooli: 'agentti', teksti: vastaus, aika: new Date().toISOString() });
    const id = jatko ?? randomUUID();
    mkdirSync(paikallisetDir(), { recursive: true });
    writeFileSync(join(paikallisetDir(), `${id}.json`), JSON.stringify(k));
    const kustannus = kaytto ? (kaytto.prompt_tokens * valittu.hinta[0] + kaytto.completion_tokens * valittu.hinta[1]) / 1e6 : null;
    return { vastaus, keskustelu: id, agentti: valittu.nimi, kustannus, ...(pysaytetty() ? { keskeytetty: true } : {}) };
  }

  async function geminiChat(valittu, viesti, jatko, { pala, alku, pysaytetty }) {
    const k = jatko ? luePaikallinen(jatko) : { agentti: valittu.nimi, viestit: [] };
    if (!k) throw new Hylatty(404, 'tuntematon keskustelu');
    if (k.agentti !== valittu.nimi) throw new Hylatty(409, 'keskustelu kuuluu toiselle mallille');
    const kehote = geminiKehote(k.viestit, viesti);
    k.viestit.push({ rooli: 'kayttaja', teksti: viesti, aika: new Date().toISOString() });
    alku?.();
    const { vastaus } = await android().kysyGeminilta({ teksti: kehote, pala, pysaytetty });
    if (!vastaus && !pysaytetty()) throw new Hylatty(502, 'Gemini ei vastannut (ruudulta ei löytynyt vastausta)');
    if (vastaus) k.viestit.push({ rooli: 'agentti', teksti: vastaus, aika: new Date().toISOString() });
    const id = jatko ?? randomUUID();
    mkdirSync(paikallisetDir(), { recursive: true });
    writeFileSync(join(paikallisetDir(), `${id}.json`), JSON.stringify(k));
    return { vastaus, keskustelu: id, agentti: valittu.nimi, kustannus: 0, ...(pysaytetty() ? { keskeytetty: true } : {}) };
  }

  const malliTranskriptista = (rivit) => {
    for (const r of rivit) { try { const m = JSON.parse(r).message?.model; if (MALLIT.some((x) => x.nimi === m)) return m; } catch { /* ohita */ } }
    return null;
  };

  return {
    agentit: kaikkiMallit,

    keskustelut() {
      const dir = chatProjekti();
      const nimet = lueAgentit();
      const tulos = [];
      // Ilman yhtään Claude-chattia kansiota ei ole, mutta paikalliset ja Gemini-keskustelut luetaan silti.
      for (const f of existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.jsonl')) : []) {
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
        ?? nebiusMallit().find((a) => a.nimi === agentti)
        ?? (android && agentti === GEMINI_AGENTTI.nimi ? GEMINI_AGENTTI : undefined)
        ?? (typeof agentti === 'string' && agentti.startsWith(PAIKALLINEN) ? (await haePaikalliset()).find((a) => a.nimi === agentti) : undefined);
      if (!valittu) throw new Hylatty(400, 'tuntematon agentti');
      if (typeof viesti !== 'string' || !viesti.trim()) throw new Hylatty(400, 'viesti puuttuu');
      if (viesti.length > VIESTIN_MAKSIMI) throw new Hylatty(413, `viesti yli ${VIESTIN_MAKSIMI} merkkiä`);
      if (jatko != null && !(typeof jatko === 'string' && ISTUNTO_ID.test(jatko))) throw new Hylatty(400, 'keskustelun tunnus ei kelpaa');
      if (chatKaynnissa) throw new Hylatty(429, 'edellinen chat-vastaus on vielä kesken');
      chatKaynnissa = true;
      const pysaytin = chatPysaytin = new AbortController();
      const pysaytetty = () => pysaytin.signal.aborted;
      signal = signal ? AbortSignal.any([signal, pysaytin.signal]) : pysaytin.signal;
      try {
        if (valittu.tyyppi === 'nebius') return await nebiusChat(valittu, viesti, jatko, { pala, alku, signal, pysaytetty });
        if (valittu.tyyppi === 'paikallinen') return await paikallinenChat(valittu, viesti, jatko, { pala, alku, signal, pysaytetty });
        if (valittu.tyyppi === 'gemini') return await geminiChat(valittu, viesti, jatko, { pala, alku, pysaytetty });
        mkdirSync(asetukset.chatDir, { recursive: true });
        const argumentit = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--tools', '',
          '--model', valittu.nimi,
          ...(jatko ? ['--resume', jatko] : [])];
        alku?.();
        let lohkoja = 0;
        // Pysäytyksen varalle: istunnon id init-rivistä ja tähän asti kirjoitettu teksti (result-riviä ei tule).
        let istunto = null;
        let osittain = '';
        const kirjoita = (t) => { osittain += t; pala?.(t); };
        const riville = (r) => {
          let e;
          try { e = JSON.parse(r); } catch { return; }
          if (e.type === 'system' && ISTUNTO_ID.test(e.session_id ?? '')) istunto = e.session_id;
          if (e.type !== 'stream_event') return;
          // Uusi tekstilohko saman vastauksen sisällä erotetaan tyhjällä rivillä, kuten result-kenttä.
          if (e.event?.type === 'content_block_start' && e.event.content_block?.type === 'text' && lohkoja++) kirjoita('\n\n');
          if (e.event?.type === 'content_block_delta' && e.event.delta?.type === 'text_delta' && e.event.delta.text) kirjoita(e.event.delta.text);
        };
        const muistaAgentti = (id) => {
          if (!ISTUNTO_ID.test(id ?? '')) return;
          const nimet = lueAgentit();
          if (nimet[id] !== valittu.nimi) writeFileSync(agenttiTiedosto(), JSON.stringify({ ...nimet, [id]: valittu.nimi }));
        };
        const t = await aja('claude', argumentit, { syote: viesti, cwd: asetukset.chatDir, aikaraja: 300_000, riville, signal, puskuri: 32 << 20 });
        if (pysaytetty()) {
          const id = istunto ?? jatko ?? null;
          muistaAgentti(id);
          return { vastaus: osittain.trim(), keskustelu: id, agentti: valittu.nimi, kustannus: null, keskeytetty: true };
        }
        let j = null;
        for (const r of t.stdout.split('\n')) { try { const e = JSON.parse(r); if (e.type === 'result') j = e; } catch { /* ohita */ } }
        if (t.koodi !== 0 || !j || j.is_error) {
          const syy = (j?.result ?? t.stderr.trim().split('\n').filter(Boolean).pop() ?? `claude exit ${t.koodi}`).slice(0, 300);
          throw new Hylatty(502, `agentti ei vastannut: ${syy}`);
        }
        muistaAgentti(j.session_id);
        return { vastaus: j.result ?? '', keskustelu: j.session_id, agentti: valittu.nimi, kustannus: j.total_cost_usd ?? null };
      } finally {
        chatKaynnissa = false;
        if (chatPysaytin === pysaytin) chatPysaytin = null;
      }
    },

    // Stop-nappi (CHAT-STOP): keskeyttää käynnissä olevan vastauksen heti; chat() palaa osittaisella vastauksella.
    pysaytaChat() {
      if (!chatPysaytin) throw new Hylatty(409, 'ei käynnissä olevaa vastausta');
      chatPysaytin.abort();
      kirjaa({ toiminto: 'chat-stop' });
      return { ok: true };
    },

    // Skoopin istunnon viestit, uusin pakkaamaton istunto. Ei sellaista → { auki: false }, jolloin äppi tarjoaa purun;
    // pakattu: true, kun skoopissa on vain pakattuja istuntoja (keskustelu tyhjennetään, Pura sulkee ne ensin).
    async skoopinViestit(nimi) {
      const kaikki = await skoopinIstunnot(nimi);
      const omat = avoinna(kaikki);
      if (!omat.length) return { nimi, auki: false, pakattu: kaikki.length > 0, istunto: null, voiLahettaa: false, viestit: [] };
      const [i] = omat;
      if (i.tyyppi === 'agy') {
        let viestit = (i.viestit && i.viestit.length) ? i.viestit : [];
        let db = i.dbPolku ?? (i.polku?.endsWith('.db') ? i.polku : null);
        if (!viestit.length && i.onMac) {
          const mt = await haeMacAgyKeskustelu({ slug: mallitonSlug(nimi), alkoi: i.alkoi, aja });
          if (mt?.loytyi) {
            viestit = mt.viestit ?? [];
            db = mt.dbPolku;
          }
        } else if (!viestit.length) {
          db ??= loydaKeskustelu(mallitonSlug(nimi), i.alkoi, asetukset.agyHakemisto);
          if (db) viestit = agyViestit(db);
        }
        return {
          nimi, auki: true,
          istunto: { id: i.id, nimi: i.nimi, tila: i.tila, konteksti: i.konteksti, malli: i.malli ?? null, effort: i.effort ?? null, tyyppi: 'agy' },
          voiLahettaa: Boolean(i.ruutu) && omat.filter((x) => x.ruutu).length === 1,
          viestit,
        };
      }
      let transkripti = '';
      try { transkripti = readFileSync(i.polku, 'utf8'); } catch { /* uusi istunto ilman transkriptia */ }
      return {
        nimi, auki: true,
        istunto: { id: i.id, nimi: i.nimi, tila: i.tila, konteksti: i.konteksti, tyyppi: 'claude', ...istunnonAsetukset(transkripti) },
        voiLahettaa: Boolean(i.ruutu) && omat.filter((x) => x.ruutu).length === 1,
        viestit: keskustelu(transkripti),
      };
    },

    // Agy-istunto (AGY-PRE-ISTUNTO): skoopissa ei ole Claude-istuntoa, mutta tmuxissa on agy-ruutu; viestit luetaan agy:n
    // keskustelutiedostosta (agy-istunto.mjs). null = skoopilla ei ole agy-istuntoa → äppi tarjoaa purun.
    async agyViestit(nimi) {
      if ((await avoimet(nimi)).length) return null;
      const [r] = await agyRuudut(aja, nimi);
      if (!r) return null;
      let viestit = [];
      let db = null;
      if (r.onMac) {
        const mt = await haeMacAgyKeskustelu({ slug: mallitonSlug(nimi), alkoi: r.alkoi, aja });
        if (mt?.loytyi) {
          viestit = mt.viestit ?? [];
          db = mt.dbPolku;
        }
      } else {
        db = loydaKeskustelu(mallitonSlug(nimi), r.alkoi, asetukset.agyHakemisto);
        viestit = db ? agyViestit(db) : [];
      }
      const ruutu = await aja('tmux', ['capture-pane', '-p', '-t', r.ruutu]);
      return {
        nimi, auki: true,
        istunto: { id: r.ruutu, nimi: r.ruutu, tila: ruudunTila(ruutu.stdout), konteksti: null, malli: null, effort: null, tyyppi: 'agy' },
        voiLahettaa: true,
        viestit,
      };
    },

    // Nopea tarkistus: onko skoopilla käynnissä oleva agy-ruutu ilman raskasta tietokannan avausta
    async onkoAgy(nimi) {
      const [r] = await agyRuudut(aja, nimi);
      return Boolean(r);
    },

    // Viesti skoopin istuntoon: kirjoitetaan ruutuun kirjaimellisesti, rivinvaihdot välilyönneiksi (Enter lähettäisi).
    async lahetaSkooppiin(nimi, teksti) {
      if (typeof teksti !== 'string' || !teksti.trim()) throw new Hylatty(400, 'viesti puuttuu');
      if (teksti.length > VIESTIN_MAKSIMI) throw new Hylatty(413, `viesti yli ${VIESTIN_MAKSIMI} merkkiä`);
      const omat = await avoimet(nimi);
      if (omat.length === 1 && omat[0].tyyppi === 'agy') {
        return lahetaAgyyn(nimi, omat[0], teksti);
      }
      if (!omat.length) {
        const [r] = await agyRuudut(aja, nimi);
        if (r) return lahetaAgyyn(nimi, r, teksti);
      }
      const i = await tmuxIstunto(nimi);
      if (i.tyyppi === 'agy') {
        return lahetaAgyyn(nimi, i, teksti);
      }
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
      // V-515 (16.10.2026): Claude Code palauttaa perutun vuoron (sa-tick, API-virhe, keskeytys) viestin syöttökenttään,
      // ja uusi teksti liimautui sen perään. C-u tyhjentää kentän ensin (tyhjässä kentässä ei tee mitään).
      for (const a of [['C-u'], ['-l', rivi], ['Enter']]) {
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

    // Skoopin stop-nappi (CHAT-STOP): Escape keskeyttää työskentelevän istunnon kuten Claude Coden näppäimistöllä.
    // Vain työn aikana: vapaassa istunnossa Escape tyhjentäisi kirjoitetun syötteen, kysymyksessä sulkisi kortin.
    async pysaytaSkooppi(nimi) {
      let i;
      try {
        i = await tmuxIstunto(nimi);
      } catch (e) {
        const [r] = await agyRuudut(aja, nimi);
        if (r) {
          const ruutu = await aja('tmux', ['capture-pane', '-p', '-t', r.ruutu]);
          i = { id: r.ruutu, ruutu: r.ruutu, tila: jasennaAgyRuutu(ruutu.stdout).tila };
        } else {
          throw e;
        }
      }
      if (i.tila !== 'busy' && i.tila !== 'shell') throw new Hylatty(409, 'istunto ei ole työssä');
      const t = await aja('tmux', ['send-keys', '-t', i.ruutu, 'Escape']);
      if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      kirjaa({ toiminto: 'stop', nimi, istunto: i.id });
      return { ok: true, istunto: i.id };
    },

    // Mallinappi (MALLINAPPI 16.10.2026): /model ja /effort istunnon omasta valitsimesta, kuten käyttäjä käyttäisi ne.
    // Suora `/model <id>` ja `/effort <taso>` tallentavat globaalin oletuksen settings.json:iin (todettu 16.10.2026); valitsimen
    // `s`-näppäin vaihtaa vain tälle istunnolle, joten kumpikin kulkee valitsimen kautta ja tulos tarkistetaan ruudusta.
    // Vain vapaassa istunnossa: työn aikana komento jäisi jonoon, ja kysymyskortti söisi sen. Arvot tarkistetaan listoilta.
    async vaihdaMalli(nimi, { malli, effort } = {}) {
      if (malli == null && effort == null) throw new Hylatty(400, 'malli tai effort puuttuu');
      const valittuMalli = malli != null ? MALLIT.find((m) => m.nimi === malli) : null;
      if (malli != null && !valittuMalli) throw new Hylatty(400, 'tuntematon malli');
      if (effort != null && !EFFORTIT.includes(effort)) throw new Hylatty(400, 'tuntematon effort');
      const i = await tmuxIstunto(nimi);
      if (i.tila !== 'idle') throw new Hylatty(409, 'istunto ei ole vapaa');
      let transkripti = '';
      try { transkripti = readFileSync(i.polku, 'utf8'); } catch { /* ei transkriptia */ }
      const viimeinen = keskustelu(transkripti, 1)[0];
      if (viimeinen?.rooli === 'kysymys' && !viimeinen.vastattu) throw new Hylatty(409, 'kysymys odottaa vastausta');
      const tauko = () => new Promise((r) => setTimeout(r, asetukset.malliTauko ?? 1000));
      const nappaimet = async (...a) => {
        const t = await aja('tmux', ['send-keys', '-t', i.ruutu, ...a]);
        if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      };
      const ruutu = async () => (await aja('tmux', ['capture-pane', '-p', '-t', i.ruutu])).stdout ?? '';
      const avaa = async (komento) => { await nappaimet('C-u'); await nappaimet('-l', komento); await nappaimet('Enter'); await tauko(); };
      // Välimuistivaroituksen "Change effort level?" Yes-vaihtoehto tallentaa globaalin oletuksen (V-525, 16.10.2026), joten
      // sitä ei koskaan vahvisteta: Escape, ja jos ikkuna jäi auki, numero 2 ("No, go back"). Auki jäänyt ikkuna sanotaan virheessä.
      const VAHVISTUS = /Change effort level\?/;
      const suljeVahvistus = async () => {
        await nappaimet('Escape').catch(() => {});
        await tauko();
        if (VAHVISTUS.test(await ruutu())) { await nappaimet('-l', '2').catch(() => {}); await tauko(); }
        return !VAHVISTUS.test(await ruutu());
      };
      const peru = async (syy) => {
        const suljettu = VAHVISTUS.test(await ruutu()) ? await suljeVahvistus() : (await nappaimet('Escape').catch(() => {}), true);
        throw new Hylatty(502, suljettu ? syy : `${syy}; vahvistusikkuna jäi auki ruutuun`);
      };
      const vahvista = async (odotus, syy) => {
        await nappaimet('-l', 's');
        await tauko();
        const nyt = await ruutu();
        if (VAHVISTUS.test(nyt)) {
          const suljettu = await suljeVahvistus();
          throw new Hylatty(409, suljettu ? 'vaihto vaatii välimuistivahvistuksen, jota ei hyväksytä (tallentaisi globaalin oletuksen); ei vaihdettu' : 'vahvistusikkuna jäi auki ruutuun');
        }
        if (!odotus.test(nyt)) await peru(syy);
      };
      const komennot = [];
      if (valittuMalli) {
        await avaa('/model');
        const rivit = (await ruutu()).split('\n');
        const kohde = new RegExp(`^\\s*❯?\\s*(\\d+)\\.\\s+${valittuMalli.kuvaus.replace(/\./g, '\\.')}(\\s|$)`);
        const nyt = rivit.map((r) => /^\s*❯\s*(\d+)\./.exec(r)?.[1]).find(Boolean);
        const haluttu = rivit.map((r) => kohde.exec(r)?.[1]).find(Boolean);
        if (!nyt || !haluttu) await peru('mallivalitsin ei auennut tai mallia ei löydy');
        const ero = Number(haluttu) - Number(nyt);
        if (ero) await nappaimet(...Array(Math.abs(ero)).fill(ero > 0 ? 'Down' : 'Up'));
        await vahvista(/for this session only/, 'mallin vaihto tälle istunnolle ei vahvistunut');
        komennot.push(`model ${malli}`);
      }
      if (effort != null) {
        await avaa('/effort');
        // Liukusäätimen reunat pysäyttävät: vasempaan reunaan (low) ja sieltä oikealle tasoon.
        await nappaimet(...Array(EFFORTIT.length - 1).fill('Left'));
        if (EFFORTIT.indexOf(effort)) await nappaimet(...Array(EFFORTIT.indexOf(effort)).fill('Right'));
        await vahvista(new RegExp(`effort level to ${effort} \\(this session only\\)`), 'effortin vaihto tälle istunnolle ei vahvistunut');
        komennot.push(`effort ${effort}`);
      }
      kirjaa({ toiminto: 'malli', nimi, istunto: i.id, komennot });
      return { ok: true, istunto: i.id };
    },

    // Kortin X (käyttäjä 13.10.2026, kuten Claude-äpissä): Escape sulkee auki olevan monivalinnan vastaamatta.
    async suljeKysymys(nimi) {
      const omat = await avoimet(nimi);
      let i;
      if (omat.length === 1 && omat[0].tyyppi === 'agy') {
        i = omat[0];
      } else {
        try {
          i = await tmuxIstunto(nimi);
        } catch (e) {
          const [r] = await agyRuudut(aja, nimi);
          if (r) i = { id: r.ruutu, ruutu: r.ruutu, alkoi: r.alkoi, tyyppi: 'agy' };
          else throw e;
        }
      }
      if (i.tyyppi === 'agy') {
        let onkoKysely = false;
        const capt = await aja('tmux', ['capture-pane', '-p', '-t', i.ruutu]);
        if (capt.koodi === 0) {
          onkoKysely = jasennaAgyRuutu(capt.stdout).kysely;
        } else if (i.kysely != null) {
          onkoKysely = i.kysely === true;
        }
        if (!onkoKysely) throw new Hylatty(409, 'ei auki olevaa kysymystä');
        const t = await aja('tmux', ['send-keys', '-t', i.ruutu, 'Escape']);
        if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
        kirjaa({ toiminto: 'sulje-kysymys', nimi, istunto: i.id, agy: true });
        return { ok: true, istunto: i.id };
      }
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

