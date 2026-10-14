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
//   POST /api/skoopit/<nimi>/pakkaa   /pakkaa skoopin vapaaseen tmux-istuntoon → { istunto, komento }
//   POST /api/skoopit/<nimi>/automaattisiirto | herata | herata-pois   samoin /automaattisiirto, /sa, /sa pois
//            varatulle istunnolle jonoon → { istunto, komento, jonossa: true }; GET-näkymän jonossa: [{ komento, aika }]
//   GET /api/asetukset                Automaattijatko- ja Autopack-kytkimet { automaattijatko, autopack } (toiminnot-asetukset.mjs)
//   POST /api/asetukset/<automaattijatko|autopack>/<paalle|pois>   kytkimen asetus → samat kaksi arvoa (käyttäjä 14.10.2026)
//   POST /api/uusi  {"nimi": "…"}     uusi istunto, ensimmäinen viesti /pura uusi <nimi> → { osoite }
//   GET /api/kayttoraja               Clauden 5 h ja viikkoraja { viisiTuntia, viikko: { kaytto %, nollautuu } | null } (kayttoraja.mjs)
//   GET /api/agentit                  chatin mallit: Claude ja palvelimen LM Studio (DEMO-SCOPES-UI)
//   POST /api/chat {"agentti","viesti","keskustelu"?}   agentin vastaus → { vastaus, keskustelu }
//   POST /api/chat/virta (sama runko)  vastaus NDJSON-virtana kirjain kerrallaan (DEMO-SCOPES-SUORATOISTO)
//   GET /api/chat/kaynnissa           liittyy käynnissä olevaan (tai juuri valmistuneeseen) vastaukseen uudelleen
//   GET /api/chat/keskustelut         aiemmat chat-keskustelut uusin ensin (DEMO-SCOPES-PARANNUKSET)
//   GET /api/chat/keskustelut/<id>    yhden chat-keskustelun viestit ja agentti
//   GET /api/rekisterit               kaikkien skooppien kontekstitiedostot kerran: { polku, laji, skoopit, tavut, raja, tokenit }
//            (SCOPES-INFRA-REKISTERIT 14.10.2026; tavut ja raja kuten check-rekisteri.mjs)
//   GET /api/rekisterit/<polku>       yhden kontekstitiedoston osat { polku, osat }; muu polku 404
//   GET /api/skoopit/<nimi>/viestit   skoopin istunnon viestit; { auki: false }, jos istuntoa ei ole
//   POST /api/skoopit/<nimi>/viesti {"teksti"}   viesti skoopin tmux-istuntoon (viestit.mjs)
//   POST /api/skoopit/<nimi>/liite?nimi=<tiedosto>   runko = tiedoston tavut (enintään 25 Mt) → { polku, koko };
//            äppi lisää polun viestiin, ja istunto lukee liitteen itse (liitteet.mjs, CHAT-MEDIA-SKOOPPI)
//   POST /api/skoopit/<nimi>/kysymys-pois         auki olevan monivalinnan sulku Escapella (kortin X)
//   POST /api/diagnostiikka {"laite"?, "tapahtumat": [...]}   äpin jumi- ja pyyntötapahtumat äppilokiin → { kirjattu };
//            jokainen pyyntö ja tapahtumasilmukan tukos kirjataan pyyntölokiin (diagnostiikka.mjs, SCOPES-JAATYMINEN)
//   GET|POST /api/lr/…                rekisterisynkan kaksoiskappale (LOCALREGISTER-PROTOKOLLA 14.10.2026; polut ja
//            ajopaikan perustelu scopes/localregister/palvelu.mjs)
//   GET /api/wg-asetus                äpin oman WireGuard-tunnelin asetus { asetus } (SCOPES-ETAYHTEYS 14.10.2026);
//            äppi hakee sen kotiverkossa ja käyttää sitä kodin ulkopuolella. 404, jos tiedostoa ei ole.
//
// Ympäristö: SCOPES_JUURI (projektijuuri; oletus kaksi hakemistoa tämän tiedoston yläpuolella),
// SCOPES_OSOITE (oletus 127.0.0.1), SCOPES_PORTTI (oletus 8787), CLAUDE_ISTUNNOT_DIR, CLAUDE_PROJEKTIT_DIR,
// SCOPES_CHAT_DIR (chatin työhakemisto), SCOPES_LIITTEET_DIR (oletus ~/.local/state/scopes-liitteet), SCOPES_AVAIN_TIEDOSTO (oletus ~/.config/scopes/avain; ei repossa),
// SCOPES_WG_TIEDOSTO (oletus ~/.config/scopes/wg.conf, wg-quick-muoto; ei repossa), SCOPES_TOIMINTOLOKI (oletus
// ~/.local/state/scopes-toiminnot.loki), SCOPES_PYYNTOLOKI (oletus ~/.local/state/scopes-pyynnot.loki), SCOPES_APPILOKI
// (oletus ~/.local/state/scopes-app.loki), SCOPES_TILA_DIR (pakkauskytkinten tilatiedostot; oletus
// ~/.claude/skills/keskustelun-siirto/state), SCOPES_LR_VIENTI (rekisteripolun etuliite, jonka localregister vie
// gittiin, esim. scopes/; oletus pois, LOCALREGISTER-VIENTI). Ilman avainta palvelu ei käynnisty.

