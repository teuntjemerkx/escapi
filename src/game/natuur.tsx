// Landschap rond het gebouw, in dezelfde zachte low-poly stijl als de rest:
// een uitgesneden stuk aarde (diorama), bossen, rotsen, water, lantaarns, lichtsnoeren,
// vuurvliegjes en sneeuw. Plus randen voor buitenruimtes (heg, hek, reling, muurtje).
//
// Vast (mag in Decor, wordt samengevoegd): Terrein, Den, Loofboom, Rots, Heg, Hekwerk, Reling, Muurtje.
// Levend (alleen in Omgeving of Levend): Bos, Water, Lantaarns, Lichtsnoer, Vuurvliegjes, Sneeuwval, Pollen.
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { metFijnDetail } from './fijn';
import { boomMateriaal, boomVorm, steenVorm } from './vormen';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Plattegrond, Vloer } from '../werelden/types';
import { Blok, mat, seeded, SCHADUW_LAAG } from './kit';
import { donkerder, gloedTex, lichtTex, rotsTextuur, VLOER_KLEUR, vloerTextuur } from './texturen';

type V2 = [number, number];
type V3 = [number, number, number];

export interface Rechthoek {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Rechthoek om alle kamers van een plattegrond. */
export function omtrek(plan: Plattegrond): Rechthoek {
  const r = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const k of plan.kamers) {
    r.minX = Math.min(r.minX, k.pos[0] - k.maat[0] / 2);
    r.maxX = Math.max(r.maxX, k.pos[0] + k.maat[0] / 2);
    r.minZ = Math.min(r.minZ, k.pos[1] - k.maat[1] / 2);
    r.maxZ = Math.max(r.maxZ, k.pos[1] + k.maat[1] / 2);
  }
  return r;
}

/** Afstand van een punt tot een rechthoek (0 als het erin ligt). */
export function afstandTot(r: Rechthoek, x: number, z: number) {
  const dx = Math.max(r.minX - x, 0, x - r.maxX);
  const dz = Math.max(r.minZ - z, 0, z - r.maxZ);
  return Math.hypot(dx, dz);
}

/** Omtrek van de rechthoek + marge, met ronde hoeken en een golvende rand. Punten [x, z]. */
export function terreinRand(r: Rechthoek, marge: number, golf = 0.7, seed = 3, stap = 1.1): V2[] {
  const rnd = seeded(seed);
  const f1 = rnd() * 6.28;
  const f2 = rnd() * 6.28;
  const f3 = rnd() * 6.28;
  const pts: { p: V2; n: V2 }[] = [];
  const lijn = (ax: number, az: number, bx: number, bz: number, n: V2) => {
    const k = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / stap));
    for (let i = 0; i < k; i++) pts.push({ p: [ax + ((bx - ax) * i) / k, az + ((bz - az) * i) / k], n });
  };
  // hoek: richting (cos a, sin a) in (x, z), a loopt terug van a0 naar a0 − 90°
  const hoek = (cx: number, cz: number, a0: number) => {
    const k = Math.max(4, Math.ceil(((Math.PI / 2) * marge) / stap));
    for (let i = 0; i < k; i++) {
      const a = a0 - (i / k) * (Math.PI / 2);
      pts.push({ p: [cx + Math.cos(a) * marge, cz + Math.sin(a) * marge], n: [Math.cos(a), Math.sin(a)] });
    }
  };
  lijn(r.maxX + marge, r.maxZ, r.maxX + marge, r.minZ, [1, 0]);
  hoek(r.maxX, r.minZ, 0);
  lijn(r.maxX, r.minZ - marge, r.minX, r.minZ - marge, [0, -1]);
  hoek(r.minX, r.minZ, -Math.PI / 2);
  lijn(r.minX - marge, r.minZ, r.minX - marge, r.maxZ, [-1, 0]);
  hoek(r.minX, r.maxZ, Math.PI);
  lijn(r.minX, r.maxZ + marge, r.maxX, r.maxZ + marge, [0, 1]);
  hoek(r.maxX, r.maxZ, Math.PI / 2);
  let s = 0;
  return pts.map(({ p, n }, i) => {
    if (i) s += Math.hypot(p[0] - pts[i - 1].p[0], p[1] - pts[i - 1].p[1]);
    const g = golf * (0.55 * Math.sin(s / 4.7 + f1) + 0.3 * Math.sin(s / 2.3 + f2) + 0.15 * Math.sin(s / 1.1 + f3));
    return [p[0] + n[0] * g, p[1] + n[1] * g];
  });
}

/** Zet een omtrek in de draairichting die het Terrein verwacht (zijkanten naar buiten). */
function rechtsom(pts: V2[]): V2[] {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[(i + 1) % pts.length];
    a += x1 * z2 - x2 * z1;
  }
  return a > 0 ? [...pts].reverse() : pts;
}

function binnenVeelhoek(pts: V2[], x: number, z: number) {
  let binnen = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i];
    const [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) binnen = !binnen;
  }
  return binnen;
}

// ── Terrein: het uitgesneden stuk land onder het gebouw ──────────────────

const aardeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });

/**
 * Diorama-plak: bovenop gras (of grind, sneeuw, kinderkopjes), aan de zijkant lagen aarde met steentjes.
 * `vorm` = eigen omtrek [x, z][]; anders een ronde rechthoek met `marge` om het gebouw.
 */
