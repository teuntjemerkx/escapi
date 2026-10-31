// Bouwstenen van Wereld 4 (Het Winkelcentrum): borden met scherpe tekst, marktkramen,
// paspoppen en poppetjes, en hulpjes voor wat er gebeurt na een goed antwoord. Alles in de zachte diorama-stijl van de andere werelden.
import { Mens } from '../game/mens';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { useGroei, useOpgelost } from '../game/opgelost';
import { P } from '../game/palette';
import { useAtlas, type Atlas } from './atlas';
import { FONT, maakTextuur, rondRect, useTextuur } from '../game/tekst';

export type V3 = [number, number, number];
type Teken = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Pixels per meter: korte zijde minstens 256 px, lange zijde hooguit 1536 px. */
export function ppmVoor(b: number, h: number) {
  return Math.max(200, Math.min(256 / Math.min(b, h), 1536 / Math.max(b, h)));
}

/** Zet de grootste lettergrootte die nog in de breedte past. */
export function pasFont(ctx: CanvasRenderingContext2D, tekst: string, max: number, breed: number, gewicht = 700) {
  let fs = max;
  ctx.font = `${gewicht} ${fs}px ${FONT}`;
  const b = ctx.measureText(tekst).width;
  if (b > breed) {
    fs = (fs * breed) / b;
    ctx.font = `${gewicht} ${fs}px ${FONT}`;
  }
  return fs;
}

type DoekProps = {
  b: number;
  h: number;
  sleutel: string;
  teken: Teken;
  pos?: V3;
  rot?: V3;
  ppm?: number;
  /** Lichtgevend scherm (niet beschaduwd). */
  licht?: boolean;
  transparant?: boolean;
  dubbel?: boolean;
};

/** Plat vlak met een eigen canvas-tekening (naar +z gericht). Binnen een DoekAtlas komt de tekening op het gedeelde canvas. */
export function Doek(props: DoekProps) {
  const atlas = useAtlas();
  return atlas && !props.transparant ? <AtlasDoek atlas={atlas} {...props} /> : <LosDoek {...props} />;
}

function LosDoek({ b, h, sleutel, teken, pos, rot, ppm, licht = false, transparant = false, dubbel = false }: DoekProps) {
  const tex = useTextuur(b, h, teken, `w4-${sleutel}`, ppm ?? ppmVoor(b, h));
  const kant = dubbel ? THREE.DoubleSide : THREE.FrontSide;
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[b, h]} />
      {licht ? (
        <meshBasicMaterial map={tex} toneMapped={false} transparent={transparant} side={kant} />
      ) : (
        <meshStandardMaterial map={tex} roughness={0.75} transparent={transparant} side={kant} />
      )}
    </mesh>
  );
}

function AtlasDoek({ atlas, b, h, sleutel, teken, pos, rot, ppm, licht = false, dubbel = false }: DoekProps & { atlas: Atlas }) {
  const ref = useRef<THREE.Mesh>(null);
  const id = useMemo(() => atlas.nieuwId(), [atlas]);
  const tk = useRef(teken);
  tk.current = teken;
  const p = ppm ?? ppmVoor(b, h);
  const w = Math.max(32, Math.round(b * p));
  const hp = Math.max(32, Math.round(h * p));
  useLayoutEffect(() => {
    atlas.zet(id, { w, h: hp, sleutel, teken: (c, ww, hh) => tk.current(c, ww, hh), mesh: ref.current!, variant: (licht ? 'licht' : 'mat') + (dubbel ? '2' : '') });
    return () => atlas.weg(id);
  }, [atlas, id, b, h, w, hp, sleutel, licht, dubbel]);
  return (
    <mesh ref={ref} position={pos} rotation={rot}>
      <planeGeometry args={[b, h]} />
    </mesh>
  );
}

