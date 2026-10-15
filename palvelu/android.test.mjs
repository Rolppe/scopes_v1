// node --test scopes/palvelu/android.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GEMINI, geminiKeskustelu, jasennaUi, liitaAlkuun, luoAndroid, osatTekstiksi, q, samaViesti, vastauksenOsat } from './android.mjs';
import { kasittelija } from './palvelin.mjs';
import { Hylatty } from './toiminnot.mjs';

const UI = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><hierarchy rotation="0">
<node index="0" text="Sano pelkkä hei" resource-id="com.google.android.googlequicksearchbox:id/assistant_robin_user_message_text" class="android.widget.TextView" content-desc="" clickable="false" bounds="[755,380][1356,605]" />
<node index="1" text="Hei! &amp; &quot;moi&quot;&#10;rivi" resource-id="com.google.android.googlequicksearchbox:id/assistant_robin_text" class="android.widget.TextView" content-desc="" clickable="false" bounds="[84,703][1356,788]" />
<node index="2" text="" resource-id="" class="android.view.View" content-desc="Send" clickable="true" bounds="[1181,1132][1279,1230]" />
<node index="3" text="piilo" resource-id="" class="android.view.View" content-desc="" clickable="false" bounds="[0,0][0,0]" />
</hierarchy>`;

// Väärennetty adb: shell-rivit tallentuvat; vastaukset alkuosan perusteella.
function vaarennos({ hereilla = true, ui = UI } = {}) {
  const rivit = [];
  let herassa = hereilla;
  const aja = async (komento, argumentit) => {
    const ok = (s = '') => ({ koodi: 0, stdout: Buffer.from(s), stderr: '' });
    if (komento === 'python3') return ok('JPEGDATA');
    const [, , laji, rivi] = argumentit;
    if (laji === 'exec-out') return rivi === 'screencap' ? ok('P'.repeat(200)) : ok('tiedosto');
    if (laji === 'push') { rivit.push(`push ${argumentit.slice(3).join(' ')}`); return ok(); }
    rivit.push(rivi);
    if (rivi.startsWith('dumpsys power')) return ok(`  mWakefulness=${herassa ? 'Awake' : 'Asleep'}\n`);
    if (rivi === 'wm size') return ok('Physical size: 1440x3120\nOverride size: 1440x2560\n');
    if (rivi.startsWith('uiautomator')) return ok(ui);
    if (rivi.includes('KEYCODE_WAKEUP')) herassa = true;
    if (rivi.includes('KEYCODE_SLEEP')) herassa = false;
    return ok();
  };
  return { aja, rivit, muuttavat: () => rivit.filter((r) => !/^(dumpsys|wm size|uiautomator)/.test(r)) };
}
const odota = async () => {};
const hylkaa = (lupaus, koodi) => assert.rejects(lupaus, (e) => e instanceof Hylatty && e.koodi === koodi);

test('jasennaUi purkaa entiteetit ja jättää näkymättömät pois; geminiKeskustelu järjestää viestit', () => {
  const s = jasennaUi(UI);
  assert.equal(s.length, 3);
  assert.equal(s[1].teksti, 'Hei! & "moi"\nrivi');
  assert.deepEqual(s[2].alue, [1181, 1132, 1279, 1230]);
  assert.deepEqual(geminiKeskustelu(s), { viestit: [{ rooli: 'kayttaja', teksti: 'Sano pelkkä hei' }, { rooli: 'gemini', teksti: 'Hei! & "moi"\nrivi' }], kaynnissa: false });
});

test('q lainaa laitteen kuorelle: heittomerkki ja $() eivät pääse läpi', () => {
  assert.equal(q(`a'b $(rm -rf /)`), `'a'\\''b $(rm -rf /)'`);
});

test('napauta muuntaa osuudet Override-kokoon; virheellinen osuus hylätään', async () => {
  const v = vaarennos();
  const a = luoAndroid({ aja: v.aja, odota });
  assert.deepEqual((await a.suorita('napauta', { x: 0.5, y: 1 })).piste, [720, 2559]);
  assert.ok(v.rivit.includes('input tap 720 2559'));
  await hylkaa(a.suorita('napauta', { x: 2, y: 0 }), 400);
  await hylkaa(a.suorita('napauta', { x: '0.5', y: 0 }), 400);
  a.lopeta();
});

test('nappi vain listalta; tuntematon toiminto 404', async () => {
  const v = vaarennos();
  const a = luoAndroid({ aja: v.aja, odota });
  await a.suorita('nappi', { nimi: 'takaisin' });
  assert.ok(v.rivit.includes('input keyevent KEYCODE_BACK'));
  await hylkaa(a.suorita('nappi', { nimi: 'KEYCODE_POWER' }), 400);
  assert.throws(() => a.suorita('reboot'), (e) => e.koodi === 404);
  a.lopeta();
});

test('kirjoita vie tekstin jakointentillä lainattuna ja lähettää Send-painikkeesta', async () => {
  const v = vaarennos();
  const a = luoAndroid({ aja: v.aja, odota });
  await a.suorita('kirjoita', { teksti: "Mitä 'tämä' on?", laheta: true });
  const intentti = v.rivit.find((r) => r.startsWith('am start -a android.intent.action.SEND'));
  assert.equal(intentti, `am start -a android.intent.action.SEND -t text/plain --es android.intent.extra.TEXT 'Mitä '\\''tämä'\\'' on?' -n ${GEMINI}`);
  assert.ok(v.rivit.includes('input tap 1230 1181'));
  await hylkaa(a.suorita('kirjoita', { teksti: 'x'.repeat(8001) }), 413);
  await hylkaa(a.suorita('kirjoita', { teksti: '  ' }), 400);
  a.lopeta();
});

test('herätys vain nukkuvalle ruudulle, ja nukutus vain itse herätetylle minuutin jälkeen', async () => {
  let aika = 0;
  const v = vaarennos({ hereilla: false });
  const a = luoAndroid({ aja: v.aja, odota, nyt: () => aika });
  await a.ruutu();
  assert.equal(v.muuttavat().filter((r) => r.includes('WAKEUP')).length, 1);
  aika = 59_000; assert.equal(await a.nukutaJosHiljaista(), false);
  aika = 61_000; assert.equal(await a.nukutaJosHiljaista(), true);
  assert.ok(v.rivit.includes('input keyevent KEYCODE_SLEEP'));
  a.lopeta();
  const h = vaarennos({ hereilla: true }); // HDMI-tila: ruutu oli jo hereillä
  const b = luoAndroid({ aja: h.aja, odota, nyt: () => aika });
  await b.ruutu(); aika = 999_999;
  assert.equal(await b.nukutaJosHiljaista(), false);
  assert.equal(h.muuttavat().length, 0);
  b.lopeta();
});

test('kuiva: luku ajetaan, mutta herätys, napautus ja push eivät', async () => {
  const v = vaarennos({ hereilla: false });
  const a = luoAndroid({ aja: v.aja, odota, kuiva: true });
  const t = await a.suorita('napauta', { x: 0, y: 0 });
  assert.equal(t.kuiva, 'input tap 0 0');
  const l = await a.liita('/tmp/20261015T101010-abcdef-kuva.png');
  assert.match(l.kuiva, /^adb push \/tmp\/20261015T101010-abcdef-kuva\.png \/sdcard\/Download\/Scopes\/scopes-\d{6}-kuva\.png/);
  assert.deepEqual(v.muuttavat(), []);
  a.lopeta();
});

test('tuotos vain tuotoskansioista', async () => {
  const a = luoAndroid({ aja: vaarennos().aja, odota, tuotoksetDir: mkdtempSync(join(tmpdir(), 'and-')) });
  for (const p of ['/data/system/x', '/sdcard/Download/../../data/x', '/sdcard/Downloads/x', '']) await hylkaa(a.tuotos(p), 400);
  const t = await a.tuotos('/sdcard/Pictures/Gemini/kuva.png');
  assert.equal(t.tyyppi, 'image/png');
  assert.equal(t.data.toString(), 'tiedosto');
  a.lopeta();
});

test('HTTP: ruutu palaa JPEG-tavuina avaimella, ui JSONina, ilman avainta 401', async () => {
  const avain = 'k'.repeat(40);
  const android = luoAndroid({ aja: vaarennos().aja, odota });
  const kas = kasittelija({ avain, juuri: '/nonexistent', toimintoloki: null }, async () => ({}), {}, async () => ({}), async () => ({}), undefined, undefined, undefined, undefined, undefined, android);
  const palvelin = createServer(kas).listen(0, '127.0.0.1');
  await new Promise((r) => palvelin.once('listening', r));
  const hae = (polku, otsakkeet = { authorization: `Bearer ${avain}` }) => new Promise((ok, ei) => {
    request({ host: '127.0.0.1', port: palvelin.address().port, path: polku, headers: otsakkeet }, (res) => {
      const palat = []; res.on('data', (p) => palat.push(p)); res.on('end', () => ok({ koodi: res.statusCode, tyyppi: res.headers['content-type'], data: Buffer.concat(palat) }));
    }).on('error', ei).end();
  });
  try {
    const r = await hae('/api/android/ruutu?leveys=360');
    assert.equal(r.koodi, 200); assert.equal(r.tyyppi, 'image/jpeg'); assert.equal(r.data.toString(), 'JPEGDATA');
    const u = JSON.parse((await hae('/api/android/ui')).data);
    assert.equal(u.gemini.viestit.length, 2); assert.deepEqual(u.koko, [1440, 2560]);
    assert.equal((await hae('/api/android/ruutu', {})).koodi, 401);
  } finally { palvelin.close(); android.lopeta(); }
});

test('laheta kuittaa jaon vahvistuksen (Share) ja arvostelupyynnön (Not now) ennen Sendiä', async () => {
  const dialogi = (teksti, nappi, x) => `<hierarchy><node text="${teksti}" resource-id="" class="T" content-desc="" clickable="false" bounds="[100,100][900,200]" /><node text="${nappi}" resource-id="" class="B" content-desc="" clickable="true" bounds="[${x},300][${x + 100},400]" /><node text="Not now" resource-id="" class="B" content-desc="" clickable="true" bounds="[0,300][90,400]" /><node text="" resource-id="" class="V" content-desc="Send" clickable="true" bounds="[1181,1132][1279,1230]" /></hierarchy>`;
  for (const [teksti, nappi, x, piste] of [['This content was automatically added from another app. Share it with Gemini?', 'Share', 500, 'input tap 550 350'], ['Reviews are public and include your account', 'Submit', 500, 'input tap 45 350']]) {
    const v = vaarennos({ ui: dialogi(teksti, nappi, x) });
    const a = luoAndroid({ aja: v.aja, odota });
    await a.suorita('laheta');
    assert.deepEqual(v.muuttavat(), [piste, 'input tap 1230 1181']);
    a.lopeta();
  }
});

// CHAT-GEMINI 15.10.2026: vastauksen rakenne laitteelta — tekstikappaleet ja koodilohko, jonka teksti tulee heittomerkeissä.
const solmu = (id, teksti, y1, y2) => `<node text='${teksti.replace(/'/g, '&apos;')}' resource-id="com.google.android.googlequicksearchbox:id/${id}" class="android.widget.TextView" content-desc="" clickable="false" bounds="[84,${y1}][1356,${y2}]" />`;
const VASTAUS = (...solmut) => `<hierarchy>${solmut.join('')}</hierarchy>`;

