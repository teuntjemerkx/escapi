// In welke kamer staat iets? (alleen bij werelden met een gebouw)
import { kamerOp } from '../game/huis';
import { huidig } from '../werelden';

export function kamerVan(pos: [number, number], verdieping = 0): string | undefined {
  const plan = huidig().plan;
  const naam = plan ? kamerOp(plan, pos[0], pos[1], verdieping)?.naam : undefined;
  return naam && verdieping ? `${naam} (${verdieping === 1 ? '1e' : `${verdieping}e`} verdieping)` : naam;
}
