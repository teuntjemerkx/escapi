// Wereld 3 als gebouw: "De Markthal aan de Waag" (ontwerp: docs/ontwerp/wereld3.md).
// Eén ijzeren hal van 26 × 30 m: een hoge middenbeuk (kramenstraat) met een glazen gewelf, twee lagere zijbeuken
// met daarboven een U-vormige galerij (vloer op 4 m), achterin De Waag onder een koepel met de poort naar de brug.
// Buiten: het marktplein met het kookschool-paviljoen (voor) en de laadkade aan de oostgracht.
// Coördinaten: x van west (−) naar oost (+), z van achter/gracht (−) naar voor/plein (+).
import type { Plattegrond } from '../werelden/types';

const K = (id: string, naam: string, pos: [number, number], maat: [number, number], extra: Partial<Plattegrond['kamers'][number]> = {}) => ({ id, naam, pos, maat, ...extra });

/** Baksteen van de Markthal (buitenkant). */
export const GEVEL = '#9a5a42';
/** Gietijzer: diepgroen met oker-gouden accenten. */
export const IJZER = '#2f5d4e';
export const GOUD = '#c9a24a';
/** Hoogte van de middenbeuk (tot waar het gewelf begint) en van één verdieping. */
export const HAL_H = 8;
export const HV = 4;

