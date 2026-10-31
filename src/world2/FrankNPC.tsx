// Frank: overdag de tuinman van Slot Maansteyn, 's nachts iets anders. Hij dwaalt door het slot en jaagt op je.
// Alleen in zijn tuin is hij rustig: daar (en als je echt vastzit) legt hij uit hoe een som werkt.
//
// Hoe hij bang maakt (op basis van onderzoek naar horrorgames, zie docs/ontwerp/horror-wereld2.md):
// - Een regisseur houdt de spanning bij: sneller in het donker en als Frank in de buurt is. Na een fout antwoord of
//   een vraag krijg je eerst rust. Echte schrikmomenten zijn zeldzaam (anders went het).
// - Daartussen zie je hem: ver weg in een gang, stil, starend. Schijn je erop of kom je dichterbij, dan is hij weg.
// - Is de spanning hoog, dan slaat hij toe: om de hoek, achter je als je stilstaat, of als je lamp uitvalt.
// - Na een schrikmoment zit hij soms achter je aan. Ren naar het licht of naar zijn tuin. Pakt hij je, dan valt je lamp
//   even uit en is hij weer weg (je verliest niets).
// Geluid (voetstappen, adem, gefluister, hartslag) en beeld (korrel, kleurranden) komen uit horror.tsx.
// De docent kan schrikken uitzetten: dan blijft alleen de sfeer.
import { Html } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { lijnVrij, zoekPad } from '../game/botsing';
import { kamerOp, verdiepingHoogte } from '../game/huis';
import { wasSlepen } from '../game/invoer';
import { zeg } from '../game/maatje';
import { cam, speler, useSpel } from '../game/store';
import { zaklampStaat } from '../game/zaklamp';
import { geluid } from '../lib/geluid';
import { leesVoor } from '../lib/spraak';
import { huidig, stationsVan } from '../werelden';
import type { Plattegrond } from '../werelden/types';
import { FrankLijf, leegLeden, zetHouding, type Houding } from './frankModel';
import { FRANK_HOI, frankTip, uitlegVoor } from './frankTips';
import { frankNu, horror } from './horror';

type V2 = [number, number];
type Soort = 'hoek' | 'achter' | 'lamp';
type Stand = 'wacht' | 'loop' | 'praat' | 'loer' | 'besluip' | 'schrik' | 'lach' | 'betrapt' | 'staar' | 'jaag';

/** Lievelingsplekken op de begane grond: rond zijn tuin midden op de binnenplaats (Slot Maansteyn). */
const TUIN: V2[] = [
  [-4.6, 6.4],
  [4.6, 2.0],
  [-4.0, -3.0],
  [4.8, -2.4],
];
/**
 * Hier laat Frank je nooit schrikken: het bospad en de brug (de start), de poortzaal en de uitlegkamer, zijn eigen tuin op
 * de binnenplaats, de walgangen en de weergang, het dak van de donjon, het kerkhof, de bouwplaats, de rotstrap en de steiger.
 */
const RUSTIG = new Set(['bospad', 'brug', 'poortzaal', 'uitleg', 'binnenplaats', 'walgangO', 'walgangW', 'balkon', 'uitkijk', 'kerkhof', 'bouwplaats', 'rotstrap', 'steiger']);

const SCHAAL = 1.0;
/** Horizontale halve kijkhoek (als cosinus) waarbinnen je iets ziet. */
const KIJK = Math.cos((52 * Math.PI) / 180);
const DREMPEL_EERSTE = 45;
const DREMPEL: V2 = [55, 95];
/** Tijd tussen twee keer dat je hem in de verte ziet staan (s). */
const STAAR: V2 = [30, 60];
/** Zo snel rent hij als hij achter je aan zit (jij loopt 4,6 m/s: je kunt hem ontlopen). */
const JAAG_SNEL = 3.7;
const RUST_NA_FOUT = 75;
const RUST_NA_VRAAG = 12;

const FLUISTER = ['Ik zie je wel…', 'Je bent niet alleen hier.', 'Tel maar mee… tot ik je vind.', 'Waarom ren je weg?', 'Ik hoor je ademen.', 'Nog even… en dan ben je van mij.'];
const BETRAPT = ['…', 'Kijk niet zo naar me.', 'Nog niet.'];
const BOO_NA = ['Daar was hij weer… Blijf in het licht!', 'Snel! In zijn tuin ben je veilig.', 'Ik hoor hem nog steeds…', 'Niet stilstaan. Hij komt terug.'];
const BOO_EERSTE = 'Dat was Frank. Overdag is hij de tuinman, maar ’s nachts dwaalt hij door het slot. Alleen in zijn tuin is hij rustig: daar helpt hij je zelfs met de sommen.';
const BOO_GEPAKT = ['Hij had je bijna! Blijf bewegen.', 'Weg hier! Naar het licht!', 'Zijn tuin! Daar ben je veilig.'];

const duurVan = (t: string) => Math.min(11, Math.max(3.5, 2.5 + t.length / 14));
const kies = <T,>(l: T[], n: number) => l[n % l.length];
const tussen = ([a, b]: V2) => a + Math.random() * (b - a);
const hoekVerschil = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

