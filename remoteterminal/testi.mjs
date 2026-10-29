#!/usr/bin/env node
// scopes/remoteterminal/testi.mjs - Rajapintasopimuksen, kehysprotokollan ja Swift-komponenttien yksikkötestit
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Repon juuri tiedoston sijainnista (scopes/remoteterminal/ -> ../../), ei kovakoodattua ~/Projects-polkua.
const REPO_JUURI = path.resolve(__dirname, '../..');

// 1. Wire-kehysprotokollan logiikka
export function encodeFrame(type, payload) {
  if (type === 'data') {
    return '0' + (typeof payload === 'string' ? payload : payload.toString('utf8'));
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

// 2. Tmux-komentoluonti
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

// 3. Testit: Wire framing ja tmux
test('Wire framing: data-kehys koodautuu ja purkautuu', () => {
  const input = 'echo "Hei Scopes!"\r\n';
  const encoded = encodeFrame('data', input);
  assert.equal(encoded.startsWith('0'), true);
  
  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'data');
  assert.equal(decoded.payload, input);
});

test('Wire framing: control-kehys (resize) koodautuu ja purkautuu', () => {
  const control = { type: 'resize', cols: 120, rows: 36 };
  const encoded = encodeFrame('control', control);
  assert.equal(encoded.startsWith('1'), true);

  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'control');
  assert.deepEqual(decoded.payload, control);
});

test('Wire framing: control-kehys (signal) koodautuu ja purkautuu', () => {
  const control = { type: 'signal', signal: 'SIGINT' };
  const encoded = encodeFrame('control', control);
  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'control');
  assert.equal(decoded.payload.type, 'signal');
  assert.equal(decoded.payload.signal, 'SIGINT');
});

test('Wire framing: ping/pong-kehys koodautuu ja purkautuu', () => {
  const encoded = encodeFrame('ping');
  assert.equal(encoded, '2');

  const decoded = decodeFrame(encoded);
  assert.equal(decoded.type, 'ping');
});

test('Wire framing: virheellinen kehys heittää poikkeuksen', () => {
  assert.throws(() => decodeFrame(''), /Tyhjä kehys/);
  assert.throws(() => decodeFrame('9jotain'), /Tuntematon kanavatunnus/);
  assert.throws(() => decodeFrame('1{invalid-json'), /Virheellinen JSON/);
});

test('Tmux-komennon muodostus', () => {
  const cmd1 = buildTmuxCommand({ sessionName: 'scopes-shell' });
  assert.deepEqual(cmd1.args, ['new-session', '-A', '-s', 'scopes-shell']);

  const cmd2 = buildTmuxCommand({
    sessionName: 'kehitys',
    cwd: REPO_JUURI,
    command: '/bin/zsh'
  });
  assert.deepEqual(cmd2.args, [
    'new-session',
    '-A',
    '-s',
    'kehitys',
    '-c',
    REPO_JUURI,
    '/bin/zsh'
  ]);
});

// 4. Swift-komponenttien rakenne- ja rajapintatarkistukset (REMOTETERMINAL-SWIFTTERM)
test('Swift: Package.swift sisältää ScopesRemoteTerminal ja SwiftTerm-riippuvuuden', () => {
  const pkgPath = path.join(__dirname, 'Package.swift');
  assert.ok(fs.existsSync(pkgPath), 'Package.swift puuttuu');
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');

  assert.ok(pkgContent.includes('name: "ScopesRemoteTerminal"'), 'Paketin nimi ei ole ScopesRemoteTerminal');
  assert.ok(pkgContent.includes('SwiftTerm.git'), 'SwiftTerm-riippuvuus puuttuu Package.swiftistä');
  assert.ok(pkgContent.includes('.macOS(.v14)'), 'macOS v14 puuttuu alustoista');
  assert.ok(pkgContent.includes('.iOS(.v17)'), 'iOS v17 puuttuu alustoista');
});

test('Swift: Kaikki vaaditut lähdekooditiedostot löytyvät polusta Sources/ScopesRemoteTerminal/', () => {
  const srcDir = path.join(__dirname, 'Sources', 'ScopesRemoteTerminal');
  assert.ok(fs.existsSync(srcDir), 'Sources/ScopesRemoteTerminal -hakemisto puuttuu');

  const requiredFiles = [
    'TerminalModels.swift',
    'TerminalWireFrame.swift',
    'TerminalConnection.swift',
    'TerminalViewRepresentable.swift',
    'TerminalAccessoryBar.swift',
    'TerminalTheme.swift',
    'RemoteTerminalViewModel.swift',
    'TerminalSessionPickerView.swift',
    'RemoteTerminalView.swift'
  ];

  for (const f of requiredFiles) {
    const fPath = path.join(srcDir, f);
    assert.ok(fs.existsSync(fPath), `Tiedosto ${f} puuttuu hakemistosta ${srcDir}`);
    const stat = fs.statSync(fPath);
    assert.ok(stat.size > 200, `Tiedosto ${f} on liian lyhyt (${stat.size} tavua)`);
  }
});

