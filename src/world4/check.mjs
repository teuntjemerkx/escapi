// Controle van Wereld 4 (Winkelcentrum De Honderd): elke werkboekopdracht in precies één station,
// klussen = alle niveau-stations in hun eigen zone, strategie-tips zonder antwoord, deel-ids die echt in een model staan,
// en het gebouw: alles in een kamer van de goede verdieping, geen overlap, 0,9 m vrij voor elk station,
// deuren, roltrappen en uitgang vrij, en elk station bereikbaar vanaf de start (rooster over beide verdiepingen).
// Gebruik: node src/world4/check.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { KLUIS_PLEK, LAMPJES_HUIS, PLAN, PLEKKEN, RAD, SPAWN } from './huis.ts';
import { MEUBELS, ZUILEN, ZUIL_R } from './inrichting.ts';

const map = new URL('.', import.meta.url).pathname;
const plan = JSON.parse(readFileSync(map + 'plan.json', 'utf8'));
const data = JSON.parse(readFileSync(map + '../data/onderdeel4.json', 'utf8'));
let fout = 0;
const meld = (...m) => (console.log('  ✗', ...m), fout++);

const ops = data.opdrachten;
const werk = new Map(ops.map((o) => [o.id, o]));
const teller = new Map();
for (const [id, st] of Object.entries(plan.stations)) {
  // Praktijkopdracht A (PRA-01a t/m j) hoort bij één voorwerp: de drie telefoonwinkels.
  const max = id === 'drie-winkels' ? 10 : 4;
  if (st.opdrachten.length > max) meld(`${id}: ${st.opdrachten.length} opdrachten (max ${max})`);
  if (!plan.kamers[st.kamer]) meld(`${id}: onbekende kamer ${st.kamer}`);
  const secties = new Set(st.opdrachten.filter((o) => werk.has(o)).map((o) => werk.get(o).sectie));
  if (secties.size > 1) meld(`${id}: gemengde secties ${[...secties]}`);
  for (const o of st.opdrachten) {
    if (!werk.has(o) && !/^W4-(TERUG|INSTR)$/.test(o)) meld(`${id}: onbekende opdracht ${o}`);
    teller.set(o, (teller.get(o) ?? 0) + 1);
  }
}
for (const o of ops) if ((teller.get(o.id) ?? 0) !== 1) meld(`${o.id} zit in ${teller.get(o.id) ?? 0} stations`);

// Klussen: alle niveau-stations, 2–4 per klus, in de eigen kamer.
const niveauSt = Object.entries(plan.stations)
  .filter(([, st]) => st.opdrachten.some((o) => werk.get(o)?.sectie === 'niveau'))
  .map(([id]) => id);
const inKlus = plan.klussen.flatMap((k) => k.stations);
for (const k of plan.klussen) {
  if (k.stations.length < 2 || k.stations.length > 4) meld(`klus ${k.id}: ${k.stations.length} stations`);
  for (const s of k.stations) {
    if (!niveauSt.includes(s)) meld(`klus ${k.id}: ${s} is geen niveau-station`);
    if (plan.stations[s]?.kamer !== k.kamer) meld(`klus ${k.id}: ${s} staat niet in zone ${k.kamer}`);
  }
}
for (const s of niveauSt) if (inKlus.filter((x) => x === s).length !== 1) meld(`niveau-station ${s} zit niet in precies één klus`);

// Stations.tsx moet elk station uit het plan een model geven.
const stationsBron = readFileSync(map + 'stations.tsx', 'utf8');
for (const id of Object.keys(plan.stations)) if (!new RegExp(`(^|[\\s{,])['"]?${id}['"]?\\s*:\\s*V\\(`, 'm').test(stationsBron)) meld(`station ${id} heeft geen model in stations.tsx`);

