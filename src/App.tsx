import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraKoppeling } from './game/inspectie';
import { koppelInvoer, muisVast } from './game/invoer';
import { P } from './game/palette';
import { Regie } from './game/Regie';
import { Speler } from './game/Speler';
import { cam, speler, useSpel } from './game/store';
import { Hint, Hud, InspectieBediening, Kaarten } from './ui/Hud';
import { MaatLaag } from './ui/MaatLaag';
import { Feest } from './ui/Feest';
import { WereldScene } from './game/wereld-basis';
import { kamerOp } from './game/huis';
import { lijnVrij } from './game/botsing';
import { Lucht } from './game/lucht';
import { SCHADUW_LAAG } from './game/kit';
import { beeldNu } from './game/kwaliteit';
import { BUNDEL_HOEK, zaklampCookie, zaklampStaat, ZaklampInHand } from './game/zaklamp';
import { geluid } from './lib/geluid';
import { Maatje3D, MaatjeFotos, useMaatje, useMaatjeCss } from './game/maatje';
import { huidig } from './werelden';
import { Beginpagina } from './ui/Begin';
import { Merk } from './ui/Merk';
import type { Sfeer } from './werelden/types';

function Invoer() {
  const gl = useThree((s) => s.gl);
  useEffect(() => koppelInvoer(gl.domElement), [gl]);
  return null;
}

const OVERZICHT = typeof location !== 'undefined' && new URLSearchParams(location.search).has('overzicht');
const SCHADUW = OVERZICHT ? 62 : 28;
const TEXEL = (SCHADUW * 2) / 2048;
const midden = new THREE.Vector3();

/** Zachte reflecties van een neutrale studio-omgeving (laag gedoseerd). */
function Omgeving({ binnen, glans }: { binnen: boolean; glans?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = glans ?? (binnen ? 0.2 : 0.28);
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, binnen, glans]);
  return null;
}

/** Mist die meeschuift met de camera: dichtbij helder, ver weg (achter het poppetje) loopt het weg in de achtergrond. */
function Mist({ mist, dicht = false }: { mist: [string, number, number]; dicht?: boolean }) {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const fog = useMemo(() => new THREE.Fog(mist[0], 30, 90), [mist]);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);
  const nu = useRef([mist[1], mist[2]]);
  const basis = useMemo(() => new THREE.Color(mist[0]), [mist]);
  const zwart = useMemo(() => new THREE.Color('#040814'), []);
  const donker = useRef(0);
  useFrame((_, dt) => {
    const d = camera.position.distanceTo(speler.pos);
    // Donkere wereld door je eigen ogen: de mist komt dichterbij (wat verder is, doemt pas later op).
    const s = useSpel.getState();
    const fp = dicht && s.cameraStand === 'eerste' && s.modus === 'lopen' && s.kaart !== 'start' && s.kaart !== 'werelden';
    const [n, f] = fp ? [4, mist[2] * 1.15] : [mist[1], mist[2]];
    const k = Math.min(1, dt * 3);
    nu.current[0] += (n - nu.current[0]) * k;
    nu.current[1] += (f - nu.current[1]) * k;
    fog.near = d + nu.current[0];
    fog.far = d + nu.current[1];
    // in het donker loopt alles in de verte weg in het zwart
    donker.current += ((fp ? 1 : 0) - donker.current) * k;
    fog.color.copy(basis).lerp(zwart, donker.current * 0.85);
  });
  return null;
}

