// Het maatje op het scherm: portret, de knop "vraag het maatje", de kop van een kaart en het startgesprek.
import { animate, stagger } from 'animejs';
import { Ghost } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { hintTekst, maatjeVan, useMaatje, zeg } from '../game/maatje';
import { useSpel } from '../game/store';
import { geluid } from '../lib/geluid';
import { huidig } from '../werelden';

/** Foto van het maatje (van wereld `nr`, standaard de huidige). */
export function Portret({ nr, grootte = 56, zweef = true }: { nr?: number; grootte?: number; zweef?: boolean }) {
  const wereld = useSpel((s) => s.wereld);
  const fotos = useMaatje((s) => s.fotos);
  const url = fotos[nr ?? wereld] ?? fotos[0];
  return (
    <span className={`portret${zweef ? ' zweeft' : ''}`} style={{ width: grootte, height: grootte }}>
      {url ? <img src={url} alt="" width={grootte} height={grootte} /> : <Ghost size={grootte * 0.6} />}
    </span>
  );
}

/** Ronde knop linksonder: tik en het maatje zegt wat je nu moet doen. */
export function MaatjeKnop() {
  const modus = useSpel((s) => s.modus);
  const kaart = useSpel((s) => s.kaart);
  const praat = useMaatje((s) => !!s.spraak);
  if (modus !== 'lopen' || kaart) return null;
  const m = maatjeVan();
  return (
    <button
      className={`maatje-knop${praat ? ' praat' : ''}`}
      aria-label={`Vraag ${m.naam} wat je moet doen`}
      title={`Vraag ${m.naam}`}
      onClick={() => {
        geluid('klik');
        zeg(hintTekst(), 'hint');
      }}
    >
      <Portret grootte={58} />
      <span className="maatje-knop-naam">{m.naam}</span>
    </button>
  );
}

/** Kop van een kaart: het maatje zegt de titel. */
export function MaatjeKop({ children }: { children: ReactNode }) {
  const m = maatjeVan();
  return (
    <div className="maatje-kop" style={{ ['--maatje-kleur' as string]: m.kleur }}>
      <Portret grootte={64} />
      <div className="maatje-kop-tekst">
        <span className="maatje-naam">{m.naam} zegt:</span>
        <h2>{children}</h2>
      </div>
    </div>
  );
}

/** Startgesprek: het maatje stelt zich voor en legt de wereld uit, pagina voor pagina. Daarna de missie. */
export function StartGesprek({ terug, slot }: { terug: boolean; slot: ReactNode }) {
  const def = huidig();
  const m = maatjeVan(def);
  const paginas = terug ? [[`Welkom terug in ${def.naam}!`, 'We gaan verder waar je was gebleven.']] : m.intro;
  const [p, setP] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const laatste = p >= paginas.length;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    animate(el.querySelectorAll('.gesprek-regel'), { opacity: [0, 1], translateY: [8, 0], duration: 380, delay: stagger(520), ease: 'outQuad' });
    if (p > 0) geluid('praat');
  }, [p]);
  return (
    <div className="gesprek" ref={ref} style={{ ['--maatje-kleur' as string]: m.kleur }}>
      <div className="gesprek-kop">
        <Portret grootte={72} />
        <div>
          <div className="wereld-label">Wereld {def.nr}</div>
          <h1>{def.naam}</h1>
          <p className="onderwerp">
            {m.naam}, {m.wie}
          </p>
        </div>
      </div>
      {!laatste ? (
        <>
          <div className="gesprek-ballon">
            {paginas[p].map((r, i) => (
              <p key={`${p}-${i}`} className="gesprek-regel">
                {r}
              </p>
            ))}
          </div>
          <div className="knoppen">
            <button className="knop" autoFocus onClick={() => (geluid('klik'), setP(p + 1))}>
              Verder
            </button>
            <button className="knop licht" onClick={() => (geluid('klik'), setP(paginas.length))}>
              Overslaan
            </button>
            <span className="gesprek-stip" aria-hidden>
              {paginas.map((_, i) => (
                <i key={i} className={i === p ? 'nu' : ''} />
              ))}
            </span>
          </div>
        </>
      ) : (
        slot
      )}
    </div>
  );
}

export function useMaatjeNaam() {
  return maatjeVan().naam;
}
