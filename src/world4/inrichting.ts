// Wereld 4 – inrichting van Winkelcentrum De Honderd (meubels en aankleding) als gegevens.
// Wereld4.tsx tekent ze; check.mjs controleert dat ze niet op een station, deur, roltrap of lampje staan.
// `maat` = botsvak [x, z] in de wereld (leeg = geen botsing). `v` = verdieping (1 = galerijniveau, vloer +5 m).

export type V2 = [number, number];
type Basis = { pos: V2; v?: number; maat?: V2 };
export type Meubel = Basis &
  (
    | { soort: 'plant'; s?: number; variant?: number }
    | { soort: 'bank'; rot?: number; b?: number; kleur?: string }
    | { soort: 'fauteuil'; rot?: number; kleur?: string }
    | { soort: 'kleed'; b: number; d: number; kleur?: string; rand?: string }
    | { soort: 'balie'; rot?: number; b: number; tekst: string; kleur: string }
    | { soort: 'toonbank'; rot?: number; b?: number; kleur?: string }
    | { soort: 'kledingrek'; rot?: number }
    | { soort: 'paskamer'; rot?: number }
    | { soort: 'paspop'; rot?: number; kleur: string }
    | { soort: 'rek'; rot?: number; b: number; inhoud: 'tijdschriften' | 'flessen' | 'snoep' | 'dozen' | 'knuffels' }
    | { soort: 'fruitkrat'; rot?: number }
    | { soort: 'winkelwagen'; rot?: number }
    | { soort: 'verfblikken' }
    | { soort: 'ladder'; rot?: number }
    | { soort: 'infobord'; rot?: number }
    | { soort: 'kraam'; rot?: number; naam: string; kleur: string; w?: number }
    | { soort: 'terrastafel'; rot?: number; kleur: string }
    | { soort: 'paal'; h?: number }
    | { soort: 'zuil'; h?: number }
    | { soort: 'bomenbak'; s?: number }
    | { soort: 'bloembak'; rot?: number; b?: number }
    | { soort: 'popcorn'; rot?: number }
    | { soort: 'speelkast'; rot?: number; kleur?: string; tekst?: string }
    | { soort: 'kappersstoel'; rot?: number }
    | { soort: 'wasbak'; rot?: number }
    | { soort: 'stelling'; rot?: number; b?: number; h?: number }
    | { soort: 'eettafel'; kleur?: string }
    | { soort: 'lantaarn' }
    | { soort: 'fontein' }
    | { soort: 'bureau'; rot?: number }
  );

/** Iets aan de muur: x, hoogte (boven de eigen vloer), z (net voor de muur), draaiing en verdieping. */
export type Wand = { pos: [number, number, number]; rot?: number; v?: number } & (
  | { soort: 'naambord'; tekst: string; b?: number; kleur?: string; fg?: string }
  | { soort: 'poster'; b: number; h: number; motief: 'korting' | 'welkom' | 'strand' | 'spiegel' | 'kermis' | 'film' | 'nieuws' }
  | { soort: 'schoolbord'; regels: string[]; b: number; h: number }
  | { soort: 'wandplank'; b: number; seed: number }
  | { soort: 'frank'; b: number }
  | { soort: 'liftdeuren' }
);

const R = Math.PI / 2;
/** Net voor een muur (kamerkant): muur op `c`, kamer aan de kant `k` (+1 of −1). */
const voor = (c: number, k: 1 | -1) => c + k * 0.17;