test('Swift: Kaikki vaaditut testitiedostot löytyvät polusta Tests/ScopesRemoteTerminalTests/', () => {
  const testDir = path.join(__dirname, 'Tests', 'ScopesRemoteTerminalTests');
  assert.ok(fs.existsSync(testDir), 'Tests/ScopesRemoteTerminalTests -hakemisto puuttuu');

  const requiredTests = [
    'TerminalWireFrameTests.swift',
    'TerminalConnectionTests.swift',
    'TerminalAccessoryBarTests.swift',
    'RemoteTerminalViewTests.swift'
  ];

  for (const f of requiredTests) {
    const fPath = path.join(testDir, f);
    assert.ok(fs.existsSync(fPath), `Testitiedosto ${f} puuttuu hakemistosta ${testDir}`);
    const stat = fs.statSync(fPath);
    assert.ok(stat.size > 200, `Testitiedosto ${f} on liian lyhyt (${stat.size} tavua)`);
  }
});

test('Swift: TerminalModels määrittelee RAJAPINTA.md-mallit ja tilat', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'TerminalModels.swift'), 'utf8');
  assert.ok(content.includes('struct TerminalSessionInfo: Codable'), 'TerminalSessionInfo puuttuu');
  assert.ok(content.includes('struct CreateTerminalSessionRequest: Codable'), 'CreateTerminalSessionRequest puuttuu');
  assert.ok(content.includes('enum TerminalControlMessage: Codable'), 'TerminalControlMessage puuttuu');
  assert.ok(content.includes('case resize(cols: Int, rows: Int)'), 'resize-ohjausviesti puuttuu');
  assert.ok(content.includes('case signal(String)'), 'signal-ohjausviesti puuttuu');
  assert.ok(content.includes('case ready('), 'ready-ohjausviesti puuttuu');
  assert.ok(content.includes('case exit('), 'exit-ohjausviesti puuttuu');
  assert.ok(content.includes('enum TerminalConnectionState'), 'TerminalConnectionState puuttuu');
  assert.ok(content.includes('case reconnecting('), 'reconnecting-tila puuttuu');
});

test('Swift: TerminalWireFrame toteuttaa 1-tavuisen kanavoinnin ja apumetodit', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'TerminalWireFrame.swift'), 'utf8');
  assert.ok(content.includes('static let channelDataChar: Character = "0"'), 'Kanavatunnus 0 puuttuu');
  assert.ok(content.includes('static let channelControlChar: Character = "1"'), 'Kanavatunnus 1 puuttuu');
  assert.ok(content.includes('static let channelHeartbeatChar: Character = "2"'), 'Kanavatunnus 2 puuttuu');
  assert.ok(content.includes('func encodeData('), 'encodeData puuttuu');
  assert.ok(content.includes('func encodeControl('), 'encodeControl puuttuu');
  assert.ok(content.includes('func ping('), 'ping puuttuu');
  assert.ok(content.includes('func decodeFrame('), 'decodeFrame puuttuu');
});

test('Swift: TerminalConnection toteuttaa WebSocket-hallinnan, automaattisen uudelleenyhdistämisen ja heartbeat-logiikan', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'TerminalConnection.swift'), 'utf8');
  assert.ok(content.includes('class TerminalConnection: ObservableObject'), 'TerminalConnection ei ole ObservableObject');
  assert.ok(content.includes('URLSessionWebSocketTask'), 'URLSessionWebSocketTask puuttuu');
  assert.ok(content.includes('func connect('), 'connect-metodi puuttuu');
  assert.ok(content.includes('func disconnect()'), 'disconnect-metodi puuttuu');
  assert.ok(content.includes('func resize(cols: Int, rows: Int)'), 'resize-metodi puuttuu');
  assert.ok(content.includes('func sendSignal('), 'sendSignal-metodi puuttuu');
  assert.ok(content.includes('func sendPing()'), 'sendPing-metodi puuttuu');
  assert.ok(content.includes('reconnectDelay'), 'reconnectDelay puuttuu');
  assert.ok(content.includes('heartbeatInterval'), 'heartbeatInterval puuttuu');
});

test('Swift: TerminalViewRepresentable käärii SwiftTermin iOS:lle ja macOS:lle', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'TerminalViewRepresentable.swift'), 'utf8');
  assert.ok(content.includes('#if canImport(SwiftTerm)'), 'canImport(SwiftTerm) puuttuu');
  assert.ok(content.includes('UIViewRepresentable'), 'UIViewRepresentable puuttuu');
  assert.ok(content.includes('NSViewRepresentable'), 'NSViewRepresentable puuttuu');
  assert.ok(content.includes('feed(byteArray:'), 'feed(byteArray:) -kutsu SwiftTermille puuttuu');
  assert.ok(content.includes('func send(source: TerminalView'), 'TerminalViewDelegate send-metodi puuttuu');
  assert.ok(content.includes('func sizeChanged(source: TerminalView'), 'TerminalViewDelegate sizeChanged-metodi puuttuu');
});

