// De rekenkaart (metriek stelsel) uit het werkboek, opnieuw getekend op een canvas.
// Groene tegels, blauwe bogen met × naar rechts en : naar links, een blauw label per rij.
import { FONT, rondRect } from '../game/tekst';

export type RijNaam = 'lengte' | 'oppervlakte' | 'inhoud' | 'liter' | 'gewicht';

export interface Rij {
  label: string;
  factor: string;
  tegels: [string, string][]; // [afkorting, naam]
}

export const RIJEN: Record<RijNaam, Rij> = {
  lengte: {
    label: 'Lengte',
    factor: '10',
    tegels: [
      ['km', 'kilometer'],
      ['hm', 'hectometer'],
      ['dam', 'decameter'],
      ['m', 'meter'],
      ['dm', 'decimeter'],
      ['cm', 'centimeter'],
      ['mm', 'millimeter'],
    ],
  },
  oppervlakte: {
    label: 'Oppervlakte',
    factor: '100',
    tegels: [
      ['km²', ''],
      ['hm²', 'hectare (ha)'],
      ['dam²', 'are'],
      ['m²', 'centiare (ca)'],
      ['dm²', ''],
      ['cm²', ''],
      ['mm²', ''],
    ],
  },
  inhoud: {
    label: 'Inhoud',
    factor: '1.000',
    tegels: [
      ['km³', ''],
      ['hm³', ''],
      ['dam³', ''],
      ['m³', 'kuub'],
      ['dm³', ''],
      ['cm³', 'cc'],
      ['mm³', ''],
    ],
  },
  liter: {
    label: 'Inhoud',
    factor: '10',
    tegels: [
      ['kl', 'kiloliter'],
      ['hl', 'hectoliter'],
      ['dal', 'decaliter'],
      ['l', 'liter'],
      ['dl', 'deciliter'],
      ['cl', 'centiliter'],
      ['ml', 'milliliter'],
    ],
  },
  gewicht: {
    label: 'Gewicht',
    factor: '10',
    tegels: [
      ['kg', 'kilogram'],
      ['hg', 'hectogram'],
      ['dag', 'decagram'],
      ['g', 'gram'],
      ['dg', 'decigram'],
      ['cg', 'centigram'],
      ['mg', 'milligram'],
    ],
  },
};

export const KLEUR = {
  bord: '#f7f3e8',
  tegel: '#8ccf2e',
  tegelRand: '#6fae1c',
  boog: '#5fa8d0',
  label: '#7cbfd8',
  inkt: '#1d2a1f',
  roze: '#e0507a',
};

/** Pijl-boog van (x1) naar (x2) boven (dir −1) of onder (dir 1) de tegelrij. */
function boog(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, hoog: number, dir: -1 | 1, dikte: number) {
  const mx = (x1 + x2) / 2;
  ctx.lineWidth = dikte;
  ctx.strokeStyle = KLEUR.boog;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.quadraticCurveTo(mx, y + dir * hoog * 2, x2, y);
  ctx.stroke();
  // pijlpunt bij x2 (boven: naar rechts) of x1 (onder: naar links)
  const px = dir < 0 ? x2 : x1;
  const dx = dir < 0 ? x2 - mx : x1 - mx;
  const dy = -dir * hoog * 2;
  const a = Math.atan2(dy, dx);
  const p = dikte * 2.4;
  ctx.fillStyle = KLEUR.boog;
  ctx.beginPath();
  ctx.moveTo(px, y);
  ctx.lineTo(px - Math.cos(a - 0.5) * p, y - Math.sin(a - 0.5) * p);
  ctx.lineTo(px - Math.cos(a + 0.5) * p, y - Math.sin(a + 0.5) * p);
  ctx.closePath();
  ctx.fill();
}

/**
 * Teken één rij van de rekenkaart in het vak (x, y, w, h).
 * Boven de tegels de bogen "× factor", onder de tegels ": factor".
 * Geeft de middens van de tegels terug (voor stippellijnen tussen rijen).
 */
