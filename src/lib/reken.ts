// Rekenen met een getypte som (rekentekens-puzzels en de rekenmachine): + − × : haakjes en wortel.
// Een komma of punt is een decimaalteken.

export type Tok = { t: 'g'; v: number } | { t: 'o'; v: string };

export function tokens(s: string): Tok[] | null {
  const uit: Tok[] = [];
  const t = s.replace(/\s+/g, '').replace(/[x*]/gi, '×').replace(/[/]/g, ':').replace(/[−–]/g, '-').replace(/wortel/gi, '√');
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (/\d/.test(c)) {
      let j = i;
      while (j < t.length && /[\d,.]/.test(t[j])) j++;
      uit.push({ t: 'g', v: Number(t.slice(i, j).replace(',', '.')) });
      i = j;
    } else if ('+-×:()√'.includes(c)) {
      uit.push({ t: 'o', v: c });
      i++;
    } else return null;
  }
  return uit;
}
export function reken(toks: Tok[]): number | null {
  let p = 0;
  const kijk = () => toks[p];
  const expr = (): number => {
    let v = term();
    while (kijk() && kijk().t === 'o' && (kijk().v === '+' || kijk().v === '-')) {
      const op = toks[p++].v;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (kijk() && kijk().t === 'o' && (kijk().v === '×' || kijk().v === ':')) {
      const op = toks[p++].v;
      const r = factor();
      v = op === '×' ? v * r : v / r;
    }
    return v;
  };
  const factor = (): number => {
    const k = toks[p++];
    if (!k) throw new Error('kort');
    if (k.t === 'g') return k.v;
    if (k.v === '√') return Math.sqrt(factor());
    if (k.v === '-') return -factor();
    if (k.v === '(') {
      const v = expr();
      if (!kijk() || kijk().v !== ')') throw new Error('haakje');
      p++;
      return v;
    }
    throw new Error('teken');
  };
  try {
    const v = expr();
    return p === toks.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
