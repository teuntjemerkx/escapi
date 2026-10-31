// Bouwstenen van De Markthal: marktkramen met gestreepte luifel, toonbanken, prijsbordjes,
// krijtborden en poppetjes. Alles in de zachte diorama-stijl van de andere werelden.
import { Mens } from '../game/mens';
import { useMemo, type ReactNode } from 'react';
import { mat } from '../game/kit';
import { Blok, Cil, useBolSeg } from './blok';
import { P } from '../game/palette';
import { FONT, rondRect } from '../game/tekst';
import { Druk } from './atlas';

export type V3 = [number, number, number];

export const KLEUR = {
  groen: '#2f6b4f',
  donker: '#2f3634',
  krijt: '#2b3a33',
  krijtLijn: '#f4f1ea',
  geel: '#f2d04a',
  creme: '#fbf3e2',
  baksteen: '#b8664a',
} as const;

/** Gestreepte luifelstof (verticale banen) als tekening voor de atlas. */
function streep(a: string, b: string, n = 8) {
  return {
    sleutel: `streep${a}${b}${n}`,
    teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? b : a;
        ctx.fillRect((i * w) / n, 0, w / n + 1, h);
      }
    },
  };
}

/** Marktkraam (vast decor): palen, schuine gestreepte luifel, achterwand met planken en een naambord.
 *  Voorkant op z = d/2 (geen overstek), zodat borden net voor de kraam vrij blijven. */
export function Kraam({
  b = 2.8,
  d = 0.8,
  h = 2.45,
  luifel = ['#d86a4a', '#fbf3e2'],
  naam,
  naamKleur = KLEUR.groen,
  planken = true,
  waren,
}: {
  b?: number;
  d?: number;
  h?: number;
  luifel?: [string, string];
  naam?: string;
  naamKleur?: string;
  planken?: boolean;
  waren?: string[];
}) {
  const stof = streep(luifel[0], luifel[1], Math.round(b * 2));
  const hoog = 0.4;
  const hoek = Math.atan2(hoog, d);
  const lengte = Math.hypot(d, hoog);
  const paal = KLEUR.donker;
  return (
    <group>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => <Blok key={`${sx}${sz}`} size={[0.09, sz < 0 ? h + hoog : h, 0.09]} pos={[(sx * b) / 2, (sz < 0 ? h + hoog : h) / 2, (sz * d) / 2]} color={paal} r={0.03} />),
      )}
      {/* luifel */}
      <Druk b={1} h={0.25} ppm={256} {...stof} dubbel position={[0, h + hoog / 2 + 0.03, 0]} rotation={[-Math.PI / 2 + hoek, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[b + 0.2, lengte + 0.1]} />
      </Druk>
      <Druk b={1} h={0.25} ppm={256} {...stof} dubbel position={[0, h - 0.1, d / 2 + 0.01]} castShadow>
        <planeGeometry args={[b + 0.2, 0.26]} />
      </Druk>
      {/* achterwand met planken */}
      <Blok size={[b - 0.1, h - 0.1, 0.06]} pos={[0, (h - 0.1) / 2, -d / 2]} color="#e9dcc3" r={0.02} />
      {planken &&
        [0.85, 1.45].map((y) => (
          <Blok key={y} size={[b - 0.3, 0.05, 0.28]} pos={[0, y, -d / 2 + 0.17]} color={P.hout} r={0.02} />
        ))}
      {planken &&
        (waren ?? ['#e48a3a', '#7cbf4a', '#e5675a', '#f2d04a']).map((k, i, a) => (
          <group key={i}>
            <Blok size={[0.4, 0.24, 0.22]} pos={[-b / 2 + 0.5 + (i * (b - 1.0)) / Math.max(1, a.length - 1), 1.0, -d / 2 + 0.17]} color={k} r={0.08} />
            <Blok size={[0.4, 0.24, 0.22]} pos={[-b / 2 + 0.6 + (i * (b - 1.2)) / Math.max(1, a.length - 1), 1.6, -d / 2 + 0.17]} color={a[(i + 1) % a.length]} r={0.08} />
          </group>
        ))}
      {naam && (
        <group position={[0, h + hoog + 0.3, -d / 2 + 0.02]}>
          <Blok size={[Math.min(b - 0.2, 0.5 + naam.length * 0.22), 0.46, 0.08]} color={naamKleur} r={0.05} />
          <Bordje regels={[naam]} breed={Math.min(b - 0.3, 0.4 + naam.length * 0.22)} hoog={0.38} pos={[0, 0, 0.045]} bg={naamKleur} fg="#ffffff" rand={null} />
        </group>
      )}
    </group>
  );
}

