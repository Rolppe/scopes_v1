#!/usr/bin/env node
// scopes/siirto/economy/budjetti.mjs
// ECONOMY-BUDJETTI (27.10.2026): Antigravityn 1500 kutsun vuorokausibudjetin
// deterministinen hallinta, kulutusnopeuden (burn rate) seuranta, skooppi- ja istuntokohtainen
// budjetointi sekä siirtojen säästöstrategiat.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pacificResetAika } from '../../palvelu/agy-kayttoraja.mjs';
import { tunnistaKulutusSkooppi } from './kuluttajat.mjs';

const TAMA = dirname(fileURLToPath(import.meta.url));
const OLETUS_JUURI = resolve(TAMA, '../../../');

export const VUOROKAUSIBUDJETTI_KUTSUJA = 1500;
export const TAVOITE_PAKETTI_KUTSUJA = 30;
export const MAKSIMI_PAKETTI_KUTSUJA = 60;

export const HALYTYSTASOT = {
  NORMAALI: 'NORMAALI',
  VAROITUS: 'VAROITUS',
  KRIITTINEN: 'KRIITTINEN',
  YLITETTY: 'YLITETTY',
};

export const SAASTOTILAT = {
  NORMAALI: 'NORMAALI',
  SAASTOTILA: 'SAASTOTILA',
  KRIITTINEN_SAASTO: 'KRIITTINEN_SAASTO',
};

export const OLETUS_SKOOPPI_ALLOKAATIO = {
  'scopes2 ydin': 300,
  'scopes2 macos': 200,
  'scopes2 ios': 150,
  'scopes2 shared': 150,
  'scopes siirto git': 100,
  'infra expresso': 100,
  'scopes siirto economy': 100,
  'muut ja reservi': 400,
};

export const VAIHE_BUDJETIT = {
  purku: { tavoite: 0, maksimi: 2, kuvaus: 'Malliton purku (0 mallikutsua) tai nopea purkutiedoston luku' },
  suunnittelu: { tavoite: 5, maksimi: 10, kuvaus: 'Arkkitehtuuri ja rajapintojen määrittely' },
  koodaus: { tavoite: 15, maksimi: 30, kuvaus: 'Toteutus ja koodimuokkaukset' },
  testaus: { tavoite: 5, maksimi: 10, kuvaus: 'Batch-testit ja gate.sh koottuna yhdellä komennolla' },
  pakkaus: { tavoite: 1, maksimi: 2, kuvaus: 'Deterministinen hybridi-pakkaus (pakkaa-hybridi.mjs)' },
};

/**
 * Laskee nykyisen vuorokausibudjetin tilanteen transkripteista tai annetusta datasta.
 */
