// Wereld 5 – modellen voor de keuzestations: expert, praktijk (buitenmissies) en puzzels.
// Wandmodellen: z = 0 is de muur, alles staat ervoor (z ≥ 0). Vloermodellen staan rond de oorsprong.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Deel, Maat } from '../game/inspectie';
import { useGroei, useOpgelost, useTip } from '../game/opgelost';
import { useSpel } from '../game/store';
import { Blok, Cil, mat } from '../game/kit';
import { Bordje } from '../game/tekst';
import { nl } from '../lib/getal';
import { ctxVan, getal, itemsVan, kolommenVan, O5, rijenVan } from './data5';
import { Beeld, opScherm, Paal, Scherm, useScherm } from './scherm';
import { alinea, grafiekVlak, legenda, licht, lijn, pijl, regels, ROND, streep, tabel, taart, tekst, verloop, vlak, VPM, type C } from './teken';

type V3 = [number, number, number];

// ───────────────────────── EXP-01 en EXP-02: serverruimte Kvick ─────────────────────────

const KVICK = { y0: 0.12, perK: 0.0022, kast: 0.62, tussen: 0.1 };

/** EXP-01/02: vier groene serverkasten (hoogte = aantal klanten), de gemiddelde-lijn en een reclamezuil. */
export function Kvick() {
  const id = 'O5-EXP-01';
  const rijen = rijenVan(id);
  const gemiddeld = rijen.reduce((a, r) => a + Number(r[1]), 0) / rijen.length;
  const hoogte = (n: number) => (n / 1000) * KVICK.perK;
  const xs = rijen.map((_, i) => -1.62 + i * (KVICK.kast + KVICK.tussen));
  const wand = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#0f7fa8', '#169b8a', '#2bb673']));
    tekst(ctx, 'Alle internetabonnementen van Kvick op een rij', W / 2, 52, { px: 44, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', max: W - 60 });
    pijl(ctx, 60, H - 150, 60, 140, '#ffffff', 8);
    tekst(ctx, 'Aantal klanten', 26, H / 2, { px: 34, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', draai: -Math.PI / 2 });
    tekst(ctx, 'Modus = meest voorkomende waarde', W / 2, H - 50, { px: 34, kleur: '#ffffff', gewicht: 600, uitlijn: 'center' });
  };
  const front = (r: (string | number)[]) => (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#16b06a');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    tekst(ctx, nl(Number(r[1])), W / 2, 50, { px: 42, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', max: W - 30 });
    tekst(ctx, String(r[0]), W / 2, 112, { px: 36, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', max: W - 30 });
    vlak(ctx, 26, 146, W - 52, 14, '#ffffff', 7);
    vlak(ctx, 26, 146, (W - 52) * Math.min(1, parseInt(String(r[2]), 10) / 1000), 14, '#1c7ed6', 7);
    tekst(ctx, `${r[2]} download`, W / 2, 190, { px: 25, kleur: '#ffffff', gewicht: 600, uitlijn: 'center', max: W - 30 });
    tekst(ctx, `${r[3]} upload`, W / 2, 226, { px: 25, kleur: '#ffffff', gewicht: 600, uitlijn: 'center', max: W - 30 });
    void H;
  };
  const zuil = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, verloop(ctx, 0, H, ['#0f7fa8', '#2bb673']));
    tekst(ctx, 'Nu', W / 2, 70, { px: 44, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    tekst(ctx, '30%', W / 2, 175, { px: 140, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', font: ROND });
    let y = alinea(ctx, 'korting op onze internetabonnementen*', 30, 255, W - 60, { px: 34, gewicht: 700, kleur: '#ffffff', regelH: 40 });
    y = alinea(ctx, '*Geldig voor Kvick Basis, Kvick Compleet, Kvick Mega en Kvick Mega Supersnel', 30, y + 12, W - 60, { px: 24, kleur: '#e6fcf5', regelH: 30 });
    vlak(ctx, 20, y + 20, W - 40, 330, '#1d4f91', 16);
    let y2 = y + 40;
    for (const t of ['Maandelijks aanpasbaar', 'Inclusief 2 gratis WiFipunten', 'Inclusief VidiThuis abonnement ter waarde van € 11,99']) {
      tekst(ctx, '–', 40, y2 + 16, { px: 28, kleur: '#ffffff', gewicht: 700 });
      y2 = alinea(ctx, t, 70, y2, W - 110, { px: 28, kleur: '#ffffff', gewicht: 600, regelH: 34 }) + 14;
    }
    vlak(ctx, 40, H - 110, W - 80, 70, '#ffffff', 35);
    tekst(ctx, 'Bekijk alle pakketten', W / 2, H - 75, { px: 30, kleur: '#0f7fa8', gewicht: 700, uitlijn: 'center', max: W - 110 });
  };
  const gemLabel = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, 'rgba(15,40,60,0.85)', 14);
    regels(ctx, 'Gemiddeld aantal klanten\nper abonnement', W / 2, H / 2, { px: 30, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
  };
  const vloer = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, 'rgba(0,0,0,0)');
    pijl(ctx, 30, H / 2, W - 30, H / 2, '#ffffff', 14);
    tekst(ctx, 'Prijs oplopend', W / 2, H / 2 - 40, { px: 40, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
  };
  const vloerTex = useScherm(2.6, 0.5, vloer, 'kvick-vloer');
  const yGem = KVICK.y0 + hoogte(gemiddeld);
  return (
    <group>
      <Scherm b={3.4} h={2.6} teken={wand} sleutel="kvick-wand" pos={[-0.55, 1.55, 0.04]} rand={0.04} diep={0.04} kleur="#0b5f7e" />
      {rijen.map((r, i) => {
        const hh = hoogte(Number(r[1]));
        return (
          <group key={i} position={[xs[i], 0, 0.42]}>
            <Blok size={[KVICK.kast, hh, 0.55]} pos={[0, KVICK.y0 + hh / 2, 0]} color="#0f8a52" r={0.03} />
            <Scherm b={KVICK.kast - 0.04} h={Math.min(hh - 0.04, 0.62)} teken={front(r)} sleutel={`kvick-kast-${i}`} pos={[0, KVICK.y0 + hh - Math.min(hh - 0.04, 0.62) / 2 - 0.02, 0.28]} rand={0} />
            {Array.from({ length: Math.max(0, Math.floor((hh - 0.7) / 0.12)) }, (_, k) => (
              <Blok key={k} size={[KVICK.kast - 0.12, 0.03, 0.02]} pos={[0, KVICK.y0 + 0.1 + k * 0.12, 0.28]} color="#0b6b40" r={0.008} shadow={false} />
            ))}
            <mesh position={[0.22, KVICK.y0 + 0.06, 0.281]} material={mat('#5fe0a1', { emissive: '#5fe0a1' })}>
              <circleGeometry args={[0.02, 10]} />
            </mesh>
          </group>
        );
      })}
      {/* lijn op het gemiddelde */}
      <Blok size={[xs[3] - xs[0] + KVICK.kast + 0.3, 0.025, 0.025]} pos={[(xs[0] + xs[3]) / 2, yGem, 0.72]} color="#ffffff" r={0.01} />
      <Scherm b={0.9} h={0.3} teken={gemLabel} sleutel="kvick-gemiddeld" pos={[xs[3] + 0.88, yGem, 0.3]} rand={0} />
      <Beeld b={2.6} h={0.5} tex={vloerTex} pos={[(xs[0] + xs[3]) / 2, 0.012, 1.05]} rot={[-Math.PI / 2, 0, 0]} />
      {/* reclamezuil (EXP-02) */}
      <group position={[2.55, 0, 0.35]}>
        <Blok size={[1.12, 2.6, 0.32]} pos={[0, 1.3, 0]} color="#0b5f7e" r={0.06} />
        <Scherm b={1.0} h={2.4} teken={zuil} sleutel="kvick-zuil" pos={[0, 1.3, 0.165]} rand={0} />
        {/* routertje met oogjes */}
        <group position={[-0.25, 0, 0.55]}>
          <Blok size={[0.34, 0.1, 0.22]} pos={[0, 0.05, 0]} color="#f8f9fa" r={0.03} />
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.07, 0.112]} material={mat('#1f2328')}>
              <circleGeometry args={[0.022, 10]} />
            </mesh>
          ))}
          {[-0.12, 0.12].map((x) => (
            <Cil key={x} r={0.008} h={0.18} pos={[x, 0.18, -0.06]} color="#2f3634" seg={6} />
          ))}
        </group>
      </group>
    </group>
  );
}

// ───────────────────────── EXP-03: wand van oude tv's ─────────────────────────

const TV = { x: 175, y: 120, pb: 1040, ph: 520 };
const ZENDER_KLEUR = ['#e03131', '#f08c00', '#12b886'];

function OudeTv({ pos, tex }: { pos: V3; tex: THREE.Texture }) {
  return (
    <group position={pos}>
      <Blok size={[0.78, 0.6, 0.5]} pos={[0, 0, -0.05]} color="#6b4f3a" r={0.08} />
      <Blok size={[0.6, 0.45, 0.04]} pos={[0, 0.02, 0.2]} color="#1f2328" r={0.06} />
      <Beeld b={0.52} h={0.38} tex={tex} pos={[0, 0.02, 0.225]} />
      <Cil r={0.03} h={0.03} pos={[0.33, -0.18, 0.21]} rot={[Math.PI / 2, 0, 0]} color="#d9d3c7" seg={8} />
    </group>
  );
}

/** EXP-03: groot scherm (kijktijd per zender) omringd door oude tv's; op één tv is sneeuw. */
export function TvWand() {
  const id = 'O5-EXP-03';
  const kol = kolommenVan(id);
  const rijen = rijenVan(id);
  const b = 3.2;
  const h = 2.0;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Verdeling kijktijd televisie', W / 2, 56, { px: 52, kleur: '#6f2dbd', gewicht: 700, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: TV.x,
      y: TV.y,
      b: TV.pb,
      h: TV.ph,
      ya: { min: 0, max: 40, stap: 5, fijn: 1, label: (v) => `${v}%` },
      xa: { min: -0.4, max: rijen.length - 0.6, stap: 1 },
      xLabels: rijen.map((r, i) => ({ v: i, t: String(r[0]) })),
      xRaster: false,
      px: 32,
      kleur: { raster: '#8f99a3', fijn: '#e3e7eb', as: '#1f2a24' },
      yLabelB: 90,
    });
    [1, 2, 3].forEach((k, z) => lijn(ctx, rijen.map((r, i) => [g.X(i), g.Y(getal(r[k]))]), ZENDER_KLEUR[z], 8, 9));
    kol.slice(1).forEach((t, z) => legenda(ctx, 190 + z * 360, 748, [{ kleur: ZENDER_KLEUR[z], t }], { px: 32, vorm: 'lijn', max: 280 }));
    void H;
  };
  const kleurbalken = useScherm(0.52, 0.38, (ctx, W, H) => {
    ['#ffffff', '#ffd43b', '#22b8cf', '#51cf66', '#cc5de8', '#ff6b6b', '#4c6ef5'].forEach((k, i) => vlak(ctx, (i * W) / 7, 0, W / 7 + 1, H * 0.75, k));
    vlak(ctx, 0, H * 0.75, W, H * 0.25, '#1f2328');
  }, 'tv-kleurbalken');
  const sneeuw = useScherm(0.52, 0.38, (ctx, W, H) => {
    for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
      const v = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      const g = Math.floor(Math.abs(v) * 255);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }, 'tv-sneeuw');
  return (
    <group>
      <Blok size={[b + 0.4, h + 0.4, 0.45]} pos={[0, 1.6, 0.2]} color="#5a4232" r={0.12} />
      <Scherm b={b} h={h} teken={teken} sleutel="tv-wand" pos={[0, 1.6, 0.43]} rand={0.04} diep={0.03} kleur="#1f2328" />
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => (
          <OudeTv key={`${s}${i}`} pos={[s * 2.2, 0.75 + i * 0.66, 0.25]} tex={s === 1 && i === 0 ? sneeuw : kleurbalken} />
        )),
      )}
    </group>
  );
}

