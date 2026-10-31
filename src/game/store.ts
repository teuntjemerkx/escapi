import { create } from 'zustand';
import * as THREE from 'three';

/** lopen → heen (camera vliegt naar object) → inspectie → terug → lopen */
export type Modus = 'lopen' | 'heen' | 'inspectie' | 'terug';
export type CameraStand = 'derde' | 'eerste';
/** Inspectie: van boven (helikopterview op het echte object) of draaien (object komt naar je toe). */
export type Weergave = 'boven' | 'draai';
/** De zes fases van het Directe Instructie Model. */
export type Fase = 'terugblik' | 'doel' | 'instructie' | 'begeleid' | 'zelfstandig' | 'evaluatie' | 'klaar';

export const FASES: { id: Fase; kort: string }[] = [
  { id: 'terugblik', kort: 'Terugblik' },
  { id: 'doel', kort: 'Doel' },
  { id: 'instructie', kort: 'Uitleg' },
  { id: 'begeleid', kort: 'Samen' },
  { id: 'zelfstandig', kort: 'Zelf' },
  { id: 'evaluatie', kort: 'Check' },
];

/** Snel veranderende waarden (elke frame) staan buiten React-state. */
export const speler = {
  pos: new THREE.Vector3(0, 0, 33),
  richting: Math.PI, // waar het poppetje naar kijkt (rad, 0 = +z)
  doel: null as THREE.Vector3 | null,
  /** Tussenpunten van de looproute (padzoeken om muren heen). */
  pad: [] as THREE.Vector3[],
  /** Callback die afgaat als het poppetje bij het doel is (bv. inspectie starten). */
  bijDoel: null as null | (() => void),
  /** Op welke verdieping het poppetje is (op een trap: de verdieping waar het het dichtst bij is). */
  verdieping: 0,
  /** Trappen (nummers) die de huidige looproute gebruikt: andere trappen loop je voorbij. */
  viaTrappen: [] as number[],
};

/** Kijkhoek en ooghoogte als je door de ogen van het poppetje kijkt (eerste persoon). */
export const FOV_EERSTE = 70;
export const OOG_H = 1.55;

export const cam = {
  yaw: 0, // camera staat achter het poppetje (aan de +z-kant)
  pitch: 0.74,
  afstand: 15,
  fpPitch: 0,
  /** Schok van de camera na een schrikmoment (1 = net geschrokken, zakt vanzelf naar 0). */
  schok: 0,
};

export interface Score {
  goed: boolean;
  pogingen: number;
  hulp: number;
  /** Hoogste tipniveau dat de student gebruikte (0 = geen, 1 strategie … 4 tweelingsom). */
  tip?: number;
  /** Seconden tot de eerste poging. */
  eerste?: number;
  /** Snelle gokken (antwoord binnen 5 s, telt niet mee). */
  gok?: number;
  /** Vangnet bereikt: docent kijkt even mee. */
  vlag?: boolean;
}

export type Kaart =
  | null
  | 'start'
  | 'doel'
  | 'begeleid-klaar'
  | 'kluizen'
  | 'evaluatie'
  | 'blok2'
  | 'samenvatting'
  | 'nabespreking'
  | 'hulp'
  | 'docent'
  | 'poort'
  | 'klusboek'
  | 'werelden'
  | 'volgende';

/** Wat bewaard wordt (per apparaat, in localStorage). */
interface Bewaard {
  wereld: number;
  fases: Record<number, Fase>;
  voortgang: Record<string, Score>;
  geluid: boolean;
  kluizen: Record<string, boolean>;
  lampjes: Record<string, boolean>;
  lampGebruikt: Record<number, number>;
  reflectie: Record<number, Record<string, string>>;
  rekenmachine: boolean;
  voorlezen: boolean;
  schrikken?: boolean;
  beeld?: 'auto' | 'hoog' | 'midden' | 'laag';
}

