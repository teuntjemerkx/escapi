// 3D-objecten voor de expertvragen (keuze), de praktijkopdracht en de puzzels.
import { useMemo } from 'react';
import { Deel, Maat, useInspectie } from '../game/inspectie';
import { Blok, Cil, Hek, mat, Raam, seeded } from '../game/kit';
import { P } from '../game/palette';
import { Bordje, FONT, useTextuur } from '../game/tekst';
import { VouwDoos } from '../game/vouw';

type V3 = [number, number, number];

/** EXP-01: lang huis met 6 ramen van 240 × 180 cm, schilder op een ladder, kraampje met tape. */
export function Ramenhuis() {
  const ctx = useInspectie();
  if (ctx.delen) return <RaamDetail />;
  const W = 17;
  const H = 4.2;
  return (
    <group>
      <Blok size={[W, H, 5]} pos={[0, H / 2, 0]} color={P.muur2} r={0.12} />
      <Blok size={[W + 0.3, 0.32, 5.3]} pos={[0, H + 0.16, 0]} color={P.dakRand} r={0.08} />
      <Blok size={[W - 0.2, 0.2, 4.8]} pos={[0, H + 0.36, 0]} color={P.dak} r={0.06} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = -W / 2 + 1.5 + i * 2.8;
        const raam = <Raam w={2.4} h={1.8} pos={[0, 0, 0]} />;
        return (
          <group key={i} position={[x, 2.2, 2.53]}>
            {i === 1 ? (
              <Deel id="raam" uit={[0, 0, 1.6]} label="Raam 240 × 180 cm">
                {raam}
                <Blok size={[2.6, 0.06, 0.04]} pos={[0, 0.98, 0.07]} color="#3d7cc9" r={0.01} />
                <Blok size={[2.6, 0.06, 0.04]} pos={[0, -0.98, 0.07]} color="#3d7cc9" r={0.01} />
                <Blok size={[0.06, 2.0, 0.04]} pos={[-1.28, 0, 0.07]} color="#3d7cc9" r={0.01} />
                <Blok size={[0.06, 2.0, 0.04]} pos={[1.28, 0, 0.07]} color="#3d7cc9" r={0.01} />
                <Maat van={[-1.2, -1.2, 0.1]} naar={[1.2, -1.2, 0.1]} label="240 cm" />
                <Maat van={[1.45, -0.9, 0.1]} naar={[1.45, 0.9, 0.1]} label="180 cm" />
              </Deel>
            ) : (
              raam
            )}
          </group>
        );
      })}
      {/* ladder + schilder */}
      <group position={[-W / 2 + 4.5, 0, 3.3]} rotation={[-0.25, 0, 0]}>
        <Blok size={[0.06, 3.2, 0.06]} pos={[-0.25, 1.6, 0]} color={P.metaal} r={0.02} />
        <Blok size={[0.06, 3.2, 0.06]} pos={[0.25, 1.6, 0]} color={P.metaal} r={0.02} />
        {Array.from({ length: 8 }, (_, i) => (
          <Blok key={i} size={[0.5, 0.04, 0.04]} pos={[0, 0.3 + i * 0.38, 0]} color={P.metaal} r={0.01} />
        ))}
      </group>
      <group position={[-W / 2 + 4.5, 1.45, 3.05]}>
        <Blok size={[0.45, 0.6, 0.3]} pos={[0, 0.4, 0]} color={P.wit} r={0.12} />
        <Blok size={[0.34, 0.32, 0.3]} pos={[0, 0.88, 0]} color="#f0c6a0" r={0.12} />
        <Blok size={[0.38, 0.1, 0.34]} pos={[0, 1.07, 0]} color={P.wit} r={0.04} />
        <Blok size={[0.08, 0.05, 0.03]} pos={[0, 0.86, -0.16]} color="#3d7cc9" r={0.01} />
      </group>
      {/* kraampje met tape */}
      <group position={[W / 2 - 2, 0, 4.4]}>
        <Blok size={[1.6, 0.9, 0.8]} pos={[0, 0.45, 0]} color={P.hout} r={0.05} />
        <Blok size={[1.8, 0.08, 1.0]} pos={[0, 1.8, 0]} color="#3d7cc9" r={0.03} />
        <Cil r={0.04} h={1.0} pos={[-0.8, 1.3, 0.4]} color={P.wit} seg={6} />
        <Cil r={0.04} h={1.0} pos={[0.8, 1.3, 0.4]} color={P.wit} seg={6} />
        {[-0.45, 0, 0.45].map((x) => (
          <mesh key={x} position={[x, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat('#e9dfc7')}>
            <torusGeometry args={[0.13, 0.06, 8, 16]} />
          </mesh>
        ))}
        <Bordje regels={['Schilderstape', '24 m per rol', '€ 1,29']} breed={1.2} hoog={0.6} pos={[0, 0.5, 0.42]} />
      </group>
    </group>
  );
}

