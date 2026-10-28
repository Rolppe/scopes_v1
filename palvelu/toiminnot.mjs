// Skooppien hallintatoiminnot puhelimesta (DEMO-SCOPES-HALLINTA 13.10.2026). Turvamalli (käyttäjä 13.10.2026,
// "vain valmiit toiminnot"): palvelu ajaa vain nämä valmiit toiminnot, eikä puhelimelta tule komentoa,
// lippua tai vapaata tekstiä mihinkään komentoriviin.
//   pura   — olemassa olevalle skoopille uusi Remote Control -istunto tmuxiin, ensimmäinen viesti `/pura <skooppi>`
//            (+ `--ajaja=<purkaja>` ja autovaihdon `--model`, kun äppi valitsi ne purkajat.mjs:n listalta: SCOPES-PURA-MALLI);
//            skoopin pakatut tmux-istunnot suljetaan ensin `/exit`illä (pakkaamaton istunto estää purun).
//            Scopes-perhe (`pura-malliton.mjs --perhe`) puretaan mallitta: skripti kirjoittaa purkutiedoston ja uuden
//            istunnon ensimmäinen viesti käskee lukemaan sen; purkajavalinta ei koske perhettä (PURA-MALLITON T6b)
//   pakkaa — skoopin ainoaan vapaaseen tmux-istuntoon kirjoitetaan `/pakkaa`; jos istunto odottaa vastausta auki
//            olevaan kysymykseen, Escape sulkee sen ensin (käyttäjä 14.10.2026: Pakkaa sai 409:n juuri silloin)
//   automaattisiirto, herata, herata-pois — samoin `/automaattisiirto` (pakkaus ja sessionvaihto), `/sa` ja `/sa pois`
//            (välimuistin herätys päälle ja pois; käyttäjä 13.10.2026: nappi ja kytkin pakkausnapin alle). Varatulle
//            istunnolle nämä menevät jonoon ja lähtevät, kun istunto on vapaa (käyttäjä 13.10.2026, V-294: autojatko
//            pysähtyy kysymykseen, joten hylkäys esti kytkimen juuri silloin, kun sitä tarvitaan). Jono tallennetaan
//            levylle jokaisen muutoksen jälkeen ja luetaan käynnistyksessä, joten palvelun uudelleenkäynnistys ei
//            pudota sitä (käyttäjä 14.10.2026, scopes siirto)
//   uusi   — uusi istunto, ensimmäinen viesti `/pura uusi <nimi>`; nimi on tiukka [a-z0-9-]-sanoja ja vielä vapaa;
//            purkaja ja istunnon malli kuten purussa (SCOPES-LISTA-UUSI-VALINNAT)
//   arkistoi — arkistoi-skooppi.mjs + commit sen nimeämistä poluista + install.sh (SCOPES-LISTA-POISTO)
// Skoopin nimi tarkistetaan skoopit.json:n avaimista (uudella: muodosta ja vapaudesta), ja komennot ajetaan
// argumenttitaulukkona ilman kuorta. Yksi toiminto kerrallaan; jokainen yritys kirjataan lokiin, myös hylätty.

import { execFile } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { agyRuudut } from './agy-istunto.mjs';
import { istunnot, lueSkoopit } from './lahteet.mjs';
import { keskustelu } from './viestit.mjs';

// 1–12 sanaa (SIIRTO-SYVAT-ALASKOOPIT 13.10.2026: alaskoopit vähintään 10 sanan syvyyteen).
export const UUSI_NIMI = /^[a-z0-9][a-z0-9-]{0,23}( [a-z0-9][a-z0-9-]{0,23}){0,11}$/;

// Purkutiedoston nimi: sama sääntö kuin pura-malliton.mjs:n `slug` (testi tarkistaa yhtäläisyyden).
export const mallitonSlug = (skooppi) => skooppi.trim().replace(/\s+/g, '-');

export class Hylatty extends Error {
  constructor(koodi, viesti) { super(viesti); this.koodi = koodi; }
}

// Oletusajaja: execFile ilman kuorta. PATH:iin ~/.local/bin, koska cron käynnistää palvelun suppealla PATH:lla.
// syote kirjoitetaan stdiniin (chat: viesti ei kulje komentorivillä); cwd valinnainen.
// riville (DEMO-SCOPES-SUORATOISTO): kutsutaan jokaiselle valmiille stdout-riville jo ajon aikana; signal katkaisee.
export function ajaKomento(komento, argumentit, { aikaraja = 150_000, syote = null, cwd, riville, signal, puskuri = 4 << 20 } = {}) {
  const env = { ...process.env, PATH: `${join(homedir(), '.local/bin')}:${process.env.PATH ?? '/usr/bin:/bin'}` };
  delete env.CLAUDE_CODE_SESSION_ID; // autovaihto.sh ei saa lukea kutsujan istuntoa
  delete env.TMUX_PANE;
  return new Promise((ok) => {
    const lapsi = execFile(komento, argumentit, { env, cwd, signal, timeout: aikaraja, maxBuffer: puskuri }, (virhe, stdout, stderr) =>
      ok({ koodi: virhe ? (typeof virhe.code === 'number' ? virhe.code : -1) : 0, stdout: String(stdout), stderr: String(stderr) }));
    if (riville) {
      let kesken = '';
      lapsi.stdout.setEncoding('utf8');
      lapsi.stdout.on('data', (pala) => {
        const rivit = (kesken + pala).split('\n');
        kesken = rivit.pop();
        for (const r of rivit) if (r) riville(r);
      });
    }
    lapsi.stdin.on('error', () => { /* lapsi sulki stdinin; tulos tulee callbackista */ });
    lapsi.stdin.end(syote ?? '');
  });
}

