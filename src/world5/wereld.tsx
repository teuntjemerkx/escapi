// Wereld 5 – De Controlekamer (werkboekonderdeel 5: Omgaan met kwantitatieve informatie).
// Gebouwd als Meetstation Noorderlicht: een meetstation op een bergrichel (zie docs/ontwerp/wereld5.md).
import type { WereldDef } from '../werelden/types';
import { PLAN, SPAWN } from './huis';
import { KLUSSEN, LAMPJES } from './klussen';
import { Bliep } from './Bliep';
import { Wereld5Omgeving } from './Omgeving';
import { OPDRACHTEN, STATIONS, WERKBOEK } from './stations';
import { registreerDecor, Wereld5Decor, Wereld5Levend } from './Wereld5';

export const wereld5: WereldDef = {
  nr: 5,
  naam: 'De Controlekamer',
  onderwerp: 'Tabellen, grafieken en formules',
  kleur: '#5a8dee',
  missie: {
    opdrachtgever: 'Bliep, de robot van het meetstation',
    regels: ['De sneeuwstorm heeft alle systemen platgelegd.', 'Lees de tabellen en grafieken en vind de codes.', 'Zet drie systemen aan. Dan haalt de helikopter je op.'],
  },
  leerdoel: ['Je leest tabellen en grafieken goed af.', 'Je rekent met formules en procenten.', 'Zo zet je de systemen weer aan.'],
  samenvatting: [
    'Tabel: zoek eerst de goede rij en kolom.',
    'Grafiek: kijk hoeveel één hokje op de as is.',
    'Cirkeldiagram: reken het deel uit van het totaal.',
    'Formule: vul de getallen in, haakjes eerst.',
  ],
  gereedschap: { soort: 'lezer', naam: 'Aflees-loep', uitleg: 'Zoek je getal op de as. Volg de hulplijn naar de lijn of staaf en lees af op de andere as.' },
  hintTerugblik: 'Loop door de sluis naar binnen. De koffiekar staat in de hal. Tik op het oranje icoon.',
  hintInstructie: 'De deur naar de uitlegkamer is open. Hij zit links in de hal.',
  opdrachten: OPDRACHTEN,
  werkboek: WERKBOEK,
  stations: STATIONS,
  klussen: KLUSSEN,
  lampjes: LAMPJES,
  spawn: SPAWN,
  eiland: [52, 44],
  camera: 'eerste',
  poort: { pos: PLAN.uitgang.pos, rot: 0 },
  plan: PLAN,
  Decor: Wereld5Decor,
  Levend: Wereld5Levend,
  // Een meetstation op een bergrichel: heldere, koude nacht met noorderlicht en blauw maanlicht. Het dal ligt diep onder je.
  Omgeving: Wereld5Omgeving,
  sfeer: {
    hdri: 'lab',
    achtergrond:
      'radial-gradient(70% 40% at 26% 12%, rgba(70, 255, 170, 0.34) 0%, rgba(70, 255, 170, 0) 70%), radial-gradient(60% 36% at 72% 8%, rgba(170, 95, 255, 0.32) 0%, rgba(170, 95, 255, 0) 70%), radial-gradient(90% 42% at 50% 24%, rgba(60, 210, 200, 0.16) 0%, rgba(60, 210, 200, 0) 75%), linear-gradient(180deg, #07122a 0%, #0c1d3a 45%, #0a1630 70%, #050a16 100%)',
    mist: ['#0d1a33', 45, 270],
    hemel: ['#aac0e8', '#2c3142', 0.52],
    zon: ['#c6d6ff', 1.4],
    zonRichting: [-22, 42, 26],
    lantaarn: 18,
    glans: 0.24,
    // 's nachts zie je maanschaduw nauwelijks; zonder schaduw scheelt het een hele tekenronde (Chromebook)
    schaduw: false,
  },
  registreer: registreerDecor,
  // Het maatje: Bliep, de kleine robot-drone van het meetstation (muts en sjaal tegen de kou).
  maatje: {
    naam: 'Bliep',
    wie: 'de robot van het meetstation',
    kleur: '#6fe8c0',
    Model: Bliep,
    intro: [
      ['Bliep-bliep! Hallo!', 'Ik ben Bliep, de robot van Meetstation Noorderlicht.'],
      ['Er was een zware sneeuwstorm.', 'Nu werkt alles op noodstroom.', 'Daarom is het licht rood.'],
      ['Kijk achter je, naar beneden.', 'Het dorp in het dal is helemaal donker.', 'Wij geven het dorp stroom.'],
      ['Jij kunt tabellen en grafieken wel lezen.', 'Elke goede som geeft een code.', 'Met de codes open je drie kluizen.'],
      ['In elke kluis zit een sleutel voor de uitgang.', 'Daarachter wacht de helikopter.', 'Ik vlieg met je mee!'],
    ],
    goed: ['Bliep-bliep, correct!', 'Piep! Helemaal goed!', 'Systeem blij!', 'Data klopt!'],
  },
};