/** Inspectie van EXP-01: één raam van 240 × 180 cm met tape, de schilder en het kraampje. */
function RaamDetail() {
  return (
    <group>
      <Blok size={[4.2, 3.4, 0.3]} pos={[0, 1.7, 0]} color={P.muur2} r={0.06} />
      <group position={[0, 1.8, 0.16]}>
        <Deel id="raam" uit={[0, 0, 1.4]} label="Raam 240 × 180 cm">
          <Raam w={2.4} h={1.8} pos={[0, 0, 0]} />
          <Blok size={[2.6, 0.06, 0.04]} pos={[0, 0.98, 0.07]} color="#3d7cc9" r={0.01} />
          <Blok size={[2.6, 0.06, 0.04]} pos={[0, -0.98, 0.07]} color="#3d7cc9" r={0.01} />
          <Blok size={[0.06, 2.0, 0.04]} pos={[-1.28, 0, 0.07]} color="#3d7cc9" r={0.01} />
          <Blok size={[0.06, 2.0, 0.04]} pos={[1.28, 0, 0.07]} color="#3d7cc9" r={0.01} />
          <Maat van={[-1.2, -1.25, 0.12]} naar={[1.2, -1.25, 0.12]} label="240 cm" />
          <Maat van={[1.5, -0.9, 0.12]} naar={[1.5, 0.9, 0.12]} label="180 cm" />
        </Deel>
      </group>
      <Bordje regels={['6 ramen']} breed={1.0} hoog={0.4} pos={[-1.5, 3.1, 0.16]} bg={P.dak} fg="#ffffff" rand={null} />
      <group position={[1.6, 0, 1.2]}>
        <Blok size={[1.0, 0.7, 0.6]} pos={[0, 0.35, 0]} color={P.hout} r={0.04} />
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat('#e9dfc7')}>
            <torusGeometry args={[0.12, 0.05, 8, 16]} />
          </mesh>
        ))}
        <Bordje regels={['24 m per rol', '€ 1,29']} breed={0.9} hoog={0.4} pos={[0, 0.38, 0.31]} />
      </group>
    </group>
  );
}

/** EXP-02: muur van 4,8 × 3,25 m met een raam van 4 m² (2,5 × 1,6 m). Half geverfd. */
export function Verfmuur() {
  return (
    <group>
      <Deel id="muur" uit={[0, 0, 0]} label="Muur 4,8 × 3,25 m">
        <Blok size={[4.8, 3.25, 0.25]} pos={[0, 1.625, 0]} color={P.muur} r={0.04} />
        <Blok size={[2.0, 3.25, 0.02]} pos={[-1.4, 1.625, 0.13]} color="#9fc7c0" r={0.005} />
      </Deel>
      <Deel id="raam" uit={[0, 0, 1.5]} label="Raam 4 m²">
        <Raam w={2.5} h={1.6} pos={[0.6, 1.75, 0.14]} />
        <Bordje regels={['4 m²']} breed={0.6} hoog={0.3} pos={[0.6, 1.75, 0.22]} />
      </Deel>
      <group position={[-2.1, 0, 0.9]}>
        <Cil r={0.18} h={0.3} pos={[0, 0.15, 0]} color="#9fc7c0" seg={16} />
        <Blok size={[0.08, 1.4, 0.05]} pos={[0.35, 0.8, 0]} rot={[0, 0, 0.3]} color={P.hout} r={0.02} />
        <Blok size={[0.25, 0.12, 0.12]} pos={[0.55, 1.5, 0]} color="#9fc7c0" r={0.05} />
      </group>
      <Maat van={[-2.4, 0.1, 0.6]} naar={[2.4, 0.1, 0.6]} label="4,8 m" />
      <Maat van={[2.7, 0, 0.3]} naar={[2.7, 3.25, 0.3]} label="3,25 m" />
    </group>
  );
}

