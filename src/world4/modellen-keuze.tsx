// Wereld 4 – voorwerpen voor de keuzestations: extra opdrachten (expert), de buitenmissies (praktijk) en de puzzels.
// Elk voorwerp past in een kamer (max. ±3 × 3 m vloer). Oorsprong midden op de vloer, voorkant naar +z.
// Grote dingen (reuzenrad) zijn een maquette op een tafel.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGroei, useOpgelost } from '../game/opgelost';
import { Blok, Cil, mat } from '../game/kit';
import { rondRect } from '../game/tekst';
import { Draai } from './modellen-start';
import { Beloning, Bord, Doek, Kraam, NaGoed, PaalBord, Poppetje, Prijskaartje, Scherm, Sokkel, Tafel, tekstBlok, tekstRegel } from './winkels';

type V3 = [number, number, number];

// ─────────────────────────── EXP-03: Oma's Snoepwinkeltje ───────────────────────────

const FILIALEN: [string, string, string, string][] = [
  ['Amsterdam', '€ 534.000', '€ 69.000', '#e5675a'],
  ['Deventer', '€ 389.000', '€ 62.000', '#7cc35a'],
  ['Den Bosch', '€ 331.000', '€ 46.000', '#f2a64a'],
];

function Snoeppot({ kleur, naam, pos, pct }: { kleur: string; naam: string; pos: V3; pct: number }) {
  const af = useOpgelost('O4-EXP-03');
  const vulling = useGroei(af, 0.4);
  const hoog = (pct / 16) * 0.3;
  const glas = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e6f4f7', transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false }), []);
  return (
    <group position={pos}>
      <Cil r={0.15} h={0.04} pos={[0, 0.02, 0]} color="#d9e8ec" seg={20} />
      {/* na het goede antwoord: gevuld tot het percentage winst */}
      <group ref={vulling} position={[0, 0.04, 0]}>
        <Cil r={0.135} h={hoog} pos={[0, hoog / 2, 0]} color={kleur} seg={18} />
      </group>
      {/* snoepjes */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * 2.3) * 0.08, 0.07 + Math.floor(i / 3) * 0.05, Math.sin(i * 2.3) * 0.08]} castShadow material={mat(i % 3 === 0 ? '#ffffff' : kleur)}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0]} material={glas}>
        <cylinderGeometry args={[0.15, 0.15, 0.36, 24, 1, true]} />
      </mesh>
      <Cil r={0.12} h={0.05} pos={[0, 0.4, 0]} color="#c96a8a" seg={20} />
      <mesh position={[0, 0.44, 0]} material={mat('#c96a8a')}>
        <sphereGeometry args={[0.035, 10, 8]} />
      </mesh>
      <Bord regels={[naam]} b={0.3} h={0.08} pos={[0, 0.12, 0.155]} bg="#fbf6ec" fg="#7a2b4a" groot={0.8} />
    </group>
  );
}

/** EXP-03: krijtbord "Jaarcijfers Oma's Snoepwinkeltje", drie snoeppotten en oma in de schommelstoel. */
export function Snoepwinkel() {
  const stoel = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (stoel.current) stoel.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.4) * 0.12;
  });
  return (
    <group>
      {/* krijtbord */}
      <group position={[0, 0, -0.6]}>
        {[-1.12, 1.12].map((x) => (
          <Blok key={x} size={[0.08, 2.5, 0.08]} pos={[x, 1.25, 0]} color="#8a5a36" r={0.02} />
        ))}
        <Blok size={[2.3, 1.2, 0.06]} pos={[0, 1.85, 0]} color="#8a5a36" r={0.03} />
        <Doek
          b={2.16}
          h={1.06}
          pos={[0, 1.85, 0.035]}
          sleutel="snoep-jaarcijfers"
          ppm={850}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#2f3b33';
            ctx.fillRect(0, 0, w, h);
            const krijt = '#f4f1e8';
            tekstRegel(ctx, "Jaarcijfers Oma's Snoepwinkeltje", w / 2, h * 0.11, h * 0.09, '#ffd8e4', 700, 'center');
            const kol = [w * 0.06, w * 0.42, w * 0.72];
            const y0 = h * 0.29;
            ['Filiaal', 'Omzet', 'Winst'].forEach((t, i) => tekstRegel(ctx, t, kol[i], y0, h * 0.085, '#ffe08a', 700));
            ctx.strokeStyle = krijt;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(w * 0.05, h * 0.37);
            ctx.lineTo(w * 0.95, h * 0.37);
            ctx.stroke();
            FILIALEN.forEach(([naam, omzet, winst], i) => {
              const y = h * (0.5 + i * 0.16);
              tekstRegel(ctx, naam, kol[0], y, h * 0.085, krijt, 600);
              tekstRegel(ctx, omzet, kol[1], y, h * 0.085, krijt, 600);
              tekstRegel(ctx, winst, kol[2], y, h * 0.085, krijt, 600);
            });
          }}
        />
        <Blok size={[2.3, 0.05, 0.12]} pos={[0, 1.23, 0.05]} color="#8a5a36" r={0.02} />
      </group>
      {/* toonbank met potten */}
      <group position={[0.25, 0, 0.25]}>
        <Blok size={[1.7, 0.9, 0.55]} pos={[0, 0.45, 0]} color="#f2c6d4" r={0.05} />
        <Blok size={[1.78, 0.06, 0.63]} pos={[0, 0.93, 0]} color={'#b6773e'} r={0.02} />
        {FILIALEN.map(([naam], i) => (
          <group key={naam}>
            <Blok size={[0.48, 0.6, 0.02]} pos={[-0.55 + i * 0.55, 0.45, 0.28]} color="#e9a8bd" r={0.02} />
            <Bord regels={[naam]} b={0.46} h={0.16} pos={[-0.55 + i * 0.55, 0.62, 0.292]} bg="#fbf6ec" fg="#7a2b4a" groot={0.85} />
          </group>
        ))}
        {FILIALEN.map(([naam, , , k], i) => (
          <Snoeppot key={naam} naam={naam} kleur={k} pct={[12.9, 15.9, 13.9][i]} pos={[-0.55 + i * 0.55, 0.96, 0]} />
        ))}
      </group>
      {/* oma in de schommelstoel */}
      <group position={[-0.95, 0, -0.1]} rotation={[0, 0.5, 0]}>
        <group ref={stoel}>
          <Blok size={[0.5, 0.06, 0.45]} pos={[0, 0.42, 0]} color="#8a5a36" r={0.02} />
          <Blok size={[0.5, 0.6, 0.06]} pos={[0, 0.75, -0.22]} rot={[-0.15, 0, 0]} color="#8a5a36" r={0.02} />
          {[-0.22, 0.22].map((x) => (
            <mesh key={x} position={[x, 0.08, 0]} rotation={[0, Math.PI / 2, 0]} material={mat('#6f4a2c')}>
              <torusGeometry args={[0.45, 0.025, 6, 16, Math.PI * 0.45]} />
            </mesh>
          ))}
          <Poppetje pos={[0, 0.45, 0]} kleur="#8b6bb5" haar="#e8e6e0" s={0.95} zit />
          <Blok size={[0.12, 0.08, 0.08]} pos={[0, 0.72, 0.2]} color="#e86f8a" r={0.03} />
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── EXP-02: voetbaltafel ───────────────────────────

