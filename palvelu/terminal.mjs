#!/usr/bin/env node
// scopes/palvelu/terminal.mjs - Etäterminaalin (Remote Terminal) palvelinpää:
// WebSocket-, PTY- ja tmux-istuntohallinta (REMOTETERMINAL-PALVELU 27.10.2026).
// Toteuttaa RFC 6455 -mukaisen WebSocket-palvelimen, Bearer-autentikoinnin,
// 1-tavuisen kehysprotokollan ('0' data, '1' ohjaus, '2' heartbeat) ja REST-rajapinnat.

import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import { avainKelpaa } from './palvelin.mjs';
import { Hylatty } from './toiminnot.mjs';

// 1. Kehysprotokolla (Wire framing)
export function encodeFrame(type, payload) {
  if (type === 'data') {
    return '0' + (typeof payload === 'string' ? payload : (payload ? payload.toString('utf8') : ''));
  }
  if (type === 'control') {
    return '1' + JSON.stringify(payload);
  }
  if (type === 'ping') {
    return '2';
  }
  throw new Error(`Tuntematon kehystyyppi: ${type}`);
}

export function decodeFrame(raw) {
  if (typeof raw !== 'string') {
    raw = raw.toString('utf8');
  }
  if (raw.length === 0) {
    throw new Error('Tyhjä kehys');
  }
  const channel = raw[0];
  const payload = raw.slice(1);

  if (channel === '0') {
    return { type: 'data', payload };
  }
  if (channel === '1') {
    try {
      const json = JSON.parse(payload);
      return { type: 'control', payload: json };
    } catch (e) {
      throw new Error(`Virheellinen JSON ohjauskehyksessä: ${e.message}`);
    }
  }
  if (channel === '2') {
    return { type: 'ping', payload: null };
  }
  throw new Error(`Tuntematon kanavatunnus: ${channel}`);
}

export function buildTmuxCommand({ sessionName, cwd, command }) {
  const args = ['new-session', '-A', '-s', sessionName];
  if (cwd) {
    args.push('-c', cwd);
  }
  if (command) {
    args.push(command);
  }
  return { binary: 'tmux', args };
}

// 2. RFC 6455 WebSocket Connection Wrapper
export class WsConnection extends EventEmitter {
  constructor(socket, head = null) {
    super();
    this.socket = socket;
    this.puskuri = head && head.length ? Buffer.from(head) : Buffer.alloc(0);
    this.suljettu = false;

    socket.on('data', (chunk) => this._onData(chunk));
    socket.on('close', () => this._onClose());
    socket.on('error', (err) => {
      this.emit('error', err);
      this._onClose();
    });

    if (this.puskuri.length > 0) {
      this._parse();
    }
  }

  send(payload, opcode = 0x1) {
    if (this.suljettu || this.socket.destroyed || !this.socket.writable) return;
    const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload ?? '', 'utf8');
    const len = data.length;
    let header;

    if (len < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = len;
    } else if (len <= 0xffff) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(len), 2);
    }

    try {
      this.socket.write(Buffer.concat([header, data]));
    } catch (e) {
      this._onClose();
    }
  }

  close() {
    if (!this.suljettu) {
      this.suljettu = true;
      try {
        this.send(Buffer.alloc(0), 0x8);
      } catch {}
      this.socket.end();
    }
    this.emit('close');
  }

  _onClose() {
    if (!this.suljettu) {
      this.suljettu = true;
      this.emit('close');
    }
  }

  _onData(chunk) {
    this.puskuri = Buffer.concat([this.puskuri, chunk]);
    this._parse();
  }

  _parse() {
    while (this.puskuri.length >= 2) {
      const b0 = this.puskuri[0];
      const b1 = this.puskuri[1];
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let offset = 2;

      if (len === 126) {
        if (this.puskuri.length < offset + 2) break;
        len = this.puskuri.readUInt16BE(offset);
        offset += 2;
      } else if (len === 127) {
        if (this.puskuri.length < offset + 8) break;
        len = Number(this.puskuri.readBigUInt64BE(offset));
        offset += 8;
      }

      let mask = null;
      if (masked) {
        if (this.puskuri.length < offset + 4) break;
        mask = this.puskuri.subarray(offset, offset + 4);
        offset += 4;
      }

      if (this.puskuri.length < offset + len) break;

      const rawPayload = this.puskuri.subarray(offset, offset + len);
      const payload = Buffer.from(rawPayload);
      this.puskuri = this.puskuri.subarray(offset + len);

      if (masked && mask) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i % 4];
        }
      }

      if (opcode === 0x8) {
        this.close();
        break;
      } else if (opcode === 0x9) {
        // Ping -> Pong
        this.send(payload, 0x0a);
      } else if (opcode === 0x0a) {
        this.emit('pong', payload);
      } else if (opcode === 0x1 || opcode === 0x2) {
        const text = payload.toString('utf8');
        this.emit('message', text, payload);
      }
    }
  }
}

