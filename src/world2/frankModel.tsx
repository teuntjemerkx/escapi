// Frank in 3D: een groot, groen monster in een donker pak, met echte ledematen (heup, knie, schouder, elleboog),
// handen met vingers, een vierkant hoofd met wenkbrauwboog, oogleden, neus, oren, een pony en boutjes in zijn nek.
// Elk lichaamsdeel is samengevoegd tot één mesh (Statisch), zodat hij weinig tekenwerk kost.
import { useMemo, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat } from '../game/kit';
import { Statisch } from '../game/statisch';

type V3 = [number, number, number];

const HUID = '#8ab872';
const HUID_D = '#6c9659';
const HAAR = '#18171c';
const JAS = '#2f3833';
const JAS_D = '#222925';
const HEMD = '#d8d2c2';
const BROEK = '#26252c';
const LAARS = '#151314';
const ZOOL = '#0b0a0a';
const METAAL = '#9ba1a7';
const OOGWIT = '#ddd8c0';

// ── gedeelde vormen ──
const cache = new Map<string, THREE.BufferGeometry>();
const vorm = (sleutel: string, maak: () => THREE.BufferGeometry) => {
  let g = cache.get(sleutel);
  if (!g) cache.set(sleutel, (g = maak()));
  return g;
};
const bol = () => vorm('bol', () => new THREE.SphereGeometry(1, 22, 16));
const cil = (rTop: number, rOnder: number, h: number) => vorm(`cil${rTop}|${rOnder}|${h}`, () => new THREE.CylinderGeometry(rTop, rOnder, h, 16));
const pil = (r: number, l: number) => vorm(`pil${r}|${l}`, () => new THREE.CapsuleGeometry(r, l, 5, 12));
const kist = (w: number, h: number, d: number, r: number) => vorm(`kist${w}|${h}|${d}|${r}`, () => new RoundedBoxGeometry(w, h, d, 4, r));
/** Het jasje: een draaivorm van heup tot hals, platter van voor naar achter. */
const romp = () =>
  vorm('romp', () => {
    const p: [number, number][] = [
      [0.001, -0.05],
      [0.26, -0.05],
      [0.29, 0.02],
      [0.29, 0.18],
      [0.3, 0.32],
      [0.335, 0.5],
      [0.36, 0.62],
      [0.355, 0.72],
      [0.3, 0.8],
      [0.2, 0.86],
      [0.1, 0.885],
      [0.001, 0.89],
    ];
    const g = new THREE.LatheGeometry(
      p.map(([r, y]) => new THREE.Vector2(r, y)),
      28,
    );
    g.scale(1, 1, 0.6);
    return g;
  });
/** Rafelige pony over het voorhoofd. */
const pony = () =>
  vorm('pony', () => {
    const s = new THREE.Shape();
    const onder: [number, number][] = [
      [0.2, -0.02],
      [0.15, -0.065],
      [0.1, -0.015],
      [0.05, -0.07],
      [0, -0.02],
      [-0.05, -0.068],
      [-0.1, -0.012],
      [-0.15, -0.06],
      [-0.2, -0.02],
    ];
    s.moveTo(-0.205, 0.05);
    s.lineTo(0.205, 0.05);
    for (const [x, y] of onder) s.lineTo(x, y);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false });
  });
/** Bovenste helft van een bol: een ooglid. */
const lid = () => vorm('lid', () => new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2));

function D({ geo, kleur, pos, rot, schaal, rough = 0.8, metal = 0 }: { geo: THREE.BufferGeometry; kleur: string; pos?: V3; rot?: V3; schaal?: V3; rough?: number; metal?: number }) {
  return <mesh geometry={geo} material={mat(kleur, { rough, metal })} position={pos} rotation={rot} scale={schaal} castShadow receiveShadow />;
}

export interface FrankLeden {
  romp: THREE.Group | null;
  hoofd: THREE.Group | null;
  heup: (THREE.Group | null)[];
  knie: (THREE.Group | null)[];
  schouder: (THREE.Group | null)[];
  elleboog: (THREE.Group | null)[];
}
export const leegLeden = (): FrankLeden => ({ romp: null, hoofd: null, heup: [], knie: [], schouder: [], elleboog: [] });

