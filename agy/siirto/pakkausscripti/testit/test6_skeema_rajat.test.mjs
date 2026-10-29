// Automaatiotesti: Skeeman ja analyysin validointi rajatapauksissa
// Testaa schema.json-määritykset ja harkinta.mjs:n validoiAnalyysi-funktion kattavasti.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validoiAnalyysi,
  SKEEMA,
  SKEEMA_POLKU,
} from '../harkinta.mjs';

/**
 * Apufunktio: luo täysin validin baseline-analyysi-olion,
 * jota yksittäiset testit voivat varioida.
 */
function luoKelvollinenAnalyysi(overrides = {}) {
  return {
    tehty: [
      'Toteutettu uusi ominaisuus ja rajapinnat',
      'Lisätty kattavat automaatiotestit',
    ],
    todettu: [
      'Kaikki 14 yksikkötestiä läpäisty hyväksytysti',
      'Suorituskyky: vasteaika < 150 ms',
    ],
    paatokset: [
      'Käytetään Gemini 3.8 Flash -mallia strukturoidulla JSON-skeemalla',
      'Pidetään validointi tiukkana ilman ulkoisia riippuvuuksia',
    ],
    avoimet: [
      {
        asia: 'Testikattavuuden laajennus rajatapauksiin',
        tila: 'avoin',
        askel: 'Laadi test6_skeema_rajat.test.mjs',
      },
    ],
    viat: [
      {
        vika: 'Puuttuva validointi reunatapauksessa',
        tila: 'korjattu',
      },
    ],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: JATKO — jatkokehitys ja integrointi — polut: scopes/** — aloitus: /pura test',
    ...overrides,
  };
}

/**
 * Apufunktio: Validoi annettu data suoraan schema.json -määrittelyä vasten.
 */
function validoiSkeemaan(data, skeema = SKEEMA) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, virhe: 'Juuren on oltava ei-tyhjä objekti' };
  }
  for (const pakollinen of skeema.required || []) {
    if (!(pakollinen in data)) {
      return { ok: false, virhe: `Puuttuva pakollinen kenttä: ${pakollinen}` };
    }
  }
  for (const [kentta, saanto] of Object.entries(skeema.properties || {})) {
    if (!(kentta in data)) continue;
    const arvo = data[kentta];
    if (saanto.type === 'array') {
      if (!Array.isArray(arvo)) return { ok: false, virhe: `${kentta} ei ole taulukko` };
      if (saanto.items?.type === 'string') {
        for (const alkio of arvo) {
          if (typeof alkio !== 'string') return { ok: false, virhe: `${kentta} sisältää ei-string-alkion` };
        }
      }
      if (saanto.items?.type === 'object') {
        for (const alkio of arvo) {
          if (!alkio || typeof alkio !== 'object' || Array.isArray(alkio)) {
            return { ok: false, virhe: `${kentta} sisältää virheellisen objektin` };
          }
          for (const req of saanto.items.required || []) {
            if (!(req in alkio) || typeof alkio[req] !== 'string') {
              return { ok: false, virhe: `${kentta}-alkiolta puuttuu merkkijonokenttä ${req}` };
            }
          }
        }
      }
    } else if (saanto.type === 'string') {
      if (typeof arvo !== 'string') {
        return { ok: false, virhe: `${kentta} ei ole merkkijono` };
      }
    }
  }
  return { ok: true };
}

