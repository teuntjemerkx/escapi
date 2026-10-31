// Gras dat leeft: duizenden kleine graspollen die meewiegen in de wind en opzij buigen als je erdoorheen loopt.
// Licht gehouden: één vorm (een pol van zeven sprietjes) die heel vaak herhaald wordt (instanties), in blokken van
// 8 × 8 m zodat alleen wat in beeld is getekend wordt. Op een tragere stand groeit er minder gras.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { beeldNu } from './kwaliteit';
import { seeded } from './kit';
import { speler } from './store';

type V2 = [number, number];
type Rect = [number, number, number, number];

/** Eén pol: zeven gebogen sprietjes. Wortel donker, punt licht (kleur per hoekpunt). Normalen omhoog: zacht licht. */
function polVorm() {
  const rnd = seeded(91);
  const delen: THREE.BufferGeometry[] = [];
  for (let b = 0; b < 7; b++) {
    const hoek = rnd() * Math.PI * 2;
    const h = 0.16 + rnd() * 0.16;
    const breed = 0.018 + rnd() * 0.01;
    const buig = 0.05 + rnd() * 0.08;
    const vx = Math.cos(hoek);
    const vz = Math.sin(hoek);
    const ox = (rnd() - 0.5) * 0.12;
    const oz = (rnd() - 0.5) * 0.12;
    const pos: number[] = [];
    const buigT: number[] = [];
    const kl: number[] = [];
    const lagen = [0, 0.4, 0.75, 1];
    for (const t of lagen) {
      const w = breed * (1 - t);
      const x = ox + vx * buig * t * t;
      const z = oz + vz * buig * t * t;
      const y = h * t;
      // dwars op de buigrichting
      if (t < 1) {
        pos.push(x - vz * w, y, z + vx * w, x + vz * w, y, z - vx * w);
        buigT.push(t, t);
        const k = 0.32 + 0.68 * t;
        kl.push(k, k, k, k, k, k);
      } else {
        pos.push(x, y, z);
        buigT.push(1);
        kl.push(1, 1, 1);
      }
    }
    const idx = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aBuig', new THREE.Float32BufferAttribute(buigT, 1));
    g.setAttribute('color', new THREE.Float32BufferAttribute(kl, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 3).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    g.setIndex(idx);
    delen.push(g);
  }
  return mergeGeometries(delen)!;
}
let polCache: THREE.BufferGeometry | null = null;
const pol = () => (polCache ??= polVorm());

const tijd = { value: 0 };
const spelerPos = { value: new THREE.Vector3() };
let grasMatCache: THREE.MeshStandardMaterial | null = null;
function grasMat() {
  if (grasMatCache) return grasMatCache;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.82 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTijd = tijd;
    sh.uniforms.uSpeler = spelerPos;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTijd;\nuniform vec3 uSpeler;\nattribute float aBuig;').replace(
      '#include <project_vertex>',
      `vec4 mvPosition = vec4( transformed, 1.0 );
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
        vec3 polPlek = ( instanceMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) ).xyz;
      #else
        vec3 polPlek = vec3( 0.0 );
      #endif
      // de punt beweegt het meest, de wortel staat stil
      float buigen = aBuig * aBuig;
      float golf = sin( uTijd * 1.7 + polPlek.x * 0.45 + polPlek.z * 0.3 ) * 0.65 + sin( uTijd * 3.3 + polPlek.x * 1.4 - polPlek.z * 0.9 ) * 0.25;
      vec3 wind = vec3( golf * 0.07, 0.0, golf * 0.04 ) * buigen;
      // opzij voor je voeten
      vec2 weg = polPlek.xz - uSpeler.xz;
      float d = length( weg );
      float duw = ( 1.0 - smoothstep( 0.15, 0.85, d ) ) * buigen * step( abs( polPlek.y - uSpeler.y ), 0.6 );
      wind.xz += ( weg / max( d, 0.001 ) ) * duw * 0.16;
      wind.y -= duw * 0.07;
      mvPosition.xyz += wind;
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;`,
    );
  };
  m.customProgramCacheKey = () => 'gras';
  grasMatCache = m;
  return m;
}

function binnen(poly: V2[], x: number, z: number) {
  let in_ = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) in_ = !in_;
  }
  return in_;
}

