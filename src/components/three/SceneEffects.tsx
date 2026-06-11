"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Shared cinematic post-processing stack for section canvases.
 *
 * Bloom uses a high luminance threshold so only emissive materials with
 * `toneMapped={false}` and `emissiveIntensity > 1` glow — giving selective,
 * premium neon highlights without washing out the whole scene.
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
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={1}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.75}
      />
      <Vignette eskil={false} offset={0.25} darkness={vignetteDarkness} />
    </EffectComposer>
  );
}
