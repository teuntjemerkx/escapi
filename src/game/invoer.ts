// Besturing: toetsenbord (WASD + pijltjes) en rondkijken met de muis of je vinger.
//
// Door je eigen ogen (eerste persoon) werkt het zoals in moderne games: één klik in beeld zet de muis "vast"
// (pointer lock) en daarna kijk je rond door alleen de muis te bewegen. Staat er een opdracht in je vizier, dan
// opent die klik (of E, of Enter) hem meteen: zie richten.ts. Esc maakt de muis vrij (voor de knoppen bovenin).
// Alle kijkbewegingen gaan via `kijk` en worden in Speler.tsx zacht verwerkt (geen schokken).
import { gebruikRicht, richt } from './richten';
import { cam, useSpel } from './store';

export const toetsen = new Set<string>();
let sleept = false;
let sleepAfstand = 0;
let laatsteX = 0;
let laatsteY = 0;
let actieveId: number | null = null;

/** Kijkbeweging die nog verwerkt moet worden (in radialen), zie Speler.tsx. */
export const kijk = { dx: 0, dy: 0 };
/** Staat de muis vast (rondkijken zonder slepen)? */
export const muisVast = { aan: false };

/** Was de laatste klik eigenlijk een sleepbeweging? Dan géén klik-actie uitvoeren. */
export const wasSlepen = () => sleepAfstand > 6;

const eersteLopen = () => {
  const s = useSpel.getState();
  return s.cameraStand === 'eerste' && s.modus === 'lopen' && !s.kaart;
};

