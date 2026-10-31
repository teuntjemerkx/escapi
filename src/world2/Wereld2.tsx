// Wereld 2 – Slot Maansteyn: de inrichting van de zalen, de binnenplaats met Franks tuin, het kerkhof, de bouwplaats,
// de eerste verdieping, de donjon en de kelder. Het gebouw zelf (vloeren, muren, deuren, valhekken, trappen, gewelven,
// kantelen, daken) komt uit de plattegrond in huis.ts; torens, brug, meer en rots uit Omgeving.tsx.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { box, cirkel, helling, opLaag } from '../game/botsing';
import { Gras } from '../game/gras';
import { Binnen, Fakkels, kijkVerdieping, Kleed, OpMuur, StaandeLamp, Vensters, Verdieping } from '../game/huis';
import { FrankSchilderij } from '../game/frank';
import { Blok, mat } from '../game/kit';
import { Bank, Boekenkast, Ezel, Fauteuil, Krat, Naambord, Schilderij, Schoolbord, Vat, Wandplank } from '../game/meubels';
import { Spijlenhek as Spijlen } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { speler, useSpel } from '../game/store';
import { huidig, stationsVan } from '../werelden';
import { Waterput } from './bran';
import { Spoor } from './Decor';
import { PUT, STEIGER_Y } from './huis';
import { Altaar, Arcade, gloed, Kerkbank, Kroonluchter, LangeTafel, Maanzuil, Moordgat, Schouw, Smidsvuur, Waterbekken, Wapenrek, Windas } from './kasteel';
import {
  Banier,
  BooBed,
  Grafsteen,
  Harnas,
  Kaarsen,
  Ketel,
  Mistbank,
  Pompoen,
  RodeOgen,
  Schedel,
  Schim,
  Spin,
  Spinnenweb,
  Spreekplek,
  SpookPortret,
  Telescoop,
  ZwevendeBoeken,
} from './spook';

const MUUR = 0.15; // halve muurdikte
type V2 = [number, number];
type V3 = [number, number, number];

/** Zuilen van de arcade langs de westkant van de binnenplaats (z). */
const ARCADE_Z = [-3.5, -0.5, 2.5, 5.5];
/** Lantaarns op de binnenplaats, het kerkhof en de bouwplaats (zelfde als in Omgeving.tsx). */
const LANTAARNS: V2[] = [
  [4.6, 7.3],
  [-4.9, -3.6],
  [20.8, -9.6],
  [17.4, 9.4],
  [-6.8, -15.0],
];
/** Grafstenen op het kerkhof [x, z]. */
const GRAVEN: V2[] = [
  [17.4, -9.2],
  [20.6, -8.0],
  [17.4, -7.0],
  [20.6, 1.6],
  [17.4, 2.8],
  [20.6, 4.0],
  [17.4, 9.6],
  [20.6, 10.0],
];
/** Harnassen [x, z, draaiing] per verdieping. */
const HARNASSEN_0: [number, number, number][] = [
  // wapenzaal
  [-12.1, -4.4, Math.PI / 2],
  [-8.45, 6.8, -Math.PI / 2],
  // spookgang
  [15.6, -3.6, -Math.PI / 2],
  [15.6, 1.8, -Math.PI / 2],
  // ridderzaal
  [-7.4, -6.7, Math.PI * 0.75],
  [7.4, -6.7, -Math.PI * 0.75],
  // torenhal
  [8.5, 9.0, Math.PI / 2],
];
const HARNASSEN_1: [number, number, number][] = [
  [-15.4, -5.4, Math.PI / 2],
  [-16.5, -14.2, Math.PI / 2],
];
const HARNASSEN_KELDER: [number, number, number][] = [
  [-16.5, -7.2, Math.PI / 2],
  [-16.5, -11.2, Math.PI / 2],
  [-12.2, -14.5, 0],
  [-8.6, -7.0, -Math.PI / 2],
];


/**
 * Inrichting van één verdieping alleen tekenen als je daar bent (of vlak bij een trap ernaartoe). Door je eigen ogen
 * zie je toch niet door vloeren en plafonds heen; dit scheelt veel tekenstappen (Chromebooks).
 */
function laagZichtbaar(v: number) {
  const s = useSpel.getState();
  if (s.kaart === 'start' || s.kaart === 'werelden') return v === 0;
  const kv = s.modus !== 'lopen' ? kijkVerdieping() : speler.verdieping;
  if (kv === v) return true;
  if (Math.abs(kv - v) !== 1) return false;
  const lo = Math.min(kv, v);
  return (huidig().plan?.trappen ?? []).some((t) => t.van === lo && Math.hypot(t.pos[0] - speler.pos.x, t.pos[1] - speler.pos.z) < t.lengte / 2 + 4);
}
export function OpVerdieping({ v, children }: { v: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = laagZichtbaar(v);
  });
  return <group ref={ref}>{children}</group>;
}

