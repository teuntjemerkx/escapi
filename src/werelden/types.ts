// Eén vorm voor alle vijf werelden. Een wereld levert data, plekken en decor;
// de motor (game/wereld-basis.tsx) zorgt voor stations, iconen, kluizen, sleutels, lampjes en de poort.
import type { FC } from 'react';
import type { Opdracht } from '../data/schema';
import type { Fase, Weergave } from '../game/store';

export type Ondergrond = 'gras' | 'tegels' | 'zand' | 'grind';

/** De HDRI-opnames die het spel gebruikt (zie Omgeving in App.tsx). */
export type Hdri = 'sunset' | 'night' | 'hall' | 'lobby' | 'lab';

export interface Station {
  id: string;
  titel: string;
  opdrachten: string[];
  /** Midden van het station in de wereld [x, z]. */
  pos: [number, number];
  rot?: number;
  Model: FC;
  /** Standaardweergave bij openen. */
  weergave: Weergave;
  kanBoven: boolean;
  kanDraai: boolean;
  /** Grootste maat van het object in meters (voor de camera). */
  grootte: number;
  /** Hoogte van het midden (m) voor de camera. */
  midden?: number;
  /** In helikopterview automatisch uit elkaar (bv. dak eraf). */
  bovenUit?: number;
  /** Botsvak [breedte x, diepte z] in wereldrichting. */
  botser?: [number, number];
  /** terugblik/instructie horen bij de DIM-fases; kluis hoort bij een klus. */
  rol?: 'terugblik' | 'instructie' | 'kluis';
  /** Alleen bij rol 'kluis': id van de klus. */
  klus?: string;
  /** Hoogte van het zwevende icoon (boven de kavel). */
  markerY?: number;
  /** Kavel (verhoogde tegel met rand) onder het object: [breedte, diepte]. */
  kavel?: [number, number];
  ondergrond?: Ondergrond;
  /** Vast decor dat bij het station hoort maar niet meevliegt naar de inspectie. */
  Decor?: FC;
  decorPos?: [number, number, number];
  decorRot?: number;
  /** Speciale vouwknop (kubus/balk/pak openvouwen) in de inspectie. */
  vouw?: boolean;
  /**
   * De vraag gaat over de uitslag zelf (welke kubus/figuur hoort erbij?): het model ligt eerst open en
   * dichtvouwen is een hulpmiddel dat pas vanaf deze tip mag (anders zie je het antwoord meteen).
   */
  vouwTip?: number;
  /** Schaal van het model (maquette van iets groots, bv. 0,1). `grootte` is dan de geschaalde maat. */
  schaal?: number;
  /** Tafel onder het model [b, d] (hoogte 0,8 m); het model staat op het blad. */
  tafel?: [number, number];
  /** Soort tafel: hout (standaard), groen vilt (maquettes) of een lage sokkel. */
  tafelSoort?: 'hout' | 'vilt' | 'sokkel';
  /** Op welke verdieping het station staat (0 = begane grond). */
  verdieping?: number;
}

// ── Gebouw (poppenhuis-stijl) ──

export type Vloer =
  | 'planken'
  | 'visgraat'
  | 'tegels'
  | 'tapijt'
  | 'steen'
  | 'beton'
  // buiten
  | 'gras'
  | 'grind'
  | 'kinderkopjes'
  | 'vlonder'
  | 'zand'
  | 'sneeuw'
  | 'asfalt'
  // modern binnen
  | 'terrazzo'
  | 'rooster'
  | 'rubber';

