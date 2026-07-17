"use client";

import { motion, useSpring, useTransform } from "@/lib/motion";
import { scrollVelocity } from "@/lib/scroll-velocity";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/lib/viewport-store";
import { spring as springTokens } from "@/lib/motion";

/**
 * Restrained signature beat: maps scroll velocity to a tiny skewY + scaleY on
 * the whole section stack, giving scrolling a subtle tactile "weight" that reads
 * as smoothness. Disabled on touch/small screens and under reduced motion.
 */
export default function VelocityScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Smooth the raw velocity so the effect eases in/out instead of snapping.
  const smooth = useSpring(scrollVelocity, springTokens.soft);

  // Cap hard: Lenis velocity is roughly px/frame. Clamp the mapped output.
  const skew = useTransform(smooth, [-40, 0, 40], [1.5, 0, -1.5], { clamp: true });
  const scaleY = useTransform(smooth, [-40, 0, 40], [1.015, 1, 1.015], { clamp: true });

  if (reduce || !isDesktop) return <>{children}</>;

  return (
    <motion.div style={{ skewY: skew, scaleY, transformOrigin: "center top", willChange: "transform" }}>
      {children}
    </motion.div>
  );
}
