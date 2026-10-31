// Onderdelen van het Spookkasteel naar het voorbeeld van Bran (het "Dracula-kasteel"): de ronde toren met
// spitse kegel, de natuurstenen poorttoren, de kroon van de donjon met boogfriezen, het houten uitkijkhuisje,
// slanke witte schoorstenen, de houten galerij en de waterput op de binnenplaats, en de stenen rotstrap.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { metAanlicht, type Aanlicht } from '../game/aanlicht';
import { dakVorm } from '../game/dak';
import { dakZichtbaar } from '../game/huis';
import { Blok, mat } from '../game/kit';
import { Statisch } from '../game/statisch';
import { blokSteenTextuur, boogfriesTextuur, dakpanTextuur, kalkTextuur, vakwerkTextuur, vloerTextuur } from '../game/texturen';

type V2 = [number, number];
type V3 = [number, number, number];

export const PLEISTER = '#e4ded0';
export const PLEISTER_DONJON = '#cfcbc0';
export const PANNEN = '#9a4a2c';
export const NATUURSTEEN = '#6e665c';
/** Warm licht van de schijnwerpers in het bos, van de rotsvoet (y −8) tot ±14 m hoog. */
export const AANLICHT: Aanlicht = { kleur: '#ffc890', hoogte: 22, sterkte: 0.7, voet: -8 };

/** Materiaal met een textuur die per meter herhaalt (cilinders: omtrek en hoogte in meters zetten we in de uv). */
function tegel(t: THREE.Texture, rx: number, ry: number) {
  const c = t.clone();
  c.needsUpdate = true;
  c.wrapS = c.wrapT = THREE.RepeatWrapping;
  c.repeat.set(rx, ry);
  return c;
}

/** Kegel- of trommelvorm met de uv in meters (u rond, v omhoog), zodat pannen en pleister de goede maat hebben. */
function draai(profiel: V2[], n = 40) {
  const g = new THREE.LatheGeometry(
    profiel.map(([r, y]) => new THREE.Vector2(r, y)),
    n,
  );
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  // langs het profiel de afstand in meters
  const lengte: number[] = [0];
  for (let i = 1; i < profiel.length; i++) lengte.push(lengte[i - 1] + Math.hypot(profiel[i][0] - profiel[i - 1][0], profiel[i][1] - profiel[i - 1][1]));
  const rmax = Math.max(...profiel.map(([r]) => r));
  for (let i = 0; i < p.count; i++) {
    const j = i % profiel.length;
    uv.setXY(i, uv.getX(i) * 2 * Math.PI * rmax, lengte[j]);
  }
  return g;
}

