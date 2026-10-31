// Wereld 5 – modellen voor de eindcheck (eindtest), bij de uitgangsdeur.
// Wandmodellen: z = 0 is de muur, alles staat ervoor (z ≥ 0). Vloermodellen staan rond de oorsprong.
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Blok, Cil, mat } from '../game/kit';
import { nl } from '../lib/getal';
import { ctxVan, getal, itemsVan, kolommenVan, rijenVan } from './data5';
import { Beeld, opScherm, Paal, Scherm, useScherm } from './scherm';
import { alinea, grafiekVlak, legenda, licht, lijn, pijl, regels, ROND, streep, tabel, taart, tekst, verloop, vlak, VPM, type C, type Stuk } from './teken';

type V3 = [number, number, number];

// ───────────────────────── EIN-01: treinstoringen ─────────────────────────

const STOR = { x: 260, y: 110, pb: 860, ph: 620 };

function Bankje({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[1.5, 0.08, 0.42]} pos={[0, 0.45, 0]} color="#1d3557" r={0.03} />
      <Blok size={[1.5, 0.32, 0.06]} pos={[0, 0.7, -0.19]} color="#1d3557" r={0.03} />
      {[-0.62, 0.62].map((x) => (
        <Blok key={x} size={[0.08, 0.45, 0.36]} pos={[x, 0.22, 0]} color="#495057" r={0.02} />
      ))}
    </group>
  );
}

/** EIN-01: geel storingsscherm op het perron; de staven zijn stapels wagonnetjes (1 wagon = 100). */
export function Treinstoringen() {
  const id = 'O5-EIN-01';
  const rijen = rijenVan(id);
  const b = 3.0;
  const h = 2.2;
  const Y = (v: number) => STOR.y + STOR.ph - (v / 3500) * STOR.ph;
  const catB = STOR.pb / rijen.length;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffd43b');
    tekst(ctx, 'Totaal aantal gemeten treinstoringen per jaar', W / 2, 54, { px: 44, kleur: '#1d3557', gewicht: 700, uitlijn: 'center', max: W - 60 });
    const g = grafiekVlak(ctx, {
      x: STOR.x,
      y: STOR.y,
      b: STOR.pb,
      h: STOR.ph,
      ya: { min: 0, max: 3500, stap: 500, fijn: 100, label: (v) => nl(v), titel: 'Aantal treinstoringen' },
      cats: rijen.map((r) => String(r[0])),
      px: 34,
      kleur: { raster: '#ffffff', fijn: 'rgba(255,255,255,0.55)', as: '#1d3557', tekst: '#1d3557' },
      yLabelB: 110,
    });
    rijen.forEach((r, i) => {
      const n = Number(r[1]) / 100;
      const bw = g.catB * 0.56;
      const x = g.cat(i) - bw / 2;
      for (let k = 0; k < n; k++) {
        const y1 = Y((k + 1) * 100);
        const hh = Y(k * 100) - y1;
        vlak(ctx, x, y1 + 1.5, bw, hh - 3, '#1d3557', 3);
        for (let w = 0; w < 4; w++) vlak(ctx, x + 14 + w * ((bw - 28) / 4), y1 + hh * 0.3, (bw - 28) / 4 - 8, hh * 0.38, '#a5d8ff', 2);
      }
    });
    void H;
  };
  const p = opScherm(b, h);
  const top2016 = Y(Number(rijen[rijen.length - 1][1]));
  const xs = STOR.x + (rijen.length - 0.5) * catB;
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="treinstoringen" pos={[0, 1.75, 0.08]} rand={0.08} diep={0.08} kleur="#1d3557">
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={p(xs + (i - 1) * 22, top2016 - 50 - i * 26, 0.08)} material={mat('#e9ecef', { rough: 1 })}>
            <sphereGeometry args={[0.06 + i * 0.015, 10, 8]} />
          </mesh>
        ))}
      </Scherm>
      <Bankje pos={[0.6, 0, 0.75]} />
    </group>
  );
}

// ───────────────────────── EIN-02: BMI ─────────────────────────

function Persoon({ pos, lengte }: { pos: V3; lengte: number }) {
  const k = lengte / 1.67;
  return (
    <group position={pos} scale={k}>
      {[-0.08, 0.08].map((x) => (
        <Cil key={x} r={0.06} h={0.82} pos={[x, 0.41, 0]} color="#3b5bdb" seg={10} />
      ))}
      <Blok size={[0.36, 0.56, 0.22]} pos={[0, 1.1, 0]} color="#e64980" r={0.08} />
      {[-0.23, 0.23].map((x) => (
        <Cil key={x} r={0.045} h={0.55} pos={[x, 1.08, 0]} color="#e64980" seg={8} />
      ))}
      <mesh position={[0, 1.52, 0]} material={mat('#e0ac7e')}>
        <sphereGeometry args={[0.13, 14, 10]} />
      </mesh>
      <mesh position={[0, 1.57, -0.03]} scale={[1, 0.85, 1]} material={mat('#5a3a22')}>
        <sphereGeometry args={[0.135, 14, 10]} />
      </mesh>
    </group>
  );
}

