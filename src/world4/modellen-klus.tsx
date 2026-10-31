// Wereld 4 – voorwerpen voor "Zelf doen" (niveau): de drie klussen
// Nieuws en media (festival, krant, omroepen), Kapper en drogist (kapsalon, chocodrank, styling)
// en Bouwmarkt en elektro (dozen, rode deuren, telefoon, laptop).
// Elk voorwerp past in een kamer (max. ±3 × 3 m vloer). Oorsprong midden op de vloer, voorkant naar +z.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useOpgelost } from '../game/opgelost';
import { Blok, Cil, mat, seeded } from '../game/kit';
import { FONT, rondRect } from '../game/tekst';
import { Draai } from './modellen-start';
import { Beloning, Bord, Doek, NaGoed, PaalBord, pasFont, Poppetje, Prijskaartje, Scherm, Sokkel, tekstBlok, tekstRegel, VoorGoed } from './winkels';

type V3 = [number, number, number];

/** Infozuil: donkere zuil met een groot verlicht vlak (de tekening komt van buiten). */
function Infozuil({ b = 0.95, h = 2.3, children }: { b?: number; h?: number; children?: ReactNode }) {
  return (
    <group>
      <Blok size={[b + 0.2, 0.12, 0.6]} pos={[0, 0.06, 0]} color="#3b4442" r={0.04} />
      <Blok size={[b, h, 0.42]} pos={[0, h / 2, 0]} color="#2f3634" r={0.08} />
      <Blok size={[b + 0.08, 0.1, 0.48]} pos={[0, h + 0.05, 0]} color="#e86f8a" r={0.03} />
      <group position={[0, 0, 0.215]}>{children}</group>
    </group>
  );
}

// ─────────────────────────── Klus: Nieuws en media ───────────────────────────

/** NIV-05: infozuil met de poster "Festival X" en een teller; ernaast een mini-podium met publiek. */
export function Festival() {
  const lichten = useRef<THREE.Group>(null);
  const vlag = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lichten.current?.children.forEach((c, i) => (c.rotation.z = Math.sin(t * 1.2 + i * 1.7) * 0.5));
    if (vlag.current) vlag.current.rotation.z = Math.sin(t * 4) * 0.35;
  });
  const straal = useMemo(() => new THREE.MeshBasicMaterial({ color: '#bfe1ff', transparent: true, opacity: 0.28, depthWrite: false }), []);
  return (
    <group>
      <group position={[-0.6, 0, 0]}>
        <Infozuil>
          <Doek
            b={0.82}
            h={0.98}
            pos={[0, 1.72, 0.005]}
            sleutel="festival-poster"
            licht
            ppm={700}
            teken={(ctx, w, h) => {
              const g = ctx.createLinearGradient(0, 0, 0, h);
              g.addColorStop(0, '#0b1230');
              g.addColorStop(1, '#1d2f6b');
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, w, h);
              // lichtstralen
              ctx.globalAlpha = 0.35;
              ctx.fillStyle = '#bfe1ff';
              for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(w * (0.1 + i * 0.16), h * 0.62);
                ctx.lineTo(w * (i * 0.2 - 0.1), 0);
                ctx.lineTo(w * (i * 0.2 + 0.02), 0);
                ctx.fill();
              }
              ctx.globalAlpha = 1;
              // publiek
              ctx.fillStyle = '#05070f';
              for (let i = 0; i < 16; i++) {
                ctx.beginPath();
                ctx.arc(w * (i / 15), h * 0.92, w * 0.05, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.fillRect(0, h * 0.93, w, h * 0.07);
              tekstRegel(ctx, 'festival', w * 0.42, h * 0.36, h * 0.13, '#ffffff', 700, 'center');
              tekstRegel(ctx, 'X', w * 0.8, h * 0.36, h * 0.24, '#ffd21f', 700, 'center');
              tekstRegel(ctx, '2019', w * 0.5, h * 0.52, h * 0.07, '#ffd21f', 700, 'center');
            }}
          />
          <Doek
            b={0.82}
            h={0.92}
            pos={[0, 0.7, 0.005]}
            sleutel="festival-teller2"
            licht
            ppm={900}
            teken={(ctx, w, h) => {
              ctx.fillStyle = '#10161a';
              ctx.fillRect(0, 0, w, h);
              ctx.strokeStyle = '#ffd21f';
              ctx.lineWidth = 8;
              ctx.strokeRect(8, 8, w - 16, h - 16);
              const regel = (t: string, y: number, fs: number, k: string) => {
                pasFont(ctx, t, fs, w * 0.86, 700);
                ctx.fillStyle = k;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(t, w / 2, y);
              };
              regel('Bezoekers in 2019', h * 0.1, h * 0.085, '#ffffff');
              regel('24.000', h * 0.26, h * 0.17, '#ffd21f');
              regel('Een derde uit', h * 0.46, h * 0.095, '#ffffff');
              regel('het buitenland', h * 0.58, h * 0.095, '#ffffff');
              regel('Van hen 12%', h * 0.75, h * 0.095, '#ffd21f');
              regel('uit Polen', h * 0.87, h * 0.095, '#ffd21f');
            }}
          />
        </Infozuil>
      </group>
      {/* mini-podium met publiek */}
      <group position={[0.65, 0, 0.05]}>
        <Blok size={[1.1, 0.25, 0.55]} pos={[0, 0.125, -0.3]} color="#2f3634" r={0.03} />
        <Blok size={[1.1, 0.05, 0.05]} pos={[0, 1.25, -0.55]} color="#9aa3a8" r={0.01} />
        {[-0.53, 0.53].map((x) => (
          <Blok key={x} size={[0.05, 1.25, 0.05]} pos={[x, 0.625, -0.55]} color="#9aa3a8" r={0.01} />
        ))}
        <group ref={lichten}>
          {[-0.3, 0, 0.3].map((x) => (
            <group key={x} position={[x, 1.22, -0.5]}>
              <mesh position={[0, -0.45, 0.1]} material={straal}>
                <coneGeometry args={[0.2, 0.9, 12, 1, true]} />
              </mesh>
            </group>
          ))}
        </group>
        <Poppetje pos={[0, 0.25, -0.35]} kleur="#ffd21f" haar="#1f1b18" s={0.55} />
        {Array.from({ length: 7 }, (_, i) => (
          <Poppetje key={i} pos={[-0.42 + (i % 4) * 0.28 + (i > 3 ? 0.14 : 0), 0, 0.1 + (i > 3 ? 0.25 : 0)]} kleur={['#e5675a', '#5aa9ff', '#7cc35a', '#8b6bb5', '#f2a64a', '#2ec4b6', '#e86f8a'][i]} haar={i % 2 ? '#3b2a1e' : '#e2c27a'} s={0.5} />
        ))}
        <NaGoed ids={['O4-NIV-05']} pos={[0, 1.55, -0.3]}>
          <Beloning tekst={['960 bezoekers', 'uit Polen']} b={0.8} h={0.3} />
        </NaGoed>
        {/* één poppetje zwaait met een wit-rode vlag */}
        <group position={[0.28, 0.5, 0.35]}>
          <group ref={vlag}>
            <Cil r={0.008} h={0.35} pos={[0, 0.17, 0]} color="#7a5132" seg={6} />
            <Blok size={[0.16, 0.05, 0.01]} pos={[0.08, 0.31, 0]} color="#ffffff" r={0.003} />
            <Blok size={[0.16, 0.05, 0.01]} pos={[0.08, 0.26, 0]} color="#dc143c" r={0.003} />
          </group>
        </group>
      </group>
    </group>
  );
}

