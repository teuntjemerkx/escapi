// Frank: het vriendelijke groene monster uit de tuin van het Spookkasteel (Wereld 2).
// In de andere werelden zit hij verstopt als kleine easter egg: een schilderijtje, een poster of een fotootje.
import { useMemo } from 'react';
import * as THREE from 'three';
import { Blok, mat } from './kit';
import { maakTextuur } from './tekst';

type V3 = [number, number, number];

/** Tekent Frank zijn hoofd (vooraanzicht) op een canvas. `x, y, s` = midden en breedte in pixels. */
export function tekenFrank(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lach = true) {
  const r = s * 0.12;
  // nek-boutjes
  ctx.fillStyle = '#9aa1a8';
  ctx.fillRect(x - s * 0.62, y + s * 0.12, s * 0.16, s * 0.12);
  ctx.fillRect(x + s * 0.46, y + s * 0.12, s * 0.16, s * 0.12);
  // hoofd
  ctx.fillStyle = '#7fbf6a';
  ctx.beginPath();
  ctx.roundRect(x - s / 2, y - s / 2, s, s * 1.05, r);
  ctx.fill();
  // haar
  ctx.fillStyle = '#1d1a20';
  ctx.beginPath();
  ctx.roundRect(x - s / 2, y - s / 2, s, s * 0.26, [r, r, 4, 4]);
  ctx.fill();
  for (let i = 0; i < 5; i++) ctx.fillRect(x - s / 2 + (i * s) / 5, y - s * 0.26, s / 10, s * 0.08);
  // litteken
  ctx.strokeStyle = '#4f7a40';
  ctx.lineWidth = Math.max(2, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + s * 0.12, y - s * 0.2);
  ctx.lineTo(x + s * 0.34, y - s * 0.12);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const tx = x + s * (0.16 + i * 0.07);
    ctx.beginPath();
    ctx.moveTo(tx, y - s * 0.22 + i * s * 0.025);
    ctx.lineTo(tx - s * 0.02, y - s * 0.12 + i * s * 0.025);
    ctx.stroke();
  }
  // ogen
  ctx.fillStyle = '#ffffff';
  for (const dx of [-0.18, 0.18]) {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + s * 0.02, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#1d1a20';
  for (const dx of [-0.16, 0.2]) {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + s * 0.03, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  // mond
  ctx.strokeStyle = '#1d1a20';
  ctx.lineWidth = Math.max(2, s * 0.035);
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (lach) ctx.arc(x, y + s * 0.2, s * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
  else {
    ctx.moveTo(x - s * 0.16, y + s * 0.3);
    ctx.lineTo(x + s * 0.16, y + s * 0.3);
  }
  ctx.stroke();
}

const cache = new Map<string, THREE.Texture>();
/** Portret van Frank als textuur (achtergrond, tekst eronder optioneel). */
export function frankTextuur(achter = '#3b2f4d', tekst?: string) {
  const key = `${achter}|${tekst ?? ''}`;
  let t = cache.get(key);
  if (!t) {
    t = maakTextuur(
      1,
      tekst ? 1.25 : 1,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, w * 0.45, 0, w / 2, w * 0.45, w * 0.7);
        g.addColorStop(0, '#ffffff22');
        g.addColorStop(1, '#00000000');
        ctx.fillStyle = achter;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        tekenFrank(ctx, w / 2, w * 0.5, w * 0.5);
        if (tekst) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `700 ${w * 0.12}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(tekst, w / 2, h - w * 0.08);
        }
      },
      256,
    );
    cache.set(key, t);
  }
  return t;
}

/** Klein schilderij van Frank met een gouden lijst. Hang het tegen een muur (rot = kijkrichting). */
export function FrankSchilderij({ pos, rot = 0, b = 0.5, achter = '#3b2f4d' }: { pos: V3; rot?: number; b?: number; achter?: string }) {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: frankTextuur(achter), roughness: 0.7 }), [achter]);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.1, b + 0.1, 0.05]} color="#b8913f" r={0.02} />
      <mesh position={[0, 0, 0.028]} material={m}>
        <planeGeometry args={[b, b]} />
      </mesh>
    </group>
  );
}

/** Poster of affiche met Frank en een tekstje (bv. op een billboard of prikbord). */
export function FrankPoster({ pos, rot = 0, b = 0.6, tekst = 'Frank', achter = '#2f6b4a' }: { pos: V3; rot?: number; b?: number; tekst?: string; achter?: string }) {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: frankTextuur(achter, tekst), roughness: 0.8 }), [achter, tekst]);
  return (
    <mesh position={pos} rotation={[0, rot, 0]} material={m}>
      <planeGeometry args={[b, b * 1.25]} />
    </mesh>
  );
}

/** Mini-beeldje van Frank (bv. op een plank of dashboard). */
export function FrankPopje({ pos, rot = 0, s = 0.25 }: { pos: V3; rot?: number; s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <Blok size={[0.48, 0.5, 0.3]} pos={[0, 0.5, 0]} color="#4b3a5e" r={0.06} />
      <Blok size={[0.16, 0.3, 0.18]} pos={[-0.12, 0.13, 0]} color="#2c2a33" r={0.04} />
      <Blok size={[0.16, 0.3, 0.18]} pos={[0.12, 0.13, 0]} color="#2c2a33" r={0.04} />
      <Blok size={[0.4, 0.42, 0.38]} pos={[0, 0.97, 0]} color="#7fbf6a" r={0.07} />
      <Blok size={[0.42, 0.1, 0.4]} pos={[0, 1.2, 0]} color="#1d1a20" r={0.03} />
      {[-0.23, 0.23].map((x) => (
        <Blok key={x} size={[0.08, 0.06, 0.06]} pos={[x, 0.86, 0]} color="#a3a8ad" r={0.02} />
      ))}
      <mesh position={[0, 1.0, 0.195]} material={mat('#1d1820')}>
        <planeGeometry args={[0.2, 0.06]} />
      </mesh>
    </group>
  );
}
