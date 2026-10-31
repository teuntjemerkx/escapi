// Wereld 5 – modellen voor de terugblik, de uitleg (aflees-loep) en "Samen oefenen" (instap).
// Alle tabellen en grafieken komen rechtstreeks uit onderdeel5.json (data5.ts).
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Deel } from '../game/inspectie';
import { useGroei, useOpgelost, useTip } from '../game/opgelost';
import { Blok, Cil, mat } from '../game/kit';
import { Bordje } from '../game/tekst';
import { getal, kolommenVan, rijenVan } from './data5';
import { Beeld, opScherm, Paal, Palen, Scherm, Sokkel, useScherm } from './scherm';
import { grafiekVlak, legenda, licht, lijn, regels, ROND, streep, tabel, taart, tekst, verloop, vlak, VPM, type C } from './teken';

type V3 = [number, number, number];

// ───────────────────────── Terugblik: koffiekar ─────────────────────────

const KOFFIE_PRIJZEN: [string, string][] = [
  ['Koffie', '€ 1,50'],
  ['Thee', '€ 1,25'],
  ['Koek', '€ 0,75'],
];

/** Terugblik: koffiekar met een prijsbord. 2 koffie en 1 koek (deel-ids "koffie" en "koek"). */
export function Koffiekar() {
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#24463a');
    tekst(ctx, 'KOFFIEKAR', W / 2, 58, { px: 54, kleur: '#ffe39a', gewicht: 700, uitlijn: 'center', font: ROND });
    KOFFIE_PRIJZEN.forEach(([a, b], i) => {
      const y = 140 + i * 64;
      tekst(ctx, a, 44, y, { px: 46, kleur: '#ffffff', gewicht: 600 });
      streep(ctx, 190, y + 12, W - 190, y + 12, 'rgba(255,255,255,0.35)', 3, [4, 10]);
      tekst(ctx, b, W - 44, y, { px: 46, kleur: '#ffffff', gewicht: 700, uitlijn: 'right' });
    });
    void H;
  };
  const kar = '#3d7d68';
  return (
    <group>
      <Blok size={[1.6, 0.85, 0.8]} pos={[0, 0.66, 0]} color={kar} r={0.08} />
      <Blok size={[1.76, 0.06, 0.92]} pos={[0, 1.11, 0]} color="#c48a52" r={0.03} />
      {[-0.56, 0.56].map((x) =>
        [-0.42, 0.42].map((z) => <Cil key={`${x}${z}`} r={0.2} h={0.07} pos={[x, 0.2, z]} rot={[Math.PI / 2, 0, 0]} color="#2f3634" seg={16} />),
      )}
      {/* luifel */}
      {[-0.78, 0.78].map((x) => (
        <Cil key={x} r={0.03} h={1.5} pos={[x, 1.86, -0.42]} color="#2f3634" seg={8} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <Blok key={i} size={[0.38, 0.06, 0.62]} pos={[-0.76 + i * 0.38, 2.62, -0.36]} rot={[0.12, 0, 0]} color={i % 2 ? '#fbf6ec' : '#d8564a'} r={0.02} />
      ))}
      <Scherm b={1.2} h={0.84} teken={bord} sleutel="koffiekar" pos={[0, 1.65, -0.36]} rand={0.04} diep={0.05} kleur="#8a5a32" licht={false} />
      {/* koffiemachine */}
      <Blok size={[0.34, 0.42, 0.3]} pos={[-0.6, 1.35, -0.18]} color="#33393f" r={0.05} />
      <Blok size={[0.2, 0.05, 0.12]} pos={[-0.6, 1.4, -0.0]} color="#9aa3a8" r={0.02} />
      <Deel id="koffie" uit={[0, 0.45, 0.35]} label="2 koffie">
        {[0.0, 0.26].map((x) => (
          <group key={x} position={[x, 1.14, 0.18]}>
            <Cil r={0.065} rTop={0.08} h={0.15} pos={[0, 0.075, 0]} color="#fbfaf6" seg={14} />
            <Cil r={0.07} h={0.01} pos={[0, 0.151, 0]} color="#5a3a22" seg={14} />
          </group>
        ))}
      </Deel>
      <Deel id="koek" uit={[0.25, 0.45, 0.35]} label="1 koek">
        <Cil r={0.14} h={0.02} pos={[0.58, 1.15, 0.2]} color="#fbfaf6" seg={18} />
        <Cil r={0.085} h={0.035} pos={[0.58, 1.18, 0.2]} color="#c98b45" seg={16} />
      </Deel>
    </group>
  );
}

// ───────────────────────── Instructie: aflees-loep ─────────────────────────

const FIETS = { b: 2.4, h: 1.6, x: 175, y: 110, pb: 720, ph: 410 };
const fietsX = (d: number) => FIETS.x + (d / 5) * FIETS.pb;
const fietsY = (e: number) => FIETS.y + FIETS.ph - (e / 30) * FIETS.ph;

/** Loep: ring, glas en handvat (ligt plat in het schermvlak). */
function Loep({ pos, s = 1 }: { pos: V3; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <mesh material={mat('#2f3634', { rough: 0.4, metal: 0.4 })}>
        <torusGeometry args={[0.12, 0.022, 10, 28]} />
      </mesh>
      <mesh position={[0, 0, -0.005]} material={mat('#cfefff', { opacity: 0.35, rough: 0.1 })}>
        <circleGeometry args={[0.12, 24]} />
      </mesh>
      <Blok size={[0.05, 0.24, 0.04]} pos={[0.15, -0.2, 0]} rot={[0, 0, 0.75]} color="#d8564a" r={0.02} />
    </group>
  );
}

