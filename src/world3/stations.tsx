// Alle plekken in Wereld 3 (De Markthal) waar een opdracht zit. Elk werkboekplaatje is hier een 3D-object.
import data from '../data/onderdeel3.json';
import type { Opdracht } from '../data/schema';
import type { Station } from '../werelden/types';
import * as D from './decor-stations';
import { PLEKKEN } from './huis';
import { Kraam, Kraamkop } from './kraam';
import * as E from './modellen-eind';
import * as I from './modellen-instap';
import * as K from './modellen-keuze';
import * as N from './modellen-niveau';
import * as T from './modellen-start';
import { STRATEGIE } from './strategie';

export type { Station } from '../werelden/types';

export const OPDRACHTEN: Record<string, Opdracht> = Object.fromEntries((data.opdrachten as unknown as Opdracht[]).map((o) => [o.id, { ...o }]));
for (const [id, s] of Object.entries(STRATEGIE)) if (OPDRACHTEN[id]) OPDRACHTEN[id].strategie = s;

const S = (x: Partial<Station> & Pick<Station, 'id' | 'titel' | 'opdrachten' | 'Model' | 'grootte'>): Station => ({
  pos: [0, 0],
  weergave: 'draai',
  kanBoven: false,
  kanDraai: true,
  ...x,
});

/** Kraam achter de toonbank (vast decor); de toonbank zelf zit in het model. */
const kraam = (naam: string, luifel: [string, string], extra: Partial<Parameters<typeof Kraam>[0]> = {}) => () => <Kraam naam={naam} luifel={luifel} {...extra} />;
/** Alleen een naambord op twee paaltjes (eindzaal: meer ruimte om te lopen). */
const kop = (naam: string, luifel: [string, string], naamKleur?: string) => () => <Kraamkop naam={naam} luifel={luifel} naamKleur={naamKleur} />;
const ACHTER: [number, number, number] = [0, 0, -1.05];
/** Kraam-station: toonbank (z −0,45..0,45) met de kraam erachter (z −1,45..−0,65). */
const KR = { decorPos: ACHTER, botser: [3, 3] as [number, number], markerY: 3.6 };
/** Station in de eindzaal: toonbank met een naambord erachter. */
const KOP = { decorPos: [0, 0, -0.78] as [number, number, number], botser: [2.4, 1.7] as [number, number], markerY: 3.4 };

const puzzel = (data.opdrachten as unknown as Opdracht[]).find((o) => o.id === 'O3-PUZ-02')!;

