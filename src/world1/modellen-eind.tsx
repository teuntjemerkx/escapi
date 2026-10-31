// 3D-objecten voor de eindcheck (eindtest uit het werkboek), in de vertrekhal bij de poort.
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { P } from '../game/palette';
import { FONT, rondRect, useTextuur } from '../game/tekst';
import { Keukenweegschaal, Poppetje, Tekst } from './bouw';

type V3 = [number, number, number];

/** EIN-01: pak koffie van 500 gram; een kaartje "8 kopjes = 60 gram" en een blad met kopjes. */
export function Koffie() {
  return (
    <group>
      <group>
        {/* pak koffie */}
        <group position={[-0.32, 0, -0.05]}>
          <Blok size={[0.16, 0.26, 0.1]} pos={[0, 0.13, 0]} color="#3b2a20" r={0.012} />
          <Blok size={[0.16, 0.04, 0.06]} pos={[0, 0.28, 0]} color="#3b2a20" r={0.01} />
          <Tekst regels={['KOFFIE', '500 gram']} b={0.15} h={0.13} pos={[0, 0.14, 0.051]} o={{ bg: '#3b2a20', fg: '#f2d9a8', kop: true }} />
        </group>
        {/* koffiezetapparaat */}
        <group position={[0.05, 0, -0.15]}>
          <Blok size={[0.2, 0.32, 0.18]} pos={[0, 0.16, 0]} color="#2f3634" r={0.03} />
          <Cil r={0.06} h={0.1} pos={[0, 0.06, 0.06]} color="#e6f4f7" seg={14} />
        </group>
        {/* dienblad met kopjes */}
        <group position={[0.3, 0, 0.08]}>
          <Blok size={[0.38, 0.015, 0.26]} pos={[0, 0.008, 0]} color="#8a5a32" r={0.006} />
          {Array.from({ length: 8 }, (_, i) => (
            <group key={i} position={[-0.135 + (i % 4) * 0.09, 0.015, -0.05 + Math.floor(i / 4) * 0.1]}>
              <Cil r={0.03} rTop={0.034} h={0.045} pos={[0, 0.022, 0]} color="#fbfaf6" seg={12} />
            </group>
          ))}
        </group>
        <Tekst regels={['8 kopjes = 60 gram']} b={0.5} h={0.12} pos={[0.1, 0.12, 0.3]} rot={[-0.5, 0, 0]} o={{ bg: '#fbf7ee', rand: '#3b2a20' }} />
      </group>
    </group>
  );
}

