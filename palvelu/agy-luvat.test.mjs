// agy-luvat.mjs: lupakyselyn tunnistus ja vastaus (AGY-PRE-ISTUNTO 16.10.2026). Ruututekstit ovat agy 1.2.15:n todellisia kyselyjä.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luoAgyLuvat, valitseVastaus } from './agy-luvat.mjs';

const KOMENTO = `Requesting permission for:
   node claude/siirto/tools/konteksti-nyt.mjs
Run this command?
> 1. Yes, run command
  2. Yes, and always allow in this conversation for commands that start with
'node claude/siirto/tools/konteksti-nyt.mjs'
  3. Yes, and always allow for commands that start with 'node
claude/siirto/tools/konteksti-nyt.mjs' (Persist to settings.json)
  4. No, cancel
  5. No, and always deny for commands that start with 'node
claude/siirto/tools/konteksti-nyt.mjs' in this conversation
  ↑/↓ Navigate · tab Amend`;
const TIEDOSTO = `Read: ~/.local/state/pura/x.md
Allow access to this file?
> 1. Yes, allow access
  2. Yes, and always allow non-workspace access
  3. No, deny access
  ↑/↓ Navigate`;

test('valitseVastaus: komento → 2 (tämä keskustelu), tiedosto → 1, ei pysyvää eikä No-vaihtoehtoa', () => {
  assert.equal(valitseVastaus(KOMENTO).numero, '2');
  assert.equal(valitseVastaus(TIEDOSTO).numero, '1');
  assert.match(valitseVastaus(TIEDOSTO).nimi, /^Yes, allow access$/);
});

test('valitseVastaus: ei kyselyä → null; kysely ilman turvallista vaihtoehtoa → null', () => {
  assert.equal(valitseVastaus('> \n? for shortcuts   Gemini 3.8 Flash · high'), null);
  assert.equal(valitseVastaus('Run this command?\n> 1. Yes, and always allow for commands (Persist to settings.json)\n  2. No, cancel'), null);
  assert.equal(valitseVastaus('Allow access to this file?\n> 1. No, deny access\n  2. Yes, and always allow non-workspace access'), null);
  assert.equal(valitseVastaus('Vastaa numerolla.\n1. Aloita työ\n2. Jokin muu'), null);
  assert.equal(valitseVastaus(undefined), null);
});

function ymp(ruudut, paalla) {
  const kutsut = [];
  const aja = async (komento, a) => {
    kutsut.push([komento, ...a]);
    if (a[0] === 'list-panes') return { koodi: 0, stdout: 'rc bash\nsiirto-scopes-chat-104740 claude\nsiirto-scopes-agy-test-120949 agy\nsiirto-scopes-mac-123456 ssh\nsiirto-x-1 agy\n', stderr: '' };
    if (a[0] === 'capture-pane') return { koodi: 0, stdout: ruudut[a[3]] ?? '', stderr: '' };
    return { koodi: 0, stdout: '', stderr: '' };
  };
  const loki = [];
  return { kutsut, loki, l: luoAgyLuvat({ aja, paalla: () => paalla.v, kirjaa: (r) => loki.push(r), vali: 50 }) };
}

test('kierros: pois päältä ei koske tmuxiin; päällä vastaa vain agy-ruutuihin ja kirjaa', async () => {
  const paalla = { v: false };
  const { kutsut, loki, l } = ymp({ 'siirto-scopes-agy-test-120949': KOMENTO }, paalla);
  assert.deepEqual(await l.kierros(), []);
  assert.equal(kutsut.length, 0);
  paalla.v = true;
  const v = await l.kierros();
  assert.deepEqual(v.map((x) => [x.ruutu, x.numero]), [['siirto-scopes-agy-test-120949', '2']]);
  assert.deepEqual(kutsut.filter((c) => c[1] === 'send-keys'), [['tmux', 'send-keys', '-t', 'siirto-scopes-agy-test-120949', '2']]);
  assert.equal(loki[0].toiminto, 'agy-lupa');
  assert.equal(loki[0].tulos, 'ok');
  assert.ok(!kutsut.some((c) => c.includes('siirto-scopes-chat-104740')), 'claude-ruutuun ei kosketa');
});

test('kierros: sama kysely ei saa kahta painallusta peräkkäin', async () => {
  const { kutsut, l } = ymp({ 'siirto-scopes-agy-test-120949': KOMENTO }, { v: true });
  await l.kierros();
  await l.kierros();
  assert.equal(kutsut.filter((c) => c[1] === 'send-keys').length, 1);
});

test('kierros: vastaa myös mac-agy-ruutuihin (ssh)', async () => {
  const { kutsut, l } = ymp({ 'siirto-scopes-mac-123456': KOMENTO }, { v: true });
  const v = await l.kierros();
  assert.deepEqual(v.map((x) => [x.ruutu, x.numero]), [['siirto-scopes-mac-123456', '2']]);
  assert.deepEqual(kutsut.filter((c) => c[1] === 'send-keys'), [['tmux', 'send-keys', '-t', 'siirto-scopes-mac-123456', '2']]);
});
