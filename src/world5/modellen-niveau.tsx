// Wereld 5 – modellen voor "Zelf doen" (niveau, de drie klussen).
// Wandmodellen: z = 0 is de muur, alles staat ervoor (z ≥ 0). Vloermodellen staan rond de oorsprong.
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Maat } from '../game/inspectie';
import { useGroei, useOpgelost } from '../game/opgelost';
import { Blok, Cil, mat } from '../game/kit';
import { Bordje } from '../game/tekst';
import { nl } from '../lib/getal';
import { ctxVan, getal, itemsVan, kolommenVan, rijenVan } from './data5';
import { Beeld, opScherm, Scherm, useScherm } from './scherm';
import { alinea, grafiekVlak, legenda, licht, lijn, pijl, regels, ROND, streep, tabel, taart, tekst, verloop, vlak, VPM, type C } from './teken';

type V3 = [number, number, number];
const LED = `'Courier New', 'Consolas', monospace`;

// ───────────────────────── NIV-01: stukadoor (prikbord met ruitjespapier) ─────────────────────────

const STUC = { x: 250, y: 190, pb: 880, ph: 580 };

function Stukadoortje({ pos }: { pos: V3 }) {
  return (
    <group position={pos} rotation={[0, -0.5, 0]}>
      {[-0.09, 0.09].map((x) => (
        <Blok key={x} size={[0.12, 0.62, 0.14]} pos={[x, 0.31, 0]} color="#e9ecef" r={0.04} />
      ))}
      <Blok size={[0.38, 0.5, 0.22]} pos={[0, 0.86, 0]} color="#f8f9fa" r={0.08} />
      <mesh position={[0, 1.24, 0]} material={mat('#f1c9a5')}>
        <sphereGeometry args={[0.13, 14, 10]} />
      </mesh>
      <Cil r={0.14} h={0.07} pos={[0, 1.34, 0]} color="#f59f00" seg={14} />
      <Blok size={[0.09, 0.42, 0.09]} pos={[0.24, 0.98, 0.12]} rot={[-0.9, 0, 0]} color="#f8f9fa" r={0.03} />
      <Blok size={[0.32, 0.02, 0.16]} pos={[0.24, 1.18, 0.34]} color="#9aa3a8" r={0.01} />
      <Blok size={[0.04, 0.08, 0.04]} pos={[0.24, 1.15, 0.3]} color="#7a4a2a" r={0.01} />
    </group>
  );
}

/** Na het goede antwoord ligt er een witte stuclaag op het plafond. */
function Stuclaag() {
  const ref = useGroei(useOpgelost('O5-NIV-01'), 0.3, 'alle');
  return (
    <group position={[0, 0.81, 0]}>
      <group ref={ref}>
        <Blok size={[1.98, 0.02, 0.58]} color="#fbfaf6" r={0.008} />
      </group>
    </group>
  );
}

/** NIV-01: prikbord met een grafiek op ruitjespapier; ervoor een plafondplaat (3 × 10 m) op bokken. */
export function Stukadoor() {
  const id = 'O5-NIV-01';
  const rijen = rijenVan(id);
  const b = 3.2;
  const h = 2.4;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#c89b6a');
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(90,55,25,0.22)' : 'rgba(255,240,210,0.2)';
      ctx.fillRect((i * 97) % W, (i * 57 + (i % 13) * 31) % H, 6, 5);
    }
    const px0 = 60;
    const py0 = 40;
    vlak(ctx, px0 + 8, py0 + 10, W - 2 * px0, H - 2 * py0, 'rgba(0,0,0,0.25)');
    vlak(ctx, px0, py0, W - 2 * px0, H - 2 * py0, '#fdfdf8');
    for (let x = px0; x <= W - px0; x += 20) streep(ctx, x, py0, x, H - py0, '#d8e6f2', 1.5);
    for (let y = py0; y <= H - py0; y += 20) streep(ctx, px0, y, W - px0, y, '#d8e6f2', 1.5);
    tekst(ctx, 'Stukadoor Heijkema', W / 2, 92, { px: 52, kleur: '#1f2a24', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Prijs per vierkante meter', W / 2, 146, { px: 38, kleur: '#495057', gewicht: 600, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: STUC.x,
      y: STUC.y,
      b: STUC.pb,
      h: STUC.ph,
      ya: { min: 0, max: 700, stap: 100, fijn: 25, label: (v) => `€ ${v}` },
      xa: { min: 0, max: 40, stap: 5 },
      xTitel: 'Aantal vierkante meter',
      px: 34,
      kleur: { raster: '#7d8a96', fijn: '#c9d3dc', as: '#1f2a24' },
      yLabelB: 120,
    });
    lijn(ctx, rijen.map((r) => [g.X(Number(r[0])), g.Y(getal(r[1]))]), '#d6202a', 9);
    void H;
  };
  const p = opScherm(b, h);
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="stukadoor" pos={[0, 1.65, 0.06]} rand={0.07} diep={0.06} kleur="#7a4a2a" licht={false}>
        {[
          [80, 70],
          [W_(b) - 80, 70],
        ].map(([x, y]) => (
          <mesh key={x} position={p(x, y, 0.03)} material={mat('#d6202a', { rough: 0.3 })}>
            <sphereGeometry args={[0.04, 10, 8]} />
          </mesh>
        ))}
      </Scherm>
      {/* plafondplaat op twee bokken */}
      <group position={[-0.45, 0, 1.05]}>
        {[-0.75, 0.75].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Blok size={[0.06, 0.72, 0.06]} pos={[0, 0.36, -0.22]} rot={[0.25, 0, 0]} color="#c48a52" r={0.02} />
            <Blok size={[0.06, 0.72, 0.06]} pos={[0, 0.36, 0.22]} rot={[-0.25, 0, 0]} color="#c48a52" r={0.02} />
            <Blok size={[0.1, 0.06, 0.7]} pos={[0, 0.72, 0]} color="#c48a52" r={0.02} />
          </group>
        ))}
        <Blok size={[2.0, 0.05, 0.6]} pos={[0, 0.78, 0]} color="#9a948b" r={0.015} />
        <Stuclaag />
        <Maat van={[-1.0, 0.82, 0.38]} naar={[1.0, 0.82, 0.38]} label="10 m" />
        <Maat van={[1.08, 0.82, -0.3]} naar={[1.08, 0.82, 0.3]} label="3 m" />
      </group>
      <Stukadoortje pos={[1.85, 0, 0.7]} />
    </group>
  );
}
const W_ = (b: number) => b * VPM;

