// Horror in Slot Maansteyn (Wereld 2). Gebouwd op onderzoek naar horrorgames (docs/ontwerp/horror-wereld2.md):
// - Geluid draagt de angst: een lage bromtoon en wind, gefluister en gekraak uit een willekeurige richting,
//   Franks voetstappen en adem vanaf zijn echte plek (links of rechts, voor of achter, boven of onder je)
//   en je eigen hartslag die sneller gaat als hij dichtbij is.
// - Afwachten is enger dan schrikken: vlak voordat Frank toeslaat wordt het stil. Schrikmomenten zijn zeldzaam.
// - Beeld: filmkorrel, kleurranden en een donkere rand die meegroeien met de angst; de zaklamp hapert.
// - Het slot zelf: krassen en tekst op de muren, ogen in het donker die verdwijnen als je ze beschijnt.
// Alles is live gemaakt (Web Audio en canvas): geen bestanden nodig.
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sfeerFx } from '../game/beeld';
import { indeling, kamerOp, MUUR_D, verdiepingHoogte, verdiepingPlan } from '../game/huis';
import { speler, useSpel } from '../game/store';
import { BUNDEL_HOEK, zaklampStaat } from '../game/zaklamp';
import { audioContext } from '../lib/geluid';
import { huidig } from '../werelden';
import type { Kamer } from '../werelden/types';

/** Waar Frank is en wat hij doet (bijgewerkt door FrankNPC). */
export const frankNu = {
  pos: new THREE.Vector3(),
  v: 0,
  stand: 'wacht',
  /** Is hij te zien (op jouw verdieping, niet verstopt)? */
  zichtbaar: false,
  loopt: false,
  jaagt: false,
  /** Loert hij om een hoek of sluipt hij achter je (dan wordt het stil). */
  loert: false,
};

/** Hoe bang ben je nu (0 = rustig, 1 = Frank zit je op de hielen). */
export const angst = { niveau: 0 };

/** Rustige plekken: hier is geen dreiging (zijn tuin, de start, de walgangen). Gelijk aan RUSTIG in FrankNPC. */
export const VEILIG = new Set(['bospad', 'brug', 'poortzaal', 'uitleg', 'binnenplaats', 'walgangO', 'walgangW', 'balkon', 'uitkijk', 'kerkhof', 'bouwplaats', 'rotstrap', 'steiger']);

// ── geluid ────────────────────────────────────────────────────────────────

type Ctx = AudioContext;

class HorrorGeluid {
  c: Ctx;
  uit: GainNode;
  galm: ConvolverNode;
  bromGain: GainNode;
  windGain: GainNode;
  ademGain: GainNode;
  ademPan: StereoPannerNode;
  ruis: AudioBuffer;
  bronnen: AudioScheduledSourceNode[] = [];

  constructor(c: Ctx) {
    this.c = c;
    this.uit = c.createGain();
    this.uit.gain.value = 0;
    this.uit.connect(c.destination);
    // galm: een grote, stenen ruimte
    this.galm = c.createConvolver();
    this.galm.buffer = this.galmBuffer(2.6);
    const galmUit = c.createGain();
    galmUit.gain.value = 0.55;
    this.galm.connect(galmUit).connect(this.uit);
    // witte ruis (gedeeld)
    this.ruis = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = this.ruis.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // bromtoon: twee laag gestemde zaagtanden die langzaam tegen elkaar in zweven, plus een zachte sinus
    this.bromGain = c.createGain();
    this.bromGain.gain.value = 0.05;
    const laag = c.createBiquadFilter();
    laag.type = 'lowpass';
    laag.frequency.value = 150;
    laag.connect(this.bromGain).connect(this.uit);
    for (const f of [41.2, 41.9, 61.7]) {
      const o = c.createOscillator();
      o.type = f > 60 ? 'sine' : 'sawtooth';
      o.frequency.value = f;
      o.connect(laag);
      o.start();
      this.bronnen.push(o);
    }
    // wind: gefilterde ruis waarvan de toonhoogte langzaam golft
    const wind = c.createBufferSource();
    wind.buffer = this.ruis;
    wind.loop = true;
    const band = c.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 420;
    band.Q.value = 0.7;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDiepte = c.createGain();
    lfoDiepte.gain.value = 230;
    lfo.connect(lfoDiepte).connect(band.frequency);
    this.windGain = c.createGain();
    this.windGain.gain.value = 0.035;
    wind.connect(band).connect(this.windGain).connect(this.uit);
    wind.start();
    lfo.start();
    this.bronnen.push(wind, lfo);
    // Franks adem: ruis door een smal filter, de sterkte gaat op en neer (in en uit)
    const adem = c.createBufferSource();
    adem.buffer = this.ruis;
    adem.loop = true;
    const ademFilter = c.createBiquadFilter();
    ademFilter.type = 'bandpass';
    ademFilter.frequency.value = 650;
    ademFilter.Q.value = 1.2;
    const ademLfo = c.createOscillator();
    ademLfo.frequency.value = 0.32;
    const ademLfoGain = c.createGain();
    ademLfoGain.gain.value = 0.5;
    const ademMod = c.createGain();
    ademMod.gain.value = 0.5;
    ademLfo.connect(ademLfoGain).connect(ademMod.gain);
    this.ademGain = c.createGain();
    this.ademGain.gain.value = 0;
    this.ademPan = c.createStereoPanner();
    adem.connect(ademFilter).connect(ademMod).connect(this.ademGain).connect(this.ademPan).connect(this.uit);
    this.ademPan.connect(this.galm);
    adem.start();
    ademLfo.start();
    this.bronnen.push(adem, ademLfo);
  }

