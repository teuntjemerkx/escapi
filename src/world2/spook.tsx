// Halloween-spullen voor het spookkasteel: pompoenen met gezichten, grafstenen, spinnenwebben,
// kaarsen, banieren, een heksenketel, vleermuizen en de volle maan.
// Vast (mag in Decor): Pompoen, Grafsteen, Spinnenweb, Kaarsen, Crypte. Levend: Ketel, Vleermuizen, Maan, Banier (OpMuur).
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OpMuur } from '../game/huis';
import { Statisch } from '../game/statisch';
import { zeg } from '../game/maatje';
import { speler, useSpel } from '../game/store';
import { geluid } from '../lib/geluid';
import { Blok, mat, seeded } from '../game/kit';
import { gloedTex } from '../game/texturen';
import { maakTextuur } from '../game/tekst';

type V2 = [number, number];
type V3 = [number, number, number];
const spelerPos = () => speler.pos;

// ── Pompoen ─────────────────────────────────────────────────────────────

let gezichtMat: THREE.MeshBasicMaterial | null = null;
function gezicht() {
  if (gezichtMat) return gezichtMat;
  const t = maakTextuur(
    1,
    1,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffd36b';
      const drie = (x: number, y: number, s: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s, y + s * 0.7);
        ctx.lineTo(x - s, y + s * 0.7);
        ctx.closePath();
        ctx.fill();
      };
      drie(w * 0.32, h * 0.36, w * 0.1);
      drie(w * 0.68, h * 0.36, w * 0.1);
      drie(w * 0.5, h * 0.52, w * 0.05);
      // grijns met tandjes
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.64);
      ctx.quadraticCurveTo(w * 0.5, h * 0.92, w * 0.8, h * 0.64);
      ctx.quadraticCurveTo(w * 0.5, h * 0.76, w * 0.2, h * 0.64);
      ctx.fill();
      ctx.clearRect(w * 0.4, h * 0.66, w * 0.06, h * 0.06);
      ctx.clearRect(w * 0.56, h * 0.66, w * 0.06, h * 0.06);
    },
    128,
  );
  gezichtMat = new THREE.MeshBasicMaterial({
    map: t,
    transparent: true,
    alphaTest: 0.3,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  return gezichtMat;
}

/** Pompoen (lampion) met een lachend gezicht dat van binnen gloeit. `rot` = waar het gezicht heen kijkt. */
export function Pompoen({ pos, s = 1, rot = 0, kleur = '#e8731c', gezicht: metGezicht = true }: { pos: V3; s?: number; rot?: number; kleur?: string; gezicht?: boolean }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.1, 0.2, Math.cos(a) * 0.1]} rotation={[0, a, 0]} scale={[0.55, 0.82, 0.8]} material={mat(i % 2 ? kleur : '#d8661a', { rough: 0.65 })} castShadow>
            <sphereGeometry args={[0.24, 10, 8]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.42, 0]} rotation={[0.2, 0, 0.15]} material={mat('#5a6b2a')}>
        <cylinderGeometry args={[0.03, 0.045, 0.12, 6]} />
      </mesh>
      {metGezicht && (
        <mesh position={[0, 0.21, 0.335]} material={gezicht()}>
          <planeGeometry args={[0.36, 0.32]} />
        </mesh>
      )}
    </group>
  );
}

// ── Kerkhof ─────────────────────────────────────────────────────────────

/** Grafsteen met ronde bovenkant (vriendelijk, met een kruisje of "Boe"). */
export function Grafsteen({ pos, rot = 0, s = 1, scheef = 0 }: { pos: V3; rot?: number; s?: number; scheef?: number }) {
  return (
    <group position={pos} rotation={[scheef, rot, scheef * 0.6]} scale={s}>
      <Blok size={[0.7, 0.75, 0.16]} pos={[0, 0.375, 0]} color="#7c7884" r={0.04} />
      <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#7c7884')} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.16, 16, 1, false, 0, Math.PI]} />
      </mesh>
      <Blok size={[0.06, 0.34, 0.02]} pos={[0, 0.66, 0.085]} color="#4a4650" r={0} shadow={false} />
      <Blok size={[0.22, 0.06, 0.02]} pos={[0, 0.72, 0.085]} color="#4a4650" r={0} shadow={false} />
      <Blok size={[0.9, 0.08, 0.4]} pos={[0, 0.04, 0.05]} color="#5e5a64" r={0.02} shadow={false} />
    </group>
  );
}

