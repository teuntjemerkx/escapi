// Mo: het maatje van De Markthal. Een keukenmuis met een koksmuts, een rood schort en een houten lepel,
// die rondvliegt in een theekop met vleugeltjes. Ongeveer 1 m hoog, onderkant rond y = −0,5, kijkt naar +z.
// De theekop wiegt, de vleugeltjes klapperen, Mo zwaait met zijn lepel en knippert af en toe (useFrame).
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Statisch } from '../game/statisch';

function maak() {
  const std = (color: string, emissive = 0.18, rough = 0.6) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, roughness: rough });
  return {
    vacht: std('#b9aaa2', 0.2),
    vachtLicht: std('#e8ddd6', 0.22),
    roze: std('#f4a0b0', 0.25, 0.5),
    neus: std('#e8607a', 0.3, 0.4),
    wit: std('#fbfaf6', 0.25, 0.55),
    schort: std('#e5533d', 0.2, 0.6),
    hout: std('#c98f55', 0.18, 0.7),
    kop: std('#f7f3ea', 0.22, 0.35),
    kopBinnen: (() => {
      const k = std('#f7f3ea', 0.22, 0.35);
      k.side = THREE.DoubleSide;
      return k;
    })(),
    blauw: std('#3d7cc9', 0.2, 0.4),
    thee: std('#a0582a', 0.2, 0.3),
    snor: new THREE.MeshBasicMaterial({ color: '#5a4a44' }),
    oogwit: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    pupil: new THREE.MeshBasicMaterial({ color: '#1d2433' }),
    wang: new THREE.MeshBasicMaterial({ color: '#ff9aa8', transparent: true, opacity: 0.75 }),
    stoom: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }),
  };
}

/** Profiel van de theekop (draaivorm): van de voet tot de rand. */
const KOP = [
  [0.0, -0.5],
  [0.12, -0.5],
  [0.13, -0.47],
  [0.16, -0.46],
  [0.24, -0.38],
  [0.29, -0.26],
  [0.31, -0.13],
  [0.32, -0.1],
  [0.3, -0.1],
  [0.28, -0.24],
].map(([x, y]) => new THREE.Vector2(x, y));

