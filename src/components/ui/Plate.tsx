"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/* One frame grammar for the instrument surfaces: a hairline box with a short
   gold segment riding each corner, the way a trim mark sits on a printed
   plate. Ornament only, so the ticks never enter the accessibility tree.

   The image plates (PortraitPlate, ScreenshotPlate) look through PlateGlass,
   with its double bezel, instead; the ticks are for the framed data surfaces,
   where an inner bezel would crowd the contents. */

const TICK = "pointer-events-none absolute bg-hairline-gold";

/**
 * Corner trim marks, positioned against the nearest positioned ancestor.
 *
 * `edges` has to match the rules the surface actually draws. A tick with no
 * rule beneath it reads as a stray gold dash, so a surface with only a top
 * border asks for "top".
 */
export function PlateTicks({
  length = "1.5rem",
  edges = "all",
}: {
  length?: string;
  edges?: "all" | "top";
}) {
  const width = { width: length };
  return (
    <span aria-hidden>
      <span className={cn(TICK, "-top-px left-0 h-px")} style={width} />
      <span className={cn(TICK, "-top-px right-0 h-px")} style={width} />
      {edges === "all" ? (
        <>
          <span className={cn(TICK, "-bottom-px left-0 h-px")} style={width} />
          <span className={cn(TICK, "-bottom-px right-0 h-px")} style={width} />
        </>
      ) : null}
    </span>
  );
}

/* The window: how far the print drifts behind the bezels, and how much
   oversize it carries so that drift never shows an edge. A 1.06 print
   overhangs each edge by 3% of the frame, which is exactly the drift. */
const DRIFT = "3%";
const OVERSIZE = 1.06;

/* Bottom scrim, so a bright print never runs straight into the gold light or
   the panel tint beneath the plate. */
const SCRIM = "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--color-obsidian-0) 55%, transparent))";

/**
 * The glass of an image plate, filling its positioned, clipping parent: the
 * print (`children`), the scrim, an optional `overlay`, and the double bezel,
 * outer frame at the edge and inner frame inset 12px.
 *
 * On a desktop the plate is a window: as the page passes, the print drifts
 * the other way behind the bezels, so it reads as set back from the glass.
 */
export function PlateGlass({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  const bezelRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: bezelRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${DRIFT}`, DRIFT]);

  return (
    <>
      <motion.div className="absolute inset-0" style={!reduced && !isMobile ? { y, scale: OVERSIZE } : undefined}>
        {children}
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: SCRIM }} />
      {overlay}
      <span ref={bezelRef} aria-hidden className="pointer-events-none absolute inset-0 border border-hairline" />
      <span aria-hidden className="pointer-events-none absolute inset-3 border border-hairline" />
    </>
  );
}
