// 3D-objecten voor de instapvragen (samen oefenen) in De Markthal.
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat } from '../game/inspectie';
import { mat } from '../game/kit';
import { Blok, Cil } from './blok';
import { P } from '../game/palette';
import { FONT, rondRect } from '../game/tekst';
import { Druk, druk } from './atlas';
import { Bol, Glas, Kaartje, Krat, KLEUR, Label, Poppetje, schrijf, Tekenbord, Toonbank, useVulling, type V3 } from './kraam';

/** Ingepakt snoepje (strikvorm). */
function Snoepje({ pos, kleur, rot = 0 }: { pos: V3; kleur: string; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.1, 0.07, 0.07]} pos={[0, 0.035, 0]} color={kleur} r={0.03} />
      <Blok size={[0.2, 0.05, 0.012]} pos={[0, 0.035, 0]} rot={[Math.PI / 2, 0, 0]} color={kleur} r={0.005} />
    </group>
  );
}

/** INS-01: snoepkraam. Uit de zak zijn 6 rode en 4 groene snoepjes gerold. */
export function Snoepzak() {
  return (
    <group>
      <Toonbank b={2.2} d={0.8} />
      {/* lege zak, omgevallen */}
      <group position={[-0.55, 0.92, -0.05]} rotation={[0, 0.3, Math.PI / 2 - 0.15]}>
        <Blok size={[0.34, 0.5, 0.16]} pos={[0, 0.25, 0]} color="#f6d5e2" r={0.05} opacity={0.55} />
        <mesh position={[0, 0.56, 0]} material={mat('#e86a9a')}>
          <coneGeometry args={[0.06, 0.12, 6]} />
        </mesh>
      </group>
      {/* schaaltje met de snoepjes: boven 6 rood, onder 4 groen */}
      <Cil r={0.42} rTop={0.46} h={0.05} pos={[0.25, 0.925, 0.05]} color="#fbfaf6" seg={24} />
      {Array.from({ length: 6 }, (_, i) => (
        <Snoepje key={`r${i}`} pos={[0.25 - 0.3 + (i % 3) * 0.3 * 1, 0.95, -0.12 + Math.floor(i / 3) * 0.13]} kleur="#d8433a" rot={(i % 2) * 0.4 - 0.2} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <Snoepje key={`g${i}`} pos={[0.25 - 0.22 + (i % 2) * 0.44, 0.95, 0.15 + Math.floor(i / 2) * 0.13]} kleur="#5aa83a" rot={(i % 2) * -0.4 + 0.2} />
      ))}
      {/* potten met snoep */}
      {[-0.95, 0.9].map((x, i) => (
        <group key={x} position={[x, 0.92, -0.18]}>
          <Cil r={0.15} h={0.26} pos={[0, 0.13, 0]} color={i ? '#f2c24a' : '#e86a9a'} seg={14} />
          <mesh position={[0, 0.17, 0]} material={mat('#eef6f8', { opacity: 0.35, rough: 0.1 })}>
            <cylinderGeometry args={[0.17, 0.17, 0.34, 16, 1, true]} />
          </mesh>
          <Cil r={0.18} h={0.05} pos={[0, 0.36, 0]} color="#d8433a" seg={16} />
        </group>
      ))}
      <Kaartje regels={['Snoepmix']} pos={[0.95, 0.92, 0.22]} breed={0.42} hoog={0.14} kleur="#fff4f8" rand="#e86a9a" />
    </group>
  );
}

/** Melkpak met puntdak. */
function Melkpak({ pos, s = 1 }: { pos: V3; s?: number }) {
  const etiket = druk(
    0.3,
    0.5,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3d7cc9';
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.fillStyle = '#fbfaf6';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.62 + Math.sin(x / 14) * 8);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(0, h * 0.55);
      ctx.fill();
      schrijf(ctx, 'MELK', w / 2, h * 0.3, h * 0.17, '#3d7cc9', { gewicht: 700, uitlijn: 'center' });
    },
    'w3-melk',
    400,
  );
  return (
    <group position={pos} scale={s}>
      <Druk {...etiket} rough={0.7} position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
      </Druk>
      <mesh position={[0, 0.56, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 1.0]} castShadow material={mat('#fbfaf6')}>
        <cylinderGeometry args={[0.001, 0.21, 0.13, 4, 1]} />
      </mesh>
      <Blok size={[0.02, 0.06, 0.3]} pos={[0, 0.64, 0]} color="#fbfaf6" r={0.005} />
    </group>
  );
}

