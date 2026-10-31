// Datamodel voor alle werkboekopdrachten (Fase 0).
// Eén opdracht uit het werkboek = één Opdracht. Deelvragen (a, b, c) en losse
// invulvakjes worden aparte Opdrachten met een eigen id (bv. O1-EXP-01a).

export type Onderdeel = 1 | 2 | 3 | 4 | 5;
export type Sectie = 'instap' | 'niveau' | 'expert' | 'praktijk' | 'puzzel' | 'eindtest';
export type Waarde = number | string;

/** Welk visueel rekenpaneel de app toont. */
export type Paneel =
  | 'stappen' // standaard: tussenstappen onder elkaar
  | 'deelsommen' // exploded view: elke stap hoort bij een 3D-onderdeel
  | 'eenhedentrap' // omrekenen van maten (zoals de rekenkaart)
  | 'verhoudingstabel'
  | 'procentenbalk'
  | 'getallenlijn'
  | 'blokmodel'
  | 'formule'
  | 'tabel' // aflezen uit tabel
  | 'grafiek' // aflezen uit grafiek/diagram
  | 'keuze' // meerkeuze of eenheid kiezen
  | 'koppel' // namen koppelen aan figuren
  | 'kruissom'; // puzzelrooster met tegels

export type Afronding =
  | 'geen'
  | 'heel'
  | '1-decimaal'
  | '2-decimalen'
  | 'naar-boven'
  | 'naar-beneden'
  | 'duizendtal';

export interface Stap {
  /** 2F, max ±6 woorden, bv. "Reken de bak uit". */
  tekst: string;
  /** Zoals de student het ziet, Nederlandse notatie: "24 × 12 × 3". */
  som: string;
  /** JS-expressie (punt als decimaal) die de uitkomst geeft: "24*12*3". null als niet rekenbaar. */
  expr: string | null;
  uitkomst: Waarde;
  eenheid?: string;
  /** Afronding van deze tussenstap (alleen als de stap zelf afrondt). */
  afronding?: Afronding;
  /** Moet de student dit vakje zelf invullen? */
  invoer: boolean;
  /** Eenhedentrap: van welke maat naar welke maat. */
  trap?: { van: string; naar: string };
  /** Verhoudingstabel: kolomkop boven/onder en de bewerking op de pijl. */
  tabel?: { boven: Waarde[]; onder: Waarde[]; pijl?: string };
  /** Procentenbalk: deel en geheel. */
  balk?: { procent: number; deel?: number; geheel?: number };
  /** Exploded view: id van het 3D-onderdeel dat bij deze stap hoort. */
  deel?: string;
}

export interface Antwoord {
  waarde: Waarde;
  eenheid?: string;
  /** Controle-expressie (JS). Moet na afronding gelijk zijn aan waarde. null bij tekst/keuze. */
  expr: string | null;
  afronding?: Afronding;
  /** Absolute marge die de app goed rekent (bv. 0.01 bij geld). */
  tolerantie?: number;
  /** Andere antwoorden die ook goed zijn (bv. "B" en "24 m²"). */
  alternatieven?: Waarde[];
}

/** Data uit een plaatje, zo volledig dat we het plaatje zelf kunnen namaken. */
export interface Context {
  soort: 'tabel' | 'prijzen' | 'grafiek' | 'tekening' | 'plattegrond' | 'tekst' | 'kaart' | 'anders';
  titel?: string;
  kolommen?: string[];
  rijen?: Waarde[][];
  items?: { label: string; waarde: Waarde; eenheid?: string }[];
  /** Volledige beschrijving van wat er op het plaatje staat. */
  beschrijving: string;
}

export interface Flag {
  soort:
    | 'notatie'
    | 'tekst'
    | 'dubbelzinnig'
    | 'fout-in-werkboek'
    | 'dubbel'
    | 'auteursrecht'
    | 'onleesbaar'
    | 'niet-automatisch';
  beschrijving: string;
  /** Wat de app nu doet; de docent beslist definitief. */
  voorstel: string;
}

