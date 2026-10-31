// Wereld 3 – "De Markthal aan de Waag": alles wat de motor niet zelf bouwt.
// Het gebouw (muren, glazen gewelf, galerij, kolommen, puien, rolhekken, trappen) komt uit de plattegrond in huis.ts.
// Hier: het beschilderde gewelf, hanglampen, hekken, borden, de klok, de reuzenweegschaal, het glas-in-lood boven de poort,
// kaasrekken, koelvitrines, het terras op het plein, de laadkade met kraan en bestelbus, en alle botsingen daarvan.
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { box, cirkel, opLaag } from '../game/botsing';
import { FrankPoster } from '../game/frank';
import { Kleed } from '../game/huis';
import { Spijlenhek } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { mat } from '../game/kit';
import { useSpel, type Fase } from '../game/store';
import { FONT, useTextuur } from '../game/tekst';
import { Druk } from './atlas';
import { Blok, Cil } from './blok';
import { Plant, Schoolbord, Vat } from '../game/meubels';
import { HAL_H, HV, IJZER, GOUD } from './huis';
import { Bol, KLEUR, Kraam, Poppetje, type V3 } from './kraam';

const VLAG_KLEUREN = ['#e5675a', '#f2c24a', '#3d7cc9', '#7cbf4a', '#e86a9a', '#e48a3a'];

// ── Kleine bouwstenen ────────────────────────────────────────────────────

/** Slinger met driehoekige vlaggetjes tussen twee punten: één vlak met een textuur (licht). */
function Slinger({ van, naar, n, y = 2.95, seed = 1 }: { van: [number, number]; naar: [number, number]; n: number; y?: number; seed?: number }) {
  const dx = naar[0] - van[0];
  const dz = naar[1] - van[1];
  const l = Math.hypot(dx, dz);
  const hoek = Math.atan2(-dz, dx);
  const H = 0.55;
  const teken = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);
      const zak = (x: number) => Math.sin((x / w) * Math.PI) * h * 0.3;
      ctx.strokeStyle = '#3b2a20';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) ctx.lineTo(x, 4 + zak(x));
      ctx.stroke();
      const b = w / n;
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * b;
        const y0 = 4 + zak(x);
        ctx.fillStyle = VLAG_KLEUREN[(i + seed) % VLAG_KLEUREN.length];
        ctx.beginPath();
        ctx.moveTo(x - b * 0.42, y0);
        ctx.lineTo(x + b * 0.42, y0);
        ctx.lineTo(x, y0 + h * 0.6);
        ctx.closePath();
        ctx.fill();
      }
  };
  return (
    <group position={[van[0], 0, van[1]]} rotation={[0, hoek, 0]}>
      <Druk b={l} h={H} teken={teken} sleutel={`w3-slinger-${l.toFixed(1)}-${n}-${seed}`} ppm={60} dubbel alpha position={[l / 2, y - H / 2 + 0.02, 0]}>
        <planeGeometry args={[l, H]} />
      </Druk>
    </group>
  );
}

/** Stapel kaaswielen. */
function Kaastoren({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <Cil r={0.32 - i * 0.03} h={0.16} pos={[0, 0.08 + i * 0.17, 0]} color={i % 2 ? '#e9b52f' : '#f2c24a'} seg={20} />
          <Cil r={0.31 - i * 0.03} h={0.02} pos={[0, 0.165 + i * 0.17, 0]} color="#d89a22" seg={20} />
        </group>
      ))}
      <Blok size={[0.14, 0.12, 0.1]} pos={[0.2, 0.76, 0.05]} rot={[0, 0.4, 0]} color="#f2d04a" r={0.02} />
    </group>
  );
}

/** Kaasrek in het pakhuis: houten stellage met vier planken vol kaaswielen. Lengte langs x (lokaal), diepte 0,55. */
function Kaasrek({ pos, rot = 0, l }: { pos: V3; rot?: number; l: number }) {
  const n = Math.max(2, Math.floor(l / 0.62));
  const planken = [0.28, 0.86, 1.44, 2.02];
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.07, 2.5, 0.55]} pos={[(s * (l - 0.07)) / 2, 1.25, 0]} color="#6e4a30" r={0.01} />
      ))}
      {planken.map((y) => (
        <Blok key={y} size={[l, 0.05, 0.55]} pos={[0, y, 0]} color="#8a6038" r={0.01} />
      ))}
      {planken.map((y, j) =>
        Array.from({ length: n }, (_, i) => {
          const leeg = (i * 7 + j * 3) % 9 === 4;
          if (leeg) return null;
          const x = -l / 2 + 0.33 + (i * (l - 0.66)) / Math.max(1, n - 1);
          const kleur = (i + j) % 3 === 0 ? '#d9962a' : (i + j) % 3 === 1 ? '#efc24a' : '#c9a24a';
          return <Cil key={`${j}-${i}`} r={0.26} h={0.15} pos={[x, y + 0.1, 0]} rot={[Math.PI / 2, 0, 0]} color={kleur} seg={14} />;
        }),
      )}
    </group>
  );
}

/** Koelvitrine voor vis: rvs kast met ijs en vissen erop. Lengte langs x (lokaal), voorkant naar +z. */
function Koelvitrine({ pos, rot = 0, l }: { pos: V3; rot?: number; l: number }) {
  const n = Math.max(2, Math.floor(l / 0.5));
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[l, 0.82, 0.85]} pos={[0, 0.41, 0]} color="#c9d1d6" r={0.03} rough={0.35} />
      <Blok size={[l - 0.1, 0.06, 0.75]} pos={[0, 0.86, 0]} color="#f4fbff" r={0.02} rough={0.2} />
      <Blok size={[l, 0.06, 0.05]} pos={[0, 0.84, 0.43]} color="#8a959c" r={0.01} />
      {Array.from({ length: n }, (_, i) => {
        const x = -l / 2 + 0.3 + (i * (l - 0.6)) / Math.max(1, n - 1);
        const kleur = ['#8fa3ad', '#b8c2c6', '#e5675a', '#9aa8b0'][i % 4];
        return (
          <group key={i} position={[x, 0.93, (i % 2 ? 0.12 : -0.12)]} rotation={[0, (i % 3) * 0.3 - 0.3, 0]}>
            <mesh scale={[1, 0.32, 0.38]} material={mat(kleur, { rough: 0.3, metal: 0.2 })}>
              <sphereGeometry args={[0.2, 10, 6]} />
            </mesh>
            <Blok size={[0.08, 0.06, 0.12]} pos={[0.22, 0, 0]} color={kleur} r={0.01} />
          </group>
        );
      })}
      {/* prijskaartjes */}
      {[-0.3, 0.3].map((t) => (
        <Blok key={t} size={[0.22, 0.14, 0.02]} pos={[t * l, 1.0, 0.36]} rot={[-0.4, 0, 0]} color="#fbfaf6" r={0.01} />
      ))}
    </group>
  );
}

