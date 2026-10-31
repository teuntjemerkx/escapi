// Wereld 4 – bouwstenen voor de stad rond het winkelcentrum ('s avonds):
// palmen in bakken, terrastafels, auto's, een slagboom, billboards, de reclamezuil, neonborden en flatgebouwen.
// Alles is vast (geen useFrame), dus het kan samengevoegd worden in Decor of <Statisch>.
import { useMemo } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { FONT } from '../game/tekst';
import { Doek, pasFont, tekstRegel, type V3 } from './winkels';

// ─────────────────────────── Groen en terras ───────────────────────────

/** Palm in een betonnen bak. */
export function Palm({ pos, s = 1, rot = 0 }: { pos: V3; s?: number; rot?: number }) {
  const bladen = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2 + rot, val: 0.55 + (i % 3) * 0.12 })), [rot]);
  const stam: V3[] = [
    [0, 0.9, 0],
    [0.06, 1.65, 0.02],
    [0.14, 2.4, 0.04],
    [0.24, 3.1, 0.06],
  ];
  return (
    <group position={pos} scale={s}>
      <Cil r={0.48} rTop={0.52} h={0.55} pos={[0, 0.275, 0]} color="#8d8a86" seg={10} />
      <Cil r={0.44} h={0.04} pos={[0, 0.55, 0]} color="#3b2a1f" seg={10} />
      {stam.map((p, i) => (
        <Cil key={i} r={0.15 - i * 0.015} rTop={0.13 - i * 0.015} h={0.8} pos={p} rot={[0, 0, -0.08]} color={i % 2 ? '#8a6a48' : '#7a5c3e'} seg={7} />
      ))}
      <group position={[0.28, 3.5, 0.07]}>
        {bladen.map((b, i) => (
          <group key={i} rotation={[0, b.a, 0]}>
            <Blok size={[0.34, 0.04, 1.6]} pos={[0, -0.32, 0.72]} rot={[b.val, 0, 0]} color={i % 2 ? '#3f8a3a' : '#4f9a42'} r={0} />
          </group>
        ))}
        {[0.15, -0.15].map((x) => (
          <mesh key={x} position={[x, -0.15, 0.08]} material={mat('#5a3e22')}>
            <sphereGeometry args={[0.1, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Bolboom in een ronde bak. */
export function Bolboom({ pos, s = 1 }: { pos: V3; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <Cil r={0.5} rTop={0.55} h={0.5} pos={[0, 0.25, 0]} color="#5d6066" seg={12} />
      <Cil r={0.07} rTop={0.06} h={1.4} pos={[0, 1.1, 0]} color="#6a4b33" seg={7} />
      <mesh position={[0, 2.1, 0]} castShadow material={mat('#4a7d3a', { flat: true })}>
        <icosahedronGeometry args={[0.75, 1]} />
      </mesh>
    </group>
  );
}

/** Ronde terrastafel met twee stoelen en een parasol. */
export function Terrastafel({ pos, rot = 0, kleur }: { pos: V3; rot?: number; kleur: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Cil r={0.42} h={0.04} pos={[0, 0.74, 0]} color="#ece6da" seg={16} />
      <Cil r={0.04} h={0.72} pos={[0, 0.37, 0]} color="#2f3634" seg={8} />
      <Cil r={0.22} h={0.03} pos={[0, 0.015, 0]} color="#2f3634" seg={10} />
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.68, 0, 0]} rotation={[0, (k * Math.PI) / 2, 0]}>
          <Blok size={[0.42, 0.05, 0.42]} pos={[0, 0.45, 0]} color="#3b3a39" r={0.02} />
          <Blok size={[0.42, 0.45, 0.05]} pos={[0, 0.7, -0.2]} color="#3b3a39" r={0.02} />
          {[-0.17, 0.17].map((x) => (
            <Blok key={x} size={[0.04, 0.45, 0.04]} pos={[x, 0.22, 0.17]} color="#2f3634" r={0} />
          ))}
        </group>
      ))}
      <Cil r={0.025} h={2.4} pos={[0, 1.2, 0]} color="#e9e3d7" seg={6} />
      <mesh position={[0, 2.35, 0]} castShadow material={mat(kleur, { flat: true })}>
        <coneGeometry args={[1.15, 0.45, 8]} />
      </mesh>
    </group>
  );
}

/** Dunne paal met een lampje bovenop (houdt lichtsnoeren vast). */
export function Paal({ pos, h = 4 }: { pos: V3; h?: number }) {
  return (
    <group position={pos}>
      <Cil r={0.12} h={0.25} pos={[0, 0.125, 0]} color="#2f3634" seg={8} />
      <Cil r={0.05} h={h} pos={[0, h / 2, 0]} color="#2f3634" seg={8} />
      <mesh position={[0, h + 0.05, 0]} material={mat('#ffe2a8', { emissive: '#ffcf6a' })}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </mesh>
    </group>
  );
}

// ─────────────────────────── Verkeer ───────────────────────────

export const AUTO_KLEUREN = ['#c0392b', '#2f6f8f', '#e9e3d7', '#3b3a39', '#f2c230', '#6b8f3f', '#8b6bb5', '#9aa3a8', '#e48a3a', '#1d3a6b'];

/** Auto (lengte langs z, voorkant naar +z). */
export function Auto({ pos, rot = 0, kleur }: { pos: V3; rot?: number; kleur: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.75, 0.55, 3.9]} pos={[0, 0.5, 0]} color={kleur} r={0.18} />
      <Blok size={[1.55, 0.5, 2.0]} pos={[0, 0.98, -0.2]} color="#2a3138" r={0.16} rough={0.25} />
      <Blok size={[1.5, 0.08, 1.8]} pos={[0, 1.24, -0.2]} color={kleur} r={0.04} />
      {[-0.82, 0.82].map((x) =>
        [-1.25, 1.25].map((z) => <Cil key={`${x}${z}`} r={0.33} h={0.24} pos={[x, 0.33, z]} rot={[0, 0, Math.PI / 2]} color="#1b1b1b" seg={10} />),
      )}
      {[-0.55, 0.55].map((x) => (
        <group key={x}>
          <Blok size={[0.36, 0.12, 0.05]} pos={[x, 0.6, 1.96]} color="#fff6d0" r={0.02} />
          <Blok size={[0.36, 0.1, 0.05]} pos={[x, 0.62, -1.96]} color="#d02b20" r={0.02} />
        </group>
      ))}
    </group>
  );
}