// ───────────────────────── EXP-04: vakantiegids Greenfield ─────────────────────────

/** EXP-04: groot opengeslagen boek op een leestafel: winter links (met toeslagen), zomer rechts (met voetnoot). */
export function Vakantiegids() {
  const id = 'O5-EXP-04';
  const kop = kolommenVan(id).map((k) => k.replace(' personen', '\npersonen'));
  const rijen = rijenVan(id);
  const toeslagen = itemsVan(id, 1).filter((i) => !i.label.startsWith('korting'));
  const pb = 1.6;
  const ph = 2.1;
  const pagina = (seizoen: 'Winter' | 'Zomer') => (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#fffdf7');
    const deel = rijen.filter((r) => String(r[0]).startsWith(seizoen));
    const kleur = seizoen === 'Winter' ? ['#d0ebff', '#a5d8ff'] : ['#ffe8cc', '#ffc078'];
    if (seizoen === 'Winter') {
      tekst(ctx, 'Greenfield', 36, 50, { px: 50, kleur: '#2b8a3e', gewicht: 700, font: ROND });
      tekst(ctx, 'Tarieven per nacht*', W - 36, 54, { px: 30, kleur: '#495057', gewicht: 700, uitlijn: 'right' });
    } else tekst(ctx, 'Tarieven vakantiehuis per nacht*', W / 2, 52, { px: 32, kleur: '#495057', gewicht: 700, uitlijn: 'center' });
    tabel(ctx, {
      x: 24,
      y: 95,
      b: W - 48,
      h: 460,
      kop,
      rijen: deel.map((r) => [String(r[0]).replace(' - ', ' -\n'), ...r.slice(1)]),
      kolB: [1.5, 1.0, 1, 1, 1],
      kopBg: seizoen === 'Winter' ? '#1971c2' : '#e8590c',
      rijBg: kleur,
      px: 28,
      kopPx: 26,
      tussen: 4,
      cel: (r, k) => (k === 0 ? { bg: r < 3 ? kleur[0] : kleur[1], fg: '#1f2a24', gewicht: 700 } : undefined),
    });
    if (seizoen === 'Winter') {
      vlak(ctx, 24, 580, W - 48, H - 600, '#2f9e44', 16);
      tekst(ctx, 'Toeslagen', 50, 620, { px: 36, kleur: '#ffffff', gewicht: 700 });
      toeslagen.forEach((t, i) => {
        const y = 680 + i * 52;
        tekst(ctx, t.label, 50, y, { px: 28, kleur: '#ffffff', gewicht: 700 });
        tekst(ctx, String(t.waarde), 230, y, { px: 28, kleur: '#ffffff', gewicht: 600, max: W - 280 });
      });
    } else
      alinea(ctx, '* De vermelde tarieven gelden voor de eerste drie nachten. Voor elke aansluitende nacht geldt een korting van € 11,25 per nacht.', 30, 600, W - 60, { px: 28, kleur: '#343a40', gewicht: 600, regelH: 36 });
  };
  const tilt = -0.75;
  return (
    <group>
      {/* leestafel */}
      <Blok size={[3.5, 0.08, 1.6]} pos={[0, 0.76, 0]} color="#8a5a32" r={0.03} />
      {[-1.6, 1.6].map((x) => (
        <Blok key={x} size={[0.1, 0.74, 1.4]} pos={[x, 0.37, 0]} color="#6b4428" r={0.03} />
      ))}
      <group position={[0, 1.63, 0]} rotation={[tilt, 0, 0]}>
        <Blok size={[pb * 2 + 0.16, ph + 0.12, 0.05]} pos={[0, 0, -0.04]} color="#2b8a3e" r={0.02} />
        <Blok size={[0.05, ph, 0.03]} pos={[0, 0, 0.0]} color="#d8cfb8" r={0.01} />
        <Scherm b={pb} h={ph} teken={pagina('Winter')} sleutel="greenfield-winter" pos={[-pb / 2 - 0.02, 0, 0.004]} rand={0} licht={false} />
        <Scherm b={pb} h={ph} teken={pagina('Zomer')} sleutel="greenfield-zomer" pos={[pb / 2 + 0.02, 0, 0.004]} rand={0} licht={false} />
      </group>
      <Blok size={[0.12, 1.3, 0.12]} pos={[0, 1.3, -0.62]} rot={[-0.4, 0, 0]} color="#6b4428" r={0.03} />
    </group>
  );
}

// ───────────────────────── EXP-05: dashboard spaargeld ─────────────────────────

