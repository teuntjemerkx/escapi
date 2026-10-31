// Wereld 5 – de buitenruimtes van Meetstation Noorderlicht: voorplein, tankplaats, meetveld en het
// helikopterplatform achter de uitgang (op poten boven de afgrond). Vaste delen worden samengevoegd
// (BuitenVast in <Statisch>); draaiende en knipperende delen staan in BuitenLevend. Plekken en botsingen: gebouw.json.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Blok, Cil, mat } from '../game/kit';
import { useSpel } from '../game/store';
import { useTextuur } from '../game/tekst';
import { gloedTex } from '../game/texturen';
import { HV, plek } from './huis';
import { LETTER, ROND, tekst, vlak, virtueel } from './teken';

type V3 = [number, number, number];

const WIT = '#f1f4f8';
const SNEEUW = '#eef3f8';
const glasMat = new THREE.MeshStandardMaterial({ color: '#22364a', roughness: 0.15, metalness: 0.3 });
const lichtGeel = new THREE.MeshBasicMaterial({ color: '#fff3c4', toneMapped: false });
const lichtRood = new THREE.MeshBasicMaterial({ color: '#ff4d4d', toneMapped: false });
const lichtGroen = new THREE.MeshBasicMaterial({ color: '#69f0a0', toneMapped: false });
const luifelLicht = new THREE.MeshBasicMaterial({ color: '#b8b09c', toneMapped: false });

/** Vlakke vorm op de grond (x/z), iets boven de vloer. */
function opGrond(g: THREE.BufferGeometry, y: number) {
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  return g;
}

/** Bord met een plaatje erop (naar +z). `licht` = verlicht bord (altijd goed te zien). */
function Bord({ b, h, teken, sleutel, pos, licht = false, ppm = 160 }: { b: number; h: number; teken: (ctx: CanvasRenderingContext2D, W: number, H: number) => void; sleutel: string; pos: V3; licht?: boolean; ppm?: number }) {
  const tex = useTextuur(b, h, virtueel(b, teken), sleutel, ppm);
  return (
    <mesh position={pos}>
      <planeGeometry args={[b, h]} />
      {licht ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshStandardMaterial map={tex} roughness={0.8} />}
    </mesh>
  );
}

// ───────────────────────── Voorplein ─────────────────────────

function Welkomstbord() {
  const [x, z] = plek('welkomstbord');
  return (
    <group position={[x, 0, z]}>
      {[-1.25, 1.25].map((px) => (
        <Blok key={px} size={[0.14, 2.1, 0.14]} pos={[px, 1.05, 0]} color="#5b3d27" r={0} />
      ))}
      <Blok size={[2.75, 1.1, 0.1]} pos={[0, 1.5, -0.02]} color="#4a3220" r={0} />
      <Blok size={[2.85, 0.14, 0.26]} pos={[0, 2.1, 0]} color={SNEEUW} r={0.06} shadow={false} />
      <Bord
        b={2.55}
        h={0.92}
        pos={[0, 1.5, 0.04]}
        sleutel="w5-welkom"
        teken={(ctx, W, H) => {
          vlak(ctx, 0, 0, W, H, '#f4ead2', 24);
          tekst(ctx, 'MEETSTATION', W / 2, 92, { px: 92, kleur: '#2f4a6b', gewicht: 800, uitlijn: 'center', font: ROND });
          tekst(ctx, 'Noorderlicht', W / 2, 205, { px: 78, kleur: '#4a3220', gewicht: 700, uitlijn: 'center', font: LETTER });
          tekst(ctx, 'hoogte 2450 m', W / 2, 305, { px: 58, kleur: '#2f4a6b', gewicht: 700, uitlijn: 'center' });
          void H;
        }}
      />
    </group>
  );
}

