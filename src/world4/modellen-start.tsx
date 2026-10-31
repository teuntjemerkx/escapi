// Wereld 4 – voorwerpen voor de terugblik, de uitleg (procentenbalk) en "Samen oefenen" (instap).
// Elk voorwerp past in een kamer (max. ±3 × 3 m vloer). Oorsprong midden op de vloer, voorkant naar +z.
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useOpgelost } from '../game/opgelost';
import { Deel } from '../game/inspectie';
import { Blok, Cil, mat } from '../game/kit';
import { rondRect } from '../game/tekst';
import { Beloning, Bord, Doek, Kledingrek, NaGoed, PaalBord, Paspop, Poppetje, Prijskaartje, Shirt, Sokkel, Tafel, tekstRegel, useSchuif } from './winkels';

type V3 = [number, number, number];

// ─────────────────────────── Terugblik ───────────────────────────

/** Terugblik: reep chocola van 4 rijen van 5 stukjes. Eén rij (een kwart) schuift naar voren. */
export function Reep() {
  const s = 0.15;
  const stukje = (kol: number, rij: number) => (
    <group key={`${kol}-${rij}`} position={[(kol - 2) * s, 0.03, (rij - 1.5) * s]}>
      <Blok size={[s * 0.92, 0.045, s * 0.92]} color="#6b3f24" r={0.012} />
      <Blok size={[s * 0.6, 0.02, s * 0.6]} pos={[0, 0.028, 0]} color="#7a4a2c" r={0.008} shadow={false} />
    </group>
  );
  return (
    <group>
      <group>
        {/* open wikkel */}
        <Blok size={[5 * s + 0.2, 0.012, 4 * s + 0.24]} pos={[0, 0.006, -0.02]} color="#d9d2c4" r={0.004} shadow={false} />
        <Blok size={[5 * s + 0.24, 0.02, 0.36]} pos={[0, 0.03, -2 * s - 0.28]} rot={[-0.5, 0, 0]} color="#c0392b" r={0.008} />
        <Deel id="reep" uit={[0, 0.3, -0.25]} label="Hele reep: 4 rijen van 5 stukjes">
          {[0, 1, 2].flatMap((rij) => [0, 1, 2, 3, 4].map((kol) => stukje(kol, rij)))}
        </Deel>
        <Deel id="kwart" uit={[0, 0.25, 0.45]} label="Een kwart: 1 rij">
          {[0, 1, 2, 3, 4].map((kol) => stukje(kol, 3))}
        </Deel>
        <group position={[0, 0, -0.32]}>
          <Blok size={[0.62, 0.3, 0.04]} pos={[0, 0.17, 0]} rot={[-0.25, 0, 0]} color="#c0392b" r={0.015} />
          <Bord regels={['Reep chocola', '4 rijen van 5']} b={0.56} h={0.24} pos={[0, 0.175, 0.025]} rot={[-0.25, 0, 0]} bg="#c0392b" fg="#ffffff" />
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── Uitleg: de procentenbalk ───────────────────────────

const BALK_B = 2.4;
const VAK = BALK_B / 10;

/** Uitleg: een kortingsscanner = procentenbalk op een standaard, met een rugzak van € 70 en 30% korting. */
export function Kortingsscanner() {
  const vak = (i: number, kleur: string) => <Blok key={i} size={[VAK - 0.02, 0.3, 0.08]} pos={[-BALK_B / 2 + VAK * (i + 0.5), 0, 0]} color={kleur} r={0.02} />;
  return (
    <group>
      {/* standaard */}
      <group position={[0, 0, -0.35]}>
        {[-1, 1].map((x) => (
          <group key={x}>
            <Blok size={[0.1, 1.9, 0.1]} pos={[x * (BALK_B / 2 + 0.15), 0.95, 0]} color="#3b4442" r={0.03} />
            <Blok size={[0.12, 0.05, 0.5]} pos={[x * (BALK_B / 2 + 0.15), 0.025, 0]} color="#3b4442" r={0.02} />
          </group>
        ))}
        <Deel id="balk" uit={[0, 0, 0]} label="De hele balk: 100% = € 70">
          <Blok size={[BALK_B + 0.4, 1.0, 0.06]} pos={[0, 1.45, -0.05]} color="#fbf6ec" r={0.04} />
          <Doek
            b={BALK_B + 0.3}
            h={0.24}
            pos={[0, 1.79, -0.015]}
            sleutel="balk-boven2"
            ppm={600}
            teken={(ctx, w, h) => {
              ctx.fillStyle = '#fbf6ec';
              ctx.fillRect(0, 0, w, h);
              const x0 = (0.15 / (BALK_B + 0.3)) * w;
              const stap = (VAK / (BALK_B + 0.3)) * w;
              for (let i = 0; i <= 10; i++) {
                tekstRegel(ctx, `${i * 10}%`, x0 + i * stap, h * 0.5, Math.min(h * 0.6, stap * 0.36), '#1f2a24', 700, 'center');
              }
            }}
          />
          <Doek
            b={BALK_B + 0.3}
            h={0.22}
            pos={[0, 1.12, -0.015]}
            sleutel="balk-onder"
            ppm={520}
            teken={(ctx, w, h) => {
              ctx.fillStyle = '#fbf6ec';
              ctx.fillRect(0, 0, w, h);
              const x0 = (0.15 / (BALK_B + 0.3)) * w;
              tekstRegel(ctx, '€ 0', x0, h * 0.5, h * 0.7, '#2f5d46', 700, 'left');
              tekstRegel(ctx, '€ 70', w - x0, h * 0.5, h * 0.7, '#2f5d46', 700, 'right');
            }}
          />
        </Deel>
        <group position={[0, 1.45, 0.02]}>
          <Deel id="tiende" uit={[0, 0.75, 0.3]} label="10% = een tiende">
            {vak(0, '#f2a64a')}
          </Deel>
          <Deel id="korting" uit={[0, 0.75, 0.3]} label="Korting: 30%">
            {[1, 2].map((i) => vak(i, '#f2a64a'))}
          </Deel>
          <Deel id="betalen" uit={[0, 0, 0.35]} label="Betalen: 70%">
            {[3, 4, 5, 6, 7, 8, 9].map((i) => vak(i, '#7cc35a'))}
          </Deel>
        </group>
        <Bord regels={['Kortingsscanner']} b={1.5} h={0.3} pos={[0, 2.22, -0.02]} bg="#3b4442" fg="#ffb02e" />
        <Blok size={[1.6, 0.36, 0.06]} pos={[0, 2.22, -0.06]} color="#3b4442" r={0.04} />
      </group>
      {/* toonbank met de rugzak */}
      <Tafel b={1.1} d={0.6} h={0.8} pos={[0, 0, 0.55]} />
      <group position={[-0.15, 0.8, 0.55]}>
        <Rugzak />
        <Prijskaartje tekst="€ 70" pos={[0.3, 0.3, 0.14]} rot={[0, 0, 0.1]} />
      </group>
      <PaalBord regels={['30% korting']} b={0.7} h={0.26} hoogte={0.95} pos={[0.95, 0, 0.6]} bg="#d83a2e" fg="#ffffff" />
    </group>
  );
}

function Rugzak() {
  return (
    <group>
      <Blok size={[0.42, 0.5, 0.24]} pos={[0, 0.25, 0]} color="#2f6f8f" r={0.1} />
      <Blok size={[0.32, 0.22, 0.08]} pos={[0, 0.17, 0.13]} color="#285d78" r={0.05} />
      <Blok size={[0.44, 0.14, 0.26]} pos={[0, 0.48, 0.01]} color="#285d78" r={0.06} />
      <Blok size={[0.06, 0.4, 0.04]} pos={[-0.12, 0.27, -0.13]} color="#1f4a60" r={0.02} />
      <Blok size={[0.06, 0.4, 0.04]} pos={[0.12, 0.27, -0.13]} color="#1f4a60" r={0.02} />
    </group>
  );
}

// ─────────────────────────── Samen oefenen ───────────────────────────

/** INS-01: kassa met € 80,00 op het scherm en vier briefjes van € 20 in de la. */
export function Kassa() {
  const af = useOpgelost('O4-INS-01');
  const la = useSchuif(af, 'z', -0.2, 0);
  return (
    <group>
      <Blok size={[1.5, 0.92, 0.7]} pos={[0, 0.46, 0]} color="#d9c7a8" r={0.05} />
      <Blok size={[1.6, 0.06, 0.8]} pos={[0, 0.95, 0]} color="#3b4442" r={0.03} />
      <group position={[-0.1, 0.98, -0.05]}>
        <Blok size={[0.55, 0.14, 0.42]} pos={[0, 0.07, 0]} color="#2f3634" r={0.04} />
        <Blok size={[0.42, 0.04, 0.2]} pos={[0, 0.16, 0.06]} rot={[-0.3, 0, 0]} color="#4a5356" r={0.02} />
        {/* scherm */}
        <Blok size={[0.06, 0.28, 0.06]} pos={[0, 0.3, -0.12]} color="#2f3634" r={0.02} />
        <group position={[0, 0.5, -0.12]} rotation={[-0.15, 0, 0]}>
          <Blok size={[0.5, 0.24, 0.06]} color="#2f3634" r={0.03} />
          <Doek b={0.44} h={0.18} pos={[0, 0, 0.032]} sleutel="kassa-80" licht teken={(ctx, w, h) => {
            ctx.fillStyle = '#0f2b1f';
            ctx.fillRect(0, 0, w, h);
            tekstRegel(ctx, '€ 80,00', w / 2, h * 0.55, h * 0.62, '#7dffb0', 700, 'center');
          }} />
        </group>
        {/* geldla met vier briefjes van € 20 */}
        <Deel id="geld" uit={[0, 0.35, 0.35]} label="€ 80 in de la">
          <group position={[0, 0.02, 0.3]}>
           <group ref={la}>
            <Blok size={[0.52, 0.08, 0.3]} pos={[0, 0, 0]} color="#3b4442" r={0.02} />
            <Doek
              b={0.46}
              h={0.24}
              pos={[0, 0.045, 0]}
              rot={[-Math.PI / 2, 0, 0]}
              sleutel="briefjes-20"
              teken={(ctx, w, h) => {
                ctx.fillStyle = '#2f3634';
                ctx.fillRect(0, 0, w, h);
                for (let i = 0; i < 4; i++) {
                  const x = (w / 4) * i + 6;
                  ctx.fillStyle = '#7fb3d9';
                  rondRect(ctx, x, h * 0.1, w / 4 - 12, h * 0.8, 8);
                  ctx.fill();
                  tekstRegel(ctx, '€ 20', x + (w / 4 - 12) / 2, h * 0.5, h * 0.24, '#1d3a6b', 700, 'center');
                }
              }}
            />
           </group>
          </group>
        </Deel>
        {/* na het goede antwoord gaat de la open en verschijnt de uitkomst */}
        <NaGoed ids={['O4-INS-01']} pos={[0, 0.95, 0.1]}>
          <Beloning tekst={['50% van € 80', '= € 40']} b={0.6} h={0.26} />
        </NaGoed>
      </group>
      {/* sticker 50% */}
      <group position={[0.55, 0.98, 0.1]} rotation={[0, -0.3, 0]}>
        <Cil r={0.025} h={0.3} pos={[0, 0.15, 0]} color="#9aa3a8" seg={8} />
        <Doek b={0.36} h={0.36} pos={[0, 0.45, 0]} sleutel="sticker-50" transparant dubbel teken={(ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = '#d83a2e';
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
          ctx.fill();
          tekstRegel(ctx, '50%', w / 2, h * 0.53, h * 0.36, '#ffffff', 700, 'center');
        }} />
      </group>
    </group>
  );
}

/** INS-02: rek met T-shirts; het middelste kost € 30. Bordje: 25% korting. */
export function Tshirts() {
  const kleuren = ['#5aa9ff', '#f2a64a', '#e5675a', '#7cc35a'];
  return (
    <group>
      <Kledingrek b={1.7} hoogte={1.6} pos={[-0.25, 0, 0]} />
      {kleuren.map((k, i) => (
        <Shirt key={i} kleur={k} pos={[-0.25 + (i - 1.5) * 0.42, 1.58, 0.02 + (i === 2 ? 0.08 : 0)]} s={i === 2 ? 1.05 : 0.95} />
      ))}
      <Prijskaartje tekst="€ 30" pos={[-0.25 + 0.5 * 0.42 + 0.2, 1.26, 0.16]} rot={[0, 0, -0.15]} />
      <PaalBord regels={['25% korting']} b={0.8} h={0.3} hoogte={1.05} pos={[1.05, 0, 0.25]} rot={[0, -0.3, 0]} bg="#d83a2e" fg="#ffffff" />
    </group>
  );
}

/** INS-03: een klas van 20 krukjes; 5 krukjes zijn leeg (afwezig). */
export function Klas() {
  const leeg = new Set([2, 6, 11, 13, 18]);
  const kleuren = ['#5aa9ff', '#e5675a', '#7cc35a', '#f2a64a', '#8b6bb5', '#2ec4b6'];
  const haar = ['#3b2a1e', '#e2c27a', '#1f1b18', '#9a5a2a'];
  return (
    <group>
      <Blok size={[2.9, 0.02, 2.3]} pos={[0, 0.01, 0.15]} color="#c96a5a" r={0.01} shadow={false} />
      {Array.from({ length: 20 }, (_, i) => {
        const kol = i % 5;
        const rij = Math.floor(i / 5);
        const x = (kol - 2) * 0.52;
        const z = -0.55 + rij * 0.52;
        return (
          <group key={i} position={[x, 0, z]}>
            <Cil r={0.15} rTop={0.16} h={0.26} pos={[0, 0.13, 0]} color={leeg.has(i) ? '#f4efe6' : '#8a5a36'} seg={12} />
            {!leeg.has(i) && <Poppetje pos={[0, 0.26, 0]} kleur={kleuren[i % kleuren.length]} haar={haar[i % haar.length]} s={0.78} zit />}
          </group>
        );
      })}
      {/* bord voor de klas */}
      <group position={[0, 0, -1.25]}>
        <Blok size={[0.08, 1.7, 0.08]} pos={[-0.8, 0.85, 0]} color="#3b4442" r={0.02} />
        <Blok size={[0.08, 1.7, 0.08]} pos={[0.8, 0.85, 0]} color="#3b4442" r={0.02} />
        <Blok size={[1.8, 0.95, 0.06]} pos={[0, 1.4, 0]} color="#3b4442" r={0.03} />
        <Bord regels={['Klas 2B', '20 studenten', 'Afwezig: 5']} b={1.7} h={0.85} pos={[0, 1.4, 0.035]} bg="#f6f6f2" fg="#1d3a6b" kleuren={[undefined, undefined, '#d83a2e']} rond={0.03} />
      </group>
    </group>
  );
}

/** INS-04: weegschaal met een zak noten van 200 gram; bordje "10% in een proefzakje". */
export function Weegschaal() {
  return (
    <group>
      <group position={[-0.2, 0, 0]}>
        <Blok size={[0.5, 0.1, 0.42]} pos={[0, 0.05, 0]} color="#e9e3d7" r={0.04} />
        <Cil r={0.2} h={0.03} pos={[0, 0.115, -0.02]} color="#c9cdd0" seg={24} />
        <Blok size={[0.3, 0.12, 0.06]} pos={[0, 0.08, 0.2]} rot={[-0.4, 0, 0]} color="#2f3634" r={0.02} />
        <Doek b={0.26} h={0.09} pos={[0, 0.085, 0.235]} rot={[-0.4, 0, 0]} sleutel="weeg-200" licht teken={(ctx, w, h) => {
          ctx.fillStyle = '#0f2b1f';
          ctx.fillRect(0, 0, w, h);
          tekstRegel(ctx, '200 g', w / 2, h * 0.55, h * 0.7, '#7dffb0', 700, 'center');
        }} />
        {/* zak noten op de schaal */}
        <group position={[0, 0.13, -0.02]}>
          <Blok size={[0.22, 0.26, 0.14]} pos={[0, 0.13, 0]} color="#c9a372" r={0.05} />
          <Blok size={[0.2, 0.06, 0.12]} pos={[0, 0.28, 0]} color="#b98d55" r={0.02} />
          <Bord regels={['Noten']} b={0.16} h={0.07} pos={[0, 0.14, 0.072]} bg="#f6efe2" fg="#5a3b1f" />
        </group>
      </group>
      {/* proefzakje en schepje */}
      <group position={[0.4, 0, 0.05]}>
        <Blok size={[0.1, 0.12, 0.06]} pos={[0, 0.06, 0]} color="#f6efe2" r={0.02} />
        <Blok size={[0.16, 0.03, 0.06]} pos={[0.15, 0.015, 0.1]} rot={[0, 0.4, 0]} color="#c9cdd0" r={0.01} />
      </group>
      <PaalBord regels={['Proefzakje:', '10% van de zak']} b={0.6} h={0.32} hoogte={0.42} pos={[0.42, 0, -0.2]} bg="#fbf6ec" fg="#5a3b1f" />
    </group>
  );
}

/** INS-05: grote spaarpot met € 600 spaargeld; bord "2% rente per jaar". */
export function Spaarpot() {
  const roze = '#f2a2b8';
  return (
    <group>
      <Sokkel b={0.9} h={0.7} d={0.7} />
      <group position={[0, 0.72, 0]}>
        <mesh position={[0, 0.36, 0]} scale={[1.15, 0.9, 0.9]} castShadow material={mat(roze)}>
          <sphereGeometry args={[0.32, 20, 16]} />
        </mesh>
        <Cil r={0.1} h={0.1} pos={[0.4, 0.36, 0]} rot={[0, 0, Math.PI / 2]} color="#e88aa3" seg={14} />
        {[-0.04, 0.04].map((z) => (
          <mesh key={z} position={[0.455, 0.37, z]} material={mat('#b35a72')}>
            <sphereGeometry args={[0.016, 8, 6]} />
          </mesh>
        ))}
        {[-0.1, 0.1].map((z) => (
          <mesh key={z} position={[0.25, 0.62, z]} rotation={[0, 0, -0.4]} castShadow material={mat('#e88aa3')}>
            <coneGeometry args={[0.06, 0.12, 8]} />
          </mesh>
        ))}
        {[
          [-0.2, -0.13],
          [0.2, -0.13],
          [-0.2, 0.13],
          [0.2, 0.13],
        ].map(([x, z], i) => (
          <Cil key={i} r={0.05} h={0.12} pos={[x, 0.06, z]} color="#e88aa3" seg={10} />
        ))}
        <Blok size={[0.16, 0.012, 0.03]} pos={[0, 0.65, 0]} color="#3b2a2e" r={0.004} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Cil key={i} r={0.06} h={0.018} pos={[-0.28 + (i % 2) * 0.012, 0.01 + i * 0.02, 0.24]} color="#e6c95b" seg={16} />
        ))}
      </group>
      <PaalBord regels={['Spaarrekening', 'Spaargeld: € 600', 'Rente: 2% per jaar']} b={1.0} h={0.62} hoogte={1.78} pos={[0, 0, -0.5]} bg="#fbf6ec" fg="#1d3a6b" />
    </group>
  );
}

