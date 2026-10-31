// Wereld 5: Meetstation Noorderlicht staat op een besneeuwde bergrichel (2450 m). Rondom valt de rots
// steil naar beneden. In het zuiden ligt diep onder je het dal met het dorp: daar is het donker tot jij
// de systemen aanzet (wegen = Vervoer, huizen = Wonen, piste en ijsbaan = Vrije tijd). In het noorden
// grote bergtoppen. Erboven sterren en noorderlicht. Het valt zachtjes te sneeuwen.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seeded } from '../game/kit';
import { beeldNu } from '../game/kwaliteit';
import { denGeo, Lantaarns, omtrek, Rots, Sneeuwval, struikGeo, Terrein, terreinRand } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { useSpel } from '../game/store';
import { gloedTex } from '../game/texturen';
import { BuitenLevend, BuitenVast } from './buiten';
import { LANTAARNS, PLAN } from './huis';
import { systeemAan } from './licht';

type V2 = [number, number];

/** Hoogte van het dal onder de richel. */
const DAL = -38;
const R = omtrek(PLAN);
/** Rand van de richel: een paar meter buiten de buitenruimtes; daarachter de afgrond. */
const RAND: V2[] = terreinRand({ minX: R.minX, maxX: R.maxX, minZ: R.minZ + 4.6, maxZ: R.maxZ }, 2.6, 0.6, 5);

/** Bergen rond het dal: [x, z, straal, hoogte] (voet op de bodem van het dal). */
const BERGEN: [number, number, number, number][] = [
  // noord: de hoge toppen achter het station
  [-62, -112, 46, 104],
  [4, -150, 58, 126],
  [74, -122, 50, 108],
  [-132, -66, 42, 84],
  [134, -58, 42, 90],
  [-28, -78, 22, 58],
  [36, -80, 20, 52],
  // oost en west
  [-104, 12, 36, 74],
  [108, 24, 36, 78],
  // zuid: aan de overkant van het dal (met de skipiste)
  [-86, 196, 52, 92],
  [24, 228, 62, 112],
  [116, 176, 46, 88],
];
/** Het dorp in het dal (midden, straal). */
const DORP = { x: -6, z: 98, r: 34 };
const IJSBAAN = { x: 22, z: 84, rx: 7, rz: 4 };

/** Rotsen aan de rand van de richel: [x, z, grootte]. Weinig: een gladde rots kost veel driehoeken. */
const ROTSEN: [number, number, number][] = [
  [-15, 18.4, 0.8],
  [14.5, 18.6, 0.9],
  [25.4, -12, 1.0],
];

// ── Bergen: één samengevoegde vorm met sneeuwtoppen ──

function bergenGeo() {
  const delen: THREE.BufferGeometry[] = [];
  const rots = new THREE.Color('#4c5461');
  const grijs = new THREE.Color('#8f99a8');
  const sneeuw = new THREE.Color('#eef3f9');
  const SEG = 12;
  const RING = 5;
  BERGEN.forEach(([bx, bz, r, h], n) => {
    const rnd = seeded(n * 97 + 13);
    const ruis = Array.from({ length: SEG * (RING + 1) }, () => rnd());
    const top: V2 = [(rnd() - 0.5) * r * 0.35, (rnd() - 0.5) * r * 0.25];
    const g = new THREE.ConeGeometry(r, h, SEG, RING, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i);
      const vy = p.getY(i);
      const vz = p.getZ(i);
      const t = (vy + h / 2) / h;
      const ring = Math.round((1 - t) * RING);
      const hoek = (Math.atan2(vz, vx) + Math.PI * 2) % (Math.PI * 2);
      const k = Math.round(hoek / ((Math.PI * 2) / SEG)) % SEG;
      const nz = ruis[ring * SEG + k];
      const f = ring === RING ? 0.92 + nz * 0.16 : 0.75 + nz * 0.45;
      const dy = ring === 0 || ring === RING ? 0 : (nz - 0.5) * h * 0.08;
      p.setXYZ(i, bx + vx * f + top[0] * t, DAL - 1 + t * h + dy, bz + vz * f + top[1] * t);
    }
    const ng = g.toNonIndexed();
    g.dispose();
    const q = ng.attributes.position as THREE.BufferAttribute;
    const kl = new Float32Array(q.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < q.count; i += 3) {
      const cy = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3 - DAL + 1;
      const tc = cy / h;
      const lijn = 0.42 + (rnd() - 0.5) * 0.16;
      if (tc > lijn) c.copy(sneeuw).multiplyScalar(0.88 + rnd() * 0.12);
      else if (tc > lijn - 0.1) c.copy(grijs).multiplyScalar(0.85 + rnd() * 0.2);
      else c.copy(rots).multiplyScalar(0.8 + rnd() * 0.3);
      for (let j = 0; j < 3; j++) c.toArray(kl, (i + j) * 3);
    }
    ng.setAttribute('color', new THREE.BufferAttribute(kl, 3));
    ng.computeVertexNormals();
    delen.push(ng);
  });
  let n = 0;
  for (const d of delen) n += d.attributes.position.count;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  let o = 0;
  for (const d of delen) {
    pos.set(d.attributes.position.array as Float32Array, o * 3);
    nor.set(d.attributes.normal.array as Float32Array, o * 3);
    col.set(d.attributes.color.array as Float32Array, o * 3);
    o += d.attributes.position.count;
    d.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return g;
}

const kleurMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92 });
const dalMat = new THREE.MeshStandardMaterial({ color: '#cdd6e2', roughness: 1 });
const ijsMat = new THREE.MeshStandardMaterial({ color: '#b6dbef', roughness: 0.15, metalness: 0.1 });

function Bergen() {
  const geo = useMemo(bergenGeo, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={kleurMat} receiveShadow />;
}

/** De bodem van het dal: een grote sneeuwvlakte diep onder de richel. */
function Dalbodem() {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(420, 40);
    g.rotateX(-Math.PI / 2);
    g.translate(0, DAL, 60);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={dalMat} receiveShadow />;
}

// ── Dennenbos in het dal en op de hellingen (instanties: een paar tekenstappen) ──

function Dennenbos() {
  const groep = useMemo(() => {
    const rnd = seeded(41);
    const max = beeldNu.stand === 'laag' ? 170 : beeldNu.stand === 'midden' ? 300 : 420;
    const bomen: { p: V2; s: number; r: number; k: number }[] = [];
    const vrij = (x: number, z: number) =>
      BERGEN.every(([bx, bz, r]) => Math.hypot(x - bx, z - bz) > r * 0.85) &&
      Math.hypot(x - DORP.x, z - DORP.z) > DORP.r * 0.75 &&
      Math.hypot((x - IJSBAAN.x) / (IJSBAAN.rx + 4), (z - IJSBAAN.z) / (IJSBAAN.rz + 4)) > 1;
    for (let i = 0; i < 30000 && bomen.length < max; i++) {
      const a = rnd() * Math.PI * 2;
      const d = 36 + Math.pow(rnd(), 0.8) * 190;
      const x = Math.cos(a) * d;
      const z = 10 + Math.sin(a) * d * 1.1;
      if (!vrij(x, z)) continue;
      if (bomen.some((b) => Math.hypot(b.p[0] - x, b.p[1] - z) < 4.5)) continue;
      bomen.push({ p: [x, z], s: 2.2 + rnd() * 1.6, r: rnd() * 6.28, k: 0.7 + rnd() * 0.3 });
    }
    const g = new THREE.Group();
    const o = new THREE.Object3D();
    const kl = new THREE.Color();
    const den = new THREE.InstancedMesh(denGeo('#24463a', true), kleurMat, bomen.length);
    bomen.forEach((b, i) => {
      o.position.set(b.p[0], DAL, b.p[1]);
      o.rotation.set(0, b.r, 0);
      o.scale.setScalar(b.s);
      o.updateMatrix();
      den.setMatrixAt(i, o.matrix);
      den.setColorAt(i, kl.setRGB(b.k, b.k, b.k * 1.04));
    });
    den.computeBoundingSphere();
    g.add(den);
    return g;
  }, []);
  useEffect(() => () => groep.children.forEach((c) => (c as THREE.InstancedMesh).dispose()), [groep]);
  return <primitive object={groep} />;
}

/** Sneeuwduinen tegen de gevels en op de richel (laag, een tekenstap). */
function Sneeuwduinen() {
  const mesh = useMemo(() => {
    const rnd = seeded(23);
    const plekken: [number, number, number, number][] = [];
    const gevel = [
      [-16.6, -8],
      [-16.6, 6],
      [16.6, -7],
      [16.6, 6.5],
      [-12, 9.6],
      [12, 9.6],
      [-12, -10.6],
      [11, -10.6],
    ];
    for (const [x, z] of gevel) plekken.push([x, z, 1.3 + rnd() * 0.6, rnd() * 6]);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const x = Math.cos(a) * 25.2;
      const z = Math.sin(a) * 18.6;
      if (Math.abs(x) < 9 && z < -17) continue; // niet onder het platform
      plekken.push([x, z, 0.9 + rnd() * 0.9, rnd() * 6]);
    }
    const im = new THREE.InstancedMesh(struikGeo('#e9eff6'), kleurMat, plekken.length);
    const o = new THREE.Object3D();
    plekken.forEach(([x, z, s, r], i) => {
      o.position.set(x, -0.08, z);
      o.rotation.set(0, r, 0);
      o.scale.set(s * 1.9, s * 0.26, s * 1.2);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    });
    im.receiveShadow = true;
    im.computeBoundingSphere();
    return im;
  }, []);
  useEffect(() => () => mesh.dispose(), [mesh]);
  return <primitive object={mesh} />;
}

