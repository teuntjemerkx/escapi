// Alle plekken in Wereld 4 (Het Winkelcentrum) waar een opdracht zit. Elk werkboekplaatje is hier een voorwerp.
// Welke opdrachten bij welk station en welke kamer horen, staat in plan.json (gecontroleerd met check.mjs).
import type { FC } from 'react';
import data from '../data/onderdeel4.json';
import type { Opdracht, Stap } from '../data/schema';
import type { Station } from '../werelden/types';
import * as E from './modellen-eind';
import * as K from './modellen-keuze';
import * as N from './modellen-klus';
import * as M from './modellen-start';
import plan from './plan.json';
import { STRATEGIE } from './strategie';
import { PLEKKEN } from './huis';
import { metAtlas } from './atlas';

export type { Station } from '../werelden/types';

const BRON = data.opdrachten as unknown as Opdracht[];

/** Werkboekopdrachten (met strategie-tip) + terugblik en instructie. */
export const OPDRACHTEN: Record<string, Opdracht> = Object.fromEntries(BRON.map((o) => [o.id, { ...o, strategie: STRATEGIE[o.id] ?? o.strategie }]));

type Vorm = Omit<Station, 'id' | 'opdrachten' | 'pos'>;
// Elk model krijgt een eigen tekstatlas: al zijn bordjes worden samen één tekenstap.
const V = (titel: string, Model: FC, grootte: number, x: Partial<Station> = {}): Vorm => ({
  titel,
  Model: metAtlas(Model),
  grootte,
  weergave: 'draai',
  kanBoven: false,
  kanDraai: true,
  ...x,
});

