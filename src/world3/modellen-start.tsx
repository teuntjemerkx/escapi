// Terugblik (eierdozen) en instructie (kookschool met de verhoudingstabel).
import { Deel } from '../game/inspectie';
import { mat } from '../game/kit';
import { Blok, Cil } from './blok';
import { P } from '../game/palette';
import { Bordje } from './kraam';
import { KLEUR, krijtAchtergrond, Label, schrijf, Tekenbord, Toonbank, type V3 } from './kraam';

/** Eierdoos: kartonnen bakje met 2 rijen van 3 eieren en een open deksel. */
function Eierdoos({ pos, bruin = false }: { pos: V3; bruin?: boolean }) {
  const ei = bruin ? '#d9b48a' : '#f3e6cf';
  return (
    <group position={pos}>
      <Blok size={[0.46, 0.07, 0.32]} pos={[0, 0.035, 0]} color="#c3c9cf" r={0.03} />
      {[0, 1, 2].map((k) =>
        [0, 1].map((r) => (
          <mesh key={`${k}${r}`} position={[(k - 1) * 0.14, 0.11, (r - 0.5) * 0.15]} scale={[1, 1.28, 1]} castShadow material={mat(ei, { rough: 0.5 })}>
            <sphereGeometry args={[0.058, 12, 9]} />
          </mesh>
        )),
      )}
      <group position={[0, 0.07, -0.16]} rotation={[-2.5, 0, 0]}>
        <Blok size={[0.46, 0.03, 0.32]} pos={[0, 0, 0.16]} color="#b8bec5" r={0.015} />
      </group>
    </group>
  );
}

/** Terugblik: 4 eierdozen op een marktkraampje. Eén doos tilt eruit (1 doos), daarna alle dozen. */
export function Eierdozen() {
  return (
    <group>
      <Blok size={[2.2, 0.08, 0.8]} pos={[0, 0.76, 0]} color={P.houtLicht} r={0.03} />
      {[-1, 1].map((x) => (
        <Blok key={x} size={[0.08, 0.72, 0.7]} pos={[x * 1.0, 0.36, 0]} color={P.hout} r={0.02} />
      ))}
      <Blok size={[2.24, 0.1, 0.06]} pos={[0, 0.7, 0.4]} color="#e5675a" r={0.02} />
      <Deel id="dozen" uit={[0, 0.35, 0.15]} label="4 dozen eieren">
        <Deel id="doos" uit={[0, 0.5, 0.35]} label="1 doos: 2 rijen van 3">
          <Eierdoos pos={[-0.75, 0.8, 0.08]} />
        </Deel>
        <Eierdoos pos={[-0.25, 0.8, 0.08]} bruin />
        <Eierdoos pos={[0.25, 0.8, 0.08]} />
        <Eierdoos pos={[0.75, 0.8, 0.08]} bruin />
      </Deel>
      <group position={[0.75, 0.8, -0.32]}>
        <Cil r={0.01} h={0.4} pos={[0, 0.2, 0]} color="#7a5a3c" seg={5} />
        <Bordje regels={['Verse eieren']} breed={0.62} hoog={0.18} pos={[0, 0.45, 0]} bg="#fff6e2" rand="#e5675a" />
      </group>
    </group>
  );
}