export function tekenRij(ctx: CanvasRenderingContext2D, rij: Rij, x: number, y: number, w: number, h: number, opt: { label?: boolean; namen?: boolean; licht?: number[] } = {}) {
  const labelB = opt.label === false ? 0 : w * 0.13;
  const tegelsB = w - labelB;
  const n = rij.tegels.length;
  const tb = tegelsB / n;
  const th = h * 0.36;
  const ty = y + h * 0.32;
  const middens: number[] = [];
  // tegels
  ctx.fillStyle = KLEUR.tegel;
  ctx.fillRect(x, ty, tegelsB, th);
  for (let i = 0; i < n; i++) {
    const cx = x + tb * (i + 0.5);
    middens.push(cx);
    if (opt.licht?.includes(i)) {
      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(x + tb * i, ty, tb, th);
    }
    if (i > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + tb * i - 1.5, ty, 3, th);
    }
    const [afk, naam] = rij.tegels[i];
    ctx.fillStyle = KLEUR.inkt;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const metNaam = opt.namen !== false && naam;
    let fs = th * (metNaam ? 0.46 : 0.58);
    ctx.font = `700 ${fs}px ${FONT}`;
    const breed = ctx.measureText(afk).width;
    if (breed > tb * 0.9) fs *= (tb * 0.9) / breed;
    ctx.font = `700 ${fs}px ${FONT}`;
    ctx.fillText(afk, cx, ty + th * (metNaam ? 0.36 : 0.52));
    if (metNaam) {
      let fn = th * 0.22;
      ctx.font = `600 ${fn}px ${FONT}`;
      const bn = ctx.measureText(naam).width;
      if (bn > tb * 0.92) fn *= (tb * 0.92) / bn;
      ctx.font = `600 ${fn}px ${FONT}`;
      ctx.fillText(naam, cx, ty + th * 0.76);
    }
  }
  // label
  if (labelB) {
    ctx.fillStyle = KLEUR.label;
    ctx.fillRect(x + tegelsB + 4, ty, labelB - 4, th);
    ctx.fillStyle = '#ffffff';
    let fl = th * 0.34;
    ctx.font = `700 ${fl}px ${FONT}`;
    const bl = ctx.measureText(rij.label).width;
    if (bl > labelB * 0.88) fl *= (labelB * 0.88) / bl;
    ctx.font = `700 ${fl}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(rij.label, x + tegelsB + 2 + labelB / 2, ty + th / 2);
  }
  // bogen met factoren
  const dikte = Math.max(3, h * 0.025);
  const fsF = h * 0.15;
  for (let i = 0; i < n - 1; i++) {
    const x1 = middens[i] + tb * 0.08;
    const x2 = middens[i + 1] - tb * 0.08;
    boog(ctx, x1, x2, ty - h * 0.02, h * 0.06, -1, dikte);
    boog(ctx, x1, x2, ty + th + h * 0.02, h * 0.06, 1, dikte);
    ctx.fillStyle = KLEUR.inkt;
    ctx.textAlign = 'center';
    let fs = fsF;
    ctx.font = `700 ${fs}px ${FONT}`;
    const m = ctx.measureText(`× ${rij.factor}`).width;
    if (m > tb * 0.86) fs *= (tb * 0.86) / m;
    ctx.font = `700 ${fs}px ${FONT}`;
    ctx.fillText(`× ${rij.factor}`, (x1 + x2) / 2, ty - h * 0.2);
    ctx.fillText(`: ${rij.factor}`, (x1 + x2) / 2, ty + th + h * 0.22);
  }
  return { middens, boven: ty, onder: ty + th };
}

/** Roze stippellijn tussen twee tegels (m³ → kl, dm³ → l, cm³ → ml). */
export function stippel(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, dikte: number) {
  ctx.save();
  ctx.strokeStyle = KLEUR.roze;
  ctx.lineWidth = dikte;
  ctx.setLineDash([dikte * 2.2, dikte * 1.6]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = KLEUR.roze;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - dikte * 2, y2 - dikte * 3);
  ctx.lineTo(x2 + dikte * 2, y2 - dikte * 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Bordachtergrond in emaille-stijl: crème vlak met een donkere rand. */
export function tekenBord(ctx: CanvasRenderingContext2D, w: number, h: number, titel?: string) {
  ctx.fillStyle = '#2f3b44';
  rondRect(ctx, 0, 0, w, h, Math.min(w, h) * 0.05);
  ctx.fill();
  const m = Math.min(w, h) * 0.025;
  ctx.fillStyle = KLEUR.bord;
  rondRect(ctx, m, m, w - 2 * m, h - 2 * m, Math.min(w, h) * 0.04);
  ctx.fill();
  if (titel) {
    ctx.fillStyle = KLEUR.inkt;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${h * 0.09}px ${FONT}`;
    ctx.fillText(titel, w * 0.04, h * 0.1);
  }
}

/** De hele rekenkaart (vijf rijen), voor het grote bord op het havenkantoor. */
export function tekenHeleKaart(ctx: CanvasRenderingContext2D, w: number, h: number) {
  tekenBord(ctx, w, h);
  ctx.fillStyle = KLEUR.inkt;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${h * 0.065}px ${FONT}`;
  ctx.fillText('Rekenkaart – metriek stelsel', w * 0.035, h * 0.07);
  const volg: RijNaam[] = ['lengte', 'oppervlakte', 'inhoud', 'liter', 'gewicht'];
  const top = h * 0.12;
  const rh = (h * 0.86) / volg.length;
  const xs = w * 0.035;
  const bw = w * 0.93;
  const pos: Record<string, { middens: number[]; boven: number; onder: number }> = {};
  volg.forEach((r, i) => {
    pos[r] = tekenRij(ctx, RIJEN[r], xs, top + i * rh, bw, rh * 0.98, { namen: true });
  });
  // roze stippellijnen: m³ → kl, dm³ → l, cm³ → ml
  const a = pos.inhoud;
  const b = pos.liter;
  const d = Math.max(3, h * 0.006);
  stippel(ctx, a.middens[3], a.onder + rh * 0.24, b.middens[0], b.boven - rh * 0.26, d);
  stippel(ctx, a.middens[4], a.onder + rh * 0.24, b.middens[3], b.boven - rh * 0.26, d);
  stippel(ctx, a.middens[5], a.onder + rh * 0.24, b.middens[6], b.boven - rh * 0.26, d);
}