/** Kleine grafkelder (crypte) met puntdak en een deurtje. */
export function Crypte({ pos, rot = 0, s = 1 }: { pos: V3; rot?: number; s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <Blok size={[2.4, 2.0, 2.2]} pos={[0, 1.0, 0]} color="#77727c" r={0.05} />
      <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#3a2f4d', { rough: 0.7 })} castShadow>
        <coneGeometry args={[1.9, 0.9, 4]} />
      </mesh>
      <Blok size={[0.9, 1.4, 0.1]} pos={[0, 0.7, 1.1]} color="#2f2620" r={0.03} />
      <Blok size={[1.2, 0.18, 0.14]} pos={[0, 1.5, 1.12]} color="#5e5a64" r={0.03} />
    </group>
  );
}

// ── Spinnenweb ──────────────────────────────────────────────────────────

let webMat: THREE.MeshBasicMaterial | null = null;
function web() {
  if (webMat) return webMat;
  const t = maakTextuur(
    1,
    1,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(235,235,245,0.9)';
      ctx.lineWidth = 2;
      // halve cirkel die vanuit het midden boven naar beneden hangt
      const n = 8;
      const ox = w / 2;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(ox, 0);
        ctx.lineTo(ox + Math.cos(a) * w * 0.5, Math.sin(a) * h * 0.95);
        ctx.stroke();
      }
      for (let r = 1; r <= 6; r++) {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI;
          const rr = (r / 6.4) * w * 0.5;
          const x = ox + Math.cos(a) * rr;
          const y = Math.sin(a) * rr * 1.9;
          if (i === 0) ctx.moveTo(x, y);
          else {
            const am = ((i - 0.5) / n) * Math.PI;
            ctx.quadraticCurveTo(ox + Math.cos(am) * rr * 0.86, Math.sin(am) * rr * 1.9 * 0.86, x, y);
          }
        }
        ctx.stroke();
      }
    },
    128,
  );
  webMat = new THREE.MeshBasicMaterial({
    map: t,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: 0.75,
  });
  return webMat;
}

/** Spinnenweb in de bovenhoek van een kamer. `hoek` = de hoek [x, z], `naar` = richting de kamer in, bv. [1, -1]. Gebruik in Levend. */
export function Spinnenweb({ hoek, naar, y = 3.2, s = 1.3 }: { hoek: V2; naar: V2; y?: number; s?: number }) {
  const l = Math.hypot(naar[0], naar[1]) || 1;
  const dx = naar[0] / l;
  const dz = naar[1] / l;
  return (
    <OpMuur bij={[hoek[0] + dx * 0.2, hoek[1]]}>
      <mesh position={[hoek[0] + dx * 0.42, y - s / 2, hoek[1] + dz * 0.42]} rotation={[0, Math.atan2(dx, dz), 0]} material={web()}>
        <planeGeometry args={[s, s]} />
      </mesh>
    </OpMuur>
  );
}

/** Beeldje van Frank, het vriendelijke groene monster van de tuin (met boutjes in zijn nek). Vast. */
export function FrankBeeldje({ pos, rot = 0, s = 1 }: { pos: V3; rot?: number; s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <Blok size={[0.6, 0.12, 0.5]} pos={[0, 0.06, 0]} color="#6f6a72" r={0.03} />
      <Blok size={[0.16, 0.42, 0.18]} pos={[-0.12, 0.33, 0]} color="#2c2a33" r={0.04} />
      <Blok size={[0.16, 0.42, 0.18]} pos={[0.12, 0.33, 0]} color="#2c2a33" r={0.04} />
      <Blok size={[0.48, 0.5, 0.3]} pos={[0, 0.78, 0]} color="#4b3a5e" r={0.06} />
      <Blok size={[0.13, 0.13, 0.42]} pos={[-0.3, 0.92, 0.14]} color="#7fbf6a" r={0.05} />
      <Blok size={[0.13, 0.13, 0.42]} pos={[0.3, 0.92, 0.14]} color="#7fbf6a" r={0.05} />
      <Blok size={[0.4, 0.42, 0.38]} pos={[0, 1.27, 0]} color="#7fbf6a" r={0.07} />
      <Blok size={[0.42, 0.1, 0.4]} pos={[0, 1.5, 0]} color="#1d1a20" r={0.03} />
      {[-0.23, 0.23].map((x) => (
        <Blok key={x} size={[0.08, 0.06, 0.06]} pos={[x, 1.16, 0]} color="#a3a8ad" r={0.02} />
      ))}
      {[-0.09, 0.09].map((x) => (
        <Blok key={`o${x}`} size={[0.07, 0.07, 0.02]} pos={[x, 1.3, 0.195]} color="#1d1a20" r={0.01} shadow={false} />
      ))}
      <Blok size={[0.18, 0.03, 0.02]} pos={[0, 1.17, 0.195]} color="#1d1a20" r={0} shadow={false} />
    </group>
  );
}

