// Äpin jäätymisen diagnostiikka (SCOPES-JAATYMINEN 14.10.2026, käyttäjä: "välillä äpissä on tapahtunut jäätymistä").
// Kolme lokia, rivi kerrallaan JSONina, jotta jäätymishetki voidaan lukea jälkikäteen kummaltakin puolelta:
//   pyyntöloki  (~/.local/state/scopes-pyynnot.loki)  jokainen pyyntö: polku, koodi, kesto ms, lähdeosoite; katkesi: true,
//               jos yhteys sulkeutui ennen vastausta (puhelin lähti tai aikaraja)
//   silmukka    samaan pyyntölokiin tyyppi "silmukka", kun Noden tapahtumasilmukka oli tukossa yli SILMUKKA_MS (synkroninen
//               luku tukkii kaikki pyynnöt yhtä aikaa, ja äppi näkee sen jäätymisenä)
//   äppiloki    (~/.local/state/scopes-app.loki)  äpin lähettämät tapahtumat POST /api/diagnostiikka -rungosta: pääsäikeen
//               jumit, hitaat ja epäonnistuneet pyynnöt, elinkaari, MetricKitin jumiraportit (Diagnostiikka.swift)
// Kumpikin tiedosto kiertää RAJA-koossa nimelle <loki>.1, joten loki ei kasva rajatta 5 s:n kyselyistä.
import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { Hylatty } from './toiminnot.mjs';

const RAJA = 5 * 1024 * 1024;
const RUNKO_RAJA = 1024 * 1024; // MetricKitin jumiraportti kutsupinoineen on kymmeniä kilotavuja
const TAPAHTUMIA_ENINTAAN = 500;
const SILMUKKA_VALI = 250;
const SILMUKKA_MS = 500;

export function luoDiagnostiikka(asetukset, { nyt = () => new Date(), raja = RAJA } = {}) {
  const pyyntoloki = asetukset.pyyntoloki ?? join(homedir(), '.local/state/scopes-pyynnot.loki');
  const appiloki = asetukset.appiloki ?? join(homedir(), '.local/state/scopes-app.loki');
  const koot = new Map();

  function kirjaa(tiedosto, rivi) {
    try {
      const teksti = JSON.stringify(rivi) + '\n';
      if (!koot.has(tiedosto)) {
        mkdirSync(dirname(tiedosto), { recursive: true });
        let koko = 0;
        try { koko = statSync(tiedosto).size; } catch { /* uusi tiedosto */ }
        koot.set(tiedosto, koko);
      }
      if (koot.get(tiedosto) + teksti.length > raja) {
        try { renameSync(tiedosto, tiedosto + '.1'); } catch { /* ei vielä tiedostoa */ }
        koot.set(tiedosto, 0);
      }
      appendFileSync(tiedosto, teksti);
      koot.set(tiedosto, koot.get(tiedosto) + Buffer.byteLength(teksti));
    } catch { /* loki ei estä pyyntöä */ }
  }

  // Kääre käsittelijälle: rivi kirjataan, kun vastaus on lähetetty tai yhteys sulkeutui.
  function kaari(kasittele) {
    return (req, res) => {
      const alku = performance.now();
      const aika = nyt().toISOString();
      res.on('close', () => kirjaa(pyyntoloki, {
        aika,
        metodi: req.method,
        polku: new URL(req.url, 'http://x').pathname,
        koodi: res.statusCode,
        ms: Math.round(performance.now() - alku),
        osoite: req.socket?.remoteAddress,
        ...(res.writableFinished ? {} : { katkesi: true }),
      }));
      return kasittele(req, res);
    };
  }

  // Ajastin, jonka myöhästyminen kertoo tukkeutuneesta tapahtumasilmukasta. Palauttaa pysäytysfunktion.
  function silmukka() {
    let edellinen = performance.now();
    const ajastin = setInterval(() => {
      const hetki = performance.now();
      const viive = Math.round(hetki - edellinen - SILMUKKA_VALI);
      edellinen = hetki;
      if (viive > SILMUKKA_MS) kirjaa(pyyntoloki, { aika: nyt().toISOString(), tyyppi: 'silmukka', viive });
    }, SILMUKKA_VALI);
    ajastin.unref();
    return () => clearInterval(ajastin);
  }

  // POST /api/diagnostiikka: { laite?: {...}, tapahtumat: [{ aika, tyyppi, ... }] } → { kirjattu }
  function vastaanota(req) {
    return new Promise((ok, ei) => {
      const palat = [];
      let koko = 0;
      req.on('data', (pala) => { koko += pala.length; if (koko <= RUNKO_RAJA) palat.push(pala); });
      req.on('end', () => {
        if (koko > RUNKO_RAJA) return ei(new Hylatty(413, 'runko liian suuri'));
        let runko;
        try { runko = JSON.parse(Buffer.concat(palat).toString('utf8') || '{}'); } catch { return ei(new Hylatty(400, 'runko ei ole JSONia')); }
        const tapahtumat = runko?.tapahtumat;
        if (!Array.isArray(tapahtumat) || tapahtumat.length > TAPAHTUMIA_ENINTAAN || !tapahtumat.every((t) => t && typeof t === 'object' && !Array.isArray(t))) {
          return ei(new Hylatty(400, 'tapahtumat puuttuu tai ei kelpaa'));
        }
        const vastaanotettu = nyt().toISOString();
        const laite = runko.laite && typeof runko.laite === 'object' ? runko.laite : undefined;
        for (const t of tapahtumat) kirjaa(appiloki, { vastaanotettu, ...(laite ? { laite } : {}), ...t });
        ok({ kirjattu: tapahtumat.length });
      });
      req.on('error', ei);
    });
  }

  return { kaari, silmukka, vastaanota, pyyntoloki, appiloki };
}