/** Kraamkop (vast decor): twee paaltjes met een naambord en een smalle luifelstrook. Voor stations in de eindzaal. */
export function Kraamkop({ naam, luifel = ['#d86a4a', '#fbf3e2'], naamKleur = KLEUR.groen, b = 2.4 }: { naam: string; luifel?: [string, string]; naamKleur?: string; b?: number }) {
  const stof = streep(luifel[0], luifel[1], Math.round(b * 2));
  return (
    <group>
      {[-1, 1].map((s) => (
        <Blok key={s} size={[0.07, 2.55, 0.07]} pos={[(s * b) / 2, 1.275, 0]} color={KLEUR.donker} r={0.02} />
      ))}
      <Druk b={1} h={0.25} ppm={256} {...stof} dubbel position={[0, 2.32, 0.02]}>
        <planeGeometry args={[b + 0.1, 0.24]} />
      </Druk>
      <group position={[0, 2.68, 0]}>
        <Blok size={[Math.min(b, 0.5 + naam.length * 0.2), 0.42, 0.06]} color={naamKleur} r={0.04} />
        <Bordje regels={[naam]} breed={Math.min(b - 0.1, 0.4 + naam.length * 0.2)} hoog={0.34} pos={[0, 0, 0.035]} bg={naamKleur} fg="#ffffff" rand={null} dubbel />
      </group>
    </group>
  );
}

/** Toonbank met houten blad (onderdeel van een model: gaat mee naar de inspectie). */
export function Toonbank({ b = 2.4, d = 0.9, h = 0.9, kleur = '#c98f55', blad = '#e9dcc3', pos = [0, 0, 0] }: { b?: number; d?: number; h?: number; kleur?: string; blad?: string; pos?: V3 }) {
  return (
    <group position={pos}>
      <Blok size={[b, h - 0.06, d]} pos={[0, (h - 0.06) / 2, 0]} color={kleur} r={0.05} />
      <Blok size={[b + 0.12, 0.08, d + 0.12]} pos={[0, h - 0.04, 0]} color={blad} r={0.03} />
    </group>
  );
}

/** Prijskaartje op een stokje (staat rechtop, leest naar +z). */
export function Prijsprikker({ regels, pos, breed = 0.6, hoog, kleur = '#fffaf0', fg = '#1f2a24', rand = '#2f5d46', stok = 0.35 }: { regels: string[]; pos: V3; breed?: number; hoog?: number; kleur?: string; fg?: string; rand?: string | null; stok?: number }) {
  const hh = hoog ?? 0.16 + regels.length * 0.13;
  return (
    <group position={pos}>
      <Cil r={0.012} h={stok} pos={[0, stok / 2, -0.01]} color="#7a5a3c" seg={5} />
      <Blok size={[breed + 0.04, hh + 0.04, 0.02]} pos={[0, stok + hh / 2, -0.012]} color={rand ?? kleur} r={0.01} />
      <Label regels={regels} breed={breed} hoog={hh} pos={[0, stok + hh / 2, 0.001]} bg={kleur} fg={fg} rand={null} vet={regels.length > 1 ? 0 : -1} />
    </group>
  );
}

