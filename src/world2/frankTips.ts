// Wat Frank vertelt. Geen losse grapjes, maar uitleg die past bij waar je bent en waar je mee bezig bent:
// zit je vast bij een opdracht, dan legt hij uit hoe dat soort som werkt (nooit het antwoord). Anders vertelt hij
// waar je volgende opdracht ligt, of rekent hij iets voor aan de kamer waar je staat (met echte maten).
import type { Opdracht } from '../data/schema';
import { kamerOp } from '../game/huis';
import { speler, useSpel } from '../game/store';
import { isKlaar, isOpen, volgendDoel } from '../game/voortgang';
import { nl } from '../lib/getal';
import { huidig, stationsVan } from '../werelden';
import type { Kamer, Station } from '../werelden/types';

export const FRANK_HOI =
  'Sst… Ik ben Frank. Hier, in mijn tuin, doe ik je niets. Zit je ergens vast? Blijf even staan, dan leg ik het uit.';

const VERDIEPING = ['op de begane grond', 'op de eerste verdieping', 'op de tweede verdieping'];
const waar = (v: number) => (v < 0 ? 'in de kelder' : VERDIEPING[v] ?? 'boven in de donjon');
/** Buiten sta je óp iets: "op de binnenplaats", "op het kerkhof". */
const OP_HET = new Set(['kerkhof', 'balkon']);
/** "in de poortzaal", "op de walgang", "in de kamer van de bouwmeester", "in torenhal B". */
const inDe = (k: Kamer) => {
  if (/meester$/i.test(k.naam)) return `in de kamer van de ${k.naam.toLowerCase()}`;
  const naam = k.naam.replace(/^[A-Z][a-z]/, (x) => x.toLowerCase());
  if (k.buiten) return `${OP_HET.has(k.id) ? 'op het' : 'op de'} ${naam}`;
  if (/ [A-Z]$/.test(k.naam)) return `in ${naam}`;
  return `in de ${naam}`;
};

const LITER = ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'];
const GEWICHT = ['ton', 'kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'];

/** Bij lengte: welke stap op de trap hoort bij deze twee maten? */
function lengteFeit(a: string, b: string) {
  const heeft = (x: string, y: string) => (a === x && b === y) || (a === y && b === x);
  if (a === 'km' || b === 'km') return '1 km is 1000 m';
  if (heeft('m', 'dm')) return '1 m is 10 dm';
  if (heeft('dm', 'cm')) return '1 dm is 10 cm';
  if (heeft('cm', 'mm')) return '1 cm is 10 mm';
  if (heeft('m', 'mm')) return '1 m is 1000 mm';
  if (heeft('dm', 'mm')) return '1 dm is 100 mm';
  return '1 m is 100 cm';
}

/** Een zin over de eenhedentrap die past bij de maten die je moet omrekenen. */
function trapZin(o: Opdracht, tekst: string): string | null {
  const t = o.stappen.find((x) => x.trap)?.trap;
  const literGevraagd = /liter/.test(o.antwoord?.eenheid ?? '') || /hoeveel liter/.test(tekst);
  let soort: 'liter' | 'm3' | 'm2' | 'gewicht' | 'lengte' | null = null;
  if (t) {
    const maten = [t.van, t.naar];
    if (maten.some((m) => LITER.includes(m))) soort = 'liter';
    else if (maten.some((m) => m.includes('³'))) soort = 'm3';
    else if (maten.some((m) => m.includes('²'))) soort = 'm2';
    else if (maten.some((m) => GEWICHT.includes(m))) soort = 'gewicht';
    else soort = 'lengte';
  } else if (o.paneel === 'eenhedentrap') {
    if (/liter|\b(ml|cl|dl)\b/.test(tekst)) soort = 'liter';
    else if (/m³/.test(tekst)) soort = 'm3';
    else if (/m²/.test(tekst)) soort = 'm2';
    else if (/\b(ton|kg|gram)\b/.test(tekst)) soort = 'gewicht';
    else soort = 'lengte';
  }
  switch (soort) {
    case 'liter':
      return 'Elke tree op de trap van de liters is × 10. En 1 liter is 1 dm³, 1 ml is 1 cm³.';
    case 'm3':
      return (t ? [t.van, t.naar].includes('m³') : /\bm³/.test(tekst))
        ? 'Bij inhoud is elke tree op de trap × 1000. Dus 1 m³ is 1000 dm³, en dat is 1000 liter.'
        : 'Bij inhoud is elke tree op de trap × 1000. Dus 1 dm³ is 1000 cm³, en dat is precies 1 liter.';
    case 'm2':
      return 'Bij m² is elke tree op de trap × 100. Dus 1 m² is 10.000 cm².';
    case 'gewicht':
      return '1 ton is 1000 kg en 1 kg is 1000 gram.';
    case 'lengte':
      if (literGevraagd) return 'Reken de maten eerst om naar dm. Dan krijg je dm³, en 1 dm³ is precies 1 liter.';
      return `Bij lengte is elke tree op de trap × 10. Dus ${t ? lengteFeit(t.van, t.naar) : '1 m is 100 cm'}.`;
    default:
      return null;
  }
}