/** Slagboom met kaartjesautomaat (arm langs x, dicht). */
export function Slagboom({ pos, rot = 0, lengte = 5 }: { pos: V3; rot?: number; lengte?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.5, 1.1, 0.5]} pos={[0, 0.55, 0]} color="#e9e3d7" r={0.05} />
      <Blok size={[0.56, 0.12, 0.56]} pos={[0, 1.12, 0]} color="#c0392b" r={0.04} />
      {Array.from({ length: Math.round(lengte / 0.5) }, (_, i) => (
        <Blok key={i} size={[0.5, 0.12, 0.1]} pos={[0.5 + i * 0.5, 1.0, 0]} color={i % 2 ? '#fbfaf6' : '#d02b20'} r={0} />
      ))}
      <group position={[-0.9, 0, 0.2]}>
        <Blok size={[0.45, 1.3, 0.35]} pos={[0, 0.65, 0]} color="#3d6fb8" r={0.05} />
        <Blok size={[0.3, 0.2, 0.04]} pos={[0, 1.0, 0.18]} color="#9fd0de" r={0.01} />
        <Blok size={[0.12, 0.04, 0.04]} pos={[0, 0.72, 0.18]} color="#1b1b1b" r={0} />
      </group>
    </group>
  );
}

// ─────────────────────────── Licht en reclame ───────────────────────────

