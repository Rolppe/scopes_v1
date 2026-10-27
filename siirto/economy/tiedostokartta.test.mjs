import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  luokitteleTiedostotyyppi,
  poimiKoodiIndeksi,
  haeTiedostokartta,
  etsiSymboli,
  muotoileTiedostokartta,
  haeJaMuotoileTiedostokartta,
} from './tiedostokartta.mjs';

test('luokitteleTiedostotyyppi: tunnistaa koodit, dokumentit ja konfiguraatiot', () => {
  assert.equal(luokitteleTiedostotyyppi('src/index.mjs'), 'koodi');
  assert.equal(luokitteleTiedostotyyppi('Sources/App.swift'), 'koodi');
  assert.equal(luokitteleTiedostotyyppi('gate.sh'), 'koodi');
  assert.equal(luokitteleTiedostotyyppi('README.md'), 'dokumentti');
  assert.equal(luokitteleTiedostotyyppi('settings.json'), 'konfiguraatio');
  assert.equal(luokitteleTiedostotyyppi('kuva.png'), 'muu');
});

test('poimiKoodiIndeksi: poimii funktiot, luokat ja otsikot ilman LLM-kutsuja', () => {
  const jsKoodi = `
import { foo } from 'bar';
export function tervehdi(nimi) { return 'hei ' + nimi; }
export class Laskuri { constructor() {} }
export const VAKIO_LUKU = 42;
function sisainenApu() {}
`;
  const jsSymbolit = poimiKoodiIndeksi(jsKoodi, '.mjs');
  const jsNimet = jsSymbolit.map((s) => s.nimi);
  assert.ok(jsNimet.includes('tervehdi'));
  assert.ok(jsNimet.includes('Laskuri'));
  assert.ok(jsNimet.includes('VAKIO_LUKU'));
  assert.ok(jsNimet.includes('sisainenApu'));

  const swiftKoodi = `
public struct Kayttaja { let id: String }
public class VerkkoPalvelu {
  func lahetaViesti() {}
}
`;
  const swiftSymbolit = poimiKoodiIndeksi(swiftKoodi, '.swift');
  const swiftNimet = swiftSymbolit.map((s) => s.nimi);
  assert.ok(swiftNimet.includes('Kayttaja'));
  assert.ok(swiftNimet.includes('VerkkoPalvelu'));
  assert.ok(swiftNimet.includes('lahetaViesti'));

  const mdSisalto = `
# Pääotsikko
Jotain tekstiä
## Toinen taso
Lisää tekstiä
`;
  const mdSymbolit = poimiKoodiIndeksi(mdSisalto, '.md');
  assert.equal(mdSymbolit.length, 2);
  assert.equal(mdSymbolit[0].nimi, 'Pääotsikko');
  assert.equal(mdSymbolit[1].nimi, 'Toinen taso');
});

test('haeTiedostokartta: luetteloi tiedostot ja muodostaa file://-linkit', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-test-kartta-'));
  const kohde = join(d, 'scopes', 'testikohde');
  mkdirSync(join(kohde, 'ali'), { recursive: true });
  mkdirSync(join(kohde, '.git'), { recursive: true });

  writeFileSync(join(kohde, 'REKISTERI.md'), '# Rekisteri\n\n## Tarkoitus\nKoe');
  writeFileSync(join(kohde, 'koodi.mjs'), 'export function ajaTesti() { return 1; }\n');
  writeFileSync(join(kohde, 'ali', 'apu.swift'), 'struct ApuModel {}\n');
  writeFileSync(join(kohde, '.git', 'HEAD'), 'ref: refs/heads/main\n');

  mkdirSync(join(d, 'claude', 'siirto', 'state'), { recursive: true });
  writeFileSync(
    join(d, 'claude', 'siirto', 'state', 'skoopit.json'),
    JSON.stringify({ 'scopes testikohde': ['scopes/testikohde/REKISTERI.md'] })
  );

  const kartta = haeTiedostokartta({
    juuri: d,
    skooppi: 'scopes testikohde',
    sisallytaIndeksi: true,
  });

  assert.equal(kartta.maara, 3);
  assert.ok(kartta.yhteensaKoko > 0);
  assert.equal(kartta.tyypit.dokumentti, 1);
  assert.equal(kartta.tyypit.koodi, 2);

  const koodiTiedosto = kartta.tiedostot.find((t) => t.polku.endsWith('koodi.mjs'));
  assert.ok(koodiTiedosto);
  assert.ok(koodiTiedosto.fileUri.startsWith('file://'));
  assert.ok(koodiTiedosto.fileUri.includes('scopes/testikohde/koodi.mjs'));
  assert.ok(koodiTiedosto.symbolit.some((s) => s.nimi === 'ajaTesti'));

  // .git ei saa sisältyä
  assert.ok(!kartta.tiedostot.some((t) => t.polku.includes('.git')));
});

