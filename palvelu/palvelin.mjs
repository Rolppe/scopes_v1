#!/usr/bin/env node
// Skooppien rajapinta iOS-äpille (DEMO-SCOPES-PALVELU 13.10.2026): luku GET:llä, kolme valmista
// hallintatoimintoa POST:lla (DEMO-SCOPES-HALLINTA 13.10.2026, turvamalli toiminnot.mjs:ssä). JSON.
// Puhelin tavoittaa palvelun kotiverkosta tai WireGuardin läpi; rekisterit ovat yksityisiä, joten jokainen
// /api/skoopit-pyyntö vaatii otsakkeen `Authorization: Bearer <avain>` (käyttäjän päätös 13.10.2026).
//
//   GET /api/terveys          { ok: true } (ei avainta)
//   GET /api/skoopit          skooppilista tiivistettynä
//   GET /api/skoopit/<nimi>   yhden skoopin rekisteri (seuraava, avoimet, viat) ja istunnot
//   POST /api/skoopit/<nimi>/pura {"purkaja"?, "malli"?}   uusi istunto, ensimmäinen viesti /pura <nimi> [--ajaja=<purkaja>],
//            istunnon malli --model <malli> → { osoite }; tyhjä runko = oletukset (purkajat.mjs, SCOPES-PURA-MALLI).
//            Scopes-perhe mallitta: pura-malliton.mjs + tiedostoviesti → { osoite, tiedosto, varoitus? }; purkaja ei koske (T6b)
//   GET /api/purkajat                 purun valinnat { purkajat: [{ tunnus, kuvaus, ryhma }], mallit, oletusMalli }
//   POST /api/skoopit/<nimi>/pakkaa   /pakkaa skoopin vapaaseen tmux-istuntoon → { istunto, komento }
//   POST /api/skoopit/<nimi>/automaattisiirto | herata | herata-pois   samoin /automaattisiirto, /sa, /sa pois
//            varatulle istunnolle jonoon → { istunto, komento, jonossa: true }; GET-näkymän jonossa: [{ komento, aika }]
//   GET /api/asetukset                Automaattijatko-, Autopack- ja Automaattisiirto-kytkimet { automaattijatko, autopack, automaattisiirto } (toiminnot-asetukset.mjs)
//   POST /api/asetukset/<automaattijatko|autopack|automaattisiirto>/<paalle|pois>   kytkimen asetus → samat arvot (käyttäjä 14.10.2026, 19.10.2026)
//   GET /api/skoopit/<nimi>/asetukset[?istunto=<tunnus>]   keskustelukohtaiset kytkimet { istunto, istuntoja, automaattijatko, autopack, automaattisiirto };
//            yksi avoin istunto valitaan itsestään, ei istuntoa → istunto null ja yhteinen oletus
//   POST /api/skoopit/<nimi>/asetukset/<automaattijatko|autopack|automaattisiirto>/<paalle|pois>[?istunto=<tunnus>]   istunnon kytkin; 409 ilman valittavaa istuntoa
//   POST /api/uusi  {"nimi", "purkaja"?, "malli"?}   uusi istunto, ensimmäinen viesti /pura uusi <nimi> [--ajaja=…] → { osoite }
//   POST /api/skoopit/<nimi>/arkistoi   skoopin arkistointi ja commit (arkistoi-skooppi.mjs) → { commit, polut }
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
//   POST /api/skoopit/<nimi>/malli {"malli"?, "effort"?}   /model ja /effort vapaan istunnon tmux-ruutuun (viestit.mjs)
//   POST /api/skoopit/<nimi>/kysymys-pois         auki olevan monivalinnan sulku Escapella (kortin X)
//   POST /api/diagnostiikka {"laite"?, "tapahtumat": [...]}   äpin jumi- ja pyyntötapahtumat äppilokiin → { kirjattu };
//            jokainen pyyntö ja tapahtumasilmukan tukos kirjataan pyyntölokiin (diagnostiikka.mjs, SCOPES-JAATYMINEN)
//   GET|POST /api/lr/…                rekisterisynkan kaksoiskappale (LOCALREGISTER-PROTOKOLLA 14.10.2026; polut ja
//            ajopaikan perustelu scopes/localregister/palvelu.mjs)
//   GET /api/palvelin             PC:n tila pingin TTL:stä { tila: linux|windows|sammuksissa, osoite? } (palvelin.mjs)
//   POST /api/palvelin/<kaynnista|sammuta>   WoL / Windows → Linux -kertaboot tai poweroff → { tila, lahto, viesti, kuiva? }
//            (SCOPES-LINUX-NAPIT 15.10.2026; ei runkoa; yksi kerrallaan, muuten 429)
//   GET /api/android                 Android-puolen tila { hereilla, heratimme, koko: [w, h], kuiva } (android.mjs,
//            SCOPES-ANDROID-GEMINI 15.10.2026: Geminin etäkäyttö; ruutu herää toiminnosta ja nukkuu minuutin hiljaisuuden jälkeen)
//   GET /api/android/ruutu?leveys=    ruutukaappaus image/jpeg (oletus 720 px leveä)
//   GET /api/android/ui               uiautomator-solmut { koko, solmut: [{ teksti, kuvaus, id, luokka, napautettava, alue }],
//            gemini: { viestit: [{ rooli: gemini|kayttaja, teksti }], kaynnissa } }
//   POST /api/android/<napauta|pyyhkaise|nappi|avaa|uusi|kirjoita|laheta|talteen>   runko {x, y} | {x1, y1, x2, y2, kesto?} |
//            {nimi} | – | – | {teksti, laheta?} | – | – (koordinaatit 0–1-osuuksina ruudusta) → { ok, piste?, kuiva?, polku?, teksti? }
//   POST /api/android/liite?nimi=&teksti=   runko = tiedoston tavut → laitteelle ja Geminin liitteeksi; teksti (valinnainen)
//            kenttään ennen liitettä ja lähetys perään → { ok, nimi, liitetty, lahetetty }. kirjoita kieltäytyy (409), kun liite odottaa
//   GET /api/android/tuotokset        laitteen Download/Pictures/Movies/Documents/DCIM 14 vrk { tiedostot: [{ polku, nimi, koko, aika }] }
//   GET /api/android/tuotos?polku=    tiedoston tavut (kopio palvelimelle ~/.local/state/scopes-android/laitteelta/)
//   GET /api/wg-asetus                äpin oman WireGuard-tunnelin asetus { asetus } (SCOPES-ETAYHTEYS 14.10.2026);
//            äppi hakee sen kotiverkossa ja käyttää sitä kodin ulkopuolella. 404, jos tiedostoa ei ole.
//   GET /api/nebius-avain             Nebius Token Factory -avaimen tila { asetettu, merkkeja }; avainta ei palauteta (nebius-avain.mjs)
//   POST /api/nebius-avain {"avain"}  tallentaa avaimen palvelimen tiedostoon (600) → { asetettu, merkkeja }
//
// Ympäristö: SCOPES_JUURI (projektijuuri; oletus kaksi hakemistoa tämän tiedoston yläpuolella),
// SCOPES_OSOITE (oletus 127.0.0.1), SCOPES_PORTTI (oletus 8787), CLAUDE_ISTUNNOT_DIR, CLAUDE_PROJEKTIT_DIR,
// SCOPES_CHAT_DIR (chatin työhakemisto), SCOPES_LIITTEET_DIR (oletus ~/.local/state/scopes-liitteet), SCOPES_AVAIN_TIEDOSTO (oletus ~/.config/scopes/avain; ei repossa),
// SCOPES_WG_TIEDOSTO (oletus ~/.config/scopes/wg.conf, wg-quick-muoto; ei repossa), SCOPES_TOIMINTOLOKI (oletus
// ~/.local/state/scopes-toiminnot.loki), SCOPES_PYYNTOLOKI (oletus ~/.local/state/scopes-pyynnot.loki), SCOPES_APPILOKI
// (oletus ~/.local/state/scopes-app.loki), SCOPES_TILA_DIR (pakkauskytkinten tilatiedostot; oletus
// ~/.claude/skills/keskustelun-siirto/state), SCOPES_LR_VIENTI (rekisteripolun etuliite, jonka localregister vie
// gittiin, esim. scopes/; oletus pois, LOCALREGISTER-VIENTI), SCOPES_LINUX_KUIVA (1 = palvelimen napit eivät
// aja herätys- eikä sammutuskomentoa, :8788-koepalvelu), SCOPES_ANDROID_KUIVA (1 = Android-ohjaus lukee mutta ei herätä,
// napauta eikä vie tiedostoja), SCOPES_ANDROID_LAITE (adb-laite; oletus 127.0.0.1:5555), SCOPES_ANDROID_DIR (tuotokset;
// oletus ~/.local/state/scopes-android). Ilman avainta palvelu ei käynnisty.

