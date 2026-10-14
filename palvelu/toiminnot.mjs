// Skooppien hallintatoiminnot puhelimesta (DEMO-SCOPES-HALLINTA 13.10.2026). Turvamalli (käyttäjä 13.10.2026,
// "vain valmiit toiminnot"): palvelu ajaa vain nämä valmiit toiminnot, eikä puhelimelta tule komentoa,
// lippua tai vapaata tekstiä mihinkään komentoriviin.
//   pura   — olemassa olevalle skoopille uusi Remote Control -istunto tmuxiin, ensimmäinen viesti `/pura <skooppi>`;
//            skoopin pakatut tmux-istunnot suljetaan ensin `/exit`illä (pakkaamaton istunto estää purun)
//   pakkaa — skoopin ainoaan vapaaseen tmux-istuntoon kirjoitetaan `/pakkaa`; jos istunto odottaa vastausta auki
//            olevaan kysymykseen, Escape sulkee sen ensin (käyttäjä 14.10.2026: Pakkaa sai 409:n juuri silloin)
//   automaattisiirto, herata, herata-pois — samoin `/automaattisiirto` (pakkaus ja sessionvaihto), `/sa` ja `/sa pois`
//            (välimuistin herätys päälle ja pois; käyttäjä 13.10.2026: nappi ja kytkin pakkausnapin alle). Varatulle
//            istunnolle nämä menevät jonoon ja lähtevät, kun istunto on vapaa (käyttäjä 13.10.2026, V-294: autojatko
//            pysähtyy kysymykseen, joten hylkäys esti kytkimen juuri silloin, kun sitä tarvitaan). Jono tallennetaan
//            levylle jokaisen muutoksen jälkeen ja luetaan käynnistyksessä, joten palvelun uudelleenkäynnistys ei
//            pudota sitä (käyttäjä 14.10.2026, scopes siirto)
//   uusi   — uusi istunto, ensimmäinen viesti `/pura uusi <nimi>`; nimi on tiukka [a-z0-9-]-sanoja ja vielä vapaa
// Skoopin nimi tarkistetaan skoopit.json:n avaimista (uudella: muodosta ja vapaudesta), ja komennot ajetaan
// argumenttitaulukkona ilman kuorta. Yksi toiminto kerrallaan; jokainen yritys kirjataan lokiin, myös hylätty.

import { execFile } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { istunnot, lueSkoopit } from './lahteet.mjs';
import { keskustelu } from './viestit.mjs';

// 1–12 sanaa (SIIRTO-SYVAT-ALASKOOPIT 13.10.2026: alaskoopit vähintään 10 sanan syvyyteen).
export const UUSI_NIMI = /^[a-z0-9][a-z0-9-]{0,23}( [a-z0-9][a-z0-9-]{0,23}){0,11}$/;

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

export function luoToiminnot(asetukset, { aja = ajaKomento, loki = asetukset.toimintoloki, jonoVali = 5_000, jonoTiedosto = oletusJonotiedosto(asetukset) } = {}) {
  const autovaihto = join(asetukset.juuri, 'claude/siirto/tools/autovaihto.sh');
  let kaynnissa = null;
  const jono = new Map(); // `${skooppi}\n${ryhmä}` → { nimi, istunto, komento, toiminto, aika }
  let ajastin = null;

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

  async function avaaIstunto(skooppi, viesti) {
    const t = await aja('bash', [autovaihto, 'vaihda', skooppi, '--ei-sulje', '--viesti', viesti]);
    const osoite = istuntoOsoite(t.stdout);
    if (t.koodi !== 0 || !osoite) {
      const syy = (t.stderr.trim().split('\n').filter(Boolean).pop() ?? `autovaihto exit ${t.koodi}`).slice(0, 300);
      throw new Hylatty(502, `istunto ei käynnistynyt: ${syy}`);
    }
    return { osoite };
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
  async function istuntoon(nimi, komento, toiminto) {
    const skoopit = lueSkoopit(asetukset.juuri);
    if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
    const omat = skoopinIstunnot(nimi, skoopit).filter((i) => i.ruutu && !i.pakattu);
    if (omat.length !== 1) throw new Hylatty(409, omat.length ? 'skoopissa on useita tmux-istuntoja' : `skoopilla ei ole tmux-istuntoa, johon ${komento} voi lähettää`);
    const [i] = omat;
    const ryhma = JONO_RYHMA[komento];
    if (ryhma && jono.delete(`${nimi}\n${ryhma}`)) tallennaJono();
    if (i.tila === 'waiting' && komento === '/pakkaa' && kysymysAuki(i)) {
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
      if (i.tila !== 'idle') continue;
      jono.delete(avain);
      tallennaJono();
      kaynnissa = j.toiminto;
      try {
        await tarkistaRuutu(i);
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
  }

  const toteutus = {
    async pura(nimi) {
      const skoopit = lueSkoopit(asetukset.juuri);
      if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
      const omat = skoopinIstunnot(nimi, skoopit);
      if (omat.some((i) => !i.pakattu)) throw new Hylatty(409, 'skoopissa on jo käynnissä oleva istunto');
      // Pakattu istunto suljetaan ennen uutta (käyttäjä 13.10.2026): äpissä skoopin keskustelu jatkuu samassa
      // näkymässä uudella istunnolla. Remote Control -istuntoa ilman ruutua ei voi sulkea; se jää piiloon.
      const suljettavat = omat.filter((i) => i.ruutu);
      const varattu = suljettavat.find((i) => i.tila !== 'idle');
      if (varattu) throw new Hylatty(409, `pakattu istunto on vielä varattu (${varattu.tila ?? 'tila tuntematon'}); yritä vuoron jälkeen`);
      for (const i of suljettavat) { await tarkistaRuutu(i); await kirjoita(i, '/exit'); }
      return { ...await avaaIstunto(nimi, `/pura ${nimi}`), suljettiin: suljettavat.map((i) => i.id) };
    },
    pakkaa: (nimi) => istuntoon(nimi, '/pakkaa', 'pakkaa'),
    automaattisiirto: (nimi) => istuntoon(nimi, '/automaattisiirto', 'automaattisiirto'),
    herata: (nimi) => istuntoon(nimi, '/sa', 'herata'),
    'herata-pois': (nimi) => istuntoon(nimi, '/sa pois', 'herata-pois'),
    async uusi(nimi) {
      if (typeof nimi !== 'string' || !UUSI_NIMI.test(nimi)) throw new Hylatty(400, 'nimi: 1–4 sanaa pienaakkosia, numeroita tai viivoja');
      const skoopit = lueSkoopit(asetukset.juuri);
      if (skoopit[nimi]) throw new Hylatty(409, 'skooppi on jo olemassa');
      return avaaIstunto(nimi, `/pura uusi ${nimi}`);
    },
  };

  async function suorita(toiminto, nimi) {
    if (!Object.hasOwn(toteutus, toiminto)) throw new Hylatty(404, 'tuntematon toiminto');
    if (kaynnissa) { kirjaa({ toiminto, nimi, tulos: 'hylätty', syy: 'toinen toiminto käynnissä' }); throw new Hylatty(429, `toinen toiminto on käynnissä (${kaynnissa})`); }
    kaynnissa = toiminto;
    try {
      const tulos = await toteutus[toiminto](nimi);
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
  return suorita;
}
