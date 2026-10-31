// Spelregels: Directe Instructie Model + escaperoom.
// Begeleid → gereedschap. Zelf doen → elk station een codecijfer → kluis per klus → sleutel in de poort.
// Alle sleutels → eindcheck bij de poort → poort open.
import { huidig, stationsVan, stationVan } from '../werelden';
import type { Klus, Station, WereldDef } from '../werelden/types';
import { FASES, type Fase, type Score, useSpel } from './store';
import { geluid } from '../lib/geluid';

const volgorde: Fase[] = [...FASES.map((f) => f.id), 'klaar'];
export const faseIndex = (f: Fase) => volgorde.indexOf(f);

export const FASE_VAN_SECTIE: Record<string, Fase> = {
  instap: 'begeleid',
  niveau: 'zelfstandig',
  expert: 'zelfstandig',
  praktijk: 'zelfstandig',
  puzzel: 'zelfstandig',
  eindtest: 'evaluatie',
};

const sectieVan = (st: Station, def = huidig()) => def.opdrachten[st.opdrachten[0]]?.sectie;

export function benodigdeFase(st: Station): Fase {
  if (st.rol === 'terugblik') return 'terugblik';
  if (st.rol === 'instructie') return 'instructie';
  if (st.rol === 'kluis') return 'zelfstandig';
  return FASE_VAN_SECTIE[sectieVan(st) ?? 'niveau'];
}

export function blokken(def: WereldDef = huidig()) {
  const eind = def.werkboek.filter((id) => def.opdrachten[id].sectie === 'eindtest');
  const helft = Math.ceil(eind.length / 2);
  return { blok1: eind.slice(0, helft), blok2: eind.slice(helft) };
}

export function isOpen(st: Station, fase: Fase, docent: boolean, voortgang: Record<string, Score>) {
  if (docent) return true;
  const nodig = benodigdeFase(st);
  if (st.rol) return faseIndex(fase) >= faseIndex(nodig);
  if (faseIndex(fase) < faseIndex(nodig)) return false;
  // Eindcheck in twee blokken: blok 2 pas na blok 1.
  const { blok1, blok2 } = blokken();
  if (st.opdrachten.some((id) => blok2.includes(id))) return blok1.every((id) => voortgang[id]?.goed);
  return true;
}

export const kluisOpen = (klus: string, nr = useSpel.getState().wereld) => !!useSpel.getState().kluizen[`${nr}:${klus}`];

export function isKlaar(st: Station, voortgang: Record<string, Score>, fase: Fase) {
  if (st.rol === 'terugblik') return faseIndex(fase) > faseIndex('terugblik');
  if (st.rol === 'instructie') return faseIndex(fase) > faseIndex('instructie');
  if (st.rol === 'kluis') return kluisOpen(st.klus!);
  return st.opdrachten.every((id) => voortgang[id]?.goed);
}

export function isKeuze(st: Station) {
  const s = sectieVan(st);
  return s === 'expert' || s === 'puzzel' || s === 'praktijk';
}

// ── Codes: elk station in een klus heeft een symbool en een cijfer ──

