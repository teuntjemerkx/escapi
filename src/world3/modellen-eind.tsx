// 3D-objecten voor de eindcheck (evaluatie) langs de route naar de uitgang.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Maat } from '../game/inspectie';
import { mat, seeded } from '../game/kit';
import { Blok, Cil } from './blok';
import { P } from '../game/palette';
import { rondRect } from '../game/tekst';
import { Druk, druk } from './atlas';
import { Bol, Kaartje, Krat, Label, schrijf, Tekenbord, Toonbank, useVulling, type V3 } from './kraam';

/** EIN-01: koffiebar. Een pak van 500 gram koffie; voor 8 kopjes gebruik je 60 gram. */
export function Koffie() {
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#7a5132" />
      {/* pak koffie */}
      <group position={[-0.7, 0.92, 0.0]}>
        <Blok size={[0.26, 0.38, 0.14]} pos={[0, 0.19, 0]} color="#3b2414" r={0.02} />
        <Blok size={[0.26, 0.04, 0.08]} pos={[0, 0.4, 0]} color="#3b2414" r={0.01} />
        <Label regels={['KOFFIE', '500 gram']} breed={0.22} hoog={0.18} pos={[0, 0.2, 0.072]} bg="#e9c46a" fg="#3b2414" rand={null} vet={1} />
      </group>
      {/* maatschepje */}
      <group position={[-0.38, 0.93, 0.15]} rotation={[0, 0.6, 0]}>
        <Cil r={0.04} h={0.03} pos={[0, 0.015, 0]} color="#c9cdd0" seg={12} />
        <Blok size={[0.14, 0.012, 0.02]} pos={[0.1, 0.02, 0]} color="#c9cdd0" r={0.004} />
      </group>
      {/* koffiezetapparaat */}
      <group position={[-0.15, 0.92, -0.15]}>
        <Blok size={[0.3, 0.06, 0.26]} pos={[0, 0.03, 0]} color="#2f3634" r={0.02} />
        <Blok size={[0.1, 0.44, 0.26]} pos={[-0.1, 0.25, 0]} color="#2f3634" r={0.02} />
        <Blok size={[0.3, 0.1, 0.26]} pos={[0, 0.47, 0]} color="#2f3634" r={0.02} />
        <mesh position={[0.04, 0.14, 0]} material={mat('#e8f4f8', { opacity: 0.35, rough: 0.1 })}>
          <cylinderGeometry args={[0.09, 0.1, 0.16, 16, 1, true]} />
        </mesh>
        <Cil r={0.085} h={0.09} pos={[0.04, 0.11, 0]} color="#4a2a14" seg={16} />
      </group>
      {/* 8 kopjes */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[0.22 + (i % 4) * 0.18, 0.92, -0.08 + Math.floor(i / 4) * 0.2]}>
          <Cil r={0.07} h={0.012} pos={[0, 0.006, 0]} color={P.wit} seg={14} />
          <Cil r={0.045} rTop={0.055} h={0.07} pos={[0, 0.045, 0]} color={P.wit} seg={14} />
          <Cil r={0.05} h={0.005} pos={[0, 0.078, 0]} color="#4a2a14" seg={14} />
        </group>
      ))}
      <Kaartje regels={['8 kopjes', '= 60 gram']} pos={[0.5, 0.92, 0.33]} breed={0.42} hoog={0.18} kleur="#f7efe6" rand="#7a5132" schuin={-0.8} />
    </group>
  );
}

function Mes({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[0.025, 0.012, 0.12]} pos={[0, 0, -0.06]} color="#d9dde0" r={0.005} />
      <Blok size={[0.028, 0.016, 0.1]} pos={[0, 0, 0.06]} color="#9aa3a8" r={0.007} />
    </group>
  );
}
function Vork({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[0.04, 0.008, 0.07]} pos={[0, 0, -0.08]} color="#d9dde0" r={0.004} />
      <Blok size={[0.016, 0.012, 0.15]} pos={[0, 0, 0.04]} color="#c9cdd0" r={0.006} />
    </group>
  );
}
function Lepel({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, -0.08]} scale={[0.75, 0.25, 1]} material={mat('#d9dde0', { metal: 0.6, rough: 0.25 })}>
        <sphereGeometry args={[0.04, 10, 8]} />
      </mesh>
      <Blok size={[0.016, 0.012, 0.15]} pos={[0, 0, 0.04]} color="#c9cdd0" r={0.006} />
    </group>
  );
}

