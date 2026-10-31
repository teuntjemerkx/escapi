// Wereld 5 – "Meetstation Noorderlicht": inrichting van alle kamers, gevelpanelen en de opbouw op het dak.
// Het gebouw zelf (vloeren, muren, ramen, deuren, trappen) komt uit de plattegrond in gebouw.json.
// Meubels met botsing staan ook in gebouw.json (binnendecor): zo staan model, botsing en check.mjs altijd gelijk.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { box, cirkel, opLaag, verhoog } from '../game/botsing';
import { FrankPopje } from '../game/frank';
import { Binnen, Kleed, StaandeLamp } from '../game/huis';
import { Blok, Cil, mat } from '../game/kit';
import { Bank, Fauteuil, Plant, Schoolbord } from '../game/meubels';
import { Statisch } from '../game/statisch';
import { useSpel } from '../game/store';
import { useTextuur } from '../game/tekst';
import gebouw from './gebouw.json';
import { BUITENDECOR, HV, LANTAARNS } from './huis';
import { KLUSSEN } from './klussen';
import { Noodlicht, systeemAan } from './licht';
import { LETTER, ROND, alinea, streep, tekst, vlak, virtueel } from './teken';
import { Dalkaart, SchermwandVast, StatusBalk, Tribune, Weerbeeld, Werkplekken, Zwaailicht } from './zaal';

type V3 = [number, number, number];
type Meubel = { naam: string; pos: [number, number]; maat: [number, number]; verdieping?: number; rond?: boolean };
const MEUBELS = gebouw.binnendecor as unknown as Meubel[];
/** Plek van een meubel uit gebouw.json: [x, vloerhoogte, z]. */
function m(naam: string): V3 {
  const o = MEUBELS.find((d) => d.naam === naam);
  if (!o) throw new Error(`Geen meubel "${naam}" in gebouw.json`);
  return [o.pos[0], (o.verdieping ?? 0) * HV, o.pos[1]];
}
const PI = Math.PI;

/** Botsingen en verhoogde vloeren van het decor (stations, kluizen en poort doet de motor). */
export function registreerDecor() {
  for (const o of MEUBELS)
    opLaag(o.verdieping ?? 0, () => {
      if (o.rond) cirkel(o.pos[0], o.pos[1], o.maat[0] / 2);
      else box(o.pos[0], o.pos[1], o.maat[0], o.maat[1]);
    });
  for (const o of BUITENDECOR) {
    if (o.rond) cirkel(o.pos[0], o.pos[1], o.maat[0] / 2);
    else box(o.pos[0], o.pos[1], o.maat[0], o.maat[1]);
  }
  for (const [x, z] of LANTAARNS) cirkel(x, z, 0.25);
  // tribune in de controlezaal: rij 2 op +0,3 m, rij 3 op +0,6 m (je stapt er soepel op)
  for (const x of [-2.9, 2.9]) {
    verhoog(x, -2.75, 4.2, 2.5, 0.3);
    verhoog(x, -0.5, 4.2, 2.0, 0.6);
  }
}

// ───────────────────────── klein decor ─────────────────────────