// ── Het dorp in het dal ──

/** Huisjes met een sneeuwdak (twee tekenstappen voor het hele dorp). */
function Dorp() {
  const { huizen, daken, ramen } = useMemo(() => {
    const rnd = seeded(91);
    const plekken: { x: number; z: number; w: number; d: number; h: number; r: number }[] = [];
    for (let i = 0; i < 2000 && plekken.length < 64; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * DORP.r;
      const x = DORP.x + Math.cos(a) * d;
      const z = DORP.z + Math.sin(a) * d * 0.8;
      const w = 5 + rnd() * 4;
      const dd = 4 + rnd() * 3;
      if (plekken.some((p) => Math.hypot(p.x - x, p.z - z) < 8)) continue;
      plekken.push({ x, z, w, d: dd, h: 3.5 + rnd() * 2.5, r: rnd() * Math.PI });
    }
    const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const dak = new THREE.CylinderGeometry(0, 0.75, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0);
    const huizen = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: '#8a6a52', roughness: 0.9 }), plekken.length);
    const daken = new THREE.InstancedMesh(dak, new THREE.MeshStandardMaterial({ color: '#eef3f8', roughness: 1 }), plekken.length);
    const o = new THREE.Object3D();
    const ramen: number[] = [];
    plekken.forEach((p, i) => {
      o.position.set(p.x, DAL, p.z);
      o.rotation.set(0, p.r, 0);
      o.scale.set(p.w, p.h, p.d);
      o.updateMatrix();
      huizen.setMatrixAt(i, o.matrix);
      o.position.set(p.x, DAL + p.h, p.z);
      o.scale.set(p.w * 1.45, p.h * 0.6, p.d * 1.45);
      o.updateMatrix();
      daken.setMatrixAt(i, o.matrix);
      // ramen aan de kant van de richel (+z naar het station toe is −z)
      const n = 2 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const lx = (k / (n - 1 || 1) - 0.5) * p.w * 0.7;
        const c = Math.cos(p.r);
        const s = Math.sin(p.r);
        for (const kant of [-1, 1]) ramen.push(p.x + lx * c + kant * (p.d / 2 + 0.05) * s, DAL + p.h * 0.45, p.z - lx * s + kant * (p.d / 2 + 0.05) * c);
      }
    });
    huizen.computeBoundingSphere();
    daken.computeBoundingSphere();
    return { huizen, daken, ramen };
  }, []);
  useEffect(
    () => () => {
      huizen.dispose();
      daken.dispose();
    },
    [huizen, daken],
  );
  return (
    <>
      <primitive object={huizen} />
      <primitive object={daken} />
      <DalLichten id="wonen" punten={ramen} kleur="#ffcf7a" grootte={2.2} />
    </>
  );
}

