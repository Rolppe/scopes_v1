// node --test scopes/palvelu/palvelin.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HERATA, jarjestelma, luoLinuxServer } from './linux-server.mjs';
import { kasittelija } from './palvelin.mjs';
import { Hylatty } from './toiminnot.mjs';

const PING_LINUX = { koodi: 0, stdout: '64 bytes from 192.0.2.99: icmp_seq=1 ttl=64 time=1.7 ms\n', stderr: '' };
const PING_WINDOWS = { koodi: 0, stdout: '64 bytes from 192.0.2.99: icmp_seq=1 ttl=128 time=1.1 ms\n', stderr: '' };
const EI_VASTAA = { koodi: 1, stdout: '', stderr: '' };
const OK = { koodi: 0, stdout: '', stderr: '' };

// ping-vastaus osoitteittain; muut komennot vastauksista avaimella 'ohjelma ensimmäinen-ei-optio-argumentti'.
function vaarennos({ ping = {}, vastaukset = {} } = {}) {
  const kutsut = [];
  const aja = async (komento, argumentit) => {
    kutsut.push([komento, ...argumentit]);
    if (komento === 'ping') return ping[argumentit.at(-1)] ?? EI_VASTAA;
    const avain = komento === 'python3' ? 'herata' : argumentit.at(-1);
    return vastaukset[avain] ?? OK;
  };
  return { aja, kutsut, ajetut: () => kutsut.filter(([k]) => k !== 'ping') };
}

const hylkaa = async (lupaus, koodi, sana) => assert.rejects(lupaus, (e) => e instanceof Hylatty && e.koodi === koodi && (!sana || e.message.includes(sana)));

test('jarjestelma: TTL 64 = linux, yli 64 = windows, ei vastausta = null', () => {
  assert.equal(jarjestelma(PING_LINUX), 'linux');
  assert.equal(jarjestelma(PING_WINDOWS), 'windows');
  assert.equal(jarjestelma(EI_VASTAA), null);
});

test('tila: ensimmäinen vastaava osoite, WiFi-Windows .11:ssä, muuten sammuksissa', async () => {
  assert.deepEqual(await luoLinuxServer({ aja: vaarennos({ ping: { '192.0.2.99': PING_LINUX } }).aja }).tila(), { tila: 'linux', osoite: '192.0.2.99' });
  assert.deepEqual(await luoLinuxServer({ aja: vaarennos({ ping: { '192.0.2.99': PING_WINDOWS } }).aja }).tila(), { tila: 'windows', osoite: '192.0.2.99' });
  assert.deepEqual(await luoLinuxServer({ aja: vaarennos().aja }).tila(), { tila: 'sammuksissa' });
});

test('käynnistä: Linux jo päällä → ei komentoja', async () => {
  const v = vaarennos({ ping: { '192.0.2.99': PING_LINUX } });
  assert.equal((await luoLinuxServer({ aja: v.aja }).suorita('kaynnista')).tila, 'linux');
  assert.deepEqual(v.ajetut(), []);
});

test('käynnistä: Windows päällä → vain kertaboot Linuxiin', async () => {
  const v = vaarennos({ ping: { '192.0.2.99': PING_WINDOWS } });
  const t = await luoLinuxServer({ aja: v.aja }).suorita('kaynnista');
  assert.deepEqual([t.tila, t.lahto], ['vaihtaa', 'windows']);
  assert.deepEqual(v.ajetut(), [['ssh', '-o', 'ConnectTimeout=5', '-o', 'BatchMode=yes', 'pc', 'linux']]);
});

test('käynnistä: sammuksissa → WoL; Linux nousee suoraan tai Windows vaihdetaan Linuxiin', async () => {
  const linux = vaarennos({ vastaukset: { herata: { koodi: 0, stdout: 'WoL lähetetty …\nLinux vastaa (192.0.2.99) 40 s herätyksestä\n', stderr: '' } } });
  const t = await luoLinuxServer({ aja: linux.aja, odota: 90 }).suorita('kaynnista');
  assert.deepEqual([t.tila, t.lahto, t.viesti], ['linux', 'sammuksissa', 'Linux vastaa (192.0.2.99) 40 s herätyksestä']);
  assert.deepEqual(linux.ajetut(), [['python3', HERATA, '--odota', '90']]);

  const win = vaarennos({ vastaukset: { herata: { koodi: 0, stdout: 'WoL lähetetty …\nWindows vastaa (192.0.2.99) 36 s herätyksestä\n', stderr: '' } } });
  assert.equal((await luoLinuxServer({ aja: win.aja }).suorita('kaynnista')).tila, 'vaihtaa');
  assert.deepEqual(win.ajetut().map((k) => k.at(-1)), ['90', 'linux']);
});

test('käynnistä: herätys ei vastaa → 504, kertaboot epäonnistuu → 502', async () => {
  await hylkaa(luoLinuxServer({ aja: vaarennos({ vastaukset: { herata: { koodi: 1, stdout: '', stderr: 'PC ei vastannut' } } }).aja }).suorita('kaynnista'), 504);
  const v = vaarennos({ ping: { '192.0.2.99': PING_WINDOWS }, vastaukset: { linux: { koodi: 255, stdout: '', stderr: 'ssh: connect to host 192.0.2.99 port 22: Connection timed out' } } });
  await hylkaa(luoLinuxServer({ aja: v.aja }).suorita('kaynnista'), 502, 'timed out');
});