/** EXP-05: breed dashboard met drie vakken: huishoudens (staven), personen per huishouden (tabel) en spaargeld (lijn). */
export function Spaargeld() {
  const id = 'O5-EXP-05';
  const huis = rijenVan(id, 0);
  const pers = rijenVan(id, 1);
  const spaar = rijenVan(id, 2);
  const b = 4.4;
  const h = 2.8;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#e9eef3');
    const paneel = (x: number, y: number, w: number, hh: number) => {
      vlak(ctx, x + 6, y + 8, w, hh, 'rgba(0,0,0,0.12)', 14);
      vlak(ctx, x, y, w, hh, '#ffffff', 14);
    };
    paneel(24, 24, 1080, 500);
    tekst(ctx, 'Huishoudens in Nederland', 560, 62, { px: 40, gewicht: 700, uitlijn: 'center' });
    const g1 = grafiekVlak(ctx, {
      x: 330,
      y: 105,
      b: 720,
      h: 320,
      ya: { min: 6000, max: 8000, stap: 500, fijn: 100, label: (v) => nl(v), titel: 'Aantal huishoudens (× 1.000)' },
      cats: huis.map((r) => String(r[0])),
      px: 32,
      kleur: { raster: '#8f99a3', fijn: '#e3e7eb', as: '#1f2a24' },
      yLabelB: 110,
    });
    huis.forEach((r, i) => vlak(ctx, g1.cat(i) - g1.catB * 0.28, g1.Y(Number(r[1])), g1.catB * 0.56, g1.Y(6000) - g1.Y(Number(r[1])), '#1c7ed6'));
    tekst(ctx, '× 1.000: 7.000 betekent 7.000.000 huishoudens', 560, 500, { px: 26, kleur: '#495057', gewicht: 600, uitlijn: 'center' });
    paneel(1130, 24, 606, 500);
    regels(ctx, 'Gemiddeld aantal personen\nper huishouden', 1433, 85, { px: 34, gewicht: 700, uitlijn: 'center' });
    tabel(ctx, { x: 1170, y: 150, b: 526, h: 340, kop: kolommenVan(id, 1), rijen: pers, kopBg: '#1c7ed6', rijBg: ['#f1f3f5', '#ffffff'], px: 40, uitlijn: ['center', 'center'] });
    paneel(24, 548, W - 48, H - 572);
    tekst(ctx, 'Totaal spaargeld van Nederlandse huishoudens', 60, 592, { px: 40, gewicht: 700 });
    tekst(ctx, 'Bron: CBS Statline, DNB', W - 60, 592, { px: 26, kleur: '#868e96', uitlijn: 'right' });
    const g2 = grafiekVlak(ctx, {
      x: 330,
      y: 645,
      b: 1330,
      h: 370,
      ya: { min: 0, max: 400, stap: 100, fijn: 25, label: (v) => `€ ${v}`, titel: 'Bedrag (× miljard)' },
      xa: { min: 1996, max: 2020, stap: 5 },
      xLabels: spaar.map((r) => ({ v: Number(r[0]), t: String(r[0]) })),
      px: 30,
      kleur: { raster: '#8f99a3', fijn: '#e3e7eb', vert: '#eef1f4', as: '#1f2a24' },
      yLabelB: 110,
    });
    lijn(ctx, spaar.map((r) => [g2.X(Number(r[0])), g2.Y(getal(r[1]))]), '#1c7ed6', 8, 10);
    tekst(ctx, '× miljard: € 100 betekent € 100.000.000.000', W - 60, H - 44, { px: 26, kleur: '#495057', gewicht: 600, uitlijn: 'right' });
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="spaargeld" pos={[0, 1.6, 0.08]} rand={0.08} diep={0.08} />
      {/* spaarvarken op een plankje */}
      <group position={[2.6, 0, 0.45]}>
        <Blok size={[0.6, 0.5, 0.4]} pos={[0, 0.25, 0]} color="#d9d3c7" r={0.05} />
        <mesh position={[0, 0.68, 0]} scale={[1.25, 1, 1]} material={mat('#f8a5c2')}>
          <sphereGeometry args={[0.17, 16, 12]} />
        </mesh>
        <Cil r={0.06} h={0.06} pos={[0.22, 0.68, 0]} rot={[0, 0, Math.PI / 2]} color="#f783ac" seg={12} />
        <Blok size={[0.08, 0.012, 0.02]} pos={[0, 0.85, 0]} color="#2f3634" r={0.004} />
      </group>
    </group>
  );
}

// ───────────────────────── EXP-06: weerscherm zomertemperatuur ─────────────────────────

const WEER = { x: 260, y: 150, pb: 1180, ph: 590 };

/** EXP-06: weerscherm (as begint bij 13 °C) met de rode lijn per jaar en de blauwe trendlijn. */
export function Zomertemperatuur() {
  const id = 'O5-EXP-06';
  const trend = rijenVan(id, 0);
  const jaren = rijenVan(id, 1);
  const b = 4.0;
  const h = 2.3;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#f4f9ff');
    tekst(ctx, 'Gemiddelde zomertemperatuur', 40, 56, { px: 52, kleur: '#1f2a24', gewicht: 700 });
    tekst(ctx, 'Gemeten in de Bilt sinds 1901', 40, 108, { px: 32, kleur: '#495057', gewicht: 600 });
    const g = grafiekVlak(ctx, {
      x: WEER.x,
      y: WEER.y,
      b: WEER.pb,
      h: WEER.ph,
      ya: { min: 13, max: 20, stap: 1, label: (v) => `${v} °C` },
      xa: { min: 1898, max: 2024, stap: 20 },
      xLabels: [1900, 1920, 1940, 1960, 1980, 2000, 2020].map((j) => ({ v: j, t: String(j) })),
      px: 32,
      kleur: { raster: '#b8c2cc', vert: '#e3e8ee', as: '#1f2a24' },
      yLabelB: 110,
    });
    // thermometer langs de as
    const tx = WEER.x - 175;
    vlak(ctx, tx - 14, WEER.y - 10, 28, WEER.ph + 10, '#ffffff', 14);
    rand2(ctx, tx - 14, WEER.y - 10, 28, WEER.ph + 10);
    vlak(ctx, tx - 7, WEER.y + WEER.ph * 0.35, 14, WEER.ph * 0.65, '#e03131', 7);
    ctx.fillStyle = '#e03131';
    ctx.beginPath();
    ctx.arc(tx, WEER.y + WEER.ph + 20, 26, 0, Math.PI * 2);
    ctx.fill();
    lijn(ctx, jaren.map((r) => [g.X(Number(r[0])), g.Y(Number(r[1]))]), '#e03131', 3.5);
    lijn(ctx, trend.map((r) => [g.X(Number(r[0])), g.Y(Number(r[1]))]), '#1c7ed6', 12);
    const ly = H - 50;
    ctx.fillStyle = '#e03131';
    ctx.beginPath();
    ctx.arc(WEER.x + 20, ly, 14, 0, Math.PI * 2);
    ctx.fill();
    tekst(ctx, 'gemiddelde', WEER.x + 45, ly, { px: 32 });
    ctx.fillStyle = '#1c7ed6';
    ctx.beginPath();
    ctx.arc(WEER.x + 300, ly, 14, 0, Math.PI * 2);
    ctx.fill();
    tekst(ctx, 'trendlijn', WEER.x + 325, ly, { px: 32 });
    tekst(ctx, 'Bron: KNMI', W - 40, ly, { px: 28, kleur: '#868e96', uitlijn: 'right' });
  };
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="zomertemperatuur" pos={[0, 1.7, 0.08]} rand={0.08} diep={0.08} kleur="#2f4f6f" />
      {/* ijsje op een stokje naast het scherm */}
      <group position={[2.35, 1.5, 0.12]}>
        <Blok size={[0.03, 0.4, 0.03]} pos={[0, 0.2, 0]} color="#9aa3a8" r={0.01} />
        <Blok size={[0.16, 0.24, 0.07]} pos={[0, -0.12, 0]} color="#ff8fab" r={0.05} />
        <Blok size={[0.025, 0.1, 0.02]} pos={[0, -0.28, 0]} color="#e8d6b8" r={0.008} />
        <mesh position={[0.03, -0.27, 0.0]} material={mat('#ff8fab')}>
          <sphereGeometry args={[0.025, 8, 6]} />
        </mesh>
      </group>
    </group>
  );
}
function rand2(ctx: C, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = '#9aa3a8';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
}