export const STATIONS: Station[] = [
  // ── Terugblik en instructie ──
  S({ id: 'eierdozen', titel: 'Eierdozen', opdrachten: ['W3-TERUG'], Model: T.Eierdozen, grootte: 2.2, midden: 0.55, markerY: 2.3, rol: 'terugblik', botser: [2.3, 1] }),
  S({ id: 'kookschool', titel: 'Kookschool', opdrachten: ['W3-INSTR'], Model: T.Kookschool, grootte: 2.4, midden: 0.9, rol: 'instructie', Decor: () => <D.Fornuiswand naam="KOOKSCHOOL" />, ...KR }),

  // ── Samen oefenen: instapvragen (kramenhal) ──
  S({ id: 'snoepkraam', titel: 'Snoepkraam', opdrachten: ['O3-INS-01'], Model: I.Snoepzak, grootte: 2.4, midden: 0.75, Decor: kraam('SNOEP', ['#e86a9a', '#fff4f8'], { waren: ['#e5675a', '#7cbf4a', '#f2d04a', '#e86a9a'] }), ...KR }),
  S({ id: 'zuivelkraam', titel: 'Zuivelkraam', opdrachten: ['O3-INS-02'], Model: I.Melkrecept, grootte: 2.4, midden: 0.75, Decor: kraam('ZUIVEL', ['#4f86b8', '#f4f8fc'], { waren: ['#fbfaf6', '#f2d04a', '#9fc4ef', '#fbfaf6'] }), ...KR }),
  S({ id: 'rondleiding', titel: 'Rondleiding', opdrachten: ['O3-INS-03'], Model: I.Groep, grootte: 2.8, midden: 0.85, markerY: 3.2, Decor: D.Infozuil, decorPos: [1.35, 0, -1.15], botser: [2.9, 2.4] }),
  S({ id: 'plattegrond', titel: 'Plattegrond', opdrachten: ['O3-INS-04'], Model: I.Kaarttafel, grootte: 2.2, midden: 0.9, markerY: 3, kanBoven: true, botser: [1.9, 1.3] }),
  S({ id: 'limonadekraam', titel: 'Limonadekraam', opdrachten: ['O3-INS-05'], Model: I.Limonade, grootte: 2.4, midden: 0.8, Decor: kraam('LIMONADE', ['#f2c24a', '#fffbea'], { waren: ['#e5675a', '#f2c24a', '#7cbf4a', '#e48a3a'] }), ...KR }),
  S({ id: 'stoffenkraam', titel: 'Stoffenkraam', opdrachten: ['O3-INS-06'], Model: I.Stofrol, grootte: 2.6, midden: 0.7, Decor: kraam('STOFFEN', ['#8b6bb5', '#f6f1fb'], { waren: ['#8b6bb5', '#3fa08f', '#e5675a', '#f2c24a'] }), ...KR }),
  S({ id: 'klassenfoto', titel: 'Klassenfoto', opdrachten: ['O3-INS-07'], Model: I.Klassenfoto, grootte: 2.4, midden: 1.2, markerY: 3.4, Decor: D.Fotostudio, decorPos: [0, 0, -1.1], botser: [2.9, 2.6] }),
  S({ id: 'fotokraam', titel: 'Fotokraam', opdrachten: ['O3-INS-08'], Model: I.Fotocamera, grootte: 2.6, midden: 0.9, Decor: kraam('FOTO', ['#3b4250', '#eef0f2'], { waren: ['#3b4250', '#9fc4ef', '#e5675a', '#fbfaf6'] }), ...KR }),
  S({ id: 'appelkist', titel: 'Appels', opdrachten: ['O3-INS-09'], Model: I.Appelkist, grootte: 2.4, midden: 0.7, Decor: kraam('FRUIT', ['#5f9e3f', '#f3f9ee'], { waren: ['#d8433a', '#7cbf4a', '#f2d04a', '#d8433a'] }), ...KR }),
  S({ id: 'planbord', titel: 'Planbord', opdrachten: ['O3-INS-10'], Model: I.Planbord, grootte: 2.4, midden: 1.1, markerY: 3.4, botser: [2.3, 0.8] }),

  // ── Zelf doen: vragen op niveau (drie klussen) ──
  S({ id: 'drogisterij', titel: 'Drogisterij', opdrachten: ['O3-NIV-01'], Model: N.Wasmiddel, grootte: 2.2, midden: 0.9, Decor: kraam('DROGIST', ['#9b7fd0', '#f6f2fd'], { waren: ['#9b7fd0', '#e5675a', '#9fc4ef', '#fbfaf6'] }), ...KR }),
  S({ id: 'kaaskraam', titel: 'Kaaskraam', opdrachten: ['O3-NIV-02'], Model: N.Kaaswebshop, grootte: 2.6, midden: 1.0, Decor: kraam('KAAS', ['#e9b52f', '#fffaea'], { planken: false }), ...KR }),
  S({ id: 'fruitkraam', titel: 'Fruitkraam', opdrachten: ['O3-NIV-05'], Model: N.Abrikozen, grootte: 2.4, midden: 0.75, Decor: kraam('FRUIT', ['#e48a3a', '#fff6ee'], { waren: ['#e48a3a', '#7cbf4a', '#f2d04a', '#d8433a'] }), ...KR }),
  S({ id: 'guacamole', titel: 'Guacamole', opdrachten: ['O3-NIV-03'], Model: N.Guacamole, grootte: 2.2, midden: 0.9, Decor: () => <D.Keukenwand naam="OPEN KEUKEN" />, ...KR }),
  S({ id: 'spaarpot', titel: 'Spaarpot van Max', opdrachten: ['O3-NIV-06'], Model: N.Spaarpot, grootte: 2.4, midden: 0.9, Decor: D.Afwashoek, ...KR }),
  S({ id: 'receptenboek', titel: 'Receptenboek', opdrachten: ['O3-NIV-07'], Model: N.Receptenboek, grootte: 2.6, midden: 0.9, Decor: () => <D.Fornuiswand naam="OPEN KEUKEN" />, ...KR }),
  S({ id: 'showroom', titel: 'Showroomkeuken', opdrachten: ['O3-NIV-09'], Model: N.Showroomkeuken, grootte: 2.9, midden: 1.1, markerY: 3.6, botser: [3, 1.5] }),
  S({ id: 'arnhem', titel: 'Maquette Arnhem', opdrachten: ['O3-NIV-04'], Model: N.Maquette, grootte: 2.4, midden: 0.9, markerY: 3.2, Decor: D.Skyline, decorPos: [0, 0, -1.0], botser: [2.9, 2.5] }),
  S({ id: 'tankpomp', titel: 'Tankpomp', opdrachten: ['O3-NIV-08'], Model: N.Prijspaal, grootte: 3.0, midden: 1.5, markerY: 4.2, botser: [2.8, 1.9] }),
  S({ id: 'schatkaart', titel: 'Schatkaart', opdrachten: ['O3-NIV-10'], Model: N.Schatkaart, grootte: 2.2, midden: 0.9, markerY: 3, Decor: D.Roeiboot, decorPos: [0.4, -0.52, -4.6], botser: [3, 3] }),

  // ── Keuze: expertvragen, praktijk en puzzels ──
  S({ id: 'tomatensoep', titel: 'Tomatensoep', opdrachten: ['O3-EXP-01'], Model: K.Tomatensoep, grootte: 2.4, midden: 0.9, Decor: () => <D.Fornuiswand naam="SOEPKEUKEN" />, ...KR }),
  S({ id: 'scooter', titel: 'Scooterstalling', opdrachten: ['O3-EXP-02'], Model: K.Scooters, grootte: 6.6, midden: 1.0, markerY: 3.4, botser: [6.4, 2.2] }),
  S({ id: 'selfie', titel: 'Selfie-schilderij', opdrachten: ['O3-EXP-03'], Model: K.Selfie, grootte: 2.4, midden: 1.3, markerY: 3.4, botser: [2.0, 1.1] }),
  S({ id: 'schroeven', titel: 'IJzerwaren', opdrachten: ['O3-EXP-04'], Model: K.Schroeven, grootte: 2.6, midden: 1.0, Decor: kraam('IJZERWAREN', ['#6e7c86', '#f0f2f3'], { planken: false }), ...KR }),
  S({ id: 'verfwinkel', titel: 'Verf mengen', opdrachten: ['O3-EXP-05'], Model: K.Verf, grootte: 2.4, midden: 0.8, Decor: kraam('VERF', ['#3d7cc9', '#f4f8fd'], { waren: ['#3d7cc9', '#fbfaf6', '#9fc4ef', '#e5675a'] }), ...KR }),
  S({ id: 'kiosk', titel: 'Krantenkiosk', opdrachten: ['O3-EXP-06'], Model: K.Kranten, grootte: 2.6, midden: 0.9, Decor: D.Kiosk, ...KR }),
  S({ id: 'scorebord', titel: 'Scorebord', opdrachten: ['O3-EXP-07'], Model: K.Scorebord, grootte: 2.8, midden: 1.6, markerY: 3.9, botser: [2.7, 0.6] }),
  S({ id: 'pitabrood', titel: 'Pitabrood', opdrachten: ['O3-EXP-08a', 'O3-EXP-08b'], Model: K.Pitabrood, grootte: 2.6, midden: 0.9, Decor: D.Bakkerij, ...KR }),
  S({ id: 'towerbridge', titel: 'Tower Bridge', opdrachten: ['O3-EXP-09'], Model: K.TowerBridge, grootte: 2.2, midden: 1.2, markerY: 3.3, botser: [1.6, 1.6] }),
  S({ id: 'boodschappen', titel: 'Feestje', opdrachten: ['O3-PRA-01'], Model: K.Boodschappen, grootte: 2.0, midden: 0.7, markerY: 2.6, botser: [1.8, 1.5] }),
  S({ id: 'koffiehoek', titel: 'Drankjespuzzel', opdrachten: ['O3-PUZ-01'], Model: K.Drankjes, grootte: 2.4, midden: 1.0, Decor: kraam('KOFFIE', ['#7a5132', '#f7efe6'], { planken: false }), ...KR }),
  S({
    id: 'koekjesbord',
    titel: 'Koekjespuzzel',
    opdrachten: ['O3-PUZ-02'],
    Model: () => <K.Koekjesbord rooster={puzzel.puzzel!.rooster} tegels={puzzel.puzzel!.tegels} oplossing={String(puzzel.antwoord?.waarde ?? '').split(',').map((x) => x.trim())} id={puzzel.id} />,
    grootte: 3.1,
    midden: 0.2,
    markerY: 2,
    weergave: 'boven',
    kanBoven: true,
    kanDraai: false,
    botser: [3.1, 2.7],
  }),
  S({ id: 'lijnenbord', titel: 'Lijnenpuzzel', opdrachten: ['O3-PUZ-03'], Model: K.Lijnenbord, grootte: 2.2, midden: 1.3, markerY: 3.4, botser: [2.1, 0.5] }),
  S({ id: 'balans', titel: 'Kaasbalans', opdrachten: ['O3-PUZ-04'], Model: K.Balans, grootte: 2.2, midden: 1.0, Decor: kraam('KAASPROEVERIJ', ['#e9b52f', '#fffaea'], { planken: false }), ...KR }),
  S({ id: 'tshirt', titel: 'Gatenpuzzel', opdrachten: ['O3-PUZ-05'], Model: K.Tshirt, grootte: 2.2, midden: 1.1, markerY: 3.4, botser: [2.1, 0.9] }),

  // ── Eindcheck: eindzaal bij de uitgang ──
  S({ id: 'koffiepak', titel: 'Koffie', opdrachten: ['O3-EIN-01'], Model: E.Koffie, grootte: 2.4, midden: 0.8, Decor: kop('KOFFIEBAR', ['#7a5132', '#f7efe6'], '#5a3a22'), ...KOP }),
  S({ id: 'bestek', titel: 'Bestek', opdrachten: ['O3-EIN-02'], Model: E.Bestek, grootte: 2.4, midden: 0.7, Decor: kop('HUISHOUD', ['#5fa8c9', '#f0f8fb'], '#2f6c8a'), ...KOP }),
  S({ id: 'racebaan', titel: 'Racebaan', opdrachten: ['O3-EIN-03'], Model: E.Racebaan, grootte: 2.2, midden: 0.8, Decor: kop('SPEELGOED', ['#e5675a', '#fff4f2'], '#b8433a'), ...KOP }),
  S({ id: 'empire', titel: 'Empire State Building', opdrachten: ['O3-EIN-04'], Model: E.Empire, grootte: 2.4, midden: 1.1, Decor: kop('SOUVENIRS', ['#1d3a6b', '#eef3fb'], '#1d3a6b'), ...KOP, markerY: 3.8 }),
  S({ id: 'simonly', titel: 'Telefoons', opdrachten: ['O3-EIN-05'], Model: E.Simonly, grootte: 2.4, midden: 1.0, Decor: kop('TELEFOON', ['#2f3634', '#f2f2f0'], '#2f3634'), ...KOP }),
  S({ id: 'appelkraam', titel: 'Appelkraam', opdrachten: ['O3-EIN-06'], Model: E.Appels, grootte: 2.6, midden: 0.9, Decor: kop('APPELS', ['#d8433a', '#fff4f2'], '#b8243a'), ...KOP }),
  S({ id: 'folders', titel: 'Folders', opdrachten: ['O3-EIN-07'], Model: E.Folders, grootte: 2.4, midden: 1.0, markerY: 3.4, botser: [2.2, 1.5] }),
  S({ id: 'sneeuwbol', titel: 'Sneeuwbol', opdrachten: ['O3-EIN-08'], Model: E.Sneeuwbol, grootte: 2.4, midden: 0.9, Decor: kop('WINTERSPORT', ['#5fa8c9', '#ffffff'], '#2f6c8a'), ...KOP }),
  S({ id: 'betonmolen', titel: 'Betonspecie', opdrachten: ['O3-EIN-09'], Model: E.Beton, grootte: 2.2, midden: 0.9, markerY: 3.2, botser: [2.0, 1.3] }),
  S({ id: 'bloemenkraam', titel: 'Bloemenkraam', opdrachten: ['O3-EIN-10'], Model: E.Bloemen, grootte: 2.6, midden: 0.8, Decor: kop('BLOEMEN', ['#e86a9a', '#fff4f8'], '#b8436a'), ...KOP }),
];

