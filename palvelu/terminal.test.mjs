// scopes/palvelu/terminal.test.mjs - Etäterminaalin palvelinpään kattavat yksikkö- ja integraatiotestit
// (REMOTETERMINAL-PALVELU 27.10.2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { EventEmitter } from 'node:events';
import {
  encodeFrame,
  decodeFrame,
  buildTmuxCommand,
  WsConnection,
  TerminalSession,
  luoTerminaali
} from './terminal.mjs';
import { kasittelija } from './palvelin.mjs';

const TEST_AVAIN = 'scopes_salainen_testiavain_1234567890_abcdef';

// Valeprosessi testeille
function luoValeprosessi() {
  const ee = new EventEmitter();
  const kirjoitetut = [];
  let koot = null;
  let tapettuSignaali = null;

  return {
    kirjoitetut,
    get koot() { return koot; },
    get tapettuSignaali() { return tapettuSignaali; },
    proc: {
      pid: 12345,
      write(data) {
        kirjoitetut.push(data);
      },
      resize(cols, rows) {
        koot = { cols, rows };
      },
      kill(sig) {
        tapettuSignaali = sig;
      },
      onData(cb) {
        ee.on('data', cb);
      },
      onExit(cb) {
        ee.on('exit', cb);
      },
      syotaTuloste(teksti) {
        ee.emit('data', teksti);
      },
      paata(exitCode = 0, signal = null) {
        ee.emit('exit', { exitCode, signal });
      }
    }
  };
}

// 1. Kehysprotokollan testit
test('Wire framing: data-kehys ("0") koodautuu ja purkautuu', () => {
  const payload = 'echo "Tervehdys"\r\n';
  const encoded = encodeFrame('data', payload);
  assert.equal(encoded.startsWith('0'), true);

  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'data');
  assert.equal(decoded.payload, payload);
});

test('Wire framing: control-kehys ("1") koodautuu ja purkautuu', () => {
  const resizePayload = { type: 'resize', cols: 100, rows: 30 };
  const encoded = encodeFrame('control', resizePayload);
  assert.equal(encoded.startsWith('1'), true);

  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'control');
  assert.deepEqual(decoded.payload, resizePayload);
});

test('Wire framing: heartbeat ("2") koodautuu ja purkautuu', () => {
  const encoded = encodeFrame('ping');
  assert.equal(encoded, '2');

  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'ping');
});

test('Wire framing: virheelliset kehykset hylätään', () => {
  assert.throws(() => decodeFrame(''), /Tyhjä kehys/);
  assert.throws(() => decodeFrame('5tuntematon'), /Tuntematon kanavatunnus/);
  assert.throws(() => decodeFrame('1{rikki-json'), /Virheellinen JSON/);
});

// 2. Tmux-komentoluonti
test('Tmux-komennon muodostus eri parametreilla', () => {
  const c1 = buildTmuxCommand({ sessionName: 'shell-1' });
  assert.deepEqual(c1.args, ['new-session', '-A', '-s', 'shell-1']);

  const c2 = buildTmuxCommand({ sessionName: 'tyo', cwd: '/tmp/polku', command: '/bin/bash' });
  assert.deepEqual(c2.args, ['new-session', '-A', '-s', 'tyo', '-c', '/tmp/polku', '/bin/bash']);
});

// 3. TerminalSession -yksikkötestit
test('TerminalSession: luonti, syöte, koonmuutos, rengaspuskuri ja ulostulo', () => {
  const vale = luoValeprosessi();
  const session = new TerminalSession({
    id: 't-1',
    name: 'testi',
    cols: 80,
    rows: 24,
    spawnProcess: () => vale.proc
  });

  // Tarkista peruskentät
  assert.equal(session.id, 't-1');
  assert.equal(session.name, 'testi');
  assert.equal(session.cols, 80);
  assert.equal(session.rows, 24);

  // Tuloste menee rengaspuskuriin
  session.handleData('Rivi 1\r\n');
  assert.equal(session.ringBuffer, 'Rivi 1\r\n');

  // Syöte menee prosessille
  session.write('ls\n');
  assert.deepEqual(vale.kirjoitetut, ['ls\n']);

  // Koonmuutos
  session.resize(120, 40);
  assert.equal(session.cols, 120);
  assert.equal(session.rows, 40);
  assert.deepEqual(vale.koot, { cols: 120, rows: 40 });

  // Signaali
  session.kill('SIGINT');
  assert.equal(vale.tapettuSignaali, 'SIGINT');
});