/** Instructie: kookstation met recept (4 personen, 300 g pasta), pan en een bord met de verhoudingstabel. */
export function Kookschool() {
  return (
    <group>
      <Toonbank b={2.0} d={0.8} h={0.9} kleur="#d9d3c6" blad="#9aa3a8" />
      {/* kookplaat en pan */}
      <Blok size={[0.7, 0.03, 0.5]} pos={[-0.5, 0.915, 0.02]} color="#1f2224" r={0.01} />
      <Deel id="pasta" uit={[0, 0.55, 0.45]} label="Pan voor 10 personen">
        <group position={[-0.5, 0.93, 0.02]}>
          <Cil r={0.24} rTop={0.26} h={0.26} pos={[0, 0.13, 0]} color="#b9c0c4" seg={20} />
          <Cil r={0.23} h={0.02} pos={[0, 0.24, 0]} color="#f2d48a" seg={20} />
          <Blok size={[0.34, 0.03, 0.05]} pos={[0.42, 0.22, 0]} color="#2f3634" r={0.01} />
          {[-0.08, 0, 0.08].map((x, i) => (
            <Cil key={i} r={0.008} h={0.36} pos={[x, 0.36, (i - 1) * 0.05]} rot={[0.3, 0, 0.25 - i * 0.25]} color="#f2d48a" seg={4} />
          ))}
        </group>
      </Deel>
      {/* recept op een standaard */}
      <Deel id="recept" uit={[0, 0.5, 0.45]} label="Recept: 4 personen, 300 g">
        <group position={[0.45, 0.94, -0.05]} rotation={[-0.25, -0.15, 0]}>
          <Blok size={[0.62, 0.46, 0.03]} pos={[0, 0.25, 0]} color="#fbf6ea" r={0.01} />
          <Label regels={['Pasta', 'voor 4 personen', '300 g pasta']} breed={0.58} hoog={0.42} pos={[0, 0.25, 0.017]} bg="#fbf6ea" rand="#3d7cc9" vet={0} />
        </group>
      </Deel>
      {/* pakken pasta */}
      {[0, 1].map((i) => (
        <group key={i} position={[0.88, 0.92, 0.22 - i * 0.02]} rotation={[0, -0.3 + i * 0.5, 0]}>
          <Blok size={[0.16, 0.26, 0.08]} pos={[0, 0.13 + i * 0.0, -i * 0.12]} color="#f2c24a" r={0.02} />
          <Bordje regels={['PASTA']} breed={0.14} hoog={0.06} pos={[0, 0.16, 0.041 - i * 0.12]} bg="#f2c24a" fg="#7a3b1f" rand={null} />
        </group>
      ))}
      {/* bord met de verhoudingstabel */}
      <Tekenbord
        breed={1.7}
        hoog={0.9}
        pos={[0, 0, -0.55]}
        poten={1.05}
        sleutel="w3-instr-tabel"
        teken={(ctx, w, h) => {
          krijtAchtergrond(ctx, w, h);
          schrijf(ctx, 'Verhoudingstabel', w / 2, h * 0.13, h * 0.12, '#f2d04a', { gewicht: 700, uitlijn: 'center' });
          const x0 = w * 0.06;
          const kol = [w * 0.36, w * 0.56, w * 0.76, w * 0.96];
          const y1 = h * 0.42;
          const y2 = h * 0.74;
          ctx.strokeStyle = KLEUR.krijtLijn;
          ctx.lineWidth = 5;
          ctx.strokeRect(x0, h * 0.27, w * 0.9, h * 0.62);
          ctx.beginPath();
          ctx.moveTo(x0, h * 0.58);
          ctx.lineTo(x0 + w * 0.9, h * 0.58);
          for (const k of kol.slice(0, 3)) {
            ctx.moveTo(k, h * 0.27);
            ctx.lineTo(k, h * 0.89);
          }
          ctx.stroke();
          schrijf(ctx, 'personen', x0 + w * 0.02, y1, h * 0.1, KLEUR.krijtLijn);
          schrijf(ctx, 'pasta (g)', x0 + w * 0.02, y2, h * 0.1, KLEUR.krijtLijn);
          const mid = (i: number) => (kol[i] + (i < 2 ? kol[i + 1] : x0 + w * 0.9)) / 2;
          schrijf(ctx, '4', mid(0), y1, h * 0.13, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '2', mid(1), y1, h * 0.13, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '10', mid(2), y1, h * 0.13, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '300', mid(0), y2, h * 0.13, '#ffffff', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '?', mid(1), y2, h * 0.13, '#f2d04a', { gewicht: 700, uitlijn: 'center' });
          schrijf(ctx, '?', mid(2), y2, h * 0.13, '#f2d04a', { gewicht: 700, uitlijn: 'center' });
        }}
      />
    </group>
  );
}
