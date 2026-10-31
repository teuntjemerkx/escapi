// Poppenhuis-stijl (zoals Doors 101): een gebouw op een houten sokkel, kamers met houten vloeren,
// muren met lambrisering die wegzakken aan de kant van de camera, en deuren die opengaan als je verder komt.
import { useFrame, useThree } from '@react-three/fiber';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { geluid } from '../lib/geluid';
import { huidig, stationVan } from '../werelden';
import type { Doorgang, Kamer, Plattegrond, Trap, Vloer } from '../werelden/types';
import { box, opLaag, verwijder } from './botsing';
import { wasSlepen } from './invoer';
import { Blok, Cil, mat, opSchaduwLaag, SCHADUW_LAAG } from './kit';
import { Statisch } from './statisch';
import { dakVorm, type DakSoort, type Vak } from './dak';
import { metAanlicht } from './aanlicht';
import { relief } from './relief';
import { Sleutel } from './kluis';
import { FASES, speler, useSpel, type Fase } from './store';
import { Heg, Hekwerk, Muurtje, Reling, Spijlenhek } from './natuur';
import { donkerder, gevelTextuur, gloedTex, lichtTex, muurTextuur, steenTextuur, VLOER_KLEUR, vloerTextuur, plafondTextuur, pleisterTextuur, vakwerkTextuur, dakpanTextuur } from './texturen';
import { faseIndex, kluisOpen } from './voortgang';
import { AfzetLint, Balustrade, bijzonderePlafonds, GlasWand, kolomPlekken, Kolommen, PlafondDelen, PUI_H, PuiKozijn, RoltrapModel, Rolluik, SchuifDeuren, systeemPlafond } from './bouwdelen';

export const MUUR_D = 0.3;
export const DEUR_H = 2.45;
const STUK_MAX = 5.6;
const LAAG = 0.55;

type V2 = [number, number];

export interface MuurStuk {
  key: string;
  as: 'x' | 'z';
  /** Lijn van de muur (z bij as 'x', x bij as 'z'). */
  c: number;
  s: number;
  e: number;
  vanY: number;
  min?: Kamer;
  plus?: Kamer;
  /** Kant waar buiten is: −1, +1 of 0 (binnenmuur). */
  buiten: -1 | 0 | 1;
  /** Tot waar deze muur reikt (hoogte van de kamers ernaast, zie `Kamer.hoogte` en `Kamer.vide`). */
  h: number;
  /** Glas van een etalagepui of raam (wordt apart getekend, botst wel als het tot de vloer gaat). */
  glas?: boolean;
  /** Borstwering onder een raam (geen kantelen erop). */
  onder?: boolean;
}

/** Hoogte van een binnenkamer (0 voor een buitenruimte of geen kamer). */
export const kamerHoogte = (plan: Plattegrond, k?: Kamer) => (k && !k.buiten ? (k.hoogte ?? plan.muurHoogte ?? 3.2) : 0);

export function kamerOp(plan: Plattegrond, x: number, z: number, v = 0): Kamer | undefined {
  return plan.kamers.find((k) => (k.verdieping ?? 0) === v && Math.abs(x - k.pos[0]) < k.maat[0] / 2 && Math.abs(z - k.pos[1]) < k.maat[1] / 2);
}

// ── Verdiepingen ──────────────────────────────────────────────────────────

/** Hoogte van één verdieping (vloer tot vloer). */
export const verdiepingHoogte = (plan: Plattegrond) => plan.verdiepingHoogte ?? (plan.muurHoogte ?? 3.2) + 0.3;

/** Alle verdiepingen van een plattegrond, van laag naar hoog. */
export function verdiepingen(plan: Plattegrond): number[] {
  return [...new Set([0, ...plan.kamers.map((k) => k.verdieping ?? 0)])].sort((a, b) => a - b);
}

const deelCache = new WeakMap<Plattegrond, Map<number, Plattegrond>>();
/**
 * Deelplan van één verdieping: alleen de kamers en doorgangen van die verdieping (als verdieping 0),
 * zodat muren, randen en vloeren per verdieping worden afgeleid. Een plan zonder verdiepingen blijft zichzelf.
 */
export function verdiepingPlan(plan: Plattegrond, v: number): Plattegrond {
  if (plan.deelVan) return plan;
  if (v === 0 && verdiepingen(plan).length === 1) return plan;
  let m = deelCache.get(plan);
  if (!m) deelCache.set(plan, (m = new Map()));
  let d = m.get(v);
  if (!d) {
    d = {
      ...plan,
      kamers: plan.kamers.filter((k) => (k.verdieping ?? 0) === v).map((k) => ({ ...k, verdieping: 0 })),
      doorgangen: plan.doorgangen.map((g, i) => ({ ...g, sleutel: `${i}` })).filter((g) => (g.verdieping ?? 0) === v),
      uitgang: v === 0 ? plan.uitgang : { pos: [1e5, 1e5], as: 'x' },
      deelVan: { plan, verdieping: v },
    };
    m.set(v, d);
  }
  return d;
}

/** Staat dit punt buiten het gebouw (niet binnen de binnenkamers van de begane grond)? */
export function buitenGebouw(plan: Plattegrond, x: number, z: number) {
  const binnen = plan.kamers.filter((k) => (k.verdieping ?? 0) === 0 && !k.buiten);
  if (!binnen.length) return true;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const k of binnen) {
    minX = Math.min(minX, k.pos[0] - k.maat[0] / 2);
    maxX = Math.max(maxX, k.pos[0] + k.maat[0] / 2);
    minZ = Math.min(minZ, k.pos[1] - k.maat[1] / 2);
    maxZ = Math.max(maxZ, k.pos[1] + k.maat[1] / 2);
  }
  return x < minX - 0.4 || x > maxX + 0.4 || z < minZ - 0.4 || z > maxZ + 0.4;
}

/** Waar staat dit punt op de trap? t = 0 onderaan, 1 bovenaan; lat = afstand opzij van het midden. */
export function trapPunt(tr: Trap, x: number, z: number) {
  const langs = tr.as === 'x' ? x - tr.pos[0] : z - tr.pos[1];
  const opzij = tr.as === 'x' ? z - tr.pos[1] : x - tr.pos[0];
  return { t: (langs * tr.richting + tr.lengte / 2) / tr.lengte, lat: Math.abs(opzij) };
}
/** Punt op de trap bij t (0 onder, 1 boven). */
export function trapOp(tr: Trap, t: number): V2 {
  const l = (t - 0.5) * tr.lengte * tr.richting;
  return tr.as === 'x' ? [tr.pos[0] + l, tr.pos[1]] : [tr.pos[0], tr.pos[1] + l];
}

/** Kijk je nu door de ogen van het poppetje terwijl je loopt (niet op het titelscherm)? */
export function eersteLopen() {
  const s = useSpel.getState();
  return s.cameraStand === 'eerste' && s.modus === 'lopen' && s.kaart !== 'start' && s.kaart !== 'werelden';
}

/** Op welke verdieping kijk je nu (poppetje, of het station dat je bekijkt)? */
export function kijkVerdieping() {
  const s = useSpel.getState();
  if (s.modus !== 'lopen' && s.actief) return stationVan(s.actief)?.verdieping ?? 0;
  return speler.verdieping;
}

/** Moet verdieping v zichtbaar zijn? Hoger dan jij: weg (dan kijk je in je eigen verdieping), behalve als je buiten staat. */
export function verdiepingZichtbaar(v: number) {
  if (v === 0) return true;
  const s = useSpel.getState();
  if (s.kaart === 'start' || s.kaart === 'werelden') return true;
  // door je eigen ogen zie je het hele gebouw (met plafonds), net als in het echt
  if (eersteLopen()) return true;
  const kv = kijkVerdieping();
  if (v <= kv) return true;
  const plan = huidig().plan;
  return kv === 0 && s.modus === 'lopen' && !!plan && buitenGebouw(plan, speler.pos.x, speler.pos.z);
}

/** Loop je door je eigen ogen buiten het gebouw? Dan zie je de binnenkant niet (ramen zijn dicht glas). */
export function binnenVerborgen() {
  if (!eersteLopen()) return false;
  const plan = huidig().plan;
  if (plan?.kamers.some((k) => k.inkijk)) return false;
  return !!plan && speler.verdieping === 0 && buitenGebouw(plan, speler.pos.x, speler.pos.z);
}

/** Inrichting binnen (meubels, fakkels, opdrachten): weg zolang je buiten loopt in de eerste persoon (scheelt veel tekenwerk). */
export function Binnen({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = !binnenVerborgen();
  });
  return <group ref={ref}>{children}</group>;
}

/** Welke verdieping hoort bij de onderdelen hierbinnen (muren, ramen, fakkels). */
export const VerdiepingCtx = createContext(0);

/**
 * Een verdieping boven de begane grond: zet alles op de goede hoogte (als `optillen`) en laat het
 * wegschuiven als je eronder bent. Binnen deze groep weten muren, ramen en fakkels op welke verdieping ze zijn.
 */
export function Verdieping({ nr, optillen = true, children }: { nr: number; optillen?: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const zicht = useRef(1);
  const plan = huidig().plan;
  const HV = plan ? verdiepingHoogte(plan) : 3.5;
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const doel = verdiepingZichtbaar(nr) ? 1 : 0;
    zicht.current += (doel - zicht.current) * Math.min(1, dt * 6);
    if (Math.abs(doel - zicht.current) < 0.01) zicht.current = doel;
    g.visible = zicht.current > 0.02;
    g.position.y = (optillen ? nr * HV : 0) + (1 - zicht.current) * 7;
  });
  return (
    <VerdiepingCtx.Provider value={nr}>
      <group ref={ref} position={[0, optillen ? nr * HV : 0, 0]}>
        {children}
      </group>
    </VerdiepingCtx.Provider>
  );
}

/** Het deelplan van de verdieping waar dit onderdeel bij hoort. */
export function useVerdiepingPlan() {
  const v = useContext(VerdiepingCtx);
  const plan = huidig().plan!;
  return { v, plan: verdiepingPlan(plan, v), heel: plan };
}

export function grenzen(plan: Plattegrond) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const k of plan.kamers) {
    minX = Math.min(minX, k.pos[0] - k.maat[0] / 2);
    maxX = Math.max(maxX, k.pos[0] + k.maat[0] / 2);
    minZ = Math.min(minZ, k.pos[1] - k.maat[1] / 2);
    maxZ = Math.max(maxZ, k.pos[1] + k.maat[1] / 2);
  }
  return { minX, maxX, minZ, maxZ, w: maxX - minX, d: maxZ - minZ, midden: [(minX + maxX) / 2, (minZ + maxZ) / 2] as V2 };
}

const breedte = (d: Doorgang) => d.breed ?? ({ dubbel: 2.4, open: 3, pui: 5, roldeur: 3.6, valhek: 3 } as Partial<Record<NonNullable<Doorgang['soort']>, number>>)[d.soort ?? 'deur'] ?? 1.6;
/** Hoogte van de opening: daarboven komt een bovenstuk (open: geen bovenstuk). */
const ROLDEUR_H = 3.4;
const openingHoog = (d: Doorgang) => d.hoog ?? (d.soort === 'open' ? Infinity : d.soort === 'pui' ? PUI_H : d.soort === 'roldeur' ? ROLDEUR_H : d.soort === 'raam' ? 2.4 : d.soort === 'valhek' ? 3.2 : DEUR_H);
const UITGANG_BREED = 3.4;

export interface RandStuk {
  key: string;
  as: 'x' | 'z';
  c: number;
  s: number;
  e: number;
  soort: NonNullable<Kamer['rand']>;
  kamer: Kamer;
}

const binnenKamer = (k?: Kamer) => !!k && !k.buiten;
const indelingCache = new WeakMap<Plattegrond, { muren: MuurStuk[]; randen: RandStuk[] }>();

/**
 * Leid alle muren en randen af uit de kamers (gedeelde wanden één keer), met gaten voor de doorgangen.
 * Muur: aan minstens één kant een binnenkamer. Rand (heg, hek...): buitenruimte tegen het niets.
 * Tussen twee buitenruimtes staat niets.
 */
