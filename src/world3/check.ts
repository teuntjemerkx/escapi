// Controlescript voor Wereld 3 – De Markthal aan de Waag (draai via esbuild-bundel, zie onderaan).
// Controleert:
//  1. elke werkboekopdracht in precies één station, max. 4 per station, één sectie per station;
//  2. de klussen (alleen niveau-stations, 2–4 per klus);
//  3. de deel-ids in de modellen;
//  4. de plekken: elk station in een kamer van zijn verdieping, niet in een muur, niet over elkaar, niet op een trap,
//     0,9 m vrij vóór elk station, deuren en de uitgang vrij, lampjes vrij;
//  5. decor (registreerDecor) staat niet in stations, vóór stations, in deuren, op de start of op een lampje;
//  6. bereikbaarheid: met padzoeken (botsingen van gebouw, decor en stations, alle deuren open) kom je vanaf de start
//     bij elk station en elke kluis, ook op de galerij (via een trap).
// @ts-ignore -- dit script draait in node (esbuild), niet in de browser
import { readFileSync } from 'node:fs';
import data from '../data/onderdeel3.json';
import type { Opdracht } from '../data/schema';
import { box, losOp, opLaag, verwijder, wisAlles, zetGrens, zetLaag, zoekPad } from '../game/botsing';
import { grenzen, registreerPlan, trapOp } from '../game/huis';
import type { Kamer } from '../werelden/types';
import { KLUIS_PLEK, LAMPJES_HUIS, PLAN, SPAWN } from './huis';
import { registreerDecor } from './Markthal';
import { KLUSSEN } from './klussen';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';

const fouten: string[] = [];
const fout = (t: string) => fouten.push(t);

// ── 1. opdrachten ↔ stations ──
const werk = (data.opdrachten as unknown as Opdracht[]).map((o) => o.id);
const telling = new Map<string, string[]>();
for (const st of STATIONS) {
  if (st.opdrachten.length > 4) fout(`${st.id}: meer dan 4 opdrachten`);
  for (const id of st.opdrachten) telling.set(id, [...(telling.get(id) ?? []), st.id]);
  const secties = new Set(st.opdrachten.map((id) => OPDRACHTEN[id]?.sectie));
  if (secties.size > 1) fout(`${st.id}: gemengde secties`);
  for (const id of st.opdrachten) if (!OPDRACHTEN[id]) fout(`${st.id}: onbekende opdracht ${id}`);
}
for (const id of werk) {
  const n = telling.get(id)?.length ?? 0;
  if (n !== 1) fout(`${id} zit in ${n} stations`);
}
if (WERKBOEK.length !== werk.length) fout('WERKBOEK klopt niet');
for (const id of ['W3-TERUG', 'W3-INSTR']) if ((telling.get(id)?.length ?? 0) !== 1) fout(`${id} niet in precies 1 station`);
for (const id of werk) {
  const o = OPDRACHTEN[id];
  if (o.type !== 'open' && !o.strategie) fout(`${id}: geen strategie`);
}

// ── 2. klussen ──
const niveau = STATIONS.filter((s) => OPDRACHTEN[s.opdrachten[0]]?.sectie === 'niveau').map((s) => s.id);
const inKlus = KLUSSEN.flatMap((k) => k.stations);
for (const id of niveau) if (!inKlus.includes(id)) fout(`niveau-station ${id} zit in geen klus`);
for (const k of KLUSSEN) {
  if (k.stations.length < 2 || k.stations.length > 4) fout(`klus ${k.id}: ${k.stations.length} stations`);
  for (const id of k.stations) if (!niveau.includes(id)) fout(`klus ${k.id}: ${id} is geen niveau-station`);
}

// ── 3. deel-ids ──
const bron = ['modellen-start', 'modellen-instap', 'modellen-niveau', 'modellen-keuze', 'modellen-eind'].map((f) => readFileSync(`src/world3/${f}.tsx`, 'utf8')).join('\n');
for (const st of STATIONS)
  for (const id of st.opdrachten)
    for (const s of OPDRACHTEN[id].stappen) if (s.deel && !bron.includes(`id="${s.deel}"`)) fout(`${id}: deel "${s.deel}" bestaat niet als Deel`);