/** Instructie: grafiek van een huurfiets (€ 5 vast + € 4 per dag), met de aflees-loep. */
export function Fietsgrafiek() {
  const { b, h } = FIETS;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Fietsverhuur: prijs per dag', W / 2, 52, { px: 46, kleur: '#1f3b57', gewicht: 700, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: FIETS.x,
      y: FIETS.y,
      b: FIETS.pb,
      h: FIETS.ph,
      ya: { min: 0, max: 30, stap: 5, fijn: 1, label: (v) => `€ ${v}`, titel: 'Prijs' },
      xa: { min: 0, max: 5, stap: 1 },
      xTitel: 'Aantal dagen',
      px: 32,
      kleur: { raster: '#8795a1', fijn: '#e3e8ec' },
      yLabelB: 90,
    });
    lijn(
      ctx,
      [0, 1, 2, 3, 4, 5].map((d) => [g.X(d), g.Y(5 + 4 * d)]),
      '#1f6fd1',
      8,
      10,
    );
    void H;
  };
  const p = opScherm(b, h);
  const oranje = '#ff8a3d';
  const y0 = fietsY(0);
  const y5 = fietsY(5);
  const y17 = fietsY(17);
  const x0 = fietsX(0);
  const x3 = fietsX(3);
  return (
    <group>
      <Palen x={0.95} hoogte={1.0} kleur="#3a4249" z={-0.1} />
      <Scherm b={b} h={h} teken={teken} sleutel="fietsgrafiek" pos={[0, 1.7, 0]} rot={[-0.12, 0, 0]} rand={0.07}>
        <Deel id="as-prijs" uit={[0, 0, 0.3]} label="1 hokje = € 1">
          <Blok size={[0.05, (y0 - y5) / VPM, 0.03]} pos={p(x0 + 14, (y0 + y5) / 2, 0.02)} color={oranje} r={0.01} />
          {[1, 2, 3, 4].map((e) => (
            <Blok key={e} size={[0.1, 0.012, 0.035]} pos={p(x0 + 24, fietsY(e), 0.025)} color="#ffffff" r={0.004} />
          ))}
        </Deel>
        <Deel id="as-dagen" uit={[0, 0, 0.3]} label="3 dagen">
          <Blok size={[0.035, (y0 - y17) / VPM, 0.03]} pos={p(x3, (y0 + y17) / 2, 0.02)} color={oranje} r={0.01} />
          <Cil r={0.04} h={0.03} pos={p(x3, y0, 0.03)} rot={[Math.PI / 2, 0, 0]} color={oranje} seg={14} />
        </Deel>
        <Deel id="loep" uit={[0, 0, 0.35]} label="Lees af: € 17">
          <Blok size={[(x3 - x0) / VPM, 0.03, 0.03]} pos={p((x0 + x3) / 2, y17, 0.02)} color={oranje} r={0.01} />
          <Loep pos={p(x3, y17, 0.05)} />
        </Deel>
      </Scherm>
    </group>
  );
}

// ───────────────────────── INS-01: kassa Onderwaterwereld ─────────────────────────

function Schildpad() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    const x = Math.sin(t * 0.35) * 0.85;
    ref.current.position.set(x, 0.42 + Math.sin(t * 1.3) * 0.04, 0);
    ref.current.rotation.y = Math.cos(t * 0.35) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <mesh scale={[1, 0.42, 1.25]} material={mat('#5c8a3a')}>
        <sphereGeometry args={[0.13, 14, 10]} />
      </mesh>
      <mesh position={[0, 0, 0.18]} material={mat('#9cc46a')}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.16, 0.02, 0.07]} pos={[s * 0.15, -0.01, 0.06]} rot={[0, s * 0.5, 0]} color="#9cc46a" r={0.01} shadow={false} />
      ))}
    </group>
  );
}