/** INS-06: broek op een paspop, € 40. Bord: de prijs gaat 10% omhoog. */
export function Broek() {
  return (
    <group>
      <group position={[-0.25, 0, 0]}>
        <Cil r={0.24} h={0.05} pos={[0, 0.025, 0]} color="#3b3a39" seg={18} />
        <Cil r={0.025} h={0.3} pos={[0, 0.17, 0]} color="#3b3a39" seg={8} />
        <Blok size={[0.17, 0.95, 0.19]} pos={[-0.1, 0.8, 0]} color="#3f5f8f" r={0.07} />
        <Blok size={[0.17, 0.95, 0.19]} pos={[0.1, 0.8, 0]} color="#3f5f8f" r={0.07} />
        <Blok size={[0.42, 0.24, 0.22]} pos={[0, 1.35, 0]} color="#3f5f8f" r={0.07} />
        <Blok size={[0.43, 0.05, 0.23]} pos={[0, 1.45, 0]} color="#8a5a36" r={0.02} />
        <Blok size={[0.36, 0.3, 0.2]} pos={[0, 1.62, 0]} color="#efe6d6" r={0.08} />
        <Prijskaartje tekst="€ 40" pos={[0.3, 1.25, 0.12]} rot={[0, 0, -0.2]} />
      </group>
      <group position={[0.65, 0, 0.15]} rotation={[0, -0.35, 0]}>
        <PaalBord regels={['Let op!', 'Prijs + 10%']} b={0.75} h={0.42} hoogte={1.15} bg="#fbf6ec" fg="#1f2a24" kleuren={[undefined, '#d83a2e']} />
        {/* pijl omhoog */}
        <mesh position={[0, 1.65, 0]} material={mat('#d83a2e')} castShadow>
          <coneGeometry args={[0.12, 0.2, 3]} />
        </mesh>
        <Blok size={[0.07, 0.14, 0.07]} pos={[0, 1.48, 0]} color="#d83a2e" r={0.02} />
      </group>
    </group>
  );
}

