// Macin Claude-istunnot skooppilistaan (VI-1, käyttäjä 28.10.2026): istunnot() lukee vain paikallisen
// ~/.claude/sessionsin, joten Macin tmux-istunnoissa (siirto-<slug>-hhmmss) ajavat Claude-skoopit näkyivät äpissä
// harmaina ilman istuntoja. Haku `ssh dev-host python3 -`: elävät istunnot ja transkriptin loppu, jäsennys tässä samoilla
// funktioilla kuin paikallisille. Välimuisti MAC_CLAUDE_TTL; vanhentunut tieto palautetaan heti ja päivitetään taustalla.
// ruutu, pid ja vanhempi ovat null: toiminnot.mjs ei saa kirjoittaa tai tappaa paikallista ruutua Macin istunnon nimissä.
import { platform } from 'node:os';
import { istunnonSkooppi, konteksti, hereilla, pakattu, pysahdys } from './lahteet.mjs';
import { ajaKomento } from './toiminnot.mjs';

export const MAC_CLAUDE_TTL = 15_000;
const HANTA = 400_000;

// Macilla ajettava haku: elävät istunnot (kill -0) ja transkriptin viimeiset HANTA tavua.
export const MAC_SKRIPTI = `
import json, os, glob
koti = os.path.expanduser('~')
ulos = []
for f in glob.glob(os.path.join(koti, '.claude/sessions/*.json')):
    try:
        s = json.load(open(f))
        os.kill(int(s.get('pid')), 0)
    except Exception:
        continue
    if not s.get('sessionId'):
        continue
    projekti = ''.join('-' if c in '/_.' else c for c in (s.get('cwd') or ''))
    polku = os.path.join(koti, '.claude/projects', projekti, s['sessionId'] + '.jsonl')
    t = ''
    try:
        with open(polku, 'rb') as h:
            h.seek(0, 2); koko = h.tell(); h.seek(max(0, koko - ${HANTA}))
            t = h.read().decode('utf-8', 'replace')
            if koko > ${HANTA}: t = t.split('\\n', 1)[-1]
    except Exception:
        pass
    ulos.append({'s': s, 't': t})
print(json.dumps(ulos))
`;

const slugiksi = (nimi) => String(nimi).toLowerCase().replace(/[^a-z0-9]/g, '-');

// Skooppi tmux-istunnon nimestä (siirto-<slug>-hhmmss), muuten nimestä tai transkriptin /pura-rivistä.
export function macSkooppi(s, transkripti, skooppiNimet) {
  const m = /^siirto-(.+)-\d{6}:/.exec(s.tmux ?? '');
  if (m) {
    const osuma = skooppiNimet.find((n) => slugiksi(n) === m[1]);
    if (osuma) return osuma;
  }
  return istunnonSkooppi(s.name ?? '', transkripti, skooppiNimet);
}

export function jasennaMacClaude(stdout, skooppiNimet) {
  let rivit;
  try { rivit = JSON.parse(stdout); } catch { return []; }
  if (!Array.isArray(rivit)) return [];
  return rivit.filter((r) => r?.s?.sessionId).map(({ s, t }) => ({
    id: s.sessionId,
    nimi: s.name ?? null,
    tila: s.status ?? null,
    kysely: s.status === 'waiting' && s.waitingFor === 'input needed',
    skooppi: macSkooppi(s, t ?? '', skooppiNimet),
    konteksti: konteksti(t ?? ''),
    pysahdys: pysahdys(t ?? ''),
    pakattu: pakattu(t ?? ''),
    hereilla: hereilla(t ?? ''),
    alkoi: s.startedAt ?? 0,
    pid: null,
    vanhempi: null,
    ruutu: null,
    polku: null,
    onMac: true,
  }));
}

export function luoMacClaude({ aja = ajaKomento, ttl = MAC_CLAUDE_TTL, paalla = platform() !== 'darwin' && !process.env.SCOPES_EI_MAC_CLAUDE } = {}) {
  let valimuisti = null;
  let kesken = null;
  // Välimuistissa raaka tuloste: skooppi jäsennetään kutsujan nimilistalla (lista kaikilla, yksi skooppi yhdellä).
  const hae = () => {
    if (kesken) return kesken;
    kesken = aja('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', 'mac', 'python3', '-'], { syote: MAC_SKRIPTI, aikaraja: 20_000, puskuri: 64 << 20 })
      .then((r) => { if (r.koodi === 0) valimuisti = { aika: Date.now(), stdout: r.stdout }; })
      .catch(() => {})
      .finally(() => { kesken = null; });
    return kesken;
  };
  // Ensimmäinen haku odottaa enintään odotus ms; sen jälkeen lista ei koskaan odota Macia.
  return async function macClaudeIstunnot(skooppiNimet, { odotus = 3_000 } = {}) {
    if (!paalla) return [];
    if (!valimuisti || Date.now() - valimuisti.aika >= ttl) {
      const haku = hae();
      if (!valimuisti) await Promise.race([haku, new Promise((ok) => setTimeout(ok, odotus))]);
    }
    return valimuisti ? jasennaMacClaude(valimuisti.stdout, skooppiNimet) : [];
  };
}
