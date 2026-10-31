// Alles wat over het 3D-beeld ligt: fases, teller, sleutels, knoppen, hints, kaarten en de inspectie-bediening.
import { animate } from 'animejs';
import {
  ArrowLeft,
  BookOpen,
  Box,
  CheckCircle2,
  DoorOpen,
  Eye,
  Footprints,
  GraduationCap,
  HelpCircle,
  Keyboard,
  KeyRound,
  Lightbulb,
  Lock,
  Map as Kaart,
  MousePointerClick,
  Move3d,
  Plane,
  Ruler,
  Scissors,
  Star,
  Target,
  User,
  Users,
  Volume2,
  VolumeX,
  AudioLines,
  Wrench,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animeerUit, heeftDelen, zetUit } from '../game/inspectie';
import { FASES, useSpel } from '../game/store';
import { blokken, codesVan, faseIndex, kluisOpen, lampjesOver, sterrenVan, telling, volgendDoel } from '../game/voortgang';
import { kanVoorlezen, leesVoor, stopVoorlezen } from '../lib/spraak';
import { geluid, startAchtergrond, stopAchtergrond } from '../lib/geluid';
import { alleWerelden, huidig, opdrachtVan, stationVan } from '../werelden';
import { Paneel } from './Paneel';
import { kamerVan } from './kamer';
import { Symbool } from './Symbool';
import { PiTeken } from './Merk';
import { MaatjeKnop, MaatjeKop, Portret, StartGesprek } from './Maatje';
import { maatjeVan } from '../game/maatje';

const DOCENT_PIN = '1357';
const FASE_ICOON = { terugblik: Eye, doel: Target, instructie: BookOpen, begeleid: Users, zelfstandig: User, evaluatie: CheckCircle2 } as const;
const WERELD_NAMEN: Record<number, [string, string]> = {
  1: ['De Haven', 'Eenheden en grootheden'],
  2: ['Het Spookkasteel', 'Oriëntatie in 2D en 3D'],
  3: ['De Markthal', 'Verhoudingen'],
  4: ['Het Winkelcentrum', 'Procenten'],
  5: ['De Controlekamer', 'Tabellen en grafieken'],
};

/** Sneltoetsen: werken ook als de muis vastzit (dan komt de muis vanzelf weer vrij). */
function useSneltoetsen() {
  useEffect(() => {
    const toets = (e: KeyboardEvent) => {
      const doel = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (doel && (doel.tagName === 'INPUT' || doel.tagName === 'TEXTAREA' || doel.isContentEditable)) return;
      const s = useSpel.getState();
      if (s.begin || s.modus !== 'lopen') return;
      const k = e.key.toLowerCase();
      const kaart = k === 'k' ? 'klusboek' : k === 'm' ? 'werelden' : k === 'h' ? 'hulp' : null;
      if (!kaart || (s.kaart && s.kaart !== kaart && s.kaart !== 'hulp' && s.kaart !== 'klusboek' && s.kaart !== 'werelden')) return;
      e.preventDefault();
      geluid('klik');
      s.setKaart(s.kaart === kaart ? null : kaart);
    };
    window.addEventListener('keydown', toets);
    return () => window.removeEventListener('keydown', toets);
  }, []);
}