test('etsiSymboli: löytää osumat polusta ja koodi-indeksistä', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-test-etsi-'));
  const kohde = join(d, 'scopes', 'haku');
  mkdirSync(kohde, { recursive: true });
  writeFileSync(join(kohde, 'palvelu.mjs'), 'export function suoritaHaku() {}');
  writeFileSync(join(kohde, 'mallit.swift'), 'struct ErikoisModel {}');

  const kartta = haeTiedostokartta({
    juuri: d,
    skooppi: 'scopes haku',
    sisallytaIndeksi: true,
  });

  const osumat = etsiSymboli(kartta, 'suoritaHaku');
  assert.equal(osumat.length, 1);
  assert.equal(osumat[0].polku, 'scopes/haku/palvelu.mjs');
  assert.ok(osumat[0].symbolit.some((s) => s.nimi === 'suoritaHaku'));

  const osumatPolulla = etsiSymboli(kartta, 'mallit');
  assert.equal(osumatPolulla.length, 1);
  assert.equal(osumatPolulla[0].polku, 'scopes/haku/mallit.swift');
});

test('muotoileTiedostokartta: tuottaa selkeän markdownin file://-linkkeineen', () => {
  const kartta = {
    skooppi: 'scopes siirto economy',
    yhteensaKoko: 4096,
    maara: 2,
    tiedostot: [
      {
        polku: 'scopes/siirto/economy/REKISTERI.md',
        koko: 2048,
        fileUri: 'file://~/sessions-repo/scopes/siirto/economy/REKISTERI.md',
      },
      {
        polku: 'scopes/siirto/economy/tiedostokartta.mjs',
        koko: 2048,
        fileUri: 'file://~/sessions-repo/scopes/siirto/economy/tiedostokartta.mjs',
        symbolit: [{ nimi: 'haeTiedostokartta' }, { nimi: 'muotoileTiedostokartta' }],
      },
    ],
  };

  const md = muotoileTiedostokartta(kartta, { naytaSymbolit: true });
  assert.ok(md.includes('## Skoopin tiedostokartta (ECONOMY-TIEDOSTOKARTTA)'));
  assert.ok(md.includes('- [scopes/siirto/economy/REKISTERI.md](file://~/sessions-repo/scopes/siirto/economy/REKISTERI.md) (2.0 KB)'));
  assert.ok(md.includes('— symbolit: haeTiedostokartta, muotoileTiedostokartta'));
  assert.ok(md.includes('Älä käytä find-, grep- tai ls-komentoja tiedostojen etsimiseen'));

  const lyhyt = muotoileTiedostokartta(kartta, { lyhyt: true });
  assert.ok(lyhyt.includes('Tiedostokartta (2 kpl, 4.0 KB)'));
  assert.ok(lyhyt.includes('scopes/siirto/economy/REKISTERI.md'));
});

test('haeJaMuotoileTiedostokartta: palauttaa datan ja tekstin yhdellä kutsulla', () => {
  const d = mkdtempSync(join(tmpdir(), 'economy-test-kooste-'));
  const kohde = join(d, 'scopes', 'kooste');
  mkdirSync(kohde, { recursive: true });
  writeFileSync(join(kohde, 'REKISTERI.md'), '# Rekisteri');

  const tulos = haeJaMuotoileTiedostokartta('scopes kooste', { juuri: d });
  assert.equal(tulos.maara, 1);
  assert.ok(tulos.teksti.includes('## Skoopin tiedostokartta'));
  assert.ok(tulos.teksti.includes('scopes/kooste/REKISTERI.md'));
});

test('tiedostokartta.mjs CLI: tukee --json, --indeksi, --haku ja --lyhyt valitsimia', () => {
  const skriptiPolku = fileURLToPath(new URL('./tiedostokartta.mjs', import.meta.url));

  // Oletustuloste
  const out1 = spawnSync(process.execPath, [skriptiPolku, 'scopes siirto economy'], {
    encoding: 'utf8',
  });
  assert.equal(out1.status, 0);
  assert.ok(out1.stdout.includes('## Skoopin tiedostokartta (ECONOMY-TIEDOSTOKARTTA)'));
  assert.ok(out1.stdout.includes('scopes/siirto/economy/REKISTERI.md'));

  // --json
  const outJson = spawnSync(process.execPath, [skriptiPolku, 'scopes siirto economy', '--json'], {
    encoding: 'utf8',
  });
  assert.equal(outJson.status, 0);
  const parsed = JSON.parse(outJson.stdout);
  assert.equal(parsed.skooppi, 'scopes siirto economy');
  assert.ok(parsed.maara > 0);

  // --lyhyt
  const outLyhyt = spawnSync(process.execPath, [skriptiPolku, 'scopes siirto economy', '--lyhyt'], {
    encoding: 'utf8',
  });
  assert.equal(outLyhyt.status, 0);
  assert.ok(outLyhyt.stdout.startsWith('Tiedostokartta ('));

  // --haku
  const outHaku = spawnSync(process.execPath, [skriptiPolku, 'scopes siirto economy', '--haku', 'gate'], {
    encoding: 'utf8',
  });
  assert.equal(outHaku.status, 0);
  assert.ok(outHaku.stdout.includes('gate.sh'));
});