export function indeling(planIn: Plattegrond) {
  const plan = verdiepingPlan(planIn, 0);
  const al = indelingCache.get(plan);
  if (al) return al;
  const lijnen = new Map<string, { as: 'x' | 'z'; c: number; iv: V2[] }>();
  const voeg = (as: 'x' | 'z', c: number, s: number, e: number) => {
    const k = `${as}:${c.toFixed(2)}`;
    if (!lijnen.has(k)) lijnen.set(k, { as, c, iv: [] });
    lijnen.get(k)!.iv.push([s, e]);
  };
  for (const k of plan.kamers) {
    const [x, z] = k.pos;
    const [w, d] = k.maat;
    voeg('x', z - d / 2, x - w / 2, x + w / 2);
    voeg('x', z + d / 2, x - w / 2, x + w / 2);
    voeg('z', x - w / 2, z - d / 2, z + d / 2);
    voeg('z', x + w / 2, z - d / 2, z + d / 2);
  }
  const gaten: { pos: V2; as: 'x' | 'z'; b: number; d?: Doorgang; ruim?: boolean }[] = [
    ...plan.doorgangen.map((d) => ({ pos: d.pos, as: d.as, b: breedte(d), d })),
    { pos: plan.uitgang.pos, as: plan.uitgang.as, b: UITGANG_BREED },
  ];
  const v = plan.deelVan?.verdieping ?? 0;
  const heel = plan.deelVan?.plan ?? plan;
  // Waar een trap (roltrap) bovenaan op deze verdieping uitkomt, zit een opening in de balustrade of muur.
  for (const tr of heel.trappen ?? []) {
    if (tr.van + 1 !== v) continue;
    const [x, z] = trapOp(tr, 1);
    gaten.push({ pos: [x, z], as: tr.as === 'x' ? 'z' : 'x', b: tr.breed + 0.5, d: undefined, ruim: true });
  }
  // ligt hier een binnenkamer onder (de vide van een galerij)?
  const vide = (x: number, z: number) => v > 0 && binnenKamer(kamerOp(heel, x, z, v - 1));
  const muren: MuurStuk[] = [];
  const randen: RandStuk[] = [];
  let n = 0;
  const kanten = (as: 'x' | 'z', c: number, m: number) =>
    as === 'x' ? [kamerOp(plan, m, c - 0.25), kamerOp(plan, m, c + 0.25)] : [kamerOp(plan, c - 0.25, m), kamerOp(plan, c + 0.25, m)];
  for (const { as, c, iv } of lijnen.values()) {
    iv.sort((a, b) => a[0] - b[0]);
    const runs: V2[] = [];
    for (const [s, e] of iv) {
      const laatste = runs[runs.length - 1];
      if (laatste && s <= laatste[1] + 1e-6) laatste[1] = Math.max(laatste[1], e);
      else runs.push([s, e]);
    }
    const mijnGaten = gaten
      .filter((g) => g.as === as && Math.abs((as === 'x' ? g.pos[1] : g.pos[0]) - c) < (g.ruim ? 0.4 : 0.05))
      .map((g) => {
        const p = as === 'x' ? g.pos[0] : g.pos[1];
        return { a: p - g.b / 2, b: p + g.b / 2, d: g.d };
      });
    // breekpunten: waar een kamer langs deze lijn begint of eindigt
    const breek = new Set<number>();
    for (const [s, e] of iv) {
      breek.add(+s.toFixed(3));
      breek.add(+e.toFixed(3));
    }
    for (const [rs, re] of runs) {
      const punten = [rs, ...[...breek].filter((p) => p > rs + 1e-3 && p < re - 1e-3).sort((a, b) => a - b), re];
      type Seg = { a: number; b: number; soort: 'muur' | 'rand' | 'niets'; buitenKamer?: Kamer; balustrade?: boolean };
      const segs: Seg[] = [];
      for (let i = 0; i + 1 < punten.length; i++) {
        const m = (punten[i] + punten[i + 1]) / 2;
        const [min, plus] = kanten(as, c, m);
        let soort: Seg['soort'] = binnenKamer(min) || binnenKamer(plus) ? 'muur' : (min && !plus) || (!min && plus) ? 'rand' : 'niets';
        // open zijde: de kamer onder/links van de lijn kijkt met haar plus-kant naar de lijn, de andere met haar min-kant
        if (min?.open?.includes(as === 'x' ? 'z' : 'o') || plus?.open?.includes(as === 'x' ? 'n' : 'w')) soort = 'niets';
        // galerij: naar de vide toe (geen kamer ernaast, wel een kamer eronder) een glazen balustrade in plaats van een muur
        const een = !plus && binnenKamer(min) ? min : !min && binnenKamer(plus) ? plus : undefined;
        let balustrade = false;
        if (soort === 'muur' && een?.galerij) {
          const kant = een === min ? 0.25 : -0.25;
          const [vx, vz] = as === 'x' ? [m, c + kant] : [c + kant, m];
          if (vide(vx, vz)) {
            soort = 'rand';
            balustrade = true;
          }
        }
        segs.push({ a: punten[i], b: punten[i + 1], soort, buitenKamer: min ?? plus, balustrade });
      }
      segs.forEach((sg, i) => {
        if (sg.soort === 'niets') return;
        const begin = i === 0;
        const eind = i === segs.length - 1;
        let s0 = sg.a;
        let e0 = sg.b;
        if (sg.soort === 'muur') {
          // x-muren lopen door tot in de hoeken, z-muren stoppen ertegen (geen overlap, geen flikkeren).
          const losVoor = begin || segs[i - 1].soort !== 'muur';
          const losNa = eind || segs[i + 1].soort !== 'muur';
          if (as === 'x') {
            if (losVoor) s0 -= MUUR_D / 2;
            if (losNa) e0 += MUUR_D / 2;
          } else {
            if (begin) s0 += MUUR_D / 2;
            if (eind) e0 -= MUUR_D / 2;
          }
        }
        const stukken: V2[] = [];
        let cur = s0;
        for (const { a: gs, b: ge, d } of mijnGaten.filter((g) => g.b > s0 && g.a < e0).sort((x, y) => x.a - y.a)) {
          if (gs > cur) stukken.push([cur, gs]);
          if (sg.soort === 'muur') {
            const a = Math.max(gs, s0);
            const b = Math.min(ge, e0);
            // bovenstuk boven de opening (een open doorgang heeft er geen)
            const hoog = d ? openingHoog(d) : DEUR_H;
            if (Number.isFinite(hoog)) muren.push(maakStuk(as, c, a, b, hoog, plan, `b${n++}`));
            // etalagepui: glas links en rechts van de schuifdeur
            if (d?.soort === 'pui') {
              const mid = as === 'x' ? d.pos[0] : d.pos[1];
              const db = (d.deurBreed ?? 2) / 2;
              for (const [ga, gb] of [
                [a, mid - db],
                [mid + db, b],
              ] as V2[])
                if (gb - ga > 0.1) muren.push({ ...maakStuk(as, c, ga, gb, 0, plan, `g${n++}`), h: PUI_H, glas: true });
            }
            // raam: borstwering, glas, en daarboven de muur (het bovenstuk hierboven)
            if (d?.soort === 'raam') {
              const borst = d.borst ?? 0.9;
              if (borst > 0.05) muren.push({ ...maakStuk(as, c, a, b, 0, plan, `o${n++}`), h: borst, onder: true });
              muren.push({ ...maakStuk(as, c, a, b, borst, plan, `g${n++}`), h: Math.min(hoog, maakStuk(as, c, a, b, 0, plan, 'x').h), glas: true });
            }
          }
          cur = ge;
        }
        if (cur < e0) stukken.push([cur, e0]);
        for (const [a, b] of stukken) {
          if (b - a < 0.05) continue;
          if (sg.soort === 'rand') {
            randen.push({ key: `r${n++}`, as, c, s: a, e: b, soort: sg.balustrade ? 'balustrade' : (sg.buitenKamer!.rand ?? 'heg'), kamer: sg.buitenKamer! });
            continue;
          }
          const delen = Math.max(1, Math.ceil((b - a) / STUK_MAX));
          for (let i = 0; i < delen; i++) muren.push(maakStuk(as, c, a + ((b - a) * i) / delen, a + ((b - a) * (i + 1)) / delen, 0, plan, `m${n++}`));
        }
      });
    }
  }
  const uit = { muren: muren.filter((m) => m.vanY < m.h - 0.02), randen };
  indelingCache.set(plan, uit);
  return uit;
}

export const muurStukken = (plan: Plattegrond) => indeling(plan).muren;

function maakStuk(as: 'x' | 'z', c: number, s: number, e: number, vanY: number, plan: Plattegrond, key: string): MuurStuk {
  const m = (s + e) / 2;
  const min = as === 'x' ? kamerOp(plan, m, c - 0.25) : kamerOp(plan, c - 0.25, m);
  const plus = as === 'x' ? kamerOp(plan, m, c + 0.25) : kamerOp(plan, c + 0.25, m);
  // Hoogte: de hoogste kamer ernaast. Is een van beide een vide (atrium), dan stopt de muur bij de lagere buur.
  const a = kamerHoogte(plan, min);
  const b = kamerHoogte(plan, plus);
  let h = (min?.vide || plus?.vide) && a > 0 && b > 0 ? Math.min(a, b) : Math.max(a, b);
  // ligt er op deze plek een verdieping bovenop, dan houdt de muur op bij die vloer
  const heel = plan.deelVan?.plan;
  if (heel) {
    const v = plan.deelVan!.verdieping;
    const p1: V2 = as === 'x' ? [m, c - 0.25] : [c - 0.25, m];
    const p2: V2 = as === 'x' ? [m, c + 0.25] : [c + 0.25, m];
    if (kamerOp(heel, p1[0], p1[1], v + 1) || kamerOp(heel, p2[0], p2[1], v + 1)) h = Math.min(h, verdiepingHoogte(heel));
  }
  return { key, as, c, s, e, vanY, min, plus, buiten: min && !plus ? 1 : !min && plus ? -1 : 0, h };
}

export function deurOpen(d: Doorgang, fase: Fase, docent: boolean) {
  if (docent) return true;
  if (d.vanaf && faseIndex(fase) < faseIndex(d.vanaf)) return false;
  if (d.klus && !kluisOpen(d.klus)) return false;
  return true;
}

const deurId = (d: Doorgang, i: number) => `deur-${d.sleutel ?? i}`;

/** Botsingen van muren, randen en dichte deuren van één verdieping (laag = verdieping). */
function registreerVerdieping(plan: Plattegrond) {
  const { muren, randen } = indeling(plan);
  for (const m of [...muren.filter((m) => m.vanY === 0), ...randen]) {
    const mid = (m.s + m.e) / 2;
    const l = m.e - m.s;
    const dik = 'soort' in m ? 0.6 : MUUR_D;
    if (m.as === 'x') box(mid, m.c, l, dik, 'muur');
    else box(m.c, mid, dik, l, 'muur');
  }
  for (const k of plan.kamers) {
    const d = (k.kolommen?.dikte ?? 0.45) + 0.1;
    for (const [x, z] of kolomPlekken(k)) box(x, z, d, d, 'muur');
  }
  const s = useSpel.getState();
  plan.doorgangen.forEach((d, i) => {
    if (d.soort === 'boog' || d.soort === 'raam' || deurOpen(d, s.fase, s.docent)) return;
    const b = breedte(d);
    if (d.as === 'x') box(d.pos[0], d.pos[1], b, MUUR_D, deurId(d, i));
    else box(d.pos[0], d.pos[1], MUUR_D, b, deurId(d, i));
  });
}

/** Mag je op deze trap (of roltrap)? Dicht tot `vanaf` of tot de kluis van `klus` open is. */
export function trapOpen(tr: Trap) {
  const s = useSpel.getState();
  if (s.docent) return true;
  if (tr.vanaf && faseIndex(s.fase) < faseIndex(tr.vanaf)) return false;
  if (tr.klus && !kluisOpen(tr.klus)) return false;
  return true;
}

/** Afzetlinten voor trappen die nog dicht zijn (onderaan op hun eigen verdieping, bovenaan op de verdieping erboven). */
function TrapLinten({ v }: { v: number }) {
  useSpel((s) => s.fase);
  useSpel((s) => s.kluizen);
  useSpel((s) => s.docent);
  const trappen = (huidig().plan?.trappen ?? []).filter((tr) => (tr.vanaf || tr.klus) && (tr.van === v || tr.van + 1 === v) && !trapOpen(tr));
  return (
    <>
      {trappen.map((tr, i) => {
        const onder = tr.van === v;
        const [x, z] = trapOp(tr, onder ? -0.06 : 1.06);
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, tr.as === 'x' ? Math.PI / 2 : 0, 0]}>
            <AfzetLint breed={tr.breed + 0.3} />
          </group>
        );
      })}
    </>
  );
}

/** Rechthoek van een stuk trap (van t0 tot t1) als botsvak, eventueel iets breder. */
function trapVak(tr: Trap, t0: number, t1: number, extra = 0) {
  const [ax, az] = trapOp(tr, (t0 + t1) / 2);
  const l = (t1 - t0) * tr.lengte;
  const b = tr.breed + extra;
  if (tr.as === 'x') box(ax, az, l, b, 'muur');
  else box(ax, az, b, l, 'muur');
}

/** Botsingen van het hele gebouw: elke verdieping op haar eigen laag, plus de trappen. */
export function registreerPlan(plan: Plattegrond) {
  for (const v of verdiepingen(plan)) opLaag(v, () => registreerVerdieping(verdiepingPlan(plan, v)));
  (plan.trappen ?? []).forEach((tr, i) => {
    // Beneden en boven is de hele trap dicht: je stapt erop door er vlak voor te staan en
    // de trap op (of af) te lopen. Zo loopt een route op dezelfde verdieping er netjes omheen.
    opLaag(tr.van, () => trapVak(tr, 0, 1.02, 0.1));
    opLaag(tr.van + 1, () => trapVak(tr, -0.02, 1.0, 0.1));
    // op de trap zelf: leuningen links en rechts
    opLaag(`trap${i}`, () => {
      const [mx, mz] = tr.pos;
      const zij = tr.breed / 2 + 0.15;
      const l = tr.lengte + 0.6;
      if (tr.as === 'x') {
        box(mx, mz - zij, l, 0.3, 'muur');
        box(mx, mz + zij, l, 0.3, 'muur');
      } else {
        box(mx - zij, mz, 0.3, l, 'muur');
        box(mx + zij, mz, 0.3, l, 'muur');
      }
    });
  });
}

/** Draaiing van de uitgangsdeur: lokaal +z wijst naar binnen. */
export function uitgangRot(plan: Plattegrond) {
  const [x, z] = plan.uitgang.pos;
  if (plan.uitgang.as === 'x') return kamerOp(plan, x, z + 0.5) ? 0 : Math.PI;
  return kamerOp(plan, x + 0.5, z) ? Math.PI / 2 : -Math.PI / 2;
}

// ── Vast deel: sokkel, vloeren, lichtplekken ─────────────────────────────