/** EIN-02: lengtemeter (167 cm), weegschaal (64 kg) en een bord met de formule voor de BMI. */
export function Bmi() {
  const lat = useScherm(0.3, 2.1, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#fffdf7');
    for (let cm = 0; cm <= 210; cm += 2) {
      const y = H - cm * 4;
      const groot = cm % 10 === 0;
      streep(ctx, 0, y, groot ? 50 : 22, y, '#1f2a24', groot ? 3 : 1.5);
      if (groot && cm > 0 && cm < 210) tekst(ctx, String(cm), 62, y, { px: 24, gewicht: 700 });
    }
  }, 'bmi-lat');
  const lcd = useScherm(0.24, 0.1, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#b8e0a6');
    tekst(ctx, '64 kg', W - 10, H / 2 + 2, { px: 30, kleur: '#16301a', gewicht: 700, uitlijn: 'right' });
  }, 'bmi-kg');
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    vlak(ctx, 0, 0, W, 80, '#0c8599');
    tekst(ctx, 'BMI berekenen', W / 2, 42, { px: 44, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    tekst(ctx, 'BMI = gewicht in kg :', W / 2, 150, { px: 44, gewicht: 700, uitlijn: 'center' });
    tekst(ctx, '(lengte in m × lengte in m)', W / 2, 215, { px: 44, gewicht: 700, uitlijn: 'center', max: W - 40 });
    vlak(ctx, 40, 280, W - 80, 140, '#fff3bf', 16);
    regels(ctx, 'Anna: 167 cm lang\nen 64 kg', W / 2, 350, { px: 38, gewicht: 700, uitlijn: 'center' });
    void H;
  };
  return (
    <group>
      {/* lengtemeter met Anna */}
      <group position={[-1.0, 0, -0.2]}>
        <Blok size={[0.36, 2.2, 0.06]} pos={[0, 1.1, -0.06]} color="#ced4da" r={0.02} />
        <Beeld b={0.3} h={2.1} tex={lat} pos={[0, 1.05, -0.025]} licht={false} />
        <Blok size={[0.32, 0.03, 0.3]} pos={[0, 1.67, 0.12]} color="#e03131" r={0.01} />
        <Persoon pos={[0, 0, 0.18]} lengte={1.665} />
      </group>
      {/* weegschaal */}
      <group position={[-0.2, 0, 0.45]}>
        <Blok size={[0.42, 0.07, 0.42]} pos={[0, 0.035, 0]} color="#f8f9fa" r={0.04} />
        <Beeld b={0.24} h={0.1} tex={lcd} pos={[0, 0.072, -0.08]} rot={[-Math.PI / 2, 0, 0]} />
      </group>
      {/* formulebord */}
      <group position={[0.85, 0, 0]}>
        <Paal hoogte={1.2} r={0.05} kleur="#343a40" />
        <Scherm b={1.5} h={1.1} teken={bord} sleutel="bmi-formule" pos={[0, 1.7, 0]} rot={[-0.15, 0, 0]} rand={0.05} diep={0.05} kleur="#343a40" licht={false} />
      </group>
    </group>
  );
}

// ───────────────────────── EIN-03: voetbalschema (klembord) ─────────────────────────

function Voetbal() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.6;
    ref.current.position.x = Math.sin(t) * 1.4;
    ref.current.rotation.z = -Math.cos(t) * 4;
  });
  return (
    <group ref={ref} position={[0, 0.13, 0.7]}>
      <mesh material={mat('#f8f9fa', { flat: true })}>
        <icosahedronGeometry args={[0.13, 1]} />
      </mesh>
      <mesh scale={0.6} position={[0, 0, 0.08]} material={mat('#1f2328', { flat: true })}>
        <icosahedronGeometry args={[0.08, 0]} />
      </mesh>
    </group>
  );
}

/** EIN-03: groot zwart klembord met de rondetijden en de indeling per veld (× = geen wedstrijd). */
export function Voetbalschema() {
  const id = 'O5-EIN-03';
  const tijden = rijenVan(id, 0);
  const velden = rijenVan(id, 1);
  const b = 3.6;
  const h = 2.2;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Indeling wedstrijden voetbal', 30, 50, { px: 48, gewicht: 700 });
    vlak(ctx, W - 410, 22, 380, 56, '#ffe3e3', 12);
    tekst(ctx, '× = geen wedstrijd', W - 220, 51, { px: 32, gewicht: 700, kleur: '#c92a2a', uitlijn: 'center' });
    tabel(ctx, {
      x: 30,
      y: 105,
      b: 440,
      h: H - 130,
      kop: kolommenVan(id, 0),
      rijen: tijden,
      kolB: [0.9, 1.4],
      kopBg: '#343a40',
      rijBg: ['#f1f3f5', '#ffffff'],
      px: 32,
      lijn: '#ced4da',
      cel: (r) => (String(tijden[r][0]) === 'Pauze' ? { bg: '#dee2e6', fg: '#495057' } : undefined),
    });
    tabel(ctx, {
      x: 510,
      y: 105,
      b: W - 540,
      h: H - 130,
      kop: kolommenVan(id, 1),
      rijen: velden,
      kolB: [0.7, 1, 1, 1, 1],
      kopBg: '#2b8a3e',
      rijBg: ['#ebfbee', '#ffffff'],
      px: 36,
      lijn: '#b2f2bb',
      uitlijn: ['center'],
      cel: (r, k) => (String(velden[r][k]) === '×' ? { bg: '#e03131', fg: '#ffffff', gewicht: 700 } : undefined),
    });
  };
  return (
    <group>
      <Blok size={[b + 0.3, h + 0.35, 0.06]} pos={[0, 1.7, 0.05]} color="#1f2328" r={0.06} />
      <Scherm b={b} h={h} teken={teken} sleutel="voetbalschema" pos={[0, 1.66, 0.085]} rand={0} licht={false} />
      <Blok size={[0.7, 0.16, 0.1]} pos={[0, 2.86, 0.11]} color="#adb5bd" r={0.03} />
      <Voetbal />
    </group>
  );
}

