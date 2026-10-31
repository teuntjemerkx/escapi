// Wereld 5 als gebouw: "Meetstation Noorderlicht", een meetstation op een bergrichel (2450 m).
// Kamers, buitenruimtes, doorgangen, trappen en buitendecor staan in gebouw.json (gecontroleerd met check.mjs).
import type { Plattegrond } from '../werelden/types';
import gebouw from './gebouw.json';

export const PLAN: Plattegrond = {
  muurHoogte: gebouw.muurHoogte,
  verdiepingHoogte: gebouw.verdiepingHoogte,
  gevel: gebouw.gevel,
  gevelSoort: gebouw.gevelSoort as Plattegrond['gevelSoort'],
  kamers: gebouw.kamers as Plattegrond['kamers'],
  doorgangen: gebouw.doorgangen as Plattegrond['doorgangen'],
  trappen: gebouw.trappen as Plattegrond['trappen'],
  uitgang: gebouw.uitgang as Plattegrond['uitgang'],
};

/** Hoogte van één verdieping (vloer tot vloer). */
export const HV = gebouw.verdiepingHoogte;

export const SPAWN = gebouw.spawn as unknown as [number, number];

/** Vaste dingen buiten (botsing): midden, maat [b, d]; rond = cirkel met middellijn b. */
export const BUITENDECOR = gebouw.buitendecor as unknown as { naam: string; pos: [number, number]; maat: [number, number]; rond?: boolean }[];

/** Lantaarnpalen buiten [x, z]. */
export const LANTAARNS = gebouw.lantaarns as unknown as [number, number][];

/** Plek van een buitending uit gebouw.json (zo staan model en botsing altijd op dezelfde plek). */
export function plek(naam: string): [number, number] {
  const o = BUITENDECOR.find((d) => d.naam === naam);
  if (!o) throw new Error(`Geen buitendecor "${naam}" in gebouw.json`);
  return o.pos;
}

/** Plek van een station uit gebouw.json [x, z]. */
export function stationPlek(id: string): [number, number] {
  const st = (gebouw.stations as Record<string, { pos: number[] }>)[id];
  if (!st) throw new Error(`Geen station "${id}" in gebouw.json`);
  return [st.pos[0], st.pos[1]];
}
