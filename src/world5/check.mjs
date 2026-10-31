// Controle van Wereld 5 (Meetstation Noorderlicht). Gebruik: node src/world5/check.mjs
// 1. Elke werkboekopdracht in precies één station (Zero Error).
// 2. Elk station, elke kluis en elk meubel binnen een kamer van de goede verdieping, zonder overlap.
// 3. Voor elk station minstens 0,9 m vrij (aan de kant waar je ervoor staat).
// 4. Padzoeken op een raster van 0,1 m (poppetje met straal 0,42 m), over de trappen heen:
//    vanaf de start is elk station en elke kluis te bereiken. Alle deuren open (zoals de docent).
import { readFileSync } from 'node:fs';

const g = JSON.parse(readFileSync(new URL('./gebouw.json', import.meta.url), 'utf8'));
const data = JSON.parse(readFileSync(new URL('../data/onderdeel5.json', import.meta.url), 'utf8'));
let fout = 0;
const meld = (m) => (fout++, console.log('FOUT   ' + m));
const let_op = (m) => console.log('LET OP ' + m);

// ── 1. opdrachten ──
const teller = new Map();
for (const [id, st] of Object.entries(g.stations)) for (const o of st.opdrachten) teller.set(o, [...(teller.get(o) ?? []), id]);
for (const o of data.opdrachten) {
  const n = teller.get(o.id) ?? [];
  if (n.length !== 1) meld(`${o.id} zit in ${n.length} stations (${n.join(', ')})`);
}
for (const extra of ['W5-TERUG', 'W5-INSTR']) if ((teller.get(extra) ?? []).length !== 1) meld(`${extra} ontbreekt`);
for (const o of teller.keys()) if (!o.startsWith('W5-') && !data.opdrachten.some((x) => x.id === o)) meld(`onbekende opdracht ${o}`);
for (const [id, st] of Object.entries(g.stations)) {
  const secties = new Set(st.opdrachten.map((o) => data.opdrachten.find((x) => x.id === o)?.sectie ?? 'eigen'));
  if (secties.size > 1) meld(`${id} mengt secties ${[...secties].join(', ')}`);
}

// ── hulpjes ──
const HV = g.verdiepingHoogte;
const R = 0.42; // straal van het poppetje bij padzoeken
const kamersOp = (v) => g.kamers.filter((k) => (k.verdieping ?? 0) === v);
const kamerOp = (x, z, v = 0) => kamersOp(v).find((k) => Math.abs(x - k.pos[0]) < k.maat[0] / 2 && Math.abs(z - k.pos[1]) < k.maat[1] / 2);
const gedraaid = (rot = 0) => Math.abs(Math.sin(rot)) > 0.5;
const vak = (naam, x, z, b, d, v = 0, extra = {}) => ({ naam, v, x1: x - b / 2, x2: x + b / 2, z1: z - d / 2, z2: z + d / 2, ...extra });
const raakt = (a, b, marge = 0) => a.v === b.v && Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > marge && Math.min(a.z2, b.z2) - Math.max(a.z1, b.z1) > marge;
const binnenKamer = (v, marge = 0.15) => {
  const k = kamerOp((v.x1 + v.x2) / 2, (v.z1 + v.z2) / 2, v.v);
  if (!k) return null;
  const ok = v.x1 >= k.pos[0] - k.maat[0] / 2 + marge - 1e-6 && v.x2 <= k.pos[0] + k.maat[0] / 2 - marge + 1e-6 && v.z1 >= k.pos[1] - k.maat[1] / 2 + marge - 1e-6 && v.z2 <= k.pos[1] + k.maat[1] / 2 - marge + 1e-6;
  return { k, ok };
};