// ───────────────────────── EXP-07: Monti College (examens) ─────────────────────────

const MONTI_KLEUR: Record<string, string> = { geel: '#f5c518', blauw: '#1c7ed6', oranje: '#f08c00', grijs: '#868e96' };
const UITSLAG_KLEUR = ['#f08c00', '#1c7ed6', '#f5c518'];

/** EXP-07: twee schermen: cirkeldiagram met kandidaten per sector en liggende staven met resultaten. */
export function Examens() {
  const id = 'O5-EXP-07';
  const sectoren = rijenVan(id, 0);
  const uitslag = rijenVan(id, 1);
  const soorten = kolommenVan(id, 1).slice(1);
  const links = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    regels(ctx, 'Aantal examenkandidaten\neerste tijdvak Monti College\nper sector', W / 2, 92, { px: 36, gewicht: 700, uitlijn: 'center', max: W - 40 });
    taart(
      ctx,
      W / 2,
      445,
      240,
      sectoren.map((r) => ({ v: Number(r[1]), kleur: MONTI_KLEUR[String(r[2])], label: String(r[1]) })),
      { px: 46, tekstKleur: (k) => (licht(k) ? '#1f2a24' : '#ffffff') },
    );
    sectoren.forEach((r, i) => {
      const x = 40 + (i % 2) * 380;
      const y = 740 + Math.floor(i / 2) * 60;
      legenda(ctx, x, y, [{ kleur: MONTI_KLEUR[String(r[2])], t: String(r[0]) }], { px: 32, max: 320 });
    });
    void H;
  };
  const rechts = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    regels(ctx, 'Resultaten eindexamen eerste tijdvak\nMonti College', W / 2, 70, { px: 36, gewicht: 700, uitlijn: 'center' });
    const x0 = 330;
    const pb = W - x0 - 50;
    const y0 = 145;
    const ph = 590;
    const X = (v: number) => x0 + (v / 100) * pb;
    for (let v = 0; v <= 100; v += 5) streep(ctx, X(v), y0, X(v), y0 + ph, v % 20 === 0 ? '#8f99a3' : '#e3e7eb', v % 20 === 0 ? 3 : 2);
    for (let v = 0; v <= 100; v += 20) tekst(ctx, `${v}%`, X(v), y0 + ph + 30, { px: 30, uitlijn: 'center' });
    const gh = ph / uitslag.length;
    uitslag.forEach((r, i) => {
      const gy = y0 + i * gh;
      tekst(ctx, String(r[0]), x0 - 20, gy + gh / 2, { px: 32, gewicht: 700, uitlijn: 'right', max: x0 - 30 });
      [1, 2, 3].forEach((k, j) => {
        const by = gy + 14 + j * ((gh - 28) / 3);
        vlak(ctx, X(0), by, X(getal(r[k])) - X(0), (gh - 28) / 3 - 4, UITSLAG_KLEUR[j]);
      });
      streep(ctx, x0, gy, W - 50, gy, '#ced4da', 2);
    });
    streep(ctx, x0, y0, x0, y0 + ph, '#1f2a24', 4);
    soorten.forEach((t, j) => legenda(ctx, 120 + j * 320, H - 60, [{ kleur: UITSLAG_KLEUR[j], t }], { px: 32 }));
  };
  return (
    <group>
      <Scherm b={2.0} h={2.2} teken={links} sleutel="monti-taart" pos={[-1.55, 1.7, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      <Scherm b={2.8} h={2.2} teken={rechts} sleutel="monti-staven" pos={[1.0, 1.7, 0.08]} rand={0.06} diep={0.08} kleur="#2f353b" />
      {/* uil met afstudeerhoedje */}
      <group position={[1.9, 2.98, 0.12]}>
        <mesh scale={[1, 1.15, 0.9]} material={mat('#8a6a4a')}>
          <sphereGeometry args={[0.13, 14, 10]} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 0.04, 0.11]} material={mat('#ffffff')}>
            <circleGeometry args={[0.035, 12]} />
          </mesh>
        ))}
        <Blok size={[0.22, 0.02, 0.22]} pos={[0, 0.16, 0]} color="#1f2328" r={0.005} />
      </group>
    </group>
  );
}

// ───────────────────────── EXP-08: coopertest ─────────────────────────

const COOPER_KOP = ['#495057', '#495057', '#1c7ed6', '#2f9e44', '#f5c518', '#f08c00', '#e03131'];

/** EXP-08: lichtbord met de coopertesttabel, een maquette van de baan (520 m) en het briefje van Mattheus. */
export function Coopertest() {
  const id = 'O5-EXP-08';
  const ctx0 = ctxVan(id);
  const rijen = rijenVan(id);
  const items = itemsVan(id);
  const b = 4.4;
  const h = 2.4;
  const breek = (s: string | number) => String(s).replace(' – ', ' –\n').replace(/^(Meer|Minder) dan /, '$1 dan\n').replace(' en ouder', '\nen ouder');
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Coopertest', 36, 54, { px: 54, gewicht: 700, kleur: '#1f2a24', font: ROND });
    tekst(ctx, 'Doel: leg een zo groot mogelijke afstand af in 12 minuten.', W - 36, 58, { px: 32, gewicht: 600, kleur: '#495057', uitlijn: 'right' });
    tabel(ctx, {
      x: 24,
      y: 110,
      b: W - 48,
      h: H - 130,
      kop: kolommenVan(id).map(breek),
      rijen: rijen.map((r) => r.map(breek)),
      kolB: [1.15, 0.85, 1.3, 1.3, 1.3, 1.3, 1.3],
      kopBg: COOPER_KOP,
      kopFg: '#ffffff',
      kopH: 0.85,
      px: 40,
      kopPx: 36,
      tussen: 6,
      hoek: 6,
      cel: (r, k) => (k < 2 ? { bg: ['#d0ebff', '#e9ecef', '#ced4da'][Math.floor(r / 2)], fg: '#1f2a24', gewicht: 700 } : { bg: r % 2 ? '#f8f9fa' : '#ffffff', fg: '#1f2a24', gewicht: 600 }),
    });
    void ctx0;
  };
  const briefje = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#fffbe6');
    tekst(ctx, 'Gegevens', 24, 44, { px: 38, gewicht: 700 });
    items.forEach((it, i) => tekst(ctx, `${it.label}: ${it.waarde}`, 24, 110 + i * 56, { px: 32, gewicht: 600, max: W - 40 }));
    void H;
  };
  const baan = useScherm(1.0, 0.3, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#ffffff', 16);
    tekst(ctx, '1 rondje = 520 m', W / 2, H / 2, { px: 46, gewicht: 700, uitlijn: 'center', max: W - 20 });
  }, 'cooper-baan');
  return (
    <group>
      <Scherm b={b} h={h} teken={teken} sleutel="coopertest" pos={[0, 1.75, 0.08]} rand={0.1} diep={0.1} kleur="#343a40" />
      {/* maquette van de baan */}
      <group position={[-0.7, 0, 1.0]}>
        <Blok size={[2.0, 0.12, 1.1]} pos={[0, 0.06, 0]} color="#d9d3c7" r={0.04} />
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 1, 1]} material={mat('#c2563a')}>
          <ringGeometry args={[0.32, 0.46, 40]} />
        </mesh>
        <mesh position={[0, 0.131, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 1, 1]} material={mat('#69a843')}>
          <circleGeometry args={[0.32, 32]} />
        </mesh>
        <Beeld b={0.62} h={0.19} tex={baan} pos={[0, 0.14, 0.0]} rot={[-Math.PI / 2, 0, 0]} />
        {/* banaan op de baan */}
        <Blok size={[0.08, 0.02, 0.025]} pos={[0.55, 0.15, 0.12]} rot={[0, 0.5, 0]} color="#ffd43b" r={0.01} />
      </group>
      {/* klembord met het briefje */}
      <group position={[2.75, 0, 0.7]}>
        <Blok size={[0.05, 0.75, 0.05]} pos={[0, 0.375, -0.1]} color="#2f3634" r={0.02} />
        <Blok size={[0.8, 0.95, 0.03]} pos={[0, 1.05, -0.06]} rot={[-0.3, 0, 0]} color="#8a5a32" r={0.02} />
        <Scherm b={0.7} h={0.8} teken={briefje} sleutel="cooper-briefje" pos={[0, 1.04, -0.035]} rot={[-0.3, 0, 0.05]} rand={0} licht={false} />
      </group>
    </group>
  );
}