/** Korte uitleg bij het soort som: hoe pak je het aan (nooit het antwoord). */
export function uitlegVoor(o: Opdracht): string {
  if (o.paneel === 'kruissom') return 'Begin bij een rij of kolom met maar één leeg vakje. Die kun je meteen uitrekenen. Kijk daarna welke tegels er nog over zijn.';
  const t = o.vraag.join(' ').toLowerCase();
  const eenheid = o.antwoord?.eenheid ?? '';
  const delen: string[] = [];
  const opp = 'Oppervlakte is lengte × breedte. Zet eerst alle maten in dezelfde eenheid.';
  const maten = /\b(lang|breed|hoog|diep|dik)\b|\d bij \d|vloer/.test(t);
  const perM2 = /zakje/.test(t) ? 'Kijk goed hoeveel m² je met 1 zakje doet. Maak dan een verhoudingstabel.' : 'Kijk goed wat er bij 1 m² hoort. Maak dan een verhoudingstabel.';
  // alleen omrekenen (een maat in m² of cm² staat al in de vraag)? dan geen uitleg over lengte × breedte
  const alleenOmrekenen = o.paneel === 'eenhedentrap' && /\d\s*(k|c|d|m)?m²/.test(t) && !maten;
  if (o.paneel === 'formule') delen.push('Schrijf eerst de formule op. Vul de getallen één voor één in. Let goed op hoe je moet afronden.');
  else if (/weeg|gewicht/.test(t)) delen.push('Reken eerst uit hoeveel kilo het is. Daarna reken je om naar ton.');
  else if (/²/.test(eenheid)) {
    if (!alleenOmrekenen) delen.push(opp);
    if (/let op|eraf|zit een|geen gras/.test(t)) delen.push('Lees goed wat er niet bij hoort: dat haal je er daarna af.');
  }
  else if ((/³|liter/.test(eenheid) || /liter|past erin|inhoud/.test(t)) && maten) delen.push('Inhoud is lengte × breedte × hoogte. Zet eerst alle maten in dezelfde eenheid.');
  else if (/omtrek|rondom|\bhek(je|jes|ken)?\b|omheen|tape rond|\brand\b/.test(t)) delen.push('Omtrek is de lengte van de hele rand. Tel alle zijden bij elkaar op.');
  else if (/kaart|plattegrond|tekening/.test(t) && /1 cm/.test(t))
    delen.push('Maak een verhoudingstabel: boven de cm op de kaart, onder de afstand in het echt. Wat je boven doet, doe je ook onder.');
  else if (/per uur/.test(t)) delen.push('Maak een verhoudingstabel: boven de kilometers, onder de minuten. En 1 uur is 60 minuten.');
  else if (/\buur\b|minuten|reis|duurt/.test(t)) delen.push('Reken de tijd in stukjes: eerst tot het volgende hele uur, dan de rest. 1 uur is 60 minuten.');
  else if (/hoe groot|m²|oppervlakte|vloer|laminaat|verft|gras|tegels/.test(t)) {
    const gegeven = /\d m²/.test(t);
    if (!(gegeven && /per m²|met 1 /.test(t))) delen.push(opp);
    if (/per m²|met 1 /.test(t)) delen.push(perM2);
  } else if (/uitgevouwen|uitslag|vouw/.test(t)) delen.push('Een uitslag is een opengevouwen 3D-figuur. Vouw hem in gedachten dicht: welke vlakken komen tegenover elkaar?');
  else if (/3d|figuur/.test(t)) delen.push('Kijk naar de vlakken. Een kubus heeft 6 vierkante vlakken. Een cilinder heeft 2 ronde vlakken en een gebogen kant.');
  else if (/vorm|perk/.test(t)) delen.push('Tel de hoeken en de zijden. Een driehoek heeft 3 hoeken. Een vierkant heeft 4 gelijke zijden en 4 rechte hoeken.');
  if (/zakje/.test(t)) delen.push('Je kunt geen half zakje kopen: rond naar boven af.');
  const trap = trapZin(o, t);
  if (trap) delen.push(trap);
  if (delen.length) return delen.slice(0, 2).join(' ');
  switch (o.paneel) {
    case 'deelsommen':
      return 'Deel het in kleinere stukken en reken elk stuk apart uit. Kijk dan of je de stukken moet optellen of aftrekken.';
    case 'verhoudingstabel':
      return 'Maak een verhoudingstabel. Wat je boven doet, doe je ook onder.';
    case 'keuze':
      return 'Lees eerst alle antwoorden. Streep weg wat zeker niet kan, en kies dan.';
    case 'koppel':
      return 'Kijk goed naar de vorm. Tel de hoeken, de zijden of de vlakken.';
    case 'getallenlijn':
      return 'Zet de getallen op de getallenlijn. Links is kleiner, rechts is groter.';
    default:
      return 'Schrijf elke stap op. Wat weet je al, en wat moet je nog uitrekenen?';
  }
}

