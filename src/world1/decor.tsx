// Themameubels voor het havenkantoor: reddingsboei, stuurwiel, kapstok met regenjassen, vitrine met
// scheepsmodel, maquettes (vrachtschip, portaalkraan, containers), het grote rekenkaartbord,
// het vertrekbord, een bureau en vlaggetjes. Alles staat met de achterkant naar −z (rot 0 = tegen een achtermuur).
import { useMemo } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { P } from '../game/palette';
import { FONT, rondRect, useTextuur } from '../game/tekst';
import { Poppetje, Tekst } from './bouw';
import { tekenHeleKaart } from './rekenkaart';

type V3 = [number, number, number];
interface Plaats {
  pos: V3;
  rot?: number;
}

/** Reddingsboei aan de muur (rood-wit). */
export function Reddingsboei({ pos, rot = 0, s = 1 }: Plaats & { s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} material={mat(i % 2 ? '#fbfaf6' : '#d8342a', { rough: 0.5 })}>
          <torusGeometry args={[0.3, 0.09, 8, 6, Math.PI / 4]} />
        </mesh>
      ))}
      <Tekst regels={['DE EENHEID']} b={0.34} h={0.07} pos={[0, -0.47, 0]} o={{ bg: '#1f3c5a', fg: '#ffffff' }} />
    </group>
  );
}

/** Stuurwiel van een schip aan de muur. */
export function Stuurwiel({ pos, rot = 0 }: Plaats) {
  const hout = mat('#8a5a32');
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh material={hout}>
        <torusGeometry args={[0.38, 0.04, 8, 24]} />
      </mesh>
      <Cil r={0.08} h={0.08} rot={[Math.PI / 2, 0, 0]} color="#c9a04a" seg={12} />
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
          <mesh position={[0, 0.3, 0]} material={hout}>
            <cylinderGeometry args={[0.022, 0.022, 0.5, 6]} />
          </mesh>
          <mesh position={[0, 0.58, 0]} material={hout}>
            <cylinderGeometry args={[0.03, 0.022, 0.14, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Kapstok met gele regenjassen en een pet. */
export function Kapstok({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Cil r={0.2} h={0.05} pos={[0, 0.025, 0]} color="#3b2a1f" seg={12} />
      <Cil r={0.035} h={1.85} pos={[0, 0.95, 0]} color="#5a3a24" seg={8} />
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <Blok size={[0.22, 0.6, 0.12]} pos={[0.13, 1.4, 0]} rot={[0, 0, 0.12]} color={i === 1 ? '#1f3c5a' : '#f2c21e'} r={0.05} />
        </group>
      ))}
      <Cil r={0.14} h={0.08} pos={[0, 1.9, 0]} color="#1f3c5a" seg={12} />
    </group>
  );
}

/** Kastje met een glazen vitrine en een scheepsmodel erin. */
export function Vitrine({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.2, 0.9, 0.5]} pos={[0, 0.45, 0]} color="#5a3a24" r={0.03} />
      <Blok size={[1.1, 0.55, 0.42]} pos={[0, 1.18, 0]} color="#d7eef3" r={0.02} opacity={0.3} />
      <Blok size={[1.16, 0.05, 0.46]} pos={[0, 1.48, 0]} color="#5a3a24" r={0.01} />
      <group position={[0, 0.92, 0]} scale={0.045} rotation={[0, Math.PI / 2, 0]}>
        <Vrachtschip />
      </group>
    </group>
  );
}