  private galmBuffer(duur: number) {
    const c = this.c;
    const n = Math.floor(c.sampleRate * duur);
    const b = c.createBuffer(2, n, c.sampleRate);
    for (let k = 0; k < 2; k++) {
      const d = b.getChannelData(k);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
    }
    return b;
  }

  /** Een kort geluid naar de uitgang, met een richting (pan −1..1) en wat galm. */
  private naar(node: AudioNode, pan: number, galm = 0.5) {
    const p = this.c.createStereoPanner();
    p.pan.value = THREE.MathUtils.clamp(pan, -1, 1);
    node.connect(p);
    const droog = this.c.createGain();
    droog.gain.value = 1 - galm * 0.6;
    p.connect(droog).connect(this.uit);
    const nat = this.c.createGain();
    nat.gain.value = galm;
    p.connect(nat).connect(this.galm);
  }

  private ruisStoot(t: number, duur: number, filter: BiquadFilterType, f: number, q: number, vol: number, pan: number, galm: number) {
    const c = this.c;
    const b = c.createBufferSource();
    b.buffer = this.ruis;
    b.playbackRate.value = 0.8 + Math.random() * 0.4;
    const fl = c.createBiquadFilter();
    fl.type = filter;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.02, duur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
    b.connect(fl).connect(g);
    this.naar(g, pan, galm);
    b.start(t, Math.random() * 1.5, duur + 0.05);
  }

