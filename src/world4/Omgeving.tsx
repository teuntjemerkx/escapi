// Wereld 4: Winkelcentrum De Honderd staat 's avonds in de stad (blauw uur). Een uitgesneden stuk stad rond het gebouw:
// aan de uitgang (−z) het Stationsplein met bushaltes, bomen, lantaarns en een draaimolen; aan de startkant (+z) de straat met
// de inrit van de parkeergarage; opzij straten met verlichte flats. Op het dakterras (verdieping 1) staat het grote reuzenrad,
// dat pas gaat draaien na het goede antwoord bij het loket.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { Lantaarns, Terrein, terreinRand } from '../game/natuur';
import { useOpgelost } from '../game/opgelost';
import { TegelVlak } from '../game/stad';
import { Statisch } from '../game/statisch';
import { DoekAtlas } from './atlas';
import { DRAAIMOLEN, PLAN, RAD } from './huis';
import { Billboard, Bolboom, Bushokje, Flat, Neon, Palm } from './stad4';

type V2 = [number, number];
type V3 = [number, number, number];

/** Rand van het stuk stad (golvend, met ronde hoeken). */
const STAD = { minX: -34, maxX: 34, minZ: -44, maxZ: 33 };
const STOEP_H = 0.1;

/** Stoepen en pleinen [x1, x2, z1, z2]. */
const STOEPEN: [number, number, number, number][] = [
  [-19, 19, 24, 27], // startkant, langs de straat
  [-19, -16, -24, 24], // westkant
  [16, 19, -24, 24], // oostkant
  [-19, 19, -36, -24], // stationsplein
  [-34, -26, -44, 33], // overkant westweg
  [26, 34, -44, 33], // overkant oostweg
  [-26, 26, 33, 34], // overkant noordstraat (rand)
];

const LANTAARNS: V2[] = [
  [-10, 26.4],
  [10, 26.4],
  [17.6, 12],
  [17.6, -8],
  [-17.6, 4],
  [-15, -30],
  [-6, -34.6],
  [9, -34.6],
  [15, -27],
  [28, -6],
];

/** Flats rondom: [x, z, breedte, hoogte, diepte, draaiing, reclame?, kleur?]. */
const FLATS: [number, number, number, number, number, number, string?, string?][] = [
  [31, 16, 10, 18, 6, -Math.PI / 2, 'HOTEL', '#2ee6ff'],
  [31, 3, 10, 13, 6, -Math.PI / 2],
  [31, -10, 10, 22, 6, -Math.PI / 2, 'BIOSCOOP', '#ff4fa3'],
  [31, -24, 10, 15, 6, -Math.PI / 2],
  [31, -37, 10, 19, 6, -Math.PI / 2],
  [-31, 16, 10, 16, 6, Math.PI / 2],
  [-31, 3, 10, 21, 6, Math.PI / 2, 'PIZZA', '#ffe14d'],
  [-31, -10, 10, 14, 6, Math.PI / 2],
  [-31, -24, 10, 19, 6, Math.PI / 2],
  [-31, -37, 10, 13, 6, Math.PI / 2],
  [-12, -41.5, 10, 17, 5, 0],
  [0, -41.5, 10, 24, 5, 0, 'STATION', '#2ee6ff'],
  [12, -41.5, 10, 15, 5, 0],
];

