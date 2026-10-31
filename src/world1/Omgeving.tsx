// Wereld 1 – De Ellehaven: alles buiten de kamers. Land met kademuren en bolders, het havenwater, de vaste
// steigers op palen, De Eenheid aan de vertrekkade, de portaalkraan, de oude havenkraan, de ophaalbrug op de
// keersluis, de vuurtoren op het havenhoofd, de klokkentoren op het havenkantoor, de seinmast bij de poort,
// de dijk met huisjes, het containerterrein en ver weg een containerterminal aan de horizon.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { Loofboom, Terrein, Water } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { useSpel } from '../game/store';
import { faseIndex } from '../game/voortgang';
import { gloedTex } from '../game/texturen';
import { geluid } from '../lib/geluid';
import { Tekst } from './bouw';
import { PLAN, WATER_Y } from './huis';
import { Bolder, Bouwhek, Fietsen, Kadebank, Kadelantaarn, Peilschaal, TouwRol } from './inrichting';
import { FaseSfeer, Luchtkoepel, groenLicht, lampMat, raamMat, roodLicht, sfeerNu, witLicht } from './sfeer';

type V2 = [number, number];
type V3 = [number, number, number];

const CONTAINER_KLEUREN = ['#b4443a', '#2f6f9a', '#3f8f5a', '#e0a63a', '#8b5fa8', '#d86a4a', '#e9e3d8'];

// ── land en kades ───────────────────────────────────────────────────────

/** Het land (tegen de klok in, vanaf het noordoosten): de kustlijn volgt de kades, verder weg is het een eiland. */
const LAND: V2[] = [
  [70, -18],
  [32, -18],
  [32, -26],
  [12, -26],
  [12, -18],
  [8, -18],
  [8, 6],
  [-8, 6],
  [-8, -34],
  [-14, -34],
  [-14, -24],
  [-70, -24],
  [-70, 64],
  [70, 64],
];

/** Kademuren: van a naar b, het water ligt aan de kant `uit` (eenheidsvector). */
const KADES: { a: V2; b: V2; uit: V2 }[] = [
  { a: [32, -26], b: [32, -18], uit: [1, 0] },
  { a: [12, -26], b: [32, -26], uit: [0, -1] },
  { a: [12, -26], b: [12, -18], uit: [-1, 0] },
  { a: [8, -18], b: [12, -18], uit: [0, -1] },
  { a: [8, -18], b: [8, 6], uit: [-1, 0] },
  { a: [-8, 6], b: [8, 6], uit: [0, -1] },
  { a: [-8, -34], b: [-8, 6], uit: [1, 0] },
  { a: [-14, -34], b: [-8, -34], uit: [0, -1] },
  { a: [-14, -34], b: [-14, -24], uit: [-1, 0] },
  { a: [-16.5, -24], b: [-14, -24], uit: [0, -1] },
  { a: [-60, -24], b: [-23.5, -24], uit: [0, -1] },
  { a: [32, -18], b: [60, -18], uit: [0, -1] },
];

/** Bolders op de kaderand (0,45 m van de rand). */
const BOLDERS: V2[] = [
  // kadeplein
  [-6.4, 6.45],
  [-3.2, 6.45],
  [3.0, 6.45],
  [6.4, 6.45],
  // pakhuiskade en werf
  [-8.45, 4.0],
  [-8.45, -1.0],
  [-8.45, -8.0],
  [-8.45, -12.4],
  [-8.45, -19.6],
  [-8.45, -23.2],
  // havenhoofd
  [-8.45, -25.0],
  [-8.45, -33.4],
  // oostkade
  [8.45, 3.6],
  [8.45, -1.5],
  [8.45, -7.0],
  [8.45, -13.2],
  // vertrekkade
  [12.45, -21.0],
  [30.0, -25.55],
  [31.55, -25.55],
  [31.55, -20.0],
];

/** Kadelantaarns (staan op de kade, met botsing). */
const LANTAARNS: V2[] = [
  [-7.0, 13.2],
  [7.0, 13.2],
  [-8.55, 1.6],
  [-8.55, -10.0],
  [-8.75, -28.6],
  [-23.0, -18.75],
  [8.55, 1.6],
  [8.55, -10.0],
  [13.0, -18.9],
  [31.2, -18.9],
];

/** Wat buiten staat en waar je niet doorheen loopt (gebruikt in Wereld1.tsx en controle.ts). */
export const BUITEN_BOTSERS: { naam: string; x: number; z: number; b: number; d: number; rond?: boolean }[] = [
  ...BOLDERS.map(([x, z]) => ({ naam: 'bolder', x, z, b: 0.56, d: 0.56, rond: true })),
  ...LANTAARNS.map(([x, z]) => ({ naam: 'lantaarn', x, z, b: 0.44, d: 0.44, rond: true })),
  // oude havenkraan: vier poten over de pakhuiskade
  ...[-13.3, -8.7].flatMap((x) => [-5.4, -2.6].map((z) => ({ naam: 'kraanpoot oud', x, z, b: 0.5, d: 0.5 }))),
  // portaalkraan: vier poten over de vertrekkade
  ...[23.2, 28.2].flatMap((x) => [-18.6, -25.5].map((z) => ({ naam: 'kraanpoot', x, z, b: 0.8, d: 0.8 }))),
  // vuurtoren, seinmast, poortpijlers
  { naam: 'vuurtoren', x: -11, z: -32.6, b: 2.8, d: 2.8, rond: true },
  { naam: 'seinmast', x: 12.9, z: -25.3, b: 0.5, d: 0.5, rond: true },
  { naam: 'poortpijler w', x: 14.1, z: -26.05, b: 1.0, d: 0.4 },
  { naam: 'poortpijler o', x: 18.9, z: -26.05, b: 1.0, d: 0.4 },
  // schip in aanbouw op de helling
  { naam: 'kotter in aanbouw', x: -19.8, z: -22.95, b: 4.8, d: 2.1 },
  // kadebanken, fietsen
  { naam: 'bank plein w', x: -10.5, z: 13.3, b: 1.8, d: 0.6 },
  { naam: 'bank plein o', x: 10.5, z: 13.3, b: 1.8, d: 0.6 },
  { naam: 'bouwhek w', x: -14.6, z: -22.9, b: 2.9, d: 0.4 },
  { naam: 'bouwhek o', x: -10.2, z: -23.3, b: 2.9, d: 0.4 },
  { naam: 'hek oostkade', x: 13, z: -18, b: 2.0, d: 0.3 },
];

const raamGlas = raamMat;

/** Staaf (touw, kabel, giek) van punt a naar punt b. */
function Staaf({ a, b, r = 0.04, kleur, materiaal }: { a: V3; b: V3; r?: number; kleur?: string; materiaal?: THREE.Material }) {
  const { pos, quat, l } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const l = d.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return { pos: va.add(vb).multiplyScalar(0.5).toArray() as V3, quat, l };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} material={materiaal ?? mat(kleur ?? '#2b2f33')} castShadow>
      <cylinderGeometry args={[r, r, l, 6]} />
    </mesh>
  );
}

