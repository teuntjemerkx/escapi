// Lichte botsingen voor een vlakke wereld: het poppetje is een cirkel,
// obstakels zijn rechthoeken (AABB) of cirkels in het xz-vlak.
// Werelden met verdiepingen: elke botser hoort bij een laag (verdieping 0, 1, 2 … of een trap 'trap0').
// Alleen de laag waar het poppetje nu is, telt mee.
export type Laag = number | string;
export type Botser =
  | { soort: 'box'; minX: number; maxX: number; minZ: number; maxZ: number; id?: string; laag: Laag }
  | { soort: 'cirkel'; x: number; z: number; r: number; id?: string; laag: Laag };

let registratieLaag: Laag = 0;
let actieveLaag: Laag = 0;
/** Alles wat in `fn` wordt geregistreerd, hoort bij laag `l`. */
export function opLaag(l: Laag, fn: () => void) {
  const oud = registratieLaag;
  registratieLaag = l;
  try {
    fn();
  } finally {
    registratieLaag = oud;
  }
}
export function zetLaag(l: Laag) {
  actieveLaag = l;
}
export const huidigeLaag = () => actieveLaag;

const botsers: Botser[] = [];
let grens = { minX: -30, maxX: 30, minZ: -30, maxZ: 30 };
/** Telt elke wijziging, zodat het looprooster weet wanneer het opnieuw moet. */
let versie = 0;

export function zetGrens(w: number, d: number, marge = 0.8, midden: [number, number] = [0, 0]) {
  grens = { minX: midden[0] - w / 2 + marge, maxX: midden[0] + w / 2 - marge, minZ: midden[1] - d / 2 + marge, maxZ: midden[1] + d / 2 - marge };
  versie++;
}

/** Rechthoek vanuit midden + maat. Optionele id om later te verwijderen (poort, deuren). Id 'muur…' = muur. */
export function box(x: number, z: number, w: number, d: number, id?: string) {
  botsers.push({ soort: 'box', minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, id, laag: registratieLaag });
  versie++;
}
export function cirkel(x: number, z: number, r: number, id?: string) {
  botsers.push({ soort: 'cirkel', x, z, r, id, laag: registratieLaag });
  versie++;
}
export function verwijder(id: string) {
  for (let i = botsers.length - 1; i >= 0; i--) if (botsers[i].id === id) botsers.splice(i, 1);
  versie++;
}
export function wisAlles() {
  botsers.length = 0;
  actieveLaag = 0;
  registratieLaag = 0;
  versie++;
}

/** Duwt een cirkel (x, z, r) uit alle obstakels. Geeft de nieuwe positie terug. */
export function losOp(x: number, z: number, r: number): [number, number] {
  for (let iter = 0; iter < 3; iter++) {
    for (const b of botsers) {
      if (b.laag !== actieveLaag) continue;
      if (b.soort === 'box') {
        const cx = Math.max(b.minX, Math.min(x, b.maxX));
        const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
        const dx = x - cx;
        const dz = z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          if (d2 > 1e-9) {
            const d = Math.sqrt(d2);
            x = cx + (dx / d) * r;
            z = cz + (dz / d) * r;
          } else {
            // Midden zit in de box: duw naar de dichtstbijzijnde zijde.
            const opties = [
              [b.minX - r - x, 0],
              [b.maxX + r - x, 0],
              [0, b.minZ - r - z],
              [0, b.maxZ + r - z],
            ];
            opties.sort((a, c) => Math.abs(a[0] + a[1]) - Math.abs(c[0] + c[1]));
            x += opties[0][0];
            z += opties[0][1];
          }
        }
      } else {
        const dx = x - b.x;
        const dz = z - b.z;
        const min = r + b.r;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min && d2 > 1e-9) {
          const d = Math.sqrt(d2);
          x = b.x + (dx / d) * min;
          z = b.z + (dz / d) * min;
        }
      }
    }
  }
  x = Math.max(grens.minX, Math.min(grens.maxX, x));
  z = Math.max(grens.minZ, Math.min(grens.maxZ, z));
  return [x, z];
}