/** INS-01: breed aquariumscherm met de prijstabel, boven een aquarium met een schildpad. */
export function AquariumKassa() {
  const id = 'O5-INS-01';
  const kop = kolommenVan(id).map((k) => k.replace('ticket met', 'ticket\nmet').replace('Ticket aan', 'Ticket\naan'));
  const rijen = rijenVan(id);
  const b = 3.8;
  const h = 2.0;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#1d79a8', '#0d4166', '#072a44']));
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(150 + i * 300, 0);
      ctx.lineTo(260 + i * 300, 0);
      ctx.lineTo(60 + i * 300, H);
      ctx.lineTo(-40 + i * 300, H);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    tekst(ctx, 'Entreeprijzen 2014 Onderwaterwereld', W / 2, 62, { px: 60, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', max: W - 80 });
    tabel(ctx, { x: 40, y: 118, b: W - 80, h: H - 150, kop, kolB: [1.55, 1, 1], kopH: 1.55, kopBg: '#2f8f4e', rijBg: ['#ffffff', '#e2f4e6'], rijen, px: 44, lijn: '#a9d3b2', lijnDik: 3 });
  };
  const koraal = (pos: V3, s: number, k: string) => (
    <mesh position={pos} scale={s} material={mat(k, { flat: true })}>
      <icosahedronGeometry args={[0.16, 0]} />
    </mesh>
  );
  return (
    <group>
      {/* aquarium op de vloer tegen de muur, scherm aan de muur */}
      <Sokkel b={2.7} d={0.7} h={0.12} kleur="#2c5d78" pos={[0, 0, 0.4]} />
      <Blok size={[2.5, 0.05, 0.56]} pos={[0, 0.15, 0.4]} color="#e8d6a8" r={0.02} />
      <Blok size={[2.5, 0.6, 0.56]} pos={[0, 0.43, 0.4]} color="#5fc0e0" r={0.03} opacity={0.42} />
      <Blok size={[2.56, 0.05, 0.62]} pos={[0, 0.75, 0.4]} color="#2c5d78" r={0.02} />
      <group position={[0, -0.1, 0.4]}>
        <Schildpad />
      </group>
      {koraal([-1.0, 0.24, 0.45], 1, '#f08a6c')}
      {koraal([0.9, 0.22, 0.32], 0.8, '#f4a7c0')}
      <Scherm b={b} h={h} teken={teken} sleutel="aquarium" pos={[0, 1.85, 0.1]} rand={0.1} diep={0.1} kleur="#f08a6c">
        {koraal([-b / 2 - 0.05, -h / 2, 0.06], 1.3, '#f4a7c0')}
        {koraal([-b / 2 + 0.15, -h / 2 - 0.08, 0.08], 0.9, '#ffb36b')}
        {koraal([b / 2 + 0.05, h / 2, 0.06], 1.2, '#ffb36b')}
        {koraal([b / 2 - 0.1, h / 2 + 0.09, 0.08], 0.8, '#f4a7c0')}
      </Scherm>
    </group>
  );
}

// ───────────────────────── INS-02: lesrooster (magneetbord) ─────────────────────────

const VAK: Record<string, string> = {
  NE: '#cfe3ff',
  TE: '#ffd8a8',
  TC: '#b9ece4',
  BI: '#c8f0b0',
  MU: '#ffc9de',
  GS: '#ead7c2',
  FA: '#e2ccff',
  MTU: '#fff1a8',
  EN: '#ffc4c4',
  LO: '#d9f99d',
  IF: '#bdeefc',
  AK: '#fde2b0',
  WI: '#c7d2fe',
  HV: '#f5c2f0',
  GD: '#d6e4c8',
};

/** INS-02: magneetbord met het rooster van klas 1C1 (9 lesuren, 5 dagen). */
export function Lesrooster() {
  const id = 'O5-INS-02';
  const kop = kolommenVan(id);
  const rijen = rijenVan(id);
  const b = 4.0;
  const h = 2.6;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#fbfbf8');
    tekst(ctx, 'Rooster vanaf 18 april', 40, 56, { px: 58, kleur: '#c8102e', gewicht: 700 });
    vlak(ctx, W - 430, 26, 390, 62, '#f7c5d6', 14);
    tekst(ctx, 'Kies je klas: 1C1', W - 235, 57, { px: 36, kleur: '#7a1f3d', gewicht: 700, uitlijn: 'center' });
    tekst(ctx, 'Rooster van klas 1C1', 40, 126, { px: 42, kleur: '#33393f', gewicht: 700 });
    tabel(ctx, {
      x: 30,
      y: 165,
      b: W - 60,
      h: H - 190,
      kop,
      kolB: [0.62, 1, 1, 1, 1, 1],
      kopH: 1.0,
      kopBg: '#7a1f3d',
      rijen,
      px: 40,
      tussen: 8,
      hoek: 10,
      cel: (r, k) => {
        if (k === 0) return { bg: '#e6e9ec', fg: '#33393f' };
        const s = String(rijen[r][k] ?? '');
        if (!s) return { bg: '#cfd5da' };
        return { bg: VAK[s.split(' ')[0]] ?? '#eeeeee', fg: '#1f2a24', gewicht: 600 };
      },
    });
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="lesrooster" pos={[0, 1.6, 0.06]} rand={0.06} diep={0.05} kleur="#c3c9ce" licht={false} />
      <Blok size={[1.4, 0.05, 0.12]} pos={[0, 0.2, 0.12]} color="#c3c9ce" r={0.02} />
      {['#d8564a', '#3a6ea5', '#2f9e44'].map((k, i) => (
        <Cil key={k} r={0.018} h={0.14} pos={[-0.3 + i * 0.2, 0.24, 0.14]} rot={[0, 0, Math.PI / 2]} color={k} seg={8} />
      ))}
    </group>
  );
}

// ───────────────────────── INS-03: vertrekbord vluchten ─────────────────────────

/** Na het goede antwoord klapt onder het bord een groene band uit. */
function Geland() {
  const ref = useGroei(useOpgelost('O5-INS-03'), 0.2);
  return (
    <group position={[0, 0.5, 0.2]}>
      <group ref={ref}>
        <Bordje regels={['Welkom in Groningen!']} breed={2.2} hoog={0.32} pos={[0, 0, 0]} bg="#2b8a3e" fg="#ffffff" rand={null} />
      </group>
    </group>
  );
}