export function laskeBudjettitilanne({
  brainDir = join(homedir(), '.gemini/antigravity-cli/brain'),
  nytMs = Date.now(),
  kiintio = VUOROKAUSIBUDJETTI_KUTSUJA,
  manuaalinenKaytto = null,
} = {}) {
  const { resetAika, seuraavaReset } = pacificResetAika(nytMs);
  let userInputs = 0;
  let plannerResponses = 0;
  const skooppiKulutus = {};

  if (manuaalinenKaytto !== null) {
    if (typeof manuaalinenKaytto === 'number') {
      plannerResponses = manuaalinenKaytto;
      userInputs = Math.round(manuaalinenKaytto * 0.07);
    } else if (typeof manuaalinenKaytto === 'object') {
      plannerResponses = manuaalinenKaytto.plannerResponses ?? manuaalinenKaytto.kaytettyKutsuja ?? 0;
      userInputs = manuaalinenKaytto.userInputs ?? Math.round(plannerResponses * 0.07);
      if (manuaalinenKaytto.skooppiKulutus) {
        Object.assign(skooppiKulutus, manuaalinenKaytto.skooppiKulutus);
      }
    }
  } else {
    try {
      if (existsSync(brainDir)) {
        const kansiot = readdirSync(brainDir);
        for (const cid of kansiot) {
          const p = join(brainDir, cid, '.system_generated/logs/transcript.jsonl');
          let stat;
          try {
            stat = statSync(p);
          } catch {
            continue;
          }
          if (stat.mtimeMs < resetAika) continue;

          let content = '';
          try {
            content = readFileSync(p, 'utf8');
          } catch {
            continue;
          }

          const skooppi = tunnistaKulutusSkooppi(content);
          const lines = content.split('\n');
          let istunnonPlanner = 0;
          let istunnonUser = 0;

          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            if (!line) continue;
            try {
              const step = JSON.parse(line);
              if (!step.created_at) continue;
              const t = new Date(step.created_at).getTime();
              if (t < resetAika) break;
              if (step.type === 'USER_INPUT') {
                userInputs++;
                istunnonUser++;
              } else if (step.type === 'PLANNER_RESPONSE') {
                plannerResponses++;
                istunnonPlanner++;
              }
            } catch {}
          }

          if (istunnonPlanner > 0) {
            skooppiKulutus[skooppi] = (skooppiKulutus[skooppi] || 0) + istunnonPlanner;
          }
        }
      }
    } catch {}
  }

  const kaytettyKutsuja = plannerResponses;
  const jaljellaKutsuja = Math.max(0, kiintio - kaytettyKutsuja);
  const kayttoProsentti = kiintio > 0 ? Math.round((kaytettyKutsuja / kiintio) * 1000) / 10 : 0;

  // Hälytystaso ja säästötila
  let taso = HALYTYSTASOT.NORMAALI;
  let saastotila = SAASTOTILAT.NORMAALI;

  if (kaytettyKutsuja >= kiintio) {
    taso = HALYTYSTASOT.YLITETTY;
    saastotila = SAASTOTILAT.KRIITTINEN_SAASTO;
  } else if (kayttoProsentti >= 90) {
    taso = HALYTYSTASOT.KRIITTINEN;
    saastotila = SAASTOTILAT.KRIITTINEN_SAASTO;
  } else if (kayttoProsentti >= 70) {
    taso = HALYTYSTASOT.VAROITUS;
    saastotila = SAASTOTILAT.SAASTOTILA;
  }

  // Aika- ja kulutusnopeuslaskelmat
  const resetMs = new Date(seuraavaReset).getTime();
  const tuntejaResetista = Math.max(0.1, (nytMs - resetAika) / (1000 * 3600));
  const tuntejaJaljella = Math.max(0.1, (resetMs - nytMs) / (1000 * 3600));

  const kutsutPerTunti = Math.round((kaytettyKutsuja / tuntejaResetista) * 10) / 10;
  const sallittuKutsutPerTunti = Math.round((jaljellaKutsuja / tuntejaJaljella) * 10) / 10;
  const ennusteLopputulos = Math.round(kaytettyKutsuja + kutsutPerTunti * tuntejaJaljella);
  const riittaakoBudjetti = ennusteLopputulos <= kiintio;
  const pakettejaJaljella = Math.floor(jaljellaKutsuja / TAVOITE_PAKETTI_KUTSUJA);

  return {
    kiintio,
    kaytettyKutsuja,
    userInputs,
    plannerResponses,
    jaljellaKutsuja,
    kayttoProsentti,
    taso,
    saastotila,
    pakettejaJaljella,
    kutsutPerTunti,
    sallittuKutsutPerTunti,
    ennusteLopputulos,
    riittaakoBudjetti,
    tuntejaResetista: Math.round(tuntejaResetista * 10) / 10,
    tuntejaJaljella: Math.round(tuntejaJaljella * 10) / 10,
    resetAika: new Date(resetAika).toISOString(),
    seuraavaReset,
    skooppiKulutus,
    aikaleima: nytMs,
  };
}

/**
 * Arvioi yksittäisen istunnon / paketin budjetin tilanteen.
 */