/** Ronde toren (zuidwesthoek van Bran): brede trommel, ring-afdakje, smallere trommel en een heel spitse kegel. */
export function RondeToren({ pos, voet = -8, r1 = 5, h1 = 10.5, r2 = 3.25, h2 = 16.5, kegel = 9.5 }: { pos: V2; voet?: number; r1?: number; h1?: number; r2?: number; h2?: number; kegel?: number }) {
  const { delen } = useMemo(() => {
    const kalk = metAanlicht(new THREE.MeshStandardMaterial({ map: tegel(kalkTextuur(PLEISTER), 1 / 2.4, 1 / 2.4), roughness: 0.95 }), AANLICHT, 'kalk');
    const pan = new THREE.MeshStandardMaterial({ map: tegel(dakpanTextuur(PANNEN), 1, 1), roughness: 0.85, side: THREE.DoubleSide });
    const ijzer = mat('#2a2a2a', { metal: 0.6, rough: 0.5 });
    const delen: { geo: THREE.BufferGeometry; m: THREE.Material }[] = [
      {
        geo: draai([
          [r1, voet],
          [r1, h1],
        ]),
        m: kalk,
      },
      {
        geo: draai([
          [r1 + 0.45, h1 - 0.25],
          [r2 + 0.05, h1 + 1.5],
        ]),
        m: pan,
      },
      {
        geo: draai([
          [r2, h1 + 1.0],
          [r2, h2],
        ]),
        m: kalk,
      },
      // kegel met een licht uitwaaiende voet
      {
        geo: draai([
          [r2 + 0.55, h2 - 0.1],
          [r2 + 0.2, h2 + 0.5],
          [r2 * 0.55, h2 + kegel * 0.45],
          [0.12, h2 + kegel],
        ]),
        m: pan,
      },
      { geo: new THREE.SphereGeometry(0.22, 10, 8).translate(0, h2 + kegel + 0.15, 0), m: ijzer },
      { geo: new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6).translate(0, h2 + kegel + 0.9, 0), m: ijzer },
      { geo: new THREE.BoxGeometry(0.5, 0.05, 0.05).translate(0, h2 + kegel + 1.35, 0), m: ijzer },
    ];
    return { delen };
  }, [voet, r1, h1, r2, h2, kegel]);
  // kleine, onregelmatige raampjes en schietsleuven
  const ramen = useMemo(() => {
    const lijst: { a: number; y: number; r: number; b: number; h: number }[] = [];
    const a0 = [0.4, 1.3, 2.2, 3.4, 4.3, 5.3];
    a0.forEach((a, i) => lijst.push({ a, y: 2.2 + (i % 3) * 2.7, r: r1, b: i % 2 ? 0.25 : 0.55, h: i % 2 ? 0.9 : 0.8 }));
    [0.9, 2.9, 4.8].forEach((a) => lijst.push({ a, y: h2 - 1.6, r: r2, b: 0.5, h: 0.7 }));
    return lijst;
  }, [r1, r2, h2]);
  return (
    <group position={[pos[0], 0, pos[1]]}>
      {delen.map((d, i) => (
        <mesh key={i} geometry={d.geo} material={d.m} castShadow receiveShadow />
      ))}
      <Statisch>
        {ramen.map((w, i) => (
          <mesh key={i} position={[Math.sin(w.a) * (w.r + 0.01), w.y, Math.cos(w.a) * (w.r + 0.01)]} rotation={[0, w.a, 0]} material={mat('#1d1a1c')}>
            <planeGeometry args={[w.b, w.h]} />
          </mesh>
        ))}
      </Statisch>
    </group>
  );
}

/** Poorttoren van grove natuursteenblokken met een steil schilddak, twee werpkokers en een schoorsteen. */
export function PoortToren({ pos, maat = [7, 7], voet = -6, goot = 14 }: { pos: V2; maat?: V2; voet?: number; goot?: number }) {
  const [w, d] = maat;
  const h = goot - voet;
  const { steen, dak, gevel } = useMemo(() => {
    const steen = metAanlicht(new THREE.MeshStandardMaterial({ map: tegel(blokSteenTextuur(NATUURSTEEN), w / 2, h / 2), roughness: 0.95 }), AANLICHT, 'blok');
    const vorm = dakVorm([-w / 2, w / 2, -d / 2, d / 2], 'schild', 0.98, 0.5, 6.5);
    const pan = new THREE.MeshStandardMaterial({ map: tegel(dakpanTextuur(PANNEN), 1, 1), roughness: 0.85, side: THREE.DoubleSide });
    return { steen, dak: { geo: vorm.pannen, m: pan }, gevel: vorm };
  }, [w, d, h]);
  void gevel;
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, voet + h / 2, 0]} material={steen} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh geometry={dak.geo} material={dak.m} position={[0, goot, 0]} castShadow />
      <Statisch>
        {/* werpkokers op consoles, bovenaan de voorgevel en de zijgevel */}
        {(
          [
            [1.2, goot - 1.6, d / 2 + 0.25, 0],
            [-w / 2 - 0.25, goot - 1.6, -0.8, Math.PI / 2],
          ] as [number, number, number, number][]
        ).map(([x, y, z, r], i) => (
          <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
            <Blok size={[1.2, 1.3, 0.5]} color="#625a50" r={0.03} />
            <Blok size={[1.4, 0.12, 0.62]} pos={[0, 0.7, 0]} color={PANNEN} r={0.02} />
            {[-0.45, 0.45].map((cx) => (
              <Blok key={cx} size={[0.16, 0.5, 0.4]} pos={[cx, -0.85, -0.05]} color="#585046" r={0.02} />
            ))}
          </group>
        ))}
        {/* kleine vierkante raampjes */}
        {(
          [
            [-1.6, goot - 4.5, d / 2 + 0.01, 0],
            [1.9, goot - 8.2, d / 2 + 0.01, 0],
            [w / 2 + 0.01, goot - 5.5, 1.2, Math.PI / 2],
            [-w / 2 - 0.01, goot - 9, 1.6, -Math.PI / 2],
          ] as [number, number, number, number][]
        ).map(([x, y, z, r], i) => (
          <mesh key={`r${i}`} position={[x, y, z]} rotation={[0, r, 0]} material={mat('#1b1817')}>
            <planeGeometry args={[0.6, 0.6]} />
          </mesh>
        ))}
        <Schoorsteen pos={[-1.6, goot + 0.6, -1.2]} hoog={5.4} />
      </Statisch>
    </group>
  );
}

