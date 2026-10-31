// Het merk Escaπ: het woord "Esca" met het π-teken als deur waar licht door naar buiten valt, en het webadres.
import { useId } from 'react';

/** Het adres waarop het spel online staat. Draait het spel op een echt webadres, dan tonen we dat adres. */
export const DOMEIN = 'escapi.vercel.app';
export function domein() {
  try {
    const { hostname, protocol } = location;
    if (/^https?:$/.test(protocol) && hostname && !/^(localhost|127\.|0\.0\.0\.0|\[)/.test(hostname) && !/claude|anthropic|usercontent|sandbox/.test(hostname)) return hostname;
  } catch {
    /* geen adres beschikbaar */
  }
  return DOMEIN;
}

/** Het π-teken als deur: tussen de poten valt licht naar buiten. */
export function PiTeken({ className = 'pi' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset="0.55" stopColor="#ffb25c" />
          <stop offset="1" stopColor="#ff7a2f" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ffd894" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0.95" />
        </linearGradient>
        <filter id={`${id}b`} x="-40%" y="-20%" width="180%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* het licht in de deuropening */}
      <rect className="pi-licht" x="43" y="25" width="19" height="75" fill={`url(#${id}l)`} filter={`url(#${id}b)`} />
      <g fill={`url(#${id}g)`}>
        <path d="M5 27 C5 13 12 6 24 6 H90 a6 6 0 0 1 6 6 v6 a6 6 0 0 1 -6 6 H24 C17 24 13 27 10 33 Z" />
        <path d="M27 23 H43 V60 C43 77 40 89 33 97 Q30 100 26 98 Q22 96 24 91 C28 81 27 71 27 59 Z" />
        <path d="M62 23 H78 V77 C78 84 81 87 85 87 Q89 87 92 84 L96 87 C92 95 86 99 79 99 C68 99 62 91 62 79 Z" />
      </g>
    </svg>
  );
}

/** Het woordmerk: "Esca" + het π-teken. */
export function Merk({ groot = false }: { groot?: boolean }) {
  return (
    <span className={`merk${groot ? ' groot' : ''}`} role="img" aria-label="Escaπ">
      <span className="merk-woord" aria-hidden>
        Esca
      </span>
      <span className="merk-pi" aria-hidden>
        <PiTeken />
      </span>
    </span>
  );
}
