// Wereld 4 – nieuwe bouwstenen voor Winkelcentrum De Honderd: zuilen, bomenbakken, liftdeuren, bioscoop- en speelhalspullen,
// kapsalon, magazijnstelling, eettafels, het bronzen Sjors-beeld, galerijlantaarns en de grote fontein.
// Alles is vast (geen useFrame): het wordt samengevoegd tot weinig tekenstappen.
import { Blok, Cil, mat } from '../game/kit';
import { Struik } from '../game/kit';
import { Bord } from './winkels';

type V3 = [number, number, number];
type P = { pos: V3; rot?: number };

const STAAL = '#2b2f33';
const MESSING = '#c9a25a';
const BRONS = '#8a6236';

/** Ronde zuil van de koepel: stenen schacht met een messing ring onder en boven. */
export function Zuil({ pos, h = 10, r = 0.26 }: { pos: V3; h?: number; r?: number }) {
  return (
    <group position={pos}>
      <Cil r={r + 0.12} h={0.3} pos={[0, 0.15, 0]} color="#d9d0c0" seg={20} />
      <Cil r={r} h={h - 0.6} pos={[0, h / 2, 0]} color="#efe7da" seg={20} />
      <Cil r={r + 0.05} h={0.08} pos={[0, 1.0, 0]} color={MESSING} seg={20} />
      <Cil r={r + 0.14} h={0.3} pos={[0, h - 0.15, 0]} color="#d9d0c0" seg={20} />
    </group>
  );
}

/** Houten bomenbak met een bolle boom (passage, plein). */
export function Bomenbak({ pos, s = 1 }: { pos: V3; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <Blok size={[1.0, 0.55, 1.0]} pos={[0, 0.275, 0]} color="#6f5137" r={0.05} />
      <Blok size={[1.06, 0.06, 1.06]} pos={[0, 0.57, 0]} color="#3b2f28" r={0.02} />
      <Cil r={0.06} h={1.3} pos={[0, 1.2, 0]} color="#5a4030" seg={8} />
      <Struik pos={[0, 1.6, 0]} s={1.25} />
      <Struik pos={[0.25, 2.1, 0.1]} s={0.9} />
    </group>
  );
}

/** Bloembak op het dakterras (laag, lang). */
export function Bloembak({ pos, rot = 0, b = 2.0 }: P & { b?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 0.5, 0.8]} pos={[0, 0.25, 0]} color="#5d6066" r={0.04} />
      <Blok size={[b - 0.1, 0.05, 0.7]} pos={[0, 0.5, 0]} color="#4a3524" r={0.01} />
      {Array.from({ length: Math.max(2, Math.round(b / 0.5)) }, (_, i) => (
        <Struik key={i} pos={[-b / 2 + 0.3 + (i * (b - 0.6)) / Math.max(1, Math.round(b / 0.5) - 1), 0.55, 0]} s={0.55} />
      ))}
    </group>
  );
}

/** Twee liftdeuren met een lijst, een paneeltje en een bordje "Buiten dienst" (voorkant naar +z). */
export function Liftdeuren({ pos, rot = 0 }: P) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.7, 2.5, 0.08]} pos={[0, 1.25, 0]} color="#3a3f45" r={0.02} />
      {[-0.42, 0.42].map((x) => (
        <Blok key={x} size={[0.8, 2.3, 0.04]} pos={[x, 1.17, 0.05]} color="#b9bec4" r={0.01} rough={0.35} />
      ))}
      <Blok size={[0.02, 2.3, 0.05]} pos={[0, 1.17, 0.07]} color="#6b7076" r={0} />
      <Blok size={[0.22, 0.34, 0.04]} pos={[1.05, 1.25, 0.04]} color="#2b2f33" r={0.02} />
      <mesh position={[1.05, 1.31, 0.065]} material={mat('#ff5a4a', { emissive: '#ff3a2a' })}>
        <circleGeometry args={[0.035, 12]} />
      </mesh>
      <Bord regels={['Buiten dienst']} b={0.9} h={0.22} pos={[0, 2.7, 0.05]} bg="#d83a2e" fg="#ffffff" />
    </group>
  );
}

/** Popcornmachine op een karretje. */
export function Popcorn({ pos, rot = 0 }: P) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.7, 0.9, 0.5]} pos={[0, 0.45, 0]} color="#c0392b" r={0.04} />
      <Blok size={[0.66, 0.7, 0.46]} pos={[0, 1.3, 0]} color="#f3e9d2" r={0.03} opacity={0.55} />
      <Blok size={[0.6, 0.3, 0.4]} pos={[0, 1.1, 0]} color="#ffe08a" r={0.08} />
      <Blok size={[0.74, 0.14, 0.54]} pos={[0, 1.72, 0]} color="#c0392b" r={0.04} />
      <Bord regels={['POPCORN']} b={0.62} h={0.18} pos={[0, 1.88, 0]} bg="#ffd23f" fg="#c0392b" />
    </group>
  );
}

