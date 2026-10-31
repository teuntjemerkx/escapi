// 3D-objecten voor de keuzestations: expertvragen, de praktijkopdracht en de puzzels.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat } from '../game/inspectie';
import { useGroei, useOpgelost } from '../game/opgelost';
import { mat, seeded } from '../game/kit';
import { Blok, Cil } from './blok';
import { P } from '../game/palette';
import { rondRect } from '../game/tekst';
import { Druk, druk } from './atlas';
import { Bol, Glas, Kaartje, KLEUR, krijtAchtergrond, Label, schrijf, Tekenbord, Toonbank, type V3 } from './kraam';

/** Etiket rond de voorkant van een fles, pot of blik (deel van een cilinder). */
function RondEtiket({ r, h, y, teken, sleutel, hoek = 2.2, achter = false, ppm = 900 }: { r: number; h: number; y: number; teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; sleutel: string; hoek?: number; achter?: boolean; ppm?: number }) {
  const start = (achter ? Math.PI : 0) - hoek / 2;
  return (
    <Druk b={r * hoek} h={h} teken={teken} sleutel={sleutel} ppm={ppm} rough={0.6} position={[0, y, 0]}>
      <cylinderGeometry args={[r, r, h, 24, 1, true, start, hoek]} />
    </Druk>
  );
}

// ─────────────────────────── Expertvragen ───────────────────────────

/** EXP-01: fles gezeefde tomaten (0,8 l, € 2,19) met het recept op de achterkant, en een soeppan van 8 liter. */
export function Tomatensoep() {
  const stoom = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (stoom.current) {
      const f = (t * 0.3) % 1;
      stoom.current.position.y = 1.32 + f * 0.5;
      stoom.current.scale.setScalar(0.6 + f * 0.6);
      (stoom.current.material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - f);
    }
  });
  const stoomMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f6e9e6', transparent: true, opacity: 0.4, roughness: 1 }), []);
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#c9cdd0" blad="#9aa3a8" />
      {/* fles */}
      <group position={[-0.55, 0.92, 0.0]}>
        <mesh position={[0, 0.2, 0]} material={mat('#c8352c', { rough: 0.4 })}>
          <cylinderGeometry args={[0.1, 0.1, 0.38, 20]} />
        </mesh>
        <mesh position={[0, 0.24, 0]} material={mat('#e8f4f8', { opacity: 0.3, rough: 0.1 })}>
          <cylinderGeometry args={[0.11, 0.11, 0.48, 20, 1, true]} />
        </mesh>
        <Cil r={0.04} rTop={0.035} h={0.12} pos={[0, 0.54, 0]} color="#c8352c" seg={12} />
        <Cil r={0.045} h={0.05} pos={[0, 0.62, 0]} color="#1f2224" seg={12} />
        <RondEtiket
          r={0.112}
          h={0.24}
          y={0.22}
          sleutel="w3-tomaat-voor"
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fbf3e2';
            ctx.fillRect(0, 0, w, h);
            schrijf(ctx, 'Gezeefde', w / 2, h * 0.2, h * 0.15, '#b8243a', { gewicht: 700, uitlijn: 'center' });
            schrijf(ctx, 'tomaten', w / 2, h * 0.38, h * 0.15, '#b8243a', { gewicht: 700, uitlijn: 'center' });
            ctx.fillStyle = '#d8433a';
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.58, h * 0.08, 0, Math.PI * 2);
            ctx.fill();
            schrijf(ctx, 'Inhoud 0,8 l', w / 2, h * 0.84, h * 0.15, '#1f2a24', { gewicht: 700, uitlijn: 'center', max: w * 0.95 });
          }}
        />
        <RondEtiket
          r={0.112}
          h={0.24}
          y={0.22}
          achter
          sleutel="w3-tomaat-achter"
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fbf3e2';
            ctx.fillRect(0, 0, w, h);
            schrijf(ctx, 'Tomatensoep:', w / 2, h * 0.13, h * 0.12, '#b8243a', { gewicht: 700, uitlijn: 'center', max: w * 0.95 });
            ['1 fles gezeefde tomaten', '0,5 l water', '0,3 l kookroom', '1 takje tijm'].forEach((r, i) => schrijf(ctx, r, w / 2, h * (0.34 + i * 0.19), h * 0.11, '#1f2a24', { gewicht: 600, uitlijn: 'center', max: w * 0.95 }));
          }}
        />
        {/* rond prijsstickertje */}
        <group position={[0.07, 0.42, 0.085]} rotation={[0, 0.6, 0]}>
          <Cil r={0.06} h={0.006} rot={[Math.PI / 2, 0, 0]} color="#9aa3a8" seg={20} />
          <Label regels={['€ 2,19']} breed={0.1} hoog={0.06} pos={[0, 0, 0.004]} bg="#9aa3a8" fg="#ffffff" rand={null} />
        </group>
      </group>
      <Kaartje regels={['Recept: draai', 'de fles om']} pos={[-0.55, 0.92, 0.27]} breed={0.34} hoog={0.14} kleur="#fbf3e2" rand="#b8243a" schuin={-0.6} />
      {/* water, kookroom en tijm */}
      <group position={[-0.15, 0.92, 0.05]}>
        <Glas pos={[0, 0, 0]} r={0.07} h={0.2} vul={0.8} />
        <Kaartje regels={['0,5 l water']} pos={[0, 0, 0.13]} breed={0.24} hoog={0.07} schuin={-0.8} />
      </group>
      <group position={[0.12, 0.92, 0.05]}>
        <Blok size={[0.1, 0.18, 0.07]} pos={[0, 0.09, 0]} color="#fbfaf6" r={0.01} />
        <Kaartje regels={['0,3 l kookroom']} pos={[0, 0, 0.13]} breed={0.27} hoog={0.07} schuin={-0.8} />
      </group>
      <group position={[0.12, 0.925, -0.2]} rotation={[0, 0.5, 0]}>
        <Cil r={0.004} h={0.2} rot={[0, 0, Math.PI / 2]} color="#5f7a3a" seg={4} />
        {[-0.07, -0.03, 0.01, 0.05].map((x) => (
          <Bol key={x} pos={[x, 0.01, 0.01]} r={0.012} kleur="#7a9a4a" />
        ))}
      </group>
      {/* soeppan met maatstreep 8 liter */}
      <group position={[0.65, 0.92, -0.02]}>
        <Cil r={0.28} rTop={0.3} h={0.38} pos={[0, 0.19, 0]} color="#b9c0c4" seg={22} />
        <Soep aan={useOpgelost('O3-EXP-01')} />
        {[-1, 1].map((s) => (
          <Blok key={s} size={[0.1, 0.03, 0.05]} pos={[s * 0.34, 0.32, 0]} color="#2f3634" r={0.01} />
        ))}
        <Blok size={[0.2, 0.012, 0.01]} pos={[0, 0.33, 0.297]} color="#2f3634" r={0.003} />
        <Label regels={['8 liter']} breed={0.22} hoog={0.08} pos={[0, 0.22, 0.3]} bg="#fbfaf6" rand="#2f3634" />
      </group>
      <mesh ref={stoom} position={[0.65, 1.32, -0.02]} material={stoomMat}>
        <sphereGeometry args={[0.1, 12, 10]} />
      </mesh>
    </group>
  );
}

/** Tomatensoep die in de pan stijgt na het goede antwoord. */
function Soep({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3);
  return (
    <group position={[0, 0.02, 0]}>
      <group ref={ref}>
        <Cil r={0.275} h={0.3} pos={[0, 0.15, 0]} color="#c8352c" seg={22} />
      </group>
    </group>
  );
}

