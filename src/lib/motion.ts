/**
 * App-wide motion entry point.
 *
 * Re-exports framer-motion's lightweight `m` component aliased as `motion`, so
 * every call site keeps writing `motion.div` while the heavyweight `motion`
 * component (which eagerly bundles every animation feature) is never pulled
 * into the graph. Features are instead provided once, lazily, by the
 * `<LazyMotion features={domMax}>` wrapper at the app root (see layout.tsx).
 * `domMax` is required because the app uses shared-layout animations
 * (`layoutId` in Navbar and GitHubStats).
 *
 * Import from `@/lib/motion` instead of `framer-motion` everywhere in the app.
 * The hooks below are unaffected by LazyMotion and are re-exported unchanged
 * for a single, consistent import source.
 */
export {
  m as motion,
  AnimatePresence,
  useIsPresent,
  MotionConfig,
  LazyMotion,
  domMax,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  animate,
  frame,
  cancelFrame,
  cubicBezier,
} from "framer-motion";

export type { Variants, MotionValue } from "framer-motion";

/* Motion tokens for the Obsidian Aurum system. The CSS twins live in
   globals.css as --ease-heavy and --ease-settle; keep both in sync. */

/** Masks, rules, panels: symmetric and weighty. */
export const EASE_HEAVY = [0.7, 0, 0.2, 1] as const;

/** Fades and rises: fast out of the gate, long settle. */
export const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll flights: the page leaves gently and lands slowly. EASE_SETTLE covers
 * half its distance in the first tenth of the time, which across a long
 * flight throws thousands of pixels past the reader in a single frame; this
 * curve has covered 2% at that point, peaks mid flight and spends its last
 * fifth easing the final 2% into place.
 */
export const EASE_GLIDE = [0.45, 0, 0.15, 1] as const;
