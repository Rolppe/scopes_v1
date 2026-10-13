// Skooppien hallintatoiminnot puhelimesta (DEMO-SCOPES-HALLINTA 13.10.2026). Turvamalli (käyttäjä 13.10.2026,
// "vain valmiit toiminnot"): palvelu ajaa vain nämä kolme valmista toimintoa, eikä puhelimelta tule komentoa,
// lippua tai vapaata tekstiä mihinkään komentoriviin.
//   pura   — olemassa olevalle skoopille uusi Remote Control -istunto tmuxiin, ensimmäinen viesti `/pura <skooppi>`
//   pakkaa — skoopin ainoaan vapaaseen tmux-istuntoon kirjoitetaan `/pakkaa`
//   uusi   — uusi istunto, ensimmäinen viesti `/pura uusi <nimi>`; nimi on tiukka [a-z0-9-]-sanoja ja vielä vapaa
// Skoopin nimi tarkistetaan skoopit.json:n avaimista (uudella: muodosta ja vapaudesta), ja komennot ajetaan
// argumenttitaulukkona ilman kuorta. Yksi toiminto kerrallaan; jokainen yritys kirjataan lokiin, myös hylätty.

import { execFile } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { istunnot, lueSkoopit } from './lahteet.mjs';

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

export function luoToiminnot(asetukset, { aja = ajaKomento, loki = asetukset.toimintoloki } = {}) {
  const autovaihto = join(asetukset.juuri, 'claude/siirto/tools/autovaihto.sh');
  let kaynnissa = null;

  const kirjaa = (rivi) => {
    if (!loki) return;
    try { mkdirSync(dirname(loki), { recursive: true }); appendFileSync(loki, JSON.stringify({ aika: new Date().toISOString(), ...rivi }) + '\n'); } catch { /* loki ei estä toimintoa */ }
  };

  const skoopinIstunnot = (nimi, skoopit) =>
    istunnot({ ...asetukset, skooppiNimet: Object.keys(skoopit) }).filter((i) => i.skooppi === nimi);

  async function avaaIstunto(skooppi, viesti) {
    const t = await aja('bash', [autovaihto, 'vaihda', skooppi, '--ei-sulje', '--viesti', viesti]);
    const osoite = istuntoOsoite(t.stdout);
    if (t.koodi !== 0 || !osoite) {
      const syy = (t.stderr.trim().split('\n').filter(Boolean).pop() ?? `autovaihto exit ${t.koodi}`).slice(0, 300);
      throw new Hylatty(502, `istunto ei käynnistynyt: ${syy}`);
    }
    return { osoite };
  }

  const toteutus = {
    async pura(nimi) {
      const skoopit = lueSkoopit(asetukset.juuri);
      if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
      if (skoopinIstunnot(nimi, skoopit).length) throw new Hylatty(409, 'skoopissa on jo käynnissä oleva istunto');
      return avaaIstunto(nimi, `/pura ${nimi}`);
    },
    async pakkaa(nimi) {
      const skoopit = lueSkoopit(asetukset.juuri);
      if (!skoopit[nimi]) throw new Hylatty(404, 'tuntematon skooppi');
      const omat = skoopinIstunnot(nimi, skoopit).filter((i) => i.ruutu);
      if (omat.length !== 1) throw new Hylatty(409, omat.length ? 'skoopissa on useita tmux-istuntoja' : 'skoopilla ei ole tmux-istuntoa, johon pakkauksen voi lähettää');
      const [i] = omat;
      if (i.tila !== 'idle') throw new Hylatty(409, `istunto on varattu (${i.tila ?? 'tila tuntematon'}); yritä vuoron jälkeen`);
      // Ruudun prosessin on oltava istunnon claude tai sen vanhempi, ettei /pakkaa osu väärään ruutuun.
      const r = await aja('tmux', ['display-message', '-p', '-t', i.ruutu, '#{pane_pid}']);
      const ruudunPid = Number(r.stdout.trim());
      if (r.koodi !== 0 || !(ruudunPid === i.pid || ruudunPid === i.vanhempi)) throw new Hylatty(409, 'istunnon tmux-ruutu ei täsmää');
      for (const a of [['-l', '/pakkaa'], ['Enter']]) {
        const t = await aja('tmux', ['send-keys', '-t', i.ruutu, ...a]);
        if (t.koodi !== 0) throw new Hylatty(502, 'tmux send-keys epäonnistui');
      }
      return { istunto: i.id };
    },
    async uusi(nimi) {
      if (typeof nimi !== 'string' || !UUSI_NIMI.test(nimi)) throw new Hylatty(400, 'nimi: 1–4 sanaa pienaakkosia, numeroita tai viivoja');
      const skoopit = lueSkoopit(asetukset.juuri);
      if (skoopit[nimi]) throw new Hylatty(409, 'skooppi on jo olemassa');
      return avaaIstunto(nimi, `/pura uusi ${nimi}`);
    },
  };

  return async function suorita(toiminto, nimi) {
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
  };
}
