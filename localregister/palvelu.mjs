// Rekisterisynkan palvelinpää Scopes-palvelussa (LOCALREGISTER-PROTOKOLLA 14.10.2026, MUOTO §5–§6).
//
// Ajopaikka (käyttäjä 14.10.2026 "selvitä itse"): Scopes-palvelun sisällä, koska äpillä on sinne jo avain,
// verkkoreitti (kotiverkko ja WireGuard) ja cronin valvoma käynnistys; oma prosessi tarvitsisi toisen avaimen,
// portin ja cron-rivin (root). Sivujärjestelmä ei saa jumittaa palvelua: uudelleentuonti (1–2 s) ajetaan
// lapsiprosessissa, ja tiivisteet pidetään välimuistissa, jottei tyhjä tarkistus lue 5 500 tiedostoa.
//
// Uudelleentuonti (käyttäjä 14.10.2026 "molemmat"): ennen jokaista tiivistekyselyä, jos gitin HEAD on
// muuttunut, ja lisäksi 10 min välein. Vastaanotto odottaa käynnissä olevan tuonnin loppuun, jotta
// lapsiprosessi ja palvelu eivät kirjoita samaa yksikköä yhtä aikaa.
//
//   GET  /api/lr/tiiviste              { laite, juuri, rekisterit: { polku: tiiviste }, valiMin }
//   POST /api/lr/listat {rekisterit}   { polku: { meta, yksikot: [{ id, versio, rinnakkaiset }] } }
//   POST /api/lr/hae {rekisteri, idt}  { yksikot }
//   POST /api/lr/laheta {metat, yksikot}   { otettu, ohitettu, ristiriidat }
//   GET  /api/lr/ristiriidat           { ristiriidat: [yksikkö, jossa rinnakkaiset] }
//   GET  /api/lr/teksti/<polku>        { teksti } yhteinen nykytila markdownina
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { hae, kelpoPolku, lista, OLETUSJUURI, ristiriidat, tiivisteet, tulosta, vastaanota } from './lr.mjs';

const ajaa = promisify(execFile);
const LR = join(dirname(fileURLToPath(import.meta.url)), 'lr.mjs');
export const VALI_MIN = 10;

export class LrVirhe extends Error { constructor(koodi, viesti) { super(viesti); this.koodi = koodi; } }

export function luoLr({ repoJuuri, lrJuuri = OLETUSJUURI, laite = 'oneplus', tuo = null, head = null } = {}) {
  const valimuisti = new Map();
  let viimeHead = null;
  let kaynnissa = null;
  const lueHead = head ?? (async () => (await ajaa('git', ['rev-parse', 'HEAD'], { cwd: repoJuuri })).stdout.trim());
  const ajaTuonti = tuo ?? (() => ajaa(process.execPath, [LR, 'tuo', '--juuri', lrJuuri, '--laite', laite], { cwd: repoJuuri, timeout: 120_000 }));

  // Yksi tuonti kerrallaan; samanaikaiset kutsujat odottavat samaa.
  function tuoJosMuuttunut() {
    if (kaynnissa) return kaynnissa;
    kaynnissa = (async () => {
      try {
        const h = await lueHead();
        if (h === viimeHead) return false;
        await ajaTuonti();
        viimeHead = h;
        valimuisti.clear();
        return true;
      } finally { kaynnissa = null; }
    })();
    return kaynnissa;
  }

  async function kasittele(metodi, polku, lueRunko) {
    if (metodi === 'GET' && polku === '/api/lr/tiiviste') {
      try { await tuoJosMuuttunut(); } catch (e) { console.error(`lr: uudelleentuonti epäonnistui: ${e.message}`); }
      return { laite, ...tiivisteet(lrJuuri, valimuisti), valiMin: VALI_MIN };
    }
    if (metodi === 'GET' && polku === '/api/lr/ristiriidat') return { ristiriidat: ristiriidat(lrJuuri) };
    const t = polku.match(/^\/api\/lr\/teksti\/(.+)$/);
    if (metodi === 'GET' && t) {
      const p = decodeURIComponent(t[1]);
      if (!kelpoPolku(p)) throw new LrVirhe(404, 'tuntematon rekisteri');
      try { return { teksti: tulosta(lrJuuri, p) }; } catch { throw new LrVirhe(404, 'tuntematon rekisteri'); }
    }
    if (metodi !== 'POST') throw new LrVirhe(404, 'tuntematon polku');
    const runko = await lueRunko();
    try {
      if (polku === '/api/lr/listat') {
        if (!Array.isArray(runko.rekisterit)) throw new LrVirhe(400, 'rekisterit puuttuu');
        return Object.fromEntries(runko.rekisterit.map((p) => [p, lista(lrJuuri, p)]));
      }
      if (polku === '/api/lr/hae') return { yksikot: hae(lrJuuri, runko.rekisteri, runko.idt ?? []) };
      if (polku === '/api/lr/laheta') {
        if (kaynnissa) await kaynnissa.catch(() => {});
        const v = vastaanota(lrJuuri, { metat: runko.metat ?? [], yksikot: runko.yksikot ?? [] });
        for (const p of v.muuttuneet) valimuisti.delete(p);
        return { otettu: v.otettu, ohitettu: v.ohitettu, ristiriidat: v.ristiriidat };
      }
    } catch (e) {
      valimuisti.clear(); // osittain kirjoitettu lähetys: tiivisteet lasketaan uudelleen
      if (e instanceof LrVirhe) throw e;
      throw new LrVirhe(e.code === 'ENOENT' ? 404 : 400, e.message);
    }
    throw new LrVirhe(404, 'tuntematon polku');
  }

  return {
    kasittele,
    tuoJosMuuttunut,
    ajasta() { return setInterval(() => tuoJosMuuttunut().catch((e) => console.error(`lr: ${e.message}`)), VALI_MIN * 60_000).unref(); },
  };
}
