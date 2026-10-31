// Wereld 4: drie klussen met elk een kluis in de eigen zone (de kluis van Nieuws en media staat boven), en de verstopte lampjes.
import type { Klus } from '../werelden/types';
import { KLUIS_PLEK, LAMPJES_HUIS } from './huis';
import plan from './plan.json';

/** Kluizen kijken de winkel in: tegen de oostmuur naar −x, tegen de westmuur naar +x. */
export const KLUSSEN: Klus[] = plan.klussen.map((k) => {
  const [x, z, verdieping] = KLUIS_PLEK[k.id];
  return { id: k.id, naam: k.naam, kleur: k.kleur, stations: k.stations, kluis: { pos: [x, z], rot: x > 0 ? -Math.PI / 2 : Math.PI / 2, verdieping } };
});

export const LAMPJES: [number, number, number][] = LAMPJES_HUIS;
