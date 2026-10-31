// Meubels en aankleding voor de kamers (poppenhuis-stijl). Alles staat met de achterkant naar −z,
// dus "tegen een achtermuur" = rotatie 0. Draai met rot om tegen een zijmuur te zetten.
import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Blok, Cil, mat, seeded } from './kit';
import { boomMateriaal, boomVorm } from './vormen';
import { FONT, useTextuur } from './tekst';

type V3 = [number, number, number];
interface P {
  pos: V3;
  rot?: number;
}

/** Eén boek (1 × 1 × 1, met een zachte rug), geschaald naar de maat van elk boek. */
const BOEK = new RoundedBoxGeometry(1, 1, 1, 1, 0.12);
const STREEP = new THREE.BoxGeometry(1, 1, 1);
const BOEK_KLEUREN = ['#8f3c36', '#2f5d7c', '#c9a25a', '#3f6b4c', '#6b4a7a', '#d7c7a0', '#a4552c', '#24413a'];

/** Boekenkast met planken vol boeken (één canvas per plank zou ook kunnen; dit blijft licht). */
export function Boekenkast({ pos, rot = 0, b = 2.2, h = 2.4, seed = 1 }: P & { b?: number; h?: number; seed?: number }) {
  const r = useMemo(() => seeded(seed * 13 + 5), [seed]);
  const planken = 4;
  const boeken = useMemo(() => {
    const uit: { x: number; y: number; w: number; hh: number; k: string; schuin: number }[] = [];
    for (let p = 0; p < planken; p++) {
      let x = -b / 2 + 0.12;
      while (x < b / 2 - 0.2) {
        const w = 0.07 + r() * 0.07;
        const hh = 0.3 + r() * 0.16;
        if (r() > 0.88) x += 0.12;
        else uit.push({ x: x + w / 2, y: 0.12 + p * (h - 0.2) / planken, w, hh, k: BOEK_KLEUREN[Math.floor(r() * BOEK_KLEUREN.length)], schuin: r() > 0.93 ? 0.25 : 0 });
        x += w + 0.01;
      }
    }
    return uit;
  }, [b, h, r]);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {/* open kast: zijkanten, boven- en onderkant en een donkere achterwand, zodat je de boeken ziet */}
      {[-1, 1].map((k) => (
        <Blok key={k} size={[0.07, h, 0.45]} pos={[k * (b / 2 - 0.035), h / 2, 0]} color="#5a3a24" r={0.02} />
      ))}
      <Blok size={[b, 0.08, 0.47]} pos={[0, h - 0.04, 0]} color="#5a3a24" r={0.02} />
      {/* kroonlijst bovenop en een plint onderaan */}
      <Blok size={[b + 0.1, 0.05, 0.53]} pos={[0, h + 0.025, 0.02]} color="#4a2f1e" r={0.018} />
      <Blok size={[b + 0.04, 0.035, 0.5]} pos={[0, h - 0.085, 0.01]} color="#4a2f1e" r={0.012} shadow={false} />
      <Blok size={[b + 0.04, 0.12, 0.49]} pos={[0, 0.06, 0.01]} color="#4a2f1e" r={0.015} shadow={false} />
      <Blok size={[b - 0.1, 0.1, 0.45]} pos={[0, 0.05, 0]} color="#5a3a24" r={0.01} shadow={false} />
      <Blok size={[b - 0.1, h - 0.1, 0.04]} pos={[0, h / 2, -0.2]} color="#3e271a" r={0.01} shadow={false} />
      {Array.from({ length: planken }, (_, p) => (
        <Blok key={p} size={[b - 0.08, 0.05, 0.42]} pos={[0, 0.08 + p * (h - 0.2) / planken, 0.01]} color="#6b4630" r={0.01} shadow={false} />
      ))}
      {/* boeken met een afgeronde rug, en bij sommige twee gouden streepjes op de rug */}
      {boeken.map((bk, i) => (
        <group key={i} position={[bk.x, bk.y + bk.hh / 2, 0.02]} rotation={[0, 0, bk.schuin]}>
          <mesh geometry={BOEK} scale={[bk.w, bk.hh, 0.3]} material={mat(bk.k, { rough: 0.7 })} />
          {i % 3 !== 1 &&
            [-0.32, 0.3].map((t) => (
              <mesh key={t} geometry={STREEP} position={[0, bk.hh * t, 0.151]} scale={[bk.w * 0.9, 0.012, 0.004]} material={mat('#d8b768', { rough: 0.35, metal: 0.6 })} />
            ))}
        </group>
      ))}
    </group>
  );
}