/** EXP-03: stoepbord met houten frame (50 mm) voor een café. */
export function Stoepbord() {
  const krijt = useTextuur(
    0.6,
    0.8,
    (ctx, w, h) => {
      ctx.fillStyle = '#2b2f2c';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1ea';
      ctx.textAlign = 'center';
      ctx.font = `700 ${h * 0.1}px ${FONT}`;
      ctx.fillText('Café', w / 2, h * 0.16);
      ctx.fillText('De Hoek', w / 2, h * 0.28);
      ctx.font = `600 ${h * 0.075}px ${FONT}`;
      ctx.fillText('soep € 4,50', w / 2, h * 0.45);
      ctx.fillStyle = '#e5675a';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.68, w * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86c24a';
      ctx.fillRect(w / 2 - 6, h * 0.52, 12, h * 0.05);
      ctx.fillStyle = '#2b2f2c';
      ctx.beginPath();
      ctx.arc(w / 2 - w * 0.06, h * 0.66, 5, 0, Math.PI * 2);
      ctx.arc(w / 2 + w * 0.06, h * 0.66, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2b2f2c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.7, w * 0.07, 0.2, Math.PI - 0.2);
      ctx.stroke();
    },
    'krijt',
  );
  const k = P.houtLicht;
  return (
    <group>
      <group rotation={[-0.18, 0, 0]} position={[0, 0, 0.21]}>
        <group position={[0, 0.15, 0]}>
          <Blok size={[0.05, 1.05, 0.04]} pos={[-0.325, 0.525, 0]} color={k} r={0.01} />
          <Blok size={[0.05, 1.05, 0.04]} pos={[0.325, 0.525, 0]} color={k} r={0.01} />
          <Blok size={[0.7, 0.05, 0.04]} pos={[0, 1.025, 0]} color={k} r={0.01} />
          <Blok size={[0.7, 0.05, 0.04]} pos={[0, 0.175, 0]} color={k} r={0.01} />
          <Deel id="plaat" uit={[0, 0, 0.5]} label="Zwarte plaat 600 × 800 mm">
            <mesh position={[0, 0.6, 0.005]}>
              <planeGeometry args={[0.6, 0.8]} />
              <meshStandardMaterial map={krijt} roughness={0.9} />
            </mesh>
          </Deel>
          <Maat van={[-0.35, 1.12, 0.03]} naar={[0.35, 1.12, 0.03]} label="700 mm" />
          <Maat van={[-0.45, 0.15, 0.03]} naar={[-0.45, 1.05, 0.03]} label="900 mm" />
          <Maat van={[0.3, 0.08, 0.03]} naar={[0.35, 0.08, 0.03]} label="50 mm" />
        </group>
      </group>
      <group rotation={[0.18, 0, 0]} position={[0, 0, -0.21]}>
        <Blok size={[0.7, 1.05, 0.04]} pos={[0, 0.675, 0]} color={k} r={0.01} />
      </group>
    </group>
  );
}

/** Klein café als decor bij het stoepbord. */
export function Cafe() {
  return (
    <group>
      <Blok size={[6, 3.2, 4]} pos={[0, 1.6, 0]} color="#f3e1c8" r={0.1} />
      <Blok size={[6.3, 0.3, 4.3]} pos={[0, 3.35, 0]} color={P.dak} r={0.08} />
      <Blok size={[4.5, 0.12, 1.2]} pos={[0, 2.4, 2.6]} rot={[0.25, 0, 0]} color="#e5675a" r={0.03} />
      <Raam w={1.6} h={1.3} pos={[-1.6, 1.4, 2.03]} />
      <Blok size={[1.0, 2.1, 0.08]} pos={[1.3, 1.05, 2.03]} color={P.hout} r={0.03} />
      <Bordje regels={['Café De Hoek']} breed={2.4} hoog={0.45} pos={[0, 2.9, 2.04]} bg={P.dak} fg="#ffffff" rand={null} />
    </group>
  );
}

