// Blok en Bol voor Wereld 3: in de wereld (op 15 m) met minder driehoeken, bij de inspectie precies
// zoals de gewone bouwstenen. Een blokje met afgeronde hoeken kost zo ± 108 in plaats van 300 driehoeken;
// heel kleine blokjes worden gewone balkjes (12 driehoeken).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useInspectie } from '../game/inspectie';
import { Blok as KitBlok, Cil as KitCil, mat } from '../game/kit';

type V3 = [number, number, number];

const cache = new Map<string, THREE.BufferGeometry>();
function geo(size: V3, radius: number) {
  const klein = Math.min(...size) < 0.05 || radius < 0.012;
  const key = `${size[0].toFixed(3)}|${size[1].toFixed(3)}|${size[2].toFixed(3)}|${klein ? 0 : radius.toFixed(3)}`;
  let g = cache.get(key);
  if (!g) {
    g = klein ? new THREE.BoxGeometry(size[0], size[1], size[2]) : new RoundedBoxGeometry(size[0], size[1], size[2], 1, radius);
    cache.set(key, g);
  }
  return g;
}

export function Blok(props: Parameters<typeof KitBlok>[0]) {
  const scherp = useInspectie().delen;
  if (scherp) return <KitBlok {...props} />;
  const { size, pos = [0, 0, 0], rot, color, r = 0.06, shadow = true, rough, opacity, name } = props;
  const radius = Math.min(r, size[0] / 2.01, size[1] / 2.01, size[2] / 2.01);
  return <mesh name={name} geometry={geo(size, radius)} position={pos} rotation={rot} castShadow={shadow} receiveShadow material={mat(color, { rough, opacity })} />;
}

/** Segmenten voor een bol: grof in de wereld, rond bij de inspectie. */
export function useBolSeg(fijn: [number, number] = [14, 10]): [number, number] {
  const scherp = useInspectie().delen;
  return scherp ? fijn : [Math.max(6, Math.round(fijn[0] * 0.6)), Math.max(5, Math.round(fijn[1] * 0.6))];
}

/** Cilinder: in de wereld met minder zijkanten (minimaal 8), bij de inspectie zoals gewoon. */
export function Cil(props: Parameters<typeof KitCil>[0]) {
  const scherp = useInspectie().delen;
  const seg = props.seg ?? 16;
  return <KitCil {...props} seg={scherp || seg <= 8 ? seg : Math.max(8, Math.round(seg * 0.6))} />;
}
