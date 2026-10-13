#!/usr/bin/env node
// Skooppien rajapinta iOS-äpille (DEMO-SCOPES-PALVELU 13.10.2026): luku GET:llä, kolme valmista
// hallintatoimintoa POST:lla (DEMO-SCOPES-HALLINTA 13.10.2026, turvamalli toiminnot.mjs:ssä). JSON.
// Puhelin tavoittaa palvelun kotiverkosta tai WireGuardin läpi; rekisterit ovat yksityisiä, joten jokainen
// /api/skoopit-pyyntö vaatii otsakkeen `Authorization: Bearer <avain>` (käyttäjän päätös 13.10.2026).
//
//   GET /api/terveys          { ok: true } (ei avainta)
//   GET /api/skoopit          skooppilista tiivistettynä
//   GET /api/skoopit/<nimi>   yhden skoopin rekisteri (seuraava, avoimet, viat) ja istunnot
//   POST /api/skoopit/<nimi>/pura     uusi istunto, ensimmäinen viesti /pura <nimi> → { osoite }
//   POST /api/skoopit/<nimi>/pakkaa   /pakkaa skoopin vapaaseen tmux-istuntoon → { istunto }
//   POST /api/uusi  {"nimi": "…"}     uusi istunto, ensimmäinen viesti /pura uusi <nimi> → { osoite }
//   GET /api/kayttoraja               Clauden 5 h ja viikkoraja { viisiTuntia, viikko: { kaytto %, nollautuu } | null } (kayttoraja.mjs)
//   GET /api/agentit                  chatin mallit: Claude ja palvelimen LM Studio (DEMO-SCOPES-UI)
//   POST /api/chat {"agentti","viesti","keskustelu"?}   agentin vastaus → { vastaus, keskustelu }
//   POST /api/chat/virta (sama runko)  vastaus NDJSON-virtana kirjain kerrallaan (DEMO-SCOPES-SUORATOISTO)
//   GET /api/chat/kaynnissa           liittyy käynnissä olevaan (tai juuri valmistuneeseen) vastaukseen uudelleen
//   GET /api/chat/keskustelut         aiemmat chat-keskustelut uusin ensin (DEMO-SCOPES-PARANNUKSET)
//   GET /api/chat/keskustelut/<id>    yhden chat-keskustelun viestit ja agentti
//   GET /api/skoopit/<nimi>/viestit   skoopin istunnon viestit; { auki: false }, jos istuntoa ei ole
//   POST /api/skoopit/<nimi>/viesti {"teksti"}   viesti skoopin tmux-istuntoon (viestit.mjs)
//   POST /api/skoopit/<nimi>/kysymys-pois         auki olevan monivalinnan sulku Escapella (kortin X)
//
// Ympäristö: SCOPES_JUURI (projektijuuri; oletus kaksi hakemistoa tämän tiedoston yläpuolella),
// SCOPES_OSOITE (oletus 127.0.0.1), SCOPES_PORTTI (oletus 8787), CLAUDE_ISTUNNOT_DIR, CLAUDE_PROJEKTIT_DIR,
// SCOPES_CHAT_DIR (chatin työhakemisto), SCOPES_AVAIN_TIEDOSTO (oletus ~/.config/scopes/avain; ei repossa), SCOPES_TOIMINTOLOKI (oletus
// ~/.local/state/scopes-toiminnot.loki). Ilman avainta palvelu ei käynnisty.

import { timingSafeEqual } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { luoKayttoraja } from './kayttoraja.mjs';
import { lista, yksi } from './lahteet.mjs';
import { Hylatty, luoToiminnot } from './toiminnot.mjs';
import { luoViestit } from './viestit.mjs';

const tama = dirname(fileURLToPath(import.meta.url));

export function asetuksetYmparistosta(env = process.env) {
  return {
    juuri: resolve(env.SCOPES_JUURI ?? join(tama, '../..')),
    istunnotDir: env.CLAUDE_ISTUNNOT_DIR ?? join(homedir(), '.claude/sessions'),
    projektitDir: env.CLAUDE_PROJEKTIT_DIR ?? join(homedir(), '.claude/projects'),
    avainTiedosto: env.SCOPES_AVAIN_TIEDOSTO ?? join(homedir(), '.config/scopes/avain'),
    toimintoloki: env.SCOPES_TOIMINTOLOKI ?? join(homedir(), '.local/state/scopes-toiminnot.loki'),
    chatDir: env.SCOPES_CHAT_DIR ?? join(homedir(), '.local/state/scopes-chat'),
  };
}

