// Wereld 1: De Ellehaven. Een compacte Hollandse haven rond één havenkom (zie docs/ontwerp/wereld1.md).
// Assen: x naar het oosten, z naar het zuiden (noord = −z). Kade en vloeren op y = 0, water op y = WATER_Y.
//
//              zee (noord)
//   havenhoofd + vuurtoren          ┌ De Eenheid langs de vertrekkade ┐
//   werf: helling | ophaalbrug over de havenmond | vertrekkade (poort + seinmast)
//   werf: werkplaats | pakhuiskade | havenkom met steigers | oostkade | vertrekloods
//   pakhuis De Hijsbalk           |                        |          | weegloods
//   visafslag                     |  kadeplein (start)                | kantine
//                                 |  havenkantoor + klokkentoren
import type { Kamer, Plattegrond } from '../werelden/types';

const K = (id: string, naam: string, pos: [number, number], maat: [number, number], extra: Partial<Kamer> = {}): Kamer => ({ id, naam, pos, maat, ...extra });
const BUITEN = { buiten: true, rand: 'geen' as const };

/** Waterpeil in de haven (m onder de kade). Om half tien is het hoogwater. */
export const WATER_Y = -1.0;

export const PLAN: Plattegrond = {
  muurHoogte: 3.6,
  verdiepingHoogte: 3.9,
  gevel: '#8a4b35',
  daken: { kleur: '#8e3f2c', helling: 0.85 },
  kamers: [
    // ── het hart: kadeplein en havenkantoor ──
    K('kadeplein', 'Kadeplein', [0, 10], [28, 8], { ...BUITEN, vloer: 'kinderkopjes', vloerKleur: '#8c8378' }),
    K('havenmeester', 'Havenmeesterij', [0, 18], [16, 8], { vloer: 'visgraat', vloerKleur: '#9a6a3e', muur: '#d9e4e6', lambrisering: '#24465e', lampen: [[-3, 17.6], [4, 18.4]], dakNok: 'x' }),
    K('kaartenkamer', 'Kaartenkamer', [0, 18], [16, 8], { verdieping: 1, hoogte: 3.3, vloer: 'planken', vloerKleur: '#8a6440', muur: '#e8e0cc', lambrisering: '#5a3a26', lampen: [[-3, 17.8], [3, 17.8]], dakNok: 'x' }),
    K('balkon', 'Balkon', [0, 12.5], [8, 3], { verdieping: 1, buiten: true, rand: 'reling', vloer: 'planken', vloerKleur: '#7a5a3a' }),
    // ── west: visafslag, pakhuis, werf, havenhoofd ──
    K('visafslag', 'Visafslag', [-20, 14], [12, 16], { hoogte: 6.5, plafond: 'glas', vloer: 'beton', vloerKleur: '#a9b0b2', muur: '#e7eeef', lambrisering: '#f3f6f6', lampen: [[-18.4, 16.4], [-18.4, 9.5]] }),
    K('pakhuis', 'Pakhuis De Hijsbalk', [-20, 0], [12, 12], {
      vloer: 'planken',
      vloerKleur: '#7d5a3a',
      muurSoort: 'steen',
      muur: '#8f6450',
      lampen: [[-20, 0]],
      kolommen: { afstand: [12, 6], rand: [6, 3], dikte: 0.3, rond: true, kleur: '#3b3f44' },
    }),
    K('zolder', 'Zolder', [-20, 0], [12, 12], { verdieping: 1, vloer: 'planken', vloerKleur: '#8a6440', muurSoort: 'steen', muur: '#9a6e58', lampen: [[-19, 1]], dak: 'zadel', dakNok: 'x' }),
    K('pakhuiskade', 'Pakhuiskade', [-11, -6], [6, 24], { ...BUITEN, vloer: 'kinderkopjes', vloerKleur: '#857e76' }),
    K('werkplaats', 'Werkplaats', [-20, -12], [12, 12], {
      hoogte: 6,
      open: ['o'],
      inkijk: true,
      plafond: 'spanten',
      vloer: 'beton',
      vloerKleur: '#9a9690',
      muurSoort: 'steen',
      muur: '#7f5a48',
      lampen: [[-20, -12]],
      kolommen: { afstand: [12, 4], rand: [11.75, 2], dikte: 0.34, kleur: '#3d4a52' },
      dak: 'zadel',
      dakNok: 'x',
    }),
    K('werfterrein', 'Werf', [-17, -21], [18, 6], { ...BUITEN, vloer: 'beton', vloerKleur: '#8f8b84' }),
    K('havenhoofd', 'Havenhoofd', [-11, -29], [6, 10], { ...BUITEN, vloer: 'steen', vloerKleur: '#77736d' }),
    // ── de havenkom: vaste houten steigers op palen en de ophaalbrug over de havenmond ──
    K('hoofdsteiger', 'Steiger', [0, -2], [3, 16], { ...BUITEN, vloer: 'vlonder' }),
    K('werkponton', 'Steiger', [-3.55, -3.0], [4.1, 3.2], { ...BUITEN, vloer: 'vlonder' }),
    K('cafeponton', 'Steiger', [3.95, -3.0], [4.9, 4.0], { ...BUITEN, vloer: 'vlonder' }),
    K('kopponton', 'Steiger', [0, -12.2], [12.8, 4.4], { ...BUITEN, vloer: 'vlonder' }),
    K('brug', 'Ophaalbrug', [0, -16.5], [16, 3], { ...BUITEN, zonderVloer: true }),
    // ── oost: oostkade, weegloods, kantine, vertrekloods, vertrekkade ──
    K('oostkade', 'Oostkade', [11, -6], [6, 24], { ...BUITEN, vloer: 'kinderkopjes', vloerKleur: '#857e76' }),
    K('weegloods', 'Weegloods', [20, 0], [12, 12], {
      hoogte: 6,
      open: ['w'],
      inkijk: true,
      plafond: 'spanten',
      vloer: 'beton',
      vloerKleur: '#a3a29d',
      muur: '#d6dadb',
      lambrisering: '#3f6f8a',
      lampen: [[20, -2], [20, 3]],
      kolommen: { afstand: [12, 4], rand: [0.25, 2], dikte: 0.34, kleur: '#2f6f9a' },
      dak: 'plat',
    }),
    K('kantine', 'Kantine', [20, 10], [12, 8], { hoogte: 3.2, vloer: 'tegels', vloerKleur: '#d8d2c4', muur: '#efe8da', lambrisering: '#3f6f8a', plafondKleur: '#f2efe9', lampen: [[17.5, 10], [22.5, 10]], dak: 'plat' }),
    K('vertrekloods', 'Vertrekloods', [20, -12], [12, 12], { hoogte: 6.5, plafond: 'glasgewelf', vloer: 'terrazzo', vloerKleur: '#ddd5c6', muur: '#efe9df', lambrisering: '#2f4d6b', lampen: [[19, -9], [20, -14.5]] }),
    K('vertrekkade', 'Vertrekkade', [22, -22], [20, 8], { ...BUITEN, vloer: 'beton', vloerKleur: '#96928b' }),
    // achter de poort: de loopplank naar het dek van De Eenheid (helling in registreer)
    K('loopplank', 'Loopplank', [16.5, -28.5], [3.4, 5], { ...BUITEN, zonderVloer: true }),
  ],
  doorgangen: [
    // havenkantoor
    { pos: [0, 14], as: 'x', soort: 'dubbel', vanaf: 'instructie' },
    { pos: [-5, 14], as: 'x', soort: 'raam', breed: 2.4, borst: 0.9, hoog: 2.8 },
    { pos: [5.2, 14], as: 'x', soort: 'raam', breed: 2.4, borst: 0.9, hoog: 2.8 },
    { pos: [-5, 14], as: 'x', soort: 'raam', breed: 2.4, borst: 0.9, hoog: 2.6, verdieping: 1 },
    { pos: [6.0, 14], as: 'x', soort: 'raam', breed: 2.0, borst: 0.9, hoog: 2.6, verdieping: 1 },
    { pos: [2.6, 14], as: 'x', verdieping: 1 },
    // visafslag (roldeur vanaf het plein, hoge ramen, koelceldeur naar het pakhuis)
    { pos: [-14, 10], as: 'z', soort: 'roldeur', breed: 4, vanaf: 'begeleid' },
    { pos: [-14, 18.2], as: 'z', soort: 'raam', breed: 4.4, borst: 2.6, hoog: 5.8 },
    { pos: [-20, 22], as: 'x', soort: 'raam', breed: 6, borst: 2.8, hoog: 5.8 },
    { pos: [-18.6, 6], as: 'x', vanaf: 'zelfstandig' },
    // hekken van het plein naar de kades en de steiger
    { pos: [-11, 6], as: 'x', breed: 3, vanaf: 'zelfstandig' },
    { pos: [11, 6], as: 'x', breed: 3, vanaf: 'zelfstandig' },
    { pos: [0, 6], as: 'x', breed: 3, vanaf: 'zelfstandig' },
    // pakhuis
    { pos: [-14, 0], as: 'z', soort: 'dubbel', vanaf: 'zelfstandig' },
    { pos: [-14, 3.8], as: 'z', soort: 'raam', breed: 1.2, borst: 1.0, hoog: 2.5 },
    { pos: [-14, -3.8], as: 'z', soort: 'raam', breed: 1.2, borst: 1.0, hoog: 2.5 },
    { pos: [-14, 0], as: 'z', soort: 'raam', breed: 1.8, borst: 0.5, hoog: 2.7, verdieping: 1 },
    // werkplaats: roldeur naar de helling (staat open)
    { pos: [-17, -18], as: 'x', soort: 'roldeur', breed: 4 },
    // weegloods en kantine
    { pos: [20, 6], as: 'x', soort: 'boog' },
    { pos: [14, 8.6], as: 'z', soort: 'raam', breed: 2.2, borst: 0.9, hoog: 2.4 },
    { pos: [14, 11.6], as: 'z', soort: 'raam', breed: 2.2, borst: 0.9, hoog: 2.4 },
    // vertrekloods
    { pos: [14, -12], as: 'z', soort: 'roldeur', breed: 4, vanaf: 'evaluatie' },
    { pos: [17.5, -18], as: 'x', soort: 'open', breed: 4, hoog: 3.6, vanaf: 'evaluatie' },
    { pos: [23, -18], as: 'x', soort: 'raam', breed: 4, borst: 0.6, hoog: 3.8 },
    // de ophaalbrug: hekken aan beide kanten tot de Eindcheck
    { pos: [-8, -16.5], as: 'z', breed: 3, vanaf: 'evaluatie' },
    { pos: [8, -16.5], as: 'z', breed: 3, vanaf: 'evaluatie' },
  ],
  trappen: [
    // havenkantoor: de eenhedentrap naar de kaartenkamer (dicht tot Zelf doen)
    { pos: [3.4, 20.9], as: 'x', richting: 1, lengte: 5.2, breed: 1.2, van: 0, vanaf: 'zelfstandig' },
    // pakhuis: houten trap naar de zolder
    { pos: [-20, -5.0], as: 'x', richting: -1, lengte: 5.2, breed: 1.1, van: 0 },
  ],
  uitgang: { pos: [16.5, -26], as: 'x' },
};