/** Slanke witte schoorsteen met een klein pannen-kapje. `pos` = voet (door het dak heen), `hoog` = lengte. */
export function Schoorsteen({ pos, hoog = 4, b = 0.8 }: { pos: V3; hoog?: number; b?: number }) {
  return (
    <group position={pos}>
      <Blok size={[b, hoog, b]} pos={[0, hoog / 2, 0]} color="#e0dacb" r={0.03} />
      <Blok size={[b + 0.12, 0.12, b + 0.12]} pos={[0, hoog - 0.05, 0]} color="#cfc8b8" r={0.02} />
      {[-1, 1].map((k) => (
        <mesh key={k} position={[0, hoog + 0.3, k * (b / 2 + 0.06) * 0.5]} rotation={[k * 0.75, 0, 0]} material={mat(PANNEN)}>
          <boxGeometry args={[b + 0.25, 0.06, b * 0.72]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Kroon van de donjon: twee rijen boogfries op consoles rondom, net onder de walgang. `vak` = de muurlijnen,
 * `y` = onderkant van de onderste rij (lokaal binnen de verdieping). Alles samen één vorm (één tekenstap).
 */
export function DonjonKroon({ vak, y }: { vak: [number, number, number, number]; y: number }) {
  const [x0, x1, z0, z1] = vak;
  const geo = useMemo(() => {
    const delen: THREE.BufferGeometry[] = [];
    const rij = (yy: number, uit: number) => {
      const w = x1 - x0 + uit * 2;
      const d = z1 - z0 + uit * 2;
      // [midden, maat, buitenvlak (BoxGeometry: +x, −x, +y, −y, +z, −z), aantal boogjes]
      const stukken: [V3, V3, number, number][] = [
        [[(x0 + x1) / 2, yy, z1 + uit / 2], [w, 1, uit], 4, Math.round(w / 0.9)],
        [[(x0 + x1) / 2, yy, z0 - uit / 2], [w, 1, uit], 5, Math.round(w / 0.9)],
        [[x1 + uit / 2, yy, (z0 + z1) / 2], [uit, 1, d], 0, Math.round(d / 0.9)],
        [[x0 - uit / 2, yy, (z0 + z1) / 2], [uit, 1, d], 1, Math.round(d / 0.9)],
      ];
      for (const [p, m, buiten, n] of stukken) {
        const g = new THREE.BoxGeometry(...m).toNonIndexed();
        const uv = g.attributes.uv as THREE.BufferAttribute;
        // elk vlak = 6 hoekpunten; alleen het buitenvlak krijgt de boogjes, de rest het effen lijstje bovenin
        for (let f = 0; f < 6; f++)
          for (let k = f * 6; k < f * 6 + 6; k++) {
            if (f === buiten) uv.setX(k, uv.getX(k) * n);
            else uv.setXY(k, 0.5, 0.97);
          }
        g.translate(...p);
        delen.push(g);
      }
    };
    rij(y + 0.5, 0.3);
    rij(y + 1.55, 0.5);
    const g = mergeGeometries(delen)!;
    delen.forEach((x) => x.dispose());
    return g;
  }, [x0, x1, z0, z1, y]);
  const m = useMemo(() => {
    const t = boogfriesTextuur(PLEISTER_DONJON).clone();
    t.needsUpdate = true;
    t.wrapS = THREE.RepeatWrapping;
    return metAanlicht(new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }), AANLICHT, 'fries');
  }, []);
  return <mesh geometry={geo} material={m} castShadow />;
}

/** Houten uitkijkhuisje bovenop de donjon: vier stijlen met bogen, een rood piramidedak en een ijzeren spits. */
export function Uitkijkhuisje({ pos, b = 3 }: { pos: V3; b?: number }) {
  const dak = useMemo(() => {
    const v = dakVorm([-b / 2, b / 2, -b / 2, b / 2], 'piramide', 1.18, 0.4, 3.4);
    return { geo: v.pannen, nok: v.nok, m: new THREE.MeshStandardMaterial({ map: tegel(dakpanTextuur(PANNEN), 1, 1), roughness: 0.85, side: THREE.DoubleSide }) };
  }, [b]);
  const H = 2.4;
  return (
    <group position={pos}>
      <Statisch>
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.22, H, 0.22]} pos={[(sx * (b - 0.22)) / 2, H / 2, (sz * (b - 0.22)) / 2]} color="#8a6e55" r={0.02} />))}
        {/* borstwering en bovenregel rondom, met een middenstijl per zijde (twee open bogen) */}
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r) => (
          <group key={r} rotation={[0, r, 0]}>
            <Blok size={[b, 0.7, 0.1]} pos={[0, 0.35, b / 2 - 0.05]} color="#6e5642" r={0.02} />
            <Blok size={[b, 0.26, 0.16]} pos={[0, H - 0.13, b / 2 - 0.08]} color="#7a604a" r={0.02} />
            <Blok size={[0.16, H - 0.7, 0.16]} pos={[0, 0.7 + (H - 0.7) / 2, b / 2 - 0.08]} color="#8a6e55" r={0.02} />
          </group>
        ))}
        <mesh position={[0, H + dak.nok + 0.15, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
          <sphereGeometry args={[0.16, 10, 8]} />
        </mesh>
        <mesh position={[0, H + dak.nok + 0.85, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
        </mesh>
        <mesh position={[0, H + dak.nok + 1.25, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
          <boxGeometry args={[0.45, 0.05, 0.05]} />
        </mesh>
      </Statisch>
      <mesh geometry={dak.geo} material={dak.m} position={[0, H, 0]} castShadow />
    </group>
  );
}

/**
 * Houten galerij met vakwerk-borstwering langs een muur van de binnenplaats, op de hoogte van de eerste verdieping.
 * `a`–`b` = de muurlijn (langs x), `diep` = hoe ver de galerij uitsteekt (naar −z), `y` = vloer van de galerij.
 */
export function Galerij({ a, b, z, diep = 1.5, y = 3.5, palen }: { a: number; b: number; z: number; diep?: number; y?: number; palen: number[] }) {
  const l = b - a;
  const mid = (a + b) / 2;
  const vakwerk = useMemo(() => new THREE.MeshStandardMaterial({ map: tegel(vakwerkTextuur('#e6dfd0', 1.0, '#2e241b'), l / 2.4, 1), roughness: 0.9 }), [l]);
  return (
    <group>
      <Statisch>
        {/* vloer van planken en de balklaag eronder */}
        <Blok size={[l, 0.14, diep]} pos={[mid, y - 0.07, z - diep / 2]} color="#4a3c31" r={0.01} />
        {palen.map((x) => (
          <group key={x}>
            <Blok size={[0.18, y + 2.4, 0.18]} pos={[x, (y + 2.4) / 2, z - diep + 0.12]} color="#3e2f24" r={0.02} />
            {/* korbeel */}
            <mesh position={[x, y - 0.45, z - diep / 2 + 0.05]} rotation={[0.75, 0, 0]} material={mat('#3e2f24')}>
              <boxGeometry args={[0.14, 0.14, diep * 0.9]} />
            </mesh>
          </group>
        ))}
        {/* afdakje van pannen */}
        <mesh position={[mid, y + 2.75, z - diep / 2 - 0.1]} rotation={[0.5, 0, 0]} material={mat(PANNEN, { rough: 0.85 })} castShadow>
          <boxGeometry args={[l + 0.4, 0.08, diep + 0.6]} />
        </mesh>
        <Blok size={[l, 0.14, 0.16]} pos={[mid, y + 2.35, z - diep + 0.12]} color="#3e2f24" r={0.01} />
      </Statisch>
      {/* borstwering met vakwerk */}
      <mesh position={[mid, y + 0.5, z - diep + 0.12]} material={vakwerk} castShadow>
        <boxGeometry args={[l, 1.0, 0.1]} />
      </mesh>
    </group>
  );
}

/** Stenen waterput met een smeedijzeren boog en een katrol. */
export function Waterput({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.45, 0]} material={mat('#8a8478', { rough: 0.95, flat: true })} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.9, 8]} />
      </mesh>
      <mesh position={[0, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#0c0a0a')}>
        <circleGeometry args={[0.52, 8]} />
      </mesh>
      <mesh position={[0, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#a39c8e', { rough: 0.9 })}>
        <torusGeometry args={[0.6, 0.09, 6, 8]} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.62, 1.55, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
          <cylinderGeometry args={[0.035, 0.035, 1.3, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]} material={mat('#2a2a2a', { metal: 0.6 })}>
        <torusGeometry args={[0.62, 0.035, 6, 16, Math.PI]} />
      </mesh>
      <mesh position={[0, 2.25, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#4a3c31')}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 10]} />
      </mesh>
      <mesh position={[0, 1.6, 0]} material={mat('#6b4a32')}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 4]} />
      </mesh>
      <mesh position={[0, 0.95, 0]} material={mat('#5a4030')}>
        <cylinderGeometry args={[0.12, 0.1, 0.22, 8]} />
      </mesh>
    </group>
  );
}

/**
 * Lange stenen trap tegen de rots op, van (x, y0, z0) naar (x, y1, z1) (langs z), met borstweringen
 * en een massieve voet tot op de bosgrond `bodem`.
 */
export function Rotstrap({ x, z0, z1, y0, y1, breed = 4, bodem = -8 }: { x: number; z0: number; z1: number; y0: number; y1: number; breed?: number; bodem?: number }) {
  const n = Math.max(6, Math.round((y1 - y0) / 0.18));
  const stap = (z1 - z0) / n;
  const op = (y1 - y0) / n;
  const traptex = useMemo(() => vloerTextuur('steen', '#7d7672'), []);
  const treden = useMemo(() => {
    const g: THREE.BufferGeometry[] = [];
    for (let i = 0; i < n; i++) {
      const top = y0 + (i + 1) * op;
      const z = z0 + (i + 0.5) * stap;
      const b = new THREE.BoxGeometry(breed, top - bodem, Math.abs(stap) + 0.02).toNonIndexed();
      b.translate(x, (top + bodem) / 2, z);
      g.push(b);
    }
    const m = mergeGeometries(g)!;
    g.forEach((x) => x.dispose());
    // uv in meters
    const p = m.attributes.position as THREE.BufferAttribute;
    const nn = m.attributes.normal as THREE.BufferAttribute;
    const uv = m.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const ny = Math.abs(nn.getY(i));
      const nx = Math.abs(nn.getX(i));
      uv.setXY(i, (ny > 0.5 ? p.getX(i) : nx > 0.5 ? p.getZ(i) : p.getX(i)) / 4, (ny > 0.5 ? p.getZ(i) : p.getY(i)) / 4);
    }
    return m;
  }, [n, stap, op, x, y0, z0, breed, bodem]);
  const muren = useMemo(() => {
    const l = Math.hypot(z1 - z0, y1 - y0);
    const hoek = Math.atan2(y1 - y0, Math.abs(z1 - z0)) * Math.sign(z0 - z1);
    return { l, hoek };
  }, [z0, z1, y0, y1]);
  return (
    <group>
      <mesh geometry={treden} castShadow receiveShadow>
        <meshStandardMaterial map={traptex} roughness={0.9} />
      </mesh>
      <Statisch>
        {[-1, 1].map((k) => (
          <group key={k} position={[x + k * (breed / 2 + 0.2), (y0 + y1) / 2 + 0.45, (z0 + z1) / 2]} rotation={[muren.hoek, 0, 0]}>
            <Blok size={[0.4, 0.9, muren.l + 0.4]} color="#a39c8e" r={0.04} />
          </group>
        ))}
      </Statisch>
    </group>
  );
}

/** Bospad: grind op de bosgrond (y −8) en het laatste stuk schuin omhoog naar de trap, met een aarden wal eronder. */
export function Bospadweg({ x, b, z0, z1, zHelling, y0, y1 }: { x: number; b: number; z0: number; z1: number; zHelling: number; y0: number; y1: number }) {
  const geo = useMemo(() => {
    // twee stukken: vlak (z0 → zHelling) en schuin (zHelling → z1); z0 > zHelling > z1
    const pos: number[] = [];
    const uv: number[] = [];
    const quad = (a: V3, bq: V3, c: V3, d: V3) => {
      for (const p of [a, bq, c, a, c, d]) {
        pos.push(...p);
        uv.push(p[0] / 4, p[2] / 4);
      }
    };
    const xl = x - b / 2;
    const xr = x + b / 2;
    quad([xl, y0 + 0.02, z0], [xr, y0 + 0.02, z0], [xr, y0 + 0.02, zHelling], [xl, y0 + 0.02, zHelling]);
    quad([xl, y0 + 0.02, zHelling], [xr, y0 + 0.02, zHelling], [xr, y1 + 0.02, z1], [xl, y1 + 0.02, z1]);
    // zijkanten van de wal
    for (const xx of [xl, xr]) quad([xx, y0, zHelling], [xx, y0, z1], [xx, y1 + 0.02, z1], [xx, y0 + 0.02, zHelling]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  }, [x, b, z0, z1, zHelling, y0, y1]);
  const t = useMemo(() => {
    const c = vloerTextuur('grind', '#4a463f').clone();
    c.needsUpdate = true;
    c.wrapS = c.wrapT = THREE.RepeatWrapping;
    c.repeat.set(1, 1);
    return c;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={t} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * Beboste bergen in de verte (het dal van Bran): een ring van heuvels, donker blauwgroen, zonder mist,
 * zodat ze als silhouet tegen de lucht staan.
 */
export function Bergen({ midden = [0, 10] as V2, r0 = 190, r1 = 270, y = -30, seed = 3 }: { midden?: V2; r0?: number; r1?: number; y?: number; seed?: number }) {
  const geo = useMemo(() => {
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const N = 160;
    const pos: number[] = [];
    const kleur: number[] = [];
    // twee rijen bergen: voor lager en donkerder, achter hoger en blauwer (nevel)
    const piek = Array.from({ length: N }, (_, i) => 22 + Math.sin(i * 0.37) * 7 + Math.sin(i * 0.13 + 1) * 9 + Math.sin(i * 1.7) * 2 + rnd() * 4);
    const achter = Array.from({ length: N }, (_, i) => 40 + Math.sin(i * 0.23 + 2) * 12 + Math.sin(i * 0.07) * 10 + rnd() * 5);
    const laag = new THREE.Color('#0c1630');
    const top = new THREE.Color('#1e3358');
    const ver = new THREE.Color('#2f4c82');
    const p = (i: number, r: number, h: number) => {
      const a = (i / N) * Math.PI * 2;
      return [midden[0] + Math.cos(a) * r, y + h, midden[1] + Math.sin(a) * r];
    };
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      for (const [r, hs, c] of [
        [r0, piek, top],
        [r1, achter, ver],
      ] as [number, number[], THREE.Color][]) {
        const a = p(i, r, 0);
        const b = p(j, r, 0);
        const c2 = p(j, r, hs[j]);
        const d = p(i, r, hs[i]);
        for (const [q, k] of [
          [a, laag],
          [b, laag],
          [c2, c],
          [a, laag],
          [c2, c],
          [d, c],
        ] as [number[], THREE.Color][]) {
          pos.push(...q);
          kleur.push(k.r, k.g, k.b);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(kleur, 3));
    return g;
  }, [midden, r0, r1, y, seed]);
  return (
    <mesh geometry={geo} renderOrder={-1}>
      <meshBasicMaterial vertexColors fog={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Daken en dakkapellen volgen de zichtbaarheid van de daken (weg als je in het poppenhuis naar binnen kijkt). */
export function OpDak({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = dakZichtbaar();
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Dwarshuis (zoals op Bran): een puntgevel met vakwerk die uit het grote dak naar voren steekt.
 * `vak` = [x0, x1, zAchter, zVoor] op de muurlijnen, `y` = bovenkant van de muur eronder.
 */
export function Dwarshuis({ vak, y, helling = 0.9 }: { vak: [number, number, number, number]; y: number; helling?: number }) {
  const vorm = useMemo(() => dakVorm(vak, 'zadel', helling, 0.4, 5.5, 'z'), [vak, helling]);
  const mats = useMemo(
    () => ({
      pan: new THREE.MeshStandardMaterial({ map: tegel(dakpanTextuur(PANNEN), 1, 1), roughness: 0.85, side: THREE.DoubleSide }),
      vak: metAanlicht(new THREE.MeshStandardMaterial({ map: tegel(vakwerkTextuur('#e6dfd0', 3.2, '#2e241b'), 1 / 2.4, 1 / 3.2), roughness: 0.92, side: THREE.DoubleSide }), AANLICHT, 'dwars'),
    }),
    [],
  );
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={vorm.pannen} material={mats.pan} castShadow />
      {vorm.gevels && <mesh geometry={vorm.gevels} material={mats.vak} castShadow />}
      {/* drie raampjes in de puntgevel */}
      {[-1, 0, 1].map((k) => (
        <mesh key={k} position={[(vak[0] + vak[1]) / 2 + k * 1.3, 1.2, vak[3] + 0.02]} material={k === 0 ? warmGlas : warmGlasDof}>
          <planeGeometry args={[0.7, 0.9]} />
        </mesh>
      ))}
    </group>
  );
}
const warmGlas = new THREE.MeshStandardMaterial({ color: '#5a3f22', emissive: '#ffb45c', emissiveIntensity: 1.1, roughness: 0.35 });
const warmGlasDof = new THREE.MeshStandardMaterial({ color: '#3a2a1a', emissive: '#ffb45c', emissiveIntensity: 0.55, roughness: 0.35 });

/** Kleine dakkapel met een zadeldakje en een raampje, op een dakvlak dat naar +z wijst. `pos` = voet van de voorgevel. */
export function Dakkapel({ pos, b = 1.5 }: { pos: V3; b?: number }) {
  const vorm = useMemo(() => dakVorm([-b / 2, b / 2, -2.2, 0], 'zadel', 0.95, 0.25, 1.2, 'z'), [b]);
  return (
    <group position={pos}>
      <Blok size={[b, 1.3, 2.2]} pos={[0, 0.65, -1.1]} color="#e2dccd" r={0.02} />
      <mesh position={[0, 0.7, 0.012]} material={warmGlasDof}>
        <planeGeometry args={[b * 0.5, 0.65]} />
      </mesh>
      <mesh geometry={vorm.pannen} position={[0, 1.3, 0]} material={dakpanMat()} castShadow />
      {vorm.gevels && <mesh geometry={vorm.gevels} position={[0, 1.3, 0]} material={mat('#e2dccd')} />}
    </group>
  );
}
let dakpanM: THREE.MeshStandardMaterial | null = null;
const dakpanMat = () => (dakpanM ??= new THREE.MeshStandardMaterial({ map: tegel(dakpanTextuur(PANNEN), 1, 1), roughness: 0.85, side: THREE.DoubleSide }));

/** Stenen balkon met balustrade op consoles (op de voorgevel van Bran). `pos` = midden aan de muur, op vloerhoogte. */
export function Balkon({ pos, b = 3.5, diep = 0.8 }: { pos: V3; b?: number; diep?: number }) {
  const n = Math.round(b / 0.28);
  return (
    <group position={pos}>
      <Blok size={[b, 0.18, diep]} pos={[0, 0, diep / 2]} color="#d8d1c2" r={0.03} />
      {[-b / 2 + 0.3, 0, b / 2 - 0.3].map((x) => (
        <Blok key={x} size={[0.22, 0.5, diep * 0.9]} pos={[x, -0.32, diep * 0.45]} color="#cfc8b8" r={0.04} />
      ))}
      <Blok size={[b, 0.1, 0.18]} pos={[0, 0.95, diep - 0.09]} color="#d8d1c2" r={0.03} />
      {[-1, 1].map((k) => (
        <Blok key={k} size={[0.14, 0.95, diep]} pos={[k * (b / 2 - 0.07), 0.5, diep / 2]} color="#d8d1c2" r={0.02} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[-b / 2 + 0.2 + (i * (b - 0.4)) / Math.max(1, n - 1), 0.5, diep - 0.09]} material={mat('#cfc8b8')}>
          <cylinderGeometry args={[0.045, 0.06, 0.8, 6]} />
        </mesh>
      ))}
    </group>
  );
}
