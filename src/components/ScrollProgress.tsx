"use client";

import { motion, useScroll, useSpring, useTransform } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Length of the lit head, in pixels. */
const HEAD = 48;

/**
 * A 1px aurum hairline across the very top of the viewport, drawn from the
 * left in proportion to scroll progress. Scroll-driven, so it reads as state
 * rather than animation; the spring only smooths the hand-off between frames
 * and is bypassed under reduced motion.
 *
 * Its leading end is lit, a short run brightening to aurum-100 the way ink
 * is wettest at the nib, so the line reads as being drawn rather than filled.
 * The head is its own node riding the same value (a child of the scaled line
 * would be squeezed by its scaleX), and it is not drawn under reduced motion.
 */
export default function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const headX = useTransform(smoothed, (v) => `calc(${(v * 100).toFixed(3)}vw - ${HEAD}px)`);
  // Nothing to light at the very top of the page.
  const headOpacity = useTransform(smoothed, [0, 0.01], [0, 1]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 right-0 z-9998 h-px origin-left bg-aurum-300"
        style={{ scaleX: reduced ? scrollYProgress : smoothed }}
      />
      {reduced ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-9998 h-px"
          style={{
            x: headX,
            opacity: headOpacity,
            width: HEAD,
            background: "linear-gradient(90deg, transparent, var(--color-aurum-100))",
            boxShadow: "0 0 6px color-mix(in srgb, var(--color-aurum-200) 55%, transparent)",
          }}
        />
      )}
    </>
  );
}
