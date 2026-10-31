// Bouwdelen van Slot Maansteyn die de plattegrond zelf niet maakt: het rotseiland (met een gat waar het slot staat, zodat
// de trapgaten naar de kelder vrij blijven), ronde hoektorens met leien kegeldak, de stenen brug met ophaalbrug,
// de rotstrap en de steiger met de boot, steigers om de toren die verbouwd wordt, de arcade op de binnenplaats,
// en wat binnen hoort: smidsvuur, schouw, altaar met glas-in-lood, het zwarte water van de cisterne met de maanzuil.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { metAanlicht } from '../game/aanlicht';
import { Blok, mat, seeded } from '../game/kit';
import { blokSteenTextuur, dakpanTextuur, rotsTextuur } from '../game/texturen';
import { LEI, PLAN, STEEN } from './huis';

type V2 = [number, number];
type V3 = [number, number, number];

/** Textuur die per meter herhaalt (uv staat al in meters). */
function tegel(t: THREE.Texture, rx: number, ry: number) {
  const c = t.clone();
  c.needsUpdate = true;
  c.wrapS = c.wrapT = THREE.RepeatWrapping;
  c.repeat.set(rx, ry);
  return c;
}

/** Draaivorm met uv in meters (u rond, v langs het profiel). */
function draai(profiel: V2[], n = 28) {
  const g = new THREE.LatheGeometry(
    profiel.map(([r, y]) => new THREE.Vector2(r, y)),
    n,
  );
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const lengte: number[] = [0];
  for (let i = 1; i < profiel.length; i++) lengte.push(lengte[i - 1] + Math.hypot(profiel[i][0] - profiel[i - 1][0], profiel[i][1] - profiel[i - 1][1]));
  const rmax = Math.max(...profiel.map(([r]) => r));
  for (let i = 0; i < p.count; i++) uv.setXY(i, uv.getX(i) * 2 * Math.PI * rmax, lengte[i % profiel.length]);
  return g;
}


const gloedCache = new Map<string, THREE.MeshBasicMaterial>();
/** Iets dat zelf licht geeft (vuur, kaarsvlam, glas-in-lood, warm raam): altijd helder, ook in het donker. */
export function gloed(kleur: string) {
  let m = gloedCache.get(kleur);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: kleur, toneMapped: false });
    gloedCache.set(kleur, m);
  }
  return m;
}

const steenCache = new Map<string, THREE.MeshStandardMaterial>();
/** Natuursteen in blokken (2 m per tegel), met het warme aanlicht van de lantaarns aan het water. */
export function steenMat(kleur = STEEN) {
  let m = steenCache.get(kleur);
  if (!m) {
    m = metAanlicht(new THREE.MeshStandardMaterial({ map: tegel(blokSteenTextuur(kleur), 0.5, 0.5), roughness: 0.95 }), PLAN.aanlicht, `w2steen${kleur}`);
    steenCache.set(kleur, m);
  }
  return m;
}
let leiMat: THREE.MeshStandardMaterial | null = null;
/** Leien (blauwgrijs) voor de kegeldaken. */
export function leien() {
  leiMat ??= new THREE.MeshStandardMaterial({ map: tegel(dakpanTextuur(LEI), 1.2, 1.2), roughness: 0.75, side: THREE.DoubleSide });
  return leiMat;
}

// ── Het rotseiland ────────────────────────────────────────────────────────

/**
 * Rotseiland: de bovenkant volgt `vorm` op hoogte `top` (met een gat waar het slot zijn eigen vloeren heeft),
 * naar beneden bolt de rots onregelmatig uit tot onder het water. Naar het voorbeeld van `Rotsblok` in de motor.
 */