export function Terrein({
  plan,
  marge = 12,
  vorm,
  boven = 'gras',
  bovenKleur,
  lagen = ['#5a3f2b', '#4a3323', '#3b2a1e', '#2b2019'],
  diepte = 3.4,
  golf = 0.8,
  seed = 3,
  stenen = '#6d625a',
  y = 0,
  gaten = [],
  gatDiepte = 1.4,
  gatKleur = '#4f4a50',
}: {
  plan: Plattegrond;
  marge?: number;
  vorm?: V2[];
  boven?: Vloer;
  bovenKleur?: string;
  lagen?: string[];
  diepte?: number;
  golf?: number;
  seed?: number;
  stenen?: string | null;
  y?: number;
  /** Gaten in het land (gracht, haven, vijver): omtrek [x, z][] per gat. Zet er zelf Water in. */
  gaten?: V2[][];
  gatDiepte?: number;
  gatKleur?: string;
}) {
  const kleur = bovenKleur ?? VLOER_KLEUR[boven];
  const basis = vloerTextuur(boven, kleur);
  const { top, zijkant, kiezels } = useMemo(() => {
    const rand = rechtsom(vorm ?? terreinRand(omtrek(plan), marge, golf, seed));
    // bovenkant
    const shape = new THREE.Shape(rand.map(([x, z]) => new THREE.Vector2(x, -z)));
    for (const gat of gaten) shape.holes.push(new THREE.Path(gat.map(([x, z]) => new THREE.Vector2(x, -z))));
    const top = new THREE.ShapeGeometry(shape, 1);
    top.rotateX(-Math.PI / 2);
    const pos = top.attributes.position as THREE.BufferAttribute;
    const uv = top.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 4, pos.getZ(i) / 4);
    top.translate(0, y - 0.004, 0);
    // zijkant in lagen
    const rnd = seeded(seed + 5);
    const banden = [donkerder(kleur, 0.72), ...lagen];
    const dikte = [0.32, ...lagen.map(() => (diepte - 0.32) / lagen.length)];
    const n = rand.length;
    const Y: number[][] = [];
    let acc = 0;
    for (let j = 0; j <= banden.length; j++) {
      Y.push(
        rand.map((_, i) => {
          if (j === 0) return y;
          const golfje = j === banden.length ? Math.sin(i * 0.7) * 0.25 + (rnd() - 0.5) * 0.3 : Math.sin(i * 0.31 + j * 2) * 0.12 + (rnd() - 0.5) * 0.12;
          return y - acc - dikte[j - 1] + golfje;
        }),
      );
      if (j > 0) acc += dikte[j - 1];
    }
    const p: number[] = [];
    const c: number[] = [];
    const kl = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = rand[i];
      const b = rand[(i + 1) % n];
      for (let j = 0; j < banden.length; j++) {
        kl.set(banden[j]).multiplyScalar(0.9 + rnd() * 0.18);
        const ya0 = Y[j][i];
        const yb0 = Y[j][(i + 1) % n];
        const ya1 = Y[j + 1][i];
        const yb1 = Y[j + 1][(i + 1) % n];
        // naar buiten gericht (de rand loopt tegen de klok in)
        p.push(a[0], ya0, a[1], a[0], ya1, a[1], b[0], yb1, b[1]);
        p.push(a[0], ya0, a[1], b[0], yb1, b[1], b[0], yb0, b[1]);
        for (let k = 0; k < 6; k++) c.push(kl.r, kl.g, kl.b);
      }
    }
    // oevers van de gaten: naar binnen gericht, met een donkere bodem
    const oever = new THREE.Color();
    for (const gatRuw of gaten) {
      const gat = [...rechtsom(gatRuw)].reverse();
      for (let i = 0; i < gat.length; i++) {
        const a = gat[i];
        const b = gat[(i + 1) % gat.length];
        const stap = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.2));
        for (let k = 0; k < stap; k++) {
          const a2: V2 = [a[0] + ((b[0] - a[0]) * k) / stap, a[1] + ((b[1] - a[1]) * k) / stap];
          const b2: V2 = [a[0] + ((b[0] - a[0]) * (k + 1)) / stap, a[1] + ((b[1] - a[1]) * (k + 1)) / stap];
          oever.set(gatKleur).multiplyScalar(0.85 + rnd() * 0.25);
          const y0 = y;
          const y1 = y - gatDiepte;
          p.push(a2[0], y0, a2[1], a2[0], y1, a2[1], b2[0], y1, b2[1]);
          p.push(a2[0], y0, a2[1], b2[0], y1, b2[1], b2[0], y0, b2[1]);
          for (let q = 0; q < 6; q++) c.push(oever.r, oever.g, oever.b);
        }
      }
      // bodem
      const bodem = new THREE.ShapeGeometry(new THREE.Shape(gatRuw.map(([x, z]) => new THREE.Vector2(x, -z))));
      bodem.rotateX(-Math.PI / 2);
      const bp = (bodem.index ? bodem.toNonIndexed() : bodem).attributes.position as THREE.BufferAttribute;
      oever.set(gatKleur).multiplyScalar(0.45);
      for (let q = 0; q < bp.count; q++) {
        p.push(bp.getX(q), y - gatDiepte + 0.01, bp.getZ(q));
        c.push(oever.r, oever.g, oever.b);
      }
    }
    const zijkant = new THREE.BufferGeometry();
    zijkant.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    zijkant.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    zijkant.computeVertexNormals();
    // steentjes die uit de zijkant steken
    const kiezels: { p: V3; s: number; r: number }[] = [];
    if (stenen) {
      for (let i = 0; i < n; i += 2) {
        if (rnd() > 0.55) continue;
        const [x, z] = rand[i];
        const [x2, z2] = rand[(i + 1) % n];
        const nx = z2 - z;
        const nz = -(x2 - x);
        const l = Math.hypot(nx, nz) || 1;
        const diep = 0.5 + rnd() * (diepte - 0.9);
        kiezels.push({ p: [x + (nx / l) * 0.05, y - diep, z + (nz / l) * 0.05], s: 0.1 + rnd() * 0.2, r: rnd() * 6 });
      }
    }
    return { top, zijkant, kiezels };
  }, [plan, marge, vorm, golf, seed, lagen, diepte, kleur, stenen, y, gaten, gatDiepte, gatKleur]);
  useEffect(
    () => () => {
      top.dispose();
      zijkant.dispose();
    },
    [top, zijkant],
  );
  const map = useMemo(() => {
    const t = basis.clone();
    t.needsUpdate = true;
    return t;
  }, [basis]);
  return (
    <group>
      <mesh geometry={top} receiveShadow>
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
      <mesh geometry={zijkant} material={aardeMat} receiveShadow />
      {kiezels.map((k, i) => (
        <mesh key={i} position={k.p} rotation={[k.r, k.r * 2, 0]} scale={[k.s, k.s * 0.75, k.s]} material={mat(stenen ?? '#6d625a', { flat: true })}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Bomen ────────────────────────────────────────────────────────────────

function kleurHoekpunten(g: THREE.BufferGeometry, kleur: (y: number, x: number, z: number) => THREE.Color) {
  const p = g.attributes.position as THREE.BufferAttribute;
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const k = kleur(p.getY(i), p.getX(i), p.getZ(i));
    c[i * 3] = k.r;
    c[i * 3 + 1] = k.g;
    c[i * 3 + 2] = k.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
/** Den: stam en lagen hangende takken. Hoogte ± 4,4 m. */
export function denGeo(groen = '#ffffff', sneeuw = false, fijn = false) {
  const key = `den${groen}${sneeuw}${fijn}`;
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = boomVorm('den', groen, fijn, sneeuw)));
  return g;
}

/** Loofboom: stam met takken en een bobbelige kruin. Hoogte ± 4,2 m. */
export function loofGeo(groen = '#ffffff', fijn = false) {
  const key = `loof${groen}${fijn}`;
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = boomVorm('loof', groen, fijn)));
  return g;
}

/** Dode boom: kale stam met kromme takken (spookbos). */
export function doodGeo(kleur = '#ffffff', fijn = false) {
  const key = `dood${kleur}${fijn}`;
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = boomVorm('dood', kleur, fijn)));
  return g;
}

