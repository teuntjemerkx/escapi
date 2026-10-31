// Wereld 1 – De Ellehaven: de inrichting van de kamers en kades (meubels, borden, lampen, hekken).
// Het gebouw zelf (vloeren, muren, deuren, trappen, daken) komt uit de plattegrond in huis.ts; het land,
// het water, de kranen, het schip en de brug uit Omgeving.tsx.
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { box, cirkel, helling, opLaag, verhoog } from '../game/botsing';
import { FrankSchilderij } from '../game/frank';
import { Kleed, Vensters } from '../game/huis';
import { Blok, mat } from '../game/kit';
import { Krat, Naambord, Plant, Schoolbord, Vat } from '../game/meubels';
import { Spijlenhek } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { Tekst } from './bouw';
import { Bureau, GroteRekenkaart, Kapstok, PalletStapel, Reddingsboei, Stuurwiel, Vertrekbord, Vitrine, Zeekaart } from './decor';
import { DEK_Y, BUITEN_BOTSERS } from './Omgeving';
import {
  Balie,
  Bootspanten,
  Globe,
  Hanglamp,
  Heftruck,
  Ijkmaat,
  KantineTafel,
  Kaartenkast,
  Kluisjes,
  Kofferkar,
  Koffieautomaat,
  Stelling,
  Tribune,
  Veilingklok,
  Viskisten,
  Wachtbank,
  Weegdisplay,
  Werkbank,
  Zaagbok,
} from './inrichting';

/** Hoogte van de vloer van verdieping 1. */
const V1 = 3.9;
/** Tribune in de visafslag (west): drie treden van 0,35 m. */
const TRIBUNE = { x0: -26, x1: -22.6, z0: 7.5, z1: 20.5, treden: 3, stap: 0.35 };

type Bots = { naam: string; x: number; z: number; b: number; d: number; rond?: boolean; v?: number };
const B = (naam: string, x: number, z: number, b: number, d: number, v = 0): Bots => ({ naam, x, z, b, d, v });
const C = (naam: string, x: number, z: number, r: number, v = 0): Bots => ({ naam, x, z, b: r * 2, d: r * 2, rond: true, v });

/** Botsingen van de meubels en hekken (ook gebruikt door controle.ts). `v` = verdieping. */
export const DECOR_BOTSERS: Bots[] = [
  // havenmeesterij
  B('bureau Fenna', 5.9, 16.4, 1.6, 1.8),
  C('kapstok', -7.3, 15.0, 0.3),
  B('vitrine', -7.35, 20.8, 0.6, 1.3),
  C('plant havenkantoor', 7.3, 21.3, 0.35),
  // kaartenkamer (verdieping 1)
  C('globe', -6.3, 20.4, 0.35, 1),
  B('kaartenkast', -2.4, 21.4, 2.0, 0.8, 1),
  // visafslag
  B('viskisten ne', -15.0, 7.0, 0.8, 0.5),
  B('viskisten nw', -21.4, 6.8, 0.8, 0.5),
  B('viskisten zo', -16.4, 21.3, 0.8, 0.5),
  // pakhuis
  B('pallets pakhuis', -24.8, -2.5, 1.2, 1.0),
  B('kratten pakhuis', -15.2, 4.6, 0.9, 1.6),
  C('vat pakhuis', -25.2, 5.2, 0.35),
  // zolder
  B('kratten zolder', -24.9, -1.6, 0.9, 1.6, 1),
  B('balen zolder', -18.6, -0.4, 1.2, 1.0, 1),
  // werkplaats
  B('bootspanten', -20.5, -11.5, 4.4, 2.2),
  B('werkbank west', -25.4, -8.3, 0.8, 2.4),
  B('zaagbok', -17.6, -13.6, 2.3, 0.5),
  // weegloods
  B('container op weegbrug', 20.0, 1.5, 6.4, 2.8),
  B('stelling', 18.25, -5.35, 5.5, 1.0),
  C('weegdisplay', 22.8, 4.4, 0.25),
  // kantine
  B('kantinetafel', 23.2, 8.6, 1.7, 1.7),
  B('kluisjes', 25.6, 9.0, 0.55, 1.9),
  B('koffieautomaat', 24.6, 13.4, 0.8, 0.7),
  // vertrekloods
  B('balie vertrek', 20.4, -12.6, 2.5, 0.8),
  B('wachtbank', 15.0, -8.0, 0.6, 2.8),
  B('kofferkar', 23.4, -7.0, 0.8, 1.1),
  // oostkade
  B('container oostkade', 10.4, -4.5, 2.5, 6.1),
  B('heftruck', 10.5, -15.5, 1.2, 3.1),
  // hekken naast de poortjes van het kadeplein
  B('hek kadeplein w1', -13.25, 6, 1.5, 0.3),
  B('hek kadeplein w2', -8.75, 6, 1.5, 0.3),
  B('hek kadeplein o1', 8.75, 6, 1.5, 0.3),
  B('hek kadeplein o2', 13.25, 6, 1.5, 0.3),
];