function Sneeuwscooter() {
  const [x, z] = plek('sneeuwscooter');
  return (
    <group position={[x, 0, z]} rotation={[0, 0.12, 0]}>
      {/* ski's en rupsband */}
      {[-0.42, 0.42].map((dz) => (
        <group key={dz}>
          <Blok size={[1.1, 0.05, 0.14]} pos={[0.85, 0.06, dz]} color="#1d2024" r={0} />
          <Blok size={[0.08, 0.38, 0.06]} pos={[0.75, 0.25, dz]} color="#1d2024" r={0} />
        </group>
      ))}
      <Blok size={[1.4, 0.34, 0.5]} pos={[-0.45, 0.22, 0]} color="#2b2f35" r={0.1} />
      {/* kap, zadel, stuur en ruit */}
      <Blok size={[2.0, 0.5, 0.86]} pos={[0.05, 0.6, 0]} color="#d6402b" r={0.2} />
      <Blok size={[0.95, 0.2, 0.55]} pos={[-0.55, 0.94, 0]} color="#1d2024" r={0.08} />
      <Blok size={[0.05, 0.05, 0.75]} pos={[0.22, 1.1, 0]} color="#1d2024" r={0} />
      <mesh position={[0.45, 1.12, 0]} rotation={[0, 0, -0.5]} material={glasMat}>
        <boxGeometry args={[0.04, 0.4, 0.7]} />
      </mesh>
      <mesh position={[1.07, 0.66, 0]} material={lichtGeel}>
        <boxGeometry args={[0.04, 0.12, 0.32]} />
      </mesh>
    </group>
  );
}

function Sneeuwpop() {
  const [x, z] = plek('sneeuwpop');
  const sneeuw = mat(SNEEUW, { rough: 0.95, flat: true });
  return (
    <group position={[x, 0, z]} rotation={[0, 0.4, 0]}>
      {[
        [0.46, 0.42],
        [0.34, 1.08],
        [0.25, 1.58],
      ].map(([r, y]) => (
        <mesh key={y} position={[0, y, 0]} material={sneeuw} castShadow>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
      <mesh position={[0, 1.58, 0.3]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f08c00')}>
        <coneGeometry args={[0.05, 0.26, 8]} />
      </mesh>
      {[-0.09, 0.09].map((ex) => (
        <mesh key={ex} position={[ex, 1.66, 0.22]} material={mat('#1d2024')}>
          <sphereGeometry args={[0.03, 6, 5]} />
        </mesh>
      ))}
      <Cil r={0.2} h={0.05} pos={[0, 1.8, 0]} color="#1d2024" seg={14} />
      <Cil r={0.14} h={0.26} pos={[0, 1.94, 0]} color="#1d2024" seg={14} />
      <mesh position={[0, 1.36, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#c92a2a')}>
        <torusGeometry args={[0.24, 0.06, 6, 16]} />
      </mesh>
      {[-1, 1].map((k) => (
        <Blok key={k} size={[0.6, 0.04, 0.04]} pos={[k * 0.5, 1.2, 0]} rot={[0, 0, k * 0.5]} color="#5b3d27" r={0} />
      ))}
    </group>
  );
}

/** Voetstappen van de sneeuwscooter naar de voordeur. */
function Voetstappen() {
  const [sx, sz] = plek('sneeuwscooter');
  const stappen = useMemo(() => {
    const van: [number, number] = [sx - 1.1, sz - 0.6];
    const naar: [number, number] = [0.3, 12.6];
    const n = 11;
    const hoek = Math.atan2(naar[0] - van[0], naar[1] - van[1]);
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const k = i % 2 ? 1 : -1;
      return { x: van[0] + (naar[0] - van[0]) * t + Math.cos(hoek) * 0.13 * k, z: van[1] + (naar[1] - van[1]) * t - Math.sin(hoek) * 0.13 * k, hoek };
    });
  }, [sx, sz]);
  return (
    <>
      {stappen.map((s, i) => (
        <mesh key={i} position={[s.x, 0.012, s.z]} rotation={[0, s.hoek, 0]} scale={[1, 1, 1.7]} material={mat('#b9c6d6', { rough: 1 })} receiveShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.01, 8]} />
        </mesh>
      ))}
    </>
  );
}


/** Hoopje opgeschoven sneeuw. */
function Sneeuwhoop({ pos, s = 1 }: { pos: [number, number]; s?: number }) {
  return (
    <mesh position={[pos[0], 0, pos[1]]} scale={[s, s * 0.55, s * 0.9]} material={mat(SNEEUW, { flat: true, rough: 1 })} castShadow receiveShadow>
      <icosahedronGeometry args={[0.7, 1]} />
    </mesh>
  );
}

// ───────────────────────── Tankplaats ─────────────────────────

function Pomp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.16, z]}>
      <Blok size={[0.72, 1.5, 0.46]} pos={[0, 0.75, 0]} color="#e9edf1" r={0.06} />
      <Blok size={[0.74, 0.22, 0.48]} pos={[0, 1.42, 0]} color="#1f5aa6" r={0.05} />
      <mesh position={[0, 1.05, 0.235]} material={glasMat}>
        <planeGeometry args={[0.5, 0.3]} />
      </mesh>
      <Blok size={[0.1, 0.3, 0.1]} pos={[0.3, 0.7, 0.26]} color="#1d2024" r={0} />
      <Blok size={[0.03, 0.6, 0.03]} pos={[0.38, 0.45, 0.3]} color="#1d2024" r={0} />
    </group>
  );
}

