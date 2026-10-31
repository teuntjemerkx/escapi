// 3D-objecten voor de instapvragen (begeleide inoefening) en de terugblik/instructie.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat, useInspectie } from '../game/inspectie';
import { Bankje, Blok, Cil, Haag, Hek, mat, seeded, Struik } from '../game/kit';
import { P } from '../game/palette';
import { Bordje, FONT, Nummerpaal, useTextuur } from '../game/tekst';
import { useSpel } from '../game/store';

type V3 = [number, number, number];

/** Terugblik: de goudkist van de graaf, 3 × 2 × 2 gouden blokjes. De lagen tillen eruit. */
export function Blokjesdoos() {
  const b = 0.42;
  const laag = (y: number, kleur: string) =>
    Array.from({ length: 6 }, (_, i) => <Blok key={i} size={[b * 0.94, b * 0.94, b * 0.94]} pos={[(i % 3) * b - b, y, Math.floor(i / 3) * b - b / 2]} color={kleur} r={0.05} rough={0.35} />);
  return (
    <group>
      <Blok size={[b * 3 + 0.12, 0.06, b * 2 + 0.12]} pos={[0, 0.03, 0]} color="#6e4426" r={0.02} />
      <Blok size={[b * 3 + 0.12, b * 2, 0.05]} pos={[0, b, -b - 0.035]} color="#6e4426" r={0.02} />
      <Blok size={[0.05, b * 2, b * 2 + 0.12]} pos={[-b * 1.5 - 0.035, b, 0]} color="#5e3a20" r={0.02} />
      <Blok size={[0.05, b * 2, b * 2 + 0.12]} pos={[b * 1.5 + 0.035, b, 0]} color="#5e3a20" r={0.02} />
      {/* ijzeren hoeken van de kist */}
      {[-1, 1].map((k) => (
        <Blok key={k} size={[0.07, b * 2 + 0.02, 0.07]} pos={[k * (b * 1.5 + 0.035), b, -b - 0.035]} color="#3b3a39" r={0.01} />
      ))}
      <Deel id="laag1" uit={[0, 0.5, 0]} label="Laag 1: 6 blokjes">
        {laag(b / 2 + 0.06, '#e2b13c')}
      </Deel>
      <Deel id="laag2" uit={[0, 1.3, 0]} label="Laag 2: 6 blokjes">
        {laag(b * 1.5 + 0.06, '#f2cf5a')}
      </Deel>
      <Maat van={[-b * 1.5, 0.02, b + 0.25]} naar={[b * 1.5, 0.02, b + 0.25]} label="3 blokjes" />
      <Maat van={[b * 1.5 + 0.25, 0.02, -b]} naar={[b * 1.5 + 0.25, 0.02, b]} label="2 blokjes" />
      <Maat van={[-b * 1.5 - 0.25, 0.06, -b]} naar={[-b * 1.5 - 0.25, b * 2 + 0.06, -b]} label="2 hoog" />
    </group>
  );
}

/** Instructie: tweeling-zwembad in een paviljoen (20 × 10 × 2, blok 10 × 10 × 0,5). Schaal 1:10. */
export function Paviljoen() {
  return (
    <group>
      <Blok size={[5.4, 0.2, 4.4]} pos={[0, 0.1, 0]} color={P.steen} r={0.06} />
      {[
        [-2.4, -1.9],
        [2.4, -1.9],
        [-2.4, 1.9],
        [2.4, 1.9],
      ].map(([x, z], i) => (
        <Blok key={i} size={[0.25, 2.6, 0.25]} pos={[x, 1.4, z]} color={P.kozijn} r={0.06} />
      ))}
      <Blok size={[5.8, 0.3, 4.8]} pos={[0, 2.8, 0]} color={P.dak} r={0.1} />
      <Blok size={[6.0, 0.12, 5.0]} pos={[0, 2.62, 0]} color={P.dakRand} r={0.05} />
      <Bordje regels={['Uitleg', 'Kijk hoe het werkt']} breed={1.6} hoog={0.6} pos={[0, 2.3, 2.42]} />
    </group>
  );
}

/** Instructiemodel op de vloer van het paviljoen. */
export function Instructiebad() {
  return (
    <group position={[0, 0.2, 0]}>
      <MiniBad />
    </group>
  );
}