/** INS-07: jas op een paspop, € 80. Bord: 15% korting. */
export function Jas() {
  const groen = '#5a7a4a';
  return (
    <group>
      <Paspop pos={[-0.25, 0, 0]}>
        <Blok size={[0.5, 0.95, 0.3]} pos={[0, 0.98, 0]} color={groen} r={0.1} />
        <Blok size={[0.14, 0.7, 0.16]} pos={[-0.31, 1.05, 0]} rot={[0, 0, 0.12]} color={groen} r={0.06} />
        <Blok size={[0.14, 0.7, 0.16]} pos={[0.31, 1.05, 0]} rot={[0, 0, -0.12]} color={groen} r={0.06} />
        <Blok size={[0.3, 0.1, 0.32]} pos={[0, 1.42, 0]} color="#4a6a3c" r={0.04} />
        {[0, 1, 2].map((i) => (
          <Cil key={i} r={0.022} h={0.02} pos={[0.04, 1.2 - i * 0.18, 0.155]} rot={[Math.PI / 2, 0, 0]} color="#2f2a24" seg={10} />
        ))}
        <Prijskaartje tekst="€ 80" pos={[0.38, 0.8, 0.12]} rot={[0, 0, -0.2]} />
      </Paspop>
      <PaalBord regels={['15% korting']} b={0.8} h={0.3} hoogte={1.05} pos={[0.7, 0, 0.2]} rot={[0, -0.35, 0]} bg="#d83a2e" fg="#ffffff" />
    </group>
  );
}