/** Wandklok met een plaatsnaam (kijkt naar +z; draai met `rot`). */
function Klok({ pos, rot = 0, plaats, uur }: { pos: V3; rot?: number; plaats: string; uur: number }) {
  const tex = useTextuur(
    0.5,
    0.62,
    virtueel(0.5, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#1f2328', 18);
      ctx.fillStyle = '#fbfaf6';
      ctx.beginPath();
      ctx.arc(W / 2, 100, 86, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        streep(ctx, W / 2 + Math.sin(a) * 70, 100 - Math.cos(a) * 70, W / 2 + Math.sin(a) * 80, 100 - Math.cos(a) * 80, '#1f2328', 5);
      }
      const a = ((uur % 12) / 12) * Math.PI * 2;
      streep(ctx, W / 2, 100, W / 2 + Math.sin(a) * 45, 100 - Math.cos(a) * 45, '#1f2328', 9);
      streep(ctx, W / 2, 100, W / 2, 30, '#1f2328', 6);
      tekst(ctx, plaats, W / 2, H - 28, { px: 32, kleur: '#ffd43b', gewicht: 700, uitlijn: 'center', max: W - 16 });
    }),
    `w5-klok-${plaats}`,
    200,
  );
  return (
    <mesh position={pos} rotation={[0, rot, 0]}>
      <planeGeometry args={[0.5, 0.62]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Groot vergrootglas op een standaard (uitlegkamer). */
function GroteLoep({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.3} rTop={0.26} h={0.08} pos={[0, 0.04, 0]} color="#2c2420" seg={16} />
      <Cil r={0} h={1.4} pos={[0, 0.74, 0]} color="#2c2420" seg={8} />
      <group position={[0, 1.75, 0.02]} rotation={[0, PI / 2 - 0.3, 0.2]}>
        <mesh material={mat('#c49a55', { metal: 0.5, rough: 0.35 })}>
          <torusGeometry args={[0.42, 0.06, 10, 32]} />
        </mesh>
        <mesh material={mat('#cfefff', { opacity: 0.35, rough: 0.05 })}>
          <circleGeometry args={[0.42, 28]} />
        </mesh>
        <Blok size={[0.12, 0.55, 0.1]} pos={[0.3, -0.62, 0]} rot={[0, 0, 0.55]} color="#7a3b34" r={0} />
      </group>
    </group>
  );
}

/** Serverkast (vast deel); de lampjes knipperen in `Levend`. Voorkant naar +z. */
function Serverkast({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.8, 2.2, 0.7]} pos={[0, 1.1, 0]} color="#1f2328" r={0} />
      {Array.from({ length: 8 }, (_, i) => (
        <Blok key={i} size={[0.68, 0.18, 0.02]} pos={[0, 0.3 + i * 0.24, 0.36]} color="#2f353b" r={0} shadow={false} />
      ))}
    </group>
  );
}

/** Noodaggregaat in de techniekruimte: gele kast, radiator, uitlaat naar het plafond. */
function Aggregaat({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[2.2, 0.14, 1.0]} pos={[0, 0.07, 0]} color="#3a3f45" r={0} />
      <Blok size={[1.6, 1.15, 0.9]} pos={[-0.2, 0.72, 0]} color="#d9a514" r={0} />
      <Blok size={[0.5, 1.15, 0.9]} pos={[0.82, 0.72, 0]} color="#2b2f35" r={0} />
      {Array.from({ length: 6 }, (_, i) => (
        <Blok key={i} size={[0.03, 0.9, 0.82]} pos={[0.6 + i * 0.07, 0.72, 0]} color="#6c737b" r={0} shadow={false} />
      ))}
      <Blok size={[0.45, 0.35, 0.05]} pos={[-0.55, 1.0, 0.47]} color="#1f2328" r={0} />
      <Cil r={0.08} h={1.9} pos={[-0.7, 2.25, -0.2]} color="#7d848b" seg={10} />
      <Cil r={0.11} h={0.3} pos={[-0.7, 1.35, -0.2]} color="#555b62" seg={10} />
    </group>
  );
}

/** Werkbank met gereedschapsbord (garage). */
function Werkbank({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[1.6, 0.06, 0.6]} pos={[0, 0.9, 0]} color="#8a5a32" r={0} />
      {[-0.72, 0.72].map((x) => (
        <Blok key={x} size={[0.06, 0.88, 0.55]} pos={[x, 0.44, 0]} color="#495057" r={0} />
      ))}
      <Blok size={[1.5, 0.04, 0.5]} pos={[0, 0.25, 0]} color="#495057" r={0} />
      <Blok size={[0.3, 0.2, 0.2]} pos={[-0.4, 1.03, 0]} color="#c92a2a" r={0} />
      <Blok size={[1.4, 0.9, 0.03]} pos={[0, 1.65, 0.26]} color="#5c6670" r={0} />
      {[-0.5, -0.2, 0.15, 0.45].map((x, i) => (
        <Blok key={x} size={[0.05, 0.35 + (i % 2) * 0.12, 0.04]} pos={[x, 1.65, 0.23]} color={i % 2 ? '#e8590c' : '#adb5bd'} r={0} shadow={false} />
      ))}
    </group>
  );
}

/** Stapel winterbanden. */
function Banden({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.13 + i * 0.24, 0]} rotation={[PI / 2, 0, 0]} material={mat('#26282b', { rough: 0.9 })}>
          <torusGeometry args={[0.28, 0.11, 8, 18]} />
        </mesh>
      ))}
    </group>
  );
}