// Strategie: elke werkboekopdracht (behalve open) heeft een tip zonder antwoord of tussenuitkomst.
const strat = readFileSync(map + 'strategie.ts', 'utf8');
const tips = Object.fromEntries([...strat.matchAll(/'(O4-[A-Z]+-\d+[a-z]?)':\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => [m[1], m[2]]));
const nl = (v) => String(v).replace('.', ',');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const noemt = (t, v) => new RegExp(`(^|[^0-9,.])${esc(nl(v))}([^0-9,]|$)`).test(t);
for (const o of ops) {
  if (o.type === 'open') continue;
  const t = tips[o.id];
  if (!t) {
    meld(`geen strategie voor ${o.id}`);
    continue;
  }
  const zinnen = t.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (zinnen.length > 2) meld(`${o.id}: strategie heeft ${zinnen.length} zinnen`);
  const w = o.antwoord?.waarde;
  if (w !== undefined && w !== null && String(w).length > 1 && noemt(t, w)) meld(`${o.id}: strategie noemt het antwoord (${w})`);
  const vraag = o.vraag.join(' ');
  for (const s of o.stappen)
    if (typeof s.uitkomst === 'number' && String(s.uitkomst).length > 1 && !vraag.includes(nl(s.uitkomst)) && noemt(t, s.uitkomst))
      meld(`${o.id}: strategie noemt een tussenuitkomst (${s.uitkomst})`);
}

// Deel-ids uit de stappen moeten als <Deel id="..."> in een model staan.
const bron = readdirSync(map)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => readFileSync(map + f, 'utf8'))
  .join('\n');
