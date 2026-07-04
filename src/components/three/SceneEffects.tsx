"use client";

import { Suspense } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Shared cinematic post-processing stack for section canvases.
 *
 * Bloom uses a high luminance threshold so only emissive materials with
 * `toneMapped={false}` and `emissiveIntensity > 1` glow — giving selective,
 * premium neon highlights without washing out the whole scene.
 *
 * Note: `enableNormalPass={false}` prevents a null `.alpha` access that
 * occurs when Bloom initialises before its internal WebGLRenderTarget is
 * ready inside a canvas with `alpha: true`.
 */
export default function SceneEffects({
  bloomIntensity = 0.9,
  vignetteDarkness = 0.55,
}: {
  bloomIntensity?: number;
  vignetteDarkness?: number;
}) {
  const isMobile = useIsMobile();

  // Skip heavy post-processing entirely on mobile GPUs
  if (isMobile) return null;

  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={1}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.25} darkness={vignetteDarkness} />
      </EffectComposer>
    </Suspense>
  );
}
