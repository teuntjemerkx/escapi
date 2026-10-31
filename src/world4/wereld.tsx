// Wereld 4 – Het Winkelcentrum (werkboekonderdeel 4: Procenten gebruiken).
// Winkelcentrum De Honderd: een kruisvormige passage met een glazen koepel van 100 ruiten (ontwerp: docs/ontwerp/wereld4.md).
import type { WereldDef } from '../werelden/types';
import { KLUSSEN, LAMPJES } from './klussen';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';
import { PLAN, SPAWN } from './huis';
import { registreerDecor, Wereld4Decor, Wereld4Levend } from './Wereld4';
import { Wereld4Omgeving } from './Omgeving';
import { Sjors } from './sjors';

export const wereld4: WereldDef | null = {
  nr: 4,
  naam: 'Het Winkelcentrum',
  onderwerp: 'Procenten gebruiken',
  kleur: '#e86f8a',
  missie: {
    opdrachtgever: 'Sjors, het spaarvarken',
    regels: [
      'Het is 21.00 uur. Winkelcentrum De Honderd is net dicht en jij bent nog binnen.',
      'Morgen is de Kortingsdag, maar de prijzencomputer is kapot: alle borden moeten weer kloppen.',
      'Reken de procenten uit, open de drie kluizen en ga door de hoofdingang naar buiten.',
    ],
  },
  maatje: {
    naam: 'Sjors',
    wie: 'het vliegende spaarvarken',
    kleur: '#2ee6ff',
    Model: Sjors,
    intro: [
      ['Ding-dong! "Het winkelcentrum is gesloten."', 'Oei, jij bent nog binnen! Ik ben Sjors, het spaarvarken van De Honderd.'],
      ['De lift is uit en de rolhekken zijn dicht.', 'Maar kijk recht vooruit: helemaal achteraan is de hoofdingang.'],
      ['Morgen is de Kortingsdag. De prijzencomputer is kapot.', 'Dus wij rekenen alle prijzen en borden na.'],
      ['Zie je de koepel? Hij heeft honderd ruiten.', 'Elke goede som zet ruiten aan. Honderd procent is alles!'],
      ['Met de codes open je drie kluizen. Daarin liggen de sleutels van de hoofdingang.', 'Ik vlieg met je mee en help je.'],
    ],
    goed: ['Kassa! Goed zo!', 'Ka-tsjing!', 'Knor, knor, top!', 'Dat is pure winst!'],
  },
  leerdoel: ['Je rekent met procenten: korting, rente en btw.', 'Je gebruikt de procentenbalk: 100% is het geheel.', 'Zo help je Sjors en open je de kluizen.'],
  samenvatting: ['100% is het hele bedrag.', '10% is delen door 10. 1% is delen door 100.', 'Korting haal je eraf. Btw en rente tel je erbij.', 'Hoeveel procent? Deel : geheel × 100.'],
  gereedschap: { soort: 'balk', naam: 'Procentenbalk', uitleg: 'Boven staan de procenten, onder de getallen. 100% is het geheel. Reken eerst 10% of 1% uit.' },
  hintTerugblik: 'Loop naar de reep chocola bij de liften. Tik op het oranje icoon.',
  hintInstructie: 'De klantenservice is open (rechts). Loop naar de kortingsscanner.',
  opdrachten: OPDRACHTEN,
  werkboek: WERKBOEK,
  stations: STATIONS,
  klussen: KLUSSEN,
  lampjes: LAMPJES,
  spawn: SPAWN,
  eiland: [68, 77],
  poort: { pos: PLAN.uitgang.pos, rot: 0 },
  plan: PLAN,
  Decor: Wereld4Decor,
  Levend: Wereld4Levend,
  Omgeving: Wereld4Omgeving,
  // blauw uur in de stad: diepblauwe lucht boven het glas, warme lantaarns en roze/cyaan neon
  sfeer: {
    achtergrond: 'radial-gradient(120% 95% at 50% 22%, #4b4f9a 0%, #262a63 45%, #0d0e24 100%)',
    mist: ['#1f2148', 26, 88],
    hemel: ['#c8ccff', '#3a3040', 0.82],
    zon: ['#cfd4ff', 1.1],
    zonRichting: [-24, 40, 20],
    lantaarn: 14,
    glans: 0.3,
    schaduw: false,
  },
  registreer: registreerDecor,
};
