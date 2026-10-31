// 3D-objecten voor de vragen op niveau (Zelf doen): de drie klussen van de Markthal.
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat } from '../game/inspectie';
import { useGroei, useOpgelost, useTip } from '../game/opgelost';
import { mat } from '../game/kit';
import { Blok, Cil } from './blok';
import { P } from '../game/palette';
import { FONT, rondRect } from '../game/tekst';
import { Druk, druk } from './atlas';
import { Bol, Kaartje, Krat, KLEUR, krijtAchtergrond, Label, Poppetje, schrijf, Tekenbord, Toonbank, useVulling, type V3 } from './kraam';

// ─────────────────────────── Klus "Kaas en fruit" ───────────────────────────

function Etiket({ breed, hoog, teken, sleutel, pos }: { breed: number; hoog: number; teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; sleutel: string; pos: V3 }) {
  return (
    <Druk b={breed} h={hoog} teken={teken} sleutel={sleutel} ppm={700} rough={0.6} position={pos}>
      <planeGeometry args={[breed, hoog]} />
    </Druk>
  );
}

/** Fles wasmiddel met handvat, dop en een etiket op de voorkant. */
function Wasfles({ pos, b, h, kleur, dop, naam, beurten, prijs, versiering }: { pos: V3; b: number; h: number; kleur: string; dop: string; naam: string; beurten: string; prijs: string; versiering: 'bloem' | 'stof' }) {
  const d = b * 0.6;
  return (
    <group position={pos}>
      <Blok size={[b, h, d]} pos={[0, h / 2, 0]} color={kleur} r={0.07} />
      <Blok size={[b * 0.42, h * 0.18, d * 0.7]} pos={[-b * 0.18, h + h * 0.07, 0]} color={kleur} r={0.05} />
      <mesh position={[b * 0.3, h * 0.85, 0]} rotation={[0, 0, 0]} castShadow material={mat(kleur)}>
        <torusGeometry args={[b * 0.17, b * 0.06, 8, 16]} />
      </mesh>
      <Cil r={b * 0.16} h={h * 0.12} pos={[-b * 0.18, h * 1.21, 0]} color={dop} seg={16} />
      <Etiket
        breed={b * 0.82}
        hoog={h * 0.6}
        pos={[0, h * 0.42, d / 2 + 0.003]}
        sleutel={`w3-was-${naam}`}
        teken={(ctx, w, hh) => {
          ctx.fillStyle = '#fbfaf6';
          rondRect(ctx, 0, 0, w, hh, w * 0.1);
          ctx.fill();
          schrijf(ctx, naam, w / 2, hh * 0.17, hh * 0.17, kleur, { gewicht: 700, uitlijn: 'center', max: w * 0.9 });
          if (versiering === 'bloem') {
            for (let i = 0; i < 6; i++) {
              ctx.fillStyle = i % 2 ? '#9b7fd0' : '#c9b6e2';
              ctx.beginPath();
              ctx.arc(w * (0.2 + i * 0.12), hh * 0.42 + (i % 2) * 10, hh * 0.05, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.fillStyle = '#d8433a';
            rondRect(ctx, w * 0.25, hh * 0.32, w * 0.5, hh * 0.18, 10);
            ctx.fill();
            ctx.strokeStyle = '#f39a8c';
            ctx.lineWidth = 4;
            for (let x = w * 0.28; x < w * 0.72; x += 14) {
              ctx.beginPath();
              ctx.moveTo(x, hh * 0.34);
              ctx.lineTo(x + 7, hh * 0.48);
              ctx.stroke();
            }
          }
          ctx.fillStyle = kleur;
          rondRect(ctx, w * 0.06, hh * 0.6, w * 0.88, hh * 0.32, 14);
          ctx.fill();
          schrijf(ctx, beurten, w / 2, hh * 0.76, hh * 0.15, '#ffffff', { gewicht: 700, uitlijn: 'center', max: w * 0.84 });
        }}
      />
      {/* prijslabel aan de hals */}
      <group position={[-b * 0.18, h * 1.02, d / 2 + 0.01]} rotation={[0.1, 0, 0.08]}>
        <Label regels={[prijs]} breed={b * 0.75} hoog={b * 0.28} pos={[0, -b * 0.15, 0.01]} bg="#fff6d6" fg="#1f2a24" rand="#e48a3a" />
      </group>
    </group>
  );
}

/** NIV-01: drogisterij. Paarse fles Sunil (30 wasbeurten, € 10,98) en rode fles Fleuril (23 wasbeurten, € 6,23). */
export function Wasmiddel() {
  const bellen = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    bellen.current?.children.forEach((b, i) => {
      const f = (t * 0.25 + i * 0.33) % 1;
      b.position.set(Math.sin(t + i * 2) * 0.08, f * 0.6, Math.cos(t * 0.7 + i) * 0.05);
      b.scale.setScalar(i === 0 ? 1 : 1 - f * 0.6);
    });
  });
  return (
    <group>
      <Toonbank b={2.0} d={0.8} kleur="#c9b6e2" />
      <Wasfles pos={[-0.45, 0.92, 0]} b={0.5} h={0.66} kleur="#7b55b8" dop="#b9bdc0" naam="Sunil" beurten="30 wasbeurten" prijs="€ 10,98" versiering="bloem" />
      <Wasfles pos={[0.45, 0.92, 0.02]} b={0.38} h={0.5} kleur="#cf2f2f" dop="#fbfaf6" naam="Fleuril" beurten="23 wasbeurten" prijs="€ 6,23" versiering="stof" />
      <Rozet pos={[0.82, 0.92, 0.05]} tekst="voordeligst" aan={useOpgelost('O3-NIV-01')} />
      <group ref={bellen} position={[-0.54, 1.75, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={mat('#dff3fb', { opacity: 0.45, rough: 0.05 })}>
            <sphereGeometry args={[0.035 + i * 0.008, 10, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Groene rozet op een stokje die opkomt na het goede antwoord. */
export function Rozet({ pos, tekst, aan }: { pos: V3; tekst: string; aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  return (
    <group position={pos}>
      <group ref={ref}>
        <Cil r={0.01} h={0.55} pos={[0, 0.275, 0]} color="#3f8f3a" seg={5} />
        <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#5aa83a')}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 12]} />
        </mesh>
        <Bol pos={[0, 0.62, 0.012]} r={0.06} kleur="#f2d04a" />
        <Label regels={[tekst]} breed={0.42} hoog={0.1} pos={[0, 0.44, 0.02]} bg="#5aa83a" fg="#ffffff" rand={null} />
      </group>
    </group>
  );
}

/** Vlaggetje op een prikker in de kaas. */
function Vlag({ pos, regels, breed = 0.5 }: { pos: V3; regels: string[]; breed?: number }) {
  const hh = 0.1 + regels.length * 0.08;
  return (
    <group position={pos}>
      <Cil r={0.006} h={0.4} pos={[0, 0.2, 0]} color="#c9a227" seg={4} />
      <Label regels={regels} breed={breed} hoog={hh} pos={[breed / 2, 0.4 - hh / 2, 0]} bg="#fff8e2" rand="#e9b52f" dubbel vet={-1} />
    </group>
  );
}

/** NIV-02: kaaskraam met een krijtbord in webshopstijl. Camembert € 3,75 per stuk; geitenkaas € 1,80 per 100 gram. */
export function Kaaswebshop() {
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#e9c46a" />
      {/* camembert op een plankje */}
      <Blok size={[0.5, 0.03, 0.4]} pos={[-0.5, 0.935, 0.08]} color={P.hout} r={0.01} />
      <Cil r={0.17} h={0.07} pos={[-0.5, 0.985, 0.08]} color="#f6efdc" seg={22} />
      <Vlag pos={[-0.5, 1.0, 0.08]} regels={['€ 3,75', 'per stuk']} breed={0.36} />
      {/* muis achter de camembert */}
      <group position={[-0.78, 0.94, -0.12]} rotation={[0, 0.6, 0]}>
        <mesh scale={[1, 0.8, 1.4]} castShadow material={mat('#9aa0a6')}>
          <sphereGeometry args={[0.05, 10, 8]} />
        </mesh>
        <Bol pos={[-0.025, 0.045, 0.04]} r={0.018} kleur="#e7b7b7" />
        <Bol pos={[0.025, 0.045, 0.04]} r={0.018} kleur="#e7b7b7" />
      </group>
      {/* rol geitenkaas */}
      <Blok size={[0.6, 0.03, 0.34]} pos={[0.45, 0.935, 0.08]} color={P.hout} r={0.01} />
      <Cil r={0.08} h={0.42} pos={[0.45, 1.03, 0.08]} rot={[0, 0, Math.PI / 2]} color="#fbfaf2" seg={18} />
      <Vlag pos={[0.42, 1.08, 0.12]} regels={['€ 1,80', 'per 100 gram']} breed={0.42} />
      <KaasPlakje aan={useOpgelost('O3-NIV-02')} />
      {/* krijtbord als webshop */}
      <Tekenbord
        breed={2.2}
        hoog={1.15}
        poten={1.0}
        pos={[0, 0, -0.55]}
        sleutel="w3-kaasshop"
        teken={(ctx, w, h) => {
          krijtAchtergrond(ctx, w, h);
          schrijf(ctx, 'KaasShop', w * 0.03, h * 0.1, h * 0.1, '#f2d04a', { gewicht: 700 });
          ['Home', 'Soorten kaas', 'Webshop', 'Extra'].forEach((m, i) => {
            const y = h * (0.3 + i * 0.16);
            if (i === 2) {
              ctx.fillStyle = '#5b6b64';
              rondRect(ctx, w * 0.02, y - h * 0.06, w * 0.21, h * 0.12, 10);
              ctx.fill();
            }
            schrijf(ctx, m, w * 0.04, y, h * 0.065, KLEUR.krijtLijn, { gewicht: i === 2 ? 700 : 500 });
          });
          schrijf(ctx, 'Webshop', w * 0.5, h * 0.12, h * 0.1, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(w * 0.42, h * 0.19);
          ctx.lineTo(w * 0.58, h * 0.19);
          ctx.stroke();
          // camembert
          ctx.fillStyle = '#f6efdc';
          ctx.beginPath();
          ctx.ellipse(w * 0.37, h * 0.42, w * 0.07, h * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();
          schrijf(ctx, 'Camembert', w * 0.37, h * 0.58, h * 0.07, KLEUR.krijtLijn, { uitlijn: 'center' });
          schrijf(ctx, '€ 3,75', w * 0.37, h * 0.72, h * 0.12, '#f2d04a', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, 'per stuk', w * 0.37, h * 0.85, h * 0.075, '#f2d04a', { gewicht: 600, uitlijn: 'center' });
          // geitenkaas
          ctx.fillStyle = '#fbfaf2';
          rondRect(ctx, w * 0.56, h * 0.36, w * 0.14, h * 0.1, 20);
          ctx.fill();
          schrijf(ctx, 'Geitenkaas', w * 0.63, h * 0.58, h * 0.07, KLEUR.krijtLijn, { uitlijn: 'center' });
          schrijf(ctx, '€ 1,80', w * 0.63, h * 0.72, h * 0.12, '#f2d04a', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, 'per 100 gram', w * 0.63, h * 0.85, h * 0.075, '#f2d04a', { gewicht: 600, uitlijn: 'center' });
          // winkelwagen
          ctx.strokeStyle = KLEUR.krijtLijn;
          ctx.lineWidth = 4;
          rondRect(ctx, w * 0.8, h * 0.24, w * 0.18, h * 0.5, 12);
          ctx.stroke();
          schrijf(ctx, 'Winkelwagen', w * 0.89, h * 0.33, h * 0.06, KLEUR.krijtLijn, { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, 'nog leeg', w * 0.89, h * 0.45, h * 0.055, '#c9d1cc', { uitlijn: 'center' });
          schrijf(ctx, '€ 0,00', w * 0.89, h * 0.62, h * 0.1, '#ffffff', { gewicht: 700, uitlijn: 'center' });
        }}
      />
    </group>
  );
}

/** Na het goede antwoord ligt het afgesneden stuk geitenkaas klaar op papier. */
function KaasPlakje({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  return (
    <group position={[0.85, 0.93, 0.2]}>
      <group ref={ref}>
        <Blok size={[0.3, 0.005, 0.24]} pos={[0, 0.003, 0]} color="#fbfaf6" r={0.002} />
        <Cil r={0.08} h={0.07} pos={[0, 0.08, 0]} rot={[0, 0, Math.PI / 2]} color="#fbfaf2" seg={18} />
        <Label regels={['41,67 g', 'voor Billie']} breed={0.26} hoog={0.12} pos={[0, 0.2, 0.0]} bg="#fff8e2" rand="#5aa83a" vet={0} dubbel />
      </group>
    </group>
  );
}

/** Weegschaal met een wijzerplaat die op een gewicht staat. */
function Weegschaal({ pos, gram, max = 500 }: { pos: V3; gram: number; max?: number }) {
  const plaat = druk(
    0.3,
    0.3,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2f3634';
      ctx.lineWidth = 3;
      for (let i = 0; i <= 10; i++) {
        const a = -Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 + Math.cos(a) * w * 0.4, h / 2 + Math.sin(a) * h * 0.4);
        ctx.lineTo(w / 2 + Math.cos(a) * w * 0.46, h / 2 + Math.sin(a) * h * 0.46);
        ctx.stroke();
      }
      const a = -Math.PI * 0.75 + (gram / max) * Math.PI * 1.5;
      ctx.strokeStyle = '#d8433a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.38);
      ctx.stroke();
      schrijf(ctx, `${gram} g`, w / 2, h * 0.75, h * 0.16, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
    },
    `w3-weeg-${gram}-${max}`,
    700,
  );
  return (
    <group position={pos}>
      <Blok size={[0.34, 0.3, 0.3]} pos={[0, 0.15, 0]} color="#e5675a" r={0.06} />
      <Druk {...plaat} rough={0.6} position={[0, 0.17, 0.152]}>
        <circleGeometry args={[0.13, 24]} />
      </Druk>
      <Cil r={0.03} h={0.06} pos={[0, 0.33, 0]} color="#9aa3a8" seg={8} />
      <Cil r={0.2} rTop={0.22} h={0.04} pos={[0, 0.37, 0]} color="#c9cdd0" seg={20} />
    </group>
  );
}

/** Kassabon die uit de toonbank omhoog komt na het goede antwoord. */
export function Kassabon({ pos, regels, aan }: { pos: V3; regels: string[]; aan: boolean }) {
  const ref = useGroei(aan, 0.3);
  return (
    <group position={pos} rotation={[-0.2, -0.3, 0]}>
      <group ref={ref}>
        <Blok size={[0.24, 0.36, 0.006]} pos={[0, 0.18, 0]} color="#fbfaf6" r={0.002} />
        <Label regels={regels} breed={0.22} hoog={0.3} pos={[0, 0.2, 0.004]} bg="#fbfaf6" rand={null} vet={regels.length - 1} />
      </group>
    </group>
  );
}

/** NIV-05: fruitkraam. Kist abrikozen met bordje "500 gram € 4,50" en een weegschaal op 150 gram. */
export function Abrikozen() {
  const vulling = useVulling(26, 0.66, 0.42, 0.055, 9);
  const wesp = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wesp.current) {
      wesp.current.position.set(-0.2 + Math.cos(t * 2.2) * 0.18, 1.12 + Math.sin(t * 5) * 0.03, 0.25 + Math.sin(t * 2.2) * 0.12);
      wesp.current.rotation.y = -t * 2.2;
    }
  });
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#f0b27a" />
      <group position={[-0.5, 0.92, -0.08]} rotation={[0.15, 0, 0]}>
        <Krat b={0.75} d={0.5} h={0.22} />
        <group position={[0, 0.04, 0]}>
          {vulling.map((p, i) => (
            <Bol key={i} pos={p} r={0.055} kleur={i % 4 ? '#f29a3a' : '#f6b04e'} />
          ))}
        </group>
      </group>
      {/* houten prijsbordje in de kist */}
      <group position={[-0.5, 1.0, 0.02]}>
        <Cil r={0.012} h={0.4} pos={[0, 0.2, 0]} color="#7a5a3c" seg={5} />
        <Blok size={[0.48, 0.32, 0.03]} pos={[0, 0.5, 0]} color="#c99a62" r={0.02} />
        <Label regels={['Abrikozen', '500 gram', '€ 4,50']} breed={0.44} hoog={0.28} pos={[0, 0.5, 0.017]} bg="#e2c08e" fg="#3b2414" rand={null} vet={2} />
      </group>
      {/* opengesneden abrikoos */}
      <group position={[-0.1, 0.95, 0.25]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow material={mat('#f29a3a')}>
          <sphereGeometry args={[0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#f8c46a')}>
          <circleGeometry args={[0.058, 16]} />
        </mesh>
        <mesh position={[0, 0.015, 0]} scale={[1, 0.5, 1.4]} material={mat('#8a4a26')}>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
      </group>
      <group ref={wesp}>
        <mesh scale={[1, 1, 1.6]} material={mat('#f2c24a')}>
          <sphereGeometry args={[0.018, 8, 6]} />
        </mesh>
        <Blok size={[0.08, 0.004, 0.02]} pos={[0, 0.02, 0]} color="#eef6f8" r={0.002} opacity={0.7} />
      </group>
      {/* weegschaal met 150 gram */}
      <Weegschaal pos={[0.55, 0.92, 0.0]} gram={150} />
      <Kassabon pos={[0.92, 0.92, 0.18]} regels={['Bon', '150 g abrikozen', '€ 1,35']} aan={useOpgelost('O3-NIV-05')} />
      {[
        [-0.06, 0],
        [0.06, 0.02],
        [0, -0.07],
      ].map(([x, z], i) => (
        <Bol key={i} pos={[0.55 + x, 1.36, z]} r={0.055} kleur="#f29a3a" />
      ))}
    </group>
  );
}

// ─────────────────────────── Klus "Open keuken" ───────────────────────────

/** NIV-03: pot guacamole (250 gram, bevat 50 gram avocado). De inhoud komt eruit als 5 gelijke laagjes. */
export function Guacamole() {
  const etiket = druk(
    0.62,
    0.24,
    (ctx, w, h) => {
      ctx.fillStyle = '#fbf3e2';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#5aa83a';
      ctx.fillRect(0, 0, w, h * 0.14);
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
      schrijf(ctx, 'Echte Mexicaanse guacamole', w / 2, h * 0.3, h * 0.12, '#2f5d46', { gewicht: 700, uitlijn: 'center', max: w * 0.95 });
      schrijf(ctx, '250 gram', w / 2, h * 0.52, h * 0.18, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
      schrijf(ctx, 'bevat 50 gram avocado', w / 2, h * 0.73, h * 0.13, '#1f2a24', { gewicht: 600, uitlijn: 'center', max: w * 0.95 });
    },
    'w3-guaca',
    1100,
  );
  const R = 0.24;
  const H = 0.36;
  const laag = H / 5;
  const af = useOpgelost('O3-NIV-03');
  const tip = useTip('O3-NIV-03');
  const zicht = af || tip >= 2;
  const heel = useGroei(!zicht, 0);
  const lagen = useGroei(zicht, 0.2);
  return (
    <group>
      <Toonbank b={2.0} d={0.8} kleur="#c9cdd0" blad="#9aa3a8" />
      <group position={[0, 0.92, 0.02]}>
        {/* pot (wand) */}
        <mesh position={[0, H / 2, 0]} castShadow material={mat('#f4f1ea', { opacity: 0.9, rough: 0.4 })}>
          <cylinderGeometry args={[R, R * 0.92, H, 28, 1, true]} />
        </mesh>
        <Cil r={R * 0.92} h={0.01} pos={[0, 0.005, 0]} color="#f4f1ea" seg={28} />
        <Druk {...etiket} rough={0.6} position={[0, H * 0.52, 0]}>
          <cylinderGeometry args={[R + 0.004, R * 0.93, H * 0.66, 28, 1, true, -1.25, 2.5]} />
        </Druk>
        {/* inhoud: eerst één groene massa; na het goede antwoord (of tip 2) 5 gelijke laagjes */}
        <group ref={heel}>
          <Cil r={R * 0.88} h={H * 0.96} pos={[0, H / 2, 0]} color="#9cbf5a" seg={24} />
        </group>
        <group ref={lagen}>
          {Array.from({ length: 5 }, (_, i) => (
            <Deel key={i} id={`laag${i + 1}`} uit={[0, 0.25 + i * 0.12, 0]} label={i === 0 ? 'Avocado: 50 g' : '50 g'}>
              <Cil r={R * 0.88} h={laag * 0.96} pos={[0, laag * (i + 0.5), 0]} color={i === 0 ? '#3f9a2a' : '#d6e2a8'} seg={24} />
            </Deel>
          ))}
        </group>
        <Deel id="deksel" uit={[0, 1.0, 0]} label="Deksel">
          <Cil r={R + 0.02} h={0.05} pos={[0, H + 0.025, 0]} color="#e48a3a" seg={28} />
          <Cil r={R * 0.4} h={0.03} pos={[0, H + 0.06, 0]} color="#d47a2a" seg={16} />
        </Deel>
        {/* tortillachip */}
        <mesh position={[R * 0.5, H + 0.12, -0.05]} rotation={[0.3, 0.4, 0.2]} castShadow material={mat('#e9c46a')}>
          <cylinderGeometry args={[0.07, 0.07, 0.008, 3]} />
        </mesh>
      </group>
      {/* avocado's en limoen */}
      <group position={[-0.62, 0.92, 0.1]}>
        <mesh scale={[1, 1.3, 1]} position={[0, 0.08, 0]} castShadow material={mat('#3f6a2a')}>
          <sphereGeometry args={[0.07, 12, 10]} />
        </mesh>
        <group position={[0.17, 0.03, 0.05]} rotation={[-1.2, 0, 0.3]}>
          <mesh scale={[1, 1.3, 1]} material={mat('#3f6a2a')}>
            <sphereGeometry args={[0.07, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh scale={[1, 1.3, 1]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} material={mat('#cfe08a')}>
            <circleGeometry args={[0.065, 14]} />
          </mesh>
          <Bol pos={[0, 0.01, 0]} r={0.025} kleur="#7a4a2a" />
        </group>
      </group>
      <Bol pos={[0.6, 0.97, 0.15]} r={0.05} kleur="#8cc63f" />
      <Kaartje regels={['Hoeveel deel', 'is avocado?']} pos={[0.65, 0.92, -0.18]} breed={0.42} hoog={0.2} kleur="#f3faf0" rand="#5aa83a" />
    </group>
  );
}

/** NIV-06: spaarpot van Max (afwashulp): € 3,50 per uur, 16 uur per week, een kwart gaat naar sparen. */
export function Spaarpot() {
  const roze = '#f2a7b8';
  return (
    <group>
      <Toonbank b={2.0} d={0.8} kleur="#c9cdd0" blad="#9aa3a8" />
      {/* varkentje */}
      <group position={[-0.5, 0.92, 0.0]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.24, 0]} scale={[1.25, 1, 1]} castShadow material={mat(roze, { rough: 0.4 })}>
          <sphereGeometry args={[0.2, 20, 14]} />
        </mesh>
        <Cil r={0.07} h={0.08} pos={[0.27, 0.24, 0]} rot={[0, 0, Math.PI / 2]} color="#ee93a8" seg={14} />
        <Bol pos={[0.31, 0.25, 0.025]} r={0.012} kleur="#b8576d" />
        <Bol pos={[0.31, 0.25, -0.025]} r={0.012} kleur="#b8576d" />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.14, 0.42, s * 0.08]} rotation={[s * 0.4, 0, -0.3]} material={mat('#ee93a8')}>
            <coneGeometry args={[0.05, 0.08, 4]} />
          </mesh>
        ))}
        {[-1, 1].map((sx) => [-1, 1].map((sz) => <Cil key={`${sx}${sz}`} r={0.04} h={0.08} pos={[sx * 0.13, 0.04, sz * 0.1]} color="#ee93a8" seg={8} />))}
        <Blok size={[0.12, 0.012, 0.02]} pos={[-0.02, 0.44, 0]} color="#5b2a36" r={0.004} />
        <Bol pos={[0.18, 0.3, 0.09]} r={0.015} kleur="#1f2a24" />
      </group>
      {/* loonbriefje */}
      <group position={[0.15, 0.92, -0.12]} rotation={[-0.3, 0, 0]}>
        <Blok size={[0.66, 0.5, 0.02]} pos={[0, 0.27, -0.012]} color="#3d7cc9" r={0.01} />
        <Label regels={['Max · afwashulp', '€ 3,50 per uur', '16 uur per week']} breed={0.62} hoog={0.46} pos={[0, 0.27, 0]} bg="#f4f8fd" rand={null} vet={0} />
      </group>
      {/* blokmodel: weekloon in 4 gelijke delen, 1 deel sparen */}
      <group position={[0.15, 0.93, 0.22]}>
        {[0, 1, 2, 3].map((i) => (
          <Deel key={i} id={`kwart${i + 1}`} uit={[0, i === 0 ? 0.3 : 0, i === 0 ? 0.25 : 0]} label={i === 0 ? '1 kwart: sparen' : '1 kwart'}>
            <Blok size={[0.17, 0.06, 0.12]} pos={[-0.27 + i * 0.18, 0.03, 0]} color={i === 0 ? '#5aa83a' : '#e9dcc3'} r={0.015} />
          </Deel>
        ))}
      </group>
      <Kaartje regels={['1/4 sparen']} pos={[0.73, 0.92, 0.2]} breed={0.3} hoog={0.1} kleur="#f0f8f3" rand="#5aa83a" />
      <Spaargeld aan={useOpgelost('O3-NIV-06')} />
      {/* munten */}
      {[0, 1, 2, 3].map((i) => (
        <Cil key={i} r={0.04} h={0.012} pos={[-0.85, 0.93 + i * 0.013, 0.22]} color="#d9b54a" seg={14} />
      ))}
    </group>
  );
}

/** Na het goede antwoord: een stapel munten op het spaardeel en een kaartje met het bedrag. */
function Spaargeld({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3);
  return (
    <group position={[-0.12, 0.99, 0.22]}>
      <group ref={ref}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Cil key={i} r={0.045} h={0.014} pos={[(i % 2) * 0.006, 0.008 + i * 0.015, 0]} color="#d9b54a" seg={14} />
        ))}
        <Label regels={['€ 14 gespaard']} breed={0.32} hoog={0.08} pos={[0, 0.16, 0.07]} bg="#f0f8f3" rand="#5aa83a" />
      </group>
    </group>
  );
}

/** Pak tomatenblokjes (390 gram). */
function Tomatenpak({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.16, 0.2, 0.09]} pos={[0, 0.1, 0]} color="#d8433a" r={0.015} />
      <Label regels={['tomaten', '390 g']} breed={0.14} hoog={0.12} pos={[0, 0.11, 0.046]} bg="#fbf3e2" fg="#b8243a" rand={null} vet={1} />
    </group>
  );
}

