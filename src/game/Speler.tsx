// Het bestuurbare poppetje + de volgcamera (derde persoon of eerste persoon).
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { hoogteOp, huidigeLaag, losOp, zetLaag, zoekPad } from './botsing';
import { draaiUitToetsen, kijk, richtingUitToetsen } from './invoer';
import { mat, opSchaduwLaag } from './kit';
import { beweegLijf, leegGewricht, Lijf, type MensKleuren } from './mens';
import { cam, FOV_EERSTE, OOG_H, speler, useSpel } from './store';
import { grenzen, trapOp, trapOpen, trapPunt, verdiepingHoogte } from './huis';
import { huidig } from '../werelden';

const STRAAL = 0.4;

/**
 * Loop via een route (om muren heen) naar een plek. `klaar` bepaalt wanneer je er bent.
 * `doelVerdieping`: staat het doel op een andere verdieping, dan loopt de route via de trappen.
 */
export function loopNaar(x: number, z: number, bijDoel: (() => void) | null, klaar?: (x: number, z: number) => boolean, doelVerdieping?: number) {
  const trappen = huidig().plan?.trappen ?? [];
  const laag = huidigeLaag();
  const punten: [number, number][] = [];
  const via: number[] = [];
  let [vx, vz] = [speler.pos.x, speler.pos.z];
  let v: number;
  if (typeof laag === 'string') {
    // je staat op een trap: eerst eraf, aan de kant van het doel
    const i = Number(laag.slice(4));
    const tr = trappen[i];
    const omhoog = (doelVerdieping ?? tr.van + 1) > tr.van;
    const uit = trapOp(tr, omhoog ? TRAP_UIT : -TRAP_VOOR);
    punten.push(uit);
    via.push(i);
    [vx, vz] = uit;
    v = omhoog ? tr.van + 1 : tr.van;
  } else v = laag;
  const doelV = doelVerdieping ?? v;
  for (let n = 0; v !== doelV && n < 8; n++) {
    const omhoog = doelV > v;
    const i = trappen.findIndex((t) => (omhoog ? t.van === v : t.van === v - 1) && trapOpen(t));
    if (i < 0) break;
    const tr = trappen[i];
    // naar de voet (of de kop) van de trap, dan in één rechte lijn erover
    const voor = trapOp(tr, omhoog ? -TRAP_VOOR : TRAP_UIT);
    const na = trapOp(tr, omhoog ? TRAP_UIT : -TRAP_VOOR);
    const stuk = zoekPad(vx, vz, voor[0], voor[1], undefined, v);
    if (!stuk) break;
    punten.push(...stuk, voor, na);
    via.push(i);
    [vx, vz] = na;
    v = omhoog ? v + 1 : v - 1;
  }
  speler.viaTrappen = via;
  const laatste = zoekPad(vx, vz, x, z, klaar, v);
  const pad = laatste ? [...punten, ...laatste] : null;
  if (!pad) {
    speler.doel = null;
    speler.pad = [];
    return false;
  }
  speler.pad = pad.map(([a, b]) => new THREE.Vector3(a, 0, b));
  if (!speler.pad.length) {
    speler.doel = null;
    bijDoel?.();
    return true;
  }
  speler.doel = speler.pad[speler.pad.length - 1].clone();
  speler.bijDoel = bijDoel;
  return true;
}
const SNELHEID = 6;
const SNELHEID_EERSTE = 4.6;
/** Waar je voor de trap staat (t onder 0) en waar je er bovenaan af bent (t boven 1), als deel van de traplengte. */
const TRAP_VOOR = 0.1;
const TRAP_UIT = 1.07;

/**
 * Verdiepingen en trappen: wissel van laag als je een trap op- of afstapt, en geef de hoogte van je voeten.
 * Zonder trappen: gewoon de hoogte van kavels en stoepen.
 */
