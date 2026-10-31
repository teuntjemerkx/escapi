// Mees: het maatje van De Haven. Een vriendelijke zeemeeuw met een blauwe kapiteinspet,
// een rood-wit sjaaltje en grote ogen. Ongeveer 1 m hoog, onderkant rond y = −0,5, kijkt naar +z.
// De vleugels klapperen en de ogen knipperen af en toe (useFrame).
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function maak() {
  const std = (color: string, emissive = 0.18, rough = 0.6) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, roughness: rough });
  return {
    wit: std('#f7f8f4', 0.22),
    grijs: std('#b9c3cc', 0.15),
    donker: std('#6f7d89', 0.1),
    geel: std('#f6c23e', 0.25, 0.45),
    oranje: std('#f08a2c', 0.2),
    pet: std('#24508a', 0.18, 0.5),
    klep: std('#1b2a3d', 0.1, 0.4),
    goud: new THREE.MeshStandardMaterial({ color: '#e9b949', emissive: '#e9b949', emissiveIntensity: 0.3, metalness: 0.6, roughness: 0.3 }),
    rood: std('#d8453a', 0.2),
    oogwit: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    pupil: new THREE.MeshBasicMaterial({ color: '#1d2433' }),
    wang: new THREE.MeshBasicMaterial({ color: '#ffb3a8', transparent: true, opacity: 0.7 }),
  };
}

export function Mees() {
  const m = useMemo(maak, []);
  const links = useRef<THREE.Group>(null);
  const rechts = useRef<THREE.Group>(null);
  const ogen = useRef<THREE.Group>(null);
  const kop = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const slag = 0.25 + 0.6 * Math.sin(t * 9);
    if (links.current) links.current.rotation.z = slag;
    if (rechts.current) rechts.current.rotation.z = -slag;
    if (ogen.current) ogen.current.scale.y = t % 3.6 < 0.12 ? 0.15 : 1;
    if (kop.current) kop.current.rotation.z = Math.sin(t * 1.3) * 0.08;
  });
  return (
    <group>
      {/* lijf en buik */}
      <mesh material={m.wit} position={[0, -0.12, -0.02]} scale={[0.3, 0.27, 0.34]}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      {/* staart */}
      <mesh material={m.donker} position={[0, -0.1, -0.38]} rotation={[-Math.PI / 2 - 0.35, 0, 0]} scale={[1.4, 1, 0.5]}>
        <coneGeometry args={[0.1, 0.22, 6]} />
      </mesh>
      {/* pootjes */}
      {[-0.1, 0.1].map((x) => (
        <group key={x} position={[x, -0.4, 0.04]}>
          <mesh material={m.oranje} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.14, 6]} />
          </mesh>
          <mesh material={m.oranje} position={[0, -0.075, 0.05]} scale={[1, 0.35, 1.2]}>
            <coneGeometry args={[0.07, 0.12, 3]} />
          </mesh>
        </group>
      ))}
      {/* vleugels: draaien om de schouder */}
      <group ref={links} position={[-0.26, -0.04, -0.04]}>
        <mesh material={m.grijs} position={[-0.17, 0.0, -0.02]} rotation={[0, -0.25, 0.1]} scale={[0.2, 0.05, 0.15]}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
        <mesh material={m.donker} position={[-0.33, 0.02, -0.08]} rotation={[0, -0.4, 0]} scale={[0.08, 0.035, 0.11]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      </group>
      <group ref={rechts} position={[0.26, -0.04, -0.04]}>
        <mesh material={m.grijs} position={[0.17, 0.0, -0.02]} rotation={[0, 0.25, -0.1]} scale={[0.2, 0.05, 0.15]}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
        <mesh material={m.donker} position={[0.33, 0.02, -0.08]} rotation={[0, 0.4, 0]} scale={[0.08, 0.035, 0.11]}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      </group>
      {/* sjaaltje */}
      <mesh material={m.rood} position={[0, 0.1, 0.02]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
        <torusGeometry args={[0.17, 0.045, 6, 16]} />
      </mesh>
      <mesh material={m.rood} position={[0.1, 0.0, 0.2]} rotation={[0.3, 0, -0.4]} scale={[1, 1.6, 0.4]}>
        <boxGeometry args={[0.07, 0.1, 0.07]} />
      </mesh>
      {/* kop */}
      <group ref={kop} position={[0, 0.27, 0.04]}>
        <mesh material={m.wit} scale={[0.22, 0.2, 0.21]}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        {/* grote ogen */}
        <group ref={ogen} position={[0, 0.03, 0.15]}>
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.085, 0, 0]} rotation={[0, k * 0.28, 0]}>
              <mesh material={m.oogwit} scale={[0.075, 0.085, 0.05]}>
                <sphereGeometry args={[1, 12, 10]} />
              </mesh>
              <mesh material={m.pupil} position={[-k * 0.008, -0.005, 0.04]} scale={[0.042, 0.05, 0.025]}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
              <mesh material={m.oogwit} position={[-k * 0.002 + 0.012, 0.02, 0.062]}>
                <sphereGeometry args={[0.012, 6, 4]} />
              </mesh>
            </group>
          ))}
        </group>
        {/* wangetjes */}
        {[-1, 1].map((k) => (
          <mesh key={k} material={m.wang} position={[k * 0.15, -0.06, 0.13]} rotation={[0, k * 0.8, 0]}>
            <circleGeometry args={[0.03, 10]} />
          </mesh>
        ))}
        {/* snavel: bovensnavel met een rood vlekje, ondersnavel */}
        <mesh material={m.geel} position={[0, -0.04, 0.27]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.7]}>
          <coneGeometry args={[0.05, 0.16, 10]} />
        </mesh>
        <mesh material={m.geel} position={[0, -0.075, 0.24]} rotation={[Math.PI / 2 + 0.25, 0, 0]} scale={[0.8, 1, 0.5]}>
          <coneGeometry args={[0.04, 0.1, 8]} />
        </mesh>
        <mesh material={m.rood} position={[0, -0.072, 0.275]}>
          <sphereGeometry args={[0.012, 6, 4]} />
        </mesh>
        {/* kapiteinspet: bol, witte band, klep en een gouden anker */}
        <group position={[0, 0.16, -0.01]} rotation={[-0.12, 0, 0]}>
          <mesh material={m.pet} position={[0, 0.06, 0]} scale={[1, 0.55, 1]}>
            <cylinderGeometry args={[0.2, 0.17, 0.2, 16]} />
          </mesh>
          <mesh material={m.wit} position={[0, 0.0, 0]}>
            <cylinderGeometry args={[0.172, 0.172, 0.05, 16]} />
          </mesh>
          <mesh material={m.klep} position={[0, -0.025, 0.14]} rotation={[0.25, 0, 0]} scale={[1, 1, 0.65]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 14, 1, false, -Math.PI / 2, Math.PI]} />
          </mesh>
          <group position={[0, 0.05, 0.19]} rotation={[-0.15, 0, 0]}>
            <mesh material={m.goud}>
              <boxGeometry args={[0.012, 0.06, 0.01]} />
            </mesh>
            <mesh material={m.goud} position={[0, 0.02, 0]}>
              <boxGeometry args={[0.04, 0.01, 0.01]} />
            </mesh>
            <mesh material={m.goud} position={[0, -0.03, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.022, 0.006, 4, 10, Math.PI]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
