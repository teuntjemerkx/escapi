// De zaklamp als je door je eigen ogen kijkt (eerste persoon, donkere werelden), zoals in horrorgames:
// - een metalen staaflamp met brede kop in je rechterhand, rechtsonder in beeld; hij wiebelt mee als je loopt
//   en zwaait na als je rondkijkt;
// - een lichtvlek met een felle kern, de ring van de reflector en een zachte rand (lichtplaatje voor de spot);
// - een vage lichtbundel in de lucht en stofjes die alleen oplichten als ze in de bundel zweven.
// De lamp zelf (SpotLight) staat in App en leest de plek van de lens uit `zaklampStaat`.
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gloedTex } from './texturen';
import { cam, speler, useSpel } from './store';

/** Waar de lens van de zaklamp nu is en waar hij heen schijnt (de lamp in App leest dit). */
/** De hand met de zaklamp staat in een eigen laagje dat boven op de wereld wordt getekend (zie beeld.ts). */
export const handScene = new THREE.Scene();

export const zaklampStaat = {
  lens: new THREE.Vector3(),
  richting: new THREE.Vector3(0, 0, -1),
  /** 1 = aan, 0 = uit (hapert of valt even uit). */
  aan: 1,
  /** Tot deze kloktijd (s) is de lamp met opzet uit. */
  uitvalTot: 0,
  /** Zolang dit waar is, is de lamp uit (Frank zet zich klaar om je te laten schrikken). */
  uit: false,
};

/** Halve openingshoek van de lichtbundel (rad). */
export const BUNDEL_HOEK = 0.56;

let cookie: THREE.Texture | null = null;
/**
 * Lichtplaatje van een echte zaklamp: een felle, warmwitte kern, een lichte ring van de reflector,
 * een donkerder band en een zachte, warme rand. Met wat onregelmatigheid, zodat het niet "perfect" oogt.
 */
