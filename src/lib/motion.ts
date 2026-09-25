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
} from "framer-motion";

export type { Variants, MotionValue } from "framer-motion";

/* Motion tokens for the Obsidian Aurum system. The CSS twins live in
   globals.css as --ease-heavy and --ease-settle; keep both in sync. */

/** Masks, rules, panels: symmetric and weighty. */
export const EASE_HEAVY = [0.7, 0, 0.2, 1] as const;

/** Fades and rises: fast out of the gate, long settle. */
export const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;
