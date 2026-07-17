/**
 * App-wide motion entry point.
 *
 * Re-exports framer-motion's lightweight `m` component aliased as `motion`, so
 * every call site keeps writing `motion.div` while the heavyweight `motion`
 * component — which eagerly bundles every animation feature — is never pulled
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
  frame,
  cancelFrame,
} from "framer-motion";

export type { Variants } from "framer-motion";

import type { Variants } from "framer-motion";

/**
 * Motion design tokens — the single source of truth for the app's motion
 * language. Import these instead of hand-writing easing arrays, durations, or
 * spring configs so every component animates with one consistent feel.
 */

/** Named easing curves (cubic-bezier control points). */
export const ease = {
  /** Expo-out — default for entrances and reveals. */
  out: [0.22, 1, 0.36, 1],
  /** Symmetric in-out — loops and toggles. */
  inOut: [0.65, 0, 0.35, 1],
  /** Material-style — quick micro-interactions (hover/press). */
  smooth: [0.4, 0, 0.2, 1],
} as const;

/** Durations in seconds, aligned with framer-motion transition units. */
export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  slower: 0.9,
} as const;

/** Spring presets. `scroll` matches the app's existing scroll-progress spring. */
export const spring = {
  soft: { stiffness: 120, damping: 20 },
  snappy: { stiffness: 300, damping: 30 },
  hover: { stiffness: 400, damping: 25 },
  scroll: { stiffness: 100, damping: 30, restDelta: 0.001 },
} as const;

/** Reusable reveal variants for ScrollReveal and grouped section content. */
export const reveal = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.out },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
  },
  staggerContainer: {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.out },
    },
  },
} satisfies Record<string, Variants>;
