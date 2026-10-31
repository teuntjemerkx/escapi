// Mensen in de werelden: een echt lijf in plaats van blokjes. Schouders, ellebogen, knieën, handen met een duim,
// sneakers, en een gezicht met neus, oren, ogen en wenkbrauwen. Verschillende kapsels.
// `Mens` staat stil (en wordt samengevoegd tot één mesh); `SpelerLijf` is jouw poppetje en kan lopen.
// Voeten op y = 0, kijkt naar +z. Het basislijf is 1,76 m; met `hoogte` schaal je het.
import { useMemo, type MutableRefObject, type ReactNode } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat } from './kit';
import { Statisch } from './statisch';

type V3 = [number, number, number];
export type Kapsel = 'kort' | 'staart' | 'pet' | 'krul' | 'kaal' | 'lang';
export type Houding = 'staan' | 'zit' | 'zwaai';

/** Lengte van het basislijf, van zool tot kruin. */
export const BASIS_H = 1.76;

// ── gedeelde vormen (fijn en grof, voor kleine poppetjes in maquettes) ──
const cache = new Map<string, THREE.BufferGeometry>();
const vorm = (k: string, maak: () => THREE.BufferGeometry) => {
  let g = cache.get(k);
  if (!g) {
    g = maak();
    g.name = `mens:${k}`;
    cache.set(k, g);
  }
  return g;
};
const bol = (f: boolean) => vorm(`bol${f}`, () => (f ? new THREE.SphereGeometry(1, 16, 12) : new THREE.SphereGeometry(1, 9, 6)));
/** Voor kleine dingen (ogen, oren, neus, krullen): minder hoekpunten, dat zie je toch niet. */
const klein = (f: boolean) => vorm(`klein${f}`, () => (f ? new THREE.SphereGeometry(1, 10, 7) : new THREE.SphereGeometry(1, 6, 4)));
const halfBol = (f: boolean) => vorm(`half${f}`, () => new THREE.SphereGeometry(1, f ? 16 : 9, f ? 8 : 4, 0, Math.PI * 2, 0, Math.PI / 2));
const cil = (a: number, b: number, h: number, f: boolean) => vorm(`cil${a}|${b}|${h}|${f}`, () => new THREE.CylinderGeometry(a, b, h, f ? 12 : 7));
const pil = (r: number, l: number, f: boolean) => vorm(`pil${r}|${l}|${f}`, () => new THREE.CapsuleGeometry(r, l, f ? 3 : 1, f ? 8 : 5));
const kist = (w: number, h: number, d: number, r: number) => vorm(`kist${w}|${h}|${d}|${r}`, () => new RoundedBoxGeometry(w, h, d, 2, r));
/** Bovenlijf: een draaivorm van heup tot hals, platter van voor naar achter. */
const romp = (f: boolean, breed: number) =>
  vorm(`romp${f}${breed}`, () => {
    const p: [number, number][] = [
      [0.001, 0],
      [0.15, 0],
      [0.162, 0.05],
      [0.156, 0.19],
      [0.165, 0.31],
      [0.185, 0.43],
      [0.19, 0.49],
      [0.168, 0.545],
      [0.1, 0.578],
      [0.001, 0.585],
    ];
    const g = new THREE.LatheGeometry(
      p.map(([r, y]) => new THREE.Vector2(r * breed, y)),
      f ? 18 : 10,
    );
    g.scale(1, 1, 0.62 / breed);
    return g;
  });

function D({ geo, kleur, pos, rot, schaal, rough = 0.75, metal = 0 }: { geo: THREE.BufferGeometry; kleur: string; pos?: V3; rot?: V3; schaal?: V3; rough?: number; metal?: number }) {
  return <mesh geometry={geo} material={mat(kleur, { rough, metal })} position={pos} rotation={rot} scale={schaal} castShadow receiveShadow />;
}

