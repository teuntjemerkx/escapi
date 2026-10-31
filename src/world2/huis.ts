// Wereld 2 als kasteel: "Slot Maansteyn" (ontwerp: docs/ontwerp/wereld2.md). Een vierkante burcht (zoals Muiderslot,
// Ammersoyen en Bodiam) op een rotseiland in een donker bosmeer (zoals Chillon en Trakai), met een donjon (Gravensteen,
// Vincennes), een open binnenplaats met Franks tuin, een stenen brug met ophaalbrug en een achterpoort aan het meer.
// x = oost, z = zuid (de kant van het bospad). Eén verdieping is 3,5 m; de kelder ligt op −3,5 m in de rots.
import type { Kamer, Plattegrond } from '../werelden/types';

const K = (id: string, naam: string, pos: [number, number], maat: [number, number], extra: Partial<Kamer> = {}): Kamer => ({ id, naam, pos, maat, ...extra });

/** Kleuren van het slot. */
export const STEEN = '#6e665c';
export const LEI = '#3d4250';
/** Weinig verschillende kleuren: dan kan de motor meer samenvoegen (minder tekenstappen). */
const MUUR_LICHT = '#9a948c';
const MUUR = '#7f7a75';
const MUUR_DONKER = '#5c5862';
const VLOER = '#6f6a64';
const VLOER_DONKER = '#4a4650';
const PLANKEN = '#5e4532';

/** Hoogte van de grote zalen (ridderzaal, kapel): twee verdiepingen hoog. */
export const ZAAL_H = 6.7;

/** Ronde hoektorens (decor op de rots): midden, straal. A en B aan de voorkant, C achter in de steigers. */
export const TORENS: Record<'A' | 'B' | 'C', { pos: [number, number]; r: number }> = {
  A: { pos: [-17.9, 15.9], r: 2.7 },
  B: { pos: [17.9, 15.9], r: 2.7 },
  C: { pos: [17.9, -15.9], r: 2.7 },
};
/** Waterput op de binnenplaats; de cisterne ligt eronder. */
export const PUT: [number, number] = [5.5, -4.0];
/** Hoogte van het meer. */
export const MEER_Y = -4;
/** De steiger ligt net boven het water. */
export const STEIGER_Y = -3.6;