/** Zwembadje met verhoogde bodem (voor de instructie). 1 eenheid = 1 m echt / 10. */
export function MiniBad() {
  const L = 2;
  const B = 1;
  const H = 0.2;
  return (
    <group>
      <Blok size={[L + 0.1, 0.04, B + 0.1]} pos={[0, 0.02, 0]} color="#d7e7ea" r={0.01} />
      <Blok size={[L + 0.1, H, 0.05]} pos={[0, H / 2, -B / 2 - 0.025]} color={P.wit} r={0.01} />
      <Blok size={[0.05, H, B]} pos={[-L / 2 - 0.025, H / 2, 0]} color={P.wit} r={0.01} />
      <Blok size={[0.05, H, B]} pos={[L / 2 + 0.025, H / 2, 0]} color={P.wit} r={0.01} />
      <Deel id="bak" uit={[0, 0.9, 0]} label="Hele bak: 20 × 10 × 2">
        <Blok size={[L, H, B]} pos={[0, H / 2 + 0.04, 0]} color={P.water} r={0.01} opacity={0.55} />
      </Deel>
      <Deel id="verhoging" uit={[0, 0.45, 0.9]} label="Blok: 10 × 10 × 0,5">
        <Blok size={[L / 2, H / 4, B]} pos={[-L / 4, H / 8 + 0.04, 0]} color="#f0e6d0" r={0.01} />
      </Deel>
      <Maat van={[-L / 2, 0.02, B / 2 + 0.15]} naar={[L / 2, 0.02, B / 2 + 0.15]} label="20 m" />
      <Maat van={[L / 2 + 0.15, 0.02, -B / 2]} naar={[L / 2 + 0.15, 0.02, B / 2]} label="10 m" />
      <Maat van={[L / 2 + 0.15, 0.04, -B / 2]} naar={[L / 2 + 0.15, H + 0.04, -B / 2]} label="2 m" />
      <Maat van={[-L / 2 - 0.15, 0.04, B / 2]} naar={[-L / 2 - 0.15, H / 4 + 0.04, B / 2]} label="0,5 m" deel="verhoging" />
    </group>
  );
}