// ───────────────────────── EXP-09: Molenronde (kaarttafel) ─────────────────────────

/** Route over het schiereiland (vpx op de kaart), met de klok mee vanaf de start onderaan. */
const ROUTE: [number, number][] = [
  [470, 560], [380, 548], [290, 520], [215, 470], [185, 400], [190, 320], [215, 245], [265, 180], [340, 135], [430, 112],
  [530, 112], [620, 125], [700, 150], [770, 185], [835, 200], [860, 245], [830, 290], [770, 310], [740, 360], [735, 420],
  [700, 480], [630, 530], [550, 556], [470, 560],
];
const STEMPEL: [number, number][] = [
  [190, 360],
  [700, 150],
  [860, 245],
  [737, 395],
  [665, 506],
];
const BAS = { x: 180, y: 110, pb: 620, ph: 360 };

function Molentje({ pos }: { pos: V3 }) {
  const wiek = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wiek.current) wiek.current.rotation.z = clock.getElapsedTime() * 1.4;
  });
  return (
    <group position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <Cil r={0.06} rTop={0.035} h={0.2} pos={[0, 0.1, 0]} color="#f8f9fa" seg={8} />
      <mesh position={[0, 0.23, 0]} material={mat('#c92a2a')}>
        <coneGeometry args={[0.05, 0.07, 8]} />
      </mesh>
      <group ref={wiek} position={[0, 0.18, 0.05]}>
        {[0, 1, 2, 3].map((i) => (
          <Blok key={i} size={[0.025, 0.16, 0.005]} pos={[Math.sin((i * Math.PI) / 2) * 0.08, Math.cos((i * Math.PI) / 2) * 0.08, 0]} rot={[0, 0, -(i * Math.PI) / 2]} color="#8a5a32" r={0.002} shadow={false} />
        ))}
      </group>
    </group>
  );
}

/** EXP-09: kaarttafel met de Molenronde (180 km, 5 stempelposten) en een schermpje met de training van Bas. */
export function Molenronde() {
  const id = 'O5-EXP-09';
  const training = rijenVan(id, 1);
  const kb = 2.4;
  const kh = 1.5;
  const kaart = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#8ecae6');
    for (let i = 0; i < 40; i++) streep(ctx, (i * 131) % W, (i * 71) % H, ((i * 131) % W) + 40, (i * 71) % H, 'rgba(255,255,255,0.35)', 3);
    ctx.fillStyle = '#f6e27f';
    ctx.strokeStyle = '#c9b458';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const kust: [number, number][] = [
      [520, H + 10], [330, 600], [200, 540], [140, 450], [135, 330], [160, 220], [230, 130], [330, 80], [450, 62],
      [560, 64], [660, 80], [760, 120], [850, 150], [905, 210], [890, 290], [820, 340], [800, 420], [770, 500], [700, 570], [620, 600], [600, H + 10],
    ];
    kust.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // gemeentegrenzen
    for (const [a, b2] of [
      [[300, 100], [420, 330]],
      [[420, 330], [700, 250]],
      [[420, 330], [380, 590]],
      [[600, 70], [640, 300]],
      [[150, 300], [420, 330]],
    ] as [[number, number], [number, number]][])
      streep(ctx, a[0], a[1], b2[0], b2[1], '#b8b8a8', 3, [10, 8]);
    lijn(ctx, ROUTE, '#d6202a', 9);
    // pijltjes voor de rijrichting
    [2, 7, 11, 16, 21].forEach((i) => {
      const [x1, y1] = ROUTE[i];
      const [x2, y2] = ROUTE[i + 1];
      pijl(ctx, x1 + (x2 - x1) * 0.2, y1 + (y2 - y1) * 0.2, x1 + (x2 - x1) * 0.8, y1 + (y2 - y1) * 0.8, '#7a0c12', 6);
    });
    for (const [x, y] of STEMPEL) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1f2a24';
      ctx.lineWidth = 4;
      ctx.stroke();
      tekst(ctx, 'S', x, y + 1, { px: 32, gewicht: 700, uitlijn: 'center' });
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(470, 560, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1f2a24';
    ctx.stroke();
    tekst(ctx, 'start en finish', 470, 520, { px: 26, gewicht: 700, uitlijn: 'center' });
    tekst(ctx, 'De Molenronde', 40, 40, { px: 44, gewicht: 700, kleur: '#0b3954', font: ROND });
    vlak(ctx, 20, 440, 270, 140, 'rgba(255,255,255,0.92)', 12);
    streep(ctx, 40, 470, 100, 470, '#d6202a', 9);
    tekst(ctx, '= 180 km', 115, 470, { px: 28, gewicht: 700 });
    tekst(ctx, 'S = stempelpost', 40, 515, { px: 28, gewicht: 700 });
    pijl(ctx, 40, 555, 100, 555, '#7a0c12', 6);
    tekst(ctx, '= rijrichting', 115, 555, { px: 28, gewicht: 700 });
  };
  const grafiek = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Verloop laatste training Bas', W / 2, 40, { px: 34, gewicht: 700, uitlijn: 'center' });
    const g = grafiekVlak(ctx, {
      x: BAS.x,
      y: BAS.y,
      b: BAS.pb,
      h: BAS.ph,
      ya: { min: 0, max: 30, stap: 5, fijn: 1, titel: 'Afstand (km)' },
      xa: { min: 0, max: 45, stap: 5 },
      xTitel: 'Tijd (min.)',
      px: 28,
      kleur: { raster: '#8f99a3', fijn: '#e3e7eb', vert: '#e3e7eb', as: '#1f2a24' },
      yLabelB: 45,
    });
    lijn(ctx, training.map((r) => [g.X(Number(r[0])), g.Y(Number(r[1]))]), '#1c7ed6', 7);
    void H;
  };
  const p = opScherm(kb, kh);
  const tilt = -Math.PI / 2 + 0.42;
  return (
    <group>
      {[-1.5, 0.8].map((x) =>
        [
          [0.6, 0.8],
          [-0.6, 1.33],
        ].map(([z, hh]) => <Blok key={`${x}${z}`} size={[0.09, hh, 0.09]} pos={[x, hh / 2, z]} color="#6b4428" r={0.03} />),
      )}
      <group position={[-0.35, 1.08, 0]} rotation={[tilt, 0, 0]}>
        <Scherm b={kb} h={kh} teken={kaart} sleutel="molenronde-kaart" rand={0.05} diep={0.05} kleur="#6b4428" licht={false}>
          {STEMPEL.map(([x, y], i) => (
            <Molentje key={i} pos={p(x + 34, y - 30, 0.0)} />
          ))}
        </Scherm>
      </group>
      {/* schermpje met de training */}
      <group position={[1.45, 0, 0.1]}>
        <Paal hoogte={1.05} r={0.06} kleur="#2f3634" />
        <Scherm b={1.25} h={0.95} teken={grafiek} sleutel="molenronde-training" pos={[0, 1.45, 0]} rot={[-0.35, 0, 0]} rand={0.05} diep={0.06} />
      </group>
    </group>
  );
}

// ───────────────────────── EXP-10: magazijnstelling ─────────────────────────

const STELLING = { vak: 0.9, diep: 0.4, hoog: 2.0, planken: 7 };

function Vak({ x, staanders }: { x: number; staanders: number[] }) {
  const { vak, diep, hoog, planken } = STELLING;
  return (
    <group position={[x, 0, 0]}>
      {staanders.map((sx) =>
        [-diep / 2, diep / 2].map((z) => <Blok key={`${sx}${z}`} size={[0.04, hoog, 0.04]} pos={[sx, hoog / 2, z]} color="#6c757d" r={0.01} />),
      )}
      {Array.from({ length: planken }, (_, i) => (
        <Blok key={i} size={[vak - 0.04, 0.03, diep]} pos={[0, 0.1 + (i * (hoog - 0.16)) / (planken - 1), 0]} color="#adb5bd" r={0.01} />
      ))}
    </group>
  );
}