/** Kademuur langs één zijde: donkere baksteen tot onder het water, hardstenen rand, groene aanslag, stootbanden. */
function Kademuur({ a, b, uit }: { a: V2; b: V2; uit: V2 }) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const mx = (a[0] + b[0]) / 2;
  const mz = (a[1] + b[1]) / 2;
  const langsX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
  const d = 0.45;
  const x = mx + uit[0] * (d / 2);
  const z = mz + uit[1] * (d / 2);
  const maat = (w: number, h: number, dd: number): V3 => (langsX ? [w, h, dd] : [dd, h, w]);
  const banden = Math.floor(l / 5);
  return (
    <group>
      <Blok size={maat(l + d * 2, 3.2, d)} pos={[x, -1.6, z]} color="#4f3f37" r={0} shadow={false} />
      <Blok size={maat(l + d * 2, 0.16, 0.62)} pos={[mx + uit[0] * 0.02, 0.05, mz + uit[1] * 0.02]} color="#6f757b" r={0.02} />
      <Blok size={maat(l + d * 2, 0.4, 0.02)} pos={[mx + uit[0] * (d + 0.01), WATER_Y + 0.12, mz + uit[1] * (d + 0.01)]} color="#3a5236" r={0} shadow={false} />
      {Array.from({ length: banden }, (_, i) => {
        const t = (i + 0.5) / banden;
        const px = a[0] + (b[0] - a[0]) * t + uit[0] * (d + 0.1);
        const pz = a[1] + (b[1] - a[1]) * t + uit[1] * (d + 0.1);
        return (
          <mesh key={i} position={[px, -0.35, pz]} rotation={[0, langsX ? 0 : Math.PI / 2, 0]} material={mat('#1d1f21')}>
            <torusGeometry args={[0.3, 0.11, 6, 12]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Ladder in de kademuur. */
function Ladder({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.25, 0.25].map((x) => (
        <Blok key={x} size={[0.05, 2.4, 0.05]} pos={[x, -1.1, 0]} color="#2b3034" r={0} shadow={false} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Blok key={i} size={[0.5, 0.035, 0.035]} pos={[0, -2.1 + i * 0.32, 0]} color="#2b3034" r={0} shadow={false} />
      ))}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.25, -0.15]} rotation={[0, Math.PI / 2, 0]} material={mat('#2b3034')}>
          <torusGeometry args={[0.18, 0.025, 5, 10, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}

/** Onderkant van een vaste steiger: balken en palen tot in het water, plus meerpalen. */
function SteigerOnder({ x1, x2, z1, z2, meer = [] }: { x1: number; x2: number; z1: number; z2: number; meer?: V2[] }) {
  const palen: V2[] = [];
  const nx = Math.max(1, Math.round((x2 - x1) / 2.6));
  const nz = Math.max(1, Math.round((z2 - z1) / 2.6));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) if (i === 0 || j === 0 || i === nx || j === nz) palen.push([x1 + ((x2 - x1) * i) / nx, z1 + ((z2 - z1) * j) / nz]);
  return (
    <>
      <Blok size={[x2 - x1, 0.32, z2 - z1]} pos={[(x1 + x2) / 2, -0.17, (z1 + z2) / 2]} color="#4f3b2a" r={0} shadow={false} />
      <Blok size={[x2 - x1 + 0.08, 0.1, 0.12]} pos={[(x1 + x2) / 2, 0.0, z1]} color="#3d2e22" r={0.01} shadow={false} />
      <Blok size={[x2 - x1 + 0.08, 0.1, 0.12]} pos={[(x1 + x2) / 2, 0.0, z2]} color="#3d2e22" r={0.01} shadow={false} />
      {palen.map(([x, z], i) => (
        <Cil key={i} r={0.15} h={3.0} pos={[x, -1.65, z]} color="#3a2c21" seg={7} />
      ))}
      {meer.map(([x, z], i) => (
        <group key={`m${i}`}>
          <Cil r={0.2} h={4.4} pos={[x, -0.6, z]} color="#4a3828" seg={8} />
          <Cil r={0.22} h={0.08} pos={[x, 1.64, z]} color="#2b3034" seg={8} />
        </group>
      ))}
    </>
  );
}

// ── boten ───────────────────────────────────────────────────────────────

/** Kleine boot met spitse boeg (naar −x), romp, dek en (optioneel) stuurhut en mast. */
function Boot({ pos, rot = 0, L = 6, B = 2.4, romp = '#24515a', hut = true, mast = 0, naam }: { pos: V3; rot?: number; L?: number; B?: number; romp?: string; hut?: boolean; mast?: number; naam?: string }) {
  const vorm = useMemo(() => {
    const h = L / 2;
    const s = new THREE.Shape();
    s.moveTo(h, -B * 0.42);
    s.lineTo(-h * 0.3, -B / 2);
    s.quadraticCurveTo(-h * 0.85, -B * 0.42, -h, 0);
    s.quadraticCurveTo(-h * 0.85, B * 0.42, -h * 0.3, B / 2);
    s.lineTo(h, B * 0.42);
    s.closePath();
    return s;
  }, [L, B]);
  const dek = 0.25;
  const hoog = 1.25;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, dek - hoog, 0]} material={mat(romp)} castShadow receiveShadow>
        <extrudeGeometry args={[vorm, { depth: hoog, bevelEnabled: false }]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, dek - 0.02, 0]} scale={[1.02, 1.02, 1]} material={mat('#efe9dc')}>
        <extrudeGeometry args={[vorm, { depth: 0.1, bevelEnabled: false }]} />
      </mesh>
      <Blok size={[L * 0.7, 0.05, B * 0.78]} pos={[L * 0.05, dek + 0.03, 0]} color="#9a7a55" r={0} shadow={false} />
      {hut && (
        <>
          <Blok size={[L * 0.26, 1.2, B * 0.62]} pos={[L * 0.2, dek + 0.6, 0]} color="#efe9dc" r={0.06} />
          <Blok size={[L * 0.3, 0.08, B * 0.7]} pos={[L * 0.2, dek + 1.24, 0]} color="#2f3634" r={0} />
          <mesh position={[L * 0.2 - L * 0.13 - 0.01, dek + 0.85, 0]} material={raamGlas}>
            <boxGeometry args={[0.03, 0.35, B * 0.46]} />
          </mesh>
        </>
      )}
      {mast > 0 && (
        <>
          <Cil r={0.07} h={mast} pos={[-L * 0.18, dek + mast / 2, 0]} color="#5a3a24" seg={8} />
          <Blok size={[L * 0.5, 0.35, 0.3]} pos={[L * 0.07, dek + 1.0, 0]} rot={[0, 0, -0.06]} color="#8a3a2a" r={0.1} />
          <mesh position={[-L * 0.18, dek + mast + 0.05, 0]} material={witLicht}>
            <sphereGeometry args={[0.08, 8, 6]} />
          </mesh>
        </>
      )}
      {naam && <Tekst regels={[naam]} b={L * 0.36} h={0.32} pos={[-L * 0.1, dek - 0.3, B / 2 + 0.03]} o={{ transparant: true, fg: '#f3efe6' }} />}
    </group>
  );
}

