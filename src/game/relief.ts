// Reliëf voor de getekende texturen: uit elk plaatje (vloer, muur, dak) maken we automatisch een reliëfkaart
// (normal map) en een glanskaart (roughness map). Voegen, naden en randen worden dan echte groefjes die het licht
// vangen, en het oppervlak glanst niet overal even veel. Dit gebeurt één keer bij het laden; daarna kost het niets.
//
// Hoe: de helderheid van de textuur wordt een hoogte (donkere voegen = diep). We halen de grote kleurverschillen eruit
// (anders wordt een donkere plank een kuil), en rekenen dan per pixel de helling uit.
import * as THREE from 'three';

interface Basis {
  normaal: THREE.CanvasTexture;
  ruw: THREE.CanvasTexture;
}
const basisCache = new Map<string, Basis>();
const kloonCache = new Map<string, { normalMap: THREE.Texture; roughnessMap: THREE.Texture }>();

/** Doosvervaging met omloop (de textuur herhaalt zich, dus de rand loopt door aan de andere kant). */
function vervaag(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(w * h);
  const uit = new Float32Array(w * h);
  const n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let som = 0;
    for (let k = -r; k <= r; k++) som += src[y * w + ((k + w) % w)];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = som / n;
      som += src[y * w + ((x + r + 1) % w)] - src[y * w + ((x - r + w) % w)];
    }
  }
  for (let x = 0; x < w; x++) {
    let som = 0;
    for (let k = -r; k <= r; k++) som += tmp[((k + h) % h) * w + x];
    for (let y = 0; y < h; y++) {
      uit[y * w + x] = som / n;
      som += tmp[((y + r + 1) % h) * w + x] - tmp[((y - r + h) % h) * w + x];
    }
  }
  return uit;
}

function maakBasis(beeld: CanvasImageSource & { width: number; height: number }, sterkte: number, glans: number): Basis {
  // grote texturen op halve maat (scheelt rekenwerk, en de groefjes blijven goed zichtbaar)
  const schaal = Math.max(beeld.width, beeld.height) > 600 ? 0.5 : 1;
  const w = Math.max(16, Math.round(beeld.width * schaal));
  const h = Math.max(16, Math.round(beeld.height * schaal));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(beeld, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h);
  const d = px.data;
  const L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
  // alleen de kleine details: hoogte = helderheid min de omgeving
  const omg = vervaag(L, w, h, Math.max(2, Math.round(Math.min(w, h) / 90)));
  const H = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) H[i] = L[i] - omg[i];
  const zacht = vervaag(H, w, h, 1);
  const nrm = ctx.createImageData(w, h);
  const ruw = ctx.createImageData(w, h);
  const nd = nrm.data;
  const rd = ruw.data;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const l = zacht[y * w + ((x - 1 + w) % w)];
      const r = zacht[y * w + ((x + 1) % w)];
      const o = zacht[((y + 1) % h) * w + x];
      const b = zacht[((y - 1 + h) % h) * w + x];
      // helling naar rechts (u) en naar boven (v; de rijen in het plaatje lopen naar beneden)
      const du = (r - l) * sterkte * 8;
      const dv = (b - o) * sterkte * 8;
      const len = Math.hypot(du, dv, 1);
      nd[i * 4] = Math.round(((-du / len) * 0.5 + 0.5) * 255);
      nd[i * 4 + 1] = Math.round(((-dv / len) * 0.5 + 0.5) * 255);
      nd[i * 4 + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      nd[i * 4 + 3] = 255;
      // voegen en kuiltjes zijn ruwer, bovenkanten iets gladder (uitgesleten)
      const g = Math.max(0, Math.min(1, 0.86 - zacht[i] * 2.2 * glans + (L[i] - 0.5) * -0.1));
      rd[i * 4] = rd[i * 4 + 1] = rd[i * 4 + 2] = Math.round(g * 255);
      rd[i * 4 + 3] = 255;
    }
  const maak = (data: ImageData) => {
    const k = document.createElement('canvas');
    k.width = w;
    k.height = h;
    k.getContext('2d')!.putImageData(data, 0, 0);
    const t = new THREE.CanvasTexture(k);
    t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { normaal: maak(nrm), ruw: maak(ruw) };
}

/**
 * Reliëf- en glanskaart voor een getekende textuur. Ze volgen de herhaling en verschuiving van `t`.
 * `sterkte` = hoe diep de groefjes zijn (1 = gewoon). `glans` = hoeveel de glans verschilt tussen voeg en vlak.
 */
export function relief(t: THREE.Texture, sterkte = 1, glans = 1) {
  const beeld = t.image as (CanvasImageSource & { width: number; height: number }) | undefined;
  if (!beeld || !beeld.width || typeof document === 'undefined') return null;
  const bron = t.source.uuid;
  const sleutel = `${bron}|${sterkte}|${glans}`;
  let basis = basisCache.get(sleutel);
  if (!basis) basisCache.set(sleutel, (basis = maakBasis(beeld, sterkte, glans)));
  // per herhaling een eigen kopie (die delen hetzelfde plaatje)
  const k = `${sleutel}|${t.uuid}`;
  let kloon = kloonCache.get(k);
  if (!kloon) {
    const volg = (b: THREE.Texture) => {
      const c = b.clone();
      c.wrapS = t.wrapS;
      c.wrapT = t.wrapT;
      c.repeat.copy(t.repeat);
      c.offset.copy(t.offset);
      c.rotation = t.rotation;
      c.center.copy(t.center);
      c.needsUpdate = true;
      return c;
    };
    kloon = { normalMap: volg(basis.normaal), roughnessMap: volg(basis.ruw) };
    kloonCache.set(k, kloon);
  }
  return kloon;
}