/** INS-02: zuivelkraam met een pannenkoekrecept voor 2 personen (200 ml melk). */
export function Melkrecept() {
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#9fc4ef" />
      <Melkpak pos={[-0.75, 0.92, -0.1]} />
      {/* maatbeker met 200 ml */}
      <group position={[-0.3, 0.92, 0.08]}>
        <mesh position={[0, 0.06, 0]} material={mat('#fbfaf6', { rough: 0.4 })}>
          <cylinderGeometry args={[0.085, 0.08, 0.12, 16]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} material={mat('#eef6f8', { opacity: 0.35, rough: 0.1 })}>
          <cylinderGeometry args={[0.095, 0.09, 0.22, 16, 1, true]} />
        </mesh>
        <Blok size={[0.03, 0.08, 0.06]} pos={[0.11, 0.14, 0]} color="#eef6f8" r={0.01} opacity={0.5} />
        <Kaartje regels={['200 ml']} pos={[0, 0, 0.13]} breed={0.22} hoog={0.09} schuin={-0.6} />
      </group>
      {/* recept */}
      <group position={[0.25, 0.92, -0.12]} rotation={[-0.3, 0, 0]}>
        <Blok size={[0.66, 0.52, 0.03]} pos={[0, 0.27, -0.01]} color={P.hout} r={0.01} />
        <Label regels={['Pannenkoeken', 'voor 2 personen', '200 ml melk']} breed={0.62} hoog={0.48} pos={[0, 0.27, 0.007]} bg="#fbf6ea" rand="#3d7cc9" vet={0} />
      </group>
      {/* 2 borden met pannenkoeken */}
      {[0.72, 1.0].map((x, i) => (
        <group key={x} position={[x, 0.92, 0.1 - i * 0.22]}>
          <Cil r={0.14} h={0.02} pos={[0, 0.01, 0]} color="#fbfaf6" seg={18} />
          <Cil r={0.11} h={0.04} pos={[0, 0.04, 0]} color="#e9b36a" seg={18} />
        </group>
      ))}
    </group>
  );
}

/** INS-03: een groep op excursie in de Markthal: 3 jongens en 5 meisjes met een gids. */
export function Groep() {
  const jongens: V3[] = [
    [-0.9, 0, 0.35],
    [-0.35, 0, 0.55],
    [0.25, 0, 0.6],
  ];
  const meisjes: V3[] = [
    [-1.1, 0, -0.2],
    [-0.55, 0, 0.0],
    [0.0, 0, 0.1],
    [0.6, 0, 0.2],
    [1.05, 0, 0.0],
  ];
  return (
    <group>
      <Blok size={[2.8, 0.03, 1.8]} pos={[0, 0.015, 0]} color="#c9c0dd" r={0.01} shadow={false} />
      {jongens.map((p, i) => (
        <Poppetje key={`j${i}`} pos={p} rot={Math.PI + (p[0] > 0 ? 0.3 : -0.3)} shirt={['#3d7cc9', '#2f5d8a', '#4f86b8'][i]} haar={i === 1 ? 'pet' : 'kort'} haarKleur={['#4a3426', '#2f5d8a', '#2b2220'][i]} s={0.8} />
      ))}
      {meisjes.map((p, i) => (
        <Poppetje key={`m${i}`} pos={p} rot={Math.PI + (p[0] > 0 ? 0.25 : -0.25)} shirt={['#e48a3a', '#e86a9a', '#f2c24a', '#e5675a', '#9b7fd0'][i]} haar="staart" haarKleur={['#6b4a2f', '#2b2220', '#c9a14a', '#4a3426', '#8a5a36'][i]} s={0.78} />
      ))}
      {/* gids met vlag, kijkt naar de groep */}
      <Poppetje pos={[0.2, 0, -0.7]} rot={0} shirt={KLEUR.groen} haar="krul" haarKleur="#3a2a20" s={0.95}>
        <Cil r={0.015} h={1.2} pos={[0.3, 1.5, 0]} color="#2f3634" seg={5} />
        <Label regels={['Rondleiding']} breed={0.5} hoog={0.24} pos={[0.56, 1.95, 0]} bg={KLEUR.groen} fg="#ffffff" rand={null} dubbel />
      </Poppetje>
    </group>
  );
}

