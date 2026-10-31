// Vast decor achter of naast een station (gaat niet mee naar de inspectie).
// Alles past in een kamerhoek: max. ± 3 m breed en ± 1,2 m diep, midden op (0, 0).
import { mat } from '../game/kit';
import { Blok, Cil } from './blok';
import { P } from '../game/palette';
import { useTextuur } from '../game/tekst';
import { Druk } from './atlas';
import { Bordje, KLEUR, Poppetje } from './kraam';

const STAAL = '#b9c0c4';
const TEGEL = '#e9eef0';

function Naambord({ naam, y, kleur = KLEUR.groen, breed }: { naam: string; y: number; kleur?: string; breed?: number }) {
  const b = breed ?? Math.min(2.6, 0.5 + naam.length * 0.2);
  return (
    <group position={[0, y, 0.06]}>
      <Blok size={[b + 0.1, 0.44, 0.08]} color={kleur} r={0.05} />
      <Bordje regels={[naam]} breed={b} hoog={0.36} pos={[0, 0, 0.045]} bg={kleur} fg="#ffffff" rand={null} />
    </group>
  );
}

/** Tegelwandje met wit-blauw tegelpatroon (achterwand van de keuken), tegels van 12,5 cm. */
function Tegelwand({ b, h }: { b: number; h: number }) {
  const tb = b - 0.06;
  const th = h - 0.06;
  const teken = (ctx: CanvasRenderingContext2D, w: number, hh: number) => {
    ctx.fillStyle = TEGEL;
    ctx.fillRect(0, 0, w, hh);
    ctx.strokeStyle = '#c8d3d8';
    ctx.lineWidth = 2;
    const nx = Math.round(tb * 8);
    const ny = Math.round(th * 8);
    ctx.beginPath();
    for (let i = 0; i <= nx; i++) {
      ctx.moveTo((i * w) / nx, 0);
      ctx.lineTo((i * w) / nx, hh);
    }
    for (let i = 0; i <= ny; i++) {
      ctx.moveTo(0, (i * hh) / ny);
      ctx.lineTo(w, (i * hh) / ny);
    }
    ctx.stroke();
  };
  return (
    <group>
      <Blok size={[b, h, 0.12]} pos={[0, h / 2, -0.06]} color="#d9d3c6" r={0.03} />
      <Druk b={tb} h={th} teken={teken} sleutel={`w3-tegelwand${tb}${th}`} ppm={128} position={[0, h / 2, 0.005]}>
        <planeGeometry args={[tb, th]} />
      </Druk>
    </group>
  );
}

/** Achterwand van de open keuken met plank, pannen en een naambord. */
export function Keukenwand({ naam = 'OPEN KEUKEN' }: { naam?: string }) {
  return (
    <group position={[0, 0, -0.45]}>
      <Tegelwand b={2.8} h={2.2} />
      <Blok size={[2.6, 0.06, 0.3]} pos={[0, 1.55, 0.15]} color={P.hout} r={0.02} />
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <Cil key={x} r={0.09} rTop={0.11} h={0.22} pos={[x, 1.69, 0.15]} color={['#e5675a', '#f2c24a', '#7cbf4a', '#3d7cc9'][i]} seg={12} />
      ))}
      <Blok size={[2.6, 0.9, 0.55]} pos={[0, 0.45, 0.3]} color={STAAL} r={0.03} />
      <Blok size={[2.66, 0.05, 0.6]} pos={[0, 0.92, 0.3]} color="#8f979b" r={0.02} />
      <Naambord naam={naam} y={2.0} />
    </group>
  );
}

/** Fornuis met afzuigkap en hangende pannen. */
export function Fornuiswand({ naam = 'OPEN KEUKEN' }: { naam?: string }) {
  return (
    <group position={[0, 0, -0.45]}>
      <Tegelwand b={2.8} h={2.2} />
      <Blok size={[1.2, 0.9, 0.6]} pos={[-0.6, 0.45, 0.32]} color="#3b4442" r={0.04} />
      <Blok size={[1.24, 0.05, 0.64]} pos={[-0.6, 0.92, 0.32]} color="#1f2224" r={0.02} />
      {[-0.85, -0.35].map((x) =>
        [0.2, 0.44].map((z) => <Cil key={`${x}${z}`} r={0.1} h={0.02} pos={[x, 0.95, z]} color="#5b5f5c" seg={14} />),
      )}
      <Blok size={[1.0, 0.18, 0.04]} pos={[-0.6, 0.55, 0.63]} color="#1f2224" r={0.02} />
      <Blok size={[1.3, 0.9, 0.6]} pos={[0.65, 0.45, 0.32]} color={STAAL} r={0.04} />
      <Blok size={[1.34, 0.05, 0.64]} pos={[0.65, 0.92, 0.32]} color="#8f979b" r={0.02} />
      {/* afzuigkap */}
      <mesh position={[-0.6, 1.75, 0.3]} castShadow material={mat(STAAL, { metal: 0.4, rough: 0.4 })}>
        <cylinderGeometry args={[0.18, 0.6, 0.5, 4, 1]} />
      </mesh>
      {/* pannen aan een rek */}
      <Blok size={[1.2, 0.04, 0.04]} pos={[0.65, 1.7, 0.08]} color="#2f3634" r={0.01} />
      {[0.25, 0.65, 1.05].map((x, i) => (
        <group key={x} position={[x, 1.42 - i * 0.04, 0.1]}>
          <Cil r={0.13 + i * 0.02} h={0.05} rot={[Math.PI / 2, 0, 0]} color="#c27a46" seg={14} />
          <Blok size={[0.03, 0.22, 0.02]} pos={[0, 0.18, 0]} color="#2f3634" r={0.01} />
        </group>
      ))}
      <Naambord naam={naam} y={2.0} />
    </group>
  );
}