/** De Eenheid: kustvaarder van 30 × 7 m langs de vertrekkade, boeg naar het westen. Dek op +1,0 m (hoogwater). */
export const DEK_Y = 1.0;
function Kustvaarder() {
  const X0 = 8;
  const X1 = 38;
  const Z = -29.75;
  const B = 6.5;
  const DEK = DEK_Y;
  const romp = useMemo(() => {
    const s = new THREE.Shape();
    const L = X1 - X0;
    s.moveTo(L, -B / 2);
    s.lineTo(5, -B / 2);
    s.quadraticCurveTo(1.2, -B / 2, 0, 0);
    s.quadraticCurveTo(1.2, B / 2, 5, B / 2);
    s.lineTo(L, B / 2);
    s.closePath();
    return s;
  }, []);
  const diep = 3.4;
  const kl = CONTAINER_KLEUREN;
  // reling langs beide zijden (aan de zuidkant een opening voor de loopplank)
  const palen: V3[] = [];
  for (let x = X0 + 4; x < X1 - 0.5; x += 1.5) {
    palen.push([x, DEK, Z - B / 2 + 0.12]);
    if (x < 14.8 || x > 18.2) palen.push([x, DEK, Z + B / 2 - 0.12]);
  }
  return (
    <group>
      <group position={[X0, 0, Z]}>
        {/* romp tot het dek: donkerblauw, rode onderkant, witte rand */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DEK - diep, 0]} material={mat('#1f3c5a')} castShadow receiveShadow>
          <extrudeGeometry args={[romp, { depth: diep, bevelEnabled: false }]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y - 0.6, 0]} scale={[1.004, 1.01, 1]} material={mat('#9a2f28')}>
          <extrudeGeometry args={[romp, { depth: 0.75, bevelEnabled: false }]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DEK - 0.12, 0]} scale={[1.003, 1.008, 1]} material={mat('#e9e3d8')}>
          <extrudeGeometry args={[romp, { depth: 0.1, bevelEnabled: false }]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, DEK, 0]} scale={[0.985, 0.95, 1]} material={mat('#7a4a32')}>
          <extrudeGeometry args={[romp, { depth: 0.03, bevelEnabled: false }]} />
        </mesh>
      </group>
      {palen.map((p, i) => (
        <Blok key={i} size={[0.05, 1.0, 0.05]} pos={[p[0], p[1] + 0.5, p[2]]} color="#e9e3d8" r={0.01} />
      ))}
      {[Z - B / 2 + 0.12, Z + B / 2 - 0.12].map((z, i) => (
        <group key={z}>
          {(i === 1
            ? [
                [X0 + 4, 14.6],
                [18.4, X1 - 0.5],
              ]
            : [[X0 + 4, X1 - 0.5]]
          ).map(([a, b]) => (
            <group key={a}>
              <Blok size={[b - a, 0.05, 0.05]} pos={[(a + b) / 2, DEK + 1.0, z]} color="#e9e3d8" r={0.01} />
              <Blok size={[b - a, 0.04, 0.04]} pos={[(a + b) / 2, DEK + 0.55, z]} color="#e9e3d8" r={0.01} />
            </group>
          ))}
        </group>
      ))}
      {/* naam op de boeg en het achterschip */}
      <Tekst regels={['DE EENHEID']} b={3.4} h={0.5} pos={[X0 + 4.4, DEK - 0.55, Z + B / 2 + 0.03]} o={{ transparant: true, fg: '#f3efe6' }} />
      <Tekst regels={['DE EENHEID']} b={3.4} h={0.5} pos={[X0 + 4.4, DEK - 0.55, Z - B / 2 - 0.03]} rot={[0, Math.PI, 0]} o={{ transparant: true, fg: '#f3efe6' }} />
      <Tekst regels={['DE EENHEID', 'ELLEHAVEN']} b={3.0} h={0.8} pos={[X1 + 0.03, DEK - 0.7, Z]} rot={[0, Math.PI / 2, 0]} o={{ transparant: true, fg: '#f3efe6' }} />
      {/* luikhoofd met containers (2 rijen, 2 lagen) */}
      <Blok size={[19, 0.6, 5.0]} pos={[20.5, DEK + 0.3, Z - 0.2]} color="#2f4d6b" r={0.05} />
      {Array.from({ length: 6 }, (_, i) =>
        [-1.4, 1.0].map((dz, j) =>
          [0, 1].map((laag) => {
            if (laag === 1 && (i + j) % 3 === 2) return null;
            const k = kl[(i * 3 + j * 2 + laag * 5) % 5];
            return <Blok key={`${i}${j}${laag}`} size={[2.95, 2.55, 2.42]} pos={[12.6 + i * 3.1, DEK + 0.6 + 1.3 + laag * 2.6, Z + dz]} color={k} r={0.04} />;
          }),
        ),
      )}
      {/* achterschip: brug met ramen, schoorsteen, mast en navigatielichten */}
      <group position={[34.2, DEK, Z]}>
        <Blok size={[5.2, 2.6, 6.0]} pos={[0, 1.3, 0]} color="#f3efe6" r={0.08} />
        <Blok size={[4.4, 2.4, 5.4]} pos={[0.2, 3.8, 0]} color="#f3efe6" r={0.08} />
        <Blok size={[3.6, 2.2, 7.4]} pos={[0, 6.1, 0]} color="#f3efe6" r={0.08} />
        <Blok size={[3.9, 0.2, 7.8]} pos={[0, 7.3, 0]} color="#2f3634" r={0.03} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 6.4, s * 3.72]} material={raamGlas}>
            <boxGeometry args={[3.0, 0.7, 0.04]} />
          </mesh>
        ))}
        <mesh position={[-1.81, 6.4, 0]} material={raamGlas}>
          <boxGeometry args={[0.04, 0.8, 6.6]} />
        </mesh>
        {[1.3, 3.8].map((y) =>
          [-1, 1].map((s) => (
            <mesh key={`${y}${s}`} position={[0, y + 0.2, s * (y < 2 ? 3.02 : 2.72)]} material={raamGlas}>
              <boxGeometry args={[3.2, 0.5, 0.04]} />
            </mesh>
          )),
        )}
        <Cil r={0.55} h={2.2} pos={[1.6, 8.3, 0]} color="#b4443a" seg={14} />
        <Cil r={0.58} h={0.4} pos={[1.6, 9.4, 0]} color="#1f1f1f" seg={14} />
        <Cil r={0.07} h={4.2} pos={[0, 9.4, 0]} color="#e9e3d8" seg={8} />
        <mesh position={[0, 11.55, 0]} material={witLicht}>
          <sphereGeometry args={[0.12, 8, 6]} />
        </mesh>
        <mesh position={[-1.6, 7.0, 3.95]} material={roodLicht}>
          <sphereGeometry args={[0.12, 8, 6]} />
        </mesh>
        <mesh position={[-1.6, 7.0, -3.95]} material={groenLicht}>
          <sphereGeometry args={[0.12, 8, 6]} />
        </mesh>
      </group>
      {/* voorschip: mast met toplicht en ankerlier */}
      <Cil r={0.08} h={6.5} pos={[X0 + 2.6, DEK + 3.25, Z]} color="#e9e3d8" seg={8} />
      <mesh position={[X0 + 2.6, DEK + 6.6, Z]} material={witLicht}>
        <sphereGeometry args={[0.12, 8, 6]} />
      </mesh>
      <Blok size={[1.2, 0.6, 1.6]} pos={[X0 + 3.6, DEK + 0.3, Z]} color="#3b4246" r={0.06} />
      {/* trossen naar de bolders */}
      <Staaf a={[X0 + 3.5, DEK + 0.2, Z + B / 2]} b={[12.45, 0.5, -21.0]} r={0.035} kleur="#d6c393" />
      <Staaf a={[X1 - 1.5, DEK + 0.2, Z + B / 2]} b={[31.55, 0.5, -20.0]} r={0.035} kleur="#d6c393" />
      <Staaf a={[30.5, DEK + 0.2, Z + B / 2]} b={[30.0, 0.5, -25.55]} r={0.035} kleur="#d6c393" />
    </group>
  );
}

/** Loopplank van de poort naar het dek, met leuningen (helling in registreer). */
function Loopplank() {
  const a = Math.atan2(DEK_Y, 1.5);
  return (
    <group>
      <Blok size={[1.6, 0.08, Math.hypot(1.5, DEK_Y) + 0.1]} pos={[16.5, DEK_Y / 2 - 0.02, -26.75]} rot={[-a, 0, 0]} color="#7d868b" r={0.01} />
      {Array.from({ length: 5 }, (_, i) => (
        <Blok key={i} size={[1.5, 0.04, 0.05]} pos={[16.5, 0.08 + (i * DEK_Y) / 5, -26.1 - i * 0.3]} color="#5a5f63" r={0.005} shadow={false} />
      ))}
      {[-0.82, 0.82].map((dx) => (
        <group key={dx}>
          <Staaf a={[16.5 + dx, 1.0, -25.95]} b={[16.5 + dx, DEK_Y + 1.0, -27.55]} r={0.03} kleur="#e9e3d8" />
          {[-25.95, -26.75, -27.55].map((z, i) => (
            <Blok key={z} size={[0.04, 1.0, 0.04]} pos={[16.5 + dx, 0.5 + (i * DEK_Y) / 2, z]} color="#e9e3d8" r={0.01} />
          ))}
        </group>
      ))}
    </group>
  );
}

// ── kranen ──────────────────────────────────────────────────────────────

const KRAAN_WIT = '#e9e3d8';
const KRAAN_BLAUW = '#2f6f9a';