/** INS-04: plattegrond van de Markthal op een tafel. Schaal 1 : 1000; ingang en kaaskraam 4 cm uit elkaar. */
export function Kaarttafel() {
  const B = 1.5;
  const D = 0.95;
  const cm = B / 12; // 1 cm op de kaart = 1/12 van de kaart (zichtbaar groot)
  const kaart = druk(
    B,
    D,
    (ctx, w, h) => {
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(0, 0, w, h);
      const c = w / 12;
      ctx.strokeStyle = '#e4d8bc';
      ctx.lineWidth = 2;
      for (let x = 0; x <= w; x += c) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += c) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // hal
      ctx.strokeStyle = '#8a5a36';
      ctx.lineWidth = 8;
      ctx.strokeRect(c * 1, c * 1.3, c * 10, c * 5.2);
      const kramen = ['#e5675a', '#f2c24a', '#7cbf4a', '#9fc4ef', '#e86a9a', '#e48a3a'];
      kramen.forEach((k, i) => {
        ctx.fillStyle = k;
        ctx.fillRect(c * (1.6 + (i % 3) * 3.2), c * (1.9 + Math.floor(i / 3) * 2.4), c * 2.2, c * 1.4);
      });
      // ingang (A) en kaaskraam (B): 4 cm
      const ax = c * 2.7;
      const ay = c * 6.0;
      ctx.setLineDash([16, 12]);
      ctx.strokeStyle = '#d8433a';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 4 * c, ay);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#2f5d46';
      ctx.beginPath();
      ctx.arc(ax, ay, 16, 0, Math.PI * 2);
      ctx.arc(ax + 4 * c, ay, 16, 0, Math.PI * 2);
      ctx.fill();
      schrijf(ctx, 'ingang', ax, ay + c * 0.75, c * 0.42, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
      schrijf(ctx, 'kaaskraam', ax + 4 * c, ay + c * 0.75, c * 0.42, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
      schrijf(ctx, 'Plattegrond Markthal', c * 1, c * 0.65, c * 0.5, '#1f2a24', { gewicht: 700 });
      ctx.fillStyle = '#fbfaf6';
      rondRect(ctx, c * 8.1, c * 6.9, c * 3.6, c * 0.85, 10);
      ctx.fill();
      schrijf(ctx, 'schaal 1 : 1000', c * 9.9, c * 7.33, c * 0.46, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
    },
    'w3-plattegrond',
    560,
  );
  return (
    <group>
      <Blok size={[B + 0.25, 0.08, D + 0.25]} pos={[0, 0.82, 0]} color={P.hout} r={0.03} />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.07, 0.8, 0.07]} pos={[(sx * (B + 0.1)) / 2, 0.4, (sz * (D + 0.1)) / 2]} color={P.hout} r={0.02} />),
      )}
      <Deel id="kaart" uit={[0, 0.4, 0]} label="Kaart, schaal 1 : 1000">
        <Druk {...kaart} rough={0.9} position={[0, 0.865, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[B, D]} />
        </Druk>
        {/* liniaal langs de stippellijn */}
        <group position={[-B / 2 + cm * 2.7 + cm * 2, 0.875, -D / 2 + cm * 6.0 - cm * 0.42]}>
          <Blok size={[cm * 5, 0.012, cm * 0.4]} color="#f2d04a" r={0.004} />
        </group>
        <Maat van={[-B / 2 + cm * 2.7, 0.89, -D / 2 + cm * 6.0 - cm * 0.42]} naar={[-B / 2 + cm * 6.7, 0.89, -D / 2 + cm * 6.0 - cm * 0.42]} label="4 cm" />
      </Deel>
    </group>
  );
}