/** Rond bistrotafeltje met twee stoeltjes (binnen, zonder parasol). */
function Bistrotafel({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Cil r={0.38} h={0.04} pos={[0, 0.74, 0]} color="#e9dcc3" seg={18} />
      <Cil r={0.04} h={0.72} pos={[0, 0.37, 0]} color={IJZER} seg={8} />
      <Cil r={0.2} h={0.03} pos={[0, 0.015, 0]} color={IJZER} seg={12} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.66, 0, 0]}>
          <Cil r={0.18} h={0.04} pos={[0, 0.46, 0]} color="#7a5233" seg={14} />
          <Cil r={0.025} h={0.44} pos={[0, 0.22, 0]} color={IJZER} seg={6} />
          <Blok size={[0.05, 0.4, 0.34]} pos={[s * 0.16, 0.7, 0]} color="#7a5233" r={0.02} />
        </group>
      ))}
      <Bol pos={[0.1, 0.8, 0.1]} r={0.05} kleur="#fbfaf6" />
    </group>
  );
}

/** Rond cafétafeltje met twee stoeltjes en een parasol (terras op het plein). */
function Cafetafel({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.42} h={0.04} pos={[0, 0.74, 0]} color={KLEUR.creme} seg={18} />
      <Cil r={0.04} h={0.72} pos={[0, 0.37, 0]} color="#2f3634" seg={8} />
      <Cil r={0.22} h={0.03} pos={[0, 0.015, 0]} color="#2f3634" seg={12} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.68, 0, 0]}>
          <Cil r={0.18} h={0.04} pos={[0, 0.46, 0]} color="#3f6f8f" seg={14} />
          <Cil r={0.025} h={0.44} pos={[0, 0.22, 0]} color="#2f3634" seg={6} />
          <Blok size={[0.06, 0.4, 0.34]} pos={[s * 0.16, 0.7, 0]} color="#3f6f8f" r={0.02} />
        </group>
      ))}
      <Cil r={0.025} h={2.2} pos={[0, 1.2, 0]} color="#efe6d6" seg={6} />
      <mesh position={[0, 2.35, 0]} castShadow material={mat('#e5675a')}>
        <coneGeometry args={[1.0, 0.38, 10]} />
      </mesh>
      <Bol pos={[0.1, 0.8, 0.12]} r={0.05} kleur="#fbfaf6" />
    </group>
  );
}

/** Koffiekar op het plein. */
function Koffiekar({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.5, 0.95, 0.7]} pos={[0, 0.55, 0]} color="#7a5132" r={0.05} />
      <Blok size={[1.6, 0.06, 0.8]} pos={[0, 1.05, 0]} color={KLEUR.creme} r={0.02} />
      {[-0.55, 0.55].map((x) => (
        <Cil key={x} r={0.18} h={0.06} pos={[x, 0.18, 0.37]} rot={[Math.PI / 2, 0, 0]} color="#2f3634" seg={12} />
      ))}
      <Blok size={[0.42, 0.36, 0.3]} pos={[-0.35, 1.26, -0.1]} color="#c9cfd3" r={0.04} />
      <Cil r={0.04} h={0.09} pos={[0.2, 1.13, 0.1]} color="#fbfaf6" seg={8} />
      <Cil r={0.04} h={0.09} pos={[0.35, 1.13, -0.05]} color="#fbfaf6" seg={8} />
      <Blok size={[0.05, 1.3, 0.05]} pos={[0.7, 1.7, -0.3]} color="#2f3634" r={0} />
      <Blok size={[0.9, 0.34, 0.05]} pos={[0.3, 2.3, -0.3]} color="#7a5132" r={0.02} />
    </group>
  );
}

/** Bestelbus van de markt (Tygo tankt hier). Lengte langs x. */
function Bestelbus({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  const ruit = '#2c3a48';
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[3.4, 1.9, 1.9]} pos={[-0.55, 1.33, 0]} color="#f4efe6" r={0.12} />
      <Blok size={[1.3, 1.25, 1.86]} pos={[1.75, 1.0, 0]} color="#f4efe6" r={0.12} />
      <Blok size={[0.06, 0.6, 1.6]} pos={[2.42, 1.35, 0]} rot={[0, 0, -0.35]} color={ruit} r={0.02} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.8, 0.5, 0.04]} pos={[1.6, 1.38, s * 0.94]} color={ruit} r={0.01} />
      ))}
      <Blok size={[4.7, 0.36, 1.94]} pos={[0, 0.48, 0]} color="#e48a3a" r={0.06} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[2.4, 0.34, 0.03]} pos={[-0.6, 1.5, s * 0.96]} color="#e48a3a" r={0.01} />
      ))}
      {[
        [-1.6, -1],
        [-1.6, 1],
        [1.55, -1],
        [1.55, 1],
      ].map(([x, s]) => (
        <Cil key={`${x}${s}`} r={0.36} h={0.24} pos={[x, 0.36, s * 0.86]} rot={[Math.PI / 2, 0, 0]} color="#24272b" seg={14} />
      ))}
      <Blok size={[0.12, 0.16, 1.5]} pos={[2.4, 0.66, 0]} color="#fff2c8" r={0.03} />
    </group>
  );
}

/** Pallet met kratten (laadkade). */
function Pallet({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.2, 0.14, 1.0]} pos={[0, 0.07, 0]} color="#c9a26a" r={0.02} />
      {[-0.4, 0, 0.4].map((x) => (
        <Blok key={x} size={[0.12, 0.1, 1.0]} pos={[x, 0.02, 0]} color="#a8844e" r={0.01} />
      ))}
      {[
        [-0.28, 0.14, -0.2, 0, '#c99a62'],
        [0.3, 0.14, 0.1, 0.15, '#3d7cc9'],
        [-0.25, 0.46, -0.18, -0.1, '#e48a3a'],
      ].map(([x, y, z, r, k], i) => (
        <group key={i} position={[x as number, y as number, z as number]} rotation={[0, r as number, 0]}>
          <Blok size={[0.56, 0.3, 0.4]} pos={[0, 0.15, 0]} color={k as string} r={0.03} />
          <Bol pos={[-0.12, 0.33, 0]} r={0.09} kleur="#7cbf4a" />
          <Bol pos={[0.12, 0.33, 0.05]} r={0.09} kleur="#e5675a" />
        </group>
      ))}
    </group>
  );
}

/** Havenkraan op de hoek van de laadkade (de haak wiegt in MarkthalLevend). */
export const KRAAN = { voet: [20.2, -17.15] as [number, number], top: [20.2, 5.6, -17.15] as V3, punt: [24.0, 4.1, -14.4] as V3 };
function Kraan() {
  const [vx, vz] = KRAAN.voet;
  const [tx, ty, tz] = KRAAN.top;
  const [px, py, pz] = KRAAN.punt;
  const dx = px - tx;
  const dy = py - ty;
  const dz = pz - tz;
  const l = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.asin(dy / l);
  return (
    <group>
      <Blok size={[1.3, 0.5, 1.3]} pos={[vx, 0.25, vz]} color="#3b4250" r={0.05} />
      <Blok size={[0.42, ty - 0.5, 0.42]} pos={[vx, 0.5 + (ty - 0.5) / 2, vz]} color="#e2b33c" r={0.03} />
      {[1.4, 2.6, 3.8].map((y) => (
        <Blok key={y} size={[0.5, 0.06, 0.5]} pos={[vx, y, vz]} color="#c9962a" r={0} />
      ))}
      <Blok size={[1.2, 1.0, 1.1]} pos={[vx - 0.2, ty + 0.2, vz + 0.1]} color="#e2b33c" r={0.06} />
      <Blok size={[0.06, 0.5, 0.8]} pos={[vx + 0.42, ty + 0.3, vz + 0.1]} color="#2c3a48" r={0} />
      <group position={[tx, ty + 0.55, tz]} rotation={[0, yaw, 0]}>
        <group rotation={[-pitch, 0, 0]}>
          <Blok size={[0.3, 0.3, l + 0.6]} pos={[0, 0, l / 2]} color="#e2b33c" r={0.03} />
        </group>
        <Blok size={[0.5, 0.5, 1.0]} pos={[0, 0, -0.9]} color="#3b4250" r={0.05} />
      </group>
    </group>
  );
}

