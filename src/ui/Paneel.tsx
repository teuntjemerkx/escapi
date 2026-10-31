// Het rekenpaneel. Eerst zelf proberen; hulp komt pas na een poging, in vier treden:
// 1 strategie → 2 aanpak (staptitels + gereedschap) → 3 eerste stap voorgedaan → 4 tweelingsom.
// Nooit het antwoord. Bij "Samen oefenen" staan de stappen open; bij de eindcheck alleen tip 1.
import { animate, stagger } from 'animejs';
import { Volume2, Check, ChevronRight, Eye, HelpCircle, KeyRound, Lightbulb, Lock, LockOpen, Minus, Plus, Sparkles, Star, Target, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Opdracht, Stap } from '../data/schema';
import { animeerUit } from '../game/inspectie';
import { useSpel } from '../game/store';
import { cijferVan, codesVan, controleerFase, klusVan, lampjesOver } from '../game/voortgang';
import { kluisGeopend } from '../game/wereld-basis';
import { geluid } from '../lib/geluid';
import { klopt, lees, nl, rond, toon, type Afronding } from '../lib/getal';
import { huidig, opdrachtVan, stationVan } from '../werelden';
import type { Station } from '../werelden/types';
import { looptjesVan, rekenRij } from './kruis';
import { Symbool } from './Symbool';
import { kamerVan } from './kamer';
import { Trap, VTabel } from './Trap';
import { reken, tokens, type Tok } from '../lib/reken';
import { kanVoorlezen, leesVoor, stopVoorlezen } from '../lib/spraak';
import { HulpKnoppen, HulpKaart } from './Hulpmiddel';
import { Portret } from './Maatje';
import { maatjeVan } from '../game/maatje';

type Niveau = 'begeleid' | 'zelf' | 'toets' | 'demo';
const BUITEN_CODE = '4729';
const WACHT_TIP = 20; // seconden tussen tips
const WACHT_ZONDER_LAMPJE = 60;
const VRIJE_TIP_NA = 90; // tip 1 komt ook vanzelf beschikbaar na zoveel seconden
const SNELLE_GOK = 5;

function niveauVan(o: Opdracht, rol?: string): Niveau {
  if (rol === 'instructie') return 'demo';
  if (rol === 'terugblik' || o.sectie === 'instap') return 'begeleid';
  if (o.sectie === 'eindtest') return 'toets';
  return 'zelf';
}

/** Tip 1 als de opdracht geen eigen strategie heeft. */
function strategieVan(o: Opdracht): string {
  if (o.strategie) return o.strategie;
  const e = o.antwoord?.eenheid;
  const zoek = e ? `Je antwoord is in ${e}.` : 'Lees de vraag nog een keer rustig.';
  const per: Record<string, string> = {
    eenhedentrap: 'Je moet omrekenen. Denk aan de trap.',
    deelsommen: 'Kijk naar de delen van het object. Reken elk deel apart.',
    verhoudingstabel: 'Zet de getallen in een verhoudingstabel.',
    procentenbalk: 'Gebruik de procentenbalk. 100% is het geheel.',
    tabel: 'Zoek de goede rij en kolom in de tabel.',
    grafiek: 'Zoek de goede lijn of staaf. Lees goed af op de as.',
    formule: 'Vul de getallen in de formule in.',
    getallenlijn: 'Zet de getallen op een getallenlijn.',
    keuze: 'Bekijk elk antwoord. Welke past bij wat je ziet?',
    stappen: 'Bedenk eerst welke stappen je nodig hebt.',
    blokmodel: 'Teken een strook en verdeel die in gelijke stukken.',
    koppel: 'Kijk naar de vorm: tel de hoeken en de vlakken.',
    kruissom: 'Begin bij een rij met maar één leeg vakje.',
  };
  return `${zoek} ${per[o.paneel] ?? ''}`.trim();
}

/** Is de stap goed? Lange decimalen mogen afgerond op 1 of 2 decimalen. */
function stapKlopt(invoer: string, s: Stap) {
  if (typeof s.uitkomst !== 'number') return lees(invoer).length > 0;
  const u = s.uitkomst;
  const opties = new Set([u, rond(u, '2-decimalen'), rond(u, '1-decimaal')]);
  if (Number.isInteger(u)) return klopt(invoer, u);
  return [...opties].some((x) => klopt(invoer, x));
}

/** Kalme, gerichte feedback: waar ging het mis? Zonder de som te verklappen. */
function tipBijFout(invoer: string, s: Stap, alle: Stap[], i: number, somZicht: boolean): string {
  const waarden = lees(invoer);
  const u = typeof s.uitkomst === 'number' ? s.uitkomst : NaN;
  if (!waarden.length) return 'Typ een getal. Een komma mag.';
  for (const v of waarden) {
    for (const f of [10, 100, 1000]) {
      if (Math.abs(v * f - u) < 1e-6 * Math.max(1, Math.abs(u)) || Math.abs(v / f - u) < 1e-6 * Math.max(1, Math.abs(u)))
        return s.trap ? 'Bijna! Kijk naar de trap: hoeveel treden ga je?' : `Bijna! Je antwoord is ${v * f - u < 0 ? f + ' keer te klein' : f + ' keer te groot'}. Kijk waar de komma staat.`;
    }
    const eerder = alle.slice(0, i).findIndex((x) => typeof x.uitkomst === 'number' && Math.abs(x.uitkomst - v) < 1e-9);
    if (eerder >= 0) return `Dat is de uitkomst van stap ${eerder + 1}. Reken nu deze stap.`;
    if (s.afronding || /rond/i.test(s.tekst)) return 'Let op het afronden. Lees de stap nog een keer.';
  }
  return somZicht ? `Nog niet. Reken rustig: ${s.som}.` : 'Nog niet goed. Kijk nog eens naar de maten.';
}

// ── Tipladder ──────────────────────────────────────────────────────────────

interface Tips {
  niveau: number;
  max: number;
  fouten: number;
  /** Seconden tot de volgende tip (0 = nu), of null als die nog een poging vraagt. */
  wacht: number | null;
  kost: number;
  aangeboden: boolean;
  vangnet: boolean;
  geopend: number;
  fout: () => void;
  vraag: () => void;
}

