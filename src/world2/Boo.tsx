// Boo, het kasteelspook: het maatje van Wereld 2. Een zacht wit spookje met een heksenhoedje
// en een pompoenlampje. Zwaait, knippert met zijn ogen en wiebelt met zijn hoedje.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function Boo() {
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const ogen = useRef<THREE.Group>(null);
  const hoed = useRef<THREE.Group>(null);
  const m = useMemo(() => {
    // lijf: draaivorm van kruin tot zoom
    const profiel = [
      [0.0, 0.46],
      [0.18, 0.44],
      [0.32, 0.37],
      [0.42, 0.24],
      [0.47, 0.06],
      [0.49, -0.14],
      [0.52, -0.32],
      [0.56, -0.42],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const lijf = new THREE.LatheGeometry(profiel, 28);
    return {
      lijf,
      wit: new THREE.MeshStandardMaterial({ color: '#f4f1ff', emissive: '#c9b6ff', emissiveIntensity: 0.35, roughness: 0.5 }),
      zwart: new THREE.MeshStandardMaterial({ color: '#1b1626', roughness: 0.3 }),
      glim: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      wang: new THREE.MeshBasicMaterial({ color: '#ff9fc4', transparent: true, opacity: 0.75 }),
      hoed: new THREE.MeshStandardMaterial({ color: '#4b2f7a', roughness: 0.7 }),
      band: new THREE.MeshStandardMaterial({ color: '#ff8a3d', roughness: 0.6 }),
      pompoen: new THREE.MeshStandardMaterial({ color: '#ff8a1f', emissive: '#ff6a00', emissiveIntensity: 0.25, roughness: 0.6 }),
      licht: new THREE.MeshBasicMaterial({ color: '#ffd36b', toneMapped: false }),
      steel: new THREE.MeshStandardMaterial({ color: '#4f6b2a' }),
    };
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (armL.current) armL.current.rotation.z = 0.5 + Math.sin(t * 5) * 0.45;
    if (armR.current) armR.current.rotation.z = -0.35 + Math.sin(t * 2) * 0.1;
    if (ogen.current) ogen.current.scale.y = t % 3.6 < 0.12 ? 0.12 : 1;
    if (hoed.current) hoed.current.rotation.z = 0.22 + Math.sin(t * 1.8) * 0.06;
  });
  return (
    <group>
      <mesh geometry={m.lijf} material={m.wit} />
      {/* golvende zoom */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} material={m.wit} position={[Math.sin(a) * 0.45, -0.42, Math.cos(a) * 0.45]} scale={[1, 0.62, 1]}>
            <sphereGeometry args={[0.115, 12, 8]} />
          </mesh>
        );
      })}
      {/* gezicht */}
      <group ref={ogen} position={[0, 0.14, 0.43]}>
        {[-0.15, 0.15].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh material={m.zwart} scale={[1, 1.35, 0.6]}>
              <sphereGeometry args={[0.075, 14, 10]} />
            </mesh>
            <mesh material={m.glim} position={[0.025, 0.04, 0.045]}>
              <sphereGeometry args={[0.022, 8, 6]} />
            </mesh>
          </group>
        ))}
      </group>
      {[-0.26, 0.26].map((x) => (
        <mesh key={x} material={m.wang} position={[x, 0.02, 0.41]} rotation={[0, x * 1.2, 0]}>
          <circleGeometry args={[0.055, 14]} />
        </mesh>
      ))}
      <mesh material={m.zwart} position={[0, -0.03, 0.465]} rotation={[0, 0, Math.PI]} scale={[1, 0.8, 0.5]}>
        <torusGeometry args={[0.06, 0.022, 8, 14, Math.PI]} />
      </mesh>
      {/* armpjes */}
      <group ref={armL} position={[-0.44, -0.04, 0.05]}>
        <mesh material={m.wit} position={[-0.1, 0, 0]} scale={[1.35, 0.72, 0.72]}>
          <sphereGeometry args={[0.1, 12, 8]} />
        </mesh>
      </group>
      <group ref={armR} position={[0.44, -0.08, 0.08]}>
        <mesh material={m.wit} position={[0.1, 0, 0]} scale={[1.35, 0.72, 0.72]}>
          <sphereGeometry args={[0.1, 12, 8]} />
        </mesh>
        {/* pompoenlampje */}
        <group position={[0.24, -0.2, 0.08]}>
          <mesh material={m.pompoen} scale={[1, 0.82, 1]}>
            <sphereGeometry args={[0.12, 14, 10]} />
          </mesh>
          <mesh material={m.licht} position={[0, 0.0, 0.105]} scale={[1, 0.6, 1]}>
            <circleGeometry args={[0.055, 3]} />
          </mesh>
          <mesh material={m.steel} position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.06, 6]} />
          </mesh>
          <mesh material={m.zwart} position={[0, 0.2, 0]}>
            <torusGeometry args={[0.07, 0.008, 6, 12, Math.PI]} />
          </mesh>
        </group>
      </group>
      {/* heksenhoedje */}
      <group ref={hoed} position={[0.08, 0.42, 0]}>
        <mesh material={m.hoed} position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.03, 24]} />
        </mesh>
        <mesh material={m.band} position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.17, 0.18, 0.06, 20]} />
        </mesh>
        <mesh material={m.hoed} position={[0.02, 0.26, 0]} rotation={[0, 0, -0.18]}>
          <coneGeometry args={[0.17, 0.42, 20]} />
        </mesh>
      </group>
    </group>
  );
}
