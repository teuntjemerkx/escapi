// Wereld 5 – tekenhulp voor schermen, borden en papier (canvas 2D).
// Alles wordt getekend in een vast virtueel raster (VPM pixels per meter), zodat een scherm
// er in de wereld (lage resolutie) en in de inspectie (hoge resolutie) precies hetzelfde uitziet.
import { FONT } from '../game/tekst';

export type C = CanvasRenderingContext2D;
export type Teken = (ctx: C, w: number, h: number) => void;

/** Virtuele pixels per meter: een letter van 40 vpx is 10 cm hoog. */
export const VPM = 400;
export const LETTER = `Inter, 'Segoe UI', Arial, sans-serif`;
export const ROND = FONT;

/** Teken in virtuele pixels: (b × h meter) → (b·VPM × h·VPM). */
export function virtueel(b: number, fn: (ctx: C, W: number, H: number) => void): Teken {
  return (ctx, w, h) => {
    const s = w / (b * VPM);
    ctx.save();
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    fn(ctx, b * VPM, h / s);
    ctx.restore();
  };
}

export interface TekstOpt {
  px: number;
  kleur?: string;
  gewicht?: number;
  uitlijn?: CanvasTextAlign;
  basis?: CanvasTextBaseline;
  /** Maximale breedte: de letter krimpt als het niet past. */
  max?: number;
  font?: string;
  draai?: number;
}

export function tekst(ctx: C, s: string | number, x: number, y: number, o: TekstOpt) {
  const t = String(s);
  let px = o.px;
  const font = o.font ?? LETTER;
  const g = o.gewicht ?? 600;
  ctx.font = `${g} ${px}px ${font}`;
  if (o.max) {
    const m = ctx.measureText(t).width;
    if (m > o.max) {
      px = (px * o.max) / m;
      ctx.font = `${g} ${px}px ${font}`;
    }
  }
  ctx.fillStyle = o.kleur ?? '#1f2a24';
  ctx.textAlign = o.uitlijn ?? 'left';
  ctx.textBaseline = o.basis ?? 'middle';
  if (o.draai) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.draai);
    ctx.fillText(t, 0, 0);
    ctx.restore();
  } else ctx.fillText(t, x, y);
}

/** Tekst met meerdere regels ("\n"), verticaal gecentreerd rond y. */
export function regels(ctx: C, s: string, x: number, y: number, o: TekstOpt & { regelH?: number }) {
  const r = s.split('\n');
  const rh = o.regelH ?? o.px * 1.12;
  r.forEach((t, i) => tekst(ctx, t, x, y + (i - (r.length - 1) / 2) * rh, o));
}

/** Lopende tekst binnen een breedte. Geeft de y onder de laatste regel terug. */
export function alinea(ctx: C, s: string, x: number, y: number, max: number, o: TekstOpt & { regelH?: number }) {
  ctx.font = `${o.gewicht ?? 500} ${o.px}px ${o.font ?? LETTER}`;
  const woorden = s.split(' ');
  const r: string[] = [];
  let huidig = '';
  for (const w of woorden) {
    const test = huidig ? `${huidig} ${w}` : w;
    if (ctx.measureText(test).width > max && huidig) {
      r.push(huidig);
      huidig = w;
    } else huidig = test;
  }
  if (huidig) r.push(huidig);
  const rh = o.regelH ?? o.px * 1.3;
  r.forEach((t, i) => tekst(ctx, t, x, y + i * rh, { gewicht: 500, basis: 'top', ...o }));
  return y + r.length * rh;
}

