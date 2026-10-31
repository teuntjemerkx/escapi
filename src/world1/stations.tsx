// Alle plekken in Wereld 1 (De Haven) waar een opdracht zit. Elk werkboekplaatje is hier een 3D-object.
import data from '../data/onderdeel1.json';
import type { Opdracht } from '../data/schema';
import type { Station } from '../werelden/types';
import * as E from './modellen-eind';
import * as X from './modellen-expert';
import * as K from './modellen-klus';
import * as I from './modellen-start';
import { PLEKKEN } from './huis';
import { Kavelbord } from './inrichting';
import { STRATEGIE } from './strategie';

export type { Station } from '../werelden/types';

const BRON = data.opdrachten as unknown as Opdracht[];

/** Werkboekopdrachten (met strategie-tip) + terugblik en instructie. */
export const OPDRACHTEN: Record<string, Opdracht> = Object.fromEntries(BRON.map((o) => [o.id, { ...o, strategie: STRATEGIE[o.id] ?? o.strategie }]));

const S = (x: Partial<Station> & Pick<Station, 'id' | 'titel' | 'opdrachten' | 'Model' | 'grootte'>): Station => ({
  pos: [0, 0],
  weergave: 'draai',
  kanBoven: false,
  kanDraai: true,
  ...x,
});

const PUZ = BRON.filter((o) => o.sectie === 'puzzel');