// ───────────────────────── NIV-02: wisselkantoor (LED-bord) ─────────────────────────

function vlag(ctx: C, land: string, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (land === 'Amerika') {
    for (let i = 0; i < 7; i++) vlak(ctx, x, y + (i * h) / 7, w, h / 7, i % 2 ? '#ffffff' : '#c8102e');
    vlak(ctx, x, y, w * 0.45, h * 0.57, '#1f3a8a');
    for (let i = 0; i < 6; i++) vlak(ctx, x + 6 + (i % 3) * 12, y + 6 + Math.floor(i / 3) * 14, 5, 5, '#ffffff');
  } else if (land === 'Engeland') {
    vlak(ctx, x, y, w, h, '#1f3a8a');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = h * 0.22;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();
    vlak(ctx, x + w * 0.4, y, w * 0.2, h, '#ffffff');
    vlak(ctx, x, y + h * 0.35, w, h * 0.3, '#ffffff');
    vlak(ctx, x + w * 0.45, y, w * 0.1, h, '#c8102e');
    vlak(ctx, x, y + h * 0.42, w, h * 0.16, '#c8102e');
  } else if (land === 'Zwitserland') {
    vlak(ctx, x, y, w, h, '#d52b1e');
    vlak(ctx, x + w * 0.42, y + h * 0.2, w * 0.16, h * 0.6, '#ffffff');
    vlak(ctx, x + w * 0.3, y + h * 0.4, w * 0.4, h * 0.2, '#ffffff');
  } else if (land === 'Turkije') {
    vlak(ctx, x, y, w, h, '#e30a17');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w * 0.38, y + h / 2, h * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e30a17';
    ctx.beginPath();
    ctx.arc(x + w * 0.44, y + h / 2, h * 0.24, 0, Math.PI * 2);
    ctx.fill();
    vlak(ctx, x + w * 0.6, y + h * 0.42, h * 0.16, h * 0.16, '#ffffff');
  } else {
    vlak(ctx, x, y, w, h / 2, '#de3831');
    vlak(ctx, x, y + h / 2, w, h / 2, '#002395');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.45, y + h * 0.5);
    ctx.lineTo(x, y + h);
    ctx.fill();
    vlak(ctx, x + w * 0.3, y + h * 0.36, w * 0.7, h * 0.28, '#ffffff');
    vlak(ctx, x + w * 0.34, y + h * 0.4, w * 0.66, h * 0.2, '#007a4d');
    ctx.fillStyle = '#007a4d';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.06);
    ctx.lineTo(x + w * 0.4, y + h * 0.5);
    ctx.lineTo(x, y + h * 0.94);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.2);
    ctx.lineTo(x + w * 0.26, y + h * 0.5);
    ctx.lineTo(x, y + h * 0.8);
    ctx.fill();
  }
  ctx.restore();
  rand(ctx, x, y, w, h);
}
function rand(ctx: C, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

/** Na het goede antwoord liggen er euro's op het loket. */
function Bankbiljetten() {
  const ref = useGroei(useOpgelost('O5-NIV-02'), 0.2, 'alle');
  return (
    <group position={[0.7, 0.95, 0.05]}>
      <group ref={ref}>
        {['#7fb3d5', '#f5b041', '#82e0aa'].map((k, i) => (
          <Blok key={k} size={[0.3, 0.015, 0.16]} pos={[i * 0.03, 0.01 + i * 0.016, 0]} rot={[0, i * 0.25, 0]} color={k} r={0.004} />
        ))}
      </group>
    </group>
  );
}

/** NIV-02: wisselkantoor met een bord met rode LED-cijfers en een loket ervoor. */
export function Wisselkantoor() {
  const id = 'O5-NIV-02';
  const rijen = rijenVan(id);
  const items = itemsVan(id);
  const item = (l: string) => String(items.find((i) => i.label === l)?.waarde ?? '');
  const b = 3.0;
  const h = 2.2;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#0b1a33');
    const led = (s: string, x: number, y: number, px: number, uitlijn: CanvasTextAlign = 'left') => {
      ctx.save();
      ctx.shadowColor = '#ff2d20';
      ctx.shadowBlur = px * 0.35;
      tekst(ctx, s, x, y, { px, kleur: '#ff4136', gewicht: 700, uitlijn, font: LED });
      ctx.restore();
    };
    tekst(ctx, 'Tijd:', 40, 55, { px: 38, kleur: '#cfd8e3' });
    led(item('Tijd'), 150, 57, 50);
    tekst(ctx, 'Datum:', 560, 55, { px: 38, kleur: '#cfd8e3' });
    led(item('Datum'), 720, 57, 50);
    vlak(ctx, 0, 105, W, 72, '#1f5fbf');
    tekst(ctx, '10 euro =', 40, 142, { px: 46, kleur: '#ffffff', gewicht: 700 });
    const rh = 118;
    rijen.forEach((r, i) => {
      const y = 245 + i * rh;
      if (i % 2) vlak(ctx, 0, y - rh / 2, W, rh, 'rgba(255,255,255,0.04)');
      vlag(ctx, String(r[0]), 40, y - 32, 96, 64);
      tekst(ctx, String(r[0]), 165, y, { px: 42, kleur: '#ffffff', gewicht: 600, max: 330 });
      led(String(r[1]), 820, y + 2, 64, 'right');
      tekst(ctx, String(r[2]), 850, y, { px: 34, kleur: '#cfd8e3', gewicht: 600, max: W - 870 });
    });
    vlak(ctx, 0, H - 92, W, 72, '#1f5fbf');
    tekst(ctx, `Wisselkosten: ${item('Wisselkosten')}`, W / 2, H - 56, { px: 46, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="wisselkantoor" pos={[0, 1.95, 0.08]} rand={0.08} diep={0.08} kleur="#1b2b45" />
      {/* loket */}
      <group position={[0, 0, 0.85]}>
        <Blok size={[2.4, 0.9, 0.5]} pos={[0, 0.45, 0]} color="#3f5f7f" r={0.05} />
        <Blok size={[2.5, 0.05, 0.6]} pos={[0, 0.92, 0]} color="#d9d3c7" r={0.02} />
        <Blok size={[2.3, 0.45, 0.03]} pos={[0, 1.18, -0.2]} color="#cfe9f5" r={0.01} opacity={0.35} />
        <Bordje regels={['WISSELKANTOOR']} breed={1.4} hoog={0.24} pos={[0, 0.62, 0.26]} bg="#fbfaf6" fg="#1f5fbf" rand={null} />
        <Bankbiljetten />
      </group>
    </group>
  );
}

// ───────────────────────── NIV-03: huishoudens in Groningen ─────────────────────────

const GRO_KLEUR: Record<string, string> = { donkergroen: '#3d6b22', groen: '#7cb342', geelgroen: '#c9c93a', geel: '#ffd54f', oranje: '#f39c12' };
const GRO = { x: 235, y: 95, pb: 680, ph: 455 };

/** NIV-03: twee schermen onder één kop: lijngrafiek (aantal huishoudens) en cirkeldiagram (verdeling). */
export function Huishoudens() {
  const id = 'O5-NIV-03';
  const lijnRijen = rijenVan(id, 0);
  const taartRijen = rijenVan(id, 1);
  const b = 2.4;
  const h = 2.0;
  const kop = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#a3195b');
    tekst(ctx, 'Huishoudens in Groningen', W / 2, H / 2, { px: 96, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
  };
  const links = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#d6e8f5');
    tekst(ctx, 'Aantal huishoudens in Groningen', W / 2, 44, { px: 40, kleur: '#a3195b', gewicht: 700, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: GRO.x,
      y: GRO.y,
      b: GRO.pb,
      h: GRO.ph,
      ya: { min: 100000, max: 125000, stap: 5000, fijn: 1000, label: (v) => nl(v), titel: 'Aantal huishoudens' },
      xa: { min: -0.4, max: lijnRijen.length - 0.6, stap: 1 },
      xLabels: lijnRijen.map((r, i) => ({ v: i, t: String(r[0]) })),
      schuin: true,
      xRaster: false,
      px: 30,
      kleur: { achter: '#ffffff', raster: '#d6589a', fijn: '#cfd4d9', as: '#1f2a24' },
      yLabelB: 130,
    });
    lijn(ctx, lijnRijen.map((r, i) => [g.X(i), g.Y(Number(r[1]))]), '#5d9c2f', 8, 9);
    void H;
  };
  const rechts = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#d6e8f5');
    regels(ctx, 'Verdeling huishoudens\nGroningen 1-1-2016', W / 2, 56, { px: 40, kleur: '#a3195b', gewicht: 700, uitlijn: 'center' });
    taart(
      ctx,
      W / 2,
      360,
      180,
      taartRijen.map((r) => ({ v: getal(r[1]), kleur: GRO_KLEUR[String(r[2])], label: String(r[1]) })),
      { px: 42, buitenOnder: 0.06, tekstKleur: (k) => (licht(k) ? '#1f2a24' : '#ffffff') },
    );
    legenda(ctx, 150, 590, taartRijen.map((r) => ({ kleur: GRO_KLEUR[String(r[2])], t: String(r[0]) })), { px: 32, rijH: 42, max: 640 });
    void H;
  };
  return (
    <group>
      <Scherm b={5.0} h={0.42} teken={kop} sleutel="groningen-kop" pos={[0, 2.78, 0.08]} rand={0.05} diep={0.08} kleur="#5a0f33" />
      <Scherm b={b} h={h} teken={links} sleutel="groningen-lijn" pos={[-1.25, 1.42, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      <Scherm b={b} h={h} teken={rechts} sleutel="groningen-taart" pos={[1.25, 1.42, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      <Blok size={[0.08, 0.04, 0.04]} pos={[0, 1.6, 0.14]} color="#ffd43b" r={0.01} />
    </group>
  );
}

// ───────────────────────── NIV-04: frisdrank A of B ─────────────────────────

const DRANK_KLEUR = ['#5cb85c', '#f49ac2', '#5bc0de', '#f7dc6f', '#f0ad4e'];
const ML = { y0: 0.14, perMl: 0.0011 };

/** NIV-04: nieuwsscherm met het artikel en twee maatbuizen (A en B) met lagen drank naast een maatlat. */
export function Frisdrank() {
  const id = 'O5-NIV-04';
  const artikel = ctxVan(id, 0);
  const staven = rijenVan(id, 1);
  const lagen = staven.filter((r) => String(r[0]) !== 'Totaal');
  const art = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    vlak(ctx, 0, 0, W, 78, '#c92a2a');
    tekst(ctx, 'NIEUWS', 34, 40, { px: 46, kleur: '#ffffff', gewicht: 700, font: ROND });
    let y = alinea(ctx, artikel.titel ?? '', 34, 104, W - 68, { px: 50, gewicht: 700, kleur: '#1f2a24', regelH: 58 });
    y = alinea(ctx, artikel.beschrijving, 34, y + 22, W - 68, { px: 33, kleur: '#343a40', regelH: 44 });
    void H;
    void y;
  };
  const latH = 2.36;
  const lat = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#fbfaf6');
    const yv = (ml: number) => H - (ML.y0 - 0.1 + ml * ML.perMl) * VPM;
    for (let ml = 0; ml <= 2000; ml += 50) {
      const groot = ml % 200 === 0;
      streep(ctx, 0, yv(ml), groot ? 70 : ml % 100 === 0 ? 45 : 28, yv(ml), '#1f2a24', groot ? 4 : 2.5);
      streep(ctx, W, yv(ml), W - (groot ? 70 : ml % 100 === 0 ? 45 : 28), yv(ml), '#1f2a24', groot ? 4 : 2.5);
      if (groot) tekst(ctx, String(ml), W / 2, yv(ml), { px: 36, kleur: '#1f2a24', gewicht: 700, uitlijn: 'center' });
    }
    tekst(ctx, 'ml', W / 2, 30, { px: 36, kleur: '#495057', gewicht: 700, uitlijn: 'center' });
  };
  const leg = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'ml per dag', 30, 44, { px: 38, gewicht: 700 });
    legenda(
      ctx,
      30,
      110,
      lagen.map((r, i) => ({ kleur: DRANK_KLEUR[i], t: String(r[0]).replace(/ \(.*\)/, '') })),
      { px: 38, rijH: 60, max: W - 90 },
    );
    void H;
  };
  const buis = (x: number, kol: number, letter: string) => {
    let y = ML.y0;
    return (
      <group position={[x, 0, 0]}>
        {lagen.map((r, i) => {
          const hh = Number(r[kol]) * ML.perMl;
          const m = <Cil key={i} r={0.165} h={hh} pos={[0, y + hh / 2, 0]} color={DRANK_KLEUR[i]} seg={20} />;
          y += hh;
          return m;
        })}
        <mesh position={[0, ML.y0 + 1.15, 0]} material={mat('#e6f6fb', { opacity: 0.28, rough: 0.1 })}>
          <cylinderGeometry args={[0.19, 0.19, 2.3, 22, 1, true]} />
        </mesh>
        <Bordje regels={[letter]} breed={0.28} hoog={0.28} pos={[0, 0.07, 0.2]} bg="#1f2a24" fg="#ffffff" rand={null} groot={0.8} />
      </group>
    );
  };
  const latTex = useScherm(0.42, latH, lat, 'frisdrank-maatlat');
  return (
    <group>
      <Scherm b={2.0} h={2.3} teken={art} sleutel="frisdrank-artikel" pos={[-1.35, 1.6, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      {/* maatbuizen op een plaat, de maatlat staat ertussen op dezelfde diepte */}
      <group position={[1.1, 0, 0.5]}>
        <Blok size={[1.5, 0.14, 0.55]} pos={[0, 0.07, 0]} color="#3a4249" r={0.04} />
        {buis(-0.45, 1, 'A')}
        {buis(0.45, 2, 'B')}
        <group position={[0, ML.y0 - 0.1 + latH / 2, 0]}>
          <Blok size={[0.46, latH + 0.04, 0.03]} pos={[0, 0, -0.02]} color="#9aa3a8" r={0.01} />
          <Beeld b={0.42} h={latH} tex={latTex} pos={[0, 0, 0.0]} licht={false} />
        </group>
      </group>
      <Scherm b={0.95} h={1.45} teken={leg} sleutel="frisdrank-legenda" pos={[2.45, 1.75, 0.08]} rand={0.05} diep={0.06} kleur="#2f353b" />
    </group>
  );
}

// ───────────────────────── NIV-05: energie (grote tablet op een bureau) ─────────────────────────

const ENERGIE_KLEUR: Record<string, string> = { lichtblauw: '#74c0fc', roze: '#f783ac', groen: '#69db7c', paars: '#9775fa', donkerblauw: '#1c4e9c' };

/** De lamp boven het bureau gaat aan na het goede antwoord. */
function Bureaulicht() {
  const aan = useOpgelost('O5-NIV-05');
  const kegel = useGroei(aan, 0.1);
  return (
    <group position={[-1.55, 2.05, 0.1]}>
      <mesh material={aan ? mat('#fff6d6', { emissive: '#ffd56b', rough: 0.3 }) : mat('#6b6255', { rough: 0.5 })}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>
      <group ref={kegel} position={[0, 0, 0]}>
        <mesh position={[0, -0.6, 0]} material={mat('#fff3bf', { opacity: 0.18, emissive: '#ffe066' })}>
          <coneGeometry args={[0.55, 1.2, 20, 1, true]} />
        </mesh>
      </group>
    </group>
  );
}

/** NIV-05: bureau met een grote tablet (cirkeldiagram energieverbruik), een lamp en de rekening. */
export function Energie() {
  const id = 'O5-NIV-05';
  const rijen = rijenVan(id);
  const b = 2.2;
  const h = 1.36;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#f8f9fa');
    regels(ctx, 'Verdeling energieverbruik 2016\nFamilie Groenendijk', W / 2, 62, { px: 36, kleur: '#1f2a24', gewicht: 700, uitlijn: 'center' });
    taart(
      ctx,
      235,
      300,
      165,
      rijen.map((r) => ({ v: getal(r[1]), kleur: ENERGIE_KLEUR[String(r[2])], label: String(r[1]) })),
      { px: 36, buitenOnder: 0.04, tekstKleur: (k) => (licht(k) ? '#1f2a24' : '#ffffff') },
    );
    legenda(ctx, 450, 175, rijen.map((r) => ({ kleur: ENERGIE_KLEUR[String(r[2])], t: String(r[0]) })), { px: 30, rijH: 58, max: W - 500 });
    vlak(ctx, 0, H - 60, W, 60, '#343a40');
    ['◔', '◕', '▦', '✦', '≡'].forEach((s, i) => tekst(ctx, s, W / 2 + (i - 2) * 110, H - 30, { px: 34, kleur: '#ffffff', uitlijn: 'center' }));
  };
  const rekening = useScherm(0.5, 0.34, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Energierekening 2016', 16, 34, { px: 26, gewicht: 700 });
    tekst(ctx, 'Familie Groenendijk', 16, 70, { px: 20, kleur: '#495057' });
    streep(ctx, 16, 92, W - 16, 92, '#ced4da', 2);
    tekst(ctx, 'Totaal:', 16, 118, { px: 26, gewicht: 600 });
    tekst(ctx, '€ 2.200', W - 16, 118, { px: 30, gewicht: 700, uitlijn: 'right' });
    void H;
  }, 'energie-rekening');
  const tilt = -0.75;
  return (
    <group>
      {/* bureau */}
      <Blok size={[2.5, 0.07, 1.0]} pos={[0, 0.76, 0]} color="#b98d55" r={0.03} />
      {[-1.15, 1.15].map((x) => (
        <Blok key={x} size={[0.08, 0.74, 0.86]} pos={[x, 0.37, 0]} color="#7a5a3c" r={0.03} />
      ))}
      {/* tablet op een standaard */}
      <Blok size={[0.5, 0.1, 0.3]} pos={[0, 0.84, -0.2]} color="#343a40" r={0.03} />
      <group position={[0, 1.3, -0.12]} rotation={[tilt, 0, 0]}>
        <Blok size={[b + 0.14, h + 0.14, 0.05]} pos={[0, 0, -0.027]} color="#1f2328" r={0.06} />
        <Scherm b={b} h={h} teken={teken} sleutel="energie-tablet" rand={0} />
      </group>
      <Beeld b={0.5} h={0.34} tex={rekening} pos={[0.9, 0.8, 0.36]} rot={[-Math.PI / 2, 0, 0.2]} licht={false} />
      {/* staande lamp naast het bureau */}
      <group position={[-1.55, 0, 0.1]}>
        <Cil r={0.18} h={0.05} pos={[0, 0.025, 0]} color="#2f3634" seg={14} />
        <Cil r={0.02} h={2.1} pos={[0, 1.05, 0]} color="#2f3634" seg={6} />
      </group>
      <Cil r={0.07} rTop={0.3} h={0.28} pos={[-1.55, 2.18, 0.1]} color="#f2c94c" seg={16} />
      <Bureaulicht />
    </group>
  );
}

// ───────────────────────── NIV-06: autoverhuur Habraken ─────────────────────────

const HAB = { x: 230, y: 205, pb: 1000, ph: 560 };

function Autootje({ b, h, punten, rijdt }: { b: number; h: number; punten: [number, number][]; rijdt: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const p = opScherm(b, h);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const n = punten.length - 1;
    const t = rijdt ? (clock.getElapsedTime() * 0.12) % (n + 1) : 0;
    const seg = Math.min(n - 1, Math.floor(t));
    const f = Math.min(1, Math.max(0, (t - seg) * 1.6 - 0.3));
    const [x1, y1] = punten[seg];
    const [x2, y2] = punten[seg + 1];
    const [lx, ly] = p(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f);
    ref.current.position.set(lx, ly + 0.13, 0.08);
    ref.current.rotation.z = Math.atan2((y1 - y2) / VPM, (x2 - x1) / VPM);
  });
  return (
    <group ref={ref}>
      <Blok size={[0.3, 0.08, 0.12]} pos={[0, 0, 0]} color="#ffffff" r={0.03} />
      <Blok size={[0.16, 0.07, 0.11]} pos={[-0.02, 0.07, 0]} color="#cfe9f5" r={0.03} />
      {[-0.1, 0.1].map((x) => (
        <Cil key={x} r={0.04} h={0.13} pos={[x, -0.04, 0]} rot={[Math.PI / 2, 0, 0]} color="#2f3634" seg={10} />
      ))}
    </group>
  );
}