/** Pompeiland met één pomp onder een luifel met lichtvlak en naambord. */
function Luifel() {
  const [x, z] = plek('pompeiland');
  return (
    <group position={[x, 0, z]}>
      <Blok size={[3.2, 0.16, 1.0]} pos={[0, 0.08, 0]} color="#a3a9b1" r={0} />
      <Blok size={[3.22, 0.06, 1.02]} pos={[0, 0.03, 0]} color="#f2c230" r={0} shadow={false} />
      <Pomp x={-0.6} z={0} />
      <Blok size={[0.5, 0.9, 0.5]} pos={[0.8, 0.6, 0]} color="#c92a2a" r={0} />
      {[-1.45, 1.45].map((px) => (
        <Blok key={px} size={[0.24, 3.9, 0.24]} pos={[px, 2.1, 0]} color="#d8dde3" r={0} />
      ))}
      <group position={[0, 4.1, 0.4]}>
        <Blok size={[4.4, 0.5, 2.8]} pos={[0, 0.2, 0]} color="#1f5aa6" r={0.05} />
        <Blok size={[4.5, 0.14, 2.9]} pos={[0, 0.51, 0]} color={SNEEUW} r={0.05} shadow={false} />
        <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={luifelLicht}>
          <planeGeometry args={[4.0, 2.4]} />
        </mesh>
        <Bord
          b={2.6}
          h={0.36}
          pos={[0, 0.2, 1.405]}
          licht
          sleutel="w5-tanken"
          teken={(ctx, W, H) => {
            vlak(ctx, 0, 0, W, H, '#1f5aa6');
            tekst(ctx, 'TANKSTATION', W / 2, H / 2 + 4, { px: 100, kleur: '#ffffff', gewicht: 800, uitlijn: 'center', font: ROND });
          }}
        />
      </group>
    </group>
  );
}