/** EIN-02: huishoudkraam met 3 bakjes: 4 messen, 4 vorken en 4 lepels, elk € 1,99 per 4 stuks. */
export function Bestek() {
  const soorten = [Mes, Vork, Lepel];
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#5fa8c9" />
      {soorten.map((Ding, j) => {
        const x = -0.6 + j * 0.6;
        return (
          <group key={j} position={[x, 0.92, -0.05]}>
            <Blok size={[0.42, 0.04, 0.34]} pos={[0, 0.02, 0]} color={P.houtLicht} r={0.01} />
            {[0, 1, 2, 3].map((i) => (
              <Ding key={i} pos={[-0.13 + i * 0.087, 0.05, 0]} />
            ))}
            <Kaartje regels={['€ 1,99', 'per 4 stuks']} pos={[0, 0, 0.25]} breed={0.34} hoog={0.18} kleur="#2b3a33" fg="#f4f1ea" rand="#7a5a3c" schuin={-0.7} />
          </group>
        );
      })}
      <Label regels={['Bestek: mes, vork en lepel']} breed={1.0} hoog={0.12} pos={[0, 0.6, 0.41]} bg="#f0f8fb" rand="#5fa8c9" />
    </group>
  );
}

/** EIN-03: speelgoed-racebaan. Het sportautootje rijdt 86,8 km in 12 minuten. */
export function Racebaan() {
  const auto = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.9;
    if (auto.current) {
      auto.current.position.set(Math.cos(t) * 0.68, 0.94, Math.sin(t) * 0.36);
      auto.current.rotation.y = -Math.atan2(Math.cos(t) * 0.36, -Math.sin(t) * 0.68);
    }
  });
  return (
    <group>
      <Blok size={[2.0, 0.08, 1.05]} pos={[0, 0.82, 0]} color="#3f8f5a" r={0.03} />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.07, 0.8, 0.07]} pos={[sx * 0.92, 0.4, sz * 0.45]} color={P.hout} r={0.02} />))}
      {/* ovale baan */}
      <group position={[0, 0.87, 0]} scale={[1, 1, 0.53]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#4a4f52')}>
          <torusGeometry args={[0.68, 0.11, 4, 48]} />
        </mesh>
      </group>
      <group position={[0, 0.9, 0]} scale={[1, 1, 0.53]}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return <Blok key={i} size={[0.06, 0.004, 0.012]} pos={[Math.cos(a) * 0.68, 0.0, Math.sin(a) * 0.68]} rot={[0, -a + Math.PI / 2, 0]} color="#fbfaf6" r={0.002} />;
        })}
      </group>
      {/* zwart-oranje sportautootje */}
      <group ref={auto}>
        <Blok size={[0.12, 0.04, 0.26]} pos={[0, 0.03, 0]} color="#1f2224" r={0.02} />
        <Blok size={[0.12, 0.03, 0.1]} pos={[0, 0.03, -0.09]} color="#ff8a2a" r={0.015} />
        <Blok size={[0.09, 0.035, 0.09]} pos={[0, 0.065, 0.02]} color="#3f4d58" r={0.015} />
      </group>
      {/* bordjes */}
      <group position={[-0.62, 0.86, 0.0]}>
        <Cil r={0.12} h={0.03} pos={[0, 0.22, 0]} rot={[Math.PI / 2, 0, 0]} color="#fbfaf6" seg={20} />
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#2f3634')}>
          <torusGeometry args={[0.12, 0.015, 6, 20]} />
        </mesh>
        <Blok size={[0.012, 0.08, 0.01]} pos={[0, 0.25, 0.02]} color="#2f3634" r={0.003} />
        <Blok size={[0.06, 0.012, 0.01]} pos={[0.03, 0.22, 0.02]} color="#d8433a" r={0.003} />
        <Cil r={0.012} h={0.1} pos={[0, 0.05, 0]} color="#2f3634" seg={5} />
        <Label regels={['12 minuten']} breed={0.36} hoog={0.1} pos={[0, 0.04, 0.12]} bg="#fbfaf6" rand="#e5675a" />
      </group>
      <group position={[0.55, 0.86, 0]}>
        <Cil r={0.012} h={0.36} pos={[0, 0.18, 0]} color="#2f3634" seg={5} />
        <Label regels={['86,8 km']} breed={0.34} hoog={0.14} pos={[0, 0.3, 0.01]} bg="#fbfaf6" rand="#e5675a" dubbel />
      </group>
      {/* slak met geruite vlag */}
      <group position={[0.15, 0.86, 0.2]}>
        <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#c99a62')}>
          <torusGeometry args={[0.025, 0.014, 6, 12]} />
        </mesh>
        <Blok size={[0.07, 0.018, 0.02]} pos={[0.02, 0.01, 0]} color="#b9c48a" r={0.008} />
        <Cil r={0.003} h={0.1} pos={[0.04, 0.06, 0]} color="#2f3634" seg={4} />
        <Blok size={[0.04, 0.03, 0.004]} pos={[0.06, 0.1, 0]} color="#fbfaf6" r={0.001} />
      </group>
    </group>
  );
}

