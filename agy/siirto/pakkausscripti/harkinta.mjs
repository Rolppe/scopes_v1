// Harkintamoduuli hybridi-pakkausscriptille (Moduuli 2)
// Kutsuu mallia strukturoidulla JSON-skeemalla ja palauttaa analyysin: agy (oletus Gemini 3.8 Flash) tai
// Claude Code -istunnolle claude CLI (Haiku, V-652 28.10.2026: tilauksen kautta, ei maksullista API:a).

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { onPerheenSkooppi, skoopinHakemisto } from './skooppipolku.mjs';

const HAKEMISTO = dirname(fileURLToPath(import.meta.url));
export const SKEEMA_POLKU = join(HAKEMISTO, 'schema.json');
export const SKEEMA = JSON.parse(readFileSync(SKEEMA_POLKU, 'utf8'));

// Claude-istunnon viestit sisältävät työkalukutsut ja tulokset (louhiClaudeViestit), joten ne valitaan lopusta
// merkkibudjetilla; agy-viestit kuten ennen 30 viimeistä.
export const CLAUDE_VIESTIBUDJETTI = 40000;

export function valitseViestit(faktat) {
  const viestit = faktat.viestit || [];
  if (faktat.istuntoLahde !== 'claude') return viestit.slice(-30);
  const valitut = [];
  let merkit = 0;
  for (let i = viestit.length - 1; i >= 0; i--) {
    merkit += viestit[i].teksti.length + viestit[i].rooli.length + 4;
    if (merkit > CLAUDE_VIESTIBUDJETTI && valitut.length) break;
    valitut.unshift(viestit[i]);
  }
  return valitut;
}

/**
 * Muodostaa tiukan ja kattavan kehotteen harkintamallille.
 */