// ───────────────────────── EIN-04: De Pluggenboer ─────────────────────────

/** EIN-04: geel webwinkelscherm met het keuzeschema; ervoor een tafel met de vier pluggen en 6 planken. */
export function Pluggen() {
  const id = 'O5-EIN-04';
  const prijzen = itemsVan(id, 1);
  const b = 3.4;
  const h = 2.2;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffe066');
    vlak(ctx, 0, 0, W, 92, '#ffffff');
    ctx.fillStyle = '#c92a2a';
    ctx.beginPath();
    ctx.arc(70, 46, 34, 0, Math.PI * 2);
    ctx.fill();
    tekst(ctx, 'P', 70, 48, { px: 46, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    tekst(ctx, 'De Pluggenboer', 120, 48, { px: 46, kleur: '#c92a2a', gewicht: 700, font: ROND });
    tekst(ctx, 'Begin   Over   Producten   Bestellen   Contacten', W - 30, 48, { px: 24, kleur: '#495057', gewicht: 600, uitlijn: 'right' });
    tekst(ctx, 'Wat ga je monteren?', 30, 135, { px: 40, gewicht: 700 });
    const doos = (x: number, y: number, w: number, hh: number, t: string, soort: 'wat' | 'ond' | 'plug') => {
      vlak(ctx, x, y, w, hh, soort === 'plug' ? '#2f9e44' : soort === 'ond' ? '#fff9db' : '#ffffff', 14);
      regels(ctx, t, x + w / 2, y + hh / 2, { px: 30, kleur: soort === 'plug' ? '#ffffff' : '#1f2a24', gewicht: 700, uitlijn: 'center', max: w - 20 });
    };
    const zw = '#1f2a24';
    const c1 = [30, 380];
    const c2 = [460, 300];
    const c3 = [850, 470];
    doos(c1[0], 180, c1[1], 80, 'Kozijnen', 'wat');
    doos(c3[0], 180, c3[1], 80, 'Kozijnplug', 'plug');
    pijl(ctx, c1[0] + c1[1] + 8, 220, c3[0] - 8, 220, zw, 7);
    doos(c1[0], 370, c1[1], 110, 'Niet bewegende delen\n(zoals een plank)', 'wat');
    [
      ['Stalen ondergrond', 'Messing plug', 300],
      ['Holle wanden', 'Hollewandplug', 400],
      ['Gipsplaat', 'Gipsplaatplug', 500],
    ].forEach(([o, plug, y]) => {
      const yy = Number(y);
      doos(c2[0], yy, c2[1], 76, String(o), 'ond');
      doos(c3[0], yy, c3[1], 76, String(plug), 'plug');
      pijl(ctx, c1[0] + c1[1] + 8, 425, c2[0] - 8, yy + 38, zw, 6);
      pijl(ctx, c2[0] + c2[1] + 8, yy + 38, c3[0] - 8, yy + 38, zw, 6);
    });
    doos(c1[0], 620, c1[1], 100, 'Bewegende delen\n(zoals ventilator)', 'wat');
    doos(c3[0], 632, c3[1], 76, 'Alligatorplug Toggler', 'plug');
    pijl(ctx, c1[0] + c1[1] + 8, 670, c3[0] - 8, 670, zw, 7);
    doos(c1[0], 760, c1[1], 80, 'Zware belasting', 'wat');
    doos(c3[0], 762, c3[1], 76, 'Keilbouten', 'plug');
    pijl(ctx, c1[0] + c1[1] + 8, 800, c3[0] - 8, 800, zw, 7);
    void H;
  };
  const kaart = (label: string, prijs: string) => (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff', 14);
    const [naam, aantal] = label.split(', verpakking met ');
    tekst(ctx, naam, W / 2, 40, { px: 30, gewicht: 700, uitlijn: 'center', max: W - 20 });
    tekst(ctx, aantal ? `verpakking met ${aantal}` : '', W / 2, 84, { px: 24, kleur: '#495057', uitlijn: 'center', max: W - 20 });
    vlak(ctx, 20, 112, W - 40, 50, '#ffd43b', 10);
    tekst(ctx, prijs, W / 2, 138, { px: 36, gewicht: 700, uitlijn: 'center' });
    void H;
  };
  const doosKleur = ['#4dabf7', '#ffd43b', '#ffa94d', '#69db7c'];
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="pluggenboer" pos={[0, 1.8, 0.08]} rand={0.08} diep={0.08} />
      <group position={[-0.3, 0, 0.95]}>
        <Blok size={[2.6, 0.06, 0.6]} pos={[0, 0.74, 0]} color="#e8e2d6" r={0.03} />
        {[-1.2, 1.2].map((x) => (
          <Blok key={x} size={[0.06, 0.72, 0.5]} pos={[x, 0.36, 0]} color="#9aa3a8" r={0.02} />
        ))}
        {prijzen.map((pr, i) => (
          <group key={pr.label} position={[-0.96 + i * 0.64, 0.77, 0]}>
            <Blok size={[0.34, 0.2, 0.22]} pos={[0, 0.1, -0.12]} color={doosKleur[i]} r={0.02} />
            <Scherm b={0.58} h={0.42} teken={kaart(pr.label, String(pr.waarde))} sleutel={`plug-${i}`} pos={[0, 0.08, 0.14]} rot={[-1.0, 0, 0]} rand={0} licht={false} />
          </group>
        ))}
      </group>
      {/* zes planken */}
      <group position={[1.75, 0, 0.75]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Blok key={i} size={[1.1, 0.035, 0.24]} pos={[0, 0.02 + i * 0.04, 0]} rot={[0, (i % 2) * 0.05, 0]} color={i % 2 ? '#d4a373' : '#c48a52'} r={0.008} />
        ))}
      </group>
    </group>
  );
}

