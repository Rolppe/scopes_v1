// Automaatiotesti: Hukkakirjaukset ja hukkarekisterin validointi (test1_hukka)
// Testaa muistio.mjs:n toiminnot: normalisoiHukka, rakennaMuistio ja kirjoitaJaTarkista
// sekä varmistaa claude/siirto/tools/hukka.mjs --muistio -tarkistuksen hyväksynnän (exit 0)
// sekä aidolle 8-sarakkeiselle hukkakirjaukselle että kieltävälle hukkakirjaukselle.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  normalisoiHukka,
  rakennaMuistio,
  kirjoitaJaTarkista,
  muotoileAikaleima,
} from '../muistio.mjs';

const TAMA_HAKEMISTO = dirname(fileURLToPath(import.meta.url));
const JUURI = resolve(TAMA_HAKEMISTO, '../../../../..');
const HUKKA_SKRIPTI = join(JUURI, 'claude/siirto/tools/hukka.mjs');

const AITO_HUKKARIVI = '| SIIRTO-HUKKA-1 | 16.10.2026 | scopes agy siirto | vaihe 2 | tiedosto poistettu | git diff | työ tehtiin uusiksi | avoin |';
const AITO_HUKKARIVI_2 = '| SIIRTO-HUKKA-2 | 16.10.2026 | scopes agy siirto | vaihe 3 | vanha konfiguraatio korvattu | git log | palautettiin varmuuskopiosta | korjattu |';

/**
 * Luo kattavat ja validit oletusfaktat ja -analyysin testejä varten.
 */
