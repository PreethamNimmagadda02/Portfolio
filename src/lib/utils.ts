import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type Lenis from "lenis";
import { cubicBezier, EASE_GLIDE } from "@/lib/motion";

declare global {
  interface Window {
    /** The page's Lenis, set by SmoothScroll while it runs (never under reduced motion). */
    lenis?: Lenis;
    /** Set once the background scene has warmed up; see markSceneWarmed. */
    __sceneWarmed?: boolean;
    /** Set by the PageLoader as its exit begins, for a hero that mounts after the event. */
    __loaderDone?: boolean;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rounds to a thousandth. For SVG geometry computed with Math.cos and Math.sin
 * during render: the server's engine and a visitor's browser can disagree in
 * the last digit, which React reports as a hydration mismatch. A thousandth
 * of a unit is far below a device pixel.
 */
export function round3(v: number) {
  return Math.round(v * 1000) / 1000;
}

/** A count or position as a two-digit numeral: 3 reads "03". */
export function pad2(n: number) {
  return String(n).padStart(2, "0");
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
   The background scene reports once its WebGL context has been created
   (Canvas onCreated, or at once under reduced motion, where no canvas is
   made). The PageLoader holds until it has, or until its max timeout
   elapses, so the loader covers exactly as much time as the warm-up needs.
   The flag lives on window so a dev fast-refresh remount still sees it. */

export function markSceneWarmed() {
  if (typeof window === "undefined") return;
  window.__sceneWarmed = true;
  window.dispatchEvent(new Event("scene-warmed"));
}

export function isSceneWarmed(): boolean {
  return typeof window !== "undefined" && Boolean(window.__sceneWarmed);
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const glide = cubicBezier(...EASE_GLIDE);

/** The letterhead band: the 64px bar, then a deliberate 48px gap so a
 *  section's eyebrow is not tucked against it. Flights land a section's first
 *  line below it, and a keyboard page step keeps it out of the step. */
export const LETTERHEAD_BAND = 64 + 48;

/** Landing tolerance, and the caps on correction passes for a flight and a jump. */
const DRIFT_TOLERANCE = 6;
const MAX_PASSES = 4;
const MAX_JUMP_PASSES = 6;

/** Flight times, in seconds. A correction is short and lands on the settle curve. */
const MIN_FLIGHT = 0.9;
const MAX_FLIGHT = 2.3;
const CORRECTION = 0.45;

/**
 * How long a flight of `distance` pixels takes. Logarithmic, so one screen
 * still reads as a deliberate move (1.2s for 900px) while the length of the
 * page never keeps the reader waiting (1.6s for 3,000px, and the 2.3s
 * ceiling from about 16,000px, which is the whole document).
 */
function flightDuration(distance: number) {
  return Math.min(MAX_FLIGHT, MIN_FLIGHT + 0.33 * Math.log2(1 + Math.abs(distance) / 900));
}

/* Every section carries 112 to 176px of its own top padding. Aligning the
   padding box under the letterhead therefore lands on dead air and pushes the
   foot of the section off screen, which is how Activity used to arrive with
   its heatmap below the fold. Spend the padding so the first line is what the
   clearance applies to, and re-measure it per pass: the value is breakpoint
   dependent, and a lazy section can reflow while the page is moving. */
function landingFor(el: HTMLElement) {
  return (parseFloat(getComputedStyle(el).paddingTop) || 0) - LETTERHEAD_BAND;
}

/**
 * Lenis-aware smooth scroll: the single source of truth for in-page
 * navigation. Accepts a section id (with or without "#") or a pixel offset.
 *
 * The flight's length follows its distance and it travels on the glide
 * curve, so a long one leaves gently and lands slowly instead of throwing the
 * middle of the page past the reader in its first frames.
 *
 * A section's document position is resolved once, when the flight starts, but
 * sections below the fold arrive lazily and the reserved heights they scroll
 * past are estimates, so the target can slide down while the flight is in the
 * air. Each pass therefore re-measures and corrects until the section sits
 * where it was asked to, or until the page runs out of scroll.
 *
 * Without Lenis (reduced motion, where SmoothScroll never starts it, or a
 * click before it has mounted) the page arrives instead of flying.
 */
export function smoothScrollTo(target: string | number) {
  if (typeof window === "undefined") return;
  const lenis = window.lenis;

  if (!lenis) {
    void jumpTo(target);
    return;
  }

  if (typeof target === "number") {
    // A flight to the foot of the page follows the foot if it moves: sections
    // rendered on the way down can lengthen the document after it was taken.
    const toFoot = target >= lenis.limit;
    let pass = 0;
    const fly = (first: boolean) => {
      lenis.scrollTo(toFoot ? lenis.limit : target, {
        duration: first ? flightDuration(target - window.scrollY) : CORRECTION,
        easing: first ? glide : easeOutExpo,
        onComplete: () => {
          if (!toFoot || ++pass >= MAX_PASSES) return;
          lenis.resize();
          if (lenis.limit - window.scrollY > DRIFT_TOLERANCE) fly(false);
        },
      });
    };
    fly(true);
    return;
  }

  const el = document.getElementById(target.replace(/^#/, ""));
  if (!el) return;

  let pass = 0;
  const fly = (first: boolean) => {
    const startedAt = window.scrollY;
    const landing = landingFor(el);
    lenis.scrollTo(el, {
      offset: landing,
      duration: first ? flightDuration(el.getBoundingClientRect().top + landing) : CORRECTION,
      easing: first ? glide : easeOutExpo,
      onComplete: () => {
        pass += 1;
        // Where the section's first line actually ended up, against where the
        // clearance asked for it.
        const drift = el.getBoundingClientRect().top + landing;
        // A pass that moved nothing means the page is clamped at either end
        // and no further correction can land.
        const moved = Math.abs(window.scrollY - startedAt) > 1;
        if (Math.abs(drift) > DRIFT_TOLERANCE && pass < MAX_PASSES && moved) fly(false);
      },
    });
  };

  fly(true);
}

let jumpGeneration = 0;

/**
 * Arrives at a section (or a pixel offset) at once, then corrects until it
 * holds, and resolves when it does. This is the move for the moments the
 * reader should not watch the page travel: a chapter chosen from the Index
 * lands behind the panel, and the panel lifts off the page already in place.
 *
 * It runs while Lenis is stopped (the Index locks the page), since a jump
 * made behind a closed curtain is the point of it. A newer jump retires an
 * older one, so two quick choices never fight over the page.
 */
export function jumpTo(target: string | number): Promise<void> {
  const generation = ++jumpGeneration;
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const lenis = window.lenis;
    const place = (top: number) => {
      if (lenis) {
        // Lenis clamps to the scroll limit it last measured, which can trail
        // a section that has only just mounted; measure afresh so a jump to
        // the foot of the page is not cut short.
        lenis.resize();
        lenis.scrollTo(top, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      }
    };

    if (typeof target === "number") {
      place(target);
      return resolve();
    }

    const el = document.getElementById(target.replace(/^#/, ""));
    if (!el) return resolve();

    let pass = 0;
    const settle = () => {
      if (generation !== jumpGeneration) return resolve();
      const drift = el.getBoundingClientRect().top + landingFor(el);
      if (Math.abs(drift) <= DRIFT_TOLERANCE || pass >= MAX_JUMP_PASSES) return resolve();
      const before = window.scrollY;
      place(before + drift);
      pass += 1;
      // A jump that moved nothing means the page is clamped at either end.
      if (Math.abs(window.scrollY - before) < 1) return resolve();
      // Two frames: one for whatever the jump brought into view to commit, one
      // for the layout it causes to settle.
      requestAnimationFrame(() => requestAnimationFrame(settle));
    };
    settle();
  });
}