function useTips(o: Opdracht, niveau: Niveau): Tips {
  const opgeslagen = useSpel.getState().voortgang[o.id]?.tip ?? 0;
  const max = niveau === 'toets' ? 1 : niveau === 'zelf' ? 4 : 0;
  const [tip, setTip] = useState(Math.min(opgeslagen, max));
  const [fouten, setFouten] = useState(0);
  const [sinds, setSinds] = useState(0);
  const geopend = useRef(Date.now());
  const laatste = useRef(Date.now());
  const [nu, setNu] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNu(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const volgende = tip + 1;
  const lampjes = lampjesOver();
  const kost = volgende === 2 || volgende === 3 ? 1 : 0;
  let wacht: number | null = null;
  if (volgende <= max) {
    if (volgende === 1) wacht = fouten > 0 ? 0 : Math.max(0, VRIJE_TIP_NA - (nu - geopend.current) / 1000);
    else if (sinds < 1) wacht = null;
    else if (volgende === 4) wacht = 0;
    else {
      const nodig = WACHT_TIP + (kost && lampjes < kost ? WACHT_ZONDER_LAMPJE : 0);
      wacht = Math.max(0, nodig - (nu - laatste.current) / 1000);
    }
  }
  return {
    niveau: tip,
    max,
    fouten,
    wacht: wacht === null ? null : Math.ceil(wacht),
    kost: kost && lampjes >= kost ? kost : 0,
    aangeboden: fouten >= 3 && tip === 0,
    vangnet: tip >= 4 && sinds >= 2,
    geopend: geopend.current,
    fout: () => {
      setFouten((f) => f + 1);
      setSinds((x) => x + 1);
    },
    vraag: () => {
      if (volgende > max) return;
      const s = useSpel.getState();
      if (kost && lampjesOver() >= kost) s.gebruikLampje();
      setTip(volgende);
      setSinds(0);
      laatste.current = Date.now();
      s.zetScore(o.id, { tip: Math.max(volgende, s.voortgang[o.id]?.tip ?? 0) });
      s.hulpGebruikt(o.id);
      geluid('klik');
    },
  };
}

function TipBalk({ o, tips, open }: { o: Opdracht; tips: Tips; open: () => void }) {
  const [vraagt, setVraagt] = useState(false);
  const lampjes = lampjesOver();
  if (tips.max === 0) return null;
  const volgende = tips.niveau + 1;
  const kan = volgende <= tips.max && tips.wacht === 0;
  const naam = ['', 'Tip 1: waar zoek je naar?', 'Tip 2: welke stappen?', 'Tip 3: eerste stap voorgedaan', 'Tip 4: voorbeeld met andere getallen'][volgende] ?? '';
  const uitleg =
    volgende > tips.max
      ? tips.niveau >= 4
        ? 'Alle tips zijn gebruikt.'
        : 'Bij de eindcheck is er maar één tip.'
      : tips.wacht === null
        ? 'Probeer het eerst zelf. Daarna kun je verder.'
        : tips.wacht > 0
          ? tips.niveau === 0 && tips.fouten === 0
            ? `Probeer het eerst zelf. Tip over ${tips.wacht} s.`
            : `Denk nog even na. Tip over ${tips.wacht} s.`
          : naam;
  return (
    <div className={`tipbalk${tips.aangeboden ? ' gloei' : ''}`}>
      {vraagt ? (
        <div className="tip-vraag" role="alertdialog" aria-label="Tip gebruiken?">
          <span>{tips.kost ? `Tip gebruiken? Dit kost 1 lampje (je hebt er ${lampjes}).` : volgende === 4 ? 'Voorbeeld bekijken? Dan vervalt je tweede ster.' : 'Tip gebruiken?'}</span>
          <div className="tip-knoppen">
            <button className="knop licht" onClick={() => setVraagt(false)}>
              Nee
            </button>
            <button
              className="knop"
              autoFocus
              onClick={() => {
                setVraagt(false);
                tips.vraag();
                if (volgende === 4) open();
              }}
            >
              Ja
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="lampjes" title="Lampjes (tips)">
            <Lightbulb size={18} /> {lampjes}
          </span>
          <span className="tip-tekst">{tips.aangeboden && kan ? 'Wil je een tip?' : uitleg}</span>
          {volgende <= tips.max && (
            <button className="knop licht klein" disabled={!kan} onClick={() => setVraagt(true)} aria-label={naam}>
              <HelpCircle size={18} /> Tip
            </button>
          )}
          {tips.niveau >= 4 && o.voorbeeld && (
            <button className="knop licht klein" onClick={open}>
              <Lightbulb size={18} /> Voorbeeld
            </button>
          )}
        </>
      )}
    </div>
  );
}

function TipKaart({ o, tips }: { o: Opdracht; tips: Tips }) {
  const ref = useRef<HTMLDivElement>(null);
  const actief = useSpel((s) => s.actief);
  const st = actief ? stationVan(actief) : null;
  // bij een uitslag-vraag is dichtvouwen het hulpmiddel van tip 2
  const vouwNu = !!st?.vouwTip && tips.niveau >= st.vouwTip;
  useLayoutEffect(() => {
    if (ref.current) animate(ref.current, { opacity: [0, 1], translateY: [8, 0], duration: 350, ease: 'outQuad' });
  }, []);
  useEffect(() => {
    const d = o.stappen.find((s) => s.deel)?.deel;
    if (d) useSpel.getState().kiesDeel(d);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} className="tipkaart">
      <Portret grootte={44} zweef={false} />
      <div>
        <strong>{maatjeVan().naam} · tip 1:</strong> {strategieVan(o)}
        {vouwNu && (
          <div className="vouw-tip">
            <strong>Tip {st?.vouwTip}:</strong> je mag de uitslag nu dichtvouwen met de knop <em>Vouw dicht</em> linksonder. Kijk welke vlakken tegenover elkaar komen.
          </div>
        )}
        {tips.vangnet && <div className="vangnet">Deze bewaren we. Ga verder met een andere opdracht. Je docent kijkt even mee.</div>}
      </div>
    </div>
  );
}

// ── Paneel ──────────────────────────────────────────────────────────────────

export function Paneel() {
  const actief = useSpel((s) => s.actief);
  const index = useSpel((s) => s.opdrachtIndex);
  const voortgang = useSpel((s) => s.voortgang);
  const docent = useSpel((s) => s.docent);
  const st = actief ? stationVan(actief) : null;
  if (!st) return null;
  if (st.rol === 'kluis') return <KluisPaneel st={st} />;
  const id = st.opdrachten[index];
  const o = id ? opdrachtVan(id) : null;
  if (!o) return null;
  const niveau = niveauVan(o, st.rol);
  const sectie = o.sectie;
  const klus = klusVan(st.id);
  const soort = st.rol ? 'verplicht' : sectie === 'eindtest' ? 'eind' : ['expert', 'puzzel', 'praktijk'].includes(sectie) ? 'keuze' : 'verplicht';
  const sub =
    st.rol === 'terugblik'
      ? 'Terugblik'
      : st.rol === 'instructie'
        ? 'Kijk mee · stap voor stap'
        : `${{ instap: 'Samen oefenen', niveau: 'Zelf doen', expert: 'Extra (keuze)', praktijk: 'Buitenmissie', puzzel: 'Puzzel (keuze)', eindtest: 'Eindcheck' }[sectie]}${klus ? ` · ${klus.naam}` : ''} · opdracht ${o.nummer}`;
  const Icoon = soort === 'keuze' ? Star : soort === 'eind' ? Target : Sparkles;
  return (
    <>
      <aside className="paneel" aria-label="Rekenpaneel">
        <div className="paneel-kop">
          <div className={`soort ${soort}`} style={klus ? { color: klus.kleur, borderColor: klus.kleur + '66', background: klus.kleur + '1f' } : undefined}>
            {klus ? <Symbool i={klus.stations.indexOf(st.id)} kleur={klus.kleur} size={24} /> : <Icoon size={26} />}
          </div>
          <div>
            <h2>{o.titel ?? st.titel}</h2>
            <div className="sub">{sub}</div>
          </div>
          <HulpKnoppen />
        </div>
        {st.opdrachten.length > 1 && (
          <div className="tabs" role="tablist">
            {st.opdrachten.map((oid, i) => (
              <button key={oid} role="tab" aria-current={i === index} onClick={() => useSpel.getState().setOpdrachtIndex(i)} aria-label={`Opdracht ${opdrachtVan(oid)?.nummer}`}>
                {voortgang[oid]?.goed ? <Check size={18} /> : null}
                {opdrachtVan(oid)?.nummer}
              </button>
            ))}
          </div>
        )}
        <div className="paneel-inhoud">
          <div className="vraag">
            {o.vraag.map((z, i) => (
              <p key={i}>{z}</p>
            ))}
            {kanVoorlezen() && (
              <button className="voorlees-knop" onClick={() => leesVoor(o.vraag.join(' '))} aria-label="Lees de vraag voor">
                <Volume2 size={18} /> Lees voor
              </button>
            )}
          </div>
          <Voorlezer tekst={o.vraag.join(' ')} />
          {docent && o.antwoord && (
            <div className="label-voorbeeld">
              <Lock size={14} /> Docent: {typeof o.antwoord.waarde === 'number' ? toon(o.antwoord.waarde, o.antwoord.eenheid) : o.antwoord.waarde}
            </div>
          )}
          <Werk key={o.id} o={o} st={st} niveau={niveau} />
        </div>
      </aside>
      <HulpKaart />
    </>
  );
}

function Werk({ o, st, niveau }: { o: Opdracht; st: Station; niveau: Niveau }) {
  const goed = useSpel((s) => !!s.voortgang[o.id]?.goed);
  const tips = useTips(o, niveau);
  const [voorbeeld, setVoorbeeld] = useState(false);
  if (niveau === 'demo') return <DemoWerk o={o} />;
  // Open opdrachten én opdrachten waarbij in het werkboek een gegeven mist: de docent keurt goed met een code.
  if (o.type === 'open' || !o.antwoord) return <OpenWerk o={o} />;
  const waarde = o.antwoord?.waarde;
  let inhoud: React.ReactNode;
  if (o.type === 'koppel') inhoud = <KoppelWerk o={o} tips={tips} />;
  else if (o.type === 'puzzel' && o.puzzel?.rooster) inhoud = <KruisWerk o={o} tips={tips} />;
  else if (o.type === 'tekst' || (o.type === 'puzzel' && typeof waarde === 'string' && waarde.includes('='))) inhoud = <TekstWerk o={o} tips={tips} alGoed={goed} />;
  else if (o.type === 'puzzel' && typeof waarde === 'string') inhoud = <ExpressieWerk o={o} tips={tips} alGoed={goed} />;
  else inhoud = <StappenWerk o={o} niveau={niveau} tips={tips} alGoed={goed} />;
  return (
    <>
      {tips.niveau >= 1 && !goed && <TipKaart o={o} tips={tips} />}
      {inhoud}
      {!goed && niveau !== 'begeleid' && <TipBalk o={o} tips={tips} open={() => setVoorbeeld(true)} />}
      {!goed && niveau === 'begeleid' && o.voorbeeld && tips.fouten > 0 && (
        <button className="knop licht" onClick={() => (setVoorbeeld(true), useSpel.getState().hulpGebruikt(o.id), geluid('klik'))}>
          <Lightbulb size={22} /> Laat een voorbeeld zien
        </button>
      )}
      {voorbeeld && o.voorbeeld && <Voorbeeld o={o} sluit={() => setVoorbeeld(false)} />}
      {goed && <Gelukt o={o} st={st} />}
    </>
  );
}

function rondAf(o: Opdracht) {
  const st = useSpel.getState();
  const eerder = !!st.voortgang[o.id]?.goed;
  st.poging(o.id, true, eersteTijd(o));
  geluid('goed');
  if (!eerder) {
    if (o.id.endsWith('-TERUG')) {
      st.setFase('doel');
      setTimeout(() => {
        useSpel.getState().sluit();
        useSpel.getState().setKaart('doel');
      }, 1600);
    } else controleerFase(o.id);
  }
}

const geopendOp = new Map<string, number>();
function eersteTijd(o: Opdracht) {
  const v = useSpel.getState().voortgang[o.id];
  const t0 = geopendOp.get(o.id);
  return !v?.pogingen && t0 ? { eerste: Math.round((Date.now() - t0) / 1000) } : {};
}
/** Telt een fout antwoord. Geeft false als het een snelle gok was (telt dan niet mee). */
function telFout(o: Opdracht, tips: Tips, niveau: Niveau | 'anders' = 'anders'): boolean {
  const s = useSpel.getState();
  const v = s.voortgang[o.id];
  if (niveau !== 'begeleid' && !v?.pogingen && Date.now() - tips.geopend < SNELLE_GOK * 1000) {
    s.zetScore(o.id, { gok: (v?.gok ?? 0) + 1 });
    return false;
  }
  s.poging(o.id, false, eersteTijd(o));
  tips.fout();
  geluid('bijna');
  return true;
}
const GOK_TEKST = 'Reken eerst. Neem rustig de tijd en kijk naar het object.';

/** Getal- en keuzevragen. Zelf doen: alleen een antwoordvak; stappen komen via de tips. */
function StappenWerk({ o, niveau, tips, alGoed }: { o: Opdracht; niveau: Niveau; tips: Tips; alGoed: boolean }) {
  useEffect(() => {
    if (!geopendOp.has(o.id)) geopendOp.set(o.id, Date.now());
  }, [o.id]);
  const stappen = o.stappen;
  const begeleid = niveau === 'begeleid';
  const toonStappen = begeleid || (niveau === 'zelf' && tips.niveau >= 2);
  // De som zelf staat er niet bij: die moet je zelf bedenken. Bij Samen oefenen komt hij na een fout of op verzoek,
  // bij Zelf doen pas bij tip 3.
  const somOpen = tips.niveau >= 3;
  const zicht = stappen.map((s) => s.invoer || begeleid || tips.niveau >= 2);
  const invoerIdx = stappen.map((s, i) => (s.invoer && zicht[i] ? i : -1)).filter((i) => i >= 0);
  const [goedStap, setGoedStap] = useState<boolean[]>(() => stappen.map(() => alGoed));
  // Tip 3: de eerste stap staat voorgedaan.
  useEffect(() => {
    if (tips.niveau >= 3 && invoerIdx.length && !goedStap[invoerIdx[0]]) {
      const n = [...goedStap];
      n[invoerIdx[0]] = true;
      setGoedStap(n);
    }
  }, [tips.niveau]); // eslint-disable-line react-hooks/exhaustive-deps
  const huidige = toonStappen ? (invoerIdx.find((i) => !goedStap[i]) ?? -1) : -1;
  const stappenKlaar = !toonStappen || huidige === -1;
  const laatste = stappen[stappen.length - 1];
  const a = o.antwoord;
  const laatsteIsAntwoord = !!(
    laatste &&
    laatste.invoer &&
    typeof laatste.uitkomst === 'number' &&
    a &&
    typeof a.waarde === 'number' &&
    Math.abs(rond(laatste.uitkomst, a.afronding as Afronding) - a.waarde) < 1e-9
  );
  const getal = (o.type === 'getal' || o.type === 'puzzel') && a && typeof a.waarde === 'number';
  // Zelf doen en eindcheck: altijd een los antwoordvak. Begeleid: alleen als de laatste stap het antwoord niet is.
  const losAntwoord = getal && (!begeleid || !laatsteIsAntwoord);

  const focus = useSpel((s) => s.focusStap);
  const gekozenDeel = useSpel((s) => s.gekozenDeel);
  useEffect(() => {
    if (!gekozenDeel) return;
    const i = stappen.findIndex((s) => s.deel === gekozenDeel);
    if (i >= 0) useSpel.getState().setFocusStap(i);
  }, [gekozenDeel]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (huidige < 0) return;
    const s = stappen[huidige];
    if (s.deel) {
      useSpel.getState().kiesDeel(s.deel);
      if (useSpel.getState().uit < 0.5 && useSpel.getState().weergave === 'draai') animeerUit(1);
    }
  }, [huidige]); // eslint-disable-line react-hooks/exhaustive-deps

  const lijst = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const rijen = lijst.current?.querySelectorAll('.stap');
    if (rijen?.length) animate(rijen, { opacity: [0, 1], translateY: [12, 0], duration: 450, delay: stagger(110), ease: 'outQuad' });
  }, [toonStappen]);

  const zetGoed = (i: number) => {
    const n = [...goedStap];
    n[i] = true;
    setGoedStap(n);
    geluid('goed');
    const rest = invoerIdx.filter((k) => !n[k]);
    if (!rest.length && o.type === 'getal' && (laatsteIsAntwoord || !getal)) rondAf(o);
  };

  return (
    <>
      {toonStappen && (
        <div className="stappen" ref={lijst}>
          {!begeleid && <div className="stappen-kop">Tip 2 · De stappen{somOpen ? '' : ' (zonder getallen)'}</div>}
          {stappen.map((s, i) =>
            zicht[i] ? (
              <StapRij
                key={i}
                s={s}
                i={i}
                alle={stappen}
                o={o}
                tips={tips}
                begeleid={begeleid}
                somOpen={somOpen}
                actief={i === huidige}
                bereikt={huidige === -1 || i <= huidige || !s.invoer}
                goed={goedStap[i] || alGoed}
                focus={focus === i}
                onGoed={() => zetGoed(i)}
              />
            ) : null,
          )}
        </div>
      )}
      {losAntwoord && !alGoed && (begeleid ? stappenKlaar : true) && <AntwoordRij o={o} tips={tips} niveau={niveau} onGoed={() => rondAf(o)} />}
      {(o.type === 'keuze' || o.type === 'eenheid-kiezen') && <KeuzeRij o={o} tips={tips} open={!begeleid || stappenKlaar} alGoed={alGoed} onGoed={() => rondAf(o)} />}
    </>
  );
}