export function Plant({ pos, s = 1, soort = 0 }: { pos: V3; s?: number; soort?: number }) {
  return (
    <group position={pos} scale={s}>
      <Cil r={0.24} rTop={0.3} h={0.5} pos={[0, 0.25, 0]} color={['#b4643c', '#d9d0c2', '#3d4a52'][soort % 3]} seg={12} />
      <Cil r={0.27} h={0.04} pos={[0, 0.5, 0]} color="#3b2a1f" seg={12} />
      {/* een volle, bobbelige plant (zelfde vorm als de struiken buiten) */}
      <mesh geometry={boomVorm('struik', ['#4f8a43', '#3f7536', '#5a9446'][soort % 3], true, false, soort % 3)} material={boomMateriaal} position={[0, 0.5, 0]} scale={[0.62, 0.95, 0.62]} castShadow receiveShadow />
    </group>
  );
}

export function Fauteuil({ pos, rot = 0, kleur = '#c9a27a' }: P & { kleur?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.1, 0.42, 0.95]} pos={[0, 0.3, 0.05]} color={kleur} r={0.14} />
      <Blok size={[1.1, 0.75, 0.25]} pos={[0, 0.72, -0.35]} color={kleur} r={0.12} />
      <Blok size={[0.22, 0.55, 0.95]} pos={[-0.5, 0.55, 0.05]} color={kleur} r={0.1} />
      <Blok size={[0.22, 0.55, 0.95]} pos={[0.5, 0.55, 0.05]} color={kleur} r={0.1} />
      {[-0.4, 0.4].map((x) => [-0.3, 0.4].map((z) => <Cil key={`${x}${z}`} r={0.04} h={0.12} pos={[x, 0.06, z]} color="#3b2a1f" seg={6} />))}
    </group>
  );
}

export function Krat({ pos, rot = 0, s = 1 }: P & { s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <Blok size={[0.8, 0.6, 0.6]} pos={[0, 0.3, 0]} color="#b98a55" r={0.03} />
      {[-0.31, 0.31].map((z) => (
        <Blok key={z} size={[0.82, 0.1, 0.03]} pos={[0, 0.45, z]} color="#8d6438" r={0.01} shadow={false} />
      ))}
      {[-0.31, 0.31].map((z) => (
        <Blok key={`b${z}`} size={[0.82, 0.1, 0.03]} pos={[0, 0.15, z]} color="#8d6438" r={0.01} shadow={false} />
      ))}
    </group>
  );
}

/** Ingelijst schilderij aan de muur, met een eigen geschilderd motief. */
export function Schilderij({ pos, rot = 0, b = 1.1, h = 0.8, motief = 0 }: P & { b?: number; h?: number; motief?: number }) {
  const tex = useTextuur(
    b,
    h,
    (ctx, w, hh) => {
      const kleuren = [
        ['#e8b86b', '#c4673f', '#3f6b4c'],
        ['#9fc4d8', '#355c7d', '#f2e2b8'],
        ['#e6cfa0', '#8f3c36', '#2f4a3a'],
        ['#f0d39a', '#5b7f9a', '#a4552c'],
      ][motief % 4];
      const g = ctx.createLinearGradient(0, 0, 0, hh);
      g.addColorStop(0, kleuren[1]);
      g.addColorStop(1, kleuren[0]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = kleuren[2];
      ctx.beginPath();
      if (motief % 2) {
        ctx.moveTo(0, hh);
        ctx.lineTo(w * 0.35, hh * 0.45);
        ctx.lineTo(w * 0.6, hh * 0.7);
        ctx.lineTo(w * 0.8, hh * 0.35);
        ctx.lineTo(w, hh);
      } else {
        ctx.arc(w * 0.68, hh * 0.38, hh * 0.16, 0, Math.PI * 2);
        ctx.moveTo(0, hh * 0.8);
        ctx.fillRect(0, hh * 0.72, w, hh * 0.28);
      }
      ctx.fill();
    },
    `schilderij-${motief}-${b}-${h}`,
    120,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.16, h + 0.16, 0.06]} color="#a07a3c" r={0.02} shadow={false} />
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[b, h]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Krijtbord met tekst (regels). */
export function Schoolbord({ pos, rot = 0, regels, b = 3, h = 1.5 }: P & { regels: string[]; b?: number; h?: number }) {
  const tex = useTextuur(
    b,
    h,
    (ctx, w, hh) => {
      ctx.fillStyle = '#2d3f35';
      ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * w, Math.random() * hh, 30, 3);
      ctx.fillStyle = '#f2efe6';
      ctx.font = `600 ${hh * 0.15}px ${FONT}`;
      ctx.textBaseline = 'top';
      regels.forEach((r, i) => ctx.fillText(r, w * 0.06, hh * 0.1 + i * hh * 0.22));
    },
    `bord-${regels.join('|')}`,
    100,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.2, h + 0.2, 0.08]} color="#6b4630" r={0.02} shadow={false} />
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[b, h]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      <Blok size={[b, 0.06, 0.16]} pos={[0, -h / 2 - 0.08, 0.08]} color="#6b4630" r={0.01} shadow={false} />
    </group>
  );
}

