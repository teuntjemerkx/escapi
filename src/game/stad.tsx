// Strakkere bouwstenen voor de werelden: kavels met stoeprand, wegen met stoepen,
// huizen zoals in het voorbeeld (twee volumes, houten lamellen, poortpalen), laanbomen en lampen.
import { useMemo } from 'react';
import * as THREE from 'three';
import { boomMateriaal, boomVorm } from './vormen';
import { Blok, Cil, mat, Raam, seeded } from './kit';
import { P } from './palette';
import { useTextuur } from './tekst';

type V3 = [number, number, number];
export type Ondergrond = 'gras' | 'tegels' | 'zand' | 'grind';

export const HOOGTE_KAVEL = 0.12;
export const HOOGTE_STOEP = 0.1;

const KLEUR: Record<Ondergrond, string> = { gras: '#9cbd65', tegels: '#e6dfd2', zand: '#e5d3a4', grind: '#cdc6b8' };

/** Herhalend tegelpatroon (voor stoepen, pleinen en kavels met tegels). */
function useTegels(kleur: string, voeg: string, n = 4) {
  const tex = useTextuur(
    1,
    1,
    (ctx, w, h) => {
      ctx.fillStyle = kleur;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = voeg;
      ctx.lineWidth = 2;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / n, 0);
        ctx.lineTo((i * w) / n, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (i * h) / n);
        ctx.lineTo(w, (i * h) / n);
        ctx.stroke();
      }
    },
    `tegels${kleur}${voeg}${n}`,
    128,
  );
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Vlak met tegelpatroon; herhaling volgt de echte maat (1 tegel = 0,5 m). */
export function TegelVlak({ w, d, y, kleur = KLEUR.tegels, voeg = '#d2c9b8', tegel = 0.5 }: { w: number; d: number; y: number; kleur?: string; voeg?: string; tegel?: number }) {
  const basis = useTegels(kleur, voeg);
  const tex = useMemo(() => {
    const t = basis.clone();
    t.needsUpdate = true;
    t.repeat.set(w / (tegel * 4), d / (tegel * 4));
    return t;
  }, [basis, w, d, tegel]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={tex} roughness={0.92} />
    </mesh>
  );
}

/** Verhoogde kavel met een stenen rand, zoals een tegel in een diorama. */
export function Kavel({ w, d, soort = 'gras' }: { w: number; d: number; soort?: Ondergrond }) {
  const rand = 0.22;
  return (
    <group>
      <Blok size={[w, HOOGTE_KAVEL, d]} pos={[0, HOOGTE_KAVEL / 2, 0]} color="#d8d1c3" r={0.06} shadow={false} />
      {soort === 'tegels' ? (
        <TegelVlak w={w - rand * 2} d={d - rand * 2} y={HOOGTE_KAVEL + 0.003} />
      ) : (
        <Blok size={[w - rand * 2, 0.02, d - rand * 2]} pos={[0, HOOGTE_KAVEL + 0.002, 0]} color={KLEUR[soort]} r={0.01} shadow={false} rough={soort === 'grind' ? 1 : 0.9} />
      )}
      {soort === 'grind' && <Grind w={w - rand * 2} d={d - rand * 2} />}
    </group>
  );
}