/** INS-03: klapbord met het vliegschema Groningen – Londen. */
export function Vliegschema() {
  const id = 'O5-INS-03';
  const rijen = rijenVan(id);
  const b = 4.2;
  const h = 2.3;
  const kolB = [1.1, 1, 1, 1, 1];
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#121518');
    tekst(ctx, 'Vliegschema Groningen – Londen', 36, 52, { px: 52, kleur: '#ffffff', gewicht: 700 });
    tekst(ctx, '(lokale tijden)', W - 36, 54, { px: 34, kleur: '#aab4bd', uitlijn: 'right' });
    const x0 = 30;
    const bt = W - 60;
    const som = kolB.reduce((a, c) => a + c, 0);
    const xs = kolB.reduce<number[]>((acc, c, i) => [...acc, acc[i] + (c / som) * bt], [x0]);
    vlak(ctx, xs[1] + 4, 98, xs[3] - xs[1] - 8, 52, '#2d6fb7', 8);
    tekst(ctx, 'Groningen → Londen', (xs[1] + xs[3]) / 2, 125, { px: 36, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    vlak(ctx, xs[3] + 4, 98, xs[5] - xs[3] - 8, 52, '#e07b24', 8);
    tekst(ctx, 'Londen → Groningen', (xs[3] + xs[5]) / 2, 125, { px: 36, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    tabel(ctx, {
      x: x0,
      y: 160,
      b: bt,
      h: H - 180,
      kop: ['Dag', 'Vertrek\nGroningen', 'Aankomst\nLonden', 'Vertrek\nLonden', 'Aankomst\nGroningen'],
      kolB,
      kopH: 1.45,
      kopBg: ['#2a3036', '#1d4f8a', '#1d4f8a', '#9a531a', '#9a531a'],
      rijen,
      px: 42,
      kopPx: 34,
      tussen: 8,
      hoek: 6,
      fg: '#ffffff',
      cel: (_r, k) => ({ bg: k === 0 ? '#262b31' : k <= 2 ? '#173b66' : '#6b3913', fg: '#ffffff', gewicht: k === 0 ? 700 : 600 }),
    });
  };
  return (
    <group>
      {[-1.6, 1.6].map((x) => (
        <Blok key={x} size={[0.1, 0.1, 0.16]} pos={[x, 2.95, 0.08]} color="#2f353b" r={0.02} />
      ))}
      <Scherm b={b} h={h} teken={teken} sleutel="vliegschema" pos={[0, 1.75, 0.16]} rand={0.08} diep={0.14} kleur="#2f353b" />
      <Geland />
      {/* koffer */}
      <group position={[1.35, 0, 0.75]} rotation={[0, -0.4, 0]}>
        <Blok size={[0.44, 0.58, 0.24]} pos={[0, 0.35, 0]} color="#2ec4b6" r={0.06} />
        <Blok size={[0.2, 0.04, 0.04]} pos={[0, 0.68, 0]} color="#2f3634" r={0.015} />
        {[-0.14, 0.14].map((x) => (
          <Cil key={x} r={0.035} h={0.03} pos={[x, 0.04, 0.08]} rot={[0, 0, Math.PI / 2]} color="#2f3634" seg={10} />
        ))}
      </group>
    </group>
  );
}

// ───────────────────────── INS-04: taartscherm (cirkeldiagram) ─────────────────────────

const LEEFTIJD_KLEUR: Record<string, string> = {
  paars: '#7b3f9e',
  roze: '#f4a6c8',
  grijs: '#9b9b9b',
  blauw: '#1e9be0',
  lichtgrijs: '#e2e2e2',
  rood: '#e3263b',
};

function Robotstofzuiger() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.5;
    ref.current.position.set(Math.cos(t) * 0.7, 0, Math.sin(t) * 0.45 + 0.35);
    ref.current.rotation.y = -t;
  });
  return (
    <group ref={ref}>
      <Cil r={0.17} h={0.07} pos={[0, 0.05, 0]} color="#3a4249" seg={20} />
      <Cil r={0.05} h={0.02} pos={[0, 0.095, 0.06]} color="#5fe0a1" seg={12} />
    </group>
  );
}

/** INS-04: rond scherm op een paal (cirkeldiagram) met een legenda ernaast. */
export function Taartscherm() {
  const id = 'O5-INS-04';
  const rijen = rijenVan(id);
  // met de klok mee vanaf boven: grijs, blauw, rood, lichtgrijs, roze, paars
  const volgorde = ['grijs', 'blauw', 'rood', 'lichtgrijs', 'roze', 'paars'];
  const stukken = volgorde.map((k) => {
    const r = rijen.find((x) => x[2] === k)!;
    return { v: getal(r[1]), kleur: LEEFTIJD_KLEUR[k], label: String(r[1]) };
  });
  const schijf = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#1d2833');
    ctx.strokeStyle = '#5fd0ff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W * 0.465, 0, Math.PI * 2);
    ctx.stroke();
    taart(ctx, W / 2, H / 2, W * 0.37, stukken, { px: 62, buitenOnder: 0.05, buitenKleur: '#ffffff', tekstKleur: (k) => (licht(k) ? '#1f2a24' : '#ffffff') });
  };
  const leg = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    regels(ctx, 'Aantal deelnemers onderzoek\nper leeftijdsgroep', W / 2, 70, { px: 36, kleur: '#1f2a24', gewicht: 700, uitlijn: 'center', max: W - 40 });
    legenda(
      ctx,
      50,
      175,
      rijen.map((r) => ({ kleur: LEEFTIJD_KLEUR[String(r[2])], t: String(r[0]) })),
      { px: 40, rijH: 70, max: W - 130 },
    );
    void H;
  };
  const tilt = -0.72;
  const tex = useScherm(2.4, 2.4, schijf, 'taart-ins04');
  return (
    <group>
      <group position={[-0.55, 0, 0]}>
        <Paal hoogte={1.45} kleur="#2f353b" r={0.1} />
        <group position={[0, 1.55, 0]} rotation={[tilt, 0, 0]}>
          <Cil r={1.08} h={0.12} pos={[0, 0, -0.07]} rot={[Math.PI / 2, 0, 0]} color="#2f353b" seg={48} />
          <mesh position={[0, 0, 0.0]}>
            <circleGeometry args={[1.02, 64]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group position={[1.3, 0, 0.15]}>
        <Blok size={[0.1, 1.0, 0.1]} pos={[0, 0.5, -0.15]} color="#2f353b" r={0.03} />
        <Scherm b={1.45} h={1.45} teken={leg} sleutel="taart-legenda-ins04" pos={[0, 1.25, 0]} rot={[tilt, 0, 0]} rand={0.05} diep={0.08} kleur="#2f353b" />
      </group>
      <group position={[-0.55, 0, 0]}>
        <Robotstofzuiger />
      </group>
    </group>
  );
}

// ───────────────────────── INS-05: ijsdikte (staven van ijs) ─────────────────────────

const IJS = { x: 205, y: 120, pb: 1170, ph: 610 };

