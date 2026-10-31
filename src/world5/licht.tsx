// Wereld 5 – licht in het meetstation. Het station draait op noodstroom: rood noodlicht.
// Zet je een systeem aan (kluis open), dan springen de lampen van die vleugel één voor één op wit ("tsjak-tsjak").
// Alles is goedkoop: lichtpanelen en lichtvlekken zijn twee InstancedMeshes met een kleur per lamp,
// plus één extra hemellicht dat de kleur aanneemt van de kamer waar je staat. Geen echte lampen.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { geluid } from '../lib/geluid';
import { kamerOp } from '../game/huis';
import { speler, useSpel, type Fase } from '../game/store';
import { gloedTex } from '../game/texturen';
import { HV, PLAN } from './huis';

export type Toestand = 'nood' | 'aan' | 'warm' | 'pre';
type Zone = 'warm' | 'zaal' | 'vervoer' | 'wonen' | 'vrijetijd' | 'keuze' | 'eind';

/** Welke kamer hoort bij welk systeem (of welke lichtsoort). */
const ZONE_VAN: Record<string, Zone> = {
  sluis: 'warm',
  hal: 'warm',
  galerij: 'warm',
  uitleg: 'keuze',
  controlezaal: 'zaal',
  pauze: 'zaal',
  techniek: 'vervoer',
  garage: 'vervoer',
  verblijf: 'wonen',
  vluchtleiding: 'eind',
  kaartenkamer: 'keuze',
  opslag: 'keuze',
  datakamer: 'keuze',
  recreatie: 'vrijetijd',
  uitkijkpost: 'eind',
};

const ORDE = ['terugblik', 'doel', 'instructie', 'begeleid', 'zelfstandig', 'evaluatie', 'klaar'];
const voorbij = (fase: Fase, f: Fase) => ORDE.indexOf(fase) >= ORDE.indexOf(f);

export function systeemAan(kluizen: Record<string, boolean>, wereld: number, id: string) {
  return !!kluizen[`${wereld}:${id}`];
}

export function toestandVan(zone: Zone, kluizen: Record<string, boolean>, wereld: number, fase: Fase): Toestand {
  const aan = (id: string) => systeemAan(kluizen, wereld, id);
  switch (zone) {
    case 'warm':
      return 'warm';
    case 'keuze':
      return 'aan';
    case 'zaal':
      return aan('vervoer') && aan('wonen') && aan('vrijetijd') ? 'aan' : 'nood';
    case 'vervoer':
    case 'wonen':
    case 'vrijetijd':
      return aan(zone) ? 'aan' : 'nood';
    case 'eind':
      return fase === 'klaar' ? 'aan' : voorbij(fase, 'evaluatie') ? 'pre' : 'nood';
  }
}

const PANEEL: Record<Toestand, THREE.Color> = {
  nood: new THREE.Color('#ff2d1c'),
  aan: new THREE.Color('#f2f6ff'),
  warm: new THREE.Color('#ffe2b6'),
  pre: new THREE.Color('#ffb04a'),
};
const VLEK: Record<Toestand, THREE.Color> = {
  nood: new THREE.Color('#ff2a10').multiplyScalar(0.3),
  aan: new THREE.Color('#c9dbff').multiplyScalar(0.24),
  warm: new THREE.Color('#ffc890').multiplyScalar(0.34),
  pre: new THREE.Color('#ffa040').multiplyScalar(0.3),
};
const HEMEL: Record<Toestand, [string, string, number]> = {
  nood: ['#ff5a46', '#4a2a26', 0.8],
  aan: ['#e6eeff', '#4a5260', 0.7],
  warm: ['#ffd7a8', '#3a2a1f', 0.5],
  pre: ['#ffb466', '#3a2a1f', 0.5],
};

interface Lamp {
  zone: Zone;
  m: THREE.Matrix4;
  /** volgorde binnen de zone (voor het één-voor-één aanspringen) */
  n: number;
}

