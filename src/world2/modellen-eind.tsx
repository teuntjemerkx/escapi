// 3D-objecten rond de eindpoort (evaluatie: de eindtest uit het werkboek).
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat } from '../game/inspectie';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { P } from '../game/palette';
import { Bordje, FONT, rondRect, useTextuur } from '../game/tekst';

type V3 = [number, number, number];

/** EIN-01: woonkamervloer 6,40 × 7,20 m met tegels van 40 × 40 cm (16 × 18 = 288). Half gelegd. */
export function Tegelvloer() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = 16 * 18;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const kleur = new THREE.Color();
    let i = 0;
    for (let rij = 0; rij < 18; rij++)
      for (let k = 0; k < 16; k++) {
        const gelegd = rij < 7 || (rij === 7 && k < 9);
        o.position.set(-3.2 + 0.2 + k * 0.4, gelegd ? 0.08 : -1, -3.6 + 0.2 + rij * 0.4);
        o.scale.setScalar(gelegd ? 1 : 0.0001);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        m.setColorAt(i, kleur.set((rij + k) % 2 ? '#e8dcc6' : '#d8c8ac'));
        i++;
      }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  return (
    <group>
      <Deel id="vloer" uit={[0, 0, 0]} label="Vloer 6,40 × 7,20 m">
        <Blok size={[6.4, 0.06, 7.2]} pos={[0, 0.03, 0]} color="#e2cfa0" r={0.02} shadow={false} />
      </Deel>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} receiveShadow>
        <boxGeometry args={[0.38, 0.04, 0.38]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      {/* stapel tegels + tegelzetter-emmer */}
      {Array.from({ length: 6 }, (_, i) => (
        <Blok key={i} size={[0.4, 0.04, 0.4]} pos={[2.5, 0.08 + i * 0.045, 2.8]} color="#e8dcc6" r={0.01} />
      ))}
      <Cil r={0.18} rTop={0.2} h={0.35} pos={[1.8, 0.2, 3.0]} color="#3d7cc9" seg={14} />
      <Maat van={[-3.2, 0.12, 4.1]} naar={[3.2, 0.12, 4.1]} label="6,40 m" />
      <Maat van={[3.7, 0.12, -3.6]} naar={[3.7, 0.12, 3.6]} label="7,20 m" />
      <Maat van={[-3.2, 0.14, -3.75]} naar={[-2.8, 0.14, -3.75]} label="40 cm" />
    </group>
  );
}

/** EIN-02: strook grond van 3 m × 40 cm met bloembollen. */
export function Bloembollen() {
  return (
    <group>
      <Deel id="strook" uit={[0, 0.5, 0]} label="Strook 3 m × 40 cm">
        <Blok size={[3, 0.12, 0.4]} pos={[0, 0.06, 0]} color="#6b4a2f" r={0.03} />
        {Array.from({ length: 18 }, (_, i) => (
          <group key={i} position={[-1.4 + (i % 9) * 0.35, 0.15, i < 9 ? -0.09 : 0.09]}>
            <mesh material={mat('#c8a46a')} castShadow>
              <sphereGeometry args={[0.05, 8, 6]} />
            </mesh>
            <mesh position={[0, 0.07, 0]} material={mat('#7cbf4a')}>
              <coneGeometry args={[0.015, 0.1, 4]} />
            </mesh>
          </group>
        ))}
      </Deel>
      <group position={[1.9, 0, 0.6]}>
        <Blok size={[0.5, 0.3, 0.35]} pos={[0, 0.15, 0]} color="#d8b27a" r={0.04} />
        <Bordje regels={['15 per m²']} breed={0.5} hoog={0.18} pos={[0, 0.16, 0.18]} rand={null} bg="#d8b27a" />
      </group>
      <Maat van={[-1.5, 0.14, 0.45]} naar={[1.5, 0.14, 0.45]} label="3 m" />
      <Maat van={[-1.7, 0.14, -0.2]} naar={[-1.7, 0.14, 0.2]} label="40 cm" />
    </group>
  );
}

