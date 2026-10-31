// Wereld 2: drie klussen met elk een kluis, en de verstopte lampjes.
import type { Klus } from '../werelden/types';
import { KLUIS_PLEK, LAMPJES_HUIS } from './huis';

export const KLUSSEN: Klus[] = [
  // elke klus heeft een eigen deel van het slot: zoek de codes bij elkaar
  { id: 'spoor', naam: 'De westvleugel', kleur: '#5aa9ff', stations: ['goederenwagon', 'uitslag-balk', 'dobbelsteen'], kluis: KLUIS_PLEK.spoor },
  { id: 'water', naam: 'Tuin en waterkelder', kleur: '#2ec4b6', stations: ['tuin-frank', 'waterkubus', 'zwembad'], kluis: KLUIS_PLEK.water },
  { id: 'bouw', naam: 'De bouwmeester', kleur: '#ffc94d', stations: ['huis-lucas', 'terras'], kluis: KLUIS_PLEK.bouw },
];

export const LAMPJES = LAMPJES_HUIS;