/** Sneeuwruimer (rupsbanden, cabine, schuif), lengte langs x, schuif naar +x. */
function Sneeuwruimer() {
  const [x, z] = plek('sneeuwruimer');
  return (
    <group position={[x, 0, z]}>
      {[-0.78, 0.78].map((pz) => (
        <group key={pz}>
          <Blok size={[3.0, 0.62, 0.42]} pos={[-0.2, 0.31, pz]} color="#2b2f35" r={0.26} />
          {[-1.3, -0.45, 0.4, 0.9].map((px) => (
            <Cil key={px} r={0.2} h={0.44} pos={[px, 0.3, pz]} rot={[Math.PI / 2, 0, 0]} color="#495057" seg={10} />
          ))}
        </group>
      ))}
      <Blok size={[2.9, 0.55, 1.4]} pos={[-0.25, 0.85, 0]} color="#d6402b" r={0.12} />
      <Blok size={[1.35, 0.95, 1.3]} pos={[0.45, 1.6, 0]} color="#d6402b" r={0.12} />
      <Blok size={[1.38, 0.5, 1.32]} pos={[0.5, 1.72, 0]} color="#22364a" r={0.08} rough={0.2} />
      <Blok size={[0.3, 0.12, 1.2]} pos={[0.45, 2.14, 0]} color="#f2c230" r={0} />
      <Blok size={[1.2, 0.1, 1.15]} pos={[0.45, 2.22, 0]} color={SNEEUW} r={0} shadow={false} />
      <Blok size={[0.12, 0.75, 2.1]} pos={[1.6, 0.45, 0]} rot={[0, 0, -0.25]} color="#f2c230" r={0} />
    </group>
  );
}

// ───────────────────────── Meetveld ─────────────────────────

function Weerhut() {
  const [x, z] = plek('weerhut');
  return (
    <group position={[x, 0, z]}>
      {[-0.28, 0.28].map((px) =>
        [-0.22, 0.22].map((pz) => <Blok key={`${px}${pz}`} size={[0.06, 1.15, 0.06]} pos={[px, 0.57, pz]} color="#e9ecef" r={0} />),
      )}
      <Blok size={[0.72, 0.62, 0.56]} pos={[0, 1.45, 0]} color={WIT} r={0} />
      {Array.from({ length: 6 }, (_, i) => (
        <Blok key={i} size={[0.64, 0.025, 0.04]} pos={[0, 1.2 + i * 0.1, 0.29]} rot={[0.5, 0, 0]} color="#c3c8cf" r={0} shadow={false} />
      ))}
      <Blok size={[0.84, 0.06, 0.68]} pos={[0, 1.79, 0]} color="#dee2e6" r={0} />
      <Blok size={[0.8, 0.07, 0.64]} pos={[0, 1.85, 0]} color={SNEEUW} r={0} shadow={false} />
    </group>
  );
}

/** Windmast van 10 m met een dwarsarm (de windmeter draait in BuitenLevend). */
export const MAST_H = 10;
function Windmast() {
  const [x, z] = plek('windmast');
  return (
    <group position={[x, 0, z]}>
      <Blok size={[0.6, 0.25, 0.6]} pos={[0, 0.12, 0]} color="#8d929a" r={0} />
      <Cil r={0.07} rTop={0.045} h={MAST_H} pos={[0, MAST_H / 2, 0]} color="#c3c8cf" seg={8} />
      <Blok size={[1.4, 0.05, 0.05]} pos={[0, MAST_H - 0.4, 0]} color="#adb5bd" r={0} />
      <Blok size={[0.05, 0.05, 0.6]} pos={[-0.65, MAST_H - 0.4, -0.25]} color="#495057" r={0} />
      <Blok size={[0.3, 0.2, 0.02]} pos={[-0.65, MAST_H - 0.4, -0.55]} color="#e8590c" r={0} />
      {/* spankabels */}
      {[0, 1, 2].map((i) => {
        const a = (i * Math.PI * 2) / 3 + 0.4;
        const l = Math.hypot(MAST_H * 0.6, 1.6);
        return <Blok key={i} size={[0.012, l, 0.012]} pos={[Math.cos(a) * 0.8, MAST_H * 0.3, Math.sin(a) * 0.8]} rot={[Math.sin(a) * 0.26, 0, -Math.cos(a) * 0.26]} color="#868e96" r={0} shadow={false} />;
      })}
    </group>
  );
}