export const MEUBELS: Meubel[] = [
  // ── Liftportaal ──
  { soort: 'infobord', pos: [2.4, 23.0], rot: -0.5, maat: [1.2, 0.9] },
  { soort: 'plant', pos: [-3.4, 23.4], variant: 2, s: 1.1, maat: [0.7, 0.7] },
  // ── Klantenservice ──
  { soort: 'balie', pos: [13.6, 23.25], rot: 2 * R, b: 2.6, tekst: 'Klantenservice', kleur: '#2f4a5e', maat: [2.7, 0.8] },
  { soort: 'fauteuil', pos: [6.2, 23.2], rot: 2 * R, kleur: '#c9a27a', maat: [0.95, 0.95] },
  { soort: 'fauteuil', pos: [7.5, 23.2], rot: 2 * R, kleur: '#c9a27a', maat: [0.95, 0.95] },
  { soort: 'plant', pos: [15.3, 18.7], variant: 1, maat: [0.7, 0.7] },
  { soort: 'kleed', pos: [11.0, 20.6], b: 4.2, d: 3.6, kleur: '#35506b', rand: '#c9d6e2' },
  // ── Foyer en speelhal ──
  { soort: 'toonbank', pos: [-11.6, 23.3], rot: 2 * R, b: 2.6, kleur: '#7a1f2c', maat: [2.7, 0.8] },
  { soort: 'popcorn', pos: [-6.0, 23.3], rot: 2 * R, maat: [0.8, 0.6] },
  { soort: 'speelkast', pos: [-15.4, 20.4], rot: R, kleur: '#3d7cc9', tekst: 'RACE', maat: [0.8, 0.8] },
  { soort: 'speelkast', pos: [-15.4, 21.5], rot: R, kleur: '#8b3fb5', tekst: 'DANS', maat: [0.8, 0.8] },
  { soort: 'kleed', pos: [-8.6, 21.6], b: 3.4, d: 4.2, kleur: '#a8283c', rand: '#e8c07a' },
  // ── Marktpassage ──
  { soort: 'bank', pos: [-3.2, 15.3], rot: R, b: 1.6, kleur: '#7a5233', maat: [0.6, 1.7] },
  { soort: 'lantaarn', pos: [-3.0, 10.2], maat: [0.45, 0.45] },
  { soort: 'lantaarn', pos: [3.0, 16.25], maat: [0.45, 0.45] },
  // ── Markthal ──
  { soort: 'kraam', pos: [6.6, 17.0], rot: 2 * R, naam: 'Groente en fruit', kleur: '#6aa84f', w: 3.6, maat: [3.8, 1.9] },
  { soort: 'kraam', pos: [14.0, 17.0], rot: 2 * R, naam: 'Kaas', kleur: '#e8b04a', w: 3.0, maat: [3.2, 1.9] },
  { soort: 'fruitkrat', pos: [9.0, 9.0], rot: 0.2, maat: [1.0, 0.8] },
  { soort: 'fruitkrat', pos: [15.3, 9.0], rot: -0.3, maat: [1.0, 0.8] },
  // ── Modehuis ──
  { soort: 'paskamer', pos: [-15.2, 10.4], rot: R, maat: [1.4, 1.4] },
  { soort: 'paskamer', pos: [-15.2, 12.0], rot: R, maat: [1.4, 1.4] },
  { soort: 'kledingrek', pos: [-9.6, 11.2], maat: [1.8, 0.6] },
  { soort: 'kledingrek', pos: [-12.2, 14.4], rot: R, maat: [0.6, 1.8] },
  { soort: 'paspop', pos: [-5.0, 10.2], rot: R, kleur: '#e86f8a', maat: [0.5, 0.5] },
  { soort: 'paspop', pos: [-5.0, 15.8], rot: R, kleur: '#5aa9ff', maat: [0.5, 0.5] },
  { soort: 'toonbank', pos: [-11.8, 8.75], b: 2.2, kleur: '#6b3a4f', maat: [2.3, 0.8] },
  // ── Koepelplein ──
  { soort: 'fontein', pos: [0, 0], maat: [2.7, 2.7] },
  { soort: 'zuil', pos: [-5.25, -5.25], h: 10 },
  { soort: 'zuil', pos: [5.25, -5.25], h: 10 },
  { soort: 'zuil', pos: [-5.25, 5.25], h: 10 },
  { soort: 'zuil', pos: [5.25, 5.25], h: 10 },
  { soort: 'bank', pos: [6.6, 6.75], b: 1.8, kleur: '#3b2a1f', maat: [1.9, 0.6] },
  { soort: 'bank', pos: [-6.6, -6.75], rot: 2 * R, b: 1.8, kleur: '#3b2a1f', maat: [1.9, 0.6] },
  { soort: 'bomenbak', pos: [-6.7, 6.6], maat: [1.1, 1.1] },
  { soort: 'bomenbak', pos: [6.7, -6.6], maat: [1.1, 1.1] },
  { soort: 'infobord', pos: [2.2, 6.0], maat: [1.8, 0.6] },
  // ── Bouwmarkt en magazijn ──
  { soort: 'rek', pos: [15.5, 6.4], rot: -R, b: 2.2, inhoud: 'dozen', maat: [0.6, 2.3] },
  { soort: 'rek', pos: [9.7, -7.45], b: 2.2, inhoud: 'dozen', maat: [2.3, 0.6] },
  { soort: 'rek', pos: [12.9, 7.45], rot: 2 * R, b: 2.4, inhoud: 'dozen', maat: [2.5, 0.6] },
  { soort: 'verfblikken', pos: [9.1, 4.6], maat: [0.8, 0.8] },
  { soort: 'ladder', pos: [15.4, -5.2], rot: -R, maat: [0.6, 0.6] },
  { soort: 'winkelwagen', pos: [9.4, -4.4], rot: 0.5, maat: [0.8, 0.9] },
  { soort: 'stelling', pos: [15.45, -13.2], rot: -R, b: 3.0, maat: [0.7, 3.1] },
  { soort: 'stelling', pos: [11.6, -15.45], b: 2.6, maat: [2.7, 0.7] },
  // ── Drogist en kapsalon ──
  { soort: 'rek', pos: [-15.5, 6.0], rot: R, b: 2.2, inhoud: 'flessen', maat: [0.6, 2.3] },
  { soort: 'rek', pos: [-12.6, 7.45], rot: 2 * R, b: 2.2, inhoud: 'flessen', maat: [2.3, 0.6] },
  { soort: 'rek', pos: [-12.6, -4.0], b: 2.2, inhoud: 'flessen', maat: [2.3, 0.6] },
  { soort: 'balie', pos: [-10.2, -6.6], b: 2.4, tekst: 'Apotheek', kleur: '#2e7a72', maat: [2.5, 0.8] },
  { soort: 'kappersstoel', pos: [-11.0, -14.9], rot: 0, maat: [0.7, 0.7] },
  { soort: 'wasbak', pos: [-15.45, -10.6], rot: R, maat: [0.6, 0.7] },
  // ── Etalagestraat en de acht winkeltjes ──
  { soort: 'bank', pos: [-3.2, -12.0], rot: R, b: 1.8, kleur: '#3b2a1f', maat: [0.6, 1.9] },
  { soort: 'lantaarn', pos: [-3.2, -16.0], maat: [0.45, 0.45] },
  { soort: 'lantaarn', pos: [3.2, -16.0], maat: [0.45, 0.45] },
  { soort: 'plant', pos: [3.3, -23.2], variant: 2, s: 1.15, maat: [0.7, 0.7] },
  // rek tegen de achterwand van elk winkeltje
  ...([
    [-1, -10, 'dozen'],
    [-1, -14, 'tijdschriften'],
    [-1, -18, 'tijdschriften'],
    [-1, -22, 'tijdschriften'],
    [1, -10, 'knuffels'],
    [1, -14, 'flessen'],
    [1, -18, 'dozen'],
    [1, -22, 'tijdschriften'],
  ] as const).map(([k, z, inhoud]): Meubel => ({ soort: 'rek', pos: [k * 9.55, z], rot: -k * R, b: 2.4, inhoud, maat: [0.6, 2.5] })),

  // ── Galerijniveau (v 1) ──
  // Mediaplein
  { soort: 'bank', pos: [-12.6, 2.4], v: 1, rot: 2 * R, b: 2.0, kleur: '#2f6fd6', maat: [2.1, 0.6] },
  { soort: 'bank', pos: [-12.6, -2.4], v: 1, b: 2.0, kleur: '#2f6fd6', maat: [2.1, 0.6] },
  { soort: 'plant', pos: [-9.0, 7.2], v: 1, variant: 2, maat: [0.7, 0.7] },
  // Foodcourt
  { soort: 'kraam', pos: [10.4, 7.0], v: 1, rot: 2 * R, naam: 'Pizza', kleur: '#d83a2e', w: 3.0, maat: [3.2, 1.9] },
  { soort: 'kraam', pos: [13.9, 7.0], v: 1, rot: 2 * R, naam: 'Friet', kleur: '#ffc94d', w: 2.8, maat: [3.0, 1.9] },
  { soort: 'eettafel', pos: [11.2, 2.2], v: 1, kleur: '#e86f8a', maat: [1.3, 1.6] },
  { soort: 'eettafel', pos: [11.2, -1.4], v: 1, kleur: '#2ec4b6', maat: [1.3, 1.6] },
  { soort: 'eettafel', pos: [14.2, -1.4], v: 1, kleur: '#ffc94d', maat: [1.3, 1.6] },
  { soort: 'eettafel', pos: [14.6, -5.6], v: 1, kleur: '#5aa9ff', maat: [1.3, 1.6] },
  // Galerijstraat
  { soort: 'bank', pos: [-7.6, 16.2], v: 1, rot: 2 * R, b: 1.6, kleur: '#5b4a78', maat: [1.7, 0.6] },
  { soort: 'plant', pos: [-4.7, 17.3], v: 1, variant: 1, maat: [0.7, 0.7] },
  { soort: 'plant', pos: [-12.6, 8.7], v: 1, variant: 0, maat: [0.7, 0.7] },
  // Kantoren (dicht: je ziet ze door de ramen)
  { soort: 'bureau', pos: [-5.4, -11], v: 1, rot: -R },
  { soort: 'bureau', pos: [-5.4, -16], v: 1, rot: -R },
  { soort: 'bureau', pos: [-5.4, -21], v: 1, rot: -R },
  // Serre
  { soort: 'plant', pos: [4.6, -12.5], v: 1, variant: 0, s: 1.2, maat: [0.7, 0.7] },
  { soort: 'plant', pos: [4.6, -19.5], v: 1, variant: 1, s: 1.2, maat: [0.7, 0.7] },
  // Dakterras
  { soort: 'bloembak', pos: [15.4, -14.6], v: 1, rot: R, b: 1.4, maat: [0.9, 1.5] },
  { soort: 'bloembak', pos: [6.9, -17.2], v: 1, rot: R, b: 2.4, maat: [0.9, 2.5] },
  { soort: 'terrastafel', pos: [11.6, -12.6], v: 1, rot: 0.3, kleur: '#e86f8a', maat: [1.7, 1.7] },
  { soort: 'paal', pos: [6.4, -8.6], v: 1, h: 3.6, maat: [0.3, 0.3] },
  { soort: 'paal', pos: [15.6, -8.6], v: 1, h: 3.6, maat: [0.3, 0.3] },
  { soort: 'paal', pos: [6.4, -23.6], v: 1, h: 3.6, maat: [0.3, 0.3] },
  { soort: 'paal', pos: [15.6, -23.6], v: 1, h: 3.6, maat: [0.3, 0.3] },
];