export const PLAN: Plattegrond = {
  muurHoogte: 3.2,
  verdiepingHoogte: 3.5,
  gevel: STEEN,
  gevelSoort: 'steen',
  kantelen: true,
  daken: { kleur: LEI, helling: 1.05 },
  // warme lantaarns aan het water schijnen zacht tegen de rots en de muren
  aanlicht: { kleur: '#ffc890', hoogte: 14, sterkte: 0.4, voet: -4 },
  kamers: [
    // ── Aanloop: het bospad en de brug over het meer ──
    K('bospad', 'Bospad', [0, 34], [6, 14], { buiten: true, rand: 'geen', zonderVloer: true }),
    K('brug', 'Brug', [0, 22], [4, 10], { buiten: true, rand: 'geen', vloer: 'kinderkopjes', vloerKleur: '#6d655c' }),
    // ── Begane grond: zuidvleugel ──
    K('poortzaal', 'Poortzaal', [0, 12.5], [6, 9], { vloer: 'kinderkopjes', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR_LICHT, plafond: 'gewelf', lampen: [[0, 12.5]] }),
    K('uitleg', 'Uitlegkamer', [-5.5, 11], [5, 6], { vloer: 'planken', vloerKleur: PLANKEN, muur: '#5a466f', lambrisering: '#3a2a1e', lampen: [[-5.5, 11.4]] }),
    K('stallen', 'Stallen', [5.5, 11], [5, 6], { vloer: 'steen', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR, plafond: 'spanten' }),
    K('smidse', 'Smidse', [-12, 11], [8, 6], { vloer: 'steen', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR, plafond: 'spanten', lampen: [[-14.6, 12.6]] }),
    K('torenhal', 'Torenhal B', [12, 11], [8, 6], { vloer: 'steen', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR, donker: true }),
    // ── Binnenplaats en vleugels ──
    K('binnenplaats', 'Binnenplaats', [0, 1], [16, 14], { vloer: 'gras', vloerKleur: '#41653a', buiten: true }),
    K('wapenzaal', 'Wapenzaal', [-10.25, 1], [4.5, 14], { vloer: 'steen', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR, plafond: 'gewelf', lampen: [[-10.25, 4.6]] }),
    K('ertsgang', 'Ertsgang', [-14.25, 1], [3.5, 14], { vloer: 'steen', vloerKleur: VLOER_DONKER, muurSoort: 'steen', muur: MUUR_DONKER, plafond: 'gewelf', donker: true }),
    K('bouwmeester', 'Bouwmeester', [10.5, 4], [5, 8], { vloer: 'planken', vloerKleur: PLANKEN, muur: '#5a466f', lambrisering: '#3a2a1e', lampen: [[10.5, 4.2]] }),
    K('kapel', 'Kapel', [10.5, -3], [5, 6], { hoogte: ZAAL_H, plafond: 'gewelf', vloer: 'tegels', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR_LICHT, dakNok: 'z' }),
    K('spookgang', 'Spookgang', [14.5, 1], [3, 14], { vloer: 'steen', vloerKleur: VLOER_DONKER, muurSoort: 'steen', muur: MUUR_DONKER, plafond: 'gewelf', donker: true, dak: 'zadel', dakNok: 'z' }),
    K('schatkamer', 'Schatkamer', [-12.5, -10.5], [9, 9], { vloer: 'steen', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR }),
    K('ridderzaal', 'Ridderzaal', [0, -10], [16, 8], { hoogte: ZAAL_H, plafond: 'spanten', vloer: 'steen', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR_LICHT, dak: 'zadel', dakNok: 'x', lampen: [[-4.5, -10.5], [4, -10.5], [-0.3, -9.3], [0.6, -12.6]] }),
    K('keuken', 'Heksenkeuken', [12, -10], [8, 8], { vloer: 'tegels', vloerKleur: VLOER, muurSoort: 'steen', muur: MUUR, plafond: 'spanten', lampen: [[12.5, -10.5]] }),
    // ── Terrassen op de rots ──
    K('kerkhof', 'Kerkhof', [19, 0], [6, 22], { vloer: 'gras', vloerKleur: '#3d5634', buiten: true, rand: 'muurtje' }),
    K('bouwplaats', 'Bouwplaats', [2.5, -17.5], [21, 7], { vloer: 'zand', vloerKleur: '#8f7f62', buiten: true, rand: 'muurtje' }),
    // achter de achterpoort: de rotstrap omlaag naar de steiger met de boot
    K('rotstrap', 'Rotstrap', [11, -24], [3.4, 6], { buiten: true, rand: 'geen', zonderVloer: true }),
    K('steiger', 'Steiger', [11, -29], [8, 4], { buiten: true, rand: 'geen', zonderVloer: true }),
    // ── Eerste verdieping ──
    K('torenkamerB', 'Torenkamer B', [12, 11], [8, 6], { verdieping: 1, vloer: 'planken', vloerKleur: PLANKEN, muur: '#4b3a5e', lambrisering: '#2a1f33', lampen: [[11, 10.6]] }),
    K('walgangO', 'Walgang', [5.5, 11], [5, 6], { verdieping: 1, vloer: 'steen', vloerKleur: VLOER, buiten: true, rand: 'muurtje' }),
    K('bodekamer', 'Bodekamer', [0, 12.5], [6, 9], { verdieping: 1, vloer: 'planken', vloerKleur: PLANKEN, muur: '#5a466f', lambrisering: '#3a2a1e', lampen: [[0, 12.8]] }),
    K('walgangW', 'Walgang', [-5.5, 11], [5, 6], { verdieping: 1, vloer: 'steen', vloerKleur: VLOER, buiten: true, rand: 'muurtje' }),
    K('bibliotheek', 'Bibliotheek', [-12, 11], [8, 6], { verdieping: 1, vloer: 'visgraat', vloerKleur: '#7a5030', muur: '#6b2a2e', lambrisering: '#3a1a14', dakDeel: 'west', lampen: [[-12, 11.2]] }),
    K('galerij', 'Galerij', [-12, 1], [8, 14], { verdieping: 1, vloer: 'planken', vloerKleur: PLANKEN, muur: '#3b2a3e', lambrisering: '#22161e', donker: true, dakDeel: 'west' }),
    K('balkon', 'Weergang', [-6.75, 1], [2.5, 14], { verdieping: 1, vloer: 'steen', vloerKleur: VLOER, buiten: true, rand: 'muurtje' }),
    K('wachtkamer', 'Wachtkamer', [-12.5, -10.5], [9, 9], { verdieping: 1, vloer: 'planken', vloerKleur: PLANKEN, muurSoort: 'steen', muur: MUUR, lampen: [[-12, -8.6]] }),
    // ── De donjon hoger op ──
    K('torenkamerD', 'Torenkamer D', [-12.5, -10.5], [9, 9], { verdieping: 2, vloer: 'planken', vloerKleur: PLANKEN, muur: '#4b3a5e', lambrisering: '#2a1f33', lampen: [[-12.5, -8.6]] }),
    K('wachtpost', 'Wachtpost', [-12.5, -10.5], [9, 9], { verdieping: 3, vloer: 'planken', vloerKleur: PLANKEN, muurSoort: 'steen', muur: MUUR, donker: true }),
    K('uitkijk', 'Uitkijk', [-12.5, -10.5], [9, 9], { verdieping: 4, vloer: 'steen', vloerKleur: VLOER, buiten: true, rand: 'muurtje' }),
    // ── Kelder in de rots ──
    K('cisterne', 'Cisterne', [0, -2.5], [16, 7], { verdieping: -1, vloer: 'steen', vloerKleur: VLOER_DONKER, muurSoort: 'steen', muur: MUUR_DONKER, plafond: 'gewelf', donker: true }),
    K('crypte', 'Crypte', [10.5, -3], [5, 6], { verdieping: -1, vloer: 'steen', vloerKleur: VLOER_DONKER, muurSoort: 'steen', muur: MUUR_DONKER, plafond: 'gewelf', donker: true }),
    K('voorraadkelder', 'Voorraadkelder', [0, -10], [16, 8], {
      verdieping: -1,
      vloer: 'steen',
      vloerKleur: VLOER_DONKER,
      muurSoort: 'steen',
      muur: MUUR_DONKER,
      plafond: 'gewelf',
      donker: true,
      kolommen: { afstand: [4, 8], rand: [2, 4], dikte: 0.5, rond: true, kleur: '#7a736a' },
    }),
    K('kerker', 'Kerker', [-12, -2.5], [8, 7], { verdieping: -1, vloer: 'steen', vloerKleur: VLOER_DONKER, muurSoort: 'steen', muur: MUUR_DONKER, plafond: 'gewelf', donker: true }),
    K('harnaskelder', 'Harnaskelder', [-12.5, -10.5], [9, 9], { verdieping: -1, vloer: 'steen', vloerKleur: VLOER_DONKER, muurSoort: 'steen', muur: MUUR_DONKER, plafond: 'gewelf', donker: true }),
  ],
  doorgangen: [
    // ── begane grond ──
    // de poort: buitenste valhek (open), binnenste valhek naar de binnenplaats (Samen oefenen)
    { pos: [0, 17], as: 'x', soort: 'valhek', breed: 3 },
    { pos: [-3, 11], as: 'z', vanaf: 'instructie' },
    { pos: [0, 8], as: 'x', soort: 'valhek', breed: 3, vanaf: 'begeleid' },
    // Samen oefenen: ridderzaal, keuken, de spookgang en toren B
    { pos: [0, -6], as: 'x', soort: 'dubbel', vanaf: 'begeleid' },
    { pos: [8, -10], as: 'z', vanaf: 'begeleid' },
    { pos: [14.5, -6], as: 'x', vanaf: 'begeleid' },
    { pos: [15.2, 8], as: 'x', soort: 'boog', breed: 1.4, vanaf: 'begeleid' },
    { pos: [-8, -10.5], as: 'z', vanaf: 'begeleid' },
    // Zelf doen: de westvleugel (klus spoor)
    { pos: [-14.25, -6], as: 'x', vanaf: 'zelfstandig' },
    { pos: [-10.25, -6], as: 'x', vanaf: 'zelfstandig' },
    { pos: [-8, 3], as: 'z', vanaf: 'zelfstandig' },
    { pos: [-12.5, -1], as: 'z', soort: 'boog', breed: 1.4 },
    { pos: [-12.5, 5], as: 'z', soort: 'boog', breed: 1.4 },
    { pos: [-14.25, 8], as: 'x', soort: 'boog', breed: 1.6 },
    { pos: [-10.25, 8], as: 'x', soort: 'boog' },
    { pos: [-8, 11], as: 'z', vanaf: 'zelfstandig' },
    // stallen, bouwmeester (klus bouw), kerkhof en bouwplaats
    { pos: [3, 11], as: 'z', vanaf: 'zelfstandig' },
    { pos: [8, 11], as: 'z', vanaf: 'zelfstandig' },
    { pos: [8, 4], as: 'z', vanaf: 'zelfstandig' },
    { pos: [13, 6.6], as: 'z', vanaf: 'zelfstandig' },
    { pos: [16, 0], as: 'z', vanaf: 'zelfstandig' },
    { pos: [10, -14], as: 'x', vanaf: 'zelfstandig' },
    // Eindcheck: de kapel (met de trap naar de crypte)
    { pos: [8, -3], as: 'z', soort: 'dubbel', vanaf: 'evaluatie' },
    // ── eerste verdieping: de rondgang ──
    { pos: [8, 10], as: 'z', soort: 'boog', verdieping: 1 },
    { pos: [3, 11], as: 'z', soort: 'boog', verdieping: 1 },
    { pos: [-3, 11], as: 'z', soort: 'boog', verdieping: 1 },
    { pos: [-8, 11], as: 'z', soort: 'boog', verdieping: 1 },
    { pos: [-13.2, 8], as: 'x', soort: 'boog', breed: 1.6, verdieping: 1 },
    { pos: [-8, -2], as: 'z', soort: 'boog', verdieping: 1 },
    { pos: [-8, 4.5], as: 'z', soort: 'boog', verdieping: 1 },
    { pos: [-12, -6], as: 'x', soort: 'boog', verdieping: 1 },
    // ramen in de galerij met uitzicht op de binnenplaats
    { pos: [-8, 1.2], as: 'z', soort: 'raam', breed: 1.2, borst: 0.9, hoog: 2.5, verdieping: 1 },
    { pos: [-8, -4.4], as: 'z', soort: 'raam', breed: 1.2, borst: 0.9, hoog: 2.5, verdieping: 1 },
    { pos: [-8, 6.6], as: 'z', soort: 'raam', breed: 1.0, borst: 0.9, hoog: 2.5, verdieping: 1 },
    // ── kelder (Eindcheck) ──
    { pos: [8, -2.5], as: 'z', soort: 'valhek', breed: 2.6, verdieping: -1, vanaf: 'evaluatie' },
    { pos: [-8, -2.5], as: 'z', verdieping: -1, vanaf: 'evaluatie' },
    { pos: [3, -6], as: 'x', verdieping: -1, vanaf: 'evaluatie' },
    { pos: [-8, -10], as: 'z', verdieping: -1, vanaf: 'evaluatie' },
  ],
  trappen: [
    // toren B: van de torenhal naar torenkamer B (Samen oefenen)
    { pos: [12.0, 12.9], as: 'x', richting: 1, lengte: 5.2, breed: 1.4, van: 0, vanaf: 'begeleid' },
    // de donjon: heen en weer langs de noordmuur, van de schatkamer tot het dak
    { pos: [-13, -14.1], as: 'x', richting: 1, lengte: 5, breed: 1.4, van: 0, vanaf: 'begeleid' },
    { pos: [-13, -12.5], as: 'x', richting: -1, lengte: 5, breed: 1.4, van: 1, vanaf: 'zelfstandig' },
    { pos: [-13, -14.1], as: 'x', richting: 1, lengte: 5, breed: 1.4, van: 2 },
    { pos: [-13, -12.5], as: 'x', richting: -1, lengte: 5, breed: 1.4, van: 3 },
    // de puttrap: van de binnenplaats omlaag naar de cisterne (Zelf doen)
    { pos: [-4.5, -5.2], as: 'x', richting: 1, lengte: 5, breed: 1.5, van: -1, vanaf: 'zelfstandig' },
    // de steile trap van de kapel omlaag naar de crypte (Eindcheck)
    { pos: [12.2, -3], as: 'z', richting: -1, lengte: 4, breed: 1.4, van: -1, vanaf: 'evaluatie' },
  ],
  // de achterpoort met de drie sleutelgaten, boven aan de rotstrap
  uitgang: { pos: [11, -21], as: 'x' },
};

