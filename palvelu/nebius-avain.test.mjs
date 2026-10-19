// node --test scopes/palvelu/nebius-avain.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { luoNebiusAvain } from './nebius-avain.mjs';
import { Hylatty } from './toiminnot.mjs';

test('nebius-avain: tila ei paljasta avainta, tallennus 600-oikeuksin, virheellinen hylätään', () => {
  const d = mkdtempSync(join(tmpdir(), 'nebius-'));
  try {
    const tiedosto = join(d, 'scopes/nebius-avain');
    const n = luoNebiusAvain({ tiedosto });
    assert.deepEqual(n.tila(), { asetettu: false, merkkeja: 0 });
    assert.deepEqual(n.tallenna('  v1.abcDEF123-xyz\n'), { asetettu: true, merkkeja: 16 });
    assert.equal(readFileSync(tiedosto, 'utf8'), 'v1.abcDEF123-xyz');
    assert.equal(statSync(tiedosto).mode & 0o777, 0o600);
    for (const huono of ['', 'lyhyt', 'kaksi sanaa ovat tässä', 'ääkkösiäääää', 42, null]) {
      assert.throws(() => n.tallenna(huono), (e) => e instanceof Hylatty && e.koodi === 400);
    }
    assert.equal(readFileSync(tiedosto, 'utf8'), 'v1.abcDEF123-xyz', 'hylätty ei korvaa vanhaa');
  } finally { rmSync(d, { recursive: true, force: true }); }
});