/** INS-05: limonadekraam. 1 deel siroop en 7 delen water; samen 2 liter in de kan. */
export function Limonade() {
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#f2c24a" />
      {/* fles siroop */}
      <group position={[-0.8, 0.92, -0.1]}>
        <Cil r={0.1} h={0.36} pos={[0, 0.18, 0]} color="#b8243a" seg={16} />
        <Cil r={0.04} rTop={0.03} h={0.12} pos={[0, 0.42, 0]} color="#b8243a" seg={10} />
        <Cil r={0.035} h={0.04} pos={[0, 0.49, 0]} color="#f2d04a" seg={10} />
        <Kaartje regels={['SIROOP', '1 deel siroop', '7 delen water']} pos={[0, 0.06, 0.11]} breed={0.3} hoog={0.24} schuin={0} kleur="#fff4e8" rand="#b8243a" />
      </group>
      {/* kan van 2 liter */}
      <group position={[-0.25, 0.92, 0.02]}>
        <mesh position={[0, 0.15, 0]} material={mat('#e7849a', { rough: 0.3 })}>
          <cylinderGeometry args={[0.13, 0.13, 0.3, 18]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} material={mat('#eef6f8', { opacity: 0.32, rough: 0.1 })}>
          <cylinderGeometry args={[0.15, 0.15, 0.4, 18, 1, true]} />
        </mesh>
        <mesh position={[0.17, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#eef6f8', { opacity: 0.45 })}>
          <torusGeometry args={[0.08, 0.015, 6, 14, Math.PI]} />
        </mesh>
        <Kaartje regels={['2 liter']} pos={[0, 0.02, 0.17]} breed={0.24} hoog={0.09} schuin={0} />
      </group>
      {/* 8 glazen: 1 deel siroop + 7 delen water */}
      {Array.from({ length: 8 }, (_, i) => (
        <Glas key={i} pos={[0.2 + i * 0.12, 0.92, 0.15]} r={0.045} h={0.14} vul={0.75} kleur={i === 0 ? '#b8243a' : '#bfe3ee'} />
      ))}
      <Blok size={[1.0, 0.02, 0.14]} pos={[0.62, 0.925, 0.15]} color="#e9dcc3" r={0.005} />
      <Kaartje regels={['1 deel + 7 delen']} pos={[0.62, 0.92, -0.12]} breed={0.6} hoog={0.12} kleur="#fffbea" rand="#f2c24a" />
    </group>
  );
}

/** INS-06: stoffenkraam met een rol stof. 3 meter kost € 18. */
export function Stofrol() {
  const stof = druk(
    1,
    0.5,
    (ctx, w, h) => {
      ctx.fillStyle = '#8b6bb5';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b79ad8';
      for (let x = 0; x < w; x += 28) for (let y = (x / 28) % 2 ? 14 : 0; y < h; y += 28) ctx.fillRect(x + 6, y + 6, 10, 10);
    },
    'w3-stof',
    256,
  );
  return (
    <group>
      <Toonbank b={2.4} d={0.85} kleur="#c9b6e2" />
      {/* rol op standaard */}
      <group position={[0, 1.18, -0.25]}>
        <Druk {...stof} rough={0.9} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 1.9, 22]} />
        </Druk>
        <Cil r={0.03} h={2.2} rot={[0, 0, Math.PI / 2]} color="#c9a227" seg={8} />
        {[-1.05, 1.05].map((x) => (
          <Blok key={x} size={[0.05, 0.32, 0.05]} pos={[x, -0.14, 0]} color="#7a5a3c" r={0.01} />
        ))}
      </group>
      {/* afgeknipt stuk van 3 m, opgevouwen */}
      <group position={[-0.25, 0.92, 0.15]}>
        {[0, 1, 2].map((i) => (
          <Druk {...stof} rough={0.9} key={i} position={[0, 0.012 + i * 0.022, 0]} castShadow>
            <boxGeometry args={[1.0 - i * 0.02, 0.02, 0.42 - i * 0.02]} />
          </Druk>
        ))}
        {/* meetlint */}
        <Blok size={[1.04, 0.006, 0.05]} pos={[0, 0.072, 0.17]} color="#f2d04a" r={0.002} />
      </group>
      <Kaartje regels={['3 meter', '€ 18']} pos={[0.65, 0.92, 0.1]} breed={0.36} hoog={0.24} kleur="#f6f1fb" rand="#8b6bb5" />
      <Kaartje regels={['1 meter', '€ ?']} pos={[0.98, 0.92, 0.1]} breed={0.26} hoog={0.24} kleur="#fffaf0" rand="#8b6bb5" />
      {/* schaar */}
      <group position={[-0.95, 0.93, 0.18]} rotation={[0, 0.5, 0]}>
        <Blok size={[0.18, 0.012, 0.025]} pos={[0.06, 0, 0.01]} rot={[0, 0.15, 0]} color={P.metaal} r={0.004} />
        <Blok size={[0.18, 0.012, 0.025]} pos={[0.06, 0, -0.01]} rot={[0, -0.15, 0]} color={P.metaal} r={0.004} />
        <mesh position={[-0.05, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={mat('#e5675a')}>
          <torusGeometry args={[0.03, 0.008, 6, 12]} />
        </mesh>
        <mesh position={[-0.05, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]} material={mat('#e5675a')}>
          <torusGeometry args={[0.03, 0.008, 6, 12]} />
        </mesh>
      </group>
    </group>
  );
}

const HAAR = ['#4a3426', '#2b2220', '#c9a14a', '#6b4a2f', '#8a5a36'];
const ROOD_HAAR = new Set([1, 7, 10, 14, 18]);

/** INS-07: klassenfoto van 20 studenten op een ezel. 5 studenten hebben rood haar. */
export function Klassenfoto() {
  return (
    <group>
      {/* ezel */}
      <Blok size={[0.06, 2.0, 0.06]} pos={[-0.7, 1.0, 0.1]} rot={[0.12, 0, 0.08]} color={P.hout} r={0.02} />
      <Blok size={[0.06, 2.0, 0.06]} pos={[0.7, 1.0, 0.1]} rot={[0.12, 0, -0.08]} color={P.hout} r={0.02} />
      <Blok size={[0.06, 1.9, 0.06]} pos={[0, 0.95, -0.35]} rot={[-0.3, 0, 0]} color={P.hout} r={0.02} />
      <Blok size={[1.7, 0.06, 0.12]} pos={[0, 0.72, 0.18]} color={P.hout} r={0.02} />
      <Tekenbord
        breed={1.6}
        hoog={1.12}
        poten={0}
        pos={[0, 0.76, 0.16]}
        rot={[-0.12, 0, 0]}
        lijst="#3b4442"
        sleutel="w3-klassenfoto"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#dfe9ee';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#c8d8e0';
          ctx.fillRect(0, h * 0.6, w, h * 0.4);
          schrijf(ctx, 'Klas 2B · 20 studenten', w / 2, h * 0.075, h * 0.075, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
          for (let i = 0; i < 20; i++) {
            const rij = Math.floor(i / 5);
            const k = i % 5;
            const x = w * (0.14 + k * 0.18 + (rij % 2) * 0.03);
            const y = h * (0.24 + rij * 0.2);
            const r = h * 0.062;
            ctx.fillStyle = ['#3d7cc9', '#e48a3a', '#3f8f5a', '#9b7fd0', '#e5675a'][(i * 3) % 5];
            ctx.beginPath();
            ctx.ellipse(x, y + r * 1.9, r * 1.35, r * 0.9, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = ['#f0c6a0', '#d9a77c', '#b07a52', '#f3d2b3'][i % 4];
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = ROOD_HAAR.has(i) ? '#d24a1e' : HAAR[i % HAAR.length];
            ctx.beginPath();
            ctx.arc(x, y - r * 0.15, r * 1.08, Math.PI * 1.02, Math.PI * 1.98);
            ctx.fill();
            if (ROOD_HAAR.has(i) || i % 3 === 0) {
              ctx.fillRect(x - r * 1.05, y - r * 0.3, r * 0.32, r * 1.0);
              ctx.fillRect(x + r * 0.73, y - r * 0.3, r * 0.32, r * 1.0);
            }
            ctx.fillStyle = '#1f2a24';
            ctx.beginPath();
            ctx.arc(x - r * 0.35, y, r * 0.11, 0, Math.PI * 2);
            ctx.arc(x + r * 0.35, y, r * 0.11, 0, Math.PI * 2);
            ctx.fill();
          }
        }}
      />
      {/* statief met camera */}
      <group position={[1.15, 0, 0.75]} rotation={[0, -0.5, 0]}>
        {[0, 2.1, 4.2].map((a) => (
          <Blok key={a} size={[0.03, 1.2, 0.03]} pos={[Math.sin(a) * 0.18, 0.58, Math.cos(a) * 0.18]} rot={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]} color="#2f3634" r={0.01} />
        ))}
        <Blok size={[0.24, 0.16, 0.12]} pos={[0, 1.24, 0]} color="#2f3634" r={0.03} />
        <Cil r={0.05} h={0.12} pos={[0, 1.24, -0.1]} rot={[Math.PI / 2, 0, 0]} color="#1f2224" seg={12} />
      </group>
    </group>
  );
}

