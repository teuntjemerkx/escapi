// Hulpmiddelen naast het rekenpaneel: de rekenkaart (formules en de eenhedentrap, zoals de rekenkaart van het
// werkboek) en een eenvoudige rekenmachine. De docent kan de rekenmachine uitzetten.
import { BookOpen, Calculator, Delete, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSpel } from '../game/store';
import { geluid } from '../lib/geluid';
import { nl } from '../lib/getal';
import { reken, tokens } from '../lib/reken';
import { huidig } from '../werelden';
import { Trap } from './Trap';

/** Twee knoppen in de kop van het rekenpaneel. */
export function HulpKnoppen() {
  const hulp = useSpel((s) => s.hulp);
  const machine = useSpel((s) => s.rekenmachine);
  const zet = (h: 'kaart' | 'machine') => {
    geluid('klik');
    useSpel.getState().setHulp(hulp === h ? null : h);
  };
  return (
    <div className="hulp-knoppen">
      <button className="knop licht rond klein" aria-pressed={hulp === 'kaart'} aria-label="Rekenkaart" title="Rekenkaart" onClick={() => zet('kaart')}>
        <BookOpen size={20} />
      </button>
      {machine && (
        <button className="knop licht rond klein" aria-pressed={hulp === 'machine'} aria-label="Rekenmachine" title="Rekenmachine" onClick={() => zet('machine')}>
          <Calculator size={20} />
        </button>
      )}
    </div>
  );
}

/** De kaart die openligt (naast het paneel). */
export function HulpKaart() {
  const hulp = useSpel((s) => s.hulp);
  const machine = useSpel((s) => s.rekenmachine);
  if (!hulp || (hulp === 'machine' && !machine)) return null;
  const sluit = () => useSpel.getState().setHulp(null);
  return (
    <div className={`hulp-kaart ${hulp}`} role="dialog" aria-label={hulp === 'kaart' ? 'Rekenkaart' : 'Rekenmachine'}>
      <div className="hulp-kop">
        {hulp === 'kaart' ? <BookOpen size={20} /> : <Calculator size={20} />}
        <strong>{hulp === 'kaart' ? 'Rekenkaart' : 'Rekenmachine'}</strong>
        <button className="knop licht rond klein" aria-label="Sluiten" onClick={sluit}>
          <X size={18} />
        </button>
      </div>
      {hulp === 'kaart' ? <Rekenkaart /> : <Rekenmachine />}
    </div>
  );
}

/** Alle eenhedentrappen, zoals op de rekenkaart van het werkboek. */
const TRAPPEN: [string, string, string][] = [
  ['Lengte', 'km', 'mm'],
  ['Oppervlakte', 'km²', 'mm²'],
  ['Inhoud', 'km³', 'mm³'],
  ['Inhoud in liters', 'kl', 'ml'],
  ['Gewicht', 'ton', 'mg'],
];

function Rekenkaart() {
  const def = huidig();
  const [trap, setTrap] = useState(0);
  return (
    <div className="hulp-inhoud">
      <h3>Dit moet je weten</h3>
      <ul className="kaart-lijst">
        {def.samenvatting.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      <h3>{def.gereedschap.naam}</h3>
      <p className="stil">{def.gereedschap.uitleg}</p>
      {def.gereedschap.soort === 'trap' && (
        <>
          <div className="weergave" role="tablist">
            {TRAPPEN.map(([naam], i) => (
              <button key={naam} aria-pressed={trap === i} onClick={() => setTrap(i)}>
                {naam}
              </button>
            ))}
          </div>
          <Trap key={trap} van={TRAPPEN[trap][1]} naar={TRAPPEN[trap][2]} />
          <p className="stil">1 l = 1 dm³ · 1 ml = 1 cm³ · 1 kl = 1 m³</p>
        </>
      )}
      <h3>Zo pak je het aan</h3>
      <ol className="kaart-lijst">
        <li>Lees de vraag. Wat wil je weten?</li>
        <li>Zoek de getallen en de eenheden.</li>
        <li>Zijn de eenheden gelijk? Zo niet: eerst omrekenen.</li>
        <li>Reken uit. Schrijf je stappen op.</li>
        <li>Klopt het? Kijk of je antwoord kan.</li>
      </ol>
    </div>
  );
}

const TOETSEN = ['7', '8', '9', ':', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'];

function Rekenmachine() {
  const [som, setSom] = useState('');
  const [uitkomst, setUitkomst] = useState<string | null>(null);
  const [vorige, setVorige] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const druk = (t: string) => {
    geluid('klik');
    if (t === '=') {
      const toks = tokens(som.replace(/−/g, '-'));
      const v = toks ? reken(toks) : null;
      if (v === null) {
        setUitkomst('Fout');
        return;
      }
      const r = nl(Math.round(v * 1e8) / 1e8, 6);
      setUitkomst(r);
      setVorige((l) => [`${som} = ${r}`, ...l].slice(0, 4));
      setSom(r.replace(/\./g, ''));
      return;
    }
    setUitkomst(null);
    if (t === 'C') return setSom('');
    if (t === '⌫') return setSom((x) => x.slice(0, -1));
    setSom((x) => x + t);
  };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const toets = (e: KeyboardEvent) => {
      const k = e.key;
      const map: Record<string, string> = { '*': '×', x: '×', '/': ':', '-': '−', '.': ',', Enter: '=', Backspace: '⌫', Escape: 'C', Delete: 'C' };
      const t = map[k] ?? k;
      if (/^[0-9]$/.test(t) || ['+', '−', '×', ':', ',', '(', ')', '=', '⌫', 'C'].includes(t)) {
        e.preventDefault();
        e.stopPropagation();
        druk(t);
      }
    };
    el.addEventListener('keydown', toets);
    return () => el.removeEventListener('keydown', toets);
  });
  return (
    <div className="hulp-inhoud" ref={ref} tabIndex={0}>
      <div className="rm-scherm" aria-live="polite">
        <div className="rm-som">{som || '0'}</div>
        {uitkomst !== null && <div className="rm-uit">= {uitkomst}</div>}
      </div>
      <div className="rm-toetsen">
        <button className="rm-toets grijs" onClick={() => druk('C')}>
          C
        </button>
        <button className="rm-toets grijs" onClick={() => druk('(')}>
          (
        </button>
        <button className="rm-toets grijs" onClick={() => druk(')')}>
          )
        </button>
        <button className="rm-toets grijs" aria-label="Wissen" onClick={() => druk('⌫')}>
          <Delete size={20} />
        </button>
        {TOETSEN.map((t) => (
          <button key={t} className={`rm-toets${'+−×:'.includes(t) ? ' op' : ''}${t === '=' ? ' is' : ''}`} onClick={() => druk(t)}>
            {t}
          </button>
        ))}
      </div>
      {vorige.length > 0 && (
        <div className="rm-vorige">
          {vorige.map((v, i) => (
            <div key={i}>{v}</div>
          ))}
        </div>
      )}
      <p className="stil">Schrijf je berekening ook op. Dan zie je waar het mis kan gaan.</p>
    </div>
  );
}