/** Hoe elk station eruitziet: model, maat voor de camera en botsvak. */
const VORM: Record<string, Vorm> = {
  // ── Terugblik en uitleg ──
  terugblik: V('Reep chocola', M.Reep, 1.0, { midden: 0.15, rol: 'terugblik', botser: [1.3, 0.8] }),
  uitleg: V('Kortingsscanner', M.Kortingsscanner, 2.9, { midden: 1.1, markerY: 2.9, rol: 'instructie', botser: [2.8, 1.6] }),
  // ── Samen oefenen ──
  kassa: V('Kassa', M.Kassa, 1.7, { midden: 0.9, botser: [1.6, 0.8] }),
  tshirt: V('T-shirts', M.Tshirts, 2.6, { midden: 1.0, botser: [2.4, 0.7] }),
  klas: V('Klas', M.Klas, 3.0, { midden: 0.6, markerY: 2.6, botser: [2.9, 2.6] }),
  weegschaal: V('Weegschaal', M.Weegschaal, 1.1, { midden: 0.25, botser: [1.4, 0.9] }),
  spaarpot: V('Spaarpot', M.Spaarpot, 1.8, { midden: 0.9, botser: [1.1, 1.0] }),
  broek: V('Broek', M.Broek, 1.9, { midden: 0.95, botser: [1.5, 0.7] }),
  jas: V('Jas', M.Jas, 1.9, { midden: 0.95, botser: [1.5, 0.7] }),
  quiz: V('Quizkast', M.Quizkast, 2.3, { midden: 1.15, markerY: 3.0, botser: [1.0, 0.8] }),
  sneakers: V('Sneakers', M.Sneakers, 1.3, { midden: 0.7, botser: [0.8, 0.7] }),
  bioscoop: V('Bioscoop', M.Bioscoop, 1.5, { midden: 0.35, botser: [1.6, 1.4] }),
  // ── Zelf doen: klus Nieuws en media ──
  festival: V('Festival X', N.Festival, 2.4, { midden: 1.1, markerY: 3.0, botser: [2.2, 1.4] }),
  krant: V('Nieuwszuil', N.Krant, 2.5, { midden: 1.15, markerY: 3.2, botser: [2.0, 1.2] }),
  omroepen: V('Tv-scherm', N.Omroepen, 2.8, { midden: 1.3, markerY: 3.3, botser: [2.8, 0.8] }),
  // ── Zelf doen: klus Kapper en drogist ──
  kapsalon: V('Kapsalon', N.Kapsalon, 2.6, { midden: 1.0, botser: [2.5, 0.9] }),
  chocodrank: V('Chocoladedrank', N.Chocodrank, 1.1, { midden: 0.25, botser: [1.5, 0.9] }),
  styling: V('Stylingproducten', N.Styling, 1.9, { midden: 1.0, botser: [1.6, 0.8] }),
  // ── Zelf doen: klus Bouwmarkt en elektro ──
  dozen: V('Magazijn', N.Dozen, 2.4, { midden: 0.9, botser: [2.3, 1.4] }),
  'rode-deuren': V('Maquette straat', N.RodeDeuren, 2.0, { midden: 0.25, botser: [2.0, 1.3] }),
  telefoon: V('Telefoon', N.Telefoon, 2.1, { midden: 1.05, botser: [1.2, 0.8] }),
  laptop: V('Laptop', N.Laptop, 1.2, { midden: 0.25, botser: [1.5, 0.9] }),
  // ── Keuze: extra opdrachten ──
  snoepwinkel: V("Oma's Snoepwinkeltje", K.Snoepwinkel, 2.8, { midden: 1.2, markerY: 3.3, botser: [2.6, 1.6] }),
  voetbaltafel: V('Voetbaltafel', K.Voetbaltafel, 2.4, { midden: 0.9, botser: [2.3, 1.2] }),
  creme: V('Crèmepot', K.Creme, 2.0, { midden: 1.0, markerY: 3.0, botser: [1.2, 1.0] }),
  energie: V('Energiewinkel', K.Energie, 2.6, { midden: 1.0, botser: [2.5, 1.2] }),
  reisbureau: V('Reisbureau', K.Reisbureau, 2.4, { midden: 1.0, botser: [2.3, 1.2] }),
  griep: V('Nieuwssite', K.Griep, 2.4, { midden: 1.1, markerY: 3.0, botser: [2.2, 1.2] }),
  offerte: V('Offerte', K.Offerte, 1.9, { midden: 0.9, botser: [1.6, 1.0] }),
  reuzenrad: V('Kermis in Devidam', K.KermisLoket, 4.8, { midden: 1.9, markerY: 5.2, botser: [2.4, 1.4] }),
  vormen: V('Vormenpuzzel', K.Vormen, 2.2, { midden: 1.1, markerY: 3.0, botser: [2.0, 0.8] }),
  lucifers: V('Lucifersom', K.Lucifers, 1.8, { midden: 0.8, botser: [1.7, 1.0] }),
  actiekraam: V('Actiekraam', K.Actiekraam, 2.8, { midden: 1.2, markerY: 3.6, botser: [2.7, 1.8] }),
  'drie-winkels': V('Drie winkels', K.DrieWinkels, 3.0, { midden: 1.0, markerY: 3.0, botser: [3.0, 1.0] }),
  // ── Eindcheck ──
  sandalen: V('Sandalen', E.Sandalen, 1.5, { midden: 0.7, botser: [1.0, 0.8] }),
  badslippers: V('Badslippers', E.Badslippers, 1.7, { midden: 0.8, botser: [1.4, 0.7] }),
  kerstboom: V('Kerstboom', E.Kerstboom, 2.2, { midden: 1.0, markerY: 3.0, botser: [1.3, 1.3] }),
  waterverbruik: V('Waterverbruik', E.Waterverbruik, 2.0, { midden: 0.9, botser: [1.6, 1.4] }),
  reizigers: V('Treinreizigers', E.Reizigers, 2.2, { midden: 1.0, botser: [2.0, 1.0] }),
  toets: V('Toetsuitslag', E.Toets, 2.0, { midden: 1.0, botser: [1.8, 1.0] }),
  netwerk: V('Sociaal netwerk', E.Netwerk, 2.0, { midden: 1.0, botser: [1.4, 0.8] }),
  pretpark: V('Kassabon', E.Pretpark, 1.9, { midden: 0.9, botser: [1.6, 0.9] }),
  loon: V('Loonstrook', E.Loon, 1.1, { midden: 0.25, botser: [1.5, 0.9] }),
  boek: V('Boek', E.Boek, 2.0, { midden: 0.9, botser: [1.8, 1.0] }),
};

