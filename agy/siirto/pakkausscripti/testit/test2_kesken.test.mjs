// Automaatiotesti: Keskeneräisen ja valmistuneen keskustelun muistio- ja kesken-tarkistukset
// Testaa muistio.mjs:n muotoileKesken- ja rakennaMuistio-funktiot sekä claude/siirto/tools/kesken.mjs --muistio -tarkistimen.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  muotoileKesken,
  rakennaMuistio,
  muotoileAikaleima,
} from '../muistio.mjs';

import {
  tarkista,
  luku,
  LUKU,
} from '../../../../../claude/siirto/tools/kesken.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KESKEN_CLI = resolve(__dirname, '../../../../../claude/siirto/tools/kesken.mjs');

/**
 * Apufunktio väliaikaisen tiedoston luomiseen testejä varten.
 */
function luoValiaikainenMuistio(sisalto) {
  const tempHakemisto = mkdtempSync(join(tmpdir(), 'kesken-testi-'));
  const tiedostoPolku = join(tempHakemisto, 'pakkaus-muistio.md');
  writeFileSync(tiedostoPolku, sisalto, 'utf8');
  return {
    polku: tiedostoPolku,
    siivoa: () => rmSync(tempHakemisto, { recursive: true, force: true }),
  };
}

/**
 * Apufunktio pohjamuistion rakentamiseen testejä varten.
 */
function luoTestiData(overrides = {}) {
  const faktat = {
    skooppi: 'scopes agy siirto pakkausscripti',
    viimeinenPyynto: 'Toteuta automaatiotesti test2_kesken.test.mjs',
    istuntoId: 'testi-istunto-abc-123',
    malli: 'Gemini 3.8 Flash',
    git: { muutetut: ['scopes/agy/siirto/pakkausscripti/muistio.mjs'] },
    ...overrides.faktat,
  };

  const analyysi = {
    tehty: ['Toteutettu muotoileKesken-funktio', 'Integroitujen testien valmistelu'],
    todettu: ['Kaikki yksikkötestit läpäisty hyväksytysti'],
    paatokset: ['Käytetään virallista kesken.mjs -syntaksia'],
    avoimet: [],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: JATKO — testit ja verifiointi — aloitus: /pura test',
    ...overrides.analyysi,
  };

  return { faktat, analyysi };
}

