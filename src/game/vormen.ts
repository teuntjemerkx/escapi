// Natuurlijke vormen: bomen, struiken en stenen die niet uit facetten bestaan maar glad en grillig zijn,
// zoals in het echt. Alles met kleur per hoekpunt (licht boven, donker onder en binnenin), zodat er geen
// plaatje nodig is. `fijn` = meer detail voor losse bomen dichtbij; zonder fijn is het licht genoeg voor een bos.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { metFijnDetail } from './fijn';

// ── ruis ──
function hash(i: number, j: number, k: number, seed: number) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1440662683) + Math.imul(seed, 1103515245)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** Zachte ruis tussen 0 en 1. */
export function ruis3(x: number, y: number, z: number, seed = 0) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const k = Math.floor(z);
  const fx = x - i;
  const fy = y - j;
  const fz = z - k;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const w = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(hash(i, j, k, seed), hash(i + 1, j, k, seed), u), l(hash(i, j + 1, k, seed), hash(i + 1, j + 1, k, seed), u), v),
    l(l(hash(i, j, k + 1, seed), hash(i + 1, j, k + 1, seed), u), l(hash(i, j + 1, k + 1, seed), hash(i + 1, j + 1, k + 1, seed), u), v),
    w,
  );
}
/** Ruis in lagen (grof + fijn), tussen 0 en 1. */
export function fbm(x: number, y: number, z: number, seed = 0, lagen = 3) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  let tot = 0;
  for (let o = 0; o < lagen; o++) {
    s += a * ruis3(x * f, y * f, z * f, seed + o * 17);
    tot += a;
    f *= 2.07;
    a *= 0.5;
  }
  return s / tot;
}

/** Normalen glad maken: dubbele hoekpunten samenvoegen (kleur blijft), dan normalen uitrekenen. */
function glad(g: THREE.BufferGeometry) {
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  const m = mergeVertices(g, 1e-4);
  m.computeVertexNormals();
  return m;
}
function kleur(g: THREE.BufferGeometry, f: (x: number, y: number, z: number, i: number) => THREE.Color) {
  const p = g.attributes.position as THREE.BufferAttribute;
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const k = f(p.getX(i), p.getY(i), p.getZ(i), i);
    c[i * 3] = k.r;
    c[i * 3 + 1] = k.g;
    c[i * 3 + 2] = k.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}
const tmpK = new THREE.Color();

/** Stam (met wortelvoet) of tak: een licht gebogen, taps toelopende cilinder van a naar b. */
function tak(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, basis: THREE.Color, seg: number, seed: number, voet = 0) {
  const l = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(1, 1, l, seg, 4, true);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / l + 0.5; // 0 onder, 1 boven
    const r = r0 + (r1 - r0) * t + voet * Math.pow(1 - t, 6);
    const hoek = Math.atan2(p.getZ(i), p.getX(i));
    const ribbel = 1 + (ruis3(Math.cos(hoek) * 2.5, t * 3, Math.sin(hoek) * 2.5, seed) - 0.5) * 0.25;
    const buig = Math.sin(t * Math.PI) * l * 0.06;
    p.setXYZ(i, Math.cos(hoek) * r * ribbel + buig, p.getY(i), Math.sin(hoek) * r * ribbel);
  }
  g.translate(0, l / 2, 0);
  const richting = b.clone().sub(a).normalize();
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), richting));
  g.translate(a.x, a.y, a.z);
  // kleur hangt alleen van de plek af (dan sluit de naad netjes als de hoekpunten samengaan)
  kleur(g, (x, y, z) => tmpK.copy(basis).multiplyScalar(0.62 + 0.3 * ruis3(x * 3.1, y * 2, z * 3.1, seed) + Math.min(0.15, y * 0.04)));
  return glad(g);
}

/** Een tros bladeren: een bobbelige bol (vervormd met ruis), donker onderaan en aan de binnenkant. */
function tros(c: THREE.Vector3, r: number, sy: number, basis: THREE.Color, midden: THREE.Vector3, detail: number, seed: number, ruw = 0.24) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const d = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const n = fbm(d.x * 1.8 + seed, d.y * 1.8, d.z * 1.8, seed, 3);
    const rr = r * (1 + (n - 0.5) * 2 * ruw) * (d.y < -0.2 ? 0.86 : 1);
    p.setXYZ(i, c.x + d.x * rr, c.y + d.y * rr * sy, c.z + d.z * rr);
  }
  const top = c.y + r * sy;
  const onder = c.y - r * sy;
  kleur(g, (x, y, z) => {
    const h = Math.min(1, Math.max(0, (y - onder) / (top - onder)));
    // naar buiten gericht = in het licht, naar het midden van de kruin = in de schaduw
    const ux = x - midden.x;
    const uy = y - midden.y;
    const uz = z - midden.z;
    const ul = Math.hypot(ux, uy, uz) || 1;
    const vx = x - c.x;
    const vy = y - c.y;
    const vz = z - c.z;
    const vl = Math.hypot(vx, vy, vz) || 1;
    const buiten = (ux * vx + uy * vy + uz * vz) / (ul * vl);
    const vlek = ruis3(x * 2.3, y * 2.3, z * 2.3, seed + 5);
    return tmpK.copy(basis).multiplyScalar(Math.min(1.25, (0.5 + 0.5 * h) * (0.78 + 0.22 * Math.max(0, buiten)) * (0.86 + 0.28 * vlek)));
  });
  return glad(g);
}

