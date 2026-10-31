// Wereld 5: drie klussen (= drie systemen die weer aan moeten), elk met een kluis, en de verstopte lampjes.
import type { Klus } from '../werelden/types';
import gebouw from './gebouw.json';

type Plek = { pos: [number, number]; rot?: number; verdieping?: number };
const K = gebouw.kluizen as unknown as Record<string, Plek>;

export const KLUSSEN: Klus[] = [
  { id: 'vervoer', naam: 'Systeem Vervoer', kleur: '#5aa9ff', stations: ['autoverhuur', 'tankstation', 'lease'], kluis: K.vervoer },
  { id: 'wonen', naam: 'Systeem Wonen', kleur: '#2ec4b6', stations: ['stukadoor', 'huishoudens', 'energie'], kluis: K.wonen },
  { id: 'vrijetijd', naam: 'Systeem Vrije tijd', kleur: '#ffc94d', stations: ['wisselkantoor', 'frisdrank', 'triatlon', 'tabletzuil'], kluis: K.vrijetijd },
];

export const LAMPJES = gebouw.lampjes as unknown as ([number, number] | [number, number, number])[];