/** IJzeren bolder om boten aan vast te leggen. */
function Bolder({ pos }: { pos: [number, number] }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Cil r={0.17} h={0.42} pos={[0, 0.21, 0]} color="#2f3438" seg={12} />
      <Cil r={0.22} h={0.08} pos={[0, 0.44, 0]} color="#2f3438" seg={12} />
    </group>
  );
}

/** Paal voor de lichtsnoeren boven het plein. */
export function Snoerpaal({ pos, h = 4.5 }: { pos: [number, number]; h?: number }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Cil r={0.14} h={0.3} pos={[0, 0.15, 0]} color="#2f3634" seg={8} />
      <Cil r={0.05} h={h} pos={[0, h / 2, 0]} color="#2f3634" seg={6} />
      <Cil r={0.08} h={0.08} pos={[0, h + 0.04, 0]} color="#2f3634" seg={6} />
    </group>
  );
}

/** Naambord (atlas: alle borden samen in één tekenstap): letters op een gekleurd bord met een dunne rand, op een houten plaat. */
function Bord({ pos, rot = 0, tekst, b = 2.4, h = 0.5, kleur = '#23443a', fg = '#e9c46a', dubbel = false }: { pos: V3; rot?: number; tekst: string; b?: number; h?: number; kleur?: string; fg?: string; dubbel?: boolean }) {
  const teken = (ctx: CanvasRenderingContext2D, w: number, hh: number) => {
    ctx.fillStyle = kleur;
    ctx.fillRect(0, 0, w, hh);
    ctx.strokeStyle = fg;
    ctx.lineWidth = Math.max(3, hh * 0.05);
    ctx.strokeRect(hh * 0.1, hh * 0.1, w - hh * 0.2, hh - hh * 0.2);
    ctx.fillStyle = fg;
    let px = hh * 0.5;
    ctx.font = `700 ${px}px ${FONT}`;
    while (px > 10 && ctx.measureText(tekst).width > w * 0.88) {
      px -= 2;
      ctx.font = `700 ${px}px ${FONT}`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tekst, w / 2, hh / 2 + px * 0.04);
  };
  const sleutel = `w3-bord-${tekst}-${b}-${h}-${kleur}-${fg}`;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.08, h + 0.08, 0.05]} pos={[0, 0, -0.03]} color="#3a2a1e" r={0.02} />
      <Druk b={b} h={h} teken={teken} sleutel={sleutel} ppm={160} position={[0, 0, 0.001]}>
        <planeGeometry args={[b, h]} />
      </Druk>
      {dubbel && (
        <Druk b={b} h={h} teken={teken} sleutel={sleutel} ppm={160} position={[0, 0, -0.061]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[b, h]} />
        </Druk>
      )}
    </group>
  );
}

/** Bord dat aan twee kettingen hangt (zonebord in de open hal), aan beide kanten beschilderd. */
function HangBord({ pos, rot = 0, tekst, b = 2.4, kleur = '#23443a', fg = '#e9c46a', ketting = 1.2 }: { pos: V3; rot?: number; tekst: string; b?: number; kleur?: string; fg?: string; ketting?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Bord pos={[0, 0, 0]} tekst={tekst} b={b} kleur={kleur} fg={fg} dubbel />
      {[-1, 1].map((s) => (
        <Cil key={s} r={0.012} h={ketting} pos={[(s * b) / 2.6, 0.25 + ketting / 2, -0.03]} color="#2a2522" seg={4} />
      ))}
    </group>
  );
}

// ── Hanglampen: emaille kap + gloeilamp (geen echt licht; de gloed komt van `lampen` in het plan) ──
export const lampGloed = new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: '#ffcf8a', emissiveIntensity: 1.4, roughness: 0.4 });
const kapBuiten = mat(IJZER, { rough: 0.45, metal: 0.2 });
const kapBinnen = mat('#f6efe0', { rough: 0.6 });

/** Hanglamp: snoer van `boven` naar de kap op hoogte y. */
function Hanglamp({ x, y, z, boven, groot = false }: { x: number; y: number; z: number; boven: number; groot?: boolean }) {
  const r = groot ? 0.42 : 0.24;
  return (
    <group position={[x, y, z]}>
      <Cil r={0.01} h={boven - y} pos={[0, (boven - y) / 2 + 0.12, 0]} color="#2a2522" seg={4} />
      <mesh position={[0, 0, 0]} material={kapBuiten} castShadow>
        <coneGeometry args={[r, r * 0.6, 14, 1, true]} />
      </mesh>
      <mesh position={[0, -0.005, 0]} material={kapBinnen}>
        <coneGeometry args={[r * 0.97, r * 0.58, 14, 1, true]} />
      </mesh>
      <mesh position={[0, -r * 0.22, 0]} material={lampGloed}>
        <sphereGeometry args={[groot ? 0.12 : 0.07, 10, 8]} />
      </mesh>
    </group>
  );
}

/** Hoogte van de onderkant van het glazen gewelf boven x (de ribben hangen ± 0,2 m lager). */
const gewelfY = (x: number) => {
  const R = (3.2 * 3.2 + 36) / 6.4;
  return HAL_H + Math.sqrt(R * R - x * x) - (R - 3.2) - 0.2;
};

/** Alle hanglampen [x, y, z, plafond, groot]. */
const LAMPEN: [number, number, number, number, boolean?][] = [
  // kramenstraat: boven elke kraamrij, en drie grote bollen in het midden
  ...[7.3, 4.2, 1.1, -2.0].flatMap((z): [number, number, number, number][] => [
    [-2.4, 3.3, z, gewelfY(2.4)],
    [2.4, 3.3, z, gewelfY(2.4)],
  ]),
  [0, 5.8, 2.0, gewelfY(0), true],
  [0, 5.8, -4.0, gewelfY(0), true],
  // entree onder de galerij
  [-3.8, 3.2, 10.4, HV - 0.3],
  [3.8, 3.2, 10.4, HV - 0.3],
  // zijbeuken (plafond 3,7 m)
  ...[8.6, 2.0, -1.6].flatMap((z): [number, number, number, number][] => [
    [-9.6, 2.9, z, 3.7],
    [9.6, 2.9, z, 3.7],
  ]),
  // pakhuis en vishal
  [-9.5, 2.9, -11.0, 3.7],
  [-9.5, 2.9, -15.2, 3.7],
  [9.5, 2.9, -10.0, 3.7],
  [9.5, 2.9, -15.0, 3.7],
  // kookschool
  [-9.8, 2.7, 14.5, 3.7],
  // De Waag: vier lampen rond de balans
  [-2.6, 4.6, -9.0, HAL_H],
  [2.6, 4.6, -9.0, HAL_H],
  [-2.6, 4.6, -15.0, HAL_H],
  [2.6, 4.6, -15.0, HAL_H],
  // galerij (vloer 4 m, kap 8 m)
  ...[7.4, 2.0, -3.0, -8.0, -14.6].flatMap((z): [number, number, number, number][] => [
    [-9.6, HV + 2.9, z, HV + 4],
    [9.6, HV + 2.9, z, HV + 4],
  ]),
];

