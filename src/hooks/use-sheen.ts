"use client";

import { useCallback, useRef, type PointerEvent } from "react";

/**
 * Raking light for a `.sheen` plate (see globals.css).
 *
 * Returns the two handlers a framed plate needs so its gold highlight catches
 * wherever the cursor is, the way a light source catches a physical object.
 * The pointer position is written to --mx and --my directly on the node: React
 * state here would re-render the whole section at pointer frequency for a
 * decorative highlight.
 *
 * The element's box is measured once on enter rather than on every move, so a
 * sweep across the plate costs no layout reads at all.
 */
export function useSheen() {
  const box = useRef<DOMRect | null>(null);

  const onPointerEnter = useCallback((event: PointerEvent<HTMLElement>) => {
    box.current = event.currentTarget.getBoundingClientRect();
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const rect = box.current ?? event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty("--mx", `${x.toFixed(2)}%`);
    event.currentTarget.style.setProperty("--my", `${y.toFixed(2)}%`);
  }, []);

  return { onPointerEnter, onPointerMove };
}
