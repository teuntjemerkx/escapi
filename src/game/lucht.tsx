// De lucht achter de wereld, in de 3D-scène zelf (in plaats van een CSS-achtergrond achter een doorzichtig canvas).
// Zo werken gloed (bloom), kleurcorrectie en mist er gewoon mee samen. We lezen de CSS-verlopen van de wereld
// (linear-gradient en radial-gradient, ook gestapeld) en tekenen ze precies zo na in een shader.
// Door je eigen ogen schuift de lucht een beetje mee als je omhoog of omlaag kijkt.
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { cam, useSpel } from './store';

const MAX_LAGEN = 4;
const MAX_STOPS = 8;

interface Laag {
  /** 0 = lineair, 1 = radiaal */
  soort: number;
  /** lineair: hoek in graden; radiaal: [cx, cy, rx, ry] als deel van breedte/hoogte */
  hoek: number;
  vorm: [number, number, number, number];
  stops: { k: [number, number, number, number]; p: number }[];
}

/** Splits op komma's die niet binnen haakjes staan. */
function splits(s: string) {
  const uit: string[] = [];
  let diep = 0;
  let begin = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') diep++;
    else if (c === ')') diep--;
    else if (c === ',' && diep === 0) {
      uit.push(s.slice(begin, i).trim());
      begin = i + 1;
    }
  }
  uit.push(s.slice(begin).trim());
  return uit.filter(Boolean);
}

function kleur(t: string): [number, number, number, number] | null {
  const rgba = t.match(/rgba?\(([^)]+)\)/);
  if (rgba) {
    const d = rgba[1].split(',').map((x) => parseFloat(x));
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] ?? 1];
  }
  const hex = t.match(/#[0-9a-fA-F]{3,8}/);
  if (hex) {
    const c = new THREE.Color(hex[0]);
    // THREE.Color slaat lineair op; wij rekenen in sRGB, net als CSS
    const s = c.clone().convertLinearToSRGB();
    return [s.r, s.g, s.b, 1];
  }
  return null;
}

/** Lees een CSS-achtergrond (één of meer verlopen) in. Bovenste laag eerst, zoals in CSS. */
export function leesVerloop(css: string): Laag[] {
  const lagen: Laag[] = [];
  for (const deel of splits(css)) {
    const m = deel.match(/^(linear|radial)-gradient\((.*)\)$/s);
    if (!m) continue;
    const args = splits(m[2]);
    const laag: Laag = { soort: m[1] === 'linear' ? 0 : 1, hoek: 180, vorm: [0.5, 0.5, 0.7, 0.7], stops: [] };
    let i = 0;
    if (laag.soort === 0 && /deg|to /.test(args[0])) {
      const g = args[0].match(/(-?[\d.]+)deg/);
      laag.hoek = g ? parseFloat(g[1]) : 180;
      i = 1;
    } else if (laag.soort === 1 && / at /.test(args[0])) {
      const [maat, plek] = args[0].split(' at ');
      const r = maat.trim().split(/\s+/).map((x) => parseFloat(x) / 100);
      const c = plek.trim().split(/\s+/).map((x) => parseFloat(x) / 100);
      laag.vorm = [c[0] ?? 0.5, c[1] ?? 0.5, r[0] ?? 0.7, r[1] ?? r[0] ?? 0.7];
      i = 1;
    }
    const rest = args.slice(i);
    rest.forEach((a, j) => {
      const k = kleur(a);
      if (!k) return;
      const p = a.match(/(-?[\d.]+)%\s*$/);
      laag.stops.push({ k, p: p ? parseFloat(p[1]) / 100 : rest.length > 1 ? j / (rest.length - 1) : 0 });
    });
    if (laag.stops.length) lagen.push(laag);
    if (lagen.length >= MAX_LAGEN) break;
  }
  return lagen;
}

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