export function Eilandrots({ vorm, gat, top = 0, bodem = -6.5, kleur = '#8f8473', seed = 7 }: { vorm: V2[]; gat: V2[]; top?: number; bodem?: number; kleur?: string; seed?: number }) {
  const geo = useMemo(() => {
    const rnd = seeded(seed);
    const rand: V2[] = [];
    for (let i = 0; i < vorm.length; i++) {
      const a = vorm[i];
      const b = vorm[(i + 1) % vorm.length];
      const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.6));
      for (let k = 0; k < n; k++) rand.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    const N = rand.length;
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
      if (nx * (x - cx) + nz * (z - cz) < 0) {
        nx = -nx;
        nz = -nz;
      }
      return [nx, nz] as V2;
    });
    const H = top - bodem;
    const ringen = [0, 0.08, 0.22, 0.4, 0.58, 0.76, 0.9, 1];
    const ruis = rand.map(() => ringen.map(() => rnd()));
    const golf = rand.map((_, i) => Math.sin(i * 0.7 + seed) * 0.5 + Math.sin(i * 0.23 + seed * 2) * 0.6);
    const punt = (i: number, r: number) => {
      const t = ringen[r];
      const y = top - t * H - (r === 0 ? 0 : (ruis[i][r] - 0.5) * 0.5);
      const bol = r === 0 ? 0 : 0.2 + Math.sin(t * Math.PI * 1.2) * 0.8 + golf[i] * 0.5 * t + ruis[i][r] * 0.6 + t * t * 1.6;
      return new THREE.Vector3(rand[i][0] + uit[i][0] * bol, y, rand[i][1] + uit[i][1] * bol);
    };
    const pos: number[] = [];
    const uv: number[] = [];
    let omtrek = 0;
    const lengte = rand.map((p, i) => {
      const u = omtrek;
      const q = rand[(i + 1) % N];
      omtrek += Math.hypot(q[0] - p[0], q[1] - p[1]);
      return u;
    });
    const voeg = (p: THREE.Vector3, i: number) => {
      pos.push(p.x, p.y, p.z);
      uv.push(lengte[i] / 4, p.y / 4);
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
    const zij = new THREE.BufferGeometry();
    zij.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    zij.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    zij.computeVertexNormals();
    // bovenkant: de rotsrand rond het slot, met een gat waar de kamers hun eigen vloer hebben
    const vormTop = new THREE.Shape(rand.map(([x, z]) => new THREE.Vector2(x, -z)));
    vormTop.holes.push(new THREE.Path(gat.map(([x, z]) => new THREE.Vector2(x, -z))));
    const dak = new THREE.ShapeGeometry(vormTop).rotateX(-Math.PI / 2).translate(0, top - 0.02, 0).toNonIndexed();
    const dp = dak.attributes.position as THREE.BufferAttribute;
    const dUv = new Float32Array(dp.count * 2);
    for (let i = 0; i < dp.count; i++) {
      dUv[i * 2] = dp.getX(i) / 4;
      dUv[i * 2 + 1] = dp.getZ(i) / 4;
    }
    dak.setAttribute('uv', new THREE.BufferAttribute(dUv, 2));
    return mergeGeometries([zij, dak])!;
  }, [vorm, gat, top, bodem, seed]);
  useEffect(() => () => geo.dispose(), [geo]);
  const m = useMemo(() => metAanlicht(new THREE.MeshStandardMaterial({ map: rotsTextuur(kleur), roughness: 0.97, flatShading: true, side: THREE.DoubleSide }), PLAN.aanlicht, 'w2rots'), [kleur]);
  return <mesh geometry={geo} material={m} receiveShadow />;
}

// ── Torens ────────────────────────────────────────────────────────────────

/**
 * Ronde hoektoren van natuursteen met een schuine voet, een uitkragende rand en een spits leien kegeldak met windvaan.
 * `open`: geen dak maar kantelen (de toren die verbouwd wordt). `ramen`: hoeken (rad) met een warm raampje.
 */
