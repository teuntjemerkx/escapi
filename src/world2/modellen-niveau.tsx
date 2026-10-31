// 3D-objecten voor de vragen op niveau (zelfstandige verwerking).
import { useMemo } from 'react';
import { Deel, Maat, useInspectie } from '../game/inspectie';
import { Blok, Boom, Cil, Haag, mat, Raam, Struik } from '../game/kit';
import { P } from '../game/palette';
import { Bordje } from '../game/tekst';
import { Symbool, VouwDoos } from '../game/vouw';
import { useSpel } from '../game/store';
import { useGroei, useOpgelost, useTip } from '../game/opgelost';
import { Vijver } from './Decor';

type V3 = [number, number, number];

/** NIV-01: kubus die openvouwt tot de uitslag uit het werkboek, met keuzekubussen A–D. */
export function Dobbelsteen() {
  const s = 1.2;
  const leeg = { kleur: '#f6efe2' };
  return (
    <group>
      <Blok size={[1.6, 0.6, 1.6]} pos={[0, 0.3, 0]} color={P.steen} r={0.08} />
      <group position={[0, 0.6, 0]}>
        <VouwDoos
          w={s}
          d={s}
          h={s}
          boven={leeg}
          zijden={{
            nx: { kleur: '#f6efe2', decal: <Symbool soort="ster" s={s} /> },
            px: { kleur: '#f6efe2', decal: <Symbool soort="ring" s={s} /> },
            nz: { kleur: '#f6efe2', decal: <Symbool soort="vierkant" s={s} /> },
            pz: { kleur: '#f6efe2', decal: <Symbool soort="stip" s={s} /> },
          }}
          onder={leeg}
          onderAan="px"
          begintOpen
        />
      </group>
      {(
        [
          ['A', null, 'stip', 'ring'],
          ['B', null, 'stip', null],
          ['C', null, 'ster', 'ring'],
          ['D', 'ster', null, null],
        ] as const
      ).map(([letter, top, links, rechts], i) => (
        <group key={letter} position={[-2.25 + i * 1.5, 0, 2.4]}>
          <Cil r={0.08} h={0.9} pos={[0, 0.45, 0]} color={P.kozijn} seg={8} />
          <OptieKubus top={top} links={links} rechts={rechts} pos={[0, 1.2, 0]} />
          <Bordje regels={[letter]} breed={0.36} hoog={0.36} pos={[0, 0.55, 0.1]} bg={P.wit} rand="#2f5d46" />
        </group>
      ))}
    </group>
  );
}