export const STATIONS: Station[] = [
  // ── Kadeplein en havenmeesterij: terugblik en instructie ──
  S({ id: 'terugblik', titel: 'Pallet met sap', opdrachten: ['W1-TERUG'], Model: I.Pallet, grootte: 1.7, midden: 0.25, markerY: 1.4, rol: 'terugblik', botser: [1.8, 0.8] }),
  S({ id: 'uitleg', titel: 'Uitleg', opdrachten: ['W1-INSTR'], Model: I.Tros, grootte: 1.9, midden: 0.15, markerY: 1.4, rol: 'instructie' }),
  // ── Samen oefenen: de kavels in de visafslag ──
  S({ id: 'meetkist', titel: 'Meetkist', opdrachten: ['O1-INS-01', 'O1-INS-03', 'O1-INS-06', 'O1-INS-10'], Model: I.Meetkist, grootte: 1.4, midden: 0.15, markerY: 2.3, Decor: () => <Kavelbord nr={1} /> }),
  S({ id: 'meetlat', titel: 'Duimstok en plank', opdrachten: ['O1-INS-02', 'O1-INS-09'], Model: I.Duimstok, grootte: 2.6, midden: 0.05, markerY: 2.3, Decor: () => <Kavelbord nr={2} /> }),
  S({ id: 'maatbeker', titel: 'Drankkraam', opdrachten: ['O1-INS-04', 'O1-INS-07'], Model: I.Drankkraam, grootte: 1.0, midden: 0.2, markerY: 2.3, Decor: () => <Kavelbord nr={3} /> }),
  S({ id: 'paddenstoel', titel: 'Paddenstoel', opdrachten: ['O1-INS-05'], Model: I.Paddenstoel, grootte: 2.4, midden: 0.3, markerY: 1.3, Decor: () => <Kavelbord nr={4} /> }),
  S({ id: 'suikerpak', titel: 'Pak suiker', opdrachten: ['O1-INS-08'], Model: I.Suikerpak, grootte: 0.9, midden: 0.15, markerY: 2.3, Decor: () => <Kavelbord nr={5} /> }),
  // ── Zelf doen: klus "Meten op de werf" (werkplaats en helling) ──
  S({ id: 'snelwegbord', titel: 'Wegwijzer', opdrachten: ['O1-NIV-01a'], Model: K.Snelwegbord, grootte: 2.6, midden: 1.5, markerY: 3.1 }),
  S({ id: 'werkplaats', titel: 'Werkplaats', opdrachten: ['O1-NIV-01b', 'O1-NIV-01c'], Model: K.Werkplaats, grootte: 2.6, midden: 1.1, markerY: 2.9 }),
  S({ id: 'hakken', titel: 'Schoenenkraam', opdrachten: ['O1-NIV-02'], Model: K.Hakken, grootte: 2.0, midden: 0.9, markerY: 2.5 }),
  S({ id: 'omleiding', titel: 'Omleiding', opdrachten: ['O1-NIV-03'], Model: K.Omleiding, grootte: 2.2, midden: 0.1, markerY: 1.2, kanBoven: true }),
  // ── Zelf doen: klus "Schenken op de steigers" (jachthaven) ──
  S({ id: 'kombuis', titel: 'Kombuis', opdrachten: ['O1-NIV-04a'], Model: K.Kombuis, grootte: 1.3, midden: 0.7, markerY: 2.4, Decor: K.KombuisWand }),
  S({ id: 'cocktail', titel: 'Havencafé', opdrachten: ['O1-NIV-04c'], Model: K.Cocktail, grootte: 1.0, midden: 0.8, markerY: 2.9, Decor: K.Parasol }),
  S({ id: 'badje', titel: 'Opblaasbad', opdrachten: ['O1-NIV-04b'], Model: K.Opblaasbad, grootte: 2.4, midden: 0.3, markerY: 1.6 }),
  S({ id: 'smoothie', titel: 'Smoothiebar', opdrachten: ['O1-NIV-05'], Model: K.Smoothie, grootte: 1.4, midden: 0.25, markerY: 2.3, Decor: () => <I.Marktkraam kleur="#f2a03a" naam="Smoothies" /> }),
  // ── Zelf doen: klus "Wegen in de loods" (weegloods en kantine) ──
  S({ id: 'rijstkom', titel: 'Kantine', opdrachten: ['O1-NIV-06'], Model: K.Rijstkom, grootte: 0.9, midden: 0.15, markerY: 1.9, Decor: K.Kantine }),
  S({ id: 'weegschaal', titel: 'Weegschaal', opdrachten: ['O1-NIV-07'], Model: K.Weegschaal, grootte: 1.9, midden: 0.9, markerY: 2.3 }),
  S({ id: 'klontjes', titel: 'Suikerklontjes', opdrachten: ['O1-NIV-08'], Model: K.Klontjes, grootte: 0.9, midden: 0.2, markerY: 1.8, Decor: K.Magazijn }),
  // ── Keuze: de rekenkaart in de kaartenkamer (verdieping 1) ──
  S({ id: 'kaart-lengte', titel: 'Rekenkaart: lengte', opdrachten: ['O1-EXP-01a', 'O1-EXP-01b', 'O1-EXP-01c', 'O1-EXP-01d'], Model: () => <X.KaartBord rij="lengte" />, grootte: 2.8, midden: 1.0, markerY: 2.3, botser: [2.6, 0.8] }),
  S({ id: 'kaart-opp', titel: 'Rekenkaart: oppervlakte', opdrachten: ['O1-EXP-02a', 'O1-EXP-02b', 'O1-EXP-02c', 'O1-EXP-02d'], Model: () => <X.KaartBord rij="oppervlakte" />, grootte: 2.8, midden: 1.0, markerY: 2.3, botser: [2.6, 0.8] }),
  S({ id: 'kaart-inhoud', titel: 'Rekenkaart: inhoud', opdrachten: ['O1-EXP-03a', 'O1-EXP-03b', 'O1-EXP-03c', 'O1-EXP-03d'], Model: () => <X.KaartBord rij="inhoud" />, grootte: 2.8, midden: 1.0, markerY: 2.3, botser: [2.6, 0.8] }),
  S({ id: 'kaart-liter1', titel: 'Rekenkaart: gemixt 1', opdrachten: ['O1-EXP-04a', 'O1-EXP-04b', 'O1-EXP-04c'], Model: () => <X.KaartBord rij="gemixt" />, grootte: 2.8, midden: 1.3, markerY: 2.8, botser: [2.6, 1.0] }),
  S({ id: 'kaart-liter2', titel: 'Rekenkaart: gemixt 2', opdrachten: ['O1-EXP-04d', 'O1-EXP-04e', 'O1-EXP-04f'], Model: () => <X.KaartBord rij="gemixt" />, grootte: 2.8, midden: 1.3, markerY: 2.8, botser: [2.6, 1.0] }),
  S({ id: 'kaart-gewicht', titel: 'Rekenkaart: gewicht', opdrachten: ['O1-EXP-05a', 'O1-EXP-05b', 'O1-EXP-05c', 'O1-EXP-05d'], Model: () => <X.KaartBord rij="gewicht" />, grootte: 2.8, midden: 1.0, markerY: 2.3, botser: [2.6, 0.8] }),
  // ── Keuze: pakhuis (kabel, cement, zolder: zandbak, bag-in-box) en het mededelingenbord ──
  S({ id: 'kabelhaspel', titel: 'Kabelhaspel', opdrachten: ['O1-EXP-06'], Model: X.Kabelhaspel, grootte: 2.1, midden: 0.75, markerY: 2.2 }),
  S({ id: 'cement', titel: 'Cementzakken', opdrachten: ['O1-EXP-07a', 'O1-EXP-07b'], Model: X.Cement, grootte: 2.6, midden: 0.7, markerY: 2.2 }),
  S({ id: 'zandbak', titel: 'Zandbak', opdrachten: ['O1-EXP-08'], Model: X.Zandbak, grootte: 3.0, midden: 0.3, markerY: 1.5 }),
  S({ id: 'bag-in-box', titel: 'Bag-in-box', opdrachten: ['O1-EXP-10'], Model: X.BagInBox, grootte: 0.9, midden: 0.2, markerY: 1.2 }),
  S({ id: 'buitenmissie', titel: 'Buitenmissie', opdrachten: ['O1-PRA-01', 'O1-PRA-02', 'O1-PRA-03', 'O1-PRA-04'], Model: X.Buitenmissie, grootte: 2.5, midden: 1.2, markerY: 2.7 }),
  // ── Keuze: werf (champagne), kantine (autorit), havenhoofd (weerstation) ──
  S({ id: 'champagne', titel: 'Champagnetoren', opdrachten: ['O1-EXP-09'], Model: X.Champagne, grootte: 2.0, midden: 1.0, markerY: 2.5 }),
  S({ id: 'auto', titel: 'Autorit', opdrachten: ['O1-EXP-11'], Model: X.Autorit, grootte: 2.2, midden: 0.3, markerY: 1.4, kanBoven: true }),
  S({ id: 'weerstation', titel: 'Weerstation', opdrachten: ['O1-EXP-12a', 'O1-EXP-12b', 'O1-EXP-12c'], Model: X.Weerstation, grootte: 3.0, midden: 1.3, markerY: 3.4 }),
  // ── Puzzels (24-kaarten): havenhoofd, pakhuiszolder en balkon ──
  ...PUZ.map((o, i) =>
    S({
      id: `kaart24-${i + 1}`,
      titel: `24-kaart ${i + 1}`,
      opdrachten: [o.id],
      Model: () => <X.Kaart24 nr={i + 1} cijfers={(o.context?.[0].items ?? []).slice(0, 4).map((it) => Number(it.waarde))} />,
      grootte: 2.0,
      midden: 1.0,
      markerY: 2.6,
      botser: [1.7, 1.7],
    }),
  ),
  // ── Eindcheck: vertrekloods (blok 1) en vertrekkade (blok 2) ──
  S({ id: 'koffie', titel: 'Koffie', opdrachten: ['O1-EIN-01'], Model: E.Koffie, grootte: 0.9, midden: 0.15, markerY: 1.2 }),
  S({ id: 'bessen', titel: 'Bessen', opdrachten: ['O1-EIN-02'], Model: E.Bessen, grootte: 0.9, midden: 0.15, markerY: 1.1 }),
  S({ id: 'goud', titel: 'Goudstaven', opdrachten: ['O1-EIN-03'], Model: E.Goud, grootte: 2.0, midden: 0.8, markerY: 2.2 }),
  S({ id: 'vuistregel', titel: 'Vuistregel', opdrachten: ['O1-EIN-04'], Model: E.Vuistregel, grootte: 2.0, midden: 1.0, markerY: 2.4 }),
  S({ id: 'pont', titel: 'Pont naar school', opdrachten: ['O1-EIN-05'], Model: E.Pont, grootte: 1.8, midden: 0.15, markerY: 1.2 }),
  S({ id: 'regenmeter', titel: 'Regenmeter', opdrachten: ['O1-EIN-06'], Model: E.Regenmeter, grootte: 1.9, midden: 0.6, markerY: 2.0 }),
  S({ id: 'parkeerschijf', titel: 'Parkeerschijf', opdrachten: ['O1-EIN-07'], Model: E.Parkeerschijf, grootte: 2.6, midden: 1.0, markerY: 2.6 }),
  S({ id: 'klontjesdoos', titel: 'Doos klontjes', opdrachten: ['O1-EIN-08'], Model: E.Klontjesdoos, grootte: 0.8, midden: 0.1, markerY: 1.0 }),
  S({ id: 'watervat', titel: 'Watervat', opdrachten: ['O1-EIN-09'], Model: E.Watervat, grootte: 2.2, midden: 0.6, markerY: 1.7 }),
  S({ id: 'mondwater', titel: 'Mondwater', opdrachten: ['O1-EIN-10'], Model: E.Mondwater, grootte: 1.9, midden: 0.9, markerY: 2.3 }),
];