export function Hoektoren({ pos, r = 2.7, voet = -5, hoog = 9.5, kegel = 6.5, open = false, ramen = [] }: { pos: V2; r?: number; voet?: number; hoog?: number; kegel?: number; open?: boolean; ramen?: number[] }) {
  const delen = useMemo(() => {
    const romp = draai([
      [r + 0.45, voet],
      [r + 0.4, 0],
      [r + 0.08, 1.4],
      [r, 2.2],
      [r, hoog],
      [r + 0.32, hoog + 0.35],
      [r + 0.32, hoog + 1.05],
    ]);
    const kap = open
      ? null
      : draai(
          [
            [r + 0.62, hoog + 0.95],
            [r + 0.3, hoog + 1.35],
            [r * 0.5, hoog + 1.0 + kegel * 0.55],
            [0.07, hoog + 1.0 + kegel],
          ],
          24,
        );
    return { romp, kap };
  }, [r, voet, hoog, kegel, open]);
  useEffect(
    () => () => {
      delen.romp.dispose();
      delen.kap?.dispose();
    },
    [delen],
  );
  const top = hoog + 1.0 + kegel;
  // kantelen rond een open toren, schietgaten en een paar warme raampjes
  const kantelen = open ? Array.from({ length: Math.round((2 * Math.PI * r) / 1.0) }, (_, i) => (i / Math.round((2 * Math.PI * r) / 1.0)) * Math.PI * 2) : [];
  const sleuven = [0.3, 1.5, 2.6, 3.7, 4.9, 5.9];
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh geometry={delen.romp} material={steenMat()} receiveShadow castShadow />
      {delen.kap && <mesh geometry={delen.kap} material={leien()} castShadow />}
      <>
        {!open && (
          <>
            <mesh position={[0, top + 0.1, 0]} material={mat('#4f8f80', { metal: 0.5, rough: 0.4 })}>
              <sphereGeometry args={[0.13, 8, 6]} />
            </mesh>
            <mesh position={[0, top + 0.7, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
              <cylinderGeometry args={[0.03, 0.03, 1.2, 5]} />
            </mesh>
            <mesh position={[0.18, top + 1.05, 0]} material={mat('#4f8f80', { metal: 0.5, rough: 0.4 })}>
              <boxGeometry args={[0.42, 0.24, 0.03]} />
            </mesh>
          </>
        )}
        {kantelen.map((a, i) =>
          i % 2 ? null : <Blok key={i} size={[0.55, 0.62, 0.32]} pos={[Math.sin(a) * (r + 0.16), hoog + 1.36, Math.cos(a) * (r + 0.16)]} rot={[0, a, 0]} color="#6f6a72" r={0.02} />,
        )}
        {sleuven.map((a, i) => (
          <mesh key={i} position={[Math.sin(a) * (r + 0.02), 2.6 + (i % 3) * 2.2, Math.cos(a) * (r + 0.02)]} rotation={[0, a, 0]} material={mat('#141216')}>
            <planeGeometry args={[0.16, 0.95]} />
          </mesh>
        ))}
        {ramen.map((a, i) => (
          <mesh key={`r${i}`} position={[Math.sin(a) * (r + 0.03), hoog - 2.2 - (i % 2) * 2.6, Math.cos(a) * (r + 0.03)]} rotation={[0, a, 0]} material={gloed('#e8a050')}>
            <planeGeometry args={[0.5, 0.9]} />
          </mesh>
        ))}
      </>
    </group>
  );
}

// ── De brug ───────────────────────────────────────────────────────────────

/** Stenen brug op twee pijlers over het meer (z 20 … 27), met borstwering, en de houten ophaalbrug voor de poort (z 17 … 20). */
export function Brug({ x = 0, z0 = 17, z1 = 27, b = 4, waterY = -4 }: { x?: number; z0?: number; z1?: number; b?: number; waterY?: number }) {
  const zOphaal = z0 + 3;
  const steen = '#5f574e';
  return (
    <group position={[x, 0, 0]}>
      <>
        {/* dek en borstwering */}
        <Blok size={[b + 0.4, 0.9, z1 - zOphaal + 0.4]} pos={[0, -0.46, (zOphaal + z1) / 2]} color={steen} r={0.05} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Blok size={[0.38, 0.92, z1 - zOphaal]} pos={[s * (b / 2 + 0.17), 0.46, (zOphaal + z1) / 2]} color="#7a7166" r={0.04} />
            <Blok size={[0.5, 0.12, z1 - zOphaal]} pos={[s * (b / 2 + 0.17), 0.98, (zOphaal + z1) / 2]} color="#8a8174" r={0.03} />
          </group>
        ))}
        {/* pijlers met een puntige kop tegen het water, en het landhoofd aan de oever */}
        {[zOphaal + 1.6, zOphaal + 4.7].map((z) => (
          <group key={z}>
            <Blok size={[b + 0.7, -waterY + 1.0, 1.5]} pos={[0, (waterY - 1.0) / 2 - 0.45, z]} color={steen} r={0.06} />
            {[-1, 1].map((s) => (
              <Blok key={s} size={[1.06, -waterY + 0.4, 1.06]} pos={[s * (b / 2 + 0.55), (waterY - 0.4) / 2 - 0.9, z]} rot={[0, Math.PI / 4, 0]} color="#5a5249" r={0.05} />
            ))}
          </group>
        ))}
        <Blok size={[b + 2.2, -waterY + 0.6, 1.6]} pos={[0, waterY / 2 - 0.3, z1 + 0.4]} color={steen} r={0.06} />
        {/* ophaalbrug: eiken planken met ijzeren banden, en de kettingen naar de poort */}
        <Blok size={[b - 0.3, 0.16, zOphaal - z0]} pos={[0, -0.06, (z0 + zOphaal) / 2]} color="#4a3422" r={0.02} />
        {Array.from({ length: 9 }, (_, i) => (
          <Blok key={i} size={[b - 0.32, 0.02, 0.05]} pos={[0, 0.03, z0 + 0.2 + i * 0.33]} color="#2e2118" r={0} shadow={false} />
        ))}
        {[-1, 1].map((s) => (
          <group key={`b${s}`}>
            <Blok size={[0.12, 0.05, zOphaal - z0]} pos={[s * (b / 2 - 0.35), 0.05, (z0 + zOphaal) / 2]} color="#2a2a2a" r={0} />
            <Ketting a={[s * (b / 2 - 0.3), 0.12, zOphaal - 0.15]} b={[s * (b / 2 - 0.3), 4.6, z0 + 0.05]} />
          </group>
        ))}
      </>
    </group>
  );
}

