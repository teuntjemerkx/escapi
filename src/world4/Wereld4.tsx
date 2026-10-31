// Wereld 4 – "Winkelcentrum De Honderd": aankleding (meubels, borden, fontein, koepel als voortgangsbalk, mediascherm, klok).
// Het gebouw zelf (vloeren, muren, puien, rolhekken, roltrappen, glazen gewelven en koepel) komt uit de plattegrond in huis.ts;
// waar elk meubel staat, staat in inrichting.ts (gecontroleerd met check.mjs).
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { box, cirkel, opLaag } from '../game/botsing';
import { FrankPoster } from '../game/frank';
import { Kleed } from '../game/huis';
import { Lichtsnoer } from '../game/natuur';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { Bank, Fauteuil, Krat, Plant, Schoolbord, Wandplank } from '../game/meubels';
import { useSpel } from '../game/store';
import { faseIndex } from '../game/voortgang';
import { FONT, rondRect } from '../game/tekst';
import { DoekAtlas } from './atlas';
import { Bloembak, Bomenbak, Bureau, Eettafel, Galerijlantaarn, GroteFontein, Kappersstoel, Liftdeuren, Popcorn, SjorsBeeld, Speelkast, Stelling, Toonbank, Wasbak, Zuil } from './decor4';
import { DRAAIMOLEN, HV, RAD } from './huis';
import { MEUBELS, WANDEN, ZUIL_R, ZUILEN, type Meubel, type Wand } from './inrichting';
import { Winkelwagen } from './modellen-keuze';
import { Paal, Terrastafel } from './stad4';
import { WERKBOEK } from './stations';
import { Bord, Doek, Kledingrek, Kraam, Paspop, Shirt, tekstRegel } from './winkels';

type V3 = [number, number, number];
const R = Math.PI / 2;

/** Botsingen van de meubels (muren, puien, stations en kluizen doet de motor). */
export function registreerDecor() {
  for (const m of MEUBELS) if (m.maat) opLaag(m.v ?? 0, () => box(m.pos[0], m.pos[1], m.maat![0], m.maat![1]));
  // de zuilen van de koepel staan op beide verdiepingen
  for (const v of [0, 1]) opLaag(v, () => ZUILEN.forEach(([x, z]) => cirkel(x, z, ZUIL_R)));
  // reuzenrad op het dakterras (voet langs z) en de draaimolen op het stationsplein
  opLaag(1, () => box(RAD.pos[0], RAD.pos[1], 2.8, 6.6));
  cirkel(DRAAIMOLEN[0], DRAAIMOLEN[1], 2.6);
}

// ─────────────────────────── Vast decor ───────────────────────────

/** Vaste aankleding: wordt samengevoegd tot weinig meshes. Wat aan een muur hangt of beweegt, staat in Levend. */
export function Wereld4Decor() {
  return (
    <DoekAtlas>
      {MEUBELS.map((m, i) => (
        <group key={i} position={[0, (m.v ?? 0) * HV, 0]}>
          <MeubelVast m={m} />
        </group>
      ))}
      <Wegwijzers />
      <MediaschermLijst />
      <UitgangGevel />
      {/* naamborden boven de puien en alles aan de muren: vast, samen een paar tekenstappen */}
      {GEVELBORDEN.map((g, i) => (
        <group key={`g${i}`} position={[0, (g.v ?? 0) * HV, 0]}>
          <Blok size={[g.b + 0.12, 0.62, 0.05]} pos={g.pos} rot={[0, g.rot, 0]} color="#1f2125" r={0.02} shadow={false} />
          <group position={g.pos} rotation={[0, g.rot, 0]}>
            <Bord regels={[g.tekst]} b={g.b} h={0.5} pos={[0, 0, 0.03]} bg={g.kleur} fg="#ffffff" licht />
          </group>
        </group>
      ))}
      {WANDEN.map((w, i) => (
        <group key={`w${i}`} position={[0, (w.v ?? 0) * HV, 0]}>
          <WandVast w={w} />
        </group>
      ))}
    </DoekAtlas>
  );
}