export interface Kamer {
  id: string;
  /** Naam op het bordje boven de deur en in het klusboek. */
  naam: string;
  /** Midden [x, z] en maat [b, d] in meters. Kamers liggen in een raster en raken elkaar. */
  pos: [number, number];
  maat: [number, number];
  vloer?: Vloer;
  vloerKleur?: string;
  /** Kleur van het behang (boven) en de lambrisering (onder). */
  muur?: string;
  lambrisering?: string;
  /** Plekken met warm lamplicht op de vloer [x, z] (wereldcoördinaten). */
  lampen?: [number, number][];
  /** Buitenruimte (tuin, kade, plein, binnentuin). Muren naar deze kant worden gevel; naar het niets komt een lage rand. */
  buiten?: boolean;
  /** Rand van een buitenruimte waar geen kamer tegenaan ligt (standaard heg). 'geen' = alleen een onzichtbare grens. */
  rand?: 'heg' | 'hek' | 'reling' | 'muurtje' | 'spijlen' | 'balustrade' | 'geen';
  /** Verdieping (0 = begane grond, 1 = eerste verdieping …). */
  verdieping?: number;
  /** Donkere kamer (griezelgang, kelder): het licht dimt als je erin loopt, alleen fakkels en je lantaarn blijven. */
  donker?: boolean;
  /** Soort muur binnen: behang met lambrisering (standaard) of natuursteen (kasteel). `muur` is dan de steenkleur. */
  muurSoort?: 'behang' | 'steen';
  /** Kleur van de baksteengevel aan deze buitenruimte. */
  gevel?: string;
  /** Hoe de buitenkant van déze kamer eruitziet (standaard die van het gebouw): pleister, vakwerk, steen of baksteen. */
  buitenGevel?: 'pleister' | 'vakwerk' | 'steen' | 'baksteen';
  /** Dak boven deze kamer (als er geen kamer boven ligt). Standaard schilddak als het gebouw daken heeft. */
  dak?: 'schild' | 'zadel' | 'piramide' | 'plat' | 'geen';
  /** Richting van de nok (standaard langs de lange kant). */
  dakNok?: 'x' | 'z';
  /** Kamers met dezelfde naam hier krijgen samen één dak (een lange vleugel). */
  dakDeel?: string;
  /** Geen vloer tekenen (de wereld tekent hier zelf de grond, bv. een pad dat omhoog loopt). */
  zonderVloer?: boolean;
  /** Hoogte van deze ruimte in meters (muren en plafond). Standaard de muurhoogte van het gebouw. Voor hallen, atriums en zalen. */
  hoogte?: number;
  /**
   * Vide: een hoge ruimte die boven lagere buren open is (atrium, markthal met galerij). De muur naar een lagere
   * binnenkamer gaat dan maar tot de hoogte van die buur; daarboven kijk je vrij de ruimte in.
   */
  vide?: boolean;
  /**
   * Open zijden: daar staat geen muur (open loods, galerijstroken die in elkaar overlopen, een hal die overgaat in een plein).
   * 'n' = kant −z, 'z' = kant +z, 'w' = kant −x, 'o' = kant +x. Botsen doe je er dan ook niet.
   */
  open?: ('n' | 'z' | 'w' | 'o')[];
  /** Inkijk: de inrichting binnen blijft zichtbaar als je buiten staat (grote ramen, etalages, open loodsen). */
  inkijk?: boolean;
  /** Galerij (meestal op een verdieping rond een vide): waar geen kamer naast ligt staat een glazen balustrade in plaats van een muur. */
  galerij?: boolean;
  /**
   * Plafond: 'vlak' (standaard), 'glas' (glazen kap met stalen roeden: daglicht of sterren), 'open' (geen plafond: de lucht),
   * 'gewelf' (tongewelf langs de lange kant), 'glasgewelf' (glazen tongewelf met stalen bogen, galleria), 'koepel' / 'glaskoepel'
   * (koepel boven het midden, met een oculus), 'spanten' (vlak met zichtbare balken), 'systeem' (systeemplafond met lichtpanelen).
   * Bij 'glas', 'open', 'glasgewelf' en 'glaskoepel' komt er geen pannendak.
   */
  plafond?: 'vlak' | 'glas' | 'open' | 'gewelf' | 'glasgewelf' | 'koepel' | 'glaskoepel' | 'spanten' | 'systeem';
  /** Kleur van het plafond. Zonder kleur: houten balkenplafond (of steen bij `muurSoort: 'steen'`); met kleur: glad stucwerk in die kleur. */
  plafondKleur?: string;
  /**
   * Kolommen in een raster binnen de kamer (met botsing). `afstand` = [x, z] tussen de kolommen,
   * `rand` = afstand van de eerste kolom tot de muur (standaard de halve afstand). `rond` = ronde zuil.
   */
  kolommen?: { afstand: [number, number]; rand?: [number, number]; dikte?: number; rond?: boolean; kleur?: string };
}

