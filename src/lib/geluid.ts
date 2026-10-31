// Zachte geluiden, live gemaakt met de Web Audio API (geen bestanden nodig).
import { useSpel } from '../game/store';

let ctx: AudioContext | null = null;
let achtergrond: { stop: () => void } | null = null;

/** De gedeelde Web Audio-context (voor eigen geluidslagen, zoals het horrorgeluid in Wereld 2). */
export function audioContext() {
  return context();
}

function context() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function toon(freq: number, start: number, duur: number, type: OscillatorType = 'sine', volume = 0.12) {
  const c = context();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + duur + 0.05);
}

function ruis(duur: number, van: number, naar: number, volume = 0.06) {
  const c = context();
  if (!c) return;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * duur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const bron = c.createBufferSource();
  bron.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(van, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(naar, c.currentTime + duur);
  const g = c.createGain();
  g.gain.value = volume;
  bron.connect(f).connect(g).connect(c.destination);
  bron.start();
}

export type Geluid = 'klik' | 'goed' | 'bijna' | 'woesj' | 'schuif' | 'poort' | 'klaar' | 'deur' | 'kluis' | 'code' | 'lampje' | 'zweef' | 'praat' | 'kraak' | 'fluister' | 'boe' | 'brul' | 'lach';

export function geluid(naam: Geluid) {
  if (!useSpel.getState().geluid) return;
  switch (naam) {
    case 'klik':
      toon(880, 0, 0.08, 'triangle', 0.06);
      break;
    case 'goed':
      toon(660, 0, 0.25, 'sine', 0.1);
      toon(990, 0.1, 0.35, 'sine', 0.09);
      break;
    case 'bijna':
      toon(392, 0, 0.3, 'sine', 0.07);
      break;
    case 'woesj':
      ruis(0.6, 300, 1600, 0.05);
      break;
    case 'schuif':
      ruis(0.35, 900, 400, 0.04);
      break;
    case 'poort':
      toon(196, 0, 1.2, 'triangle', 0.08);
      toon(294, 0.3, 1.2, 'sine', 0.06);
      break;
    case 'klaar':
      [523, 659, 784, 1046].forEach((f, i) => toon(f, i * 0.12, 0.5, 'sine', 0.08));
      break;
    case 'deur':
      // krakend scharnier + zachte plof
      ruis(0.9, 1800, 700, 0.035);
      toon(140, 0.75, 0.25, 'triangle', 0.07);
      break;
    case 'kluis':
      // zware klik van de grendel, dan een helder belletje
      toon(110, 0, 0.18, 'square', 0.05);
      toon(82, 0.12, 0.25, 'triangle', 0.08);
      [784, 988, 1318].forEach((f, i) => toon(f, 0.45 + i * 0.1, 0.6, 'sine', 0.07));
      break;
    case 'code':
      toon(1046, 0, 0.18, 'sine', 0.07);
      toon(1318, 0.09, 0.3, 'sine', 0.07);
      break;
    case 'zweef':
      // zacht 'woesj' omhoog als het maatje aanzweeft
      ruis(0.5, 500, 2200, 0.03);
      toon(660, 0.08, 0.3, 'sine', 0.025);
      break;
    case 'kraak':
      // krakende vloerplank
      ruis(0.5, 900, 250, 0.03);
      toon(96, 0.05, 0.4, 'sawtooth', 0.025);
      break;
    case 'fluister':
      // spookachtig gefluister dat aanzwelt en wegsterft
      ruis(1.4, 2400, 500, 0.035);
      toon(330, 0.1, 1.2, 'sine', 0.018);
      toon(311, 0.3, 1.1, 'sine', 0.015);
      break;
    case 'boe':
      // laag 'oeeeh' van een voorbijschietend spook
      toon(220, 0, 0.9, 'sine', 0.05);
      toon(165, 0.25, 0.9, 'sine', 0.04);
      ruis(0.8, 600, 2000, 0.025);
      break;
    case 'brul':
      // Frank springt tevoorschijn: een lage brul met een scherpe schrik-toon erbovenop
      toon(92, 0, 0.75, 'sawtooth', 0.055);
      toon(69, 0.04, 0.85, 'sawtooth', 0.045);
      ruis(0.7, 500, 140, 0.07);
      toon(1244, 0, 0.45, 'triangle', 0.025);
      toon(1318, 0.01, 0.45, 'triangle', 0.025);
      break;
    case 'lach':
      // een diep 'ho ho ho'
      [196, 185, 175].forEach((f, i) => toon(f, i * 0.22, 0.18, 'triangle', 0.06));
      break;
    case 'praat':
      // drie korte brabbeltjes
      [520, 610, 470].forEach((f, i) => toon(f + Math.random() * 60, i * 0.07, 0.07, 'triangle', 0.02));
      break;
    case 'lampje':
      [1318, 1568, 2093].forEach((f, i) => toon(f, i * 0.06, 0.25, 'triangle', 0.045));
      break;
  }
}

/** Rustige achtergrond: twee zachte, langzaam zwevende tonen. */
export function startAchtergrond() {
  const c = context();
  if (!c || achtergrond || !useSpel.getState().geluid) return;
  const master = c.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.025, c.currentTime + 3);
  master.connect(c.destination);
  const oscs = [196, 293.66, 392].map((f, i) => {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.03;
    const lg = c.createGain();
    lg.gain.value = 1.5;
    lfo.connect(lg).connect(o.frequency);
    o.connect(master);
    o.start();
    lfo.start();
    return [o, lfo];
  });
  achtergrond = {
    stop: () => {
      master.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
      setTimeout(() => oscs.flat().forEach((o) => o.stop()), 600);
      achtergrond = null;
    },
  };
}
export function stopAchtergrond() {
  achtergrond?.stop();
}
