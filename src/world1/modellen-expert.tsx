// 3D-objecten voor de keuzestations: rekenkaart, kabel, cement, zandbak, champagne, bag-in-box,
// autorit, weerstation, buitenmissie en de 24-kaarten.
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel, useInspectie } from '../game/inspectie';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { P } from '../game/palette';
import { useSpel } from '../game/store';
import { FONT, rondRect, useTextuur } from '../game/tekst';
import { Poppetje, Scherm, Tekst } from './bouw';
import { KLEUR, RIJEN, stippel, tekenBord, tekenRij, type RijNaam } from './rekenkaart';

type V3 = [number, number, number];

/* ───────────── rekenkaart ───────────── */

const TITEL: Record<string, string> = {
  lengte: 'Rekenkaart: lengte',
  oppervlakte: 'Rekenkaart: oppervlakte',
  inhoud: 'Rekenkaart: inhoud',
  gemixt: 'Rekenkaart: inhoud en liter',
  gewicht: 'Rekenkaart: gewicht',
};

/** Lessenaar met één rij van de rekenkaart (bij "gemixt": inhoud + liter met roze stippellijnen). */
export function KaartBord({ rij }: { rij: 'lengte' | 'oppervlakte' | 'inhoud' | 'gemixt' | 'gewicht' }) {
  const dubbel = rij === 'gemixt';
  const B = 2.7;
  const H = dubbel ? 2.2 : 1.25;
  const kantel = 0.6;
  const tex = useTextuur(
    B,
    H,
    (ctx, w, h) => {
      tekenBord(ctx, w, h);
      ctx.fillStyle = KLEUR.inkt;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const kop = dubbel ? h * 0.06 : h * 0.1;
      ctx.font = `700 ${kop}px ${FONT}`;
      ctx.fillText(TITEL[rij], w * 0.04, dubbel ? h * 0.06 : h * 0.12);
      const x = w * 0.04;
      const bw = w * 0.92;
      if (!dubbel) {
        tekenRij(ctx, RIJEN[rij as RijNaam], x, h * 0.24, bw, h * 0.72);
      } else {
        const a = tekenRij(ctx, RIJEN.inhoud, x, h * 0.12, bw, h * 0.36);
        const b = tekenRij(ctx, RIJEN.liter, x, h * 0.6, bw, h * 0.36);
        const d = h * 0.009;
        const y1 = a.onder + h * 0.105;
        const y2 = b.boven - h * 0.085;
        stippel(ctx, a.middens[3], y1, b.middens[0], y2, d);
        stippel(ctx, a.middens[4], y1, b.middens[3], y2, d);
        stippel(ctx, a.middens[5], y1, b.middens[6], y2, d);
      }
    },
    `kaartbord2-${rij}`,
    450,
  );
  const hoog = H * Math.cos(kantel);
  const y = 0.55 + hoog / 2;
  return (
    <group>
      {/* poten en voetbalk */}
      {[-1.15, 1.15].map((x) => (
        <group key={x}>
          <Blok size={[0.08, y + 0.1, 0.08]} pos={[x, (y + 0.1) / 2, -0.12]} color="#2f3b44" r={0.02} />
          <Blok size={[0.1, 0.06, 0.7]} pos={[x, 0.03, -0.1]} color="#2f3b44" r={0.02} />
        </group>
      ))}
      <group position={[0, y, 0]} rotation={[-kantel, 0, 0]}>
        <Blok size={[B + 0.1, H + 0.1, 0.06]} pos={[0, 0, -0.04]} color="#2f3b44" r={0.03} />
        <mesh>
          <planeGeometry args={[B, H]} />
          <meshStandardMaterial map={tex} roughness={0.45} />
        </mesh>
        <Blok size={[B + 0.1, 0.06, 0.08]} pos={[0, -H / 2 - 0.02, 0.03]} color="#2f3b44" r={0.02} />
        <Fiche B={B} y={dubbel ? H / 2 - 0.12 * H - 0.36 * H * 0.32 + 0.05 : H / 2 - 0.24 * H - 0.72 * H * 0.32 + 0.05} />
        <Meeuw pos={[-0.95, H / 2 + 0.03, -0.04]} />
      </group>
    </group>
  );
}

/** Oranje fiche dat in de inspectie van tegel naar tegel springt (over de bovenste rij). */
function Fiche({ B, y }: { B: number; y: number }) {
  const ctx = useInspectie();
  const ref = useRef<THREE.Group>(null);
  const tb = (B * 0.92 * 0.87) / 7;
  const x0 = -B / 2 + B * 0.04 + tb / 2;
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = ctx.delen;
    if (!ctx.delen) return;
    const t = clock.getElapsedTime() * 1.2;
    const i = Math.floor(t) % 7;
    const f = t % 1;
    const sprong = i < 6 && f > 0.5 ? (f - 0.5) * 2 : 0;
    g.position.set(x0 + (i + sprong) * tb, y, 0.03 + Math.sin(sprong * Math.PI) * 0.12);
  });
  return (
    <group ref={ref} visible={false}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#f08a1e', { emissive: '#f08a1e' })}>
        <cylinderGeometry args={[0.06, 0.06, 0.025, 20]} />
      </mesh>
    </group>
  );
}