/** IJzeren ketting als dunne cilinder met schakels (genoeg van dichtbij). */
function Ketting({ a, b }: { a: V3; b: V3 }) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const l = va.distanceTo(vb);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return (
    <mesh position={mid.toArray()} rotation={[e.x, e.y, e.z]} material={mat('#3a3a3a', { metal: 0.7, rough: 0.45 })}>
      <cylinderGeometry args={[0.045, 0.045, l, 6]} />
    </mesh>
  );
}

// ── Rotstrap, steiger en boot ─────────────────────────────────────────────

/** Stenen treden langs de rotswand omlaag naar de steiger (langs −z), met een lage muur aan beide kanten. */
export function Rotstrap({ x, z0, z1, y0, y1, breed }: { x: number; z0: number; z1: number; y0: number; y1: number; breed: number }) {
  const n = Math.max(6, Math.round((y0 - y1) / 0.2));
  const run = (z0 - z1) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const top = y0 - ((i + 1) * (y0 - y1)) / n;
        return <Blok key={i} size={[breed, 0.6, run + 0.02]} pos={[x, top - 0.3, z0 - (i + 0.5) * run]} color={i % 2 ? '#6f675d' : '#776f64'} r={0.02} />;
      })}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x + s * (breed / 2 + 0.2), (y0 + y1) / 2 + 0.2, (z0 + z1) / 2]} rotation={[Math.atan2(y0 - y1, z0 - z1), 0, 0]} material={mat('#5f574e')}>
          <boxGeometry args={[0.4, 0.9, Math.hypot(z0 - z1, y0 - y1) + 0.4]} />
        </mesh>
      ))}
      <Blok size={[breed + 0.8, -y1 + 0.2, z0 - z1]} pos={[x, (y1 - 0.2) / 2 - 0.6, (z0 + z1) / 2]} color="#57504a" r={0.05} />
    </>
  );
}