export interface MensKleuren {
  shirt: string;
  broek: string;
  huid: string;
  haar: string;
  schoen?: string;
  kapsel?: Kapsel;
}

export interface Gewrichten {
  romp: THREE.Group | null;
  hoofd: THREE.Group | null;
  heup: (THREE.Group | null)[];
  knie: (THREE.Group | null)[];
  schouder: (THREE.Group | null)[];
  elleboog: (THREE.Group | null)[];
}
export const leegGewricht = (): Gewrichten => ({ romp: null, hoofd: null, heup: [], knie: [], schouder: [], elleboog: [] });

const ZIJ = [-1, 1] as const;

/** Het hoofd met gezicht en kapsel (midden van de schedel op y = 0.13 boven de hals). */
function Hoofd({ c, f }: { c: MensKleuren; f: boolean }) {
  const kapsel = c.kapsel ?? 'kort';
  const lip = useMemo(() => new THREE.Color(c.huid).lerp(new THREE.Color('#b0524a'), 0.45).getStyle(), [c.huid]);
  const wang = useMemo(() => new THREE.Color(c.huid).lerp(new THREE.Color('#e0806a'), 0.25).getStyle(), [c.huid]);
  return (
    <>
      <D geo={bol(f)} kleur={c.huid} pos={[0, 0.13, 0]} schaal={[0.104, 0.118, 0.11]} rough={0.6} />
      <D geo={bol(f)} kleur={c.huid} pos={[0, 0.07, 0.018]} schaal={[0.084, 0.07, 0.085]} rough={0.6} />
      <D geo={klein(f)} kleur={c.huid} pos={[0, 0.112, 0.105]} schaal={[0.015, 0.024, 0.02]} rough={0.6} />
      {ZIJ.map((k) => (
        <D key={`oor${k}`} geo={klein(f)} kleur={wang} pos={[k * 0.103, 0.12, -0.004]} schaal={[0.014, 0.028, 0.02]} rough={0.6} />
      ))}
      {f &&
        ZIJ.map((k) => (
          <group key={`oog${k}`} position={[k * 0.036, 0.138, 0.097]}>
            <D geo={klein(f)} kleur="#f4f1ea" schaal={[0.016, 0.014, 0.012]} rough={0.3} />
            <D geo={klein(f)} kleur="#2a2420" pos={[0, 0, 0.009]} schaal={[0.0085, 0.0085, 0.005]} rough={0.2} />
            <D geo={pil(0.0045, 0.026, f)} kleur={c.haar} pos={[k * 0.002, 0.024, 0.006]} rot={[0, 0, Math.PI / 2 - k * 0.1]} rough={0.8} />
          </group>
        ))}
      {!f &&
        ZIJ.map((k) => <D key={`oog${k}`} geo={klein(f)} kleur="#2a2420" pos={[k * 0.036, 0.138, 0.102]} schaal={[0.012, 0.012, 0.008]} rough={0.3} />)}
      <D geo={pil(0.007, 0.032, f)} kleur={lip} pos={[0, 0.07, 0.1]} rot={[0, 0, Math.PI / 2]} rough={0.5} />
      {/* kapsels */}
      {/* haarkap, iets naar achteren gekanteld: de haargrens ligt voor hoog en achter laag */}
      {kapsel !== 'kaal' && kapsel !== 'pet' && <D geo={halfBol(f)} kleur={c.haar} pos={[0, 0.15, -0.006]} rot={[-0.35, 0, 0]} schaal={[0.112, 0.105, 0.118]} rough={0.8} />}
      {kapsel !== 'kaal' && kapsel !== 'pet' && <D geo={bol(f)} kleur={c.haar} pos={[0.02, 0.215, 0.07]} rot={[0.5, 0, -0.35]} schaal={[0.07, 0.03, 0.05]} rough={0.8} />}
      {(kapsel === 'kort' || kapsel === 'staart' || kapsel === 'lang') && (
        <D geo={bol(f)} kleur={c.haar} pos={[0, 0.12, -0.035]} schaal={[0.108, 0.1, 0.09]} rough={0.8} />
      )}
      {kapsel === 'staart' && (
        <>
          <D geo={klein(f)} kleur={c.haar} pos={[0, 0.18, -0.11]} schaal={[0.032, 0.03, 0.03]} rough={0.8} />
          <D geo={pil(0.03, 0.13, f)} kleur={c.haar} pos={[0, 0.09, -0.135]} rot={[0.25, 0, 0]} rough={0.8} />
        </>
      )}
      {kapsel === 'lang' && <D geo={kist(0.2, 0.22, 0.06, 0.03)} kleur={c.haar} pos={[0, 0.03, -0.07]} rough={0.8} />}
      {kapsel === 'krul' &&
        [
          [0, 0.23, 0],
          [0.07, 0.21, 0.03],
          [-0.07, 0.21, 0.03],
          [0.08, 0.19, -0.05],
          [-0.08, 0.19, -0.05],
          [0, 0.2, -0.08],
          [0.04, 0.22, 0.07],
          [-0.04, 0.22, 0.07],
          [0.095, 0.14, -0.02],
          [-0.095, 0.14, -0.02],
          [0, 0.13, -0.1],
        ].map((p, i) => <D key={`k${i}`} geo={klein(f)} kleur={c.haar} pos={p as V3} schaal={[0.042, 0.042, 0.042]} rough={0.85} />)}
      {kapsel === 'pet' && (
        <>
          <D geo={halfBol(f)} kleur={c.haar} pos={[0, 0.165, -0.004]} schaal={[0.113, 0.095, 0.118]} rough={0.7} />
          <D geo={cil(0.08, 0.085, 0.012, f)} kleur={c.haar} pos={[0, 0.17, 0.1]} schaal={[1.05, 1, 0.75]} rough={0.7} />
          <D geo={klein(f)} kleur={c.haar} pos={[0, 0.262, 0]} schaal={[0.012, 0.008, 0.012]} rough={0.7} />
        </>
      )}
    </>
  );
}