/** EXP-10: echte stelling van 270 cm (1 basisvak + 2 aanbouwvakken, 7 planken, 40 cm diep) en een geel prijsbord. */
export function Magazijn() {
  const id = 'O5-EXP-10';
  const kop = kolommenVan(id).map((k) => k.replace(' planken', '\nplanken'));
  const rijen = rijenVan(id);
  const { vak, diep, hoog } = STELLING;
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffe066');
    vlak(ctx, 0, 0, W, 76, '#1c4e9c');
    tekst(ctx, 'Magazijnstelling', W / 2, 40, { px: 46, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    tabel(ctx, {
      x: 20,
      y: 92,
      b: W - 40,
      h: H - 210,
      kop,
      rijen: rijen.map((r) => [String(r[0]).replace(' 90 cm', '\n90 cm'), String(r[1]).replace(' diep', '\ndiep'), ...r.slice(2)]),
      kolB: [1.9, 0.95, 0.85, 0.85, 0.85, 0.85],
      kopBg: '#1c4e9c',
      kopH: 1.1,
      rijBg: ['#fff3bf', '#fffbe6'],
      px: 30,
      kopPx: 26,
      lijn: '#d9b92e',
      lijnDik: 2,
    });
    alinea(ctx, '*Voor een stelling heeft u één basisvak en een aantal aanbouwvakken naar keuze nodig.', 24, H - 100, W - 48, { px: 26, kleur: '#343a40', gewicht: 600, regelH: 32 });
  };
  const kat = (
    <group position={[-0.2, hoog + 0.02, 0]}>
      <mesh position={[0, 0.1, 0]} scale={[1.4, 0.9, 1]} material={mat('#495057')}>
        <sphereGeometry args={[0.09, 12, 8]} />
      </mesh>
      <mesh position={[0.14, 0.18, 0]} material={mat('#495057')}>
        <sphereGeometry args={[0.065, 12, 8]} />
      </mesh>
      <Blok size={[0.2, 0.16, 0.16]} pos={[0.32, 0.08, 0]} color="#c9a26a" r={0.02} />
    </group>
  );
  const x0 = -1.75;
  const opgelost = useOpgelost(id);
  const tip = useTip(id);
  const heel = opgelost || tip >= 2;
  const derde = useGroei(heel, 0.1, 'alle');
  return (
    <group>
      <group position={[x0, 0, diep / 2 + 0.06]}>
        <Deel id="stelling" uit={[0, 0, 0.7]} label="1 stelling: basisvak + 2 aanbouwvakken">
          <Vak x={0} staanders={[-vak / 2, vak / 2]} />
          <Deel id="vakken" uit={[0.55, 0, 0]} label="Aanbouwvakken van 90 cm">
            <Vak x={vak} staanders={[vak / 2]} />
            <group position={[vak * 1.5, 0, 0]}>
              <group ref={derde} position={[-vak * 1.5, 0, 0]}>
                <Vak x={vak * 2} staanders={[vak / 2]} />
              </group>
            </group>
          </Deel>
          {kat}
        </Deel>
        {heel && <Maat van={[-vak / 2, 0.05, diep / 2 + 0.12]} naar={[vak * 2.5, 0.05, diep / 2 + 0.12]} label="270 cm" />}
        <Maat van={[-vak / 2, hoog + 0.12, diep / 2]} naar={[vak / 2, hoog + 0.12, diep / 2]} label="90 cm" />
        <Maat van={[vak * 1.5 + 0.12, 0.05, -diep / 2]} naar={[vak * 1.5 + 0.12, 0.05, diep / 2]} label="40 cm" />
      </group>
      <Scherm b={2.3} h={2.1} teken={bord} sleutel="magazijn-prijsbord" pos={[1.65, 1.6, 0.05]} rand={0.04} diep={0.04} kleur="#c9a227" licht={false} />
    </group>
  );
}

// ───────────────────────── PRA A: sportwinkel (voorraad) ─────────────────────────

/** Praktijk A: voorraadbord in de sportwinkel met een rek met voetballen, bidons en sokken. */
export function Sportwinkel() {
  const id = 'O5-PRA-01a';
  const rijen = rijenVan(id);
  const kop = kolommenVan(id).map((k) => k.replace('Verkocht deze week', 'Verkocht\ndeze week').replace('Nieuwe levering', 'Nieuwe\nlevering'));
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    vlak(ctx, 0, 0, W, 84, '#1c7ed6');
    tekst(ctx, 'Sportwinkel – voorraad begin van de week', W / 2, 44, { px: 40, kleur: '#ffffff', gewicht: 700, uitlijn: 'center', max: W - 40 });
    tabel(ctx, { x: 30, y: 110, b: W - 60, h: H - 140, kop, rijen, kolB: [1.3, 1.2, 1.2, 1.1], kopBg: '#1864ab', kopH: 1.4, rijBg: ['#e7f5ff', '#ffffff'], px: 44, kopPx: 32, lijn: '#a5d8ff' });
  };
  const briefje = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#fff3bf');
    regels(ctx, 'Minimale voorraad:\n100 stuks', W / 2, H / 2, { px: 32, gewicht: 700, uitlijn: 'center' });
  };
  const bal = (x: number, y: number) => (
    <mesh key={`${x}${y}`} position={[x, y, 0]} material={mat('#f8f9fa')}>
      <sphereGeometry args={[0.11, 14, 10]} />
    </mesh>
  );
  return (
    <group>
      <Scherm b={2.8} h={1.5} teken={bord} sleutel="sportwinkel" pos={[-0.35, 2.15, 0.06]} rand={0.06} diep={0.06} kleur="#343a40" />
      <Scherm b={0.7} h={0.45} teken={briefje} sleutel="sportwinkel-min" pos={[1.55, 2.5, 0.06]} rot={[0, 0, 0.05]} rand={0} licht={false} />
      {/* rek */}
      <group position={[-0.35, 0, 0.32]}>
        {[-1.2, 1.2].map((x) => (
          <Blok key={x} size={[0.06, 1.2, 0.5]} pos={[x, 0.6, 0]} color="#495057" r={0.02} />
        ))}
        {[0.15, 0.6, 1.05].map((y) => (
          <Blok key={y} size={[2.4, 0.04, 0.5]} pos={[0, y, 0]} color="#ced4da" r={0.01} />
        ))}
        <group position={[0, 0.28, 0]}>{[-0.9, -0.62, -0.34, -0.06].map((x) => bal(x, 0))}</group>
        <group position={[0, 0.72, 0]}>
          {[-0.9, -0.7, -0.5, -0.3, -0.1, 0.1].map((x, i) => (
            <Cil key={x} r={0.06} h={0.22} pos={[x, 0.0, 0]} color={i % 2 ? '#1c7ed6' : '#40c057'} seg={10} />
          ))}
        </group>
        <group position={[0, 1.16, 0]}>
          {[0.3, 0.55, 0.8].map((x, i) => (
            <Blok key={x} size={[0.22, 0.18, 0.3]} pos={[x, 0, 0]} color={['#f8f9fa', '#212529', '#e03131'][i]} r={0.04} />
          ))}
        </group>
      </group>
    </group>
  );
}

// ───────────────────────── PRA B: reisroutes (maquette) ─────────────────────────