/** Speelkast met een scherm (alleen decor; de quizkast is een station). Voorkant naar +z. */
export function Speelkast({ pos, rot = 0, kleur = '#3d7cc9', tekst = 'RACE' }: P & { kleur?: string; tekst?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.75, 1.0, 0.75]} pos={[0, 0.5, 0]} color={kleur} r={0.04} />
      <Blok size={[0.75, 0.9, 0.5]} pos={[0, 1.45, -0.12]} color={kleur} r={0.04} />
      <Blok size={[0.6, 0.12, 0.3]} pos={[0, 1.02, 0.18]} rot={[-0.4, 0, 0]} color="#1d1f24" r={0.02} />
      <Bord regels={[tekst]} b={0.58} h={0.44} pos={[0, 1.5, 0.14]} bg="#0d1630" fg="#7af0ff" licht />
      <Bord regels={[tekst]} b={0.6} h={0.14} pos={[0, 1.99, 0.14]} bg="#ffd23f" fg="#1d1f24" />
    </group>
  );
}

/** Kappersstoel met een spiegel aan de muur erachter (voorkant naar +z). */
export function Kappersstoel({ pos, rot = 0 }: P) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Cil r={0.25} h={0.06} pos={[0, 0.03, 0]} color="#1d1f24" seg={16} />
      <Cil r={0.06} h={0.4} pos={[0, 0.25, 0]} color="#9aa3a8" seg={8} />
      <Blok size={[0.56, 0.12, 0.52]} pos={[0, 0.5, 0]} color="#2f2f35" r={0.05} />
      <Blok size={[0.56, 0.6, 0.1]} pos={[0, 0.82, -0.22]} color="#2f2f35" r={0.05} />
      <Blok size={[0.8, 1.0, 0.04]} pos={[0, 1.55, -0.62]} color="#cfe3ea" r={0.02} rough={0.15} />
      <Blok size={[0.9, 1.1, 0.03]} pos={[0, 1.55, -0.645]} color="#2e7a72" r={0.02} />
    </group>
  );
}

/** Wasbak van de kapper. */
export function Wasbak({ pos, rot = 0 }: P) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[0.6, 0.8, 0.5]} pos={[0, 0.4, 0]} color="#e9e2d4" r={0.04} />
      <Cil r={0.24} rTop={0.27} h={0.16} pos={[0, 0.86, 0]} color="#1d1f24" seg={16} />
      <Cil r={0.02} h={0.3} pos={[0, 1.05, -0.18]} color="#9aa3a8" seg={6} />
    </group>
  );
}

/** Hoge stalen magazijnstelling met dozen (voorkant naar +z). */
export function Stelling({ pos, rot = 0, b = 2.6, h = 3.2 }: P & { b?: number; h?: number }) {
  const planken = [0.15, 1.15, 2.15, 3.05].filter((y) => y < h);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-b / 2, b / 2].flatMap((x) =>
        [-0.28, 0.28].map((z) => <Blok key={`${x}${z}`} size={[0.07, h, 0.07]} pos={[x, h / 2, z]} color="#e48a3a" r={0.01} />),
      )}
      {planken.map((y) => (
        <group key={y}>
          <Blok size={[b, 0.06, 0.62]} pos={[0, y, 0]} color="#3d6fa8" r={0.01} />
          {[-b / 3, 0, b / 3].map((x, i) => (
            <Blok key={x} size={[b / 3.6, 0.45 + (i % 2) * 0.15, 0.5]} pos={[x, y + 0.26 + (i % 2) * 0.07, 0]} color={i % 2 ? '#c79a62' : '#bf8f58'} r={0.01} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Eettafel met vier krukjes (foodcourt). */
export function Eettafel({ pos, kleur = '#e86f8a' }: { pos: V3; kleur?: string }) {
  return (
    <group position={pos}>
      <Blok size={[1.2, 0.05, 0.8]} pos={[0, 0.75, 0]} color="#d9c2a0" r={0.02} />
      <Cil r={0.05} h={0.72} pos={[0, 0.37, 0]} color={STAAL} seg={8} />
      <Cil r={0.3} h={0.03} pos={[0, 0.015, 0]} color={STAAL} seg={12} />
      {[
        [-0.38, -0.62],
        [0.38, -0.62],
        [-0.38, 0.62],
        [0.38, 0.62],
      ].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Cil r={0.17} h={0.05} pos={[0, 0.47, 0]} color={kleur} seg={14} />
          <Cil r={0.025} h={0.45} pos={[0, 0.23, 0]} color={STAAL} seg={6} />
        </group>
      ))}
    </group>
  );
}

/** Lantaarnpaal in de passage: zwarte gietijzeren paal met drie bollen (de bollen gloeien). */
export function Galerijlantaarn({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={0.2} h={0.4} pos={[0, 0.2, 0]} color={STAAL} seg={12} />
      <Cil r={0.07} rTop={0.05} h={3.0} pos={[0, 1.9, 0]} color={STAAL} seg={10} />
      <Blok size={[1.0, 0.06, 0.06]} pos={[0, 3.25, 0]} color={STAAL} r={0.02} />
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, x === 0 ? 3.62 : 3.42, 0]} material={mat('#fff1c8', { emissive: '#ffd98a' })}>
          <sphereGeometry args={[0.16, 14, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** Het bronzen spaarvarken Sjors (een beeld met een gleuf voor munten), zoals Rachel op de markt in Seattle. Voorkant naar +z. */
export function SjorsBeeld({ pos, rot = 0 }: P) {
  const brons = mat(BRONS, { rough: 0.32, metal: 0.65 });
  const donker = mat('#5a3d20', { rough: 0.4, metal: 0.5 });
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={0.85}>
      {/* lijf: een ronde, iets langwerpige bol */}
      <mesh position={[0, 0.82, 0]} scale={[0.6, 0.55, 0.78]} material={brons} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      {/* kop met snuit */}
      <mesh position={[0, 0.98, 0.62]} scale={[0.42, 0.4, 0.36]} material={brons} castShadow>
        <sphereGeometry args={[1, 28, 20]} />
      </mesh>
      <mesh position={[0, 0.93, 0.98]} rotation={[Math.PI / 2, 0, 0]} material={brons}>
        <cylinderGeometry args={[0.15, 0.17, 0.12, 24]} />
      </mesh>
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.93, 1.045]} material={donker}>
          <sphereGeometry args={[0.03, 10, 8]} />
        </mesh>
      ))}
      {/* oortjes: platte, ronde flapjes */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.24, 1.32, 0.56]} rotation={[0.5, 0, k * -0.5]} scale={[0.13, 0.17, 0.05]} material={brons}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
      {/* pootjes */}
      {[
        [-0.3, -0.38],
        [0.3, -0.38],
        [-0.3, 0.38],
        [0.3, 0.38],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.2, z]} material={brons}>
          <cylinderGeometry args={[0.1, 0.11, 0.42, 16]} />
        </mesh>
      ))}
      {/* vleugeltjes */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.58, 1.05, -0.05]} rotation={[0.2, 0, k * 0.45]} scale={[0.42, 0.05, 0.26]} material={brons}>
          <sphereGeometry args={[1, 20, 12]} />
        </mesh>
      ))}
      {/* krulstaartje en de gleuf voor munten */}
      <mesh position={[0, 0.95, -0.8]} rotation={[0, Math.PI / 2, 0]} material={brons}>
        <torusGeometry args={[0.07, 0.02, 8, 16]} />
      </mesh>
      <Blok size={[0.3, 0.03, 0.05]} pos={[0, 1.37, -0.05]} color="#2a1e12" r={0} shadow={false} />
    </group>
  );
}

