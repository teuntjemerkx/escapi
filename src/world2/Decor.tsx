// Vaste omgevingsstukken van Wereld 2 die ook als echt object in de wijk staan.
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Blok, Boom, Cil, Haag, mat, Struik } from '../game/kit';
import { P } from '../game/palette';

type V3 = [number, number, number];

/** De tuin van Frank (werkboek: 6 × 6 m, vierkante vijver van 15 dm, 4 bomen, 2 struiken, 2 vissen). */
export function TuinFrank({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[6, 0.06, 6]} pos={[0, 0.03, 0]} color={P.grasDonker} r={0.02} shadow={false} />
      {/* lage haag rondom, met opening aan de voorkant */}
      <Haag size={[6.4, 0.55, 0.3]} pos={[0, 0, -3.15]} />
      <Haag size={[0.3, 0.55, 6.4]} pos={[-3.15, 0, 0]} />
      <Haag size={[0.3, 0.55, 6.4]} pos={[3.15, 0, 0]} />
      <Haag size={[2.4, 0.55, 0.3]} pos={[-2.0, 0, 3.15]} />
      <Haag size={[2.4, 0.55, 0.3]} pos={[2.0, 0, 3.15]} />
      <Boom pos={[-2.2, 0, -2.2]} s={0.75} soort="bol" />
      <Boom pos={[2.2, 0, -2.2]} s={0.75} soort="bol" />
      <Boom pos={[-2.2, 0, 2.1]} s={0.75} soort="bol" />
      <Boom pos={[2.2, 0, 2.1]} s={0.75} soort="bol" />
      <Struik pos={[-1.4, 0, -1.5]} s={0.8} />
      <Struik pos={[-1.2, 0, 2.3]} s={0.8} />
      <Vijver pos={[0, 0, 0]} zijde={1.5} />
    </group>
  );
}

export function Vijver({ pos, zijde }: { pos: V3; zijde: number }) {
  const vis1 = useRef<THREE.Group>(null);
  const vis2 = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const r = zijde * 0.25;
    if (vis1.current) {
      vis1.current.position.set(Math.cos(t * 0.8) * r, 0.1, Math.sin(t * 0.8) * r);
      vis1.current.rotation.y = -t * 0.8;
    }
    if (vis2.current) {
      vis2.current.position.set(Math.cos(-t * 0.6 + 2) * r * 0.7, 0.1, Math.sin(-t * 0.6 + 2) * r * 0.7);
      vis2.current.rotation.y = t * 0.6 + Math.PI;
    }
  });
  const rand = 0.18;
  return (
    <group position={pos}>
      <Blok size={[zijde + rand * 2, 0.16, rand]} pos={[0, 0.08, -(zijde + rand) / 2]} color={P.steen} r={0.05} />
      <Blok size={[zijde + rand * 2, 0.16, rand]} pos={[0, 0.08, (zijde + rand) / 2]} color={P.steen} r={0.05} />
      <Blok size={[rand, 0.16, zijde]} pos={[-(zijde + rand) / 2, 0.08, 0]} color={P.steen} r={0.05} />
      <Blok size={[rand, 0.16, zijde]} pos={[(zijde + rand) / 2, 0.08, 0]} color={P.steen} r={0.05} />
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.water, { rough: 0.2 })} receiveShadow>
        <planeGeometry args={[zijde, zijde]} />
      </mesh>
      <group ref={vis1}>
        <Vis />
      </group>
      <group ref={vis2}>
        <Vis />
      </group>
    </group>
  );
}

function Vis() {
  return (
    <group scale={0.55}>
      <Blok size={[0.12, 0.1, 0.32]} color={P.oranje} r={0.05} shadow={false} />
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={mat(P.oranje)}>
        <coneGeometry args={[0.08, 0.14, 4]} />
      </mesh>
    </group>
  );
}