interface Staat {
  modus: Modus;
  cameraStand: CameraStand;
  /** Station dat nu open is. */
  actief: string | null;
  /** Welke opdracht van dat station (index). */
  opdrachtIndex: number;
  weergave: Weergave;
  /** Exploded view 0..1 (schuifregelaar). */
  uit: number;
  gekozenDeel: string | null;
  /** Stap die in het paneel oplicht (bv. na klik op een 3D-onderdeel). */
  focusStap: number | null;
  geluid: boolean;
  /** Wereld waar je nu bent (1–5) en de fase daarin. */
  wereld: number;
  fase: Fase;
  fases: Record<number, Fase>;
  voortgang: Record<string, Score>;
  /** Open kluizen: sleutel "wereld:klus". */
  kluizen: Record<string, boolean>;
  /** Gevonden lampjes: sleutel "wereld:index". */
  lampjes: Record<string, boolean>;
  lampGebruikt: Record<number, number>;
  reflectie: Record<number, Record<string, string>>;
  docent: boolean;
  /** Mag de rekenmachine gebruikt worden bij de vragen? (de docent kan hem uitzetten) */
  rekenmachine: boolean;
  setRekenmachine: (aan: boolean) => void;
  /** Lees de vragen en wat het maatje zegt hardop voor (voor leerlingen die moeite hebben met lezen). */
  voorlezen: boolean;
  setVoorlezen: (aan: boolean) => void;
  /** Mag Frank je in het Spookkasteel af en toe laten schrikken? (de docent kan het uitzetten) */
  schrikken: boolean;
  setSchrikken: (aan: boolean) => void;
  /** Beeldkwaliteit: automatisch (het spel meet het apparaat) of vast. */
  beeld: 'auto' | 'hoog' | 'midden' | 'laag';
  setBeeld: (b: 'auto' | 'hoog' | 'midden' | 'laag') => void;
  /** Welk hulpmiddel ligt er open naast het rekenpaneel: de rekenkaart of de rekenmachine. */
  hulp: null | 'kaart' | 'machine';
  setHulp: (h: null | 'kaart' | 'machine') => void;
  /** Feestje (confetti): teller + hoe groot. */
  feest: { n: number; groot: boolean };
  vier: (groot?: boolean) => void;
  /** Overlay-kaart midden in beeld (doel, samenvatting, hulp...). */
  kaart: Kaart;
  /** Korte melding: het maatje zweeft aan en zegt hem. */
  melding: string | null;
  /** Soort melding: 'goed' krijgt een uitroep van het maatje erbij. */
  meldingSoort: 'info' | 'goed';
  setMelding: (m: string | null, soort?: 'info' | 'goed') => void;
  setCameraStand: (c: CameraStand) => void;
  open: (station: string, weergave: Weergave) => void;
  aangekomen: () => void;
  sluit: () => void;
  gesloten: () => void;
  setWeergave: (w: Weergave) => void;
  setOpdrachtIndex: (i: number) => void;
  setUit: (u: number) => void;
  kiesDeel: (id: string | null) => void;
  setFocusStap: (i: number | null) => void;
  setGeluid: (g: boolean) => void;
  setFase: (f: Fase) => void;
  setKaart: (k: Kaart) => void;
  poging: (id: string, goed: boolean, extra?: Partial<Score>) => void;
  hulpGebruikt: (id: string) => void;
  zetScore: (id: string, extra: Partial<Score>) => void;
  setWereld: (nr: number) => void;
  openKluis: (klus: string) => void;
  vindLampje: (i: number) => void;
  gebruikLampje: () => void;
  setReflectie: (vraag: string, antwoord: string) => void;
  setDocent: (d: boolean) => void;
  wis: () => void;
  /** Staat de beginpagina open (in plaats van een wereld)? */
  begin: boolean;
  /** Vanaf de beginpagina een wereld in. */
  speel: (nr: number) => void;
  /** Terug naar de beginpagina. */
  naarBegin: () => void;
}

