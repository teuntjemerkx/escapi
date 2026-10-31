// Wereld 5 – bouwstenen voor schermen, borden en papier met een canvas-textuur.
// In de wereld zijn de texturen klein (snel); in de inspectie worden ze scherp hertekend.
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { useInspectie } from '../game/inspectie';
import { Blok, Cil } from '../game/kit';
import { useTextuur } from '../game/tekst';
import { VPM, virtueel, type C } from './teken';

type V3 = [number, number, number];

const LAAG = 80;
const HOOG = 560;

/** Canvas-textuur van b × h meter, getekend in virtuele pixels (VPM per meter). */
export function useScherm(b: number, h: number, fn: (ctx: C, W: number, H: number) => void, sleutel: string) {
  const { delen } = useInspectie();
  const ppm = delen ? Math.min(HOOG, 4096 / Math.max(b, h), Math.sqrt(9e6 / (b * h))) : LAAG;
  return useTextuur(b, h, virtueel(b, fn), `w5-${sleutel}`, ppm);
}

/** Virtuele pixel op een scherm (b × h, midden in de oorsprong) → lokale meters. */
export const opScherm = (b: number, h: number) => (px: number, py: number, z = 0): V3 => [px / VPM - b / 2, h / 2 - py / VPM, z];

/** Vlak met textuur. `licht` = zelf oplichtend scherm; anders papier of hout. */
export function Beeld({ b, h, tex, pos, rot, licht = true, dubbel = false }: { b: number; h: number; tex: THREE.Texture; pos?: V3; rot?: V3; licht?: boolean; dubbel?: boolean }) {
  return (
    <mesh position={pos} rotation={rot} receiveShadow={!licht}>
      <planeGeometry args={[b, h]} />
      {licht ? (
        <meshBasicMaterial map={tex} toneMapped={false} side={dubbel ? THREE.DoubleSide : THREE.FrontSide} />
      ) : (
        <meshStandardMaterial map={tex} roughness={0.9} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.28} side={dubbel ? THREE.DoubleSide : THREE.FrontSide} />
      )}
    </mesh>
  );
}

/** Scherm met een rand. De oorsprong is het midden van het beeldvlak; kinderen staan in schermcoördinaten. */
export function Scherm({
  b,
  h,
  teken,
  sleutel,
  pos = [0, 0, 0],
  rot,
  rand = 0.08,
  diep = 0.12,
  kleur = '#262c33',
  licht = true,
  children,
}: {
  b: number;
  h: number;
  teken: (ctx: C, W: number, H: number) => void;
  sleutel: string;
  pos?: V3;
  rot?: V3;
  rand?: number;
  diep?: number;
  kleur?: string;
  licht?: boolean;
  children?: ReactNode;
}) {
  const tex = useScherm(b, h, teken, sleutel);
  return (
    <group position={pos} rotation={rot}>
      {rand > 0 && <Blok size={[b + rand * 2, h + rand * 2, diep]} pos={[0, 0, -diep / 2 - 0.002]} color={kleur} r={Math.min(0.05, rand * 0.6)} />}
      <Beeld b={b} h={h} tex={tex} pos={[0, 0, 0.004]} licht={licht} />
      {children}
    </group>
  );
}

/** Twee palen met voetjes (voor een groot bord). */
export function Palen({ x, hoogte, kleur = '#3a4249', dik = 0.07, z = -0.12 }: { x: number; hoogte: number; kleur?: string; dik?: number; z?: number }) {
  return (
    <group>
      {[-x, x].map((xx) => (
        <group key={xx}>
          <Cil r={dik} h={hoogte} pos={[xx, hoogte / 2, z]} color={kleur} seg={10} />
          <Blok size={[0.42, 0.08, 0.5]} pos={[xx, 0.04, z]} color={kleur} r={0} />
        </group>
      ))}
    </group>
  );
}

/** Eén dikke paal met een ronde voet. */
export function Paal({ hoogte, kleur = '#3a4249', r = 0.09, z = 0 }: { hoogte: number; kleur?: string; r?: number; z?: number }) {
  return (
    <group>
      <Cil r={r} h={hoogte} pos={[0, hoogte / 2, z]} color={kleur} seg={12} />
      <Cil r={0.45} rTop={0.4} h={0.1} pos={[0, 0.05, z]} color={kleur} seg={20} />
    </group>
  );
}

/** Lage sokkel of podium onder een object. */
export function Sokkel({ b, d, h = 0.12, kleur = '#d9d3c7', pos = [0, 0, 0] }: { b: number; d: number; h?: number; kleur?: string; pos?: V3 }) {
  return <Blok size={[b, h, d]} pos={[pos[0], pos[1] + h / 2, pos[2]]} color={kleur} r={0} />;
}

/** Schermwand: antraciet paneel met een aluminium lijst en twee voeten (achter een wandmodel; staat ook los in een kamer). */
export function Wandpaneel({ b, x = 0, h = 3.0 }: { b: number; x?: number; h?: number }) {
  return (
    <group position={[x, 0, -0.06]}>
      <Blok size={[b, h - 0.1, 0.07]} pos={[0, h / 2 + 0.05, 0]} color="#252b32" r={0} />
      <Blok size={[b + 0.05, 0.05, 0.1]} pos={[0, h + 0.02, 0]} color="#9aa3ad" r={0} />
      <Blok size={[0.05, h - 0.06, 0.1]} pos={[-b / 2 - 0.0, h / 2 + 0.02, 0]} color="#9aa3ad" r={0} />
      <Blok size={[0.05, h - 0.06, 0.1]} pos={[b / 2 + 0.0, h / 2 + 0.02, 0]} color="#9aa3ad" r={0} />
      <Blok size={[b + 0.04, 0.1, 0.1]} pos={[0, 0.05, 0]} color="#1b1f24" r={0} />
      {[-b / 2 + 0.25, b / 2 - 0.25].map((xx) => (
        <Blok key={xx} size={[0.1, 0.05, 0.45]} pos={[xx, 0.025, -0.2]} color="#1b1f24" r={0} />
      ))}
    </group>
  );
}
