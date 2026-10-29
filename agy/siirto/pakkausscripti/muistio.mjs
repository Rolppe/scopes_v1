// Muistion rakentaja ja porttitarkistus (Moduuli 3)
// Yhdistää louhijan faktat ja Flash 3.8 -analyysin viralliseksi pakkaus-muistio.md -tiedostoksi.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export function haeTilaHakemisto() {
  return process.env.SIIRTO_STATE_DIR || join(homedir(), '.claude/skills/keskustelun-siirto/state');
}

export function haeOletusMuistio(tilaDir = haeTilaHakemisto()) {
  return join(tilaDir, 'pakkaus-muistio.md');
}

export const OLETUS_MUISTIO = haeOletusMuistio();

/**
 * Jäsentää pakkaa-alku.mjs:n stdout-tulosteesta metatiedot.
 */
export function jasennaPakkaaAlku(tuloste) {
  if (!tuloste) return { muistio: null, skooppitarkistus: null, seuraavaHead: null, autopack: null };
  let muistio = null;
  const mMuistio = /^MUISTIO:\s*(?:on jo\s*—\s*)?(\S+)/m.exec(tuloste);
  if (mMuistio) muistio = mMuistio[1];

  let skooppitarkistus = null;
  const mSkooppi = /^SKOOPPITARKISTUS:\s*(.+)$/m.exec(tuloste);
  if (mSkooppi) skooppitarkistus = mSkooppi[1].trim();

  let seuraavaHead = null;
  const mHead = /^SEURAAVA-HEAD:\s*(.+)$/m.exec(tuloste);
  if (mHead && mHead[1].startsWith('SEURAAVA PAKETTI:')) seuraavaHead = mHead[1].trim();

  let autovalinta = null;
  const mAuto = /^AUTOVALINTA:\s*(\w+)/m.exec(tuloste);
  if (mAuto) autovalinta = mAuto[1] === 'true';

  let autopack = null;
  const mAutopack = /^AUTOPACK:\s*(\w+)/m.exec(tuloste);
  if (mAutopack) autopack = mAutopack[1] === 'true';

  return { muistio, skooppitarkistus, seuraavaHead, autopack, autovalinta };
}

export function tunnistaAutomaattijatko(alkuTiedot, sessioId) {
  if (typeof alkuTiedot?.autovalinta === 'boolean') return alkuTiedot.autovalinta;
  const tilaDir = haeTilaHakemisto();
  if (sessioId) {
    const istuntoAuto = join(tilaDir, 'istunnot', sessioId, 'automaattivalinta.txt');
    if (existsSync(istuntoAuto)) {
      try {
        return readFileSync(istuntoAuto, 'utf8').trim() === 'true';
      } catch {}
    }
  }
  const yhteinenAuto = join(tilaDir, 'automaattivalinta.txt');
  if (existsSync(yhteinenAuto)) {
    try {
      return readFileSync(yhteinenAuto, 'utf8').trim() === 'true';
    } catch {}
  }
  return false;
}

/**
 * Normalisoi hukkakuvauksen porttitarkistuksen vaatimaan muotoon.
 */
export function normalisoiHukka(syote) {
  if (!syote || typeof syote !== 'string') return 'ei — ei havaittu hukkatietoja';
  const t = syote.trim();
  if (!t) return 'ei — ei havaittu hukkatietoja';
  if (t.includes('|')) return t;
  if (/^ei\b/i.test(t)) {
    const ilmanEi = t.replace(/^ei\s*[—–-]?\s*/i, '').trim();
    return `ei — ${ilmanEi || 'ei havaittu hukkatietoja'}`;
  }
  return t;
}

/**
 * Muotoilee keskeneräisen työn kuvauksen kesken.mjs -tarkistimen vaatimaan muotoon.
 */
export function muotoileKesken(keskenSyote, faktat = {}, nyt = new Date()) {
  const t = (keskenSyote || '').trim();
  if (!t || /^ei\b/i.test(t)) {
    const ilmanEi = t.replace(/^ei\s*[—–-]?\s*/i, '').trim();
    return `ei — ${ilmanEi || 'kaikki pyydetty käsitelty'}`;
  }
  if (t.startsWith('Viimeinen viesti')) return t;

  const { teksti: aikaTeksti } = muotoileAikaleima(nyt);
  const pyynto = faktat?.viimeinenPyynto
    ? faktat.viimeinenPyynto.slice(0, 300).replace(/\s+/g, ' ').trim()
    : 'Määrittelemätön pyyntö';
  const jaljella = t.replace(/^kyllä\s*[—–-]?\s*/i, '').trim() || 'Tehtävän viimeistely';

  return `Viimeinen viesti (${aikaTeksti}): "${pyynto}"\n- Jäljellä: ${jaljella}`;
}

/**
 * Muotoilee päivämäärän ja ajan suomalaisessa muodossa.
 */
export function muotoileAikaleima(nyt = new Date()) {
  const pvm = `${nyt.getDate()}.${nyt.getMonth() + 1}.${nyt.getFullYear()}`;
  const klo = `${String(nyt.getHours()).padStart(2, '0')}.${String(nyt.getMinutes()).padStart(2, '0')}`;
  return { pvm, klo, teksti: `${pvm} klo ${klo}` };
}

/**
 * Muodostaa standardinmukaisen markdown-muotoisen muistion.
 */