function MeubelVast({ m }: { m: Meubel }) {
  const p: V3 = [m.pos[0], 0, m.pos[1]];
  const rot = 'rot' in m ? (m.rot ?? 0) : 0;
  switch (m.soort) {
    case 'plant':
      return <Plant pos={p} s={m.s} soort={m.variant} />;
    case 'bank':
      return <Bank pos={p} rot={rot} b={m.b} kleur={m.kleur} />;
    case 'fauteuil':
      return <Fauteuil pos={p} rot={rot} kleur={m.kleur} />;
    case 'kleed':
      return <Kleed pos={m.pos} b={m.b} d={m.d} kleur={m.kleur} rand={m.rand} />;
    case 'balie':
      return <Balie pos={p} rot={rot} b={m.b} tekst={m.tekst} kleur={m.kleur} />;
    case 'toonbank':
      return <Toonbank pos={p} rot={rot} b={m.b} kleur={m.kleur} />;
    case 'kledingrek':
      return (
        <group position={p} rotation={[0, rot, 0]}>
          <Kledingrek b={1.6} hoogte={1.55} />
          {['#e5675a', '#fbf6ec', '#5aa9ff', '#3f5f8f', '#f2a64a'].map((k, i) => (
            <Shirt key={i} kleur={k} pos={[-0.6 + i * 0.3, 1.53, 0]} rot={[0, Math.PI / 2, 0]} s={0.9} />
          ))}
        </group>
      );
    case 'paskamer':
      return <Paskamer pos={p} rot={rot} />;
    case 'paspop':
      return (
        <Paspop pos={p} rot={[0, rot, 0]}>
          <Blok size={[0.44, 0.6, 0.26]} pos={[0, 1.3, 0]} color={m.kleur} r={0.1} />
        </Paspop>
      );
    case 'rek':
      return <Rek pos={p} rot={rot} b={m.b} inhoud={m.inhoud} />;
    case 'fruitkrat':
      return <Fruitkrat pos={p} rot={rot} />;
    case 'winkelwagen':
      return (
        <group position={p} rotation={[0, rot, 0]}>
          <Winkelwagen />
        </group>
      );
    case 'verfblikken':
      return <Verfblikken pos={p} />;
    case 'ladder':
      return <Ladder pos={p} rot={rot} />;
    case 'infobord':
      return <Infobord pos={p} rot={rot} />;
    case 'kraam':
      return (
        <group position={p} rotation={[0, rot, 0]}>
          <Kraam w={m.w ?? 4} naam={m.naam} kleur={m.kleur} />
        </group>
      );
    case 'terrastafel':
      return <Terrastafel pos={p} rot={rot} kleur={m.kleur} />;
    case 'paal':
      return <Paal pos={p} h={m.h} />;
    case 'zuil':
      return <Zuil pos={p} h={m.h ?? 10} r={ZUIL_R - 0.04} />;
    case 'bomenbak':
      return <Bomenbak pos={p} s={m.s} />;
    case 'bloembak':
      return <Bloembak pos={p} rot={rot} b={m.b} />;
    case 'popcorn':
      return <Popcorn pos={p} rot={rot} />;
    case 'speelkast':
      return <Speelkast pos={p} rot={rot} kleur={m.kleur} tekst={m.tekst} />;
    case 'kappersstoel':
      return <Kappersstoel pos={p} rot={rot} />;
    case 'wasbak':
      return <Wasbak pos={p} rot={rot} />;
    case 'stelling':
      return <Stelling pos={p} rot={rot} b={m.b} h={m.h} />;
    case 'eettafel':
      return <Eettafel pos={p} kleur={m.kleur} />;
    case 'lantaarn':
      return <Galerijlantaarn pos={p} />;
    case 'fontein':
      return (
        <>
          <GroteFontein pos={p} />
          <SjorsBeeld pos={[p[0], 0.62, p[2]]} />
        </>
      );
    case 'bureau':
      return <Bureau pos={p} rot={rot} />;
  }
}

/** Hangende wegwijzers onder de galerij (in de kleur van de zone) en bij de roltrappen. */
function Wegwijzers() {
  const bord = (pos: V3, rot: number, regels: string[], bg: string, b = 3.0, fg = '#ffffff') => (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-b / 2 + 0.2, b / 2 - 0.2].map((x) => (
        <Blok key={x} size={[0.03, 0.5, 0.03]} pos={[x, 0.5, 0]} color="#2b2f33" r={0} shadow={false} />
      ))}
      <Blok size={[b + 0.06, 0.5, 0.06]} pos={[0, 0, 0]} color="#2b2f33" r={0.02} shadow={false} />
      <Bord regels={regels} b={b} h={0.44} pos={[0, 0, 0.035]} bg={bg} fg={fg} licht />
      <Bord regels={regels} b={b} h={0.44} pos={[0, 0, -0.035]} rot={[0, Math.PI, 0]} bg={bg} fg={fg} licht />
    </group>
  );
  return (
    <>
      {/* bij de boog van de marktpassage: links drogist, rechts bouwmarkt */}
      {bord([-3.0, 3.95, 6.5], 0, ['← Kapper en drogist'], '#1d8f84')}
      {bord([3.0, 3.95, 6.5], 0, ['Bouwmarkt en elektro →'], '#b88a00')}
      {/* bij de voet van de roltrappen: naar boven */}
      {bord([4.1, 3.6, 5.4], 0, ['↑ 1e verdieping'], '#2f6fd6', 1.6)}
      {bord([-4.1, 3.6, -5.4], Math.PI, ['↑ 1e verdieping'], '#2f6fd6', 1.6)}
      {/* boven de boog naar de etalagestraat */}
      {bord([0, 3.95, -6.5], 0, ['Etalagestraat · Uitgang'], '#c2255c', 3.4)}
      {/* boven: richting de zalen */}
      {bord([-6.5, 5 + 3.4, 2.6], R, ['← Nieuws en media'], '#2f6fd6', 2.4)}
      {bord([6.5, 5 + 3.4, -2.6], -R, ['← Foodcourt · Dakterras'], '#7d4fb8', 2.8)}
    </>
  );
}

/** Lijst en kabels van het grote mediascherm boven de boog naar de etalagestraat (het beeld zelf staat in Levend). */
function MediaschermLijst() {
  return (
    <group position={[0, 8.3, -7.0]}>
      <Blok size={[4.7, 2.5, 0.18]} pos={[0, 0, -0.1]} color="#15171c" r={0.05} />
      {[-1.9, 1.9].map((x) => (
        <Blok key={x} size={[0.03, 1.7, 0.03]} pos={[x, 2.1, -0.1]} color="#2b2f33" r={0} shadow={false} />
      ))}
    </group>
  );
}

