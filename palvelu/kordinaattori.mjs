// scopes/palvelu/kordinaattori.mjs - Koordinaattoritiimin taustaprosessi ja agentit
import { lueSkoopit, seuraavaRivi } from './lahteet.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const AGENTIT = {
  keskustelu: {
    tunnus: 'keskustelu',
    nimi: 'Keskusteluagentti',
    oletusMalli: 'mac-agy/gemini-3.8-flash-low',
    tehtava: 'Viestinvaihto ihmisen ja tiimin kanssa. Reagoi nopeasti, ohjaa tehtävät selvitykseen ja esittää tiimin löydökset selkeinä valintoina ja toimintokortteina.'
  },
  selvitys: {
    tunnus: 'selvitys',
    nimi: 'Selvitysagentti',
    oletusMalli: 'mac-agy/gemini-3.8-flash-medium',
    tehtava: 'Hakee skooppien rekisterit, polut, avoimet asiat ja työkalut. Suorittaa hakuja ja arvioi, tarvitseeko tehtävä syvempää ongelmanratkaisua vai suoraa siirtoa.'
  },
  ongelmanratkaisija: {
    tunnus: 'ongelmanratkaisija',
    nimi: 'Ongelmanratkaisija',
    oletusMalli: 'mac-agy/gemini-3.8-flash-high',
    tehtava: 'Syvällinen arkkitehtuuriharkinta, ristiriitojen ratkaisu ja monitahoisten siirtojen suunnittelu ennen toteutusta.'
  }
};

/**
 * Palauttaa kootun yhteenvedon kaikista rekistereistä ja skooppien tiloista selvitysagentille
 */
export function haeSkooppiYhteenveto(juuri) {
  const skoopit = lueSkoopit(juuri);
  const tulos = [];
  for (const [nimi, polut] of Object.entries(skoopit)) {
    const paarekisteri = polut[0];
    const tiedosto = join(juuri, paarekisteri);
    let seuraava = null;
    let tarkoitus = '';
    if (existsSync(tiedosto)) {
      try {
        const teksti = readFileSync(tiedosto, 'utf8');
        seuraava = seuraavaRivi(teksti, nimi);
        const tMatch = teksti.match(/##\s+Tarkoitus\s+ja\s+raja\s*\n+([^#\n]+)/i);
        if (tMatch) tarkoitus = tMatch[1].trim();
      } catch {}
    }
    tulos.push({
      nimi,
      rekisteri: paarekisteri,
      seuraava: seuraava?.id ?? null,
      tarkoitus
    });
  }
  return tulos;
}

/**
 * Koordinaattorin järjestelmäkehote
 */
export function luoKordinaattoriKehote(juuri, skooppilista = null) {
  const lista = skooppilista ?? haeSkooppiYhteenveto(juuri);
  const skooppiKuvaukset = lista
    .map(s => `- **${s.nimi}** (${s.rekisteri}): ${s.seuraava ? 'Seuraava: ' + s.seuraava : 'Ei seuraavaa'} ${s.tarkoitus ? '— ' + s.tarkoitus : ''}`)
    .join('\n');

  return `Olet Scopes-koordinaattoritiimin Keskusteluagentti.
Tiimiisi kuuluvat:
1. Keskusteluagentti (Sinä, nopea Gemini Flash Low)
2. Selvitysagentti (tutkii skoopit, polut ja rekisterit)
3. Ongelmanratkaisija (syvällinen harkinta tarvittaessa)

Projektin skoopit:
${skooppiKuvaukset}

Tehtäväsi:
1. Kuuntele käyttäjän toiveita tai ideoita.
2. Etsi sopivin skooppi selvitysagentin tietojen perusteella.
3. Jos tehtävä on monitahoinen, kutsu ongelmanratkaisijaa.
4. Esitä käyttäjälle selkeä vastaus ja ehdota konkreettista siirtoa skooppiin muodossa:
   TOIMINTO: /pura <skooppi> tai PAKETTI: <paketin nimi>.`;
}

/**
 * Kordinaattori-palveluolio
 */
export function ratkaiseMalli(agentti) {
  if (!agentti) return AGENTIT.keskustelu.oletusMalli;
  if (AGENTIT[agentti]) return AGENTIT[agentti].oletusMalli;
  return agentti;
}

export function luoKordinaattori(parametrit) {
  const juuri = typeof parametrit === "string" ? parametrit : (parametrit?.juuri ?? process.cwd());
  const aja = typeof parametrit === "object" ? parametrit?.aja ?? null : null;
  return {
    tila() {
      return {
        agentit: Object.values(AGENTIT),
        skoopit: haeSkooppiYhteenveto(juuri).length
      };
    },
    skoopit() {
      return haeSkooppiYhteenveto(juuri);
    },
    kehote() {
      return luoKordinaattoriKehote(juuri);
    },
    ratkaiseMalli
  };
}
