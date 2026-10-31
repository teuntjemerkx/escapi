// Laagjes die bovenop de wereld worden getekend (zie beeld.ts): ze kunnen nooit achter een muur verdwijnen.
import * as THREE from 'three';

/** Het maatje (Boo, Mees …): zweeft voor de camera en mag niet in het decor wegvallen. Met een eigen zacht licht. */
export const maatjeScene = (() => {
  const s = new THREE.Scene();
  s.add(new THREE.HemisphereLight('#f4f0ff', '#3a3448', 1.25));
  const zon = new THREE.DirectionalLight('#fff4e6', 1.4);
  zon.position.set(2, 4, 3);
  s.add(zon);
  s.add(new THREE.AmbientLight('#ffffff', 0.18));
  return s;
})();
