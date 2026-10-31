// Vast decor samenvoegen: alle meshes met hetzelfde materiaal worden één mesh.
// Zo tekent de computer de hele wijk in tientallen stappen in plaats van duizenden.
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { metFijnDetail } from './fijn';
import { SCHADUW_LAAG } from './kit';
import { atlasUv, inAtlas, type AtlasPlek } from './atlas';

const ATTR = ['position', 'normal', 'uv'];

function voorbereid(g: THREE.BufferGeometry, m: THREE.Matrix4, kleur?: THREE.Color, eigenKleur = false) {
  const uit = g.index ? g.toNonIndexed() : g.clone();
  for (const naam of Object.keys(uit.attributes)) if (!ATTR.includes(naam) && !(eigenKleur && naam === 'color')) uit.deleteAttribute(naam);
  if (!uit.attributes.uv) uit.setAttribute('uv', new THREE.BufferAttribute(new Float32Array((uit.attributes.position.count) * 2), 2));
  if (!uit.attributes.normal) uit.computeVertexNormals();
  uit.clearGroups();
  uit.morphAttributes = {};
  uit.applyMatrix4(m);
  if (kleur) {
    const n = uit.attributes.position.count;
    const c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      c[i * 3] = kleur.r;
      c[i * 3 + 1] = kleur.g;
      c[i * 3 + 2] = kleur.b;
    }
    uit.setAttribute('color', new THREE.BufferAttribute(c, 3));
  }
  return uit;
}

/**
 * Effen gekleurde materialen (zonder plaatje, zonder gloed) worden één materiaal met
 * kleur per hoekpunt. Zo tekent een kamer vol meubels in een paar stappen.
 */
const kleurMat = new Map<string, THREE.MeshStandardMaterial>();
function kleurSleutel(m: THREE.Material): string | null {
  const s = m as THREE.MeshStandardMaterial;
  if (s.type !== 'MeshStandardMaterial' || s.map || s.vertexColors) return null;
  if (s.emissive && (s.emissive.r || s.emissive.g || s.emissive.b) && s.emissiveIntensity > 0) return null;
  return `${s.roughness.toFixed(2)}|${s.metalness.toFixed(2)}|${s.flatShading ? 1 : 0}|${s.transparent ? s.opacity.toFixed(2) : 1}|${s.side}`;
}
function gedeeldMateriaal(sleutel: string, voorbeeld: THREE.MeshStandardMaterial) {
  let m = kleurMat.get(sleutel);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: voorbeeld.roughness,
      metalness: voorbeeld.metalness,
      flatShading: voorbeeld.flatShading,
      transparent: voorbeeld.transparent,
      opacity: voorbeeld.opacity,
      side: voorbeeld.side,
    });
    if (!voorbeeld.transparent) metFijnDetail(m);
    kleurMat.set(sleutel, m);
  }
  return m;
}

/**
 * Bordjes en etiketten (getekend plaatje op een canvas, verder niets bijzonders) gaan op een plaatjesvel.
 * Dan delen ze één materiaal en worden ze samen één mesh. Geeft null als het niet kan.
 */
function atlasSleutel(mat: THREE.Material, geo: THREE.BufferGeometry): { sleutel: string; plek: AtlasPlek } | null {
  const s = mat as THREE.MeshStandardMaterial;
  if (s.type !== 'MeshStandardMaterial' && s.type !== 'MeshBasicMaterial') return null;
  const map = s.map;
  if (!map || typeof HTMLCanvasElement === 'undefined' || !(map.image instanceof HTMLCanvasElement)) return null;
  if (s.vertexColors || s.normalMap || s.roughnessMap || s.metalnessMap || s.emissiveMap || s.alphaMap || s.aoMap || s.lightMap || s.bumpMap) return null;
  if (map.wrapS !== THREE.ClampToEdgeWrapping || map.wrapT !== THREE.ClampToEdgeWrapping || !map.flipY) return null;
  if (map.repeat.x !== 1 || map.repeat.y !== 1 || map.offset.x || map.offset.y || map.rotation) return null;
  const uv = geo.attributes.uv as THREE.BufferAttribute | undefined;
  if (!uv) return null;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < -0.001 || u > 1.001 || v < -0.001 || v > 1.001) return null;
  }
  const plek = inAtlas(map.image);
  if (!plek) return null;
  const e = s.emissive ? `${s.emissive.getHexString()}${s.emissiveIntensity.toFixed(2)}` : '';
  const rm = s.type === 'MeshStandardMaterial' ? `${s.roughness.toFixed(2)}|${s.metalness.toFixed(2)}` : '';
  return { sleutel: `atlas|${plek.vel.tex.uuid}|${s.type}|${rm}|${e}|${s.transparent ? 1 : 0}|${s.opacity.toFixed(2)}|${s.alphaTest}|${s.side}|${s.toneMapped ? 1 : 0}|${s.depthWrite ? 1 : 0}|${s.fog ? 1 : 0}`, plek };
}
const atlasMat = new Map<string, THREE.Material>();
function atlasMateriaal(sleutel: string, voorbeeld: THREE.Material, plek: AtlasPlek) {
  let m = atlasMat.get(sleutel);
  if (!m) {
    const k = voorbeeld.clone() as THREE.MeshStandardMaterial;
    k.map = plek.vel.tex;
    k.vertexColors = true;
    k.color.set('#ffffff');
    atlasMat.set(sleutel, (m = k));
  }
  return m;
}