/** Praktijk B: maquette met drie routes van huis naar school en een bord met de reistijden. */
export function Reisroutes() {
  const id = 'O5-PRA-05a';
  const rijen = rijenVan(id);
  const kop = kolommenVan(id).map((k) => k.replace(' (min)', '\n(min)').replace('Aantal overstappen', 'Aantal\noverstappen'));
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    tekst(ctx, 'Reistijden vergelijken', W / 2, 44, { px: 42, gewicht: 700, uitlijn: 'center' });
    tabel(ctx, {
      x: 24,
      y: 82,
      b: W - 48,
      h: H - 100,
      kop,
      rijen,
      kopBg: '#495057',
      kopH: 1.35,
      rijBg: ['#ffffff'],
      px: 42,
      kopPx: 30,
      tussen: 6,
      hoek: 8,
      cel: (r, k) => (k === 0 ? { bg: ['#4dabf7', '#ffa94d', '#b197fc'][r], fg: '#ffffff', gewicht: 700 } : { bg: r % 2 ? '#f1f3f5' : '#ffffff' }),
    });
  };
  const kaart = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#b2d88a');
    for (let i = 0; i < 6; i++) vlak(ctx, 120 + i * 130, 40 + (i % 3) * 150, 70, 60, '#9cc46a', 8);
    const routes: { k: string; l: string; pts: [number, number][]; stops: [number, number][] }[] = [
      { k: '#1c7ed6', l: 'A', pts: [[110, 270], [260, 120], [520, 120], [850, 270]], stops: [[390, 120]] },
      { k: '#f08c00', l: 'B', pts: [[110, 270], [300, 270], [480, 200], [640, 290], [850, 270]], stops: [[300, 270], [640, 290]] },
      { k: '#7950f2', l: 'C', pts: [[110, 270], [250, 430], [700, 430], [850, 270]], stops: [] },
    ];
    for (const r of routes) {
      lijn(ctx, r.pts, '#ffffff', 22);
      lijn(ctx, r.pts, r.k, 12);
      for (const [x, y] of r.stops) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = r.k;
        ctx.lineWidth = 6;
        ctx.stroke();
      }
      const m = r.pts[Math.floor(r.pts.length / 2)];
      vlak(ctx, m[0] - 28, m[1] - 70, 56, 52, r.k, 10);
      tekst(ctx, r.l, m[0], m[1] - 44, { px: 40, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    }
    tekst(ctx, 'huis', 110, 330, { px: 32, gewicht: 700, uitlijn: 'center' });
    tekst(ctx, 'school', 850, 330, { px: 32, gewicht: 700, uitlijn: 'center' });
    tekst(ctx, '○ = overstappen', W - 30, H - 30, { px: 28, gewicht: 700, uitlijn: 'right' });
  };
  const p = opScherm(2.4, 1.3);
  return (
    <group>
      {/* bord op een standaard achter de maquette */}
      <group position={[0, 0, -0.75]}>
        {[-1.0, 1.0].map((x) => (
          <Blok key={x} size={[0.06, 1.7, 0.06]} pos={[x, 0.85, -0.05]} color="#343a40" r={0.02} />
        ))}
        <Scherm b={2.4} h={1.05} teken={bord} sleutel="reisroutes-bord" pos={[0, 1.95, 0]} rot={[-0.1, 0, 0]} rand={0.05} diep={0.05} kleur="#343a40" />
      </group>
      {/* maquette */}
      <Blok size={[2.6, 0.7, 1.45]} pos={[0, 0.35, 0.25]} color="#8a5a32" r={0.04} />
      <group position={[0, 0.72, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <Scherm b={2.4} h={1.3} teken={kaart} sleutel="reisroutes-kaart" rand={0} licht={false}>
          <group position={p(110, 250, 0)} rotation={[Math.PI / 2, 0, 0]}>
            <Blok size={[0.2, 0.14, 0.16]} pos={[0, 0.07, 0]} color="#f6efe2" r={0.02} />
            <mesh position={[0, 0.18, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#c2563a', { flat: true })}>
              <coneGeometry args={[0.16, 0.12, 4]} />
            </mesh>
          </group>
          <group position={p(850, 250, 0)} rotation={[Math.PI / 2, 0, 0]}>
            <Blok size={[0.34, 0.2, 0.2]} pos={[0, 0.1, 0]} color="#e9ecef" r={0.02} />
            <Blok size={[0.38, 0.03, 0.24]} pos={[0, 0.215, 0]} color="#495057" r={0.01} />
            <Blok size={[0.02, 0.18, 0.02]} pos={[0.12, 0.32, 0]} color="#495057" r={0.005} />
          </group>
        </Scherm>
      </group>
    </group>
  );
}

// ───────────────────────── PRA C: werkrooster supermarkt ─────────────────────────

/** Praktijk C: werkrooster in de kantine van de supermarkt, met een prikklok en een winkelwagentje. */
export function Werkrooster() {
  const id = 'O5-PRA-10a';
  const rijen = rijenVan(id);
  const bord = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    vlak(ctx, 0, 0, W, 84, '#2f9e44');
    tekst(ctx, 'Werkrooster supermarkt', W / 2, 44, { px: 44, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    tabel(ctx, { x: 40, y: 110, b: W - 80, h: H - 190, kop: kolommenVan(id), rijen, kopBg: '#2b8a3e', rijBg: ['#ebfbee', '#ffffff'], px: 48, kopPx: 40, lijn: '#b2f2bb', uitlijn: ['center', 'center', 'center', 'center'] });
    tekst(ctx, 'Pauze in uren:minuten', W / 2, H - 42, { px: 30, kleur: '#495057', gewicht: 600, uitlijn: 'center' });
  };
  const loon = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#ffe066');
    regels(ctx, 'Uurloon:\n€ 8,75 per uur', W / 2, H / 2, { px: 34, gewicht: 700, uitlijn: 'center' });
  };
  const klok = useScherm(0.4, 0.4, (ctx, W, H) => {
    vlak(ctx, 0, 0, W, H, '#ffffff');
    ctx.strokeStyle = '#1f2a24';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      streep(ctx, W / 2 + Math.sin(a) * 60, H / 2 - Math.cos(a) * 60, W / 2 + Math.sin(a) * 70, H / 2 - Math.cos(a) * 70, '#1f2a24', 5);
    }
    streep(ctx, W / 2, H / 2, W / 2 + 25, H / 2 - 30, '#1f2a24', 8);
    streep(ctx, W / 2, H / 2, W / 2, H / 2 - 62, '#1f2a24', 6);
  }, 'prikklok');
  return (
    <group>
      <Scherm b={2.4} h={1.6} teken={bord} sleutel="werkrooster" pos={[-0.45, 1.8, 0.06]} rand={0.06} diep={0.06} kleur="#343a40" />
      <Scherm b={0.65} h={0.45} teken={loon} sleutel="werkrooster-loon" pos={[1.25, 2.35, 0.06]} rot={[0, 0, -0.05]} rand={0} licht={false} />
      {/* prikklok */}
      <group position={[1.25, 1.45, 0.12]}>
        <Blok size={[0.5, 0.75, 0.22]} pos={[0, 0, 0]} color="#868e96" r={0.05} />
        <Beeld b={0.36} h={0.36} tex={klok} pos={[0, 0.12, 0.112]} />
        <Blok size={[0.2, 0.06, 0.04]} pos={[0, -0.22, 0.12]} color="#1f2328" r={0.01} />
      </group>
      {/* winkelwagentje */}
      <group position={[0.3, 0, 0.7]} rotation={[0, -0.4, 0]}>
        <Blok size={[0.7, 0.42, 0.45]} pos={[0, 0.65, 0]} color="#adb5bd" r={0.03} opacity={0.75} />
        <Blok size={[0.04, 0.04, 0.5]} pos={[-0.42, 0.95, 0]} color="#c92a2a" r={0.015} />
        {[-0.28, 0.28].map((x) =>
          [-0.18, 0.18].map((z) => <Cil key={`${x}${z}`} r={0.05} h={0.04} pos={[x, 0.06, z]} rot={[Math.PI / 2, 0, 0]} color="#2f3634" seg={10} />),
        )}
        <Blok size={[0.6, 0.03, 0.36]} pos={[0, 0.32, 0]} color="#868e96" r={0.01} />
      </group>
    </group>
  );
}

// ───────────────────────── PUZ-01: kleurkubussen ─────────────────────────

const OPDRACHT_WAARDE = (id: string) => O5[id]?.antwoord?.waarde ?? '?';
const KUBUS_KLEUR: Record<string, string> = { blauw: '#1c7ed6', geel: '#f5c518', groen: '#2f9e44', rood: '#e03131' };
const KUB = { x0: 110, y0: 70, cel: 150 };

function WiebelBlok({ pos, kleur }: { pos: V3; kleur: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 5) * 0.06;
  });
  return (
    <group ref={ref} position={pos}>
      <Blok size={[0.28, 0.28, 0.28]} color={kleur} r={0.04} />
    </group>
  );
}

