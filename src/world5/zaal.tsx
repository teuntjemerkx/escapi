// Wereld 5 – de controlezaal: tribune met drie rijen consoles, de schermwand boven de ramen
// (statusbalk, dalkaart en weerbeeld) en de werkplekken die aangaan bij Samen oefenen.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { Mens } from '../game/mens';
import { useSpel } from '../game/store';
import { useTextuur } from '../game/tekst';
import gebouw from './gebouw.json';
import { KLUSSEN } from './klussen';
import { systeemAan } from './licht';
import { LETTER, ROND, streep, tekst, vlak, virtueel } from './teken';

type V3 = [number, number, number];
const NOORD = -9.85; // binnenkant van de noordwand

/** Werkplekken op rij 2 en rij 3: [x, z van het bureau, vloerhoogte]. Volgorde = volgorde van aangaan. */
export const WERKPLEKKEN: [number, number, number][] = [
  [-4.2, -3.25, 0.3],
  [-2.9, -3.25, 0.3],
  [-1.6, -3.25, 0.3],
  [2.2, -3.25, 0.3],
  [3.6, -3.25, 0.3],
  [-4.2, -0.95, 0.6],
  [-2.9, -0.95, 0.6],
  [-1.6, -0.95, 0.6],
  [2.2, -0.95, 0.6],
  [3.6, -0.95, 0.6],
];
/** De stations van Samen oefenen: elk goed opgelost station zet een werkplek aan. */
const OPDRACHTEN_VAN = Object.fromEntries(Object.entries(gebouw.stations).map(([id, st]) => [id, st.opdrachten as string[]]));
const BEGELEID = ['aquarium-kassa', 'lesrooster', 'vliegschema', 'taartscherm', 'ijsdikte', 'smartphone', 'drankautomaat', 'strandfeest', 'studieschuld', 'schepsnoep'];

// ───────────────────────── vast (Decor) ─────────────────────────

function Bureaustoel({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Cil r={0.28} h={0.04} pos={[0, 0.06, 0]} color="#1b1f24" seg={10} />
      <Cil r={0} h={0.38} pos={[0, 0.25, 0]} color="#5d656e" seg={6} />
      <Blok size={[0.5, 0.08, 0.48]} pos={[0, 0.47, 0]} color="#30373f" r={0} />
      <Blok size={[0.48, 0.55, 0.07]} pos={[0, 0.8, 0.22]} color="#30373f" r={0} />
    </group>
  );
}

/** Een bureau van 4 m met drie (of twee) werkplekken: blad, voorpaneel, schermen (de beeldvlakken zitten in `Levend`). */
function Consolerij({ x, z, h, plekken }: { x: number; z: number; h: number; plekken: number[] }) {
  return (
    <group position={[0, h, 0]}>
      <Blok size={[4.0, 0.06, 0.8]} pos={[x, 0.74, z]} color="#3a4450" r={0} />
      <Blok size={[4.0, 0.7, 0.06]} pos={[x, 0.36, z - 0.37]} color="#222830" r={0} />
      <Blok size={[0.06, 0.7, 0.76]} pos={[x - 1.97, 0.36, z]} color="#222830" r={0} />
      <Blok size={[0.06, 0.7, 0.76]} pos={[x + 1.97, 0.36, z]} color="#222830" r={0} />
      {plekken.map((px) => (
        <group key={px}>
          {[-0.29, 0.29].map((dx) => (
            <group key={dx} position={[px + dx, 0.77, z - 0.12]} rotation={[0, dx > 0 ? -0.18 : 0.18, 0]}>
              <Blok size={[0.58, 0.37, 0.04]} pos={[0, 0.3, 0]} color="#15181c" r={0} />
              <Blok size={[0.05, 0.12, 0.05]} pos={[0, 0.06, -0.02]} color="#3a4049" r={0} />
            </group>
          ))}
          <Blok size={[0.45, 0.02, 0.15]} pos={[px, 0.78, z + 0.18]} color="#121417" r={0} />
          <Bureaustoel pos={[px, 0, z + 0.72]} rot={Math.PI} />
        </group>
      ))}
    </group>
  );
}