/**
 * Het hele lijf met gewrichten. `g` krijgt de gewrichten (voor lopen); `houding` zet een vaste stand.
 * `rugzak` en `hoodie` zijn voor jouw eigen poppetje.
 */
export function Lijf({ c, g, houding = 'staan', fijn = true, rugzak = false, hoodie = false, inHand }: { c: MensKleuren; g?: MutableRefObject<Gewrichten>; houding?: Houding; fijn?: boolean; rugzak?: boolean; hoodie?: boolean; inHand?: ReactNode }) {
  const f = fijn;
  const zit = houding === 'zit';
  const schoen = c.schoen ?? '#f4f1ea';
  const zool = '#e9e4da';
  const r = g?.current;
  const romp2 = useMemo(() => new THREE.Color(c.shirt).multiplyScalar(0.82).getStyle(), [c.shirt]);
  return (
    <group>
      {/* benen: dij, knie, scheen en sneakers */}
      {ZIJ.map((k, i) => (
        <group key={`been${k}`} ref={(e) => void (r && (r.heup[i] = e))} position={[k * 0.095, 0.88, 0]} rotation={[zit ? -Math.PI / 2 : 0, 0, k * 0.02]}>
          <Statisch>
            <D geo={cil(0.085, 0.066, 0.43, f)} kleur={c.broek} pos={[0, -0.215, 0]} rough={0.85} />
          </Statisch>
          <group ref={(e) => void (r && (r.knie[i] = e))} position={[0, -0.43, 0]} rotation={[zit ? Math.PI / 2 : 0, 0, 0]}>
            <Statisch>
              <D geo={klein(f)} kleur={c.broek} schaal={[0.066, 0.066, 0.066]} rough={0.85} />
              <D geo={cil(0.063, 0.05, 0.36, f)} kleur={c.broek} pos={[0, -0.18, 0]} rough={0.85} />
              <D geo={cil(0.054, 0.058, 0.04, f)} kleur={c.broek} pos={[0, -0.355, 0]} rough={0.85} />
              <D geo={kist(0.095, 0.075, 0.21, 0.035)} kleur={schoen} pos={[0, -0.39, 0.035]} rough={0.6} />
              <D geo={kist(0.105, 0.03, 0.235, 0.012)} kleur={zool} pos={[0, -0.437, 0.04]} rough={0.8} />
            </Statisch>
          </group>
        </group>
      ))}
      {/* bovenlijf */}
      <group ref={(e) => void (r && (r.romp = e))} position={[0, 0.86, 0]}>
        <Statisch>
          <D geo={bol(f)} kleur={c.broek} pos={[0, 0.04, 0]} schaal={[0.165, 0.1, 0.105]} rough={0.85} />
          <D geo={romp(f, 1)} kleur={c.shirt} rough={0.85} />
          {/* zoom van de trui, net buiten de romp (anders flikkert hij) */}
          <D geo={cil(0.166, 0.168, 0.035, f)} kleur={romp2} pos={[0, 0.017, 0]} schaal={[1, 1, 0.64]} rough={0.85} />
          {ZIJ.map((k) => (
            <D key={`sch${k}`} geo={bol(f)} kleur={c.shirt} pos={[k * 0.165, 0.49, 0]} schaal={[0.075, 0.07, 0.07]} rough={0.85} />
          ))}
          <D geo={cil(0.043, 0.047, 0.09, f)} kleur={c.huid} pos={[0, 0.61, 0]} rough={0.6} />
          {hoodie && (
            <>
              <D geo={vorm('kap', () => new THREE.TorusGeometry(0.085, 0.035, 8, 18))} kleur={romp2} pos={[0, 0.57, -0.03]} rot={[Math.PI / 2 - 0.35, 0, 0]} rough={0.9} />
              {ZIJ.map((k) => (
                <D key={`koord${k}`} geo={cil(0.004, 0.004, 0.12, f)} kleur="#f4f1ea" pos={[k * 0.03, 0.46, 0.115]} rot={[0.12, 0, 0]} rough={0.7} />
              ))}
              <D geo={kist(0.17, 0.08, 0.03, 0.012)} kleur={romp2} pos={[0, 0.2, 0.1]} rough={0.9} />
            </>
          )}
          {rugzak && (
            <>
              <D geo={kist(0.26, 0.32, 0.12, 0.045)} kleur="#3f6b8a" pos={[0, 0.33, -0.16]} rough={0.7} />
              <D geo={kist(0.18, 0.11, 0.05, 0.02)} kleur="#2f5570" pos={[0, 0.25, -0.235]} rough={0.7} />
              {ZIJ.map((k) => (
                <D key={`band${k}`} geo={kist(0.035, 0.36, 0.02, 0.008)} kleur="#2f5570" pos={[k * 0.085, 0.36, 0.105]} rot={[-0.08, 0, 0]} rough={0.7} />
              ))}
            </>
          )}
        </Statisch>
        {/* armen */}
        {ZIJ.map((k, i) => (
          <group
            key={`arm${k}`}
            ref={(e) => void (r && (r.schouder[i] = e))}
            position={[k * 0.19, 0.48, 0]}
            rotation={houding === 'zwaai' && k === 1 ? [-2.6, 0, 0.25] : zit ? [-0.5, 0, k * 0.05] : [0, 0, k * 0.08]}
          >
            <Statisch>
              <D geo={cil(0.054, 0.046, 0.28, f)} kleur={c.shirt} pos={[0, -0.14, 0]} rough={0.85} />
            </Statisch>
            <group ref={(e) => void (r && (r.elleboog[i] = e))} position={[0, -0.28, 0]} rotation={[houding === 'zwaai' && k === 1 ? -0.5 : zit ? -0.9 : -0.12, 0, 0]}>
              <Statisch>
                <D geo={klein(f)} kleur={c.shirt} schaal={[0.046, 0.046, 0.046]} rough={0.85} />
                <D geo={cil(0.045, 0.036, 0.24, f)} kleur={c.shirt} pos={[0, -0.12, 0]} rough={0.85} />
                <D geo={cil(0.03, 0.034, 0.04, f)} kleur={c.huid} pos={[0, -0.25, 0]} rough={0.6} />
                <D geo={klein(f)} kleur={c.huid} pos={[k * -0.004, -0.305, 0.004]} schaal={[0.024, 0.048, 0.04]} rough={0.6} />
                <D geo={pil(0.012, 0.028, f)} kleur={c.huid} pos={[k * -0.016, -0.3, 0.034]} rot={[0.6, 0, k * -0.25]} rough={0.6} />
              </Statisch>
              {inHand && k === 1 && <group position={[0, -0.33, 0.02]}>{inHand}</group>}
            </group>
          </group>
        ))}
        {/* hoofd */}
        <group ref={(e) => void (r && (r.hoofd = e))} position={[0, 0.65, 0]}>
          <Statisch>
            <Hoofd c={c} f={f} />
          </Statisch>
        </group>
      </group>
    </group>
  );
}