// ── Kaarsen ─────────────────────────────────────────────────────────────

/** Drie kaarsen met een vlammetje (vast). */
export function Kaarsen({ pos, s = 1 }: { pos: V3; s?: number }) {
  const vlam = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffc24a', toneMapped: false }), []);
  return (
    <group position={pos} scale={s}>
      {(
        [
          [0, 0, 0.32],
          [0.12, 0.06, 0.22],
          [-0.1, 0.08, 0.17],
        ] as V3[]
      ).map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]} material={mat('#efe5cf')} castShadow>
            <cylinderGeometry args={[0.045, 0.05, h, 10]} />
          </mesh>
          <mesh position={[0, h + 0.05, 0]} material={vlam}>
            <coneGeometry args={[0.025, 0.08, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Heksenketel ─────────────────────────────────────────────────────────

/** Zwarte ketel met borrelend groen drankje (levend). */
export function Ketel({ pos, s = 1 }: { pos: V3; s?: number }) {
  const bel = useRef<THREE.Group>(null);
  const soep = useMemo(() => new THREE.MeshBasicMaterial({ color: '#7dff5a', toneMapped: false }), []);
  const gloed = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.75, 0], 3));
    return new THREE.Points(
      g,
      new THREE.PointsMaterial({
        map: gloedTex(),
        color: '#7dff5a',
        size: 2.6,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
  }, []);
  const profiel = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.0, 0.05],
          [0.3, 0.08],
          [0.48, 0.3],
          [0.5, 0.52],
          [0.42, 0.68],
          [0.46, 0.72],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        20,
      ),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    bel.current?.children.forEach((c, i) => {
      const f = (t * 0.7 + i * 0.37) % 1;
      c.position.y = 0.66 + f * 0.35;
      c.scale.setScalar(Math.sin(f * Math.PI) * 1.1);
    });
  });
  return (
    <group position={pos} scale={s}>
      <mesh geometry={profiel} castShadow>
        <meshStandardMaterial color="#1d1a20" roughness={0.45} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]} material={soep}>
        <circleGeometry args={[0.43, 20]} />
      </mesh>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.38, 0.04, Math.cos(a) * 0.38]} material={mat('#1d1a20')}>
          <cylinderGeometry args={[0.04, 0.05, 0.14, 6]} />
        </mesh>
      ))}
      <group ref={bel}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.sin(i * 1.9) * 0.2, 0.7, Math.cos(i * 1.9) * 0.2]} material={soep}>
            <sphereGeometry args={[0.06, 8, 6]} />
          </mesh>
        ))}
      </group>
      <primitive object={gloed} />
    </group>
  );
}

// ── Banier ──────────────────────────────────────────────────────────────

