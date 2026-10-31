// Wereld 4 – voorwerpen voor de Eindcheck (eindtest): kassahal en uitgang.
// Elk voorwerp past in een kamer (max. ±3 × 3 m vloer). Oorsprong midden op de vloer, voorkant naar +z.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel } from '../game/inspectie';
import { Blok, Cil, mat } from '../game/kit';
import { rondRect } from '../game/tekst';
import { Draai } from './modellen-start';
import { Bord, Doek, PaalBord, Prijskaartje, Sokkel, Tafel, tekstRegel } from './winkels';

type V3 = [number, number, number];

/** Standaard met een groot bord (tekstregels). */
function Standbord({ regels, b = 1.2, h = 0.9, hoogte = 1.45, pos, rot, bg = '#fbfaf6', fg, kader = '#3b4442', kleuren, doorstreep }: { regels: string[]; b?: number; h?: number; hoogte?: number; pos?: V3; rot?: V3; bg?: string; fg?: string; kader?: string; kleuren?: (string | undefined)[]; doorstreep?: number[] }) {
  return (
    <group position={pos} rotation={rot}>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.06, hoogte + h / 2, 0.06]} pos={[(s * (b + 0.06)) / 2, (hoogte + h / 2) / 2, -0.03]} color={kader} r={0.02} />
      ))}
      <Blok size={[b + 0.1, h + 0.1, 0.04]} pos={[0, hoogte, -0.02]} color={kader} r={0.03} />
      <Bord regels={regels} b={b} h={h} pos={[0, hoogte, 0.002]} bg={bg} fg={fg} kleuren={kleuren} doorstreep={doorstreep} rond={0.05} groot={0.66} />
    </group>
  );
}

// ─────────────────────────── Kassahal (blok 1) ───────────────────────────

function Sandaal({ pos, rot }: { pos: V3; rot?: V3 }) {
  return (
    <group position={pos} rotation={rot}>
      <Blok size={[0.12, 0.03, 0.3]} pos={[0, 0.015, 0]} color="#8a5a36" r={0.012} />
      <Blok size={[0.13, 0.015, 0.04]} pos={[0, 0.05, 0.07]} color="#c98a4a" r={0.006} />
      <Blok size={[0.13, 0.015, 0.04]} pos={[0, 0.05, -0.02]} color="#c98a4a" r={0.006} />
      <Blok size={[0.03, 0.05, 0.1]} pos={[0, 0.04, -0.11]} color="#c98a4a" r={0.008} />
    </group>
  );
}

/** EIN-01: sandalen op een sokkel: € 63,50 en 40% korting. */
export function Sandalen() {
  return (
    <group>
      <Sokkel b={0.75} h={0.85} d={0.6} />
      <group position={[0, 0.88, 0]} scale={1.5}>
        <Sandaal pos={[-0.08, 0, 0]} rot={[0, 0.15, 0]} />
        <Sandaal pos={[0.08, 0, 0.02]} rot={[0, -0.1, 0]} />
      </group>
      <Prijskaartje tekst="€ 63,50" pos={[-0.15, 0.6, 0.31]} b={0.34} h={0.17} />
      <PaalBord regels={['40% korting']} b={0.66} h={0.26} hoogte={1.2} pos={[0.55, 0, -0.15]} rot={[0, -0.3, 0]} bg="#d83a2e" fg="#ffffff" />
    </group>
  );
}

function Slipper({ pos, kleur }: { pos: V3; kleur: string }) {
  return (
    <group position={pos}>
      <Blok size={[0.11, 0.025, 0.28]} pos={[0, 0.0125, 0]} color={kleur} r={0.012} />
      <Blok size={[0.12, 0.025, 0.06]} pos={[0, 0.04, 0.03]} color="#fbfaf6" r={0.01} />
    </group>
  );
}

/** EIN-02: badslippers in een schap: vorige week 60 euro, nu 48 euro. */
export function Badslippers() {
  const kleuren = ['#2a9fd6', '#f2a64a', '#e86f8a'];
  return (
    <group>
      <Blok size={[1.2, 0.7, 0.5]} pos={[0, 0.35, 0]} color="#d6eef3" r={0.04} />
      <Blok size={[1.24, 0.04, 0.54]} pos={[0, 0.72, 0]} color="#2a9fd6" r={0.02} />
      {kleuren.map((k, i) => (
        <group key={k} position={[-0.36 + i * 0.36, 0.74, 0]} rotation={[0, (i - 1) * 0.2, 0]}>
          <Slipper pos={[-0.07, 0, 0]} kleur={k} />
          <Slipper pos={[0.07, 0, 0.02]} kleur={k} />
        </group>
      ))}
      <Standbord regels={['Badslippers', 'Vorige week: 60 euro', 'Nu: 48 euro']} b={0.95} h={0.62} hoogte={1.4} pos={[0, 0, -0.35]} kleuren={['#2a9fd6', undefined, '#d83a2e']} doorstreep={[1]} />
    </group>
  );
}

