// Alle plekken in Wereld 2 waar een opdracht zit. Elk werkboekplaatje is hier een 3D-object.
import type { FC } from 'react';
import data from '../data/onderdeel2.json';
import { PLEKKEN } from './huis';
import { STRATEGIE } from './strategie';
import type { Opdracht } from '../data/schema';
import type { Station } from '../werelden/types';
import * as E from './modellen-eind';
import * as X from './modellen-expert';
import * as I from './modellen-instap';
import * as N from './modellen-niveau';
import { Spoor } from './Decor';

export type { Station } from '../werelden/types';

export const OPDRACHTEN: Record<string, Opdracht> = Object.fromEntries((data.opdrachten as unknown as Opdracht[]).map((o) => [o.id, { ...o, strategie: STRATEGIE[o.id] ?? o.strategie }]));

const S = (x: Partial<Station> & Pick<Station, 'id' | 'titel' | 'opdrachten' | 'pos' | 'Model' | 'grootte'>): Station => ({
  weergave: 'draai',
  kanBoven: false,
  kanDraai: true,
  ...x,
});

const kruis = (data.opdrachten as unknown as Opdracht[]).filter((o) => o.sectie === 'puzzel');

export const STATIONS: Station[] = [
  // ── Terugblik en instructie ──
  S({ id: 'terugblik', titel: 'Goudkist', opdrachten: ['W2-TERUG'], pos: [-3.5, 24.5], Model: I.Blokjesdoos, grootte: 1.6, midden: 0.4, rol: 'terugblik', botser: [1.6, 1.2] }),
  S({ id: 'instructie', titel: 'Uitleg', opdrachten: ['W2-INSTR'], pos: [11, 29], Model: I.Instructiebad, grootte: 2.6, midden: 0.35, markerY: 3.6, rol: 'instructie', Decor: I.Paviljoen, decorPos: [0, 0, 0], botser: [5.6, 4.6] }),
  // ── Begeleide inoefening: instapvragen ──
  S({ id: 'kaarttafel', titel: 'Schatkaart', opdrachten: ['O2-INS-01'], pos: [-11, 31], Model: I.Kaarttafel, grootte: 2.4, midden: 0.8, kanBoven: true, botser: [2.3, 2] }),
  S({ id: 'moestuin', titel: 'Kruidentuin', opdrachten: ['O2-INS-02'], pos: [-15, 17.5], Model: I.Moestuin, grootte: 7.5, weergave: 'boven', kanBoven: true, botser: [6.6, 4.6] }),
  S({ id: 'verhuisdoos', titel: 'Heksenkist', opdrachten: ['O2-INS-03'], pos: [-23, 21.5], Model: I.Verhuisdoos, grootte: 0.9, midden: 0.6, botser: [1, 0.8] }),
  S({ id: 'wegwijzer', titel: 'Wegwijzer', opdrachten: ['O2-INS-04'], pos: [-7, 20.5], Model: I.Wegwijzer, grootte: 3, midden: 1.6, markerY: 3.4, botser: [0.6, 0.6] }),
  S({ id: 'laminaat', titel: 'Torenvloer', opdrachten: ['O2-INS-05'], pos: [-27, 13], Model: I.Laminaat, grootte: 6.5, weergave: 'boven', kanBoven: true, botser: [5.4, 3.4] }),
  S({ id: 'fiets', titel: 'De bode', opdrachten: ['O2-INS-06'], pos: [-5, 13], Model: I.Fiets, grootte: 2.8, midden: 0.8, botser: [2.8, 0.8] }),
  S({ id: 'blikje', titel: 'Toverdrank', opdrachten: ['O2-INS-07'], pos: [5, 13], Model: I.Blikje, grootte: 2.2, midden: 1.0, botser: [1.3, 1.3] }),
  S({ id: 'tuinzwembad', titel: 'Badhuis', opdrachten: ['O2-INS-08'], pos: [17, 17.5], Model: I.Tuinzwembad, grootte: 9, midden: 0.8, kanBoven: true, botser: [8.5, 4.5] }),
  S({ id: 'plattegrond', titel: 'Plattegrond', opdrachten: ['O2-INS-09'], pos: [7, 20.5], Model: I.Plattegrond, grootte: 2.6, midden: 1.5, markerY: 3.2, botser: [2.4, 0.6] }),
  S({ id: 'abri', titel: 'Schilderij', opdrachten: ['O2-INS-10'], pos: [24, 11.6], rot: Math.PI, Model: I.GraafSchilderij, grootte: 3.2, midden: 1.3, markerY: 3.6, botser: [3.1, 1.6] }),
  S({ id: 'bloemperken', titel: 'Bloemperken', opdrachten: ['O2-INS-11'], pos: [-26, 34], Model: I.Bloemperken, grootte: 15, weergave: 'boven', kanBoven: true, kanDraai: true }),
  S({ id: 'speeltuin', titel: 'Ridderspelen', opdrachten: ['O2-INS-12'], pos: [25, 33], Model: I.Speeltuin, grootte: 14.5, midden: 1, markerY: 3.6, weergave: 'boven', kanBoven: true }),
  // ── Zelfstandige verwerking: vragen op niveau ──
  S({ id: 'dobbelsteen', titel: 'Toverdobbelsteen', opdrachten: ['O2-NIV-01'], pos: [-6, -6], Model: N.Dobbelsteen, grootte: 5.5, midden: 1.0, botser: [1.6, 1.6], vouw: true, vouwTip: 2 }),
  S({ id: 'uitslag-balk', titel: 'Werkbank van de smid', opdrachten: ['O2-NIV-02'], pos: [-24, -4], Model: N.UitslagBalk, grootte: 2.8, midden: 1.0, markerY: 3.6, Decor: N.Schuur, decorPos: [0, 0, 0], botser: [4.2, 3.6], vouw: true, vouwTip: 2 }),
  S({ id: 'terras', titel: 'Terras', opdrachten: ['O2-NIV-03'], pos: [-17, -21], Model: N.Terras, grootte: 10, weergave: 'boven', kanBoven: true, botser: [8, 4] }),
  S({ id: 'huis-lucas', titel: 'Vleugel van de graaf', opdrachten: ['O2-NIV-04', 'O2-NIV-05', 'O2-NIV-06'], pos: [-13, -1], Model: N.HuisLucas, grootte: 9, midden: 1.5, markerY: 5.2, weergave: 'boven', kanBoven: true, bovenUit: 1, botser: [7, 6] }),
  S({ id: 'tuin-frank', titel: 'Tuin van Frank', opdrachten: ['O2-NIV-07', 'O2-NIV-08a', 'O2-NIV-08b'], pos: [-10, -13], Model: N.TuinFrank, grootte: 8, weergave: 'boven', kanBoven: true }),
  S({ id: 'waterkubus', titel: 'Waterkubus', opdrachten: ['O2-NIV-09'], pos: [-4, -19], Model: N.Waterkubus, grootte: 2.2, midden: 1.2, botser: [1.5, 1.5] }),
  S({ id: 'goederenwagon', titel: 'Ertswagen', opdrachten: ['O2-NIV-10'], pos: [-38, -4], Model: N.Goederenwagon, grootte: 9, midden: 1.8, markerY: 5.6, botser: [2.6, 8.8], Decor: () => <Spoor x={0} lengte={12.4} />, decorPos: [0, -0.06, 0] }),
  S({ id: 'zwembad', titel: 'Waterkelder', opdrachten: ['O2-NIV-11a', 'O2-NIV-11b'], pos: [17, -15], Model: N.Zwembad, grootte: 27, midden: 1, kanBoven: true, botser: [25.2, 13.2] }),
  // ── Keuze: expertvragen ──
  S({ id: 'ramenhuis', titel: 'Poortgebouw', opdrachten: ['O2-EXP-01'], pos: [16, -1], Model: X.Ramenhuis, grootte: 4.6, midden: 1.6, markerY: 6, botser: [17, 5] }),
  S({ id: 'verfmuur', titel: 'Muur verven', opdrachten: ['O2-EXP-02'], pos: [37, 1], rot: -Math.PI / 2, Model: X.Verfmuur, grootte: 5.5, midden: 1.6, markerY: 4.6, botser: [0.4, 4.8] }),
  S({ id: 'stoepbord', titel: 'Krijtbord', opdrachten: ['O2-EXP-03'], pos: [33.5, -7], rot: -Math.PI / 2, Model: X.Stoepbord, grootte: 1.3, midden: 0.6, Decor: X.Cafe, decorPos: [0, 0, -3.6], botser: [0.7, 0.7] }),
  S({ id: 'bloembak', titel: 'Bloembak', opdrachten: ['O2-EXP-04'], pos: [9.5, 2.4], Model: X.Bloembak, grootte: 0.8, midden: 0.2, botser: [0.6, 0.4] }),
  S({ id: 'grote-doos', titel: 'Schatkist', opdrachten: ['O2-EXP-05'], pos: [36, -15], rot: -Math.PI / 2, Model: X.GroteDoos, grootte: 1.6, midden: 0.4, Decor: X.Garage, decorPos: [0, 0, -1], botser: [5, 5] }),
  S({ id: 'studentenkamer', titel: 'Torenkamer huren', opdrachten: ['O2-EXP-06'], pos: [37, -22], rot: -Math.PI / 2, Model: X.Studentenkamer, grootte: 6, weergave: 'boven', kanBoven: true, Decor: X.Makelaar, decorPos: [0, 0, 0], botser: [5.4, 5.2] }),
  S({ id: 'tuinhuizen', titel: 'Tuinhuisjes', opdrachten: ['O2-EXP-07'], pos: [27, -33], Model: X.Tuinhuizen, grootte: 22, markerY: 4, weergave: 'boven', kanBoven: true }),
  S({ id: 'bouwkavels', titel: 'Bouwkavels', opdrachten: ['O2-EXP-08'], pos: [-30, -33], Model: X.Bouwkavels, grootte: 15, weergave: 'boven', kanBoven: true }),
  S({ id: 'ananaspak', titel: 'Kikkersap', opdrachten: ['O2-EXP-09'], pos: [36, 14], rot: -Math.PI / 2, Model: X.Ananaspak, grootte: 3.4, midden: 0.6, botser: [3.2, 1.6], vouw: true }),
  // ── Praktijk en puzzels ──
  S({ id: 'tinyhouse', titel: 'Wachtershuisje', opdrachten: ['O2-PRA-01'], pos: [-34, 20], Model: X.Tinyhouse, grootte: 6.5, weergave: 'boven', kanBoven: true }),
  ...kruis.map((o, i) =>
    S({
      id: `kruissom-${i + 1}`,
      titel: `Geheime vloer ${i + 1}`,
      opdrachten: [o.id],
      pos: [[-30, -13.5], [-20.5, -13.5], [-30, -23.5]][i] as [number, number],
      Model: () => <X.KruissomPlein rooster={o.puzzel!.rooster} tegels={o.puzzel!.tegels} />,
      grootte: 8,
      weergave: 'boven',
      kanBoven: true,
      kanDraai: false,
    }),
  ),
  // ── Evaluatie: eindtest rond de poort ──
  S({ id: 'tegelvloer', titel: 'Tegelvloer', opdrachten: ['O2-EIN-01'], pos: [-13, -27], Model: E.Tegelvloer, grootte: 9, weergave: 'boven', kanBoven: true }),
  S({ id: 'bloembollen', titel: 'Bloembollen', opdrachten: ['O2-EIN-02'], pos: [-13, -34], Model: E.Bloembollen, grootte: 4, midden: 0.1, kanBoven: true, botser: [3, 0.5] }),
  S({ id: 'ring', titel: 'Zegelring', opdrachten: ['O2-EIN-03'], pos: [-8, -38.5], Model: E.Ring, grootte: 1.8, midden: 0.9, botser: [1.4, 0.8] }),
  S({ id: 'aquarium', titel: 'Spookvissen', opdrachten: ['O2-EIN-04'], pos: [-4.5, -26], Model: E.Aquarium, grootte: 0.8, midden: 0.8, botser: [0.6, 0.4] }),
  S({ id: 'aardappelkisten', titel: 'Kelderkisten', opdrachten: ['O2-EIN-05'], pos: [8, -38.5], Model: E.Aardappelkisten, grootte: 3, midden: 0.5, botser: [3, 1.1] }),
  S({ id: 'spijkerbroek', titel: 'Broek van de ridder', opdrachten: ['O2-EIN-06'], pos: [12, -34], Model: E.Spijkerbroek, grootte: 1.8, midden: 1.0, botser: [0.6, 0.6] }),
  S({ id: 'melk', titel: 'Heksenmelk', opdrachten: ['O2-EIN-07'], pos: [12, -28.5], Model: E.Melk, grootte: 2.2, midden: 0.8, botser: [2, 0.9] }),
  S({ id: 'stationsbord', titel: 'Treinreis', opdrachten: ['O2-EIN-08'], pos: [-38, 6], rot: Math.PI / 2, Model: E.Stationsbord, grootte: 4, midden: 2.2, markerY: 4.8, botser: [2, 4] }),
  S({ id: 'pakket', titel: 'Pakket', opdrachten: ['O2-EIN-09'], pos: [4.5, -26], Model: E.Pakket, grootte: 0.8, midden: 0.2, botser: [0.5, 0.4] }),
  S({ id: 'container', titel: 'Puincontainer', opdrachten: ['O2-EIN-10'], pos: [-18, -38.5], Model: E.Container, grootte: 4, midden: 0.8, botser: [3.8, 2] }),
];