type Sym = 'vierkant' | 'ster' | 'ring' | 'stip' | null;
/** Kleine kubus: bovenvlak, voorvlak (+z, links in beeld) en rechtervlak (+x). */
function OptieKubus({ top, links, rechts, pos }: { top: Sym; links: Sym; rechts: Sym; pos: V3 }) {
  const s = 0.6;
  return (
    <group position={pos} rotation={[0, 0, 0]}>
      <Blok size={[s, s, s]} color="#f6efe2" r={0.03} />
      {top && (
        <group position={[0, s / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Symbool soort={top} s={s} />
        </group>
      )}
      {links && (
        <group position={[0, 0, s / 2 + 0.005]}>
          <Symbool soort={links} s={s} />
        </group>
      )}
      {rechts && (
        <group position={[s / 2 + 0.005, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Symbool soort={rechts} s={s} />
        </group>
      )}
    </group>
  );
}

/** NIV-02: gele uitslag op een werkbank die dichtvouwt tot een balk. */
export function UitslagBalk() {
  const geel = { kleur: '#f6dd3c' };
  return (
    <group>
      <Blok size={[2.6, 0.12, 1.6]} pos={[0, 0.9, 0]} color={P.hout} r={0.03} />
      {[
        [-1.15, -0.65],
        [1.15, -0.65],
        [-1.15, 0.65],
        [1.15, 0.65],
      ].map(([x, z], i) => (
        <Blok key={i} size={[0.12, 0.9, 0.12]} pos={[x, 0.45, z]} color={P.houtLicht} r={0.02} />
      ))}
      <group position={[0, 0.96, 0]}>
        <VouwDoos w={0.4} d={1.2} h={0.4} boven={geel} zijden={{ nx: geel, px: geel, nz: geel, pz: geel }} onder={geel} onderAan="nx" begintOpen />
      </group>
    </group>
  );
}

/** NIV-03: L-vormig terras (8 m boven, 4 m links, 6 m onder, 2 m rechts) met lint eromheen. */
export function Terras() {
  const lint = (a: [number, number], b: [number, number], id?: string) => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const l = Math.hypot(dx, dz);
    const stuk = (
      <group position={[(a[0] + b[0]) / 2, 0.75, (a[1] + b[1]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
        <Blok size={[l, 0.06, 0.04]} color={id ? '#e5675a' : '#d94b3a'} r={0.02} />
      </group>
    );
    return id ? (
      <Deel key={id} id={id} uit={[0, 0.5, 0]} label="2 m">
        {stuk}
      </Deel>
    ) : (
      stuk
    );
  };
  const hoeken: [number, number][] = [
    [-4, -2],
    [4, -2],
    [4, 0],
    [2, 0],
    [2, 2],
    [-4, 2],
  ];
  return (
    <group>
      <Blok size={[8, 0.2, 2]} pos={[0, 0.1, -1]} color={P.houtLicht} r={0.04} />
      <Blok size={[6, 0.2, 2]} pos={[-1, 0.1, 1]} color={P.houtLicht} r={0.04} />
      {Array.from({ length: 16 }, (_, i) => (
        <Blok key={i} size={[0.03, 0.01, i < 8 ? 2 : 2]} pos={[-3.75 + (i % 8) * (i < 8 ? 1.07 : 0.8), 0.205, i < 8 ? -1 : 1]} color={P.hout} r={0.002} shadow={false} />
      ))}
      {hoeken.map(([x, z], i) => (
        <Cil key={i} r={0.06} h={0.9} pos={[x, 0.45, z]} color={P.wit} seg={8} />
      ))}
      {lint([-4, -2], [4, -2])}
      {lint([4, -2], [4, 0])}
      {lint([4, 0], [2, 0], 'zijde-in-onder')}
      {lint([2, 0], [2, 2], 'zijde-in-zij')}
      {lint([2, 2], [-4, 2])}
      {lint([-4, 2], [-4, -2])}
      <group position={[-1.5, 0.2, -0.8]}>
        <Cil r={0.04} h={2.2} pos={[0, 1.1, 0]} color={P.wit} seg={8} />
        <mesh position={[0, 2.2, 0]} castShadow material={mat('#e5675a')}>
          <coneGeometry args={[1.1, 0.5, 8]} />
        </mesh>
        <Cil r={0.45} h={0.06} pos={[0, 0.75, 0]} color={P.wit} seg={16} />
      </group>
      <Maat van={[-4, 0.3, -2.6]} naar={[4, 0.3, -2.6]} label="8 m" />
      <Maat van={[-4.6, 0.3, -2]} naar={[-4.6, 0.3, 2]} label="4 m" />
      <Maat van={[-4, 0.3, 2.6]} naar={[2, 0.3, 2.6]} label="6 m" />
      <Maat van={[4.6, 0.3, -2]} naar={[4.6, 0.3, 0]} label="2 m" />
    </group>
  );
}

/** NIV-04/05/06: maquette van de vleugel van de graaf. Het dak schuift weg; binnen de slaapkamer (3,4 × 4 m) en de badkamer. */
export function HuisLucas() {
  const W = 7;
  const D = 6;
  const H = 3.4;
  return (
    <group>
      <Blok size={[W, 0.12, D]} pos={[0, 0.06, 0]} color={P.steen} r={0.03} />
      {/* buitenmuren */}
      <Blok size={[W, H, 0.2]} pos={[0, H / 2, -D / 2 + 0.1]} color={P.muur} r={0.06} />
      <Blok size={[0.2, H, D]} pos={[-W / 2 + 0.1, H / 2, 0]} color={P.muur} r={0.06} />
      <Blok size={[0.2, H, D]} pos={[W / 2 - 0.1, H / 2, 0]} color={P.muur} r={0.06} />
      <Blok size={[W, H, 0.2]} pos={[0, H / 2, D / 2 - 0.1]} color={P.muur} r={0.06} />
      <Blok size={[1.0, 2.0, 0.08]} pos={[1.7, 1.0, D / 2 + 0.02]} color={P.hout} r={0.03} />
      <Raam w={1.4} h={1.1} pos={[-1.6, H * 0.55, D / 2 + 0.03]} />
      <Raam w={0.9} h={0.8} pos={[W / 2 + 0.03, H * 0.6, -1.5]} rot={[0, Math.PI / 2, 0]} />
      <Blok size={[0.12, H * 0.75, D * 0.5]} pos={[W / 2 + 0.05, H * 0.45, 1.2]} color={P.hout} r={0.03} />
      {/* binnen: slaapkamer links (3,4 × 4), badkamer rechts achter (2 × 4) */}
      <group position={[-3.3, 0.13, -2.8]}>
        <Blok size={[3.4, 0.03, 4]} pos={[1.7, 0, 2]} color="#d9b07a" r={0.01} shadow={false} />
        {Array.from({ length: 7 }, (_, i) => (
          <Blok key={i} size={[3.4, 0.005, 0.02]} pos={[1.7, 0.017, 0.3 + i * 0.55]} color="#c49662" r={0.002} shadow={false} />
        ))}
        <Blok size={[0.1, 2.6, 4]} pos={[3.45, 1.3, 2]} color={P.muur2} r={0.03} />
        <Blok size={[3.4, 2.6, 0.1]} pos={[1.7, 1.3, 4.05]} color={P.muur2} r={0.03} />
        {/* bed met kat */}
        <Blok size={[1.0, 0.35, 2.0]} pos={[0.8, 0.2, 1.1]} color={P.hout} r={0.05} />
        <Blok size={[0.95, 0.15, 1.5]} pos={[0.8, 0.42, 1.35]} color="#8fb0a6" r={0.06} />
        <Blok size={[0.7, 0.12, 0.35]} pos={[0.8, 0.45, 0.35]} color={P.wit} r={0.05} />
        <group position={[0.75, 0.55, 1.6]}>
          <Blok size={[0.32, 0.16, 0.24]} color="#e48a3a" r={0.08} />
          <Blok size={[0.15, 0.13, 0.15]} pos={[0.16, 0.06, 0.02]} color="#e48a3a" r={0.06} />
        </group>
        <Blok size={[0.45, 0.5, 0.4]} pos={[0.1 + 0.15, 0.25, 0.3]} color={P.houtLicht} r={0.04} />
        <Cil r={0.08} rTop={0.13} h={0.18} pos={[0.25, 0.62, 0.3]} color="#f4e7c4" seg={12} />
        <Blok size={[0.6, 2.0, 1.4]} pos={[3.05, 1.0, 1.0]} color="#9fb3b0" r={0.05} />
        <Blok size={[1.8, 0.02, 0.9]} pos={[2.0, 0.02, 3.2]} color="#7fa08f" r={0.01} shadow={false} />
        <Maat van={[0, 0.1, 4.25]} naar={[3.4, 0.1, 4.25]} label="3,4 m" />
        <Maat van={[-0.25, 0.1, 0]} naar={[-0.25, 0.1, 4]} label="4 m" />
      </group>
      <group position={[1.1, 0.13, -2.8]}>
        <Blok size={[2, 0.03, 4]} pos={[1, 0, 2]} color="#cfe3e6" r={0.01} shadow={false} />
        {Array.from({ length: 30 }, (_, i) => (
          <Blok key={i} size={[0.38, 0.01, 0.38]} pos={[0.2 + (i % 5) * 0.4, 0.02, 0.2 + Math.floor(i / 5) * 0.4]} color={i % 2 ? '#e4f0f2' : '#bcd8dd'} r={0.004} shadow={false} />
        ))}
        <Blok size={[0.8, 0.55, 1.7]} pos={[1.45, 0.3, 1.0]} color={P.wit} r={0.15} />
        <Blok size={[0.65, 0.1, 1.5]} pos={[1.45, 0.55, 1.0]} color={P.water} r={0.05} />
        <Blok size={[0.5, 0.4, 0.35]} pos={[0.35, 0.8, 3.75]} color={P.wit} r={0.08} />
        <Bordje regels={['badkamer', '80.000 cm²']} breed={1.3} hoog={0.6} pos={[0.8, 0.05, 2.9]} rot={[-Math.PI / 2, 0, 0]} />
      </group>
      <Deel id="dak" uit={[0, 2.6, -7.5]} label="Dak">
        <Blok size={[W + 0.3, 0.32, D + 0.3]} pos={[0, H + 0.16, 0]} color={P.dakRand} r={0.08} />
        <Blok size={[W - 0.2, 0.2, D - 0.2]} pos={[0, H + 0.36, 0]} color={P.dak} r={0.06} />
      </Deel>
      <Deel id="vloer" uit={[0, 0, 0]} label="Slaapkamer 3,4 × 4 m">
        <group />
      </Deel>
    </group>
  );
}

/** NIV-07/08: de tuin van Frank (6 × 6 m) met vijver van 15 dm. */
/** Na opdracht 7 staat er echt een wit hekje om de vijver. */
function HekjeRondVijver() {
  const af = useOpgelost('O2-NIV-07');
  const ref = useGroei(af, 0.2);
  const z = 0.92;
  return (
    <group ref={ref}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Blok size={[1.9, 0.05, 0.05]} pos={[0, 0.28, s * z]} color="#f4f1ea" r={0.01} />
          <Blok size={[0.05, 0.05, 1.9]} pos={[s * z, 0.28, 0]} color="#f4f1ea" r={0.01} />
          {[-0.9, -0.45, 0, 0.45, 0.9].map((t) => (
            <group key={t}>
              <Blok size={[0.06, 0.38, 0.06]} pos={[t, 0.19, s * z]} color="#f4f1ea" r={0.01} />
              <Blok size={[0.06, 0.38, 0.06]} pos={[s * z, 0.19, t]} color="#f4f1ea" r={0.01} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

export function TuinFrank() {
  return (
    <group>
      <Deel id="gras" uit={[0, 0, 0]} label="Tuin 6 × 6 m">
        <Blok size={[6, 0.06, 6]} pos={[0, 0.03, 0]} color={P.grasDonker} r={0.02} shadow={false} />
      </Deel>
      <Haag size={[6.4, 0.55, 0.3]} pos={[0, 0, -3.15]} />
      <Haag size={[0.3, 0.55, 6.4]} pos={[-3.15, 0, 0]} />
      <Haag size={[0.3, 0.55, 6.4]} pos={[3.15, 0, 0]} />
      <Haag size={[2.4, 0.55, 0.3]} pos={[-2.0, 0, 3.15]} />
      <Haag size={[2.4, 0.55, 0.3]} pos={[2.0, 0, 3.15]} />
      <Boom pos={[-2.2, 0, -2.2]} s={0.75} soort="bol" />
      <Boom pos={[2.2, 0, -2.2]} s={0.75} soort="bol" />
      <Boom pos={[-2.2, 0, 2.1]} s={0.75} soort="bol" />
      <Boom pos={[2.2, 0, 2.1]} s={0.75} soort="bol" />
      <Struik pos={[-1.4, 0, -1.5]} s={0.8} />
      <Struik pos={[-1.2, 0, 2.3]} s={0.8} />
      <Deel id="vijver" uit={[0, 1.4, 0]} label="Vijver 15 × 15 dm">
        <Vijver pos={[0, 0, 0]} zijde={1.5} />
        <HekjeRondVijver />
      </Deel>
      <Maat van={[-3, 0.7, -3.7]} naar={[3, 0.7, -3.7]} label="6 m" />
      <Maat van={[-3.7, 0.7, -3]} naar={[-3.7, 0.7, 3]} label="6 m" />
      <Maat van={[3.7, 0.7, -3]} naar={[3.7, 0.7, 3]} label="6 m" />
      <Maat van={[-3, 0.7, 3.7]} naar={[3, 0.7, 3.7]} label="6 m" />
      <Maat van={[-0.75, 0.25, -0.95]} naar={[0.75, 0.25, -0.95]} label="15 dm" deel="vijver" />
    </group>
  );
}

/** NIV-09: glazen kubus van 100 × 100 × 100 cm. Hij valt uiteen in 10 lagen van 100 liter. */
/** Eén waterlaag die pas binnenstroomt na het goede antwoord (of vanaf tip 2). */
function Waterlaag({ i, vol }: { i: number; vol: boolean }) {
  const ref = useGroei(vol, i * 0.18);
  return (
    <Deel id={`laag-${i}`} uit={[0, i * 0.22, 0]} label="100 liter">
      <group ref={ref} position={[0, i * 0.1, 0]}>
        <Blok size={[0.98, 0.095, 0.98]} pos={[0, 0.05, 0]} color={i % 2 ? '#5fb7c9' : '#73c3d3'} r={0.01} opacity={0.85} />
      </group>
    </Deel>
  );
}

export function Waterkubus() {
  const lagen = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  const opgelost = useOpgelost('O2-NIV-09');
  const tip = useTip('O2-NIV-09');
  const vol = opgelost || tip >= 2;
  return (
    <group>
      <Blok size={[1.5, 0.8, 1.5]} pos={[0, 0.4, 0]} color={P.steen} r={0.08} />
      <group position={[0, 0.8, 0]}>
        <Blok size={[1.04, 1.04, 1.04]} pos={[0, 0.52, 0]} color="#d7eef3" r={0.03} opacity={0.25} />
        {lagen.map((i) => (
          <Waterlaag key={i} i={i} vol={vol} />
        ))}
        <Maat van={[-0.5, 0, 0.65]} naar={[0.5, 0, 0.65]} label="100 cm" />
        <Maat van={[0.65, 0, -0.5]} naar={[0.65, 0, 0.5]} label="100 cm" />
        <Maat van={[-0.65, 0, 0.5]} naar={[-0.65, 1, 0.5]} label="100 cm" />
      </group>
      <Bordje regels={['1.000.000 cm³']} breed={1.3} hoog={0.3} pos={[0, 0.45, 0.76]} />
    </group>
  );
}

/** NIV-10: goederenwagon met ijzererts. Bak 8 × 2,5 × 2,5 m. */
export function Goederenwagon() {
  const stenen = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const rr = ((i % 7) / 7) * 0.9;
        return [Math.cos(a) * rr * 1.1, 0.15 + (i % 3) * 0.12, ((i / 34) * 2 - 1) * 3.6] as V3;
      }),
    [],
  );
  return (
    <group>
      {[-2.6, 2.6].map((z) => [-0.72, 0.72].map((x) => <Cil key={`${x}${z}`} r={0.45} h={0.2} pos={[x, 0.5, z]} rot={[0, 0, Math.PI / 2]} color="#3b3a39" />))}
      <Blok size={[2.2, 0.35, 8.6]} pos={[0, 0.85, 0]} color="#3b3a39" r={0.06} />
      <group position={[0, 1.02, 0]}>
        <Blok size={[2.5, 0.08, 8]} pos={[0, 0.04, 0]} color="#56634f" r={0.02} />
        <Blok size={[2.5, 2.5, 0.08]} pos={[0, 1.25, -3.96]} color="#5f6d5d" r={0.03} />
        <Blok size={[2.5, 2.5, 0.08]} pos={[0, 1.25, 3.96]} color="#5f6d5d" r={0.03} />
        <Blok size={[0.08, 2.5, 8]} pos={[-1.21, 1.25, 0]} color="#5f6d5d" r={0.03} />
        <Blok size={[0.08, 2.5, 8]} pos={[1.21, 1.25, 0]} color="#5f6d5d" r={0.03} />
        {Array.from({ length: 7 }, (_, i) => (
          <Blok key={i} size={[2.62, 2.4, 0.1]} pos={[0, 1.25, -3.4 + i * 1.13]} color="#56634f" r={0.02} />
        ))}
        <Deel id="erts" uit={[0, 3.6, 0]} label="Erts 8 × 2,5 × 2,5 m">
          <Blok size={[2.34, 2.3, 7.84]} pos={[0, 1.2, 0]} color="#4a4d52" r={0.08} />
          {stenen.map((p, i) => (
            <mesh key={i} position={[p[0], 2.3 + p[1] * 0.5, p[2]]} material={mat('#3a3d42', { rough: 1 })} castShadow>
              <icosahedronGeometry args={[0.3 + (i % 4) * 0.05, 0]} />
            </mesh>
          ))}
        </Deel>
        <Maat van={[1.6, 0, -4]} naar={[1.6, 0, 4]} label="8 m" />
        <Maat van={[-1.25, 0, 4.5]} naar={[1.25, 0, 4.5]} label="2,5 m" />
        <Maat van={[-1.6, 0, 4]} naar={[-1.6, 2.5, 4]} label="2,5 m" />
      </group>
    </group>
  );
}

/** NIV-11: buurtzwembad 24 × 12 m. In de draai-inspectie: doorsnede met de verhoogde bodem. */
export function Zwembad() {
  const ctx = useInspectie();
  const weergave = useSpel((s) => s.weergave);
  const doorsnede = ctx.delen && weergave === 'draai';
  const L = 24;
  const B = 12;
  if (doorsnede) {
    return (
      <group>
        <Blok size={[L + 1, 0.3, B + 1]} pos={[0, -0.15, 0]} color={P.steen} r={0.1} />
        <Blok size={[L + 1, 3, 0.5]} pos={[0, 1.5, -B / 2 - 0.25]} color={P.wit} r={0.08} />
        <Blok size={[0.5, 3, B]} pos={[-L / 2 - 0.25, 1.5, 0]} color={P.wit} r={0.08} />
        <Blok size={[0.5, 3, B]} pos={[L / 2 + 0.25, 1.5, 0]} color={P.wit} r={0.08} />
        <Deel id="bak" uit={[0, 5, 0]} label="Hele bak 24 × 12 × 3 m">
          <Blok size={[L, 3, B]} pos={[0, 1.5, 0]} color={P.water} r={0.08} opacity={0.45} />
        </Deel>
        <Deel id="verhoging" uit={[0, 0, 14]} label="Verhoogde bodem 12 × 12 × 0,5 m">
          <Blok size={[L / 2, 0.5, B]} pos={[-L / 4, 0.25, 0]} color="#f0e6d0" r={0.06} />
        </Deel>
        <Maat van={[-L / 2, 0, B / 2 + 1.4]} naar={[0, 0, B / 2 + 1.4]} label="12 m" />
        <Maat van={[0, 0, B / 2 + 1.4]} naar={[L / 2, 0, B / 2 + 1.4]} label="12 m" />
        <Maat van={[L / 2 + 1.4, 0, -B / 2]} naar={[L / 2 + 1.4, 0, B / 2]} label="12 m" />
        <Maat van={[L / 2 + 1.4, 0, B / 2]} naar={[L / 2 + 1.4, 3, B / 2]} label="3 m" />
        <Maat van={[-L / 2 - 1.4, 0, B / 2]} naar={[-L / 2 - 1.4, 0.5, B / 2]} label="0,5 m" deel="verhoging" />
      </group>
    );
  }
  return (
    <group>
      <Blok size={[L + 1.2, 0.3, 0.6]} pos={[0, 0.15, -(B + 0.6) / 2]} color={P.wit} r={0.06} />
      <Blok size={[L + 1.2, 0.3, 0.6]} pos={[0, 0.15, (B + 0.6) / 2]} color={P.wit} r={0.06} />
      <Blok size={[0.6, 0.3, B]} pos={[-(L + 0.6) / 2, 0.15, 0]} color={P.wit} r={0.06} />
      <Blok size={[0.6, 0.3, B]} pos={[(L + 0.6) / 2, 0.15, 0]} color={P.wit} r={0.06} />
      <mesh position={[-L / 4, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#86d0dc', { rough: 0.15 })} receiveShadow>
        <planeGeometry args={[L / 2, B]} />
      </mesh>
      <mesh position={[L / 4, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat(P.waterDiep, { rough: 0.15 })} receiveShadow>
        <planeGeometry args={[L / 2, B]} />
      </mesh>
      {[-3, 0, 3].map((z) => (
        <mesh key={z} position={[0, 0.13, z]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#e9f6f7', { rough: 0.3 })}>
          <planeGeometry args={[L - 1, 0.12]} />
        </mesh>
      ))}
      <Blok size={[0.1, 1.0, 0.1]} pos={[L / 2 - 0.4, 0.5, -B / 2 + 0.1]} color={P.metaal} r={0.03} />
      <Blok size={[0.1, 1.0, 0.1]} pos={[L / 2 - 1.0, 0.5, -B / 2 + 0.1]} color={P.metaal} r={0.03} />
      <Blok size={[0.5, 0.5, 2.6]} pos={[L / 2 + 0.6, 0.25, 2.5]} color={P.blauw} r={0.08} />
      <Blok size={[0.45, 0.08, 2.4]} pos={[L / 2 - 0.4, 0.55, 2.5]} color={P.wit} r={0.03} />
      <group position={[L / 2 - 1.2, 0.68, 2.5]}>
        <Blok size={[0.35, 0.3, 0.5]} color="#f2d04a" r={0.14} />
        <Blok size={[0.22, 0.25, 0.22]} pos={[0, 0.25, 0.2]} color="#f2d04a" r={0.1} />
        <Blok size={[0.1, 0.06, 0.12]} pos={[0, 0.25, 0.36]} color={P.oranje} r={0.03} />
      </group>
      <Maat van={[-L / 2, 0.3, B / 2 + 1.2]} naar={[0, 0.3, B / 2 + 1.2]} label="12 m" />
      <Maat van={[0, 0.3, B / 2 + 1.2]} naar={[L / 2, 0.3, B / 2 + 1.2]} label="12 m" />
      <Maat van={[L / 2 + 1.4, 0.3, -B / 2]} naar={[L / 2 + 1.4, 0.3, B / 2]} label="12 m" />
      <Maat van={[-L / 2 - 1.2, 0.3, -B / 2]} naar={[-L / 2 - 1.2, 3.3, -B / 2]} label="3 m diep" />
      <Maat van={[-L / 4 - 2, 0.3, -B / 2 + 1.2]} naar={[-L / 4 - 2, 0.8, -B / 2 + 1.2]} label="bodem 0,5 m" />
    </group>
  );
}

/** Schuurtje voor de werkbank (decor bij NIV-02). */
export function Schuur() {
  return (
    <group>
      <Blok size={[4, 2.6, 0.15]} pos={[0, 1.3, -1.6]} color={P.hout} r={0.04} />
      <Blok size={[0.15, 2.6, 3.3]} pos={[-1.95, 1.3, 0]} color={P.hout} r={0.04} />
      <Blok size={[0.15, 2.6, 3.3]} pos={[1.95, 1.3, 0]} color={P.hout} r={0.04} />
      <Blok size={[4.4, 0.18, 3.7]} pos={[0, 2.7, 0]} color={P.dak} r={0.06} />
    </group>
  );
}