/** Echte fiets (± 1,7 m lang), voorwiel naar −z (in het rek). */
function Fiets({ pos, kleur, rot = 0 }: { pos: V3; kleur: string; rot?: number }) {
  const band = mat('#24272b', { rough: 0.8 });
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.52, 0.52].map((z) => (
        <mesh key={z} position={[0, 0.34, z]} rotation={[0, Math.PI / 2, 0]} material={band} castShadow>
          <torusGeometry args={[0.31, 0.03, 5, 16]} />
        </mesh>
      ))}
      {/* frame: onderbuis, bovenbuis, zadelbuis, vork */}
      <Blok size={[0.045, 0.045, 0.66]} pos={[0, 0.52, -0.12]} rot={[-0.62, 0, 0]} color={kleur} r={0} />
      <Blok size={[0.04, 0.04, 0.56]} pos={[0, 0.8, -0.06]} rot={[0.08, 0, 0]} color={kleur} r={0} />
      <Blok size={[0.045, 0.56, 0.045]} pos={[0, 0.6, 0.16]} rot={[-0.3, 0, 0]} color={kleur} r={0} />
      <Blok size={[0.04, 0.04, 0.5]} pos={[0, 0.36, 0.33]} rot={[0.1, 0, 0]} color={kleur} r={0} />
      <Blok size={[0.04, 0.62, 0.04]} pos={[0, 0.66, -0.44]} rot={[0.25, 0, 0]} color={kleur} r={0} />
      {/* stuur en zadel */}
      <Blok size={[0.56, 0.035, 0.035]} pos={[0, 1.0, -0.36]} color="#2f3634" r={0} />
      <Blok size={[0.14, 0.05, 0.24]} pos={[0, 0.92, 0.26]} color="#2a2420" r={0.02} />
      {/* bagagedrager */}
      <Blok size={[0.16, 0.03, 0.34]} pos={[0, 0.7, 0.46]} color="#2f3634" r={0} />
    </group>
  );
}

/** Echte scooter (± 1,7 m lang), voorkant naar −z. */
function Scooter({ pos, kleur, rot = 0 }: { pos: V3; kleur: string; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.56, 0.56].map((z) => (
        <Cil key={z} r={0.21} h={0.12} pos={[0, 0.21, z]} rot={[0, 0, Math.PI / 2]} color="#24272b" seg={14} />
      ))}
      <Blok size={[0.34, 0.36, 1.05]} pos={[0, 0.5, 0.18]} color={kleur} r={0.12} />
      <Blok size={[0.26, 0.12, 0.62]} pos={[0, 0.77, 0.3]} color="#2a2420" r={0.05} />
      <Blok size={[0.36, 0.62, 0.16]} pos={[0, 0.66, -0.42]} rot={[0.25, 0, 0]} color={kleur} r={0.06} />
      <Blok size={[0.2, 0.08, 0.38]} pos={[0, 0.3, -0.2]} color="#3b4250" r={0.02} />
      <Blok size={[0.06, 0.4, 0.06]} pos={[0, 1.02, -0.5]} rot={[0.25, 0, 0]} color="#3b4250" r={0} />
      <Blok size={[0.56, 0.04, 0.04]} pos={[0, 1.2, -0.56]} color="#2f3634" r={0} />
      <Blok size={[0.14, 0.1, 0.06]} pos={[0, 1.06, -0.6]} color="#fff2c8" r={0.02} />
    </group>
  );
}

/** EXP-02: de echte stalling van het Hudde College op de kade: 4 scooters tegen 7 fietsen (4 : 7). */
export function Scooters() {
  const SCOOTER = ['#d8433a', '#3d7cc9', '#2f3634', '#e48a3a'];
  const FIETS = ['#3f8f5a', '#3d7cc9', '#9b7fd0', '#e5675a', '#2f3634', '#f2c24a', '#5fa8c9'];
  return (
    <group>
      {/* tegels en afdak */}
      <Blok size={[6.3, 0.05, 2.0]} pos={[0, 0.025, -0.1]} color="#a9a59d" r={0.01} />
      {[-3.0, 0, 3.0].map((x) => (
        <Blok key={x} size={[0.08, 2.45, 0.08]} pos={[x, 1.22, -0.98]} color="#2f3634" r={0} />
      ))}
      {[-3.0, 3.0].map((x) => (
        <Blok key={x} size={[0.06, 0.06, 1.3]} pos={[x, 2.36, -0.4]} rot={[0.12, 0, 0]} color="#2f3634" r={0} />
      ))}
      <Blok size={[6.4, 0.06, 1.55]} pos={[0, 2.42, -0.38]} rot={[0.12, 0, 0]} color="#3f8f5a" r={0.02} />
      {/* fietsenrek */}
      <Blok size={[6.0, 0.05, 0.05]} pos={[0, 0.42, -0.88]} color="#9aa3a8" r={0} />
      {[-2.9, -1.45, 0, 1.45, 2.9].map((x) => (
        <Blok key={x} size={[0.05, 0.42, 0.05]} pos={[x, 0.21, -0.88]} color="#9aa3a8" r={0} />
      ))}
      {/* 4 scooters, 7 fietsen */}
      {Array.from({ length: 11 }, (_, i) => {
        const x = -2.75 + i * 0.55;
        return i < 4 ? <Scooter key={i} pos={[x, 0.05, -0.12]} kleur={SCOOTER[i]} /> : <Fiets key={i} pos={[x, 0.05, -0.1 + (i % 2) * 0.06]} kleur={FIETS[i - 4]} />;
      })}
      {/* bord van de school aan de voorkant van het afdak */}
      <group position={[0, 2.48, 0.42]} rotation={[0.12, 0, 0]}>
        <Blok size={[3.3, 0.62, 0.05]} pos={[0, 0, -0.03]} color="#1d3a6b" r={0.02} />
        <Label regels={['Hudde College · bovenbouw', '464 leerlingen hebben een scooter']} breed={3.2} hoog={0.54} pos={[0, 0, 0.001]} bg="#f4f8fd" rand={null} vet={0} />
      </group>
      {/* bordje met de verhouding */}
      <group position={[2.55, 0, 0.72]}>
        <Blok size={[0.06, 1.0, 0.06]} pos={[0, 0.5, -0.03]} color="#2f3634" r={0} />
        <Blok size={[1.5, 0.36, 0.04]} pos={[0, 1.12, -0.03]} color="#3f8f5a" r={0.02} />
        <Label regels={['met scooter : zonder scooter = 4 : 7']} breed={1.44} hoog={0.3} pos={[0, 1.12, 0]} bg="#fbfaf6" rand={null} />
      </group>
    </group>
  );
}

/** Pop-art selfie: 11 vrolijke poppetjes rond een telefoon. */
function tekenSelfie(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffd84a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffb22e';
  for (let x = 10; x < w; x += 26) for (let y = 10; y < h; y += 26) {
    ctx.beginPath();
    ctx.arc(x + ((y / 26) % 2) * 13, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  const kleur = ['#e5675a', '#3d7cc9', '#3f8f5a', '#e86a9a', '#9b7fd0', '#e48a3a', '#5fa8c9', '#d8433a', '#2f5d46', '#f2c24a', '#b8243a'];
  const plek: [number, number, number][] = [
    [0.12, 0.62, 1],
    [0.24, 0.5, 1.05],
    [0.36, 0.6, 1],
    [0.5, 0.48, 1.12],
    [0.64, 0.6, 1],
    [0.76, 0.5, 1.05],
    [0.88, 0.62, 1],
    [0.18, 0.85, 0.95],
    [0.4, 0.86, 0.95],
    [0.62, 0.86, 0.95],
    [0.84, 0.86, 0.95],
  ];
  plek.forEach(([x, y, s], i) => {
    const r = h * 0.09 * s;
    ctx.fillStyle = kleur[i];
    ctx.beginPath();
    ctx.ellipse(w * x, h * y + r * 1.9, r * 1.4, r * 1.1, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = ['#f0c6a0', '#d9a77c', '#b07a52', '#f3d2b3'][i % 4];
    ctx.beginPath();
    ctx.arc(w * x, h * y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1f1a17';
    ctx.stroke();
    ctx.fillStyle = '#1f1a17';
    ctx.beginPath();
    ctx.arc(w * x - r * 0.35, h * y - r * 0.1, r * 0.12, 0, Math.PI * 2);
    ctx.arc(w * x + r * 0.35, h * y - r * 0.1, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * x, h * y + r * 0.2, r * 0.45, 0.2, Math.PI - 0.2);
    ctx.stroke();
  });
  // telefoon
  ctx.fillStyle = '#1f1a17';
  rondRect(ctx, w * 0.46, h * 0.1, w * 0.08, h * 0.22, 10);
  ctx.fill();
  ctx.fillStyle = '#9fd0de';
  rondRect(ctx, w * 0.47, h * 0.12, w * 0.06, h * 0.17, 6);
  ctx.fill();
  ctx.strokeStyle = '#1f1a17';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.32);
  ctx.lineTo(w * 0.5, h * 0.42);
  ctx.stroke();
}

/** EXP-03: pop-art schilderij van een groepsselfie met het bordje over Makati City. */
export function Selfie() {
  const flits = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % 5;
    if (flits.current) (flits.current.material as THREE.MeshStandardMaterial).emissiveIntensity = t < 0.15 ? 2 : 0.05;
  });
  const flitsMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff6d0', emissiveIntensity: 0.05 }), []);
  return (
    <group>
      {/* paneel op poten */}
      {[-0.8, 0.8].map((x) => (
        <Blok key={x} size={[0.08, 2.1, 0.08]} pos={[x, 1.05, -0.05]} color="#2f3634" r={0.02} />
      ))}
      <Tekenbord breed={1.6} hoog={1.05} poten={0.95} lijst="#d8433a" sleutel="w3-selfie" teken={tekenSelfie} ppm={360} />
      <group position={[0, 0.55, 0.04]}>
        <Blok size={[1.56, 0.6, 0.04]} pos={[0, 0, -0.02]} color="#2f3634" r={0.02} />
        <Label regels={['Makati City 2014', '258 selfiemakers', 'per 100.000 mensen', '610.000 inwoners']} breed={1.5} hoog={0.54} pos={[0, 0, 0.002]} bg="#fbfaf6" rand={null} vet={0} />
      </group>
      {/* statief met flitser */}
      <group position={[0.95, 0, 0.75]} rotation={[0, -0.6, 0]}>
        {[0, 2.1, 4.2].map((a) => (
          <Blok key={a} size={[0.03, 1.3, 0.03]} pos={[Math.sin(a) * 0.18, 0.63, Math.cos(a) * 0.18]} rot={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]} color="#2f3634" r={0.01} />
        ))}
        <Blok size={[0.26, 0.18, 0.14]} pos={[0, 1.34, 0]} color="#2f3634" r={0.03} />
        <mesh ref={flits} position={[0, 1.5, 0.02]} material={flitsMat}>
          <boxGeometry args={[0.14, 0.08, 0.06]} />
        </mesh>
      </group>
    </group>
  );
}

