// Automaatiotesti: Suuri transkripti ja O(1)-vakiomuistiluenta (Testi 5)
// Varmistaa, että louhija.mjs:n lueLoppu ja louhiTranscriptViestit toimivat:
// 1. O(1)-vakiomuistilla ja ajassa (< 50 ms) myös suurella tiedostolla (5–10 Mt, kymmeniä tuhansia rivejä).
// 2. Poimivat tasan viimeiset 60 viestiä ilman Heap-ylivuotoa.
// 3. Käsittelevät siististi erikoistapaukset: tyhjä tiedosto, 1 rivin tiedosto ja olemattomat polut.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  closeSync,
  existsSync,
  mkdtempSync,
  openSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

import {
  lueLoppu,
  louhiTranscriptViestit,
} from '../louhija.mjs';

/**
 * Apufunktio: luo väliaikaishakemiston testitiedostoille.
 */
function luoTestiHakemisto() {
  return mkdtempSync(join(tmpdir(), 'transkripti-test-'));
}

/**
 * Apufunktio: luo suuren transcript.jsonl -tiedoston (oletuksena n. 6–8 Mt, 35 000 riviä).
 * Tiedostossa:
 * - Alkupään rivit (0 .. N-61) sisältävät ALKUPAA_INDEKSI-tunnisteen.
 * - Loppupään 60 riviä sisältävät LOPPUPAA_INDEKSI-tunnisteen ja vuorotellen käyttäjä-, agentti- ja työkalukutsuja.
 */
function luoSuuriTranscriptTiedosto(polku, riviMaara = 35000) {
  const fd = openSync(polku, 'w');
  try {
    const batchKoko = 1000;
    const alkupaaRiveja = Math.max(0, riviMaara - 60);

    let kirjoitettu = 0;
    while (kirjoitettu < alkupaaRiveja) {
      const maara = Math.min(batchKoko, alkupaaRiveja - kirjoitettu);
      const rivit = [];
      for (let i = 0; i < maara; i++) {
        const idx = kirjoitettu + i;
        const rooli = idx % 2 === 0 ? 'USER_INPUT' : 'PLANNER_RESPONSE';
        const teksti = rooli === 'USER_INPUT'
          ? `Käyttäjän testiviesti ALKUPAA_INDEKSI_${String(idx).padStart(5, '0')} - pitkähkö selostus O(1)-suorituskyvyn varmistamiseksi 1234567890 1234567890 1234567890`
          : `Agentin testivastaus ALKUPAA_INDEKSI_${String(idx).padStart(5, '0')} - koodianalyysi ja suunnitelma 1234567890 1234567890 1234567890`;

        rivit.push(JSON.stringify({
          step_index: idx,
          source: rooli === 'USER_INPUT' ? 'USER_EXPLICIT' : 'MODEL',
          type: rooli,
          content: teksti,
          created_at: '2026-10-17T06:00:00Z',
        }) + '\n');
      }
      writeSync(fd, Buffer.from(rivit.join('')));
      kirjoitettu += maara;
    }

    // Kirjoitetaan viimeiset 60 viestiä selkeillä LOPPUPAA-tunnisteilla (1 .. 60)
    const loppuRivit = [];
    for (let i = 1; i <= 60; i++) {
      const idx = alkupaaRiveja + i;
      const tunnus = `LOPPUPAA_INDEKSI_${String(i).padStart(5, '0')}`;
      if (i % 3 === 1) {
        loppuRivit.push(JSON.stringify({
          step_index: idx,
          source: 'USER_EXPLICIT',
          type: 'USER_INPUT',
          content: `<USER_REQUEST>Käyttäjän pyyntö ${tunnus}</USER_REQUEST>`,
          created_at: '2026-10-17T07:30:00Z',
        }) + '\n');
      } else if (i % 3 === 2) {
        loppuRivit.push(JSON.stringify({
          step_index: idx,
          source: 'MODEL',
          type: 'PLANNER_RESPONSE',
          content: `Agentin vastaus ${tunnus}`,
          created_at: '2026-10-17T07:30:01Z',
        }) + '\n');
      } else {
        loppuRivit.push(JSON.stringify({
          step_index: idx,
          source: 'MODEL',
          type: 'PLANNER_RESPONSE',
          tool_calls: [{ name: `tyokalu_${tunnus}` }],
          created_at: '2026-10-17T07:30:02Z',
        }) + '\n');
      }
    }
    writeSync(fd, Buffer.from(loppuRivit.join('')));
  } finally {
    closeSync(fd);
  }
}