// ───────────────────────── EIN-05: inkomstenbelasting ─────────────────────────

const BEL = { x: 250, y: 120, pb: 880, ph: 540 };

/** EIN-05: lichtblauw scherm met vier staven (as begint bij 20%) en stapels munten op de vloer. */
export function Belasting() {
  const id = 'O5-EIN-05';
  const rijen = rijenVan(id);
  const b = 3.0;
  const h = 2.2;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#d0ebff');
    tekst(ctx, 'Inkomstenbelasting', W / 2, 58, { px: 54, kleur: '#1d3557', gewicht: 700, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: BEL.x,
      y: BEL.y,
      b: BEL.pb,
      h: BEL.ph,
      ya: { min: 20, max: 55, stap: 5, fijn: 1, label: (v) => `${v}%`, titel: 'Percentage inkomstenbelasting' },
      cats: rijen.map((r) => String(r[0]).replace(/^Tot /, 'Tot\n').replace(' tot ', ' tot\n').replace(/^Meer dan /, 'Meer dan\n')),
      px: 32,
      kleur: { achter: '#e7f5ff', raster: '#748ffc', fijn: '#c5d7f2', as: '#1d3557', tekst: '#1d3557' },
      yLabelB: 90,
    });
    rijen.forEach((r, i) => {
      const v = getal(r[1]);
      vlak(ctx, g.cat(i) - g.catB * 0.27, g.Y(v), g.catB * 0.54, g.Y(20) - g.Y(v), '#1d3557');
    });
    tekst(ctx, 'Inkomen per jaar', BEL.x + BEL.pb / 2, H - 40, { px: 32, kleur: '#1d3557', gewicht: 700, uitlijn: 'center' });
  };
  const stapel = (x: number, n: number) => (
    <group key={x} position={[x, 0, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <Cil key={i} r={0.1} h={0.035} pos={[(i % 2) * 0.008, 0.02 + i * 0.037, 0]} color="#f5c518" seg={16} />
      ))}
    </group>
  );
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="belasting" pos={[0, 1.75, 0.08]} rand={0.08} diep={0.08} kleur="#1d3557" />
      <group position={[-0.9, 0, 0.6]}>
        {stapel(0, 4)}
        {stapel(0.3, 6)}
        {stapel(0.6, 6)}
        {stapel(0.9, 9)}
        {/* muisje met een munt */}
        <group position={[1.35, 0, 0.15]}>
          <mesh position={[0, 0.06, 0]} scale={[1.4, 1, 1]} material={mat('#adb5bd')}>
            <sphereGeometry args={[0.06, 10, 8]} />
          </mesh>
          <Cil r={0.045} h={0.012} pos={[-0.1, 0.03, 0]} rot={[0, 0, 1.2]} color="#f5c518" seg={12} />
        </group>
      </group>
    </group>
  );
}

// ───────────────────────── EIN-06: huisdieren familie Cheral ─────────────────────────

const DIER = { x: 220, y: 120, pb: 940, ph: 600 };

