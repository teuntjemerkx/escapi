// Wereld 5 – De Controlekamer: alle plekken met een opdracht. Elk werkboekplaatje is een scherm, bord of voorwerp.
// Welke opdrachten bij welk station horen en waar het staat, komt uit gebouw.json (gecontroleerd met check.mjs).
import { useLayoutEffect, useRef, type FC } from 'react';
import * as THREE from 'three';
import data from '../data/onderdeel5.json';
import type { Opdracht, Stap } from '../data/schema';
import type { Station } from '../werelden/types';
import gebouw from './gebouw.json';
import * as E from './modellen-eind';
import * as X from './modellen-expert';
import * as I from './modellen-instap';
import * as N from './modellen-niveau';
import { useInspectie } from '../game/inspectie';
import { useSpel } from '../game/store';
import { Wandpaneel } from './scherm';
import { STRATEGIE } from './strategie';

export type { Station } from '../werelden/types';

export const OPDRACHTEN: Record<string, Opdracht> = Object.fromEntries((data.opdrachten as unknown as Opdracht[]).map((o) => [o.id, { ...o }]));

/** Instellingen per model (in modelmaat; schaal en plek komen uit gebouw.json). */
interface ModelInfo {
  titel: string;
  Model: FC;
  /** Grootste maat voor de camera in de inspectie (modelmaat). */
  grootte: number;
  midden: number;
  markerY: number;
  weergave?: Station['weergave'];
  kanBoven?: boolean;
  /** Verschuiving zodat de voetafdruk rond de oorsprong ligt (wandmodellen staan vanaf z = 0 naar voren). */
  dx?: number;
  dz?: number;
  /** In de inspectie: welk x-punt (modelmaat) in het midden komt (standaard het midden van de voetafdruk). */
  fx?: number;
  /** Achterwand (schermwand) achter een wandmodel: breedte en midden-x in modelmaat. */
  wand?: [number, number];
  rol?: Station['rol'];
}