// ── 2. ruimte: stations, kluizen, meubels ──
const stations = Object.entries(g.stations).map(([id, st]) => {
  const [b, d] = gedraaid(st.rot) ? [st.botser[1], st.botser[0]] : st.botser;
  return vak(id, st.pos[0], st.pos[1], b, d, st.verdieping ?? 0, { rot: st.rot ?? 0, soort: 'station', botser: st.botser });
});
const kluizen = Object.entries(g.kluizen).map(([id, k]) => {
  const [b, d] = gedraaid(k.rot) ? [1.1, 1.2] : [1.2, 1.1];
  return vak(`kluis-${id}`, k.pos[0], k.pos[1], b, d, k.verdieping ?? 0, { rot: k.rot ?? 0, soort: 'kluis', botser: [1.2, 1.1] });
});
const meubels = [...(g.binnendecor ?? []), ...(g.buitendecor ?? [])].map((o) => vak(o.naam, o.pos[0], o.pos[1], o.maat[0], o.maat[1], o.verdieping ?? 0, { rond: !!o.rond, soort: 'meubel' }));
const lantaarns = (g.lantaarns ?? []).map(([x, z]) => vak(`lantaarn ${x},${z}`, x, z, 0.5, 0.5, 0, { rond: true, soort: 'meubel' }));
// zuil van de eindcheck naast de poort (de motor zet die op lokaal [-2,9; 1,6] van de uitgang, binnenkant = +z bij as 'x')
const u = g.uitgang;
const zuil = u.as === 'x' ? vak('zuil eindcheck', u.pos[0] - 2.9, u.pos[1] + 1.6, 0.9, 0.9) : vak('zuil eindcheck', u.pos[0] + 1.6, u.pos[1] + 2.9, 0.9, 0.9);
const dingen = [...stations, ...kluizen, ...meubels, ...lantaarns, zuil];

for (const v of [...stations, ...kluizen, ...meubels]) {
  const b = binnenKamer(v, v.soort === 'meubel' && kamerOp((v.x1 + v.x2) / 2, (v.z1 + v.z2) / 2, v.v)?.buiten ? 0.1 : 0.15);
  if (!b) meld(`${v.naam} staat buiten de plattegrond (verdieping ${v.v})`);
  else if (!b.ok) meld(`${v.naam} steekt door een muur van ${b.k.naam}`);
}
for (let i = 0; i < dingen.length; i++) for (let j = i + 1; j < dingen.length; j++) if (raakt(dingen[i], dingen[j], 0.01)) meld(`overlap: ${dingen[i].naam} × ${dingen[j].naam}`);

// trappen: rechthoek, en waar je eraf of erop stapt
const trappen = (g.trappen ?? []).map((t, i) => {
  const L = t.lengte;
  const as = t.as;
  const r = t.richting;
  const mid = t.pos;
  // s = afstand vanaf onderaan (0) naar boven (L); lat = opzij
  const sOf = (x, z) => (as === 'x' ? (x - mid[0]) * r : (z - mid[1]) * r) + L / 2;
  const latOf = (x, z) => (as === 'x' ? z - mid[1] : x - mid[0]);
  const rect = as === 'x' ? vak(`trap ${i}`, mid[0], mid[1], L, t.breed, t.van) : vak(`trap ${i}`, mid[0], mid[1], t.breed, L, t.van);
  const gat = { ...rect, naam: `trapgat ${i}`, v: t.van + 1 };
  return { ...t, i, L, sOf, latOf, rect, gat };
});
for (const t of trappen)
  for (const d of dingen) {
    if (raakt(t.rect, d, 0.01)) meld(`${d.naam} staat op trap ${t.i}`);
    if (raakt(t.gat, d, 0.01)) meld(`${d.naam} staat in het trapgat ${t.i}`);
  }

