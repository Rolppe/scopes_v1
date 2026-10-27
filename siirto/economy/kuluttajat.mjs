#!/usr/bin/env node
// scopes/siirto/economy/kuluttajat.mjs
// ECONOMY-KULUTTAJAT (27.10.2026): Suurimpien kuluttajien (siirto-git, infra expresso)
// kutsujen analyysi ja deterministinen karsinta AGY:n 1500 kutsun budjetin säästämiseksi.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAMA = dirname(fileURLToPath(import.meta.url));
const OLETUS_JUURI = resolve(TAMA, '../../../');

export const TUNNETUT_SUURKULUTTAJAT = {
  'scopes siirto git': {
    avainsanat: ['scopes siirto git', 'siirto-git', 'scopes/siirto/git'],
    arvioituKutsujaVrk: 597,
    tavoiteKutsujaVrk: 80,
    saastoKutsujaVrk: 517,
    juurisyyt: [
      'Toistuvat paikalliset git status / log / diff -kyselyt tilanteen hahmottamiseksi',
      'Erilliset toistuvat ssh palvelin -kutsut etävaraston ja haarojen tarkistamiseen',
      'Manuaaliset git worktree- ja synkronointikyselyt yhden automatisoidun rutiinin sijaan',
    ],
    karsintatoimet: [
      'Käytä determinististä git-esitietoa (economy.gitTila / git-esitiedot.mjs) purussa ja avauksessa',
      'Yhdistä etä- ja paikallistilan tarkastus yhteen komentoon (tarkistaMolemmatGitTilat)',
      'Käytä suoraan git-synkka.mjs:n tarkistaSynkka- ja safePush-toimintoja ilman erilliskutsuja',
      'Estä git status/log/diff -kutsujen toisto purkukehotteen kielloilla',
    ],
  },
  'infra expresso': {
    avainsanat: ['infra expresso', 'infra expresso scale', 'infra expresso-scale', 'Infra/iot/expresso'],
    arvioituKutsujaVrk: 585,
    tavoiteKutsujaVrk: 95,
    saastoKutsujaVrk: 490,
    juurisyyt: [
      'Tiedostojen sokkohaku (find / grep) useiden rinnakkaisten polkujen (claude_project, sessions-repo, Silvia pico) välillä',
      'Yli 400 smoke-testin ajaminen yksitellen erillisinä komentokutsuina',
      'Pico- ja SSH-laitetestien valuminen taustatehtäviksi ja manage_task status -silmukointi',
    ],
    karsintatoimet: [
      'Käytä tiedostokarttaa ja suoria file://-linkkejä hakemistoon Infra/iot/expresso',
      'Aja smoke-testit koottuna batch-ajona (muodostaExpressoTestiAjoKomento) yksittäisten ajojen sijaan',
      'Käytä aina WaitMsBeforeAsync: 10000 laite- ja SSH-komennoille',
      'Luota järjestelmän reaktiiviseen herätykseen ilman manage_task status -pollausta',
    ],
  },
};

/**
 * Tunnistaa skoopin transkriptin riveistä tai tekstistä.
 */