/** Tabelbord van de schroevenshop. */
function tekenSchroeven(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#e9ecee';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#5b6370';
  ctx.fillRect(0, 0, w, h * 0.17);
  schrijf(ctx, 'Schroevenshop', w * 0.04, h * 0.085, h * 0.1, '#ffffff', { gewicht: 700 });
  const kol = [0.04, 0.3, 0.57, 0.79];
  const kop = ['Merk', 'Aantal', 'Lengte', 'Prijs'];
  kop.forEach((k, i) => schrijf(ctx, k, w * kol[i], h * 0.28, h * 0.085, '#5b6370', { gewicht: 700 }));
  const rijen = [
    ['Heco', '350', '40 mm', '€ 25,55'],
    ['Orvy', '400', '40 mm', '€ 29,45'],
    ['Outline', '90', '40 mm', '€ 6,70'],
  ];
  rijen.forEach((r, j) => {
    const y = h * (0.47 + j * 0.19);
    ctx.fillStyle = j % 2 ? '#f6f7f8' : '#dfe3e6';
    ctx.fillRect(w * 0.02, y - h * 0.085, w * 0.96, h * 0.17);
    r.forEach((v, i) => schrijf(ctx, v, w * kol[i], y, h * 0.11, '#1f2a24', { gewicht: i === 0 || i === 3 ? 700 : 600 }));
  });
}

/** Bovenkant met schroefjes (textuur in plaats van losse schroeven). */
function schroefjes(sleutel: string, kleur: string) {
  return druk(
    0.3,
    0.3,
    (ctx, w, h) => {
      ctx.fillStyle = kleur;
      ctx.fillRect(0, 0, w, h);
      const r = seeded(sleutel.length * 7);
      for (let i = 0; i < 70; i++) {
        const x = r() * w;
        const y = r() * h;
        const a = r() * Math.PI;
        ctx.strokeStyle = '#c9cdd0';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26);
        ctx.stroke();
        ctx.fillStyle = '#e1e4e6';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    sleutel,
    500,
  );
}

/** EXP-04: ijzerwarenkraam met het bord "Schroevenshop" en de drie bakjes schroeven. */
export function Schroeven() {
  const sKarton = schroefjes('w3-schroef-a', '#8a6a4a');
  const sBak = schroefjes('w3-schroef-b', '#26292b');
  const sGlas = schroefjes('w3-schroef-c', '#9fb3c0');
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#9aa3a8" />
      <Tekenbord breed={2.1} hoog={1.05} poten={1.0} pos={[0, 0, -0.55]} lijst="#5b6370" sleutel="w3-schroevenbord" teken={tekenSchroeven} />
      {/* Heco: open kartonnen doosje */}
      <group position={[-0.65, 0.92, 0.0]}>
        <Blok size={[0.32, 0.14, 0.24]} pos={[0, 0.07, 0]} color="#c99a62" r={0.01} />
        <Druk {...sKarton} position={[0, 0.141, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.28, 0.2]} />
        </Druk>
        <Blok size={[0.32, 0.02, 0.14]} pos={[0, 0.2, -0.17]} rot={[-1.0, 0, 0]} color="#b98a55" r={0.005} />
        <Kaartje regels={['Heco', '€ 25,55']} pos={[0, 0, 0.18]} breed={0.26} hoog={0.14} schuin={-0.7} rand="#5b6370" />
      </group>
      {/* Orvy: zwarte stapelbak */}
      <group position={[0.0, 0.92, 0.0]}>
        <Blok size={[0.34, 0.18, 0.28]} pos={[0, 0.09, 0]} color="#26292b" r={0.02} />
        <Druk {...sBak} position={[0, 0.181, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.24]} />
        </Druk>
        <Kaartje regels={['Orvy', '€ 29,45']} pos={[0, 0, 0.2]} breed={0.26} hoog={0.14} schuin={-0.7} rand="#5b6370" />
      </group>
      {/* Outline: glazen kommetje */}
      <group position={[0.65, 0.92, 0.0]}>
        <mesh position={[0, 0.06, 0]} material={mat('#e8f4f8', { opacity: 0.4, rough: 0.1 })}>
          <cylinderGeometry args={[0.13, 0.09, 0.12, 20, 1, true]} />
        </mesh>
        <Druk {...sGlas} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.11, 20]} />
        </Druk>
        <Kaartje regels={['Outline', '€ 6,70']} pos={[0, 0, 0.18]} breed={0.26} hoog={0.14} schuin={-0.7} rand="#5b6370" />
      </group>
    </group>
  );
}

/** Verfblik met een etiket. */
function Verfblik({ pos, r, h, kleur, deksel, tekst, sleutel }: { pos: V3; r: number; h: number; kleur: string; deksel: string; tekst: [string, string]; sleutel: string }) {
  return (
    <group position={pos}>
      <Cil r={r} h={h} pos={[0, h / 2, 0]} color="#c9cdd0" seg={20} />
      <Cil r={r * 0.92} h={0.012} pos={[0, h + 0.006, 0]} color={deksel} seg={20} />
      <RondEtiket
        r={r + 0.003}
        h={h * 0.7}
        y={h * 0.48}
        hoek={2.6}
        ppm={1000}
        sleutel={sleutel}
        teken={(ctx, w, hh) => {
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, hh);
          const licht = kleur === '#fbfaf6';
          schrijf(ctx, tekst[0], w / 2, hh * 0.32, hh * 0.24, licht ? '#2f3634' : '#ffffff', { gewicht: 700, uitlijn: 'center', max: w * 0.7 });
          schrijf(ctx, tekst[1], w / 2, hh * 0.7, hh * 0.28, licht ? '#1f2a24' : '#ffffff', { gewicht: 700, uitlijn: 'center', max: w * 0.7 });
        }}
      />
    </group>
  );
}

/** Lichtblauwe mengverf die in de emmer stijgt na het goede antwoord. */
function Mengverf({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3);
  return (
    <group position={[0, 0.02, 0]}>
      <group ref={ref}>
        <Cil r={0.165} h={0.22} pos={[0, 0.11, 0]} color="#9fc4ef" seg={18} />
        <Label regels={['5,6 liter']} breed={0.24} hoog={0.07} pos={[0, 0.12, 0.172]} bg="#f4f8fd" rand="#3d7cc9" />
      </group>
    </group>
  );
}