/** EIN-03: kerstboom in een pot; bord met de prijs van twee jaar geleden en van nu. */
export function Kerstboom() {
  const ballen = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const laag = i % 3;
        const a = i * 2.4;
        const r = 0.5 - laag * 0.14;
        return { p: [Math.cos(a) * r, 0.75 + laag * 0.42, Math.sin(a) * r] as V3, k: ['#d83a2e', '#ffd21f', '#5aa9ff'][i % 3] };
      }),
    [],
  );
  return (
    <group>
      <group position={[-0.25, 0, 0]}>
        <Cil r={0.24} rTop={0.3} h={0.38} pos={[0, 0.19, 0]} color="#b33a3a" seg={16} />
        <Cil r={0.06} h={0.3} pos={[0, 0.48, 0]} color="#7a5132" seg={8} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.85 + i * 0.42, 0]} castShadow material={mat(i % 2 ? '#2f7a3a' : '#3a8a44', { flat: true })}>
            <coneGeometry args={[0.62 - i * 0.16, 0.7, 9]} />
          </mesh>
        ))}
        {ballen.map((b, i) => (
          <mesh key={i} position={b.p} castShadow material={mat(b.k, { rough: 0.3 })}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
        ))}
        <group position={[0, 1.95, 0]}>
          <Draai snel={0.8}>
            <mesh material={mat('#ffd21f', { emissive: '#ffb02e' })} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.03, 5]} />
            </mesh>
          </Draai>
        </group>
        <Prijskaartje tekst="€ 75" pos={[0.32, 0.95, 0.3]} rot={[0, -0.4, 0.15]} b={0.26} h={0.15} />
      </group>
      <PaalBord regels={['Kerstboom', '2 jaar geleden: € 25', 'Nu: € 75']} b={1.0} h={0.62} hoogte={1.3} pos={[0.65, 0, 0.15]} rot={[0, -0.35, 0]} bg="#fbfaf6" kleuren={['#b33a3a']} />
    </group>
  );
}

/** Taartpunt van een cirkeldiagram (dicht, dus ook mooi als hij losschuift). */
function Punt({ van, tot, r, h, kleur }: { van: number; tot: number; r: number; h: number; kleur: string }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, r, van, tot, false);
    s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [van, tot, r, h]);
  return <mesh geometry={geo} castShadow receiveShadow material={mat(kleur)} />;
}

// Zelfde volgorde als het werkboek: badkamer rechts, keuken onder, wasmachine links, toilet linksboven.
// `vlag` = waar het vlaggetje hangt t.o.v. de voet van het stokje [x, hoogte, z].
const WATER: { naam: string; pct: number; kleur: string; vlag: [number, number, number] }[] = [
  { naam: 'Toilet', pct: 30, kleur: '#4f78c9', vlag: [-0.12, 0.72, -0.05] },
  { naam: 'Wasmachine', pct: 12, kleur: '#e8a6b0', vlag: [-0.34, 0.3, 0.05] },
  { naam: 'Keuken', pct: 13, kleur: '#b9b9b3', vlag: [0.05, 0.3, 0.3] },
  { naam: 'Badkamer', pct: 45, kleur: '#d9b27a', vlag: [0.22, 0.5, 0] },
];