/** Je begint in het donkere bos, op het bospad. */
export const SPAWN: [number, number] = [0, 38.5];

type Plek = { pos: [number, number]; rot?: number; schaal?: number; tafel?: [number, number]; tafelSoort?: 'hout' | 'vilt' | 'sokkel'; botser?: [number, number]; verdieping?: number };
const M = (pos: [number, number], schaal: number, tafel: [number, number], rot = 0): Plek => ({ pos, schaal, tafel, tafelSoort: 'vilt', rot });

/**
 * Waar elk station staat (zie de tabel in docs/ontwerp/wereld2.md). Maquettes (schaal < 1) staan op een tafel met groen vilt.
 * Plekken die in een opdrachttekst staan, kloppen: de kist in de ridderzaal, de wegwijzer in de gang, de schatkist in de
 * schatkamer, het aquarium in de kerker, de aardappelen in de kelder, de bloembak op de walgang.
 */
export const PLEKKEN: Record<string, Plek> = {
  // ── Terugblik en uitleg ──
  terugblik: { pos: [-1.95, 14.8], tafel: [2.0, 1.5], rot: Math.PI / 2 },
  instructie: { pos: [-5.5, 11.6], tafel: [3.0, 2.0], tafelSoort: 'vilt' },
  // ── Samen oefenen: een rondgang door het slot, in de volgorde van het werkboek ──
  kaarttafel: { pos: [-4.5, -9.0] },
  moestuin: M([4.0, -9.2], 0.3, [2.7, 2.1]),
  verhuisdoos: { pos: [0.6, -12.4], tafel: [1.6, 1.3], tafelSoort: 'sokkel' },
  wegwijzer: { pos: [15.4, 4.4], rot: -Math.PI / 2, schaal: 0.75 },
  laminaat: { ...M([12.6, 9.3], 0.36, [2.7, 2.0]), verdieping: 1 },
  fiets: { pos: [0, 10.0], verdieping: 1 },
  blikje: { pos: [-14.6, 11.6], schaal: 0.7, verdieping: 1 },
  tuinzwembad: { ...M([-10.9, 11.6], 0.26, [2.7, 1.9]), verdieping: 1 },
  plattegrond: { pos: [-15.6, 4.5], rot: Math.PI / 2, verdieping: 1 },
  abri: { pos: [-15.5, -1.5], rot: Math.PI / 2, verdieping: 1, botser: [1.9, 0.6] },
  bloemperken: { ...M([-11.4, 1.6], 0.16, [2.9, 2.1]), verdieping: 1 },
  speeltuin: { ...M([-13.0, -9.2], 0.17, [2.9, 2.2]), verdieping: 1 },
  // ── Zelf doen ──
  // klus spoor (de westvleugel): wapenzaal, ertsgang, smidse
  dobbelsteen: { pos: [-10.25, 1.8] },
  goederenwagon: { pos: [-15.0, 1.6], schaal: 0.3, tafel: [1.5, 3.9], tafelSoort: 'hout' },
  'uitslag-balk': { pos: [-10.4, 12.9], rot: Math.PI },
  // klus water: Franks tuin en de waterkubus op de binnenplaats, de waterkelder in de cisterne eronder
  'tuin-frank': { pos: [0, 1.5], schaal: 1, botser: [6.8, 6.8] },
  waterkubus: { pos: [5.6, 5.8] },
  zwembad: { pos: [5.0, -0.5], schaal: 0.1, tafel: [3.1, 2.0], tafelSoort: 'sokkel', verdieping: -1 },
  // klus bouw: de tekentafels van de bouwmeester
  terras: M([10.5, 2.4], 0.25, [2.8, 2.2]),
  'huis-lucas': M([10.5, 6.2], 0.28, [2.8, 2.6]),
  // keuze: hoog in de donjon, op de walgangen, in de stallen, de keuken en de schatkamer
  ramenhuis: M([1.9, 14.3], 0.16, [3.3, 1.6], -Math.PI / 2),
  verfmuur: { pos: [15.65, 10.0], rot: -Math.PI / 2, schaal: 0.55, verdieping: 1 },
  stoepbord: { pos: [9.2, -7.2], rot: Math.PI },
  bloembak: { pos: [-5.5, 13.2], tafel: [1.2, 1.0], tafelSoort: 'sokkel', verdieping: 1 },
  'grote-doos': { pos: [-12.5, -9.0], tafel: [1.5, 1.1], tafelSoort: 'sokkel' },
  studentenkamer: { ...M([-12.5, -8.6], 0.42, [2.6, 2.5]), verdieping: 2 },
  tuinhuizen: M([5.5, 11.6], 0.12, [2.9, 2.2]),
  bouwkavels: { pos: [-3.0, -17.5], schaal: 0.55 },
  ananaspak: { pos: [5.6, 12.7], verdieping: 1 },
  tinyhouse: { ...M([-12.5, -8.6], 0.45, [2.7, 2.6]), verdieping: 3 },
  // geheime vloerpuzzels: op het kerkhof, in de smidse en op het dak van de donjon
  'kruissom-1': { pos: [19.0, -4.0], schaal: 0.5 },
  'kruissom-2': { pos: [-12.6, 10.6], schaal: 0.5 },
  'kruissom-3': { pos: [-12.5, -8.6], schaal: 0.5, verdieping: 4 },
  // ── Eindcheck: ridderzaal, kerkhof, kapel, dan omlaag de kelder in, en via de keuken naar de achterpoort ──
  tegelvloer: M([-4.5, -12.4], 0.26, [2.5, 2.4]),
  bloembollen: M([19.0, 7.0], 0.5, [2.3, 1.2]),
  ring: { pos: [9.9, -2.4], tafel: [1.2, 1.2], tafelSoort: 'sokkel' },
  aquarium: { pos: [-12.0, -2.2], tafel: [1.4, 1.0], verdieping: -1 },
  aardappelkisten: { pos: [-3.5, -12.8], verdieping: -1 },
  spijkerbroek: { pos: [-12.5, -10.0], verdieping: -1 },
  melk: { pos: [12.0, -10.4] },
  stationsbord: { pos: [15.55, -10.0], rot: -Math.PI / 2, schaal: 0.6 },
  pakket: { pos: [5.0, -15.6], tafel: [1.2, 1.0] },
  container: M([7.8, -18.6], 0.6, [2.6, 1.6]),
};

/** De drie kluizen (alle op de begane grond), met de voorkant naar de kamer toe. */
export const KLUIS_PLEK: Record<'spoor' | 'water' | 'bouw', { pos: [number, number]; rot: number }> = {
  spoor: { pos: [-8.9, 9.2], rot: -Math.PI / 2 },
  water: { pos: [-6.8, 6.2], rot: Math.PI / 2 },
  bouw: { pos: [12.45, 4.2], rot: -Math.PI / 2 },
};

/** Verstopte lampjes [x, z] of [x, z, verdieping]. */
export const LAMPJES_HUIS: ([number, number] | [number, number, number])[] = [
  [-15.4, 13.4],
  [15.5, -5.5],
  [21.4, 10.4],
  [-7.4, -20.4],
  [-7.6, 7.6],
  [2.6, 16.4],
  [-15.4, 13.4, 1],
  [8.6, 13.5, 1],
  [-16.4, -6.6, 2],
];