// ── 4. plekken ──
type R = { naam: string; x1: number; x2: number; z1: number; z2: number; v: number };
const rect = (naam: string, x: number, z: number, w: number, d: number, v = 0): R => ({ naam, x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2, v });
const overlap = (a: R, b: R) => a.v === b.v && Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > 0.01 && Math.min(a.z2, b.z2) - Math.max(a.z1, b.z1) > 0.01;
const gedraaid = (rot = 0) => Math.abs(Math.sin(rot)) > 0.5;
/** Botsvak van een station in wereldrichting. */
const vakVan = (naam: string, x: number, z: number, b: [number, number], rot = 0, v = 0) => (gedraaid(rot) ? rect(naam, x, z, b[1], b[0], v) : rect(naam, x, z, b[0], b[1], v));
/** Strook van 0,9 m vóór het station (de kant waar de voorkant naar wijst). */
const voorVan = (r: R, rot = 0): R => {
  const fx = Math.round(Math.sin(rot));
  const fz = Math.round(Math.cos(rot));
  if (fx > 0) return { ...r, naam: `voor ${r.naam}`, x1: r.x2, x2: r.x2 + 0.9 };
  if (fx < 0) return { ...r, naam: `voor ${r.naam}`, x1: r.x1 - 0.9, x2: r.x1 };
  if (fz > 0) return { ...r, naam: `voor ${r.naam}`, z1: r.z2, z2: r.z2 + 0.9 };
  return { ...r, naam: `voor ${r.naam}`, z1: r.z1 - 0.9, z2: r.z1 };
};
const kamerVan = (x: number, z: number, v = 0) => PLAN.kamers.find((k) => (k.verdieping ?? 0) === v && Math.abs(x - k.pos[0]) <= k.maat[0] / 2 && Math.abs(z - k.pos[1]) <= k.maat[1] / 2);
/** Heeft deze kant van de kamer een muur (en geen open zijde, geen buitenruimte)? */
const MUUR = 0.15;
const vakken: R[] = [];
const voor: R[] = [];
for (const st of STATIONS) {
  const v = st.verdieping ?? 0;
  const r = vakVan(st.id, st.pos[0], st.pos[1], st.botser ?? [1, 1], st.rot, v);
  vakken.push(r);
  voor.push(voorVan(r, st.rot));
  const k = kamerVan(st.pos[0], st.pos[1], v);
  if (!k) {
    fout(`${st.id}: niet in een kamer op verdieping ${v}`);
    continue;
  }
  const m = k.buiten ? 0 : MUUR - 0.01;
  if (r.x1 < k.pos[0] - k.maat[0] / 2 + m || r.x2 > k.pos[0] + k.maat[0] / 2 - m || r.z1 < k.pos[1] - k.maat[1] / 2 + m || r.z2 > k.pos[1] + k.maat[1] / 2 - m) {
    // over de rand mag alleen naar een open zijde of een buurkamer zonder muur
    fout(`${st.id}: botsvak gaat door de muur van ${k.id}`);
  }
}
for (const k of KLUSSEN) vakken.push(vakVan(`kluis-${k.id}`, k.kluis.pos[0], k.kluis.pos[1], [1.2, 1.1], k.kluis.rot, k.kluis.verdieping ?? 0));
for (const [id, p] of Object.entries(KLUIS_PLEK)) voor.push(voorVan(vakVan(`kluis-${id}`, p.pos[0], p.pos[1], [1.2, 1.1], p.rot, p.verdieping ?? 0), p.rot));
// trappen (beneden de trap zelf, boven het trapgat)
const trapVakken: R[] = [];
for (const tr of PLAN.trappen ?? []) {
  const [w, d] = tr.as === 'x' ? [tr.lengte, tr.breed] : [tr.breed, tr.lengte];
  trapVakken.push(rect('trap', tr.pos[0], tr.pos[1], w + 0.1, d + 0.1, tr.van));
  trapVakken.push(rect('trapgat', tr.pos[0], tr.pos[1], w + 0.1, d + 0.1, tr.van + 1));
  // vrije ruimte bij de voet en de top
  const [ox, oz] = trapOp(tr, -0.15);
  trapVakken.push(rect('voet van de trap', ox, oz, tr.as === 'x' ? 1 : tr.breed, tr.as === 'x' ? tr.breed : 1, tr.van));
  const [bx, bz] = trapOp(tr, 1.08);
  trapVakken.push(rect('top van de trap', bx, bz, tr.as === 'x' ? 0.6 : tr.breed, tr.as === 'x' ? tr.breed : 0.6, tr.van + 1));
}
for (let i = 0; i < vakken.length; i++) {
  for (let j = i + 1; j < vakken.length; j++) if (overlap(vakken[i], vakken[j])) fout(`overlap: ${vakken[i].naam} × ${vakken[j].naam}`);
  for (const t of trapVakken) if (overlap(vakken[i], t)) fout(`${vakken[i].naam} staat op of bij de ${t.naam}`);
}
for (const f of voor) {
  for (const v of vakken) if (`voor ${v.naam}` !== f.naam && overlap(f, v)) fout(`${v.naam} staat binnen 0,9 m vóór ${f.naam.slice(5)}`);
  for (const t of trapVakken) if (overlap(f, t)) fout(`${t.naam} staat binnen 0,9 m vóór ${f.naam.slice(5)}`);
  // niet tegen een muur aan kijken: de strook moet in een kamer van dezelfde verdieping liggen
  const mx = (f.x1 + f.x2) / 2;
  const mz = (f.z1 + f.z2) / 2;
  if (!kamerVan(mx, mz, f.v)) fout(`vóór ${f.naam.slice(5)} is geen vloer`);
}
// deuren: 1,5 m vrij aan beide kanten (bij een pui alleen voor de schuifdeur); ramen tellen niet
const deurVakken: R[] = [];
for (const d of PLAN.doorgangen) {
  if (d.soort === 'raam') continue;
  const b = d.soort === 'pui' ? (d.deurBreed ?? 2) : (d.breed ?? (d.soort === 'dubbel' ? 2.4 : 1.6));
  deurVakken.push(d.as === 'x' ? rect('deur', d.pos[0], d.pos[1], b, 3.0, d.verdieping ?? 0) : rect('deur', d.pos[0], d.pos[1], 3.0, b, d.verdieping ?? 0));
}
for (const dv of deurVakken) for (const v of vakken) if (overlap(dv, v)) fout(`${v.naam} staat voor de deur op (${(dv.x1 + dv.x2) / 2}, ${(dv.z1 + dv.z2) / 2})`);
const uit = rect('uitgang', PLAN.uitgang.pos[0], PLAN.uitgang.pos[1] + 2, 3.4, 4);
for (const v of vakken) if (overlap(uit, v)) fout(`${v.naam} staat voor de uitgang`);
for (const l of LAMPJES_HUIS) {
  const v = l[2] ?? 0;
  if (!kamerVan(l[0], l[1], v)) fout(`lampje (${l}) buiten het gebouw`);
  const r = rect('lampje', l[0], l[1], 0.8, 0.8, v);
  for (const s of [...vakken, ...trapVakken]) if (overlap(r, s)) fout(`lampje (${l}) in ${s.naam}`);
}
const perKamer = new Map<string, string[]>();
for (const st of STATIONS) {
  const k = kamerVan(st.pos[0], st.pos[1], st.verdieping ?? 0);
  if (k) perKamer.set(k.id, [...(perKamer.get(k.id) ?? []), st.id]);
}