const STANGEN: { n: number; team: 0 | 1 }[] = [
  { n: 1, team: 0 },
  { n: 2, team: 0 },
  { n: 3, team: 1 },
  { n: 5, team: 0 },
  { n: 5, team: 1 },
  { n: 3, team: 0 },
  { n: 2, team: 1 },
  { n: 1, team: 1 },
];

/** EXP-02: voetbaltafel (8 stangen), ster "Nu met 20% korting!", prijsbord € 399,00 en een winkelwagentje met +15% extra korting. */
export function Voetbaltafel() {
  const bal = useRef<THREE.Mesh>(null);
  const af = useOpgelost('O4-EXP-02');
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const b = bal.current;
    if (!b) return;
    if (af) b.position.lerp(new THREE.Vector3(0.6, 0.82, 0), Math.min(1, dt * 2));
    else b.position.set(Math.sin(t * 0.9) * 0.45, 0.82, Math.sin(t * 1.7) * 0.18);
  });
  return (
    <group>
      <group position={[-0.35, 0, 0]}>
        {[
          [-0.55, -0.28],
          [0.55, -0.28],
          [-0.55, 0.28],
          [0.55, 0.28],
        ].map(([x, z], i) => (
          <Blok key={i} size={[0.08, 0.7, 0.08]} pos={[x, 0.35, z]} color="#5d6166" r={0.02} />
        ))}
        <Blok size={[1.3, 0.25, 0.72]} pos={[0, 0.82, 0]} color="#8f969a" r={0.04} />
        <Blok size={[1.18, 0.02, 0.6]} pos={[0, 0.8, 0]} color="#5aa04a" r={0.005} />
        <Blok size={[0.01, 0.005, 0.58]} pos={[0, 0.812, 0]} color="#ffffff" r={0.002} shadow={false} />
        {/* stangen met poppetjes */}
        {STANGEN.map((s, i) => {
          const x = -0.52 + i * 0.148;
          return (
            <group key={i} position={[x, 0.9, 0]}>
              <Cil r={0.01} h={1.05} rot={[Math.PI / 2, 0, 0]} color="#c9cdd0" seg={6} />
              <Cil r={0.025} h={0.1} pos={[0, 0, 0.55]} rot={[Math.PI / 2, 0, 0]} color="#1b1b1b" seg={10} />
              {Array.from({ length: s.n }, (_, j) => (
                <Blok key={j} size={[0.035, 0.12, 0.05]} pos={[0, -0.04, (j - (s.n - 1) / 2) * (0.5 / Math.max(s.n, 2))]} color={s.team ? '#3d7cc9' : '#d9534f'} r={0.012} />
              ))}
            </group>
          );
        })}
        <mesh ref={bal} position={[0, 0.82, 0]} castShadow material={mat('#ffffff')}>
          <sphereGeometry args={[0.025, 10, 8]} />
        </mesh>
        <NaGoed ids={['O4-EXP-02']} pos={[0.45, 1.2, 0.25]}>
          <Beloning tekst={['GOAL! 32% korting']} b={0.7} h={0.18} />
        </NaGoed>
        {/* ster en prijsbord */}
        <group position={[0, 0, -0.45]}>
          <Cil r={0.025} h={1.9} pos={[0, 0.95, -0.03]} color="#3b4442" seg={8} />
          <Doek b={0.95} h={0.95} pos={[0, 2.05, 0]} sleutel="ster-20" transparant teken={(ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#f4f6f8');
            g.addColorStop(1, '#a9b3bb');
            ctx.fillStyle = g;
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
              const rr = i % 2 ? w * 0.27 : w * 0.49;
              const a = -Math.PI / 2 + (i * Math.PI) / 5;
              ctx.lineTo(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr);
            }
            ctx.closePath();
            ctx.fill();
            tekstRegel(ctx, 'Nu met', w / 2, h * 0.42, h * 0.085, '#1d3a6b', 700, 'center');
            tekstRegel(ctx, '20%', w / 2, h * 0.53, h * 0.12, '#d83a2e', 700, 'center');
            tekstRegel(ctx, 'korting!', w / 2, h * 0.64, h * 0.085, '#1d3a6b', 700, 'center');
          }} />
          <Blok size={[1.06, 0.42, 0.04]} pos={[0, 1.36, 0]} color="#3b4442" r={0.02} />
          <Bord regels={['Normale prijs', '€ 399,00']} b={1.0} h={0.36} pos={[0, 1.36, 0.022]} bg="#fbfaf6" />
        </group>
      </group>
      {/* winkelwagentje met het groene kaartje */}
      <group position={[0.85, 0, 0.15]} rotation={[0, -0.5, 0]}>
        <Winkelwagen />
        <group position={[0, 1.16, 0.42]} rotation={[0, 0.5, 0.04]}>
          <Blok size={[0.74, 0.4, 0.01]} color="#3f9e5a" r={0.01} />
          <Bord regels={['+15% extra korting', 'op de actieprijs']} b={0.7} h={0.36} pos={[0, 0, 0.007]} bg="#3f9e5a" fg="#ffffff" />
        </group>
      </group>
    </group>
  );
}

export function Winkelwagen() {
  const draad = '#c9cdd0';
  return (
    <group>
      {[
        [-0.22, -0.3],
        [0.22, -0.3],
        [-0.22, 0.3],
        [0.22, 0.3],
      ].map(([x, z], i) => (
        <Cil key={i} r={0.045} h={0.03} pos={[x, 0.045, z]} rot={[0, 0, Math.PI / 2]} color="#2c2f33" seg={10} />
      ))}
      <Blok size={[0.5, 0.03, 0.7]} pos={[0, 0.12, 0]} color={draad} r={0.01} />
      {[-0.24, 0.24].map((x) => (
        <Blok key={x} size={[0.025, 0.55, 0.025]} pos={[x, 0.38, 0.32]} color={draad} r={0.008} />
      ))}
      <Blok size={[0.5, 0.35, 0.7]} pos={[0, 0.68, 0]} color="#dfe5e8" r={0.02} opacity={0.45} />
      <Blok size={[0.52, 0.03, 0.72]} pos={[0, 0.86, 0]} color={draad} r={0.01} />
      <Cil r={0.02} h={0.56} pos={[0, 0.98, 0.42]} rot={[0, 0, Math.PI / 2]} color="#d9534f" seg={8} />
      {[-0.24, 0.24].map((x) => (
        <Blok key={x} size={[0.02, 0.18, 0.02]} pos={[x, 0.9, 0.4]} rot={[0.5, 0, 0]} color={draad} r={0.006} />
      ))}
    </group>
  );
}

// ─────────────────────────── EXP-08: crème ───────────────────────────