/** EXP-05: verfwinkel. 8 blikken blauw van 225 ml, 2 blikken wit van 21 dl; mengen in de verhouding 1 : 3. */
export function Verf() {
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#9fc4ef" />
      {Array.from({ length: 8 }, (_, i) => (
        <Verfblik key={i} pos={[-0.88 + (i % 4) * 0.17, 0.92, -0.12 + Math.floor(i / 4) * 0.2]} r={0.065} h={0.13} kleur="#2f6ac0" deksel="#2f6ac0" tekst={['blauw', '225 ml']} sleutel="w3-blik-blauw" />
      ))}
      {[0, 1].map((i) => (
        <Verfblik key={i} pos={[0.05 + i * 0.32, 0.92, -0.05]} r={0.13} h={0.28} kleur="#fbfaf6" deksel="#e9ecee" tekst={['wit', '21 dl']} sleutel="w3-blik-wit" />
      ))}
      {/* mengemmer */}
      <group position={[0.78, 0.92, 0.0]}>
        <Cil r={0.16} rTop={0.18} h={0.26} pos={[0, 0.13, 0]} color="#e9ecee" seg={18} />
        <Mengverf aan={useOpgelost('O3-EXP-05')} />
        <Blok size={[0.03, 0.42, 0.015]} pos={[0.05, 0.36, 0]} rot={[0, 0, -0.25]} color={P.houtLicht} r={0.005} />
      </group>
      <group position={[0.55, 0.92, 0.3]} rotation={[-0.5, 0, 0]}>
        <Blok size={[0.6, 0.18, 0.015]} pos={[0, 0.09, -0.01]} color="#3d7cc9" r={0.005} />
        <Label regels={['blauw : wit = 1 : 3']} breed={0.58} hoog={0.16} pos={[0, 0.09, 0]} bg="#f4f8fd" rand={null} />
      </group>
    </group>
  );
}

/** EXP-06: krantenkiosk. Poster: € 0,05 per krant. Stapels van 78 kranten; 1 stapel duurt 26 minuten; Tom werkt 130 minuten. */
export function Kranten() {
  const duif = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (duif.current) duif.current.rotation.x = Math.max(0, Math.sin(clock.getElapsedTime() * 3)) * 0.5;
  });
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#e48a3a" />
      <Tekenbord
        breed={1.4}
        hoog={1.0}
        poten={1.05}
        pos={[-0.35, 0, -0.55]}
        lijst="#5b6370"
        sleutel="w3-bezorgposter"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#e8e6e2';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#e48a3a';
          ctx.fillRect(0, 0, w, h * 0.22);
          schrijf(ctx, 'Bezorgers gezocht!', w / 2, h * 0.11, h * 0.11, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          // bezorger met krant
          ctx.fillStyle = '#5b6370';
          ctx.beginPath();
          ctx.ellipse(w * 0.2, h * 0.86, w * 0.12, h * 0.14, 0, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#f0c6a0';
          ctx.beginPath();
          ctx.arc(w * 0.2, h * 0.52, h * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#4a3426';
          ctx.beginPath();
          ctx.arc(w * 0.2, h * 0.47, h * 0.1, Math.PI, 0);
          ctx.fill();
          // tekstballon
          ctx.fillStyle = '#ffffff';
          rondRect(ctx, w * 0.36, h * 0.32, w * 0.6, h * 0.5, 24);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(w * 0.37, h * 0.62);
          ctx.lineTo(w * 0.3, h * 0.6);
          ctx.lineTo(w * 0.37, h * 0.52);
          ctx.fill();
          schrijf(ctx, 'Je verdient', w * 0.66, h * 0.44, h * 0.09, '#1f2a24', { gewicht: 600, uitlijn: 'center' });
          schrijf(ctx, '€ 0,05', w * 0.66, h * 0.59, h * 0.13, '#e48a3a', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, 'per krant', w * 0.66, h * 0.73, h * 0.09, '#1f2a24', { gewicht: 600, uitlijn: 'center' });
        }}
      />
      {/* klok: Tom werkt 130 minuten */}
      <group position={[0.75, 1.75, -0.55]}>
        <Cil r={0.22} h={0.05} rot={[Math.PI / 2, 0, 0]} color="#fbfaf6" seg={24} />
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#2f3634')}>
          <torusGeometry args={[0.22, 0.025, 6, 24]} />
        </mesh>
        <Blok size={[0.02, 0.15, 0.01]} pos={[0, 0.06, 0.03]} color="#2f3634" r={0.004} />
        <Blok size={[0.1, 0.02, 0.01]} pos={[0.04, 0, 0.03]} color="#2f3634" r={0.004} />
        <Label regels={['Tom werkt', '130 minuten']} breed={0.5} hoog={0.24} pos={[0, -0.4, 0.02]} bg="#fbfaf6" rand="#e48a3a" vet={1} />
      </group>
      {/* stapels kranten met een bandje */}
      {[-0.65, -0.25].map((x, i) => (
        <group key={x} position={[x, 0.92, 0.05]}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <Blok key={k} size={[0.34, 0.035, 0.26]} pos={[(k % 2) * 0.01, 0.018 + k * 0.036, 0]} color={k % 2 ? '#e9e6df' : '#f4f2ec'} r={0.004} />
          ))}
          <Blok size={[0.06, 0.225, 0.27]} pos={[0, 0.11, 0]} color="#e48a3a" r={0.004} />
          {i === 0 && <Kaartje regels={['1 stapel', '78 kranten']} pos={[0, 0, 0.17]} breed={0.3} hoog={0.14} schuin={-0.7} rand="#e48a3a" />}
          {i === 1 && <Kaartje regels={['1 stapel', '26 minuten']} pos={[0, 0, 0.17]} breed={0.3} hoog={0.14} schuin={-0.7} rand="#e48a3a" />}
        </group>
      ))}
      {/* bezorgtas en duif */}
      <group position={[0.35, 0.92, 0.05]}>
        <Blok size={[0.4, 0.3, 0.18]} pos={[0, 0.15, 0]} color="#e48a3a" r={0.05} />
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]} material={mat('#2f3634')}>
          <torusGeometry args={[0.16, 0.012, 6, 18, Math.PI]} />
        </mesh>
      </group>
      <group position={[0.8, 0.92, 0.2]} rotation={[0, -0.8, 0]}>
        <group ref={duif}>
          <mesh position={[0, 0.07, 0]} scale={[0.8, 0.8, 1.3]} material={mat('#8d949a')}>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
          <Bol pos={[0, 0.14, 0.07]} r={0.035} kleur="#6e757b" />
          <Blok size={[0.06, 0.01, 0.08]} pos={[0, 0.12, 0.12]} color="#fbfaf6" r={0.003} />
        </group>
      </group>
    </group>
  );
}

const MEDAILLES: (string | number)[][] = [
  [2008, 7, 5, 4, 16],
  [2004, 4, 9, 9, 22],
  [2000, 11, 10, 4, 25],
  [1996, 4, 5, 10, 19],
  [1992, 2, 6, 7, 15],
  ['…', '', '', '', ''],
  [1928, 6, 9, 4, 19],
  ['…', '', '', '', ''],
  [1900, 1, 2, 3, 6],
];

/** EXP-07: scorebord met de Nederlandse medailles op de Olympische Spelen, plus de onderdelen in 1900 en 2000. */
export function Scorebord() {
  const leeuw = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (leeuw.current) leeuw.current.position.y = 2.66 + Math.abs(Math.sin(clock.getElapsedTime() * 3)) * 0.06;
  });
  return (
    <group>
      {[-1.25, 1.25].map((x) => (
        <Blok key={x} size={[0.1, 2.6, 0.1]} pos={[x, 1.3, -0.08]} color="#2f3634" r={0.02} />
      ))}
      <Tekenbord
        breed={2.4}
        hoog={1.62}
        poten={0.95}
        lijst="#1f2224"
        ppm={520}
        sleutel="w3-scorebord"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#151a1c';
          ctx.fillRect(0, 0, w, h);
          const kol = [0.13, 0.36, 0.55, 0.74, 0.92];
          const rijH = h / 10.4;
          ['jaar', 'goud', 'zilver', 'brons', 'totaal'].forEach((k, i) => schrijf(ctx, k, w * kol[i], rijH * 0.7, rijH * 0.62, ['#ffffff', '#f2c24a', '#c9cdd0', '#d08a4a', '#ff9a3c'][i], { gewicht: 700, uitlijn: 'center' }));
          ctx.fillStyle = '#ff8a2a';
          ctx.fillRect(w * 0.03, rijH * 1.25, w * 0.94, 3);
          MEDAILLES.forEach((r, j) => {
            const y = rijH * (2.0 + j);
            r.forEach((v, i) => schrijf(ctx, String(v), w * kol[i], y, rijH * 0.66, '#ffb347', { gewicht: 700, uitlijn: 'center' }));
          });
        }}
      />
      {/* uitschuifbalken met de onderdelen */}
      <Label regels={['1900: 85 onderdelen']} breed={1.1} hoog={0.2} pos={[-0.62, 0.78, 0.02]} bg="#f2c24a" fg="#1f2a24" rand="#1f2224" />
      <Label regels={['2000: 276 onderdelen']} breed={1.1} hoog={0.2} pos={[0.62, 0.78, 0.02]} bg="#f2c24a" fg="#1f2a24" rand="#1f2224" />
      {/* oranje leeuwtje */}
      <group ref={leeuw} position={[0.95, 2.66, 0]}>
        <mesh scale={[1.3, 0.9, 0.9]} material={mat('#ff8a2a')}>
          <sphereGeometry args={[0.1, 12, 10]} />
        </mesh>
        <Bol pos={[0.13, 0.08, 0]} r={0.08} kleur="#ff8a2a" />
        <mesh position={[0.13, 0.08, 0]} material={mat('#c85a10', { flat: true })}>
          <icosahedronGeometry args={[0.1, 0]} />
        </mesh>
      </group>
    </group>
  );
}