  private toon(t: number, van: number, naar: number, duur: number, type: OscillatorType, vol: number, pan: number, galm: number) {
    const c = this.c;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(van, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, naar), t + duur);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
    o.connect(g);
    this.naar(g, pan, galm);
    o.start(t);
    o.stop(t + duur + 0.05);
  }

  /** Gefluister: korte, onverstaanbare lettergrepen uit één richting. */
  fluister(pan: number, vol = 0.05) {
    const t0 = this.c.currentTime + 0.05;
    const n = 5 + Math.floor(Math.random() * 6);
    let t = t0;
    for (let i = 0; i < n; i++) {
      const d = 0.06 + Math.random() * 0.12;
      this.ruisStoot(t, d, 'bandpass', 1300 + Math.random() * 1700, 5, vol * (0.6 + Math.random() * 0.6), pan, 0.7);
      t += d + 0.02 + Math.random() * 0.08;
    }
  }
  /** Krakende vloer of deur. */
  kraak(pan: number, vol = 0.05) {
    const t = this.c.currentTime + 0.02;
    for (let i = 0; i < 3; i++) this.toon(t + i * 0.09, 170 - i * 15, 120 - i * 10, 0.22, 'sawtooth', vol * 0.5, pan, 0.6);
    this.ruisStoot(t, 0.5, 'bandpass', 380, 9, vol, pan, 0.6);
  }
  /** Doffe bonk ergens ver weg in het slot. */
  bonk(pan: number, vol = 0.12) {
    const t = this.c.currentTime + 0.02;
    this.toon(t, 70, 38, 0.6, 'sine', vol, pan, 0.9);
    this.ruisStoot(t, 0.3, 'lowpass', 260, 0.8, vol * 0.7, pan, 0.9);
  }
  /** Een zware deur die ergens dichtslaat. */
  deurSlaat(pan: number) {
    const t = this.c.currentTime + 0.02;
    this.ruisStoot(t, 0.25, 'lowpass', 900, 0.7, 0.28, pan, 1);
    this.toon(t, 58, 40, 0.5, 'sine', 0.22, pan, 1);
  }
  /** Eén voetstap: dof, en achter je nog doffer. */
  stap(pan: number, vol: number, helder: number) {
    const t = this.c.currentTime + 0.01;
    this.ruisStoot(t, 0.09, 'lowpass', helder, 0.9, vol, pan, 0.45);
    this.toon(t, 95, 60, 0.08, 'sine', vol * 0.8, pan, 0.3);
  }
  /** Je hart: dubbele, lage tik. */
  hartslag(vol: number) {
    const t = this.c.currentTime + 0.01;
    this.toon(t, 58, 44, 0.13, 'sine', vol, 0, 0);
    this.toon(t + 0.26, 52, 40, 0.11, 'sine', vol * 0.7, 0, 0);
  }
  /** Stinger: een vals akkoord dat aanzwelt, een schrille kras en een diepe klap. */
  stinger(groot = false) {
    const c = this.c;
    const t = c.currentTime + 0.01;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(5200, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 1.8);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(groot ? 0.16 : 0.11, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    lp.connect(g);
    this.naar(g, 0, 0.7);
    for (const f of [207.65, 220, 233.08, 311.13, 466.16, 493.88]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.01);
      o.connect(lp);
      o.start(t);
      o.stop(t + 2.3);
    }
    this.ruisStoot(t, groot ? 0.7 : 0.45, 'highpass', 2400, 0.7, groot ? 0.22 : 0.15, 0, 0.6);
    this.toon(t, 120, 32, 1.4, 'sine', groot ? 0.4 : 0.28, 0, 0.6);
  }
  /** Achtervolging: een snelle, lage puls. */
  puls(vol: number) {
    const t = this.c.currentTime + 0.01;
    this.toon(t, 55, 50, 0.16, 'sawtooth', vol, 0, 0.2);
  }

  zetVolume(doel: number, brom: number) {
    const t = this.c.currentTime;
    this.uit.gain.setTargetAtTime(doel, t, 0.6);
    this.bromGain.gain.setTargetAtTime(0.05 * brom, t, 0.4);
    this.windGain.gain.setTargetAtTime(0.035 * Math.max(0.3, brom), t, 0.6);
  }
  zetAdem(vol: number, pan: number) {
    const t = this.c.currentTime;
    this.ademGain.gain.setTargetAtTime(vol, t, 0.25);
    this.ademPan.pan.setTargetAtTime(THREE.MathUtils.clamp(pan, -1, 1), t, 0.1);
  }
  stop() {
    const t = this.c.currentTime;
    this.uit.gain.setTargetAtTime(0, t, 0.3);
    const b = this.bronnen;
    setTimeout(() => {
      for (const x of b)
        try {
          x.stop();
        } catch {
          /* al gestopt */
        }
      this.uit.disconnect();
    }, 1500);
  }
}

let actief: HorrorGeluid | null = null;
/** Voor FrankNPC: geluid bij een schrikmoment, gefluister vanaf zijn plek, enzovoort. */
export const horror = {
  stinger: (groot = false) => actief?.stinger(groot),
  fluister: (pan = (Math.random() - 0.5) * 1.6, vol?: number) => actief?.fluister(pan, vol),
  kraak: (pan = 0, vol?: number) => actief?.kraak(pan, vol),
  deurSlaat: (pan = (Math.random() - 0.5) * 1.6) => actief?.deurSlaat(pan),
};

/** Richting van een punt ten opzichte van je kijkrichting: pan (−1 links … 1 rechts) en of het achter je is. */
function richtingVan(camera: THREE.Camera, x: number, z: number, uit: { pan: number; achter: boolean; afstand: number }) {
  const dx = x - camera.position.x;
  const dz = z - camera.position.z;
  const d = Math.hypot(dx, dz) || 1;
  const v = camera.getWorldDirection(tmpV);
  const vl = Math.hypot(v.x, v.z) || 1;
  const fx = v.x / vl;
  const fz = v.z / vl;
  // rechts van je: (−fz, fx) als je naar (fx, fz) kijkt
  uit.pan = (dx * -fz + dz * fx) / d;
  uit.achter = (dx * fx + dz * fz) / d < -0.2;
  uit.afstand = d;
  return uit;
}
const tmpV = new THREE.Vector3();