/** Buurtzwembad (werkboek: 24 × 12 m, 3 m diep, links een verhoogde bodem van 12 × 12 × 0,5 m). */
export function Zwembad({ pos }: { pos: V3 }) {
  const L = 24;
  const B = 12;
  return (
    <group position={pos}>
      <Blok size={[L + 1.2, 0.3, 0.6]} pos={[0, 0.15, -(B + 0.6) / 2]} color={P.wit} r={0.06} />
      <Blok size={[L + 1.2, 0.3, 0.6]} pos={[0, 0.15, (B + 0.6) / 2]} color={P.wit} r={0.06} />
      <Blok size={[0.6, 0.3, B]} pos={[-(L + 0.6) / 2, 0.15, 0]} color={P.wit} r={0.06} />
      <Blok size={[0.6, 0.3, B]} pos={[(L + 0.6) / 2, 0.15, 0]} color={P.wit} r={0.06} />
      {/* ondiep deel (verhoogde bodem) en diep deel */}
      <mesh position={[-L / 4, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#86d0dc', { rough: 0.15 })} receiveShadow>
        <planeGeometry args={[L / 2, B]} />
      </mesh>
      <mesh position={[L / 4, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.waterDiep, { rough: 0.15 })} receiveShadow>
        <planeGeometry args={[L / 2, B]} />
      </mesh>
      {/* banen-lijnen */}
      {[-3, 0, 3].map((z) => (
        <mesh key={z} position={[0, 0.13, z]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#e9f6f7', { rough: 0.3 })}>
          <planeGeometry args={[L - 1, 0.12]} />
        </mesh>
      ))}
      {/* trapje en duikplank */}
      <Blok size={[0.1, 1.0, 0.1]} pos={[L / 2 - 0.4, 0.5, -B / 2 + 0.1]} color={P.metaal} r={0.03} />
      <Blok size={[0.1, 1.0, 0.1]} pos={[L / 2 - 1.0, 0.5, -B / 2 + 0.1]} color={P.metaal} r={0.03} />
      <Blok size={[0.5, 0.5, 2.6]} pos={[L / 2 + 0.6, 0.25, 2.5]} color={P.blauw} r={0.08} />
      <Blok size={[0.45, 0.08, 2.4]} pos={[L / 2 - 0.4, 0.55, 2.5]} color={P.wit} r={0.03} />
    </group>
  );
}

/** Spoor langs de rand + goederenwagon met ijzererts (werkboek: bak 8 × 2,5 × 2,5 m). */
export function Spoor({ x, lengte }: { x: number; lengte: number }) {
  const n = Math.floor(lengte / 1.2);
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <Blok key={i} size={[2.4, 0.12, 0.35]} pos={[0, 0.06, -lengte / 2 + 0.6 + i * 1.2]} color={P.hout} r={0.03} shadow={false} />
      ))}
      <Blok size={[0.12, 0.14, lengte]} pos={[-0.72, 0.18, 0]} color={P.metaal} r={0.03} shadow={false} />
      <Blok size={[0.12, 0.14, lengte]} pos={[0.72, 0.18, 0]} color={P.metaal} r={0.03} shadow={false} />
    </group>
  );
}

export function Goederenwagon({ pos }: { pos: V3 }) {
  const stenen = Array.from({ length: 34 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const rr = ((i % 7) / 7) * 0.9;
    return [Math.cos(a) * rr * 1.1, 0.15 + (i % 3) * 0.12, ((i / 34) * 2 - 1) * 3.6] as V3;
  });
  return (
    <group position={pos}>
      {[-2.6, 2.6].map((z) =>
        [-0.72, 0.72].map((x) => <Cil key={`${x}${z}`} r={0.45} h={0.2} pos={[x, 0.5, z]} rot={[0, 0, Math.PI / 2]} color="#3b3a39" />),
      )}
      <Blok size={[2.2, 0.35, 8.6]} pos={[0, 0.85, 0]} color="#3b3a39" r={0.06} />
      <group position={[0, 1.0, 0]}>
        <Blok size={[2.5, 1.6, 8]} pos={[0, 0.8, 0]} color="#5f6d5d" r={0.08} />
        {Array.from({ length: 7 }, (_, i) => (
          <Blok key={i} size={[2.56, 1.5, 0.08]} pos={[0, 0.8, -3.4 + i * 1.13]} color="#56634f" r={0.02} />
        ))}
        {stenen.map((p, i) => (
          <mesh key={i} position={[p[0], 1.6 + p[1], p[2]]} material={mat('#3a3d42', { rough: 1 })} castShadow>
            <icosahedronGeometry args={[0.32 + (i % 4) * 0.06, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Eindpoort van de wereld: twee pilaren met houten deuren. */
export function Poort({ pos, open = 0 }: { pos: V3; open?: number }) {
  return (
    <group position={pos}>
      <Blok size={[1.4, 5.2, 1.4]} pos={[-3.4, 2.6, 0]} color={P.muur2} r={0.15} />
      <Blok size={[1.4, 5.2, 1.4]} pos={[3.4, 2.6, 0]} color={P.muur2} r={0.15} />
      <Blok size={[8.4, 0.9, 1.6]} pos={[0, 5.5, 0]} color={P.dak} r={0.15} />
      <Blok size={[8.8, 0.25, 1.8]} pos={[0, 6.05, 0]} color={P.dakRand} r={0.08} />
      <group position={[-2.7, 0, 0]} rotation={[0, -open * 1.6, 0]}>
        <Blok size={[2.7, 4.4, 0.3]} pos={[1.35, 2.2, 0]} color={P.hout} r={0.08} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[1.35, 1.2, 0]} color={P.houtLicht} r={0.04} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[1.35, 3.2, 0]} color={P.houtLicht} r={0.04} />
      </group>
      <group position={[2.7, 0, 0]} rotation={[0, open * 1.6, 0]}>
        <Blok size={[2.7, 4.4, 0.3]} pos={[-1.35, 2.2, 0]} color={P.hout} r={0.08} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[-1.35, 1.2, 0]} color={P.houtLicht} r={0.04} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[-1.35, 3.2, 0]} color={P.houtLicht} r={0.04} />
      </group>
    </group>
  );
}