function Regenmeter() {
  const [x, z] = plek('regenmeter');
  return (
    <group position={[x, 0, z]}>
      <Cil r={0} h={1.0} pos={[0, 0.5, 0]} color="#868e96" seg={8} />
      <Cil r={0.12} h={0.4} pos={[0, 1.2, 0]} color="#e9ecef" seg={14} />
      <Cil r={0.13} h={0.03} pos={[0, 1.41, 0]} color={SNEEUW} seg={14} />
    </group>
  );
}

function Zonnepanelen() {
  const [x, z] = plek('zonnepanelen');
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#16305c';
    ctx.fillRect(0, 0, 256, 160);
    ctx.strokeStyle = '#7f9cc9';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo((i * 256) / 8, 0);
      ctx.lineTo((i * 256) / 8, 160);
      ctx.stroke();
    }
    for (let j = 0; j <= 5; j++) {
      ctx.beginPath();
      ctx.moveTo(0, (j * 160) / 5);
      ctx.lineTo(256, (j * 160) / 5);
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  const cel = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.35 }), [tex]);
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
      {[-1.2, 0, 1.2].map((px) => (
        <group key={px} position={[px, 0, 0]}>
          <Blok size={[0.06, 0.55, 0.06]} pos={[-0.45, 0.27, 0.3]} color="#868e96" r={0} />
          <Blok size={[0.06, 0.55, 0.06]} pos={[0.45, 0.27, 0.3]} color="#868e96" r={0} />
          <Blok size={[0.06, 1.0, 0.06]} pos={[-0.45, 0.5, -0.28]} color="#868e96" r={0} />
          <Blok size={[0.06, 1.0, 0.06]} pos={[0.45, 0.5, -0.28]} color="#868e96" r={0} />
          <group position={[0, 0.8, 0.02]} rotation={[0.62, 0, 0]}>
            <Blok size={[1.12, 0.05, 0.9]} pos={[0, -0.03, 0]} color="#c3c8cf" r={0} />
            <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={cel}>
              <planeGeometry args={[1.06, 0.84]} />
            </mesh>
            <Blok size={[1.0, 0.04, 0.3]} pos={[0, 0.03, -0.25]} color={SNEEUW} r={0} shadow={false} />
          </group>
        </group>
      ))}
    </group>
  );
}

/** Vlonderpad van de deur van de pauzeruimte naar het weerscherm. */
function Vlonderpad() {
  return (
    <group>
      {Array.from({ length: 22 }, (_, i) => (
        <Blok key={i} size={[0.26, 0.06, 1.0]} pos={[16.35 + i * 0.29, 0.04, -0.75]} color={i % 3 ? '#8d6b4a' : '#7d5e40'} r={0} />
      ))}
      <Blok size={[6.4, 0.04, 0.06]} pos={[19.5, 0.02, -0.27]} color="#5c4630" r={0} shadow={false} />
      <Blok size={[6.4, 0.04, 0.06]} pos={[19.5, 0.02, -1.23]} color="#5c4630" r={0} shadow={false} />
    </group>
  );
}

/** Sneeuwpeilstok met rood-witte banden (sneeuwhoogte aflezen). */
function Sneeuwpeil({ pos }: { pos: [number, number] }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      {Array.from({ length: 10 }, (_, i) => (
        <Blok key={i} size={[0.06, 0.25, 0.06]} pos={[0, 0.125 + i * 0.25, 0]} color={i % 2 ? WIT : '#e03131'} r={0} />
      ))}
    </group>
  );
}

// ───────────────────────── Helikopterplatform ─────────────────────────