/** Het horrorgeluid en de angstmeter (stuurt ook filmkorrel, kleurranden, donkere rand en het haperen van de lamp). */
function Angst() {
  const camera = useThree((s) => s.camera);
  const st = useRef({ stapTot: 0, hartTot: 0, gebeurtenisTot: 6, deurTot: 50, pulsTot: 0, hartPuls: 0, flikkerTot: 0 });
  const r = useMemo(() => ({ pan: 0, achter: false, afstand: 0 }), []);
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __sfeerFx: sfeerFx, __angst: angst, __frankNu: frankNu });
    return () => {
      actief?.stop();
      actief = null;
      sfeerFx.korrel = 0;
      sfeerFx.aberratie = 0;
      sfeerFx.vignet = 0;
      angst.niveau = 0;
    };
  }, []);
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const t = clock.getElapsedTime();
    const s = useSpel.getState();
    const plan = huidig().plan;
    const lopen = s.modus === 'lopen' && !s.kaart;
    const kamer = plan ? kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping) : undefined;
    const veilig = !!kamer && VEILIG.has(kamer.id);
    const zelfde = frankNu.v === speler.verdieping;
    const d = zelfde ? Math.hypot(frankNu.pos.x - speler.pos.x, frankNu.pos.z - speler.pos.z) : 99;

    // ── angst ──
    let doel = kamer?.donker ? 0.18 : 0.06;
    if (zelfde && d < 14) doel = Math.max(doel, ((14 - d) / 14) * (frankNu.zichtbaar ? 1 : 0.75));
    if (frankNu.stand === 'staar') doel = Math.max(doel, 0.6);
    if (frankNu.jaagt) doel = 1;
    if (veilig) doel *= 0.35;
    if (!lopen) doel *= 0.3;
    angst.niveau += (doel - angst.niveau) * Math.min(1, dt * (doel > angst.niveau ? 2.2 : 0.45));
    const a = angst.niveau;

    // ── beeld ──
    const p = st.current;
    p.hartPuls = Math.max(0, p.hartPuls - dt * 3);
    sfeerFx.korrel = 0.35 + 0.65 * a;
    sfeerFx.aberratie = Math.pow(a, 1.4) * (1 + p.hartPuls * 0.6);
    sfeerFx.vignet = 0.3 + 0.55 * a + p.hartPuls * 0.25 * a;
    // de lamp hapert als hij dichtbij is
    if (lopen && a > 0.5 && t > p.flikkerTot && Math.random() < dt * (a - 0.4) * 2.2) {
      zaklampStaat.uitvalTot = Math.max(zaklampStaat.uitvalTot, t + 0.05 + Math.random() * 0.16);
      p.flikkerTot = t + 0.6;
    }

    // ── geluid ──
    if (!s.geluid) {
      actief?.zetVolume(0, 0);
      return;
    }
    if (!actief) {
      const c = audioContext();
      if (!c || c.state !== 'running') return;
      actief = new HorrorGeluid(c);
    }
    const g = actief;
    // vlak voor een schrikmoment (Frank loert of sluipt dichtbij) wordt het stil
    const stil = frankNu.loert && d < 9;
    g.zetVolume(lopen ? 1 : 0.35, stil ? 0.15 : 1 - 0.3 * (veilig ? 1 : 0));
    // Franks adem als hij vlakbij is
    richtingVan(camera, frankNu.pos.x, frankNu.pos.z, r);
    g.zetAdem(zelfde && d < 5.5 && frankNu.stand !== 'praat' ? (1 - d / 5.5) * 0.09 : 0, r.pan);
    // zijn voetstappen: ook als je hem niet ziet; van een andere verdieping gedempt
    if (frankNu.loopt && t > p.stapTot && (zelfde ? d < 26 : Math.abs(frankNu.v - speler.verdieping) === 1)) {
      p.stapTot = t + (frankNu.jaagt ? 0.3 : 0.56);
      const ver = zelfde ? d : Math.hypot(frankNu.pos.x - speler.pos.x, frankNu.pos.z - speler.pos.z) + 4;
      const vol = (zelfde ? 0.55 : 0.25) / (1 + ver * 0.3);
      g.stap(r.pan, vol, zelfde ? (r.achter ? 520 : 1300) : 260);
    }
    // je hart
    if (lopen && a > 0.22 && t > p.hartTot) {
      p.hartTot = t + 60 / (62 + 95 * a);
      p.hartPuls = 1;
      g.hartslag(0.05 + 0.13 * a);
    }
    // achtervolging: een snelle puls eronder
    if (frankNu.jaagt && t > p.pulsTot) {
      p.pulsTot = t + 0.2;
      g.puls(0.05);
    }
    // af en toe een geluid ergens in het slot (minder in een veilige plek)
    if (lopen && t > p.gebeurtenisTot) {
      p.gebeurtenisTot = t + (veilig ? 14 : 6) + Math.random() * 10;
      const pan = (Math.random() - 0.5) * 1.8;
      const k = Math.random();
      if (k < 0.38) g.fluister(pan, 0.035 + 0.03 * Math.random());
      else if (k < 0.7) g.kraak(pan, 0.04);
      else g.bonk(pan, 0.08 + Math.random() * 0.06);
    }
    if (lopen && !veilig && t > p.deurTot) {
      p.deurTot = t + 45 + Math.random() * 50;
      g.deurSlaat((Math.random() - 0.5) * 1.8);
    }
  });
  return null;
}

