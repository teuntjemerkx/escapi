// Wereld 1: de tijd loopt mee met de fases. Je begint in het gouden uur (19.40 uur) en eindigt in het
// blauwe uur (21.30 uur, hoogwater): dan vaart De Eenheid uit. Dit bestand regelt:
// - de kleur en sterkte van zon, hemellicht en mist per fase (vloeiend over ± 6 s),
// - een eigen luchtkoepel met zonnegloed en (in het blauwe uur) sterren,
// - gedeelde lampmaterialen die aangaan bij "Zelf doen" (kadelantaarns, ramen, schijnwerpers),
// - de tijd op de klokken (havenkantoor, veilingklok).
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Fase } from '../game/store';
import { useSpel } from '../game/store';
import { lichtTex } from '../game/texturen';

type Stand = {
  /** Tijd op de klok. */
  klok: string;
  /** Minuten na 19.00 uur (voor de wijzers). */
  min: number;
  zon: string;
  /** Factor op de sterkte van de zon (sfeer.zon[1] = 2,2). */
  zonF: number;
  lucht: string;
  grond: string;
  hemelF: number;
  mist: string;
  zenit: string;
  horizon: string;
  gloed: string;
  gloedF: number;
  sterren: number;
  /** Lampen: 0 = uit, 1 = aan. */
  lamp: number;
  glans: number;
};

const S = (x: Stand) => x;
/** Licht per fase. */
export const FASE_STAND: Record<Fase, Stand> = {
  terugblik: S({ klok: '19.40', min: 40, zon: '#ffc98a', zonF: 1, lucht: '#cfe0f5', grond: '#6a5644', hemelF: 1, mist: '#e9c7a4', zenit: '#5f8fc4', horizon: '#f3c99a', gloed: '#ffd08a', gloedF: 1, sterren: 0, lamp: 0, glans: 0.32 }),
  doel: S({ klok: '19.45', min: 45, zon: '#ffc488', zonF: 0.98, lucht: '#cfdff3', grond: '#685442', hemelF: 0.98, mist: '#e9c4a0', zenit: '#5c8bc0', horizon: '#f3c595', gloed: '#ffcc84', gloedF: 1, sterren: 0, lamp: 0, glans: 0.32 }),
  instructie: S({ klok: '19.55', min: 55, zon: '#ffbb7a', zonF: 0.94, lucht: '#c9daf0', grond: '#64503f', hemelF: 0.95, mist: '#e8bd98', zenit: '#5886bb', horizon: '#f2bb88', gloed: '#ffc077', gloedF: 1.05, sterren: 0, lamp: 0.15, glans: 0.31 }),
  begeleid: S({ klok: '20.10', min: 70, zon: '#ffa866', zonF: 0.82, lucht: '#c2cfe8', grond: '#5c4a3e', hemelF: 0.88, mist: '#dfab90', zenit: '#5079b0', horizon: '#f0a87a', gloed: '#ffae66', gloedF: 1.1, sterren: 0, lamp: 0.3, glans: 0.29 }),
  zelfstandig: S({ klok: '20.40', min: 100, zon: '#ff9062', zonF: 0.5, lucht: '#b7b4d6', grond: '#4c4048', hemelF: 0.72, mist: '#c79a9c', zenit: '#3f5d98', horizon: '#e79a84', gloed: '#ff8f62', gloedF: 1.0, sterren: 0.1, lamp: 1, glans: 0.26 }),
  evaluatie: S({ klok: '21.10', min: 130, zon: '#9fb0ff', zonF: 0.36, lucht: '#a9bdf0', grond: '#2b2f40', hemelF: 0.62, mist: '#2c3760', zenit: '#16244f', horizon: '#5a5a8e', gloed: '#c27a62', gloedF: 0.35, sterren: 0.7, lamp: 1, glans: 0.22 }),
  klaar: S({ klok: '21.30', min: 150, zon: '#9aaaff', zonF: 0.32, lucht: '#a2b6ee', grond: '#262a3a', hemelF: 0.58, mist: '#263257', zenit: '#111d44', horizon: '#4c4f86', gloed: '#a8665a', gloedF: 0.25, sterren: 1, lamp: 1, glans: 0.2 }),
};