/**
 * Grasveld. `vlakken` = rechthoeken [midden x, midden z, breedte, diepte] en/of `veelhoek` = een omtrek.
 * `uit` = rechthoeken zonder gras (paden, stations), `vrij` = cirkels zonder gras [x, z, straal].
 * `y` = hoogte van de grond, `dichtheid` = pollen per m².
 */
export function Gras({
  vlakken = [],
  veelhoek,
  uit = [],
  vrij = [],
  y = 0,
  dichtheid = 9,
  kleur = '#4f7a3a',
  hoogte = 1,
  seed = 3,
  max = 12000,
}: {
  vlakken?: Rect[];
  veelhoek?: V2[];
  uit?: Rect[];
  vrij?: [number, number, number][];
  y?: number;
  dichtheid?: number;
  kleur?: string;
  hoogte?: number;
  seed?: number;
  max?: number;
}) {
  const blokken = useMemo(() => {
    const rnd = seeded(seed);
    // omhullende rechthoek van alle gebieden
    let x0 = Infinity;
    let x1 = -Infinity;
    let z0 = Infinity;
    let z1 = -Infinity;
    for (const [cx, cz, w, d] of vlakken) {
      x0 = Math.min(x0, cx - w / 2);
      x1 = Math.max(x1, cx + w / 2);
      z0 = Math.min(z0, cz - d / 2);
      z1 = Math.max(z1, cz + d / 2);
    }
    for (const [x, z] of veelhoek ?? []) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      z0 = Math.min(z0, z);
      z1 = Math.max(z1, z);
    }
    if (!Number.isFinite(x0)) return [];
    const inRect = ([cx, cz, w, d]: Rect, x: number, z: number) => Math.abs(x - cx) < w / 2 && Math.abs(z - cz) < d / 2;
    const ok = (x: number, z: number) =>
      (vlakken.some((r) => inRect(r, x, z)) || (!!veelhoek && binnen(veelhoek, x, z))) &&
      !uit.some((r) => inRect(r, x, z)) &&
      !vrij.some(([vx, vz, vr]) => Math.hypot(x - vx, z - vz) < vr);
    const stap = 1 / Math.sqrt(dichtheid);
    const per = new Map<string, { p: V2; r: number; s: number; k: number }[]>();
    let n = 0;
    for (let z = z0; z < z1 && n < max; z += stap)
      for (let x = x0; x < x1 && n < max; x += stap) {
        const px = x + (rnd() - 0.5) * stap * 0.9;
        const pz = z + (rnd() - 0.5) * stap * 0.9;
        if (!ok(px, pz)) continue;
        const key = `${Math.floor(px / 8)},${Math.floor(pz / 8)}`;
        if (!per.has(key)) per.set(key, []);
        per.get(key)!.push({ p: [px, pz], r: rnd() * Math.PI * 2, s: (0.75 + rnd() * 0.55) * hoogte, k: 0.78 + rnd() * 0.4 });
        n++;
      }
    const basis = new THREE.Color(kleur);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    return [...per.values()].map((lijst) => {
      // door elkaar husselen: als er minder gras moet groeien, wordt het overal even dun
      for (let i = lijst.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [lijst[i], lijst[j]] = [lijst[j], lijst[i]];
      }
      const m = new THREE.InstancedMesh(pol(), grasMat(), lijst.length);
      lijst.forEach((b, i) => {
        o.position.set(b.p[0], y, b.p[1]);
        o.rotation.set(0, b.r, 0);
        o.scale.setScalar(b.s);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        m.setColorAt(i, c.copy(basis).multiplyScalar(b.k));
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.computeBoundingSphere();
      m.receiveShadow = true;
      m.castShadow = false;
      m.userData.totaal = lijst.length;
      return m;
    });
  }, [vlakken, veelhoek, uit, vrij, y, dichtheid, kleur, hoogte, seed, max]);
  useEffect(() => () => blokken.forEach((m) => m.dispose()), [blokken]);
  useFrame(({ clock }) => {
    tijd.value = clock.getElapsedTime();
    spelerPos.value.copy(speler.pos);
    const f = beeldNu.stand === 'hoog' ? 1 : beeldNu.stand === 'midden' ? 0.6 : 0.25;
    for (const m of blokken) m.count = Math.max(0, Math.floor(m.userData.totaal * f));
  });
  return (
    <>
      {blokken.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
}