export function rakennaMuistio(faktat, analyysi, nyt = new Date()) {
  const { pvm, klo } = muotoileAikaleima(nyt);
  const skooppi = faktat.skooppi || 'tuntematon';

  const tehty = (analyysi.tehty || []).map((t) => `- ${t}`).join('\n') || '- Työstetty skooppia suunnitelman mukaisesti';
  const todettu = (analyysi.todettu || []).map((t) => `- ${t}`).join('\n') || '- Kaikki vaiheet todennettu lähteestä';
  const paatokset = (analyysi.paatokset || []).map((p) => `- ${p}`).join('\n') || '- Ei uusia poikkeavia linjauksia';

  let avoimet = 'ei';
  if (Array.isArray(analyysi.avoimet) && analyysi.avoimet.length > 0) {
    avoimet = analyysi.avoimet.map((a) => `- ${a.asia} | ${a.tila} | ${a.askel}`).join('\n');
  }

  let viat = 'ei';
  if (Array.isArray(analyysi.viat) && analyysi.viat.length > 0) {
    viat = analyysi.viat.map((v) => `- ${v.vika} | ${v.tila}`).join('\n');
  }

  const muutetutLista = (faktat.git?.skoopinMuutetut && faktat.git.skoopinMuutetut.length > 0)
    ? faktat.git.skoopinMuutetut
    : (faktat.git?.skoopinMuutetut ? [] : (faktat.git?.muutetut || []));
  const muutetut = muutetutLista.length > 0
    ? muutetutLista.map((m) => `- ${m}`).join('\n')
    : '- (ei muutoksia)';

  const skooppitarkistusPolut = muutetutLista.length > 0
    ? (muutetutLista.length > 5 ? `${muutetutLista.slice(0, 5).join(', ')}, … +${muutetutLista.length - 5}` : muutetutLista.join(', '))
    : '(ei muutettuja polkuja)';
  const skooppitarkistus = `${skooppi} ← ${skooppitarkistusPolut} → pakataan: ${skooppi}`;

  const sessioId = faktat.istuntoId || 'ei-tiedossa';
  const malli = faktat.malli || 'Gemini 3.8 Flash';
  const viimeinenVuoro = faktat.viimeinenPyynto ? faktat.viimeinenPyynto.slice(0, 40).replace(/\s+/g, ' ') : '?';

  const hukka = normalisoiHukka(analyysi.hukka);
  const kesken = muotoileKesken(analyysi.kesken, faktat, nyt);

  let seuraava = analyysi.seuraavaPaketti;
  if (!seuraava || !seuraava.startsWith('SEURAAVA PAKETTI:')) {
    seuraava = faktat.seuraavaHead;
  }
  const onAutomaattijatko = faktat.autovalinta ?? tunnistaAutomaattijatko(faktat.alkuTiedot, sessioId);
  if (onAutomaattijatko && seuraava && seuraava.startsWith('SEURAAVA PAKETTI:') && !/(?:ei mitään|ei avoimia)/.test(seuraava) && !/—\s*automaattinen:/i.test(seuraava)) {
    seuraava = `${seuraava.trim()} — automaattinen: kyllä`;
  }

  const muistio = `# Pakkausmuistio — ${skooppi} — ${pvm} klo ${klo}
Skooppitarkistus: ${skooppitarkistus}
## Tehty tässä keskustelussa
${tehty}
## Todettu / mitattu
${todettu}
## Päätökset
${paatokset}
## Avoimet asiat ja seuraavat askeleet
${avoimet}
## Viat
${viat}
## Hukka
${hukka}
## Kesken keskustelussa
${kesken}
## Muutetut tiedostot
${muutetut}
## Seuraava paketti
${seuraava}
## Sessio
id=${sessioId} malli=${malli} koko=${muutetutLista.length} viimeinen_vuoro=${viimeinenVuoro}
`;

  return muistio;
}

/**
 * Kirjoittaa muistion levylle ja ajaa porttitarkistuksen.
 */
export function kirjoitaJaTarkista(faktat, analyysi, polku = haeOletusMuistio(), juuri = process.cwd()) {
  const sisalto = rakennaMuistio(faktat, analyysi);
  const kohdeHakemisto = dirname(polku);
  if (!existsSync(kohdeHakemisto)) {
    mkdirSync(kohdeHakemisto, { recursive: true });
  }
  writeFileSync(polku, sisalto, 'utf8');

  try {
    const tarkistinPolku = join(juuri, 'claude/siirto/tools/pakkaa-alku.mjs');
    if (!existsSync(tarkistinPolku)) {
      return { ok: true, koodi: 0, tuloste: 'Tarkistin-skriptiä ei löytynyt (ohitettu)', polku };
    }

    const res = spawnSync('node', [
      tarkistinPolku,
      '--tarkista',
      faktat.skooppi,
      polku,
    ], { cwd: juuri, encoding: 'utf8' });

    if (res.status === 0) {
      return { ok: true, koodi: 0, tuloste: res.stdout || '', polku };
    }
    return {
      ok: false,
      koodi: res.status || 1,
      virhe: res.stderr || res.stdout || 'Porttitarkistus epäonnistui',
      tuloste: res.stdout || '',
      polku,
    };
  } catch (e) {
    return {
      ok: false,
      koodi: 1,
      virhe: e.message,
      polku,
    };
  }
}
