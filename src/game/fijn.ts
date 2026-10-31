// Fijne oppervlaktestructuur voor effen materialen: een heel klein beetje kleur- en glansvariatie over het oppervlak
// (zoals hout, stof, verf en steen in het echt nooit precies één kleur hebben). Zo ziet niets eruit als plastic.
// Het patroon hangt aan de plek in de wereld, dus het beweegt niet mee als je loopt.
import type * as THREE from 'three';

const RUIS = `
float fijnHash( vec3 p ) {
  p = fract( p * 0.3183099 + 0.1 );
  p *= 17.0;
  return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) );
}
float fijnRuis( vec3 x ) {
  vec3 i = floor( x );
  vec3 f = fract( x );
  f = f * f * ( 3.0 - 2.0 * f );
  return mix(
    mix( mix( fijnHash( i ), fijnHash( i + vec3( 1.0, 0.0, 0.0 ) ), f.x ), mix( fijnHash( i + vec3( 0.0, 1.0, 0.0 ) ), fijnHash( i + vec3( 1.0, 1.0, 0.0 ) ), f.x ), f.y ),
    mix( mix( fijnHash( i + vec3( 0.0, 0.0, 1.0 ) ), fijnHash( i + vec3( 1.0, 0.0, 1.0 ) ), f.x ), mix( fijnHash( i + vec3( 0.0, 1.0, 1.0 ) ), fijnHash( i + vec3( 1.0, 1.0, 1.0 ) ), f.x ), f.y ),
    f.z );
}
// relief uit een hoogte die op het scherm verloopt (zoals three's bumpmap)
vec3 fijnRelief( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
  vec3 sx = dFdx( surf_pos.xyz );
  vec3 sy = dFdy( surf_pos.xyz );
  // veilig: geen deling door nul (dan zou er een ongeldig getal ontstaan dat de gloed verpest)
  if ( dot( sx, sx ) < 1e-14 || dot( sy, sy ) < 1e-14 ) return surf_norm;
  vec3 vSigmaX = normalize( sx );
  vec3 vSigmaY = normalize( sy );
  vec3 R1 = cross( vSigmaY, surf_norm );
  vec3 R2 = cross( surf_norm, vSigmaX );
  float fDet = dot( vSigmaX, R1 ) * faceDirection;
  vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
  vec3 r = abs( fDet ) * surf_norm - vGrad;
  float l = dot( r, r );
  return l > 1e-12 ? r * inversesqrt( l ) : surf_norm;
}`;

/** Geef een (standaard)materiaal de fijne structuur. `sterkte` 1 = gewoon, 0.5 = de helft. */
export function metFijnDetail<T extends THREE.Material>(m: T, sterkte = 1): T {
  const vorige = m.onBeforeCompile;
  const kleur = (0.07 * sterkte).toFixed(3);
  const fijnK = (0.035 * sterkte).toFixed(3);
  const basis = (1 - 0.0525 * sterkte).toFixed(4);
  const glans = (0.14 * sterkte).toFixed(3);
  const reliëf = (1.1 * sterkte).toFixed(3);
  m.onBeforeCompile = (sh, r) => {
    vorige?.call(m, sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFijn;').replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
      {
        vec4 fw = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          fw = instanceMatrix * fw;
        #endif
        vFijn = ( modelMatrix * fw ).xyz;
      }`,
    );
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vFijn;\n${RUIS}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float fijnA = fijnRuis( vFijn * 2.7 );
        float fijnB = fijnRuis( vFijn * 9.3 + 17.0 );
        diffuseColor.rgb *= ${basis} + ${kleur} * fijnA + ${fijnK} * fijnB;`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          // microrelief: alleen van dichtbij (verderop zou het flikkeren), en heel zacht
          float fijnAfst = length( vViewPosition );
          float fijnK = smoothstep( 9.0, 2.5, fijnAfst ) * ${reliëf};
          // afgeleiden altijd uitrekenen (niet binnen een if: dan zijn ze niet betrouwbaar)
          float fh = fijnRuis( vFijn * 13.0 ) * 0.65 + fijnRuis( vFijn * 41.0 + 3.0 ) * 0.35;
          vec2 fdh = vec2( dFdx( fh ), dFdy( fh ) );
          vec3 fijnN = fijnRelief( - vViewPosition, normal, fdh * fijnK, faceDirection );
          if ( fijnK > 0.001 ) normal = fijnN;
        }`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = clamp( roughnessFactor + ( fijnA - 0.5 ) * ${glans}, 0.04, 1.0 );`,
      );
  };
  const oud = m.customProgramCacheKey.bind(m);
  m.customProgramCacheKey = () => `${oud()}|fijn${sterkte}`;
  return m;
}
