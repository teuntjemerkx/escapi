// Het trucje om het mooie beeld licht te houden: het spel kijkt zelf hoe snel jouw apparaat is.
// - Binnen een stand past de resolutie zich aan: te traag? Dan tekenen we iets minder pixels (dat zie je bijna niet,
//   de knoppen en teksten blijven scherp). Snel genoeg? Dan weer scherper.
// - Is het op de laagste resolutie nog te traag, dan gaat de stand omlaag (hoog → midden → laag).
// - Op een sterk apparaat dat ruim snel genoeg is, gaat de stand één keer omhoog.
// De docent kan ook zelf een stand kiezen (instelling "Beeldkwaliteit").
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MAX_DPR, MIN_DPR, type Beeld, type Kwaliteit } from './beeld';
import { useSpel } from './store';

/** Zwakke of software-videokaarten herkennen aan hun naam. */
function startStand(gl: WebGLRenderingContext | WebGL2RenderingContext): Kwaliteit {
  let naam = '';
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    naam = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
  } catch {
    /* onbekend: we meten het gewoon */
  }
  if (/swiftshader|llvmpipe|software|basic render/.test(naam)) return 'laag';
  const klein = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 600;
  if (klein || /mali|adreno [1-5]|powervr/.test(naam)) return 'midden';
  // losse videokaart of een Apple M-chip: meteen de mooiste stand (op 60 Hz kunnen we de ruimte niet meten)
  if (/nvidia|geforce|rtx|gtx|radeon rx|radeon pro|apple m\d/.test(naam)) return 'hoog';
  return 'midden';
}

const ORDE: Kwaliteit[] = ['laag', 'midden', 'hoog'];

/** De stand van nu, voor onderdelen die zelf minder doen op een trage stand (zoals het gras). */
export const beeldNu = { stand: 'midden' as Kwaliteit };

export function useBeeldKwaliteit(beeld: Beeld) {
  const gl = useThree((s) => s.gl);
  const setDpr = useThree((s) => s.setDpr);
  const keuze = useSpel((s) => s.beeld);
  const m = useRef({ stand: 'midden' as Kwaliteit, dpr: 1, gem: 1 / 60, traag: 0, snel: 0, opwarmen: 3, omhoogGedaan: false, omlaagGedaan: false });

  // stand kiezen bij de start (of als de docent iets kiest)
  useEffect(() => {
    const st = m.current;
    st.stand = keuze === 'auto' ? startStand(gl.getContext()) : keuze;
    st.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR[st.stand]);
    st.opwarmen = 3;
    st.traag = 0;
    st.snel = 0;
    beeld.stelIn(st.stand);
    beeldNu.stand = st.stand;
    setDpr(st.dpr);
    if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __kwaliteit: st });
  }, [keuze, beeld, gl, setDpr]);

  useFrame((_, dt) => {
    const st = m.current;
    // de eerste seconden (shaders bouwen, alles laden) tellen niet mee; losse haperingen ook niet
    if (st.opwarmen > 0 || dt > 0.25 || document.hidden) {
      st.opwarmen -= Math.min(dt, 0.1);
      return;
    }
    st.gem += (dt - st.gem) * 0.05;
    const max = Math.min(window.devicePixelRatio || 1, MAX_DPR[st.stand]);
    if (st.gem > 1 / 45) {
      st.traag += dt;
      st.snel = 0;
    } else if (st.gem < 1 / 57) {
      st.snel += dt;
      st.traag = 0;
    } else {
      st.traag = Math.max(0, st.traag - dt);
      st.snel = Math.max(0, st.snel - dt);
    }
    // te traag: eerst minder pixels, en als dat niet genoeg is een stand lager
    if (st.traag > 1.2) {
      st.traag = 0;
      if (st.dpr > MIN_DPR + 0.01) {
        st.dpr = Math.max(MIN_DPR, st.dpr - 0.15);
        setDpr(st.dpr);
      } else if (keuze === 'auto' && st.stand !== 'laag') {
        st.stand = ORDE[ORDE.indexOf(st.stand) - 1];
        st.omlaagGedaan = true;
        beeld.stelIn(st.stand);
        beeldNu.stand = st.stand;
        st.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR[st.stand]);
        setDpr(st.dpr);
        st.opwarmen = 2;
      }
    }
    // ruim snel genoeg: weer scherper, en (één keer, als er nooit teruggeschakeld is) een stand hoger
    if (st.snel > 3) {
      st.snel = 0;
      if (st.dpr < max - 0.01) {
        st.dpr = Math.min(max, st.dpr + 0.1);
        setDpr(st.dpr);
      } else if (keuze === 'auto' && st.stand !== 'hoog' && !st.omhoogGedaan && !st.omlaagGedaan && st.gem < 1 / 70) {
        st.stand = ORDE[ORDE.indexOf(st.stand) + 1];
        st.omhoogGedaan = true;
        beeld.stelIn(st.stand);
        beeldNu.stand = st.stand;
        st.opwarmen = 2;
      }
    }
  });
}
