import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic pseudo-random generator (mulberry32).
 *
 * Use instead of Math.random() for anything rendered into the DOM
 * (particle positions, star fields, etc.): the same seed produces the same
 * sequence during prerender and client hydration, eliminating hydration
 * mismatches while still looking random.
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Scene warm-up coordination.
   Each 3D section reports when its WebGL scene has been created (Canvas
   onCreated). The PageLoader holds until every scene has reported or its
   max timeout elapses, so the loader covers exactly as much time as the
   warm-up actually needs, no more. */

export const TOTAL_WARMED_SCENES = 1; // the single persistent CosmicScene background

type WarmedWindow = Window & { __warmedScenes?: Set<string> };

export function markSceneWarmed(name: string) {
  if (typeof window === "undefined") return;
  const w = window as WarmedWindow;
  if (!w.__warmedScenes) w.__warmedScenes = new Set();
  w.__warmedScenes.add(name);
  window.dispatchEvent(new Event("scene-warmed"));
}

export function warmedSceneCount(): number {
  if (typeof window === "undefined") return 0;
  return (window as WarmedWindow).__warmedScenes?.size ?? 0;
}

type LenisLike = {
  scrollTo: (
    target: HTMLElement | number,
    options?: Record<string, unknown>
  ) => void;
};

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Room left for the 64px letterhead above a section's first line. */
const NAV_CLEARANCE = -80;

/** Landing tolerance, and the cap on correction passes. */
const DRIFT_TOLERANCE = 6;
const MAX_PASSES = 4;

/**
 * Lenis-aware smooth scroll: the single source of truth for in-page
 * navigation. Accepts a section id (with or without "#") or a pixel offset.
 * Falls back to native smooth scrolling when Lenis isn't available.
 *
 * A section's document position is resolved once, when the flight starts, but
 * sections below the fold arrive lazily and the reserved heights they scroll
 * past are estimates, so the target can slide down while the flight is in the
 * air. Each pass therefore re-measures and corrects until the section sits
 * where it was asked to, or until the page runs out of scroll.
 */
export function smoothScrollTo(target: string | number, offset = NAV_CLEARANCE) {
  if (typeof window === "undefined") return;
  const lenis = (window as unknown as { lenis?: LenisLike }).lenis;

  if (typeof target === "number") {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2, easing: easeOutExpo });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
    return;
  }

  const el = document.getElementById(target.replace(/^#/, ""));
  if (!el) return;

  if (!lenis) {
    el.scrollIntoView({ behavior: "smooth" });
    return;
  }

  let pass = 0;
  const fly = (duration: number) => {
    const startedAt = window.scrollY;
    lenis.scrollTo(el, {
      offset,
      duration,
      easing: easeOutExpo,
      onComplete: () => {
        pass += 1;
        // Where the section's first line actually ended up, against where the
        // clearance asked for it.
        const drift = el.getBoundingClientRect().top + offset;
        // A pass that moved nothing means the page is clamped at either end
        // and no further correction can land.
        const moved = Math.abs(window.scrollY - startedAt) > 1;
        if (Math.abs(drift) > DRIFT_TOLERANCE && pass < MAX_PASSES && moved) fly(0.45);
      },
    });
  };

  fly(1.2);
}