/** EXP-08a/b: bakkerij met het grootste pitabrood. Bord met het recept, kaartjes bij de pita. */
export function Pitabrood() {
  const snit = druk(
    1.1,
    0.7,
    (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.55);
      g.addColorStop(0, '#f3d49a');
      g.addColorStop(1, '#d9a560');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#b97f3e';
      ctx.lineWidth = 3;
      for (let x = w / 8; x < w; x += w / 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = h / 5; y < h; y += h / 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#c8564a';
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.arc(((i * 0.37) % 1) * w, ((i * 0.61) % 1) * h, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    'w3-pita',
    360,
  );
  return (
    <group>
      <Toonbank b={2.2} d={0.85} kleur="#d9a560" />
      <Tekenbord
        breed={2.0}
        hoog={1.1}
        poten={1.0}
        pos={[0, 0, -0.55]}
        sleutel="w3-pitabord"
        teken={(ctx, w, h) => {
          krijtAchtergrond(ctx, w, h);
          schrijf(ctx, 'Grootste pitabrood · Eindhoven 2004', w / 2, h * 0.12, h * 0.085, '#f2d04a', { gewicht: 700, uitlijn: 'center', max: w * 0.94 });
          schrijf(ctx, 'Recept: per 48 kg bloem', w * 0.06, h * 0.34, h * 0.1, KLEUR.krijtLijn, { gewicht: 600 });
          schrijf(ctx, '→ 31 l water en 2 kg gist', w * 0.06, h * 0.52, h * 0.1, KLEUR.krijtLijn, { gewicht: 600 });
          ctx.strokeStyle = '#f2d04a';
          ctx.lineWidth = 4;
          ctx.strokeRect(w * 0.04, h * 0.66, w * 0.92, h * 0.24);
          schrijf(ctx, 'Gebruikt: 4,5 kg gist', w * 0.5, h * 0.78, h * 0.11, '#ffffff', { gewicht: 700, uitlijn: 'center' });
        }}
      />
      {/* reuzenpita */}
      <group position={[-0.25, 0.92, 0.04]}>
        <mesh position={[0, 0.03, 0]} scale={[1, 0.08, 0.64]} castShadow material={mat('#d9a560')}>
          <sphereGeometry args={[0.55, 24, 12]} />
        </mesh>
        <Druk {...snit} rough={0.9} position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.64, 1]}>
          <circleGeometry args={[0.52, 32]} />
        </Druk>
      </group>
      <Kaartje regels={['pita: 28,3 m²']} pos={[0.55, 0.92, 0.22]} breed={0.42} hoog={0.1} kleur="#fff6e2" rand="#7a5132" schuin={-0.7} />
      <Kaartje regels={['1 stuk ≈ 100 cm²']} pos={[0.55, 0.92, 0.04]} breed={0.42} hoog={0.1} kleur="#fff6e2" rand="#7a5132" schuin={-0.7} />
      <Kaartje regels={['30 g beleg per stuk']} pos={[0.55, 0.92, -0.14]} breed={0.42} hoog={0.1} kleur="#fff6e2" rand="#7a5132" schuin={-0.7} />
      {/* zak bloem en gist */}
      <group position={[0.92, 0.92, -0.05]}>
        <Blok size={[0.24, 0.32, 0.16]} pos={[0, 0.16, 0]} color="#f4efe2" r={0.06} />
        <Label regels={['bloem']} breed={0.18} hoog={0.07} pos={[0, 0.17, 0.082]} bg="#f4efe2" fg="#7a5132" rand={null} />
      </group>
    </group>
  );
}