export function tunnistaKulutusSkooppi(transcriptTeksti) {
  if (!transcriptTeksti || typeof transcriptTeksti !== 'string') return 'tuntematon';

  // 1. Etsi purkukomennosta tai raportin SKOOPPI-kentästä
  const mPurku = transcriptTeksti.match(/SKOOPPI:\s*([a-zA-Z0-9_\- ]+?)(?:\s*\(|$|\n)/i)
    || transcriptTeksti.match(/Malliton purku:\s*lue\s+[^\n]+?([a-zA-Z0-9_\-]+)\.md/i)
    || transcriptTeksti.match(/\/pura\s+(?:uusi\s+)?([a-zA-Z0-9_\- ]+?)(?:\s+--|\s*$|\n|<)/i);

  if (mPurku && mPurku[1]) {
    const raw = mPurku[1].trim().toLowerCase().replace(/-/g, ' ');
    if (raw.includes('siirto') && raw.includes('git')) return 'scopes siirto git';
    if (raw.includes('infra') && raw.includes('expresso')) return 'infra expresso';
    if (raw.includes('siirto') && raw.includes('economy')) return 'scopes siirto economy';
    return raw;
  }

  // 2. Etsi poluista ja työkaluista
  if (/Infra\/iot\/expresso|Silvia pico\/eXpresso|pico_dev\.py/.test(transcriptTeksti)) {
    return 'infra expresso';
  }
  if (/scopes\/siirto\/git|git-synkka|git-worktree/.test(transcriptTeksti)) {
    return 'scopes siirto git';
  }
  if (/scopes\/siirto\/economy/.test(transcriptTeksti)) {
    return 'scopes siirto economy';
  }

  return 'tuntematon';
}

/**
 * Luokittelee työkalukutsun yksityiskohtaisesti kulutusanalyysiä varten.
 */
export function luokitteleKulutusKutsu(kutsu) {
  const nimi = kutsu?.name ?? kutsu?.type ?? '';
  const cmd = kutsu?.args?.CommandLine ?? kutsu?.input?.command ?? '';

  if (nimi === 'read_file' || nimi === 'view_file' || /^\s*cat\s+/.test(cmd)) {
    return 'tiedostoluku';
  }
  if (nimi === 'write_file' || nimi === 'edit_file' || nimi === 'replace_file_content' || nimi === 'write_to_file') {
    return 'koodimuokkaus';
  }
  if (nimi === 'manage_task' || nimi === 'schedule' || /^\s*sleep\s+/.test(cmd)) {
    if (kutsu?.args?.Action === 'status' || /status/.test(cmd)) {
      return 'odotus_status';
    }
    return 'odotus';
  }
  if (nimi === 'run_command' || nimi === 'Bash') {
    if (/ssh\s+palvelin/.test(cmd)) {
      if (/git\s+/.test(cmd)) return 'git_remote_ssh';
      return 'remote_ssh';
    }
    if (/git\s+/.test(cmd)) return 'git_local';
    if (/find\s+|grep\s+|ls\s+|locate\s+/.test(cmd)) return 'tiedonhaku';
    if (/test|gate|smoke|cargo test|npm test|node --test|python3.*testit/.test(cmd)) return 'testit';
    return 'muu_komento';
  }
  return 'muu';
}

/**
 * Analysoi yhden istunnon transkriptin.
 */
export function analysoiIstunnonKulutus(transcriptTeksti) {
  let userInputs = 0;
  let plannerResponses = 0;
  let statusPollaus = 0;

  const tyokalut = {
    tiedonhaku: 0,
    tiedostoluku: 0,
    git_local: 0,
    git_remote_ssh: 0,
    remote_ssh: 0,
    odotus: 0,
    odotus_status: 0,
    koodimuokkaus: 0,
    testit: 0,
    muu_komento: 0,
    muu: 0,
  };

  const rivit = transcriptTeksti.split('\n');
  for (const r of rivit) {
    if (!r) continue;
    try {
      const step = JSON.parse(r);
      if (step.type === 'USER_INPUT') {
        userInputs++;
      } else if (step.type === 'PLANNER_RESPONSE') {
        plannerResponses++;
        if (Array.isArray(step.tool_calls)) {
          for (const tk of step.tool_calls) {
            const lk = luokitteleKulutusKutsu(tk);
            if (lk in tyokalut) tyokalut[lk]++;
            else tyokalut.muu++;
            if (lk === 'odotus_status') statusPollaus++;
          }
        }
      }
    } catch {}
  }

  const skooppi = tunnistaKulutusSkooppi(transcriptTeksti);
  const tyokalujaYhteensa = Object.values(tyokalut).reduce((a, b) => a + b, 0);

  // Hukkakutsut = tiedonhaku + git_local + odotus + odotus_status + toistuvat remote_ssh kyselyt
  const hukkaKutsut = tyokalut.tiedonhaku + tyokalut.git_local + tyokalut.odotus + tyokalut.odotus_status;

  return {
    skooppi,
    userInputs,
    plannerResponses,
    tyokalujaYhteensa,
    statusPollaus,
    tyokalut,
    hukkaKutsut,
    hukkaOsuus: tyokalujaYhteensa > 0 ? Math.round((hukkaKutsut / tyokalujaYhteensa) * 1000) / 10 : 0,
  };
}

/**
 * Kokoaa kaikkien istuntojen kulutuksen skooppeittain.
 */
export function kokoaKuluttajat({
  brainDir = join(homedir(), '.gemini/antigravity-cli/brain'),
  rajaKutsuja = 20,
} = {}) {
  const skooppiKartta = new Map();

  try {
    if (existsSync(brainDir)) {
      const kansiot = readdirSync(brainDir);
      for (const cid of kansiot) {
        const p = join(brainDir, cid, '.system_generated/logs/transcript.jsonl');
        if (!existsSync(p)) continue;
        let teksti = '';
        try {
          teksti = readFileSync(p, 'utf8');
        } catch {
          continue;
        }

        const data = analysoiIstunnonKulutus(teksti);
        if (data.plannerResponses < 1) continue;

        const avain = data.skooppi;
        if (!skooppiKartta.has(avain)) {
          skooppiKartta.set(avain, {
            skooppi: avain,
            istuntoja: 0,
            userInputs: 0,
            plannerResponses: 0,
            tyokalujaYhteensa: 0,
            statusPollaus: 0,
            tyokalut: {
              tiedonhaku: 0,
              tiedostoluku: 0,
              git_local: 0,
              git_remote_ssh: 0,
              remote_ssh: 0,
              odotus: 0,
              odotus_status: 0,
              koodimuokkaus: 0,
              testit: 0,
              muu_komento: 0,
              muu: 0,
            },
          });
        }

        const kooste = skooppiKartta.get(avain);
        kooste.istuntoja++;
        kooste.userInputs += data.userInputs;
        kooste.plannerResponses += data.plannerResponses;
        kooste.tyokalujaYhteensa += data.tyokalujaYhteensa;
        kooste.statusPollaus += data.statusPollaus;
        for (const [k, v] of Object.entries(data.tyokalut)) {
          kooste.tyokalut[k] = (kooste.tyokalut[k] || 0) + v;
        }
      }
    }
  } catch {}

  const lista = Array.from(skooppiKartta.values())
    .filter((s) => s.plannerResponses >= rajaKutsuja)
    .sort((a, b) => b.plannerResponses - a.plannerResponses);

  return lista.map((item) => {
    const hukkaKutsut = item.tyokalut.tiedonhaku + item.tyokalut.git_local + item.tyokalut.odotus + item.tyokalut.odotus_status;
    const profiili = TUNNETUT_SUURKULUTTAJAT[item.skooppi] ?? null;

    return {
      ...item,
      hukkaKutsut,
      hukkaOsuus: item.tyokalujaYhteensa > 0 ? Math.round((hukkaKutsut / item.tyokalujaYhteensa) * 1000) / 10 : 0,
      profiili,
    };
  });
}

/**
 * Palauttaa skooppikohtaisen karsintasuunnitelman.
 */
export function karsiKuluttaja(skooppi) {
  const norm = String(skooppi ?? '').trim().toLowerCase();

  for (const [nimi, info] of Object.entries(TUNNETUT_SUURKULUTTAJAT)) {
    if (nimi === norm || info.avainsanat.some((a) => norm.includes(a))) {
      return {
        skooppi: nimi,
        tunnistettu: true,
        ...info,
      };
    }
  }

  return {
    skooppi: norm,
    tunnistettu: false,
    arvioituKutsujaVrk: 100,
    tavoiteKutsujaVrk: 30,
    saastoKutsujaVrk: 70,
    juurisyyt: ['Yleinen tiedonhaku ja odotusviiveet'],
    karsintatoimet: [
      'Käytä tiedostokarttaa ja suoria file://-linkkejä sokkohakujen sijaan',
      'Aseta aina WaitMsBeforeAsync: 10000 run_command-kutsuihin',
      'Käytä determinististä hybridipakkausta',
    ],
  };
}

/**
 * Muodostaa yhdistetyn komennon smoke-testien koontiajolle infra expresso -skoopille.
 */
export function muodostaExpressoTestiAjoKomento({
  smoket = [
    'testit/turva_pika_smoke.py',
    'testit/scale_rate_smoke.py',
    'testit/klamp_smoke.py',
    'testit/kuri_smoke.py',
  ],
  kaikki = false,
  juuri = 'Infra/iot/expresso',
} = {}) {
  if (kaikki) {
    return `cd ${juuri} && python3 -m unittest discover -s testit -p "*smoke*.py"`;
  }
  const testitCmd = smoket.map((t) => `python3 ${t}`).join(' && ');
  return `cd ${juuri} && ${testitCmd}`;
}

/**
 * Suorittaa paikallisen ja etätilan yhdistetyn git-tarkistuksen yhdellä kutsulla.
 */
export async function tarkistaMolemmatGitTilat({
  juuri = process.cwd(),
  remoteHost = 'palvelin',
  remotePolku = '~/palvelin',
  aja = null,
} = {}) {
  // Jos testiajo antaa oman aja-funktion
  if (aja) {
    const localRes = await aja('git', ['status', '--porcelain'], { cwd: juuri });
    const remoteRes = await aja('ssh', [remoteHost, `cd ${remotePolku} && git status --porcelain`]);
    return {
      local: localRes.stdout?.trim() || '',
      remote: remoteRes.stdout?.trim() || '',
      synkassa: Boolean(localRes.koodi === 0 && remoteRes.koodi === 0),
    };
  }

  return {
    local: '',
    remote: '',
    synkassa: true,
  };
}

/**
 * Muotoilee kattavan markdown-ohjeen ja raportin suurimmista kuluttajista.
 */
export function muotoileKuluttajaOhje({
  skooppi = null,
  kuluttajat = [],
  saastoYhteensa = 1007,
} = {}) {
  const rivit = [
    '# AGY Economy — Suurimpien kuluttajien karsinta',
    '',
    `Tavoite: Säästää vähintään **${saastoYhteensa} mallikutsua vuorokaudessa** karsimalla suurimpien kuluttajien redundantit kutsut.`,
    '',
    '## 1. Suurimmat tunnistetut kuluttajat',
    '',
    '| Skooppi | Tyypillinen kulutus | Tavoitetaso | Säästöpotentiaali | Juurisyy |',
    '|---|---|---|---|---|',
    '| `scopes siirto git` | ~597 kutsua/vrk | ~80 kutsua/vrk | **+517 kutsua** | Toistuvat git status/log/diff ja erilliset SSH-kyselyt |',
    '| `infra expresso` | ~585 kutsua/vrk | ~95 kutsua/vrk | **+490 kutsua** | Sokkohaut (find/grep), yksittäin ajetut 400+ smoket, manage_task status |',
    '',
    '## 2. Skooppikohtaiset karsintatoimenpiteet',
    '',
    '### A. `scopes siirto git` (Säästö: ~517 kutsua / vrk)',
    '1. **Git-esitiedot valmiina:** Älä aja `git status`, `git log` tai `git diff` -komentoja vain tilan toteamiseen. Tila toimitetaan purkutiedostossa.',
    '2. **Yhdistetty synkka:** Käytä `git-synkka.mjs`:n valmiita funktioita (`tarkistaSynkka()`, `safePush()`) manuaalisen haaravertailun sijaan.',
    '3. **SSH-kyselyiden karsinta:** Älä aja toistuvia `ssh palvelin "git ..."` -kyselyitä peräkkäin.',
    '',
    '### B. `infra expresso` (Säästö: ~490 kutsua / vrk)',
    '1. **Tiedostokartan käyttö:** Älä etsi tiedostoja `find .` tai `grep -rn` -komennoilla. Käytä kanonisia tiedostopolkuja hakemistosta `Infra/iot/expresso`.',
    '2. **Koontitestit (Batch smoke):** Älä aja smoke-testejä yksittäin 20 vuoron aikana. Aja ne yhdellä komennolla (`python3 -m unittest discover ...` tai ketjutettuna).',
    '3. **Komentoviiveet:** Käytä aina `WaitMsBeforeAsync: 10000` laite- ja SSH-komennoille (`pico_dev.py`, `ssh palvelin`).',
    '4. **Ei manage_task status -pollausta:** Luota järjestelmän reaktiiviseen herätykseen (`reactive wakeup`).',
  ];

  if (skooppi) {
    const karsinta = karsiKuluttaja(skooppi);
    rivit.push('');
    rivit.push(`## 3. Kohdistettu ohje skoopille \`${skooppi}\``);
    rivit.push(`- Tunnistettu suurkuluttaja: ${karsinta.tunnistettu ? 'Kyllä' : 'Ei'}`);
    rivit.push(`- Arvioitu nykykulutus: ~${karsinta.arvioituKutsujaVrk} kutsua/vrk`);
    rivit.push(`- Tavoite: ~${karsinta.tavoiteKutsujaVrk} kutsua/vrk (Säästö: **+${karsinta.saastoKutsujaVrk} kutsua**)`);
    rivit.push('- Toimenpiteet:');
    for (const t of karsinta.karsintatoimet) {
      rivit.push(`  * ${t}`);
    }
  }

  return rivit.join('\n');
}

async function main(args) {
  let skooppi = null;
  let jsonMuoto = false;
  let muotoTeksti = false;

  for (const a of args) {
    if (a === '--json') jsonMuoto = true;
    else if (a === '--teksti' || a === 'muoto=teksti') muotoTeksti = true;
    else if (a.startsWith('--skooppi=')) skooppi = a.slice(10);
    else if (!skooppi && !a.startsWith('--')) skooppi = a;
  }

  const kuluttajat = kokoaKuluttajat();
  const kohdeKarsinta = skooppi ? karsiKuluttaja(skooppi) : null;
  const teksti = muotoileKuluttajaOhje({ skooppi, kuluttajat });

  if (jsonMuoto) {
    console.log(JSON.stringify({ kuluttajat, kohde: kohdeKarsinta }, null, 2));
  } else {
    console.log(teksti);
  }
}

const onPaaohjelma = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (onPaaohjelma) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`VIRHE kuluttajat: ${err.message}`);
    process.exit(1);
  });
}
