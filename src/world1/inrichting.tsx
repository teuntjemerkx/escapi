// Wereld 1 (De Ellehaven): meubels en spullen voor de visafslag, werf, loodsen, kantine, vertrekloods en kades.
// Alles is vast decor (geen useFrame) en wordt samengevoegd. Maten in meters; rot 0 = voorkant naar +z.
import { useMemo } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { FONT, rondRect, useTextuur } from '../game/tekst';
import { Tekst } from './bouw';
import { lampMat, vlekMat } from './sfeer';

type V3 = [number, number, number];
interface Plaats {
  pos: V3;
  rot?: number;
}

const STAAL = '#3b4246';
const RVS = '#b9c2c6';
const HOUT = '#8a6440';
const DONKERHOUT = '#5a3a24';

// ── visafslag ───────────────────────────────────────────────────────────

/** Kavelbordje op de afslagtafel (achter-links op het blad): "KAVEL 1". */
export function Kavelbord({ nr }: { nr: number }) {
  return (
    <group position={[-0.42, 0, -0.22]} rotation={[0, 0.25, 0]}>
      <Blok size={[0.04, 0.32, 0.04]} pos={[0, 0.16, 0]} color={RVS} r={0.01} />
      <Blok size={[0.36, 0.2, 0.025]} pos={[0, 0.36, 0]} color="#1f3c5a" r={0.01} />
      <Tekst regels={['KAVEL', String(nr)]} b={0.32} h={0.17} pos={[0, 0.36, 0.014]} o={{ bg: '#1f3c5a', fg: '#ffffff', radius: 0.05 }} />
    </group>
  );
}

/** Tribune met kopersbanken (treden langs x, van x1 omhoog naar x0). De botsing/hoogte staat in registreer. */
export function Tribune({ x0, x1, z0, z1, treden = 3, stap = 0.35 }: { x0: number; x1: number; z0: number; z1: number; treden?: number; stap?: number }) {
  const diep = (x1 - x0) / treden;
  const lang = z1 - z0;
  const zm = (z0 + z1) / 2;
  return (
    <group>
      {Array.from({ length: treden }, (_, i) => {
        const h = stap * (treden - i);
        const x = x0 + diep * (i + 0.5);
        return (
          <group key={i}>
            <Blok size={[diep, h, lang]} pos={[x, h / 2, zm]} color={i % 2 ? '#6b4a30' : '#71503a'} r={0.02} />
            <Blok size={[0.06, 0.04, lang]} pos={[x + diep / 2 - 0.03, h + 0.02, zm]} color="#e2b33a" r={0.01} shadow={false} />
            {/* kopersbank met rugleuning */}
            <Blok size={[0.42, 0.08, lang - 0.4]} pos={[x - diep * 0.12, h + 0.42, zm]} color="#2f5a7a" r={0.02} />
            {Array.from({ length: Math.floor(lang / 2) }, (_, j) => (
              <Blok key={j} size={[0.06, 0.4, 0.06]} pos={[x - diep * 0.12, h + 0.2, z0 + 1 + j * 2]} color={STAAL} r={0.01} />
            ))}
            <Blok size={[0.05, 0.36, lang - 0.4]} pos={[x - diep * 0.12 - 0.2, h + 0.64, zm]} color="#2f5a7a" r={0.015} />
          </group>
        );
      })}
      {/* leuning bovenaan */}
      <Blok size={[0.06, 1.0, lang]} pos={[x0 + 0.1, stap * treden + 0.5, zm]} color={STAAL} r={0.02} />
    </group>
  );
}