/** Tower Bridge in een bordeauxrode lijst, met maatpijlen 121,7 m en 92,4 m. */
function tekenBrug(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#a9cbe6');
  g.addColorStop(1, '#e8eef2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const x0 = w * 0.08;
  const x1 = w * 0.8;
  const yb = h * 0.78;
  ctx.fillStyle = '#7fa6b9';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  // torens
  for (const tx of [x0 + (x1 - x0) * 0.27, x0 + (x1 - x0) * 0.73]) {
    ctx.fillStyle = '#9b9a93';
    ctx.fillRect(tx - w * 0.05, h * 0.2, w * 0.1, yb - h * 0.2);
    ctx.fillStyle = '#7d7c76';
    ctx.beginPath();
    ctx.moveTo(tx - w * 0.06, h * 0.21);
    ctx.lineTo(tx, h * 0.08);
    ctx.lineTo(tx + w * 0.06, h * 0.21);
    ctx.fill();
    ctx.fillStyle = '#5c6b74';
    ctx.fillRect(tx - w * 0.02, h * 0.42, w * 0.04, h * 0.12);
  }
  // loopbrug boven en wegdek
  ctx.fillStyle = '#4d7fa8';
  ctx.fillRect(x0 + (x1 - x0) * 0.32, h * 0.28, (x1 - x0) * 0.36, h * 0.05);
  ctx.fillStyle = '#6e6d68';
  ctx.fillRect(x0, h * 0.6, x1 - x0, h * 0.05);
  ctx.strokeStyle = '#4d7fa8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x0, h * 0.42);
  ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.12, h * 0.55, x0 + (x1 - x0) * 0.22, h * 0.6);
  ctx.moveTo(x1, h * 0.42);
  ctx.quadraticCurveTo(x1 - (x1 - x0) * 0.12, h * 0.55, x1 - (x1 - x0) * 0.22, h * 0.6);
  ctx.stroke();
  // rode dubbeldekker
  ctx.fillStyle = '#d8433a';
  ctx.fillRect(x0 + (x1 - x0) * 0.42, h * 0.54, w * 0.07, h * 0.06);
  // maatpijlen
  ctx.strokeStyle = '#1f2a24';
  ctx.fillStyle = '#1f2a24';
  ctx.lineWidth = 5;
  const pijl = (ax: number, ay: number, bx: number, by: number) => {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    for (const [px, py, dx, dy] of [
      [ax, ay, bx - ax, by - ay],
      [bx, by, ax - bx, ay - by],
    ]) {
      const l = Math.hypot(dx, dy);
      const ux = dx / l;
      const uy = dy / l;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + ux * 22 - uy * 10, py + uy * 22 + ux * 10);
      ctx.lineTo(px + ux * 22 + uy * 10, py + uy * 22 - ux * 10);
      ctx.fill();
    }
  };
  pijl(x0, h * 0.88, x1, h * 0.88);
  ctx.fillStyle = '#fbfaf6';
  rondRect(ctx, (x0 + x1) / 2 - w * 0.11, h * 0.82, w * 0.22, h * 0.12, 10);
  ctx.fill();
  schrijf(ctx, '121,7 m', (x0 + x1) / 2, h * 0.88, h * 0.08, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
  ctx.fillStyle = '#1f2a24';
  pijl(w * 0.88, h * 0.08, w * 0.88, yb);
  ctx.fillStyle = '#fbfaf6';
  rondRect(ctx, w * 0.82, h * 0.38, w * 0.16, h * 0.14, 10);
  ctx.fill();
  schrijf(ctx, '92,4 m', w * 0.9, h * 0.45, h * 0.075, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
}

/** EXP-09: schilderij van de Tower Bridge en een tekentafel met een liggend A4 (297 × 210 mm). */
export function TowerBridge() {
  const A4 = { b: 0.297 * 2, d: 0.21 * 2 };
  return (
    <group>
      {[-0.72, 0.72].map((x) => (
        <Blok key={x} size={[0.07, 2.1, 0.07]} pos={[x, 1.05, -0.45]} color="#5a2230" r={0.02} />
      ))}
      <Tekenbord breed={1.5} hoog={1.0} poten={1.05} pos={[0, 0, -0.42]} lijst="#7a1f35" sleutel="w3-towerbridge" teken={tekenBrug} />
      {/* tekentafel met A4 */}
      <group position={[0, 0, 0.25]}>
        <Blok size={[1.0, 0.05, 0.7]} pos={[0, 0.85, 0]} rot={[0.15, 0, 0]} color="#e9e2d4" r={0.02} />
        {[-0.42, 0.42].map((x) => (
          <Blok key={x} size={[0.06, 0.85, 0.06]} pos={[x, 0.42, 0]} color={P.hout} r={0.02} />
        ))}
        <group position={[0, 0.878, 0]} rotation={[0.15, 0, 0]}>
          <Deel id="a4" uit={[0, 0.35, 0.2]} label="A4 liggend: 297 × 210 mm">
            <Blok size={[A4.b, 0.004, A4.d]} pos={[0, 0, 0]} color="#ffffff" r={0.001} />
            <Maat van={[-A4.b / 2, 0.01, A4.d / 2 + 0.03]} naar={[A4.b / 2, 0.01, A4.d / 2 + 0.03]} label="297 mm" />
            <Maat van={[-A4.b / 2 - 0.03, 0.01, -A4.d / 2]} naar={[-A4.b / 2 - 0.03, 0.01, A4.d / 2]} label="210 mm" />
          </Deel>
          <Blok size={[0.012, 0.012, 0.16]} pos={[0.2, 0.01, 0.05]} rot={[0, 0.6, 0]} color="#e48a3a" r={0.004} />
        </group>
      </group>
      <Kaartje regels={['A4: 297 × 210 mm']} pos={[-0.62, 0, 0.62]} breed={0.5} hoog={0.12} schuin={-1.1} rand="#7a1f35" />
    </group>
  );
}

/** PRA-01: feestje plannen. Picknicktafel met een boodschappenmand, een lijstje en de rekenregel. */
export function Boodschappen() {
  return (
    <group>
      <Blok size={[1.7, 0.07, 0.8]} pos={[0, 0.75, 0]} color={P.houtLicht} r={0.03} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[1.7, 0.06, 0.28]} pos={[0, 0.44, s * 0.6]} color={P.hout} r={0.02} />
      ))}
      {[-0.7, 0.7].map((x) => (
        <Blok key={x} size={[0.08, 0.72, 1.4]} pos={[x, 0.36, 0]} color={P.hout} r={0.02} />
      ))}
      {/* mand met producten */}
      <group position={[-0.45, 0.785, 0]}>
        <Blok size={[0.5, 0.22, 0.34]} pos={[0, 0.11, 0]} color="#d8433a" r={0.03} opacity={0.92} />
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, 0]} material={mat('#2f3634')}>
          <torusGeometry args={[0.2, 0.012, 6, 16, Math.PI]} />
        </mesh>
        <Blok size={[0.14, 0.22, 0.06]} pos={[-0.12, 0.26, 0]} color="#f2c24a" r={0.03} />
        <Cil r={0.04} h={0.3} pos={[0.06, 0.3, 0.05]} color="#3f8f5a" seg={10} />
        <Blok size={[0.12, 0.16, 0.1]} pos={[0.15, 0.24, -0.06]} color="#3d7cc9" r={0.01} />
      </group>
      {/* boodschappenlijst */}
      <group position={[0.15, 0.79, 0.0]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <Label regels={['Feestje:', '10 producten', 'winkel 1 en 2', 'prijs per 100 g?']} breed={0.36} hoog={0.46} bg="#fffdf4" rand="#3d7cc9" vet={0} />
      </group>
      {/* rekenregel */}
      <group position={[0.58, 0.79, 0.05]} rotation={[-0.9, 0, 0]}>
        <Blok size={[0.5, 0.3, 0.015]} pos={[0, 0.15, -0.01]} color="#f2c24a" r={0.005} />
        <Label regels={['prijs per 100 g =', 'prijs : gram × 100']} breed={0.48} hoog={0.28} pos={[0, 0.15, 0]} bg="#fffbea" rand={null} vet={-1} />
      </group>
    </group>
  );
}

// ─────────────────────────── Puzzels ───────────────────────────