export function koppelInvoer(canvas: HTMLElement) {
  if (import.meta.env.DEV) Object.assign(window as unknown as Record<string, unknown>, { __kijk: kijk, __muisVast: muisVast });
  const vergrendel = () => {
    if (document.pointerLockElement === canvas || !('requestPointerLock' in canvas)) return;
    try {
      const p = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      p?.catch?.(() => {});
    } catch {
      /* niet toegestaan (bijvoorbeeld in een frame): dan gewoon slepen */
    }
  };
  const neer = (e: PointerEvent) => {
    sleept = true;
    sleepAfstand = 0;
    laatsteX = e.clientX;
    laatsteY = e.clientY;
    actieveId = e.pointerId;
    // één klik in beeld zet de muis vast (je hoeft niet eerst te slepen)
    if (e.pointerType === 'mouse' && e.button === 0 && eersteLopen()) vergrendel();
  };
  const beweeg = (e: PointerEvent) => {
    if (muisVast.aan) return; // dan regelt `vastBeweeg` het
    if (!sleept || e.pointerId !== actieveId) return;
    const dx = e.clientX - laatsteX;
    const dy = e.clientY - laatsteY;
    laatsteX = e.clientX;
    laatsteY = e.clientY;
    const was = sleepAfstand;
    sleepAfstand += Math.abs(dx) + Math.abs(dy);
    if (useSpel.getState().modus !== 'lopen' || sleepAfstand < 4) return;
    // door je eigen ogen met de muis: vanaf nu staat de muis vast en kijk je vrij rond
    if (e.pointerType === 'mouse' && eersteLopen() && was < 4) vergrendel();
    const vinger = e.pointerType === 'touch' ? 1.35 : 1;
    kijk.dx += dx * 0.0052 * vinger;
    kijk.dy += dy * 0.0046 * vinger;
  };
  const vastBeweeg = (e: MouseEvent) => {
    if (!muisVast.aan || !eersteLopen()) return;
    kijk.dx += e.movementX * 0.0023;
    kijk.dy += e.movementY * 0.0021;
  };
  const op = (e: PointerEvent) => {
    if (e.pointerId === actieveId) sleept = false;
  };
  // Muis vast: een klik kiest wat midden in beeld staat (we sturen de klik naar het midden van het beeld).
  const midden = (type: string, e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const init = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: e.button, buttons: e.buttons };
    canvas.dispatchEvent(type === 'click' ? new MouseEvent('click', init) : new PointerEvent(type, { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  };
  const vang = (e: MouseEvent) => {
    if (!muisVast.aan || !e.isTrusted) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    sleepAfstand = 0;
    // staat er een opdracht in je vizier? Dan opent de klik die (meteen, zonder Esc)
    if (richt.actie) {
      if (e.type === 'click') gebruikRicht();
      return;
    }
    midden(e.type, e);
  };
  // Muis (nog) niet vast, of tikken op een tablet: een klik of tik in beeld opent ook wat in je vizier staat.
  const vrijeKlik = (e: MouseEvent) => {
    if (muisVast.aan || !e.isTrusted || wasSlepen() || !eersteLopen() || !richt.actie) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    gebruikRicht();
  };
  const wiel = (e: WheelEvent) => {
    if (useSpel.getState().modus !== 'lopen') return;
    cam.afstand = Math.max(5, Math.min(20, cam.afstand + e.deltaY * 0.01));
  };
  const lockWissel = () => {
    muisVast.aan = document.pointerLockElement === canvas;
    // de knoppen bovenin zijn dan even niet te klikken: dat laten we zien (zie styles.css)
    document.body.classList.toggle('muis-vast', muisVast.aan);
    window.dispatchEvent(new Event('muisvast'));
  };
  // een opdracht of kaart open? dan de muis weer vrij
  const stop = useSpel.subscribe((s) => {
    if (muisVast.aan && (s.modus !== 'lopen' || s.kaart || s.cameraStand !== 'eerste')) document.exitPointerLock?.();
  });
  canvas.addEventListener('pointerdown', vang as EventListener, true);
  canvas.addEventListener('pointerup', vang as EventListener, true);
  canvas.addEventListener('click', vang, true);
  canvas.addEventListener('click', vrijeKlik, true);
  canvas.addEventListener('pointerdown', neer);
  window.addEventListener('pointermove', beweeg);
  document.addEventListener('mousemove', vastBeweeg);
  window.addEventListener('pointerup', op);
  window.addEventListener('pointercancel', op);
  canvas.addEventListener('wheel', wiel, { passive: true });
  document.addEventListener('pointerlockchange', lockWissel);

  const kd = (e: KeyboardEvent) => {
    const doel = e.target as HTMLElement | null;
    if (doel && (doel.tagName === 'INPUT' || doel.tagName === 'TEXTAREA' || doel.isContentEditable)) return;
    const k = e.key.toLowerCase();
    // E of Enter: gebruik wat in je vizier staat
    if ((k === 'e' || k === 'enter') && !e.repeat && eersteLopen() && richt.actie) {
      if (doel && doel.tagName === 'BUTTON') return;
      e.preventDefault();
      gebruikRicht();
      return;
    }
    toetsen.add(k);
  };
  const ku = (e: KeyboardEvent) => toetsen.delete(e.key.toLowerCase());
  const blur = () => toetsen.clear();
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  window.addEventListener('blur', blur);
  return () => {
    stop();
    document.body.classList.remove('muis-vast');
    canvas.removeEventListener('pointerdown', vang as EventListener, true);
    canvas.removeEventListener('pointerup', vang as EventListener, true);
    canvas.removeEventListener('click', vang, true);
    canvas.removeEventListener('click', vrijeKlik, true);
    canvas.removeEventListener('pointerdown', neer);
    window.removeEventListener('pointermove', beweeg);
    document.removeEventListener('mousemove', vastBeweeg);
    window.removeEventListener('pointerup', op);
    window.removeEventListener('pointercancel', op);
    canvas.removeEventListener('wheel', wiel);
    document.removeEventListener('pointerlockchange', lockWissel);
    window.removeEventListener('keydown', kd);
    window.removeEventListener('keyup', ku);
    window.removeEventListener('blur', blur);
  };
}

/** Looprichting uit de toetsen. Door je eigen ogen zijn pijltje links/rechts om te draaien (zie `draaiUitToetsen`). */
export function richtingUitToetsen(): [number, number] {
  const fp = useSpel.getState().cameraStand === 'eerste';
  let x = 0;
  let z = 0;
  if (toetsen.has('w') || toetsen.has('arrowup')) z -= 1;
  if (toetsen.has('s') || toetsen.has('arrowdown')) z += 1;
  if (toetsen.has('a') || (!fp && toetsen.has('arrowleft'))) x -= 1;
  if (toetsen.has('d') || (!fp && toetsen.has('arrowright'))) x += 1;
  return [x, z];
}

/** Draaien met de toetsen (door je eigen ogen): pijltje links/rechts. −1 = links, 1 = rechts. (E is nu "gebruiken".) */
export function draaiUitToetsen(): number {
  if (useSpel.getState().cameraStand !== 'eerste') return 0;
  let r = 0;
  if (toetsen.has('arrowleft')) r -= 1;
  if (toetsen.has('arrowright')) r += 1;
  return r;
}