/** Portaalkraan over de vertrekkade (vast deel): vier poten, portaal, giek over het schip, machinehuis. */
function Portaalkraan() {
  const X = [23.2, 28.2];
  const Zs = [-18.6, -25.5];
  const H = 13;
  return (
    <group>
      {X.map((x) =>
        Zs.map((z) => (
          <group key={`${x}${z}`}>
            <Blok size={[0.7, H, 0.7]} pos={[x, H / 2, z]} color={KRAAN_WIT} r={0.04} />
            <Blok size={[1.0, 0.5, 1.6]} pos={[x, 0.25, z]} color={KRAAN_BLAUW} r={0.04} />
          </group>
        )),
      )}
      {X.map((x) => (
        <group key={x}>
          <Blok size={[0.6, 0.9, 7.6]} pos={[x, H - 0.45, (Zs[0] + Zs[1]) / 2]} color={KRAAN_WIT} r={0.04} />
          <Blok size={[0.5, 0.6, 7.6]} pos={[x, 4.2, (Zs[0] + Zs[1]) / 2]} color={KRAAN_WIT} r={0.04} />
          <Staaf a={[x, 4.5, Zs[0]]} b={[x, H - 0.9, Zs[1]]} r={0.12} kleur={KRAAN_WIT} />
        </group>
      ))}
      {Zs.map((z) => (
        <Blok key={z} size={[5.6, 0.8, 0.6]} pos={[25.7, H - 0.4, z]} color={KRAAN_WIT} r={0.04} />
      ))}
      {/* giek over het schip en achterarm boven de loods */}
      {[24.2, 27.2].map((x) => (
        <Blok key={x} size={[0.55, 1.0, 34]} pos={[x, H + 0.6, -27.0]} color={KRAAN_BLAUW} r={0.04} />
      ))}
      <Blok size={[3.6, 0.3, 34]} pos={[25.7, H + 0.2, -27.0]} color={KRAAN_BLAUW} r={0.02} shadow={false} />
      <Blok size={[4.8, 2.6, 5.0]} pos={[25.7, H + 2.4, -15.0]} color={KRAAN_WIT} r={0.08} />
      <Tekst regels={['ELLEHAVEN']} b={3.4} h={0.6} pos={[25.7, H + 2.5, -12.48]} o={{ bg: KRAAN_WIT, fg: '#1f3c5a' }} />
      {/* bok met stagen naar de giek */}
      {[24.2, 27.2].map((x) => (
        <group key={x}>
          <Blok size={[0.4, 7, 0.4]} pos={[x, H + 4.6, -21.0]} color={KRAAN_WIT} r={0.03} />
          <Staaf a={[x, H + 8, -21.0]} b={[x, H + 1.1, -40.5]} r={0.05} kleur="#2b2f33" />
          <Staaf a={[x, H + 8, -21.0]} b={[x, H + 1.1, -31.0]} r={0.05} kleur="#2b2f33" />
          <Staaf a={[x, H + 8, -21.0]} b={[x, H + 1.1, -12.0]} r={0.05} kleur="#2b2f33" />
        </group>
      ))}
      {[
        [25.7, H + 8.2, -21.0],
        [25.7, H + 1.4, -43.6],
        [25.7, H + 3.8, -15.0],
      ].map((p, i) => (
        <mesh key={i} position={p as V3} material={roodLicht}>
          <sphereGeometry args={[0.16, 8, 6]} />
        </mesh>
      ))}
      {/* schijnwerpers onder de giek (gaan aan met de fase) */}
      {[-20.0, -24.0, -28.0].map((z) => (
        <mesh key={z} position={[25.7, H - 0.05, z]} rotation={[Math.PI / 2, 0, 0]} material={lampMat}>
          <planeGeometry args={[1.0, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}

/** Kat met spreader die een container uit het schip hijst en weer neerzet. */
function KraanKat() {
  const kat = useRef<THREE.Group>(null);
  const last = useRef<THREE.Group>(null);
  const kabel = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % 30;
    const glad = (x: number) => x * x * (3 - 2 * x);
    // 0–5 zakken, 5–10 hijsen, 10–16 naar de kade, 16–21 zakken/hijsen, 21–27 terug
    let z = -29.6;
    let y = 4.2;
    if (t < 5) y = 7.5 - glad(t / 5) * 3.3;
    else if (t < 10) y = 4.2 + glad((t - 5) / 5) * 5.5;
    else if (t < 16) {
      y = 9.7;
      z = -29.6 + glad((t - 10) / 6) * 8.0;
    } else if (t < 21) {
      z = -21.6;
      y = 9.7 - Math.sin(((t - 16) / 5) * Math.PI) * 2.4;
    } else if (t < 27) {
      y = 9.7 - glad((t - 21) / 6) * 2.2;
      z = -21.6 - glad((t - 21) / 6) * 8.0;
    } else y = 7.5;
    if (kat.current) kat.current.position.z = z;
    if (last.current) {
      last.current.position.set(25.7, y, z);
    }
    if (kabel.current) {
      const top = 13.6;
      const l = top - (y + 2.75);
      kabel.current.position.set(25.7, y + 2.75 + l / 2, z);
      kabel.current.scale.y = Math.max(0.1, l);
    }
  });
  return (
    <>
      <group ref={kat} position={[25.7, 13.9, -29.6]}>
        <Statisch>
          <Blok size={[3.2, 1.0, 2.4]} color={KRAAN_WIT} r={0.05} />
          <Blok size={[1.4, 1.2, 1.6]} pos={[-1.2, -1.0, 0.6]} color={KRAAN_BLAUW} r={0.05} />
          <mesh position={[-1.9, -1.0, 0.6]} material={raamGlas}>
            <boxGeometry args={[0.04, 0.6, 1.2]} />
          </mesh>
        </Statisch>
      </group>
      <group ref={last}>
        <Statisch>
          <Blok size={[2.5, 0.25, 6.2]} pos={[0, 2.75, 0]} color="#e6b43a" r={0.03} />
          <Blok size={[2.44, 2.59, 6.06]} pos={[0, 1.3, 0]} color="#3f8f5a" r={0.04} />
        </Statisch>
      </group>
      <mesh ref={kabel} material={mat('#2b2f33')}>
        <cylinderGeometry args={[0.04, 0.04, 1, 5]} />
      </mesh>
    </>
  );
}

/** Oude elektrische havenkraan op de pakhuiskade (portaal over de kade, draaibare cabine met giek). */
function OudeKraan() {
  const X = [-13.3, -8.7];
  const Zs = [-5.4, -2.6];
  const groen = '#4f5e52';
  return (
    <group>
      {X.map((x) =>
        Zs.map((z) => (
          <group key={`${x}${z}`}>
            <Blok size={[0.4, 4.6, 0.4]} pos={[x, 2.3, z]} rot={[0, 0, x < -11 ? 0.06 : -0.06]} color={groen} r={0.03} />
            <Blok size={[0.6, 0.35, 0.9]} pos={[x, 0.18, z]} color="#2b3034" r={0.03} />
          </group>
        )),
      )}
      <Blok size={[5.6, 0.6, 3.6]} pos={[-11, 4.8, -4.0]} color={groen} r={0.04} />
      <Cil r={1.2} h={0.4} pos={[-11, 5.3, -4.0]} color="#2b3034" seg={16} />
      <group position={[-11, 5.5, -4.0]} rotation={[0, -0.5, 0]}>
        <Blok size={[3.0, 2.4, 2.4]} pos={[-0.4, 1.2, 0]} color={groen} r={0.06} />
        <Blok size={[3.3, 0.2, 2.7]} pos={[-0.4, 2.5, 0]} color="#2b3034" r={0.03} />
        <mesh position={[1.12, 1.5, 0]} material={raamGlas}>
          <boxGeometry args={[0.04, 0.7, 1.6]} />
        </mesh>
        <Blok size={[1.2, 1.4, 2.0]} pos={[-2.4, 0.9, 0]} color="#3a3f42" r={0.04} />
        <Staaf a={[0.6, 0.6, -0.5]} b={[11.5, 7.0, -0.5]} r={0.12} kleur="#b4443a" />
        <Staaf a={[0.6, 0.6, 0.5]} b={[11.5, 7.0, 0.5]} r={0.12} kleur="#b4443a" />
        <Staaf a={[-0.6, 2.6, 0]} b={[11.5, 7.0, 0]} r={0.025} kleur="#2b2f33" />
        <Staaf a={[11.5, 7.0, 0]} b={[11.5, 1.4, 0]} r={0.02} kleur="#2b2f33" />
        <Blok size={[0.3, 0.4, 0.3]} pos={[11.5, 1.2, 0]} color="#e6b43a" r={0.04} />
      </group>
      {/* rails over de kade */}
      {X.map((x) => (
        <Blok key={x} size={[0.08, 0.03, 23]} pos={[x, 0.025, -6.4]} color="#5a5f63" r={0} shadow={false} />
      ))}
    </group>
  );
}

// ── ophaalbrug ──────────────────────────────────────────────────────────

const BRUG_L = 8;
const BRUG_B = 3;
const BRUG_Z = -16.5;
const GALG_H = 5.2;

/** Eén klap van de Hollandse ophaalbrug met balans; `kant` −1 = west, +1 = oost. Hoek 0 = dicht. */
function Brugklap({ kant, hoek }: { kant: -1 | 1; hoek: { current: number } }) {
  const klap = useRef<THREE.Group>(null);
  const balans = useRef<THREE.Group>(null);
  const stangen = useRef<THREE.Group>(null);
  const x0 = kant * BRUG_L;
  useFrame(() => {
    const a = hoek.current;
    if (klap.current) klap.current.rotation.z = kant * a;
    if (balans.current) balans.current.rotation.z = kant * a;
    if (stangen.current) stangen.current.position.set(x0 - kant * BRUG_L * Math.cos(a), BRUG_L * Math.sin(a) + GALG_H / 2, BRUG_Z);
  });
  const wit = '#f1ede4';
  return (
    <group>
      {/* het brugdek draait om het scharnier op de kade */}
      <group ref={klap} position={[x0, 0, BRUG_Z]}>
        <Statisch>
        <Blok size={[BRUG_L, 0.28, BRUG_B]} pos={[-kant * BRUG_L / 2, -0.12, 0]} color="#5a3a24" r={0.02} />
        <Blok size={[BRUG_L, 0.04, BRUG_B - 0.1]} pos={[-kant * BRUG_L / 2, 0.03, 0]} color="#7a5a3a" r={0} shadow={false} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Blok size={[BRUG_L, 0.08, 0.08]} pos={[-kant * BRUG_L / 2, 1.05, s * (BRUG_B / 2 - 0.05)]} color={wit} r={0.01} />
            <Blok size={[BRUG_L, 0.05, 0.05]} pos={[-kant * BRUG_L / 2, 0.55, s * (BRUG_B / 2 - 0.05)]} color={wit} r={0.01} />
            {Array.from({ length: 5 }, (_, i) => (
              <Blok key={i} size={[0.07, 1.05, 0.07]} pos={[-kant * (0.3 + i * 1.85), 0.52, s * (BRUG_B / 2 - 0.05)]} color={wit} r={0.01} />
            ))}
          </group>
        ))}
        <Blok size={[0.3, 0.32, BRUG_B]} pos={[-kant * (BRUG_L - 0.15), -0.1, 0]} color="#1f1f1f" r={0.02} />
        </Statisch>
      </group>
      {/* balans: draait om de top van de galg, parallel aan het dek */}
      <group ref={balans} position={[x0, GALG_H, BRUG_Z]}>
        <Statisch>
        {[-1, 1].map((s) => (
          <Blok key={s} size={[BRUG_L + 3.2, 0.32, 0.24]} pos={[-kant * (BRUG_L / 2 - 1.6), 0, s * (BRUG_B / 2 + 0.25)]} color={wit} r={0.03} />
        ))}
        <Blok size={[1.2, 1.1, BRUG_B + 0.8]} pos={[kant * 2.6, -0.2, 0]} color="#2b2f33" r={0.04} />
        <Blok size={[0.2, 0.2, BRUG_B + 0.7]} pos={[-kant * (BRUG_L - 0.1), 0, 0]} color={wit} r={0.02} />
        </Statisch>
      </group>
      {/* trekstangen: altijd verticaal (parallellogram) */}
      <group ref={stangen}>
        <Statisch>
          {[-1, 1].map((s) => (
            <Blok key={s} size={[0.1, GALG_H, 0.1]} pos={[0, 0, s * (BRUG_B / 2 + 0.25)]} color="#2b2f33" r={0.01} />
          ))}
        </Statisch>
      </group>
    </group>
  );
}

/** De ophaalbrug: staat omhoog tot de Eindcheck en zakt dan in ± 6 s (met bel). */
function Ophaalbrug() {
  const fase = useSpel((s) => s.fase);
  const docent = useSpel((s) => s.docent);
  const dicht = docent || faseIndex(fase) >= faseIndex('evaluatie');
  const OPEN = 1.25;
  const hoek = useRef(dicht ? 0 : OPEN);
  const was = useRef(dicht);
  useEffect(() => {
    if (dicht && !was.current) geluid('poort');
    was.current = dicht;
  }, [dicht]);
  useFrame((_, dt) => {
    const doel = dicht ? 0 : OPEN;
    const d = doel - hoek.current;
    hoek.current += Math.sign(d) * Math.min(Math.abs(d), dt * 0.22);
  });
  return (
    <>
      <Brugklap kant={-1} hoek={hoek} />
      <Brugklap kant={1} hoek={hoek} />
    </>
  );
}

/** Vaste delen van de brug: galgen (portalen) op beide kades, sluisdeuren in de keersluis eronder. */
function BrugVast() {
  const wit = '#f1ede4';
  return (
    <group>
      {[-1, 1].map((kant) => (
        <group key={kant} position={[kant * (BRUG_L + 0.6), 0, BRUG_Z]}>
          {[-1, 1].map((s) => (
            <Blok key={s} size={[0.4, GALG_H + 0.6, 0.4]} pos={[0, (GALG_H + 0.6) / 2, s * (BRUG_B / 2 + 0.25)]} color={wit} r={0.03} />
          ))}
          <Blok size={[0.5, 0.4, BRUG_B + 1.0]} pos={[0, GALG_H + 0.55, 0]} color={wit} r={0.03} />
          <Blok size={[1.4, 0.3, BRUG_B + 1.2]} pos={[0, 0.15, 0]} color="#6f757b" r={0.02} />
        </group>
      ))}
      {/* keersluis: twee houten puntdeuren open in hun nissen, en een peilschaal */}
      {[-1, 1].map((kant) => (
        <Blok key={kant} size={[0.25, 2.6, 3.2]} pos={[kant * 7.7, -1.3, BRUG_Z + 2.0]} rot={[0, kant * 0.12, 0]} color="#3d2e22" r={0.02} shadow={false} />
      ))}
      <Peilschaal pos={[-7.53, 0.4, -14.2]} rot={Math.PI / 2} h={2.2} />
    </group>
  );
}

// ── vuurtoren ───────────────────────────────────────────────────────────

const VT: V2 = [-11, -32.6];
const VT_LICHT = 9.6;

function Vuurtoren() {
  const banden = 4;
  return (
    <group position={[VT[0], 0, VT[1]]}>
      <Cil r={1.45} rTop={1.35} h={0.9} pos={[0, 0.45, 0]} color="#8d8780" seg={16} />
      {Array.from({ length: banden }, (_, i) => {
        const r0 = 1.15 - 0.3 * (i / banden);
        const r1 = 1.15 - 0.3 * ((i + 1) / banden);
        const hb = 7.6 / banden;
        return <Cil key={i} r={r0} rTop={r1} h={hb} pos={[0, 0.9 + hb * (i + 0.5), 0]} color={i % 2 ? '#efe9dc' : '#c0392b'} seg={16} />;
      })}
      <Cil r={1.25} h={0.16} pos={[0, 8.6, 0]} color="#2b3034" seg={16} />
      <mesh position={[0, 9.15, 0]} material={mat('#2b3034', { metal: 0.5 })}>
        <torusGeometry args={[1.2, 0.03, 4, 24]} />
      </mesh>
      <mesh position={[0, VT_LICHT, 0]} material={lampMat}>
        <cylinderGeometry args={[0.62, 0.62, 1.1, 12]} />
      </mesh>
      <mesh position={[0, 10.6, 0]} material={mat('#b4443a')}>
        <coneGeometry args={[0.9, 0.8, 12]} />
      </mesh>
      <Cil r={0.1} h={0.4} pos={[0, 11.1, 0]} color="#2b3034" seg={8} />
      <Blok size={[0.9, 1.9, 0.12]} pos={[0, 1.15, 1.18]} color="#2f4d6b" r={0.03} />
      <mesh position={[0.6, 4.2, 0.95]} material={raamGlas}>
        <boxGeometry args={[0.3, 0.45, 0.05]} />
      </mesh>
    </group>
  );
}

/** Twee lichtbundels die rondgaan (alleen als de lampen aan zijn). */
function Lichtbundel() {
  const ref = useRef<THREE.Group>(null);
  const { geo, materiaal, gloed, punt } = useMemo(() => {
    const g = new THREE.ConeGeometry(1.8, 22, 16, 1, true);
    g.translate(0, -11, 0);
    g.rotateZ(Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const c = new Float32Array(p.count * 3);
    const k = new THREE.Color('#ffe7a8');
    for (let i = 0; i < p.count; i++) {
      const f = Math.max(0, 1 - p.getX(i) / 22) * 0.38;
      c[i * 3] = k.r * f;
      c[i * 3 + 1] = k.g * f;
      c[i * 3 + 2] = k.b * f;
    }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const materiaal = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false, opacity: 0 });
    const gloed = new THREE.PointsMaterial({ map: gloedTex(), color: '#ffe2a0', size: 6, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, opacity: 0 });
    const punt = new THREE.BufferGeometry();
    punt.setAttribute('position', new THREE.Float32BufferAttribute([VT[0], VT_LICHT, VT[1]], 3));
    return { geo: g, materiaal, gloed, punt };
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const aan = Math.max(0, (sfeerNu.lamp - 0.4) / 0.6);
    if (ref.current) {
      ref.current.rotation.y = t * 0.75;
      ref.current.visible = aan > 0.02;
    }
    materiaal.opacity = aan;
    gloed.opacity = aan;
    gloed.size = 5 + 2.5 * Math.pow(Math.abs(Math.sin(t * 0.75)), 6);
  });
  return (
    <>
      <group ref={ref} position={[VT[0], VT_LICHT, VT[1]]}>
        <mesh geometry={geo} material={materiaal} />
        <mesh geometry={geo} material={materiaal} rotation={[0, Math.PI, 0]} />
      </group>
      <points geometry={punt} material={gloed} />
    </>
  );
}