// Plek, draaiing, schaal, tafel en verdieping komen uit huis.ts.
for (const st of STATIONS) {
  const p = PLEKKEN[st.id];
  if (!p) throw new Error(`Wereld 1: geen plek voor station ${st.id}`);
  const sch = p.schaal ?? 1;
  st.pos = p.pos;
  st.rot = p.rot ?? 0;
  st.schaal = p.schaal;
  st.tafel = p.tafel;
  st.tafelSoort = p.tafelSoort;
  if (p.verdieping) st.verdieping = p.verdieping;
  st.grootte = st.grootte * sch;
  if (p.decorPos) st.decorPos = p.decorPos;
  st.botser = p.botser ?? (p.tafel ? [p.tafel[0] + 0.1, p.tafel[1] + 0.1] : st.botser ? [st.botser[0] * sch, st.botser[1] * sch] : undefined);
}

export const STATION: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/** Terugblik en instructie: geen werkboeksommen. */
const A = (waarde: number, eenheid: string, expr: string) => ({ waarde, eenheid, expr });
const S2 = (tekst: string, som: string, expr: string, uitkomst: number, eenheid: string, x = {}) => ({ tekst, som, expr, uitkomst, eenheid, invoer: true, ...x });
OPDRACHTEN['W1-TERUG'] = {
  id: 'W1-TERUG',
  onderdeel: 1,
  sectie: 'instap',
  nummer: 'terugblik',
  origineel: '(geen werkboeksom: terugblik)',
  afbeeldingen: [],
  vraag: ['Op de pallet staan dozen met pakken sap.', 'Hoeveel pakken sap staan er op de pallet?'],
  type: 'getal',
  paneel: 'deelsommen',
  stappen: [
    S2('Tel de pakken in 1 doos', '2 × 5', '2*5', 10, 'pakken', { deel: 'doos' }),
    S2('Tel de dozen op de pallet', '2 × 5', '2*5', 10, 'dozen', { deel: 'pallet' }),
    S2('Reken alle pakken uit', '10 × 10', '10*10', 100, 'pakken'),
  ],
  antwoord: A(100, 'pakken', '10*10'),
  autoCheck: true,
  flags: [],
};
OPDRACHTEN['W1-INSTR'] = {
  id: 'W1-INSTR',
  onderdeel: 1,
  sectie: 'instap',
  nummer: 'instructie',
  origineel: '(geen werkboeksom: tweelingsom voor de instructie)',
  afbeeldingen: [],
  vraag: ['De schipper heeft een tros (dik touw) van 4,5 m.', 'Hij knipt er stukken van 50 cm van.', 'Hoeveel stukken krijgt hij?'],
  type: 'getal',
  paneel: 'eenhedentrap',
  stappen: [
    S2('1 meter is 100 cm', '1 × 100', '1*100', 100, 'cm', { trap: { van: 'm', naar: 'cm' } }),
    S2('Maak van de tros cm', '4,5 × 100', '4.5*100', 450, 'cm', { trap: { van: 'm', naar: 'cm' }, deel: 'tros' }),
    S2('Deel door 50 cm', '450 : 50', '450/50', 9, 'stukken', { deel: 'stuk' }),
  ],
  antwoord: A(9, 'stukken', '4.5*100/50'),
  autoCheck: true,
  flags: [],
};

/** Alle werkboekopdrachten van deze wereld (zonder terugblik/instructie), in werkboekvolgorde. */
export const WERKBOEK = BRON.map((o) => o.id);