function Meeuw({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.07, 0]} scale={[0.07, 0.06, 0.13]} material={mat('#f7f7f2')}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.13, 0.08]} material={mat('#f7f7f2')}>
        <sphereGeometry args={[0.045, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2c24a')}>
        <coneGeometry args={[0.012, 0.05, 6]} />
      </mesh>
      <Blok size={[0.16, 0.02, 0.1]} pos={[0, 0.1, -0.02]} color="#9aa3a8" r={0.008} />
      <Cil r={0.006} h={0.04} pos={[-0.02, 0.01, 0]} color="#f2a03a" seg={4} />
      <Cil r={0.006} h={0.04} pos={[0.02, 0.01, 0]} color="#f2a03a" seg={4} />
    </group>
  );
}

/* ───────────── kabel, cement, zandbak ───────────── */

/** EXP-06: kabelhaspel met gele kabel (2,5 km). Losse stukken van 25 m liggen op een pallet. */
export function Kabelhaspel() {
  const kat = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (kat.current) kat.current.rotation.y = 0.6 + Math.sin(clock.getElapsedTime() * 1.6) * 0.25;
  });
  const R = 0.75;
  return (
    <group>
      {/* haspel staat rechtop, as langs x */}
      <group position={[-0.35, R, 0]}>
        {[-0.42, 0.42].map((x) => (
          <group key={x}>
            <Cil r={R} h={0.06} pos={[x, 0, 0]} rot={[0, 0, Math.PI / 2]} color="#4a4f52" seg={32} />
            {x > 0 && <Tekst regels={['2,5 km', 'kabel']} b={0.62} h={0.4} pos={[x + 0.032, 0.05, 0]} rot={[0, Math.PI / 2, 0]} o={{ bg: '#f2d04a', fg: '#1f2a24', kop: true, radius: 0.2 }} />}
          </group>
        ))}
        <Cil r={0.52} h={0.78} rot={[0, 0, Math.PI / 2]} color="#f2c21e" seg={28} />
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-0.33 + i * 0.13, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mat('#e6b414')}>
            <torusGeometry args={[0.52, 0.025, 6, 28]} />
          </mesh>
        ))}
        {/* los eind van de kabel */}
        <Cil r={0.025} h={0.9} pos={[0.1, -0.45, 0.6]} rot={[Math.PI / 2 - 0.3, 0, 0.2]} color="#f2c21e" seg={8} />
      </group>
      {/* pallet met afgeknipte rolletjes van 25 m */}
      <group position={[0.85, 0, 0.15]}>
        <Blok size={[0.8, 0.12, 0.6]} pos={[0, 0.06, 0]} color={P.houtLicht} r={0.02} />
        {[
          [-0.2, -0.12],
          [0.2, -0.12],
          [-0.2, 0.15],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.18, z]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2c21e')}>
            <torusGeometry args={[0.13, 0.05, 8, 20]} />
          </mesh>
        ))}
        <Tekst regels={['1 stuk = 25 m']} b={0.56} h={0.15} pos={[0, 0.42, 0.25]} rot={[-0.3, 0, 0]} o={{ bg: '#fbf7ee', rand: '#e6b414' }} />
        <Cil r={0.008} h={0.3} pos={[0, 0.25, 0.25]} color="#9aa3a8" seg={6} />
      </group>
      {/* grote schaar */}
      <group position={[0.35, 0.02, 0.55]} rotation={[0, 0.4, 0]}>
        <Blok size={[0.4, 0.02, 0.05]} pos={[0.15, 0, 0]} rot={[0, 0.15, 0]} color={P.metaal} r={0.008} />
        <Blok size={[0.4, 0.02, 0.05]} pos={[0.15, 0.015, 0]} rot={[0, -0.15, 0]} color={P.metaal} r={0.008} />
        <mesh position={[-0.08, 0.01, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={mat('#e5332a')}>
          <torusGeometry args={[0.06, 0.02, 6, 14]} />
        </mesh>
        <mesh position={[-0.08, 0.01, -0.06]} rotation={[Math.PI / 2, 0, 0]} material={mat('#e5332a')}>
          <torusGeometry args={[0.06, 0.02, 6, 14]} />
        </mesh>
      </group>
      {/* kat die met de kabel speelt */}
      <group ref={kat} position={[-0.25, 0, 0.9]}>
        <mesh position={[0, 0.12, 0]} scale={[0.7, 0.6, 1.2]} material={mat('#e48a3a')}>
          <sphereGeometry args={[0.12, 12, 10]} />
        </mesh>
        <mesh position={[0, 0.22, 0.13]} material={mat('#e48a3a')}>
          <sphereGeometry args={[0.07, 12, 10]} />
        </mesh>
        {[-0.035, 0.035].map((x) => (
          <mesh key={x} position={[x, 0.29, 0.13]} material={mat('#e48a3a')}>
            <coneGeometry args={[0.02, 0.05, 4]} />
          </mesh>
        ))}
        <Cil r={0.012} h={0.2} pos={[0, 0.2, -0.17]} rot={[0.9, 0, 0]} color="#e48a3a" seg={6} />
      </group>
    </group>
  );
}