import { timingSafeEqual } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { luoDiagnostiikka } from './diagnostiikka.mjs';
import { luoKayttoraja } from './kayttoraja.mjs';
import { lista, lueSkoopit, rekisterinOsat, rekisterit, yksi } from './lahteet.mjs';
import { luoLiitteet } from './liitteet.mjs';
import { luoAsetukset, OLETUS_HAKEMISTO } from './toiminnot-asetukset.mjs';
import { Hylatty, luoToiminnot } from './toiminnot.mjs';
import { luoViestit } from './viestit.mjs';
import { LrVirhe, luoLr } from '../localregister/palvelu.mjs';

const tama = dirname(fileURLToPath(import.meta.url));

export function asetuksetYmparistosta(env = process.env) {
  return {
    juuri: resolve(env.SCOPES_JUURI ?? join(tama, '../..')),
    istunnotDir: env.CLAUDE_ISTUNNOT_DIR ?? join(homedir(), '.claude/sessions'),
    projektitDir: env.CLAUDE_PROJEKTIT_DIR ?? join(homedir(), '.claude/projects'),
    avainTiedosto: env.SCOPES_AVAIN_TIEDOSTO ?? join(homedir(), '.config/scopes/avain'),
    wgTiedosto: env.SCOPES_WG_TIEDOSTO ?? join(homedir(), '.config/scopes/wg.conf'),
    toimintoloki: env.SCOPES_TOIMINTOLOKI ?? join(homedir(), '.local/state/scopes-toiminnot.loki'),
    chatDir: env.SCOPES_CHAT_DIR ?? join(homedir(), '.local/state/scopes-chat'),
    liitteetDir: env.SCOPES_LIITTEET_DIR ?? join(homedir(), '.local/state/scopes-liitteet'),
    pyyntoloki: env.SCOPES_PYYNTOLOKI ?? join(homedir(), '.local/state/scopes-pyynnot.loki'),
    appiloki: env.SCOPES_APPILOKI ?? join(homedir(), '.local/state/scopes-app.loki'),
    tilaDir: env.SCOPES_TILA_DIR ?? OLETUS_HAKEMISTO,
    lrVienti: env.SCOPES_LR_VIENTI || null,
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

export function kasittelija(asetukset, suorita = luoToiminnot(asetukset), viestit = luoViestit(asetukset), kayttoraja = luoKayttoraja(), liitteet = luoLiitteet(asetukset), diagnostiikka = luoDiagnostiikka(asetukset), kytkimet = luoAsetukset({ hakemisto: asetukset.tilaDir ?? OLETUS_HAKEMISTO, loki: asetukset.toimintoloki }), lr = luoLr({ repoJuuri: asetukset.juuri, vientiEtuliite: asetukset.lrVienti ?? null })) {
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
    const url = new URL(req.url, 'http://x');
    const polku = url.pathname;
    try {
      if (polku === '/api/terveys') return vastaa(200, { ok: true });
      if (!avainKelpaa(req.headers.authorization, asetukset.avain)) return vastaa(401, { virhe: 'avain puuttuu tai väärä' });
      if (polku.startsWith('/api/lr/')) return vastaa(200, await lr.kasittele(req.method, polku, () => runko(req, 16 << 20)));
      if (req.method === 'POST') {
        if (polku === '/api/diagnostiikka') return vastaa(200, await diagnostiikka.vastaanota(req));
        // Pakkauskytkimet (käyttäjä 14.10.2026): vain kaksi kiinteää nimeä ja paalle/pois, kirjataan toimintolokiin.
        const as = polku.match(/^\/api\/asetukset\/([^/]+)\/(paalle|pois)$/);
        if (as) return vastaa(200, kytkimet.aseta(decodeURIComponent(as[1]), as[2] === 'paalle'));
        if (polku === '/api/uusi') return vastaa(200, await suorita('uusi', (await runko(req)).nimi));
        if (polku === '/api/chat') return vastaa(200, await viestit.chat(await runko(req, 32_768)));
        if (polku === '/api/chat/virta') return await virtaa(res, await runko(req, 32_768));
        // Stop-nappi (CHAT-STOP): chat-vastaus katkeaa ja valmis-rivi tuo osittaisen vastauksen; skoopin istunto saa Escapen.
        if (polku === '/api/chat/stop') return vastaa(200, viestit.pysaytaChat());
        const st = polku.match(/^\/api\/skoopit\/([^/]+)\/stop$/);
        if (st) return vastaa(200, await viestit.pysaytaSkooppi(decodeURIComponent(st[1])));
        const v = polku.match(/^\/api\/skoopit\/([^/]+)\/viesti$/);
        if (v) return vastaa(200, await viestit.lahetaSkooppiin(decodeURIComponent(v[1]), (await runko(req, 32_768)).teksti));
        const l = polku.match(/^\/api\/skoopit\/([^/]+)\/liite$/);
        if (l) {
          const nimi = decodeURIComponent(l[1]);
          if (!Object.hasOwn(lueSkoopit(asetukset.juuri), nimi)) { req.resume(); return vastaa(404, { virhe: 'tuntematon skooppi' }); }
          return vastaa(200, await liitteet(nimi, url.searchParams.get('nimi'), req));
        }
        const kp = polku.match(/^\/api\/skoopit\/([^/]+)\/kysymys-pois$/);
        if (kp) return vastaa(200, await viestit.suljeKysymys(decodeURIComponent(kp[1])));
        const t = polku.match(/^\/api\/skoopit\/([^/]+)\/(pura|pakkaa|automaattisiirto|herata|herata-pois)$/);
        if (t) return vastaa(200, await suorita(t[2], decodeURIComponent(t[1])));
        return vastaa(404, { virhe: 'tuntematon toiminto' });
      }
      if (polku === '/api/skoopit') return vastaa(200, lista(asetukset));
      if (polku === '/api/asetukset') return vastaa(200, kytkimet.lue());
      if (polku === '/api/agentit') return vastaa(200, await viestit.agentit());
      if (polku === '/api/kayttoraja') return vastaa(200, await kayttoraja());
      // Luetaan joka pyynnöllä: avaimen vaihto ei vaadi palvelun uudelleenkäynnistystä.
      if (polku === '/api/wg-asetus') {
        try { return vastaa(200, { asetus: readFileSync(asetukset.wgTiedosto, 'utf8') }); } catch { return vastaa(404, { virhe: 'tunnelin asetusta ei ole' }); }
      }
      if (polku === '/api/chat/kaynnissa') return liity(res);
      if (polku === '/api/chat/keskustelut') return vastaa(200, viestit.keskustelut());
      const kk = polku.match(/^\/api\/chat\/keskustelut\/([^/]+)$/);
      if (kk) return vastaa(200, viestit.keskustelunViestit(decodeURIComponent(kk[1])));
      if (polku === '/api/rekisterit') return vastaa(200, rekisterit(asetukset));
      const rk = polku.match(/^\/api\/rekisterit\/(.+)$/);
      if (rk) {
        const r = rekisterinOsat(decodeURIComponent(rk[1]), asetukset);
        return r ? vastaa(200, r) : vastaa(404, { virhe: 'tuntematon kontekstitiedosto' });
      }
      const vv = polku.match(/^\/api\/skoopit\/([^/]+)\/viestit$/);
      if (vv) return vastaa(200, viestit.skoopinViestit(decodeURIComponent(vv[1])));
      const m = polku.match(/^\/api\/skoopit\/(.+)$/);
      if (m) {
        const s = yksi(decodeURIComponent(m[1]), asetukset);
        return s ? vastaa(200, { ...s, jonossa: suorita.jono?.(decodeURIComponent(m[1])) ?? [] }) : vastaa(404, { virhe: 'tuntematon skooppi' });
      }
      return vastaa(404, { virhe: 'tuntematon polku' });
    } catch (e) {
      return vastaa(e instanceof Hylatty || e instanceof LrVirhe ? e.koodi : 500, { virhe: e.message });
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
  const diagnostiikka = luoDiagnostiikka(asetukset);
  diagnostiikka.silmukka();
  const lr = luoLr({ repoJuuri: asetukset.juuri, vientiEtuliite: asetukset.lrVienti ?? null });
  lr.ajasta();
  createServer(diagnostiikka.kaari(kasittelija(asetukset, undefined, undefined, undefined, undefined, diagnostiikka, undefined, lr))).listen(portti, osoite, () =>
    console.log(`scopes-palvelu: http://${osoite}:${portti}/api/skoopit`));
}
