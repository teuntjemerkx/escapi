// Een doos die openvouwt tot een uitslag (kubus, balk, pak sap).
// Het bovenvlak is de basis; vier zijvlakken scharnieren eraan; de bodem scharniert aan één zijvlak.
// Bij uit = 0 is de doos dicht, bij uit = 1 ligt de uitslag plat met de buitenkant naar boven.
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useInspectie } from './inspectie';
import { mat } from './kit';
import { useSpel } from './store';

export type Kant = 'nx' | 'px' | 'nz' | 'pz';
export interface Vlak {
  kleur: string;
  /** Iets op de buitenkant (ligt in het xy-vlak, kijkt naar +z). */
  decal?: ReactNode;
}

const D = 0.04; // dikte van een vlak

/** Vlak van w × h dat vanaf zijn scharnier "omlaag" hangt (−y), buitenkant naar `buiten`. */
function Paneel({ w, h, vlak, buiten }: { w: number; h: number; vlak: Vlak; buiten: Kant | 'py' | 'ny' }) {
  // Basisoriëntatie: paneel in het xy-vlak hangend van y=0 tot y=-h; buitenkant +z.
  // Voor zijkanten draaien we zodat de buitenkant de goede kant op wijst.
  const rot: [number, number, number] =
    buiten === 'pz' ? [0, 0, 0] : buiten === 'nz' ? [0, Math.PI, 0] : buiten === 'px' ? [0, Math.PI / 2, 0] : buiten === 'nx' ? [0, -Math.PI / 2, 0] : [0, 0, 0];
  return (
    <group rotation={rot}>
      <mesh position={[0, -h / 2, 0]} castShadow receiveShadow material={mat(vlak.kleur)}>
        <boxGeometry args={[w, h, D]} />
      </mesh>
      {vlak.decal && <group position={[0, -h / 2, D / 2 + 0.006]}>{vlak.decal}</group>}
    </group>
  );
}