export function Sokkel({ plan }: { plan: Plattegrond }) {
  const g = grenzen(plan);
  const rand = 1.6;
  const W = g.w + rand * 2;
  const D = g.d + rand * 2;
  const [mx, mz] = g.midden;
  return (
    <group position={[mx, 0, mz]}>
      <Blok size={[W, 1.1, D]} pos={[0, -0.56, 0]} color="#5b3d28" r={0.12} />
      <Blok size={[W + 0.4, 0.5, D + 0.4]} pos={[0, -1.2, 0]} color="#3a271a" r={0.12} />
      {/* lijst rondom, zoals een fotolijst */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Blok size={[W, 0.16, 0.5]} pos={[0, 0.06, s * (D / 2 - 0.25)]} color="#3f2a1c" r={0.05} />
          <Blok size={[0.5, 0.16, D]} pos={[s * (W / 2 - 0.25), 0.06, 0]} color="#3f2a1c" r={0.05} />
        </group>
      ))}
      {/* koperen hoekjes */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Blok key={i} size={[0.7, 0.2, 0.7]} pos={[sx * (W / 2 - 0.35), 0.08, sz * (D / 2 - 0.35)]} color="#c49a55" r={0.06} />
      ))}
      {/* buitenvloer rond het huis */}
      <Blok size={[W - 1, 0.04, D - 1]} pos={[0, -0.01, 0]} color="#4a3324" r={0.01} shadow={false} />
    </group>
  );
}

/** Rechthoek van een trap [minX, maxX, minZ, maxZ]. */
function trapRechthoek(tr: Trap) {
  const hl = tr.lengte / 2;
  const hb = tr.breed / 2;
  return tr.as === 'x' ? [tr.pos[0] - hl, tr.pos[0] + hl, tr.pos[1] - hb, tr.pos[1] + hb] : [tr.pos[0] - hb, tr.pos[0] + hb, tr.pos[1] - hl, tr.pos[1] + hl];
}

/** Hoe diep de groefjes in een vloer zijn, en hoe glad hij is (tegels en steen glanzen meer). */
const VLOER_RELIEF: Partial<Record<Vloer, number>> = { planken: 1.0, visgraat: 1.0, vlonder: 1.3, tegels: 0.7, steen: 1.4, kinderkopjes: 1.5, grind: 1.4, beton: 0.5, asfalt: 0.7, tapijt: 0.5, gras: 1, zand: 0.7, sneeuw: 0.5, terrazzo: 0.25 };
/** Ruwheid: gepolijste vloeren (terrazzo, tegels, gelakt hout) weerspiegelen de omgeving zacht. */
const VLOER_GLANS: Partial<Record<Vloer, number>> = { planken: 0.5, visgraat: 0.42, tegels: 0.3, terrazzo: 0.24, steen: 0.66, beton: 0.72, rubber: 0.85, rooster: 0.5, tapijt: 1 };

function KamerVloer({ k, gaten = [] }: { k: Kamer; gaten?: number[][] }) {
  const soort = k.vloer ?? 'planken';
  const basis = vloerTextuur(soort, k.vloerKleur ?? VLOER_KLEUR[soort]);
  const t = useMemo(() => {
    const c = basis.clone();
    c.needsUpdate = true;
    if (gaten.length) c.repeat.set(1, 1);
    else c.repeat.set(k.maat[0] / 4, k.maat[1] / 4);
    return c;
  }, [basis, k.maat, gaten.length]);
  const rel = useMemo(() => relief(t, VLOER_RELIEF[soort] ?? 1), [t, soort]);
  // Met een trapgat: vloer als vorm met gaten (uv in meters / 4, net als de textuur).
  const geo = useMemo(() => {
    if (!gaten.length) return null;
    const [w, d] = k.maat;
    const vorm = new THREE.Shape([new THREE.Vector2(-w / 2, -d / 2), new THREE.Vector2(w / 2, -d / 2), new THREE.Vector2(w / 2, d / 2), new THREE.Vector2(-w / 2, d / 2)]);
    for (const [x0, x1, z0, z1] of gaten) {
      const a = [x0 - k.pos[0], x1 - k.pos[0], -(z1 - k.pos[1]), -(z0 - k.pos[1])];
      vorm.holes.push(new THREE.Path([new THREE.Vector2(a[0], a[2]), new THREE.Vector2(a[0], a[3]), new THREE.Vector2(a[1], a[3]), new THREE.Vector2(a[1], a[2])]));
    }
    const g = new THREE.ShapeGeometry(vorm);
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 4, p.getY(i) / 4);
    return g;
  }, [gaten, k.maat, k.pos]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[k.pos[0], 0.012, k.pos[1]]} receiveShadow geometry={geo ?? undefined}>
      {!geo && <planeGeometry args={[k.maat[0], k.maat[1]]} />}
      <meshStandardMaterial map={t} roughness={k.buiten ? 0.95 : VLOER_GLANS[soort] ?? 0.8} {...(rel ?? {})} />
    </mesh>
  );
}

/** Rand van een verdiepingsvloer (zie je van buiten tussen de verdiepingen). */
function VloerRand({ k, kleur }: { k: Kamer; kleur: string }) {
  const [x, z] = k.pos;
  const [w, d] = k.maat;
  return (
    <group position={[x, -0.16, z]}>
      <Blok size={[w, 0.32, 0.32]} pos={[0, 0, d / 2 - 0.16]} color={kleur} r={0.02} />
      <Blok size={[w, 0.32, 0.32]} pos={[0, 0, -d / 2 + 0.16]} color={kleur} r={0.02} />
      <Blok size={[0.32, 0.32, d]} pos={[w / 2 - 0.16, 0, 0]} color={kleur} r={0.02} />
      <Blok size={[0.32, 0.32, d]} pos={[-w / 2 + 0.16, 0, 0]} color={kleur} r={0.02} />
    </group>
  );
}

/** Trap van stenen treden met een leuning. Staat op de verdieping onderaan. */
function TrapModel({ tr, HV }: { tr: Trap; HV: number }) {
  const n = Math.max(6, Math.round(HV / 0.2));
  const stap = tr.lengte / n;
  const delen: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const [x, z] = trapOp(tr, (k + 0.5) / n);
    const top = ((k + 1) / n) * HV;
    delen.push(<Blok key={k} size={tr.as === 'x' ? [stap + 0.01, top, tr.breed] : [tr.breed, top, stap + 0.01]} pos={[x, top / 2, z]} color={k % 2 ? '#6f6a72' : '#77727a'} r={0.02} />);
    delen.push(<Blok key={`t${k}`} size={tr.as === 'x' ? [stap + 0.02, 0.05, tr.breed + 0.04] : [tr.breed + 0.04, 0.05, stap + 0.02]} pos={[x, top + 0.02, z]} color="#5a4030" r={0.01} shadow={false} />);
  }
  // leuning aan beide kanten (palen + schuine stang)
  const leuning = [-1, 1].map((kant) => {
    const zij = tr.breed / 2 + 0.08;
    const pt = (t: number): [number, number, number] => {
      const [x, z] = trapOp(tr, t);
      const y = t * HV + 1.0;
      return tr.as === 'x' ? [x, y, z + kant * zij] : [x + kant * zij, y, z];
    };
    const a = pt(0);
    const b = pt(1);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const hoek = Math.atan2(HV, tr.lengte);
    const palen = Math.max(3, Math.round(tr.lengte / 1.2));
    return (
      <group key={kant}>
        {Array.from({ length: palen + 1 }, (_, i) => {
          const p = pt(i / palen);
          return (
            <mesh key={i} position={[p[0], p[1] - 0.5, p[2]]} material={mat('#2a2328', { metal: 0.4, rough: 0.5 })}>
              <cylinderGeometry args={[0.03, 0.03, 1.0, 6]} />
            </mesh>
          );
        })}
        <mesh
          position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]}
          rotation={tr.as === 'x' ? [0, 0, (Math.PI / 2 - hoek) * -tr.richting] : [(Math.PI / 2 - hoek) * tr.richting, 0, 0]}
          material={mat('#4a3424')}
        >
          <cylinderGeometry args={[0.04, 0.04, l, 8]} />
        </mesh>
      </group>
    );
  });
  return (
    <>
      {delen}
      {leuning}
    </>
  );
}

function Lichtplek({ pos, r = 3.6 }: { pos: V2; r?: number }) {
  const t = lichtTex();
  const m = useMemo(() => new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [t]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], 0.03, pos[1]]} material={m}>
      <planeGeometry args={[r * 2, r * 2]} />
    </mesh>
  );
}

/** Kozijnen van alle doorgangen (vast, samengevoegd). */
function Kozijn({ d }: { d: Doorgang }) {
  const b = breedte(d);
  const lijst = '#3f2a1c';
  if (d.soort === 'open' || d.soort === 'raam' || d.soort === 'valhek') return null;
  if (d.soort === 'pui')
    return (
      <group position={[d.pos[0], 0, d.pos[1]]} rotation={[0, d.as === 'z' ? Math.PI / 2 : 0, 0]}>
        <PuiKozijn b={b} deur={d.deurBreed ?? 2} />
      </group>
    );
  if (d.soort === 'roldeur')
    return (
      <group position={[d.pos[0], 0, d.pos[1]]} rotation={[0, d.as === 'z' ? Math.PI / 2 : 0, 0]}>
        {[-1, 1].map((k) => (
          <Blok key={k} size={[0.16, ROLDEUR_H, MUUR_D + 0.12]} pos={[(k * (b - 0.16)) / 2, ROLDEUR_H / 2, 0]} color="#5d646b" r={0.01} />
        ))}
      </group>
    );
  return (
    <group position={[d.pos[0], 0, d.pos[1]]} rotation={[0, d.as === 'z' ? Math.PI / 2 : 0, 0]}>
      <Blok size={[0.14, DEUR_H, MUUR_D + 0.1]} pos={[-b / 2 + 0.07, DEUR_H / 2, 0]} color={lijst} r={0.02} />
      <Blok size={[0.14, DEUR_H, MUUR_D + 0.1]} pos={[b / 2 - 0.07, DEUR_H / 2, 0]} color={lijst} r={0.02} />
      <Blok size={[b, 0.14, MUUR_D + 0.1]} pos={[0, DEUR_H - 0.07, 0]} color={lijst} r={0.02} />
    </group>
  );
}

/** Zit deze doorgang in een echte muur (en niet in een heg of tussen twee buitenruimtes)? */
export function inMuur(plan: Plattegrond, d: Doorgang) {
  const [x, z] = d.pos;
  const [a, b] = d.as === 'x' ? [kamerOp(plan, x, z - 0.25), kamerOp(plan, x, z + 0.25)] : [kamerOp(plan, x - 0.25, z), kamerOp(plan, x + 0.25, z)];
  return binnenKamer(a) || binnenKamer(b);
}

/** Rand van een buitenruimte (heg, hek, reling, muurtje). */
function Rand({ r }: { r: RandStuk }) {
  const a: V2 = r.as === 'x' ? [r.s, r.c] : [r.c, r.s];
  const b: V2 = r.as === 'x' ? [r.e, r.c] : [r.c, r.e];
  if (r.soort === 'heg') return <Heg a={a} b={b}  seed={Math.round(r.s * 7 + r.c * 3)} />;
  if (r.soort === 'hek') return <Hekwerk a={a} b={b} />;
  if (r.soort === 'reling') return <Reling a={a} b={b} />;
  if (r.soort === 'muurtje') {
    const p = huidig().plan;
    return <Muurtje a={a} b={b} kleur={r.kamer.gevel ?? (p?.gevelSoort === 'pleister' ? '#cfc8b8' : '#9c5a43')} kantelen={!!p?.kantelen} />;
  }
  if (r.soort === 'spijlen') return <Spijlenhek a={a} b={b} />;
  if (r.soort === 'balustrade') return <Balustrade a={a} b={b} />;
  return null;
}

/** Vast deel van het gebouw: sokkel (alleen zonder eigen omgeving), vloeren, kozijnen, randen en warme lichtplekken. */
export function GebouwVast({ plan, sokkel = true }: { plan: Plattegrond; sokkel?: boolean }) {
  const { randen, muren } = indeling(plan);
  const v = plan.deelVan?.verdieping ?? 0;
  const heel = plan.deelVan?.plan ?? plan;
  const HV = verdiepingHoogte(heel);
  const trappen = heel.trappen ?? [];
  // trapgaten in de vloer van deze verdieping (trappen die hier boven uitkomen)
  const gatenVan = (k: Kamer) =>
    trappen
      .filter((tr) => tr.van + 1 === v)
      .map(trapRechthoek)
      .filter(([x0, x1, z0, z1]) => x1 > k.pos[0] - k.maat[0] / 2 && x0 < k.pos[0] + k.maat[0] / 2 && z1 > k.pos[1] - k.maat[1] / 2 && z0 < k.pos[1] + k.maat[1] / 2);
  return (
    <>
      {sokkel && <Sokkel plan={plan} />}
      {trappen
        .filter((tr) => tr.van === v)
        .map((tr, i) =>
          tr.soort === 'roltrap' ? <RoltrapModel key={`trap${i}`} tr={tr} HV={HV} pt={(t) => trapOp(tr, t)} /> : <TrapModel key={`trap${i}`} tr={tr} HV={HV} />,
        )}
      {plan.kamers
        .filter((k) => k.kolommen)
        .map((k) => (
          <Kolommen key={`kol-${k.id}`} k={k} h={kamerHoogte(plan, k) || (plan.muurHoogte ?? 3.2)} />
        ))}
      {muren
        .filter((m) => m.glas)
        .map((m) => (
          <GlasWand key={m.key} a={m.as === 'x' ? [m.s, m.c] : [m.c, m.s]} b={m.as === 'x' ? [m.e, m.c] : [m.c, m.e]} van={m.vanY} h={m.h} />
        ))}
      {v > 0 && plan.kamers.map((k) => <VloerRand key={`r${k.id}`} k={k} kleur={heel.gevelSoort === 'pleister' ? '#d6cebe' : k.buiten ? '#5f5a62' : '#4f4a52'} />)}
      {/* onderkant van een galerijvloer die boven een hoge ruimte (vide) hangt: dat is daar het plafond */}
      {v > 0 &&
        plan.kamers
          .filter((k) => !k.buiten && !k.zonderVloer && kamerHoogte(heel, kamerOp(heel, k.pos[0], k.pos[1], v - 1)) > HV - 0.4)
          .map((k) => (
            <mesh key={`o${k.id}`} position={[k.pos[0], -0.32, k.pos[1]]} rotation={[Math.PI / 2, 0, 0]} material={plafondMat(k.plafondKleur ? `hout|${k.plafondKleur}` : 'pleister|')}>
              <planeGeometry args={[k.maat[0], k.maat[1]]} />
            </mesh>
          ))}
      {plan.doorgangen.filter((d) => inMuur(plan, d)).map((d, i) => (
        <Kozijn key={i} d={d} />
      ))}
      {plan.kamers
        .filter((k) => !k.zonderVloer)
        .map((k) => (
          <KamerVloer key={k.id} k={k} gaten={gatenVan(k)} />
        ))}
      {randen.map((r) => (
        <Rand key={r.key} r={r} />
      ))}
      {plan.kamers.flatMap((k) => (k.lampen ?? []).map((p, i) => <Lichtplek key={`${k.id}-${i}`} pos={p} />))}
    </>
  );
}

