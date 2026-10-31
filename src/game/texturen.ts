// Getekende texturen voor muren, vloeren en buitengrond (canvas, geen plaatjes nodig).
import * as THREE from 'three';
import type { Vloer } from '../werelden/types';
import { maakTextuur } from './tekst';

const texCache = new Map<string, THREE.Texture>();
export function tex(sleutel: string, maak: () => THREE.Texture) {
  let t = texCache.get(sleutel);
  if (!t) {
    t = maak();
    texCache.set(sleutel, t);
  }
  return t;
}

export function donkerder(hex: string, f: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(f);
  return `#${c.getHexString()}`;
}

/** Vaste reeks toevalsgetallen, zodat een textuur er elke keer hetzelfde uitziet. */
function reeks(seed = 12345) {
  let r = seed;
  return () => (r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

/** Behang + lambrisering + plint, van onder naar boven over de hele muurhoogte. */
export function muurTextuur(behang: string, lambris: string, H: number) {
  return tex(`muur${behang}${lambris}${H}`, () => {
    const t = maakTextuur(
      1.2,
      H,
      (ctx, w, h) => {
        const py = (m: number) => h - (m / H) * h;
        ctx.fillStyle = behang;
        ctx.fillRect(0, 0, w, h);
        // zacht streepjesbehang
        ctx.fillStyle = donkerder(behang, 0.94);
        for (let x = 0; x < w; x += w / 6) ctx.fillRect(x, 0, w / 24, py(1.08));
        // lambrisering met panelen
        ctx.fillStyle = lambris;
        ctx.fillRect(0, py(1.0), w, py(0.12) - py(1.0));
        ctx.strokeStyle = donkerder(lambris, 0.72);
        ctx.lineWidth = 5;
        ctx.strokeRect(w * 0.1, py(0.88), w * 0.8, py(0.24) - py(0.88));
        ctx.fillStyle = donkerder(lambris, 1.08);
        ctx.fillRect(w * 0.13, py(0.85), w * 0.74, 4);
        // lijst en plint
        ctx.fillStyle = donkerder(lambris, 0.62);
        ctx.fillRect(0, py(1.08), w, py(1.0) - py(1.08));
        ctx.fillRect(0, py(0.12), w, h - py(0.12));
        ctx.fillRect(0, 0, w, py(H - 0.08));
      },
      80,
    );
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

/** Baksteengevel (buitenkant van een muur aan een tuin of plein): plint, metselwerk en een donkere afdekrand. */
export function gevelTextuur(kleur: string, H: number) {
  return tex(`gevel${kleur}${H}`, () => {
    const t = maakTextuur(
      1.2,
      H,
      (ctx, w, h) => {
        const rnd = reeks(777);
        const ppm = h / H;
        const py = (m: number) => h - m * ppm;
        ctx.fillStyle = donkerder(kleur, 0.55);
        ctx.fillRect(0, 0, w, h);
        const steenH = 0.075 * ppm;
        const steenB = 0.22 * ppm;
        let rij = 0;
        for (let y = h; y > 0; y -= steenH, rij++) {
          const plint = h - y < 0.5 * ppm;
          for (let x = -(rij % 2) * steenB * 0.5; x < w; x += steenB) {
            const f = (plint ? 0.62 : 0.88) + rnd() * 0.22;
            ctx.fillStyle = donkerder(kleur, f);
            ctx.fillRect(x + 1.5, y - steenH + 1.5, steenB - 3, steenH - 3);
          }
        }
        // rollaag boven de plint
        ctx.fillStyle = donkerder(kleur, 0.5);
        ctx.fillRect(0, py(0.56), w, 0.06 * ppm);
        // afdekrand
        ctx.fillStyle = '#3b332d';
        ctx.fillRect(0, 0, w, py(H - 0.1));
      },
      160,
    );
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

/**
 * Natuursteen (kasteelmuur): onregelmatige blokken in rijen, donkere voegen. `buiten` = met mos en vuil onderaan.
 * Naadloos in de breedte (1,2 m), net als de andere muurtexturen.
 */
export function steenTextuur(kleur: string, H: number, buiten = false) {
  return tex(`steen${kleur}${H}${buiten}`, () => {
    const t = maakTextuur(
      1.2,
      H,
      (ctx, w, h) => {
        const rnd = reeks(buiten ? 4242 : 2424);
        const ppm = h / H;
        ctx.fillStyle = donkerder(kleur, 0.42);
        ctx.fillRect(0, 0, w, h);
        let y = h;
        let rij = 0;
        while (y > 0) {
          const rh = (0.24 + rnd() * 0.16) * ppm;
          let x = -rnd() * 0.3 * ppm;
          while (x < w) {
            const b = (0.32 + rnd() * 0.42) * ppm;
            const f = 0.78 + rnd() * 0.36 - (buiten && h - y < 0.6 * ppm ? 0.12 : 0);
            const c = donkerder(kleur, f);
            for (const dx of [0, -w, w]) {
              ctx.fillStyle = c;
              ctx.beginPath();
              ctx.roundRect(x + dx + 2, y - rh + 2, b - 4, rh - 4, 6);
              ctx.fill();
              // licht randje boven, schaduw onder: een beetje reliëf
              ctx.fillStyle = 'rgba(255,255,255,0.07)';
              ctx.fillRect(x + dx + 5, y - rh + 3, b - 10, 3);
              ctx.fillStyle = 'rgba(0,0,0,0.12)';
              ctx.fillRect(x + dx + 5, y - 6, b - 10, 3);
            }
            x += b;
          }
          y -= rh;
          rij++;
        }
        if (buiten) {
          // mos en vuil onderaan
          const g = ctx.createLinearGradient(0, h, 0, h - 0.9 * ppm);
          g.addColorStop(0, 'rgba(40,60,30,0.55)');
          g.addColorStop(1, 'rgba(40,60,30,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, h - 0.9 * ppm, w, 0.9 * ppm);
        } else {
          // donkere plint binnen
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(0, h - 0.12 * ppm, w, 0.12 * ppm);
        }
        // afdekrand
        ctx.fillStyle = donkerder(kleur, 0.38);
        ctx.fillRect(0, 0, w, 0.1 * ppm);
      },
      140,
    );
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

export const VLOER_KLEUR: Record<Vloer, string> = {
  planken: '#a26f42',
  visgraat: '#b07a48',
  tegels: '#e3d9c6',
  tapijt: '#7a3b34',
  steen: '#8f8a83',
  beton: '#9a948b',
  gras: '#5f8a3e',
  grind: '#b8ad98',
  kinderkopjes: '#8c8278',
  vlonder: '#8a6a4c',
  zand: '#d9c08f',
  sneeuw: '#e9eff4',
  asfalt: '#4a4d52',
  terrazzo: '#e4ddd0',
  rooster: '#6d737a',
  rubber: '#3b3f45',
};

/** Vloer of buitengrond, 4 × 4 m per herhaling. */
export function vloerTextuur(soort: Vloer, kleur: string) {
  return tex(`vloer${soort}${kleur}`, () => {
    const t = maakTextuur(
      4,
      4,
      (ctx, w, h) => {
        const rnd = reeks();
        const spikkels = (n: number, a: number, s = 3) => {
          for (let k = 0; k < n; k++) {
            ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},${a})`;
            ctx.fillRect(rnd() * w, rnd() * h, s, s);
          }
        };
        if (soort === 'planken' || soort === 'visgraat' || soort === 'vlonder') {
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          if (soort === 'planken' || soort === 'vlonder') {
            const rijen = soort === 'vlonder' ? 28 : 16;
            const rh = h / rijen;
            for (let i = 0; i < rijen; i++) {
              let x = -rnd() * w * 0.5;
              while (x < w) {
                const lang = soort === 'vlonder' ? w * (0.7 + rnd() * 0.5) : w * (0.35 + rnd() * 0.4);
                ctx.fillStyle = donkerder(kleur, 0.86 + rnd() * 0.24);
                ctx.fillRect(x, i * rh, lang, rh);
                ctx.fillStyle = 'rgba(0,0,0,0.08)';
                for (let k = 0; k < 3; k++) ctx.fillRect(x, i * rh + rh * (0.2 + rnd() * 0.6), lang, 1.5);
                ctx.fillStyle = 'rgba(30,18,10,0.55)';
                ctx.fillRect(x, i * rh, 2, rh);
                if (soort === 'vlonder') {
                  // schroefjes
                  ctx.fillStyle = 'rgba(20,14,10,0.6)';
                  ctx.fillRect(x + 8, i * rh + rh * 0.3, 3, 3);
                  ctx.fillRect(x + 8, i * rh + rh * 0.65, 3, 3);
                }
                x += lang;
              }
              ctx.fillStyle = soort === 'vlonder' ? 'rgba(15,10,6,0.85)' : 'rgba(30,18,10,0.6)';
              ctx.fillRect(0, i * rh, w, soort === 'vlonder' ? 4 : 2);
            }
          } else {
            const b = w / 16;
            for (let j = -2; j < 18; j++)
              for (let i = -2; i < 18; i++) {
                ctx.save();
                ctx.translate(i * b * 2 + (j % 2) * b, j * b);
                ctx.rotate(((i + j) % 2 ? 1 : -1) * Math.PI / 4);
                ctx.fillStyle = donkerder(kleur, 0.85 + rnd() * 0.25);
                ctx.fillRect(0, 0, b * 2.6, b * 0.9);
                ctx.strokeStyle = 'rgba(30,18,10,0.5)';
                ctx.strokeRect(0, 0, b * 2.6, b * 0.9);
                ctx.restore();
              }
          }
        } else if (soort === 'tegels') {
          const n = 8;
          for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
              ctx.fillStyle = (i + j) % 2 ? kleur : '#2f2b28';
              ctx.fillRect((i * w) / n, (j * h) / n, w / n, h / n);
            }
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          for (let i = 0; i <= n; i++) {
            ctx.beginPath();
            ctx.moveTo((i * w) / n, 0);
            ctx.lineTo((i * w) / n, h);
            ctx.moveTo(0, (i * h) / n);
            ctx.lineTo(w, (i * h) / n);
            ctx.stroke();
          }
        } else if (soort === 'steen') {
          ctx.fillStyle = '#4a4440';
          ctx.fillRect(0, 0, w, h);
          const n = 6;
          for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
              ctx.fillStyle = donkerder(kleur, 0.85 + rnd() * 0.25);
              ctx.fillRect((i * w) / n + 3, (j * h) / n + 3, w / n - 6, h / n - 6);
            }
        } else if (soort === 'gras') {
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          // zachte vlekken
          for (let k = 0; k < 60; k++) {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            const c = donkerder(kleur, 0.8 + rnd() * 0.4);
            g.addColorStop(0, c);
            g.addColorStop(1, `${c}00`);
            ctx.save();
            ctx.translate(rnd() * w, rnd() * h);
            ctx.scale(30 + rnd() * 60, 30 + rnd() * 60);
            ctx.fillStyle = g;
            ctx.fillRect(-1, -1, 2, 2);
            ctx.restore();
          }
          // grassprietjes
          for (let k = 0; k < 5200; k++) {
            const x = rnd() * w;
            const y = rnd() * h;
            const l = 4 + rnd() * 7;
            ctx.strokeStyle = donkerder(kleur, 0.65 + rnd() * 0.7);
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (rnd() - 0.5) * 4, y - l);
            ctx.stroke();
          }
          // een paar bloemetjes
          for (let k = 0; k < 26; k++) {
            ctx.fillStyle = ['#f4f1e6', '#f2d65c', '#e9a7c6'][k % 3];
            ctx.beginPath();
            ctx.arc(rnd() * w, rnd() * h, 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (soort === 'grind' || soort === 'zand') {
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          const n = soort === 'grind' ? 5200 : 2600;
          for (let k = 0; k < n; k++) {
            ctx.fillStyle = donkerder(kleur, 0.7 + rnd() * 0.55);
            ctx.beginPath();
            const r = soort === 'grind' ? 1.5 + rnd() * 3 : 0.8 + rnd() * 1.5;
            ctx.ellipse(rnd() * w, rnd() * h, r, r * (0.6 + rnd() * 0.4), rnd() * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          if (soort === 'zand')
            for (let k = 0; k < 14; k++) {
              ctx.strokeStyle = 'rgba(120,90,50,0.12)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              const y = rnd() * h;
              ctx.moveTo(0, y);
              for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin(x / 40 + k) * 6);
              ctx.stroke();
            }
        } else if (soort === 'kinderkopjes') {
          ctx.fillStyle = '#3a3531';
          ctx.fillRect(0, 0, w, h);
          const rijen = 22;
          const rh = h / rijen;
          for (let j = 0; j < rijen; j++) {
            let x = -(j % 2) * rh * 0.6;
            while (x < w) {
              const b = rh * (0.9 + rnd() * 0.5);
              ctx.fillStyle = donkerder(kleur, 0.75 + rnd() * 0.45);
              ctx.beginPath();
              ctx.roundRect(x + 1.5, j * rh + 1.5, b - 3, rh - 3, 5);
              ctx.fill();
              ctx.fillStyle = 'rgba(255,255,255,0.07)';
              ctx.fillRect(x + 4, j * rh + 3, b - 10, 3);
              x += b;
            }
          }
        } else if (soort === 'sneeuw') {
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          for (let k = 0; k < 40; k++) {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            g.addColorStop(0, 'rgba(150,180,215,0.22)');
            g.addColorStop(1, 'rgba(150,180,215,0)');
            ctx.save();
            ctx.translate(rnd() * w, rnd() * h);
            ctx.scale(40 + rnd() * 70, 20 + rnd() * 40);
            ctx.fillStyle = g;
            ctx.fillRect(-1, -1, 2, 2);
            ctx.restore();
          }
          spikkels(900, 0.25, 2);
        } else if (soort === 'terrazzo') {
          // lichte steen met fijne gekleurde korrels en hier en daar een grotere
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          const korrels = ['#b3a998', '#cfc6b6', '#a39886', '#f4efe6', '#c2b49e', '#a9b1b6'];
          for (let k = 0; k < 12000; k++) {
            ctx.fillStyle = korrels[Math.floor(rnd() * korrels.length)];
            const r = rnd() < 0.015 ? 2 + rnd() * 2.5 : 0.6 + rnd() * 1.3;
            ctx.beginPath();
            ctx.ellipse(rnd() * w, rnd() * h, r, r * (0.6 + rnd() * 0.4), rnd() * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          // naden om de 2 m (messing strips)
          ctx.fillStyle = 'rgba(160,130,70,0.55)';
          ctx.fillRect(0, 0, w, 2);
          ctx.fillRect(0, h / 2, w, 2);
          ctx.fillRect(0, 0, 2, h);
          ctx.fillRect(w / 2, 0, 2, h);
        } else if (soort === 'rooster') {
          // stalen roostervloer (meetveld, technische ruimte)
          ctx.fillStyle = '#1d2024';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = kleur;
          ctx.lineWidth = 3;
          const n = 64;
          for (let i = 0; i <= n; i++) {
            ctx.beginPath();
            ctx.moveTo((i / n) * w, 0);
            ctx.lineTo((i / n) * w, h);
            ctx.stroke();
          }
          ctx.lineWidth = 1.5;
          for (let i = 0; i <= n * 2; i++) {
            ctx.beginPath();
            ctx.moveTo(0, (i / (n * 2)) * h);
            ctx.lineTo(w, (i / (n * 2)) * h);
            ctx.stroke();
          }
        } else if (soort === 'rubber') {
          // noppenrubber
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          for (let y = 6; y < h; y += 14)
            for (let x = (y / 14) % 2 ? 6 : 13; x < w; x += 14) {
              ctx.beginPath();
              ctx.arc(x, y, 3.2, 0, Math.PI * 2);
              ctx.fill();
            }
        } else {
          // beton, tapijt, asfalt
          ctx.fillStyle = kleur;
          ctx.fillRect(0, 0, w, h);
          spikkels(soort === 'asfalt' ? 6000 : 2500, soort === 'asfalt' ? 0.08 : 0.05, soort === 'asfalt' ? 2 : 3);
        }
      },
      110,
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Zachte warme lichtvlek (op de vloer onder een lamp). */
export const lichtTex = () =>
  tex('lichtplek', () =>
    maakTextuur(
      2,
      2,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(255,196,120,0.55)');
        g.addColorStop(0.45, 'rgba(255,170,90,0.2)');
        g.addColorStop(1, 'rgba(255,150,70,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      },
      128,
    ),
  );

/** Witte gloed (voor lampen en vuurvliegjes), kleur via het materiaal. */
export const gloedTex = () =>
  tex('gloed', () =>
    maakTextuur(
      1,
      1,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.2, 'rgba(255,255,255,0.55)');
        g.addColorStop(0.55, 'rgba(255,255,255,0.12)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      },
      128,
    ),
  );

/** Plafond: donkere planken met zware balken (2 × 2 m per herhaling). */
export function plafondTextuur() {
  return tex('plafond', () => {
    const t = maakTextuur(
      2,
      2,
      (ctx, w, h) => {
        const r = reeks(77);
        const rij = h / 8;
        for (let i = 0; i < 8; i++) {
          const l = 0.85 + r() * 0.25;
          ctx.fillStyle = `rgb(${Math.round(92 * l)},${Math.round(68 * l)},${Math.round(50 * l)})`;
          ctx.fillRect(0, i * rij, w, rij);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(0, i * rij, w, 2);
          // nerven
          ctx.strokeStyle = 'rgba(40,24,14,0.25)';
          ctx.lineWidth = 1;
          for (let k = 0; k < 3; k++) {
            const y = i * rij + 4 + r() * (rij - 8);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 4, w * 0.7, y + (r() - 0.5) * 4, w, y);
            ctx.stroke();
          }
        }
        // balk dwars over de planken
        const b = w * 0.14;
        ctx.fillStyle = '#3a271b';
        ctx.fillRect(w / 2 - b / 2, 0, b, h);
        ctx.fillStyle = 'rgba(255,220,180,0.08)';
        ctx.fillRect(w / 2 - b / 2, 0, 3, h);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(w / 2 + b / 2 - 3, 0, 3, h);
      },
      128,
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Dakpannen (bevers met ronde onderkant, in verspringende rijen), 1 × 1 m per herhaling. */
export function dakpanTextuur(kleur = '#8e3f2c') {
  return tex(`dakpan${kleur}`, () => {
    const t = maakTextuur(
      1,
      1,
      (ctx, w, h) => {
        const r = reeks(91);
        ctx.fillStyle = donkerder(kleur, 0.45);
        ctx.fillRect(0, 0, w, h);
        const rijen = 6;
        const per = 6;
        const rh = h / rijen;
        const pb = w / per;
        for (let j = -1; j <= rijen; j++) {
          const y = h - (j + 1) * rh;
          const verschuif = j % 2 ? pb / 2 : 0;
          for (let i = -1; i <= per; i++) {
            const x = i * pb + verschuif;
            const f = 0.78 + r() * 0.34;
            ctx.fillStyle = donkerder(kleur, f);
            ctx.beginPath();
            // bever: recht boven, rond onder (onder = dakvoet, onderaan het plaatje)
            ctx.moveTo(x + 1.5, y - rh * 0.6);
            ctx.lineTo(x + pb - 1.5, y - rh * 0.6);
            ctx.lineTo(x + pb - 1.5, y + rh * 0.55);
            ctx.arc(x + pb / 2, y + rh * 0.55, pb / 2 - 1.5, 0, Math.PI);
            ctx.closePath();
            ctx.fill();
            // schaduw van de pan erboven en een glimlijntje
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.fillRect(x + 1.5, y - rh * 0.6, pb - 3, rh * 0.18);
            ctx.fillStyle = 'rgba(255,230,200,0.08)';
            ctx.fillRect(x + 3, y + rh * 0.1, 2, rh * 0.6);
            // mos en vlekjes
            if (r() < 0.12) {
              ctx.fillStyle = 'rgba(70,80,40,0.35)';
              ctx.beginPath();
              ctx.arc(x + pb * (0.3 + r() * 0.4), y + rh * 0.4, pb * 0.18, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      },
      192,
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/**
 * Wit pleisterwerk (zoals op Bran): licht gevlekt en verweerd, onderaan een plint van ruwe natuursteen
 * en een donkerder vochtrand. Breedte 2,4 m per herhaling, verticaal de hele muurhoogte H.
 */
export function pleisterTextuur(kleur = '#ece3d4', H = 3.2) {
  return tex(`pleister${kleur}${H}`, () => {
    const t = maakTextuur(
      2.4,
      H,
      (ctx, w, h) => {
        const r = reeks(313);
        const ppm = h / H;
        ctx.fillStyle = kleur;
        ctx.fillRect(0, 0, w, h);
        // zachte vlekken en verwering (de muren staan direct op de rots, zonder plint)
        for (let i = 0; i < 60; i++) {
          const x = r() * w;
          const y = r() * h;
          const rad = (0.1 + r() * 0.5) * ppm;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
          const donker = r() < 0.6;
          g.addColorStop(0, donker ? 'rgba(120,105,85,0.06)' : 'rgba(255,255,250,0.09)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          for (const dx of [0, -w, w]) for (const dy of [0, -h, h]) ctx.fillRect(x - rad + dx, y - rad + dy, rad * 2, rad * 2);
        }
        // een paar regenstrepen
        for (let i = 0; i < 6; i++) {
          const x = r() * w;
          const l = (0.6 + r() * 1.6) * ppm;
          const g = ctx.createLinearGradient(0, 0, 0, l);
          g.addColorStop(0, 'rgba(90,80,65,0.10)');
          g.addColorStop(1, 'rgba(90,80,65,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, (0.03 + r() * 0.05) * ppm, l);
        }
        // de kap van de muur gebruikt het bovenste randje
        ctx.fillStyle = donkerder(kleur, 0.88);
        ctx.fillRect(0, 0, w, 0.03 * ppm);
      },
      110,
    );
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

/** Vakwerk: donkere eiken balken (stijlen, regels en schoren) in wit pleister. 2,4 m breed, hoogte H. */
export function vakwerkTextuur(kleur = '#ece3d4', H = 3.2, balk = '#4a3324') {
  return tex(`vakwerk${kleur}${H}${balk}`, () => {
    const t = maakTextuur(
      2.4,
      H,
      (ctx, w, h) => {
        const ppm = h / H;
        ctx.fillStyle = kleur;
        ctx.fillRect(0, 0, w, h);
        const b = 0.16 * ppm;
        ctx.fillStyle = balk;
        // onder- en bovenregel, middenregel
        ctx.fillRect(0, h - b, w, b);
        ctx.fillRect(0, 0, w, b);
        ctx.fillRect(0, h * 0.48, w, b * 0.8);
        // stijlen elke 0,8 m
        for (let x = 0; x < w; x += 0.8 * ppm) ctx.fillRect(x, 0, b, h);
        // schoren in het onderste vak
        ctx.strokeStyle = balk;
        ctx.lineWidth = b * 0.8;
        for (let x = 0; x < w; x += 1.6 * ppm) {
          ctx.beginPath();
          ctx.moveTo(x + b, h - b);
          ctx.lineTo(x + 0.8 * ppm, h * 0.48 + b);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 1.6 * ppm, h - b);
          ctx.lineTo(x + 0.8 * ppm + b, h * 0.48 + b);
          ctx.stroke();
        }
        // houtnerf en wat schaduw
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        for (let x = 0; x < w; x += 0.8 * ppm) ctx.fillRect(x + b * 0.7, 0, b * 0.3, h);
      },
      110,
    );
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

/** Kalksteen van de rots: grijsbeige met scheuren, plekken en mos. 4 × 4 m per herhaling. */
export function rotsTextuur(kleur = '#b3a690') {
  return tex(`rots${kleur}`, () => {
    const t = maakTextuur(
      4,
      4,
      (ctx, w, h) => {
        const r = reeks(717);
        ctx.fillStyle = kleur;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) {
          const x = r() * w;
          const y = r() * h;
          const rad = 6 + r() * 46;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
          const k = r();
          g.addColorStop(0, k < 0.45 ? 'rgba(70,62,52,0.22)' : k < 0.8 ? 'rgba(235,228,210,0.16)' : 'rgba(80,95,55,0.22)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          for (const dx of [0, -w, w]) for (const dy of [0, -h, h]) ctx.fillRect(x - rad + dx, y - rad + dy, rad * 2, rad * 2);
        }
        // scheuren
        ctx.strokeStyle = 'rgba(40,34,28,0.45)';
        for (let i = 0; i < 40; i++) {
          let x = r() * w;
          let y = r() * h;
          ctx.lineWidth = 1 + r() * 2.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 6; k++) {
            x += (r() - 0.5) * 40;
            y += 6 + r() * 26;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      },
      96,
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Kalkpleister zonder plint (torens, schoorstenen): 2,4 × 2,4 m per herhaling, in beide richtingen. */
export function kalkTextuur(kleur = '#e4ded0') {
  return tex(`kalk${kleur}`, () => {
    const t = maakTextuur(
      2.4,
      2.4,
      (ctx, w, h) => {
        const r = reeks(515);
        ctx.fillStyle = kleur;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) {
          const x = r() * w;
          const y = r() * h;
          const rad = 8 + r() * 40;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
          g.addColorStop(0, r() < 0.7 ? 'rgba(120,105,85,0.11)' : 'rgba(255,255,250,0.12)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          for (const dx of [0, -w, w]) for (const dy of [0, -h, h]) ctx.fillRect(x - rad + dx, y - rad + dy, rad * 2, rad * 2);
        }
        for (let i = 0; i < 8; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, 'rgba(90,80,65,0.12)');
          g.addColorStop(1, 'rgba(90,80,65,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 2 + r() * 5, h * (0.3 + r() * 0.7));
        }
      },
      100,
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Grove, behakte natuursteenblokken (de poorttoren van Bran): 2 × 2 m per herhaling. */
export function blokSteenTextuur(kleur = '#6e665c') {
  return tex(`blok${kleur}`, () => {
    const t = maakTextuur(
      2,
      2,
      (ctx, w, h) => {
        const r = reeks(808);
        ctx.fillStyle = donkerder(kleur, 0.5);
        ctx.fillRect(0, 0, w, h);
        const rh = h / 8;
        for (let j = 0; j < 8; j++) {
          let x = j % 2 ? -w / 8 : 0;
          while (x < w) {
            const b = w / 4 + (r() - 0.5) * w * 0.08;
            const f = 0.75 + r() * 0.4;
            for (const dx of [0, w, -w]) {
              const g = ctx.createLinearGradient(0, j * rh, 0, (j + 1) * rh);
              g.addColorStop(0, donkerder(kleur, f * 1.18));
              g.addColorStop(1, donkerder(kleur, f * 0.8));
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.roundRect(x + dx + 4, j * rh + 4, b - 8, rh - 8, 10);
              ctx.fill();
            }
            x += b;
          }
        }
      },
      110,
    );
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Boogfries: een rij kleine rondboogjes op consoles (de kroon van de donjon), 0,9 m breed × 1 m hoog. */
export function boogfriesTextuur(kleur = '#cfcbc0') {
  return tex(`boogfries${kleur}`, () => {
    const t = maakTextuur(
      0.9,
      1,
      (ctx, w, h) => {
        ctx.fillStyle = kleur;
        ctx.fillRect(0, 0, w, h);
        // schaduw in de boog
        ctx.fillStyle = donkerder(kleur, 0.55);
        ctx.beginPath();
        ctx.moveTo(w * 0.18, h * 0.95);
        ctx.lineTo(w * 0.18, h * 0.45);
        ctx.arc(w / 2, h * 0.45, w * 0.32, Math.PI, 0);
        ctx.lineTo(w * 0.82, h * 0.95);
        ctx.closePath();
        ctx.fill();
        // console onder de boog
        ctx.fillStyle = donkerder(kleur, 0.85);
        ctx.fillRect(0, h * 0.88, w * 0.16, h * 0.12);
        ctx.fillRect(w * 0.84, h * 0.88, w * 0.16, h * 0.12);
        // lijst boven
        ctx.fillStyle = donkerder(kleur, 1.08);
        ctx.fillRect(0, 0, w, h * 0.08);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, h * 0.08, w, h * 0.03);
      },
      140,
    );
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}
