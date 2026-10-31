// Het maatje (sidekick) van een wereld. Het zweeft aan als er iets te zeggen is: de start, elke hint,
// elke melding (deur open, code gevonden, kluis open). Daarna wijst het nog even de weg en zweeft dan weg.
// Het portret (een foto van het 3D-model) staat in de kaarten en het rekenpaneel.
import { Html } from '@react-three/drei';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { create } from 'zustand';
import { leesVoor } from '../lib/spraak';
import { geluid } from '../lib/geluid';
import { alleWerelden, huidig, stationsVan, stationVan } from '../werelden';
import type { Maatje, WereldDef } from '../werelden/types';
import { speler, useSpel, type Fase, type Score } from './store';
import { maatjeScene } from './lagen';
import { kluisOpen, volgendDoel } from './voortgang';
import { trapOp } from './huis';
import { PORTRET } from '../ui/beelden';

// ── Standaard-maatje: een klein spookje (voor werelden zonder eigen maatje) ──

function Spookje() {
  const lijf = useMemo(() => new THREE.MeshStandardMaterial({ color: '#eef6ff', emissive: '#b9dcff', emissiveIntensity: 0.6, roughness: 0.45 }), []);
  const oog = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1d2433' }), []);
  return (
    <group>
      <mesh material={lijf} position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={lijf} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.56, 0.6, 24, 1, true]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} material={lijf} position={[Math.cos(a) * 0.44, -0.4, Math.sin(a) * 0.44]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 0.22, 8]} />
          </mesh>
        );
      })}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} material={oog} position={[x, 0.22, 0.46]}>
          <sphereGeometry args={[0.075, 10, 8]} />
        </mesh>
      ))}
      <mesh material={oog} position={[0, 0.03, 0.49]}>
        <sphereGeometry args={[0.05, 8, 6]} />
      </mesh>
    </group>
  );
}

export const STANDAARD_MAATJE: Maatje = {
  naam: 'Spookje',
  wie: 'je gids',
  kleur: '#b9dcff',
  Model: Spookje,
  intro: [['Hoi! Ik ben je gids.', 'Ik zweef met je mee en help je onderweg.']],
  goed: ['Top!', 'Goed zo!'],
};

export const maatjeVan = (def: WereldDef = huidig()) => def.maatje ?? STANDAARD_MAATJE;

/** Vangt een fout in een maatje-model op, zodat de rest van het spel gewoon doorgaat. */
class Veilig extends Component<{ children: ReactNode }, { fout: boolean }> {
  state = { fout: false };
  static getDerivedStateFromError() {
    return { fout: true };
  }
  componentDidCatch(e: unknown) {
    console.warn('Maatje-model gaf een fout en wordt overgeslagen:', e);
  }
  render() {
    return this.state.fout ? null : this.props.children;
  }
}

// ── Wat het maatje zegt ─────────────────────────────────────────────────

export type SpraakSoort = 'hint' | 'melding' | 'goed';
interface Spraak {
  id: number;
  tekst: string;
  soort: SpraakSoort;
  duur: number;
}

interface MaatjeStaat {
  spraak: Spraak | null;
  /** Schrikmoment: het maatje springt achter iets vandaan (bv. een boom). */
  schrik: { x: number; z: number; tekst: string } | null;
  /** Wat het maatje hierna nog wil zeggen. */
  rij: Spraak[];
  /** Foto's van de maatjes per wereld (data-URL). */
  fotos: Record<number, string>;
}
// de portretten staan al klaar (zie ui/beelden.ts); MaatjeFotos tekent alleen wat er nog niet is
export const useMaatje = create<MaatjeStaat>(() => ({ spraak: null, schrik: null, rij: [], fotos: { ...PORTRET } }));

/** Laat het maatje achter een plek (x, z) vandaan springen: "BOE!" — en daarna iets zeggen. */
export function schrik(x: number, z: number, tekst: string) {
  useMaatje.setState({ schrik: { x, z, tekst }, spraak: null, rij: [] });
}