describe('1. schema.json rakenteen ja määritysten tarkistus', () => {
  it('schema.json on olemassa ja luettavissa', () => {
    assert.ok(existsSync(SKEEMA_POLKU), `Skeematiedosto puuttuu polusta ${SKEEMA_POLKU}`);
    const raw = readFileSync(SKEEMA_POLKU, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Skeematiedosto ei ole kelvollista JSONia');
  });

  it('skeema sisältää vaaditun draft-07 $schema -kentän ja otsikon', () => {
    assert.equal(SKEEMA.$schema, 'http://json-schema.org/draft-07/schema#');
    assert.equal(SKEEMA.title, 'PakkausHarkinta');
    assert.equal(SKEEMA.type, 'object');
  });

  it('skeemassa on täsmälleen vaaditut 8 pakollista kenttää', () => {
    const odotetut = ['tehty', 'todettu', 'paatokset', 'avoimet', 'viat', 'hukka', 'kesken', 'seuraavaPaketti'];
    assert.equal(SKEEMA.required.length, odotetut.length);
    for (const kentta of odotetut) {
      assert.ok(SKEEMA.required.includes(kentta), `Kenttä ${kentta} puuttuu required-listasta`);
      assert.ok(kentta in SKEEMA.properties, `Kenttä ${kentta} puuttuu properties-määrityksistä`);
    }
  });

  it('skeeman kenttien tyyppimääritykset vastaavat vaatimuksia', () => {
    assert.equal(SKEEMA.properties.tehty.type, 'array');
    assert.equal(SKEEMA.properties.tehty.items.type, 'string');

    assert.equal(SKEEMA.properties.todettu.type, 'array');
    assert.equal(SKEEMA.properties.todettu.items.type, 'string');

    assert.equal(SKEEMA.properties.paatokset.type, 'array');
    assert.equal(SKEEMA.properties.paatokset.items.type, 'string');

    assert.equal(SKEEMA.properties.avoimet.type, 'array');
    assert.equal(SKEEMA.properties.avoimet.items.type, 'object');
    assert.deepEqual(SKEEMA.properties.avoimet.items.required, ['asia', 'tila', 'askel']);
    assert.equal(SKEEMA.properties.avoimet.items.properties.asia.type, 'string');
    assert.equal(SKEEMA.properties.avoimet.items.properties.tila.type, 'string');
    assert.equal(SKEEMA.properties.avoimet.items.properties.askel.type, 'string');

    assert.equal(SKEEMA.properties.viat.type, 'array');
    assert.equal(SKEEMA.properties.viat.items.type, 'object');
    assert.deepEqual(SKEEMA.properties.viat.items.required, ['vika', 'tila']);
    assert.equal(SKEEMA.properties.viat.items.properties.vika.type, 'string');
    assert.equal(SKEEMA.properties.viat.items.properties.tila.type, 'string');

    assert.equal(SKEEMA.properties.hukka.type, 'string');
    assert.equal(SKEEMA.properties.kesken.type, 'string');
    assert.equal(SKEEMA.properties.seuraavaPaketti.type, 'string');
  });

  it('skeematarkistin hyväksyy kelvollisen pohja-analyysin', () => {
    const kelvollinen = luoKelvollinenAnalyysi();
    const tulos = validoiSkeemaan(kelvollinen);
    assert.equal(tulos.ok, true, tulos.virhe);
  });
});

describe('2. seuraavaPaketti rajatapaukset', () => {
  it('hyväksyy oikein muotoillun SEURAAVA PAKETTI: -merkkijonon', () => {
    const data = luoKelvollinenAnalyysi({
      seuraavaPaketti: 'SEURAAVA PAKETTI: UUSI-TUNNUS — kuvaus tässä — polut: scopes/x/** — aloitus: /pura x',
    });
    assert.equal(validoiAnalyysi(data), true);
  });

  it('hyväksyy SEURAAVA PAKETTI: ei mitään -muodon', () => {
    const data = luoKelvollinenAnalyysi({
      seuraavaPaketti: 'SEURAAVA PAKETTI: ei mitään — kaikki tehtävät valmiina',
    });
    assert.equal(validoiAnalyysi(data), true);
  });

  it('hylkää jos puuttuu "SEURAAVA PAKETTI:" -alku', () => {
    const virheelliset = [
      'JATKO — jatkokehitys ja integrointi — polut: scopes/**',
      'SEURAAVA: JATKO — väärä etuliite',
      'seuraava paketti: pienillä kirjaimilla',
      'Seuraava Paketti: CamelCase-kirjoitusasu',
      'NEXT PACKET: JATKO — englanninkielinen etuliite',
      'Paketti: JATKO',
      'SEURAAVA PAKETTI ilman kaksoispistettä',
      'SEURAAVA PAKETTI ',
      ' SEURAAVA PAKETTI: välilyönti alussa',
      '\nSEURAAVA PAKETTI: rivinvaihto alussa',
      '\tSEURAAVA PAKETTI: tabulaattori alussa',
    ];

    for (const vp of virheelliset) {
      const data = luoKelvollinenAnalyysi({ seuraavaPaketti: vp });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä seuraavaPaketti: "${vp}"`);
    }
  });

  it('hylkää tyhjät tai pelkkiä tyhjeitä sisältävät seuraavaPaketti-arvot', () => {
    const tyhjat = ['', '   ', '\t', '\n\n', '  \r\n  '];
    for (const t of tyhjat) {
      const data = luoKelvollinenAnalyysi({ seuraavaPaketti: t });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä tyhjä seuraavaPaketti: "${t}"`);
    }
  });

  it('hylkää ei-merkkijonomuotoiset seuraavaPaketti-arvot', () => {
    const eiMerkkijonot = [
      null,
      undefined,
      12345,
      true,
      false,
      ['SEURAAVA PAKETTI: JATKO'],
      { tunnus: 'SEURAAVA PAKETTI: JATKO' },
      Symbol('SEURAAVA PAKETTI:'),
    ];

    for (const em of eiMerkkijonot) {
      const data = luoKelvollinenAnalyysi({ seuraavaPaketti: em });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä ei-string: ${String(em)}`);
      const skeemaTulos = validoiSkeemaan(data);
      assert.equal(skeemaTulos.ok, false, `Skeeman pitäisi hylätä ei-string: ${String(em)}`);
    }
  });
});

describe('3. hukka ja kesken väärässä formaatissa', () => {
  it('hylkää tyhjät ja pelkkää välilyöntiä sisältävät hukka-arvot', () => {
    const tyhjat = ['', '   ', '\t', '\n', '   \r\n   '];
    for (const t of tyhjat) {
      const data = luoKelvollinenAnalyysi({ hukka: t });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä tyhjä hukka: "${t}"`);
    }
  });

  it('hylkää tyhjät ja pelkkää välilyöntiä sisältävät kesken-arvot', () => {
    const tyhjat = ['', '   ', '\t', '\n', '   \r\n   '];
    for (const t of tyhjat) {
      const data = luoKelvollinenAnalyysi({ kesken: t });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä tyhjä kesken: "${t}"`);
    }
  });

  it('hylkää ei-merkkijonomuotoiset hukka-arvot', () => {
    const eiMerkkijonot = [null, undefined, 0, 1, true, false, [], {}, ['ei']];
    for (const em of eiMerkkijonot) {
      const data = luoKelvollinenAnalyysi({ hukka: em });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä ei-string hukka: ${String(em)}`);
      assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä ei-string hukka: ${String(em)}`);
    }
  });

  it('hylkää ei-merkkijonomuotoiset kesken-arvot', () => {
    const eiMerkkijonot = [null, undefined, 0, 1, true, false, [], {}, ['ei']];
    for (const em of eiMerkkijonot) {
      const data = luoKelvollinenAnalyysi({ kesken: em });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä ei-string kesken: ${String(em)}`);
      assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä ei-string kesken: ${String(em)}`);
    }
  });

  it('hyväksyy ei-standardit mutta kelvolliset sisällölliset kuvaukset hukka- ja kesken-kentille', () => {
    const data = luoKelvollinenAnalyysi({
      hukka: 'kyllä — haettiin vanhoja tietoja väärästä hakemistosta noin 5 min',
      kesken: 'kyllä — käyttäjä pyysi jättämään asennusvaiheen seuraavaan sessioon',
    });
    assert.equal(validoiAnalyysi(data), true);
    assert.equal(validoiSkeemaan(data).ok, true);
  });
});

describe('4. Puuttuvat pakolliset kentät root-tasolla', () => {
  const pakolliset = ['tehty', 'todettu', 'paatokset', 'avoimet', 'viat', 'hukka', 'kesken', 'seuraavaPaketti'];

  for (const kentta of pakolliset) {
    it(`hylkää analyysin kun puuttuu kenttä: ${kentta}`, () => {
      const data = luoKelvollinenAnalyysi();
      delete data[kentta];
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä kun puuttuu ${kentta}`);
      const skeemaTulos = validoiSkeemaan(data);
      assert.equal(skeemaTulos.ok, false, `Skeeman pitäisi hylätä puuttuva ${kentta}`);
    });
  }

  it('hylkää täysin tyhjän objektin', () => {
    assert.equal(validoiAnalyysi({}), false);
    assert.equal(validoiSkeemaan({}).ok, false);
  });
});