export const SPAWN: [number, number] = [1.5, 11.0];

export type Plek = {
  pos: [number, number];
  rot?: number;
  schaal?: number;
  tafel?: [number, number];
  tafelSoort?: 'hout' | 'vilt' | 'sokkel';
  botser?: [number, number];
  decorPos?: [number, number, number];
  verdieping?: number;
};
const T = (pos: [number, number], tafel: [number, number], soort: 'hout' | 'vilt' | 'sokkel' = 'hout', x: Partial<Plek> = {}): Plek => ({ pos, tafel, tafelSoort: soort, ...x });
const PI = Math.PI;

/** Waar elk station staat (rot: 0 = voorkant naar +z, π/2 = naar +x, π = naar −z, −π/2 = naar −x). */
export const PLEKKEN: Record<string, Plek> = {
  // Kadeplein en havenmeesterij
  terugblik: { pos: [5.5, 8.4] },
  uitleg: T([-3.0, 17.4], [2.4, 1.1], 'hout', { rot: PI }),
  // Visafslag: vijf kavels in een U rond de afslagvloer (werkboekvolgorde)
  meetkist: T([-15.6, 14.2], [1.7, 0.9], 'hout', { rot: -PI / 2 }),
  meetlat: T([-15.6, 18.6], [2.7, 0.8], 'hout', { rot: -PI / 2 }),
  maatbeker: T([-18.6, 20.6], [1.5, 0.8], 'hout', { rot: PI }),
  paddenstoel: T([-21.2, 18.4], [2.6, 1.5], 'vilt', { rot: PI / 2 }),
  suikerpak: T([-21.2, 14.2], [1.3, 0.8], 'hout', { rot: PI / 2 }),
  // Werf: klus "Meten op de werf"
  snelwegbord: { pos: [-24.8, -20.2], rot: PI / 2, botser: [2.4, 0.5] },
  werkplaats: { pos: [-21.6, -16.2], botser: [2.7, 1.5] },
  hakken: { pos: [-17.4, -7.3], rot: PI, botser: [1.9, 1.1] },
  omleiding: T([-11.4, -20.6], [2.5, 1.5], 'vilt'),
  // Steigers: klus "Schenken op de steigers"
  kombuis: { pos: [-4.4, -3.0], rot: PI / 2, botser: [2.3, 1.7] },
  cocktail: { pos: [4.4, -3.6], rot: -PI / 2, botser: [1.0, 1.0] },
  badje: { pos: [3.9, -12.2], rot: -PI / 2, botser: [2.4, 2.4] },
  smoothie: { pos: [-3.9, -12.2], rot: PI / 2, tafel: [1.6, 0.8], tafelSoort: 'hout', decorPos: [0, -0.8, 0], botser: [3.1, 3.0] },
  // Weegloods en kantine: klus "Wegen in de loods"
  rijstkom: T([21.6, 12.6], [1.2, 0.8], 'hout', { rot: PI, decorPos: [0, -0.8, 0], botser: [2.3, 2.2] }),
  weegschaal: { pos: [17.6, -3.2], botser: [1.6, 1.6] },
  klontjes: T([24.6, -3.6], [1.1, 0.7], 'hout', { rot: -PI / 2, decorPos: [0, -0.8, 0], botser: [2.2, 2.2] }),
  // Kaartenkamer (verdieping 1): de zes rijen van de rekenkaart op lessenaars
  'kaart-lengte': { pos: [-5.2, 16.2], rot: PI, verdieping: 1 },
  'kaart-opp': { pos: [0, 16.2], rot: PI, verdieping: 1 },
  'kaart-inhoud': { pos: [5.2, 16.2], rot: PI, verdieping: 1 },
  'kaart-liter1': { pos: [-5.2, 18.6], rot: PI, verdieping: 1 },
  'kaart-liter2': { pos: [0, 18.6], rot: PI, verdieping: 1 },
  'kaart-gewicht': { pos: [5.2, 18.6], rot: PI, verdieping: 1 },
  // Pakhuis: goederen beneden, lichte spullen op zolder
  kabelhaspel: { pos: [-17.4, -2.4], schaal: 1.25, botser: [2.9, 2.0] },
  cement: { pos: [-23.0, 2.4], rot: PI / 2, schaal: 1.35, botser: [3.6, 2.2] },
  zandbak: { pos: [-22.4, 2.6], rot: PI / 2, botser: [3.1, 1.6], verdieping: 1 },
  'bag-in-box': T([-17.2, 3.4], [1.3, 0.8], 'hout', { verdieping: 1 }),
  buitenmissie: { pos: [-5.4, 12.4], rot: PI, botser: [2.6, 1.0] },
  // Keuze op de werf, in de kantine en op het havenhoofd
  champagne: { pos: [-20.6, -20.6], rot: PI / 2, botser: [1.5, 1.0] },
  auto: T([16.8, 10.6], [2.3, 1.3], 'vilt'),
  weerstation: { pos: [-11.0, -26.4], botser: [2.4, 1.8] },
  // De drie 24-kaarten: beloningsplekken
  'kaart24-1': { pos: [-12.6, -29.8], rot: PI / 2 },
  'kaart24-2': { pos: [-15.6, -3.4], rot: -PI / 2, verdieping: 1 },
  'kaart24-3': { pos: [-2.8, 12.5], rot: PI / 2, verdieping: 1 },
  // Eindcheck blok 1: vertrekloods
  koffie: T([17.4, -8.0], [1.2, 0.75], 'hout', { rot: PI }),
  bessen: T([21.0, -8.0], [1.3, 0.75], 'hout', { rot: PI }),
  goud: { pos: [24.8, -10.0], rot: -PI / 2, botser: [2.2, 1.2] },
  vuistregel: { pos: [24.8, -14.2], rot: -PI / 2, botser: [2.0, 1.0] },
  pont: T([22.4, -16.4], [1.9, 1.1], 'vilt'),
  // Eindcheck blok 2: vertrekkade, naast De Eenheid
  regenmeter: { pos: [21.0, -24.4], botser: [2.2, 1.6] },
  parkeerschijf: { pos: [30.0, -22.0], rot: -PI / 2, schaal: 0.7, botser: [2.0, 2.2] },
  klontjesdoos: T([21.4, -19.6], [1.1, 0.7], 'hout', { rot: PI }),
  watervat: { pos: [25.6, -24.9], botser: [2.5, 0.8] },
  mondwater: { pos: [25.6, -20.2], rot: PI, botser: [2.3, 1.2] },
};

export const KLUIS_PLEK: Record<string, { pos: [number, number]; rot: number }> = {
  lengte: { pos: [-25.3, -12.0], rot: PI / 2 },
  inhoud: { pos: [0, -13.2], rot: 0 },
  gewicht: { pos: [25.3, 1.0], rot: -PI / 2 },
};

/** Verstopte lampjes [x, z] of [x, z, verdieping]: in hoeken, achter dingen, op de beloningsplekken. */
export const LAMPJES_HUIS: ([number, number] | [number, number, number])[] = [
  [-13.3, 13.3],
  [-15.0, 21.2],
  [-7.3, 21.3, 1],
  [-15.0, 5.3, 1],
  [-25.3, -17.3],
  [-12.9, -33.4],
  [5.8, -1.6],
  [25.4, -5.4],
];