/** Tribune (rij 2 op +0,3 m, rij 3 op +0,6 m) met de consoles en stoelen. De botsing staat in registreer(). */
export function Tribune() {
  const tapijt = '#2c3846';
  return (
    <>
      {[-2.9, 2.9].map((x) => (
        <group key={x}>
          <Blok size={[4.2, 0.3, 2.5]} pos={[x, 0.15, -2.75]} color={tapijt} r={0} />
          <Blok size={[4.2, 0.6, 2.0]} pos={[x, 0.3, -0.5]} color={tapijt} r={0} />
          {/* aluminium neuzen */}
          <Blok size={[4.22, 0.03, 0.06]} pos={[x, 0.3, -3.98]} color="#9aa3ad" r={0} />
          <Blok size={[4.22, 0.03, 0.06]} pos={[x, 0.6, -1.48]} color="#9aa3ad" r={0} />
        </group>
      ))}
      {/* rij 1 (op de vloer) heeft geen consoles: daar staan het ronde scherm en de formulemachine */}
      <Consolerij x={-2.9} z={-3.25} h={0.3} plekken={[-4.2, -2.9, -1.6]} />
      <Consolerij x={2.9} z={-3.25} h={0.3} plekken={[2.2, 3.6]} />
      <Consolerij x={-2.9} z={-0.95} h={0.6} plekken={[-4.2, -2.9, -1.6]} />
      <Consolerij x={2.9} z={-0.95} h={0.6} plekken={[2.2, 3.6]} />
      {/* de dienstleider: zit achter haar console en wacht op koffie */}
      <Mens c={{ shirt: '#c8432e', broek: '#2b3038', huid: '#c98f6b', haar: '#3b2618', schoen: '#1b1f24' }} houding="zit" pos={[3.6, 0.6 + 0.05, -0.23]} rot={Math.PI} fijn={false} />
      {/* laadstation van Bliep op het bureau van de dienstleider */}
      <group position={[4.55, 1.36, -0.95]}>
        <Cil r={0.16} rTop={0.13} h={0.05} color="#d9dee3" seg={16} />
        <Cil r={0.09} h={0.012} pos={[0, 0.03, 0]} color="#6fe8c0" seg={16} />
      </group>
    </>
  );
}

/** Lijsten van de schermwand boven de ramen en de poort. De beelden zelf staan in `Levend`. */
export function SchermwandVast() {
  return (
    <group position={[0, 0, NOORD + 0.04]}>
      {/* donkere achterwand van de schermen */}
      <Blok size={[15.6, 3.0, 0.08]} pos={[0, 4.75, 0]} color="#161b21" r={0} />
      {/* lijsten */}
      {[-5.25, 0, 5.25].map((x) => (
        <Blok key={x} size={[x ? 4.8 : 5.4, x ? 2.4 : 1.7, 0.06]} pos={[x, x ? 4.45 : 4.25, 0.05]} color="#0e1115" r={0} />
      ))}
      {/* dunne aluminium rand onder de schermwand */}
      <Blok size={[15.7, 0.06, 0.14]} pos={[0, 3.22, 0.04]} color="#9aa3ad" r={0} />
      {/* consolebalk onder de ramen (borstwering) */}
      {[-5.25, 5.25].map((x) => (
        <Blok key={x} size={[4.9, 0.08, 0.42]} pos={[x, 0.9, 0.2]} color="#3a4450" r={0} />
      ))}
    </group>
  );
}

// ───────────────────────── levend ─────────────────────────

/** Beeldvlakken van de werkplekken: zwart-rood (uit) of blauw met grafieken (aan). Eén tekenstap voor alles. */
export function Werkplekken() {
  const voortgang = useSpel((s) => s.voortgang);
  const tex = useTextuur(
    0.56,
    0.35,
    virtueel(0.56, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#0b1622');
      for (let i = 0; i < 4; i++) streep(ctx, 10, 30 + i * 30, W - 10, 30 + i * 30, '#183049', 2);
      const pts = [12, 60, 40, 90, 70, 50, 85, 30, 60, 75];
      for (let i = 0; i < pts.length - 1; i++) streep(ctx, 12 + i * 21, H - pts[i], 12 + (i + 1) * 21, H - pts[i + 1], '#5fd0ff', 5);
      for (let i = 0; i < 6; i++) vlak(ctx, 14 + i * 34, 12, 22, 8, i % 2 ? '#2ec4b6' : '#ffc94d', 2);
    }),
    'w5-werkplek',
    300,
  );
  const mesh = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.52, 0.31);
    const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const im = new THREE.InstancedMesh(g, m, WERKPLEKKEN.length * 2 + WERKPLEKKEN.length);
    const o = new THREE.Object3D();
    let n = 0;
    for (const [x, z, h] of WERKPLEKKEN) {
      for (const dx of [-0.29, 0.29]) {
        o.position.set(x + dx, h + 0.77 + 0.3, z - 0.12 + 0.025);
        o.rotation.set(0, dx > 0 ? -0.18 : 0.18, 0);
        o.scale.set(1, 1, 1);
        o.updateMatrix();
        im.setMatrixAt(n++, o.matrix);
      }
    }
    // ledstrip aan de achterkant van elk bureau (zie je vanaf de galerij en het achterpad)
    for (const [x, z, h] of WERKPLEKKEN) {
      o.position.set(x, h + 0.62, z + 0.405);
      o.rotation.set(0, 0, 0);
      o.scale.set(1.9, 0.08, 1);
      o.updateMatrix();
      im.setMatrixAt(n++, o.matrix);
    }
    im.frustumCulled = false;
    return im;
  }, [tex]);
  useEffect(() => () => mesh.geometry.dispose(), [mesh]);
  // hoeveel stations van Samen oefenen zijn al goed?
  const klaar = useMemo(() => BEGELEID.filter((id) => OPDRACHTEN_VAN[id].every((o) => voortgang[o]?.goed)).length, [voortgang]);
  const kleur = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const n = WERKPLEKKEN.length;
    for (let i = 0; i < n; i++) {
      const aan = i < klaar;
      // twee schermen per werkplek
      for (let j = 0; j < 2; j++) {
        if (aan) kleur.setRGB(1, 1, 1);
        else kleur.setRGB(0.32 + 0.1 * Math.sin(t * 2 + i), 0.05, 0.05);
        mesh.setColorAt(i * 2 + j, kleur);
      }
      if (aan) kleur.set('#5fd0ff');
      else kleur.setRGB(0.45 + 0.25 * Math.sin(t * 2.4 + i * 0.7), 0.03, 0.02);
      mesh.setColorAt(n * 2 + i, kleur);
    }
    mesh.instanceColor!.needsUpdate = true;
  });
  return <primitive object={mesh} />;
}