describe('1. muistio.mjs: muotoileKesken', () => {
  it('muotoilee keskeneräisen pyynnön ja faktat.viimeinenPyynto standardimuotoon', () => {
    const nyt = new Date(2026, 9, 17, 7, 15); // 17.10.2026 klo 07.15
    const faktat = { viimeinenPyynto: 'Toteuta automaatiotesti test2_kesken.test.mjs' };
    const keskenSyote = 'kyllä — moduulin toteutus kesken';

    const tulos = muotoileKesken(keskenSyote, faktat, nyt);

    assert.equal(
      tulos,
      'Viimeinen viesti (17.10.2026 klo 07.15): "Toteuta automaatiotesti test2_kesken.test.mjs"\n- Jäljellä: moduulin toteutus kesken'
    );
  });

  it('poistaa "kyllä — " ja "kyllä - " -etuliitteet jäljellä-kuvauksesta', () => {
    const nyt = new Date(2026, 9, 17, 12, 0);
    const faktat = { viimeinenPyynto: 'Korjaa käsittely' };

    const tulosEmDash = muotoileKesken('kyllä — rajapinnan testit ajamatta', faktat, nyt);
    assert.ok(tulosEmDash.endsWith('- Jäljellä: rajapinnan testit ajamatta'));

    const tulosEnDash = muotoileKesken('kyllä – rajapinnan testit ajamatta', faktat, nyt);
    assert.ok(tulosEnDash.endsWith('- Jäljellä: rajapinnan testit ajamatta'));

    const tulosHyphen = muotoileKesken('kyllä - rajapinnan testit ajamatta', faktat, nyt);
    assert.ok(tulosHyphen.endsWith('- Jäljellä: rajapinnan testit ajamatta'));
  });

  it('käyttää oletuskuvausta "Tehtävän viimeistely" jos kyllä-syötteestä puuttuu tarkenne', () => {
    const nyt = new Date(2026, 9, 17, 12, 0);
    const faktat = { viimeinenPyynto: 'Jatka toteutusta' };

    const tulos = muotoileKesken('kyllä', faktat, nyt);
    assert.ok(tulos.endsWith('- Jäljellä: Tehtävän viimeistely'));
  });

  it('leikkaa liian pitkän viimeinenPyynto-tekstin (max 300 merkkiä) ja siivoaa valkoiset merkit', () => {
    const pitka = 'Toista tätä sanaa '.repeat(30); // > 500 merkkiä
    const monirivinen = 'Rivi 1\n  Rivi 2   \t   Rivi 3\n\n' + pitka;
    const faktat = { viimeinenPyynto: monirivinen };
    const nyt = new Date(2026, 9, 17, 10, 0);

    const tulos = muotoileKesken('kyllä — pitkä pyyntö käsittelyssä', faktat, nyt);
    const m = /^Viimeinen viesti \([^)]+\): "([^"]+)"/.exec(tulos);

    assert.ok(m, 'Viimeinen viesti -rivi löytyy lainauksena');
    assert.ok(m[1].length <= 300, `Pyyntö oli yli 300 merkkiä: ${m[1].length}`);
    assert.equal(m[1].includes('\n'), false, 'Sisältää rivinvaihtoja, joiden piti muuttua välilyönneiksi');
    assert.equal(m[1].includes('   '), false, 'Sisältää moninkertaisia välilyöntejä');
  });

  it('käyttää oletusta "Määrittelemätön pyyntö" jos faktat.viimeinenPyynto puuttuu', () => {
    const nyt = new Date(2026, 9, 17, 14, 0);
    const tulos = muotoileKesken('kyllä — puuttuva pyyntö', {}, nyt);
    assert.equal(
      tulos,
      'Viimeinen viesti (17.10.2026 klo 14.00): "Määrittelemätön pyyntö"\n- Jäljellä: puuttuva pyyntö'
    );
  });

  it('valmis istunto: normalisoi ja säilyttää "ei — kaikki pyydetty käsitelty"', () => {
    assert.equal(muotoileKesken('ei — kaikki pyydetty käsitelty'), 'ei — kaikki pyydetty käsitelty');
    assert.equal(muotoileKesken('ei'), 'ei — kaikki pyydetty käsitelty');
    assert.equal(muotoileKesken(''), 'ei — kaikki pyydetty käsitelty');
    assert.equal(muotoileKesken(null), 'ei — kaikki pyydetty käsitelty');
    assert.equal(muotoileKesken(undefined), 'ei — kaikki pyydetty käsitelty');
  });

  it('valmis istunto: säilyttää kustomoidun "ei — <perustelu>" -muodon', () => {
    const kustomoitu = 'ei — käyttäjä vahvisti kaiken tehdyksi ja testatuksi';
    assert.equal(muotoileKesken(kustomoitu), kustomoitu);
  });

  it('palauttaa jo valmiiksi muotoillun "Viimeinen viesti" -tekstin muuttumattomana (idempotenssi)', () => {
    const valmisKesken = 'Viimeinen viesti (17.10.2026 klo 07.00): "Valmis pyyntö"\n- Jäljellä: vain dokumentointi';
    assert.equal(muotoileKesken(valmisKesken), valmisKesken);
  });
});

describe('2. muistio.mjs: rakennaMuistio', () => {
  it('rakentaa standardinmukaisen muistion, jossa keskeneräinen pyyntö luvussa ## Kesken keskustelussa', () => {
    const nyt = new Date(2026, 9, 17, 9, 45);
    const { faktat, analyysi } = luoTestiData({
      faktat: { viimeinenPyynto: 'Toteuta moduuli 4 loppuun' },
      analyysi: { kesken: 'kyllä — integraatiotestit puuttuvat' },
    });

    const muistio = rakennaMuistio(faktat, analyysi, nyt);

    assert.ok(muistio.includes('# Pakkausmuistio — scopes agy siirto pakkausscripti — 17.10.2026 klo 09.45'));
    assert.ok(muistio.includes('## Kesken keskustelussa'));
    assert.ok(muistio.includes('Viimeinen viesti (17.10.2026 klo 09.45): "Toteuta moduuli 4 loppuun"\n- Jäljellä: integraatiotestit puuttuvat'));
    assert.ok(muistio.includes('## Muutetut tiedostot'));
  });

  it('rakentaa muistion, jossa valmis istunto "ei — kaikki pyydetty käsitelty"', () => {
    const nyt = new Date(2026, 9, 17, 10, 30);
    const { faktat, analyysi } = luoTestiData({
      analyysi: { kesken: 'ei — kaikki pyydetty käsitelty' },
    });

    const muistio = rakennaMuistio(faktat, analyysi, nyt);

    assert.ok(muistio.includes('## Kesken keskustelussa\nei — kaikki pyydetty käsitelty\n## Muutetut tiedostot'));
  });
});