/** Krijtbord/whiteboard met eigen tekening (canvas). Staat rechtop op twee poten. */
export function Tekenbord({
  breed,
  hoog,
  teken,
  sleutel,
  pos = [0, 0, 0],
  rot,
  poten = 0.9,
  lijst = P.hout,
  ppm = 480,
}: {
  breed: number;
  hoog: number;
  teken: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  sleutel: string;
  pos?: V3;
  rot?: V3;
  poten?: number;
  lijst?: string;
  ppm?: number;
}) {
  return (
    <group position={pos} rotation={rot}>
      {poten > 0 &&
        [-1, 1].map((s) => <Blok key={s} size={[0.07, poten + hoog * 0.5, 0.07]} pos={[s * (breed / 2 - 0.08), (poten + hoog * 0.5) / 2, -0.06]} color={lijst} r={0.02} />)}
      <Blok size={[breed + 0.12, hoog + 0.12, 0.06]} pos={[0, poten + hoog / 2, -0.035]} color={lijst} r={0.03} />
      <Druk b={breed} h={hoog} teken={teken} sleutel={sleutel} ppm={ppm} position={[0, poten + hoog / 2, 0]}>
        <planeGeometry args={[breed, hoog]} />
      </Druk>
    </group>
  );
}

/** Tekst-hulp voor canvas: regels links of midden. */
export function schrijf(ctx: CanvasRenderingContext2D, tekst: string, x: number, y: number, px: number, kleur: string, opts: { gewicht?: number; uitlijn?: CanvasTextAlign; max?: number } = {}) {
  ctx.fillStyle = kleur;
  ctx.font = `${opts.gewicht ?? 600} ${px}px ${FONT}`;
  ctx.textAlign = opts.uitlijn ?? 'left';
  ctx.textBaseline = 'middle';
  if (opts.max) {
    let p = px;
    while (p > 10 && ctx.measureText(tekst).width > opts.max) {
      p -= 2;
      ctx.font = `${opts.gewicht ?? 600} ${p}px ${FONT}`;
    }
  }
  ctx.fillText(tekst, x, y);
}

/** Achtergrond van een krijtbord met houtnerf-rand. */
export function krijtAchtergrond(ctx: CanvasRenderingContext2D, w: number, h: number, kleur: string = KLEUR.krijt) {
  ctx.fillStyle = kleur;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) ctx.fillRect(((i * 97) % w) - 20, ((i * 53) % h) - 4, 120, 6);
  ctx.globalAlpha = 1;
}

export function papierAchtergrond(ctx: CanvasRenderingContext2D, w: number, h: number, kleur = '#fbf6ea', rand = '#2f5d46') {
  ctx.fillStyle = kleur;
  rondRect(ctx, 0, 0, w, h, Math.min(w, h) * 0.04);
  ctx.fill();
  if (rand) {
    ctx.strokeStyle = rand;
    ctx.lineWidth = Math.min(w, h) * 0.025;
    rondRect(ctx, ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2, Math.min(w, h) * 0.03);
    ctx.stroke();
  }
}

/** Poppetje (± 1,7 m). haar: 'kort' | 'staart' | 'pet' | 'krul' | 'kaal'. */
export function Poppetje({
  pos = [0, 0, 0],
  rot = 0,
  shirt = '#4f86b8',
  broek = '#3b4250',
  huid = '#f0c6a0',
  haar = 'kort',
  haarKleur = '#4a3426',
  s = 1,
  children,
}: {
  pos?: V3;
  rot?: number;
  shirt?: string;
  broek?: string;
  huid?: string;
  haar?: 'kort' | 'staart' | 'pet' | 'krul' | 'kaal';
  haarKleur?: string;
  s?: number;
  children?: ReactNode;
}) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <Mens hoogte={1.68} fijn={1.68 * s > 0.95} c={{ shirt, broek, huid, haar: haarKleur, kapsel: haar }} />
      {children}
    </group>
  );
}