// ── Het beschilderde gewelf: reuzenfruit op hemelsblauw, in de flanken van het glazen gewelf ──
/** Zelfde boog als het glasgewelf van de motor (bouwdelen.tsx): span 12 m, pijl 3,2 m, vanaf HAL_H. */
const SPAN = 12;
const PIJL = 3.2;
const R_BOOG = (PIJL * PIJL + (SPAN / 2) ** 2) / (2 * PIJL);
const A0 = Math.asin(SPAN / 2 / R_BOOG);
/** Tot waar de schildering loopt (daarboven: de glazen lichtstraat van ± 4 m breed). */
const A1 = Math.asin(2.1 / R_BOOG);

function tekenFruit(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#a9d4ea');
  g.addColorStop(1, '#7fb6d6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // zachte wolken
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 9; i++) {
    const x = ((i * 137) % w) + 20;
    const y = ((i * 71) % h) * 0.8 + 30;
    ctx.beginPath();
    ctx.ellipse(x, y, 90, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const s = h / 5;
  const tomaat = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#d9473a';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.08, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f8f3a';
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * r * 0.22, y - r * 0.85 + Math.sin(a) * r * 0.12, r * 0.24, r * 0.08, a, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const kaas = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#f2c24a';
    ctx.beginPath();
    ctx.moveTo(x - r, y + r * 0.6);
    ctx.lineTo(x + r, y + r * 0.6);
    ctx.lineTo(x + r * 0.7, y - r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d89a22';
    for (const [dx, dy, rr] of [
      [-0.3, 0.3, 0.12],
      [0.3, 0.1, 0.09],
      [0.55, -0.3, 0.07],
    ])
      ctx.beginPath(), ctx.arc(x + dx * r, y + dy * r, rr * r, 0, Math.PI * 2), ctx.fill();
  };
  const wortel = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#e8832e';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, y - r);
    ctx.lineTo(x + r * 0.3, y - r);
    ctx.lineTo(x, y + r * 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4f9a3a';
    for (const a of [-0.5, 0, 0.5]) ctx.beginPath(), ctx.ellipse(x + a * r * 0.4, y - r * 1.35, r * 0.1, r * 0.4, a, 0, Math.PI * 2), ctx.fill();
  };
  const citroen = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#f5d33c';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.2, r * 0.85, 0.3, 0, Math.PI * 2);
    ctx.fill();
  };
  const druif = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#7b4aa8';
    for (let i = 0; i < 4; i++) for (let j = 0; j <= i; j++) ctx.beginPath(), ctx.arc(x + (j - i / 2) * r * 0.42, y - i * r * 0.36, r * 0.24, 0, Math.PI * 2), ctx.fill();
  };
  const vis = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#5f8fa8';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.3, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + r * 1.1, y);
    ctx.lineTo(x + r * 1.7, y - r * 0.45);
    ctx.lineTo(x + r * 1.7, y + r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - r * 0.85, y - r * 0.08, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  };
  const brood = (x: number, y: number, r: number) => {
    ctx.fillStyle = '#c98a45';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.3, r * 0.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a5a26';
    ctx.lineWidth = r * 0.08;
    for (const t of [-0.5, 0, 0.5]) ctx.beginPath(), ctx.moveTo(x + t * r - r * 0.15, y - r * 0.3), ctx.lineTo(x + t * r + r * 0.15, y + r * 0.2), ctx.stroke();
  };
  const vormen = [tomaat, kaas, wortel, citroen, druif, vis, brood];
  for (let i = 0; i < 12; i++) {
    const x = ((i * 0.618 * w) % w) + s * 0.4;
    const y = (0.15 + ((i * 0.37) % 0.75)) * h;
    vormen[i % vormen.length](x % w, y, s * (0.55 + ((i * 13) % 5) * 0.07));
  }
  // gouden bies langs de lichtstraat
  ctx.fillStyle = GOUD;
  ctx.fillRect(0, 0, w, h * 0.025);
}

/** De twee beschilderde flanken van het gewelf boven de kramenstraat (z −6 … 12). */
function GewelfSchildering() {
  const tex = useTextuur(6, 4.8, tekenFruit, 'w3-gewelf-fruit', 110);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.28, roughness: 0.9, side: THREE.DoubleSide }), [tex]);
  const geo = useMemo(() => {
    const R = R_BOOG - 0.13;
    const stuks = 10;
    const pos: number[] = [];
    const uv: number[] = [];
    for (const kant of [-1, 1])
      for (let seg = 0; seg < 3; seg++) {
        const z0 = -6 + seg * 6;
        const z1 = z0 + 6;
        for (let i = 0; i < stuks; i++) {
          // van de aanzet (a0) naar de lichtstraat (a1); v = 1 bij de aanzet, 0 bij de lichtstraat
          const t0 = i / stuks;
          const t1 = (i + 1) / stuks;
          const a = (t: number) => kant * (A0 - (A0 - A1) * t);
          const p = (t: number, z: number) => [R * Math.sin(a(t)), HAL_H + R * Math.cos(a(t)) - (R_BOOG - PIJL), z];
          const q = [
            [p(t0, z0), [0, 1 - t0]],
            [p(t1, z0), [0, 1 - t1]],
            [p(t1, z1), [1, 1 - t1]],
            [p(t0, z0), [0, 1 - t0]],
            [p(t1, z1), [1, 1 - t1]],
            [p(t0, z1), [1, 1 - t0]],
          ] as const;
          for (const [pp, u] of q) {
            pos.push(pp[0], pp[1], pp[2]);
            uv.push(kant > 0 ? 1 - u[0] : u[0], u[1]);
          }
        }
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={m} castShadow />;
}

// ── Glas-in-lood boven de poort (akkers, koeien, een vissersboot, een weegschaal) ──
function tekenGlasInLood(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#1d1712';
  ctx.fillRect(0, 0, w, h);
  const vak = (x: number, y: number, b: number, hh: number, k: string) => {
    ctx.fillStyle = k;
    ctx.fillRect(x + 3, y + 3, b - 6, hh - 6);
  };
  // lucht
  for (let i = 0; i < 8; i++) vak((i * w) / 8, 0, w / 8, h * 0.32, i % 2 ? '#e9b45a' : '#f2c97a');
  // zon in het midden
  ctx.fillStyle = '#ffdf8a';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.3, h * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // akkers
  const akker = ['#6f9a3a', '#a8b84a', '#4f7d3a', '#c9a24a', '#7aa84a', '#d9b45a'];
  for (let i = 0; i < 6; i++) vak((i * w) / 6, h * 0.32, w / 6, h * 0.22, akker[i]);
  // water met een bootje
  for (let i = 0; i < 6; i++) vak((i * w) / 6, h * 0.54, w / 6, h * 0.16, i % 2 ? '#3d7cc9' : '#5f9ad6');
  ctx.fillStyle = '#7a3a2a';
  ctx.fillRect(w * 0.18, h * 0.56, w * 0.14, h * 0.05);
  ctx.fillStyle = '#f4efe6';
  ctx.beginPath();
  ctx.moveTo(w * 0.24, h * 0.56);
  ctx.lineTo(w * 0.24, h * 0.4);
  ctx.lineTo(w * 0.31, h * 0.55);
  ctx.closePath();
  ctx.fill();
  // onderrand: kazen, fruit en een weegschaal in het midden
  for (let i = 0; i < 8; i++) vak((i * w) / 8, h * 0.7, w / 8, h * 0.3, ['#c94f3f', '#e9b52f', '#7cbf4a', '#e48a3a'][i % 4]);
  ctx.strokeStyle = '#1d1712';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.72);
  ctx.lineTo(w / 2, h * 0.95);
  ctx.moveTo(w * 0.36, h * 0.78);
  ctx.lineTo(w * 0.64, h * 0.78);
  ctx.stroke();
  ctx.fillStyle = '#f2c24a';
  for (const x of [0.36, 0.64]) ctx.beginPath(), ctx.arc(w * x, h * 0.86, h * 0.06, 0, Math.PI), ctx.fill();
  // looddraden
  ctx.strokeStyle = '#2a211a';
  ctx.lineWidth = 3;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo((i * w) / 6, 0);
    ctx.lineTo((i * w) / 6, h);
    ctx.stroke();
  }
}

