// Plaatjesvel (atlas) voor vaste bordjes en etiketten: alle kleine getekende plaatjes komen samen op een
// paar grote vellen. Zo kan Statisch al die bordjes samenvoegen tot een paar tekenstappen.
import * as THREE from 'three';

const VEL = 2048;
const RAND = 4;
const MAX = 1024;

type Vel = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; x: number; y: number; rij: number };
export type AtlasPlek = { vel: Vel; px: number; py: number; w: number; h: number };

let vellen: Vel[] = [];
let plekken = new WeakMap<HTMLCanvasElement, AtlasPlek>();
let lijst: { bron: HTMLCanvasElement; plek: AtlasPlek }[] = [];
// Hetzelfde plaatje opnieuw getekend (een station dat opnieuw wordt samengevoegd na openen of sluiten)?
// Dan dezelfde plek hergebruiken. Anders groeit het vel bij elke opdracht en loopt het videogeheugen vol.
let perInhoud = new Map<string, AtlasPlek>();

/** Vingerafdruk van de pixels van een plaatje (maat + twee snelle hashes). */
function vingerafdruk(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const d = new Uint32Array(ctx.getImageData(0, 0, c.width, c.height).data.buffer);
  let a = 0x811c9dc5;
  let b = 0;
  for (let i = 0; i < d.length; i++) {
    a = Math.imul(a ^ d[i], 16777619);
    b = (b + Math.imul(d[i], i + 1)) | 0;
  }
  return `${c.width}x${c.height}:${a >>> 0}:${b >>> 0}`;
}

function nieuwVel(): Vel {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = VEL;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const v = { canvas, ctx, tex, x: 0, y: 0, rij: 0 };
  vellen.push(v);
  return v;
}

/** Teken het bronplaatje op zijn plek, met een randje van de buitenste pixels (geen naden bij verkleinen). */
function kopieer(bron: HTMLCanvasElement, p: AtlasPlek) {
  const { ctx } = p.vel;
  ctx.clearRect(p.px - RAND, p.py - RAND, p.w + RAND * 2, p.h + RAND * 2);
  ctx.drawImage(bron, p.px - RAND, p.py - RAND, p.w + RAND * 2, p.h + RAND * 2);
  ctx.clearRect(p.px, p.py, p.w, p.h);
  ctx.drawImage(bron, p.px, p.py, p.w, p.h);
  p.vel.tex.needsUpdate = true;
}

/** Plek van dit plaatje op een vel (zet het erop als het er nog niet op staat). Te groot? Dan null. */
export function inAtlas(bron: HTMLCanvasElement): AtlasPlek | null {
  const al = plekken.get(bron);
  if (al) return al;
  const w = bron.width;
  const h = bron.height;
  if (w > MAX || h > MAX || w < 1 || h < 1) return null;
  const vinger = vingerafdruk(bron);
  const zelfde = vinger ? perInhoud.get(vinger) : undefined;
  if (zelfde) {
    plekken.set(bron, zelfde);
    return zelfde;
  }
  let vel = vellen[vellen.length - 1] ?? nieuwVel();
  if (vel.x + w + RAND * 2 > VEL) {
    vel.x = 0;
    vel.y += vel.rij;
    vel.rij = 0;
  }
  if (vel.y + h + RAND * 2 > VEL) {
    vel = nieuwVel();
  }
  const plek = { vel, px: vel.x + RAND, py: vel.y + RAND, w, h };
  vel.x += w + RAND * 2;
  vel.rij = Math.max(vel.rij, h + RAND * 2);
  kopieer(bron, plek);
  plekken.set(bron, plek);
  if (vinger) perInhoud.set(vinger, plek);
  lijst.push({ bron, plek });
  return plek;
}

/** Zet uv (0..1 op het bronplaatje, flipY zoals CanvasTexture) om naar uv op het vel. */
export function atlasUv(uv: THREE.BufferAttribute, p: AtlasPlek) {
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    uv.setXY(i, (p.px + u * p.w) / VEL, 1 - (p.py + (1 - v) * p.h) / VEL);
  }
  uv.needsUpdate = true;
}

/** Nieuwe wereld: oude vellen weg (scheelt geheugen op de videokaart). */
export function wisAtlas() {
  for (const v of vellen) v.tex.dispose();
  vellen = [];
  plekken = new WeakMap();
  perInhoud = new Map();
  lijst = [];
}

// Zodra de webfonts geladen zijn, tekenen de bordjes zichzelf opnieuw: dan ook de kopie op het vel bijwerken.
if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.ready.then(() => setTimeout(() => lijst.forEach(({ bron, plek }) => kopieer(bron, plek)), 50));
}