/** Ronde vrucht of bal (gedeelde geometrie via mat-cache). */
export function Bol({ pos, r, kleur, rough = 0.6, sy = 1 }: { pos: V3; r: number; kleur: string; rough?: number; sy?: number }) {
  const [a, b] = useBolSeg();
  return (
    <mesh position={pos} scale={[1, sy, 1]} castShadow material={mat(kleur, { rough })}>
      <sphereGeometry args={[r, a, b]} />
    </mesh>
  );
}

/** Houten krat (open bovenkant). */
export function Krat({ b = 0.6, d = 0.4, h = 0.28, pos = [0, 0, 0], kleur = '#c99a62' }: { b?: number; d?: number; h?: number; pos?: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Blok size={[b, 0.04, d]} pos={[0, 0.02, 0]} color={kleur} r={0.01} />
      <Blok size={[b, h, 0.03]} pos={[0, h / 2, d / 2 - 0.015]} color={kleur} r={0.01} />
      <Blok size={[b, h, 0.03]} pos={[0, h / 2, -d / 2 + 0.015]} color={kleur} r={0.01} />
      <Blok size={[0.03, h, d]} pos={[b / 2 - 0.015, h / 2, 0]} color="#b98a55" r={0.01} />
      <Blok size={[0.03, h, d]} pos={[-b / 2 + 0.015, h / 2, 0]} color="#b98a55" r={0.01} />
    </group>
  );
}

/** Vulling van bollen in een rechthoek (bv. fruit in een krat), deterministisch. */
export function useVulling(n: number, b: number, d: number, r: number, seed: number) {
  return useMemo(() => {
    const out: V3[] = [];
    const kol = Math.max(1, Math.floor(b / (r * 2.05)));
    const rij = Math.max(1, Math.floor(d / (r * 2.05)));
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) {
      const laag = Math.floor(i / (kol * rij));
      const k = i % kol;
      const rr = Math.floor(i / kol) % rij;
      out.push([-b / 2 + r + k * r * 2.05 + (laag % 2) * r * 0.5 + (rnd() - 0.5) * 0.01, r + laag * r * 1.6, -d / 2 + r + rr * r * 2.05 + (laag % 2) * r * 0.5]);
    }
    return out;
  }, [n, b, d, r, seed]);
}

/** Scherp bordje met regels tekst (zoals Bordje, maar met een hogere resolutie voor getallen). */
export function Label({
  regels,
  breed,
  hoog,
  pos = [0, 0, 0],
  rot,
  bg = '#fbfaf6',
  fg = '#1f2a24',
  rand = '#2f5d46',
  groot = 0.62,
  dubbel = false,
  ppm = 640,
  vet = 0,
}: {
  regels: string[];
  breed: number;
  hoog: number;
  pos?: V3;
  rot?: V3;
  bg?: string;
  fg?: string;
  rand?: string | null;
  groot?: number;
  dubbel?: boolean;
  ppm?: number;
  /** Welke regel vet is (-1 = geen). */
  vet?: number;
}) {
  const sleutel = `lab${regels.join('|')}${breed}${hoog}${bg}${fg}${rand}${groot}${ppm}${vet}`;
  const teken = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = bg;
      rondRect(ctx, 0, 0, w, h, Math.min(w, h) * 0.12);
      ctx.fill();
      if (rand) {
        ctx.lineWidth = Math.min(w, h) * 0.05;
        ctx.strokeStyle = rand;
        rondRect(ctx, ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth, Math.min(w, h) * 0.1);
        ctx.stroke();
      }
      const n = regels.length;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = fg;
      let fs = (h / n) * groot;
      ctx.font = `700 ${fs}px ${FONT}`;
      const breedst = Math.max(...regels.map((r) => ctx.measureText(r).width), 1);
      if (breedst > w * 0.9) fs *= (w * 0.9) / breedst;
      regels.forEach((r, i) => {
        ctx.font = `${i === vet ? 700 : 600} ${fs}px ${FONT}`;
        ctx.fillText(r, w / 2, (h / n) * (i + 0.5));
      });
  };
  return (
    <Druk b={breed} h={hoog} teken={teken} sleutel={sleutel} ppm={ppm} dubbel={dubbel} position={pos} rotation={rot}>
      <planeGeometry args={[breed, hoog]} />
    </Druk>
  );
}