// Plek, draaiing en verdieping komen uit huis.ts (De Markthal aan de Waag).
for (const st of STATIONS) {
  const p = PLEKKEN[st.id];
  if (!p) throw new Error(`Geen plek in huis.ts voor ${st.id}`);
  const sch = p.schaal ?? 1;
  st.pos = p.pos;
  st.rot = p.rot ?? 0;
  st.verdieping = p.verdieping;
  st.schaal = p.schaal;
  st.tafel = p.tafel;
  st.tafelSoort = p.tafelSoort;
  st.grootte = st.grootte * sch;
  if (p.botser) st.botser = p.botser;
  else if (p.tafel) st.botser = [p.tafel[0] + 0.1, p.tafel[1] + 0.1];
  else if (st.botser && sch !== 1) st.botser = [st.botser[0] * sch, st.botser[1] * sch];
}

export const STATION: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/** Speciale opdrachten die niet uit het werkboek komen (terugblik en instructie). */
const A = (waarde: number, eenheid: string, expr: string) => ({ waarde, eenheid, expr });
const S2 = (tekst: string, som: string, expr: string, uitkomst: number, eenheid: string, x = {}) => ({ tekst, som, expr, uitkomst, eenheid, invoer: true, ...x });
OPDRACHTEN['W3-TERUG'] = {
  id: 'W3-TERUG',
  onderdeel: 3,
  sectie: 'instap',
  nummer: 'terugblik',
  origineel: '(geen werkboeksom: terugblik)',
  afbeeldingen: [],
  vraag: ['In een doos zitten 2 rijen van 3 eieren.', 'Op de kraam staan 4 dozen.', 'Hoeveel eieren zijn dat samen?'],
  type: 'getal',
  paneel: 'deelsommen',
  stappen: [S2('Tel de eieren in 1 doos', '2 × 3', '2*3', 6, 'eieren', { deel: 'doos' }), S2('Er staan 4 dozen', '4 × 6', '4*6', 24, 'eieren', { deel: 'dozen' })],
  antwoord: A(24, 'eieren', '4*2*3'),
  autoCheck: true,
  flags: [],
};
OPDRACHTEN['W3-INSTR'] = {
  id: 'W3-INSTR',
  onderdeel: 3,
  sectie: 'instap',
  nummer: 'instructie',
  origineel: '(geen werkboeksom: tweelingsom voor de instructie)',
  afbeeldingen: [],
  vraag: ['Een recept voor 4 personen gebruikt 300 gram pasta.', 'De kookschool kookt voor 10 personen.', 'Hoeveel gram pasta is nodig?'],
  type: 'getal',
  paneel: 'verhoudingstabel',
  stappen: [
    S2('Ga eerst naar 2 personen', '4 : 2', '4/2', 2, 'personen', { deel: 'recept', tabel: { boven: ['4 personen', '2 personen'], onder: ['300 g', '?'], pijl: ': 2' } }),
    S2('Deel de pasta ook door 2', '300 : 2', '300/2', 150, 'gram', { deel: 'recept', tabel: { boven: ['4 personen', '2 personen'], onder: ['300 g', '150 g'], pijl: ': 2' } }),
    S2('Van 2 naar 10 personen', '10 : 2', '10/2', 5, 'keer', { deel: 'pasta', tabel: { boven: ['2 personen', '10 personen'], onder: ['150 g', '?'], pijl: '× 5' } }),
    S2('Doe de pasta ook keer 5', '5 × 150', '5*150', 750, 'gram', { deel: 'pasta', tabel: { boven: ['2 personen', '10 personen'], onder: ['150 g', '750 g'], pijl: '× 5' } }),
  ],
  antwoord: A(750, 'gram', '300/4*10'),
  autoCheck: true,
  flags: [],
};

/** Alle werkboekopdrachten van deze wereld (zonder terugblik/instructie). */
export const WERKBOEK = (data.opdrachten as unknown as Opdracht[]).map((o) => o.id);
