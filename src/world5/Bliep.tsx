// Wereld 5 – het maatje: Bliep, een kleine ronde robot-drone van het meetstation.
// Een schermgezicht met twee grote ogen (die knipperen, en soms een mini-grafiekje), twee draaiende
// propellers, een antennetje met een lampje en een wollen muts en sjaal tegen de kou in de bergen.
// Ongeveer 1 m hoog, midden rond de oorsprong, kijkt naar +z. Ruim onder 3000 driehoeken.
// De vaste delen zijn samengevoegd (kleur per hoekpunt): Bliep kost maar 7 tekenstappen.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V3 = [number, number, number];

const matrix = (pos: V3, rot: V3 = [0, 0, 0], schaal: V3 = [1, 1, 1]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...schaal));

/** Eén onderdeel: vorm met kleur per hoekpunt, op zijn plek gezet. */
function deel(g: THREE.BufferGeometry, kleur: string, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], schaal: V3 = [1, 1, 1]) {
  const uit = (g.index ? g.toNonIndexed() : g).applyMatrix4(matrix(pos, rot, schaal));
  for (const naam of Object.keys(uit.attributes)) if (naam !== 'position' && naam !== 'normal') uit.deleteAttribute(naam);
  const c = new THREE.Color(kleur);
  const n = uit.attributes.position.count;
  const kl = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.toArray(kl, i * 3);
  uit.setAttribute('color', new THREE.BufferAttribute(kl, 3));
  return uit;
}
const samen = (delen: THREE.BufferGeometry[]) => mergeGeometries(delen)!;

const vastMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.1, emissive: '#5f8fc8', emissiveIntensity: 0.16 });
const lichtMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
const bladMat = new THREE.MeshStandardMaterial({ color: '#f2c230', roughness: 0.5 });
const lampMat = new THREE.MeshBasicMaterial({ color: '#ff4d4d', toneMapped: false });

const LIJF = '#e9f2fb';
const METAAL = '#3d4a5a';
const WOL = '#f4f6f8';
const SCHERM_Z = 0.345;
const MUTS = matrix([0, 0.17, -0.02], [-0.12, 0, 0.06]);
const ANTENNE = matrix([-0.2, 0.3, -0.03], [0, 0, 0.45]);

function vasteDelen() {
  const d: THREE.BufferGeometry[] = [];
  // lijf en de rand om het scherm
  d.push(deel(new THREE.SphereGeometry(0.36, 22, 14), LIJF, [0, 0, 0], [0, 0, 0], [1, 0.94, 1]));
  d.push(deel(new THREE.CylinderGeometry(0.245, 0.245, 0.06, 26), '#5a6d82', [0, 0.03, SCHERM_Z], [Math.PI / 2, 0, 0]));
  // wollen muts met omslag en pompon
  d.push(deel(new THREE.SphereGeometry(0.3, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), '#2f6fb6').applyMatrix4(MUTS));
  d.push(deel(new THREE.TorusGeometry(0.29, 0.045, 6, 20), WOL, [0, 0.02, 0], [Math.PI / 2, 0, 0]).applyMatrix4(MUTS));
  d.push(deel(new THREE.IcosahedronGeometry(0.075, 1), WOL, [0, 0.33, 0]).applyMatrix4(MUTS));
  // sjaal met een slip en twee witte streepjes
  d.push(deel(new THREE.TorusGeometry(0.29, 0.06, 6, 20), '#d6402b', [0, -0.2, 0], [Math.PI / 2 + 0.08, 0, 0]));
  d.push(deel(new THREE.BoxGeometry(0.1, 0.24, 0.05), '#d6402b', [0.16, -0.33, 0.27], [0.2, 0, 0.2]));
  d.push(deel(new THREE.BoxGeometry(0.105, 0.025, 0.02), WOL, [0.165, -0.27, 0.3], [0.2, 0, 0.2]));
  d.push(deel(new THREE.BoxGeometry(0.105, 0.025, 0.02), WOL, [0.18, -0.36, 0.29], [0.2, 0, 0.2]));
  // antennetje
  d.push(deel(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), METAAL, [0, 0.12, 0]).applyMatrix4(ANTENNE));
  // propellers: armpje, ring en as
  for (const x of [-0.5, 0.5]) {
    d.push(deel(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), METAAL, [x - Math.sign(x) * 0.13, 0.08, -0.02], [0, 0, Math.PI / 2]));
    d.push(deel(new THREE.TorusGeometry(0.16, 0.03, 6, 20), '#9cc6ea', [x, 0.08, -0.02], [Math.PI / 2, 0, 0]));
    d.push(deel(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), METAAL, [x, 0.08, -0.02]));
  }
  // straalmotortje onderaan
  d.push(deel(new THREE.CylinderGeometry(0.1, 0.07, 0.08, 14), METAAL, [0, -0.36, 0]));
  return samen(d);
}

