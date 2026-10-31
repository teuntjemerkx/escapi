// Tekstatlas: alle borden (Doek) van één station, het decor of de stad op één gedeeld canvas.
// Statisch voegt meshes met hetzelfde materiaal samen; met één atlas-materiaal worden tien bordjes
// dus één tekenstap in plaats van tien. Doorzichtige borden (neon) blijven los (sorteren).
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, type FC, type ReactNode } from 'react';
import * as THREE from 'three';

type Teken = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Grootste canvas (px) en rand rond elk vak (tegen kleurlekken bij verkleinen). */
const MAX = 2048;
const PAD = 6;

interface Vak {
  /** Logische maat in px (zoals een los canvas zou zijn). */
  w: number;
  h: number;
  sleutel: string;
  teken: Teken;
  mesh: THREE.Mesh;
  variant: string;
  weg: boolean;
  // plek op het canvas
  pagina: number;
  x: number;
  y: number;
  sw: number;
  sh: number;
  geplaatst: boolean;
  getekend: string | null;
}

interface Pagina {
  canvas: HTMLCanvasElement;
  tex: THREE.CanvasTexture;
}

export class Atlas {
  private vakken = new Map<number, Vak>();
  private paginas: Pagina[] = [];
  private mats = new Map<string, THREE.Material>();
  private teller = 0;
  klaar = false;

  /**
   * `eigenVel`: de pagina's gaan niet op het gedeelde plaatjesvel van de motor (game/atlas.ts).
   * Voor stations: die worden bij elk openen en sluiten opnieuw gemaakt en samengevoegd. Op het gedeelde vel
   * kwam dan elke keer een nieuwe kopie (dat vel wordt pas leeg bij een andere wereld): honderden MB per station.
   */
  constructor(private eigenVel = false) {
    if (typeof document !== 'undefined' && document.fonts) document.fonts.ready.then(() => this.tekenAlles());
  }

  nieuwId() {
    return this.teller++;
  }

  zet(id: number, v: Pick<Vak, 'w' | 'h' | 'sleutel' | 'teken' | 'mesh' | 'variant'>) {
    const oud = this.vakken.get(id);
    const zelfdeMaat = !!oud && oud.w === v.w && oud.h === v.h;
    const vak: Vak = {
      ...v,
      weg: false,
      pagina: oud?.pagina ?? 0,
      x: oud?.x ?? 0,
      y: oud?.y ?? 0,
      sw: oud?.sw ?? v.w,
      sh: oud?.sh ?? v.h,
      geplaatst: zelfdeMaat && !!oud?.geplaatst,
      getekend: zelfdeMaat ? (oud?.getekend ?? null) : null,
    };
    this.vakken.set(id, vak);
    if (!this.klaar) return;
    const p = this.paginas[vak.pagina];
    if (vak.geplaatst && p) {
      if (vak.getekend !== vak.sleutel) {
        this.tekenVak(p, vak);
        p.tex.needsUpdate = true;
      }
      this.koppel(vak);
    } else this.pak();
  }

  weg(id: number) {
    const v = this.vakken.get(id);
    if (v) v.weg = true;
  }

  /** Alle vakken (opnieuw) inpakken en tekenen. */
  pak() {
    const lijst = [...this.vakken.entries()].filter(([, v]) => !v.weg);
    for (const [id, v] of this.vakken) if (v.weg) this.vakken.delete(id);
    const vakken = lijst.map(([, v]) => v);
    if (!vakken.length) return;
    for (const v of vakken) {
      const s = Math.min(1, (MAX - 2 * PAD) / v.w, (MAX - 2 * PAD) / v.h);
      v.sw = Math.max(8, Math.floor(v.w * s));
      v.sh = Math.max(8, Math.floor(v.h * s));
    }
    vakken.sort((a, b) => b.sh - a.sh || b.sw - a.sw);
    const opp = vakken.reduce((t, v) => t + (v.sw + 2 * PAD) * (v.sh + 2 * PAD), 0);
    const breedste = Math.max(...vakken.map((v) => v.sw + 2 * PAD));
    const W = Math.min(MAX, Math.ceil(Math.max(breedste, Math.sqrt(opp * 1.25)) / 32) * 32);
    // planken: van links naar rechts, dan een rij omlaag; vol = nieuwe pagina
    const hoogtes: number[] = [];
    let p = 0;
    let x = 0;
    let y = 0;
    let rij = 0;
    for (const v of vakken) {
      const bw = v.sw + 2 * PAD;
      const bh = v.sh + 2 * PAD;
      if (x + bw > W) {
        x = 0;
        y += rij;
        rij = 0;
      }
      if (y + bh > MAX) {
        hoogtes[p] = y;
        p++;
        x = 0;
        y = 0;
        rij = 0;
      }
      v.pagina = p;
      v.x = x + PAD;
      v.y = y + PAD;
      v.geplaatst = true;
      v.getekend = null;
      x += bw;
      rij = Math.max(rij, bh);
    }
    hoogtes[p] = y + rij;
    // canvassen (her)maken
    for (let i = 0; i < hoogtes.length; i++) {
      const H = Math.ceil(hoogtes[i] / 32) * 32;
      const oud = this.paginas[i];
      if (oud && oud.canvas.width === W && oud.canvas.height === H) continue;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      // gespiegeld herhalen ziet er aan de rand hetzelfde uit als vastklemmen, maar het gedeelde vel slaat zo'n plaatje over
      if (this.eigenVel) tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
      oud?.tex.dispose();
      this.paginas[i] = { canvas, tex };
      for (const [k, m] of this.mats) if (k.startsWith(`${i}|`)) (m as THREE.MeshStandardMaterial).map = tex;
    }
    for (let i = hoogtes.length; i < this.paginas.length; i++) this.paginas[i].tex.dispose();
    this.paginas.length = hoogtes.length;
    this.tekenAlles();
    for (const v of vakken) this.koppel(v);
  }

