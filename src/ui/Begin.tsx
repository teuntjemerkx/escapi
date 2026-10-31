// De beginpagina van Escaπ: het logo, het webadres en de vijf werelden. Klik op een wereld en je bent er.
// Achter alles staat een echt beeld van de wereld die je aanwijst; daaroverheen zweven rustig wat rekentekens.
import { animate, stagger } from 'animejs';
import { ArrowRight, Check, GraduationCap, KeyRound, Link2, Lock, Play, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { faseIndex } from '../game/voortgang';
import { maatjeVan } from '../game/maatje';
import { useSpel } from '../game/store';
import { geluid, stopAchtergrond } from '../lib/geluid';
import { wereldNr } from '../werelden';
import { PORTRET, WERELD_BEELD } from './beelden';
import { Kaarten } from './Hud';
import { domein, Merk } from './Merk';
import './begin.css';

const NAMEN: Record<number, [string, string]> = {
  1: ['De Haven', 'Eenheden en grootheden'],
  2: ['Het Spookkasteel', 'Oriëntatie in 2D en 3D'],
  3: ['De Markthal', 'Verhoudingen'],
  4: ['Het Winkelcentrum', 'Procenten'],
  5: ['De Controlekamer', 'Tabellen, grafieken en formules'],
};

/** Rustig zwevende rekentekens (een eenvoudig 2D-doek: kost bijna niets). */
function Tekens({ kleur }: { kleur: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const kleurRef = useRef(kleur);
  kleurRef.current = kleur;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const stil = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tekens = ['π', '×', '÷', '%', '²', '³', '√', '½', '¾', '=', '+', '−', ':', '∠', '≈'];
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const maat = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    };
    maat();
    const ro = new ResizeObserver(maat);
    ro.observe(c);
    const n = Math.round(Math.min(46, Math.max(18, (w * h) / 32000)));
    const deeltjes = Array.from({ length: n }, (_, i) => ({
      t: tekens[i % tekens.length],
      x: Math.random(),
      y: Math.random(),
      z: 0.25 + Math.random() * 0.75,
      r: (Math.random() - 0.5) * 0.6,
      dr: (Math.random() - 0.5) * 0.05,
      kleur: Math.random() < 0.22,
    }));
    const muis = { x: 0.5, y: 0.5, gx: 0.5, gy: 0.5 };
    const beweeg = (e: PointerEvent) => {
      muis.gx = e.clientX / Math.max(1, w);
      muis.gy = e.clientY / Math.max(1, h);
    };
    window.addEventListener('pointermove', beweeg, { passive: true });
    let raf = 0;
    let vorig = performance.now();
    const teken = (nu: number) => {
      const dt = Math.min(0.05, (nu - vorig) / 1000);
      vorig = nu;
      muis.x += (muis.gx - muis.x) * Math.min(1, dt * 2.5);
      muis.y += (muis.gy - muis.y) * Math.min(1, dt * 2.5);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const d of deeltjes) {
        if (!stil) {
          d.y -= dt * 0.012 * d.z;
          d.r += d.dr * dt;
          if (d.y < -0.08) {
            d.y = 1.08;
            d.x = Math.random();
          }
        }
        const px = d.x * w + (muis.x - 0.5) * -60 * d.z;
        const py = d.y * h + (muis.y - 0.5) * -36 * d.z;
        const grootte = 12 + 40 * d.z * d.z;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(d.r);
        ctx.font = `600 ${grootte}px Sora, Inter, system-ui, sans-serif`;
        ctx.globalAlpha = 0.04 + 0.13 * d.z * d.z;
        ctx.fillStyle = d.kleur ? kleurRef.current : '#fff3e2';
        ctx.fillText(d.t, 0, 0);
        ctx.restore();
      }
      raf = requestAnimationFrame(teken);
    };
    raf = requestAnimationFrame(teken);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', beweeg);
    };
  }, []);
  return <canvas ref={ref} className="begin-tekens" aria-hidden />;
}

type Stand = { nr: number; naam: string; onderwerp: string; maatje: string; wie: string; kleur: string; open: number; totaal: number; status: 'nieuw' | 'bezig' | 'klaar'; kan: boolean };

function useStanden(): Stand[] {
  const huidigNr = useSpel((s) => s.wereld);
  const fase = useSpel((s) => s.fase);
  const fases = useSpel((s) => s.fases);
  const kluizen = useSpel((s) => s.kluizen);
  return [1, 2, 3, 4, 5].map((nr) => {
    const def = wereldNr(nr);
    const m = def ? maatjeVan(def) : null;
    const f = nr === huidigNr ? fase : fases[nr];
    const totaal = def?.klussen.length ?? 0;
    const open = def ? def.klussen.filter((k) => kluizen[`${nr}:${k.id}`]).length : 0;
    const status = f === 'klaar' ? 'klaar' : (f && faseIndex(f) > 0) || open > 0 ? 'bezig' : 'nieuw';
    return {
      nr,
      naam: def?.naam ?? NAMEN[nr][0],
      onderwerp: NAMEN[nr][1],
      maatje: m?.naam ?? '',
      wie: m?.wie ?? '',
      kleur: m?.kleur ?? '#ffb25c',
      open,
      totaal,
      status,
      kan: !!def,
    };
  });
}