describe('3. claude/siirto/tools/kesken.mjs moduulitarkistus (tarkista ja luku)', () => {
  it('tarkista palauttaa { tila: "kyllä" } kun muistio sisältää keskeneräisen pyynnön', () => {
    const { faktat, analyysi } = luoTestiData({
      faktat: { viimeinenPyynto: 'Korjaa havaittu bugi' },
      analyysi: { kesken: 'kyllä — korjaus kesken' },
    });
    const muistio = rakennaMuistio(faktat, analyysi);
    const tulos = tarkista(muistio);

    assert.deepEqual(tulos, { tila: 'kyllä' });
  });

  it('tarkista palauttaa { tila: "ei" } kun istunto on merkitty valmiiksi', () => {
    const { faktat, analyysi } = luoTestiData({
      analyysi: { kesken: 'ei — kaikki pyydetty käsitelty' },
    });
    const muistio = rakennaMuistio(faktat, analyysi);
    const tulos = tarkista(muistio);

    assert.deepEqual(tulos, { tila: 'ei' });
  });

  it('hyväksyy erilaiset lainausmerkit keskeneräisessä viestissä ("...", “...”, »...) ja sitaatin (> ...)', () => {
    const tekstiNormaaliLainaus = `# Pakkausmuistio\n\n## Kesken keskustelussa\nViimeinen viesti (17.10.2026 klo 10.00): "Tee tämä"\n- Jäljellä: testi\n\n## Seuraava`;
    assert.deepEqual(tarkista(tekstiNormaaliLainaus), { tila: 'kyllä' });

    const tekstiKaarevaLainaus = `# Pakkausmuistio\n\n## Kesken keskustelussa\nViimeinen viesti (17.10.2026 klo 10.00): “Tee tämä”\n- Jäljellä: testi\n\n## Seuraava`;
    assert.deepEqual(tarkista(tekstiKaarevaLainaus), { tila: 'kyllä' });

    const tekstiKulmaLainaus = `# Pakkausmuistio\n\n## Kesken keskustelussa\nViimeinen viesti (17.10.2026 klo 10.00): »Tee tämä«\n- Jäljellä: testi\n\n## Seuraava`;
    assert.deepEqual(tarkista(tekstiKulmaLainaus), { tila: 'kyllä' });

    const tekstiMarkdownSitaatti = `# Pakkausmuistio\n\n## Kesken keskustelussa\nViimeinen viesti (17.10.2026 klo 10.00):\n> Tee tämä monirivinen tehtävä\n- Jäljellä: testi\n\n## Seuraava`;
    assert.deepEqual(tarkista(tekstiMarkdownSitaatti), { tila: 'kyllä' });
  });

  it('hylkää pelkän "ei" ilman em-dashia ja perustelua', () => {
    const virheellinenMuistio = `# Pakkausmuistio\n\n## Kesken keskustelussa\nei\n\n## Muutetut tiedostot`;
    const tulos = tarkista(virheellinenMuistio);

    assert.ok(tulos.virhe);
    assert.equal(tulos.virhe, "'ei' ilman syytä — muoto on 'ei — <miksi>'");
  });

  it('hylkää jos ## Kesken keskustelussa -luku puuttuu kokonaan', () => {
    const puuttuvaLuku = `# Pakkausmuistio\n\n## Tehty tässä keskustelussa\n- tehty\n\n## Muutetut tiedostot`;
    const tulos = tarkista(puuttuvaLuku);

    assert.ok(tulos.virhe);
    assert.equal(tulos.virhe, `luku '${LUKU}' puuttuu`);
  });

  it('hylkää jos ## Kesken keskustelussa -luku on tyhjä', () => {
    const tyhjaLuku = `# Pakkausmuistio\n\n## Kesken keskustelussa\n\n## Muutetut tiedostot`;
    const tulos = tarkista(tyhjaLuku);

    assert.ok(tulos.virhe);
    assert.equal(tulos.virhe, `luku '${LUKU}' on tyhjä`);
  });

  it('hylkää jos keskeneräisestä puuttuu lainaus käyttäjän viestistä', () => {
    const ilmanLainausta = `# Pakkausmuistio\n\n## Kesken keskustelussa\nViimeinen viesti (17.10.2026 klo 10.00): Tee tämä ilman lainausmerkkejä\n- Jäljellä: testi\n\n## Seuraava`;
    const tulos = tarkista(ilmanLainausta);

    assert.ok(tulos.virhe);
    assert.equal(tulos.virhe, "käyttäjän viesti ei ole lainattu (\"…\" rivillä tai '> '-rivit perässä)");
  });

  it('hylkää jos keskeneräisestä puuttuu "- Jäljellä:" -kohta', () => {
    const ilmanJaljella = `# Pakkausmuistio\n\n## Kesken keskustelussa\nViimeinen viesti (17.10.2026 klo 10.00): "Tee tämä"\n\n## Seuraava`;
    const tulos = tarkista(ilmanJaljella);

    assert.ok(tulos.virhe);
    assert.equal(tulos.virhe, "kohta '- Jäljellä: <mitä vastaus tai korjaus vielä vaatii>' puuttuu");
  });
});

