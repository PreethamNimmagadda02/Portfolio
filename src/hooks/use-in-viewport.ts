"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is currently within the viewport.
 * Used to pause expensive work (e.g. WebGL render loops) when a
 * section scrolls out of view — saving battery and reducing jank.
 *
 * @param rootMargin - expands/shrinks the observer's bounding box.
 *                     A positive margin keeps the element "in view"
 *                     slightly before/after it enters the screen so
 *                     the 3D scene is already warm when revealed.
 */
export function useInViewport<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "200px"
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const inView = useRefInViewport(ref, rootMargin);
  return [ref, inView];
}

/**
 * Same as {@link useInViewport} but observes an element you already hold a
 * ref to. Lets one element drive multiple thresholds — e.g. a tight margin
 * for pausing the render loop and a wide margin for lazily mounting the
 * WebGL canvas itself.
 *
 * With `once: true` the value latches: it flips to true the first time the
 * element approaches the viewport and never goes back. Use this for canvas
 * mounting — the scene initializes exactly once (shader compile, HDR fetch)
 * instead of being torn down and rebuilt on every scroll pass.
 */
/**
 * Flips to true `delayMs` after mount (using idle time when available).
 *
 * Used to pre-warm WebGL canvases in the background: sections mount their
 * scenes either when the user scrolls near them OR when this timer fires —
 * whichever comes first. Staggering the delays initializes one heavy scene
 * at a time behind the hero instead of all at once (or worse, just-in-time
 * while the user is already looking at an empty section).
 */
export function useWarmupTimer(delayMs: number): boolean {
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    const timer = setTimeout(() => {
      // Prefer an idle slot so scene compilation doesn't fight
      // whatever animation is running at that exact moment.
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => setWarm(true), { timeout: 1000 });
      } else {
        setWarm(true);
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [delayMs]);

  return warm;
}

export function useRefInViewport<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  rootMargin = "200px",
  once = false
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback for environments without IntersectionObserver
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        } else {
          setInView(entry.isIntersecting);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, once]);

  return inView;
}
