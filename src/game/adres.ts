// Het webadres volgt het spel: zonder # ben je op de beginpagina, met #wereld-3 in Wereld 3.
// Zo werkt de terugknop van de browser, en kan een docent een link naar één wereld delen.
import { useSpel, wereldUitAdres } from './store';

function zet(hash: string, nieuweStap: boolean) {
  const url = location.pathname + location.search + hash;
  try {
    if (nieuweStap) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  } catch {
    /* in een afgeschermd frame mag dit soms niet: het spel werkt gewoon door */
  }
}

export function koppelAdres() {
  useSpel.subscribe((s, oud) => {
    if (s.begin === oud.begin && s.wereld === oud.wereld) return;
    const hash = s.begin ? '' : `#wereld-${s.wereld}`;
    if (location.hash === hash) return;
    // van de beginpagina een wereld in: een nieuwe stap, zodat "terug" weer op de beginpagina uitkomt
    zet(hash, oud.begin && !s.begin);
  });
  window.addEventListener('popstate', () => {
    const nr = wereldUitAdres();
    const s = useSpel.getState();
    if (!nr) {
      if (!s.begin) s.naarBegin();
    } else if (s.begin || s.wereld !== nr) s.speel(nr);
  });
}