function Dier({ soort, pos }: { soort: string; pos: V3 }) {
  if (soort === 'Honden')
    return (
      <group position={pos}>
        <Blok size={[0.22, 0.11, 0.1]} pos={[0, 0.1, 0]} color="#a0522d" r={0.04} />
        <mesh position={[0.12, 0.18, 0]} material={mat('#a0522d')}>
          <sphereGeometry args={[0.065, 10, 8]} />
        </mesh>
        {[-0.07, 0.07].map((x) => (
          <Blok key={x} size={[0.03, 0.06, 0.03]} pos={[x, 0.03, 0]} color="#7a3e1d" r={0.01} />
        ))}
        <Blok size={[0.03, 0.06, 0.05]} pos={[0.1, 0.23, 0]} color="#5a2e15" r={0.01} />
      </group>
    );
  if (soort === 'Katten')
    return (
      <group position={pos}>
        <mesh position={[0, 0.09, 0]} scale={[1.3, 1, 1]} material={mat('#f08c00')}>
          <sphereGeometry args={[0.075, 10, 8]} />
        </mesh>
        <mesh position={[0.09, 0.19, 0]} material={mat('#f08c00')}>
          <sphereGeometry args={[0.06, 10, 8]} />
        </mesh>
        {[-0.03, 0.03].map((z) => (
          <mesh key={z} position={[0.09, 0.26, z]} material={mat('#f08c00')}>
            <coneGeometry args={[0.025, 0.05, 4]} />
          </mesh>
        ))}
        <Cil r={0.015} h={0.16} pos={[-0.12, 0.15, 0]} rot={[0, 0, 0.5]} color="#f08c00" seg={6} />
      </group>
    );
  if (soort === 'Vissen')
    return (
      <group position={pos}>
        <mesh position={[0, 0.12, 0]} material={mat('#a5d8ff', { opacity: 0.45, rough: 0.1 })}>
          <sphereGeometry args={[0.12, 16, 12]} />
        </mesh>
        <Blok size={[0.07, 0.04, 0.02]} pos={[0.01, 0.1, 0.03]} color="#ff922b" r={0.01} />
      </group>
    );
  return (
    <group position={pos}>
      <mesh position={[0, 0.07, 0]} scale={[1.2, 0.9, 1]} material={mat('#e0b07a')}>
        <sphereGeometry args={[0.075, 10, 8]} />
      </mesh>
      {[-0.035, 0.035].map((z) => (
        <mesh key={z} position={[0.05, 0.13, z]} material={mat('#f3c6a5')}>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** EIN-06: beige scherm met vier lichtblauwe staven en op elke staaf een 3D-dier. */
export function Huisdieren() {
  const id = 'O5-EIN-06';
  const rijen = rijenVan(id);
  const b = 3.0;
  const h = 2.2;
  const catB = DIER.pb / rijen.length;
  const Y = (v: number) => DIER.y + DIER.ph - (v / 20) * DIER.ph;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#f3ead7');
    tekst(ctx, 'Huisdieren van de familie Cheral', W / 2, 60, { px: 50, kleur: '#5c3d1e', gewicht: 700, uitlijn: 'center' });
    ctx.fillStyle = '#8b5a2b';
    [[-16, -8], [-6, -18], [6, -18], [16, -8]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(1110 + dx, 60 + dy, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(1110, 66, 12, 0, Math.PI * 2);
    ctx.fill();
    const g = grafiekVlak(ctx, {
      x: DIER.x,
      y: DIER.y,
      b: DIER.pb,
      h: DIER.ph,
      ya: { min: 0, max: 20, stap: 2, fijn: 1, titel: 'Aantal huisdieren' },
      cats: rijen.map((r) => String(r[0])),
      px: 34,
      kleur: { raster: '#2b2b2b', fijn: '#b9ab8f', as: '#2b2b2b', tekst: '#2b2b2b' },
      yLabelB: 60,
    });
    rijen.forEach((r, i) => {
      const v = Number(r[1]);
      vlak(ctx, g.cat(i) - g.catB * 0.27, g.Y(v), g.catB * 0.54, g.Y(0) - g.Y(v), '#74c0fc');
    });
    void H;
  };
  const p = opScherm(b, h);
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="huisdieren" pos={[0, 1.75, 0.08]} rand={0.08} diep={0.08} kleur="#8b5a2b">
        {rijen.map((r, i) => {
          const [x, y] = p(DIER.x + (i + 0.5) * catB, Y(Number(r[1])));
          return (
            <group key={i} position={[x, y, 0.07]}>
              <Blok size={[(catB * 0.54) / VPM, 0.02, 0.12]} pos={[0, -0.01, -0.02]} color="#74c0fc" r={0.005} />
              <Dier soort={String(r[0])} pos={[0, 0, 0]} />
            </group>
          );
        })}
      </Scherm>
    </group>
  );
}

// ───────────────────────── EIN-07: Netflix ─────────────────────────

const NET = { x: 210, y: 360, pb: 1000, ph: 470 };

/** EIN-07: nieuwsscherm met het krantenbericht en de lijnen A en B. */
export function Netflix() {
  const id = 'O5-EIN-07';
  const bericht = ctxVan(id, 0);
  const rijen = rijenVan(id, 1);
  const b = 3.4;
  const h = 2.4;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    vlak(ctx, 0, 0, W, 92, '#141414');
    ctx.save();
    ctx.shadowColor = '#ff4d4d';
    ctx.shadowBlur = 14;
    tekst(ctx, bericht.titel ?? '', W / 2, 48, { px: 50, kleur: '#ff4d4d', gewicht: 700, uitlijn: 'center', max: W - 40 });
    ctx.restore();
    vlak(ctx, 24, 110, W - 48, 200, '#f1f3f5', 12);
    alinea(ctx, bericht.beschrijving, 44, 124, W - 88, { px: 30, kleur: '#212529', regelH: 38 });
    const g = grafiekVlak(ctx, {
      x: NET.x,
      y: NET.y,
      b: NET.pb,
      h: NET.ph,
      ya: { min: 0, max: 60, stap: 6, label: (v) => String(v), titel: 'Aantal leden (× miljoen)' },
      xa: { min: 2002, max: 2014, stap: 1 },
      xRaster: false,
      px: 28,
      kleur: { raster: '#ced4da', as: '#1f2a24' },
      yLabelB: 50,
    });
    lijn(ctx, rijen.map((r) => [g.X(Number(r[0])), g.Y(Number(r[1]))]), '#1c7ed6', 7);
    lijn(ctx, rijen.map((r) => [g.X(Number(r[0])), g.Y(Number(r[2]))]), '#e03131', 7);
    const laatste = rijen[rijen.length - 1];
    tekst(ctx, 'B', g.X(2014) + 34, g.Y(Number(laatste[2])) - 6, { px: 46, kleur: '#e03131', gewicht: 700, uitlijn: 'center' });
    tekst(ctx, 'A', g.X(2014) + 34, g.Y(Number(laatste[1])) + 26, { px: 46, kleur: '#1c7ed6', gewicht: 700, uitlijn: 'center' });
    void H;
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="netflix" pos={[0, 1.72, 0.08]} rand={0.08} diep={0.08} />
      {/* bakje popcorn */}
      <group position={[1.4, 0, 0.6]}>
        <Cil r={0.16} rTop={0.22} h={0.4} pos={[0, 0.2, 0]} color="#e03131" seg={14} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i) * 0.1, 0.42 + (i % 2) * 0.04, Math.sin(i) * 0.1]} material={mat('#fff9db', { flat: true })}>
            <icosahedronGeometry args={[0.055, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ───────────────────────── EIN-08: rondreis India ─────────────────────────

/** "week 27 t/m 28 en week 31" → [27, 28, 31] */
function weken(s: string): number[] {
  const uit: number[] = [];
  for (const deel of s.split(' en ')) {
    const m = deel.match(/(\d+)(?:\s*t\/m\s*(\d+))?/);
    if (!m) continue;
    const a = Number(m[1]);
    const z = m[2] ? Number(m[2]) : a;
    for (let w = a; w <= z; w++) uit.push(w);
  }
  return uit;
}

function Olifantje() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.3;
    ref.current.position.x = Math.sin(t) * 0.9;
    ref.current.rotation.y = Math.cos(t) > 0 ? 0 : Math.PI;
  });
  const g = '#adb5bd';
  return (
    <group ref={ref} position={[0, 0, 0.75]}>
      <mesh position={[0, 0.32, 0]} scale={[1.35, 1, 1]} material={mat(g)}>
        <sphereGeometry args={[0.17, 14, 10]} />
      </mesh>
      <mesh position={[0.24, 0.42, 0]} material={mat(g)}>
        <sphereGeometry args={[0.11, 12, 10]} />
      </mesh>
      <Cil r={0.03} rTop={0.02} h={0.26} pos={[0.33, 0.28, 0]} rot={[0, 0, 0.25]} color={g} seg={8} />
      {[-0.09, 0.09].map((z) => (
        <Cil key={z} r={0.07} h={0.02} pos={[0.2, 0.44, z * 1.3]} rot={[Math.PI / 2, 0, 0]} color="#ced4da" seg={12} />
      ))}
      {[-0.12, 0.12].map((x) => [-0.08, 0.08].map((z) => <Cil key={`${x}${z}`} r={0.04} h={0.2} pos={[x, 0.1, z]} color={g} seg={8} />))}
      <Blok size={[0.16, 0.12, 0.08]} pos={[-0.05, 0.53, 0]} color="#c92a2a" r={0.02} />
    </group>
  );
}

/** EIN-08: planbord met het vakantierooster (week 23 t/m 33) en een poster met de prijslijst. */
export function Rondreis() {
  const id = 'O5-EIN-08';
  const rooster = rijenVan(id, 0);
  const prijs = rijenVan(id, 1);
  const kop = kolommenVan(id, 1).map((k) => k.replace(' (', '\n(').replace(', ', ',\n').replace('Aantal weken', 'Aantal\nweken'));
  const plan = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Vakantierooster', 30, 46, { px: 42, gewicht: 700 });
    vlak(ctx, W - 330, 30, 70, 26, '#2f9e44', 13);
    tekst(ctx, '= vakantie', W - 245, 44, { px: 30, gewicht: 700 });
    const x0 = 190;
    const n = 11;
    const kw = (W - 20 - x0) / n;
    const y0 = 90;
    const kh = 60;
    const rh = (H - y0 - kh - 20) / rooster.length;
    for (let i = 0; i < n; i++) {
      vlak(ctx, x0 + i * kw, y0, kw, H - y0 - 20, i % 2 ? '#a5d8ff' : '#d0ebff');
      tekst(ctx, String(23 + i), x0 + (i + 0.5) * kw, y0 + kh / 2, { px: 30, gewicht: 700, uitlijn: 'center' });
    }
    tekst(ctx, 'week', x0 - 20, y0 + kh / 2, { px: 28, kleur: '#495057', gewicht: 600, uitlijn: 'right' });
    rooster.forEach((r, j) => {
      const y = y0 + kh + j * rh;
      streep(ctx, 20, y, W - 20, y, '#74c0fc', 2);
      tekst(ctx, String(r[0]), 30, y + rh / 2, { px: 36, gewicht: 700 });
      const w = weken(String(r[1]));
      // aaneengesloten weken als één streep
      let start = w[0];
      for (let i = 1; i <= w.length; i++) {
        if (i === w.length || w[i] !== w[i - 1] + 1) {
          const eind = w[i - 1];
          vlak(ctx, x0 + (start - 23) * kw + 8, y + rh / 2 - 18, (eind - start + 1) * kw - 16, 36, '#2f9e44', 18);
          start = w[i];
        }
      }
    });
  };
  const poster = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, 380, ['#ff922b', '#ffc9c9']));
    vlak(ctx, 0, 380, W, H - 380, '#ffffff');
    // paleis met koepels (eigen tekening)
    ctx.fillStyle = '#fff9f0';
    vlak(ctx, W / 2 - 170, 250, 340, 130, '#fff9f0');
    ctx.beginPath();
    ctx.arc(W / 2, 250, 95, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W / 2 - 14, 160);
    ctx.lineTo(W / 2, 110);
    ctx.lineTo(W / 2 + 14, 160);
    ctx.fill();
    for (const s of [-1, 1]) {
      vlak(ctx, W / 2 + s * 230 - 14, 170, 28, 210, '#fff9f0');
      ctx.beginPath();
      ctx.arc(W / 2 + s * 230, 170, 20, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W / 2 + s * 120, 255, 36, Math.PI, 0);
      ctx.fill();
    }
    vlak(ctx, W / 2 - 40, 300, 80, 80, '#ffd8a8', 40);
    tekst(ctx, 'Rondreis India', W / 2, 60, { px: 58, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Prijslijst', 30, 420, { px: 36, gewicht: 700, kleur: '#0c8599' });
    tabel(ctx, {
      x: 20,
      y: 450,
      b: W - 40,
      h: H - 470,
      kop,
      rijen: prijs,
      kolB: [0.62, 1.2, 1.2],
      kopH: 2.0,
      kopBg: '#0c8599',
      rijBg: ['#e3fafc', '#ffffff'],
      px: 28,
      kopPx: 24,
      lijn: '#99e9f2',
      uitlijn: ['center', 'center', 'center'],
    });
  };
  return (
    <group>
      <Scherm b={2.6} h={1.6} teken={plan} sleutel="rondreis-plan" pos={[-1.05, 1.75, 0.06]} rand={0.06} diep={0.05} kleur="#adb5bd" licht={false} />
      <Scherm b={1.7} h={2.3} teken={poster} sleutel="rondreis-poster" pos={[1.4, 1.65, 0.05]} rand={0.03} diep={0.03} kleur="#e8590c" licht={false} />
      <Olifantje />
    </group>
  );
}