/** EXP-08: grote blauwe crèmepot op een sokkel; erboven een wereldbol met de tellers. */
export function Creme() {
  return (
    <group>
      <Sokkel b={0.85} h={0.85} d={0.75} pos={[-0.3, 0, 0.05]} />
      <group position={[-0.3, 0.88, 0.05]}>
        <Draai snel={0.35}>
          <Cil r={0.3} h={0.18} pos={[0, 0.09, 0]} color="#1d3a8f" seg={32} />
          <Cil r={0.27} h={0.012} pos={[0, 0.183, 0]} color="#fbfaf6" seg={32} />
          {/* glimlach in de crème */}
          <mesh position={[0, 0.19, 0.04]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#c9d6ee')}>
            <torusGeometry args={[0.1, 0.012, 6, 20, Math.PI]} />
          </mesh>
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.19, -0.06]} material={mat('#c9d6ee')}>
              <sphereGeometry args={[0.018, 8, 6]} />
            </mesh>
          ))}
        </Draai>
        {/* deksel staat schuin tegen de pot */}
        <group position={[0, -0.36, 0.42]} rotation={[1.3, 0, 0]}>
          <Cil r={0.31} h={0.06} color="#1d3a8f" seg={32} />
          <Bord regels={['Crème', 'al 100 jaar']} b={0.44} h={0.26} pos={[0, 0.032, 0]} rot={[-Math.PI / 2, 0, 0]} bg="#1d3a8f" fg="#ffffff" groot={0.8} />
        </group>
      </group>
      {/* wereldbol met tellers */}
      <group position={[0.5, 0, -0.1]}>
        <Cil r={0.2} h={0.05} pos={[0, 0.025, 0]} color="#3b4442" seg={18} />
        <Cil r={0.025} h={1.45} pos={[0, 0.75, 0]} color="#3b4442" seg={8} />
        <group position={[0, 1.65, 0]}>
          <Draai snel={0.5}>
            <mesh castShadow material={mat('#4f9fd6')}>
              <sphereGeometry args={[0.2, 20, 16]} />
            </mesh>
            {[
              [0.1, 0.08, 0.15],
              [-0.12, -0.02, 0.14],
              [0.05, -0.12, -0.15],
              [-0.1, 0.1, -0.13],
            ].map((p, i) => (
              <mesh key={i} position={p as V3} scale={[1, 0.7, 0.4]} material={mat('#7cc35a')}>
                <sphereGeometry args={[0.08, 10, 8]} />
              </mesh>
            ))}
          </Draai>
        </group>
        <group position={[0, 1.3, 0.03]}>
          <Blok size={[0.95, 0.42, 0.04]} color="#2f3634" r={0.03} />
          <Bord regels={['7 miljard mensen', 'op de wereld']} b={0.88} h={0.36} pos={[0, 0, 0.022]} bg="#2f3634" fg="#ffffff" licht />
        </group>
        <group position={[0, 0.6, 0.03]}>
          <Blok size={[0.95, 0.42, 0.04]} color="#1d3a8f" r={0.03} />
          <Bord regels={['een half miljard', 'gebruikers']} b={0.88} h={0.36} pos={[0, 0, 0.022]} bg="#1d3a8f" fg="#ffffff" licht />
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── EXP-06: energiewinkel ───────────────────────────

/** Poster op een standaard (canvas-tekening). */
function Poster({ pos, rot, sleutel, teken, b = 0.85, h = 1.1 }: { pos: V3; rot?: V3; sleutel: string; teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; b?: number; h?: number }) {
  return (
    <group position={pos} rotation={rot}>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.05, 1.9, 0.05]} pos={[(s * b) / 2, 0.95, -0.02]} color="#3b4442" r={0.015} />
      ))}
      <Blok size={[b + 0.06, h + 0.06, 0.03]} pos={[0, 1.3, -0.01]} color="#3b4442" r={0.01} />
      <Doek b={b} h={h} pos={[0, 1.3, 0.008]} sleutel={sleutel} ppm={760} teken={teken} />
    </group>
  );
}

/** EXP-06: wasmachine (knop van 40 naar 30 graden), twee groene posters en de energierekening van Ronald. */
export function Energie() {
  const knop = useRef<THREE.Group>(null);
  const sok = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (knop.current) knop.current.rotation.z = Math.sin(t * 0.7) > 0 ? 0.6 : 0;
    if (sok.current) sok.current.rotation.z = Math.sin(t * 3) * 0.3;
  });
  return (
    <group>
      <Poster
        pos={[-0.95, 0, -0.1]}
        rot={[0, 0.25, 0]}
        sleutel="energie-was"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#5aa04a';
          rondRect(ctx, 0, 0, w, h, 30);
          ctx.fill();
          // twee wasmachines
          for (const x of [0.3, 0.7]) {
            ctx.fillStyle = '#ffffff';
            rondRect(ctx, w * (x - 0.15), h * 0.06, w * 0.3, h * 0.3, 14);
            ctx.fill();
            ctx.strokeStyle = '#9aa3a8';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(w * x, h * 0.23, w * 0.09, 0, Math.PI * 2);
            ctx.stroke();
          }
          let y = h * 0.47;
          y = tekstBlok(ctx, 'Elke wasbeurt op 40 graden kost €\u00a00,49.', w * 0.07, y, w * 0.86, h * 0.07, '#ffffff', 700, 1.2);
          tekstBlok(ctx, 'Was op 30 graden en bespaar 40%!', w * 0.07, y + h * 0.03, w * 0.86, h * 0.07, '#fff3a0', 700, 1.2);
        }}
      />
      <Poster
        pos={[0.95, 0, -0.1]}
        rot={[0, -0.25, 0]}
        sleutel="energie-laptop"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#5aa04a';
          rondRect(ctx, 0, 0, w, h, 30);
          ctx.fill();
          // roze laptop bij een raam
          ctx.fillStyle = '#ffe08a';
          ctx.fillRect(w * 0.6, h * 0.05, w * 0.32, h * 0.28);
          ctx.fillStyle = '#9fd0de';
          ctx.fillRect(w * 0.66, h * 0.08, w * 0.2, h * 0.22);
          ctx.fillStyle = '#f2a2b8';
          rondRect(ctx, w * 0.12, h * 0.12, w * 0.4, h * 0.2, 10);
          ctx.fill();
          ctx.fillRect(w * 0.06, h * 0.32, w * 0.52, h * 0.04);
          let y = h * 0.47;
          y = tekstBlok(ctx, 'Gebruik de laptop in plaats van de pc', w * 0.07, y, w * 0.86, h * 0.07, '#ffffff', 700, 1.2);
          tekstBlok(ctx, 'en bespaar €\u00a025 per jaar.', w * 0.07, y + h * 0.01, w * 0.86, h * 0.07, '#fff3a0', 700, 1.2);
        }}
      />
      {/* wasmachine */}
      <group position={[0, 0, 0.2]}>
        <Blok size={[0.66, 0.86, 0.62]} pos={[0, 0.43, 0]} color="#fbfaf6" r={0.06} />
        <Blok size={[0.6, 0.12, 0.02]} pos={[0, 0.75, 0.31]} color="#e3e7ea" r={0.01} />
        <mesh position={[0, 0.4, 0.315]} material={mat('#c9cdd0')}>
          <torusGeometry args={[0.2, 0.035, 8, 28]} />
        </mesh>
        <mesh position={[0, 0.4, 0.31]} material={mat('#9fc3cf', { rough: 0.1 })}>
          <circleGeometry args={[0.18, 28]} />
        </mesh>
        <group ref={knop} position={[0.2, 0.75, 0.325]}>
          <Cil r={0.045} h={0.03} rot={[Math.PI / 2, 0, 0]} color="#9aa3a8" seg={16} />
          <Blok size={[0.012, 0.05, 0.01]} pos={[0, 0.02, 0.018]} color="#2f3634" r={0.004} />
        </group>
        <Bord regels={['40°  30°']} b={0.2} h={0.05} pos={[0.2, 0.81, 0.322]} bg="#e3e7ea" groot={0.9} />
        {/* sok die uit de deur kruipt */}
        <group ref={sok} position={[-0.12, 0.28, 0.33]}>
          <Blok size={[0.06, 0.16, 0.04]} pos={[-0.04, -0.06, 0]} rot={[0, 0, 0.6]} color="#e86f8a" r={0.02} />
        </group>
        {/* energierekening op de machine */}
        <group position={[0, 0.88, 0.0]} rotation={[-0.5, 0, 0]}>
          <Blok size={[0.66, 0.5, 0.02]} pos={[0, 0.25, 0]} color="#8a5a36" r={0.01} />
          <Bord regels={['Energie Ronald', '€ 1.224 per jaar', 'Wassen: 100 keer', 'per jaar']} b={0.62} h={0.46} pos={[0, 0.25, 0.012]} bg="#fbfaf6" rond={0.04} />
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── EXP-07: reisbureau ───────────────────────────