// 4. luoTerminaali -hallintametodit (CRUD)
test('luoTerminaali: istuntojen luonti, haku, listaus ja sulkeminen', async () => {
  const tmuxKutsut = [];
  const valeprosessit = [];
  const aja = (komento, args) => {
    tmuxKutsut.push([komento, ...args]);
    if (args[0] === 'list-sessions') {
      return Promise.resolve({ koodi: 0, stdout: 'ulkoinen-tmux-1\nulkoinen-tmux-2\n' });
    }
    if (args[0] === 'kill-session') {
      return Promise.resolve({ koodi: 0, stdout: '' });
    }
    return Promise.resolve({ koodi: 0, stdout: '' });
  };

  const spawnProcess = () => {
    const v = luoValeprosessi();
    valeprosessit.push(v);
    return v.proc;
  };

  const mgr = luoTerminaali({ juuri: '/app' }, { spawnProcess, aja });

  // 1. Luodaan istunto
  const luotu = await mgr.luoIstunto({
    name: 'oma-term',
    cols: 100,
    rows: 30,
    tmuxSession: 'scopes-oma-term'
  });
  assert.ok(luotu.id);
  assert.equal(luotu.name, 'oma-term');
  assert.equal(luotu.tmuxSession, 'scopes-oma-term');
  assert.equal(luotu.cols, 100);
  assert.equal(luotu.rows, 30);
  assert.equal(luotu.wsPath, `/api/terminal/ws?istunto=${encodeURIComponent(luotu.id)}`);

  // 2. Haetaan istunto id:llä
  const haettu = await mgr.haeIstunto(luotu.id);
  assert.equal(haettu.id, luotu.id);
  assert.equal(haettu.name, 'oma-term');
  assert.equal(haettu.pid, 12345);

  // 3. Haetaan istunto tmuxSession-nimellä
  const haettuTmux = await mgr.haeIstunto('scopes-oma-term');
  assert.equal(haettuTmux.id, luotu.id);

  // 4. Listataan istunnot (sisältää aktiivisen ja tmux-istunnot)
  const lista = await mgr.listaaIstunnot();
  assert.ok(lista.some((s) => s.id === luotu.id));
  assert.ok(lista.some((s) => s.tmuxSession === 'ulkoinen-tmux-1'));

  // 5. Suljetaan istunto ja tapetaan tmux
  const suljettu = await mgr.suljeIstunto(luotu.id, { killTmux: true });
  assert.equal(suljettu.ok, true);
  assert.equal(suljettu.closed, luotu.id);
  assert.equal(suljettu.tmuxKilled, true);

  // Varmistetaan että istuntoa ei enää löydy
  const eiLoydy = await mgr.haeIstunto(luotu.id);
  assert.equal(eiLoydy, null);
});