/** Zon die met het poppetje meeschuift: scherpe schaduwen dichtbij, zonder flikkeren (texel-snap). */
function Licht({ binnen, sfeer }: { binnen: boolean; sfeer?: Sfeer }) {
  const zon = useRef<THREE.DirectionalLight>(null);
  const lantaarn = useRef<THREE.PointLight>(null);
  const doel = useMemo(() => new THREE.Object3D(), []);
  const richting = sfeer?.zonRichting;
  const { ZON, zonRot, zonInv } = useMemo(() => {
    const ZON = new THREE.Vector3(...(richting ?? [28, 42, 22]));
    const zonRot = new THREE.Matrix4().lookAt(ZON, new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
    return { ZON, zonRot, zonInv: zonRot.clone().invert() };
  }, [richting]);
  const hemel = sfeer?.hemel ?? (binnen ? ['#ffe8c6', '#3a2a1f', 0.62] : ['#fff6e6', '#6f8466', 0.7]);
  const zonKleur = sfeer?.zon ?? (binnen ? ['#ffd9a8', 1.75] : ['#ffefd6', 2.15]);
  const lamp = sfeer?.lantaarn ?? (binnen ? 16 : 0);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const omgevingsLicht = useRef<THREE.AmbientLight>(null);
  const licht = useRef(1);
  const zaklamp = sfeer?.zaklamp;
  const spot = useRef<THREE.SpotLight>(null);
  const spotDoel = useMemo(() => new THREE.Object3D(), []);
  // terugkaatsend licht: waar de bundel een muur of vloer raakt, kaatst een beetje licht de kamer in
  const kaats = useRef<THREE.PointLight>(null);
  const bundel = useRef<THREE.Mesh>(null);
  const flakker = useRef(0);
  const uitval = useRef(0);
  const nacht = useRef(0);
  const inspectie = useRef(0);
  const scene = useThree((s) => s.scene);
  const glans = sfeer?.glans ?? (binnen ? 0.2 : 0.28);
  const cookie = useMemo(() => (zaklamp ? zaklampCookie() : null), [zaklamp]);
  // de schaduw van de zaklamp: alleen muren, bomen, samengevoegd decor en het poppetje (scheelt veel tekenwerk)
  useEffect(() => {
    spot.current?.shadow.camera.layers.set(SCHADUW_LAAG);
  }, [zaklamp]);
  // kegel met de punt bij de lamp en de brede kant vooruit (+z, voor lookAt)
  const bundelGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(Math.tan(zaklamp?.hoek ?? 0.5) * 7, 7, 24, 1, true);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 3.5);
    return g;
  }, [zaklamp?.hoek]);
  const schaduwStap = useRef({ n: 0, x: 1e9, z: 0, stand: '' });
  useFrame(({ clock }, dt) => {
    const l = zon.current;
    if (!l) return;
    // Trucje: de zonneschaduw wordt alleen opnieuw berekend als jij beweegt, en anders af en toe
    // (genoeg voor deuren en rondlopende figuren). Op een tragere stand nog zuiniger: minder vaak, en alleen
    // de grote dingen (muren, bomen, samengevoegd decor) werpen dan een zonneschaduw. Dat scheelt veel tekenwerk.
    {
      const st = schaduwStap.current;
      l.shadow.autoUpdate = false;
      st.n++;
      const stand = beeldNu.stand;
      const [stap, elke] = stand === 'hoog' ? [0.02, 3] : stand === 'midden' ? [0.08, 4] : [0.25, 8];
      if (stand !== st.stand) {
        st.stand = stand;
        if (stand === 'laag') l.shadow.camera.layers.set(SCHADUW_LAAG);
        else l.shadow.camera.layers.set(0);
        st.n = 0;
      }
      if (Math.abs(speler.pos.x - st.x) + Math.abs(speler.pos.z - st.z) > stap || st.n % elke === 0) {
        l.shadow.needsUpdate = true;
        st.x = speler.pos.x;
        st.z = speler.pos.z;
      }
    }
    // Donkere kamer (griezelgang)? Dan dimt het licht: alleen fakkels en je eigen lantaarn, die flakkert.
    const plan = huidig().plan;
    const s = useSpel.getState();
    const kamer = plan && s.modus === 'lopen' && !s.kaart ? kamerOp(plan, speler.pos.x, speler.pos.z, speler.verdieping) : undefined;
    // Met een zaklamp is een donkere gang echt donker: dan zie je bijna alleen wat je zelf beschijnt.
    const doelLicht = kamer?.donker ? (zaklamp ? 0.04 : 0.22) : 1;
    // af en toe een krakende plank of gefluister in het donker
    if (kamer?.donker && Math.random() < dt / 9) geluid(Math.random() < 0.6 ? 'kraak' : 'fluister');
    licht.current += (doelLicht - licht.current) * Math.min(1, dt * 1.6);
    const f = licht.current;
    // Zaklampwereld door je eigen ogen: bijna alles donker, alleen een vleugje maanlicht, de fakkels en je lamp.
    // Open je een opdracht, dan gaat het licht juist goed aan (alles leesbaar).
    const titel = s.kaart === 'start' || s.kaart === 'werelden';
    const fpDonker = !!zaklamp && s.cameraStand === 'eerste' && s.modus === 'lopen' && !titel;
    nacht.current += ((fpDonker ? 1 : 0) - nacht.current) * Math.min(1, dt * 2);
    inspectie.current += ((zaklamp && s.modus !== 'lopen' ? 1 : 0) - inspectie.current) * Math.min(1, dt * 3);
    const n = nacht.current;
    const g = inspectie.current;
    l.intensity = THREE.MathUtils.lerp(zonKleur[1] * f * (1 - 0.78 * n), 1.5, g);
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(hemel[2] * (zaklamp ? f : 0.35 + 0.65 * f) * (1 - 0.85 * n), 0.75, g);
    if (omgevingsLicht.current) omgevingsLicht.current.intensity = THREE.MathUtils.lerp((binnen ? 0.05 : 0.08) * f * (1 - 0.9 * n), 0.12, g);
    if (zaklamp) scene.environmentIntensity = THREE.MathUtils.lerp(glans * (0.3 + 0.7 * f) * (1 - 0.85 * n), glans, g);
    // zaklamp: schijnt waar het poppetje heen kijkt; in het donker hapert hij soms even
    if (spot.current && zaklamp) {
      const fp = s.cameraStand === 'eerste' && s.modus === 'lopen';
      if (fp) {
        // eerste persoon: de lamp zit in je rechterhand en schijnt waar je kijkt
        spot.current.position.copy(zaklampStaat.lens);
        spotDoel.position.copy(zaklampStaat.lens).addScaledVector(zaklampStaat.richting, 8);
      } else {
        const r = speler.richting;
        const fx = Math.sin(r);
        const fz = Math.cos(r);
        spot.current.position.set(speler.pos.x + fx * 0.35, speler.pos.y + 1.25, speler.pos.z + fz * 0.35);
        spotDoel.position.set(speler.pos.x + fx * 7.5, speler.pos.y + 0.1, speler.pos.z + fz * 7.5);
      }
      spotDoel.updateMatrixWorld();
      // In het donker hapert de lamp soms even, en heel soms valt hij een paar tellen helemaal uit.
      if (kamer?.donker && flakker.current <= 0 && uitval.current <= 0) {
        if (Math.random() < dt / 30) {
          uitval.current = 1.6 + Math.random() * 1.4;
          geluid('fluister');
        } else if (Math.random() < dt / 6) flakker.current = 0.12 + Math.random() * 0.35;
      }
      flakker.current -= dt;
      uitval.current -= dt;
      const t = clock.getElapsedTime();
      const hapert =
        zaklampStaat.uit || t < zaklampStaat.uitvalTot || (flakker.current > 0 && Math.sin(t * 70) > -0.2) || (uitval.current > 0 && !(uitval.current < 0.35 && Math.sin(t * 50) > 0));
      const aan = titel ? 0 : s.modus === 'lopen' ? 1 : 0.2;
      zaklampStaat.aan = hapert ? 0 : aan;
      spot.current.intensity = (zaklamp.sterkte ?? 90) * aan * (hapert ? 0.03 : 1);
      // Waar raakt de bundel iets? Stap langs de straal tot een muur (botsingskaart) of de vloer of het plafond.
      if (kaats.current) {
        const lens = zaklampStaat.lens;
        const r = zaklampStaat.richting;
        const plan = huidig().plan;
        const HV = plan ? (plan.verdiepingHoogte ?? (plan.muurHoogte ?? 3.2) + 0.3) : 3.5;
        const vloer = speler.verdieping * HV + (speler.verdieping === 0 ? Math.min(0, speler.pos.y) : 0);
        let d = 12;
        if (r.y < -0.02) d = Math.min(d, (lens.y - vloer) / -r.y);
        if (r.y > 0.02 && plan) d = Math.min(d, (vloer + (plan.muurHoogte ?? 3.2) - lens.y) / r.y);
        // in stukjes van 0,4 m (elk stukje los gecontroleerd: dat blijft licht)
        for (let t = 0.4; t < d; t += 0.4) {
          if (!lijnVrij(lens.x + r.x * (t - 0.4), lens.z + r.z * (t - 0.4), lens.x + r.x * t, lens.z + r.z * t, 0.05, true, speler.verdieping)) {
            d = t;
            break;
          }
        }
        const raak = d < 11.9;
        // vlak voor een muur: je ogen passen zich aan (anders wordt de lichtvlek fel overbelicht)
        spot.current.intensity *= THREE.MathUtils.lerp(0.4, 1, THREE.MathUtils.smoothstep(d, 0.4, 1.8));
        kaats.current.position.set(lens.x + r.x * (d - 0.45), lens.y + r.y * (d - 0.45), lens.z + r.z * (d - 0.45));
        const doelK =
          raak && s.cameraStand === 'eerste' && !hapert ? (zaklamp.sterkte ?? 90) * aan * 0.022 * Math.min(1, 3 / Math.max(1, d)) * THREE.MathUtils.smoothstep(d, 0.5, 1.6) : 0;
        kaats.current.intensity += (doelK - kaats.current.intensity) * Math.min(1, dt * 12);
      }
      if (bundel.current) {
        bundel.current.visible = aan > 0.5 && !hapert && s.cameraStand === 'derde';
        bundel.current.position.copy(spot.current.position);
        bundel.current.lookAt(spotDoel.position);
      }
    }
    if (lantaarn.current) {
      const t = clock.getElapsedTime();
      const flakker = f < 0.9 ? 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 3.7) : 1;
      lantaarn.current.intensity = lamp * (1 + (1 - f) * 0.5) * flakker;
    }
    if (OVERZICHT) midden.set(0, 0, 0);
    else midden.set(speler.pos.x, 0, speler.pos.z);
    midden.applyMatrix4(zonInv);
    midden.x = Math.round(midden.x / TEXEL) * TEXEL;
    midden.y = Math.round(midden.y / TEXEL) * TEXEL;
    midden.applyMatrix4(zonRot);
    l.position.copy(midden).add(ZON);
    if (lantaarn.current) {
      // Door je eigen ogen hangt de lamp boven en áchter je, zachter en verder reikend: wat vlak voor je staat
      // (een paal, een muur) wordt dan niet overbelicht. Op het titelscherm de gewone lantaarn bij het poppetje.
      const fp = s.cameraStand === 'eerste' && !titel;
      if (fp) {
        lantaarn.current.position.set(speler.pos.x + Math.sin(cam.yaw) * 1.6, speler.pos.y + 2.5, speler.pos.z + Math.cos(cam.yaw) * 1.6);
        lantaarn.current.intensity = lamp * 0.55;
        lantaarn.current.decay = 1.1;
        lantaarn.current.distance = 14;
      } else {
        lantaarn.current.position.set(speler.pos.x, speler.pos.y + 2.6, speler.pos.z + 0.4);
        lantaarn.current.intensity = lamp;
        lantaarn.current.decay = 1.6;
        lantaarn.current.distance = 10;
      }
    }
    doel.position.copy(midden);
    doel.updateMatrixWorld();
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={hemel} />
      <ambientLight ref={omgevingsLicht} intensity={binnen ? 0.05 : 0.08} />
      {lamp > 0 && <pointLight ref={lantaarn} color="#ffbf7a" intensity={lamp} distance={10} decay={1.6} />}
      {zaklamp && (
        <>
          <primitive object={spotDoel} />
          <spotLight
            ref={spot}
            target={spotDoel}
            color={zaklamp.kleur ?? '#fff1d6'}
            angle={zaklamp.hoek ?? BUNDEL_HOEK}
            penumbra={0.3}
            distance={zaklamp.bereik ?? 22}
            decay={1.5}
            map={cookie}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.3}
            shadow-camera-far={zaklamp.bereik ?? 22}
            shadow-bias={-0.0004}
          />
          <pointLight ref={kaats} color="#ffdcb6" intensity={0} distance={7} decay={1.6} />
          {/* zachte lichtbundel in de lucht */}
          <mesh ref={bundel} renderOrder={5} geometry={bundelGeo}>
            <meshBasicMaterial color={zaklamp.kleur ?? '#fff1d6'} transparent opacity={0.045} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} fog={false} />
          </mesh>
        </>
      )}
      <primitive object={doel} />
      <directionalLight
        ref={zon}
        target={doel}
        position={ZON.toArray()}
        intensity={zonKleur[1]}
        color={zonKleur[0]}
        castShadow={sfeer?.schaduw !== false}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-SCHADUW}
        shadow-camera-right={SCHADUW}
        shadow-camera-top={SCHADUW}
        shadow-camera-bottom={-SCHADUW}
        shadow-camera-near={1}
        shadow-camera-far={150}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={2.5}
      />
    </>
  );
}