/** EXP-07a/b: reisbureau met een bord: Spanjaarden op vakantie in Nederland (2007 en 2023). */
export function Reisbureau() {
  return (
    <group>
      <Tafel b={1.3} d={0.7} h={0.8} pos={[-0.45, 0, 0.25]} kleur="#f4efe6" poot="#2a9fd6" />
      {/* wereldbol en folders */}
      <group position={[-0.7, 0.8, 0.2]}>
        <Cil r={0.08} h={0.03} pos={[0, 0.015, 0]} color="#3b4442" seg={14} />
        <Cil r={0.01} h={0.15} pos={[0, 0.1, 0]} color="#3b4442" seg={6} />
        <mesh position={[0, 0.28, 0]} castShadow material={mat('#4f9fd6')}>
          <sphereGeometry args={[0.13, 18, 14]} />
        </mesh>
      </group>
      {['#ffc94d', '#e5675a', '#2ec4b6'].map((k, i) => (
        <Blok key={k} size={[0.2, 0.012, 0.28]} pos={[-0.25 + i * 0.12, 0.81 + i * 0.012, 0.25]} rot={[0, 0.2 * (i - 1), 0]} color={k} r={0.004} />
      ))}
      {/* informatiebord */}
      <group position={[0.4, 0, -0.35]}>
        {[-0.75, 0.75].map((x) => (
          <Blok key={x} size={[0.06, 2.1, 0.06]} pos={[x, 1.05, 0]} color="#3b4442" r={0.02} />
        ))}
        <Blok size={[1.6, 1.0, 0.05]} pos={[0, 1.55, 0]} color="#2a9fd6" r={0.03} />
        <Doek
          b={1.5}
          h={0.9}
          pos={[0, 1.55, 0.03]}
          sleutel="spanjaarden"
          ppm={800}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fbfaf6';
            rondRect(ctx, 0, 0, w, h, 24);
            ctx.fill();
            ctx.fillStyle = '#c60b1e';
            ctx.fillRect(0, 0, w, h * 0.06);
            ctx.fillStyle = '#ffc400';
            ctx.fillRect(0, h * 0.06, w, h * 0.04);
            tekstRegel(ctx, 'Spanjaarden op vakantie', w / 2, h * 0.21, h * 0.095, '#1d3a6b', 700, 'center');
            tekstRegel(ctx, 'in Nederland', w / 2, h * 0.33, h * 0.095, '#1d3a6b', 700, 'center');
            tekstRegel(ctx, 'In 2007:', w * 0.12, h * 0.56, h * 0.11, '#1f2a24', 600);
            tekstRegel(ctx, '2.775', w * 0.88, h * 0.56, h * 0.13, '#1f2a24', 700, 'right');
            tekstRegel(ctx, 'In 2023:', w * 0.12, h * 0.8, h * 0.11, '#1f2a24', 600);
            tekstRegel(ctx, '1.509', w * 0.88, h * 0.8, h * 0.13, '#1f2a24', 700, 'right');
          }}
        />
      </group>
      {/* strandparasol en koffer */}
      <group position={[-1.25, 0, -0.25]}>
        <Cil r={0.02} h={1.6} pos={[0, 0.8, 0]} rot={[0, 0, 0.1]} color="#e9e3d7" seg={6} />
        <mesh position={[-0.08, 1.6, 0]} castShadow material={mat('#ffc400', { flat: true })}>
          <coneGeometry args={[0.55, 0.28, 10]} />
        </mesh>
        <Blok size={[0.42, 0.3, 0.16]} pos={[0.1, 0.17, 0.25]} color="#c60b1e" r={0.04} />
        <Blok size={[0.14, 0.04, 0.03]} pos={[0.1, 0.34, 0.25]} color="#2f3634" r={0.01} />
      </group>
    </group>
  );
}

// ─────────────────────────── EXP-05: griep ───────────────────────────