function StapRij(p: {
  s: Stap;
  i: number;
  alle: Stap[];
  o: Opdracht;
  tips: Tips;
  begeleid: boolean;
  somOpen: boolean;
  actief: boolean;
  bereikt: boolean;
  goed: boolean;
  focus: boolean;
  onGoed: () => void;
}) {
  const { s, i, begeleid, actief, bereikt, goed, focus } = p;
  const [waarde, setWaarde] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const [somNaFout, setSomNaFout] = useState(false);
  // gegeven stappen (een feit of een voorgedane stap) zijn altijd te zien bij Samen oefenen
  const somZicht = p.somOpen || (begeleid && (somNaFout || !s.invoer));
  const uit = useRef<HTMLSpanElement>(null);
  const rij = useRef<HTMLDivElement>(null);
  const veld = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (actief && begeleid) veld.current?.focus({ preventScroll: true });
  }, [actief]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (focus) rij.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focus]);
  useEffect(() => {
    if (!goed || !uit.current || typeof s.uitkomst !== 'number') return;
    const doel = s.uitkomst;
    const dec = (String(doel).split('.')[1] || '').length;
    const proxy = { v: 0 };
    const a = animate(proxy, { v: doel, duration: 900, ease: 'outCubic', onUpdate: () => uit.current && (uit.current.textContent = nl(rond(proxy.v, dec ? undefined : 'heel'), dec)) });
    return () => {
      a.pause();
    };
  }, [goed]); // eslint-disable-line react-hooks/exhaustive-deps

  const controleer = () => {
    if (stapKlopt(waarde, s)) {
      setTip(null);
      p.onGoed();
    } else {
      geluid('bijna');
      p.tips.fout();
      if (begeleid) setSomNaFout(true);
      setTip(tipBijFout(waarde, s, p.alle, i, somZicht || begeleid));
      useSpel.getState().setFocusStap(i);
      if (s.deel) useSpel.getState().kiesDeel(s.deel);
    }
  };
  const toonWidget = !!(s.trap || s.tabel);
  return (
    <div ref={rij} className={`stap${goed ? ' goed' : tip ? ' bijna' : ''}${focus || actief ? ' focus' : ''}`} style={{ opacity: bereikt ? 1 : 0.45 }}>
      <div className="stap-kop">
        <span className="nr">{goed ? <Check size={18} /> : i + 1}</span>
        {s.tekst}
      </div>
      {!s.invoer ? (
        <div className="rekenregel">
          <span className="som" style={{ fontSize: 20 }}>
            {somZicht ? s.som : '…'}
          </span>
          {s.uitkomst !== '' && somZicht && (
            <span className="uitkomst">
              <ChevronRight size={20} /> {toon(s.uitkomst, s.eenheid)}
            </span>
          )}
        </div>
      ) : (
        <div className="rekenregel">
          {somZicht || goed ? (
            <span className="som">{s.som} =</span>
          ) : !begeleid ? (
            <span className="som verborgen">? =</span>
          ) : null}
          {goed ? (
            <span className="uitkomst">
              <span ref={uit}>{typeof s.uitkomst === 'number' ? nl(s.uitkomst) : s.uitkomst}</span> {s.eenheid}
            </span>
          ) : (
            <form
              className="invoer"
              onSubmit={(e) => {
                e.preventDefault();
                controleer();
              }}
            >
              <input
                id={`stap-${i}`}
                inputMode="decimal"
                autoComplete="off"
                value={waarde}
                disabled={!actief}
                onChange={(e) => setWaarde(e.target.value)}
                aria-label={`Stap ${i + 1}: ${s.tekst}`}
                ref={veld}
              />
              {s.eenheid && <span className="eenheid">{s.eenheid}</span>}
              <button className="knop rond" type="submit" disabled={!actief || !waarde.trim()} aria-label="Controleer">
                <Check size={26} />
              </button>
            </form>
          )}
        </div>
      )}
      {begeleid && !somZicht && !goed && s.invoer && actief && (
        <button
          className="verborgen-som"
          onClick={() => {
            setSomNaFout(true);
            useSpel.getState().hulpGebruikt(p.o.id);
          }}
        >
          <Eye size={18} /> Toon de som
        </button>
      )}
      {tip && !goed && (
        <div className="feedback">
          <Portret grootte={40} zweef={false} /> {tip}
        </div>
      )}
      {toonWidget && s.trap && <Trap van={s.trap.van} naar={s.trap.naar} />}
      {toonWidget && s.tabel && <VTabel boven={s.tabel.boven} onder={s.tabel.onder} pijl={s.tabel.pijl} />}
    </div>
  );
}