describe('5. Väärät tietorakenteet taulukoissa (tehty, todettu, paatokset)', () => {
  const taulukkoKentat = ['tehty', 'todettu', 'paatokset'];

  for (const kentta of taulukkoKentat) {
    it(`hylkää kun ${kentta} ei ole taulukko (string, number, object, null, bool)`, () => {
      const vaarat = [
        'merkkijono ei taulukko',
        123,
        { 0: 'ei taulukko' },
        null,
        undefined,
        true,
        false,
      ];
      for (const v of vaarat) {
        const data = luoKelvollinenAnalyysi({ [kentta]: v });
        assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä kun ${kentta} on ${typeof v}`);
        assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä kun ${kentta} on ${typeof v}`);
      }
    });
  }

  it('hyväksyy tyhjät taulukot kentissä tehty, todettu ja paatokset', () => {
    const data = luoKelvollinenAnalyysi({
      tehty: [],
      todettu: [],
      paatokset: [],
    });
    assert.equal(validoiAnalyysi(data), true);
    assert.equal(validoiSkeemaan(data).ok, true);
  });
});

describe('6. avoimet- ja viat-listojen tietorakenteet ja pakolliset kentät', () => {
  it('hylkää jos avoimet ei ole taulukko', () => {
    const vaarat = ['teksti', 123, null, undefined, {}, true];
    for (const v of vaarat) {
      const data = luoKelvollinenAnalyysi({ avoimet: v });
      assert.equal(validoiAnalyysi(data), false);
      assert.equal(validoiSkeemaan(data).ok, false);
    }
  });

  it('hylkää jos viat ei ole taulukko', () => {
    const vaarat = ['teksti', 123, null, undefined, {}, true];
    for (const v of vaarat) {
      const data = luoKelvollinenAnalyysi({ viat: v });
      assert.equal(validoiAnalyysi(data), false);
      assert.equal(validoiSkeemaan(data).ok, false);
    }
  });

  it('hylkää avoimet-listan kun alkio on null, undefined tai primitiivi', () => {
    const virheellisetAlkiot = [null, undefined, 'pelkkä teksti', 123, true, []];
    for (const alkio of virheellisetAlkiot) {
      const data = luoKelvollinenAnalyysi({ avoimet: [alkio] });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä avoimet-alkio: ${String(alkio)}`);
      assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä avoimet-alkio: ${String(alkio)}`);
    }
  });

  it('hylkää avoimet-listan alkion jos puuttuu asia, tila tai askel', () => {
    const puutteelliset = [
      { tila: 'avoin', askel: 'tee testi' }, // puuttuu asia
      { asia: 'asia 1', askel: 'tee testi' }, // puuttuu tila
      { asia: 'asia 1', tila: 'avoin' }, // puuttuu askel
      {}, // tyhjä
    ];

    for (const p of puutteelliset) {
      const data = luoKelvollinenAnalyysi({ avoimet: [p] });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä puutteellinen avoin: ${JSON.stringify(p)}`);
      assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä: ${JSON.stringify(p)}`);
    }
  });

  it('hylkää avoimet-listan alkion jos kenttä on tyhjä merkkijono tai null', () => {
    const virheellisetArvot = [
      { asia: '', tila: 'avoin', askel: 'askel' },
      { asia: 'asia', tila: '', askel: 'askel' },
      { asia: 'asia', tila: 'avoin', askel: '' },
      { asia: null, tila: 'avoin', askel: 'askel' },
      { asia: 'asia', tila: null, askel: 'askel' },
      { asia: 'asia', tila: 'avoin', askel: null },
    ];

    for (const v of virheellisetArvot) {
      const data = luoKelvollinenAnalyysi({ avoimet: [v] });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä: ${JSON.stringify(v)}`);
    }
  });

  it('hylkää viat-listan kun alkio on null, undefined tai primitiivi', () => {
    const virheellisetAlkiot = [null, undefined, 'pelkkä vika', 999, false, []];
    for (const alkio of virheellisetAlkiot) {
      const data = luoKelvollinenAnalyysi({ viat: [alkio] });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä viat-alkio: ${String(alkio)}`);
      assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä viat-alkio: ${String(alkio)}`);
    }
  });

  it('hylkää viat-listan alkion jos puuttuu vika tai tila', () => {
    const puutteelliset = [
      { tila: 'avoin' }, // puuttuu vika
      { vika: 'muistivuoto' }, // puuttuu tila
      {}, // tyhjä
    ];

    for (const p of puutteelliset) {
      const data = luoKelvollinenAnalyysi({ viat: [p] });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä puutteellinen vika: ${JSON.stringify(p)}`);
      assert.equal(validoiSkeemaan(data).ok, false, `Skeeman pitäisi hylätä: ${JSON.stringify(p)}`);
    }
  });

  it('hylkää viat-listan alkion jos kenttä on tyhjä merkkijono tai null', () => {
    const virheellisetArvot = [
      { vika: '', tila: 'avoin' },
      { vika: 'kaatuminen', tila: '' },
      { vika: null, tila: 'avoin' },
      { vika: 'kaatuminen', tila: null },
    ];

    for (const v of virheellisetArvot) {
      const data = luoKelvollinenAnalyysi({ viat: [v] });
      assert.equal(validoiAnalyysi(data), false, `Pitäisi hylätä vika: ${JSON.stringify(v)}`);
    }
  });

  it('hyväksyy tyhjät avoimet- ja viat-listat', () => {
    const data = luoKelvollinenAnalyysi({
      avoimet: [],
      viat: [],
    });
    assert.equal(validoiAnalyysi(data), true);
    assert.equal(validoiSkeemaan(data).ok, true);
  });

  it('hyväksyy useita kelvollisia alkioita molemmissa listoissa', () => {
    const data = luoKelvollinenAnalyysi({
      avoimet: [
        { asia: 'Ensimmäinen tehtävä', tila: 'avoin', askel: 'aloita' },
        { asia: 'Toinen tehtävä', tila: 'odottaa', askel: 'odota vastausta' },
        { asia: 'Kolmas tehtävä', tila: 'valmis', askel: 'arkistoi' },
      ],
      viat: [
        { vika: 'Vika 1: portti hylkäsi', tila: 'korjattu' },
        { vika: 'Vika 2: aikakatkaisu', tila: 'tutkitaan' },
      ],
    });
    assert.equal(validoiAnalyysi(data), true);
    assert.equal(validoiSkeemaan(data).ok, true);
  });
});