/** Wijzerplaat van de veilingklok (rond, 2,4 m): getallen van 100 naar 0 en een ring van lampjes. Staat naar +z. */
export function Veilingklok({ pos, rot = 0 }: Plaats) {
  const tex = useTextuur(
    2.4,
    2.4,
    (ctx, w, h) => {
      const c = w / 2;
      ctx.fillStyle = '#111a20';
      ctx.beginPath();
      ctx.arc(c, c, c, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e9edf0';
      ctx.font = `700 ${w * 0.055}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 100; i++) {
        const a = -Math.PI / 2 + (i / 100) * Math.PI * 2;
        const r1 = c * 0.9;
        const r0 = i % 10 === 0 ? c * 0.78 : c * 0.85;
        ctx.strokeStyle = i % 10 === 0 ? '#ffd27a' : '#6e7c86';
        ctx.lineWidth = i % 10 === 0 ? w * 0.008 : w * 0.004;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
        ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
        ctx.stroke();
        if (i % 10 === 0) ctx.fillText(String(100 - i), c + Math.cos(a) * c * 0.66, c + Math.sin(a) * c * 0.66);
      }
      ctx.fillStyle = '#9cf0b4';
      ctx.font = `700 ${w * 0.07}px ${FONT}`;
      ctx.fillText('AFSLAG', c, c * 0.72);
      ctx.fillStyle = '#e9edf0';
      ctx.font = `600 ${w * 0.05}px ${FONT}`;
      ctx.fillText('Ellehaven', c, c * 1.36);
    },
    'veilingklok',
    300,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0, -0.02]} material={mat('#2b3034', { metal: 0.4, rough: 0.5 })}>
        <cylinderGeometry args={[1.3, 1.3, 0.12, 40]} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <circleGeometry args={[1.2, 48]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Stapel viskisten (blauw en wit kunststof), n hoog. */
export function Viskisten({ pos, rot = 0, n = 3, ijs = false }: Plaats & { n?: number; ijs?: boolean }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, i * 0.27, 0]} rotation={[0, ((i * 37) % 5) * 0.02, 0]}>
          <Blok size={[0.8, 0.26, 0.5]} pos={[0, 0.13, 0]} color={i % 2 ? '#e9edf0' : '#2f6f9a'} r={0.03} />
          <Blok size={[0.7, 0.02, 0.4]} pos={[0, 0.25, 0]} color={ijs && i === n - 1 ? '#e8f6fa' : i % 2 ? '#d6dcdf' : '#265d82'} r={0.005} shadow={false} />
        </group>
      ))}
    </group>
  );
}

/** Rolbaan: stalen frame met rollen, lengte langs x. */
export function Rolbaan({ pos, rot = 0, lengte = 5 }: Plaats & { lengte?: number }) {
  const n = Math.floor(lengte / 0.25);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.32, 0.32].map((z) => (
        <Blok key={z} size={[lengte, 0.08, 0.05]} pos={[0, 0.72, z]} color={RVS} r={0.01} />
      ))}
      {Array.from({ length: Math.floor(lengte / 1.2) + 1 }, (_, i) => (
        <group key={i}>
          {[-0.32, 0.32].map((z) => (
            <Blok key={z} size={[0.05, 0.72, 0.05]} pos={[-lengte / 2 + 0.1 + i * 1.2, 0.36, z]} color={RVS} r={0.01} />
          ))}
        </group>
      ))}
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[-lengte / 2 + 0.15 + i * 0.25, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#8d979c', { metal: 0.5, rough: 0.4 })}>
          <cylinderGeometry args={[0.035, 0.035, 0.62, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** Hanglamp (industrieel, kap naar beneden) aan een kabel tot het plafond `top`. Lichtkap gaat aan met de fase. */
export function Hanglamp({ pos, top, kap = '#2f5a44' }: { pos: V3; top: number; kap?: string }) {
  const l = top - pos[1];
  return (
    <group position={pos}>
      <Blok size={[0.012, l, 0.012]} pos={[0, l / 2, 0]} color="#1f1f1f" r={0} shadow={false} />
      <mesh position={[0, 0.1, 0]} material={mat(kap, { metal: 0.3, rough: 0.5 })}>
        <coneGeometry args={[0.32, 0.26, 14, 1, true]} />
      </mesh>
      <mesh position={[0, -0.02, 0]} material={lampMat}>
        <sphereGeometry args={[0.09, 10, 6]} />
      </mesh>
    </group>
  );
}

// ── werf ────────────────────────────────────────────────────────────────

/** Werkbank met bankschroef, planken eronder en een gereedschapsbord erachter (tegen een muur aan −z). */
export function Werkbank({ pos, rot = 0, b = 2.4 }: Plaats & { b?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.08, 0.8]} pos={[0, 0.9, 0]} color="#9a7048" r={0.02} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.08, 0.86, 0.7]} pos={[s * (b / 2 - 0.1), 0.43, 0]} color={DONKERHOUT} r={0.01} />
      ))}
      <Blok size={[b - 0.3, 0.04, 0.6]} pos={[0, 0.25, 0]} color={DONKERHOUT} r={0.01} />
      <Blok size={[b - 0.5, 0.12, 0.5]} pos={[0, 0.33, 0]} color="#b98a55" r={0.01} />
      <Blok size={[0.16, 0.14, 0.2]} pos={[b / 2 - 0.3, 1.0, 0.3]} color="#3f6fa0" r={0.02} />
      {/* gereedschapsbord met silhouetten */}
      <Blok size={[b, 1.0, 0.04]} pos={[0, 1.65, -0.42]} color="#c9b48a" r={0.01} />
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <Blok key={x} size={[0.06 + (i % 2) * 0.1, 0.4 + (i % 3) * 0.1, 0.03]} pos={[x * (b / 2.4), 1.65, -0.39]} color={i % 2 ? '#c0392b' : STAAL} r={0.01} />
      ))}
    </group>
  );
}

/** Zaagbok met een plank. */
export function Zaagbok({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.45, 0.45].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-1, 1].map((s) => (
            <Blok key={s} size={[0.06, 0.75, 0.06]} pos={[0, 0.36, s * 0.16]} rot={[s * 0.25, 0, 0]} color={DONKERHOUT} r={0.01} />
          ))}
          <Blok size={[0.1, 0.08, 0.3]} pos={[0, 0.72, 0]} color={DONKERHOUT} r={0.01} />
        </group>
      ))}
      <Blok size={[2.2, 0.05, 0.3]} pos={[0.2, 0.79, 0]} rot={[0, 0.05, 0]} color="#c49a62" r={0.01} />
    </group>
  );
}

/** Stapel planken op klossen. */
export function Planken({ pos, rot = 0, l = 3.2, n = 6 }: Plaats & { l?: number; n?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 0, 1].map((x) => (
        <Blok key={x} size={[0.12, 0.1, 0.9]} pos={[x * (l / 2.6), 0.05, 0]} color={DONKERHOUT} r={0.01} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <Blok key={i} size={[l, 0.05, 0.22]} pos={[(i % 2) * 0.08, 0.13 + Math.floor(i / 3) * 0.055, -0.25 + (i % 3) * 0.25]} color={i % 2 ? '#c49a62' : '#b98a55'} r={0.005} />
      ))}
    </group>
  );
}

/** Houten spanten van een sloep op een bok (werk in uitvoering). */
export function Bootspanten({ pos, rot = 0 }: Plaats) {
  const spanten = useMemo(() => {
    const g = new THREE.TorusGeometry(1.0, 0.05, 5, 14, Math.PI);
    g.rotateZ(Math.PI);
    return g;
  }, []);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[4.2, 0.14, 0.16]} pos={[0, 0.5, 0]} color="#6b4a30" r={0.02} />
      {[-1.6, 1.6].map((x) => (
        <Blok key={x} size={[0.2, 0.5, 1.2]} pos={[x, 0.25, 0]} color={DONKERHOUT} r={0.02} />
      ))}
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x, i) => {
        const s = 0.75 + 0.25 * Math.cos((x / 1.6) * 1.2);
        return <mesh key={i} geometry={spanten} position={[x, 1.45, 0]} rotation={[0, Math.PI / 2, 0]} scale={[s, s * 0.95, 1]} material={mat('#b98a55')} castShadow />;
      })}
      <Blok size={[3.6, 0.06, 0.08]} pos={[0, 1.42, 0.98]} color="#c49a62" r={0.01} />
      <Blok size={[3.6, 0.06, 0.08]} pos={[0, 1.42, -0.98]} color="#c49a62" r={0.01} />
    </group>
  );
}

/** Bouwhek (geel-wit) met voet; `l` lang langs x. */
export function Bouwhek({ pos, rot = 0, l = 3.4 }: Plaats & { l?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[(s * l) / 2, 0, 0]}>
          <Blok size={[0.5, 0.12, 0.22]} pos={[0, 0.06, 0]} color="#d8d2c4" r={0.03} />
          <Blok size={[0.04, 1.9, 0.04]} pos={[0, 1.0, 0]} color="#c9cdd0" r={0.005} />
        </group>
      ))}
      <Blok size={[l, 0.04, 0.03]} pos={[0, 1.92, 0]} color="#c9cdd0" r={0.005} />
      <Blok size={[l, 0.04, 0.03]} pos={[0, 0.2, 0]} color="#c9cdd0" r={0.005} />
      <mesh position={[0, 1.06, 0]} material={mat('#b4b8bb', { opacity: 0.5, metal: 0.4 })}>
        <planeGeometry args={[l, 1.7]} />
      </mesh>
      <Blok size={[l * 0.55, 0.28, 0.02]} pos={[0, 1.3, 0.02]} color="#f2c230" r={0.005} />
    </group>
  );
}

// ── loodsen ─────────────────────────────────────────────────────────────

/** Heftruck (geel) met een pallet op de vork. Voorkant (vork) naar +z. */
export function Heftruck({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.1, 0.6, 1.8]} pos={[0, 0.55, -0.1]} color="#e6b43a" r={0.08} />
      <Blok size={[1.0, 0.7, 0.6]} pos={[0, 0.6, -0.75]} color="#3b3f44" r={0.06} />
      {[-0.48, 0.48].map((x) => (
        <group key={x}>
          <Blok size={[0.06, 1.3, 0.06]} pos={[x, 1.55, -0.45]} color={STAAL} r={0.01} />
          <Blok size={[0.06, 1.3, 0.06]} pos={[x, 1.55, 0.45]} color={STAAL} r={0.01} />
        </group>
      ))}
      <Blok size={[1.0, 0.06, 1.0]} pos={[0, 2.2, 0]} color={STAAL} r={0.01} />
      <Blok size={[0.12, 0.08, 0.6]} pos={[0, 1.3, 0.2]} color="#2b2f33" r={0.02} />
      {[-0.3, 0.3].map((x) => (
        <Blok key={x} size={[0.12, 2.3, 0.1]} pos={[x, 1.15, 0.85]} color={STAAL} r={0.01} />
      ))}
      {[-0.25, 0.25].map((x) => (
        <Blok key={x} size={[0.1, 0.05, 1.1]} pos={[x, 0.12, 1.45]} color="#2b2f33" r={0.01} />
      ))}
      {[
        [-0.5, -0.65],
        [0.5, -0.65],
        [-0.5, 0.55],
        [0.5, 0.55],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]} rotation={[0, 0, Math.PI / 2]} material={mat('#1d1f21')}>
          <cylinderGeometry args={[0.24, 0.24, 0.2, 12]} />
        </mesh>
      ))}
      <Blok size={[1.0, 0.12, 1.0]} pos={[0, 0.22, 1.45]} color="#b98a55" r={0.02} />
      <Blok size={[0.9, 0.6, 0.9]} pos={[0, 0.58, 1.45]} color="#c99a62" r={0.03} />
    </group>
  );
}

/** Magazijnstelling (palletstelling) langs x, met dozen. Achterkant naar −z. */
export function Stelling({ pos, rot = 0, b = 5.4, lagen = 3, seed = 1 }: Plaats & { b?: number; lagen?: number; seed?: number }) {
  const vakken = Math.max(1, Math.round(b / 2.7));
  const vb = b / vakken;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {Array.from({ length: vakken + 1 }, (_, i) => (
        <group key={i} position={[-b / 2 + i * vb, 0, 0]}>
          {[-0.45, 0.45].map((z) => (
            <Blok key={z} size={[0.08, lagen * 1.3 + 0.2, 0.08]} pos={[0, (lagen * 1.3 + 0.2) / 2, z]} color="#2f6f9a" r={0.01} />
          ))}
        </group>
      ))}
      {Array.from({ length: lagen }, (_, l) => (
        <group key={l} position={[0, 0.15 + l * 1.3, 0]}>
          {[-0.45, 0.45].map((z) => (
            <Blok key={z} size={[b, 0.1, 0.06]} pos={[0, 0, z]} color="#e8781f" r={0.01} />
          ))}
          {Array.from({ length: vakken * 2 }, (_, j) => {
            const k = (seed * 7 + l * 3 + j * 5) % 4;
            if (k === 3 && l > 0) return null;
            const x = -b / 2 + vb * (Math.floor(j / 2) + 0.27 + (j % 2) * 0.46);
            return (
              <group key={j} position={[x, 0.05, 0]}>
                <Blok size={[1.0, 0.12, 0.9]} pos={[0, 0.06, 0]} color="#b98a55" r={0.02} />
                <Blok size={[0.9, 0.5 + k * 0.15, 0.8]} pos={[0, 0.12 + (0.5 + k * 0.15) / 2, 0]} color={k === 1 ? '#d8c9a8' : k === 2 ? '#b07a4a' : '#c99a62'} r={0.03} />
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/** Groot display aan een paal (weegbrug): "kg". */
export function Weegdisplay({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Cil r={0.07} h={2.6} pos={[0, 1.3, 0]} color={STAAL} seg={8} />
      <Blok size={[1.6, 0.6, 0.14]} pos={[0, 2.85, 0]} color="#1f2a24" r={0.04} />
      <mesh position={[0, 2.85, 0.075]}>
        <planeGeometry args={[1.45, 0.46]} />
        <meshBasicMaterial color="#163a24" toneMapped={false} />
      </mesh>
      <Tekst regels={['WEEGBRUG · kg']} b={1.3} h={0.24} pos={[0, 2.85, 0.08]} o={{ transparant: true, fg: '#7dffa0', basic: true }} />
    </group>
  );
}

// ── kantine en vertrekloods ─────────────────────────────────────────────

/** Kantinetafel met vier stoelen. */
export function KantineTafel({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.6, 0.05, 0.8]} pos={[0, 0.74, 0]} color="#e9e3d7" r={0.02} />
      {[-0.7, 0.7].map((x) => (
        <Blok key={x} size={[0.05, 0.72, 0.6]} pos={[x, 0.36, 0]} color={STAAL} r={0.01} />
      ))}
      {[
        [-0.45, -0.6],
        [0.45, -0.6],
        [-0.45, 0.6],
        [0.45, 0.6],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, z < 0 ? 0 : Math.PI, 0]}>
          <Blok size={[0.42, 0.05, 0.42]} pos={[0, 0.45, 0]} color={i % 2 ? '#d86a4a' : '#2f6f9a'} r={0.02} />
          <Blok size={[0.42, 0.4, 0.04]} pos={[0, 0.68, -0.2]} color={i % 2 ? '#d86a4a' : '#2f6f9a'} r={0.02} />
          <Blok size={[0.03, 0.45, 0.03]} pos={[0, 0.22, 0]} color={STAAL} r={0.005} />
        </group>
      ))}
    </group>
  );
}

/** Rij kluisjes (lockers) tegen een muur aan −z. */
export function Kluisjes({ pos, rot = 0, n = 5 }: Plaats & { n?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[(i - (n - 1) / 2) * 0.45, 0, 0]}>
          <Blok size={[0.43, 1.9, 0.5]} pos={[0, 0.95, 0]} color={i % 2 ? '#4f86b8' : '#3f78a8'} r={0.01} />
          {[0.6, 1.3].map((y) => (
            <Blok key={y} size={[0.3, 0.06, 0.01]} pos={[0, y, 0.255]} color="#2b3e52" r={0.003} shadow={false} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Koffieautomaat met verlicht paneel. */
export function Koffieautomaat({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.7, 1.75, 0.6]} pos={[0, 0.875, 0]} color="#2f3634" r={0.04} />
      <mesh position={[0, 1.3, 0.305]} material={lampMat}>
        <planeGeometry args={[0.5, 0.5]} />
      </mesh>
      <Tekst regels={['KOFFIE']} b={0.46} h={0.12} pos={[0, 1.62, 0.306]} o={{ bg: '#1f2a24', fg: '#ffd27a' }} />
      <Blok size={[0.24, 0.24, 0.1]} pos={[0, 0.72, 0.3]} color="#111" r={0.02} />
    </group>
  );
}

/** Balie (toonbank) langs x met een blad, achterkant naar −z. */
export function Balie({ pos, rot = 0, b = 3, kleur = '#2f4d6b', blad = '#d8cdb8' }: Plaats & { b?: number; kleur?: string; blad?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 1.05, 0.7]} pos={[0, 0.525, 0]} color={kleur} r={0.03} />
      <Blok size={[b + 0.1, 0.06, 0.82]} pos={[0, 1.08, 0.04]} color={blad} r={0.02} />
      <Blok size={[b - 0.2, 0.05, 0.02]} pos={[0, 0.8, 0.36]} color="#c9a04a" r={0.005} shadow={false} />
    </group>
  );
}

/** Rij wachtstoelen (langs x). */
export function Wachtbank({ pos, rot = 0, n = 5 }: Plaats & { n?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[n * 0.55, 0.06, 0.08]} pos={[0, 0.3, 0]} color={STAAL} r={0.01} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.06, 0.32, 0.4]} pos={[(s * n * 0.55) / 2 - s * 0.15, 0.16, 0]} color={STAAL} r={0.01} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[(i - (n - 1) / 2) * 0.55, 0, 0]}>
          <Blok size={[0.5, 0.05, 0.46]} pos={[0, 0.46, 0]} color="#c0392b" r={0.03} />
          <Blok size={[0.5, 0.46, 0.05]} pos={[0, 0.72, -0.21]} rot={[-0.12, 0, 0]} color="#c0392b" r={0.03} />
        </group>
      ))}
    </group>
  );
}

/** Kofferkar met koffers. */
export function Kofferkar({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.7, 0.06, 1.0]} pos={[0, 0.3, 0]} color={STAAL} r={0.01} />
      <Blok size={[0.7, 0.9, 0.04]} pos={[0, 0.75, -0.48]} color={STAAL} r={0.01} />
      {[
        [-0.25, -0.35],
        [0.25, -0.35],
        [-0.25, 0.35],
        [0.25, 0.35],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} rotation={[0, 0, Math.PI / 2]} material={mat('#1d1f21')}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 10]} />
        </mesh>
      ))}
      <Blok size={[0.55, 0.38, 0.28]} pos={[0, 0.52, -0.25]} color="#8b5fa8" r={0.04} />
      <Blok size={[0.5, 0.3, 0.24]} pos={[0, 0.85, -0.27]} color="#3f8f5a" r={0.04} />
      <Blok size={[0.45, 0.34, 0.5]} pos={[0.02, 0.5, 0.2]} color="#c0392b" r={0.04} />
    </group>
  );
}

// ── kaartenkamer ────────────────────────────────────────────────────────

/** Globe op een houten voet. */
export function Globe({ pos }: { pos: V3 }) {
  const tex = useTextuur(
    2,
    1,
    (ctx, w, h) => {
      ctx.fillStyle = '#3f7fb0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9b77a';
      const vlekken = [
        [0.12, 0.3, 0.1, 0.18],
        [0.2, 0.62, 0.06, 0.16],
        [0.48, 0.28, 0.08, 0.1],
        [0.52, 0.55, 0.07, 0.2],
        [0.72, 0.3, 0.16, 0.14],
        [0.82, 0.68, 0.06, 0.06],
      ];
      for (const [x, y, rx, ry] of vlekken) {
        ctx.beginPath();
        ctx.ellipse(x * w, y * h, rx * w, ry * h, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    'globe',
    128,
  );
  return (
    <group position={pos}>
      <Cil r={0.22} h={0.06} pos={[0, 0.03, 0]} color={DONKERHOUT} seg={12} />
      <Cil r={0.04} h={0.85} pos={[0, 0.45, 0]} color={DONKERHOUT} seg={8} />
      <mesh position={[0, 1.1, 0]} rotation={[0.35, 0.6, 0.2]}>
        <sphereGeometry args={[0.3, 20, 14]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.1, 0]} rotation={[0, 0, 0.35]} material={mat('#c9a04a', { metal: 0.6, rough: 0.35 })}>
        <torusGeometry args={[0.34, 0.012, 6, 28]} />
      </mesh>
    </group>
  );
}

/** Ladekast voor zeekaarten (laag, breed). */
export function Kaartenkast({ pos, rot = 0, b = 2 }: Plaats & { b?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.95, 0.8]} pos={[0, 0.475, 0]} color={DONKERHOUT} r={0.02} />
      {[0.2, 0.42, 0.64].map((y) => (
        <Blok key={y} size={[b - 0.12, 0.17, 0.02]} pos={[0, y, 0.405]} color="#6b4630" r={0.005} shadow={false} />
      ))}
      <Blok size={[1.0, 0.01, 0.7]} pos={[-0.2, 0.96, 0]} rot={[0, 0.1, 0]} color="#e8dfc4" r={0.002} />
    </group>
  );
}

// ── buiten ──────────────────────────────────────────────────────────────

/** Bolder (gietijzer) op de kade. */
export function Bolder({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.2} rTop={0.16} h={0.5} pos={[0, 0.25, 0]} color="#2b3034" seg={10} />
      <Cil r={0.27} h={0.09} pos={[0, 0.54, 0]} color="#2b3034" seg={10} />
    </group>
  );
}

/** Opgerold touw. */
export function TouwRol({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#d6c393')}>
          <torusGeometry args={[0.3 - i * 0.04, 0.045, 5, 14]} />
        </mesh>
      ))}
    </group>
  );
}

/** Peilschaal (meetlat voor de waterstand) tegen de kademuur: centimeters boven NAP. Naar +z. */
export function Peilschaal({ pos, rot = 0, h = 2.4 }: Plaats & { h?: number }) {
  const tex = useTextuur(
    0.24,
    h,
    (ctx, w, hh) => {
      ctx.fillStyle = '#f4f1e8';
      ctx.fillRect(0, 0, w, hh);
      const n = Math.round(h * 10);
      for (let i = 0; i < n; i++) {
        const y = (i / n) * hh;
        ctx.fillStyle = i % 2 ? '#c0392b' : '#f4f1e8';
        ctx.fillRect(0, y, w * 0.45, hh / n);
        if (i % 10 === 0) {
          ctx.fillStyle = '#1f2a33';
          ctx.font = `700 ${w * 0.32}px ${FONT}`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(String(Math.round(h * 10 - i) / 10).replace('.', ','), w * 0.98, y + 2);
        }
      }
    },
    `peilschaal-${h}`,
    300,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, -h / 2, 0.01]}>
        <planeGeometry args={[0.24, h]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Ijkmaat: bronzen plaat met 1 el (= 1 meter) en de duimen (cm) erop, op ooghoogte aan een gevel. Naar +z. */
export function Ijkmaat({ pos, rot = 0 }: Plaats) {
  const tex = useTextuur(
    1.2,
    0.34,
    (ctx, w, h) => {
      ctx.fillStyle = '#9a7238';
      rondRect(ctx, 0, 0, w, h, h * 0.12);
      ctx.fill();
      const x0 = w * (0.1 / 1.2);
      const x1 = w * (1.1 / 1.2);
      ctx.strokeStyle = '#3a2a14';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 100; i++) {
        const x = x0 + ((x1 - x0) * i) / 100;
        const l = i % 10 === 0 ? 0.32 : i % 5 === 0 ? 0.22 : 0.12;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.62);
        ctx.lineTo(x, h * (0.62 - l));
        ctx.stroke();
      }
      ctx.fillStyle = '#2a1d0c';
      ctx.font = `700 ${h * 0.22}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1 EL = 1 METER = 100 DUIM (cm) · 1820', w / 2, h * 0.82);
    },
    'ijkmaat',
    300,
  );
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.2, 0.34]} />
        <meshStandardMaterial map={tex} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Lantaarnpaal (kade, klassiek) met kap die aangaat met de fase. Lichtvlek op de grond. */