/** Lange banier aan de muur (paars met oranje pompoen). `pos` net voor de muur, `rot` = kijkrichting. Gebruik in Levend. */
export function Banier({ pos, rot = 0, bij, kleur = '#4b2f7a' }: { pos: V3; rot?: number; bij: V2; kleur?: string }) {
  return (
    <OpMuur bij={bij}>
      <group position={pos} rotation={[0, rot, 0]}>
        <Blok size={[1.0, 0.06, 0.06]} pos={[0, 0.98, 0]} color="#3b2a1d" r={0} />
        <Blok size={[0.86, 1.8, 0.03]} pos={[0, 0.05, 0]} color={kleur} r={0} />
        <mesh position={[0, -0.95, 0]} rotation={[0, 0, Math.PI]} material={mat(kleur)}>
          <coneGeometry args={[0.43, 0.3, 3]} />
        </mesh>
        <mesh position={[0, 0.2, 0.025]} material={mat('#ff8a3d')}>
          <circleGeometry args={[0.22, 14]} />
        </mesh>
        <Blok size={[0.86, 0.06, 0.035]} pos={[0, 0.82, 0]} color="#ffb347" r={0} />
      </group>
    </OpMuur>
  );
}

// ── Vleermuizen ─────────────────────────────────────────────────────────

/** Fladderende vleermuizen in rondjes [x, z, straal, hoogte]. Drie tekenstappen voor allemaal. */
export function Vleermuizen({ rondjes, per = 4 }: { rondjes: [number, number, number, number][]; per?: number }) {
  const data = useMemo(() => {
    const rnd = seeded(66);
    const lijst = rondjes.flatMap(([x, z, r, h]) =>
      Array.from({ length: per }, () => ({
        x,
        z,
        r: r * (0.7 + rnd() * 0.5),
        h: h + (rnd() - 0.5) * 1.6,
        v: (0.5 + rnd() * 0.5) * (rnd() > 0.5 ? 1 : -1),
        f: rnd() * 6.28,
      })),
    );
    const lijf = new THREE.SphereGeometry(0.09, 8, 6);
    lijf.scale(1, 0.8, 1.4);
    const vleugel = new THREE.BufferGeometry();
    // driehoekige vleugel met een hap eruit
    vleugel.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.06, 0.42, 0.04, -0.1, 0.18, 0, 0.1, 0.42, 0.04, -0.1, 0.32, -0.02, 0.06, 0.18, 0, 0.1], 3));
    vleugel.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({
      color: '#1a1620',
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const maak = (g: THREE.BufferGeometry) => {
      const im = new THREE.InstancedMesh(g, m, lijst.length);
      im.frustumCulled = false;
      return im;
    };
    return {
      lijst,
      lijf: maak(lijf),
      links: maak(vleugel),
      rechts: maak(vleugel),
    };
  }, [rondjes, per]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const w = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    data.lijst.forEach((b, i) => {
      const a = b.f + t * b.v;
      o.position.set(b.x + Math.cos(a) * b.r, b.h + Math.sin(t * 2 + i) * 0.4, b.z + Math.sin(a) * b.r);
      o.rotation.set(0, -a + (b.v > 0 ? 0 : Math.PI), 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      data.lijf.setMatrixAt(i, o.matrix);
      const klap = Math.sin(t * 16 + i) * 0.7;
      for (const [im, kant] of [
        [data.links, -1],
        [data.rechts, 1],
      ] as const) {
        w.position.copy(o.position);
        w.rotation.copy(o.rotation);
        w.rotateZ(kant * klap);
        w.scale.set(kant, 1, 1);
        w.updateMatrix();
        im.setMatrixAt(i, w.matrix);
      }
    });
    data.lijf.instanceMatrix.needsUpdate = true;
    data.links.instanceMatrix.needsUpdate = true;
    data.rechts.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <primitive object={data.lijf} />
      <primitive object={data.links} />
      <primitive object={data.rechts} />
    </>
  );
}

// ── Maan ────────────────────────────────────────────────────────────────

/** Grote volle maan met een zachte gloed, ver weg in de lucht. */
export function Maan({ pos = [-30, 42, -95] as V3, r = 9 }: { pos?: V3; r?: number }) {
  const { schijf, gloed } = useMemo(() => {
    const t = maakTextuur(
      2,
      2,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(w * 0.45, h * 0.42, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, '#fff8dc');
        g.addColorStop(0.75, '#ffe7a8');
        g.addColorStop(1, '#f2cf86');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
        ctx.fill();
        // kraters
        ctx.fillStyle = 'rgba(200,160,90,0.22)';
        for (const [x, y, s] of [
          [0.35, 0.4, 0.09],
          [0.62, 0.32, 0.06],
          [0.55, 0.62, 0.11],
          [0.3, 0.66, 0.05],
        ]) {
          ctx.beginPath();
          ctx.arc(x * w, y * h, s * w, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      128,
    );
    const schijf = new THREE.MeshBasicMaterial({
      map: t,
      transparent: true,
      toneMapped: false,
      fog: false,
      depthWrite: false,
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.5], 3));
    const gloed = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        map: gloedTex(),
        color: '#ffd98a',
        size: r * 5.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      }),
    );
    return { schijf, gloed };
  }, [r]);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => ref.current?.lookAt(camera.position));
  return (
    <group ref={ref} position={pos} renderOrder={-1}>
      <primitive object={gloed} />
      <mesh material={schijf}>
        <planeGeometry args={[r * 2, r * 2]} />
      </mesh>
    </group>
  );
}