/** Afwashoek: spoelbak, afdruiprek met borden, kraan. */
export function Afwashoek() {
  return (
    <group position={[0, 0, -0.45]}>
      <Tegelwand b={2.8} h={2.2} />
      <Blok size={[2.6, 0.9, 0.6]} pos={[0, 0.45, 0.32]} color={STAAL} r={0.04} />
      <Blok size={[2.64, 0.05, 0.64]} pos={[0, 0.92, 0.32]} color="#8f979b" r={0.02} />
      <Blok size={[0.8, 0.04, 0.42]} pos={[-0.6, 0.95, 0.32]} color="#6e7a80" r={0.02} />
      <Cil r={0.025} h={0.4} pos={[-0.6, 1.14, 0.08]} color={STAAL} seg={8} />
      <Blok size={[0.04, 0.04, 0.24]} pos={[-0.6, 1.33, 0.18]} color={STAAL} r={0.01} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Cil key={i} r={0.15} h={0.02} pos={[0.45 + i * 0.09, 1.1, 0.3]} rot={[0, 0, Math.PI / 2]} color={P.wit} seg={16} />
      ))}
      <Blok size={[0.6, 0.04, 0.34]} pos={[0.63, 0.96, 0.3]} color="#2f3634" r={0.01} />
      <Naambord naam="AFWAS" y={2.0} />
    </group>
  );
}

/** Info-zuil van de rondleiding. */
export function Infozuil() {
  return (
    <group>
      <Cil r={0.24} h={2.1} pos={[0, 1.05, 0]} color={KLEUR.groen} seg={14} />
      <Cil r={0.3} h={0.1} pos={[0, 2.15, 0]} color="#2a302f" seg={14} />
      <Bordje regels={['i']} breed={0.36} hoog={0.36} pos={[0, 1.7, 0.25]} bg="#ffffff" fg={KLEUR.groen} rand={null} />
      <Bordje regels={['Rondleiding', 'Markthal']} breed={0.7} hoog={0.4} pos={[0, 1.15, 0.25]} bg={KLEUR.groen} fg="#ffffff" rand={null} />
    </group>
  );
}

/** Fotostudio: achtergrondrol op een frame met twee lampen. */
export function Fotostudio() {
  return (
    <group>
      {[-1.35, 1.35].map((x) => (
        <Cil key={x} r={0.03} h={2.6} pos={[x, 1.3, 0]} color="#2f3634" seg={6} />
      ))}
      <Cil r={0.08} h={2.8} pos={[0, 2.55, 0]} rot={[0, 0, Math.PI / 2]} color="#cfd4d6" seg={12} />
      <Blok size={[2.6, 2.45, 0.02]} pos={[0, 1.3, 0]} color="#c9d6dd" r={0.005} />
      <Blok size={[2.6, 0.02, 0.6]} pos={[0, 0.02, 0.3]} color="#c9d6dd" r={0.005} shadow={false} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.15, 0, 0.55]} rotation={[0, -s * 0.5, 0]}>
          <Cil r={0.02} h={1.7} pos={[0, 0.85, 0]} color="#2f3634" seg={6} />
          <Blok size={[0.5, 0.4, 0.3]} pos={[0, 1.8, 0]} color="#f4f4f2" r={0.06} />
        </group>
      ))}
    </group>
  );
}