export interface Doorgang {
  /** Midden van de opening op een muurlijn [x, z]. */
  pos: [number, number];
  /** 'x' = de muur loopt langs x (opening in een noord/zuid-muur); 'z' = de muur loopt langs z. */
  as: 'x' | 'z';
  /** Breedte van de opening (standaard 1,6 m). */
  breed?: number;
  /**
   * deur = draaideur, boog = open doorgang, dubbel = dubbele deur,
   * open = helemaal open tot aan het plafond (geen bovenstuk); met `vanaf`/`klus` zit er een rolhek voor dat omhoog gaat,
   * pui = etalagepui: glas van vloer tot 3 m met in het midden schuifdeuren (`deurBreed`),
   * roldeur = brede opening met een roldeur die omhoog rolt (loods, magazijn),
   * raam = glas in de muur (geen doorgang; `borst` = borstwering, 0 = glaswand tot de vloer),
   * valhek = ijzeren valhek dat omhoog schuift (kasteelpoort; standaard 3 m breed en 3,2 m hoog).
   */
  soort?: 'deur' | 'boog' | 'dubbel' | 'open' | 'pui' | 'roldeur' | 'raam' | 'valhek';
  /** Pui: breedte van de schuifdeur in het midden (standaard 2 m). */
  deurBreed?: number;
  /** Hoogte van de opening (daarboven komt muur). Standaard: deur 2,45 · pui 3 · roldeur 3,4 · open tot het plafond · raam 2,4. */
  hoog?: number;
  /** Raam: hoogte van de borstwering (muur onder het glas). 0 = glaswand tot de vloer. Standaard 0,9. Een raam is nooit een doorgang. */
  borst?: number;
  /** Dicht tot deze fase. */
  vanaf?: Fase;
  /** Dicht tot de kluis van deze klus open is. */
  klus?: string;
  /** Verdieping van de doorgang (standaard 0). */
  verdieping?: number;
  /** Intern: vaste sleutel van de deur (voor botsing en openen). */
  sleutel?: string;
}

/**
 * Trap tussen verdieping `van` en `van + 1`. Je loopt er echt op.
 * `pos` = midden [x, z], `as` = looprichting, `richting` = +1 (omhoog naar +as) of −1.
 * Onderaan stap je erop vanaf verdieping `van`, bovenaan stap je eraf op verdieping `van + 1`.
 */
export interface Trap {
  pos: [number, number];
  as: 'x' | 'z';
  richting: 1 | -1;
  lengte: number;
  breed: number;
  van: number;
  /** Gewone trap (standaard) of roltrap (metalen treden, glazen balustrade, zwarte leuning). */
  soort?: 'trap' | 'roltrap';
  /** Dicht (afzetlint, je kunt er niet op) tot deze fase. */
  vanaf?: Fase;
  /** Dicht tot de kluis van deze klus open is. */
  klus?: string;
}

export interface Plattegrond {
  kamers: Kamer[];
  doorgangen: Doorgang[];
  /** De uitgangsdeur (= de poort met sleutelgaten) in een buitenmuur. */
  uitgang: { pos: [number, number]; as: 'x' | 'z' };
  /** Hoogte van de muren (standaard 3 m). */
  muurHoogte?: number;
  /** Kleur van de baksteen aan de buitenkant van het gebouw (standaard rood-bruin). */
  gevel?: string;
  /** Buitenkant van baksteen (standaard), natuursteen (kasteel) of wit pleisterwerk met een stenen plint. */
  gevelSoort?: 'baksteen' | 'steen' | 'pleister';
  /** Schijnwerpers van onderen: een warme gloed op de gevels (van `voet` tot `voet + hoogte`, wereldhoogte). */
  aanlicht?: { kleur: string; hoogte: number; sterkte: number; voet?: number };
  /** Schuine daken met dakpannen boven de bovenste kamers. */
  daken?: { kleur?: string; helling?: number; pleister?: string };
  /** Kantelen bovenop de buitenmuren (kasteel). */
  kantelen?: boolean;
  /** Trappen tussen de verdiepingen. */
  trappen?: Trap[];
  /** Hoogte van één verdieping (standaard muurhoogte + 0,3 m vloer). */
  verdiepingHoogte?: number;
  /** Intern: dit is het deelplan van één verdieping. */
  deelVan?: { plan: Plattegrond; verdieping: number };
}

/** Een klus = een groep verplichte stations (niveau). Elk opgelost station geeft een codecijfer; samen openen ze de kluis. */
export interface Klus {
  id: string;
  /** Korte naam, bv. "Spoor en werkbank". */
  naam: string;
  /** Kleur van het sleutelgat, de codeplaatjes en de ring om de kluis. */
  kleur: string;
  /** 2 tot 4 station-id's (alleen sectie 'niveau'). */
  stations: string[];
  /** Waar de kluis staat. */
  kluis: { pos: [number, number]; rot?: number; verdieping?: number };
}

export type GereedschapSoort = 'trap' | 'tabel' | 'balk' | 'meetlint' | 'lezer';