// ── Griezelgangen ───────────────────────────────────────────────────────

/** Ridderharnas met speer. Het helmpje draait mee als je dichtbij komt. Levend. */
export function Harnas({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  const hoofd = useRef<THREE.Group>(null);
  const groep = useRef<THREE.Group>(null);
  const metaal = useMemo(() => mat('#8f97a0', { metal: 0.75, rough: 0.35 }), []);
  const donker = useMemo(() => mat('#3a3f46', { metal: 0.6, rough: 0.45 }), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((st, dt) => {
    const g = groep.current;
    const h = hoofd.current;
    if (!g || !h) return;
    g.updateMatrixWorld();
    tmp.copy(spelerPos()).applyMatrix4(g.matrixWorld.clone().invert());
    const d = Math.hypot(tmp.x, tmp.z);
    const doel = d < 6 ? THREE.MathUtils.clamp(Math.atan2(tmp.x, tmp.z), -1.2, 1.2) : 0;
    h.rotation.y += (doel - h.rotation.y) * Math.min(1, dt * 3);
  });
  return (
    <group ref={groep} position={pos} rotation={[0, rot, 0]}>
      <Statisch>
        <Blok size={[0.7, 0.12, 0.5]} pos={[0, 0.06, 0]} color="#4a4650" r={0.02} />
        <Blok size={[0.16, 0.8, 0.18]} pos={[-0.12, 0.52, 0]} color="#8f97a0" r={0.04} />
        <Blok size={[0.16, 0.8, 0.18]} pos={[0.12, 0.52, 0]} color="#8f97a0" r={0.04} />
        <mesh position={[0, 1.22, 0]} material={metaal} castShadow scale={[1, 1.15, 0.78]}>
          <sphereGeometry args={[0.27, 12, 10]} />
        </mesh>
        <Blok size={[0.12, 0.6, 0.14]} pos={[-0.36, 1.12, 0]} color="#8f97a0" r={0.04} />
        <Blok size={[0.12, 0.6, 0.14]} pos={[0.36, 1.12, 0.06]} color="#8f97a0" r={0.04} />
        <mesh position={[0.42, 1.35, 0.12]} material={donker}>
          <cylinderGeometry args={[0.025, 0.025, 2.4, 6]} />
        </mesh>
        <mesh position={[0.42, 2.62, 0.12]} material={metaal}>
          <coneGeometry args={[0.07, 0.24, 4]} />
        </mesh>
      </Statisch>
      {/* het hoofd draait mee als je langsloopt */}
      <group ref={hoofd} position={[0, 1.66, 0]}>
        <Statisch>
          <mesh material={metaal} castShadow>
            <sphereGeometry args={[0.17, 12, 10]} />
          </mesh>
          <Blok size={[0.24, 0.035, 0.05]} pos={[0, 0.02, 0.15]} color="#14161a" r={0} shadow={false} />
          <mesh position={[0, 0.2, -0.02]} rotation={[0.3, 0, 0]} material={mat('#8a2a3a')}>
            <coneGeometry args={[0.05, 0.22, 6]} />
          </mesh>
        </Statisch>
      </group>
    </group>
  );
}

/** Schilderij van een strenge edelman. De ogen volgen je. `pos` net voor de muur, `rot` = kijkrichting, `bij` = punt op de muur. Levend. */
export function SpookPortret({ pos, rot = 0, bij }: { pos: V3; rot?: number; bij: V2 }) {
  const ogen = useRef<THREE.Group>(null);
  const groep = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const g = groep.current;
    if (!g || !ogen.current) return;
    g.updateMatrixWorld();
    tmp.copy(spelerPos()).applyMatrix4(g.matrixWorld.clone().invert());
    const x = THREE.MathUtils.clamp(tmp.x / 8, -1, 1) * 0.022;
    ogen.current.children.forEach((c) => (c.position.x = (c.userData.x as number) + x));
  });
  return (
    <OpMuur bij={bij}>
      <group ref={groep} position={pos} rotation={[0, rot, 0]}>
        <Statisch>
          <Blok size={[0.9, 1.15, 0.06]} pos={[0, 0, 0]} color="#6a4a1e" r={0.02} />
          <Blok size={[0.74, 0.98, 0.02]} pos={[0, 0, 0.035]} color="#2a2230" r={0} shadow={false} />
          {/* gezicht en kraag */}
          <mesh position={[0, 0.12, 0.05]} material={mat('#c9b8a6')} scale={[1, 1.25, 0.2]}>
            <sphereGeometry args={[0.17, 12, 10]} />
          </mesh>
          <Blok size={[0.5, 0.36, 0.02]} pos={[0, -0.3, 0.05]} color="#3b1f2e" r={0.02} shadow={false} />
          <Blok size={[0.36, 0.06, 0.02]} pos={[0, -0.14, 0.06]} color="#efe6d6" r={0} shadow={false} />
          <Blok size={[0.38, 0.1, 0.02]} pos={[0, 0.34, 0.06]} color="#1d1820" r={0.01} shadow={false} />
          {[-0.06, 0.06].map((x) => (
            <mesh key={`w${x}`} position={[x, 0.16, 0.085]} material={mat('#f4efe6')}>
              <circleGeometry args={[0.035, 12]} />
            </mesh>
          ))}
        </Statisch>
        <group ref={ogen} position={[0, 0.16, 0.088]}>
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, 0, 0]} userData={{ x }} material={mat('#1d1820')}>
              <circleGeometry args={[0.018, 10]} />
            </mesh>
          ))}
        </group>
      </group>
    </OpMuur>
  );
}