test('Swift: TerminalAccessoryBar sisältää vaaditut mobiilinäppäimet ja sticky-modifioijat', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'TerminalAccessoryBar.swift'), 'utf8');
  assert.ok(content.includes('enum TerminalAccessoryKey'), 'TerminalAccessoryKey puuttuu');
  for (const k of ['esc', 'tab', 'ctrl', 'alt', 'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight', 'ctrlC', 'ctrlD', 'ctrlL']) {
    assert.ok(content.includes(`case ${k}`), `TerminalAccessoryKey.${k} puuttuu`);
  }
  assert.ok(content.includes('isCtrlActive'), 'isCtrlActive sticky-modifioija puuttuu');
  assert.ok(content.includes('isAltActive'), 'isAltActive sticky-modifioija puuttuu');
  assert.ok(content.includes('struct TerminalAccessoryBar: View'), 'TerminalAccessoryBar SwiftUI-näkymä puuttuu');
});

test('Swift: RemoteTerminalViewModel toteuttaa istuntohallinnan, REST-kutsut ja näkymäasetukset', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'RemoteTerminalViewModel.swift'), 'utf8');
  assert.ok(content.includes('class RemoteTerminalViewModel: ObservableObject'), 'RemoteTerminalViewModel ei ole ObservableObject');
  assert.ok(content.includes('@Published public var connection: TerminalConnection'), 'connection-muuttuja puuttuu');
  assert.ok(content.includes('@Published public var sessions: [TerminalSessionInfo]'), 'sessions-muuttuja puuttuu');
  assert.ok(content.includes('@Published public var selectedSession: TerminalSessionInfo?'), 'selectedSession-muuttuja puuttuu');
  assert.ok(content.includes('@Published public var currentTheme: TerminalTheme'), 'currentTheme-muuttuja puuttuu');
  assert.ok(content.includes('@Published public var fontSize: CGFloat'), 'fontSize-muuttuja puuttuu');
  assert.ok(content.includes('func fetchSessions() async'), 'fetchSessions puuttuu');
  assert.ok(content.includes('func createSession('), 'createSession puuttuu');
  assert.ok(content.includes('func closeSession('), 'closeSession puuttuu');
  assert.ok(content.includes('func selectSession('), 'selectSession puuttuu');
  assert.ok(content.includes('func increaseFontSize('), 'increaseFontSize puuttuu');
  assert.ok(content.includes('func decreaseFontSize('), 'decreaseFontSize puuttuu');
  assert.ok(content.includes('func setTheme('), 'setTheme puuttuu');
  assert.ok(content.includes('func toggleAccessoryBar()'), 'toggleAccessoryBar puuttuu');
});

test('Swift: TerminalSessionPickerView toteuttaa istuntolistauksen, valinnan ja luontilomakkeen', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'TerminalSessionPickerView.swift'), 'utf8');
  assert.ok(content.includes('struct TerminalSessionPickerView: View'), 'TerminalSessionPickerView View puuttuu');
  assert.ok(content.includes('@ObservedObject public var viewModel: RemoteTerminalViewModel'), 'viewModel puuttuu');
  assert.ok(content.includes('sessionListView'), 'sessionListView puuttuu');
  assert.ok(content.includes('newSessionSheet'), 'newSessionSheet puuttuu');
  assert.ok(content.includes('emptyStateView'), 'emptyStateView puuttuu');
  assert.ok(content.includes('closeSession'), 'closeSession-kutsu puuttuu');
  assert.ok(content.includes('createSession'), 'createSession-kutsu puuttuu');
});

test('Swift: RemoteTerminalView toteuttaa päänäkymän, tila-indikaattorin, teemat ja accessory-palkin', () => {
  const content = fs.readFileSync(path.join(__dirname, 'Sources', 'ScopesRemoteTerminal', 'RemoteTerminalView.swift'), 'utf8');
  assert.ok(content.includes('struct RemoteTerminalView: View'), 'RemoteTerminalView View puuttuu');
  assert.ok(content.includes('@ObservedObject public var viewModel: RemoteTerminalViewModel'), 'viewModel puuttuu');
  assert.ok(content.includes('TerminalViewRepresentable('), 'TerminalViewRepresentable-kytkentä puuttuu');
  assert.ok(content.includes('TerminalAccessoryBar('), 'TerminalAccessoryBar-kytkentä puuttuu');
  assert.ok(content.includes('statusBadgeView'), 'statusBadgeView puuttuu');
  assert.ok(content.includes('connectionOverlayView'), 'connectionOverlayView puuttuu');
  assert.ok(content.includes('topBarView'), 'topBarView puuttuu');
  assert.ok(content.includes('TerminalSessionPickerView('), 'TerminalSessionPickerView-sheet puuttuu');
});

