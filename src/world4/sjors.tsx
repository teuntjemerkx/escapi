// Sjors: het vliegende spaarvarken van winkelcentrum De Promenade (het maatje van Wereld 4).
// Roze spaarpot met grote ogen, een muntgleuf met een gouden munt op zijn rug, een krulstaartje,
// fladderende vleugeltjes en een geel kortingskaartje met een %-teken aan zijn oor.
// Ongeveer 1 m hoog, onderkant rond y = −0,5, kijkt naar +z. Ongeveer 2500 driehoeken.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra });

export function Sjors() {
  const m = useMemo(
    () => ({
      lijf: std('#ff9cc2', { emissive: '#ff6fa8', emissiveIntensity: 0.22 }),
      snuit: std('#f47aa8', { emissive: '#ff5c98', emissiveIntensity: 0.18 }),
      donker: std('#7a2347', { roughness: 0.7 }),
      wit: std('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.3 }),
      pupil: new THREE.MeshBasicMaterial({ color: '#1d1a2b' }),
      glim: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      wang: std('#ff6f9f', { roughness: 0.8 }),
      vleugel: std('#f4fbff', { emissive: '#9feeff', emissiveIntensity: 0.35, roughness: 0.4 }),
      goud: std('#ffd34d', { emissive: '#ffb300', emissiveIntensity: 0.3, metalness: 0.4, roughness: 0.35 }),
      kaart: std('#ffe14d', { emissive: '#ffd21f', emissiveIntensity: 0.25 }),
      touw: std('#5b4a3a'),
      procent: std('#c2185b'),
    }),
    [],
  );
  const vleugelL = useRef<THREE.Group>(null);
  const vleugelR = useRef<THREE.Group>(null);
  const ogen = useRef<THREE.Group>(null);
  const kaartje = useRef<THREE.Group>(null);
  const staart = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // vleugeltjes fladderen snel
    const flap = 0.35 + Math.sin(t * 16) * 0.55;
    if (vleugelL.current) vleugelL.current.rotation.z = flap;
    if (vleugelR.current) vleugelR.current.rotation.z = -flap;
    // knipperen: elke 3,7 seconden heel even dicht
    if (ogen.current) ogen.current.scale.y = t % 3.7 < 0.12 ? 0.12 : 1;
    // kaartje zwaait, staartje wiebelt
    if (kaartje.current) kaartje.current.rotation.z = Math.sin(t * 2.3) * 0.25;
    if (staart.current) staart.current.rotation.z = Math.sin(t * 5) * 0.3;
  });
  return (
    <group>
      {/* lijf */}
      <mesh material={m.lijf} scale={[1, 0.88, 1.06]}>
        <sphereGeometry args={[0.42, 20, 14]} />
      </mesh>
      {/* pootjes */}
      {[
        [-0.2, 0.18],
        [0.2, 0.18],
        [-0.2, -0.2],
        [0.2, -0.2],
      ].map(([x, z], i) => (
        <mesh key={i} material={m.snuit} position={[x, -0.38, z]}>
          <cylinderGeometry args={[0.075, 0.085, 0.2, 10]} />
        </mesh>
      ))}
      {/* snuit met neusgaten */}
      <mesh material={m.snuit} position={[0, -0.04, 0.43]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.12, 16]} />
      </mesh>
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} material={m.donker} position={[x, -0.04, 0.492]}>
          <circleGeometry args={[0.032, 10]} />
        </mesh>
      ))}
      {/* oren */}
      {[-1, 1].map((k) => (
        <mesh key={k} material={m.snuit} position={[k * 0.23, 0.36, 0.08]} rotation={[0.35, 0, -k * 0.45]}>
          <coneGeometry args={[0.1, 0.2, 4]} />
        </mesh>
      ))}
      {/* grote ogen (knipperen) */}
      <group ref={ogen} position={[0, 0.14, 0.33]}>
        {[-0.155, 0.155].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh material={m.wit}>
              <sphereGeometry args={[0.105, 14, 10]} />
            </mesh>
            <mesh material={m.pupil} position={[x * 0.12, -0.01, 0.07]}>
              <sphereGeometry args={[0.062, 12, 8]} />
            </mesh>
            <mesh material={m.glim} position={[x * 0.12 + 0.025, 0.025, 0.125]}>
              <sphereGeometry args={[0.02, 6, 4]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* blosjes en een lachje */}
      {[-1, 1].map((k) => (
        <mesh key={k} material={m.wang} position={[k * 0.27, -0.06, 0.315]} rotation={[0, k * 0.72, 0]}>
          <circleGeometry args={[0.05, 12]} />
        </mesh>
      ))}
      <mesh material={m.donker} position={[0, -0.2, 0.385]} rotation={[0.25, 0, Math.PI]}>
        <torusGeometry args={[0.06, 0.012, 4, 12, Math.PI]} />
      </mesh>
      {/* muntgleuf met een gouden munt op de rug */}
      <mesh material={m.donker} position={[0, 0.365, -0.06]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.045]} />
      </mesh>
      <mesh material={m.goud} position={[0, 0.44, -0.06]} rotation={[-0.15, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 0.022, 18]} />
      </mesh>
      {/* krulstaartje */}
      <mesh ref={staart} material={m.snuit} position={[0, 0.04, -0.47]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.06, 0.02, 6, 14, Math.PI * 1.6]} />
      </mesh>
      {/* vleugeltjes: drie veren per kant */}
      {([
        [-1, vleugelL],
        [1, vleugelR],
      ] as const).map(([k, ref]) => (
        <group key={k} ref={ref} position={[k * 0.36, 0.18, -0.05]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} material={m.vleugel} position={[k * (0.14 + i * 0.015), 0.04 - i * 0.06, -i * 0.03]} rotation={[0, 0, k * (0.25 + i * 0.25)]} scale={[0.17 - i * 0.03, 0.06, 0.13 - i * 0.02]}>
              <sphereGeometry args={[1, 8, 6]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* kortingskaartje met % aan het rechteroor */}
      <group ref={kaartje} position={[0.3, 0.43, 0.12]}>
        <mesh material={m.touw} position={[0.03, -0.09, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 4]} />
        </mesh>
        <group position={[0.07, -0.25, 0.01]} rotation={[0, -0.25, -0.12]}>
          <mesh material={m.kaart}>
            <boxGeometry args={[0.17, 0.13, 0.015]} />
          </mesh>
          {/* het %-teken: twee rondjes en een schuine streep */}
          {[
            [-0.035, 0.03],
            [0.035, -0.03],
          ].map(([x, y]) => (
            <mesh key={x} material={m.procent} position={[x, y, 0.009]}>
              <torusGeometry args={[0.018, 0.007, 4, 10]} />
            </mesh>
          ))}
          <mesh material={m.procent} position={[0, 0, 0.009]} rotation={[0, 0, -0.85]}>
            <boxGeometry args={[0.014, 0.12, 0.004]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