/** EXP-04: houten bloembak 50 × 32 cm. Een laag aarde van 1 dm komt eruit. */
export function Bloembak() {
  const sprieten = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 40 }, () => [(r() - 0.5) * 0.44, (r() - 0.5) * 0.26, 0.1 + r() * 0.12] as V3);
  }, []);
  return (
    <group>
      <Blok size={[0.54, 0.3, 0.36]} pos={[0, 0.15, 0]} color="#e2c9a0" r={0.02} />
      <Deel id="aarde" uit={[0, 0.45, 0]} label="Aarde 5 × 3,2 × 1 dm">
        <Blok size={[0.5, 0.1, 0.32]} pos={[0, 0.25, 0]} color="#6b4a2f" r={0.01} />
        {sprieten.map(([x, z, h], i) => (
          <mesh key={i} position={[x, 0.3 + h / 2, z]} castShadow material={mat(i % 2 ? '#6fb43f' : '#86c24a')}>
            <coneGeometry args={[0.012, h, 4]} />
          </mesh>
        ))}
      </Deel>
      <Maat van={[-0.25, 0, 0.3]} naar={[0.25, 0, 0.3]} label="50 cm" />
      <Maat van={[0.38, 0, -0.16]} naar={[0.38, 0, 0.16]} label="32 cm" />
      <Maat van={[-0.36, 0.2, 0.16]} naar={[-0.36, 0.3, 0.16]} label="1 dm" deel="aarde" />
    </group>
  );
}

/** EXP-05: schatkist van 1,2 × 0,8 × 0,6 m in de schatkamer, met ijzeren banden. */
export function GroteDoos() {
  return (
    <group>
      <Blok size={[1.3, 0.14, 0.9]} pos={[0, 0.07, 0]} color={P.houtLicht} r={0.02} />
      <Deel id="doos" uit={[0, 0.9, 0]} label="Kist 1,2 × 0,8 × 0,6 m">
        <Blok size={[1.2, 0.6, 0.8]} pos={[0, 0.44, 0]} color="#6e4426" r={0.02} />
        {[-0.4, 0, 0.4].map((x) => (
          <Blok key={x} size={[0.06, 0.62, 0.82]} pos={[x, 0.44, 0]} color="#3b3a39" r={0.01} />
        ))}
        <Blok size={[0.16, 0.18, 0.04]} pos={[0, 0.62, 0.41]} color="#d4a62a" r={0.02} />
        <Bordje regels={['SCHAT']} breed={0.36} hoog={0.12} pos={[0.2, 0.36, 0.405]} bg="#6e4426" fg="#f2d04a" rand={null} />
      </Deel>
      <Maat van={[-0.6, 0.14, 0.6]} naar={[0.6, 0.14, 0.6]} label="1,2 m" />
      <Maat van={[0.8, 0.14, -0.4]} naar={[0.8, 0.14, 0.4]} label="0,8 m" />
      <Maat van={[-0.8, 0.14, 0.4]} naar={[-0.8, 0.74, 0.4]} label="0,6 m" />
    </group>
  );
}

/** Garage als decor. */
export function Garage() {
  return (
    <group>
      <Blok size={[5, 3, 0.2]} pos={[0, 1.5, -2.4]} color={P.muur2} r={0.05} />
      <Blok size={[0.2, 3, 5]} pos={[-2.4, 1.5, 0]} color={P.muur2} r={0.05} />
      <Blok size={[0.2, 3, 5]} pos={[2.4, 1.5, 0]} color={P.muur2} r={0.05} />
      <Blok size={[5.4, 0.25, 5.4]} pos={[0, 3.1, 0]} color={P.dak} r={0.06} />
      <Blok size={[4.6, 0.6, 0.12]} pos={[0, 2.7, 2.45]} color={P.metaal} r={0.03} />
    </group>
  );
}