  tekenAlles() {
    this.paginas.forEach((p, i) => {
      p.canvas.getContext('2d')!.clearRect(0, 0, p.canvas.width, p.canvas.height);
      for (const v of this.vakken.values()) if (!v.weg && v.geplaatst && v.pagina === i) this.tekenVak(p, v);
      p.tex.needsUpdate = true;
    });
  }

  private tekenVak(p: Pagina, v: Vak) {
    const c = p.canvas;
    const ctx = c.getContext('2d')!;
    ctx.save();
    ctx.clearRect(v.x - PAD, v.y - PAD, v.sw + 2 * PAD, v.sh + 2 * PAD);
    ctx.beginPath();
    ctx.rect(v.x, v.y, v.sw, v.sh);
    ctx.clip();
    ctx.translate(v.x, v.y);
    ctx.scale(v.sw / v.w, v.sh / v.h);
    v.teken(ctx, v.w, v.h);
    ctx.restore();
    // randen naar buiten uitrekken, zodat verkleinde (verre) borden geen kleur van de buren krijgen
    ctx.drawImage(c, v.x, v.y, v.sw, 1, v.x, v.y - PAD, v.sw, PAD);
    ctx.drawImage(c, v.x, v.y + v.sh - 1, v.sw, 1, v.x, v.y + v.sh, v.sw, PAD);
    ctx.drawImage(c, v.x, v.y - PAD, 1, v.sh + 2 * PAD, v.x - PAD, v.y - PAD, PAD, v.sh + 2 * PAD);
    ctx.drawImage(c, v.x + v.sw - 1, v.y - PAD, 1, v.sh + 2 * PAD, v.x + v.sw, v.y - PAD, PAD, v.sh + 2 * PAD);
    v.getekend = v.sleutel;
  }

  private materiaal(pagina: number, variant: string) {
    const k = `${pagina}|${variant}`;
    let m = this.mats.get(k);
    if (!m) {
      const map = this.paginas[pagina].tex;
      const side = variant.endsWith('2') ? THREE.DoubleSide : THREE.FrontSide;
      m = variant.startsWith('licht') ? new THREE.MeshBasicMaterial({ map, toneMapped: false, side }) : new THREE.MeshStandardMaterial({ map, roughness: 0.75, side });
      this.mats.set(k, m);
    }
    return m;
  }

  /** Mesh aan het atlas-materiaal hangen en de uv naar zijn vak laten wijzen. */
  private koppel(v: Vak) {
    const p = this.paginas[v.pagina];
    if (!p) return;
    v.mesh.material = this.materiaal(v.pagina, v.variant);
    const geo = v.mesh.geometry as THREE.BufferGeometry;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    let bron = geo.userData.uv0 as Float32Array | undefined;
    if (!bron || bron.length !== uv.array.length) bron = geo.userData.uv0 = Float32Array.from(uv.array as Float32Array);
    const W = p.canvas.width;
    const H = p.canvas.height;
    const a = uv.array as Float32Array;
    for (let i = 0; i < a.length; i += 2) {
      a[i] = (v.x + bron[i] * v.sw) / W;
      a[i + 1] = 1 - (v.y + (1 - bron[i + 1]) * v.sh) / H;
    }
    uv.needsUpdate = true;
  }

  weggooien() {
    for (const p of this.paginas) p.tex.dispose();
    for (const m of this.mats.values()) m.dispose();
    this.paginas = [];
    this.mats.clear();
    for (const v of this.vakken.values()) v.geplaatst = false;
  }
}

const AtlasCtx = createContext<Atlas | null>(null);

export function useAtlas() {
  return useContext(AtlasCtx);
}

/** Alle (niet-doorzichtige) Doeken hierbinnen delen één canvas. */
export function DoekAtlas({ children, eigenVel = false }: { children: ReactNode; eigenVel?: boolean }) {
  const atlas = useMemo(() => new Atlas(eigenVel), [eigenVel]);
  // Na de kinderen (die zich al hebben aangemeld) en vóór het samenvoegen door Statisch.
  useLayoutEffect(() => {
    atlas.klaar = true;
    atlas.pak();
    return () => {
      atlas.klaar = false;
    };
  }, [atlas]);
  useEffect(() => () => atlas.weggooien(), [atlas]);
  return <AtlasCtx.Provider value={atlas}>{children}</AtlasCtx.Provider>;
}

/** Model met een eigen atlas (voor stations). */
export function metAtlas(Model: FC): FC {
  const M = () => (
    <DoekAtlas eigenVel>
      <Model />
    </DoekAtlas>
  );
  M.displayName = `Atlas(${Model.displayName ?? Model.name ?? 'Model'})`;
  return M;
}