/** Foto aan de waslijn: bewerkt (in kleur, met sterretje) of niet bewerkt (grijs). */
function foto(kleur: boolean) {
  return druk(
    0.2,
    0.16,
    (ctx, w, h) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, kleur ? '#6fb7e8' : '#b9bcbe');
      g.addColorStop(1, kleur ? '#f2c24a' : '#8d9093');
      ctx.fillStyle = g;
      ctx.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.7);
      ctx.fillStyle = kleur ? '#5aa83a' : '#6d7072';
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.78);
      ctx.lineTo(w * 0.4, h * 0.38);
      ctx.lineTo(w * 0.62, h * 0.6);
      ctx.lineTo(w * 0.92, h * 0.3);
      ctx.lineTo(w * 0.92, h * 0.78);
      ctx.fill();
      if (kleur) {
        ctx.fillStyle = '#e5675a';
        ctx.beginPath();
        ctx.arc(w * 0.78, h * 0.22, h * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    `w3-foto-${kleur}`,
    600,
  );
}

const BEWERKT = new Set([1, 3, 6, 8]);

/** INS-08: fotokraam met een camera en 10 foto's aan een lijn: 4 zijn bewerkt (in kleur). */
export function Fotocamera() {
  const kleur = foto(true);
  const grijs = foto(false);
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#5b6370" />
      {/* camera */}
      <group position={[-0.55, 0.92, 0.0]} rotation={[0, 0.35, 0]}>
        <Blok size={[0.46, 0.3, 0.22]} pos={[0, 0.15, 0]} color="#2f3634" r={0.05} />
        <Blok size={[0.2, 0.08, 0.14]} pos={[-0.08, 0.34, 0]} color="#2f3634" r={0.02} />
        <Cil r={0.1} h={0.18} pos={[0.04, 0.15, 0.18]} rot={[Math.PI / 2, 0, 0]} color="#1f2224" seg={18} />
        <Cil r={0.07} h={0.01} pos={[0.04, 0.15, 0.275]} rot={[Math.PI / 2, 0, 0]} color="#4f86b8" seg={16} />
        <Blok size={[0.06, 0.04, 0.02]} pos={[0.16, 0.32, 0.05]} color="#e5675a" r={0.01} />
      </group>
      <Kaartje regels={["10 foto's"]} pos={[0.55, 0.92, 0.15]} breed={0.36} hoog={0.12} kleur="#eef0f2" rand="#3b4250" />
      {/* waslijn met 10 foto's */}
      {[-1.05, 1.05].map((x) => (
        <Blok key={x} size={[0.05, 0.75, 0.05]} pos={[x, 1.28, -0.3]} color="#2f3634" r={0.01} />
      ))}
      <Blok size={[2.1, 0.012, 0.012]} pos={[0, 1.6, -0.3]} color="#e9dcc3" r={0.004} />
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i} position={[-0.9 + i * 0.2, 1.5, -0.29]} rotation={[0, 0, ((i % 3) - 1) * 0.05]}>
          <Druk {...(BEWERKT.has(i) ? kleur : grijs)} dubbel rough={0.7}>
            <planeGeometry args={[0.17, 0.14]} />
          </Druk>
          <Blok size={[0.02, 0.05, 0.02]} pos={[0, 0.08, 0.005]} color={P.hout} r={0.005} />
        </group>
      ))}
    </group>
  );
}