/** EIN-02: witte schaal met blauwe bessen (2,7 kg) en lege bakjes van 250 g. Een merel pikt een bes. */
export function Bessen() {
  const n = 70;
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const r = seeded(31);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.17;
      o.position.set(Math.cos(a) * d, 0.17 + r() * 0.04 - d * 0.15, Math.sin(a) * d);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  const merel = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (merel.current) merel.current.rotation.x = Math.max(0, Math.sin(clock.getElapsedTime() * 2.5)) * 0.5;
  });
  return (
    <group>
      <group>
        <group position={[-0.25, 0, 0]}>
          <Cil r={0.15} rTop={0.21} h={0.18} pos={[0, 0.09, 0]} color="#fbfaf6" seg={24} />
          <instancedMesh ref={ref} args={[undefined, undefined, n]}>
            <sphereGeometry args={[0.022, 8, 6]} />
            <meshStandardMaterial color="#3a4d8f" roughness={0.45} />
          </instancedMesh>
          <Tekst regels={['2,7 kg']} b={0.24} h={0.1} pos={[0, 0.1, 0.2]} rot={[-0.2, 0, 0]} o={{ bg: '#fbf7ee', rand: '#3a4d8f' }} />
        </group>
        {/* lege bakjes */}
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[0.2 + (i % 2) * 0.16, 0, -0.08 + Math.floor(i / 2) * 0.14]}>
            <Blok size={[0.13, 0.05, 0.11]} pos={[0, 0.025, 0]} color="#c99a62" r={0.008} />
          </group>
        ))}
        <Tekst regels={['1 bakje = 250 g']} b={0.36} h={0.1} pos={[0.28, 0.12, 0.2]} rot={[-0.4, 0, 0]} o={{ bg: '#fbf7ee', rand: '#c99a62' }} />
        {/* merel */}
        <group position={[-0.05, 0.18, -0.2]} rotation={[0, -0.6, 0]}>
          <group ref={merel}>
            <mesh scale={[0.6, 0.6, 1]} material={mat('#232120')}>
              <sphereGeometry args={[0.06, 10, 8]} />
            </mesh>
            <mesh position={[0, 0.04, 0.06]} material={mat('#232120')}>
              <sphereGeometry args={[0.035, 10, 8]} />
            </mesh>
            <mesh position={[0, 0.035, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2a03a')}>
              <coneGeometry args={[0.01, 0.035, 6]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/** EIN-03: kluiskar met goudstaven, een bord "66.700 kg goud" en één staaf van 20 kg op een weegschaal. */
export function Goud() {
  const staaf = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.11, 0);
    s.lineTo(0.11, 0);
    s.lineTo(0.09, 0.05);
    s.lineTo(-0.09, 0.05);
    s.closePath();
    return s;
  }, []);
  const goud = mat('#e2b33a', { rough: 0.25, metal: 0.7 });
  const plekken: V3[] = [];
  for (let l = 0; l < 3; l++) for (let i = 0; i < 4 - l; i++) for (let j = 0; j < 2; j++) plekken.push([-0.36 + l * 0.12 + i * 0.24, 0.05 + l * 0.055, -0.07 + j * 0.14]);
  return (
    <group>
      {/* kar */}
      <Blok size={[1.1, 0.08, 0.5]} pos={[-0.2, 0.42, 0]} color="#4a4f52" r={0.02} />
      {[-0.65, 0.25].map((x) => [-0.2, 0.2].map((z) => <Cil key={`${x}${z}`} r={0.08} h={0.05} pos={[x, 0.08, z]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={12} />))}
      <Blok size={[0.08, 0.3, 0.5]} pos={[-0.7, 0.3, 0]} color="#4a4f52" r={0.02} />
      <Blok size={[1.0, 0.08, 0.08]} pos={[-0.2, 0.22, 0]} color="#4a4f52" r={0.02} />
      <group position={[-0.2, 0.46, 0]}>
        {plekken.map((p, i) => (
          <mesh key={i} position={p} rotation={[0, 0, 0]} material={goud} castShadow>
            <extrudeGeometry args={[staaf, { depth: 0.1, bevelEnabled: false }]} />
          </mesh>
        ))}
      </group>
      {/* bord */}
      <group position={[-0.2, 0, -0.45]}>
        {[-0.55, 0.55].map((x) => (
          <Blok key={x} size={[0.05, 1.6, 0.05]} pos={[x, 0.8, 0]} color="#2f3634" r={0.01} />
        ))}
        <Tekst regels={['Goud van Nederland (2025)', '66.700 kg']} b={1.2} h={0.42} pos={[0, 1.38, 0.03]} o={{ bg: '#1f2a24', fg: '#f2d06a', kop: true }} />
      </group>
      {/* weegschaal met één staaf */}
      <group position={[0.75, 0, 0.1]}>
        <Blok size={[0.4, 0.7, 0.35]} pos={[0, 0.35, 0]} color="#e9e3d7" r={0.03} />
        <group position={[0, 0.7, 0]}>
          <Keukenweegschaal tekst="20 kg" b={0.36} d={0.3} />
          <mesh position={[-0.11, 0.072, -0.05]} material={goud}>
            <extrudeGeometry args={[staaf, { depth: 0.1, bevelEnabled: false }]} />
          </mesh>
        </group>
        <Tekst regels={['1 staaf = 20 kg']} b={0.38} h={0.11} pos={[0, 0.48, 0.176]} o={{ bg: '#fbf7ee', rand: '#e2b33a' }} />
      </group>
    </group>
  );
}

/** EIN-04: poster met de vuistregel en een kind van 7 jaar op een kinderweegschaal. */
export function Vuistregel() {
  return (
    <group>
      <group position={[-0.25, 0, -0.2]}>
        {[-0.7, 0.7].map((x) => (
          <Blok key={x} size={[0.05, 2.0, 0.05]} pos={[x, 1.0, 0]} color="#2f3634" r={0.01} />
        ))}
        <Blok size={[1.5, 0.95, 0.04]} pos={[0, 1.5, -0.01]} color="#2f3634" r={0.02} />
        <Tekst
          regels={['Vuistregel (kinderen tot 10 jaar)', 'Gewicht in kg =', '(2,5 × leeftijd in jaren) + 8']}
          b={1.44}
          h={0.88}
          pos={[0, 1.5, 0.012]}
          o={{ bg: '#e9f6ff', fg: '#1f3c5a', kop: true, groot: 0.55 }}
        />
      </group>
      {/* kind met ballon "7 jaar" op een weegschaal */}
      <group position={[0.55, 0, 0.2]}>
        <Blok size={[0.34, 0.05, 0.3]} pos={[0, 0.025, 0]} color="#f2a6c0" r={0.02} />
        <Blok size={[0.12, 0.03, 0.01]} pos={[0, 0.03, 0.152]} color="#17211d" r={0.004} />
        <Tekst regels={['? kg']} b={0.1} h={0.026} pos={[0, 0.03, 0.159]} o={{ bg: '#17211d', fg: '#9cf0b4', basic: true }} />
        <Poppetje pos={[0, 0.05, 0]} s={0.62} shirt="#f2d04a" broek="#3d8fd6" haar="#b8742a" />
        <Cil r={0.004} h={0.7} pos={[0.17, 0.75, 0]} rot={[0, 0, -0.2]} color="#9aa3a8" seg={4} />
        <mesh position={[0.25, 1.15, 0]} scale={[1, 1.15, 1]} material={mat('#e5332a', { rough: 0.3 })}>
          <sphereGeometry args={[0.13, 14, 12]} />
        </mesh>
        <Tekst regels={['7 jaar']} b={0.18} h={0.07} pos={[0.25, 1.16, 0.135]} o={{ bg: '#e5332a', fg: '#ffffff', radius: 0.3 }} />
      </group>
    </group>
  );
}

/** EIN-05: maquette met een pont naar school, een bord "enkele reis: driekwartier" en een weekkalender. */
export function Pont() {
  const pont = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const f = (Math.sin(clock.getElapsedTime() * 0.4) + 1) / 2;
    if (pont.current) pont.current.position.z = -0.25 + f * 0.5;
  });
  return (
    <group>
      <group>
        {/* oevers en water */}
        <Blok size={[0.6, 0.06, 0.9]} pos={[-0.55, 0.03, 0]} color="#9cbd65" r={0.01} />
        <Blok size={[0.6, 0.06, 0.9]} pos={[0.55, 0.03, 0]} color="#9cbd65" r={0.01} />
        <Blok size={[0.5, 0.03, 0.9]} pos={[0, 0.015, 0]} color="#5fb7c9" r={0.005} />
        {/* huis en school */}
        <group position={[-0.6, 0.06, -0.2]}>
          <Blok size={[0.16, 0.14, 0.14]} pos={[0, 0.07, 0]} color="#f2e7d8" r={0.015} />
          <mesh position={[0, 0.18, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#b4443a', { flat: true })}>
            <coneGeometry args={[0.13, 0.09, 4]} />
          </mesh>
          <Tekst regels={['huis']} b={0.2} h={0.07} pos={[0, 0.3, 0]} o={{ bg: '#fbf7ee' }} />
        </group>
        <group position={[0.6, 0.06, -0.2]}>
          <Blok size={[0.28, 0.18, 0.16]} pos={[0, 0.09, 0]} color="#e9d8bd" r={0.015} />
          <Blok size={[0.3, 0.02, 0.18]} pos={[0, 0.19, 0]} color={P.dak} r={0.005} />
          <Tekst regels={['school']} b={0.24} h={0.07} pos={[0, 0.3, 0]} o={{ bg: '#fbf7ee' }} />
        </group>
        {/* pont die heen en weer vaart (dwars over het water) */}
        <group rotation={[0, Math.PI / 2, 0]}>
          <group ref={pont} position={[0, 0.04, 0]}>
            <Blok size={[0.18, 0.04, 0.4]} pos={[0, 0, 0]} color="#e9e3d7" r={0.01} />
            <Blok size={[0.08, 0.06, 0.08]} pos={[0.05, 0.05, 0]} color="#1f3c5a" r={0.01} />
          </group>
        </group>
        {/* bord met de reistijd */}
        <group position={[-0.1, 0, 0.35]}>
          <Cil r={0.01} h={0.25} pos={[-0.2, 0.125, 0]} color="#2f3634" seg={6} />
          <Cil r={0.01} h={0.25} pos={[0.2, 0.125, 0]} color="#2f3634" seg={6} />
          <Tekst regels={['enkele reis: driekwartier', 'je gaat heen én terug']} b={0.6} h={0.2} pos={[0, 0.3, 0.012]} o={{ bg: '#1f3c5a', fg: '#ffffff', kop: true }} />
        </group>
        {/* weekkalender */}
        <group position={[0.5, 0, 0.3]} rotation={[0, -0.3, 0]}>
          <Blok size={[0.5, 0.26, 0.02]} pos={[0, 0.15, 0]} rot={[-0.3, 0, 0]} color="#fbfaf6" r={0.01} />
          <Tekst regels={['ma di wo do vr', '5 dagen school']} b={0.46} h={0.22} pos={[0, 0.15, 0.012]} rot={[-0.3, 0, 0]} o={{ bg: '#fbfaf6', fg: '#1f2a24', rand: '#d86a4a', kop: true }} />
        </group>
      </group>
    </group>
  );
}

/** Schaal van de regenmeter (0 tot 40, getallen 5, 10, 20, 30, 40). Streepje 11 licht op. */
function useRegenSchaal() {
  return useTextuur(
    0.12,
    0.8,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6';
      ctx.fillRect(0, 0, w, h);
      const y = (v: number) => h * 0.96 - (v / 40) * h * 0.92;
      ctx.fillStyle = '#ffd27a';
      ctx.fillRect(0, y(11) - h * 0.008, w, h * 0.016);
      ctx.fillStyle = '#1f2a24';
      for (let v = 0; v <= 40; v++) {
        const lang = v % 5 === 0;
        ctx.fillRect(0, y(v) - 1.5, lang ? w * 0.45 : w * 0.25, 3);
      }
      ctx.font = `700 ${w * 0.32}px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (const v of [5, 10, 20, 30, 40]) ctx.fillText(String(v), w * 0.97, y(v));
      ctx.fillStyle = '#e8781f';
      ctx.font = `700 ${w * 0.26}px ${FONT}`;
      ctx.fillText('11', w * 0.97, y(11) + h * 0.004);
    },
    'regenschaal',
    800,
  );
}

/** EIN-06: grote groene regenmeter (11 ml), een gazon van 20 m² en het regelbordje. */
export function Regenmeter() {
  const schaal = useRegenSchaal();
  const kikker = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % 3;
    if (kikker.current) kikker.current.position.y = t < 0.4 ? Math.sin((t / 0.4) * Math.PI) * 0.12 : 0;
  });
  const H = 0.8;
  const water = (11 / 40) * H * 0.92;
  return (
    <group>
      {/* gazon (maquette): 20 m² */}
      <group position={[0.35, 0, 0.1]}>
        <Blok size={[1.25, 0.12, 1.0]} pos={[0, 0.06, 0]} color="#7a5a3c" r={0.02} />
        <Blok size={[1.21, 0.03, 0.96]} pos={[0, 0.135, 0]} color="#7cbf4a" r={0.01} />
        <Tekst regels={['gazon: 20 m²']} b={0.5} h={0.14} pos={[0, 0.152, 0.25]} rot={[-Math.PI / 2, 0, 0]} o={{ bg: '#fbf7ee', rand: '#4f9a3a' }} />
        <group ref={kikker} position={[-0.3, 0.15, -0.2]}>
          <mesh scale={[1, 0.6, 1.2]} material={mat('#4f9a3a')}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
          {[-0.025, 0.025].map((x) => (
            <mesh key={x} position={[x, 0.03, 0.03]} material={mat('#fbfaf6')}>
              <sphereGeometry args={[0.014, 6, 4]} />
            </mesh>
          ))}
        </group>
      </group>
      {/* regenmeter op een paal */}
      <group position={[-0.55, 0, 0]}>
        <Cil r={0.02} h={0.5} pos={[0, 0.25, 0]} color="#9aa3a8" seg={8} />
        <group position={[0, 0.5, 0]}>
          <Cil r={0.065} h={H} pos={[0, H / 2, 0]} color="#bfe8c4" seg={20} />
          <Cil r={0.06} h={water} pos={[0, water / 2 + 0.02, 0]} color="#5fb7c9" seg={20} />
          <Cil r={0.06} rTop={0.13} h={0.12} pos={[0, H + 0.06, 0]} color="#4f9a5a" seg={20} />
          <mesh position={[0, H / 2, 0.067]}>
            <planeGeometry args={[0.1, H]} />
            <meshStandardMaterial map={schaal} roughness={0.6} />
          </mesh>
        </group>
        <Tekst regels={['vandaag: 11 ml']} b={0.4} h={0.11} pos={[0, 0.38, 0.06]} o={{ bg: '#fbf7ee', rand: '#e8781f' }} />
      </group>
      {/* regelbordje */}
      <group position={[0.35, 0, -0.55]}>
        <Cil r={0.015} h={1.0} pos={[-0.35, 0.5, 0]} color="#2f3634" seg={6} />
        <Cil r={0.015} h={1.0} pos={[0.35, 0.5, 0]} color="#2f3634" seg={6} />
        <Tekst regels={['1 ml in de regenmeter =', '1 liter regen per m²']} b={0.8} h={0.26} pos={[0, 1.0, 0.02]} o={{ bg: '#1f3c5a', fg: '#ffffff', kop: true }} />
      </group>
    </group>
  );
}

/** Parkeerschijf: blauw, "uur van aankomst", venster met 10 11 12 1 (klein 22 23 24 13), wijzer op 11:30. */
function useParkeerschijf() {
  return useTextuur(
    0.7,
    0.9,
    (ctx, w, h) => {
      ctx.fillStyle = '#1f5fb8';
      rondRect(ctx, 0, 0, w, h, w * 0.08);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${h * 0.065}px ${FONT}`;
      ctx.fillText('uur van aankomst', w / 2, h * 0.08);
      // venster
      const vx = w * 0.06;
      const vy = h * 0.15;
      const vw = w * 0.88;
      const vh = h * 0.42;
      ctx.fillStyle = '#ffffff';
      rondRect(ctx, vx, vy, vw, vh, w * 0.05);
      ctx.fill();
      const uren = [10, 11, 12, 1];
      const klein = [22, 23, 24, 13];
      const stap = vw / 4;
      ctx.fillStyle = '#1f2a24';
      for (let i = 0; i < 4; i++) {
        const x = vx + stap * (i + 0.5);
        ctx.fillRect(x - 3, vy, 6, vh * 0.2);
        ctx.font = `700 ${h * 0.1}px ${FONT}`;
        ctx.fillText(String(uren[i]), x, vy + vh * 0.42);
        ctx.font = `600 ${h * 0.05}px ${FONT}`;
        ctx.fillText(String(klein[i]), x, vy + vh * 0.68);
        if (i < 3) ctx.fillRect(x + stap / 2 - 1.5, vy, 3, vh * 0.1);
      }
      // wijzer (driehoek) op 11:30
      const wx = vx + stap * 1.5 + stap / 2;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1f2a24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx, vy + vh * 0.12);
      ctx.lineTo(wx - w * 0.06, vy + vh + h * 0.08);
      ctx.lineTo(wx + w * 0.06, vy + vh + h * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // P onderaan
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w * 0.34, h * 0.7, w * 0.32, w * 0.32);
      ctx.fillStyle = '#1f5fb8';
      ctx.font = `700 ${w * 0.26}px ${FONT}`;
      ctx.fillText('P', w / 2, h * 0.7 + w * 0.17);
    },
    'parkeerschijf',
    600,
  );
}