/** Botsingen van de inrichting (stations, kluizen en poort doet de motor). */
export function registreerDecor() {
  // ── buiten: bospad, brug, rotstrap en steiger (hoogte) ──
  helling([11, -21], [11, -22.7], 3.4, 0, 0);
  helling([11, -22.7], [11, -28], 3.4, 0, STEIGER_Y);
  helling([11, -28], [11, -32], 8, STEIGER_Y, STEIGER_Y);
  for (const [x, z] of LANTAARNS) cirkel(x, z, 0.22);
  // ── binnenplaats: put, arcadezuilen, bank, regenpijp ──
  cirkel(PUT[0], PUT[1], 0.85);
  for (const z of ARCADE_Z) cirkel(-5.5, z, 0.32);
  box(-4.6, 0.6, 0.6, 1.7);
  // ── kerkhof en bouwplaats ──
  for (const [x, z] of GRAVEN) box(x, z, 0.9, 0.45);
  box(12.2, -15.4, 1.6, 1.2);
  box(1.4, -20.3, 2.2, 0.9);
  // ── zalen op de begane grond ──
  for (const [x, z] of HARNASSEN_0) cirkel(x, z, 0.4);
  box(-5.5, 13.75, 2.2, 0.5); // uitlegkamer: boekenkast
  box(-14.4, 12.9, 1.8, 1.4); // smidse: smidsvuur
  cirkel(-14.8, 11.6, 0.35); // aambeeld
  box(7.3, 13.3, 1.0, 1.0); // stallen: hooi
  box(7.3, 8.8, 1.0, 1.0);
  box(-8.4, -1.0, 0.5, 2.1); // wapenzaal: wapenrek
  box(-0.3, -9.3, 3.6, 1.9); // ridderzaal: lange tafel
  box(4.5, -13.6, 2.6, 0.8); // ridderzaal: schouw
  box(14.0, -13.6, 2.2, 0.8); // keuken: schouw
  cirkel(12.6, -12.6, 0.62); // keuken: ketel
  cirkel(8.6, -13.3, 0.42); // keuken: vat
  box(9.6, -5.4, 2.0, 1.0); // kapel: altaar
  box(9.9, -0.55, 2.0, 0.6); // kapel: kerkbank
  box(9.0, 0.7, 0.8, 0.8); // bouwmeester: tekenezel
  box(-16.2, -7.2, 1.0, 1.0); // schatkamer: kisten
  box(-9.0, -7.0, 1.0, 1.0);
  // ── eerste verdieping ──
  opLaag(1, () => {
    for (const [x, z] of HARNASSEN_1) cirkel(x, z, 0.4);
    box(0, 15.65, 2.9, 0.8); // bodekamer: windas
    box(2.5, 13.8, 0.6, 1.9); // bodekamer: bank
    box(-14.2, 13.75, 2.3, 0.5); // bibliotheek: kasten
    box(-10.6, 13.75, 2.3, 0.5);
    box(-15.75, 9.3, 0.5, 1.7);
    cirkel(-9.0, 13.0, 0.45); // fauteuil
    box(-16.2, -7.4, 1.0, 1.6); // wachtkamer: bank
  });
  opLaag(2, () => {
    box(-16.0, -7.6, 1.2, 2.2); // torenkamer D: bed
    box(-9.2, -7.0, 1.4, 0.8); // tafeltje
  });
  opLaag(3, () => {
    box(-16.0, -7.0, 1.0, 1.0);
    box(-9.0, -7.0, 1.0, 1.0);
  });
  opLaag(4, () => cirkel(-9.2, -7.2, 0.5));
  // ── kelder ──
  opLaag(-1, () => {
    box(0.75, -2.1, 3.7, 2.8); // cisterne: bassin
    box(-14, -2.5, 0.25, 7.0); // kerker: tralies
    box(-15, -2.5, 2.0, 0.2);
    for (const [x, z] of HARNASSEN_KELDER) cirkel(x, z, 0.4);
    box(10.0, -4.9, 2.1, 1.1); // crypte: graftombe
    for (const [x, z] of [
      [2.5, -13.4],
      [4.0, -13.4],
      [6.9, -12.2],
      [6.9, -8.0],
    ] as V2[])
      cirkel(x, z, 0.45);
    box(-7.0, -7.0, 1.2, 1.2);
  });
}

/** Wegwijzer met twee bordjes (bospad). */
export function Wegwijzer({ pos = [0, 0, 0], rot = 0, teksten = ['Slot Maansteyn', 'Bos'] }: { pos?: V3; rot?: number; teksten?: [string, string] | string[] }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.14, 2.2, 0.14]} pos={[0, 1.1, 0]} color="#3b2a1d" r={0.02} />
      <group position={[0.65, 1.85, 0]} rotation={[0, 0, 0.08]}>
        <Naambord pos={[0, 0, 0.09]} tekst={teksten[0]} b={1.8} kleur="#2f2016" fg="#ffb347" />
      </group>
      <group position={[-0.5, 1.4, 0]} rotation={[0, Math.PI, -0.1]}>
        <Naambord pos={[0, 0, 0.09]} tekst={teksten[1]} b={1.0} kleur="#2f2016" fg="#cfe0a8" />
      </group>
    </group>
  );
}

