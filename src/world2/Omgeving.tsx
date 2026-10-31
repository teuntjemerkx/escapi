// Wereld 2: Slot Maansteyn staat op een rotseiland in het Nevelmeer, diep in het bos. Het bospad komt uit bij een stenen
// brug op pijlers; de laatste meters zijn een houten ophaalbrug voor de poort. Rond het slot staan drie ronde hoektorens
// met leien kegeldaken (toren C staat in de steigers: die wordt verbouwd). Achter het slot gaat een rotstrap omlaag naar
// de steiger met de boot. Vanaf het bospad staat de donjon precies voor de maan.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Gras } from '../game/gras';
import { schrik } from '../game/maatje';
import { Bos, Den, Kampvuur, Lantaarns, Paddenstoel, Rots, Terrein, terreinRand, Vuurvliegjes, Water } from '../game/natuur';
import { Statisch } from '../game/statisch';
import { speler, useSpel } from '../game/store';
import type { Plattegrond } from '../werelden/types';
import { Bergen, Schoorsteen } from './bran';
import { MEER_Y, PLAN, STEIGER_Y, TORENS } from './huis';
import { Brug, Eilandrots, Hoektoren, Rotstrap, Steiger, Steigers } from './kasteel';
import { Ketel, Maan, Mistbank, Pompoen, Vleermuizen } from './spook';
import { Wegwijzer } from './Wereld2';

type V2 = [number, number];

/** De rand van het rotseiland (bovenkant op 0 m). */
export const EILAND: V2[] = [
  [-21.2, 19.4],
  [-8, 19.7],
  [-4, 20.0],
  [4, 20.0],
  [8, 19.7],
  [21.0, 19.4],
  [23.6, 14.5],
  [23.9, 0],
  [23.6, -12],
  [21.6, -18.6],
  [16.2, -22.6],
  [2, -22.9],
  [-9.5, -22.7],
  [-12.6, -19.2],
  [-19.6, -18.2],
  [-21.5, -8],
  [-21.6, 6],
];
/** Waar het slot zijn eigen vloeren heeft: daar is de rots open (anders dekt hij de trapgaten naar de kelder af). */
const GAT: V2[] = [
  [-17, -15],
  [-8, -15],
  [-8, -21],
  [13, -21],
  [13, -14],
  [16, -14],
  [16, -11],
  [22, -11],
  [22, 11],
  [16, 11],
  [16, 14],
  [3, 14],
  [3, 17],
  [2, 17],
  [2, 19.8],
  [-2, 19.8],
  [-2, 17],
  [-3, 17],
  [-3, 14],
  [-16, 14],
  [-16, -6],
  [-17, -6],
];
/** Het Nevelmeer: een gat in de bosgrond, 4 m diep tot het water. Bij de brug is de oever recht (z 27). */
export const MEER: V2[] = [
  [-31, 27.5],
  [-14, 27.4],
  [-4.5, 27.0],
  [4.5, 27.0],
  [14, 27.4],
  [31, 27.0],
  [34.5, 14],
  [34.8, -6],
  [33, -22],
  [27, -31],
  [16, -36],
  [2, -36.5],
  [-12, -35],
  [-25, -29],
  [-31.5, -16],
  [-32.5, 4],
];
/** Bosgrond rondom (tot ver in de mist). */
const BOSRAND = terreinRand({ minX: -46, maxX: 48, minZ: -50, maxZ: 58 }, 4, 1.2, 7);
/** Plan met alleen het meer: het bos begint aan de oever. */
const MEERPLAN: Plattegrond = { ...PLAN, kamers: [{ id: 'meer', naam: 'Meer', pos: [1.2, -4.5], maat: [67.6, 64] }] };
/** Het bospad: daarlangs staat het bos dicht op de rand. */
const PADPLAN: Plattegrond = { ...PLAN, kamers: [{ id: 'bospad', naam: 'Bospad', pos: [0, 41], maat: [6, 28] }] };
const LANGS_PAD: V2[] = [
  [-15, 28.5],
  [15, 28.5],
  [15, 56],
  [-15, 56],
];
/** De grote den waar Boo achter verstopt zit. */
const SCHRIKBOOM: V2 = [-4.7, 32.4];