function nieuweStaat() {
  return {
    klok: 0,
    pos: new THREE.Vector3(4.6, 0, 2.0),
    v: 0,
    richting: 0,
    pad: [] as V2[],
    stand: 'wacht' as Stand,
    tot: 2,
    fase: 0,
    stap: 0,
    // praten
    tekst: null as string | null,
    tekstTot: 0,
    praatTot: 0,
    praatDuur: 0,
    klikTot: 0,
    kent: false,
    hulpNodig: false,
    /** Loopt hij nu naar jou toe (om te helpen)? */
    naarJou: false,
    // regie
    spanning: 0,
    drempel: DREMPEL_EERSTE,
    aantal: 0,
    nr: 0,
    soort: null as Soort | null,
    laatsteSoort: null as Soort | null,
    rustTot: 0,
    volgendeKeer: 0,
    sinds: 0,
    hint: false,
    lunge: false,
    verschenen: false,
    /** Wanneer hij weer in de verte mag verschijnen, en wanneer hij zijn route opnieuw zoekt tijdens de jacht. */
    volgendeStaar: 35,
    padTot: 0,
    // jij
    stil: 0,
    vorige: null as V2 | null,
    snelheid: new THREE.Vector2(),
    wasLopend: true,
  };
}
type Staat = ReturnType<typeof nieuweStaat>;

/** Plekken om naartoe te lopen per verdieping: zijn tuin en het midden van de zalen. */
function loopPlekken(plan: Plattegrond) {
  const uit: Record<number, V2[]> = { 0: [...TUIN] };
  for (const k of plan.kamers) {
    if (k.zonderVloer || RUSTIG.has(k.id) || k.id === 'binnenplaats') continue;
    const v = k.verdieping ?? 0;
    (uit[v] ??= []).push([k.pos[0], k.pos[1]]);
  }
  return uit;
}

let klokNu = 0;