export function Hud() {
  useSneltoetsen();
  const fase = useSpel((s) => s.fase);
  const voortgang = useSpel((s) => s.voortgang);
  const geluidAan = useSpel((s) => s.geluid);
  const voorlezen = useSpel((s) => s.voorlezen);
  const modus = useSpel((s) => s.modus);
  useSpel((s) => s.kluizen);
  useSpel((s) => s.lampjes);
  useSpel((s) => s.lampGebruikt);
  const def = huidig();
  const t = telling(voortgang);
  const nu = FASES.findIndex((f) => f.id === fase);
  if (modus !== 'lopen') return null;
  return (
    <header className="hud">
      <nav className="fases" aria-label="Lesfases">
        {FASES.map((f, i) => {
          const I = FASE_ICOON[f.id as keyof typeof FASE_ICOON];
          return (
            <span key={f.id} className={`fase${i === nu ? ' nu' : i < nu || fase === 'klaar' ? ' klaar' : ''}`} aria-current={i === nu ? 'step' : undefined}>
              <I size={18} />
              <span className="woord">{f.kort}</span>
            </span>
          );
        })}
      </nav>
      <div className="hud-rechts">
        <button className="teller" title="Klusboek (K)" aria-label="Open je klusboek" aria-keyshortcuts="K" onClick={() => (geluid('klik'), useSpel.getState().setKaart('klusboek'))}>
          <span className="sleutels" aria-label="Sleutels">
            {def.klussen.map((k) => (
              <KeyRound key={k.id} size={19} style={{ color: kluisOpen(k.id) ? k.kleur : 'rgba(255,255,255,0.28)' }} />
            ))}
          </span>
          <span className="scheider" />
          <Lock size={18} /> {t.verplichtGoed}/{t.verplicht}
          <span className="scheider" />
          <Star size={17} style={{ color: 'var(--keuze)' }} /> {t.keuzeGoed}/{t.keuze}
          <span className="lamp-deel">
            <span className="scheider" />
            <Lightbulb size={17} style={{ color: '#ffd24a' }} /> {lampjesOver()}
          </span>
          <BookOpen size={18} className="boek" />
        </button>
        <button className="knop licht rond thuis-knop" aria-label="Naar de beginpagina" title="Beginpagina" onClick={() => (geluid('klik'), useSpel.getState().naarBegin())}>
          <PiTeken />
        </button>
        <button className="knop licht rond" aria-label="Wereldkaart" title="Wereldkaart (M)" aria-keyshortcuts="M" onClick={() => (geluid('klik'), useSpel.getState().setKaart('werelden'))}>
          <Kaart size={24} />
        </button>
        <button
          className="knop licht rond"
          aria-label={geluidAan ? 'Geluid uit' : 'Geluid aan'}
          onClick={() => {
            const aan = !geluidAan;
            useSpel.getState().setGeluid(aan);
            if (aan) startAchtergrond();
            else stopAchtergrond();
          }}
        >
          {geluidAan ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
        {kanVoorlezen() && (
          <button
            className="knop licht rond"
            aria-pressed={voorlezen}
            aria-label={voorlezen ? 'Voorlezen uit' : 'Voorlezen aan'}
            title={voorlezen ? 'Voorlezen staat aan' : 'Voorlezen'}
            onClick={() => {
              const aan = !voorlezen;
              useSpel.getState().setVoorlezen(aan);
              if (aan) leesVoor('Ik lees alles voor. Tik nog een keer op deze knop om te stoppen.');
              else stopVoorlezen();
            }}
          >
            <AudioLines size={24} />
          </button>
        )}
        <button className="knop licht rond" aria-label="Hoe werkt het?" title="Hoe werkt het? (H)" aria-keyshortcuts="H" onClick={() => useSpel.getState().setKaart('hulp')}>
          <HelpCircle size={24} />
        </button>
        <button className="knop licht rond docent-knop" aria-label="Docent" onClick={() => useSpel.getState().setKaart('docent')}>
          <GraduationCap size={24} />
        </button>
      </div>
    </header>
  );
}

/** Vroeger de hintbalk: nu zegt het maatje alles. Hier alleen de knop om het opnieuw te vragen. */
export function Hint() {
  return <MaatjeKnop />;
}

/** Bediening tijdens de inspectie: terug, weergave en exploded view. */
export function InspectieBediening() {
  const modus = useSpel((s) => s.modus);
  const actief = useSpel((s) => s.actief);
  const weergave = useSpel((s) => s.weergave);
  const uit = useSpel((s) => s.uit);
  const index = useSpel((s) => s.opdrachtIndex);
  const voortgang = useSpel((s) => s.voortgang);
  const docent = useSpel((s) => s.docent);
  const [delen, setDelen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDelen(heeftDelen()), 200);
    return () => clearTimeout(t);
  }, [actief, weergave, modus]);
  const st = actief ? stationVan(actief) : null;
  if (!st || modus === 'lopen') return null;
  const isVouw = !!st.vouw;
  // Gaat de vraag over de uitslag zelf? Dan ligt hij open, en dichtvouwen is een tip (anders zie je het antwoord meteen).
  const opdracht = st.opdrachten[index];
  const v = opdracht ? voortgang[opdracht] : undefined;
  const vouwSlot = !!st.vouwTip && !docent && !v?.goed && (v?.tip ?? 0) < st.vouwTip;
  const vouwTekst = st.vouwTip ? (uit > 0.5 ? 'Vouw open' : 'Vouw dicht') : uit > 0.5 ? 'Vouw dicht' : 'Vouw open';
  return (
    <>
      <button className="knop licht terug" onClick={() => (geluid('klik'), useSpel.getState().sluit())} disabled={modus !== 'inspectie'}>
        <ArrowLeft size={24} /> Terug
      </button>
      {modus === 'inspectie' && (
        <div className="bediening">
          {st.kanBoven && st.kanDraai && (
            <div className="weergave" role="group" aria-label="Weergave">
              <button aria-pressed={weergave === 'boven'} onClick={() => weergave !== 'boven' && useSpel.getState().setWeergave('boven')}>
                <Plane size={20} /> Van boven
              </button>
              <button aria-pressed={weergave === 'draai'} onClick={() => weergave !== 'draai' && useSpel.getState().setWeergave('draai')}>
                <Move3d size={20} /> Draaien
              </button>
            </div>
          )}
          {isVouw && vouwSlot && (
            <div className="schuif slot" title={`Dichtvouwen is tip ${st.vouwTip}: probeer het eerst zelf.`}>
              <button className="knop licht" disabled>
                <Lock size={20} /> Dichtvouwen = tip {st.vouwTip}
              </button>
            </div>
          )}
          {(delen || isVouw) && !vouwSlot && (
            <div className="schuif">
              <button
                className="knop oranje"
                onClick={() => {
                  geluid('schuif');
                  animeerUit(uit > 0.5 ? 0 : 1);
                }}
              >
                {isVouw ? <Box size={22} /> : <Scissors size={22} />}
                {isVouw ? vouwTekst : uit > 0.5 ? 'Zet in elkaar' : 'Haal uit elkaar'}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(uit * 100)}
                aria-label="Hoe ver uit elkaar"
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  useSpel.getState().setUit(v);
                  zetUit(v);
                }}
              />
              <span className="pct">{Math.round(uit * 100)}%</span>
            </div>
          )}
        </div>
      )}
      {modus === 'inspectie' && <Paneel />}
    </>
  );
}