/** EXP-05: nieuwssite op een scherm bij de apotheek: "Minder griepmeldingen in 2013". Ernaast niest iemand. */
export function Griep() {
  const nies = useRef<THREE.Group>(null);
  const krant = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % 4;
    const n = t > 3.2 && t < 3.5 ? 1 : 0;
    if (nies.current) nies.current.rotation.x = n * 0.35;
    if (krant.current) {
      const f = t > 3.3 ? (t - 3.3) / 0.7 : 0;
      krant.current.position.set(0.1 + f * 0.5, 0.48 + Math.sin(f * Math.PI) * 0.4, f * 0.3);
      krant.current.rotation.set(-Math.PI / 2 + f * 2, 0, f * 3);
    }
  });
  return (
    <group>
      <group position={[-0.35, 0, -0.1]}>
        <Blok size={[0.12, 0.95, 0.12]} pos={[0, 0.475, -0.05]} color="#3b4442" r={0.03} />
        <Blok size={[0.6, 0.06, 0.4]} pos={[0, 0.03, -0.05]} color="#3b4442" r={0.02} />
        <group position={[0, 1.62, 0]}>
          <Scherm
            b={1.75}
            h={1.15}
            sleutel="griep-nieuws2"
            ppm={800}
            teken={(ctx, w, h) => {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, w, h);
              ctx.fillStyle = '#1d3a6b';
              ctx.fillRect(0, 0, w, h * 0.15);
              // logo: N in een wereldbol
              ctx.fillStyle = '#5aa9ff';
              ctx.beginPath();
              ctx.arc(w * 0.06, h * 0.075, h * 0.055, 0, Math.PI * 2);
              ctx.fill();
              tekstRegel(ctx, 'N', w * 0.06, h * 0.08, h * 0.07, '#ffffff', 700, 'center');
              tekstRegel(ctx, 'Nieuws', w * 0.11, h * 0.08, h * 0.07, '#ffffff', 700);
              // menu
              ['Algemeen', 'Sport', 'Financieel', 'Tech', 'Wetenschap'].forEach((m, i) => {
                const y = h * (0.24 + i * 0.09);
                if (i === 0) {
                  ctx.fillStyle = '#e3eefb';
                  ctx.fillRect(0, y - h * 0.04, w * 0.2, h * 0.08);
                }
                tekstRegel(ctx, m, w * 0.02, y, h * 0.042, i === 0 ? '#1d3a6b' : '#5d6166', i === 0 ? 700 : 500);
              });
              ctx.fillStyle = '#d9dee2';
              ctx.fillRect(w * 0.205, h * 0.17, 3, h * 0.8);
              let y = h * 0.25;
              y = tekstBlok(ctx, 'Minder griepmeldingen in 2013', w * 0.23, y, w * 0.74, h * 0.072, '#1f2a24', 700, 1.15);
              tekstBlok(
                ctx,
                'In 2013 gingen 161.000 mensen met griep naar de huisarts. Dit was 8% minder dan in 2012. Het griepinstituut verwacht een verdere daling in 2014.',
                w * 0.23,
                y + h * 0.02,
                w * 0.74,
                h * 0.06,
                '#3b4442',
                600,
                1.3,
              );
            }}
          />
        </group>
        {/* groen apotheekkruis */}
        <group position={[0.85, 2.0, 0]}>
          <Blok size={[0.12, 0.36, 0.06]} color="#3f9e5a" r={0.02} />
          <Blok size={[0.36, 0.12, 0.06]} color="#3f9e5a" r={0.02} />
        </group>
      </group>
      {/* bankje met iemand die niest */}
      <group position={[0.75, 0, 0.35]} rotation={[0, -0.5, 0]}>
        <Blok size={[0.9, 0.06, 0.36]} pos={[0, 0.42, 0]} color="#b6773e" r={0.02} />
        {[-0.38, 0.38].map((x) => (
          <Blok key={x} size={[0.06, 0.42, 0.3]} pos={[x, 0.21, 0]} color="#3b4442" r={0.02} />
        ))}
        <group position={[-0.15, 0.45, 0]}>
          <group ref={nies}>
            <Poppetje pos={[0, 0, 0]} kleur="#4f78a8" haar="#3b2a1e" zit />
            <Blok size={[0.34, 0.07, 0.26]} pos={[0, 0.4, 0]} color="#e5675a" r={0.03} />
            <Blok size={[0.07, 0.22, 0.04]} pos={[0.1, 0.28, 0.14]} color="#e5675a" r={0.02} />
          </group>
        </group>
        <group ref={krant} position={[0.1, 0.48, 0]}>
          <Blok size={[0.24, 0.32, 0.01]} color="#efe2c2" r={0.003} />
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── EXP-04: offerte ───────────────────────────

