// Hybridi-pakkausscriptin kattava testipatteristo (Moduuli 5)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  louhiGit,
  louhiKaikki,
  louhiTranscriptViestit,
  siivoaKayttajanTeksti,
  etsiAktiivinenIstunto,
} from './louhija.mjs';

import {
  muodostaKehote,
  validoiAnalyysi,
  syntetisoiAnalyysi,
  ajaHarkinta,
  SKEEMA,
} from './harkinta.mjs';

import {
  rakennaMuistio,
  kirjoitaJaTarkista,
  muotoileAikaleima,
} from './muistio.mjs';

test('schema: skeema sisältää kaikki 8 pakollista kenttää', () => {
  const pakolliset = ['tehty', 'todettu', 'paatokset', 'avoimet', 'viat', 'hukka', 'kesken', 'seuraavaPaketti'];
  for (const k of pakolliset) {
    assert.ok(SKEEMA.required.includes(k), `Kenttä ${k} puuttuu schema.jsonista`);
  }
  assert.equal(SKEEMA.properties.tehty.type, 'array');
  assert.equal(SKEEMA.properties.todettu.type, 'array');
  assert.equal(SKEEMA.properties.paatokset.type, 'array');
  assert.equal(SKEEMA.properties.avoimet.type, 'array');
  assert.equal(SKEEMA.properties.viat.type, 'array');
  assert.equal(SKEEMA.properties.hukka.type, 'string');
  assert.equal(SKEEMA.properties.kesken.type, 'string');
  assert.equal(SKEEMA.properties.seuraavaPaketti.type, 'string');
});

test('louhija: louhiGit palauttaa git-tiedot ja haaran', () => {
  const g = louhiGit();
  assert.equal(typeof g.haara, 'string');
  assert.equal(typeof g.status, 'string');
  assert.equal(typeof g.diffStat, 'string');
  assert.equal(typeof g.log, 'string');
  assert.ok(Array.isArray(g.muutetut));
});

test('louhija: siivoaKayttajanTeksti poistaa järjestelmämetatagit', () => {
  const raaka = `<USER_REQUEST>
Tee uusi ominaisuus
</USER_REQUEST>
<ADDITIONAL_METADATA>
kello: 12.00
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
malli: Flash
</USER_SETTINGS_CHANGE>`;
  const puhdas = siivoaKayttajanTeksti(raaka);
  assert.equal(puhdas, 'Tee uusi ominaisuus');
});