/** Keukenblok met bovenkastjes (bemanningsverblijf). Achterkant tegen de muur op −z. */
function Keuken({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[3.6, 0.86, 0.58]} pos={[0, 0.43, 0]} color="#e9ecef" r={0} />
      <Blok size={[3.64, 0.04, 0.62]} pos={[0, 0.88, 0]} color="#4a4f55" r={0} />
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <Blok key={x} size={[0.02, 0.6, 0.02]} pos={[x, 0.5, 0.3]} color="#adb5bd" r={0} shadow={false} />
      ))}
      <Blok size={[0.5, 0.03, 0.38]} pos={[-0.6, 0.9, 0]} color="#adb5bd" r={0} />
      <Cil r={0} h={0.3} pos={[-0.6, 1.05, -0.18]} color="#adb5bd" seg={6} />
      <Blok size={[3.0, 0.65, 0.34]} pos={[-0.3, 1.95, -0.12]} color="#e9ecef" r={0} />
      <Blok size={[0.6, 1.9, 0.6]} pos={[1.5, 0.95, 0]} color="#dee2e6" r={0} />
      <Blok size={[0.03, 0.5, 0.03]} pos={[1.25, 1.2, 0.31]} color="#868e96" r={0} shadow={false} />
      {/* koffiezetapparaat en mokken */}
      <Blok size={[0.25, 0.35, 0.22]} pos={[0.6, 1.08, -0.08]} color="#1f2328" r={0} />
      <Cil r={0} h={0.1} pos={[0.2, 0.95, 0.1]} color="#c8432e" seg={10} />
      <Cil r={0} h={0.1} pos={[0.05, 0.95, 0.12]} color="#2ec4b6" seg={10} />
    </group>
  );
}

/** Telescoop op een driepoot, schuin omhoog. */
function Telescoop({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[0, 1, 2].map((i) => {
        const a = (i * PI * 2) / 3;
        return <Blok key={i} size={[0.04, 1.25, 0.04]} pos={[Math.sin(a) * 0.22, 0.6, Math.cos(a) * 0.22]} rot={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]} color="#2b2f35" r={0} />;
      })}
      <group position={[0, 1.25, 0]} rotation={[0.55, 0, 0]}>
        <Cil r={0.09} rTop={0.07} h={1.0} pos={[0, 0, -0.1]} rot={[PI / 2, 0, 0]} color="#e9ecef" seg={14} />
        <Cil r={0.1} h={0.12} pos={[0, 0, -0.62]} rot={[PI / 2, 0, 0]} color="#1f2328" seg={14} />
      </group>
    </group>
  );
}

/** Wereldbol op een standaard. */
function Globe({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.22} rTop={0.18} h={0.06} pos={[0, 0.03, 0]} color="#5a3a24" seg={14} />
      <Cil r={0} h={0.75} pos={[0, 0.42, 0]} color="#5a3a24" seg={8} />
      <mesh position={[0, 0.98, 0]} material={mat('#2f6b8a', { rough: 0.6 })} castShadow>
        <sphereGeometry args={[0.24, 18, 12]} />
      </mesh>
      <mesh position={[0, 0.98, 0]} rotation={[0, 0, 0.4]} material={mat('#c49a55', { metal: 0.6, rough: 0.4 })}>
        <torusGeometry args={[0.27, 0.012, 6, 28]} />
      </mesh>
    </group>
  );
}

/** Hanglamp (kap aan een snoer); de gloed komt uit het lichtsysteem. */
function Hanglamp({ pos, kleur = '#1f2328' }: { pos: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Cil r={0} h={0.9} pos={[0, 0.45, 0]} color="#111" seg={4} />
      <Cil r={0.24} rTop={0.06} h={0.2} pos={[0, -0.05, 0]} color={kleur} seg={14} />
    </group>
  );
}

/** Bank met kussens (recreatie). Kijkt naar +z (draai met `rot`). */
function Sofa({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.6, 0.42, 0.75]} pos={[0, 0.21, 0]} color="#3b6b7d" r={0.06} />
      <Blok size={[1.6, 0.5, 0.18]} pos={[0, 0.6, -0.3]} color="#335d6d" r={0.06} />
      {[-0.74, 0.74].map((x) => (
        <Blok key={x} size={[0.14, 0.3, 0.75]} pos={[x, 0.52, 0]} color="#335d6d" r={0.05} />
      ))}
      <Blok size={[0.4, 0.3, 0.12]} pos={[0.45, 0.58, -0.15]} rot={[-0.3, 0, 0.1]} color="#ffc94d" r={0.05} />
    </group>
  );
}

