// Wereld 3 – De Markthal (werkboekonderdeel 3: Verhouding herkennen en gebruiken).
// "De Markthal aan de Waag": een ijzeren hal met glazen gewelf, galerij en De Waag (plattegrond in huis.ts),
// aan een stadsplein tussen twee grachten (Omgeving.tsx). Vrijdag, half zes: het gouden uur voor de zaterdagmarkt.
// Ontwerp: docs/ontwerp/wereld3.md.
import type { WereldDef } from '../werelden/types';
import { KLUSSEN, LAMPJES } from './klussen';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';
import { PLAN, SPAWN } from './huis';
import { MarkthalDecor, MarkthalLevend, registreerDecor } from './Markthal';
import { Mo } from './Mo';
import { MarkthalOmgeving } from './Omgeving';

export const wereld3: WereldDef | null = {
  nr: 3,
  naam: 'De Markthal',
  onderwerp: 'Verhouding herkennen en gebruiken',
  kleur: '#e48a3a',
  missie: {
    opdrachtgever: 'Mo, de keukenmuis van de Markthal',
    regels: [
      'Zaterdag is de grote markt. Maar de deur naar de brug zit op slot.',
      'De drie sleutels liggen in drie kluizen: bij de kaas, in de open keuken en op de laadkade.',
      'Reken prijzen en recepten na. Elke goede som geeft een code voor een kluis.',
    ],
  },
  leerdoel: ['Je herkent een verhouding, zoals 3 : 2.', 'Je rekent met de verhoudingstabel.', 'Zo help je de markt van zaterdag.'],
  samenvatting: ['6 : 4 is dezelfde verhouding als 3 : 2.', 'Tabel: wat je boven doet, doe je ook onder.', 'Vergelijk prijzen per stuk, per kg of per uur.', 'Schaal 1 : 500: 1 cm op de kaart is 500 cm echt.'],
  gereedschap: { soort: 'tabel', naam: 'Verhoudingstabel', uitleg: 'Wat je boven doet, doe je ook onder: keer of gedeeld door hetzelfde getal.' },
  hintTerugblik: 'Loop naar de eierkraam op het plein. Tik op het oranje icoon.',
  hintInstructie: 'De deur van de kookschool is open. Loop erheen.',
  opdrachten: OPDRACHTEN,
  werkboek: WERKBOEK,
  stations: STATIONS,
  klussen: KLUSSEN,
  lampjes: LAMPJES,
  spawn: SPAWN,
  eiland: [64, 56],
  poort: { pos: PLAN.uitgang.pos, rot: 0 },
  plan: PLAN,
  Decor: MarkthalDecor,
  Levend: MarkthalLevend,
  Omgeving: MarkthalOmgeving,
  sfeer: {
    achtergrond: 'linear-gradient(180deg, #3b3560 0%, #7d4f7a 26%, #d9776a 52%, #f4a964 74%, #fbd49a 100%)',
    mist: ['#d78a72', 26, 85],
    hemel: ['#ffd8b4', '#5a4446', 0.78],
    zon: ['#ffb877', 2.05],
    zonRichting: [-36, 22, 16],
    lantaarn: 14,
    glans: 0.24,
  },
  registreer: registreerDecor,
  // Het maatje: Mo, de keukenmuis die in een vliegende theekop rondzweeft.
  maatje: {
    naam: 'Mo',
    wie: 'de keukenmuis van de Markthal',
    kleur: '#ff7a4d',
    Model: Mo,
    intro: [
      ['Piep! Hallo!', 'Ik ben Mo, de keukenmuis van de Markthal.', 'Ik vlieg rond in mijn theekop.'],
      ['Zaterdag is de grote markt.', 'Maar de deur naar de brug zit op slot.', 'De drie sleutels liggen in drie kluizen.'],
      ['Reken prijzen en recepten na.', 'Elke goede som geeft een code.', 'Met de codes open je de kluizen.'],
      ['Met drie sleutels gaat de deur open.', 'Ik vlieg met je mee en help je!'],
    ],
    goed: ['Heerlijk gedaan!', 'Smullen, dat klopt!', 'Piep! Helemaal goed!', 'Dat is een topgerecht!'],
  },
};
