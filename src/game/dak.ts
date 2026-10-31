// Schuine daken boven kamers: schilddak, zadeldak (met puntgevels) en piramidedak (torentjes).
// De vorm komt als losse driehoeken met uv in meters (dakpannen per meter), klaar om samen te voegen.
import * as THREE from 'three';

export type DakSoort = 'schild' | 'zadel' | 'piramide';

/** Rechthoek [minX, maxX, minZ, maxZ] op de muurlijnen. */
export type Vak = [number, number, number, number];

/**
 * Dak op een vak. `helling` in radialen, `over` = overstek voorbij de muur (m). De dakvoet ligt zo dat het dak
 * precies op de muurlijn de bovenkant van de muur raakt (y = 0); het overstek zakt daar iets onder.
 * Geeft het dakvlak (pannen) en de puntgevels (alleen bij een zadeldak).
 */
export function dakVorm(vak: Vak, soort: DakSoort, helling = 0.9, over = 0.45, maxHoog = 5.5, richting?: 'x' | 'z') {
  const [x0, x1, z0, z1] = vak;
  const lx = x1 - x0;
  const lz = z1 - z0;
  // nok langs de lange kant (tenzij anders gevraagd)
  const langsX = richting ? richting === 'x' : lx >= lz;
  // werk in "lokale" assen: a = langs de nok, b = dwars
  const [a0, a1, b0, b1] = langsX ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
  const halfB = (b1 - b0) / 2;
  const bm = (b0 + b1) / 2;
  const s = Math.min(Math.tan(helling), maxHoog / halfB);
  const nok = halfB * s;
  const voet = -over * s;
  const A0 = a0 - over;
  const A1 = a1 + over;
  const B0 = b0 - over;
  const B1 = b1 + over;
  const P = (a: number, y: number, b: number) => (langsX ? new THREE.Vector3(a, y, b) : new THREE.Vector3(b, y, a));
  const pannen: THREE.Vector3[][] = [];
  const gevels: THREE.Vector3[][] = [];
  if (soort === 'zadel') {
    pannen.push([P(A0, voet, B1), P(A1, voet, B1), P(A1, nok, bm), P(A0, nok, bm)]);
    pannen.push([P(A1, voet, B0), P(A0, voet, B0), P(A0, nok, bm), P(A1, nok, bm)]);
    gevels.push([P(a0, 0, b1), P(a0, nok, bm), P(a0, 0, b0)]);
    gevels.push([P(a1, 0, b0), P(a1, nok, bm), P(a1, 0, b1)]);
  } else {
    // schild- of piramidedak: de korte kanten lopen ook schuin op
    const inspring = soort === 'piramide' ? (a1 - a0) / 2 : Math.min(halfB, (a1 - a0) / 2);
    const r0 = a0 + inspring;
    const r1 = a1 - inspring;
    pannen.push([P(A0, voet, B1), P(A1, voet, B1), P(r1, nok, bm), P(r0, nok, bm)]);
    pannen.push([P(A1, voet, B0), P(A0, voet, B0), P(r0, nok, bm), P(r1, nok, bm)]);
    pannen.push([P(A0, voet, B0), P(A0, voet, B1), P(r0, nok, bm)]);
    pannen.push([P(A1, voet, B1), P(A1, voet, B0), P(r1, nok, bm)]);
  }
  // gespiegeld (x en z verwisseld)? Dan de hoeken andersom, zodat de vlakken naar buiten wijzen
  if (!langsX) for (const v of [...pannen, ...gevels]) v.reverse();
  return { pannen: vlakken(pannen), gevels: gevels.length ? vlakken(gevels, true) : null, nok };
}

/** Veelhoeken (3 of 4 hoeken) naar driehoeken met uv in meters: u langs de dakvoet, v de helling op. */
function vlakken(lijst: THREE.Vector3[][], gevel = false) {
  const pos: number[] = [];
  const uv: number[] = [];
  const e = new THREE.Vector3();
  const n = new THREE.Vector3();
  const op = new THREE.Vector3();
  for (const v of lijst) {
    n.subVectors(v[1], v[0]).cross(new THREE.Vector3().subVectors(v[2], v[0])).normalize();
    if (gevel) {
      // puntgevel: u horizontaal, v recht omhoog
      e.set(-n.z, 0, n.x).normalize();
      op.set(0, 1, 0);
    } else {
      e.subVectors(v[1], v[0]).normalize();
      op.crossVectors(n, e).normalize();
    }
    const tris = v.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2];
    for (const i of tris) {
      const p = v[i];
      pos.push(p.x, p.y, p.z);
      const d = new THREE.Vector3().subVectors(p, v[0]);
      uv.push(d.dot(e), d.dot(op));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
