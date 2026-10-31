// Controle van Wereld 1 – De Ellehaven (alleen voor ontwikkelaars). Draait in de browser via de dev-server:
//   const m = await import('/src/world1/controle.ts'); m.controle()      → lijst met problemen (leeg = in orde)
//   m.bereikbaar()                                                          → stations die je niet kunt bereiken
// Controleert de plekken (kamer, verdieping, muren, overlap, deuren, 0,9 m vrij voor elk station), de klussen en de strategieën.
import { toon } from '../lib/getal';
import { opLaag, zoekPad } from '../game/botsing';
import { trapOp } from '../game/huis';
import { useSpel } from '../game/store';
import { registreerWereld } from '../game/wereld-basis';
import type { Kamer } from '../werelden/types';
import { PLAN, PLEKKEN, KLUIS_PLEK, LAMPJES_HUIS, SPAWN } from './huis';
import { KLUSSEN } from './klussen';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';
import { STRATEGIE } from './strategie';
import { DECOR_BOTSERS } from './Wereld1';
import { BUITEN_BOTSERS } from './Omgeving';
import { wereld1 } from './wereld';

type R = { naam: string; x1: number; x2: number; z1: number; z2: number; v: number };
const rect = (naam: string, x: number, z: number, w: number, d: number, v = 0): R => ({ naam, x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2, v });
const overlap = (a: R, b: R, marge = 0) => a.v === b.v && Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > marge && Math.min(a.z2, b.z2) - Math.max(a.z1, b.z1) > marge;
const kamerVan = (x: number, z: number, v = 0) => PLAN.kamers.find((k) => (k.verdieping ?? 0) === v && Math.abs(x - k.pos[0]) < k.maat[0] / 2 && Math.abs(z - k.pos[1]) < k.maat[1] / 2);
const gedraaid = (rot = 0) => Math.abs(Math.sin(rot)) > 0.5;

/** De zone (kamers) van elke klus: stations en kluis moeten daarin staan. */
const KLUS_ZONE: Record<string, string[]> = {
  lengte: ['werkplaats', 'werfterrein'],
  inhoud: ['hoofdsteiger', 'werkponton', 'cafeponton', 'kopponton'],
  gewicht: ['weegloods', 'kantine'],
};

/** Botsvak van een station in wereldrichting. */
function vakVan(id: string) {
  const s = STATIONS.find((x) => x.id === id)!;
  const b = s.botser ?? [1, 1];
  const d = gedraaid(s.rot);
  return rect(id, s.pos[0], s.pos[1], d ? b[1] : b[0], d ? b[0] : b[1], s.verdieping ?? 0);
}

/** Strook van 0,9 m vóór het station (in de richting waar het naartoe kijkt). */
function voorVan(id: string) {
  const s = STATIONS.find((x) => x.id === id)!;
  const r = vakVan(id);
  const rot = s.rot ?? 0;
  const fx = Math.round(Math.sin(rot));
  const fz = Math.round(Math.cos(rot));
  const w = r.x2 - r.x1;
  const d = r.z2 - r.z1;
  if (fx) return rect(`voor ${id}`, fx > 0 ? r.x2 + 0.45 : r.x1 - 0.45, s.pos[1], 0.9, Math.min(d, 1.2), r.v);
  return rect(`voor ${id}`, s.pos[0], fz > 0 ? r.z2 + 0.45 : r.z1 - 0.45, Math.min(w, 1.2), 0.9, r.v);
}