export function Mo() {
  const m = useMemo(maak, []);
  const kopGeo = useMemo(() => new THREE.LatheGeometry(KOP, 14), []);
  const wolk = useMemo(() => [0, 1, 2].map(() => m.stoom.clone()), [m]);
  const heel = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);
  const rechts = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const ogen = useRef<THREE.Group>(null);
  const stoom = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (heel.current) {
      heel.current.rotation.z = Math.sin(t * 1.4) * 0.07;
      heel.current.rotation.x = Math.sin(t * 1.1 + 1) * 0.04;
    }
    const slag = 0.25 + 0.5 * Math.sin(t * 10);
    if (links.current) links.current.rotation.z = slag;
    if (rechts.current) rechts.current.rotation.z = -slag;
    if (arm.current) arm.current.rotation.z = -0.5 + Math.sin(t * 2.6) * 0.35;
    if (ogen.current) ogen.current.scale.y = t % 3.9 < 0.12 ? 0.15 : 1;
    if (stoom.current)
      stoom.current.children.forEach((c, i) => {
        const f = (t * 0.45 + i / 3) % 1;
        c.position.set(-0.2 + Math.sin(f * 6 + i) * 0.04, -0.12 + f * 0.35, -0.08);
        c.scale.setScalar(0.04 + f * 0.05);
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - f);
      });
  });
  return (
    <group ref={heel}>
      {/* vliegende theekop: kop, blauwe rand, oor en vleugeltjes */}
      <Statisch>
      <mesh geometry={kopGeo} material={m.kopBinnen} />
      <mesh material={m.blauw} position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.018, 5, 20]} />
      </mesh>
      <mesh material={m.blauw} position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.265, 0.012, 4, 18]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = -0.9 + i * 0.45;
        return (
          <mesh key={i} material={m.blauw} position={[Math.sin(a) * 0.272, -0.22, Math.cos(a) * 0.272]}>
            <sphereGeometry args={[0.028, 5, 4]} />
          </mesh>
        );
      })}
      <mesh material={m.kop} position={[0.32, -0.27, 0]}>
        <torusGeometry args={[0.075, 0.022, 6, 12]} />
      </mesh>
      <mesh material={m.thee} position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.29, 18]} />
      </mesh>
      </Statisch>
      <group ref={links} position={[-0.27, -0.24, -0.04]}>
        <mesh material={m.wit} position={[-0.16, 0.04, 0]} rotation={[0, 0, 0.35]} scale={[0.17, 0.04, 0.11]}>
          <sphereGeometry args={[1, 8, 5]} />
        </mesh>
      </group>
      <group ref={rechts} position={[0.27, -0.24, -0.04]}>
        <mesh material={m.wit} position={[0.18, 0.06, 0]} rotation={[0, 0, -0.35]} scale={[0.17, 0.04, 0.11]}>
          <sphereGeometry args={[1, 8, 5]} />
        </mesh>
      </group>
      {/* stoomwolkjes */}
      <group ref={stoom}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={wolk[i]}>
            <sphereGeometry args={[1, 6, 4]} />
          </mesh>
        ))}
      </group>

      <Statisch>
      {/* Mo: lijf met schort */}
      <mesh material={m.vacht} position={[0, -0.06, 0]} scale={[0.17, 0.19, 0.15]}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
      <mesh material={m.schort} position={[0, -0.07, 0.012]} scale={[0.172, 0.19, 0.152]}>
        <sphereGeometry args={[1, 10, 6, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.28, Math.PI * 0.5]} />
      </mesh>
      <mesh material={m.wit} position={[0.04, -0.12, 0.15]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.07, 0.05, 0.01]} />
      </mesh>
      {/* staart over de rand van de kop */}
      <mesh material={m.roze} position={[-0.18, -0.12, -0.24]} rotation={[0.4, 0.6, 0.2]}>
        <torusGeometry args={[0.12, 0.012, 4, 10, Math.PI * 1.2]} />
      </mesh>
      {/* linkerarm op de rand, rechterarm met de houten lepel */}
      <mesh material={m.vacht} position={[-0.17, -0.07, 0.07]} rotation={[0.3, 0, 0.9]} scale={[0.04, 0.09, 0.04]}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
      </Statisch>
      <group ref={arm} position={[0.15, -0.02, 0.04]}>
        <mesh material={m.vacht} position={[0.06, 0.04, 0]} rotation={[0, 0, -0.8]} scale={[0.04, 0.09, 0.04]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
        <group position={[0.12, 0.09, 0.02]} rotation={[0, 0, -0.25]}>
          <mesh material={m.hout} position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.012, 0.014, 0.3, 6]} />
          </mesh>
          <mesh material={m.hout} position={[0, 0.3, 0]} scale={[0.05, 0.075, 0.025]}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        </group>
      </group>

      {/* kop van Mo */}
      <group position={[0, 0.2, 0.01]}>
        <Statisch>
        <mesh material={m.vacht} scale={[0.16, 0.145, 0.15]}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
        {/* grote oren */}
        {[-1, 1].map((k) => (
          <group key={k} position={[k * 0.15, 0.1, -0.02]} rotation={[0, 0, -k * 0.35]}>
            <mesh material={m.vacht} scale={[0.11, 0.11, 0.03]}>
              <sphereGeometry args={[1, 10, 5]} />
            </mesh>
            <mesh material={m.roze} position={[0, 0, 0.018]} scale={[0.08, 0.08, 0.02]}>
              <sphereGeometry args={[1, 8, 4]} />
            </mesh>
          </group>
        ))}
        {/* snuitje met roze neus en snorharen */}
        <mesh material={m.vachtLicht} position={[0, -0.04, 0.12]} scale={[0.085, 0.065, 0.08]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
        <mesh material={m.neus} position={[0, -0.025, 0.2]}>
          <sphereGeometry args={[0.03, 8, 6]} />
        </mesh>
        {[-1, 1].map((k) =>
          [-0.12, 0, 0.12].map((h) => (
            <mesh key={`${k}${h}`} material={m.snor} position={[k * 0.11, -0.04 + h * 0.15, 0.17]} rotation={[0, 0, Math.PI / 2 + k * h]}>
              <cylinderGeometry args={[0.003, 0.003, 0.12, 3]} />
            </mesh>
          )),
        )}
        </Statisch>
        {/* grote ogen */}
        <group ref={ogen} position={[0, 0.035, 0.115]}>
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.06, 0, 0]} rotation={[0, k * 0.3, 0]}>
              <mesh material={m.oogwit} scale={[0.045, 0.055, 0.03]}>
                <sphereGeometry args={[1, 8, 6]} />
              </mesh>
              <mesh material={m.pupil} position={[-k * 0.004, -0.004, 0.024]} scale={[0.027, 0.034, 0.015]}>
                <sphereGeometry args={[1, 8, 6]} />
              </mesh>
              <mesh material={m.oogwit} position={[0.008, 0.014, 0.038]}>
                <sphereGeometry args={[0.008, 5, 4]} />
              </mesh>
            </group>
          ))}
        </group>
        <Statisch>
        {[-1, 1].map((k) => (
          <mesh key={k} material={m.wang} position={[k * 0.105, -0.045, 0.118]} rotation={[0, k * 0.7, 0]}>
            <circleGeometry args={[0.022, 8]} />
          </mesh>
        ))}
        {/* koksmuts */}
        <group position={[0, 0.13, -0.01]} rotation={[-0.12, 0, 0.1]}>
          <mesh material={m.wit} position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.1, 0.105, 0.08, 14]} />
          </mesh>
          {[
            [0, 0.13, 0, 0.11],
            [-0.07, 0.11, 0.01, 0.075],
            [0.07, 0.11, 0.01, 0.075],
            [0, 0.11, -0.06, 0.075],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} material={m.wit} position={[x, y, z]}>
              <sphereGeometry args={[r, 8, 6]} />
            </mesh>
          ))}
        </group>
        </Statisch>
      </group>
    </group>
  );
}