/** Statusbalk midden op de schermwand: drie systemen, STORING (rood) of AAN (groen). */
export function StatusBalk() {
  const kluizen = useSpel((s) => s.kluizen);
  const wereld = useSpel((s) => s.wereld);
  const aan = KLUSSEN.map((k) => systeemAan(kluizen, wereld, k.id));
  const sleutel = aan.map((a) => (a ? 1 : 0)).join('');
  const b = 5.2;
  const h = 1.5;
  const tex = useTextuur(
    b,
    h,
    virtueel(b, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#0a121b');
      tekst(ctx, 'SYSTEMEN', W / 2, 70, { px: 64, kleur: '#7fd1ff', gewicht: 800, uitlijn: 'center', font: ROND });
      const kol = (W - 120) / 3;
      KLUSSEN.forEach((k, i) => {
        const x = 60 + i * kol;
        const ok = aan[i];
        vlak(ctx, x + 10, 130, kol - 20, H - 170, '#121f2b', 24);
        vlak(ctx, x + 10, 130, kol - 20, 18, k.kleur, 8);
        tekst(ctx, k.naam.replace('Systeem ', ''), x + kol / 2, 230, { px: 74, kleur: '#ffffff', gewicht: 800, uitlijn: 'center', font: LETTER, max: kol - 60 });
        vlak(ctx, x + 50, 300, kol - 100, 160, ok ? '#2b8a3e' : '#c92a2a', 80);
        tekst(ctx, ok ? 'AAN' : 'STORING', x + kol / 2, 382, { px: 78, kleur: '#ffffff', gewicht: 800, uitlijn: 'center', max: kol - 140 });
      });
    }),
    `w5-statusbalk-${sleutel}`,
    120,
  );
  const lamp = useRef<THREE.MeshBasicMaterial>(null);
  const alle = aan.every(Boolean);
  useFrame(({ clock }) => {
    if (lamp.current) lamp.current.opacity = alle ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(clock.getElapsedTime() * 2.2));
  });
  return (
    <mesh position={[0, 4.25, NOORD + 0.12]}>
      <planeGeometry args={[b, h]} />
      <meshBasicMaterial ref={lamp} map={tex} toneMapped={false} transparent />
    </mesh>
  );
}