/** EIN-04/05: 3D-cirkeldiagram "Gemiddeld waterverbruik per dag" met vlaggetjes; uit de badkamer steekt een badeend. */
export function Waterverbruik() {
  const R = 0.55;
  let hoek = Math.PI * 0.5;
  const stukken = WATER.map((w) => {
    const van = hoek;
    hoek += (w.pct / 100) * Math.PI * 2;
    return { ...w, van, tot: hoek, mid: (van + hoek) / 2 };
  });
  return (
    <group>
      <Cil r={0.68} h={0.05} pos={[0, 0.75, 0]} color="#f4efe6" seg={32} />
      <Cil r={0.05} h={0.72} pos={[0, 0.37, 0]} color="#3b4442" seg={10} />
      <Cil r={0.3} h={0.04} pos={[0, 0.02, 0]} color="#3b4442" seg={16} />
      <group position={[0, 0.775, 0]}>
        {stukken.map((s) => {
          const ux = Math.cos(s.mid);
          const uz = -Math.sin(s.mid);
          const [vx, vy, vz] = s.vlag;
          return (
            <Deel key={s.naam} id={`water-${s.naam.toLowerCase()}`} uit={[ux * 0.3, 0.05, uz * 0.3]} label={`${s.naam} ${s.pct}%`}>
              <Punt van={s.van} tot={s.tot} r={R} h={0.14} kleur={s.kleur} />
              <group position={[ux * R * 0.62, 0.14, uz * R * 0.62]}>
                <Cil r={0.008} h={vy} pos={[0, vy / 2, 0]} color="#3b4442" seg={6} />
                <Blok size={[Math.abs(vx) + 0.01, 0.012, 0.012]} pos={[vx / 2, vy, 0]} color="#3b4442" r={0.004} />
                <Bord regels={[s.naam, `${s.pct}%`]} b={0.42} h={0.24} pos={[vx + Math.sign(vx || 1) * 0.0, vy - 0.12, vz]} bg="#fbfaf6" fg="#1f2a24" rand={s.kleur} dubbel />
              </group>
            </Deel>
          );
        })}
        {/* badeend op de badkamer */}
        <group position={[Math.cos(stukken[3].mid) * 0.3, 0.14, -Math.sin(stukken[3].mid) * 0.3 + 0.12]}>
          <mesh position={[0, 0.05, 0]} scale={[1.2, 0.9, 1]} castShadow material={mat('#ffd21f')}>
            <sphereGeometry args={[0.05, 12, 10]} />
          </mesh>
          <mesh position={[0.04, 0.11, 0]} castShadow material={mat('#ffd21f')}>
            <sphereGeometry args={[0.032, 10, 8]} />
          </mesh>
          <mesh position={[0.075, 0.105, 0]} rotation={[0, 0, -Math.PI / 2]} material={mat('#f2a64a')}>
            <coneGeometry args={[0.012, 0.03, 6]} />
          </mesh>
        </group>
      </group>
      <Standbord regels={['Gemiddeld waterverbruik per dag', '1 persoon: 120 liter per dag']} b={1.3} h={0.42} hoogte={1.75} pos={[0, 0, -0.65]} kleuren={['#1d3a6b', '#1f2a24']} />
    </group>
  );
}

/** EIN-06: OV-poortje met een bord van Mick: hoe 220 reizigers reizen. */
export function Reizigers() {
  return (
    <group>
      {/* poortje */}
      <group position={[0.55, 0, 0.3]}>
        {[-0.35, 0.35].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Blok size={[0.18, 1.0, 0.7]} pos={[0, 0.5, 0]} color="#e9e3d7" r={0.04} />
            <Blok size={[0.2, 0.04, 0.72]} pos={[0, 1.02, 0]} color="#f2c230" r={0.02} />
            <Blok size={[0.14, 0.1, 0.12]} pos={[0, 1.08, 0.2]} color="#2f3634" r={0.02} />
          </group>
        ))}
        <Blok size={[0.5, 0.5, 0.03]} pos={[0, 0.6, 0]} color="#e5675a" r={0.02} opacity={0.8} />
      </group>
      {/* kaartje */}
      <Blok size={[0.16, 0.005, 0.1]} pos={[0.2, 1.1, 0.5]} color="#f2c230" r={0.002} />
      <Standbord
        regels={['Mick vroeg 220 treinreizigers:', '1 op de 20: OV-studentkaart', '35%: kortingskaart', '15%: abonnement', 'De rest: gewoon kaartje']}
        b={1.25}
        h={0.95}
        hoogte={1.4}
        pos={[-0.45, 0, -0.25]}
        kader="#1d3a6b"
        kleuren={['#1d3a6b']}
      />
    </group>
  );
}

// ─────────────────────────── Uitgang (blok 2) ───────────────────────────