export function registreerDecor() {
  const alle = [...DECOR_BOTSERS, ...BUITEN_BOTSERS.map((b) => ({ ...b, v: 0 }))];
  for (const d of alle) {
    // de motor gebruikt de verdieping als botsingslaag
    const zet = () => (d.rond ? cirkel(d.x, d.z, d.b / 2) : box(d.x, d.z, d.b, d.d));
    if (d.v) opLaag(d.v, zet);
    else zet();
  }
  // tribune: drie treden om op te staan
  const { x0, x1, z0, z1, treden, stap } = TRIBUNE;
  const diep = (x1 - x0) / treden;
  for (let i = 0; i < treden; i++) verhoog(x0 + diep * (i + 0.5), (z0 + z1) / 2, diep, z1 - z0, stap * (treden - i));
  // loopplank naar het dek van De Eenheid, en het dek zelf
  helling([16.5, -26.0], [16.5, -27.5], 1.6, 0, DEK_Y);
  verhoog(16.5, -29.25, 3.4, 3.5, DEK_Y);
}


/** Vaste inrichting: wordt samengevoegd tot weinig tekenstappen. */
export function Wereld1Decor() {
  return (
    <>
      {/* ── Kadeplein ── */}
      <Naambord pos={[0, 3.15, 13.82]} rot={Math.PI} tekst="HAVENKANTOOR" b={3.2} kleur="#1f3c5a" fg="#f4efe2" />
      <Ijkmaat pos={[-2.3, 1.5, 13.83]} rot={Math.PI} />
      <Spijlenhek a={[-14, 6]} b={[-12.5, 6]} h={1.1} kleur="#2c4a3b" />
      <Spijlenhek a={[-9.5, 6]} b={[-8, 6]} h={1.1} kleur="#2c4a3b" />
      <Spijlenhek a={[8, 6]} b={[9.5, 6]} h={1.1} kleur="#2c4a3b" />
      <Spijlenhek a={[12.5, 6]} b={[14, 6]} h={1.1} kleur="#2c4a3b" />
      <Spijlenhek a={[12, -18]} b={[14, -18]} h={1.1} kleur="#2c4a3b" />
      {/* bord bij de steiger */}
      <Tekst regels={['JACHTHAVEN', 'Steiger A'] } b={1.1} h={0.5} pos={[2.4, 1.6, 6.36]} o={{ bg: '#1f3c5a', fg: '#ffffff', dubbel: true }} />
      <Blok size={[0.06, 1.4, 0.06]} pos={[2.4, 0.7, 6.32]} color="#c9cdd0" r={0.01} />

      {/* ── Havenmeesterij ── */}
      <Bureau pos={[5.6, 0, 16.4]} rot={-Math.PI / 2} />
      <Kapstok pos={[-7.3, 0, 15.0]} rot={Math.PI / 2} />
      <Vitrine pos={[-7.4, 0, 20.8]} rot={Math.PI / 2} />
      <Plant pos={[7.3, 0, 21.3]} soort={1} />
      <Kleed pos={[-2.6, 16.4]} b={3.8} d={2.8} kleur="#24465e" rand="#c9a25a" />
      <Schoolbord pos={[-7.83, 1.8, 17.8]} rot={Math.PI / 2} regels={['De eenhedentrap', 'km  hm  dam  m  dm  cm  mm', 'Omlaag: × 10    Omhoog: : 10', 'De trap achterin is echt!']} b={3.2} h={1.5} />
      <Zeekaart pos={[-4.6, 2.0, 21.82]} rot={Math.PI} b={1.6} h={1.1} />
      <Reddingsboei pos={[2.4, 1.8, 14.27]} />
      <Stuurwiel pos={[-2.2, 2.4, 14.25]} />
      {/* paaseitje: een fotootje van Frank uit het Spookkasteel, boven het bureau van Fenna */}
      <FrankSchilderij pos={[7.82, 2.05, 17.2]} rot={-Math.PI / 2} b={0.42} achter="#2f4a5e" />
      <Tekst regels={['Frank · nachtwacht', 'Spookkasteel']} b={0.5} h={0.16} pos={[7.82, 1.66, 17.2]} rot={[0, -Math.PI / 2, 0]} o={{ bg: '#b8913f', fg: '#2a1d0c' }} />

      {/* ── Kaartenkamer (verdieping 1) ── */}
      <group position={[-7.83, V1 + 1.85, 18.0]} rotation={[0, Math.PI / 2, 0]}>
        <GroteRekenkaart pos={[0, 0, 0]} b={6.4} h={2.4} />
      </group>
      <Globe pos={[-6.3, V1, 20.4]} />
      <Kaartenkast pos={[-2.4, V1, 21.4]} rot={Math.PI} />
      <group position={[0, V1, 0]}>
        <Kleed pos={[0, 17.4]} b={10} d={4.2} kleur="#7a3b34" rand="#e9d29a" />
      </group>

      {/* ── Visafslag ── */}
      <Tribune {...TRIBUNE} />
      <Veilingklok pos={[-14.22, 5.0, 10]} rot={-Math.PI / 2} />
      <Viskisten pos={[-15.0, 0, 7.0]} n={4} ijs />
      <Viskisten pos={[-21.4, 0, 6.8]} n={3} />
      <Viskisten pos={[-16.4, 0, 21.3]} n={5} ijs />
      <Tekst regels={['KOELCEL']} b={1.0} h={0.26} pos={[-18.6, 2.75, 6.17]} o={{ bg: '#2f6f9a', fg: '#ffffff' }} />
      <Tekst regels={['VISAFSLAG']} b={4.2} h={0.8} pos={[-13.82, 4.5, 10]} rot={[0, Math.PI / 2, 0]} o={{ bg: '#1f3c5a', fg: '#f4efe2' }} />
      {[
        [-15.6, 14.2],
        [-15.6, 18.6],
        [-18.6, 20.6],
        [-21.2, 18.4],
        [-21.2, 14.2],
        [-18.4, 9.8],
      ].map(([x, z], i) => (
        <Hanglamp key={i} pos={[x, 3.4, z]} top={6.5} kap="#2f6f9a" />
      ))}

      {/* ── Pakhuis De Hijsbalk ── */}
      <PalletStapel pos={[-24.8, 0, -2.5]} rot={0.1} kleur="#c9b38a" lagen={3} />
      <Krat pos={[-15.2, 0, 4.2]} rot={Math.PI / 2} />
      <Krat pos={[-15.2, 0, 5.0]} rot={Math.PI / 2 + 0.15} s={0.9} />
      <Krat pos={[-15.2, 0.6, 4.6]} rot={Math.PI / 2 - 0.1} s={0.8} />
      <Vat pos={[-25.2, 0, 5.2]} kleur="#6b4630" />
      <Tekst regels={['PAKHUIS', 'DE HIJSBALK']} b={2.8} h={1.0} pos={[-13.82, 3.1, 0]} rot={[0, Math.PI / 2, 0]} o={{ bg: '#2c4a3b', fg: '#f4efe2' }} />
      {/* hijsbalk boven het zolderluik, met katrol en touw */}
      <Blok size={[1.6, 0.24, 0.24]} pos={[-13.1, 7.0, 0]} color="#5a3a24" r={0.02} />
      <mesh position={[-12.5, 6.75, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#2b3034')}>
        <torusGeometry args={[0.14, 0.04, 6, 12]} />
      </mesh>
      <Blok size={[0.03, 4.4, 0.03]} pos={[-12.38, 4.5, 0]} color="#d6c393" r={0} shadow={false} />
      {/* groene luiken naast de ramen */}
      {[-3.8, 3.8].map((z) => (
        <group key={z}>
          <Blok size={[0.06, 1.6, 0.6]} pos={[-13.88, 1.75, z - 0.95]} color="#2c4a3b" r={0.01} />
          <Blok size={[0.06, 1.6, 0.6]} pos={[-13.88, 1.75, z + 0.95]} color="#2c4a3b" r={0.01} />
        </group>
      ))}
      {/* zolder */}
      <Krat pos={[-24.9, V1, -2.0]} rot={Math.PI / 2} />
      <Krat pos={[-24.9, V1, -1.2]} rot={Math.PI / 2 + 0.2} s={0.9} />
      <PalletStapel pos={[-18.6, V1, -0.4]} rot={0.05} kleur="#c9b38a" lagen={2} />

      {/* ── Werf: werkplaats ── */}
      <Bootspanten pos={[-20.5, 0, -11.5]} />
      <Werkbank pos={[-25.4, 0, -8.3]} rot={Math.PI / 2} />
      <Zaagbok pos={[-17.6, 0, -13.6]} />
      <Blok size={[12, 0.4, 0.4]} pos={[-20, 5.3, -12]} color="#e6b43a" r={0.03} />
      <Blok size={[0.8, 0.5, 0.9]} pos={[-21.5, 4.95, -12]} color="#3b3f44" r={0.04} />
      <Blok size={[0.025, 2.3, 0.025]} pos={[-21.5, 3.55, -12]} color="#2b2f33" r={0} shadow={false} />
      <Blok size={[0.4, 0.14, 0.4]} pos={[-21.5, 2.35, -12]} color="#e6b43a" r={0.04} />
      {/* latei over de open zijde, met het bord van de werf */}
      <Blok size={[0.4, 0.5, 12]} pos={[-14.0, 5.75, -12]} color="#3d4a52" r={0.02} />
      <Tekst regels={['SCHEEPSWERF ELLEHAVEN']} b={5.6} h={0.42} pos={[-13.78, 5.75, -12]} rot={[0, Math.PI / 2, 0]} o={{ bg: '#3d4a52', fg: '#f4efe2' }} />
      {[
        [-20, -9],
        [-20, -15],
      ].map(([x, z], i) => (
        <Hanglamp key={i} pos={[x, 4.2, z]} top={6} kap="#3d4a52" />
      ))}

      {/* ── Weegloods ── */}
      {/* weegbrug: stalen plaat in de vloer met een geel-zwarte rand */}
      <Blok size={[7.4, 0.04, 3.4]} pos={[20, 0.02, 1.5]} color="#1f2a24" r={0.005} shadow={false} />
      <Blok size={[7.0, 0.045, 3.0]} pos={[20, 0.03, 1.5]} color="#6f777c" r={0.005} shadow={false} />
      {Array.from({ length: 12 }, (_, i) =>
        [-1.6, 1.6].map((z) => <Blok key={`${i}${z}`} size={[0.3, 0.05, 0.1]} pos={[16.6 + i * 0.62, 0.035, 1.5 + z]} color={i % 2 ? '#1f2a24' : '#f2c21e'} r={0.005} shadow={false} />),
      )}
      <group position={[20, 0, 1.5]}>
        {/* oplegger met een container op de weegbrug */}
        <Blok size={[6.2, 0.3, 2.3]} pos={[0, 1.2, 0]} color="#2b2f33" r={0.03} />
        {[-2.2, -1.2, 2.4].map((x) =>
          [-0.9, 0.9].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.5, z]} rotation={[Math.PI / 2, 0, 0]} material={mat('#1d1f21')}>
              <cylinderGeometry args={[0.5, 0.5, 0.35, 14]} />
            </mesh>
          )),
        )}
        <Blok size={[6.06, 2.59, 2.44]} pos={[0, 2.65, 0]} color="#b4443a" r={0.04} />
        {Array.from({ length: 10 }, (_, i) => (
          <Blok key={i} size={[0.08, 2.3, 2.5]} pos={[-2.7 + i * 0.6, 2.65, 0]} color="#a33c33" r={0} shadow={false} />
        ))}
      </group>
      <Weegdisplay pos={[22.8, 0, 4.4]} rot={Math.PI} />
      <Stelling pos={[18.25, 0, -5.35]} b={5.4} lagen={3} seed={2} />
      <Blok size={[0.4, 0.5, 12]} pos={[14.0, 5.75, 0]} color="#2f6f9a" r={0.02} />
      <Tekst regels={['WEEGLOODS']} b={3.6} h={0.42} pos={[13.78, 5.75, 0]} rot={[0, -Math.PI / 2, 0]} o={{ bg: '#2f6f9a', fg: '#ffffff' }} />
      {[
        [18, -2],
        [18, 3.5],
        [23, -1.5],
      ].map(([x, z], i) => (
        <Hanglamp key={i} pos={[x, 4.4, z]} top={6} kap="#e9e3d8" />
      ))}

      {/* ── Kantine ── */}
      <KantineTafel pos={[23.2, 0, 8.6]} />
      <Kluisjes pos={[25.6, 0, 9.0]} rot={-Math.PI / 2} n={4} />
      <Koffieautomaat pos={[24.6, 0, 13.4]} rot={Math.PI} />
      <Tekst regels={['KANTINE', 'Koffie · lunch · lockers']} b={1.6} h={0.5} pos={[20, 2.7, 6.17]} o={{ bg: '#3f6f8a', fg: '#ffffff' }} />
      <Plant pos={[14.6, 0, 13.4]} soort={2} />

      {/* ── Vertrekloods ── */}
      <Balie pos={[20.4, 0, -12.6]} b={2.4} />
      <Tekst regels={['DOUANE · INCHECKEN']} b={2.4} h={0.32} pos={[20.4, 2.6, -12.95]} rot={[0, Math.PI, 0]} o={{ bg: '#2f4d6b', fg: '#ffffff', dubbel: true }} />
      <Blok size={[0.05, 1.1, 0.05]} pos={[20.4, 1.65, -12.95]} color="#c9cdd0" r={0.01} />
      <Wachtbank pos={[15.0, 0, -8.0]} rot={Math.PI / 2} n={5} />
      <Kofferkar pos={[23.4, 0, -7.0]} rot={-0.4} />
      <Vertrekbord pos={[17.5, 4.6, -17.82]} />
      <Tekst regels={['VERTREKHAL', 'De Eenheid · 21.30 uur']} b={3.4} h={0.9} pos={[13.82, 4.7, -12]} rot={[0, -Math.PI / 2, 0]} o={{ bg: '#2f4d6b', fg: '#f4efe2' }} />

      {/* ── Kades ── */}
      {/* kraanrails van de portaalkraan */}
      {[-18.6, -25.5].map((z) => (
        <Blok key={z} size={[19, 0.03, 0.12]} pos={[22, 0.02, z]} color="#5a5f63" r={0} shadow={false} />
      ))}
      <group position={[10.4, 0, -4.5]}>
        <Blok size={[2.44, 2.59, 6.06]} pos={[0, 1.3, 0]} color="#2f6f9a" r={0.04} />
      </group>
      <Heftruck pos={[10.5, 0, -15.5]} />
    </>
  );
}