function luoTestiData(overrides = {}) {
  const faktat = {
    skooppi: 'scopes agy siirto pakkausscripti',
    git: {
      muutetut: ['scopes/agy/siirto/pakkausscripti/muistio.mjs'],
      skoopinMuutetut: ['scopes/agy/siirto/pakkausscripti/muistio.mjs'],
      haara: 'main',
    },
    istuntoId: 'testi-istunto-hukka',
    malli: 'Gemini 3.8 Flash',
    viimeinenPyynto: 'Laadi automaatiotesti hukkakirjauksille',
    seuraavaHead: 'SEURAAVA PAKETTI: PAKKAUSSCRIPTI-KAYTTOONOTTO — kytke pakkaa-hybridi pakkaustaitoon ja testaa — polut: scopes/agy/siirto/pakkausscripti/** — aloitus: /pura scopes agy siirto pakkausscripti',
    ...(overrides.faktat || {}),
  };

  const analyysi = {
    tehty: [
      'Toteutettu automaatiotestit hukkakirjauksille',
      'Testattu aito 8-sarakkeinen hukkakirjaus ja kieltävät kirjaukset',
    ],
    todettu: [
      'normalisoiHukka säilyttää taulukkorivit koskemattomina',
      'claude/siirto/tools/hukka.mjs hyväksyy molemmat skenaariot (exit 0)',
    ],
    paatokset: [
      'Hukkakirjauksia ei rikota eikä niihin lisätä virheellistä etuliitettä',
    ],
    avoimet: [],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: PAKKAUSSCRIPTI-KAYTTOONOTTO — kytke pakkaa-hybridi pakkaustaitoon ja testaa — polut: scopes/agy/siirto/pakkausscripti/** — aloitus: /pura scopes agy siirto pakkausscripti',
    ...(overrides.analyysi || {}),
  };

  return { faktat, analyysi };
}

describe('test1: normalisoiHukka', () => {
  it('säilyttää aidon 8-sarakkeisen taulukkorivin koskemattomana ilman "ei —" -etuliitettä', () => {
    const tulos = normalisoiHukka(AITO_HUKKARIVI);
    assert.equal(tulos, AITO_HUKKARIVI, 'Taulukkorivin tulee säilyä täsmälleen sellaisenaan');
    assert.equal(tulos.startsWith('ei —'), false, 'Taulukkoriviin ei saa tulla "ei —" -etuliitettä');
    assert.equal(tulos.includes('SIIRTO-HUKKA-1'), true);
  });

  it('säilyttää useita 8-sarakkeisia taulukkorivejä koskemattomina ilman "ei —" -etuliitettä', () => {
    const monirivinen = `${AITO_HUKKARIVI}\n${AITO_HUKKARIVI_2}`;
    const tulos = normalisoiHukka(monirivinen);
    assert.equal(tulos, monirivinen, 'Monirivisen taulukon tulee säilyä koskemattomana');
    assert.equal(tulos.startsWith('ei —'), false);
    assert.ok(tulos.includes('SIIRTO-HUKKA-1'));
    assert.ok(tulos.includes('SIIRTO-HUKKA-2'));
  });

  it('säilyttää otsikoidun taulukkorakenteen sellaisenaan', () => {
    const taulukkoOtsikoilla = [
      '| Tunnus | Pvm | Skooppi | Vaihe | Mitä katosi | Todiste | Seuraus | Tila |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      AITO_HUKKARIVI,
    ].join('\n');
    const tulos = normalisoiHukka(taulukkoOtsikoilla);
    assert.equal(tulos, taulukkoOtsikoilla);
    assert.equal(tulos.startsWith('ei —'), false);
  });

  it('normalisoi kieltävän kirjauksen "ei" muotoon "ei — ei havaittu hukkatietoja"', () => {
    assert.equal(normalisoiHukka('ei'), 'ei — ei havaittu hukkatietoja');
    assert.equal(normalisoiHukka('  ei  '), 'ei — ei havaittu hukkatietoja');
    assert.equal(normalisoiHukka('EI'), 'ei — ei havaittu hukkatietoja');
  });

  it('normalisoi kieltävän kirjauksen "ei — ei havaittu hukkatietoja" säilyttäen sen sellaisenaan', () => {
    assert.equal(normalisoiHukka('ei — ei havaittu hukkatietoja'), 'ei — ei havaittu hukkatietoja');
  });

  it('normalisoi kieltävän kirjauksen "ei - mitään" muotoon "ei — mitään"', () => {
    assert.equal(normalisoiHukka('ei - mitään'), 'ei — mitään');
    assert.equal(normalisoiHukka('ei — mitään'), 'ei — mitään');
    assert.equal(normalisoiHukka('ei – mitään'), 'ei — mitään');
    assert.equal(normalisoiHukka('ei mitään'), 'ei — mitään');
  });

  it('normalisoi vapaamuotoiset kieltävät kirjaukset muotoon "ei — <perustelu>"', () => {
    assert.equal(
      normalisoiHukka('ei - ei havaittu hukkatietoja keskustelussa'),
      'ei — ei havaittu hukkatietoja keskustelussa'
    );
    assert.equal(
      normalisoiHukka('ei — tiedonmenetyksiä ei tapahtunut'),
      'ei — tiedonmenetyksiä ei tapahtunut'
    );
  });

  it('palauttaa oletuskieltävän kirjauksen tyhjille tai puuttuville syötteille', () => {
    assert.equal(normalisoiHukka(''), 'ei — ei havaittu hukkatietoja');
    assert.equal(normalisoiHukka('   '), 'ei — ei havaittu hukkatietoja');
    assert.equal(normalisoiHukka(null), 'ei — ei havaittu hukkatietoja');
    assert.equal(normalisoiHukka(undefined), 'ei — ei havaittu hukkatietoja');
  });
});

describe('test1: rakennaMuistio', () => {
  it('rakentaa muistion aidolla 8-sarakkeisella hukkakirjauksella', () => {
    const { faktat, analyysi } = luoTestiData({
      analyysi: { hukka: AITO_HUKKARIVI },
    });
    const muistio = rakennaMuistio(faktat, analyysi);

    assert.ok(muistio.includes('## Hukka'), 'Muistiosta puuttuu ## Hukka -luku');
    assert.ok(muistio.includes(`## Hukka\n${AITO_HUKKARIVI}`), 'Aito taulukkorivi ei ole ## Hukka -otsikon alla sellaisenaan');
    assert.ok(!muistio.includes(`## Hukka\nei — ${AITO_HUKKARIVI}`), 'Taulukkorivin eteen ei saa tulla "ei —"');
    assert.ok(muistio.includes('## Tehty tässä keskustelussa'));
    assert.ok(muistio.includes('## Todettu / mitattu'));
    assert.ok(muistio.includes('## Päätökset'));
    assert.ok(muistio.includes('## Avoimet asiat ja seuraavat askeleet'));
    assert.ok(muistio.includes('## Viat'));
    assert.ok(muistio.includes('## Kesken keskustelussa'));
    assert.ok(muistio.includes('## Muutetut tiedostot'));
    assert.ok(muistio.includes('## Seuraava paketti'));
    assert.ok(muistio.includes('## Sessio'));
  });

  it('rakentaa muistion usealla aidolla hukkakirjauksella', () => {
    const monirivinen = `${AITO_HUKKARIVI}\n${AITO_HUKKARIVI_2}`;
    const { faktat, analyysi } = luoTestiData({
      analyysi: { hukka: monirivinen },
    });
    const muistio = rakennaMuistio(faktat, analyysi);

    assert.ok(muistio.includes(`## Hukka\n${monirivinen}`));
    assert.ok(muistio.includes('SIIRTO-HUKKA-1'));
    assert.ok(muistio.includes('SIIRTO-HUKKA-2'));
  });

  it('rakentaa muistion kieltävällä kirjauksella "ei"', () => {
    const { faktat, analyysi } = luoTestiData({
      analyysi: { hukka: 'ei' },
    });
    const muistio = rakennaMuistio(faktat, analyysi);
    assert.ok(muistio.includes('## Hukka\nei — ei havaittu hukkatietoja'));
  });

  it('rakentaa muistion kieltävällä kirjauksella "ei - mitään"', () => {
    const { faktat, analyysi } = luoTestiData({
      analyysi: { hukka: 'ei - mitään' },
    });
    const muistio = rakennaMuistio(faktat, analyysi);
    assert.ok(muistio.includes('## Hukka\nei — mitään'));
  });

  it('rakentaa muistion kieltävällä kirjauksella "ei — ei havaittu hukkatietoja"', () => {
    const { faktat, analyysi } = luoTestiData({
      analyysi: { hukka: 'ei — ei havaittu hukkatietoja' },
    });
    const muistio = rakennaMuistio(faktat, analyysi);
    assert.ok(muistio.includes('## Hukka\nei — ei havaittu hukkatietoja'));
  });
});

describe('test1: claude/siirto/tools/hukka.mjs --muistio hyväksyntä', () => {
  it('hyväksyy muistion, jossa on aito 8-sarakkeinen hukkakirjaus (exit 0)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: AITO_HUKKARIVI },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 0, `hukka.mjs hylkäsi aidon hukkakirjauksen: ${res.stdout} ${res.stderr}`);
      assert.ok(res.stdout.includes('HUKKA: 1 uutta — SIIRTO-HUKKA-1'), `Odotettu tuloste puuttuu: ${res.stdout}`);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hyväksyy muistion, jossa on useita aitoja hukkakirjauksia (exit 0)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const monirivinen = `${AITO_HUKKARIVI}\n${AITO_HUKKARIVI_2}`;
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: monirivinen },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 0, `hukka.mjs hylkäsi monirivisen hukkakirjauksen: ${res.stdout} ${res.stderr}`);
      assert.ok(res.stdout.includes('HUKKA: 2 uutta — SIIRTO-HUKKA-1, SIIRTO-HUKKA-2'), `Odotettu tuloste puuttuu: ${res.stdout}`);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hyväksyy muistion kieltävällä kirjauksella "ei — ei havaittu hukkatietoja" (exit 0)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: 'ei' },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 0, `hukka.mjs hylkäsi kieltävän kirjauksen: ${res.stdout} ${res.stderr}`);
      assert.ok(res.stdout.includes('HUKKA: ei uusia'), `Odotettu tuloste puuttuu: ${res.stdout}`);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hyväksyy muistion kieltävällä kirjauksella "ei — mitään" (exit 0)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: 'ei - mitään' },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 0, `hukka.mjs hylkäsi kieltävän kirjauksen "ei - mitään": ${res.stdout} ${res.stderr}`);
      assert.ok(res.stdout.includes('HUKKA: ei uusia'), `Odotettu tuloste puuttuu: ${res.stdout}`);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hylkää muistion, jos hukkariivillä on väärä määrä sarakkeita (exit 1)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      // Vain 7 saraketta
      const virheellinenRivi = '| SIIRTO-HUKKA-1 | 16.10.2026 | scopes agy siirto | vaihe 2 | tiedosto poistettu | git diff | avoin |';
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: virheellinenRivi },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 1);
      assert.ok(res.stdout.includes('HUKKA-RIVI VÄÄRÄN MUOTOINEN'));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hylkää muistion, jos Tunnus-sarakkeessa on päivämäärä (exit 1)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const pvmTunnuksena = '| 16.10.2026 | 16.10.2026 | scopes agy siirto | vaihe 2 | tiedosto poistettu | git diff | työ uusiksi | avoin |';
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: pvmTunnuksena },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 1);
      assert.ok(res.stdout.includes('Tunnus on päivämäärä'));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hylkää muistion, jos Pvm-sarake ei ole muotoa p.k.vvvv (exit 1)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      // ISO-muotoinen päivämäärä pvm-sarakkeessa
      const isoPvm = '| SIIRTO-HUKKA-1 | 2026-10-16 | scopes agy siirto | vaihe 2 | tiedosto poistettu | git diff | työ uusiksi | avoin |';
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: isoPvm },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 1);
      assert.ok(res.stdout.includes('Pvm-sarake ei ole päivä'));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('hylkää muistion, jos siinä on sekä taulukkorivi että "ei —" (ristiriitainen) (exit 1)', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hukka-tarkistus-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const ristiriitainen = `ei — ei havaittu hukkatietoja\n${AITO_HUKKARIVI}`;
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: ristiriitainen },
      });
      const sisalto = rakennaMuistio(faktat, analyysi);
      writeFileSync(tempMuistio, sisalto, 'utf8');

      const res = spawnSync('node', [HUKKA_SKRIPTI, '--muistio', tempMuistio], {
        cwd: JUURI,
        encoding: 'utf8',
      });

      assert.equal(res.status, 1);
      assert.ok(res.stdout.includes('HUKKA-LUKU RISTIRIITAINEN'));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('test1: kirjoitaJaTarkista', () => {
  it('kirjoittaa muistion ja läpäisee porttitarkistuksen aidolla 8-sarakkeisella hukkakirjauksella', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'kirjoita-hukka-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: AITO_HUKKARIVI },
      });

      const tulos = kirjoitaJaTarkista(faktat, analyysi, tempMuistio, JUURI);

      assert.equal(tulos.ok, true, `Porttitarkistus epäonnistui: ${tulos.virhe} (koodi: ${tulos.koodi})`);
      assert.equal(tulos.koodi, 0);
      assert.ok(tulos.tuloste.includes('HUKKA-LUKU: ok'), `HUKKA-LUKU: ok puuttuu tulosteesta: ${tulos.tuloste}`);
      assert.ok(tulos.tuloste.includes('PORTTI: ok'));
      assert.ok(tulos.tuloste.includes('TAYTA: ok'));

      const levylta = readFileSync(tempMuistio, 'utf8');
      assert.ok(levylta.includes(`## Hukka\n${AITO_HUKKARIVI}`), 'Taulukkorivi ei tallentunut koskemattomana levylle');
      assert.ok(!levylta.includes(`## Hukka\nei — ${AITO_HUKKARIVI}`), 'Taulukkoriville tallentui virheellinen "ei —"');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('kirjoittaa muistion ja läpäisee porttitarkistuksen kieltävällä kirjauksella ("ei")', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'kirjoita-hukka-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: 'ei' },
      });

      const tulos = kirjoitaJaTarkista(faktat, analyysi, tempMuistio, JUURI);

      assert.equal(tulos.ok, true, `Porttitarkistus epäonnistui: ${tulos.virhe} (koodi: ${tulos.koodi})`);
      assert.equal(tulos.koodi, 0);
      assert.ok(tulos.tuloste.includes('HUKKA-LUKU: ok'), `HUKKA-LUKU: ok puuttuu tulosteesta: ${tulos.tuloste}`);

      const levylta = readFileSync(tempMuistio, 'utf8');
      assert.ok(levylta.includes('## Hukka\nei — ei havaittu hukkatietoja'), 'Kieltävä kirjaus ei tallentunut oikein levylle');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('kirjoittaa muistion ja läpäisee porttitarkistuksen kieltävällä kirjauksella ("ei - mitään")', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'kirjoita-hukka-'));
    const tempMuistio = join(tempDir, 'pakkaus-muistio.md');
    try {
      const { faktat, analyysi } = luoTestiData({
        analyysi: { hukka: 'ei - mitään' },
      });

      const tulos = kirjoitaJaTarkista(faktat, analyysi, tempMuistio, JUURI);

      assert.equal(tulos.ok, true, `Porttitarkistus epäonnistui: ${tulos.virhe} (koodi: ${tulos.koodi})`);
      assert.equal(tulos.koodi, 0);
      assert.ok(tulos.tuloste.includes('HUKKA-LUKU: ok'));

      const levylta = readFileSync(tempMuistio, 'utf8');
      assert.ok(levylta.includes('## Hukka\nei — mitään'), 'Normalisoitu "ei — mitään" ei tallentunut oikein levylle');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