/** Rode oogjes in donkere hoeken die af en toe knipperen. `punten` = [x, y, z]. Levend. */
export function RodeOgen({ punten }: { punten: V3[] }) {
  const data = useMemo(() => {
    const p: number[] = [];
    for (const [x, y, z] of punten) p.push(x - 0.09, y, z, x + 0.09, y, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({
      map: gloedTex(),
      color: '#ff2b2b',
      size: 0.32,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return new THREE.Points(g, m);
  }, [punten]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const m = data.material as THREE.PointsMaterial;
    m.opacity = t % 4.3 < 0.15 || (t + 1.7) % 6.1 < 0.12 ? 0 : 0.95;
  });
  return <primitive object={data} />;
}

/** Spin aan een draadje die langzaam op en neer zakt. Levend. */
export function Spin({ pos, lengte = 1.2 }: { pos: V3; lengte?: number }) {
  const spin = useRef<THREE.Group>(null);
  const draad = useRef<THREE.Mesh>(null);
  const f = useMemo(() => Math.random() * 6, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const l = lengte * (0.55 + 0.45 * Math.sin(t * 0.7 + f));
    if (spin.current) spin.current.position.y = -l;
    if (draad.current) {
      draad.current.scale.y = l;
      draad.current.position.y = -l / 2;
    }
  });
  return (
    <group position={pos}>
      <mesh ref={draad} material={mat('#d9d6e0')}>
        <cylinderGeometry args={[0.004, 0.004, 1, 3]} />
      </mesh>
      <group ref={spin}>
        <Statisch>
          <mesh material={mat('#16131a')} scale={[1, 0.8, 1.2]}>
            <sphereGeometry args={[0.07, 8, 6]} />
          </mesh>
          {[-1, 1].flatMap((k) =>
            [0.5, 0.15, -0.2, -0.55].map((a, i) => (
              <mesh key={`${k}${i}`} position={[k * 0.08, -0.01, a * 0.1]} rotation={[0, 0, k * 0.9]} material={mat('#16131a')}>
                <cylinderGeometry args={[0.006, 0.006, 0.12, 3]} />
              </mesh>
            )),
          )}
        </Statisch>
      </group>
    </group>
  );
}

let mistTex: THREE.Texture | null = null;
/** Lage mist die over de vloer van een gang kruipt. `gebied` = [x, z, b, d]. Levend. */
export function Mistbank({ gebied, kleur = '#b9a8e8', sterkte = 0.22 }: { gebied: [number, number, number, number]; kleur?: string; sterkte?: number }) {
  const lagen = useRef<THREE.Mesh[]>([]);
  const m = useMemo(() => {
    if (!mistTex) {
      mistTex = maakTextuur(
        4,
        4,
        (ctx, w, h) => {
          const rnd = seeded(31);
          ctx.clearRect(0, 0, w, h);
          for (let i = 0; i < 46; i++) {
            const x = rnd() * w;
            const y = rnd() * h;
            const r = (0.12 + rnd() * 0.22) * w;
            for (const [dx, dy] of [
              [0, 0],
              [-w, 0],
              [w, 0],
              [0, -h],
              [0, h],
            ]) {
              const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
              g.addColorStop(0, 'rgba(255,255,255,0.22)');
              g.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, w, h);
            }
          }
        },
        64,
      );
      mistTex.wrapS = mistTex.wrapT = THREE.RepeatWrapping;
    }
    const t = mistTex.clone();
    t.needsUpdate = true;
    t.repeat.set(gebied[2] / 6, gebied[3] / 6);
    return new THREE.MeshBasicMaterial({
      map: t,
      color: kleur,
      transparent: true,
      opacity: sterkte,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }, [gebied, kleur, sterkte]);
  useFrame((_, dt) => {
    m.map!.offset.x += dt * 0.025;
    m.map!.offset.y += dt * 0.012;
    lagen.current.forEach((l, i) => (l.position.y = 0.12 + i * 0.22 + Math.sin(performance.now() / 1500 + i) * 0.03));
  });
  return (
    <group position={[gebied[0], 0, gebied[1]]}>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(r) => {
            if (r) lagen.current[i] = r;
          }}
          rotation={[-Math.PI / 2, 0, i * 0.5]}
          material={m}
        >
          <planeGeometry args={[gebied[2], gebied[3]]} />
        </mesh>
      ))}
    </group>
  );
}

