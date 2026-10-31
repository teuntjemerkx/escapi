// Eenhedentrap in de stijl van de rekenkaart uit het werkboek: groene tegels, bogen met × of :.
import { animate, stagger, svg } from 'animejs';
import { useLayoutEffect, useRef } from 'react';

const LADDERS: { eenheden: string[]; factor: number[] }[] = [
  { eenheden: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], factor: [10, 10, 10, 10, 10, 10] },
  { eenheden: ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'], factor: [100, 100, 100, 100, 100, 100] },
  { eenheden: ['km³', 'hm³', 'dam³', 'm³', 'dm³', 'cm³', 'mm³'], factor: [1000, 1000, 1000, 1000, 1000, 1000] },
  { eenheden: ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'], factor: [10, 10, 10, 10, 10, 10] },
  { eenheden: ['ton', 'kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], factor: [1000, 10, 10, 10, 10, 10, 10] },
];
const GELIJK: [string, string][] = [
  ['ml', 'cm³'],
  ['l', 'dm³'],
  ['kl', 'm³'],
];
const norm = (e: string) => (e === 'liter' ? 'l' : e);

export function trapInfo(vanR: string, naarR: string) {
  const van = norm(vanR);
  const naar = norm(naarR);
  const gelijk = GELIJK.find(([a, b]) => (a === van && b === naar) || (a === naar && b === van));
  if (gelijk) return { soort: 'gelijk' as const, van, naar };
  const ladder = LADDERS.find((l) => l.eenheden.includes(van) && l.eenheden.includes(naar));
  if (!ladder) return null;
  const i = ladder.eenheden.indexOf(van);
  const j = ladder.eenheden.indexOf(naar);
  const stappen: number[] = [];
  for (let k = Math.min(i, j); k < Math.max(i, j); k++) stappen.push(ladder.factor[k]);
  const totaal = stappen.reduce((a, b) => a * b, 1);
  return { soort: 'trap' as const, ladder, i, j, stappen, totaal, keer: j > i };
}

export function Trap({ van, naar, speel = true }: { van: string; naar: string; speel?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const info = trapInfo(van, naar);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !speel) return;
    const bogen = [...el.querySelectorAll<SVGPathElement>('.boog')];
    const factoren = [...el.querySelectorAll('.factor')];
    const tegels = [...el.querySelectorAll('.tegel')];
    animate(tegels, { opacity: [0, 1], duration: 400, delay: stagger(60), ease: 'outQuad' });
    if (bogen.length) {
      animate(svg.createDrawable(bogen), { draw: ['0 0', '0 1'], duration: 600, delay: stagger(450, { start: 350 }), ease: 'inOutQuad' });
      animate(factoren, { opacity: [0, 1], duration: 300, delay: stagger(450, { start: 650 }) });
    }
    const fiche = el.querySelector('.fiche');
    if (fiche && info?.soort === 'trap') {
      const xs = Array.from({ length: Math.abs(info.j - info.i) + 1 }, (_, n) => ((info.keer ? info.i + n : info.i - n) - startIndex(info)) * 72 + 32);
      animate(fiche, { cx: xs.map((x) => ({ to: x, duration: 450 })), delay: 350, ease: 'inOutQuad' });
    }
  }, [van, naar, speel]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!info) return null;
  if (info.soort === 'gelijk') {
    return (
      <div className="trap">
        <svg ref={ref} viewBox="0 0 240 50" role="img" aria-label={`1 ${info.van} is 1 ${info.naar}`}>
          <g className="tegel van" transform="translate(10 5)">
            <rect width="80" height="40" rx="8" />
            <text x="40" y="26" textAnchor="middle">1 {info.van}</text>
          </g>
          <text x="120" y="32" textAnchor="middle" style={{ font: '700 24px var(--font-ui)' }}>=</text>
          <g className="tegel naar" transform="translate(150 5)">
            <rect width="80" height="40" rx="8" />
            <text x="40" y="26" textAnchor="middle">1 {info.naar}</text>
          </g>
        </svg>
        <div className="samen">Het is even veel. Het getal blijft gelijk.</div>
      </div>
    );
  }
  const s = startIndex(info);
  const e = Math.min(info.ladder.eenheden.length - 1, Math.max(info.i, info.j) + 1);
  const zicht = info.ladder.eenheden.slice(s, e + 1);
  const breed = zicht.length * 72;
  const teken = info.keer ? '×' : ':';
  return (
    <div className="trap">
      <svg ref={ref} viewBox={`-4 -34 ${breed + 8} 92`} role="img" aria-label={`Van ${info.ladder.eenheden[info.i]} naar ${info.ladder.eenheden[info.j]}: ${teken} ${info.totaal}`}>
        {zicht.map((u, n) => {
          const k = s + n;
          const klas = k === info.i ? 'tegel van' : k === info.j ? 'tegel naar' : 'tegel';
          return (
            <g key={u} className={klas} transform={`translate(${n * 72} 10)`}>
              <rect width="64" height="40" rx="8" />
              <text x="32" y="26" textAnchor="middle">{u}</text>
            </g>
          );
        })}
        {info.stappen.map((f, n) => {
          const a = Math.min(info.i, info.j) - s + n;
          const x1 = a * 72 + 32;
          const x2 = x1 + 72;
          return (
            <g key={n}>
              <path className="boog" d={info.keer ? `M${x1} 8 Q${(x1 + x2) / 2} -22 ${x2} 8` : `M${x2} 8 Q${(x1 + x2) / 2} -22 ${x1} 8`} />
              <text className="factor" x={(x1 + x2) / 2} y={-14} textAnchor="middle">
                {teken} {f}
              </text>
            </g>
          );
        })}
        <circle className="fiche" cx={(info.i - s) * 72 + 32} cy={56} r={6} fill="#c2410c" />
      </svg>
      <div className="samen">
        {info.stappen.length > 1 ? `${info.stappen.map((f) => `${teken} ${f}`).join(' ')} = ${teken} ${info.totaal.toLocaleString('nl-NL')}` : `${teken} ${info.totaal.toLocaleString('nl-NL')}`}
      </div>
    </div>
  );
}

function startIndex(info: { i: number; j: number }) {
  return Math.max(0, Math.min(info.i, info.j) - 1);
}

/** Verhoudingstabel met pijlen boven en onder. */
export function VTabel({ boven, onder, pijl, speel = true }: { boven: (string | number)[]; onder: (string | number)[]; pijl?: string; speel?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !speel) return;
    animate(svg.createDrawable([...el.querySelectorAll<SVGPathElement>('.pijl')]), { draw: ['0 0', '0 1'], duration: 700, delay: stagger(250, { start: 200 }), ease: 'inOutQuad' });
    animate([...el.querySelectorAll('.pijltekst')], { opacity: [0, 1], duration: 300, delay: stagger(250, { start: 600 }) });
  }, [boven.join(), onder.join(), pijl, speel]); // eslint-disable-line react-hooks/exhaustive-deps
  const kol = 120;
  const w = boven.length * kol;
  return (
    <div className="vtabel">
      <svg ref={ref} viewBox={`-4 -36 ${w + 8} 172`} role="img" aria-label={`Verhoudingstabel ${pijl ?? ''}`}>
        {boven.map((b, i) => (
          <g key={i} transform={`translate(${i * kol} 0)`}>
            <rect x={4} y={0} width={kol - 8} height={46} rx={8} />
            <rect x={4} y={50} width={kol - 8} height={46} rx={8} />
            <text x={kol / 2} y={29} textAnchor="middle">{String(b)}</text>
            <text x={kol / 2} y={79} textAnchor="middle">{String(onder[i])}</text>
          </g>
        ))}
        {pijl && boven.length > 1 && (
          <>
            <path className="pijl" d={`M${kol / 2} -4 Q${kol} -34 ${kol * 1.5} -4`} />
            <path className="pijl" d={`M${kol * 1.5 - 8} -12 L${kol * 1.5} -4 L${kol * 1.5 - 10} -2`} />
            <text className="pijltekst" x={kol} y={-24} textAnchor="middle">{pijl}</text>
            <path className="pijl" d={`M${kol / 2} 100 Q${kol} 130 ${kol * 1.5} 100`} />
            <path className="pijl" d={`M${kol * 1.5 - 8} 108 L${kol * 1.5} 100 L${kol * 1.5 - 10} 98`} />
            <text className="pijltekst" x={kol} y={132} textAnchor="middle">{pijl}</text>
          </>
        )}
      </svg>
    </div>
  );
}
