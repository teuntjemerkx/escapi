// Wereld 4 als gebouw: "Winkelcentrum De Honderd", een kruisvormige passage met een glazen koepel (ontwerp: docs/ontwerp/wereld4.md).
// Assen: het midden van de koepel is [0, 0]; je begint bij de liften (+z) en kijkt naar −z, waar de uitgang is.
// Twee lagen: begane grond (0) en galerijniveau (1, vloer +5 m). Hoge ruimtes (passages, markthal, koepelplein) zijn 10 m.
// Kamers, doorgangen, roltrappen en de plek van elk station. Controle: node src/world4/check.mjs
import type { Kamer, Plattegrond } from '../werelden/types';

const K = (id: string, naam: string, pos: [number, number], maat: [number, number], extra: Partial<Kamer> = {}): Kamer => ({ id, naam, pos, maat, ...extra });

/** Vloer tot vloer (m). */
export const HV = 5;

const terrazzo = { vloer: 'terrazzo' as const, vloerKleur: '#e9e2d4', muur: '#efe7da', lambrisering: '#c9bfae' };
const winkel = (muur: string, plint: string) => ({ muur, lambrisering: plint, plafondKleur: '#f4f1ea', plafond: 'systeem' as const });
const unit = (vloerKleur: string, muur: string): Partial<Kamer> => ({ vloer: 'tegels', vloerKleur, muur, lambrisering: '#5a4f48', plafondKleur: '#f4f1ea', inkijk: true });