export function controle(): string[] {
  const fout: string[] = [];
  // 1. Elke werkboekopdracht in precies één station, max. 4 per station, één sectie per station.
  for (const id of WERKBOEK) {
    const n = STATIONS.filter((s) => s.opdrachten.includes(id)).length;
    if (n !== 1) fout.push(`${id} zit in ${n} stations`);
  }
  for (const s of STATIONS) {
    if (s.opdrachten.length > 4) fout.push(`${s.id}: meer dan 4 opdrachten`);
    for (const id of s.opdrachten) if (!OPDRACHTEN[id]) fout.push(`${s.id}: onbekende opdracht ${id}`);
    const secties = new Set(s.opdrachten.map((id) => OPDRACHTEN[id]?.sectie));
    if (secties.size > 1) fout.push(`${s.id}: opdrachten uit verschillende secties`);
    if (!PLEKKEN[s.id]) fout.push(`${s.id}: geen plek`);
  }
  // 2. Klussen: alle niveau-stations, 2–4 per klus, stations en kluis in de zone van de klus.
  const niveau = STATIONS.filter((s) => OPDRACHTEN[s.opdrachten[0]]?.sectie === 'niveau').map((s) => s.id);
  for (const id of niveau) if (KLUSSEN.filter((k) => k.stations.includes(id)).length !== 1) fout.push(`niveau-station ${id} niet in precies één klus`);
  for (const k of KLUSSEN) {
    if (k.stations.length < 2 || k.stations.length > 4) fout.push(`klus ${k.id}: ${k.stations.length} stations`);
    const zone = KLUS_ZONE[k.id] ?? [];
    for (const id of k.stations) {
      if (!niveau.includes(id)) fout.push(`klus ${k.id}: ${id} is geen niveau-station`);
      const km = kamerVan(...PLEKKEN[id].pos, PLEKKEN[id].verdieping ?? 0);
      if (!km || !zone.includes(km.id)) fout.push(`klus ${k.id}: ${id} staat niet in de klus-zone (${km?.id})`);
    }
    const kk = kamerVan(...KLUIS_PLEK[k.id].pos);
    if (!kk || !zone.includes(kk.id)) fout.push(`klus ${k.id}: kluis staat niet in de klus-zone (${kk?.id})`);
  }
  // 3. Strategie bij elke opdracht (behalve open), zonder het antwoord, max. 2 zinnen.
  for (const id of WERKBOEK) {
    const o = OPDRACHTEN[id];
    const st = STRATEGIE[id];
    if (o.type === 'open') continue;
    if (!st) {
      fout.push(`${id}: geen strategie`);
      continue;
    }
    if (o.antwoord && typeof o.antwoord.waarde === 'number') {
      const a = toon(o.antwoord.waarde).replace(/\s.*$/, '');
      if (new RegExp(`(^|[^0-9,.])${a.replace(/[.,]/g, (c) => `\\${c}`)}([^0-9,]|$)`).test(st)) fout.push(`${id}: strategie noemt het antwoord (${a})`);
    }
    if (st.split(/[.?!]\s/).length > 2) fout.push(`${id}: strategie heeft meer dan 2 zinnen`);
  }
  // 4. Plekken: in een kamer op de goede verdieping, niet door een muur of rand, niet over elkaar.
  const vlakken: R[] = [];
  const binnenKamer = (r: R, k: Kamer) => {
    const m = k.buiten ? 0.3 : 0.15;
    return r.x1 >= k.pos[0] - k.maat[0] / 2 + m - 1e-6 && r.x2 <= k.pos[0] + k.maat[0] / 2 - m + 1e-6 && r.z1 >= k.pos[1] - k.maat[1] / 2 + m - 1e-6 && r.z2 <= k.pos[1] + k.maat[1] / 2 - m + 1e-6;
  };
  for (const s of STATIONS) {
    const v = s.verdieping ?? 0;
    const k = kamerVan(...s.pos, v);
    const r = vakVan(s.id);
    if (!k) fout.push(`${s.id} staat niet in een kamer (verdieping ${v})`);
    else if (!binnenKamer(r, k)) fout.push(`${s.id} steekt door een muur of rand van ${k.id}`);
    vlakken.push(r);
  }
  for (const k of KLUSSEN) vlakken.push(rect(`kluis-${k.id}`, k.kluis.pos[0], k.kluis.pos[1], gedraaid(k.kluis.rot) ? 1.2 : 1.3, gedraaid(k.kluis.rot) ? 1.3 : 1.2, k.kluis.verdieping ?? 0));
  for (let i = 0; i < vlakken.length; i++) for (let j = i + 1; j < vlakken.length; j++) if (overlap(vlakken[i], vlakken[j], 0.01)) fout.push(`overlap: ${vlakken[i].naam} × ${vlakken[j].naam}`);
  // deuren, trappen, kolommen en de poort vrijhouden
  const deuren = [
    ...PLAN.doorgangen.filter((d) => d.soort !== 'raam').map((d) => ({ pos: d.pos, as: d.as, b: d.breed ?? (d.soort === 'dubbel' ? 2.4 : d.soort === 'roldeur' ? 3.6 : d.soort === 'open' ? 3 : 1.6), v: d.verdieping ?? 0 })),
    { pos: PLAN.uitgang.pos, as: PLAN.uitgang.as, b: 3.4, v: 0 },
  ];
  const deurVak = (d: (typeof deuren)[number]) => (d.as === 'x' ? rect('deur', d.pos[0], d.pos[1], d.b + 0.6, 3.0, d.v) : rect('deur', d.pos[0], d.pos[1], 3.0, d.b + 0.6, d.v));
  const vrij: R[] = [...deuren.map(deurVak)];
  for (const tr of PLAN.trappen ?? []) {
    const [a, b] = [trapOp(tr, -0.15), trapOp(tr, 1.15)];
    const w = tr.as === 'x' ? Math.abs(b[0] - a[0]) : tr.breed + 0.4;
    const d = tr.as === 'x' ? tr.breed + 0.4 : Math.abs(b[1] - a[1]);
    vrij.push(rect(`trap ${tr.pos.join(',')}`, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, w, d, tr.van), rect(`trapgat ${tr.pos.join(',')}`, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, w, d, tr.van + 1));
  }
  for (const k of PLAN.kamers) {
    if (!k.kolommen) continue;
    const [ax, az] = k.kolommen.afstand;
    const [rx, rz] = k.kolommen.rand ?? [ax / 2, az / 2];
    const x0 = k.pos[0] - k.maat[0] / 2;
    const z0 = k.pos[1] - k.maat[1] / 2;
    const dik = (k.kolommen.dikte ?? 0.45) + 0.1;
    for (let x = x0 + rx; x <= x0 + k.maat[0] - rx + 1e-3; x += ax) for (let z = z0 + rz; z <= z0 + k.maat[1] - rz + 1e-3; z += az) vrij.push(rect(`kolom ${k.id}`, x, z, dik, dik, k.verdieping ?? 0));
  }
  for (const f of vrij) for (const v of vlakken) if (overlap(v, f, 0.05)) fout.push(`${v.naam} staat in de weg van ${f.naam} (${((f.x1 + f.x2) / 2).toFixed(1)}, ${((f.z1 + f.z2) / 2).toFixed(1)})`);
  // 5. Decor (meubels, bolders, lantaarns, kranen): niet op een station, niet voor een deur of trap.
  const decor = [...DECOR_BOTSERS.map((d) => ({ ...d, v: d.v ?? 0 })), ...BUITEN_BOTSERS.map((d) => ({ ...d, v: 0 }))].map((d) => rect(`decor ${d.naam} (${d.x}, ${d.z})`, d.x, d.z, d.b, d.d, d.v));
  // hekken en pijlers naast een poortje staan óp de deurlijn: die mogen alleen de opening zelf niet raken
  const opening = (d: (typeof deuren)[number]) => (d.as === 'x' ? rect('opening', d.pos[0], d.pos[1], d.b, 0.4, d.v) : rect('opening', d.pos[0], d.pos[1], 0.4, d.b, d.v));
  for (const d of decor) {
    for (const v of vlakken) if (overlap(v, d, 0.01)) fout.push(`overlap: ${v.naam} × ${d.naam}`);
    const opDeLijn = /decor (hek|poortpijler)/.test(d.naam);
    for (const f of vrij) if (!f.naam.startsWith('kolom') && !(opDeLijn && f.naam === 'deur') && overlap(d, f, 0.05)) fout.push(`${d.naam} staat in de weg van ${f.naam}`);
    if (opDeLijn) for (const dr of deuren) if (overlap(d, opening(dr), 0.01)) fout.push(`${d.naam} staat in de opening op (${dr.pos.join(', ')})`);
  }
  // 6. Minstens 0,9 m vrij vóór elk station (binnen de kamers, geen station, decor of kolom).
  for (const s of STATIONS) {
    const f = voorVan(s.id);
    const v = s.verdieping ?? 0;
    const hoeken: [number, number][] = [
      [f.x1 + 0.02, f.z1 + 0.02],
      [f.x2 - 0.02, f.z1 + 0.02],
      [f.x1 + 0.02, f.z2 - 0.02],
      [f.x2 - 0.02, f.z2 - 0.02],
    ];
    if (hoeken.some(([x, z]) => !kamerVan(x, z, v))) fout.push(`${s.id}: geen 0,9 m vrij vóór het station (rand van de kamer)`);
    for (const o of [...vlakken.filter((x) => x.naam !== s.id), ...decor, ...vrij.filter((x) => x.naam.startsWith('kolom'))]) if (overlap(f, o, 0.02)) fout.push(`${s.id}: geen 0,9 m vrij vóór het station (${o.naam})`);
  }
  // 7. Lampjes en spawn: in een kamer en niet in een station of decor.
  for (const p of [...LAMPJES_HUIS, SPAWN]) {
    const [x, z] = p;
    const v = (p as number[])[2] ?? 0;
    if (!kamerVan(x, z, v)) fout.push(`punt (${x}, ${z}, v${v}) ligt niet in een kamer`);
    for (const o of [...vlakken, ...decor]) if (overlap(o, rect('p', x, z, 0.6, 0.6, v))) fout.push(`punt (${x}, ${z}) ligt in ${o.naam}`);
  }
  if (LAMPJES_HUIS.length < 6 || LAMPJES_HUIS.length > 9) fout.push(`${LAMPJES_HUIS.length} lampjes`);
  // 8. Kamers: overlappen niet (per verdieping).
  const kamers = PLAN.kamers.map((k) => rect(k.id, k.pos[0], k.pos[1], k.maat[0], k.maat[1], k.verdieping ?? 0));
  for (let i = 0; i < kamers.length; i++) for (let j = i + 1; j < kamers.length; j++) if (overlap(kamers[i], kamers[j], 0.01)) fout.push(`kamers overlappen: ${kamers[i].naam} × ${kamers[j].naam}`);
  return fout;
}