export function Wereld4Omgeving() {
  const rand = useMemo(() => terreinRand(STAD, 4, 0.35, 4), []);
  return (
    <>
      <Statisch>
        <DoekAtlas>
          <Terrein plan={PLAN} vorm={rand} boven="asfalt" bovenKleur="#383b43" lagen={['#4b4e57', '#3f3a3e', '#352c2b', '#271f1e']} diepte={3.6} stenen="#5d5a60" />
          {STOEPEN.map(([x1, x2, z1, z2], i) => (
            <Stoep key={i} x1={x1} x2={x2} z1={z1} z2={z2} plein={i === 3} />
          ))}
          <Wegmarkering />
          <Stationsplein />
          <Parkeergarage />
          {[-14, -6, 6, 14].map((x, i) => (
            <Palm key={x} pos={[x, STOEP_H, 25.6]} rot={i} s={0.9} />
          ))}
          {[-10, 2, 14, 26].map((z, i) => (
            <Bolboom key={`w${z}`} pos={[-30, STOEP_H, z - 6]} s={0.85 + (i % 2) * 0.1} />
          ))}
          {[-10, 2, 14, 26].map((z, i) => (
            <Bolboom key={`o${z}`} pos={[30, STOEP_H, z - 6]} s={0.85 + (i % 2) * 0.1} />
          ))}
          <Billboard pos={[29.6, STOEP_H, 24]} rot={-Math.PI / 2} b={6} h={3} hoogte={4} motief="kortingsdag" />
          <Billboard pos={[-29.6, STOEP_H, -30]} rot={Math.PI / 2} b={6} h={3} hoogte={4} motief="uitverkoop" />
          {FLATS.map(([x, z, b, h, d, rot, reclame, kleur], i) => (
            <group key={i} position={[x, 0, z]} rotation={[0, rot, 0]}>
              <Flat pos={[0, 0, 0]} b={b} h={h} d={d} reclame={reclame} kleur={kleur} />
            </group>
          ))}
          {/* het reuzenrad op het dakterras: bokken en voet (het rad zelf draait hieronder) */}
          <RadVoet />
          <group position={[DRAAIMOLEN[0], STOEP_H, DRAAIMOLEN[1]]}>
            <Cil r={2.4} h={0.32} pos={[0, 0.16, 0]} color="#e9e3d7" seg={28} />
            <Cil r={2.25} h={0.05} pos={[0, 0.34, 0]} color="#c96a8a" seg={28} />
          </group>
        </DoekAtlas>
      </Statisch>
      <Lantaarns punten={LANTAARNS} kleur="#ffd9a0" />
      <GrootRad />
      <Draaimolen />
      <RijdendeAuto as="x" lijn={29.2} snelheid={7} kleur="#2ee6ff" start={0} />
      <RijdendeAuto as="z" lijn={-23.0} snelheid={6} kleur="#ffd23f" start={10} />
    </>
  );
}

// ─────────────────────────── Straat, stoep en plein ───────────────────────────

function Stoep({ x1, x2, z1, z2, plein = false }: { x1: number; x2: number; z1: number; z2: number; plein?: boolean }) {
  const w = x2 - x1;
  const d = z2 - z1;
  return (
    <group position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]}>
      <Blok size={[w, STOEP_H, d]} pos={[0, STOEP_H / 2, 0]} color="#8f8a8e" r={0.03} shadow={false} />
      <TegelVlak w={w - 0.2} d={d - 0.2} y={STOEP_H + 0.003} kleur={plein ? '#b8aea2' : '#a9a3a8'} voeg={plein ? '#968c80' : '#8d878c'} tegel={plein ? 0.8 : 0.6} />
    </group>
  );
}

/** Witte strepen: middenlijnen en zebrapaden. */
function Wegmarkering() {
  const wit = '#e9e6dc';
  const strepen: { p: V3; s: V3 }[] = [];
  for (let x = -24; x < 26; x += 4) strepen.push({ p: [x, 0.02, 30.3], s: [2, 0.02, 0.16] });
  for (let z = -42; z < 30; z += 4) {
    strepen.push({ p: [-22.5, 0.02, z], s: [0.16, 0.02, 2] });
    strepen.push({ p: [22.5, 0.02, z], s: [0.16, 0.02, 2] });
  }
  for (let i = 0; i < 6; i++) strepen.push({ p: [-20.8 - i * 0.95 + 4.5, 0.02, -30], s: [0.5, 0.02, 3.0] });
  for (let i = 0; i < 6; i++) strepen.push({ p: [19.8 + i * 0.95, 0.02, -30], s: [0.5, 0.02, 3.0] });
  return (
    <>
      {strepen.map((s, i) => (
        <Blok key={i} size={s.s} pos={s.p} color={wit} r={0} shadow={false} />
      ))}
    </>
  );
}

