"use client";

import { useCallback, type PointerEvent } from "react";

interface MagnetOptions {
  /** How far the element leans toward the hand, as a fraction of the pointer's offset from its centre. */
  pull?: number;
  /** The lean never exceeds this many pixels, so a wide element does not wander. */
  max?: number;
}

/**
 * Leans an element a few pixels toward a mouse inside it and lets it settle
 * back when the mouse leaves. The listeners are the element's own and write
 * the `translate` property straight to the node, so a hover costs no renders;
 * the element's own transition on `translate` is what eases it there and
 * back. Touch, pen and a disabled magnet get a still element.
 */
export function useMagnet(enabled: boolean, { pull = 0.22, max = 7 }: MagnetOptions = {}) {
  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || e.pointerType !== "mouse") return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-max, Math.min(max, v));
      const x = clamp((e.clientX - (r.left + r.width / 2)) * pull);
      const y = clamp((e.clientY - (r.top + r.height / 2)) * pull);
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    },
    [enabled, pull, max]
  );
  const onPointerLeave = useCallback((e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.translate = "";
  }, []);
  return enabled ? { onPointerMove, onPointerLeave } : {};
}