/** Zonebord "ZONE – P – max 2h" met het bordje "2h = 2 uur". */
function useZonebord() {
  return useTextuur(
    0.6,
    1.0,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6';
      rondRect(ctx, 0, 0, w, h, w * 0.05);
      ctx.fill();
      ctx.strokeStyle = '#1f2a24';
      ctx.lineWidth = 6;
      rondRect(ctx, 4, 4, w - 8, h - 8, w * 0.04);
      ctx.stroke();
      ctx.fillStyle = '#1f2a24';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${h * 0.09}px ${FONT}`;
      ctx.fillText('ZONE', w / 2, h * 0.09);
      ctx.fillStyle = '#1f5fb8';
      ctx.fillRect(w * 0.18, h * 0.17, w * 0.64, w * 0.64);
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${w * 0.5}px ${FONT}`;
      ctx.fillText('P', w / 2, h * 0.17 + w * 0.34);
      // parkeerschijf-pictogram
      ctx.fillStyle = '#1f5fb8';
      ctx.fillRect(w * 0.38, h * 0.62, w * 0.24, h * 0.13);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w * 0.41, h * 0.64, w * 0.18, h * 0.04);
      ctx.fillStyle = '#1f2a24';
      ctx.font = `700 ${h * 0.11}px ${FONT}`;
      ctx.fillText('max 2h', w / 2, h * 0.87);
    },
    'zonebord',
    500,
  );
}