/** EXP-06: maquette van de studentenkamer (L-vorm) op een tafel bij de makelaar. 1 eenheid = 1 m. */
export function Studentenkamer() {
  return (
    <group>
      <Blok size={[5.2, 0.12, 5.0]} pos={[0, 0.06, 0]} color={P.steen} r={0.04} />
      <group position={[-2.1, 0.12, -2.0]}>
        <Deel id="kamer" uit={[0.6, 0, 0.4]} label="Kamer 400 × 400 cm">
          <Blok size={[4, 0.04, 4]} pos={[2.2, 0.02, 2]} color="#e9dcc0" r={0.01} />
          <Blok size={[4, 0.6, 0.08]} pos={[2.2, 0.3, 4.04]} color={P.dak} r={0.02} />
          <Blok size={[0.08, 0.6, 4]} pos={[4.24, 0.3, 2]} color={P.dak} r={0.02} />
          <Blok size={[0.08, 0.6, 2.1]} pos={[0.16, 0.3, 2.95]} color={P.dak} r={0.02} />
          <Blok size={[0.9, 0.3, 1.9]} pos={[3.6, 0.17, 2.9]} color="#cfd6da" r={0.06} />
          <Blok size={[0.7, 0.3, 1.6]} pos={[3.7, 0.17, 0.9]} color="#cfd6da" r={0.06} />
          <Blok size={[1.0, 0.3, 0.6]} pos={[1.6, 0.17, 3.5]} color="#bfc6ca" r={0.04} />
          <Blok size={[0.3, 0.6, 0.9]} pos={[1.4, 0.32, 1.6]} rot={[0, 0.3, 0]} color="#7d8a8f" r={0.04} />
          <Maat van={[0.2, 0.05, 4.4]} naar={[4.2, 0.05, 4.4]} label="400 cm" />
          <Maat van={[4.6, 0.05, 0]} naar={[4.6, 0.05, 4]} label="400 cm" />
        </Deel>
        <Deel id="nis" uit={[-0.6, 0, -0.4]} label="Nis 20 × 190 cm">
          <Blok size={[0.2, 0.04, 1.9]} pos={[0.1, 0.02, 0.95]} color="#d9c9a5" r={0.005} />
          <Blok size={[0.08, 0.6, 1.9]} pos={[-0.04, 0.3, 0.95]} color={P.dak} r={0.02} />
          <Maat van={[-0.4, 0.05, 0]} naar={[-0.4, 0.05, 1.9]} label="190 cm" />
        </Deel>
        <Blok size={[4.2, 0.6, 0.08]} pos={[2.1, 0.3, -0.04]} color={P.dak} r={0.02} />
        <Maat van={[0, 0.65, -0.4]} naar={[4.2, 0.65, -0.4]} label="420 cm" />
      </group>
      <Bordje regels={['Te huur', '€ 17,50 per m²']} breed={1.6} hoog={0.7} pos={[1.6, 0.5, 2.55]} rot={[-0.4, 0, 0]} />
    </group>
  );
}

/** Makelaarskiosk als decor. */
export function Makelaar() {
  return (
    <group>
      <Blok size={[7, 0.12, 6]} pos={[0, 0.06, 0]} color={P.stoep} r={0.03} shadow={false} />
      {[
        [-3.3, -2.8],
        [3.3, -2.8],
        [-3.3, 2.8],
        [3.3, 2.8],
      ].map(([x, z], i) => (
        <Blok key={i} size={[0.2, 3, 0.2]} pos={[x, 1.5, z]} color={P.kozijn} r={0.05} />
      ))}
      {[-2.8, 2.8].map((z) => (
        <Blok key={z} size={[7, 0.2, 0.2]} pos={[0, 3.05, z]} color={P.kozijn} r={0.05} />
      ))}
      {[-3.3, 3.3].map((x) => (
        <Blok key={x} size={[0.2, 0.2, 6]} pos={[x, 3.05, 0]} color={P.kozijn} r={0.05} />
      ))}
      <Blok size={[7.2, 0.1, 1.2]} pos={[0, 3.2, 2.6]} rot={[0.25, 0, 0]} color={P.paars} r={0.03} />
      <Bordje regels={['Makelaar']} breed={2.2} hoog={0.45} pos={[0, 2.62, 2.92]} bg={P.paars} fg="#ffffff" rand={null} />
    </group>
  );
}

