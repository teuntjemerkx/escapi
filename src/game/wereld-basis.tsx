// De motor van elke wereld: stations, iconen boven de stations, kavels, kluizen, lampjes,
// klikken op de grond en de poort met sleutelgaten en eindcheck-lampjes.
import { Billboard } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { animate } from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { huidig, stationsVan } from '../werelden';
import type { Station, WereldDef } from '../werelden/types';
import { geluid } from '../lib/geluid';
import { box, hoogteOp, huidigeLaag, lijnVrij, opLaag, verhoog, verwijder, wisAlles, wisVerhoogd, zetGrens } from './botsing';
import { Binnen, GebouwLevend, GebouwVast, grenzen, kamerOp, kijkVerdieping, registreerPlan, Tafel, TAFEL_H, uitgangRot, Verdieping, verdiepingen, verdiepingHoogte, verdiepingPlan, Voordeur } from './huis';
import { loopNaar } from './Speler';
import { InspectieBereik } from './inspectie';
import { wasSlepen } from './invoer';
import { Blok, Cil, mat } from './kit';
import { Sleutel, tekenSymbool } from './kluis';
import { P } from './palette';
import { HOOGTE_KAVEL, HOOGTE_STOEP, Kavel } from './stad';
import { Statisch } from './statisch';
import { wisAtlas } from './atlas';
import { cam, speler, useSpel } from './store';
import { Bordje, FONT, useTextuur } from './tekst';
import { blokken, cijferVan, codesVan, isKeuze, isKlaar, isOpen, klusVan, naKluis, volgendDoel } from './voortgang';
import { extraDoelen, richt, useRicht } from './richten';

type V2 = [number, number];

/** Plek en draaiing van de poort (bij een gebouw: de uitgangsdeur). */
export function poortVan(def: WereldDef): { pos: V2; rot: number } {
  return def.plan ? { pos: def.plan.uitgang.pos, rot: uitgangRot(def.plan) } : def.poort;
}
/** Lokaal punt bij de poort → wereldpunt (poort kan gedraaid staan). */
function bijPoort(def: WereldDef, lx: number, lz: number): V2 {
  const p = poortVan(def);
  const r = p.rot;
  return [p.pos[0] + lx * Math.cos(r) + lz * Math.sin(r), p.pos[1] - lx * Math.sin(r) + lz * Math.cos(r)];
}
const gedraaid = (rot = 0) => Math.abs(Math.sin(rot)) > 0.5;
const zuilLokaal = (def: WereldDef): V2 => (def.plan ? [-2.9, 1.6] : [-5.2, 3.4]);

export function registreerWereld(def: WereldDef) {
  wisAlles();
  wisVerhoogd();
  if (def.plan) {
    const g = grenzen(def.plan);
    zetGrens(g.w + 0.6, g.d + 0.6, 0.45, g.midden);
  } else zetGrens(def.eiland[0], def.eiland[1]);
  def.registreer();
  if (def.plan) registreerPlan(def.plan);
  for (const st of stationsVan(def)) {
    const d = gedraaid(st.rot);
    if (st.kavel) verhoog(st.pos[0], st.pos[1], d ? st.kavel[1] : st.kavel[0], d ? st.kavel[0] : st.kavel[1], HOOGTE_KAVEL);
    if (st.botser) opLaag(st.verdieping ?? 0, () => box(st.pos[0], st.pos[1], d ? st.botser![1] : st.botser![0], d ? st.botser![0] : st.botser![1]));
  }
  speler.verdieping = 0;
  // poort: twee pilaren (of het kozijn), de deuren (weg als de poort open is) en de zuil
  const pd = gedraaid(poortVan(def).rot);
  const breed = def.plan ? 3.4 : 5.4;
  if (!def.plan)
    for (const lx of [-3.4, 3.4]) {
      const [x, z] = bijPoort(def, lx, 0);
      box(x, z, 1.4, 1.4);
    }
  const [mx, mz] = bijPoort(def, 0, 0);
  if (useSpel.getState().fase !== 'klaar') box(mx, mz, pd ? 0.5 : breed, pd ? breed : 0.5, 'poort');
  const [zl, zlz] = zuilLokaal(def);
  const [zx, zz] = bijPoort(def, zl, zlz);
  box(zx, zz, 0.9, 0.9);
}