/** Boogvenster van glas-in-lood (gloeit van zichzelf), binnen tegen de achterwand van De Waag en buiten aan de gevel. */
function GlasInLood({ z, rot }: { z: number; rot: number }) {
  const tex = useTextuur(4.4, 3.4, tekenGlasInLood, 'w3-glasinlood', 90);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.75, roughness: 0.3 }), [tex]);
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.2, 0);
    s.lineTo(2.2, 0);
    s.lineTo(2.2, 2.2);
    s.absarc(0, 2.2, 2.2, 0, Math.PI, false);
    s.lineTo(-2.2, 0);
    const g = new THREE.ShapeGeometry(s, 16);
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 2.2) / 4.4, p.getY(i) / 4.4);
    return g;
  }, []);
  return (
    <group position={[0, 3.6, z]} rotation={[0, rot, 0]}>
      <Blok size={[4.8, 0.22, 0.14]} pos={[0, -0.1, -0.04]} color="#b9b2a6" r={0.02} />
      <mesh geometry={geo} material={m} />
    </group>
  );
}

// ── Vast decor ───────────────────────────────────────────────────────────

/** Lichtsnoerpalen aan de zuidkant van het plein (de snoeren hangen aan haken in de gevel). */
export const PALEN_ZUID: [number, number][] = [
  [-4.6, 19.4],
  [3.8, 19.5],
  [11.8, 19.4],
];
/** Haken in de voorgevel waar de lichtsnoeren aan hangen [x, y, z]. */
export const HAKEN_GEVEL: V3[] = [
  [-6.4, 3.85, 12.2],
  [0.2, 3.85, 12.2],
  [7.4, 3.85, 12.2],
  [12.6, 3.85, 12.2],
];
const TERRAS: [number, number][] = [
  [9.3, 15.1],
  [11.8, 17.5],
  [8.8, 18.9],
];
/** Lantaarns op de laadkade (met botsing). */
export const LANTAARNS_KADE: [number, number][] = [
  [13.55, -16.4],
  [20.7, -13.6],
  [13.55, -4.4],
];
const BOLDERS: [number, number][] = [
  [20.75, -15.4],
  [20.75, -8.8],
  [20.75, 1.0],
  [15.0, -17.75],
];
const EETTERRAS_W: [number, number][] = [
  [-10.6, -12.8],
  [-10.6, -16.4],
  [-7.9, -14.6],
];
const EETTERRAS_O: [number, number][] = [
  [10.6, -13.4],
  [10.6, -16.6],
  [7.9, -15.0],
];

/** Botsingen van al het decor (per verdieping). Stations, kluizen, poort, muren, rolhekken en trappen doet de motor. */
export function registreerDecor() {
  opLaag(0, () => {
    // hekken tussen de kramenstraat en de zijbeuken (de rolhekken bij het kruispad doet de motor)
    box(-6, 3.925, 0.16, 15.85);
    box(6, 3.925, 0.16, 15.85);
    // plein: eierkraam, terras, koffiekar, palen, fietsen
    box(6.2, 14.0, 2.9, 0.9);
    for (const [x, z] of TERRAS) cirkel(x, z, 0.95);
    box(12.35, 13.4, 0.8, 1.6);
    for (const [x, z] of PALEN_ZUID) cirkel(x, z, 0.2);
    box(-9.4, 19.35, 4.4, 1.5);
    cirkel(11.6, 13.6, 0.3);
    cirkel(9.3, 15.85, 0.3);
    cirkel(19.0, -5.6, 0.3);
    // kookschool: aanrecht en plant
    box(-11.2, 12.5, 3.2, 0.7);
    cirkel(-6.7, 16.35, 0.35);
    // kaashoek en bakkerij
    cirkel(-11.0, 5.0, 0.36);
    box(12.3, -4.8, 0.9, 0.9);
    // pakhuis: kaasrekken
    box(-12.575, -15.1, 0.55, 5.4);
    box(-11.35, -17.575, 1.9, 0.55);
    box(-7.6, -17.575, 2.0, 0.55);
    box(-6.425, -12.35, 0.55, 9.9);
    // vishal: koelvitrines
    box(8.7, -17.425, 4.6, 0.85);
    box(12.425, -15.0, 0.85, 2.4);
    box(12.425, -8.5, 0.85, 3.4);
    box(6.6, -11.5, 0.85, 6.0);
    // pilasters van de klokwand
    box(-4.25, -5.75, 0.48, 0.3);
    box(4.25, -5.75, 0.48, 0.3);
    // De Waag: planten bij de poort
    cirkel(-5.3, -17.2, 0.3);
    cirkel(5.3, -17.2, 0.3);
    // laadkade: bestelbus, kraan, pallet, vaten, bolders, lantaarns
    box(20.0, -2.45, 2.0, 4.8);
    box(KRAAN.voet[0], KRAAN.voet[1], 1.3, 1.3);
    box(20.2, -6.6, 1.3, 1.1);
    cirkel(14.0, -10.0, 0.5);
    for (const [x, z] of BOLDERS) cirkel(x, z, 0.24);
    for (const [x, z] of LANTAARNS_KADE) cirkel(x, z, 0.25);
  });
  opLaag(1, () => {
    for (const [x, z] of [...EETTERRAS_W, ...EETTERRAS_O]) box(x, z, 2.1, 0.9);
    box(0, 11.45, 1.9, 0.55);
    cirkel(-9.6, -15.4, 0.3);
  });
}