/** Struik: een paar bobbelige trossen. */
export function struikGeo(groen = '#ffffff', fijn = false) {
  const key = `struik${groen}${fijn}`;
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = boomVorm('struik', groen, fijn)));
  return g;
}

const boomMat = boomMateriaal;

/** Losse den (bv. in een tuin). Mag in Decor. */
export function Den({ pos, s = 1, kleur = '#2f5a3a', sneeuw = false, rot = 0 }: { pos: V3; s?: number; kleur?: string; sneeuw?: boolean; rot?: number }) {
  return <mesh geometry={denGeo(kleur, sneeuw, true)} material={boomMat} position={pos} scale={s} rotation={[0, rot, 0]} castShadow receiveShadow />;
}
/** Losse loofboom. Mag in Decor. */
export function Loofboom({ pos, s = 1, kleur = '#4f7d3a', rot = 0 }: { pos: V3; s?: number; kleur?: string; rot?: number }) {
  return <mesh geometry={loofGeo(kleur, true)} material={boomMat} position={pos} scale={s} rotation={[0, rot, 0]} castShadow receiveShadow />;
}
/** Losse struik. Mag in Decor. */
export function Bosje({ pos, s = 1, kleur = '#3f6a35' }: { pos: V3; s?: number; kleur?: string }) {
  return <mesh geometry={struikGeo(kleur, true)} material={boomMat} position={pos} scale={s} castShadow receiveShadow />;
}

/** Rots: platte, grillige steen. Mag in Decor. */
const steenMats = new Map<string, THREE.MeshStandardMaterial>();
export function Rots({ pos, s = 1, kleur = '#6f6b66', rot = 0, seed = 1 }: { pos: V3; s?: number; kleur?: string; rot?: number; seed?: number }) {
  const geo = useMemo(() => {
    const key = `rots${seed % 6}`;
    let g = geoCache.get(key);
    if (!g) geoCache.set(key, (g = steenVorm((seed % 6) + 40)));
    return g;
  }, [seed]);
  let m = steenMats.get(kleur);
  if (!m) steenMats.set(kleur, (m = metFijnDetail(new THREE.MeshStandardMaterial({ color: kleur, vertexColors: true, roughness: 0.95 }), 1.5)));
  return <mesh geometry={geo} material={m} position={pos} rotation={[0, rot, 0]} scale={s} castShadow receiveShadow />;
}

function instanties(geo: THREE.BufferGeometry, materiaal: THREE.Material, lijst: { p: V3; s: number; r: number; k?: THREE.Color }[], schaduw = true) {
  const m = new THREE.InstancedMesh(geo, materiaal, Math.max(1, lijst.length));
  const o = new THREE.Object3D();
  lijst.forEach((b, i) => {
    o.position.set(...b.p);
    o.rotation.set(0, b.r, 0);
    o.scale.setScalar(b.s);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
    if (b.k) m.setColorAt(i, b.k);
  });
  m.count = lijst.length;
  m.castShadow = schaduw;
  if (schaduw) m.layers.enable(SCHADUW_LAAG);
  m.receiveShadow = true;
  m.computeBoundingSphere();
  return m;
}

/**
 * Bos rondom het gebouw: kleine bomen dichtbij, hoge donkere bomen verder weg.
 * `van`/`tot` = afstand tot de kamers (m). `vrij` = open plekken [x, z, straal] (paden, open plek).
 * `binnen` = eigen omtrek waarbinnen het bos moet blijven (bv. de rand van het Terrein).
 */