/** Delen die zelf licht geven: scherm, blosjes, glimlach en de straal onderaan. */
function lichteDelen() {
  const d: THREE.BufferGeometry[] = [];
  d.push(deel(new THREE.CircleGeometry(0.215, 26), '#0d1a2c', [0, 0.03, SCHERM_Z + 0.032]));
  for (const x of [-0.15, 0.15]) d.push(deel(new THREE.CircleGeometry(0.025, 10), '#ff9fbd', [x, -0.03, SCHERM_Z + 0.035], [0, 0, 0], [1.3, 0.8, 1]));
  d.push(deel(new THREE.RingGeometry(0.035, 0.05, 14, 1, 0, Math.PI), '#8ff7ff', [0, -0.045, SCHERM_Z + 0.036], [0, 0, Math.PI]));
  d.push(deel(new THREE.ConeGeometry(0.065, 0.12, 12), '#7fe8ff', [0, -0.45, 0], [Math.PI, 0, 0]));
  return samen(d);
}

function ogenVorm() {
  const d: THREE.BufferGeometry[] = [];
  for (const x of [-0.085, 0.085]) {
    d.push(deel(new THREE.CircleGeometry(0.056, 18), '#8ff7ff', [x, 0, 0], [0, 0, 0], [1, 1.25, 1]));
    d.push(deel(new THREE.CircleGeometry(0.016, 10), '#ffffff', [x + 0.018, 0.026, 0.001]));
  }
  return samen(d);
}

/** Mini-grafiekje: drie staafjes die groeien, op een lijntje. */
function grafiekVorm() {
  const d: THREE.BufferGeometry[] = [];
  [0.05, 0.08, 0.12].forEach((h, i) => d.push(deel(new THREE.PlaneGeometry(0.05, h), '#6ff0b0', [-0.08 + i * 0.08, h / 2, 0])));
  d.push(deel(new THREE.PlaneGeometry(0.26, 0.012), '#8ff7ff', [0, -0.006, 0.001]));
  return samen(d);
}

function bladVorm() {
  const b = new THREE.BoxGeometry(0.28, 0.012, 0.05);
  b.rotateY(Math.PI / 2);
  return mergeGeometries([new THREE.BoxGeometry(0.28, 0.012, 0.05), b])!;
}

interface Vormen {
  vast: THREE.BufferGeometry;
  licht: THREE.BufferGeometry;
  ogen: THREE.BufferGeometry;
  grafiek: THREE.BufferGeometry;
  blad: THREE.BufferGeometry;
  lamp: THREE.BufferGeometry;
}
let vormen: Vormen | null = null;
function bliepVormen(): Vormen {
  if (!vormen) {
    const lamp = new THREE.SphereGeometry(0.044, 10, 8);
    lamp.translate(0, 0.26, 0);
    lamp.applyMatrix4(ANTENNE);
    vormen = { vast: vasteDelen(), licht: lichteDelen(), ogen: ogenVorm(), grafiek: grafiekVorm(), blad: bladVorm(), lamp };
  }
  return vormen;
}

export function Bliep() {
  const v = useMemo(bliepVormen, []);
  const ogen = useRef<THREE.Mesh>(null);
  const grafiek = useRef<THREE.Mesh>(null);
  const links = useRef<THREE.Mesh>(null);
  const rechts = useRef<THREE.Mesh>(null);
  const lamp = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    // knipperen: elke 3,4 s heel even dicht; elke 9 s even een grafiekje in plaats van ogen
    // (niet in de eerste halve minuut: dan wordt zijn foto gemaakt en stelt hij zich voor)
    const toon = t > 30 && t % 9 > 7.4;
    if (ogen.current) {
      ogen.current.scale.y = t % 3.4 < 0.12 ? 0.12 : 1;
      ogen.current.visible = !toon;
    }
    if (grafiek.current) {
      grafiek.current.visible = toon;
      grafiek.current.scale.y = Math.max(0.05, Math.min(1, ((t % 9) - 7.4) * 2.5));
    }
    if (links.current) links.current.rotation.y += dt * 26;
    if (rechts.current) rechts.current.rotation.y -= dt * 26;
    if (lamp.current) lamp.current.visible = t % 1.2 < 0.7;
  });
  return (
    <group>
      <mesh geometry={v.vast} material={vastMat} />
      <mesh geometry={v.licht} material={lichtMat} />
      <mesh ref={ogen} geometry={v.ogen} material={lichtMat} position={[0, 0.06, SCHERM_Z + 0.037]} />
      <mesh ref={grafiek} geometry={v.grafiek} material={lichtMat} position={[0, -0.03, SCHERM_Z + 0.037]} visible={false} />
      <mesh ref={links} geometry={v.blad} material={bladMat} position={[-0.5, 0.08, -0.02]} />
      <mesh ref={rechts} geometry={v.blad} material={bladMat} position={[0.5, 0.08, -0.02]} />
      <mesh ref={lamp} geometry={v.lamp} material={lampMat} />
    </group>
  );
}
