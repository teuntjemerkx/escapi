// Wereld 1 (De Ellehaven): drie klussen in drie hoeken van de haven, elk met een kluis, en de verstopte lampjes.
import type { Klus } from '../werelden/types';
import { KLUIS_PLEK, LAMPJES_HUIS } from './huis';

export const KLUSSEN: Klus[] = [
  { id: 'lengte', naam: 'Meten op de werf', kleur: '#5aa9ff', stations: ['snelwegbord', 'werkplaats', 'hakken', 'omleiding'], kluis: KLUIS_PLEK.lengte },
  { id: 'inhoud', naam: 'Schenken op de steigers', kleur: '#2ec4b6', stations: ['kombuis', 'cocktail', 'badje', 'smoothie'], kluis: KLUIS_PLEK.inhoud },
  { id: 'gewicht', naam: 'Wegen in de loods', kleur: '#ffc94d', stations: ['rijstkom', 'weegschaal', 'klontjes'], kluis: KLUIS_PLEK.gewicht },
];

export const LAMPJES: ([number, number] | [number, number, number])[] = LAMPJES_HUIS;