export function arvioiIstunnonBudjetti({
  kaytetytKutsut = 0,
  tavoite = TAVOITE_PAKETTI_KUTSUJA,
  maksimi = MAKSIMI_PAKETTI_KUTSUJA,
  saastotila = SAASTOTILAT.NORMAALI,
} = {}) {
  // Säästötilassa paketille asetetaan tiukempi katto
  let tehoTavoite = tavoite;
  let tehoMaksimi = maksimi;

  if (saastotila === SAASTOTILAT.KRIITTINEN_SAASTO) {
    tehoTavoite = 10;
    tehoMaksimi = 15;
  } else if (saastotila === SAASTOTILAT.SAASTOTILA) {
    tehoTavoite = 25;
    tehoMaksimi = 40;
  }

  const kayttoProsentti = Math.round((kaytetytKutsut / tehoTavoite) * 100);
  let status = 'VIHREA';
  let suositus = 'Jatka normaalia toteutusta.';

  if (kaytetytKutsut >= tehoMaksimi) {
    status = 'YLITETTY';
    suositus = `Budjettikatto ylittynyt (${kaytetytKutsut}/${tehoMaksimi} kutsua). Aja gate ja pakkaa välittömästi.`;
  } else if (kaytetytKutsut >= tehoTavoite) {
    status = 'KELTAINEN';
    suositus = `Tavoitebudjetti saavutettu (${kaytetytKutsut}/${tehoTavoite} kutsua). Viimeistele koodi, testaa ja valmistaudu pakkaukseen.`;
  }

  return {
    kaytetytKutsut,
    tavoite: tehoTavoite,
    maksimi: tehoMaksimi,
    kayttoProsentti,
    status,
    saastotila,
    suositus,
  };
}

/**
 * Muotoilee kattavan tai tiiviin markdown-raportin vuorokausibudjetista.
 */