/** Stationsplein voor de uitgang: bushaltes, een bus, bomen, bankjes, fietsen en een banier van de Kortingsdag. */
function Stationsplein() {
  const y = STOEP_H;
  return (
    <>
      <Bushokje pos={[-9, y, -34.4]} />
      <Bushokje pos={[-3.2, y, -34.4]} />
      {/* bus langs het plein */}
      <group position={[-6, 0, -37.6]} rotation={[0, Math.PI / 2, 0]}>
        <Blok size={[2.5, 2.8, 11]} pos={[0, 1.7, 0]} color="#e8e4da" r={0.2} />
        <Blok size={[2.55, 1.0, 10.4]} pos={[0, 2.2, 0]} color="#1f2a38" r={0.1} rough={0.25} />
        <Blok size={[2.56, 0.35, 11.02]} pos={[0, 0.75, 0]} color="#2ec4b6" r={0.08} />
        <Neon tekst={['Station']} b={1.8} h={0.4} pos={[0, 2.85, 5.52]} kleur="#ffe14d" rand={false} />
        {[-3.6, 3.6].map((z) =>
          [-1.2, 1.2].map((x) => <Cil key={`${x}${z}`} r={0.5} h={0.4} pos={[x, 0.5, z]} rot={[0, 0, Math.PI / 2]} color="#1b1b1b" seg={14} />),
        )}
      </group>
      {[-15.5, -12, 12, 15.5].map((x, i) => (
        <Bolboom key={x} pos={[x, y, -27 - (i % 2) * 5]} s={1.1} />
      ))}
      {[-14, 14].map((x) => (
        <group key={x} position={[x, y, -33]}>
          <Blok size={[1.8, 0.08, 0.45]} pos={[0, 0.45, 0]} color="#8a6545" r={0.02} />
          <Blok size={[1.8, 0.35, 0.06]} pos={[0, 0.7, -0.2]} color="#8a6545" r={0.02} />
        </group>
      ))}
      {/* banier met de kortingsdag boven het plein */}
      {[-9.5, 9.5].map((x) => (
        <Cil key={x} r={0.08} h={6.2} pos={[x, y + 3.1, -26]} color="#2b2f33" seg={8} />
      ))}
      <Blok size={[19, 0.05, 0.05]} pos={[0, y + 6.1, -26]} color="#2b2f33" r={0} />
      <Neon tekst={['Morgen: KORTINGSDAG!']} b={8.5} h={1.1} pos={[0, y + 5.2, -26]} rot={[0, 0, 0]} kleur="#ff4fa3" />
    </>
  );
}

/** Inrit van de parkeergarage aan de startkant (onder het gebouw door): een helling naar beneden met een bord. */
function Parkeergarage() {
  return (
    <group position={[-23.5, 0, 12]}>
      <Blok size={[0.25, 2.8, 0.25]} pos={[2.4, 1.4, 6]} color="#2f3634" r={0} />
      <Blok size={[1.4, 1.4, 0.12]} pos={[2.4, 3.2, 6]} color="#15131f" r={0.04} />
      <Neon tekst={['P']} b={1.0} h={1.0} pos={[2.4, 3.2, 6.08]} kleur="#2ee6ff" />
    </group>
  );
}

// ─────────────────────────── Reuzenrad (dakterras) en draaimolen ───────────────────────────

/** Bokken en voet van het reuzenrad (vast). Het wiel staat langs z: je ziet het rond vanuit de etalagestraat en het terras. */
function RadVoet() {
  const [x, z] = RAD.pos;
  return (
    <group position={[x, RAD.y, z]} rotation={[0, Math.PI / 2, 0]}>
      <Blok size={[6.6, 0.35, 2.8]} pos={[0, 0.175, 0]} color="#3b3f46" r={0.05} />
      {[-1.05, 1.05].map((dz) => (
        <group key={dz} position={[0, 0, dz]}>
          {[-1, 1].map((k) => (
            <Blok key={k} size={[0.3, 6.0, 0.3]} pos={[k * 1.45, RAD.hoogte / 2 + 0.1, 0]} rot={[0, 0, k * 0.5]} color="#e9e3d7" r={0.06} />
          ))}
          <Blok size={[3.6, 0.22, 0.26]} pos={[0, 1.9, 0]} color="#e9e3d7" r={0.05} />
        </group>
      ))}
      <Cil r={0.3} h={2.6} pos={[0, RAD.hoogte, 0]} rot={[Math.PI / 2, 0, 0]} color="#9aa3a8" seg={12} />
    </group>
  );
}