// ── krassen en tekst op de muren ─────────────────────────────────────────────

const TEKSTEN = ['HIJ ZIET JE', 'NIET OMKIJKEN', 'BLIJF IN HET LICHT', 'TEL DE STAPPEN', 'WIE TELT ER MEE?', 'ER IS GEEN UITWEG', 'HIJ HOORT JE', 'IIII IIII IIII II', 'NOG 3 KLUIZEN', 'ZIJN TUIN IS VEILIG'];

function krasTextuur(tekst: string, seed: number) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const g = c.getContext('2d')!;
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  g.clearRect(0, 0, 512, 192);
  // vegen en vlekken (oude, donkere verf)
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(${60 + rnd() * 40},${8 + rnd() * 10},${6 + rnd() * 8},${0.05 + rnd() * 0.12})`;
    g.beginPath();
    g.ellipse(rnd() * 512, rnd() * 192, 10 + rnd() * 60, 4 + rnd() * 18, rnd() * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.font = `700 ${tekst.length > 14 ? 54 : 70}px "Fredoka", "Inter", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // trillerige, met de hand gekraste letters: een paar keer verschoven over elkaar
  for (let k = 0; k < 4; k++) {
    g.save();
    g.translate(256 + (rnd() - 0.5) * 6, 96 + (rnd() - 0.5) * 6);
    g.rotate((rnd() - 0.5) * 0.08);
    g.fillStyle = `rgba(${95 + rnd() * 40},${12 + rnd() * 10},${10 + rnd() * 6},${k ? 0.35 : 0.8})`;
    g.fillText(tekst, 0, 0);
    g.restore();
  }
  // druppels
  for (let i = 0; i < 9; i++) {
    const x = 60 + rnd() * 392;
    const l = 20 + rnd() * 60;
    const gr = g.createLinearGradient(0, 110, 0, 110 + l);
    gr.addColorStop(0, 'rgba(110,14,10,0.7)');
    gr.addColorStop(1, 'rgba(110,14,10,0)');
    g.fillStyle = gr;
    g.fillRect(x, 110, 2 + rnd() * 3, l);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Op een paar muren in donkere en griezelige ruimtes: gekraste tekst (één per ruimte, op een vaste plek). */
function MuurTeksten() {
  const plan = huidig().plan!;
  const HV = verdiepingHoogte(plan);
  const lijst = useMemo(() => {
    const uit: { pos: [number, number, number]; rot: number; tekst: string; seed: number }[] = [];
    const doelen = plan.kamers.filter((k) => k.donker || ['ridderzaal', 'kapel', 'bibliotheek', 'heksenkeuken'].includes(k.id));
    let n = 0;
    for (const k of doelen) {
      const v = k.verdieping ?? 0;
      const muren = indeling(verdiepingPlan(plan, v)).muren.filter((m) => m.vanY === 0 && !m.glas && !m.onder && m.e - m.s > 2.4 && (m.min?.id === k.id || m.plus?.id === k.id));
      if (!muren.length) continue;
      const m = muren[(n * 7 + 3) % muren.length];
      const kant = m.min?.id === k.id ? -1 : 1;
      const mid = (m.s + m.e) / 2;
      const af = kant * (MUUR_D / 2 + 0.02);
      const pos: [number, number, number] = m.as === 'x' ? [mid, v * HV + 1.55, m.c + af] : [m.c + af, v * HV + 1.55, mid];
      const rot = m.as === 'x' ? (kant > 0 ? 0 : Math.PI) : kant > 0 ? Math.PI / 2 : -Math.PI / 2;
      uit.push({ pos, rot, tekst: TEKSTEN[n % TEKSTEN.length], seed: n + 1 });
      n++;
    }
    return uit;
  }, [plan, HV]);
  const mats = useMemo(() => lijst.map((x) => new THREE.MeshStandardMaterial({ map: krasTextuur(x.tekst, x.seed), transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })), [lijst]);
  useEffect(() => () => mats.forEach((m) => (m.map?.dispose(), m.dispose())), [mats]);
  return (
    <>
      {lijst.map((x, i) => (
        <mesh key={i} position={x.pos} rotation={[0, x.rot, 0]} material={mats[i]}>
          <planeGeometry args={[2, 0.75]} />
        </mesh>
      ))}
    </>
  );
}

// ── ogen in het donker ─────────────────────────────────────────────────────

/**
 * In donkere ruimtes kijken soms twee oogjes je aan vanuit een hoek. Schijn je erop (of kom je te dichtbij),
 * dan zijn ze weg. Ze knipperen af en toe.
 */
function Ogen() {
  const plan = huidig().plan!;
  const HV = verdiepingHoogte(plan);
  const plekken = useMemo(() => {
    const uit: { x: number; z: number; y: number; v: number }[] = [];
    for (const k of plan.kamers.filter((k: Kamer) => k.donker)) {
      const v = k.verdieping ?? 0;
      const [w, d] = k.maat;
      for (const [sx, sz] of [
        [-1, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
      ])
        uit.push({ x: k.pos[0] + sx * (w / 2 - 0.45), z: k.pos[1] + sz * (d / 2 - 0.45), y: v * HV + (Math.random() < 0.4 ? 0.55 : 1.62), v });
    }
    return uit;
  }, [plan, HV]);
  const groep = useRef<THREE.Group>(null);
  const st = useRef({ i: -1, tot: 0, knip: 0, weg: 0 });
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd9a0', toneMapped: false }), []);
  const camera = useThree((s) => s.camera);
  useFrame(({ clock }) => {
    const g = groep.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    const p = st.current;
    const s = useSpel.getState();
    const lopen = s.modus === 'lopen' && !s.kaart;
    // nieuwe plek kiezen: een donkere hoek op jouw verdieping, 4–14 m van je, niet in je lichtbundel
    if (p.i < 0 && t > p.weg && lopen) {
      const kand = plekken.filter((q) => q.v === speler.verdieping && Math.hypot(q.x - speler.pos.x, q.z - speler.pos.z) > 4 && Math.hypot(q.x - speler.pos.x, q.z - speler.pos.z) < 14);
      if (kand.length) {
        const q = kand[Math.floor(Math.random() * kand.length)];
        p.i = plekken.indexOf(q);
        p.tot = t + 8 + Math.random() * 10;
        g.position.set(q.x, q.y, q.z);
      } else p.weg = t + 3;
    }
    if (p.i < 0) {
      g.visible = false;
      return;
    }
    const q = plekken[p.i];
    // altijd naar je toe gekeken
    g.lookAt(camera.position.x, q.y, camera.position.z);
    // beschenen of te dichtbij: weg
    const lens = zaklampStaat.lens;
    tmpV.set(q.x - lens.x, q.y - lens.y, q.z - lens.z);
    const dl = tmpV.length();
    const beschenen = zaklampStaat.aan > 0.5 && dl < 14 && tmpV.normalize().dot(zaklampStaat.richting) > Math.cos(BUNDEL_HOEK * 0.85);
    const dichtbij = Math.hypot(q.x - speler.pos.x, q.z - speler.pos.z) < 3.4;
    if (!lopen || beschenen || dichtbij || q.v !== speler.verdieping || t > p.tot) {
      if (beschenen && lopen) horror.fluister(0, 0.025);
      p.i = -1;
      p.weg = t + 10 + Math.random() * 14;
      g.visible = false;
      return;
    }
    // knipperen
    if (t > p.knip) p.knip = t + 2 + Math.random() * 3;
    g.visible = p.knip - t > 0.12;
  });
  return (
    <group ref={groep} visible={false}>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.07, 0, 0]} material={mat} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[0.022, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** Alles samen: geluid en angst, tekst op de muren en ogen in het donker. */
export function HorrorLaag() {
  return (
    <>
      <Angst />
      <MuurTeksten />
      <Ogen />
    </>
  );
}