/** Probeer het object te openen: loop er eerst heen als het ver weg is. */
export function gaNaar(st: Station) {
  const s = useSpel.getState();
  if (s.modus !== 'lopen') return;
  if (!isOpen(st, s.fase, s.docent, s.voortgang)) {
    geluid('bijna');
    s.setMelding(st.rol === 'kluis' ? 'Deze kluis gaat pas open bij "Zelf doen".' : 'Dit slot is nog dicht. Volg eerst het pad.');
    return;
  }
  geluid('klik');
  const afstand = Math.hypot(st.pos[0] - speler.pos.x, st.pos[1] - speler.pos.z);
  const voet = st.tafel ? Math.max(...st.tafel) / 2 : st.botser ? Math.max(...st.botser) / 2 : st.grootte * 0.4;
  const bereik = st.kavel ? Math.max(3.5, Math.max(...st.kavel) * 0.55 + 1.5) : Math.max(2.4, voet + 1.6);
  const open = () => useSpel.getState().open(st.id, st.weergave);
  // Dichtbij, op dezelfde verdieping en geen muur ertussen? Meteen openen.
  const v = st.verdieping ?? 0;
  const zicht = (x: number, z: number) => lijnVrij(x, z, st.pos[0], st.pos[1], 0.05, true, v);
  if (afstand <= bereik && huidigeLaag() === v && zicht(speler.pos.x, speler.pos.z)) {
    open();
    return;
  }
  const gelukt = loopNaar(st.pos[0], st.pos[1], open, (x, z) => Math.hypot(x - st.pos[0], z - st.pos[1]) <= bereik - 0.3 && zicht(x, z), v);
  if (!gelukt) open();
}

/** Hoogte van de vloer onder het station (verdieping). */
export const vloerVan = (st: Station) => {
  const plan = huidig().plan;
  return plan && st.verdieping ? st.verdieping * verdiepingHoogte(plan) : 0;
};
/** Hoogte waarop het model staat (vloer + tafel, kavel of stoep). */
export const hoogteVan = (st: Station) =>
  vloerVan(st) + (st.tafel ? TAFEL_H[st.tafelSoort ?? 'hout'] : st.kavel ? HOOGTE_KAVEL : !huidig().plan && (st.rol === 'terugblik' || st.rol === 'kluis') ? HOOGTE_STOEP : 0);

/** Vast deel van een station (kavel + decor): wordt samengevoegd met de rest van de wereld. */
export function StationVast({ st }: { st: Station }) {
  const dp = st.decorPos ?? [0, 0, 0];
  const vloer = vloerVan(st);
  return (
    <group position={[st.pos[0], vloer, st.pos[1]]} rotation={[0, st.rot ?? 0, 0]}>
      {st.kavel && <Kavel w={st.kavel[0]} d={st.kavel[1]} soort={st.ondergrond} />}
      {st.tafel && <Tafel b={st.tafel[0]} d={st.tafel[1]} soort={st.tafelSoort} />}
      {st.Decor && (
        <group position={[dp[0], hoogteVan(st) - vloer + dp[1], dp[2]]} rotation={[0, st.decorRot ?? 0, 0]} scale={st.schaal ?? 1}>
          <st.Decor />
        </group>
      )}
    </group>
  );
}

function StationObject({ st, vast = false }: { st: Station; vast?: boolean }) {
  const actief = useSpel((s) => s.actief === st.id);
  const modus = useSpel((s) => s.modus);
  const weergave = useSpel((s) => s.weergave);
  const verborgen = actief && weergave === 'draai' && modus !== 'lopen';
  const metMaten = actief && weergave === 'boven' && modus !== 'lopen';
  // Tijdens het rondlopen is het model samengevoegd (weinig tekenwerk); bij de inspectie is het 'levend'
  // (onderdelen schuiven uit elkaar, maatlijnen). Kluizen blijven altijd levend (de deur beweegt).
  const levend = st.rol === 'kluis' || (actief && modus !== 'lopen');
  const model = (
    <group scale={st.schaal ?? 1}>
      <st.Model />
    </group>
  );
  return (
    <group position={[st.pos[0], hoogteVan(st), st.pos[1]]} rotation={[0, st.rot ?? 0, 0]}>
      <group
        visible={!verborgen}
        onClick={(e) => {
          e.stopPropagation();
          if (wasSlepen()) return;
          gaNaar(st);
        }}
      >
        {vast ? (
          model
        ) : levend ? (
          <InspectieBereik delen={metMaten} maten={metMaten}>
            {model}
          </InspectieBereik>
        ) : (
          <Statisch>{model}</Statisch>
        )}
      </group>
    </group>
  );
}

type MarkerSoort = 'slot' | 'verplicht' | 'keuze' | 'klaar' | 'code' | 'kluis' | 'kluis-open';
const MARKER_KLEUR: Record<MarkerSoort, string> = {
  slot: '#8d9693',
  verplicht: '#ff8a3d',
  keuze: '#c3b1ff',
  klaar: '#5fe0a1',
  code: '#ffffff',
  kluis: '#ffffff',
  'kluis-open': '#5fe0a1',
};