function Schaatsertje({ tops, xs, b, h }: { tops: number[]; xs: number[]; b: number; h: number }) {
  const ref = useRef<THREE.Group>(null);
  const p = opScherm(b, h);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const n = tops.length;
    const t = (clock.getElapsedTime() * 0.08) % 1;
    const f = t * n;
    const i = Math.min(n - 1, Math.floor(f));
    const binnen = f - i;
    const x = xs[0] - (xs[1] - xs[0]) / 2 + f * (xs[1] - xs[0]);
    let y: number;
    if (binnen < 0.75 || i === n - 1) y = tops[i];
    else {
      const u = (binnen - 0.75) / 0.25;
      const a = tops[i];
      const c = tops[i + 1];
      y = a + (c - a) * u - Math.sin(u * Math.PI) * 60;
    }
    const [lx, ly] = p(x, y);
    ref.current.position.set(lx, ly, 0.04);
  });
  return (
    <group ref={ref}>
      <Cil r={0.035} rTop={0.03} h={0.11} pos={[0, 0.07, 0]} color="#d8564a" seg={8} />
      <mesh position={[0, 0.15, 0]} material={mat('#f1c9a5')}>
        <sphereGeometry args={[0.032, 10, 8]} />
      </mesh>
      <Blok size={[0.1, 0.012, 0.02]} pos={[0, 0.012, 0]} color="#9aa3a8" r={0.004} shadow={false} />
    </group>
  );
}

/** INS-05: scherm met een bevroren rand; de acht staven zijn ijsblokken. Rode lijn bij 20 cm. */
export function IJsdikte() {
  const id = 'O5-INS-05';
  const rijen = rijenVan(id);
  const b = 3.6;
  const h = 2.2;
  const n = rijen.length;
  const catB = IJS.pb / n;
  const X = (i: number) => IJS.x + (i + 0.5) * catB;
  const Y = (v: number) => IJS.y + IJS.ph - (v / 40) * IJS.ph;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#f2f8fc', '#d3e5f0']));
    tekst(ctx, 'IJsdikte Elfstedentocht', W / 2, 60, { px: 56, kleur: '#1d4f7a', gewicht: 700, uitlijn: 'center' });
    grafiekVlak(ctx, {
      x: IJS.x,
      y: IJS.y,
      b: IJS.pb,
      h: IJS.ph,
      ya: { min: 0, max: 40, stap: 5, titel: 'IJsdikte in cm' },
      cats: rijen.map((r) => String(r[0])),
      px: 36,
      kleur: { raster: '#6c9ccb', as: '#1d4f7a', tekst: '#1d4f7a' },
      yLabelB: 70,
    });
    void H;
  };
  const p = opScherm(b, h);
  const opgelost = useOpgelost(id);
  const tip = useTip(id);
  const lijn20 = useGroei(opgelost || tip >= 2, 0, 'alle');
  const tops = rijen.map((r) => Y(Number(r[1])));
  const xs = rijen.map((_, i) => X(i));
  const ijsB = (catB * 0.56) / VPM;
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="ijsdikte" pos={[0, 1.7, 0.12]} rand={0.12} diep={0.12} kleur="#e3f3fc">
        {rijen.map((r, i) => {
          const top = Y(Number(r[1]));
          const hoog = (Y(0) - top) / VPM;
          const [x, y] = p(X(i), (Y(0) + top) / 2);
          return (
            <group key={i}>
              <mesh position={[x, y, 0.035]} material={mat('#bfeaff', { emissive: '#7fd3ff', rough: 0.25 })}>
                <boxGeometry args={[ijsB, hoog, 0.06]} />
              </mesh>
              <Blok size={[ijsB + 0.02, 0.025, 0.07]} pos={[x, y + hoog / 2, 0.04]} color="#ffffff" r={0.01} />
            </group>
          );
        })}
        {[-1.6, -1.05, -0.4, 0.3, 0.85, 1.5].map((x, i) => (
          <mesh key={x} position={[x, -h / 2 - 0.12 - (i % 2) * 0.04, 0.0]} rotation={[Math.PI, 0, 0]} material={mat('#e3f3fc', { rough: 0.3 })}>
            <coneGeometry args={[0.05, 0.2 + (i % 3) * 0.06, 6]} />
          </mesh>
        ))}
        <Schaatsertje tops={tops} xs={xs} b={b} h={h} />
        {/* hulplijn bij 20 cm: pas na tip 2 of na het goede antwoord */}
        <group position={p(IJS.x + IJS.pb / 2, Y(20), 0.075)}>
          <group ref={lijn20}>
            <mesh material={mat('#ff4d4d', { emissive: '#ff2020', rough: 0.4 })}>
              <boxGeometry args={[IJS.pb / VPM + 0.1, 0.025, 0.015]} />
            </mesh>
            <Bordje regels={['20 cm']} breed={0.32} hoog={0.14} pos={[IJS.pb / VPM / 2 + 0.24, 0, 0.01]} bg="#e0262f" fg="#ffffff" rand={null} groot={0.75} />
          </group>
        </group>
      </Scherm>
    </group>
  );
}

// ───────────────────────── INS-06: prijs Z6-smartphone ─────────────────────────

const Z6 = { x: 200, y: 105, pb: 1570, ph: 540 };

function Reuzentelefoon() {
  const ref = useRef<THREE.Group>(null);
  const scherm = useScherm(0.46, 0.92, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#5b8def', '#9b5de5']));
    tekst(ctx, 'Z6', W / 2, H * 0.35, { px: 120, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', font: ROND });
    for (let i = 0; i < 8; i++) vlak(ctx, 30 + (i % 4) * 40, H * 0.6 + Math.floor(i / 4) * 44, 28, 28, 'rgba(255,255,255,0.8)', 7);
  }, 'z6-telefoon');
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.6;
  });
  return (
    <group>
      <Cil r={0.32} rTop={0.28} h={0.5} pos={[0, 0.25, 0]} color="#d9d3c7" seg={20} />
      <group ref={ref} position={[0, 1.02, 0]}>
        <Blok size={[0.52, 1.02, 0.06]} color="#1f2328" r={0.07} />
        <Beeld b={0.46} h={0.92} tex={scherm} pos={[0, 0, 0.032]} />
      </group>
    </group>
  );
}