/** Grote ronde fontein onder de koepel: stenen rand, water en een sokkel voor het beeld. */
export function GroteFontein({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <Cil r={1.3} h={0.5} pos={[0, 0.25, 0]} color="#d9d0c0" seg={36} />
      <Cil r={1.36} h={0.06} pos={[0, 0.52, 0]} color={MESSING} seg={36} />
      <mesh position={[0, 0.47, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#3f93ab', { rough: 0.15, metal: 0.1 })}>
        <circleGeometry args={[1.18, 36]} />
      </mesh>
      <Cil r={0.42} h={0.62} pos={[0, 0.31, 0]} color="#cfc5b4" seg={20} />
    </group>
  );
}

/** Kassabalie met een kassa (voorkant naar +z). */
export function Toonbank({ pos, rot = 0, b = 2.2, kleur = '#5a4030' }: P & { b?: number; kleur?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[b, 1.0, 0.7]} pos={[0, 0.5, 0]} color={kleur} r={0.04} />
      <Blok size={[b + 0.06, 0.05, 0.76]} pos={[0, 1.02, 0]} color="#e9e2d4" r={0.02} />
      <Blok size={[0.42, 0.26, 0.05]} pos={[b / 2 - 0.45, 1.25, -0.12]} rot={[-0.2, 0, 0]} color="#262b2e" r={0.02} />
      <Blok size={[0.36, 0.12, 0.3]} pos={[b / 2 - 0.45, 1.1, 0.0]} color="#2f3634" r={0.02} />
    </group>
  );
}

/** Bureau met een lamp (kantoren boven de etalagestraat: je ziet ze door het raam). */
export function Bureau({ pos, rot = 0 }: P) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Blok size={[1.4, 0.05, 0.7]} pos={[0, 0.74, 0]} color="#c9b08a" r={0.02} />
      {[-0.62, 0.62].map((x) => (
        <Blok key={x} size={[0.05, 0.72, 0.6]} pos={[x, 0.36, 0]} color="#3b3a39" r={0.01} />
      ))}
      <Blok size={[0.5, 0.32, 0.03]} pos={[0.2, 0.98, -0.2]} color="#1d1f24" r={0.01} />
      <Cil r={0.02} h={0.4} pos={[-0.5, 0.95, -0.15]} color="#2b2f33" seg={6} />
      <mesh position={[-0.5, 1.15, -0.1]} material={mat('#fff1c8', { emissive: '#ffd98a' })}>
        <coneGeometry args={[0.12, 0.14, 10, 1, true]} />
      </mesh>
      <Blok size={[0.5, 0.5, 0.5]} pos={[0, 0.45, 0.65]} color="#2f3634" r={0.05} />
    </group>
  );
}