// 3. Prosessien käynnistys ja PTY-abstraktio
export function defaultSpawn({ command, args = [], cwd, env = {}, cols = 80, rows = 24, tmuxSession, useTmux }) {
  let cmd = command;
  let finalArgs = args;
  if (useTmux && tmuxSession) {
    const tmuxCmd = buildTmuxCommand({ sessionName: tmuxSession, cwd, command });
    cmd = tmuxCmd.binary;
    finalArgs = tmuxCmd.args;
  }

  const proc = spawn(cmd, finalArgs, {
    cwd: cwd || process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color', ...env },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    pid: proc.pid,
    write(data) {
      if (proc.stdin && !proc.stdin.destroyed) {
        proc.stdin.write(data);
      }
    },
    resize(_cols, _rows) {
      try {
        proc.kill('SIGWINCH');
      } catch {}
    },
    kill(sig = 'SIGTERM') {
      try {
        proc.kill(sig);
      } catch {}
    },
    onData(cb) {
      if (proc.stdout) proc.stdout.on('data', (d) => cb(d.toString('utf8')));
      if (proc.stderr) proc.stderr.on('data', (d) => cb(d.toString('utf8')));
    },
    onExit(cb) {
      proc.on('exit', (code, signal) => cb({ exitCode: code, signal }));
    }
  };
}

// 4. Terminaali-istunto (TerminalSession)
export class TerminalSession {
  constructor({ id, name, type = 'tmux', tmuxSession = null, command, args = [], cwd, cols = 80, rows = 24, env = {}, spawnProcess = defaultSpawn }) {
    this.id = id;
    this.name = name || 'terminal';
    this.type = type;
    this.tmuxSession = tmuxSession;
    this.command = command || process.env.SHELL || '/bin/zsh';
    this.args = args;
    this.cwd = cwd;
    this.cols = cols;
    this.rows = rows;
    this.createdAt = new Date().toISOString();
    this.lastActiveAt = this.createdAt;
    this.attachedClients = new Set();
    this.ringBuffer = '';

    this.proc = spawnProcess({
      id: this.id,
      name: this.name,
      command: this.command,
      args: this.args,
      cwd: this.cwd,
      cols: this.cols,
      rows: this.rows,
      env,
      tmuxSession: this.tmuxSession,
      useTmux: this.type === 'tmux'
    });

    if (this.proc?.onData) {
      this.proc.onData((data) => this.handleData(data));
    }
    if (this.proc?.onExit) {
      this.proc.onExit(({ exitCode, signal }) => this.handleExit(exitCode, signal));
    }
  }

  attach(wsConn) {
    this.attachedClients.add(wsConn);
    this.lastActiveAt = new Date().toISOString();

    wsConn.send(encodeFrame('control', {
      type: 'ready',
      sessionId: this.id,
      tmuxSession: this.tmuxSession,
      cols: this.cols,
      rows: this.rows
    }));

    if (this.ringBuffer.length > 0) {
      wsConn.send(encodeFrame('data', this.ringBuffer));
    }

    const onMessage = (msg) => this.handleMessage(msg, wsConn);
    const onClose = () => {
      this.detach(wsConn);
      wsConn.removeListener('message', onMessage);
      wsConn.removeListener('close', onClose);
    };

    wsConn.on('message', onMessage);
    wsConn.on('close', onClose);
  }

  detach(wsConn) {
    this.attachedClients.delete(wsConn);
    this.lastActiveAt = new Date().toISOString();
  }

  handleData(data) {
    this.lastActiveAt = new Date().toISOString();
    this.ringBuffer = (this.ringBuffer + data).slice(-65536);
    const frame = encodeFrame('data', data);
    for (const client of this.attachedClients) {
      try {
        client.send(frame);
      } catch {}
    }
  }

  handleExit(exitCode, signal) {
    const frame = encodeFrame('control', { type: 'exit', exitCode, signal });
    for (const client of this.attachedClients) {
      try {
        client.send(frame);
      } catch {}
    }
  }

  handleMessage(msg, wsConn) {
    if (msg === '2') {
      wsConn.send('2');
      return;
    }
    if (msg.startsWith('0')) {
      const payload = msg.slice(1);
      this.write(payload);
      return;
    }
    if (msg.startsWith('1')) {
      try {
        const ctrl = JSON.parse(msg.slice(1));
        if (ctrl.type === 'resize') {
          this.resize(ctrl.cols, ctrl.rows);
        } else if (ctrl.type === 'signal') {
          this.kill(ctrl.signal || 'SIGINT');
        }
      } catch (err) {
        wsConn.send(encodeFrame('control', { type: 'error', message: `Virheellinen ohjausviesti: ${err.message}` }));
      }
    }
  }

  write(data) {
    this.lastActiveAt = new Date().toISOString();
    this.proc?.write?.(data);
  }

  resize(cols, rows) {
    this.cols = Math.max(20, Math.min(500, Number(cols) || 80));
    this.rows = Math.max(5, Math.min(200, Number(rows) || 24));
    this.lastActiveAt = new Date().toISOString();
    this.proc?.resize?.(this.cols, this.rows);
  }

  kill(signal = 'SIGTERM') {
    this.proc?.kill?.(signal);
  }

  close() {
    for (const client of this.attachedClients) {
      try {
        client.close();
      } catch {}
    }
    this.attachedClients.clear();
    this.proc?.kill?.('SIGHUP');
  }
}

// 5. Terminaalihallinta (Manager Factory)
export function luoTerminaali(asetukset = {}, { spawnProcess = defaultSpawn, aja = null } = {}) {
  const sessions = new Map();

  async function listaaIstunnot() {
    const tulos = [];
    for (const s of sessions.values()) {
      tulos.push({
        id: s.id,
        name: s.name,
        type: s.type,
        tmuxSession: s.tmuxSession,
        command: s.command,
        cwd: s.cwd,
        cols: s.cols,
        rows: s.rows,
        attachedClients: s.attachedClients.size,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt
      });
    }

    if (aja) {
      try {
        const r = await aja('tmux', ['list-sessions', '-F', '#{session_name}']);
        if (r.koodi === 0 && r.stdout) {
          const tmuxNimet = r.stdout.trim().split('\n').map((l) => l.trim()).filter(Boolean);
          const tunnetut = new Set(Array.from(sessions.values()).map((s) => s.tmuxSession).filter(Boolean));
          for (const tn of tmuxNimet) {
            if (!tunnetut.has(tn)) {
              tulos.push({
                id: `tmux-${tn}`,
                name: tn,
                type: 'tmux',
                tmuxSession: tn,
                command: null,
                cwd: null,
                cols: 80,
                rows: 24,
                attachedClients: 0,
                createdAt: null,
                lastActiveAt: null
              });
            }
          }
        }
      } catch {}
    }

    return tulos;
  }

  async function luoIstunto(options = {}) {
    const id = options.id || `term-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const name = options.name || 'terminal';
    const command = options.command || process.env.SHELL || '/bin/zsh';
    const args = Array.isArray(options.args) ? options.args : [];
    const cwd = options.cwd || asetukset.juuri || process.cwd();
    const cols = Math.max(20, Math.min(500, Number(options.cols) || 80));
    const rows = Math.max(5, Math.min(200, Number(options.rows) || 24));
    const tmuxSession = options.tmuxSession !== undefined ? options.tmuxSession : (options.type === 'process' ? null : `scopes-term-${id}`);

    const session = new TerminalSession({
      id,
      name,
      type: tmuxSession ? 'tmux' : 'process',
      tmuxSession,
      command,
      args,
      cwd,
      cols,
      rows,
      env: options.env || {},
      spawnProcess
    });

    sessions.set(id, session);
    return {
      id,
      name,
      tmuxSession,
      cols,
      rows,
      wsPath: `/api/terminal/ws?istunto=${encodeURIComponent(id)}`
    };
  }

  async function haeIstunto(id) {
    let s = sessions.get(id);
    if (!s) {
      for (const candidate of sessions.values()) {
        if (candidate.tmuxSession === id) {
          s = candidate;
          break;
        }
      }
    }
    if (!s) return null;
    return {
      id: s.id,
      name: s.name,
      type: s.type,
      tmuxSession: s.tmuxSession,
      command: s.command,
      cwd: s.cwd,
      cols: s.cols,
      rows: s.rows,
      attachedClients: s.attachedClients.size,
      pid: s.proc?.pid ?? null,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt
    };
  }

  async function suljeIstunto(id, { killTmux = false } = {}) {
    const s = sessions.get(id);
    if (!s) {
      throw new Hylatty(404, 'Istuntoa ei löydy');
    }
    s.close();
    sessions.delete(id);
    let tmuxKilled = false;
    if (killTmux && s.tmuxSession && aja) {
      try {
        const res = await aja('tmux', ['kill-session', '-t', s.tmuxSession]);
        tmuxKilled = res.koodi === 0;
      } catch {}
    }
    return {
      ok: true,
      closed: id,
      tmuxKilled
    };
  }

  function asennaWsUpgrade(server, asetuksetParam = asetukset) {
    server.on('upgrade', async (req, socket, head) => {
      const url = new URL(req.url, 'http://x');
      if (url.pathname !== '/api/terminal/ws') {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      const authOtsake = req.headers.authorization ??
        (url.searchParams.get('token') ? `Bearer ${url.searchParams.get('token')}` :
         url.searchParams.get('avain') ? `Bearer ${url.searchParams.get('avain')}` : '');

      const avain = asetuksetParam.avain ?? '';
      if (!avainKelpaa(authOtsake, avain)) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nContent-Type: application/json\r\n\r\n{"ok":false,"virhe":"avain puuttuu tai väärä"}\r\n');
        socket.destroy();
        return;
      }

      const secKey = req.headers['sec-websocket-key'];
      if (!secKey) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      const accept = crypto.createHash('sha1').update(secKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n` +
        '\r\n'
      );

      const istuntoTunnus = url.searchParams.get('istunto');
      const cols = Number(url.searchParams.get('cols')) || 80;
      const rows = Number(url.searchParams.get('rows')) || 24;

      let session = null;
      if (istuntoTunnus) {
        session = sessions.get(istuntoTunnus);
        if (!session) {
          for (const s of sessions.values()) {
            if (s.tmuxSession === istuntoTunnus) {
              session = s;
              break;
            }
          }
        }
        if (!session) {
          await luoIstunto({
            id: istuntoTunnus,
            name: istuntoTunnus,
            tmuxSession: istuntoTunnus,
            cols,
            rows
          });
          session = sessions.get(istuntoTunnus);
        }
      } else {
        const uusi = await luoIstunto({ cols, rows });
        session = sessions.get(uusi.id);
      }

      const wsConn = new WsConnection(socket, head);
      session.attach(wsConn);
    });
  }

  return {
    sessions,
    listaaIstunnot,
    luoIstunto,
    haeIstunto,
    suljeIstunto,
    asennaWsUpgrade
  };
}