const MODELLEN: Record<string, ModelInfo> = {
  terugblik: { titel: 'Koffiekar', Model: I.Koffiekar, grootte: 1.5, midden: 1.4, markerY: 2.9, rol: 'terugblik' },
  instructie: { titel: 'Uitleg: de aflees-loep', Model: I.Fietsgrafiek, grootte: 1.35, midden: 1.7, markerY: 3.1, rol: 'instructie' },
  // Samen oefenen
  'aquarium-kassa': { titel: 'Kassa Onderwaterwereld', Model: I.AquariumKassa, grootte: 2.0, midden: 1.75, markerY: 3.4, dz: 0.45, wand: [4.3, 0] },
  lesrooster: { titel: 'Lesrooster', Model: I.Lesrooster, grootte: 2.1, midden: 1.6, markerY: 3.4, dz: 0.2, wand: [4.4, 0] },
  vliegschema: { titel: 'Vertrekbord', Model: I.Vliegschema, grootte: 2.2, midden: 1.75, markerY: 3.5, dz: 0.5, wand: [4.6, 0] },
  taartscherm: { titel: 'Cirkeldiagram', Model: I.Taartscherm, grootte: 2.4, midden: 1.45, markerY: 2.9, kanBoven: true, dx: 0.2 },
  ijsdikte: { titel: 'IJsdikte', Model: I.IJsdikte, grootte: 2.0, midden: 1.7, markerY: 3.4, dz: 0.25, wand: [4.1, 0] },
  smartphone: { titel: 'Prijs smartphone', Model: I.Smartphone, fx: 0, grootte: 2.75, midden: 1.75, markerY: 3.4, dx: 0.37, dz: 0.5, wand: [4.9, 0] },
  drankautomaat: { titel: 'Drankautomaat', Model: I.Drankautomaat, fx: 0.4, grootte: 2.5, midden: 1.5, markerY: 3.3, dx: -0.28, dz: 0.45, wand: [3.4, 0.55] },
  strandfeest: { titel: 'Strandfeest', Model: I.Strandfeest, grootte: 1.9, midden: 1.7, markerY: 3.4, dz: 0.4, wand: [3.7, 0] },
  studieschuld: { titel: 'Formulemachine', Model: I.Studieschuld, grootte: 1.7, midden: 1.6, markerY: 3.0 },
  schepsnoep: { titel: 'Schepsnoep', Model: I.Schepsnoep, grootte: 1.6, midden: 1.5, markerY: 3.2 },
  // Zelf doen
  stukadoor: { titel: 'Stukadoor', Model: N.Stukadoor, grootte: 1.8, midden: 1.55, markerY: 3.3, dz: 0.7, wand: [3.5, 0] },
  wisselkantoor: { titel: 'Wisselkantoor', Model: N.Wisselkantoor, grootte: 1.7, midden: 1.85, markerY: 3.5, dz: 0.57, wand: [3.3, 0] },
  huishoudens: { titel: 'Huishoudens Groningen', Model: N.Huishoudens, grootte: 2.6, midden: 1.65, markerY: 3.5, dz: 0.08, wand: [5.2, 0] },
  frisdrank: { titel: 'Frisdrank A of B', Model: N.Frisdrank, grootte: 2.7, midden: 1.5, markerY: 3.3, dx: 0.27, dz: 0.4, wand: [5.5, 0.27] },
  energie: { titel: 'Energierekening', Model: N.Energie, grootte: 1.8, midden: 1.3, markerY: 3.0, kanBoven: true },
  autoverhuur: { titel: 'Autoverhuur', Model: N.Autoverhuur, grootte: 1.9, midden: 1.8, markerY: 3.5, dz: 0.62, wand: [3.7, 0] },
  tankstation: { titel: 'Tankstation', Model: N.Tankstation, fx: 0.25, grootte: 2.0, midden: 1.75, markerY: 3.4, dx: 0.42, dz: 0.4, wand: [3.9, 0] },
  triatlon: { titel: 'Scorebord triatlon', Model: N.Triatlon, grootte: 2.35, midden: 1.72, markerY: 3.5, dz: 0.45, wand: [4.8, 0] },
  lease: { titel: 'Showroom Forko', Model: N.Lease, grootte: 2.5, midden: 1.8, markerY: 3.4, dx: -0.12, dz: 1.1, wand: [5.6, -0.12] },
  tabletzuil: { titel: 'Tabletkeuze', Model: N.Tabletzuil, grootte: 1.5, midden: 1.5, markerY: 3.3, dz: 0.05 },
  // Expert, praktijk en puzzels
  kvick: { titel: 'Serverruimte Kvick', Model: X.Kvick, grootte: 2.7, midden: 1.35, markerY: 3.3, dx: 0.41, dz: 0.65, wand: [3.6, -0.55] },
  'tv-wand': { titel: "Wand met tv's", Model: X.TvWand, grootte: 2.6, midden: 1.6, markerY: 3.3, dz: 0.25, wand: [5.4, 0] },
  vakantiegids: { titel: 'Vakantiegids', Model: X.Vakantiegids, grootte: 2.3, midden: 1.6, markerY: 3.0, kanBoven: true },
  spaargeld: { titel: 'Spaargeld', Model: X.Spaargeld, grootte: 2.35, midden: 1.65, markerY: 3.4, dz: 0.33, wand: [4.7, 0] },
  zomertemperatuur: { titel: 'Weerscherm', Model: X.Zomertemperatuur, grootte: 2.15, midden: 1.7, markerY: 3.3, dx: 0.17, dz: 0.1, wand: [4.3, 0] },
  examens: { titel: 'Monti College', Model: X.Examens, grootte: 2.6, midden: 1.7, markerY: 3.6, dx: -0.07, dz: 0.08, wand: [5.3, -0.07] },
  coopertest: { titel: 'Coopertest', Model: X.Coopertest, fx: 0.2, grootte: 2.4, midden: 1.7, markerY: 3.5, dx: 0.3, dz: 0.78, wand: [4.8, 0] },
  molenronde: { titel: 'De Molenronde', Model: X.Molenronde, fx: 0.45, grootte: 2.5, midden: 1.1, markerY: 2.9, kanBoven: true, dx: 0.25 },
  magazijn: { titel: 'Magazijnstelling', Model: X.Magazijn, fx: 0.3, grootte: 2.8, midden: 1.45, markerY: 3.1, dx: 0.27, dz: 0.25, wand: [2.5, 1.65] },
  sportwinkel: { titel: 'Sportwinkel: voorraad', Model: X.Sportwinkel, grootte: 1.8, midden: 1.6, markerY: 3.4, dx: 0.05, dz: 0.3, wand: [3.9, 0.05] },
  reisroutes: { titel: 'Reisroutes', Model: X.Reisroutes, grootte: 1.9, midden: 1.3, markerY: 3.0, kanBoven: true, dz: 0.1 },
  werkrooster: { titel: 'Werkrooster supermarkt', Model: X.Werkrooster, grootte: 1.8, midden: 1.6, markerY: 3.2, dx: -0.07, dz: 0.5, wand: [3.5, -0.07] },
  kleurkubussen: { titel: 'Kleurkubussen', Model: X.Kleurkubussen, grootte: 1.8, midden: 1.2, markerY: 2.8, kanBoven: true },
  stroomkast: { titel: 'Stroomkast: maak zes', Model: X.Stroomkast, grootte: 1.45, midden: 1.55, markerY: 3.3, dz: 0.5, wand: [2.4, 0] },
  // Eindcheck
  treinstoringen: { titel: 'Treinstoringen', Model: E.Treinstoringen, grootte: 1.65, midden: 1.75, markerY: 3.4, dz: 0.48, wand: [3.3, 0] },
  bmi: { titel: 'BMI', Model: E.Bmi, grootte: 1.7, midden: 1.3, markerY: 3.0, dx: 0.2, dz: 0.18 },
  voetbalschema: { titel: 'Voetbalschema', Model: E.Voetbalschema, grootte: 2.0, midden: 1.7, markerY: 3.4, dz: 0.42, wand: [4.1, 0] },
  pluggen: { titel: 'De Pluggenboer', Model: E.Pluggen, grootte: 2.0, midden: 1.6, markerY: 3.4, dx: 0.26, dz: 0.62, wand: [3.7, 0] },
  belasting: { titel: 'Inkomstenbelasting', Model: E.Belasting, grootte: 1.65, midden: 1.75, markerY: 3.4, dz: 0.4, wand: [3.3, 0] },
  huisdieren: { titel: 'Huisdieren', Model: E.Huisdieren, grootte: 1.65, midden: 1.75, markerY: 3.4, dz: 0.15, wand: [3.3, 0] },
  netflix: { titel: 'Netflix', Model: E.Netflix, grootte: 1.85, midden: 1.72, markerY: 3.4, dz: 0.4, wand: [3.7, 0] },
  rondreis: { titel: 'Rondreis India', Model: E.Rondreis, grootte: 2.2, midden: 1.7, markerY: 3.3, dx: -0.07, dz: 0.5, wand: [4.8, -0.07] },
  huurprijzen: { titel: 'Huurprijzen', Model: E.Huurprijzen, grootte: 2.4, midden: 1.45, markerY: 2.9, kanBoven: true, dx: 0.04 },
  tshirts: { titel: 'T-shirts van Marieke', Model: E.Tshirts, grootte: 1.75, midden: 1.55, markerY: 3.4, dz: 0.3 },
};

