#!/usr/bin/env node
// scopes/siirto/economy/claude/haiku-testi.mjs
// V-652: Haiku-hybridin testiajo pakattuja Claude-istuntoja vasten. Transkripti katkaistaan ennen pakkauksen alkua
// (katko = ensimmäinen pakkaa-Skill- tai pakkaa-alku-kutsun rivi), git-tila on pakkauscommitin vanhempi (worktree), viite
// on pakkauscommitin HISTORIA- ja rekisterimuutos (viite.txt). Haiku ajetaan claude CLI:llä (tilaus, ei maksullista API:a).
// Käyttö projektijuuresta: node scopes/siirto/economy/claude/haiku-testi.mjs "$PWD" <ulos-hakemisto> <kierros> [id8...]
// b398e8ad on Macilla: scp mac:~/.claude/projects/-Users-user-sessions-repo/b398e8ad-fbd1-4379-96ac-7001f015b4cf.jsonl <ulos>/b398e8ad-koko.jsonl
// Poista worktreet lopuksi: git worktree list | grep <ulos> → git worktree remove <polku> (puhdas, ilman --forcea).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
const [, , repo, ulos, kierros, ...valitut] = process.argv;
const { louhiKaikki } = await import(`${repo}/scopes/agy/siirto/pakkausscripti/louhija.mjs`);
const { ajaHarkintaLahteella, CLAUDE_MALLI } = await import(`${repo}/scopes/agy/siirto/pakkausscripti/harkinta.mjs`);
const { skoopinRekisteri } = await import(`${repo}/claude/siirto/tools/skooppirajaus.mjs`);
const P = `${process.env.HOME}/.claude/projects/-home-user-palvelin`;
const TAPAUKSET = [
  { id: 'b398e8ad-fbd1-4379-96ac-7001f015b4cf', skooppi: 'scopes siirto economy claude', pakkaus: '060a0799', lahde: `${ulos}/b398e8ad-koko.jsonl`, katko: 212 },
  { id: 'ec5b35b3', skooppi: 'scopes sideloader', pakkaus: '0c746a01', katko: 436 },
  { id: '1fe0e726', skooppi: 'scopes patriot', pakkaus: '41d8f8df', katko: 704 },
  { id: '9bb41d80', skooppi: 'claude siirto pakkaa', pakkaus: '48de715b', katko: 376 },
  { id: '3ea72e61', skooppi: 'scopes siirto economy claude', pakkaus: 'a1505cb7', katko: 344 },
];
const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 64 << 20 });
for (const t of TAPAUKSET.filter((t) => !valitut.length || valitut.includes(t.id.slice(0, 8)))) {
  const lyhyt = t.id.slice(0, 8);
  const d = join(ulos, lyhyt); mkdirSync(join(d, 'projektit', 'p'), { recursive: true });
  const lahde = t.lahde ?? execFileSync('sh', ['-c', `ls ${P}/${t.id}*.jsonl`], { encoding: 'utf8' }).trim();
  const sid = lahde.split('/').pop().replace('.jsonl', '');
  writeFileSync(join(d, 'projektit', 'p', `${sid}.jsonl`), readFileSync(lahde, 'utf8').split('\n').slice(0, t.katko - 1).join('\n'));
  const wt = join(d, 'wt');
  if (!existsSync(wt)) git('worktree', 'add', '-q', '--detach', wt, `${t.pakkaus}~1`);
  const reg = skoopinRekisteri(t.skooppi);
  let head = null;
  try { head = git('show', `${t.pakkaus}~1:${reg}`).split('\n').find((r) => r.startsWith('SEURAAVA PAKETTI:')) ?? null; } catch {}
  if (!existsSync(join(d, 'viite.txt'))) {
    const hist = join(dirname(reg), 'HISTORIA.md');
    let viite = `SEURAAVA (pakkauksen jälkeen): ${(() => { try { return git('show', `${t.pakkaus}:${reg}`).split('\n').find((r) => r.startsWith('SEURAAVA PAKETTI:')); } catch { return '?'; } })()}\n\n`;
    viite += git('show', '--format=', t.pakkaus, '--', hist, reg).split('\n').filter((r) => r.startsWith('+') && !r.startsWith('+++')).join('\n');
    writeFileSync(join(d, 'viite.txt'), viite);
  }
  const faktat = await louhiKaikki({ skooppi: t.skooppi, juuri: wt, sessio: sid, env: {}, claudeProjektit: join(d, 'projektit') });
  faktat.seuraavaHead = head;
  const t0 = Date.now();
  const h = await ajaHarkintaLahteella(faktat, { malli: CLAUDE_MALLI });
  writeFileSync(join(d, `haiku-${kierros}.json`), JSON.stringify(h, null, 2));
  console.log(`${lyhyt} ${t.skooppi}: ${h.lahde} ${((Date.now() - t0) / 1000).toFixed(0)} s, viestejä ${faktat.viestit.length}${h.syy ? ' — ' + h.syy : ''}`);
}