// ── 5. decor ──
wisAlles();
const g = grenzen(PLAN);
zetGrens(g.w + 0.6, g.d + 0.6, 0.45, g.midden);
registreerDecor();
const raakt = (r: R) => {
  zetLaag(r.v);
  for (let x = r.x1 + 0.05; x <= r.x2 - 0.05; x += 0.2)
    for (let z = r.z1 + 0.05; z <= r.z2 - 0.05; z += 0.2) {
      const [nx, nz] = losOp(x, z, 0.02);
      if (Math.abs(nx - x) > 1e-6 || Math.abs(nz - z) > 1e-6) return true;
    }
  return false;
};
for (const v of vakken) if (raakt(v)) fout(`decor staat in ${v.naam}`);
for (const f of voor) if (raakt(f)) fout(`decor staat binnen 0,9 m ${f.naam}`);
for (const dv of deurVakken) if (raakt(dv)) fout(`decor staat voor de deur op (${(dv.x1 + dv.x2) / 2}, ${(dv.z1 + dv.z2) / 2})`);
for (const t of trapVakken) if (raakt(t)) fout(`decor staat op/bij de ${t.naam}`);
if (raakt(rect('start', SPAWN[0], SPAWN[1], 1, 1))) fout('decor op de start');
for (const l of LAMPJES_HUIS) if (raakt(rect('lampje', l[0], l[1], 0.5, 0.5, l[2] ?? 0))) fout(`decor op lampje (${l})`);