export function Bos({
  plan,
  van = 2.5,
  tot = 12,
  n = 240,
  soort = 'den',
  kleuren = ['#26452f', '#1e3a28', '#2d5035', '#1a3223', '#33563a'],
  sneeuw = false,
  schaal = [0.85, 1.75],
  vrij = [],
  binnen,
  struiken = 0.35,
  seed = 11,
  langsKamers = false,
}: {
  plan: Plattegrond;
  van?: number;
  tot?: number;
  n?: number;
  soort?: 'den' | 'loof' | 'mix' | 'spook';
  kleuren?: string[];
  sneeuw?: boolean;
  schaal?: V2;
  vrij?: [number, number, number][];
  binnen?: V2[];
  struiken?: number;
  seed?: number;
  /** Meet de afstand tot de dichtstbijzijnde kamer (bos tot vlak langs een bospad), in plaats van tot de rechthoek om het gebouw. */
  langsKamers?: boolean;
}) {
  const groep = useMemo(() => {
    const r = omtrek(plan);
    const kamers: Rechthoek[] = plan.kamers
      .filter((k) => (k.verdieping ?? 0) === 0)
      .map((k) => ({ minX: k.pos[0] - k.maat[0] / 2, maxX: k.pos[0] + k.maat[0] / 2, minZ: k.pos[1] - k.maat[1] / 2, maxZ: k.pos[1] + k.maat[1] / 2 }));
    const afstand = (x: number, z: number) => (langsKamers ? Math.min(...kamers.map((k) => afstandTot(k, x, z))) : afstandTot(r, x, z));
    const rnd = seeded(seed);
    const bomen: { p: V3; s: number; r: number; k: THREE.Color; loof: boolean }[] = [];
    const bosjes: { p: V3; s: number; r: number; k: THREE.Color }[] = [];
    const cel = new Map<string, V2[]>();
    const minAfst = 1.25;
    const vrijOp = (x: number, z: number, m: number) => vrij.every(([vx, vz, vr]) => Math.hypot(x - vx, z - vz) > vr + m);
    const buren = (x: number, z: number) => {
      const cx = Math.floor(x / 2);
      const cz = Math.floor(z / 2);
      for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++) for (const [bx, bz] of cel.get(`${cx + i},${cz + j}`) ?? []) if (Math.hypot(bx - x, bz - z) < minAfst) return true;
      return false;
    };
    for (let poging = 0; poging < n * 30 && bomen.length < n; poging++) {
      const x = r.minX - tot + rnd() * (r.maxX - r.minX + tot * 2);
      const z = r.minZ - tot + rnd() * (r.maxZ - r.minZ + tot * 2);
      const d = afstand(x, z);
      if (d < van || d > tot) continue;
      if (binnen && !binnenVeelhoek(binnen, x, z)) continue;
      if (!vrijOp(x, z, 0.8) || buren(x, z)) continue;
      const t = (d - van) / Math.max(0.1, tot - van);
      const s = (schaal[0] + (schaal[1] - schaal[0]) * Math.min(1, t * 1.3)) * (0.82 + rnd() * 0.36);
      const k = new THREE.Color(kleuren[Math.floor(rnd() * kleuren.length)]).multiplyScalar(0.9 + rnd() * 0.2);
      const loof = soort === 'loof' || (soort === 'mix' && rnd() < 0.35) || (soort === 'spook' && rnd() < 0.3);
      const kk = soort === 'spook' && loof ? new THREE.Color('#4a4048').multiplyScalar(0.8 + rnd() * 0.4) : k;
      bomen.push({ p: [x, 0, z], s, r: rnd() * 6.28, k: sneeuw ? new THREE.Color(1, 1, 1).multiplyScalar(0.86 + rnd() * 0.18) : kk, loof });
      const key = `${Math.floor(x / 2)},${Math.floor(z / 2)}`;
      if (!cel.has(key)) cel.set(key, []);
      cel.get(key)!.push([x, z]);
    }
    // struikjes aan de bosrand
    const nStruik = Math.round(bomen.length * struiken);
    for (let poging = 0; poging < nStruik * 30 && bosjes.length < nStruik; poging++) {
      const x = r.minX - tot + rnd() * (r.maxX - r.minX + tot * 2);
      const z = r.minZ - tot + rnd() * (r.maxZ - r.minZ + tot * 2);
      const d = afstand(x, z);
      if (d < Math.max(0.4, van - 1) || d > van + 4) continue;
      if (binnen && !binnenVeelhoek(binnen, x, z)) continue;
      if (!vrijOp(x, z, 0.3)) continue;
      const k = new THREE.Color(kleuren[Math.floor(rnd() * kleuren.length)]).multiplyScalar(1.05 + rnd() * 0.25);
      bosjes.push({ p: [x, 0, z], s: 0.7 + rnd() * 0.8, r: rnd() * 6.28, k: sneeuw ? new THREE.Color('#e4ecf2') : k });
    }
    const g = new THREE.Group();
    const den = bomen.filter((b) => !b.loof);
    const loof = bomen.filter((b) => b.loof);
    const groen = sneeuw ? kleuren[0] : '#ffffff';
    if (den.length) g.add(instanties(denGeo(groen, sneeuw), boomMat, den));
    if (loof.length) g.add(instanties(soort === 'spook' ? doodGeo('#ffffff') : loofGeo('#ffffff'), boomMat, loof));
    if (bosjes.length) g.add(instanties(struikGeo('#ffffff'), boomMat, bosjes));
    return g;
  }, [plan, van, tot, n, soort, kleuren, sneeuw, schaal, vrij, binnen, struiken, seed, langsKamers]);
  useEffect(() => () => groep.children.forEach((c) => (c as THREE.InstancedMesh).dispose()), [groep]);
  return <primitive object={groep} />;
}

// ── Randen van buitenruimtes ─────────────────────────────────────────────