const wit = new THREE.Color('#ffffff');

/** Loofboom (± 4,2 m): stam met takken en een kruin van bobbelige trossen. */
export function loofVorm(groen: string, fijn: boolean, seed = 3) {
  const basis = new THREE.Color(groen);
  const bast = new THREE.Color('#5a3d28');
  const delen: THREE.BufferGeometry[] = [];
  const seg = fijn ? 10 : 6;
  delen.push(tak(new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0.05, 2.1, 0.02), 0.2, 0.12, bast, seg, seed, 0.14));
  delen.push(tak(new THREE.Vector3(0.04, 1.6, 0), new THREE.Vector3(0.6, 2.7, 0.2), 0.08, 0.035, bast, Math.max(5, seg - 3), seed + 1));
  delen.push(tak(new THREE.Vector3(0.03, 1.8, 0), new THREE.Vector3(-0.55, 2.8, -0.25), 0.07, 0.03, bast, Math.max(5, seg - 3), seed + 2));
  const midden = new THREE.Vector3(0, 3.0, 0);
  const trossen: [number, number, number, number][] = [
    [0, 2.75, 0, 1.0],
    [0.62, 3.2, 0.22, 0.72],
    [-0.58, 3.1, -0.28, 0.7],
    [0.12, 3.6, -0.1, 0.66],
    [-0.2, 2.55, 0.55, 0.62],
    [0.35, 2.5, -0.5, 0.6],
  ];
  const rnd = (i: number) => ruis3(i * 1.7, seed, 0.5, seed);
  for (const [i, [x, y, z, r]] of trossen.entries()) {
    if (!fijn && i > 3) continue;
    delen.push(tros(new THREE.Vector3(x, y, z), r * (0.92 + 0.16 * rnd(i)) * (fijn ? 1 : 1.12), 0.86, basis, midden, fijn ? 2 : 1, seed + i * 11));
  }
  return mergeGeometries(delen)!;
}

/** Den (± 4,4 m): smalle stam en lagen hangende takken met grillige punten. */
export function denVorm(groen: string, sneeuw: boolean, fijn: boolean, seed = 5) {
  const basis = new THREE.Color(groen);
  const sneeuwK = new THREE.Color('#eef4f8');
  const delen: THREE.BufferGeometry[] = [tak(new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0, 1.6, 0), 0.16, 0.09, new THREE.Color('#4a3424'), fijn ? 8 : 6, seed, 0.06)];
  const lagen = fijn ? 7 : 5;
  const seg = fijn ? 14 : 10;
  for (let i = 0; i < lagen; i++) {
    const t = i / (lagen - 1);
    const r = 1.42 * (1 - t * 0.8);
    const h = 1.15 - t * 0.4;
    const y0 = 0.85 + t * 2.75;
    const k = new THREE.ConeGeometry(r, h, seg, 2);
    k.rotateY(i * 1.37 + seed);
    k.translate(0, y0 + h / 2, 0);
    const p = k.attributes.position as THREE.BufferAttribute;
    for (let v = 0; v < p.count; v++) {
      const x = p.getX(v);
      const y = p.getY(v);
      const z = p.getZ(v);
      const rho = Math.hypot(x, z);
      if (rho < 1e-4) continue;
      const a = Math.atan2(z, x);
      const hh = (y - y0) / h;
      // takpunten: de rand is grillig en hangt een beetje door
      const punt = ruis3(Math.cos(a) * 2.2 + i * 3.1, Math.sin(a) * 2.2, i * 1.7, seed);
      const f = 1 + (punt - 0.5) * 0.5 * (1 - hh);
      const r2 = rho * f;
      p.setXYZ(v, Math.cos(a) * r2, y - Math.pow(1 - hh, 2) * 0.2 * f * (rho / r), Math.sin(a) * r2);
    }
    kleur(k, (x, y, z) => {
      const hh = Math.min(1, Math.max(0, (y - y0 + 0.2) / (h + 0.2)));
      if (sneeuw && hh > 0.42) return tmpK.copy(sneeuwK).multiplyScalar(0.9 + hh * 0.1);
      const vlek = ruis3(x * 2.1, y * 2.1, z * 2.1, seed + i);
      return tmpK.copy(basis).multiplyScalar((0.5 + 0.5 * hh) * (0.85 + 0.25 * vlek) * (0.92 + t * 0.15));
    });
    delen.push(glad(k));
  }
  return mergeGeometries(delen)!;
}