/** EIN-07: whiteboard met de uitslag van een toets; op tafel een stapel toetsen. */
export function Toets() {
  return (
    <group>
      <Standbord regels={['Toets van de klas', '1 op de 5: onvoldoende', '3/5: voldoende', 'De rest: niet gemaakt']} b={1.4} h={0.9} hoogte={1.45} pos={[0, 0, -0.3]} kleuren={['#1d3a6b', '#d83a2e', '#2f7a3a', '#5d6166']} />
      <Tafel b={0.9} d={0.55} h={0.75} pos={[0.35, 0, 0.35]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Blok key={i} size={[0.22, 0.006, 0.3]} pos={[0.25 + (i % 2) * 0.01, 0.755 + i * 0.007, 0.35]} rot={[0, i * 0.06, 0]} color="#fbfaf6" r={0.002} />
      ))}
      <Blok size={[0.012, 0.012, 0.16]} pos={[0.55, 0.76, 0.35]} rot={[0, 0.4, 0]} color="#d83a2e" r={0.004} />
    </group>
  );
}

/** EIN-08: tablet op een standaard met een sociaal netwerk: 400 miljoen leden, 8,8 miljoen uit Spanje. */
export function Netwerk() {
  return (
    <group>
      <Sokkel b={0.6} h={0.5} d={0.5} />
      <Blok size={[0.12, 0.6, 0.12]} pos={[0, 0.8, -0.05]} color="#3b4442" r={0.03} />
      <group position={[0, 1.5, 0]} rotation={[-0.12, 0, 0]}>
        <Blok size={[1.36, 0.98, 0.06]} color="#1b1e21" r={0.06} />
        <Doek
          b={1.26}
          h={0.88}
          pos={[0, 0, 0.032]}
          sleutel="netwerk2"
          licht
          ppm={800}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#eef3fb';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#4f6fd6';
            ctx.fillRect(0, 0, w, h * 0.2);
            // eigen, neutraal logo: twee spraakwolkjes
            ctx.fillStyle = '#ffffff';
            rondRect(ctx, w * 0.04, h * 0.04, h * 0.14, h * 0.1, 10);
            ctx.fill();
            rondRect(ctx, w * 0.07, h * 0.08, h * 0.14, h * 0.09, 10);
            ctx.fill();
            tekstRegel(ctx, 'Sociaal netwerk', w * 0.2, h * 0.1, h * 0.08, '#ffffff', 700);
            ctx.fillStyle = '#ffffff';
            rondRect(ctx, w * 0.05, h * 0.27, w * 0.9, h * 0.3, 18);
            ctx.fill();
            tekstRegel(ctx, 'Leden in totaal', w * 0.1, h * 0.34, h * 0.075, '#5d6166', 600);
            tekstRegel(ctx, '400 miljoen', w * 0.1, h * 0.47, h * 0.12, '#1d3a6b', 700);
            ctx.fillStyle = '#ffffff';
            rondRect(ctx, w * 0.05, h * 0.62, w * 0.9, h * 0.3, 18);
            ctx.fill();
            tekstRegel(ctx, 'Leden uit Spanje', w * 0.1, h * 0.69, h * 0.075, '#5d6166', 600);
            tekstRegel(ctx, '8,8 miljoen', w * 0.1, h * 0.82, h * 0.12, '#c60b1e', 700);
          }}
        />
      </group>
    </group>
  );
}

