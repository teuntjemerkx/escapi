// Wereld 3: drie klussen (elk een eigen plek in de Markthal met een eigen kluis) en de verstopte lampjes.
// K1 tussen de kaasrekken in het pakhuis, K2 op de galerij bij de open keuken, K3 buiten aan het water.
import type { Klus } from '../werelden/types';
import { KLUIS_PLEK, LAMPJES_HUIS } from './huis';

export const KLUSSEN: Klus[] = [
  { id: 'kramen', naam: 'Kaas en fruit', kleur: '#5aa9ff', stations: ['drogisterij', 'kaaskraam', 'fruitkraam'], kluis: KLUIS_PLEK.kramen },
  { id: 'keuken', naam: 'Open keuken', kleur: '#2ec4b6', stations: ['guacamole', 'spaarpot', 'receptenboek', 'showroom'], kluis: KLUIS_PLEK.keuken },
  { id: 'kade', naam: 'Laadkade', kleur: '#ffc94d', stations: ['arnhem', 'tankpomp', 'schatkaart'], kluis: KLUIS_PLEK.kade },
];

export const LAMPJES: ([number, number] | [number, number, number])[] = LAMPJES_HUIS;