export function Wandplank({ pos, rot = 0, b = 1.6, spullen = 4, seed = 2 }: P & { b?: number; spullen?: number; seed?: number }) {
  const r = useMemo(() => seeded(seed * 7 + 1), [seed]);
  const items = useMemo(() => Array.from({ length: spullen }, (_, i) => ({ x: -b / 2 + 0.2 + (i * (b - 0.4)) / Math.max(1, spullen - 1), soort: Math.floor(r() * 3), k: BOEK_KLEUREN[Math.floor(r() * 8)] })), [b, spullen, r]);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.05, 0.3]} pos={[0, 0, 0.15]} color="#6b4630" r={0.01} />
      {items.map((it, i) =>
        it.soort === 0 ? (
          <Cil key={i} r={0.09} h={0.26} pos={[it.x, 0.15, 0.15]} color={it.k} seg={10} />
        ) : it.soort === 1 ? (
          <Blok key={i} size={[0.22, 0.18, 0.2]} pos={[it.x, 0.115, 0.15]} color={it.k} r={0.02} />
        ) : (
          <mesh key={i} position={[it.x, 0.12, 0.15]} material={mat(it.k)}>
            <sphereGeometry args={[0.1, 10, 8]} />
          </mesh>
        ),
      )}
    </group>
  );
}

export function Bank({ pos, rot = 0, b = 1.8, kleur = '#7a5233' }: P & { b?: number; kleur?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.1, 0.5]} pos={[0, 0.45, 0]} color={kleur} r={0.03} />
      <Blok size={[b, 0.5, 0.08]} pos={[0, 0.75, -0.22]} color={kleur} r={0.03} />
      {[-b / 2 + 0.12, b / 2 - 0.12].map((x) => (
        <Blok key={x} size={[0.08, 0.45, 0.45]} pos={[x, 0.225, 0]} color="#3b2a1f" r={0.02} />
      ))}
    </group>
  );
}

export function Ezel({ pos, rot = 0 }: P) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.06, 1.8, 0.06]} pos={[-0.35, 0.9, 0]} rot={[0, 0, 0.12]} color="#8a5a34" r={0.01} />
      <Blok size={[0.06, 1.8, 0.06]} pos={[0.35, 0.9, 0]} rot={[0, 0, -0.12]} color="#8a5a34" r={0.01} />
      <Blok size={[0.06, 1.7, 0.06]} pos={[0, 0.85, -0.35]} rot={[0.25, 0, 0]} color="#8a5a34" r={0.01} />
      <Blok size={[0.9, 0.7, 0.04]} pos={[0, 1.25, 0.04]} color="#f4ead6" r={0.01} />
      <Blok size={[0.5, 0.25, 0.02]} pos={[-0.1, 1.3, 0.07]} color="#c4673f" r={0.01} shadow={false} />
      <Blok size={[0.9, 0.05, 0.12]} pos={[0, 0.88, 0.06]} color="#8a5a34" r={0.01} />
    </group>
  );
}

export function Vat({ pos, kleur = '#3f6b8a' }: { pos: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Cil r={0.32} h={0.9} pos={[0, 0.45, 0]} color={kleur} seg={14} />
      {[0.15, 0.75].map((y) => (
        <Cil key={y} r={0.335} h={0.05} pos={[0, y, 0]} color="#2a3a44" seg={14} />
      ))}
    </group>
  );
}

/** Buizen langs de muur (waterlab, machinekamer). */
export function Buizen({ pos, rot = 0, b = 3 }: P & { b?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[1.9, 2.3].map((y, i) => (
        <Cil key={y} r={0.07} h={b} pos={[0, y, 0.12]} rot={[0, 0, Math.PI / 2]} color={i ? '#b87333' : '#8d9295'} seg={10} />
      ))}
      {[-b / 2 + 0.3, b / 2 - 0.3].map((x) => (
        <Cil key={x} r={0.07} h={1.9} pos={[x, 0.95, 0.12]} color="#8d9295" seg={10} />
      ))}
      <Cil r={0.16} h={0.06} pos={[0, 1.9, 0.22]} rot={[Math.PI / 2, 0, 0]} color="#c0392b" seg={14} />
    </group>
  );
}

/** Grote ingelijste tekst aan de muur (naambord van een kamer of het bedrijf). */
export function Naambord({ pos, rot = 0, tekst, b = 2.4, kleur = '#2f2016', fg = '#e9d29a' }: P & { tekst: string; b?: number; kleur?: string; fg?: string }) {
  const tex = useTextuur(
    b,
    0.5,
    (ctx, w, h) => {
      ctx.fillStyle = kleur;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = fg;
      ctx.font = `700 ${h * 0.46}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tekst, w / 2, h / 2 + 2);
    },
    `naambord-${tekst}-${b}`,
    160,
  );
  return (
    <mesh position={pos} rotation={[0, rot, 0]}>
      <planeGeometry args={[b, 0.5]} />
      <meshStandardMaterial map={tex} roughness={0.7} />
    </mesh>
  );
}