export const PLAN: Plattegrond = {
  muurHoogte: 3.7,
  verdiepingHoogte: HV,
  gevel: GEVEL,
  kamers: [
    // ── buiten ──
    K('plein', 'Marktplein', [3.5, 16], [19, 8], { vloer: 'kinderkopjes', vloerKleur: '#b7a48c', buiten: true, rand: 'geen', gevel: GEVEL }),
    K('pleinW', 'Marktplein', [-9.5, 18.5], [7, 3], { vloer: 'kinderkopjes', vloerKleur: '#b7a48c', buiten: true, rand: 'geen', gevel: GEVEL }),
    K('kade', 'Laadkade', [17, -7], [8, 22], { vloer: 'kinderkopjes', vloerKleur: '#8e8a84', buiten: true, rand: 'geen', gevel: GEVEL }),
    // ── kookschool: glazen paviljoen aan het plein ──
    K('kookschool', 'Kookschool', [-9.5, 14.5], [7, 5], { vloer: 'tegels', vloerKleur: '#e9e2d6', muur: '#f3e6cf', lambrisering: '#3f6b4c', dak: 'plat', lampen: [[-9.8, 14.5]] }),
    // ── begane grond van de hal ──
    K('kramenstraat', 'Kramenstraat', [0, 3], [12, 18], {
      hoogte: HAL_H,
      vide: true,
      open: ['w', 'o'],
      inkijk: true,
      plafond: 'glasgewelf',
      vloer: 'terrazzo',
      vloerKleur: '#ddd3c2',
      muur: '#efe4cf',
      lambrisering: '#2f5d4e',
      kolommen: { afstand: [12, 4], rand: [0, 3], dikte: 0.34, rond: true, kleur: IJZER },
      lampen: [
        [0, 6.4],
        [0, 1.6],
        [0, -3.4],
        [0, 10.2],
      ],
    }),
    K('kaashoek', 'Kaashoek', [-9.5, 3], [7, 18], { vloer: 'planken', vloerKleur: '#b98a55', muur: '#f2dfae', lambrisering: '#7a5a2a', plafondKleur: '#efe6d2', lampen: [[-9.0, 2.0], [-9.0, -3.0], [-9.4, 8.6]] }),
    K('bakkerij', 'Bakkerij en koffie', [9.5, 3], [7, 18], { vloer: 'tegels', vloerKleur: '#efe6d6', muur: '#f3e2c2', lambrisering: '#8a5a36', plafondKleur: '#f1e8d6', lampen: [[9.2, 1.6], [9.4, 8.6], [9.0, -2.6]] }),
    K('pakhuis', 'Kaaspakhuis', [-9.5, -12], [7, 12], { vloer: 'planken', vloerKleur: '#9a6f45', muur: '#e3cfa2', lambrisering: '#5a4024', lampen: [[-9.5, -15.4], [-9.5, -10.0]] }),
    K('waag', 'De Waag', [0, -12], [12, 12], {
      hoogte: HAL_H,
      vide: true,
      plafond: 'koepel',
      plafondKleur: '#efe2c4',
      vloer: 'steen',
      vloerKleur: '#b3aa9c',
      muur: '#ead9b8',
      lambrisering: '#6a4a30',
      lampen: [
        [0, -9.0],
        [0, -14.6],
      ],
    }),
    K('vishal', 'Vishal en koelcel', [9.5, -12], [7, 12], { vloer: 'tegels', vloerKleur: '#9cc4c0', muur: '#e3f0ee', lambrisering: '#3d7a86', plafondKleur: '#eef4f4' }),
    // ── galerij (verdieping 1, vloer op 4 m) ──
    K('galerijW', 'Open keuken', [-9.5, -3], [7, 30], {
      verdieping: 1,
      hoogte: 4,
      galerij: true,
      plafond: 'glas',
      vloer: 'planken',
      vloerKleur: '#a77a4b',
      muur: '#f0e2c8',
      lambrisering: '#2f6c70',
      lampen: [
        [-9.6, 2.0],
        [-9.6, -4.8],
        [-8.8, -14.6],
      ],
    }),
    K('galerijZ', 'Uitkijk', [0, 10], [12, 4], { verdieping: 1, hoogte: 4, galerij: true, open: ['w', 'o'], vloer: 'planken', vloerKleur: '#a77a4b', muur: '#f0e2c8', lambrisering: '#5a4030', plafondKleur: '#efe6d2' }),
    K('galerijO', 'Kaarten, verf en ijzer', [9.5, -3], [7, 30], {
      verdieping: 1,
      hoogte: 4,
      galerij: true,
      plafond: 'glas',
      vloer: 'planken',
      vloerKleur: '#a77a4b',
      muur: '#dfe6f2',
      lambrisering: '#3d5f8a',
      lampen: [
        [9.6, 2.0],
        [9.6, -7.4],
        [8.8, -14.6],
      ],
    }),
  ],
  doorgangen: [
    // kookschool: glazen pui met schuifdeur aan het plein (Uitleg)
    { pos: [-6, 14.5], as: 'z', soort: 'pui', breed: 5, deurBreed: 1.8, vanaf: 'instructie' },
    { pos: [-9.5, 17], as: 'x', soort: 'raam', breed: 4, borst: 0.9, hoog: 2.6 },
    // hoofdingang: etalagepui over de hele middenbeuk (Samen)
    { pos: [0, 12], as: 'x', soort: 'pui', breed: 12, deurBreed: 3, vanaf: 'begeleid' },
    // rolhekken van de zijbeuken bij het kruispad (Zelf)
    { pos: [-6, -5], as: 'z', soort: 'open', breed: 2, hoog: 3, vanaf: 'zelfstandig' },
    { pos: [6, -5], as: 'z', soort: 'open', breed: 2, hoog: 3, vanaf: 'zelfstandig' },
    // klokpoort naar De Waag (Check)
    { pos: [0, -6], as: 'x', soort: 'open', breed: 8, hoog: 3, vanaf: 'evaluatie' },
    // pakhuis en vishal
    { pos: [-9.5, -6], as: 'x', soort: 'deur', breed: 1.8 },
    { pos: [9.5, -6], as: 'x', soort: 'boog', breed: 2 },
    { pos: [13, -12], as: 'z', soort: 'roldeur', breed: 3 },
    // ramen: bakkerij aan het plein, hoge ramen in de zijbeuken, pakhuis en vishal
    { pos: [9.5, 12], as: 'x', soort: 'raam', breed: 3, borst: 1.0, hoog: 3.0 },
    { pos: [-13, -12], as: 'z', soort: 'raam', breed: 2.4, borst: 2.4, hoog: 3.3 },
    { pos: [13, -16], as: 'z', soort: 'raam', breed: 1.6, borst: 2.4, hoog: 3.3 },
    { pos: [13, -8], as: 'z', soort: 'raam', breed: 1.6, borst: 2.4, hoog: 3.3 },
    // galerij: bovenlichten boven de kramen en grote ramen in de voorgevel
    ...[-15, -11, -7, -3, 1, 5].flatMap((z) => [
      { pos: [-13, z] as [number, number], as: 'z' as const, soort: 'raam' as const, breed: 1.8, borst: 2.75, hoog: 3.7, verdieping: 1 },
      { pos: [13, z] as [number, number], as: 'z' as const, soort: 'raam' as const, breed: 1.8, borst: 2.75, hoog: 3.7, verdieping: 1 },
    ]),
    { pos: [0, 12], as: 'x', soort: 'raam', breed: 3.2, borst: 0.9, hoog: 3.5, verdieping: 1 },
    { pos: [-9.5, 12], as: 'x', soort: 'raam', breed: 2.2, borst: 1.0, hoog: 3.4, verdieping: 1 },
    { pos: [9.5, 12], as: 'x', soort: 'raam', breed: 2.2, borst: 1.0, hoog: 3.4, verdieping: 1 },
    { pos: [-9.5, -18], as: 'x', soort: 'raam', breed: 2.2, borst: 1.0, hoog: 3.4, verdieping: 1 },
    { pos: [9.5, -18], as: 'x', soort: 'raam', breed: 2.2, borst: 1.0, hoog: 3.4, verdieping: 1 },
  ],
  trappen: [
    // langs de kolommen in de zijbeuken: onderaan bij z 2,8, boven uit op de galerij bij z 10
    { pos: [-7.2, 6.4], as: 'z', richting: 1, lengte: 7.2, breed: 1.8, van: 0 },
    { pos: [7.2, 6.4], as: 'z', richting: 1, lengte: 7.2, breed: 1.8, van: 0 },
  ],
  // De uitgang komt uit op de brug over de gracht.
  uitgang: { pos: [0, -18], as: 'x' },
};