/** Midden van de grote H. */
const H_MIDDEN: [number, number] = [0, -15.8];
/** Waar de rots ophoudt: het stuk platform daarachter staat op stalen poten boven de afgrond. */
export const RICHEL_NOORD = -19.2;
function Platform() {
  const [hx, hz] = H_MIDDEN;
  const cirkel = useMemo(() => opGrond(new THREE.RingGeometry(4.0, 4.3, 56), 0.018).translate(hx, 0, hz), [hx, hz]);
  const lampjes = useMemo(() => {
    const uit: [number, number][] = [];
    for (let i = 0; i <= 6; i++) uit.push([-5.75 + (i * 11.5) / 6, -21.75]);
    for (let j = 0; j < 6; j++) {
      const z = -10.5 - (j * 11.25) / 6;
      uit.push([-5.75, z], [5.75, z]);
    }
    return uit;
  }, []);
  return (
    <>
      <mesh geometry={cirkel} material={mat('#f2c230', { rough: 0.8 })} receiveShadow />
      <Blok size={[0.7, 0.012, 4.2]} pos={[hx - 1.25, 0.02, hz]} color={WIT} r={0} shadow={false} />
      <Blok size={[0.7, 0.012, 4.2]} pos={[hx + 1.25, 0.02, hz]} color={WIT} r={0} shadow={false} />
      <Blok size={[1.8, 0.012, 0.7]} pos={[hx, 0.02, hz]} color={WIT} r={0} shadow={false} />
      {lampjes.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.06, z]} material={lichtGroen}>
          <cylinderGeometry args={[0.07, 0.09, 0.12, 8]} />
        </mesh>
      ))}
      {/* paal van de windzak */}
      <Cil r={0.05} h={3.6} pos={[plek('windzak')[0], 1.8, plek('windzak')[1]]} color="#adb5bd" seg={8} />
      {/* het stuk boven de afgrond: stalen dek met poten en schoren */}
      <Blok size={[12.4, 0.5, 22.2 + RICHEL_NOORD + 0.7]} pos={[0, -0.27, (RICHEL_NOORD + 0.7 - 22.2) / 2]} color="#3d434a" r={0} />
      {[-5.6, -1.9, 1.9, 5.6].map((x) => (
        <group key={x}>
          <Blok size={[0.3, 16, 0.3]} pos={[x, -8.4, -21.6]} color="#4a5058" r={0} />
          <Blok size={[0.18, 7.4, 0.18]} pos={[x, -3.6, -20.4]} rot={[0.5, 0, 0]} color="#4a5058" r={0} />
        </group>
      ))}
      <Blok size={[11.6, 0.2, 0.2]} pos={[0, -4.0, -21.6]} color="#4a5058" r={0} />
    </>
  );
}

function HelikopterRomp() {
  const [x, z] = plek('helikopter');
  const rood = '#d23c2b';
  return (
    <group position={[x + 0.2, 0, z]}>
      {[-0.85, 0.85].map((pz) => (
        <group key={pz}>
          <Cil r={0.05} h={3.1} pos={[0, 0.08, pz]} rot={[0, 0, Math.PI / 2]} color="#3d4249" seg={8} />
          {[-0.8, 0.7].map((px) => (
            <Blok key={px} size={[0.07, 0.62, 0.07]} pos={[px, 0.38, pz * 0.82]} rot={[pz > 0 ? -0.3 : 0.3, 0, 0]} color="#3d4249" r={0} />
          ))}
        </group>
      ))}
      <Blok size={[2.7, 1.35, 1.45]} pos={[-0.1, 1.25, 0]} color={rood} r={0.5} />
      <Blok size={[2.72, 0.2, 1.47]} pos={[-0.1, 0.95, 0]} color={WIT} r={0.08} />
      <mesh position={[1.25, 1.32, 0]} scale={[1.0, 0.95, 1.1]} material={glasMat}>
        <sphereGeometry args={[0.66, 14, 10, 0, Math.PI * 2, 0, Math.PI]} />
      </mesh>
      <mesh position={[-3.0, 1.55, 0]} rotation={[0, 0, Math.PI / 2 - 0.05]} material={mat(rood)} castShadow>
        <cylinderGeometry args={[0.1, 0.2, 3.6, 10]} />
      </mesh>
      <Blok size={[0.75, 1.0, 0.08]} pos={[-4.75, 1.95, 0]} rot={[0, 0, -0.35]} color={rood} r={0} />
      <Blok size={[0.9, 0.06, 0.08]} pos={[-4.5, 1.55, 0]} color={WIT} r={0} />
      <Cil r={0.14} h={0.45} pos={[-0.1, 2.12, 0]} color="#3d4249" seg={10} />
      <Blok size={[1.0, 0.16, 0.7]} pos={[-0.3, 2.0, 0]} color="#3d4249" r={0.06} />
      <Blok size={[1.6, 0.08, 0.9]} pos={[-0.3, 2.06, 0]} color={SNEEUW} r={0} shadow={false} />
    </group>
  );
}

