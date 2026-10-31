// 3D-objecten bij de start: terugblik (pallet), instructie (havenschool) en de weekmarkt (instap).
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat } from '../game/inspectie';
import { Blok, Cil, mat } from '../game/kit';
import { useGroei, useOpgelost } from '../game/opgelost';
import { P } from '../game/palette';
import { FONT, useTextuur } from '../game/tekst';
import { Tekst } from './bouw';

type V3 = [number, number, number];

/* ───────────── gedeeld ───────────── */

/** Marktkraam (decor): vier palen, gestreepte luifel, achterwand met kratten. Voorkant naar +z. */
export function Marktkraam({ kleur, naam }: { kleur: string; naam?: string }) {
  const streep = useTextuur(
    1,
    1,
    (ctx, w, h) => {
      const n = 8;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? '#fbf7ee' : kleur;
        ctx.fillRect((i * w) / n, 0, w / n + 1, h);
      }
    },
    `streep-${kleur}`,
    128,
  );
  const B = 3.0;
  const D = 1.5;
  const z0 = -0.85;
  return (
    <group>
      {[
        [-B / 2, z0 - D / 2],
        [B / 2, z0 - D / 2],
        [-B / 2, z0 + D / 2],
        [B / 2, z0 + D / 2],
      ].map(([x, z], i) => (
        <Blok key={i} size={[0.1, i < 2 ? 2.75 : 2.35, 0.1]} pos={[x, (i < 2 ? 2.75 : 2.35) / 2, z]} color="#e9e3d7" r={0.03} />
      ))}
      {/* luifel (aflopend naar voren) */}
      <mesh position={[0, 2.62, z0]} rotation={[-Math.atan2(0.4, D) - Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[B + 0.4, D + 0.5]} />
        <meshStandardMaterial map={streep} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* voorrand van de luifel */}
      <mesh position={[0, 2.25, z0 + D / 2 + 0.24]} castShadow>
        <boxGeometry args={[B + 0.4, 0.28, 0.03]} />
        <meshStandardMaterial map={streep} roughness={0.85} />
      </mesh>
      {/* achterwand en kratten */}
      <Blok size={[B, 0.9, 0.5]} pos={[0, 0.45, z0 - D / 2 + 0.3]} color={P.hout} r={0.04} />
      {[-1.05, -0.35, 0.35, 1.05].map((x, i) => (
        <group key={x} position={[x, 0.9, z0 - D / 2 + 0.3]}>
          <Blok size={[0.6, 0.32, 0.4]} pos={[0, 0.16, 0]} color={i % 2 ? '#c99a62' : '#b98a55'} r={0.03} />
          <Blok size={[0.5, 0.06, 0.32]} pos={[0, 0.3, 0]} color={['#e5675a', '#f2d04a', '#7cbf4a', '#f2a64a'][i]} r={0.03} />
        </group>
      ))}
      {naam && <Tekst regels={[naam]} b={1.8} h={0.32} pos={[0, 2.25, z0 + D / 2 + 0.26]} o={{ bg: '#fbf7ee', fg: '#1f2a24' }} />}
    </group>
  );
}

/** Kaartje op een standaardje (tekst, iets schuin). */
function Kaartje({ tekst, pos, b = 0.36, h = 0.14, kleur = '#fbf7ee', fg = '#1f2a24', rot = 0 }: { tekst: string; pos: V3; b?: number; h?: number; kleur?: string; fg?: string; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <group rotation={[-0.35, 0, 0]}>
        <Blok size={[b + 0.02, h + 0.02, 0.012]} pos={[0, h / 2, -0.008]} color="#c9a372" r={0.004} />
        <Tekst regels={[tekst]} b={b} h={h} pos={[0, h / 2, 0]} o={{ bg: kleur, fg, radius: 0.12 }} />
      </group>
    </group>
  );
}

/* ───────────── terugblik ───────────── */