/** Binnenkant van de kopgevel boven de uitgang: de naam van het centrum en een grote klok (de wijzers in Levend). */
function UitgangGevel() {
  return (
    <group position={[0, 0, -23.83]}>
      <Bord regels={['DE HONDERD']} b={5.4} h={0.9} pos={[0, 9.0, 0.02]} bg="#2b2f33" fg="#e9c46a" licht />
      <Cil r={1.15} h={0.12} pos={[0, 6.6, 0.06]} rot={[Math.PI / 2, 0, 0]} color="#c9a25a" seg={40} />
      <mesh position={[0, 6.6, 0.125]} material={mat('#fbf6ec', { emissive: '#fff4d6' })}>
        <circleGeometry args={[1.0, 40]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Blok key={i} size={[0.05, i % 3 ? 0.12 : 0.22, 0.02]} pos={[Math.sin(a) * 0.86, 6.6 + Math.cos(a) * 0.86, 0.14]} rot={[0, 0, -a]} color="#2b2f33" r={0} shadow={false} />;
      })}
      <Bord regels={['Uitgang · Stationsplein']} b={2.8} h={0.42} pos={[0, 4.15, 0.02]} bg="#0b5530" fg="#ffffff" licht />
    </group>
  );
}

// ─────────────────────────── Meubels in het thema ───────────────────────────

function Balie({ pos, rot, b, tekst, kleur }: { pos: V3; rot: number; b: number; tekst: string; kleur: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 1.0, 0.7]} pos={[0, 0.5, 0]} color={kleur} r={0.05} />
      <Blok size={[b + 0.1, 0.06, 0.8]} pos={[0, 1.03, 0]} color="#e9e2d4" r={0.02} />
      <Bord regels={[tekst]} b={b - 0.4} h={0.3} pos={[0, 0.62, 0.352]} bg={kleur} fg="#ffffff" />
      <Blok size={[0.4, 0.28, 0.04]} pos={[0.5, 1.22, -0.1]} rot={[-0.2, 0, 0]} color="#262b2e" r={0.02} />
      <Cil r={0.05} h={0.12} pos={[-0.6, 1.12, 0.05]} color="#d9d2c4" seg={10} />
    </group>
  );
}

function Paskamer({ pos, rot }: { pos: V3; rot: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[
        [-0.6, -0.6],
        [0.6, -0.6],
        [-0.6, 0.6],
        [0.6, 0.6],
      ].map(([x, z], i) => (
        <Blok key={i} size={[0.06, 2.2, 0.06]} pos={[x, 1.1, z]} color="#3b3a39" r={0.02} />
      ))}
      <Blok size={[1.3, 0.05, 1.3]} pos={[0, 2.2, 0]} color="#3b3a39" r={0.02} />
      <Blok size={[1.2, 1.9, 0.05]} pos={[0, 1.1, -0.6]} color="#e8cfd6" r={0.02} />
      <Blok size={[0.05, 1.9, 1.2]} pos={[0.6, 1.1, 0]} color="#e8cfd6" r={0.02} />
      <Blok size={[0.85, 1.85, 0.06]} pos={[-0.15, 1.15, 0.6]} color="#7a3b5a" r={0.03} />
    </group>
  );
}