/** EXP-04: opengeslagen offertemap van Hoveniersbedrijf Jansen op een lessenaar, met een stempel "10% korting". */
export function Offerte() {
  const bloem = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bloem.current) bloem.current.scale.setScalar(0.85 + Math.sin(clock.getElapsedTime() * 0.8) * 0.15);
  });
  return (
    <group>
      <Blok size={[1.6, 0.9, 0.7]} pos={[0, 0.45, 0]} color="#6aa84f" r={0.05} />
      <Blok size={[1.68, 0.06, 0.78]} pos={[0, 0.93, 0]} color="#b6773e" r={0.02} />
      {/* lessenaar met open map */}
      <group position={[0, 0.96, -0.12]} rotation={[-0.38, 0, 0]}>
        <Blok size={[1.56, 0.98, 0.03]} pos={[0, 0.49, 0]} color="#2f5d46" r={0.02} />
        <Doek
          b={0.74}
          h={0.92}
          pos={[-0.385, 0.49, 0.017]}
          sleutel="offerte-links2"
          ppm={900}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fbfaf6';
            ctx.fillRect(0, 0, w, h);
            // logo met grijze bloemen
            for (let i = 0; i < 3; i++) {
              const cx = w * (0.22 + i * 0.13);
              const cy = h * 0.12;
              ctx.fillStyle = '#9aa3a8';
              for (let b = 0; b < 5; b++) {
                ctx.beginPath();
                ctx.arc(cx + Math.cos((b * Math.PI * 2) / 5) * 16, cy + Math.sin((b * Math.PI * 2) / 5) * 16, 12, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            tekstRegel(ctx, 'Hoveniersbedrijf', w * 0.08, h * 0.27, h * 0.07, '#2f5d46', 700);
            tekstRegel(ctx, 'Jansen', w * 0.08, h * 0.35, h * 0.07, '#2f5d46', 700);
            tekstRegel(ctx, 'Aan: Henk', w * 0.08, h * 0.47, h * 0.06, '#3b4442', 600);
            tekstRegel(ctx, 'Offerte 215421', w * 0.08, h * 0.6, h * 0.08, '#1f2a24', 700);
            tekstBlok(ctx, 'Hierbij de offerte voor het aanleggen van het bloemperk.', w * 0.08, h * 0.72, w * 0.84, h * 0.055, '#3b4442', 600, 1.3);
          }}
        />
        <Doek
          b={0.74}
          h={0.92}
          pos={[0.385, 0.49, 0.017]}
          sleutel="offerte-rechts2"
          ppm={900}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fbfaf6';
            ctx.fillRect(0, 0, w, h);
            const rijen: [string, string][] = [
              ['Uren', '52 uur'],
              ['Omschrijving', 'Aanleggen van een bloemperk'],
              ['Bedrag', '€ 16 per uur'],
              ['Totaal excl. btw', '€ 832'],
              ['Btw', '21%'],
            ];
            rijen.forEach(([k, v], i) => {
              const y = h * (0.04 + i * 0.19);
              ctx.fillStyle = i % 2 ? '#f1ece2' : '#e3efe0';
              ctx.fillRect(w * 0.04, y, w * 0.92, h * 0.17);
              tekstRegel(ctx, k, w * 0.08, y + h * 0.045, h * 0.05, '#5d6166', 600);
              if (i === 1) {
                tekstRegel(ctx, 'Aanleggen van', w * 0.08, y + h * 0.098, h * 0.055, '#1f2a24', 700);
                tekstRegel(ctx, 'een bloemperk', w * 0.08, y + h * 0.145, h * 0.055, '#1f2a24', 700);
              } else tekstRegel(ctx, v, w * 0.08, y + h * 0.115, h * 0.075, '#1f2a24', 700);
            });
          }}
        />
        <Blok size={[0.02, 0.94, 0.02]} pos={[0, 0.49, 0.018]} color="#1f3b2c" r={0.005} />
      </group>
      {/* stempel en stempelkussen */}
      <group position={[0.62, 0.96, 0.15]}>
        <Blok size={[0.24, 0.03, 0.16]} pos={[0, 0.015, 0]} color="#3b3a39" r={0.01} />
        <Cil r={0.04} h={0.12} pos={[0.0, 0.1, -0.15]} color="#8a5a36" seg={10} />
        <Blok size={[0.12, 0.04, 0.12]} pos={[0, 0.03, -0.15]} color="#3b3a39" r={0.01} />
        <Bord regels={['10% korting']} b={0.42} h={0.15} pos={[0, 0.1, 0.12]} rot={[-0.6, 0, 0]} bg="#fbfaf6" fg="#c0392b" rand="#c0392b" />
      </group>
      {/* bloempot */}
      <group position={[-0.65, 0.96, 0.25]}>
        <Cil r={0.07} rTop={0.09} h={0.14} pos={[0, 0.07, 0]} color="#b5603a" seg={12} />
        <Cil r={0.008} h={0.2} pos={[0, 0.24, 0]} color="#5a8f3f" seg={6} />
        <group ref={bloem} position={[0, 0.35, 0]}>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 5) * 0.035, 0, Math.sin((i * Math.PI * 2) / 5) * 0.035]} material={mat('#f2a2b8')}>
              <sphereGeometry args={[0.025, 8, 6]} />
            </mesh>
          ))}
          <mesh material={mat('#ffd21f')}>
            <sphereGeometry args={[0.02, 8, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── EXP-01: kermisloket bij het reuzenrad ───────────────────────────

/**
 * EXP-01: het loket van de kermis op ware grootte, met het spandoek "Kermis in Devidam",
 * de prijs van een kaartje en het aantal plaatsen van vorig jaar. Het grote reuzenrad staat erachter
 * (Omgeving.tsx) en gaat draaien na het goede antwoord.
 */
export function KermisLoket() {
  return (
    <group>
      {/* spandoek op twee palen */}
      <group position={[0, 0, -0.75]}>
        {[-2.2, 2.2].map((x) => (
          <Cil key={x} r={0.07} h={4.6} pos={[x, 2.3, 0]} color="#2f3634" seg={8} />
        ))}
        <Blok size={[4.5, 0.08, 0.08]} pos={[0, 4.55, 0]} color="#2f3634" r={0} />
        <Doek
          b={4.2}
          h={1.6}
          pos={[0, 3.65, 0]}
          sleutel="kermis-devidam-groot"
          ppm={380}
          dubbel
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#8d9295';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            for (let x = 18; x < w; x += 36) {
              ctx.beginPath();
              ctx.arc(x, h * 0.04, 5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowColor = '#ffd21f';
            ctx.shadowBlur = 22;
            tekstRegel(ctx, 'KERMIS IN DEVIDAM', w / 2, h * 0.23, h * 0.21, '#fff3c0', 700, 'center');
            ctx.shadowBlur = 0;
            tekstRegel(ctx, 'Het reuzenrad heeft 30% meer', w / 2, h * 0.52, h * 0.12, '#ffffff', 700, 'center');
            tekstRegel(ctx, 'zitplaatsen dan vorig jaar!', w / 2, h * 0.68, h * 0.12, '#ffffff', 700, 'center');
            tekstRegel(ctx, 'Durf jij het aan?', w / 2, h * 0.87, h * 0.1, '#ffd21f', 700, 'center');
          }}
        />
      </group>
      {/* het loket */}
      <group position={[0, 0, 0.1]}>
        <Blok size={[1.9, 2.3, 1.3]} pos={[0, 1.15, 0]} color="#e86f8a" r={0.08} />
        <Blok size={[2.0, 0.12, 1.4]} pos={[0, 2.36, 0]} color="#fbf6ec" r={0.04} />
        <Blok size={[1.2, 0.7, 0.06]} pos={[0, 1.35, 0.64]} color="#2a3138" r={0.03} rough={0.3} />
        <Blok size={[1.3, 0.06, 0.3]} pos={[0, 0.98, 0.72]} color="#fbf6ec" r={0.02} />
        <Poppetje pos={[0, 0.45, 0.2]} kleur="#ffd21f" haar="#3b2a1e" s={1.0} />
        <Blok size={[1.6, 0.5, 0.08]} pos={[0, 2.7, 0.3]} color="#2a2d33" r={0.03} />
        <Bord regels={['KAARTJES']} b={1.5} h={0.42} pos={[0, 2.7, 0.345]} bg="#2a2d33" fg="#ffe14d" licht />
        {/* prijsbordje en het aantal plaatsen van vorig jaar */}
        <group position={[-0.62, 0.55, 0.69]}>
          <Blok size={[0.66, 0.5, 0.04]} color="#3b3a39" r={0.02} />
          <Bord regels={['€ 1,75', 'per kaartje']} b={0.62} h={0.46} pos={[0, 0, 0.022]} bg="#ffd21f" />
        </group>
        <group position={[0.62, 0.55, 0.69]}>
          <Blok size={[0.66, 0.5, 0.04]} color="#3b3a39" r={0.02} />
          <Bord regels={['Vorig jaar:', '250 plaatsen']} b={0.62} h={0.46} pos={[0, 0, 0.022]} bg="#fbfaf6" fg="#1d3a6b" />
        </group>
      </group>
      {/* paaltjes met een touw voor de rij */}
      {[-0.9, 0.9].map((x) => (
        <group key={x} position={[x, 0, 1.25]}>
          <Cil r={0.12} h={0.04} pos={[0, 0.02, 0]} color="#c9a227" seg={10} />
          <Cil r={0.03} h={0.9} pos={[0, 0.45, 0]} color="#c9a227" seg={8} />
        </group>
      ))}
      <Cil r={0.02} h={1.8} pos={[0, 0.82, 1.25]} rot={[0, 0, Math.PI / 2]} color="#c0392b" seg={6} />
      <NaGoed ids={['O4-EXP-01']} pos={[0, 3.3, 0.5]}>
        <Beloning tekst={['Opbrengst: € 568,75']} b={1.5} h={0.3} />
      </NaGoed>
    </group>
  );
}

// ─────────────────────────── PUZ-01: vormenpuzzel ───────────────────────────

type Vorm = 'driehoek' | 'cirkel' | 'vierkant' | 'vijfhoek' | 'rechthoek';
const VORM_KLEUR: Record<Vorm, string> = { driehoek: '#29a9e0', cirkel: '#e8231f', vierkant: '#8fe03a', vijfhoek: '#ffc20e', rechthoek: '#b8862b' };

function tekenVorm(ctx: CanvasRenderingContext2D, v: Vorm, cx: number, cy: number, s: number) {
  ctx.fillStyle = VORM_KLEUR[v];
  ctx.strokeStyle = '#3b3a39';
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  if (v === 'driehoek') {
    ctx.moveTo(cx, cy - s * 0.48);
    ctx.lineTo(cx + s * 0.52, cy + s * 0.42);
    ctx.lineTo(cx - s * 0.52, cy + s * 0.42);
    ctx.closePath();
  } else if (v === 'cirkel') ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2);
  else if (v === 'vierkant') ctx.rect(cx - s * 0.42, cy - s * 0.42, s * 0.84, s * 0.84);
  else if (v === 'rechthoek') ctx.rect(cx - s * 0.72, cy - s * 0.32, s * 1.44, s * 0.64);
  else {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.lineTo(cx + Math.cos(a) * s * 0.5, cy + Math.sin(a) * s * 0.5);
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

/** Een regel van de puzzel: tekst en vormen door elkaar. */
const REGELS: (string | Vorm)[][] = [
  ['6 ×', 'driehoek', '=', '3 × 10'],
  ['driehoek', '× 20 =', 'cirkel', '× 4'],
  ['cirkel', '+', 'driehoek', '=', 'vierkant', '− 70'],
  ['vierkant', '× 8 = de helft van', 'vijfhoek'],
  ['vijfhoek', ':', 'vierkant', '=', 'rechthoek', '+ 5'],
  ['rechthoek', '×', 'rechthoek', '= ?'],
];
const IS_VORM = (x: string): x is Vorm => x in VORM_KLEUR;

/** PUZ-01: lichtgeel puzzelbord met zes regels; de vormen staan voor getallen. Eronder de vormen als knoppen. */
export function Vormen() {
  return (
    <group>
      {[-0.9, 0.9].map((x) => (
        <Blok key={x} size={[0.07, 2.35, 0.07]} pos={[x, 1.175, -0.1]} color="#3b4442" r={0.02} />
      ))}
      <Blok size={[1.84, 1.62, 0.05]} pos={[0, 1.5, -0.1]} color="#3b4442" r={0.03} />
      <Doek
        b={1.76}
        h={1.54}
        pos={[0, 1.5, -0.07]}
        sleutel="vormenpuzzel"
        ppm={760}
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#ffffcc';
          ctx.fillRect(w * 0.02, h * 0.02, w * 0.96, h * 0.79);
          ctx.strokeStyle = '#3b3a39';
          ctx.lineWidth = 5;
          ctx.strokeRect(w * 0.02, h * 0.02, w * 0.96, h * 0.79);
          const s = h * 0.1;
          REGELS.forEach((regel, i) => {
            const y = i < 5 ? h * (0.1 + i * 0.155) : h * 0.905;
            // breedte van de regel bepalen en centreren
            const fs = h * 0.075;
            ctx.font = `700 ${fs}px Fredoka, sans-serif`;
            const breed = regel.map((d) => (IS_VORM(d) ? s * (d === 'rechthoek' ? 1.55 : 1.05) : ctx.measureText(d).width + fs * 0.6));
            let x = (w - breed.reduce((a, b) => a + b, 0)) / 2;
            regel.forEach((d, j) => {
              if (IS_VORM(d)) tekenVorm(ctx, d, x + breed[j] / 2, y, s);
              else tekstRegel(ctx, d, x + breed[j] / 2, y, fs, '#1f2a24', 700, 'center');
              x += breed[j];
            });
          });
        }}
      />
      <NaGoed ids={['O4-PUZ-01']} pos={[0.55, 0.85, 0.12]}>
        <Beloning tekst={['= 121']} b={0.4} h={0.18} />
      </NaGoed>
      {/* plank met de vormen als knoppen */}
      <group position={[0, 0.62, 0.1]}>
        <Blok size={[1.7, 0.05, 0.3]} color="#b6773e" r={0.02} />
        <Cil r={0.1} h={0.05} pos={[-0.6, 0.06, 0]} rot={[Math.PI / 2, 0, Math.PI / 2]} color={VORM_KLEUR.driehoek} seg={3} />
        <Cil r={0.1} h={0.05} pos={[-0.3, 0.06, 0]} rot={[Math.PI / 2, 0, 0]} color={VORM_KLEUR.cirkel} seg={20} />
        <Blok size={[0.16, 0.16, 0.05]} pos={[0, 0.1, 0]} color={VORM_KLEUR.vierkant} r={0.01} />
        <group position={[0.3, 0.12, 0]}>
          <Draai snel={0.7}>
            <Cil r={0.1} h={0.05} rot={[Math.PI / 2, 0, 0]} color={VORM_KLEUR.vijfhoek} seg={5} />
          </Draai>
        </group>
        <Blok size={[0.26, 0.12, 0.05]} pos={[0.64, 0.085, 0]} color={VORM_KLEUR.rechthoek} r={0.01} />
      </group>
    </group>
  );
}