/** Afstand tot een station, met een flinke straf voor een andere verdieping. */
const afstandTot = (st: Station) => Math.hypot(st.pos[0] - speler.pos.x, st.pos[1] - speler.pos.z) + Math.abs((st.verdieping ?? 0) - speler.verdieping) * 15;

/** Zat je vast bij een opdracht (2 keer of vaker fout, nog niet goed)? Dan de dichtstbijzijnde. */
function vastgelopen(): { st: Station; o: Opdracht } | null {
  const def = huidig();
  const { voortgang } = useSpel.getState();
  let beste: { st: Station; o: Opdracht; d: number } | null = null;
  for (const st of stationsVan(def)) {
    if (st.rol) continue;
    for (const id of st.opdrachten) {
      const v = voortgang[id];
      const o = def.opdrachten[id];
      if (!o || !v || v.goed || v.pogingen < 2) continue;
      const d = afstandTot(st);
      if (!beste || d < beste.d) beste = { st, o, d };
    }
  }
  return beste;
}

/** Waar moet je nu heen? Het station waar het spel je heen stuurt, of anders het dichtstbijzijnde dat nog open staat. */
function wegwijzer(): string | null {
  const def = huidig();
  const plan = def.plan;
  if (!plan) return null;
  const s = useSpel.getState();
  const doel = volgendDoel(s.fase, s.voortgang);
  if (doel === 'poort') return 'Je hebt alles gedaan wat nodig is! Ga nu naar de poort om het kasteel uit te komen.';
  let st = doel ? stationsVan(def).find((x) => x.id === doel) : undefined;
  if (!st) {
    const open = stationsVan(def).filter((x) => x.rol !== 'terugblik' && x.rol !== 'instructie' && isOpen(x, s.fase, false, s.voortgang) && !isKlaar(x, s.voortgang, s.fase));
    st = open.sort((a, b) => afstandTot(a) - afstandTot(b))[0];
  }
  if (!st) return null;
  const v = st.verdieping ?? 0;
  const k = kamerOp(plan, st.pos[0], st.pos[1], v);
  const hier = kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping);
  const wat = st.rol === 'kluis' ? `Je hebt alle codes voor de ${st.titel.replace(/^Kluis: /, 'kluis van ').toLowerCase()}` : `Ga naar de opdracht ${st.titel}`;
  if (k && hier && k === hier) return `${wat}. Die is ${k.buiten ? 'hier vlakbij' : 'hier in deze kamer'}. Zoek het icoontje!`;
  if (k) return `${wat}. Die vind je ${inDe(k)}, ${waar(v)}.`;
  return `${wat}. Volg het icoontje.`;
}