/** Gloeiend neonbord (doorzichtig canvas). `kleur` = neonkleur. */
export function Neon({ tekst, b, h, pos, rot, kleur = '#ff4fa3', rand = true }: { tekst: string[]; b: number; h: number; pos?: V3; rot?: V3; kleur?: string; rand?: boolean }) {
  return (
    <Doek
      b={b}
      h={h}
      pos={pos}
      rot={rot}
      sleutel={`neon-${tekst.join('|')}-${b}-${h}-${kleur}-${rand}`}
      licht
      transparant
      teken={(ctx, w, hh) => {
        ctx.clearRect(0, 0, w, hh);
        ctx.shadowColor = kleur;
        ctx.shadowBlur = Math.min(w, hh) * 0.08;
        if (rand) {
          ctx.strokeStyle = kleur;
          ctx.lineWidth = Math.min(w, hh) * 0.035;
          const m = ctx.lineWidth * 2;
          ctx.beginPath();
          ctx.roundRect(m, m, w - 2 * m, hh - 2 * m, Math.min(w, hh) * 0.12);
          ctx.stroke();
        }
        const n = tekst.length;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        tekst.forEach((t, i) => {
          pasFont(ctx, t, (hh / n) * 0.62, w * 0.84, 700);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = kleur;
          ctx.lineWidth = 6;
          ctx.strokeText(t, w / 2, (hh / n) * (i + 0.52));
          ctx.fillText(t, w / 2, (hh / n) * (i + 0.52));
        });
        ctx.shadowBlur = 0;
      }}
    />
  );
}

/** Groot billboard op twee palen, met een verlichte reclame (geen getallen van opdrachten). */
export function Billboard({ pos, rot = 0, b = 7, h = 3.4, hoogte = 4.6, motief }: { pos: V3; rot?: number; b?: number; h?: number; hoogte?: number; motief: 'uitverkoop' | 'sale' | 'kortingsdag' }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-b * 0.3, b * 0.3].map((x) => (
        <Blok key={x} size={[0.3, hoogte, 0.3]} pos={[x, hoogte / 2, -0.2]} color="#2f3634" r={0.04} />
      ))}
      <Blok size={[b + 0.3, h + 0.3, 0.25]} pos={[0, hoogte + h / 2, -0.15]} color="#1d1f24" r={0.05} />
      <Blok size={[b + 0.4, 0.1, 0.6]} pos={[0, hoogte - 0.1, 0.1]} color="#3b3f46" r={0} />
      <Doek
        b={b}
        h={h}
        pos={[0, hoogte + h / 2, 0]}
        sleutel={`billboard-${motief}-${b}-${h}`}
        licht
        ppm={180}
        teken={(ctx, w, hh) => {
          const g = ctx.createLinearGradient(0, 0, w, hh);
          if (motief === 'uitverkoop') {
            g.addColorStop(0, '#ff2f7d');
            g.addColorStop(1, '#7a2bd6');
          } else if (motief === 'sale') {
            g.addColorStop(0, '#11c9d9');
            g.addColorStop(1, '#1d3a8f');
          } else {
            g.addColorStop(0, '#ffb02e');
            g.addColorStop(1, '#e8462e');
          }
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, hh);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc((w * ((i * 37) % 100)) / 100, (hh * ((i * 61) % 100)) / 100, hh * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          const regels = motief === 'uitverkoop' ? ['UITVERKOOP', 'tot −50%'] : motief === 'sale' ? ['SALE', '−40%'] : ['KORTINGSDAG', 'zaterdag in De Promenade'];
          tekstRegel(ctx, regels[0], w / 2, hh * 0.36, Math.min(hh * 0.34, w * 0.13), '#ffffff', 700, 'center');
          ctx.font = `700 ${hh * 0.2}px ${FONT}`;
          tekstRegel(ctx, regels[1], w / 2, hh * 0.72, Math.min(hh * 0.24, w * 0.08), '#fff3a0', 700, 'center');
        }}
      />
    </group>
  );
}

