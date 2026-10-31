// Kleine bouwstenen die in Wereld 1 vaak terugkomen: tekstvlakken, schermpjes, etiketten.
import { Mens } from '../game/mens';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Blok } from '../game/kit';
import { useOpgelost } from '../game/opgelost';
import { FONT, rondRect, useTextuur } from '../game/tekst';

type V3 = [number, number, number];

export interface TekstOpties {
  bg?: string;
  fg?: string;
  rand?: string | null;
  /** Lettergrootte als deel van de hoogte per regel (0..1). */
  groot?: number;
  vet?: boolean;
  /** Eerste regel vet (kop). */
  kop?: boolean;
  links?: boolean;
  radius?: number;
  dubbel?: boolean;
  basic?: boolean;
  transparant?: boolean;
}

/** Vlak met tekst (naar +z). Elke regel even hoog; lettergrootte past zich aan de breedte aan. */
export function Tekst({ regels, b, h, pos, rot, o = {} }: { regels: string[]; b: number; h: number; pos?: V3; rot?: V3; o?: TekstOpties }) {
  const { bg = '#fbfaf6', fg = '#1f2a24', rand = null, groot = 0.7, vet = true, kop = false, links = false, radius = 0.1, dubbel = false, basic = false, transparant = false } = o;
  const sleutel = `t1|${regels.join('¦')}|${b}|${h}|${bg}|${fg}|${rand}|${groot}|${vet}|${kop}|${links}|${radius}|${transparant}`;
  const tex = useTextuur(
    b,
    h,
    (ctx, w, hh) => {
      ctx.clearRect(0, 0, w, hh);
      if (!transparant) {
        ctx.fillStyle = bg;
        rondRect(ctx, 0, 0, w, hh, Math.min(w, hh) * radius);
        ctx.fill();
      }
      if (rand) {
        ctx.lineWidth = Math.max(4, Math.min(w, hh) * 0.05);
        ctx.strokeStyle = rand;
        rondRect(ctx, ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, hh - ctx.lineWidth, Math.min(w, hh) * radius * 0.85);
        ctx.stroke();
      }
      const n = regels.length;
      const marge = w * 0.06;
      ctx.fillStyle = fg;
      ctx.textAlign = links ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      regels.forEach((r, i) => {
        let fs = (hh / n) * groot;
        const gewicht = kop && i === 0 ? 700 : vet ? 700 : 600;
        ctx.font = `${gewicht} ${fs}px ${FONT}`;
        const maat = ctx.measureText(r).width;
        if (maat > w - marge * 2) fs *= (w - marge * 2) / maat;
        ctx.font = `${gewicht} ${fs}px ${FONT}`;
        ctx.fillText(r, links ? marge : w / 2, (hh / n) * (i + 0.5) + fs * 0.04);
      });
    },
    sleutel,
  );
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[b, h]} />
      {basic ? (
        <meshBasicMaterial map={tex} transparent={transparant} side={dubbel ? THREE.DoubleSide : THREE.FrontSide} toneMapped={false} />
      ) : (
        <meshStandardMaterial map={tex} roughness={0.75} transparent={transparant} side={dubbel ? THREE.DoubleSide : THREE.FrontSide} />
      )}
    </mesh>
  );
}

/** Digitaal schermpje (donker met lichtgevende cijfers). */
export function Scherm({ tekst, b, h, pos, rot, kleur = '#9cf0b4', bg = '#17211d' }: { tekst: string; b: number; h: number; pos?: V3; rot?: V3; kleur?: string; bg?: string }) {
  return <Tekst regels={[tekst]} b={b} h={h} pos={pos} rot={rot} o={{ bg, fg: kleur, groot: 0.72, radius: 0.12, basic: true }} />;
}

/** Bord op twee palen met een tekstvlak. */
export function Paalbord({ regels, b, h, y, pos, rot, bg, fg, rand, paal = '#2f3634' }: { regels: string[]; b: number; h: number; y: number; pos?: V3; rot?: V3; bg?: string; fg?: string; rand?: string | null; paal?: string }) {
  return (
    <group position={pos} rotation={rot}>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.08, y + h / 2, 0.08]} pos={[(s * b) / 2.6, (y + h / 2) / 2, -0.03]} color={paal} r={0.02} />
      ))}
      <Blok size={[b + 0.08, h + 0.08, 0.06]} pos={[0, y, -0.03]} color={paal} r={0.02} />
      <Tekst regels={regels} b={b} h={h} pos={[0, y, 0.005]} o={{ bg, fg, rand, kop: true }} />
    </group>
  );
}

/** Voorlopig model: een kistje met de naam erop (alleen tijdens het bouwen). */
export function Voorlopig({ naam, maat = 1 }: { naam: string; maat?: number }) {
  return (
    <group>
      <Blok size={[maat, maat * 0.8, maat * 0.6]} pos={[0, maat * 0.4, 0]} color="#c9a372" r={0.05} />
      <Tekst regels={[naam]} b={maat * 0.9} h={maat * 0.3} pos={[0, maat * 0.4, maat * 0.301]} />
    </group>
  );
}