import { timingSafeEqual } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { luoDiagnostiikka } from './diagnostiikka.mjs';
import { luoKayttoraja } from './kayttoraja.mjs';
import { luoAgyKayttoraja, luoMacAgyKayttoraja } from './agy-kayttoraja.mjs';
import { lista, lueSkoopit, lueViat, rekisterinOsat, rekisterit, yksi } from './lahteet.mjs';
import { luoLiitteet } from './liitteet.mjs';
import { luoNebiusAvain } from './nebius-avain.mjs';
import { luoAndroid } from './android.mjs';
import { luoLinuxServer } from './palvelin.mjs';
import { luoAsetukset, OLETUS_HAKEMISTO } from './toiminnot-asetukset.mjs';
import { luoIstuntoValinta } from './istunto-asetukset.mjs';
import { luoAgyLuvat } from './agy-luvat.mjs';
import { luoPurkajat } from './purkajat.mjs';
import { ajaKomento, Hylatty, luoToiminnot } from './toiminnot.mjs';
import { agyIstunnot } from './agy-istunto.mjs';
import { luoViestit } from './viestit.mjs';
import { LrVirhe, luoLr } from '../localregister/palvelu.mjs';
import { luoKordinaattori } from './kordinaattori.mjs';
import { luoTerminaali } from './terminal.mjs';
import { luoEconomyPalvelu } from './economy.mjs';