/** EXP-07: drie tuinhuisjes en de tuin van de tuinman (8 × 12 m) met een raster van 1 m. */
export function Tuinhuizen() {
  const huisje = (naam: string, l: number, b: number, h: number, pos: V3, kleur: string) => (
    <group position={pos}>
      <Blok size={[l, h, b]} pos={[0, h / 2, 0]} color={kleur} r={0.05} />
      <Blok size={[l + 0.2, 0.12, b + 0.2]} pos={[0, h + 0.06, 0]} color={P.dak} r={0.03} />
      <Blok size={[0.7, 1.6, 0.05]} pos={[l / 2 - 0.6, 0.8, b / 2 + 0.03]} color={P.hout} r={0.02} />
      <group position={[0, 0, b / 2 + 0.7]}>
        <Cil r={0.04} h={1.0} pos={[0, 0.5, 0]} color={P.dak} seg={6} />
        <Bordje regels={[naam, `${l * 100} × ${b * 100} × ${h * 100} cm`]} breed={1.6} hoog={0.6} pos={[0, 1.2, 0.03]} />
      </group>
    </group>
  );
  return (
    <group>
      {huisje('Pelle', 1.2, 1.2, 2.2, [-9.5, 0, -6.5], '#a4643a')}
      {huisje('Axel', 8, 4.5, 2.6, [-8.5, 0, 0.5], '#c99a62')}
      {huisje('Sven', 3, 2, 2.5, [-10, 0, 6.5], '#b9cbbf')}
      {/* tuin van de tuinman: 8 × 12 m met ruitjes van 1 m */}
      <group position={[4, 0, 0]}>
        <Blok size={[8, 0.06, 12]} pos={[0, 0.03, 0]} color={P.grasDonker} r={0.02} shadow={false} />
        {Array.from({ length: 9 }, (_, i) => (
          <Blok key={`x${i}`} size={[0.03, 0.01, 12]} pos={[-4 + i, 0.065, 0]} color="#e9f1d6" r={0.004} shadow={false} />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <Blok key={`z${i}`} size={[8, 0.01, 0.03]} pos={[0, 0.065, -6 + i]} color="#e9f1d6" r={0.004} shadow={false} />
        ))}
        <Deel id="plek" uit={[0, 0.4, 0]} label="Plek 3 × 2 m">
          <Blok size={[2, 0.03, 3]} pos={[3, 0.08, -4.5]} color="#c96f4a" r={0.01} />
          {[
            [2, -6],
            [4, -6],
            [2, -3],
            [4, -3],
          ].map(([x, z], i) => (
            <Cil key={i} r={0.04} h={0.5} pos={[x, 0.25, z]} color={P.wit} seg={6} />
          ))}
          <Bordje regels={['tuinhuis']} breed={1.4} hoog={0.4} pos={[3, 0.12, -4.5]} rot={[-Math.PI / 2, 0, 0]} bg="#c96f4a" fg="#ffffff" rand={null} />
        </Deel>
        <Maat van={[-4, 0.1, 6.6]} naar={[4, 0.1, 6.6]} label="8 m" />
        <Maat van={[4.6, 0.1, -6]} naar={[4.6, 0.1, 6]} label="12 m" />
      </group>
    </group>
  );
}