/** Paden van kinderkopjes op de binnenplaats en de stenen vloer onder de arcade. */
const PADEN: [number, number, number, number][] = [
  // [x0, x1, z0, z1]
  [-8, -5.2, -6, 8],
  [-1.2, 1.2, 4.6, 8],
  [-1.2, 1.2, -6, -2.3],
  [-4.4, 4.4, 4.6, 5.8],
  [-4.4, 4.4, -3.5, -2.3],
  [3.4, 4.6, -3.5, 5.8],
  [-4.4, -3.4, -3.5, 5.8],
  [4.6, 8, 3.3, 4.7],
  [4.6, 8, -3.7, -2.3],
  [-5.2, -4.4, 2.3, 3.7],
];

/** Vaste aankleding van de begane grond (wordt samengevoegd). */
export function Wereld2Decor() {
  return (
    <>
      {/* ── Binnenplaats: paden, arcade, put, regenpijp, bank, pompoenen ── */}
      {PADEN.map(([x0, x1, z0, z1], i) => (
        <Blok key={i} size={[x1 - x0, 0.03, z1 - z0]} pos={[(x0 + x1) / 2, 0.015, (z0 + z1) / 2]} color="#6f675d" r={0} shadow={false} />
      ))}
      <Arcade x0={-8} x1={-5.5} z0={-6} z1={8} zuilen={ARCADE_Z} />
      <Waterput pos={[PUT[0], 0, PUT[1]]} />
      <Blok size={[0.12, 2.2, 0.12]} pos={[5.6, 2.2, 8 - MUUR - 0.08]} color="#3a3a3a" r={0.02} />
      <Blok size={[0.12, 0.12, 0.5]} pos={[5.6, 1.15, 8 - MUUR - 0.3]} color="#3a3a3a" r={0.02} />
      <Bank pos={[-4.6, 0, 0.6]} rot={Math.PI / 2} b={1.6} kleur="#6b4a32" />
      <Pompoen pos={[-3.9, 0, 5.2]} rot={0.3} s={0.8} />
      <Pompoen pos={[3.9, 0, -2.9]} rot={-0.8} s={0.7} />
      <Pompoen pos={[6.8, 0, 7.2]} rot={3.0} s={0.75} kleur="#d8661a" />
      <Kaarsen pos={[-4.6, 0.45, 0.0]} s={0.7} />

      {/* ── Poortzaal ── */}
      <Kleed pos={[0, 12.4]} b={2.0} d={5.0} kleur="#4a1f2a" rand="#8a6a2a" />
      <Kaarsen pos={[2.6, 0, 16.5]} s={0.8} />

      {/* ── Uitlegkamer ── */}
      <Boekenkast pos={[-5.5, 0, 14 - MUUR - 0.22]} rot={Math.PI} b={2.0} seed={3} />
      <Kleed pos={[-5.5, 11.2]} b={4.0} d={3.8} kleur="#35506b" />

      {/* ── Stallen: hooi, een zadel op een rek ── */}
      <Blok size={[0.9, 0.7, 0.9]} pos={[7.3, 0.35, 13.3]} color="#c9a24a" r={0.12} />
      <Blok size={[0.9, 0.7, 0.9]} pos={[7.3, 0.35, 8.8]} color="#b8933c" r={0.12} />
      <Blok size={[0.06, 1.4, 5.6]} pos={[3.5, 0.7, 11]} color="#4a3324" r={0.02} />
      <Blok size={[0.7, 0.3, 0.5]} pos={[7.4, 1.0, 11.0]} color="#5a3422" r={0.12} />

      {/* ── Smidse: smidsvuur, mijnrails uit de ertsgang ── */}
      <group position={[-14.4, 0, 12.9]} rotation={[0, Math.PI, 0]}>
        <Smidsvuur pos={[0, 0, 0]} />
      </group>
      <group position={[-14.6, 0, 9.4]}>
        {[0, 1, 2].map((i) => (
          <Blok key={i} size={[1.2, 0.08, 0.22]} pos={[0, 0.04, -0.9 + i * 0.9]} color="#4a3324" r={0.02} shadow={false} />
        ))}
        {[-0.45, 0.45].map((x) => (
          <Blok key={x} size={[0.07, 0.1, 2.8]} pos={[x, 0.12, 0]} color="#5a5a62" r={0.02} shadow={false} />
        ))}
      </group>
      <Krat pos={[-9.0, 0, 13.4]} rot={0.2} s={0.8} />

      {/* ── Wapenzaal ── */}
      <Wapenrek pos={[-8 - MUUR - 0.2, 0, -1.0]} rot={-Math.PI / 2} />
      <Kleed pos={[-10.25, -2.0]} b={2.6} d={5.0} kleur="#3b2a46" rand="#8a6a2a" />

      {/* ── Ertsgang: een paar ertsbrokken langs het spoor ── */}
      {(
        [
          [-13.1, -4.6],
          [-13.0, 6.6],
        ] as V2[]
      ).map(([x, z], i) => (
        <Blok key={i} size={[0.6, 0.35, 0.5]} pos={[x, 0.17, z]} rot={[0, i, 0]} color="#4a3a36" r={0.12} />
      ))}

      {/* ── Bouwmeester: tekenezel en een kleed ── */}
      <Ezel pos={[9.0, 0, 0.7]} rot={Math.PI * 0.8} />
      <Kleed pos={[10.5, 4.3]} b={3.6} d={1.6} kleur="#6b4a32" rand="#c9a25a" />

      {/* ── Kapel: altaar met glas-in-lood, kerkbank, kaarsen ── */}
      <Altaar pos={[9.6, 0, -6 + MUUR]} raamY={3.6} />
      <Kerkbank pos={[9.9, 0, -0.55]} rot={Math.PI} b={1.8} />
      <Kaarsen pos={[8.5, 0, -5.4]} s={0.9} />

      {/* ── Ridderzaal: lange tafel, schouw ── */}
      <LangeTafel pos={[-0.3, 0, -9.3]} l={3.4} />
      <Kroonluchter pos={[-0.3, 4.2, -9.3]} r={1.0} n={10} ketting={2.5} />
      <Kroonluchter pos={[-0.3, 4.4, -12.4]} r={0.7} n={6} ketting={2.3} />
      <Schouw pos={[4.5, 0, -14 + MUUR]} b={2.4} />
      <Kleed pos={[0, -11.2]} b={7.0} d={1.6} kleur="#8a2f2a" rand="#c9a25a" />

      {/* ── Heksenkeuken: schouw met ketel, vat, kaarsen ── */}
      <Schouw pos={[14.0, 0, -14 + MUUR]} b={2.0} />
      <Vat pos={[8.6, 0, -13.3]} kleur="#4a6a3a" />

      {/* ── Schatkamer: kisten met goud ── */}
      <Krat pos={[-16.2, 0, -7.2]} rot={0.3} />
      <Krat pos={[-16.2, 0.6, -7.2]} rot={-0.2} s={0.8} />
      <Krat pos={[-9.0, 0, -7.0]} rot={-0.3} />
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={i} position={[-9.0 + x, 0.66 + (i % 2) * 0.05, -7.0]} material={mat('#d9a520', { metal: 0.8, rough: 0.3 })}>
          <cylinderGeometry args={[0.1, 0.1, 0.04 + i * 0.02, 10]} />
        </mesh>
      ))}

      {/* ── Kerkhof: graven en pompoenen ── */}
      {GRAVEN.map(([x, z], i) => (
        <Grafsteen key={i} pos={[x, 0, z]} rot={x < 19 ? Math.PI / 2 : -Math.PI / 2} scheef={((i % 3) - 1) * 0.05} s={0.9 + (i % 2) * 0.15} />
      ))}
      <Pompoen pos={[21.4, 0, -1.6]} rot={-1.4} s={0.8} />
      <Pompoen pos={[16.6, 0, 6.4]} rot={1.2} s={0.7} />

      {/* ── Bouwplaats: stenen voor de nieuwe toren, balken, een kruiwagen ── */}
      {[0, 1, 2].map((i) => (
        <Blok key={i} size={[1.5, 0.35, 1.0]} pos={[12.2, 0.18 + i * 0.36, -15.4]} rot={[0, i * 0.15, 0]} color={i % 2 ? '#8a8174' : '#7a7266'} r={0.04} />
      ))}
      {[0, 1, 2].map((i) => (
        <Blok key={`b${i}`} size={[2.1, 0.18, 0.2]} pos={[1.4, 0.1 + i * 0.19, -20.3 + (i - 1) * 0.22]} color="#6b4a32" r={0.02} />
      ))}
      <Blok size={[0.6, 0.3, 1.0]} pos={[3.2, 0.35, -15.0]} rot={[0, 0.5, 0]} color="#4a4a4a" r={0.05} />
    </>
  );
}

