// Drukwerk-atlas: alle bordjes, etiketten en luifels van Wereld 3 staan samen op een paar grote plaatjes.
// Zo kan het samenvoegen (Statisch) ze tot een paar tekenstappen maken in plaats van één per bordje.
// Tijdens de inspectie (dichtbij, in het paneel) krijgt elk plaatje zijn eigen scherpe textuur.
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useInspectie } from '../game/inspectie';
import { maakTextuur } from '../game/tekst';

export type Teken = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const ZIJDE = 2048;
const RAND = 6; // pixels rond elk plaatje (tegen naden bij verkleinen)
const PPM_MAX = 230; // pixels per meter in de wereld (genoeg op 15 m afstand)
const MAX_PX = 900;

interface Pagina {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  x: number;
  y: number;
  rij: number;
  mats: Map<string, THREE.MeshStandardMaterial>;
}

export interface AtlasPlek {
  pagina: Pagina;
  uv: [number, number, number, number];
}

const paginas: Pagina[] = [];
const plekken = new Map<string, AtlasPlek>();
const hertekenen: (() => void)[] = [];

function nieuwePagina(): Pagina {
  const canvas = document.createElement('canvas');
  canvas.width = ZIJDE;
  canvas.height = ZIJDE;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const p: Pagina = { canvas, ctx, tex, x: 0, y: 0, rij: 0, mats: new Map() };
  paginas.push(p);
  return p;
}

/** Zoek een vrij stuk (planken-methode: rijen van links naar rechts). */
function ruimte(w: number, h: number) {
  let p = paginas[paginas.length - 1] ?? nieuwePagina();
  if (p.x + w > ZIJDE) {
    p.y += p.rij;
    p.x = 0;
    p.rij = 0;
  }
  if (p.y + h > ZIJDE) p = nieuwePagina();
  const plek = { p, x: p.x, y: p.y };
  p.x += w;
  p.rij = Math.max(p.rij, h);
  return plek;
}

/** Eén materiaal per pagina en soort (voorkant/dubbelzijdig, doorzichtige randen). */
function materiaal(p: Pagina, dubbel: boolean, alpha: boolean) {
  const k = `${dubbel ? 2 : 1}${alpha ? 'a' : ''}`;
  let m = p.mats.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map: p.tex, roughness: 0.8, side: dubbel ? THREE.DoubleSide : THREE.FrontSide, alphaTest: alpha ? 0.4 : 0 });
    p.mats.set(k, m);
  }
  return m;
}

/** Zet een tekening in de atlas (één keer per sleutel). */
export function atlasPlek(sleutel: string, breedte: number, hoogte: number, teken: Teken, ppm: number): AtlasPlek {
  const key = `${sleutel}|${breedte}|${hoogte}|${ppm}`;
  const al = plekken.get(key);
  if (al) return al;
  // zelfde maat als een losse textuur, zodat de tekening precies hetzelfde wordt
  const W0 = Math.max(32, Math.round(breedte * ppm));
  const H0 = Math.max(32, Math.round(hoogte * ppm));
  const f = Math.min(1, PPM_MAX / ppm, MAX_PX / Math.max(W0, H0));
  const w = Math.max(8, Math.round(W0 * f));
  const h = Math.max(8, Math.round(H0 * f));
  const { p, x, y } = ruimte(w + RAND * 2, h + RAND * 2);
  const herteken = () => {
    const c = p.ctx;
    c.save();
    c.clearRect(x, y, w + RAND * 2, h + RAND * 2);
    c.beginPath();
    c.rect(x + RAND, y + RAND, w, h);
    c.clip();
    c.translate(x + RAND, y + RAND);
    c.scale(w / W0, h / H0);
    teken(c, W0, H0);
    c.restore();
    // randpixels naar buiten uitrekken
    c.drawImage(p.canvas, x + RAND, y + RAND, 1, h, x, y + RAND, RAND, h);
    c.drawImage(p.canvas, x + RAND + w - 1, y + RAND, 1, h, x + RAND + w, y + RAND, RAND, h);
    c.drawImage(p.canvas, x, y + RAND, w + RAND * 2, 1, x, y, w + RAND * 2, RAND);
    c.drawImage(p.canvas, x, y + RAND + h - 1, w + RAND * 2, 1, x, y + RAND + h, w + RAND * 2, RAND);
    p.tex.needsUpdate = true;
  };
  herteken();
  hertekenen.push(herteken);
  // canvas-y loopt omlaag, textuur-v omhoog (flipY)
  const plek: AtlasPlek = { pagina: p, uv: [(x + RAND) / ZIJDE, 1 - (y + RAND + h) / ZIJDE, (x + RAND + w) / ZIJDE, 1 - (y + RAND) / ZIJDE] };
  plekken.set(key, plek);
  return plek;
}

// Zodra de webfonts er zijn: alles opnieuw tekenen.
if (typeof document !== 'undefined' && document.fonts) document.fonts.ready.then(() => hertekenen.forEach((f) => f()));

/** UV's van een geometrie in het stukje van de atlas zetten (één keer per geometrie). */
function zetUv(g: THREE.BufferGeometry, plek: AtlasPlek) {
  const uv = g.attributes.uv as THREE.BufferAttribute | undefined;
  if (!uv) return;
  if (g.userData.atlasPlek === plek) return;
  const bron: Float32Array = g.userData.uvBron ?? (g.userData.uvBron = new Float32Array(uv.array as Float32Array));
  const [u0, v0, u1, v1] = plek.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + bron[i * 2] * (u1 - u0), v0 + bron[i * 2 + 1] * (v1 - v0));
  uv.needsUpdate = true;
  g.userData.atlasPlek = plek;
}

type MeshProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
};

/**
 * Mesh met een getekend plaatje (vervangt `useTextuur` + `meshStandardMaterial map`).
 * `children` = de geometrie (bv. `<planeGeometry args={[b, h]} />`), met UV's van 0 tot 1.
 */
export function Druk({
  b,
  h,
  teken,
  sleutel,
  ppm = 220,
  dubbel = false,
  alpha = false,
  rough = 0.8,
  children,
  ...mesh
}: MeshProps & {
  b: number;
  h: number;
  teken: Teken;
  sleutel: string;
  ppm?: number;
  dubbel?: boolean;
  alpha?: boolean;
  rough?: number;
  children: ReactNode;
}) {
  const scherp = useInspectie().delen;
  const ref = useRef<THREE.Mesh>(null);
  const plek = useMemo(() => (scherp ? null : atlasPlek(sleutel, b, h, teken, ppm)), [scherp, sleutel, b, h, ppm]); // eslint-disable-line react-hooks/exhaustive-deps
  const los = useMemo(() => (scherp ? maakTextuur(b, h, teken, ppm) : null), [scherp, sleutel, b, h, ppm]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => los?.dispose(), [los]);
  useLayoutEffect(() => {
    const g = ref.current?.geometry;
    if (g && plek) zetUv(g, plek);
  });
  return (
    <mesh key={scherp ? 'los' : 'atlas'} ref={ref} {...mesh} material={plek ? materiaal(plek.pagina, dubbel, alpha) : undefined}>
      {children}
      {los && <meshStandardMaterial map={los} roughness={rough} side={dubbel ? THREE.DoubleSide : THREE.FrontSide} alphaTest={alpha ? 0.4 : 0} />}
    </mesh>
  );
}

/** Tekening als gegevens voor `<Druk {...x}>` (geen hook: Druk onthoudt het plaatje per sleutel). */
export const druk = (b: number, h: number, teken: Teken, sleutel: string, ppm = 220) => ({ b, h, teken, sleutel, ppm });