const frag = /* glsl */ `
#define LAGEN ${MAX_LAGEN}
#define STOPS ${MAX_STOPS}
uniform int uAantal;
uniform int uSoort[LAGEN];
uniform float uHoek[LAGEN];
uniform vec4 uVorm[LAGEN];
uniform int uN[LAGEN];
uniform vec4 uKleur[LAGEN * STOPS];
uniform float uPos[LAGEN * STOPS];
uniform vec2 uMaat;
uniform float uSchuif;
varying vec2 vUv;

vec4 laagKleur(int l, float t) {
  int n = uN[l];
  vec4 vorige = uKleur[l * STOPS];
  float pv = uPos[l * STOPS];
  if (t <= pv) return vorige;
  for (int i = 1; i < STOPS; i++) {
    if (i >= n) break;
    vec4 k = uKleur[l * STOPS + i];
    float p = uPos[l * STOPS + i];
    if (t <= p) {
      float f = (t - pv) / max(1e-5, p - pv);
      // CSS mengt met voorvermenigvuldigde alfa
      vec4 a = vec4(vorige.rgb * vorige.a, vorige.a);
      vec4 b = vec4(k.rgb * k.a, k.a);
      vec4 m = mix(a, b, f);
      return vec4(m.a > 0.0 ? m.rgb / m.a : vec3(0.0), m.a);
    }
    vorige = k;
    pv = p;
  }
  return vorige;
}

void main() {
  // pixel in CSS-richting: x naar rechts, y naar beneden
  vec2 px = vec2(vUv.x, 1.0 - vUv.y + uSchuif) * uMaat;
  vec3 kleur = vec3(0.0);
  for (int l = LAGEN - 1; l >= 0; l--) {
    if (l >= uAantal) continue;
    float t;
    if (uSoort[l] == 0) {
      float h = radians(uHoek[l]);
      vec2 r = vec2(sin(h), -cos(h));
      float len = abs(uMaat.x * sin(h)) + abs(uMaat.y * cos(h));
      t = dot(px - uMaat * 0.5, r) / len + 0.5;
    } else {
      vec4 v = uVorm[l];
      t = length((px - v.xy * uMaat) / (v.zw * uMaat));
    }
    vec4 c = laagKleur(l, t);
    kleur = mix(kleur, c.rgb, c.a);
  }
  // een heel klein beetje ruis tegen strepen in het verloop
  float ruis = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  kleur += ruis / 255.0;
  // sRGB naar lineair (de rest van de keten werkt lineair)
  kleur = pow(max(kleur, vec3(0.0)), vec3(2.2));
  gl_FragColor = vec4(kleur, 1.0);
}`;

/** De lucht als achtergrond. `css` = de achtergrond van de wereld. */
export function Lucht({ css }: { css: string }) {
  const size = useThree((s) => s.size);
  const { mesh, mat } = useMemo(() => {
    const lagen = leesVerloop(css);
    const soort = new Int32Array(MAX_LAGEN);
    const hoek = new Float32Array(MAX_LAGEN);
    const vorm = Array.from({ length: MAX_LAGEN }, () => new THREE.Vector4(0.5, 0.5, 0.7, 0.7));
    const n = new Int32Array(MAX_LAGEN);
    const kleuren = Array.from({ length: MAX_LAGEN * MAX_STOPS }, () => new THREE.Vector4());
    const pos = new Float32Array(MAX_LAGEN * MAX_STOPS);
    lagen.forEach((l, i) => {
      soort[i] = l.soort;
      hoek[i] = l.hoek;
      vorm[i].set(...l.vorm);
      n[i] = Math.min(MAX_STOPS, l.stops.length);
      l.stops.slice(0, MAX_STOPS).forEach((s, j) => {
        kleuren[i * MAX_STOPS + j].set(...s.k);
        pos[i * MAX_STOPS + j] = s.p;
      });
    });
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uAantal: { value: lagen.length },
        uSoort: { value: Array.from(soort) },
        uHoek: { value: Array.from(hoek) },
        uVorm: { value: vorm },
        uN: { value: Array.from(n) },
        uKleur: { value: kleuren },
        uPos: { value: Array.from(pos) },
        uMaat: { value: new THREE.Vector2(1, 1) },
        uSchuif: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      fog: false,
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1000;
    mesh.userData.lucht = true;
    return { mesh, mat };
  }, [css]);
  useFrame(() => {
    mat.uniforms.uMaat.value.set(size.width, size.height);
    // door je eigen ogen: kijk je omhoog, dan zie je meer van de bovenkant van de lucht
    const s = useSpel.getState();
    const fp = s.cameraStand === 'eerste' && s.modus === 'lopen' && s.kaart !== 'start' && s.kaart !== 'werelden';
    mat.uniforms.uSchuif.value = fp ? -cam.fpPitch * 0.6 : 0;
  });
  return <primitive object={mesh} />;
}