/** NIV-06: scherm bij de verhuurbalie met een oranje vaandel; een autootje rijdt over de lijn. */
export function Autoverhuur() {
  const id = 'O5-NIV-06';
  const rijen = rijenVan(id);
  const b = 3.4;
  const h = 2.2;
  const X = (d: number) => HAB.x + (d / 4) * HAB.pb;
  const Y = (e: number) => HAB.y + HAB.ph - (e / 250) * HAB.ph;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#f6f7f8');
    vlak(ctx, 0, 0, W, 118, '#f08c00');
    ctx.fillStyle = '#f08c00';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, 118);
    ctx.lineTo(W / 2 + 120, 118);
    ctx.lineTo(W / 2, 150);
    ctx.fill();
    tekst(ctx, 'Autoverhuur Habraken', W / 2, 62, { px: 58, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Kosten huur personenauto', W - 40, 175, { px: 36, kleur: '#343a40', gewicht: 700, uitlijn: 'right' });
    const g = grafiekVlak(ctx, {
      x: HAB.x,
      y: HAB.y,
      b: HAB.pb,
      h: HAB.ph,
      ya: { min: 0, max: 250, stap: 50, fijn: 10, label: (v) => `€ ${v}` },
      xa: { min: 0, max: 4, stap: 1 },
      xTitel: 'Aantal dagen',
      xRaster: false,
      px: 34,
      kleur: { achter: '#d3d9de', raster: '#ffffff', fijn: 'rgba(255,255,255,0.7)', as: '#343a40', tekst: '#343a40' },
      yLabelB: 100,
    });
    lijn(ctx, rijen.map((r) => [g.X(Number(r[0])), g.Y(getal(r[1]))]), '#f08c00', 10, 11);
    void H;
  };
  const punten = rijen.map((r) => [X(Number(r[0])), Y(getal(r[1]))] as [number, number]);
  const rijdt = useOpgelost(id);
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="habraken" pos={[0, 1.85, 0.08]} rand={0.08} diep={0.08}>
        <Autootje b={b} h={h} punten={punten} rijdt={rijdt} />
      </Scherm>
      {/* verhuurbalie */}
      <group position={[0.6, 0, 0.95]}>
        <Blok size={[1.7, 0.95, 0.5]} pos={[0, 0.475, 0]} color="#f08c00" r={0.05} />
        <Blok size={[1.8, 0.05, 0.6]} pos={[0, 0.97, 0]} color="#fbfaf6" r={0.02} />
        <Bordje regels={['VERHUUR']} breed={1.0} hoog={0.24} pos={[0, 0.65, 0.26]} bg="#fbfaf6" fg="#f08c00" rand={null} />
        <Blok size={[0.12, 0.03, 0.06]} pos={[-0.4, 1.01, 0.05]} color="#2f3634" r={0.01} />
        <Cil r={0.025} h={0.01} pos={[-0.32, 1.0, 0.05]} color="#ffd43b" seg={10} />
      </group>
    </group>
  );
}