export const PLAN: Plattegrond = {
  muurHoogte: 4.7,
  verdiepingHoogte: HV,
  gevel: '#8b7f78',
  gevelSoort: 'pleister',
  aanlicht: { kleur: '#ffd7a8', hoogte: 6, sterkte: 0.7 },
  kamers: [
    // ── Begane grond: de as van de liften (+z) naar de uitgang (−z) ──
    K('lift', 'Liftportaal', [0, 21], [8, 6], { ...terrazzo, plafondKleur: '#f2eee6', dak: 'plat', lampen: [[0, 21]] }),
    K('klantenservice', 'Klantenservice', [10, 21], [12, 6], { vloer: 'tapijt', vloerKleur: '#3f5e7a', ...winkel('#dfe8ee', '#2f4a5e'), dak: 'plat', inkijk: true }),
    K('foyer', 'Foyer en speelhal', [-10, 21], [12, 6], { vloer: 'tapijt', vloerKleur: '#7a2434', muur: '#6a4a72', lambrisering: '#2f2236', plafondKleur: '#4a3a56', dak: 'plat', inkijk: true, lampen: [[-8.6, 21], [-13, 21.5]] }),
    K('marktpassage', 'Marktpassage', [0, 13], [8, 10], { ...terrazzo, hoogte: 10, plafond: 'glasgewelf', lampen: [[0, 13]] }),
    K('markthal', 'Markthal', [10, 13], [12, 10], { vloer: 'steen', vloerKleur: '#c9b9a0', muur: '#f2e2b8', lambrisering: '#7a5236', hoogte: 10, plafond: 'gewelf', plafondKleur: '#f3dfb5', lampen: [[9, 11]] }),
    K('modehuis', 'Modehuis', [-10, 13], [12, 10], { vloer: 'visgraat', vloerKleur: '#b98a5a', ...winkel('#efdbe0', '#6b3a4f'), inkijk: true, lampen: [[-9, 14.5]] }),
    K('koepelplein', 'Koepelplein', [0, 0], [16, 16], { ...terrazzo, hoogte: 10, plafond: 'glaskoepel', lampen: [[0, 0]] }),
    K('bouwmarkt', 'Bouwmarkt en elektro', [12, 0], [8, 16], { vloer: 'beton', vloerKleur: '#a8a39a', ...winkel('#f4e2a8', '#7a5a2b'), inkijk: true, lampen: [[12, 1]] }),
    K('magazijn', 'Magazijn', [13, -12], [6, 8], { vloer: 'beton', vloerKleur: '#9a958c', muur: '#d8d2c6', lambrisering: '#6f6a62', plafond: 'spanten', plafondKleur: '#cfc9bd' }),
    K('drogist', 'Drogist', [-12, 0], [8, 16], { vloer: 'tegels', vloerKleur: '#e3ecec', ...winkel('#d3eee9', '#2e7a72'), inkijk: true, lampen: [[-12, 1]] }),
    K('kapsalon', 'Kapsalon', [-13, -12], [6, 8], { vloer: 'visgraat', vloerKleur: '#8f6a4a', muur: '#e6f2ef', lambrisering: '#2e7a72', plafondKleur: '#f4f1ea' }),
    K('etalagestraat', 'Etalagestraat', [0, -16], [8, 16], { ...terrazzo, hoogte: 10, plafond: 'glasgewelf', lampen: [[0, -12], [0, -20]] }),
    // acht winkeltjes langs de Etalagestraat (blok 1 vooraan, blok 2 achteraan)
    K('L1', 'Schoenen', [-7, -10], [6, 4], unit('#d9c7b0', '#f1e4d6')),
    K('L2', 'OV-punt', [-7, -14], [6, 4], unit('#cfd8e3', '#e2ecf6')),
    K('L3', 'Studie', [-7, -18], [6, 4], unit('#d6cfbf', '#eef0e2')),
    K('L4', 'Boeken', [-7, -22], [6, 4], unit('#b99a7a', '#f2e6d0')),
    K('R1', 'Strand en zwem', [7, -10], [6, 4], unit('#f2e3c0', '#dff1f6')),
    K('R2', 'Wonen en bad', [7, -14], [6, 4], unit('#e8e4dc', '#e4eef0')),
    K('R3', 'Telecom', [7, -18], [6, 4], unit('#d4d8de', '#e6e2f2')),
    K('R4', 'Uitzendbureau', [7, -22], [6, 4], unit('#d8d0c4', '#f0eadf')),
    K('techniek-w', 'Techniek', [-13, -20], [6, 8], { vloer: 'beton', muur: '#bdb8ae', lambrisering: '#8a857c' }),
    K('techniek-o', 'Techniek', [13, -20], [6, 8], { vloer: 'beton', muur: '#bdb8ae', lambrisering: '#8a857c' }),

    // ── Galerijniveau (vloer +5 m) ──
    // de galerij: een ring van vier stroken rond de vide (x −5..5, z −5..5); de zijstroken lopen open over in de lange stroken
    K('galerij-n', 'Galerij', [0, 6.5], [16, 3], { verdieping: 1, galerij: true, hoogte: 5, plafond: 'open', ...terrazzo }),
    K('galerij-z', 'Galerij', [0, -6.5], [16, 3], { verdieping: 1, galerij: true, hoogte: 5, plafond: 'open', ...terrazzo }),
    K('galerij-w', 'Galerij', [-6.5, 0], [3, 10], { verdieping: 1, galerij: true, hoogte: 5, plafond: 'open', open: ['n', 'z'], ...terrazzo }),
    K('galerij-o', 'Galerij', [6.5, 0], [3, 10], { verdieping: 1, galerij: true, hoogte: 5, plafond: 'open', open: ['n', 'z'], ...terrazzo }),
    K('mediaplein', 'Mediaplein', [-12, 0], [8, 16], { verdieping: 1, hoogte: 5, vloer: 'rubber', vloerKleur: '#2b3550', muur: '#24304a', lambrisering: '#16203a', plafondKleur: '#1c2440', dak: 'plat', inkijk: true, lampen: [[-11.5, 0]] }),
    K('foodcourt', 'Foodcourt', [12, 0], [8, 16], { verdieping: 1, hoogte: 5, vloer: 'planken', vloerKleur: '#a8794c', muur: '#f2e6d2', lambrisering: '#7a5236', plafond: 'glas', lampen: [[12, 0]] }),
    K('galerijstraat', 'Galerijstraat', [-10, 13], [12, 10], { verdieping: 1, hoogte: 5, ...terrazzo, muur: '#ebe4f2', lambrisering: '#5b4a78', plafondKleur: '#f4f1ea', dak: 'plat' }),
    K('kantoren', 'Kantoren', [-10, -16], [12, 16], { verdieping: 1, hoogte: 5, vloer: 'tapijt', vloerKleur: '#4a4f58', muur: '#d9d6cf', lambrisering: '#6f6a62', plafondKleur: '#e9e6df', dak: 'plat' }),
    K('serre', 'Serre', [5, -16], [2, 16], { verdieping: 1, hoogte: 5, vloer: 'tegels', vloerKleur: '#d8cfc0', muur: '#efe7da', lambrisering: '#8a7d6a', plafond: 'glas', open: ['o'] }),
    K('dakterras', 'Dakterras', [11, -16], [10, 16], { verdieping: 1, buiten: true, vloer: 'vlonder', vloerKleur: '#8a6545', rand: 'balustrade', gevel: '#8b7f78' }),
  ],
  doorgangen: [
    // ── begane grond ──
    // liftportaal: glazen pui naar de klantenservice (instructie) en de foyer (samen oefenen); rolhek naar de passage
    { pos: [4, 21.6], as: 'z', soort: 'pui', breed: 4.4, deurBreed: 1.8, vanaf: 'instructie' },
    { pos: [-4, 21.6], as: 'z', soort: 'pui', breed: 4.4, deurBreed: 1.8, vanaf: 'begeleid' },
    { pos: [0, 18], as: 'x', soort: 'open', breed: 8, hoog: 4.5, vanaf: 'begeleid' },
    // marktpassage: grote boog naar de markthal, etalagepui van het modehuis
    { pos: [4, 13], as: 'z', soort: 'open', breed: 6, hoog: 5 },
    { pos: [-4, 13], as: 'z', soort: 'pui', breed: 7, deurBreed: 2.2 },
    { pos: [-13, 18], as: 'x', soort: 'boog', breed: 2 },
    // koepelplein: rolhek vanaf de passage, puien van de bouwmarkt en de drogist
    { pos: [0, 8], as: 'x', soort: 'open', breed: 8, hoog: 4.5, vanaf: 'zelfstandig' },
    { pos: [8, 0], as: 'z', soort: 'pui', breed: 10, deurBreed: 3, vanaf: 'zelfstandig' },
    { pos: [-8, 0], as: 'z', soort: 'pui', breed: 10, deurBreed: 3, vanaf: 'zelfstandig' },
    { pos: [13, -8], as: 'x', soort: 'dubbel', breed: 2.2 },
    { pos: [-13, -8], as: 'x', soort: 'boog', breed: 2.4 },
    // etalagestraat: rolhek vanaf het plein, acht etalagepuien
    { pos: [0, -8], as: 'x', soort: 'open', breed: 8, hoog: 4.5, vanaf: 'evaluatie' },
    ...[-10, -14, -18, -22].flatMap((z) => [
      // L4: alleen schuifdeuren, iets naar voren (voor het glas staat de zuil van de poort)
      z === -22
        ? { pos: [-4, -21.0] as [number, number], as: 'z' as const, soort: 'pui' as const, breed: 1.8, deurBreed: 1.6, vanaf: 'evaluatie' as const }
        : { pos: [-4, z] as [number, number], as: 'z' as const, soort: 'pui' as const, breed: 3.6, deurBreed: 1.6, vanaf: 'evaluatie' as const },
      { pos: [4, z] as [number, number], as: 'z' as const, soort: 'pui' as const, breed: 3.6, deurBreed: 1.6, vanaf: 'evaluatie' as const },
    ]),
    // glas naast de uitgang (je ziet het stationsplein)
    { pos: [-2.9, -24], as: 'x', soort: 'raam', breed: 2.1, borst: 0, hoog: 3.4 },
    { pos: [2.9, -24], as: 'x', soort: 'raam', breed: 2.1, borst: 0, hoog: 3.4 },
    // ── galerijniveau ──
    { pos: [-6, 8], as: 'x', soort: 'pui', breed: 3.6, deurBreed: 2, verdieping: 1 },
    { pos: [-8, 0], as: 'z', soort: 'pui', breed: 9, deurBreed: 2.4, verdieping: 1 },
    { pos: [8, 0], as: 'z', soort: 'open', breed: 6, verdieping: 1 },
    { pos: [12, -8], as: 'x', soort: 'pui', breed: 6, deurBreed: 2, verdieping: 1 },
    { pos: [5, -8], as: 'x', soort: 'pui', breed: 1.9, deurBreed: 1.8, verdieping: 1 },
    // ramen: galerijstraat en kantoren kijken uit op de passages, de serre is een glaswand
    { pos: [-4, 10.8], as: 'z', soort: 'raam', breed: 2.6, borst: 0.9, hoog: 3.2, verdieping: 1 },
    { pos: [-4, 15.2], as: 'z', soort: 'raam', breed: 2.6, borst: 0.9, hoog: 3.2, verdieping: 1 },
    { pos: [-4, -11], as: 'z', soort: 'raam', breed: 2.4, borst: 0.9, hoog: 3.2, verdieping: 1 },
    { pos: [-4, -16], as: 'z', soort: 'raam', breed: 2.4, borst: 0.9, hoog: 3.2, verdieping: 1 },
    { pos: [-4, -21], as: 'z', soort: 'raam', breed: 2.4, borst: 0.9, hoog: 3.2, verdieping: 1 },
    { pos: [4, -16], as: 'z', soort: 'raam', breed: 15, borst: 0, hoog: 4.4, verdieping: 1 },
  ],
  trappen: [
    // twee roltrappen kriskras in de vide; bovenaan precies op de galerijrand (z = ∓5)
    { pos: [4.1, -0.67], as: 'z', richting: -1, lengte: 8.66, breed: 1.2, van: 0, soort: 'roltrap', vanaf: 'zelfstandig' },
    { pos: [-4.1, 0.67], as: 'z', richting: 1, lengte: 8.66, breed: 1.2, van: 0, soort: 'roltrap', vanaf: 'zelfstandig' },
  ],
  uitgang: { pos: [0, -24], as: 'x' },
};

