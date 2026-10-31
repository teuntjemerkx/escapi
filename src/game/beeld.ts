// De beeldketen (nabewerking), zoals in moderne games:
//   1. de wereld tekenen
//   2. contactschaduw (ambient occlusion, N8AO): donker in hoeken, onder meubels, waar dingen elkaar raken
//   3. wat erbovenop komt: de sluier en het inspectie-object, je hand met de zaklamp en het maatje (zonder contactschaduw)
//   4. gloed (bloom) rond lampen, ramen, vuur en je zaklamp; kleurcorrectie; filmische tonemapping; vignet
//   5. randverzachting (SMAA)
//
// Het trucje om het licht te houden: drie standen (hoog, midden, laag) die vanzelf gekozen worden,
// en daarbinnen past de resolutie zich aan aan hoe snel het apparaat is (zie `bijsturen`).
import { N8AOPostPass } from 'n8ao';
import {
  BlendFunction,
  BloomEffect,
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  NoiseEffect,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';
import * as THREE from 'three';

export type Kwaliteit = 'hoog' | 'midden' | 'laag';

/**
 * Sfeer-effecten die een wereld per beeld mag zetten (Wereld 2: angst). Korrel = filmkorrel (0..1),
 * aberratie = kleurranden aan de randen (0..1), vignet = extra donkere rand (0..1). Standaard alles uit.
 */
export const sfeerFx = { korrel: 0, aberratie: 0, vignet: 0 };

/** Hoogste pixeldichtheid per stand (de resolutie gaat vanzelf omlaag als het te zwaar is). */
export const MAX_DPR: Record<Kwaliteit, number> = { hoog: 2, midden: 1.5, laag: 1 };
export const MIN_DPR = 0.7;

export class Beeld {
  composer: EffectComposer;
  wereld: RenderPass;
  ao: N8AOPostPass;
  sluier: RenderPass;
  stage: RenderPass;
  hand: RenderPass;
  maatje: RenderPass;
  bloom: BloomEffect;
  effecten: EffectPass;
  smaa: SMAAEffect;
  randen: EffectPass;
  korrel: NoiseEffect;
  tonen: ToneMappingEffect;
  verzadiging: HueSaturationEffect;
  contrast: BrightnessContrastEffect;
  aberratie: ChromaticAberrationEffect;
  vignet: VignetteEffect;
  kwaliteit: Kwaliteit = 'midden';

  constructor(
    gl: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    sluierScene: THREE.Scene,
    stageScene: THREE.Scene,
    handScene: THREE.Scene,
    maatjeScene: THREE.Scene,
  ) {
    // Buffers met kommagetallen (voor gloed en zachte overgangen). Kan een (oud) apparaat daar niet in tekenen,
    // dan gewone buffers: iets minder mooi, maar nooit een zwart scherm.
    const ctx = gl.getContext();
    const halfFloat = !!(ctx.getExtension('EXT_color_buffer_half_float') || ctx.getExtension('EXT_color_buffer_float'));
    this.composer = new EffectComposer(gl, { frameBufferType: halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType, multisampling: 0 });
    this.wereld = new RenderPass(scene, camera);
    this.composer.addPass(this.wereld);

    const maat = gl.getDrawingBufferSize(new THREE.Vector2());
    this.ao = new N8AOPostPass(scene, camera, maat.x, maat.y);
    const c = this.ao.configuration;
    // straal in schermpixels: werkt even goed van ver (poppenhuis) als van dichtbij (eerste persoon)
    c.screenSpaceRadius = true;
    c.aoRadius = 48;
    c.distanceFalloff = 0.3;
    c.intensity = 5;
    c.color = new THREE.Color(0x0b0806);
    c.gammaCorrection = false;
    // doorzichtige dingen (glas, gloed, de lichtbundel) twee keer tekenen kost te veel; ze schrijven geen diepte
    c.transparencyAware = false;
    this.composer.addPass(this.ao);

    // erbovenop: alleen de diepte wissen, de kleur blijft staan
    const bovenop = (sc: THREE.Scene, kleurWissen = false) => {
      const p = new RenderPass(sc, camera);
      p.clearPass.color = kleurWissen;
      p.clearPass.depth = true;
      p.skipShadowMapUpdate = true;
      p.ignoreBackground = true;
      p.enabled = false;
      return p;
    };
    this.sluier = bovenop(sluierScene);
    this.stage = bovenop(stageScene);
    // het inspectie-object heeft een eigen lamp met schaduw: die moet wel bijgewerkt worden
    this.stage.skipShadowMapUpdate = false;
    this.hand = bovenop(handScene);
    // het maatje komt helemaal bovenop (het hangt vlak voor de camera en mag nooit achter een muur verdwijnen)
    this.maatje = bovenop(maatjeScene);
    this.maatje.enabled = true;
    this.composer.addPass(this.sluier);
    this.composer.addPass(this.stage);
    this.composer.addPass(this.hand);
    this.composer.addPass(this.maatje);

    this.bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1.0, luminanceSmoothing: 0.3, intensity: 0.7, radius: 0.75, levels: 6 });
    // AgX: filmische kleurweergave (zachte hooglichten, natuurlijke lucht); iets meer contrast en kleur zodat het niet flets wordt
    const contrast = new BrightnessContrastEffect({ brightness: 0, contrast: 0.12 });
    const verzadiging = new HueSaturationEffect({ hue: 0, saturation: 0.18 });
    const tonen = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
    this.tonen = tonen;
    this.verzadiging = verzadiging;
    this.contrast = contrast;
    const vignet = new VignetteEffect({ offset: 0.32, darkness: 0.42 });
    this.vignet = vignet;
    // filmkorrel en kleurranden: staan uit, tenzij een wereld ze via sfeerFx aanzet (angst in het spookslot)
    this.korrel = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
    this.korrel.blendMode.opacity.value = 0;
    this.aberratie = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0, 0), radialModulation: true, modulationOffset: 0.25 });
    this.effecten = new EffectPass(camera, this.bloom, tonen, contrast, verzadiging, this.aberratie, vignet, this.korrel);
    this.composer.addPass(this.effecten);

    this.smaa = new SMAAEffect({ preset: SMAAPreset.MEDIUM });
    this.randen = new EffectPass(camera, this.smaa);
    this.composer.addPass(this.randen);
    this.stelIn('midden');
  }

  /** Kies een stand. Hoog: contactschaduw op volle resolutie. Midden: op halve resolutie. Laag: zonder. */
  stelIn(k: Kwaliteit) {
    this.kwaliteit = k;
    const c = this.ao.configuration;
    this.ao.enabled = k !== 'laag';
    if (k === 'hoog') {
      this.ao.setQualityMode('Medium');
      c.halfRes = false;
    } else if (k === 'midden') {
      this.ao.setQualityMode('Low');
      c.halfRes = true;
    }
    this.smaa.applyPreset(k === 'hoog' ? SMAAPreset.HIGH : k === 'midden' ? SMAAPreset.MEDIUM : SMAAPreset.LOW);
  }

  setSize(w: number, h: number) {
    this.composer.setSize(w, h);
  }

  render(dt: number, laag: { sluier: boolean; stage: boolean; hand: boolean; wereldTonen: boolean }) {
    this.korrel.blendMode.opacity.value = sfeerFx.korrel * 0.55;
    const a = sfeerFx.aberratie * 0.006;
    this.aberratie.offset.set(a, a * 0.6);
    this.vignet.darkness = 0.42 + sfeerFx.vignet * 0.5;
    this.sluier.enabled = laag.sluier;
    this.stage.enabled = laag.stage;
    this.hand.enabled = laag.hand;
    // staat de inspectie helemaal over de wereld heen? dan is contactschaduw op de wereld niet nodig
    this.ao.enabled = this.kwaliteit !== 'laag' && laag.wereldTonen;
    this.composer.render(dt);
  }

  dispose() {
    this.composer.dispose();
  }
}