function Grind({ w, d }: { w: number; d: number }) {
  const ref = useMemo(() => {
    const r = seeded(Math.round(w * 13 + d * 7));
    return Array.from({ length: Math.round(w * d * 1.4) }, () => [(r() - 0.5) * w * 0.96, HOOGTE_KAVEL + 0.02, (r() - 0.5) * d * 0.96, 0.03 + r() * 0.04] as const);
  }, [w, d]);
  return (
    <group>
      {ref.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} material={mat(i % 3 ? '#b8b1a3' : '#a59e90')}>
          <icosahedronGeometry args={[s, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/** Weg langs de x-as met twee stoepen, stoepranden en wegmarkering. */
export function Straat({ lengte, breed = 5, stoep = 1.8, pos, rot, zebra = [] }: { lengte: number; breed?: number; stoep?: number; pos: V3; rot?: V3; zebra?: number[] }) {
  const strepen = Math.floor(lengte / 4);
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[lengte, 0.06, breed]} pos={[0, 0.03, 0]} color={P.asfalt} r={0.01} shadow={false} rough={0.95} />
      {Array.from({ length: strepen }, (_, i) => {
        const x = -lengte / 2 + 2 + i * 4;
        if (zebra.some((z) => Math.abs(z - x) < 3)) return null;
        return (
          <mesh key={i} position={[x, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.lijn)}>
            <planeGeometry args={[1.8, 0.14]} />
          </mesh>
        );
      })}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.062, s * (breed / 2 - 0.3)]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.lijn)}>
          <planeGeometry args={[lengte, 0.1]} />
        </mesh>
      ))}
      {zebra.map((zx) =>
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={`${zx}-${i}`} position={[zx, 0.063, -breed / 2 + 0.5 + i * ((breed - 1) / 5)]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#f5f3ec')}>
            <planeGeometry args={[2.6, 0.42]} />
          </mesh>
        )),
      )}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * (breed / 2 + stoep / 2)]}>
          <Blok size={[lengte, HOOGTE_STOEP, stoep]} pos={[0, HOOGTE_STOEP / 2, 0]} color="#ddd6c9" r={0.02} shadow={false} />
          <TegelVlak w={lengte} d={stoep - 0.2} y={HOOGTE_STOEP + 0.002} tegel={0.45} kleur="#e9e3d8" voeg="#d5ccbd" />
          <Blok size={[lengte, HOOGTE_STOEP + 0.04, 0.16]} pos={[0, (HOOGTE_STOEP + 0.04) / 2, -s * (stoep / 2 - 0.08)]} color="#c9c2b5" r={0.03} shadow={false} />
        </group>
      ))}
    </group>
  );
}

/** Plein of pad met tegels, iets verhoogd. */
export function Plein({ w, d, pos, kleur }: { w: number; d: number; pos: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Blok size={[w, HOOGTE_STOEP, d]} pos={[0, HOOGTE_STOEP / 2, 0]} color="#d3cbbd" r={0.05} shadow={false} />
      <TegelVlak w={w - 0.3} d={d - 0.3} y={HOOGTE_STOEP + 0.002} kleur={kleur ?? '#ebe5da'} voeg="#d6cdbf" tegel={0.6} />
    </group>
  );
}

/** Loofboom met een bolle kruin, een slanke populier (zuil) of een den. */
export function MooieBoom({ pos, s = 1, soort = 'bol', seed = 1 }: { pos: V3; s?: number; soort?: 'bol' | 'den' | 'zuil'; seed?: number }) {
  const variant = seed % 3;
  return (
    <group position={pos} scale={s} rotation={[0, seed * 1.7, 0]}>
      {soort === 'bol' && <mesh geometry={boomVorm('loof', '#68a845', true, false, variant)} material={boomMateriaal} scale={0.92} castShadow receiveShadow />}
      {soort === 'zuil' && <mesh geometry={boomVorm('loof', '#5f9e3f', true, false, variant)} material={boomMateriaal} scale={[0.55, 1.15, 0.55]} castShadow receiveShadow />}
      {soort === 'den' && <mesh geometry={boomVorm('den', '#447f3c', true, false, variant)} material={boomMateriaal} scale={0.84} castShadow receiveShadow />}
    </group>
  );
}

/** Laanboom in een stenen boomspiegel. */
export function Laanboom({ pos, seed = 1 }: { pos: V3; seed?: number }) {
  return (
    <group position={pos}>
      <Blok size={[1.1, 0.16, 1.1]} pos={[0, 0.08, 0]} color="#cfc7b8" r={0.05} shadow={false} />
      <Blok size={[0.85, 0.04, 0.85]} pos={[0, 0.16, 0]} color="#7a5a3c" r={0.02} shadow={false} />
      <MooieBoom pos={[0, 0.1, 0]} s={0.82} soort="bol" seed={seed} />
    </group>
  );
}

export function Lamp({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.05} rTop={0.04} h={3.4} pos={[0, 1.7, 0]} color="#2f3634" seg={8} />
      <Blok size={[0.5, 0.1, 0.22]} pos={[0.18, 3.42, 0]} color="#2f3634" r={0.04} />
      <Blok size={[0.32, 0.03, 0.14]} pos={[0.24, 3.36, 0]} color="#fff3d6" r={0.01} />
    </group>
  );
}

/** Witte poortpaal met kapje (zoals op het voorbeeld). */
export function Poortpaal({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[0.42, 0.95, 0.42]} pos={[0, 0.475, 0]} color={P.muur} r={0.05} />
      <Blok size={[0.52, 0.12, 0.52]} pos={[0, 1.0, 0]} color="#e9e2d4" r={0.04} />
      <Blok size={[0.22, 0.1, 0.22]} pos={[0, 1.1, 0]} color="#d9d1c2" r={0.04} />
    </group>
  );
}