/** Bord met regels tekst; elke regel zo groot mogelijk. */
export function Bord({
  regels,
  b,
  h,
  pos,
  rot,
  bg = '#fbfaf6',
  fg = '#1f2a24',
  rand = null,
  groot = 0.72,
  kleuren,
  doorstreep = [],
  rond = 0.12,
  licht = false,
  dubbel = false,
  ppm,
}: {
  regels: string[];
  b: number;
  h: number;
  pos?: V3;
  rot?: V3;
  bg?: string;
  fg?: string;
  rand?: string | null;
  groot?: number;
  kleuren?: (string | undefined)[];
  /** Regels (index) met een rode streep erdoor (oude prijs). */
  doorstreep?: number[];
  rond?: number;
  licht?: boolean;
  dubbel?: boolean;
  ppm?: number;
}) {
  const sleutel = `bord|${regels.join('|')}|${b}|${h}|${bg}|${fg}|${rand}|${groot}|${(kleuren ?? []).join(',')}|${doorstreep.join(',')}|${rond}`;
  return (
    <Doek
      b={b}
      h={h}
      pos={pos}
      rot={rot}
      sleutel={sleutel}
      licht={licht}
      dubbel={dubbel}
      ppm={ppm}
      transparant={bg === 'transparent'}
      teken={(ctx, w, hh) => {
        if (bg !== 'transparent') {
          ctx.fillStyle = bg;
          rondRect(ctx, 0, 0, w, hh, Math.min(w, hh) * rond);
          ctx.fill();
        }
        if (rand) {
          const lw = Math.min(w, hh) * 0.06;
          ctx.lineWidth = lw;
          ctx.strokeStyle = rand;
          rondRect(ctx, lw / 2, lw / 2, w - lw, hh - lw, Math.min(w, hh) * rond * 0.85);
          ctx.stroke();
        }
        const n = regels.length;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        regels.forEach((r, i) => {
          const fs = pasFont(ctx, r, (hh / n) * groot, w * 0.88, i === 0 && n > 1 ? 700 : 600);
          ctx.fillStyle = kleuren?.[i] ?? fg;
          const y = (hh / n) * (i + 0.5) + fs * 0.04;
          ctx.fillText(r, w / 2, y);
          if (doorstreep.includes(i)) {
            const tb = ctx.measureText(r).width;
            ctx.strokeStyle = '#d83a2e';
            ctx.lineWidth = fs * 0.12;
            ctx.beginPath();
            ctx.moveTo(w / 2 - tb / 2 - fs * 0.1, y + fs * 0.12);
            ctx.lineTo(w / 2 + tb / 2 + fs * 0.1, y - fs * 0.12);
            ctx.stroke();
          }
        });
      }}
    />
  );
}

/** Prijskaartje aan een touwtje (geel kaartje met zwarte tekst). */
export function Prijskaartje({ tekst, pos, rot, b = 0.36, h = 0.2, bg = '#f6d24a', oud = false }: { tekst: string; pos: V3; rot?: V3; b?: number; h?: number; bg?: string; oud?: boolean }) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[b + 0.03, h + 0.03, 0.015]} color="#3b3a39" r={0.006} shadow={false} />
      <Bord regels={[tekst]} b={b} h={h} pos={[0, 0, 0.009]} bg={bg} doorstreep={oud ? [0] : []} groot={0.78} rond={0.18} />
    </group>
  );
}

/** Bord op twee paaltjes (stoepbord-stijl), tekst naar +z. */
export function PaalBord({ regels, b, h, hoogte = 1.2, pos, rot, bg = '#fbfaf6', fg, rand, kleuren, doorstreep }: { regels: string[]; b: number; h: number; hoogte?: number; pos?: V3; rot?: V3; bg?: string; fg?: string; rand?: string | null; kleuren?: (string | undefined)[]; doorstreep?: number[] }) {
  return (
    <group position={pos} rotation={rot}>
      <Cil r={0.035} h={hoogte + h / 2} pos={[-b / 2 + 0.08, (hoogte + h / 2) / 2, -0.04]} color="#2f3634" seg={8} />
      <Cil r={0.035} h={hoogte + h / 2} pos={[b / 2 - 0.08, (hoogte + h / 2) / 2, -0.04]} color="#2f3634" seg={8} />
      <Blok size={[b + 0.08, h + 0.08, 0.05]} pos={[0, hoogte, 0]} color="#2f3634" r={0.02} />
      <Bord regels={regels} b={b} h={h} pos={[0, hoogte, 0.03]} bg={bg} fg={fg} rand={rand} kleuren={kleuren} doorstreep={doorstreep} />
    </group>
  );
}

