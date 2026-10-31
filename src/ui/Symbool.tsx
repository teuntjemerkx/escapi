// Symbolen van de kluiscodes (zelfde vormen als op de kluis in 3D).
export function Symbool({ i, kleur, size = 24 }: { i: number; kleur: string; size?: number }) {
  const v = i % 4;
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true" style={{ flex: 'none' }}>
      {v === 0 && <polygon points="0,-10 9.5,7.2 -9.5,7.2" fill={kleur} />}
      {v === 1 && <circle r="8.6" fill={kleur} />}
      {v === 2 && <rect x="-7.6" y="-7.6" width="15.2" height="15.2" fill={kleur} />}
      {v === 3 && (
        <polygon
          fill={kleur}
          points={Array.from({ length: 10 }, (_, k) => {
            const r = k % 2 ? 4.2 : 10;
            const a = -Math.PI / 2 + (k * Math.PI) / 5;
            return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
          }).join(' ')}
        />
      )}
    </svg>
  );
}

export const SYMBOOL_NAMEN = ['driehoek', 'rondje', 'vierkant', 'ster'];
