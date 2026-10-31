// Bouwstenen voor de diorama-wereld: zachte, afgeronde low-poly vormen.
import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { P } from './palette';
import { metFijnDetail } from './fijn';
import { boomMateriaal, boomVorm } from './vormen';

const cache = new Map<string, THREE.MeshStandardMaterial>();
/** Laag voor de schaduw van de zaklamp: alleen wat op deze laag staat, werpt een zaklampschaduw (muren, bomen, samengevoegd decor, het poppetje). */
export const SCHADUW_LAAG = 3;
/** Zet alles in deze groep dat schaduw werpt ook op de zaklamplaag. */
export function opSchaduwLaag(o: THREE.Object3D | null) {
  o?.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && c.castShadow) c.layers.enable(SCHADUW_LAAG);
  });
}

export function mat(color: string, opts: { rough?: number; metal?: number; opacity?: number; emissive?: string; flat?: boolean } = {}) {
  const key = `${color}|${opts.rough ?? 0.85}|${opts.metal ?? 0}|${opts.opacity ?? 1}|${opts.emissive ?? ''}|${opts.flat ? 1 : 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.85,
      metalness: opts.metal ?? 0,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
      emissive: opts.emissive ?? '#000000',
      emissiveIntensity: opts.emissive ? 0.22 : 0,
      // geen facetten meer: alles glad belicht (vormen met echte hoeken houden hun hoeken)
      flatShading: false,
    });
    // effen, niet doorzichtig en zonder eigen licht: een fijne structuur erover (doorzichtig glas en lampjes niet)
    if ((opts.opacity ?? 1) >= 1 && !opts.emissive) metFijnDetail(m);
    cache.set(key, m);
  }
  return m;
}

type V3 = [number, number, number];

export function Blok({
  size,
  pos = [0, 0, 0],
  rot,
  color,
  r = 0.06,
  shadow = true,
  rough,
  opacity,
  name,
}: {
  size: V3;
  pos?: V3;
  rot?: V3;
  color: string;
  r?: number;
  shadow?: boolean;
  rough?: number;
  opacity?: number;
  name?: string;
}) {
  const radius = Math.min(r, size[0] / 2.01, size[1] / 2.01, size[2] / 2.01);
  return (
    <mesh
      name={name}
      geometry={blokGeo(size, radius)}
      position={pos}
      rotation={rot}
      castShadow={shadow}
      receiveShadow
      material={mat(color, { rough, opacity })}
    />
  );
}

// Gedeelde geometrie: elke maat wordt maar één keer gebouwd.
const blokCache = new Map<string, THREE.BufferGeometry>();
export function blokGeo(size: V3, radius: number) {
  const key = `${size[0].toFixed(3)}|${size[1].toFixed(3)}|${size[2].toFixed(3)}|${radius.toFixed(3)}`;
  let g = blokCache.get(key);
  if (!g) {
    g = radius > 0.004 ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, radius) : new THREE.BoxGeometry(size[0], size[1], size[2]);
    blokCache.set(key, g);
  }
  return g;
}

export function Cil({
  r = 0.5,
  rTop,
  h = 1,
  pos = [0, 0, 0],
  rot,
  color,
  seg = 16,
}: {
  r?: number;
  rTop?: number;
  h?: number;
  pos?: V3;
  rot?: V3;
  color: string;
  seg?: number;
}) {
  return (
    <mesh position={pos} rotation={rot} castShadow receiveShadow material={mat(color)}>
      <cylinderGeometry args={[rTop ?? r, r, h, seg]} />
    </mesh>
  );
}

/** Kleine pseudo-random generator, zodat de wereld er elke keer hetzelfde uitziet. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Het zwevende eiland met grasdek en aarde-doorsnede, zoals op het voorbeeld. */
export function Eiland({ w, d, diepte = 3.2, children }: { w: number; d: number; diepte?: number; children?: ReactNode }) {
  const kiezels = useMemo(() => {
    const rnd = seeded(7);
    const out: { p: V3; s: number }[] = [];
    const n = Math.round((w + d) * 0.9);
    for (let i = 0; i < n; i++) {
      const kant = Math.floor(rnd() * 4);
      const t = rnd() - 0.5;
      const y = -0.9 - rnd() * (diepte - 1.3);
      const s = 0.12 + rnd() * 0.16;
      const p: V3 =
        kant === 0 ? [t * w, y, d / 2 + 0.02] : kant === 1 ? [t * w, y, -d / 2 - 0.02] : kant === 2 ? [w / 2 + 0.02, y, t * d] : [-w / 2 - 0.02, y, t * d];
      out.push({ p, s });
    }
    return out;
  }, [w, d, diepte]);
  return (
    <group>
      <Blok size={[w, 0.5, d]} pos={[0, -0.25, 0]} color={P.gras} r={0.25} shadow={false} />
      <Blok size={[w - 0.1, 0.5, d - 0.1]} pos={[0, -0.7, 0]} color={P.aarde} r={0.1} shadow={false} />
      <Blok size={[w - 0.3, diepte - 0.9, d - 0.3]} pos={[0, -0.95 - (diepte - 0.9) / 2, 0]} color={P.aardeDonker} r={0.35} shadow={false} />
      {kiezels.map((k, i) => (
        <mesh key={i} position={k.p} material={mat(P.kiezel)}>
          <icosahedronGeometry args={[k.s, 0]} />
        </mesh>
      ))}
      {children}
    </group>
  );
}

export function Haag({ size, pos, rot }: { size: V3; pos: V3; rot?: V3 }) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={size} pos={[0, size[1] / 2, 0]} color={P.haag} r={Math.min(0.35, size[1] / 2.2)} />
    </group>
  );
}

export function Boom({ pos, s = 1, soort = 'kegel' }: { pos: V3; s?: number; soort?: 'kegel' | 'bol' }) {
  return (
    <group position={pos} scale={s}>
      {soort === 'kegel' ? (
        <mesh geometry={boomVorm('den', P.boomBlad, true)} material={boomMateriaal} scale={0.8} castShadow receiveShadow />
      ) : (
        <mesh geometry={boomVorm('loof', P.boomBlad2, true, false, 1)} material={boomMateriaal} scale={0.75} castShadow receiveShadow />
      )}
    </group>
  );
}

export function Struik({ pos, s = 1 }: { pos: V3; s?: number }) {
  return (
    <mesh position={pos} scale={s * 0.75} geometry={boomVorm('struik', P.haag, true)} material={boomMateriaal} castShadow receiveShadow>
    </mesh>
  );
}

/** Weg met middenstrepen, gele zijlijn en stoeprand. Loopt langs de x-as (rot draait hem). */
export function Weg({ lengte, breedte = 5, pos, rot }: { lengte: number; breedte?: number; pos: V3; rot?: V3 }) {
  const strepen = Math.floor(lengte / 3);
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[lengte, 0.08, breedte]} pos={[0, 0.04, 0]} color={P.asfalt} r={0.02} shadow={false} />
      {Array.from({ length: strepen }, (_, i) => (
        <mesh key={i} position={[-lengte / 2 + 1.5 + i * 3, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.lijn)}>
          <planeGeometry args={[1.3, 0.14]} />
        </mesh>
      ))}
      <mesh position={[0, 0.085, breedte / 2 - 0.35]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.geel)}>
        <planeGeometry args={[lengte, 0.1]} />
      </mesh>
      <Blok size={[lengte, 0.18, 0.35]} pos={[0, 0.09, breedte / 2 + 0.17]} color={P.stoep} r={0.05} shadow={false} />
      <Blok size={[lengte, 0.18, 0.35]} pos={[0, 0.09, -breedte / 2 - 0.17]} color={P.stoep} r={0.05} shadow={false} />
    </group>
  );
}

export function Pad({ size, pos, color = P.stoep }: { size: [number, number]; pos: V3; color?: string }) {
  return <Blok size={[size[0], 0.06, size[1]]} pos={[pos[0], 0.03, pos[2]]} color={color} r={0.02} shadow={false} />;
}

/** Hekje: paaltjes met twee latten. Loopt langs de x-as. */
export function Hek({ lengte, pos, rot, color = P.kozijn, hoogte = 0.8 }: { lengte: number; pos: V3; rot?: V3; color?: string; hoogte?: number }) {
  const n = Math.max(2, Math.round(lengte / 1) + 1);
  return (
    <group position={pos} rotation={rot}>
      {Array.from({ length: n }, (_, i) => (
        <Blok key={i} size={[0.12, hoogte, 0.12]} pos={[-lengte / 2 + (i * lengte) / (n - 1), hoogte / 2, 0]} color={color} r={0.03} />
      ))}
      <Blok size={[lengte, 0.08, 0.06]} pos={[0, hoogte * 0.75, 0]} color={color} r={0.02} />
      <Blok size={[lengte, 0.08, 0.06]} pos={[0, hoogte * 0.35, 0]} color={color} r={0.02} />
    </group>
  );
}

export function Lantaarn({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.07} h={3} pos={[0, 1.5, 0]} color={P.dak} seg={8} />
      <Blok size={[0.35, 0.3, 0.35]} pos={[0, 3.1, 0]} color={P.wit} r={0.08} />
      <Blok size={[0.45, 0.08, 0.45]} pos={[0, 3.3, 0]} color={P.dak} r={0.03} />
    </group>
  );
}

export function Bankje({ pos, rot }: { pos: V3; rot?: V3 }) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[1.6, 0.1, 0.45]} pos={[0, 0.45, 0]} color={P.hout} r={0.03} />
      <Blok size={[1.6, 0.35, 0.08]} pos={[0, 0.7, -0.2]} color={P.hout} r={0.03} />
      <Blok size={[0.1, 0.45, 0.4]} pos={[-0.65, 0.22, 0]} color={P.dak} r={0.02} />
      <Blok size={[0.1, 0.45, 0.4]} pos={[0.65, 0.22, 0]} color={P.dak} r={0.02} />
    </group>
  );
}

/** Raam met kozijn, voor op een gevel (vlak in het xy-vlak, naar +z). */
export function Raam({ w, h, pos, rot }: { w: number; h: number; pos: V3; rot?: V3 }) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[w + 0.16, h + 0.16, 0.08]} color={P.kozijn} r={0.03} />
      <Blok size={[w, h, 0.1]} pos={[0, 0, 0.01]} color={P.glas} r={0.02} rough={0.3} />
      <Blok size={[0.06, h, 0.12]} pos={[0, 0, 0.02]} color={P.kozijn} r={0.01} />
    </group>
  );
}

/** Modern huisje zoals in het voorbeeld: crème blok, plat donker dak met lichte rand. */
export function Huis({
  pos,
  rot,
  w = 6,
  d = 5,
  h = 3.2,
  muur = P.muur,
  deur = true,
  houtPaneel = true,
  children,
}: {
  pos: V3;
  rot?: V3;
  w?: number;
  d?: number;
  h?: number;
  muur?: string;
  deur?: boolean;
  houtPaneel?: boolean;
  children?: ReactNode;
}) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[w, h, d]} pos={[0, h / 2, 0]} color={muur} r={0.12} />
      <Blok size={[w + 0.3, 0.32, d + 0.3]} pos={[0, h + 0.16, 0]} color={P.dakRand} r={0.08} />
      <Blok size={[w - 0.2, 0.2, d - 0.2]} pos={[0, h + 0.36, 0]} color={P.dak} r={0.06} />
      {deur && <Blok size={[1.0, 2.0, 0.12]} pos={[-w / 4, 1.0, d / 2 + 0.02]} color={P.hout} r={0.04} />}
      <Raam w={1.3} h={1.1} pos={[w / 4, h * 0.55, d / 2 + 0.03]} />
      {houtPaneel && (
        <group>
          <Blok size={[0.12, h * 0.75, d * 0.6]} pos={[w / 2 + 0.05, h * 0.5, 0]} color={P.hout} r={0.03} />
          <Raam w={0.9} h={1.0} pos={[w / 2 + 0.12, h * 0.55, 0]} rot={[0, Math.PI / 2, 0]} />
        </group>
      )}
      {children}
    </group>
  );
}