// Verhoogde vlakken (kavels, stoepen, pleinen): het poppetje stapt er soepel op.
const verhoogd: { minX: number; maxX: number; minZ: number; maxZ: number; h: number }[] = [];
export function verhoog(x: number, z: number, w: number, d: number, h: number) {
  verhoogd.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, h });
}
/** Schuine stukken grond (een pad dat omhoog loopt): van punt a (hoogte h0) naar punt b (hoogte h1), zo breed. */
const hellingen: { ax: number; az: number; dx: number; dz: number; l2: number; half: number; h0: number; h1: number }[] = [];
export function helling(a: [number, number], b: [number, number], breed: number, h0: number, h1: number) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  hellingen.push({ ax: a[0], az: a[1], dx, dz, l2: dx * dx + dz * dz || 1, half: breed / 2, h0, h1 });
}
export function wisVerhoogd() {
  verhoogd.length = 0;
  hellingen.length = 0;
}
export function hoogteOp(x: number, z: number) {
  // op een helling? dan die hoogte (ook onder nul: een pad dat naar beneden loopt)
  for (const s of hellingen) {
    const t = ((x - s.ax) * s.dx + (z - s.az) * s.dz) / s.l2;
    if (t < 0 || t > 1) continue;
    const lat = Math.abs((x - s.ax) * s.dz - (z - s.az) * s.dx) / Math.sqrt(s.l2);
    if (lat <= s.half) return s.h0 + (s.h1 - s.h0) * t;
  }
  let h = 0;
  for (const v of verhoogd) if (x >= v.minX && x <= v.maxX && z >= v.minZ && z <= v.maxZ && v.h > h) h = v.h;
  return h;
}

// ── Padzoeken: rooster van 0,5 m met A* en daarna rechttrekken ──

const CEL = 0.5;
const STRAAL_PAD = 0.42;

function vrij(x: number, z: number, r: number, alleenMuren = false, laag: Laag = actieveLaag) {
  if (x < grens.minX || x > grens.maxX || z < grens.minZ || z > grens.maxZ) return false;
  for (const b of botsers) {
    if (b.laag !== laag) continue;
    if (alleenMuren && !(b.id?.startsWith('muur') || b.id?.startsWith('deur') || b.id === 'poort')) continue;
    if (b.soort === 'box') {
      const cx = Math.max(b.minX, Math.min(x, b.maxX));
      const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
      if ((x - cx) ** 2 + (z - cz) ** 2 < r * r) return false;
    } else if ((x - b.x) ** 2 + (z - b.z) ** 2 < (r + b.r) ** 2) return false;
  }
  return true;
}

/** Kun je in een rechte lijn van a naar b lopen? */
export function lijnVrij(ax: number, az: number, bx: number, bz: number, r = STRAAL_PAD, alleenMuren = false, laag: Laag = actieveLaag) {
  const d = Math.hypot(bx - ax, bz - az);
  const n = Math.max(1, Math.ceil(d / 0.25));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    if (!vrij(ax + (bx - ax) * t, az + (bz - az) * t, r, alleenMuren, laag)) return false;
  }
  return true;
}

type Rooster = { versie: number; nx: number; nz: number; x0: number; z0: number; vrij: Uint8Array };
const roosters = new Map<Laag, Rooster>();
function zorgVoorRooster(laag: Laag): Rooster {
  const al = roosters.get(laag);
  if (al && al.versie === versie) return al;
  const nx = Math.max(1, Math.floor((grens.maxX - grens.minX) / CEL) + 1);
  const nz = Math.max(1, Math.floor((grens.maxZ - grens.minZ) / CEL) + 1);
  const v = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = vrij(grens.minX + i * CEL, grens.minZ + j * CEL, STRAAL_PAD, false, laag) ? 1 : 0;
  const r = { versie, nx, nz, x0: grens.minX, z0: grens.minZ, vrij: v };
  roosters.set(laag, r);
  return r;
}

/**
 * Zoek een looproute van (ax, az) naar een doel. `klaar(x, z)` zegt of een plek goed genoeg is
 * (bv. "dichtbij het station en geen muur ertussen"). Geeft punten terug, of null als het niet kan.
 */