const OPSLAG = 'reken-escaperoom-v2';
function laad(): Partial<Bewaard> {
  try {
    const t = localStorage.getItem(OPSLAG);
    if (t) return JSON.parse(t);
    // Oude opslag (alleen Wereld 2) overnemen.
    const oud = localStorage.getItem('reken-escaperoom-v1');
    if (oud) {
      const o = JSON.parse(oud);
      return { wereld: 2, fases: { 2: o.fase ?? 'terugblik' }, voortgang: o.voortgang ?? {}, geluid: o.geluid };
    }
    return {};
  } catch {
    return {};
  }
}
function bewaar(s: Staat) {
  try {
    const b: Bewaard = {
      wereld: s.wereld,
      fases: { ...s.fases, [s.wereld]: s.fase },
      voortgang: s.voortgang,
      geluid: s.geluid,
      kluizen: s.kluizen,
      lampjes: s.lampjes,
      lampGebruikt: s.lampGebruikt,
      reflectie: s.reflectie,
      rekenmachine: s.rekenmachine,
      voorlezen: s.voorlezen,
      schrikken: s.schrikken,
      beeld: s.beeld,
    };
    localStorage.setItem(OPSLAG, JSON.stringify(b));
  } catch {
    /* opslag niet beschikbaar: het spel werkt gewoon door */
  }
}

/** ?wereld=3 in de url kiest een wereld (handig voor de docent). */
const urlWereld = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('wereld')) || 0 : 0;
/** #wereld-3 achter het webadres: meteen in Wereld 3, zonder beginpagina (zie adres.ts). */
export const wereldUitAdres = () => {
  const m = typeof location !== 'undefined' ? /^#wereld-([1-9])$/.exec(location.hash) : null;
  return m ? Number(m[1]) : 0;
};
const adresWereld = wereldUitAdres();

const opgeslagen = laad();
const startWereld = urlWereld || adresWereld || opgeslagen.wereld || 1;