/** EIN-04: 3D-puzzel van het Empire State Building (47,6 cm) en een schilderij van het echte gebouw (381 m). */
export function Empire() {
  const ramen = druk(
    0.2,
    0.4,
    (ctx, w, h) => {
      ctx.fillStyle = '#1d2f5a';
      ctx.fillRect(0, 0, w, h);
      for (let x = 6; x < w; x += 14)
        for (let y = 6; y < h; y += 14) {
          ctx.fillStyle = (x * 7 + y * 3) % 5 === 0 ? '#ffe28a' : '#2c4278';
          ctx.fillRect(x, y, 6, 8);
        }
    },
    'w3-empire-ramen',
    400,
  );
  const blokken: [number, number, number][] = [
    [0.2, 0.13, 0],
    [0.15, 0.12, 0.13],
    [0.11, 0.08, 0.25],
    [0.07, 0.05, 0.33],
  ];
  return (
    <group>
      {/* schilderij van het echte gebouw */}
      <Tekenbord
        breed={1.0}
        hoog={1.3}
        poten={0.9}
        pos={[0, 0, -0.5]}
        lijst="#2f3634"
        sleutel="w3-empire-schilderij"
        teken={(ctx, w, h) => {
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, '#5aa0e0');
          g.addColorStop(1, '#bfe0f6');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#8a8f96';
          ctx.fillRect(w * 0.06, h * 0.62, w * 0.2, h * 0.38);
          ctx.fillRect(w * 0.74, h * 0.55, w * 0.22, h * 0.45);
          ctx.fillStyle = '#6e737a';
          ctx.fillRect(w * 0.3, h * 0.42, w * 0.4, h * 0.58);
          ctx.fillRect(w * 0.36, h * 0.28, w * 0.28, h * 0.14);
          ctx.fillRect(w * 0.42, h * 0.17, w * 0.16, h * 0.11);
          ctx.fillRect(w * 0.47, h * 0.06, w * 0.06, h * 0.11);
          ctx.fillStyle = '#fbfaf6';
          rondRect(ctx, w * 0.12, h * 0.84, w * 0.76, h * 0.12, 12);
          ctx.fill();
          schrijf(ctx, 'hoogte = 381 m', w / 2, h * 0.9, h * 0.065, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
        }}
      />
      {/* sokkel met de puzzel */}
      <Blok size={[0.6, 0.9, 0.6]} pos={[0, 0.45, 0.15]} color="#efe9df" r={0.03} />
      <Blok size={[0.3, 0.03, 0.3]} pos={[0, 0.915, 0.15]} color="#1f2224" r={0.01} />
      <group position={[0, 0.93, 0.15]}>
        {blokken.map(([b, h, y], i) => (
          <Druk {...ramen} rough={0.5} key={i} position={[0, y + h / 2, 0]} castShadow>
            <boxGeometry args={[b, h, b * 0.8]} />
          </Druk>
        ))}
        <mesh position={[0, 0.418, 0]} material={mat('#fbfaf6')}>
          <coneGeometry args={[0.012, 0.1, 6]} />
        </mesh>
        <Bol pos={[0, 0.47, 0]} r={0.008} kleur="#3b2a20" />
        <Maat van={[0.16, 0, 0.0]} naar={[0.16, 0.476, 0.0]} label="47,6 cm" />
      </group>
      <Label regels={['hoogte puzzel = 47,6 cm']} breed={0.56} hoog={0.12} pos={[0, 0.7, 0.452]} bg="#fbfaf6" rand="#1d3a6b" />
    </group>
  );
}

