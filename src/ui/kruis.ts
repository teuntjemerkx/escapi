// Kruissom-logica (zelfde regels als scripts/verify-data.mjs).
type Cel = [number, number];

/** Alle rijen en kolommen van minstens 5 vakjes zonder leeg vak ertussen. */
export function looptjesVan(rooster: string[][]): Cel[][] {
  const rijen = rooster.length;
  const kol = Math.max(...rooster.map((r) => r.length));
  const cel = (r: number, c: number) => rooster[r]?.[c] ?? '#';
  const uit: Cel[][] = [];
  const verzamel = (cellen: Cel[]) => {
    let huidig: Cel[] = [];
    for (const rc of [...cellen, null]) {
      if (rc && cel(rc[0], rc[1]) !== '#') huidig.push(rc);
      else {
        if (huidig.length >= 5) uit.push(huidig);
        huidig = [];
      }
    }
  };
  for (let r = 0; r < rijen; r++) verzamel(Array.from({ length: kol }, (_, c) => [r, c] as Cel));
  for (let c = 0; c < kol; c++) verzamel(Array.from({ length: rijen }, (_, r) => [r, c] as Cel));
  return uit;
}

/** Klopt "a op b (op c) = d"? x en : gaan voor + en −. Lege vakjes: nee. */
export function rekenRij(tokens: string[]): boolean {
  const is = tokens.indexOf('=');
  if (is !== tokens.length - 2) return false;
  const links = tokens.slice(0, is);
  if (links.some((t, i) => (i % 2 === 0 ? t === '' || Number.isNaN(Number(t)) : false)) || tokens[is + 1] === '') return false;
  const t: (string | number)[] = links.map((x, i) => (i % 2 ? x : Number(x)));
  for (let i = 1; i < t.length; i += 2) {
    if (t[i] === 'x' || t[i] === ':') {
      const v = t[i] === 'x' ? (t[i - 1] as number) * (t[i + 1] as number) : (t[i - 1] as number) / (t[i + 1] as number);
      t.splice(i - 1, 3, v);
      i -= 2;
    }
  }
  let v = t[0] as number;
  for (let i = 1; i < t.length; i += 2) v = t[i] === '+' ? v + (t[i + 1] as number) : v - (t[i + 1] as number);
  return Math.abs(v - Number(tokens[is + 1])) < 1e-9;
}