/** Vaste aankleding: wordt samengevoegd tot weinig tekenstappen. */
export function MarkthalDecor() {
  return (
    <>
      {/* ── De hal ── */}
      <GewelfSchildering />
      {LAMPEN.map(([x, y, z, boven, groot], i) => (
        <Hanglamp key={i} x={x} y={y} z={z} boven={boven} groot={groot} />
      ))}
      {/* hekken tussen de kramenstraat en de zijbeuken */}
      <Spijlenhek a={[-6, -4]} b={[-6, 11.85]} h={1.15} kleur={IJZER} />
      <Spijlenhek a={[6, -4]} b={[6, 11.85]} h={1.15} kleur={IJZER} />
      {/* zonenamen aan kettingen */}
      <HangBord pos={[0, 6.75, 6.0]} tekst="ZATERDAG GROTE MARKT" b={4.2} ketting={gewelfY(1.6) - 7.0} kleur="#7a2f22" fg="#f6dfa4" />
      <HangBord pos={[-9.5, 2.95, -3.4]} rot={Math.PI} tekst="KAASHOEK" b={2.2} ketting={0.5} kleur="#7a5a2a" fg="#fff4d8" />
      <HangBord pos={[9.5, 2.95, -3.4]} rot={Math.PI} tekst="BAKKERIJ & KOFFIE" b={2.8} ketting={0.5} kleur="#8a5a36" fg="#fff4dc" />
      <Bord pos={[-9.5, 2.9, -5.83]} tekst="KAASPAKHUIS" b={2.2} kleur="#5a4024" fg="#f2d58a" />
      <Bord pos={[9.5, 2.9, -5.83]} tekst="VISHAL" b={1.8} kleur="#2f6c70" fg="#e3f6f4" />
      <Bord pos={[0, 3.55, -5.83]} tekst="DE WAAG" b={3.0} kleur="#23443a" fg="#e9c46a" />
      {[-4.25, 4.25].map((x) => (
        <group key={x}>
          <Blok size={[0.4, 7.4, 0.16]} pos={[x, 3.7, -5.77]} color="#d9c49a" r={0.02} />
          <Blok size={[0.5, 0.3, 0.24]} pos={[x, 0.15, -5.74]} color="#8a7a62" r={0.02} />
          <Blok size={[0.5, 0.24, 0.24]} pos={[x, 7.42, -5.74]} color={GOUD} r={0.02} />
        </group>
      ))}
      <Blok size={[8.2, 0.22, 0.2]} pos={[0, 4.2, -5.76]} color="#d9c49a" r={0.02} />
      <Blok size={[8.2, 0.12, 0.26]} pos={[0, 7.0, -5.74]} color="#d9c49a" r={0.02} />
      <Bord pos={[0, 6.72, -5.62]} tekst="ANNO 1898" b={1.8} h={0.34} kleur="#23443a" fg="#e9c46a" />
      <Bord pos={[0, 3.55, -6.17]} rot={Math.PI} tekst="UITGANG · BRUG" b={3.0} kleur="#23443a" fg="#e9c46a" />
      <HangBord pos={[-9.5, HV + 3.0, 9.6]} tekst="OPEN KEUKEN" b={2.6} ketting={0.5} kleur="#2f6c70" fg="#e3f6f4" />
      <HangBord pos={[9.5, HV + 3.0, 9.6]} tekst="KAARTEN · VERF · IJZER" b={3.2} ketting={0.5} kleur="#3d5f8a" fg="#f4f8fd" />
      {/* buiten: namen aan de gevel */}
      <Bord pos={[0, 3.5, 12.18]} tekst="MARKTHAL" b={5.0} kleur="#7a2f22" fg="#f6dfa4" />
      <Bord pos={[-5.83, 3.35, 14.5]} rot={Math.PI / 2} tekst="KOOKSCHOOL" b={2.4} kleur="#3f6b4c" fg="#fff4d8" />
      <Bord pos={[13.18, 3.2, -12]} rot={Math.PI / 2} tekst="LAADKADE" b={2.4} kleur="#3b4250" fg="#ffd27a" />
      <GlasInLood z={-17.83} rot={0} />
      <GlasInLood z={-18.17} rot={Math.PI} />

      {/* ── Marktplein ── */}
      <group position={[6.2, 0, 14.0]}>
        <Kraam naam="EIEREN" luifel={['#e9b52f', '#fffaea']} waren={['#f6efe0', '#e9c79a', '#f6efe0', '#e9c79a']} />
      </group>
      {PALEN_ZUID.map((p, i) => (
        <Snoerpaal key={i} pos={p} />
      ))}
      {HAKEN_GEVEL.map(([x, y, z], i) => (
        <Blok key={i} size={[0.08, 0.08, 0.3]} pos={[x, y, z - 0.05]} color="#2f3634" r={0} />
      ))}
      {TERRAS.map(([x, z], i) => (
        <Cafetafel key={i} pos={[x, 0, z]} />
      ))}
      <Koffiekar pos={[12.35, 0, 13.4]} rot={-Math.PI / 2} />
      <Poppetje pos={[11.6, 0, 13.6]} rot={Math.PI / 2} shirt="#7a5132" broek="#2f3634" haar="pet" haarKleur="#2f3634" />
      <Poppetje pos={[9.3, 0, 15.85]} rot={Math.PI} shirt="#e86a9a" haar="krul" haarKleur="#3b2a20" huid="#8a5a3a" />
      <Poppetje pos={[6.0, 0, 13.55]} rot={0} shirt={KLEUR.groen} haar="staart" haarKleur="#2b2220" huid="#b07a52" />

      {/* ── Kookschool ── */}
      <Blok size={[3.2, 0.9, 0.62]} pos={[-11.2, 0.45, 12.5]} color="#dfe6e8" r={0.03} />
      <Blok size={[3.3, 0.05, 0.7]} pos={[-11.2, 0.92, 12.5]} color="#3f4a4c" r={0.01} />
      {[-12.2, -11.4, -10.6].map((x) => (
        <Cil key={x} r={0.14} h={0.16} pos={[x, 1.03, 12.5]} color="#9aa3a8" seg={12} />
      ))}
      <Schoolbord pos={[-8.0, 1.75, 12.2]} regels={['Recept voor 4 → 10', 'Wat je boven doet,', 'doe je ook onder!']} b={2.2} h={1.15} />
      <Plant pos={[-6.7, 0, 16.35]} soort={2} />

      {/* ── Kaashoek, bakkerij ── */}
      <Kaastoren pos={[-11.0, 0, 5.0]} />
      <Slinger van={[-12.82, -5.6]} naar={[-12.82, 11.6]} n={22} seed={1} y={3.35} />
      <Slinger van={[12.82, -5.6]} naar={[12.82, 11.6]} n={22} seed={3} y={3.35} />
      <Poppetje pos={[-11.85, 0, 2.0]} rot={Math.PI / 2} shirt="#f2d58a" broek="#3b4250" haar="kort" haarKleur="#6a4a2a" />
      <Poppetje pos={[11.85, 0, 1.6]} rot={-Math.PI / 2} shirt="#fbfaf6" broek="#3b4250" haar="kaal" huid="#8a5a3a" />
      {/* meelzakken bij de vishal */}
      {[
        [12.1, -5.0],
        [12.5, -4.6],
        [12.2, -4.5],
      ].map(([x, z], i) => (
        <Blok key={i} size={[0.42, 0.55, 0.32]} pos={[x, 0.28 + (i === 2 ? 0.5 : 0), z]} rot={[0, i * 0.4, 0]} color="#efe6d6" r={0.12} />
      ))}

      {/* ── Kaaspakhuis: rekken tot het plafond, de kluis ertussen ── */}
      <Kaasrek pos={[-12.575, 0, -15.1]} rot={Math.PI / 2} l={5.4} />
      <Kaasrek pos={[-11.35, 0, -17.575]} l={1.9} />
      <Kaasrek pos={[-7.6, 0, -17.575]} l={2.0} />
      <Kaasrek pos={[-6.425, 0, -14.9]} rot={-Math.PI / 2} l={4.8} />
      <Kaasrek pos={[-6.425, 0, -9.8]} rot={-Math.PI / 2} l={4.8} />

      {/* ── Vishal en koelcel ── */}
      <Koelvitrine pos={[8.7, 0, -17.425]} l={4.6} />
      <Koelvitrine pos={[12.425, 0, -15.0]} rot={-Math.PI / 2} l={2.4} />
      <Koelvitrine pos={[12.425, 0, -8.5]} rot={-Math.PI / 2} l={3.4} />
      <Koelvitrine pos={[6.6, 0, -11.5]} rot={Math.PI / 2} l={6.0} />
      <Strokengordijn />

      {/* ── De Waag ── */}
      <Kleed pos={[0, -11.6]} b={2.6} d={8.6} kleur="#7a2f22" rand={GOUD} />
      <Blok size={[2.6, 0.02, 2.6]} pos={[0, 0.011, -16.2]} color="#b08a4a" r={0} shadow={false} />
      <Plant pos={[-5.3, 0, -17.2]} soort={0} s={1.1} />
      <Plant pos={[5.3, 0, -17.2]} soort={0} s={1.1} />

      {/* ── Galerij (vloer 4 m) ── */}
      <group position={[0, HV, 0]}>
        {[...EETTERRAS_W, ...EETTERRAS_O].map(([x, z], i) => (
          <Bistrotafel key={i} pos={[x, 0, z]} rot={i % 2 ? 0.2 : -0.1} />
        ))}
        <Poppetje pos={[-9.6, 0, -15.4]} rot={0.4} shirt="#3d7cc9" haar="staart" haarKleur="#d9a441" />
        <Poppetje pos={[-11.85, 0, -4.8]} rot={Math.PI / 2} shirt="#fbfaf6" broek="#2f3634" haar="kort" haarKleur="#2b2220" />
        {/* bankje op het uitkijkbalkon */}
        <Blok size={[1.8, 0.08, 0.46]} pos={[0, 0.46, 11.45]} color="#7a5233" r={0.02} />
        <Blok size={[1.8, 0.42, 0.06]} pos={[0, 0.74, 11.68]} rot={[0.15, 0, 0]} color="#7a5233" r={0.02} />
        {[-0.75, 0.75].map((x) => (
          <Blok key={x} size={[0.07, 0.46, 0.44]} pos={[x, 0.23, 11.45]} color={IJZER} r={0.01} />
        ))}
        <Slinger van={[-12.82, -17]} naar={[-12.82, 11]} n={36} seed={2} y={3.65} />
        <Slinger van={[12.82, -17]} naar={[12.82, 11]} n={36} seed={4} y={3.65} />
      </group>

      {/* ── Laadkade ── */}
      <Bestelbus pos={[20.0, 0, -2.45]} rot={Math.PI / 2} />
      <Kraan />
      <Pallet pos={[20.2, 0, -6.6]} rot={0.1} />
      <Vat pos={[13.8, 0, -10.0]} kleur="#3f6b8a" />
      <Vat pos={[14.25, 0, -9.8]} kleur="#8a3f3a" />
      {BOLDERS.map((p, i) => (
        <Bolder key={i} pos={p} />
      ))}
      <Blok size={[0.3, 0.02, 20.0]} pos={[15.9, 0.012, -7.5]} color="#e2c044" r={0} shadow={false} />
      <Poppetje pos={[19.0, 0, -5.6]} rot={Math.PI / 2} shirt="#e48a3a" broek="#2f3634" haar="pet" haarKleur="#2f3634" />
    </>
  );
}