// ── klokkentoren op het havenkantoor ────────────────────────────────────

const TOREN: V3 = [0, 7.0, 18];
/** Bovenkant van de bakstenen schacht en het midden van de klokken. */
const SCHACHT = 12.8;
const KLOK_Y = 11.65;

/** Wijzerplaat (zonder wijzers): Romeinse cijfers op een witte plaat. */
function useWijzerplaat() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f4efe2';
    g.beginPath();
    g.arc(128, 128, 124, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#1f2a33';
    g.lineWidth = 6;
    g.stroke();
    const cijfers = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    g.fillStyle = '#1f2a33';
    g.font = '700 26px serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    cijfers.forEach((s, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      g.fillText(s, 128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96);
    });
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      g.fillRect(128 + Math.cos(a) * 116 - 1.5, 128 + Math.sin(a) * 116 - 1.5, 3, 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/** Toren (vast): bakstenen schacht uit het dak, lantaarn met zuilen, koepeltje, mast met tijdbal-geleider. */
function KlokkentorenVast() {
  const plaat = useWijzerplaat();
  const [x, y0, z] = TOREN;
  return (
    <group>
      <Blok size={[3.6, SCHACHT - y0, 3.6]} pos={[x, (SCHACHT + y0) / 2, z]} color="#9a5a3c" r={0.02} />
      <Blok size={[3.9, 0.3, 3.9]} pos={[x, SCHACHT + 0.15, z]} color="#d8cdb8" r={0.03} />
      <Blok size={[3.75, 0.22, 3.75]} pos={[x, KLOK_Y - 1.15, z]} color="#d8cdb8" r={0.02} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2;
        return (
          <group key={i} position={[x + Math.sin(a) * 1.82, KLOK_Y, z + Math.cos(a) * 1.82]} rotation={[0, a, 0]}>
            <mesh>
              <circleGeometry args={[0.85, 32]} />
              <meshBasicMaterial map={plaat} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -0.02]} material={mat('#c9a04a', { metal: 0.6, rough: 0.35 })}>
              <cylinderGeometry args={[0.92, 0.92, 0.04, 32]} />
            </mesh>
          </group>
        );
      })}
      {/* open lantaarn met vier zuilen en een koepeltje */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.3, 1.6, 0.3]} pos={[x + sx * 1.3, SCHACHT + 1.1, z + sz * 1.3]} color="#efe9dc" r={0.03} />),
      )}
      <Blok size={[3.2, 0.25, 3.2]} pos={[x, SCHACHT + 2.0, z]} color="#d8cdb8" r={0.03} />
      <mesh position={[x, SCHACHT + 2.1, z]} material={mat('#3f6a5a', { metal: 0.3, rough: 0.5 })}>
        <sphereGeometry args={[1.25, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <Cil r={0.06} h={3.0} pos={[x, SCHACHT + 4.6, z]} color="#2b3034" seg={8} />
    </group>
  );
}