type PlanStation = { kamer: string; opdrachten: string[] };
/** Plek, draaiing, verdieping, schaal en tafel komen uit huis.ts (Wereld 4 is een gebouw met winkels als zones). */
export const STATIONS: Station[] = Object.entries(plan.stations as Record<string, PlanStation>).map(([id, p]) => {
  const v = VORM[id];
  const plek = PLEKKEN[id];
  const sch = plek.schaal ?? 1;
  const rot = plek.rot ?? 0;
  // huis.ts geeft het botsvak in wereldrichting; de motor draait het zelf mee bij een kwartslag
  const wereld = plek.botser ?? (plek.tafel ? [plek.tafel[0] + 0.1, plek.tafel[1] + 0.1] : v.botser);
  const botser: [number, number] | undefined = wereld && Math.abs(Math.sin(rot)) > 0.5 ? [wereld[1], wereld[0]] : wereld;
  return {
    id,
    opdrachten: p.opdrachten,
    ...v,
    pos: plek.pos,
    rot,
    schaal: plek.schaal,
    tafel: plek.tafel,
    tafelSoort: plek.tafelSoort,
    grootte: v.grootte * sch,
    botser,
    verdieping: plek.verdieping ?? 0,
  };
});

export const STATION: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/** Speciale opdrachten die niet uit het werkboek komen (terugblik en instructie). */
const A = (waarde: number, eenheid: string, expr: string) => ({ waarde, eenheid, expr });
const S2 = (tekst: string, som: string, expr: string, uitkomst: number, eenheid: string, x: Partial<Stap> = {}): Stap => ({ tekst, som, expr, uitkomst, eenheid, invoer: true, ...x });
OPDRACHTEN['W4-TERUG'] = {
  id: 'W4-TERUG',
  onderdeel: 4,
  sectie: 'instap',
  nummer: 'terugblik',
  origineel: '(geen werkboeksom: terugblik)',
  afbeeldingen: [],
  vraag: ['Een reep chocola heeft 4 rijen van 5 stukjes.', 'Je geeft een kwart van de reep weg.', 'Hoeveel stukjes geef je weg?'],
  type: 'getal',
  paneel: 'deelsommen',
  stappen: [S2('Tel alle stukjes', '4 × 5', '4*5', 20, 'stukjes', { deel: 'reep' }), S2('Een kwart is delen door 4', '20 : 4', '20/4', 5, 'stukjes', { deel: 'kwart' })],
  antwoord: A(5, 'stukjes', '4*5/4'),
  autoCheck: true,
  flags: [],
};
OPDRACHTEN['W4-INSTR'] = {
  id: 'W4-INSTR',
  onderdeel: 4,
  sectie: 'instap',
  nummer: 'instructie',
  origineel: '(geen werkboeksom: tweelingsom voor de instructie)',
  afbeeldingen: [],
  vraag: ['Een rugzak kost € 70.', 'Er is 30% korting.', 'Hoeveel betaal je?'],
  type: 'getal',
  paneel: 'procentenbalk',
  stappen: [
    S2('Het hele bedrag is 100%', '100% = € 70', '70', 70, 'euro', { deel: 'balk', balk: { procent: 100, deel: 70, geheel: 70 } }),
    S2('Reken 10% uit', '70 : 10', '70/10', 7, 'euro', { deel: 'tiende', balk: { procent: 10, deel: 7, geheel: 70 } }),
    S2('30% is 3 × 10%', '3 × 7', '3*7', 21, 'euro', { deel: 'korting', balk: { procent: 30, deel: 21, geheel: 70 } }),
    S2('Haal de korting eraf', '70 − 21', '70-21', 49, 'euro', { deel: 'betalen', balk: { procent: 70, deel: 49, geheel: 70 } }),
  ],
  antwoord: A(49, 'euro', '70*0.7'),
  autoCheck: true,
  flags: [],
};

/** Alle werkboekopdrachten van deze wereld (zonder terugblik/instructie), in werkboekvolgorde. */
export const WERKBOEK = BRON.map((o) => o.id);
