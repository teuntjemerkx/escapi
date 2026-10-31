// Nederlandse getallen lezen en schrijven.

/** Schrijf een getal zoals in het werkboek: komma als decimaal, punt per duizendtal. */
export function nl(x: number, maxDec = 3): string {
  if (!Number.isFinite(x)) return '';
  // Kleine getallen (0,00045 m³) niet wegronden naar 0.
  while (maxDec < 7 && x !== 0 && Math.abs(x) < 10 ** -maxDec * 10) maxDec++;
  const r = Math.round(x * 10 ** maxDec) / 10 ** maxDec;
  const [heel, dec] = Math.abs(r).toString().split('.');
  const metPunten = heel.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (r < 0 ? '−' : '') + metPunten + (dec ? ',' + dec : '');
}

export function geld(x: number): string {
  const [heel, dec] = (Math.round(x * 100) / 100).toFixed(2).split('.');
  return `€ ${heel.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

/**
 * Lees wat de student typt. Geeft alle redelijke lezingen terug, want "1.125" kan
 * 1125 (duizendtal-punt) of 1,125 (decimaal-punt) betekenen. De app rekent het goed
 * als één van de lezingen klopt.
 */
export function lees(invoer: string): number[] {
  let s = invoer.trim().replace(/\s+/g, '').replace(/[€]/g, '').replace(/−/g, '-');
  s = s.replace(/[a-zA-Z²³]+$/g, ''); // eenheid erachter weghalen ("24m²")
  if (!s) return [];
  // Tijd: 1:48 of 1u48 → minuten
  const tijd = s.match(/^(\d+)(?::|u)(\d{1,2})(?:min)?$/i);
  if (tijd) return [Number(tijd[1]) * 60 + Number(tijd[2])];
  if (!/^-?[\d.,]+$/.test(s)) return [];
  const uit = new Set<number>();
  if (s.includes(',')) {
    // komma = decimaal, punten = duizendtallen
    const v = Number(s.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(v)) uit.add(v);
  } else if (s.includes('.')) {
    const delen = s.split('.');
    const alsDuizend = delen.slice(1).every((d) => d.length === 3);
    if (alsDuizend) uit.add(Number(delen.join('')));
    if (delen.length === 2) uit.add(Number(s));
  } else {
    uit.add(Number(s));
  }
  return [...uit].filter(Number.isFinite);
}

export type Afronding = 'geen' | 'heel' | '1-decimaal' | '2-decimalen' | 'naar-boven' | 'naar-beneden' | 'duizendtal';

export function rond(x: number, a?: Afronding): number {
  switch (a) {
    case 'heel':
      return Math.round(x);
    case '1-decimaal':
      return Math.round(x * 10) / 10;
    case '2-decimalen':
      return Math.round(x * 100) / 100;
    case 'naar-boven':
      return Math.ceil(x - 1e-9);
    case 'naar-beneden':
      return Math.floor(x + 1e-9);
    case 'duizendtal':
      return Math.round(x / 1000) * 1000;
    default:
      return x;
  }
}

/** Klopt de invoer met het verwachte getal (met marge)? */
export function klopt(invoer: string, verwacht: number, tolerantie = 0): boolean {
  const marge = Math.max(tolerantie, 1e-9 * Math.max(1, Math.abs(verwacht)));
  return lees(invoer).some((v) => Math.abs(v - verwacht) <= marge);
}

/** Tekst uit de data ("1.2*0.8") is nooit nodig in de app; hier alleen NL-weergave van waarden. */
export function toon(w: number | string, eenheid?: string): string {
  const t = typeof w === 'number' ? nl(w) : w;
  return eenheid ? `${t} ${eenheid}` : t;
}