/** Heg langs een lijn van a naar b (x/z). Mag in Decor. */
export function Heg({ a, b, h = 1.05, d = 0.7, kleur = '#3f6b37', seed = 1 }: { a: V2; b: V2; h?: number; d?: number; kleur?: string; seed?: number }) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const hoek = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  const bollen = useMemo(() => {
    const rnd = seeded(seed + Math.round(l * 10));
    const n = Math.max(1, Math.round(l / 0.75));
    return Array.from({ length: n }, (_, i) => ({ x: -l / 2 + ((i + 0.5) / n) * l + (rnd() - 0.5) * 0.2, s: 0.32 + rnd() * 0.14, y: h - 0.08 + rnd() * 0.06, z: (rnd() - 0.5) * 0.18 }));
  }, [l, h, seed]);
  return (
    <group position={[(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2]} rotation={[0, hoek, 0]}>
      <Blok size={[l, h, d]} pos={[0, h / 2, 0]} color={kleur} r={0.22} rough={1} />
      {bollen.map((k, i) => (
        <mesh key={i} position={[k.x, k.y - 0.06, k.z]} scale={[k.s * 1.35, k.s * 0.8, k.s * 1.2]} material={mat(donkerder(kleur, 1.1), { flat: true, rough: 1 })} castShadow>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

/** Houten hek met latjes. Mag in Decor. */
export function Hekwerk({ a, b, h = 1.0, kleur = '#efe6d6' }: { a: V2; b: V2; h?: number; kleur?: string }) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const hoek = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  const latten = Math.max(2, Math.round(l / 0.16));
  const palen = Math.max(2, Math.round(l / 1.8) + 1);
  return (
    <group position={[(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2]} rotation={[0, hoek, 0]}>
      {Array.from({ length: palen }, (_, i) => (
        <Blok key={`p${i}`} size={[0.11, h + 0.1, 0.11]} pos={[-l / 2 + (i / (palen - 1)) * l, (h + 0.1) / 2, 0]} color={donkerder(kleur, 0.85)} r={0.02} />
      ))}
      <Blok size={[l, 0.07, 0.05]} pos={[0, h * 0.3, 0.06]} color={kleur} r={0} />
      <Blok size={[l, 0.07, 0.05]} pos={[0, h * 0.75, 0.06]} color={kleur} r={0} />
      {Array.from({ length: latten }, (_, i) => (
        <Blok key={`l${i}`} size={[0.08, h - 0.08, 0.025]} pos={[-l / 2 + ((i + 0.5) / latten) * l, (h - 0.08) / 2 + 0.04, 0.095]} color={kleur} r={0} shadow={false} />
      ))}
    </group>
  );
}

/** Metalen reling (kade, balkon). Mag in Decor. */
export function Reling({ a, b, h = 1.05, kleur = '#2d3338' }: { a: V2; b: V2; h?: number; kleur?: string }) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const hoek = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  const palen = Math.max(2, Math.round(l / 1.5) + 1);
  const m = mat(kleur, { metal: 0.6, rough: 0.45 });
  return (
    <group position={[(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2]} rotation={[0, hoek, 0]}>
      {Array.from({ length: palen }, (_, i) => (
        <mesh key={i} position={[-l / 2 + (i / (palen - 1)) * l, h / 2, 0]} material={m} castShadow>
          <cylinderGeometry args={[0.035, 0.035, h, 8]} />
        </mesh>
      ))}
      {[h, h * 0.55, h * 0.12].map((y, i) => (
        <mesh key={`r${i}`} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} material={m}>
          <cylinderGeometry args={[i ? 0.018 : 0.03, i ? 0.018 : 0.03, l, 8]} />
        </mesh>
      ))}
    </group>
  );
}

/** Smeedijzeren spijlenhek met speerpunten (kerkhof, kasteel). Mag in Decor. */
export function Spijlenhek({ a, b, h = 1.35, kleur = '#1f1c22' }: { a: V2; b: V2; h?: number; kleur?: string }) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const hoek = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  const spijlen = Math.max(2, Math.round(l / 0.16));
  const palen = Math.max(2, Math.round(l / 2.2) + 1);
  const m = mat(kleur, { metal: 0.5, rough: 0.5 });
  return (
    <group position={[(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2]} rotation={[0, hoek, 0]}>
      {Array.from({ length: palen }, (_, i) => (
        <group key={`p${i}`} position={[-l / 2 + (i / (palen - 1)) * l, 0, 0]}>
          <Blok size={[0.32, h + 0.2, 0.32]} pos={[0, (h + 0.2) / 2, 0]} color="#5f5a62" r={0.03} />
          <mesh position={[0, h + 0.3, 0]} material={mat('#6f6a72', { flat: true })} castShadow>
            <coneGeometry args={[0.24, 0.22, 4]} />
          </mesh>
        </group>
      ))}
      <Blok size={[l, 0.05, 0.05]} pos={[0, 0.18, 0]} color={kleur} r={0} />
      <Blok size={[l, 0.05, 0.05]} pos={[0, h - 0.12, 0]} color={kleur} r={0} />
      {Array.from({ length: spijlen }, (_, i) => {
        const x = -l / 2 + ((i + 0.5) / spijlen) * l;
        return (
          <group key={`s${i}`} position={[x, 0, 0]}>
            <Blok size={[0.035, h, 0.035]} pos={[0, h / 2, 0]} color={kleur} r={0} shadow={false} />
            <mesh position={[0, h + 0.06, 0]} material={m}>
              <coneGeometry args={[0.04, 0.14, 4]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Laag gemetseld muurtje met afdekband. Mag in Decor. */
export function Muurtje({ a, b, h = 0.8, kleur = '#9c5a43', kantelen = false }: { a: V2; b: V2; h?: number; kleur?: string; kantelen?: boolean }) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const hoek = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  const n = Math.max(1, Math.floor(l / 0.95));
  return (
    <group position={[(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2]} rotation={[0, hoek, 0]}>
      <Blok size={[l, h - 0.08, 0.4]} pos={[0, (h - 0.08) / 2, 0]} color={kleur} r={0.03} />
      <Blok size={[l + 0.06, 0.1, 0.5]} pos={[0, h - 0.05, 0]} color={kantelen ? donkerder(kleur, 0.85) : '#b9b0a4'} r={0.03} />
      {kantelen &&
        Array.from({ length: n }, (_, i) => (
          <Blok key={i} size={[0.48, 0.5, 0.42]} pos={[-l / 2 + ((i + 0.5) / n) * l, h + 0.25, 0]} color={donkerder(kleur, 0.85)} r={0.03} />
        ))}
    </group>
  );
}

// ── Licht buiten ─────────────────────────────────────────────────────────

const gloedMats = new Map<string, THREE.PointsMaterial>();
function gloedMat(kleur: string, grootte: number) {
  const key = `${kleur}${grootte}`;
  let m = gloedMats.get(key);
  if (!m) {
    m = new THREE.PointsMaterial({ map: gloedTex(), color: kleur, size: grootte, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
    gloedMats.set(key, m);
  }
  return m;
}

function punten(lijst: V3[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(lijst.flat(), 3));
  return g;
}

/**
 * Lantaarnpalen met gloed en een lichtvlek op de grond, allemaal samen in een paar tekenstappen.
 * `punten` = [x, z] of [x, z, draaiing].
 */
export function Lantaarns({ punten: lijst, h = 3.3, kleur = '#ffcf8a', paal = '#23282c', vlek = 3.2 }: { punten: (V2 | V3)[]; h?: number; kleur?: string; paal?: string; vlek?: number }) {
  const { palen, koppen, gloed, vlekken } = useMemo(() => {
    const voet = new THREE.CylinderGeometry(0.16, 0.2, 0.35, 8);
    voet.translate(0, 0.175, 0);
    const stok = new THREE.CylinderGeometry(0.05, 0.065, h, 8);
    stok.translate(0, h / 2, 0);
    const kap = new THREE.ConeGeometry(0.3, 0.26, 6);
    kap.translate(0, h + 0.5, 0);
    const paalGeo = mergeGeometries([voet, stok, kap].map((g) => g.toNonIndexed()))!;
    const kop = new THREE.CylinderGeometry(0.2, 0.14, 0.42, 6);
    kop.translate(0, h + 0.18, 0);
    const lijst3 = lijst.map((p) => ({ p: [p[0], 0, p[1]] as V3, s: 1, r: p[2] ?? 0 }));
    const palen = instanties(paalGeo, mat(paal, { metal: 0.5, rough: 0.5 }), lijst3);
    const koppen = instanties(kop, new THREE.MeshBasicMaterial({ color: kleur, toneMapped: false }), lijst3, false);
    const gloed = new THREE.Points(
      punten(lijst.map((p) => [p[0], h + 0.2, p[1]] as V3)),
      gloedMat(kleur, 2.6),
    );
    const vlakMat = new THREE.MeshBasicMaterial({ map: lichtTex(), color: kleur, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const vlak = new THREE.PlaneGeometry(vlek * 2, vlek * 2);
    vlak.rotateX(-Math.PI / 2);
    vlak.translate(0, 0.04, 0);
    const vlekken = instanties(vlak, vlakMat, lijst3, false);
    vlekken.receiveShadow = false;
    return { palen, koppen, gloed, vlekken };
  }, [lijst, h, kleur, paal, vlek]);
  return (
    <>
      <primitive object={palen} />
      <primitive object={koppen} />
      <primitive object={gloed} />
      <primitive object={vlekken} />
    </>
  );
}

/** Lichtsnoer dat doorhangt tussen punten [x, y, z]. Lampjes in afwisselende kleuren. */
export function Lichtsnoer({ punten: lijst, kleuren = ['#ffd27a'], zak = 0.45, per = 0.55, draad = '#2a2522' }: { punten: V3[]; kleuren?: string[]; zak?: number; per?: number; draad?: string }) {
  const { lijn, lampjes } = useMemo(() => {
    const lijnPts: number[] = [];
    const lampPts: Record<string, V3[]> = {};
    kleuren.forEach((k) => (lampPts[k] = []));
    let n = 0;
    for (let i = 0; i + 1 < lijst.length; i++) {
      const a = lijst[i];
      const b = lijst[i + 1];
      const l = Math.hypot(b[0] - a[0], b[2] - a[2]);
      const stappen = Math.max(4, Math.ceil(l / 0.25));
      const op = (t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - zak * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
      for (let s = 0; s < stappen; s++) lijnPts.push(...op(s / stappen), ...op((s + 1) / stappen));
      const k = Math.max(1, Math.round(l / per));
      for (let j = 0; j < k; j++) {
        const p = op((j + 0.5) / k);
        lampPts[kleuren[n++ % kleuren.length]].push([p[0], p[1] - 0.06, p[2]]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(lijnPts, 3));
    const lijn = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: draad }));
    const lampjes = Object.entries(lampPts)
      .filter(([, p]) => p.length)
      .map(([k, p]) => new THREE.Points(punten(p), gloedMat(k, 0.55)));
    return { lijn, lampjes };
  }, [lijst, kleuren, zak, per, draad]);
  return (
    <>
      <primitive object={lijn} />
      {lampjes.map((p, i) => (
        <primitive key={i} object={p} />
      ))}
    </>
  );
}

// ── Deeltjes: vuurvliegjes en sneeuw ─────────────────────────────────────

function useSchaalPx(m: THREE.ShaderMaterial) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const dpr = useThree((s) => s.viewport.dpr);
  useFrame((st) => {
    m.uniforms.uTijd.value = st.clock.elapsedTime;
    m.uniforms.uPx.value = (size.height * dpr) / (2 * Math.tan(((camera.fov ?? 42) * Math.PI) / 360));
  });
}

/** Zwevende, knipperende lichtjes in een gebied [x, z, breedte, diepte]. */
export function Vuurvliegjes({ gebied, n = 50, kleur = '#d8ff7a', hoogte = [0.3, 2.4], grootte = 0.16 }: { gebied: [number, number, number, number]; n?: number; kleur?: string; hoogte?: V2; grootte?: number }) {
  const { geo, materiaal } = useMemo(() => {
    const rnd = seeded(91);
    const p: number[] = [];
    const f: number[] = [];
    for (let i = 0; i < n; i++) {
      p.push(gebied[0] + (rnd() - 0.5) * gebied[2], hoogte[0] + rnd() * (hoogte[1] - hoogte[0]), gebied[1] + (rnd() - 0.5) * gebied[3]);
      f.push(rnd());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute('aFase', new THREE.Float32BufferAttribute(f, 1));
    const materiaal = new THREE.ShaderMaterial({
      uniforms: { uTijd: { value: 0 }, uPx: { value: 900 }, uGrootte: { value: grootte }, uKleur: { value: new THREE.Color(kleur) } },
      vertexShader: /* glsl */ `
        uniform float uTijd; uniform float uPx; uniform float uGrootte;
        attribute float aFase; varying float vA; varying float vN;
        void main() {
          vec3 p = position;
          float t = uTijd * 0.5 + aFase * 40.0;
          p += vec3(sin(t * 0.9) * 0.9, sin(t * 1.3 + aFase * 7.0) * 0.35, cos(t * 0.7) * 0.9);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          // vlak voor de camera vervagen ze (anders zie je grote groene vlekken)
          vA = pow(0.5 + 0.5 * sin(uTijd * (1.5 + aFase * 2.0) + aFase * 30.0), 3.0);
          vN = smoothstep(0.8, 2.5, -mv.z);
          gl_PointSize = min(uGrootte * uPx / -mv.z * (0.6 + vA), 28.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uKleur; varying float vA; varying float vN;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uKleur * (0.6 + a), a * a * (0.15 + vA) * vN);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, materiaal };
  }, [gebied, n, kleur, hoogte, grootte]);
  useSchaalPx(materiaal);
  return <points geometry={geo} material={materiaal} frustumCulled={false} />;
}

/** Vallende sneeuw in een gebied [x, z, breedte, diepte]. */
export function Sneeuwval({ gebied, n = 900, hoogte = 14, grootte = 0.07 }: { gebied: [number, number, number, number]; n?: number; hoogte?: number; grootte?: number }) {
  const { geo, materiaal } = useMemo(() => {
    const rnd = seeded(57);
    const p: number[] = [];
    const f: number[] = [];
    for (let i = 0; i < n; i++) {
      p.push(gebied[0] + (rnd() - 0.5) * gebied[2], rnd() * hoogte, gebied[1] + (rnd() - 0.5) * gebied[3]);
      f.push(rnd());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute('aFase', new THREE.Float32BufferAttribute(f, 1));
    const materiaal = new THREE.ShaderMaterial({
      uniforms: { uTijd: { value: 0 }, uPx: { value: 900 }, uGrootte: { value: grootte }, uH: { value: hoogte } },
      vertexShader: /* glsl */ `
        uniform float uTijd; uniform float uPx; uniform float uGrootte; uniform float uH;
        attribute float aFase; varying float vA;
        void main() {
          vec3 p = position;
          p.y = mod(p.y - uTijd * (0.7 + aFase * 0.6), uH);
          p.x += sin(uTijd * 0.6 + aFase * 20.0) * 0.5;
          p.z += cos(uTijd * 0.4 + aFase * 13.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vA = smoothstep(0.0, 1.5, p.y) * smoothstep(uH, uH - 2.0, p.y);
          gl_PointSize = uGrootte * uPx / -mv.z * (0.7 + aFase * 0.6);
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.15, d);
          gl_FragColor = vec4(vec3(1.0), a * 0.85 * vA);
        }`,
      transparent: true,
      depthWrite: false,
    });
    return { geo, materiaal };
  }, [gebied, n, hoogte, grootte]);
  useSchaalPx(materiaal);
  return <points geometry={geo} material={materiaal} frustumCulled={false} />;
}

/** Grassprieten-plukjes in een gebied [x, z, breedte, diepte], buiten de `vrij`-cirkels. */
export function Pollen({ gebied, n = 300, kleur = '#5e8f3d', vrij = [], seed = 5 }: { gebied: [number, number, number, number]; n?: number; kleur?: string; vrij?: [number, number, number][]; seed?: number }) {
  const mesh = useMemo(() => {
    const blad = (r: number) => {
      const g = new THREE.ConeGeometry(0.05, 0.42, 3, 1).toNonIndexed();
      g.translate(0, 0.21, 0);
      g.rotateZ(0.25);
      g.rotateY(r);
      return g;
    };
    const geo = mergeGeometries([blad(0), blad(2.1), blad(4.2), blad(1)])!;
    const rnd = seeded(seed);
    const lijst: { p: V3; s: number; r: number; k: THREE.Color }[] = [];
    for (let i = 0; i < n * 4 && lijst.length < n; i++) {
      const x = gebied[0] + (rnd() - 0.5) * gebied[2];
      const z = gebied[1] + (rnd() - 0.5) * gebied[3];
      if (vrij.some(([vx, vz, vr]) => Math.hypot(x - vx, z - vz) < vr)) continue;
      lijst.push({ p: [x, 0, z], s: 0.7 + rnd() * 0.7, r: rnd() * 6.28, k: new THREE.Color(kleur).multiplyScalar(0.8 + rnd() * 0.45) });
    }
    return instanties(geo, mat('#ffffff', { flat: true, rough: 1 }), lijst, false);
  }, [gebied, n, kleur, vrij, seed]);
  return <primitive object={mesh} />;
}

// ── Water ───────────────────────────────────────────────────────────────

let golfNormaalCache: THREE.Texture | null = null;
function golfNormaal() {
  if (golfNormaalCache) return golfNormaalCache;
  const N = 256;
  const h = new Float32Array(N * N);
  const rnd = seeded(23);
  const golven = Array.from({ length: 9 }, () => ({ kx: Math.round((rnd() - 0.5) * 12), ky: Math.round((rnd() - 0.5) * 12), f: rnd() * 6.28, a: 0.4 + rnd() }));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let v = 0;
      for (const g of golven) v += g.a * Math.sin(((g.kx * x + g.ky * y) / N) * Math.PI * 2 + g.f);
      h[y * N + x] = v;
    }
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(N, N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const dx = h[y * N + ((x + 1) % N)] - h[y * N + ((x - 1 + N) % N)];
      const dy = h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x];
      const n = new THREE.Vector3(-dx * 0.6, -dy * 0.6, 1).normalize();
      const i = (y * N + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  golfNormaalCache = t;
  return t;
}

/**
 * Water: een glinsterend wateroppervlak met een doorzichtige zijkant (diepte zichtbaar aan de rand van het diorama).
 * `pos` = midden [x, z], `maat` = [b, d], `y` = hoogte van het oppervlak (meestal iets onder 0).
 */
export function Water({ pos, maat, y = -0.45, diepte = 2.6, kleur = '#2b6f86', diep = '#0d3442', zijkant = true, golf = 1 }: { pos: V2; maat: V2; y?: number; diepte?: number; kleur?: string; diep?: string; zijkant?: boolean; golf?: number }) {
  const { boven, onder } = useMemo(() => {
    const n = golfNormaal().clone();
    n.needsUpdate = true;
    n.repeat.set(maat[0] / 9, maat[1] / 9);
    const boven = new THREE.MeshStandardMaterial({ color: kleur, roughness: 0.08, metalness: 0.05, normalMap: n, normalScale: new THREE.Vector2(0.55 * golf, 0.55 * golf), transparent: true, opacity: 0.94, envMapIntensity: 1.6 });
    const onder = new THREE.MeshStandardMaterial({ color: diep, roughness: 0.4, transparent: true, opacity: 0.82 });
    return { boven, onder };
  }, [maat, kleur, diep, golf]);
  useFrame((_, dt) => {
    const n = boven.normalMap!;
    n.offset.x += dt * 0.012;
    n.offset.y += dt * 0.007;
  });
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={boven} receiveShadow>
        <planeGeometry args={maat} />
      </mesh>
      {zijkant && (
        <mesh position={[0, y - diepte / 2 - 0.01, 0]} material={onder}>
          <boxGeometry args={[maat[0] - 0.02, diepte, maat[1] - 0.02]} />
        </mesh>
      )}
    </group>
  );
}

// ── Kampvuur en paddenstoelen ───────────────────────────────────────────

/** Kampvuur met knetterende vlammen en gloed (levend: in Omgeving). Steenkring en houtblokken doen mee. */
export function Kampvuur({ pos, s = 1 }: { pos: V2; s?: number }) {
  const vlammen = useMemo(
    () => [
      { x: 0, z: 0, h: 0.75, r: 0.26, k: '#ffb347' },
      { x: 0.12, z: 0.08, h: 0.55, r: 0.18, k: '#ff7a2f' },
      { x: -0.12, z: -0.06, h: 0.5, r: 0.17, k: '#ff8f3a' },
      { x: 0.02, z: -0.12, h: 0.42, r: 0.14, k: '#ffd36b' },
    ],
    [],
  );
  const refs = useMemo(() => vlammen.map(() => ({ current: null as THREE.Mesh | null })), [vlammen]);
  const gloed = useMemo(() => new THREE.Points(punten([[0, 0.55, 0]]), gloedMat('#ff9a40', 3.4)), []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    refs.forEach((r, i) => {
      if (!r.current) return;
      const f = 0.82 + 0.18 * Math.sin(t * (7 + i * 2.3) + i) + 0.08 * Math.sin(t * 17 + i * 5);
      r.current.scale.set(1, f, 1);
      r.current.rotation.y = t * (0.6 + i * 0.3);
    });
    (gloed.material as THREE.PointsMaterial).size = 3.2 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.15;
  });
  const stenen = Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2);
  return (
    <group position={[pos[0], 0, pos[1]]} scale={s}>
      {stenen.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.62, 0.08, Math.sin(a) * 0.62]} scale={[0.17, 0.12, 0.14]} rotation={[0, a, 0]} material={mat('#6f6a64', { flat: true })} castShadow>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
      {[0, 1.1, 2.2].map((a, i) => (
        <mesh key={`h${i}`} position={[0, 0.1, 0]} rotation={[0, a, Math.PI / 2 - 0.35]} material={mat('#4a3424', { flat: true })}>
          <cylinderGeometry args={[0.06, 0.07, 0.9, 6]} />
        </mesh>
      ))}
      {vlammen.map((v, i) => (
        <mesh
          key={`v${i}`}
          ref={(m) => {
            refs[i].current = m;
          }}
          position={[v.x, 0.12, v.z]}
        >
          <coneGeometry args={[v.r, v.h, 6]} />
          <meshBasicMaterial color={v.k} toneMapped={false} transparent opacity={0.9} />
        </mesh>
      ))}
      <primitive object={gloed} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial map={lichtTex()} color="#ff9a50" transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Paddenstoel (vliegenzwam). Mag in Decor. */
export function Paddenstoel({ pos, s = 1 }: { pos: V3; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.1, 0]} material={mat('#efe6d6')}>
        <cylinderGeometry args={[0.035, 0.045, 0.2, 8]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} material={mat('#d8402f', { rough: 0.6 })} castShadow>
        <sphereGeometry args={[0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.07, 0.29, Math.sin(a) * 0.07]} material={mat('#ffffff')}>
          <sphereGeometry args={[0.018, 6, 4]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Een grote rots waar een kasteel op staat (zoals Bran): de bovenkant volgt `vorm` (veelhoek [x, z] op hoogte `top`),
 * naar beneden toe bolt de rots onregelmatig uit en loopt hij uit in puin tot `bodem`. Kalksteen met scheuren.
 * `licht`: warm licht van onderen (schijnwerpers in het bos), als een gloed die naar boven toe zwakker wordt.
 * `open`: stukken van de bovenrand [x, z, straal] waar de rots niet over de rand komt (een pad dat omhoog loopt).
 */
export function Rotsblok({
  vorm,
  top = 0,
  bodem = -10,
  kleur = '#b3a690',
  licht = '#ffae5c',
  seed = 7,
}: {
  vorm: V2[];
  top?: number;
  bodem?: number;
  kleur?: string;
  licht?: string | null;
  seed?: number;
}) {
  const { geo, gloed } = useMemo(() => {
    const rnd = seeded(seed);
    // rand fijn verdelen (elke ~1,6 m een punt)
    const rand: V2[] = [];
    for (let i = 0; i < vorm.length; i++) {
      const a = vorm[i];
      const b = vorm[(i + 1) % vorm.length];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.max(1, Math.round(l / 1.6));
      for (let k = 0; k < n; k++) rand.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    const N = rand.length;
    // naar buiten wijzende normaal per randpunt
    let cx = 0;
    let cz = 0;
    for (const [x, z] of rand) {
      cx += x / N;
      cz += z / N;
    }
    const uit = rand.map(([x, z], i) => {
      const a = rand[(i + N - 1) % N];
      const b = rand[(i + 1) % N];
      let nx = b[1] - a[1];
      let nz = -(b[0] - a[0]);
      const l = Math.hypot(nx, nz) || 1;
      nx /= l;
      nz /= l;
      // wijst hij naar binnen? omdraaien
      if (nx * (x - cx) + nz * (z - cz) < 0) {
        nx = -nx;
        nz = -nz;
      }
      return [nx, nz] as V2;
    });
    // ringen van boven naar beneden: uitbollen, inzakken, onderaan breed puin
    const H = top - bodem;
    const ringen = [0, 0.06, 0.18, 0.34, 0.5, 0.66, 0.8, 0.92, 1];
    const ruis = rand.map(() => ringen.map(() => rnd()));
    const golf = rand.map((_, i) => Math.sin(i * 0.7 + seed) * 0.5 + Math.sin(i * 0.23 + seed * 2) * 0.8);
    const punt = (i: number, r: number) => {
      const t = ringen[r];
      const y = top - t * H - (r === 0 ? 0 : (ruis[i][r] - 0.5) * 0.6);
      const bol = r === 0 ? 0 : 0.25 + Math.sin(t * Math.PI * 1.3) * 1.1 + golf[i] * 0.8 * t + ruis[i][r] * 0.9 + t * t * 3.2;
      return new THREE.Vector3(rand[i][0] + uit[i][0] * bol, y, rand[i][1] + uit[i][1] * bol);
    };
    const pos: number[] = [];
    const uv: number[] = [];
    const kleuren: number[] = [];
    const lk = new THREE.Color(licht ?? '#000000');
    let omtrek = 0;
    const lengte = rand.map((p, i) => {
      const u = omtrek;
      const q = rand[(i + 1) % N];
      omtrek += Math.hypot(q[0] - p[0], q[1] - p[1]);
      return u;
    });
    // schijnwerpers: een paar plekken rondom waar het licht het sterkst is
    const spots = Array.from({ length: 5 }, () => rnd() * N);
    const sterkte = (i: number, y: number) => {
      let s = 0.25;
      for (const sp of spots) {
        const d = Math.min(Math.abs(i - sp), N - Math.abs(i - sp));
        s += Math.exp(-(d * d) / 18);
      }
      const t = (y - bodem) / H;
      return Math.min(1.3, s) * Math.pow(1 - t, 1.6);
    };
    const voeg = (p: THREE.Vector3, i: number) => {
      pos.push(p.x, p.y, p.z);
      uv.push(lengte[i] / 4, p.y / 4);
      const g = sterkte(i, p.y);
      kleuren.push(lk.r * g, lk.g * g, lk.b * g);
    };
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      for (let r = 0; r + 1 < ringen.length; r++) {
        const a = punt(i, r);
        const b = punt(j, r);
        const c = punt(j, r + 1);
        const d = punt(i, r + 1);
        voeg(a, i);
        voeg(d, i);
        voeg(b, j);
        voeg(b, j);
        voeg(d, i);
        voeg(c, j);
      }
    }
    // bovenkant (wat niet onder het gebouw valt)
    const vormTop = new THREE.Shape(rand.map(([x, z]) => new THREE.Vector2(x, z)));
    const dak = new THREE.ShapeGeometry(vormTop).rotateX(Math.PI / 2).translate(0, top - 0.03, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(kleuren, 3));
    g.computeVertexNormals();
    // de bovenkant heeft geen gloed
    const dp = dak.toNonIndexed();
    const duv = dp.attributes.position as THREE.BufferAttribute;
    const dUv = new Float32Array(duv.count * 2);
    for (let i = 0; i < duv.count; i++) {
      dUv[i * 2] = duv.getX(i) / 4;
      dUv[i * 2 + 1] = duv.getZ(i) / 4;
    }
    dp.setAttribute('uv', new THREE.BufferAttribute(dUv, 2));
    dp.setAttribute('color', new THREE.BufferAttribute(new Float32Array(duv.count * 3), 3));
    const geo = mergeGeometries([g, dp])!;
    return { geo, gloed: !!licht };
  }, [vorm, top, bodem, licht, seed]);
  useEffect(() => () => geo.dispose(), [geo]);
  const mats = useMemo(() => {
    const steen = new THREE.MeshStandardMaterial({ map: rotsTextuur(kleur), roughness: 0.97, flatShading: true });
    // de gloed van de schijnwerpers: dezelfde vorm nog eens, optellend licht (kleur per hoekpunt)
    const gl = new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, map: rotsTextuur(kleur), polygonOffset: true, polygonOffsetFactor: -1 });
    return { steen, gl };
  }, [kleur]);
  return (
    <group>
      <mesh geometry={geo} material={mats.steen} castShadow receiveShadow />
      {gloed && <mesh geometry={geo} material={mats.gl} renderOrder={2} />}
    </group>
  );
}