/** EIN-09: grote kassabon van Karlijns dagje pretpark, met een knuffel en een kaartje. */
export function Pretpark() {
  const beer = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (beer.current) beer.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
  });
  return (
    <group>
      <group position={[-0.3, 0, -0.1]}>
        <Blok size={[0.06, 1.3, 0.06]} pos={[0, 0.65, -0.04]} color="#3b4442" r={0.02} />
        <Blok size={[0.5, 0.05, 0.35]} pos={[0, 0.025, -0.04]} color="#3b4442" r={0.02} />
        <Doek
          b={0.95}
          h={1.4}
          pos={[0, 1.45, 0]}
          sleutel="kassabon-karlijn2"
          ppm={700}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fdfdf8';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let x = 0; x <= w; x += w / 12) ctx.lineTo(x, (x / (w / 12)) % 2 ? 14 : 0);
            ctx.lineTo(w, h);
            for (let x = w; x >= 0; x -= w / 12) ctx.lineTo(x, h - ((x / (w / 12)) % 2 ? 14 : 0));
            ctx.closePath();
            ctx.fill();
            tekstRegel(ctx, 'PRETPARK', w / 2, h * 0.09, h * 0.075, '#1f2a24', 700, 'center');
            tekstRegel(ctx, 'Karlijn – dagje uit', w / 2, h * 0.17, h * 0.055, '#5d6166', 600, 'center');
            ctx.setLineDash([12, 10]);
            ctx.strokeStyle = '#9aa3a8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(w * 0.06, h * 0.24);
            ctx.lineTo(w * 0.94, h * 0.24);
            ctx.stroke();
            const rij = (t: string, p: string, y: number) => {
              tekstRegel(ctx, t, w * 0.08, y, h * 0.068, '#1f2a24', 600);
              tekstRegel(ctx, p, w * 0.92, y, h * 0.068, '#1f2a24', 700, 'right');
            };
            rij('Kaartje', '€ 21,00', h * 0.36);
            rij('Lunch', '€ 8,50', h * 0.5);
            rij('Knuffel', '€ 5,50', h * 0.64);
            ctx.beginPath();
            ctx.moveTo(w * 0.06, h * 0.75);
            ctx.lineTo(w * 0.94, h * 0.75);
            ctx.stroke();
            ctx.setLineDash([]);
            tekstRegel(ctx, 'Bedankt en tot ziens!', w / 2, h * 0.86, h * 0.045, '#5d6166', 600, 'center');
          }}
        />
      </group>
      {/* knuffelbeer op een krukje */}
      <group position={[0.45, 0, 0.15]}>
        <Cil r={0.2} h={0.5} pos={[0, 0.25, 0]} color="#e86f8a" seg={16} />
        <group ref={beer} position={[0, 0.5, 0]}>
          <mesh position={[0, 0.16, 0]} scale={[1, 1.1, 0.85]} castShadow material={mat('#b5835a')}>
            <sphereGeometry args={[0.14, 14, 12]} />
          </mesh>
          <mesh position={[0, 0.38, 0]} castShadow material={mat('#b5835a')}>
            <sphereGeometry args={[0.1, 14, 12]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.075, 0.46, 0]} material={mat('#9a6b45')}>
              <sphereGeometry args={[0.04, 10, 8]} />
            </mesh>
          ))}
          <mesh position={[0, 0.36, 0.085]} material={mat('#e8d2b8')}>
            <sphereGeometry args={[0.04, 10, 8]} />
          </mesh>
        </group>
        <Blok size={[0.2, 0.004, 0.1]} pos={[-0.05, 0.502, 0.12]} rot={[0, 0.3, 0]} color="#ffd21f" r={0.002} />
      </group>
    </group>
  );
}

/** EIN-10: bureau van het uitzendbureau met de loonstrook van José. */
export function Loon() {
  return (
    <group>
      <group position={[-0.1, 0, -0.05]} rotation={[-0.55, 0, 0]}>
        <Blok size={[0.8, 0.62, 0.03]} pos={[0, 0.31, 0]} color="#5a6f8f" r={0.02} />
        <Doek
          b={0.74}
          h={0.56}
          pos={[0, 0.31, 0.017]}
          sleutel="loonstrook-jose"
          ppm={900}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#fdfdf8';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#5a6f8f';
            ctx.fillRect(0, 0, w, h * 0.2);
            tekstRegel(ctx, 'Loonstrook José', w * 0.05, h * 0.1, h * 0.1, '#ffffff', 700);
            tekstRegel(ctx, 'Loon per uur', w * 0.06, h * 0.38, h * 0.085, '#3b4442', 600);
            tekstRegel(ctx, '€ 8,09', w * 0.94, h * 0.38, h * 0.11, '#1f2a24', 700, 'right');
            tekstRegel(ctx, 'Belasting', w * 0.06, h * 0.6, h * 0.085, '#3b4442', 600);
            tekstRegel(ctx, '11,5%', w * 0.94, h * 0.6, h * 0.11, '#c0392b', 700, 'right');
            tekstRegel(ctx, 'Over per uur', w * 0.06, h * 0.82, h * 0.085, '#3b4442', 600);
            tekstRegel(ctx, '€ ...', w * 0.94, h * 0.82, h * 0.11, '#9aa3a8', 700, 'right');
          }}
        />
      </group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cil key={i} r={0.045} h={0.014} pos={[0.48, 0.007 + i * 0.015, 0.2]} color={i % 2 ? '#d9b65a' : '#c9cdd0'} seg={14} />
      ))}
      <Bord regels={['Uitzendbureau']} b={0.5} h={0.12} pos={[0.45, 0.07, 0.3]} rot={[-0.6, 0, 0]} bg="#5a6f8f" fg="#ffffff" />
    </group>
  );
}