let volgnr = 1;
/** Laat het maatje iets zeggen (het zweeft aan). `achteraan`: pas na wat het nu zegt. */
export function zeg(tekst: string, soort: SpraakSoort = 'melding', achteraan = false) {
  const duur = Math.max(soort === 'hint' ? 6.5 : 4.4, tekst.length / 15 + 2.2);
  const nieuw = { id: volgnr++, tekst, soort, duur };
  const st = useMaatje.getState();
  if (st.spraak?.tekst === tekst) return;
  if (achteraan && st.spraak) useMaatje.setState({ rij: [...st.rij.filter((r) => r.tekst !== tekst), nieuw] });
  else useMaatje.setState({ spraak: nieuw });
}
/** Klaar met praten: volgende uit de rij, of stil. */
export function zwijg() {
  const [volgende, ...rest] = useMaatje.getState().rij;
  useMaatje.setState({ spraak: volgende ?? null, rij: rest });
}

/** Wat moet je nu doen? Dezelfde tekst als vroeger in de hintbalk. */
export function hintTekst(fase: Fase = useSpel.getState().fase, voortgang: Record<string, Score> = useSpel.getState().voortgang, def: WereldDef = huidig()) {
  const doel = volgendDoel(fase, voortgang);
  const doelSt = doel && doel !== 'poort' ? stationVan(doel, def) : null;
  const naam = doel === 'poort' ? 'de poort' : (doelSt?.titel ?? '');
  const open = def.klussen.filter((k) => !kluisOpen(k.id)).length;
  if (fase === 'terugblik') return def.hintTerugblik;
  if (fase === 'doel') return 'Tik op het boekje rechtsboven voor je missie.';
  if (fase === 'instructie') return def.hintInstructie;
  if (fase === 'begeleid') return `We oefenen samen. Ga naar: ${naam}. Volg mij maar!`;
  if (fase === 'zelfstandig')
    return doelSt?.rol === 'kluis'
      ? `De code is compleet! Open de kluis van ${doelSt.titel.replace('Kluis: ', '').toLowerCase()}.`
      : `Nu zelf: zoek de codes voor ${open === 1 ? 'de laatste kluis' : `${open} kluizen`}. Paarse sterren zijn extra.`;
  if (fase === 'evaluatie') return doel === 'poort' ? 'Alles is af. Ga naar de poort!' : `Eindcheck! Ga naar: ${naam}.`;
  return 'De poort is open. Goed gedaan!';
}

const hintSleutel = (s = useSpel.getState()) => `${s.wereld}|${s.fase}|${volgendDoel(s.fase, s.voortgang)}|${Object.keys(s.kluizen).length}`;

/** Regie: meldingen en hints omzetten in spraak, op het goede moment. */
function useRegie() {
  const gezegd = useRef<string>('');
  const wacht = useRef<{ tekst: string; soort: SpraakSoort; tijd: number }[]>([]);
  useEffect(() => {
    const vrij = (s = useSpel.getState()) => s.modus === 'lopen' && !s.kaart;
    const uitroep = () => {
      const g = maatjeVan().goed;
      return g?.length ? `${g[Math.floor(Math.random() * g.length)]} ` : '';
    };
    const af = useSpel.subscribe((s, vorig) => {
      // melding → spraak (of bewaren tot je weer rondloopt)
      if (s.melding && s.melding !== vorig.melding) {
        const tekst = s.meldingSoort === 'goed' ? uitroep() + s.melding : s.melding;
        const soort: SpraakSoort = s.meldingSoort === 'goed' ? 'goed' : 'melding';
        if (vrij(s)) zeg(tekst, soort);
        else wacht.current = [...wacht.current.slice(-2), { tekst, soort, tijd: Date.now() }];
        queueMicrotask(() => useSpel.getState().setMelding(null));
        return;
      }
      const nuVrij = vrij(s);
      const wasVrij = vrij(vorig);
      if (!nuVrij) return;
      // terug van een kaart of uit de inspectie
      if (!wasVrij) {
        const bewaard = wacht.current.filter((w) => Date.now() - w.tijd < 30000);
        wacht.current = [];
        const sleutel = hintSleutel(s);
        const nieuweHint = sleutel !== gezegd.current || !!vorig.kaart;
        gezegd.current = sleutel;
        setTimeout(() => {
          if (!vrij()) return;
          bewaard.forEach((w, i) => zeg(w.tekst, w.soort, i > 0));
          // een gewone deur-melding is minder belangrijk dan de nieuwe opdracht
          if (nieuweHint && !bewaard.some((w) => w.soort === 'goed' && /kluis/i.test(w.tekst))) zeg(hintTekst(), 'hint', bewaard.length > 0);
        }, 450);
        return;
      }
      // nieuwe opdracht terwijl je rondloopt (bv. nieuwe fase)
      const sleutel = hintSleutel(s);
      if (sleutel !== gezegd.current) {
        gezegd.current = sleutel;
        zeg(hintTekst(), 'hint');
      }
    });
    return af;
  }, []);
}

