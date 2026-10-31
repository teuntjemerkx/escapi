// De kluis van een klus: een stalen kluis met een cijferwiel per station.
// Elk wiel heeft een symbool (driehoek, rondje, vierkant, ster). Gaat de kluis open,
// dan zweeft er een sleutel in de kleur van de klus uit.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Klus } from '../werelden/types';
import { Blok, Cil, mat } from './kit';
import { useSpel } from './store';
import { useTextuur } from './tekst';

export const SYMBOOL_NAAM = ['driehoek', 'rondje', 'vierkant', 'ster'];

/** Teken symbool i (0 driehoek, 1 rondje, 2 vierkant, 3 ster) in een canvas. */
export function tekenSymbool(ctx: CanvasRenderingContext2D, i: number, cx: number, cy: number, r: number, kleur: string) {
  ctx.fillStyle = kleur;
  ctx.beginPath();
  if (i % 4 === 0) {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.95, cy + r * 0.72);
    ctx.lineTo(cx - r * 0.95, cy + r * 0.72);
  } else if (i % 4 === 1) {
    ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  } else if (i % 4 === 2) {
    ctx.rect(cx - r * 0.76, cy - r * 0.76, r * 1.52, r * 1.52);
  } else {
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? r * 0.42 : r;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function SymboolPlaat({ i, kleur, pos }: { i: number; kleur: string; pos: [number, number, number] }) {
  const tex = useTextuur(
    0.14,
    0.14,
    (ctx, w, h) => {
      ctx.fillStyle = '#1b2120';
      ctx.fillRect(0, 0, w, h);
      tekenSymbool(ctx, i, w / 2, h / 2 + 1, w * 0.36, kleur);
    },
    `sym-${i}-${kleur}`,
    600,
  );
  return (
    <mesh position={pos}>
      <planeGeometry args={[0.14, 0.14]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

export function Sleutel({ kleur, s = 1 }: { kleur: string; s?: number }) {
  const m = useMemo(() => mat(kleur, { rough: 0.35, metal: 0.55, emissive: kleur }), [kleur]);
  return (
    <group scale={s}>
      <mesh material={m} position={[0, 0.16, 0]} castShadow>
        <torusGeometry args={[0.085, 0.028, 10, 24]} />
      </mesh>
      <mesh material={m} position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
      </mesh>
      <mesh material={m} position={[0.045, -0.15, 0]}>
        <boxGeometry args={[0.07, 0.035, 0.04]} />
      </mesh>
      <mesh material={m} position={[0.035, -0.09, 0]}>
        <boxGeometry args={[0.05, 0.03, 0.04]} />
      </mesh>
    </group>
  );
}

export function KluisModel({ klus }: { klus: Klus }) {
  const open = useSpel((s) => !!s.kluizen[`${s.wereld}:${klus.id}`]);
  const deur = useRef<THREE.Group>(null);
  const sleutel = useRef<THREE.Group>(null);
  const hoek = useRef(open ? 1 : 0);
  useFrame(({ clock }, dt) => {
    const doel = open ? 1 : 0;
    hoek.current += (doel - hoek.current) * Math.min(1, dt * 2.4);
    if (deur.current) deur.current.rotation.y = -hoek.current * 1.95;
    if (sleutel.current) {
      sleutel.current.visible = hoek.current > 0.04;
      sleutel.current.position.y = 0.62 + hoek.current * 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.04;
      sleutel.current.position.z = 0.1 + hoek.current * 0.45;
      sleutel.current.rotation.y += dt * 1.4;
    }
  });
  const n = klus.stations.length;
  return (
    <group>
      <Blok size={[1.3, 0.12, 1.12]} pos={[0, 0.06, 0]} color="#272d2c" r={0.04} />
      <Blok size={[1.12, 1.26, 0.96]} pos={[0, 0.75, 0]} color="#66736f" r={0.08} />
      {/* band in de kleur van de klus */}
      <Blok size={[1.14, 0.08, 0.98]} pos={[0, 1.24, 0]} color={klus.kleur} r={0.03} />
      {/* binnenkant */}
      <mesh position={[0, 0.75, 0.482]}>
        <planeGeometry args={[0.92, 1.04]} />
        <meshStandardMaterial color="#141918" roughness={1} />
      </mesh>
      <group ref={deur} position={[-0.5, 0.75, 0.5]}>
        <Blok size={[1.0, 1.08, 0.08]} pos={[0.5, 0, 0]} color="#76837f" r={0.04} />
        <Blok size={[0.9, 0.98, 0.02]} pos={[0.5, 0, 0.045]} color="#83908c" r={0.01} shadow={false} />
        {Array.from({ length: n }, (_, i) => {
          const x = 0.5 + (i - (n - 1) / 2) * 0.2;
          return (
            <group key={i}>
              <SymboolPlaat i={i} kleur={klus.kleur} pos={[x, 0.2, 0.058]} />
              <Cil r={0.075} h={0.13} pos={[x, 0.0, 0.07]} rot={[0, 0, Math.PI / 2]} color="#d5dad7" seg={14} />
            </group>
          );
        })}
        <Cil r={0.1} h={0.05} pos={[0.5, -0.3, 0.07]} rot={[Math.PI / 2, 0, 0]} color="#c9cfcc" seg={16} />
        {[0, 1, 2].map((k) => (
          <Blok key={k} size={[0.04, 0.2, 0.04]} pos={[0.5 + Math.cos((k * Math.PI * 2) / 3) * 0.12, -0.3 + Math.sin((k * Math.PI * 2) / 3) * 0.12, 0.1]} rot={[0, 0, (k * Math.PI * 2) / 3 + Math.PI / 2]} color="#c9cfcc" r={0.015} />
        ))}
        {[-0.38, 0.38].map((y) => (
          <Cil key={y} r={0.035} h={0.16} pos={[-0.01, y, 0]} color="#2a302f" seg={8} />
        ))}
      </group>
      <group ref={sleutel} position={[0, 0.62, 0.1]}>
        <Sleutel kleur={klus.kleur} s={1.3} />
      </group>
    </group>
  );
}