/** INS-09: appelkist met prijsbordje "4 appels € 1". Op het blad liggen 10 appels. */
export function Appelkist() {
  const vulling = useVulling(24, 0.66, 0.42, 0.065, 4);
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#a8c98a" />
      <group position={[-0.55, 0.92, -0.08]} rotation={[0.18, 0, 0]}>
        <Krat b={0.75} d={0.5} h={0.22} />
        <group position={[0, 0.04, 0]}>
          {vulling.map((p, i) => (
            <Bol key={i} pos={p} r={0.065} kleur={i % 3 ? '#c8352c' : '#d8433a'} />
          ))}
        </group>
      </group>
      <Kaartje regels={['4 appels', '€ 1']} pos={[-0.55, 0.92, 0.27]} breed={0.36} hoog={0.24} kleur="#fffaf0" rand="#5f9e3f" />
      {/* 10 appels in 2 rijen op een plank */}
      <Blok size={[0.8, 0.03, 0.3]} pos={[0.45, 0.935, 0.05]} color={P.hout} r={0.01} />
      {Array.from({ length: 10 }, (_, i) => (
        <Bol key={i} pos={[0.13 + (i % 5) * 0.16, 1.02, -0.02 + Math.floor(i / 5) * 0.14]} r={0.065} kleur="#c8352c" />
      ))}
      <Kaartje regels={['10 appels', '€ ?']} pos={[0.45, 0.92, 0.3]} breed={0.36} hoog={0.24} kleur="#fffaf0" rand="#5f9e3f" schuin={-0.6} />
    </group>
  );
}