export const useSpel = create<Staat>((set, get) => ({
  modus: 'lopen',
  cameraStand: 'eerste',
  actief: null,
  opdrachtIndex: 0,
  weergave: 'draai',
  uit: 0,
  gekozenDeel: null,
  focusStap: null,
  geluid: opgeslagen.geluid ?? true,
  wereld: startWereld,
  fase: opgeslagen.fases?.[startWereld] ?? 'terugblik',
  fases: opgeslagen.fases ?? {},
  voortgang: opgeslagen.voortgang ?? {},
  kluizen: opgeslagen.kluizen ?? {},
  lampjes: opgeslagen.lampjes ?? {},
  lampGebruikt: opgeslagen.lampGebruikt ?? {},
  reflectie: opgeslagen.reflectie ?? {},
  docent: false,
  rekenmachine: opgeslagen.rekenmachine ?? true,
  setRekenmachine: (rekenmachine) => {
    set({ rekenmachine, hulp: !rekenmachine && get().hulp === 'machine' ? null : get().hulp });
    bewaar(get());
  },
  voorlezen: opgeslagen.voorlezen ?? false,
  setVoorlezen: (voorlezen) => {
    set({ voorlezen });
    bewaar(get());
  },
  schrikken: opgeslagen.schrikken ?? true,
  setSchrikken: (schrikken) => {
    set({ schrikken });
    bewaar(get());
  },
  beeld: opgeslagen.beeld ?? 'auto',
  setBeeld: (beeld) => {
    set({ beeld });
    bewaar(get());
  },
  hulp: null,
  setHulp: (hulp) => set({ hulp }),
  feest: { n: 0, groot: false },
  vier: (groot = false) => set({ feest: { n: get().feest.n + 1, groot } }),
  kaart: 'start',
  melding: null,
  meldingSoort: 'info',
  setMelding: (melding, soort = 'info') => set({ melding, meldingSoort: soort }),
  setCameraStand: (cameraStand) => set({ cameraStand }),
  open: (actief, weergave) => set({ modus: 'heen', actief, weergave, uit: 0, gekozenDeel: null, focusStap: null, opdrachtIndex: 0 }),
  aangekomen: () => set({ modus: 'inspectie' }),
  sluit: () => set({ modus: 'terug', gekozenDeel: null, hulp: null }),
  gesloten: () => set({ modus: 'lopen', actief: null, uit: 0 }),
  setWeergave: (weergave) => set({ weergave, modus: 'heen', uit: 0, gekozenDeel: null }),
  setOpdrachtIndex: (opdrachtIndex) => set({ opdrachtIndex, focusStap: null }),
  setUit: (uit) => set({ uit }),
  kiesDeel: (gekozenDeel) => set({ gekozenDeel }),
  setFocusStap: (focusStap) => set({ focusStap }),
  setGeluid: (geluid) => {
    set({ geluid });
    bewaar(get());
  },
  setFase: (fase) => {
    set({ fase, fases: { ...get().fases, [get().wereld]: fase } });
    bewaar(get());
  },
  setKaart: (kaart) => set({ kaart }),
  poging: (id, goed, extra = {}) => {
    const v = get().voortgang[id] ?? { goed: false, pogingen: 0, hulp: 0 };
    set({ voortgang: { ...get().voortgang, [id]: { ...v, ...extra, pogingen: v.pogingen + 1, goed: v.goed || goed } } });
    bewaar(get());
  },
  hulpGebruikt: (id) => {
    const v = get().voortgang[id] ?? { goed: false, pogingen: 0, hulp: 0 };
    set({ voortgang: { ...get().voortgang, [id]: { ...v, hulp: v.hulp + 1 } } });
    bewaar(get());
  },
  zetScore: (id, extra) => {
    const v = get().voortgang[id] ?? { goed: false, pogingen: 0, hulp: 0 };
    set({ voortgang: { ...get().voortgang, [id]: { ...v, ...extra } } });
    bewaar(get());
  },
  setWereld: (nr) => {
    const s = get();
    const fases = { ...s.fases, [s.wereld]: s.fase };
    set({ fases, wereld: nr, fase: fases[nr] ?? 'terugblik', actief: null, modus: 'lopen', kaart: 'start' });
    bewaar(get());
  },
  openKluis: (klus) => {
    set({ kluizen: { ...get().kluizen, [`${get().wereld}:${klus}`]: true } });
    bewaar(get());
  },
  vindLampje: (i) => {
    set({ lampjes: { ...get().lampjes, [`${get().wereld}:${i}`]: true } });
    bewaar(get());
  },
  gebruikLampje: () => {
    const w = get().wereld;
    set({ lampGebruikt: { ...get().lampGebruikt, [w]: (get().lampGebruikt[w] ?? 0) + 1 } });
    bewaar(get());
  },
  setReflectie: (vraag, antwoord) => {
    const w = get().wereld;
    set({ reflectie: { ...get().reflectie, [w]: { ...(get().reflectie[w] ?? {}), [vraag]: antwoord } } });
    bewaar(get());
  },
  setDocent: (docent) => set({ docent }),
  wis: () => {
    // Alleen de huidige wereld opnieuw beginnen.
    const s = get();
    const nr = s.wereld;
    const pref = `O${nr}-`;
    const voortgang = Object.fromEntries(Object.entries(s.voortgang).filter(([id]) => !id.startsWith(pref) && !id.startsWith(`W${nr}-`)));
    const zonder = (r: Record<string, boolean>) => Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith(`${nr}:`)));
    set({ fase: 'terugblik', voortgang, kluizen: zonder(s.kluizen), lampjes: zonder(s.lampjes), lampGebruikt: { ...s.lampGebruikt, [nr]: 0 }, kaart: 'start' });
    bewaar(get());
  },
  begin: !urlWereld && !adresWereld,
  speel: (nr) => {
    get().setWereld(nr);
    set({ begin: false });
  },
  naarBegin: () => set({ begin: true, kaart: null, modus: 'lopen', actief: null, hulp: null, gekozenDeel: null }),
}));
