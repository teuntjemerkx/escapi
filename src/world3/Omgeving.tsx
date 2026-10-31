// Wereld 3: de Markthal aan de Waag staat aan een oud stadsplein met kinderkopjes, tussen twee grachten.
// Rondom: rijen smalle grachtenpanden met trapgevels en klokgevels, een boogbrug achter de uitgang,
// een brugje met fietsen, bomen op de kades, lantaarns, lichtsnoeren boven het plein, een haventje tussen
// plein en laadkade, een woonboot, een vrachtaak langs de laadkade en een rondvaartboot. Gouden uur.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mat, seeded } from '../game/kit';
import { Blok, Cil } from './blok';
import { Lantaarns, Lichtsnoer, Loofboom, Terrein, Water } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { PLAN, WATER } from './huis';
import { HAKEN_GEVEL, LANTAARNS_KADE, PALEN_ZUID } from './Markthal';

type V2 = [number, number];
type V3 = [number, number, number];

// ── Randen van het diorama ───────────────────────────────────────────────
const W = -28.5; // westrand
const N = -38.5; // noordrand (achter de overkant)
const Z = 22.6; // voorrand
const O = 42; // oostrand (achter de oostelijke overkant)

/** Lijn van a naar b met een zachte golf (0 aan de uiteinden), stap ± 1,1 m. */
function golfLijn(a: V2, b: V2, amp: number, seed: number): V2[] {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(2, Math.ceil(l / 1.1));
  const nx = -(b[1] - a[1]) / l;
  const nz = (b[0] - a[0]) / l;
  const uit: V2[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const g = amp * Math.sin(Math.PI * t) * (0.6 * Math.sin(t * l * 0.31 + seed) + 0.4 * Math.sin(t * l * 0.83 + seed * 2));
    uit.push([a[0] + (b[0] - a[0]) * t + nx * g, a[1] + (b[1] - a[1]) * t + nz * g]);
  }
  return uit;
}

const { achter: KA, overkant: KO, oost: KX, oostOver: KXO, haven: H } = WATER;

/** De kant van de Markthal: alles tussen de twee grachten, met een uitsparing voor het haventje. */
const HOOFDKANT: V2[] = [
  [W, KA],
  [KX, KA],
  [KX, H.z1],
  [H.x1, H.z1],
  [H.x1, H.z2],
  [KX, H.z2],
  ...golfLijn([KX, Z], [W, Z], 0.5, 1),
  ...golfLijn([W, Z], [W, KA], 0.5, 2),
];
/** De overkant: een L langs de achterste en de oostelijke gracht. */
const OVERKANT: V2[] = [
  [W, KO],
  [KXO, KO],
  ...golfLijn([KXO, Z], [O, Z], 0.3, 3),
  ...golfLijn([O, Z], [O, N], 0.5, 4),
  ...golfLijn([O, N], [W, N], 0.4, 5),
  ...golfLijn([W, N], [W, KO], 0.3, 6),
];

// ── Grachtenpanden ───────────────────────────────────────────────────────
type Gevel = 'trap' | 'klok' | 'hals' | 'tuit' | 'lijst';
const BAKSTEEN = ['#8a3f2e', '#9b4a35', '#7a3a2c', '#a5573e', '#6e3328', '#8f4a3a'];
const PLEISTER = ['#e9e1cf', '#d9c9a8', '#3f5a4a', '#2f3d4f', '#c98a4a', '#efe3c4'];
const DEUR = ['#2f4a3a', '#24364f', '#6e2a24', '#2f3634', '#3f5a4a'];

const glasAan = new THREE.MeshStandardMaterial({ color: '#ffd486', emissive: '#ffa648', emissiveIntensity: 0.85, roughness: 0.4 });
const glasUit = mat('#2c3a48', { rough: 0.25 });