/** De weg door het dal met lantaarns (Vervoer). */
function wegPunten() {
  const p: number[] = [];
  for (let t = 0; t <= 1.0001; t += 1 / 26) {
    const x = -150 + t * 300;
    const z = 120 + Math.sin(t * 5.2) * 26 - t * 30;
    p.push(x, DAL + 4, z);
  }
  // zijweg naar de voet van de richel
  for (let t = 0; t <= 1.0001; t += 1 / 9) p.push(-6 + Math.sin(t * 3) * 6, DAL + 4, 100 - t * 64);
  return p;
}

/** Skipiste en ijsbaan (Vrije tijd). De piste ligt op de helling van de berg aan de overkant van het dal. */
function vrijeTijdPunten() {
  const p: number[] = [];
  const [bx, bz, r, h] = BERGEN[10];
  // van de voet (dicht bij het dal) omhoog naar de top; twee rijen lampen links en rechts van de piste
  for (let d = r * 0.92; d > r * 0.35; d -= 3.2) {
    const y = DAL - 1 + h * (1 - d / (r * 0.95)) + 1.5;
    for (const dx of [-3.5, 3.5]) p.push(bx + dx, y, bz - d);
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    p.push(IJSBAAN.x + Math.cos(a) * IJSBAAN.rx, DAL + 2.5, IJSBAAN.z + Math.sin(a) * IJSBAAN.rz);
  }
  return p;
}

/** Lichtjes in het dal die aangaan als het systeem werkt (gaan zacht aan). Ze schijnen door de mist. */
function DalLichten({ id, punten, kleur, grootte }: { id: string; punten: number[]; kleur: string; grootte: number }) {
  const aan = useSpel((s) => systeemAan(s.kluizen, s.wereld, id));
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(punten, 3));
    return g;
  }, [punten]);
  const m = useMemo(
    () => new THREE.PointsMaterial({ map: gloedTex(), color: kleur, size: grootte, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }),
    [kleur, grootte],
  );
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    m.opacity += ((aan ? 1 : 0) - m.opacity) * Math.min(1, dt * 0.8);
    if (ref.current) ref.current.visible = m.opacity > 0.01;
  });
  useEffect(() => () => geo.dispose(), [geo]);
  return <points ref={ref} geometry={geo} material={m} frustumCulled={false} />;
}

function IJsbaan() {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 28);
    g.rotateX(-Math.PI / 2);
    g.scale(IJSBAAN.rx, 1, IJSBAAN.rz);
    g.translate(IJSBAAN.x, DAL + 0.05, IJSBAAN.z);
    return g;
  }, []);
  return <mesh geometry={geo} material={ijsMat} />;
}

// ── Lucht: sterren en noorderlicht ──

function Sterren() {
  const { geo, materiaal } = useMemo(() => {
    const rnd = seeded(77);
    const p: number[] = [];
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI * 2;
      const h = 0.08 + Math.pow(rnd(), 0.7) * 1.3;
      const r = 300;
      p.push(Math.cos(a) * Math.cos(h) * r, Math.sin(h) * r * 0.8 + 10, Math.sin(a) * Math.cos(h) * r);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    const materiaal = new THREE.PointsMaterial({ color: '#e6efff', size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false, fog: false });
    return { geo, materiaal };
  }, []);
  return <points geometry={geo} material={materiaal} frustumCulled={false} renderOrder={-2} />;
}