/** Gras op de binnenplaats en het kerkhof, behalve op de paden en onder de opdrachten. */
function TuinGras() {
  const uit = useMemo(() => {
    const r: [number, number, number, number][] = PADEN.map(([x0, x1, z0, z1]) => [(x0 + x1) / 2, (z0 + z1) / 2, x1 - x0 + 0.2, z1 - z0 + 0.2]);
    for (const st of stationsVan()) {
      if ((st.verdieping ?? 0) !== 0) continue;
      if (st.id === 'tuin-frank') continue;
      const [bx, bz] = st.botser ?? [1.4, 1.4];
      r.push([st.pos[0], st.pos[1], bx + 0.5, bz + 0.5]);
    }
    return r;
  }, []);
  const vrij = useMemo<[number, number, number][]>(() => [[PUT[0], PUT[1], 1.2]], []);
  return (
    <Gras
      vlakken={[
        [0, 1, 15.6, 13.6],
        [19, 0, 5.6, 21.6],
      ]}
      uit={uit}
      vrij={vrij}
      y={0.012}
      kleur="#3f6a3a"
      dichtheid={10}
      seed={5}
    />
  );
}

// ── Ramen (decor op de muren) ──
/** Begane grond: kleine kasteelraampjes buiten, grotere op de binnenplaats. */
const RAMEN_0: ([number, number] | [number, number, number])[] = [
  [-5.5, 8, 0.8],
  [4.2, 8, 0.7],
  [-9.6, 14, 0.55],
  [10.5, 14, 0.4],
  [-8, -3.6, 0.6],
  [-8, 6.4, 0.6],
  [8, 1.4, 0.8],
  [8, 6.6, 0.8],
  [8, -5.2, 0.55],
  [8, -0.7, 0.55],
  [-4.5, -6, 1.0],
  [4.5, -6, 1.0],
  [-4.5, -14, 0.9],
  [0.5, -14, 0.9],
  [12.0, -14, 0.6],
  [16, -7.5, 0.6],
  [-17, -9, 0.35],
];
/** Eerste verdieping: de zes ramen van het poortgebouw (drie voor, drie achter), torenkamer B, bibliotheek, galerij, donjon. */
const RAMEN_1: ([number, number] | [number, number, number])[] = [
  [-1.6, 17, 0.55],
  [0, 17, 0.55],
  [1.6, 17, 0.55],
  [-1.6, 8, 0.55],
  [0, 8, 0.55],
  [1.6, 8, 0.55],
  [11, 14, 0.7],
  [10, 8, 0.6],
  [-12.4, 14, 0.6],
  [-16, 7.0, 0.6],
  [-17, -9.5, 0.5],
  [-8, -8.5, 0.6],
];
const RAMEN_DONJON: ([number, number] | [number, number, number])[] = [
  [-12.5, -6, 0.5],
  [-17, -9, 0.5],
  [-8, -9, 0.5],
];

