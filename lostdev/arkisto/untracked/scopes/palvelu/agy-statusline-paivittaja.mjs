#!/usr/bin/env node
// Antigravity CLI statusline-päivittäjä (AGY-USAGE-CLI 17.10.2026):
// agy suorittaa tämän komennon jokaisella vuorolla ja syöttää stdin-putkeen StatusLineData-JSONin,
// josta poimitaan Googlen viralliset kiintiötiedot (gemini-5h, 3p-5h, 3p-weekly, gemini-weekly)
// ilman suoria kiellettyjä API-kutsuja. Tulos tallennetaan pysyvästi levylle ~/.local/state/scopes-agy-kayttoraja.json.

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { laskePyyntomaara } from './agy-kayttoraja.mjs';

export const TILA_TIEDOSTO = join(homedir(), '.local/state/scopes-agy-kayttoraja.json');

export function laskeProsentti(remainingFraction) {
  if (typeof remainingFraction !== 'number' || !Number.isFinite(remainingFraction)) return null;
  return Math.max(0, Math.min(100, Math.round((1 - remainingFraction) * 10000) / 100));
}

const iso = (t) => (t && Number.isFinite(Date.parse(t)) ? new Date(t).toISOString() : null);

export function muotoileAgyTila(data, { nytMs = Date.now(), brainDir } = {}) {
  const quota = data?.quota ?? {};

  const g5h = quota['gemini-5h'];
  const gemini5h = g5h ? {
    kaytto: laskeProsentti(g5h.remaining_fraction),
    nollautuu: iso(g5h.reset_time),
  } : null;

  const gWeekly = quota['gemini-weekly'];
  const geminiWeekly = gWeekly ? {
    kaytto: laskeProsentti(gWeekly.remaining_fraction),
    nollautuu: iso(gWeekly.reset_time),
  } : null;

  const c5h = quota['3p-5h'];
  const kolmas5h = c5h ? {
    kaytto: laskeProsentti(c5h.remaining_fraction),
    nollautuu: iso(c5h.reset_time),
  } : null;

  const cWeekly = quota['3p-weekly'];
  const kolmasWeekly = cWeekly ? {
    kaytto: laskeProsentti(cWeekly.remaining_fraction),
    nollautuu: iso(cWeekly.reset_time),
  } : null;

  const pyynnot = laskePyyntomaara({ nytMs, brainDir });

  return {
    haettu: nytMs,
    paivitetty: new Date(nytMs).toISOString(),
    lahde: 'cli-statusline',
    plan_tier: data?.plan_tier ?? 'Google AI Pro',
    model: data?.model ?? null,
    gemini: {
      viisiTuntia: gemini5h,
      viikko: pyynnot ?? geminiWeekly,
      kiintioViikko: geminiWeekly,
    },
    kolmasOsapuoli: {
      viisiTuntia: kolmas5h,
      viikko: kolmasWeekly,
    },
  };
}

export function tallennaTila(tila, kohdePolku = TILA_TIEDOSTO) {
  mkdirSync(dirname(kohdePolku), { recursive: true });
  const tmp = `${kohdePolku}.tmp.${process.pid}.${Date.now()}`;
  writeFileSync(tmp, JSON.stringify(tila, null, 2), 'utf8');
  renameSync(tmp, kohdePolku);
}

// Pääohjelma lukee stdin ja päivittää tilatiedoston
const paaohjelma = process.argv[1]?.endsWith('agy-statusline-paivittaja.mjs');
if (paaohjelma) {
  try {
    const input = readFileSync(0, 'utf8');
    if (input && input.trim()) {
      const data = JSON.parse(input);
      const tila = muotoileAgyTila(data);
      tallennaTila(tila);
    }
  } catch {
    // Ei estetä agy:n TUI-toimintaa virhetilanteessa
  }
}