/** Terugblik: pallet met 10 dozen (2 × 5). In elke doos staan 10 pakken sap (2 × 5). */
export function Pallet() {
  const doos = { b: 0.3, d: 0.26, h: 0.18 };
  const pak = { b: 0.05, d: 0.11, h: 0.24 };
  const plekken = useMemo(() => {
    const out: V3[] = [];
    for (let rij = 0; rij < 2; rij++) for (let k = 0; k < 5; k++) out.push([-0.64 + k * 0.32, 0.14, -0.14 + rij * 0.28]);
    return out;
  }, []);
  const pakPlekken = (c: V3) => {
    const out: V3[] = [];
    for (let rij = 0; rij < 2; rij++) for (let k = 0; k < 5; k++) out.push([c[0] - 0.112 + k * 0.056, c[1] + pak.h / 2 + 0.01, c[2] - 0.058 + rij * 0.116]);
    return out;
  };
  const voor = plekken[5]; // doos die eruit tilt (voorste rij, links)
  const overig = plekken.filter((_, i) => i !== 5);
  return (
    <group>
      <Deel id="pallet" uit={[0, 0, 0]} label="10 dozen op de pallet">
        <Europallet b={1.66} d={0.62} />
        {overig.map((p, i) => (
          <Blok key={i} size={[doos.b, doos.h, doos.d]} pos={[p[0], p[1] + doos.h / 2, p[2]]} color="#c99a62" r={0.012} />
        ))}
        <Pakken plekken={overig.flatMap(pakPlekken)} maat={pak} />
      </Deel>
      <Deel id="doos" uit={[0, 0.55, 0.45]} label="1 doos: 10 pakken">
        <Blok size={[doos.b, doos.h, doos.d]} pos={[voor[0], voor[1] + doos.h / 2, voor[2]]} color="#d3a76c" r={0.012} />
        <Pakken plekken={pakPlekken(voor)} maat={pak} />
      </Deel>
      <Maat van={[-0.8, 0.14, 0.42]} naar={[0.8, 0.14, 0.42]} label="5 dozen" />
      <Maat van={[0.92, 0.14, -0.28]} naar={[0.92, 0.14, 0.28]} label="2 rijen" />
    </group>
  );
}

function Europallet({ b, d }: { b: number; d: number }) {
  return (
    <group>
      {[-1, 0, 1].map((s) => (
        <Blok key={s} size={[b, 0.07, 0.12]} pos={[0, 0.035, (s * (d - 0.12)) / 2]} color="#b98a55" r={0.01} />
      ))}
      {[-1, 0, 1].map((s) => (
        <Blok key={`b${s}`} size={[0.12, 0.05, d]} pos={[(s * (b - 0.14)) / 2, 0.095, 0]} color="#a87a48" r={0.01} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Blok key={`p${i}`} size={[0.2, 0.025, d]} pos={[-b / 2 + 0.1 + (i * (b - 0.2)) / 6, 0.13, 0]} color="#cf9f68" r={0.006} />
      ))}
    </group>
  );
}