/** NIV-07: receptenboek op een standaard (spaghetti bolognese voor 4 personen) en pakken tomatenblokjes van 390 gram. */
export function Receptenboek() {
  const sliert = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (sliert.current) sliert.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.6) * 0.25;
  });
  const BW = 1.5;
  const BH = 0.82;
  const pagina = druk(
    BW,
    BH,
    (ctx, w, h) => {
      // twee pagina's met een geruite rand
      ctx.fillStyle = '#fbf8f0';
      ctx.fillRect(0, 0, w, h);
      const ruit = 18;
      for (let x = 0; x < w; x += ruit)
        for (const y of [0, h - ruit]) {
          ctx.fillStyle = (x / ruit) % 2 ? '#3d7cc9' : '#ffffff';
          ctx.fillRect(x, y, ruit, ruit);
        }
      for (let y = 0; y < h; y += ruit)
        for (const x of [0, w - ruit]) {
          ctx.fillStyle = (y / ruit) % 2 ? '#3d7cc9' : '#ffffff';
          ctx.fillRect(x, y, ruit, ruit);
        }
      ctx.fillStyle = '#d9d0bd';
      ctx.fillRect(w / 2 - 3, 0, 6, h);
      // linkerpagina: titel en tekening
      schrijf(ctx, 'Recept', w * 0.25, h * 0.13, h * 0.07, '#5b6370', { gewicht: 600, uitlijn: 'center' });
      schrijf(ctx, 'Spaghetti Bolognese', w * 0.25, h * 0.24, h * 0.085, '#1f2a24', { gewicht: 700, uitlijn: 'center', max: w * 0.44 });
      ctx.fillStyle = '#c8564a';
      ctx.beginPath();
      ctx.ellipse(w * 0.14, h * 0.55, w * 0.07, h * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8a090';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(w * (0.11 + (i % 3) * 0.025), h * (0.48 + Math.floor(i / 3) * 0.06), 6, 0, Math.PI * 2);
        ctx.fill();
      }
      schrijf(ctx, '+', w * 0.25, h * 0.55, h * 0.12, '#1f2a24', { gewicht: 700, uitlijn: 'center' });
      ctx.fillStyle = '#f2c24a';
      rondRect(ctx, w * 0.3, h * 0.42, w * 0.13, h * 0.27, 8);
      ctx.fill();
      schrijf(ctx, 'mix', w * 0.365, h * 0.55, h * 0.06, '#b8243a', { gewicht: 700, uitlijn: 'center' });
      // rechterpagina: ingrediënten
      const x0 = w * 0.53;
      schrijf(ctx, 'Ingrediënten voor 4 personen', x0, h * 0.13, h * 0.058, '#1f2a24', { gewicht: 700, max: w * 0.44 });
      [
        '350 gram Italiaans gehakt',
        '1 zak à 400 gram roerbakgroente',
        '1 pakje mix voor spaghetti',
        '1 pak à 390 gram tomatenblokjes',
        '1 zak à 500 gram spaghetti',
        'vloeibare boter',
      ].forEach((r, i) => {
        const y = h * (0.27 + i * 0.11);
        ctx.fillStyle = i === 3 ? '#fde7a0' : 'transparent';
        if (i === 3) ctx.fillRect(x0 - 8, y - h * 0.045, w * 0.45, h * 0.09);
        schrijf(ctx, `• ${r}`, x0, y, h * 0.05, '#1f2a24', { gewicht: 600, max: w * 0.43 });
      });
    },
    'w3-receptenboek',
    900,
  );
  return (
    <group>
      <Toonbank b={2.2} d={0.8} kleur="#c9cdd0" blad="#9aa3a8" />
      {/* boekenstandaard met open boek */}
      <group position={[-0.15, 0.92, -0.05]} rotation={[-0.75, 0, 0]}>
        <Blok size={[BW + 0.08, BH + 0.06, 0.04]} pos={[0, BH / 2 + 0.03, -0.025]} color="#2f5d8a" r={0.02} />
        <Druk {...pagina} rough={0.85} position={[0, BH / 2 + 0.03, 0.002]}>
          <planeGeometry args={[BW, BH]} />
        </Druk>
      </group>
      <Blok size={[0.9, 0.05, 0.12]} pos={[-0.15, 0.95, 0.24]} color={P.hout} r={0.02} />
      {/* stapel pakken tomatenblokjes */}
      <Tomatenpak pos={[0.82, 0.92, 0.12]} />
      <Tomatenpak pos={[0.82, 1.12, 0.12]} rot={0.1} />
      {/* pan met een slingerende sliert spaghetti */}
      <group position={[0.85, 0.92, -0.25]}>
        <Cil r={0.18} rTop={0.2} h={0.2} pos={[0, 0.1, 0]} color="#b9c0c4" seg={18} />
        <Saus aan={useOpgelost('O3-NIV-07')} />
        <group ref={sliert} position={[0.19, 0.2, 0]}>
          <Cil r={0.006} h={0.2} pos={[0.02, -0.08, 0]} rot={[0, 0, 0.2]} color="#f2d48a" seg={4} />
        </group>
      </group>
    </group>
  );
}

