// Hooks voor modellen: laat de wereld reageren op een goed antwoord (of op een tip).
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import type * as THREE from 'three';
import { useSpel } from './store';

/** Zijn al deze opdrachten goed? */
export const useOpgelost = (...ids: string[]) => useSpel((s) => ids.every((id) => !!s.voortgang[id]?.goed));
/** Hoogste tip die bij deze opdracht gebruikt is (0–4). */
export const useTip = (id: string) => useSpel((s) => s.voortgang[id]?.tip ?? 0);

/**
 * Laat iets zacht groeien/krimpen (schaal) als `aan` verandert. Met `vertraging` (s) per onderdeel
 * kun je een rij na elkaar laten opkomen (water dat stijgt, lampjes die aangaan).
 */
export function useGroei(aan: boolean, vertraging = 0, as: 'y' | 'alle' = 'y') {
  const ref = useRef<THREE.Group>(null);
  const waarde = useRef(aan ? 1 : 0);
  const sinds = useRef(0);
  const vorig = useRef(aan);
  // Beginstand meteen zetten (vóór het samenvoegen van vaste modellen).
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    const v = Math.max(0.0001, waarde.current);
    if (as === 'y') g.scale.y = v;
    else g.scale.setScalar(v);
    g.visible = waarde.current > 0.01;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    if (vorig.current !== aan) {
      vorig.current = aan;
      sinds.current = 0;
    }
    sinds.current += dt;
    if (sinds.current < vertraging) return;
    waarde.current += ((aan ? 1 : 0) - waarde.current) * Math.min(1, dt * 5);
    const g = ref.current;
    if (!g) return;
    const v = Math.max(0.0001, waarde.current);
    if (as === 'y') g.scale.y = v;
    else g.scale.setScalar(v);
    g.visible = waarde.current > 0.01;
  });
  return ref;
}