/** EIN-03: juweliersvitrine met een ring en een meetlint "6,5 cm". */
export function Ring() {
  const ring = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.y += dt * 0.8;
  });
  return (
    <group>
      <Blok size={[1.4, 1.0, 0.8]} pos={[0, 0.5, 0]} color={P.hout} r={0.06} />
      <Blok size={[1.3, 0.5, 0.7]} pos={[0, 1.25, 0]} color="#d7eef3" r={0.04} opacity={0.3} />
      <Blok size={[0.4, 0.12, 0.3]} pos={[0, 1.06, 0]} color="#8b3a5a" r={0.05} />
      <group ref={ring} position={[0, 1.22, 0]}>
        <mesh material={mat('#e6c95b', { rough: 0.25, metal: 0.8 })} castShadow>
          <torusGeometry args={[0.1, 0.022, 10, 28]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} material={mat('#bfe3f2', { rough: 0.1 })}>
          <octahedronGeometry args={[0.035, 0]} />
        </mesh>
      </group>
      <Bordje regels={['ringmaat (mm) =', 'omtrek (mm) : 3,14']} breed={1.2} hoog={0.4} pos={[0, 0.65, 0.41]} />
      <group position={[0.85, 1.0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#f2d04a')}>
          <torusGeometry args={[0.15, 0.03, 6, 20]} />
        </mesh>
        <Bordje regels={['vinger: 6,5 cm']} breed={0.6} hoog={0.16} pos={[0, 0.06, 0.18]} bg="#f2d04a" rand={null} />
      </group>
    </group>
  );
}

/** EIN-04: aquarium 48 × 21 × 36 cm met visjes. Het water tilt eruit. */
export function Aquarium() {
  const vissen = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    vissen.current?.children.forEach((v, i) => {
      v.position.x = Math.sin(t * 0.7 + i * 2) * 0.17;
      v.position.y = 0.1 + i * 0.07 + Math.sin(t * 1.3 + i) * 0.015;
      v.rotation.y = Math.cos(t * 0.7 + i * 2) > 0 ? 0 : Math.PI;
    });
  });
  return (
    <group>
      <Blok size={[0.6, 0.75, 0.32]} pos={[0, 0.375, 0]} color="#3b3a39" r={0.03} />
      <group position={[0, 0.75, 0]}>
        <Blok size={[0.5, 0.02, 0.23]} pos={[0, 0.01, 0]} color="#3b3a39" r={0.005} />
        <Blok size={[0.5, 0.38, 0.23]} pos={[0, 0.2, 0]} color="#d7eef3" r={0.01} opacity={0.22} />
        <Blok size={[0.52, 0.05, 0.25]} pos={[0, 0.41, 0]} color="#3b3a39" r={0.01} />
        <Blok size={[0.46, 0.03, 0.19]} pos={[0, 0.035, 0]} color="#d8c8a0" r={0.005} />
        <Deel id="water" uit={[0, 0.55, 0]} label="Water 48 × 21 × 36 cm">
          <Blok size={[0.48, 0.34, 0.21]} pos={[0, 0.2, 0]} color="#7fcfe0" r={0.005} opacity={0.5} />
          <group ref={vissen}>
            {['#e5675a', '#f2a64a', '#f2d04a'].map((k, i) => (
              <group key={i} position={[0, 0.1, -0.05 + i * 0.05]}>
                <Blok size={[0.06, 0.035, 0.02]} color={k} r={0.01} shadow={false} />
                <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat(k)}>
                  <coneGeometry args={[0.018, 0.03, 4]} />
                </mesh>
              </group>
            ))}
          </group>
        </Deel>
        {[-0.15, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.12, -0.06]} material={mat('#5fa34a')}>
            <coneGeometry args={[0.03, 0.2, 5]} />
          </mesh>
        ))}
        <Maat van={[-0.24, 0.02, 0.17]} naar={[0.24, 0.02, 0.17]} label="48 cm" />
        <Maat van={[0.31, 0.02, -0.105]} naar={[0.31, 0.02, 0.105]} label="21 cm" />
        <Maat van={[-0.31, 0.02, 0.105]} naar={[-0.31, 0.38, 0.105]} label="36 cm" />
      </group>
    </group>
  );
}