test('louhija: louhiTranscriptViestit jäsentää transcript-tiedoston', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'trans-test-'));
  const tempFile = join(tempDir, 'transcript.jsonl');
  const sisalto = [
    JSON.stringify({ type: 'USER_INPUT', content: '<USER_REQUEST>Aloita toteutus</USER_REQUEST>' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'Toteutetaan moduulit' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', tool_calls: [{ name: 'view_file' }] }),
  ].join('\n');
  writeFileSync(tempFile, sisalto, 'utf8');

  try {
    const viestit = louhiTranscriptViestit(tempFile);
    assert.equal(viestit.length, 3);
    assert.equal(viestit[0].rooli, 'kayttaja');
    assert.equal(viestit[0].teksti, 'Aloita toteutus');
    assert.equal(viestit[1].rooli, 'agentti');
    assert.equal(viestit[1].teksti, 'Toteutetaan moduulit');
    assert.equal(viestit[2].rooli, 'työkalu');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('louhija: etsiAktiivinenIstunto palauttaa istunto-olion', () => {
  const istunto = etsiAktiivinenIstunto();
  assert.ok(typeof istunto === 'object');
  assert.ok('istuntoId' in istunto);
  assert.ok('malli' in istunto);
});

test('louhija: louhiKaikki kokoaa strukturoidut faktat', async () => {
  const faktat = await louhiKaikki({ skooppi: 'scopes agy siirto pakkausscripti' });
  assert.equal(faktat.skooppi, 'scopes agy siirto pakkausscripti');
  assert.ok('git' in faktat);
  assert.ok(Array.isArray(faktat.viestit));
  assert.ok(Array.isArray(faktat.git.skoopinMuutetut));
  assert.ok(Array.isArray(faktat.git.vieraatMuutetut));
});

test('harkinta: muodostaKehote luo sääntöjen mukaisen kehotteen', () => {
  const faktat = {
    skooppi: 'scopes agy siirto pakkausscripti',
    git: {
      skoopinMuutetut: ['scopes/agy/siirto/pakkausscripti/REKISTERI.md'],
      vieraatMuutetut: [],
      diffStat: '1 file changed',
      log: 'abc1234 feat: test',
    },
    viestit: [{ rooli: 'kayttaja', teksti: 'Toteuta pakkausscripti' }],
    seuraavaHead: 'SEURAAVA PAKETTI: TEST — test — polut: * — aloitus: /pura test',
  };
  const kehote = muodostaKehote(faktat);
  assert.ok(kehote.includes('scopes agy siirto pakkausscripti'));
  assert.ok(kehote.includes('scopes/agy/siirto/pakkausscripti/**'));
  assert.ok(kehote.includes('"tehty"'));
  assert.ok(kehote.includes('"todettu"'));
  assert.ok(kehote.includes('"paatokset"'));
  assert.ok(kehote.includes('"avoimet"'));
  assert.ok(kehote.includes('"viat"'));
  assert.ok(kehote.includes('"hukka"'));
  assert.ok(kehote.includes('"kesken"'));
  assert.ok(kehote.includes('"seuraavaPaketti"'));
});

test('harkinta: validoiAnalyysi tunnistaa virheelliset kentät ja syntaksit', () => {
  const validi = {
    tehty: ['Moduulit toteutettu'],
    todettu: ['Kaikki testit vihreinä'],
    paatokset: ['Valittu hybridi-arkkitehtuuri'],
    avoimet: [{ asia: 'Jatko', tila: 'avoin', askel: 'seuraava askel' }],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: JATKO — jatkokehitys — polut: scopes/** — aloitus: /pura test',
  };
  assert.equal(validoiAnalyysi(validi), true);
  assert.equal(validoiAnalyysi({ ...validi, tehty: 'ei lista' }), false);
  assert.equal(validoiAnalyysi({ ...validi, hukka: '' }), false);
  assert.equal(validoiAnalyysi({ ...validi, kesken: null }), false);
  assert.equal(validoiAnalyysi({ ...validi, seuraavaPaketti: 'VÄÄRÄ MUOTO' }), false);
  assert.equal(validoiAnalyysi({ ...validi, avoimet: [{ asia: 'vain tämä' }] }), false);
});

test('harkinta: syntetisoiAnalyysi luo validin deterministisen tuloksen', () => {
  const faktat = {
    skooppi: 'scopes agy siirto pakkausscripti',
    git: {
      skoopinMuutetut: ['scopes/agy/siirto/pakkausscripti/louhija.mjs'],
      muutetut: ['scopes/agy/siirto/pakkausscripti/louhija.mjs'],
      haara: 'test-haara',
    },
    kayttajanPyynnot: ['Tee pakkausscripti'],
  };
  const syn = syntetisoiAnalyysi(faktat);
  assert.equal(validoiAnalyysi(syn), true);
  assert.ok(syn.seuraavaPaketti.includes('/pura scopes agy siirto pakkausscripti'));
});

test('harkinta: ajaHarkinta toimii mock-ajajalla', async () => {
  const mockVastaus = {
    tehty: ['Valmis mock'],
    todettu: ['Testi ajettu'],
    paatokset: ['Linjattu'],
    avoimet: [],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: MOCK — kuvaus — polut: scopes/** — aloitus: /pura test',
  };
  const faktat = { skooppi: 'test' };
  const tulos = await ajaHarkinta(faktat, { aja: async () => JSON.stringify(mockVastaus) });
  assert.deepEqual(tulos, mockVastaus);
});

test('muistio: muotoileAikaleima palauttaa suomalaisen aikaleiman', () => {
  const d = new Date(2026, 9, 16, 17, 45); // 16.10.2026 17:45
  const a = muotoileAikaleima(d);
  assert.equal(a.pvm, '16.10.2026');
  assert.equal(a.klo, '17.45');
});

test('muistio: rakennaMuistio luo kaikki 8 pakollista lukua ilman TÄYTÄ-kommentteja', () => {
  const faktat = {
    skooppi: 'scopes agy siirto pakkausscripti',
    git: { muutetut: ['scopes/agy/siirto/pakkausscripti/REKISTERI.md'] },
    istuntoId: 'test-id',
    malli: 'Gemini 3.8 Flash',
    viimeinenPyynto: 'Toteuta moduulit',
  };
  const analyysi = {
    tehty: ['Moduulit 1–5 toteutettu'],
    todettu: ['Automaatiotestit läpäisty'],
    paatokset: ['Arkkitehtuuri linjattu'],
    avoimet: [{ asia: 'Jatkohionta', tila: 'avoin', askel: 'seuraava askel' }],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: TEST — jatko — polut: scopes/agy/siirto/pakkausscripti/** — aloitus: /pura scopes agy siirto pakkausscripti',
  };
  const m = rakennaMuistio(faktat, analyysi);
  assert.ok(m.includes('## Tehty tässä keskustelussa'));
  assert.ok(m.includes('## Todettu / mitattu'));
  assert.ok(m.includes('## Päätökset'));
  assert.ok(m.includes('## Avoimet asiat ja seuraavat askeleet'));
  assert.ok(m.includes('## Viat'));
  assert.ok(m.includes('## Hukka'));
  assert.ok(m.includes('## Kesken keskustelussa'));
  assert.ok(m.includes('## Muutetut tiedostot'));
  assert.ok(m.includes('## Seuraava paketti'));
  assert.ok(m.includes('## Sessio'));
  assert.ok(!m.includes('<!-- TÄYTÄ'));
  assert.ok(m.length < 10000, `Muistio liian pitkä: ${m.length} merkkiä`);
});

test('muistio & portti: kirjoitaJaTarkista läpäisee kaikki porttitarkistukset (pakkaa-alku --tarkista)', async () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'muistio-portti-'));
  const tempMuistio = join(tempDir, 'pakkaus-muistio.md');

  const faktat = await louhiKaikki({ skooppi: 'scopes agy siirto pakkausscripti' });
  const analyysi = syntetisoiAnalyysi(faktat);

  try {
    const tulos = kirjoitaJaTarkista(faktat, analyysi, tempMuistio);
    assert.equal(tulos.ok, true, `Porttitarkistus epäonnistui: ${tulos.virhe}`);
    assert.ok(tulos.tuloste.includes('TAYTA: ok'));
    assert.ok(tulos.tuloste.includes('PORTTI: ok'));
    assert.ok(tulos.tuloste.includes('KATTO-MUISTIO: ok'));
    assert.ok(tulos.tuloste.includes('HUKKA-LUKU: ok'));
    assert.ok(tulos.tuloste.includes('KESKEN-LUKU: ok'));
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('integraatio: pakkaa-hybridi.mjs ajaa kuiva-ajon (--kuiva --ilman-mallia) onnistuneesti', () => {
  const tulos = execFileSync('node', [
    './scopes/agy/siirto/pakkausscripti/pakkaa-hybridi.mjs',
    'scopes agy siirto pakkausscripti',
    '--kuiva',
    '--ilman-mallia',
  ], { encoding: 'utf8' });

  assert.ok(tulos.includes('[1/5] Alustetaan pakkaus'));
  assert.ok(tulos.includes('[2/5] Louhitaan faktat'));
  assert.ok(tulos.includes('[3/5] Suoritetaan nopea harkinta'));
  assert.ok(tulos.includes('[4/5] Kirjoitetaan muistio'));
  assert.ok(tulos.includes('PORTTI: ok'));
  assert.ok(tulos.includes('KUIVA: Muistio luotu ja validoitu onnistuneesti'));
});

test('metadatat: taydennaSkoopinMetadatat sisällyttää REKISTERI, HISTORIA ja ARKISTO -tiedostot', async () => {
  const { taydennaSkoopinMetadatat } = await import('./pakkaa-hybridi.mjs');
  const tempDir = mkdtempSync(join(tmpdir(), 'metadatat-test-'));
  try {
    const skooppiRel = join('scopes', 'testi', 'skooppi');
    const { mkdirSync, writeFileSync } = await import('node:fs');
    mkdirSync(join(tempDir, skooppiRel), { recursive: true });
    writeFileSync(join(tempDir, skooppiRel, 'REKISTERI.md'), '# Rekisteri');
    writeFileSync(join(tempDir, skooppiRel, 'HISTORIA.md'), '# Historia');
    writeFileSync(join(tempDir, skooppiRel, 'ARKISTO.md'), '# Arkisto');

    const alkuPolut = [join(skooppiRel, 'tiedosto.mjs')];
    const tulos = taydennaSkoopinMetadatat('scopes testi skooppi', alkuPolut, tempDir);

    assert.ok(tulos.includes(join(skooppiRel, 'tiedosto.mjs')));
    assert.ok(tulos.includes(join(skooppiRel, 'REKISTERI.md')));
    assert.ok(tulos.includes(join(skooppiRel, 'HISTORIA.md')));
    assert.ok(tulos.includes(join(skooppiRel, 'ARKISTO.md')));
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('metadatat: taydennaSkoopinMetadatat sisällyttää .agents-pakkaustaidon scopes agy siirto pakkausscripti -skoopille', async () => {
  const { taydennaSkoopinMetadatat } = await import('./pakkaa-hybridi.mjs');
  const { jaaSkoopinMuutokset } = await import('./louhija.mjs');
  const tempDir = mkdtempSync(join(tmpdir(), 'metadatat-skill-test-'));
  try {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    mkdirSync(join(tempDir, '.agents', 'skills', 'pakkaa'), { recursive: true });
    writeFileSync(join(tempDir, '.agents', 'skills', 'pakkaa', 'SKILL.md'), '---\nname: pakkaa\n---');

    const tulos = taydennaSkoopinMetadatat('scopes agy siirto pakkausscripti', [], tempDir);
    assert.ok(tulos.includes('.agents/skills/pakkaa/SKILL.md'));

    const jako = jaaSkoopinMuutokset(['.agents/skills/pakkaa/SKILL.md'], 'scopes agy siirto pakkausscripti');
    assert.deepEqual(jako.skoopinMuutetut, ['.agents/skills/pakkaa/SKILL.md']);
    assert.deepEqual(jako.vieraatMuutetut, []);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('metadatat: scopes macos ja scopes/shared sisältyvät skoopin omiin polkuihin eikä vieraiksi', async () => {
  const { jaaSkoopinMuutokset } = await import('./louhija.mjs');
  const muutetut = [
    'scopes/macos/Sources/MacRootView.swift',
    'scopes/shared/ScopesCore/Package.swift',
    'scopes/shared/ScopesCore/Sources/ScopesCore/Client/ScopesClient.swift',
    'scopes/palvelu/lahteet.mjs',
  ];
  const { skoopinMuutetut, vieraatMuutetut } = jaaSkoopinMuutokset(muutetut, 'scopes macos');
  assert.deepEqual(skoopinMuutetut, [
    'scopes/macos/Sources/MacRootView.swift',
    'scopes/shared/ScopesCore/Package.swift',
    'scopes/shared/ScopesCore/Sources/ScopesCore/Client/ScopesClient.swift',
  ]);
  assert.deepEqual(vieraatMuutetut, ['scopes/palvelu/lahteet.mjs']);
});

test('muistio: rakennaMuistio rajaa muutetut tiedostot vain skoopin omiin muutoksiin', async () => {
  const { rakennaMuistio } = await import('./muistio.mjs');
  const faktat = {
    skooppi: 'scopes macos',
    git: {
      muutetut: ['scopes/macos/Sources/MacRootView.swift', 'scopes/palvelu/lahteet.mjs'],
      skoopinMuutetut: ['scopes/macos/Sources/MacRootView.swift'],
      vieraatMuutetut: ['scopes/palvelu/lahteet.mjs'],
    },
    istuntoId: 'test-macos',
    malli: 'Gemini 3.8 Flash',
    viesteja: [],
  };
  const analyysi = {
    tehty: ['Testi tehty'],
    todettu: ['Testi todettu'],
    paatokset: ['Testi paatos'],
    avoimet: [],
    viat: [],
    hukka: 'ei — ei havaittu hukkatietoja',
    kesken: 'ei — kaikki pyydetty käsitelty',
    seuraavaPaketti: 'SEURAAVA PAKETTI: MACOS-TEST — test — polut: scopes/macos/** — aloitus: /pura scopes macos',
  };
  const m = rakennaMuistio(faktat, analyysi);
  assert.ok(m.includes('scopes/macos/Sources/MacRootView.swift'));
  assert.ok(!m.includes('scopes/palvelu/lahteet.mjs'));
  assert.ok(m.includes('koko=1'));
});