/** EIN-05: telefoonkraam met een poster: 9,45 miljoen sim-only gebruikers in 2014, 1/3 deel betaalde prepaid. */
export function Simonly() {
  return (
    <group>
      <Toonbank b={2.0} d={0.8} kleur="#3b4442" />
      <Tekenbord
        breed={1.9}
        hoog={1.1}
        poten={1.0}
        pos={[0, 0, -0.55]}
        lijst="#2f3634"
        sleutel="w3-simonly"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#f4f6f7';
          ctx.fillRect(0, 0, w, h);
          schrijf(ctx, 'Sim-only in Nederland · 2014', w / 2, h * 0.12, h * 0.09, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '9,45 miljoen gebruikers', w / 2, h * 0.32, h * 0.13, '#2f6ac0', { gewicht: 700, uitlijn: 'center' });
          const x0 = w * 0.08;
          const bw = w * 0.84;
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i === 0 ? '#e48a3a' : '#c9d3dc';
            rondRect(ctx, x0 + (i * bw) / 3 + 4, h * 0.5, bw / 3 - 8, h * 0.18, 12);
            ctx.fill();
          }
          schrijf(ctx, 'prepaid', x0 + bw / 6, h * 0.59, h * 0.08, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '1/3 deel betaalde prepaid', w / 2, h * 0.84, h * 0.1, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
        }}
      />
      {/* telefoons op standaards */}
      {[-0.55, 0, 0.55].map((x, i) => (
        <group key={x} position={[x, 0.92, 0.05]} rotation={[-0.25, 0, 0]}>
          <Blok size={[0.16, 0.02, 0.1]} pos={[0, 0.01, 0.04]} color="#9aa3a8" r={0.005} />
          <Blok size={[0.14, 0.27, 0.015]} pos={[0, 0.15, 0]} color="#1f2224" r={0.02} />
          <Blok size={[0.12, 0.23, 0.005]} pos={[0, 0.15, 0.009]} color={['#5fa8c9', '#e48a3a', '#9b7fd0'][i]} r={0.01} />
        </group>
      ))}
    </group>
  );
}

/** Zakje met appels (doorzichtig). */
function Appelzak({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      {[
        [-0.05, 0.05, 0],
        [0.05, 0.05, 0.02],
        [0, 0.05, -0.07],
        [0, 0.13, -0.01],
      ].map((p, i) => (
        <Bol key={i} pos={p as V3} r={0.05} kleur="#c8352c" />
      ))}
      <mesh position={[0, 0.09, -0.02]} scale={[1, 1.2, 0.9]} material={mat('#eef6f8', { opacity: 0.3, rough: 0.2 })}>
        <sphereGeometry args={[0.12, 12, 10]} />
      </mesh>
    </group>
  );
}

/** EIN-06: appelkraam met een prijsbord: Elstar, Golden Delicious en Jonagold. */
export function Appels() {
  const jona = useVulling(12, 0.4, 0.3, 0.05, 6);
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#d8433a" />
      <Tekenbord
        breed={2.0}
        hoog={1.0}
        poten={1.05}
        pos={[0, 0, -0.55]}
        lijst="#d8433a"
        sleutel="w3-appelbord"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#fbfaf6';
          ctx.fillRect(0, 0, w, h);
          schrijf(ctx, 'Appels', w / 2, h * 0.13, h * 0.13, '#d8433a', { gewicht: 700, uitlijn: 'center' });
          [
            ['Elstar', '€ 2,29 per zak van 1,5 kg'],
            ['Golden Delicious', '€ 1,29 per schaal van 0,8 kg'],
            ['Jonagold', '€ 1,49 per kg'],
          ].forEach(([naam, prijs], i) => {
            const y = h * (0.38 + i * 0.22);
            schrijf(ctx, naam, w * 0.04, y, h * 0.1, '#1f2a24', { gewicht: 700 });
            schrijf(ctx, prijs, w * 0.4, y, h * 0.1, '#1f2a24', { gewicht: 600, max: w * 0.58 });
          });
        }}
      />
      {/* Elstar in zakken */}
      <Krat b={0.5} d={0.4} h={0.12} pos={[-0.72, 0.92, 0.0]} />
      <Appelzak pos={[-0.82, 0.96, 0.02]} />
      <Appelzak pos={[-0.62, 0.96, -0.02]} />
      {/* Golden Delicious op een schaal */}
      <group position={[-0.1, 0.92, 0.02]}>
        <Blok size={[0.36, 0.04, 0.26]} pos={[0, 0.02, 0]} color="#e9e3d6" r={0.01} />
        {[
          [-0.1, 0.06],
          [0, 0.06],
          [0.1, 0.06],
          [-0.05, -0.05],
          [0.05, -0.05],
        ].map(([x, z], i) => (
          <Bol key={i} pos={[x, 0.08, z]} r={0.048} kleur="#d8d24a" />
        ))}
      </group>
      {/* losse Jonagolds */}
      <group position={[0.45, 0.92, 0.0]}>
        <Krat b={0.46} d={0.36} h={0.1} />
        <group position={[0, 0.03, 0]}>
          {jona.map((p, i) => (
            <Bol key={i} pos={p} r={0.05} kleur={i % 2 ? '#e0603a' : '#e88a3a'} />
          ))}
        </group>
      </group>
      {/* weegschaal op 1 kg */}
      <group position={[0.9, 0.92, 0.1]}>
        <Blok size={[0.22, 0.12, 0.2]} pos={[0, 0.06, 0]} color="#fbfaf6" r={0.03} />
        <Blok size={[0.24, 0.02, 0.22]} pos={[0, 0.13, 0]} color="#c9cdd0" r={0.005} />
        <Label regels={['1 kg']} breed={0.14} hoog={0.06} pos={[0, 0.06, 0.101]} bg="#1f2224" fg="#7cff9a" rand={null} />
      </group>
      {/* wormpje */}
      <Bol pos={[0.55, 1.07, 0.06]} r={0.012} kleur="#e7a3b0" />
    </group>
  );
}

