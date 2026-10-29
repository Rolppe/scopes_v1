// Automaatiotesti: SIIRTO_STATE_DIR -dynaamisuus ja pakkaa-alku.mjs:n jäsennys (Testi 8)
// Varmistaa:
// 1. SIIRTO_STATE_DIR -ympäristömuuttujaa noudatetaan dynaamisesti (haeTilaHakemisto, haeOletusMuistio)
// 2. jasennaPakkaaAlku poimii virheettömästi kentät: MUISTIO, SKOOPPITARKISTUS, SEURAAVA-HEAD ja AUTOPACK
// 3. pakkaa-hybridi.mjs käyttää jäsennettyä muistiopolkua kirjoitaJaTarkista-kutsussa kiinteän oletuksen sijaan

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  haeTilaHakemisto,
  haeOletusMuistio,
  jasennaPakkaaAlku,
  kirjoitaJaTarkista,
  OLETUS_MUISTIO,
} from '../muistio.mjs';

const NYKY_DIR = dirname(fileURLToPath(import.meta.url));
const PAKKAA_HYBRIDI_POLKU = resolve(NYKY_DIR, '../pakkaa-hybridi.mjs');

describe('Testi 8: SIIRTO_STATE_DIR -dynaamisuus ja pakkaa-alku.mjs:n jäsennys', () => {
  const alkuperainenStateDir = process.env.SIIRTO_STATE_DIR;

  beforeEach(() => {
    // Nollataan tila ennen jokaista testiä
    if (alkuperainenStateDir !== undefined) {
      process.env.SIIRTO_STATE_DIR = alkuperainenStateDir;
    } else {
      delete process.env.SIIRTO_STATE_DIR;
    }
  });

  afterEach(() => {
    // Palautetaan alkuperäinen ympäristömuuttuja
    if (alkuperainenStateDir !== undefined) {
      process.env.SIIRTO_STATE_DIR = alkuperainenStateDir;
    } else {
      delete process.env.SIIRTO_STATE_DIR;
    }
  });

  describe('1. haeTilaHakemisto ja haeOletusMuistio dynaaminen polunmuodostus', () => {
    it('noudattaa SIIRTO_STATE_DIR -ympäristömuuttujaa täsmällisesti kun se on asetettu', () => {
      const mukautettuPolku = '/var/tmp/siirto-testi-tila-123';
      process.env.SIIRTO_STATE_DIR = mukautettuPolku;

      assert.equal(
        haeTilaHakemisto(),
        mukautettuPolku,
        'haeTilaHakemisto ei palauttanut SIIRTO_STATE_DIR-arvoa'
      );
      assert.equal(
        haeOletusMuistio(),
        join(mukautettuPolku, 'pakkaus-muistio.md'),
        'haeOletusMuistio ei muodostanut polkua asetetun SIIRTO_STATE_DIR-hakemiston alle'
      );
    });

    it('palauttaa oletushakemiston kotihakemistosta kun SIIRTO_STATE_DIR ei ole asetettu', () => {
      delete process.env.SIIRTO_STATE_DIR;

      const odotettuOletusDir = join(homedir(), '.claude/skills/keskustelun-siirto/state');
      assert.equal(
        haeTilaHakemisto(),
        odotettuOletusDir,
        'haeTilaHakemisto ei palauttanut oletustilahakemistoa kun ympäristömuuttuja puuttuu'
      );
      assert.equal(
        haeOletusMuistio(),
        join(odotettuOletusDir, 'pakkaus-muistio.md'),
        'haeOletusMuistio ei palauttanut oletusmuistiopolkua kun ympäristömuuttuja puuttuu'
      );
    });

    it('reagoi dynaamisesti ajonaikaisiin SIIRTO_STATE_DIR-muutoksiin eikä jäädy', () => {
      // 1. Ensimmäinen tila
      process.env.SIIRTO_STATE_DIR = '/tmp/dynaaminen-tila-A';
      assert.equal(haeTilaHakemisto(), '/tmp/dynaaminen-tila-A');
      assert.equal(haeOletusMuistio(), '/tmp/dynaaminen-tila-A/pakkaus-muistio.md');

      // 2. Vaihdetaan toiseen tilaan lennosta
      process.env.SIIRTO_STATE_DIR = '/tmp/dynaaminen-tila-B';
      assert.equal(
        haeTilaHakemisto(),
        '/tmp/dynaaminen-tila-B',
        'haeTilaHakemisto ei päivittynyt lennosta toiseen polkuun'
      );
      assert.equal(
        haeOletusMuistio(),
        '/tmp/dynaaminen-tila-B/pakkaus-muistio.md',
        'haeOletusMuistio ei päivittynyt lennosta toiseen polkuun'
      );

      // 3. Poistetaan muuttuja lennosta
      delete process.env.SIIRTO_STATE_DIR;
      const odotettuOletusDir = join(homedir(), '.claude/skills/keskustelun-siirto/state');
      assert.equal(haeTilaHakemisto(), odotettuOletusDir);
      assert.equal(haeOletusMuistio(), join(odotettuOletusDir, 'pakkaus-muistio.md'));
    });

    it('käsittelee tyhjän merkkijonon palauttamalla oletuksen', () => {
      process.env.SIIRTO_STATE_DIR = '';
      const odotettuOletusDir = join(homedir(), '.claude/skills/keskustelun-siirto/state');
      assert.equal(haeTilaHakemisto(), odotettuOletusDir);
      assert.equal(haeOletusMuistio(), join(odotettuOletusDir, 'pakkaus-muistio.md'));
    });

    it('haeOletusMuistio sallii parametrina annetun tilahakemiston ohituksen', () => {
      process.env.SIIRTO_STATE_DIR = '/tmp/ei-tata-polkua';
      const eksplisiittinen = '/opt/erillinen-tila';
      assert.equal(
        haeOletusMuistio(eksplisiittinen),
        join(eksplisiittinen, 'pakkaus-muistio.md'),
        'haeOletusMuistio ei noudattanut parametrina annettua tilaDir-arvoa'
      );
    });
  });

  describe('2. jasennaPakkaaAlku -tulosteen jäsennys', () => {
    it('käsittelee tyhjän, null- ja undefined-tulosteen palauttamalla null-kentät', () => {
      const odotettuTyhja = {
        muistio: null,
        skooppitarkistus: null,
        seuraavaHead: null,
        autopack: null,
      };

      assert.deepEqual(jasennaPakkaaAlku(''), odotettuTyhja);
      assert.deepEqual(jasennaPakkaaAlku(null), odotettuTyhja);
      assert.deepEqual(jasennaPakkaaAlku(undefined), odotettuTyhja);
      assert.deepEqual(jasennaPakkaaAlku('   \n  \t  \n'), odotettuTyhja);
    });

    it('poimii MUISTIO-kentän uudesta pohjakirjoituksesta', () => {
      const tuloste = `
SYNKKA: ok
MUISTIO: ~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio.md — pohja kirjoitettu (3456 merkkiä; täytä TÄYTÄ-rivit, aja sitten --tarkista)
SKOOPPITARKISTUS: scopes agy siirto ← (ei muutettuja polkuja) → pakataan: scopes agy siirto
`;
      const tulos = jasennaPakkaaAlku(tuloste);
      assert.equal(
        tulos.muistio,
        '~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio.md'
      );
    });

    it('poimii MUISTIO-kentän "on jo" -muodosta', () => {
      const tuloste = `
MUISTIO: on jo — /custom/state/session-123/pakkaus-muistio.md
SKOOPPITARKISTUS: test-skooppi ← tiedosto.txt → pakataan: test-skooppi
`;
      const tulos = jasennaPakkaaAlku(tuloste);
      assert.equal(
        tulos.muistio,
        '/custom/state/session-123/pakkaus-muistio.md',
        '"on jo" -alkuista muistiopolkua ei poimittu oikein'
      );
    });

    it('poimii MUISTIO-kentän ilman väliviivatekstejä', () => {
      const tuloste = 'MUISTIO: /opt/muistiot/pakkaus-muistio.md\n';
      const tulos = jasennaPakkaaAlku(tuloste);
      assert.equal(tulos.muistio, '/opt/muistiot/pakkaus-muistio.md');
    });

    it('poimii SKOOPPITARKISTUS-kentän täsmällisesti', () => {
      const skooppiRivi = 'scopes agy siirto ← scopes/agy/siirto/muistio.mjs, scopes/agy/siirto/pakkaa-hybridi.mjs → pakataan: scopes agy siirto';
      const tuloste = `
SYNKKA: ok
SKOOPPITARKISTUS: ${skooppiRivi}
MUISTIO: /tmp/pakkaus-muistio.md
`;
      const tulos = jasennaPakkaaAlku(tuloste);
      assert.equal(tulos.skooppitarkistus, skooppiRivi);
    });

    it('poimii SEURAAVA-HEAD -kentän kun rivi alkaa "SEURAAVA PAKETTI:"', () => {
      const headTeksti = 'SEURAAVA PAKETTI: TEST — jatkokehitys ja hionta — polut: scopes/agy/** — aloitus: /pura scopes agy';
      const tuloste = `
SKOOPPITARKISTUS: ok
SEURAAVA-HEAD: ${headTeksti}
AUTOPACK: false
`;
      const tulos = jasennaPakkaaAlku(tuloste);
      assert.equal(tulos.seuraavaHead, headTeksti);
    });

    it('palauttaa seuraavaHead: null kun SEURAAVA-HEAD ei ole kelvollinen paketti', () => {
      const eiRekisteria = 'SEURAAVA-HEAD: ei — skoopilla ei rekisteriä';
      assert.equal(jasennaPakkaaAlku(eiRekisteria).seuraavaHead, null);

      const eiSaatavilla = 'SEURAAVA-HEAD: ei saatavilla — git show HEAD:rekisteri.md epäonnistui';
      assert.equal(jasennaPakkaaAlku(eiSaatavilla).seuraavaHead, null);

      const eiOmaa = 'SEURAAVA-HEAD: ei omaa leimattua riviä (SEURAAVA PAKETTI [skooppi])';
      assert.equal(jasennaPakkaaAlku(eiOmaa).seuraavaHead, null);

      const eiHeadissa = 'SEURAAVA-HEAD: rekisterin HEADissa ei SEURAAVA PAKETTI -riviä';
      assert.equal(jasennaPakkaaAlku(eiHeadissa).seuraavaHead, null);
    });

    it('poimii AUTOPACK-kentän totuusarvona (true / false)', () => {
      assert.equal(jasennaPakkaaAlku('AUTOPACK: true\n').autopack, true);
      assert.equal(jasennaPakkaaAlku('AUTOPACK: false\n').autopack, false);
      assert.equal(jasennaPakkaaAlku('AUTOPACK: true  ').autopack, true);
      assert.equal(jasennaPakkaaAlku('AUTOPACK: jotainMuuta\n').autopack, false);
      assert.equal(jasennaPakkaaAlku('SYNKKA: ok\n').autopack, null);
    });

    it('jäsentää kaikki 4 kenttää virheettömästi aidosta täydellisestä pakkaa-alku.mjs -tulosteesta', () => {
      const aitoTuloste = `
SYNKKA: ok
KATTO-MUISTIO: ok
SKOOPPITARKISTUS: scopes agy siirto ← scopes/agy/siirto/pakkausscripti/muistio.mjs → pakataan: scopes agy siirto
VIERAS: ei vieraita muutoksia
MUISTIO-VAROITUS: yhteinen polku — aja saman skoopin pakkaukset peräkkäin
SEURAAVA-HEAD: SEURAAVA PAKETTI: HARVINAINEN — testaus ja tarkastus — polut: scopes/** — aloitus: /pura testi
JAETTU-REKISTERI: ei
AUTOVALINTA: false
AUTOPACK: true
MUISTIO: ~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio.md — pohja kirjoitettu (3200 merkkiä; täytä TÄYTÄ-rivit, aja sitten --tarkista)
`;
      const tulos = jasennaPakkaaAlku(aitoTuloste);
      assert.equal(
        tulos.muistio,
        '~/.claude/skills/keskustelun-siirto/state/pakkaus-muistio.md'
      );
      assert.equal(
        tulos.skooppitarkistus,
        'scopes agy siirto ← scopes/agy/siirto/pakkausscripti/muistio.mjs → pakataan: scopes agy siirto'
      );
      assert.equal(
        tulos.seuraavaHead,
        'SEURAAVA PAKETTI: HARVINAINEN — testaus ja tarkastus — polut: scopes/** — aloitus: /pura testi'
      );
      assert.equal(tulos.autopack, true);
    });

    it('toimii myös Windows CRLF (\\r\\n) -rivinvaihdoilla', () => {
      const crlfTuloste = 'SKOOPPITARKISTUS: skooppi-crlf\r\nAUTOPACK: true\r\nMUISTIO: /polku/crlf.md\r\n';
      const tulos = jasennaPakkaaAlku(crlfTuloste);
      assert.equal(tulos.skooppitarkistus, 'skooppi-crlf');
      assert.equal(tulos.autopack, true);
      assert.equal(tulos.muistio, '/polku/crlf.md');
    });
  });

  describe('3. pakkaa-hybridi.mjs:n jäsennellyn muistiopolun käyttö', () => {
    it('pakkaa-hybridi.mjs kutsuu jasennaPakkaaAlku ja käyttää alkuTiedot.muistio -polkua', () => {
      assert.ok(existsSync(PAKKAA_HYBRIDI_POLKU), `pakkaa-hybridi.mjs puuttuu: ${PAKKAA_HYBRIDI_POLKU}`);
      const koodi = readFileSync(PAKKAA_HYBRIDI_POLKU, 'utf8');

      // Varmistetaan että jasennaPakkaaAlku on tuotu ja sitä kutsutaan
      assert.ok(
        koodi.includes('jasennaPakkaaAlku'),
        'pakkaa-hybridi.mjs ei käytä jasennaPakkaaAlku-funktiota'
      );
      assert.ok(
        /alkuTiedot\s*=\s*jasennaPakkaaAlku\(/m.test(koodi),
        'pakkaa-hybridi.mjs ei tallenna jasennaPakkaaAlku-tulosta alkuTiedot-muuttujaan'
      );

      // Varmistetaan dynaaminen muistiopolun valinta: alkuTiedot.muistio || haeOletusMuistio()
      assert.ok(
        /const\s+muistioPolku\s*=\s*alkuTiedot\.muistio\s*\|\|\s*haeOletusMuistio\(\)/m.test(koodi),
        'pakkaa-hybridi.mjs ei muodosta muistioPolku-muuttujaa dynaamisesti (alkuTiedot.muistio || haeOletusMuistio())'
      );

      // Varmistetaan että kirjoitaJaTarkista saa muistioPolku-argumentin
      assert.ok(
        /kirjoitaJaTarkista\([^)]*muistioPolku/m.test(koodi),
        'pakkaa-hybridi.mjs ei välitä muistioPolkua kirjoitaJaTarkista-kutsulle'
      );

      // Varmistetaan ettei kirjoitaJaTarkista-kutsussa käytetä staattista OLETUS_MUISTIO-vakiota
      assert.ok(
        !/kirjoitaJaTarkista\([^)]*OLETUS_MUISTIO/m.test(koodi),
        'pakkaa-hybridi.mjs käyttää virheellisesti kiinteää OLETUS_MUISTIO-vakiota kirjoitaJaTarkista-kutsussa'
      );
    });

    it('dynaaminen valintalogiikka priorisoi jäsennettyä muistiota ennen oletusta', () => {
      process.env.SIIRTO_STATE_DIR = '/tila/oletus';
      const oletusPolku = haeOletusMuistio();

      // Tapaus A: pakkaa-alku antoi muistiopolun (esim. pack-memo.mjs tai istuntokohtainen tila)
      const alkuTiedot1 = { muistio: '/tila/istunnot/sessio-xyz/pakkaus-muistio.md' };
      const valittuPolku1 = alkuTiedot1.muistio || haeOletusMuistio();
      assert.equal(
        valittuPolku1,
        '/tila/istunnot/sessio-xyz/pakkaus-muistio.md',
        'Jäsennetty muistio ei ohittanut oletusta'
      );

      // Tapaus B: pakkaa-alku ei antanut muistiota -> fallback haeOletusMuistio()
      const alkuTiedot2 = { muistio: null };
      const valittuPolku2 = alkuTiedot2.muistio || haeOletusMuistio();
      assert.equal(
        valittuPolku2,
        join('/tila/oletus', 'pakkaus-muistio.md'),
        'Fallback ei käyttänyt dynaamista haeOletusMuistio-tulosta'
      );
    });

    it('kirjoitaJaTarkista kirjoittaa muistion täsmällisesti annettuun mukautettuun polkuun', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'muistio-custom-polku-'));
      const mukautettuPolku = join(tempDir, 'erikois-tila', 'oma-muistio.md');

      const testFaktat = {
        skooppi: 'scopes agy siirto pakkausscripti',
        git: { muutetut: [] },
        istuntoId: 'testi-sessio',
        malli: 'Gemini 3.8 Flash',
        viimeinenPyynto: 'Testaa dynaaminen muistiopolku',
      };
      const testAnalyysi = {
        tehty: ['Testattu dynaaminen polku'],
        todettu: ['Kirjoitus onnistui haluttuun polkuun'],
        paatokset: ['Varmistettu polun dynaamisuus'],
        avoimet: [],
        viat: [],
        hukka: 'ei — ei havaittu hukkatietoja',
        kesken: 'ei — kaikki pyydetty käsitelty',
        seuraavaPaketti: 'SEURAAVA PAKETTI: TEST — polut: scopes/** — aloitus: /pura test',
      };

      try {
        // Kutsutaan kirjoitaJaTarkista mukautetulla polulla ja eristetyllä juurella (jossa ei ole tarkistin-skriptiä)
        const tulos = kirjoitaJaTarkista(testFaktat, testAnalyysi, mukautettuPolku, tempDir);

        assert.equal(tulos.ok, true, `kirjoitaJaTarkista epäonnistui: ${tulos.virhe}`);
        assert.equal(tulos.polku, mukautettuPolku, 'Tulosobjektin polku ei vastannut annettua polkua');
        assert.ok(existsSync(mukautettuPolku), `Muistiota ei luotu kohdepolkuun ${mukautettuPolku}`);

        const sisalto = readFileSync(mukautettuPolku, 'utf8');
        assert.ok(sisalto.includes('# Pakkausmuistio — scopes agy siirto pakkausscripti'));
        assert.ok(sisalto.includes('## Tehty tässä keskustelussa'));
        assert.ok(sisalto.includes('Testattu dynaaminen polku'));
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