// ───────────────────────── NIV-07: tankstation (benzine en diesel) ─────────────────────────

const TANK = { x: 240, y: 110, pb: 960, ph: 600 };
/** Kwartaalpunten (afgelezen knikpunten), begin 2007 t/m eind 2011, in centen. */
const BENZINE = [140, 145, 153, 155, 160, 164, 165, 165, 170, 165, 155, 154, 150, 150, 154, 155, 155, 158, 158, 160, 160];
const DIESEL = [110, 115, 132, 138, 150, 142, 140, 133, 130, 130, 126, 125, 125, 130, 131, 135, 135, 139, 142, 140, 140];

function druppel(ctx: C, x: number, y: number, s: number, kleur: string) {
  ctx.fillStyle = kleur;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x + s * 0.2, y - s * 0.5, x + s * 0.65, y - s * 0.05, x + s * 0.65, y + s * 0.35);
  ctx.arc(x, y + s * 0.35, s * 0.65, 0, Math.PI);
  ctx.bezierCurveTo(x - s * 0.65, y - s * 0.05, x - s * 0.2, y - s * 0.5, x, y - s);
  ctx.fill();
}

function Pomp({ pos }: { pos: V3 }) {
  const af = useOpgelost('O5-NIV-07');
  return (
    <group position={pos}>
      <Blok size={[0.75, 0.12, 0.55]} pos={[0, 0.06, 0]} color="#9aa3a8" r={0.03} />
      <Blok size={[0.6, 1.55, 0.42]} pos={[0, 0.88, 0]} color="#e03131" r={0.06} />
      <Blok size={[0.46, 0.3, 0.02]} pos={[0, 1.3, 0.22]} color="#1f2328" r={0.02} />
      <mesh position={[0, 1.66, 0.225]} material={af ? mat('#51cf66', { emissive: '#2f9e44' }) : mat('#ffd43b')}>
        <planeGeometry args={[0.42, 0.1]} />
      </mesh>
      <Blok size={[0.1, 0.32, 0.12]} pos={[0.36, 0.95, 0.05]} color="#2f3634" r={0.03} />
      <Cil r={0.02} h={0.6} pos={[0.38, 0.6, 0.1]} color="#2f3634" seg={6} />
    </group>
  );
}