/** EIN-07: whiteboard met de 3 pakketten folders, en 3 stapels folders met een lint. */
export function Folders() {
  const folder = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (folder.current) {
      const f = (t * 0.2) % 1;
      folder.current.position.set(0.7 + f * 0.4, 0.85 + Math.sin(f * Math.PI) * 0.5, 0.3);
      folder.current.rotation.set(Math.sin(t * 3) * 0.6, t, 0);
    }
  });
  return (
    <group>
      <Tekenbord
        breed={2.0}
        hoog={1.0}
        poten={0.95}
        pos={[0, 0, -0.35]}
        lijst="#9aa3a8"
        sleutel="w3-folderbord"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#fbfcfc';
          ctx.fillRect(0, 0, w, h);
          const kol = [0.05, 0.38, 0.68];
          ['pakket', 'bezorgtijd', 'verdiensten'].forEach((k, i) => schrijf(ctx, k, w * kol[i], h * 0.13, h * 0.09, '#5b6370', { gewicht: 700 }));
          ctx.fillStyle = '#5b6370';
          ctx.fillRect(w * 0.03, h * 0.22, w * 0.94, 4);
          [
            ['1', '45 minuten', '€ 6,30', '#3f8f5a'],
            ['2', '60 minuten', '€ 7,80', '#3d7cc9'],
            ['3', '90 minuten', '€ 11,25', '#e48a3a'],
          ].forEach(([p, t, v, k], i) => {
            const y = h * (0.38 + i * 0.22);
            ctx.fillStyle = k;
            ctx.beginPath();
            ctx.arc(w * 0.09, y, h * 0.07, 0, Math.PI * 2);
            ctx.fill();
            schrijf(ctx, p, w * 0.09, y, h * 0.1, '#ffffff', { gewicht: 700, uitlijn: 'center' });
            schrijf(ctx, t, w * kol[1], y, h * 0.11, '#1f2a24', { gewicht: 600 });
            schrijf(ctx, v, w * kol[2], y, h * 0.11, '#1f2a24', { gewicht: 700 });
          });
        }}
      />
      {/* balie met 3 stapels folders */}
      <Blok size={[1.6, 0.75, 0.5]} pos={[0, 0.375, 0.35]} color="#3f8f5a" r={0.04} />
      <Blok size={[1.7, 0.05, 0.56]} pos={[0, 0.775, 0.35]} color="#e9dcc3" r={0.02} />
      {['#3f8f5a', '#3d7cc9', '#e48a3a'].map((k, i) => (
        <group key={k} position={[-0.5 + i * 0.5, 0.8, 0.35]}>
          {[0, 1, 2, 3, 4].map((j) => (
            <Blok key={j} size={[0.3, 0.025, 0.22]} pos={[(j % 2) * 0.01, 0.013 + j * 0.026, 0]} color="#fbfaf6" r={0.003} />
          ))}
          <Blok size={[0.05, 0.135, 0.23]} pos={[0, 0.065, 0]} color={k} r={0.004} />
          <Label regels={[`pakket ${i + 1}`]} breed={0.26} hoog={0.07} pos={[0, 0.06, 0.116]} bg={k} fg="#ffffff" rand={null} />
        </group>
      ))}
      {/* zandloper */}
      <group position={[0.75, 0.8, 0.45]}>
        <Cil r={0.06} h={0.015} pos={[0, 0.008, 0]} color={P.hout} seg={12} />
        <Cil r={0.06} h={0.015} pos={[0, 0.2, 0]} color={P.hout} seg={12} />
        <mesh position={[0, 0.1, 0]} material={mat('#e8f4f8', { opacity: 0.4, rough: 0.1 })}>
          <cylinderGeometry args={[0.045, 0.045, 0.18, 12, 1, true]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} material={mat('#e2c08e')}>
          <coneGeometry args={[0.04, 0.07, 10]} />
        </mesh>
      </group>
      <group ref={folder}>
        <Blok size={[0.2, 0.005, 0.14]} color="#fbfaf6" r={0.002} />
      </group>
    </group>
  );
}