// ───────────────────────── EIN-09: huurprijzen (rond scherm) ─────────────────────────

const HUUR_KLEUR: Record<string, string> = { donkerblauw: '#1d3f8a', lichtblauw: '#74c0fc', roze: '#f783ac', geel: '#ffd43b', grijs: '#adb5bd' };

/** EIN-09: rond scherm op een paal met de huurprijzen van 6.000 nieuwbouwwoningen, legenda ernaast. */
export function Huurprijzen() {
  const id = 'O5-EIN-09';
  const c = ctxVan(id);
  const rijen = rijenVan(id);
  const stukken: Stuk[] = rijen.map((r) => ({ v: getal(r[1]), kleur: HUUR_KLEUR[String(r[2])], label: String(r[1]) }));
  const schijf = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#1d2833');
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W * 0.475, 0, Math.PI * 2);
    ctx.stroke();
    taart(ctx, W / 2, H / 2, W * 0.31, stukken, { px: 54, buitenOnder: 0.05, buitenKleur: '#ffffff', tekstKleur: (k) => (licht(k) ? '#1f2a24' : '#ffffff') });
    // kleine dakjes in de stukken (alleen versiering, buiten de getallen)
    void H;
  };
  const [titel, sub] = (c.titel ?? '').split(' – ');
  const leg = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    regels(ctx, 'Overzicht huurprijzen\nper maand nieuwbouw', W / 2, 70, { px: 38, gewicht: 700, uitlijn: 'center', max: W - 30 });
    vlak(ctx, 24, 140, W - 48, 64, '#fff3bf', 12);
    tekst(ctx, sub ?? '', W / 2, 172, { px: 28, gewicht: 700, uitlijn: 'center', max: W - 60 });
    legenda(ctx, 40, 260, rijen.map((r) => ({ kleur: HUUR_KLEUR[String(r[2])], t: String(r[0]) })), { px: 34, rijH: 64, max: W - 110 });
    void titel;
    void H;
  };
  const tilt = -0.72;
  const tex = useScherm(2.4, 2.4, schijf, 'taart-ein09');
  return (
    <group>
      <group position={[-0.55, 0, 0]}>
        <Paal hoogte={1.45} kleur="#2f353b" r={0.1} />
        <group position={[0, 1.55, 0]} rotation={[tilt, 0, 0]}>
          <Cil r={1.08} h={0.12} pos={[0, 0, -0.07]} rot={[Math.PI / 2, 0, 0]} color="#2f353b" seg={48} />
          <mesh>
            <circleGeometry args={[1.02, 64]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group position={[1.3, 0, 0.15]}>
        <Blok size={[0.1, 1.0, 0.1]} pos={[0, 0.5, -0.15]} color="#2f353b" r={0.03} />
        <Scherm b={1.45} h={1.6} teken={leg} sleutel="huur-legenda" pos={[0, 1.3, 0]} rot={[tilt, 0, 0]} rand={0.05} diep={0.08} kleur="#2f353b" />
      </group>
      {/* grijs huisje waar nog licht brandt */}
      <group position={[-1.75, 0, 0.6]}>
        <Blok size={[0.4, 0.32, 0.36]} pos={[0, 0.16, 0]} color="#adb5bd" r={0.03} />
        <mesh position={[0, 0.42, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#868e96', { flat: true })}>
          <coneGeometry args={[0.3, 0.2, 4]} />
        </mesh>
        <mesh position={[0.06, 0.18, 0.181]} material={mat('#ffe066', { emissive: '#ffd43b' })}>
          <planeGeometry args={[0.1, 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

// ───────────────────────── EIN-10: T-shirts van Marieke ─────────────────────────

function Shirt({ pos, kleur }: { pos: V3; kleur: string }) {
  return (
    <group position={pos}>
      <Blok size={[0.32, 0.4, 0.03]} pos={[0, -0.22, 0]} color={kleur} r={0.02} />
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.14, 0.12, 0.03]} pos={[s * 0.2, -0.08, 0]} rot={[0, 0, s * 0.5]} color={kleur} r={0.02} />
      ))}
      <Blok size={[0.012, 0.06, 0.012]} pos={[0, 0.0, 0]} color="#495057" r={0.004} />
    </group>
  );
}

/** EIN-10: marktkraam met T-shirts, een prijsbord, een krijtbordje (verkocht in mei) en de formule. */
export function Tshirts() {
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#fff4e6');
    tekst(ctx, 'T-shirts van Marieke', W / 2, 58, { px: 50, kleur: '#d6336c', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Verkoopprijs:', 40, 150, { px: 38, gewicht: 600 });
    tekst(ctx, '€ 14,95 per stuk', W - 40, 150, { px: 40, gewicht: 700, uitlijn: 'right' });
    tekst(ctx, 'Maken kost:', 40, 225, { px: 38, gewicht: 600 });
    tekst(ctx, '€ 6,95 per stuk', W - 40, 225, { px: 40, gewicht: 700, uitlijn: 'right' });
    streep(ctx, 40, 186, W - 40, 186, '#f3d9de', 3);
    void H;
  };
  const krijt = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#2b3a33');
    tekst(ctx, 'Mei', W / 2, 50, { px: 40, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, '32 verkocht', W / 2, 125, { px: 48, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', max: W - 30 });
    void H;
  };
  const formule = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff', 12);
    tekst(ctx, 'Winst = aantal × (verkoopprijs − productiekosten)', W / 2, H / 2, { px: 36, gewicht: 700, uitlijn: 'center', max: W - 30 });
  };
  const kleuren = ['#e03131', '#1c7ed6', '#40c057', '#fab005', '#7950f2'];
  return (
    <group>
      {/* kraam */}
      <Blok size={[2.4, 0.9, 0.7]} pos={[0, 0.45, 0.35]} color="#c48a52" r={0.05} />
      <Blok size={[2.5, 0.05, 0.8]} pos={[0, 0.92, 0.35]} color="#e8d6b8" r={0.02} />
      {[-1.15, 1.15].map((x) => (
        <Cil key={x} r={0.04} h={2.85} pos={[x, 1.425, -0.25]} color="#7a4a2a" seg={8} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Blok key={i} size={[0.42, 0.06, 1.0]} pos={[-1.05 + i * 0.42, 2.88, 0.1]} rot={[0.2, 0, 0]} color={i % 2 ? '#fbf6ec' : '#d6336c'} r={0.02} />
      ))}
      {/* stang met shirts, boven het bord */}
      <Blok size={[2.3, 0.03, 0.03]} pos={[0, 2.5, -0.3]} color="#495057" r={0.01} />
      {kleuren.map((k, i) => (
        <Shirt key={k} pos={[-0.9 + i * 0.45, 2.5, -0.3]} kleur={k} />
      ))}
      <Scherm b={2.0} h={0.75} teken={bord} sleutel="tshirts-bord" pos={[0, 1.48, -0.1]} rand={0.04} diep={0.04} kleur="#d6336c" licht={false} />
      <Scherm b={2.2} h={0.24} teken={formule} sleutel="tshirts-formule" pos={[0, 0.62, 0.705]} rand={0} licht={false} />
      {/* krijtbordje op de toonbank */}
      <group position={[0.7, 0.95, 0.45]}>
        <Scherm b={0.8} h={0.45} teken={krijt} sleutel="tshirts-krijt" pos={[0, 0.25, 0]} rot={[-0.25, -0.2, 0]} rand={0.03} diep={0.03} kleur="#8a5a32" licht={false} />
      </group>
      {/* stapeltje shirts */}
      {[0, 1, 2].map((i) => (
        <Blok key={i} size={[0.36, 0.05, 0.28]} pos={[-0.7, 0.97 + i * 0.05, 0.4]} color={kleuren[i]} r={0.015} />
      ))}
    </group>
  );
}