const tama = dirname(fileURLToPath(import.meta.url));

export function asetuksetYmparistosta(env = process.env) {
  return {
    juuri: resolve(env.SCOPES_JUURI ?? join(tama, '../..')),
    istunnotDir: env.CLAUDE_ISTUNNOT_DIR ?? join(homedir(), '.claude/sessions'),
    projektitDir: env.CLAUDE_PROJEKTIT_DIR ?? join(homedir(), '.claude/projects'),
    avainTiedosto: env.SCOPES_AVAIN_TIEDOSTO ?? join(homedir(), '.config/scopes/avain'),
    wgTiedosto: env.SCOPES_WG_TIEDOSTO ?? join(homedir(), '.config/scopes/wg.conf'),
    nebiusTiedosto: env.SCOPES_NEBIUS_TIEDOSTO ?? join(homedir(), '.config/scopes/nebius-avain'),
    toimintoloki: env.SCOPES_TOIMINTOLOKI ?? join(homedir(), '.local/state/scopes-toiminnot.loki'),
    chatDir: env.SCOPES_CHAT_DIR ?? join(homedir(), '.local/state/scopes-chat'),
    liitteetDir: env.SCOPES_LIITTEET_DIR ?? join(homedir(), '.local/state/scopes-liitteet'),
    pyyntoloki: env.SCOPES_PYYNTOLOKI ?? join(homedir(), '.local/state/scopes-pyynnot.loki'),
    appiloki: env.SCOPES_APPILOKI ?? join(homedir(), '.local/state/scopes-app.loki'),
    tilaDir: env.SCOPES_TILA_DIR ?? OLETUS_HAKEMISTO,
    lrVienti: env.SCOPES_LR_VIENTI || null,
    linuxKuiva: env.SCOPES_LINUX_KUIVA === '1',
    androidKuiva: env.SCOPES_ANDROID_KUIVA === '1',
    androidLaite: env.SCOPES_ANDROID_LAITE ?? '127.0.0.1:5555',
    androidDir: env.SCOPES_ANDROID_DIR ?? join(homedir(), '.local/state/scopes-android'),
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

export function kasittelija(asetukset, suorita = luoToiminnot(asetukset), viestit = luoViestit(asetukset, { android: () => android }), kayttoraja = luoKayttoraja(), liitteet = luoLiitteet(asetukset), diagnostiikka = luoDiagnostiikka(asetukset), kytkimet = luoAsetukset({ hakemisto: asetukset.tilaDir ?? OLETUS_HAKEMISTO, loki: asetukset.toimintoloki }), lr = luoLr({ repoJuuri: asetukset.juuri, vientiEtuliite: asetukset.lrVienti ?? null }), purkajat = luoPurkajat({ juuri: asetukset.juuri, paikalliset: () => viestit.agentit() }), linux = luoLinuxServer({ loki: asetukset.toimintoloki, kuiva: asetukset.linuxKuiva === true }), android = luoAndroid({ loki: asetukset.toimintoloki, kuiva: asetukset.androidKuiva === true, ...(asetukset.androidLaite && { laite: asetukset.androidLaite }), ...(asetukset.androidDir && { tuotoksetDir: asetukset.androidDir }) }), agyKayttoraja = luoAgyKayttoraja(), kordinaattori = luoKordinaattori(asetukset.juuri), macAgyKayttoraja = luoMacAgyKayttoraja({ aja: ajaKomento }), terminal = luoTerminaali(asetukset), economy = luoEconomyPalvelu({ juuri: asetukset.juuri, brainDir: asetukset.brainHakemisto, aja: asetukset.aja ?? ajaKomento })) {
  suorita?.asetaKytkimet?.(kytkimet);
  const istuntoValinta = luoIstuntoValinta(asetukset);
  const nebius = luoNebiusAvain({ tiedosto: asetukset.nebiusTiedosto ?? join(homedir(), '.config/scopes/nebius-avain') });
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
    const vastaaTavut = ({ tyyppi, data, nimi }) => {
      res.writeHead(200, { 'content-type': tyyppi, 'content-length': data.length, 'cache-control': 'no-store',
        ...(nimi && { 'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(nimi)}` }) });
      res.end(data);
    };
    const url = new URL(req.url, 'http://x');
    const polku = url.pathname;
    const isTerminalDelete = req.method === 'DELETE' && /^\/api\/terminal\/sessions\/[^/]+$/.test(polku);
    if (req.method !== 'GET' && req.method !== 'POST' && !isTerminalDelete) return vastaa(405, { virhe: 'vain GET ja POST' });
    try {
      if (polku === '/api/terveys') return vastaa(200, { ok: true });
      const authOtsake = req.headers.authorization ?? (url.searchParams.get('avain') ? `Bearer ${url.searchParams.get('avain')}` : '');
      if (!avainKelpaa(authOtsake, asetukset.avain)) return vastaa(401, { virhe: 'avain puuttuu tai väärä' });
      if (polku.startsWith('/api/lr/')) return vastaa(200, await lr.kasittele(req.method, polku, () => runko(req, 16 << 20)));
      if (req.method === 'DELETE') {
        const ts = polku.match(/^\/api\/terminal\/sessions\/([^/]+)$/);
        if (ts) {
          const id = decodeURIComponent(ts[1]);
          const killTmux = url.searchParams.get('killTmux') === 'true';
          return vastaa(200, await terminal.suljeIstunto(id, { killTmux }));
        }
        return vastaa(404, { virhe: 'tuntematon DELETE-polku' });
      }
      if (req.method === 'POST') {
        if (polku === '/api/diagnostiikka') return vastaa(200, await diagnostiikka.vastaanota(req));
        // Pakkauskytkimet (käyttäjä 14.10.2026): vain kaksi kiinteää nimeä ja paalle/pois, kirjataan toimintolokiin.
        const as = polku.match(/^\/api\/asetukset\/([^/]+)\/(paalle|pois)$/);
        if (as) return vastaa(200, kytkimet.aseta(decodeURIComponent(as[1]), as[2] === 'paalle'));
        // Keskustelukohtaiset kytkimet (scopes infra setting 16.10.2026): istunto valitaan itsestään tai ?istunto=<tunnus>.
        const ia = polku.match(/^\/api\/skoopit\/([^/]+)\/asetukset\/([^/]+)\/(paalle|pois)$/);
        if (ia) {
          const v = istuntoValinta(decodeURIComponent(ia[1]), url.searchParams.get('istunto'));
          if (!v.istunto) throw new Hylatty(409, v.istuntoja ? 'skoopissa on useita istuntoja; anna ?istunto=<tunnus>' : 'skoopilla ei ole avointa istuntoa');
          return vastaa(200, { ...v, ...kytkimet.asetaIstunto(decodeURIComponent(ia[2]), v.istunto, ia[3] === 'paalle') });
        }
        const ls = polku.match(/^\/api\/palvelin\/(kaynnista|sammuta)$/);
        if (ls) return vastaa(200, await linux.suorita(ls[1]));
        // Android-ohjaus (SCOPES-ANDROID-GEMINI): liite tallennetaan ensin kuten skoopin liite, sitten laitteelle.
        if (polku === '/api/android/liite') return vastaa(200, await android.liita((await liitteet('android', url.searchParams.get('nimi'), req)).polku, url.searchParams.get('teksti')));
        const an = polku.match(/^\/api\/android\/([a-z]+)$/);
        if (an) return vastaa(200, await android.suorita(an[1], await runko(req, 32_768)));
        if (polku === '/api/nebius-avain') return vastaa(200, nebius.tallenna((await runko(req)).avain));
        if (polku === '/api/uusi') { const r = await runko(req); return vastaa(200, await suorita('uusi', r.nimi, await purkajat.tarkista(r))); }
        if (polku === '/api/kordinaattori/chat') {
          const runkoData = await runko(req, 32_768);
          return vastaa(200, await viestit.chat({
            ...runkoData,
            agentti: kordinaattori.ratkaiseMalli(runkoData.agentti),
            jarjestelmaKehote: kordinaattori.kehote()
          }));
        }
        if (polku === '/api/kordinaattori/virta') {
          const runkoData = await runko(req, 32_768);
          return await virtaa(res, {
            ...runkoData,
            agentti: kordinaattori.ratkaiseMalli(runkoData.agentti),
            jarjestelmaKehote: kordinaattori.kehote()
          });
        }
        if (polku === '/api/chat') return vastaa(200, await viestit.chat(await runko(req, 32_768)));
        if (polku === '/api/chat/virta') return await virtaa(res, await runko(req, 32_768));
        // Stop-nappi (CHAT-STOP): chat-vastaus katkeaa ja valmis-rivi tuo osittaisen vastauksen; skoopin istunto saa Escapen.
        if (polku === '/api/chat/stop') return vastaa(200, viestit.pysaytaChat());
        const st = polku.match(/^\/api\/skoopit\/([^/]+)\/stop$/);
        if (st) return vastaa(200, await viestit.pysaytaSkooppi(decodeURIComponent(st[1])));
        const v = polku.match(/^\/api\/skoopit\/([^/]+)\/viesti$/);
        if (v) return vastaa(200, await viestit.lahetaSkooppiin(decodeURIComponent(v[1]), (await runko(req, 32_768)).teksti));
        const stm = polku.match(/^\/api\/skoopit\/([^/]+)\/stream$/);
        if (stm) {
          const nimi = decodeURIComponent(stm[1]);
          const { teksti } = await runko(req, 32_768);
          const tulos = await viestit.lahetaSkooppiin(nimi, teksti);
          res.writeHead(200, NDJSON);
          kirjoitaRes(res, { tyyppi: "valmis", vastaus: "", istunto: tulos?.istunto ?? null });
          res.end();
          return;
        }
        const ml = polku.match(/^\/api\/skoopit\/([^/]+)\/malli$/);
        if (ml) return vastaa(200, await viestit.vaihdaMalli(decodeURIComponent(ml[1]), await runko(req, 1024)));
        const l = polku.match(/^\/api\/skoopit\/([^/]+)\/liite$/);
        if (l) {
          const nimi = decodeURIComponent(l[1]);
          if (!Object.hasOwn(lueSkoopit(asetukset.juuri), nimi)) { req.resume(); return vastaa(404, { virhe: 'tuntematon skooppi' }); }
          return vastaa(200, await liitteet(nimi, url.searchParams.get('nimi'), req));
        }
        const kp = polku.match(/^\/api\/skoopit\/([^/]+)\/kysymys-pois$/);
        if (kp) return vastaa(200, await viestit.suljeKysymys(decodeURIComponent(kp[1])));
        // Purun valinnat (SCOPES-PURA-MALLI): runko {purkaja?, malli?} tarkistetaan purkajat.mjs:n listaa vasten; tyhjä = oletus.
        const pu = polku.match(/^\/api\/skoopit\/([^/]+)\/pura$/);
        if (pu) return vastaa(200, await suorita('pura', decodeURIComponent(pu[1]), await purkajat.tarkista(await runko(req))));
        const t = polku.match(/^\/api\/skoopit\/([^/]+)\/(pakkaa|automaattisiirto|herata|herata-pois|arkistoi|sulje)$/);
        if (t) return vastaa(200, await suorita(t[2], decodeURIComponent(t[1])));
        if (polku === '/api/terminal/sessions') {
          const data = await runko(req, 16_384);
          const istunto = await terminal.luoIstunto(data);
          return vastaa(201, { ok: true, session: istunto });
        }
        return vastaa(404, { virhe: 'tuntematon toiminto' });
      }
      if (polku === '/api/terminal/sessions') {
        return vastaa(200, { ok: true, sessions: await terminal.listaaIstunnot() });
      }
      const tsGet = polku.match(/^\/api\/terminal\/sessions\/([^/]+)$/);
      if (tsGet) {
        const id = decodeURIComponent(tsGet[1]);
        const s = await terminal.haeIstunto(id);
        if (!s) return vastaa(404, { ok: false, error: 'Istuntoa ei löydy', virhe: 'Istuntoa ei löydy' });
        return vastaa(200, { ok: true, session: s });
      }
      if (polku === '/api/skoopit') {
        const skoopit = lueSkoopit(asetukset.juuri);
        const agy = await agyIstunnot({ skooppiNimet: Object.keys(skoopit), aja: asetukset.aja ?? ajaKomento, agyHakemisto: asetukset.agyHakemisto });
        return vastaa(200, lista({ ...asetukset, ohitaAgy: true }, agy));
      }
      if (polku === '/api/asetukset') return vastaa(200, kytkimet.lue());
      const ig = polku.match(/^\/api\/skoopit\/([^/]+)\/asetukset$/);
      if (ig) {
        const v = istuntoValinta(decodeURIComponent(ig[1]), url.searchParams.get('istunto'));
        const { agyluvat: _globaali, ...yhteiset } = kytkimet.lue(); // agyluvat on globaali, ei keskustelukohtainen
        return vastaa(200, { ...v, ...(v.istunto ? kytkimet.lueIstunto(v.istunto) : yhteiset) });
      }
      if (polku === '/api/kordinaattori') return vastaa(200, kordinaattori.tila());
      if (polku === '/api/kordinaattori/skoopit') return vastaa(200, kordinaattori.skoopit());
      if (polku === '/api/viat') return vastaa(200, lueViat(asetukset.juuri));
      if (polku === '/api/diagnostiikka') return vastaa(200, diagnostiikka.lueTilanne());
      if (polku === '/api/kordinaattori/kehote') return vastaa(200, { kehote: kordinaattori.kehote() });
      if (polku === '/api/agentit') return vastaa(200, await viestit.agentit());
      if (polku === '/api/purkajat') return vastaa(200, await purkajat.lista());
      if (polku === '/api/mallit') return vastaa(200, await purkajat.lista());
      if (polku === '/api/palvelin') return vastaa(200, await linux.tila());
      if (polku === '/api/android') return vastaa(200, await android.tila());
      if (polku === '/api/android/ruutu') return vastaaTavut(await android.ruutu(url.searchParams.get('leveys') ?? 720));
      if (polku === '/api/android/ui') return vastaa(200, await android.ui());
      if (polku === '/api/android/tuotokset') return vastaa(200, await android.tuotokset());
      if (polku === '/api/android/tuotos') return vastaaTavut(await android.tuotos(url.searchParams.get('polku')));
      if (polku === '/api/economy/git-tila') return vastaa(200, await economy.gitTila(url.searchParams.get('skooppi'), url.searchParams.get('muoto')));
      if (polku === '/api/economy/tiedostokartta') {
        const skooppi = url.searchParams.get('skooppi');
        const muoto = url.searchParams.get('muoto');
        const indeksi = url.searchParams.get('indeksi') === '1' || url.searchParams.get('indeksi') === 'true';
        const haku = url.searchParams.get('haku');
        const lyhyt = url.searchParams.get('lyhyt') === '1' || url.searchParams.get('lyhyt') === 'true';
        return vastaa(200, economy.tiedostokartta(skooppi, { muoto, indeksi, haku, lyhyt }));
      }
      if (polku === '/api/economy/tilasto') return vastaa(200, economy.tilasto());
      if (polku === '/api/economy/task-odotus') return vastaa(200, economy.taskOdotus(url.searchParams.get('muoto')));
      if (polku === '/api/economy/hybridi-pakkaus') {
        const skooppi = url.searchParams.get('skooppi');
        const muoto = url.searchParams.get('muoto');
        return vastaa(200, economy.hybridiPakkaus(skooppi, { muoto }));
      }
      if (polku === '/api/economy/kuluttajat') {
        const skooppi = url.searchParams.get('skooppi');
        const muoto = url.searchParams.get('muoto');
        const raja = url.searchParams.has('raja') ? parseInt(url.searchParams.get('raja'), 10) : undefined;
        return vastaa(200, economy.kuluttajat({ skooppi, muoto, raja }));
      }
      if (polku === '/api/kayttorajat-kaikki' || (polku === '/api/kayttoraja' && url.searchParams.get('kaikki') === '1')) {
        const [claude, opGemini, op3p, macGemini, mac3p] = await Promise.all([
          Promise.resolve().then(() => kayttoraja()).catch(() => null),
          Promise.resolve().then(() => agyKayttoraja({ ryhma: 'gemini' })).catch(() => null),
          Promise.resolve().then(() => agyKayttoraja({ ryhma: '3p' })).catch(() => null),
          Promise.resolve().then(() => macAgyKayttoraja({ ryhma: 'gemini' })).catch(() => null),
          Promise.resolve().then(() => macAgyKayttoraja({ ryhma: '3p' })).catch(() => null),
        ]);
        return vastaa(200, {
          claude: claude ? { ...claude, otsikko: 'Claude' } : claude,
          oneplusAgy: {
            gemini: opGemini,
            kolmasOsapuoli: op3p,
          },
          macAgy: {
            gemini: macGemini,
            kolmasOsapuoli: mac3p,
          },
        });
      }
      if (polku === '/api/kayttoraja') {
        const tyyppi = url.searchParams.get('tyyppi');
        const ymparisto = url.searchParams.get('ymparisto');
        const agentti = url.searchParams.get('agentti');
        const skooppi = url.searchParams.get('skooppi');
        let ryhma = url.searchParams.get('ryhma');
        const laite = url.searchParams.get('laite');

        let istunto = null;
        if (skooppi) {
          try {
            const sv = await viestit.skoopinViestit?.(skooppi);
            istunto = sv?.istunto ?? null;
          } catch {}
        }

        const malliNimi = agentti || istunto?.malli || '';
        const onMac = ymparisto === 'macos'
          || laite === 'mac'
          || tyyppi === 'mac-agy'
          || tyyppi === 'macos-agy'
          || tyyppi === 'macos'
          || malliNimi.startsWith('mac-agy')
          || malliNimi.startsWith('macos-agy')
          || (istunto?.onMac === true)
          || (skooppi && (await viestit.onkoMacAgy?.(skooppi)));

        const onAgy = onMac
          || tyyppi === 'agy'
          || tyyppi === 'gemini'
          || malliNimi.startsWith('agy')
          || malliNimi.startsWith('antigravity')
          || agentti === 'android/gemini'
          || (skooppi && (await viestit.onkoAgy?.(skooppi)));

        if (!ryhma) {
          if (malliNimi.includes('claude') || malliNimi.includes('gpt') || malliNimi.includes('3p')) {
            ryhma = '3p';
          } else {
            ryhma = 'gemini';
          }
        }

        if (onMac) {
          const m = await macAgyKayttoraja({ ryhma });
          if (m) return vastaa(200, m);
        }
        if (onAgy) {
          return vastaa(200, await agyKayttoraja({ ryhma }));
        }
        const c = await kayttoraja();
        return vastaa(200, c ? { ...c, otsikko: 'Claude' } : c);
      }
      // Luetaan joka pyynnöllä: avaimen vaihto ei vaadi palvelun uudelleenkäynnistystä.
      if (polku === '/api/nebius-avain') return vastaa(200, nebius.tila());
      if (polku === '/api/wg-asetus') {
        try { return vastaa(200, { asetus: readFileSync(asetukset.wgTiedosto, 'utf8') }); } catch { return vastaa(404, { virhe: 'tunnelin asetusta ei ole' }); }
      }
      if (polku === '/api/ios/ipa' || polku === '/api/skoopit.ipa') {
        const ipaPolku = join(asetukset.juuri, 'scopes/ios/Skoopit.ipa');
        if (!existsSync(ipaPolku)) return vastaa(404, { virhe: 'Skoopit.ipa ei löydy, aja scopes/ios/asenna.sh --ipa' });
        const data = readFileSync(ipaPolku);
        return vastaaTavut({ tyyppi: 'application/octet-stream', data, nimi: 'Skoopit.ipa' });
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
      if (vv) {
        const nimi = decodeURIComponent(vv[1]);
        const k = await viestit.skoopinViestit(nimi);
        // Claude-istunnon puuttuessa agy-istunto (AGY-PRE-ISTUNTO) korvaa "skooppi ei ole auki" -vastauksen.
        return vastaa(200, k.auki ? k : (await viestit.agyViestit(nimi)) ?? k);
      }
      const m = polku.match(/^\/api\/skoopit\/(.+)$/);
      if (m) {
        const nimi = decodeURIComponent(m[1]);
        const agy = await agyIstunnot({ skooppiNimet: [nimi], aja: asetukset.aja ?? ajaKomento, agyHakemisto: asetukset.agyHakemisto });
        const s = yksi(nimi, { ...asetukset, ohitaAgy: true }, agy);
        return s ? vastaa(200, { ...s, jonossa: suorita.jono?.(nimi) ?? [] }) : vastaa(404, { virhe: 'tuntematon skooppi' });
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
  // "Always allow" agy-istunnoille (AGY-PRE-ISTUNTO): taustakierros vastaa lupakyselyihin, kun asetus agyluvat on päällä.
  const luvatAsetus = luoAsetukset({ hakemisto: asetukset.tilaDir ?? OLETUS_HAKEMISTO, loki: asetukset.toimintoloki });
  luoAgyLuvat({
    aja: ajaKomento, paalla: () => luvatAsetus.lue().agyluvat,
    kirjaa: (rivi) => { try { appendFileSync(asetukset.toimintoloki, JSON.stringify({ aika: new Date().toISOString(), ...rivi }) + '\n'); } catch { /* loki ei estä vastausta */ } },
  }).kaynnista();
  const lr = luoLr({ repoJuuri: asetukset.juuri, vientiEtuliite: asetukset.lrVienti ?? null });
  lr.ajasta();
  const toiminnot = luoToiminnot(asetukset);
  toiminnot.kaynnistaVahti?.(5_000);
  const terminal = luoTerminaali(asetukset, { aja: ajaKomento });
  const srv = createServer(diagnostiikka.kaari(kasittelija(asetukset, toiminnot, undefined, undefined, undefined, diagnostiikka, undefined, lr, undefined, undefined, undefined, undefined, undefined, undefined, terminal)));
  terminal.asennaWsUpgrade(srv, asetukset);
  srv.listen(portti, osoite, () =>
    console.log(`scopes-palvelu: http://${osoite}:${portti}/api/skoopit`));
}
