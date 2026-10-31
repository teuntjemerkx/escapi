// Inspectiemodus: onderdelen (exploded view) en maatlijnen registreren zich hier.
// De Anime.js-timeline schuift de onderdelen langs hun eigen vector uit elkaar.
import { useFrame } from '@react-three/fiber';
import { animate, createTimeline, spring, type Timeline } from 'animejs';
import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { wasSlepen } from './invoer';
import { mat } from './kit';
import { useSpel } from './store';

type V3 = [number, number, number];

interface DeelInfo {
  id: string;
  groep: THREE.Group;
  basis: THREE.Vector3;
  uit: V3;
  label?: string;
  volgorde: number;
}
export interface MaatInfo {
  key: number;
  a: THREE.Object3D;
  b: THREE.Object3D;
  label: string;
  deel?: string;
  kleur?: string;
}

export const reg = {
  delen: new Map<string, DeelInfo>(),
  maten: new Map<number, MaatInfo>(),
  camera: null as THREE.Camera | null,
  canvas: null as HTMLCanvasElement | null,
};

const maatLuisteraars = new Set<() => void>();
export function opMatenVeranderd(cb: () => void) {
  maatLuisteraars.add(cb);
  return () => {
    maatLuisteraars.delete(cb);
  };
}
const meld = () => maatLuisteraars.forEach((cb) => cb());

let tijdlijn: Timeline | null = null;
let bouwGepland = false;

/** Bouw de timeline opnieuw zodra alle onderdelen er zijn (altijd vanuit de rustpositie). */
function planBouw() {
  if (bouwGepland) return;
  bouwGepland = true;
  queueMicrotask(() => {
    bouwGepland = false;
    tijdlijn?.pause();
    const delen = [...reg.delen.values()].sort((a, b) => a.volgorde - b.volgorde);
    delen.forEach((d) => d.groep.position.copy(d.basis));
    if (!delen.length) {
      tijdlijn = null;
      return;
    }
    const tl = createTimeline({ autoplay: false });
    delen.forEach((d, i) => {
      tl.add(
        d.groep.position,
        {
          x: d.basis.x + d.uit[0],
          y: d.basis.y + d.uit[1],
          z: d.basis.z + d.uit[2],
          ease: spring({ mass: 1, stiffness: 80, damping: 10, velocity: 0 }),
        },
        i * 140,
      );
    });
    tijdlijn = tl;
    zetUit(useSpel.getState().uit);
  });
}

export function zetUit(v: number) {
  if (!tijdlijn) return;
  tijdlijn.seek(tijdlijn.duration * Math.max(0, Math.min(1, v)));
}

let knopAnimatie: ReturnType<typeof animate> | null = null;
/** Knop "Haal uit elkaar" / "Zet in elkaar": schuif rustig naar 0 of 1. */
export function animeerUit(doel: 0 | 1) {
  knopAnimatie?.pause();
  const proxy = { v: useSpel.getState().uit };
  knopAnimatie = animate(proxy, {
    v: doel,
    duration: 1600,
    ease: 'inOutSine',
    onUpdate: () => {
      zetUit(proxy.v);
      useSpel.getState().setUit(proxy.v);
    },
  });
}

export function heeftDelen() {
  return reg.delen.size > 0;
}

/** Context: binnen een actieve inspectie registreren onderdelen en maten zich. */
const InspectieCtx = createContext<{ delen: boolean; maten: boolean }>({ delen: false, maten: false });
export function InspectieBereik({ delen, maten, children }: { delen: boolean; maten: boolean; children: ReactNode }) {
  return <InspectieCtx.Provider value={{ delen, maten }}>{children}</InspectieCtx.Provider>;
}

export const useInspectie = () => useContext(InspectieCtx);

let volgordeTeller = 0;
/** Een los onderdeel dat in de exploded view langs `uit` beweegt en aanklikbaar is. */
export function Deel({ id, uit, label, children }: { id: string; uit: V3; label?: string; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const ctx = useContext(InspectieCtx);
  const gekozen = useSpel((s) => s.gekozenDeel === id);
  useLayoutEffect(() => {
    if (!ctx.delen || !ref.current) return;
    const info: DeelInfo = { id, groep: ref.current, basis: ref.current.position.clone(), uit, label, volgorde: volgordeTeller++ };
    reg.delen.set(id, info);
    planBouw();
    return () => {
      ref.current?.position.copy(info.basis);
      if (reg.delen.get(id) === info) reg.delen.delete(id);
      planBouw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.delen, id, uit[0], uit[1], uit[2], label]);
  // Oplichten van het gekozen onderdeel.
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const orig = (m.userData.origMat as THREE.MeshStandardMaterial) ?? (m.material as THREE.MeshStandardMaterial);
      m.userData.origMat = orig;
      m.material = gekozen && orig.color ? mat('#' + orig.color.getHexString(), { emissive: '#f2b84b', opacity: orig.opacity }) : orig;
    });
  }, [gekozen]);
  return (
    <group
      ref={ref}
      name={id}
      onClick={
        ctx.delen
          ? (e) => {
              e.stopPropagation();
              if (wasSlepen()) return;
              const s = useSpel.getState();
              s.kiesDeel(s.gekozenDeel === id ? null : id);
            }
          : undefined
      }
    >
      {children}
    </group>
  );
}

let maatTeller = 0;
/** Maatlijn tussen twee punten (lokale coördinaten). Alleen zichtbaar tijdens de opdracht. */
export function Maat({ van, naar, label, deel, kleur }: { van: V3; naar: V3; label: string; deel?: string; kleur?: string }) {
  const a = useRef<THREE.Object3D>(null);
  const b = useRef<THREE.Object3D>(null);
  const ctx = useContext(InspectieCtx);
  useLayoutEffect(() => {
    if (!ctx.maten || !a.current || !b.current) return;
    const key = ++maatTeller;
    reg.maten.set(key, { key, a: a.current, b: b.current, label, deel, kleur });
    meld();
    return () => {
      reg.maten.delete(key);
      meld();
    };
  }, [ctx.maten, label, deel, kleur]);
  return (
    <>
      <object3D ref={a} position={van} />
      <object3D ref={b} position={naar} />
    </>
  );
}

/** Geeft de camera en het canvas door aan de SVG-laag met maatlijnen. */
export function CameraKoppeling() {
  useFrame(({ camera, gl }) => {
    reg.camera = camera;
    reg.canvas = gl.domElement;
  });
  return null;
}
