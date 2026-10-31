// Wereld 5 – de modellen tekenen hun tabellen en grafieken rechtstreeks uit onderdeel5.json.
// Zo staan de getallen in de wereld altijd precies zoals in de data (geen overtikfouten).
import data from '../data/onderdeel5.json';
import type { Context, Opdracht } from '../data/schema';

export const O5: Record<string, Opdracht> = Object.fromEntries((data.opdrachten as unknown as Opdracht[]).map((o) => [o.id, o]));

export function ctxVan(id: string, i = 0): Context {
  const c = O5[id]?.context?.[i];
  if (!c) throw new Error(`Geen context ${i} bij ${id}`);
  return c;
}
export const rijenVan = (id: string, i = 0) => ctxVan(id, i).rijen ?? [];
export const kolommenVan = (id: string, i = 0) => ctxVan(id, i).kolommen ?? [];
export const itemsVan = (id: string, i = 0) => ctxVan(id, i).items ?? [];

/** "€ 1.125*" → 1125, "37%" → 37, 23.5 → 23.5 */
export function getal(v: string | number): number {
  if (typeof v === 'number') return v;
  const s = v.replace(/[€%*\s]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(s);
}