export interface WereldDef {
  nr: 1 | 2 | 3 | 4 | 5;
  /** "De Wijk" */
  naam: string;
  /** Werkboekonderdeel, bv. "Oriëntatie in 2D en 3D". */
  onderwerp: string;
  /** Kleur van de wereld in de wereldkaart. */
  kleur: string;
  /** Missie in max. 3 korte zinnen (2F) + wie de opdracht geeft. */
  missie: { opdrachtgever: string; regels: string[] };
  /** Kaart "Dit ga je leren" (max. 3 zinnen). */
  leerdoel: string[];
  /** Kaart "Dit kun je nu" na de eindcheck (max. 4 regels). */
  samenvatting: string[];
  /** Hulpmiddel dat je krijgt na "Samen oefenen". */
  gereedschap: { soort: GereedschapSoort; naam: string; uitleg: string };
  /** Teksten onderin bij terugblik en instructie. */
  hintTerugblik: string;
  hintInstructie: string;
  /** Alle opdrachten van deze wereld (werkboek + terugblik/instructie). */
  opdrachten: Record<string, Opdracht>;
  /** Alleen de werkboekopdrachten (zonder terugblik/instructie), in werkboekvolgorde. */
  werkboek: string[];
  stations: Station[];
  klussen: Klus[];
  /** Verstopte lampjes (gratis tips) [x, z] of [x, z, verdieping]. 6–9 stuks, een beetje uit het zicht. */
  lampjes: ([number, number] | [number, number, number])[];
  spawn: [number, number];
  /** Eiland [breedte, diepte] in meters. */
  eiland: [number, number];
  /** Poort: midden [x, z] en draaiing (0 = doorgang langs de z-as, voorkant naar +z). */
  poort: { pos: [number, number]; rot: number };
  /** Vast decor (wordt samengevoegd tot weinig meshes). Geen useFrame/klikken hierin. */
  Decor: FC;
  /** Bewegend of klikbaar decor (water, kranen, schermen). */
  Levend?: FC;
  /** Botsingen en verhoogde vlakken van het decor (stations, kluizen en poort doet de motor). */
  registreer: () => void;
  /** Achtergrond (CSS) achter het eiland. */
  lucht?: string;
  /** Gebouw met kamers (poppenhuis-stijl). Zonder plan is het een buiteneiland. */
  plan?: Plattegrond;
  /** Licht en lucht van deze wereld (tijd van de dag, mist, maan of zon). */
  sfeer?: Sfeer;
  /** Verouderd: het spel is altijd door je eigen ogen (first person). Dit veld wordt genegeerd. */
  camera?: 'eerste' | 'derde';
  /** Landschap rondom het gebouw (terrein, bos, water, besneeuwde rotsen). Vervangt de houten sokkel. Mag useFrame gebruiken. */
  Omgeving?: FC;
  /** Het maatje van deze wereld: zweeft aan en geeft alle uitleg. */
  maatje?: Maatje;
}

/** Maatje (sidekick): komt aanzweven en legt alles uit, van de start tot de tips. */
export interface Maatje {
  /** Naam, bv. "Boo". */
  naam: string;
  /** Wie is het? bv. "het kasteelspook". */
  wie: string;
  /** Kleur van de tekstballon. */
  kleur: string;
  /** 3D-model: ± 1 m hoog, voeten/onderkant rond y = −0,5, midden rond de oorsprong, kijkt naar +z. Mag useFrame gebruiken (vleugels, knipperen). */
  Model: FC;
  /** Startgesprek: pagina's met 1–3 korte zinnen (2F). De missie en de knoppen komen er vanzelf achter. */
  intro: string[][];
  /** Korte uitroepen bij een gevonden code, lampje of open kluis, bv. "Boe-ja!". */
  goed?: string[];
}

/** Lichtsfeer van een wereld. */
export interface Sfeer {
  /** CSS-achtergrond achter het diorama. */
  achtergrond: string;
  /** Mist [kleur, begin, eind]; begin en eind in meters áchter het poppetje (vanaf de camera gezien). */
  mist?: [string, number, number];
  /** Hemellicht [lucht, grond, sterkte]. */
  hemel?: [string, string, number];
  /** Zon of maan [kleur, sterkte]. */
  zon?: [string, number];
  /** Richting van zon of maan (standaard [28, 42, 22]). */
  zonRichting?: [number, number, number];
  /** Warm lampje boven het poppetje (standaard 16, 0 = uit). */
  lantaarn?: number;
  /** Sterkte van de reflecties (standaard 0,2). */
  glans?: number;
  /** Echte omgevingsopname (HDRI, CC0 van Poly Haven via @pmndrs/assets) voor reflecties en zacht licht. */
  hdri?: Hdri;
  /** Werpt de zon (of maan) schaduw? Standaard ja. In een donkere wereld met zaklamp scheelt uit veel tekenwerk. */
  schaduw?: boolean;
  /** Zaklamp: het poppetje schijnt met een lichtbundel vooruit (donkere werelden). */
  zaklamp?: { sterkte?: number; kleur?: string; hoek?: number; bereik?: number };
}
