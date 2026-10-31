// Bouwdelen voor grote, echte gebouwen (door je eigen ogen): glazen balustrades, etalagepuien met schuifdeuren,
// rolhekken, roldeuren, kolommen, roltrappen en bijzondere plafonds (glazen kap, tongewelf, spanten).
// De vaste delen staan in GebouwVast (en worden daar samengevoegd), de bewegende in Deur (huis.tsx).
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Kamer, Trap } from '../werelden/types';
import { mat } from './kit';

type V2 = [number, number];

/** Hoogte van een etalagepui (glas van de vloer tot hier, daarboven de muur met het naambord). */
export const PUI_H = 3.0;

/** Helder glas: schrijft geen diepte (dan rekent de contactschaduw er niet op) en spiegelt de omgeving een beetje. */
export const glasMat = new THREE.MeshStandardMaterial({
  color: '#d6e9f0',
  roughness: 0.05,
  metalness: 0.25,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
  side: THREE.DoubleSide,
  envMapIntensity: 1.8,
});
const staal = () => mat('#3a3f45', { metal: 0.7, rough: 0.4 });
const rvs = () => mat('#b8bdc3', { metal: 0.85, rough: 0.28 });
const rubber = () => mat('#16181b', { rough: 0.6 });

/** Lokale ruimte langs een lijn a → b: x langs de lijn, z dwars. */
function langs(a: V2, b: V2) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { l, pos: [(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2] as [number, number, number], rot: Math.atan2(-(b[1] - a[1]), b[0] - a[0]) };
}

/** Glazen balustrade met een rvs leuning (galerij, vide, roltrap, kade). */
export function Balustrade({ a, b, h = 1.05 }: { a: V2; b: V2; h?: number }) {
  const { l, pos, rot } = langs(a, b);
  const palen = Math.max(2, Math.round(l / 1.5) + 1);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, h / 2 + 0.02, 0]} material={glasMat}>
        <boxGeometry args={[l, h - 0.1, 0.02]} />
      </mesh>
      {/* voetprofiel en leuning */}
      <mesh position={[0, 0.05, 0]} material={staal()}>
        <boxGeometry args={[l, 0.1, 0.08]} />
      </mesh>
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} material={rvs()}>
        <cylinderGeometry args={[0.032, 0.032, l, 10]} />
      </mesh>
      {Array.from({ length: palen }, (_, i) => (
        <mesh key={i} position={[-l / 2 + (i / (palen - 1)) * l, h / 2, 0]} material={rvs()}>
          <boxGeometry args={[0.04, h, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

/** Glaswand van vloer tot `h` met dunne stalen stijlen (de zijkanten van een etalagepui, een raamwand). */
export function GlasWand({ a, b, h = PUI_H, van = 0 }: { a: V2; b: V2; h?: number; van?: number }) {
  const { l, pos, rot } = langs(a, b);
  const vakken = Math.max(1, Math.round(l / 1.6));
  const hoog = h - van;
  return (
    <group position={[pos[0], van, pos[2]]} rotation={[0, rot, 0]}>
      <mesh position={[0, hoog / 2, 0]} material={glasMat}>
        <boxGeometry args={[l, hoog, 0.03]} />
      </mesh>
      <mesh position={[0, 0.06, 0]} material={staal()}>
        <boxGeometry args={[l, 0.12, 0.12]} />
      </mesh>
      <mesh position={[0, hoog - 0.05, 0]} material={staal()}>
        <boxGeometry args={[l, 0.1, 0.12]} />
      </mesh>
      {Array.from({ length: vakken + 1 }, (_, i) => (
        <mesh key={i} position={[-l / 2 + (i / vakken) * l, hoog / 2, 0]} material={staal()}>
          <boxGeometry args={[0.07, hoog, 0.12]} />
        </mesh>
      ))}
    </group>
  );
}

/** Kozijn van een pui: stijlen naast de schuifdeur en een kalf erboven (lokaal: x langs de muur). */
export function PuiKozijn({ b, deur }: { b: number; deur: number }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * deur) / 2, PUI_H / 2, 0]} material={staal()}>
          <boxGeometry args={[0.1, PUI_H, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0, 2.5, 0]} material={staal()}>
        <boxGeometry args={[deur, 0.1, 0.16]} />
      </mesh>
      <mesh position={[0, PUI_H - 0.05, 0]} material={staal()}>
        <boxGeometry args={[b, 0.1, 0.16]} />
      </mesh>
    </>
  );
}

/** Twee glazen schuifdeuren (dicht = 0, open = 1). Lokaal: x langs de muur, midden op 0. */
export function SchuifDeuren({ breed, open }: { breed: number; open: React.MutableRefObject<number> }) {
  const l = useRef<THREE.Group>(null);
  const r = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = open.current * (breed / 2 - 0.05);
    if (l.current) l.current.position.x = -breed / 4 - t;
    if (r.current) r.current.position.x = breed / 4 + t;
  });
  const blad = (
    <>
      <mesh position={[0, 1.22, 0]} material={glasMat}>
        <boxGeometry args={[breed / 2 - 0.04, 2.38, 0.03]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} material={staal()}>
        <boxGeometry args={[breed / 2 - 0.04, 0.08, 0.06]} />
      </mesh>
      <mesh position={[0, 2.42, 0]} material={staal()}>
        <boxGeometry args={[breed / 2 - 0.04, 0.08, 0.06]} />
      </mesh>
    </>
  );
  return (
    <>
      <group ref={l}>{blad}</group>
      <group ref={r}>{blad}</group>
    </>
  );
}

