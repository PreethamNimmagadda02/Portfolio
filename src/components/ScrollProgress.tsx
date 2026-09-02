"use client";

import { motion, useScroll, useSpring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * A 1px aurum hairline across the very top of the viewport, drawn from the
 * left in proportion to scroll progress. Scroll-driven, so it reads as state
 * rather than animation; the spring only smooths the hand-off between frames
 * and is bypassed under reduced motion.
 */
export default function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 right-0 z-9998 h-px origin-left bg-aurum-300"
      style={{ scaleX: reduced ? scrollYProgress : smoothed }}
    />
  );
}