/** Omtrek van een gevel (voorkant boven de dakgoot), in het vlak x/y, van y = 0 tot gh. */
function gevelVorm(soort: Gevel, b: number, gh: number) {
  const s = new THREE.Shape();
  const top = b * 0.3;
  s.moveTo(-b / 2, 0);
  if (soort === 'trap') {
    const k = 3;
    const sh = gh / (k + 1);
    const sw = (b / 2 - top / 2) / k;
    for (let i = 0; i < k; i++) {
      s.lineTo(-b / 2 + i * sw, (i + 1) * sh);
      s.lineTo(-b / 2 + (i + 1) * sw, (i + 1) * sh);
    }
    s.lineTo(-top / 2, gh);
    s.lineTo(top / 2, gh);
    for (let i = k - 1; i >= 0; i--) {
      s.lineTo(b / 2 - (i + 1) * sw, (i + 1) * sh);
      s.lineTo(b / 2 - i * sw, (i + 1) * sh);
    }
  } else if (soort === 'klok') {
    s.bezierCurveTo(-b / 2, gh * 0.45, -top / 2 - b * 0.12, gh * 0.4, -top / 2, gh * 0.82);
    s.absarc(0, gh * 0.82, top / 2, Math.PI, 0, true);
    s.bezierCurveTo(top / 2 + b * 0.12, gh * 0.4, b / 2, gh * 0.45, b / 2, 0);
  } else if (soort === 'hals') {
    s.lineTo(-b / 2, gh * 0.22);
    s.quadraticCurveTo(-top / 2, gh * 0.25, -top / 2, gh * 0.55);
    s.lineTo(-top / 2, gh);
    s.lineTo(top / 2, gh);
    s.lineTo(top / 2, gh * 0.55);
    s.quadraticCurveTo(top / 2, gh * 0.25, b / 2, gh * 0.22);
  } else if (soort === 'tuit') {
    s.lineTo(-b * 0.08, gh);
    s.lineTo(b * 0.08, gh);
  } else {
    s.lineTo(-b / 2, gh);
    s.lineTo(b / 2, gh);
  }
  s.lineTo(b / 2, 0);
  s.lineTo(-b / 2, 0);
  return s;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
function gevelGeo(soort: Gevel, b: number, gh: number) {
  const k = `g${soort}${b}${gh}`;
  let g = geoCache.get(k);
  if (!g) {
    g = new THREE.ExtrudeGeometry(gevelVorm(soort, b, gh), { depth: 0.32, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -0.32);
    geoCache.set(k, g);
  }
  return g;
}
function dakGeo(b: number, dh: number, d: number) {
  const k = `d${b}${dh}${d}`;
  let g = geoCache.get(k);
  if (!g) {
    const s = new THREE.Shape();
    s.moveTo(-b / 2, 0);
    s.lineTo(0, dh);
    s.lineTo(b / 2, 0);
    s.lineTo(-b / 2, 0);
    g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d);
    geoCache.set(k, g);
  }
  return g;
}

interface PandDef {
  x: number;
  b: number;
  h: number;
  gevel: Gevel;
  kleur: string;
  seed: number;
}

/** Eén grachtenpand. Voorgevel op z = 0, naar +z; diepte naar −z. */
function Pand({ b, h, gevel, kleur, seed, d }: PandDef & { d: number }) {
  const rnd = seeded(seed);
  const gh = gevel === 'lijst' ? 0.9 : Math.min(4.2, b * 0.62);
  const wit = '#f1ece2';
  const kolommen = b >= 6 ? 3 : 2;
  const verdiepingen = Math.max(1, Math.floor((h - 2.6) / 2.75));
  const ramen: { x: number; y: number; w: number; hh: number; aan: boolean }[] = [];
  for (let v = 0; v < verdiepingen; v++)
    for (let c = 0; c < kolommen; c++) {
      const x = (c - (kolommen - 1) / 2) * (b / kolommen);
      ramen.push({ x, y: 3.2 + v * 2.75 + 1.3, w: 0.95, hh: 1.55 - v * 0.08, aan: rnd() < 0.42 });
    }
  if (gevel !== 'lijst' && gh > 2.4) ramen.push({ x: 0, y: h + gh * 0.36, w: 0.7, hh: 1.0, aan: rnd() < 0.5 });
  const winkel = rnd() < 0.35;
  const deurX = (rnd() < 0.5 ? -1 : 1) * (b / 2 - 0.85);
  const deur = DEUR[Math.floor(rnd() * DEUR.length)];
  const luifel = ['#3f8f5a', '#c94f3f', '#2f5d8a', '#e2b33c'][Math.floor(rnd() * 4)];
  return (
    <group>
      <Blok size={[b - 0.06, h, d]} pos={[0, h / 2, -d / 2]} color={kleur} r={0} />
      {/* gevel en dak */}
      <mesh geometry={gevelGeo(gevel, b - 0.06, gh)} position={[0, h, 0]} material={mat(kleur)} castShadow receiveShadow />
      <mesh geometry={dakGeo(b - 0.3, gevel === 'lijst' ? 1.6 : gh * 0.85, d - 0.4)} position={[0, h, -0.32]} material={mat('#433f47')} castShadow receiveShadow />
      <Blok size={[b + 0.06, 0.18, 0.4]} pos={[0, h + 0.02, -0.05]} color={wit} r={0} />
      {(gevel === 'trap' || gevel === 'hals') && <Blok size={[b * 0.3 + 0.12, 0.14, 0.42]} pos={[0, h + gh + 0.04, -0.16]} color={wit} r={0} />}
      {gevel === 'klok' && <Blok size={[0.16, 0.5, 0.16]} pos={[0, h + gh * 0.82 + b * 0.15 + 0.2, -0.16]} color={wit} r={0} />}
      {/* ramen */}
      {ramen.map((r, i) => (
        <group key={i} position={[r.x, r.y, 0]}>
          <Blok size={[r.w + 0.18, r.hh + 0.18, 0.1]} pos={[0, 0, 0.02]} color={wit} r={0} shadow={false} />
          <mesh position={[0, 0, 0.05]} material={r.aan ? glasAan : glasUit}>
            <boxGeometry args={[r.w, r.hh, 0.08]} />
          </mesh>
          <Blok size={[0.06, r.hh, 0.13]} pos={[0, 0, 0.05]} color={wit} r={0} shadow={false} />
          <Blok size={[r.w, 0.06, 0.13]} pos={[0, r.hh * 0.12, 0.05]} color={wit} r={0} shadow={false} />
        </group>
      ))}
      {/* begane grond: deur met stoepje en een groot raam (soms een winkeltje met luifel) */}
      <Blok size={[1.0, 2.25, 0.12]} pos={[deurX, 1.32, 0.02]} color={deur} r={0} />
      <Blok size={[1.2, 0.12, 0.2]} pos={[deurX, 2.52, 0.05]} color={wit} r={0} />
      <Blok size={[1.4, 0.22, 0.7]} pos={[deurX, 0.11, 0.35]} color="#8f8a84" r={0} />
      <group position={[-deurX * 0.45 - Math.sign(deurX) * 0.2, 1.65, 0]}>
        <Blok size={[b - 2.6 + 0.2, 1.75, 0.1]} pos={[0, 0, 0.02]} color={wit} r={0} shadow={false} />
        <mesh position={[0, 0, 0.05]} material={winkel || rnd() < 0.4 ? glasAan : glasUit}>
          <boxGeometry args={[b - 2.6, 1.55, 0.08]} />
        </mesh>
        {winkel && <Blok size={[b - 2.2, 0.08, 0.9]} pos={[0, 1.05, 0.45]} rot={[0.35, 0, 0]} color={luifel} r={0} />}
      </group>
    </group>
  );
}

/** Een rij panden langs een lijn: start (x of z), richting, voorkant. */
function Rij({ panden, d }: { panden: (PandDef & { z: number; rot: number })[]; d: number }) {
  return (
    <>
      {panden.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
          <Pand {...p} d={d} />
        </group>
      ))}
    </>
  );
}