/** NIV-07: crèmekleurig prijsscherm (benzine en diesel, 2007 – 2011) met een pomp ernaast. */
export function Tankstation() {
  const b = 3.6;
  const h = 2.2;
  const X = (t: number) => TANK.x + ((t - 2007) / 5) * TANK.pb;
  const Y = (c: number) => TANK.y + TANK.ph - ((c - 60) / 120) * TANK.ph;
  const euro = (c: number) => `€ ${(c / 100).toFixed(2).replace('.', ',')}`;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#efe3c2');
    tekst(ctx, 'Benzine- en dieselprijs', W / 2, 58, { px: 58, kleur: '#4a3f2a', gewicht: 700, uitlijn: 'center' });
    grafiekVlak(ctx, {
      x: TANK.x,
      y: TANK.y,
      b: TANK.pb,
      h: TANK.ph,
      ya: { min: 60, max: 180, stap: 10, label: euro, titel: 'Prijs per liter' },
      xa: { min: 2007, max: 2012, stap: 1 },
      xLabels: [2007, 2008, 2009, 2010, 2011].map((j) => ({ v: j + 0.5, t: String(j) })),
      xFijn: [2008, 2009, 2010, 2011],
      xRaster: false,
      px: 32,
      kleur: { banen: ['#f8f1dd', '#ece0bc'], raster: 'rgba(0,0,0,0)', fijn: '#8a7b5a', as: '#4a3f2a', tekst: '#4a3f2a' },
      yLabelB: 120,
    });
    const pts = (rij: number[]) => rij.map((c, i) => [X(2007 + i / 4), Y(c)] as [number, number]);
    lijn(ctx, pts(BENZINE), '#b8860b', 8);
    lijn(ctx, pts(DIESEL), '#4a4a4a', 8);
    druppel(ctx, 1310, 470, 34, '#c9a227');
    tekst(ctx, 'Benzine', 1310, 550, { px: 32, kleur: '#4a3f2a', gewicht: 700, uitlijn: 'center' });
    druppel(ctx, 1310, 625, 34, '#5a5a5a');
    tekst(ctx, 'Diesel', 1310, 705, { px: 32, kleur: '#4a3f2a', gewicht: 700, uitlijn: 'center' });
    void H;
  };
  const p = opScherm(b, h);
  const eind = (c: number, kleur: string) => (
    <group position={p(X(2012) + 26, Y(c), 0.06)}>
      <mesh material={mat(kleur, { rough: 0.3, metal: 0.2 })}>
        <sphereGeometry args={[0.045, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} material={mat(kleur, { rough: 0.3, metal: 0.2 })}>
        <coneGeometry args={[0.04, 0.07, 12]} />
      </mesh>
    </group>
  );
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="tankstation" pos={[0, 1.75, 0.08]} rand={0.08} diep={0.08} kleur="#6b5b3a">
        {eind(BENZINE[BENZINE.length - 1], '#c9a227')}
        {eind(DIESEL[DIESEL.length - 1], '#5a5a5a')}
      </Scherm>
      <Pomp pos={[2.35, 0, 0.5]} />
    </group>
  );
}