// doorgangen (geen ramen) en hun vrije ruimte
const doorgaand = g.doorgangen.filter((d) => d.soort !== 'raam');
const loopBreed = (d) => (d.soort === 'pui' ? d.deurBreed ?? 2 : d.soort === 'roldeur' ? d.breed ?? 3.6 : d.soort === 'open' ? d.breed ?? 3 : d.breed ?? (d.soort === 'dubbel' ? 2.4 : 1.6));
for (const d of doorgaand) {
  const v = d.verdieping ?? 0;
  const b = loopBreed(d);
  const vrij = d.as === 'x' ? vak(`deur ${d.pos}`, d.pos[0], d.pos[1], b, 2.0, v) : vak(`deur ${d.pos}`, d.pos[0], d.pos[1], 2.0, b, v);
  for (const x of dingen) if (raakt(vrij, x, 0.01)) meld(`${x.naam} staat in de doorgang ${d.pos} (verdieping ${v})`);
  const [a, c] = d.as === 'x' ? [kamerOp(d.pos[0], d.pos[1] - 0.3, v), kamerOp(d.pos[0], d.pos[1] + 0.3, v)] : [kamerOp(d.pos[0] - 0.3, d.pos[1], v), kamerOp(d.pos[0] + 0.3, d.pos[1], v)];
  if (!a || !c) meld(`deur ${d.pos} (verdieping ${v}) leidt naar het niets`);
}
for (const d of g.doorgangen.filter((d) => d.soort === 'raam')) {
  const v = d.verdieping ?? 0;
  const [a, c] = d.as === 'x' ? [kamerOp(d.pos[0], d.pos[1] - 0.3, v), kamerOp(d.pos[0], d.pos[1] + 0.3, v)] : [kamerOp(d.pos[0] - 0.3, d.pos[1], v), kamerOp(d.pos[0] + 0.3, d.pos[1], v)];
  if (!a && !c) meld(`raam ${d.pos} (verdieping ${v}) zit niet in een muur`);
}

// ── 3. vrije ruimte voor elk station (0,9 m aan de voorkant) ──
for (const s of stations) {
  const fx = Math.round(Math.sin(s.rot));
  const fz = Math.round(Math.cos(s.rot));
  const voor = fx === 1 ? { x1: s.x2, x2: s.x2 + 0.9, z1: s.z1, z2: s.z2 } : fx === -1 ? { x1: s.x1 - 0.9, x2: s.x1, z1: s.z1, z2: s.z2 } : fz === 1 ? { x1: s.x1, x2: s.x2, z1: s.z2, z2: s.z2 + 0.9 } : { x1: s.x1, x2: s.x2, z1: s.z1 - 0.9, z2: s.z1 };
  const vv = { ...voor, v: s.v, naam: `voor ${s.naam}` };
  const b = binnenKamer(vv, 0.1);
  if (!b || !b.ok) meld(`voor ${s.naam} is geen 0,9 m vrij (muur)`);
  for (const d of dingen) if (d !== s && raakt(vv, d, 0.02)) meld(`voor ${s.naam} staat ${d.naam} (minder dan 0,9 m vrij)`);
  for (const t of trappen) if (raakt(vv, t.rect, 0.02) || raakt(vv, t.gat, 0.02)) meld(`voor ${s.naam} ligt trap ${t.i}`);
}