// ─────────────────────────── PUZ-02: lucifers ───────────────────────────

const L = 0.2;
/** Segmenten van een cijfer (a boven, b rechtsboven, c rechtsonder, d onder, e linksonder, f linksboven, g midden). */
const SEG: Record<string, [number, number, boolean][]> = {
  a: [[0, -L, false]],
  b: [[L / 2, -L / 2, true]],
  c: [[L / 2, L / 2, true]],
  d: [[0, L, false]],
  e: [[-L / 2, L / 2, true]],
  f: [[-L / 2, -L / 2, true]],
  g: [[0, 0, false]],
};

function Lucifer({ x, z, staand }: { x: number; z: number; staand: boolean }) {
  return (
    <group position={[x, 0, z]} rotation={[0, staand ? 0 : Math.PI / 2, 0]}>
      <Blok size={[0.014, 0.012, L * 0.92]} pos={[0, 0.006, 0]} color="#e8c98a" r={0.004} />
      <mesh position={[0, 0.009, -L * 0.46]} scale={[1, 0.8, 1.4]} castShadow material={mat('#d0281e')}>
        <sphereGeometry args={[0.013, 8, 6]} />
      </mesh>
    </group>
  );
}

/** PUZ-02: lucifers op een zwarte tafel in de som 1 + 2 = 8. */
export function Lucifers() {
  const doosje = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (doosje.current) doosje.current.rotation.y = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.08;
  });
  const cijfer = (segs: string, x0: number) =>
    segs.split('').flatMap((s) => SEG[s].map(([x, z, staand], i) => <Lucifer key={`${x0}${s}${i}`} x={x0 + x} z={z} staand={staand} />));
  return (
    <group>
      <Tafel b={1.6} d={0.9} h={0.78} kleur="#1b1b1b" poot="#2f3634" />
      <group position={[0, 0.78, -0.02]}>
        {/* 1 */}
        {cijfer('bc', -0.62)}
        {/* + */}
        <Lucifer x={-0.38} z={0} staand={false} />
        <Lucifer x={-0.38} z={0} staand />
        {/* 2 */}
        {cijfer('abged', -0.1)}
        {/* = */}
        <Lucifer x={0.18} z={-0.04} staand={false} />
        <Lucifer x={0.18} z={0.04} staand={false} />
        {/* 8 (zonder linksonder: die lucifer kan verschuiven) */}
        {cijfer('abcdfg', 0.48)}
        <Verschuif />
      </group>
      <group ref={doosje} position={[0.6, 0.78, 0.33]}>
        <Blok size={[0.14, 0.05, 0.09]} pos={[0, 0.025, 0]} color="#ffd21f" r={0.01} />
        <Blok size={[0.142, 0.01, 0.02]} pos={[0, 0.03, 0.04]} color="#8a5a36" r={0.003} />
      </group>
      <group position={[0, 0.78, -0.4]} rotation={[-0.3, 0, 0]}>
        <Blok size={[1.2, 0.2, 0.03]} pos={[0, 0.12, 0]} color="#2f3634" r={0.02} />
        <Bord regels={['Verplaats 1 lucifer zodat de som klopt.']} b={1.15} h={0.16} pos={[0, 0.12, 0.017]} bg="#2f3634" fg="#ffd21f" />
      </group>
    </group>
  );
}