/** EIN-08: sneeuwbol met een skipiste. Parcours 250 meter; Luuk won in 26,0 seconden. */
export function Sneeuwbol() {
  const skier = useRef<THREE.Group>(null);
  const vlokken = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const f = (t * 0.25) % 1;
    if (skier.current) {
      skier.current.position.set(Math.sin(f * Math.PI * 4) * 0.1, 0.42 - f * 0.3, -0.15 + f * 0.3);
      skier.current.rotation.y = Math.cos(f * Math.PI * 4) * 0.5;
    }
    vlokken.current?.children.forEach((v, i) => {
      v.position.y = 0.6 - ((t * 0.05 + i * 0.13) % 0.5);
    });
  });
  const vlok = useMemo(() => {
    const r = seeded(4);
    return Array.from({ length: 8 }, () => [(r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4] as V3);
  }, []);
  return (
    <group>
      <Toonbank b={2.0} d={0.8} kleur="#5fa8c9" />
      <group position={[-0.25, 0.92, 0]}>
        <Cil r={0.3} rTop={0.26} h={0.14} pos={[0, 0.07, 0]} color="#7a5132" seg={24} />
        <group position={[0, 0.14, 0]}>
          {/* piste */}
          <mesh position={[0, 0.16, 0]} rotation={[0.75, 0, 0]} material={mat('#fbfdff')}>
            <boxGeometry args={[0.36, 0.04, 0.42]} />
          </mesh>
          <Blok size={[0.44, 0.06, 0.44]} pos={[0, 0.03, 0]} color="#fbfdff" r={0.03} />
          {/* poortjes */}
          {[
            [-0.08, 0.3, -0.08, '#d8433a'],
            [0.08, 0.22, 0.0, '#3d7cc9'],
            [-0.08, 0.14, 0.08, '#d8433a'],
          ].map(([x, y, z, k], i) => (
            <group key={i} position={[x as number, y as number, z as number]}>
              <Cil r={0.004} h={0.08} pos={[0, 0.04, 0]} color={k as string} seg={4} />
              <Blok size={[0.04, 0.03, 0.003]} pos={[0.02, 0.065, 0]} color={k as string} r={0.001} />
            </group>
          ))}
          <group ref={skier}>
            <Blok size={[0.025, 0.05, 0.02]} pos={[0, 0.03, 0]} color="#e48a3a" r={0.008} />
            <Bol pos={[0, 0.065, 0]} r={0.012} kleur="#f0c6a0" />
            <Blok size={[0.008, 0.004, 0.07]} pos={[0, 0.003, 0]} color="#1f2224" r={0.001} />
          </group>
          <group ref={vlokken}>
            {vlok.map((p, i) => (
              <Bol key={i} pos={p} r={0.008} kleur="#ffffff" />
            ))}
          </group>
          <mesh position={[0, 0.26, 0]} material={mat('#e8f4f8', { opacity: 0.22, rough: 0.05 })}>
            <sphereGeometry args={[0.33, 24, 16]} />
          </mesh>
        </group>
      </group>
      <Kaartje regels={['Lengte wedstrijdparcours:', '250 meter']} pos={[-0.25, 0.92, 0.33]} breed={0.6} hoog={0.16} kleur="#f0f8fb" rand="#5fa8c9" schuin={-0.8} />
      {/* oorkonde */}
      <group position={[0.5, 0.92, -0.05]} rotation={[-0.25, -0.15, 0]}>
        <Blok size={[0.66, 0.5, 0.02]} pos={[0, 0.27, -0.012]} color="#c9a227" r={0.01} />
        <Label regels={['Oorkonde', 'Luuk · 1e plaats', 'tijd: 26,0 sec']} breed={0.62} hoog={0.46} pos={[0, 0.27, 0]} bg="#fffbea" rand={null} vet={0} />
      </group>
    </group>
  );
}