/** PUZ-01: tafel met een raster van 4 × 4 gekleurde blokken, sommen per rij en kolom en vier lege tegels. */
export function Kleurkubussen() {
  const id = 'O5-PUZ-01a';
  const rijen = rijenVan(id);
  // groen, geel, blauw, rood = opdracht a, b, c, d: na het goede antwoord staat het getal op de tegel
  const sleutel = useSpel((s) => ['a', 'b', 'c', 'd'].map((l) => (s.voortgang[`O5-PUZ-01${l}`]?.goed ? '1' : '0')).join(''));
  const opgelost = sleutel.split('').map((c) => c === '1');
  const tegelTekst = ['a', 'b', 'c', 'd'].map((l, i) => (opgelost[i] ? String(OPDRACHT_WAARDE(`O5-PUZ-01${l}`)) : '?'));
  const raster = rijen.slice(0, 4);
  const kolomSom = rijen[4].slice(1, 5);
  const b = 2.4;
  const h = 2.4;
  const { x0, y0, cel } = KUB;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#e8d6b8');
    for (let i = 0; i < 30; i++) streep(ctx, 0, i * 34 + 10, W, i * 34 + 14, 'rgba(120,80,40,0.08)', 6);
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) {
        const x = x0 + k * cel;
        const y = y0 + r * cel;
        vlak(ctx, x + 12, y + 12, cel - 24, cel - 24, 'rgba(0,0,0,0.12)', 12);
        if (k < 3) tekst(ctx, '+', x + cel, y + cel / 2, { px: 56, gewicht: 700, uitlijn: 'center' });
        if (r < 3) tekst(ctx, '+', x + cel / 2, y + cel, { px: 56, gewicht: 700, uitlijn: 'center' });
      }
    raster.forEach((r, i) => {
      const y = y0 + i * cel + cel / 2;
      tekst(ctx, '=', x0 + 4 * cel + 30, y, { px: 56, gewicht: 700, uitlijn: 'center' });
      vlak(ctx, x0 + 4 * cel + 65, y - 42, 130, 84, '#1f2328', 14);
      tekst(ctx, String(r[5]), x0 + 4 * cel + 130, y, { px: 56, kleur: '#ffd43b', gewicht: 700, uitlijn: 'center' });
    });
    kolomSom.forEach((s, k) => {
      const x = x0 + k * cel + cel / 2;
      tekst(ctx, '=', x, y0 + 4 * cel + 22, { px: 50, gewicht: 700, uitlijn: 'center', draai: Math.PI / 2 });
      vlak(ctx, x - 65, y0 + 4 * cel + 48, 130, 84, '#1f2328', 14);
      tekst(ctx, String(s), x, y0 + 4 * cel + 90, { px: 56, kleur: '#ffd43b', gewicht: 700, uitlijn: 'center' });
    });
    ['groen', 'geel', 'blauw', 'rood'].forEach((k, i) => {
      const x = 60 + i * 215;
      const y = 830;
      vlak(ctx, x, y, 70, 70, KUBUS_KLEUR[k], 10);
      tekst(ctx, `= ${tegelTekst[i]}`, x + 85, y + 36, { px: 46, gewicht: 700, kleur: tegelTekst[i] === '?' ? '#1f2a24' : '#2b8a3e' });
    });
    void W;
    void H;
  };
  const p = opScherm(b, h);
  const tilt = -Math.PI / 2 + 0.38;
  return (
    <group>
      {[-1.15, 1.15].map((x) =>
        [
          [0.95, 0.78],
          [-0.95, 1.5],
        ].map(([z, hh]) => <Blok key={`${x}${z}`} size={[0.09, hh, 0.09]} pos={[x, hh / 2, z]} color="#6b4428" r={0.03} />),
      )}
      <group position={[0, 1.2, 0]} rotation={[tilt, 0, 0]}>
        <Scherm b={b} h={h} teken={teken} sleutel={`kleurkubussen-${tegelTekst.join('')}`} rand={0.05} diep={0.06} kleur="#6b4428" licht={false}>
          {raster.map((r, i) =>
            [1, 2, 3, 4].map((k) => {
              const kleur = KUBUS_KLEUR[String(r[k])];
              const pos = p(x0 + (k - 1) * cel + cel / 2, y0 + i * cel + cel / 2, 0.15);
              return i === 0 && k === 1 ? <WiebelBlok key={`${i}${k}`} pos={pos} kleur={kleur} /> : <Blok key={`${i}${k}`} size={[0.28, 0.28, 0.28]} pos={pos} color={kleur} r={0.04} />;
            }),
          )}
        </Scherm>
      </group>
    </group>
  );
}

// ───────────────────────── PUZ-02: stroomkast "Maak zes" ─────────────────────────

/** PUZ-02: open stroomkast met acht schakelrijen: drie dezelfde cijfers, tekens ertussen, = 6. */
export function Stroomkast() {
  const rijen = rijenVan('O5-PUZ-02a');
  const b = 1.9;
  const h = 2.3;
  const rh = 82;
  const top = 250;
  const teken = (ctx: C, W: number, H: number) => {
    vlak(ctx, 0, 0, W, H, '#2b3036');
    tekst(ctx, 'MAAK ZES', W / 2, 58, { px: 64, kleur: '#ffd43b', gewicht: 700, uitlijn: 'center', font: ROND });
    tekst(ctx, 'Zet tekens tussen de cijfers.', W / 2, 118, { px: 30, kleur: '#dee2e6', gewicht: 600, uitlijn: 'center' });
    vlak(ctx, 60, 148, W - 120, 64, '#1f2328', 12);
    tekst(ctx, '+   −   ×   :   √   ( )', W / 2, 181, { px: 40, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    rijen.forEach((r, i) => {
      const y = top + i * rh + rh / 2;
      const cijfer = String(r[1]).split(' ')[0];
      tekst(ctx, String(r[0]), 40, y, { px: 30, kleur: '#868e96', gewicht: 700, uitlijn: 'center' });
      [0, 1, 2].forEach((j) => {
        const x = 120 + j * 190;
        vlak(ctx, x - 40, y - 34, 80, 68, '#111417', 10);
        tekst(ctx, cijfer, x, y + 2, { px: 54, kleur: '#ffd43b', gewicht: 700, uitlijn: 'center' });
        if (j < 2) {
          vlak(ctx, x + 55, y - 26, 80, 52, '#495057', 26);
        }
      });
      tekst(ctx, `= ${r[2]}`, 600, y + 2, { px: 50, kleur: '#ffffff', gewicht: 700, uitlijn: 'center' });
    });
    void H;
  };
  const p = opScherm(b, h);
  const aan = useMemo(() => mat('#69db7c', { emissive: '#40c057', rough: 0.3 }), []);
  const uit = useMemo(() => mat('#5c3a3a', { rough: 0.5 }), []);
  const goedSleutel = useSpel((s) => 'abcdefgh'.split('').map((l) => (s.voortgang[`O5-PUZ-02${l}`]?.goed ? '1' : '0')).join(''));
  const goed = goedSleutel.split('').map((c) => c === '1');
  return (
    <group>
      {/* kast met open deur */}
      <Blok size={[b + 0.24, h + 0.24, 0.42]} pos={[0, 1.55, 0.21]} color="#adb5bd" r={0.05} />
      <Scherm b={b} h={h} teken={teken} sleutel="stroomkast" pos={[0, 1.55, 0.425]} rand={0} />
      <group position={[-b / 2 - 0.12, 1.55, 0.44]} rotation={[0, -2.75, 0]}>
        <Blok size={[b + 0.2, h + 0.2, 0.05]} pos={[(b + 0.2) / 2, 0, 0]} color="#ced4da" r={0.03} />
        <Bordje regels={['⚡ Stroomkast']} breed={1.0} hoog={0.3} pos={[(b + 0.2) / 2, 0.6, -0.03]} rot={[0, Math.PI, 0]} bg="#ffd43b" fg="#1f2328" rand={null} />
      </group>
      <group position={[0, 1.55, 0.425]}>
        {rijen.map((_, i) =>
          [0, 1].map((j) => (
            <group key={`${i}${j}`} position={p(120 + j * 190 + 95, top + i * rh + rh / 2, 0.02)}>
              <Cil r={0.05} h={0.05} rot={[Math.PI / 2, 0, 0]} color="#e9ecef" seg={14} />
              <Blok size={[0.015, 0.07, 0.02]} pos={[0, 0, 0.03]} rot={[0, 0, 0.6 + i + j]} color="#1f2328" r={0.004} />
            </group>
          )),
        )}
        {rijen.map((_, i) => (
          <mesh key={i} position={p(705, top + i * rh + rh / 2, 0.03)} material={goed[i] ? aan : uit}>
            <sphereGeometry args={[0.035, 10, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