/** Wijzers van de vier klokken en de tijdbal (valt bij de Eindcheck). */
function KlokkentorenLevend() {
  const [x, , z] = TOREN;
  const wijzers = useRef<THREE.Group[]>([]);
  const bal = useRef<THREE.Mesh>(null);
  const fase = useSpel((s) => s.fase);
  const gevallen = faseIndex(fase) >= faseIndex('evaluatie');
  const balY = useRef(gevallen ? 0 : 1);
  useFrame((_, dt) => {
    const min = sfeerNu.min;
    const uur = 7 + min / 60;
    wijzers.current.forEach((g) => {
      if (!g) return;
      const [klein, groot] = g.children;
      if (klein) klein.rotation.z = -(uur / 12) * Math.PI * 2;
      if (groot) groot.rotation.z = -((min % 60) / 60) * Math.PI * 2;
    });
    const doel = gevallen ? 0 : 1;
    balY.current += (doel - balY.current) * Math.min(1, dt * (gevallen ? 6 : 1));
    if (bal.current) bal.current.position.y = SCHACHT + 3.7 + balY.current * 1.7;
  });
  const wijzerMat = mat('#1f2a33');
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2;
        return (
          <group key={i} position={[x + Math.sin(a) * 1.86, KLOK_Y, z + Math.cos(a) * 1.86]} rotation={[0, a, 0]}>
            <group
              ref={(g) => {
                if (g) wijzers.current[i] = g;
              }}
            >
              <group>
                <mesh position={[0, 0.22, 0]} material={wijzerMat}>
                  <boxGeometry args={[0.07, 0.46, 0.02]} />
                </mesh>
              </group>
              <group>
                <mesh position={[0, 0.32, 0.01]} material={wijzerMat}>
                  <boxGeometry args={[0.045, 0.66, 0.02]} />
                </mesh>
              </group>
            </group>
          </group>
        );
      })}
      <mesh ref={bal} position={[x, SCHACHT + 5.4, z]} material={mat('#c0392b', { rough: 0.4 })}>
        <sphereGeometry args={[0.42, 16, 12]} />
      </mesh>
    </>
  );
}

// ── seinmast en poort ───────────────────────────────────────────────────

const MAST: V2 = [12.9, -25.3];

/** Seinmast bij de poort (10 m): drie ronde lampen in de kleuren van de klussen. Een lamp gaat aan als die kluis open is. */
function Seinmast() {
  const kluizen = useSpel((s) => s.kluizen);
  const nr = useSpel((s) => s.wereld);
  const lampen = useMemo(
    () =>
      [
        ['lengte', '#5aa9ff'],
        ['inhoud', '#2ec4b6'],
        ['gewicht', '#ffc94d'],
      ] as const,
    [],
  );
  const gloed = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(lampen.flatMap((_, i) => [MAST[0], 9.6 - i * 1.1, MAST[1] - 0.35]), 3));
    const kl: number[] = [];
    return { g, kl };
  }, [lampen]);
  const gloedMat = useMemo(() => new THREE.PointsMaterial({ map: gloedTex(), vertexColors: true, size: 2.6, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }), []);
  useEffect(() => {
    const c = lampen.flatMap(([id, k]) => {
      const aan = !!kluizen[`${nr}:${id}`];
      const kleur = new THREE.Color(k).multiplyScalar(aan ? 1 : 0);
      return [kleur.r, kleur.g, kleur.b];
    });
    gloed.g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  }, [kluizen, nr, lampen, gloed]);
  return (
    <group>
      <Cil r={0.13} rTop={0.08} h={10.6} pos={[MAST[0], 5.3, MAST[1]]} color="#e9e3d8" seg={10} />
      <Blok size={[0.9, 0.12, 0.9]} pos={[MAST[0], 0.06, MAST[1]]} color="#6f757b" r={0.02} />
      <Blok size={[1.4, 0.08, 0.08]} pos={[MAST[0], 10.2, MAST[1]]} color="#e9e3d8" r={0.01} />
      {lampen.map(([id, k], i) => {
        const aan = !!kluizen[`${nr}:${id}`];
        return (
          <group key={id} position={[MAST[0], 9.6 - i * 1.1, MAST[1] - 0.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#2b3034')}>
              <cylinderGeometry args={[0.42, 0.42, 0.2, 18]} />
            </mesh>
            <mesh position={[0, 0, 0.11]}>
              <circleGeometry args={[0.34, 20]} />
              <meshBasicMaterial color={aan ? k : '#2a2d30'} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      <points geometry={gloed.g} material={gloedMat} />
      {/* rode toplamp */}
      <mesh position={[MAST[0], 10.75, MAST[1]]} material={roodLicht}>
        <sphereGeometry args={[0.12, 8, 6]} />
      </mesh>
    </group>
  );
}

/** Poortgebouwtje om de uitgang: twee bakstenen pijlers, een balk met het naambord en hekken langs de kade. */
function Poortgebouw() {
  return (
    <group>
      <Blok size={[1.0, 3.9, 0.4]} pos={[14.1, 1.95, -26.05]} color="#8a4b35" r={0.02} />
      <Blok size={[1.0, 3.9, 0.4]} pos={[18.9, 1.95, -26.05]} color="#8a4b35" r={0.02} />
      <Blok size={[1.15, 0.25, 0.5]} pos={[14.1, 3.98, -26.05]} color="#d8cdb8" r={0.02} />
      <Blok size={[1.15, 0.25, 0.5]} pos={[18.9, 3.98, -26.05]} color="#d8cdb8" r={0.02} />
      <Blok size={[5.9, 0.55, 0.36]} pos={[16.5, 4.35, -26.05]} color="#2f4d6b" r={0.03} />
      <Tekst regels={['DE EENHEID · AAN BOORD']} b={5.2} h={0.42} pos={[16.5, 4.35, -25.86]} o={{ bg: '#2f4d6b', fg: '#f4efe2' }} />
      <Tekst regels={['DE EENHEID · AAN BOORD']} b={5.2} h={0.42} pos={[16.5, 4.35, -26.24]} rot={[0, Math.PI, 0]} o={{ bg: '#2f4d6b', fg: '#f4efe2' }} />
    </group>
  );
}

// ── omgeving: dijk, huisjes, bomen, containerterrein, verre terminal ────

const HUIS_KLEUREN = ['#c9574a', '#e3b04b', '#5b8fb9', '#6f9a6b', '#d98c5f', '#9a6fb0', '#e7dcc6', '#3f6f8a', '#b4443a', '#efe9dc'];

/** Smal huis met puntgevel naar het noorden (naar de haven) en verlichte ramen. */
function Huisje({ pos, b, h, kleur, seed }: { pos: V3; b: number; h: number; kleur: string; seed: number }) {
  const d = 8;
  const dak = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-b / 2 - 0.1, 0);
    s.lineTo(b / 2 + 0.1, 0);
    s.lineTo(0, b * 0.75);
    s.closePath();
    return s;
  }, [b]);
  const rijen = Math.max(2, Math.floor((h - 0.6) / 2.6));
  const kolommen = b > 4.5 ? 2 : 1;
  return (
    <group position={pos}>
      <Blok size={[b, h, d]} pos={[0, h / 2, 0]} color={kleur} r={0.02} />
      <mesh position={[0, h, -d / 2 - 0.05]} material={mat(kleur)} castShadow>
        <extrudeGeometry args={[dak, { depth: d + 0.1, bevelEnabled: false }]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * b) / 4 + 0.03 * s, h + (b * 0.75) / 2 + 0.04, 0]} rotation={[0, 0, s * Math.atan2(b / 2, b * 0.75)]} material={mat('#5a3a30')}>
          <boxGeometry args={[0.08, Math.hypot(b / 2, b * 0.75) + 0.25, d + 0.3]} />
        </mesh>
      ))}
      {Array.from({ length: rijen }, (_, r) =>
        Array.from({ length: kolommen }, (_, c) => {
          const x = kolommen === 2 ? (c - 0.5) * (b * 0.45) : 0;
          const aan = (seed + r * 3 + c) % 3 !== 0;
          return (
            <mesh key={`${r}${c}`} position={[x, 1.4 + r * 2.6, -d / 2 - 0.02]} material={aan ? raamGlas : mat('#2b3540')}>
              <planeGeometry args={[0.9, 1.3]} />
            </mesh>
          );
        }),
      )}
    </group>
  );
}

