// Confetti bij een open kluis, een gevonden code of de open poort.
import { animate } from 'animejs';
import { useEffect, useRef } from 'react';
import { useSpel } from '../game/store';

const KLEUREN = ['#ff8a3d', '#ffd24a', '#5fe0a1', '#5aa9ff', '#c3b1ff', '#2ec4b6', '#ffffff'];

export function Feest() {
  const feest = useSpel((s) => s.feest);
  const laag = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = laag.current;
    if (!el || !feest.n) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const n = feest.groot ? 110 : 36;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const stukjes: HTMLDivElement[] = [];
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      d.style.background = KLEUREN[i % KLEUREN.length];
      d.style.left = `${w / 2}px`;
      d.style.top = `${h * (feest.groot ? 0.42 : 0.5)}px`;
      if (i % 3 === 0) d.style.borderRadius = '50%';
      el.appendChild(d);
      stukjes.push(d);
    }
    const anims = stukjes.map((d) => {
      const hoek = Math.random() * Math.PI * 2;
      const kracht = (feest.groot ? 260 : 150) + Math.random() * (feest.groot ? 320 : 160);
      return animate(d, {
        translateX: [0, Math.cos(hoek) * kracht],
        translateY: [0, Math.sin(hoek) * kracht * 0.7 + 260 + Math.random() * 140],
        rotate: [0, (Math.random() - 0.5) * 900],
        opacity: [1, 0],
        duration: 1500 + Math.random() * 900,
        ease: 'outCubic',
      });
    });
    const t = setTimeout(() => stukjes.forEach((d) => d.remove()), 2600);
    return () => {
      clearTimeout(t);
      anims.forEach((a) => a.pause());
      stukjes.forEach((d) => d.remove());
    };
  }, [feest]);
  return <div ref={laag} className="feest" aria-hidden="true" />;
}