// ── 6. bereikbaarheid (alle deuren open, zoals in de docentmodus of aan het eind) ──
registreerPlan(PLAN);
PLAN.doorgangen.forEach((d, i) => verwijder(`deur-${i}`));
for (const st of STATIONS) opLaag(st.verdieping ?? 0, () => {
  const r = vakVan(st.id, st.pos[0], st.pos[1], st.botser ?? [1, 1], st.rot);
  box((r.x1 + r.x2) / 2, (r.z1 + r.z2) / 2, r.x2 - r.x1, r.z2 - r.z1);
});
for (const k of KLUSSEN) opLaag(k.kluis.verdieping ?? 0, () => {
  const r = vakVan('kluis', k.kluis.pos[0], k.kluis.pos[1], [1.2, 1.1], k.kluis.rot);
  box((r.x1 + r.x2) / 2, (r.z1 + r.z2) / 2, r.x2 - r.x1, r.z2 - r.z1);
});
/** Kun je op verdieping v van (ax, az) bij de voorkant van iets komen? */
const pad = (ax: number, az: number, f: R) => {
  zetLaag(f.v);
  const mx = (f.x1 + f.x2) / 2;
  const mz = (f.z1 + f.z2) / 2;
  return zoekPad(ax, az, mx, mz, (x, z) => x > f.x1 - 0.5 && x < f.x2 + 0.5 && z > f.z1 - 0.5 && z < f.z2 + 0.5, f.v);
};
// startpunten per verdieping: de start beneden, de top van elke trap boven
const starts: Record<number, [number, number][]> = { 0: [SPAWN] };
for (const tr of PLAN.trappen ?? []) {
  const voet = trapOp(tr, -0.2);
  const top = trapOp(tr, 1.12);
  zetLaag(tr.van);
  if (!zoekPad(SPAWN[0], SPAWN[1], voet[0], voet[1], undefined, tr.van)) fout(`trap bij (${tr.pos}): voet niet bereikbaar vanaf de start`);
  (starts[tr.van + 1] ??= []).push(top);
}
const doelen = [...voor];
for (const f of doelen) {
  const v = f.v;
  const ok = (starts[v] ?? []).some(([x, z]) => !!pad(x, z, f));
  if (!ok) fout(`niet bereikbaar: ${f.naam.slice(5)} (verdieping ${v})`);
}
zetLaag(0);
if (!zoekPad(SPAWN[0], SPAWN[1], PLAN.uitgang.pos[0], PLAN.uitgang.pos[1] + 1.2, undefined, 0)) fout('uitgang niet bereikbaar');

const kamerNaam = (k?: Kamer) => k?.naam ?? '?';
console.log([...perKamer].map(([k, ids]) => `${kamerNaam(PLAN.kamers.find((x) => x.id === k))} (${ids.length}): ${ids.join(', ')}`).join('\n'));
console.log(`\n${STATIONS.length} stations, ${KLUSSEN.length} kluizen, ${LAMPJES_HUIS.length} lampjes gecontroleerd.`);
console.log(fouten.length ? `\n${fouten.length} problemen:\n${fouten.join('\n')}` : '\nAlles klopt.');
// Draaien (vanuit de projectmap):
// npx esbuild src/world3/check.ts --bundle --platform=node --format=esm --jsx=automatic --loader:.png=empty --inject:src/world3/check-shim.ts --outfile=<scratch>/w3check.mjs && node <scratch>/w3check.mjs