// Plek, schaal en tafel komen uit huis.ts (Wereld 2 is een gebouw met kamers).
const EIGEN_BOTSER: Record<string, [number, number]> = {
  'uitslag-balk': [2.3, 1.3],
  verfmuur: [2.7, 0.35],
  stationsbord: [2.4, 0.6],
  wegwijzer: [0.5, 0.5],
};
for (const st of STATIONS) {
  const p = PLEKKEN[st.id];
  if (!p) {
    console.warn('Geen plek voor station', st.id);
    continue;
  }
  const sch = p.schaal ?? 1;
  st.pos = p.pos;
  st.rot = p.rot ?? 0;
  st.kavel = undefined;
  st.schaal = p.schaal;
  st.tafel = p.tafel;
  st.tafelSoort = p.tafelSoort;
  st.verdieping = p.verdieping;
  st.grootte = st.grootte * sch;
  st.botser = p.botser ?? EIGEN_BOTSER[st.id] ?? (p.tafel ? [p.tafel[0] + 0.1, p.tafel[1] + 0.1] : st.botser ? [st.botser[0] * sch, st.botser[1] * sch] : undefined);
  // Buitendecor (paviljoen, schuur, café, garage, makelaar) past niet in een kamer.
  if (st.id !== 'goederenwagon') st.Decor = undefined;
}