export function muodostaKehote(faktat) {
  const skooppi = faktat.skooppi || 'tuntematon';
  const skoopinPolut = onPerheenSkooppi(skooppi) ? skoopinHakemisto(skooppi) : skooppi;

  const skoopinMuutetut = faktat.git?.skoopinMuutetut || [];
  const vieraatMuutetut = faktat.git?.vieraatMuutetut || [];
  const diffStat = faktat.git?.diffStat || '(ei diffiä)';
  const log = faktat.git?.log || '(ei committeja)';

  const viestitTeksti = valitseViestit(faktat).map((v) => `[${v.rooli}]: ${v.teksti}`).join('\n');
  // V-652: Claude-istunnon (Haiku) lisäsäännöt; agy-kehote pysyy ennallaan, kunnes Haiku on testattu toimivaksi.
  const c = faktat.istuntoLahde === 'claude';

  return `KRIITTISTÄ: ÄLÄ KUTSU TYÖKALUJA (älä lue tiedostoja tai aja komentoja). Kaikki tarvittavat faktat on annettu alla. Palauta VAIN annetun JSON-skeeman mukainen JSON-vastaus.

Olet Scopes-ekosysteemin nopea pakkausanalyytikko${c ? '' : ' (Gemini 3.8 Flash)'}.
Tehtäväsi on analysoida alla olevat faktat ja tuottaa tiukasti JSON-skeeman mukainen pakkausanalyysi skoopin pakkausmuistiota varten.

SKOOPPI: ${skooppi}
SKOOPIN OMAT POLUT: ${skoopinPolut}/**

SKOOPIN MUUTETUT TIEDOSTOT:
${skoopinMuutetut.length ? skoopinMuutetut.map((m) => `- ${m}`).join('\n') : '(ei omia muutettuja tiedostoja)'}

VIERAAT MUUTETUT TIEDOSTOT:
${vieraatMuutetut.length ? vieraatMuutetut.map((m) => `- ${m}`).join('\n') : '(ei vieraita muutoksia)'}

GIT DIFF STAT:
${diffStat}

VIIMEISIMMÄT COMMITIT:
${log}

AIEMPI SEURAAVA PAKETTI (HEAD):
${faktat.seuraavaHead || '(ei aiempaa leimaa)'}

KESKUSTELUN VIESTIT (otanta):
${viestitTeksti || '(ei viestejä)'}

NOUDATA TARKASTI NÄITÄ SÄÄNTÖJÄ:
1. "tehty": luettele konkreettiset asiat, jotka saatiin valmiiksi ja todennettiin tässä keskustelussa.${c ? ' VIIMEISIMMÄT COMMITIT voivat olla aiemmista istunnoista: kirjaa tehdyksi vain viesteissä näkyvä työ. Purkurutiinit (sa-herätykset, CronCreate, ToolSearch) eivät ole tehtyä työtä.' : ''}
2. "todettu": ${c ? 'tässä keskustelussa tehdyt mittaukset, testitulokset ja todennetut havainnot lähteineen (polku:rivi, commit). Älä toista purkuraportin vakiorivejä (SYNKKA, KÄYTTÖASTE, LUETTU, KONTEKSTI, ASENNUS).' : 'mittaukset, testitulokset ja todennetut havainnot lähteineen.'}
3. "paatokset": ${c ? 'keskustelussa sanotut arkkitehtuuri- ja linjauspäätökset sellaisinaan. Älä käännä päätöksen merkitystä (esim. "oletus ennallaan" ei ole käyttöönotto) Kirjaa myös käyttäjän rajaukset (esim. "X:ää ei tarvita"), selvityksen tai mittauksen johtopäätös ja rekisteriin tai vikaan kirjattu linjaus ("ehdotetaan X, oletus ennallaan") sellaisinaan.' : 'tehdyt arkkitehtuuri- ja linjauspäätökset.'}
4. "avoimet": taulukko { asia, tila, askel } (tai [] jos ei avoimia).
5. "viat": taulukko { vika, tila } (tai [] jos ei vikoja).
6. "hukka": jos ei havaittu hukkatietoja tai turhaa työtä, kirjoita TÄSMÄLLEEN: "ei — ei havaittu hukkatietoja".${c ? ' Purkuohjeen määräämät toimet (CronCreate-herätykset sa-tick ja sa-uusinta, ToolSearch, PushNotification, kysymys) eivät ole hukkaa.' : ''}
7. "kesken": jos kaikki pyydetty on tehty, kirjoita TÄSMÄLLEEN: "ei — kaikki pyydetty käsitelty".
8. "seuraavaPaketti": Jos faktat sisältävät kelvollisen AIEMPI SEURAAVA PAKETTI (HEAD) -rivin, säilytä se tai muotoile looginen jatkopaketti muodossa:
   "SEURAAVA PAKETTI: <TUNNUS> — <kuvaus> — polut: ${skoopinPolut}/** — aloitus: /pura ${skooppi}"
   Älä aseta "ei mitään", jos työlle on suunniteltu jatkoa tai rekisterissä on seuraava paketti.${c ? '\n   Jos viestit osoittavat AIEMMAN SEURAAVA PAKETIN tehdyksi tässä keskustelussa, älä toista sitä: kirjaa viesteissä sovittu jatko tai "SEURAAVA PAKETTI: ei mitään — <syy>".\n   Valitse jatko näin: (a) viesteissä nimetty seuraava työ, jonka tämä skooppi voi tehdä omissa poluissaan (myös mittaus tai vertailu, \"mitattava ennen …\"), vaikka muu toteutus odottaisi muita → paketti. (b) Käyttäjän valinta vaihtoehtojen välillä, josta syntyy skoopin seuraava työ → paketti <TUNNUS>-VALINTA, jonka kuvaus nimeää vaihtoehdot. (c) Jäljellä vain käyttäjän toimi (asennus, laite, kuittaus) tai muiden skooppien työ → \"SEURAAVA PAKETTI: ei mitään — odottaa <kuka>: <mitä>\"; älä tee siitä pakettia. Commit, push ja rekisterin kirjaus tehdään tässä pakkauksessa: ne eivät ole seuraava paketti.' : ''}
   TÄRKEÄÄ: polut-kentän on kuuluttava skoopille "${skooppi}" ja aloitus-kentän on oltava "/pura ${skooppi}".

Palauta VAIN puhdas JSON-objekti, joka täyttää annetun JSON-skeeman.`;
}