type Icoon = 'glas' | 'kopje' | 'mok';
function tekenIcoon(ctx: CanvasRenderingContext2D, soort: Icoon, x: number, y: number, s: number) {
  ctx.lineWidth = s * 0.07;
  ctx.strokeStyle = '#ffffff';
  if (soort === 'glas') {
    ctx.fillStyle = '#f2d04a';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.32, y - s * 0.4);
    ctx.lineTo(x + s * 0.32, y - s * 0.4);
    ctx.lineTo(x + s * 0.25, y + s * 0.45);
    ctx.lineTo(x - s * 0.25, y + s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#d8433a';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.05, y - s * 0.2);
    ctx.lineTo(x + s * 0.25, y - s * 0.65);
    ctx.stroke();
  } else if (soort === 'kopje') {
    ctx.fillStyle = '#ffffff';
    rondRect(ctx, x - s * 0.36, y - s * 0.22, s * 0.62, s * 0.55, s * 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + s * 0.3, y + s * 0.02, s * 0.14, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillRect(x - s * 0.48, y + s * 0.36, s * 0.86, s * 0.07);
  } else {
    ctx.fillStyle = '#3d7cc9';
    rondRect(ctx, x - s * 0.34, y - s * 0.36, s * 0.6, s * 0.78, s * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#3d7cc9';
    ctx.beginPath();
    ctx.arc(x + s * 0.3, y + s * 0.02, s * 0.17, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.1, y - s * 0.45);
    ctx.quadraticCurveTo(x - s * 0.2, y - s * 0.6, x - s * 0.05, y - s * 0.72);
    ctx.stroke();
  }
}

/** PUZ-01: lichtblauw krijtbord met de drankjespuzzel; op de bar staan een glas sap, een kopje en een mok. */
export function Drankjes() {
  return (
    <group>
      <Toonbank b={2.0} d={0.8} kleur="#7a5132" />
      <Tekenbord
        breed={2.0}
        hoog={1.3}
        poten={0.95}
        pos={[0, 0, -0.55]}
        sleutel="w3-drankjes"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#9fd3e6';
          ctx.fillRect(0, 0, w, h);
          const rijen: { iconen: Icoon[]; tekens: string[]; uit: string }[] = [
            { iconen: ['glas', 'glas', 'glas', 'glas'], tekens: ['+', '+', '+'], uit: '28' },
            { iconen: ['kopje', 'kopje', 'glas'], tekens: ['+', '+'], uit: '17' },
            { iconen: ['kopje', 'mok'], tekens: ['+'], uit: '9' },
            { iconen: ['glas', 'kopje', 'mok', 'glas'], tekens: ['+', '+', '−'], uit: '?' },
          ];
          const s = h * 0.17;
          rijen.forEach((r, j) => {
            const y = h * (0.13 + j * 0.245);
            r.iconen.forEach((ic, i) => {
              const x = w * 0.08 + i * w * 0.15;
              tekenIcoon(ctx, ic, x, y, s);
              if (i < r.tekens.length) schrijf(ctx, r.tekens[i], x + w * 0.075, y, h * 0.1, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
            });
            schrijf(ctx, `= ${r.uit}`, w * 0.66, y, h * 0.13, r.uit === '?' ? '#d8433a' : '#1f2a24', { gewicht: 700 });
          });
        }}
      />
      {/* echte drankjes */}
      <Glas pos={[-0.5, 0.92, 0.05]} r={0.07} h={0.2} vul={0.8} kleur="#f2c24a" />
      <Cil r={0.008} h={0.26} pos={[-0.46, 1.1, 0.05]} rot={[0, 0, -0.25]} color="#d8433a" seg={5} />
      <group position={[0.0, 0.92, 0.08]}>
        <Cil r={0.07} rTop={0.08} h={0.1} pos={[0, 0.05, 0]} color={P.wit} seg={16} />
        <Cil r={0.11} h={0.01} pos={[0, 0.005, 0]} color={P.wit} seg={16} />
        <mesh position={[0.085, 0.05, 0]} material={mat(P.wit)}>
          <torusGeometry args={[0.03, 0.01, 6, 10]} />
        </mesh>
      </group>
      <group position={[0.5, 0.92, 0.05]}>
        <Cil r={0.075} h={0.17} pos={[0, 0.085, 0]} color="#3d7cc9" seg={16} />
        <mesh position={[0.09, 0.09, 0]} material={mat('#3d7cc9')}>
          <torusGeometry args={[0.04, 0.013, 6, 10]} />
        </mesh>
      </group>
      <Prijskaartjes af={useOpgelost('O3-PUZ-01')} />
    </group>
  );
}

/** Kaartjes bij de drankjes: eerst een vraagteken, na het goede antwoord de waarde. */
function Prijskaartjes({ af }: { af: boolean }) {
  return (
    <>
      {[
        [-0.5, '7'],
        [0.0, '5'],
        [0.5, '4'],
      ].map(([x, w]) => (
        <Kaartje key={x as number} regels={[af ? (w as string) : '?']} pos={[x as number, 0.92, 0.3]} breed={0.12} hoog={0.1} schuin={-0.7} kleur={af ? '#eaf7e4' : '#fffbea'} rand="#3d7cc9" />
      ))}
    </>
  );
}

/** Rond koekje met een getal (tegel voor de kruissom). */
function Koekje({ pos, getal }: { pos: V3; getal: number }) {
  return (
    <group position={pos}>
      <Cil r={0.16} h={0.05} pos={[0, 0.025, 0]} color="#d9a560" seg={20} />
      <Label regels={[String(getal)]} breed={0.2} hoog={0.2} pos={[0, 0.052, 0]} rot={[-Math.PI / 2, 0, 0]} bg="#d9a560" fg="#5a3416" rand={null} groot={0.85} />
    </group>
  );
}

/** PUZ-02: kruissom als groot bakkersbord op de vloer. De koekjes met 0, 2, 5 en 8 liggen op een bakplaat. */
export function Koekjesbord({ rooster, tegels, oplossing = [], id = '' }: { rooster: string[][]; tegels: number[]; oplossing?: string[]; id?: string }) {
  const af = useOpgelost(id);
  const ref = useGroei(af, 0.3, 'alle');
  const c = 0.44;
  const leeg = rooster.flatMap((rij, r) => rij.map((v, k) => (v === '' ? [r, k] : null)).filter((x): x is number[] => !!x));
  const rijen = rooster.length;
  const kol = Math.max(...rooster.map((r) => r.length));
  return (
    <group>
      <Blok size={[kol * c + 0.4, 0.08, rijen * c + 0.4]} pos={[-0.35, 0.04, 0]} color="#f2c24a" r={0.04} shadow={false} />
      {rooster.flatMap((rij, r) =>
        rij.map((v, k) => {
          if (v === '#') return null;
          const x = -0.35 + (k - (kol - 1) / 2) * c;
          const z = (r - (rijen - 1) / 2) * c;
          const leeg = v === '';
          return (
            <group key={`${r}-${k}`} position={[x, 0.085, z]}>
              {leeg ? (
                <Cil r={c * 0.42} h={0.02} pos={[0, 0.01, 0]} color="#fbfaf6" seg={22} />
              ) : (
                <>
                  <Blok size={[c * 0.9, 0.03, c * 0.9]} pos={[0, 0.015, 0]} color="#fff3c9" r={0.02} shadow={false} />
                  <Label regels={[v === 'x' ? '×' : v === '-' ? '−' : v]} breed={c * 0.8} hoog={c * 0.8} pos={[0, 0.032, 0]} rot={[-Math.PI / 2, 0, 0]} bg="#fff3c9" rand={null} groot={0.8} />
                </>
              )}
            </group>
          );
        }),
      )}
      {/* na het goede antwoord: de koekjes in de vakjes */}
      <group ref={ref}>
        {leeg.map(([r, k], i) =>
          oplossing[i] !== undefined ? <Koekje key={i} pos={[-0.35 + (k - (kol - 1) / 2) * c, 0.1, (r - (rijen - 1) / 2) * c]} getal={Number(oplossing[i])} /> : null,
        )}
      </group>
      {/* bakplaat met de koekjes */}
      <group position={[1.15, 0, 0]}>
        <Blok size={[0.5, 0.5, 1.5]} pos={[0, 0.25, 0]} color="#7a5132" r={0.04} />
        <Blok size={[0.46, 0.03, 1.44]} pos={[0, 0.515, 0]} color="#9aa3a8" r={0.01} />
        {tegels.map((t, i) => (
          <Koekje key={i} pos={[0, 0.53, -0.51 + i * 0.34]} getal={t} />
        ))}
      </group>
    </group>
  );
}

/** PUZ-03: groen krijtbord met drie figuren van krijtlijnen: raster = 9, kruis = 1, hekje = ?. */
export function Lijnenbord() {
  return (
    <group>
      {[-0.95, 0.95].map((x) => (
        <Blok key={x} size={[0.07, 2.0, 0.07]} pos={[x, 1.0, -0.05]} color={P.hout} r={0.02} />
      ))}
      <Tekenbord
        breed={1.9}
        hoog={1.05}
        poten={0.85}
        sleutel="w3-lijnenbord"
        teken={(ctx, w, h) => {
          krijtAchtergrond(ctx, w, h, '#2f5a3f');
          const figuur = (cx: number, n: number, uit: string) => {
            const s = h * 0.42;
            ctx.strokeStyle = KLEUR.krijtLijn;
            ctx.lineWidth = 9;
            ctx.lineCap = 'round';
            for (let i = 1; i <= n; i++) {
              const t = -s / 2 + (i * s) / (n + 1);
              ctx.beginPath();
              ctx.moveTo(cx - s / 2, h * 0.4 + t);
              ctx.lineTo(cx + s / 2, h * 0.4 + t);
              ctx.moveTo(cx + t, h * 0.4 - s / 2);
              ctx.lineTo(cx + t, h * 0.4 + s / 2);
              ctx.stroke();
            }
            schrijf(ctx, `= ${uit}`, cx, h * 0.83, h * 0.15, uit === '?' ? '#f2d04a' : KLEUR.krijtLijn, { gewicht: 700, uitlijn: 'center' });
          };
          figuur(w * 0.18, 3, '9');
          figuur(w * 0.5, 1, '1');
          figuur(w * 0.82, 2, '?');
        }}
      />
      <Blok size={[1.9, 0.05, 0.1]} pos={[0, 0.82, 0.05]} color={P.hout} r={0.01} />
      <Kruispunten aan={useOpgelost('O3-PUZ-03')} />
      <Blok size={[0.08, 0.025, 0.025]} pos={[0.6, 0.86, 0.06]} color="#fbfaf6" r={0.008} />
    </group>
  );
}

/** Gele stipjes op de kruispunten van figuur 3 (na het goede antwoord). */
function Kruispunten({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  const t = (0.42 * 1.05) / 6;
  return (
    <group position={[(0.82 - 0.5) * 1.9, 0.85 + 1.05 * 0.6, 0.02]}>
      <group ref={ref}>
        {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Bol key={`${a}${b}`} pos={[a * t, b * t, 0]} r={0.03} kleur="#f2d04a" />))}
      </group>
    </group>
  );
}

/** Ketting van drie draden naar een schaal. */
function Schaal({ pos, lengte, r }: { pos: V3; lengte: number; r: number }) {
  return (
    <group position={pos}>
      {[0, 2.09, 4.19].map((a) => (
        <Blok key={a} size={[0.008, lengte, 0.008]} pos={[Math.sin(a) * r * 0.45, -lengte / 2, Math.cos(a) * r * 0.45]} rot={[Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2]} color="#3b3f42" r={0.002} />
      ))}
      <Cil r={r} rTop={r * 1.05} h={0.03} pos={[0, -lengte, 0]} color="#5b5f62" seg={20} />
    </group>
  );
}