const GONDEL_KLEUREN = ['#e5675a', '#f2a64a', '#ffc94d', '#2ec4b6', '#5aa9ff', '#8b6bb5', '#e86f8a', '#6aa84f', '#e5675a', '#f2a64a', '#5aa9ff', '#2ec4b6'];

/** Het grote reuzenrad. Het staat stil tot het goede antwoord bij het loket (EXP-01); dan draait het en zitten er mensen in. */
function GrootRad() {
  const af = useOpgelost('O4-EXP-01');
  const rad = useRef<THREE.Group>(null);
  const hoek = useRef(0);
  const snel = useRef(af ? 0.16 : 0);
  const mensen = useRef(af ? 1 : 0);
  const R = RAD.straal;
  const n = GONDEL_KLEUREN.length;
  const { spaken, gondels, hoofden } = useMemo(() => {
    const delen: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++)
      for (const dz of [-0.6, 0.6]) {
        const g = new THREE.BoxGeometry(R * 2, 0.08, 0.08);
        g.rotateZ((i * Math.PI) / 6);
        g.translate(0, 0, dz);
        delen.push(g);
      }
    for (const dz of [-0.6, 0.6]) delen.push(new THREE.TorusGeometry(R, 0.1, 6, 56).translate(0, 0, dz));
    const spaken = new THREE.Mesh(mergeGeometries(delen, false), mat('#ece6da'));
    spaken.castShadow = true;
    const gondels = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.8, 1.05), new THREE.MeshStandardMaterial({ roughness: 0.6 }), n);
    const k = new THREE.Color();
    GONDEL_KLEUREN.forEach((c, i) => gondels.setColorAt(i, k.set(c)));
    gondels.castShadow = true;
    const hoofden = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), mat('#f0c9a0'), n);
    for (const m of [gondels, hoofden]) m.frustumCulled = false;
    return { spaken, gondels, hoofden };
  }, [R, n]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    snel.current += ((af ? 0.16 : 0) - snel.current) * Math.min(1, dt * 0.8);
    mensen.current += ((af ? 1 : 0) - mensen.current) * Math.min(1, dt * 2);
    hoek.current += snel.current * dt;
    if (rad.current) rad.current.rotation.z = hoek.current;
    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n + hoek.current;
      o.position.set(Math.cos(a) * R, Math.sin(a) * R - 0.62, 0);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      gondels.setMatrixAt(i, o.matrix);
      o.position.y += 0.5;
      o.scale.setScalar(Math.max(0.0001, mensen.current * (i % 3 === 2 ? 0 : 1)));
      o.updateMatrix();
      hoofden.setMatrixAt(i, o.matrix);
    }
    gondels.instanceMatrix.needsUpdate = true;
    hoofden.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={[RAD.pos[0], RAD.y + RAD.hoogte, RAD.pos[1]]} rotation={[0, Math.PI / 2, 0]}>
      <group ref={rad}>
        <mesh position={[0, 0, 0.68]} material={mat('#ff4fa3', { emissive: '#ff4fa3' })}>
          <torusGeometry args={[R + 0.08, 0.05, 4, 56]} />
        </mesh>
        <mesh position={[0, 0, -0.68]} material={mat('#2ee6ff', { emissive: '#2ee6ff' })}>
          <torusGeometry args={[R * 0.55, 0.05, 4, 40]} />
        </mesh>
        <primitive object={spaken} />
      </group>
      <primitive object={gondels} />
      <primitive object={hoofden} />
    </group>
  );
}