export const HUKKA_RE = /^(ei\s+[—–-]\s+\S.*|kyllä\s+[—–-]\s+\S.*|\|.+\|)$/;
export const KESKEN_RE = /^(ei\s+[—–-]\s+\S.*|kyllä\s+[—–-]\s+\S.*|Viimeinen viesti[\s\S]+)$/;
export const SEURAAVA_RE = /^SEURAAVA PAKETTI:\s*(ei mitään\s*[—–-]\s*\S.*|\S+.*?\s+[—–-]\s+.+?\s+[—–-]\s*polut:\s*\S.+?\s+[—–-]\s*aloitus:\s*\/(pura|paketoi|pakkaa)\s+\S.*)$/;

/**
 * Validoi että objekti täyttää pakolliset kentät ja laatusäännöt.
 */
export function validoiAnalyysi(data) {
  if (!data || typeof data !== 'object') return false;
  const pakolliset = ['tehty', 'todettu', 'paatokset', 'avoimet', 'viat', 'hukka', 'kesken', 'seuraavaPaketti'];
  for (const k of pakolliset) {
    if (!(k in data)) return false;
  }
  if (!Array.isArray(data.tehty) || !Array.isArray(data.todettu) || !Array.isArray(data.paatokset)) return false;
  if (!Array.isArray(data.avoimet) || !Array.isArray(data.viat)) return false;

  for (const a of data.avoimet) {
    if (!a || typeof a !== 'object' || Array.isArray(a) || typeof a.asia !== 'string' || !a.asia.trim() || typeof a.tila !== 'string' || !a.tila.trim() || typeof a.askel !== 'string' || !a.askel.trim()) return false;
  }

  for (const v of data.viat) {
    if (!v || typeof v !== 'object' || Array.isArray(v) || typeof v.vika !== 'string' || !v.vika.trim() || typeof v.tila !== 'string' || !v.tila.trim()) return false;
  }

  if (typeof data.hukka !== 'string' || !data.hukka.trim()) return false;
  if (typeof data.kesken !== 'string' || !data.kesken.trim()) return false;
  if (typeof data.seuraavaPaketti !== 'string') return false;
  if (!data.seuraavaPaketti.startsWith('SEURAAVA PAKETTI:')) return false;
  if (!data.seuraavaPaketti.slice(17).trim()) return false;

  return true;
}

export const EI_TESTITODISTETTA = 'Testiajoja ei löytynyt transkriptista — testitulosta ei väitetä';
export const EI_PAATOKSIA = 'Ei kirjattuja päätöksiä: deterministinen synteesi ei tulkitse keskustelun linjauksia';
export const TESTIVAITE_RE = /test\w*[^.;]*?(läpä|läpi|hyväksyt|vihre|onnistu|\bpass|suoritettu)/i;

/**
 * Poistaa testiväitteet, joille transkriptissa ei ole testiajon tulosriviä (V-560, V-562), ja
 * täyttää tyhjiksi jääneet luvut rehellisellä tekstillä, ettei muistion oletusteksti väitä mitään.
 */