// ── 4. padzoeken op een raster ──
const S = 0.1;
const X0 = -26, X1 = 26, Z0 = -24, Z1 = 19;
const NX = Math.round((X1 - X0) / S);
const NZ = Math.round((Z1 - Z0) / S);
const cx = (i) => X0 + (i + 0.5) * S;
const cz = (j) => Z0 + (j + 0.5) * S;
const afstandTot = (o, x, z) => {
  if (o.rond) return Math.hypot(x - (o.x1 + o.x2) / 2, z - (o.z1 + o.z2) / 2) - (o.x2 - o.x1) / 2;
  const dx = Math.max(o.x1 - x, 0, x - o.x2);
  const dz = Math.max(o.z1 - z, 0, z - o.z2);
  return Math.hypot(dx, dz);
};
const verdiepingen = [...new Set(g.kamers.map((k) => k.verdieping ?? 0))].sort();
function vrijRaster(v) {
  const vrij = new Uint8Array(NX * NZ);
  const kamers = kamersOp(v);
  const binnen = kamers.map((k) => ({ x1: k.pos[0] - k.maat[0] / 2 + 0.15 + R, x2: k.pos[0] + k.maat[0] / 2 - 0.15 - R, z1: k.pos[1] - k.maat[1] / 2 + 0.15 + R, z2: k.pos[1] + k.maat[1] / 2 - 0.15 - R }));
  // doorgangen
  for (const d of doorgaand.filter((d) => (d.verdieping ?? 0) === v)) {
    const b = loopBreed(d) / 2 - R;
    if (b <= 0.02) continue;
    binnen.push(d.as === 'x' ? { x1: d.pos[0] - b, x2: d.pos[0] + b, z1: d.pos[1] - 0.7, z2: d.pos[1] + 0.7 } : { x1: d.pos[0] - 0.7, x2: d.pos[0] + 0.7, z1: d.pos[1] - b, z2: d.pos[1] + b });
  }
  // twee buitenruimtes die elkaar raken: daar staat niets tussen
  for (const a of kamers)
    for (const b of kamers) {
      if (a === b || !a.buiten || !b.buiten) continue;
      const ax1 = a.pos[0] - a.maat[0] / 2, ax2 = a.pos[0] + a.maat[0] / 2, az1 = a.pos[1] - a.maat[1] / 2, az2 = a.pos[1] + a.maat[1] / 2;
      const bx1 = b.pos[0] - b.maat[0] / 2, bx2 = b.pos[0] + b.maat[0] / 2, bz1 = b.pos[1] - b.maat[1] / 2, bz2 = b.pos[1] + b.maat[1] / 2;
      const ox1 = Math.max(ax1, bx1), ox2 = Math.min(ax2, bx2), oz1 = Math.max(az1, bz1), oz2 = Math.min(az2, bz2);
      if (Math.abs(az2 - bz1) < 1e-6 && ox2 - ox1 > 1) binnen.push({ x1: ox1 + 0.15 + R, x2: ox2 - 0.15 - R, z1: az2 - 0.7, z2: az2 + 0.7 });
      if (Math.abs(ax2 - bx1) < 1e-6 && oz2 - oz1 > 1) binnen.push({ x1: ax2 - 0.7, x2: ax2 + 0.7, z1: oz1 + 0.15 + R, z2: oz2 - 0.15 - R });
    }
  const hier = dingen.filter((d) => d.v === v);
  for (let j = 0; j < NZ; j++)
    for (let i = 0; i < NX; i++) {
      const x = cx(i);
      const z = cz(j);
      if (!binnen.some((r) => x >= r.x1 && x <= r.x2 && z >= r.z1 && z <= r.z2)) continue;
      if (hier.some((o) => afstandTot(o, x, z) < R)) continue;
      let geblokt = false;
      for (const t of trappen) {
        const s = t.sOf(x, z);
        const lat = Math.abs(t.latOf(x, z));
        if (lat >= t.breed / 2 + R) continue;
        if (v === t.van && s > 0 && s < t.L + R) geblokt = true; // de trap zelf (onderaan stap je erop)
        if (v === t.van + 1 && s > -R && s < t.L) geblokt = true; // het trapgat (bovenaan stap je eraf)
      }
      if (!geblokt) vrij[j * NX + i] = 1;
    }
  return vrij;
}
const vrij = Object.fromEntries(verdiepingen.map((v) => [v, vrijRaster(v)]));
const bereikt = Object.fromEntries(verdiepingen.map((v) => [v, new Uint8Array(NX * NZ)]));
const idx = (x, z) => {
  const i = Math.floor((x - X0) / S);
  const j = Math.floor((z - Z0) / S);
  return i < 0 || j < 0 || i >= NX || j >= NZ ? -1 : j * NX + i;
};
function vul(v, start) {
  const rij = [];
  for (const k of start) if (vrij[v][k] && !bereikt[v][k]) (bereikt[v][k] = 1), rij.push(k);
  let nieuw = rij.length;
  while (rij.length) {
    const k = rij.pop();
    const i = k % NX;
    const j = (k - i) / NX;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di;
      const jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= NX || jj >= NZ) continue;
      const n = jj * NX + ii;
      if (vrij[v][n] && !bereikt[v][n]) (bereikt[v][n] = 1), rij.push(n), nieuw++;
    }
  }
  return nieuw;
}
const startK = idx(g.spawn[0], g.spawn[1]);
if (startK < 0 || !vrij[0][startK]) meld('de startplek is niet vrij');
vul(0, [startK]);
// over de trappen: herhaal tot er niets meer bij komt
for (let ronde = 0; ronde < 6; ronde++) {
  let erbij = 0;
  for (const t of trappen) {
    const zone = (v, s0, s1) => {
      const uit = [];
      for (let j = 0; j < NZ; j++)
        for (let i = 0; i < NX; i++) {
          const x = cx(i);
          const z = cz(j);
          const s = t.sOf(x, z);
          if (s >= s0 && s <= s1 && Math.abs(t.latOf(x, z)) <= t.breed / 2 - 0.1) uit.push(j * NX + i);
        }
      return uit;
    };
    const onder = zone(t.van, -0.2 * t.L, 0.02 * t.L);
    const boven = zone(t.van + 1, t.L, 1.2 * t.L);
    if (onder.some((k) => bereikt[t.van][k])) erbij += vul(t.van + 1, boven);
    if (boven.some((k) => bereikt[t.van + 1][k])) erbij += vul(t.van, onder);
  }
  if (!erbij) break;
}
// elk station en elke kluis: een bereikte plek in dezelfde kamer, binnen handbereik van de motor
let ok = 0;
for (const s of [...stations, ...kluizen]) {
  const mx = (s.x1 + s.x2) / 2;
  const mz = (s.z1 + s.z2) / 2;
  const k = kamerOp(mx, mz, s.v);
  const bereik = Math.max(2.4, Math.max(...s.botser) / 2 + 1.6) - 0.3;
  let gevonden = false;
  for (let j = 0; j < NZ && !gevonden; j++)
    for (let i = 0; i < NX; i++) {
      const n = j * NX + i;
      if (!bereikt[s.v][n]) continue;
      const x = cx(i);
      const z = cz(j);
      if (Math.hypot(x - mx, z - mz) > bereik) continue;
      if (kamerOp(x, z, s.v) !== k) continue;
      gevonden = true;
      break;
    }
  if (gevonden) ok++;
  else meld(`${s.naam} is niet te bereiken met padzoeken (verdieping ${s.v})`);
}
const plekken = verdiepingen.map((v) => `verdieping ${v}: ${(bereikt[v].reduce((a, b) => a + b, 0) * S * S).toFixed(0)} m²`).join(', ');
console.log(`padzoeken: ${ok}/${stations.length + kluizen.length} stations en kluizen bereikbaar (${plekken} beloopbaar)`);