function AntwoordRij({ o, tips, niveau, onGoed }: { o: Opdracht; tips: Tips; niveau: Niveau; onGoed: () => void }) {
  const a = o.antwoord!;
  const [waarde, setWaarde] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const veld = useRef<HTMLInputElement>(null);
  useEffect(() => {
    veld.current?.focus({ preventScroll: true });
  }, []);
  const controleer = () => {
    const w = a.waarde as number;
    const ok = klopt(waarde, w, a.tolerantie ?? 0) || (a.alternatieven ?? []).some((alt) => String(alt).replace(/\s/g, '') === waarde.replace(/\s/g, ''));
    if (ok) {
      setTip(null);
      onGoed();
      return;
    }
    if (!telFout(o, tips, niveau)) {
      setTip(GOK_TEKST);
      return;
    }
    const v = lees(waarde);
    const stap = o.stappen.findIndex((s) => typeof s.uitkomst === 'number' && v.some((x) => Math.abs(x - (s.uitkomst as number)) < 1e-9));
    let t = 'Nog niet goed. Kijk naar de maten en reken rustig opnieuw.';
    for (const x of v)
      for (const f of [10, 100, 1000])
        if (Math.abs(x * f - w) < 1e-6 * Math.max(1, Math.abs(w))) t = `Kan dat? Je antwoord is ${f} keer te klein.`;
        else if (Math.abs(x / f - w) < 1e-6 * Math.max(1, Math.abs(w))) t = `Kan dat? Je antwoord is ${f} keer te groot.`;
    if (stap >= 0 && stap < o.stappen.length - 1) t = 'Je bent op de goede weg. Dit is een tussenstap. Reken verder.';
    else if (a.afronding && a.afronding !== 'geen' && v.some((x) => Math.abs(x - w) < 1)) t = 'Bijna. Let op het afronden in de vraag.';
    if (!v.length) t = 'Typ een getal. Een komma mag.';
    setTip(t);
  };
  return (
    <div className={`stap antwoord${tip ? ' bijna' : ' focus'}`}>
      <div className="stap-kop">
        <span className="nr">
          <Target size={16} />
        </span>
        Je antwoord
      </div>
      <form
        className="invoer"
        onSubmit={(e) => {
          e.preventDefault();
          controleer();
        }}
      >
        <input ref={veld} id={`antwoord-${o.id}`} inputMode="decimal" autoComplete="off" value={waarde} onChange={(e) => setWaarde(e.target.value)} aria-label="Je antwoord" />
        {a.eenheid && <span className="eenheid">{a.eenheid}</span>}
        <button className="knop rond" type="submit" disabled={!waarde.trim()} aria-label="Controleer">
          <Check size={26} />
        </button>
      </form>
      {tip && (
        <div className="feedback">
          <Portret grootte={40} zweef={false} /> {tip}
        </div>
      )}
    </div>
  );
}