/**
 * Hoe een werkboekplaatje in de 3D-wereld terugkomt. NOOIT het plaatje zelf tonen:
 * alles wordt opnieuw gebouwd als 3D-voorwerp, schilderij, scherm, bord, enz.
 */
export interface Beeld {
  /** Bestandsnaam uit word/media, bv. "image36.png". */
  afbeelding: string;
  vorm:
    | 'model' // echt 3D-voorwerp (zwembad, doos, aquarium): exploded view mogelijk
    | 'schilderij' // ingelijst aan de muur, in eigen stijl nagetekend
    | 'scherm' // tv/monitor/digibord in de controlekamer (grafieken, tabellen)
    | 'bord' // verkeersbord, krijtbord, stoepbord, prijsbordje
    | 'poster' // affiche of folder aan een wand/zuil
    | 'etiket' // label op een fles/pak/doos
    | 'kaart' // plattegrond of landkaart op tafel/vloer
    | 'hologram' // zwevend vlak boven een sokkel (voor abstracte figuren)
    | 'boek' // opengeslagen boek/menukaart/kassabon
    | 'anders';
  /** Concreet 3D-ontwerp: wat het is, waar het staat, kleuren, wat beweegt of klikbaar is. 2–4 zinnen. */
  ontwerp: string;
  /** Welke getallen/labels erop of erin MOETEN staan (uit context), zodat de som klopt. */
  toont: string[];
  /** Grappig of verrassend detail (mag, hoeft niet). */
  grap?: string;
}

export interface Voorbeeld {
  /** Tweelingsom: zelfde type, ANDERE getallen. Nooit een werkboeksom. */
  vraag: string[];
  stappen: Stap[];
  antwoord: Antwoord;
}

export interface Opdracht {
  /** O{onderdeel}-{INS|NIV|EXP|PRA|PUZ|EIN}-{nummer}{letter}, bv. O2-NIV-11a */
  id: string;
  onderdeel: Onderdeel;
  sectie: Sectie;
  /** Nummer zoals in het werkboek: "11a". */
  nummer: string;
  titel?: string;
  /** Letterlijke werkboektekst (inclusief fouten). */
  origineel: string;
  /** Bestandsnamen uit word/media, bv. ["image36.png"]. */
  afbeeldingen: string[];
  /** Vraag in 2F: korte, actieve zinnen. Alle getallen blijven gelijk. */
  vraag: string[];
  context?: Context[];
  type: 'getal' | 'keuze' | 'eenheid-kiezen' | 'tekst' | 'open' | 'puzzel' | 'koppel';
  keuzes?: string[];
  antwoord: Antwoord | null;
  stappen: Stap[];
  paneel: Paneel;
  /** Sleutel van het 3D-model in de wereld (alleen als er een past). */
  object3d?: string;
  /** Eén Beeld per afbeelding van deze opdracht (verplicht als afbeeldingen niet leeg is). */
  beeld?: Beeld[];
  voorbeeld?: Voorbeeld;
  /** Tip 1 (strategie): wat zoek je en wat heb je nodig. 1–2 korte zinnen, nooit het antwoord. */
  strategie?: string;
  /** Koppelvraag: elk item hoort bij precies één optie. */
  koppel?: { items: { label: string; antwoord: string }[]; opties: string[] };
  /**
   * Kruissom: rooster per rij. "#" = leeg vak, "" = invullen, getal = gegeven,
   * "+", "-", "x", ":", "=" = rekenteken. Oplossing staat in antwoord.waarde
   * (getallen in leesvolgorde, gescheiden door komma's).
   */
  puzzel?: { rooster: string[][]; tegels: number[] };
  /** Kan de app dit zelf nakijken? */
  autoCheck: boolean;
  flags: Flag[];
}

export interface OnderdeelData {
  onderdeel: Onderdeel;
  titel: string;
  opdrachten: Opdracht[];
}