/** Fakkels aan de muren per verdieping (punt net in de kamer, bij de muur). */
const FAKKELS_0: V2[] = [
  [-2.75, 9.4],
  [2.75, 9.4],
  [-2.75, 16.5],
  [-15.75, -3.0],
  [-15.75, 5.5],
  [15.75, -4.6],
  [13.25, 2.2],
  [15.75, 6.8],
  [-12.25, -4.0],
  [-8.25, 0.2],
  [15.75, 9.6],
  [-8.25, 13.4],
  [-8.25, -7.2],
  [-16.75, -9.6],
  [-7.75, -8.0],
  [7.75, -12.8],
  [15.75, -12.8],
  [7.75, 9.2],
];
const FAKKELS_1: V2[] = [
  [-15.75, -5.0],
  [-15.75, 6.2],
  [-8.25, -12.6],
  [2.75, 16.5],
  [8.25, 13.6],
];
const FAKKELS_KELDER: V2[] = [
  [-7.75, 0.4],
  [7.75, -5.4],
  [-7.75, -7.4],
  [7.75, -13.2],
  [-8.25, 0.6],
  [-16.75, -7.6],
  [12.75, -5.6],
];

/** Spinnenwebben: hoek [x, z] en richting de kamer in, per verdieping. */
const WEBBEN_0: [number, number, number, number][] = [
  [-16, -6, 1, 1],
  [-16, 8, 1, -1],
  [16, -6, -1, 1],
  [16, 8, -1, -1],
  [-17, -15, 1, 1],
  [-8, -14, 1, 1],
  [8, -6, 1, 1],
];
const WEBBEN_KELDER: [number, number, number, number][] = [
  [-8, -6, 1, 1],
  [8, 1, -1, -1],
  [-16, 1, 1, -1],
  [-17, -15, 1, 1],
  [13, -6, -1, 1],
];