/** Houten steiger op palen in het water, met een roeiboot aan de kant en een lantaarnpaal. */
export function Steiger({ pos, maat, y }: { pos: V2; maat: V2; y: number }) {
  const [b, d] = maat;
  return (
    <group position={[pos[0], y, pos[1]]}>
      <>
        <Blok size={[b, 0.16, d]} pos={[0, -0.08, 0]} color="#5a4030" r={0.02} />
        {Array.from({ length: Math.round(b / 0.32) }, (_, i) => (
          <Blok key={i} size={[0.03, 0.01, d - 0.05]} pos={[-b / 2 + 0.32 * (i + 0.5), 0.005, 0]} color="#3b2a1d" r={0} shadow={false} />
        ))}
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * (b / 2 - 0.15), -0.9, sz * (d / 2 - 0.15)]} material={mat('#3b2a1d')}>
              <cylinderGeometry args={[0.12, 0.14, 2.0, 7]} />
            </mesh>
          )),
        )}
        {/* de boot naar huis */}
        <group position={[b / 2 + 1.1, -0.3, -0.4]} rotation={[0, 0.12, 0]}>
          <Blok size={[1.3, 0.42, 3.4]} pos={[0, 0, 0]} color="#5a3a24" r={0.18} />
          <Blok size={[1.05, 0.06, 3.0]} pos={[0, 0.2, 0]} color="#3b2a1d" r={0.02} />
          <Blok size={[1.1, 0.06, 0.25]} pos={[0, 0.3, 0.3]} color="#6b4a32" r={0.02} />
          <Blok size={[0.06, 0.05, 2.2]} pos={[0.45, 0.32, 0.1]} rot={[0, 0.2, 0.15]} color="#8a6a4a" r={0.01} />
          <Blok size={[0.06, 0.05, 2.2]} pos={[-0.45, 0.32, 0.1]} rot={[0, -0.2, -0.15]} color="#8a6a4a" r={0.01} />
        </group>
      </>
    </group>
  );
}

// ── Steigers om de toren die verbouwd wordt ───────────────────────────────

/** Houten steigers rond een ronde toren: staanders, liggers en planken op een paar hoogtes. */
export function Steigers({ pos, r, hoog }: { pos: V2; r: number; hoog: number }) {
  const n = 10;
  const R = r + 0.9;
  const lagen = [2.2, 4.6, 7.0, 9.4].filter((y) => y < hoog + 1);
  return (
    <>
      <group position={[pos[0], 0, pos[1]]}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.sin(a) * R, hoog / 2 + 0.3, Math.cos(a) * R]} material={mat('#6b5236')}>
              <cylinderGeometry args={[0.06, 0.06, hoog + 0.6, 5]} />
            </mesh>
          );
        })}
        {lagen.flatMap((y) =>
          Array.from({ length: n }, (_, i) => {
            const a = ((i + 0.5) / n) * Math.PI * 2;
            const l = 2 * R * Math.sin(Math.PI / n) + 0.1;
            return <Blok key={`${y}-${i}`} size={[l, 0.06, 0.62]} pos={[Math.sin(a) * (R - 0.32), y, Math.cos(a) * (R - 0.32)]} rot={[0, a, 0]} color="#8a6a42" r={0.01} />;
          }),
        )}
        {/* hijsbalk met touw */}
        <Blok size={[0.14, 0.14, 3.2]} pos={[-1.2, hoog + 1.6, -1.6]} rot={[0, 0.7, 0]} color="#4a3422" r={0.01} />
        <mesh position={[-2.1, hoog - 0.4, -2.6]} material={mat('#b59a6a')}>
          <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
        </mesh>
      </group>
    </>
  );
}

// ── Binnenplaats ──────────────────────────────────────────────────────────

/** Arcade langs de westkant van de binnenplaats: stenen zuilen met bogen en een balkenplafond (de weergang erboven). */
export function Arcade({ x0, x1, z0, z1, zuilen, h = 3.2 }: { x0: number; x1: number; z0: number; z1: number; zuilen: number[]; h?: number }) {
  const xz = x1;
  return (
    <>
      {zuilen.map((z) => (
        <group key={z}>
          <mesh position={[xz, h / 2 - 0.15, z]} material={mat('#7f776b', { rough: 0.95 })} castShadow>
            <cylinderGeometry args={[0.24, 0.28, h - 0.3, 12]} />
          </mesh>
          <Blok size={[0.62, 0.22, 0.62]} pos={[xz, h - 0.24, z]} color="#9a9284" r={0.03} />
          <Blok size={[0.66, 0.16, 0.66]} pos={[xz, 0.08, z]} color="#7a7266" r={0.03} />
        </group>
      ))}
      {/* boogrand langs de binnenplaats en het plafond eronder (de vloer van de weergang) */}
      <Blok size={[0.5, 0.42, z1 - z0]} pos={[xz, h - 0.05, (z0 + z1) / 2]} color="#7f776b" r={0.03} />
      <mesh position={[(x0 + x1) / 2, h - 0.27, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, 0]} material={mat('#3e2c20')}>
        <planeGeometry args={[x1 - x0, z1 - z0]} />
      </mesh>
      {Array.from({ length: Math.round((z1 - z0) / 1.2) }, (_, i) => (
        <Blok key={i} size={[x1 - x0, 0.16, 0.14]} pos={[(x0 + x1) / 2, h - 0.36, z0 + 0.6 + i * 1.2]} color="#4a3422" r={0.01} />
      ))}
    </>
  );
}