/** Dalkaart (links op de schermwand): het dorp in het dal, per systeem een wijk die oplicht. */
export function Dalkaart() {
  const kluizen = useSpel((s) => s.kluizen);
  const wereld = useSpel((s) => s.wereld);
  const aan = KLUSSEN.map((k) => systeemAan(kluizen, wereld, k.id));
  const sleutel = aan.map((a) => (a ? 1 : 0)).join('');
  const b = 4.6;
  const h = 2.2;
  const tex = useTextuur(
    b,
    h,
    virtueel(b, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#07111b');
      tekst(ctx, 'HET DAL', 40, 60, { px: 56, kleur: '#7fd1ff', gewicht: 800, font: ROND });
      tekst(ctx, 'Welke wijk heeft weer stroom?', 40, 120, { px: 34, kleur: '#9fb3c8', gewicht: 600 });
      // rivier en bergen
      ctx.strokeStyle = '#163a5c';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.moveTo(60, H - 60);
      ctx.bezierCurveTo(500, H - 200, 900, H - 40, W - 60, H - 180);
      ctx.stroke();
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = '#132231';
        ctx.beginPath();
        ctx.moveTo(140 + i * 200, 300);
        ctx.lineTo(220 + i * 200, 170);
        ctx.lineTo(300 + i * 200, 300);
        ctx.fill();
      }
      const wijk = (x: number, y: number, w: number, hh: number, k: string, ok: boolean, naam: string) => {
        vlak(ctx, x, y, w, hh, ok ? k : '#1b2733', 18);
        if (ok) for (let i = 0; i < 18; i++) vlak(ctx, x + 20 + ((i * 53) % (w - 40)), y + 20 + ((i * 37) % (hh - 40)), 10, 10, '#fff4c4', 3);
        tekst(ctx, naam, x + w / 2, y + hh + 38, { px: 34, kleur: ok ? '#ffffff' : '#5c6b7a', gewicht: 700, uitlijn: 'center' });
      };
      wijk(110, 380, 420, 240, KLUSSEN[0].kleur, aan[0], 'Wegen');
      wijk(690, 330, 420, 300, KLUSSEN[1].kleur, aan[1], 'Huizen');
      wijk(1270, 370, 420, 250, KLUSSEN[2].kleur, aan[2], 'Piste en ijsbaan');
    }),
    `w5-dalkaart-${sleutel}`,
    90,
  );
  return (
    <mesh position={[-5.25, 4.45, NOORD + 0.12]}>
      <planeGeometry args={[b, h]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Weerbeeld (rechts op de schermwand): weer nu, een rustige grafiek en de helikopter. */
export function Weerbeeld() {
  const klaar = useSpel((s) => s.fase === 'klaar');
  const b = 4.6;
  const h = 2.2;
  const tex = useTextuur(
    b,
    h,
    virtueel(b, (ctx, W, H) => {
      vlak(ctx, 0, 0, W, H, '#07111b');
      tekst(ctx, 'WEER NU', 40, 60, { px: 56, kleur: '#7fd1ff', gewicht: 800, font: ROND });
      const vak = (x: number, t: string, w: string) => {
        vlak(ctx, x, 110, 380, 170, '#101d2a', 20);
        tekst(ctx, t, x + 24, 150, { px: 32, kleur: '#9fb3c8', gewicht: 600 });
        tekst(ctx, w, x + 24, 230, { px: 70, kleur: '#ffffff', gewicht: 800 });
      };
      vak(40, 'temperatuur', '−14 °C');
      vak(450, 'wind', '38 km/u');
      vak(860, 'zicht', '20 km');
      vak(1270, 'sneeuw', '2,1 m');
      // rustige lijn: wind vannacht
      tekst(ctx, 'Wind vannacht (km/u)', 40, 340, { px: 32, kleur: '#9fb3c8', gewicht: 600 });
      for (let i = 0; i <= 4; i++) streep(ctx, 60, 400 + i * 70, W - 560, 400 + i * 70, '#16283a', 2);
      const pts = [92, 88, 80, 71, 64, 55, 46, 42, 38];
      for (let i = 0; i < pts.length - 1; i++) streep(ctx, 60 + i * 150, 680 - pts[i] * 3, 60 + (i + 1) * 150, 680 - pts[i + 1] * 3, '#5fd0ff', 8);
      vlak(ctx, W - 480, 400, 440, 280, klaar ? '#2b8a3e' : '#7a1c1c', 30);
      tekst(ctx, 'HELIKOPTER', W - 260, 470, { px: 44, kleur: '#ffffff', gewicht: 800, uitlijn: 'center' });
      tekst(ctx, klaar ? 'KLAAR' : 'WACHT', W - 260, 580, { px: 80, kleur: '#ffffff', gewicht: 800, uitlijn: 'center' });
    }),
    `w5-weerbeeld-${klaar ? 1 : 0}`,
    90,
  );
  return (
    <mesh position={[5.25, 4.45, NOORD + 0.12]}>
      <planeGeometry args={[b, h]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Zwaailicht: draait rood zolang een systeem uit staat, groen als alles werkt. */
export function Zwaailicht({ pos }: { pos: V3 }) {
  const kluizen = useSpel((s) => s.kluizen);
  const wereld = useSpel((s) => s.wereld);
  const alle = KLUSSEN.every((k) => systeemAan(kluizen, wereld, k.id));
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = alle ? 0 : clock.getElapsedTime() * 4;
  });
  return (
    <group position={pos}>
      <Cil r={0.11} h={0.06} pos={[0, 0.03, 0]} color="#1b1f24" seg={12} />
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.1, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={alle ? '#51cf66' : '#ff4d4d'} toneMapped={false} />
      </mesh>
      <group ref={ref} position={[0, 0.13, 0]}>
        <mesh position={[0, 0, 0.06]} material={mat('#fff3bf', { emissive: '#fff3bf' })}>
          <boxGeometry args={[0.03, 0.05, 0.2]} />
        </mesh>
      </group>
    </group>
  );
}