const delen = new Set([...bron.matchAll(/<Deel\s+id="([^"]+)"/g)].map((m) => m[1]));
for (const o of ops) for (const s of o.stappen) if (s.deel && !delen.has(s.deel)) meld(`${o.id}: deel "${s.deel}" bestaat niet in een model`);
for (const m of stationsBron.matchAll(/deel:\s*'([^']+)'/g)) if (!delen.has(m[1])) meld(`eigen opdracht: deel "${m[1]}" bestaat niet in een model`);
// Stationsmodellen worden tijdens het lopen samengevoegd (Statisch): instancedMesh valt dan samen tot één vorm.
if (/<instancedMesh/.test(bron)) meld('gebruik geen instancedMesh in een model of decor (Statisch voegt het samen tot één vorm)');


// ── Gebouw: kamers per verdieping, zones, voetafdrukken, vrije ruimte, deuren, roltrappen, lampjes en bereikbaarheid ──
const kamerOp = (x, z, v = 0) => PLAN.kamers.find((k) => (k.verdieping ?? 0) === v && Math.abs(x - k.pos[0]) <= k.maat[0] / 2 && Math.abs(z - k.pos[1]) <= k.maat[1] / 2);
const kamerStrikt = (x, z, v = 0) => PLAN.kamers.find((k) => (k.verdieping ?? 0) === v && Math.abs(x - k.pos[0]) < k.maat[0] / 2 && Math.abs(z - k.pos[1]) < k.maat[1] / 2);
const zoneVan = (kamerId) => Object.entries(plan.kamers).find(([, z]) => z.kamers?.includes(kamerId))?.[0];
const rect = (naam, soort, x, z, w, d, v = 0) => ({ naam, soort, v, x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2 });
const overlap = (a, b, marge = 0) => Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > marge && Math.min(a.z2, b.z2) - Math.max(a.z1, b.z1) > marge;
const R2 = Math.PI / 2;
const gedraaid = (rot = 0) => Math.abs(Math.sin(rot)) > 0.5;

// elke zone in plan.json bestaat uit echte kamers
for (const [id, z] of Object.entries(plan.kamers)) for (const k of z.kamers ?? []) if (!PLAN.kamers.some((kk) => kk.id === k)) meld(`zone ${id}: kamer ${k} bestaat niet`);

const vlakken = [];
const stationsVlak = [];
for (const [id, p] of Object.entries(PLEKKEN)) {
  if (!plan.stations[id]) meld(`plek voor onbekend station ${id}`);
  const b = p.botser ?? (p.tafel ? [p.tafel[0] + 0.1, p.tafel[1] + 0.1] : null);
  if (!b) meld(`${id}: geen botser of tafel`);
  else {
    const r = { ...rect(id, 'station', p.pos[0], p.pos[1], b[0], b[1], p.verdieping ?? 0), rot: p.rot ?? 0 };
    vlakken.push(r);
    stationsVlak.push(r);
  }
}
for (const id of Object.keys(plan.stations)) if (!PLEKKEN[id]) meld(`station ${id} heeft geen plek in huis.ts`);
for (const k of plan.klussen) {
  const p = KLUIS_PLEK[k.id];
  if (!p) meld(`klus ${k.id}: geen kluisplek`);
  else {
    const [x, z, v] = p;
    const r = { ...rect(`kluis-${k.id}`, 'kluis', x, z, 1.2, 1.2, v), rot: x > 0 ? -R2 : R2 };
    vlakken.push(r);
    stationsVlak.push(r);
    const kamer = kamerOp(x, z, v);
    if (!kamer || zoneVan(kamer.id) !== k.kamer) meld(`kluis ${k.id} staat niet in zone ${k.kamer}`);
  }
}
MEUBELS.forEach((m, i) => m.maat && vlakken.push(rect(`${m.soort}#${i}`, 'meubel', m.pos[0], m.pos[1], m.maat[0], m.maat[1], m.v ?? 0)));
for (const v of [0, 1]) ZUILEN.forEach(([x, z], i) => vlakken.push(rect(`zuil#${i}@${v}`, 'zuil', x, z, ZUIL_R * 2, ZUIL_R * 2, v)));
vlakken.push(rect('reuzenrad-voet', 'meubel', RAD.pos[0], RAD.pos[1], 2.8, 6.6, 1));
// zuil van de poort (motor: lokaal [−2,9; 1,6] bij een poort met rot 0)
vlakken.push(rect('poortzuil', 'meubel', PLAN.uitgang.pos[0] - 2.9, PLAN.uitgang.pos[1] + 1.6, 0.9, 0.9, 0));

// in een kamer van de goede verdieping, binnen de muren, en stations in hun zone
for (const v of vlakken) {
  const mx = (v.x1 + v.x2) / 2, mz = (v.z1 + v.z2) / 2;
  const k = kamerOp(mx, mz, v.v);
  if (!k) { meld(`${v.naam} staat buiten het gebouw (verdieping ${v.v})`); continue; }
  if (v.soort === 'zuil') continue;
  const m = 0.15;
  if (v.x1 < k.pos[0] - k.maat[0] / 2 + m || v.x2 > k.pos[0] + k.maat[0] / 2 - m || v.z1 < k.pos[1] - k.maat[1] / 2 + m || v.z2 > k.pos[1] + k.maat[1] / 2 - m) {
    // over de grens van een open kamer heen (galerijstroken, serre en terras) mag, als het daar ook een kamer is
    const hoeken = [[v.x1, v.z1], [v.x1, v.z2], [v.x2, v.z1], [v.x2, v.z2]];
    if (!hoeken.every(([x, z]) => kamerOp(x, z, v.v)) || (v.soort === 'station' && !k.open && !kamerOp(mx, mz, v.v)?.open)) meld(`${v.naam} raakt de muur van ${k.id}`);
  }
  if (v.soort === 'station' && plan.stations[v.naam]?.kamer !== zoneVan(k.id)) meld(`${v.naam} staat in ${k.id} (zone ${zoneVan(k.id)}), plan zegt ${plan.stations[v.naam]?.kamer}`);
}
// geen overlap (per verdieping)
for (let i = 0; i < vlakken.length; i++)
  for (let j = i + 1; j < vlakken.length; j++) {
    const a = vlakken[i], b = vlakken[j];
    if (a.v !== b.v) continue;
    if (overlap(a, b, 0.01)) meld(`overlap: ${a.naam} × ${b.naam}`);
  }

// 0,9 m vrij voor elk station (de voorkant: rot 0 = +z, R = +x, −R = −x, 2R = −z)
for (const s of stationsVlak) {
  const r = s.rot;
  const nx = Math.round(Math.sin(r)), nz = Math.round(Math.cos(r));
  const w = nx ? s.z2 - s.z1 : s.x2 - s.x1;
  const cx = nx ? (nx > 0 ? s.x2 + 0.45 : s.x1 - 0.45) : (s.x1 + s.x2) / 2;
  const cz = nz ? (nz > 0 ? s.z2 + 0.45 : s.z1 - 0.45) : (s.z1 + s.z2) / 2;
  const voor = rect(`voor ${s.naam}`, 'vrij', cx, cz, nx ? 0.9 : w * 0.8, nx ? w * 0.8 : 0.9, s.v);
  const hoeken = [[voor.x1, voor.z1], [voor.x1, voor.z2], [voor.x2, voor.z1], [voor.x2, voor.z2]];
  const k0 = kamerStrikt((s.x1 + s.x2) / 2, (s.z1 + s.z2) / 2, s.v);
  if (!hoeken.every(([x, z]) => { const k = kamerOp(x, z, s.v); return k && (k === k0 || k0?.open || k.open || k.buiten); })) meld(`voor ${s.naam} is minder dan 0,9 m vrij (muur)`);
  for (const v of vlakken) if (v !== s && v.v === s.v && overlap(voor, v, 0.01)) meld(`voor ${s.naam} staat ${v.naam}`);
}

// deuren, puien, rolhekken en de uitgang vrij (1,5 m aan beide kanten, over de breedte van de echte opening)
const zones = [];
for (const [i, d] of PLAN.doorgangen.entries()) {
  if (d.soort === 'raam') continue;
  const br = d.soort === 'pui' ? (d.deurBreed ?? 2) : (d.breed ?? (d.soort === 'dubbel' ? 2.4 : d.soort === 'open' ? 3 : 1.6));
  const v = d.verdieping ?? 0;
  zones.push(d.as === 'x' ? rect(`doorgang${i}@${d.pos}`, 'deur', d.pos[0], d.pos[1], br, 3.0, v) : rect(`doorgang${i}@${d.pos}`, 'deur', d.pos[0], d.pos[1], 3.0, br, v));
}
zones.push(rect('uitgang', 'deur', PLAN.uitgang.pos[0], PLAN.uitgang.pos[1] + 1.5, 3.4, 3.0, 0));
// roltrappen: de trap zelf en 1,5 m om op en af te stappen
const trapPunt = (tr, t) => { const l = (t - 0.5) * tr.lengte * tr.richting; return tr.as === 'x' ? [tr.pos[0] + l, tr.pos[1]] : [tr.pos[0], tr.pos[1] + l]; };
for (const [i, tr] of (PLAN.trappen ?? []).entries()) {
  const [ax, az] = trapPunt(tr, -0.17);
  const [bx, bz] = trapPunt(tr, 1.17);
  const lang = tr.lengte + 0.0;
  zones.push(tr.as === 'x' ? rect(`roltrap${i}`, 'trap', tr.pos[0], tr.pos[1], lang, tr.breed + 0.3, tr.van) : rect(`roltrap${i}`, 'trap', tr.pos[0], tr.pos[1], tr.breed + 0.3, lang, tr.van));
  zones.push(rect(`roltrap${i}-onder`, 'trap', ax, az, tr.as === 'x' ? 1.5 : tr.breed + 0.3, tr.as === 'x' ? tr.breed + 0.3 : 1.5, tr.van));
  zones.push(rect(`roltrap${i}-boven`, 'trap', bx, bz, tr.as === 'x' ? 1.5 : tr.breed + 0.3, tr.as === 'x' ? tr.breed + 0.3 : 1.5, tr.van + 1));
  // bovenaan precies op de galerijrand
  const [tx, tz] = trapPunt(tr, 1);
  const rand = PLAN.kamers.some((k) => (k.verdieping ?? 0) === tr.van + 1 && k.galerij && (Math.abs(Math.abs(tz - k.pos[1]) - k.maat[1] / 2) < 0.02 || Math.abs(Math.abs(tx - k.pos[0]) - k.maat[0] / 2) < 0.02));
  if (!rand) meld(`roltrap ${i} komt bovenaan niet op een galerijrand uit`);
}
for (const zo of zones) for (const v of vlakken) if (v.v === zo.v && overlap(zo, v, 0.01)) meld(`${v.naam} staat voor ${zo.naam}`);

// doorgangen liggen op een muur tussen twee kamers van dezelfde verdieping (een raam mag ook in een buitenmuur)
for (const d of PLAN.doorgangen) {
  const [x, z] = d.pos;
  const v = d.verdieping ?? 0;
  const a = d.as === 'x' ? kamerStrikt(x, z + 0.3, v) : kamerStrikt(x + 0.3, z, v);
  const b = d.as === 'x' ? kamerStrikt(x, z - 0.3, v) : kamerStrikt(x - 0.3, z, v);
  if (d.soort === 'raam' ? !a && !b : !a || !b || a === b) meld(`doorgang ${d.soort} op ${d.pos} (verdieping ${v}) ligt niet tussen twee kamers`);
}

// lampjes en spawn
for (const [i, [x, z, v]] of LAMPJES_HUIS.entries()) {
  if (!kamerOp(x, z, v)) meld(`lampje ${i} ligt buiten het gebouw`);
  for (const r of vlakken) if (r.v === v && x > r.x1 - 0.3 && x < r.x2 + 0.3 && z > r.z1 - 0.3 && z < r.z2 + 0.3) meld(`lampje ${i} ligt in ${r.naam}`);
  for (const zo of zones) if (zo.v === v && x > zo.x1 && x < zo.x2 && z > zo.z1 && z < zo.z2) meld(`lampje ${i} ligt in ${zo.naam}`);
}
if (LAMPJES_HUIS.length < 6 || LAMPJES_HUIS.length > 9) meld('aantal lampjes moet 6–9 zijn');
if (kamerOp(...SPAWN, 0)?.id !== 'lift') meld('spawn staat niet in het liftportaal');
for (const v of vlakken) if (v.v === 0 && SPAWN[0] > v.x1 - 0.5 && SPAWN[0] < v.x2 + 0.5 && SPAWN[1] > v.z1 - 0.5 && SPAWN[1] < v.z2 + 0.5) meld(`spawn staat in ${v.naam}`);

// bereikbaarheid: rooster van 0,25 m per verdieping; over een muur alleen door een opening (of een open zijde); roltrappen verbinden
const CEL = 0.25;
const STRAAL = 0.42; // zoals STRAAL_PAD in game/botsing.ts
const opening = (v, ax, az, bx, bz) => {
  const ka = kamerStrikt(ax, az, v), kb = kamerStrikt(bx, bz, v);
  if (ka === kb) return true;
  if (!ka || !kb) return false;
  if (ka.buiten && kb.buiten) return true;
  // open zijde ('n' = −z, 'z' = +z, 'w' = −x, 'o' = +x) van een van beide
  const dx = Math.sign(bx - ax), dz = Math.sign(bz - az);
  const kant = (k, sx, sz) => (sx > 0 ? 'o' : sx < 0 ? 'w' : sz > 0 ? 'z' : 'n');
  if (ka.open?.includes(kant(ka, dx, dz)) || kb.open?.includes(kant(kb, -dx, -dz))) return true;
  for (const d of PLAN.doorgangen) {
    if ((d.verdieping ?? 0) !== v || d.soort === 'raam') continue;
    const br = d.soort === 'pui' ? (d.deurBreed ?? 2) : (d.breed ?? (d.soort === 'dubbel' ? 2.4 : d.soort === 'open' ? 3 : 1.6));
    if (d.as === 'x' && dz && Math.min(az, bz) <= d.pos[1] && Math.max(az, bz) >= d.pos[1] && Math.abs((ax + bx) / 2 - d.pos[0]) <= br / 2 - STRAAL) return true;
    if (d.as === 'z' && dx && Math.min(ax, bx) <= d.pos[0] && Math.max(ax, bx) >= d.pos[0] && Math.abs((az + bz) / 2 - d.pos[1]) <= br / 2 - STRAAL) return true;
  }
  return false;
};
// Randen en balustrades (rand van een buitenruimte of een galerij boven een vide) botsen in de motor 0,6 m dik:
// een cel is niet vrij als er binnen 0,3 m + straal geen kamer van deze verdieping is (de vide of het niets).
const BALUSTRADE = 0.3;
const naastLeegte = (v, x, z) => {
  const d = BALUSTRADE + STRAAL;
  for (const [dx, dz] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, d], [d, -d], [-d, d], [-d, -d]]) if (!kamerStrikt(x + dx, z + dz, v)) return true;
  return false;
};
const vrij = (v, x, z) => {
  if (!kamerStrikt(x, z, v)) return false;
  if (v > 0 && naastLeegte(v, x, z)) return false;
  for (const r of vlakken) if (r.v === v && x > r.x1 - STRAAL && x < r.x2 + STRAAL && z > r.z1 - STRAAL && z < r.z2 + STRAAL) return false;
  for (const tr of PLAN.trappen ?? []) {
    if (tr.van !== v && tr.van + 1 !== v) continue;
    const [lo, hi] = [trapPunt(tr, 0), trapPunt(tr, 1)];
    const x1 = Math.min(lo[0], hi[0]) - (tr.as === 'z' ? tr.breed / 2 : 0), x2 = Math.max(lo[0], hi[0]) + (tr.as === 'z' ? tr.breed / 2 : 0);
    const z1 = Math.min(lo[1], hi[1]) - (tr.as === 'x' ? tr.breed / 2 : 0), z2 = Math.max(lo[1], hi[1]) + (tr.as === 'x' ? tr.breed / 2 : 0);
    if (x > x1 - STRAAL && x < x2 + STRAAL && z > z1 - STRAAL && z < z2 + STRAAL) return false;
  }
  return true;
};
const sleutel = (v, i, j) => `${v}:${i}:${j}`;
const bereikt = new Set();
const rij = [];
// celmiddens op een halve cel, zodat geen cel precies op een muurlijn ligt
const naarCel = (x, z) => [Math.floor(x / CEL), Math.floor(z / CEL)];
const midden = (i) => (i + 0.5) * CEL;
const start = naarCel(...SPAWN);
rij.push([0, ...start]);
bereikt.add(sleutel(0, ...start));
// roltrappen: van net onder de voet naar net boven de top
const sprongen = (PLAN.trappen ?? []).map((tr) => ({ van: tr.van, a: naarCel(...trapPunt(tr, -0.2)), b: naarCel(...trapPunt(tr, 1.2)) }));
while (rij.length) {
  const [v, i, j] = rij.shift();
  const x = midden(i), z = midden(j);
  const buren = [[v, i + 1, j], [v, i - 1, j], [v, i, j + 1], [v, i, j - 1]];
  for (const s of sprongen) {
    if (v === s.van && Math.abs(i - s.a[0]) <= 1 && Math.abs(j - s.a[1]) <= 1) buren.push([v + 1, ...s.b]);
    if (v === s.van + 1 && Math.abs(i - s.b[0]) <= 1 && Math.abs(j - s.b[1]) <= 1) buren.push([v - 1, ...s.a]);
  }
  for (const [nv, ni, nj] of buren) {
    const k = sleutel(nv, ni, nj);
    if (bereikt.has(k)) continue;
    const nx = midden(ni), nz = midden(nj);
    if (!vrij(nv, nx, nz)) continue;
    if (nv === v && !opening(v, x, z, nx, nz)) continue;
    bereikt.add(k);
    rij.push([nv, ni, nj]);
  }
}
// elk station (en elke kluis) is bereikbaar: een vrije cel vlak voor de voorkant
for (const s of stationsVlak) {
  const nx = Math.round(Math.sin(s.rot)), nz = Math.round(Math.cos(s.rot));
  const px = nx ? (nx > 0 ? s.x2 + 0.5 : s.x1 - 0.5) : (s.x1 + s.x2) / 2;
  const pz = nz ? (nz > 0 ? s.z2 + 0.5 : s.z1 - 0.5) : (s.z1 + s.z2) / 2;
  const [ci, cj] = naarCel(px, pz);
  let ok = false;
  for (let di = -2; di <= 2 && !ok; di++) for (let dj = -2; dj <= 2 && !ok; dj++) ok = bereikt.has(sleutel(s.v, ci + di, cj + dj));
  if (!ok) meld(`${s.naam} is niet bereikbaar vanaf de start`);
}
for (const [i, [x, z, v]] of LAMPJES_HUIS.entries()) {
  const [ci, cj] = naarCel(x, z);
  let ok = false;
  for (let di = -3; di <= 3 && !ok; di++) for (let dj = -3; dj <= 3 && !ok; dj++) ok = bereikt.has(sleutel(v, ci + di, cj + dj));
  if (!ok) meld(`lampje ${i} is niet bereikbaar`);
}
const perV = [0, 1].map((v) => [...bereikt].filter((k) => k.startsWith(`${v}:`)).length * CEL * CEL);
console.log(`gebouw: ${PLAN.kamers.length} kamers, ${PLAN.doorgangen.length} doorgangen, ${(PLAN.trappen ?? []).length} roltrappen, ${vlakken.length} voorwerpen; bereikbaar ${perV[0].toFixed(0)} m² beneden en ${perV[1].toFixed(0)} m² boven`);

// stations per zone (niet te vol)
for (const [id] of Object.entries(plan.kamers)) {
  const n = Object.values(plan.stations).filter((s) => s.kamer === id).length;
  if (n > 10) meld(`zone ${id}: ${n} stations`);
}

console.log(`${ops.length} werkboekopdrachten, ${Object.keys(plan.stations).length} stations, ${Object.keys(plan.kamers).length} zones, ${plan.klussen.length} klussen`);
console.log(fout ? `${fout} problemen` : 'alles ok');
process.exit(fout ? 1 : 0);