/** Draaimolen met paardjes die op en neer gaan (op het stationsplein, je ziet hem door het glas naast de uitgang). */
function Draaimolen() {
  const ref = useRef<THREE.Group>(null);
  const n = 6;
  const paarden = useMemo(() => {
    const lijf = new THREE.BoxGeometry(0.32, 0.42, 0.95);
    const kop = new THREE.BoxGeometry(0.24, 0.42, 0.3);
    kop.translate(0, 0.3, 0.45);
    const stang = new THREE.CylinderGeometry(0.035, 0.035, 2.9, 6);
    stang.translate(0, 0.9, 0);
    const geo = mergeGeometries([lijf, kop, stang], false);
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.6 }), n);
    const k = new THREE.Color();
    ['#fbf6ec', '#c9a372', '#3b3a39', '#5aa9ff', '#e5675a', '#ffc94d'].forEach((c, i) => im.setColorAt(i, k.set(c)));
    im.frustumCulled = false;
    im.castShadow = true;
    return im;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
    const t = clock.getElapsedTime();
    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n;
      o.position.set(Math.cos(a) * 1.65, 1.0 + Math.sin(t * 2 + i) * 0.18, Math.sin(a) * 1.65);
      o.rotation.set(0, -a, 0);
      o.updateMatrix();
      paarden.setMatrixAt(i, o.matrix);
    }
    paarden.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={[DRAAIMOLEN[0], STOEP_H + 0.36, DRAAIMOLEN[1]]}>
      <group ref={ref}>
        <Cil r={0.22} h={3.2} pos={[0, 1.6, 0]} color="#ffd21f" seg={12} />
        <mesh position={[0, 3.75, 0]} castShadow material={mat('#e86f8a', { flat: true })}>
          <coneGeometry args={[2.5, 1.0, 12]} />
        </mesh>
        <Cil r={2.45} h={0.3} pos={[0, 3.15, 0]} color="#fbf6ec" seg={24} />
        <mesh position={[0, 3.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#ffe14d', { emissive: '#ffcf4a' })}>
          <torusGeometry args={[2.46, 0.05, 4, 40]} />
        </mesh>
        <primitive object={paarden} />
      </group>
    </group>
  );
}

/** Auto die over een straat langs het centrum rijdt, met koplampen. `as` = richting van de straat, `lijn` = de andere coördinaat. */
function RijdendeAuto({ as, lijn, snelheid, kleur, start }: { as: 'x' | 'z'; lijn: number; snelheid: number; kleur: string; start: number }) {
  const ref = useRef<THREE.Group>(null);
  const [van, tot] = as === 'x' ? [-26, 26] : [-44, 33];
  const rnd = useMemo(() => seeded(Math.round(lijn * 10)), [lijn]);
  const t = useRef(van + ((start + rnd() * 10) % (tot - van)));
  useFrame((_, dt) => {
    t.current += snelheid * dt;
    if (t.current > tot) t.current = van;
    if (t.current < van) t.current = tot;
    if (ref.current) {
      if (as === 'x') ref.current.position.x = t.current;
      else ref.current.position.z = t.current;
    }
  });
  const rotY = as === 'x' ? (snelheid > 0 ? Math.PI / 2 : -Math.PI / 2) : snelheid > 0 ? 0 : Math.PI;
  return (
    <group ref={ref} position={as === 'x' ? [t.current, 0, lijn] : [lijn, 0, t.current]} rotation={[0, rotY, 0]}>
      <Blok size={[1.75, 0.55, 3.9]} pos={[0, 0.5, 0]} color={kleur} r={0.18} shadow={false} />
      <Blok size={[1.55, 0.5, 2.0]} pos={[0, 0.98, -0.2]} color="#2a3138" r={0.16} rough={0.25} shadow={false} />
      <Blok size={[1.5, 0.12, 0.06]} pos={[0, 0.6, 1.96]} color="#fff6d0" r={0.02} shadow={false} />
      <mesh position={[0, 0.03, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshBasicMaterial color="#fff2c0" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export type { V2 };