function WereldKaart({ w, actief, kies, wijs }: { w: Stand; actief: boolean; kies: (nr: number) => void; wijs: (nr: number) => void }) {
  const status = !w.kan ? 'In aanbouw' : w.status === 'klaar' ? 'Ontsnapt' : w.status === 'bezig' ? `${w.open} van ${w.totaal} kluizen` : 'Nieuw';
  return (
    <button
      className={`wk${actief ? ' aan' : ''} ${w.status}`}
      style={{ ['--kleur' as string]: w.kleur }}
      disabled={!w.kan}
      onPointerEnter={() => wijs(w.nr)}
      onFocus={() => wijs(w.nr)}
      onClick={() => kies(w.nr)}
      aria-label={`Wereld ${w.nr}: ${w.naam}, ${w.onderwerp}, met ${w.maatje}. ${status}. Speel.`}
    >
      <span className="wk-beeld" style={{ backgroundImage: `url(${WERELD_BEELD[w.nr]})` }} aria-hidden />
      <span className="wk-waas" aria-hidden />
      <span className="wk-kop" aria-hidden>
        <span className="wk-nr">{String(w.nr).padStart(2, '0')}</span>
        <span className="wk-status">
          {w.status === 'klaar' ? <Check size={14} /> : w.status === 'bezig' ? <KeyRound size={14} /> : <Sparkles size={14} />}
          {status}
        </span>
      </span>
      <span className="wk-onder" aria-hidden>
        <img className="wk-maatje" src={PORTRET[w.nr]} alt="" width={64} height={64} draggable={false} />
        <span className="wk-tekst">
          <strong>{w.naam}</strong>
          <span>{w.onderwerp}</span>
        </span>
      </span>
      <span className="wk-speel" aria-hidden>
        <Play size={22} fill="currentColor" />
      </span>
      <span className="wk-balk" aria-hidden>
        <i style={{ width: `${w.status === 'klaar' ? 100 : w.totaal ? (100 * w.open) / w.totaal : 0}%` }} />
      </span>
    </button>
  );
}