const REK_KLEUREN = ['#e5675a', '#5aa9ff', '#7cc35a', '#f2a64a', '#8b6bb5', '#2ec4b6', '#e86f8a', '#ffc94d'];
function Rek({ pos, rot, b, inhoud }: { pos: V3; rot: number; b: number; inhoud: 'tijdschriften' | 'flessen' | 'snoep' | 'dozen' | 'knuffels' }) {
  const r = useMemo(() => seeded(Math.round(pos[0] * 7 + pos[2] * 13)), [pos]);
  const items = useMemo(() => {
    const uit: { x: number; y: number; k: string; s: number }[] = [];
    const n = Math.max(3, Math.round(b / 0.32));
    for (let plank = 0; plank < 3; plank++)
      for (let i = 0; i < n; i++) uit.push({ x: -b / 2 + 0.18 + (i * (b - 0.36)) / (n - 1), y: 0.28 + plank * 0.55, k: REK_KLEUREN[Math.floor(r() * REK_KLEUREN.length)], s: 0.8 + r() * 0.3 });
    return uit;
  }, [b, r]);
  const hout = inhoud === 'dozen' ? '#7f888d' : '#e9e2d4';
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 1.85, 0.06]} pos={[0, 0.925, -0.2]} color={hout} r={0.02} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.05, 1.85, 0.45]} pos={[(s * b) / 2, 0.925, 0]} color={hout} r={0.02} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Blok key={i} size={[b, 0.04, 0.45]} pos={[0, 0.25 + i * 0.55, 0]} color={inhoud === 'dozen' ? '#e48a3a' : '#cfc7b8'} r={0.01} />
      ))}
      {items.map((it, i) => {
        if (inhoud === 'tijdschriften') return <Blok key={i} size={[0.22, 0.3 * it.s, 0.03]} pos={[it.x, it.y + 0.15 * it.s, 0.05]} rot={[-0.25, 0, 0]} color={it.k} r={0.008} />;
        if (inhoud === 'flessen') return <Cil key={i} r={0.05} rTop={0.03} h={0.25 * it.s} pos={[it.x, it.y + 0.125 * it.s, 0.02]} color={it.k} seg={8} />;
        if (inhoud === 'dozen') return <Blok key={i} size={[0.24, 0.22 * it.s, 0.3]} pos={[it.x, it.y + 0.11 * it.s, 0]} color={i % 2 ? '#c79a62' : '#bf8f58'} r={0.01} />;
        if (inhoud === 'snoep')
          return (
            <group key={i} position={[it.x, it.y, 0.02]}>
              <Cil r={0.08} h={0.22} pos={[0, 0.11, 0]} color={it.k} seg={10} />
              <Cil r={0.07} h={0.04} pos={[0, 0.24, 0]} color="#fbf6ec" seg={10} />
            </group>
          );
        return (
          <mesh key={i} position={[it.x, it.y + 0.12, 0.02]} scale={it.s} castShadow material={mat(i % 3 ? '#b5835a' : it.k)}>
            <sphereGeometry args={[0.11, 10, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Fruitkrat({ pos, rot }: { pos: V3; rot: number }) {
  const fruit = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ x: -0.28 + (i % 4) * 0.19, z: i < 4 ? -0.1 : 0.1, k: ['#f2a64a', '#e5675a', '#9ccf5a', '#ffc94d'][i % 4] })), []);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Krat pos={[0, 0, 0]} />
      {fruit.map((f, i) => (
        <mesh key={i} position={[f.x, 0.62, f.z]} castShadow material={mat(f.k)}>
          <sphereGeometry args={[0.085, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Verfblikken({ pos }: { pos: V3 }) {
  const blik = (p: V3, k: string) => (
    <group position={p}>
      <Cil r={0.13} h={0.22} pos={[0, 0.11, 0]} color="#c9cdd0" seg={14} />
      <Cil r={0.135} h={0.1} pos={[0, 0.11, 0]} color={k} seg={14} />
    </group>
  );
  return (
    <group position={pos}>
      {blik([-0.15, 0, -0.1], '#d02b20')}
      {blik([0.15, 0, -0.1], '#3d7cc9')}
      {blik([0, 0, 0.15], '#ffc94d')}
      {blik([0, 0.23, -0.02], '#7cc35a')}
    </group>
  );
}

function Ladder({ pos, rot }: { pos: V3; rot: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <group rotation={[-0.25, 0, 0]}>
        {[-0.22, 0.22].map((x) => (
          <Blok key={x} size={[0.05, 2.4, 0.05]} pos={[x, 1.2, 0]} color="#c9a372" r={0.015} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Blok key={i} size={[0.44, 0.04, 0.04]} pos={[0, 0.3 + i * 0.36, 0]} color="#b6773e" r={0.01} />
        ))}
      </group>
    </group>
  );
}

/** Plattegrond van het winkelcentrum op een zuil: de zones in hun kleur (geen getallen). */
function Infobord({ pos, rot }: { pos: V3; rot: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.7, 0.08, 0.5]} pos={[0, 0.04, 0]} color="#3b3a39" r={0.03} />
      {[-0.75, 0.75].map((x) => (
        <Blok key={x} size={[0.08, 2.0, 0.08]} pos={[x, 1.0, 0]} color="#3b3a39" r={0.02} />
      ))}
      <Blok size={[1.62, 1.12, 0.06]} pos={[0, 1.4, 0]} color="#3b3a39" r={0.03} />
      <Doek
        b={1.5}
        h={1.0}
        pos={[0, 1.4, 0.035]}
        sleutel="plattegrond-honderd"
        ppm={600}
        licht
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#f6f1e6';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#2b2f33';
          ctx.fillRect(0, 0, w, h * 0.13);
          tekstRegel(ctx, 'De Honderd · begane grond', w / 2, h * 0.07, h * 0.075, '#e9c46a', 700, 'center');
          // bovenaanzicht: x −16..16 → links/rechts, z +24 (onder) .. −24 (boven)
          const ox = w * 0.18;
          const oy = h * 0.17;
          const sx = (w * 0.64) / 32;
          const sz = (h * 0.8) / 48;
          const vak = (x0: number, x1: number, z0: number, z1: number, k: string, naam = '') => {
            const X = ox + (x0 + 16) * sx;
            const Y = oy + (z0 + 24) * sz;
            ctx.fillStyle = k;
            rondRect(ctx, X + 2, Y + 2, (x1 - x0) * sx - 4, (z1 - z0) * sz - 4, 6);
            ctx.fill();
            if (naam) {
              ctx.fillStyle = '#2f3634';
              ctx.font = `700 ${h * 0.034}px ${FONT}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(naam, X + ((x1 - x0) * sx) / 2, Y + ((z1 - z0) * sz) / 2);
            }
          };
          vak(-4, 4, -24, -8, '#f9d3df', 'Etalages');
          vak(-10, -4, -24, -8, '#f9d3df');
          vak(4, 10, -24, -8, '#f9d3df');
          vak(-8, 8, -8, 8, '#efe6d6', 'Koepel');
          vak(-16, -8, -8, 8, '#c4efe9', 'Drogist');
          vak(8, 16, -8, 8, '#ffe7a6', 'Bouwmarkt');
          vak(-4, 4, 8, 18, '#efe6d6');
          vak(4, 16, 8, 18, '#fde3c4', 'Markthal');
          vak(-16, -4, 8, 18, '#fde3c4', 'Mode');
          vak(-4, 4, 18, 24, '#dbe7f0');
          vak(4, 16, 18, 24, '#dbe7f0', 'Service');
          vak(-16, -4, 18, 24, '#fde3c4', 'Bioscoop');
          ctx.fillStyle = '#d83a2e';
          ctx.beginPath();
          ctx.arc(ox + 16 * sx, oy + (22.6 + 24) * sz, h * 0.025, 0, Math.PI * 2);
          ctx.fill();
          tekstRegel(ctx, 'U bent hier', ox + 16 * sx, oy + (20.3 + 24) * sz, h * 0.034, '#d83a2e', 700, 'center');
          ctx.fillStyle = '#0b5530';
          ctx.fillRect(ox + 14.3 * sx, oy - h * 0.005, 3.4 * sx, h * 0.018);
        }}
      />
    </group>
  );
}

// ─────────────────────────── Wat beweegt of verandert ───────────────────────────

/** Naamborden boven de puien (licht). [x, hoogte boven de eigen vloer, z], draaiing, verdieping, tekst, kleur, breedte. */
const GEVELBORDEN: { pos: V3; rot: number; v?: number; tekst: string; kleur: string; b: number }[] = [
  { pos: [3.83, 3.85, 21], rot: -R, tekst: 'Klantenservice', kleur: '#2f4a5e', b: 3.0 },
  { pos: [-3.83, 3.85, 21], rot: R, tekst: 'Bioscoop · Speelhal', kleur: '#7a1f2c', b: 3.4 },
  { pos: [3.83, 6.0, 13], rot: -R, tekst: 'Markthal', kleur: '#7a5236', b: 4.0 },
  { pos: [-3.83, 3.8, 13], rot: R, tekst: 'Modehuis', kleur: '#6b3a4f', b: 3.2 },
  { pos: [7.83, 3.8, 0], rot: -R, tekst: 'Bouwmarkt · Elektro', kleur: '#b88a00', b: 4.6 },
  { pos: [-7.83, 3.8, 0], rot: R, tekst: 'Drogist · Kapper', kleur: '#1d8f84', b: 4.6 },
  { pos: [0, 6.6, 17.83], rot: Math.PI, tekst: 'Winkelcentrum De Honderd', kleur: '#2b2f33', b: 6.0 },
  ...(
    [
      [-1, -10, 'Schoenen'],
      [-1, -14, 'OV-punt'],
      [-1, -18, 'Studieplek'],
      [-1, -22, 'Boeken'],
      [1, -10, 'Strand en zwem'],
      [1, -14, 'Wonen en bad'],
      [1, -18, 'Telecom'],
      [1, -22, 'Uitzendbureau'],
    ] as const
  ).map(([k, z, tekst]) => ({ pos: [k * 3.83, 3.6, z] as V3, rot: -k * R, tekst, kleur: '#c2255c', b: 2.8 })),
  { pos: [-7.83, 3.8, 0], rot: R, v: 1, tekst: 'Nieuws en media', kleur: '#2f6fd6', b: 4.2 },
  { pos: [-6, 3.8, 7.83], rot: Math.PI, v: 1, tekst: 'Galerijstraat', kleur: '#5b4a78', b: 3.2 },
  { pos: [7.83, 3.6, 5.5], rot: -R, v: 1, tekst: 'Foodcourt', kleur: '#d83a2e', b: 3.0 },
  { pos: [12, 3.7, -7.83], rot: 0, v: 1, tekst: 'Dakterras', kleur: '#6aa84f', b: 3.0 },
  { pos: [5, 3.7, -7.83], rot: 0, v: 1, tekst: 'Serre', kleur: '#6aa84f', b: 1.6 },
];

/** Downlights: lichtschijfjes in de plafonds. Een zone die nog "slaapt", brandt zwak; gaat de zone open, dan gaat het licht aan. */
const LAMPEN: { pos: V3; vanaf: number }[] = (() => {
  const uit: { pos: V3; vanaf: number }[] = [];
  const raster = (x0: number, x1: number, z0: number, z1: number, y: number, stap: number, vanaf: number) => {
    const nx = Math.max(1, Math.round((x1 - x0) / stap));
    const nz = Math.max(1, Math.round((z1 - z0) / stap));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) uit.push({ pos: [x0 + ((i + 0.5) * (x1 - x0)) / nx, y, z0 + ((j + 0.5) * (z1 - z0)) / nz], vanaf });
  };
  // fase-index: 0 terugblik, 2 instructie, 3 begeleid, 4 zelfstandig, 5 evaluatie
  raster(-4, 4, 18, 24, 4.68, 2.6, 0); // liftportaal
  raster(-16, -4, 18, 24, 4.68, 2.6, 3); // foyer
  raster(-16, -10, -16, -8, 4.68, 2.8, 4); // kapsalon
  for (const k of [-1, 1]) for (const z of [-10, -14, -18, -22]) raster(k > 0 ? 4 : -10, k > 0 ? 10 : -4, z - 2, z + 2, 4.68, 3, 5); // winkeltjes
  // onder de galerijvloer (rond de vide)
  for (let i = 0; i < 6; i++) {
    const t = -6.6 + (i * 13.2) / 5;
    uit.push({ pos: [t, 4.62, 6.5], vanaf: 4 }, { pos: [t, 4.62, -6.5], vanaf: 4 });
  }
  for (const z of [-2.6, 0, 2.6]) uit.push({ pos: [-6.5, 4.62, z], vanaf: 4 }, { pos: [6.5, 4.62, z], vanaf: 4 });
  raster(-16, -8, -8, 8, HV + 4.98, 2.8, 4); // mediaplein
  raster(-16, -4, 8, 18, HV + 4.98, 2.8, 4); // galerijstraat
  return uit;
})();

const FASE_LAMP = ['terugblik', 'doel', 'instructie', 'begeleid', 'zelfstandig', 'evaluatie', 'klaar'] as const;

function Downlights() {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.CircleGeometry(0.16, 16).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide }), LAMPEN.length);
    const o = new THREE.Object3D();
    LAMPEN.forEach((l, i) => {
      o.position.set(...l.pos);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color('#5a5246'));
    });
    m.frustumCulled = false;
    return m;
  }, []);
  const gezien = useRef(-1);
  const kleur = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const s = useSpel.getState();
    const f = s.docent ? 6 : faseIndex(s.fase);
    if (f === gezien.current) return;
    gezien.current = f;
    LAMPEN.forEach((l, i) => mesh.setColorAt(i, kleur.set(f >= l.vanaf ? '#fff1d6' : '#4a443c')));
    mesh.instanceColor!.needsUpdate = true;
  });
  return <primitive object={mesh} />;
}

/** De koepel als voortgangsbalk: 100 ruiten; elke goed opgeloste werkboekopdracht kleurt er een deel van goud. */
function KoepelRuiten() {
  const N_RING = 5;
  const N_RAND = 20;
  const r = 8 * 0.86 - 0.1; // straal van de glaskoepel van de motor (16 m breed × 0,86), iets naar binnen
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: '#ffc95a', transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
      N_RING * N_RAND,
    );
    m.frustumCulled = false;
    m.renderOrder = 2;
    return m;
  }, []);
  // plek van elke ruit: onderste ring eerst, dan rond
  const ruiten = useMemo(() => {
    const o = new THREE.Object3D();
    const midden = new THREE.Vector3(0, 10, 0);
    const lijst: THREE.Matrix4[] = [];
    const t0 = 0.26;
    const t1 = Math.PI / 2 - 0.04;
    const dt = (t1 - t0) / N_RING;
    for (let ring = N_RING - 1; ring >= 0; ring--)
      for (let i = 0; i < N_RAND; i++) {
        const th = t0 + (ring + 0.5) * dt;
        const ph = ((i + 0.5) / N_RAND) * Math.PI * 2;
        o.position.set(Math.sin(th) * Math.cos(ph) * r, 10 + Math.cos(th) * r, Math.sin(th) * Math.sin(ph) * r);
        o.lookAt(midden);
        o.scale.set(Math.sin(th) * r * ((Math.PI * 2) / N_RAND) * 0.86, r * dt * 0.86, 1);
        o.updateMatrix();
        lijst.push(o.matrix.clone());
      }
    return lijst;
  }, [r]);
  const nul = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);
  const aan = useRef(-1);
  const groei = useRef(0);
  useFrame((_, dt) => {
    const v = useSpel.getState().voortgang;
    const doel = Math.round((100 * WERKBOEK.filter((id) => v[id]?.goed).length) / WERKBOEK.length);
    if (doel !== aan.current) {
      aan.current = doel;
      groei.current = 0;
    }
    if (groei.current >= 1 && mesh.userData.klaar) return;
    groei.current = Math.min(1, groei.current + dt * 1.5);
    const tmp = new THREE.Matrix4();
    ruiten.forEach((m, i) => {
      if (i >= doel) return mesh.setMatrixAt(i, nul);
      // de laatst aangegane ruiten groeien even in
      const s = i >= doel - 3 ? 0.2 + 0.8 * groei.current : 1;
      tmp.copy(m).multiply(new THREE.Matrix4().makeScale(s, s, 1));
      mesh.setMatrixAt(i, tmp);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.klaar = true;
  });
  return <primitive object={mesh} />;
}

/** Het grote scherm boven de boog naar de etalagestraat: wat er staat, hangt af van de fase (en toont de koepel in procenten). */
function Mediascherm() {
  const fase = useSpel((s) => s.fase);
  const voortgang = useSpel((s) => s.voortgang);
  const pct = Math.round((100 * WERKBOEK.filter((id) => voortgang[id]?.goed).length) / WERKBOEK.length);
  const f = faseIndex(fase);
  const [kop, onder, kleur] =
    f < 4
      ? ['GESLOTEN', 'Morgen is het Kortingsdag!', '#e86f8a']
      : f === 4
        ? ['Nieuws en media', '↑ 1e verdieping · koepel: ' + pct + '%', '#5aa9ff']
        : f === 5
          ? ['Eindcheck', 'Langs de etalages naar de uitgang', '#ff6fa0']
          : ['Bedankt!', 'Fijne Kortingsdag · koepel: ' + pct + '%', '#5fe0a1'];
  return (
    <Doek
      key={`${kop}|${onder}`}
      b={4.4}
      h={2.2}
      pos={[0, 8.3, -6.9]}
      sleutel={`mediascherm-${kop}-${onder}`}
      licht
      ppm={180}
      teken={(ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#101a3a');
        g.addColorStop(1, '#1d0f2e');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = kleur;
        ctx.fillRect(0, h * 0.82, w, h * 0.04);
        tekstRegel(ctx, kop, w / 2, h * 0.38, h * 0.26, kleur, 700, 'center');
        tekstRegel(ctx, onder, w / 2, h * 0.66, h * 0.11, '#ffffff', 700, 'center');
        tekstRegel(ctx, 'De Honderd', w * 0.04, h * 0.92, h * 0.07, '#9fb4ff', 700, 'left');
      }}
    />
  );
}

const UUR_GEO = new THREE.BoxGeometry(0.07, 0.5, 0.02).translate(0, 0.22, 0);
const MIN_GEO = new THREE.BoxGeometry(0.05, 0.8, 0.02).translate(0, 0.36, 0);
/** Wijzers van de klok boven de uitgang: hij loopt echt (de tijd van je eigen klok). */
function Klokwijzers() {
  const uur = useRef<THREE.Mesh>(null);
  const min = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    const u = (d.getHours() % 12) + m / 60;
    if (min.current) min.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (uur.current) uur.current.rotation.z = -(u / 12) * Math.PI * 2;
  });
  return (
    <group position={[0, 6.6, -23.66]}>
      <mesh ref={uur} geometry={UUR_GEO} material={mat('#2b2f33')} />
      <mesh ref={min} position={[0, 0, 0.02]} geometry={MIN_GEO} material={mat('#2b2f33')} />
      <mesh position={[0, 0, 0.04]} material={mat('#c9a25a')}>
        <circleGeometry args={[0.06, 12]} />
      </mesh>
    </group>
  );
}

/** Fonteinwater: druppels rond het beeld; als er net een kluis open is gegaan, spuit hij een paar seconden hoger. */
function Fonteinwater() {
  const n = 16;
  const druppels = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: '#bfe8f2', transparent: true, opacity: 0.75, roughness: 0.1 }), n);
    m.frustumCulled = false;
    return m;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const kluizen = useRef(-1);
  const show = useRef(0);
  useFrame(({ clock }, dt) => {
    const k = Object.entries(useSpel.getState().kluizen).filter(([s, open]) => open && s.startsWith('4:')).length;
    if (kluizen.current >= 0 && k > kluizen.current) show.current = 6;
    kluizen.current = k;
    show.current = Math.max(0, show.current - dt);
    const hoog = 0.5 + (show.current > 0 ? 1.4 : 0);
    const t = clock.getElapsedTime();
    for (let i = 0; i < n; i++) {
      const f = (t * 0.7 + i / n) % 1;
      const a = (i / n) * Math.PI * 2;
      o.position.set(Math.cos(a) * (0.45 + f * 0.62), 0.55 + Math.sin(f * Math.PI) * hoog, Math.sin(a) * (0.45 + f * 0.62));
      o.scale.setScalar(1 - f * 0.5);
      o.updateMatrix();
      druppels.setMatrixAt(i, o.matrix);
    }
    druppels.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={druppels} />;
}

/** Lichtsnoeren: over het dakterras en onder het gewelf van de markthal. */
const SNOEREN: [number, number, number][][] = [
  [
    [6.4, HV + 3.5, -8.6],
    [15.6, HV + 3.5, -8.6],
    [6.4, HV + 3.5, -16],
    [15.6, HV + 3.5, -23.6],
    [6.4, HV + 3.5, -23.6],
  ],
  [
    [4.3, 6.4, 9.0],
    [15.7, 6.4, 12.0],
    [4.3, 6.4, 15.0],
    [15.7, 6.4, 17.6],
  ],
];

/** Fontein, koepel, scherm, klok, lichtjes, en alles aan de muren. */
export function Wereld4Levend() {
  return (
    <DoekAtlas>
      <Fonteinwater />
      <KoepelRuiten />
      <Downlights />
      <Mediascherm />
      <Klokwijzers />
      {SNOEREN.map((p, i) => (
        <Lichtsnoer key={i} punten={p} kleuren={i ? ['#ffd27a', '#ff9a5a', '#fff1c8'] : ['#ff4fa3', '#2ee6ff', '#ffe14d', '#ffffff']} zak={0.5} />
      ))}
    </DoekAtlas>
  );
}

function WandVast({ w }: { w: Wand }) {
  const rot = w.rot ?? 0;
  switch (w.soort) {
    case 'naambord':
      return (
        <group position={w.pos} rotation={[0, rot, 0]}>
          <Bord regels={[w.tekst]} b={w.b ?? 2.4} h={0.5} bg={w.kleur} fg={w.fg} licht />
        </group>
      );
    case 'schoolbord':
      return <Schoolbord pos={w.pos} rot={rot} regels={w.regels} b={w.b} h={w.h} />;
    case 'wandplank':
      return <Wandplank pos={w.pos} rot={rot} b={w.b} seed={w.seed} />;
    case 'poster':
      return <Poster pos={w.pos} rot={rot} b={w.b} h={w.h} motief={w.motief} />;
    case 'liftdeuren':
      return <Liftdeuren pos={w.pos} rot={rot} />;
    case 'frank':
      // easter egg: Frank uit het Spookkasteel heeft zijn eigen film in de bioscoop
      return (
        <group position={w.pos} rotation={[0, rot, 0]}>
          <Blok size={[w.b + 0.14, w.b * 1.25 + 0.14, 0.04]} color="#c9a25a" r={0.02} shadow={false} />
          <FrankPoster pos={[0, 0, 0.025]} b={w.b} tekst="Frank" achter="#2f1b3d" />
          <Bord regels={['Nu in de bioscoop']} b={w.b} h={0.18} pos={[0, -w.b * 0.62 - 0.16, 0.02]} bg="#2f1b3d" fg="#ffd23f" />
        </group>
      );
  }
}

/** Poster aan de muur, in een eigen getekend motief (geen getallen). */
function Poster({ pos, rot, b, h, motief }: { pos: V3; rot: number; b: number; h: number; motief: 'korting' | 'welkom' | 'strand' | 'spiegel' | 'kermis' | 'film' | 'nieuws' }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.08, h + 0.08, 0.04]} color="#3b3a39" r={0.02} shadow={false} />
      <Doek
        b={b}
        h={h}
        pos={[0, 0, 0.022]}
        sleutel={`poster4-${motief}-${b}-${h}`}
        ppm={400}
        licht={motief === 'kermis' || motief === 'film' || motief === 'nieuws'}
        teken={(ctx, w, hh) => {
          if (motief === 'spiegel') {
            const g = ctx.createLinearGradient(0, 0, w, hh);
            g.addColorStop(0, '#dfeef3');
            g.addColorStop(0.5, '#a9c8d4');
            g.addColorStop(1, '#e8f3f6');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, hh);
            return;
          }
          if (motief === 'strand') {
            ctx.fillStyle = '#7fc8e8';
            ctx.fillRect(0, 0, w, hh);
            ctx.fillStyle = '#ffd36b';
            ctx.beginPath();
            ctx.arc(w * 0.78, hh * 0.25, hh * 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2a9fd6';
            ctx.fillRect(0, hh * 0.55, w, hh * 0.15);
            ctx.fillStyle = '#f2dca0';
            ctx.fillRect(0, hh * 0.7, w, hh * 0.3);
            tekstRegel(ctx, 'Op reis!', w * 0.5, hh * 0.86, hh * 0.13, '#8a3b2a', 700, 'center');
            return;
          }
          if (motief === 'kermis' || motief === 'film') {
            ctx.fillStyle = motief === 'film' ? '#14102a' : '#24193f';
            ctx.fillRect(0, 0, w, hh);
            ctx.fillStyle = '#ffd36b';
            for (let x = 14; x < w; x += 30) {
              ctx.beginPath();
              ctx.arc(x, 12, 5, 0, Math.PI * 2);
              ctx.arc(x, hh - 12, 5, 0, Math.PI * 2);
              ctx.fill();
            }
            if (motief === 'kermis') tekstRegel(ctx, 'KERMIS', w / 2, hh * 0.52, hh * 0.42, '#ffd36b', 700, 'center');
            else {
              tekstRegel(ctx, 'DE KORTINGS-', w / 2, hh * 0.36, w * 0.13, '#ff6fa0', 700, 'center');
              tekstRegel(ctx, 'HELD', w / 2, hh * 0.52, w * 0.24, '#ffd36b', 700, 'center');
              tekstRegel(ctx, '★ ★ ★ ★', w / 2, hh * 0.72, w * 0.1, '#ffffff', 700, 'center');
            }
            return;
          }
          if (motief === 'nieuws') {
            ctx.fillStyle = '#0f1a33';
            ctx.fillRect(0, 0, w, hh);
            ctx.fillStyle = '#2f6fd6';
            ctx.fillRect(0, 0, w, hh * 0.22);
            tekstRegel(ctx, 'NIEUWS', w * 0.05, hh * 0.12, hh * 0.13, '#ffffff', 700, 'left');
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            for (let i = 0; i < 4; i++) ctx.fillRect(w * 0.05, hh * (0.34 + i * 0.14), w * (0.9 - (i % 2) * 0.25), hh * 0.05);
            return;
          }
          ctx.fillStyle = motief === 'korting' ? '#e86f8a' : '#2ec4b6';
          ctx.fillRect(0, 0, w, hh);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc((w * ((i * 37) % 100)) / 100, (hh * ((i * 61) % 100)) / 100, hh * 0.18, 0, Math.PI * 2);
            ctx.fill();
          }
          if (motief === 'korting') {
            tekstRegel(ctx, 'Kortingsdag!', w / 2, hh * (hh < w * 0.5 ? 0.52 : 0.4), Math.min(hh * 0.3, w * 0.16), '#ffffff', 700, 'center');
            if (hh > w * 0.5) tekstRegel(ctx, 'morgen', w / 2, hh * 0.66, w * 0.11, '#fff3a0', 700, 'center');
          } else tekstRegel(ctx, 'Welkom!', w / 2, hh * 0.52, Math.min(hh * 0.3, w * 0.2), '#ffffff', 700, 'center');
        }}
      />
    </group>
  );
}