const GEVELS: Gevel[] = ['trap', 'klok', 'hals', 'tuit', 'lijst'];
function maakRij(start: number, breedtes: number[], vast: number, as: 'x' | 'z', rot: number, seed: number, hoog: [number, number]) {
  const rnd = seeded(seed);
  let p = start;
  return breedtes.map((b, i) => {
    const m = p + b / 2;
    p += b;
    const pleister = rnd() < 0.3;
    const kleur = pleister ? PLEISTER[Math.floor(rnd() * PLEISTER.length)] : BAKSTEEN[Math.floor(rnd() * BAKSTEEN.length)];
    return {
      x: as === 'x' ? m : vast,
      z: as === 'x' ? vast : m,
      rot,
      b,
      h: hoog[0] + rnd() * (hoog[1] - hoog[0]),
      gevel: GEVELS[(i * 2 + Math.floor(rnd() * 3)) % GEVELS.length],
      kleur,
      seed: seed * 31 + i,
    };
  });
}

// Overkant achter: gevels naar de gracht (+z), met een steeg bij de brug.
const NOORD_FRONT = KO - 2.1;
const RIJ_NOORD = [
  ...maakRij(W, [5.6, 6.0, 4.9, 5.4, 4.2], NOORD_FRONT, 'x', 0, 7, [8.6, 12.5]),
  ...maakRij(2.4, [6.2, 5.4, 6.8, 5.0, 6.0, 5.6, 6.0], NOORD_FRONT, 'x', 0, 8, [8.6, 13]),
];
// Overkant oost: gevels naar de gracht (−x), lager naar voren toe.
const OOST_FRONT = KXO + 1.8;
const RIJ_OOST = maakRij(-26.6, [5.6, 6.6, 4.8, 5.4, 4.6], OOST_FRONT, 'z', -Math.PI / 2, 9, [7.4, 10.5]);

// ── Bruggen ──────────────────────────────────────────────────────────────

