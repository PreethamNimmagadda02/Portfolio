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
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