function hoogteNu(x: number, z: number, vx = 0, vz = 0) {
  const plan = huidig().plan;
  const trappen = plan?.trappen;
  if (!plan || !trappen?.length) return hoogteOp(x, z);
  const HV = verdiepingHoogte(plan);
  const laag = huidigeLaag();
  if (typeof laag === 'string') {
    const tr = trappen[Number(laag.slice(4))];
    const { t, lat } = trapPunt(tr, x, z);
    // eraf: onderaan of bovenaan als je die kant op loopt (of er al een stukje vanaf bent), of opzij
    const langs = (tr.as === 'x' ? vx : vz) * tr.richting;
    const opzij = lat > tr.breed / 2 + 0.3;
    if ((t < -0.02 && langs < 0) || t < -0.22 || (opzij && t < 0.5)) {
      zetLaag(tr.van);
      speler.verdieping = tr.van;
      return tr.van * HV;
    }
    if ((t > 1.02 && langs > 0) || t > 1.22 || opzij) {
      zetLaag(tr.van + 1);
      speler.verdieping = tr.van + 1;
      return (tr.van + 1) * HV;
    }
    speler.verdieping = tr.van + (t > 0.5 ? 1 : 0);
    return (tr.van + Math.max(0, Math.min(1, t))) * HV;
  }
  // Op een trap stappen: je staat er vlak voor (of bovenaan) en je wilt erover.
  // Met een looproute alleen de trappen van die route; zelf lopen: als je de trap op (of af) loopt.
  for (let i = 0; i < trappen.length; i++) {
    const tr = trappen[i];
    if (!trapOpen(tr)) continue;
    const { t, lat } = trapPunt(tr, x, z);
    if (lat > tr.breed / 2 - 0.1) continue;
    const onder = tr.van === laag && t >= -0.2 && t <= 0.02;
    const boven = tr.van + 1 === laag && t >= 0.98 && t <= 1.2;
    if (!onder && !boven) continue;
    const langs = (tr.as === 'x' ? vx : vz) * tr.richting;
    const wil = speler.doel ? speler.viaTrappen.includes(i) : onder ? langs > 0.6 : langs < -0.6;
    if (!wil) continue;
    zetLaag(`trap${i}`);
    return (tr.van + Math.max(0, Math.min(1, t))) * HV;
  }
  return laag * HV + (laag === 0 ? hoogteOp(x, z) : 0);
}
const tmp = new THREE.Vector3();
const kijkNaar = new THREE.Vector3();
/** ?overzicht in de url: vaste isometrische camera over het hele eiland (voor screenshots/docent). */
const zoek = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const OVERZICHT = zoek.has('overzicht');
/** ?overzicht=x,y,z,doelX,doelZ voor een andere camerastand. */
const OVERZICHT_POS = (zoek.get('overzicht') || '52,48,52,0,0').split(',').map(Number);

const lens = new THREE.MeshBasicMaterial({ color: '#fff3c8', toneMapped: false });

const JIJ: MensKleuren = { shirt: '#e2843f', broek: '#34465f', huid: '#f0c6a0', haar: '#3c2a20', schoen: '#f4f1ea', kapsel: 'kort' };