/** Gemetselde boogbrug over een gracht. Lengte langs lokale z (van 0 naar −L), breedte langs x. */
function Boogbrug({ L, B, hoog = 0.95 }: { L: number; B: number; hoog?: number }) {
  const geos = useMemo(() => {
    // profiel in (u = afstand langs de brug, v = hoogte)
    const dek = (u: number) => 0.06 + hoog * (1 - ((2 * u) / L - 1) ** 2);
    const boogTop = hoog - 0.55;
    const romp = new THREE.Shape();
    romp.moveTo(0, dek(0));
    for (let i = 1; i <= 16; i++) romp.lineTo((L * i) / 16, dek((L * i) / 16));
    romp.lineTo(L, -1.4);
    romp.lineTo(L - 0.5, -1.4);
    const a0 = 0.5;
    const a1 = L - 0.5;
    for (let i = 0; i <= 16; i++) {
      const u = a1 - ((a1 - a0) * i) / 16;
      const t = (2 * (u - a0)) / (a1 - a0) - 1;
      romp.lineTo(u, -0.75 + (boogTop + 0.75) * Math.sqrt(Math.max(0, 1 - t * t)));
    }
    romp.lineTo(0.5, -1.4);
    romp.lineTo(0, -1.4);
    romp.lineTo(0, dek(0));
    const band = (dikte: number, boven: number) => {
      const s = new THREE.Shape();
      s.moveTo(0, dek(0) + boven - dikte);
      for (let i = 0; i <= 16; i++) s.lineTo((L * i) / 16, dek((L * i) / 16) + boven);
      for (let i = 16; i >= 0; i--) s.lineTo((L * i) / 16, dek((L * i) / 16) + boven - dikte);
      return s;
    };
    const maak = (s: THREE.Shape, d: number) => {
      const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 4 });
      // vorm-x = afstand langs de brug → wereld −z; extrusie → wereld x
      g.rotateY(Math.PI / 2);
      return g;
    };
    return { romp: maak(romp, B), dek: maak(band(0.12, 0.04), B - 0.5), leuning: maak(band(0.7, 0.72), 0.26), kap: maak(band(0.08, 0.8), 0.36) };
  }, [L, B, hoog]);
  return (
    <group>
      <mesh geometry={geos.romp} position={[-B / 2, 0, 0]} material={mat('#8a4632')} castShadow receiveShadow />
      <mesh geometry={geos.dek} position={[-B / 2 + 0.25, 0, 0]} material={mat('#9a948a')} receiveShadow />
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={geos.leuning} position={[s * (B / 2 - 0.13) - 0.13, 0, 0]} material={mat('#8a4632')} castShadow receiveShadow />
          <mesh geometry={geos.kap} position={[s * (B / 2 - 0.13) - 0.18, 0, 0]} material={mat('#b9b0a4')} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
}
/** Hoogte van het brugdek op afstand u (zelfde formule als in Boogbrug). */
const dekOp = (u: number, L: number, hoog = 0.95) => 0.06 + hoog * (1 - ((2 * u) / L - 1) ** 2);

/** Fiets die ergens tegenaan leunt (decor, lengte langs x). */
function Fiets({ pos, rot = 0, kleur, leun = 0.18 }: { pos: V3; rot?: number; kleur: string; leun?: number }) {
  const band = mat('#24272b', { rough: 0.8 });
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <group rotation={[leun, 0, 0]}>
        {[-0.52, 0.52].map((x) => (
          <mesh key={x} position={[x, 0.34, 0]} material={band} castShadow>
            <torusGeometry args={[0.31, 0.03, 5, 14]} />
          </mesh>
        ))}
        <Blok size={[0.66, 0.045, 0.045]} pos={[-0.12, 0.52, 0]} rot={[0, 0, 0.62]} color={kleur} r={0} />
        <Blok size={[0.56, 0.04, 0.04]} pos={[-0.06, 0.8, 0]} rot={[0, 0, -0.08]} color={kleur} r={0} />
        <Blok size={[0.045, 0.56, 0.045]} pos={[0.16, 0.6, 0]} rot={[0, 0, 0.3]} color={kleur} r={0} />
        <Blok size={[0.04, 0.62, 0.04]} pos={[-0.44, 0.66, 0]} rot={[0, 0, -0.25]} color={kleur} r={0} />
        <Blok size={[0.035, 0.035, 0.56]} pos={[-0.36, 1.0, 0]} color="#2f3634" r={0} />
        <Blok size={[0.24, 0.05, 0.14]} pos={[0.26, 0.92, 0]} color="#2a2420" r={0.02} />
        <Blok size={[0.34, 0.03, 0.16]} pos={[0.46, 0.7, 0]} color="#2f3634" r={0} />
      </group>
    </group>
  );
}

/** Amsterdammertje: het bruine paaltje langs de stoep. */
function Paaltje({ pos }: { pos: V2 }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Cil r={0.075} h={0.85} pos={[0, 0.425, 0]} color="#5a2a20" seg={8} />
      <Cil r={0.09} h={0.08} pos={[0, 0.88, 0]} color="#5a2a20" seg={8} />
    </group>
  );
}