/** Door je eigen ogen: een vizier als de muis vastzit, en anders een korte uitleg hoe je rondkijkt. */
function Vizier() {
  const fp = useSpel((s) => s.cameraStand === 'eerste' && s.modus === 'lopen' && !s.kaart);
  const [vast, setVast] = useState(muisVast.aan);
  const [geleerd, setGeleerd] = useState(false);
  // net vastgezet: even duidelijk zeggen hoe je weer bij de knoppen komt
  const [melding, setMelding] = useState(false);
  useEffect(() => {
    let t = 0;
    const w = () => {
      setVast(muisVast.aan);
      if (muisVast.aan) setGeleerd(true);
      setMelding(muisVast.aan);
      clearTimeout(t);
      if (muisVast.aan) t = window.setTimeout(() => setMelding(false), 5000);
    };
    window.addEventListener('muisvast', w);
    return () => {
      clearTimeout(t);
      window.removeEventListener('muisvast', w);
    };
  }, []);
  if (!fp) return null;
  return (
    <>
      {vast && <div className="vizier" aria-hidden />}
      {vast && (
        <div className={`vast-melding${melding ? '' : ' weg'}`} role="status">
          <span>
            De muis zit vast: je kijkt rond door te bewegen. Druk op <kbd>Esc</kbd> om op de knoppen te klikken.
          </span>
          <span className="vast-toetsen">
            <kbd>K</kbd> klusboek <kbd>M</kbd> wereldkaart <kbd>H</kbd> hulp
          </span>
        </div>
      )}
      <div className={`kijk-uitleg${vast || geleerd ? ' klein' : ''}`} aria-live="polite">
        {vast ? 'Klik = kies wat in het midden staat · Esc = muis los voor de knoppen' : 'Sleep met de muis om rond te kijken · WASD = lopen · Q/E = draaien'}
      </div>
    </>
  );
}