function Missie() {
  const def = huidig();
  return (
    <div className="missie">
      <div className="missie-kop">
        <Target size={18} /> Missie van {def.missie.opdrachtgever}
      </div>
      {def.missie.regels.map((r, i) => (
        <p key={i}>{r}</p>
      ))}
      <div className="klus-chips">
        {def.klussen.map((k) => (
          <span key={k.id} className="klus-chip" style={{ borderColor: k.kleur + '88' }}>
            <KeyRound size={16} style={{ color: k.kleur }} /> {k.naam}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Kaarten midden in beeld: start, doel, overgangen, klusboek, wereldkaart, hulp en docent. */
export function Kaarten() {
  const kaart = useSpel((s) => s.kaart);
  const fase = useSpel((s) => s.fase);
  useSpel((s) => s.voortgang);
  useSpel((s) => s.kluizen);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) animate(ref.current, { scale: [0.92, 1], opacity: [0, 1], duration: 450, ease: 'outBack' });
  }, [kaart]);
  if (!kaart) return null;
  const def = huidig();
  const sluit = () => (geluid('klik'), useSpel.getState().setKaart(null));
  let inhoud: React.ReactNode = null;
  if (kaart === 'start') {
    inhoud = (
      <StartGesprek
        key={def.nr}
        terug={faseIndex(fase) > 0}
        slot={
          <>
            {fase === 'klaar' ? <p>Deze wereld is klaar. Je mag nog rondlopen of een andere wereld kiezen.</p> : <Missie />}
            <Besturing />
            <div className="knoppen">
              <button
                className="knop"
                autoFocus
                onClick={() => {
                  sluit();
                  startAchtergrond();
                }}
              >
                {faseIndex(fase) > 0 ? 'Verder spelen' : 'Start'}
              </button>
              <button className="knop licht" onClick={() => useSpel.getState().setKaart('werelden')}>
                <Kaart size={20} /> Wereldkaart
              </button>
            </div>
          </>
        }
      />
    );
  } else if (kaart === 'doel') {
    inhoud = (
      <>
        <MaatjeKop>Dit ga je leren</MaatjeKop>
        {def.leerdoel.map((r, i) => (
          <p key={i}>{r}</p>
        ))}
        <Missie />
        <div className="knoppen">
          <button
            className="knop"
            autoFocus
            onClick={() => {
              useSpel.getState().setFase('instructie');
              sluit();
            }}
          >
            Verder
          </button>
        </div>
      </>
    );
  } else if (kaart === 'begeleid-klaar') {
    inhoud = (
      <>
        <MaatjeKop>Je krijgt: {def.gereedschap.naam}</MaatjeKop>
        <p>{def.gereedschap.uitleg}</p>
        <h3 className="tussenkop">Nu zelf</h3>
        <p>Elke klus heeft een kluis. Elk station geeft een code. Met alle codes open je de kluis.</p>
        <p>Vast? Probeer eerst zelf. Daarna kun je een tip vragen.</p>
        <div className="klus-chips">
          {def.klussen.map((k) => (
            <span key={k.id} className="klus-chip" style={{ borderColor: k.kleur + '88' }}>
              <KeyRound size={16} style={{ color: k.kleur }} /> {k.naam}
            </span>
          ))}
        </div>
        <div className="knoppen">
          <button className="knop" autoFocus onClick={sluit}>
            Aan de slag
          </button>
        </div>
      </>
    );
  } else if (kaart === 'evaluatie') {
    const n = def.werkboek.filter((id) => def.opdrachten[id].sectie === 'eindtest').length;
    inhoud = (
      <>
        <MaatjeKop>Alle sleutels zitten in de poort!</MaatjeKop>
        <p>Nu de eindcheck: {n} sommen bij de poort.</p>
        <p>Elk goed antwoord zet een lampje op de poort aan.</p>
        <div className="knoppen">
          <button className="knop" autoFocus onClick={sluit}>
            Naar de poort
          </button>
        </div>
      </>
    );
  } else if (kaart === 'blok2') {
    inhoud = (
      <>
        <MaatjeKop>De eerste helft is goed!</MaatjeKop>
        <p>Neem even pauze als je wilt. Dan de rest.</p>
        <div className="knoppen">
          <button className="knop" autoFocus onClick={sluit}>
            Verder
          </button>
        </div>
      </>
    );
  } else if (kaart === 'samenvatting') {
    inhoud = (
      <>
        <MaatjeKop>Dit kun je nu</MaatjeKop>
        <div className="strategie">
          {def.samenvatting.map((r, i) => (
            <div key={i}>
              <CheckCircle2 size={22} /> {r}
            </div>
          ))}
        </div>
        <div className="knoppen">
          <button className="knop" autoFocus onClick={() => useSpel.getState().setKaart('nabespreking')}>
            Verder
          </button>
        </div>
      </>
    );
  } else if (kaart === 'nabespreking') {
    inhoud = <Nabespreking />;
  } else if (kaart === 'poort') {
    const v = useSpel.getState().voortgang;
    const sleutels = def.klussen.filter((k) => kluisOpen(k.id)).length;
    const { blok1, blok2 } = blokken();
    const eind = [...blok1, ...blok2];
    inhoud = (
      <>
        <MaatjeKop>De poort is nog dicht</MaatjeKop>
        <div className="poort-status">
          <div>
            <KeyRound size={20} /> Sleutels: {sleutels} van {def.klussen.length}
          </div>
          <div>
            <Lightbulb size={20} /> Eindcheck: {eind.filter((id) => v[id]?.goed).length} van {eind.length}
          </div>
        </div>
        <p>{fase === 'evaluatie' ? 'Los de eindcheck rond de poort op.' : sleutels < def.klussen.length ? 'Open eerst alle kluizen. Kijk in je klusboek.' : 'Los eerst de oranje sloten op.'}</p>
        <div className="knoppen">
          <button className="knop" autoFocus onClick={sluit}>
            Oké
          </button>
          <button className="knop licht" onClick={() => useSpel.getState().setKaart('klusboek')}>
            <BookOpen size={20} /> Klusboek
          </button>
        </div>
      </>
    );
  } else if (kaart === 'volgende') {
    const volgende = alleWerelden().find((w) => w.nr > def.nr && useSpel.getState().fases[w.nr] !== 'klaar') ?? alleWerelden().find((w) => w.nr !== def.nr && useSpel.getState().fases[w.nr] !== 'klaar');
    inhoud = (
      <>
        <MaatjeKop>Je bent ontsnapt uit {def.naam}!</MaatjeKop>
        {volgende ? (
          <p>
            Volgende: Wereld {volgende.nr}, {volgende.naam} ({volgende.onderwerp.toLowerCase()}).
          </p>
        ) : (
          <p>Je hebt alle werelden gehaald. Wat goed!</p>
        )}
        <div className="knoppen">
          {volgende && (
            <button className="knop" autoFocus onClick={() => (geluid('klik'), useSpel.getState().setWereld(volgende.nr))}>
              Naar Wereld {volgende.nr}
            </button>
          )}
          <button className="knop licht" onClick={sluit}>
            Nog even rondkijken
          </button>
          <button className="knop licht" onClick={() => useSpel.getState().setKaart('werelden')}>
            <Kaart size={20} /> Wereldkaart
          </button>
        </div>
      </>
    );
  } else if (kaart === 'klusboek') {
    inhoud = <Klusboek sluit={sluit} />;
  } else if (kaart === 'werelden') {
    inhoud = <Wereldkaart sluit={sluit} />;
  } else if (kaart === 'hulp') {
    inhoud = (
      <>
        <MaatjeKop>Zo werkt het</MaatjeKop>
        <Besturing />
        <div className="uitleg-rij">
          <div>
            <Plane size={24} /> Van boven: je ziet de maten.
          </div>
          <div>
            <Move3d size={24} /> Draaien: sleep om het object.
          </div>
          <div>
            <KeyRound size={24} /> Elk station geeft een code voor de kluis.
          </div>
          <div>
            <Lightbulb size={24} /> Vast? Na een poging mag je een tip vragen.
          </div>
        </div>
        <div className="knoppen">
          <button className="knop" autoFocus onClick={sluit}>
            Sluiten
          </button>
          <button className="knop licht" onClick={() => useSpel.getState().setKaart('docent')}>
            <GraduationCap size={20} /> Docent
          </button>
        </div>
      </>
    );
  } else if (kaart === 'docent') {
    inhoud = <Docent sluit={sluit} />;
  }
  const breed = kaart === 'klusboek' || kaart === 'werelden' || kaart === 'docent';
  return (
    <div className={`kaart-achter${kaart === 'start' ? ' titel' : ''}`} onClick={(e) => e.target === e.currentTarget && kaart !== 'start' && kaart !== 'nabespreking' && sluit()}>
      <div className={`kaart${breed ? ' breed' : ''}`} ref={ref} role="dialog" aria-modal="true">
        {inhoud}
      </div>
    </div>
  );
}

function Sterren({ n }: { n: number }) {
  return (
    <span className="sterren" aria-label={`${n} van 3 sterren`}>
      {[1, 2, 3].map((i) => (
        <Star key={i} size={16} fill={i <= n ? '#ffd24a' : 'none'} style={{ color: i <= n ? '#ffd24a' : 'rgba(255,255,255,0.3)' }} />
      ))}
    </span>
  );
}

function Klusboek({ sluit }: { sluit: () => void }) {
  const def = huidig();
  const fase = useSpel((s) => s.fase);
  const voortgang = useSpel((s) => s.voortgang);
  return (
    <>
      <div className="boek-kop">
        <BookOpen size={24} />
        <h2>Klusboek · {def.naam}</h2>
      </div>
      <Missie />
      <div className="klussen">
        {def.klussen.map((k) => {
          const codes = codesVan(k, voortgang);
          const open = kluisOpen(k.id);
          return (
            <div key={k.id} className="klus-kaart" style={{ borderColor: k.kleur + '66' }}>
              <div className="klus-kop">
                <KeyRound size={20} style={{ color: open ? k.kleur : 'rgba(255,255,255,0.35)' }} />
                <strong>{k.naam}</strong>
                <span className="stil">{open ? 'kluis open' : 'kluis dicht'}</span>
                <Sterren n={sterrenVan(k)} />
              </div>
              {codes.map((c) => (
                <div key={c.station.id} className={`code-rij${c.gevonden ? '' : ' leeg'}`}>
                  <Symbool i={c.symbool} kleur={k.kleur} size={20} />
                  <span className="code-naam">
                  {c.station.titel}
                  {kamerVan(c.station.pos, c.station.verdieping) && <span className="stil"> · {kamerVan(c.station.pos, c.station.verdieping)}</span>}
                </span>
                  <span className="code-cijfer klein">{c.gevonden ? c.cijfer : '?'}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="rugzak">
        <div className={`rugzak-vak${faseIndex(fase) >= faseIndex('zelfstandig') ? '' : ' leeg'}`}>
          <Wrench size={20} />
          <div>
            <strong>{def.gereedschap.naam}</strong>
            <div className="stil">{faseIndex(fase) >= faseIndex('zelfstandig') ? def.gereedschap.uitleg : 'Krijg je na "Samen oefenen".'}</div>
          </div>
        </div>
        <div className="rugzak-vak">
          <Lightbulb size={20} style={{ color: '#ffd24a' }} />
          <div>
            <strong>{lampjesOver()} lampjes</strong>
            <div className="stil">Een lampje = een tip. Er liggen er nog meer verstopt.</div>
          </div>
        </div>
      </div>
      <div className="knoppen">
        <button className="knop" autoFocus onClick={sluit}>
          Sluiten
        </button>
      </div>
    </>
  );
}

function Wereldkaart({ sluit }: { sluit: () => void }) {
  const huidigNr = useSpel((s) => s.wereld);
  const fases = useSpel((s) => s.fases);
  const fase = useSpel((s) => s.fase);
  const gebouwd = new Set<number>(alleWerelden().map((w) => w.nr));
  return (
    <>
      <div className="boek-kop">
        <Kaart size={24} />
        <h2>Wereldkaart</h2>
      </div>
      <p>Vijf werelden, vijf onderdelen van je werkboek. Elke wereld heeft een eigen maatje. Kies waar je heen gaat.</p>
      <div className="werelden">
        {[1, 2, 3, 4, 5].map((nr) => {
          const f = nr === huidigNr ? fase : fases[nr];
          const klaar = f === 'klaar';
          const bezig = f && f !== 'terugblik' && !klaar;
          const kan = gebouwd.has(nr);
          return (
            <button
              key={nr}
              className={`wereld-tegel${nr === huidigNr ? ' hier' : ''}${klaar ? ' klaar' : ''}`}
              disabled={!kan}
              onClick={() => {
                geluid('klik');
                if (nr === huidigNr) sluit();
                else useSpel.getState().setWereld(nr);
              }}
            >
              <span className="wereld-nr">{nr}</span>
              {kan && <Portret nr={nr} grootte={52} zweef={nr === huidigNr} />}
              <strong>{alleWerelden().find((w) => w.nr === nr)?.naam ?? WERELD_NAMEN[nr][0]}</strong>
              {kan && <span className="stil">met {maatjeVan(alleWerelden().find((w) => w.nr === nr)).naam}</span>}
              <span className="stil">{alleWerelden().find((w) => w.nr === nr)?.onderwerp ?? WERELD_NAMEN[nr][1]}</span>
              <span className="wereld-status">{!kan ? 'In aanbouw' : klaar ? 'Klaar' : nr === huidigNr ? 'Je bent hier' : bezig ? 'Bezig' : 'Nieuw'}</span>
            </button>
          );
        })}
      </div>
      <div className="knoppen">
        <button className="knop" autoFocus onClick={sluit}>
          Sluiten
        </button>
        <button className="knop licht" onClick={() => (geluid('klik'), useSpel.getState().naarBegin())}>
          <PiTeken /> Beginpagina
        </button>
      </div>
    </>
  );
}

function Nabespreking() {
  const def = huidig();
  const reflectie = useSpel((s) => s.reflectie[s.wereld] ?? {});
  const kies = (v: string, a: string) => (geluid('klik'), useSpel.getState().setReflectie(v, a));
  const hulp = [def.gereedschap.naam, 'De tips', 'Het voorbeeld', 'Van boven kijken', 'Uit elkaar halen'];
  return (
    <>
      <MaatjeKop>Even terugkijken</MaatjeKop>
      <div className="vraagblok">
        <strong>Welke kluis vond je het lastigst?</strong>
        <div className="keuzes">
          {def.klussen.map((k) => (
            <button key={k.id} className={reflectie.lastig === k.naam ? 'goed' : ''} onClick={() => kies('lastig', k.naam)}>
              {k.naam}
            </button>
          ))}
        </div>
      </div>
      <div className="vraagblok">
        <strong>Wat hielp je het meest?</strong>
        <div className="keuzes">
          {hulp.map((h) => (
            <button key={h} className={reflectie.hulp === h ? 'goed' : ''} onClick={() => kies('hulp', h)}>
              {h}
            </button>
          ))}
        </div>
      </div>
      <div className="klussen klein">
        {def.klussen.map((k) => (
          <div key={k.id} className="klus-kop">
            <KeyRound size={18} style={{ color: k.kleur }} /> {k.naam} <Sterren n={sterrenVan(k)} />
          </div>
        ))}
      </div>
      <div className="knoppen">
        <button
          className="knop"
          disabled={!reflectie.lastig || !reflectie.hulp}
          onClick={() => {
            geluid('klaar');
            useSpel.getState().setFase('klaar');
            useSpel.getState().setKaart(null);
            useSpel.getState().vier(true);
            // Na het opengaan van de deur: door naar de volgende wereld?
            setTimeout(() => {
              const s = useSpel.getState();
              if (s.fase === 'klaar' && !s.kaart) s.setKaart('volgende');
            }, 4200);
          }}
        >
          <DoorOpen size={22} /> Open de poort
        </button>
      </div>
    </>
  );
}

function Besturing() {
  return (
    <div className="uitleg-rij">
      <div>
        <Footprints size={24} /> Lopen: W A S D · draaien: muis of pijltjes
      </div>
      <div>
        <Move3d size={24} /> Klik in beeld: de muis zit vast en je kijkt rond. Esc = muis los (voor de knoppen)
      </div>
      <div>
        <Target size={24} /> Kijk naar een opdracht en klik of druk E om hem te openen
      </div>
      <div>
        <Keyboard size={24} /> Sneltoetsen: K = klusboek · M = wereldkaart · H = hulp
      </div>
    </div>
  );
}

function Docent({ sluit }: { sluit: () => void }) {
  const docent = useSpel((s) => s.docent);
  const rekenmachine = useSpel((s) => s.rekenmachine);
  const schrikken = useSpel((s) => s.schrikken);
  const beeld = useSpel((s) => s.beeld);
  const voortgang = useSpel((s) => s.voortgang);
  const [pin, setPin] = useState('');
  const [fout, setFout] = useState(false);
  const [tab, setTab] = useState<'voortgang' | 'werkboek'>('voortgang');
  if (!docent) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pin === DOCENT_PIN) useSpel.getState().setDocent(true);
          else setFout(true);
        }}
        style={{ display: 'grid', gap: 14 }}
      >
        <MaatjeKop>Docent</MaatjeKop>
        <p>Typ de docentcode.</p>
        <input id="docent-pin" className="code-invoer" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="Docentcode" autoFocus />
        {fout && <p style={{ color: 'var(--bijna)' }}>Die code klopt niet.</p>}
        <div className="knoppen">
          <button className="knop licht" type="button" onClick={sluit}>
            Sluiten
          </button>
          <button className="knop" type="submit">
            Open
          </button>
        </div>
      </form>
    );
  }
  const def = huidig();
  const flags = def.werkboek.flatMap((id) => (def.opdrachten[id].flags ?? []).filter((f) => f.soort !== 'auteursrecht').map((f) => ({ id, ...f })));
  const t = telling(voortgang);
  const rijen = def.werkboek.map((id) => ({ id, o: opdrachtVan(id)!, s: voortgang[id] })).filter((r) => r.s);
  const lastig = [...rijen].sort((a, b) => (b.s?.pogingen ?? 0) + (b.s?.tip ?? 0) * 2 - ((a.s?.pogingen ?? 0) + (a.s?.tip ?? 0) * 2)).slice(0, 3);
  return (
    <>
      <h2>Docent · Wereld {def.nr}</h2>
      <p style={{ fontSize: 16 }}>
        Alle sloten zijn nu open. Antwoorden staan in het paneel. Code voor de buitenmissie: <strong>4729</strong>. Voortgang: {t.verplichtGoed}/{t.verplicht} verplicht · {t.keuzeGoed}/{t.keuze} keuze.
      </p>
      <div className="weergave" role="tablist">
        <button aria-pressed={tab === 'voortgang'} onClick={() => setTab('voortgang')}>
          Voortgang
        </button>
        <button aria-pressed={tab === 'werkboek'} onClick={() => setTab('werkboek')}>
          Werkboek ({flags.length})
        </button>
      </div>
      {tab === 'voortgang' ? (
        <>
          {lastig.length > 0 && (
            <p style={{ fontSize: 15 }}>
              Bespreek klassikaal: <strong>{lastig.map((r) => r.o.nummer + ' (' + r.o.sectie + ')').join(', ')}</strong>
            </p>
          )}
          <div className="docent-tabel">
            <table>
              <thead>
                <tr>
                  <th>Opdracht</th>
                  <th>Goed</th>
                  <th>Pogingen</th>
                  <th>Tip</th>
                  <th>1e poging</th>
                  <th>Gok</th>
                </tr>
              </thead>
              <tbody>
                {rijen.map((r) => (
                  <tr key={r.id} className={r.s?.vlag || (r.s?.tip ?? 0) >= 4 ? 'let-op' : ''}>
                    <td>
                      {r.o.sectie} {r.o.nummer}
                    </td>
                    <td>{r.s?.goed ? '✓' : '–'}</td>
                    <td>{r.s?.pogingen ?? 0}</td>
                    <td>{r.s?.tip ?? 0}</td>
                    <td>{r.s?.eerste !== undefined ? `${r.s.eerste} s` : '–'}</td>
                    <td>{r.s?.gok ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rijen.length && <p className="stil">Nog geen pogingen in deze wereld.</p>}
          </div>
        </>
      ) : (
        <div className="docent-lijst">
          {flags.map((f, i) => (
            <div key={i}>
              <strong>{f.id.replace(/^O\d-/, '')}</strong> · {f.soort}: {f.beschrijving} <em>→ {f.voorstel}</em>
            </div>
          ))}
        </div>
      )}
      <div className="docent-instelling">
        <span>Rekenmachine bij de vragen</span>
        <div className="weergave" role="group" aria-label="Rekenmachine">
          <button aria-pressed={rekenmachine} onClick={() => useSpel.getState().setRekenmachine(true)}>
            Aan
          </button>
          <button aria-pressed={!rekenmachine} onClick={() => useSpel.getState().setRekenmachine(false)}>
            Uit
          </button>
        </div>
      </div>
      <div className="docent-instelling">
        <span>Schrikmomenten van Frank (Spookkasteel)</span>
        <div className="weergave" role="group" aria-label="Schrikmomenten">
          <button aria-pressed={schrikken} onClick={() => useSpel.getState().setSchrikken(true)}>
            Aan
          </button>
          <button aria-pressed={!schrikken} onClick={() => useSpel.getState().setSchrikken(false)}>
            Uit
          </button>
        </div>
      </div>
      <div className="docent-instelling">
        <span>Beeldkwaliteit</span>
        <div className="weergave" role="group" aria-label="Beeldkwaliteit">
          {(
            [
              ['auto', 'Automatisch'],
              ['hoog', 'Mooi'],
              ['midden', 'Midden'],
              ['laag', 'Snel'],
            ] as const
          ).map(([k, naam]) => (
            <button key={k} aria-pressed={beeld === k} onClick={() => useSpel.getState().setBeeld(k)}>
              {naam}
            </button>
          ))}
        </div>
      </div>
      <div className="knoppen">
        <button className="knop licht" onClick={() => (useSpel.getState().setDocent(false), sluit())}>
          Docent uit
        </button>
        <button className="knop licht" onClick={() => useSpel.getState().wis()}>
          Wereld opnieuw
        </button>
        <button className="knop" onClick={sluit}>
          Sluiten
        </button>
      </div>
    </>
  );
}