// ── Binnen ────────────────────────────────────────────────────────────────

/** Grote stenen schouw tegen een muur (voorkant naar +z), met gloeiende houtblokken. */
export function Schouw({ pos, rot = 0, b = 2.4 }: { pos: V3; rot?: number; b?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.22, 0.9]} pos={[0, 1.5, 0.3]} color="#8a8274" r={0.03} />
      <Blok size={[b - 0.5, 1.6, 0.35]} pos={[0, 2.4, 0.05]} color="#7a7266" r={0.03} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.32, 1.5, 0.75]} pos={[s * (b / 2 - 0.16), 0.75, 0.3]} color="#8a8274" r={0.03} />
      ))}
      <Blok size={[b - 0.64, 1.3, 0.1]} pos={[0, 0.7, -0.05]} color="#1a1412" r={0.01} />
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.16, 0.3]} rotation={[0, 0.4 * i, Math.PI / 2]} material={gloed('#c8501a')}>
          <cylinderGeometry args={[0.09, 0.1, 0.8, 7]} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0.32]} material={gloed('#ffb04a')}>
        <coneGeometry args={[0.32, 0.55, 6]} />
      </mesh>
    </group>
  );
}

/** Smidsvuur met blaasbalg en een aambeeld ernaast. */
export function Smidsvuur({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[1.6, 0.8, 1.2]} pos={[0, 0.4, 0]} color="#5a5249" r={0.04} />
      <mesh position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]} material={gloed('#e0601c')}>
        <planeGeometry args={[1.2, 0.8]} />
      </mesh>
      <mesh position={[0, 0.86, 0]} material={gloed('#ff6a1c')}>
        <dodecahedronGeometry args={[0.32, 0]} />
      </mesh>
      <Blok size={[1.3, 1.4, 0.9]} pos={[0, 2.5, -0.1]} color="#4a443e" r={0.04} />
      <Blok size={[0.5, 1.4, 0.5]} pos={[0, 3.6, -0.15]} color="#4a443e" r={0.02} />
      <Blok size={[0.5, 0.24, 0.9]} pos={[1.05, 0.62, 0.2]} rot={[0, 0.2, 0]} color="#6b4a32" r={0.08} />
      <group position={[0.4, 0, 1.3]}>
        <Blok size={[0.4, 0.5, 0.4]} pos={[0, 0.25, 0]} color="#4a3324" r={0.03} />
        <Blok size={[0.65, 0.22, 0.26]} pos={[0, 0.62, 0]} color="#2c2c30" r={0.03} />
      </group>
    </group>
  );
}

/** Altaar met kandelaars, en een raam van glas-in-lood erboven (gloeit in kleuren). */
export function Altaar({ pos, rot = 0, raamY = 3.4 }: { pos: V3; rot?: number; raamY?: number }) {
  const kleuren = ['#b8262c', '#2a4fb0', '#d9a520', '#2a7a4a', '#7a2a9a'];
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.8, 1.0, 0.8]} pos={[0, 0.5, 0.5]} color="#a39b8f" r={0.03} />
      <Blok size={[1.9, 0.06, 0.86]} pos={[0, 1.02, 0.5]} color="#e8e0cc" r={0.01} />
      {[-0.65, 0.65].map((x) => (
        <group key={x} position={[x, 1.05, 0.5]}>
          <mesh position={[0, 0.2, 0]} material={mat('#b08a3a', { metal: 0.7, rough: 0.35 })}>
            <cylinderGeometry args={[0.04, 0.08, 0.4, 6]} />
          </mesh>
          <mesh position={[0, 0.48, 0]} material={gloed('#ffe2a0')}>
            <cylinderGeometry args={[0.03, 0.03, 0.18, 6]} />
          </mesh>
        </group>
      ))}
      {/* spitsboograam van glas-in-lood (vlak tegen de muur) */}
      <group position={[0, raamY, 0.04]}>
        <Blok size={[1.3, 2.3, 0.08]} pos={[0, 0, -0.02]} color="#3a3436" r={0.02} />
        {Array.from({ length: 15 }, (_, i) => (
          <mesh key={i} position={[((i % 3) - 1) * 0.36, 0.84 - Math.floor(i / 3) * 0.42, 0.03]} material={gloed(kleuren[(i * 7) % kleuren.length])}>
            <planeGeometry args={[0.32, 0.38]} />
          </mesh>
        ))}
        <mesh position={[0, 1.27, 0.03]} rotation={[0, 0, Math.PI / 4]} material={gloed('#d9a520')}>
          <planeGeometry args={[0.5, 0.5]} />
        </mesh>
      </group>
    </group>
  );
}