function KeuzeRij({ o, tips, open, alGoed, onGoed }: { o: Opdracht; tips: Tips; open: boolean; alGoed: boolean; onGoed: () => void }) {
  const [fout, setFout] = useState<string[]>([]);
  const [gok, setGok] = useState(false);
  const goedWaarde = String(o.antwoord?.waarde);
  const alts = (o.antwoord?.alternatieven ?? []).map(String);
  const isGoed = (k: string) => k === goedWaarde || alts.includes(k);
  const [gekozen, setGekozen] = useState<string | null>(alGoed ? goedWaarde : null);
  // Denkpauze na een foute keuze (niet bij samen oefenen): gokken loont niet.
  const [pauzeTot, setPauzeTot] = useState(0);
  const [nu, setNu] = useState(Date.now());
  useEffect(() => {
    if (pauzeTot <= Date.now()) return;
    const t = setInterval(() => setNu(Date.now()), 500);
    return () => clearInterval(t);
  }, [pauzeTot]);
  const pauze = Math.max(0, Math.ceil((pauzeTot - nu) / 1000));
  useEffect(() => {
    if (!geopendOp.has(o.id)) geopendOp.set(o.id, Date.now());
  }, [o.id]);
  return (
    <div className="stap" style={{ opacity: open ? 1 : 0.45 }}>
      <div className="stap-kop">
        <span className="nr">
          <Target size={16} />
        </span>
        Kies het goede antwoord
      </div>
      <div className="keuzes">
        {(o.keuzes ?? []).map((k) => (
          <button
            key={k}
            disabled={!open || pauze > 0 || (gekozen !== null && isGoed(gekozen))}
            className={gekozen === k && isGoed(k) ? 'goed' : fout.includes(k) ? 'fout' : ''}
            onClick={() => {
              if (isGoed(k)) {
                setGekozen(k);
                onGoed();
              } else if (telFout(o, tips)) {
                setGok(false);
                setFout([...fout, k]);
                if (tips.max > 0) {
                  setPauzeTot(Date.now() + 10000);
                  setNu(Date.now());
                }
              } else setGok(true);
            }}
          >
            {k}
          </button>
        ))}
      </div>
      {(gok || (fout.length > 0 && !(gekozen && isGoed(gekozen)))) && (
        <div className="feedback">
          <Portret grootte={40} zweef={false} />{' '}
          {gok ? GOK_TEKST : pauze > 0 ? `Nog niet. Denk eerst na en reken het uit. Over ${pauze} s mag je opnieuw kiezen.` : 'Nog niet. Kijk nog eens goed naar het object.'}
        </div>
      )}
    </div>
  );
}

/** Tekst-antwoord (verhouding "3 : 2", tijd "13:30", lucifers "7 + 2 = 9"). */
function normaliseer(t: string) {
  return t
    .toLowerCase()
    .replace(/uur|u\b/g, '')
    .replace(/[−–]/g, '-')
    .replace(/[×x*]/g, '×')
    .replace(/\s+/g, '')
    .replace(/(\d)\.(\d\d)$/, '$1:$2');
}
function TekstWerk({ o, tips, alGoed }: { o: Opdracht; tips: Tips; alGoed: boolean }) {
  const a = o.antwoord!;
  const [waarde, setWaarde] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => {
    if (!geopendOp.has(o.id)) geopendOp.set(o.id, Date.now());
  }, [o.id]);
  if (alGoed) return null;
  const goed = [a.waarde, ...(a.alternatieven ?? [])].map((x) => normaliseer(String(x)));
  const verhouding = /^\d+:\d+$/.test(normaliseer(String(a.waarde)));
  const controleer = () => {
    const n = normaliseer(waarde);
    let ok = goed.includes(n);
    // Verhouding: ook goed als hij gelijkwaardig is én zo klein mogelijk gevraagd is? Alleen exacte alternatieven tellen.
    if (!ok && verhouding && /^\d+:\d+$/.test(n) && /zo klein/i.test(o.vraag.join(' '))) ok = false;
    if (ok) {
      rondAf(o);
      return;
    }
    if (!telFout(o, tips)) return setTip(GOK_TEKST);
    if (verhouding && /^\d+:\d+$/.test(n)) {
      const [p, q] = n.split(':').map(Number);
      const [g1, g2] = normaliseer(String(a.waarde)).split(':').map(Number);
      setTip(Math.abs(p * g2 - q * g1) < 1e-9 ? 'Die verhouding klopt, maar maak hem zo klein mogelijk.' : 'Nog niet. Let op de volgorde: wat staat er eerst in de vraag?');
    } else setTip(verhouding ? 'Schrijf het als een verhouding, zoals 2 : 5.' : 'Nog niet goed. Kijk nog eens goed.');
  };
  return (
    <div className={`stap antwoord${tip ? ' bijna' : ' focus'}`}>
      <div className="stap-kop">
        <span className="nr">
          <Target size={16} />
        </span>
        Je antwoord {verhouding ? '(bijvoorbeeld 2 : 5)' : ''}
      </div>
      <form
        className="invoer"
        onSubmit={(e) => {
          e.preventDefault();
          controleer();
        }}
      >
        <input autoFocus id={`antwoord-${o.id}`} autoComplete="off" value={waarde} onChange={(e) => setWaarde(e.target.value)} aria-label="Je antwoord" />
        <button className="knop rond" type="submit" disabled={!waarde.trim()} aria-label="Controleer">
          <Check size={26} />
        </button>
      </form>
      {tip && (
        <div className="feedback">
          <Portret grootte={40} zweef={false} /> {tip}
        </div>
      )}
    </div>
  );
}