/** Halterrek met gewichten. */
function Halterrek({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[0.8, 0.05, 0.5]} pos={[0, 0.5, 0]} color="#2b2f35" r={0} />
      <Blok size={[0.8, 0.05, 0.5]} pos={[0, 0.15, 0]} color="#2b2f35" r={0} />
      {[-0.36, 0.36].map((x) => (
        <Blok key={x} size={[0.05, 0.55, 0.45]} pos={[x, 0.28, 0]} color="#2b2f35" r={0} />
      ))}
      {[-0.22, 0, 0.22].map((x, i) => (
        <group key={x} position={[x, 0.6, 0]}>
          <Cil r={0.06 + i * 0.01} h={0.07} pos={[0, 0, -0.12]} rot={[PI / 2, 0, 0]} color="#1b1f24" seg={10} />
          <Cil r={0.06 + i * 0.01} h={0.07} pos={[0, 0, 0.12]} rot={[PI / 2, 0, 0]} color="#1b1f24" seg={10} />
          <Cil r={0} h={0.3} rot={[PI / 2, 0, 0]} color="#adb5bd" seg={6} />
        </group>
      ))}
    </group>
  );
}

/** Kaartenkast met platte laden en een ingelijste kaart erboven (tegen de muur op −z). */
function Kaartenkast({ pos }: { pos: V3 }) {
  const tex = useTextuur(
    2.4,
    1.2,
    virtueel(2.4, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#efe4c8');
      ctx.strokeStyle = '#b39a6a';
      ctx.lineWidth = 3;
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 60 + i * 34 + Math.sin(x * 0.01 + i) * 18);
        ctx.stroke();
      }
      ctx.strokeStyle = '#3f7fbf';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(40, H - 60);
      ctx.bezierCurveTo(300, H - 160, 600, H - 30, W - 40, H - 120);
      ctx.stroke();
      tekst(ctx, 'Kaart van het dal', 40, 40, { px: 34, kleur: '#5a3a24', gewicht: 700, font: LETTER });
    }),
    'w5-kaart-dal',
    120,
  );
  return (
    <group position={pos}>
      <Blok size={[3.0, 0.95, 0.45]} pos={[0, 0.475, 0]} color="#7a5233" r={0} />
      {[0, 1, 2, 3].map((i) => (
        <Blok key={i} size={[2.8, 0.02, 0.02]} pos={[0, 0.2 + i * 0.22, 0.23]} color="#c49a55" r={0} shadow={false} />
      ))}
      <Blok size={[2.56, 1.36, 0.05]} pos={[0, 1.9, -0.18]} color="#5a3a24" r={0} />
      <mesh position={[0, 1.9, -0.15]}>
        <planeGeometry args={[2.4, 1.2]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Tafel met vier schermen (datakamer). */
function Datatafel({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[2.0, 0.05, 1.0]} pos={[0, 0.74, 0]} color="#3a4450" r={0} />
      {[-0.9, 0.9].map((x) =>
        [-0.42, 0.42].map((z) => <Blok key={`${x}${z}`} size={[0.05, 0.72, 0.05]} pos={[x, 0.36, z]} color="#2b2f35" r={0} />),
      )}
      {[-0.5, 0.5].map((x) =>
        [-1, 1].map((k) => (
          <group key={`${x}${k}`} position={[x, 0.77, k * 0.18]} rotation={[0, k > 0 ? 0 : PI, 0]}>
            <Blok size={[0.6, 0.38, 0.04]} pos={[0, 0.3, 0]} color="#15181c" r={0} />
            <mesh position={[0, 0.3, 0.022]} material={mat('#1d4f73', { emissive: '#5fd0ff' })}>
              <planeGeometry args={[0.54, 0.32]} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}

/** Radartafel onder het raam van de uitkijkpost (het radarbeeld draait in `Levend`). */
function Radarconsole({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[2.4, 0.9, 0.6]} pos={[0, 0.45, 0]} color="#2b323a" r={0} />
      <Blok size={[2.44, 0.04, 0.64]} pos={[0, 0.92, 0]} color="#3a4450" r={0} />
      <Cil r={0.36} h={0.03} pos={[-0.5, 0.95, 0]} color="#0d1a12" seg={28} />
      {[0.4, 0.8].map((x) => (
        <Blok key={x} size={[0.3, 0.03, 0.2]} pos={[x, 0.95, 0.05]} color="#15181c" r={0} shadow={false} />
      ))}
    </group>
  );
}

/** Infozuil op de galerij met "Wist je dat?" aan twee kanten. */
function Infozuil({ pos }: { pos: V3 }) {
  const tex = useTextuur(
    0.6,
    0.9,
    virtueel(0.6, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#1b2a41', 16);
      tekst(ctx, 'Wist je dat?', W / 2, 60, { px: 34, kleur: '#ffd43b', gewicht: 800, uitlijn: 'center', font: ROND });
      alinea(ctx, 'Op Mount Washington (VS) waaide het in 1934: 372 km per uur.', 24, 140, W - 48, { px: 26, kleur: '#ffffff', gewicht: 600, regelH: 34 });
      alinea(ctx, 'Op de Zuidpool staat het station op poten. De sneeuw waait eronderdoor.', 24, 250, W - 48, { px: 26, kleur: '#cfe8ff', gewicht: 600, regelH: 34 });
    }),
    'w5-wistjedat',
    260,
  );
  return (
    <group position={pos}>
      <Blok size={[0.5, 1.5, 0.12]} pos={[0, 0.75, 0]} color="#2b323a" r={0} />
      {[1, -1].map((k) => (
        <mesh key={k} position={[0, 1.0, k * 0.065]} rotation={[0, k > 0 ? 0 : PI, 0]}>
          <planeGeometry args={[0.44, 0.66]} />
          <meshStandardMaterial map={tex} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ───────────────────────── gevel en dak ─────────────────────────

/** Naden van de metalen gevelpanelen, een betonplint en een band op de verdiepingsvloer. Niet over ramen en deuren. */
function GevelPanelen() {
  const geo = useMemo(() => {
    const delen: THREE.BufferGeometry[] = [];
    const H = HV + (gebouw.muurHoogte as number); // 6,7 m
    // openingen per gevel en verdieping (ramen, deuren, uitgang)
    const open = gebouw.doorgangen
      .map((d) => ({ as: d.as, pos: d.pos, b: (d as { breed?: number }).breed ?? 1.6, v: (d as { verdieping?: number }).verdieping ?? 0 }))
      .concat([{ as: 'x', pos: gebouw.uitgang.pos, b: 3.8, v: 0 }]);
    const gevels: { as: 'x' | 'z'; c: number; van: number; tot: number; buiten: number }[] = [
      { as: 'x', c: -10, van: -16, tot: 16, buiten: -1 },
      { as: 'x', c: 9, van: -16, tot: 16, buiten: 1 },
      { as: 'z', c: -16, van: -10, tot: 9, buiten: -1 },
      { as: 'z', c: 16, van: -10, tot: 9, buiten: 1 },
    ];
    const plaats = (g: THREE.BufferGeometry, as: 'x' | 'z', c: number, l: number, y: number, buiten: number) => {
      if (as === 'x') g.translate(l, y, c + buiten * 0.165);
      else {
        g.rotateY(PI / 2);
        g.translate(c + buiten * 0.165, y, l);
      }
      delen.push(g);
    };
    for (const gv of gevels) {
      const lengte = gv.tot - gv.van;
      // plint en verdiepingsband over de hele lengte (de sluis staat ervoor: daar geen plint)
      plaats(new THREE.BoxGeometry(lengte + 0.36, 0.35, 0.05), gv.as, gv.c, (gv.van + gv.tot) / 2, 0.175, gv.buiten);
      plaats(new THREE.BoxGeometry(lengte + 0.36, 0.16, 0.05), gv.as, gv.c, (gv.van + gv.tot) / 2, HV - 0.08, gv.buiten);
      for (const v of [0, 1]) {
        const gaten = open
          .filter((o) => o.as === gv.as && Math.abs((o.as === 'x' ? o.pos[1] : o.pos[0]) - gv.c) < 0.05 && o.v === v)
          .map((o) => {
            const p = o.as === 'x' ? o.pos[0] : o.pos[1];
            return [p - o.b / 2 - 0.12, p + o.b / 2 + 0.12];
          });
        // de sluis steekt uit de zuidgevel
        if (gv.c === 9 && v === 0) gaten.push([-2.2, 2.2]);
        const y0 = v === 0 ? 0.35 : HV;
        const y1 = v === 0 ? HV - 0.16 : H;
        for (let l = gv.van + 1.2; l < gv.tot - 0.1; l += 1.2) {
          if (gaten.some(([a, b]) => l > a && l < b)) continue;
          plaats(new THREE.BoxGeometry(0.035, y1 - y0, 0.03), gv.as, gv.c, l, (y0 + y1) / 2, gv.buiten);
        }
      }
    }
    return mergeGeometries(delen.map((g) => g.toNonIndexed()))!;
  }, []);
  return <mesh geometry={geo} material={mat('#4e555d', { rough: 0.7 })} receiveShadow />;
}

/** Radome (witte bol), sterrenkoepel, mast met windmeter en een schotel op het platte dak. */
function DakOpbouw() {
  const dak = HV + (gebouw.muurHoogte as number) + 0.08;
  const wit = mat('#eef1f4', { rough: 0.55 });
  return (
    <>
      {/* radome op de datakamer */}
      <group position={[-12, dak, -7]}>
        <Cil r={1.5} h={0.7} pos={[0, 0.35, 0]} color="#c3c8cf" seg={20} />
        <mesh position={[0, 0.7, 0]} material={wit} castShadow>
          <sphereGeometry args={[1.9, 20, 12, 0, PI * 2, 0, PI / 1.7]} />
        </mesh>
      </group>
      {/* sterrenkoepel op de kaartenkamer */}
      <group position={[-12, dak, 5.5]}>
        <Cil r={1.35} h={1.1} pos={[0, 0.55, 0]} color="#d5dade" seg={20} />
        <mesh position={[0, 1.1, 0]} material={wit} castShadow>
          <sphereGeometry args={[1.35, 20, 10, 0, PI * 2, 0, PI / 2]} />
        </mesh>
        <Blok size={[0.45, 1.3, 0.1]} pos={[0, 1.75, 0.95]} rot={[0.6, 0, 0]} color="#2b2f35" r={0} />
      </group>
      {/* mast op de uitkijkpost */}
      <group position={[13.6, dak, -8.6]}>
        <Blok size={[0.8, 0.3, 0.8]} pos={[0, 0.15, 0]} color="#8d929a" r={0} />
        <Cil r={0.07} rTop={0.05} h={6.5} pos={[0, 3.55, 0]} color="#e03131" seg={8} />
        {[1.5, 3, 4.5].map((y) => (
          <Cil key={y} r={0.075} h={0.5} pos={[0, y, 0]} color="#f1f3f5" seg={8} />
        ))}
        <Cil r={0.25} h={0.22} pos={[0.32, 4.0, 0]} rot={[0, 0, PI / 2]} color="#e9ecef" seg={14} />
      </group>
      {/* schotel op de recreatie */}
      <group position={[12.5, dak, 6.0]}>
        <Cil r={0.08} h={1.0} pos={[0, 0.5, 0]} color="#adb5bd" seg={8} />
        <group position={[0, 1.2, 0]} rotation={[-0.8, 0.5, 0]}>
          <mesh material={mat('#e9edf1', { rough: 0.5 })} castShadow>
            <sphereGeometry args={[0.9, 18, 6, 0, PI * 2, 0, 0.6]} />
          </mesh>
        </group>
      </group>
      {/* ventilatiekasten */}
      <Blok size={[2.2, 0.9, 1.2]} pos={[4, dak + 0.45, -6]} color="#9aa3ad" r={0} />
      <Blok size={[1.4, 0.7, 1.0]} pos={[-4, dak + 0.35, 6]} color="#9aa3ad" r={0} />
    </>
  );
}

// ───────────────────────── vaste aankleding ─────────────────────────

/** Vaste aankleding: wordt samengevoegd tot weinig meshes. */
export function Wereld5Decor() {
  const L1 = HV;
  return (
    <>
      <GevelPanelen />
      <DakOpbouw />

      {/* ── Sluis: laarzen, jassen, mat ── */}
      <group position={m('laarzenrek')}>
        <Blok size={[0.38, 0.3, 1.55]} pos={[0, 0.15, 0]} color="#5b6168" r={0} />
        {[-0.55, -0.2, 0.15, 0.5].map((z, i) => (
          <Blok key={z} size={[0.26, 0.32, 0.12]} pos={[0.02, 0.46, z]} color={['#c92a2a', '#1f2328', '#2f6fb6', '#495057'][i]} r={0} />
        ))}
      </group>
      <group position={m('jassenrek')}>
        <Blok size={[0.06, 0.06, 1.5]} pos={[0.1, 1.75, 0]} color="#adb5bd" r={0} />
        {[-0.5, -0.1, 0.35].map((z, i) => (
          <Blok key={z} size={[0.18, 0.95, 0.42]} pos={[0.02, 1.25, z]} color={['#e8590c', '#1c7ed6', '#2b8a3e'][i]} r={0.06} />
        ))}
      </group>
      <Blok size={[1.6, 0.012, 1.0]} pos={[0, 0.006, 11.2]} color="#2b2f35" r={0} shadow={false} />

      {/* ── Hal ── */}
      <Bank pos={m('wachtbank')} rot={PI / 2} b={1.8} />
      <Plant pos={m('plant hal')} soort={2} />
      <Kleed pos={[-1.2, 5.6]} b={4.2} d={2.8} kleur="#2f4f63" rand="#c9a25a" />
      <StaandeLamp pos={[7.35, 0, 7.9]} />

      {/* ── Uitlegkamer ── */}
      <Bank pos={m('bank uitleg 1')} rot={-PI / 2} b={2.4} />
      <Bank pos={m('bank uitleg 2')} rot={-PI / 2} b={2.4} />
      <GroteLoep pos={m('loep')} />
      <Schoolbord pos={[-11.8, 1.75, 2.17]} regels={['De aflees-loep', '1 Zoek je getal op de as', '2 Volg de hulplijn', '3 Lees af op de andere as']} b={2.9} h={1.6} />
      <Kleed pos={[-12.2, 5.5]} b={4.0} d={3.6} kleur="#35506b" />

      {/* ── Controlezaal ── */}
      <Tribune />
      <SchermwandVast />
      <Klok pos={[7.83, 2.85, -3.0]} rot={-PI / 2} plaats="Groningen" uur={15} />
      <Klok pos={[7.83, 2.85, -0.8]} rot={-PI / 2} plaats="Londen" uur={14} />

      {/* ── Techniek ── */}
      <Aggregaat pos={m('aggregaat')} />
      <Serverkast pos={m('serverkast')} />
      <Blok size={[0.25, 0.1, 5.6]} pos={[-8.4, 3.0, -1.0]} color="#7d848b" r={0} />
      <Blok size={[7.4, 0.1, 0.25]} pos={[-12, 3.0, -3.7]} color="#7d848b" r={0} />

      {/* ── Garage ── */}
      <Werkbank pos={m('werkbank')} />
      <Banden pos={m('banden')} />

      {/* ── Bemanningsverblijf ── */}
      <Keuken pos={m('keuken')} />
      <Kleed pos={[11.0, 5.9]} b={3.2} d={2.0} kleur="#8a2f2a" />
      <StaandeLamp pos={[15.45, 0, 8.45]} />

      {/* ── Galerij (verdieping 1) ── */}
      <Bank pos={m('bank galerij 1')} rot={PI} b={2.4} />
      <Bank pos={m('bank galerij 2')} rot={PI} b={2.4} />
      <Telescoop pos={m('telescoop galerij')} rot={PI} />
      <group position={m('zithoek')}>
        <Blok size={[1.0, 0.42, 0.6]} pos={[0, 0.21, 0]} color="#7a5233" r={0} />
        <Fauteuil pos={[-1.0, 0, 0]} rot={PI / 2} kleur="#b5654a" />
        <Fauteuil pos={[1.0, 0, 0]} rot={-PI / 2} kleur="#b5654a" />
      </group>
      <group position={[0, L1, 0]}>
        <Kleed pos={[-3.5, 6.0]} b={3.0} d={2.2} kleur="#5c2b25" />
      </group>
      <Infozuil pos={m('infozuil')} />
      <Plant pos={m('plant galerij')} soort={1} />

      {/* ── Kaartenkamer (verdieping 1) ── */}
      <Globe pos={m('globe')} />
      <Kaartenkast pos={m('kaartenkast')} />
      {[
        [-14, 3.9],
        [-10.6, 4.1],
        [-14, 7.6],
        [-10.7, 7.6],
      ].map(([x, z]) => (
        <Hanglamp key={`${x}${z}`} pos={[x, L1 + 2.45, z]} kleur="#2f4a3a" />
      ))}

      {/* ── Datakamer (verdieping 1) ── */}
      <Datatafel pos={m('datatafel')} />

      {/* ── Recreatie (verdieping 1) ── */}
      <Sofa pos={m('bank recreatie')} rot={PI} />
      <Halterrek pos={m('halterrek')} />
      <Plant pos={[8.6, L1, 8.4]} soort={0} />

      {/* ── Uitkijkpost (verdieping 1) ── */}
      <Radarconsole pos={m('radarconsole')} />
      <Telescoop pos={m('telescoop uitkijk')} rot={PI + 0.5} />

      {/* verstopt: Frank uit Wereld 2 zit als piepklein toeschouwertje op de bank en kijkt naar de coopertest */}
      <FrankPopje pos={[m('bank recreatie')[0] - 0.35, L1 + 0.43, m('bank recreatie')[2]]} rot={PI - 0.6} s={0.3} />
    </>
  );
}

// ───────────────────────── levend ─────────────────────────

/** Statusscherm in de hal: per systeem STORING (rood, knippert) of AAN (groen). */
function HalStatus({ pos, rot }: { pos: V3; rot: number }) {
  const kluizen = useSpel((s) => s.kluizen);
  const wereld = useSpel((s) => s.wereld);
  const aan = KLUSSEN.map((k) => systeemAan(kluizen, wereld, k.id));
  const sleutel = aan.map((a) => (a ? 1 : 0)).join('');
  const b = 2.4;
  const h = 1.4;
  const tex = useTextuur(
    b,
    h,
    virtueel(b, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#0d1620');
      tekst(ctx, 'SYSTEMEN', W / 2, 62, { px: 58, kleur: '#7fd1ff', gewicht: 700, uitlijn: 'center', font: ROND });
      KLUSSEN.forEach((k, i) => {
        const y = 170 + i * 135;
        vlak(ctx, 30, y - 52, W - 60, 104, '#16232f', 18);
        vlak(ctx, 30, y - 52, 20, 104, k.kleur, 8);
        tekst(ctx, k.naam.replace('Systeem ', ''), 75, y, { px: 48, kleur: '#ffffff', gewicht: 700, font: LETTER });
        const ok = aan[i];
        vlak(ctx, W - 330, y - 38, 290, 76, ok ? '#2b8a3e' : '#c92a2a', 38);
        tekst(ctx, ok ? 'AAN' : 'STORING', W - 185, y + 2, { px: 42, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
      });
      void H;
    }),
    `w5-halstatus-${sleutel}`,
    140,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.14, h + 0.14, 0.06]} pos={[0, 0, -0.04]} color="#1f2328" r={0} />
      <mesh>
        <planeGeometry args={[b, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Knipperende lampjes op de serverkast (per kleur één vorm: 3 tekenstappen). */
function ServerLampjes({ pos }: { pos: V3 }) {
  const mats = useMemo(() => ['#51cf66', '#ffd43b', '#4dabf7'].map((k) => new THREE.MeshBasicMaterial({ color: k, toneMapped: false, transparent: true })), []);
  const geos = useMemo(
    () =>
      [0, 1, 2].map((kl) => {
        const delen: THREE.BufferGeometry[] = [];
        for (let i = 0; i < 8; i++)
          for (let j = 0; j < 3; j++) {
            if ((i + j) % 3 !== kl) continue;
            const g = new THREE.PlaneGeometry(0.035, 0.035);
            g.translate(-0.22 + j * 0.08, 0.3 + i * 0.24, 0.372);
            delen.push(g);
          }
        return mergeGeometries(delen)!;
      }),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    mats.forEach((mt, i) => (mt.opacity = 0.3 + 0.7 * (Math.sin(t * (2.2 + i * 1.3) + i) > 0 ? 1 : 0)));
  });
  return (
    <group position={pos}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mats[i]} />
      ))}
    </group>
  );
}

/** Radarbeeld met een draaiende streep (uitkijkpost). */
function Radar({ pos }: { pos: V3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.34, 24, 0, 0.5);
    g.rotateX(-PI / 2);
    return g;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 1.6;
  });
  return (
    <group position={pos}>
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <ringGeometry args={[0.16, 0.17, 24]} />
        <meshBasicMaterial color="#2fbf71" toneMapped={false} />
      </mesh>
      <mesh ref={ref} geometry={geo}>
        <meshBasicMaterial color="#51cf66" transparent opacity={0.45} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Bewegende en oplichtende delen. */
export function Wereld5Levend() {
  const NOORD = -9.85;
  return (
    <>
      <Noodlicht />
      <Binnen>
        <Werkplekken />
        <StatusBalk />
        <Dalkaart />
        <Weerbeeld />
        <Zwaailicht pos={[-2.9, 5.7, NOORD + 0.12]} />
        <Zwaailicht pos={[2.9, 5.7, NOORD + 0.12]} />
        <HalStatus pos={[-7.82, 1.75, 3.25]} rot={PI / 2} />
        <ServerLampjes pos={m('serverkast')} />
        <Radar pos={[m('radarconsole')[0] - 0.5, HV + 0.97, m('radarconsole')[2]]} />
      </Binnen>
    </>
  );
}