/** EIN-11: opengeslagen boek van € 15 op een standaard en een grijs bord met de verzendkosten. */
export function Boek() {
  const busje = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (busje.current) busje.current.position.x = 0.25 + Math.sin(clock.getElapsedTime() * 0.6) * 0.25;
  });
  return (
    <group>
      {/* lessenaar met boek */}
      <group position={[-0.45, 0, 0]}>
        <Cil r={0.04} h={0.95} pos={[0, 0.475, 0]} color="#8a5a36" seg={10} />
        <Blok size={[0.45, 0.05, 0.35]} pos={[0, 0.025, 0]} color="#8a5a36" r={0.02} />
        <group position={[0, 0.98, 0]} rotation={[-0.6, 0, 0]}>
          <Blok size={[0.66, 0.46, 0.03]} color="#6f4a2c" r={0.02} />
          {[-1, 1].map((s) => (
            <Blok key={s} size={[0.3, 0.42, 0.02]} pos={[s * 0.155, 0, 0.022]} rot={[0, -s * 0.12, 0]} color="#fbf6ec" r={0.01} />
          ))}
          <Doek b={0.26} h={0.34} pos={[-0.155, 0, 0.036]} rot={[0, 0.12, 0]} sleutel="boek-blad" teken={(ctx, w, h) => {
            ctx.fillStyle = '#fbf6ec';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#c9c2b5';
            for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.1, h * (0.1 + i * 0.09), w * (i % 3 === 2 ? 0.5 : 0.8), h * 0.025);
          }} />
        </group>
        <Prijskaartje tekst="€ 15" pos={[0.3, 1.0, 0.25]} rot={[0, -0.3, 0.1]} b={0.26} h={0.15} />
      </group>
      {/* grijs stoepbord met oranje stippen (een A-bord) */}
      <group position={[0.45, 1.15, -0.1]}>
        <group rotation={[0, Math.PI, 0]}>
          <group rotation={[-0.2, 0, 0]}>
            <Blok size={[0.75, 1.17, 0.04]} pos={[0, -0.585, 0.02]} color="#8d9295" r={0.02} />
          </group>
        </group>
        <group rotation={[-0.2, 0, 0]}>
          <Blok size={[0.75, 1.17, 0.04]} pos={[0, -0.585, 0.02]} color="#8d9295" r={0.02} />
          <Doek
            b={0.68}
            h={1.06}
            pos={[0, -0.56, 0.042]}
            sleutel="verzendkosten2"
            ppm={800}
            teken={(ctx, w, h) => {
              ctx.fillStyle = '#9aa0a4';
              ctx.fillRect(0, 0, w, h);
              ctx.fillStyle = '#f2a64a';
              for (let i = 0; i < 18; i++) {
                ctx.beginPath();
                ctx.arc((w * ((i * 37) % 100)) / 100, h * (0.04 + (((i * 53) % 90) / 100) * 0.15), 9, 0, Math.PI * 2);
                ctx.fill();
              }
              tekstRegel(ctx, 'Verzendkosten', w / 2, h * 0.32, h * 0.085, '#1f2a24', 700, 'center');
              tekstRegel(ctx, '€ 2,25', w / 2, h * 0.5, h * 0.15, '#1f2a24', 700, 'center');
              tekstRegel(ctx, 'Per zending', w / 2, h * 0.68, h * 0.075, '#1f2a24', 600, 'center');
              tekstRegel(ctx, 'Binnen NL', w / 2, h * 0.8, h * 0.075, '#1f2a24', 600, 'center');
            }}
          />
        </group>
      </group>
      {/* bestelbusje met pakketje */}
      <group ref={busje} position={[0.25, 0, 0.55]}>
        <Blok size={[0.34, 0.18, 0.18]} pos={[0, 0.13, 0]} color="#fbfaf6" r={0.03} />
        <Blok size={[0.1, 0.12, 0.17]} pos={[0.2, 0.1, 0]} color="#f2a64a" r={0.02} />
        {[-0.1, 0.18].map((x) =>
          [-0.09, 0.09].map((z) => <Cil key={`${x}${z}`} r={0.035} h={0.025} pos={[x, 0.035, z]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={10} />),
        )}
        <Blok size={[0.1, 0.07, 0.08]} pos={[-0.06, 0.255, 0]} color="#c9a372" r={0.01} />
      </group>
    </group>
  );
}