/** EIN-07: zonebord (max 2h) en een grote parkeerschijf achter de voorruit van een bestelbusje. */
export function Parkeerschijf() {
  const schijf = useParkeerschijf();
  const zone = useZonebord();
  return (
    <group>
      {/* zonebord */}
      <group position={[-0.95, 0, -0.1]}>
        <Cil r={0.03} h={2.2} pos={[0, 1.1, -0.02]} color="#9aa3a8" seg={8} />
        <mesh position={[0, 1.65, 0.01]}>
          <planeGeometry args={[0.6, 1.0]} />
          <meshStandardMaterial map={zone} roughness={0.6} />
        </mesh>
        <Tekst regels={['2h = 2 uur']} b={0.6} h={0.16} pos={[0, 1.02, 0.01]} o={{ bg: '#fbfaf6', rand: '#1f2a24', radius: 0.05 }} />
      </group>
      {/* bestelbusje (voorkant naar +z) */}
      <group position={[0.35, 0, -0.1]}>
        <Blok size={[1.2, 0.95, 1.7]} pos={[0, 0.7, -0.25]} color="#f3efe6" r={0.12} />
        <Blok size={[1.2, 0.55, 0.6]} pos={[0, 0.5, 0.8]} color="#f3efe6" r={0.12} />
        <Blok size={[1.08, 0.5, 0.05]} pos={[0, 1.0, 0.55]} rot={[-0.35, 0, 0]} color="#bcd6e0" r={0.02} opacity={0.55} />
        <Blok size={[1.24, 0.08, 0.14]} pos={[0, 0.3, 1.1]} color="#4a4f52" r={0.03} />
        {[-0.62, 0.62].map((x) => [-0.7, 0.75].map((z) => <Cil key={`${x}${z}`} r={0.2} h={0.14} pos={[x, 0.2, z]} rot={[0, 0, Math.PI / 2]} color="#2c2f33" seg={16} />))}
        {/* dashboard met de schijf erop */}
        <Blok size={[1.0, 0.08, 0.3]} pos={[0, 0.8, 0.45]} color="#3b3a39" r={0.02} />
        <mesh position={[0.15, 1.0, 0.53]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.35, 0.45]} />
          <meshStandardMaterial map={schijf} roughness={0.5} />
        </mesh>
      </group>
      {/* grote kopie van de schijf op een standaard (zo lees je hem goed) */}
      <group position={[0.35, 0, 1.05]}>
        <Blok size={[0.04, 0.5, 0.04]} pos={[0, 0.25, -0.05]} color="#2f3634" r={0.01} />
        <Blok size={[0.74, 0.94, 0.03]} pos={[0, 0.85, -0.03]} rot={[-0.25, 0, 0]} color="#2f3634" r={0.02} />
        <mesh position={[0, 0.85, -0.012]} rotation={[-0.25, 0, 0]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshStandardMaterial map={schijf} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/** EIN-08: witte doos suikerklontjes (1 kg, 224 stuks), één los klontje, een weegschaaltje met "?". */
export function Klontjesdoos() {
  const muis = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (muis.current) muis.current.position.x = 0.32 + Math.sin(t * 0.8) * 0.06;
  });
  const boven = useTextuur(
    0.34,
    0.22,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6';
      ctx.fillRect(0, 0, w, h);
      // bietenveld met tractortje
      ctx.fillStyle = '#8fc0e8';
      ctx.fillRect(0, 0, w, h * 0.35);
      ctx.fillStyle = '#7cbf4a';
      ctx.fillRect(0, h * 0.35, w, h * 0.25);
      ctx.fillStyle = '#d86a4a';
      ctx.fillRect(w * 0.6, h * 0.25, w * 0.12, h * 0.12);
      ctx.fillStyle = '#2c2f33';
      ctx.beginPath();
      ctx.arc(w * 0.62, h * 0.4, h * 0.05, 0, Math.PI * 2);
      ctx.arc(w * 0.71, h * 0.4, h * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f3c5a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${h * 0.14}px ${FONT}`;
      ctx.fillText('Suikerklontjes', w * 0.5, h * 0.72);
      ctx.font = `700 ${h * 0.18}px ${FONT}`;
      ctx.fillText('1 kg', w * 0.5, h * 0.9);
    },
    'doos-klontjes-boven',
    500,
  );
  return (
    <group>
      <group>
        {/* doos */}
        <group position={[-0.15, 0, -0.03]}>
          <Blok size={[0.34, 0.12, 0.22]} pos={[0, 0.06, 0]} color="#fbfaf6" r={0.008} />
          <mesh position={[0, 0.121, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshStandardMaterial map={boven} roughness={0.7} />
          </mesh>
          <Tekst regels={['224 stuks']} b={0.3} h={0.09} pos={[0, 0.06, 0.111]} o={{ bg: '#fbfaf6', fg: '#1f3c5a' }} />
        </group>
        {/* los klontje en een weegschaaltje met een vraagteken */}
        <Blok size={[0.03, 0.03, 0.03]} pos={[0.12, 0.015, 0.16]} color="#ffffff" r={0.004} />
        <Keukenweegschaal tekst="? g" pos={[0.28, 0, -0.05]} b={0.22} d={0.18} />
        {/* muisje */}
        <group ref={muis} position={[0.32, 0, 0.18]}>
          <mesh position={[0, 0.025, 0]} scale={[1, 0.8, 1.5]} material={mat('#9aa3a8')}>
            <sphereGeometry args={[0.025, 10, 8]} />
          </mesh>
          {[-0.015, 0.015].map((x) => (
            <mesh key={x} position={[x, 0.05, 0.02]} material={mat('#f0b8c0')}>
              <sphereGeometry args={[0.01, 6, 4]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/** EIN-09: groot lichtgroen watervat (30 liter) met kraantje, en een lopende band met flesjes van 750 ml. */
export function Watervat() {
  const band = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    band.current?.children.forEach((f, i) => {
      f.position.x = -0.2 + (((t * 0.08 + i * 0.22) % 1.1) + 1.1) % 1.1;
    });
  });
  return (
    <group>
      {/* vat op een bok */}
      <Blok size={[0.6, 0.45, 0.5]} pos={[-0.65, 0.225, 0]} color="#8a5a32" r={0.03} />
      <group position={[-0.65, 0.45, 0]}>
        <Blok size={[0.55, 0.62, 0.4]} pos={[0, 0.31, 0]} color="#a8d8a0" r={0.12} />
        <Cil r={0.07} h={0.06} pos={[0, 0.65, 0]} color="#1f2a24" seg={14} />
        <Blok size={[0.06, 0.06, 0.1]} pos={[0.2, 0.08, 0.24]} color="#1f2a24" r={0.01} />
        <Blok size={[0.03, 0.08, 0.03]} pos={[0.2, 0.03, 0.29]} color="#1f2a24" r={0.008} />
        <Tekst regels={['30 liter']} b={0.36} h={0.14} pos={[0, 0.36, 0.205]} o={{ bg: '#fbfaf6', fg: '#1f2a24', rand: '#4f9a5a' }} />
      </group>
      {/* lopende band */}
      <group position={[0.35, 0, 0.1]}>
        <Blok size={[1.3, 0.08, 0.32]} pos={[0, 0.6, 0]} color="#3b4246" r={0.03} />
        {[-0.55, 0.55].map((x) => [-0.12, 0.12].map((z) => <Blok key={`${x}${z}`} size={[0.05, 0.56, 0.05]} pos={[x, 0.28, z]} color="#9aa3a8" r={0.01} />))}
        <group ref={band} position={[-0.6, 0.64, 0]}>
          {Array.from({ length: 5 }, (_, i) => (
            <group key={i}>
              <Cil r={0.035} h={0.16} pos={[0, 0.08, 0]} color="#e6f4f7" seg={12} />
              <Cil r={0.02} h={0.03} pos={[0, 0.175, 0]} color="#3d8fd6" seg={10} />
            </group>
          ))}
        </group>
        <Tekst regels={['1 flesje = 750 ml']} b={0.5} h={0.12} pos={[0, 0.6, 0.165]} o={{ bg: '#fbfaf6', fg: '#1f2a24', rand: '#3d8fd6' }} />
        {/* krat aan het eind */}
        <Blok size={[0.34, 0.16, 0.28]} pos={[0.8, 0.08, 0]} color="#3d8fd6" r={0.02} />
      </group>
    </group>
  );
}

/** EIN-10: badkamerplankje van de schipper met drie flessen mondwater (0,5 liter), een dopje van 15 ml en een kalender. */
export function Mondwater() {
  return (
    <group>
      {/* achterwand met spiegel en kalender */}
      <Blok size={[1.4, 1.9, 0.08]} pos={[0, 0.95, -0.35]} color="#d6ecf0" r={0.02} />
      <Blok size={[0.6, 0.5, 0.02]} pos={[-0.3, 1.45, -0.3]} color="#e9f4f7" r={0.02} />
      <group position={[0.4, 1.35, -0.3]}>
        <Blok size={[0.4, 0.5, 0.02]} color="#fbfaf6" r={0.01} />
        <Tekst regels={['kalender', '2× per dag', 'spoelen']} b={0.36} h={0.4} pos={[0, -0.02, 0.012]} o={{ bg: '#fbfaf6', fg: '#1f2a24', rand: '#d86a4a', kop: true }} />
      </group>
      {/* wastafelkastje */}
      <Blok size={[1.1, 0.85, 0.5]} pos={[0, 0.425, -0.05]} color="#fbfaf6" r={0.03} />
      <Blok size={[1.14, 0.04, 0.54]} pos={[0, 0.87, -0.05]} color="#cfc7b8" r={0.01} />
      <group position={[0, 0.89, -0.05]}>
        {[-0.35, -0.22, -0.09].map((x) => (
          <group key={x} position={[x, 0, -0.08]}>
            <Cil r={0.045} h={0.2} pos={[0, 0.1, 0]} color="#3d8fd6" seg={14} />
            <Cil r={0.03} h={0.04} pos={[0, 0.22, 0]} color="#fbfaf6" seg={12} />
          </group>
        ))}
        <Tekst regels={['3 flessen van 0,5 liter']} b={0.62} h={0.13} pos={[-0.2, 0.08, 0.2]} rot={[-0.5, 0, 0]} o={{ bg: '#fbfaf6', fg: '#1f3c5a', rand: '#3d8fd6' }} />
        {/* maatdopje */}
        <group position={[0.25, 0, 0.1]}>
          <Cil r={0.035} rTop={0.04} h={0.05} pos={[0, 0.025, 0]} color="#e6f4f7" seg={14} />
          <Tekst regels={['dopje: 15 ml']} b={0.36} h={0.1} pos={[0, 0.12, 0.06]} rot={[-0.4, 0, 0]} o={{ bg: '#fbf7ee', rand: '#3d8fd6' }} />
        </group>
      </group>
      {/* schipper met gouden tand */}
      <group position={[0.92, 0, -0.05]} rotation={[0, -0.5, 0]}>
        <Poppetje s={0.95} shirt="#1f3c5a" broek="#2f3634" haar="#e9e3d7" />
        <Blok size={[0.12, 0.03, 0.01]} pos={[0, 0.95, 0.125]} color="#fbfaf6" r={0.004} />
        <Blok size={[0.025, 0.025, 0.012]} pos={[0.03, 0.95, 0.128]} color="#e2b33a" r={0.004} />
        <Blok size={[0.32, 0.06, 0.3]} pos={[0, 1.21, 0]} color="#1f2a24" r={0.03} />
      </group>
    </group>
  );
}