/** Reclamezuil met de naam van het winkelcentrum in neon. */
export function Reclamezuil({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[2.2, 0.3, 1.4]} pos={[0, 0.15, 0]} color="#3b3f46" r={0.05} />
      <Blok size={[1.6, 7.2, 0.8]} pos={[0, 3.75, 0]} color="#1d1f24" r={0.12} />
      <Blok size={[1.9, 0.3, 1.0]} pos={[0, 7.45, 0]} color="#2a2d33" r={0.06} />
      {[1, -1].map((kant) => (
        <group key={kant} rotation={[0, kant > 0 ? 0 : Math.PI, 0]}>
          <Neon tekst={['DE', 'PRO', 'ME', 'NA', 'DE']} b={1.3} h={4.6} pos={[0, 4.75, 0.41]} kleur="#ff4fa3" rand={false} />
          <Neon tekst={['Kortingsdag']} b={1.4} h={0.5} pos={[0, 1.95, 0.41]} kleur="#2ee6ff" />
          <Neon tekst={['zaterdag']} b={1.2} h={0.4} pos={[0, 1.45, 0.41]} kleur="#ffe14d" rand={false} />
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────── Flatgebouwen (achtergrond) ───────────────────────────

let ramenTex: THREE.CanvasTexture | null = null;
/** Gedeelde textuur met ramen (sommige aan, sommige uit): 4 m breed en 3 m hoog per tegel. */
function ramenTextuur() {
  if (ramenTex) return ramenTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#3a3346';
  ctx.fillRect(0, 0, 256, 192);
  let s = 7;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 3; x++) {
      const aan = r() < 0.55;
      ctx.fillStyle = aan ? (r() < 0.25 ? '#9fe8ff' : '#ffd88a') : '#1c1a26';
      ctx.fillRect(14 + x * 82, 24 + y * 96, 64, 60);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(14 + x * 82 + 30, 24 + y * 96, 4, 60);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  ramenTex = t;
  return t;
}

let gevelMat: THREE.MeshStandardMaterial | null = null;
function gevelMateriaal() {
  if (!gevelMat) {
    const t = ramenTextuur();
    gevelMat = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.55, roughness: 0.85 });
  }
  return gevelMat;
}

/** Doos waarvan de uv's met de echte maat meeschalen, zodat de ramen overal even groot zijn. */
function gevelGeo(b: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(b, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  // volgorde van de vlakken in BoxGeometry: +x, −x, +y, −y, +z, −z (elk 4 hoeken)
  const maten: [number, number][] = [
    [d, h],
    [d, h],
    [0, 0],
    [0, 0],
    [b, h],
    [b, h],
  ];
  for (let f = 0; f < 6; f++)
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * (maten[f][0] / 4), uv.getY(k) * (maten[f][1] / 3));
    }
  uv.needsUpdate = true;
  return g;
}

/** Flatgebouw met verlichte ramen, een dak en soms een lichtreclame. */
export function Flat({ pos, b, h, d, dak = '#2a2730', reclame, kleur = '#ff4fa3' }: { pos: V3; b: number; h: number; d: number; dak?: string; reclame?: string; kleur?: string }) {
  const geo = useMemo(() => gevelGeo(b, h, d), [b, h, d]);
  return (
    <group position={pos}>
      <mesh geometry={geo} position={[0, h / 2, 0]} material={gevelMateriaal()} castShadow receiveShadow />
      <Blok size={[b + 0.3, 0.4, d + 0.3]} pos={[0, h + 0.2, 0]} color={dak} r={0.05} />
      <Blok size={[1.6, 1.2, 1.6]} pos={[b * 0.25, h + 1.0, -d * 0.2]} color="#4a4552" r={0.05} />
      <Cil r={0.04} h={2.4} pos={[-b * 0.3, h + 1.6, 0]} color="#3b3f46" seg={6} />
      <mesh position={[-b * 0.3, h + 2.85, 0]} material={mat('#ff3b3b', { emissive: '#ff2020' })}>
        <sphereGeometry args={[0.12, 8, 6]} />
      </mesh>
      {reclame && <Neon tekst={[reclame]} b={Math.min(b * 0.8, 6)} h={1.3} pos={[0, h + 1.1, d / 2 + 0.2]} kleur={kleur} />}
    </group>
  );
}

/** Bushokje (glas en dak). */
export function Bushokje({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[3.2, 0.12, 1.5]} pos={[0, 2.4, 0]} color="#2f3634" r={0.04} />
      {[-1.5, 1.5].map((x) => (
        <Blok key={x} size={[0.08, 2.4, 0.08]} pos={[x, 1.2, -0.6]} color="#2f3634" r={0} />
      ))}
      <Blok size={[3.0, 1.9, 0.04]} pos={[0, 1.25, -0.62]} color="#a9d6e4" r={0} opacity={0.35} />
      <Blok size={[2.4, 0.08, 0.4]} pos={[0, 0.5, -0.35]} color="#8a6545" r={0.02} />
      <Neon tekst={['BUS']} b={0.8} h={0.4} pos={[1.0, 2.75, 0]} kleur="#2ee6ff" />
    </group>
  );
}