/** Strokengordijn van de koelcel (doorzichtige plastic stroken in de boog van de vishal). */
function Strokengordijn() {
  const tex = useTextuur(
    2,
    2.4,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const n = 9;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = 'rgba(200,232,240,0.55)';
        ctx.fillRect((i * w) / n + 2, 0, w / n - 4, h);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect((i * w) / n + 4, 0, 3, h);
      }
    },
    'w3-stroken',
    60,
  );
  return (
    <mesh position={[9.5, 1.2, -6.0]}>
      <planeGeometry args={[2, 2.4]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Levend: de klok, de reuzenweegschaal, de kraanhaak en het licht per fase ──

/** Tijd op de klok per fase (minuten na 17.00 uur): elke fase springt de klok verder, bij "klaar" is het zes uur. */
const KLOKTIJD: Record<Fase, number> = { terugblik: 30, doel: 35, instructie: 40, begeleid: 45, zelfstandig: 50, evaluatie: 55, klaar: 60 };

function tekenWijzerplaat(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = w / 2;
  ctx.fillStyle = '#c9a24a';
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbf3df';
  ctx.beginPath();
  ctx.arc(r, r, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f1c22';
  ctx.font = `600 ${r * 0.22}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.fillText(String(i), r + Math.sin(a) * r * 0.72, r - Math.cos(a) * r * 0.72);
  }
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const l = i % 5 ? 0.04 : 0.08;
    ctx.lineWidth = i % 5 ? 2 : 4;
    ctx.strokeStyle = '#1f1c22';
    ctx.beginPath();
    ctx.moveTo(r + Math.sin(a) * r * 0.86, r - Math.cos(a) * r * 0.86);
    ctx.lineTo(r + Math.sin(a) * r * (0.86 - l), r - Math.cos(a) * r * (0.86 - l));
    ctx.stroke();
  }
  ctx.font = `600 ${r * 0.1}px ${FONT}`;
  ctx.fillText('DE WAAG', r, r + r * 0.38);
}

/** Klok met twee wijzerplaten in de muur boven de klokpoort (naar de kramenstraat en naar De Waag). */
function Klok() {
  const tex = useTextuur(1.6, 1.6, tekenWijzerplaat, 'w3-klok', 220);
  const plaat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.35, roughness: 0.5 }), [tex]);
  const minuut = useRef(30);
  const wijzers = useRef<THREE.Group[]>([]);
  useFrame((_, dt) => {
    const doel = KLOKTIJD[useSpel.getState().fase] ?? 30;
    minuut.current += (doel - minuut.current) * Math.min(1, dt * 1.5);
    const m = minuut.current;
    for (const g of wijzers.current) {
      if (!g) continue;
      const kant = g.userData.kant as number;
      g.children[0].rotation.z = -kant * ((m / 60) * Math.PI * 2);
      g.children[1].rotation.z = -kant * (((5 + m / 60) / 12) * Math.PI * 2);
    }
  });
  return (
    <>
      <Statisch>
        {[1, -1].map((kant) => (
          <group key={kant} position={[0, 5.55, -6 + kant * 0.17]} rotation={[0, kant > 0 ? 0 : Math.PI, 0]}>
            <mesh material={plaat}>
              <circleGeometry args={[0.8, 40]} />
            </mesh>
            <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]} material={mat(GOUD, { metal: 0.5, rough: 0.35 })}>
              <cylinderGeometry args={[0.86, 0.86, 0.06, 40]} />
            </mesh>
          </group>
        ))}
      </Statisch>
      {[1, -1].map((kant, i) => (
        <group key={kant} position={[0, 5.55, -6 + kant * 0.17]} rotation={[0, kant > 0 ? 0 : Math.PI, 0]}>
          <group
            ref={(g) => {
              if (g) {
                g.userData.kant = 1;
                wijzers.current[i] = g;
              }
            }}
            position={[0, 0, 0.03]}
          >
            <group>
              <mesh position={[0, 0.28, 0]} material={mat('#1f1c22')}>
                <boxGeometry args={[0.035, 0.6, 0.02]} />
              </mesh>
            </group>
            <group>
              <mesh position={[0, 0.18, 0.01]} material={mat('#1f1c22')}>
                <boxGeometry args={[0.055, 0.4, 0.02]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </>
  );
}

/** Reuzenweegschaal onder de koepel van De Waag: wiegt zacht en komt in evenwicht als de poort opengaat. */
function Weegschaal() {
  const balk = useRef<THREE.Group>(null);
  const hoek = useRef(0.12);
  useFrame(({ clock }, dt) => {
    const klaar = useSpel.getState().fase === 'klaar';
    const doel = (klaar ? 0 : 0.11) + Math.sin(clock.getElapsedTime() * 0.7) * 0.015;
    hoek.current += (doel - hoek.current) * Math.min(1, dt * 1.2);
    if (balk.current) balk.current.rotation.z = hoek.current;
  });
  const touwen = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        const onder = new THREE.Vector3(Math.cos(a) * 0.55, -1.27, Math.sin(a) * 0.55);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), onder.clone().negate().normalize());
        return { mid: onder.clone().multiplyScalar(0.5), rot: new THREE.Euler().setFromQuaternion(q), l: onder.length() };
      }),
    [],
  );
  const schaal = (k: string) => (
    <>
      {touwen.map((t, i) => (
        <mesh key={i} position={t.mid} rotation={t.rot} material={mat('#3a2f22')}>
          <cylinderGeometry args={[0.012, 0.012, t.l, 4]} />
        </mesh>
      ))}
      <mesh position={[0, -1.05, 0]} material={mat(GOUD, { metal: 0.6, rough: 0.3 })} castShadow>
        <sphereGeometry args={[0.6, 20, 8, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38]} />
      </mesh>
      <Bol pos={[0, -1.12, 0]} r={0.18} kleur={k} />
    </>
  );
  return (
    <group position={[0, 5.4, -12]}>
      {/* ketting naar de koepel en de spil */}
      <Statisch>
        <Cil r={0.03} h={2.6} pos={[0, 1.5, 0]} color="#3a2f22" seg={6} />
        <Blok size={[0.24, 0.5, 0.24]} pos={[0, 0.1, 0]} color={IJZER} r={0.04} />
      </Statisch>
      <group ref={balk}>
        <Statisch>
          <Blok size={[4.8, 0.14, 0.14]} color={IJZER} r={0.03} />
          <Blok size={[0.06, 0.5, 0.04]} pos={[0, 0.3, 0.09]} color={GOUD} r={0.01} />
          <group position={[-2.3, 0, 0]}>{schaal('#f2c24a')}</group>
          <group position={[2.3, 0, 0]}>{schaal('#e5675a')}</group>
        </Statisch>
      </group>
    </group>
  );
}

/** Kraanhaak aan de punt van de havenkraan: wiegt met een krat eraan. */
function Kraanhaak() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = Math.sin(t * 0.8) * 0.05;
      ref.current.rotation.x = Math.sin(t * 0.6 + 1) * 0.03;
    }
  });
  const [x, y, z] = KRAAN.punt;
  return (
    <group position={[x, y + 0.55, z]}>
      <group ref={ref}>
        <Statisch>
          <Cil r={0.015} h={2.4} pos={[0, -1.2, 0]} color="#2f3634" seg={4} />
          <mesh position={[0, -2.5, 0]} rotation={[0, 0, Math.PI]} material={mat('#e2c044')}>
            <torusGeometry args={[0.1, 0.03, 6, 12, Math.PI * 1.4]} />
          </mesh>
          {[-1, 1].map((s) => (
            <Cil key={s} r={0.01} h={0.7} pos={[s * 0.25, -2.85, 0]} rot={[0, 0, -s * 0.36]} color="#2f3634" seg={3} />
          ))}
          <Blok size={[1.0, 0.6, 0.8]} pos={[0, -3.45, 0]} color="#c99a62" r={0.04} />
          <Blok size={[1.04, 0.08, 0.84]} pos={[0, -3.2, 0]} color="#a8844e" r={0.01} />
        </Statisch>
      </group>
    </group>
  );
}

/** Licht per fase: van gouden middag (17.30) via zonsondergang naar het blauwe uur (18.00). Alleen de kleuren; de motor doet de sterkte. */
const ZON_PER_FASE: Record<Fase, [string, string, number]> = {
  terugblik: ['#ffb877', '#ffd8b4', 1.4],
  doel: ['#ffb877', '#ffd8b4', 1.4],
  instructie: ['#ffb070', '#ffd4ae', 1.4],
  begeleid: ['#ffa866', '#ffcfa6', 1.5],
  zelfstandig: ['#ff9a5e', '#ffc69c', 1.6],
  evaluatie: ['#f28068', '#efb0a8', 2.0],
  klaar: ['#8f86c8', '#a9b2e0', 2.4],
};
function AvondLicht() {
  const scene = useThree((s) => s.scene);
  const lichten = useRef<{ zon?: THREE.DirectionalLight; hemel?: THREE.HemisphereLight; zonOud?: THREE.Color; hemelOud?: THREE.Color }>({});
  useEffect(() => {
    const l = lichten.current;
    return () => {
      // terugzetten als je de wereld verlaat
      if (l.zon && l.zonOud) l.zon.color.copy(l.zonOud);
      if (l.hemel && l.hemelOud) l.hemel.color.copy(l.hemelOud);
      lampGloed.emissiveIntensity = 1.4;
    };
  }, []);
  const doelZon = useMemo(() => new THREE.Color(), []);
  const doelHemel = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const l = lichten.current;
    if (!l.zon || !l.hemel) {
      scene.traverse((o) => {
        if (!l.zon && (o as THREE.DirectionalLight).isDirectionalLight && (o as THREE.DirectionalLight).castShadow) {
          l.zon = o as THREE.DirectionalLight;
          l.zonOud = l.zon.color.clone();
        }
        if (!l.hemel && (o as THREE.HemisphereLight).isHemisphereLight) {
          l.hemel = o as THREE.HemisphereLight;
          l.hemelOud = l.hemel.color.clone();
        }
      });
      if (!l.zon || !l.hemel) return;
    }
    const [z, h, gloed] = ZON_PER_FASE[useSpel.getState().fase] ?? ZON_PER_FASE.terugblik;
    const k = Math.min(1, dt * 0.6);
    l.zon.color.lerp(doelZon.set(z), k);
    l.hemel.color.lerp(doelHemel.set(h), k);
    lampGloed.emissiveIntensity += (gloed - lampGloed.emissiveIntensity) * k;
  });
  return null;
}

/** Bewegend decor. */
export function MarkthalLevend() {
  return (
    <group>
      <Klok />
      <Weegschaal />
      <Kraanhaak />
      <AvondLicht />
      {/* easter egg: een affiche van Frank uit het Spookkasteel, naast de krantenkiosk op de galerij */}
      <FrankPoster pos={[12.83, HV + 1.75, 10.3]} rot={-Math.PI / 2} b={0.5} tekst="Spookkasteel" />
    </group>
  );
}