function HoeWerktHet({ sluit }: { sluit: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) animate(ref.current, { opacity: [0, 1], translateY: [16, 0], duration: 380, ease: 'outQuad' });
  }, []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && sluit();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [sluit]);
  const stappen = [
    ['Kies een wereld', 'Elke wereld is een onderdeel van je rekenwerkboek, met een eigen maatje dat je helpt.'],
    ['Zoek de opdrachten', 'Loop rond en open een opdracht. Bekijk het voorwerp van alle kanten en reken het uit.'],
    ['Kraak de kluizen', 'Goed gerekend? Dan krijg je een code. Met de codes gaan de kluizen open.'],
    ['Ontsnap', 'Alle kluizen open? Dan gaat de uitgang open en ben je de wereld uit.'],
  ];
  return (
    <div className="begin-modaal" onClick={(e) => e.target === e.currentTarget && sluit()}>
      <div className="begin-uitleg" ref={ref} role="dialog" aria-modal="true" aria-labelledby="hoe-titel">
        <button className="begin-sluit" onClick={sluit} aria-label="Sluiten">
          <X size={20} />
        </button>
        <h2 id="hoe-titel">Zo werkt Escaπ</h2>
        <ol>
          {stappen.map(([kop, tekst], i) => (
            <li key={kop}>
              <span className="stap-nr">{i + 1}</span>
              <div>
                <strong>{kop}</strong>
                <p>{tekst}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="begin-besturing">
          Lopen met <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> of de pijltjes, rondkijken door te slepen. Op een tablet tik je gewoon op de grond.
        </p>
      </div>
    </div>
  );
}

export function Beginpagina() {
  const standen = useStanden();
  const laatste = useSpel((s) => s.wereld);
  const geluidAan = useSpel((s) => s.geluid);
  const kaart = useSpel((s) => s.kaart);
  const heeftVoortgang = standen.some((w) => w.status !== 'nieuw');
  const [focus, setFocus] = useState(laatste);
  const [uitleg, setUitleg] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);
  const [weg, setWeg] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const adres = domein();
  const f = standen.find((w) => w.nr === focus) ?? standen[0];

  useEffect(() => {
    document.title = 'Escaπ · de reken-escaperoom';
    stopAchtergrond();
    if (document.pointerLockElement) document.exitPointerLock?.();
  }, []);

  // binnenkomen: alles komt rustig na elkaar in beeld
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    animate(el.querySelectorAll('.in'), { opacity: [0, 1], translateY: [18, 0], duration: 700, delay: stagger(90, { start: 120 }), ease: 'outCubic' });
    animate(el.querySelectorAll('.wk'), { opacity: [0, 1], translateY: [36, 0], duration: 760, delay: stagger(70, { start: 520 }), ease: 'outCubic' });
    animate(el.querySelectorAll('.merk.groot .merk-pi'), { opacity: [0, 1], translateY: [-22, 0], duration: 900, delay: 420, ease: 'outBack' });
  }, []);

  const kies = (nr: number) => {
    if (weg) return;
    geluid('woesj');
    setWeg(true);
    setFocus(nr);
    const el = ref.current;
    const verder = () => useSpel.getState().speel(nr);
    if (!el) return verder();
    animate(el, { opacity: [1, 0], scale: [1, 1.035], duration: 520, ease: 'inQuad', onComplete: verder });
  };

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(`https://${adres}`);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 1800);
    } catch {
      /* geen klembord (bijvoorbeeld in een frame): niets aan de hand */
    }
  };

  return (
    <div className="begin" ref={ref} style={{ ['--kleur' as string]: f.kleur }}>
      <div className="begin-decor" aria-hidden>
        {standen.map((w) => (
          <span key={w.nr} className={`begin-foto${w.nr === focus ? ' aan' : ''}`} style={{ backgroundImage: `url(${WERELD_BEELD[w.nr]})` }} />
        ))}
        <span className="begin-gloed" />
        <span className="begin-donker" />
        <Tekens kleur={f.kleur} />
        <span className="begin-korrel" />
      </div>

      <header className="begin-balk in">
        <a className="begin-logo" href="#" onClick={(e) => e.preventDefault()} aria-label="Escaπ">
          <Merk />
        </a>
        <button className="begin-adres" onClick={kopieer} title="Kopieer de link naar het spel">
          {gekopieerd ? <Check size={15} /> : <Lock size={14} />}
          <span>{gekopieerd ? 'Link gekopieerd' : adres}</span>
          {!gekopieerd && <Link2 size={15} className="adres-link" />}
        </button>
        <span className="begin-balk-rechts">
          <button
            className="begin-rond"
            aria-label={geluidAan ? 'Geluid uit' : 'Geluid aan'}
            title={geluidAan ? 'Geluid staat aan' : 'Geluid staat uit'}
            onClick={() => useSpel.getState().setGeluid(!geluidAan)}
          >
            {geluidAan ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button className="begin-docent" onClick={() => (geluid('klik'), useSpel.getState().setKaart('docent'))}>
            <GraduationCap size={19} /> <span>Docent</span>
          </button>
        </span>
      </header>

      <main className="begin-held">
        <p className="begin-label in">
          De reken-escaperoom<span className="breed-alleen"> · mbo niveau 2 · rekenen 2F</span>
        </p>
        <h1 className="begin-titel in">
          <Merk groot />
        </h1>
        <p className="begin-zin in">Vijf werelden. Elke som is een sleutel. Reken je weg naar buiten.</p>
        <div className="begin-knoppen in">
          <button className="begin-cta" onClick={() => kies(heeftVoortgang ? laatste : 1)} disabled={weg}>
            <Play size={19} fill="currentColor" />
            {heeftVoortgang ? `Verder in Wereld ${laatste}` : 'Begin bij Wereld 1'}
            <ArrowRight size={18} className="cta-pijl" />
          </button>
          <button className="begin-tweede" onClick={() => (geluid('klik'), setUitleg(true))}>
            Hoe werkt het?
          </button>
        </div>
      </main>

      <section className="begin-werelden" aria-labelledby="kies-titel">
        <div className="begin-werelden-kop in">
          <h2 id="kies-titel">Kies je wereld</h2>
          <p key={f.nr} className="begin-nu">
            <span style={{ color: f.kleur }}>Wereld {f.nr}</span> · {f.naam}
            {f.maatje && (
              <>
                {' '}
                · met {f.maatje}, {f.wie}
              </>
            )}
          </p>
        </div>
        <div className="wk-rij">
          {standen.map((w) => (
            <WereldKaart key={w.nr} w={w} actief={w.nr === focus} kies={kies} wijs={setFocus} />
          ))}
        </div>
      </section>

      <footer className="begin-voet in">
        <span>
          <Merk /> · ontsnappen met rekenen
        </span>
        <span>
          Speel op <strong>{adres}</strong>
        </span>
      </footer>

      {uitleg && <HoeWerktHet sluit={() => setUitleg(false)} />}
      {kaart === 'docent' && <Kaarten />}
    </div>
  );
}