/** Zaklampwereld door je eigen ogen: donkere rand rond het beeld en een beetje filmkorrel (zoals in horrorgames). */
function DonkerRand() {
  const aan = useSpel((s) => s.cameraStand === 'eerste' && s.modus === 'lopen' && s.kaart !== 'start' && s.kaart !== 'werelden');
  return <div className={`donker-rand${aan ? ' aan' : ''}`} aria-hidden />;
}

const DONKER = 'radial-gradient(120% 95% at 50% 32%, #5b4331 0%, #2f2219 52%, #140e0a 100%)';

/** Telt een paar getekende beelden: dan staat de wereld er echt en mag het laadscherm weg. */
function EersteBeelden({ klaar }: { klaar: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 4) klaar();
  });
  return null;
}

/** Laadscherm tussen de beginpagina en de wereld (verbergt het opbouwen van de wereld). */
function Laden({ klaar }: { klaar: boolean }) {
  const def = huidig();
  const [weg, setWeg] = useState(false);
  useEffect(() => {
    if (!klaar) return;
    const t = setTimeout(() => setWeg(true), 800);
    return () => clearTimeout(t);
  }, [klaar]);
  if (weg) return null;
  return (
    <div className={`laden${klaar ? ' weg' : ''}`} role="status" aria-live="polite">
      <div className="laden-midden">
        <Merk />
        <span className="laden-wereld">
          Wereld {def.nr} · {def.naam}
        </span>
        <span className="laden-streep" aria-hidden>
          <i />
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const begin = useSpel((s) => s.begin);
  return begin ? <Beginpagina /> : <Spel />;
}

function Spel() {
  const wereld = useSpel((s) => s.wereld);
  const [klaar, setKlaar] = useState(false);
  useMaatjeCss();
  const def = huidig();
  const binnen = !!def.plan;
  useEffect(() => {
    document.title = `${def.naam} · Escaπ`;
  }, [def.naam]);
  return (
    <div className="app" style={{ background: def.sfeer?.achtergrond ?? def.lucht ?? (binnen ? DONKER : undefined) }}>
      <Canvas
        shadows="percentage"
        dpr={[1, 1.75]}
        camera={{ fov: 42, near: 0.1, far: 400, position: [0, 12, 44] }}
        // geen randverzachting en geen tonemapping hier: dat doet de beeldketen (beeld.ts) erna
        gl={{ antialias: false, alpha: false, stencil: false, toneMapping: THREE.NoToneMapping, toneMappingExposure: 0.96, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          if (import.meta.env.DEV) Object.assign(window, { __gl: gl, __scene: scene, __maatje: useMaatje });
        }}
      >
        <Lucht css={def.sfeer?.achtergrond ?? def.lucht ?? (binnen ? DONKER : `linear-gradient(180deg, ${P.lucht} 0%, ${P.lucht} 100%)`)} />
        <Omgeving binnen={binnen} glans={def.sfeer?.glans} />
        {!binnen && <fog attach="fog" args={[P.lucht, 110, 260]} />}
        {def.sfeer?.mist && <Mist key={`mist-${wereld}`} mist={def.sfeer.mist} dicht={!!def.sfeer.zaklamp} />}
        <Licht key={`licht-${wereld}`} binnen={binnen} sfeer={def.sfeer} />
        <Invoer />
        <WereldScene key={wereld} />
        <Speler />
        <Regie />
        <CameraKoppeling />
        {/* na Speler en Regie: het maatje hangt voor de camera die net is bijgewerkt */}
        <Maatje3D key={`maatje-${wereld}`} />
        {def.sfeer?.zaklamp && <ZaklampInHand key={`hand-${wereld}`} />}
        <MaatjeFotos />
        <EersteBeelden klaar={() => setKlaar(true)} />
      </Canvas>
      {def.sfeer?.zaklamp && <DonkerRand />}
      <Vizier />
      <MaatLaag />
      <Hud />
      <Hint />
      <InspectieBediening />
      <Kaarten />
      <Feest />
      <Laden klaar={klaar} />
    </div>
  );
}