export function Statisch({ children }: { children: ReactNode }) {
  const bron = useRef<THREE.Group>(null);
  const [samen, setSamen] = useState<THREE.Group | null>(null);
  useLayoutEffect(() => {
    const g = bron.current;
    if (!g) return;
    g.updateMatrixWorld(true);
    const inv = g.matrixWorld.clone().invert();
    const groepen = new Map<string, { mat: THREE.Material; schaduw: boolean; geos: THREE.BufferGeometry[] }>();
    const m = new THREE.Matrix4();
    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || Array.isArray(mesh.material)) return;
      let zichtbaar = true;
      for (let p: THREE.Object3D | null = mesh; p && p !== g; p = p.parent) if (!p.visible) zichtbaar = false;
      if (!zichtbaar) return;
      const mat = mesh.material as THREE.Material;
      if ((mat as THREE.MeshBasicMaterial).visible === false) return;
      const ks = kleurSleutel(mat);
      const at = ks ? null : atlasSleutel(mat, mesh.geometry);
      const sh = mesh.castShadow ? 1 : 0;
      const sleutel = ks ? `kleur|${ks}|${sh}` : at ? `${at.sleutel}|${sh}` : `${mat.uuid}|${sh}`;
      let groep = groepen.get(sleutel);
      if (!groep) groepen.set(sleutel, (groep = { mat: ks ? gedeeldMateriaal(ks, mat as THREE.MeshStandardMaterial) : at ? atlasMateriaal(at.sleutel, mat, at.plek) : mat, schaduw: mesh.castShadow, geos: [] }));
      const kleur = ks || at ? (mat as THREE.MeshStandardMaterial).color : undefined;
      const klaar = (g: THREE.BufferGeometry) => {
        if (at) atlasUv(g.attributes.uv as THREE.BufferAttribute, at.plek);
        return g;
      };
      // Materiaal met kleur per hoekpunt (bomen, aarde): die kleuren blijven bewaard.
      const eigen = !ks && !!(mat as THREE.MeshStandardMaterial).vertexColors && !!mesh.geometry.attributes.color;
      const im = mesh as THREE.InstancedMesh;
      if (im.isInstancedMesh) {
        // Elke kopie apart meenemen (met eigen matrix en eventueel eigen kleur).
        const mi = new THREE.Matrix4();
        const ci = new THREE.Color();
        for (let i = 0; i < im.count; i++) {
          im.getMatrixAt(i, mi);
          m.multiplyMatrices(inv, im.matrixWorld).multiply(mi);
          let k = kleur;
          if (kleur && im.instanceColor) {
            im.getColorAt(i, ci);
            k = ci.clone().multiply(kleur);
          }
          groep.geos.push(klaar(voorbereid(im.geometry, m, k, eigen)));
        }
        return;
      }
      m.multiplyMatrices(inv, mesh.matrixWorld);
      groep.geos.push(klaar(voorbereid(mesh.geometry, m, kleur, eigen)));
    });
    const uit = new THREE.Group();
    for (const { mat, schaduw, geos } of groepen.values()) {
      const geo = mergeGeometries(geos, false);
      for (const x of geos) x.dispose();
      if (!geo) continue;
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = schaduw;
      if (schaduw) mesh.layers.enable(SCHADUW_LAAG);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      uit.add(mesh);
    }
    setSamen(uit);
    return () => {
      uit.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    };
  }, []);
  return (
    <>
      <group ref={bron} visible={!samen}>
        {children}
      </group>
      {samen && <primitive object={samen} />}
    </>
  );
}