/** INS-08: speelkast "Rekenquiz" met de score 18 van de 20 punten. */
export function Quizkast() {
  return (
    <group>
      <Blok size={[0.95, 1.1, 0.75]} pos={[0, 0.55, 0]} color="#d9534f" r={0.06} />
      <Blok size={[0.95, 0.9, 0.5]} pos={[0, 1.55, -0.12]} color="#d9534f" r={0.06} />
      <Blok size={[0.97, 0.06, 0.78]} pos={[0, 1.1, 0.0]} color="#2f3634" r={0.02} />
      {/* bedieningspaneel */}
      <group position={[0, 1.12, 0.22]} rotation={[-0.35, 0, 0]}>
        <Blok size={[0.85, 0.05, 0.32]} color="#2f3634" r={0.02} />
        {['#ffc94d', '#5aa9ff', '#7cc35a', '#e86f8a'].map((k, i) => (
          <Cil key={i} r={0.04} h={0.04} pos={[-0.25 + i * 0.16, 0.04, 0.02]} color={k} seg={14} />
        ))}
      </group>
      {/* scherm */}
      <group position={[0, 1.58, 0.14]} rotation={[-0.12, 0, 0]}>
        <Blok size={[0.8, 0.62, 0.05]} color="#16191b" r={0.03} />
        <Doek b={0.72} h={0.54} pos={[0, 0, 0.03]} sleutel="quiz-18" licht teken={(ctx, w, h) => {
          ctx.fillStyle = '#1d2a6b';
          ctx.fillRect(0, 0, w, h);
          tekstRegel(ctx, 'REKENQUIZ', w / 2, h * 0.16, h * 0.13, '#ffc94d', 700, 'center');
          tekstRegel(ctx, 'Je score:', w / 2, h * 0.42, h * 0.12, '#ffffff', 600, 'center');
          tekstRegel(ctx, '18 van 20', w / 2, h * 0.64, h * 0.19, '#7dffb0', 700, 'center');
          tekstRegel(ctx, 'punten', w / 2, h * 0.86, h * 0.12, '#ffffff', 600, 'center');
        }} />
      </group>
      <Blok size={[0.97, 0.3, 0.55]} pos={[0, 2.12, -0.12]} color="#2f3634" r={0.05} />
      <Bord regels={['QUIZ']} b={0.8} h={0.24} pos={[0, 2.12, 0.16]} bg="#2f3634" fg="#ffc94d" licht />
    </group>
  );
}