export function zaklampCookie() {
  if (cookie) return cookie;
  const N = 256;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(N, N);
  const glad = (a: number, b: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const dx = (x + 0.5) / N - 0.5;
      const dy = (y + 0.5) / N - 0.5;
      const r = Math.hypot(dx, dy) * 2; // 0 midden, 1 rand
      const a = Math.atan2(dy, dx);
      const kern = 1 - glad(0.0, 0.26, r) * 0.42;
      const ring = Math.exp(-(((r - 0.4) / 0.05) ** 2)) * 0.22;
      const band = Math.exp(-(((r - 0.52) / 0.06) ** 2)) * 0.16;
      const halo = (1 - glad(0.5, 0.98, r)) * 0.42;
      const ruis = 1 + Math.sin(a * 7 + r * 18) * 0.03 + Math.sin(a * 13 - r * 9) * 0.02;
      let v = (r < 0.5 ? kern + ring - band : Math.max(halo, kern * 0.6 + ring - band)) * ruis;
      v = Math.max(0, Math.min(1, v)) * (1 - glad(0.92, 1.0, r));
      // kern iets witter, rand iets warmer
      const warm = glad(0.15, 0.8, r);
      const i = (y * N + x) * 4;
      img.data[i] = 255 * v;
      img.data[i + 1] = 255 * v * (1 - warm * 0.1);
      img.data[i + 2] = 255 * v * (1 - warm * 0.3);
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  cookie = new THREE.CanvasTexture(c);
  cookie.colorSpace = THREE.SRGBColorSpace;
  return cookie;
}

/** Plek van de lamp ten opzichte van de camera: rechts, omlaag, een halve meter voor je. */
const IN_BEELD = new THREE.Vector3(0.23, -0.22, -0.44);
/** De lens, in de maat van het model (de lamp wijst naar −z). */
const LENS = new THREE.Vector3(0, 0, -0.19);

/**
 * Materiaal voor het lampmodel. Het model wordt als allerlaatste getekend, met een eigen (gewiste) diepte:
 * zo staat het altijd vóór de wereld (ook vlak bij een muur), maar bedekken de onderdelen elkaar wel goed.
 */
function vlak(kleur: string, opts: { emissive?: string; e?: number; metal?: number; rough?: number } = {}) {
  return new THREE.MeshStandardMaterial({
    color: kleur,
    emissive: opts.emissive ?? '#000000',
    emissiveIntensity: opts.e ?? 1,
    metalness: opts.metal ?? 0,
    roughness: opts.rough ?? 0.7,
    transparent: true,
    fog: false,
  });
}

/** Draai een vorm zo dat zijn +y-as naar voren wijst (−z), zoals de lamp. */
const vooruit = (g: THREE.BufferGeometry) => g.rotateX(-Math.PI / 2);

/** Het model: lamp met brede kop, hand met vingers om het handvat, duim bij de knop, mouw. */
function maakModel() {
  const metaal = vlak('#262a31', { emissive: '#101317', metal: 0.7, rough: 0.3 });
  const chroom = vlak('#d4d8de', { emissive: '#4a4d52', metal: 0.9, rough: 0.2 });
  const lens = new THREE.MeshBasicMaterial({ color: '#fff4dc', transparent: true, toneMapped: false, fog: false });
  const rubber = vlak('#2c2f33', { emissive: '#0c0d0e', rough: 0.9 });
  const huid = vlak('#e8b993', { emissive: '#3a2014', e: 0.4, rough: 0.6 });
  const nagel = vlak('#f3d3bd', { emissive: '#3a2418', e: 0.4, rough: 0.35 });
  const mouw = vlak('#8a4f2c', { emissive: '#1e0e06', e: 0.5, rough: 0.85 });
  const knop = vlak('#3a3d42', { emissive: '#101113', rough: 0.6 });

  // lamp: staart, handvat (met ribbels), hals, brede kop, chromen ring en de lens
  const profiel = [
    [0.0, -0.135],
    [0.02, -0.135],
    [0.0235, -0.13],
    [0.0235, -0.105],
    [0.0215, -0.1],
    [0.0215, 0.06],
    [0.023, 0.07],
    [0.031, 0.11],
    [0.041, 0.148],
    [0.043, 0.152],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const delen: { geo: THREE.BufferGeometry; mat: THREE.Material }[] = [];
  const voeg = (geo: THREE.BufferGeometry, mat: THREE.Material) => delen.push({ geo, mat });
  voeg(new THREE.CylinderGeometry(0.06, 0.07, 0.34, 16, 1, true).rotateX(-1.2).rotateZ(-0.45).translate(0.085, -0.115, 0.215), mouw);
  voeg(vooruit(new THREE.LatheGeometry(profiel, 28)), metaal);
  for (let i = 0; i < 7; i++) voeg(vooruit(new THREE.CylinderGeometry(0.0224, 0.0224, 0.006, 20).translate(0, -0.085 + i * 0.012, 0)), rubber);
  voeg(vooruit(new THREE.CylinderGeometry(0.0445, 0.0445, 0.03, 32, 1, true).translate(0, 0.167, 0)), chroom);
  voeg(vooruit(new THREE.TorusGeometry(0.0425, 0.0035, 8, 32).rotateX(Math.PI / 2).translate(0, 0.182, 0)), chroom);
  voeg(vooruit(new THREE.CircleGeometry(0.039, 32).rotateX(-Math.PI / 2).translate(0, 0.183, 0)), lens);
  voeg(new THREE.BoxGeometry(0.012, 0.007, 0.022).translate(0, 0.024, -0.03), knop);
  // hand: handpalm aan de rechterkant, vier gekrulde vingers onder het handvat door, duim bovenop
  voeg(new THREE.SphereGeometry(1, 18, 12).scale(0.032, 0.04, 0.062).translate(0.03, -0.006, 0.0), huid);
  for (let i = 0; i < 4; i++) {
    const z = -0.045 + i * 0.024;
    const dik = 0.0105 - i * 0.0007;
    voeg(new THREE.TorusGeometry(0.0335, dik, 8, 14, 3.25).rotateZ(-3.25 + 0.2).translate(0, 0, z), huid);
    const a = -3.05;
    voeg(new THREE.SphereGeometry(dik, 10, 8).translate(Math.cos(a) * 0.0335, Math.sin(a) * 0.0335, z), huid);
  }
  const duim = new THREE.CapsuleGeometry(0.0115, 0.05, 4, 10).rotateX(Math.PI / 2).rotateY(-0.25).translate(0.016, 0.027, -0.008);
  voeg(duim, huid);
  voeg(new THREE.SphereGeometry(1, 10, 8).scale(0.008, 0.003, 0.009).translate(0.01, 0.038, -0.034), nagel);
  return delen;
}

const straalVert = /* glsl */ `
  varying float vLangs;
  varying vec3 vN;
  varying vec3 vV;
  uniform float uLengte;
  void main() {
    vLangs = -position.z / uLengte;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const straalFrag = /* glsl */ `
  varying float vLangs;
  varying vec3 vN;
  varying vec3 vV;
  uniform vec3 uKleur;
  uniform float uSterkte;
  void main() {
    float f = abs(dot(normalize(vN), normalize(vV)));
    float a = uSterkte * pow(1.0 - clamp(vLangs, 0.0, 1.0), 2.2) * (0.25 + 0.75 * f) * smoothstep(0.0, 0.06, vLangs);
    gl_FragColor = vec4(uKleur * a, 1.0);
  }
`;

const stofVert = /* glsl */ `
  uniform float uTijd;
  uniform vec3 uMidden;
  uniform vec3 uLens;
  uniform vec3 uRicht;
  uniform float uCos;
  uniform float uPx;
  attribute float aFase;
  varying float vA;
  const vec3 DOOS = vec3(9.0, 3.2, 9.0);
  void main() {
    vec3 p = position + vec3(sin(uTijd * 0.11 + aFase) * 0.6, sin(uTijd * 0.07 + aFase * 2.3) * 0.3 + uTijd * -0.015, cos(uTijd * 0.09 + aFase) * 0.6);
    // rondom je heen herhalen, zodat er altijd stof om je heen hangt
    p = uMidden + mod(p - uMidden + DOOS * 0.5, DOOS) - DOOS * 0.5;
    vec3 d = p - uLens;
    float l = length(d);
    float binnen = smoothstep(uCos, uCos + 0.04, dot(d / max(l, 1e-3), uRicht));
    vA = binnen * smoothstep(0.35, 0.9, l) * (1.0 / (1.0 + l * l * 0.18));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uPx * 0.012 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const stofFrag = /* glsl */ `
  uniform vec3 uKleur;
  uniform float uSterkte;
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = vA * uSterkte * (1.0 - r * 2.0);
    gl_FragColor = vec4(uKleur * a, 1.0);
  }
`;

export function ZaklampInHand() {
  const ref = useRef<THREE.Group>(null);
  const straal = useRef<THREE.Mesh>(null);
  const gloed = useRef<THREE.Sprite>(null);
  const handLicht = useRef<THREE.PointLight>(null);
  const vorigYaw = useRef(cam.yaw);
  const vorigPitch = useRef(cam.fpPitch);
  const zwaai = useRef(new THREE.Vector2());
  const stap = useRef(0);
  const lopen = useRef(0);
  const vorigPos = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const draai = useMemo(() => new THREE.Quaternion(), []);
  const kantel = useMemo(() => new THREE.Euler(), []);
  const delen = useMemo(maakModel, []);
  const STRAAL_L = 6.5;
  const { straalGeo, straalMat } = useMemo(() => {
    const r = Math.tan(BUNDEL_HOEK * 0.72) * STRAAL_L;
    const straalGeo = new THREE.ConeGeometry(r, STRAAL_L, 40, 12, true).rotateX(Math.PI / 2).translate(0, 0, -STRAAL_L / 2);
    const straalMat = new THREE.ShaderMaterial({
      vertexShader: straalVert,
      fragmentShader: straalFrag,
      uniforms: { uLengte: { value: STRAAL_L }, uKleur: { value: new THREE.Color('#fff1d6') }, uSterkte: { value: 0.05 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    return { straalGeo, straalMat };
  }, []);
  const stof = useMemo(() => {
    const n = 320;
    const p = new Float32Array(n * 3);
    const fase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 9;
      p[i * 3 + 1] = 0.2 + Math.random() * 3;
      p[i * 3 + 2] = (Math.random() - 0.5) * 9;
      fase[i] = Math.random() * 40;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aFase', new THREE.BufferAttribute(fase, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: stofVert,
      fragmentShader: stofFrag,
      uniforms: {
        uTijd: { value: 0 },
        uMidden: { value: new THREE.Vector3() },
        uLens: { value: new THREE.Vector3() },
        uRicht: { value: new THREE.Vector3(0, 0, -1) },
        uCos: { value: Math.cos(BUNDEL_HOEK * 0.8) },
        uPx: { value: 800 },
        uKleur: { value: new THREE.Color('#fff3dc') },
        uSterkte: { value: 0.9 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const punten = new THREE.Points(g, m);
    punten.frustumCulled = false;
    return punten;
  }, []);
  const gloedMat = useMemo(
    () => new THREE.SpriteMaterial({ map: gloedTex(), color: '#fff0cf', transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.55 }),
    [],
  );

  const wereldScene = useThree((st) => st.scene);
  useFrame(({ camera, clock, size, gl }, rawDt) => {
    const g = ref.current;
    if (!g) return;
    handScene.environment = wereldScene.environment;
    handScene.environmentIntensity = wereldScene.environmentIntensity;
    const dt = Math.min(rawDt, 0.05);
    const s = useSpel.getState();
    const zicht = s.cameraStand === 'eerste' && s.modus === 'lopen' && s.kaart !== 'start' && s.kaart !== 'werelden';
    g.visible = zicht;
    stof.visible = zicht;
    if (straal.current) straal.current.visible = zicht && zaklampStaat.aan > 0.5;
    if (handLicht.current) handLicht.current.visible = zicht;
    camera.updateMatrixWorld();
    // naslingeren: draai je snel rond, dan blijft de lamp heel even achter
    const dyaw = Math.atan2(Math.sin(cam.yaw - vorigYaw.current), Math.cos(cam.yaw - vorigYaw.current));
    const dpitch = cam.fpPitch - vorigPitch.current;
    vorigYaw.current = cam.yaw;
    vorigPitch.current = cam.fpPitch;
    zwaai.current.x += (Math.max(-0.08, Math.min(0.08, dyaw * 1.6)) - zwaai.current.x) * Math.min(1, dt * 9);
    zwaai.current.y += (Math.max(-0.06, Math.min(0.06, dpitch * 1.6)) - zwaai.current.y) * Math.min(1, dt * 9);
    // meewiebelen met je stappen, en heel zacht ademen als je stilstaat
    const v = vorigPos.current.distanceTo(speler.pos) / Math.max(dt, 1e-4);
    vorigPos.current.copy(speler.pos);
    lopen.current += ((v > 0.5 ? 1 : 0) - lopen.current) * Math.min(1, dt * 8);
    stap.current += dt * 9.5 * lopen.current;
    const t = clock.getElapsedTime();
    const adem = Math.sin(t * 1.6) * 0.004;
    tmp.set(
      IN_BEELD.x + zwaai.current.x * 0.6 + Math.cos(stap.current / 2) * 0.012 * lopen.current,
      IN_BEELD.y - zwaai.current.y * 0.5 + Math.abs(Math.sin(stap.current)) * 0.014 * lopen.current + adem,
      IN_BEELD.z,
    );
    g.position.copy(tmp).applyMatrix4(camera.matrixWorld);
    // iets schuin naar binnen en omhoog, zodat je de lamp van opzij ziet (zoals in horrorgames)
    kantel.set(0.07 - zwaai.current.y * 0.8 + Math.sin(stap.current) * 0.01 * lopen.current, 0.2 + zwaai.current.x * 1.2, -0.3 - zwaai.current.x * 0.6);
    draai.setFromEuler(kantel);
    g.quaternion.copy(camera.quaternion).multiply(draai);
    g.updateMatrixWorld();
    zaklampStaat.lens.copy(LENS).applyMatrix4(g.matrixWorld);
    // de bundel wijst waar je kijkt, een fractie achter je blik aan
    camera.getWorldDirection(tmp);
    zaklampStaat.richting.lerp(tmp, Math.min(1, dt * 14)).normalize();
    const aan = zaklampStaat.aan > 0.5;
    if (straal.current) {
      straal.current.position.copy(zaklampStaat.lens);
      straal.current.lookAt(tmp.copy(zaklampStaat.lens).sub(zaklampStaat.richting));
    }
    if (gloed.current) {
      gloed.current.position.copy(zaklampStaat.lens).addScaledVector(zaklampStaat.richting, 0.02);
      gloed.current.visible = zicht && aan;
    }
    const u = (stof.material as THREE.ShaderMaterial).uniforms;
    u.uTijd.value = t;
    u.uMidden.value.copy(speler.pos);
    u.uLens.value.copy(zaklampStaat.lens);
    u.uRicht.value.copy(zaklampStaat.richting);
    u.uSterkte.value = aan ? 0.9 : 0;
    u.uPx.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360));
    if (handLicht.current) {
      // licht dat van de lamp terugkaatst: van boven, net achter de kop
      handLicht.current.position.set(0.12, -0.08, -0.5).applyMatrix4(camera.matrixWorld);
      handLicht.current.intensity = aan ? 0.14 : 0.01;
    }
  });

  return (
    <>
      <mesh ref={straal} geometry={straalGeo} material={straalMat} renderOrder={6} frustumCulled={false} visible={false} />
      <primitive object={stof} />
      {createPortal(
        <>
          <group ref={ref} visible={false}>
            {delen.map((d, i) => (
              <mesh key={i} geometry={d.geo} material={d.mat} renderOrder={1000 + i} frustumCulled={false} />
            ))}
          </group>
          <sprite ref={gloed} material={gloedMat} scale={0.16} renderOrder={1100} visible={false} />
          {/* een beetje licht van de lamp zelf op je hand, en een vleugje licht uit de omgeving */}
          <pointLight ref={handLicht} color="#ffe2b8" intensity={0.14} distance={0.7} decay={2} />
          <hemisphereLight args={['#aab8e0', '#1c1612', 0.12]} />
        </>,
        handScene,
      )}
    </>
  );
}