/**
 * Een mens die stilstaat (of zit, of zwaait). `hoogte` = lengte van top tot teen; zittend begint het lijf
 * bij de heup (op y = 0).
 */
export function Mens({
  c,
  hoogte = BASIS_H,
  houding = 'staan',
  pos,
  rot,
  fijn: fijnGevraagd,
  children,
}: {
  c: MensKleuren;
  hoogte?: number;
  houding?: Houding;
  pos?: V3;
  rot?: number;
  /** Veel detail (gezicht, vingers)? Standaard alleen als het poppetje groter is dan 60 cm. */
  fijn?: boolean;
  children?: ReactNode;
}) {
  const s = hoogte / BASIS_H;
  const fijn = fijnGevraagd ?? hoogte > 0.95;
  return (
    <group position={pos} rotation={[0, rot ?? 0, 0]}>
      <group scale={s} position={[0, houding === 'zit' ? -0.88 * s : 0, 0]}>
        <Lijf c={c} houding={houding} fijn={fijn} />
      </group>
      {children}
    </group>
  );
}

const naar = (o: THREE.Object3D | null | undefined, x: number, z: number, k: number) => {
  if (!o) return;
  o.rotation.x += (x - o.rotation.x) * k;
  o.rotation.z += (z - o.rotation.z) * k;
};