export function FrankNPC() {
  const ref = useRef<THREE.Group>(null);
  const leden = useRef(leegLeden());
  const [tekst, setTekst] = useState<string | null>(null);
  const camera = useThree((st) => st.camera);
  const plan = huidig().plan!;
  const HV = verdiepingHoogte(plan);
  const plekken = useMemo(() => loopPlekken(plan), [plan]);
  const [s] = useState<Staat>(nieuweStaat);
  const voor = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector2(), []);
  const onbereikbaar = useRef(new Map<string, number>());

  // Fout antwoord? Dan eerst rust (geen schrik), en bij vastlopen komt Frank helpen.
  useEffect(
    () =>
      useSpel.subscribe((nu, oud) => {
        if (nu.voortgang === oud.voortgang) return;
        for (const id in nu.voortgang) {
          const a = nu.voortgang[id];
          if (a.pogingen > (oud.voortgang[id]?.pogingen ?? 0) && !a.goed) {
            s.rustTot = Math.max(s.rustTot, s.klok + RUST_NA_FOUT);
            if (a.pogingen >= 2) s.hulpNodig = true;
          }
        }
      }),
    [s],
  );

  const zegFrank = (t: string | null, duur = t ? duurVan(t) : 0) => {
    s.tekst = t;
    s.tekstTot = s.klok + duur;
    setTekst(t);
    if (t && t.length > 14 && useSpel.getState().voorlezen) leesVoor(t);
  };

  /** Ziet de speler dit punt (op zijn eigen verdieping)? Drie stralen: het midden en links en rechts ervan. */
  const ziet = (x: number, z: number) => {
    const cx = camera.position.x;
    const cz = camera.position.z;
    const dx = x - cx;
    const dz = z - cz;
    const d = Math.hypot(dx, dz);
    if (d < 0.6) return true;
    if (d > 26) return false;
    const nx = (-dz / d) * 0.3;
    const nz = (dx / d) * 0.3;
    for (const k of [0, 1, -1]) {
      const px = x + nx * k;
      const pz = z + nz * k;
      const e = Math.hypot(px - cx, pz - cz);
      if (((px - cx) * voor.x + (pz - cz) * voor.z) / e < KIJK) continue;
      if (lijnVrij(cx, cz, px, pz, 0.04, true, speler.verdieping)) return true;
    }
    return false;
  };
  const frankGezien = () => s.v === speler.verdieping && ziet(s.pos.x, s.pos.z);
  /** Is dit een goede plek voor Frank (vrij, in een kamer met vloer, niet op een rustige plek)? */
  const goedePlek = (x: number, z: number, v: number) => {
    if (!lijnVrij(x, z, x, z, 0.38, false, v)) return false;
    const k = kamerOp(plan, x, z, v);
    return !!k && !k.zonderVloer && !RUSTIG.has(k.id);
  };
  const padLengte = (ax: number, az: number, pad: V2[]) => {
    let L = 0;
    for (const [x, z] of pad) {
      L += Math.hypot(x - ax, z - az);
      ax = x;
      az = z;
    }
    return L;
  };

  const loopNaar = (x: number, z: number, naarJou = false) => {
    const sleutel = `${s.v}:${x.toFixed(1)}:${z.toFixed(1)}`;
    if ((onbereikbaar.current.get(sleutel) ?? -1e9) > s.klok - 60) return false;
    const pad = zoekPad(s.pos.x, s.pos.z, x, z, (px, pz) => Math.hypot(px - x, pz - z) < 1.2, s.v);
    if (!pad || !pad.length) {
      onbereikbaar.current.set(sleutel, s.klok);
      return false;
    }
    s.pad = pad;
    s.stand = 'loop';
    s.naarJou = naarJou;
    return true;
  };

  /** Mag de regisseur nu iets doen? Alleen door je eigen ogen, tijdens het lopen, op een gewone vloer. */
  const regieOK = () => {
    const st = useSpel.getState();
    // pas na de eerste opdracht (je moet eerst even wennen aan het kasteel)
    if (!st.schrikken || st.fase === 'terugblik' || st.cameraStand !== 'eerste' || st.modus !== 'lopen' || st.kaart) return false;
    if (Math.abs(speler.pos.y - speler.verdieping * HV) > 0.05) return false;
    const k = kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping);
    return !!k && !k.zonderVloer && !RUSTIG.has(k.id);
  };
  /** Mag Frank ongezien naar je toe komen (om te helpen)? Zelfde regels, maar ook als schrikken uit staat. */
  const naderOK = () => {
    const st = useSpel.getState();
    if (st.cameraStand !== 'eerste' || st.modus !== 'lopen' || st.kaart) return false;
    if (Math.abs(speler.pos.y - speler.verdieping * HV) > 0.05) return false;
    const k = kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping);
    return !!k && !k.zonderVloer && !RUSTIG.has(k.id);
  };

  /** Een plek op jouw verdieping, op afstand `r` van je, die je niet ziet en waar je zelf kunt komen. */
  const nabijPlek = (r: V2): V2 | null => {
    const p = speler.pos;
    const v = speler.verdieping;
    let paden = 0;
    for (let i = 0; i < 14 && paden < 3; i++) {
      const a = Math.random() * Math.PI * 2;
      const afst = tussen(r);
      const x = p.x + Math.sin(a) * afst;
      const z = p.z + Math.cos(a) * afst;
      if (!goedePlek(x, z, v) || ziet(x, z)) continue;
      paden++;
      const pad = zoekPad(p.x, p.z, x, z, undefined, v);
      if (pad && padLengte(p.x, p.z, pad) < afst * 1.8 + 3) return [x, z];
    }
    return null;
  };

  /** Ergens anders heen lopen. Moet hij helpen (of stijgt de spanning), dan komt hij eerst ongezien in je buurt. */
  const kiesDoel = () => {
    const p = speler.pos;
    const ver = s.v !== speler.verdieping || Math.hypot(p.x - s.pos.x, p.z - s.pos.z) > 16;
    const wil = s.hulpNodig ? naderOK() : regieOK() && s.spanning > s.drempel * 0.5;
    if (wil && ver && !frankGezien()) {
      const plek = nabijPlek(s.hulpNodig ? [4, 8] : [7, 13]);
      if (plek) {
        s.v = speler.verdieping;
        s.pos.set(plek[0], s.v * HV, plek[1]);
        s.pad = [];
        zegFrank(null);
        if (s.hulpNodig) {
          if (loopNaar(p.x, p.z, true)) return;
        } else {
          const lijst = plekken[s.v] ?? [];
          const d = lijst[Math.floor(Math.random() * lijst.length)];
          if (d && loopNaar(d[0], d[1])) return;
        }
        s.stand = 'wacht';
        s.tot = 2;
        return;
      }
    }
    // Moet hij helpen en is hij al op jouw verdieping? Dan loopt hij gewoon naar je toe.
    if (s.hulpNodig && s.v === speler.verdieping && loopNaar(p.x, p.z, true)) return;
    // Is hij op een andere verdieping dan jij en ziet niemand hem? Dan gaat hij terug naar zijn tuin.
    if (s.v !== 0 && s.v !== speler.verdieping) {
      s.v = 0;
      s.pos.set(TUIN[0][0], 0, TUIN[0][1]);
      zegFrank(null);
    }
    const lijst = plekken[s.v] ?? plekken[0];
    for (let i = 0; i < 4; i++) {
      const d = lijst[Math.floor(Math.random() * lijst.length)];
      if (Math.hypot(d[0] - s.pos.x, d[1] - s.pos.z) < 2) continue;
      if (loopNaar(d[0], d[1])) return;
    }
    s.stand = 'wacht';
    s.tot = 3;
  };

  // ── de drie manieren om te schrikken ──

  /** Om de hoek: naast een deuropening op je route, aan de andere kant van de muur. */
  const hinderlaag = () => {
    const p = speler.pos;
    const v = speler.verdieping;
    const loopt = s.snelheid.length() > 0.5;
    const rx = loopt ? s.snelheid.x / s.snelheid.length() : voor.x;
    const rz = loopt ? s.snelheid.y / s.snelheid.length() : voor.z;
    // Heb je een route aangeklikt? Dan weet hij precies door welke deuren je gaat.
    const route = speler.pad.length ? speler.pad.map((q) => [q.x, q.z] as V2) : speler.doel ? [[speler.doel.x, speler.doel.z] as V2] : [];
    const opRoute = (x: number, z: number) => route.some(([qx, qz]) => Math.hypot(qx - x, qz - z) < 1.1);
    const kand: { x: number; z: number; kx: number; kz: number; vx: number; vz: number; score: number }[] = [];
    for (const d of plan.doorgangen) {
      if ((d.verdieping ?? 0) !== v) continue;
      const b = d.breed ?? (d.soort === 'dubbel' ? 2.4 : 1.6);
      const [dx, dz] = d.pos;
      const langs: V2 = d.as === 'x' ? [1, 0] : [0, 1];
      const dwars: V2 = d.as === 'x' ? [0, 1] : [1, 0];
      const pp = (p.x - dx) * dwars[0] + (p.z - dz) * dwars[1];
      if (Math.abs(pp) < 1.2) continue;
      const afst = Math.hypot(dx - p.x, dz - p.z);
      if (afst < 3 || afst > 12) continue;
      const cos = ((dx - p.x) * rx + (dz - p.z) * rz) / afst;
      // je loopt (of kijkt) recht op de deur af: hooguit 1,4 m ernaast
      const opzij = Math.abs((dx - p.x) * rz - (dz - p.z) * rx);
      const gepland = opRoute(dx, dz);
      if (!gepland && (cos < 0.5 || opzij > 1.4)) continue;
      const kant = -Math.sign(pp);
      // tot hier loop je zeker: 1 m voor de muur
      const vx = dx - dwars[0] * kant * 1.0;
      const vz = dz - dwars[1] * kant * 1.0;
      const ix = dx + dwars[0] * kant * 0.5;
      const iz = dz + dwars[1] * kant * 0.5;
      for (const zij of [-1, 1]) {
        // plat tegen de muur, een flink stuk naast de opening: echt om de hoek
        const x = dx + langs[0] * zij * (b / 2 + 0.9) + dwars[0] * kant * 0.58;
        const z = dz + langs[1] * zij * (b / 2 + 0.9) + dwars[1] * kant * 0.58;
        if (!goedePlek(x, z, v) || !lijnVrij(x, z, ix, iz, 0.3, false, v) || ziet(x, z)) continue;
        kand.push({ x, z, kx: dx, kz: dz, vx, vz, score: Math.abs(afst - 6) + opzij + (gepland ? -3 : 0) + Math.random() * 1.5 });
      }
    }
    kand.sort((a, c) => a.score - c.score);
    for (const h of kand.slice(0, 4)) {
      const pad = zoekPad(p.x, p.z, h.kx, h.kz, undefined, v);
      if (!pad || padLengte(p.x, p.z, pad) > Math.hypot(h.kx - p.x, h.kz - p.z) * 1.6 + 2) continue;
      // Hij moet verborgen blijven terwijl jij naar de deur loopt (pas vlak bij de deur mag je hem zien):
      // langs de looproute, en langs een strook van 1,6 m breed recht naar de deur (je slingert een beetje).
      const punten: V2[] = [[p.x, p.z], ...pad];
      const L = Math.hypot(h.vx - p.x, h.vz - p.z) || 1;
      const ox = (-(h.vz - p.z) / L) * 0.8;
      const oz = ((h.vx - p.x) / L) * 0.8;
      for (let f = 0; f <= 1.001; f += 0.5 / L)
        for (const k of [0, 1, -1]) {
          const x = p.x + (h.vx - p.x) * f + ox * k;
          const z = p.z + (h.vz - p.z) * f + oz * k;
          if (lijnVrij(x, z, x, z, 0.2, true, v)) punten.push([x, z]);
        }
      if (punten.every(([x, z]) => Math.hypot(x - h.x, z - h.z) < 3.2 || uitHetZicht(x, z, h.x, h.z, v))) return h;
    }
    return null;
  };
  /** Staat er vanaf (ax, az) een muur tussen jou en Frank op (x, z)? Ook zijn schouders moeten erachter zitten. */
  const uitHetZicht = (ax: number, az: number, x: number, z: number, v: number) => {
    const d = Math.hypot(x - ax, z - az) || 1;
    const nx = (-(z - az) / d) * 0.32;
    const nz = ((x - ax) / d) * 0.32;
    for (const k of [0, 1, -1]) if (lijnVrij(ax, az, x + nx * k, z + nz * k, 0.04, true, v)) return false;
    return true;
  };
  /** Achter je, als je stilstaat. */
  const achterPlek = (): V2 | null => {
    const p = speler.pos;
    const v = speler.verdieping;
    for (const zij of [0, 0.35, -0.35]) {
      const x = p.x - voor.x * 1.6 + voor.z * zij;
      const z = p.z - voor.z * 1.6 - voor.x * zij;
      if (goedePlek(x, z, v) && lijnVrij(p.x, p.z, x, z, 0.25, false, v) && !ziet(x, z)) return [x, z];
    }
    return null;
  };
  /** Vlak voor je (voor als de lamp uitvalt). */
  const voorPlek = (): V2 | null => {
    const p = speler.pos;
    const v = speler.verdieping;
    for (const a of [1.9, 1.6]) {
      const x = p.x + voor.x * a;
      const z = p.z + voor.z * a;
      if (goedePlek(x, z, v) && lijnVrij(p.x, p.z, x, z, 0.25, false, v)) return [x, z];
    }
    return null;
  };

  const zetNeer = (x: number, z: number) => {
    s.v = speler.verdieping;
    s.pos.set(x, s.v * HV, z);
    s.pad = [];
    s.sinds = s.klok;
    s.hint = false;
    zegFrank(null);
  };
  const kijkNaarJou = () => Math.atan2(speler.pos.x - s.pos.x, speler.pos.z - s.pos.z);

  /** Probeer een schrikmoment te beginnen (met `soort` alleen die manier, handig om te testen). */
  const probeer = (soort?: Soort): boolean => {
    const gezien = frankGezien();
    const donker = !!kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping)?.donker;
    const opties: { soort: Soort; w: number; doe: () => void }[] = [];
    if (!gezien && (!soort || soort === 'hoek')) {
      const h = hinderlaag();
      if (h)
        opties.push({
          soort: 'hoek',
          w: 3,
          doe: () => {
            zetNeer(h.x, h.z);
            s.richting = Math.atan2(h.kx - h.x, h.kz - h.z);
            s.stand = 'loer';
          },
        });
    }
    if (!gezien && (soort === 'achter' || (!soort && s.stil > 2.5))) {
      const a = achterPlek();
      if (a)
        opties.push({
          soort: 'achter',
          w: 2,
          doe: () => {
            zetNeer(a[0], a[1]);
            s.richting = kijkNaarJou();
            s.stand = 'besluip';
            geluid('kraak');
          },
        });
    }
    if (!soort || soort === 'lamp') {
      const l = voorPlek();
      if (l)
        opties.push({
          soort: 'lamp',
          w: donker ? 3 : 1.5,
          doe: () => {
            zetNeer(l[0], l[1]);
            s.richting = kijkNaarJou();
            s.stand = 'schrik';
            s.fase = -0.8;
            s.lunge = false;
            s.verschenen = false;
          },
        });
    }
    let keus = opties.filter((o) => o.soort !== s.laatsteSoort);
    if (!keus.length) keus = opties;
    if (!keus.length) return false;
    let r = Math.random() * keus.reduce((n, o) => n + o.w, 0);
    const o = keus.find((x) => (r -= x.w) < 0) ?? keus[0];
    s.soort = o.soort;
    o.doe();
    return true;
  };
  if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __frank: s, __frankProbeer: probeer, __frankTest: { hinderlaag, ziet, goedePlek, lijnVrij, zoekPad, uitlegVoor, frankTip, regieOK } });

  const schrik = (lunge: boolean) => {
    s.stand = 'schrik';
    s.fase = 0;
    s.lunge = lunge;
    s.verschenen = false;
    s.richting = kijkNaarJou();
  };
  const geefOp = (deel: number) => {
    s.spanning = s.drempel * deel;
    s.volgendeKeer = s.klok + 8;
    s.stand = 'wacht';
    s.tot = 0.5;
  };
  const betrapt = () => {
    s.stand = 'betrapt';
    s.richting = kijkNaarJou();
    const t = kies(BETRAPT, s.nr++);
    zegFrank(t);
    s.tot = duurVan(t);
    s.spanning = s.drempel * 0.45;
    s.volgendeKeer = s.klok + 20;
    s.laatsteSoort = s.soort;
    horror.fluister(0, 0.05);
  };
  /** Weg in het donker: hij duikt later ergens anders weer op. */
  const verdwijn = () => {
    s.v = 0;
    const plek = TUIN[Math.floor(Math.random() * TUIN.length)];
    s.pos.set(plek[0], 0, plek[1]);
    s.pad = [];
    s.stand = 'wacht';
    s.tot = 6 + Math.random() * 6;
    s.naarJou = false;
    zegFrank(null);
  };
  /** Ergens ver voor je, waar je hem kunt zien staan (9–16 m, in je blikveld, vrij zicht). */
  const staarPlek = (): V2 | null => {
    const p = speler.pos;
    const v = speler.verdieping;
    const basis = Math.atan2(voor.x, voor.z);
    for (let i = 0; i < 16; i++) {
      const a = basis + (Math.random() - 0.5) * 0.9;
      const afst = 9 + Math.random() * 7;
      const x = p.x + Math.sin(a) * afst;
      const z = p.z + Math.cos(a) * afst;
      if (goedePlek(x, z, v) && ziet(x, z)) return [x, z];
    }
    return null;
  };
  const praat = (t: string) => {
    s.stand = 'praat';
    s.pad = [];
    s.richting = kijkNaarJou();
    zegFrank(t);
    s.tot = s.praatDuur = duurVan(t);
    s.praatTot = s.klok + 45;
  };
  const praatMetHulp = () => {
    // komt hij helpen, dan meteen de uitleg (bij de eerste keer met een korte groet ervoor)
    const t = s.kent ? frankTip(s.klok) : s.hulpNodig ? `Hoi, ik ben Frank! ${frankTip(s.klok)}` : FRANK_HOI;
    s.hulpNodig = false;
    s.kent = true;
    praat(t);
  };

  const klik = (e: ThreeEvent<MouseEvent>) => {
    if (wasSlepen() || useSpel.getState().modus !== 'lopen' || !ref.current?.visible) return;
    e.stopPropagation();
    if (s.stand === 'staar') verdwijn();
    else if (s.stand === 'loer' || s.stand === 'besluip') betrapt();
    else if ((s.stand === 'wacht' || s.stand === 'loop' || s.stand === 'praat') && s.klok > s.klikTot) {
      s.klikTot = s.klok + 3;
      praatMetHulp();
    }
  };

  // weg uit de wereld: de lamp mag nooit uit blijven staan
  useEffect(
    () => () => {
      zaklampStaat.uit = false;
    },
    [],
  );

  useFrame(({ clock }, rawDt) => {
    const g = ref.current;
    if (!g) return;
    klokNu = clock.getElapsedTime();
    const dt = Math.min(rawDt, 0.05);
    if (dt <= 0) return;
    s.klok += dt;
    const spel = useSpel.getState();
    const lopend = spel.modus === 'lopen' && !spel.kaart;
    const p = speler.pos;
    camera.getWorldDirection(voor);
    voor.y = 0;
    if (voor.lengthSq() < 1e-6) voor.set(0, 0, -1);
    voor.normalize();
    // hoe beweeg jij? (stilstaan telt mee voor "achter je")
    const vorige = s.vorige ?? [p.x, p.z];
    const vx = (p.x - vorige[0]) / dt;
    const vz = (p.z - vorige[1]) / dt;
    s.vorige = [p.x, p.z];
    // een sprong van meters in één beeld is geen lopen (start, teleport): die telt niet mee
    if (Math.hypot(vx, vz) > 9) s.snelheid.set(0, 0);
    else s.snelheid.lerp(tmp2.set(vx, vz), Math.min(1, dt * 5));
    s.stil = Math.hypot(vx, vz) < 0.3 ? s.stil + dt : 0;
    // net klaar met een vraag? dan eerst even rust
    if (lopend && !s.wasLopend) s.rustTot = Math.max(s.rustTot, s.klok + RUST_NA_VRAAG);
    s.wasLopend = lopend;

    const zelfdeVloer = s.v === speler.verdieping;
    const afstand = zelfdeVloer ? Math.hypot(p.x - s.pos.x, p.z - s.pos.z) : 99;
    const regie = regieOK();
    const rustig = s.stand === 'wacht' || s.stand === 'loop';

    // ── spanningsmeter ──
    if (regie && rustig && s.klok >= s.rustTot) {
      const k = kamerOp(plan, p.x, p.z, speler.verdieping);
      s.spanning += dt * (k?.donker ? 1.5 : 1) * (afstand < 14 ? 1.6 : 1);
    }
    if (regie && rustig && !s.hulpNodig && s.spanning > s.drempel * 0.3 && s.spanning < s.drempel && s.klok >= s.volgendeStaar && s.klok >= s.rustTot) {
      s.volgendeStaar = s.klok + tussen(STAAR);
      const plek = staarPlek();
      if (plek) {
        zetNeer(plek[0], plek[1]);
        s.richting = kijkNaarJou();
        s.stand = 'staar';
      }
    }
    if (regie && rustig && !s.hulpNodig && s.spanning >= s.drempel && s.klok >= s.volgendeKeer && s.klok >= s.rustTot) {
      // niet als je net bij een opdracht staat
      const bijStation = stationsVan().some((st) => (st.verdieping ?? 0) === speler.verdieping && Math.hypot(st.pos[0] - p.x, st.pos[1] - p.z) < 2.2);
      if (bijStation || !probeer()) s.volgendeKeer = s.klok + 2.5;
    }

    // ── wat Frank nu doet ──
    switch (s.stand) {
      case 'loer':
        if (!regie || !zelfdeVloer) geefOp(0.6);
        else if (afstand < 2.6 && lijnVrij(p.x, p.z, s.pos.x, s.pos.z, 0.04, true, s.v)) schrik(true);
        // zie je hem net om de hoek? dichtbij springt hij tevoorschijn, van ver weg ben je hem te snel af
        else if (frankGezien()) {
          if (afstand < 4.2) schrik(true);
          else betrapt();
        }
        else if (s.klok - s.sinds > 40 || afstand > 18) geefOp(0.6);
        else if (!s.hint && afstand < 6) {
          s.hint = true;
          geluid('kraak');
        }
        break;
      case 'besluip':
        s.richting = kijkNaarJou();
        if (!regie || !zelfdeVloer) geefOp(0.5);
        else if (afstand < 3.6 && frankGezien()) schrik(afstand > 1.4);
        else if (afstand > 4.8 || s.klok - s.sinds > 14) geefOp(0.5);
        else if (!s.hint && s.klok - s.sinds > 5) {
          s.hint = true;
          geluid('fluister');
        }
        break;
      case 'schrik': {
        s.fase += dt;
        if (s.fase < 0) break; // lamp uit: zolang Frank zich klaarzet, blijft het donker
        if (!s.verschenen) {
          s.verschenen = true;
          // lamp weer aan: Frank staat nu echt vlak voor je (ook als je in het donker nog een stukje liep)
          if (s.soort === 'lamp' && zelfdeVloer) {
            const l = voorPlek();
            if (l) s.pos.set(l[0], s.pos.y, l[1]);
          }
          horror.stinger(s.soort === 'lamp');
          cam.schok = 1.2;
          zegFrank(null);
          s.aantal++;
          s.spanning = 0;
          s.laatsteSoort = s.soort;
          s.drempel = tussen(DREMPEL) * Math.min(1.8, 1 + 0.2 * s.aantal);
          s.volgendeKeer = s.klok + 20;
        }
        s.richting = kijkNaarJou();
        // hij springt recht voor je (ook als hij van opzij komt)
        if (s.lunge && s.fase < 0.4 && zelfdeVloer) {
          const doelX = p.x + voor.x * 1.45;
          const doelZ = p.z + voor.z * 1.45;
          const dx = doelX - s.pos.x;
          const dz = doelZ - s.pos.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.05) {
            const stap = Math.min(d, 6 * dt);
            const nx = s.pos.x + (dx / d) * stap;
            const nz = s.pos.z + (dz / d) * stap;
            if (lijnVrij(s.pos.x, s.pos.z, nx, nz, 0.3, false, s.v) && Math.hypot(nx - p.x, nz - p.z) > 1.1) s.pos.set(nx, s.pos.y, nz);
          }
        }
        if (s.fase > 1.5) {
          // soms zit hij daarna achter je aan; anders fluistert hij iets en trekt hij zich terug in het donker
          if (Math.random() < 0.45 && regieOK()) {
            s.stand = 'jaag';
            s.sinds = s.klok;
            s.pad = [];
            s.padTot = 0;
            zegFrank(null);
          } else {
            const t = kies(FLUISTER, s.aantal);
            s.stand = 'lach';
            s.tot = 3.2;
            zegFrank(t);
            horror.fluister(0, 0.05);
          }
        }
        break;
      }
      case 'lach':
      case 'betrapt':
      case 'praat':
        s.tot -= dt;
        s.richting += hoekVerschil(kijkNaarJou(), s.richting) * Math.min(1, dt * 4);
        if (s.tot <= 0 || (s.stand === 'praat' && afstand > 7)) {
          if (s.stand === 'lach' && (s.aantal === 1 || Math.random() < 0.45)) zeg(s.aantal === 1 ? BOO_EERSTE : kies(BOO_NA, s.aantal), 'melding');
          zegFrank(null);
          if (s.stand === 'praat') kiesDoel();
          else verdwijn();
        }
        break;
      case 'staar': {
        // ver weg, stil, starend. Schijn je erop, kom je dichterbij of duurt het te lang: weg is hij.
        s.richting = kijkNaarJou();
        const lens = zaklampStaat.lens;
        const tx = s.pos.x - lens.x;
        const tz = s.pos.z - lens.z;
        const ty = s.pos.y + 1.4 - lens.y;
        const tl = Math.hypot(tx, ty, tz) || 1;
        const beschenen = zaklampStaat.aan > 0.5 && (tx * zaklampStaat.richting.x + ty * zaklampStaat.richting.y + tz * zaklampStaat.richting.z) / tl > Math.cos(0.11);
        if (!zelfdeVloer || !lopend || afstand < 6.5 || s.klok - s.sinds > 4.5 || (beschenen && s.klok - s.sinds > 0.35)) {
          if (zelfdeVloer && lopend) horror.fluister(0, 0.04);
          verdwijn();
        }
        break;
      }
      case 'jaag': {
        // hij rent op je af; in het licht van een veilige plek, op een andere verdieping of na 9 s houdt hij op
        s.richting = kijkNaarJou();
        if (!zelfdeVloer || !regieOK() || s.klok - s.sinds > 9) {
          horror.fluister(0, 0.04);
          verdwijn();
          break;
        }
        if (afstand < 1.05) {
          // gepakt: nog één keer schrikken, de lamp valt even uit en hij is weer weg
          horror.stinger(true);
          cam.schok = 1.6;
          zaklampStaat.uitvalTot = Math.max(zaklampStaat.uitvalTot, klokNu + 1.8);
          zeg(kies(BOO_GEPAKT, s.aantal), 'melding');
          s.spanning = 0;
          s.volgendeKeer = s.klok + 25;
          verdwijn();
          break;
        }
        if (s.klok > s.padTot || !s.pad.length) {
          s.pad = zoekPad(s.pos.x, s.pos.z, p.x, p.z, (x, z) => Math.hypot(x - p.x, z - p.z) < 0.9, s.v) ?? [];
          s.padTot = s.klok + 0.5;
        }
        const doel = s.pad[0];
        if (doel) {
          const dx = doel[0] - s.pos.x;
          const dz = doel[1] - s.pos.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.25) s.pad.shift();
          else {
            const v = JAAG_SNEL * dt;
            s.pos.x += (dx / d) * Math.min(v, d);
            s.pos.z += (dz / d) * Math.min(v, d);
          }
        }
        s.stap += dt * 9.5;
        break;
      }
      case 'loop': {
        const doel = s.pad[0];
        if (!doel) {
          s.stand = 'wacht';
          s.tot = 2 + Math.random() * 4;
          break;
        }
        const dx = doel[0] - s.pos.x;
        const dz = doel[1] - s.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.2) s.pad.shift();
        else {
          const v = (s.hulpNodig ? 1.7 : 1.25) * dt;
          s.pos.x += (dx / d) * Math.min(v, d);
          s.pos.z += (dz / d) * Math.min(v, d);
          s.richting += hoekVerschil(Math.atan2(dx, dz), s.richting) * Math.min(1, dt * 5);
          s.stap += dt * (s.hulpNodig ? 7.2 : 5.6);
        }
        break;
      }
      default:
        s.tot -= dt;
        if (s.tot <= 0) kiesDoel();
    }
    // Kom je langs (of zat je vast)? Dan zegt hij iets nuttigs.
    if (
      lopend &&
      (s.stand === 'wacht' || s.stand === 'loop') &&
      afstand < 3.4 &&
      (s.klok > s.praatTot || s.hulpNodig) &&
      lijnVrij(p.x, p.z, s.pos.x, s.pos.z, 0.04, true, s.v)
    )
      praatMetHulp();
    // Moet hij helpen maar is hij ver weg? Dan komt hij eraan (ongezien).
    if (s.hulpNodig && lopend && (s.stand === 'wacht' || (s.stand === 'loop' && !s.naarJou)) && s.klok >= s.volgendeKeer) {
      s.volgendeKeer = s.klok + 4;
      kiesDoel();
    }
    if (s.tekst && s.klok > s.tekstTot) zegFrank(null);

    // ── tonen en bewegen ──
    const verstopt = s.stand === 'schrik' && s.fase < 0;
    zaklampStaat.uit = verstopt;
    g.visible = zelfdeVloer && !verstopt;
    if (!g.visible && s.tekst && !verstopt) zegFrank(null);
    s.pos.y = s.v * HV;
    g.position.copy(s.pos);
    g.rotation.y = s.richting;
    const houding: Houding = (() => {
      switch (s.stand) {
        case 'loop':
          return 'loop';
        case 'jaag':
          return 'ren';
        case 'schrik':
          return 'schrik';
        case 'staar':
          return 'staar';
        case 'lach':
          return 'staan';
        case 'loer':
        case 'besluip':
          return 'loer';
        case 'betrapt':
          return 'schouders';
        case 'praat':
          return s.praatDuur - s.tot < 1.6 ? 'zwaai' : 'praat';
        default:
          return 'staan';
      }
    })();
    zetHouding(leden.current, houding, s.klok, s.stap, dt);
    frankNu.pos.copy(s.pos);
    frankNu.v = s.v;
    frankNu.stand = s.stand;
    frankNu.zichtbaar = g.visible;
    frankNu.loopt = (s.stand === 'loop' || s.stand === 'jaag') && !verstopt;
    frankNu.jaagt = s.stand === 'jaag';
    frankNu.loert = s.stand === 'loer' || s.stand === 'besluip';
    // hij kijkt je aan als je in de buurt bent
    const hoofd = leden.current.hoofd;
    if (hoofd) {
      const wil = afstand < 7 && s.stand !== 'loer' ? THREE.MathUtils.clamp(hoekVerschil(kijkNaarJou(), s.richting), -0.9, 0.9) : 0;
      hoofd.rotation.y += (wil - hoofd.rotation.y) * Math.min(1, dt * 4);
      // staart hij je aan, dan hangt zijn hoofd scheef en schokt het af en toe
      const scheef = s.stand === 'staar' ? 0.42 + (Math.sin(s.klok * 7.3) > 0.97 ? 0.12 : 0) : s.stand === 'lach' ? 0.25 : 0;
      hoofd.rotation.z += (scheef + Math.sin(s.klok * 1.3) * 0.03 - hoofd.rotation.z) * Math.min(1, dt * 6);
    }
  });

  return (
    <group ref={ref} onClick={klik}>
      <group scale={SCHAAL}>
        <FrankLijf leden={leden} />
      </group>
      {tekst && (
        <Html position={[0.4, 2.3, 0]} zIndexRange={[25, 20]}>
          <div className="frank-ballon">
            <div className="ballon-naam">Frank</div>
            {tekst}
          </div>
        </Html>
      )}
    </group>
  );
}