test('sammuta: vain Linuxin ollessa päällä; Windows ja sammuksissa → 409 ilman komentoja', async () => {
  const v = vaarennos({ ping: { '192.0.2.99': PING_LINUX } });
  assert.equal((await luoLinuxServer({ aja: v.aja }).suorita('sammuta')).tila, 'sammuu');
  assert.deepEqual(v.ajetut(), [['ssh', '-o', 'ConnectTimeout=5', '-o', 'BatchMode=yes', 'palvelin', 'sudo -n /usr/sbin/poweroff']]);

  const w = vaarennos({ ping: { '192.0.2.99': PING_WINDOWS } });
  await hylkaa(luoLinuxServer({ aja: w.aja }).suorita('sammuta'), 409, 'Windows');
  const s = vaarennos();
  await hylkaa(luoLinuxServer({ aja: s.aja }).suorita('sammuta'), 409, 'sammuksissa');
  assert.deepEqual([...w.ajetut(), ...s.ajetut()], []);
});

test('sammuta: yhteyden katkeaminen (255) on onnistuminen, tunnistusvirhe ei', async () => {
  const katkesi = vaarennos({ ping: { '192.0.2.99': PING_LINUX }, vastaukset: { 'sudo -n /usr/sbin/poweroff': { koodi: 255, stdout: '', stderr: 'Connection to 192.0.2.99 closed by remote host.' } } });
  assert.equal((await luoLinuxServer({ aja: katkesi.aja }).suorita('sammuta')).tila, 'sammuu');
  const kielto = vaarennos({ ping: { '192.0.2.99': PING_LINUX }, vastaukset: { 'sudo -n /usr/sbin/poweroff': { koodi: 255, stdout: '', stderr: 'mikko@192.0.2.99: Permission denied (publickey).' } } });
  await hylkaa(luoLinuxServer({ aja: kielto.aja }).suorita('sammuta'), 502, 'Permission denied');
  const sudo = vaarennos({ ping: { '192.0.2.99': PING_LINUX }, vastaukset: { 'sudo -n /usr/sbin/poweroff': { koodi: 1, stdout: '', stderr: 'sudo: a password is required' } } });
  await hylkaa(luoLinuxServer({ aja: sudo.aja }).suorita('sammuta'), 502, 'password');
});

test('kuiva: tila luetaan, mutta komentoja ei ajeta; vastaus nimeää komennon', async () => {
  const v = vaarennos({ ping: { '192.0.2.99': PING_LINUX } });
  const t = await luoLinuxServer({ aja: v.aja, kuiva: true }).suorita('sammuta');
  assert.equal(t.kuiva, 'ssh -o ConnectTimeout=5 -o BatchMode=yes palvelin sudo -n /usr/sbin/poweroff');
  const s = vaarennos();
  assert.match((await luoLinuxServer({ aja: s.aja, kuiva: true }).suorita('kaynnista')).kuiva, /herata-pc\.py --odota 90$/);
  assert.deepEqual([...v.ajetut(), ...s.ajetut()], []);
});

test('yksi kerrallaan: rinnakkainen painallus → 429, tuntematon → 404; loki kirjaa molemmat', async () => {
  let vapauta;
  const pito = new Promise((r) => { vapauta = r; });
  const aja = async (komento, argumentit) => (komento === 'ping' ? EI_VASTAA : (await pito, { koodi: 0, stdout: 'Linux vastaa (x) 1 s\n', stderr: '' }));
  const loki = join(mkdtempSync(join(tmpdir(), 'scopes-ls-')), 'loki/t.loki');
  const l = luoLinuxServer({ aja, loki });
  const eka = l.suorita('kaynnista');
  await new Promise((r) => setImmediate(r));
  await hylkaa(l.suorita('sammuta'), 429);
  vapauta();
  assert.equal((await eka).tila, 'linux');
  await hylkaa(l.suorita('rm'), 404);
  const rivit = readFileSync(loki, 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(rivit.map((r) => [r.toiminto, r.tulos]), [['palvelin sammuta', 'hylätty'], ['palvelin kaynnista', 'ok'], ['palvelin rm', 'hylätty']]);
});

test('palvelin: GET /api/palvelin ja POST kaynnista|sammuta vaativat avaimen; muu polku 404', async () => {
  const avain = 'k'.repeat(32);
  const v = vaarennos({ ping: { '192.0.2.99': PING_LINUX } });
  const linux = luoLinuxServer({ aja: v.aja });
  const srv = createServer(kasittelija({ juuri: tmpdir(), avain }, async () => ({}), undefined, undefined, undefined, undefined, undefined, undefined, undefined, linux)).listen(0, '127.0.0.1');
  await new Promise((r) => srv.once('listening', r));
  const laheta = (polku, method = 'GET', kayttoavain = avain) => new Promise((ok, ei) => {
    const req = request({ host: '127.0.0.1', port: srv.address().port, path: polku, method, headers: { authorization: `Bearer ${kayttoavain}` } }, (res) => {
      let b = ''; res.on('data', (c) => { b += c; }); res.on('end', () => ok([res.statusCode, JSON.parse(b)]));
    });
    req.on('error', ei); req.end();
  });
  try {
    assert.deepEqual(await laheta('/api/palvelin'), [200, { tila: 'linux', osoite: '192.0.2.99' }]);
    assert.equal((await laheta('/api/palvelin/kaynnista', 'POST'))[1].viesti, 'palvelin on jo päällä');
    assert.equal((await laheta('/api/palvelin/sammuta', 'POST'))[1].tila, 'sammuu');
    assert.equal((await laheta('/api/palvelin/uudelleen', 'POST'))[0], 404);
    assert.equal((await laheta('/api/palvelin/sammuta', 'POST', 'v'.repeat(32)))[0], 401);
    assert.equal((await laheta('/api/palvelin', 'GET', 'v'.repeat(32)))[0], 401);
    assert.equal(v.ajetut().length, 1);
  } finally { srv.close(); }
});
