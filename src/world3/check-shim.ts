// Alleen voor check.ts in node: een nep-canvas zodat modules die bij het laden een textuur tekenen niet stoppen.
// Gebruik: esbuild ... --inject:src/world3/check-shim.ts
const g = globalThis as unknown as Record<string, unknown>;
if (!g.document) {
  const niets: object = new Proxy(() => niets, { get: (_t, k) => (k === 'measureText' ? () => ({ width: 10 }) : k === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : niets), apply: () => niets, set: () => true });
  const canvas = () => ({ width: 1, height: 1, style: {}, getContext: () => niets, toDataURL: () => '', addEventListener: () => {} });
  g.document = { createElement: canvas, createElementNS: canvas, addEventListener: () => {}, body: {} };
  g.navigator ??= { userAgent: 'node' };
  g.requestAnimationFrame ??= () => 0;
  g.cancelAnimationFrame ??= () => {};
}
export {};