/** Alles wat vast staat (wordt samengevoegd). */
export function BuitenVast() {
  return (
    <>
      {/* voorplein */}
      <Welkomstbord />
      <Sneeuwscooter />
      <Sneeuwpop />
      <Voetstappen />
      <Sneeuwhoop pos={[-9.0, 13.2]} s={0.9} />
      <Sneeuwhoop pos={[8.9, 12.8]} s={0.8} />
      <Sneeuwhoop pos={[3.3, 9.6]} s={0.6} />
      {/* tankplaats */}
      <Luifel />
      <Sneeuwruimer />
      <Sneeuwhoop pos={plek('sneeuwhoop tank')} s={1.2} />
      {/* meetveld */}
      <Weerhut />
      <Windmast />
      <Regenmeter />
      <Zonnepanelen />
      <Vlonderpad />
      <Sneeuwpeil pos={[17.2, -4.9]} />
      {/* helikopterplatform */}
      <Platform />
      <HelikopterRomp />
    </>
  );
}

// ───────────────────────── Levend: draaien en knipperen ─────────────────────────

/** Rode luchtvaartlichten (knipperen samen; twee tekenstappen voor alles). */
function Knipperlichten({ punten }: { punten: V3[] }) {
  const lamp = useRef<THREE.Mesh>(null);
  const gloed = useRef<THREE.Points>(null);
  const { bollen, plekken } = useMemo(() => {
    const bollen = mergeGeometries(
      punten.map((p) => {
        const g = new THREE.SphereGeometry(0.14, 10, 8);
        g.translate(...p);
        return g;
      }),
    )!;
    const plekken = new THREE.BufferGeometry();
    plekken.setAttribute('position', new THREE.Float32BufferAttribute(punten.flat(), 3));
    return { bollen, plekken };
  }, [punten]);
  const gloedMat = useMemo(
    () => new THREE.PointsMaterial({ map: gloedTex(), color: '#ff3b30', size: 2.4, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }),
    [],
  );
  useFrame(({ clock }) => {
    const aan = clock.getElapsedTime() % 1.6 < 0.55;
    if (lamp.current) lamp.current.visible = aan;
    if (gloed.current) gloed.current.visible = aan;
  });
  return (
    <>
      <mesh ref={lamp} geometry={bollen} material={lichtRood} />
      <points ref={gloed} geometry={plekken} material={gloedMat} frustumCulled={false} />
    </>
  );
}

/** Groene gloed rond de randlichten van het platform (één tekenstap). */
function PlatformGloed() {
  const geo = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i <= 6; i++) p.push(-5.75 + (i * 11.5) / 6, 0.15, -21.75);
    for (let j = 0; j < 6; j++) {
      const z = -10.5 - (j * 11.25) / 6;
      p.push(-5.75, 0.15, z, 5.75, 0.15, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  const m = useMemo(
    () => new THREE.PointsMaterial({ map: gloedTex(), color: '#4dff9a', size: 0.9, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    [],
  );
  return <points geometry={geo} material={m} frustumCulled={false} />;
}

/** Windmeter met drie bakjes bovenop de windmast. */
function Windmeter() {
  const [x, z] = plek('windmast');
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const delen: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const arm = new THREE.BoxGeometry(0.34, 0.02, 0.02);
      arm.translate(0.17, 0, 0);
      arm.rotateY(a);
      const bak = new THREE.SphereGeometry(0.07, 8, 6, 0, Math.PI);
      bak.rotateY(Math.PI / 2);
      bak.translate(0.34, 0, 0);
      bak.rotateY(a);
      delen.push(arm.toNonIndexed(), bak.toNonIndexed());
    }
    return mergeGeometries(delen)!;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 4;
  });
  return (
    <group ref={ref} position={[x + 0.62, MAST_H - 0.25, z]}>
      <mesh geometry={geo} material={mat('#495057')} />
    </group>
  );
}