/** EXP-08: twee bouwkavels (schaal 1:2) met TE KOOP-borden. */
export function Bouwkavels() {
  // echte maten: 21 m lang; kavel 1 10,5 m breed, kavel 2 13,5 m breed. Hier gehalveerd.
  const L = 10.5;
  const b1 = 5.25;
  const b2 = 6.75;
  const kavel = (x: number, b: number, prijs: string, id: string, label: string) => (
    <Deel id={id} uit={[0, 0.3, 0]} label={label}>
      <group position={[x, 0, 0]}>
        <Blok size={[b - 0.1, 0.06, L]} pos={[0, 0.03, 0]} color="#c8b27c" r={0.02} shadow={false} />
        <group position={[0, 0, 1.5]}>
          <Cil r={0.05} h={1.2} pos={[-0.5, 0.6, 0]} color={P.dak} seg={6} />
          <Cil r={0.05} h={1.2} pos={[0.5, 0.6, 0]} color={P.dak} seg={6} />
          <Bordje regels={['TE KOOP', prijs]} breed={1.6} hoog={0.75} pos={[0, 1.3, 0.06]} bg="#ffffff" fg="#b0402c" rand="#b0402c" />
        </group>
      </group>
    </Deel>
  );
  return (
    <group>
      {kavel(-b1 / 2, b1, '€ 55.125', 'kavel1', 'Kavel 1')}
      {kavel(b2 / 2, b2, '€ 70.875', 'kavel2', 'Kavel 2')}
      {[-b1, 0, b2].map((x, i) => (
        <group key={i}>
          <Cil r={0.05} h={0.5} pos={[x, 0.25, -L / 2]} color={P.wit} seg={6} />
          <Cil r={0.05} h={0.5} pos={[x, 0.25, L / 2]} color={P.wit} seg={6} />
        </group>
      ))}
      <Hek lengte={b1 + b2} pos={[(b2 - b1) / 2, 0, -L / 2]} hoogte={0.4} color="#e5675a" />
      <Maat van={[-b1, 0.1, -L / 2 - 0.7]} naar={[0, 0.1, -L / 2 - 0.7]} label="10,5 m" />
      <Maat van={[-b1 - 0.8, 0.1, -L / 2]} naar={[-b1 - 0.8, 0.1, L / 2]} label="21 m" />
      <Maat van={[b2 + 0.8, 0.1, -L / 2]} naar={[b2 + 0.8, 0.1, L / 2]} label="21 m" />
      <Maat van={[0, 0.1, -L / 2 - 0.7]} naar={[b2, 0.1, -L / 2 - 0.7]} label="? m" deel="kavel2" />
    </group>
  );
}

/** EXP-09: reuzenpak ananassap (25 × 10 × 8 cm, hier × 10) dat openvouwt tot de uitslag. */
export function Ananaspak() {
  const etiket = (tekst: string) => <EtiketAnanas tekst={tekst} />;
  const geel = '#8cc06a';
  return (
    <group>
      <Blok size={[3.2, 0.3, 1.6]} pos={[0, 0.15, 0]} color={P.steen} r={0.06} />
      <group position={[0, 0.3, 0]}>
        <VouwDoos
          w={2.5}
          d={1.0}
          h={0.8}
          boven={{ kleur: geel, decal: etiket('Kikkersap') }}
          zijden={{
            nx: { kleur: geel },
            px: { kleur: geel },
            nz: { kleur: geel, decal: etiket('kwaak!') },
            pz: { kleur: geel, decal: etiket('Kikkersap') },
          }}
          onder={{ kleur: geel }}
          onderAan="pz"
        />
      </group>
      <Maat van={[-1.25, 0.3, 0.9]} naar={[1.25, 0.3, 0.9]} label="25 cm" />
      <Maat van={[1.45, 0.3, -0.5]} naar={[1.45, 0.3, 0.5]} label="10 cm" />
      <Maat van={[-1.45, 0.3, 0.5]} naar={[-1.45, 1.1, 0.5]} label="8 cm" />
    </group>
  );
}