export function Kadelantaarn({ pos, h = 3.6 }: { pos: V3; h?: number }) {
  return (
    <group position={pos}>
      <Cil r={0.16} rTop={0.12} h={0.4} pos={[0, 0.2, 0]} color="#23282c" seg={8} />
      <Cil r={0.055} h={h} pos={[0, h / 2, 0]} color="#23282c" seg={8} />
      <mesh position={[0, h + 0.18, 0]} material={lampMat}>
        <cylinderGeometry args={[0.18, 0.13, 0.4, 6]} />
      </mesh>
      <mesh position={[0, h + 0.48, 0]} material={mat('#23282c')}>
        <coneGeometry args={[0.28, 0.24, 6]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={vlekMat}>
        <circleGeometry args={[2.6, 20]} />
      </mesh>
    </group>
  );
}

/** Klassiek bankje (kade). */
export function Kadebank({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.7, 0.7].map((x) => (
        <Blok key={x} size={[0.08, 0.45, 0.5]} pos={[x, 0.22, 0]} color="#23282c" r={0.01} />
      ))}
      {[-0.15, 0, 0.15].map((z) => (
        <Blok key={z} size={[1.7, 0.04, 0.12]} pos={[0, 0.46, z]} color={HOUT} r={0.01} />
      ))}
      {[0.62, 0.78].map((y) => (
        <Blok key={y} size={[1.7, 0.1, 0.03]} pos={[0, y, -0.25]} color={HOUT} r={0.01} />
      ))}
    </group>
  );
}