/** Rotor van de helikopter: staat stil, en draait als de uitgang open is (je mag naar huis). */
function Rotors() {
  const [x, z] = plek('helikopter');
  const klaar = useSpel((s) => s.fase === 'klaar');
  const hoofd = useRef<THREE.Group>(null);
  const staart = useRef<THREE.Group>(null);
  const snel = useRef(0);
  const { blad, klein } = useMemo(() => {
    const b = [0, 1, 2, 3].map((i) => {
      const g = new THREE.BoxGeometry(4.4, 0.04, 0.26);
      g.translate(2.2, 0, 0);
      g.rotateY((i * Math.PI) / 2 + 0.3);
      return g.toNonIndexed();
    });
    const k = [0, 1].map((i) => {
      const g = new THREE.BoxGeometry(0.08, 0.9, 0.03);
      g.rotateZ(i * Math.PI);
      return g.toNonIndexed();
    });
    return { blad: mergeGeometries(b)!, klein: mergeGeometries(k)! };
  }, []);
  useFrame((_, dt) => {
    snel.current += ((klaar ? 14 : 0) - snel.current) * Math.min(1, dt * 0.6);
    if (hoofd.current) hoofd.current.rotation.y += dt * snel.current;
    if (staart.current) staart.current.rotation.z += dt * snel.current * 1.6;
  });
  return (
    <group position={[x + 0.2, 0, z]}>
      <group ref={hoofd} position={[-0.1, 2.38, 0]}>
        <mesh geometry={blad} material={mat('#2b2f35')} castShadow />
      </group>
      <group ref={staart} position={[-4.85, 1.95, 0.1]}>
        <mesh geometry={klein} material={mat('#2b2f35')} />
      </group>
    </group>
  );
}

/** Windzak die heen en weer zwaait (oranje-witte banen in één vorm). */
const zakMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide });
function Windzak() {
  const [x, z] = plek('windzak');
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const delen = [0, 1, 2].map((i) => {
      const g = new THREE.CylinderGeometry(0.24 - i * 0.05, 0.29 - i * 0.05, 0.36, 10, 1, true).toNonIndexed();
      g.rotateZ(Math.PI / 2);
      g.translate(0.3 + i * 0.36, 0, 0);
      const k = new THREE.Color(i % 2 ? WIT : '#f76707');
      const n = g.attributes.position.count;
      g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n * 3 }, (_, j) => [k.r, k.g, k.b][j % 3]), 3));
      return g;
    });
    return mergeGeometries(delen)!;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = 2.4 + Math.sin(t * 0.7) * 0.35;
      ref.current.rotation.z = -0.12 + Math.sin(t * 1.9) * 0.05;
    }
  });
  return (
    <group ref={ref} position={[x, 3.45, z]}>
      <mesh geometry={geo} material={zakMat} />
    </group>
  );
}

const LICHTEN: V3[] = [
  [13.6, HV + 3.2 + 0.08 + 6.85, -8.6],
  [plek('windmast')[0], MAST_H + 0.15, plek('windmast')[1]],
];

export function BuitenLevend() {
  return (
    <>
      <Knipperlichten punten={LICHTEN} />
      <PlatformGloed />
      <Windmeter />
      <Rotors />
      <Windzak />
    </>
  );
}