/** Tomatensaus die in de pan stijgt na het goede antwoord. */
function Saus({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3);
  return (
    <group position={[0, 0.02, 0]}>
      <group ref={ref}>
        <Cil r={0.185} h={0.18} pos={[0, 0.09, 0]} color="#c8352c" seg={18} />
      </group>
    </group>
  );
}

/** NIV-09: showroomkeuken "Leona" met apparatuur. Het prijskaartje is nog leeg; vooraf betaal je 2/5 deel. */
export function Showroomkeuken() {
  const eik = '#c8995e';
  const zwart = '#26292b';
  return (
    <group>
      {/* achterwand */}
      <Blok size={[2.8, 2.3, 0.1]} pos={[0, 1.15, -0.62]} color="#efe9df" r={0.03} />
      {/* onderkasten met grijs werkblad */}
      <Blok size={[2.0, 0.84, 0.6]} pos={[-0.35, 0.42, -0.27]} color={eik} r={0.03} />
      {[-1.05, -0.55, -0.05, 0.45].map((x) => (
        <Blok key={x} size={[0.02, 0.76, 0.01]} pos={[x + 0.2, 0.42, 0.035]} color="#a77a44" r={0.003} />
      ))}
      <Blok size={[2.06, 0.05, 0.64]} pos={[-0.35, 0.865, -0.27]} color="#8f979b" r={0.01} />
      {/* spoelbak en zwarte kraan */}
      <Blok size={[0.5, 0.02, 0.36]} pos={[-0.85, 0.89, -0.27]} color="#3b3f42" r={0.005} />
      <Cil r={0.018} h={0.34} pos={[-0.85, 1.06, -0.48]} color={zwart} seg={8} />
      <Blok size={[0.03, 0.03, 0.2]} pos={[-0.85, 1.22, -0.4]} color={zwart} r={0.01} />
      {/* kookplaat en schuine afzuigkap */}
      <Blok size={[0.6, 0.015, 0.45]} pos={[0.15, 0.895, -0.27]} color="#1b1d1e" r={0.004} />
      <Blok size={[0.62, 0.34, 0.42]} pos={[0.15, 1.75, -0.4]} rot={[0.45, 0, 0]} color={zwart} r={0.02} />
      {/* open bovenkastjes */}
      {[-0.95, -0.45].map((x) => (
        <group key={x} position={[x, 1.65, -0.45]}>
          <Blok size={[0.44, 0.04, 0.3]} pos={[0, -0.18, 0]} color={zwart} r={0.01} />
          <Blok size={[0.44, 0.04, 0.3]} pos={[0, 0.18, 0]} color={zwart} r={0.01} />
          <Blok size={[0.04, 0.4, 0.3]} pos={[-0.2, 0, 0]} color={zwart} r={0.01} />
          <Blok size={[0.04, 0.4, 0.3]} pos={[0.2, 0, 0]} color={zwart} r={0.01} />
          <Cil r={0.05} h={0.12} pos={[0.05, -0.1, 0]} color="#e9dcc3" seg={10} />
        </group>
      ))}
      {/* hoge kast met inbouwoven */}
      <Blok size={[0.62, 2.1, 0.6]} pos={[0.98, 1.05, -0.27]} color={eik} r={0.03} />
      <Blok size={[0.5, 0.42, 0.02]} pos={[0.98, 1.2, 0.035]} color={zwart} r={0.01} />
      <Blok size={[0.4, 0.2, 0.02]} pos={[0.98, 1.2, 0.045]} color="#3b4450" r={0.005} />
      {/* cactus met koksmuts, plantje, bananen */}
      <group position={[-0.25, 0.89, -0.3]}>
        <Cil r={0.06} rTop={0.07} h={0.08} pos={[0, 0.04, 0]} color="#c97a5a" seg={10} />
        <Cil r={0.035} h={0.2} pos={[0, 0.18, 0]} color="#4f8d3c" seg={8} />
        <Cil r={0.045} rTop={0.055} h={0.06} pos={[0, 0.31, 0]} color="#fbfaf6" seg={10} />
      </group>
      <mesh position={[-1.25, 1.0, -0.35]} castShadow material={mat('#5f9e3f', { flat: true })}>
        <icosahedronGeometry args={[0.12, 0]} />
      </mesh>
      <group position={[0.5, 0.91, -0.2]} rotation={[0, 0.4, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.02, i * 0.03]} rotation={[Math.PI / 2, 0, 0.3]} material={mat('#f2d04a')}>
            <torusGeometry args={[0.1, 0.018, 6, 10, 1.6]} />
          </mesh>
        ))}
      </group>
      {/* prijskaartje aan de kraan */}
      <group position={[-0.85, 1.2, -0.3]}>
        <Cil r={0.003} h={0.16} pos={[0, -0.06, 0]} color="#2f3634" seg={3} />
        <Label regels={['Keuken Leona', 'met apparatuur', '€ .....']} breed={0.42} hoog={0.3} pos={[0, -0.28, 0.01]} bg="#fffaf0" rand="#e48a3a" vet={0} />
      </group>
      {/* strook van 5 gelijke delen: 2 delen vooraf */}
      <group position={[-0.35, 0.89, -0.08]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Deel key={i} id={`vijfde${i + 1}`} uit={[0, i < 2 ? 0.35 : 0, i < 2 ? 0.3 : 0]} label={i < 2 ? '1/5 deel: vooraf' : '1/5 deel'}>
            <Blok size={[0.15, 0.04, 0.1]} pos={[-0.32 + i * 0.16, 0.02, 0]} color={i < 2 ? '#e48a3a' : '#e9dcc3'} r={0.01} />
          </Deel>
        ))}
      </group>
      <Label regels={['aanbetaling: 2/5 deel']} breed={0.7} hoog={0.12} pos={[-0.35, 0.65, 0.04]} bg="#fff6ee" rand="#e48a3a" />
    </group>
  );
}