// ── Muren die wegzakken aan de camerakant ─────────────────────────────────

/** Standaardmateriaal met een getekende textuur, plus reliëf (groefjes) en glansverschil uit diezelfde textuur. */
function metReliëf(opts: THREE.MeshStandardMaterialParameters & { map: THREE.Texture }, sterkte = 1, glans = 1) {
  const r = relief(opts.map, sterkte, glans);
  return new THREE.MeshStandardMaterial({ ...opts, ...(r ?? {}), normalScale: new THREE.Vector2(1, 1) });
}


function gevelMat(kleur: string, H: number) {
  const key = `gevel|${kleur}|${H}`;
  let m = muurMatCache.get(key);
  if (!m) {
    m = metReliëf({ map: gevelTextuur(kleur, H), roughness: 0.95 }, 1.6);
    muurMatCache.set(key, m);
  }
  return m;
}

function steenMat(kleur: string, H: number, buiten: boolean) {
  const key = `steen|${kleur}|${H}|${buiten}`;
  let m = muurMatCache.get(key);
  if (!m) {
    m = metReliëf({ map: steenTextuur(kleur, H, buiten), roughness: 0.96 }, 2);
    muurMatCache.set(key, m);
  }
  return m;
}

/** Buitenkant van een muur: de soort van de kamer erachter (of van het gebouw), de kleur van de buitenruimte (of van het gebouw). */
function gevelMateriaal(soort: Kamer['buitenGevel'], kleur: string, H: number, gevel = false) {
  const m = gevelBasis(soort, kleur, H);
  if (gevel) m.userData.gevel = true;
  return m;
}
function gevelBasis(soort: Kamer['buitenGevel'], kleur: string, H: number) {
  if (soort === 'steen') return steenMat(kleur, H, true);
  if (soort === 'pleister' || soort === 'vakwerk') {
    const key = `${soort}|${kleur}|${H}`;
    let m = muurMatCache.get(key);
    if (!m) {
      m = metReliëf({ map: soort === 'pleister' ? pleisterTextuur(kleur, H) : vakwerkTextuur(kleur, H), roughness: 0.93 }, soort === 'pleister' ? 1.4 : 1.2);
      muurMatCache.set(key, m);
    }
    return m;
  }
  return gevelMat(kleur, H);
}

function muurMateriaal(k: Kamer | undefined, H: number, gevel = '#8b5a45', gevelSoort: Plattegrond['gevelSoort'] = 'baksteen') {
  const buiten = (kleur: string) => gevelMateriaal(gevelSoort, kleur, H);
  if (!k) return buiten(gevel);
  if (k.buiten) return buiten(k.gevel ?? gevel);
  if (k.muurSoort === 'steen') return steenMat(k.muur ?? '#8a8580', H, false);
  const key = `${k.muur ?? '#d8c7a6'}|${k.lambrisering ?? '#7a5236'}|${H}`;
  let m = muurMatCache.get(key);
  if (!m) {
    m = metReliëf({ map: muurTextuur(k.muur ?? '#d8c7a6', k.lambrisering ?? '#7a5236', H), roughness: 0.92 }, 0.9);
    muurMatCache.set(key, m);
  }
  return m;
}
const muurMatCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Half muurplaatje (één kant van een muur): x van −0,5 tot 0,5 (langs de muur), y van 0 tot 1, z van 0 tot 1
 * (van het midden van de muur naar buiten). Wordt per muurstuk geschaald en gedraaid.
 */
const MUUR_PLAAT = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0.5);
const plaatO = new THREE.Object3D();

/**
 * Muurmateriaal voor de instanced muren. De uv komt uit de plek van het hoekpunt: horizontaal elke 1,2 m
 * herhalen, verticaal over de echte muurhoogte (zodat lambrisering en het stuk boven een deur kloppen).
 * Bovenkant en kopse kanten krijgen het donkere bovenrandje van de textuur.
 */
const instMatCache = new Map<string, THREE.MeshStandardMaterial>();
function instMuurMateriaal(basis: THREE.MeshStandardMaterial, H: number, aan?: Plattegrond['aanlicht']) {
  const gloed = basis.userData.gevel ? aan : undefined;
  const key = `${basis.uuid}|${H}|${gloed ? JSON.stringify(gloed) : ''}`;
  let m = instMatCache.get(key);
  if (!m) {
    m = basis.clone();
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uMuurH = { value: H };
      // binnen: boven de gewone muurhoogte gaat het behang door (geen tweede lambrisering); gevels herhalen gewoon
      const v = basis.userData.gevel ? 'ip.y / uMuurH' : 'min( ip.y / uMuurH, 0.97 )';
      sh.vertexShader =
        `uniform float uMuurH;\n#define MUUR_V ${v}\n` +
        sh.vertexShader.replace(
          '#include <uv_vertex>',
          `#include <uv_vertex>
          #if defined( USE_INSTANCING ) && defined( USE_MAP )
            vec4 ip = instanceMatrix * vec4( position, 1.0 );
            vec2 as2 = normalize( vec2( instanceMatrix[0].x, instanceMatrix[0].z ) );
            float langs = dot( ip.xz, as2 );
            vec2 muv = abs( normal.z ) > 0.5 ? vec2( langs / 1.2, MUUR_V ) : vec2( 0.5, 0.995 );
            vMapUv = ( mapTransform * vec3( muv, 1.0 ) ).xy;
            #ifdef USE_NORMALMAP
              vNormalMapUv = ( normalMapTransform * vec3( muv, 1.0 ) ).xy;
            #endif
            #ifdef USE_ROUGHNESSMAP
              vRoughnessMapUv = ( roughnessMapTransform * vec3( muv, 1.0 ) ).xy;
            #endif
          #endif`,
        );
    };
    m.customProgramCacheKey = () => (basis.userData.gevel ? 'muur-inst-g' : 'muur-inst-b');
    metAanlicht(m, gloed);
    instMatCache.set(key, m);
  }
  return m;
}

const NUL = new THREE.Matrix4().makeScale(0, 0, 0);

// Huidige hoogte van elk muurstuk, zodat wat aan de muur hangt mee kan verdwijnen.
const muurStaten = new Map<number, { stukken: MuurStuk[]; hoogte: number[]; H: number }>();

/** Hoe hoog staat de muur op dit punt nu (op verdieping v)? Volle hoogte als er geen muur is. */
export function muurHoogteOp(x: number, z: number, v = 0) {
  const staat = muurStaten.get(v);
  if (!staat) return 3.2;
  const { stukken, hoogte, H } = staat;
  for (let i = 0; i < stukken.length; i++) {
    const m = stukken[i];
    if (m.vanY > 0) continue;
    const loodrecht = m.as === 'x' ? Math.abs(z - m.c) : Math.abs(x - m.c);
    const langs = m.as === 'x' ? x : z;
    if (loodrecht < 0.5 && langs >= m.s - 0.05 && langs <= m.e + 0.05) return hoogte[i];
  }
  return H;
}