// ───────────────────────── NIV-08: scorebord triatlon ─────────────────────────

function Racefiets({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  const wiel = (x: number, lek = false) => (
    <mesh position={[x, 0.34, 0]} scale={lek ? [1, 0.88, 1] : 1} material={mat('#2f3634', { rough: 0.6 })}>
      <torusGeometry args={[0.32, 0.025, 8, 28]} />
    </mesh>
  );
  return (
    <group position={pos} rotation={[0, rot, -0.12]}>
      {wiel(-0.5)}
      {wiel(0.5, true)}
      <Blok size={[0.75, 0.035, 0.035]} pos={[0, 0.62, 0]} rot={[0, 0, 0.05]} color="#e03131" r={0.01} />
      <Blok size={[0.62, 0.035, 0.035]} pos={[-0.16, 0.45, 0]} rot={[0, 0, 0.75]} color="#e03131" r={0.01} />
      <Blok size={[0.55, 0.035, 0.035]} pos={[0.32, 0.47, 0]} rot={[0, 0, -1.0]} color="#e03131" r={0.01} />
      <Blok size={[0.2, 0.04, 0.08]} pos={[-0.36, 0.78, 0]} color="#1f2328" r={0.02} />
      <Blok size={[0.04, 0.04, 0.32]} pos={[0.42, 0.76, 0]} color="#1f2328" r={0.015} />
    </group>
  );
}

/** Na het goede antwoord staat er een beker voor het scorebord. */
function Beker() {
  const ref = useGroei(useOpgelost('O5-NIV-08'), 0.2, 'alle');
  return (
    <group position={[-1.2, 0, 0.55]}>
      <group ref={ref}>
        <Blok size={[0.3, 0.12, 0.3]} pos={[0, 0.06, 0]} color="#5a3a24" r={0.02} />
        <Cil r={0.04} h={0.2} pos={[0, 0.22, 0]} color="#f5c518" seg={10} />
        <Cil r={0.07} rTop={0.16} h={0.24} pos={[0, 0.44, 0]} color="#f5c518" seg={16} />
      </group>
    </group>
  );
}

/** NIV-08: scorebord in de sporthal: namen met nummer, en de tijden per nummer. */
export function Triatlon() {
  const id = 'O5-NIV-08';
  const namen = rijenVan(id, 0);
  const tijden = rijenVan(id, 1);
  const b = 4.4;
  const h = 2.5;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#16222e');
    tekst(ctx, 'Uitslag kwarttriatlon 03-04-2014', 40, 58, { px: 56, kleur: '#ffd43b', gewicht: 700 });
    tekst(ctx, 'tijden in uren:minuten', W - 40, 62, { px: 32, kleur: '#a5b4c3', uitlijn: 'right' });
    const stijl = { kopBg: '#0f6b7a', rijBg: ['#22313f', '#1a2632'], fg: '#ffffff', px: 44, kopPx: 40, tussen: 6, hoek: 6 };
    tabel(ctx, { x: 40, y: 115, b: 700, h: H - 150, kop: kolommenVan(id, 0), rijen: namen, kolB: [2.2, 1], ...stijl, uitlijn: ['left', 'center'] });
    tabel(ctx, { x: 790, y: 115, b: W - 830, h: H - 150, kop: kolommenVan(id, 1), rijen: tijden, ...stijl });
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="triatlon" pos={[0, 1.72, 0.08]} rand={0.1} diep={0.1} kleur="#0d151d" />
      <Racefiets pos={[1.3, 0, 0.55]} rot={0.15} />
      <Beker />
      <Cil r={0.02} h={0.5} pos={[2.0, 0.25, 0.5]} color="#1c7ed6" seg={8} />
      <Blok size={[0.14, 0.03, 0.08]} pos={[2.0, 0.015, 0.5]} color="#1c7ed6" r={0.01} />
    </group>
  );
}