/** Skyline van Arnhem als kartonnen decor (kerktoren, brug, huizen). */
export function Skyline() {
  const silhouet = '#c8b79f';
  return (
    <group>
      <Blok size={[2.8, 0.12, 0.6]} pos={[0, 0.06, 0]} color="#8a6a4a" r={0.03} />
      {/* kerktoren */}
      <Blok size={[0.45, 2.0, 0.08]} pos={[-0.9, 1.1, 0]} color={silhouet} r={0.02} />
      <mesh position={[-0.9, 2.45, 0]} material={mat(silhouet)}>
        <coneGeometry args={[0.3, 0.7, 4]} />
      </mesh>
      {/* boogbrug */}
      <mesh position={[0.6, 0.12, 0]} material={mat('#9fb3c0')}>
        <torusGeometry args={[0.7, 0.04, 6, 24, Math.PI]} />
      </mesh>
      <Blok size={[1.8, 0.06, 0.1]} pos={[0.6, 0.42, 0]} color="#9fb3c0" r={0.02} />
      {/* huizen */}
      {[-1.25, -0.45, 0.05].map((x, i) => (
        <Blok key={x} size={[0.4, 0.8 + i * 0.25, 0.08]} pos={[x, 0.5 + i * 0.12, -0.12]} color={['#d6c6ac', '#cdbb9f', '#d9cbb3'][i]} r={0.02} />
      ))}
      <Bordje regels={['Welkom in Arnhem']} breed={1.3} hoog={0.3} pos={[0.6, 1.25, 0.05]} bg="#2f6ac0" fg="#ffffff" rand={null} />
    </group>
  );
}

/** Roeiboot op het strandje, met een ton en een schep (schatkaart). */
export function Roeiboot() {
  return (
    <group rotation={[0, 0.12, 0]}>
      <group position={[-0.2, 0, 0]}>
        <Blok size={[2.4, 0.42, 0.95]} pos={[0, 0.25, 0]} color="#8a5a36" r={0.2} />
        <Blok size={[2.1, 0.06, 0.75]} pos={[0, 0.44, 0]} color="#b6773e" r={0.03} />
        <Blok size={[0.18, 0.05, 0.9]} pos={[0.3, 0.5, 0]} color="#cf9a5f" r={0.02} />
        <Blok size={[1.5, 0.04, 0.06]} pos={[0.1, 0.55, 0.55]} rot={[0, 0.2, 0]} color="#cf9a5f" r={0.02} />
      </group>
      <Cil r={0.24} h={0.6} pos={[1.25, 0.3, 0.1]} color="#7a5132" seg={14} />
      <Cil r={0.25} h={0.04} pos={[1.25, 0.45, 0.1]} color="#2f3634" seg={14} />
      <group position={[1.2, 0, -0.35]} rotation={[0, 0, 0.35]}>
        <Cil r={0.02} h={1.0} pos={[0, 0.6, 0]} color="#8a5a36" seg={6} />
        <Blok size={[0.2, 0.26, 0.03]} pos={[0, 0.1, 0]} color="#9aa3a8" r={0.02} />
      </group>
    </group>
  );
}

/** Krantenkiosk-achterwand met rekken. */
export function Kiosk() {
  return (
    <group>
      <Blok size={[2.8, 2.3, 0.14]} pos={[0, 1.15, -0.5]} color="#e48a3a" r={0.04} />
      <Blok size={[3.0, 0.2, 1.2]} pos={[0, 2.4, 0]} color="#3b4442" r={0.05} />
      {[-1.4, 1.4].map((x) => (
        <Blok key={x} size={[0.1, 2.3, 0.1]} pos={[x, 1.15, 0.5]} color="#3b4442" r={0.03} />
      ))}
      {[0.7, 1.2, 1.7].map((y) => (
        <group key={y}>
          <Blok size={[2.4, 0.04, 0.24]} pos={[0, y, -0.32]} rot={[0.3, 0, 0]} color="#d9d3c6" r={0.01} />
          {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
            <Blok key={x} size={[0.4, 0.5, 0.02]} pos={[x, y + 0.22, -0.36]} rot={[0.3, 0, 0]} color={['#fbfaf6', '#f2d04a', '#9fc4ef', '#fbfaf6'][(i + Math.round(y * 10)) % 4]} r={0.005} />
          ))}
        </group>
      ))}
      <Naambord naam="KRANTEN" y={2.62} kleur="#3b4442" />
    </group>
  );
}