/** Het lijf. Voeten op y = 0, kijkt naar +z, ongeveer 2,45 m hoog (de ouder schaalt hem). */
export function FrankLijf({ leden }: { leden: MutableRefObject<FrankLeden> }) {
  const l = leden.current;
  const zijden = useMemo(() => [-1, 1] as const, []);
  return (
    <group>
      {/* benen: dij, knie, scheen en grote laarzen met dikke zolen */}
      {zijden.map((k, i) => (
        <group key={`been${k}`} ref={(e) => void (l.heup[i] = e)} position={[k * 0.15, 0.98, 0]}>
          <Statisch>
            <D geo={cil(0.135, 0.115, 0.46)} kleur={BROEK} pos={[0, -0.22, 0]} rough={0.9} />
          </Statisch>
          <group ref={(e) => void (l.knie[i] = e)} position={[0, -0.44, 0]}>
            <Statisch>
              <D geo={bol()} kleur={BROEK} schaal={[0.116, 0.116, 0.116]} rough={0.9} />
              <D geo={cil(0.115, 0.106, 0.34)} kleur={BROEK} pos={[0, -0.17, 0]} rough={0.9} />
              <D geo={cil(0.118, 0.126, 0.06)} kleur={BROEK} pos={[0, -0.33, 0]} rough={0.9} />
              <D geo={cil(0.112, 0.118, 0.16)} kleur={LAARS} pos={[0, -0.41, 0.005]} rough={0.45} />
              <D geo={kist(0.23, 0.15, 0.37, 0.07)} kleur={LAARS} pos={[0, -0.455, 0.06]} rough={0.45} />
              <D geo={kist(0.25, 0.075, 0.4, 0.03)} kleur={ZOOL} pos={[0, -0.505, 0.065]} rough={0.7} />
            </Statisch>
          </group>
        </group>
      ))}
      {/* bovenlijf: alles boven de heup beweegt samen (wiegen, vooroverbuigen) */}
      <group ref={(e) => void (l.romp = e)} position={[0, 0.98, 0]}>
        <Statisch>
          <D geo={kist(0.5, 0.24, 0.31, 0.1)} kleur={BROEK} pos={[0, 0.02, 0]} rough={0.9} />
          <D geo={romp()} kleur={JAS} rough={0.88} />
          {zijden.map((k) => (
            <D key={`sch${k}`} geo={bol()} kleur={JAS} pos={[k * 0.33, 0.71, 0]} schaal={[0.14, 0.12, 0.13]} rough={0.88} />
          ))}
          {/* hemd met revers en knopen */}
          <D geo={bol()} kleur={HEMD} pos={[0, 0.69, 0.16]} schaal={[0.1, 0.19, 0.06]} rough={0.75} />
          {zijden.map((k) => (
            <D key={`rev${k}`} geo={pil(0.022, 0.26)} kleur={JAS_D} pos={[k * 0.075, 0.69, 0.205]} rot={[-0.2, 0, k * 0.32]} rough={0.85} />
          ))}
          <D geo={bol()} kleur={ZOOL} pos={[0, 0.43, 0.197]} schaal={[0.017, 0.017, 0.012]} rough={0.4} />
          <D geo={bol()} kleur={ZOOL} pos={[0, 0.3, 0.185]} schaal={[0.017, 0.017, 0.012]} rough={0.4} />
          {/* nek met boutjes */}
          <D geo={cil(0.095, 0.105, 0.2)} kleur={HUID} pos={[0, 0.93, 0]} rough={0.6} />
          {zijden.map((k) => (
            <group key={`bout${k}`} position={[k * 0.12, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
              <D geo={cil(0.026, 0.026, 0.1)} kleur={METAAL} rough={0.35} metal={0.8} />
              <D geo={cil(0.042, 0.042, 0.03)} kleur={METAAL} pos={[0, k * -0.05, 0]} rough={0.35} metal={0.8} />
            </group>
          ))}
        </Statisch>
        {/* armen: schouder, elleboog, grote groene handen met vingers */}
        {zijden.map((k, i) => (
          <group key={`arm${k}`} ref={(e) => void (l.schouder[i] = e)} position={[k * 0.41, 0.7, 0]}>
            <Statisch>
              <D geo={bol()} kleur={JAS} schaal={[0.12, 0.12, 0.12]} rough={0.88} />
              <D geo={cil(0.11, 0.095, 0.4)} kleur={JAS} pos={[0, -0.2, 0]} rough={0.88} />
            </Statisch>
            <group ref={(e) => void (l.elleboog[i] = e)} position={[0, -0.4, 0]}>
              <Statisch>
                <D geo={bol()} kleur={JAS} schaal={[0.096, 0.096, 0.096]} rough={0.88} />
                <D geo={cil(0.095, 0.086, 0.32)} kleur={JAS} pos={[0, -0.16, 0]} rough={0.88} />
                <D geo={cil(0.093, 0.099, 0.05)} kleur={JAS_D} pos={[0, -0.31, 0]} rough={0.85} />
                <D geo={cil(0.08, 0.08, 0.03)} kleur={HEMD} pos={[0, -0.345, 0]} rough={0.75} />
                <D geo={cil(0.05, 0.056, 0.07)} kleur={HUID} pos={[0, -0.38, 0]} rough={0.6} />
                <D geo={bol()} kleur={HUID} pos={[k * -0.005, -0.46, 0]} schaal={[0.042, 0.095, 0.078]} rough={0.6} />
                {[-0.045, -0.015, 0.015, 0.045].map((z) => (
                  <D key={`v${z}`} geo={pil(0.021, 0.075)} kleur={HUID} pos={[k * -0.012, -0.585, z]} rot={[0, 0, k * 0.22]} rough={0.6} />
                ))}
                <D geo={pil(0.024, 0.055)} kleur={HUID} pos={[k * -0.03, -0.47, 0.075]} rot={[0.75, 0, k * -0.3]} rough={0.6} />
              </Statisch>
            </group>
          </group>
        ))}
        {/* hoofd */}
        <group ref={(e) => void (l.hoofd = e)} position={[0, 0.99, 0]}>
          <Statisch>
            <D geo={kist(0.4, 0.36, 0.4, 0.11)} kleur={HUID} pos={[0, 0.3, 0]} rough={0.58} />
            <D geo={kist(0.36, 0.2, 0.36, 0.09)} kleur={HUID} pos={[0, 0.13, 0.015]} rough={0.58} />
            <D geo={kist(0.38, 0.06, 0.07, 0.025)} kleur={HUID_D} pos={[0, 0.335, 0.19]} rough={0.62} />
            {zijden.map((k) => (
              <group key={`oog${k}`} position={[k * 0.08, 0.285, 0.185]}>
                <D geo={bol()} kleur={OOGWIT} schaal={[0.036, 0.036, 0.036]} rough={0.3} />
                <D geo={bol()} kleur="#2b2b20" pos={[0, -0.004, 0.031]} schaal={[0.016, 0.016, 0.01]} rough={0.2} />
                <D geo={lid()} kleur={HUID_D} rot={[0.55, 0, 0]} schaal={[0.04, 0.04, 0.04]} rough={0.62} />
              </group>
            ))}
            <D geo={bol()} kleur={HUID} pos={[0, 0.215, 0.205]} schaal={[0.04, 0.065, 0.05]} rough={0.58} />
            <D geo={pil(0.011, 0.12)} kleur="#2a3324" pos={[0, 0.125, 0.193]} rot={[0, 0, Math.PI / 2]} rough={0.7} />
            <D geo={pil(0.014, 0.09)} kleur={HUID_D} pos={[0, 0.107, 0.188]} rot={[0, 0, Math.PI / 2]} rough={0.6} />
            {zijden.map((k) => (
              <D key={`oor${k}`} geo={bol()} kleur={HUID_D} pos={[k * 0.2, 0.25, 0]} schaal={[0.028, 0.055, 0.04]} rough={0.6} />
            ))}
            {/* litteken met hechtingen op de wang */}
            <D geo={cil(0.006, 0.006, 0.11)} kleur="#33402c" pos={[0.075, 0.19, 0.19]} rot={[0, 0, 0.9]} rough={0.7} />
            {[-0.035, 0, 0.035].map((t) => (
              <D key={`h${t}`} geo={cil(0.004, 0.004, 0.03)} kleur="#1f241c" pos={[0.075 + t * 0.78, 0.19 + t * 0.62, 0.192]} rot={[0, 0, 0.9 - Math.PI / 2]} rough={0.7} />
            ))}
            {/* plat zwart haar met een rafelige pony */}
            <D geo={kist(0.43, 0.08, 0.43, 0.035)} kleur={HAAR} pos={[0, 0.49, 0]} rough={0.75} />
            <D geo={kist(0.43, 0.2, 0.22, 0.05)} kleur={HAAR} pos={[0, 0.4, -0.11]} rough={0.75} />
            <D geo={pony()} kleur={HAAR} pos={[0, 0.45, 0.175]} rough={0.75} />
          </Statisch>
        </group>
      </group>
    </group>
  );
}

export type Houding = 'staan' | 'loop' | 'zwaai' | 'schrik' | 'lach' | 'loer' | 'schouders' | 'praat';

const naar = (o: THREE.Object3D | null | undefined, x: number, y: number, z: number, k: number) => {
  if (!o) return;
  o.rotation.x += (x - o.rotation.x) * k;
  o.rotation.y += (y - o.rotation.y) * k;
  o.rotation.z += (z - o.rotation.z) * k;
};

/** Zet de ledematen in een houding (zacht overvloeiend). `stap` = fase van de loopcyclus, `t` = tijd. */
export function zetHouding(l: FrankLeden, h: Houding, t: number, stap: number, dt: number) {
  const k = Math.min(1, dt * (h === 'schrik' ? 18 : 7));
  const loopt = h === 'loop';
  const s = Math.sin(stap);
  for (let i = 0; i < 2; i++) {
    const kant = i === 0 ? -1 : 1;
    const fase = i === 0 ? s : -s;
    const knieFase = Math.sin(stap + (i === 0 ? 0 : Math.PI) + 1.3);
    const hurk = h === 'loer' || h === 'schrik';
    naar(l.heup[i], loopt ? fase * 0.42 : hurk ? -0.2 : 0, 0, kant * 0.03, k);
    naar(l.knie[i], loopt ? 0.08 + Math.max(0, knieFase) * 0.75 : hurk ? 0.42 : 0.04, 0, 0, k);
    // gehurkt komen de voeten iets omhoog (dij -0.2 en scheen +0.22 kort de benen ~2 cm in): heup mee omlaag
    const hp = l.heup[i];
    if (hp) hp.position.y += (0.98 - (hurk ? 0.022 : 0) - hp.position.y) * k;
    let sx = 0,
      sz = kant * 0.07,
      ex = -0.18;
    if (loopt) {
      sx = -fase * 0.38;
      ex = -0.25 - Math.max(0, -fase) * 0.25;
    } else if (h === 'zwaai' && i === 1) {
      sx = -2.5;
      sz = 0.25 + Math.sin(t * 9) * 0.28;
      ex = -0.5;
    } else if (h === 'praat' && i === 1) {
      sx = -0.7 + Math.sin(t * 2.2) * 0.12;
      sz = 0.12;
      ex = -1.1 + Math.sin(t * 3.1) * 0.15;
    } else if (h === 'schrik') {
      sx = -2.35;
      sz = kant * 0.55;
      ex = -0.55;
    } else if (h === 'lach') {
      sx = -0.45;
      sz = kant * 0.28;
      ex = -1.45;
    } else if (h === 'loer') {
      sx = -1.05;
      sz = kant * 0.3;
      ex = -0.8;
    } else if (h === 'schouders') {
      sx = -0.35;
      sz = kant * 0.75;
      ex = -1.2;
    }
    naar(l.schouder[i], sx, 0, sz, k);
    naar(l.elleboog[i], ex, 0, 0, k);
  }
  const r = l.romp;
  if (r) {
    const op = loopt ? Math.abs(Math.cos(stap)) * 0.035 : Math.sin(t * 1.6) * 0.008;
    // gehurkt zakt het bovenlijf mee (dij -0.2, knie +0.42: samen ongeveer 9 cm lager)
    r.position.y = 0.98 + op - (h === 'loer' || h === 'schrik' ? 0.09 : 0);
    const voorover = h === 'schrik' ? 0.34 : h === 'loer' ? 0.14 : h === 'lach' ? -0.08 + Math.sin(t * 22) * 0.035 : loopt ? 0.05 : 0;
    naar(r, voorover, loopt ? s * 0.06 : 0, loopt ? s * 0.03 : 0, k);
  }
  // bij het schrikken buigt hij zijn hoofd naar je toe, bij het lachen gooit hij het naar achteren
  const kop = l.hoofd;
  if (kop) kop.rotation.x += ((h === 'schrik' ? 0.22 : h === 'lach' ? -0.28 : 0) - kop.rotation.x) * k;
}