/** Veel pakjes sap in één mesh (instanced). */
function Pakken({ plekken, maat }: { plekken: V3[]; maat: { b: number; d: number; h: number } }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const k = new THREE.Color();
    plekken.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, k.set(i % 3 === 1 ? '#f2c24a' : '#f08a3a'));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [plekken]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, plekken.length]} castShadow receiveShadow>
      <boxGeometry args={[maat.b * 0.9, maat.h, maat.d * 0.9]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

/* ───────────── instructie ───────────── */

/** Instructiemodel: een tros van 4,5 m (opgerold) en een stuk van 50 cm (staat op een tafel). */
export function Tros() {
  return (
    <group>
      <group>
        <Deel id="tros" uit={[0, 0.45, 0]} label="Tros: 4,5 m">
          <Rol pos={[-0.5, 0, -0.05]} r={0.32} lagen={4} />
          <Tekst regels={['tros: 4,5 m']} b={0.56} h={0.18} pos={[-0.5, 0.3, 0.36]} rot={[-0.4, 0, 0]} o={{ bg: '#ffd27a', radius: 0.15 }} />
        </Deel>
        <Deel id="stuk" uit={[0, 0.35, 0.35]} label="Stuk: 50 cm">
          <Cil r={0.035} h={0.5} pos={[0.55, 0.04, 0.05]} rot={[0, 0, Math.PI / 2]} color="#d8b77a" seg={10} />
          <Tekst regels={['50 cm']} b={0.3} h={0.13} pos={[0.55, 0.14, 0.2]} rot={[-0.6, 0, 0]} o={{ bg: '#ffd27a', radius: 0.15 }} />
          <Maat van={[0.3, 0.1, 0.12]} naar={[0.8, 0.1, 0.12]} label="50 cm" />
        </Deel>
        {/* meetlat en schaar */}
        <Blok size={[1.0, 0.012, 0.06]} pos={[0.55, 0.006, -0.2]} color="#f2d04a" r={0.003} />
        {Array.from({ length: 11 }, (_, i) => (
          <Blok key={i} size={[0.006, 0.014, i % 5 ? 0.025 : 0.045]} pos={[0.05 + i * 0.1, 0.008, -0.2 - (i % 5 ? 0.012 : 0)]} color="#1f2a24" r={0.001} />
        ))}
        <group position={[0.15, 0.02, 0.22]} rotation={[0, 0.5, 0]}>
          <Blok size={[0.22, 0.015, 0.03]} pos={[0.1, 0, 0]} color={P.metaal} r={0.005} />
          <Blok size={[0.22, 0.015, 0.03]} pos={[0.1, 0.004, 0.01]} rot={[0, 0.25, 0]} color={P.metaal} r={0.005} />
          <mesh position={[-0.05, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]} material={mat('#d86a4a')}>
            <torusGeometry args={[0.04, 0.012, 6, 14]} />
          </mesh>
          <mesh position={[-0.04, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={mat('#d86a4a')}>
            <torusGeometry args={[0.04, 0.012, 6, 14]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Opgerolde tros (stapel ringen). */
function Rol({ pos, r, lagen }: { pos: V3; r: number; lagen: number }) {
  return (
    <group position={pos}>
      {Array.from({ length: lagen }, (_, i) => (
        <mesh key={i} position={[0, 0.04 + i * 0.065, 0]} rotation={[Math.PI / 2, 0, i * 0.4]} castShadow material={mat(i % 2 ? '#cfae72' : '#d8b77a')}>
          <torusGeometry args={[r - i * 0.02, 0.034, 8, 28]} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────── weekmarkt (instap) ───────────── */

/** INS-01/03/06/10: meetkist met gereedschap voor lengte, gewicht, temperatuur en inhoud. */
export function Meetkist() {
  return (
    <group>
      <group>
        {/* open kist */}
        <group position={[0, 0, -0.18]}>
          <Blok size={[0.9, 0.04, 0.36]} pos={[0, 0.02, 0]} color="#8a5a32" r={0.01} />
          <Blok size={[0.9, 0.18, 0.03]} pos={[0, 0.09, 0.165]} color="#a8723f" r={0.01} />
          <Blok size={[0.9, 0.18, 0.03]} pos={[0, 0.09, -0.165]} color="#a8723f" r={0.01} />
          <Blok size={[0.03, 0.18, 0.36]} pos={[-0.435, 0.09, 0]} color="#a8723f" r={0.01} />
          <Blok size={[0.03, 0.18, 0.36]} pos={[0.435, 0.09, 0]} color="#a8723f" r={0.01} />
          <Blok size={[0.9, 0.34, 0.03]} pos={[0, 0.34, -0.2]} rot={[-0.25, 0, 0]} color="#b98a55" r={0.01} />
          <Tekst regels={['MEETKIST']} b={0.5} h={0.12} pos={[0, 0.36, -0.18]} rot={[-0.25, 0, 0]} o={{ bg: '#1f3c5a', fg: '#ffffff' }} />
          {/* gloeilamp (afleider) in de kist */}
          <mesh position={[0.3, 0.12, 0]} material={mat('#fff6d0', { emissive: '#ffe08a' })}>
            <sphereGeometry args={[0.055, 12, 10]} />
          </mesh>
          <Cil r={0.025} h={0.05} pos={[0.3, 0.06, 0]} color={P.metaal} seg={8} />
        </group>
        {/* lengte: rolmaat met uitgetrokken lint */}
        <group position={[-0.62, 0, 0.18]}>
          <Blok size={[0.12, 0.12, 0.05]} pos={[0, 0.06, 0]} color="#f2d04a" r={0.03} />
          <Blok size={[0.3, 0.004, 0.025]} pos={[0.2, 0.004, 0]} color="#f7e27a" r={0.001} />
        </group>
        {/* gewicht: ijzeren gewicht */}
        <group position={[-0.25, 0, 0.2]}>
          <Cil r={0.07} rTop={0.05} h={0.1} pos={[0, 0.05, 0]} color="#4a4f52" seg={14} />
          <mesh position={[0, 0.13, 0]} rotation={[0, 0, 0]} material={mat('#4a4f52')}>
            <torusGeometry args={[0.03, 0.01, 6, 12]} />
          </mesh>
        </group>
        {/* temperatuur: thermometer op een voetje */}
        <group position={[0.15, 0, 0.2]}>
          <Blok size={[0.1, 0.02, 0.06]} pos={[0, 0.01, 0]} color="#e9e3d7" r={0.005} />
          <Blok size={[0.05, 0.32, 0.015]} pos={[0, 0.17, 0]} color="#fbfaf6" r={0.008} />
          <Blok size={[0.012, 0.18, 0.02]} pos={[0, 0.18, 0.004]} color="#e5675a" r={0.004} />
          <mesh position={[0, 0.05, 0.006]} material={mat('#e5675a')}>
            <sphereGeometry args={[0.02, 10, 8]} />
          </mesh>
        </group>
        {/* inhoud: maatbeker met water */}
        <group position={[0.52, 0, 0.18]}>
          <Cil r={0.07} h={0.2} pos={[0, 0.1, 0]} color="#dff1f5" seg={18} />
          <Cil r={0.065} h={0.12} pos={[0, 0.07, 0]} color="#7fc6d8" seg={18} />
        </group>
        {/* kaartjes met de grootheid (zonder eenheid) */}
        <Kaartje tekst="lengte" pos={[-0.6, 0, 0.34]} b={0.26} h={0.08} />
        <Kaartje tekst="gewicht" pos={[-0.25, 0, 0.34]} b={0.26} h={0.08} />
        <Kaartje tekst="temperatuur" pos={[0.15, 0, 0.34]} b={0.3} h={0.08} />
        <Kaartje tekst="inhoud" pos={[0.52, 0, 0.34]} b={0.26} h={0.08} />
      </group>
    </group>
  );
}

/** Duimstok-textuur: geel met cm-streepjes (zonder getallen: die verklappen het antwoord). */
function useDuimstok() {
  return useTextuur(
    1,
    0.12,
    (ctx, w, h) => {
      ctx.fillStyle = '#f2d04a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1f2a24';
      for (let i = 0; i <= 100; i++) {
        const x = (i / 100) * (w - 4) + 2;
        const l = i % 10 === 0 ? h * 0.5 : i % 5 === 0 ? h * 0.35 : h * 0.22;
        ctx.fillRect(x - 1, 0, 2, l);
      }
    },
    'duimstok-cm3',
    900,
  );
}

/** INS-02/09: duimstok van 1 meter op een plank van 250 cm (op een tafel). */
export function Duimstok() {
  const tex = useDuimstok();
  const kaartje = useGroei(useOpgelost('O1-INS-02'), 0.3, 'alle');
  return (
    <group>
      {/* plank van 250 cm */}
      <Blok size={[2.5, 0.06, 0.44]} pos={[0, 0.03, 0]} color="#dcb07a" r={0.01} />
      <Tekst regels={['plank: 250 cm']} b={0.7} h={0.16} pos={[0.8, 0.062, 0.08]} rot={[-Math.PI / 2, 0, 0]} o={{ bg: '#fbf7ee', rand: '#b98a55', radius: 0.15 }} />
      <Maat van={[-1.25, 0.09, 0.36]} naar={[1.25, 0.09, 0.36]} label="250 cm" />
      {/* duimstok van 1 m */}
      <group position={[-0.62, 0.068, -0.08]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1, 0.12]} />
          <meshStandardMaterial map={tex} roughness={0.6} />
        </mesh>
        <Blok size={[1, 0.014, 0.12]} pos={[0, -0.008, 0]} color="#e6c13f" r={0.002} />
        <Tekst regels={['1 meter']} b={0.36} h={0.12} pos={[0.15, 0.002, 0.14]} rot={[-Math.PI / 2, 0, 0]} o={{ bg: '#f2d04a', radius: 0.2 }} />
      </group>
      <Maat van={[-1.12, 0.11, -0.26]} naar={[-0.12, 0.11, -0.26]} label="1 m" />
      {/* na het goede antwoord: een kaartje "1 m = 100 cm" bij de duimstok */}
      <group ref={kaartje} position={[-0.62, 0.2, -0.32]}>
        <Tekst regels={['1 m = 100 cm']} b={0.5} h={0.14} o={{ bg: '#5fe0a1', fg: '#10301f' }} />
      </group>
    </group>
  );
}

/** Etiket rond een fles of beker (cilinder zonder deksels). */
function Etiket({ r, h, y, tekst, bg, fg = '#ffffff', sub }: { r: number; h: number; y: number; tekst: string; bg: string; fg?: string; sub?: string }) {
  const omtrek = 2 * Math.PI * r;
  const tex = useTextuur(
    omtrek,
    h,
    (ctx, w, hh) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const vak = w / 2;
      for (const cx of [vak / 2, vak * 1.5]) {
        let fs = hh * (sub ? 0.38 : 0.5);
        ctx.font = `700 ${fs}px ${FONT}`;
        const m = ctx.measureText(tekst).width;
        if (m > vak * 0.9) fs *= (vak * 0.9) / m;
        ctx.font = `700 ${fs}px ${FONT}`;
        ctx.fillText(tekst, cx, hh * (sub ? 0.38 : 0.52));
        if (sub) {
          ctx.font = `600 ${hh * 0.26}px ${FONT}`;
          ctx.fillText(sub, cx, hh * 0.76);
        }
      }
    },
    `etiket-${tekst}-${sub}-${bg}-${r}-${h}`,
    500,
  );
  return (
    <mesh position={[0, y, 0]} rotation={[0, -Math.PI / 4, 0]}>
      <cylinderGeometry args={[r + 0.002, r + 0.002, h, 28, 1, true]} />
      <meshStandardMaterial map={tex} roughness={0.5} />
    </mesh>
  );
}

/** INS-04/07: maatbeker van 1 liter en een fles frisdrank van 1,5 liter. */
export function Drankkraam() {
  const schaal = useTextuur(
    0.16,
    0.24,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1f3c5a';
      for (let i = 1; i <= 4; i++) {
        const y = h - (i / 4) * h * 0.9;
        ctx.fillRect(w * 0.1, y - 2, i === 4 ? w * 0.5 : w * 0.3, 4);
      }
      ctx.font = `700 ${h * 0.13}px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillText('1 liter', w * 0.12, h * 0.04 + h * 0.08);
    },
    'maatbeker-schaal',
    800,
  );
  return (
    <group>
      <group>
        {/* maatbeker (doorzichtig) */}
        <group position={[-0.3, 0, 0.05]}>
          <Cil r={0.1} h={0.26} pos={[0, 0.13, 0]} color="#e6f4f7" seg={22} />
          <Cil r={0.094} h={0.22} pos={[0, 0.115, 0]} color="#e98a6a" seg={22} />
          <mesh position={[0.06, 0.15, 0.08]} rotation={[0, 0.65, 0]}>
            <planeGeometry args={[0.1, 0.22]} />
            <meshStandardMaterial map={schaal} transparent roughness={0.5} />
          </mesh>
          <Blok size={[0.03, 0.12, 0.03]} pos={[-0.12, 0.15, 0]} color="#e6f4f7" r={0.012} />
        </group>
        <Kaartje tekst="maatbeker" pos={[-0.3, 0, 0.26]} b={0.28} h={0.08} />
        {/* fles frisdrank van 1,5 liter */}
        <group position={[0.25, 0, -0.02]}>
          <Cil r={0.06} h={0.3} pos={[0, 0.15, 0]} color="#c8e8c0" seg={20} />
          <Cil r={0.06} rTop={0.02} h={0.08} pos={[0, 0.34, 0]} color="#c8e8c0" seg={20} />
          <Cil r={0.022} h={0.03} pos={[0, 0.39, 0]} color="#d86a4a" seg={10} />
          <Etiket r={0.06} h={0.1} y={0.17} tekst="1,5 liter" bg="#d86a4a" sub="frisdrank" />
        </group>
        {/* bekertjes */}
        {[0.5, 0.58, 0.54].map((x, i) => (
          <Cil key={i} r={0.03} rTop={0.035} h={0.08} pos={[x, 0.04 + (i === 2 ? 0.08 : 0), i === 2 ? 0.12 : 0.12 + (i ? 0.02 : -0.05)]} color="#fbfaf6" seg={12} />
        ))}
      </group>
    </group>
  );
}

/** INS-05: wandelpaddenstoel tussen een huis en een school. De afstand heeft nog geen eenheid. */
export function Paddenstoel() {
  return (
    <group>
      {/* grasstrook met pad */}
      <Blok size={[2.4, 0.04, 1.3]} pos={[0, 0.02, 0]} color="#93b45f" r={0.02} />
      <Blok size={[2.3, 0.02, 0.24]} pos={[0, 0.045, 0.25]} color="#e2d3b0" r={0.01} />
      {/* huis links */}
      <group position={[-0.9, 0.04, -0.15]}>
        <Blok size={[0.42, 0.3, 0.36]} pos={[0, 0.15, 0]} color="#f2e7d8" r={0.02} />
        <mesh position={[0, 0.36, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#b4443a', { flat: true })} castShadow>
          <coneGeometry args={[0.33, 0.2, 4]} />
        </mesh>
        <Blok size={[0.08, 0.14, 0.01]} pos={[0.06, 0.07, 0.185]} color={P.hout} r={0.005} />
        <Tekst regels={['Huis']} b={0.26} h={0.09} pos={[0, 0.52, 0.08]} o={{ bg: '#fbf7ee' }} />
      </group>
      {/* school rechts */}
      <group position={[0.85, 0.04, -0.2]}>
        <Blok size={[0.62, 0.42, 0.36]} pos={[0, 0.21, 0]} color="#e9d8bd" r={0.02} />
        <Blok size={[0.66, 0.04, 0.4]} pos={[0, 0.44, 0]} color={P.dak} r={0.01} />
        {[-0.2, 0, 0.2].map((x) => (
          <Blok key={x} size={[0.12, 0.1, 0.01]} pos={[x, 0.28, 0.185]} color={P.glas} r={0.005} />
        ))}
        <Tekst regels={['School']} b={0.34} h={0.1} pos={[0, 0.56, 0.08]} o={{ bg: '#fbf7ee' }} />
      </group>
      {/* paddenstoel */}
      <group position={[0, 0.04, 0.42]}>
        <Cil r={0.07} rTop={0.06} h={0.42} pos={[0, 0.21, 0]} color="#f3efe6" seg={14} />
        <mesh position={[0, 0.44, 0]} scale={[1, 0.55, 1]} castShadow material={mat('#e5332a')}>
          <sphereGeometry args={[0.22, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <Cil r={0.22} h={0.06} pos={[0, 0.41, 0]} color="#f3efe6" seg={20} />
        <Tekst regels={['← Huis   School →', 'afstand: ? ...']} b={0.66} h={0.24} pos={[0, 0.2, 0.08]} o={{ bg: '#fbfaf6', fg: '#e5332a', kop: true, radius: 0.1 }} />
      </group>
    </group>
  );
}

/** INS-08: pak suiker van 500 gram op een weegschaaltje. */
export function Suikerpak() {
  return (
    <group>
      <group>
        {/* weegschaal */}
        <Blok size={[0.34, 0.06, 0.28]} pos={[0, 0.03, 0]} color="#e9e3d7" r={0.02} />
        <Blok size={[0.3, 0.012, 0.24]} pos={[0, 0.066, 0]} color={P.metaal} r={0.004} />
        <Blok size={[0.14, 0.04, 0.012]} pos={[0, 0.03, 0.142]} color="#17211d" r={0.004} />
        <Tekst regels={['500 g']} b={0.12} h={0.034} pos={[0, 0.03, 0.149]} o={{ bg: '#17211d', fg: '#9cf0b4', basic: true }} />
        {/* pak suiker */}
        <group position={[0, 0.072, 0]}>
          <Blok size={[0.16, 0.24, 0.1]} pos={[0, 0.12, 0]} color="#fbfaf6" r={0.01} />
          <Blok size={[0.16, 0.03, 0.1]} pos={[0, 0.255, 0]} color="#4f86b8" r={0.008} />
          <Tekst regels={['SUIKER', '500 gram']} b={0.14} h={0.12} pos={[0, 0.13, 0.051]} o={{ bg: '#fbfaf6', fg: '#1f3c5a', kop: true }} />
        </group>
        {/* lepel en schaaltje met klontjes */}
        <Cil r={0.08} rTop={0.1} h={0.04} pos={[0.38, 0.02, 0.08]} color="#d7ccb8" seg={16} />
        <Blok size={[0.25, 0.012, 0.03]} pos={[-0.36, 0.006, 0.12]} rot={[0, 0.4, 0]} color={P.metaal} r={0.005} />
      </group>
    </group>
  );
}