/** Lichtpanelen aan het plafond van elke binnenkamer, plus de ledlijnen langs de tribune. */
function maakLampen(): { panelen: Lamp[]; vlekken: Lamp[] } {
  const panelen: Lamp[] = [];
  const vlekken: Lamp[] = [];
  const o = new THREE.Object3D();
  const tel: Record<string, number> = {};
  const voeg = (lijst: Lamp[], zone: Zone) => {
    o.updateMatrix();
    tel[zone] = (tel[zone] ?? 0) + 1;
    lijst.push({ zone, m: o.matrix.clone(), n: tel[zone] });
  };
  for (const k of PLAN.kamers) {
    if (k.buiten) continue;
    const zone = ZONE_VAN[k.id];
    if (!zone) continue;
    const v = k.verdieping ?? 0;
    const vloer = v * HV;
    const [w, d] = k.maat;
    const [cx, cz] = k.pos;
    const zaal = k.id === 'controlezaal';
    // plafondhoogte: de zaal is 6,7 m (het achterste stuk ligt onder de galerij)
    // de lampen hangen 10 cm onder het plafond (boven een kamer op de verdieping ligt een vloerplaat die lager komt)
    const plafond = vloer + (k.hoogte ?? PLAN.muurHoogte ?? 3.2) - 0.1;
    const nx = Math.max(1, Math.round(w / 3.2));
    const nz = Math.max(1, Math.round((zaal ? 9 : d) / 3.2));
    const lang = w >= d;
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        const x = cx - w / 2 + (w * (i + 0.5)) / nx;
        const z = zaal ? -10 + (9 * (j + 0.5)) / nz : cz - d / 2 + (d * (j + 0.5)) / nz;
        o.position.set(x, plafond, z);
        o.rotation.set(Math.PI / 2, 0, lang ? 0 : Math.PI / 2);
        o.scale.set(zaal ? 2.6 : 1.25, zaal ? 0.22 : 0.32, 1);
        voeg(panelen, zone);
      }
    if (zaal) {
      // onder de galerij (achterpad): lage lichtstroken
      for (const x of [-6, -2, 2, 6]) {
        o.position.set(x, 3.08, 1.0);
        o.rotation.set(Math.PI / 2, 0, 0);
        o.scale.set(1.25, 0.28, 1);
        voeg(panelen, zone);
      }
      // ledlijn op de neus van rij 2 en rij 3 (je ziet de tribune in het donker)
      for (const [z, h] of [
        [-4, 0.3],
        [-1.5, 0.6],
      ] as const)
        for (const x of [-2.9, 2.9]) {
          o.position.set(x, h - 0.05, z - 0.003);
          o.rotation.set(0, Math.PI, 0);
          o.scale.set(4.1, 0.035, 1);
          voeg(panelen, zone);
        }
    }
    // lichtvlekken op de vloer
    const n = Math.max(1, Math.min(3, Math.round((w * d) / 40)));
    for (let i = 0; i < n; i++) {
      const lx = lang ? cx - w / 2 + (w * (i + 0.5)) / n : cx;
      const lz = lang ? (zaal ? -5.5 : cz) : cz - d / 2 + (d * (i + 0.5)) / n;
      const r = Math.min(lang ? w / n : w, lang ? d : d / n) * 0.62;
      o.position.set(lx, vloer + 0.03, lz);
      o.rotation.set(-Math.PI / 2, 0, 0);
      o.scale.set(r * 2, r * 2, 1);
      voeg(vlekken, zone);
    }
  }
  return { panelen, vlekken };
}