/** Ramen in de gevels zonder echte ramen (punt op de muurlijn, eventueel met verdieping). */
const RAMEN: ([number, number] | [number, number, number])[] = [
  // havenkantoor: west, oost en zuid (beide verdiepingen)
  [-8, 16],
  [-8, 20],
  [8, 19.6],
  [-8, 16, 1],
  [-8, 20, 1],
  [8, 16, 1],
  [8, 20, 1],
  [-5, 22],
  [5, 22],
  [-5, 22, 1],
  [5, 22, 1],
  // pakhuis en werkplaats: westgevel
  [-26, -3],
  [-26, 3],
  [-26, -3, 1],
  [-26, 3, 1],
  [-26, -15],
  [-26, -9],
  // kantine: oost en zuid
  [26, 8.5],
  [26, 11.5],
  [17, 14],
  [23, 14],
  // vertrekloods: oostgevel
  [26, -9],
  [26, -15],
];

/** Wijzer van de veilingklok: een rood lampje dat rondloopt (van 100 naar 0) en weer opnieuw begint. */
function VeilingWijzer() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % 9) / 9;
    if (ref.current) ref.current.rotation.x = -t * Math.PI * 2;
  });
  return (
    <group position={[-14.32, 5.0, 10]}>
      <group ref={ref}>
        <mesh position={[0, 1.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.07, 12]} />
          <meshBasicMaterial color="#ff4a3a" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Een meeuw die door de visafslag scharrelt (op zoek naar vis). */
function Scharrelmeeuw() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.25;
    const g = ref.current;
    if (!g) return;
    const x = -18.3 + Math.sin(t) * 1.2;
    const z = 16.4 + Math.sin(t * 2) * 0.6;
    g.position.set(x, Math.abs(Math.sin(t * 14)) * 0.03, z);
    g.rotation.y = Math.atan2(Math.cos(t) * 1.2, Math.cos(t * 2) * 1.2);
  });
  return (
    <group ref={ref}>
      <Statisch>
        <mesh position={[0, 0.2, 0]} scale={[0.14, 0.13, 0.26]} material={mat('#f7f7f2')}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
        <mesh position={[0, 0.34, 0.16]} material={mat('#f7f7f2')}>
          <sphereGeometry args={[0.09, 10, 8]} />
        </mesh>
        <mesh position={[0, 0.33, 0.28]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2c24a')}>
          <coneGeometry args={[0.025, 0.1, 6]} />
        </mesh>
        <Blok size={[0.3, 0.04, 0.2]} pos={[0, 0.26, -0.04]} color="#9aa3a8" r={0.015} />
        <Blok size={[0.03, 0.12, 0.03]} pos={[-0.05, 0.06, 0]} color="#f2a03a" r={0.01} />
        <Blok size={[0.03, 0.12, 0.03]} pos={[0.05, 0.06, 0]} color="#f2a03a" r={0.01} />
      </Statisch>
    </group>
  );
}

/** Bewegend decor en de ramen. */
export function HavenLevend() {
  return (
    <>
      <Vensters punten={RAMEN} />
      <VeilingWijzer />
      <Scharrelmeeuw />
    </>
  );
}