function EtiketAnanas({ tekst }: { tekst: string }) {
  const tex = useTextuur(
    2.4,
    0.75,
    (ctx, w, h) => {
      // een groen pak met een kikker erop
      ctx.fillStyle = '#8cc06a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3f7a2e';
      ctx.beginPath();
      ctx.ellipse(w * 0.2, h * 0.62, h * 0.3, h * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const dx of [-0.13, 0.13]) {
        ctx.fillStyle = '#3f7a2e';
        ctx.beginPath();
        ctx.arc(w * 0.2 + dx * h, h * 0.38, h * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(w * 0.2 + dx * h, h * 0.38, h * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2a24';
        ctx.beginPath();
        ctx.arc(w * 0.2 + dx * h, h * 0.39, h * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#1f2a24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w * 0.2, h * 0.62, h * 0.12, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.fillStyle = '#1f3a12';
      ctx.font = `700 ${h * 0.32}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tekst, w * 0.62, h * 0.52);
    },
    `kikker${tekst}`,
  );
  return (
    <mesh>
      <planeGeometry args={[2.3, 0.7]} />
      <meshStandardMaterial map={tex} roughness={0.7} />
    </mesh>
  );
}

/** PRA-01: bouwplek voor je eigen wachtershuisje (5 × 5 m = 25 m²). */
export function Tinyhouse() {
  return (
    <group>
      <Blok size={[5, 0.05, 5]} pos={[0, 0.025, 0]} color="#d9c08a" r={0.02} shadow={false} />
      {[
        [-2.5, -2.5],
        [2.5, -2.5],
        [-2.5, 2.5],
        [2.5, 2.5],
      ].map(([x, z], i) => (
        <Cil key={i} r={0.05} h={0.7} pos={[x, 0.35, z]} color={P.hout} seg={6} />
      ))}
      <Blok size={[1.8, 1.4, 1.4]} pos={[-1.2, 0.7, -1.2]} color={P.muur} r={0.08} />
      <Blok size={[2.0, 0.15, 1.6]} pos={[-1.2, 1.47, -1.2]} rot={[0, 0, 0.12]} color={P.dak} r={0.04} />
      <group position={[1.4, 0, 2.9]}>
        <Cil r={0.05} h={1.4} pos={[0, 0.7, 0]} color={P.dak} seg={6} />
        <Bordje regels={['Jouw wachtershuisje', '25 m²']} breed={1.6} hoog={0.7} pos={[0, 1.45, 0.05]} bg={P.oranje} fg="#ffffff" rand={null} />
      </group>
      <Maat van={[-2.5, 0.1, 3.0]} naar={[2.5, 0.1, 3.0]} label="5 m" />
      <Maat van={[3.0, 0.1, -2.5]} naar={[3.0, 0.1, 2.5]} label="5 m" />
    </group>
  );
}

/** Kruissom als stenen mozaïek op het plein; de groene tegels liggen in een kruiwagen. */
export function KruissomPlein({ rooster, tegels }: { rooster: string[][]; tegels: number[] }) {
  const c = 0.62;
  const rijen = rooster.length;
  const kol = Math.max(...rooster.map((r) => r.length));
  return (
    <group>
      <Blok size={[kol * c + 0.6, 0.08, rijen * c + 0.6]} pos={[0, 0.04, 0]} color={P.steen} r={0.04} shadow={false} />
      {rooster.flatMap((rij, r) =>
        rij.map((v, k) => {
          if (v === '#') return null;
          const x = (k - (kol - 1) / 2) * c;
          const z = (r - (rijen - 1) / 2) * c;
          const leeg = v === '';
          return (
            <group key={`${r}-${k}`} position={[x, 0.09, z]}>
              <Blok size={[c * 0.92, 0.06, c * 0.92]} color={leeg ? '#fff7dd' : '#f6e3a8'} r={0.03} shadow={false} />
              {!leeg && <Bordje regels={[v === 'x' ? '×' : v === ':' ? ':' : v]} breed={c * 0.8} hoog={c * 0.8} pos={[0, 0.035, 0]} rot={[-Math.PI / 2, 0, 0]} bg="#f6e3a8" rand={null} />}
            </group>
          );
        }),
      )}
      <group position={[kol * c * 0.5 + 1.2, 0, 0]}>
        <Blok size={[1.0, 0.4, 0.7]} pos={[0, 0.5, 0]} color="#3f8f5a" r={0.08} />
        <Cil r={0.2} h={0.08} pos={[-0.55, 0.2, 0]} rot={[Math.PI / 2, 0, Math.PI / 2]} color="#2c2f33" seg={12} />
        {tegels.slice(0, 6).map((_, i) => (
          <Blok key={i} size={[0.26, 0.05, 0.26]} pos={[-0.25 + (i % 3) * 0.26, 0.73 + Math.floor(i / 3) * 0.05, -0.12 + Math.floor(i / 3) * 0.2]} color="#86c24a" r={0.02} />
        ))}
      </group>
    </group>
  );
}