/** Dode boom (spookbos): kale, kromme stam met takken. */
export function doodVorm(kl: string, fijn: boolean, seed = 9) {
  const basis = new THREE.Color(kl);
  const seg = fijn ? 8 : 6;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const delen = [
    tak(V(0, -0.05, 0), V(0.1, 1.5, 0.02), 0.25, 0.17, basis, seg, seed, 0.16),
    tak(V(0.1, 1.45, 0.02), V(-0.05, 2.7, 0.1), 0.17, 0.09, basis, seg, seed + 1),
    tak(V(0.05, 1.9, 0.05), V(0.95, 2.55, 0.1), 0.09, 0.03, basis, seg - 2, seed + 2),
    tak(V(0.95, 2.55, 0.1), V(1.35, 3.05, -0.05), 0.03, 0.012, basis, seg - 2, seed + 3),
    tak(V(0, 2.2, 0.05), V(-0.8, 2.85, -0.35), 0.08, 0.025, basis, seg - 2, seed + 4),
    tak(V(-0.8, 2.85, -0.35), V(-1.1, 3.2, -0.2), 0.025, 0.01, basis, seg - 2, seed + 5),
    tak(V(-0.04, 2.6, 0.1), V(0.35, 3.4, 0.55), 0.07, 0.02, basis, seg - 2, seed + 6),
    tak(V(-0.05, 2.65, 0.08), V(-0.25, 3.35, -0.5), 0.06, 0.015, basis, seg - 2, seed + 7),
    tak(V(0.05, 1.25, 0.02), V(0.6, 1.7, -0.45), 0.06, 0.02, basis, seg - 2, seed + 8),
  ];
  return mergeGeometries(delen)!;
}

/** Struik: een paar bobbelige trossen, laag en breed. */
export function struikVorm(groen: string, fijn: boolean, seed = 7) {
  const basis = new THREE.Color(groen);
  const midden = new THREE.Vector3(0, 0.3, 0);
  const delen = [
    tros(new THREE.Vector3(0, 0.36, 0), 0.6, 0.72, basis, midden, fijn ? 2 : 1, seed),
    tros(new THREE.Vector3(0.38, 0.28, 0.16), 0.4, 0.75, basis, midden, 1, seed + 3),
    tros(new THREE.Vector3(-0.34, 0.27, -0.2), 0.42, 0.75, basis, midden, 1, seed + 6),
  ];
  return mergeGeometries(delen)!;
}

/** Steen: grillig maar glad, plat onderaan, donkerder in de spleten (kleur = grijswaarde, materiaal geeft de tint). */
export function steenVorm(seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const d = new THREE.Vector3();
  const diep = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const n = fbm(d.x * 1.6 + seed * 3.1, d.y * 1.6, d.z * 1.6, seed, 4);
    // een paar platte breukvlakken door de ruis grof af te ronden
    const breuk = Math.round(n * 5) / 5;
    const r = 0.82 + (n * 0.6 + breuk * 0.4) * 0.42;
    diep[i] = n;
    p.setXYZ(i, d.x * r, Math.max(-0.2, d.y * r) * 0.62, d.z * r * 0.85);
  }
  kleur(g, (_x, y, _z, i) => tmpK.copy(wit).multiplyScalar(0.62 + diep[i] * 0.42 + Math.min(0.08, Math.max(0, y) * 0.1)));
  return glad(g);
}

/** Gedeeld materiaal voor alle bomen en struiken (de kleur zit in de hoekpunten). */
export const boomMateriaal = metFijnDetail(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }), 1.3);

const vormCache = new Map<string, THREE.BufferGeometry>();
/** Een boomvorm uit de voorraad (elke combinatie wordt maar één keer gebouwd). `variant` geeft een andere vorm. */
export function boomVorm(soort: 'den' | 'loof' | 'dood' | 'struik', kleur: string, fijn: boolean, sneeuw = false, variant = 0) {
  const key = `${soort}|${kleur}|${fijn}|${sneeuw}|${variant}`;
  let g = vormCache.get(key);
  if (!g) {
    const seed = 3 + variant * 13;
    g = soort === 'den' ? denVorm(kleur, sneeuw, fijn, seed) : soort === 'loof' ? loofVorm(kleur, fijn, seed) : soort === 'dood' ? doodVorm(kleur, fijn, seed) : struikVorm(kleur, fijn, seed);
    g.name = key;
    vormCache.set(key, g);
  }
  return g;
}