/** Mini-kruiwagen met grind. */
function Kruiwagen({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[0.08, 0.05, 0.12]} pos={[0, 0.06, 0]} color="#3f8f5a" r={0.015} />
      <mesh position={[0, 0.09, 0]} scale={[1, 0.5, 1.3]} material={mat('#9a9890', { flat: true })}>
        <icosahedronGeometry args={[0.045, 0]} />
      </mesh>
      <Cil r={0.025} h={0.015} pos={[0, 0.025, 0.07]} rot={[0, 0, Math.PI / 2]} color="#2c2f33" seg={8} />
      <Blok size={[0.07, 0.01, 0.1]} pos={[0, 0.05, -0.1]} rot={[0.3, 0, 0]} color="#5b5f62" r={0.003} />
    </group>
  );
}

/** EIN-09: maquette van de verbouwing: betonmolen, bouwbord (1 : 2 : 3) en 15 kruiwagens grind. */
export function Beton() {
  const trommel = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (trommel.current) trommel.current.rotation.y += dt * 1.2;
  });
  return (
    <group>
      <Blok size={[1.9, 0.08, 1.0]} pos={[0, 0.76, 0]} color={P.hout} r={0.03} />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.07, 0.72, 0.07]} pos={[sx * 0.88, 0.36, sz * 0.44]} color={P.hout} r={0.02} />))}
      <Blok size={[1.8, 0.02, 0.9]} pos={[0, 0.81, 0]} color="#e2cf9f" r={0.01} />
      {/* bouwbord */}
      <group position={[0, 0.82, -0.35]}>
        {[-0.5, 0.5].map((x) => (
          <Cil key={x} r={0.01} h={0.5} pos={[x, 0.25, 0]} color="#2f3634" seg={5} />
        ))}
        <Blok size={[1.12, 0.42, 0.02]} pos={[0, 0.38, -0.012]} color="#e48a3a" r={0.01} />
        <Label regels={['Samenstelling betonspecie', 'cement 1 deel · zand 2 delen', 'grind 3 delen', 'C  +  Z Z  +  G G G']} breed={1.08} hoog={0.38} pos={[0, 0.38, 0]} bg="#fff6ee" rand={null} vet={0} />
      </group>
      {/* betonmolen */}
      <group position={[-0.7, 0.82, 0.05]}>
        <Blok size={[0.18, 0.04, 0.12]} pos={[0, 0.02, 0]} color="#3b4442" r={0.01} />
        <Cil r={0.012} h={0.14} pos={[0, 0.09, 0]} color="#3b4442" seg={5} />
        <group ref={trommel} position={[0, 0.2, 0]} rotation={[0, 0, 0.5]}>
          <mesh material={mat('#e48a3a')}>
            <cylinderGeometry args={[0.04, 0.09, 0.16, 12]} />
          </mesh>
        </group>
      </group>
      {/* 15 kruiwagens grind in twee rijen (8 + 7): de delen moet je zelf bedenken */}
      {Array.from({ length: 15 }, (_, i) => (
        <Kruiwagen key={i} pos={[-0.42 + (i % 8) * 0.13 + (i >= 8 ? 0.065 : 0), 0.82, 0.04 + Math.floor(i / 8) * 0.2]} />
      ))}
      <Kaartje regels={['15 kruiwagens grind']} pos={[0.25, 0.82, 0.43]} breed={0.6} hoog={0.1} schuin={-1.0} kleur="#fff6ee" rand="#e48a3a" />
      {/* hoopjes zand en cement */}
      <mesh position={[0.75, 0.86, -0.05]} material={mat('#e8cf8a', { flat: true })}>
        <coneGeometry args={[0.12, 0.1, 8]} />
      </mesh>
      <Blok size={[0.1, 0.06, 0.07]} pos={[0.75, 0.84, 0.15]} color="#c9cdd0" r={0.01} />
    </group>
  );
}