export function poistaLahteettomat(analyysi, faktat = {}) {
  const poistetut = [];
  if ((faktat.testitodisteet || []).length > 0) return { analyysi, poistetut };
  const tulos = { ...analyysi };
  for (const k of ['tehty', 'todettu', 'paatokset']) {
    tulos[k] = (analyysi[k] || []).filter((rivi) => {
      if (TESTIVAITE_RE.test(rivi)) {
        poistetut.push(rivi);
        return false;
      }
      return true;
    });
  }
  if (poistetut.length > 0 && !tulos.todettu.includes(EI_TESTITODISTETTA)) tulos.todettu.push(EI_TESTITODISTETTA);
  if (tulos.tehty.length === 0) tulos.tehty.push('Tehtyä ei voitu todentaa transkriptista');
  if (tulos.paatokset.length === 0) tulos.paatokset.push(EI_PAATOKSIA);
  return { analyysi: poistetut.length > 0 ? tulos : analyysi, poistetut };
}

/**
 * Tuottaa deterministisen synteesin faktojen perusteella, mikäli mallia ei käytetä tai kutsu epäonnistuu.
 */
export function syntetisoiAnalyysi(faktat) {
  const skooppi = faktat.skooppi || 'tuntematon';
  const skoopinPolut = `${skoopinHakemisto(skooppi)}/**`;

  const tehty = [];
  const muutetut = faktat.git?.skoopinMuutetut || faktat.git?.muutetut || [];
  if (muutetut.length > 0) {
    tehty.push(`Skoopin poluissa muuttuneita tiedostoja (${muutetut.length} kpl): ${muutetut.slice(0, 5).join(', ')}`);
  }
  if (faktat.kayttajanPyynnot && faktat.kayttajanPyynnot.length > 0) {
    tehty.push(`Käsitelty käyttäjän pyyntö: ${faktat.kayttajanPyynnot[0].replace(/\s+/g, ' ').slice(0, 100)}`);
  }
  if (tehty.length === 0) {
    tehty.push(`Istunnon transkriptia ei löytynyt eikä skoopin poluissa ole muutoksia — tehtyä ei tulkittu`);
  }

  // V-560, V-562: synteesi ei väitä testejä ajetuiksi eikä päätöksiä tehdyiksi ilman lähdettä.
  const todisteet = faktat.testitodisteet || [];
  const todettu = [
    `Git-tila: ${faktat.git?.haara || 'HEAD'}, muokattuja tiedostoja yhteensä ${faktat.git?.muutetut?.length || 0} kpl`,
    todisteet.length > 0
      ? `Testiajon tulos transkriptissa: ${todisteet.slice(-3).join(', ')}`
      : EI_TESTITODISTETTA,
  ];

  const paatokset = [EI_PAATOKSIA];

  let seuraavaPaketti = faktat.seuraavaHead;
  if (!seuraavaPaketti || !seuraavaPaketti.startsWith('SEURAAVA PAKETTI:') || !seuraavaPaketti.slice(17).trim()) {
    seuraavaPaketti = `SEURAAVA PAKETTI: JATKO — jatkokehitys ja integrointi — polut: ${skoopinPolut} — aloitus: /pura ${skooppi}`;
  }

  return {
    tehty,
    todettu,
    paatokset,
    avoimet: [],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti,
  };
}

export const AGY_MALLI = 'gemini-3.8-flash-low';
export const CLAUDE_MALLI = 'claude-haiku-5-5';

/**
 * Mallinimi → moottori: claude-* ja Clauden aliakset ajetaan claude CLI:llä, muut agy:llä.
 */
export function moottoriMallista(malli) {
  return /^claude-|^(haiku|sonnet|opus|fable)$/.test(String(malli)) ? 'claude' : 'agy';
}

const CLAUDE_JARJESTELMA = 'Olet pakkausmuistion analyytikko. Et kutsu työkaluja. Palautat vain annetun JSON-skeeman mukaisen vastauksen.';

/**
 * CLI:n json-tuloste → analyysi tai null. agy: structured_output tai response; claude: structured_output tai result.
 */