/** PUZ-04: gietijzeren balans bij de kaaskraam. Links 2 witte en 1 rode kaasbol, rechts een kleine balans: 3 rood tegen 30. */
export function Balans() {
  const muis = useRef<THREE.Group>(null);
  const af = useOpgelost('O3-PUZ-04');
  const label = useGroei(af, 0.4, 'alle');
  useFrame(({ clock }) => {
    if (muis.current) muis.current.rotation.z = Math.sin(clock.getElapsedTime() * 3) * 0.12;
  });
  const ijzer = '#4a4f52';
  return (
    <group>
      <Cil r={0.4} rTop={0.2} h={0.12} pos={[0, 0.06, 0]} color={ijzer} seg={20} />
      <Cil r={0.06} h={1.5} pos={[0, 0.85, 0]} color={ijzer} seg={12} />
      <Cil r={0.09} h={0.12} pos={[0, 1.62, 0]} color={ijzer} seg={12} />
      <Blok size={[1.6, 0.06, 0.06]} pos={[0, 1.55, 0]} color={ijzer} r={0.02} />
      {/* linkerschaal: 2 wit + 1 rood */}
      <Schaal pos={[-0.78, 1.52, 0]} lengte={0.62} r={0.2} />
      <group position={[-0.78, 0.92, 0]}>
        <Bol pos={[-0.08, 0.06, 0.02]} r={0.065} kleur="#f4f1ea" />
        <Bol pos={[0.08, 0.06, 0.02]} r={0.065} kleur="#f4f1ea" />
        <Bol pos={[0, 0.06, -0.08]} r={0.065} kleur="#d8433a" />
        <group ref={label} position={[0, -0.1, 0.27]}>
          <Label regels={['○ = 25']} breed={0.3} hoog={0.12} bg="#f4f1ea" rand="#3f9a4a" dubbel />
        </group>
      </group>
      {/* rechts: kleine balans */}
      <Blok size={[0.008, 0.25, 0.008]} pos={[0.78, 1.41, 0]} color="#3b3f42" r={0.002} />
      <Blok size={[0.7, 0.04, 0.04]} pos={[0.78, 1.28, 0]} color={ijzer} r={0.01} />
      <Schaal pos={[0.47, 1.26, 0]} lengte={0.42} r={0.15} />
      <Schaal pos={[1.09, 1.26, 0]} lengte={0.42} r={0.15} />
      <group position={[0.47, 0.86, 0]}>
        <Bol pos={[-0.06, 0.055, 0.03]} r={0.055} kleur="#d8433a" />
        <Bol pos={[0.06, 0.055, 0.03]} r={0.055} kleur="#d8433a" />
        <Bol pos={[0, 0.055, -0.06]} r={0.055} kleur="#d8433a" />
      </group>
      <group position={[1.09, 0.86, 0]}>
        <Bol pos={[0, 0.075, 0]} r={0.075} kleur="#3f9a4a" />
        <Label regels={['30']} breed={0.09} hoog={0.07} pos={[0, 0.08, 0.076]} bg="#3f9a4a" fg="#ffffff" rand={null} groot={0.9} />
        <group ref={muis} position={[0, 0.15, 0]}>
          <mesh scale={[1, 0.8, 1.4]} material={mat('#9aa0a6')}>
            <sphereGeometry args={[0.035, 10, 8]} />
          </mesh>
          <Bol pos={[-0.018, 0.03, 0.025]} r={0.012} kleur="#e7b7b7" />
          <Bol pos={[0.018, 0.03, 0.025]} r={0.012} kleur="#e7b7b7" />
        </group>
      </group>
      {/* bordje: witte bol = ? */}
      <group position={[0, 0.12, 0.42]} rotation={[-0.4, 0, 0]}>
        <Blok size={[0.5, 0.22, 0.02]} pos={[0, 0.11, -0.012]} color={ijzer} r={0.01} />
        <Label regels={['○ = ?']} breed={0.46} hoog={0.18} pos={[0, 0.11, 0]} bg="#fbfaf6" rand={null} groot={0.8} />
      </group>
    </group>
  );
}

/** Platte T-shirtvorm (met de twee scheuren als gaten). */
function shirtVorm() {
  const s = new THREE.Shape();
  s.moveTo(-0.28, 0);
  s.lineTo(-0.28, 0.5);
  s.lineTo(-0.42, 0.42);
  s.lineTo(-0.5, 0.58);
  s.lineTo(-0.16, 0.76);
  s.lineTo(-0.1, 0.76);
  s.quadraticCurveTo(0, 0.62, 0.1, 0.76);
  s.lineTo(0.16, 0.76);
  s.lineTo(0.5, 0.58);
  s.lineTo(0.42, 0.42);
  s.lineTo(0.28, 0.5);
  s.lineTo(0.28, 0);
  s.closePath();
  for (const [x, y, a] of [
    [0.06, 0.44, 0.45],
    [0.08, 0.2, -0.3],
  ]) {
    const g = new THREE.Path();
    const l = 0.12;
    const b = 0.04;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const p = (u: number, v: number) => [x + u * c - v * sn, y + u * sn + v * c] as const;
    g.moveTo(...p(-l, 0));
    g.quadraticCurveTo(...p(0, b * 2), ...p(l, 0));
    g.quadraticCurveTo(...p(0, -b * 2), ...p(-l, 0));
    s.holes.push(g);
  }
  return s;
}

/** Naden die voor- en achterkant verbinden (open blijven: hals, mouwen, onderkant). */
const NADEN: [number, number, number, number][] = [
  [-0.28, 0, -0.28, 0.5],
  [-0.28, 0.5, -0.42, 0.42],
  [-0.5, 0.58, -0.16, 0.76],
  [0.16, 0.76, 0.5, 0.58],
  [0.42, 0.42, 0.28, 0.5],
  [0.28, 0.5, 0.28, 0],
];

/** PUZ-05: wit T-shirt aan een rek voor een mintgroene wand. Door de 2 scheuren zie je de wand: ze gaan door voor- en achterkant. */
export function Tshirt() {
  const vorm = useMemo(() => shirtVorm(), []);
  const mot = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mot.current) mot.current.position.set(0.3 + Math.sin(t * 1.3) * 0.25, 1.35 + Math.sin(t * 2.7) * 0.12, 0.3 + Math.cos(t * 1.3) * 0.15);
  });
  const S = 1.35;
  const dik = 0.1;
  const wit = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fbfaf6', roughness: 0.9, side: THREE.DoubleSide }), []);
  return (
    <group>
      {/* mintgroene wand */}
      <Blok size={[2.0, 1.95, 0.08]} pos={[0, 0.975, -0.45]} color="#9fe0c4" r={0.03} />
      {/* rek */}
      {[-0.75, 0.75].map((x) => (
        <group key={x}>
          <Blok size={[0.05, 1.85, 0.05]} pos={[x, 0.925, 0]} color="#2f3634" r={0.01} />
          <Blok size={[0.05, 0.03, 0.5]} pos={[x, 0.015, 0]} color="#2f3634" r={0.01} />
        </group>
      ))}
      <Cil r={0.02} h={1.55} pos={[0, 1.83, 0]} rot={[0, 0, Math.PI / 2]} color="#9aa3a8" seg={8} />
      {/* hanger */}
      <mesh position={[0, 1.76, 0]} material={mat('#9aa3a8')}>
        <torusGeometry args={[0.04, 0.008, 6, 12, Math.PI * 1.4]} />
      </mesh>
      <Blok size={[0.56, 0.02, 0.02]} pos={[0, 1.66, 0]} color={P.hout} r={0.005} />
      {/* T-shirt: voorkant, achterkant en naden */}
      <group position={[0, 1.66 - 0.76 * S, 0]} scale={[S, S, 1]}>
        <mesh position={[0, 0, dik / 2]} material={wit} castShadow>
          <shapeGeometry args={[vorm]} />
        </mesh>
        <mesh position={[0, 0, -dik / 2]} material={wit} castShadow>
          <shapeGeometry args={[vorm]} />
        </mesh>
        {NADEN.map(([x1, y1, x2, y2], i) => {
          const l = Math.hypot(x2 - x1, y2 - y1);
          return (
            <mesh key={i} position={[(x1 + x2) / 2, (y1 + y2) / 2, 0]} rotation={[0, 0, Math.atan2(y2 - y1, x2 - x1)]} material={wit}>
              <boxGeometry args={[l, 0.012, dik]} />
            </mesh>
          );
        })}
      </group>
      <Label regels={['Hoeveel gaten zitten', 'er in dit shirt?']} breed={1.1} hoog={0.3} pos={[0, 2.1, -0.4]} bg="#fbfaf6" rand="#3fa08f" vet={-1} />
      <group ref={mot}>
        <Blok size={[0.03, 0.02, 0.06]} color="#8a7a66" r={0.008} shadow={false} />
        <Blok size={[0.12, 0.004, 0.04]} pos={[0, 0.01, 0]} color="#b8a98f" r={0.002} shadow={false} />
      </group>
    </group>
  );
}