// ── Het maatje in 3D ────────────────────────────────────────────────────

type Stand = 'weg' | 'gids' | 'praat' | 'kaart' | 'schrik';
const ndc = new THREE.Vector3();
const doelPos = new THREE.Vector3();
const tmp = new THREE.Vector3();
const delta = new THREE.Matrix4();

/** Punt op het scherm (NDC x, y) op `afstand` meter voor de camera. */
function voorCamera(cam: THREE.PerspectiveCamera, x: number, y: number, afstand: number, uit: THREE.Vector3) {
  ndc.set(x, y, 0.5).unproject(cam).sub(cam.position).normalize();
  return uit.copy(cam.position).addScaledVector(ndc, afstand);
}

function Ballon({ spraak, kleur, naam }: { spraak: Spraak; kleur: string; naam: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  // Blijf binnen het scherm (smalle telefoons): schuif de ballon zo nodig opzij.
  useEffect(() => {
    let id = 0;
    const stap = () => {
      const el = ref.current;
      if (el) {
        const oud = parseFloat(el.style.getPropertyValue('--schuif') || '0');
        const r = el.getBoundingClientRect();
        let d = oud;
        if (r.right > innerWidth - 10) d = oud + (innerWidth - 10 - r.right);
        else if (r.left < 10) d = oud + (10 - r.left);
        else if (oud < 0 && r.right < innerWidth - 20) d = Math.min(0, oud + (innerWidth - 20 - r.right));
        if (d !== oud) el.style.setProperty('--schuif', `${d}px`);
      }
      id = requestAnimationFrame(stap);
    };
    id = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    setN(0);
    geluid('praat');
    if (useSpel.getState().voorlezen) leesVoor(spraak.tekst);
    const t = setInterval(() => setN((x) => (x >= spraak.tekst.length ? x : x + 2)), 28);
    return () => clearInterval(t);
  }, [spraak]);
  return (
    <div ref={ref} className="ballon" style={{ ['--maatje-kleur' as string]: kleur }} onClick={zwijg}>
      <div className="ballon-naam">{naam}</div>
      <div className="ballon-tekst">
        {spraak.tekst.slice(0, n)}
        <span className="ballon-rest">{spraak.tekst.slice(n)}</span>
      </div>
    </div>
  );
}

export function Maatje3D() {
  useRegie();
  const def = huidig();
  const m = maatjeVan(def);
  const ref = useRef<THREE.Group>(null);
  const lijf = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const spraak = useMaatje((s) => s.spraak);
  const kaart = useSpel((s) => s.kaart);
  const modus = useSpel((s) => s.modus);
  const stand = useRef<Stand>('weg');
  const sinds = useRef(0);
  const doelStation = useRef<[number, number] | null>(null);
  const teller = useRef(0);
  const [praatZicht, setPraatZicht] = useState(false);
  const pos = useMemo(() => new THREE.Vector3(0, 30, 0), []);
  const vorigeCam = useMemo(() => new THREE.Matrix4(), []);
  const schaal = useRef(0.001);
  const breed = size.width / size.height;
  // Model nooit schaduw laten werpen (het hangt soms vlak voor de camera).
  useEffect(() => {
    ref.current?.traverse((o) => {
      o.castShadow = false;
      o.receiveShadow = false;
    });
  });
  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = useSpel.getState();
    const t = clock.getElapsedTime();
    camera.updateMatrixWorld();
    const sp = useMaatje.getState().spraak;
    const nu = performance.now() / 1000;
    // nieuwe spraak? dan begint de tijd opnieuw
    if (sp && sp.id !== teller.current) {
      teller.current = sp.id;
      sinds.current = nu;
    }
    // spraak verlopen?
    if (sp && nu - sinds.current > sp.duur && stand.current === 'praat') zwijg();
    // schrikmoment: eerst achter de boom vandaan, dan vlak voor de camera
    const schrikNu = useMaatje.getState().schrik;
    if (schrikNu && stand.current !== 'schrik') {
      stand.current = 'schrik';
      sinds.current = nu;
      pos.set(schrikNu.x, speler.pos.y + 1.2, schrikNu.z);
      schaal.current = 0.5;
      geluid('boe');
      setPraatZicht(false);
    }
    if (stand.current === 'schrik') {
      const f = nu - sinds.current;
      if (f < 0.35) voorCamera(camera, 0.08, -0.02, 2.6, doelPos);
      else voorCamera(camera, 0.08 + Math.sin(f * 30) * 0.01, -0.02, 2.6, doelPos);
      camera.updateMatrixWorld();
      pos.lerp(doelPos, 1 - Math.exp(-dt * (f < 0.35 ? 9 : 14)));
      schaal.current += (1.05 - schaal.current) * (1 - Math.exp(-dt * 8));
      g.position.copy(pos);
      g.scale.setScalar(schaal.current);
      g.visible = true;
      g.lookAt(camera.position);
      g.rotateZ(Math.sin(f * 40) * 0.12 * Math.max(0, 1 - f));
      if (f > 1.5) {
        useMaatje.setState({ schrik: null });
        stand.current = 'praat';
        setPraatZicht(true);
        if (schrikNu) zeg(schrikNu.tekst, 'melding');
      }
      return;
    }
    // gewenste stand
    let wil: Stand;
    // Bij de start staat het maatje groot naast de kaart; andere kaarten tonen zijn portret.
    const kaartPraat = s.kaart === 'start' && breed > 1.15;
    if (s.kaart) wil = kaartPraat ? 'kaart' : 'weg';
    else if (s.modus !== 'lopen') wil = 'weg';
    else if (sp) wil = 'praat';
    else if (stand.current === 'praat' || (stand.current === 'gids' && nu - sinds.current < 16)) wil = 'gids';
    else wil = 'weg';
    if (wil !== stand.current) {
      // Was hij weg? Dan komt hij van linksboven buiten beeld aanzweven.
      if (stand.current === 'weg' && (wil === 'praat' || wil === 'kaart')) {
        voorCamera(camera, -1.5, 0.9, 6, pos);
        geluid('zweef');
      }
      if (wil === 'praat') sinds.current = nu;
      if (wil === 'gids') sinds.current = nu;
      stand.current = wil;
      setPraatZicht(wil === 'praat');
    }
    // doel van de gids (elke halve seconde)
    if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) {
      const id = volgendDoel(s.fase, s.voortgang);
      if (id === 'poort') doelStation.current = def.plan ? def.plan.uitgang.pos : def.poort.pos;
      else if (id) {
        const st = stationsVan(def).find((x) => x.id === id);
        doelStation.current = st ? st.pos : null;
        // op een andere verdieping? Dan wijst het maatje eerst naar de trap
        const v = st?.verdieping ?? 0;
        const trappen = def.plan?.trappen ?? [];
        if (st && v !== speler.verdieping && trappen.length) {
          const op = v > speler.verdieping;
          const tr = trappen.find((t) => (op ? t.van === speler.verdieping : t.van === speler.verdieping - 1));
          if (tr) doelStation.current = trapOp(tr, op ? 0 : 1);
        }
      } else doelStation.current = null;
    }
    // doelpositie per stand
    let sch = 0.5;
    let k = 3;
    if (stand.current === 'praat') {
      if (breed < 0.8) voorCamera(camera, -0.45, -0.5, 4.6, doelPos);
      else voorCamera(camera, -0.62, -0.32, 4.4, doelPos);
      sch = 0.62;
      k = 5;
    } else if (stand.current === 'kaart') {
      voorCamera(camera, 0.46, -0.14, 3.8, doelPos);
      sch = 0.7;
      k = 4;
    } else if (stand.current === 'gids') {
      let ox = -0.9;
      let oz = 0.4;
      if (doelStation.current) {
        const dx = doelStation.current[0] - speler.pos.x;
        const dz = doelStation.current[1] - speler.pos.z;
        const d = Math.hypot(dx, dz);
        if (d > 2.5) {
          ox = (dx / d) * 1.5;
          oz = (dz / d) * 1.5;
        }
      }
      doelPos.set(speler.pos.x + ox, speler.pos.y + 1.75, speler.pos.z + oz);
      sch = 0.42;
      k = 2.5;
    } else {
      voorCamera(camera, -1.6, 1.2, 7, doelPos);
      sch = 0.3;
      k = 2.2;
    }
    // Hangt het maatje voor de camera? Dan beweegt het eerst mee met de camera (geen achterstand bij het rondvliegen).
    if (stand.current === 'praat' || stand.current === 'kaart') pos.applyMatrix4(delta.copy(camera.matrixWorld).multiply(vorigeCam.invert()));
    vorigeCam.copy(camera.matrixWorld);
    pos.lerp(doelPos, 1 - Math.exp(-dt * k));
    schaal.current += (sch - schaal.current) * (1 - Math.exp(-dt * 4));
    g.position.copy(pos);
    g.scale.setScalar(schaal.current);
    // weg = onzichtbaar zodra hij buiten beeld is
    if (stand.current === 'weg') {
      tmp.copy(pos).project(camera);
      g.visible = Math.abs(tmp.x) < 1.15 && Math.abs(tmp.y) < 1.15 && tmp.z < 1;
    } else g.visible = s.cameraStand === 'derde' || stand.current !== 'gids';
    // kijkrichting
    if (stand.current === 'gids') {
      const doelX = doelStation.current ? doelStation.current[0] : speler.pos.x;
      const doelZ = doelStation.current ? doelStation.current[1] : speler.pos.z;
      g.rotation.set(0, Math.atan2(doelX - g.position.x, doelZ - g.position.z) * 0.6, Math.sin(t * 1.6) * 0.08);
    } else {
      g.lookAt(camera.position);
      g.rotateZ(Math.sin(t * 1.4) * 0.06);
    }
    // zweven
    if (lijf.current) {
      lijf.current.position.y = Math.sin(t * 2.2) * 0.12;
      lijf.current.rotation.y = stand.current === 'praat' ? Math.sin(t * 3) * 0.12 : 0;
    }
  });
  const Model = m.Model;
  const wereldScene = useThree((st) => st.scene);
  useFrame(() => {
    maatjeScene.environment = wereldScene.environment;
    maatjeScene.environmentIntensity = 0.6;
  });
  return createPortal(
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        zeg(hintTekst(), 'hint');
      }}
    >
      <group ref={lijf}>
        <Veilig>
          <Model />
        </Veilig>
      </group>
      {praatZicht && spraak && kaart === null && modus === 'lopen' && (
        <Html position={[0.55, 0.62, 0]} zIndexRange={[25, 20]} style={{ pointerEvents: 'auto' }}>
          <Ballon spraak={spraak} kleur={m.kleur} naam={m.naam} />
        </Html>
      )}
    </group>,
    maatjeScene,
  );
}

