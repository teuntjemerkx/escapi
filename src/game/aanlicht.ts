// Schijnwerpers van onderen (zoals bij Bran 's nachts): een warme gloed op gevels en torens die naar boven
// toe zwakker wordt. Geen echte lampen (dat kost veel), maar een beetje eigen licht in het materiaal.
import * as THREE from 'three';

export type Aanlicht = { kleur: string; hoogte: number; sterkte: number; voet?: number };

/** Geef een (kopie van een) materiaal een warme gloed van onderen, op wereldhoogte `voet` tot `voet + hoogte`. */
export function metAanlicht<T extends THREE.Material>(m: T, a: Aanlicht | undefined, sleutel = ''): T {
  if (!a) return m;
  const k = new THREE.Color(a.kleur).multiplyScalar(a.sterkte);
  const voet = a.voet ?? -8;
  const vorige = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    vorige?.call(m, sh, r);
    sh.uniforms.uAanKleur = { value: k };
    sh.uniforms.uAanVoet = { value: voet };
    sh.uniforms.uAanHoog = { value: a.hoogte };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vAanY;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        {
          vec4 aw = vec4( transformed, 1.0 );
          #ifdef USE_INSTANCING
            aw = instanceMatrix * aw;
          #endif
          vAanY = ( modelMatrix * aw ).y;
        }`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vAanY;\nuniform vec3 uAanKleur;\nuniform float uAanVoet;\nuniform float uAanHoog;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float t = clamp( ( vAanY - uAanVoet ) / uAanHoog, 0.0, 1.0 );
          totalEmissiveRadiance += uAanKleur * pow( 1.0 - t, 1.8 ) * diffuseColor.rgb;
        }`,
      );
  };
  const oud = m.customProgramCacheKey.bind(m);
  m.customProgramCacheKey = () => `${oud()}|aanlicht${sleutel}${a.kleur}${a.hoogte}${a.sterkte}${voet}`;
  return m;
}
