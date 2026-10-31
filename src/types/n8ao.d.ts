// Typen voor N8AO (contactschaduw / ambient occlusion); het pakket levert ze zelf niet mee.
declare module 'n8ao' {
  import type { Pass } from 'postprocessing';
  import type * as THREE from 'three';
  export type N8AOKwaliteit = 'Performance' | 'Low' | 'Medium' | 'High' | 'Ultra' | 'Neural-Low' | 'Neural-Medium' | 'Neural-High';
  export class N8AOPostPass extends Pass {
    constructor(scene: THREE.Scene, camera: THREE.Camera, width?: number, height?: number);
    configuration: {
      aoRadius: number;
      distanceFalloff: number;
      intensity: number;
      color: THREE.Color;
      gammaCorrection: boolean;
      transparencyAware: boolean;
      halfRes: boolean;
      depthAwareUpsampling: boolean;
      aoSamples: number;
      denoiseSamples: number;
      denoiseRadius: number;
      screenSpaceRadius: boolean;
      accumulate: boolean;
      [k: string]: unknown;
    };
    setQualityMode(mode: N8AOKwaliteit): void;
  }
}