// autovaihto.sh:n tulosteesta Remote Control -osoite (OK: <url>).
export const istuntoOsoite = (stdout) => /^OK: (https:\/\/claude\.ai\/code\/session_[A-Za-z0-9]+)$/m.exec(stdout)?.[1] ?? null;
// Paikallisen mallin istunnolla ei ole Remote Controlia (autovaihto.sh, 15.10.2026): OK-rivi nimeää tmux-istunnon.
// Agy-istunto (AGY-PRE-ISTUNTO 16.10.2026) on samanlainen: tmux, ei Remote Controlia.
export const paikallinenTmux = (stdout) => /^OK: (?:paikallinen|agy|mac-agy|nebius) tmux (siirto-[a-z0-9-]+)$/m.exec(stdout)?.[1] ?? null;
export const MAC_AGY_MALLI = 'mac-agy/';
// Istunnon malli `agy/<agy-mallin tunnus>` ajaa istunnon agy:llä (autovaihto.sh); agy ei aja Clauden /pura-taitoa, joten se
// kuuluu vain scopes-perheelle, jonka purku on skripti (pura-malliton.mjs --kohde neutraali).
export const AGY_MALLI = 'agy/';

// Jonotettavat komennot ryhmittäin: ryhmän uusin korvaa vanhemman (kytkin pois ja päälle → vain /sa), ja herätys lähtee
// ennen siirtoa, koska /automaattisiirto päättää istunnon.
const JONO_RYHMA = { '/sa': 'herätys', '/sa pois': 'herätys', '/automaattisiirto': 'siirto' };

// Jonotiedosto: oletuksena toimintolokin vieressä (palvelin.mjs: ~/.local/state/scopes-toiminnot-jono.json).
export const oletusJonotiedosto = (asetukset) =>
  asetukset.toimintojono ?? (asetukset.toimintoloki ? join(dirname(asetukset.toimintoloki), 'scopes-toiminnot-jono.json') : null);

// Levyltä luettu jonorivi kelpaa vain jonotettavalla komennolla ja merkkijonokentillä: tiedosto ei saa tuoda
// komentoriville mitään, mitä puhelin ei olisi voinut jonottaa.
const kelpaaJonoon = (j) => j && typeof j.nimi === 'string' && typeof j.istunto === 'string' &&
  typeof j.toiminto === 'string' && Object.hasOwn(JONO_RYHMA, j.komento) && Number.isFinite(j.aika);