// ── Rekentekens-puzzels: maak 24, maak 6 ──

const cijfers = (toks: Tok[]) =>
  toks
    .filter((x): x is { t: 'g'; v: number } => x.t === 'g')
    .map((x) => x.v)
    .sort((a, b) => a - b)
    .join(',');

function ExpressieWerk({ o, tips, alGoed }: { o: Opdracht; tips: Tips; alGoed: boolean }) {
  const a = o.antwoord!;
  const voorbeeld = tokens(String(a.waarde))!;
  const doel = reken(voorbeeld);
  const nodig = cijfers(voorbeeld);
  const [waarde, setWaarde] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => {
    if (!geopendOp.has(o.id)) geopendOp.set(o.id, Date.now());
  }, [o.id]);
  if (alGoed) return null;
  const tk = tokens(waarde);
  const nu = tk ? reken(tk) : null;
  const controleer = () => {
    if (tk && nu !== null && doel !== null && Math.abs(nu - doel) < 1e-9 && cijfers(tk) === nodig) {
      rondAf(o);
      return;
    }
    if (!telFout(o, tips)) return setTip(GOK_TEKST);
    if (!tk || nu === null) setTip('Die som kan ik niet lezen. Gebruik cijfers, + − × : √ en haakjes.');
    else if (cijfers(tk) !== nodig) setTip(`Gebruik precies deze getallen: ${nodig.split(',').join(', ')}.`);
    else setTip(`Jouw som geeft ${nl(nu)}. Je moet ${nl(doel ?? 0)} maken.`);
  };
  const knop = (t: string) => setWaarde((w) => w + t);
  return (
    <div className={`stap antwoord${tip ? ' bijna' : ' focus'}`}>
      <div className="stap-kop">
        <span className="nr">
          <Target size={16} />
        </span>
        Typ je som (uitkomst {nl(doel ?? 0)})
      </div>
      <form
        className="invoer"
        onSubmit={(e) => {
          e.preventDefault();
          controleer();
        }}
      >
        <input autoFocus id={`antwoord-${o.id}`} autoComplete="off" value={waarde} onChange={(e) => setWaarde(e.target.value)} aria-label="Je som" />
        <button className="knop rond" type="submit" disabled={!waarde.trim()} aria-label="Controleer">
          <Check size={26} />
        </button>
      </form>
      <div className="rekentekens" aria-label="Rekentekens">
        {['+', '−', '×', ':', '√', '(', ')'].map((t) => (
          <button key={t} type="button" onClick={() => knop(t === '−' ? '-' : t)}>
            {t}
          </button>
        ))}
        <button type="button" onClick={() => setWaarde((w) => w.slice(0, -1))} aria-label="Wis laatste teken">
          ⌫
        </button>
      </div>
      {nu !== null && waarde.trim() && <div className="stil">Jouw som geeft nu: {nl(nu)}</div>}
      {tip && (
        <div className="feedback">
          <Portret grootte={40} zweef={false} /> {tip}
        </div>
      )}
    </div>
  );
}

function Gelukt({ o, st }: { o: Opdracht; st: Station }) {
  const index = useSpel((s) => s.opdrachtIndex);
  const voortgang = useSpel((s) => s.voortgang);
  const ref = useRef<HTMLDivElement>(null);
  const klus = klusVan(st.id);
  const stationKlaar = st.opdrachten.every((id) => voortgang[id]?.goed);
  useLayoutEffect(() => {
    if (ref.current) animate(ref.current.children, { scale: [0.8, 1], opacity: [0, 1], duration: 500, delay: stagger(250), ease: 'outBack' });
  }, []);
  const volgende = st.opdrachten.findIndex((id, i) => i !== index && !voortgang[id]?.goed);
  return (
    <div ref={ref} className="gelukt-groep">
      <div className="gelukt" role="status">
        <Check size={30} />
        <div style={{ flex: 1 }}>Goed zo! {o.antwoord && typeof o.antwoord.waarde === 'number' ? toon(o.antwoord.waarde, o.antwoord.eenheid) : ''}</div>
        {volgende >= 0 ? (
          <button className="knop" onClick={() => useSpel.getState().setOpdrachtIndex(volgende)}>
            Volgende <ChevronRight size={22} />
          </button>
        ) : (
          <button className="knop" onClick={() => useSpel.getState().sluit()}>
            Verder <ChevronRight size={22} />
          </button>
        )}
      </div>
      {klus && stationKlaar && (
        <div className="codevondst" style={{ borderColor: klus.kleur + '88' }}>
          <Symbool i={klus.stations.indexOf(st.id)} kleur={klus.kleur} size={34} />
          <span className="code-cijfer">{cijferVan(st.id)}</span>
          <span>
            Code voor de kluis <strong>{klus.naam}</strong>. Staat in je klusboek.
          </span>
        </div>
      )}
    </div>
  );
}