/** Bankje (decor buiten de kamers). */
function Bankje({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.8, 0.08, 0.5]} pos={[0, 0.46, 0]} color="#7a5233" r={0.02} />
      <Blok size={[1.8, 0.4, 0.07]} pos={[0, 0.74, -0.22]} rot={[-0.15, 0, 0]} color="#7a5233" r={0.02} />
      {[-0.75, 0.75].map((x) => (
        <Blok key={x} size={[0.08, 0.46, 0.46]} pos={[x, 0.23, 0]} color="#2f3634" r={0.01} />
      ))}
    </group>
  );
}

/** Plantenbak met bloemen. */
function Plantenbak({ pos, b = 1.6, kleuren = ['#e86a9a', '#f2d04a', '#e5675a'] }: { pos: V3; b?: number; kleuren?: string[] }) {
  return (
    <group position={pos}>
      <Blok size={[b, 0.5, 0.6]} pos={[0, 0.25, 0]} color="#6e4a30" r={0.04} />
      <Blok size={[b - 0.1, 0.06, 0.5]} pos={[0, 0.5, 0]} color="#3f2a1c" r={0} shadow={false} />
      {Array.from({ length: Math.round(b * 3) }, (_, i) => (
        <mesh key={i} position={[-b / 2 + 0.2 + (i * (b - 0.4)) / Math.max(1, Math.round(b * 3) - 1), 0.62 + (i % 2) * 0.06, (i % 2 ? 0.1 : -0.1)]} material={mat(i % 3 === 1 ? '#4f7d3a' : kleuren[i % kleuren.length])}>
          <icosahedronGeometry args={[0.13, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/** Lindeboom in een plantvak met een rand van stenen. */
function Linde({ pos, s = 1, seed = 0 }: { pos: V2; s?: number; seed?: number }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Blok size={[1.5, 0.14, 1.5]} pos={[0, 0.07, 0]} color="#8f8a84" r={0.02} />
      <Blok size={[1.2, 0.04, 1.2]} pos={[0, 0.13, 0]} color="#4a3423" r={0} shadow={false} />
      <Loofboom pos={[0, 0.1, 0]} s={s} kleur={['#5f8a3a', '#6b9440', '#557f35'][seed % 3]} rot={seed} />
    </group>
  );
}

// ── Boten ────────────────────────────────────────────────────────────────

/** Woonboot (lengte langs x). */
function Woonboot({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[10, 0.9, 3.0]} pos={[0, -0.05, 0]} color="#2f4a3a" r={0.2} />
      <Blok size={[8.2, 1.9, 2.6]} pos={[-0.4, 1.3, 0]} color="#e9e1cf" r={0.06} />
      <Blok size={[8.6, 0.14, 2.9]} pos={[-0.4, 2.3, 0]} color="#3f3f47" r={0.03} />
      {[-3.6, -1.8, 0, 1.8, 3.2].map((x, i) => (
        <mesh key={x} position={[x - 0.4, 1.45, 1.31]} material={i % 2 ? glasUit : glasAan}>
          <boxGeometry args={[0.9, 0.8, 0.06]} />
        </mesh>
      ))}
      <Blok size={[0.9, 1.7, 0.06]} pos={[4.0, 1.2, 1.31]} color="#c94f3f" r={0} />
      <Plantenbak pos={[-3.2, 0.4, 1.38]} b={1.4} />
      <Plantenbak pos={[1.6, 0.4, 1.38]} b={1.2} kleuren={['#f2d04a', '#9b7fd0']} />
      <Cil r={0.25} h={0.5} pos={[4.4, 0.65, -0.6]} color="#c9a26a" seg={10} />
    </group>
  );
}

/** Vrachtaak langs de laadkade (lengte langs z). */
function Aak({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[2.8, 1.0, 10.5]} pos={[0, -0.2, 0]} color="#2a2d30" r={0.25} />
      <Blok size={[2.84, 0.14, 10.2]} pos={[0, 0.2, 0]} color="#b8433a" r={0.03} />
      <Blok size={[2.2, 0.5, 6.4]} pos={[0, 0.42, -0.6]} color="#3b4250" r={0.04} />
      {[-3.0, -1.4, 0.2, 1.8].map((z, i) => (
        <Blok key={z} size={[0.9, 0.6, 1.2]} pos={[(i % 2 ? 0.45 : -0.45), 0.97, z]} color={['#c99a62', '#3d7cc9', '#e48a3a', '#7cbf4a'][i]} r={0.04} />
      ))}
      <Blok size={[2.0, 1.3, 1.6]} pos={[0, 0.9, 4.0]} color="#e9e1cf" r={0.06} />
      <mesh position={[0, 1.2, 4.81]} material={glasAan}>
        <boxGeometry args={[1.4, 0.5, 0.04]} />
      </mesh>
      <Blok size={[2.2, 0.1, 1.8]} pos={[0, 1.6, 4.0]} color="#3f3f47" r={0.02} />
      <Cil r={0.04} h={1.4} pos={[0, 2.3, 4.6]} color="#2f3634" seg={5} />
      <Blok size={[0.5, 0.32, 0.02]} pos={[0.26, 2.8, 4.6]} color="#e5675a" r={0} />
    </group>
  );
}

/** Sloep / roeibootje aan de kant. */
function Sloep({ pos, rot = 0, kleur = '#3d7cc9' }: { pos: V3; rot?: number; kleur?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[3.2, 0.55, 1.3]} pos={[0, 0.0, 0]} color={kleur} r={0.25} />
      <Blok size={[2.9, 0.08, 1.05]} pos={[0, 0.26, 0]} color="#c08a55" r={0.03} />
      <Blok size={[0.3, 0.12, 1.1]} pos={[-0.4, 0.34, 0]} color="#c08a55" r={0.02} />
    </group>
  );
}

/** Eend (moeder of kuiken). */
function Eend({ pos, rot = 0, s = 1 }: { pos: V3; rot?: number; s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <mesh position={[0, 0.06, 0]} scale={[1.4, 0.75, 1]} material={mat('#8a6a4a')}>
        <sphereGeometry args={[0.13, 10, 8]} />
      </mesh>
      <mesh position={[0.15, 0.2, 0]} material={mat('#2f6b4f')}>
        <sphereGeometry args={[0.075, 10, 8]} />
      </mesh>
      <Blok size={[0.08, 0.025, 0.05]} pos={[0.24, 0.19, 0]} color="#e2b33c" r={0.01} />
    </group>
  );
}

/** Rondvaartboot die langs de achterste gracht vaart (onder de brug door). */
function Rondvaartboot() {
  const ref = useRef<THREE.Group>(null);
  const van = KXO - 1.5;
  const tot = W + 3.6; // de boeg blijft binnen het diorama
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = (clock.getElapsedTime() * 1.1) % (van - tot + 12);
    const x = van - t;
    g.position.x = x;
    g.position.y = -0.42 + Math.sin(clock.getElapsedTime() * 1.3) * 0.03;
    // aan de randen van het diorama verdwijnt hij in het water
    const rand = Math.min(1, Math.max(0, (x - tot) / 4), Math.max(0, (van - x) / 4));
    g.scale.setScalar(Math.max(0.001, rand));
    g.visible = rand > 0.01;
  });
  return (
    <group ref={ref} position={[van, -0.42, (KA + KO) / 2 + 0.6]}>
      <Statisch>
      <Blok size={[9.2, 0.7, 2.3]} pos={[0, -0.05, 0]} color="#1d3a6b" r={0.3} />
      <Blok size={[9.3, 0.08, 2.36]} pos={[0, 0.3, 0]} color="#f4efe6" r={0.04} />
      <Blok size={[7.4, 0.48, 2.0]} pos={[0.3, 0.56, 0]} color="#9cc8d8" r={0.08} rough={0.2} />
      <Blok size={[7.6, 0.07, 2.1]} pos={[0.3, 0.83, 0]} color="#f4efe6" r={0.03} />
      <Blok size={[0.6, 0.5, 1.6]} pos={[-4.0, 0.58, 0]} color="#f4efe6" r={0.06} />
      </Statisch>
    </group>
  );
}

// ── Kademuren ───────────────────────────────────────────────────────────
/** Gemetselde kademuur met een stenen rand, langs een waterkant (as: langs x of z, c = waterlijn, kant = richting water). */
function Kademuur({ as, c, van, tot, kant }: { as: 'x' | 'z'; c: number; van: number; tot: number; kant: 1 | -1 }) {
  const l = tot - van;
  const m = (van + tot) / 2;
  const muur = as === 'x' ? ([l, 1.5, 0.3] as V3) : ([0.3, 1.5, l] as V3);
  const kap = as === 'x' ? ([l, 0.1, 0.42] as V3) : ([0.42, 0.1, l] as V3);
  const p = (d: number, y: number): V3 => (as === 'x' ? [m, y, c + kant * d] : [c + kant * d, y, m]);
  return (
    <>
      <Blok size={muur} pos={p(0.15, -0.73)} color="#7e3f2e" r={0} shadow={false} />
      <Blok size={kap} pos={p(0.06, 0.03)} color="#a8a196" r={0} />
    </>
  );
}

// ── Alles samen ─────────────────────────────────────────────────────────
const LAAG = ['#5a4636', '#4a3a2e', '#3b2f26', '#2d241e'];
const L_BRUG = KA - KO + 0.4; // van de achtergevel tot over de overkant
const BRUG_H = 1.35; // hoog genoeg voor de rondvaartboot

export function MarkthalOmgeving() {
  const fietsKleur = ['#3f8f5a', '#c94f3f', '#2f3634', '#3d7cc9', '#e2b33c', '#9b7fd0'];
  return (
    <>
      <Statisch>
        <Terrein plan={PLAN} vorm={HOOFDKANT} boven="kinderkopjes" bovenKleur="#9e9182" lagen={LAAG} diepte={3.4} stenen="#7a6e64" seed={4} />
        <Terrein plan={PLAN} vorm={OVERKANT} boven="kinderkopjes" bovenKleur="#988a7c" lagen={LAAG} diepte={3.4} stenen="#7a6e64" seed={8} />

        {/* kademuren langs de grachten */}
        <Kademuur as="x" c={KA} van={W} tot={-1.9} kant={-1} />
        <Kademuur as="x" c={KA} van={1.9} tot={KX} kant={-1} />
        <Kademuur as="z" c={KX} van={KA} tot={H.z1} kant={1} />
        <Kademuur as="z" c={KX} van={H.z2} tot={Z} kant={1} />
        <Kademuur as="x" c={H.z1} van={H.x1} tot={KX} kant={1} />
        <Kademuur as="x" c={H.z2} van={H.x1} tot={KX} kant={-1} />
        <Kademuur as="z" c={H.x1} van={H.z1} tot={H.z2} kant={1} />
        <Kademuur as="x" c={KO} van={W} tot={-1.9} kant={1} />
        <Kademuur as="x" c={KO} van={1.9} tot={KXO} kant={1} />
        <Kademuur as="z" c={KXO} van={KO} tot={Z} kant={-1} />

        {/* grachtenpanden aan de overkant */}
        <Rij panden={RIJ_NOORD} d={7.9} />
        <Rij panden={RIJ_OOST} d={5.6} />

        {/* boogbrug achter de uitgang en het brugje over de oostelijke gracht */}
        <group position={[0, 0, -18.15]}>
          <Boogbrug L={L_BRUG} B={3.8} hoog={BRUG_H} />
          <Fiets pos={[1.5, dekOp(2.6, L_BRUG, BRUG_H), -2.6]} rot={Math.PI / 2} kleur={fietsKleur[0]} leun={-0.2} />
          <Fiets pos={[1.5, dekOp(6.8, L_BRUG, BRUG_H), -6.8]} rot={Math.PI / 2} kleur={fietsKleur[1]} leun={-0.2} />
          <Fiets pos={[-1.5, dekOp(7.6, L_BRUG, BRUG_H), -7.6]} rot={-Math.PI / 2} kleur={fietsKleur[3]} leun={-0.2} />
        </group>
        <group position={[KX - 0.2, 0, 20.5]} rotation={[0, -Math.PI / 2, 0]}>
          <Boogbrug L={KXO - KX + 0.4} B={3.0} hoog={0.6} />
          <Fiets pos={[-1.15, dekOp(2.4, KXO - KX + 0.4, 0.6), -2.4]} rot={Math.PI / 2} kleur={fietsKleur[4]} leun={0.2} />
          <Fiets pos={[-1.15, dekOp(5.0, KXO - KX + 0.4, 0.6), -5.0]} rot={Math.PI / 2} kleur={fietsKleur[2]} leun={0.2} />
        </group>

        {/* voorkant: stoep met paaltjes, plantenbakken en een fietsenrek (botsing in Markthal.tsx) */}
        {Array.from({ length: 13 }, (_, i) => (
          <Paaltje key={i} pos={[-5.4 + i * 1.5, 20.8]} />
        ))}
        <Plantenbak pos={[-15.6, 0, 21.4]} />
        <Plantenbak pos={[15.4, 0, 21.4]} kleuren={['#f2d04a', '#e48a3a', '#9b7fd0']} />
        <Blok size={[4.8, 0.06, 0.06]} pos={[-9.4, 0.5, 19.35]} color="#9aa3a8" r={0} />
        {[-11.2, -10.3, -9.4, -8.5, -7.6].map((x, i) => (
          <Fiets key={x} pos={[x, 0, 19.4]} rot={-Math.PI / 2} kleur={fietsKleur[i % fietsKleur.length]} leun={0} />
        ))}
        <Bankje pos={[-15.2, 0, 4.0]} rot={Math.PI / 2} />
        <Bankje pos={[17.6, 0, 14.6]} rot={Math.PI} />

        {/* bomen: lindes op de kades en aan de westkant */}
        <Linde pos={[-25.6, 20.2]} s={1.25} seed={1} />
        <Linde pos={[-25.4, 12.0]} s={1.15} seed={2} />
        <Linde pos={[-25.6, 2.0]} s={1.3} seed={3} />
        <Linde pos={[-25.4, -8.0]} s={1.2} seed={4} />
        <Linde pos={[-25.6, -15.4]} s={1.1} seed={5} />
        {[-23.5, -14.0, -6.0, 6.0, 15.5, 26.5, 37.0].map((x, i) => (
          <Linde key={x} pos={[x, KO - 1.0]} s={0.95 + (i % 3) * 0.12} seed={i} />
        ))}
        <Linde pos={[36.0, 6.0]} s={1.3} seed={6} />
        <Linde pos={[35.4, 13.5]} s={1.2} seed={7} />
        <Linde pos={[36.6, 20.2]} s={1.35} seed={8} />
        <Linde pos={[-15.6, -10.0]} s={1.1} seed={9} />
        <Linde pos={[-15.8, 10.4]} s={1.15} seed={10} />
        <Linde pos={[18.0, 18.4]} s={1.0} seed={11} />
        <Bankje pos={[31.4, 0, 10.0]} rot={Math.PI / 2} />
        <Bankje pos={[31.4, 0, 17.4]} rot={Math.PI / 2} />
        <Bankje pos={[-24.2, 0, 7.0]} rot={Math.PI / 2} />
        <Bankje pos={[-24.2, 0, -3.0]} rot={Math.PI / 2} />
        {[-14.2, -10.4, 4.6].map((z, i) => (
          <Fiets key={z} pos={[-22.75, 0, z]} rot={0} kleur={fietsKleur[(i + 2) % fietsKleur.length]} leun={0.25} />
        ))}

        {/* boten */}
        <Woonboot pos={[17.0, -0.45, KO + 1.75]} />
        <Woonboot pos={[-20.0, -0.45, KO + 1.75]} />
        <Aak pos={[25.4, -0.45, -8.4]} />
        <Sloep pos={[17.6, -0.42, 8.2]} rot={0.25} kleur="#c94f3f" />
        <Sloep pos={[KX + 1.2, -0.42, 14.0]} rot={Math.PI / 2} kleur="#3d7cc9" />
        <Sloep pos={[-10.5, -0.42, KO + 1.0]} kleur="#3f8f5a" />
        <Eend pos={[16.4, -0.45, 6.2]} rot={0.6} />
        <Eend pos={[15.8, -0.45, 6.8]} rot={0.8} s={0.55} />
        <Eend pos={[15.4, -0.45, 6.1]} rot={0.3} s={0.55} />
        <Eend pos={[25.0, -0.45, 4.4]} rot={2.0} />
        <Eend pos={[-14.0, -0.45, -22.0]} rot={2.4} />
      </Statisch>

      <Water pos={[(W + KXO) / 2, (KA + KO) / 2]} maat={[KXO - W, KA - KO]} kleur="#3b6f78" diep="#16343c" />
      <Water pos={[(KX + KXO) / 2, (KA + Z) / 2]} maat={[KXO - KX, Z - KA]} kleur="#3b6f78" diep="#16343c" />
      <Water pos={[(H.x1 + H.x2) / 2, 0]} maat={[H.x2 - H.x1, H.z2 - H.z1]} kleur="#3b6f78" diep="#16343c" />

      <Lantaarns
        punten={[
          // voorkant (stoep langs het plein)
          [-20.0, 21.3],
          [-6.2, 21.3],
          [5.0, 21.3],
          [14.2, 21.3],
          // westkant (straat langs de hal)
          [-14.6, -14.0],
          [-14.6, -2.0],
          [-14.6, 14.0],
          [-23.6, 6.0],
          // overkant achter
          [-26.4, KO - 1.0],
          [-19.0, KO - 1.0],
          [-10.0, KO - 1.0],
          [-2.4, KO - 0.9],
          [2.4, KO - 0.9],
          [10.6, KO - 1.0],
          [21.0, KO - 1.0],
          [31.5, KO - 1.0],
          // overkant oost
          [KXO + 0.9, -20.0],
          [KXO + 0.9, -9.0],
          [KXO + 0.9, 2.0],
          [KXO + 0.9, 17.0],
          // straat bij het haventje
          [14.0, 12.4],
          // laadkade (met botsing in Markthal.tsx)
          ...LANTAARNS_KADE,
        ]}
        kleur="#ffc677"
      />
      {/* lichtsnoeren: zigzag van haken in de voorgevel naar de palen aan de zuidkant van het plein */}
      <Lichtsnoer
        punten={[HAKEN_GEVEL[0], [PALEN_ZUID[0][0], 4.45, PALEN_ZUID[0][1]], HAKEN_GEVEL[1], [PALEN_ZUID[1][0], 4.45, PALEN_ZUID[1][1]], HAKEN_GEVEL[2], [PALEN_ZUID[2][0], 4.45, PALEN_ZUID[2][1]], HAKEN_GEVEL[3]]}
        kleuren={['#ffd27a', '#ff9a5a', '#fff1c0']}
        zak={0.6}
      />
      <Rondvaartboot />
    </>
  );
}