/** Lamellen van een rolhek (open rooster) of roldeur (dicht staal) die omhoog rolt. `open`: 0 = dicht, 1 = open. */
export function Rolluik({ breed, hoog, open, dicht = false, valhek = false }: { breed: number; hoog: number; open: React.MutableRefObject<number>; dicht?: boolean; valhek?: boolean }) {
  const scherm = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d')!;
    if (valhek) {
      // smeedijzeren valhek: dikke spijlen en dwarsbalken
      g.clearRect(0, 0, 64, 64);
      g.fillStyle = '#2a2622';
      g.fillRect(26, 0, 12, 64);
      g.fillRect(0, 26, 64, 9);
      g.fillStyle = '#4a433b';
      g.fillRect(29, 0, 3, 64);
    } else if (dicht) {
      g.fillStyle = '#8d949b';
      g.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 8) {
        g.fillStyle = '#6c737a';
        g.fillRect(0, y, 64, 2);
        g.fillStyle = '#b3b9bf';
        g.fillRect(0, y + 2, 64, 1);
      }
    } else {
      g.clearRect(0, 0, 64, 64);
      g.strokeStyle = '#9aa1a8';
      g.lineWidth = 3;
      for (let y = 0; y <= 64; y += 16) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(64, y);
        g.stroke();
      }
      for (let x = 0; x <= 64; x += 16) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 64);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(breed / (valhek ? 0.45 : 0.6), hoog / (valhek ? 0.45 : 0.6));
    t.anisotropy = 4;
    return t;
  }, [breed, hoog, dicht, valhek]);
  const m = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, transparent: !dicht, alphaTest: dicht ? 0 : 0.4, metalness: valhek ? 0.3 : 0.6, roughness: valhek ? 0.7 : 0.45, side: THREE.DoubleSide }),
    [tex, dicht, valhek],
  );
  useFrame(() => {
    const o = open.current;
    if (!scherm.current) return;
    if (valhek) {
      // een valhek rolt niet op: het schuift in zijn geheel omhoog de muur in
      scherm.current.position.y = hoog / 2 + o * (hoog - 0.25);
      scherm.current.scale.y = 1;
      return;
    }
    const zicht = Math.max(0.001, 1 - o);
    scherm.current.scale.y = zicht;
    scherm.current.position.y = hoog - (hoog * zicht) / 2;
    scherm.current.visible = o < 0.995;
  });
  return (
    <>
      <mesh ref={scherm} position={[0, hoog / 2, 0]} material={m}>
        <planeGeometry args={[breed, hoog]} />
      </mesh>
      {/* de rolkast (een valhek verdwijnt in de muur) */}
      {!valhek && (
        <mesh position={[0, hoog + 0.16, 0]} rotation={[0, 0, Math.PI / 2]} material={staal()}>
          <cylinderGeometry args={[0.2, 0.2, breed + 0.1, 12]} />
        </mesh>
      )}
    </>
  );
}

/** Plekken van de kolommen in een kamer (wereldcoördinaten). */
export function kolomPlekken(k: Kamer): V2[] {
  if (!k.kolommen) return [];
  const [ax, az] = k.kolommen.afstand;
  const [rx, rz] = k.kolommen.rand ?? [ax / 2, az / 2];
  const x0 = k.pos[0] - k.maat[0] / 2;
  const z0 = k.pos[1] - k.maat[1] / 2;
  const uit: V2[] = [];
  for (let x = x0 + rx; x <= x0 + k.maat[0] - rx + 1e-3; x += ax) for (let z = z0 + rz; z <= z0 + k.maat[1] - rz + 1e-3; z += az) uit.push([x, z]);
  return uit;
}