/** Iets dat aan een muur hangt (schilderij, bord, plank). `bij` = punt op de muur. Gebruik in `Levend`. */
export function OpMuur({ bij, vast = false, children }: { bij: [number, number]; vast?: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const v = useContext(VerdiepingCtx);
  useFrame(() => {
    if (ref.current) ref.current.visible = muurHoogteOp(bij[0], bij[1], v) > 2.3;
  });
  // `vast`: hangt er alleen iets stils (bord, schilderij, plank)? Dan samengevoegd tot een paar tekenstappen.
  return <group ref={ref}>{vast ? <Statisch>{children}</Statisch> : children}</group>;
}

function Muren({ plan }: { plan: Plattegrond }) {
  const H = plan.muurHoogte ?? 3.2;
  const v = plan.deelVan?.verdieping ?? 0;
  const heel = plan.deelVan?.plan ?? plan;
  // het glas van etalagepuien tekent GebouwVast; hier alleen de echte muren
  const stukken = useMemo(() => muurStukken(plan).filter((m) => !m.glas), [plan]);
  const hoogte = useRef<number[]>(stukken.map((m) => m.h));
  const getoond = useRef<number[]>([]);
  useEffect(() => {
    muurStaten.set(v, { stukken, hoogte: hoogte.current, H });
    return () => {
      muurStaten.delete(v);
    };
  }, [stukken, H, v]);
  const { camera } = useThree();
  // Alle muren als halve plaatjes (per kant één), per materiaal samen in één InstancedMesh:
  // een paar tekenstappen voor de hele verdieping in plaats van twee per muurstuk.
  const groepen = useMemo(() => {
    const per = new Map<THREE.MeshStandardMaterial, { stuk: number; rot: number; kant: number }[]>();
    // binnenkant: het behang/de steen van de kamer; buitenkant (naar buiten of een buitenruimte): de gevel van de kamer erachter
    const kantVan = (hier?: Kamer, daar?: Kamer) => {
      if (hier && !hier.buiten) return muurMateriaal(hier, H, plan.gevel, plan.gevelSoort);
      const binnen = daar && !daar.buiten ? daar : undefined;
      return gevelMateriaal(binnen?.buitenGevel ?? plan.gevelSoort ?? 'baksteen', hier?.gevel ?? binnen?.gevel ?? plan.gevel ?? '#8b5a45', H, true);
    };
    stukken.forEach((m, i) => {
      const plusM = kantVan(m.plus, m.min);
      const minM = kantVan(m.min, m.plus);
      // draaiing zodat lokaal +z de buitenkant van dit halve plaatje is
      const [rp, rm] = m.as === 'x' ? [0, Math.PI] : [Math.PI / 2, -Math.PI / 2];
      for (const [mt, rot, kant] of [
        [plusM, rp, 0],
        [minM, rm, 1],
      ] as const) {
        if (!per.has(mt)) per.set(mt, []);
        per.get(mt)!.push({ stuk: i, rot, kant });
      }
    });
    return [...per].map(([basis, lijst]) => {
      const mesh = new THREE.InstancedMesh(MUUR_PLAAT, instMuurMateriaal(basis, H, heel.aanlicht), lijst.length);
      mesh.castShadow = true;
      mesh.layers.enable(SCHADUW_LAAG);
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      return { mesh, lijst };
    });
  }, [stukken, H, plan.gevel, plan.gevelSoort]);
  useEffect(() => () => groepen.forEach((g) => g.mesh.dispose()), [groepen]);
  // Kantelen: blokjes bovenop de buitenmuren (één tekenstap). Ze verdwijnen als hun muur zakt.
  const kantelen = useMemo(() => {
    if (!plan.kantelen) return null;
    const lijst: { stuk: number; m: THREE.Matrix4 }[] = [];
    const o = new THREE.Object3D();
    stukken.forEach((m, i) => {
      if (m.vanY > 0 || m.onder) return;
      const buiten = m.buiten !== 0 || !!m.min?.buiten || !!m.plus?.buiten;
      if (!buiten) return;
      // geen kantelen waar er nog een verdieping bovenop staat
      const mid = (m.s + m.e) / 2;
      const [ax, az] = m.as === 'x' ? [mid, m.c - 0.3] : [m.c - 0.3, mid];
      const [bx, bz] = m.as === 'x' ? [mid, m.c + 0.3] : [m.c + 0.3, mid];
      if (kamerOp(heel, ax, az, v + 1) || kamerOp(heel, bx, bz, v + 1)) return;
      // en ook niet waar een schuin dak op de muur rust
      const dakOp = (k?: Kamer) => !!heel.daken && !!k && !k.buiten && (k.dak ?? 'schild') !== 'geen';
      if (dakOp(m.plus) || dakOp(m.min)) return;
      const l = m.e - m.s;
      const n = Math.max(1, Math.floor(l / 0.95));
      for (let k = 0; k < n; k++) {
        const t = m.s + ((k + 0.5) / n) * l;
        o.position.set(m.as === 'x' ? t : m.c, m.h + 0.24, m.as === 'x' ? m.c : t);
        o.scale.set(m.as === 'x' ? 0.5 : MUUR_D + 0.08, 0.48, m.as === 'x' ? MUUR_D + 0.08 : 0.5);
        o.updateMatrix();
        lijst.push({ stuk: i, m: o.matrix.clone() });
      }
    });
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(plan.gevelSoort === 'steen' ? '#6f6a72' : donkerder(plan.gevel ?? '#8b5a45', 0.85), { rough: 0.95 }), Math.max(1, lijst.length));
    lijst.forEach((x, i) => mesh.setMatrixAt(i, x.m));
    mesh.count = lijst.length;
    mesh.castShadow = true;
    mesh.layers.enable(SCHADUW_LAAG);
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return { mesh, lijst, zicht: stukken.map(() => true) };
  }, [plan, stukken, H]);
  useEffect(() => () => kantelen?.mesh.dispose(), [kantelen]);
  useFrame((_, dt) => {
    const s = useSpel.getState();
    // Alleen de verdieping waar je bent, wordt opengewerkt. Lager: helemaal heel. Hoger: weg (zie Verdieping).
    const kv = kijkVerdieping();
    const titel = s.kaart === 'start' || s.kaart === 'werelden';
    const hoog = verdiepingen(heel).length > 1;
    // Titelscherm met verdiepingen: het hele kasteel staat er heel. Zonder verdiepingen: het opengewerkte poppenhuis.
    const eerste = (s.cameraStand === 'eerste' && s.modus === 'lopen') || v !== kv || (titel && hoog);
    let tx = speler.pos.x;
    let tz = speler.pos.z;
    if (s.modus !== 'lopen' && s.actief) {
      const st = stationVan(s.actief);
      if (st) [tx, tz] = st.pos;
    }
    // Sta je buiten (op een plein, in het bos)? Dan blijven de gevels staan: alleen wat tussen jou en de camera staat, zakt.
    const binnen = titel || s.modus !== 'lopen' || !!(kamerOp(heel, tx, tz, v) && !kamerOp(heel, tx, tz, v)!.buiten);
    let fx = tx - camera.position.x;
    let fz = tz - camera.position.z;
    const fl = Math.hypot(fx, fz) || 1;
    fx /= fl;
    fz /= fl;
    const px = -fz;
    const pz = fx;
    stukken.forEach((m, i) => {
      let laag = false;
      if (!eerste) {
        if (m.buiten && binnen) {
          const nx = m.as === 'z' ? m.buiten : 0;
          const nz = m.as === 'x' ? m.buiten : 0;
          if (-(nx * fx + nz * fz) > 0.2) laag = true;
        }
        if (!laag) {
          const mid = (m.s + m.e) / 2;
          const mx = m.as === 'x' ? mid : m.c;
          const mz = m.as === 'x' ? m.c : mid;
          const dx = mx - tx;
          const dz = mz - tz;
          const t = -(dx * fx + dz * fz);
          if (t > -0.3 && t < 9) {
            const lat = Math.abs(dx * px + dz * pz);
            const half = ((m.e - m.s) / 2) * Math.abs(m.as === 'x' ? px : pz);
            if (lat < half + 2.2) laag = true;
          }
        }
      }
      const doel = laag ? LAAG : m.h;
      hoogte.current[i] += (doel - hoogte.current[i]) * Math.min(1, dt * 7);
    });
    // instanties bijwerken (alleen als er een muur van hoogte veranderde)
    groepen.forEach(({ mesh, lijst }) => {
      let anders = false;
      lijst.forEach(({ stuk, rot, kant }, k) => {
        const m = stukken[stuk];
        const zicht = Math.max(0, Math.min(m.h - m.vanY, hoogte.current[stuk] - m.vanY));
        const afgerond = zicht < 0.02 ? 0 : Math.round(zicht * 500) / 500;
        if (getoond.current[stuk * 2 + kant] === afgerond && mesh.userData.klaar) return;
        getoond.current[stuk * 2 + kant] = afgerond;
        anders = true;
        if (afgerond === 0) {
          mesh.setMatrixAt(k, NUL);
          return;
        }
        const mid = (m.s + m.e) / 2;
        plaatO.position.set(m.as === 'x' ? mid : m.c, m.vanY, m.as === 'x' ? m.c : mid);
        plaatO.rotation.set(0, rot, 0);
        plaatO.scale.set(m.e - m.s, afgerond, MUUR_D / 2);
        plaatO.updateMatrix();
        mesh.setMatrixAt(k, plaatO.matrix);
      });
      if (anders) mesh.instanceMatrix.needsUpdate = true;
      mesh.userData.klaar = true;
    });
    if (kantelen) {
      let anders = false;
      const nul = NUL;
      stukken.forEach((_, i) => {
        const z = hoogte.current[i] > stukken[i].h - 0.12;
        if (z === kantelen.zicht[i]) return;
        kantelen.zicht[i] = z;
        anders = true;
        kantelen.lijst.forEach((x, k) => x.stuk === i && kantelen.mesh.setMatrixAt(k, z ? x.m : nul));
      });
      if (anders) kantelen.mesh.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      {kantelen && <primitive object={kantelen.mesh} />}
      {groepen.map(({ mesh }) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </group>
  );
}

// ── Ramen ───────────────────────────────────────────────────────────────

const RAAM_B = 1.3;
const RAAM_H = 1.5;
const RAAM_O = 0.95;
const warmGlas = new THREE.MeshStandardMaterial({ color: '#5a3f22', emissive: '#ffb45c', emissiveIntensity: 1.15, roughness: 0.35 });
const nachtGlas = new THREE.MeshStandardMaterial({ color: '#1a2633', roughness: 0.12, metalness: 0.4 });
const lijstMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });

/** Eén raam in lokale maat: muur langs x, +z = buitenkant. Lijst, roeden en vensterbanken in één vorm. */
function raamGeos() {
  const delen: THREE.BufferGeometry[] = [];
  const blok = (w: number, h: number, d: number, x: number, y: number, z: number, kleur: string) => {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.translate(x, y, z);
    const c = new THREE.Color(kleur);
    const n = g.attributes.position.count;
    g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n * 3 }, (_, i) => [c.r, c.g, c.b][i % 3]), 3));
    delen.push(g);
  };
  const D = MUUR_D + 0.1;
  const L = '#efe6d6';
  const midY = RAAM_O + RAAM_H / 2;
  blok(RAAM_B + 0.2, 0.12, D, 0, RAAM_O - 0.06, 0, L);
  blok(RAAM_B + 0.2, 0.12, D, 0, RAAM_O + RAAM_H + 0.06, 0, L);
  blok(0.1, RAAM_H, D, -RAAM_B / 2 - 0.05, midY, 0, L);
  blok(0.1, RAAM_H, D, RAAM_B / 2 + 0.05, midY, 0, L);
  for (const k of [1, -1]) {
    const z = k * (MUUR_D / 2 + 0.03);
    blok(0.06, RAAM_H, 0.04, 0, midY, z, L);
    blok(RAAM_B, 0.06, 0.04, 0, RAAM_O + RAAM_H * 0.62, z, L);
    blok(RAAM_B + 0.3, 0.06, 0.2, 0, RAAM_O - 0.1, k * (MUUR_D / 2 + 0.1), k > 0 ? '#b9b0a4' : '#7a5236');
  }
  const lijst = mergeGeometries(delen)!;
  const glas = (k: number) => {
    const g = new THREE.PlaneGeometry(RAAM_B, RAAM_H);
    if (k < 0) g.rotateY(Math.PI);
    g.translate(0, midY, k * (MUUR_D / 2 + 0.012));
    return g;
  };
  return { lijst, buiten: glas(1), binnen: glas(-1) };
}

/**
 * Ramen in de muren, op punten [x, z] op een muurlijn. Gebruik in `Levend`.
 * Aan de kant van een tuin, plein of buiten brandt warm licht achter het glas, binnen zie je donker nachtglas.
 * Alle ramen samen zijn drie tekenstappen; een raam verdwijnt als zijn muur zakt.
 */
/**
 * Maanlicht dat door een raam naar binnen valt: een zachte bundel van het raam schuin omlaag de kamer in.
 * In het raam-assenstelsel (raam in het midden, buiten = +z). Naar het eind toe vervaagt hij.
 */
