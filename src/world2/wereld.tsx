// Wereld 2 – Het Spookkasteel (werkboekonderdeel 2: Oriëntatie in de 2D- en 3D-wereld). Maatje: Boo, het kasteelspook.
import type { WereldDef } from '../werelden/types';
import { KLUSSEN, LAMPJES } from './klussen';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';
import { PLAN, SPAWN } from './huis';
import { FrankNPC } from './FrankNPC';
import { registreerDecor, Wereld2Decor, Wereld2Donjon, Wereld2Levend } from './Wereld2';
import { Wereld2Omgeving } from './Omgeving';
import { Boo } from './Boo';

export const wereld2: WereldDef = {
  nr: 2,
  naam: 'Het Spookkasteel',
  onderwerp: 'Oriëntatie in 2D en 3D',
  kleur: '#9b7be0',
  missie: {
    opdrachtgever: 'Boo, het kasteelspook',
    regels: ['Het is Halloween. De achterpoort van Slot Maansteyn zit op slot.', 'Drie sleutels liggen in drie kluizen.', 'Vind de codes, open de kluizen en vaar weg met de boot.'],
  },
  leerdoel: ['Je rekent met omtrek, oppervlakte en inhoud.', 'Je rekent maten om met de trap.', 'Zo open je de kluizen van het kasteel.'],
  samenvatting: ['Omtrek: tel alle zijden op.', 'Oppervlakte: lengte × breedte.', 'Inhoud: lengte × breedte × hoogte.', 'Omrekenen: gebruik de trap.'],
  gereedschap: { soort: 'trap', naam: 'Eenhedentrap', uitleg: 'Elke tree omlaag is × 10. Bij m² is het × 100, bij m³ × 1000.' },
  hintTerugblik: 'Volg het bospad en loop over de brug naar de poort. In de poortzaal staat de goudkist van de graaf. Tik op het oranje icoon.',
  hintInstructie: 'Kijk, de deur naar de uitlegkamer is open! Loop erheen.',
  opdrachten: OPDRACHTEN,
  werkboek: WERKBOEK,
  stations: STATIONS,
  klussen: KLUSSEN,
  lampjes: LAMPJES,
  spawn: SPAWN,
  eiland: [48, 40],
  poort: { pos: PLAN.uitgang.pos, rot: 0 },
  plan: PLAN,
  Decor: Wereld2Decor,
  Levend: () => (
    <>
      <Wereld2Levend />
      <Wereld2Donjon />
      <FrankNPC />
    </>
  ),
  Omgeving: Wereld2Omgeving,
  maatje: {
    naam: 'Boo',
    wie: 'het kasteelspook',
    kleur: '#c9b6ff',
    Model: Boo,
    intro: [
      ['Boe! Schrik maar niet.', 'Ik ben Boo, het spook van dit kasteel.'],
      ['Dit is Slot Maansteyn.', 'Het staat op een rots, midden in een meer.'],
      ['Het is Halloween. De achterpoort zit op slot.', 'Daar ligt de boot naar huis. Je hebt drie sleutels nodig.'],
      ['De sleutels liggen in drie kluizen.', 'Los de rekenraadsels op. Zo vind je de codes.'],
      ['Het is donker in het bos. Je hebt een zaklamp.', 'Hij schijnt waar je heen loopt.'],
      ['Ik zweef met je mee en ik help je.', 'Kom! Volg het bospad en loop over de brug naar de poort.'],
    ],
    goed: ['Boe-ja!', 'Spookachtig goed!', 'Joehoe!', 'Griezelig knap!'],
  },
  camera: 'eerste',
  sfeer: {
    // nacht boven het Nevelmeer; de maan staat laag in het noorden, achter de donjon
    achtergrond: 'linear-gradient(180deg, #08122c 0%, #10204f 38%, #2c4f9a 68%, #5283d4 86%, #22304a 100%)',
    mist: ['#141e3c', 14, 58],
    hemel: ['#6f8fd8', '#141c30', 0.34],
    zon: ['#a9bcff', 0.62],
    zonRichting: [-14, 40, -38],
    lantaarn: 0,
    glans: 0.14,
    schaduw: false,
    zaklamp: { sterkte: 150, kleur: '#fff3dc', bereik: 26 },
  },
  registreer: registreerDecor,
};
