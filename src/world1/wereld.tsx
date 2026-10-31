// Wereld 1 – De Haven (werkboekonderdeel 1: Eenheden en grootheden): De Ellehaven.
// Een compacte Hollandse haven rond één havenkom, van het gouden uur (19.40) naar het blauwe uur (21.30, hoogwater).
import type { WereldDef } from '../werelden/types';
import { KLUSSEN, LAMPJES } from './klussen';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';
import { PLAN, SPAWN } from './huis';
import { HavenLevend, registreerDecor, Wereld1Decor } from './Wereld1';
import { Wereld1Omgeving } from './Omgeving';
import { Mees } from './Mees';
import { ZON_RICHTING } from './sfeer';

export const wereld1: WereldDef | null = {
  nr: 1,
  naam: 'De Haven',
  onderwerp: 'Eenheden en grootheden',
  kleur: '#4f9fd6',
  missie: {
    opdrachtgever: 'Mees, de havenmeeuw',
    regels: ['Om half tien is het hoogwater. Dan vaart De Eenheid uit.', 'Maar de maten van de lading kloppen niet.', 'Open de drie kluizen. Dan gaat de poort naar het schip open.'],
  },
  maatje: {
    naam: 'Mees',
    wie: 'de havenmeeuw',
    kleur: '#5fb8e8',
    Model: Mees,
    intro: [
      ['Ahoy! Ik ben Mees, de meeuw van de Ellehaven.', 'Ik ken hier elke kade en elke bolder.'],
      ['Kijk, daar ligt De Eenheid.', 'Om half tien is het hoogwater. Dan vaart ze uit.'],
      ['Maar de maten van de lading kloppen niet.', 'Reken ze om met de eenhedentrap.'],
      ['Zie je de seinmast bij het schip?', 'Elke open kluis zet daar een licht aan.'],
    ],
    goed: ['Ahoy, goed zo!', 'Krijs! Top gedaan!', 'Volle kracht vooruit!', 'Wat een vangst!'],
  },
  leerdoel: ['Je kiest de goede eenheid bij lengte, inhoud en gewicht.', 'Je rekent maten om met de eenhedentrap.', 'Zo krijgt het schip op tijd zijn lading.'],
  samenvatting: ['Lengte: km, m, cm en mm.', 'Inhoud: liter, cl en ml. 1 dm³ = 1 liter.', 'Gewicht: kg, g en mg.', 'Omrekenen: trap omlaag is ×, omhoog is :.'],
  gereedschap: { soort: 'trap', naam: 'Eenhedentrap', uitleg: 'Elke tree omlaag is × 10, omhoog is : 10. Bij m² is het 100, bij m³ 1000.' },
  hintTerugblik: 'Loop naar de pallet bij de waterbus. Tik op het oranje icoon.',
  hintInstructie: 'De deur van het havenkantoor is open. Loop naar binnen.',
  opdrachten: OPDRACHTEN,
  werkboek: WERKBOEK,
  stations: STATIONS,
  klussen: KLUSSEN,
  lampjes: LAMPJES,
  spawn: SPAWN,
  eiland: [90, 79],
  poort: { pos: PLAN.uitgang.pos, rot: 0 },
  plan: PLAN,
  Decor: Wereld1Decor,
  Levend: HavenLevend,
  Omgeving: Wereld1Omgeving,
  // Basis: het gouden uur. FaseSfeer (sfeer.tsx) schuift per fase op naar het blauwe uur.
  sfeer: {
    hdri: 'sunset',
    achtergrond: 'linear-gradient(180deg, #5f8fc4 0%, #8fb2d8 30%, #e9c7a4 52%, #f3c99a 58%, #8a6f62 70%, #3a3340 100%)',
    mist: ['#e9c7a4', 45, 170],
    hemel: ['#cfe0f5', '#6a5644', 0.9],
    zon: ['#ffc98a', 2.2],
    zonRichting: ZON_RICHTING,
    lantaarn: 8,
    glans: 0.32,
  },
  registreer: registreerDecor,
};