/** Rij huisjes op de dijk ten zuiden van de haven, en een kerktoren. */
function Dijk() {
  const huizen = useMemo(() => {
    const uit: { x: number; b: number; h: number; k: string; z: number }[] = [];
    let x = -40;
    let i = 0;
    while (x < 40) {
      const b = 4 + ((i * 7) % 3) * 0.9;
      const h = 6 + ((i * 5) % 4) * 1.1;
      uit.push({ x: x + b / 2, b, h, k: HUIS_KLEUREN[(i * 3) % HUIS_KLEUREN.length], z: 30 + ((i * 3) % 2) * 0.6 });
      x += b + 0.15;
      i++;
    }
    return uit;
  }, []);
  return (
    <group>
      {/* dijk: grasrug achter de huizen */}
      <Blok size={[120, 2.4, 10]} pos={[0, 1.0, 41]} color="#4c6e40" r={0.3} shadow={false} />
      {huizen.map((h, i) => (
        <Huisje key={i} pos={[h.x, 0, h.z]} b={h.b} h={h.h} kleur={h.k} seed={i} />
      ))}
      {/* kerktoren */}
      <group position={[-6, 0, 38]}>
        <Blok size={[4.5, 18, 4.5]} pos={[0, 9, 0]} color="#7a4a38" r={0.04} />
        <mesh position={[0, 21, 0]} material={mat('#3b4148')} castShadow>
          <coneGeometry args={[3.3, 6, 4]} />
        </mesh>
        <mesh position={[0, 15, -2.27]}>
          <circleGeometry args={[0.8, 20]} />
          <meshStandardMaterial color="#f4efe2" />
        </mesh>
      </group>
    </group>
  );
}