/** Schedel op een plankje of in een nis (vriendelijk griezelig). Vast. */
export function Schedel({ pos, rot = 0, s = 1 }: { pos: V3; rot?: number; s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      <mesh position={[0, 0.13, 0]} material={mat('#e9e2d2')} scale={[1, 0.95, 1.1]} castShadow>
        <sphereGeometry args={[0.13, 12, 10]} />
      </mesh>
      <Blok size={[0.15, 0.08, 0.14]} pos={[0, 0.03, 0.04]} color="#e2dac8" r={0.03} />
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, 0.14, 0.12]} material={mat('#1d1820')}>
          <sphereGeometry args={[0.032, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0.135]} rotation={[0, 0, Math.PI]} material={mat('#1d1820')}>
        <coneGeometry args={[0.018, 0.035, 3]} />
      </mesh>
    </group>
  );
}

/**
 * Schim: een doorzichtig spook dat door de gang schiet als je er langs loopt (één keer per 25 s).
 * `trigger` = [x, z, straal], van `van` naar `naar` op hoogte 1,6 m. Levend.
 */
export function Schim({ trigger, van, naar }: { trigger: [number, number, number]; van: V2; naar: V2 }) {
  const ref = useRef<THREE.Group>(null);
  const t0 = useRef(-1);
  const rust = useRef(0);
  const lijf = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#d9ccff',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const g = ref.current;
    if (!g) return;
    const p = spelerPos();
    if (t0.current < 0 && t > rust.current && Math.hypot(p.x - trigger[0], p.z - trigger[1]) < trigger[2]) {
      t0.current = t;
      rust.current = t + 25;
      geluid('boe');
    }
    if (t0.current < 0) {
      g.visible = false;
      return;
    }
    const f = (t - t0.current) / 1.6;
    if (f >= 1) {
      t0.current = -1;
      g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(van[0] + (naar[0] - van[0]) * f, 1.6 + Math.sin(f * Math.PI) * 0.4, van[1] + (naar[1] - van[1]) * f);
    g.rotation.y = Math.atan2(naar[0] - van[0], naar[1] - van[1]);
    lijf.opacity = Math.sin(f * Math.PI) * 0.6;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh material={lijf} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={lijf} position={[0, -0.25, -0.15]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.4, 1.0, 16, 1, true]} />
      </mesh>
    </group>
  );
}