/** INS-06: groot scherm met de prijs van de Z6-smartphone (21 maanden). */
export function Smartphone() {
  const id = 'O5-INS-06';
  const rijen = rijenVan(id);
  const b = 4.6;
  const h = 2.4;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#3d454d', '#262b31']));
    tekst(ctx, 'Prijsontwikkeling Z6 smartphone', W / 2, 54, { px: 54, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: Z6.x,
      y: Z6.y,
      b: Z6.pb,
      h: Z6.ph,
      ya: { min: 0, max: 600, stap: 100, fijn: 20, label: (v) => `€ ${v}` },
      xa: { min: -0.5, max: rijen.length - 0.5, stap: 1 },
      xLabels: rijen.map((r, i) => ({ v: i, t: String(r[0]) })),
      schuin: true,
      px: 32,
      kleur: { achter: '#ffffff', raster: '#7d8890', fijn: '#d6dce1', vert: '#e4e8eb', as: '#1f2a24', tekst: '#ffffff' },
      yLabelB: 120,
    });
    lijn(
      ctx,
      rijen.map((r, i) => [g.X(i), g.Y(getal(r[1]))]),
      '#1565c0',
      7,
      9,
    );
    void H;
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="z6" pos={[0, 1.75, 0.1]} rand={0.08} diep={0.1} />
      <group position={[2.8, 0, 0.6]}>
        <Reuzentelefoon />
      </group>
    </group>
  );
}

// ───────────────────────── INS-07: drankautomaat ─────────────────────────

const DRANK = { x: 170, y: 95, pb: 1010, ph: 500 };

/** INS-07: drankautomaat met een scherm ernaast (frisdrank en mineraalwater per persoon). */
export function Drankautomaat() {
  const id = 'O5-INS-07';
  const rijen = rijenVan(id);
  const b = 3.1;
  const h = 1.9;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Liter water en frisdrank per persoon', W / 2, 48, { px: 46, kleur: '#1f2a24', gewicht: 700, uitlijn: 'center' });
    const jaren = rijen.map((r) => Number(r[0]));
    const g = grafiekVlak(ctx, {
      x: DRANK.x,
      y: DRANK.y,
      b: DRANK.pb,
      h: DRANK.ph,
      ya: { min: 20, max: 110, stap: 10, titel: 'Liter' },
      xa: { min: jaren[0] - 0.5, max: jaren[jaren.length - 1] + 0.5, stap: 1 },
      xLabels: jaren.map((j) => ({ v: j, t: String(j) })),
      xRaster: false,
      px: 34,
      kleur: { banen: ['#e9ebed', '#ffffff'], raster: '#c4c9ce', as: '#1f2a24' },
      yLabelB: 70,
    });
    lijn(ctx, rijen.map((r) => [g.X(Number(r[0])), g.Y(Number(r[1]))]), '#e03131', 8, 10);
    lijn(ctx, rijen.map((r) => [g.X(Number(r[0])), g.Y(Number(r[2]))]), '#1c7ed6', 8, 10);
    const ly = 700;
    streep(ctx, 300, ly, 370, ly, '#e03131', 10);
    tekst(ctx, 'Frisdrank', 390, ly, { px: 36 });
    streep(ctx, 660, ly, 730, ly, '#1c7ed6', 10);
    tekst(ctx, 'Mineraalwater', 750, ly, { px: 36 });
    void H;
  };
  const voorkant = useScherm(0.74, 1.3, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#1e2a33');
    const kleuren = ['#e03131', '#1c7ed6', '#f59f00', '#2f9e44'];
    for (let r = 0; r < 5; r++) {
      vlak(ctx, 10, 40 + r * 102 + 70, W - 20, 10, '#9aa3a8');
      for (let k = 0; k < 4; k++) {
        const x = 30 + k * 66;
        const y = 40 + r * 102;
        vlak(ctx, x + 12, y, 24, 16, '#d9d9d9', 4);
        vlak(ctx, x, y + 14, 48, 56, kleuren[(r + k) % 4], 12);
      }
    }
    void H;
  }, 'drankautomaat-voor');
  return (
    <group>
      <group position={[-2.15, 0, 0.45]}>
        <Blok size={[1.15, 2.1, 0.85]} pos={[0, 1.05, 0]} color="#c8323c" r={0.08} />
        <Beeld b={0.74} h={1.3} tex={voorkant} pos={[-0.15, 1.3, 0.43]} />
        <Blok size={[0.18, 0.6, 0.03]} pos={[0.4, 1.4, 0.43]} color="#2f3634" r={0.02} />
        {[0, 1, 2, 3].map((i) => (
          <Blok key={i} size={[0.1, 0.06, 0.03]} pos={[0.4, 1.6 - i * 0.13, 0.45]} color="#f6efe2" r={0.01} />
        ))}
        <Blok size={[0.6, 0.18, 0.04]} pos={[-0.15, 0.35, 0.43]} color="#2f3634" r={0.03} />
        <Bordje regels={['DRINKEN']} breed={0.9} hoog={0.22} pos={[0, 1.88, 0.43]} bg="#fbfaf6" fg="#c8323c" rand={null} />
      </group>
      <Scherm b={b} h={h} teken={teken} sleutel="drankautomaat" pos={[0.55, 1.7, 0.1]} rand={0.08} diep={0.1} />
    </group>
  );
}

// ───────────────────────── INS-08: strandfeest ─────────────────────────

const STRAND = { x: 300, y: 160, pb: 820, ph: 560 };