/** Gestreepte stof (luifel, kraamdak). Eén materiaal per kleurpaar: zo voegt Statisch alle stroken van één kleur samen tot één tekenstap. */
const streepMat = new Map<string, THREE.MeshStandardMaterial>();
function streepMateriaal(a: string, b: string, n: number) {
  const k = `${a}|${b}|${n}`;
  let m = streepMat.get(k);
  if (!m) {
    const tex = maakTextuur(
      1,
      1,
      (ctx, w, h) => {
        for (let i = 0; i < n; i++) {
          ctx.fillStyle = i % 2 ? b : a;
          ctx.fillRect((i * w) / n, 0, w / n + 1, h);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, h * 0.9, w, h * 0.1);
      },
      128,
    );
    m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
    streepMat.set(k, m);
  }
  return m;
}

export function Streep({ size, pos, rot, a, b = '#fbf6ec', n = 16 }: { size: V3; pos?: V3; rot?: V3; a: string; b?: string; n?: number }) {
  return (
    <mesh position={pos} rotation={rot} castShadow receiveShadow material={streepMateriaal(a, b, n)}>
      <boxGeometry args={size} />
    </mesh>
  );
}

/** Marktkraam: toonbank, vier palen en een gestreept dak met naambord. Voorkant naar +z. */
export function Kraam({ w = 4.4, d = 1.8, naam, kleur = '#e5675a', toonbank = true }: { w?: number; d?: number; naam: string; kleur?: string; toonbank?: boolean }) {
  const n = Math.max(6, Math.round(w * 2) * 2);
  return (
    <group>
      {toonbank && (
        <group>
          <Blok size={[w - 0.2, 0.92, 0.62]} pos={[0, 0.46, d / 2 - 0.36]} color={P.hout} r={0.04} />
          <Blok size={[w - 0.05, 0.07, 0.78]} pos={[0, 0.95, d / 2 - 0.36]} color={P.houtLicht} r={0.03} />
          <Streep size={[w - 0.3, 0.32, 0.03]} pos={[0, 0.62, d / 2 - 0.04]} a={kleur} n={n} />
        </group>
      )}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cil key={i} r={0.05} h={2.55} pos={[sx * (w / 2 - 0.06), 1.275, sz * (d / 2 - 0.06)]} color="#ece6da" seg={8} />
      ))}
      <Streep size={[w + 0.5, 0.05, d + 0.8]} pos={[0, 2.62, 0.15]} rot={[-0.14, 0, 0]} a={kleur} n={n} />
      <Streep size={[w + 0.5, 0.32, 0.03]} pos={[0, 2.55, d / 2 + 0.56]} a={kleur} n={n} />
      <Blok size={[Math.min(w * 0.8, 3.6), 0.5, 0.08]} pos={[0, 3.12, d / 2 + 0.3]} color="#fbf6ec" r={0.04} />
      <Bord regels={[naam]} b={Math.min(w * 0.8, 3.6) - 0.12} h={0.4} pos={[0, 3.12, d / 2 + 0.345]} fg={kleur} bg="#fbf6ec" groot={0.8} />
      <Blok size={[0.05, 0.4, 0.05]} pos={[-Math.min(w * 0.3, 1.3), 2.85, d / 2 + 0.3]} color="#ece6da" r={0.01} />
      <Blok size={[0.05, 0.4, 0.05]} pos={[Math.min(w * 0.3, 1.3), 2.85, d / 2 + 0.3]} color="#ece6da" r={0.01} />
    </group>
  );
}

/** Klein poppetje (± 0,9 m bij s = 1). Zittend begint het lijf bij de heup, op de stoel. */
export function Poppetje({ pos, rot, kleur = '#4f86b8', huid = '#f0c9a0', haar, s = 1, zit = false }: { pos: V3; rot?: V3; kleur?: string; huid?: string; haar?: string; s?: number; zit?: boolean }) {
  const c = { shirt: kleur, broek: '#3b3a39', huid, haar: haar ?? '#3b2a1e', kapsel: 'kort' as const };
  // staand 0,92 m; zittend reikt het van de stoel tot de kruin 0,71 m (zo groot als vroeger)
  const hoogte = (zit ? (0.71 / 0.88) * 1.76 : 0.92) * s;
  return (
    <group position={pos} rotation={rot}>
      <Mens hoogte={hoogte} houding={zit ? 'zit' : 'staan'} c={c} />
    </group>
  );
}