let bundelGeo: THREE.BufferGeometry | null = null;
function maanBundelVorm() {
  if (bundelGeo) return bundelGeo;
  const L = 3.4;
  const w0 = RAAM_B * 0.42;
  const h0 = RAAM_H * 0.42;
  const w1 = w0 * 1.5;
  const h1 = h0 * 1.6;
  const zak = -L * 0.62;
  // vier hoeken bij het raam (a) en aan het eind (b)
  const a = [
    [-w0, -h0, -0.12],
    [w0, -h0, -0.12],
    [w0, h0, -0.12],
    [-w0, h0, -0.12],
  ];
  const b = [
    [-w1, zak - h1, -L],
    [w1, zak - h1, -L],
    [w1, zak + h1, -L],
    [-w1, zak + h1, -L],
  ];
  const pos: number[] = [];
  const uv: number[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    // zijvlak: a_i, a_j, b_j, b_i  (u = over de breedte 0..1, v = langs de bundel 0..1)
    const q = [a[i], a[j], b[j], b[i]];
    const qu = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    for (const k of [0, 1, 2, 0, 2, 3]) {
      pos.push(...q[k]);
      uv.push(...qu[k]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  bundelGeo = g;
  return g;
}
const maanBundelMat = new THREE.ShaderMaterial({
  uniforms: { uKleur: { value: new THREE.Color('#a9bcff') }, uSterkte: { value: 0.085 }, uTijd: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPlek;
    void main() {
      vUv = uv;
      vec4 p = vec4( position, 1.0 );
      #ifdef USE_INSTANCING
        p = instanceMatrix * p;
      #endif
      vPlek = ( modelMatrix * p ).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * p;
    }`,
  fragmentShader: `
    uniform vec3 uKleur;
    uniform float uSterkte;
    uniform float uTijd;
    varying vec2 vUv;
    varying vec3 vPlek;
    void main() {
      // zacht aan de randen, vervagend naar het eind, met een heel licht bewegend stofje
      float rand = 1.0 - pow( abs( vUv.x * 2.0 - 1.0 ), 2.0 );
      float lengte = pow( 1.0 - vUv.y, 1.6 );
      float stof = 0.85 + 0.15 * sin( vPlek.x * 3.1 + vPlek.y * 4.7 + uTijd * 0.6 ) * sin( vPlek.z * 2.3 - uTijd * 0.4 );
      gl_FragColor = vec4( uKleur * uSterkte * rand * lengte * stof, 1.0 );
    }`,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
});

export function Vensters({ punten }: { punten: (V2 | [number, number, number])[] }) {
  const { plan, v } = useVerdiepingPlan();
  const { meshes, stand } = useMemo(() => {
    const geos = raamGeos();
    const stand: { bij: V2; m: THREE.Matrix4 }[] = [];
    const o = new THREE.Object3D();
    for (const p of punten) {
      // derde getal: maat van het raam (1 = gewoon, 0,5 = klein kasteelraampje); het midden blijft op dezelfde hoogte
      const bij: V2 = [p[0], p[1]];
      const s = p[2] ?? 1;
      const m = muurStukken(plan).find(
        (m) => m.vanY === 0 && (m.as === 'x' ? Math.abs(bij[1] - m.c) < 0.4 && bij[0] >= m.s && bij[0] <= m.e : Math.abs(bij[0] - m.c) < 0.4 && bij[1] >= m.s && bij[1] <= m.e),
      );
      if (!m) {
        if (import.meta.env.DEV) console.warn('Raam niet op een muur:', bij);
        continue;
      }
      const buitenPlus = !m.plus || !!m.plus.buiten;
      o.position.set(m.as === 'x' ? bij[0] : m.c, (RAAM_O + RAAM_H / 2) * (1 - s), m.as === 'x' ? m.c : bij[1]);
      o.rotation.set(0, m.as === 'x' ? (buitenPlus ? 0 : Math.PI) : buitenPlus ? Math.PI / 2 : -Math.PI / 2, 0);
      o.scale.set(s, s, 1);
      o.updateMatrix();
      stand.push({ bij, m: o.matrix.clone() });
    }
    const maak = (g: THREE.BufferGeometry, mat: THREE.Material) => {
      const im = new THREE.InstancedMesh(g, mat, Math.max(1, stand.length));
      im.count = stand.length;
      stand.forEach((s, i) => im.setMatrixAt(i, s.m));
      im.receiveShadow = true;
      im.computeBoundingSphere();
      im.frustumCulled = false;
      return im;
    };
    const lijst = [maak(geos.lijst, lijstMat), maak(geos.buiten, warmGlas), maak(geos.binnen, nachtGlas)];
    // 's nachts (zaklampwereld): maanlicht valt door de ramen naar binnen
    if (huidig().sfeer?.zaklamp) {
      const b = maak(maanBundelVorm(), maanBundelMat);
      b.receiveShadow = false;
      b.castShadow = false;
      b.renderOrder = 4;
      lijst.push(b);
    }
    return { meshes: lijst, stand };
  }, [plan, punten]);
  const zicht = useRef<boolean[]>([]);
  const nul = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);
  useFrame(({ clock }) => {
    maanBundelMat.uniforms.uTijd.value = clock.getElapsedTime();
    let anders = false;
    stand.forEach((s, i) => {
      const z = muurHoogteOp(s.bij[0], s.bij[1], v) > 2.3;
      if (zicht.current[i] === z) return;
      zicht.current[i] = z;
      anders = true;
      for (const im of meshes) im.setMatrixAt(i, z ? s.m : nul);
    });
    if (anders) for (const im of meshes) im.instanceMatrix.needsUpdate = true;
  });
  useEffect(() => () => meshes.forEach((m) => m.dispose()), [meshes]);
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
}

// ── Deuren ────────────────────────────────────────────────────────────────

const FASE_NAAM: Record<string, string> = Object.fromEntries(FASES.map((f) => [f.id, f.kort]));

function Hangslot({ kleur }: { kleur: string }) {
  return (
    <group>
      <Blok size={[0.2, 0.18, 0.08]} color={kleur} r={0.03} />
      <mesh position={[0, 0.12, 0]} material={mat('#c9cfcc', { metal: 0.6, rough: 0.35 })}>
        <torusGeometry args={[0.065, 0.018, 8, 16, Math.PI]} />
      </mesh>
    </group>
  );
}

function DeurBlad({ b, kleur, slot, onKlik }: { b: number; kleur: string; slot: string | null; onKlik: () => void }) {
  // samengevoegd tot een paar tekenstappen; gaat het slot eraf, dan opnieuw
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (!wasSlepen()) onKlik();
      }}
    >
      <Statisch key={slot ?? 'open'}>
      <Blok size={[b, 2.32, 0.07]} pos={[b / 2, 1.16, 0]} color={kleur} r={0.02} />
      <Blok size={[b - 0.3, 0.8, 0.09]} pos={[b / 2, 1.65, 0]} color={donkerder(kleur, 1.15)} r={0.02} shadow={false} />
      <Blok size={[b - 0.3, 0.8, 0.09]} pos={[b / 2, 0.62, 0]} color={donkerder(kleur, 1.15)} r={0.02} shadow={false} />
      <mesh position={[b - 0.16, 1.1, 0.07]} material={mat('#d4ad62', { metal: 0.7, rough: 0.3 })}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
      <mesh position={[b - 0.16, 1.1, -0.07]} material={mat('#d4ad62', { metal: 0.7, rough: 0.3 })}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
      {slot && (
        <>
          <group position={[b - 0.16, 0.92, 0.08]}>
            <Hangslot kleur={slot} />
          </group>
          <group position={[b - 0.16, 0.92, -0.08]} rotation={[0, Math.PI, 0]}>
            <Hangslot kleur={slot} />
          </group>
        </>
      )}
      </Statisch>
    </group>
  );
}

/** Laag tuinhekje (deur in een heg of hek). */
function Hekje({ b, slot, onKlik }: { b: number; slot: string | null; onKlik: () => void }) {
  const n = Math.max(3, Math.round(b / 0.16));
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (!wasSlepen()) onKlik();
      }}
    >
      <Statisch key={slot ?? 'open'}>
      <Blok size={[b, 0.07, 0.05]} pos={[b / 2, 0.3, 0]} color="#efe6d6" r={0.01} />
      <Blok size={[b, 0.07, 0.05]} pos={[b / 2, 0.85, 0]} color="#efe6d6" r={0.01} />
      {Array.from({ length: n }, (_, i) => (
        <Blok key={i} size={[0.08, 1.0, 0.03]} pos={[((i + 0.5) / n) * b, 0.55, 0.04]} color="#efe6d6" r={0.01} shadow={false} />
      ))}
      {slot && (
        <group position={[b - 0.12, 0.62, 0.09]}>
          <Hangslot kleur={slot} />
        </group>
      )}
      </Statisch>
    </group>
  );
}

function Deur({ d, i, laag = false }: { d: Doorgang; i: number; laag?: boolean }) {
  const id = deurId(d, i);
  const fase = useSpel((s) => s.fase);
  const docent = useSpel((s) => s.docent);
  useSpel((s) => s.kluizen);
  const open = deurOpen(d, fase, docent);
  const was = useRef(open);
  const hoek = useRef(open ? 1 : 0);
  const links = useRef<THREE.Group>(null);
  const rechts = useRef<THREE.Group>(null);
  const b = breedte(d);
  const dubbel = d.soort === 'dubbel';
  useEffect(() => {
    if (open && !was.current) {
      verwijder(id);
      geluid('deur');
      useSpel.getState().setMelding('Er gaat een deur open!');
    }
    was.current = open;
  }, [open, id]);
  useFrame((_, dt) => {
    hoek.current += ((open ? 1 : 0) - hoek.current) * Math.min(1, dt * 2.5);
    if (links.current) links.current.rotation.y = -hoek.current * 1.45;
    if (rechts.current) rechts.current.rotation.y = hoek.current * 1.45;
  });
  const klus = d.klus ? huidig().klussen.find((k) => k.id === d.klus) : undefined;
  const slot = open ? null : (klus?.kleur ?? '#ff8a3d');
  const klik = () => {
    if (open) return;
    geluid('bijna');
    useSpel.getState().setMelding(klus ? `Deze deur gaat open met de sleutel van ${klus.naam.toLowerCase()}.` : `Deze deur gaat open bij "${FASE_NAAM[d.vanaf ?? ''] ?? 'later'}".`);
  };
  if (laag)
    return (
      <group position={[d.pos[0], 0, d.pos[1]]} rotation={[0, d.as === 'z' ? Math.PI / 2 : 0, 0]}>
        {d.soort !== 'boog' && (
          <group ref={links} position={[-b / 2 + 0.08, 0, 0]}>
            <Hekje b={b - 0.16} slot={slot} onKlik={klik} />
          </group>
        )}
      </group>
    );
  // open doorgang (met rolhek), roldeur en etalagepui: alles schuift of rolt in plaats van te draaien
  if (d.soort === 'raam') return null;
  if (d.soort === 'open' || d.soort === 'roldeur' || d.soort === 'pui' || d.soort === 'valhek') {
    const hoog = d.soort === 'pui' ? 2.5 : Math.min(openingHoog(d), d.soort === 'roldeur' ? ROLDEUR_H : d.soort === 'valhek' ? 3.2 : PUI_H);
    return (
      <group position={[d.pos[0], 0, d.pos[1]]} rotation={[0, d.as === 'z' ? Math.PI / 2 : 0, 0]}>
        {d.soort === 'pui' && <SchuifDeuren breed={d.deurBreed ?? 2} open={hoek} />}
        {d.soort === 'open' && (d.vanaf || d.klus) && <Rolluik breed={b} hoog={hoog} open={hoek} />}
        {d.soort === 'roldeur' && <Rolluik breed={b - 0.16} hoog={hoog} open={hoek} dicht />}
        {d.soort === 'valhek' && <Rolluik breed={b} hoog={hoog} open={hoek} valhek />}
        {slot && (
          <group position={[0, 1.05, 0.12]}>
            <Hangslot kleur={slot} />
          </group>
        )}
        {!open && (
          <mesh
            position={[0, hoog / 2, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (!wasSlepen()) klik();
            }}
          >
            <planeGeometry args={[d.soort === 'pui' ? (d.deurBreed ?? 2) : b, hoog]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    );
  }
  return (
    <group position={[d.pos[0], 0, d.pos[1]]} rotation={[0, d.as === 'z' ? Math.PI / 2 : 0, 0]}>
      {d.soort !== 'boog' &&
        (dubbel ? (
          <>
            <group ref={links} position={[-b / 2 + 0.14, 0, 0]}>
              <DeurBlad b={b / 2 - 0.14} kleur="#6a4429" slot={slot} onKlik={klik} />
            </group>
            <group ref={rechts} position={[b / 2 - 0.14, 0, 0]} rotation={[0, Math.PI, 0]}>
              <DeurBlad b={b / 2 - 0.14} kleur="#6a4429" slot={null} onKlik={klik} />
            </group>
          </>
        ) : (
          <group ref={links} position={[-b / 2 + 0.14, 0, 0]}>
            <DeurBlad b={b - 0.28} kleur="#6a4429" slot={slot} onKlik={klik} />
          </group>
        ))}
    </group>
  );
}

/** Bewegend deel van het gebouw: muren (wegzakken) en deuren. */
/**
 * Plafonds van de binnenkamers, met een gat waar een trap naar boven gaat. Alleen zichtbaar als je door
 * je eigen ogen kijkt (in het poppenhuis kijk je er juist van boven in). Van boven zie je ze als dak.
 */
function Plafonds({ plan }: { plan: Plattegrond }) {
  const ref = useRef<THREE.Group>(null);
  const v = plan.deelVan?.verdieping ?? 0;
  const heel = plan.deelVan?.plan ?? plan;
  const delen = useMemo(() => {
    const gaten = (heel.trappen ?? []).filter((t) => t.van === v).map(trapRechthoek);
    const per = new Map<string, THREE.BufferGeometry[]>();
    for (const k of plan.kamers) {
      if (k.buiten) continue;
      // glas, open lucht en gewelf hebben geen vlak plafond (zie bouwdelen.tsx)
      if (k.plafond && k.plafond !== 'vlak' && k.plafond !== 'spanten' && k.plafond !== 'systeem') continue;
      const [x0, x1, z0, z1] = [k.pos[0] - k.maat[0] / 2, k.pos[0] + k.maat[0] / 2, k.pos[1] - k.maat[1] / 2, k.pos[1] + k.maat[1] / 2];
      const vorm = new THREE.Shape([new THREE.Vector2(x0, z0), new THREE.Vector2(x1, z0), new THREE.Vector2(x1, z1), new THREE.Vector2(x0, z1)]);
      for (const [a0, a1, b0, b1] of gaten) {
        const g = [Math.max(a0, x0 + 0.05), Math.min(a1, x1 - 0.05), Math.max(b0, z0 + 0.05), Math.min(b1, z1 - 0.05)];
        if (g[1] - g[0] < 0.2 || g[3] - g[2] < 0.2) continue;
        vorm.holes.push(new THREE.Path([new THREE.Vector2(g[0], g[2]), new THREE.Vector2(g[0], g[3]), new THREE.Vector2(g[1], g[3]), new THREE.Vector2(g[1], g[2])]));
      }
      const geo = new THREE.ShapeGeometry(vorm);
      const p = geo.attributes.position as THREE.BufferAttribute;
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2, p.getY(i) / 2);
      geo.rotateX(Math.PI / 2).translate(0, kamerHoogte(plan, k) - 0.005, 0);
      const soort = k.plafond === 'systeem' ? 'systeem|' : `${k.muurSoort === 'steen' ? 'steen' : 'hout'}|${k.plafondKleur ?? ''}`;
      if (!per.has(soort)) per.set(soort, []);
      per.get(soort)!.push(geo.index ? geo.toNonIndexed() : geo);
    }
    return [...per].map(([soort, geos]) => ({ soort, geo: mergeGeometries(geos)! }));
  }, [plan, heel, v]);
  const bijzonder = useMemo(
    () =>
      bijzonderePlafonds(
        plan.kamers,
        (k) => kamerHoogte(plan, k),
        (k) => (kamerOp(heel, k.pos[0], k.pos[1], v + 1) ? verdiepingHoogte(heel) - kamerHoogte(plan, k) - 0.05 : Infinity),
      ),
    [plan, heel, v],
  );
  useEffect(() => () => delen.forEach((d) => d.geo.dispose()), [delen]);
  useEffect(() => () => Object.values(bijzonder).forEach((g) => g?.dispose()), [bijzonder]);
  useFrame(() => {
    if (ref.current) ref.current.visible = eersteLopen();
  });
  return (
    <group ref={ref} visible={false}>
      {delen.map((d) => (
        <mesh key={d.soort} geometry={d.geo} material={plafondMat(d.soort)} receiveShadow />
      ))}
      <PlafondDelen delen={bijzonder} vlakMat={plafondMat(plan.kamers.some((k) => k.plafond === 'gewelf' && k.muurSoort === 'steen') ? 'steen|' : 'pleister|')} />
    </group>
  );
}
const plafondHout = metReliëf({ map: plafondTextuur(), roughness: 0.9, side: THREE.DoubleSide }, 1.4);
const plafondSteen = metReliëf({ map: plafondTextuur(), color: '#8c8794', roughness: 0.95, side: THREE.DoubleSide }, 1.4);
const plafondCache = new Map<string, THREE.MeshStandardMaterial>();
/** Plafondmateriaal per soort ("hout|kleur", "steen|kleur", "pleister|"). */
function plafondMat(sleutel: string) {
  const [soort, kleur] = sleutel.split('|');
  if (soort === 'systeem') return systeemPlafond();
  if (!kleur && soort === 'hout') return plafondHout;
  if (!kleur && soort === 'steen') return plafondSteen;
  let m = plafondCache.get(sleutel);
  if (!m) {
    // een eigen kleur op een gewoon plafond = glad stucwerk in die kleur (modern); op steen = getinte steen
    m =
      soort === 'steen'
        ? metReliëf({ map: plafondTextuur(), color: kleur || '#8c8794', roughness: 0.92, side: THREE.DoubleSide }, 1.4)
        : metReliëf({ map: pleisterTextuur(kleur || '#e9e4da', 3.2), roughness: 0.92, side: THREE.DoubleSide }, 0.8);
    plafondCache.set(sleutel, m);
  }
  return m;
}

/** Moeten de daken nu te zien zijn? Op het titelscherm, door je eigen ogen, en als je buiten het gebouw loopt. */
export function dakZichtbaar() {
  const s = useSpel.getState();
  if (s.kaart === 'start' || s.kaart === 'werelden') return true;
  if (eersteLopen()) return true;
  if (s.modus !== 'lopen') return false;
  const plan = huidig().plan;
  return !plan || (speler.verdieping === 0 && buitenGebouw(plan, speler.pos.x, speler.pos.z));
}

/**
 * Schuine daken met dakpannen boven de bovenste binnenkamers (als het gebouw `daken` heeft).
 * Kamers met hetzelfde `dakDeel` krijgen samen één dak. Alles samen twee tekenstappen per verdieping.
 */
function Daken({ plan }: { plan: Plattegrond }) {
  const ref = useRef<THREE.Group>(null);
  const v = plan.deelVan?.verdieping ?? 0;
  const heel = plan.deelVan?.plan ?? plan;
  const H = plan.muurHoogte ?? 3.2;
  const instelling = heel.daken;
  const vorm = useMemo(() => {
    // platte daken kunnen ook zonder pannendaken (modern gebouw)
    if (!instelling && !plan.kamers.some((k) => k.dak === 'plat')) return null;
    const delen = new Map<string, { vak: Vak; soort: DakSoort; nok?: 'x' | 'z'; h: number }>();
    const platte: { k: Kamer; h: number }[] = [];
    for (const k of plan.kamers) {
      if (k.buiten) continue;
      const soort = k.dak ?? 'schild';
      if (soort === 'geen' || k.plafond === 'glas' || k.plafond === 'open' || k.plafond === 'glasgewelf' || k.plafond === 'glaskoepel' || k.plafond === 'koepel') continue;
      if (soort === 'plat') {
        if (!kamerOp(heel, k.pos[0], k.pos[1], v + 1)) platte.push({ k, h: kamerHoogte(plan, k) });
        continue;
      }
      if (!instelling) continue;
      const kh = kamerHoogte(plan, k);
      if (kamerOp(heel, k.pos[0], k.pos[1], v + 1)) continue;
      const vak: Vak = [k.pos[0] - k.maat[0] / 2, k.pos[0] + k.maat[0] / 2, k.pos[1] - k.maat[1] / 2, k.pos[1] + k.maat[1] / 2];
      const sleutel = k.dakDeel ?? k.id;
      const al = delen.get(sleutel);
      if (al) {
        al.vak = [Math.min(al.vak[0], vak[0]), Math.max(al.vak[1], vak[1]), Math.min(al.vak[2], vak[2]), Math.max(al.vak[3], vak[3])];
        al.h = Math.max(al.h, kh);
      } else delen.set(sleutel, { vak, soort, nok: k.dakNok, h: kh });
    }
    const pannen: THREE.BufferGeometry[] = [];
    const gevels: THREE.BufferGeometry[] = [];
    for (const d of delen.values()) {
      const r = dakVorm(d.vak, d.soort, instelling?.helling ?? 0.92, 0.45, 5.5, d.nok);
      // een hogere zaal krijgt zijn dak hoger (de groep staat op de gewone muurhoogte)
      const dy = d.h - H;
      if (dy) {
        r.pannen.translate(0, dy, 0);
        r.gevels?.translate(0, dy, 0);
      }
      pannen.push(r.pannen);
      if (r.gevels) gevels.push(r.gevels);
    }
    // platte daken: een dakvlak met grind en een opstaande dakrand
    const plat: THREE.BufferGeometry[] = [];
    const rand: THREE.BufferGeometry[] = [];
    for (const { k, h } of platte) {
      const [x, z] = k.pos;
      const [w, d] = k.maat;
      const dy = h - H;
      plat.push(new THREE.BoxGeometry(w + 0.3, 0.2, d + 0.3).translate(x, dy + 0.1, z).toNonIndexed());
      for (const [px, pz, sx, sz] of [
        [x, z - d / 2, w + 0.3, 0.25],
        [x, z + d / 2, w + 0.3, 0.25],
        [x - w / 2, z, 0.25, d + 0.3],
        [x + w / 2, z, 0.25, d + 0.3],
      ])
        rand.push(new THREE.BoxGeometry(sx, 0.55, sz).translate(px, dy + 0.27, pz).toNonIndexed());
    }
    if (!pannen.length && !plat.length) return null;
    const p = pannen.length ? mergeGeometries(pannen)! : null;
    const g = gevels.length ? mergeGeometries(gevels)! : null;
    const pl = plat.length ? mergeGeometries(plat)! : null;
    const rd = rand.length ? mergeGeometries(rand)! : null;
    pannen.forEach((x) => x.dispose());
    gevels.forEach((x) => x.dispose());
    return { p, g, pl, rd };
  }, [plan, heel, v, instelling]);
  useEffect(
    () => () => {
      vorm?.p?.dispose();
      vorm?.g?.dispose();
      vorm?.pl?.dispose();
      vorm?.rd?.dispose();
    },
    [vorm],
  );
  const mats = useMemo(() => {
    const pan = dakpanTextuur(instelling?.kleur ?? '#8e3f2c');
    return {
      pan: metReliëf({ map: pan, roughness: 0.85, side: THREE.DoubleSide }, 2.2),
      gevel: metReliëf({ map: pleisterTextuur(instelling?.pleister ?? '#ece3d4', 3.2), roughness: 0.93, side: THREE.DoubleSide }, 1.4),
      grind: metReliëf({ map: vloerTextuur('grind', '#9d978c'), roughness: 0.95 }, 1.2),
      rand: mat('#8d8f92', { rough: 0.6, metal: 0.3 }),
    };
  }, [instelling?.kleur, instelling?.pleister]);
  useFrame(() => {
    if (ref.current) ref.current.visible = dakZichtbaar();
  });
  if (!vorm) return null;
  return (
    <group ref={ref} position={[0, H, 0]}>
      {vorm.p && <mesh geometry={vorm.p} material={mats.pan} castShadow receiveShadow ref={opSchaduwLaag} />}
      {vorm.g && <mesh geometry={vorm.g} material={mats.gevel} castShadow receiveShadow ref={opSchaduwLaag} />}
      {vorm.pl && <mesh geometry={vorm.pl} material={mats.grind} receiveShadow />}
      {vorm.rd && <mesh geometry={vorm.rd} material={mats.rand} castShadow receiveShadow ref={opSchaduwLaag} />}
    </group>
  );
}

export function GebouwLevend({ plan }: { plan: Plattegrond }) {
  return (
    <>
      <TrapLinten v={plan.deelVan?.verdieping ?? 0} />
      <Plafonds plan={plan} />
      <Daken plan={plan} />
      <Muren plan={plan} />
      {plan.doorgangen.map((d, i) => (
        <Deur key={i} d={d} i={i} laag={!inMuur(plan, d)} />
      ))}
    </>
  );
}

// ── Meubels voor stations ─────────────────────────────────────────────────

export const TAFEL_H = { hout: 0.8, vilt: 0.8, sokkel: 0.4 } as const;

/** Gedraaide tafelpoot (draaibank): vierkant blok bovenaan, een kraal, taps naar een voetje. Hoogte 1, schaal je mee. */
const pootCache = new Map<string, THREE.BufferGeometry>();
function draaiPoot(h: number) {
  const key = h.toFixed(3);
  let g = pootCache.get(key);
  if (!g) {
    // profiel van onder naar boven (straal, hoogte als deel van de poot)
    const p: [number, number][] = [
      [0.001, 0],
      [0.034, 0],
      [0.042, 0.025],
      [0.03, 0.06],
      [0.028, 0.12],
      [0.04, 0.42],
      [0.05, 0.56],
      [0.056, 0.6],
      [0.04, 0.64],
      [0.046, 0.68],
      [0.046, 0.74],
      [0.001, 0.74],
    ];
    const lathe = new THREE.LatheGeometry(
      p.map(([r, y]) => new THREE.Vector2(r, y * h)),
      12,
    );
    const blok = new RoundedBoxGeometry(0.1, h * 0.26, 0.1, 2, 0.012);
    blok.translate(0, h * 0.87, 0);
    lathe.deleteAttribute('uv');
    blok.deleteAttribute('uv');
    g = mergeGeometries([lathe.index ? lathe.toNonIndexed() : lathe, blok.index ? blok.toNonIndexed() : blok])!;
    pootCache.set(key, g);
  }
  return g;
}

export function Tafel({ b, d, soort = 'hout' }: { b: number; d: number; soort?: 'hout' | 'vilt' | 'sokkel' }) {
  if (soort === 'sokkel')
    return (
      <group>
        {/* sokkel met een voet, een strakke middenband en een geprofileerde bovenrand */}
        <Blok size={[b + 0.06, 0.06, d + 0.06]} pos={[0, 0.03, 0]} color="#3e2a1d" r={0.02} />
        <Blok size={[b, 0.28, d]} pos={[0, 0.2, 0]} color="#4a3324" r={0.04} />
        <Blok size={[b + 0.02, 0.025, d + 0.02]} pos={[0, 0.3, 0]} color="#3e2a1d" r={0.01} shadow={false} />
        <Blok size={[b + 0.08, 0.06, d + 0.08]} pos={[0, 0.37, 0]} color="#6b4a32" r={0.025} />
      </group>
    );
  const h = TAFEL_H[soort];
  const pootH = h - 0.07;
  const poot = (x: number, z: number) => <mesh key={`${x}${z}`} geometry={draaiPoot(pootH)} material={mat('#4a2f1e', { rough: 0.6 })} position={[x, 0, z]} castShadow receiveShadow />;
  return (
    <group>
      {/* blad met een afgeronde rand, en daaronder een iets kleinere onderrand (geeft een profiel) */}
      <Blok size={[b, 0.05, d]} pos={[0, h - 0.025, 0]} color="#7a5233" r={0.022} rough={0.55} />
      <Blok size={[b - 0.06, 0.03, d - 0.06]} pos={[0, h - 0.062, 0]} color="#6a4529" r={0.012} shadow={false} rough={0.6} />
      {soort === 'vilt' && <Blok size={[b - 0.2, 0.012, d - 0.2]} pos={[0, h + 0.006, 0]} color="#3f6b4c" r={0.005} shadow={false} rough={1} />}
      {/* zoom onder het blad, met een lijstje onderaan */}
      {[-1, 1].map((k) => (
        <group key={`zb${k}`}>
          <Blok size={[b - 0.3, 0.11, 0.035]} pos={[0, h - 0.13, k * (d / 2 - 0.15)]} color="#5c3c26" r={0.01} shadow={false} rough={0.6} />
          <Blok size={[b - 0.3, 0.018, 0.05]} pos={[0, h - 0.19, k * (d / 2 - 0.15)]} color="#4a2f1e" r={0.006} shadow={false} rough={0.6} />
          <Blok size={[0.035, 0.11, d - 0.3]} pos={[k * (b / 2 - 0.15), h - 0.13, 0]} color="#5c3c26" r={0.01} shadow={false} rough={0.6} />
          <Blok size={[0.05, 0.018, d - 0.3]} pos={[k * (b / 2 - 0.15), h - 0.19, 0]} color="#4a2f1e" r={0.006} shadow={false} rough={0.6} />
        </group>
      ))}
      {poot(-b / 2 + 0.15, -d / 2 + 0.15)}
      {poot(b / 2 - 0.15, -d / 2 + 0.15)}
      {poot(-b / 2 + 0.15, d / 2 - 0.15)}
      {poot(b / 2 - 0.15, d / 2 - 0.15)}
    </group>
  );
}

/** Staande lamp met warme kap. */
export function StaandeLamp({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <Cil r={0.18} h={0.05} pos={[0, 0.025, 0]} color="#2c2420" seg={14} />
      <Cil r={0.025} h={1.6} pos={[0, 0.8, 0]} color="#2c2420" seg={8} />
      <mesh position={[0, 1.68, 0]} material={mat('#ffd9a0', { emissive: '#ffb45a', rough: 0.6 })}>
        <cylinderGeometry args={[0.16, 0.26, 0.3, 14, 1, true]} />
      </mesh>
    </group>
  );
}

/** Vloerkleed (decor). */
export function Kleed({ pos, b, d, kleur = '#7a3b34', rand = '#c9a25a' }: { pos: [number, number]; b: number; d: number; kleur?: string; rand?: string }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Blok size={[b, 0.02, d]} pos={[0, 0.022, 0]} color={rand} r={0.005} shadow={false} />
      <Blok size={[b - 0.3, 0.022, d - 0.3]} pos={[0, 0.025, 0]} color={kleur} r={0.005} shadow={false} />
    </group>
  );
}

// ── Uitgangsdeur = de poort met sleutelgaten en eindcheck-lampjes ─────────

export function Voordeur({ open }: { open: number }) {
  const def = huidig();
  const kluizen = useSpel((s) => s.kluizen);
  const voortgang = useSpel((s) => s.voortgang);
  const eind = def.werkboek.filter((id) => def.opdrachten[id].sectie === 'eindtest');
  const lampAan = useMemo(() => mat('#ffd36b', { emissive: '#ffb733', rough: 0.4 }), []);
  const lampUit = useMemo(() => mat('#4b4541', { rough: 0.6 }), []);
  const hout = '#5a3a24';
  const lijst = '#2f2016';
  return (
    <group>
      <Blok size={[0.34, 2.9, MUUR_D + 0.2]} pos={[-1.7 + 0.17 - 0.0, 1.45, 0]} color={lijst} r={0.04} />
      <Blok size={[0.34, 2.9, MUUR_D + 0.2]} pos={[1.7 - 0.17, 1.45, 0]} color={lijst} r={0.04} />
      <Blok size={[UITGANG_BREED + 0.3, 0.42, MUUR_D + 0.24]} pos={[0, 2.95, 0]} color={lijst} r={0.05} />
      {/* lampjes van de eindcheck op de bovendorpel */}
      {eind.map((id, i) => (
        <mesh key={id} position={[(i - (eind.length - 1) / 2) * 0.27, 2.95, 0.2]} material={voortgang[id]?.goed ? lampAan : lampUit}>
          <sphereGeometry args={[0.08, 12, 8]} />
        </mesh>
      ))}
      <group position={[-1.53, 0, 0]} rotation={[0, open * 1.5, 0]}>
        <Blok size={[1.5, 2.7, 0.1]} pos={[0.75, 1.35, 0]} color={hout} r={0.03} />
        <Blok size={[1.1, 0.9, 0.12]} pos={[0.75, 1.9, 0]} color="#6b4630" r={0.03} shadow={false} />
        <Blok size={[1.1, 0.9, 0.12]} pos={[0.75, 0.75, 0]} color="#6b4630" r={0.03} shadow={false} />
      </group>
      <group position={[1.53, 0, 0]} rotation={[0, -open * 1.5, 0]}>
        <Blok size={[1.5, 2.7, 0.1]} pos={[-0.75, 1.35, 0]} color={hout} r={0.03} />
        <Blok size={[1.1, 0.9, 0.12]} pos={[-0.75, 1.9, 0]} color="#6b4630" r={0.03} shadow={false} />
        <Blok size={[1.1, 0.9, 0.12]} pos={[-0.75, 0.75, 0]} color="#6b4630" r={0.03} shadow={false} />
      </group>
      {/* koperen plaat met een sleutelgat per klus */}
      <group position={[2.3, 1.45, MUUR_D / 2 + 0.03]}>
        <Blok size={[0.62, 0.32 + def.klussen.length * 0.42, 0.05]} color="#b58a45" r={0.04} />
        {def.klussen.map((k, i) => {
          const y = (i - (def.klussen.length - 1) / 2) * -0.42;
          const binnen = !!kluizen[`${def.nr}:${k.id}`];
          return (
            <group key={k.id} position={[0, y, 0.035]}>
              <mesh>
                <ringGeometry args={[0.12, 0.16, 28]} />
                <meshBasicMaterial color={k.kleur} toneMapped={false} />
              </mesh>
              {binnen ? (
                <group position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
                  <Sleutel kleur={k.kleur} s={0.7} />
                </group>
              ) : (
                <>
                  <mesh position={[0, 0.025, 0.002]}>
                    <circleGeometry args={[0.04, 14]} />
                    <meshBasicMaterial color="#000" />
                  </mesh>
                  <mesh position={[0, -0.04, 0.002]}>
                    <planeGeometry args={[0.035, 0.09]} />
                    <meshBasicMaterial color="#000" />
                  </mesh>
                </>
              )}
            </group>
          );
        })}
      </group>
      {/* bordje UITGANG */}
      <mesh position={[0, 3.35, 0.2]} material={mat('#2f6b4a', { emissive: '#3fae6f' })}>
        <boxGeometry args={[0.9, 0.24, 0.06]} />
      </mesh>
      {/* stoep buiten */}
      <Blok size={[4.4, 0.12, 1.6]} pos={[0, 0.06, -1.1]} color="#7d7368" r={0.03} />
    </group>
  );
}

// ── Kasteel: torens en fakkels ─────────────────────────────────────────

/**
 * Ronde toren (kasteel) op punt `pos` [x, z]. `bij` = punt op de muur ernaast: zakt die muur weg
 * (camerakant), dan zakt de toren mee. Gebruik in `Levend`.
 */
export function Toren({
  pos,
  bij,
  r = 1.7,
  extra = 2.8,
  dak = '#3a2f4d',
  vlag = '#ff8a3d',
  steen = '#7a757e',
  hoog = false,
}: {
  pos: V2;
  bij: V2;
  r?: number;
  extra?: number;
  dak?: string;
  vlag?: string;
  steen?: string;
  /** Toren langs meer verdiepingen: zakt tot de verdieping waar je nu bent (als daar de muur wegzakt). */
  hoog?: boolean;
}) {
  const { plan, v } = useVerdiepingPlan();
  const H = plan.muurHoogte ?? 3.2;
  const T = H + extra;
  const ref = useRef<THREE.Group>(null);
  const top = useRef<THREE.Mesh>(null);
  const hoogte = useRef(1);
  const { lijf, kroon, ramen } = useMemo(() => {
    const t = steenTextuur(steen, T, true).clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(1, Math.round((2 * Math.PI * r) / 1.2)), 1);
    // kroon: rand, kantelen, puntdak, vlaggenstok en vlag in één vorm (kleur per hoekpunt)
    const delen: THREE.BufferGeometry[] = [];
    const voeg = (g: THREE.BufferGeometry, kleur: string) => {
      const n = g.index ? g.toNonIndexed() : g;
      const c = new THREE.Color(kleur);
      n.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n.attributes.position.count * 3 }, (_, i) => [c.r, c.g, c.b][i % 3]), 3));
      delen.push(n);
    };
    const randKleur = donkerder(steen, 0.85);
    voeg(new THREE.CylinderGeometry(r + 0.18, r + 0.12, 0.24, 24).translate(0, 0.12, 0), randKleur);
    voeg(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2).translate(0, 0.25, 0), donkerder(steen, 0.6));
    const n = Math.max(8, Math.round((2 * Math.PI * r) / 0.9));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      voeg(new THREE.BoxGeometry(0.42, 0.5, 0.3).rotateY(a).translate(Math.sin(a) * (r + 0.05), 0.48, Math.cos(a) * (r + 0.05)), randKleur);
    }
    voeg(new THREE.ConeGeometry(r * 0.95, r * 2.3, 16).translate(0, 0.25 + r * 1.15, 0), dak);
    voeg(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6).translate(0, 0.25 + r * 2.3 + 0.5, 0), '#2a2328');
    voeg(new THREE.BoxGeometry(0.66, 0.38, 0.02).translate(0.36, 0.25 + r * 2.3 + 0.85, 0), vlag);
    const kroon = mergeGeometries(delen)!;
    kroon.computeVertexNormals();
    const raam = (a: number, y: number) => new THREE.PlaneGeometry(0.38, 0.7).rotateY(a).translate(Math.sin(a) * (r + 0.01), y, Math.cos(a) * (r + 0.01));
    const ramen = mergeGeometries([raam(0.9, H * 0.55), raam(2.6, H * 0.55 + 1.6), raam(-1.4, H * 0.55 + 0.8)])!;
    return { lijf: new THREE.MeshStandardMaterial({ map: t, roughness: 0.96 }), kroon, ramen };
  }, [steen, T, r, H, dak, vlag]);
  useEffect(
    () => () => {
      kroon.dispose();
      ramen.dispose();
    },
    [kroon, ramen],
  );
  useFrame((_, dt) => {
    let doel = Math.max(0.17, muurHoogteOp(bij[0], bij[1], v) / H);
    if (hoog) {
      const kv = kijkVerdieping();
      const h = muurHoogteOp(bij[0], bij[1], kv);
      const HV = verdiepingHoogte(plan.deelVan?.plan ?? plan);
      doel = h < H - 0.05 ? Math.max(0.17 * H, kv * HV + h) / T : 1;
    }
    hoogte.current += (doel - hoogte.current) * Math.min(1, dt * 7);
    if (ref.current) ref.current.scale.y = hoogte.current;
    if (top.current) top.current.visible = hoogte.current > 0.9;
  });
  return (
    <group position={[pos[0], 0, pos[1]]} ref={opSchaduwLaag}>
      <group ref={ref}>
        <mesh material={lijf} position={[0, T / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r, r * 1.06, T, 24, 1, true]} />
        </mesh>
        <mesh geometry={ramen} material={warmGlas} />
      </group>
      <mesh ref={top} geometry={kroon} material={lijstMat} position={[0, T, 0]} castShadow receiveShadow />
    </group>
  );
}

/**
 * Fakkels aan de muren. `punten` = [x, z] vlak bij een muur, aan de kant waar de fakkel moet hangen.
 * Vlammen flakkeren, gloed en een warme lichtvlek op de vloer. Alles samen een paar tekenstappen. Gebruik in `Levend`.
 */
export function Fakkels({ punten, hoogte = 2.05, kleur = '#ff9a3c' }: { punten: V2[]; hoogte?: number; kleur?: string }) {
  const { plan, v } = useVerdiepingPlan();
  const data = useMemo(() => {
    const lijst: { bij: V2; houder: THREE.Matrix4; vlam: THREE.Vector3; vlek: THREE.Matrix4 }[] = [];
    const o = new THREE.Object3D();
    for (const p of punten) {
      let best: MuurStuk | null = null;
      let bestD = 0.9;
      for (const m of muurStukken(plan)) {
        if (m.vanY > 0) continue;
        const langs = m.as === 'x' ? p[0] : p[1];
        if (langs < m.s || langs > m.e) continue;
        const d = Math.abs((m.as === 'x' ? p[1] : p[0]) - m.c);
        if (d < bestD) {
          bestD = d;
          best = m;
        }
      }
      if (!best) {
        if (import.meta.env.DEV) console.warn('Fakkel niet bij een muur:', p);
        continue;
      }
      const kant = Math.sign((best.as === 'x' ? p[1] : p[0]) - best.c) || 1;
      const uit = MUUR_D / 2 + 0.16;
      const x = best.as === 'x' ? p[0] : best.c + kant * uit;
      const z = best.as === 'x' ? best.c + kant * uit : p[1];
      o.position.set(x, hoogte, z);
      o.rotation.set(best.as === 'x' ? -kant * 0.35 : 0, 0, best.as === 'z' ? kant * 0.35 : 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      const houder = o.matrix.clone();
      o.rotation.set(-Math.PI / 2, 0, 0);
      o.position.set(best.as === 'x' ? p[0] : best.c + kant * 1.0, 0.035, best.as === 'x' ? best.c + kant * 1.0 : p[1]);
      o.updateMatrix();
      lijst.push({ bij: [best.as === 'x' ? p[0] : best.c, best.as === 'x' ? best.c : p[1]], houder, vlam: new THREE.Vector3(x + (best.as === 'z' ? kant * 0.09 : 0), hoogte + 0.32, z + (best.as === 'x' ? kant * 0.09 : 0)), vlek: o.matrix.clone() });
    }
    const stok = new THREE.CylinderGeometry(0.04, 0.03, 0.5, 6);
    const kom = new THREE.CylinderGeometry(0.1, 0.06, 0.14, 8);
    kom.translate(0, 0.27, 0);
    const houderGeo = mergeGeometries([stok.toNonIndexed(), kom.toNonIndexed()])!;
    const maak = (g: THREE.BufferGeometry, m: THREE.Material, schaduw: boolean) => {
      const im = new THREE.InstancedMesh(g, m, Math.max(1, lijst.length));
      im.count = lijst.length;
      im.castShadow = schaduw;
      im.frustumCulled = false;
      return im;
    };
    const houders = maak(houderGeo, mat('#2f2620', { rough: 0.8 }), true);
    const vlamGeo = new THREE.ConeGeometry(0.1, 0.34, 6);
    vlamGeo.translate(0, 0.17, 0);
    const vlammen = maak(vlamGeo, new THREE.MeshBasicMaterial({ color: kleur, toneMapped: false }), false);
    const vlekGeo = new THREE.PlaneGeometry(3.4, 3.4);
    const vlekken = maak(vlekGeo, new THREE.MeshBasicMaterial({ map: lichtTex(), color: kleur, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), false);
    const gloedGeo = new THREE.BufferGeometry();
    gloedGeo.setAttribute('position', new THREE.Float32BufferAttribute(lijst.flatMap((l) => [l.vlam.x, l.vlam.y + 0.1, l.vlam.z]), 3));
    const gloed = new THREE.Points(gloedGeo, new THREE.PointsMaterial({ map: gloedTex(), color: kleur, size: 1.5, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }));
    gloed.frustumCulled = false;
    return { lijst, houders, vlammen, vlekken, gloed };
  }, [plan, punten, hoogte, kleur]);
  const zicht = useRef<boolean[]>([]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const { lijst, houders, vlammen, vlekken, gloed } = data;
    const pos = gloed.geometry.attributes.position as THREE.BufferAttribute;
    let anders = false;
    lijst.forEach((l, i) => {
      const z = muurHoogteOp(l.bij[0], l.bij[1], v) > 2.3;
      if (zicht.current[i] !== z) {
        zicht.current[i] = z;
        anders = true;
        houders.setMatrixAt(i, z ? l.houder : NUL);
        vlekken.setMatrixAt(i, z ? l.vlek : NUL);
        pos.setY(i, z ? l.vlam.y + 0.1 : -1000);
      }
      // flakkeren
      const f = 0.8 + 0.2 * Math.sin(t * (9 + (i % 3)) + i * 1.7) + 0.1 * Math.sin(t * 23 + i);
      o.position.copy(l.vlam);
      o.rotation.set(0, t * 2 + i, Math.sin(t * 5 + i) * 0.08);
      o.scale.set(1, z ? f : 0, 1);
      o.updateMatrix();
      vlammen.setMatrixAt(i, o.matrix);
    });
    vlammen.instanceMatrix.needsUpdate = true;
    if (anders) {
      houders.instanceMatrix.needsUpdate = true;
      vlekken.instanceMatrix.needsUpdate = true;
      pos.needsUpdate = true;
    }
    (gloed.material as THREE.PointsMaterial).size = 1.4 + Math.sin(t * 8) * 0.12 + Math.sin(t * 19) * 0.08;
  });
  useEffect(() => () => [data.houders, data.vlammen, data.vlekken].forEach((m) => m.dispose()), [data]);
  return (
    <>
      <primitive object={data.houders} />
      <primitive object={data.vlammen} />
      <primitive object={data.vlekken} />
      <primitive object={data.gloed} />
    </>
  );
}

export { Lichtplek };