let weetjeNr = 0;
/** Een som met de echte maten van de kamer waar je staat. */
function kamerWeetje(): string | null {
  const plan = huidig().plan;
  if (!plan) return null;
  const k = kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping);
  if (!k || k.zonderVloer) return null;
  const l = Math.max(k.maat[0], k.maat[1]);
  const b = Math.min(k.maat[0], k.maat[1]);
  const h = k.hoogte ?? plan.muurHoogte ?? 3.2;
  const plek = k.buiten ? 'Dit stuk' : 'Deze kamer';
  const n = k.buiten ? 0 : weetjeNr++ % 3;
  if (n === 0) return `${plek} is ${nl(l)} m lang en ${nl(b)} m breed. De vloer is dus ${nl(l)} × ${nl(b)} = ${nl(l * b)} m². Dat is oppervlakte!`;
  if (n === 1) return `Loop je een rondje langs alle muren? Dan loop je ${nl(l)} + ${nl(b)} + ${nl(l)} + ${nl(b)} = ${nl(2 * l + 2 * b)} meter. Dat is de omtrek.`;
  const m3 = l * b * h;
  return `${plek} is ${nl(l)} m lang, ${nl(b)} m breed en ${nl(h)} m hoog. Er past ${nl(l)} × ${nl(b)} × ${nl(h)} = ${nl(m3)} m³ lucht in. Dat is ${nl(m3 * 1000)} liter!`;
}

/** Een opdracht hier vlakbij die nog open staat: alvast uitleg over hoe zo'n som werkt. */
function inDeBuurt(): string | null {
  const def = huidig();
  const s = useSpel.getState();
  for (const st of stationsVan(def)) {
    if (st.rol || (st.verdieping ?? 0) !== speler.verdieping || afstandTot(st) > 7) continue;
    if (!isOpen(st, s.fase, false, s.voortgang) || isKlaar(st, s.voortgang, s.fase)) continue;
    const o = def.opdrachten[st.opdrachten.find((id) => !s.voortgang[id]?.goed) ?? st.opdrachten[0]];
    if (o) return `Zie je ${st.titel === 'Tuin van Frank' ? 'mijn tuin' : `de opdracht ${st.titel}`} hier? ${uitlegVoor(o)}`;
  }
  return null;
}

const verteld = new Map<string, number>();
let beurt = 0;
/**
 * Wat Frank nu zegt. Eerst hulp als je vastzat (één keer per opdracht, daarna pas weer na een tijdje),
 * anders om en om: waar je heen moet, en uitleg of een rekenweetje bij de plek waar je bent.
 */
export function frankTip(nu: number): string {
  const vast = vastgelopen();
  if (vast && (verteld.get(vast.o.id) ?? -1e9) < nu - 120) {
    verteld.set(vast.o.id, nu);
    return `Die opdracht bij ${vast.st.titel} was best lastig, hè? ${uitlegVoor(vast.o)}`;
  }
  const soorten = beurt++ % 2 === 0 ? [wegwijzer, inDeBuurt, kamerWeetje] : [inDeBuurt, kamerWeetje, wegwijzer];
  for (const f of soorten) {
    const t = f();
    if (t) return t;
  }
  return 'Neem rustig de tijd. Lees elke vraag goed, en gebruik de rekenkaart als je een formule kwijt bent.';
}