/** Het vrachtschip "De Eenheid" (langs de z-as, boeg naar −z, waterlijn op y = 0). */
export function Vrachtschip() {
  const L = 21;
  const B = 6.4;
  const boeg = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-B / 2, 0);
    s.lineTo(B / 2, 0);
    s.quadraticCurveTo(B / 2, -2.6, 0, -3.6);
    s.quadraticCurveTo(-B / 2, -2.6, -B / 2, 0);
    return s;
  }, []);
  const kleuren = ['#d86a4a', '#4f86b8', '#e6b43a', '#4f9a5a', '#8b6bb5', '#d86a4a', '#4f86b8', '#e6b43a'];
  return (
    <group>
      <Blok size={[B, 0.8, L]} pos={[0, 0.4, 0]} color="#b4443a" r={0.2} />
      <Blok size={[B, 1.7, L]} pos={[0, 1.55, 0]} color="#1f3c5a" r={0.2} />
      <mesh position={[0, 0, -L / 2 + 0.02]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#1f3c5a')} castShadow>
        <extrudeGeometry args={[boeg, { depth: 2.4, bevelEnabled: false }]} />
      </mesh>
      <Blok size={[B + 0.1, 0.14, L]} pos={[0, 2.42, 0]} color="#e9e3d8" r={0.05} />
      {kleuren.map((k, i) => (
        <group key={i} position={[i % 2 ? 1.3 : -1.3, 2.5, -6.5 + Math.floor(i / 2) * 3.1]}>
          <Blok size={[2.4, 1.3, 2.9]} pos={[0, 0.65, 0]} color={k} r={0.04} />
          {i < 4 && <Blok size={[2.4, 1.3, 2.9]} pos={[0, 1.95, 0]} color={kleuren[(i + 3) % kleuren.length]} r={0.04} />}
        </group>
      ))}
      <group position={[0, 2.5, L / 2 - 2.6]}>
        <Blok size={[5.2, 2.2, 3.4]} pos={[0, 1.1, 0]} color="#f3efe6" r={0.12} />
        <Blok size={[4.4, 1.5, 2.8]} pos={[0, 2.95, 0.1]} color="#f3efe6" r={0.12} />
        <Blok size={[4.5, 0.55, 0.06]} pos={[0, 3.05, -1.32]} color={P.glas} r={0.02} />
        <Blok size={[5.6, 0.16, 3.6]} pos={[0, 3.75, 0.1]} color="#2f3634" r={0.04} />
        <Cil r={0.32} h={1.4} pos={[0, 4.5, 0.8]} color="#d86a4a" seg={14} />
      </group>
      <Cil r={0.08} h={4.2} pos={[0, 4.5, -L / 2 + 1.4]} color="#e9e3d8" seg={8} />
    </group>
  );
}