/**
 * Bereikbaarheid met de padzoeker van de motor (alle deuren open, zoals bij de docent): vanaf de start naar een punt
 * vóór elk station en elke kluis. Op verdieping 1 vanaf de bovenkant van de trap.
 */
export function bereikbaar(): string[] {
  const s = useSpel.getState();
  const docent = s.docent;
  s.setDocent(true);
  registreerWereld(wereld1!);
  const fout: string[] = [];
  const doelen = [
    ...STATIONS.map((st) => ({ id: st.id, r: voorVan(st.id) })),
    ...KLUSSEN.map((k) => {
      const fx = Math.round(Math.sin(k.kluis.rot ?? 0));
      const fz = Math.round(Math.cos(k.kluis.rot ?? 0));
      return { id: `kluis-${k.id}`, r: rect(`voor kluis-${k.id}`, k.kluis.pos[0] + fx * 1.2, k.kluis.pos[1] + fz * 1.2, 0.6, 0.6, 0) };
    }),
  ];
  for (const { id, r } of doelen) {
    const doel: [number, number] = [(r.x1 + r.x2) / 2, (r.z1 + r.z2) / 2];
    let pad: [number, number][] | null = null;
    if (r.v === 0) pad = zoekPad(SPAWN[0], SPAWN[1], doel[0], doel[1], undefined, 0);
    else {
      const tr = (PLAN.trappen ?? []).find((t) => t.van === r.v - 1 && Math.abs(t.pos[0] - doel[0]) < 14 && Math.abs(t.pos[1] - doel[1]) < 14);
      if (!tr) {
        fout.push(`${id}: geen trap naar verdieping ${r.v}`);
        continue;
      }
      const [bx, bz] = trapOp(tr, 1.08);
      opLaag(r.v, () => undefined);
      pad = zoekPad(bx, bz, doel[0], doel[1], undefined, r.v);
      const [ox, oz] = trapOp(tr, -0.08);
      if (pad && !zoekPad(SPAWN[0], SPAWN[1], ox, oz, undefined, 0)) pad = null;
    }
    if (!pad) fout.push(`${id}: niet bereikbaar vanaf de start`);
  }
  s.setDocent(docent);
  registreerWereld(wereld1!);
  return fout;
}

/** Overzicht: station → kamer → opdrachten (voor het eindrapport). */
export function overzicht() {
  return STATIONS.map((s) => `${s.id} (${kamerVan(...s.pos, s.verdieping ?? 0)?.naam}): ${s.opdrachten.join(', ')}`);
}