describe('4. claude/siirto/tools/kesken.mjs --muistio (CLI-prosessitarkistukset)', () => {
  it('tunnistaa keskeneräisen pyynnön ja palauttaa exit 0 (KESKEN: kyllä)', () => {
    const { faktat, analyysi } = luoTestiData({
      faktat: { viimeinenPyynto: 'Toteuta kattava automaatiotesti' },
      analyysi: { kesken: 'kyllä — test2_kesken.test.mjs laadinta kesken' },
    });
    const muistioSisalto = rakennaMuistio(faktat, analyysi);
    const { polku, siivoa } = luoValiaikainenMuistio(muistioSisalto);

    try {
      const res = spawnSync(process.execPath, [KESKEN_CLI, '--muistio', polku], {
        encoding: 'utf8',
      });

      assert.equal(res.status, 0, `Exit-koodin piti olla 0, oli: ${res.status} (stderr: ${res.stderr})`);
      assert.ok(res.stdout.includes('KESKEN: kyllä'), `Odotettiin "KESKEN: kyllä", saatiin: ${res.stdout}`);
    } finally {
      siivoa();
    }
  });

  it('hyväksyy valmiin istunnon ("ei — kaikki pyydetty käsitelty") koodilla exit 0 (KESKEN: ei)', () => {
    const { faktat, analyysi } = luoTestiData({
      analyysi: { kesken: 'ei — kaikki pyydetty käsitelty' },
    });
    const muistioSisalto = rakennaMuistio(faktat, analyysi);
    const { polku, siivoa } = luoValiaikainenMuistio(muistioSisalto);

    try {
      const res = spawnSync(process.execPath, [KESKEN_CLI, '--muistio', polku], {
        encoding: 'utf8',
      });

      assert.equal(res.status, 0, `Exit-koodin piti olla 0, oli: ${res.status} (stderr: ${res.stderr})`);
      assert.ok(res.stdout.includes('KESKEN: ei'), `Odotettiin "KESKEN: ei", saatiin: ${res.stdout}`);
    } finally {
      siivoa();
    }
  });

  it('hylkää virheellisen muotoilun (pelkkä "ei" ilman em-dashia ja perustelua) koodilla exit 1', () => {
    const virheellinenSisalto = `# Pakkausmuistio — testit\n\n## Kesken keskustelussa\nei\n\n## Muutetut tiedostot\n- (ei muutoksia)\n`;
    const { polku, siivoa } = luoValiaikainenMuistio(virheellinenSisalto);

    try {
      const res = spawnSync(process.execPath, [KESKEN_CLI, '--muistio', polku], {
        encoding: 'utf8',
      });

      assert.equal(res.status, 1, `Exit-koodin piti olla 1 virheelliselle muotoilulle, oli: ${res.status}`);
      assert.ok(res.stdout.includes('KESKEN: VIRHE'), `Odotettiin "KESKEN: VIRHE", saatiin: ${res.stdout}`);
      assert.ok(res.stdout.includes("'ei' ilman syytä — muoto on 'ei — <miksi>'"));
    } finally {
      siivoa();
    }
  });

  it('hylkää koodilla exit 1 kun ## Kesken keskustelussa -luku puuttuu tiedostosta', () => {
    const puuttuvaSisalto = `# Pakkausmuistio — testit\n\n## Tehty tässä keskustelussa\n- tehty asioita\n\n## Muutetut tiedostot\n- (ei muutoksia)\n`;
    const { polku, siivoa } = luoValiaikainenMuistio(puuttuvaSisalto);

    try {
      const res = spawnSync(process.execPath, [KESKEN_CLI, '--muistio', polku], {
        encoding: 'utf8',
      });

      assert.equal(res.status, 1, `Exit-koodin piti olla 1 kun luku puuttuu, oli: ${res.status}`);
      assert.ok(res.stdout.includes('KESKEN: VIRHE — luku \'## Kesken keskustelussa\' puuttuu'));
    } finally {
      siivoa();
    }
  });

  it('palauttaa exit 2 käyttövirheille kun muistiotiedostoa ei ole tai argumentti puuttuu', () => {
    const olematonRes = spawnSync(process.execPath, [KESKEN_CLI, '--muistio', '/polku/jota/ei/ole/olemassa_12345.md'], {
      encoding: 'utf8',
    });
    assert.equal(olematonRes.status, 2, 'Olemattoman tiedoston tulisi palauttaa exit 2');
    assert.ok(olematonRes.stderr.includes('Käyttö: kesken.mjs --muistio'));

    const puuttuvaArgRes = spawnSync(process.execPath, [KESKEN_CLI, '--muistio'], {
      encoding: 'utf8',
    });
    assert.equal(puuttuvaArgRes.status, 2, 'Puuttuvan argumentin tulisi palauttaa exit 2');
  });
});