/** Rieten mand met bloemkoppen. */
function Mand({ pos, soort }: { pos: V3; soort: 'gerbera' | 'hortensia' | 'roos' }) {
  const koppen = useMemo(() => {
    const r = seeded(soort.length * 11);
    return Array.from({ length: 7 }, (_, i) => [(r() - 0.5) * 0.26, 0.24 + r() * 0.08, (r() - 0.5) * 0.2, i] as const);
  }, [soort]);
  return (
    <group position={pos}>
      <Cil r={0.18} rTop={0.21} h={0.2} pos={[0, 0.1, 0]} color="#b98a55" seg={14} />
      <mesh position={[0, 0.2, 0]} material={mat('#a7794a')}>
        <torusGeometry args={[0.2, 0.015, 5, 16]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} scale={[1, 0.4, 1]} material={mat('#4f8d3c', { flat: true })}>
        <icosahedronGeometry args={[0.18, 1]} />
      </mesh>
      {koppen.map(([x, y, z, i]) =>
        soort === 'gerbera' ? (
          <group key={i} position={[x, y, z]} rotation={[-0.5, 0, 0]}>
            <Cil r={0.055} h={0.01} color="#ef6aa0" seg={12} />
            <Cil r={0.02} h={0.014} color="#f2c24a" seg={8} />
          </group>
        ) : soort === 'hortensia' ? (
          <mesh key={i} position={[x, y, z]} material={mat(i % 2 ? '#9cd06a' : '#b6dc84', { flat: true })}>
            <icosahedronGeometry args={[0.06, 1]} />
          </mesh>
        ) : (
          <mesh key={i} position={[x, y, z]} scale={[1, 0.85, 1]} material={mat('#f6e7a0', { flat: true })}>
            <dodecahedronGeometry args={[0.05, 0]} />
          </mesh>
        ),
      )}
    </group>
  );
}

/** EIN-10: bloemenkraam. Voorraad: 89 gerbera's, 19 hortensia's, 56 grote rozen. Een boeket: 5 + 1 + 3. */
export function Bloemen() {
  const hommel = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (hommel.current) hommel.current.position.set(Math.cos(t * 1.7) * 0.15, 1.3 + Math.sin(t * 4) * 0.04, -0.05 + Math.sin(t * 1.7) * 0.1);
  });
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#e86a9a" />
      <Mand pos={[-0.7, 0.92, -0.1]} soort="gerbera" />
      <Mand pos={[0.0, 0.92, -0.1]} soort="hortensia" />
      <Mand pos={[0.7, 0.92, -0.1]} soort="roos" />
      <Kaartje regels={["Voorraad gerbera's:", '89']} pos={[-0.7, 0.92, 0.22]} breed={0.5} hoog={0.18} kleur="#fff4f8" rand="#e86a9a" schuin={-0.7} />
      <Kaartje regels={["Voorraad hortensia's:", '19']} pos={[0.0, 0.92, 0.22]} breed={0.5} hoog={0.18} kleur="#f3faf0" rand="#5aa83a" schuin={-0.7} />
      <Kaartje regels={['Voorraad grote rozen:', '56']} pos={[0.7, 0.92, 0.22]} breed={0.5} hoog={0.18} kleur="#fffbea" rand="#c9a227" schuin={-0.7} />
      <group ref={hommel}>
        <mesh scale={[1, 0.9, 1.3]} material={mat('#f2c24a')}>
          <sphereGeometry args={[0.025, 8, 6]} />
        </mesh>
        <Blok size={[0.052, 0.012, 0.015]} pos={[0, 0.002, 0]} color="#2b2220" r={0.004} />
      </group>
      {/* voorbeeldboeket op een standaard */}
      <group position={[0, 0.0, -0.62]}>
        <Cil r={0.03} h={1.25} pos={[0, 0.62, 0]} color="#2f3634" seg={6} />
        <group position={[0, 1.25, 0]}>
          <mesh position={[0, 0.0, 0]} rotation={[Math.PI, 0, 0]} material={mat('#f6efe0')}>
            <coneGeometry args={[0.14, 0.32, 10, 1, true]} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <group key={`g${i}`} position={[Math.cos(i * 1.26) * 0.09, 0.2, Math.sin(i * 1.26) * 0.09]} rotation={[-0.3, 0, 0]}>
              <Cil r={0.045} h={0.01} color="#ef6aa0" seg={10} />
            </group>
          ))}
          <mesh position={[0, 0.26, 0]} material={mat('#9cd06a', { flat: true })}>
            <icosahedronGeometry args={[0.06, 1]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={`r${i}`} position={[Math.cos(i * 2.1 + 0.6) * 0.05, 0.3, Math.sin(i * 2.1 + 0.6) * 0.05]} material={mat('#f6e7a0', { flat: true })}>
              <dodecahedronGeometry args={[0.04, 0]} />
            </mesh>
          ))}
        </group>
        <Label regels={['1 boeket:', "5 gerbera's", '1 hortensia', '3 grote rozen']} breed={0.5} hoog={0.46} pos={[0, 0.8, 0.04]} bg="#fbfaf6" rand="#e86a9a" vet={0} />
      </group>
    </group>
  );
}