/** EIN-05: 10 kisten aardappelen van 25 kg; 7 zijn verkocht (staan op de kar). */
export function Aardappelkisten() {
  const kist = (pos: V3, key: string) => {
    const r = seeded(key.length * 7 + pos[0] * 13);
    return (
      <group key={key} position={pos}>
        <Blok size={[0.6, 0.3, 0.4]} pos={[0, 0.15, 0]} color={P.houtLicht} r={0.02} />
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-0.2 + (i % 3) * 0.2 + (r() - 0.5) * 0.05, 0.31, -0.08 + Math.floor(i / 3) * 0.16]} material={mat('#d9b56a')} castShadow>
            <sphereGeometry args={[0.08, 8, 6]} />
          </mesh>
        ))}
        <Bordje regels={['25 kg']} breed={0.3} hoog={0.12} pos={[0, 0.15, 0.205]} rand={null} bg={P.houtLicht} />
      </group>
    );
  };
  return (
    <group>
      {/* 3 kisten blijven over */}
      {kist([-0.7, 0, 0], 'a')}
      {kist([-0.7, 0.32, 0], 'b')}
      {kist([-0.7, 0.64, 0], 'c')}
      {/* 7 verkochte kisten op de kar */}
      <Deel id="kisten" uit={[1.6, 0, 0]} label="7 kisten verkocht">
        <group position={[0.6, 0, 0]}>
          <Blok size={[1.6, 0.08, 1.0]} pos={[0.3, 0.2, 0]} color={P.metaal} r={0.02} />
          <Cil r={0.12} h={0.06} pos={[-0.3, 0.12, 0.5]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={12} />
          <Cil r={0.12} h={0.06} pos={[0.9, 0.12, 0.5]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={12} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => kist([-0.1 + (i % 2) * 0.7, 0.24 + Math.floor(i / 2) * 0.32, (i % 2 ? 0.2 : -0.2) * 0], `v${i}`))}
        </group>
      </Deel>
      <Bordje regels={['10 kisten', '25 kg per kist']} breed={1.0} hoog={0.45} pos={[-0.7, 1.35, 0.1]} />
    </group>
  );
}

/** EIN-06: paspop met spijkerbroek en meetlint om de taille (83 cm). */
export function Spijkerbroek() {
  return (
    <group>
      <Cil r={0.25} h={0.06} pos={[0, 0.03, 0]} color="#3b3a39" seg={20} />
      <Cil r={0.03} h={0.5} pos={[0, 0.3, 0]} color="#3b3a39" seg={8} />
      <group position={[0, 0.55, 0]}>
        <Blok size={[0.16, 0.8, 0.18]} pos={[-0.1, 0.4, 0]} color="#3f5f8f" r={0.06} />
        <Blok size={[0.16, 0.8, 0.18]} pos={[0.1, 0.4, 0]} color="#3f5f8f" r={0.06} />
        <Blok size={[0.38, 0.2, 0.2]} pos={[0, 0.85, 0]} color="#3f5f8f" r={0.06} />
        <Blok size={[0.36, 0.5, 0.2]} pos={[0, 1.2, 0]} color="#efe6d6" r={0.1} />
        <mesh position={[0, 0.93, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2d04a')}>
          <torusGeometry args={[0.21, 0.02, 6, 24]} />
        </mesh>
        <Bordje regels={['taille: 83 cm']} breed={0.55} hoog={0.14} pos={[0, 0.93, 0.24]} bg="#f2d04a" rand={null} />
      </group>
      <Bordje regels={['maat = taille (cm) : 2,54', 'rond naar boven af']} breed={1.3} hoog={0.4} pos={[0, 0.25, 0.4]} rot={[-0.5, 0, 0]} />
    </group>
  );
}

/** EIN-07: fles melk van 1,8 liter en glazen van 20 cl op een picknicktafel. */
export function Melk() {
  return (
    <group>
      <Blok size={[2.0, 0.08, 0.9]} pos={[0, 0.78, 0]} color={P.hout} r={0.03} />
      {[-0.85, 0.85].map((x) => (
        <Blok key={x} size={[0.08, 0.78, 0.8]} pos={[x, 0.39, 0]} color={P.houtLicht} r={0.02} />
      ))}
      <group position={[-0.7, 0.82, 0]}>
        <Cil r={0.09} h={0.34} pos={[0, 0.17, 0]} color={P.wit} seg={16} />
        <Cil r={0.04} rTop={0.03} h={0.08} pos={[0, 0.38, 0]} color={P.wit} seg={12} />
        <Cil r={0.035} h={0.03} pos={[0, 0.435, 0]} color="#3d7cc9" seg={12} />
        <Bordje regels={['MELK', '1,8 liter']} breed={0.16} hoog={0.12} pos={[0, 0.17, 0.092]} rand={null} bg="#3d7cc9" fg="#ffffff" />
      </group>
      <Deel id="glazen" uit={[0, 0.4, 0.2]} label="9 glazen van 20 cl">
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i} position={[-0.35 + (i % 5) * 0.22, 0.82, i < 5 ? -0.15 : 0.15]}>
            <Cil r={0.045} rTop={0.05} h={0.14} pos={[0, 0.07, 0]} color="#e3f1f4" seg={12} />
            <Cil r={0.04} rTop={0.045} h={0.1} pos={[0, 0.055, 0]} color={P.wit} seg={12} />
          </group>
        ))}
      </Deel>
      <Bordje regels={['1 glas = 20 cl']} breed={0.6} hoog={0.16} pos={[0.4, 0.82 + 0.005, 0.4]} rot={[-Math.PI / 2, 0, 0]} rand={null} />
    </group>
  );
}