/** Kerkbank (eiken). */
export function Kerkbank({ pos, rot = 0, b = 2.2 }: { pos: V3; rot?: number; b?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.08, 0.45]} pos={[0, 0.45, 0]} color="#4a3324" r={0.02} />
      <Blok size={[b, 0.6, 0.06]} pos={[0, 0.78, -0.22]} color="#4a3324" r={0.02} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.08, 0.9, 0.5]} pos={[s * (b / 2 - 0.04), 0.45, 0]} color="#3b2a1d" r={0.02} />
      ))}
    </group>
  );
}

/** Lange eiken tafel met banken. */
export function LangeTafel({ pos, l = 6 }: { pos: V3; l?: number }) {
  return (
    <group position={pos}>
      <Blok size={[l, 0.1, 1.1]} pos={[0, 0.78, 0]} color="#5a3a22" r={0.02} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.12, 0.74, 0.12]} pos={[sx * (l / 2 - 0.3), 0.37, sz * 0.42]} color="#3b2a1d" r={0.02} />))}
      {[-1, 1].map((s) => (
        <Blok key={s} size={[l - 0.4, 0.08, 0.36]} pos={[0, 0.46, s * 0.85]} color="#4a3324" r={0.02} />
      ))}
      {[-l / 3, 0, l / 3].map((x) => (
        <group key={x} position={[x, 0.83, 0]}>
          <mesh position={[0, 0.14, 0]} material={mat('#b08a3a', { metal: 0.7, rough: 0.35 })}>
            <cylinderGeometry args={[0.03, 0.07, 0.28, 6]} />
          </mesh>
          <mesh position={[0, 0.34, 0]} material={gloed('#ffe2a0')}>
            <cylinderGeometry args={[0.025, 0.025, 0.14, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Troon van de graaf op een verhoging. */
export function Troon({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[2.2, 0.2, 1.6]} pos={[0, 0.1, 0]} color="#5a3a2a" r={0.03} />
      <Blok size={[0.9, 0.5, 0.8]} pos={[0, 0.45, 0.1]} color="#4a2a22" r={0.04} />
      <Blok size={[0.9, 1.7, 0.16]} pos={[0, 1.05, -0.3]} color="#4a2a22" r={0.04} />
      <Blok size={[0.7, 1.2, 0.04]} pos={[0, 1.15, -0.21]} color="#7a1f2a" r={0.02} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.12, 0.4, 0.8]} pos={[s * 0.45, 0.8, 0.1]} color="#4a2a22" r={0.03} />
      ))}
    </group>
  );
}

/** Wapenrek met speren en een schild (tegen de muur, voorkant naar +z). */
export function Wapenrek({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[2.0, 0.12, 0.36]} pos={[0, 0.25, 0]} color="#3b2a1d" r={0.02} />
      <Blok size={[2.0, 0.12, 0.36]} pos={[0, 1.6, 0]} color="#3b2a1d" r={0.02} />
      {[-0.75, -0.38, 0, 0.38, 0.75].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.2, 0]} material={mat('#5a4030')}>
            <cylinderGeometry args={[0.025, 0.025, 2.3, 6]} />
          </mesh>
          <mesh position={[0, 2.45, 0]} material={mat('#9aa1a8', { metal: 0.7, rough: 0.35 })}>
            <coneGeometry args={[0.06, 0.24, 4]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.95, 0.22]} rotation={[Math.PI / 2, 0, 0]} material={mat('#5b3f8a')}>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 18]} />
      </mesh>
      <mesh position={[0, 0.95, 0.26]} rotation={[Math.PI / 2, 0, 0]} material={mat('#ffb347')}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 12]} />
      </mesh>
    </group>
  );
}