function Sneaker({ pos, rot, kleur = '#e5675a' }: { pos: V3; rot?: V3; kleur?: string }) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[0.12, 0.04, 0.32]} pos={[0, 0.02, 0]} color="#fbfaf6" r={0.018} />
      <Blok size={[0.11, 0.09, 0.2]} pos={[0, 0.085, -0.05]} color={kleur} r={0.035} />
      <Blok size={[0.1, 0.06, 0.13]} pos={[0, 0.065, 0.09]} color={kleur} r={0.03} />
      <Blok size={[0.06, 0.012, 0.1]} pos={[0, 0.13, 0.0]} color="#fbfaf6" r={0.004} />
    </group>
  );
}

/** INS-09: sneakers op een sokkel: was € 50, nu € 35. */
export function Sneakers() {
  return (
    <group>
      <Sokkel b={0.8} h={0.95} d={0.6} />
      <group position={[0, 0.98, 0]} scale={1.6}>
        <Sneaker pos={[-0.09, 0, 0]} rot={[0, 0.25, 0]} />
        <Sneaker pos={[0.09, 0, -0.02]} rot={[0, -0.15, 0]} />
      </group>
      <Prijskaartje tekst="€ 50" pos={[-0.2, 0.62, 0.31]} oud b={0.3} h={0.17} />
      <Prijskaartje tekst="€ 35" pos={[0.2, 0.62, 0.31]} b={0.3} h={0.17} bg="#d83a2e" />
      <Bord regels={['was']} b={0.3} h={0.13} pos={[-0.2, 0.8, 0.302]} bg="#f4efe6" groot={0.9} />
      <Bord regels={['nu']} b={0.3} h={0.13} pos={[0.2, 0.8, 0.302]} bg="#f4efe6" fg="#d83a2e" groot={0.9} />
    </group>
  );
}

