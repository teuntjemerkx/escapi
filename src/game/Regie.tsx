// Camera-regie: van wandelen naar inspectie en terug.
// - "boven": helikopterview recht boven het echte object, met maatlijnen.
// - "draai": het object vliegt naar je toe en staat op een diorama-tegel in een rustige,
//   groene ruimte (de wereld vervaagt). Je kunt het 360 graden draaien en uit elkaar halen.
import { OrbitControls } from '@react-three/drei';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { animate, spring } from 'animejs';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { huidig, stationVan } from '../werelden';
import { hoogteVan } from './wereld-basis';
import { animeerUit, InspectieBereik, zetUit } from './inspectie';
import { Blok, mat } from './kit';
import { P } from './palette';
import { cam, FOV_EERSTE, OOG_H, speler, useSpel } from './store';
import { geluid } from '../lib/geluid';
import { Beeld } from './beeld';
import { useBeeldKwaliteit } from './kwaliteit';
import { handScene } from './zaklamp';
import { maatjeScene } from './lagen';

const STAGE_MAAT = 3.1; // grootte waarop het object in de draai-inspectie staat
const FOV_LOPEN = 42;

/** Paneelruimte rechts (desktop) of onder (telefoon): de camera schuift het beeld opzij. */
export function paneelRuimte(w: number, h: number) {
  if (w >= 900) {
    const p = Math.min(460, w * 0.4);
    return { x: p / 2, y: 36, vrijW: (w - p - 40) / w, vrijH: (h - 150) / h };
  }
  // Telefoon: paneel onder (50%), knoppen boven (±150 px).
  return { x: 0, y: Math.round(h * 0.25 - 75), vrijW: 0.92, vrijH: Math.max(0.2, (h * 0.5 - 160) / h) };
}