const HUIS_VARIANT = [
  { muur: '#f4ecdd', muur2: '#ece2cf', hout: '#b97a43' },
  { muur: '#eef0ea', muur2: '#e1e5dd', hout: '#9c6a3d' },
  { muur: '#f2e7d8', muur2: '#e8dccb', hout: '#c48a52' },
];

/** Modern huis zoals in het voorbeeld: hoog volume met houten lamellen + laag volume, platte daken met witte rand. */
export function Villa({ w = 8, d = 6, variant = 0 }: { w?: number; d?: number; variant?: number }) {
  const v = HUIS_VARIANT[variant % HUIS_VARIANT.length];
  const wA = w * 0.58;
  const wB = w * 0.46;
  const hA = 5.0;
  const hB = 2.9;
  const xA = w / 2 - wA / 2;
  const xB = -w / 2 + wB / 2;
  const dak = (bw: number, bd: number, h: number, x: number, z = 0) => (
    <group position={[x, h, z]}>
      <Blok size={[bw + 0.3, 0.36, bd + 0.3]} pos={[0, 0.18, 0]} color="#efe9df" r={0.07} />
      <Blok size={[bw - 0.15, 0.1, bd - 0.15]} pos={[0, 0.38, 0]} color="#5a5653" r={0.04} />
    </group>
  );
  return (
    <group>
      {/* hoog volume */}
      <Blok size={[wA, hA, d]} pos={[xA, hA / 2, 0]} color={v.muur} r={0.1} />
      {dak(wA, d, hA, xA)}
      {/* houten kader met groot raam boven */}
      <group position={[xA - 0.2, hA * 0.68, d / 2 + 0.06]}>
        <Blok size={[wA * 0.62, hA * 0.38, 0.14]} color={v.hout} r={0.04} />
        {Array.from({ length: 9 }, (_, i) => (
          <Blok key={i} size={[0.04, hA * 0.38, 0.16]} pos={[-wA * 0.29 + (i * wA * 0.58) / 8, 0, 0.01]} color="#8a5a32" r={0.01} shadow={false} />
        ))}
        <Raam w={wA * 0.4} h={hA * 0.24} pos={[0.1, 0, 0.09]} />
      </group>
      {/* deur + raam beneden */}
      <Blok size={[1.05, 2.15, 0.1]} pos={[xA + wA * 0.28, 1.075, d / 2 + 0.03]} color={v.hout} r={0.03} />
      <Blok size={[0.08, 0.3, 0.06]} pos={[xA + wA * 0.28 - 0.35, 1.1, d / 2 + 0.1]} color="#2f3634" r={0.02} />
      <Blok size={[1.5, 0.12, 0.9]} pos={[xA + wA * 0.28, 2.45, d / 2 + 0.4]} color="#efe9df" r={0.04} />
      <Raam w={1.1} h={1.2} pos={[xA - wA * 0.2, 1.3, d / 2 + 0.03]} />
      {/* laag volume met breed raam */}
      <Blok size={[wB, hB, d * 0.86]} pos={[xB, hB / 2, d * 0.07]} color={v.muur2} r={0.1} />
      {dak(wB, d * 0.86, hB, xB, d * 0.07)}
      <group position={[xB, 1.35, d * 0.07 + (d * 0.86) / 2 + 0.03]}>
        <Raam w={wB * 0.7} h={1.25} pos={[0, 0, 0]} />
        <Blok size={[0.06, 1.25, 0.12]} pos={[-wB * 0.12, 0, 0.03]} color={P.kozijn} r={0.01} />
      </group>
      {/* zijramen en dakdetails */}
      <Raam w={0.9} h={1.1} pos={[w / 2 + 0.03, hA * 0.65, -0.6]} rot={[0, Math.PI / 2, 0]} />
      <Blok size={[0.5, 0.35, 0.5]} pos={[xA + 0.6, hA + 0.62, -0.8]} color="#c9c3b8" r={0.06} />
    </group>
  );
}