function Noorderlicht() {
  const klaar = useSpel((s) => s.fase === 'klaar');
  const { geo, materiaal } = useMemo(() => {
    const p: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    const N = 90;
    let basis = 0;
    [
      [-190, 48, 46, 0],
      [-220, 64, 56, 2.1],
      [-170, 40, 32, 4.2],
    ].forEach(([z0, y0, hoog, f]) => {
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const x = -280 + t * 560;
        const z = z0 + Math.sin(x * 0.009 + f) * 34 + Math.sin(x * 0.023 + f * 2) * 10;
        const y = y0 + Math.sin(x * 0.014 + f) * 9;
        p.push(x, y, z, x, y + hoog, z - 8);
        uv.push(t, 0, t, 1);
        if (i < N) {
          const a = basis + i * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      basis += (N + 1) * 2;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const materiaal = new THREE.ShaderMaterial({
      uniforms: { uTijd: { value: 0 }, uSterk: { value: 0.6 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying float vX;
        void main() { vUv = uv; vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTijd; uniform float uSterk; varying vec2 vUv; varying float vX;
        void main() {
          float golf = sin(vX * 0.035 + uTijd * 0.3) * 0.5 + 0.5;
          float streep = sin(vX * 0.13 - uTijd * 0.55 + sin(vX * 0.017 + uTijd * 0.17) * 4.0) * 0.5 + 0.5;
          streep = 0.35 + 0.65 * pow(streep, 2.5);
          float onder = smoothstep(0.0, 0.1, vUv.y);
          float boven = 1.0 - smoothstep(0.2, 1.0, vUv.y);
          float zij = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
          vec3 groen = vec3(0.22, 1.0, 0.6);
          vec3 paars = vec3(0.66, 0.34, 1.0);
          vec3 kl = mix(groen, paars, smoothstep(0.2, 0.9, vUv.y));
          float a = onder * boven * zij * streep * (0.45 + 0.55 * golf) * uSterk;
          gl_FragColor = vec4(kl * a, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
    });
    return { geo, materiaal };
  }, []);
  useFrame(({ clock }, dt) => {
    materiaal.uniforms.uTijd.value = clock.getElapsedTime();
    // als de helikopter mag vliegen, wordt het noorderlicht feller
    const doel = klaar ? 0.95 : 0.6;
    materiaal.uniforms.uSterk.value += (doel - materiaal.uniforms.uSterk.value) * Math.min(1, dt * 0.5);
  });
  return <mesh geometry={geo} material={materiaal} renderOrder={-1} frustumCulled={false} />;
}

/** Landschap rondom het meetstation. */
export function Wereld5Omgeving() {
  const weg = useMemo(wegPunten, []);
  const vrij = useMemo(vrijeTijdPunten, []);
  const n = beeldNu.stand === 'laag' ? 500 : beeldNu.stand === 'midden' ? 900 : 1500;
  return (
    <group name="w5-omgeving">
      <Statisch>
        <Terrein plan={PLAN} vorm={RAND} boven="sneeuw" bovenKleur="#e6edf5" lagen={['#6c717a', '#5a5f68', '#4b4f57', '#3c3f46', '#30333a']} diepte={-DAL + 1} stenen="#8a9099" />
        {ROTSEN.map(([x, z, s], i) => (
          <group key={i}>
            <Rots pos={[x, 0, z]} s={s} seed={i + 2} kleur="#656b75" rot={i * 1.3} />
            <mesh position={[x, s * 0.42, z]} scale={[s * 0.72, s * 0.2, s * 0.6]} rotation={[0, i * 1.3, 0]}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color="#eef3f8" roughness={1} flatShading />
            </mesh>
          </group>
        ))}
        <BuitenVast />
      </Statisch>
      <Dalbodem />
      <Bergen />
      <Dennenbos />
      <Sneeuwduinen />
      <Dorp />
      <IJsbaan />
      <DalLichten id="vervoer" punten={weg} kleur="#ffb347" grootte={2.6} />
      <DalLichten id="vrijetijd" punten={vrij} kleur="#bfe3ff" grootte={2.4} />
      <Lantaarns punten={LANTAARNS} kleur="#ffc98a" />
      <BuitenLevend />
      <Sneeuwval gebied={[0, 0, 62, 50]} n={n} hoogte={16} grootte={0.08} />
      <Sterren />
      <Noorderlicht />
    </group>
  );
}