function hash(t: string) {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function klusVan(stationId: string, def = huidig()): Klus | undefined {
  return def.klussen.find((k) => k.stations.includes(stationId));
}

/** Codecijfer van een station (vast per wereld, 1–9 zodat een code nooit met 0 begint). */
export function cijferVan(stationId: string, def = huidig()) {
  return 1 + (hash(`${def.nr}:${stationId}:code`) % 9);
}

export interface CodeDeel {
  station: Station;
  symbool: number;
  cijfer: number;
  gevonden: boolean;
}
export function codesVan(klus: Klus, voortgang = useSpel.getState().voortgang, def = huidig()): CodeDeel[] {
  return klus.stations.map((id, i) => {
    const st = stationVan(id, def)!;
    return { station: st, symbool: i, cijfer: cijferVan(id, def), gevonden: !!st && st.opdrachten.every((o) => voortgang[o]?.goed) };
  });
}

/** Lampjes = tips. Start met 3, + gevonden lampjes, + opgeloste keuzestations, − gebruikt. */
export function lampjesOver(def = huidig()) {
  const s = useSpel.getState();
  const gevonden = def.lampjes.filter((_, i) => s.lampjes[`${def.nr}:${i}`]).length;
  const keuze = stationsVan(def).filter((st) => !st.rol && isKeuze(st) && isKlaar(st, s.voortgang, s.fase)).length;
  return Math.max(0, 3 + gevonden + keuze - (s.lampGebruikt[def.nr] ?? 0));
}

/** Sterren per klus: 1 = kluis open, 2 = zonder tweelingsom, 3 = steeds binnen 2 pogingen en hooguit tip 1. */
export function sterrenVan(klus: Klus, def = huidig()) {
  const s = useSpel.getState();
  if (!kluisOpen(klus.id, def.nr)) return 0;
  const ids = klus.stations.flatMap((id) => stationVan(id, def)?.opdrachten ?? []);
  const sc = ids.map((id) => s.voortgang[id]);
  let n = 1;
  if (sc.every((x) => (x?.tip ?? 0) < 4)) n = 2;
  if (n === 2 && sc.every((x) => (x?.pogingen ?? 0) <= 2 && (x?.tip ?? 0) <= 1)) n = 3;
  return n;
}

const volgordeCache = new WeakMap<WereldDef, { instap: string[]; eind: string[] }>();
function volgordes(def: WereldDef) {
  let v = volgordeCache.get(def);
  if (!v) {
    const sorteer = (sectie: string) =>
      def.stations
        .filter((s) => !s.rol && def.opdrachten[s.opdrachten[0]]?.sectie === sectie)
        .sort((a, b) => def.werkboek.indexOf(a.opdrachten[0]) - def.werkboek.indexOf(b.opdrachten[0]))
        .map((s) => s.id);
    v = { instap: sorteer('instap'), eind: sorteer('eindtest') };
    volgordeCache.set(def, v);
  }
  return v;
}

/** Het station waar het spel je nu heen stuurt (of null bij vrij werken). */
export function volgendDoel(fase: Fase, voortgang: Record<string, Score>): string | null {
  const def = huidig();
  const rol = (r: Station['rol']) => def.stations.find((s) => s.rol === r)?.id ?? null;
  if (fase === 'terugblik') return rol('terugblik');
  if (fase === 'instructie') return rol('instructie');
  if (fase === 'begeleid') return volgordes(def).instap.find((id) => !isKlaar(stationVan(id)!, voortgang, fase)) ?? null;
  if (fase === 'zelfstandig') {
    const klaarVoorKluis = def.klussen.find((k) => !kluisOpen(k.id) && codesVan(k, voortgang).every((c) => c.gevonden));
    return klaarVoorKluis ? `kluis-${klaarVoorKluis.id}` : null;
  }
  if (fase === 'evaluatie') {
    const open = volgordes(def).eind.find((id) => !isKlaar(stationVan(id)!, voortgang, fase));
    return open ?? 'poort';
  }
  return null;
}

export function verplichtOpen(voortgang: Record<string, Score>, sectie: string, def = huidig()) {
  return def.werkboek.filter((id) => def.opdrachten[id].sectie === sectie && !voortgang[id]?.goed);
}

/** Na elk goed antwoord: kijk of de fase verder kan. */
export function controleerFase(opdrachtId?: string) {
  const s = useSpel.getState();
  const def = huidig();
  const v = s.voortgang;
  if (s.fase === 'begeleid' && verplichtOpen(v, 'instap').length === 0) {
    s.setFase('zelfstandig');
    s.setKaart('begeleid-klaar');
  } else if (s.fase === 'zelfstandig' && opdrachtId) {
    // Nieuwe code gevonden? Meld het, en meld een complete klus.
    const st = stationsVan(def).find((x) => x.opdrachten.includes(opdrachtId));
    const klus = st ? klusVan(st.id) : undefined;
    if (st && klus && st.opdrachten.every((id) => v[id]?.goed)) {
      const codes = codesVan(klus, v);
      const c = codes.find((x) => x.station.id === st.id)!;
      s.vier(false);
      geluid('code');
      if (codes.every((x) => x.gevonden)) s.setMelding(`Code compleet! Open nu de kluis van ${klus.naam.toLowerCase()}.`, 'goed');
      else s.setMelding(`Code gevonden: ${['driehoek', 'rondje', 'vierkant', 'ster'][c.symbool]} = ${c.cijfer}. Staat in je klusboek.`, 'goed');
    }
  } else if (s.fase === 'evaluatie') {
    const { blok1, blok2 } = blokken();
    const b1 = blok1.every((id) => v[id]?.goed);
    const b2 = blok2.every((id) => v[id]?.goed);
    if (b1 && b2) s.setKaart('samenvatting');
    else if (b1 && blok2.length && !blok2.some((id) => v[id]?.pogingen)) s.setKaart('blok2');
  }
}

/** Kluis is open: alle sleutels binnen? Dan door naar de eindcheck. */
export function naKluis() {
  const s = useSpel.getState();
  const def = huidig();
  if (s.fase === 'zelfstandig' && def.klussen.every((k) => kluisOpen(k.id))) {
    setTimeout(() => {
      const t = useSpel.getState();
      t.setFase('evaluatie');
      t.sluit();
      t.setKaart('evaluatie');
    }, 2200);
  }
}

export function telling(voortgang: Record<string, Score>, def = huidig()) {
  const werk = def.werkboek.map((id) => def.opdrachten[id]);
  const verplicht = werk.filter((o) => ['instap', 'niveau', 'eindtest'].includes(o.sectie));
  const keuze = werk.filter((o) => !['instap', 'niveau', 'eindtest'].includes(o.sectie));
  return {
    verplicht: verplicht.length,
    verplichtGoed: verplicht.filter((o) => voortgang[o.id]?.goed).length,
    keuze: keuze.length,
    keuzeGoed: keuze.filter((o) => voortgang[o.id]?.goed).length,
  };
}