/** Boo zegt iets als je voor het eerst in een gebied komt (bv. een griezelgang). Levend. */
export function Spreekplek({
  gebied,
  tekst,
  geluidje = 'fluister',
  verdieping = 0,
}: {
  gebied: [number, number, number, number];
  tekst: string;
  geluidje?: 'fluister' | 'kraak' | null;
  verdieping?: number;
}) {
  const gezegd = useRef(false);
  useFrame(() => {
    if (gezegd.current) return;
    const s = useSpel.getState();
    if (s.modus !== 'lopen' || s.kaart || speler.verdieping !== verdieping) return;
    const p = spelerPos();
    if (Math.abs(p.x - gebied[0]) < gebied[2] / 2 && Math.abs(p.z - gebied[1]) < gebied[3] / 2) {
      gezegd.current = true;
      if (geluidje) geluid(geluidje);
      zeg(tekst, 'melding');
    }
  });
  return null;
}

/** Boeken die zachtjes rondzweven boven een plek (toverbibliotheek). Levend. */
export function ZwevendeBoeken({ midden, n = 6 }: { midden: V3; n?: number }) {
  const ref = useRef<THREE.Group>(null);
  const kleuren = ['#7a2f3a', '#2f4a7a', '#3f6a35', '#7a5a2f', '#5a2f7a', '#2f6a6a'];
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current?.children.forEach((c, i) => {
      const a = t * 0.35 + (i / n) * Math.PI * 2;
      c.position.set(Math.cos(a) * 1.3, 1.6 + Math.sin(t * 1.3 + i) * 0.25, Math.sin(a) * 1.3);
      c.rotation.set(Math.sin(t + i) * 0.4, a, Math.cos(t * 0.8 + i) * 0.3);
    });
  });
  return (
    <group ref={ref} position={midden}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i}>
          <Blok size={[0.32, 0.07, 0.24]} color={kleuren[i % kleuren.length]} r={0.01} />
          <Blok size={[0.3, 0.05, 0.22]} pos={[0.012, 0, 0]} color="#efe6d6" r={0} shadow={false} />
        </group>
      ))}
    </group>
  );
}

/** Telescoop op een driepoot. Vast. */
export function Telescoop({ pos, rot = 0, s = 1 }: { pos: V3; rot?: number; s?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={s}>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.25, 0.55, Math.cos(a) * 0.25]} rotation={[Math.cos(a) * 0.25, 0, -Math.sin(a) * 0.25]} material={mat('#3b2a1d')}>
          <cylinderGeometry args={[0.025, 0.03, 1.15, 6]} />
        </mesh>
      ))}
      <group position={[0, 1.15, 0]} rotation={[0.6, 0, 0]}>
        <mesh material={mat('#b8913f', { metal: 0.7, rough: 0.35 })} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 1.1, 14]} />
        </mesh>
        <mesh position={[0, 0, 0.56]} material={mat('#26292e', { metal: 0.5 })} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 14]} />
        </mesh>
      </group>
    </group>
  );
}

/** Spookbedje van Boo: een bed met een lakentje dat zachtjes ademt. Vast. */
export function BooBed({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.0, 0.4, 2.0]} pos={[0, 0.2, 0]} color="#4a3324" r={0.04} />
      <Blok size={[0.92, 0.12, 1.9]} pos={[0, 0.46, 0]} color="#efe6f6" r={0.05} />
      <Blok size={[0.6, 0.14, 0.34]} pos={[0, 0.58, -0.72]} color="#ffffff" r={0.06} />
      <Blok size={[1.0, 0.9, 0.1]} pos={[0, 0.45, -1.0]} color="#3b2a1d" r={0.03} />
      <Blok size={[0.9, 0.06, 1.1]} pos={[0, 0.54, 0.35]} color="#7a3fb0" r={0.03} />
    </group>
  );
}