export function Wereld2Levend() {
  return (
    <>
      <TuinGras />
      <Vensters punten={RAMEN_0} />
      <OpMuur vast bij={[0, 17.2]}>
        <Naambord pos={[0, 3.55, 17 + MUUR + 0.02]} tekst="Slot Maansteyn" b={2.6} kleur="#2a1f33" fg="#ffb347" />
      </OpMuur>
      <OpVerdieping v={0}>
      <Binnen>
        <Fakkels punten={FAKKELS_0} />
        {WEBBEN_0.map(([x, z, dx, dz], i) => (
          <Spinnenweb key={i} hoek={[x, z]} naar={[dx, dz]} />
        ))}
        {HARNASSEN_0.map(([x, z, r], i) => (
          <Harnas key={i} pos={[x, 0, z]} rot={r} />
        ))}
        <Ketel pos={[12.6, 0, -12.6]} s={1.15} />
        {/* banieren: poortzaal en ridderzaal */}
        <Banier pos={[-2.84, 1.6, 12.6]} rot={Math.PI / 2} bij={[-2.8, 12.6]} kleur="#2f2a4a" />
        <Banier pos={[-2.5, 1.9, -6 - MUUR - 0.02]} rot={Math.PI} bij={[-2.5, -6.2]} />
        <Banier pos={[2.5, 1.9, -6 - MUUR - 0.02]} rot={Math.PI} bij={[2.5, -6.2]} />
        {/* portretten in de spookgang en de ridderzaal: ogen die je volgen */}
        <SpookPortret pos={[13 + MUUR + 0.04, 1.75, -1.6]} rot={Math.PI / 2} bij={[13.2, -1.6]} />
        <SpookPortret pos={[-1.5, 2.6, -14 + MUUR + 0.04]} bij={[-1.5, -13.8]} />
        <OpMuur vast bij={[-8 + MUUR + 0.03 + 0.2, -12.6]}>
          <Schilderij pos={[-8 + MUUR + 0.03, 2.3, -12.6]} rot={Math.PI / 2} motief={3} b={1.4} h={1.0} />
        </OpMuur>
        {/* uitlegkamer: schoolbord */}
        <OpMuur vast bij={[-8 + MUUR + 0.2, 13.0]}>
          <Schoolbord pos={[-8 + MUUR + 0.04, 1.75, 12.9]} rot={Math.PI / 2} regels={['Inhoud = l × b × h', '1 m³ = 1000 liter', 'Eerst denken!']} b={1.8} h={1.2} />
        </OpMuur>
        {/* keuken en bouwmeester: planken met potten en boeken */}
        <OpMuur vast bij={[8 + MUUR + 0.2, -12.6]}>
          <Wandplank pos={[8 + MUUR, 1.65, -12.6]} rot={Math.PI / 2} b={1.8} spullen={6} seed={11} />
        </OpMuur>
        <OpMuur vast bij={[10.5, MUUR + 0.2]}>
          <Wandplank pos={[10.5, 1.65, MUUR]} b={2.0} spullen={5} seed={5} />
        </OpMuur>
        <RodeOgen
          punten={[
            [-15.6, 0.4, 7.4],
            [15.6, 2.6, -5.6],
            [-16.6, 0.4, -14.6],
          ]}
        />
        <Spin pos={[14.6, 3.0, 1.0]} lengte={1.4} />
        <Spin pos={[-14.2, 3.0, -2.0]} />
        <Mistbank gebied={[14.5, 1, 3, 14]} sterkte={0.1} kleur="#8f96b8" />
        <Mistbank gebied={[-14.25, 1, 3.5, 14]} sterkte={0.1} kleur="#8f96b8" />
        <Schim trigger={[14.5, 0.5, 2.2]} van={[19, 3]} naar={[10, -1]} />
        <Schim trigger={[-14.2, 3.0, 2.2]} van={[-19, -1]} naar={[-10, 5]} />
      </Binnen>
      </OpVerdieping>
      <Spreekplek gebied={[0, 22, 4, 8]} tekst="Sst… de brug. Onder ons ligt het zwarte meer. Daar voor ons is de poort." geluidje={null} />
      <Spreekplek gebied={[0, 2, 15, 12]} tekst="De binnenplaats. In het midden ligt Franks tuin, met de vijver. Daar is het veilig." geluidje={null} />
      <Spreekplek gebied={[14.5, 1, 3, 13]} tekst="De spookgang… Hoor je dat ook? Blijf in het licht van je lamp." />
      <Spreekplek gebied={[12, 11, 7, 5]} tekst="Een trap naar toren B. Hij kraakt. Boven gaat de rondgang verder." geluidje="kraak" />
      <Spreekplek gebied={[-14.25, 1, 3.5, 13]} tekst="De ertsgang. Hier reed de ertswagen naar de smidse. Niemand duwt hem meer… toch?" geluidje="kraak" />
      <Spreekplek gebied={[19, 0, 5.5, 21]} tekst="Het kerkhof. Het is hier stil. Te stil." geluidje={null} />
      <Spreekplek gebied={[2.5, -17.5, 20, 6]} tekst="De bouwplaats. Toren C wordt verbouwd. Daar is de achterpoort: je weg naar buiten." geluidje={null} />

      {/* ── Eerste verdieping ── */}
      <Verdieping nr={1}>
        <Vensters punten={RAMEN_1} />
        <OpVerdieping v={1}>
        <Binnen>
          <Statisch>
            <Verdieping1Decor />
          </Statisch>
          <Fakkels punten={FAKKELS_1} />
          {HARNASSEN_1.map(([x, z, r], i) => (
            <Harnas key={i} pos={[x, 0, z]} rot={r} />
          ))}
          {/* galerij: portretten die je nakijken */}
          <SpookPortret pos={[-16 + MUUR + 0.04, 1.75, 1.6]} rot={Math.PI / 2} bij={[-15.8, 1.6]} />
          <SpookPortret pos={[-16 + MUUR + 0.04, 1.75, -4.4]} rot={Math.PI / 2} bij={[-15.8, -4.4]} />
          <OpMuur vast bij={[-16 + MUUR + 0.2, 10.6]}>
            <group position={[-16 + MUUR + 0.04, 1.8, 11.6]} rotation={[0, Math.PI / 2, 0]}>
              <FrankSchilderij pos={[0, 0, 0]} b={0.7} achter="#4a2f3a" />
            </group>
          </OpMuur>
          <ZwevendeBoeken midden={[-12.4, 0, 12.4]} n={6} />
          <RodeOgen punten={[[-15.6, 0.4, -5.6]]} />
          <Spin pos={[-12.0, 3.0, 2.0]} lengte={1.5} />
        </Binnen>
        </OpVerdieping>
        <Spreekplek verdieping={1} gebied={[12, 11, 7.5, 5.5]} tekst="Torenkamer B. Hier komt een nieuwe houten vloer. De oude is… weg." geluidje={null} />
        <Spreekplek verdieping={1} gebied={[-5.5, 11, 4.5, 5.5]} tekst="De walgang. Kijk over de kantelen: de brug, en het bos waar je vandaan kwam. Zo ver weg." geluidje={null} />
        <Spreekplek verdieping={1} gebied={[-12, 1, 7.5, 13]} tekst="De galerij… De ogen in de schilderijen volgen je. Kijk door het raam: Franks tuin, van boven." />
        <Spreekplek verdieping={1} gebied={[-12.5, -10.5, 8.5, 8.5]} tekst="De wachtkamer van de donjon. Met de trap kun je weer naar beneden." geluidje="kraak" />
      </Verdieping>

      {/* ── Kelder ── */}
      <Verdieping nr={-1}>
        <OpVerdieping v={-1}>
        <Binnen>
          <Statisch>
            <KelderDecor />
          </Statisch>
          <Fakkels punten={FAKKELS_KELDER} />
          {WEBBEN_KELDER.map(([x, z, dx, dz], i) => (
            <Spinnenweb key={i} hoek={[x, z]} naar={[dx, dz]} y={2.9} />
          ))}
          {HARNASSEN_KELDER.map(([x, z, r], i) => (
            <Harnas key={i} pos={[x, 0, z]} rot={r} />
          ))}
          <Waterbekken x0={-1.1} x1={2.6} z0={-3.5} z1={-0.7} />
          <Maanzuil pos={[PUT[0], 0, PUT[1]]} h={3.2} />
          <RodeOgen
            punten={[
              [-15.6, 0.35, -5.6],
              [12.6, 0.4, -0.4],
              [-7.6, 2.4, -13.6],
            ]}
          />
          <Spin pos={[-12.0, 2.9, -2.6]} lengte={1.2} />
          <Mistbank gebied={[0, -10, 15.5, 7.5]} sterkte={0.08} kleur="#8f96b8" />
        </Binnen>
        </OpVerdieping>
        <Spreekplek verdieping={-1} gebied={[0, -2.5, 15, 6]} tekst="De cisterne onder de binnenplaats. Het licht uit de put is de maan. Het enige licht hier." />
        <Spreekplek verdieping={-1} gebied={[-12, -2.5, 7.5, 6.5]} tekst="De kerker… De cellen zijn leeg. Bijna allemaal." geluidje="kraak" />
        <Spreekplek verdieping={-1} gebied={[10.5, -3, 4.5, 5.5]} tekst="Een crypte onder de kapel. Sssst… maak ze niet wakker." />
      </Verdieping>
    </>
  );
}