function Palm({ pos, s = 1, rot = 0 }: { pos: V3; s?: number; rot?: number }) {
  return (
    <group position={pos} scale={s} rotation={[0, rot, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <Cil key={i} r={0.09 - i * 0.012} rTop={0.08 - i * 0.012} h={0.62} pos={[i * 0.06, 0.31 + i * 0.6, 0]} rot={[0, 0, -0.1]} color={i % 2 ? '#9a6a3c' : '#86592f'} seg={8} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[0.22, 2.45, 0]} rotation={[0, (i * Math.PI * 2) / 6, 0]}>
          <Blok size={[0.9, 0.04, 0.22]} pos={[0.42, -0.12, 0]} rot={[0, 0, -0.35]} color={i % 2 ? '#3f8f3a' : '#4fa944'} r={0.02} />
        </group>
      ))}
    </group>
  );
}

function Krab() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = Math.sin(t * 0.7) * 1.2;
    ref.current.position.y = Math.abs(Math.sin(t * 6)) * 0.03;
  });
  return (
    <group ref={ref} position={[0, 0, 0.55]}>
      <mesh position={[0, 0.08, 0]} scale={[1.3, 0.55, 1]} material={mat('#e8572f')}>
        <sphereGeometry args={[0.09, 12, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.14, 0.11, 0.06]} material={mat('#e8572f')}>
          <sphereGeometry args={[0.04, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** INS-08: scherm in zonsondergangkleuren met de prijs van Strandfeest Dance. */
export function Strandfeest() {
  const id = 'O5-INS-08';
  const rijen = rijenVan(id);
  const b = 3.4;
  const h = 2.2;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#2a1b54', '#6e2a86', '#c94f8a', '#f39a5a']));
    const palmSil = (x: number, s: number) => {
      ctx.strokeStyle = '#1d1036';
      ctx.lineWidth = 16 * s;
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.quadraticCurveTo(x + 40 * s, H - 250 * s, x + 20 * s, H - 430 * s);
      ctx.stroke();
      ctx.fillStyle = '#1d1036';
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.55;
        ctx.beginPath();
        ctx.ellipse(x + 20 * s + Math.cos(a) * 90 * s, H - 430 * s + Math.sin(a) * 40 * s + 30 * s, 100 * s, 20 * s, a, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    palmSil(60, 1.2);
    palmSil(W - 120, 1.1);
    tekst(ctx, 'Strandfeest Dance', W / 2, 60, { px: 60, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Kosten strandfeest', W / 2, 116, { px: 36, kleur: '#ffe3f1', gewicht: 600, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: STRAND.x,
      y: STRAND.y,
      b: STRAND.pb,
      h: STRAND.ph,
      ya: { min: 0, max: 50, stap: 10, fijn: 2, label: (v) => `€ ${v}`, titel: 'Kosten' },
      xa: { min: 0, max: 5, stap: 1 },
      xTitel: 'Aantal drankjes',
      px: 34,
      kleur: { achter: 'rgba(20,8,40,0.45)', raster: 'rgba(255,255,255,0.8)', fijn: 'rgba(255,255,255,0.3)', as: '#ffffff', tekst: '#ffffff' },
      yLabelB: 80,
    });
    const pts = rijen.map((r) => [g.X(Number(r[0])), g.Y(getal(r[1]))] as [number, number]);
    lijn(ctx, pts, 'rgba(255,255,255,0.45)', 18);
    lijn(ctx, pts, '#c77dff', 8, 10, '#c77dff');
    void H;
  };
  const opgelost = useOpgelost(id);
  const tip = useTip(id);
  const ring = useGroei(opgelost || tip >= 2, 0, 'alle');
  const p = opScherm(b, h);
  const start = p(STRAND.x, STRAND.y + STRAND.ph - (getal(rijen[0][1]) / 50) * STRAND.ph, 0.03);
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="strandfeest" pos={[0, 1.7, 0.1]} rand={0.08} diep={0.1} kleur="#3b2457">
        <group position={start}>
          <group ref={ring}>
            <mesh material={mat('#ffffff', { emissive: '#ffffff' })}>
              <torusGeometry args={[0.06, 0.012, 8, 24]} />
            </mesh>
          </group>
        </group>
      </Scherm>
      {[-2.15, 2.15].map((x, i) => (
        <group key={x} position={[x, 0, 0.45]}>
          <Cil r={0.26} rTop={0.3} h={0.42} pos={[0, 0.21, 0]} color="#c46a3a" seg={14} />
          <Palm pos={[0, 0.4, 0]} s={0.95 - i * 0.08} rot={i ? 2.2 : 0.3} />
        </group>
      ))}
      <Krab />
    </group>
  );
}

// ───────────────────────── INS-09: studieschuld (formulemachine) ─────────────────────────

/** INS-09: formulemachine voor de studieschuld van Mark (geen werkboekplaatje). */
export function Studieschuld() {
  const b = 2.8;
  const h = 1.45;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#12324a', '#0b2133']));
    ctx.strokeStyle = 'rgba(127,209,255,0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 40) streep(ctx, x, 0, x, H, 'rgba(127,209,255,0.1)', 2);
    for (let y = 0; y < H; y += 40) streep(ctx, 0, y, W, y, 'rgba(127,209,255,0.1)', 2);
    tekst(ctx, 'FORMULEMACHINE', W / 2, 52, { px: 44, kleur: '#7fd1ff', gewicht: 700, uitlijn: 'center', font: ROND });
    vlak(ctx, 40, 95, W - 80, 250, '#fbfaf6', 20);
    tekst(ctx, 'Studieschuld =', W / 2, 160, { px: 58, kleur: '#12324a', gewicht: 700, uitlijn: 'center' });
    tekst(ctx, '€ 1.906 + (aantal maanden × € 246)', W / 2, 270, { px: 58, kleur: '#12324a', gewicht: 700, uitlijn: 'center', max: W - 120 });
    vlak(ctx, W / 2 - 300, 400, 600, 150, '#ffd43b', 20);
    tekst(ctx, 'Mark: 5 maanden', W / 2, 475, { px: 54, kleur: '#12324a', gewicht: 700, uitlijn: 'center' });
    void H;
  };
  return (
    <group>
      <Blok size={[3.0, 0.95, 1.0]} pos={[0, 0.475, 0]} color="#5b6b7a" r={0.1} />
      <Blok size={[3.1, 0.08, 1.1]} pos={[0, 0.99, 0]} color="#3d4852" r={0.04} />
      {[-1.1, -0.85, -0.6].map((x, i) => (
        <Cil key={x} r={0.07} h={0.06} pos={[x, 0.7, 0.51]} rot={[Math.PI / 2, 0, 0]} color={['#e03131', '#f59f00', '#2f9e44'][i]} seg={12} />
      ))}
      {/* trechter en tandwielen */}
      <Cil r={0.08} rTop={0.3} h={0.45} pos={[-1.3, 1.3, -0.25]} color="#9aa3a8" seg={16} />
      {[0.95, 1.25].map((x, i) => (
        <Cil key={x} r={0.2 - i * 0.05} h={0.06} pos={[x + 0.25, 0.55 + i * 0.18, 0.52]} rot={[Math.PI / 2, 0, 0]} color="#f59f00" seg={10} />
      ))}
      <Scherm b={b} h={h} teken={teken} sleutel="studieschuld" pos={[0, 1.85, -0.1]} rot={[-0.12, 0, 0]} rand={0.08} kleur="#3d4852" />
      {/* vijf maandblokjes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Blok key={i} size={[0.17, 0.17, 0.17]} pos={[0.1 + i * 0.22, 1.12, 0.3]} color="#ffd43b" r={0.03} />
      ))}
    </group>
  );
}

// ───────────────────────── INS-10: schepsnoep ─────────────────────────

/** INS-10: snoepbar met bakken, een prijsbord en een weegschaal met 300 gram. */
export function Schepsnoep() {
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffe3ef');
    for (let x = -H; x < W; x += 80) {
      ctx.fillStyle = 'rgba(214,51,108,0.08)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, 0);
      ctx.lineTo(x + 40 + H, H);
      ctx.lineTo(x + H, H);
      ctx.fill();
    }
    tekst(ctx, 'Schepsnoep', W / 2, 86, { px: 76, kleur: '#d6336c', gewicht: 700, uitlijn: 'center', font: ROND });
    vlak(ctx, 40, 160, W - 80, 170, '#ffffff', 22);
    tekst(ctx, 'Prijs = € 6,90 × aantal kilogram', W / 2, 245, { px: 56, kleur: '#1f2a24', gewicht: 700, uitlijn: 'center', max: W - 120 });
  };
  const snoep = useScherm(0.5, 0.5, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#fff4e0');
    const k = ['#e03131', '#f59f00', '#2f9e44', '#1c7ed6', '#ae3ec9', '#ff8fab'];
    for (let i = 0; i < 70; i++) {
      const x = (i * 73) % W;
      const y = (i * 41 + (i % 7) * 13) % H;
      ctx.fillStyle = k[i % k.length];
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 10, i, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 'snoepjes');
  const lcd = useScherm(0.3, 0.12, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#b8e0a6');
    tekst(ctx, '300 g', W - 14, H / 2 + 2, { px: 38, kleur: '#16301a', gewicht: 700, uitlijn: 'right' });
  }, 'weegschaal-300');
  return (
    <group>
      <Blok size={[2.7, 0.9, 0.9]} pos={[0, 0.45, 0]} color="#c48a52" r={0.06} />
      <Blok size={[2.8, 0.06, 1.0]} pos={[0, 0.93, 0]} color="#e8d6b8" r={0.03} />
      {[-1.05, -0.5, 0.05].map((x) => (
        <group key={x} position={[x, 1.08, -0.1]} rotation={[0.35, 0, 0]}>
          <Blok size={[0.5, 0.26, 0.5]} color="#eef3f6" r={0.04} opacity={0.85} />
          <Beeld b={0.44} h={0.44} tex={snoep} pos={[0, 0.1, 0]} rot={[-Math.PI / 2, 0, 0]} licht={false} />
        </group>
      ))}
      {/* weegschaal met zakje */}
      <group position={[0.85, 0.96, 0.1]}>
        <Blok size={[0.5, 0.1, 0.45]} pos={[0, 0.05, 0]} color="#d5dade" r={0.03} />
        <Blok size={[0.42, 0.025, 0.38]} pos={[0, 0.115, 0]} color="#9aa3a8" r={0.01} />
        <Blok size={[0.34, 0.14, 0.04]} pos={[0, 0.11, 0.24]} rot={[-0.5, 0, 0]} color="#3a4249" r={0.02} />
        <Beeld b={0.3} h={0.12} tex={lcd} pos={[0, 0.115, 0.262]} rot={[-0.5, 0, 0]} />
        <Blok size={[0.22, 0.3, 0.15]} pos={[0, 0.28, 0]} color="#d9b98c" r={0.02} />
      </group>
      <Cil r={0.06} rTop={0.07} h={0.1} pos={[0.45, 1.0, 0.3]} rot={[Math.PI / 2, 0, 0.4]} color="#9aa3a8" seg={10} />
      <Palen x={1.25} hoogte={2.75} kleur="#7a4a2a" dik={0.05} z={-0.4} />
      <Scherm b={2.4} h={1.0} teken={bord} sleutel="schepsnoep" pos={[0, 2.25, -0.38]} rand={0.06} diep={0.06} kleur="#d6336c" licht={false} />
    </group>
  );
}