/** Schoorstenen [x, voet (y), z, lengte]: ridderzaal, keuken, bibliotheek, bodekamer. */
const SCHOORSTENEN: [number, number, number, number][] = [
  [4.5, 7.4, -13.3, 4.4],
  [14.0, 4.0, -13.2, 4.6],
  [-15.2, 7.6, 12.6, 4.0],
  [1.8, 7.4, 16.2, 3.4],
];

/** Halverwege het bospad schiet Boo ineens achter de grote den vandaan. Eén keer. */
function BosSchrik() {
  const gedaan = useRef(false);
  useFrame(() => {
    if (gedaan.current) return;
    const s = useSpel.getState();
    if (s.modus !== 'lopen' || s.kaart || speler.verdieping !== 0) return;
    const { x, z } = speler.pos;
    if (z < 35.6 && z > 29 && Math.abs(x) < 3.2) {
      gedaan.current = true;
      schrik(SCHRIKBOOM[0] + 0.6, SCHRIKBOOM[1] - 0.6, 'Sst… Schrok je? Ik ben het maar, Boo. Kijk, daar in het meer: Slot Maansteyn. Daar moet je naartoe.');
    }
  });
  return null;
}

export function Wereld2Omgeving() {
  const vrijPad = useMemo<[number, number, number][]>(() => [[SCHRIKBOOM[0], SCHRIKBOOM[1], 1.6], [8.6, 37.5, 3.2]], []);
  return (
    <>
      {/* ── Het bos en het meer ── */}
      <Statisch>
        <Terrein plan={PLAN} vorm={BOSRAND} boven="gras" bovenKleur="#22342a" lagen={['#3a2b22', '#30241c', '#271d17', '#1c1512']} diepte={5} gaten={[MEER]} gatDiepte={4.6} gatKleur="#2b2420" />
        {/* het bospad: aangestampte aarde met wat stenen */}
        <mesh position={[0, 0.006, 34.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 15]} />
          <meshStandardMaterial color="#3d3428" roughness={1} />
        </mesh>
        {(
          [
            [-1.2, 29.2],
            [0.9, 31.6],
            [-0.6, 35.8],
            [1.1, 39.4],
          ] as V2[]
        ).map(([x, z], i) => (
          <Rots key={i} pos={[x, 0, z]} s={0.35 + (i % 2) * 0.15} seed={10 + i} kleur="#55525a" />
        ))}
        <Den pos={[SCHRIKBOOM[0], 0, SCHRIKBOOM[1]]} s={2.2} kleur="#1b2e25" rot={0.4} />
        {(
          [
            [-2.6, 0, 37.0],
            [2.5, 0, 33.6],
            [-2.5, 0, 30.2],
            [2.6, 0, 29.0],
            [-9.0, 0, 30.5],
            [7.0, 0, 31.0],
          ] as [number, number, number][]
        ).map((p, i) => (
          <Paddenstoel key={i} pos={p} s={0.8 + (i % 3) * 0.3} />
        ))}
        <Wegwijzer pos={[2.7, 0, 30.6]} rot={-0.3} teksten={['Slot Maansteyn', 'Bos']} />
        <Pompoen pos={[-2.4, 0, 28.2]} rot={1.2} s={0.9} />
        <Pompoen pos={[2.5, 0, 28.0]} rot={-1.0} s={0.8} kleur="#d8661a" />
        <Rots pos={[-14, 0, 30]} s={1.1} seed={3} kleur="#4a474f" />
        <Rots pos={[16, 0, 31]} s={0.9} seed={4} kleur="#4a474f" />
        <Rots pos={[38, 0, -4]} s={1.2} seed={5} kleur="#4a474f" />
        <Rots pos={[-36, 0, -12]} s={1.0} seed={6} kleur="#4a474f" />
      </Statisch>
      <Water pos={[1.2, -4.5]} maat={[72, 68]} y={MEER_Y} zijkant={false} kleur="#1b3048" diep="#0a1424" golf={0.5} />
      {/* mist boven het water */}
      <group position={[0, MEER_Y + 0.05, 0]}>
        <Mistbank gebied={[0, 23.5, 30, 7]} kleur="#8fa0d8" sterkte={0.16} />
        <Mistbank gebied={[2, -30, 40, 9]} kleur="#8fa0d8" sterkte={0.14} />
      </group>
      <Bos plan={MEERPLAN} binnen={BOSRAND} van={0.6} tot={18} n={140} vrij={[[0, 31, 4.5], [0, 37, 4.5], [0, 43, 4.5]]} soort="spook" kleuren={['#1f342b', '#1a2c25', '#243c31', '#16261f', '#2a4234']} schaal={[1.0, 2.0]} seed={21} />
      <Bos plan={PADPLAN} binnen={LANGS_PAD} van={0.8} tot={9} n={70} soort="spook" kleuren={['#18291f', '#142219', '#1d3326', '#10201a']} vrij={vrijPad} schaal={[1.1, 1.8]} struiken={0.6} seed={33} langsKamers />
      <Gras
        vlakken={[
          [-4.4, 34.5, 2.2, 14],
          [4.4, 34.5, 2.2, 14],
        ]}
        vrij={[[SCHRIKBOOM[0], SCHRIKBOOM[1], 1.2]]}
        kleur="#2e4a31"
        dichtheid={9}
        seed={8}
      />
      <Kampvuur pos={[8.6, 37.5]} />
      <Ketel pos={[10.4, 0, 36.6]} s={0.8} />
      <Vuurvliegjes gebied={[0, 34, 12, 14]} n={22} kleur="#b9ff8a" />
      <Vuurvliegjes gebied={[0, 24, 50, 6]} n={18} kleur="#9dff8a" />
      <BosSchrik />

      {/* ── Rotseiland, brug, rotstrap, steiger, torens en schoorstenen: samen één vaste groep (weinig tekenstappen) ── */}
      <Statisch>
        <Eilandrots vorm={EILAND} gat={GAT} top={0} bodem={-6.5} />
        <Brug x={0} z0={17} z1={27} b={4} waterY={MEER_Y} />
        <Rotstrap x={11} z0={-22.7} z1={-28} y0={0} y1={STEIGER_Y} breed={3.4} />
        <Steiger pos={[11, -30]} maat={[8, 4]} y={STEIGER_Y} />
        {/* torens: A en B aan de voorkant, C achter in de steigers, en twee torentjes naast de poort */}
        <Hoektoren pos={TORENS.A.pos} r={TORENS.A.r} hoog={9.5} kegel={6.8} ramen={[2.4, 3.6]} />
        <Hoektoren pos={TORENS.B.pos} r={TORENS.B.r} hoog={9.5} kegel={6.8} ramen={[3.9]} />
        <Hoektoren pos={TORENS.C.pos} r={TORENS.C.r} hoog={8.2} kegel={0} open />
        <Steigers pos={TORENS.C.pos} r={TORENS.C.r} hoog={8.2} />
        <Hoektoren pos={[-3.75, 16.6]} r={1.15} voet={-1} hoog={8.4} kegel={3.6} />
        <Hoektoren pos={[3.75, 16.6]} r={1.15} voet={-1} hoog={8.4} kegel={3.6} />
        {SCHOORSTENEN.map(([x, y, z, h], i) => (
          <Schoorsteen key={i} pos={[x, y, z]} hoog={h} b={i % 2 ? 0.8 : 1.0} />
        ))}
      </Statisch>

      {/* ── Lantaarns: aan de oever, op de brug, op de binnenplaats, het kerkhof en de steiger ── */}
      <Lantaarns
        punten={[
          [-3.0, 27.9],
          [3.0, 27.9],
          [-2.35, 25.6],
          [2.35, 25.6],
          [4.6, 7.3],
          [-4.9, -3.6],
          [20.8, -9.6],
          [17.4, 9.4],
          [-6.8, -15.0],
        ]}
        kleur="#ffa64a"
      />
      {/* lantaarn op de steiger, op de hoogte van het water */}
      <group position={[0, STEIGER_Y, 0]}>
        <Lantaarns punten={[[14.5, -31.5]]} kleur="#ffa64a" />
      </group>

      {/* ── Lucht: maan, vleermuizen en bergen in de verte ── */}
      <Maan pos={[-40, 44, -104]} r={9} />
      <Vleermuizen
        rondjes={[
          [-12.5, -10.5, 5, 18],
          [17.9, -15.9, 5, 12],
          [0, 1, 8, 9],
          [0, 30, 6, 6],
          [-17.9, 15.9, 4, 16],
        ]}
        per={4}
      />
      <Bergen midden={[0, 0]} y={-14} />
    </>
  );
}