export function VouwDoos({
  w,
  d,
  h,
  boven,
  zijden,
  onder,
  onderAan,
  zak = true,
  begintOpen = false,
}: {
  /** maat in x, z en y (dicht). */
  w: number;
  d: number;
  h: number;
  boven: Vlak;
  zijden: Record<Kant, Vlak>;
  onder: Vlak;
  /** Aan welk zijvlak de bodem vastzit. */
  onderAan: Kant;
  /** Zak de uitslag naar de grond als hij openvouwt. */
  zak?: boolean;
  /** Ligt hij eerst open (als uitslag)? Dan vouwt de schuif hem dicht. Voor vragen over de uitslag zelf. */
  begintOpen?: boolean;
}) {
  const ctx = useInspectie();
  const t = useRef(0);
  const groep = useRef<THREE.Group>(null);
  const scharnier = {
    nx: useRef<THREE.Group>(null),
    px: useRef<THREE.Group>(null),
    nz: useRef<THREE.Group>(null),
    pz: useRef<THREE.Group>(null),
    onder: useRef<THREE.Group>(null),
  };
  useFrame((_, dt) => {
    const uit = ctx.delen ? useSpel.getState().uit : 0;
    const doel = begintOpen ? 1 - uit : uit;
    t.current += (doel - t.current) * Math.min(1, dt * 8);
    const a = (Math.PI / 2) * t.current;
    scharnier.nx.current?.rotation.set(0, 0, -a);
    scharnier.px.current?.rotation.set(0, 0, a);
    scharnier.nz.current?.rotation.set(a, 0, 0);
    scharnier.pz.current?.rotation.set(-a, 0, 0);
    if (scharnier.onder.current) {
      // De bodem klapt mee in het verlengde van zijn zijvlak.
      const o = scharnier.onder.current;
      if (onderAan === 'px') o.rotation.set(0, 0, a);
      if (onderAan === 'nx') o.rotation.set(0, 0, -a);
      if (onderAan === 'pz') o.rotation.set(-a, 0, 0);
      if (onderAan === 'nz') o.rotation.set(a, 0, 0);
    }
    if (groep.current && zak) groep.current.position.y = -h * t.current + 0.02 * t.current;
  });

  // Hoogte van de zijvlakken = h; bodem hangt aan de onderrand van zijn zijvlak.
  const bodemPaneel = (kant: Kant) => {
    // In het frame van het zijvlak: scharnier op y = -h. Dicht ligt de bodem horizontaal onder de doos.
    const breedte = kant === 'nx' || kant === 'px' ? d : w;
    const lengte = kant === 'nx' || kant === 'px' ? w : d;
    const richting = kant === 'px' ? -1 : kant === 'nx' ? 1 : kant === 'pz' ? -1 : 1;
    const naarBinnen: [number, number, number] =
      kant === 'nx' || kant === 'px' ? [(richting * lengte) / 2, 0, 0] : [0, 0, (richting * lengte) / 2];
    return (
      <group ref={scharnier.onder} position={[0, -h, 0]}>
        <mesh position={naarBinnen} castShadow receiveShadow material={mat(onder.kleur)}>
          <boxGeometry args={kant === 'nx' || kant === 'px' ? [lengte, D, breedte] : [breedte, D, lengte]} />
        </mesh>
        {onder.decal && (
          <group position={[naarBinnen[0], -D / 2 - 0.006, naarBinnen[2]]} rotation={[Math.PI / 2, 0, 0]}>
            {onder.decal}
          </group>
        )}
      </group>
    );
  };

  return (
    <group ref={groep}>
      <group position={[0, h, 0]}>
        {/* bovenvlak (basis), buitenkant naar boven */}
        <mesh castShadow receiveShadow material={mat(boven.kleur)}>
          <boxGeometry args={[w, D, d]} />
        </mesh>
        {boven.decal && (
          <group position={[0, D / 2 + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {boven.decal}
          </group>
        )}
        <group ref={scharnier.nx} position={[-w / 2, 0, 0]}>
          <Paneel w={d} h={h} vlak={zijden.nx} buiten="nx" />
          {onderAan === 'nx' && bodemPaneel('nx')}
        </group>
        <group ref={scharnier.px} position={[w / 2, 0, 0]}>
          <Paneel w={d} h={h} vlak={zijden.px} buiten="px" />
          {onderAan === 'px' && bodemPaneel('px')}
        </group>
        <group ref={scharnier.nz} position={[0, 0, -d / 2]}>
          <Paneel w={w} h={h} vlak={zijden.nz} buiten="nz" />
          {onderAan === 'nz' && bodemPaneel('nz')}
        </group>
        <group ref={scharnier.pz} position={[0, 0, d / 2]}>
          <Paneel w={w} h={h} vlak={zijden.pz} buiten="pz" />
          {onderAan === 'pz' && bodemPaneel('pz')}
        </group>
      </group>
    </group>
  );
}

/** Symbolen voor de dobbelsteen-uitslag (plat in het xy-vlak). */
export function Symbool({ soort, s }: { soort: 'vierkant' | 'ster' | 'ring' | 'stip'; s: number }) {
  if (soort === 'vierkant')
    return (
      <mesh material={mat('#f2a64a')}>
        <boxGeometry args={[s * 0.32, s * 0.32, 0.01]} />
      </mesh>
    );
  if (soort === 'stip')
    return (
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#e5675a')}>
        <cylinderGeometry args={[s * 0.2, s * 0.2, 0.01, 24]} />
      </mesh>
    );
  if (soort === 'ring')
    return (
      <group>
        <mesh material={mat('#4f78a8')}>
          <ringGeometry args={[s * 0.11, s * 0.2, 28]} />
        </mesh>
        <mesh position={[0, 0, -0.001]} material={mat('#c6d4e4')}>
          <circleGeometry args={[s * 0.11, 24]} />
        </mesh>
      </group>
    );
  const vorm = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? s * 0.09 : s * 0.22;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) vorm.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else vorm.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return (
    <mesh material={mat('#86c24a')}>
      <shapeGeometry args={[vorm]} />
    </mesh>
  );
}
