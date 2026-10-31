// 3D-objecten voor "Zelf doen" (niveau): de drie klussen meten, schenken en wegen.
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Maat } from '../game/inspectie';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { P } from '../game/palette';
import { FONT, rondRect, useTextuur } from '../game/tekst';
import { useGroei, useOpgelost } from '../game/opgelost';
import { GetalVak, Keukenweegschaal, Poppetje, Scherm, Tekst } from './bouw';

type V3 = [number, number, number];

/* ════════════ klus 1: meten op de kade (lengte) ════════════ */

/** NIV-01a: blauwe wegwijzer "A 348 – Arnhem 5 – De Beemd". Achter de 5 knippert een leeg vakje. */
export function Snelwegbord() {
  const klaar = useOpgelost('O1-NIV-01a');
  const B = 2.3;
  const H = 1.6;
  const tex = useTextuur(
    B,
    H,
    (ctx, w, h) => {
      const blauw = '#1f5fa8';
      ctx.fillStyle = blauw;
      rondRect(ctx, 0, 0, w, h, h * 0.05);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = h * 0.025;
      rondRect(ctx, h * 0.03, h * 0.03, w - h * 0.06, h - h * 0.06, h * 0.04);
      ctx.stroke();
      // pijl omhoog
      ctx.fillStyle = '#ffffff';
      const px = w * 0.13;
      ctx.beginPath();
      ctx.moveTo(px, h * 0.08);
      ctx.lineTo(px + w * 0.07, h * 0.22);
      ctx.lineTo(px + w * 0.025, h * 0.22);
      ctx.lineTo(px + w * 0.025, h * 0.36);
      ctx.lineTo(px - w * 0.025, h * 0.36);
      ctx.lineTo(px - w * 0.025, h * 0.22);
      ctx.lineTo(px - w * 0.07, h * 0.22);
      ctx.closePath();
      ctx.fill();
      // rood wegnummer
      ctx.fillStyle = '#d52b1e';
      rondRect(ctx, w * 0.62, h * 0.09, w * 0.3, h * 0.22, h * 0.03);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = h * 0.015;
      rondRect(ctx, w * 0.63, h * 0.105, w * 0.28, h * 0.19, h * 0.025);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${h * 0.13}px ${FONT}`;
      ctx.fillText('A 348', w * 0.77, h * 0.205);
      // Arnhem 5
      ctx.textAlign = 'left';
      ctx.font = `700 ${h * 0.17}px ${FONT}`;
      ctx.fillText('Arnhem', w * 0.08, h * 0.52);
      ctx.textAlign = 'right';
      ctx.fillText('5', w * 0.66, h * 0.52);
      // witte strook De Beemd met fabriekje
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w * 0.05, h * 0.7, w * 0.9, h * 0.22);
      ctx.fillStyle = blauw;
      const fx = w * 0.12;
      const fy = h * 0.88;
      ctx.fillRect(fx, fy - h * 0.08, w * 0.08, h * 0.08);
      ctx.beginPath();
      ctx.moveTo(fx, fy - h * 0.08);
      ctx.lineTo(fx + w * 0.027, fy - h * 0.12);
      ctx.lineTo(fx + w * 0.027, fy - h * 0.08);
      ctx.lineTo(fx + w * 0.054, fy - h * 0.12);
      ctx.lineTo(fx + w * 0.054, fy - h * 0.08);
      ctx.fill();
      ctx.fillRect(fx + w * 0.062, fy - h * 0.16, w * 0.014, h * 0.08);
      ctx.textAlign = 'left';
      ctx.font = `700 ${h * 0.14}px ${FONT}`;
      ctx.fillText('De Beemd', w * 0.25, h * 0.81);
    },
    'snelwegbord-a348',
    300,
  );
  const y = 1.75;
  return (
    <group>
      {[-0.8, 0.8].map((x) => (
        <Cil key={x} r={0.05} h={y + 0.6} pos={[x, (y + 0.6) / 2, -0.11]} color="#9aa3a8" seg={10} />
      ))}
      <Blok size={[B + 0.06, H + 0.06, 0.05]} pos={[0, y, -0.03]} color="#9aa3a8" r={0.03} />
      <mesh position={[0, y, 0]}>
        <planeGeometry args={[B, H]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
      {/* leeg vakje achter de 5 */}
      <group position={[0.26 * B, y - 0.02 * H, 0.004]}>
        {klaar ? <Tekst regels={['km']} b={0.38} h={0.26} o={{ bg: '#ffffff', fg: '#1f5fa8', radius: 0.1, groot: 0.8 }} /> : <KnipperVak b={0.38} h={0.26} />}
      </group>
      {/* klein geel bordje met A en een vrachtwagentje */}
      <group position={[-1.15, 0, 0.35]}>
        <Cil r={0.025} h={0.9} pos={[0, 0.45, 0]} color="#9aa3a8" seg={8} />
        <Tekst regels={['A']} b={0.22} h={0.22} pos={[0, 0.85, 0.03]} o={{ bg: '#f2d04a', rand: '#1f2a24', radius: 0.1 }} />
      </group>
      <Vrachtwagentje pos={[0.75, 0, 0.55]} />
    </group>
  );
}

/** Knipperend leeg vakje los te plaatsen. */
function KnipperVak({ b, h }: { b: number; h: number }) {
  const ref = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 3.2) * 0.35;
  });
  return (
    <group>
      <mesh>
        <planeGeometry args={[b, h]} />
        <meshBasicMaterial ref={ref} color="#ffcf7a" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[b + 0.04, h + 0.04]} />
        <meshBasicMaterial color="#e8781f" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Vrachtwagentje({ pos }: { pos: V3 }) {
  return (
    <group position={pos} rotation={[0, -0.5, 0]} scale={0.7}>
      <Blok size={[0.34, 0.3, 0.32]} pos={[0.42, 0.25, 0]} color="#d86a4a" r={0.05} />
      <Blok size={[0.2, 0.12, 0.3]} pos={[0.5, 0.33, 0]} color={P.glas} r={0.03} />
      <Blok size={[0.7, 0.06, 0.34]} pos={[-0.05, 0.12, 0]} color="#3b3a39" r={0.02} />
      <Blok size={[0.66, 0.28, 0.3]} pos={[-0.07, 0.3, 0]} color="#4f86b8" r={0.03} />
      {[-0.3, 0.05, 0.42].map((x) =>
        [-0.16, 0.16].map((z) => <Cil key={`${x}${z}`} r={0.07} h={0.05} pos={[x, 0.07, z]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={12} />),
      )}
    </group>
  );
}

/** NIV-01b + 01c: werkbank met een grote spijker en een halve stoel, en een pop-art schilderij met meetlat. */
export function Werkplaats() {
  const schilderij = useTextuur(
    0.9,
    1.2,
    (ctx, w, h) => {
      // pop-art: felle vlakken, poppetje in geel shirt springt naar de basket
      ctx.fillStyle = '#29b6c8';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f7428a';
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.25, w * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let x = 0; x < w; x += 18) for (let y = 0; y < h; y += 18) ctx.fillRect(x + ((y / 18) % 2) * 9, y, 5, 5);
      // basket
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w * 0.62, h * 0.1, w * 0.3, h * 0.16);
      ctx.strokeStyle = '#e5332a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(w * 0.72, h * 0.3, w * 0.09, h * 0.02, 0, 0, Math.PI * 2);
      ctx.stroke();
      // poppetje
      ctx.fillStyle = '#7a4a2a';
      ctx.beginPath();
      ctx.arc(w * 0.45, h * 0.3, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7d21e';
      ctx.fillRect(w * 0.37, h * 0.36, w * 0.16, h * 0.2);
      ctx.strokeStyle = '#7a4a2a';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.38);
      ctx.lineTo(w * 0.62, h * 0.24);
      ctx.moveTo(w * 0.4, h * 0.56);
      ctx.lineTo(w * 0.33, h * 0.72);
      ctx.moveTo(w * 0.5, h * 0.56);
      ctx.lineTo(w * 0.55, h * 0.74);
      ctx.stroke();
      ctx.fillStyle = '#f08a3a';
      ctx.beginPath();
      ctx.arc(w * 0.66, h * 0.2, w * 0.045, 0, Math.PI * 2);
      ctx.fill();
      // vloer
      ctx.fillStyle = '#f7d21e';
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
    },
    'popart-sprong',
    400,
  );
  return (
    <group>
      {/* achterwand */}
      <Blok size={[2.6, 2.3, 0.1]} pos={[0, 1.15, -0.65]} color="#e6dccb" r={0.03} />
      <Blok size={[2.6, 0.12, 0.14]} pos={[0, 2.31, -0.65]} color="#b98a55" r={0.03} />
      {/* schilderij met lijst */}
      <group position={[-0.65, 1.45, -0.59]}>
        <Blok size={[1.0, 1.3, 0.05]} color="#2f3634" r={0.02} />
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.9, 1.2]} />
          <meshStandardMaterial map={schilderij} roughness={0.6} />
        </mesh>
        <Tekst regels={['sprong']} b={0.36} h={0.1} pos={[0, -0.75, 0.03]} o={{ bg: '#fbf7ee' }} />
      </group>
      {/* meetlat naast het schilderij met de sprong van 105 ... */}
      <group position={[0.02, 0, -0.59]}>
        <Blok size={[0.1, 2.0, 0.03]} pos={[0, 1.15, 0]} color="#f2d04a" r={0.01} />
        {Array.from({ length: 11 }, (_, i) => (
          <Blok key={i} size={[i % 5 ? 0.04 : 0.07, 0.012, 0.035]} pos={[-0.02, 0.25 + i * 0.18, 0.005]} color="#1f2a24" r={0.002} />
        ))}
        <Blok size={[0.26, 0.02, 0.04]} pos={[0.12, 1.5, 0.01]} color="#e5332a" r={0.005} />
        <GetalVak getal="105" b={0.5} h={0.2} pos={[0.42, 1.5, 0.03]} id="O1-NIV-01c" eenheid="cm" />
      </group>
      {/* werkbank */}
      <Blok size={[2.2, 0.1, 0.7]} pos={[0, 0.85, 0]} color="#b98a55" r={0.02} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Blok size={[0.08, 0.8, 0.08]} pos={[s * 1.0, 0.4, -0.28]} color="#8a5a32" r={0.02} />
          <Blok size={[0.08, 0.8, 0.08]} pos={[s * 1.0, 0.4, 0.28]} color="#8a5a32" r={0.02} />
        </group>
      ))}
      <Blok size={[2.0, 0.06, 0.6]} pos={[0, 0.22, 0]} color="#a8723f" r={0.02} />
      {/* grote spijker */}
      <group position={[0.55, 0.92, 0.12]} rotation={[0, 0.5, 0]}>
        <Cil r={0.018} h={0.5} pos={[0, 0.02, 0]} rot={[0, 0, Math.PI / 2]} color="#c9cdd0" seg={10} />
        <Cil r={0.05} h={0.014} pos={[0.25, 0.02, 0]} rot={[0, 0, Math.PI / 2]} color="#b8bdc1" seg={16} />
        <mesh position={[-0.27, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#c9cdd0', { rough: 0.3, metal: 0.6 })}>
          <coneGeometry args={[0.018, 0.05, 10]} />
        </mesh>
      </group>
      {/* doosje spijkers met 30 ... */}
      <group position={[0.25, 0.9, -0.12]}>
        <Blok size={[0.24, 0.1, 0.16]} pos={[0, 0.05, 0]} color="#d8b27a" r={0.01} />
        <GetalVak getal="30" b={0.4} h={0.16} pos={[0, 0.1, 0.1]} rot={[-0.5, 0, 0]} id="O1-NIV-01b" eenheid="mm" />
      </group>
      {/* halve stoel met houtworm */}
      <group position={[-0.55, 0.9, 0.05]}>
        <Blok size={[0.4, 0.04, 0.4]} pos={[0, 0.2, 0]} color="#cf9a5f" r={0.01} />
        {[
          [-0.17, -0.17],
          [0.17, -0.17],
          [-0.17, 0.17],
        ].map(([x, z], i) => (
          <Blok key={i} size={[0.04, 0.2, 0.04]} pos={[x, 0.1, z]} color="#b6773e" r={0.008} />
        ))}
        <Blok size={[0.04, 0.12, 0.04]} pos={[0.17, 0.18, 0.17]} color="#b6773e" r={0.008} />
        <Blok size={[0.04, 0.34, 0.04]} pos={[-0.17, 0.39, -0.17]} color="#b6773e" r={0.008} />
        <Blok size={[0.04, 0.34, 0.04]} pos={[0.17, 0.39, -0.17]} color="#b6773e" r={0.008} />
        <Blok size={[0.38, 0.1, 0.03]} pos={[0, 0.5, -0.17]} color="#cf9a5f" r={0.008} />
        <mesh position={[-0.17, 0.08, 0.2]} material={mat('#f2c6a0')}>
          <sphereGeometry args={[0.018, 8, 6]} />
        </mesh>
      </group>
      {/* hamer */}
      <group position={[-0.05, 0.92, 0.2]} rotation={[0, -0.3, 0]}>
        <Blok size={[0.3, 0.025, 0.03]} color="#8a5a32" r={0.008} />
        <Blok size={[0.04, 0.05, 0.12]} pos={[0.15, 0.01, 0]} color="#4a4f52" r={0.008} />
      </group>
    </group>
  );
}

/** NIV-02: rode hakken op een sokkel met een meetlatje (8 cm), en een poster van Becky (1,75 m). */
export function Hakken() {
  const klaar = useOpgelost('O1-NIV-02');
  const strook = useGroei(klaar, 0.3, 'alle');
  const poster = useTextuur(
    0.8,
    1.3,
    (ctx, w, h) => {
      ctx.fillStyle = '#2aa3a0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${h * 0.085}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('Becky', w / 2, h * 0.1);
      ctx.font = `700 ${h * 0.075}px ${FONT}`;
      ctx.fillText('1,75 m', w / 2, h * 0.19);
      // rok met rode stippen
      ctx.fillStyle = '#fbfaf6';
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.28);
      ctx.lineTo(w * 0.68, h * 0.28);
      ctx.lineTo(w * 0.8, h * 0.55);
      ctx.lineTo(w * 0.2, h * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e5332a';
      const r = seeded(4);
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.arc(w * (0.3 + r() * 0.4), h * (0.31 + r() * 0.22), w * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      // benen en rode hakken
      ctx.fillStyle = '#e9c3a6';
      ctx.fillRect(w * 0.38, h * 0.55, w * 0.08, h * 0.33);
      ctx.fillRect(w * 0.54, h * 0.55, w * 0.08, h * 0.33);
      ctx.fillStyle = '#d42a2a';
      ctx.fillRect(w * 0.34, h * 0.88, w * 0.14, h * 0.035);
      ctx.fillRect(w * 0.52, h * 0.88, w * 0.14, h * 0.035);
      ctx.fillRect(w * 0.36, h * 0.915, w * 0.025, h * 0.05);
      ctx.fillRect(w * 0.54, h * 0.915, w * 0.025, h * 0.05);
    },
    'poster-becky',
    400,
  );
  return (
    <group>
      {/* poster op standaard */}
      <group position={[-0.45, 0, -0.25]}>
        {[-0.38, 0.38].map((x) => (
          <Blok key={x} size={[0.04, 1.95, 0.04]} pos={[x, 0.97, 0]} color="#2f3634" r={0.01} />
        ))}
        <Blok size={[0.86, 1.36, 0.03]} pos={[0, 1.25, -0.02]} color="#2f3634" r={0.01} />
        <mesh position={[0, 1.25, 0.0]}>
          <planeGeometry args={[0.8, 1.3]} />
          <meshStandardMaterial map={poster} roughness={0.6} />
        </mesh>
      </group>
      {/* sokkel met hakken */}
      <group position={[0.4, 0, 0.1]}>
        <Blok size={[0.6, 0.85, 0.5]} pos={[0, 0.425, 0]} color="#f3efe6" r={0.03} />
        <Blok size={[0.66, 0.04, 0.56]} pos={[0, 0.87, 0]} color="#d9d0bf" r={0.01} />
        <group position={[0, 0.89, 0]}>
          <Hak pos={[-0.08, 0, 0.02]} />
          <Hak pos={[0.1, 0, -0.06]} />
          {/* meetlatje van 8 cm naast de hak */}
          <group position={[0.22, 0, 0.12]}>
            <Blok size={[0.03, 0.12, 0.012]} pos={[0, 0.06, 0]} color="#f2d04a" r={0.003} />
            <Blok size={[0.05, 0.004, 0.014]} pos={[0, 0.08, 0.002]} color="#e5332a" r={0.001} />
          </group>
          <Tekst regels={['hak: 8 cm']} b={0.26} h={0.09} pos={[0.12, 0.2, 0.17]} rot={[-0.3, 0, 0]} o={{ bg: '#f2d04a', radius: 0.15 }} />
        </group>
        <Maat van={[0.28, 0.89, 0.25]} naar={[0.28, 0.97, 0.25]} label="8 cm" />
      </group>
      <group ref={strook} position={[-0.45, 0.42, -0.2]}>
        <Tekst regels={['met hakken: 183 cm']} b={0.78} h={0.14} o={{ bg: '#5fe0a1', fg: '#10301f' }} />
      </group>
    </group>
  );
}

/** Eén rode hak (naar +x gericht). Hakhoogte ±8 cm. */
function Hak({ pos }: { pos: V3 }) {
  const rood = mat('#c8242a', { rough: 0.22 });
  return (
    <group position={pos} rotation={[0, -0.35, 0]}>
      {/* zool: voorvoet plat, hiel omhoog */}
      <mesh position={[0.05, 0.012, 0]} material={rood} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.07]} />
      </mesh>
      <mesh position={[-0.04, 0.05, 0]} rotation={[0, 0, -0.75]} material={rood} castShadow>
        <boxGeometry args={[0.12, 0.018, 0.065]} />
      </mesh>
      <mesh position={[-0.095, 0.085, 0]} material={rood}>
        <boxGeometry args={[0.04, 0.016, 0.065]} />
      </mesh>
      {/* naaldhak */}
      <mesh position={[-0.105, 0.04, 0]} material={rood}>
        <cylinderGeometry args={[0.008, 0.005, 0.08, 8]} />
      </mesh>
      {/* neus */}
      <mesh position={[0.06, 0.035, 0]} scale={[1.4, 0.7, 1]} material={rood} castShadow>
        <sphereGeometry args={[0.035, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[-0.09, 0.11, 0]} material={rood}>
        <boxGeometry args={[0.03, 0.05, 0.07]} />
      </mesh>
    </group>
  );
}

/** NIV-03: maquette van de kade naar het station. Het voetpad is dicht; de omweg loopt langs de loodsen. */
export function Omleiding() {
  const kaart = useTextuur(
    2.2,
    1.2,
    (ctx, w, h) => {
      ctx.fillStyle = '#d9cdb6';
      ctx.fillRect(0, 0, w, h);
      // water
      ctx.fillStyle = '#5fb7c9';
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
      // voetpad recht
      ctx.fillStyle = '#efe7d6';
      ctx.fillRect(w * 0.12, h * 0.62, w * 0.76, h * 0.1);
      // omweg (oranje stippellijn) achter de loodsen langs
      ctx.strokeStyle = '#ff8a1e';
      ctx.lineWidth = h * 0.025;
      ctx.setLineDash([h * 0.05, h * 0.035]);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h * 0.66);
      ctx.lineTo(w * 0.36, h * 0.16);
      ctx.lineTo(w * 0.66, h * 0.16);
      ctx.lineTo(w * 0.66, h * 0.66);
      ctx.stroke();
      ctx.setLineDash([]);
      // afgesloten stuk
      ctx.fillStyle = 'rgba(229,51,42,0.35)';
      ctx.fillRect(w * 0.4, h * 0.6, w * 0.22, h * 0.14);
    },
    'omleiding-kaart',
    260,
  );
  const klaar = useOpgelost('O1-NIV-03');
  const bord = useGroei(klaar, 0.4, 'alle');
  return (
    <group>
      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
          <planeGeometry args={[2.2, 1.2]} />
          <meshStandardMaterial map={kaart} roughness={0.9} />
        </mesh>
        {/* werk (links) en station (rechts) */}
        <group position={[-0.95, 0, 0.08]}>
          <Blok size={[0.22, 0.2, 0.2]} pos={[0, 0.1, 0]} color="#e8dcc6" r={0.02} />
          <Blok size={[0.24, 0.03, 0.22]} pos={[0, 0.215, 0]} color={P.dak} r={0.01} />
          <Tekst regels={['werk']} b={0.24} h={0.08} pos={[0, 0.3, 0]} o={{ bg: '#fbf7ee' }} />
        </group>
        <group position={[0.95, 0, 0.08]}>
          <Blok size={[0.24, 0.24, 0.2]} pos={[0, 0.12, 0]} color="#c75a3a" r={0.02} />
          <Blok size={[0.28, 0.03, 0.24]} pos={[0, 0.255, 0]} color={P.dak} r={0.01} />
          <mesh position={[0, 0.17, 0.101]} material={mat('#fbfaf6')}>
            <circleGeometry args={[0.04, 16]} />
          </mesh>
          <Tekst regels={['station']} b={0.28} h={0.08} pos={[0, 0.34, 0]} o={{ bg: '#fbf7ee' }} />
        </group>
        {/* loodsen waar de omweg langs gaat */}
        {[-0.18, 0.2].map((x, i) => (
          <group key={x} position={[x, 0, -0.18]}>
            <Blok size={[0.32, 0.18, 0.26]} pos={[0, 0.09, 0]} color={i ? '#8aa3b3' : '#d9cdb8'} r={0.015} />
            <Blok size={[0.34, 0.025, 0.28]} pos={[0, 0.19, 0]} color="#5b6670" r={0.008} />
          </group>
        ))}
        {/* hekken bij het afgesloten stuk */}
        {[-0.2, 0.25].map((x) => (
          <group key={x} position={[x, 0, 0.13]}>
            <Blok size={[0.02, 0.07, 0.02]} pos={[0, 0.035, -0.06]} color="#ffffff" r={0.004} />
            <Blok size={[0.02, 0.07, 0.02]} pos={[0, 0.035, 0.06]} color="#ffffff" r={0.004} />
            <Blok size={[0.025, 0.03, 0.15]} pos={[0, 0.06, 0]} color="#e5332a" r={0.004} />
          </group>
        ))}
        {/* borden: verbodsbord + geel bord */}
        <group position={[-0.42, 0, 0.42]}>
          <Cil r={0.008} h={0.28} pos={[0, 0.14, 0]} color="#9aa3a8" seg={6} />
          <Verbodsbord pos={[0, 0.3, 0.01]} />
        </group>
        <group position={[-0.62, 0, 0.42]}>
          <Cil r={0.008} h={0.24} pos={[-0.1, 0.12, 0]} color="#9aa3a8" seg={6} />
          <Cil r={0.008} h={0.24} pos={[0.1, 0.12, 0]} color="#9aa3a8" seg={6} />
          <Tekst regels={['Voetpad afgesloten', 'volg →']} b={0.32} h={0.17} pos={[0, 0.28, 0.01]} o={{ bg: '#f7d21e', rand: '#1f2a24', radius: 0.06 }} />
        </group>
        {/* afstandspaaltjes */}
        <Afstand tekst="1200 m" sub="naar het station" pos={[0.62, 0, 0.45]} />
        <Afstand tekst="+ 400 m" sub="omweg" pos={[0.05, 0, -0.42]} kleur="#ff8a1e" />
        {/* meeuw op het dichte pad */}
        <group position={[0.05, 0.03, 0.08]}>
          <mesh scale={[0.06, 0.05, 0.1]} material={mat('#f7f7f2')}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
          <Blok size={[0.03, 0.01, 0.09]} pos={[0, 0.03, -0.02]} color="#9aa3a8" r={0.004} />
        </group>
        {klaar && <Wandelaar />}
        <group ref={bord} position={[0.95, 0, -0.35]}>
          <Cil r={0.01} h={0.4} pos={[0, 0.2, 0]} color="#2f3634" seg={6} />
          <Tekst regels={['totaal: 1,6 km']} b={0.42} h={0.12} pos={[0, 0.42, 0.01]} o={{ bg: '#5fe0a1', fg: '#10301f' }} />
        </group>
      </group>
      <Maat van={[-0.95, 0.07, 0.32]} naar={[0.95, 0.07, 0.32]} label="1200 m" />
    </group>
  );
}

/** Poppetje dat de omweg loopt (verschijnt na het goede antwoord). */
function Wandelaar() {
  const ref = useRef<THREE.Group>(null);
  const route = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-0.95, 0.08],
          [-0.24, 0.08],
          [-0.24, -0.47],
          [0.42, -0.47],
          [0.42, 0.08],
          [0.95, 0.08],
        ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
        false,
        'catmullrom',
        0.05,
      ),
    [],
  );
  useFrame(({ clock }) => {
    const f = (clock.getElapsedTime() * 0.08) % 1;
    const p = route.getPointAt(f);
    const r = route.getTangentAt(f);
    if (ref.current) {
      ref.current.position.set(p.x, Math.abs(Math.sin(f * 90)) * 0.01, p.z);
      ref.current.rotation.y = Math.atan2(r.x, r.z);
    }
  });
  return (
    <group ref={ref}>
      <Poppetje s={0.12} shirt="#ff8a1e" />
    </group>
  );
}

function Verbodsbord({ pos }: { pos: V3 }) {
  const tex = useTextuur(
    0.2,
    0.2,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#d52b1e';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2);
      ctx.fill();
      // loopmannetje
      ctx.strokeStyle = '#1f2a24';
      ctx.fillStyle = '#1f2a24';
      ctx.lineWidth = w * 0.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(w * 0.52, h * 0.3, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.38);
      ctx.lineTo(w * 0.47, h * 0.56);
      ctx.lineTo(w * 0.38, h * 0.72);
      ctx.moveTo(w * 0.47, h * 0.56);
      ctx.lineTo(w * 0.58, h * 0.72);
      ctx.moveTo(w * 0.36, h * 0.48);
      ctx.lineTo(w * 0.5, h * 0.42);
      ctx.lineTo(w * 0.62, h * 0.52);
      ctx.stroke();
    },
    'verbod-voetganger',
    600,
  );
  return (
    <mesh position={pos}>
      <circleGeometry args={[0.1, 24]} />
      <meshStandardMaterial map={tex} transparent roughness={0.6} />
    </mesh>
  );
}

function Afstand({ tekst, sub, pos, kleur = '#1f3c5a' }: { tekst: string; sub: string; pos: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Cil r={0.01} h={0.22} pos={[0, 0.11, 0]} color="#fbfaf6" seg={6} />
      <Tekst regels={[tekst, sub]} b={0.34} h={0.17} pos={[0, 0.28, 0.01]} o={{ bg: '#fbfaf6', fg: kleur, rand: kleur, kop: true, radius: 0.1 }} />
    </group>
  );
}

/* ════════════ klus 2: schenken aan het water (inhoud) ════════════ */

/** Decor bij de kombuis: houten scheepswand met patrijspoort, plank en pannen. */
export function KombuisWand() {
  return (
    <group position={[0, 0, -0.75]}>
      <Blok size={[2.2, 2.2, 0.1]} pos={[0, 1.1, 0]} color="#8a5a32" r={0.03} />
      {Array.from({ length: 7 }, (_, i) => (
        <Blok key={i} size={[2.2, 0.02, 0.11]} pos={[0, 0.3 + i * 0.3, 0]} color="#76492a" r={0.005} />
      ))}
      <mesh position={[0.6, 1.6, 0.06]} material={mat('#c9a04a', { metal: 0.6, rough: 0.35 })}>
        <torusGeometry args={[0.2, 0.05, 10, 24]} />
      </mesh>
      <mesh position={[0.6, 1.6, 0.055]} material={mat('#8fd0e0', { rough: 0.2 })}>
        <circleGeometry args={[0.2, 20]} />
      </mesh>
      <Blok size={[1.0, 0.04, 0.22]} pos={[-0.5, 1.55, 0.12]} color="#b98a55" r={0.01} />
      <Cil r={0.08} h={0.12} pos={[-0.75, 1.63, 0.12]} color="#4a4f52" seg={14} />
      <Cil r={0.06} h={0.18} pos={[-0.45, 1.66, 0.12]} color="#c9a04a" seg={14} />
    </group>
  );
}

/** NIV-04a: pan met dampende aardappelpuree op het fornuis, een pak melk en een briefje "150 ...". */
export function Kombuis() {
  const damp = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    damp.current?.children.forEach((d, i) => {
      const f = (t * 0.4 + i / 3) % 1;
      d.position.y = 0.2 + f * 0.35;
      d.scale.setScalar(0.6 + f * 0.8);
      ((d as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - f);
    });
  });
  const stoom = useMemo(() => [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false })), []);
  return (
    <group>
      {/* fornuis */}
      <Blok size={[1.2, 0.85, 0.6]} pos={[0, 0.425, 0]} color="#e9e3d7" r={0.03} />
      <Blok size={[1.24, 0.04, 0.64]} pos={[0, 0.87, 0]} color="#3b3a39" r={0.01} />
      {[-0.32, 0.32].map((x) => (
        <Cil key={x} r={0.12} h={0.01} pos={[x, 0.895, 0]} color="#2a2928" seg={18} />
      ))}
      <Blok size={[0.8, 0.45, 0.02]} pos={[0, 0.45, 0.31]} color="#cfc7b8" r={0.01} />
      <Blok size={[0.4, 0.03, 0.03]} pos={[0, 0.62, 0.33]} color={P.metaal} r={0.01} />
      {/* pan met puree */}
      <group position={[-0.3, 0.9, 0]}>
        <Cil r={0.17} rTop={0.18} h={0.15} pos={[0, 0.075, 0]} color="#2a2928" seg={22} />
        <Blok size={[0.24, 0.025, 0.04]} pos={[-0.3, 0.12, 0]} color="#2a2928" r={0.01} />
        <mesh position={[0, 0.14, 0]} scale={[1, 0.25, 1]} material={mat('#f2df9a', { flat: true })}>
          <icosahedronGeometry args={[0.165, 1]} />
        </mesh>
        {/* lepel rechtop in de puree */}
        <Blok size={[0.025, 0.3, 0.012]} pos={[0.05, 0.3, 0.02]} rot={[0, 0, 0.12]} color="#cfa36a" r={0.005} />
        <group ref={damp}>
          {stoom.map((m, i) => (
            <mesh key={i} position={[(i - 1) * 0.05, 0.2, 0]} material={m}>
              <sphereGeometry args={[0.04, 8, 6]} />
            </mesh>
          ))}
        </group>
      </group>
      {/* pak melk en stamper */}
      <group position={[0.2, 0.89, -0.05]}>
        <Blok size={[0.1, 0.22, 0.1]} pos={[0, 0.11, 0]} color="#fbfaf6" r={0.01} />
        <mesh position={[0, 0.25, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#4f86b8')}>
          <coneGeometry args={[0.072, 0.06, 4]} />
        </mesh>
        <Tekst regels={['MELK']} b={0.09} h={0.05} pos={[0, 0.13, 0.051]} o={{ bg: '#4f86b8', fg: '#ffffff' }} />
      </group>
      <group position={[0.42, 0.9, 0.05]} rotation={[0, 0, 1.2]}>
        <Cil r={0.015} h={0.26} pos={[0, 0.13, 0]} color="#cfa36a" seg={8} />
        <Blok size={[0.1, 0.012, 0.08]} pos={[0, 0.27, 0]} color={P.metaal} r={0.004} />
      </group>
      {/* briefje bij het pak: 150 ... */}
      <GetalVak getal="150" b={0.42} h={0.16} pos={[0.32, 1.02, 0.2]} rot={[-0.4, 0, 0]} id="O1-NIV-04a" eenheid="ml" />
    </group>
  );
}

/** Parasol (decor bij het havencafé). */
export function Parasol() {
  return (
    <group position={[0.85, 0, -0.55]}>
      <Cil r={0.25} h={0.08} pos={[0, 0.04, 0]} color="#3b4246" seg={14} />
      <Cil r={0.03} h={2.3} pos={[0, 1.15, 0]} color="#e9e3d7" seg={8} />
      <mesh position={[0, 2.3, 0]} castShadow material={mat('#2ec4b6')}>
        <coneGeometry args={[1.25, 0.45, 8, 1, true]} />
      </mesh>
      <mesh position={[0, 2.08, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#fbf7ee')}>
        <torusGeometry args={[1.22, 0.03, 6, 8]} />
      </mesh>
      <Tekst regels={['HAVENCAFÉ']} b={0.9} h={0.2} pos={[0, 2.05, 1.18]} o={{ bg: '#fbf7ee', fg: '#1f3c5a' }} />
    </group>
  );
}

/** NIV-04c: rood dienblad met drie glazen cocktail en een flesje siroop met maatdopje "3 ...". */
export function Cocktail() {
  const rietje = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (rietje.current) rietje.current.rotation.y += dt * 0.8;
  });
  const glas = (x: number, z: number, i: number) => (
    <group key={i} position={[x, 0, z]}>
      <mesh position={[0, 0.08, 0]} material={mat('#f3f7f8', { opacity: 0.35, rough: 0.1 })}>
        <cylinderGeometry args={[0.06, 0.05, 0.16, 16]} />
      </mesh>
      <Cil r={0.046} rTop={0.055} h={0.12} pos={[0, 0.065, 0]} color="#d8344a" seg={16} />
      <group ref={i === 1 ? rietje : undefined}>
        <Cil r={0.007} h={0.24} pos={[0.02, 0.18, 0]} rot={[0, 0, 0.18]} color="#f5a3c7" seg={6} />
      </group>
      <mesh position={[-0.05, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#5fbf5a')}>
        <cylinderGeometry args={[0.035, 0.035, 0.012, 12, 1, false, 0, Math.PI]} />
      </mesh>
    </group>
  );
  return (
    <group>
      {/* bistrotafel */}
      <Cil r={0.42} h={0.04} pos={[0, 0.74, 0]} color="#f3efe6" seg={24} />
      <Cil r={0.04} h={0.72} pos={[0, 0.36, 0]} color="#3b4246" seg={10} />
      <Cil r={0.22} h={0.03} pos={[0, 0.015, 0]} color="#3b4246" seg={16} />
      <group position={[0, 0.76, 0]}>
        {/* geruit kleed */}
        <TafelKleed />
        <Blok size={[0.46, 0.02, 0.3]} pos={[-0.1, 0.012, 0.02]} color="#c8242a" r={0.008} />
        <group position={[-0.1, 0.022, 0.02]}>{[glas(-0.13, -0.05, 0), glas(0.0, 0.06, 1), glas(0.13, -0.05, 2)]}</group>
        {/* flesje aardbeiensiroop met maatdopje */}
        <group position={[0.24, 0, -0.06]}>
          <Cil r={0.045} h={0.18} pos={[0, 0.09, 0]} color="#b3122e" seg={14} />
          <Cil r={0.045} rTop={0.018} h={0.05} pos={[0, 0.205, 0]} color="#b3122e" seg={14} />
          <Tekst regels={['siroop']} b={0.08} h={0.04} pos={[0, 0.1, 0.046]} o={{ bg: '#fbf7ee', fg: '#b3122e' }} />
          <Cil r={0.03} rTop={0.038} h={0.05} pos={[0.12, 0.025, 0.1]} color="#fbfaf6" seg={14} />
        </group>
        <GetalVak getal="3" b={0.3} h={0.14} pos={[0.32, 0.16, 0.2]} rot={[-0.5, -0.2, 0]} id="O1-NIV-04c" eenheid="cl" />
      </group>
    </group>
  );
}

function TafelKleed() {
  const tex = useTextuur(
    0.8,
    0.8,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(79,134,184,0.55)';
      const n = 8;
      for (let i = 0; i < n; i += 2) {
        ctx.fillRect((i * w) / n, 0, w / n, h);
        ctx.fillRect(0, (i * h) / n, w, h / n);
      }
    },
    'kleed-blauw',
    100,
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
      <circleGeometry args={[0.42, 28]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  );
}

/** NIV-04b: blauw-wit opblaaszwembad met drie ringen, twee bankjes en een badeend. Kaartje "750 ...". */
export function Opblaasbad() {
  const eend = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (eend.current) {
      const h = water.current ? water.current.scale.y : 0;
      eend.current.position.set(Math.cos(t * 0.3) * 0.45, 0.08 + h * 0.44 + Math.sin(t * 2) * 0.01, Math.sin(t * 0.3) * 0.3);
      eend.current.rotation.y = -t * 0.3;
    }
  });
  const vol = useOpgelost('O1-NIV-04b');
  const water = useGroei(vol, 0.3);
  const R = 1.0;
  return (
    <group>
      <group scale={[1.1, 1, 1]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.1 + i * 0.19, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat(i % 2 ? '#fbfaf6' : '#3d8fd6', { rough: 0.35 })}>
            <torusGeometry args={[R, 0.1, 12, 40]} />
          </mesh>
        ))}
        <Cil r={R} h={0.03} pos={[0, 0.05, 0]} color="#3d8fd6" seg={36} />
        <group ref={water}>
          <mesh position={[0, 0.25, 0]} material={mat('#7fd0e6', { rough: 0.15, opacity: 0.8 })}>
            <cylinderGeometry args={[R - 0.04, R - 0.04, 0.45, 36]} />
          </mesh>
        </group>
        {/* bankjes met hoofdsteun */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.62, 0.28, 0]} rotation={[0, 0, s * 0.25]}>
            <Blok size={[0.3, 0.3, 0.6]} pos={[0, 0, 0]} color="#fbfaf6" r={0.1} />
            <Blok size={[0.12, 0.18, 0.3]} pos={[s * 0.1, 0.24, 0]} color="#3d8fd6" r={0.06} />
          </group>
        ))}
      </group>
      {/* badeend */}
      <group ref={eend}>
        <mesh scale={[1, 0.8, 1.3]} material={mat('#f7d21e')}>
          <sphereGeometry args={[0.07, 12, 10]} />
        </mesh>
        <mesh position={[0, 0.07, 0.05]} material={mat('#f7d21e')}>
          <sphereGeometry args={[0.045, 12, 10]} />
        </mesh>
        <Blok size={[0.03, 0.015, 0.04]} pos={[0, 0.065, 0.1]} color="#f08a3a" r={0.006} />
      </group>
      {/* kaartje aan de rand + tuinslang */}
      <group position={[0, 0.25, R + 0.18]}>
        <GetalVak getal="750" b={0.5} h={0.2} rot={[-0.15, 0, 0]} id="O1-NIV-04b" eenheid="liter" />
      </group>
      <group position={[1.25, 0, 0.75]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.03 + i * 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#4f9a5a')}>
            <torusGeometry args={[0.2 - i * 0.02, 0.018, 6, 20]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** NIV-05: smoothie met rietje, kan sap, partjes sinaasappel en een krijtbordje. Papegaai op de kraam. */
export function Smoothie() {
  const kop = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (kop.current) kop.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.4) * 0.6;
  });
  return (
    <group>
      <group>
        {/* hoog glas */}
        <group position={[-0.35, 0, 0.1]}>
          <Cil r={0.05} rTop={0.06} h={0.26} pos={[0, 0.13, 0]} color="#fde6c8" seg={16} />
          <Cil r={0.047} rTop={0.056} h={0.22} pos={[0, 0.115, 0]} color="#f5a32a" seg={16} />
          <Cil r={0.008} h={0.22} pos={[0.02, 0.3, 0]} rot={[0, 0, 0.15]} color="#5fbf5a" seg={6} />
          <mesh position={[0.06, 0.26, 0]} rotation={[0, 0, 0.6]} material={mat('#f08a1e')}>
            <torusGeometry args={[0.025, 0.006, 6, 12, Math.PI * 1.5]} />
          </mesh>
        </group>
        {/* kan sap */}
        <group position={[-0.08, 0, -0.1]}>
          <mesh position={[0, 0.12, 0]} material={mat('#eef6f7', { opacity: 0.4, rough: 0.1 })}>
            <cylinderGeometry args={[0.07, 0.08, 0.24, 16]} />
          </mesh>
          <Cil r={0.072} rTop={0.064} h={0.18} pos={[0, 0.09, 0]} color="#f8b43a" seg={16} />
        </group>
        {/* partjes sinaasappel */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.6 + i * 0.07, 0.02, 0.18]} rotation={[0, i * 0.7, Math.PI / 2]} material={mat('#f08a1e')}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 12, 1, false, 0, Math.PI]} />
          </mesh>
        ))}
        {/* krijtbord */}
        <group position={[0.38, 0, -0.12]} rotation={[0, -0.15, 0]}>
          <Blok size={[0.03, 0.4, 0.03]} pos={[0, 0.2, -0.08]} color="#7a5132" r={0.008} />
          <Blok size={[0.78, 0.6, 0.03]} pos={[0, 0.42, -0.04]} rot={[-0.15, 0, 0]} color="#7a5132" r={0.01} />
          <Tekst regels={['4 personen =', '375 ml sinaasappelsap', '12 personen = ? liter']} b={0.72} h={0.54} pos={[0, 0.42, -0.022]} rot={[-0.15, 0, 0]} o={{ bg: '#2f4a3a', fg: '#f4f1e6', groot: 0.6, radius: 0.04 }} />
        </group>
        <SmoothieGlazen />
        {/* papegaai */}
        <group position={[-0.62, 0, -0.18]}>
          <Cil r={0.008} h={0.26} pos={[0, 0.13, 0]} color="#7a5132" seg={6} />
          <Blok size={[0.14, 0.012, 0.012]} pos={[0, 0.26, 0]} color="#7a5132" r={0.004} />
          <group position={[0, 0.27, 0]}>
            <mesh position={[0, 0.06, 0]} scale={[0.8, 1.2, 0.8]} material={mat('#3fae4a')}>
              <sphereGeometry args={[0.05, 10, 8]} />
            </mesh>
            <group ref={kop} position={[0, 0.13, 0]}>
              <mesh material={mat('#e5332a')}>
                <sphereGeometry args={[0.035, 10, 8]} />
              </mesh>
              <mesh position={[0, -0.005, 0.035]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2d04a')}>
                <coneGeometry args={[0.012, 0.03, 6]} />
              </mesh>
            </group>
            <Blok size={[0.03, 0.1, 0.02]} pos={[0, -0.02, -0.04]} rot={[0.4, 0, 0]} color="#2f6fd6" r={0.008} />
          </group>
        </group>
      </group>
    </group>
  );
}

/** Na het goede antwoord schuiven er glazen bij tot er 12 staan. */
function SmoothieGlazen() {
  const klaar = useOpgelost('O1-NIV-05');
  return (
    <group position={[-0.05, 0, 0.2]}>
      {Array.from({ length: 11 }, (_, i) => (
        <SmoothieGlas key={i} i={i} aan={klaar} />
      ))}
    </group>
  );
}

function SmoothieGlas({ i, aan }: { i: number; aan: boolean }) {
  const ref = useGroei(aan, 0.15 * i, 'alle');
  return (
    <group ref={ref} position={[(i % 6) * 0.1 - 0.25, 0, Math.floor(i / 6) * 0.11]}>
      <Cil r={0.03} rTop={0.036} h={0.14} pos={[0, 0.07, 0]} color="#f5a32a" seg={10} />
    </group>
  );
}

/* ════════════ klus 3: wegen in de loods (gewicht) ════════════ */

/** Decor bij de kantine: toonbank met bord "Kantine". */
export function Kantine() {
  return (
    <group position={[0, 0, -0.85]}>
      <Blok size={[2.2, 1.0, 0.5]} pos={[0, 0.5, 0]} color="#e9e3d7" r={0.03} />
      <Blok size={[2.3, 0.05, 0.6]} pos={[0, 1.02, 0]} color="#b98a55" r={0.01} />
      <Blok size={[2.2, 0.06, 0.5]} pos={[0, 2.2, 0]} color="#1f3c5a" r={0.02} />
      {[-1.05, 1.05].map((x) => (
        <Blok key={x} size={[0.06, 1.15, 0.06]} pos={[x, 1.62, 0]} color="#e9e3d7" r={0.02} />
      ))}
      <Tekst regels={['KANTINE']} b={1.0} h={0.24} pos={[0, 2.0, 0.26]} o={{ bg: '#1f3c5a', fg: '#ffffff' }} />
      <Cil r={0.12} h={0.3} pos={[-0.7, 1.2, 0]} color="#9aa3a8" seg={14} />
      <Cil r={0.1} h={0.2} pos={[0.7, 1.15, 0]} color="#d86a4a" seg={14} />
    </group>
  );
}

/** NIV-06: kom rijst met munt en een houten lepel; achter de kom een zak rijst op een weegschaal "200 ...". */
export function Rijstkom() {
  const korrel = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const f = (clock.getElapsedTime() * 0.5) % 1;
    if (korrel.current) korrel.current.position.set(-0.1 + f * 0.28, 0.16 + Math.sin(f * Math.PI) * 0.18, -0.08 - f * 0.12);
  });
  return (
    <group>
      <group>
        {/* kom */}
        <group position={[-0.15, 0, 0.1]}>
          <mesh position={[0, 0.07, 0]} rotation={[Math.PI, 0, 0]} material={mat('#b9bec2')} castShadow>
            <sphereGeometry args={[0.12, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} scale={[1, 0.35, 1]} material={mat('#fbfaf2', { flat: true })}>
            <icosahedronGeometry args={[0.11, 1]} />
          </mesh>
          <mesh position={[0.02, 0.13, 0.01]} rotation={[-Math.PI / 2, 0, 0.5]} material={mat('#4f9a3a')}>
            <circleGeometry args={[0.025, 8]} />
          </mesh>
        </group>
        <group position={[-0.42, 0.01, 0.15]} rotation={[0, 0.3, 0]}>
          <Blok size={[0.22, 0.012, 0.025]} color="#cfa36a" r={0.005} />
          <mesh position={[0.13, 0, 0]} scale={[1.3, 0.3, 1]} material={mat('#cfa36a')}>
            <sphereGeometry args={[0.03, 10, 6]} />
          </mesh>
        </group>
        {/* weegschaal met open zak rijst */}
        <Keukenweegschaal tekst="200" pos={[0.25, 0, -0.1]} />
        <group position={[0.25, 0.072, -0.12]}>
          <Blok size={[0.18, 0.2, 0.1]} pos={[0, 0.1, 0]} color="#f3efe6" r={0.02} />
          <Blok size={[0.16, 0.04, 0.08]} pos={[0, 0.21, 0]} color="#fbfaf2" r={0.02} />
          <Tekst regels={['RIJST']} b={0.14} h={0.05} pos={[0, 0.1, 0.051]} o={{ bg: '#f3efe6', fg: '#b4443a' }} />
        </group>
        <mesh ref={korrel} material={mat('#fbfaf2')}>
          <sphereGeometry args={[0.008, 6, 4]} />
        </mesh>
        {/* het schermpje toont 200 ... → eenheid ontbreekt */}
        <GetalVak getal="200" b={0.42} h={0.16} pos={[0.6, 0.12, 0.05]} rot={[-0.3, -0.6, 0]} id="O1-NIV-06" eenheid="g" />
      </group>
    </group>
  );
}

/** NIV-07: Jan op een glazen personenweegschaal. Groot scherm "99,6 kg" en een briefje "Doel: 86 kg". */
export function Weegschaal() {
  const klaar = useOpgelost('O1-NIV-07');
  const bord = useGroei(klaar, 0.3, 'alle');
  const zeehond = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (zeehond.current) zeehond.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.06;
  });
  return (
    <group>
      {/* personenweegschaal */}
      <Blok size={[0.38, 0.04, 0.38]} pos={[0, 0.02, 0]} color="#bfe4ee" r={0.02} opacity={0.75} />
      <Blok size={[0.12, 0.012, 0.05]} pos={[0, 0.045, 0.13]} color="#17211d" r={0.004} />
      <Poppetje pos={[0, 0.04, -0.02]} s={1.05} shirt="#4f86b8" broek="#3b3a39" />
      {/* groot scherm op een paal */}
      <group position={[0.55, 0, -0.1]}>
        <Cil r={0.03} h={1.5} pos={[0, 0.75, 0]} color="#3b4246" seg={8} />
        <Blok size={[0.6, 0.28, 0.06]} pos={[0, 1.55, 0]} color="#2f3634" r={0.03} />
        <Scherm tekst="99,6 kg" b={0.54} h={0.22} pos={[0, 1.55, 0.032]} />
        <Tekst regels={['weegschaal van Jan']} b={0.6} h={0.09} pos={[0, 1.76, 0]} o={{ bg: '#fbf7ee' }} />
      </group>
      {/* briefje met het doel */}
      <group position={[-0.5, 0, -0.15]}>
        <Cil r={0.02} h={1.2} pos={[0, 0.6, 0]} color="#3b4246" seg={8} />
        <Tekst regels={['Doel:', '86 kg']} b={0.36} h={0.3} pos={[0, 1.3, 0.02]} rot={[0, 0.25, 0]} o={{ bg: '#fff3b0', fg: '#1f2a24', kop: true }} />
      </group>
      <group ref={bord} position={[0, 1.6, 0.05]}>
        <Tekst regels={['Jan: nog 13.600 g', 'Zet hem op!']} b={0.7} h={0.26} o={{ bg: '#5fe0a1', fg: '#10301f', kop: true }} />
      </group>
      {/* zeehond op de weegbrug ernaast */}
      <group position={[0.15, 0, 0.6]}>
        <Blok size={[0.7, 0.05, 0.45]} pos={[0, 0.025, 0]} color="#7d766d" r={0.02} />
        <group ref={zeehond} position={[0, 0.05, 0]}>
          <mesh position={[0, 0.12, 0]} scale={[1.6, 0.8, 0.8]} material={mat('#8d949a')} castShadow>
            <sphereGeometry args={[0.13, 14, 10]} />
          </mesh>
          <mesh position={[0.2, 0.2, 0]} material={mat('#8d949a')}>
            <sphereGeometry args={[0.08, 12, 10]} />
          </mesh>
          <mesh position={[0.27, 0.2, 0]} material={mat('#2a2928')}>
            <sphereGeometry args={[0.015, 6, 4]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Decor bij het magazijn: stelling met dozen. */
export function Magazijn() {
  return (
    <group position={[0, 0, -0.85]}>
      {[-1.0, 1.0].map((x) => (
        <Blok key={x} size={[0.06, 2.1, 0.5]} pos={[x, 1.05, 0]} color="#3f6fa0" r={0.01} />
      ))}
      {[0.35, 1.05, 1.75].map((y, i) => (
        <group key={y}>
          <Blok size={[2.06, 0.05, 0.5]} pos={[0, y, 0]} color="#e8781f" r={0.01} />
          {[-0.6, 0, 0.6].map((x, j) => (
            <Blok key={x} size={[0.45, 0.3 + ((i + j) % 2) * 0.1, 0.4]} pos={[x, y + 0.18 + ((i + j) % 2) * 0.05, 0]} color={(i + j) % 3 ? '#c99a62' : '#b98a55'} r={0.02} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** NIV-08: pak suikerklontjes op een weegschaaltje (1,1 kg), één klontje van 4 g op een schaaltje. */
export function Klontjes() {
  const klaar = useOpgelost('O1-NIV-08');
  const mier = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mier.current) {
      mier.current.position.set(0.15 + Math.cos(t * 0.25) * 0.2, 0, 0.18 + Math.sin(t * 0.25) * 0.06);
      mier.current.rotation.y = -t * 0.25;
    }
  });
  const pak = useTextuur(
    0.24,
    0.3,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#2aa39a');
      g.addColorStop(1, '#1f6f8a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = `700 ${h * 0.11}px ${FONT}`;
      ctx.fillText('Suiker', w / 2, h * 0.17);
      ctx.fillText('klontjes', w / 2, h * 0.3);
      // kopje met klontjes
      ctx.fillStyle = '#fbfaf6';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.58, w * 0.2, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(w * 0.3, h * 0.5, w * 0.4, h * 0.08);
      for (let i = 0; i < 3; i++) ctx.fillRect(w * (0.36 + i * 0.1), h * 0.42, w * 0.08, w * 0.08);
    },
    'pak-klontjes',
    500,
  );
  return (
    <group>
      <group>
        <Keukenweegschaal tekst="1,1 kg" pos={[-0.15, 0, -0.02]} />
        <group position={[-0.15, 0.072, -0.04]}>
          <Blok size={[0.24, 0.3, 0.12]} pos={[0, 0.15, 0]} color="#2aa39a" r={0.01} />
          <mesh position={[0, 0.15, 0.061]}>
            <planeGeometry args={[0.24, 0.3]} />
            <meshStandardMaterial map={pak} roughness={0.6} />
          </mesh>
        </group>
        <Tekst regels={['het pak: 1,1 kg']} b={0.36} h={0.09} pos={[-0.15, 0.14, 0.18]} rot={[-0.5, 0, 0]} o={{ bg: '#fbf7ee', rand: '#2aa39a' }} />
        {/* schaaltje met één klontje */}
        <group position={[0.3, 0, 0.05]}>
          <Cil r={0.07} rTop={0.09} h={0.03} pos={[0, 0.015, 0]} color="#fbfaf6" seg={16} />
          <Blok size={[0.03, 0.03, 0.03]} pos={[0, 0.045, 0]} color="#ffffff" r={0.004} />
          <Tekst regels={['1 klontje = 4 g']} b={0.32} h={0.08} pos={[0, 0.12, 0.05]} rot={[-0.4, 0, 0]} o={{ bg: '#fbf7ee', rand: '#2aa39a' }} />
        </group>
        <KlontjesRijen aan={klaar} />
        {/* mier met een klontje */}
        <group ref={mier}>
          <Blok size={[0.012, 0.008, 0.03]} pos={[0, 0.006, 0]} color="#2a2928" r={0.003} />
          <Blok size={[0.016, 0.016, 0.016]} pos={[0, 0.02, 0]} color="#ffffff" r={0.002} />
        </group>
      </group>
    </group>
  );
}

/** 275 klontjes (25 rijtjes van 11) op een blad: verschijnen na het goede antwoord. */
function KlontjesRijen({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 275; i++) {
      o.position.set(-0.24 + (i % 25) * 0.02, 0.02, -0.1 + Math.floor(i / 25) * 0.02);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group ref={ref} position={[-0.12, 0, 0.235]}>
      <Blok size={[0.54, 0.012, 0.26]} pos={[0, 0.006, 0]} color="#c9a372" r={0.003} />
      <instancedMesh ref={mesh} args={[undefined, undefined, 275]}>
        <boxGeometry args={[0.016, 0.016, 0.016]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </instancedMesh>
    </group>
  );
}