/** Zwevend icoon in de stijl van de interface: donker glas, witte rand, gekleurde ring. */
function MarkerIcoon({ soort, deel, klusKleur, symbool, cijfer }: { soort: MarkerSoort; deel: number; klusKleur?: string; symbool?: number; cijfer?: number }) {
  const kleur = soort === 'code' || soort === 'kluis' ? klusKleur ?? '#ffffff' : MARKER_KLEUR[soort];
  const stap = Math.round(deel * 12);
  const tex = useTextuur(
    0.9,
    0.9,
    (ctx, w, h) => {
      const m = w / 2;
      const r = w / 2 - 12;
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.arc(m, m + 6, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(10,18,16,0.88)';
      ctx.beginPath();
      ctx.arc(m, m, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.stroke();
      ctx.lineCap = 'round';
      ctx.lineWidth = 12;
      // ring: voortgang, of de kleur van de klus
      ctx.strokeStyle = klusKleur && soort !== 'slot' ? klusKleur : 'rgba(255,255,255,0.14)';
      if (klusKleur && soort === 'verplicht') ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(m, m, r - 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const deelRing = soort === 'klaar' || soort === 'code' || soort === 'kluis-open' ? 1 : soort === 'slot' || soort === 'kluis' ? 0 : Math.max(stap / 12, 0);
      if (deelRing > 0.002 && soort !== 'code') {
        ctx.strokeStyle = MARKER_KLEUR[soort];
        ctx.beginPath();
        ctx.arc(m, m, r - 18, -Math.PI / 2, -Math.PI / 2 + deelRing * Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = kleur;
      ctx.strokeStyle = kleur;
      ctx.lineJoin = 'round';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (soort === 'verplicht') {
        ctx.fillStyle = MARKER_KLEUR.verplicht;
        ctx.font = `700 ${h * 0.42}px Inter, ${FONT}`;
        ctx.fillText('!', m, m + 3);
      } else if (soort === 'keuze') {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const rr = i % 2 ? w * 0.09 : w * 0.2;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          ctx.lineTo(m + Math.cos(a) * rr, m + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
      } else if (soort === 'klaar' || soort === 'kluis-open') {
        ctx.lineWidth = w * 0.07;
        ctx.beginPath();
        ctx.moveTo(w * 0.35, h * 0.51);
        ctx.lineTo(w * 0.46, h * 0.62);
        ctx.lineTo(w * 0.66, h * 0.39);
        ctx.stroke();
      } else if (soort === 'code') {
        tekenSymbool(ctx, symbool ?? 0, w * 0.37, h * 0.5, w * 0.12, klusKleur ?? '#ffffff');
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${h * 0.3}px Inter, ${FONT}`;
        ctx.fillText(String(cijfer ?? ''), w * 0.63, h * 0.52);
      } else if (soort === 'kluis') {
        // kluisje met draaiknop
        ctx.lineWidth = w * 0.04;
        ctx.strokeRect(w * 0.33, h * 0.33, w * 0.34, h * 0.34);
        ctx.beginPath();
        ctx.arc(m, m, w * 0.07, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = MARKER_KLEUR.slot;
        ctx.strokeStyle = MARKER_KLEUR.slot;
        ctx.lineWidth = w * 0.045;
        ctx.beginPath();
        ctx.arc(m, h * 0.44, w * 0.09, Math.PI, 0);
        ctx.stroke();
        ctx.fillRect(w * 0.37, h * 0.45, w * 0.26, h * 0.19);
      }
    },
    `marker3-${soort}-${stap}-${klusKleur ?? ''}-${symbool ?? ''}-${cijfer ?? ''}`,
    256,
  );
  return (
    <mesh>
      <planeGeometry args={[0.9, 0.9]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Pulserende rand om de kavel van het volgende doel. */
function DoelRand({ w, d, y, kleur = '#ff8a3d' }: { w: number; d: number; y: number; kleur?: string }) {
  const materiaal = useMemo(() => new THREE.MeshBasicMaterial({ color: kleur, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false }), [kleur]);
  useFrame(({ clock }) => {
    materiaal.opacity = 0.45 + Math.sin(clock.getElapsedTime() * 4) * 0.3;
  });
  const dik = 0.16;
  return (
    <group position={[0, y, 0]}>
      {[
        [0, -d / 2 - dik / 2, w + dik * 2, dik],
        [0, d / 2 + dik / 2, w + dik * 2, dik],
        [-w / 2 - dik / 2, 0, dik, d],
        [w / 2 + dik / 2, 0, dik, d],
      ].map(([x, z, bw, bd], i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]} material={materiaal}>
          <planeGeometry args={[bw, bd]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Door je eigen ogen tonen we alleen de icoontjes van de dichtstbijzijnde stations (en altijd het volgende doel):
 * in een open hal zie je anders tientallen zwevende icoontjes tegelijk, en elk kost tekenwerk.
 */
const MAX_ICONEN = 6;
const iconRang = new Map<string, number>();

type Gericht = { id: string; titel: string; dicht: string | null; actie: () => void };

/**
 * Richten: welk station (of andere knop, zoals de codezuil) staat nu in je vizier en is dichtbij genoeg?
 * Dat open je met één klik, met E of met Enter (zie invoer.ts en richten.ts). Geen muur ertussen.
 */
function Richten() {
  const camera = useThree((s) => s.camera);
  const n = useRef(0);
  const vooruit = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (++n.current % 3 !== 0) return;
    const s = useSpel.getState();
    const fp = s.cameraStand === 'eerste' && s.modus === 'lopen' && !s.kaart;
    let beste: Gericht | null = null;
    if (fp) {
      camera.getWorldDirection(vooruit);
      const c = camera.position;
      let score = Infinity;
      const kijk = (id: string, x: number, y: number, z: number, bereik: number, v: number, titel: string, dicht: string | null, actie: () => void) => {
        if (v !== speler.verdieping) return;
        const dx = x - c.x;
        const dy = y - c.y;
        const dz = z - c.z;
        const dh = Math.hypot(dx, dz);
        if (dh > bereik) return;
        const len = Math.hypot(dx, dy, dz) || 1;
        const hoek = Math.acos(Math.min(1, (dx * vooruit.x + dy * vooruit.y + dz * vooruit.z) / len));
        // dichtbij mag je wat ruimer mikken
        if (hoek > (dh < 1.8 ? 0.6 : 0.34)) return;
        const sc = hoek + dh * 0.035;
        if (sc >= score) return;
        if (!lijnVrij(c.x, c.z, x, z, 0.05, true, v)) return;
        score = sc;
        beste = { id, titel, dicht, actie };
      };
      for (const st of stationsVan()) {
        const voet = st.tafel ? Math.max(...st.tafel) / 2 : st.botser ? Math.max(...st.botser) / 2 : st.grootte * 0.4;
        const bereik = st.kavel ? Math.max(4.2, Math.max(...st.kavel) * 0.6 + 2) : Math.max(3.6, voet + 2.8);
        const open = isOpen(st, s.fase, s.docent, s.voortgang);
        const dicht = open ? null : st.rol === 'kluis' ? 'gaat open bij "Zelf doen"' : 'nog op slot';
        kijk(st.id, st.pos[0], hoogteVan(st) + Math.min(1.1, st.grootte * 0.32), st.pos[1], bereik, st.verdieping ?? 0, st.titel, dicht, () => gaNaar(st));
      }
      for (const [id, d] of extraDoelen) kijk(id, d.pos.x, d.pos.y, d.pos.z, d.bereik, d.v, d.titel, null, d.actie);
    }
    const b = beste as Gericht | null;
    richt.id = b?.id ?? null;
    richt.actie = b?.actie ?? null;
    const nu = useRicht.getState().doel;
    if ((nu?.id ?? null) !== (b?.id ?? null) || (nu && b && nu.dicht !== b.dicht)) useRicht.setState({ doel: b ? { id: b.id, titel: b.titel, dicht: b.dicht } : null });
  });
  useEffect(
    () => () => {
      richt.id = null;
      richt.actie = null;
      useRicht.setState({ doel: null });
    },
    [],
  );
  return null;
}

function IconRegie() {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current % 8 !== 1) return;
    const lijst = stationsVan()
      .map((st) => ({ id: st.id, d: Math.hypot(st.pos[0] - speler.pos.x, st.pos[1] - speler.pos.z) + Math.abs((st.verdieping ?? 0) - speler.verdieping) * 6 }))
      .sort((a, b) => a.d - b.d);
    iconRang.clear();
    lijst.forEach((x, i) => iconRang.set(x.id, i));
  });
  return null;
}

function Marker({ st, doel }: { st: Station; doel: boolean }) {
  const fase = useSpel((s) => s.fase);
  const voortgang = useSpel((s) => s.voortgang);
  const docent = useSpel((s) => s.docent);
  const modus = useSpel((s) => s.modus);
  useSpel((s) => s.kluizen);
  const ref = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const def = huidig();
  const open = isOpen(st, fase, docent, voortgang);
  const klaar = isKlaar(st, voortgang, fase);
  const klus = st.rol === 'kluis' ? def.klussen.find((k) => k.id === st.klus) : klusVan(st.id);
  const symbool = klus && !st.rol ? klus.stations.indexOf(st.id) : undefined;
  let soort: MarkerSoort;
  if (st.rol === 'kluis') soort = klaar ? 'kluis-open' : open ? 'kluis' : 'slot';
  else if (klaar) soort = klus ? 'code' : 'klaar';
  else soort = !open ? 'slot' : isKeuze(st) ? 'keuze' : 'verplicht';
  const deel = st.opdrachten.filter((id) => voortgang[id]?.goed).length / Math.max(1, st.opdrachten.length);
  const sch = st.schaal ?? 1;
  const y = hoogteVan(st) + (st.markerY ?? (st.midden ?? 0.5) * 2 + 1.7) * sch + (sch < 1 ? 1.1 : 0);
  const heel = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Door je eigen ogen: alleen icoontjes dichtbij en op je eigen verdieping (geen zwevende icoontjes door muren heen).
    if (heel.current) {
      const s = useSpel.getState();
      const fp = s.cameraStand === 'eerste' && s.modus === 'lopen';
      const ver = Math.hypot(st.pos[0] - speler.pos.x, st.pos[1] - speler.pos.z);
      // in een vide of op een galerij zie je ook de icoontjes van de andere verdieping (je kijkt erin)
      const plan = huidig().plan;
      const open = (k?: { vide?: boolean; galerij?: boolean }) => !!k && (!!k.vide || !!k.galerij);
      const vide = !!plan && (open(kamerOp(plan, st.pos[0], st.pos[1], st.verdieping ?? 0)) || open(kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping)));
      const dichtbij = doel || (iconRang.get(st.id) ?? 0) < MAX_ICONEN;
      heel.current.visible = !fp || (dichtbij && ((st.verdieping ?? 0) === speler.verdieping ? ver < (doel ? 30 : 16) : vide && ver < 26));
    }
    if (ref.current) {
      ref.current.position.y = y + Math.sin(t * 2 + st.pos[0]) * 0.1;
      const gericht = richt.id === st.id;
      const s = (doel ? 1.4 + Math.sin(t * 4) * 0.07 : soort === 'slot' ? 0.62 : soort === 'code' ? 1.12 : 1) * (gericht ? 1.25 : 1);
      ref.current.scale.setScalar(s);
    }
    if (ring.current) {
      const f = (t * 0.8) % 1;
      ring.current.scale.setScalar(1 + f * 1.6);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.55;
    }
  });
  if (modus !== 'lopen') return null;
  const d = gedraaid(st.rot);
  const randKleur = st.rol === 'kluis' && klus ? klus.kleur : '#ff8a3d';
  return (
    <group ref={heel} position={[st.pos[0], 0, st.pos[1]]}>
      <Billboard ref={ref as never}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            if (!wasSlepen()) gaNaar(st);
          }}
        >
          <MarkerIcoon soort={soort} deel={deel} klusKleur={klus?.kleur} symbool={symbool} cijfer={soort === 'code' ? cijferVan(st.id) : undefined} />
        </group>
      </Billboard>
      {doel && st.kavel && <DoelRand w={d ? st.kavel[1] : st.kavel[0]} d={d ? st.kavel[0] : st.kavel[1]} y={HOOGTE_KAVEL + 0.03} />}
      {doel && !st.kavel && (
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, hoogteVan(st) + 0.04, 0]}>
          <ringGeometry args={[Math.max(1.2, st.grootte * 0.35), Math.max(1.35, st.grootte * 0.35 + 0.15), 48]} />
          <meshBasicMaterial color={randKleur} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/** Eindpoort: pilaren, houten deuren, sleutelgaten (één per klus) en lampjes voor de eindcheck. */
function PoortGebouw({ open }: { open: number }) {
  const def = huidig();
  const kluizen = useSpel((s) => s.kluizen);
  const voortgang = useSpel((s) => s.voortgang);
  const eind = def.werkboek.filter((id) => def.opdrachten[id].sectie === 'eindtest');
  const n = def.klussen.length;
  const lampAan = useMemo(() => mat('#ffd36b', { emissive: '#ffb733', rough: 0.4 }), []);
  const lampUit = useMemo(() => mat('#5b5f5c', { rough: 0.6 }), []);
  return (
    <group>
      <Blok size={[1.4, 5.2, 1.4]} pos={[-3.4, 2.6, 0]} color={P.muur2} r={0.15} />
      <Blok size={[1.4, 5.2, 1.4]} pos={[3.4, 2.6, 0]} color={P.muur2} r={0.15} />
      <Blok size={[8.4, 0.9, 1.6]} pos={[0, 5.5, 0]} color="#3b4442" r={0.15} />
      <Blok size={[8.8, 0.25, 1.8]} pos={[0, 6.05, 0]} color="#2a302f" r={0.08} />
      {/* sleutelgaten */}
      {def.klussen.map((k, i) => {
        const x = (i - (n - 1) / 2) * 1.5;
        const binnen = !!kluizen[`${def.nr}:${k.id}`];
        return (
          <group key={k.id} position={[x, 5.5, 0.81]}>
            <Cil r={0.34} h={0.06} rot={[Math.PI / 2, 0, 0]} color="#1b2120" seg={24} />
            <mesh position={[0, 0, 0.035]} rotation={[0, 0, 0]}>
              <ringGeometry args={[0.27, 0.33, 32]} />
              <meshBasicMaterial color={k.kleur} toneMapped={false} />
            </mesh>
            {binnen ? (
              <group position={[0, 0.02, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                <Sleutel kleur={k.kleur} s={1.1} />
              </group>
            ) : (
              <>
                <mesh position={[0, 0.05, 0.04]}>
                  <circleGeometry args={[0.07, 16]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0, -0.06, 0.04]}>
                  <planeGeometry args={[0.06, 0.16]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
              </>
            )}
          </group>
        );
      })}
      {/* lampjes voor de eindcheck */}
      <Blok size={[5.4, 0.3, 0.3]} pos={[0, 4.78, 0.1]} color="#2a302f" r={0.06} />
      {eind.map((id, i) => (
        <mesh key={id} position={[(i - (eind.length - 1) / 2) * 0.5, 4.78, 0.27]} material={voortgang[id]?.goed ? lampAan : lampUit}>
          <sphereGeometry args={[0.11, 14, 10]} />
        </mesh>
      ))}
      <group position={[-2.7, 0, 0]} rotation={[0, -open * 1.6, 0]}>
        <Blok size={[2.7, 4.4, 0.3]} pos={[1.35, 2.2, 0]} color={P.hout} r={0.08} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[1.35, 1.2, 0]} color={P.houtLicht} r={0.04} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[1.35, 3.2, 0]} color={P.houtLicht} r={0.04} />
      </group>
      <group position={[2.7, 0, 0]} rotation={[0, open * 1.6, 0]}>
        <Blok size={[2.7, 4.4, 0.3]} pos={[-1.35, 2.2, 0]} color={P.hout} r={0.08} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[-1.35, 1.2, 0]} color={P.houtLicht} r={0.04} />
        <Blok size={[2.3, 0.18, 0.36]} pos={[-1.35, 3.2, 0]} color={P.houtLicht} r={0.04} />
      </group>
    </group>
  );
}

/** Zuil bij de poort: toont of het eindslot nog dicht is. */
function PoortZuil({ doel, pos }: { doel: boolean; pos: [number, number, number] }) {
  const fase = useSpel((s) => s.fase);
  const zuil = useRef<THREE.Group>(null);
  const gebruik = () => {
    if (useSpel.getState().modus !== 'lopen') return;
    geluid('klik');
    const s = useSpel.getState();
    if (s.fase === 'klaar') return;
    s.setKaart('poort');
  };
  // de zuil kun je ook richten en met één klik of E gebruiken (zie Richten)
  useFrame(() => {
    if (!zuil.current || extraDoelen.has('poortzuil')) return;
    const p = zuil.current.getWorldPosition(new THREE.Vector3());
    p.y += 1;
    extraDoelen.set('poortzuil', { pos: p, titel: 'Codeslot van de uitgang', actie: gebruik, v: 0, bereik: 3.4 });
  });
  useEffect(() => () => void extraDoelen.delete('poortzuil'), []);
  const tex = useTextuur(
    0.8,
    0.5,
    (ctx, w, h) => {
      ctx.fillStyle = '#0f1816';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = fase === 'klaar' ? '#5fe0a1' : '#ff8a3d';
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = fase === 'klaar' ? '#5fe0a1' : '#ff8a3d';
      ctx.font = `700 ${h * 0.3}px Inter, ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fase === 'klaar' ? 'OPEN' : 'SLOT', w / 2, h / 2);
    },
    `zuil2-${fase === 'klaar'}`,
  );
  return (
    <group
      ref={zuil}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        if (wasSlepen()) return;
        gebruik();
      }}
    >
      <Blok size={[0.8, 1.3, 0.8]} pos={[0, 0.65, 0]} color="#3a4442" r={0.1} />
      <Blok size={[0.9, 0.1, 0.9]} pos={[0, 1.33, 0]} color="#2a3230" r={0.04} />
      <mesh position={[0, 0.95, 0.41]}>
        <planeGeometry args={[0.62, 0.4]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {doel && <Bordje regels={['Tik hier']} breed={1} hoog={0.3} pos={[0, 1.75, 0.2]} bg="#ff8a3d" fg="#ffffff" rand={null} />}
    </group>
  );
}

function Poortcomplex({ doel }: { doel: boolean }) {
  const def = huidig();
  const fase = useSpel((s) => s.fase);
  const [open, setOpen] = useState(fase === 'klaar' ? 1 : 0);
  useEffect(() => {
    if (fase !== 'klaar') return;
    verwijder('poort');
    // Draai de camera zo dat je de poort ziet opengaan.
    cam.yaw = Math.atan2(speler.pos.x - poortVan(def).pos[0], speler.pos.z - poortVan(def).pos[1]);
    const p = { v: open };
    geluid('poort');
    const a = animate(p, { v: 1, duration: 2600, delay: 400, ease: 'inOutSine', onUpdate: () => setOpen(p.v) });
    return () => {
      a.pause();
    };
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = poortVan(def);
  const zl = zuilLokaal(def);
  if (def.plan)
    return (
      <group position={[p.pos[0], 0, p.pos[1]]} rotation={[0, p.rot, 0]}>
        <Voordeur open={open} />
        <PoortZuil doel={doel} pos={[zl[0], 0, zl[1]]} />
      </group>
    );
  return (
    <group position={[p.pos[0], HOOGTE_STOEP, p.pos[1]]} rotation={[0, p.rot, 0]}>
      <PoortGebouw open={open} />
      <group position={[0, -HOOGTE_STOEP, 0]}>
        <PoortZuil doel={doel} pos={[zl[0], HOOGTE_STOEP, zl[1]]} />
      </group>
    </group>
  );
}

/** Verstopte lampjes: loop erlangs om een gratis tip te krijgen. */
function Lampje({ i, pos, v = 0 }: { i: number; pos: V2; v?: number }) {
  const gevonden = useSpel((s) => !!s.lampjes[`${s.wereld}:${i}`]);
  const ref = useRef<THREE.Group>(null);
  const glas = useMemo(() => mat('#fff2b8', { emissive: '#ffd24a', rough: 0.2, opacity: 0.92 }), []);
  useFrame(({ clock }) => {
    if (gevonden || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = 0.9 + Math.sin(t * 2.2 + i) * 0.12;
    ref.current.rotation.y = t * 0.8;
    if (useSpel.getState().modus !== 'lopen' || speler.verdieping !== v) return;
    const dx = speler.pos.x - pos[0];
    const dz = speler.pos.z - pos[1];
    if (dx * dx + dz * dz < 1.6 * 1.6) {
      useSpel.getState().vindLampje(i);
      geluid('lampje');
      useSpel.getState().setMelding('Lampje gevonden! Je hebt een tip extra.', 'goed');
    }
  });
  if (gevonden) return null;
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <group ref={ref}>
        <mesh material={glas} position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.2, 16, 12]} />
        </mesh>
        <Cil r={0.09} h={0.14} pos={[0, -0.1, 0]} color="#b9bdb9" seg={12} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[0.35, 20]} />
        <meshBasicMaterial color="#ffd24a" transparent opacity={0.25} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Klik op de grond: daar loopt het poppetje heen. */
function Grond({ def }: { def: WereldDef }) {
  const stip = useRef<THREE.Mesh>(null);
  const klikVlak = useRef<THREE.Mesh>(null);
  // Klikvlak: groot genoeg voor het hele gebouw met buitenruimtes.
  const g = def.plan ? grenzen(def.plan) : null;
  const vlak: [number, number] = g ? [Math.max(g.w, 2 * Math.max(Math.abs(g.minX), Math.abs(g.maxX))) + 30, Math.max(g.d, 2 * Math.max(Math.abs(g.minZ), Math.abs(g.maxZ))) + 30] : [def.eiland[0] * 1.5, def.eiland[1] * 1.5];
  const tijd = useRef(0);
  useFrame((_, dt) => {
    tijd.current += dt;
    // het klikvlak ligt op de verdieping waar je bent
    // het klikvlak ligt op de hoogte van je voeten (ook op een pad dat omhoog of omlaag loopt)
    if (klikVlak.current && def.plan) {
      const kv = kijkVerdieping();
      klikVlak.current.position.y = kv * verdiepingHoogte(def.plan) + (kv === 0 && useSpel.getState().modus === 'lopen' ? Math.min(0, speler.pos.y) : 0) + 0.005;
    }
    if (stip.current) {
      const zicht = speler.doel !== null;
      stip.current.visible = zicht;
      if (zicht) {
        stip.current.position.set(speler.doel!.x, speler.pos.y + 0.18, speler.doel!.z);
        stip.current.scale.setScalar(1 + Math.sin(tijd.current * 6) * 0.1);
      }
    }
  });
  return (
    <>
      <mesh
        ref={klikVlak}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        onClick={(e) => {
          if (wasSlepen() || useSpel.getState().modus !== 'lopen') return;
          if (!loopNaar(e.point.x, e.point.z, null, (x, z) => Math.hypot(x - e.point.x, z - e.point.z) < 0.7)) {
            speler.doel = new THREE.Vector3(e.point.x, 0, e.point.z);
            speler.pad = [];
            speler.bijDoel = null;
          }
        }}
      >
        <planeGeometry args={vlak} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={stip} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.38, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

/** Spookje Sam: zweeft naast je en wijst de weg naar je volgende opdracht (zoals het spookje in Doors 101). */
/** Reageer op een open kluis (vanuit het paneel). */
export function kluisGeopend(klus: string) {
  const s = useSpel.getState();
  s.openKluis(klus);
  s.vier(true);
  geluid('kluis');
  s.setMelding('De kluis is open! De sleutel zit nu in de poort.', 'goed');
  naKluis();
}

/** De hele wereld: decor (samengevoegd), stations, iconen, poort, lampjes. */
export function WereldScene() {
  const def = huidig();
  useMemo(() => {
    wisAtlas();
    registreerWereld(def);
    speler.pos.set(def.spawn[0], hoogteOp(def.spawn[0], def.spawn[1]), def.spawn[1]);
    speler.doel = null;
    // je kijkt bij de start vooruit (de wereld in)
    cam.yaw = 0;
    cam.fpPitch = -0.04;
  }, [def]);
  useEffect(() => {
    // het spel is altijd door je eigen ogen (first person)
    useSpel.getState().setCameraStand('eerste');
  }, [def]);
  const fase = useSpel((s) => s.fase);
  const voortgang = useSpel((s) => s.voortgang);
  useSpel((s) => s.kluizen);
  const doel = volgendDoel(fase, voortgang);
  const stations = stationsVan(def);
  // Alle stations die je niet bekijkt, worden samen één vast blok (veel minder tekenwerk).
  // Opent of sluit je een station, dan wordt het blok opnieuw samengevoegd zonder dat station.
  const actief = useSpel((s) => (s.modus !== 'lopen' ? s.actief : null));
  const levend = (st: Station) => st.rol === 'kluis' || st.id === actief;
  const plan = def.plan;
  const vs = plan ? verdiepingen(plan) : [0];
  const HV = plan ? verdiepingHoogte(plan) : 0;
  const opV = (v: number) => stations.filter((st) => (st.verdieping ?? 0) === v);
  const binnenStation = (st: Station) => !!plan && !kamerOp(plan, st.pos[0], st.pos[1], st.verdieping ?? 0)?.buiten;
  return (
    <group>
      <Statisch>
        {plan && <GebouwVast plan={verdiepingPlan(plan, 0)} sokkel={!def.Omgeving} />}
        <def.Decor />
        {opV(0).map((st) => (
          <StationVast key={st.id} st={st} />
        ))}
      </Statisch>
      {plan && <GebouwLevend plan={verdiepingPlan(plan, 0)} />}
      <IconRegie />
      <Richten />
      {/* andere verdiepingen (ook een kelder, verdieping −1): elk een eigen groep */}
      {plan &&
        vs
          .filter((v) => v !== 0)
          .map((v) => (
            <Verdieping key={`g${v}`} nr={v}>
              <Statisch>
                <GebouwVast plan={verdiepingPlan(plan, v)} sokkel={false} />
              </Statisch>
              <GebouwLevend plan={verdiepingPlan(plan, v)} />
            </Verdieping>
          ))}
      {def.Levend && <def.Levend />}
      {def.Omgeving && <def.Omgeving />}
      <Grond def={def} />
      <Poortcomplex doel={doel === 'poort'} />
      {vs.map((v) => (
        <Verdieping key={`s${v}`} nr={v} optillen={false}>
          {/* stations binnen: weg als je buiten door je eigen ogen loopt (je ziet ze toch niet) */}
          {[true, false].map((binnen) => {
            const lijst = opV(v).filter((st) => binnenStation(st) === binnen);
            if (!lijst.length) return null;
            const inhoud = (
              <>
                {v !== 0 && (
                  <Statisch>
                    {lijst.map((st) => (
                      <StationVast key={st.id} st={st} />
                    ))}
                  </Statisch>
                )}
                <Statisch key={`stations-${v}-${binnen}-${actief ?? ''}`}>
                  {lijst
                    .filter((st) => !levend(st))
                    .map((st) => (
                      <StationObject key={st.id} st={st} vast />
                    ))}
                </Statisch>
                {lijst.filter(levend).map((st) => (
                  <StationObject key={st.id} st={st} />
                ))}
                {lijst.map((st) => (
                  <Marker key={st.id} st={st} doel={doel === st.id} />
                ))}
              </>
            );
            return binnen ? <Binnen key="b">{inhoud}</Binnen> : <group key="u">{inhoud}</group>;
          })}
          {def.lampjes.map((p, i) =>
            (p[2] ?? 0) === v ? (
              <group key={i} position={[0, v * HV, 0]}>
                <Lampje i={i} pos={[p[0], p[1]]} v={v} />
              </group>
            ) : null,
          )}
        </Verdieping>
      ))}
    </group>
  );
}

export { blokken, codesVan };