// ─────────────────────────── Klus "Laadkade" ───────────────────────────

/** Bord in de maquette dat opkomt na het goede antwoord. */
function Parkeerplaats({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  return (
    <group position={[0.37, 0.84, -0.06]}>
      <group ref={ref}>
        <Cil r={0.008} h={0.36} pos={[0, 0.18, 0]} color="#2f3634" seg={5} />
        <Label regels={['Arnhem:', "56.250 auto's"]} breed={0.36} hoog={0.16} pos={[0, 0.4, 0]} bg="#f4f8fd" rand="#2f6ac0" vet={1} dubbel />
      </group>
    </group>
  );
}

/** NIV-04: maquette van Arnhem (150.000 inwoners). Op de rand staan 8 poppetjes: 3 hebben een auto. */
export function Maquette() {
  const huizen: [number, number, number, string][] = [
    [-0.62, -0.25, 0.16, '#d6c6ac'],
    [-0.42, -0.3, 0.22, '#cdbb9f'],
    [-0.22, -0.22, 0.14, '#e2d2b8'],
    [0.25, -0.28, 0.18, '#d9cbb3'],
    [0.45, -0.22, 0.24, '#cdbb9f'],
    [0.65, -0.3, 0.15, '#e2d2b8'],
    [-0.6, 0.0, 0.12, '#e2d2b8'],
    [0.6, 0.02, 0.2, '#d6c6ac'],
  ];
  return (
    <group>
      {/* tafel */}
      <Blok size={[1.8, 0.08, 1.15]} pos={[0, 0.76, 0]} color={P.hout} r={0.03} />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.07, 0.72, 0.07]} pos={[sx * 0.82, 0.36, sz * 0.5]} color={P.hout} r={0.02} />))}
      <group position={[0, 0.8, 0]}>
        <Blok size={[1.6, 0.04, 0.95]} pos={[0, 0.02, 0]} color="#a8c98a" r={0.02} />
        {/* rivier en brug */}
        <Blok size={[1.6, 0.012, 0.16]} pos={[0, 0.045, 0.16]} color="#5fa8c9" r={0.004} />
        <mesh position={[0.05, 0.05, 0.16]} rotation={[Math.PI / 2, 0, 0]} material={mat('#9fb3c0')}>
          <torusGeometry args={[0.1, 0.008, 4, 14, Math.PI]} />
        </mesh>
        <Blok size={[0.06, 0.01, 0.24]} pos={[0.05, 0.055, 0.16]} color="#8a8f92" r={0.003} />
        {huizen.map(([x, z, h, k], i) => (
          <Blok key={i} size={[0.14, h, 0.14]} pos={[x, 0.04 + h / 2, z]} color={k} r={0.015} />
        ))}
        {/* kerktoren */}
        <Blok size={[0.12, 0.42, 0.12]} pos={[0, 0.25, -0.25]} color="#c8b79f" r={0.015} />
        <mesh position={[0, 0.54, -0.25]} rotation={[0, Math.PI / 4, 0]} material={mat('#5b6b64')}>
          <coneGeometry args={[0.09, 0.18, 4]} />
        </mesh>
        <Label regels={['Arnhem', '150.000 inwoners']} breed={0.62} hoog={0.24} pos={[-0.0, 0.045, -0.1]} rot={[-Math.PI / 2, 0, 0]} bg="#fbfaf6" rand="#2f6ac0" vet={0} />
      </group>
      {/* 8 inwoners op de rand; 3 met een autootje */}
      <Deel id="inwoners" uit={[0, 0.25, 0.35]} label="3 op de 8 inwoners">
        {Array.from({ length: 8 }, (_, i) => {
          const x = -0.7 + i * 0.2;
          const auto = i === 1 || i === 4 || i === 6;
          return (
            <group key={i} position={[x, 0.84, 0.36]}>
              <Poppetje s={0.1} shirt={auto ? '#2f6ac0' : '#9aa3a8'} haar={i % 2 ? 'staart' : 'kort'} rot={0} />
              {auto && (
                <group position={[0.06, 0, -0.06]}>
                  <Blok size={[0.1, 0.035, 0.05]} pos={[0, 0.025, 0]} color="#e5675a" r={0.012} />
                  <Blok size={[0.05, 0.025, 0.045]} pos={[-0.01, 0.05, 0]} color="#3f4d58" r={0.01} />
                </group>
              )}
            </group>
          );
        })}
      </Deel>
      <Kaartje regels={['3 op de 8 inwoners', 'heeft een auto']} pos={[0, 0.8, 0.52]} breed={0.62} hoog={0.18} schuin={-1.2} kleur="#f4f8fd" rand="#2f6ac0" />
      <Parkeerplaats aan={useOpgelost('O3-NIV-04')} />
    </group>
  );
}