/** INS-01: tafel met een schatkaart. Het kasteel en de molen liggen 4 cm uit elkaar (1 cm = 250 m). */
export function Kaarttafel() {
  const kaart = useTextuur(
    1.2,
    0.8,
    (ctx, w, h) => {
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d8ccb0';
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += w / 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += w / 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#9cc456';
      ctx.beginPath();
      ctx.ellipse(w * 0.75, h * 0.25, w * 0.12, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9fd0de';
      ctx.fillRect(0, h * 0.78, w, h * 0.06);
      // kasteel en molen: 4 cm = 4 ruitjes van w/12
      const cm = w / 12;
      const sx = w * 0.2;
      const sy = h * 0.5;
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = '#d86a4a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 4 * cm, sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#4f78a8';
      ctx.fillRect(sx - 18, sy - 18, 36, 36);
      ctx.fillStyle = '#e48a3a';
      ctx.fillRect(sx + 4 * cm - 18, sy - 18, 36, 36);
      ctx.fillStyle = '#1f2a24';
      ctx.font = `600 ${h * 0.07}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('kasteel', sx, sy - 30);
      ctx.fillText('molen', sx + 4 * cm, sy - 30);
      ctx.font = `700 ${h * 0.07}px ${FONT}`;
      ctx.fillText('1 cm = 250 m', w * 0.78, h * 0.93);
      ctx.fillRect(w * 0.7, h * 0.86, cm, 6);
    },
    'kaart250',
  );
  return (
    <group>
      <Blok size={[2.2, 0.1, 1.0]} pos={[0, 0.8, 0]} color={P.hout} r={0.03} />
      <Blok size={[2.2, 0.08, 0.32]} pos={[0, 0.45, 0.72]} color={P.hout} r={0.03} />
      <Blok size={[2.2, 0.08, 0.32]} pos={[0, 0.45, -0.72]} color={P.hout} r={0.03} />
      {[-0.9, 0.9].map((x) => (
        <group key={x}>
          <Blok size={[0.1, 0.85, 1.7]} pos={[x, 0.4, 0]} rot={[0, 0, 0]} color={P.houtLicht} r={0.03} />
        </group>
      ))}
      <Deel id="kaart" uit={[0, 0.5, 0]} label="Kaart">
        <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial map={kaart} roughness={0.9} />
        </mesh>
        <Maat van={[-0.4, 0.87, 0.06]} naar={[-0.4 + 0.4, 0.87, 0.06]} label="4 cm" />
      </Deel>
    </group>
  );
}

/** INS-02: moestuin van 6 × 4 m met kolen en een laag hekje. */
export function Moestuin() {
  const kolen = useMemo(() => {
    const out: V3[] = [];
    for (let x = -2.5; x <= 2.5; x += 0.8) for (let z = -1.4; z <= 1.4; z += 0.7) out.push([x, 0.32, z]);
    return out;
  }, []);
  return (
    <group>
      <Deel id="grond" uit={[0, 0.6, 0]} label="Tuin 6 × 4 m">
        <Blok size={[6, 0.25, 4]} pos={[0, 0.12, 0]} color="#8d5f3a" r={0.05} />
        {kolen.map((p, i) => (
          <mesh key={i} position={p} castShadow material={mat(i % 3 ? '#7db84a' : '#9ccf5a')}>
            <icosahedronGeometry args={[0.2, 1]} />
          </mesh>
        ))}
      </Deel>
      <Hek lengte={6.4} pos={[0, 0, -2.2]} hoogte={0.5} />
      <Hek lengte={6.4} pos={[0, 0, 2.2]} hoogte={0.5} />
      <Hek lengte={4.4} pos={[-3.2, 0, 0]} rot={[0, Math.PI / 2, 0]} hoogte={0.5} />
      <Hek lengte={4.4} pos={[3.2, 0, 0]} rot={[0, Math.PI / 2, 0]} hoogte={0.5} />
      <Maat van={[-3, 0.3, 2.7]} naar={[3, 0.3, 2.7]} label="6 m" />
      <Maat van={[3.7, 0.3, -2]} naar={[3.7, 0.3, 2]} label="4 m" />
    </group>
  );
}

/** INS-03: houten kisten in de heksenkeuken. De bovenste (voor toverdrank) is 50 × 30 × 20 cm. */
export function Verhuisdoos() {
  const doos = (pos: V3, s: number, k: string) => (
    <group position={pos}>
      <Blok size={[0.5 * s, 0.2 * s, 0.3 * s]} pos={[0, 0.1 * s, 0]} color={k} r={0.015} />
      <Blok size={[0.5 * s, 0.01, 0.05 * s]} pos={[0, 0.2 * s + 0.005, 0]} color="#3b3a39" r={0.003} />
    </group>
  );
  return (
    <group>
      {doos([0, 0, 0], 1.6, '#6e4426')}
      {doos([0.05, 0.32, 0.02], 1.4, '#5e3a20')}
      <Deel id="doos" uit={[0, 0.5, 0]} label="Kist 50 × 30 × 20 cm">
        <group position={[0, 0.6, 0]}>
          <Blok size={[0.5, 0.2, 0.3]} pos={[0, 0.1, 0]} color="#7a4b2a" r={0.012} />
          <Blok size={[0.5, 0.008, 0.04]} pos={[0, 0.204, 0]} color="#3b3a39" r={0.003} />
          <Bordje regels={['TOVERDRANK']} breed={0.3} hoog={0.07} pos={[0, 0.1, 0.152]} rand={null} bg="#7a4b2a" fg="#c9f29a" />
          <Maat van={[-0.25, 0, 0.22]} naar={[0.25, 0, 0.22]} label="50 cm" />
          <Maat van={[0.32, 0, -0.15]} naar={[0.32, 0, 0.15]} label="30 cm" />
          <Maat van={[-0.32, 0, 0.15]} naar={[-0.32, 0.2, 0.15]} label="20 cm" />
        </group>
      </Deel>
    </group>
  );
}

/** INS-04: wegwijzer op de muur "Toren B ← → Toren C 200 m" met een loopbordje "5 km per uur". */
export function Wegwijzer() {
  return (
    <group>
      <Cil r={0.07} h={2.6} pos={[0, 1.3, 0]} color={P.dak} seg={10} />
      <group position={[0, 2.2, 0]}>
        <Blok size={[1.5, 0.42, 0.08]} pos={[0.6, 0, 0]} color={P.blauw} r={0.05} />
        <Bordje regels={['Toren C  →  200 m']} breed={1.4} hoog={0.34} pos={[0.6, 0, 0.045]} bg={P.blauw} fg="#ffffff" rand={null} />
      </group>
      <group position={[0, 1.65, 0]}>
        <Blok size={[1.3, 0.42, 0.08]} pos={[-0.5, 0, 0]} color={P.oranje} r={0.05} />
        <Bordje regels={['←  Toren B']} breed={1.2} hoog={0.34} pos={[-0.5, 0, 0.045]} bg={P.oranje} fg="#ffffff" rand={null} />
      </group>
      <group position={[0, 1.05, 0]}>
        <Blok size={[0.9, 0.4, 0.08]} pos={[0, 0, 0]} color={P.wit} r={0.05} />
        <Bordje regels={['Lopen: 5 km/u']} breed={0.84} hoog={0.34} pos={[0, 0, 0.045]} rand={null} />
      </group>
    </group>
  );
}

/** INS-05: torenkamer van 5 × 3 m die een nieuwe houten vloer krijgt. */
export function Laminaat() {
  return (
    <group>
      <Blok size={[5.3, 0.15, 3.3]} pos={[0, 0.075, 0]} color={P.steen} r={0.04} />
      <Blok size={[5.3, 0.9, 0.15]} pos={[0, 0.45, -1.65]} color={P.muur} r={0.04} />
      <Blok size={[0.15, 0.9, 3.3]} pos={[-2.65, 0.45, 0]} color={P.muur} r={0.04} />
      <Deel id="vloer" uit={[0, 1.2, 0]} label="Vloer 5 × 3 m">
        {Array.from({ length: 10 }, (_, i) => (
          <Blok key={i} size={[i % 2 ? 5 : 4.2, 0.05, 0.28]} pos={[i % 2 ? 0 : -0.4, 0.18, -1.35 + i * 0.3]} color={i % 3 ? '#c99a62' : '#b98a55'} r={0.01} />
        ))}
      </Deel>
      {Array.from({ length: 4 }, (_, i) => (
        <Blok key={i} size={[1.3, 0.1, 0.3]} pos={[2.0, 0.22 + i * 0.1, 1.0]} color="#d8b27a" r={0.02} />
      ))}
      <Maat van={[-2.5, 0.25, 1.9]} naar={[2.5, 0.25, 1.9]} label="5 m" />
      <Maat van={[3.0, 0.25, -1.5]} naar={[3.0, 0.25, 1.5]} label="3 m" />
    </group>
  );
}

/** INS-06: de fiets van de bode, met bordjes "Dorp 4 km" en "12 km/u". */
export function Fiets() {
  const wiel = (x: number) => (
    <mesh position={[x, 0.36, 0]} castShadow material={mat('#2c2f33')}>
      <torusGeometry args={[0.33, 0.045, 8, 24]} />
    </mesh>
  );
  return (
    <group>
      {wiel(-0.55)}
      {wiel(0.55)}
      <Cil r={0.03} h={0.8} pos={[-0.15, 0.55, 0]} rot={[0, 0, 1.0]} color={P.rood} seg={8} />
      <Cil r={0.03} h={0.75} pos={[0.25, 0.5, 0]} rot={[0, 0, -0.6]} color={P.rood} seg={8} />
      <Cil r={0.03} h={0.7} pos={[0.1, 0.75, 0]} rot={[0, 0, Math.PI / 2]} color={P.rood} seg={8} />
      <Blok size={[0.26, 0.06, 0.12]} pos={[-0.25, 0.93, 0]} color="#2c2f33" r={0.03} />
      <Cil r={0.025} h={0.5} pos={[0.5, 0.95, 0]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={8} />
      <group position={[1.3, 0, -0.2]}>
        <Cil r={0.05} h={1.9} pos={[0, 0.95, 0]} color={P.dak} seg={8} />
        <Blok size={[0.9, 0.38, 0.06]} pos={[0, 1.7, 0]} color={P.wit} r={0.04} />
        <Bordje regels={['Dorp: 4 km']} breed={0.84} hoog={0.32} pos={[0, 1.7, 0.035]} rand={null} />
        <Blok size={[0.7, 0.36, 0.06]} pos={[0, 1.25, 0]} color={P.wit} r={0.04} />
        <Bordje regels={['12 km/u']} breed={0.64} hoog={0.3} pos={[0, 1.25, 0.035]} rand={P.rood} />
      </group>
    </group>
  );
}

/** INS-07: reuzenblikje als beeld op het plein, met "330 ml". */
export function Blikje() {
  const etiket = useTextuur(
    2.2,
    1.2,
    (ctx, w, h) => {
      ctx.fillStyle = '#4a7a3a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9f29a';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.55 + Math.sin(x / 40) * 18);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${h * 0.24}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('TOVER', w * 0.25, h * 0.3);
      ctx.fillText('DRANK', w * 0.75, h * 0.3);
      ctx.fillStyle = '#2f5a2a';
      ctx.font = `700 ${h * 0.2}px ${FONT}`;
      ctx.fillText('330 ml', w * 0.25, h * 0.85);
      ctx.fillText('330 ml', w * 0.75, h * 0.85);
    },
    'blik-tover',
  );
  return (
    <group>
      <Blok size={[1.2, 0.3, 1.2]} pos={[0, 0.15, 0]} color={P.steen} r={0.08} />
      <group position={[0, 0.3, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 1.6, 32, 1, true]} />
          <meshStandardMaterial map={etiket} roughness={0.4} metalness={0.2} />
        </mesh>
        <Cil r={0.38} rTop={0.3} h={0.12} pos={[0, 1.76, 0]} color={P.metaal} seg={32} />
        <Cil r={0.3} rTop={0.38} h={0.1} pos={[0, 0.05, 0]} color={P.metaal} seg={32} />
        <Blok size={[0.14, 0.02, 0.06]} pos={[0.05, 1.83, 0]} color="#c9cdd0" r={0.01} />
      </group>
    </group>
  );
}

/** INS-08: opzetzwembad 8 × 4 × 1,5 m in de tuin. */
export function Tuinzwembad() {
  return (
    <group>
      <Blok size={[8.2, 1.5, 0.1]} pos={[0, 0.75, -2.05]} color="#4f86b8" r={0.04} />
      <Blok size={[8.2, 1.5, 0.1]} pos={[0, 0.75, 2.05]} color="#4f86b8" r={0.04} />
      <Blok size={[0.1, 1.5, 4]} pos={[-4.05, 0.75, 0]} color="#4f86b8" r={0.04} />
      <Blok size={[0.1, 1.5, 4]} pos={[4.05, 0.75, 0]} color="#4f86b8" r={0.04} />
      <Blok size={[8.4, 0.08, 0.25]} pos={[0, 1.52, -2.1]} color={P.wit} r={0.03} />
      <Blok size={[8.4, 0.08, 0.25]} pos={[0, 1.52, 2.1]} color={P.wit} r={0.03} />
      <Blok size={[0.25, 0.08, 4]} pos={[-4.1, 1.52, 0]} color={P.wit} r={0.03} />
      <Blok size={[0.25, 0.08, 4]} pos={[4.1, 1.52, 0]} color={P.wit} r={0.03} />
      <Blok size={[7.9, 0.05, 3.9]} pos={[0, 0.03, 0]} color="#3f93ab" r={0.01} />
      <Deel id="water" uit={[0, 2.2, 0]} label="Water 8 × 4 × 1,5 m">
        <Blok size={[7.9, 1.4, 3.9]} pos={[0, 0.72, 0]} color={P.water} r={0.03} opacity={0.75} />
      </Deel>
      <group position={[3.4, 1.65, 1.2]}>
        <mesh material={mat('#f2d04a')} castShadow>
          <torusGeometry args={[0.35, 0.13, 10, 20]} />
        </mesh>
      </group>
      <Maat van={[-4, 1.6, 2.6]} naar={[4, 1.6, 2.6]} label="8 m" />
      <Maat van={[4.6, 1.6, -2]} naar={[4.6, 1.6, 2]} label="4 m" />
      <Maat van={[4.6, 0, 2.1]} naar={[4.6, 1.5, 2.1]} label="1,5 m" />
    </group>
  );
}

/** INS-09: plattegrond van het kasteelterrein: de kapel en de stallen 6 cm uit elkaar, 1 cm = 100 m. */
export function Plattegrond() {
  const tex = useTextuur(
    2,
    1.2,
    (ctx, w, h) => {
      ctx.fillStyle = '#eef2e4';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c8d6b2';
      ctx.fillRect(w * 0.05, h * 0.62, w * 0.9, h * 0.06);
      const cm = w / 10;
      const x0 = w * 0.18;
      const y0 = h * 0.4;
      ctx.fillStyle = '#4f78a8';
      ctx.fillRect(x0 - 22, y0 - 22, 44, 44);
      ctx.fillStyle = '#86c24a';
      ctx.fillRect(x0 + 6 * cm - 22, y0 - 22, 44, 44);
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = '#d86a4a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 6 * cm, y0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#1f2a24';
      ctx.font = `700 ${h * 0.09}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('Plattegrond', w / 2, h * 0.14);
      ctx.font = `600 ${h * 0.07}px ${FONT}`;
      ctx.fillText('kapel', x0, y0 - 40);
      ctx.fillText('stallen', x0 + 6 * cm, y0 - 40);
      ctx.fillText('1 cm = 100 m', w * 0.78, h * 0.88);
      ctx.fillRect(w * 0.73, h * 0.8, cm, 6);
    },
    'platt100-kasteel',
  );
  return (
    <group>
      {[-0.95, 0.95].map((x) => (
        <Cil key={x} r={0.06} h={2.2} pos={[x, 1.1, 0]} color={P.dak} seg={8} />
      ))}
      <Blok size={[2.2, 1.4, 0.08]} pos={[0, 1.55, 0]} color={P.hout} r={0.04} />
      <mesh position={[0, 1.55, 0.045]}>
        <planeGeometry args={[2, 1.2]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <Maat van={[-0.64, 1.55 + 0.6 - 0.48, 0.06]} naar={[-0.64 + 1.2, 1.55 + 0.6 - 0.48, 0.06]} label="6 cm" />
    </group>
  );
}

/** INS-10: schilderij van graaf Dracul (1,2 m hoog, 0,8 m breed) in een gouden lijst, op een stenen wandstuk. */
export function GraafSchilderij() {
  const doek = useTextuur(
    0.8,
    1.2,
    (ctx, w, h) => {
      // donkere achtergrond, bleek gezicht, zwarte cape met rode kraag
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#3a2a3e');
      g.addColorStop(1, '#140d16');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#9a1f2a';
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h);
      ctx.lineTo(w * 0.22, h * 0.52);
      ctx.lineTo(w * 0.78, h * 0.52);
      ctx.lineTo(w * 0.9, h);
      ctx.fill();
      ctx.fillStyle = '#0d0a0e';
      ctx.beginPath();
      ctx.moveTo(w * 0.18, h);
      ctx.lineTo(w * 0.3, h * 0.58);
      ctx.lineTo(w * 0.7, h * 0.58);
      ctx.lineTo(w * 0.82, h);
      ctx.fill();
      ctx.fillStyle = '#e8dccb';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.36, w * 0.17, h * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1214';
      ctx.beginPath();
      ctx.moveTo(w * 0.33, h * 0.3);
      ctx.lineTo(w / 2, h * 0.36);
      ctx.lineTo(w * 0.67, h * 0.3);
      ctx.lineTo(w * 0.62, h * 0.21);
      ctx.lineTo(w * 0.38, h * 0.21);
      ctx.fill();
      ctx.fillStyle = '#c0202c';
      for (const x of [0.43, 0.57]) {
        ctx.beginPath();
        ctx.arc(w * x, h * 0.35, w * 0.022, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#d8c48a';
      ctx.font = `700 ${h * 0.05}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('GRAAF DRACUL', w / 2, h * 0.94);
    },
    'graaf-schilderij',
  );
  return (
    <group>
      <Blok size={[1.8, 2.5, 0.25]} pos={[0, 1.25, -0.2]} color="#5c5862" r={0.05} />
      <Blok size={[1.9, 0.12, 0.35]} pos={[0, 2.55, -0.18]} color="#4a4650" r={0.03} />
      <Deel id="poster" uit={[0, 0, 1.0]} label="Schilderij 1,2 × 0,8 m">
        <group position={[0, 1.4, -0.04]}>
          <Blok size={[1.0, 1.4, 0.07]} color="#b8892e" r={0.025} />
          <Blok size={[0.9, 1.3, 0.08]} pos={[0, 0, 0.005]} color="#8a6420" r={0.015} />
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial map={doek} roughness={0.75} />
          </mesh>
          <Maat van={[-0.4, -0.78, 0.07]} naar={[0.4, -0.78, 0.07]} label="0,8 m" />
          <Maat van={[0.58, -0.6, 0.07]} naar={[0.58, 0.6, 0.07]} label="1,2 m" />
        </group>
      </Deel>
    </group>
  );
}

/** Vorm voor bloemperken. */
function perkVorm(soort: string): THREE.Shape {
  const s = new THREE.Shape();
  const r = 1.1;
  const poly = (n: number, start: number, sx = 1, sy = 1) => {
    for (let i = 0; i < n; i++) {
      const a = start + (i * Math.PI * 2) / n;
      const x = Math.cos(a) * r * sx;
      const y = Math.sin(a) * r * sy;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
  };
  switch (soort) {
    case 'cirkel':
      s.absarc(0, 0, r, 0, Math.PI * 2, false);
      break;
    case 'ovaal':
      s.absellipse(0, 0, r * 1.25, r * 0.8, 0, Math.PI * 2, false, 0);
      break;
    case 'vierkant':
      s.moveTo(-r * 0.85, -r * 0.85);
      s.lineTo(r * 0.85, -r * 0.85);
      s.lineTo(r * 0.85, r * 0.85);
      s.lineTo(-r * 0.85, r * 0.85);
      s.closePath();
      break;
    case 'rechthoek':
      s.moveTo(-r * 1.5, -r * 0.65);
      s.lineTo(r * 1.5, -r * 0.65);
      s.lineTo(r * 1.5, r * 0.65);
      s.lineTo(-r * 1.5, r * 0.65);
      s.closePath();
      break;
    case 'driehoek':
      poly(3, Math.PI / 2);
      break;
    case 'vijfhoek':
      poly(5, Math.PI / 2);
      break;
    case 'ruit':
      poly(4, Math.PI / 2, 1, 1);
      break;
    case 'parallellogram':
      s.moveTo(-r * 1.4, -r * 0.6);
      s.lineTo(r * 0.8, -r * 0.6);
      s.lineTo(r * 1.4, r * 0.6);
      s.lineTo(-r * 0.8, r * 0.6);
      s.closePath();
      break;
  }
  return s;
}

const PERKEN: { soort: string; kleur: string; pos: [number, number] }[] = [
  { soort: 'cirkel', kleur: '#e5675a', pos: [-5.4, -1.9] },
  { soort: 'vierkant', kleur: '#4f78a8', pos: [-1.8, -1.9] },
  { soort: 'rechthoek', kleur: '#f2d04a', pos: [2.2, -1.9] },
  { soort: 'ovaal', kleur: '#7cbf4a', pos: [5.9, -1.9] },
  { soort: 'driehoek', kleur: '#f2c24a', pos: [-5.4, 1.9] },
  { soort: 'vijfhoek', kleur: '#3fa08f', pos: [-1.8, 1.9] },
  { soort: 'ruit', kleur: '#8b6bb5', pos: [1.8, 1.9] },
  { soort: 'parallellogram', kleur: '#f2a64a', pos: [5.6, 1.9] },
];

/** INS-11: parkje met 8 bloemperken in verschillende vormen. */
export function Bloemperken() {
  return (
    <group>
      <Blok size={[14.5, 0.04, 8]} pos={[0, 0.02, 0]} color={P.grasDonker} r={0.02} shadow={false} />
      {PERKEN.map((p, i) => {
        const vorm = perkVorm(p.soort);
        const rnd = seeded(i + 3);
        const bloemen = Array.from({ length: 16 }, () => [(rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.2] as [number, number]);
        return (
          <group key={i} position={[p.pos[0], 0, p.pos[1]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} castShadow receiveShadow material={mat('#8d5f3a')}>
              <extrudeGeometry args={[vorm, { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 2 }]} />
            </mesh>
            {bloemen
              .filter(([x, z]) => vorm.getPoints(24).length && pointInShape(vorm, x, -z))
              .map(([x, z], j) => (
                <mesh key={j} position={[x, 0.3, z]} castShadow material={mat(p.kleur)}>
                  <icosahedronGeometry args={[0.13, 0]} />
                </mesh>
              ))}
            <Nummerpaal nr={i + 1} pos={[0, 0, 1.35]} />
          </group>
        );
      })}
      <Struik pos={[6.6, 0, 0.1]} s={0.8} />
      <Bankje pos={[0, 0, 0]} />
    </group>
  );
}

function pointInShape(shape: THREE.Shape, x: number, y: number) {
  const pts = shape.getPoints(32);
  let binnen = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) binnen = !binnen;
  }
  return binnen;
}

/** INS-12: speeltuin met 7 klimtoestellen in de vorm van 3D-figuren. */
export function Speeltuin() {
  const merel = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (merel.current) merel.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.6;
  });
  const z1 = -1.9;
  const z2 = 2.2;
  return (
    <group>
      <Blok size={[14, 0.05, 9]} pos={[0, 0.025, 0]} color="#e8d5a8" r={0.02} shadow={false} />
      {/* 1 kubus */}
      <group position={[-5.2, 0, z1]}>
        <Blok size={[1.6, 1.6, 1.6]} pos={[0, 0.8, 0]} color={P.oranje} r={0.08} />
        <Nummerpaal nr={1} pos={[0, 0, 1.3]} />
      </group>
      {/* 2 balk */}
      <group position={[-2.2, 0, z1]}>
        <Blok size={[1.0, 2.4, 1.0]} pos={[0, 1.2, 0]} color="#7cbf4a" r={0.08} />
        <Nummerpaal nr={2} pos={[0, 0, 1.3]} />
      </group>
      {/* 3 bol */}
      <group position={[0.8, 0, z1]}>
        <mesh position={[0, 0.85, 0]} castShadow material={mat('#e5675a')}>
          <sphereGeometry args={[0.85, 24, 18]} />
        </mesh>
        <group ref={merel} position={[0, 1.72, 0]}>
          <Blok size={[0.16, 0.14, 0.26]} color="#2b2726" r={0.06} />
          <mesh position={[0, 0.02, 0.16]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2c24a')}>
            <coneGeometry args={[0.035, 0.08, 6]} />
          </mesh>
        </group>
        <Nummerpaal nr={3} pos={[0, 0, 1.3]} />
      </group>
      {/* 4 kegel */}
      <group position={[3.6, 0, z1]}>
        <mesh position={[0, 1.1, 0]} castShadow material={mat('#c99a3a')}>
          <coneGeometry args={[0.95, 2.2, 32]} />
        </mesh>
        <Nummerpaal nr={4} pos={[0, 0, 1.3]} />
      </group>
      {/* 5 prisma (glijbaan) */}
      <group position={[-4.2, 0, z2]}>
        <mesh position={[0, 0.0, -0.7]} castShadow material={mat('#5fa8c9')}>
          <extrudeGeometry
            args={[
              new THREE.Shape([new THREE.Vector2(-1, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0.2, 1.5)]),
              { depth: 1.4, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 },
            ]}
          />
        </mesh>
        <Nummerpaal nr={5} pos={[0, 0, 2.1]} />
      </group>
      {/* 6 piramide */}
      <group position={[-0.6, 0, z2 + 0.6]}>
        <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow material={mat('#f2d04a')}>
          <coneGeometry args={[1.3, 2.0, 4]} />
        </mesh>
        <Nummerpaal nr={6} pos={[0, 0, 1.5]} />
      </group>
      {/* 7 cilinder (kruiptunnel) */}
      <group position={[3.4, 0, z2 + 0.6]}>
        <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={mat('#3f8f5a')}>
          <cylinderGeometry args={[0.7, 0.7, 2.4, 28]} />
        </mesh>
        <Nummerpaal nr={7} pos={[0, 0, 1.5]} />
      </group>
      <Haag size={[0.5, 0.6, 9]} pos={[7.2, 0, 0]} />
    </group>
  );
}

/** Kleine helper zodat modellen weten of ze in de inspectie staan (bv. dak doorzichtig). */
export function useInInspectie() {
  const ctx = useInspectie();
  const uit = useSpel((s) => s.uit);
  return { actief: ctx.delen, uit };
}