/** Huidige (overvloeiende) stand: wordt elk beeld bijgewerkt en door decor gelezen. */
export const sfeerNu = { lamp: 0, min: 40, klok: '19.40', sterren: 0 };

/** Richting waar de zon staat (laag in het westnoordwesten, boven zee). Ook gebruikt in wereld.tsx. */
export const ZON_RICHTING: [number, number, number] = [-40, 12, -14];

// ── gedeelde lampmaterialen (blijven hetzelfde object na het samenvoegen in Statisch) ──
const UIT = new THREE.Color('#3b352d');
const AAN = new THREE.Color('#ffd49a');
/** Lampkap van een kadelantaarn, schijnwerper of hanglamp: gaat aan bij Zelf doen. */
export const lampMat = new THREE.MeshBasicMaterial({ color: UIT.clone(), toneMapped: false });
/** Warm verlicht raam (huisjes op de dijk, schip): brandt al een beetje en gloeit later fel. */
export const raamMat = new THREE.MeshBasicMaterial({ color: '#7a5a35', toneMapped: false });
/** Lichtvlek op de grond onder een lamp (optellend). */
export const vlekMat = new THREE.MeshBasicMaterial({ map: lichtTex(), color: '#ffb871', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
/** Altijd aan: rode luchtvaartlampjes, navigatielichten. */
export const roodLicht = new THREE.MeshBasicMaterial({ color: '#ff4a3a', toneMapped: false });
export const groenLicht = new THREE.MeshBasicMaterial({ color: '#4aff7a', toneMapped: false });
export const witLicht = new THREE.MeshBasicMaterial({ color: '#fff6e4', toneMapped: false });

const RAAM_DAG = new THREE.Color('#6e5232');
const RAAM_NACHT = new THREE.Color('#ffb860');

const kleur = (hex: string) => new THREE.Color(hex);

/** Regelt licht, mist en lampen per fase. In `Levend`. */
export function FaseSfeer() {
  const scene = useThree((s) => s.scene);
  const fase = useSpel((s) => s.fase);
  const doel = FASE_STAND[fase] ?? FASE_STAND.terugblik;
  // huidige waarden (lineaire kleuren) die naar het doel toe schuiven
  const nu = useRef<null | { zon: THREE.Color; lucht: THREE.Color; grond: THREE.Color; mist: THREE.Color; zonF: number; hemelF: number; lamp: number; glans: number; min: number; sterren: number }>(null);
  const lichten = useRef<{ zon?: THREE.DirectionalLight; hemi?: THREE.HemisphereLight }>({});
  const basisGlans = useRef(scene.environmentIntensity);
  useEffect(() => {
    const was = basisGlans.current;
    return () => {
      scene.environmentIntensity = was;
    };
  }, [scene]);
  useFrame((_, dt) => {
    const d = doel;
    if (!nu.current) nu.current = { zon: kleur(d.zon), lucht: kleur(d.lucht), grond: kleur(d.grond), mist: kleur(d.mist), zonF: d.zonF, hemelF: d.hemelF, lamp: d.lamp, glans: d.glans, min: d.min, sterren: d.sterren };
    const n = nu.current;
    const k = Math.min(1, dt * 0.55);
    n.zon.lerp(kleur(d.zon), k);
    n.lucht.lerp(kleur(d.lucht), k);
    n.grond.lerp(kleur(d.grond), k);
    n.mist.lerp(kleur(d.mist), k);
    n.zonF += (d.zonF - n.zonF) * k;
    n.hemelF += (d.hemelF - n.hemelF) * k;
    n.lamp += (d.lamp - n.lamp) * k;
    n.glans += (d.glans - n.glans) * k;
    n.min += (d.min - n.min) * k;
    n.sterren += (d.sterren - n.sterren) * k;
    // lichten van de scène zoeken (één keer, of opnieuw als de wereld wisselde)
    const l = lichten.current;
    if (!l.zon?.parent || !l.hemi?.parent) {
      scene.traverse((o) => {
        if ((o as THREE.DirectionalLight).isDirectionalLight && o.castShadow) l.zon = o as THREE.DirectionalLight;
        if ((o as THREE.HemisphereLight).isHemisphereLight) l.hemi = o as THREE.HemisphereLight;
      });
    }
    if (l.zon) l.zon.color.copy(n.zon).multiplyScalar(n.zonF);
    if (l.hemi) {
      l.hemi.color.copy(n.lucht).multiplyScalar(n.hemelF);
      l.hemi.groundColor.copy(n.grond).multiplyScalar(n.hemelF);
    }
    const fog = scene.fog as THREE.Fog | null;
    if (fog) fog.color.copy(n.mist);
    scene.environmentIntensity = n.glans;
    // lampen
    lampMat.color.copy(UIT).lerp(AAN, n.lamp);
    raamMat.color.copy(RAAM_DAG).lerp(RAAM_NACHT, 0.35 + 0.65 * n.lamp);
    vlekMat.opacity = 0.32 * n.lamp;
    sfeerNu.lamp = n.lamp;
    sfeerNu.min = n.min;
    sfeerNu.sterren = n.sterren;
    const m = Math.round(n.min);
    sfeerNu.klok = `${19 + Math.floor(m / 60)}.${String(m % 60).padStart(2, '0')}`;
  });
  return null;
}

// ── luchtkoepel ─────────────────────────────────────────────────────────

const luchtVert = /* glsl */ `
varying vec3 vRichting;
void main() {
  vRichting = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
  gl_Position.z = gl_Position.w * 0.9999;
}`;
const luchtFrag = /* glsl */ `
uniform vec3 uZenit;
uniform vec3 uHorizon;
uniform vec3 uMist;
uniform vec3 uGloed;
uniform vec3 uZon;
uniform float uGloedF;
uniform float uSterren;
varying vec3 vRichting;
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  vec3 d = normalize(vRichting);
  float h = d.y;
  vec3 kleur = mix(uHorizon, uZenit, pow(smoothstep(-0.02, 0.62, h), 0.65));
  // onder de horizon: de zee loopt weg in de mist
  kleur = mix(kleur, uMist, smoothstep(0.06, -0.08, h));
  // zonnegloed rond de zon (en een smalle band langs de horizon)
  float z = max(dot(d, normalize(uZon)), 0.0);
  kleur += uGloed * uGloedF * (pow(z, 6.0) * 0.55 + pow(z, 60.0) * 0.9 + pow(z, 900.0) * 6.0);
  kleur += uGloed * uGloedF * 0.18 * exp(-abs(h) * 14.0) * pow(z, 1.5);
  // sterren in het blauwe uur
  if (uSterren > 0.01 && h > 0.08) {
    vec3 c = floor(d * 260.0);
    float s = hash(c);
    float ster = step(0.9965, s) * (0.5 + 0.5 * hash(c + 3.1)) * smoothstep(0.08, 0.35, h);
    kleur += vec3(ster) * uSterren * 1.4;
  }
  gl_FragColor = vec4(kleur, 1.0);
}`;

/** Luchtkoepel die met de camera meeschuift: horizon, zonnegloed en sterren. */
export function Luchtkoepel() {
  const camera = useThree((s) => s.camera);
  const fase = useSpel((s) => s.fase);
  const doel = FASE_STAND[fase] ?? FASE_STAND.terugblik;
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: luchtVert,
        fragmentShader: luchtFrag,
        uniforms: {
          uZenit: { value: kleur(doel.zenit) },
          uHorizon: { value: kleur(doel.horizon) },
          uMist: { value: kleur(doel.mist) },
          uGloed: { value: kleur(doel.gloed) },
          uZon: { value: new THREE.Vector3(...ZON_RICHTING).normalize() },
          uGloedF: { value: doel.gloedF },
          uSterren: { value: doel.sterren },
        },
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const geo = useMemo(() => new THREE.SphereGeometry(320, 32, 20), []);
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 0.55);
    const u = mat.uniforms;
    (u.uZenit.value as THREE.Color).lerp(kleur(doel.zenit), k);
    (u.uHorizon.value as THREE.Color).lerp(kleur(doel.horizon), k);
    (u.uMist.value as THREE.Color).lerp(kleur(doel.mist), k);
    (u.uGloed.value as THREE.Color).lerp(kleur(doel.gloed), k);
    u.uGloedF.value += (doel.gloedF - u.uGloedF.value) * k;
    u.uSterren.value += (doel.sterren - u.uSterren.value) * k;
    ref.current?.position.copy(camera.position);
  });
  return <mesh ref={ref} geometry={geo} material={mat} renderOrder={-10} frustumCulled={false} />;
}