/** Zuilen van de koepel: van de vloer tot 10 m, met botsing op beide verdiepingen. */
export const ZUILEN: V2[] = MEUBELS.filter((m) => m.soort === 'zuil').map((m) => m.pos);
export const ZUIL_R = 0.3;

export const WANDEN: Wand[] = [
  // Liftportaal
  { soort: 'liftdeuren', pos: [-1.6, 0, voor(24, -1)], rot: 2 * R },
  { soort: 'liftdeuren', pos: [1.6, 0, voor(24, -1)], rot: 2 * R },
  // Klantenservice
  { soort: 'schoolbord', pos: [9.0, 1.9, voor(24, -1)], rot: 2 * R, regels: ['100% = het hele bedrag', '10% = delen door 10', '1% = delen door 100'], b: 2.8, h: 1.3 },
  // Foyer: filmposters (een ervan is van Frank uit het Spookkasteel)
  { soort: 'frank', pos: [-7.4, 1.75, voor(24, -1)], rot: 2 * R, b: 0.95 },
  { soort: 'poster', pos: [-9.2, 1.75, voor(24, -1)], rot: 2 * R, b: 0.9, h: 1.3, motief: 'film' },
  { soort: 'poster', pos: [-14.0, 1.9, voor(18, 1)], b: 1.3, h: 0.9, motief: 'kermis' },
  // Modehuis
  { soort: 'poster', pos: [voor(-16, 1), 1.6, 15.6], rot: R, b: 0.9, h: 1.8, motief: 'spiegel' },
  { soort: 'poster', pos: [-8.5, 2.2, voor(18, -1)], rot: 2 * R, b: 1.4, h: 0.9, motief: 'korting' },
  // Bouwmarkt en drogist
  { soort: 'wandplank', pos: [voor(16, -1), 2.2, -2.8], rot: -R, b: 1.4, seed: 5 },
  { soort: 'wandplank', pos: [voor(-16, 1), 2.4, -4.6], rot: R, b: 1.4, seed: 3 },
  // Mediaplein (boven)
  { soort: 'poster', pos: [-12.0, 2.0, voor(8, -1)], rot: 2 * R, v: 1, b: 2.4, h: 1.3, motief: 'nieuws' },
  { soort: 'poster', pos: [-12.0, 2.0, voor(-8, 1)], v: 1, b: 2.4, h: 1.3, motief: 'nieuws' },
  // Galerijstraat (boven)
  { soort: 'poster', pos: [voor(-16, 1), 2.6, 15.8], rot: R, v: 1, b: 1.2, h: 0.85, motief: 'strand' },
  { soort: 'poster', pos: [-12.6, 2.2, voor(8, 1)], v: 1, b: 1.6, h: 0.6, motief: 'korting' },
];