/** Model verschoven zodat de voetafdruk rond de oorsprong ligt. In de draai-inspectie staat het
 * object altijd 0,55 rad scheef voor de camera; voor schermen draaien we dat terug (recht ervoor). */
const NAAR_CAMERA = 0.55;
const _bol = new THREE.Sphere();
/** Kleine onderdelen werpen geen schaduw: dat scheelt veel tekenstappen (grote delen en de schermwand wel). */
function minderSchaduw(g: THREE.Object3D) {
  g.updateMatrixWorld(true);
  const sch = new THREE.Vector3();
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.castShadow) return;
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
    _bol.copy(m.geometry.boundingSphere!);
    m.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), sch);
    if (_bol.radius * Math.max(sch.x, sch.y, sch.z) < 0.45) m.castShadow = false;
  });
}
function verschoven(M: FC, dx: number, dz: number, fx = dx): FC {
  const F: FC = () => {
    const { delen } = useInspectie();
    const draai = useSpel((s) => s.weergave === 'draai');
    const stage = delen && draai;
    const ref = useRef<THREE.Group>(null);
    // vóór het samenvoegen (de Statisch eromheen voegt pas daarna samen)
    useLayoutEffect(() => {
      if (ref.current) minderSchaduw(ref.current);
    });
    return (
      <group ref={ref} rotation={[0, stage ? NAAR_CAMERA : 0, 0]}>
        <group position={[stage ? -fx : -dx, 0, -dz]}>
          <M />
        </group>
      </group>
    );
  };
  F.displayName = `${M.displayName ?? M.name}Plek`;
  return F;
}

type Plek = { pos: number[]; rot?: number; verdieping?: number; schaal?: number; botser?: number[]; tafel?: number[]; tafelSoort?: 'hout' | 'vilt' | 'sokkel'; opdrachten: string[] };
const PLEKKEN = gebouw.stations as Record<string, Plek>;