/** Bakkerij: steenoven en broodplanken. */
export function Bakkerij() {
  return (
    <group>
      <Blok size={[2.8, 2.2, 0.12]} pos={[0, 1.1, -0.55]} color="#efe1c8" r={0.04} />
      <group position={[-0.75, 0, -0.1]}>
        <Blok size={[1.2, 0.8, 0.9]} pos={[0, 0.4, 0]} color={KLEUR.baksteen} r={0.06} />
        <mesh position={[0, 0.8, 0]} castShadow material={mat('#c97a5a')}>
          <sphereGeometry args={[0.58, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.98, 0.46]} material={mat('#2a1d18')}>
          <circleGeometry args={[0.22, 16, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, 0.98, 0.465]} material={mat('#ffb04a', { emissive: '#ff8a2a' })}>
          <circleGeometry args={[0.14, 12, 0, Math.PI]} />
        </mesh>
        <Cil r={0.08} h={0.9} pos={[0.25, 1.6, -0.2]} color={KLEUR.baksteen} seg={8} />
      </group>
      <group position={[0.75, 0, -0.35]}>
        {[0.6, 1.1, 1.6].map((y, i) => (
          <group key={y}>
            <Blok size={[1.2, 0.05, 0.38]} pos={[0, y, 0]} color={P.hout} r={0.02} />
            {[-0.36, 0, 0.36].map((x) => (
              <mesh key={x} position={[x, y + 0.1, 0]} scale={[1.5, 0.75, 0.9]} castShadow material={mat(i === 1 ? '#c8894a' : '#d9a560')}>
                <sphereGeometry args={[0.11, 12, 8]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <Naambord naam="BAKKERIJ" y={2.45} kleur="#7a5132" />
    </group>
  );
}

/** Kaartenwinkel: wand met kaarten en een globe. */
export function Kaartenwinkel() {
  const kaart = useTextuur(
    0.9,
    0.6,
    (ctx, w, h) => {
      ctx.fillStyle = '#9fd0de';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b9d98a';
      ctx.beginPath();
      ctx.ellipse(w * 0.3, h * 0.45, w * 0.2, h * 0.3, 0.4, 0, Math.PI * 2);
      ctx.ellipse(w * 0.72, h * 0.55, w * 0.18, h * 0.25, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 6, 0);
        ctx.lineTo((i * w) / 6, h);
        ctx.stroke();
      }
    },
    'w3-wereldkaart',
    256,
  );
  return (
    <group>
      <Blok size={[2.8, 2.3, 0.12]} pos={[0, 1.15, -0.55]} color="#e6dccb" r={0.04} />
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 1.55, -0.48]}>
          <Blok size={[1.0, 0.7, 0.04]} color={P.hout} r={0.01} />
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[0.9, 0.6]} />
            <meshStandardMaterial map={kaart} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <group position={[1.15, 0, 0.1]}>
        <Cil r={0.04} h={0.9} pos={[0, 0.45, 0]} color={P.hout} seg={8} />
        <mesh position={[0, 1.15, 0]} castShadow material={mat('#5fa8c9')}>
          <sphereGeometry args={[0.24, 18, 12]} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[0, 0, 0.4]} material={mat('#c9a227', { metal: 0.6, rough: 0.3 })}>
          <torusGeometry args={[0.28, 0.012, 6, 30]} />
        </mesh>
      </group>
      <Naambord naam="KAARTENWINKEL" y={2.45} kleur="#1d3a6b" />
    </group>
  );
}

/** Twee winkelwagens en een vlag (boodschappen voor het feestje). */
export function Winkelwagens() {
  const kar = (x: number, k: string) => (
    <group key={x} position={[x, 0, 0]} rotation={[0, 0.2, 0]}>
      <Blok size={[0.55, 0.42, 0.8]} pos={[0, 0.72, 0]} color={k} r={0.04} opacity={0.85} />
      <Blok size={[0.5, 0.04, 0.75]} pos={[0, 0.32, 0]} color="#9aa3a8" r={0.01} />
      <Blok size={[0.56, 0.04, 0.04]} pos={[0, 1.05, 0.46]} color="#2f3634" r={0.01} />
      {[-0.22, 0.22].map((xx) =>
        [-0.32, 0.32].map((z) => <Cil key={`${xx}${z}`} r={0.05} h={0.04} pos={[xx, 0.06, z]} rot={[0, 0, Math.PI / 2]} color="#2c2f33" seg={8} />),
      )}
      {[-0.3, 0.3].map((z) => (
        <Blok key={z} size={[0.04, 0.45, 0.04]} pos={[0, 0.3, z]} color="#9aa3a8" r={0.01} />
      ))}
    </group>
  );
  return (
    <group>
      {kar(-0.8, '#e5675a')}
      {kar(0.8, '#3d7cc9')}
      <Cil r={0.03} h={2.2} pos={[0, 1.1, -0.3]} color="#2f3634" seg={6} />
      <Bordje regels={['Feest!']} breed={0.7} hoog={0.4} pos={[0.37, 1.95, -0.3]} bg="#f2c24a" fg="#7a3b1f" rand={null} dubbel />
      <Poppetje pos={[1.35, 0, 0.3]} rot={-0.6} shirt="#f2c24a" haar="krul" s={0.9} />
    </group>
  );
}