/** Start voor de liften; je kijkt naar −z (de hele as tot de uitgang). */
export const SPAWN: [number, number] = [0, 22.6];

export type Plek = { pos: [number, number]; rot?: number; schaal?: number; tafel?: [number, number]; tafelSoort?: 'hout' | 'vilt' | 'sokkel'; botser?: [number, number]; verdieping?: number };

const R = Math.PI / 2;
/** Waar elk station staat. rot 0 = voorkant naar +z (naar de liften), R = naar +x, −R = naar −x, 2R = naar −z. Botser in wereldrichting. */
export const PLEKKEN: Record<string, Plek> = {
  // Liftportaal en klantenservice
  terugblik: { pos: [-2.4, 20.1], tafel: [1.4, 0.95], botser: [1.5, 1.05] },
  uitleg: { pos: [11.0, 20.6], rot: -R, botser: [1.8, 2.9] },
  // Markthal: samen oefenen 1–5
  kassa: { pos: [6.8, 9.6], botser: [1.6, 0.8] },
  tshirt: { pos: [15.0, 13.0], rot: -R, botser: [0.7, 2.6] },
  klas: { pos: [11.0, 12.8], botser: [2.9, 2.6] },
  weegschaal: { pos: [10.6, 16.9], rot: 2 * R, tafel: [1.4, 0.8], botser: [1.5, 0.9] },
  spaarpot: { pos: [13.8, 9.6], botser: [1.1, 1.2] },
  // Modehuis en foyer: samen oefenen 6–10
  broek: { pos: [-7.2, 17.0], rot: 2 * R, botser: [1.5, 0.7] },
  jas: { pos: [-10.2, 17.0], rot: 2 * R, botser: [1.5, 0.7] },
  quiz: { pos: [-15.2, 23.1], rot: R, botser: [0.8, 1.0] },
  sneakers: { pos: [-14.8, 15.2], rot: R, botser: [0.7, 0.8] },
  bioscoop: { pos: [-8.6, 20.6], tafel: [1.7, 1.25], tafelSoort: 'vilt', botser: [1.8, 1.35] },
  // Mediaplein (boven): klus Nieuws en media
  omroepen: { pos: [-15.4, 0.0], rot: R, botser: [0.8, 2.8], verdieping: 1 },
  festival: { pos: [-11.2, -5.4], botser: [2.4, 1.3], verdieping: 1 },
  krant: { pos: [-11.2, 5.4], rot: 2 * R, botser: [2.0, 1.2], verdieping: 1 },
  // Drogist en kapsalon: klus Kapper en drogist
  kapsalon: { pos: [-13.0, -14.6], botser: [2.6, 1.1] },
  chocodrank: { pos: [-11.2, 5.4], tafel: [1.5, 0.9], botser: [1.6, 1.0] },
  styling: { pos: [-15.2, 2.6], rot: R, botser: [0.8, 1.6] },
  // Bouwmarkt en magazijn: klus Bouwmarkt en elektro
  dozen: { pos: [13.0, -12.8], botser: [2.4, 1.9] },
  'rode-deuren': { pos: [11.4, 5.4], tafel: [2.2, 1.3], tafelSoort: 'vilt', botser: [2.3, 1.4] },
  telefoon: { pos: [15.2, 2.4], rot: -R, botser: [0.8, 1.2] },
  laptop: { pos: [11.4, -5.0], tafel: [1.5, 0.9], botser: [1.6, 1.0] },
  // Foodcourt (boven, keuze)
  snoepwinkel: { pos: [15.0, 3.4], rot: -R, botser: [1.3, 2.7], verdieping: 1 },
  voetbaltafel: { pos: [11.0, -4.6], botser: [2.4, 1.2], verdieping: 1 },
  // Galerijstraat (boven, keuze)
  creme: { pos: [-10.2, 12.4], botser: [1.2, 1.0], verdieping: 1 },
  energie: { pos: [-15.2, 10.0], rot: R, botser: [1.2, 2.5], verdieping: 1 },
  reisbureau: { pos: [-15.2, 13.8], rot: R, botser: [1.2, 2.3], verdieping: 1 },
  griep: { pos: [-5.0, 13.0], rot: -R, botser: [1.2, 2.2], verdieping: 1 },
  'drie-winkels': { pos: [-10.2, 17.3], rot: 2 * R, botser: [3.0, 1.0], verdieping: 1 },
  // Dakterras (boven, buiten, keuze)
  reuzenrad: { pos: [10.4, -17.6], rot: -R, botser: [1.4, 2.4], verdieping: 1 },
  vormen: { pos: [8.0, -22.8], botser: [2.0, 0.8], verdieping: 1 },
  lucifers: { pos: [11.4, -22.7], botser: [1.7, 1.0], verdieping: 1 },
  actiekraam: { pos: [8.4, -12.0], rot: R, botser: [2.0, 3.0], verdieping: 1 },
  offerte: { pos: [15.2, -11.4], rot: -R, botser: [0.9, 1.7], verdieping: 1 },
  // Etalagestraat: blok 1 vooraan (EIN-01 t/m 06), blok 2 achteraan (EIN-07 t/m 11)
  sandalen: { pos: [-7.6, -10.0], rot: R, botser: [0.8, 1.0] },
  badslippers: { pos: [7.6, -10.0], rot: -R, botser: [0.9, 1.4] },
  kerstboom: { pos: [2.4, -12.0], botser: [2.0, 1.3] },
  waterverbruik: { pos: [7.6, -14.0], rot: -R, botser: [1.6, 1.5] },
  reizigers: { pos: [-7.6, -14.0], rot: R, botser: [1.0, 2.2] },
  toets: { pos: [-7.6, -18.0], rot: R, botser: [1.0, 1.8] },
  netwerk: { pos: [7.6, -18.0], rot: -R, botser: [0.7, 1.1] },
  pretpark: { pos: [3.0, -20.0], rot: -R, botser: [0.9, 1.6] },
  loon: { pos: [7.6, -22.0], rot: -R, tafel: [1.4, 0.8], botser: [0.9, 1.5] },
  boek: { pos: [-7.6, -22.0], rot: R, botser: [1.0, 1.8] },
};

/** Kluizen: [x, z, verdieping]. */
export const KLUIS_PLEK: Record<string, [number, number, number]> = {
  media: [-14.8, -5.4, 1],
  verzorging: [-15.0, -1.4, 0],
  elektro: [15.0, -1.4, 0],
};

/** Verstopte lampjes [x, z, verdieping]. */
export const LAMPJES_HUIS: [number, number, number][] = [
  [7.6, 5.4, 0],
  [-15.3, 9.0, 0],
  [15.5, 15.3, 0],
  [-15.3, 18.7, 0],
  [15.4, -9.0, 0],
  [-15.4, -9.0, 0],
  [-15.3, 17.3, 1],
  [15.3, -7.2, 1],
  [15.2, -22.4, 1],
];

/** Het grote reuzenrad op het dakterras (wiel langs z; draait na het goede antwoord bij het loket). y = vloer van het dakterras. */
export const RAD = { pos: [13.4, -17.6] as [number, number], straal: 4.4, hoogte: 5.5, y: HV };
/** De draaimolen op het stationsplein, net naast de uitgang (je ziet hem door het glas). */
export const DRAAIMOLEN: [number, number] = [5.6, -30.5];
