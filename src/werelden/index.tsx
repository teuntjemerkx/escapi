// Register van alle werelden + hulpfuncties voor de wereld waar je nu bent.
import type { Opdracht } from '../data/schema';
import { KluisModel } from '../game/kluis';
import { useSpel } from '../game/store';
import type { Klus, Station, WereldDef } from './types';

const geladen: WereldDef[] = [];
const isWereld = (x: unknown): x is WereldDef => !!x && typeof x === 'object' && 'nr' in x && 'stations' in x && 'Decor' in x;

/**
 * Laad alle werelden (src/world{n}/wereld.tsx). Een wereld die (nog) niet laadt, wordt
 * overgeslagen in plaats van het hele spel te breken.
 */
export async function laadWerelden() {
  const modules = import.meta.glob('../world*/wereld.tsx');
  const uit = await Promise.allSettled(Object.entries(modules).map(async ([pad, laad]) => ({ pad, m: (await laad()) as Record<string, unknown> })));
  geladen.length = 0;
  for (const r of uit) {
    if (r.status === 'rejected') {
      console.warn('Wereld niet geladen:', r.reason);
      continue;
    }
    const def = Object.values(r.value.m).find(isWereld);
    if (def) {
      geladen.push(def);
      if (import.meta.env.DEV) controleer(def);
    }
  }
  geladen.sort((a, b) => a.nr - b.nr);
}

/** Alle werelden die al gebouwd zijn. */
export function alleWerelden(): WereldDef[] {
  return geladen;
}
export function wereldNr(nr: number): WereldDef | undefined {
  return alleWerelden().find((w) => w.nr === nr);
}
/** De wereld waar de speler nu is. */
export function huidig(): WereldDef {
  return wereldNr(useSpel.getState().wereld) ?? wereldNr(2) ?? geladen[0];
}

const cache = new WeakMap<WereldDef, { stations: Station[]; station: Record<string, Station> }>();
function bouw(def: WereldDef) {
  let c = cache.get(def);
  if (!c) {
    const kluizen: Station[] = def.klussen.map((k: Klus) => ({
      id: `kluis-${k.id}`,
      titel: `Kluis: ${k.naam}`,
      opdrachten: [],
      pos: k.kluis.pos,
      verdieping: k.kluis.verdieping,
      rot: k.kluis.rot ?? 0,
      Model: () => <KluisModel klus={k} />,
      weergave: 'draai',
      kanBoven: false,
      kanDraai: true,
      grootte: 1.9,
      midden: 0.75,
      markerY: 2.4,
      rol: 'kluis',
      klus: k.id,
      botser: [1.2, 1.1],
    }));
    const stations = [...def.stations, ...kluizen];
    c = { stations, station: Object.fromEntries(stations.map((s) => [s.id, s])) };
    cache.set(def, c);
  }
  return c;
}
/** Stations van een wereld, inclusief de kluizen. */
export function stationsVan(def: WereldDef = huidig()) {
  return bouw(def).stations;
}
export function stationVan(id: string, def: WereldDef = huidig()): Station | undefined {
  return bouw(def).station[id];
}
export function opdrachtVan(id: string, def: WereldDef = huidig()): Opdracht | undefined {
  return def.opdrachten[id] ?? alleWerelden().find((w) => w.opdrachten[id])?.opdrachten[id];
}
export type { Klus, Station, WereldDef } from './types';

/** Ontwikkelcontrole: elke werkboekopdracht zit in precies één station, elke klus bestaat uit niveau-stations. */
function controleer(def: WereldDef) {
  const telling = new Map<string, number>();
  for (const st of def.stations) for (const id of st.opdrachten) telling.set(id, (telling.get(id) ?? 0) + 1);
  const mist = def.werkboek.filter((id) => !telling.has(id));
  const dubbel = [...telling].filter(([, n]) => n > 1).map(([id]) => id);
  const niveau = def.stations.filter((s) => !s.rol && def.opdrachten[s.opdrachten[0]]?.sectie === 'niveau').map((s) => s.id);
  const inKlus = new Set(def.klussen.flatMap((k) => k.stations));
  const zonderKlus = niveau.filter((id) => !inKlus.has(id));
  if (mist.length || dubbel.length || zonderKlus.length) console.warn(`Wereld ${def.nr}:`, { mist, dubbel, zonderKlus });
}