describe('test5: Olemattoman ja tyhjän tiedoston käsittely', () => {
  test('lueLoppu palauttaa tyhjän merkkijonon olemattomalle tiedostolle', () => {
    const olematon = join(tmpdir(), `olematon-transkripti-${Date.now()}-${Math.random()}.jsonl`);
    assert.equal(lueLoppu(olematon), '');
  });

  test('lueLoppu palauttaa tyhjän merkkijonon virheellisillä polkusyötteillä (null, undefined, tyhjä)', () => {
    assert.equal(lueLoppu(null), '');
    assert.equal(lueLoppu(undefined), '');
    assert.equal(lueLoppu(''), '');
  });

  test('louhiTranscriptViestit palauttaa tyhjän taulukon olemattomalle tiedostolle', () => {
    const olematon = join(tmpdir(), `olematon-transkripti-${Date.now()}-${Math.random()}.jsonl`);
    assert.deepEqual(louhiTranscriptViestit(olematon), []);
  });

  test('louhiTranscriptViestit palauttaa tyhjän taulukon virheellisillä polkusyötteillä', () => {
    assert.deepEqual(louhiTranscriptViestit(null), []);
    assert.deepEqual(louhiTranscriptViestit(undefined), []);
    assert.deepEqual(louhiTranscriptViestit(''), []);
  });

  test('lueLoppu palauttaa tyhjän merkkijonon 0-tavuiselle tiedostolle ilman poikkeusta', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'tyhja.jsonl');
    try {
      writeFileSync(polku, '', 'utf8');
      assert.equal(statSync(polku).size, 0);
      assert.equal(lueLoppu(polku), '');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('louhiTranscriptViestit palauttaa tyhjän taulukon 0-tavuiselle tiedostolle ilman poikkeusta', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'tyhja.jsonl');
    try {
      writeFileSync(polku, '', 'utf8');
      assert.deepEqual(louhiTranscriptViestit(polku), []);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('test5: Yhden rivin ja pienten tiedostojen käsittely', () => {
  test('1 rivin tiedosto (USER_INPUT): poimitaan käyttäjän siivottu viesti', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'yksi_kayttaja.jsonl');
    try {
      const rivi = JSON.stringify({
        step_index: 1,
        source: 'USER_EXPLICIT',
        type: 'USER_INPUT',
        content: '<USER_REQUEST>Toteuta ominaisuus X ja testaa se.</USER_REQUEST><SYSTEM_MESSAGE>Metatietoa</SYSTEM_MESSAGE>',
      }) + '\n';
      writeFileSync(polku, rivi, 'utf8');

      // lueLoppu lukee rivin sellaisenaan
      const loppu = lueLoppu(polku);
      assert.equal(loppu, rivi);

      // louhiTranscriptViestit poimii viestin ja siivoaa XML-tagit
      const viestit = louhiTranscriptViestit(polku);
      assert.equal(viestit.length, 1);
      assert.equal(viestit[0].rooli, 'kayttaja');
      assert.equal(viestit[0].teksti, 'Toteuta ominaisuus X ja testaa se.');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('1 rivin tiedosto (PLANNER_RESPONSE tekstillä): poimitaan agentin viesti', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'yksi_agentti.jsonl');
    try {
      const rivi = JSON.stringify({
        step_index: 2,
        source: 'MODEL',
        type: 'PLANNER_RESPONSE',
        content: 'Ominaisuus X on toteutettu onnistuneesti.',
      }) + '\n';
      writeFileSync(polku, rivi, 'utf8');

      const viestit = louhiTranscriptViestit(polku);
      assert.equal(viestit.length, 1);
      assert.equal(viestit[0].rooli, 'agentti');
      assert.equal(viestit[0].teksti, 'Ominaisuus X on toteutettu onnistuneesti.');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('1 rivin tiedosto (PLANNER_RESPONSE tool_calls): muodostetaan työkaluviesti', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'yksi_tyokalu.jsonl');
    try {
      const rivi = JSON.stringify({
        step_index: 3,
        source: 'MODEL',
        type: 'PLANNER_RESPONSE',
        content: null,
        tool_calls: [{ name: 'run_command' }, { name: 'view_file' }],
      }) + '\n';
      writeFileSync(polku, rivi, 'utf8');

      const viestit = louhiTranscriptViestit(polku);
      assert.equal(viestit.length, 1);
      assert.equal(viestit[0].rooli, 'työkalu');
      assert.equal(viestit[0].teksti, 'Kutsuttiin työkaluja: run_command, view_file');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('1 rivin tiedosto (korruptoitunut JSON): ohitetaan eikä heitä virhettä', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'korruptoitunut.jsonl');
    try {
      writeFileSync(polku, '{"type":"USER_INPUT", broken json...\n', 'utf8');
      assert.deepEqual(louhiTranscriptViestit(polku), []);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('1 rivin tiedosto (ei-tuettu tyyppi tai tyhjä rivi): ohitetaan siististi', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'muu_tyyppi.jsonl');
    try {
      const sisalto = JSON.stringify({ step_index: 1, type: 'SYSTEM_NOTIFICATION', content: 'Info' }) + '\n\n';
      writeFileSync(polku, sisalto, 'utf8');
      assert.deepEqual(louhiTranscriptViestit(polku), []);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('Pieni tiedosto (< 2 Mt): lueLoppu lukee koko tiedoston oikein', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'pieni.jsonl');
    try {
      const rivit = [];
      for (let i = 1; i <= 20; i++) {
        rivit.push(JSON.stringify({
          step_index: i,
          type: 'USER_INPUT',
          content: `Pienen tiedoston viesti ${i}`,
        }) + '\n');
      }
      const kokoSisalto = rivit.join('');
      writeFileSync(polku, kokoSisalto, 'utf8');

      const loppu = lueLoppu(polku);
      assert.equal(loppu, kokoSisalto);

      const viestit = louhiTranscriptViestit(polku);
      assert.equal(viestit.length, 20);
      assert.equal(viestit[0].teksti, 'Pienen tiedoston viesti 1');
      assert.equal(viestit[19].teksti, 'Pienen tiedoston viesti 20');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('test5: Suuri transkriptitiedosto (5–10 Mt, kymmeniä tuhansia rivejä) ja O(1)-suorituskyky', () => {
  let tmp = '';
  let suuriPolku = '';
  let tiedostonKokoTavua = 0;

  test('Valmistelu: luodaan suuri transkriptitiedosto (5–10 Mt ja kymmeniä tuhansia rivejä)', () => {
    tmp = luoTestiHakemisto();
    suuriPolku = join(tmp, 'suuri_transcript.jsonl');

    // Luodaan 35 000 rivin tiedosto (~7 Mt)
    luoSuuriTranscriptTiedosto(suuriPolku, 35000);

    const st = statSync(suuriPolku);
    tiedostonKokoTavua = st.size;
    const kokoMt = tiedostonKokoTavua / (1024 * 1024);

    // Varmistetaan, että tiedosto on 5–10 Mt kokoluokassa
    assert.ok(kokoMt >= 5.0, `Tiedosto on liian pieni: ${kokoMt.toFixed(2)} Mt (odotettiin >= 5 Mt)`);
    assert.ok(kokoMt <= 12.0, `Tiedosto on liian suuri: ${kokoMt.toFixed(2)} Mt (odotettiin <= 12 Mt)`);
  });

  test('lueLoppu: lukee vain viimeiset 2 Mt puskurina O(1)-ajassa (< 50 ms)', () => {
    assert.ok(suuriPolku && existsSync(suuriPolku), 'Testitiedostoa ei ole luotu');

    // Mitataan lueLoppu-kutsun suoritusaika
    const mitatutKestot = [];
    let sisalto = '';

    // Ajetaan 3 kertaa luotettavan mittauksen saamiseksi
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      sisalto = lueLoppu(suuriPolku);
      const t1 = performance.now();
      mitatutKestot.push(t1 - t0);
    }

    const nopeinKesto = Math.min(...mitatutKestot);

    // 1. O(1)-aikavaatimus: < 50 ms
    assert.ok(
      nopeinKesto < 50,
      `lueLoppu O(1)-luku kesti liian kauan: ${nopeinKesto.toFixed(2)} ms (vaatimus < 50 ms)`
    );

    // 2. Luettu puskuri on tasan 2 Mt (2 * 1024 * 1024 tavua)
    const luettuTavumaara = Buffer.byteLength(sisalto, 'utf8');
    const odotettuMax = 2 * 1024 * 1024;
    assert.equal(luettuTavumaara, odotettuMax, `Odotettiin tasan 2 Mt puskuria (${odotettuMax} tavua), saatiin ${luettuTavumaara}`);

    // 3. Varmistetaan ettei tiedoston alkupään ensimmäisiä viestejä ole luettu
    assert.equal(
      sisalto.includes('ALKUPAA_INDEKSI_00001'),
      false,
      'Alkupään ensimmäinen viesti ei saa olla 2 Mt loppupuskurissa'
    );
    assert.equal(
      sisalto.includes('ALKUPAA_INDEKSI_00100'),
      false,
      'Alkupään viesti 100 ei saa olla 2 Mt loppupuskurissa'
    );

    // 4. Varmistetaan, että aivan viimeinen rivi löytyy puskurin lopusta
    assert.ok(
      sisalto.includes('LOPPUPAA_INDEKSI_00060'),
      'Viimeisen viestin tulee löytyä luetusta puskurista'
    );
  });

  test('lueLoppu: O(1)-vakiomuisti eikä aiheuta muistipiikkiä suurella tiedostolla', () => {
    // Varmistetaan ettei toistuva suuren tiedoston loppupään lukeminen kasvata heap-muistia hallitsemattomasti
    if (global.gc) global.gc();
    const heapEnnen = process.memoryUsage().heapUsed;

    // Suoritetaan useita lukukertoja
    for (let i = 0; i < 5; i++) {
      const pala = lueLoppu(suuriPolku);
      assert.ok(pala.length > 0);
    }

    if (global.gc) global.gc();
    const heapJalkeen = process.memoryUsage().heapUsed;
    const kasvuMb = (heapJalkeen - heapEnnen) / (1024 * 1024);

    // Vakiomuistiluennan muistikasvun tulee pysyä tiukasti pienenä (< 25 Mt)
    assert.ok(
      kasvuMb < 25,
      `Muistipiikki havaittu: heap kasvoi ${kasvuMb.toFixed(2)} Mt (odotettiin < 25 Mt)`
    );
  });

  test('lueLoppu: mukautettu maxKoko-parametri lukee tarkasti halutun puskurin koon', () => {
    const koko4k = 4096;
    const pala4k = lueLoppu(suuriPolku, koko4k);
    assert.equal(Buffer.byteLength(pala4k, 'utf8'), koko4k);
    assert.ok(pala4k.includes('LOPPUPAA_INDEKSI_00060'));

    const koko1k = 1024;
    const pala1k = lueLoppu(suuriPolku, koko1k);
    assert.equal(Buffer.byteLength(pala1k, 'utf8'), koko1k);
    assert.ok(pala1k.includes('LOPPUPAA_INDEKSI_00060'));
  });

  test('louhiTranscriptViestit: hakee vain viimeiset 60 viestiä ilman Heap-ylivuotoa', () => {
    if (global.gc) global.gc();
    const heapEnnen = process.memoryUsage().heapUsed;

    const viestit = louhiTranscriptViestit(suuriPolku);

    const heapJalkeen = process.memoryUsage().heapUsed;
    const kasvuMb = (heapJalkeen - heapEnnen) / (1024 * 1024);

    // 1. Viestejä palautetaan tasan 60
    assert.equal(viestit.length, 60, `Odotettiin tasan 60 viestiä, saatiin ${viestit.length}`);

    // 2. Ei Heap-ylivuotoa: heap-kasvu pysyy maltillisena
    assert.ok(
      kasvuMb < 30,
      `louhiTranscriptViestit kasvatti muistia liikaa: ${kasvuMb.toFixed(2)} Mt (odotettiin < 30 Mt)`
    );

    // 3. Ensimmäinen palautettu viesti vastaa loppupään indeksiä 1
    assert.equal(viestit[0].rooli, 'kayttaja');
    assert.ok(
      viestit[0].teksti.includes('LOPPUPAA_INDEKSI_00001'),
      `Ensimmäisen viestin odotettiin olevan LOPPUPAA_INDEKSI_00001, saatiin: ${viestit[0].teksti}`
    );

    // 4. Viimeinen palautettu viesti vastaa loppupään indeksiä 60
    assert.equal(viestit[59].rooli, 'työkalu');
    assert.ok(
      viestit[59].teksti.includes('tyokalu_LOPPUPAA_INDEKSI_00060'),
      `Viimeisen viestin odotettiin sisältävän tyokalu_LOPPUPAA_INDEKSI_00060, saatiin: ${viestit[59].teksti}`
    );

    // 5. Yksikään alkupään viesteistä ei ole palautettujen joukossa
    const sisaltaaAlkupaan = viestit.some((v) => v.teksti.includes('ALKUPAA_INDEKSI_'));
    assert.equal(sisaltaaAlkupaan, false, 'Palautetuissa viesteissä ei saa olla yhtään alkupään viestiä');

    // 6. Roolien jakauma on kelvollinen (kaikki roolit ovat sallittuja)
    const sallitutRoolit = new Set(['kayttaja', 'agentti', 'työkalu']);
    for (const v of viestit) {
      assert.ok(sallitutRoolit.has(v.rooli), `Tuntematon rooli: ${v.rooli}`);
      assert.ok(typeof v.teksti === 'string' && v.teksti.length > 0, 'Viestin tekstin tulee olla ei-tyhjä merkkijono');
    }
  });

  test('louhiTranscriptViestit: mukautettu maxViestit-rajaus toimii oikein', () => {
    const viestit15 = louhiTranscriptViestit(suuriPolku, 15);
    assert.equal(viestit15.length, 15);

    // Viimeisen tulee edelleen olla viesti 60
    assert.ok(viestit15[14].teksti.includes('tyokalu_LOPPUPAA_INDEKSI_00060'));

    // Ensimmäisen 15:sta tulee olla viesti 46 (60 - 15 + 1)
    assert.ok(viestit15[0].teksti.includes('LOPPUPAA_INDEKSI_00046'));
  });

  test('louhiTranscriptViestit: käsittelee 2 Mt puskurin leikkausrajan katkenneen JSON-rivin virheettömästi', () => {
    // Luodaan erillinen tiedosto, jonka 2 Mt rajan leikkauskohdassa on tarkoituksella katkennut rivi
    const erillinenPolku = join(tmp, 'katkennut_raja.jsonl');
    const fd = openSync(erillinenPolku, 'w');
    try {
      // 1 Mt täytettä alkupäähän
      const tayte1 = Buffer.alloc(1024 * 1024, 0x61); // 'a'
      writeSync(fd, tayte1);

      // Katkennut JSON-rivi suoraan leikkauskohdan seutuville
      const katkennut = Buffer.from('\n{"step_index":999,"type":"USER_INPUT","con\n');
      writeSync(fd, katkennut);

      // 1 Mt täytettä ja rivinvaihto ennen valideja rivejä
      const tayte2 = Buffer.alloc(1024 * 1024, 0x62); // 'b'
      writeSync(fd, tayte2);
      writeSync(fd, Buffer.from('\n'));

      const validitRivit = [];
      for (let i = 1; i <= 5; i++) {
        validitRivit.push(JSON.stringify({
          step_index: 1000 + i,
          type: 'USER_INPUT',
          content: `Validitesti ${i}`,
        }) + '\n');
      }
      writeSync(fd, Buffer.from(validitRivit.join('')));
    } finally {
      closeSync(fd);
    }

    // louhiTranscriptViestit ei saa heittää poikkeusta katkenneesta tai korruptoituneesta datasta
    const viestit = louhiTranscriptViestit(erillinenPolku);
    assert.ok(Array.isArray(viestit));
    assert.equal(viestit.length, 5);
    assert.equal(viestit[0].teksti, 'Validitesti 1');
    assert.equal(viestit[4].teksti, 'Validitesti 5');
  });

  test('Siivous: väliaikaishakemisto ja suuri tiedosto poistetaan', () => {
    if (tmp && existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
      assert.equal(existsSync(tmp), false, 'Väliaikaishakemiston poisto epäonnistui');
    }
  });
});

describe('test5: Tekstien pituusrajat ja siivous', () => {
  test('louhiTranscriptViestit: käyttäjän teksti siivotaan ja leikataan enintään 800 merkkiin', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'pitka_kayttaja.jsonl');
    try {
      const pitkaTeksti = 'K'.repeat(1500);
      const rivi = JSON.stringify({
        step_index: 1,
        type: 'USER_INPUT',
        content: `<USER_REQUEST>${pitkaTeksti}</USER_REQUEST><ADDITIONAL_METADATA>poistettava</ADDITIONAL_METADATA>`,
      }) + '\n';
      writeFileSync(polku, rivi, 'utf8');

      const viestit = louhiTranscriptViestit(polku);
      assert.equal(viestit.length, 1);
      assert.equal(viestit[0].rooli, 'kayttaja');
      assert.equal(viestit[0].teksti.length, 800);
      assert.equal(viestit[0].teksti.includes('poistettava'), false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('louhiTranscriptViestit: agentin vastaus leikataan enintään 1000 merkkiin', () => {
    const tmp = luoTestiHakemisto();
    const polku = join(tmp, 'pitka_agentti.jsonl');
    try {
      const pitkaTeksti = 'A'.repeat(2500);
      const rivi = JSON.stringify({
        step_index: 2,
        type: 'PLANNER_RESPONSE',
        content: pitkaTeksti,
      }) + '\n';
      writeFileSync(polku, rivi, 'utf8');

      const viestit = louhiTranscriptViestit(polku);
      assert.equal(viestit.length, 1);
      assert.equal(viestit[0].rooli, 'agentti');
      assert.equal(viestit[0].teksti.length, 1000);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