/** Paspop (torso op een standaard) waar kleding omheen zit. */
export function Paspop({ pos, rot, children, kleur = '#efe6d6' }: { pos?: V3; rot?: V3; children?: ReactNode; kleur?: string }) {
  return (
    <group position={pos} rotation={rot}>
      <Cil r={0.22} h={0.05} pos={[0, 0.025, 0]} color="#3b3a39" seg={18} />
      <Cil r={0.025} h={0.75} pos={[0, 0.4, 0]} color="#3b3a39" seg={8} />
      <Blok size={[0.42, 0.62, 0.24]} pos={[0, 1.08, 0]} color={kleur} r={0.1} />
      <mesh position={[0, 1.48, 0]} castShadow material={mat(kleur)}>
        <sphereGeometry args={[0.11, 12, 10]} />
      </mesh>
      {children}
    </group>
  );
}

/** Kledingrek: twee poten en een stang. */
export function Kledingrek({ b = 1.6, hoogte = 1.55, pos, rot }: { b?: number; hoogte?: number; pos?: V3; rot?: V3 }) {
  return (
    <group position={pos} rotation={rot}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Cil r={0.025} h={hoogte} pos={[(s * b) / 2, hoogte / 2, 0]} color="#9aa3a8" seg={8} />
          <Blok size={[0.06, 0.04, 0.5]} pos={[(s * b) / 2, 0.02, 0]} color="#7f888d" r={0.01} />
        </group>
      ))}
      <Cil r={0.02} h={b} pos={[0, hoogte, 0]} rot={[0, 0, Math.PI / 2]} color="#c9cdd0" seg={8} />
    </group>
  );
}

/** T-shirt (plat, naar +z) met mouwen. */
export function Shirt({ kleur, pos, rot, s = 1 }: { kleur: string; pos?: V3; rot?: V3; s?: number }) {
  return (
    <group position={pos} rotation={rot} scale={s}>
      <Blok size={[0.46, 0.56, 0.05]} pos={[0, -0.32, 0]} color={kleur} r={0.02} />
      <Blok size={[0.2, 0.18, 0.05]} pos={[-0.3, -0.12, 0]} rot={[0, 0, 0.6]} color={kleur} r={0.02} />
      <Blok size={[0.2, 0.18, 0.05]} pos={[0.3, -0.12, 0]} rot={[0, 0, -0.6]} color={kleur} r={0.02} />
      {/* hanger */}
      <mesh position={[0, -0.03, 0]} material={mat('#c9a372')}>
        <torusGeometry args={[0.03, 0.007, 4, 10, Math.PI * 1.4]} />
      </mesh>
    </group>
  );
}

/** Tafel met blad (voor producten op de kavel). */
export function Tafel({ b = 1.6, d = 0.8, h = 0.85, pos, kleur = P.houtLicht, poot = P.hout }: { b?: number; d?: number; h?: number; pos?: V3; kleur?: string; poot?: string }) {
  return (
    <group position={pos}>
      <Blok size={[b, 0.07, d]} pos={[0, h - 0.035, 0]} color={kleur} r={0.025} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Blok key={i} size={[0.06, h - 0.07, 0.06]} pos={[sx * (b / 2 - 0.08), (h - 0.07) / 2, sz * (d / 2 - 0.08)]} color={poot} r={0.015} />
      ))}
    </group>
  );
}

/** Sokkel (wit blok) om iets op te tonen. */
export function Sokkel({ b = 0.7, h = 0.9, d, pos, kleur = '#f4efe6' }: { b?: number; h?: number; d?: number; pos?: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Blok size={[b, h, d ?? b]} pos={[0, h / 2, 0]} color={kleur} r={0.04} />
      <Blok size={[b + 0.06, 0.05, (d ?? b) + 0.06]} pos={[0, h + 0.025, 0]} color="#e3dccf" r={0.02} />
    </group>
  );
}