/** Fietsenrek met twee fietsen (simpel). */
export function Fietsen({ pos, rot = 0 }: Plaats) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[2.2, 0.05, 0.05]} pos={[0, 0.3, 0]} color={RVS} r={0.01} />
      {[-0.6, 0.5].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          {[-0.45, 0.45].map((z) => (
            <mesh key={z} position={[0, 0.34, z]} material={mat('#1d1f21')}>
              <torusGeometry args={[0.32, 0.025, 5, 16]} />
            </mesh>
          ))}
          <Blok size={[0.04, 0.04, 0.9]} pos={[0, 0.55, 0]} color={i ? '#2f6f9a' : '#c0392b'} r={0.01} />
          <Blok size={[0.04, 0.4, 0.04]} pos={[0, 0.7, -0.25]} color={i ? '#2f6f9a' : '#c0392b'} r={0.01} />
          <Blok size={[0.45, 0.03, 0.03]} pos={[0, 0.9, 0.3]} color="#1d1f21" r={0.01} />
        </group>
      ))}
    </group>
  );
}

/** Bord op twee palen, bv. "Voetpad dicht – omleiding". Naar +z. */
export function Paalbord({ pos, rot = 0, regels, b = 1.4, h = 0.6, bg = '#f2c230', fg = '#1f1f1f' }: Plaats & { regels: string[]; b?: number; h?: number; bg?: string; fg?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.05, 1.6, 0.05]} pos={[(s * b) / 2.6, 0.8, 0]} color="#c9cdd0" r={0.01} />
      ))}
      <Tekst regels={regels} b={b} h={h} pos={[0, 1.45, 0.03]} o={{ bg, fg, rand: '#1f1f1f', dubbel: true }} />
    </group>
  );
}