// 5. WebSocket- ja HTTP Upgrade -integraatiotestit
test('WebSocket Upgrade: Bearer-autentikointi, RFC 6455 -kättely ja kanavointi', async () => {
  let valeprosessi = null;
  const mgr = luoTerminaali(
    { juuri: '/testi', avain: TEST_AVAIN },
    {
      spawnProcess: () => {
        valeprosessi = luoValeprosessi();
        return valeprosessi.proc;
      }
    }
  );

  const server = createServer((req, res) => {
    res.writeHead(404);
    res.end();
  });
  mgr.asennaWsUpgrade(server, { avain: TEST_AVAIN });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 5.1. Yhteys ilman avainta hylätään (401)
    await assert.rejects(async () => {
      await new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://127.0.0.1:${port}/api/terminal/ws`);
        ws.onopen = () => { ws.close(); resolve(); };
        ws.onerror = (err) => reject(err);
      });
    });

    // 5.2. Yhteys URL-tokenilla onnistuu
    const viestit = [];
    const ws = new WebSocket(`ws://127.0.0.1:${port}/api/terminal/ws?token=${TEST_AVAIN}&cols=90&rows=25`);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    ws.onmessage = (event) => {
      viestit.push(event.data);
    };

    // Odotetaan että ready-viesti tulee kanavalla '1'
    await new Promise((r) => setTimeout(r, 50));
    assert.ok(viestit.length >= 1);
    const readyFrame = decodeFrame(viestit[0]);
    assert.equal(readyFrame.type, 'control');
    assert.equal(readyFrame.payload.type, 'ready');
    assert.equal(readyFrame.payload.cols, 90);
    assert.equal(readyFrame.payload.rows, 25);

    // 5.3. Asiakas lähettää dataa kanavalla '0'
    ws.send(encodeFrame('data', 'uname -a\r'));
    await new Promise((r) => setTimeout(r, 30));
    assert.ok(valeprosessi.kirjoitetut.includes('uname -a\r'));

    // 5.4. Palvelin lähettää tulostetta prosessista -> asiakas saa kanavalla '0'
    valeprosessi.proc.syotaTuloste('Linux scopes-node 6.8.0\r\n');
    await new Promise((r) => setTimeout(r, 30));
    const dataFrame = viestit.map(decodeFrame).find((f) => f.type === 'data' && f.payload.includes('scopes-node'));
    assert.ok(dataFrame, 'Tulostekehys vastaanotettu asiakkaalla');

    // 5.5. Heartbeat ping ('2') -> palvelin vastaa '2'
    ws.send('2');
    await new Promise((r) => setTimeout(r, 30));
    const pongFrame = viestit.find((m) => m === '2');
    assert.ok(pongFrame, 'Heartbeat pong vastaanotettu');

    // 5.6. Koonmuutosviesti ('1' resize)
    ws.send(encodeFrame('control', { type: 'resize', cols: 110, rows: 35 }));
    await new Promise((r) => setTimeout(r, 30));
    assert.deepEqual(valeprosessi.koot, { cols: 110, rows: 35 });

    // 5.7. Signaaliviesti ('1' signal)
    ws.send(encodeFrame('control', { type: 'signal', signal: 'SIGTERM' }));
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(valeprosessi.tapettuSignaali, 'SIGTERM');

    // 5.8. Prosessin päättyminen ('1' exit)
    valeprosessi.proc.paata(0, null);
    await new Promise((r) => setTimeout(r, 30));
    const exitFrame = viestit.map(decodeFrame).find((f) => f.type === 'control' && f.payload.type === 'exit');
    assert.ok(exitFrame, 'Exit-kehys vastaanotettu asiakkaalla');
    assert.equal(exitFrame.payload.exitCode, 0);

    ws.close();
  } finally {
    server.close();
  }
});

// 6. REST API -reitit palvelin.mjs:n kautta
test('REST API: GET, POST ja DELETE /api/terminal/sessions', async () => {
  const asetukset = { avain: TEST_AVAIN, juuri: '/app' };
  const terminal = luoTerminaali(asetukset, {
    spawnProcess: () => luoValeprosessi().proc
  });

  const app = kasittelija(
    asetukset,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    terminal
  );

  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  async function pyynto(polku, method = 'GET', body = null) {
    const res = await fetch(`http://127.0.0.1:${port}${polku}`, {
      method,
      headers: {
        'Authorization': `Bearer ${TEST_AVAIN}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  }

  try {
    // 6.1. Alkuperäinen listaus on tyhjä
    const l1 = await pyynto('/api/terminal/sessions');
    assert.equal(l1.status, 200);
    assert.equal(l1.json.ok, true);
    assert.deepEqual(l1.json.sessions, []);

    // 6.2. Uuden istunnon luonti (POST)
    const luoRes = await pyynto('/api/terminal/sessions', 'POST', {
      name: 'kehitysterminaali',
      cols: 120,
      rows: 36,
      tmuxSession: 'scopes-kehitys'
    });
    assert.equal(luoRes.status, 201);
    assert.equal(luoRes.json.ok, true);
    const sid = luoRes.json.session.id;
    assert.ok(sid);
    assert.equal(luoRes.json.session.name, 'kehitysterminaali');
    assert.equal(luoRes.json.session.tmuxSession, 'scopes-kehitys');

    // 6.3. Yhden istunnon haku (GET /:id)
    const haeRes = await pyynto(`/api/terminal/sessions/${sid}`);
    assert.equal(haeRes.status, 200);
    assert.equal(haeRes.json.ok, true);
    assert.equal(haeRes.json.session.id, sid);
    assert.equal(haeRes.json.session.cols, 120);

    // 6.4. Tuntematon istunto palauttaa 404
    const eiOle = await pyynto('/api/terminal/sessions/tuntematon-id');
    assert.equal(eiOle.status, 404);
    assert.equal(eiOle.json.ok, false);

    // 6.5. Istunnon poisto (DELETE /:id)
    const delRes = await pyynto(`/api/terminal/sessions/${sid}`, 'DELETE');
    assert.equal(delRes.status, 200);
    assert.equal(delRes.json.ok, true);
    assert.equal(delRes.json.closed, sid);

    // 6.6. Varmistetaan että poiston jälkeen palautuu 404
    const haeDelRes = await pyynto(`/api/terminal/sessions/${sid}`);
    assert.equal(haeDelRes.status, 404);
  } finally {
    server.close();
  }
});