/** Getal met een leeg, zacht knipperend vakje erachter: "150 [ ]" (de eenheid ontbreekt). */
export function GetalVak({
  getal,
  b,
  h,
  pos,
  rot,
  bg = '#fbf7ee',
  fg = '#1f2a24',
  rand = '#c9a372',
  id = '',
  eenheid = '',
}: {
  getal: string;
  b: number;
  h: number;
  pos?: V3;
  rot?: V3;
  bg?: string;
  fg?: string;
  rand?: string | null;
  /** Opdracht: is die goed, dan staat de eenheid in het vakje (groen). */
  id?: string;
  eenheid?: string;
}) {
  const opgelost = useOpgelost(id);
  const vakB = b * 0.36;
  const vakH = h * 0.6;
  const vakX = b / 2 - vakB / 2 - b * 0.08;
  const tex = useTextuur(
    b,
    h,
    (ctx, w, hh) => {
      ctx.fillStyle = bg;
      rondRect(ctx, 0, 0, w, hh, Math.min(w, hh) * 0.15);
      ctx.fill();
      if (rand) {
        ctx.lineWidth = Math.max(4, hh * 0.06);
        ctx.strokeStyle = rand;
        rondRect(ctx, ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, hh - ctx.lineWidth, Math.min(w, hh) * 0.13);
        ctx.stroke();
      }
      const ruimte = w * 0.5;
      let fs = hh * 0.64;
      ctx.font = `700 ${fs}px ${FONT}`;
      const m = ctx.measureText(getal).width;
      if (m > ruimte * 0.92) fs *= (ruimte * 0.92) / m;
      ctx.font = `700 ${fs}px ${FONT}`;
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getal, w * 0.06 + ruimte / 2, hh / 2 + fs * 0.04);
    },
    `getalvak|${getal}|${b}|${h}|${bg}|${fg}|${rand}`,
  );
  return (
    <group position={pos} rotation={rot}>
      <mesh>
        <planeGeometry args={[b, h]} />
        <meshStandardMaterial map={tex} roughness={0.75} />
      </mesh>
      {opgelost && eenheid ? (
        <Tekst regels={[eenheid]} b={vakB} h={vakH} pos={[vakX, 0, 0.003]} o={{ bg: '#5fe0a1', fg: '#10301f', radius: 0.12, groot: 0.75 }} />
      ) : (
        <Knipper pos={[vakX, 0, 0.003]} b={vakB} h={vakH} />
      )}
    </group>
  );
}

/** Zacht knipperend invulvakje (oranje rand, licht vlak). */
export function Knipper({ pos, b, h }: { pos: V3; b: number; h: number }) {
  const ref = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.opacity = 0.55 + Math.sin(clock.getElapsedTime() * 3.2) * 0.35;
  });
  const t = Math.min(b, h) * 0.12;
  return (
    <group position={pos}>
      <mesh>
        <planeGeometry args={[b, h]} />
        <meshBasicMaterial ref={ref} color="#ffcf7a" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      {[
        [0, h / 2 - t / 2, b, t],
        [0, -h / 2 + t / 2, b, t],
        [-b / 2 + t / 2, 0, t, h],
        [b / 2 - t / 2, 0, t, h],
      ].map(([x, y, w, hh], i) => (
        <mesh key={i} position={[x, y, 0.001]}>
          <planeGeometry args={[w, hh]} />
          <meshBasicMaterial color="#e8781f" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Poppetje (± 1,2 m bij s = 1). Kijkt naar +z. */
export function Poppetje({ pos, rot = 0, s = 1, shirt = '#e48a3a', broek = '#2f4a6a', huid = '#f0c6a0', haar = '#3a2a20' }: { pos?: V3; rot?: number; s?: number; shirt?: string; broek?: string; huid?: string; haar?: string }) {
  return <Mens pos={pos} rot={rot} hoogte={1.2 * s} c={{ shirt, broek, huid, haar, kapsel: 'kort' }} />;
}

/** Keukenweegschaal met een digitaal schermpje (bovenkant op y = 0.07). */
export function Keukenweegschaal({ tekst, pos, b = 0.34, d = 0.28 }: { tekst: string; pos?: V3; b?: number; d?: number }) {
  return (
    <group position={pos}>
      <Blok size={[b, 0.06, d]} pos={[0, 0.03, 0]} color="#e9e3d7" r={0.02} />
      <Blok size={[b - 0.04, 0.012, d - 0.04]} pos={[0, 0.066, 0]} color="#9aa3a8" r={0.004} />
      <Blok size={[b * 0.55, 0.042, 0.012]} pos={[0, 0.03, d / 2 + 0.002]} color="#17211d" r={0.004} />
      <Scherm tekst={tekst} b={b * 0.5} h={0.036} pos={[0, 0.03, d / 2 + 0.009]} />
    </group>
  );
}