/** INS-10: maquette van een bioscoopzaal met 120 stoelen (10 rijen van 12, met een gangpad). */
export function Bioscoop() {
  return (
    <group>
      <group>
        <Blok size={[1.4, 0.04, 0.95]} pos={[0, 0.02, 0]} color="#3b3a39" r={0.01} />
        {/* oplopende vloer met rijen stoelen */}
        {Array.from({ length: 10 }, (_, rij) => {
          const y = 0.04 + 0.035 * (rij + 1);
          const z = -0.25 + rij * 0.075;
          return (
            <group key={rij}>
              <Blok size={[1.36, 0.035 * (rij + 1), 0.075]} pos={[0, 0.04 + (0.035 * (rij + 1)) / 2, z]} color="#5a3a46" r={0.004} shadow={false} />
              {[-1, 1].map((kant) => (
                <group key={kant} position={[kant * 0.33, y, z]}>
                  <Blok size={[0.6, 0.03, 0.05]} pos={[0, 0.015, 0.005]} color="#c0392b" r={0.008} />
                  <Blok size={[0.6, 0.05, 0.014]} pos={[0, 0.035, 0.026]} color="#a82e22" r={0.006} />
                </group>
              ))}
            </group>
          );
        })}
        {/* filmdoek en wanden */}
        <Blok size={[1.4, 0.5, 0.04]} pos={[0, 0.27, -0.45]} color="#2a1f25" r={0.01} />
        <Blok size={[1.1, 0.32, 0.01]} pos={[0, 0.3, -0.425]} color="#f4f4ee" r={0.002} shadow={false} />
        <Blok size={[0.04, 0.5, 0.95]} pos={[-0.7, 0.27, 0]} color="#7a3b5a" r={0.01} />
      </group>
      <PaalBord regels={['Zaal 1', '120 bezoekers', '75% is vrouw']} b={0.8} h={0.48} hoogte={0.8} pos={[0, 0, -0.52]} bg="#2a1f25" fg="#ffffff" kleuren={['#ffc94d']} />
    </group>
  );
}

/** Kleine animatie: draait een groep langzaam rond (voor stickers en sokkels). */
export function Draai({ snel = 0.6, children }: { snel?: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * snel;
  });
  return <group ref={ref}>{children}</group>;
}

