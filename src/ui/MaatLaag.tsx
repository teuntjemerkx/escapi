// SVG-laag over het 3D-beeld: maatlijnen met getallen. Anime.js tekent de lijnen in
// (stroke-dashoffset via svg.createDrawable) en laat de labels één voor één verschijnen.
import { animate, stagger, svg } from 'animejs';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { opMatenVeranderd, reg, type MaatInfo } from '../game/inspectie';
import { useSpel } from '../game/store';

const v = new THREE.Vector3();

function projecteer(o: THREE.Object3D, w: number, h: number): [number, number, boolean] {
  if (!reg.camera) return [0, 0, false];
  v.setFromMatrixPosition(o.matrixWorld).project(reg.camera);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h, v.z < 1 && v.z > -1];
}

export function MaatLaag() {
  const [maten, setMaten] = useState<MaatInfo[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const gekozenDeel = useSpel((s) => s.gekozenDeel);

  useEffect(() => opMatenVeranderd(() => setMaten([...reg.maten.values()])), []);

  // Nieuwe maatlijnen intekenen.
  const getekend = useRef(new Set<number>());
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const nieuw = maten.filter((m) => !getekend.current.has(m.key));
    nieuw.forEach((m) => getekend.current.add(m.key));
    if (!nieuw.length) return;
    const lijnen = nieuw.flatMap((m) => [...el.querySelectorAll(`[data-maat="${m.key}"] line`)]);
    const labels = nieuw.map((m) => el.querySelector(`[data-maat="${m.key}"] .label-binnen`)).filter(Boolean) as Element[];
    const tekenbaar = svg.createDrawable(lijnen as SVGLineElement[]);
    animate(tekenbaar, { draw: ['0 0', '0 1'], duration: 900, delay: stagger(110), ease: 'inOutQuad' });
    animate(labels, { opacity: [0, 1], scale: [0.6, 1], duration: 500, delay: stagger(110, { start: 500 }), ease: 'outBack' });
  }, [maten]);

  // Elke frame: posities bijwerken.
  useEffect(() => {
    let id = 0;
    const lus = () => {
      id = requestAnimationFrame(lus);
      const el = svgRef.current;
      const canvas = reg.canvas;
      if (!el || !canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      el.setAttribute('viewBox', `0 0 ${w} ${h}`);
      for (const m of reg.maten.values()) {
        const g = el.querySelector<SVGGElement>(`[data-maat="${m.key}"]`);
        if (!g) continue;
        const [x1, y1, ok1] = projecteer(m.a, w, h);
        const [x2, y2, ok2] = projecteer(m.b, w, h);
        g.style.display = ok1 && ok2 ? '' : 'none';
        const dx = x2 - x1;
        const dy = y2 - y1;
        const l = Math.hypot(dx, dy) || 1;
        const nx = (-dy / l) * 9;
        const ny = (dx / l) * 9;
        const [hoofd, t1, t2] = g.querySelectorAll('line');
        hoofd.setAttribute('x1', `${x1}`);
        hoofd.setAttribute('y1', `${y1}`);
        hoofd.setAttribute('x2', `${x2}`);
        hoofd.setAttribute('y2', `${y2}`);
        t1.setAttribute('x1', `${x1 - nx}`);
        t1.setAttribute('y1', `${y1 - ny}`);
        t1.setAttribute('x2', `${x1 + nx}`);
        t1.setAttribute('y2', `${y1 + ny}`);
        t2.setAttribute('x1', `${x2 - nx}`);
        t2.setAttribute('y1', `${y2 - ny}`);
        t2.setAttribute('x2', `${x2 + nx}`);
        t2.setAttribute('y2', `${y2 + ny}`);
        const label = g.querySelector<SVGGElement>('.label');
        label?.setAttribute('transform', `translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})`);
      }
    };
    lus();
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg ref={svgRef} className="maatlaag" aria-hidden="true">
      {maten.map((m) => {
        const actief = !gekozenDeel || !m.deel || m.deel === gekozenDeel;
        const breed = m.label.length * 11 + 22;
        return (
          <g key={m.key} data-maat={m.key} className={actief ? 'maat' : 'maat gedimd'} style={{ ['--maatkleur' as string]: m.kleur ?? 'var(--maat)' }}>
            <line className="maatlijn" />
            <line className="maattik" />
            <line className="maattik" />
            <g className="label">
              <g className="label-binnen">
                <rect x={-breed / 2} y={-17} width={breed} height={34} rx={17} />
                <text textAnchor="middle" dominantBaseline="central">
                  {m.label}
                </text>
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