export const STATIONS: Station[] = Object.entries(PLEKKEN).map(([id, p]) => {
  const m = MODELLEN[id];
  if (!m) throw new Error(`Geen model voor station ${id}`);
  const sch = p.schaal ?? 1;
  const dx = m.dx ?? 0;
  const dz = m.dz ?? 0;
  const st: Station = {
    id,
    titel: m.titel,
    opdrachten: p.opdrachten,
    pos: [p.pos[0], p.pos[1]],
    rot: p.rot ?? 0,
    verdieping: p.verdieping ?? 0,
    Model: verschoven(m.Model, dx, dz, m.fx),
    weergave: m.weergave ?? 'draai',
    kanBoven: !!m.kanBoven,
    kanDraai: true,
    grootte: m.grootte * sch,
    // De camera kijkt 35° omlaag: een scherm dat dz achter het midden staat, lijkt hoger. Daarom mikken we hoger.
    midden: m.midden + Math.tan(0.62) * dz,
    markerY: m.markerY,
    schaal: p.schaal,
    botser: p.botser ? [p.botser[0], p.botser[1]] : undefined,
    tafel: p.tafel ? [p.tafel[0], p.tafel[1]] : undefined,
    tafelSoort: p.tafelSoort,
    rol: m.rol,
  };
  if (m.wand) {
    const [b, x] = m.wand;
    const W: FC = () => (
      <group position={[-dx, 0, -dz]}>
        <Wandpaneel b={b} x={x} />
      </group>
    );
    st.Decor = W;
  }
  return st;
});

export const STATION: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

// ── Terugblik en instructie (geen werkboeksommen) ──
const A = (waarde: number, eenheid: string, expr: string) => ({ waarde, eenheid, expr });
const S2 = (tekst: string, som: string, expr: string, uitkomst: number, eenheid: string, x: Partial<Stap> = {}): Stap => ({ tekst, som, expr, uitkomst, eenheid, invoer: true, ...x });

OPDRACHTEN['W5-TERUG'] = {
  id: 'W5-TERUG',
  onderdeel: 5,
  sectie: 'instap',
  nummer: 'terugblik',
  origineel: '(geen werkboeksom: terugblik)',
  afbeeldingen: [],
  vraag: ['De dienstleider wil koffie.', 'Je haalt 2 koffie en 1 koek.', 'Kijk op het prijsbord. Hoeveel betaal je samen?'],
  type: 'getal',
  paneel: 'deelsommen',
  stappen: [S2('Reken 2 koffie uit', '2 × € 1,50', '2*1.5', 3, 'euro', { deel: 'koffie' }), S2('Tel de koek erbij', '€ 3 + € 0,75', '3+0.75', 3.75, 'euro', { deel: 'koek' })],
  antwoord: A(3.75, 'euro', '2*1.5+0.75'),
  autoCheck: true,
  flags: [],
};

OPDRACHTEN['W5-INSTR'] = {
  id: 'W5-INSTR',
  onderdeel: 5,
  sectie: 'instap',
  nummer: 'instructie',
  origineel: '(geen werkboeksom: tweelingsom voor de instructie)',
  afbeeldingen: [],
  vraag: ['Een huurfiets kost € 5 vast plus € 4 per dag.', 'De grafiek laat de prijs zien.', 'Hoeveel betaal je voor 3 dagen?'],
  type: 'getal',
  paneel: 'grafiek',
  stappen: [
    S2('Hoeveel euro is één hokje op de prijs-as?', '€ 5 : 5 hokjes', '5/5', 1, 'euro', { deel: 'as-prijs' }),
    S2('Zoek 3 dagen op de onderste as', '3 dagen', '3', 3, 'dagen', { deel: 'as-dagen' }),
    S2('Ga recht omhoog tot de lijn en lees links af', 'lijn bij 3 dagen', '17', 17, 'euro', { deel: 'loep' }),
    S2('Reken na met de formule', '€ 5 + 3 × € 4', '5+3*4', 17, 'euro', { tabel: { boven: ['0 dagen', '1 dag', '2 dagen', '3 dagen'], onder: ['€ 5', '€ 9', '€ 13', '€ 17'] } }),
  ],
  antwoord: A(17, 'euro', '5+3*4'),
  autoCheck: true,
  flags: [],
};

for (const [id, s] of Object.entries(STRATEGIE)) if (OPDRACHTEN[id]) OPDRACHTEN[id].strategie = s;

/** Alle werkboekopdrachten van deze wereld (zonder terugblik/instructie). */
export const WERKBOEK = (data.opdrachten as unknown as Opdracht[]).map((o) => o.id);

// Vangnet: elke werkboekopdracht in precies één station (zie ook check.mjs).
if (import.meta.env?.DEV) {
  for (const id of WERKBOEK) {
    const n = STATIONS.filter((s) => s.opdrachten.includes(id)).length;
    if (n !== 1) console.warn(`Wereld 5: ${id} zit in ${n} stations`);
  }
}