export function luoToiminnot(asetukset, { aja = ajaKomento, loki = asetukset.toimintoloki, jonoVali = 5_000, jonoTiedosto = oletusJonotiedosto(asetukset), kytkimet = asetukset.kytkimet, sulkuVali = 250 } = {}) {
  const autovaihto = join(asetukset.juuri, 'claude/siirto/tools/autovaihto.sh');
  const malliton = join(asetukset.juuri, 'claude/siirto/tools/pura-malliton.mjs');
  const arkistoija = join(asetukset.juuri, 'claude/siirto/tools/arkistoi-skooppi.mjs');
  let kaynnissa = null;
  const jono = new Map(); // `${skooppi}\n${ryhmä}` → { nimi, istunto, komento, toiminto, aika }
  let ajastin = null;
  let kytkimetAsetus = kytkimet ?? null;
  const laukaistutAutomaattisiirrot = new Set();
  let vahdinSiirto = null; // { id, skooppi, aika }: vahdin viimeksi laukaisema siirto, kunnes istunto on pakattu tai päättyi

  // Tallennus kirjoittaa väliaikaiseen ja nimeää sen, ettei kesken katkennut kirjoitus jätä rikkinäistä tiedostoa.
  const tallennaJono = () => {
    if (!jonoTiedosto) return;
    try {
      mkdirSync(dirname(jonoTiedosto), { recursive: true });
      writeFileSync(`${jonoTiedosto}.tmp`, JSON.stringify([...jono.values()]) + '\n');
      renameSync(`${jonoTiedosto}.tmp`, jonoTiedosto);
    } catch { /* tallennus ei estä toimintoa */ }
  };
  const kaynnistaAjastin = () => {
    if (jonoVali && !ajastin) { ajastin = setInterval(() => { puraJono().catch(() => {}); }, jonoVali); ajastin.unref(); }
  };
  if (jonoTiedosto) {
    let rivit = [];
    try { rivit = JSON.parse(readFileSync(jonoTiedosto, 'utf8')); } catch { /* ei jonoa tai rikki: tyhjä */ }
    for (const j of Array.isArray(rivit) ? rivit : []) if (kelpaaJonoon(j)) jono.set(`${j.nimi}\n${JONO_RYHMA[j.komento]}`, j);
    if (jono.size) kaynnistaAjastin();
  }

  const kirjaa = (rivi) => {
    if (!loki) return;
    try { mkdirSync(dirname(loki), { recursive: true }); appendFileSync(loki, JSON.stringify({ aika: new Date().toISOString(), ...rivi }) + '\n'); } catch { /* loki ei estä toimintoa */ }
  };

  const skoopinIstunnot = (nimi, skoopit) =>
    istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) }).filter((i) => i.skooppi === nimi);

  // Ruudun prosessin on oltava istunnon claude tai sen vanhempi, ettei näppäily osu väärään ruutuun.
  async function tarkistaRuutu(i) {
    const r = await aja('tmux', ['display-message', '-p', '-t', i.ruutu, '#{pane_pid}']);
    const ruudunPid = Number(r.stdout.trim());
    if (r.koodi !== 0 || !(ruudunPid === i.pid || ruudunPid === i.vanhempi)) throw new Hylatty(409, 'istunnon tmux-ruutu ei täsmää');
  }
  async function kirjoita(i, teksti) {
    for (const a of [['-l', teksti], ['Enter']]) {
      const t = await aja('tmux', ['send-keys', '-t', i.ruutu, ...a]);
      if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
    }
  }

  async function avaaIstunto(skooppi, viesti, malli = null) {
    // viesti null = autovaihto.sh kirjoittaa purkutiedoston itse (agy-uusi skooppi).
    const t = await aja('bash', [autovaihto, 'vaihda', skooppi, '--ei-sulje', ...(malli ? ['--model', malli] : []), ...(viesti ? ['--viesti', viesti] : [])]);
    const osoite = istuntoOsoite(t.stdout);
    const tmux = paikallinenTmux(t.stdout);
    if (t.koodi !== 0 || !(osoite || tmux)) {
      const syy = (t.stderr.trim().split('\n').filter(Boolean).pop() ?? `autovaihto exit ${t.koodi}`).slice(0, 300);
      throw new Hylatty(502, `istunto ei käynnistynyt: ${syy}`);
    }
    return osoite ? { osoite } : { tmux };
  }

  // Istunnon viimeinen viesti on vastaamaton monivalinta (AskUserQuestion).
  function kysymysAuki(i) {
    let transkripti = '';
    try { transkripti = readFileSync(i.polku, 'utf8'); } catch { return false; }
    const viimeinen = keskustelu(transkripti, 1)[0];
    return viimeinen?.rooli === 'kysymys' && !viimeinen.vastattu;
  }

  // Valmis komento skoopin ainoaan vapaaseen tmux-istuntoon, kun sen vuoro on valmis; jonotettava komento odottaa
  // varatun istunnon vapautumista.
  async function istuntoon(nimi, komento, toiminto, haluttuIstunto = null) {
    const skoopit = lueSkoopit(asetukset.juuri);
    if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
    const omat = skoopinIstunnot(nimi, skoopit).filter((i) => i.ruutu && !i.pakattu);
    const i = haluttuIstunto ? omat.find((x) => x.id === haluttuIstunto) : (omat.length === 1 ? omat[0] : null);
    if (!i) {
      if (omat.length === 0) {
        const agy = await agyRuudut(aja, nimi);
        if (agy.length === 1) {
          const [r] = agy;
          for (const a of [['-l', komento], ['Enter']]) {
            const t = await aja('tmux', ['send-keys', '-t', r.ruutu, ...a]);
            if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
          }
          return { istunto: r.ruutu, komento };
        }
      }
      throw new Hylatty(409, omat.length ? 'skoopissa on useita tmux-istuntoja' : `skoopilla ei ole tmux-istuntoa, johon ${komento} voi lähettää`);
    }
    const ryhma = JONO_RYHMA[komento];
    if (ryhma && jono.delete(`${nimi}\n${ryhma}`)) tallennaJono();
    if (i.tila === 'waiting' && (komento === '/pakkaa' || komento === '/automaattisiirto') && (i.kysely || kysymysAuki(i))) {
      // Kuten viestin lähetys (viestit.mjs): Enter valitsisi korostetun vaihtoehdon, joten Escape ensin ja tauko,
      // ettei Escape + kirjain tulkitu Alt-näppäimeksi.
      await tarkistaRuutu(i);
      const t = await aja('tmux', ['send-keys', '-t', i.ruutu, 'Escape']);
      if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      await new Promise((r) => setTimeout(r, asetukset.escapeTauko ?? 800));
      await kirjoita(i, komento);
      return { istunto: i.id, komento, kysymysSuljettiin: true };
    }
    if (i.tila !== 'idle') {
      if (!ryhma) throw new Hylatty(409, `istunto on varattu (${i.tila ?? 'tila tuntematon'}); yritä vuoron jälkeen`);
      jono.set(`${nimi}\n${ryhma}`, { nimi, istunto: i.id, komento, toiminto, aika: Date.now() });
      tallennaJono();
      kaynnistaAjastin();
      return { istunto: i.id, komento, jonossa: true };
    }
    await tarkistaRuutu(i);
    await kirjoita(i, komento);
    return { istunto: i.id, komento };
  }

  // Lähettää jonosta yhden komennon kerrallaan istuntoon, joka on taas vapaa; komento putoaa, jos istunto päättyi
  // tai pakattiin. Yksi lähetys kierrosta kohden, koska komento varaa istunnon ennen seuraavaa.
  async function puraJono() {
    if (kaynnissa) return;
    const jarjestys = [...jono].sort(([, a], [, b]) => (a.komento === '/automaattisiirto') - (b.komento === '/automaattisiirto'));
    for (const [avain, j] of jarjestys) {
      const i = skoopinIstunnot(j.nimi, lueSkoopit(asetukset.juuri)).find((x) => x.id === j.istunto);
      if (!i || i.pakattu || !i.ruutu) {
        jono.delete(avain);
        tallennaJono();
        kirjaa({ toiminto: j.toiminto, nimi: j.nimi, tulos: 'hylätty', syy: 'jonossa ollut istunto päättyi', istunto: j.istunto });
        continue;
      }
      const kysymys = (j.komento === '/pakkaa' || j.komento === '/automaattisiirto') && i.tila === 'waiting' && (i.kysely || kysymysAuki(i));
      if (i.tila !== 'idle' && !kysymys) continue;
      jono.delete(avain);
      tallennaJono();
      kaynnissa = j.toiminto;
      try {
        await tarkistaRuutu(i);
        if (kysymys) {
          const t = await aja('tmux', ['send-keys', '-t', i.ruutu, 'Escape']);
          if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
          await new Promise((r) => setTimeout(r, asetukset.escapeTauko ?? 800));
        }
        await kirjoita(i, j.komento);
        kirjaa({ toiminto: j.toiminto, nimi: j.nimi, tulos: 'ok', istunto: i.id, komento: j.komento, jonosta: true });
      } catch (e) {
        kirjaa({ toiminto: j.toiminto, nimi: j.nimi, tulos: 'hylätty', syy: e.message, jonosta: true });
      } finally {
        kaynnissa = null;
      }
      break;
    }
    if (!jono.size && ajastin) { clearInterval(ajastin); ajastin = null; }
    await tarkistaAutomaattisiirto().catch(() => {});
  }

  // Automaattisiirto-vahti (scopes siirto automaattisiirto 19.10.2026): kun kytkin on päällä, istunto pysähtynyt
  // ja kontekstiraja täyttynyt, automaattisiirto toteutetaan ilman kyselyitä.
  // AUTOMAATTISIIRTO-RINNAKKAIN (28.10.2026): yksi siirto kerrallaan. Rinnakkaiset pakkaukset kirjoittavat samaa
  // last-scope.txt:tä ("PAKKAUS: epäselvä"), joten seuraava laukeaa vasta, kun edellinen istunto on pakattu tai
  // päättyi, tai odotusajan jälkeen (esim. agy-kiintiö esti pakkauksen), jolloin aikakatkaisu kirjataan lokiin.
  async function tarkistaAutomaattisiirto({ raja = 120_000, kytkimet = kytkimetAsetus } = {}) {
    if (kaynnissa || !kytkimet) return [];
    const skoopit = lueSkoopit(asetukset.juuri);
    const kaikki = istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) });
    if (vahdinSiirto) {
      const edellinen = kaikki.find((i) => i.id === vahdinSiirto.id);
      const valmis = !edellinen || edellinen.pakattu || !edellinen.ruutu;
      if (!valmis && Date.now() - vahdinSiirto.aika < (asetukset.automaattisiirtoOdotus ?? 30 * 60_000)) return [];
      if (!valmis) kirjaa({ toiminto: 'automaattisiirto-vahti', nimi: vahdinSiirto.skooppi, istunto: vahdinSiirto.id, tulos: 'aikakatkaisu', syy: 'istuntoa ei pakattu odotusajassa' });
      vahdinSiirto = null;
    }
    const tulokset = [];
    for (const i of kaikki) {
      if (i.pakattu || !i.ruutu || laukaistutAutomaattisiirrot.has(i.id)) continue;
      const paalla = kytkimet.lueIstunto ? (kytkimet.lueIstunto(i.id)?.automaattisiirto ?? kytkimet.lue()?.automaattisiirto) : kytkimet.lue()?.automaattisiirto;
      if (!paalla) continue;
      const lim = asetukset.kontekstiraja ?? raja;
      const tokenit = i.konteksti?.tokenit ?? 0;
      if (tokenit < lim) continue;
      const kysymys = i.tila === 'waiting' && (i.kysely || kysymysAuki(i));
      if (i.tila !== 'idle' && !kysymys) continue;

      laukaistutAutomaattisiirrot.add(i.id);
      // Varaus ennen awaitia, ettei päällekkäinen kierros (ajastin ja puraJono) laukaise toista istuntoa samaan aikaan.
      vahdinSiirto = { id: i.id, skooppi: i.skooppi, aika: Date.now() };
      try {
        const tulos = await istuntoon(i.skooppi, '/automaattisiirto', 'automaattisiirto', i.id);
        kirjaa({ toiminto: 'automaattisiirto-vahti', nimi: i.skooppi, istunto: i.id, tokenit, tulos: 'ok' });
        tulokset.push({ skooppi: i.skooppi, istunto: i.id, ...tulos });
        break;
      } catch (e) {
        vahdinSiirto = null;
        kirjaa({ toiminto: 'automaattisiirto-vahti', nimi: i.skooppi, istunto: i.id, tulos: 'hylätty', syy: e.message });
      }
    }
    return tulokset;
  }

  let vahtiAjastin = null;
  function kaynnistaVahti(vali = 5_000) {
    if (vali <= 0 || vahtiAjastin) return;
    vahtiAjastin = setInterval(() => {
      puraJono().catch(() => {});
      tarkistaAutomaattisiirto().catch(() => {});
    }, vali);
    vahtiAjastin.unref();
  }
  function pysaytaVahti() {
    if (vahtiAjastin) { clearInterval(vahtiAjastin); vahtiAjastin = null; }
  }

  // Mallivapaa purku (PURA-MALLITON T6b): purkutiedosto kirjoitetaan ennen kuin mitään suljetaan, joten skriptin virhe ei
  // jätä skooppia ilman istuntoa eikä vaihdu mallireittiin. Suljettavat pois tiedoston ISTUNNOT-riviltä (PURASCRIPT-ISTUNNOT).
  async function puraMallitta(nimi, suljettavat, malli) {
    const auto = Boolean(kytkimetAsetus?.lue?.()?.automaattijatko);
    const r = await aja('node', [malliton, nimi, '--kohde', (malli?.startsWith(AGY_MALLI) || malli?.startsWith(MAC_AGY_MALLI)) ? 'neutraali' : 'claude', ...(auto ? ['--autojatko'] : []), ...(suljettavat.length ? ['--suljettavat', suljettavat.map((i) => i.id).join(',')] : [])]);
    if (r.koodi !== 0 && r.koodi !== 4) {
      throw new Hylatty(500, (r.stderr.trim().split('\n').filter(Boolean).pop() ?? `pura-malliton exit ${r.koodi}`).slice(0, 300));
    }
    const tiedosto = join(homedir(), '.local/state/pura', `${mallitonSlug(nimi)}.md`);
    if (malli?.startsWith(MAC_AGY_MALLI) && process.platform !== 'darwin') {
      const json = join(homedir(), '.local/state/pura', `${mallitonSlug(nimi)}.json`);
      await aja('scp', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', tiedosto, json, 'mac:~/.local/state/pura/']).catch(() => {});
      const tilaHak = join(homedir(), '.claude/skills/keskustelun-siirto/state');
      for (const tilaTiedosto of ['automaattivalinta.txt', 'autopack.txt', 'agy-luvat.txt']) {
        const lahde = join(tilaHak, tilaTiedosto);
        if (existsSync(lahde)) {
          await aja('scp', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', lahde, `mac:~/.claude/skills/keskustelun-siirto/state/${tilaTiedosto}`]).catch(() => {});
        }
      }
    }
    const viestiTiedosto = malli?.startsWith(MAC_AGY_MALLI) ? `~/.local/state/pura/${mallitonSlug(nimi)}.md` : tiedosto;
    for (const i of suljettavat) {
      await tarkistaRuutu(i);
      if (i.tyyppi === 'agy' || i.ruutu?.includes('agy') || i.pid == null) {
        await aja('tmux', ['send-keys', '-t', i.ruutu, 'C-c']).catch(() => {});
        await aja('tmux', ['send-keys', '-t', i.ruutu, 'C-d']).catch(() => {});
        await new Promise((r) => setTimeout(r, 200));
        await aja('tmux', ['kill-window', '-t', i.ruutu]).catch(() => {});
      } else {
        await kirjoita(i, '/exit');
      }
    }
    const tulos = await avaaIstunto(nimi, `Malliton purku: lue ${viestiTiedosto} ja noudata sitä.`, malli);
    return { ...tulos, suljettiin: suljettavat.map((i) => i.id), tiedosto: viestiTiedosto, ...(malli ? { malli } : {}), ...(r.koodi === 4 ? { varoitus: true } : {}) };
  }

  // Uusi skooppi agy-istunnolla (AGY-PRE-ISTUNTO): /pura uusi on Clauden taito, joten vaiheet 0 (luonti, asennus, commit) tehdään
  // tässä samoin kuin taito ne tekisi, ja autovaihto.sh avaa agy-istunnon neutraalilla purkutiedostolla. Scopes- ja infra-perheet.
  async function uusiAgy(nimi, malli) {
    if (!nimi.startsWith('scopes ') && !nimi.startsWith('infra ')) throw new Hylatty(400, 'agy-istunto kuuluu vain scopes- ja infra-perheen skoopeille: nimi alkaa sanalla scopes tai infra');
    const luonti = await aja('node', [join(asetukset.juuri, 'claude/siirto/tools/luo-skooppi.mjs'), nimi], { cwd: asetukset.juuri });
    if (luonti.koodi !== 0 && luonti.koodi !== 4) {
      throw new Hylatty(500, (luonti.stderr.trim().split('\n').filter(Boolean).pop() ?? `luo-skooppi exit ${luonti.koodi}`).slice(0, 300));
    }
    const polut = [...luonti.stdout.matchAll(/^KIRJOITETTU: (.+)$/gm)].map((m) => m[1]);
    const asennus = await aja('bash', [join(asetukset.juuri, 'Infra/skills/install.sh')], { cwd: asetukset.juuri });
    const git = (...a) => aja('git', a, { cwd: asetukset.juuri });
    const lisays = await git('add', '--', ...polut);
    const commit = lisays.koodi === 0 ? await git('commit', '-q', '-m', `feat(siirto): uusi skooppi ${nimi} (Scopes-äppi)`, '--', ...polut) : lisays;
    if (commit.koodi !== 0) throw new Hylatty(500, `skooppi luotu, mutta commit epäonnistui: ${(commit.stderr.trim() || commit.stdout.trim()).slice(0, 240)}`);
    const tulos = await avaaIstunto(nimi, null, malli);
    return { ...tulos, malli, luotu: polut, ...(asennus.koodi !== 0 ? { varoitus: true } : {}), ...(luonti.koodi === 4 ? { varoitus: true } : {}) };
  }

  const toteutus = {
    // valinta = purkajat.mjs:n tarkistama { ajaja, malli } (SCOPES-PURA-MALLI); ajaja kulkee /pura-lippuna aja-siirtaja.sh:lle.
    async pura(nimi, { ajaja = null, malli = null } = {}) {
      const skoopit = lueSkoopit(asetukset.juuri);
      if (!Object.hasOwn(skoopit, nimi)) throw new Hylatty(404, 'tuntematon skooppi');
      const omat = skoopinIstunnot(nimi, skoopit);
      if (omat.some((i) => !i.pakattu)) throw new Hylatty(409, 'skoopissa on jo käynnissä oleva istunto');
      const agyTmux = await agyRuudut(aja, nimi);
      if (agyTmux.some((r) => !omat.some((i) => i.ruutu === r.ruutu && i.pakattu))) {
        throw new Hylatty(409, 'skoopissa on jo käynnissä oleva agy-istunto');
      }
      // Pakattu istunto suljetaan ennen uutta (käyttäjä 13.10.2026): äpissä skoopin keskustelu jatkuu samassa
      // näkymässä uudella istunnolla. Remote Control -istuntoa ilman ruutua ei voi sulkea; se jää piiloon.
      // Varattu estää myös ilman ruutua (SIIRTO-PURA-PAINIKE 14.10.2026): puhelimesta avattu istunto voi olla pakattu,
      // mutta yhä autovaihdossa, ja uusi istunto ei ehkä vielä näy skoopissa; Pura avaisi silloin toisen istunnon.
      const suljettavat = omat.filter((i) => i.ruutu);
      const varattu = omat.find((i) => i.tila !== 'idle');
      if (varattu) throw new Hylatty(409, `pakattu istunto on vielä varattu (${varattu.tila ?? 'tila tuntematon'}); yritä vuoron jälkeen`);
      // Perhetunnistus on yksi kaikille reiteille (T6): 0 = scopes-perhe, 1 = ei; muu exit ei saa pudottaa perhettä mallireittiin.
      const p = await aja('node', [malliton, '--perhe', nimi]);
      if (p.koodi === 0) return puraMallitta(nimi, suljettavat, malli);
      if ((malli?.startsWith(AGY_MALLI) || malli?.startsWith(MAC_AGY_MALLI)) && p.koodi === 1) throw new Hylatty(400, 'agy-istunto kuuluu vain scopes- ja infra-perheen skoopeille');
      if (p.koodi !== 1) throw new Hylatty(500, (p.stderr.trim().split('\n').filter(Boolean).pop() ?? `pura-malliton --perhe exit ${p.koodi}`).slice(0, 300));
      for (const i of suljettavat) {
      await tarkistaRuutu(i);
      if (i.tyyppi === 'agy' || i.ruutu?.includes('agy') || i.pid == null) {
        await aja('tmux', ['send-keys', '-t', i.ruutu, 'C-c']).catch(() => {});
        await aja('tmux', ['send-keys', '-t', i.ruutu, 'C-d']).catch(() => {});
        await new Promise((r) => setTimeout(r, 200));
        await aja('tmux', ['kill-window', '-t', i.ruutu]).catch(() => {});
      } else {
        await kirjoita(i, '/exit');
      }
    }
      const auto = Boolean(kytkimetAsetus?.lue?.()?.automaattijatko);
      const tulos = await avaaIstunto(nimi, `/pura ${nimi}${ajaja ? ` --ajaja=${ajaja}` : ''}${auto ? ' --autojatko' : ''}`, malli);
      return { ...tulos, suljettiin: suljettavat.map((i) => i.id), ...(ajaja ? { purkaja: ajaja } : {}), ...(malli ? { malli } : {}) };
    },
    pakkaa: (nimi) => istuntoon(nimi, '/pakkaa', 'pakkaa'),
    automaattisiirto: (nimi) => istuntoon(nimi, '/automaattisiirto', 'automaattisiirto'),
    herata: (nimi) => istuntoon(nimi, '/sa', 'herata'),
    'herata-pois': (nimi) => istuntoon(nimi, '/sa pois', 'herata-pois'),
    // Sulje istunto ilman pakkausta (käyttäjä 26.10.2026): ruutu tapetaan tmuxilla, ei /exitiä ohjelmalle, jotta sulkeminen
    // ei riipu mallista eikä siitä, onko ohjelma vapaana (VI-4, käyttäjä 28.10.2026). Mac-agy:n ssh katkeaa samalla.
    // Lopuksi tarkistetaan, että ruutu on poissa; muuten 502 eikä hiljaista onnistumista.
    async sulje(nimi) {
      const skoopit = lueSkoopit(asetukset.juuri);
      if (!Object.hasOwn(skoopit, nimi)) throw new Hylatty(404, 'tuntematon skooppi');
      const omat = skoopinIstunnot(nimi, skoopit);
      const agyTmux = await agyRuudut(aja, nimi);
      const suljettavat = omat.filter((i) => i.ruutu);
      for (const r of agyTmux) {
        if (!suljettavat.some((i) => i.ruutu === r.ruutu)) {
          suljettavat.push({ ruutu: r.ruutu, id: r.ruutu, pid: r.pid, vanhempi: null });
        }
      }
      if (!suljettavat.length) throw new Hylatty(409, 'skoopilla ei ole avointa istuntoa, jota sulkea');
      const suljettiin = [];
      for (const i of suljettavat) {
        if (i.pid || i.vanhempi) {
          try { await tarkistaRuutu(i); } catch { /* ruutu voi olla agy tai prosessi jo päättynyt */ }
        }
        await aja('tmux', ['kill-pane', '-t', i.ruutu]).catch(() => {});
        // Ruutu on auki, jos se on tmuxin listauksessa istunnon nimenä tai ruudun tunnuksena. display-message ei kelpaa:
        // se palauttaa 0:n myös puuttuvalle kohteelle (502 28.10.2026, vaikka ruutu oli poissa). Prosessi voi päättyä
        // viiveellä, joten odotetaan enintään 20 väliä.
        let auki = true;
        for (let n = 0; n < 20 && auki; n++) {
          if (n) await new Promise((r) => setTimeout(r, sulkuVali));
          const l = await aja('tmux', ['list-panes', '-a', '-F', '#{session_name} #{pane_id}']).catch(() => ({ koodi: 1, stdout: '' }));
          auki = l.koodi === 0 && l.stdout.split('\n').some((r) => r.trim().split(' ').includes(i.ruutu));
        }
        if (auki) throw new Hylatty(502, `istunnon tmux-ruutu ${i.ruutu} ei sulkeutunut`);
        suljettiin.push(i.id);
      }
      for (const avain of [...jono.keys()]) {
        if (avain.startsWith(`${nimi}\n`)) jono.delete(avain);
      }
      tallennaJono();
      return { suljettiin, istunto: suljettavat[0]?.id };
    },
    // Uusi skooppi saa samat valinnat kuin pura (SCOPES-LISTA-UUSI-VALINNAT 15.10.2026): /pura-taito siirtää --ajaja-lipun
    // luonnin ohi purkuvaiheeseen.
    async uusi(nimi, { ajaja = null, malli = null } = {}) {
      if (typeof nimi !== 'string' || !UUSI_NIMI.test(nimi)) throw new Hylatty(400, 'nimi: 1–4 sanaa pienaakkosia, numeroita tai viivoja');
      const skoopit = lueSkoopit(asetukset.juuri);
      if (skoopit[nimi]) throw new Hylatty(409, 'skooppi on jo olemassa');
      if (malli?.startsWith(AGY_MALLI) || malli?.startsWith(MAC_AGY_MALLI)) return uusiAgy(nimi, malli);
      const tulos = await avaaIstunto(nimi, `/pura uusi ${nimi}${ajaja ? ` --ajaja=${ajaja}` : ''}`, malli);
      return { ...tulos, ...(ajaja ? { purkaja: ajaja } : {}), ...(malli ? { malli } : {}) };
    },
    // Arkistointi (SCOPES-LISTA-POISTO 15.10.2026, käyttäjä: listassa veto vasemmalle, punainen X ja varmistus).
    // arkistoi-skooppi.mjs poistaa skoopin kartoista ja reitittimestä ja siirtää rekisterin nimelle
    // REKISTERI.arkistoitu.md; tämä committoi vain sen nimeämät polut ja asentaa reitittimen. Käynnissä oleva istunto
    // estää; pakatut tmux-istunnot suljetaan ensin kuten purussa.
    async arkistoi(nimi) {
      const skoopit = lueSkoopit(asetukset.juuri);
      if (!Object.hasOwn(skoopit, nimi)) throw new Hylatty(404, 'tuntematon skooppi');
      const omat = skoopinIstunnot(nimi, skoopit);
      if (omat.some((i) => !i.pakattu)) throw new Hylatty(409, 'skoopissa on käynnissä oleva istunto: pakkaa se ensin');
      const varattu = omat.find((i) => i.tila !== 'idle');
      if (varattu) throw new Hylatty(409, `pakattu istunto on vielä varattu (${varattu.tila ?? 'tila tuntematon'}); yritä vuoron jälkeen`);
      const r = await aja('node', [arkistoija, nimi]);
      if (r.koodi !== 0) throw new Hylatty(r.koodi === 1 ? 409 : 500, (r.stderr.trim().split('\n').filter(Boolean).pop() ?? `arkistoi-skooppi exit ${r.koodi}`).slice(0, 300));
      const polut = [...r.stdout.matchAll(/^(?:KIRJOITETTU|POISTETTU): (.+)$|^SIIRRETTY: (.+) → (.+)$/gm)].flatMap((m) => m.slice(1).filter(Boolean));
      const git = (...a) => aja('git', a, { cwd: asetukset.juuri });
      const lisays = await git('add', '-A', '--', ...polut);
      const commit = lisays.koodi === 0 ? await git('commit', '-q', '-m', `chore(siirto): arkistoi skooppi ${nimi} (Scopes-äppi)`, '--', ...polut) : lisays;
      if (commit.koodi !== 0) throw new Hylatty(500, `arkistoitu, mutta commit epäonnistui: ${(commit.stderr.trim() || commit.stdout.trim()).slice(0, 240)}`);
      const sha = (await git('rev-parse', '--short', 'HEAD')).stdout.trim();
      for (const i of omat.filter((o) => o.ruutu)) { await tarkistaRuutu(i); await kirjoita(i, '/exit'); }
      const asennus = await aja('bash', [join(asetukset.juuri, 'Infra/skills/install.sh')], { cwd: asetukset.juuri });
      return { commit: sha, polut, ...(asennus.koodi !== 0 ? { varoitus: true } : {}) };
    },
  };

  async function suorita(toiminto, nimi, valinta) {
    if (!Object.hasOwn(toteutus, toiminto)) throw new Hylatty(404, 'tuntematon toiminto');
    if (kaynnissa) { kirjaa({ toiminto, nimi, tulos: 'hylätty', syy: 'toinen toiminto käynnissä' }); throw new Hylatty(429, `toinen toiminto on käynnissä (${kaynnissa})`); }
    kaynnissa = toiminto;
    try {
      const tulos = await toteutus[toiminto](nimi, valinta);
      kirjaa({ toiminto, nimi, tulos: 'ok', ...tulos });
      return { ok: true, toiminto, nimi, ...tulos };
    } catch (e) {
      kirjaa({ toiminto, nimi, tulos: 'hylätty', syy: e.message });
      throw e;
    } finally {
      kaynnissa = null;
    }
  }
  // Skoopin jonossa odottavat komennot näkymää varten (palvelin.mjs: GET /api/skoopit/<nimi> → jonossa).
  suorita.jono = (nimi) => [...jono.values()].filter((j) => j.nimi === nimi).map(({ komento, aika }) => ({ komento, aika }));
  suorita.puraJono = puraJono;
  suorita.tarkistaAutomaattisiirto = tarkistaAutomaattisiirto;
  suorita.asetaKytkimet = (k) => { kytkimetAsetus = k; };
  suorita.kaynnistaVahti = kaynnistaVahti;
  suorita.pysaytaVahti = pysaytaVahti;
  return suorita;
}