/** EIN-08: stationsbord met klapletters (dienstregeling Arnhem → Zandvoort aan Zee). */
export function Stationsbord() {
  const rijen = [
    ['07:31', 'Arnhem', '11', 'Intercity'],
    ['08:37', 'Amsterdam C.', '8a', 'overstap'],
    ['08:48', 'Amsterdam C.', '1', 'Sprinter'],
    ['09:19', 'Zandvoort a/Zee', '1', ''],
  ];
  const tex = useTextuur(
    3.2,
    1.6,
    (ctx, w, h) => {
      ctx.fillStyle = '#1d3a6b';
      rondRect(ctx, 0, 0, w, h, 24);
      ctx.fill();
      ctx.fillStyle = '#f2d04a';
      ctx.font = `700 ${h * 0.1}px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillText('Tijd', w * 0.04, h * 0.12);
      ctx.fillText('Station', w * 0.25, h * 0.12);
      ctx.fillText('Spoor', w * 0.66, h * 0.12);
      rijen.forEach((r, i) => {
        const y = h * (0.32 + i * 0.18);
        ctx.fillStyle = '#0f2347';
        rondRect(ctx, w * 0.03, y - h * 0.07, w * 0.94, h * 0.14, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${h * 0.1}px ${FONT}`;
        ctx.fillText(r[0], w * 0.04, y);
        ctx.fillText(r[1], w * 0.25, y);
        ctx.fillText(r[2], w * 0.68, y);
        ctx.fillStyle = '#9fc4ef';
        ctx.font = `500 ${h * 0.075}px ${FONT}`;
        ctx.fillText(r[3], w * 0.78, y);
      });
    },
    'station',
  );
  return (
    <group>
      {[-1.4, 1.4].map((x) => (
        <Cil key={x} r={0.07} h={3.2} pos={[x, 1.6, 0]} color={P.dak} seg={8} />
      ))}
      <Blok size={[3.4, 1.8, 0.14]} pos={[0, 2.4, 0]} color="#16305a" r={0.06} />
      <mesh position={[0, 2.4, 0.075]}>
        <planeGeometry args={[3.2, 1.6]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
      <Blok size={[4, 0.3, 2]} pos={[0, 0.15, 1.2]} color={P.steen} r={0.05} />
      <Blok size={[4, 0.04, 0.12]} pos={[0, 0.31, 2.1]} color={P.geel} r={0.01} />
    </group>
  );
}