/** Schermpje op de pomp: na het goede antwoord staan de liters en het bedrag erop. */
function Pompscherm({ aan }: { aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  return (
    <group position={[0, 1.05, 0.195]}>
      <group ref={ref}>
        <Label regels={['45 liter', '€ 70,16']} breed={0.36} hoog={0.26} bg="#173d2a" fg="#7cff9a" rand={null} vet={1} />
      </group>
    </group>
  );
}

/** NIV-08: prijspaal bij de tankpomp (prijzen in cent per liter) met het bezorgkarretje dat tankt. */
export function Prijspaal() {
  const velden: [string, string, string][] = [
    ['Euro Liter', '252', '9'],
    ['V-Power Liter', '258', '1'],
    ['Diesel Liter', '155', '9'],
    ['V-Power Diesel', '182', '9'],
  ];
  const paal = druk(
    0.8,
    2.4,
    (ctx, w, h) => {
      ctx.fillStyle = '#1f4f9a';
      ctx.fillRect(0, 0, w, h);
      schrijf(ctx, 'TANK', w / 2, h * 0.055, h * 0.04, '#ffffff', { gewicht: 700, uitlijn: 'center' });
      velden.forEach(([naam, groot, klein], i) => {
        const y = h * (0.12 + i * 0.205);
        schrijf(ctx, naam, w / 2, y + h * 0.02, h * 0.026, '#ffffff', { gewicht: 700, uitlijn: 'center', max: w * 0.92 });
        ctx.fillStyle = '#f2d04a';
        rondRect(ctx, w * 0.07, y + h * 0.045, w * 0.86, h * 0.13, 10);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.font = `700 ${h * 0.085}px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(groot, w * 0.75, y + h * 0.115);
        ctx.font = `700 ${h * 0.045}px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.fillText(klein, w * 0.77, y + h * 0.085);
      });
      schrijf(ctx, 'prijzen in cent', w / 2, h * 0.955, h * 0.028, '#ffffff', { gewicht: 600, uitlijn: 'center' });
    },
    'w3-prijspaal',
    420,
  );
  return (
    <group>
      {/* prijspaal */}
      <group position={[-0.85, 0, -0.1]}>
        <Blok size={[0.95, 0.25, 0.4]} pos={[0, 0.125, 0]} color="#3b4442" r={0.04} />
        <Blok size={[0.9, 2.6, 0.22]} pos={[0, 1.55, 0]} color="#1f4f9a" r={0.05} />
        <Druk {...paal} rough={0.6} position={[0, 1.55, 0.112]}>
          <planeGeometry args={[0.8, 2.4]} />
        </Druk>
      </group>
      {/* pompeiland met pomp */}
      <Blok size={[0.9, 0.12, 1.4]} pos={[0.35, 0.06, 0]} color="#d9d3c6" r={0.03} />
      <group position={[0.35, 0.12, -0.25]}>
        <Blok size={[0.55, 1.35, 0.35]} pos={[0, 0.675, 0]} color="#f4f1ea" r={0.05} />
        <Blok size={[0.4, 0.3, 0.02]} pos={[0, 1.05, 0.18]} color="#2f3634" r={0.01} />
        <Pompscherm aan={useOpgelost('O3-NIV-08')} />
        <Blok size={[0.55, 0.12, 0.36]} pos={[0, 1.38, 0]} color="#e5675a" r={0.03} />
        <Blok size={[0.06, 0.2, 0.08]} pos={[0.3, 0.75, 0.05]} color="#2f3634" r={0.02} />
        <mesh position={[0.36, 0.55, 0.12]} rotation={[0, 0, 0.2]} material={mat('#2f3634')}>
          <torusGeometry args={[0.18, 0.015, 6, 14, Math.PI]} />
        </mesh>
      </group>
      {/* bezorgkarretje met een kaas op het dak */}
      <group position={[0.95, 0, 0.35]} rotation={[0, -0.2, 0]}>
        <Blok size={[0.6, 0.55, 1.1]} pos={[0, 0.48, 0]} color={P.wit} r={0.08} />
        <Blok size={[0.56, 0.3, 0.3]} pos={[0, 0.62, 0.42]} color={P.glas} r={0.05} />
        {[-0.3, 0.3].map((x) => [-0.35, 0.35].map((z) => <Cil key={`${x}${z}`} r={0.12} h={0.08} pos={[x, 0.12, z]} rot={[0, 0, Math.PI / 2]} color="#2c2f33" seg={12} />))}
        <Cil r={0.24} h={0.14} pos={[0, 0.85, -0.15]} color="#f2c24a" seg={18} />
        <Blok size={[0.02, 0.24, 0.5]} pos={[0.31, 0.5, -0.1]} color="#e48a3a" r={0.01} />
      </group>
    </group>
  );
}

/** Kleine schatkist die op het kruis opduikt na het goede antwoord. */
function Schatkist({ pos, aan }: { pos: V3; aan: boolean }) {
  const ref = useGroei(aan, 0.3, 'alle');
  return (
    <group position={pos}>
      <group ref={ref}>
        <Blok size={[0.12, 0.07, 0.08]} pos={[0, 0.035, 0]} color="#8a5a36" r={0.01} />
        <Blok size={[0.12, 0.03, 0.08]} pos={[0, 0.085, -0.01]} rot={[-0.5, 0, 0]} color="#7a4a2a" r={0.01} />
        <Bol pos={[0, 0.07, 0.01]} r={0.025} kleur="#f2c24a" />
        <Label regels={['60 m']} breed={0.14} hoog={0.06} pos={[0, 0.17, 0]} bg="#fff6e2" rand="#7a3b1f" dubbel />
      </group>
    </group>
  );
}

/** NIV-10: schatkaart op een tafel bij de kade. Schaal 1 : 500; start en schatkist liggen 12 cm uit elkaar. */
export function Schatkaart() {
  const KB = 1.3;
  const KD = 0.84;
  const cm = KB / 16;
  const papegaai = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (papegaai.current) papegaai.current.rotation.x = Math.max(0, Math.sin(clock.getElapsedTime() * 2.4)) * 0.4;
  });
  const kaart = druk(
    KB,
    KD,
    (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.65);
      g.addColorStop(0, '#f3e4c2');
      g.addColorStop(1, '#d9bf8c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // water met golfjes
      ctx.fillStyle = '#bcd9d6';
      ctx.fillRect(w * 0.04, h * 0.05, w * 0.92, h * 0.9);
      ctx.strokeStyle = '#8fbdb8';
      ctx.lineWidth = 3;
      for (let i = 0; i < 14; i++) {
        const x = w * (0.08 + ((i * 0.37) % 0.85));
        const y = h * (0.1 + ((i * 0.53) % 0.8));
        ctx.beginPath();
        ctx.arc(x, y, 8, Math.PI, 0);
        ctx.arc(x + 16, y, 8, Math.PI, 0);
        ctx.stroke();
      }
      // eiland
      ctx.fillStyle = '#e8d29c';
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const r = 1 + Math.sin(a * 5) * 0.06 + Math.cos(a * 3) * 0.05;
        ctx.lineTo(w * 0.5 + Math.cos(a) * w * 0.4 * r, h * 0.5 + Math.sin(a) * h * 0.36 * r);
      }
      ctx.fill();
      ctx.strokeStyle = '#a4875a';
      ctx.lineWidth = 4;
      ctx.stroke();
      // dennenbomen en heuvels
      [
        [0.3, 0.3],
        [0.38, 0.25],
        [0.62, 0.28],
        [0.7, 0.36],
        [0.5, 0.7],
      ].forEach(([x, y]) => {
        ctx.fillStyle = '#4a7a3a';
        ctx.beginPath();
        ctx.moveTo(w * x, h * y - 26);
        ctx.lineTo(w * x - 16, h * y + 14);
        ctx.lineTo(w * x + 16, h * y + 14);
        ctx.fill();
      });
      ctx.strokeStyle = '#8a6a3a';
      ctx.lineWidth = 4;
      for (const [x, y] of [
        [0.52, 0.32],
        [0.58, 0.66],
      ]) {
        ctx.beginPath();
        ctx.arc(w * x, h * y + 14, 22, Math.PI, 0);
        ctx.stroke();
      }
      // stippellijn van start naar kruis: 12 cm
      const sx = w * 0.5 - (12 * w) / 16 / 2;
      const ex = sx + (12 * w) / 16;
      const y = h * 0.5;
      ctx.setLineDash([14, 10]);
      ctx.strokeStyle = '#7a3b1f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(ex, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#2f5d46';
      ctx.beginPath();
      ctx.arc(sx, y, 12, 0, Math.PI * 2);
      ctx.fill();
      schrijf(ctx, 'start', sx, y + 34, h * 0.06, '#2f3634', { gewicht: 700, uitlijn: 'center' });
      ctx.strokeStyle = '#d8433a';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(ex - 16, y - 16);
      ctx.lineTo(ex + 16, y + 16);
      ctx.moveTo(ex + 16, y - 16);
      ctx.lineTo(ex - 16, y + 16);
      ctx.stroke();
      // kompasroos
      const kx = w * 0.12;
      const ky = h * 0.2;
      ctx.fillStyle = '#7a3b1f';
      ctx.beginPath();
      ctx.moveTo(kx, ky - 40);
      ctx.lineTo(kx + 10, ky);
      ctx.lineTo(kx, ky + 40);
      ctx.lineTo(kx - 10, ky);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(kx - 40, ky);
      ctx.lineTo(kx, ky + 10);
      ctx.lineTo(kx + 40, ky);
      ctx.lineTo(kx, ky - 10);
      ctx.fill();
      schrijf(ctx, 'N', kx, ky - 56, h * 0.06, '#7a3b1f', { gewicht: 700, uitlijn: 'center' });
      // schaal
      schrijf(ctx, 'Schaal 1 : 500', w * 0.8, h * 0.88, h * 0.075, '#3b2414', { gewicht: 700, uitlijn: 'center' });
      ctx.fillStyle = '#3b2414';
      ctx.fillRect(w * 0.66, h * 0.925, w * 0.28, 4);
    },
    'w3-schatkaart',
    640,
  );
  return (
    <group>
      <Blok size={[KB + 0.2, 0.08, KD + 0.2]} pos={[0, 0.78, 0]} color="#6e4a2e" r={0.03} />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.08, 0.74, 0.08]} pos={[sx * (KB / 2), 0.37, sz * (KD / 2)]} color="#6e4a2e" r={0.02} />))}
      <Deel id="kaart" uit={[0, 0.45, 0]} label="Schatkaart, schaal 1 : 500">
        <Druk {...kaart} rough={0.95} position={[0, 0.825, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[KB, KD]} />
        </Druk>
        <Maat van={[-6 * cm, 0.84, 0.0]} naar={[6 * cm, 0.84, 0.0]} label="12 cm" />
        {/* liniaal van 12 cm */}
        <Blok size={[12 * cm + 0.06, 0.012, 0.05]} pos={[0, 0.835, 0.07]} color="#f2d04a" r={0.004} />
        <Schatkist pos={[6 * cm, 0.83, 0]} aan={useOpgelost('O3-NIV-10')} />
        {/* kaartrol met papegaai */}
        <group position={[0, 0.86, -KD / 2 - 0.02]}>
          <Cil r={0.05} h={KB} rot={[0, 0, Math.PI / 2]} color="#e8d5a8" seg={14} />
          <group position={[KB * 0.32, 0.05, 0]}>
            <group ref={papegaai}>
              <mesh position={[0, 0.12, 0]} scale={[0.8, 1.3, 0.8]} castShadow material={mat('#2f9a4a')}>
                <sphereGeometry args={[0.07, 12, 10]} />
              </mesh>
              <Bol pos={[0, 0.25, 0.02]} r={0.05} kleur="#d8433a" />
              <mesh position={[0, 0.24, 0.07]} rotation={[Math.PI / 2, 0, 0]} material={mat('#f2c24a')}>
                <coneGeometry args={[0.018, 0.05, 6]} />
              </mesh>
              <Blok size={[0.05, 0.1, 0.02]} pos={[0, 0.03, -0.06]} rot={[0.4, 0, 0]} color="#3d7cc9" r={0.01} />
            </group>
          </group>
        </group>
      </Deel>
    </group>
  );
}
