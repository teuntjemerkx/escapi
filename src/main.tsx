import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { cam, speler, useSpel } from './game/store';
import { alleWerelden, huidig, laadWerelden, stationsVan, wereldNr } from './werelden';
import { gaNaar } from './game/wereld-basis';
import { zetLaag } from './game/botsing';
import { maatjeScene } from './game/lagen';
import { koppelAdres } from './game/adres';
import './styles.css';

// Testhaakjes (alleen tijdens ontwikkelen): sneller screenshots maken.
if (import.meta.env.DEV) Object.assign(window, { __spel: useSpel, __speler: speler, __cam: cam, __stations: () => stationsVan(), __wereld: huidig, __gaNaar: (id: string) => gaNaar(stationsVan().find((s) => s.id === id)!), __maatjeScene: maatjeScene,
    __verdieping: (v: number) => {
      zetLaag(v);
      speler.verdieping = v;
    },
  });

laadWerelden().then(() => {
  // Bestaat de bewaarde wereld (nog) niet? Begin dan in de eerste wereld die wel laadt.
  if (!wereldNr(useSpel.getState().wereld)) {
    const nr = alleWerelden()[0]?.nr ?? 2;
    useSpel.setState({ wereld: nr, fase: useSpel.getState().fases[nr] ?? 'terugblik' });
  }
  koppelAdres();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
