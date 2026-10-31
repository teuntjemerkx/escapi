// Richten en gebruiken (first person): waar je naar kijkt, open je met één klik, met E of met Enter.
// Geen Esc meer nodig om een opdracht te openen. Wat je richt, bepaalt Richten in wereld-basis.tsx.
import * as THREE from 'three';
import { create } from 'zustand';

/** Wat er nu in het vizier staat (voor de melding onderin het scherm). */
export type RichtDoel = { id: string; titel: string; dicht: string | null };
export const useRicht = create<{ doel: RichtDoel | null }>(() => ({ doel: null }));

/** Snel bij te werken deel (elke paar beelden), buiten React. */
export const richt = { id: null as string | null, actie: null as null | (() => void) };

/** Gebruik wat in het vizier staat. Geeft false als er niets is. */
export function gebruikRicht() {
  if (!richt.actie) return false;
  richt.actie();
  return true;
}

/** Andere dingen die je kunt gebruiken (zoals de codezuil bij de uitgang): plek in de wereld + actie. */
export const extraDoelen = new Map<string, { pos: THREE.Vector3; titel: string; actie: () => void; v: number; bereik: number }>();