// lampjes: in een kamer, niet in iets anders
for (const [i, l] of g.lampjes.entries()) {
  const v = l[2] ?? 0;
  if (!kamerOp(l[0], l[1], v)) meld(`lampje ${i} buiten het gebouw`);
  for (const d of dingen) if (d.v === v && l[0] > d.x1 - 0.3 && l[0] < d.x2 + 0.3 && l[1] > d.z1 - 0.3 && l[1] < d.z2 + 0.3) meld(`lampje ${i} in ${d.naam}`);
  const k = idx(l[0], l[1]);
  // in de buurt van een bereikte plek (lampjes pak je met een tik als je dichtbij bent)
  let dichtbij = false;
  for (let dj = -15; dj <= 15 && !dichtbij; dj++) for (let di = -15; di <= 15; di++) if (bereikt[v][k + dj * NX + di]) dichtbij = true;
  if (!dichtbij) meld(`lampje ${i} ligt te ver van een looppad`);
}
if (kamerOp(...g.spawn)?.id !== 'voorplein') meld('spawn staat niet op het voorplein');
const [ua, ub] = u.as === 'x' ? [kamerOp(u.pos[0], u.pos[1] - 0.3), kamerOp(u.pos[0], u.pos[1] + 0.3)] : [kamerOp(u.pos[0] - 0.3, u.pos[1]), kamerOp(u.pos[0] + 0.3, u.pos[1])];
if (!ua?.buiten && !ub?.buiten) meld('uitgang leidt niet naar buiten');
for (const s of stations) if (kamerOp((s.x1 + s.x2) / 2, (s.z1 + s.z2) / 2, s.v)?.id === 'platform') meld(`${s.naam} staat achter de uitgang`);

console.log(`${stations.length} stations, ${g.kamers.length} kamers (${g.kamers.filter((k) => k.buiten).length} buiten), ${g.doorgangen.length} doorgangen, ${(g.trappen ?? []).length} trappen, ${meubels.length} meubels`);
console.log(fout ? `${fout} fouten` : 'alles ok');
process.exit(fout ? 1 : 0);