test('vastauksenOsat: koodilohko heittomerkeistä, kieli otsakkeesta, nollaleveät pois, aiempi vastaus pois', () => {
  const s = jasennaUi(VASTAUS(
    solmu('assistant_robin_text', 'vanha vastaus', 100, 200),
    solmu('assistant_robin_user_message_text', 'kysy', 300, 400),
    solmu('assistant_robin_text', 'Otsikko\u200b\nkappale', 500, 900),
    solmu('assistant_robin_code_info', 'python', 950, 1000),
    solmu('assistant_robin_code_impl', 'print("hei")\n', 1010, 1100),
    solmu('assistant_robin_text', 'Loppu', 1200, 1300),
  ));
  assert.deepEqual(vastauksenOsat(s), [
    { laji: 'teksti', teksti: 'Otsikko\nkappale' }, { laji: 'koodi', teksti: 'print("hei")', kieli: 'python' }, { laji: 'teksti', teksti: 'Loppu' }]);
  assert.equal(osatTekstiksi(vastauksenOsat(s)), 'Otsikko\nkappale\n\n```python\nprint("hei")\n```\n\nLoppu');
});

test('liitaAlkuun: ylempi ruudullinen alkuun päällekkäisyyden kohdalta; kieli täydentyy', () => {
  const k = { laji: 'koodi', teksti: 'x = 1', kieli: '' };
  const alempi = [k, { laji: 'teksti', teksti: 'C' }];
  const ylempi = [{ laji: 'teksti', teksti: 'A' }, { laji: 'teksti', teksti: 'B' }, { ...k, kieli: 'python' }];
  assert.deepEqual(liitaAlkuun(liitaAlkuun([], alempi), ylempi).map((o) => o.teksti), ['A', 'B', 'x = 1', 'C']);
  assert.equal(liitaAlkuun(alempi, ylempi)[2].kieli, 'python');
  // Sama korkea osa ruudullisesta toiseen: ei kaksoiskappaletta.
  assert.deepEqual(liitaAlkuun([{ laji: 'teksti', teksti: 'A' }], [{ laji: 'teksti', teksti: 'A' }]), [{ laji: 'teksti', teksti: 'A' }]);
  assert.ok(samaViesti('a  b\n c', 'a b c')); assert.ok(!samaViesti('', ''));
});

test('kysyGeminilta: teksti jakointentillä, vastaus kun generointi on loppunut ja ruutu vakaa', async () => {
  const ui = VASTAUS(solmu('assistant_robin_user_message_text', 'Sano hei', 300, 400), solmu('assistant_robin_text', 'Hei!', 500, 600),
    '<node text="" resource-id="" class="V" content-desc="Send" clickable="true" bounds="[1181,1132][1279,1230]" />');
  const v = vaarennos({ ui });
  const a = luoAndroid({ aja: v.aja, odota });
  const palat = [];
  const r = await a.kysyGeminilta({ teksti: 'Sano hei', pala: (p) => palat.push(p), vali: 0 });
  assert.deepEqual(r, { vastaus: 'Hei!' });
  assert.deepEqual(palat, ['Hei!']);
  assert.ok(v.rivit.some((x) => x.startsWith('am start -a android.intent.action.SEND') && x.includes("'Sano hei'")));
  // Kuiva: ei lähetystä eikä vastausta.
  const k = luoAndroid({ aja: vaarennos({ ui }).aja, odota, kuiva: true });
  assert.deepEqual(await k.kysyGeminilta({ teksti: 'x' }), { vastaus: '', kuiva: true });
  a.lopeta(); k.lopeta();
});