export function Poppetje({ lopen }: { lopen: React.RefObject<number> }) {
  const zaklamp = !!huidig().sfeer?.zaklamp;
  const g = useRef(leegGewricht());
  const fase = useRef(0);
  const tijd = useRef(0);
  useFrame((_, dt) => {
    const v = lopen.current ?? 0;
    fase.current += dt * 8.5 * Math.min(1, v);
    tijd.current += dt;
    beweegLijf(g.current, fase.current, v, tijd.current, Math.min(dt, 0.05));
  });
  return (
    <group>
      <Lijf
        c={JIJ}
        g={g}
        rugzak
        hoodie
        inHand={
          zaklamp && (
            <group rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0.06]}>
              <mesh material={mat('#26292e', { metal: 0.5, rough: 0.4 })}>
                <cylinderGeometry args={[0.035, 0.028, 0.2, 12]} />
              </mesh>
              <mesh position={[0, 0.105, 0]} material={lens}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 14]} />
              </mesh>
            </group>
          )
        }
      />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Speler() {
  const groep = useRef<THREE.Group>(null);
  const lopen = useRef(0);
  const { camera, size } = useThree();
  const modus = useSpel((s) => s.modus);
  const stand = useSpel((s) => s.cameraStand);
  const rondje = useRef(0.6);
  const stap = useRef(0);
  const draai = useRef(0);
  const glij = useRef(new THREE.Vector2());
  const tempo = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const g = groep.current;
    if (!g) return;
    // Rondkijken: de beweging van muis of vinger wordt zacht verwerkt (snel, maar zonder schokken).
    {
      const k = 1 - Math.exp(-dt * 26);
      const ddx = kijk.dx * k;
      const ddy = kijk.dy * k;
      kijk.dx -= ddx;
      kijk.dy -= ddy;
      if (modus === 'lopen') {
        cam.yaw -= ddx;
        if (stand === 'eerste') cam.fpPitch = Math.max(-1.15, Math.min(1.15, cam.fpPitch - ddy));
        else cam.pitch = Math.max(0.25, Math.min(1.25, cam.pitch + ddy * 0.87));
        // draaien met de toetsen (pijltje links/rechts, Q/E): eerst zacht op gang, dan 2 rad per seconde
        draai.current += (draaiUitToetsen() - draai.current) * Math.min(1, dt * 9);
        cam.yaw -= draai.current * 2.0 * dt;
      } else {
        kijk.dx = 0;
        kijk.dy = 0;
      }
    }
    let vx = 0;
    let vz = 0;
    let metToetsen = false;
    if (modus === 'lopen' && !useSpel.getState().kaart) {
      const [ix, iz] = richtingUitToetsen();
      if (ix || iz) {
        metToetsen = true;
        speler.doel = null;
        speler.pad = [];
        speler.bijDoel = null;
        // Beweging relatief aan de camera: "vooruit" = weg van de camera.
        const sin = Math.sin(cam.yaw);
        const cos = Math.cos(cam.yaw);
        const fx = -sin;
        const fz = -cos;
        const rx = cos;
        const rz = -sin;
        vx = fx * -iz + rx * ix;
        vz = fz * -iz + rz * ix;
        const l = Math.hypot(vx, vz) || 1;
        vx /= l;
        vz /= l;
      } else if (speler.doel) {
        while (speler.pad.length > 1 && Math.hypot(speler.pad[0].x - speler.pos.x, speler.pad[0].z - speler.pos.z) < 0.35) speler.pad.shift();
        const doel = speler.pad[0] ?? speler.doel;
        const dx = doel.x - speler.pos.x;
        const dz = doel.z - speler.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.25 && speler.pad.length <= 1) {
          speler.doel = null;
          speler.pad = [];
          const cb = speler.bijDoel;
          speler.bijDoel = null;
          cb?.();
        } else {
          vx = dx / d;
          vz = dz / d;
        }
      }
    }
    // Met de toetsen kom je zacht op gang en rem je zacht af (geen schokkerig starten en stoppen).
    const v = stand === 'eerste' ? SNELHEID_EERSTE : SNELHEID;
    if (metToetsen || (!speler.doel && glij.current.lengthSq() > 0.0004)) {
      const doelX = metToetsen ? vx * v : 0;
      const doelZ = metToetsen ? vz * v : 0;
      const a = 1 - Math.exp(-dt * (metToetsen ? 11 : 9));
      glij.current.x += (doelX - glij.current.x) * a;
      glij.current.y += (doelZ - glij.current.y) * a;
      const sn = glij.current.length();
      vx = sn > 1e-4 ? glij.current.x / sn : 0;
      vz = sn > 1e-4 ? glij.current.y / sn : 0;
      tempo.current = sn / v;
    } else {
      glij.current.set(vx * v, vz * v);
      tempo.current = vx || vz ? 1 : 0;
    }
    const doelSnelheid = vx || vz ? Math.min(1, tempo.current) : 0;
    lopen.current += (doelSnelheid - lopen.current) * Math.min(1, dt * 10);
    if (vx || vz) {
      const vorig = speler.pos.clone();
      // door je eigen ogen loop je wat rustiger (minder draaierig, en spannender in het donker)
      const stapV = v * tempo.current;
      const [nx, nz] = losOp(speler.pos.x + vx * stapV * dt, speler.pos.z + vz * stapV * dt, STRAAL);
      speler.pos.set(nx, speler.pos.y, nz);
      // Vastgelopen tijdens klik-lopen? Dan stoppen.
      if (speler.doel && vorig.distanceTo(speler.pos) < SNELHEID * dt * 0.15) {
        speler.doel = null;
        speler.pad = [];
        const cb = speler.bijDoel;
        speler.bijDoel = null;
        cb?.();
      }
      const gewenst = Math.atan2(vx, vz);
      let verschil = gewenst - speler.richting;
      verschil = Math.atan2(Math.sin(verschil), Math.cos(verschil));
      speler.richting += verschil * Math.min(1, dt * 12);
    }
    speler.pos.y += (hoogteNu(speler.pos.x, speler.pos.z, vx, vz) - speler.pos.y) * Math.min(1, dt * 14);
    g.position.copy(speler.pos);
    g.rotation.y = speler.richting;
    // Door je eigen ogen zie je jezelf niet. Ook niet als de camera na een opdracht terugvliegt naar je hoofd:
    // dan verdwijnt het poppetje zodra de camera er dichtbij komt (anders vlieg je door je eigen hoofd).
    const hoofdAfstand = Math.hypot(camera.position.x - speler.pos.x, camera.position.y - (speler.pos.y + OOG_H), camera.position.z - speler.pos.z);
    g.visible = stand !== 'eerste' || (modus !== 'lopen' && modus !== 'terug' && hoofdAfstand > 1.6);

    if (modus !== 'lopen') return; // de inspectiecamera neemt het over
    if (OVERZICHT) {
      camera.position.set(OVERZICHT_POS[0], OVERZICHT_POS[1], OVERZICHT_POS[2]);
      camera.lookAt(OVERZICHT_POS[3], 0, OVERZICHT_POS[4]);
      return;
    }
    // Startkaart open: de camera draait langzaam rond het hele gebouw (filmisch begin).
    const kaart = useSpel.getState().kaart;
    if (kaart === 'start' || kaart === 'werelden') {
      rondje.current += dt * 0.12;
      const def = huidig();
      const g = def.plan ? grenzen(def.plan) : null;
      const [mx, mz] = g ? g.midden : [0, 0];
      const R = g ? Math.max(g.w, g.d) * 1.05 : def.eiland[0] * 0.6;
      const t = rondje.current;
      tmp.set(mx + Math.sin(t) * R, R * 0.85, mz + Math.cos(t) * R);
      camera.position.lerp(tmp, Math.min(1, dt * 1.5));
      // Op een breed scherm staat de kaart links: kijk iets links van het huis, dan staat het rechts in beeld.
      const breed = size.width / size.height > 1.3 && size.width >= 900;
      const off = breed ? R * 0.32 : 0;
      camera.lookAt(mx - Math.cos(t) * off, 0, mz + Math.sin(t) * off);
      return;
    }
    if (stand === 'derde') {
      tmp.set(
        speler.pos.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.afstand,
        speler.pos.y + 1.2 + Math.sin(cam.pitch) * cam.afstand,
        speler.pos.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.afstand,
      );
      camera.position.lerp(tmp, Math.min(1, dt * 6));
      kijkNaar.set(speler.pos.x, speler.pos.y + 1.1, speler.pos.z);
      camera.lookAt(kijkNaar);
    } else {
      // Klik je ergens heen? Dan draait je blik mee met de looprichting.
      if (speler.doel && (vx || vz)) {
        const wil = Math.atan2(-vx, -vz);
        const d = Math.atan2(Math.sin(wil - cam.yaw), Math.cos(wil - cam.yaw));
        cam.yaw += d * Math.min(1, dt * 3.2);
        cam.fpPitch += (-0.06 - cam.fpPitch) * Math.min(1, dt * 1.5);
      }
      // hoofd beweegt een beetje mee als je loopt
      stap.current += dt * 9.5 * lopen.current;
      const op = Math.sin(stap.current) * 0.045 * lopen.current;
      const opzij = Math.cos(stap.current / 2) * 0.025 * lopen.current;
      const yaw = cam.yaw + Math.PI;
      const rx = Math.cos(cam.yaw);
      const rz = -Math.sin(cam.yaw);
      camera.position.set(speler.pos.x + rx * opzij, speler.pos.y + OOG_H + op, speler.pos.z + rz * opzij);
      kijkNaar.set(
        camera.position.x + Math.sin(yaw) * Math.cos(cam.fpPitch),
        camera.position.y + Math.sin(cam.fpPitch),
        camera.position.z + Math.cos(yaw) * Math.cos(cam.fpPitch),
      );
      // net geschrokken: je hoofd schiet even naar achteren en trilt
      if (cam.schok > 0) {
        cam.schok = Math.max(0, cam.schok - dt * 1.7);
        const k = cam.schok * cam.schok;
        camera.position.x -= Math.sin(yaw) * 0.12 * k;
        camera.position.z -= Math.cos(yaw) * 0.12 * k;
        kijkNaar.x += (Math.random() - 0.5) * 0.05 * k;
        kijkNaar.y += (Math.random() - 0.5) * 0.05 * k + 0.06 * k;
      }
      camera.lookAt(kijkNaar);
      speler.richting = yaw;
    }
    // kijkhoek: breder door je eigen ogen
    const persp = camera as THREE.PerspectiveCamera;
    const fov = stand === 'eerste' ? FOV_EERSTE : 42;
    if (Math.abs(persp.fov - fov) > 0.05) {
      persp.fov += (fov - persp.fov) * Math.min(1, dt * 5);
      persp.updateProjectionMatrix();
    }
  });

  return (
    <group ref={groep} name="speler-lijf">
      <group ref={opSchaduwLaag}>
        <Poppetje lopen={lopen} />
      </group>
    </group>
  );
}