export const STATION: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/** Speciale opdrachten die niet uit het werkboek komen (terugblik en instructie). */
const A = (waarde: number, eenheid: string, expr: string) => ({ waarde, eenheid, expr });
const S2 = (tekst: string, som: string, expr: string, uitkomst: number, eenheid: string, x = {}) => ({ tekst, som, expr, uitkomst, eenheid, invoer: true, ...x });
OPDRACHTEN['W2-TERUG'] = {
  id: 'W2-TERUG',
  onderdeel: 2,
  sectie: 'instap',
  nummer: 'terugblik',
  origineel: '(geen werkboeksom: terugblik)',
  afbeeldingen: [],
  vraag: ['In deze kist van de graaf passen gouden blokjes.', 'Hoeveel blokjes passen erin?'],
  type: 'getal',
  paneel: 'deelsommen',
  stappen: [S2('Tel de blokjes in 1 laag', '3 × 2', '3*2', 6, 'blokjes', { deel: 'laag1' }), S2('Er zijn 2 lagen', '6 × 2', '6*2', 12, 'blokjes', { deel: 'laag2' })],
  antwoord: A(12, 'blokjes', '3*2*2'),
  autoCheck: true,
  flags: [],
};
OPDRACHTEN['W2-INSTR'] = {
  id: 'W2-INSTR',
  onderdeel: 2,
  sectie: 'instap',
  nummer: 'instructie',
  origineel: '(geen werkboeksom: tweelingsom voor de instructie)',
  afbeeldingen: [],
  vraag: ['Het grote bad in het badhuis is 20 m lang, 10 m breed en 2 m diep.', 'Er ligt een stenen blok van 10 × 10 × 0,5 m in.', 'Hoeveel liter water past erin?'],
  type: 'getal',
  paneel: 'deelsommen',
  stappen: [
    S2('Reken de hele bak uit', '20 × 10 × 2', '20*10*2', 400, 'm³', { deel: 'bak' }),
    S2('Reken het blok uit', '10 × 10 × 0,5', '10*10*0.5', 50, 'm³', { deel: 'verhoging' }),
    S2('Haal het blok eraf', '400 − 50', '400-50', 350, 'm³'),
    S2('Maak er liters van', '350 × 1000', '350*1000', 350000, 'liter', { trap: { van: 'm³', naar: 'dm³' } }),
  ],
  antwoord: A(350000, 'liter', '(20*10*2-10*10*0.5)*1000'),
  autoCheck: true,
  flags: [],
};

/** Alle werkboekopdrachten van deze wereld (zonder terugblik/instructie). */
export const WERKBOEK = (data.opdrachten as unknown as Opdracht[]).map((o) => o.id);
export const VERPLICHT = WERKBOEK.filter((id) => ['instap', 'niveau', 'eindtest'].includes(OPDRACHTEN[id].sectie));
export const BLOK1 = WERKBOEK.filter((id) => OPDRACHTEN[id].sectie === 'eindtest').slice(0, 5);
export const BLOK2 = WERKBOEK.filter((id) => OPDRACHTEN[id].sectie === 'eindtest').slice(5);