/** Eerste verdieping, vast: torenkamer B, de walgangen, de bodekamer, bibliotheek, galerij en de wachtkamer. */
function Verdieping1Decor() {
  return (
    <>
      {/* walgangen: pompoenen en kaarsen tussen de kantelen */}
      <Pompoen pos={[-7.4, 0, 13.3]} rot={0.6} s={0.8} />
      <Pompoen pos={[7.3, 0, 13.3]} rot={-0.6} s={0.9} />
      <Kaarsen pos={[3.6, 0, 13.3]} s={0.8} />
      <Pompoen pos={[-7.4, 0, -5.3]} rot={1.6} s={0.7} kleur="#d8661a" />
      {/* bodekamer: de windas van het valhek, moordgaten in de vloer, de bank van de bode */}
      <Windas pos={[0, 0, 15.65]} />
      <Moordgat pos={[-0.9, 0, 13.6]} />
      <Moordgat pos={[0.9, 0, 13.6]} />
      <Bank pos={[2.5, 0, 13.8]} rot={-Math.PI / 2} b={1.8} kleur="#4a3324" />
      <Kleed pos={[-1.6, 11.6]} b={1.6} d={3.0} kleur="#5a2430" rand="#c9a25a" />
      {/* bibliotheek */}
      <Boekenkast pos={[-14.2, 0, 14 - MUUR - 0.22]} rot={Math.PI} b={2.2} seed={7} />
      <Boekenkast pos={[-10.6, 0, 14 - MUUR - 0.22]} rot={Math.PI} b={2.2} seed={8} />
      <Boekenkast pos={[-16 + MUUR + 0.22, 0, 9.3]} rot={Math.PI / 2} b={1.6} seed={9} />
      <Fauteuil pos={[-9.0, 0, 13.0]} rot={-2.4} kleur="#7a2f3a" />
      <Kleed pos={[-12.2, 11.2]} b={4.6} d={3.2} kleur="#5a2430" rand="#c9a25a" />
      <StaandeLamp pos={[-8.6, 0, 9.0]} />
      {/* galerij: lange loper */}
      <Kleed pos={[-12.4, 1.0]} b={1.8} d={12.0} kleur="#4a1f2a" rand="#8a6a2a" />
      {/* wachtkamer van de donjon */}
      <Bank pos={[-16.2, 0, -7.4]} rot={Math.PI / 2} b={1.6} kleur="#4a3324" />
      <Kleed pos={[-12.4, -8.4]} b={4.4} d={3.2} kleur="#8e2a22" rand="#c9a25a" />
      <Kaarsen pos={[-9.0, 0, -11.2]} s={0.8} />
    </>
  );
}

