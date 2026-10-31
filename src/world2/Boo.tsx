// Boo, het kasteelspook: het maatje van Wereld 2. Een bleek, doorschijnend laken met holle ogen en een open mond,
// dat traag zweeft en een oude ijzeren lantaarn met een kaarsje vasthoudt. Eng om te zien, maar hij helpt je.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function Boo() {
  const lijfRef = useRef<THREE.Group>(null);
  const zoom = useRef<THREE.Group>(null);
  const kop = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const vlam = useRef<THREE.Mesh>(null);
  const m = useMemo(() => {
    // laken: draaivorm van kruin tot zoom, smal bovenin en wijd uitlopend
    const profiel = [
      [0.0, 0.5],
      [0.16, 0.48],
      [0.29, 0.4],
      [0.36, 0.26],
      [0.38, 0.08],
      [0.42, -0.14],
      [0.5, -0.34],
      [0.58, -0.46],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const lijf = new THREE.LatheGeometry(profiel, 32);
    // plooien: de onderrand golft
    const p = lijf.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const a = Math.atan2(x, z);
      const onder = THREE.MathUtils.smoothstep(-y, 0.0, 0.46);
      const r = 1 + Math.sin(a * 7) * 0.07 * onder + Math.sin(a * 3 + 1) * 0.03 * onder;
      p.setXYZ(i, x * r, y - Math.abs(Math.sin(a * 7)) * 0.05 * onder, z * r);
    }
    lijf.computeVertexNormals();
    return {
      lijf,
      laken: new THREE.MeshStandardMaterial({ color: '#aeb9be', emissive: '#5f7887', emissiveIntensity: 0.22, roughness: 0.9, transparent: true, opacity: 0.66, depthWrite: false, side: THREE.DoubleSide }),
      gat: new THREE.MeshBasicMaterial({ color: '#030405' }),
      ijzer: new THREE.MeshStandardMaterial({ color: '#2a2724', roughness: 0.55, metalness: 0.6 }),
      glas: new THREE.MeshStandardMaterial({ color: '#d9c38e', emissive: '#ffb347', emissiveIntensity: 0.55, roughness: 0.2, transparent: true, opacity: 0.45 }),
      vlam: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.3, 0.5), toneMapped: false }),
      kaars: new THREE.MeshStandardMaterial({ color: '#e6dcc4', roughness: 0.6 }),
    };
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lijfRef.current) {
      lijfRef.current.rotation.z = Math.sin(t * 0.7) * 0.04;
      lijfRef.current.rotation.x = Math.sin(t * 0.5 + 1) * 0.03;
    }
    if (zoom.current) zoom.current.rotation.y = Math.sin(t * 0.9) * 0.12;
    // af en toe knakt zijn hoofd opzij
    if (kop.current) {
      const knak = Math.sin(t * 0.37) > 0.82 ? 0.32 : 0;
      kop.current.rotation.z += (knak - kop.current.rotation.z) * 0.08;
    }
    if (armL.current) armL.current.rotation.z = 0.95 + Math.sin(t * 0.8) * 0.05;
    if (armR.current) armR.current.rotation.z = -0.55 + Math.sin(t * 0.8 + 1) * 0.04;
    if (vlam.current) {
      const f = 0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 29) * 0.05;
      vlam.current.scale.set(f, 1 + (1 - f) * 2, f);
    }
  });
  return (
    <group ref={lijfRef}>
      <group ref={zoom}>
        <mesh geometry={m.lijf} material={m.laken} />
      </group>
      {/* gezicht: holle, langgerekte oogkassen en een open mond, uitgesneden in het laken */}
      <group ref={kop} position={[0, 0.12, 0]}>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} material={m.gat} position={[x, 0.08, 0.355]} rotation={[0, x * 1.4, x * 0.9]} scale={[0.055, 0.1, 0.02]}>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
        ))}
        <mesh material={m.gat} position={[0.01, -0.13, 0.37]} rotation={[0, 0, 0.1]} scale={[0.05, 0.085, 0.02]}>
          <sphereGeometry args={[1, 14, 10]} />
        </mesh>
      </group>
      {/* slappe armen onder het laken */}
      <group ref={armL} position={[-0.36, 0.02, 0.04]}>
        <mesh material={m.laken} position={[-0.14, 0, 0]} scale={[1.7, 0.55, 0.6]}>
          <sphereGeometry args={[0.1, 12, 8]} />
        </mesh>
      </group>
      <group ref={armR} position={[0.36, -0.02, 0.06]}>
        <mesh material={m.laken} position={[0.14, 0, 0]} scale={[1.7, 0.55, 0.6]}>
          <sphereGeometry args={[0.1, 12, 8]} />
        </mesh>
        {/* oude ijzeren lantaarn met een kaarsje */}
        <group position={[0.3, -0.3, 0.06]}>
          <mesh material={m.ijzer} position={[0, 0.2, 0]}>
            <torusGeometry args={[0.045, 0.007, 6, 14, Math.PI]} />
          </mesh>
          <mesh material={m.ijzer} position={[0, 0.13, 0]}>
            <coneGeometry args={[0.08, 0.07, 4]} />
          </mesh>
          <mesh material={m.glas} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.1, 0.18, 0.1]} />
          </mesh>
          <mesh material={m.ijzer} position={[0, -0.1, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.13, 0.025, 0.13]} />
          </mesh>
          <mesh material={m.kaars} position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.07, 8]} />
          </mesh>
          <mesh ref={vlam} material={m.vlam} position={[0, 0.0, 0]}>
            <sphereGeometry args={[0.014, 8, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