/** De kluis: zet de wielen op de gevonden code. */
function KluisPaneel({ st }: { st: Station }) {
  const def = huidig();
  const klus = def.klussen.find((k) => k.id === st.klus)!;
  const voortgang = useSpel((s) => s.voortgang);
  const open = useSpel((s) => !!s.kluizen[`${s.wereld}:${klus.id}`]);
  const codes = codesVan(klus, voortgang);
  const [wielen, setWielen] = useState<number[]>(() => codes.map(() => 0));
  const [pogingen, setPogingen] = useState(0);
  const [melding, setMelding] = useState<string | null>(null);
  const draai = (i: number, d: number) => {
    geluid('schuif');
    setWielen((w) => w.map((x, k) => (k === i ? (x + d + 10) % 10 : x)));
  };
  const probeer = () => {
    const goed = codes.filter((c, i) => wielen[i] === c.cijfer).length;
    if (goed === codes.length) {
      kluisGeopend(klus.id);
      setMelding(null);
      return;
    }
    geluid('bijna');
    const n = pogingen + 1;
    setPogingen(n);
    setMelding(n < 2 ? 'Klik… de kluis blijft dicht.' : `${goed} van de ${codes.length} wielen staan goed.`);
  };
  const gevonden = codes.filter((c) => c.gevonden).length;
  return (
    <aside className="paneel" aria-label="Kluis">
      <div className="paneel-kop">
        <div className="soort verplicht" style={{ color: klus.kleur, borderColor: klus.kleur + '66', background: klus.kleur + '1f' }}>
          {open ? <LockOpen size={26} /> : <Lock size={26} />}
        </div>
        <div>
          <h2>Kluis: {klus.naam}</h2>
          <div className="sub">Cijferslot · {codes.length} wielen</div>
        </div>
      </div>
      <div className="paneel-inhoud">
        <div className="vraag">
          <p>Elk station van deze klus geeft een symbool met een cijfer.</p>
          <p>Zet elk wiel op het cijfer bij zijn symbool.</p>
        </div>
        <div className="stap">
          <div className="stap-kop">
            Gevonden codes ({gevonden} van {codes.length})
          </div>
          <div className="codelijst">
            {codes.map((c) => (
              <div key={c.station.id} className={`code-rij${c.gevonden ? '' : ' leeg'}`}>
                <Symbool i={c.symbool} kleur={klus.kleur} size={22} />
                <span className="code-naam">
                  {c.station.titel}
                  {kamerVan(c.station.pos, c.station.verdieping) && <span className="stil"> · {kamerVan(c.station.pos, c.station.verdieping)}</span>}
                </span>
                <span className="code-cijfer klein">{c.gevonden ? c.cijfer : '?'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`wielen${open ? ' open' : ''}`}>
          {codes.map((c, i) => (
            <div key={i} className="wiel">
              <Symbool i={c.symbool} kleur={klus.kleur} size={26} />
              <button className="knop licht rond" disabled={open} onClick={() => draai(i, 1)} aria-label={`Wiel ${i + 1} omhoog`}>
                <Plus size={22} />
              </button>
              <input
                className="wiel-cijfer"
                inputMode="numeric"
                maxLength={1}
                value={open ? c.cijfer : wielen[i]}
                disabled={open}
                aria-label={`Wiel ${i + 1} (${['driehoek', 'rondje', 'vierkant', 'ster'][c.symbool]})`}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(-1);
                  if (v) setWielen((w) => w.map((x, k) => (k === i ? Number(v) : x)));
                }}
                onFocus={(e) => e.target.select()}
              />
              <button className="knop licht rond" disabled={open} onClick={() => draai(i, -1)} aria-label={`Wiel ${i + 1} omlaag`}>
                <Minus size={22} />
              </button>
            </div>
          ))}
        </div>
        {open ? (
          <div className="gelukt">
            <KeyRound size={30} />
            <div style={{ flex: 1 }}>Open! De sleutel zit in de poort.</div>
            <button className="knop" onClick={() => useSpel.getState().sluit()}>
              Verder <ChevronRight size={22} />
            </button>
          </div>
        ) : (
          <>
            <button className="knop" onClick={probeer}>
              <KeyRound size={22} /> Open de kluis
            </button>
            {melding && (
              <div className="feedback">
                <Portret grootte={40} zweef={false} /> {melding}
              </div>
            )}
            {gevonden < codes.length && <div className="stil">Nog niet alle codes gevonden. Los eerst de stations met dit symbool op.</div>}
          </>
        )}
      </div>
    </aside>
  );
}

/** Namen koppelen aan figuren (vormslot). */
function KoppelWerk({ o, tips }: { o: Opdracht; tips: Tips }) {
  const k = o.koppel!;
  const alGoed = useSpel((s) => !!s.voortgang[o.id]?.goed);
  const [keuze, setKeuze] = useState<string[]>(() => k.items.map((it) => (alGoed ? it.antwoord : '')));
  const [gecheckt, setGecheckt] = useState(alGoed);
  if (alGoed) return null;
  const controleer = () => {
    setGecheckt(true);
    const ok = k.items.every((it, i) => keuze[i] === it.antwoord);
    if (ok) rondAf(o);
    else telFout(o, tips);
  };
  return (
    <>
      <div className="koppel">
        {k.items.map((it, i) => (
          <div key={it.label} className={`koppel-rij${gecheckt && keuze[i] ? (keuze[i] === it.antwoord ? ' goed' : ' fout') : ''}`}>
            <label htmlFor={`k-${o.id}-${i}`}>{it.label}</label>
            <select
              id={`k-${o.id}-${i}`}
              value={keuze[i]}
              onChange={(e) => {
                const n = [...keuze];
                n[i] = e.target.value;
                setKeuze(n);
                setGecheckt(false);
              }}
            >
              <option value="">kies…</option>
              {k.opties.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button className="knop" onClick={controleer} disabled={keuze.some((x) => !x)}>
        <Check size={22} /> Controleer
      </button>
      {gecheckt && (
        <div className="feedback">
          <Portret grootte={40} zweef={false} /> De oranje vakjes kloppen nog niet. Kijk naar de vorm in 3D.
        </div>
      )}
    </>
  );
}

/** Kruissom: vul de lege vakjes met de tegels (tegelslot). */
function KruisWerk({ o, tips }: { o: Opdracht; tips: Tips }) {
  const pz = o.puzzel!;
  const alGoed = useSpel((s) => !!s.voortgang[o.id]?.goed);
  const oplossing = String(o.antwoord?.waarde ?? '')
    .split(',')
    .map((x) => x.trim());
  const leeg = useMemo(() => pz.rooster.flatMap((r, ri) => r.map((v, ci) => (v === '' ? `${ri},${ci}` : null)).filter(Boolean) as string[]), [pz]);
  const [vak, setVak] = useState<Record<string, string>>(() => (alGoed ? Object.fromEntries(leeg.map((k, i) => [k, oplossing[i]])) : {}));
  const vol = pz.rooster.map((r, ri) => r.map((v, ci) => (v === '' ? (vak[`${ri},${ci}`] ?? '') : v)));
  const loopjes = looptjesVan(pz.rooster);
  const goedeCellen = new Set<string>();
  for (const l of loopjes) {
    if (rekenRij(l.map(([r, c]) => vol[r][c]))) l.forEach(([r, c]) => goedeCellen.add(`${r},${c}`));
  }
  const gebruikt = Object.values(vak).filter(Boolean).map(Number);
  const tegels = pz.tegels?.length ? [...pz.tegels] : [];
  const tegelStatus = tegels.map((t) => {
    const j = gebruikt.indexOf(t);
    if (j >= 0) {
      gebruikt.splice(j, 1);
      return true;
    }
    return false;
  });
  const controleer = () => {
    const ok = loopjes.every((l) => rekenRij(l.map(([r, c]) => vol[r][c]))) && leeg.every((k) => vak[k]);
    const tegelsKloppen =
      !tegels.length ||
      [...tegels].sort((a, b) => a - b).join() ===
        leeg
          .map((k) => Number(vak[k]))
          .sort((a, b) => a - b)
          .join();
    if (ok && tegelsKloppen) rondAf(o);
    else telFout(o, tips);
  };
  return (
    <>
      {tegels.length > 0 && (
        <div className="tegels" aria-label="Tegels">
          {tegels.map((t, i) => (
            <span key={i} className={tegelStatus[i] ? 'gebruikt' : ''}>
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="kruis">
        <table>
          <tbody>
            {pz.rooster.map((r, ri) => (
              <tr key={ri}>
                {r.map((v, ci) => {
                  const k = `${ri},${ci}`;
                  if (v === '#') return <td key={ci} />;
                  if (v !== '')
                    return (
                      <td key={ci} className={goedeCellen.has(k) ? 'vast goed' : 'vast'}>
                        {v === 'x' ? '×' : v}
                      </td>
                    );
                  return (
                    <td key={ci} className={goedeCellen.has(k) ? 'leeg-vak goed' : 'leeg-vak'}>
                      <input
                        inputMode="numeric"
                        aria-label={`Vak rij ${ri + 1} kolom ${ci + 1}`}
                        value={vak[k] ?? ''}
                        disabled={alGoed}
                        onChange={(e) => setVak({ ...vak, [k]: e.target.value.replace(/\D/g, '') })}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!alGoed && (
        <button className="knop" onClick={controleer}>
          <Check size={22} /> Controleer
        </button>
      )}
    </>
  );
}

/** Praktijkopdracht: werkstappen + docentcode. */
function OpenWerk({ o }: { o: Opdracht }) {
  const alGoed = useSpel((s) => !!s.voortgang[o.id]?.goed);
  const st = useSpel((s) => (s.actief ? stationVan(s.actief) : null));
  const [code, setCode] = useState('');
  const [fout, setFout] = useState(false);
  const mist = o.type !== 'open' && !o.antwoord;
  return (
    <>
      {mist && (
        <div className="tipkaart">
          <Portret grootte={40} zweef={false} />
          <div>In het werkboek mist een gegeven. Vraag het aan je docent, reken het uit en laat je berekening zien. Je docent geeft je dan een code.</div>
        </div>
      )}
      <div className="stappen">
        {o.stappen.map((s, i) => (
          <div key={i} className="stap">
            <div className="stap-kop">
              <span className="nr">{i + 1}</span>
              {s.tekst}
            </div>
            <div style={{ fontSize: 18 }}>{s.som}</div>
          </div>
        ))}
      </div>
      {alGoed ? (
        st && <Gelukt o={o} st={st} />
      ) : (
        <form
          className="stap focus"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim() === BUITEN_CODE) rondAf(o);
            else {
              setFout(true);
              geluid('bijna');
            }
          }}
        >
          <div className="stap-kop">
            <span className="nr">
              <Lock size={16} />
            </span>
            Klaar? Je docent geeft je een code.
          </div>
          <div className="invoer">
            <input id="docentcode" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Code van je docent" />
            <button className="knop" type="submit" disabled={!code.trim()}>
              Open
            </button>
          </div>
          {fout && <div className="feedback">Die code klopt niet. Vraag het je docent.</div>}
        </form>
      )}
    </>
  );
}

/** Instructie: de computer doet het voor, stap voor stap, in jouw tempo. */
function DemoWerk({ o }: { o: Opdracht }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const s = o.stappen[n - 1];
    if (!s) return;
    if (s.deel) {
      useSpel.getState().kiesDeel(s.deel);
      animeerUit(1);
    } else useSpel.getState().kiesDeel(null);
    geluid('schuif');
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = maatjeVan();
  const zin =
    n === 0 ? `Let goed op. Ik doe het een keer voor, stap voor stap.` : n < o.stappen.length ? `Stap ${n} is klaar. Kijk naar het model: dat deel licht op.` : `Zo doe je het! Nu ga jij oefenen.`;
  return (
    <>
      <div className="tipkaart maatje-uitleg">
        <Portret grootte={44} zweef={false} />
        <div>
          <strong style={{ color: m.kleur }}>{m.naam}:</strong> {zin}
        </div>
      </div>
      <div className="stappen">
        {o.stappen.slice(0, n).map((s, i) => (
          <DemoStap key={i} s={s} i={i} />
        ))}
      </div>
      {n < o.stappen.length ? (
        <button className="knop" onClick={() => setN(n + 1)}>
          {n === 0 ? 'Start de uitleg' : 'Volgende stap'} <ChevronRight size={22} />
        </button>
      ) : (
        <>
          <div className="gelukt">
            <Check size={30} /> Zo reken je het uit: {toon(o.antwoord!.waarde, o.antwoord!.eenheid)}
          </div>
          <button
            className="knop"
            onClick={() => {
              geluid('klaar');
              const s = useSpel.getState();
              s.setFase('begeleid');
              s.sluit();
            }}
          >
            Ik snap het! <ChevronRight size={22} />
          </button>
        </>
      )}
    </>
  );
}

function DemoStap({ s, i }: { s: Stap; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const uit = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (ref.current) animate(ref.current, { opacity: [0, 1], translateY: [14, 0], duration: 450, ease: 'outQuad' });
    if (uit.current && typeof s.uitkomst === 'number') {
      const p = { v: 0 };
      const doel = s.uitkomst;
      animate(p, {
        v: doel,
        duration: 1200,
        delay: 400,
        ease: 'outCubic',
        onUpdate: () => uit.current && (uit.current.textContent = nl(Number.isInteger(doel) ? Math.round(p.v) : rond(p.v, '2-decimalen'))),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} className="stap goed">
      <div className="stap-kop">
        <span className="nr">{i + 1}</span>
        {s.tekst}
      </div>
      <div className="rekenregel">
        <span className="som">{s.som} =</span>
        <span className="uitkomst">
          <span ref={uit}>0</span> {s.eenheid}
        </span>
      </div>
      {s.trap && <Trap van={s.trap.van} naar={s.trap.naar} />}
      {s.tabel && <VTabel boven={s.tabel.boven} onder={s.tabel.onder} pijl={s.tabel.pijl} />}
    </div>
  );
}

/** Tweelingsom: zelfde soort som, andere getallen. Speelt zichzelf af. */
function Voorbeeld({ o, sluit }: { o: Opdracht; sluit: () => void }) {
  const v = o.voorbeeld!;
  const lijst = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const rijen = lijst.current?.querySelectorAll('.stap');
    if (!rijen) return;
    animate(rijen, { opacity: [0, 1], translateY: [14, 0], duration: 500, delay: stagger(1100, { start: 300 }), ease: 'outQuad' });
    const tellers = lijst.current?.querySelectorAll<HTMLElement>('[data-doel]');
    tellers?.forEach((el, i) => {
      const doel = Number(el.dataset.doel);
      const p = { v: 0 };
      animate(p, { v: doel, duration: 900, delay: 700 + i * 1100, ease: 'outCubic', onUpdate: () => (el.textContent = nl(Number.isInteger(doel) ? Math.round(p.v) : rond(p.v, '2-decimalen'))) });
    });
  }, []);
  return (
    <div className="voorbeeld" role="dialog" aria-label="Voorbeeld met andere getallen">
      <div className="paneel-kop">
        <div className="soort keuze">
          <Lightbulb size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <h2>Voorbeeld</h2>
          <div className="sub">Zelfde soort som, andere getallen</div>
        </div>
        <button className="knop licht rond" onClick={sluit} aria-label="Sluit voorbeeld">
          <X size={24} />
        </button>
      </div>
      <div className="paneel-inhoud" ref={lijst}>
        <div className="vraag">
          {v.vraag.map((z, i) => (
            <p key={i}>{z}</p>
          ))}
        </div>
        {v.stappen.map((s, i) => (
          <div key={i} className="stap goed" style={{ opacity: 0 }}>
            <div className="stap-kop">
              <span className="nr">{i + 1}</span>
              {s.tekst}
            </div>
            <div className="rekenregel">
              <span className="som">{s.som}</span>
              <span className="uitkomst">
                <ChevronRight size={20} /> {typeof s.uitkomst === 'number' ? <span data-doel={s.uitkomst}>0</span> : s.uitkomst} {s.eenheid}
              </span>
            </div>
            {s.trap && <Trap van={s.trap.van} naar={s.trap.naar} />}
            {s.tabel && <VTabel boven={s.tabel.boven} onder={s.tabel.onder} pijl={s.tabel.pijl} />}
          </div>
        ))}
        <div className="stap goed" style={{ opacity: 0 }}>
          <div className="stap-kop">
            <span className="nr">
              <Target size={16} />
            </span>
            Antwoord
          </div>
          <div className="uitkomst">{toon(v.antwoord.waarde, v.antwoord.eenheid)}</div>
        </div>
        <button className="knop" onClick={sluit}>
          Nu zelf proberen <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

/** Staat voorlezen aan? Dan wordt de vraag voorgelezen zodra je hem opent (en stopt het als je weggaat). */
function Voorlezer({ tekst }: { tekst: string }) {
  useEffect(() => {
    if (useSpel.getState().voorlezen) leesVoor(tekst);
    return () => stopVoorlezen();
  }, [tekst]);
  return null;
}