/** INS-10: planbord met het werkrooster: 3 uur voor klant A, 5 uur voor klant B. */
export function Planbord() {
  const klok = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (klok.current) klok.current.rotation.z = -clock.getElapsedTime() * 0.4;
  });
  return (
    <group>
      <Tekenbord
        breed={2.0}
        hoog={1.15}
        poten={0.75}
        lijst="#9aa3a8"
        sleutel="w3-planbord"
        teken={(ctx, w, h) => {
          ctx.fillStyle = '#fbfcfc';
          ctx.fillRect(0, 0, w, h);
          schrijf(ctx, 'Werkrooster maandag', w * 0.04, h * 0.1, h * 0.09, '#1f2a24', { gewicht: 700 });
          const x0 = w * 0.25;
          const uur = (w * 0.7) / 8;
          ctx.strokeStyle = '#c9cdd0';
          ctx.lineWidth = 2;
          for (let i = 0; i <= 8; i++) {
            ctx.beginPath();
            ctx.moveTo(x0 + i * uur, h * 0.24);
            ctx.lineTo(x0 + i * uur, h * 0.82);
            ctx.stroke();
          }
          for (let i = 0; i < 8; i++) schrijf(ctx, `${i + 1}`, x0 + (i + 0.5) * uur, h * 0.9, h * 0.07, '#5b6370', { uitlijn: 'center' });
          schrijf(ctx, 'uur', x0 - w * 0.02, h * 0.9, h * 0.07, '#5b6370', { uitlijn: 'right' });
          const rij = (y: number, naam: string, n: number, kleur: string) => {
            schrijf(ctx, naam, w * 0.04, y, h * 0.09, '#1f2a24', { gewicht: 700 });
            for (let i = 0; i < n; i++) {
              ctx.fillStyle = kleur;
              rondRect(ctx, x0 + i * uur + 4, y - h * 0.09, uur - 8, h * 0.18, 8);
              ctx.fill();
            }
          };
          rij(h * 0.4, 'Klant A', 3, '#3d7cc9');
          rij(h * 0.66, 'Klant B', 5, '#e48a3a');
          ctx.font = `600 ${h * 0.05}px ${FONT}`;
        }}
      />
      {/* klok bovenop */}
      <group position={[0.75, 2.12, 0.02]}>
        <Cil r={0.16} h={0.04} rot={[Math.PI / 2, 0, 0]} color="#fbfaf6" seg={20} />
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.005]} material={mat('#2f3634')}>
          <torusGeometry args={[0.16, 0.02, 6, 20]} />
        </mesh>
        <group ref={klok} position={[0, 0, 0.03]}>
          <Blok size={[0.015, 0.12, 0.01]} pos={[0, 0.05, 0]} color="#2f3634" r={0.004} />
        </group>
      </group>
      {/* stiften */}
      <Blok size={[0.6, 0.04, 0.06]} pos={[0, 0.74, 0.06]} color="#9aa3a8" r={0.01} />
      {['#3d7cc9', '#e48a3a', '#1f2a24'].map((k, i) => (
        <Cil key={k} r={0.012} h={0.12} pos={[-0.15 + i * 0.15, 0.78, 0.06]} rot={[0, 0, Math.PI / 2]} color={k} seg={6} />
      ))}
    </group>
  );
}