/** Kolommen van één kamer (vast, wordt samengevoegd). */
export function Kolommen({ k, h }: { k: Kamer; h: number }) {
  const plekken = kolomPlekken(k);
  const d = k.kolommen?.dikte ?? 0.45;
  const m = mat(k.kolommen?.kleur ?? '#d9d4ca', { rough: 0.7 });
  const voet = mat('#6f6a64', { rough: 0.8 });
  return (
    <>
      {plekken.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {k.kolommen?.rond ? (
            <mesh position={[0, h / 2, 0]} material={m} castShadow receiveShadow>
              <cylinderGeometry args={[d / 2, d / 2, h, 20]} />
            </mesh>
          ) : (
            <mesh position={[0, h / 2, 0]} material={m} castShadow receiveShadow>
              <boxGeometry args={[d, h, d]} />
            </mesh>
          )}
          <mesh position={[0, 0.06, 0]} material={voet}>
            <boxGeometry args={[d + 0.12, 0.12, d + 0.12]} />
          </mesh>
          <mesh position={[0, h - 0.08, 0]} material={voet}>
            <boxGeometry args={[d + 0.16, 0.16, d + 0.16]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Roltrap: metalen treden, zijpanelen, glazen balustrades met een zwarte leuning. `pt(t)` = punt op de looplijn. */
export function RoltrapModel({ tr, HV, pt }: { tr: Trap; HV: number; pt: (t: number) => V2 }) {
  const n = Math.max(10, Math.round(HV / 0.2));
  const stap = tr.lengte / n;
  const hoek = Math.atan2(HV, tr.lengte);
  const schuin = Math.hypot(HV, tr.lengte);
  const [mx, mz] = tr.pos;
  const treden: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const [x, z] = pt((k + 0.5) / n);
    const top = ((k + 1) / n) * HV;
    treden.push(
      <mesh key={k} position={[x, top - 0.06, z]} material={rvs()}>
        <boxGeometry args={tr.as === 'x' ? [stap + 0.01, 0.12, tr.breed - 0.1] : [tr.breed - 0.1, 0.12, stap + 0.01]} />
      </mesh>,
    );
  }
  // zijkant: een schuine balk van onder naar boven (de "vakwerkbak" van de roltrap)
  const draai: [number, number, number] = tr.as === 'x' ? [0, 0, hoek * tr.richting] : [-hoek * tr.richting, 0, 0];
  const zij = (kant: number) => (tr.as === 'x' ? ([mx, HV / 2 - 0.35, mz + kant * (tr.breed / 2 + 0.06)] as const) : ([mx + kant * (tr.breed / 2 + 0.06), HV / 2 - 0.35, mz] as const));
  const maat = (b: number, h: number): [number, number, number] => (tr.as === 'x' ? [schuin, h, b] : [b, h, schuin]);
  return (
    <>
      {treden}
      {/* onderkant van de bak */}
      <mesh position={[mx, HV / 2 - 0.5, mz]} rotation={draai} material={mat('#c9ccd0', { metal: 0.5, rough: 0.35 })} castShadow>
        <boxGeometry args={maat(tr.breed + 0.3, 0.5)} />
      </mesh>
      {[-1, 1].map((kant) => {
        const p = zij(kant);
        const q = tr.as === 'x' ? [p[0], p[1] + 0.95, p[2]] : [p[0], p[1] + 0.95, p[2]];
        return (
          <group key={kant}>
            <mesh position={[p[0], p[1], p[2]]} rotation={draai} material={mat('#c9ccd0', { metal: 0.5, rough: 0.35 })}>
              <boxGeometry args={maat(0.1, 0.9)} />
            </mesh>
            <mesh position={[q[0], q[1] - 0.05, q[2]]} rotation={draai} material={glasMat}>
              <boxGeometry args={maat(0.02, 0.9)} />
            </mesh>
            <mesh position={[q[0], q[1] + 0.42, q[2]]} rotation={draai} material={rubber()}>
              <boxGeometry args={maat(0.1, 0.08)} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

// ── Plafonds ──────────────────────────────────────────────────────────────

type Vorm = { glas: THREE.BufferGeometry[]; roeden: THREE.BufferGeometry[]; vlak: THREE.BufferGeometry[]; balken: THREE.BufferGeometry[] };

function balk(x: number, y: number, z: number, sx: number, sy: number, sz: number) {
  return new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z).toNonIndexed();
}

/** Glazen kap: glas op hoogte h met stalen roeden in een raster (ongeveer elke 1,5 m) en twee zware liggers. */
function glasKap(k: Kamer, h: number, uit: Vorm) {
  const [x, z] = k.pos;
  const [w, d] = k.maat;
  const vlak = new THREE.PlaneGeometry(w, d).rotateX(Math.PI / 2).translate(x, h + 0.02, z);
  uit.glas.push(vlak.toNonIndexed());
  const nx = Math.max(1, Math.round(w / 1.5));
  const nz = Math.max(1, Math.round(d / 1.5));
  for (let i = 1; i < nx; i++) uit.roeden.push(balk(x - w / 2 + (i / nx) * w, h, z, 0.06, 0.12, d));
  for (let i = 1; i < nz; i++) uit.roeden.push(balk(x, h, z - d / 2 + (i / nz) * d, w, 0.12, 0.06));
  // liggers dwars over de korte kant
  const langX = w >= d;
  const n = Math.max(1, Math.round((langX ? w : d) / 6));
  for (let i = 1; i < n; i++) {
    const t = -0.5 + i / n;
    uit.roeden.push(langX ? balk(x + t * w, h - 0.2, z, 0.18, 0.4, d) : balk(x, h - 0.2, z + t * d, w, 0.4, 0.18));
  }
}

/** Tongewelf langs de lange kant: een boog met pijl f bovenop de muren, met de kopse kanten dicht. */
function gewelf(k: Kamer, h: number, uit: Vorm, maxPijl = Infinity, glas = false) {
  const [x, z] = k.pos;
  const [w, d] = k.maat;
  const langX = w >= d;
  const span = langX ? d : w;
  const lengte = langX ? w : d;
  // pijl (hoogte van de boog); ligt er een verdieping boven, dan blijft het gewelf onder die vloer
  const f = Math.max(0.3, Math.min(span * 0.32, 3.2, maxPijl));
  // cirkelboog door (−span/2, 0), (span/2, 0) en (0, f)
  const R = (f * f + (span / 2) * (span / 2)) / (2 * f);
  const a0 = Math.asin(span / 2 / R);
  const stuks = 16;
  const pos: number[] = [];
  const uv: number[] = [];
  const punt = (i: number) => {
    const a = -a0 + (2 * a0 * i) / stuks;
    return [R * Math.sin(a), R * Math.cos(a) - (R - f)] as const;
  };
  for (let i = 0; i < stuks; i++) {
    const [s0, y0] = punt(i);
    const [s1, y1] = punt(i + 1);
    for (const [s, y, l] of [
      [s0, y0, -lengte / 2],
      [s1, y1, -lengte / 2],
      [s1, y1, lengte / 2],
      [s0, y0, -lengte / 2],
      [s1, y1, lengte / 2],
      [s0, y0, lengte / 2],
    ] as const) {
      pos.push(...(langX ? [x + l, h + y, z + s] : [x + s, h + y, z + l]));
      uv.push(l / 2, (s + span / 2) / 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  (glas ? uit.glas : uit.vlak).push(g);
  // kopse kanten (het halve maantje boven de muur)
  for (const kant of [-1, 1]) {
    const vorm = new THREE.Shape();
    vorm.moveTo(-span / 2, 0);
    for (let i = 0; i <= stuks; i++) {
      const [s, y] = punt(i);
      vorm.lineTo(s, y);
    }
    vorm.lineTo(span / 2, 0);
    const kop = new THREE.ShapeGeometry(vorm);
    if (langX) kop.rotateY(Math.PI / 2).translate(x + (kant * lengte) / 2, h, z);
    else kop.translate(x, h, z + (kant * lengte) / 2);
    (glas ? uit.glas : uit.vlak).push(kop.toNonIndexed());
  }
  // glas: stalen langsroeden over de boog
  if (glas)
    for (let i = 2; i < stuks; i += 2) {
      const [s, y] = punt(i);
      uit.roeden.push(langX ? balk(x, h + y - 0.04, z + s, lengte, 0.08, 0.06) : balk(x + s, h + y - 0.04, z, 0.06, 0.08, lengte));
    }
  // gordelbogen: om de 4 m een zware rib (glas: om de 2 m een stalen boog)
  const ribben = Math.max(1, Math.round(lengte / (glas ? 2 : 4)));
  for (let r = 1; r < ribben; r++) {
    const t = -lengte / 2 + (r / ribben) * lengte;
    for (let i = 0; i < stuks; i += 2) {
      const [s0, y0] = punt(i);
      const [s1, y1] = punt(Math.min(stuks, i + 2));
      const ms = (s0 + s1) / 2;
      const my = (y0 + y1) / 2 - 0.1;
      const l = Math.hypot(s1 - s0, y1 - y0);
      const hoek = Math.atan2(y1 - y0, s1 - s0);
      const b = new THREE.BoxGeometry(l + 0.04, 0.22, 0.32).rotateZ(hoek);
      // −90° om y: lokale x (langs de boog) wordt wereld-z
      if (langX) b.rotateY(-Math.PI / 2).translate(x + t, h + my, z + ms);
      else b.translate(x + ms, h + my, z + t);
      (glas ? uit.roeden : uit.balken).push(b.toNonIndexed());
    }
  }
}

/** Koepel boven het midden van de kamer (met een oculus), op een vlak plafond met een rond gat. */
function koepel(k: Kamer, h: number, uit: Vorm, glas: boolean) {
  const [x, z] = k.pos;
  const [w, d] = k.maat;
  const r = (Math.min(w, d) / 2) * 0.86;
  // plafond rond de koepel
  const vorm = new THREE.Shape([new THREE.Vector2(-w / 2, -d / 2), new THREE.Vector2(w / 2, -d / 2), new THREE.Vector2(w / 2, d / 2), new THREE.Vector2(-w / 2, d / 2)]);
  const gat = new THREE.Path();
  gat.absarc(0, 0, r, 0, Math.PI * 2, true);
  vorm.holes.push(gat);
  const ring = new THREE.ShapeGeometry(vorm, 48).rotateX(Math.PI / 2).translate(x, h - 0.005, z);
  uit.vlak.push(ring.toNonIndexed());
  // de koepel zelf: een bol tot aan het oculus
  const oculus = 0.16;
  const bol = new THREE.SphereGeometry(r, 40, 14, 0, Math.PI * 2, oculus, Math.PI / 2 - oculus).translate(x, h, z);
  (glas ? uit.glas : uit.vlak).push(bol.toNonIndexed());
  // ribben: meridianen en twee ringen (staal bij glas, steen/stuc anders)
  const ribben = glas ? 16 : 8;
  const doel = glas ? uit.roeden : uit.balken;
  for (let i = 0; i < ribben; i++) {
    const t = new THREE.TorusGeometry(r - 0.03, glas ? 0.05 : 0.11, 6, 20, Math.PI / 2 - oculus).rotateY((i / ribben) * Math.PI * 2).translate(x, h, z);
    doel.push(t.toNonIndexed());
  }
  for (const f of [0.35, 0.8]) {
    const ry = Math.sin(f * (Math.PI / 2 - oculus));
    const t = new THREE.TorusGeometry(r * Math.cos(f * (Math.PI / 2 - oculus)) - 0.03, glas ? 0.05 : 0.09, 6, 64).rotateX(Math.PI / 2).translate(x, h + r * ry, z);
    doel.push(t.toNonIndexed());
  }
  // ring om het oculus
  const top = new THREE.TorusGeometry(r * Math.sin(oculus), 0.1, 6, 32).rotateX(Math.PI / 2).translate(x, h + r * Math.cos(oculus), z);
  doel.push(top.toNonIndexed());
}

/** Vlak plafond met zichtbare balken dwars over de korte kant (elke 2,4 m), of stalen spanten in een hoge hal. */
function spanten(k: Kamer, h: number, uit: Vorm) {
  const [x, z] = k.pos;
  const [w, d] = k.maat;
  const langX = w >= d;
  const lengte = langX ? w : d;
  const n = Math.max(1, Math.round(lengte / 2.4));
  for (let i = 1; i < n; i++) {
    const t = -lengte / 2 + (i / n) * lengte;
    uit.balken.push(langX ? balk(x + t, h - 0.14, z, 0.22, 0.28, d) : balk(x, h - 0.14, z + t, w, 0.28, 0.22));
  }
}

/** Bijzondere plafonds van een verdieping, samengevoegd per materiaal. `hoogteVan` = hoogte van een kamer. */
export function bijzonderePlafonds(kamers: Kamer[], hoogteVan: (k: Kamer) => number, maxPijl: (k: Kamer) => number = () => Infinity) {
  const uit: Vorm = { glas: [], roeden: [], vlak: [], balken: [] };
  for (const k of kamers) {
    if (k.buiten) continue;
    const h = hoogteVan(k);
    if (k.plafond === 'glas') glasKap(k, h, uit);
    else if (k.plafond === 'gewelf') gewelf(k, h, uit, maxPijl(k));
    else if (k.plafond === 'glasgewelf') gewelf(k, h, uit, maxPijl(k), true);
    else if (k.plafond === 'koepel' || k.plafond === 'glaskoepel') koepel(k, h, uit, k.plafond === 'glaskoepel');
    else if (k.plafond === 'spanten') spanten(k, h, uit);
  }
  const samen = (l: THREE.BufferGeometry[]) => (l.length ? mergeGeometries(l.map((g) => (g.index ? g.toNonIndexed() : g)))! : null);
  return { glas: samen(uit.glas), roeden: samen(uit.roeden), vlak: samen(uit.vlak), balken: samen(uit.balken) };
}

export function PlafondDelen({ delen, vlakMat }: { delen: ReturnType<typeof bijzonderePlafonds>; vlakMat: THREE.Material }) {
  return (
    <>
      {delen.glas && <mesh geometry={delen.glas} material={glasMat} />}
      {delen.roeden && <mesh geometry={delen.roeden} material={staal()} castShadow />}
      {delen.vlak && <mesh geometry={delen.vlak} material={vlakMat} receiveShadow />}
      {delen.balken && <mesh geometry={delen.balken} material={mat('#5a4030', { rough: 0.85 })} castShadow />}
    </>
  );
}

let systeemCache: THREE.MeshStandardMaterial | null = null;
/** Systeemplafond: platen van 60 × 60 cm met om de paar platen een lichtpaneel (dat licht een beetje op). */
export function systeemPlafond() {
  if (systeemCache) return systeemCache;
  const maak = (licht: boolean) => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = licht ? '#000000' : '#e9e8e3';
    g.fillRect(0, 0, 256, 256);
    // 4 × 4 platen per herhaling (2,4 m)
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const paneel = (i === 1 && j === 1) || (i === 3 && j === 3);
        if (licht) {
          if (paneel) {
            g.fillStyle = '#ffffff';
            g.fillRect(i * 64 + 4, j * 64 + 4, 56, 56);
          }
          continue;
        }
        if (paneel) {
          g.fillStyle = '#fbfbf7';
          g.fillRect(i * 64 + 3, j * 64 + 3, 58, 58);
          g.strokeStyle = '#c8c8c2';
          for (let k = 1; k < 4; k++) {
            g.beginPath();
            g.moveTo(i * 64 + 3, j * 64 + k * 16);
            g.lineTo(i * 64 + 61, j * 64 + k * 16);
            g.stroke();
          }
        } else {
          for (let n = 0; n < 60; n++) {
            g.fillStyle = 'rgba(0,0,0,0.06)';
            g.fillRect(i * 64 + Math.random() * 64, j * 64 + Math.random() * 64, 1.5, 1.5);
          }
        }
        g.strokeStyle = '#b9b8b1';
        g.lineWidth = 2;
        g.strokeRect(i * 64 + 1, j * 64 + 1, 62, 62);
      }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  };
  systeemCache = new THREE.MeshStandardMaterial({ map: maak(false), emissiveMap: maak(true), emissive: '#fff7ea', emissiveIntensity: 1.1, roughness: 0.85, side: THREE.DoubleSide });
  return systeemCache;
}

/** Afzetlint voor een trap of roltrap die nog dicht is: twee paaltjes met rood-wit lint. Lokaal: x dwars, midden op 0. */
export function AfzetLint({ breed }: { breed: number }) {
  const lint = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 8;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#ffffff' : '#d42a2a';
      g.fillRect(i * 8, 0, 8, 8);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(breed / 0.8, 1);
    return t;
  }, [breed]);
  return (
    <>
      {[-1, 1].map((k) => (
        <group key={k} position={[(k * breed) / 2, 0, 0]}>
          <mesh position={[0, 0.5, 0]} material={staal()}>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
          </mesh>
          <mesh position={[0, 0.02, 0]} material={staal()}>
            <cylinderGeometry args={[0.16, 0.18, 0.04, 16]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.93, 0]}>
        <planeGeometry args={[breed, 0.07]} />
        <meshStandardMaterial map={lint} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
    </>
  );
}