export function rond(ctx: C, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function vlak(ctx: C, x: number, y: number, w: number, h: number, kleur: string | CanvasGradient, r = 0) {
  ctx.fillStyle = kleur;
  if (r > 0) {
    rond(ctx, x, y, w, h, r);
    ctx.fill();
  } else ctx.fillRect(x, y, w, h);
}

export function rand(ctx: C, x: number, y: number, w: number, h: number, kleur: string, dik: number, r = 0) {
  ctx.strokeStyle = kleur;
  ctx.lineWidth = dik;
  if (r > 0) {
    rond(ctx, x, y, w, h, r);
    ctx.stroke();
  } else ctx.strokeRect(x, y, w, h);
}

export function verloop(ctx: C, y0: number, y1: number, stops: string[]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((s, i) => g.addColorStop(i / Math.max(1, stops.length - 1), s));
  return g;
}

export function streep(ctx: C, x1: number, y1: number, x2: number, y2: number, kleur: string, dik: number, gestippeld?: number[]) {
  ctx.strokeStyle = kleur;
  ctx.lineWidth = dik;
  ctx.setLineDash(gestippeld ?? []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Pijl met dikke punt. */
export function pijl(ctx: C, x1: number, y1: number, x2: number, y2: number, kleur: string, dik: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = dik * 2.6;
  streep(ctx, x1, y1, x2 - Math.cos(a) * p * 0.7, y2 - Math.sin(a) * p * 0.7, kleur, dik);
  ctx.fillStyle = kleur;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.5) * p, y2 - Math.sin(a - 0.5) * p);
  ctx.lineTo(x2 - Math.cos(a + 0.5) * p, y2 - Math.sin(a + 0.5) * p);
  ctx.closePath();
  ctx.fill();
}

// ───────────────────────── Tabellen ─────────────────────────

export type Cel = string | number;
export interface TabelOpt {
  x: number;
  y: number;
  b: number;
  h: number;
  kop?: Cel[];
  rijen: Cel[][];
  /** Relatieve kolombreedtes. */
  kolB?: number[];
  /** Hoogte van de kop t.o.v. een gewone rij. */
  kopH?: number;
  kopBg?: string | string[];
  kopFg?: string;
  rijBg?: string[];
  fg?: string;
  lijn?: string;
  lijnDik?: number;
  px?: number;
  kopPx?: number;
  uitlijn?: CanvasTextAlign[];
  gewicht?: number[];
  /** Per cel een eigen achtergrond of letterkleur. */
  cel?: (r: number, k: number) => { bg?: string; fg?: string; gewicht?: number } | undefined;
  /** Ruimte tussen de cellen (tegel-look). */
  tussen?: number;
  hoek?: number;
  font?: string;
}

export function tabel(ctx: C, o: TabelOpt) {
  const n = o.rijen.length;
  const kols = Math.max(o.kop?.length ?? 0, ...o.rijen.map((r) => r.length));
  const kolB = o.kolB ?? Array.from({ length: kols }, () => 1);
  const som = kolB.reduce((a, b) => a + b, 0);
  const kopF = o.kop ? (o.kopH ?? 1.25) : 0;
  const rijH = o.h / (n + kopF);
  const kopH = rijH * kopF;
  const t = o.tussen ?? 0;
  const xs: number[] = [];
  let acc = o.x;
  for (const k of kolB) {
    xs.push(acc);
    acc += (k / som) * o.b;
  }
  xs.push(o.x + o.b);
  const px = o.px ?? rijH * 0.48;
  const kopPx = o.kopPx ?? Math.min(px, kopH * 0.42);
  const uit = (k: number) => o.uitlijn?.[k] ?? (k === 0 ? 'left' : 'center');
  const celTekst = (s: Cel, k: number, y: number, h: number, kleur: string, size: number, g: number) => {
    const x0 = xs[k] + t / 2;
    const w = xs[k + 1] - xs[k] - t;
    const a = uit(k);
    const pad = Math.min(w * 0.08, size * 0.45);
    const x = a === 'left' ? x0 + pad : a === 'right' ? x0 + w - pad : x0 + w / 2;
    const tt = String(s);
    if (tt.includes('\n')) regels(ctx, tt, x, y + h / 2, { px: size, kleur, gewicht: g, uitlijn: a, max: w - pad * 2, font: o.font });
    else tekst(ctx, tt, x, y + h / 2, { px: size, kleur, gewicht: g, uitlijn: a, max: w - pad * 2, font: o.font });
  };
  if (o.kop) {
    o.kop.forEach((s, k) => {
      const bg = Array.isArray(o.kopBg) ? o.kopBg[k] : o.kopBg;
      if (bg) vlak(ctx, xs[k] + t / 2, o.y + t / 2, xs[k + 1] - xs[k] - t, kopH - t, bg, o.hoek ?? 0);
      celTekst(s, k, o.y, kopH, o.kopFg ?? '#ffffff', kopPx, 700);
    });
  }
  o.rijen.forEach((rij, r) => {
    const y = o.y + kopH + r * rijH;
    const bgRij = o.rijBg?.[r % (o.rijBg?.length || 1)];
    for (let k = 0; k < kols; k++) {
      const c = o.cel?.(r, k);
      const bg = c?.bg ?? bgRij;
      if (bg) vlak(ctx, xs[k] + t / 2, y + t / 2, xs[k + 1] - xs[k] - t, rijH - t, bg, o.hoek ?? 0);
      const s = rij[k];
      if (s !== undefined && s !== '') celTekst(s, k, y, rijH, c?.fg ?? o.fg ?? '#1f2a24', px, c?.gewicht ?? o.gewicht?.[k] ?? (k === 0 ? 700 : 600));
    }
  });
  if (o.lijn) {
    const d = o.lijnDik ?? 2;
    for (let r = 0; r <= n; r++) streep(ctx, o.x, o.y + kopH + r * rijH, o.x + o.b, o.y + kopH + r * rijH, o.lijn, d);
    if (o.kop) streep(ctx, o.x, o.y, o.x + o.b, o.y, o.lijn, d);
    for (const x of xs) streep(ctx, x, o.y, x, o.y + o.h, o.lijn, d);
  }
  return { xs, rijH, kopH, rijY: (r: number) => o.y + kopH + r * rijH };
}

// ───────────────────────── Grafieken ─────────────────────────

export interface AsOpt {
  min: number;
  max: number;
  /** Stap tussen de getallen op de as. */
  stap: number;
  /** Fijne hulplijnen (zonder getal). */
  fijn?: number;
  label?: (v: number) => string;
  titel?: string;
}
export interface VlakOpt {
  x: number;
  y: number;
  b: number;
  h: number;
  ya: AsOpt;
  /** Horizontale as: getallen (xa) of vakjes met namen (cats). */
  xa?: AsOpt;
  cats?: string[];
  /** Eigen labels op de x-as. */
  xLabels?: { v: number; t: string }[];
  xFijn?: number[];
  xTitel?: string;
  px?: number;
  kleur?: { achter?: string; banen?: [string, string]; raster?: string; fijn?: string; as?: string; tekst?: string; vert?: string };
  /** Verticale rasterlijnen bij elke x-label. */
  xRaster?: boolean;
  schuin?: boolean;
  /** Ruimte links voor de y-getallen (als die buiten x vallen, tekenen we ze links van x). */
  yLabelB?: number;
}

export interface Plot {
  X: (v: number) => number;
  Y: (v: number) => number;
  x: number;
  y: number;
  b: number;
  h: number;
  /** Midden van categorie i (bij cats). */
  cat: (i: number) => number;
  catB: number;
}

/** Assen, raster en getallen. Het plotgebied is (x, y, b, h); getallen staan links en onder. */
export function grafiekVlak(ctx: C, o: VlakOpt): Plot {
  const k = { achter: undefined, raster: '#9aa6b0', fijn: '#d7dde2', as: '#2a3238', tekst: '#2a3238', ...o.kleur };
  const px = o.px ?? 34;
  const { ya } = o;
  const Y = (v: number) => o.y + o.h - ((v - ya.min) / (ya.max - ya.min)) * o.h;
  const xa = o.xa;
  const n = o.cats?.length ?? 1;
  const catB = o.b / n;
  const X = xa ? (v: number) => o.x + ((v - xa.min) / (xa.max - xa.min)) * o.b : (v: number) => o.x + (v + 0.5) * catB;
  if (k.achter) vlak(ctx, o.x, o.y, o.b, o.h, k.achter);
  if (k.banen) {
    for (let v = ya.min, i = 0; v < ya.max - 1e-9; v += ya.fijn ?? ya.stap, i++) {
      const v2 = Math.min(ya.max, v + (ya.fijn ?? ya.stap));
      vlak(ctx, o.x, Y(v2), o.b, Y(v) - Y(v2), k.banen[i % 2]);
    }
  }
  const telStappen = (stap: number) => Math.round((ya.max - ya.min) / stap);
  if (ya.fijn) {
    for (let i = 0; i <= telStappen(ya.fijn); i++) {
      const v = ya.min + i * ya.fijn;
      streep(ctx, o.x, Y(v), o.x + o.b, Y(v), k.fijn, Math.max(1.5, px * 0.05));
    }
  }
  if (o.xFijn) for (const v of o.xFijn) streep(ctx, X(v), o.y, X(v), o.y + o.h, k.fijn, Math.max(1.5, px * 0.05));
  for (let i = 0; i <= telStappen(ya.stap); i++) {
    const v = ya.min + i * ya.stap;
    streep(ctx, o.x, Y(v), o.x + o.b, Y(v), k.raster, Math.max(2, px * 0.08));
    tekst(ctx, ya.label ? ya.label(v) : String(v), o.x - px * 0.4, Y(v), { px, kleur: k.tekst, uitlijn: 'right', gewicht: 600, max: o.yLabelB });
  }
  // x-as
  if (xa) {
    const labels = o.xLabels ?? Array.from({ length: Math.round((xa.max - xa.min) / xa.stap) + 1 }, (_, i) => ({ v: xa.min + i * xa.stap, t: xa.label ? xa.label(xa.min + i * xa.stap) : String(xa.min + i * xa.stap) }));
    if (xa.fijn) for (let v = xa.min; v <= xa.max + 1e-9; v += xa.fijn) streep(ctx, X(v), o.y, X(v), o.y + o.h, k.fijn, Math.max(1.5, px * 0.05));
    for (const l of labels) {
      if (o.xRaster !== false) streep(ctx, X(l.v), o.y, X(l.v), o.y + o.h, k.vert ?? k.raster, Math.max(2, px * 0.07));
      streep(ctx, X(l.v), o.y + o.h, X(l.v), o.y + o.h + px * 0.3, k.as, 3);
      if (o.schuin) tekst(ctx, l.t, X(l.v) + px * 0.2, o.y + o.h + px * 0.5, { px, kleur: k.tekst, uitlijn: 'right', draai: -Math.PI / 4 });
      else tekst(ctx, l.t, X(l.v), o.y + o.h + px * 0.85, { px, kleur: k.tekst, uitlijn: 'center' });
    }
  } else if (o.cats) {
    o.cats.forEach((c, i) => {
      if (o.schuin) tekst(ctx, c, X(i) + px * 0.2, o.y + o.h + px * 0.5, { px, kleur: k.tekst, uitlijn: 'right', draai: -Math.PI / 4 });
      else regels(ctx, c, X(i), o.y + o.h + px * (c.includes('\n') ? 1.3 : 0.85), { px, kleur: k.tekst, uitlijn: 'center', max: catB * 0.98 });
    });
  }
  // assen
  streep(ctx, o.x, o.y + o.h, o.x + o.b, o.y + o.h, k.as, Math.max(3, px * 0.12));
  streep(ctx, o.x, o.y - px * 0.2, o.x, o.y + o.h, k.as, Math.max(3, px * 0.12));
  if (ya.titel) tekst(ctx, ya.titel, o.x - (o.yLabelB ?? px * 3) - px * 1.1, o.y + o.h / 2, { px: px * 0.95, kleur: k.tekst, uitlijn: 'center', gewicht: 700, draai: -Math.PI / 2 });
  if (o.xTitel) tekst(ctx, o.xTitel, o.x + o.b / 2, o.y + o.h + px * (o.schuin ? 3.4 : 2.1), { px: px * 0.95, kleur: k.tekst, uitlijn: 'center', gewicht: 700 });
  return { X, Y, x: o.x, y: o.y, b: o.b, h: o.h, cat: (i) => o.x + (i + 0.5) * catB, catB };
}

export function lijn(ctx: C, pts: [number, number][], kleur: string, dik: number, stip = 0, stipKleur?: string) {
  ctx.strokeStyle = kleur;
  ctx.lineWidth = dik;
  ctx.setLineDash([]);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  if (stip > 0) {
    for (const [x, y] of pts) {
      ctx.fillStyle = stipKleur ?? kleur;
      ctx.beginPath();
      ctx.arc(x, y, stip, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = stip * 0.4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }
}

export interface Stuk {
  v: number;
  kleur: string;
  label?: string;
}

/** Cirkeldiagram met de klok mee vanaf boven. Labels in het stuk of erbuiten (kleine stukken). */
export function taart(ctx: C, cx: number, cy: number, r: number, delen: Stuk[], o: { px?: number; rand?: string; buitenOnder?: number; tekstKleur?: (k: string) => string; buitenKleur?: string } = {}) {
  const tot = delen.reduce((a, d) => a + d.v, 0);
  let a = -Math.PI / 2;
  const px = o.px ?? r * 0.16;
  for (const d of delen) {
    const da = (d.v / tot) * Math.PI * 2;
    ctx.fillStyle = d.kleur;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + da);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = o.rand ?? '#ffffff';
    ctx.lineWidth = Math.max(2, r * 0.012);
    ctx.stroke();
    a += da;
  }
  a = -Math.PI / 2;
  let buiten = 0;
  for (const d of delen) {
    const da = (d.v / tot) * Math.PI * 2;
    const m = a + da / 2;
    if (d.label) {
      const binnen = d.v / tot >= (o.buitenOnder ?? 0.06);
      // kleine stukken naast elkaar: labels om en om dichtbij en verder weg, zodat ze niet overlappen
      const rr = binnen ? r * 0.64 : r * (buiten++ % 2 ? 1.38 : 1.17);
      const kleur = binnen ? (o.tekstKleur ? o.tekstKleur(d.kleur) : '#ffffff') : (o.buitenKleur ?? '#1f2a24');
      tekst(ctx, d.label, cx + Math.cos(m) * rr, cy + Math.sin(m) * rr, { px: binnen ? px : px * 0.85, kleur, gewicht: 700, uitlijn: 'center' });
    }
    a += da;
  }
}

/** Legenda: gekleurde blokjes met tekst eronder elkaar. */
export function legenda(ctx: C, x: number, y: number, items: { kleur: string; t: string }[], o: { px: number; rijH?: number; kleur?: string; max?: number; vorm?: 'blok' | 'lijn' | 'rond' }) {
  const rh = o.rijH ?? o.px * 1.55;
  items.forEach((it, i) => {
    const yy = y + i * rh;
    ctx.fillStyle = it.kleur;
    if (o.vorm === 'lijn') {
      streep(ctx, x, yy, x + o.px * 1.3, yy, it.kleur, o.px * 0.28);
    } else if (o.vorm === 'rond') {
      ctx.beginPath();
      ctx.arc(x + o.px * 0.45, yy, o.px * 0.42, 0, Math.PI * 2);
      ctx.fill();
    } else vlak(ctx, x, yy - o.px * 0.45, o.px * 0.9, o.px * 0.9, it.kleur, o.px * 0.12);
    tekst(ctx, it.t, x + o.px * (o.vorm === 'lijn' ? 1.7 : 1.3), yy, { px: o.px, kleur: o.kleur ?? '#1f2a24', gewicht: 600, max: o.max });
  });
}

/** Licht of donker? Voor witte of zwarte letters op een kleur. */
export function licht(kleur: string) {
  const c = kleur.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