export function Regie() {
  const { camera, scene, gl, size } = useThree();
  const persp = camera as THREE.PerspectiveCamera;
  const modus = useSpel((s) => s.modus);
  const actief = useSpel((s) => s.actief);
  const weergave = useSpel((s) => s.weergave);
  const controls = useRef<OrbitImpl>(null);
  const kijk = useRef(new THREE.Vector3());
  const stage = useRef<THREE.Group>(null);
  const tegel = useRef<THREE.Group>(null);
  const stageScene = useMemo(() => {
    const s = new THREE.Scene();
    return s;
  }, []);
  const sluier = useRef({ dekking: 0 });
  const sluierMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { kleur: { value: new THREE.Color(P.lucht) }, rand: { value: new THREE.Color(P.lucht) }, dekking: { value: 0 } },
        vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        // Zachte vignet: midden iets lichter dan de rand (zoals een studio-achtergrond).
        fragmentShader:
          'uniform vec3 kleur; uniform vec3 rand; uniform float dekking; varying vec2 vP; void main(){ float d = clamp(length(vP * vec2(0.8, 1.0)) * 0.8, 0.0, 1.0); gl_FragColor = vec4(mix(kleur, rand, d * d), dekking); \n#include <colorspace_fragment>\n}',
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );
  const sluierScene = useMemo(() => {
    const sc = new THREE.Scene();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sluierMat);
    m.frustumCulled = false;
    sc.add(m);
    return sc;
  }, [sluierMat]);
  const offset = useRef({ x: 0, y: 0 });
  const st = actief ? stationVan(actief) : null;
  const stageZichtbaar = !!st && weergave === 'draai' && modus !== 'lopen';
  const stageDoel = useRef(new THREE.Vector3());

  // De beeldketen (nabewerking): wereld, contactschaduw, sluier + inspectie-object, hand met zaklamp, gloed.
  const beeld = useMemo(() => new Beeld(gl, scene, camera, sluierScene, stageScene, handScene, maatjeScene), [gl, scene, camera, sluierScene, stageScene]);
  useEffect(() => () => beeld.dispose(), [beeld]);
  const dpr = useThree((st) => st.viewport.dpr);
  useEffect(() => beeld.setSize(size.width, size.height), [beeld, size.width, size.height, dpr]);
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __beeld: beeld });
  }, [beeld]);
  useBeeldKwaliteit(beeld);

  // Eigen render-volgorde: eerst de wereld, dan de sluier + het inspectie-object erbovenop.
  useFrame((_, dt) => {
    sluierMat.uniforms.dekking.value = sluier.current.dekking;
    const binnen = !!huidig().plan;
    (sluierMat.uniforms.kleur.value as THREE.Color).set(binnen ? '#4a3626' : P.lucht);
    (sluierMat.uniforms.rand.value as THREE.Color).set(binnen ? '#1a120c' : '#5f957d');
    if (offset.current.x || offset.current.y) persp.setViewOffset(size.width, size.height, offset.current.x, offset.current.y, size.width, size.height);
    else if (persp.view) persp.clearViewOffset();
    const s = useSpel.getState();
    const overlay = stageZichtbaar || sluier.current.dekking > 0.001;
    const hand = !!huidig().sfeer?.zaklamp && s.cameraStand === 'eerste' && s.modus === 'lopen' && s.kaart !== 'start' && s.kaart !== 'werelden';
    // de beeldketen wist zelf wat nodig is (anders wist elke laag de vorige weg)
    gl.autoClear = false;
    // tellers (tekenstappen, driehoeken) over het hele beeld, niet per laag
    gl.info.autoReset = false;
    gl.info.reset();
    beeld.render(dt, { sluier: overlay, stage: overlay, hand, wereldTonen: !(overlay && sluier.current.dekking > 0.995) });
  }, 1);

  // Tijdens overgangen kijkt de camera naar het bewegende doelpunt.
  useFrame(() => {
    const m = useSpel.getState().modus;
    if (m === 'heen' || m === 'terug') camera.lookAt(kijk.current);
  });

  useEffect(() => {
    if (!st) return;
    const anims: { pause: () => void }[] = [];
    const ruimte = paneelRuimte(size.width, size.height);

    if (modus === 'heen') {
      geluid('woesj');
      if (controls.current) controls.current.enabled = false;
      const sch = st.schaal ?? 1;
      const echt = st.grootte / sch;
      const mid = st.midden ?? Math.min(1, echt * 0.15);
      if (weergave === 'boven') {
        const doel = new THREE.Vector3(st.pos[0], hoogteVan(st) + mid * sch * 0.5, st.pos[1]);
        const fov = 40;
        const { vrijW, vrijH } = ruimte;
        const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
        const h = Math.max(2.2, (st.grootte * 0.64) / (tan * Math.min(vrijH, (size.width / size.height) * vrijW)));
        const pos = new THREE.Vector3(doel.x, doel.y + h, doel.z + h * 0.16);
        anims.push(animate(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1500, ease: 'inOutCubic' }));
        anims.push(animate(kijk.current, { x: doel.x, y: doel.y, z: doel.z, duration: 1500, ease: 'inOutCubic' }));
        anims.push(animate(persp, { fov, duration: 1500, ease: 'inOutCubic', onUpdate: () => persp.updateProjectionMatrix() }));
        anims.push(animate(sluier.current, { dekking: 0, duration: 600 }));
        anims.push(
          animate(offset.current, {
            x: ruimte.x,
            y: ruimte.y,
            duration: 1500,
            ease: 'inOutCubic',
            onComplete: () => {
              if (controls.current) {
                controls.current.target.copy(doel);
                controls.current.update();
              }
              useSpel.getState().aangekomen();
              if (st.bovenUit) animeerUit(1);
            },
          }),
        );
      } else {
        // Het object komt naar je toe: vlak voor het poppetje, op ooghoogte.
        const naar = new THREE.Vector3(st.pos[0] - speler.pos.x, 0, st.pos[1] - speler.pos.z);
        if (naar.lengthSq() < 0.01) naar.set(0, 0, -1);
        naar.normalize();
        const T = speler.pos.clone().addScaledVector(naar, 2.6).add(new THREE.Vector3(0, 1.6, 0));
        stageDoel.current.copy(T);
        const k = STAGE_MAAT / echt;
        const doel = T.clone().add(new THREE.Vector3(0, mid * k, 0));
        const az = Math.atan2(-naar.x, -naar.z) + Math.PI / 4;
        const el = 0.62;
        const afstand = 11.5;
        const pos = new THREE.Vector3(doel.x + Math.sin(az) * Math.cos(el) * afstand, doel.y + Math.sin(el) * afstand, doel.z + Math.cos(az) * Math.cos(el) * afstand);
        const g = stage.current;
        if (g) {
          g.position.set(st.pos[0], hoogteVan(st), st.pos[1]);
          g.rotation.y = st.rot ?? 0;
          g.scale.setScalar(sch / k);
          anims.push(animate(g.position, { x: T.x, y: T.y, z: T.z, duration: 1500, ease: spring({ mass: 1, stiffness: 80, damping: 12, velocity: 0 }) }));
          anims.push(animate(g.scale, { x: 1, y: 1, z: 1, duration: 1500, ease: 'outCubic' }));
          anims.push(animate(g.rotation, { y: az - 0.55, duration: 1500, ease: 'inOutCubic' }));
        }
        if (tegel.current) {
          tegel.current.scale.setScalar(0.001);
          anims.push(animate(tegel.current.scale, { x: 1, y: 1, z: 1, duration: 900, delay: 700, ease: 'outBack' }));
        }
        anims.push(animate(sluier.current, { dekking: 0.93, duration: 1200, ease: 'inOutSine' }));
        anims.push(animate(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1500, ease: 'inOutCubic' }));
        anims.push(animate(kijk.current, { x: doel.x, y: doel.y, z: doel.z, duration: 1500, ease: 'inOutCubic' }));
        anims.push(animate(persp, { fov: 30, duration: 1500, ease: 'inOutCubic', onUpdate: () => persp.updateProjectionMatrix() }));
        anims.push(
          animate(offset.current, {
            x: ruimte.x,
            y: ruimte.y,
            duration: 1500,
            ease: 'inOutCubic',
            onComplete: () => {
              if (controls.current) {
                controls.current.target.copy(doel);
                controls.current.update();
              }
              useSpel.getState().aangekomen();
            },
          }),
        );
      }
    }

    if (modus === 'terug') {
      geluid('woesj');
      if (controls.current) controls.current.enabled = false;
      animeerUit(0);
      kijk.current.copy(controls.current?.target ?? kijk.current);
      // terug naar de loopcamera: achter het poppetje, of door zijn ogen (eerste persoon)
      const fp = useSpel.getState().cameraStand === 'eerste';
      const y0 = speler.pos.y;
      const doel = fp
        ? new THREE.Vector3(speler.pos.x - Math.sin(cam.yaw) * Math.cos(cam.fpPitch), y0 + OOG_H + Math.sin(cam.fpPitch), speler.pos.z - Math.cos(cam.yaw) * Math.cos(cam.fpPitch))
        : new THREE.Vector3(speler.pos.x, y0 + 1.1, speler.pos.z);
      const pos = fp
        ? new THREE.Vector3(speler.pos.x, y0 + OOG_H, speler.pos.z)
        : new THREE.Vector3(
            speler.pos.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.afstand,
            y0 + 1.2 + Math.sin(cam.pitch) * cam.afstand,
            speler.pos.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.afstand,
          );
      const g = stage.current;
      if (g && weergave === 'draai') {
        const sch = st.schaal ?? 1;
        const k = STAGE_MAAT / (st.grootte / sch);
        anims.push(animate(g.position, { x: st.pos[0], y: hoogteVan(st), z: st.pos[1], duration: 1200, ease: 'inOutCubic' }));
        anims.push(animate(g.scale, { x: sch / k, y: sch / k, z: sch / k, duration: 1200, ease: 'inOutCubic' }));
        anims.push(animate(g.rotation, { y: st.rot ?? 0, duration: 1200, ease: 'inOutCubic' }));
      }
      if (tegel.current) anims.push(animate(tegel.current.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 500 }));
      anims.push(animate(sluier.current, { dekking: 0, duration: 1100, ease: 'inOutSine' }));
      anims.push(animate(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1300, ease: 'inOutCubic' }));
      anims.push(animate(persp, { fov: fp ? FOV_EERSTE : FOV_LOPEN, duration: 1300, ease: 'inOutCubic', onUpdate: () => persp.updateProjectionMatrix() }));
      anims.push(animate(offset.current, { x: 0, y: 0, duration: 1300, ease: 'inOutCubic' }));
      anims.push(
        animate(kijk.current, {
          x: doel.x,
          y: doel.y,
          z: doel.z,
          duration: 1300,
          ease: 'inOutCubic',
          onComplete: () => {
            zetUit(0);
            useSpel.getState().gesloten();
          },
        }),
      );
    }
    return () => anims.forEach((a) => a.pause());
  }, [modus, weergave, st]); // eslint-disable-line react-hooks/exhaustive-deps

  // OrbitControls alleen tijdens de inspectie. Inzoomen en draaien met grenzen: de camera gaat nooit in het object,
  // onder de tegel door of (van boven) onder de bovenkant van de muren.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.enabled = modus === 'inspectie';
    c.enableRotate = weergave === 'draai';
    c.enablePan = weergave === 'boven';
    c.minPolarAngle = weergave === 'draai' ? 0.05 : 0;
    c.maxPolarAngle = weergave === 'draai' ? 1.42 : 0.5;
    if (weergave === 'draai') {
      // het object is STAGE_MAAT groot en staat op een tegel van 4,6 m: blijf daar ruim buiten
      c.minDistance = 5.2;
      c.maxDistance = 19;
    } else if (st) {
      // van boven: altijd boven de muren (3,2 m) van de kamer blijven, en niet eindeloos ver weg
      const vloer = hoogteVan(st);
      const doelY = c.target.y || vloer + 1;
      c.minDistance = Math.max(2.5, vloer + 3.9 - doelY);
      c.maxDistance = Math.max(c.minDistance + 4, st.grootte * 2.6);
    }
  }, [modus, weergave, st]);
  // van boven: niet verder schuiven dan rond het object
  useFrame(() => {
    const c = controls.current;
    if (!c || !st || modus !== 'inspectie' || weergave !== 'boven') return;
    const r = Math.max(1.5, st.grootte * 0.7);
    const dx = THREE.MathUtils.clamp(c.target.x - st.pos[0], -r, r);
    const dz = THREE.MathUtils.clamp(c.target.z - st.pos[1], -r, r);
    if (dx !== c.target.x - st.pos[0] || dz !== c.target.z - st.pos[1]) {
      const sx = st.pos[0] + dx - c.target.x;
      const sz = st.pos[1] + dz - c.target.z;
      c.target.x += sx;
      c.target.z += sz;
      camera.position.x += sx;
      camera.position.z += sz;
    }
  });

  const k = st ? STAGE_MAAT / (st.grootte / (st.schaal ?? 1)) : 1;
  const mid = st ? (st.midden ?? Math.min(1, (st.grootte / (st.schaal ?? 1)) * 0.15)) : 0;
  return (
    <>
      <OrbitControls
        ref={controls as never}
        enabled={false}
        enableDamping
        dampingFactor={0.12}
        makeDefault={false}
      />
      {createPortal(
        <>
          <hemisphereLight args={['#fff4e2', '#5a4636', 1.1]} />
          <ambientLight intensity={0.25} />
          <StageLicht doel={stageDoel.current} />
          {stageZichtbaar && st && (
            <group ref={stage}>
              <group ref={tegel} position={[0, -0.02, 0]}>
                <Blok size={[4.6, 0.3, 4.6]} pos={[0, -0.15, 0]} color="#7a5233" r={0.12} />
                <Blok size={[4.3, 0.04, 4.3]} pos={[0, 0.005, 0]} color="#8d6240" r={0.02} />
                <Blok size={[4.8, 0.7, 4.8]} pos={[0, -0.62, 0]} color="#3f2a1c" r={0.14} />
                {[
                  [-1, -1],
                  [1, -1],
                  [-1, 1],
                  [1, 1],
                ].map(([x, z], i) => (
                  <Blok key={i} size={[0.5, 0.18, 0.5]} pos={[x * 2.15, -0.28, z * 2.15]} color="#c49a55" r={0.05} />
                ))}
              </group>
              <group scale={k} position={[0, 0, 0]}>
                <InspectieBereik delen maten>
                  <st.Model />
                </InspectieBereik>
              </group>
              <group position={[0, mid * k, 0]} />
            </group>
          )}
        </>,
        stageScene,
      )}
    </>
  );
}

/** Licht voor het inspectie-object, met een eigen kleine schaduwcamera. */
function StageLicht({ doel }: { doel: THREE.Vector3 }) {
  const licht = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const l = licht.current;
    if (!l) return;
    l.position.set(doel.x + 5, doel.y + 9, doel.z + 4);
    l.target.position.copy(doel);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={licht}
      intensity={2.2}
      color="#fff1dc"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-4}
      shadow-camera-right={4}
      shadow-camera-top={4}
      shadow-camera-bottom={-4}
      shadow-camera-near={0.5}
      shadow-camera-far={30}
      shadow-bias={-0.0005}
      shadow-normalBias={0.02}
    />
  );
}