// ── Foto's van de maatjes (voor kaarten en het paneel) ──────────────────

const FOTO = 256;

/** Maakt één keer een foto van elk maatje (3D-model → plaatje), zonder extra canvas. */
export function MaatjeFotos() {
  const gl = useThree((s) => s.gl);
  // eerst het maatje van de wereld waar je nu bent, dan de rest (voor de wereldkaart)
  const lijst = useMemo(() => {
    const nu = useSpel.getState().wereld;
    const alle = alleWerelden().map((d) => ({ nr: d.nr as number, m: maatjeVan(d) }));
    const fotos = useMaatje.getState().fotos;
    return [...alle.filter((x) => x.nr === nu), ...alle.filter((x) => x.nr !== nu), { nr: 0, m: STANDAARD_MAATJE }].filter((x) => !fotos[x.nr]);
  }, []);
  const [i, setI] = useState(0);
  const scene = useMemo(() => new THREE.Scene(), []);
  const cam = useMemo(() => new THREE.PerspectiveCamera(30, 1, 0.05, 50), []);
  const rt = useMemo(() => new THREE.WebGLRenderTarget(FOTO * 2, FOTO * 2), []);
  const houder = useRef<THREE.Group>(null);
  const frames = useRef(0);
  useEffect(() => () => rt.dispose(), [rt]);
  useFrame(() => {
    const item = lijst[i];
    if (!item || !houder.current) return;
    if (++frames.current < 3) return;
    frames.current = 0;
    // kader om het model
    const box = new THREE.Box3().setFromObject(houder.current);
    if (box.isEmpty()) {
      setI(i + 1);
      return;
    }
    const midden = box.getCenter(new THREE.Vector3());
    const maat = box.getSize(new THREE.Vector3());
    const r = Math.max(maat.x, maat.y, maat.z) * 0.62;
    cam.position.set(midden.x + r * 0.55, midden.y + r * 0.35, midden.z + r / Math.tan((15 * Math.PI) / 180) * 1.05);
    cam.lookAt(midden);
    const oud = gl.getRenderTarget();
    const kleur = gl.getClearColor(new THREE.Color());
    const alfa = gl.getClearAlpha();
    gl.setRenderTarget(rt);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(scene, cam);
    const px = new Uint8Array(FOTO * 2 * FOTO * 2 * 4);
    gl.readRenderTargetPixels(rt, 0, 0, FOTO * 2, FOTO * 2, px);
    gl.setRenderTarget(oud);
    gl.setClearColor(kleur, alfa);
    // naar sRGB, rechtop, en verkleinen (zachte randen)
    const c = document.createElement('canvas');
    c.width = c.height = FOTO * 2;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(FOTO * 2, FOTO * 2);
    const srgb = (v: number) => {
      const x = v / 255;
      return Math.round(255 * (x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
    };
    for (let y = 0; y < FOTO * 2; y++)
      for (let x = 0; x < FOTO * 2; x++) {
        const a = (y * FOTO * 2 + x) * 4;
        const b = ((FOTO * 2 - 1 - y) * FOTO * 2 + x) * 4;
        const al = px[a + 3] / 255 || 1;
        img.data[b] = srgb(Math.min(255, px[a] / al));
        img.data[b + 1] = srgb(Math.min(255, px[a + 1] / al));
        img.data[b + 2] = srgb(Math.min(255, px[a + 2] / al));
        img.data[b + 3] = px[a + 3];
      }
    ctx.putImageData(img, 0, 0);
    const klein = document.createElement('canvas');
    klein.width = klein.height = FOTO;
    klein.getContext('2d')!.drawImage(c, 0, 0, FOTO, FOTO);
    const url = klein.toDataURL('image/png');
    useMaatje.setState((s) => ({ fotos: { ...s.fotos, [item.nr]: url } }));
    setI(i + 1);
  });
  const item = lijst[i];
  if (!item) return null;
  const Model = item.m.Model;
  return createPortal(
    <>
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#ffffff', '#6a5a4a', 1.1]} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} />
      <group ref={houder} key={item.nr}>
        <Veilig>
          <Model />
        </Veilig>
      </group>
    </>,
    scene,
  );
}

/** Zet de foto van het huidige maatje als CSS-variabele (voor tips en uitleg in het paneel). */
export function useMaatjeCss() {
  const wereld = useSpel((s) => s.wereld);
  const fotos = useMaatje((s) => s.fotos);
  useEffect(() => {
    const url = fotos[wereld] ?? fotos[0];
    if (url) document.documentElement.style.setProperty('--maatje-foto', `url(${url})`);
    document.documentElement.style.setProperty('--maatje-kleur', maatjeVan().kleur);
  }, [wereld, fotos]);
}