/** NIV-06: nieuwszuil met een krantenbericht; eronder rijdt een vrachtwagentje heen en weer. */
export function Krant() {
  const wagen = useRef<THREE.Group>(null);
  const knipper = useRef<THREE.Mesh>(null);
  const af = useOpgelost('O4-NIV-06');
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wagen.current && !af) {
      const x = Math.sin(t * 0.5) * 0.65;
      wagen.current.position.x = x;
      wagen.current.rotation.y = Math.cos(t * 0.5) >= 0 ? 0 : Math.PI;
    }
    if (knipper.current) knipper.current.visible = Math.floor(t * 3) % 2 === 0;
  });
  return (
    <group>
      <Infozuil b={1.36} h={2.5}>
        <Doek
          b={1.22}
          h={1.62}
          pos={[0, 1.5, 0.005]}
          sleutel="krant-vrachtwagens2"
          licht
          ppm={800}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#efe2c2';
            ctx.fillRect(0, 0, w, h);
            // vlekken van oud papier
            const r = seeded(14);
            for (let i = 0; i < 14; i++) {
              ctx.fillStyle = `rgba(160,120,60,${0.05 + r() * 0.08})`;
              ctx.beginPath();
              ctx.arc(r() * w, r() * h, 20 + r() * 60, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#2b2620';
            ctx.fillRect(w * 0.06, h * 0.05, w * 0.88, 4);
            let y = h * 0.11;
            y = tekstBlok(ctx, '14 procent vrachtwagens in België gevaar op de weg', w * 0.06, y, w * 0.88, h * 0.06, '#1a1612', 700, 1.15);
            ctx.fillStyle = '#2b2620';
            ctx.fillRect(w * 0.06, y - h * 0.02, w * 0.88, 3);
            y += h * 0.025;
            const tekst =
              '14% van de vrachtwagens in België is een gevaar op de weg. Bij een controle bleken 1.330 vrachtwagens een gevaar op de weg te vormen. De vrachtwagens hadden bijvoorbeeld slechte remmen, versleten banden of kapotte verlichting en richtingaanwijzers.';
            tekstBlok(ctx, tekst, w * 0.06, y, w * 0.88, h * 0.047, '#2b2620', 600, 1.3);
          }}
        />
        <Bord regels={['NIEUWS']} b={0.6} h={0.18} pos={[0, 2.41, 0.005]} bg="#2f3634" fg="#ffffff" licht />
        <NaGoed ids={['O4-NIV-06']} pos={[0, 0.55, 0.06]} rot={[0, 0, -0.06]}>
          <Beloning tekst={['Gecontroleerd:', '9.500 vrachtwagens']} b={1.0} h={0.3} />
        </NaGoed>
      </Infozuil>
      {/* stukje weg met vrachtwagentje */}
      <group position={[0, 0, 0.75]}>
        <Blok size={[1.9, 0.04, 0.36]} pos={[0, 0.02, 0]} color="#5d6166" r={0.01} />
        {[-0.6, -0.2, 0.2, 0.6].map((x) => (
          <Blok key={x} size={[0.2, 0.005, 0.025]} pos={[x, 0.043, 0]} color="#f3f1e8" r={0.002} shadow={false} />
        ))}
        <group ref={wagen} position={[0, 0.04, 0]}>
          <Blok size={[0.4, 0.2, 0.17]} pos={[-0.06, 0.15, 0]} color="#f4efe6" r={0.02} />
          <Blok size={[0.14, 0.16, 0.16]} pos={[0.22, 0.13, 0]} color="#d9534f" r={0.03} />
          <Blok size={[0.02, 0.07, 0.13]} pos={[0.295, 0.16, 0]} color="#3f4d58" r={0.005} />
          {[-0.18, 0.04, 0.22].map((x) =>
            [-0.085, 0.085].map((z) => <Cil key={`${x}${z}`} r={0.035} h={0.03} pos={[x, 0.035, z]} rot={[Math.PI / 2, 0, 0]} color="#2c2f33" seg={10} />),
          )}
          <mesh ref={knipper} position={[0.29, 0.1, -0.085]} material={mat('#ffb02e', { emissive: '#ffb02e' })}>
            <sphereGeometry args={[0.018, 8, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

const OMROEPEN: [string, number, number][] = [
  ['EO', 440788, 439293],
  ['VPRO', 339623, 362340],
  ['BNN', 337554, 303306],
  ['WNL', 52996, 59501],
  ['PowNed', 51609, 52249],
];
const punt = (n: number) => n.toLocaleString('nl-NL');

/** NIV-10: breed tv-scherm met het liggende staafdiagram van de omroepen (2014 en 2009). */
export function Omroepen() {
  const vlieg = useRef<THREE.Group>(null);
  const B = 2.5;
  const H = 1.5;
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (vlieg.current) vlieg.current.position.x = -B / 2 + B * (0.22 + ((Math.sin(t * 0.4) + 1) / 2) * 0.45);
  });
  // y van de BNN-staaf (2014) in meters, gelijk aan de tekening hieronder
  const rij = (i: number) => 0.2 + i * 0.15;
  const yBnn = H / 2 - (rij(2) + 0.035) * H;
  return (
    <group>
      <Blok size={[2.2, 0.5, 0.5]} pos={[0, 0.25, -0.05]} color="#8a5a36" r={0.04} />
      <Blok size={[2.24, 0.04, 0.54]} pos={[0, 0.52, -0.05]} color="#6f4a2c" r={0.02} />
      <Blok size={[0.5, 0.08, 0.3]} pos={[0, 0.58, -0.05]} color="#262b2e" r={0.02} />
      <Blok size={[0.12, 0.35, 0.08]} pos={[0, 0.78, -0.08]} color="#262b2e" r={0.02} />
      <group position={[0, 0.95 + H / 2, -0.05]}>
        <Scherm
          b={B}
          h={H}
          sleutel="omroepen2"
          ppm={800}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            tekstRegel(ctx, 'Ledenaantallen van enkele publieke omroepen', w * 0.03, h * 0.07, h * 0.062, '#1f2a24', 700);
            const x0 = w * 0.17;
            const maxB = w * 0.58;
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x0, h * 0.15);
            ctx.lineTo(x0, h * 0.95);
            ctx.stroke();
            OMROEPEN.forEach(([naam, a2014, a2009], i) => {
              const y = rij(i) * h;
              const hb = h * 0.055;
              tekstRegel(ctx, naam, x0 - w * 0.015, y + hb, h * 0.056, '#1f2a24', 700, 'right');
              const b1 = (a2014 / 450000) * maxB;
              const b2 = (a2009 / 450000) * maxB;
              ctx.fillStyle = '#8a4a24';
              ctx.fillRect(x0, y, b1, hb);
              ctx.fillStyle = '#f6b98a';
              ctx.fillRect(x0, y + hb + 3, b2, hb);
              tekstRegel(ctx, punt(a2014), x0 + b1 + w * 0.008, y + hb * 0.5, h * 0.05, '#1f2a24', 700);
              tekstRegel(ctx, punt(a2009), x0 + b2 + w * 0.008, y + hb * 1.5 + 3, h * 0.05, '#1f2a24', 700);
            });
            // legenda
            const lx = w * 0.8;
            ctx.fillStyle = '#8a4a24';
            ctx.fillRect(lx, h * 0.8, w * 0.05, h * 0.045);
            tekstRegel(ctx, '2014', lx + w * 0.06, h * 0.822, h * 0.045, '#1f2a24', 700);
            ctx.fillStyle = '#f6b98a';
            ctx.fillRect(lx, h * 0.88, w * 0.05, h * 0.045);
            tekstRegel(ctx, '2009', lx + w * 0.06, h * 0.902, h * 0.045, '#1f2a24', 700);
          }}
        />
        <NaGoed ids={['O4-NIV-10']} pos={[B / 2 - 0.42, yBnn, 0.1]}>
          <Beloning tekst={['BNN +11,3%']} b={0.62} h={0.16} />
        </NaGoed>
        {/* een vlieg wandelt over de staaf van BNN */}
        <group ref={vlieg} position={[0, yBnn, 0.08]}>
          <mesh material={mat('#1b1b1b')}>
            <sphereGeometry args={[0.018, 8, 6]} />
          </mesh>
          <mesh position={[0, 0.012, 0.004]} scale={[1.6, 0.6, 0.3]} material={mat('#cfe6f2', { opacity: 0.7 })}>
            <sphereGeometry args={[0.014, 8, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────── Klus: Kapper en drogist ───────────────────────────

const HAAR: [string, boolean][] = [
  ['#e2c27a', false],
  ['#6b4226', true],
  ['#1f1b18', false],
  ['#e2c27a', false],
  ['#6b4226', true],
  ['#b5532c', false],
  ['#1f1b18', false],
  ['#c9c4bc', false],
  ['#6b4226', true],
  ['#e2c27a', false],
];

/** NIV-01: kapsalon met 10 paspophoofden; 3 hebben bruin haar. */
export function Kapsalon() {
  return (
    <group>
      <Blok size={[2.5, 0.85, 0.5]} pos={[0, 0.425, 0]} color="#f4efe6" r={0.04} />
      <Blok size={[2.56, 0.05, 0.56]} pos={[0, 0.875, 0]} color="#c96a8a" r={0.02} />
      {HAAR.map(([k], i) => (
        <group key={i} position={[(i - 4.5) * 0.245, 0.9, 0.02]}>
          <Cil r={0.035} h={0.12} pos={[0, 0.06, 0]} color="#e0d2bf" seg={10} />
          <mesh position={[0, 0.2, 0]} castShadow material={mat('#efe0cc')}>
            <sphereGeometry args={[0.085, 14, 12]} />
          </mesh>
          <mesh position={[0, 0.235, -0.015]} scale={[1.08, 0.85, 1.08]} castShadow material={mat(k)}>
            <sphereGeometry args={[0.088, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
        </group>
      ))}
      {/* spiegel met bord */}
      <group position={[0, 0, -0.3]}>
        <Blok size={[2.4, 0.9, 0.05]} pos={[0, 1.75, 0]} color="#c96a8a" r={0.03} />
        <Blok size={[2.3, 0.8, 0.03]} pos={[0, 1.75, 0.02]} color="#bcd7e0" r={0.01} rough={0.15} />
        <Blok size={[2.0, 0.42, 0.04]} pos={[0, 2.42, 0]} color="#fbf6ec" r={0.03} />
        <Bord regels={['Op school heeft 3 op de 10', 'studenten bruin haar']} b={1.9} h={0.36} pos={[0, 2.42, 0.025]} fg="#7a2b4a" groot={0.8} />
        <NaGoed ids={['O4-NIV-01']} pos={[0, 1.75, 0.06]}>
          <Beloning tekst={['3 op de 10 = 30%']} b={1.1} h={0.2} />
        </NaGoed>
        {[-1.15, 1.15].map((x) => (
          <Blok key={x} size={[0.06, 2.0, 0.06]} pos={[x, 1.0, 0]} color="#c9c4bc" r={0.02} />
        ))}
      </group>
    </group>
  );
}

/** Pot chocoladedrank (rood met gele band). */
function Pot({ r = 0.16, h = 0.36, kleur = '#c0392b', band = true, vraag = false }: { r?: number; h?: number; kleur?: string; band?: boolean; vraag?: boolean }) {
  return (
    <group>
      <Cil r={r} h={h} pos={[0, h / 2, 0]} color={kleur} seg={28} />
      <Cil r={r * 0.92} h={0.07} pos={[0, h + 0.035, 0]} color={band ? '#8e1f16' : '#7f888d'} seg={28} />
      {band && <PotBand r={r} y={h * 0.78} />}
      {vraag && (
        <VoorGoed ids={['O4-NIV-07']} pos={[0, h * 0.5, r + 0.002]}>
          <Bord regels={['?']} b={0.16} h={0.16} bg="#fbfaf6" fg="#3b4442" rond={0.5} />
        </VoorGoed>
      )}
      {vraag && (
        <NaGoed ids={['O4-NIV-07']} pos={[0, h * 0.5, r + 0.004]}>
          <Bord regels={['320 g']} b={0.22} h={0.1} bg="#3fbf6f" fg="#ffffff" licht />
        </NaGoed>
      )}
    </group>
  );
}

function PotBand({ r, y }: { r: number; y: number }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffd21f';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#c0392b';
    ctx.font = `700 76px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+15% extra', 256, 68);
    ctx.fillText('+15% extra', 768, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, y, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <cylinderGeometry args={[r * 1.02, r * 1.02, 0.1, 32, 1, true]} />
      <meshStandardMaterial map={tex} roughness={0.6} />
    </mesh>
  );
}

/** NIV-07: nieuwe pot chocoladedrank (+15% extra) op een weegschaal (368 g) en een oude, grijze pot met een vraagteken. */
export function Chocodrank() {
  const bol = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (bol.current) bol.current.position.y = 0.44 + Math.max(0, Math.sin(clock.getElapsedTime() * 1.3)) * 0.06;
  });
  return (
    <group>
      {/* weegschaal met de nieuwe pot */}
      <group position={[-0.28, 0, 0]}>
        <Blok size={[0.5, 0.1, 0.45]} pos={[0, 0.05, 0]} color="#e9e3d7" r={0.04} />
        <Cil r={0.21} h={0.03} pos={[0, 0.115, -0.03]} color="#c9cdd0" seg={24} />
        <Blok size={[0.3, 0.12, 0.06]} pos={[0, 0.08, 0.22]} rot={[-0.4, 0, 0]} color="#2f3634" r={0.02} />
        <Doek b={0.26} h={0.09} pos={[0, 0.085, 0.255]} rot={[-0.4, 0, 0]} sleutel="weeg-368" licht teken={(ctx, w, h) => {
          ctx.fillStyle = '#0f2b1f';
          ctx.fillRect(0, 0, w, h);
          tekstRegel(ctx, '368 g', w / 2, h * 0.55, h * 0.7, '#7dffb0', 700, 'center');
        }} />
        <group position={[0, 0.13, -0.03]}>
          <Draai snel={0.4}>
            <Pot />
          </Draai>
          <mesh ref={bol} position={[0.05, 0.44, 0]} castShadow material={mat('#5a3420')}>
            <sphereGeometry args={[0.035, 10, 8]} />
          </mesh>
        </group>
      </group>
      {/* oude pot */}
      <group position={[0.38, 0, -0.02]}>
        <Pot r={0.14} h={0.31} kleur="#9aa3a8" band={false} vraag />
      </group>
      <Bord regels={['nieuwe pot']} b={0.38} h={0.1} pos={[-0.28, 0.02, 0.38]} rot={[-Math.PI / 2 + 0.35, 0, 0]} bg="#fbf6ec" />
      <Bord regels={['oude pot']} b={0.32} h={0.1} pos={[0.38, 0.02, 0.3]} rot={[-Math.PI / 2 + 0.35, 0, 0]} bg="#fbf6ec" />
    </group>
  );
}

/** Zwart busje of tube met een gekleurd etiket. */
function Product({ soort, kleur, pos }: { soort: 'spray' | 'mousse' | 'tube'; kleur: string; pos: V3 }) {
  if (soort === 'tube')
    return (
      <group position={pos}>
        <Cil r={0.045} h={0.05} pos={[0, 0.025, 0]} color="#1b1b1b" seg={12} />
        <Blok size={[0.13, 0.26, 0.05]} pos={[0, 0.18, 0]} color="#1b1b1b" r={0.02} />
        <Blok size={[0.1, 0.11, 0.052]} pos={[0, 0.2, 0.001]} color={kleur} r={0.01} />
      </group>
    );
  const h = soort === 'spray' ? 0.3 : 0.24;
  return (
    <group position={pos}>
      <Cil r={0.055} h={h} pos={[0, h / 2, 0]} color="#1b1b1b" seg={16} />
      <Cil r={0.057} h={0.1} pos={[0, h * 0.5, 0]} color={kleur} seg={16} />
      <Cil r={0.035} h={0.05} pos={[0, h + 0.025, 0]} color="#3b3a39" seg={12} />
    </group>
  );
}

/** NIV-09: vier zwarte stylingproducten; prijsbord "2 stuks": € 2,38 wordt € 1,79. Sticker "2e halve prijs". */
export function Styling() {
  return (
    <group>
      {/* schap */}
      <Blok size={[1.5, 1.5, 0.35]} pos={[0, 0.75, -0.2]} color="#f4efe6" r={0.04} />
      <Blok size={[1.4, 0.04, 0.4]} pos={[0, 0.78, -0.02]} color="#2ea39b" r={0.01} />
      <Blok size={[1.4, 0.04, 0.4]} pos={[0, 1.22, -0.02]} color="#2ea39b" r={0.01} />
      <Product soort="spray" kleur="#f2a64a" pos={[-0.45, 0.8, 0.0]} />
      <Product soort="mousse" kleur="#7cc35a" pos={[-0.15, 0.8, 0.0]} />
      <Product soort="tube" kleur="#4f86b8" pos={[0.15, 0.8, 0.0]} />
      <Product soort="tube" kleur="#e86f8a" pos={[0.45, 0.8, 0.0]} />
      <Bord regels={['STYLING', 'zwarte serie']} b={1.2} h={0.32} pos={[0, 1.4, -0.02]} bg="#1b1b1b" fg="#ffffff" />
      {/* sticker die ronddraait */}
      <group position={[0.62, 1.62, 0.02]}>
        <Draai snel={0.8}>
          <Doek b={0.34} h={0.34} sleutel="halve-prijs" transparant dubbel teken={(ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#d83a2e';
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w / 2 - 4, h / 2.6, 0, 0, Math.PI * 2);
            ctx.fill();
            tekstRegel(ctx, '2e halve', w / 2, h * 0.42, h * 0.15, '#ffffff', 700, 'center');
            tekstRegel(ctx, 'prijs', w / 2, h * 0.6, h * 0.15, '#ffffff', 700, 'center');
          }} />
        </Draai>
      </group>
      <NaGoed ids={['O4-NIV-09']} pos={[0, 1.78, 0.05]}>
        <Beloning tekst={['± 25% korting']} b={0.8} h={0.2} />
      </NaGoed>
      {/* prijsbord "2 stuks" */}
      <group position={[1.08, 0, 0.3]} rotation={[0, -0.25, 0]}>
        <Cil r={0.03} h={0.75} pos={[0, 0.375, 0]} color="#3b4442" seg={8} />
        <Blok size={[0.4, 0.04, 0.3]} pos={[0, 0.02, 0]} color="#3b4442" r={0.01} />
        <Doek
          b={0.7}
          h={0.42}
          pos={[0, 0.95, 0.02]}
          sleutel="styling-prijs"
          ppm={800}
          teken={(ctx, w, h) => {
            ctx.fillStyle = '#d83a2e';
            rondRect(ctx, 0, 0, w, h, 24);
            ctx.fill();
            tekstRegel(ctx, '2 STUKS', w * 0.27, h * 0.22, h * 0.16, '#ffffff', 700, 'center');
            tekstRegel(ctx, '€ 2,38', w * 0.27, h * 0.6, h * 0.2, '#ffffff', 700, 'center');
            ctx.strokeStyle = '#ffd21f';
            ctx.lineWidth = h * 0.035;
            ctx.beginPath();
            ctx.moveTo(w * 0.05, h * 0.68);
            ctx.lineTo(w * 0.49, h * 0.52);
            ctx.stroke();
            // gele ster met de actieprijs
            const cx = w * 0.74;
            const cy = h * 0.5;
            ctx.fillStyle = '#ffd21f';
            ctx.beginPath();
            for (let i = 0; i < 24; i++) {
              const rr = i % 2 ? h * 0.36 : h * 0.47;
              const a = (i * Math.PI) / 12;
              ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            }
            ctx.closePath();
            ctx.fill();
            tekstRegel(ctx, '€ 1,79', cx, cy, h * 0.18, '#c0392b', 700, 'center');
          }}
        />
      </group>
    </group>
  );
}

// ─────────────────────────── Klus: Bouwmarkt en elektro ───────────────────────────

/** NIV-02: twee pallets met samen 250 dozen (2 × 5 × 5 × 5); beschadigde dozen hebben rode tape. Klembord: 35 beschadigd. */
function Stapel({ x, seed }: { x: number; seed: number }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 320;
    const ctx = c.getContext('2d')!;
    const r = seeded(seed);
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++) {
        const kapot = r() < 0.18;
        ctx.fillStyle = kapot ? '#c98f62' : r() > 0.5 ? '#c79a62' : '#bf8f58';
        ctx.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
        ctx.fillStyle = kapot ? '#d0402e' : '#e8e2d2';
        ctx.fillRect(i * 64 + 2, j * 64 + 28, 60, kapot ? 12 : 8);
        if (kapot) ctx.fillRect(i * 64 + 26, j * 64 + 2, 12, 60);
      }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [seed]);
  return (
    <group position={[x, 0, -0.1]}>
      <Blok size={[1.04, 0.04, 1.04]} pos={[0, 0.1, 0]} color="#c9a372" r={0.01} />
      {[-0.45, 0, 0.45].map((z) => (
        <Blok key={z} size={[1.04, 0.08, 0.12]} pos={[0, 0.04, z]} color="#b58d5c" r={0.01} />
      ))}
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Dozen() {
  return (
    <group>
      <Stapel x={-0.62} seed={25} />
      <Stapel x={0.62} seed={35} />
      {/* klembord op een standaard */}
      <group position={[0, 0, 0.75]} rotation={[0, 0, 0]}>
        <Cil r={0.025} h={1.0} pos={[0, 0.5, -0.03]} color="#3b4442" seg={8} />
        <group position={[0, 1.1, 0]} rotation={[-0.3, 0, 0]}>
          <Blok size={[0.66, 0.82, 0.03]} color="#8a5a36" r={0.02} />
          <Blok size={[0.2, 0.06, 0.04]} pos={[0, 0.4, 0.01]} color="#9aa3a8" r={0.01} />
          <Bord regels={['Controle', '250 dozen', '35 dozen', 'beschadigd']} b={0.6} h={0.74} pos={[0, -0.02, 0.017]} bg="#fbfaf6" kleuren={[undefined, undefined, '#c0392b', '#c0392b']} rond={0.03} />
          <NaGoed ids={['O4-NIV-02']} pos={[0.12, -0.22, 0.04]} rot={[0, 0, 0.2]}>
            <Beloning tekst={['14%']} b={0.3} h={0.16} />
          </NaGoed>
        </group>
      </group>
    </group>
  );
}

/** NIV-03: maquette van een straat met 25 huizen; de deuren zijn nog niet geverfd. Na het goede antwoord: 7 rode deuren. */
const RODE_DEUREN = new Set([1, 5, 8, 12, 15, 19, 23]);
export function RodeDeuren() {
  const af = useOpgelost('O4-NIV-03');
  const muren = ['#f4ecdd', '#eef0ea', '#f2e7d8', '#e9dcc8'];
  return (
    <group>
      <group>
        <Blok size={[1.9, 0.03, 0.85]} pos={[0, 0.015, 0]} color="#a5c46f" r={0.01} />
        <Blok size={[1.9, 0.01, 0.16]} pos={[0, 0.035, 0]} color="#7a7e82" r={0.004} shadow={false} />
        {Array.from({ length: 25 }, (_, i) => {
          const kant = i < 13 ? -1 : 1;
          const n = i < 13 ? i : i - 13;
          const x = -0.84 + n * 0.14 + (kant > 0 ? 0.07 : 0);
          return (
            <group key={i} position={[x, 0.03, kant * 0.2]} rotation={[0, kant > 0 ? Math.PI : 0, 0]}>
              <Blok size={[0.11, 0.1, 0.1]} pos={[0, 0.05, 0]} color={muren[i % 4]} r={0.008} />
              <mesh position={[0, 0.125, 0]} rotation={[0, Math.PI / 4, 0]} castShadow material={mat('#57534f', { flat: true })}>
                <coneGeometry args={[0.085, 0.09, 4]} />
              </mesh>
              <Blok size={[0.03, 0.05, 0.006]} pos={[0, 0.026, 0.051]} color={af && RODE_DEUREN.has(i) ? '#d02b20' : '#fbfaf6'} r={0.002} shadow={false} />
            </group>
          );
        })}
      </group>
      <NaGoed ids={['O4-NIV-03']} pos={[-0.62, 0.45, -0.5]}>
        <Beloning tekst={['7 rode deuren']} b={0.56} h={0.15} />
      </NaGoed>
      {/* verfpot met kwast */}
      <group position={[0.82, 0, 0.52]}>
        <Cil r={0.09} h={0.14} pos={[0, 0.07, 0]} color="#c9cdd0" seg={18} />
        <Cil r={0.085} h={0.01} pos={[0, 0.142, 0]} color="#d02b20" seg={18} />
        <Blok size={[0.14, 0.06, 0.002]} pos={[0, 0.07, 0.091]} color="#d02b20" r={0.001} />
        <Blok size={[0.02, 0.22, 0.02]} pos={[0.06, 0.2, 0]} rot={[0, 0, -0.4]} color="#b6773e" r={0.005} />
      </group>
      <PaalBord regels={['25 huizen', '28% krijgt', 'een rode deur']} b={0.66} h={0.46} hoogte={0.5} pos={[0, 0, -0.55]} bg="#fbf6ec" kleuren={[undefined, '#d02b20', '#d02b20']} />
    </group>
  );
}

/** NIV-04: reuzentelefoon met een batterij van 45% en "nog 495 minuten". */
export function Telefoon() {
  return (
    <group>
      <Sokkel b={1.1} h={0.25} d={0.7} />
      <group position={[0, 0.27, -0.05]}>
        <Blok size={[0.3, 0.3, 0.22]} pos={[0, 0.15, -0.08]} rot={[-0.2, 0, 0]} color="#3b4442" r={0.04} />
        <group position={[0, 1.0, 0]} rotation={[-0.12, 0, 0]}>
          <Blok size={[0.92, 1.7, 0.1]} color="#1b1e21" r={0.12} />
          <Doek
            b={0.82}
            h={1.56}
            pos={[0, 0, 0.052]}
            sleutel="telefoon-45"
            licht
            ppm={600}
            teken={(ctx, w, h) => {
              const g = ctx.createLinearGradient(0, 0, 0, h);
              g.addColorStop(0, '#2b5f8f');
              g.addColorStop(1, '#5aa9ff');
              ctx.fillStyle = g;
              rondRect(ctx, 0, 0, w, h, 40);
              ctx.fill();
              tekstRegel(ctx, '12:45', w * 0.08, h * 0.04, h * 0.03, '#ffffff', 600);
              tekstRegel(ctx, 'Batterij', w / 2, h * 0.2, h * 0.06, '#ffffff', 700, 'center');
              // batterij-icoon
              const bx = w * 0.18;
              const by = h * 0.3;
              const bw = w * 0.56;
              const bh = h * 0.16;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 12;
              rondRect(ctx, bx, by, bw, bh, 20);
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(bx + bw + 4, by + bh * 0.3, w * 0.05, bh * 0.4);
              ctx.fillStyle = '#ffc94d';
              rondRect(ctx, bx + 16, by + 16, (bw - 32) * 0.45, bh - 32, 10);
              ctx.fill();
              tekstRegel(ctx, '45%', w / 2, h * 0.58, h * 0.11, '#ffffff', 700, 'center');
              tekstRegel(ctx, 'Nog 495 minuten', w / 2, h * 0.76, h * 0.055, '#ffffff', 700, 'center');
              tekstRegel(ctx, 'te gebruiken', w / 2, h * 0.83, h * 0.045, '#e6f1ff', 600, 'center');
            }}
          />
          <Blok size={[0.2, 0.03, 0.02]} pos={[0, 0.8, 0.055]} color="#2f3634" r={0.01} />
          <NaGoed ids={['O4-NIV-04']} pos={[0, -0.6, 0.07]}>
            <Beloning tekst={['Vol: 1100 minuten']} b={0.72} h={0.18} />
          </NaGoed>
        </group>
      </group>
    </group>
  );
}

/** NIV-08: laptop met 21% korting; Pieter betaalt nu € 856,36. Oude prijs: vraagteken. */
export function Laptop() {
  return (
    <group>
      <group position={[-0.15, 0, 0]}>
        <Blok size={[0.62, 0.03, 0.42]} pos={[0, 0.015, 0.05]} color="#c9cdd0" r={0.01} />
        <Blok size={[0.54, 0.005, 0.24]} pos={[0, 0.033, 0.0]} color="#3b4442" r={0.002} />
        <Blok size={[0.18, 0.004, 0.1]} pos={[0, 0.033, 0.18]} color="#9aa3a8" r={0.002} />
        <group position={[0, 0.03, -0.16]} rotation={[-0.25, 0, 0]}>
          <Blok size={[0.62, 0.4, 0.02]} pos={[0, 0.2, 0]} color="#c9cdd0" r={0.01} />
          <Doek b={0.56} h={0.34} pos={[0, 0.2, 0.011]} sleutel="laptop-scherm" licht teken={(ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#2ec4b6');
            g.addColorStop(1, '#3d7cc9');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            tekstRegel(ctx, 'NIEUW', w / 2, h * 0.5, h * 0.22, '#ffffff', 700, 'center');
          }} />
        </group>
      </group>
      <PaalBord regels={['Nu met', '21% korting!']} b={0.55} h={0.32} hoogte={0.45} pos={[0.45, 0, -0.22]} bg="#d83a2e" fg="#ffffff" />
      <Prijskaartje tekst="Nu: € 856,36" pos={[0.45, 0.03, 0.22]} rot={[-Math.PI / 2 + 0.5, 0, 0]} b={0.42} h={0.16} bg="#ffd21f" />
      <VoorGoed ids={['O4-NIV-08']} pos={[-0.15, 0.03, 0.34]} rot={[-Math.PI / 2 + 0.5, 0, 0]}>
        <Prijskaartje tekst="Oude prijs: ?" pos={[0, 0, 0]} b={0.4} h={0.13} bg="#fbfaf6" />
      </VoorGoed>
      <NaGoed ids={['O4-NIV-08']} pos={[-0.15, 0.03, 0.34]} rot={[-Math.PI / 2 + 0.5, 0, 0]}>
        <Prijskaartje tekst="Oude prijs: € 1084" pos={[0, 0, 0]} b={0.5} h={0.13} bg="#3fbf6f" />
      </NaGoed>
    </group>
  );
}
