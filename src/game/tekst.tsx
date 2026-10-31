// Tekst en plaatjes als canvas-texturen: bordjes, etiketten, stationsborden.
// Geen externe fonts of workers nodig (werkt binnen de strenge CSP van de artifact).
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

type V3 = [number, number, number];
const PX_PER_M = 220;

export function maakTextuur(breedte: number, hoogte: number, teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, ppm = PX_PER_M) {
  const c = document.createElement('canvas');
  c.width = Math.max(32, Math.round(breedte * ppm));
  c.height = Math.max(32, Math.round(hoogte * ppm));
  const ctx = c.getContext('2d')!;
  teken(ctx, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export const FONT = "'Fredoka', 'Lexend', 'Segoe UI', sans-serif";

/** Herteken alle texturen zodra de webfonts geladen zijn. */
const wachtOpFonts: Set<() => void> = new Set();
if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.ready.then(() => wachtOpFonts.forEach((f) => f()));
}

export function useTextuur(breedte: number, hoogte: number, teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, sleutel: string, ppm = PX_PER_M) {
  const tex = useMemo(() => maakTextuur(breedte, hoogte, teken, ppm), [sleutel, breedte, hoogte, ppm]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const opnieuw = () => {
      const c = tex.image as HTMLCanvasElement;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      teken(ctx, c.width, c.height);
      tex.needsUpdate = true;
    };
    wachtOpFonts.add(opnieuw);
    return () => {
      wachtOpFonts.delete(opnieuw);
      tex.dispose();
    };
  }, [tex]); // eslint-disable-line react-hooks/exhaustive-deps
  return tex;
}

export function rondRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Plat bordje met regels tekst (naar +z gericht). */
export function Bordje({
  regels,
  breed,
  hoog,
  pos = [0, 0, 0],
  rot,
  bg = '#fbfaf6',
  fg = '#1f2a24',
  rand = '#2f5d46',
  groot = 0.62,
  dubbel = false,
}: {
  regels: string[];
  breed: number;
  hoog: number;
  pos?: V3;
  rot?: V3;
  bg?: string;
  fg?: string;
  rand?: string | null;
  groot?: number;
  dubbel?: boolean;
}) {
  const sleutel = `${regels.join('|')}${breed}${hoog}${bg}${fg}${rand}${groot}`;
  const tex = useTextuur(
    breed,
    hoog,
    (ctx, w, h) => {
      ctx.fillStyle = bg;
      rondRect(ctx, 0, 0, w, h, Math.min(w, h) * 0.12);
      ctx.fill();
      if (rand) {
        ctx.lineWidth = Math.min(w, h) * 0.05;
        ctx.strokeStyle = rand;
        rondRect(ctx, ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth, Math.min(w, h) * 0.1);
        ctx.stroke();
      }
      const n = regels.length;
      const fs = Math.min((h / n) * groot, (w / Math.max(...regels.map((r) => r.length), 1)) * 1.7);
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      regels.forEach((r, i) => {
        ctx.font = `${i === 0 && n > 1 ? 700 : 600} ${fs}px ${FONT}`;
        ctx.fillText(r, w / 2, (h / n) * (i + 0.5));
      });
    },
    sleutel,
  );
  return (
    <group position={pos} rotation={rot}>
      <mesh>
        <planeGeometry args={[breed, hoog]} />
        <meshStandardMaterial map={tex} roughness={0.8} side={dubbel ? THREE.DoubleSide : THREE.FrontSide} />
      </mesh>
    </group>
  );
}

/** Paaltje met een rond nummerbordje (bovenop), van twee kanten leesbaar. */
export function Nummerpaal({ nr, pos, kleur = '#2f5d46' }: { nr: string | number; pos: V3; kleur?: string }) {
  const tex = useTextuur(
    0.5,
    0.5,
    (ctx, w, h) => {
      ctx.fillStyle = kleur;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${h * 0.58}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(nr), w / 2, h / 2 + h * 0.03);
    },
    `nr${nr}${kleur}`,
  );
  return (
    <group position={pos}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#e9e3d7" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial map={tex} transparent side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}