/** Bordje zoals in de rest van het spel (zelfde tekening), maar via de atlas. */
export function Bordje({
  regels,
  breed,
  hoog,
  pos = [0, 0, 0],
  rot,
  bg = '#fbfaf6',
  fg = '#1f2a24',
  rand = '#2f5d46',
  groot = 0.62,
  dubbel = false,
}: {
  regels: string[];
  breed: number;
  hoog: number;
  pos?: V3;
  rot?: V3;
  bg?: string;
  fg?: string;
  rand?: string | null;
  groot?: number;
  dubbel?: boolean;
}) {
  const sleutel = `bord${regels.join('|')}${breed}${hoog}${bg}${fg}${rand}${groot}`;
  const teken = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = bg;
    rondRect(ctx, 0, 0, w, h, Math.min(w, h) * 0.12);
    ctx.fill();
    if (rand) {
      ctx.lineWidth = Math.min(w, h) * 0.05;
      ctx.strokeStyle = rand;
      rondRect(ctx, ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth, Math.min(w, h) * 0.1);
      ctx.stroke();
    }
    const n = regels.length;
    const fs = Math.min((h / n) * groot, (w / Math.max(...regels.map((r) => r.length), 1)) * 1.7);
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    regels.forEach((r, i) => {
      ctx.font = `${i === 0 && n > 1 ? 700 : 600} ${fs}px ${FONT}`;
      ctx.fillText(r, w / 2, (h / n) * (i + 0.5));
    });
  };
  return (
    <Druk b={breed} h={hoog} teken={teken} sleutel={sleutel} ppm={220} dubbel={dubbel} position={pos} rotation={rot}>
      <planeGeometry args={[breed, hoog]} />
    </Druk>
  );
}

/** Glas (doorzichtig) met een laagje drank. */
export function Glas({ pos, r = 0.06, h = 0.16, vul = 0.7, kleur = '#bfe3ee' }: { pos: V3; r?: number; h?: number; vul?: number; kleur?: string }) {
  return (
    <group position={pos}>
      {vul > 0 && (
        <mesh position={[0, (h * vul) / 2 + 0.005, 0]} material={mat(kleur, { rough: 0.3 })}>
          <cylinderGeometry args={[r * 0.9, r * 0.82, h * vul, 14]} />
        </mesh>
      )}
      <mesh position={[0, h / 2, 0]} material={mat('#e8f4f8', { rough: 0.1, opacity: 0.35 })}>
        <cylinderGeometry args={[r, r * 0.88, h, 14, 1, true]} />
      </mesh>
    </group>
  );
}

/** Bordje met getallen dat plat op een toonbank ligt of schuin staat (standaard schuin, leest naar +z). */
export function Kaartje({ regels, pos, breed = 0.5, hoog, kleur = '#fffaf0', fg = '#1f2a24', rand = '#2f5d46', schuin = -0.35 }: { regels: string[]; pos: V3; breed?: number; hoog?: number; kleur?: string; fg?: string; rand?: string | null; schuin?: number }) {
  const hh = hoog ?? 0.1 + regels.length * 0.1;
  return (
    <group position={pos} rotation={[schuin, 0, 0]}>
      <Blok size={[breed + 0.03, hh + 0.03, 0.015]} pos={[0, hh / 2, -0.009]} color={rand ?? kleur} r={0.005} />
      <Label regels={regels} breed={breed} hoog={hh} pos={[0, hh / 2, 0]} bg={kleur} fg={fg} rand={null} vet={regels.length > 1 ? 0 : -1} />
    </group>
  );
}