export function zoekPad(ax: number, az: number, doelX: number, doelZ: number, klaar?: (x: number, z: number) => boolean, laag: Laag = actieveLaag): [number, number][] | null {
  const R = zorgVoorRooster(laag);
  const idx = (i: number, j: number) => j * R.nx + i;
  const cel = (x: number, z: number): [number, number] => [Math.round((x - R.x0) / CEL), Math.round((z - R.z0) / CEL)];
  const pos = (i: number, j: number): [number, number] => [R.x0 + i * CEL, R.z0 + j * CEL];
  const binnen = (i: number, j: number) => i >= 0 && j >= 0 && i < R.nx && j < R.nz;
  const isKlaar = klaar ?? ((x: number, z: number) => Math.hypot(x - doelX, z - doelZ) < 0.6);
  // Start: dichtstbijzijnde vrije cel.
  let [si, sj] = cel(ax, az);
  if (!binnen(si, sj) || !R.vrij[idx(si, sj)]) {
    let beste: [number, number] | null = null;
    for (let r = 1; r < 5 && !beste; r++)
      for (let dj = -r; dj <= r && !beste; dj++)
        for (let di = -r; di <= r; di++) if (binnen(si + di, sj + dj) && R.vrij[idx(si + di, sj + dj)]) {
          beste = [si + di, sj + dj];
          break;
        }
    if (!beste) return null;
    [si, sj] = beste;
  }
  const [gi, gj] = cel(doelX, doelZ);
  const h = (i: number, j: number) => {
    const dx = Math.abs(i - gi);
    const dz = Math.abs(j - gj);
    return (Math.max(dx, dz) + 0.414 * Math.min(dx, dz)) * CEL;
  };
  const g = new Float32Array(R.nx * R.nz).fill(Infinity);
  const vorig = new Int32Array(R.nx * R.nz).fill(-1);
  const dicht = new Uint8Array(R.nx * R.nz);
  // Eenvoudige binaire heap op f-waarde.
  const heap: [number, number][] = [];
  const duw = (f: number, k: number) => {
    heap.push([f, k]);
    let c = heap.length - 1;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (heap[p][0] <= heap[c][0]) break;
      [heap[p], heap[c]] = [heap[c], heap[p]];
      c = p;
    }
  };
  const pak = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let c = 0;
      for (;;) {
        const l = 2 * c + 1;
        const r = l + 1;
        let m = c;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === c) break;
        [heap[m], heap[c]] = [heap[c], heap[m]];
        c = m;
      }
    }
    return top;
  };
  const start = idx(si, sj);
  g[start] = 0;
  duw(h(si, sj), start);
  let gevonden = -1;
  let stappen = 0;
  while (heap.length && stappen++ < 40000) {
    const [, k] = pak();
    if (dicht[k]) continue;
    dicht[k] = 1;
    const i = k % R.nx;
    const j = (k / R.nx) | 0;
    const [px, pz] = pos(i, j);
    if (isKlaar(px, pz)) {
      gevonden = k;
      break;
    }
    for (let dj = -1; dj <= 1; dj++)
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = i + di;
        const nj = j + dj;
        if (!binnen(ni, nj)) continue;
        const nk = idx(ni, nj);
        if (!R.vrij[nk] || dicht[nk]) continue;
        if (di && dj && (!R.vrij[idx(i + di, j)] || !R.vrij[idx(i, j + dj)])) continue;
        const ng = g[k] + (di && dj ? 1.414 : 1) * CEL;
        if (ng < g[nk]) {
          g[nk] = ng;
          vorig[nk] = k;
          duw(ng + h(ni, nj), nk);
        }
      }
  }
  if (gevonden < 0) return null;
  const ruw: [number, number][] = [];
  for (let k = gevonden; k >= 0; k = vorig[k]) ruw.unshift(pos(k % R.nx, (k / R.nx) | 0));
  // Rechttrekken: sla punten over zolang je er in een rechte lijn heen kunt.
  const uit: [number, number][] = [];
  let [cx, cz] = [ax, az];
  let a = 0;
  while (a < ruw.length) {
    let b = ruw.length - 1;
    while (b > a && !lijnVrij(cx, cz, ruw[b][0], ruw[b][1])) b--;
    uit.push(ruw[b]);
    [cx, cz] = ruw[b];
    a = b + 1;
  }
  // Laatste stukje naar het precieze doel, als dat kan.
  if (!klaar && lijnVrij(cx, cz, doelX, doelZ)) uit.push([doelX, doelZ]);
  return uit;
}