export const SPAWN: [number, number] = [2.5, 18.2];

/** Waterkanten (m): de gracht achter, de oostgracht en het haventje tussen plein en laadkade. */
export const WATER = {
  achter: -18.4, // noordkant van de achterste gracht (kade aan de Markthal)
  overkant: -27.6, // zuidkant van de overkant
  oost: 21.4, // westkant van de oostgracht
  oostOver: 29, // overkant oost
  haven: { x1: 13.4, x2: 21.4, z1: 4.4, z2: 11.6 },
} as const;

export type Plek = { pos: [number, number]; rot?: number; verdieping?: number; schaal?: number; tafel?: [number, number]; tafelSoort?: 'hout' | 'vilt' | 'sokkel'; botser?: [number, number] };

const O = Math.PI / 2; // kijkt naar oost (+x)
const W = -Math.PI / 2; // kijkt naar west (−x)
const N = Math.PI; // kijkt naar achter (−z)

/** Waar elk station staat (zie de tabel in docs/ontwerp/wereld3.md, onderdeel f). */
export const PLEKKEN: Record<string, Plek> = {
  // Terugblik en uitleg
  eierdozen: { pos: [6.2, 15.4] },
  kookschool: { pos: [-10.9, 14.5], rot: O },
  // Samen oefenen: kramenstraat, rondje in werkboekvolgorde (links naar achter, rechts terug, dan de entree)
  snoepkraam: { pos: [-4.3, 7.3], rot: O },
  zuivelkraam: { pos: [-4.3, 4.2], rot: O },
  rondleiding: { pos: [-4.3, 1.1], rot: O },
  plattegrond: { pos: [-4.3, -2.0], rot: O },
  limonadekraam: { pos: [4.3, -2.0], rot: W },
  stoffenkraam: { pos: [4.3, 1.1], rot: W },
  klassenfoto: { pos: [4.3, 4.2], rot: W },
  fotokraam: { pos: [4.3, 7.3], rot: W },
  appelkist: { pos: [3.9, 10.35], rot: W },
  planbord: { pos: [-3.8, 10.4], rot: O },
  // Klus "Kaas en fruit": kaashoek (beneden west) + de kaasbalans in het pakhuis
  drogisterij: { pos: [-11.3, 8.6], rot: O },
  kaaskraam: { pos: [-11.3, 2.0], rot: O },
  fruitkraam: { pos: [-11.3, -1.6], rot: O },
  balans: { pos: [-11.3, -10.0], rot: O },
  // Klus "Open keuken": galerij west (verdieping 1) + de soepkeuken
  tomatensoep: { pos: [-11.3, 7.4], rot: O, verdieping: 1 },
  guacamole: { pos: [-11.3, 2.0], rot: O, verdieping: 1 },
  spaarpot: { pos: [-11.3, -1.4], rot: O, verdieping: 1 },
  receptenboek: { pos: [-11.3, -4.8], rot: O, verdieping: 1 },
  showroom: { pos: [-11.3, -8.4], rot: O, verdieping: 1 },
  // Bakkerij en koffie (beneden oost)
  koffiehoek: { pos: [11.3, 8.6], rot: W },
  koekjesbord: { pos: [11.45, 4.9], rot: W },
  pitabrood: { pos: [11.3, 1.6], rot: W },
  boodschappen: { pos: [11.6, -1.4], rot: W },
  // Galerij oost: kaarten, kranten, verf en ijzer (verdieping 1)
  kiosk: { pos: [11.3, 7.4], rot: W, verdieping: 1 },
  scorebord: { pos: [12.4, 2.4], rot: W, verdieping: 1 },
  lijnenbord: { pos: [12.5, -0.8], rot: W, verdieping: 1 },
  schroeven: { pos: [11.3, -4.0], rot: W, verdieping: 1 },
  verfwinkel: { pos: [11.3, -7.4], rot: W, verdieping: 1 },
  tshirt: { pos: [12.3, -10.6], rot: W, verdieping: 1 },
  // Galerij zuid: uitkijk en kunst (verdieping 1)
  towerbridge: { pos: [-3.6, 10.6], rot: N, verdieping: 1 },
  selfie: { pos: [3.6, 10.8], rot: N, verdieping: 1 },
  // Klus "Laadkade" (buiten, aan de oostgracht) + de scooterstalling
  tankpomp: { pos: [17.8, -2.4], rot: W },
  arnhem: { pos: [17.6, -8.0], rot: W },
  schatkaart: { pos: [17.2, -15.6], rot: W },
  scooter: { pos: [17.0, 2.6], rot: N },
  // Eindcheck in De Waag: blok 1 langs de linkerwand, blok 2 langs de rechterwand; het middenpad naar de poort blijft vrij
  koffiepak: { pos: [-5.0, -7.4], rot: O },
  bestek: { pos: [-5.0, -9.9], rot: O },
  racebaan: { pos: [-5.0, -12.4], rot: O },
  empire: { pos: [-5.0, -14.9], rot: O },
  simonly: { pos: [-2.95, -17.0] },
  appelkraam: { pos: [5.0, -7.4], rot: W },
  folders: { pos: [5.0, -9.9], rot: W },
  sneeuwbol: { pos: [5.0, -12.4], rot: W },
  betonmolen: { pos: [5.0, -14.9], rot: W },
  bloemenkraam: { pos: [2.95, -17.0] },
};

/** Kluizen: K1 tussen de kaasrekken, K2 aan de balustrade van de open keuken (galerij), K3 aan het water. */
export const KLUIS_PLEK: Record<string, { pos: [number, number]; rot: number; verdieping?: number }> = {
  kramen: { pos: [-9.5, -16.6], rot: 0 },
  keuken: { pos: [-7.0, -3.4], rot: W, verdieping: 1 },
  kade: { pos: [19.8, -12.0], rot: W },
};

/** Verstopte lampjes [x, z] of [x, z, verdieping]: achter rekken, onder tafels, in hoekjes. */
export const LAMPJES_HUIS: ([number, number] | [number, number, number])[] = [
  [-12.4, 18.9],
  [-12.4, 5.6],
  [-12.5, -11.95],
  [12.4, -17.3],
  [20.5, -9.8],
  [8.4, 13.0],
  [-7.4, -17.2, 1],
  [12.4, 10.8, 1],
  [-1.6, 11.55, 1],
];