export function lueCliAnalyysi(stdout) {
  let cliOut;
  try {
    cliOut = JSON.parse(stdout);
  } catch {
    return null;
  }
  if (cliOut?.is_error) return null;
  if (cliOut?.structured_output && validoiAnalyysi(cliOut.structured_output)) return cliOut.structured_output;
  for (const k of ['response', 'result']) {
    if (typeof cliOut?.[k] !== 'string') continue;
    try {
      const inner = JSON.parse(cliOut[k]);
      if (validoiAnalyysi(inner)) return inner;
    } catch {}
  }
  return null;
}

function ajaCli(moottori, kehote, malli, timeout) {
  if (moottori === 'claude') {
    // Oma järjestelmäkehote ja tyhjät asetuslähteet: ei oletuskehotetta, hookeja eikä CLAUDE.md:tä (mitattu 28.10.2026:
    // 43 k → 1,2 k kontekstitokenia). cwd tmpdir, ettei projektin muisti lataudu; kehote stdinissä (argv-raja).
    return spawnSync('claude', [
      '-p',
      '--model', malli,
      '--output-format', 'json',
      '--system-prompt', CLAUDE_JARJESTELMA,
      '--json-schema', JSON.stringify(SKEEMA),
      '--tools', '',
      '--no-session-persistence',
      '--disable-slash-commands',
      '--setting-sources', '',
    ], { input: kehote, cwd: tmpdir(), encoding: 'utf8', timeout, maxBuffer: 16 * 1024 * 1024 });
  }
  return spawnSync('agy', [
    '-p', kehote,
    '--model', malli,
    '--effort', 'low',
    '--print-timeout', '25s',
    '--disable-slash-commands',
    '--json-schema', SKEEMA_POLKU,
    '--output-format', 'json',
    '--dangerously-skip-permissions',
  ], { encoding: 'utf8', timeout, maxBuffer: 16 * 1024 * 1024 });
}

/**
 * Ajaa harkinnan ja kertoo, mikä sen tuotti: { analyysi, lahde: 'malli' | 'vara' | 'mukautettu', moottori, malli, syy }.
 * Vara (deterministinen synteesi) merkitään aina syineen, ettei mallin epäonnistuminen jää hiljaiseksi (V-654).
 */
export async function ajaHarkintaLahteella(faktat, { aja = null, kaytaMallia = true, malli = AGY_MALLI, timeout = null } = {}) {
  const kehote = muodostaKehote(faktat);
  const moottori = moottoriMallista(malli);

  if (aja) {
    const raw = await aja(kehote);
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!validoiAnalyysi(parsed)) throw new Error('Mukautetun ajajan vastaus ei vastaa vaadittua skeemaa');
    return { analyysi: parsed, lahde: 'mukautettu', moottori, malli, syy: null };
  }

  let syy = 'malli pois (--ilman-mallia)';
  if (kaytaMallia) {
    try {
      const res = ajaCli(moottori, kehote, malli, timeout ?? (moottori === 'claude' ? 120000 : 25000));
      const analyysi = res.status === 0 && res.stdout ? lueCliAnalyysi(res.stdout) : null;
      if (analyysi) return { analyysi, lahde: 'malli', moottori, malli, syy: null };
      syy = res.error
        ? `${moottori}: ${res.error.code || res.error.message}`
        : res.status !== 0
          ? `${moottori} exit ${res.status}${res.signal ? ` (${res.signal})` : ''}`
          : `${moottori}: vastaus ei vastaa skeemaa`;
    } catch (e) {
      syy = `${moottori}: ${e.message}`;
    }
  }

  // Luotettava varajärjestelmä (fallback)
  return { analyysi: syntetisoiAnalyysi(faktat), lahde: 'vara', moottori, malli, syy };
}

/**
 * Ajaa harkinnan ja palauttaa pelkän analyysin (yhteensopiva vanhojen kutsujen kanssa).
 */
export async function ajaHarkinta(faktat, opt = {}) {
  return (await ajaHarkintaLahteella(faktat, opt)).analyysi;
}