/** Cementzak-textuur: "CEMENT – 30 kg". */
function useZak() {
  return useTextuur(
    0.5,
    0.3,
    (ctx, w, h) => {
      ctx.fillStyle = '#e4d8bd';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c4302b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${h * 0.36}px ${FONT}`;
      ctx.fillText('CEMENT', w / 2, h * 0.38);
      ctx.font = `700 ${h * 0.26}px ${FONT}`;
      ctx.fillText('30 kg', w / 2, h * 0.74);
    },
    'zak-cement',
    400,
  );
}

/** EXP-07a/b: heftruck met een pallet cementzakken (30 kg per zak) en een bord met de levering. */
export function Cement() {
  const zak = useZak();
  const zakGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.14, 0.3), []);
  const zakMat = useMemo(() => new THREE.MeshStandardMaterial({ map: zak, roughness: 0.9 }), [zak]);
  const stapel = (lagen: number) => {
    const out: { p: V3; r: number }[] = [];
    for (let l = 0; l < lagen; l++)
      for (let i = 0; i < 4; i++) {
        const y = 0.2 + l * 0.15;
        if (l % 2 === 0) out.push({ p: [i % 2 ? 0.25 : -0.25, y, Math.floor(i / 2) ? 0.15 : -0.15], r: 0 });
        else out.push({ p: [i % 2 ? 0.15 : -0.15, y, Math.floor(i / 2) ? 0.2 : -0.2], r: Math.PI / 2 });
      }
    return out;
  };
  const pallet = (lagen: number) => (
    <group>
      <Blok size={[1.0, 0.13, 0.8]} pos={[0, 0.065, 0]} color={P.houtLicht} r={0.02} />
      {stapel(lagen).map((z, i) => (
        <mesh key={i} geometry={zakGeo} material={zakMat} position={z.p} rotation={[0, z.r, 0]} castShadow receiveShadow />
      ))}
    </group>
  );
  return (
    <group>
      {/* heftruck met een volle pallet */}
      <group position={[-0.55, 0, 0]}>
        <Blok size={[0.9, 0.5, 0.8]} pos={[-0.35, 0.4, 0]} color="#e6b43a" r={0.08} />
        <Blok size={[0.5, 0.06, 0.7]} pos={[-0.3, 1.25, 0]} color="#3b3a39" r={0.02} />
        {[-0.3, 0.3].map((z) => (
          <Blok key={z} size={[0.05, 0.85, 0.05]} pos={[-0.55, 0.85, z]} color="#3b3a39" r={0.01} />
        ))}
        <Blok size={[0.32, 0.12, 0.3]} pos={[-0.3, 0.72, 0]} color="#2f3634" r={0.04} />
        <Blok size={[0.08, 1.4, 0.6]} pos={[0.12, 0.7, 0]} color="#4a4f52" r={0.02} />
        {[-0.18, 0.18].map((z) => (
          <Blok key={z} size={[0.7, 0.04, 0.08]} pos={[0.5, 0.36, z]} color="#4a4f52" r={0.01} />
        ))}
        {[-0.65, 0.0].map((x) =>
          [-0.4, 0.4].map((z) => <Cil key={`${x}${z}`} r={0.16} h={0.12} pos={[x, 0.16, z]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={14} />),
        )}
        <group position={[0.62, 0.36, 0]}>{pallet(3)}</group>
        {/* stofwolkje */}
        <mesh position={[0.9, 1.0, 0.3]} material={mat('#c9c4bb', { opacity: 0.6 })}>
          <icosahedronGeometry args={[0.12, 1]} />
        </mesh>
      </group>
      {/* lege pallet met 48 plekken afgetekend */}
      <group position={[1.05, 0, 0.35]}>
        <Blok size={[1.0, 0.13, 0.8]} pos={[0, 0.065, 0]} color={P.houtLicht} r={0.02} />
        <Tekst regels={['1 pallet = 48 zakken']} b={0.9} h={0.18} pos={[0, 0.135, 0]} rot={[-Math.PI / 2, 0, 0]} o={{ bg: '#fbf7ee', rand: '#c4302b' }} />
      </group>
      {/* bord met de levering */}
      <group position={[1.05, 0, -0.5]}>
        {[-0.45, 0.45].map((x) => (
          <Blok key={x} size={[0.05, 1.5, 0.05]} pos={[x, 0.75, 0]} color="#2f3634" r={0.01} />
        ))}
        <Tekst regels={['Levering: 1860 kg', '1 zak = 30 kg']} b={1.0} h={0.46} pos={[0, 1.3, 0.03]} o={{ bg: '#fbf7ee', fg: '#1f2a24', rand: '#2f3634', kop: true }} />
      </group>
    </group>
  );
}

/** EXP-08: zeshoekige zandbak met zandkasteel; zakken speelzand van 17 liter; bordje "nodig: 0,5 m³". */
export function Zandbak() {
  const zeshoek = useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [-1.1, 0],
      [-0.6, 0.62],
      [0.6, 0.62],
      [1.1, 0],
      [0.6, -0.62],
      [-0.6, -0.62],
    ];
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    return s;
  }, []);
  const binnen = useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [-0.98, 0],
      [-0.53, 0.52],
      [0.53, 0.52],
      [0.98, 0],
      [0.53, -0.52],
      [-0.53, -0.52],
    ];
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    return s;
  }, []);
  const rand = useMemo(() => {
    const s = zeshoek.clone();
    s.holes = [new THREE.Path(binnen.getPoints())];
    return s;
  }, [zeshoek, binnen]);
  const hoeken: [number, number][] = [
    [-1.1, 0],
    [-0.6, 0.62],
    [0.6, 0.62],
    [1.1, 0],
    [0.6, -0.62],
    [-0.6, -0.62],
  ];
  return (
    <group position={[-0.25, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow material={mat('#e2c08c')}>
        <extrudeGeometry args={[rand, { depth: 0.3, bevelEnabled: false }]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]} material={mat('#efd9a2', { rough: 1 })} receiveShadow>
        <shapeGeometry args={[binnen]} />
      </mesh>
      {hoeken.map(([x, z], i) => (
        <Cil key={i} r={0.07} h={0.36} pos={[x, 0.18, -z]} color="#2f5d3a" seg={8} />
      ))}
      {/* zandkasteel met krab */}
      <group position={[0.2, 0.22, -0.1]}>
        <Cil r={0.18} rTop={0.14} h={0.16} pos={[0, 0.08, 0]} color="#e2c48a" seg={10} />
        <Cil r={0.1} rTop={0.08} h={0.12} pos={[0, 0.22, 0]} color="#e2c48a" seg={10} />
        <mesh position={[0, 0.32, 0]} material={mat('#e2c48a')}>
          <coneGeometry args={[0.07, 0.1, 8]} />
        </mesh>
        <mesh position={[0.15, 0.04, 0.12]} scale={[1.3, 0.6, 1]} material={mat('#e5532a')}>
          <sphereGeometry args={[0.04, 10, 8]} />
        </mesh>
      </group>
      {/* emmertje en schepje */}
      <Cil r={0.07} rTop={0.09} h={0.14} pos={[-0.5, 0.29, 0.15]} color="#3d8fd6" seg={12} />
      <Blok size={[0.04, 0.02, 0.2]} pos={[-0.3, 0.24, 0.3]} rot={[0, 0.6, 0]} color="#e5332a" r={0.008} />
      {/* bordje */}
      <group position={[-0.95, 0, 0.75]}>
        <Cil r={0.02} h={0.8} pos={[0, 0.4, 0]} color="#7a5132" seg={6} />
        <Tekst regels={['nodig: 0,5 m³', 'speelzand']} b={0.72} h={0.38} pos={[0, 0.9, 0.02]} o={{ bg: '#fbf7ee', fg: '#1f2a24', rand: '#2f5d3a', kop: true }} />
      </group>
      {/* stapel zakken speelzand */}
      <group position={[1.45, 0, 0.2]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[(i % 2) * 0.06, 0.08 + i * 0.16, 0]} rotation={[0, i * 0.15, 0]}>
            <Blok size={[0.5, 0.15, 0.36]} color="#f2d04a" r={0.06} />
          </group>
        ))}
        <Cil r={0.012} h={0.5} pos={[0.05, 0.25, 0.36]} color="#7a5132" seg={6} />
        <Tekst regels={['1 zak speelzand', '17 liter']} b={0.6} h={0.32} pos={[0.05, 0.55, 0.37]} o={{ bg: '#f2d04a', fg: '#1f2a24', rand: '#b98a1e', kop: true }} />
      </group>
    </group>
  );
}

/* ───────────── champagne, bag-in-box ───────────── */

/** EXP-09: champagnetoren van coupeglazen op een feesttafel, met een spandoek. */
export function Champagne() {
  const plekken = useMemo(() => {
    const out: V3[] = [];
    const lagen = [4, 3, 2, 1];
    lagen.forEach((n, l) => {
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) out.push([(i - (n - 1) / 2) * 0.13, l * 0.12, (j - (n - 1) / 2) * 0.13]);
    });
    return out;
  }, []);
  const kom = useRef<THREE.InstancedMesh>(null);
  const voet = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    plekken.forEach((p, i) => {
      o.position.set(p[0], p[1] + 0.1, p[2]);
      o.updateMatrix();
      kom.current?.setMatrixAt(i, o.matrix);
      o.position.set(p[0], p[1] + 0.045, p[2]);
      o.updateMatrix();
      voet.current?.setMatrixAt(i, o.matrix);
    });
    if (kom.current) kom.current.instanceMatrix.needsUpdate = true;
    if (voet.current) voet.current.instanceMatrix.needsUpdate = true;
  }, [plekken]);
  const bubbel = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    bubbel.current?.children.forEach((b, i) => {
      const f = (t * 0.6 + i / 5) % 1;
      b.position.set(Math.sin(i * 2.3) * 0.2, 0.5 - f * 0.45, Math.cos(i * 1.7) * 0.2);
    });
  });
  return (
    <group>
      {/* tafel met wit kleed */}
      <Blok size={[1.4, 0.74, 0.9]} pos={[0, 0.37, 0]} color="#fbfaf6" r={0.04} />
      <Blok size={[1.42, 0.04, 0.92]} pos={[0, 0.76, 0]} color="#f3efe6" r={0.01} />
      <group position={[0, 0.78, 0]}>
        <instancedMesh ref={kom} args={[undefined, undefined, plekken.length]} castShadow>
          <cylinderGeometry args={[0.06, 0.025, 0.04, 14]} />
          <meshStandardMaterial color="#f5df9a" roughness={0.25} metalness={0.1} />
        </instancedMesh>
        <instancedMesh ref={voet} args={[undefined, undefined, plekken.length]}>
          <cylinderGeometry args={[0.008, 0.03, 0.09, 8]} />
          <meshStandardMaterial color="#e8f2f4" roughness={0.2} />
        </instancedMesh>
        {/* fles die schenkt */}
        <group position={[0.17, 0.62, 0]} rotation={[0, 0, 2.2]}>
          <Cil r={0.05} h={0.22} color="#2f6a3a" seg={14} />
          <Cil r={0.05} rTop={0.02} h={0.08} pos={[0, 0.15, 0]} color="#2f6a3a" seg={14} />
          <Cil r={0.022} h={0.05} pos={[0, 0.21, 0]} color="#d8b04a" seg={10} />
        </group>
        <group ref={bubbel}>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} material={mat('#fff6cf', { emissive: '#fff0a0' })}>
              <sphereGeometry args={[0.012, 6, 4]} />
            </mesh>
          ))}
        </group>
        {/* krat met lege flessen + teller */}
        <group position={[-0.5, 0, 0.18]}>
          <Blok size={[0.3, 0.12, 0.22]} pos={[0, 0.06, 0]} color="#c4302b" r={0.02} />
          {[-0.08, 0.04].map((x) => (
            <Cil key={x} r={0.03} h={0.2} pos={[x, 0.16, 0]} color="#2f6a3a" seg={10} />
          ))}
        </group>
      </group>
      {/* spandoek */}
      <group position={[0, 0, -0.5]}>
        {[-0.75, 0.75].map((x) => (
          <Cil key={x} r={0.025} h={2.1} pos={[x, 1.05, 0]} color="#d8b04a" seg={8} />
        ))}
        <Tekst regels={['glas 20 cl – fles 0,75 liter', '45.000 glazen']} b={1.5} h={0.42} pos={[0, 1.82, 0.02]} o={{ bg: '#1f3c5a', fg: '#ffffff', groot: 0.6 }} />
      </group>
    </group>
  );
}

/** EXP-10: bag-in-box van 10 liter met een rood tapkraantje; de zak met druivensap schuift eruit. */
export function BagInBox() {
  const wesp = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wesp.current) wesp.current.position.set(0.32 + Math.cos(t * 2) * 0.1, 0.32 + Math.sin(t * 3) * 0.04, 0.24 + Math.sin(t * 2) * 0.08);
  });
  const doos = useTextuur(
    0.4,
    0.32,
    (ctx, w, h) => {
      ctx.fillStyle = '#f7f4ee';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2f6fb3';
      ctx.fillRect(0, h * 0.68, w, h * 0.32);
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${h * 0.2}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10 liter', w / 2, h * 0.84);
      ctx.fillStyle = '#6a2a6a';
      ctx.font = `700 ${h * 0.14}px ${FONT}`;
      ctx.fillText('druivensap', w / 2, h * 0.3);
    },
    'bagbox',
    500,
  );
  return (
    <group>
      <group position={[-0.1, 0, -0.05]}>
        {/* doos (open bovenkant) */}
        <Blok size={[0.4, 0.32, 0.3]} pos={[0, 0.16, 0]} color="#efe8da" r={0.01} />
        <mesh position={[0, 0.16, 0.151]}>
          <planeGeometry args={[0.4, 0.32]} />
          <meshStandardMaterial map={doos} roughness={0.8} />
        </mesh>
        <Deel id="zak" uit={[0, 0.45, 0]} label="Zak met 10 liter druivensap">
          <mesh position={[0, 0.2, 0]} scale={[1.6, 1, 1.1]} material={mat('#7a2f7a', { opacity: 0.85, rough: 0.2 })}>
            <sphereGeometry args={[0.12, 16, 12]} />
          </mesh>
        </Deel>
        {/* tapkraantje */}
        <Cil r={0.018} h={0.06} pos={[0.12, 0.05, 0.18]} rot={[Math.PI / 2, 0, 0]} color="#d52b1e" seg={10} />
        <Blok size={[0.05, 0.03, 0.03]} pos={[0.12, 0.08, 0.2]} color="#d52b1e" r={0.008} />
      </group>
      {/* glazen van 20 cl */}
      <group position={[0.3, 0, 0.12]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 0.11 - 0.05, 0, i % 2 ? 0.06 : 0]}>
            <Cil r={0.035} rTop={0.04} h={0.11} pos={[0, 0.055, 0]} color="#eef6f7" seg={14} />
            {i === 0 && <Cil r={0.032} rTop={0.036} h={0.07} pos={[0, 0.04, 0]} color="#7a2f7a" seg={14} />}
          </group>
        ))}
        <Tekst regels={['1 glas = 20 cl']} b={0.32} h={0.09} pos={[0.06, 0.22, 0.08]} rot={[-0.3, 0, 0]} o={{ bg: '#fbf7ee', rand: '#7a2f7a' }} />
      </group>
      {/* wesp */}
      <group ref={wesp}>
        <mesh scale={[0.6, 0.6, 1]} material={mat('#f2c21e')}>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
        <Blok size={[0.03, 0.002, 0.012]} pos={[0, 0.012, 0]} color="#e8f2f4" r={0.001} />
      </group>
    </group>
  );
}

/* ───────────── autorit, weerstation ───────────── */

/** EXP-11: maquette van de rit van werk naar huis, met een navigatiescherm (2750 m, 13 min 45 s). */
export function Autorit() {
  const auto = useRef<THREE.Group>(null);
  const weg = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-0.9, 0, 0.25), new THREE.Vector3(-0.4, 0, 0.3), new THREE.Vector3(0, 0, -0.1), new THREE.Vector3(0.45, 0, -0.25), new THREE.Vector3(0.9, 0, 0.1)]), []);
  useFrame(({ clock }) => {
    const f = (clock.getElapsedTime() * 0.06) % 1;
    const p = weg.getPointAt(f);
    const r = weg.getTangentAt(f);
    if (auto.current) {
      auto.current.position.set(p.x, 0.02, p.z);
      auto.current.rotation.y = Math.atan2(r.x, r.z);
    }
  });
  const wegGeo = useMemo(() => new THREE.TubeGeometry(weg, 60, 0.05, 4, false), [weg]);
  return (
    <group>
      <group>
        <Blok size={[2.1, 0.02, 1.1]} pos={[0, 0.01, 0]} color="#9cbd65" r={0.01} />
        <mesh geometry={wegGeo} scale={[1, 0.15, 1]} position={[0, 0.02, 0]} material={mat('#5d6166')} />
        {/* werk en huis */}
        <group position={[-0.95, 0.02, 0.1]}>
          <Blok size={[0.22, 0.22, 0.18]} pos={[0, 0.11, 0]} color="#d9cdb8" r={0.02} />
          <Tekst regels={['werk']} b={0.24} h={0.08} pos={[0, 0.3, 0]} o={{ bg: '#fbf7ee' }} />
        </group>
        <group position={[0.95, 0.02, -0.08]}>
          <Blok size={[0.18, 0.15, 0.16]} pos={[0, 0.075, 0]} color="#f2e7d8" r={0.02} />
          <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#b4443a', { flat: true })}>
            <coneGeometry args={[0.15, 0.1, 4]} />
          </mesh>
          <Tekst regels={['huis']} b={0.24} h={0.08} pos={[0, 0.34, 0]} o={{ bg: '#fbf7ee' }} />
        </group>
        <Poppetje pos={[-0.78, 0.02, 0.22]} rot={0.4} s={0.11} shirt="#8b6bb5" haar="#1f1a18" />
        <group ref={auto}>
          <Blok size={[0.08, 0.04, 0.14]} pos={[0, 0.03, 0]} color="#d86a4a" r={0.015} />
          <Blok size={[0.07, 0.03, 0.07]} pos={[0, 0.06, -0.01]} color={P.glas} r={0.01} />
        </group>
      </group>
      {/* navigatiescherm op een standaard */}
      <group position={[0.2, 0, -0.4]}>
        <Blok size={[0.04, 0.3, 0.04]} pos={[0, 0.15, 0]} color="#2f3634" r={0.01} />
        <Blok size={[0.9, 0.5, 0.05]} pos={[0, 0.5, 0]} rot={[-0.1, 0, 0]} color="#2f3634" r={0.03} />
        <Tekst regels={['Werk → huis: 2750 m', 'tijd: 13 min 45 s']} b={0.82} h={0.42} pos={[0, 0.5, 0.027]} rot={[-0.1, 0, 0]} o={{ bg: '#17211d', fg: '#9cf0b4', groot: 0.58, basic: true }} />
      </group>
    </group>
  );
}

/** EXP-12a/b/c: weerstation met windmeter, regenmeter, bliksemafleider, een onweerswolk en een stopwatch. */
export function Weerstation() {
  const molen = useRef<THREE.Group>(null);
  const flits = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }, dt) => {
    if (molen.current) molen.current.rotation.y += dt * 2.2;
    const t = clock.getElapsedTime() % 4;
    if (flits.current) flits.current.opacity = t < 0.12 || (t > 0.22 && t < 0.3) ? 1 : 0;
  });
  return (
    <group>
      {/* weerhuisje op poten */}
      <group position={[-0.45, 0, 0]}>
        {[-0.25, 0.25].map((x) => [-0.2, 0.2].map((z) => <Blok key={`${x}${z}`} size={[0.05, 1.0, 0.05]} pos={[x, 0.5, z]} color="#fbfaf6" r={0.01} />))}
        <Blok size={[0.66, 0.6, 0.55]} pos={[0, 1.3, 0]} color="#fbfaf6" r={0.03} />
        {Array.from({ length: 6 }, (_, i) => (
          <Blok key={i} size={[0.6, 0.02, 0.02]} pos={[0, 1.08 + i * 0.09, 0.28]} color="#dcd6ca" r={0.004} />
        ))}
        <Blok size={[0.76, 0.06, 0.65]} pos={[0, 1.63, 0]} color="#e9e3d7" r={0.02} />
        {/* bliksemafleider */}
        <Cil r={0.012} h={1.0} pos={[0.25, 2.15, -0.15]} color="#c9a04a" seg={6} />
      </group>
      {/* windmeter */}
      <group position={[0.35, 0, -0.25]}>
        <Cil r={0.025} h={2.1} pos={[0, 1.05, 0]} color="#9aa3a8" seg={8} />
        <group ref={molen} position={[0, 2.12, 0]}>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
              <Blok size={[0.28, 0.012, 0.012]} pos={[0.14, 0, 0]} color="#9aa3a8" r={0.004} />
              <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#d86a4a')}>
                <sphereGeometry args={[0.045, 10, 6, 0, Math.PI]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      {/* stopwatch-scherm en geluidsbord */}
      <group position={[0.75, 0, 0.3]}>
        <Cil r={0.025} h={1.1} pos={[0, 0.55, 0]} color="#3b4246" seg={8} />
        <Blok size={[0.9, 0.7, 0.05]} pos={[0, 1.35, 0]} color="#2f3634" r={0.03} />
        <Tekst regels={['geluid:', '333 m per seconde']} b={0.84} h={0.36} pos={[0, 1.5, 0.027]} o={{ bg: '#17211d', fg: '#ffd27a', basic: true, kop: true }} />
        <Scherm tekst="stopwatch: 9 s" b={0.84} h={0.24} pos={[0, 1.15, 0.027]} />
      </group>
      <group position={[-0.95, 0, 0.45]}>
        <Cil r={0.02} h={0.9} pos={[0, 0.45, 0]} color="#3b4246" seg={8} />
        <Tekst regels={['Donder hoor je', 'tot 15 km ver.']} b={0.8} h={0.42} pos={[0, 1.0, 0.02]} o={{ bg: '#fbf7ee', fg: '#1f2a24', rand: '#2f3b44' }} />
      </group>
      {/* onweerswolk met bliksem */}
      <group position={[0.1, 2.65, 0.1]}>
        {[
          [-0.35, 0, 0, 0.32],
          [0, 0.12, 0, 0.4],
          [0.38, 0.02, 0.05, 0.3],
          [0.1, -0.05, 0.22, 0.28],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} material={mat('#5d6470', { flat: true })}>
            <icosahedronGeometry args={[r, 1]} />
          </mesh>
        ))}
        <mesh position={[0.15, -0.6, 0.2]} rotation={[0, 0, 0.1]}>
          <shapeGeometry args={[bliksemVorm]} />
          <meshBasicMaterial ref={flits} color="#fff36a" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Saskia en Dario */}
      <Poppetje pos={[-0.15, 0, 0.75]} rot={2.6} s={0.55} shirt="#d65f8a" haar="#6a3a1a" />
      <Poppetje pos={[0.1, 0, 0.85]} rot={2.9} s={0.6} shirt="#3d8fd6" />
    </group>
  );
}

const bliksemVorm = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.45);
  s.lineTo(0.1, 0.45);
  s.lineTo(0.02, 0.15);
  s.lineTo(0.12, 0.15);
  s.lineTo(-0.08, -0.3);
  s.lineTo(-0.01, 0.05);
  s.lineTo(-0.1, 0.05);
  s.closePath();
  return s;
})();

/* ───────────── buitenmissie ───────────── */

/** PRA-01..04: prikbord "Buitenmissie" met vier kaarten en het gereedschap eronder. */
export function Buitenmissie() {
  const bord = useTextuur(
    2.4,
    1.5,
    (ctx, w, h) => {
      ctx.fillStyle = '#c9a06a';
      rondRect(ctx, 0, 0, w, h, h * 0.04);
      ctx.fill();
      const r = seeded(9);
      ctx.fillStyle = 'rgba(120,80,40,0.25)';
      for (let i = 0; i < 400; i++) ctx.fillRect(r() * w, r() * h, 3, 3);
      ctx.fillStyle = '#1f3c5a';
      rondRect(ctx, w * 0.25, h * 0.04, w * 0.5, h * 0.16, h * 0.03);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${h * 0.1}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Buitenmissie', w / 2, h * 0.12);
      const kaarten = [
        ['1', 'Meten', 'lengte, breedte, hoogte'],
        ['2', 'Gewicht schatten', 'weeg je tas'],
        ['3', 'Inhoud fles', 'liter en ml'],
        ['4', 'Loopafstand', 'tel je stappen'],
      ];
      const kleuren = ['#fff3b0', '#d6f0ff', '#e3f7d4', '#ffe0d0'];
      kaarten.forEach(([nr, titel, sub], i) => {
        const kx = w * (0.04 + i * 0.24);
        const ky = h * 0.28;
        const kw = w * 0.21;
        const kh = h * 0.62;
        ctx.save();
        ctx.translate(kx + kw / 2, ky + kh / 2);
        ctx.rotate((i % 2 ? 1 : -1) * 0.03);
        ctx.fillStyle = kleuren[i];
        ctx.fillRect(-kw / 2, -kh / 2, kw, kh);
        ctx.fillStyle = '#d52b1e';
        ctx.beginPath();
        ctx.arc(0, -kh / 2 + h * 0.03, h * 0.018, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2a24';
        ctx.font = `700 ${h * 0.14}px ${FONT}`;
        ctx.fillText(nr, 0, -kh * 0.22);
        let fs = h * 0.065;
        ctx.font = `700 ${fs}px ${FONT}`;
        const m = ctx.measureText(titel).width;
        if (m > kw * 0.9) fs *= (kw * 0.9) / m;
        ctx.font = `700 ${fs}px ${FONT}`;
        ctx.fillText(titel, 0, kh * 0.08);
        let fs2 = h * 0.05;
        ctx.font = `600 ${fs2}px ${FONT}`;
        const m2 = ctx.measureText(sub).width;
        if (m2 > kw * 0.9) fs2 *= (kw * 0.9) / m2;
        ctx.font = `600 ${fs2}px ${FONT}`;
        ctx.fillText(sub, 0, kh * 0.26);
        ctx.restore();
      });
    },
    'prikbord-buitenmissie',
    300,
  );
  return (
    <group>
      {[-1.15, 1.15].map((x) => (
        <Blok key={x} size={[0.07, 2.2, 0.07]} pos={[x, 1.1, -0.05]} color="#7a5132" r={0.02} />
      ))}
      <Blok size={[2.5, 1.6, 0.06]} pos={[0, 1.45, -0.05]} color="#7a5132" r={0.03} />
      <mesh position={[0, 1.45, -0.015]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial map={bord} roughness={0.85} />
      </mesh>
      {/* gereedschap eronder */}
      <group position={[0, 0, 0.35]}>
        {/* meetlint */}
        <group position={[-0.85, 0, 0]}>
          <Blok size={[0.16, 0.16, 0.07]} pos={[0, 0.08, 0]} color="#f2d04a" r={0.04} />
          <Blok size={[0.5, 0.004, 0.03]} pos={[0.3, 0.004, 0.02]} color="#f7e27a" r={0.001} />
        </group>
        {/* rugzak */}
        <group position={[-0.25, 0, 0]}>
          <Blok size={[0.34, 0.42, 0.2]} pos={[0, 0.21, 0]} color="#3d8fd6" r={0.08} />
          <Blok size={[0.26, 0.16, 0.06]} pos={[0, 0.14, 0.12]} color="#2f6fb3" r={0.04} />
        </group>
        {/* maatbeker */}
        <group position={[0.3, 0, 0.05]}>
          <Cil r={0.08} h={0.2} pos={[0, 0.1, 0]} color="#e6f4f7" seg={16} />
          <Cil r={0.075} h={0.1} pos={[0, 0.055, 0]} color="#7fc6d8" seg={16} />
        </group>
        {/* stappenteller */}
        <group position={[0.8, 0, 0]}>
          <Blok size={[0.14, 0.2, 0.05]} pos={[0, 0.1, 0]} color="#2f3634" r={0.03} />
          <Scherm tekst="stappen" b={0.11} h={0.05} pos={[0, 0.13, 0.027]} />
        </group>
      </group>
    </group>
  );
}

/* ───────────── 24-kaarten ───────────── */

/** Speelkaart "maak 24": oranje rand, groene stipjes, groene cirkel met geel kruis, 4 cijfers naar buiten. */
function useKaart24(cijfers: number[], nr: number) {
  return useTextuur(
    1.2,
    1.2,
    (ctx, w, h) => {
      ctx.fillStyle = '#f08a1e';
      rondRect(ctx, 0, 0, w, h, w * 0.08);
      ctx.fill();
      ctx.fillStyle = '#fbfaf6';
      rondRect(ctx, w * 0.05, h * 0.05, w * 0.9, h * 0.9, w * 0.06);
      ctx.fill();
      ctx.fillStyle = '#3fa04a';
      for (const [x, y] of [
        [0.1, 0.1],
        [0.9, 0.1],
        [0.1, 0.9],
        [0.9, 0.9],
      ]) {
        ctx.beginPath();
        ctx.arc(w * x, h * y, w * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
      // groene cirkel met geel kruis
      ctx.fillStyle = '#3fa04a';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f7d21e';
      ctx.lineWidth = w * 0.06;
      ctx.beginPath();
      ctx.moveTo(w * 0.27, h * 0.27);
      ctx.lineTo(w * 0.73, h * 0.73);
      ctx.moveTo(w * 0.73, h * 0.27);
      ctx.lineTo(w * 0.27, h * 0.73);
      ctx.stroke();
      ctx.fillStyle = '#2f7a38';
      ctx.fillRect(w * 0.46, h * 0.46, w * 0.08, h * 0.08);
      // vier witte vakken met de cijfers, gedraaid naar de rand
      const vak = [
        [0.5, 0.25, 0],
        [0.75, 0.5, Math.PI / 2],
        [0.5, 0.75, Math.PI],
        [0.25, 0.5, -Math.PI / 2],
      ];
      vak.forEach(([x, y, r], i) => {
        ctx.save();
        ctx.translate(w * x, h * y);
        ctx.rotate(r);
        ctx.fillStyle = '#fbfaf6';
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2a24';
        ctx.font = `700 ${h * 0.16}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const c = String(cijfers[i] ?? '');
        ctx.fillText(c, 0, h * 0.008);
        if (c === '6' || c === '9') ctx.fillRect(-w * 0.035, h * 0.068, w * 0.07, h * 0.012);
        ctx.restore();
      });
      ctx.fillStyle = '#1f2a24';
      ctx.font = `700 ${h * 0.06}px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(`kaart ${nr}`, w * 0.9, h * 0.94);
    },
    `kaart24-${nr}-${cijfers.join('')}`,
    500,
  );
}

/** PUZ-01..03: fontein op een sokkel met een grote 24-kaart. Is de kaart opgelost, dan spuit de fontein. */
export function Kaart24({ nr, cijfers }: { nr: number; cijfers: number[] }) {
  const kaart = useKaart24(cijfers, nr);
  const id = `O1-PUZ-0${nr}`;
  const opgelost = useSpel((s) => !!s.voortgang[id]?.goed);
  const straal = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    straal.current?.children.forEach((d, i) => {
      const f = (t * 0.9 + i / 6) % 1;
      const a = (i / 6) * Math.PI * 2;
      d.position.set(Math.cos(a) * f * 0.35, 0.3 + Math.sin(f * Math.PI) * 0.45, Math.sin(a) * f * 0.35);
    });
  });
  return (
    <group>
      {/* bassin */}
      <Cil r={0.85} h={0.3} pos={[0, 0.15, 0]} color="#cfc7b8" seg={28} />
      <Cil r={0.75} h={0.02} pos={[0, 0.28, 0]} color="#5fb7c9" seg={28} />
      {/* sokkel en kaart */}
      <Blok size={[0.5, 0.6, 0.5]} pos={[0, 0.55, 0]} color="#e9e3d7" r={0.04} />
      <Blok size={[0.62, 0.06, 0.62]} pos={[0, 0.88, 0]} color="#d9d0bf" r={0.02} />
      <group position={[0, 1.45, 0.05]} rotation={[-0.2, 0, 0]}>
        <Blok size={[1.24, 1.24, 0.05]} pos={[0, 0, -0.03]} color="#d9761a" r={0.04} />
        <mesh>
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial map={kaart} roughness={0.5} />
        </mesh>
      </group>
      <Blok size={[0.05, 0.6, 0.05]} pos={[0, 1.1, -0.12]} rot={[-0.2, 0, 0]} color="#d9d0bf" r={0.01} />
      <Tekst regels={['Maak 24']} b={0.5} h={0.14} pos={[0, 0.65, 0.255]} o={{ bg: '#1f3c5a', fg: '#ffffff' }} />
      {/* fontein: alleen als de kaart is opgelost */}
      <group ref={straal} visible={opgelost}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} material={mat('#bfe8f2', { opacity: 0.85, rough: 0.1 })}>
            <sphereGeometry args={[0.05, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