/** Kelder, vast: cellen, vaten, kisten, de graftombe in de crypte. */
function KelderDecor() {
  return (
    <>
      {/* kerker: tralies voor twee lege cellen */}
      <Spijlen a={[-14, -5.85]} b={[-14, 0.85]} h={2.6} />
      <Spijlen a={[-15.85, -2.5]} b={[-14, -2.5]} h={2.6} />
      <Blok size={[1.6, 0.4, 0.7]} pos={[-15.1, 0.2, -4.6]} color="#4a3a30" r={0.03} />
      <Schedel pos={[-15.2, 0, 0.2]} rot={0.6} s={0.8} />
      {/* voorraadkelder: vaten en kisten */}
      <Vat pos={[2.5, 0, -13.4]} kleur="#6b4a32" />
      <Vat pos={[4.0, 0, -13.4]} kleur="#5a4030" />
      <Vat pos={[6.9, 0, -12.2]} kleur="#6b4a32" />
      <Vat pos={[6.9, 0, -8.0]} kleur="#5a4030" />
      <Krat pos={[-7.0, 0, -7.0]} rot={0.2} />
      <Krat pos={[-7.0, 0.6, -7.0]} rot={-0.3} s={0.8} />
      <Kaarsen pos={[-1.0, 0, -13.5]} s={0.8} />
      {/* crypte: graftombe met deksel */}
      <Blok size={[2.0, 0.85, 1.0]} pos={[10.0, 0.42, -4.9]} color="#8a8274" r={0.05} />
      <Blok size={[2.15, 0.14, 1.12]} pos={[10.0, 0.92, -4.9]} color="#9a9284" r={0.04} />
      <Kaarsen pos={[8.6, 0, -0.6]} s={0.8} />
      {/* cisterne: kaarsen bij de puttrap */}
      <Kaarsen pos={[-7.5, 0, -3.8]} s={0.9} />
      <Pompoen pos={[-7.4, 0, 0.4]} rot={0.6} s={0.7} kleur="#d8661a" />
    </>
  );
}

/** De donjon hoger op: torenkamer D (te huur), de wachtpost en het dak met de uitkijk. */
export function Wereld2Donjon() {
  return (
    <>
      <Verdieping nr={2}>
        <Vensters punten={RAMEN_DONJON} />
        <OpVerdieping v={2}>
        <Binnen>
          <Statisch>
            <BooBed pos={[-16.0, 0, -7.6]} rot={Math.PI / 2} />
            <Blok size={[1.4, 0.75, 0.8]} pos={[-9.2, 0.37, -7.0]} color="#4a3324" r={0.03} />
            <Kaarsen pos={[-9.2, 0.75, -7.0]} s={0.6} />
            <Kleed pos={[-12.4, -8.6]} b={4.2} d={3.0} kleur="#3b2a46" rand="#c9a25a" />
          </Statisch>
          <StaandeLamp pos={[-16.4, 0, -10.4]} />
          <Spinnenweb hoek={[-8, -6]} naar={[-1, -1]} />
        </Binnen>
        </OpVerdieping>
        <Spreekplek verdieping={2} gebied={[-12.5, -10.5, 8.5, 8.5]} tekst="Torenkamer D. Hier woont niemand meer. Al heel lang niet." geluidje={null} />
      </Verdieping>
      <Verdieping nr={3}>
        <Vensters punten={RAMEN_DONJON} />
        <OpVerdieping v={3}>
        <Binnen>
          <Statisch>
            <Krat pos={[-16.0, 0, -7.0]} rot={0.3} />
            <Krat pos={[-16.0, 0.6, -7.0]} rot={-0.4} s={0.85} />
            <Krat pos={[-9.0, 0, -7.0]} rot={0.9} s={0.9} />
            <Kaarsen pos={[-9.0, 0.6, -7.0]} s={0.6} />
          </Statisch>
          <Fakkels punten={[[-8.25, -8.6]]} />
          <Spinnenweb hoek={[-17, -6]} naar={[1, -1]} />
        </Binnen>
        </OpVerdieping>
        <Spreekplek verdieping={3} gebied={[-12.5, -10.5, 8.5, 8.5]} tekst="De wachtpost. Hier hield de wachter de brug in de gaten. Hij is nooit naar beneden gekomen." geluidje="kraak" />
      </Verdieping>
      <Verdieping nr={4}>
        <Statisch>
          <Telescoop pos={[-9.2, 0, -7.2]} rot={0.6} />
          <Pompoen pos={[-16.2, 0, -6.6]} rot={-0.6} s={1.0} />
          <Blok size={[0.1, 4.0, 0.1]} pos={[-16.3, 2.0, -14.3]} color="#2a2a2a" r={0.02} />
        </Statisch>
        <mesh position={[-15.75, 3.4, -14.3]} material={gloed('#5b2f8a')}>
          <planeGeometry args={[1.0, 0.65]} />
        </mesh>
        <Spreekplek
          verdieping={4}
          gebied={[-12.5, -10.5, 8.5, 8.5]}
          tekst="Boven op de donjon. Kijk omlaag: het hele slot ligt eronder, net een plattegrond. En ergens daar beneden… is hij."
          geluidje={null}
        />
      </Verdieping>
    </>
  );
}