/** Het noodlicht dat per systeem op wit springt. Gebruik in `Levend`. */
export function Noodlicht() {
  const { panelen, vlekken } = useMemo(maakLampen, []);
  const paneelMesh = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, side: THREE.DoubleSide });
    const im = new THREE.InstancedMesh(g, m, panelen.length);
    panelen.forEach((l, i) => {
      im.setMatrixAt(i, l.m);
      im.setColorAt(i, PANEEL.nood);
    });
    im.frustumCulled = false;
    return im;
  }, [panelen]);
  const vlekMesh = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.MeshBasicMaterial({ map: gloedTex(), color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const im = new THREE.InstancedMesh(g, m, vlekken.length);
    vlekken.forEach((l, i) => {
      im.setMatrixAt(i, l.m);
      im.setColorAt(i, VLEK.nood);
    });
    im.frustumCulled = false;
    im.renderOrder = 2;
    return im;
  }, [vlekken]);
  useEffect(
    () => () => {
      paneelMesh.geometry.dispose();
      (paneelMesh.material as THREE.Material).dispose();
      vlekMesh.geometry.dispose();
      (vlekMesh.material as THREE.Material).dispose();
    },
    [paneelMesh, vlekMesh],
  );
  const hemel = useRef<THREE.HemisphereLight>(null);
  // per zone: huidige toestand en wanneer hij omsprong
  const staat = useRef<Record<string, { t: Toestand; sinds: number; vorig: Toestand }>>({});
  const kleur = useMemo(() => new THREE.Color(), []);
  const lucht = useMemo(() => new THREE.Color(), []);
  const grond = useMemo(() => new THREE.Color(), []);
  const geklikt = useRef<Record<string, number>>({});
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const s = useSpel.getState();
    const zones: Zone[] = ['warm', 'zaal', 'vervoer', 'wonen', 'vrijetijd', 'keuze', 'eind'];
    for (const z of zones) {
      const nu = toestandVan(z, s.kluizen, s.wereld, s.fase);
      const st = staat.current[z];
      if (!st) staat.current[z] = { t: nu, sinds: -99, vorig: nu };
      else if (st.t !== nu) {
        staat.current[z] = { t: nu, sinds: t, vorig: st.t };
        geklikt.current[z] = 0;
      }
    }
    // kleuren: elke lamp springt om na n × 0,09 s; noodlicht ademt zacht
    const adem = 0.72 + 0.28 * Math.sin(t * 1.7);
    const zetKleuren = (mesh: THREE.InstancedMesh, lampen: Lamp[], tabel: Record<Toestand, THREE.Color>, vlek: boolean) => {
      lampen.forEach((l, i) => {
        const st = staat.current[l.zone];
        const om = t - st.sinds > l.n * 0.09;
        const toestand = om ? st.t : st.vorig;
        kleur.copy(tabel[toestand]);
        if (toestand === 'nood') kleur.multiplyScalar(vlek ? adem : 0.55 + 0.45 * adem);
        mesh.setColorAt(i, kleur);
      });
      mesh.instanceColor!.needsUpdate = true;
    };
    zetKleuren(paneelMesh, panelen, PANEEL, false);
    zetKleuren(vlekMesh, vlekken, VLEK, true);
    // klik-geluid bij het aanspringen (een paar keer, niet bij elke lamp)
    for (const [z, st] of Object.entries(staat.current)) {
      if (st.t === st.vorig || t - st.sinds > 2) continue;
      const n = Math.floor((t - st.sinds) / 0.27);
      if (n > (geklikt.current[z] ?? 0) && n <= 4) {
        geklikt.current[z] = n;
        geluid('klik');
      }
    }
    // hemellicht in de kleur van de kamer waar je staat (buiten: uit)
    const h = hemel.current;
    if (!h) return;
    const k = s.modus === 'lopen' ? kamerOp(PLAN, speler.pos.x, speler.pos.z, speler.verdieping) : undefined;
    const zone = k && !k.buiten ? ZONE_VAN[k.id] : undefined;
    const doel = zone ? HEMEL[staat.current[zone]?.t ?? 'nood'] : null;
    const f = Math.min(1, dt * 2.5);
    if (doel) {
      lucht.set(doel[0]);
      grond.set(doel[1]);
      h.color.lerp(lucht, f);
      h.groundColor.lerp(grond, f);
    }
    h.intensity += ((doel ? doel[2] : 0) - h.intensity) * f;
  });
  return (
    <>
      <primitive object={paneelMesh} />
      <primitive object={vlekMesh} />
      <hemisphereLight ref={hemel} args={['#ff4636', '#2a0f0c', 0]} />
    </>
  );
}