/** De lucifer linksonder in de 8. Na het goede antwoord schuift hij naar de bovenkant van de 1: 7 + 2 = 9. */
function Verschuif() {
  const af = useOpgelost('O4-PUZ-02');
  const ref = useRef<THREE.Group>(null);
  const w = useRef(af ? 1 : 0);
  const zet = () => {
    const g = ref.current;
    if (!g) return;
    const t = w.current;
    const van = new THREE.Vector3(0.48 - L / 2, 0, L / 2);
    const naar = new THREE.Vector3(-0.62, 0, -L);
    g.position.lerpVectors(van, naar, t);
    g.position.y = Math.sin(t * Math.PI) * 0.12;
    g.rotation.y = (t * Math.PI) / 2;
  };
  useFrame((_, dt) => {
    w.current += ((af ? 1 : 0) - w.current) * Math.min(1, dt * 1.5);
    zet();
  });
  return (
    <group ref={ref} position={af ? [-0.62, 0, -L] : [0.48 - L / 2, 0, L / 2]} rotation={[0, af ? Math.PI / 2 : 0, 0]}>
      <Lucifer x={0} z={0} staand />
    </group>
  );
}

// ─────────────────────────── PRA-02: actiekraam ───────────────────────────

function Cupcake({ pos, kleur }: { pos: V3; kleur: string }) {
  return (
    <group position={pos}>
      <Cil r={0.04} rTop={0.05} h={0.06} pos={[0, 0.03, 0]} color="#f4e2c6" seg={10} />
      <mesh position={[0, 0.08, 0]} scale={[1, 0.8, 1]} castShadow material={mat(kleur)}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.125, 0]} material={mat('#c0392b')}>
        <sphereGeometry args={[0.015, 8, 6]} />
      </mesh>
    </group>
  );
}

/** PRA-02 (open): kraam voor een goed doel met cupcakes van € 1,50 en een voorbeeldactie. */
export function Actiekraam() {
  return (
    <group>
      <group position={[0, 0, -0.1]}>
        <Kraam w={2.5} d={1.3} naam="Actie voor een goed doel" kleur="#e86f8a" />
      </group>
      {Array.from({ length: 8 }, (_, i) => (
        <Cupcake key={i} pos={[-0.85 + (i % 4) * 0.2, 0.98, 0.28 + Math.floor(i / 4) * 0.14]} kleur={['#f2a2b8', '#fbf6ec', '#c9a372', '#bfe1ff'][i % 4]} />
      ))}
      {/* collectepot */}
      <group position={[0.75, 0.98, 0.35]}>
        <Cil r={0.08} h={0.2} pos={[0, 0.1, 0]} color="#d6eef3" seg={16} />
        <Cil r={0.085} h={0.03} pos={[0, 0.21, 0]} color="#e86f8a" seg={16} />
        <Bord regels={['Goed doel']} b={0.16} h={0.05} pos={[0, 0.1, 0.082]} bg="#fbfaf6" />
      </group>
      <PaalBord regels={['Cupcakes', '€ 1,50 per stuk']} b={0.7} h={0.36} hoogte={1.25} pos={[-1.15, 0, 0.75]} rot={[0, 0.3, 0]} bg="#fbf6ec" fg="#7a2b4a" />
      <PaalBord regels={['Voorbeeld-actie:', 'koop er 3,', 'betaal 20% minder']} b={0.75} h={0.5} hoogte={1.3} pos={[1.15, 0, 0.75]} rot={[0, -0.3, 0]} bg="#ffd21f" fg="#1f2a24" />
    </group>
  );
}

// ─────────────────────────── PRA-01: drie winkels vergelijken ───────────────────────────

const WINKELS: { letter: string; prijs: string; korting: string; kleur: string }[] = [
  { letter: 'A', prijs: '€ 500', korting: '10% korting', kleur: '#3d7cc9' },
  { letter: 'B', prijs: '€ 480', korting: '5% korting', kleur: '#e48a3a' },
  { letter: 'C', prijs: '€ 520', korting: '15% korting', kleur: '#3f9e5a' },
];

/** PRA-01a–j: één toonbank met drie winkelhoeken (A, B en C) die dezelfde telefoon verkopen. */
export function DrieWinkels() {
  return (
    <group>
      {WINKELS.map((w, i) => {
        const x = (i - 1) * 0.98;
        return (
          <group key={w.letter} position={[x, 0, 0]}>
            <Blok size={[0.92, 0.9, 0.6]} pos={[0, 0.45, 0]} color={w.kleur} r={0.04} />
            <Blok size={[0.96, 0.05, 0.64]} pos={[0, 0.925, 0]} color="#fbf6ec" r={0.02} />
            {/* telefoon op een standaard */}
            <group position={[0, 0.95, 0.05]}>
              <Blok size={[0.12, 0.06, 0.1]} pos={[0, 0.03, 0]} color="#3b4442" r={0.02} />
              <group position={[0, 0.17, 0]} rotation={[-0.25, 0, 0]}>
                <Blok size={[0.14, 0.27, 0.02]} color="#1b1e21" r={0.02} />
                <Blok size={[0.12, 0.24, 0.005]} pos={[0, 0, 0.011]} color="#5aa9ff" r={0.004} />
              </group>
            </group>
            {/* prijsbord */}
            <group position={[0, 0, -0.3]}>
              <Cil r={0.025} h={1.5} pos={[0, 0.75, -0.07]} color="#3b4442" seg={8} />
              <Blok size={[0.9, 0.7, 0.04]} pos={[0, 1.6, -0.03]} color={w.kleur} r={0.03} />
              <Bord regels={[`Winkel ${w.letter}`, w.prijs, w.korting]} b={0.84} h={0.64} pos={[0, 1.6, -0.008]} bg="#fbfaf6" kleuren={[w.kleur, undefined, '#d83a2e']} />
            </group>
          </group>
        );
      })}
      <Prijskaartje tekst="Zelfde telefoon" pos={[0, 0.7, 0.31]} b={0.6} h={0.12} bg="#fbfaf6" />
    </group>
  );
}