describe('7. Erikoismerkit, ääkköset, tyhjät ja null-arvot', () => {
  it('hylkää null- ja undefined-syötteet juuritasolla', () => {
    assert.equal(validoiAnalyysi(null), false);
    assert.equal(validoiAnalyysi(undefined), false);
    assert.equal(validoiSkeemaan(null).ok, false);
    assert.equal(validoiSkeemaan(undefined).ok, false);
  });

  it('hylkää primitiivityypit juurisyötteenä', () => {
    const primitiivit = ['', 'pelkkä stringi', 123, 0, -1, true, false, NaN];
    for (const p of primitiivit) {
      assert.equal(validoiAnalyysi(p), false, `Pitäisi hylätä juuri: ${String(p)}`);
      assert.equal(validoiSkeemaan(p).ok, false, `Skeeman pitäisi hylätä juuri: ${String(p)}`);
    }
  });

  it('hylkää taulukon juurisyötteenä', () => {
    assert.equal(validoiAnalyysi([]), false);
    assert.equal(validoiAnalyysi([1, 2, 3]), false);
    assert.equal(validoiSkeemaan([]).ok, false);
  });

  it('hyväksyy ääkköset, erikoismerkit, lainausmerkit ja symbolit kenttien sisällössä', () => {
    const data = luoKelvollinenAnalyysi({
      tehty: [
        'Muokattu tiedostoa: `scopes/agy/siirto/pakkausscripti/harkinta.mjs` & "schema.json"',
        'Todettu ääkköset: å, ä, ö, Å, Ä, Ö sekä saksalaiset ü, ß',
        'Käytetty erikoismerkkejä: <XML-tagit>, {a: 1}, [x], \\n, $, %, &, /, =, ?, !',
      ],
      todettu: [
        'Mittaus: kesto 12.5 ms, RAM-muutos: +0.2 MB (läpäisyaste: 100 %)',
        'Lainaus: "Kaikki portit: OK — ei virheitä"',
      ],
      paatokset: [
        'Linjaus #1: Sallitaan UTF-8 -merkit kaikissa tekstikentissä ilman rajoitusta',
      ],
      avoimet: [
        {
          asia: 'Testaa <vaikeat> merkit: & " \' ` / \\ @ # ~ ^',
          tila: 'työn alla...',
          askel: 'Aja `node --test` ja varmista JSON.stringify',
        },
      ],
      viat: [
        {
          vika: 'Virheilmoitus: "SyntaxError: Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON"',
          tila: 'korjattu (suodatettu)',
        },
      ],
      hukka: 'ei — ei havaittu hukkatietoja (0 % hukkaa, tarkistettu 100 %)',
      kesken: 'ei — kaikki pyydetty käsitelty (100% valmis)',
      seuraavaPaketti: 'SEURAAVA PAKETTI: TEST-ERIKOIS_1.0 — testaa erikoismerkit & ä/ö/— — polut: scopes/test/** — aloitus: /pura test',
    });

    assert.equal(validoiAnalyysi(data), true);
    assert.equal(validoiSkeemaan(data).ok, true);
  });

  it('säilyttää eheyden JSON serialisoinnin ja deserialisoinnin läpi', () => {
    const alkuperainen = luoKelvollinenAnalyysi({
      tehty: ['Ääkköstesti: "heittomerkit" & <tagit>'],
      hukka: 'ei — ei havaittu hukkatietoja',
    });

    const jsonTeksti = JSON.stringify(alkuperainen, null, 2);
    const palautettu = JSON.parse(jsonTeksti);

    assert.equal(validoiAnalyysi(palautettu), true);
    assert.equal(validoiSkeemaan(palautettu).ok, true);
    assert.deepEqual(palautettu, alkuperainen);
  });
});