/** Scherm met rand en voet (tv, infozuil). Het beeld is een canvas-tekening. */
export function Scherm({
  b,
  h,
  sleutel,
  teken,
  pos,
  rot,
  ppm,
  rand = '#262b2e',
}: {
  b: number;
  h: number;
  sleutel: string;
  teken: Teken;
  pos?: V3;
  rot?: V3;
  ppm?: number;
  rand?: string;
}) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[b + 0.16, h + 0.16, 0.12]} color={rand} r={0.04} />
      <Doek b={b} h={h} pos={[0, 0, 0.065]} sleutel={sleutel} teken={teken} ppm={ppm} licht />
    </group>
  );
}

/** Tekst links uitgelijnd op een canvas (hulpje voor tabellen en artikelen). */
export function tekstRegel(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, fs: number, kleur = '#1f2a24', gewicht = 600, uitlijn: CanvasTextAlign = 'left') {
  ctx.font = `${gewicht} ${fs}px ${FONT}`;
  ctx.fillStyle = kleur;
  ctx.textAlign = uitlijn;
  ctx.textBaseline = 'middle';
  ctx.fillText(t, x, y);
}

/** Tekst die over meerdere regels loopt binnen een breedte. Geeft de y van de volgende regel. */
export function tekstBlok(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, breed: number, fs: number, kleur = '#1f2a24', gewicht = 500, regelHoogte = 1.3) {
  ctx.font = `${gewicht} ${fs}px ${FONT}`;
  ctx.fillStyle = kleur;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let regel = '';
  for (const woord of t.split(' ')) {
    const proef = regel ? `${regel} ${woord}` : woord;
    if (ctx.measureText(proef).width > breed && regel) {
      ctx.fillText(regel, x, y);
      y += fs * regelHoogte;
      regel = woord;
    } else regel = proef;
  }
  if (regel) ctx.fillText(regel, x, y);
  return y + fs * regelHoogte;
}

// ─────────────────────────── Het antwoord laat iets gebeuren ───────────────────────────

/** Verschijnt (groeit op) zodra alle opdrachten goed zijn. Toont nooit iets vóór het goede antwoord. */
export function NaGoed({ ids, pos, rot, vertraging = 0.3, as = 'alle', children }: { ids: string[]; pos?: V3; rot?: V3; vertraging?: number; as?: 'y' | 'alle'; children: ReactNode }) {
  const af = useOpgelost(...ids);
  const ref = useGroei(af, vertraging, as);
  return (
    <group position={pos} rotation={rot}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

/** Zichtbaar tot alle opdrachten goed zijn (bv. een vraagteken). */
export function VoorGoed({ ids, pos, rot, children }: { ids: string[]; pos?: V3; rot?: V3; children: ReactNode }) {
  const af = useOpgelost(...ids);
  const ref = useGroei(!af, 0, 'alle');
  return (
    <group position={pos} rotation={rot}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

/** Schuift een groep zacht van `van` naar `naar` (langs één as) als `aan` waar wordt. */
export function useSchuif(aan: boolean, as: 'x' | 'y' | 'z', van: number, naar: number) {
  const ref = useRef<THREE.Group>(null);
  const w = useRef(aan ? 1 : 0);
  useLayoutEffect(() => {
    if (ref.current) ref.current.position[as] = van + (naar - van) * w.current;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    w.current += ((aan ? 1 : 0) - w.current) * Math.min(1, dt * 3);
    if (ref.current) ref.current.position[as] = van + (naar - van) * w.current;
  });
  return ref;
}

/** Groen vinkje met tekst: de beloning na het goede antwoord. */
export function Beloning({ tekst, b = 0.8, h = 0.24 }: { tekst: string[]; b?: number; h?: number }) {
  return (
    <group>
      <Blok size={[b + 0.06, h + 0.06, 0.04]} pos={[0, 0, -0.025]} color="#1f6b3f" r={0.03} />
      <Bord regels={tekst} b={b} h={h} bg="#3fbf6f" fg="#ffffff" licht groot={0.78} />
    </group>
  );
}