/** EIN-09: pakket 50 × 35 × 35 cm met twee touwen die bovenop kruisen. */
export function Pakket() {
  const touw = '#e8d7a8';
  return (
    <group>
      <Blok size={[0.5, 0.35, 0.35]} pos={[0, 0.175, 0]} color="#b98d55" r={0.03} />
      <Deel id="touw-lang" uit={[0, 0.45, 0]} label="Touw in de lengte: 170 cm">
        <Blok size={[0.52, 0.02, 0.025]} pos={[0, 0.36, 0]} color={touw} r={0.01} />
        <Blok size={[0.52, 0.02, 0.025]} pos={[0, -0.005, 0]} color={touw} r={0.01} />
        <Blok size={[0.02, 0.37, 0.025]} pos={[-0.255, 0.175, 0]} color={touw} r={0.01} />
        <Blok size={[0.02, 0.37, 0.025]} pos={[0.255, 0.175, 0]} color={touw} r={0.01} />
      </Deel>
      <Deel id="touw-breed" uit={[0, 0.85, 0]} label="Touw in de breedte: 140 cm">
        <Blok size={[0.025, 0.02, 0.37]} pos={[0.08, 0.365, 0]} color={touw} r={0.01} />
        <Blok size={[0.025, 0.02, 0.37]} pos={[0.08, -0.01, 0]} color={touw} r={0.01} />
        <Blok size={[0.025, 0.37, 0.02]} pos={[0.08, 0.175, 0.18]} color={touw} r={0.01} />
        <Blok size={[0.025, 0.37, 0.02]} pos={[0.08, 0.175, -0.18]} color={touw} r={0.01} />
      </Deel>
      <group position={[-0.2, 0.36, 0.17]}>
        <Blok size={[0.06, 0.04, 0.03]} color="#9a9a9a" r={0.01} />
        <Blok size={[0.03, 0.025, 0.02]} pos={[0.035, 0.015, 0]} color="#9a9a9a" r={0.01} />
      </group>
      <Maat van={[-0.25, 0, 0.26]} naar={[0.25, 0, 0.26]} label="50 cm" />
      <Maat van={[0.34, 0, -0.175]} naar={[0.34, 0, 0.175]} label="35 cm" />
      <Maat van={[-0.34, 0, 0.175]} naar={[-0.34, 0.35, 0.175]} label="35 cm" />
    </group>
  );
}

/** EIN-10: gele afvalcontainer met 6 m³ puin. Het puin komt eruit als 6 blokken van 1 m³. */
export function Container() {
  const brokken = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 26 }, () => [(r() - 0.5) * 3, 1.2 + r() * 0.35, (r() - 0.5) * 1.5] as V3);
  }, []);
  return (
    <group>
      <Blok size={[3.6, 0.15, 1.8]} pos={[0, 0.2, 0]} color="#c9a227" r={0.03} />
      <Blok size={[3.6, 1.2, 0.08]} pos={[0, 0.8, -0.9]} color="#e6c22f" r={0.03} />
      <Blok size={[3.6, 1.2, 0.08]} pos={[0, 0.8, 0.9]} color="#e6c22f" r={0.03} />
      <Blok size={[0.08, 1.2, 1.8]} pos={[-1.8, 0.8, 0]} rot={[0, 0, 0.25]} color="#e6c22f" r={0.03} />
      <Blok size={[0.08, 1.2, 1.8]} pos={[1.8, 0.8, 0]} rot={[0, 0, -0.25]} color="#e6c22f" r={0.03} />
      <Bordje regels={['PUIN', 'inhoud 6 m³']} breed={1.4} hoog={0.6} pos={[0, 0.8, 0.95]} bg="#e6c22f" fg="#3b3a39" rand={null} />
      <Deel id="puin" uit={[0, 2.2, 0]} label="Puin 6 m³ = 6 × 1500 kg">
        {Array.from({ length: 6 }, (_, i) => (
          <Blok key={i} size={[1.08, 0.9, 0.78]} pos={[-1.1 + (i % 3) * 1.1, 0.75, i < 3 ? -0.4 : 0.4]} color="#8f9196" r={0.05} />
        ))}
        {brokken.map((p, i) => (
          <mesh key={i} position={p} material={mat(i % 2 ? '#7a7c80' : '#a3a5a8', { rough: 1 })} castShadow>
            <icosahedronGeometry args={[0.14 + (i % 3) * 0.05, 0]} />
          </mesh>
        ))}
      </Deel>
      <Bordje regels={['1 m³ puin = 1500 kg']} breed={1.6} hoog={0.3} pos={[0, 0.02, 1.7]} rot={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}
