"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LETTERHEAD_BAND, smoothScrollTo } from "@/lib/utils";

/** Fraction of the remaining distance the page covers each frame at 60fps. Lower is heavier. */
const LERP = 0.07;

/** A keyboard step glides a touch firmer than the wheel, so a held key stays under the hand. */
const KEY_LERP = 0.1;

/** One arrow press, in pixels. Held, the key repeats at about 30Hz, so this also sets the cruising speed. */
const ARROW_STEP = 60;

/* Where a key belongs to the element rather than to the page. */
const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const ACTIVATES_ON_SPACE =
  'button, summary, [role="button"], [role="radio"], [role="tab"], [role="checkbox"], [role="switch"], [role="menuitem"]';

/**
 * The page's scroll, made heavy and smooth with Lenis.
 *
 * Lenis is advanced from Framer Motion's frame loop rather than a loop of its
 * own, in the loop's first step. Framer samples the scroll position in its
 * read step, which comes next, so every scroll-linked MotionValue on the page
 * is computed from the position Lenis has just written and paints in the
 * same frame as the scroll; ticking any later would leave them all a frame
 * behind the page.
 *
 * The keyboard gets the same glide as the wheel. Arrows, Page Up and Down and
 * the space bar feed Lenis exactly as a wheel tick does, so a held key
 * accumulates and the hand can take over mid glide; Home and End fly the way
 * an in-page link does. Keys that belong to something else (a field, a
 * button, the dial and the other widgets that claim their arrows) are left
 * alone.
 *
 * Under reduced motion there is no Lenis at all: the browser's own scroll is
 * the honest one, and in-page links arrive instead of flying.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: LERP,
      // Native momentum on touch is better than anything simulated.
      syncTouch: false,
      autoRaf: false,
      anchors: false,
    });

    // Exposed for programmatic scrolling (smoothScrollTo, jumpTo, the Index lock).
    window.lenis = lenis;

    const tick = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.setup(tick, true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      // Stopped means the Index is open and owns the keyboard.
      if (lenis.isStopped) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(EDITABLE) || target?.closest("[data-lenis-prevent]")) return;

      // A page less the letterhead band, so the line the reader was on stays in view.
      const page = Math.max(window.innerHeight - LETTERHEAD_BAND, window.innerHeight * 0.6);
      let step: number;
      switch (e.key) {
        case "ArrowDown":
          step = ARROW_STEP;
          break;
        case "ArrowUp":
          step = -ARROW_STEP;
          break;
        case "PageDown":
          step = page;
          break;
        case "PageUp":
          step = -page;
          break;
        case " ":
          // Space presses a focused button; it only pages when nothing claims it.
          if (target?.closest(ACTIVATES_ON_SPACE)) return;
          step = e.shiftKey ? -page : page;
          break;
        case "Home":
          e.preventDefault();
          smoothScrollTo(0);
          return;
        case "End":
          e.preventDefault();
          // Measured afresh: the limit Lenis holds can trail a section that
          // has just grown, and a flight to a stale foot lands short.
          lenis.resize();
          smoothScrollTo(lenis.limit);
          return;
        default:
          return;
      }
      e.preventDefault();
      lenis.scrollTo(lenis.targetScroll + step, { programmatic: false, lerp: KEY_LERP });
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      cancelFrame(tick);
      lenis.destroy();
      if (window.lenis === lenis) delete window.lenis;
    };
  }, [reduced]);

  return <>{children}</>;
}