/** Containerterrein ten oosten van de loodsen: stapels achter een hek. */
function Containerterrein() {
  const stapels = useMemo(() => {
    const uit: { p: V3; k: string; r: number }[] = [];
    let n = 0;
    for (let rij = 0; rij < 5; rij++) {
      for (let kol = 0; kol < 3; kol++) {
        const x = 29.5 + kol * 3.1;
        const z = -12 + rij * 7.2;
        const hoog = 1 + ((rij * 3 + kol * 5) % 3);
        for (let l = 0; l < hoog; l++) uit.push({ p: [x, l * 2.6, z], k: CONTAINER_KLEUREN[(n++ * 7) % 6], r: 0 });
      }
    }
    for (let i = 0; i < 4; i++) uit.push({ p: [16 + i * 3.1, 0, 18.5], k: CONTAINER_KLEUREN[(i * 3) % 6], r: 0 });
    return uit;
  }, []);
  return (
    <group>
      {stapels.map((s, i) => (
        <group key={i} position={s.p}>
          <Blok size={[2.44, 2.59, 6.06]} pos={[0, 1.3, 0]} color={s.k} r={0.03} />
          {[-1, 1].map((k) => (
            <Blok key={k} size={[0.06, 2.3, 5.6]} pos={[k * 1.23, 1.3, 0]} color={s.k} r={0} shadow={false} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Containerterminal ver weg aan de horizon (vlakke silhouetten in de mist). */
function VerreTerminal() {
  const grijs = '#5a6470';
  return (
    <group position={[150, 0, -110]} rotation={[0, -0.45, 0]}>
      <Blok size={[120, 2, 20]} pos={[0, 0, 0]} color="#4f555c" r={0} shadow={false} />
      {[-45, -25, -5, 15, 35].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Blok size={[1.4, 34, 1.4]} pos={[-5, 17, -3]} color={grijs} r={0} shadow={false} />
          <Blok size={[1.4, 34, 1.4]} pos={[5, 17, -3]} color={grijs} r={0} shadow={false} />
          <Blok size={[12, 2.4, 1.6]} pos={[0, 34, -3]} color={grijs} r={0} shadow={false} />
          <Blok size={[2, 2.4, 70]} pos={[0, 36, -18]} rot={[0.12, 0, 0]} color={grijs} r={0} shadow={false} />
          <mesh position={[0, 37.5, -52]} material={roodLicht}>
            <sphereGeometry args={[0.6, 6, 4]} />
          </mesh>
        </group>
      ))}
      {[-40, -10, 20].map((x) => (
        <Blok key={x} size={[22, 8, 14]} pos={[x, 4, 14]} color="#6a6f78" r={0} shadow={false} />
      ))}
    </group>
  );
}

/** Bomen langs de westkant (achter de werf en de visafslag). */
function Bomen() {
  const lijst: { p: V3; s: number; k: string }[] = [];
  const kl = ['#3f6a35', '#4f7d3a', '#355c30', '#5a8a44'];
  for (let i = 0; i < 26; i++) {
    const x = -31 - (i % 4) * 3.4 - ((i * 7) % 5) * 0.6;
    const z = -19 + Math.floor(i / 4) * 7.5 + ((i * 3) % 4);
    lijst.push({ p: [x, 0, z], s: 0.9 + ((i * 13) % 7) * 0.08, k: kl[i % 4] });
  }
  return (
    <>
      {lijst.map((b, i) => (
        <Loofboom key={i} pos={b.p} s={b.s} kleur={b.k} rot={i * 0.7} />
      ))}
    </>
  );
}

/** Helling met een kotter in aanbouw (boeg naar het land), steigerpalen eromheen. */
function Helling() {
  const romp = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.1, 10);
    s.lineTo(-2.1, 2.2);
    s.quadraticCurveTo(-1.9, 0.2, 0, -0.4);
    s.quadraticCurveTo(1.9, 0.2, 2.1, 2.2);
    s.lineTo(2.1, 10);
    s.closePath();
    return s;
  }, []);
  return (
    <group>
      {/* betonnen helling die het water in loopt */}
      <Blok size={[7, 0.4, 10]} pos={[-20, -1.25, -29]} rot={[-0.24, 0, 0]} color="#7c7a74" r={0} shadow={false} />
      {[-21.6, -18.4].map((x) => (
        <Blok key={x} size={[0.12, 0.1, 12]} pos={[x, -1.0, -28.4]} rot={[-0.24, 0, 0]} color="#4a4f52" r={0} shadow={false} />
      ))}
      {/* slede met klossen */}
      <Blok size={[3.4, 0.5, 7.6]} pos={[-19.8, 0.25, -25.7]} color="#5a3a24" r={0.03} />
      {/* romp in rode menie, boeg naar het zuiden */}
      <group position={[-19.8, 0.5, -22.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat('#a8452f')} castShadow receiveShadow>
          <extrudeGeometry args={[romp, { depth: 2.9, bevelEnabled: false }]} />
        </mesh>
        <Blok size={[4.0, 0.08, 9.4]} pos={[0, 2.9, -5.6]} color="#7a5a3a" r={0} />
        <Blok size={[2.6, 1.9, 2.6]} pos={[0, 3.85, -6.2]} color="#c9c2b4" r={0.05} />
        {[-2.6, 2.6].map((x) =>
          [-1.5, -5.5, -9.5].map((z) => (
            <group key={`${x}${z}`}>
              <Blok size={[0.08, 4.4, 0.08]} pos={[x, 2.0, z]} color="#c9cdd0" r={0} />
              <Blok size={[0.6, 0.05, 0.25]} pos={[x * 0.92, 2.9, z]} color="#b98a55" r={0} shadow={false} />
            </group>
          )),
        )}
      </group>
    </group>
  );
}

/** Basaltblokken langs de westkant van het havenhoofd (golfbreker). */
function Basalt() {
  const stenen: V3[] = [];
  for (let i = 0; i < 16; i++) stenen.push([-14.6 - (i % 2) * 0.5, -0.7 - (i % 3) * 0.15, -24.8 - i * 0.6]);
  for (let i = 0; i < 10; i++) stenen.push([-13.6 + i * 0.6, -0.8 - (i % 2) * 0.2, -34.6 - (i % 2) * 0.4]);
  return (
    <>
      {stenen.map((p, i) => (
        <Blok key={i} size={[0.9, 0.9, 0.8]} pos={p} rot={[0.3 * (i % 3), 0.5 * i, 0.2]} color={i % 2 ? '#3b3d40' : '#45474b'} r={0.08} />
      ))}
    </>
  );
}

/** Alles wat stilstaat buiten de kamers, samengevoegd. */
function Landschap() {
  return (
    <Statisch>
      <Terrein plan={PLAN} vorm={LAND} boven="kinderkopjes" bovenKleur="#7d766d" lagen={['#4d4136', '#3f352c', '#332b24', '#28221d']} diepte={3.2} stenen={null} />
      {KADES.map((k, i) => (
        <Kademuur key={i} {...k} />
      ))}
      <Ladder pos={[-8.47, 0, -14.0]} rot={-Math.PI / 2} />
      <Ladder pos={[8.47, 0, 2.6]} rot={Math.PI / 2} />
      <Ladder pos={[22.0, 0, -26.47]} rot={0} />
      {BOLDERS.map(([x, z], i) => (
        <Bolder key={i} pos={[x, 0.06, z]} />
      ))}
      {LANTAARNS.map(([x, z], i) => (
        <Kadelantaarn key={i} pos={[x, 0, z]} />
      ))}
      <TouwRol pos={[-8.9, 0.06, -21.0]} />
      <TouwRol pos={[30.6, 0.06, -24.8]} />
      <TouwRol pos={[-13.2, 0.06, -31.5]} />
      {/* steigers: onderkant, palen en meerpalen */}
      <SteigerOnder x1={-1.5} x2={1.5} z1={-10.0} z2={6} meer={[[1.75, 1.5]]} />
      <SteigerOnder x1={-5.6} x2={-1.5} z1={-4.6} z2={-1.4} meer={[[-5.85, -4.85]]} />
      <SteigerOnder x1={1.5} x2={6.4} z1={-5.0} z2={-1.0} meer={[[6.65, -5.25]]} />
      <SteigerOnder x1={-6.4} x2={6.4} z1={-14.0} z2={-10.0} meer={[[-6.65, -14.25], [6.65, -14.25]]} />
      {/* boten in de havenkom */}
      <Boot pos={[-4.2, WATER_Y + 0.15, -7.5]} rot={Math.PI / 2} L={5.0} B={2.0} romp="#24515a" naam="UK 33" />
      <Boot pos={[4.3, WATER_Y + 0.15, -7.7]} rot={-Math.PI / 2} L={4.6} B={2.1} romp="#3d2e22" hut={false} mast={5.5} />
      <Boot pos={[5.0, WATER_Y + 0.15, 3.2]} rot={0} L={5.4} B={2.2} romp="#2f6f9a" naam="WATERBUS" />
      <Boot pos={[-4.8, WATER_Y + 0.12, 3.3]} rot={Math.PI} L={4.2} B={1.7} romp="#e9e3d8" hut={false} />
      <Kustvaarder />
      <Loopplank />
      <Portaalkraan />
      <OudeKraan />
      <BrugVast />
      <Vuurtoren />
      <Basalt />
      <Helling />
      <KlokkentorenVast />
      <Poortgebouw />
      <Dijk />
      <Containerterrein />
      <VerreTerminal />
      <Bomen />
      {/* kadeplein: banken en fietsen, steeg naast het havenkantoor */}
      <Kadebank pos={[-10.5, 0, 13.3]} rot={Math.PI} />
      <Kadebank pos={[10.5, 0, 13.3]} rot={Math.PI} />
      <Fietsen pos={[-11, 0, 17]} rot={Math.PI / 2} />
      <Fietsen pos={[11, 0, 17.5]} rot={-Math.PI / 2} />
      {/* werf: bouwhekken bij de opgebroken kade (de omleiding) */}
      <Bouwhek pos={[-14.6, 0, -22.9]} l={2.6} />
      <Bouwhek pos={[-10.2, 0, -23.3]} l={2.6} />
    </Statisch>
  );
}

/** Boeien in het vaarwater: dobberen en knipperen. */
const BOEIEN: { p: V2; rood: boolean }[] = [
  { p: [-4, -30], rood: true },
  { p: [4, -38], rood: false },
  { p: [-14, -42], rood: true },
  { p: [40, -32], rood: false },
  { p: [-30, -32], rood: true },
];
function Boeien() {
  const { lijf, lamp } = useMemo(() => {
    const romp = new THREE.CylinderGeometry(0.42, 0.5, 0.9, 10);
    romp.translate(0, 0.25, 0);
    const lijf = new THREE.InstancedMesh(romp, new THREE.MeshStandardMaterial({ roughness: 0.6 }), BOEIEN.length);
    const lamp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), BOEIEN.length);
    BOEIEN.forEach((b, i) => {
      lijf.setColorAt(i, new THREE.Color(b.rood ? '#c0392b' : '#2e8b57'));
      lamp.setColorAt(i, new THREE.Color(b.rood ? '#ff5a4a' : '#5aff8a'));
    });
    lijf.frustumCulled = false;
    lamp.frustumCulled = false;
    return { lijf, lamp };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    BOEIEN.forEach((b, i) => {
      const y = WATER_Y - 0.15 + Math.sin(t * 1.3 + i * 1.7) * 0.08;
      o.position.set(b.p[0], y, b.p[1]);
      o.rotation.set(Math.sin(t * 0.9 + i) * 0.08, 0, Math.cos(t * 1.1 + i * 2) * 0.08);
      o.scale.setScalar(1);
      o.updateMatrix();
      lijf.setMatrixAt(i, o.matrix);
      o.position.y = y + 1.0;
      o.scale.setScalar((t + i * 0.37) % 2.4 < 0.7 ? 1.4 : 0.6);
      o.updateMatrix();
      lamp.setMatrixAt(i, o.matrix);
    });
    lijf.instanceMatrix.needsUpdate = true;
    lamp.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <primitive object={lijf} />
      <primitive object={lamp} />
    </>
  );
}

/** Meeuwen die rondjes vliegen boven het water. */
const MEEUWEN: { c: V2; r: number; h: number; w: number }[] = [
  { c: [0, -24], r: 7, h: 9.5, w: 0.32 },
  { c: [22, -32], r: 6, h: 12, w: -0.38 },
  { c: [-18, -30], r: 5.5, h: 8, w: 0.4 },
  { c: [2, -4], r: 5, h: 11, w: -0.3 },
  { c: [-30, -36], r: 8, h: 14, w: 0.25 },
];
function Meeuwen() {
  const { lijf, vleugel } = useMemo(() => {
    const romp = new THREE.SphereGeometry(1, 8, 6);
    romp.scale(0.13, 0.12, 0.38);
    const lijf = new THREE.InstancedMesh(romp, new THREE.MeshStandardMaterial({ color: '#f4f4ef', roughness: 0.7 }), MEEUWEN.length);
    const v = new THREE.BoxGeometry(0.85, 0.025, 0.3);
    v.translate(0.45, 0, 0);
    const vleugel = new THREE.InstancedMesh(v, new THREE.MeshStandardMaterial({ color: '#c9ced2', roughness: 0.7, side: THREE.DoubleSide }), MEEUWEN.length * 2);
    lijf.frustumCulled = false;
    vleugel.frustumCulled = false;
    return { lijf, vleugel };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const w = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    MEEUWEN.forEach((m, i) => {
      const a = t * m.w + i * 1.9;
      o.position.set(m.c[0] + Math.cos(a) * m.r, m.h + Math.sin(t * 0.7 + i) * 0.5, m.c[1] + Math.sin(a) * m.r);
      const dx = -Math.sin(a) * Math.sign(m.w);
      const dz = Math.cos(a) * Math.sign(m.w);
      o.rotation.set(0, Math.atan2(dx, dz), -Math.sign(m.w) * 0.25);
      o.updateMatrix();
      lijf.setMatrixAt(i, o.matrix);
      const slag = (Math.sin(t * 5 + i * 2) > -0.2 ? Math.sin(t * 7 + i) * 0.55 : 0.12) + 0.1;
      for (const k of [-1, 1]) {
        w.position.set(0, 0.04, 0);
        w.rotation.set(0, 0, k * slag);
        w.scale.set(k, 1, 1);
        w.updateMatrix();
        w.matrix.premultiply(o.matrix);
        vleugel.setMatrixAt(i * 2 + (k > 0 ? 1 : 0), w.matrix);
      }
    });
    lijf.instanceMatrix.needsUpdate = true;
    vleugel.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <primitive object={lijf} />
      <primitive object={vleugel} />
    </>
  );
}

export function Wereld1Omgeving() {
  return (
    <>
      <FaseSfeer />
      <Luchtkoepel />
      <Landschap />
      <Water pos={[0, -70]} maat={[460, 300]} y={WATER_Y} kleur="#24607a" diep="#0b2a3a" zijkant={false} golf={0.9} />
      <Ophaalbrug />
      <KraanKat />
      <KlokkentorenLevend />
      <Seinmast />
      <Lichtbundel />
      <Boeien />
      <Meeuwen />
    </>
  );
}