/** Loopbeweging: heup en knie, schouder en elleboog, een beetje op en neer. `v` = 0 (stil) … 1 (lopen). */
export function beweegLijf(g: Gewrichten, stap: number, v: number, t: number, dt: number) {
  const k = Math.min(1, dt * 10);
  const s = Math.sin(stap);
  const a = Math.min(1, v);
  for (let i = 0; i < 2; i++) {
    const kant = i === 0 ? -1 : 1;
    const fase = i === 0 ? s : -s;
    const knie = Math.sin(stap + (i === 0 ? 0 : Math.PI) + 1.3);
    naar(g.heup[i], fase * 0.55 * a, kant * 0.02, k);
    naar(g.knie[i], (0.06 + Math.max(0, knie) * 0.9) * a, 0, k);
    naar(g.schouder[i], -fase * 0.5 * a, kant * 0.08, k);
    naar(g.elleboog[i], -0.15 - Math.max(0, -fase) * 0.45 * a, 0, k);
  }
  if (g.romp) {
    g.romp.position.y = 0.86 + Math.abs(Math.cos(stap)) * 0.03 * a + (1 - a) * Math.sin(t * 1.8) * 0.004;
    g.romp.rotation.y = s * 0.08 * a;
    g.romp.rotation.x = 0.04 * a;
  }
  if (g.hoofd) g.hoofd.rotation.y = -s * 0.06 * a;
}