export function muotoileBudjettiRaportti(tila, { skooppi = null, lyhyt = false } = {}) {
  if (!tila) return '';

  if (lyhyt) {
    const tasoMerkki = tila.taso === HALYTYSTASOT.NORMAALI ? '🟢' : tila.taso === HALYTYSTASOT.VAROITUS ? '🟡' : '🔴';
    return `${tasoMerkki} AGY 1500 Budjetti: ${tila.kaytettyKutsuja}/${tila.kiintio} (${tila.kayttoProsentti} %) | Jäljellä: ${tila.jaljellaKutsuja} (~${tila.pakettejaJaljella} pakettia) | Tahti: ${tila.kutsutPerTunti} k/h | Tila: ${tila.saastotila}`;
  }

  const rivit = [
    '# Scopes Economy — 1500 Kutsun Vuorokausibudjetti',
    '',
    `Päivitetty: ${new Date(tila.aikaleima).toLocaleString('fi-FI', { timeZone: 'Europe/Helsinki' })} (Suomen aikaa)`,
    '',
    '## 1. Yleistilanne ja kiintiö',
    '',
    `- **Kokonaiskiintiö:** ${tila.kiintio} kutsua / vrk (nollautuu klo 10:00 Suomen aikaa / 07:00 UTC)`,
    `- **Käytetty tänään:** ${tila.kaytettyKutsuja} kutsua (${tila.kayttoProsentti} %) [Käyttäjän viestejä: ${tila.userInputs}, Mallin vastauksia: ${tila.plannerResponses}]`,
    `- **Jäljellä:** ${tila.jaljellaKutsuja} kutsua (~${tila.pakettejaJaljella} kehityspakettia @ 30 kutsua/paketti)`,
    `- **Hälytystaso:** \`${tila.taso}\` → **Toimintamalli:** \`${tila.saastotila}\``,
    `- **Seuraava nollaus:** ${tila.seuraavaReset} (${tila.tuntejaJaljella} h jäljellä)`,
    '',
    '## 2. Kulutusnopeus ja ennuste',
    '',
    `- **Nykyinen tahti:** ${tila.kutsutPerTunti} kutsua / tunti (kulunut ${tila.tuntejaResetista} h)`,
    `- **Sallittu tahti:** ${tila.sallittuKutsutPerTunti} kutsua / tunti kiintiön riittämiseksi loppuvuorokaudeksi`,
    `- **Ennustettu lopputulos:** ${tila.ennusteLopputulos} kutsua (${tila.riittaakoBudjetti ? ' Budjetti riittää nykytahdilla' : '⚠️ HUOMIO: budjetti ylittyy nykytahdilla, siirry säästötilaan!'})`,
    '',
    '## 3. Vaihe- ja istuntobudjetit',
    '',
    'Jokainen siirto ja kehityspaketti toimii seuraavien kustannusraamien puitteissa:',
    '| Vaihe | Tavoite | Maksimi | Menetelmä ja säästö |',
    '|---|---|---|---|',
    '| Purku & aloitus | 0 | 2 | Malliton purku (`pura-malliton.mjs` vie 0 mallikutsua) |',
    '| Suunnittelu | 5 | 10 | Täsmällinen tehtävärajaus, ei sokkohakuja |',
    '| Koodaus | 15 | 30 | Tiedostokartan suorat `file://`-linkit |',
    '| Testaus | 5 | 10 | Koontiajo (`gate.sh`, batch testit), `WaitMsBeforeAsync: 10000` |',
    '| Pakkaus | 1 | 2 | Deterministinen hybridi (`pakkaa-hybridi.mjs`) |',
    '| **Yhteensä / paketti** | **~25–30** | **60** | **Mahdollistaa 25–50 pakettia / vrk** |',
    '',
    '## 4. Siirtojen ja istuntojen säästöohjeet',
    '',
    '1. **Malliton purku:** Älä koskaan lue rekisteriä tai ohjeita ennen purkuraporttia (säästö 5–10 kutsua per aloitus).',
    '2. **Tiedostokartta sokkohakujen sijaan:** Älä aja komentorivillä `find`, `grep` tai `ls` -hakuja, vaan käytä suoria tiedostopolkuja (säästö ~1 000 kutsua/vrk).',
    '3. **Komentoviiveet ja reaktiivinen herätys:** Käytä aina `WaitMsBeforeAsync: 10000` ja älä pollaa taustatehtäviä `manage_task status` -silmukassa (säästö ~385 kutsua/vrk).',
    '4. **Batch-testit:** Aja skoopin gate- ja yksikkötestit koottuna yhdellä `gate.sh`-kutsulla sen sijaan että ajaisit kymmeniä erillisiä testejä.',
    '5. **Deterministinen hybridipakkaus:** Käytä vain `pakkaa-hybridi.mjs` -skriptiä, joka korvaa vanhan vaihepakkauksen (säästö ~80 kutsua/vrk).',
  ];

  if (skooppi && tila.skooppiKulutus && tila.skooppiKulutus[skooppi]) {
    const skoopinKaytto = tila.skooppiKulutus[skooppi];
    const allokoitu = OLETUS_SKOOPPI_ALLOKAATIO[skooppi] ?? 100;
    rivit.push(
      '',
      `## 5. Skoopin '${skooppi}' kulutus`,
      `- Käytetty tänään: ${skoopinKaytto} kutsua`,
      `- Allokoitu tavoite: ${allokoitu} kutsua / vrk`,
      `- Osuus allokaatiosta: ${Math.round((skoopinKaytto / allokoitu) * 100)} %`
    );
  } else if (Object.keys(tila.skooppiKulutus || {}).length > 0) {
    rivit.push('', '## 5. Skooppien kulutusjakauma tänään');
    for (const [sk, maara] of Object.entries(tila.skooppiKulutus)) {
      const allok = OLETUS_SKOOPPI_ALLOKAATIO[sk] ?? 100;
      rivit.push(`- **${sk}:** ${maara} kutsua (allokaatio: ${allok} k, ${Math.round((maara / allok) * 100)} %)`);
    }
  }

  return rivit.join('\n');
}

// CLI-tuki
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const lyhyt = args.includes('--lyhyt');
  const skooppiArgIdx = args.indexOf('--skooppi');
  const skooppi = skooppiArgIdx !== -1 ? args[skooppiArgIdx + 1] : null;

  const tila = laskeBudjettitilanne();

  if (json) {
    console.log(JSON.stringify(tila, null, 2));
  } else {
    console.log(muotoileBudjettiRaportti(tila, { skooppi, lyhyt }));
  }
}