// ───────────────────────── NIV-09: lease (showroom Forko) ─────────────────────────

function Draaiplateau({ pos }: { pos: V3 }) {
  const ref = useRef<THREE.Group>(null);
  const af = useOpgelost('O5-NIV-09');
  useFrame((_, dt) => {
    if (ref.current && af) ref.current.rotation.y += dt * 0.5;
  });
  return (
    <group position={pos}>
      <Cil r={0.95} h={0.12} pos={[0, 0.06, 0]} color="#ced4da" seg={36} />
      <group ref={ref} position={[0, 0.12, 0]}>
        <Blok size={[1.25, 0.32, 0.56]} pos={[0, 0.3, 0]} color="#d6202a" r={0.12} />
        <Blok size={[0.68, 0.26, 0.5]} pos={[-0.08, 0.56, 0]} color="#d6202a" r={0.1} />
        <Blok size={[0.6, 0.18, 0.52]} pos={[-0.08, 0.58, 0]} color="#3f4d58" r={0.06} />
        {[-0.38, 0.38].map((x) =>
          [-0.28, 0.28].map((z) => <Cil key={`${x}${z}`} r={0.13} h={0.1} pos={[x, 0.14, z]} rot={[Math.PI / 2, 0, 0]} color="#2f3634" seg={14} />),
        )}
        {[0.16, -0.16].map((z) => (
          <mesh key={z} position={[0.635, 0.34, z]} rotation={[0, Math.PI / 2, 0]} material={af ? mat('#fff9db', { emissive: '#ffe066' }) : mat('#d9d3c7')}>
            <planeGeometry args={[0.12, 0.06]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** NIV-09: twee schermen (diesel per jaar, benzine per maand) en een draaiplateau met een rode auto. */
export function Lease() {
  const id = 'O5-NIV-09';
  const diesel = rijenVan(id, 0);
  const benzine = rijenVan(id, 1);
  const links = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#7cb342', '#2f8f5b', '#1f6b5a']));
    tekst(ctx, 'Forko – dieselauto', 36, 56, { px: 54, kleur: '#ffffff', gewicht: 700 });
    tekst(ctx, 'Leasebedrag per jaar (bij niet meer dan 20.000 kilometer)', 36, 118, { px: 32, kleur: '#ffffff', gewicht: 600, max: W - 72 });
    tekst(ctx, 'Uitvoering →', W - 40, 168, { px: 28, kleur: '#e6f4ea', gewicht: 600, uitlijn: 'right' });
    tabel(ctx, { x: 30, y: 190, b: W - 60, h: H - 220, kop: kolommenVan(id, 0), rijen: diesel, kopBg: '#1f5f3c', rijBg: ['#ffffff', '#e6f4ea'], px: 44, kopPx: 38, lijn: '#9cc9a6', lijnDik: 2 });
  };
  const rechts = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#e9ecef');
    vlak(ctx, 30, 22, 250, 56, '#ffffff', 10);
    tekst(ctx, 'Personenauto', 155, 50, { px: 30, gewicht: 600, uitlijn: 'center' });
    vlak(ctx, 295, 22, 210, 56, '#adb5bd', 10);
    tekst(ctx, 'Bestelauto', 400, 50, { px: 30, gewicht: 600, uitlijn: 'center', kleur: '#ffffff' });
    tekst(ctx, 'Zoekresultaten', W - 30, 50, { px: 30, kleur: '#868e96', uitlijn: 'right' });
    tekst(ctx, 'Benzineauto Forko', 36, 130, { px: 46, kleur: '#e67700', gewicht: 700 });
    tekst(ctx, 'Leasebedrag voor een luxe uitvoering.', 36, 180, { px: 34, kleur: '#1f2a24', gewicht: 600, max: W - 72 });
    tabel(ctx, {
      x: 36,
      y: 215,
      b: W - 72,
      h: 400,
      kop: kolommenVan(id, 1),
      rijen: benzine,
      kopBg: '#dee2e6',
      kopFg: '#1f2a24',
      rijBg: ['#ffffff'],
      tussen: 8,
      hoek: 8,
      px: 48,
      kopPx: 36,
      cel: (_r, k) => (k === 0 ? { fg: '#e67700', gewicht: 700 } : { fg: '#2b8a3e', gewicht: 700 }),
    });
    alinea(ctx, '*Deze prijs geldt als u niet meer dan 20.000 kilometer per jaar rijdt.', 36, 650, W - 72, { px: 28, kleur: '#495057', regelH: 36 });
    void H;
  };
  return (
    <group>
      <Scherm b={2.7} h={1.9} teken={links} sleutel="forko-diesel" pos={[-1.42, 1.85, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      <Scherm b={2.4} h={1.9} teken={rechts} sleutel="forko-benzine" pos={[1.33, 1.85, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      <Draaiplateau pos={[0, 0, 1.25]} />
    </group>
  );
}

// ───────────────────────── NIV-10: keuzezuil tablets ─────────────────────────

/** Na het goede antwoord gaat het scherm van de tablet die bij Renate past aan. */
function TabletAan({ s }: { s: number }) {
  const ref = useGroei(useOpgelost('O5-NIV-10'), 0.2, 'alle');
  return (
    <group position={[0, 0.15 * s + 0.02, -0.05]} rotation={[-0.35, 0, 0]}>
      <group ref={ref} position={[0, 0, 0.014]}>
        <mesh material={mat('#74c0fc', { emissive: '#4dabf7' })}>
          <planeGeometry args={[0.37 * s, 0.25 * s]} />
        </mesh>
      </group>
    </group>
  );
}

/** NIV-10: keuzezuil met een stroomschema; ervoor een tafel met drie tablets en prijskaartjes. */
export function Tabletzuil() {
  const id = 'O5-NIV-10';
  const prijzen = itemsVan(id, 1);
  const b = 2.0;
  const h = 2.2;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#1b4a7a', '#0e2742']));
    tekst(ctx, 'Tabletkeuze', W / 2, 52, { px: 50, kleur: '#ffd43b', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Welk formaat tablet is geschikt?', W / 2, 108, { px: 34, kleur: '#ffffff', gewicht: 600, uitlijn: 'center' });
    const doos = (x: number, y: number, w: number, hh: number, t: string, eind = false) => {
      vlak(ctx, x, y, w, hh, eind ? '#ffd43b' : '#ffffff', 18);
      regels(ctx, t, x + w / 2, y + hh / 2, { px: eind ? 46 : 32, kleur: '#0e2742', gewicht: 700, uitlijn: 'center', max: w - 20 });
    };
    const wit = '#ffffff';
    doos(30, 170, 360, 120, 'Je kijkt weinig\nfilms/series');
    doos(440, 170, 330, 120, 'Je kijkt veel\nfilms/series');
    doos(20, 420, 180, 120, 'Simpele\ngames');
    doos(215, 420, 200, 120, 'Verschillende\ngames');
    doos(30, 680, 160, 110, '7 inch', true);
    doos(235, 680, 160, 110, '8 inch', true);
    doos(515, 680, 180, 110, '10 inch', true);
    pijl(ctx, 150, 295, 110, 412, wit, 12);
    pijl(ctx, 270, 295, 315, 412, wit, 12);
    pijl(ctx, 110, 545, 110, 672, wit, 12);
    pijl(ctx, 315, 545, 315, 672, wit, 12);
    pijl(ctx, 605, 295, 605, 672, wit, 12);
    void H;
  };
  const kaart = (naam: string, prijs: string) => (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff', 16);
    const [model, maat] = naam.replace(')', '').split(' (');
    tekst(ctx, model, W / 2, 46, { px: 34, gewicht: 700, uitlijn: 'center', max: W - 20 });
    tekst(ctx, maat, W / 2, 92, { px: 30, kleur: '#495057', uitlijn: 'center' });
    tekst(ctx, prijs, W / 2, 150, { px: 46, kleur: '#c92a2a', gewicht: 700, uitlijn: 'center' });
    void H;
  };
  const tablets = prijzen.filter((p) => p.label.startsWith('Marena'));
  const verzend = prijzen.find((p) => p.label.startsWith('verzend'));
  const sticker = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffd43b', 14);
    tekst(ctx, `* Bij elke bestelling komen er ${verzend?.waarde ?? ''} verzendkosten bij.`, W / 2, H / 2, { px: 30, gewicht: 700, uitlijn: 'center', max: W - 30 });
  };
  return (
    <group>
      {/* zuil */}
      <group position={[0, 0, -0.55]}>
        <Blok size={[b + 0.24, 2.75, 0.3]} pos={[0, 1.375, -0.1]} color="#2b3a4a" r={0.08} />
        <Scherm b={b} h={h} teken={teken} sleutel="tabletzuil" pos={[0, 1.6, 0.06]} rand={0} />
      </group>
      {/* tafel met tablets */}
      <group position={[0, 0, 0.55]}>
        <Blok size={[2.1, 0.06, 0.7]} pos={[0, 0.74, 0]} color="#e8e2d6" r={0.03} />
        {[-0.95, 0.95].map((x) => (
          <Blok key={x} size={[0.06, 0.72, 0.6]} pos={[x, 0.36, 0]} color="#9aa3a8" r={0.02} />
        ))}
        {tablets.map((t, i) => {
          const s = [0.75, 0.85, 1.05][i];
          return (
            <group key={t.label} position={[-0.68 + i * 0.68, 0.77, -0.05]}>
              <Blok size={[0.42 * s, 0.3 * s, 0.025]} pos={[0, 0.15 * s + 0.02, -0.05]} rot={[-0.35, 0, 0]} color="#1f2328" r={0.02} />
              {i === 1 && <TabletAan s={s} />}
              <Scherm b={0.5} h={0.32} teken={kaart(t.label, String(t.waarde))} sleutel={`tablet-${i}`} pos={[0, 0.14, 0.2]} rot={[-0.75, 0, 0]} rand={0} licht={false} />
            </group>
          );
        })}
        <Scherm b={2.0} h={0.16} teken={sticker} sleutel="tablet-verzend" pos={[0, 0.66, 0.36]} rand={0} licht={false} />
      </group>
    </group>
  );
}