/** Zeecontainer van 6 × 2,4 × 2,6 m met ribbels (voor maquettes). */
export function Container({ kleur }: { kleur: string }) {
  return (
    <group>
      <Blok size={[2.44, 2.6, 6]} pos={[0, 1.3, 0]} color={kleur} r={0.05} />
      {[-1, 1].map((s) => (
        <group key={s}>
          {Array.from({ length: 5 }, (_, i) => (
            <Blok key={i} size={[0.08, 2.3, 0.3]} pos={[s * 1.24, 1.3, -2.4 + i * 1.2]} color={kleur} r={0.02} shadow={false} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Portaalkraan (voor maquettes). */
export function Portaalkraan({ breed = 12, hoog = 11 }: { breed?: number; hoog?: number }) {
  return (
    <group>
      {[-1, 1].map((s) => [-1, 1].map((t) => <Blok key={`${s}${t}`} size={[0.6, hoog, 0.6]} pos={[(s * breed) / 2, hoog / 2, t * 2.2]} color="#e6b43a" r={0.06} />))}
      {[-1, 1].map((t) => (
        <Blok key={t} size={[breed + 0.8, 0.8, 0.6]} pos={[0, hoog, t * 2.2]} color="#e6b43a" r={0.06} />
      ))}
      <Blok size={[2.2, 1.4, 1.8]} pos={[-breed / 2 + 1.6, hoog - 1.1, 0]} color="#f3efe6" r={0.1} />
    </group>
  );
}

/** Maquette van de haven op een tafel met vilt: water, kade, schip, kraan en containers. Model in m, schaal 1:25. */
export function HavenMaquette({ pos, rot = 0 }: Plaats) {
  const s = 1 / 25;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {/* tafel */}
      <Blok size={[3.0, 0.08, 1.6]} pos={[0, 0.76, 0]} color="#7a5233" r={0.03} />
      {[-1.35, 1.35].map((x) => [-0.65, 0.65].map((z) => <Blok key={`${x}${z}`} size={[0.1, 0.72, 0.1]} pos={[x, 0.36, z]} color="#4a2f1e" r={0.02} />))}
      <group position={[0, 0.8, 0]}>
        {/* water en kade */}
        <Blok size={[1.6, 0.02, 1.4]} pos={[-0.6, 0.01, 0]} color="#3f93ab" r={0.005} />
        <Blok size={[1.2, 0.08, 1.4]} pos={[0.8, 0.04, 0]} color="#b9ab96" r={0.01} />
        <group position={[-0.65, 0.02, 0]} scale={s} rotation={[0, Math.PI / 2, 0]}>
          <Vrachtschip />
        </group>
        <group position={[0.65, 0.08, 0]} scale={s} rotation={[0, Math.PI / 2, 0]}>
          <Portaalkraan breed={8} hoog={10} />
        </group>
        {[
          [0.95, -0.35, '#d86a4a'],
          [0.95, -0.1, '#4f86b8'],
          [0.95, 0.15, '#e6b43a'],
          [0.95, 0.4, '#4f9a5a'],
        ].map(([x, z, k], i) => (
          <group key={i} position={[x as number, 0.08, z as number]} scale={s} rotation={[0, Math.PI / 2, 0]}>
            <Container kleur={k as string} />
          </group>
        ))}
        <Tekst regels={['De haven, schaal 1 : 25']} b={0.8} h={0.13} pos={[0.6, 0.1, 0.62]} rot={[-0.6, 0, 0]} o={{ bg: '#fbf7ee', fg: '#1f2a24' }} />
      </group>
    </group>
  );
}

/** De hele rekenkaart als groot emaille bord aan de muur. */
export function GroteRekenkaart({ pos, b = 6.4, h = 2.8 }: { pos: V3; b?: number; h?: number }) {
  const kaart = useTextuur(b, h, (ctx, cw, ch) => tekenHeleKaart(ctx, cw, ch), `rekenkaart-muur-${b}-${h}`, 260);
  return (
    <group position={pos}>
      <Blok size={[b + 0.2, h + 0.2, 0.06]} pos={[0, 0, -0.01]} color="#2f3b44" r={0.03} shadow={false} />
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[b, h]} />
        <meshStandardMaterial map={kaart} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Vertrekbord met de vertrektijd van het schip (gloeiend). */
export function Vertrekbord({ pos }: { pos: V3 }) {
  const tex = useTextuur(
    2.4,
    1.0,
    (ctx, w, h) => {
      ctx.fillStyle = '#121a20';
      rondRect(ctx, 0, 0, w, h, h * 0.06);
      ctx.fill();
      ctx.fillStyle = '#ffd27a';
      ctx.font = `700 ${h * 0.16}px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText('VERTREK', w * 0.05, h * 0.16);
      ctx.fillStyle = '#e9edf0';
      ctx.font = `600 ${h * 0.13}px ${FONT}`;
      const rij = (y: number, a: string, b: string, c: string, kleur = '#e9edf0') => {
        ctx.fillStyle = kleur;
        ctx.fillText(a, w * 0.05, y);
        ctx.fillText(b, w * 0.32, y);
        ctx.textAlign = 'right';
        ctx.fillText(c, w * 0.95, y);
        ctx.textAlign = 'left';
      };
      rij(h * 0.42, '18:00', 'De Eenheid', 'poort 1', '#9cf0b4');
      rij(h * 0.62, '19:30', 'Zeemeeuw', 'kade 3');
      rij(h * 0.82, '21:15', 'Noordster', 'kade 7');
    },
    'vertrekbord',
    260,
  );
  return (
    <group position={pos}>
      <Blok size={[2.5, 1.1, 0.1]} pos={[0, 0, -0.02]} color="#2f3634" r={0.03} shadow={false} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.4, 1.0]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Bureau van havenmeester Fenna, met lamp, papieren en Fenna zelf. */
export function Bureau({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.6, 0.08, 0.8]} pos={[0, 0.76, 0]} color="#6b4630" r={0.02} />
      <Blok size={[0.45, 0.72, 0.74]} pos={[-0.55, 0.36, 0]} color="#5a3a24" r={0.02} />
      <Blok size={[0.06, 0.72, 0.74]} pos={[0.75, 0.36, 0]} color="#5a3a24" r={0.02} />
      <Blok size={[0.5, 0.01, 0.35]} pos={[0.1, 0.805, 0.1]} rot={[0, 0.2, 0]} color="#fbfaf6" r={0.002} />
      <Cil r={0.08} h={0.03} pos={[0.55, 0.815, -0.2]} color="#2f3634" seg={10} />
      <Cil r={0.012} h={0.35} pos={[0.55, 0.98, -0.2]} color="#2f3634" seg={6} />
      <mesh position={[0.5, 1.15, -0.2]} material={mat('#ffd9a0', { emissive: '#ffb45a' })}>
        <coneGeometry args={[0.1, 0.12, 12, 1, true]} />
      </mesh>
      {/* Fenna achter het bureau, met pet */}
      <Poppetje pos={[0, 0, -0.75]} s={1} shirt="#1f3c5a" broek="#2f3634" haar="#c8742a" />
      <Blok size={[0.32, 0.07, 0.3]} pos={[0, 1.24, -0.74]} color="#1f3c5a" r={0.03} />
      <Blok size={[0.3, 0.02, 0.12]} pos={[0, 1.21, -0.57]} color="#1f2a24" r={0.008} />
      <Blok size={[0.6, 0.06, 0.55]} pos={[0, 0.45, -0.75]} color="#2f3634" r={0.03} />
    </group>
  );
}

/** Lijn met vlaggetjes tussen twee punten (hoog in de zaal). */
export function Vlaggetjes({ van, naar }: { van: V3; naar: V3 }) {
  const n = 12;
  const kleuren = ['#d8342a', '#fbfaf6', '#1f5fa8', '#f2c21e'];
  const dx = naar[0] - van[0];
  const dz = naar[2] - van[2];
  const lengte = Math.hypot(dx, dz);
  const hoek = Math.atan2(-dz, dx);
  return (
    <group position={van} rotation={[0, hoek, 0]}>
      <mesh position={[lengte / 2, -0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#e9e3d7')}>
        <cylinderGeometry args={[0.008, 0.008, lengte, 4]} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const zak = Math.sin(t * Math.PI) * 0.3;
        return (
          <mesh key={i} position={[t * lengte, -0.15 - zak - 0.12, 0]} rotation={[0, 0, Math.PI]} material={mat(kleuren[i % 4])}>
            <coneGeometry args={[0.12, 0.26, 3]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Houten pallet met dozen (los decor). */
export function PalletStapel({ pos, rot = 0, kleur = '#c99a62', lagen = 2 }: Plaats & { kleur?: string; lagen?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.2, 0.14, 1.0]} pos={[0, 0.07, 0]} color={P.houtLicht} r={0.02} />
      {Array.from({ length: lagen }, (_, i) => (
        <Blok key={i} size={[1.1, 0.42, 0.92]} pos={[0, 0.36 + i * 0.44, 0]} color={kleur} r={0.03} />
      ))}
    </group>
  );
}

/** Ouderwetse bascule (weegschaal met gewichten) voor de weegruimte. */
export function Bascule({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.9, 0.12, 0.7]} pos={[0, 0.06, 0]} color="#3f6b4c" r={0.03} />
      <Blok size={[0.12, 1.1, 0.12]} pos={[-0.32, 0.65, -0.2]} color="#3f6b4c" r={0.03} />
      <Blok size={[0.9, 0.05, 0.05]} pos={[0, 1.2, -0.2]} color="#2f3634" r={0.01} />
      {[0, 1, 2].map((i) => (
        <Cil key={i} r={0.07 - i * 0.012} h={0.06} pos={[0.2 + i * 0.12, 0.15, 0.15]} color="#4a4f52" seg={12} />
      ))}
    </group>
  );
}

/** Zeekaart aan de muur (eigen tekening). */
export function Zeekaart({ pos, rot = 0, b = 1.6, h = 1.1 }: Plaats & { b?: number; h?: number }) {
  const tex = useTextuur(
    b,
    h,
    (ctx, w, hh) => {
      ctx.fillStyle = '#e8dcbc';
      ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = '#9fc4d8';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.55, 0);
      ctx.quadraticCurveTo(w * 0.4, hh * 0.4, w * 0.6, hh * 0.6);
      ctx.quadraticCurveTo(w * 0.8, hh * 0.8, w * 0.7, hh);
      ctx.lineTo(0, hh);
      ctx.fill();
      ctx.strokeStyle = 'rgba(31,60,90,0.4)';
      ctx.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 6, 0);
        ctx.lineTo((i * w) / 6, hh);
        ctx.stroke();
      }
      ctx.strokeStyle = '#d8342a';
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.62, hh * 0.62);
      ctx.quadraticCurveTo(w * 0.3, hh * 0.5, w * 0.12, hh * 0.15);
      ctx.stroke();
      ctx.setLineDash([]);
      // windroos
      ctx.fillStyle = '#1f3c5a';
      ctx.beginPath();
      ctx.moveTo(w * 0.85, hh * 0.12);
      ctx.lineTo(w * 0.88, hh * 0.25);
      ctx.lineTo(w * 0.85, hh * 0.38);
      ctx.lineTo(w * 0.82, hh * 0.25);
      ctx.fill();
      ctx.font = `700 ${hh * 0.1}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('N', w * 0.85, hh * 0.08);
    },
    `zeekaart-${b}-${h}`,
    160,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b + 0.12, h + 0.12, 0.05]} color="#6b4630" r={0.02} shadow={false} />
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[b, h]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Koperen patrijspoort aan de muur. */
export function Patrijspoort({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh material={mat('#c9a04a', { metal: 0.6, rough: 0.35 })}>
        <torusGeometry args={[0.28, 0.06, 10, 24]} />
      </mesh>
      <mesh position={[0, 0, -0.01]} material={mat('#8fd0e0', { rough: 0.2 })}>
        <circleGeometry args={[0.28, 22]} />
      </mesh>
    </group>
  );
}

/** Weegbrug in de vloer (staalplaat met geel-zwarte rand), met een pallet erop en een paal met scherm. */
export function Weegbrug({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[2.3, 0.04, 1.7]} pos={[0, 0.02, 0]} color="#2f3634" r={0.01} shadow={false} />
      {[-1, 1].map((s) => (
        <group key={s}>
          {Array.from({ length: 8 }, (_, i) => (
            <Blok key={i} size={[0.27, 0.045, 0.08]} pos={[-1.0 + i * 0.285, 0.022, s * 0.81]} color={i % 2 ? '#1f2a24' : '#f2c21e'} r={0.005} shadow={false} />
          ))}
        </group>
      ))}
      <Blok size={[2.1, 0.03, 1.5]} pos={[0, 0.05, 0]} color="#7d868b" r={0.01} shadow={false} />
      <PalletStapel pos={[-0.3, 0.05, 0]} rot={0.15} kleur="#b98a55" />
      <group position={[1.35, 0, -0.6]}>
        <Cil r={0.04} h={1.5} pos={[0, 0.75, 0]} color="#3b4246" seg={8} />
        <Blok size={[0.6, 0.32, 0.08]} pos={[0, 1.55, 0]} color="#2f3634" r={0.03} />
        <Tekst regels={['WEEGBRUG']} b={0.54} h={0.24} pos={[0, 1.55, 0.042]} o={{ bg: '#17211d', fg: '#ffd27a', basic: true }} />
      </group>
    </group>
  );
}