/** Valhekwinde in de bodekamer: houten trommel met touw en een groot rad. */
export function Windas({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.2, 1.3, 0.6]} pos={[s * 1.1, 0.65, 0]} color="#3b2a1d" r={0.02} />
      ))}
      <mesh position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#5a4030')}>
        <cylinderGeometry args={[0.28, 0.28, 2.0, 12]} />
      </mesh>
      <mesh position={[1.35, 1.05, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#4a3324')}>
        <torusGeometry args={[0.7, 0.05, 6, 18]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#b59a6a')}>
        <cylinderGeometry args={[0.3, 0.3, 1.0, 12]} />
      </mesh>
    </group>
  );
}

/** Rooster in de vloer (moordgat) waardoor je de poortzaal onder je ziet. */
export function Moordgat({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[0.9, 0.02, 0.9]} pos={[0, 0.012, 0]} color="#141216" r={0} shadow={false} />
      {[-0.3, 0, 0.3].map((t) => (
        <group key={t}>
          <Blok size={[0.9, 0.03, 0.05]} pos={[0, 0.03, t]} color="#2a2a2a" r={0} />
          <Blok size={[0.05, 0.03, 0.9]} pos={[t, 0.03, 0]} color="#2a2a2a" r={0} />
        </group>
      ))}
    </group>
  );
}

// ── Kelder: zwart water en een zuil maanlicht uit de put ──────────────────

/** Bassin met zwart water in de cisterne (rand van steen, water iets lager). */
export function Waterbekken({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e1a24', roughness: 0.05, metalness: 0.6 }), []);
  return (
    <group>
      <>
        {(
          [
            [x0, x1, z0, z0 + 0.3],
            [x0, x1, z1 - 0.3, z1],
            [x0, x0 + 0.3, z0, z1],
            [x1 - 0.3, x1, z0, z1],
          ] as [number, number, number, number][]
        ).map(([a, b, c, d], i) => (
          <Blok key={i} size={[b - a, 0.42, d - c]} pos={[(a + b) / 2, 0.21, (c + d) / 2]} color="#6a645e" r={0.03} />
        ))}
      </>
      <mesh position={[(x0 + x1) / 2, 0.24, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={m}>
        <planeGeometry args={[x1 - x0 - 0.6, z1 - z0 - 0.6]} />
      </mesh>
    </group>
  );
}

/** Zachte bundel maanlicht die schuin uit de putschacht naar beneden valt (optellend licht, geen echte lamp). */
export function Maanzuil({ pos, h = 3.2, r = 0.75 }: { pos: V3; h?: number; r?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const m = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#9fb4ff',
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );
  useFrame(({ clock }) => {
    m.opacity = 0.13 + Math.sin(clock.getElapsedTime() * 0.7) * 0.025;
  });
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, h / 2, 0]} material={m} renderOrder={5}>
        <cylinderGeometry args={[r * 0.8, r * 1.15, h, 16, 1, true]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m} renderOrder={5}>
        <circleGeometry args={[r * 1.2, 20]} />
      </mesh>
    </group>
  );
}

/** Kroonluchter: ijzeren ring aan een ketting met brandende kaarsen (gloed, geen echte lamp). */
export function Kroonluchter({ pos, r = 0.9, n = 8, ketting = 2 }: { pos: V3; r?: number; n?: number; ketting?: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, ketting / 2, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
        <cylinderGeometry args={[0.025, 0.025, ketting, 5]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#2a2a2a', { metal: 0.6, rough: 0.5 })}>
        <torusGeometry args={[r, 0.045, 6, 24]} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <group key={i} position={[Math.sin(a) * r, 0, Math.cos(a) * r]}>
            <mesh position={[0, 0.1, 0]} material={mat('#efe6d0')}>
              <cylinderGeometry args={[0.035, 0.035, 0.2, 6]} />
            </mesh>
            <mesh position={[0, 0.25, 0]} material={gloed('#ffcf6a')}>
              <coneGeometry args={[0.035, 0.1, 6]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