// Vakioaikainen vertailu, ettei vastausaika paljasta avaimen alkua.
export function avainKelpaa(otsake, avain) {
  const annettu = Buffer.from(/^Bearer (.+)$/.exec(otsake ?? '')?.[1] ?? '');
  const oikea = Buffer.from(avain);
  return annettu.length === oikea.length && timingSafeEqual(annettu, oikea);
}

// Pyynnön runko JSON-oliona, enintään `raja` tavua (oletus 1 kt; viestit 32 kt).
function runko(req, raja = 1024) {
  return new Promise((ok, ei) => {
    let data = '';
    let liian = false;
    req.setEncoding('utf8');
    // Ylisuuri runko luetaan loppuun talteen ottamatta, jotta 413-vastaus ehtii perille.
    req.on('data', (pala) => { if (!liian) data += pala; if (data.length > raja) liian = true; });
    req.on('end', () => {
      if (liian) return ei(new Hylatty(413, 'runko liian suuri'));
      try { ok(data ? JSON.parse(data) : {}); } catch { ei(new Hylatty(400, 'runko ei ole JSONia')); }
    });
    req.on('error', ei);
  });
}

export function kasittelija(asetukset, suorita = luoToiminnot(asetukset), viestit = luoViestit(asetukset), kayttoraja = luoKayttoraja()) {
  // Chat suoratoistona (DEMO-SCOPES-SUORATOISTO): NDJSON-rivit {tyyppi: 'pala', teksti} …, lopuksi
  // {tyyppi: 'valmis', vastaus, keskustelu, …} tai {tyyppi: 'virhe', virhe}. Hylkäys ennen agentin käynnistystä
  // palaa tavallisena virhekoodina. Yhteyden katketessa (puhelimen näyttölukko, äpin vaihto) agentti jatkaa, ja
  // GET /api/chat/kaynnissa liittyy ajoon uudelleen: ensin tähän asti kirjoitettu teksti yhtenä palana, sitten loput.
  // Valmis ajo pysyy liityttävänä LOPPUTULOS_MS ajan, jotta uuden keskustelun tunnus ei katoa katkoksessa.
  const NDJSON = { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-cache' };
  const LOPPUTULOS_MS = 10 * 60_000;
  let ajo = null; // { teksti, kuuntelijat: Set<res>, loppu: tapahtuma | null, aika }

  const kirjoitaRes = (res, o) => { if (!res.destroyed) res.write(JSON.stringify(o) + '\n'); };

  async function virtaa(res, pyynto) {
    let oma = null;
    try {
      const v = await viestit.chat(pyynto, {
        alku: () => {
          oma = ajo = { teksti: '', kuuntelijat: new Set([res]), loppu: null, aika: Date.now() };
          res.on('close', () => oma.kuuntelijat.delete(res));
          res.writeHead(200, NDJSON);
        },
        pala: (teksti) => { oma.teksti += teksti; for (const r of oma.kuuntelijat) kirjoitaRes(r, { tyyppi: 'pala', teksti }); },
      });
      oma.loppu = { tyyppi: 'valmis', ...v };
    } catch (e) {
      if (!oma) throw e;
      oma.loppu = { tyyppi: 'virhe', virhe: e.message };
    }
    oma.aika = Date.now();
    for (const r of oma.kuuntelijat) { kirjoitaRes(r, oma.loppu); r.end(); }
    oma.kuuntelijat.clear();
  }

  function liity(res) {
    if (!ajo || (ajo.loppu && Date.now() - ajo.aika > LOPPUTULOS_MS)) throw new Hylatty(404, 'ei käynnissä olevaa vastausta');
    res.writeHead(200, NDJSON);
    if (ajo.teksti) kirjoitaRes(res, { tyyppi: 'pala', teksti: ajo.teksti });
    if (ajo.loppu) { kirjoitaRes(res, ajo.loppu); return res.end(); }
    const oma = ajo;
    oma.kuuntelijat.add(res);
    res.on('close', () => oma.kuuntelijat.delete(res));
  }

  return async (req, res) => {
    const vastaa = (koodi, data) => {
      res.writeHead(koodi, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };
    if (req.method !== 'GET' && req.method !== 'POST') return vastaa(405, { virhe: 'vain GET ja POST' });
    const polku = new URL(req.url, 'http://x').pathname;
    try {
      if (polku === '/api/terveys') return vastaa(200, { ok: true });
      if (!avainKelpaa(req.headers.authorization, asetukset.avain)) return vastaa(401, { virhe: 'avain puuttuu tai väärä' });
      if (req.method === 'POST') {
        if (polku === '/api/uusi') return vastaa(200, await suorita('uusi', (await runko(req)).nimi));
        if (polku === '/api/chat') return vastaa(200, await viestit.chat(await runko(req, 32_768)));
        if (polku === '/api/chat/virta') return await virtaa(res, await runko(req, 32_768));
        const v = polku.match(/^\/api\/skoopit\/([^/]+)\/viesti$/);
        if (v) return vastaa(200, await viestit.lahetaSkooppiin(decodeURIComponent(v[1]), (await runko(req, 32_768)).teksti));
        const kp = polku.match(/^\/api\/skoopit\/([^/]+)\/kysymys-pois$/);
        if (kp) return vastaa(200, await viestit.suljeKysymys(decodeURIComponent(kp[1])));
        const t = polku.match(/^\/api\/skoopit\/([^/]+)\/(pura|pakkaa)$/);
        if (t) return vastaa(200, await suorita(t[2], decodeURIComponent(t[1])));
        return vastaa(404, { virhe: 'tuntematon toiminto' });
      }
      if (polku === '/api/skoopit') return vastaa(200, lista(asetukset));
      if (polku === '/api/agentit') return vastaa(200, await viestit.agentit());
      if (polku === '/api/kayttoraja') return vastaa(200, await kayttoraja());
      if (polku === '/api/chat/kaynnissa') return liity(res);
      if (polku === '/api/chat/keskustelut') return vastaa(200, viestit.keskustelut());
      const kk = polku.match(/^\/api\/chat\/keskustelut\/([^/]+)$/);
      if (kk) return vastaa(200, viestit.keskustelunViestit(decodeURIComponent(kk[1])));
      const vv = polku.match(/^\/api\/skoopit\/([^/]+)\/viestit$/);
      if (vv) return vastaa(200, viestit.skoopinViestit(decodeURIComponent(vv[1])));
      const m = polku.match(/^\/api\/skoopit\/(.+)$/);
      if (m) {
        const s = yksi(decodeURIComponent(m[1]), asetukset);
        return s ? vastaa(200, s) : vastaa(404, { virhe: 'tuntematon skooppi' });
      }
      return vastaa(404, { virhe: 'tuntematon polku' });
    } catch (e) {
      return vastaa(e instanceof Hylatty ? e.koodi : 500, { virhe: e.message });
    }
  };
}

// Pääohjelma myös symlinkin kautta (cron ajaa /srv/work-linkin läpi): node ratkaisee import.meta.url:n mutta ei argv[1]:tä.
const paaohjelma = (() => { try { return realpathSync(process.argv[1] ?? '') === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (paaohjelma) {
  const osoite = process.env.SCOPES_OSOITE ?? '127.0.0.1';
  const portti = Number(process.env.SCOPES_PORTTI ?? 8787);
  const asetukset = asetuksetYmparistosta();
  try { asetukset.avain = readFileSync(asetukset.avainTiedosto, 'utf8').trim(); } catch { asetukset.avain = ''; }
  if (asetukset.avain.length < 32) {
    console.error(`scopes-palvelu: avain puuttuu tai on alle 32 merkkiä: ${asetukset.avainTiedosto}`);
    process.exit(2);
  }
  createServer(kasittelija(asetukset)).listen(portti, osoite, () =>
    console.log(`scopes-palvelu: http://${osoite}:${portti}/api/skoopit`));
}