/** Kavel met villa, haag rondom, poortpalen en tuinpad (decor). */
export function HuisKavel({ w, d, variant = 0, seed = 1 }: { w: number; d: number; variant?: number; seed?: number }) {
  const kw = w + 3;
  const kd = d + 4;
  return (
    <group>
      <Kavel w={kw} d={kd} />
      <group position={[0, HOOGTE_KAVEL, -0.6]}>
        <Villa w={w} d={d} variant={variant} />
      </group>
      <group position={[0, HOOGTE_KAVEL, 0]}>
        {/* tuinpad naar de voordeur */}
        <group position={[w / 2 - w * 0.58 * 0.22, 0, d / 2 + 0.9]}>
          <TegelVlak w={1.4} d={kd / 2 - d / 2 + 0.2} y={0.02} />
        </group>
        <Blok size={[kw - 0.6, 0.7, 0.45]} pos={[-(kw / 2 - 0.3) / 2 - 0.9, 0.35, kd / 2 - 0.45]} color={P.haag} r={0.2} />
        <Blok size={[0.45, 0.7, kd - 1.2]} pos={[-kw / 2 + 0.45, 0.35, 0]} color={P.haag} r={0.2} />
        <Blok size={[0.45, 0.7, kd - 1.2]} pos={[kw / 2 - 0.45, 0.35, 0]} color={P.haag} r={0.2} />
        <Poortpaal pos={[w / 2 - w * 0.58 * 0.22 - 1.0, 0, kd / 2 - 0.45]} />
        <Poortpaal pos={[w / 2 - w * 0.58 * 0.22 + 1.0, 0, kd / 2 - 0.45]} />
        <MooieBoom pos={[-kw / 2 + 1.4, 0, kd / 2 - 1.5]} s={0.7} soort="den" seed={seed} />
      </group>
    </group>
  );
}

/** Eilandrand zoals op het voorbeeld: grasrand, aardlagen, steentjes, worteltjes en een buis. */
export function EilandRand({ w, d, diepte = 4.5 }: { w: number; d: number; diepte?: number }) {
  const steentjes = useMemo(() => {
    const r = seeded(11);
    const out: { p: V3; s: number; k: string }[] = [];
    const n = Math.round((w + d) * 1.3);
    for (let i = 0; i < n; i++) {
      const kant = Math.floor(r() * 4);
      const t = r() - 0.5;
      const y = -0.85 - r() * (diepte - 1.2);
      const s = 0.1 + r() * 0.17;
      const e = 0.04;
      const p: V3 = kant === 0 ? [t * w, y, d / 2 + e] : kant === 1 ? [t * w, y, -d / 2 - e] : kant === 2 ? [w / 2 + e, y, t * d] : [-w / 2 - e, y, t * d];
      out.push({ p, s, k: r() > 0.5 ? '#d7ac7f' : '#c79a6c' });
    }
    return out;
  }, [w, d, diepte]);
  return (
    <group>
      <Blok size={[w + 0.3, 0.55, d + 0.3]} pos={[0, -0.275, 0]} color={P.gras} r={0.26} shadow={false} />
      <Blok size={[w + 0.2, 0.18, d + 0.2]} pos={[0, -0.6, 0]} color="#8fb84f" r={0.08} shadow={false} />
      <Blok size={[w, 0.9, d]} pos={[0, -1.1, 0]} color="#b98048" r={0.12} shadow={false} />
      <Blok size={[w - 0.2, diepte - 1.5, d - 0.2]} pos={[0, -1.55 - (diepte - 1.5) / 2, 0]} color="#93613a" r={0.4} shadow={false} />
      {steentjes.map((k, i) => (
        <mesh key={i} position={k.p} material={mat(k.k, { flat: true })}>
          <icosahedronGeometry args={[k.s, 0]} />
        </mesh>
      ))}
      {/* buis die uit de aarde steekt */}
      <group position={[-w * 0.22, -1.3, d / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <Cil r={0.42} h={0.7} color="#8d9295" seg={20} />
        <Cil r={0.34} h={0.72} color="#4a4f52" seg={20} />
        <Cil r={0.47} h={0.12} pos={[0, 0.34, 0]} color="#a7acaf" seg={20} />
      </group>
      <group position={[w / 2 + 0.25, -1.9, d * 0.18]} rotation={[0, 0, Math.PI / 2]}>
        <Cil r={0.3} h={0.6} color="#8d9295" seg={18} />
        <Cil r={0.23} h={0.62} color="#4a4f52" seg={18} />
      </group>
    </group>
  );
}

/** Plantenbak met boompje (voor pleinen). */
export function Plantenbak({ pos, seed = 1 }: { pos: V3; seed?: number }) {
  return (
    <group position={pos}>
      <Blok size={[1.6, 0.55, 1.6]} pos={[0, 0.275, 0]} color="#d9d2c4" r={0.08} />
      <Blok size={[1.36, 0.05, 1.36]} pos={[0, 0.54, 0]} color="#6f5038" r={0.02} shadow={false} />
      <MooieBoom pos={[0, 0.5, 0]} s={0.62} soort="bol" seed={seed} />
    </group>
  );
}
